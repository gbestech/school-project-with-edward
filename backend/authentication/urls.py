# from django.urls import path, include
# from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
# from .views import (
#     jwt_login_view,
#     logout_view,
#     password_reset_request,
#     password_reset_confirm,
#     check_email_view,
#     register_view,
# )

# app_name = "authentication"

# urlpatterns = [
#     # JWT Auth endpoints
#     path("api/token/", jwt_login_view, name="token_obtain_pair"),
#     path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
#     path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
#     # Custom auth endpoints
#     path("logout/", logout_view, name="logout"),
#     path("check-email/", check_email_view, name="check_email"),
#     path("register/", register_view, name="register"),
#     path("password-reset/", password_reset_request, name="password_reset"),
#     path(
#         "password-reset-confirm/<uidb64>/<token>/",
#         password_reset_confirm,
#         name="password_reset_confirm",
#     ),
#     # dj-rest-auth
#     path("dj-rest-auth/", include("dj_rest_auth.urls")),
#     path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
#     path(
#         "dj-rest-auth/social/", include("dj_rest_auth.social_urls")
#     ),  # ✅ THIS IS THE CORRECT ONE
# ]
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    jwt_login_view,
    logout_view,
    password_reset_request,
    password_reset_confirm,
    check_email_view,
    register_view,
)

app_name = "authentication"

urlpatterns = [
    # JWT Auth endpoints
    path("api/token/", jwt_login_view, name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # Custom auth endpoints
    path("logout/", logout_view, name="logout"),
    path("check-email/", check_email_view, name="check_email"),
    path("register/", register_view, name="register"),
    path("password-reset/", password_reset_request, name="password_reset"),
    path(
        "password-reset-confirm/<uidb64>/<token>/",
        password_reset_confirm,
        name="password_reset_confirm",
    ),
    # dj-rest-auth core endpoints
    path("dj-rest-auth/", include("dj_rest_auth.urls")),
    path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
    # ✅ If using social login (Google, Facebook, etc.)
    path("dj-rest-auth/social/", include("allauth.socialaccount.urls")),
]
