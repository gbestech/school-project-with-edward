from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, EventImageViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'event-images', EventImageViewSet, basename='event-image')

urlpatterns = [
    path('', include(router.urls)),
] 