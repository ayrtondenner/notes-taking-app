from django.db.models import Count
from rest_framework import generics, viewsets

from .models import Category, Note
from .serializers import CategorySerializer, NoteSerializer


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return (
            Category.objects.filter(user=self.request.user)
            .annotate(note_count=Count("notes"))
            .order_by("id")
        )


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer

    def get_queryset(self):
        queryset = Note.objects.filter(user=self.request.user).select_related(
            "category"
        )
        category_id = self.request.query_params.get("category")
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
