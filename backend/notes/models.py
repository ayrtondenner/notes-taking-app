from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="categories"
    )

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Note(models.Model):
    title = models.CharField(max_length=255, default="", blank=True)
    content = models.TextField(default="", blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="notes"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notes"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title or "Untitled"
