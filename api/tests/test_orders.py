import json

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient


class OrderCreateAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="shopper",
            email="shopper@example.com",
            password="test-pass-123",
        )
        self.user.is_active = True
        self.user.save()

    def _access_token(self) -> str:
        from rest_framework_simplejwt.tokens import RefreshToken

        return str(RefreshToken.for_user(self.user).access_token)

    def _valid_body(self, **overrides):
        base = {
            "name": "Test User",
            "email": "shopper@example.com",
            "phone": "9999999999",
            "address1": "1 Main St",
            "address2": "",
            "city": "Mumbai",
            "state": "MH",
            "zip_code": "400001",
            "items": {"pr1": [1, "Widget", 100]},
            "amount": 100,
            "idempotency_key": "550e8400-e29b-41d4-a716-446655440000",
        }
        base.update(overrides)
        return base

    def test_create_order_requires_authentication(self):
        res = self.client.post(
            "/api/v1/orders/",
            self._valid_body(),
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_order_success_sets_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._access_token()}")
        res = self.client.post(
            "/api/v1/orders/",
            self._valid_body(idempotency_key="11111111-1111-1111-1111-111111111111"),
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.json()
        self.assertIn("order_id", data)
        self.assertEqual(data.get("idempotent"), False)
        from flipkart.models import Orders

        order = Orders.objects.get(order_id=data["order_id"])
        self.assertEqual(order.user_id, self.user.id)
        self.assertEqual(order.amount, 100)

    def test_create_order_idempotent_replay(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._access_token()}")
        key = "22222222-2222-2222-2222-222222222222"
        body = self._valid_body(idempotency_key=key)
        r1 = self.client.post("/api/v1/orders/", body, format="json")
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        oid = r1.json()["order_id"]

        r2 = self.client.post("/api/v1/orders/", body, format="json")
        self.assertEqual(r2.status_code, status.HTTP_200_OK)
        self.assertEqual(r2.json()["order_id"], oid)
        self.assertTrue(r2.json().get("idempotent"))
        self.assertIsNone(r2.json().get("paytm"))

        from flipkart.models import Orders

        self.assertEqual(Orders.objects.filter(idempotency_key=key).count(), 1)

    def test_create_order_rejects_amount_mismatch(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._access_token()}")
        res = self.client.post(
            "/api/v1/orders/",
            self._valid_body(amount=999, idempotency_key="33333333-3333-3333-3333-333333333333"),
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class OrderTrackAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        from flipkart.models import Orders

        self.order = Orders.objects.create(
            items_json=json.dumps({"pr1": [1, "X", 10]}),
            amount=10,
            name="A",
            email="track@example.com",
            address="Addr",
            city="C",
            state="S",
            zip_code="1",
            phone="1",
        )

    def test_track_success(self):
        res = self.client.post(
            "/api/v1/orders/track/",
            {"order_id": str(self.order.order_id), "email": "track@example.com"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json().get("status"), "success")
