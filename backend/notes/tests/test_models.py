import pytest
from django.utils import timezone

from accounts.models import User
from notes.models import Category, Note


@pytest.fixture
def user():
    return User.objects.create_user(email="test@example.com", password="testpass123")


@pytest.fixture
def category(user):
    return Category.objects.create(name="Random Thoughts", color="#EF9C66", user=user)


@pytest.mark.django_db
class TestCategory:
    def test_create_category(self, user):
        cat = Category.objects.create(name="School", color="#FCDC94", user=user)
        assert cat.name == "School"
        assert cat.color == "#FCDC94"
        assert cat.user == user

    def test_str(self, category):
        assert str(category) == "Random Thoughts"


@pytest.mark.django_db
class TestNote:
    def test_create_note_with_defaults(self, user, category):
        note = Note.objects.create(category=category, user=user)
        assert note.title == ""
        assert note.content == ""

    def test_updated_at_changes_on_save(self, user, category):
        note = Note.objects.create(category=category, user=user, title="Test")
        first_updated = note.updated_at
        note.title = "Updated"
        note.save()
        note.refresh_from_db()
        assert note.updated_at > first_updated

    def test_ordering_by_updated_at_desc(self, user, category):
        note1 = Note.objects.create(category=category, user=user, title="First")
        note2 = Note.objects.create(category=category, user=user, title="Second")
        # note2 was created last, so it should appear first
        notes = list(Note.objects.filter(user=user))
        assert notes[0].title == "Second"

    def test_cascade_delete_category(self, user, category):
        Note.objects.create(category=category, user=user, title="Test")
        assert Note.objects.count() == 1
        category.delete()
        assert Note.objects.count() == 0

    def test_cascade_delete_user(self, user, category):
        Note.objects.create(category=category, user=user, title="Test")
        user.delete()
        assert Note.objects.count() == 0
        assert Category.objects.count() == 0

    def test_str_with_title(self, user, category):
        note = Note.objects.create(category=category, user=user, title="My Note")
        assert str(note) == "My Note"

    def test_str_without_title(self, user, category):
        note = Note.objects.create(category=category, user=user)
        assert str(note) == "Untitled"
