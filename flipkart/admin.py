from django.contrib import admin

from flipkart.models import Contact, OrderUpdate, Orders, Product


@admin.register(Orders)
class OrdersAdmin(admin.ModelAdmin):
    list_display = ("order_id", "user", "amount", "email", "idempotency_key", "city")
    list_filter = ("user",)
    search_fields = ("email", "name", "idempotency_key", "order_id")
    raw_id_fields = ("user",)


admin.site.register(Product)
admin.site.register(Contact)
admin.site.register(OrderUpdate)
