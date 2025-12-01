# authentication/urls.py
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from dj_rest_auth.registration.views import SocialLoginView, SocialConnectView
from django.contrib.auth import authenticate, login
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .views import (
    CustomTokenObtainPairView,
    SimpleLoginView,
    RegisterView,
    VerifyAccountView,
    ResendVerificationView,
    CheckVerificationStatusView,
    create_admin,
    list_admins,
    user_profile,
    logout_view,
    password_reset_request,
    password_reset_confirm,
    check_email_view,
    GoogleLogin,
    DebugLoginView,
    debug_auth,  # Import the function directly
    debug_token,  # Import the function directly
    activate_user,
    admin_reset_password,
)


@csrf_exempt
def quick_login(request):
    user = authenticate(username="ais_super", password="Admin123!")
    if user:
        login(request, user)
        return HttpResponse(
            f'<h1>Login Success!</h1><p>User: {user.username}</p><a href="/admin/">Go to Admin</a>'
        )
    return HttpResponse("<h1>Login Failed!</h1>")


app_name = "authentication"

urlpatterns = [
    # ================== Main Auth endpoints ==================
    path("quick-login/", quick_login),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("logout/", logout_view, name="logout"),
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-account/", VerifyAccountView.as_view(), name="verify_account"),
    path(
        "resend-verification/",
        ResendVerificationView.as_view(),
        name="resend_verification",
    ),
    # ================== JWT Token endpoints ==================
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # ================== User Profile ==================
    path("profile/", user_profile, name="user_profile"),
    # ================== Password Reset ==================
    path("password-reset/", password_reset_request, name="password_reset"),
    path(
        "password-reset-confirm/<uidb64>/<token>/",
        password_reset_confirm,
        name="password_reset_confirm",
    ),
    path("admin-reset-password/", admin_reset_password, name="admin_reset_password"),
    path("admins/", create_admin, name="create-admin"),
    path("admins/list/", list_admins, name="list-admins"),
    # ================== Utility endpoints ==================
    path("check-email/", check_email_view, name="check_email"),
    path(
        "check-verification-status/",
        CheckVerificationStatusView.as_view(),
        name="check_verification_status",
    ),
    # ================== Social Authentication ==================
    path("google/login/", GoogleLogin.as_view(), name="google_login"),
    # ================== Debug endpoint ==================
    path("debug-login/", DebugLoginView.as_view(), name="debug_login"),
    # ================== dj-rest-auth endpoints ==================
    path("dj-rest-auth/", include("dj_rest_auth.urls")),
    path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
    path("debug/auth/", debug_auth, name="debug_auth"),
    path("debug/token/", debug_token, name="debug_token"),
    path("users/<int:user_id>/activate/", activate_user, name="activate_user"),
]
