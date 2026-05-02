import json
import os
import re

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import EmailMultiAlternatives
from django.db.models import Q
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from flipkart.activation_links import frontend_activation_url
from flipkart.forms import SignupForm
from flipkart.models import Contact, OrderUpdate, Orders, Product
from flipkart.tokens import account_activation_token
from PayTm import Checksum

from .schemas import (
    ActivateRequestSchema,
    ActivateResponseSchema,
    CatalogSectionSchema,
    ContactRequestSchema,
    ContactResponseSchema,
    OrderCreateRequestSchema,
    OrderCreateResponseSchema,
    OrderTrackRequestSchema,
    OrderTrackResponseSchema,
    RegisterRequestSchema,
    RegisterResponseSchema,
)
from .serializers import ProductSerializer, ProductWriteSerializer

PAYTM_MERCHANT_KEY = os.environ.get("PAYTM_MERCHANT_KEY", "")
PAYTM_MID = os.environ.get("PAYTM_MID", "")
PAYTM_CALLBACK_URL = os.environ.get(
    "PAYTM_CALLBACK_URL", "http://127.0.0.1:8000/handlerequest/"
)
PAYTM_GATEWAY_URL = os.environ.get(
    "PAYTM_GATEWAY_URL",
    "https://securegw-stage.paytm.in/theia/processTransaction",
)


def _normalize_cart_items(raw_items):
    if isinstance(raw_items, str):
        try:
            raw_items = json.loads(raw_items)
        except json.JSONDecodeError:
            return None, "Invalid items JSON."
    if not isinstance(raw_items, dict) or not raw_items:
        return None, "Cart is empty."
    out = {}
    for key, val in raw_items.items():
        if not re.fullmatch(r"pr\d+", key):
            return None, "Invalid cart key."
        if not isinstance(val, list) or len(val) < 3:
            return None, "Invalid line item."
        try:
            qty = int(val[0])
            price = int(val[2])
        except (TypeError, ValueError):
            return None, "Invalid quantity or price."
        if qty < 1 or price < 0:
            return None, "Invalid quantity or price."
        name = str(val[1]) if val[1] is not None else "Item"
        out[key] = [qty, name, price]
    return out, None


def _cart_total(items_dict):
    return sum(int(v[0]) * int(v[2]) for v in items_dict.values())


