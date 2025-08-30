from rest_framework.routers import DefaultRouter
from .views import MessageViewSet, MessageTemplateViewSet, BulkMessageViewSet

router = DefaultRouter()
router.register(r"messages", MessageViewSet, basename="message")
router.register(r"templates", MessageTemplateViewSet, basename="template")
router.register(r"bulk-messages", BulkMessageViewSet, basename="bulk-message")

urlpatterns = router.urls
