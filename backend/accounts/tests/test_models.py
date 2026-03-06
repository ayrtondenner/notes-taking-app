import pytest
from django.db import IntegrityError

from accounts.models import User


@pytest.mark.django_db
class TestUserModel:
    def test_create_user(self):
        user = User.objects.create_user(email="test@example.com", password="testpass123")
        assert user.email == "test@example.com"
        assert user.is_active is True
        assert user.is_staff is False

    def test_password_is_hashed(self):
        user = User.objects.create_user(email="test@example.com", password="testpass123")
        assert user.password != "testpass123"
        assert user.check_password("testpass123")

    def test_duplicate_email_raises_error(self):
        User.objects.create_user(email="test@example.com", password="testpass123")
        with pytest.raises(IntegrityError):
            User.objects.create_user(email="test@example.com", password="otherpass123")

    def test_create_superuser(self):
        user = User.objects.create_superuser(email="admin@example.com", password="adminpass123")
        assert user.is_staff is True
        assert user.is_superuser is True

    def test_email_required(self):
        with pytest.raises(ValueError, match="Email is required"):
            User.objects.create_user(email="", password="testpass123")

    def test_str(self):
        user = User.objects.create_user(email="test@example.com", password="testpass123")
        assert str(user) == "test@example.com"
