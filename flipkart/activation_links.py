"""Build account-activation URLs for the Next.js app."""

import logging

from django.conf import settings

logger = logging.getLogger(__name__)


def frontend_activation_url(uidb64: str, token: str) -> str:
    base = getattr(
        settings,
        "FRONTEND_BASE_URL",
        "http://127.0.0.1:3000",
    ).rstrip("/")
    if not settings.DEBUG and (
        "127.0.0.1" in base or "localhost" in base.lower()
    ):
        logger.warning(
            "FRONTEND_BASE_URL looks like a dev host while DEBUG is False. "
            "Set DJANGO_FRONTEND_BASE_URL to your public Next.js origin so activation emails do not point at localhost."
        )
    return f"{base}/activate/{uidb64}/{token}/"
