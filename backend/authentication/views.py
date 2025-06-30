from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.conf import settings
from django.contrib.auth import get_user_model

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)

from .serializers import CustomTokenObtainPairSerializer, RegisterSerializer

import logging

logger = logging.getLogger(__name__)

User = get_user_model()


# -------- CHECK EMAIL VIEW -------- #
@api_view(["POST"])
@permission_classes([AllowAny])
def check_email_view(request):
    email = request.data.get("email")
    if not email:
        return Response(
            {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
        )
    exists = User.objects.filter(email=email).exists()
    return Response({"exists": exists}, status=status.HTTP_200_OK)


# -------- REGISTER VIEW -------- #
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        print(serializer.errors)  # Show actual issues
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()

    return Response(
        {
            "message": "User registered successfully.",
            "data": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "is_verified": user.is_active,  # or `user.email_verified` if custom
                "created_at": (
                    user.date_joined if hasattr(user, "date_joined") else None
                ),
            },
        },
        status=status.HTTP_201_CREATED,
    )


# -------- JWT LOGIN VIEW -------- #
@api_view(["POST"])
@permission_classes([AllowAny])
def jwt_login_view(request):
    serializer = CustomTokenObtainPairSerializer(data=request.data)
    if serializer.is_valid():
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


# -------- LOGOUT VIEW -------- #
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response(
            {"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(
            {"message": "Successfully logged out."}, status=status.HTTP_200_OK
        )
    except Exception:
        return Response(
            {"error": "Invalid or expired refresh token."},
            status=status.HTTP_400_BAD_REQUEST,
        )


# -------- PASSWORD RESET REQUEST -------- #
@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    email = request.data.get("email")
    frontend_url = request.data.get("frontend_url")

    if not email or not frontend_url:
        return Response(
            {"detail": "Email and frontend_url are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(email=email).first()
    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{frontend_url}/reset-password/{uid}/{token}/"

        try:
            send_mail(
                "Password Reset Request",
                f"Click the link to reset your password:\n\n{reset_link}",
                settings.DEFAULT_FROM_EMAIL,
                [email],
            )
        except Exception as e:
            # Log the error, but still return success to avoid info leak
            logger.error(f"Password reset email failed: {e}")

    return Response(
        {"detail": "If the email exists, a reset link has been sent."},
        status=status.HTTP_200_OK,
    )


# -------- PASSWORD RESET CONFIRM -------- #
@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request, uidb64, token):
    password = request.data.get("password")
    if not password:
        return Response({"error": "Password is required."}, status=400)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception:
        return Response({"error": "Invalid reset link."}, status=400)

    if default_token_generator.check_token(user, token):
        user.set_password(password)
        user.save()
        return Response({"message": "Password has been reset successfully."})
    else:
        return Response({"error": "Invalid or expired token."}, status=400)
