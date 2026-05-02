from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .schemas import TokenPairResponseSchema, TokenRefreshResponseSchema
from .serializers import ShopTokenObtainPairSerializer


@extend_schema_view(
    post=extend_schema(
        summary="Obtain JWT pair",
        tags=["Auth"],
        request=ShopTokenObtainPairSerializer,
        responses={200: TokenPairResponseSchema},
    ),
)
class ShopTokenObtainPairView(TokenObtainPairView):
    serializer_class = ShopTokenObtainPairSerializer


@extend_schema_view(
    post=extend_schema(
        summary="Refresh access token",
        tags=["Auth"],
        responses={200: TokenRefreshResponseSchema},
    ),
)
class ShopTokenRefreshView(TokenRefreshView):
    pass
