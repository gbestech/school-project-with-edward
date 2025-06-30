from django.urls import path
from .views import test_email_view

urlpatterns = [
    path("test-email/", test_email_view),
]
