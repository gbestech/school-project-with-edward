# timetable/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TimetableViewSet

router = DefaultRouter()
router.register(r"timetables", TimetableViewSet, basename="timetable")

urlpatterns = [
    path("", include(router.urls)),
]

from django.urls import path
from .views import test_email_view

urlpatterns = [
    path("test-email/", test_email_view, name="test_email"),
]
