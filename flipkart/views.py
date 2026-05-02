"""
Django serves JSON/HTML for Paytm callbacks and legacy POST shims only.
All customer-facing pages live on Next.js (FRONTEND_BASE_URL / DJANGO_FRONTEND_BASE_URL).
"""

import html
import json
import os

from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from Ecommerce import settings
from PayTm import Checksum
from urllib.parse import urlencode

from .models import Orders, OrderUpdate

MERCHANT_KEY = os.environ.get("PAYTM_MERCHANT_KEY", "")


def _frontend_base() -> str:
    return getattr(settings, "FRONTEND_BASE_URL", "http://127.0.0.1:3000").rstrip("/")


def _frontend(path: str) -> str:
    path = path if path.startswith("/") else f"/{path}"
    return f"{_frontend_base()}{path}"


def frontend_login_redirect(request):
    """Legacy `/login/` → Next.js JWT login."""
    target = f"{_frontend_base()}/login"
    nxt = request.GET.get("next")
    if nxt:
        target = f"{target}?{urlencode({'next': nxt})}"
    return HttpResponseRedirect(target)


def index(request):
    return HttpResponseRedirect(_frontend("/"))


def about(request):
    return HttpResponseRedirect(_frontend("/about"))


def checkout(request):
    if request.method == "GET":
        return HttpResponseRedirect(_frontend("/checkout"))
    return JsonResponse(
        {
            "detail": (
                "Checkout is on ShopHub. Use POST /api/v1/orders/ "
                f"or open {_frontend('/checkout')}."
            )
        },
        status=410,
    )


def contact(request):
    if request.method == "POST":
        return JsonResponse(
            {
                "detail": (
                    "Use POST /api/v1/contact/ with JSON, or open "
                    f"{_frontend('/support')}."
                )
            },
            status=410,
        )
    return HttpResponseRedirect(_frontend("/support"))


def tracker(request):
    if request.method == "POST":
        order_id = request.POST.get("orderId", "")
        email = request.POST.get("email", "")
        try:
            order = Orders.objects.filter(order_id=order_id, email=email)
            if len(order) > 0:
                update = OrderUpdate.objects.filter(order_id=order_id)
                updates = []
                for item in update:
                    updates.append({"text": item.update_desc, "time": item.timestamp})
                payload = {
                    "status": "success",
                    "updates": updates,
                    "itemsJson": order[0].items_json,
                }
                return HttpResponse(json.dumps(payload, default=str), content_type="application/json")
            return HttpResponse('{"status":"noitem"}', content_type="application/json")
        except Exception:
            return HttpResponse('{"status":"error"}', content_type="application/json")

    return HttpResponseRedirect(_frontend("/tracker"))


def search(request):
    return HttpResponseRedirect(_frontend("/search"))


def search_results(request):
    q = request.GET.get("query", "").strip()
    url = _frontend("/search")
    if q:
        url = f"{url}?{urlencode({'q': q})}"
    return HttpResponseRedirect(url)


def prodView(request, myid):
    return HttpResponseRedirect(_frontend(f"/products/{myid}"))


def signup(request):
    if request.method == "POST":
        return JsonResponse(
            {
                "detail": (
                    "Registration is on ShopHub. Use POST /api/v1/auth/register/ "
                    f"or open {_frontend('/signup')}."
                )
            },
            status=410,
        )
    return HttpResponseRedirect(_frontend("/signup"))


@csrf_exempt
def handlerequest(request):
    """Paytm return URL — minimal HTML (no Django template)."""
    form = request.POST
    response_dict = {}
    checksum = None
    for i in form.keys():
        response_dict[i] = form[i]
        if i == "CHECKSUMHASH":
            checksum = form[i]

    if checksum is not None:
        verify = Checksum.verify_checksum(response_dict, MERCHANT_KEY, checksum)
        if verify:
            if response_dict.get("RESPCODE") == "01":
                status_line = "Payment successful."
            else:
                status_line = "Payment was not successful."
        else:
            status_line = "Could not verify payment checksum."
    else:
        status_line = "No checksum in response."
    resp_msg = html.escape(str(response_dict.get("RESPMSG", "")))
    order_id = html.escape(str(response_dict.get("ORDERID", "")))
    detail_pre = html.escape(json.dumps(response_dict, indent=2, default=str))

    body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Payment status</title>
  <style>
    body {{ font-family: system-ui, sans-serif; margin: 0; background: #f4f6f9; color: #0f172a; }}
    main {{ max-width: 36rem; margin: 2rem auto; padding: 1.5rem; background: #fff; border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06); }}
    a {{ color: #2874f0; font-weight: 600; }}
    pre {{ overflow: auto; font-size: 0.75rem; background: #f8fafc; padding: 1rem; border-radius: 8px; }}
  </style>
</head>
<body>
  <main>
    <h1 style="font-size: 1.125rem;">{html.escape(status_line)}</h1>
    <p style="color: #64748b; font-size: 0.875rem;">Order: {order_id}</p>
    <p style="font-size: 0.875rem;">{resp_msg}</p>
    <p><a href="{html.escape(_frontend('/'))}">Back to ShopHub</a></p>
    <pre>{detail_pre}</pre>
  </main>
</body>
</html>"""
    return HttpResponse(body, content_type="text/html; charset=utf-8")
