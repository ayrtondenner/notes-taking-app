import pytest
from django.db.models import Count
from rest_framework.test import APIRequestFactory

from accounts.models import User
from notes.models import Category, Note
from notes.serializers import CategorySerializer, NoteSerializer


@pytest.fixture
def user():
    return User.objects.create_user(email="test@example.com", password="testpass123")


@pytest.fixture
def other_user():
    return User.objects.create_user(email="other@example.com", password="testpass123")


@pytest.fixture
def category(user):
    return Category.objects.create(name="Random Thoughts", color="#EF9C66", user=user)


@pytest.mark.django_db
class TestCategorySerializer:
    def test_includes_note_count(self, user, category):
        Note.objects.create(category=category, user=user, title="Note 1")
        Note.objects.create(category=category, user=user, title="Note 2")

        cat = Category.objects.filter(id=category.id).annotate(
            note_count=Count("notes")
        ).first()
        serializer = CategorySerializer(cat)
        assert serializer.data["note_count"] == 2

    def test_note_count_zero(self, category):
        cat = Category.objects.filter(id=category.id).annotate(
            note_count=Count("notes")
        ).first()
        serializer = CategorySerializer(cat)
        assert serializer.data["note_count"] == 0


@pytest.mark.django_db
class TestNoteSerializer:
    def test_validates_category_belongs_to_user(self, user, other_user, category):
        other_cat = Category.objects.create(
            name="Other", color="#C8CFA0", user=other_user
        )
        factory = APIRequestFactory()
        request = factory.post("/api/notes/")
        request.user = user

        serializer = NoteSerializer(
            data={"category_id": other_cat.id},
            context={"request": request},
        )
        assert not serializer.is_valid()
        assert "category_id" in serializer.errors

    def test_accepts_own_category(self, user, category):
        factory = APIRequestFactory()
        request = factory.post("/api/notes/")
        request.user = user

        serializer = NoteSerializer(
            data={"category_id": category.id},
            context={"request": request},
        )
        assert serializer.is_valid(), serializer.errors
