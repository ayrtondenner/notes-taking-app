from django.contrib import admin

from .models import Category, Note


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "color", "user"]


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "user", "updated_at"]
    list_filter = ["category"]
