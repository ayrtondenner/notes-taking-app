from django.utils import timezone

DEFAULT_CATEGORIES = [
    {"name": "Random Thoughts", "color": "#EF9C66"},
    {"name": "School", "color": "#FCDC94"},
    {"name": "Personal", "color": "#78ABA8"},
]


def create_default_categories(user):
    from .models import Category

    categories = [
        Category(name=cat["name"], color=cat["color"], user=user)
        for cat in DEFAULT_CATEGORIES
    ]
    Category.objects.bulk_create(categories)


def format_note_date(dt):
    now = timezone.now()
    today = now.date()
    note_date = dt.date() if hasattr(dt, "date") else dt

    if note_date == today:
        return "today"
    if note_date == today - timezone.timedelta(days=1):
        return "yesterday"
    return note_date.strftime("%B %d").replace(" 0", " ")
