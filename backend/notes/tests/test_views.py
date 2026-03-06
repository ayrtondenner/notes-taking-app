import pytest
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from accounts.models import User
from notes.models import Category, Note


@pytest.fixture
def user():
    return User.objects.create_user(email="test@example.com", password="testpass123")


@pytest.fixture
def auth_client(user):
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.fixture
def categories(user):
    return [
        Category.objects.create(name="Random Thoughts", color="#EF9C66", user=user),
        Category.objects.create(name="School", color="#FCDC94", user=user),
        Category.objects.create(name="Personal", color="#78ABA8", user=user),
    ]


@pytest.mark.django_db
class TestCategoryListView:
    def test_list_categories(self, auth_client, categories):
        response = auth_client.get(reverse("category-list"))
        assert response.status_code == 200
        assert len(response.data) == 3

    def test_categories_include_note_count(self, auth_client, categories, user):
        Note.objects.create(category=categories[0], user=user, title="Note 1")
        Note.objects.create(category=categories[0], user=user, title="Note 2")
        response = auth_client.get(reverse("category-list"))
        counts = {c["name"]: c["note_count"] for c in response.data}
        assert counts["Random Thoughts"] == 2
        assert counts["School"] == 0

    def test_unauthenticated_returns_401(self):
        client = APIClient()
        response = client.get(reverse("category-list"))
        assert response.status_code == 401

    def test_user_sees_only_own_categories(self, auth_client, categories):
        other_user = User.objects.create_user(email="other@example.com", password="pass12345678")
        Category.objects.create(name="Other Cat", color="#C8CFA0", user=other_user)
        response = auth_client.get(reverse("category-list"))
        assert len(response.data) == 3


@pytest.mark.django_db
class TestNoteViewSet:
    def test_create_note(self, auth_client, categories):
        response = auth_client.post(
            reverse("note-list"),
            {"category_id": categories[0].id},
            format="json",
        )
        assert response.status_code == 201
        assert response.data["title"] == ""
        assert response.data["category"]["name"] == "Random Thoughts"

    def test_list_notes(self, auth_client, categories, user):
        Note.objects.create(category=categories[0], user=user, title="Note 1")
        Note.objects.create(category=categories[1], user=user, title="Note 2")
        response = auth_client.get(reverse("note-list"))
        assert response.status_code == 200
        assert len(response.data) == 2

    def test_filter_notes_by_category(self, auth_client, categories, user):
        Note.objects.create(category=categories[0], user=user, title="RT Note")
        Note.objects.create(category=categories[1], user=user, title="School Note")
        response = auth_client.get(
            reverse("note-list"), {"category": categories[0].id}
        )
        assert len(response.data) == 1
        assert response.data[0]["title"] == "RT Note"

    def test_update_note(self, auth_client, categories, user):
        note = Note.objects.create(category=categories[0], user=user)
        response = auth_client.put(
            reverse("note-detail", args=[note.id]),
            {"title": "Updated", "content": "New content", "category_id": categories[0].id},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["title"] == "Updated"

    def test_update_note_changes_updated_at(self, auth_client, categories, user):
        note = Note.objects.create(category=categories[0], user=user, title="Original")
        original_updated = note.updated_at
        auth_client.put(
            reverse("note-detail", args=[note.id]),
            {"title": "Changed", "category_id": categories[0].id},
            format="json",
        )
        note.refresh_from_db()
        assert note.updated_at > original_updated

    def test_delete_note(self, auth_client, categories, user):
        note = Note.objects.create(category=categories[0], user=user)
        response = auth_client.delete(reverse("note-detail", args=[note.id]))
        assert response.status_code == 204
        assert Note.objects.count() == 0

    def test_unauthenticated_returns_401(self):
        client = APIClient()
        assert client.get(reverse("note-list")).status_code == 401
        assert client.post(reverse("note-list"), {}).status_code == 401

    def test_user_cannot_see_other_users_notes(self, auth_client, categories, user):
        other_user = User.objects.create_user(email="other@example.com", password="pass12345678")
        other_cat = Category.objects.create(name="Other", color="#C8CFA0", user=other_user)
        Note.objects.create(category=other_cat, user=other_user, title="Secret")
        response = auth_client.get(reverse("note-list"))
        assert len(response.data) == 0


@pytest.mark.django_db
class TestFullFlow:
    def test_signup_create_edit_filter_delete(self):
        client = APIClient()

        # Signup
        response = client.post(
            reverse("signup"),
            {"email": "flow@example.com", "password": "securepass123"},
            format="json",
        )
        assert response.status_code == 201
        token = response.data["token"]
        client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

        # Categories created
        response = client.get(reverse("category-list"))
        assert len(response.data) == 3
        cat_id = response.data[0]["id"]

        # Create note
        response = client.post(
            reverse("note-list"),
            {"category_id": cat_id},
            format="json",
        )
        assert response.status_code == 201
        note_id = response.data["id"]

        # Edit note
        response = client.put(
            reverse("note-detail", args=[note_id]),
            {"title": "Grocery List", "content": "Eggs, milk", "category_id": cat_id},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["title"] == "Grocery List"

        # Filter by category
        response = client.get(reverse("note-list"), {"category": cat_id})
        assert len(response.data) == 1

        # Delete
        response = client.delete(reverse("note-detail", args=[note_id]))
        assert response.status_code == 204

        # Verify deleted
        response = client.get(reverse("note-list"))
        assert len(response.data) == 0