@extend_schema(
    summary="Catalog grouped by category",
    tags=["Catalog"],
    responses={200: CatalogSectionSchema(many=True)},
)
class CatalogView(APIView):
    """
    Grouped catalog mirroring the legacy Django index (products per category).
    Public read — JWT optional for future personalized rows.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        sections = []
        categories = (
            Product.objects.values_list("category", flat=True)
            .distinct()
            .order_by("category")
        )
        for cat in categories:
            if not cat:
                continue
            qs = Product.objects.filter(category=cat).order_by("id")
            ser = ProductSerializer(qs, many=True, context={"request": request})
            sections.append({"category": cat, "products": ser.data})
        return Response(sections)


@extend_schema_view(
    get=extend_schema(summary="Product detail", tags=["Catalog"]),
)
class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


@extend_schema(
    summary="Create product (staff only)",
    tags=["Catalog"],
    request=ProductWriteSerializer,
    responses={201: ProductSerializer},
    description=(
        "Requires a JWT for a **staff** user (`is_staff=True`). "
        "Send JSON, or `multipart/form-data` to include an `image` file."
    ),
)
class ProductCreateView(generics.CreateAPIView):
    """
    Add a catalog row without opening Django admin.
    Only authenticated staff users may call this endpoint.
    """

    queryset = Product.objects.all()
    serializer_class = ProductWriteSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        out = ProductSerializer(serializer.instance, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)


@extend_schema(
    summary="Search products",
    tags=["Catalog"],
    parameters=[
        OpenApiParameter(
            name="q",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            required=False,
            description="Filter by product name or category (case-insensitive).",
        ),
    ],
    responses={200: ProductSerializer(many=True)},
)
class ProductSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response([])
        qs = Product.objects.filter(
            Q(product_name__icontains=q) | Q(category__icontains=q)
        ).order_by("id")
        ser = ProductSerializer(qs, many=True, context={"request": request})
        return Response(ser.data)


@extend_schema(
    summary="Register (inactive account + activation email)",
    tags=["Auth"],
    request=RegisterRequestSchema,
    responses={
        201: RegisterResponseSchema,
        400: OpenApiTypes.OBJECT,
    },
)
class RegisterView(APIView):
    """
    Create an inactive user and send an activation email with a link to the Next.js app.
    Accepts JSON: username, email, password1, password2 (matches SignupForm / UserCreationForm).
    """

    permission_classes = [AllowAny]

    def post(self, request):
        form = SignupForm(data=request.data)
        if not form.is_valid():
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

        user = form.save(commit=False)
        user.is_active = False
        user.save()

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = account_activation_token.make_token(user)
        activation_url = frontend_activation_url(uid, token)
        ctx = {"user": user, "activation_url": activation_url}
        text_body = render_to_string("flipkart/acc_active_email.txt", ctx)
        html_body = render_to_string("flipkart/acc_active_email.html", ctx)
        to_email = form.cleaned_data.get("email")
        msg = EmailMultiAlternatives(
            "Confirm your ShopHub account",
            text_body,
            settings.DEFAULT_FROM_EMAIL,
            [to_email],
        )
        msg.attach_alternative(html_body, "text/html")
        sent = msg.send()

        using_console = "console" in settings.EMAIL_BACKEND.lower()

        body = {
            "detail": "Registration successful. Check your email to activate your account.",
            "email": to_email,
            "mail_sent": sent == 1,
        }
        if settings.DEBUG and using_console:
            body["dev_activation_url"] = activation_url

        return Response(body, status=status.HTTP_201_CREATED)


@extend_schema(
    summary="Activate account (email link)",
    tags=["Auth"],
    request=ActivateRequestSchema,
    responses={
        200: ActivateResponseSchema,
        400: ActivateResponseSchema,
    },
)
class ActivateAccountView(APIView):
    """Confirm uid/token from the email link; sets the user active (no Django session)."""

    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid") or request.data.get("uidb64")
        token = request.data.get("token")
        if not uidb64 or not token:
            return Response(
                {"detail": "uid and token are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and account_activation_token.check_token(user, token):
            if user.is_active:
                return Response(
                    {
                        "detail": "Account was already active. You can log in.",
                    }
                )
            user.is_active = True
            user.save(update_fields=["is_active"])
            return Response(
                {"detail": "Account activated. You can log in."},
            )

        return Response(
            {"detail": "Invalid or expired activation link."},
            status=status.HTTP_400_BAD_REQUEST,
        )


@extend_schema(
    summary="Create order (checkout)",
    tags=["Orders"],
    request=OrderCreateRequestSchema,
    responses={
        201: OrderCreateResponseSchema,
        200: OrderCreateResponseSchema,
    },
)
class OrderCreateView(APIView):
    """
    Authenticated checkout — requires a valid JWT. Persists the authenticated
    user on the order. Optional idempotency_key: duplicate POSTs return 200 with
    the same order_id (no second Paytm session).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = OrderCreateRequestSchema(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        data = ser.validated_data
        items, err = _normalize_cart_items(data["items"])
        if err:
            return Response({"detail": err}, status=status.HTTP_400_BAD_REQUEST)
        total = _cart_total(items)
        if total != data["amount"]:
            return Response(
                {"detail": "Amount does not match cart total."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        idempotency_key = (data.get("idempotency_key") or "").strip()[:64] or None
        if idempotency_key:
            existing = Orders.objects.filter(
                user=request.user, idempotency_key=idempotency_key
            ).first()
            if existing:
                return Response(
                    {
                        "order_id": existing.order_id,
                        "paytm": None,
                        "idempotent": True,
                    },
                    status=status.HTTP_200_OK,
                )

        address2 = (data.get("address2") or "").strip()
        address = f"{data['address1'].strip()} {address2}".strip()
        order = Orders.objects.create(
            user=request.user,
            idempotency_key=idempotency_key,
            items_json=json.dumps(items),
            amount=total,
            name=data["name"][:90],
            email=str(data["email"])[:111],
            address=address[:111],
            city=data["city"][:111],
            state=data["state"][:111],
            zip_code=data["zip_code"][:111],
            phone=(data.get("phone") or "")[:111],
        )
        paytm = None
        if PAYTM_MERCHANT_KEY and PAYTM_MID:
            param_dict = {
                "MID": PAYTM_MID,
                "ORDER_ID": str(order.order_id),
                "TXN_AMOUNT": str(total),
                "CUST_ID": str(data["email"])[:111],
                "INDUSTRY_TYPE_ID": "Retail",
                "WEBSITE": "WEBSTAGING",
                "CHANNEL_ID": "WEB",
                "CALLBACK_URL": PAYTM_CALLBACK_URL,
            }
            param_dict["CHECKSUMHASH"] = Checksum.generate_checksum(
                param_dict, PAYTM_MERCHANT_KEY
            )
            paytm = {
                "action": PAYTM_GATEWAY_URL,
                "fields": {k: str(v) for k, v in param_dict.items()},
            }
        return Response(
            {"order_id": order.order_id, "paytm": paytm, "idempotent": False},
            status=status.HTTP_201_CREATED,
        )


@extend_schema(
    summary="Track order",
    tags=["Orders"],
    request=OrderTrackRequestSchema,
    responses={
        200: OrderTrackResponseSchema,
        400: OrderTrackResponseSchema,
    },
)
class OrderTrackView(APIView):
    """
    Public order lookup by id + email (same rules as the legacy /tracker/ form).
    JSON body: order_id (or orderId), email.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        raw_id = request.data.get("order_id", request.data.get("orderId"))
        email = (request.data.get("email") or "").strip()
        if raw_id is None or not email:
            return Response(
                {"status": "error", "detail": "order_id and email are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            oid = int(raw_id)
        except (TypeError, ValueError):
            return Response(
                {"status": "error", "detail": "Invalid order id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        orders = Orders.objects.filter(order_id=oid, email=email)
        if not orders.exists():
            return Response({"status": "noitem"})

        order = orders.first()
        updates_qs = OrderUpdate.objects.filter(order_id=oid).order_by("timestamp", "update_id")
        updates = [
            {"text": u.update_desc, "time": str(u.timestamp)} for u in updates_qs
        ]
        return Response(
            {
                "status": "success",
                "updates": updates,
                "itemsJson": order.items_json,
            }
        )


@extend_schema(
    summary="Submit customer support message",
    tags=["Support"],
    request=ContactRequestSchema,
    responses={
        201: ContactResponseSchema,
        400: ContactResponseSchema,
    },
)
class ContactCreateView(APIView):
    """Store a customer support message (same model as /contact/ form)."""

    permission_classes = [AllowAny]

    def post(self, request):
        name = (request.data.get("name") or "").strip()
        email = (request.data.get("email") or "").strip()
        phone = (request.data.get("phone") or "").strip()
        desc = (request.data.get("desc") or "").strip()
        if not name or not email or not desc:
            return Response(
                {"detail": "Name, email, and message are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        Contact.objects.create(
            name=name[:50],
            email=email[:70],
            phone=phone[:70],
            desc=desc[:500],
        )
        return Response(
            {"detail": "Thanks — we typically reply within one business day."},
            status=status.HTTP_201_CREATED,
        )
