from django.urls import path

from .auth_views import ShopTokenObtainPairView, ShopTokenRefreshView
from .views import (
    ActivateAccountView,
    CatalogView,
    ContactCreateView,
    OrderCreateView,
    OrderTrackView,
    ProductCreateView,
    ProductDetailView,
    ProductSearchView,
    RegisterView,
)

urlpatterns = [
    path("v1/catalog/", CatalogView.as_view(), name="api-catalog"),
    path("v1/products/search/", ProductSearchView.as_view(), name="api-product-search"),
    path("v1/products/<int:pk>/", ProductDetailView.as_view(), name="api-product-detail"),
    path("v1/products/", ProductCreateView.as_view(), name="api-product-create"),
    path("v1/auth/register/", RegisterView.as_view(), name="api-register"),
    path("v1/auth/activate/", ActivateAccountView.as_view(), name="api-activate"),
    path("v1/auth/token/", ShopTokenObtainPairView.as_view(), name="api-token-obtain"),
    path("v1/auth/token/refresh/", ShopTokenRefreshView.as_view(), name="api-token-refresh"),
    path("v1/orders/track/", OrderTrackView.as_view(), name="api-order-track"),
    path("v1/orders/", OrderCreateView.as_view(), name="api-order-create"),
    path("v1/contact/", ContactCreateView.as_view(), name="api-contact"),
]
