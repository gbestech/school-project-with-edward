from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate


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

        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(
                self.context["request"], username=email, password=password
            )
            if not user:
                raise serializers.ValidationError(
                    "No active account found with the given credentials"
                )
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
        else:
            raise serializers.ValidationError("Must include 'email' and 'password'.")

        data = super().validate({"username": user.email, "password": password})

        # Optional: add extra data to response (not part of token itself)
        data["email"] = self.user.email
        data["first_name"] = self.user.first_name
        data["last_name"] = self.user.last_name
        data["role"] = self.user.role

        return data
