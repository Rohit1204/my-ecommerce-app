"""
Request/response shapes for OpenAPI (drf-spectacular).
These document JSON bodies and response envelopes; runtime may add fields (e.g. DEBUG-only).
"""

from rest_framework import serializers

from .serializers import ProductSerializer


class CatalogSectionSchema(serializers.Serializer):
    category = serializers.CharField()
    products = ProductSerializer(many=True)


class RegisterRequestSchema(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password1 = serializers.CharField()
    password2 = serializers.CharField()


class RegisterResponseSchema(serializers.Serializer):
    detail = serializers.CharField()
    email = serializers.EmailField()
    mail_sent = serializers.BooleanField(required=False)
    dev_activation_url = serializers.URLField(
        required=False,
        help_text="Present only when DEBUG and console email backend (points at Next.js /activate/...).",
    )


class ActivateRequestSchema(serializers.Serializer):
    uid = serializers.CharField(help_text="uidb64 from the activation link path.")
    token = serializers.CharField()


class ActivateResponseSchema(serializers.Serializer):
    detail = serializers.CharField()


class OrderTrackRequestSchema(serializers.Serializer):
    order_id = serializers.CharField(help_text="Numeric order id from checkout.")
    email = serializers.EmailField(help_text="Email used on the order.")


class OrderUpdateItemSchema(serializers.Serializer):
    text = serializers.CharField()
    time = serializers.CharField()


class OrderTrackResponseSchema(serializers.Serializer):
    status = serializers.ChoiceField(choices=["success", "noitem", "error"])
    detail = serializers.CharField(required=False)
    updates = OrderUpdateItemSchema(many=True, required=False)
    itemsJson = serializers.CharField(
        required=False,
        help_text="Cart JSON string when status is success.",
    )


class OrderCreateRequestSchema(serializers.Serializer):
    name = serializers.CharField(max_length=90)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=111)
    address1 = serializers.CharField(max_length=200)
    address2 = serializers.CharField(
        max_length=200, required=False, allow_blank=True, default=""
    )
    city = serializers.CharField(max_length=111)
    state = serializers.CharField(max_length=111)
    zip_code = serializers.CharField(max_length=111)
    items = serializers.JSONField(
        help_text='Cart object, e.g. {"pr1": [2, "Product name", 999]}.',
    )
    amount = serializers.IntegerField(min_value=0)
    idempotency_key = serializers.CharField(
        max_length=64,
        required=False,
        allow_blank=True,
        help_text="Optional UUID from client; resend on retry to avoid duplicate orders.",
    )


class PaytmStartSchema(serializers.Serializer):
    action = serializers.URLField()
    fields = serializers.JSONField(help_text="Hidden form fields for Paytm POST.")


class OrderCreateResponseSchema(serializers.Serializer):
    order_id = serializers.IntegerField()
    paytm = PaytmStartSchema(
        required=False,
        allow_null=True,
        help_text="When Paytm is configured, auto-post this form client-side.",
    )
    idempotent = serializers.BooleanField(
        required=False,
        help_text="True when this response replays an existing order (same idempotency_key).",
    )
    detail = serializers.CharField(required=False)


class ContactRequestSchema(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    phone = serializers.CharField(
        max_length=70,
        required=False,
        allow_blank=True,
    )
    desc = serializers.CharField(max_length=500)


class ContactResponseSchema(serializers.Serializer):
    detail = serializers.CharField()


class TokenPairResponseSchema(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    username = serializers.CharField(
        help_text="Included for storefront UX (ShopTokenObtainPairSerializer).",
    )


class TokenRefreshResponseSchema(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField(required=False)
