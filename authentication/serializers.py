from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims

        token["id"] = user.id
        token["email"] = user.email
        token["role"] = user.role
        token["is_staff"] = user.is_staff
        return token


def validate(self, attrs):
    data = super().validate(attrs)

    # Optional: add extra data to response (not part of token itself)
    data["email"] = self.user.email
    data["first_name"] = self.user.first_name
    data["last_name"] = self.user.last_name
    data["role"] = self.user.role

    return data
