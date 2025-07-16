# invitations/serializers.py
from rest_framework import serializers
from .models import Invitation
from django.utils import timezone
from datetime import timedelta


class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = ["id", "email", "role", "token", "is_used", "created_at", "expires_at"]
        read_only_fields = ["token", "is_used", "created_at", "expires_at"]

    def create(self, validated_data):
        validated_data["invited_by"] = self.context["request"].user
        validated_data["expires_at"] = timezone.now() + timedelta(days=3)
        return super().create(validated_data)
