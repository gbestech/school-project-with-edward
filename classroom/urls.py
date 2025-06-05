from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GradeLevelViewSet, SectionViewSet


router = DefaultRouter()
router.register(r"grades", GradeLevelViewSet)
router.register(r"sections", SectionViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
