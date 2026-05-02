from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from flipkart.models import Product


class ShopTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Include username in token response for Next.js client UX."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["username"] = self.user.username
        return data


class ProductSerializer(serializers.ModelSerializer):
    """Public product DTO with absolute image URL for cross-origin Next.js clients."""

    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "product_name",
            "category",
            "subcategory",
            "price",
            "desc",
            "pub_date",
            "image",
        )

    def get_image(self, obj: Product) -> str | None:
        if not obj.image or not getattr(obj.image, "name", None):
            return None
        request = self.context.get("request")
        url = obj.image.url
        if request:
            return request.build_absolute_uri(url)
        return url


class ProductWriteSerializer(serializers.ModelSerializer):
    """Create payload; image is optional (use multipart to upload a file)."""

    image = serializers.ImageField(required=False, allow_null=True)
    pub_date = serializers.DateField(required=False)
    category = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")
    subcategory = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")

    class Meta:
        model = Product
        fields = (
            "product_name",
            "category",
            "subcategory",
            "price",
            "desc",
            "pub_date",
            "image",
        )

    def create(self, validated_data):
        validated_data.setdefault("pub_date", timezone.now().date())
        return super().create(validated_data)
