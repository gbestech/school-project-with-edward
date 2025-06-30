from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeacherViewSet, TeacherAssignmentViewSet

router = DefaultRouter()
router.register(r"teachers", TeacherViewSet, basename="teacher")
router.register(r"assignments", TeacherAssignmentViewSet, basename="assignment")

urlpatterns = [
    path("", include(router.urls)),
]
