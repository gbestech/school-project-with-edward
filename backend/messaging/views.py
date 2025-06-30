from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Message
from .serializers import MessageSerializer
from .permissions import IsParentTeacherOrAdmin


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsParentTeacherOrAdmin]

    def get_queryset(self):
        user = self.request.user
        msg_type = self.request.query_params.get("type", None)

        if msg_type == "inbox":
            return Message.objects.filter(recipient=user)
        elif msg_type == "sent":
            return Message.objects.filter(sender=user)
        else:
            # Return all messages where user is sender or recipient
            return Message.objects.filter(sender=user) | Message.objects.filter(
                recipient=user
            )

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
