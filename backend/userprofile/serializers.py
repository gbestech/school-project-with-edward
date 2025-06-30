from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = UserProfile
        fields = ["id", "user", "phone_number", "address", "profile_picture"]
        read_only_fields = ["id", "user"]
