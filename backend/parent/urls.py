from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ParentViewSet
from .views_performance import StudentDetailView

router = DefaultRouter()
router.register(r"", ParentViewSet, basename="parent")  # Handles profile and dashboard

urlpatterns = [
    path("", include(router.urls)),
    path(
        "students/<int:student_id>/", StudentDetailView.as_view(), name="student-detail"
    ),
]
