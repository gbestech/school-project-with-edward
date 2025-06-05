from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeacherViewSet, TeacherAssignmentViewSet


router = DefaultRouter()
router.register(r"teacher", TeacherViewSet)
router.register(r"assignment", TeacherAssignmentViewSet)


urlpatterns = [
    path("", include(router.urls)),
]
