# Add these imports at the top of your authentication/views.py file

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.views import View
from django.utils.decorators import method_decorator

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)

from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client

from datetime import timedelta
import random
import string
import logging
import json

from .serializers import (
    RegisterSerializer,
    VerifyAccountSerializer,
    ResendVerificationSerializer,
    CustomTokenObtainPairSerializer,
    SimpleLoginSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)

# ============== REGISTRATION AND VERIFICATION VIEWS ==============


from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    """User registration view - creates inactive user and sends verification code"""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Account created successfully. Please check your email/SMS for verification code.",
                    "email": user.email,
                    "verification_method": request.data.get(
                        "verification_method", "email"
                    ),
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class VerifyAccountView(APIView):
    """Verify user account with verification code and auto-login"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyAccountSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]

            # Generate JWT tokens for automatic login
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token

            # Add custom claims to the token
            access_token["id"] = user.id
            access_token["email"] = user.email
            access_token["role"] = user.role
            access_token["is_staff"] = user.is_staff

            return Response(
                {
                    "message": "Account verified successfully. You are now logged in.",
                    "access": str(access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "role": user.role,
                    },
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class ResendVerificationView(APIView):
    """Resend verification code to user's email or phone"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        if serializer.is_valid():
            verification_code = serializer.resend_code(serializer.validated_data)
            return Response(
                {
                    "message": f"Verification code sent successfully via {serializer.validated_data['verification_method']}.",
                    "email": serializer.validated_data["email"],
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============== LOGIN VIEWS ==============


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token view for verified users"""

    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class SimpleLoginView(APIView):
    """Alternative simple login view"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SimpleLoginSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            user = serializer.validated_data["user"]

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token

            # Add custom claims
            access_token["id"] = user.id
            access_token["email"] = user.email
            access_token["role"] = user.role
            access_token["is_staff"] = user.is_staff

            return Response(
                {
                    "message": "Login successful",
                    "access": str(access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "role": getattr(user, "role", "user"),
                    },
                },
                status=status.HTTP_200_OK,
            )
        logger.error(f"Login serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def jwt_login_view(request):
    """JWT login view for authentication"""
    serializer = CustomTokenObtainPairSerializer(data=request.data)
    if serializer.is_valid():
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["POST"])
@permission_classes([AllowAny])
def simple_login_view(request):
    """Simple login view (function-based)"""
    serializer = SimpleLoginSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        user = serializer.validated_data["user"]

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        # Add custom claims
        access["id"] = user.id
        access["email"] = user.email
        access["role"] = user.role
        access["is_staff"] = user.is_staff

        return Response(
            {
                "refresh": str(refresh),
                "access": str(access),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                },
            },
            status=status.HTTP_200_OK,
        )

    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


# ============== UTILITY VIEWS ==============


@api_view(["POST"])
@permission_classes([AllowAny])
def check_verification_status(request):
    """Check if user account is verified"""
    email = request.data.get("email")
    if not email:
        return Response(
            {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
        return Response(
            {
                "email": email,
                "is_verified": user.is_active,
                "user_exists": True,
            },
            status=status.HTTP_200_OK,
        )
    except User.DoesNotExist:
        return Response(
            {
                "email": email,
                "is_verified": False,
                "user_exists": False,
            },
            status=status.HTTP_200_OK,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def check_verification_status(request):
    """Check if user account is verified (function-based)"""
    email = request.data.get("email")
    if not email:
        return Response(
            {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
        return Response(
            {
                "email": email,
                "is_verified": user.is_active,
                "user_exists": True,
            },
            status=status.HTTP_200_OK,
        )
    except User.DoesNotExist:
        return Response(
            {
                "email": email,
                "is_verified": False,
                "user_exists": False,
            },
            status=status.HTTP_200_OK,
        )


# @api_view(["GET"])
# @permission_classes([permissions.IsAuthenticated])
# def user_profile(request):
#     """Get current user profile"""
#     user = request.user
#     return Response(
#         {
#             "id": user.id,
#             "email": user.email,
#             "username": user.username,
#             "first_name": user.first_name,
#             "last_name": user.last_name,
#             "role": user.role,
#             "is_active": user.is_active,
#             "date_joined": user.date_joined,
#             "phone": user.phone,
#             "phone_number": user.phone_number,
#         },
#         status=status.HTTP_200_OK,
#     )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user profile with better error handling"""
    try:
        user = request.user
        logger.info(
            f"Profile request for user: {user.email if user.is_authenticated else 'Anonymous'}"
        )

        if not user.is_authenticated:
            logger.warning("Unauthenticated user tried to access profile")
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(
            {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": getattr(user, "role", "user"),
                "is_active": user.is_active,
                "date_joined": user.date_joined,
                "phone": getattr(user, "phone", None),
                "phone_number": getattr(user, "phone_number", None),
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        logger.error(f"Profile view error: {str(e)}")
        return Response(
            {"error": "Server error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout user by blacklisting refresh token"""
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
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return Response(
            {"error": "Invalid or expired refresh token."},
            status=status.HTTP_400_BAD_REQUEST,
        )


# ============== PASSWORD RESET ==============


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Request password reset link"""
    email = request.data.get("email")
    frontend_url = request.data.get("frontend_url")

    if not email or not frontend_url:
        return Response(
            {"detail": "Email and frontend_url are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(email=email).first()
    if user:
        # Check if user is verified
        if not user.is_active:
            return Response(
                {
                    "detail": "Account is not verified. Please verify your account first."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

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
            logger.error(f"Password reset email failed: {e}")

    return Response(
        {"detail": "If the email exists, a reset link has been sent."},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request, uidb64, token):
    """Confirm password reset with new password"""
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


# ============CHECK VERIFICATION VIEW============


class CheckVerificationStatusView(APIView):
    """
    Check the verification status of the current user
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            # Assuming your user model has an 'is_verified' field
            # Adjust this based on your actual user model structure
            is_verified = getattr(user, "is_verified", False)

            return Response(
                {
                    "is_verified": is_verified,
                    "email": user.email,
                    "message": "Verification status retrieved successfully",
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": "Failed to check verification status", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request):
        """
        Alternative endpoint to check verification status via POST
        (in case you need to send additional data)
        """
        try:
            user = request.user
            email = request.data.get("email", user.email)

            # You can add additional logic here if needed
            is_verified = getattr(user, "is_verified", False)

            return Response(
                {
                    "is_verified": is_verified,
                    "email": email,
                    "message": "Verification status checked successfully",
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": "Failed to check verification status", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ============== SOCIAL LOGIN ==============


class CustomGoogleOAuth2Adapter(GoogleOAuth2Adapter):
    def complete_login(self, request, app, token, **kwargs):
        # Store extra data in request for adapter to use
        if hasattr(request, "data"):
            request.social_extra_data = {
                "role": request.data.get("role"),
                "phone": request.data.get("phone"),
                "agree_to_terms": request.data.get("agree_to_terms", False),
                "subscribe_newsletter": request.data.get("subscribe_newsletter", False),
                "first_name": request.data.get("first_name"),
                "last_name": request.data.get("last_name"),
            }

        return super().complete_login(request, app, token, **kwargs)


class GoogleLogin(SocialLoginView):
    adapter_class = CustomGoogleOAuth2Adapter
    client_class = OAuth2Client

    def post(self, request, *args, **kwargs):
        # Store extra data in request for the adapter
        request.social_extra_data = {
            "role": request.data.get("role"),
            "phone": request.data.get("phone"),
            "agree_to_terms": request.data.get("agree_to_terms", False),
            "subscribe_newsletter": request.data.get("subscribe_newsletter", False),
            "first_name": request.data.get("first_name"),
            "last_name": request.data.get("last_name"),
        }

        return super().post(request, *args, **kwargs)


@api_view(["POST"])
@permission_classes([AllowAny])
def debug_auth(request):
    """Debug authentication issues"""
    try:
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Try to get user
        try:
            user = User.objects.get(email=email)
            user_exists = True
            user_active = user.is_active
            password_correct = user.check_password(password)
        except User.DoesNotExist:
            user_exists = False
            user_active = False
            password_correct = False

        # Try authentication
        auth_user = authenticate(request, email=email, password=password)

        return Response(
            {
                "email": email,
                "user_exists": user_exists,
                "user_active": user_active,
                "password_correct": password_correct,
                "authentication_success": auth_user is not None,
                "user_id": auth_user.id if auth_user else None,
            }
        )

    except Exception as e:
        logger.error(f"Debug auth error: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def debug_token(request):
    """Debug JWT token issues"""
    try:
        user = request.user
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")

        return Response(
            {
                "user_authenticated": user.is_authenticated,
                "user_id": user.id if user.is_authenticated else None,
                "user_email": user.email if user.is_authenticated else None,
                "auth_header_present": bool(auth_header),
                "auth_header_format": (
                    auth_header[:20] + "..." if len(auth_header) > 20 else auth_header
                ),
            }
        )

    except Exception as e:
        logger.error(f"Debug token error: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============== ALTERNATIVE FUNCTION-BASED VIEWS ==============


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """Alternative function-based registration view"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return JsonResponse(
            {
                "message": "Registration successful. Please verify your account.",
                "email": user.email,
                "user_id": user.id,
            },
            status=201,
        )
    return JsonResponse(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def verify_account(request):
    """Alternative function-based verification view"""
    serializer = VerifyAccountSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data["user"]

        # Auto-login after verification
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        return JsonResponse(
            {
                "message": "Account verified and logged in successfully.",
                "access": str(access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                },
            },
            status=200,
        )
    return JsonResponse(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def resend_verification(request):
    """Alternative function-based resend verification view"""
    serializer = ResendVerificationSerializer(data=request.data)
    if serializer.is_valid():
        verification_code = serializer.resend_code(serializer.validated_data)
        return JsonResponse(
            {
                "message": "Verification code resent successfully.",
                "email": serializer.validated_data["email"],
            },
            status=200,
        )
    return JsonResponse(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([AllowAny])
def check_email_view(request):
    """Check if email exists in the system"""
    email = request.data.get("email")
    if not email:
        return Response(
            {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
        return Response(
            {
                "email": email,
                "exists": True,
                "is_verified": user.is_active,
            },
            status=status.HTTP_200_OK,
        )
    except User.DoesNotExist:
        return Response(
            {
                "email": email,
                "exists": False,
            },
            status=status.HTTP_200_OK,
        )


# Add these missing views to your authentication/views.py file

# ============== MISSING FUNCTION-BASED VIEWS ==============


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """Function-based registration view (alternative name for register_user)"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {
                "message": "Account created successfully. Please check your email/SMS for verification code.",
                "email": user.email,
                "user_id": user.id,
                "verification_method": request.data.get("verification_method", "email"),
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def verify_account_view(request):
    """Function-based verification view (alternative name for verify_account)"""
    serializer = VerifyAccountSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data["user"]

        # Generate JWT tokens for automatic login
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        # Add custom claims to the token
        access_token["id"] = user.id
        access_token["email"] = user.email
        access_token["role"] = user.role
        access_token["is_staff"] = user.is_staff

        return Response(
            {
                "message": "Account verified successfully. You are now logged in.",
                "access": str(access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                },
            },
            status=status.HTTP_200_OK,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def resend_verification_view(request):
    """Function-based resend verification view (alternative name for resend_verification)"""
    serializer = ResendVerificationSerializer(data=request.data)
    if serializer.is_valid():
        verification_code = serializer.resend_code(serializer.validated_data)
        return Response(
            {
                "message": f"Verification code sent successfully via {serializer.validated_data['verification_method']}.",
                "email": serializer.validated_data["email"],
            },
            status=status.HTTP_200_OK,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @method_decorator(csrf_exempt, name="dispatch")
# class DebugLoginView(View):
#     def post(self, request):
#         try:
#             # Log the raw request
#             logger.info(f"Raw body: {request.body}")
#             logger.info(f"Content type: {request.content_type}")
#             logger.info(f"Headers: {dict(request.headers)}")

#             # Try to parse JSON
#             try:
#                 data = json.loads(request.body)
#                 logger.info(f"Parsed data: {data}")
#             except json.JSONDecodeError as e:
#                 return JsonResponse(
#                     {
#                         "error": "JSON decode error",
#                         "details": str(e),
#                         "body": request.body.decode("utf-8"),
#                     },
#                     status=400,
#                 )

#             # Check what fields we got
#             email = data.get("email")
#             password = data.get("password")

#             logger.info(f"Email: {email}")
#             logger.info(f"Password: {'*' * len(password) if password else 'None'}")

#             if not email:
#                 return JsonResponse({"error": "Email is required"}, status=400)

#             if not password:
#                 return JsonResponse({"error": "Password is required"}, status=400)

#             # Try to authenticate
#             user = authenticate(request, email=email, password=password)

#             if user is not None:
#                 return JsonResponse(
#                     {
#                         "message": "Authentication successful",
#                         "user_id": user.id,
#                         "username": user.username,
#                         "email": user.email,
#                         "is_active": user.is_active,
#                     }
#                 )
#             else:
#                 # Check if user exists
#                 try:
#                     user_exists = User.objects.get(email=email)
#                     return JsonResponse(
#                         {
#                             "error": "Authentication failed",
#                             "user_exists": True,
#                             "user_active": user_exists.is_active,
#                         },
#                         status=401,
#                     )
#                 except User.DoesNotExist:
#                     return JsonResponse(
#                         {"error": "Authentication failed", "user_exists": False},
#                         status=401,
#                     )

#         except Exception as e:
#             logger.error(f"Debug login error: {str(e)}")
#             return JsonResponse(
#                 {"error": "Server error", "details": str(e)}, status=500
#             )


class DebugLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Log the incoming data
        print("Request data:", request.data)
        return Response({"received_data": request.data}, status=status.HTTP_200_OK)


# Function-based version if you prefer
@csrf_exempt
@require_http_methods(["POST"])
def debug_login_function(request):
    try:
        print(f"Raw body: {request.body}")
        print(f"Content type: {request.content_type}")

        data = json.loads(request.body)
        print(f"Parsed data: {data}")

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password required"}, status=400)

        user = authenticate(request, email=email, password=password)

        if user:
            return JsonResponse({"message": "Success", "user": user.username})
        else:
            return JsonResponse({"error": "Authentication failed"}, status=401)

    except Exception as e:
        print(f"Error: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
