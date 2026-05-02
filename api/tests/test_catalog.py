from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient


class CatalogAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_catalog_returns_list(self):
        res = self.client.get("/api/v1/catalog/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsInstance(res.json(), list)
