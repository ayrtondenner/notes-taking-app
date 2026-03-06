import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from accounts.models import User
from notes.models import Category


@pytest.mark.django_db
class TestSignup:
    def setup_method(self):
        self.client = APIClient()
        self.url = reverse("signup")

    def test_signup_success(self):
        response = self.client.post(
            self.url,
            {"email": "new@example.com", "password": "securepass123"},
            format="json",
        )
        assert response.status_code == 201
        assert "token" in response.data
        assert response.data["user"]["email"] == "new@example.com"

    def test_signup_creates_default_categories(self):
        self.client.post(
            self.url,
            {"email": "new@example.com", "password": "securepass123"},
            format="json",
        )
        user = User.objects.get(email="new@example.com")
        categories = Category.objects.filter(user=user).order_by("id")
        assert categories.count() == 3
        assert list(categories.values_list("name", flat=True)) == [
            "Random Thoughts",
            "School",
            "Personal",
        ]

    def test_signup_duplicate_email(self):
        User.objects.create_user(email="existing@example.com", password="pass12345678")
        response = self.client.post(
            self.url,
            {"email": "existing@example.com", "password": "securepass123"},
            format="json",
        )
        assert response.status_code == 400

    def test_signup_short_password(self):
        response = self.client.post(
            self.url,
            {"email": "new@example.com", "password": "short"},
            format="json",
        )
        assert response.status_code == 400

    def test_signup_missing_fields(self):
        response = self.client.post(self.url, {}, format="json")
        assert response.status_code == 400


@pytest.mark.django_db
class TestLogin:
    def setup_method(self):
        self.client = APIClient()
        self.url = reverse("login")
        self.user = User.objects.create_user(
            email="test@example.com", password="securepass123"
        )

    def test_login_success(self):
        response = self.client.post(
            self.url,
            {"email": "test@example.com", "password": "securepass123"},
            format="json",
        )
        assert response.status_code == 200
        assert "token" in response.data
        assert response.data["user"]["email"] == "test@example.com"

    def test_login_wrong_password(self):
        response = self.client.post(
            self.url,
            {"email": "test@example.com", "password": "wrongpassword"},
            format="json",
        )
        assert response.status_code == 400

    def test_login_nonexistent_email(self):
        response = self.client.post(
            self.url,
            {"email": "nobody@example.com", "password": "securepass123"},
            format="json",
        )
        assert response.status_code == 400
