from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

from .views import (
    jwt_login_view,
    logout_view,
    password_reset_request,
    password_reset_confirm,
)

# from .views import (
#     login_view,
#     logout_view,
#     password_reset_request,
#     password_reset_confirm,
#     CustomTokenObtainPairView,  # Use the custom view if customizing JWT
# )

from django.urls import path, include
from .views import (
    jwt_login_view,
    logout_view,
    password_reset_request,
    password_reset_confirm,
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path("login/", jwt_login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("api/token/", jwt_login_view, name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("password-reset/", password_reset_request, name="password_reset"),
    path(
        "password-reset-confirm/<uidb64>/<token>/",
        password_reset_confirm,
        name="password_reset_confirm",
    ),
    # 🔗 Social Auth & Registration
    path("dj-rest-auth/", include("dj_rest_auth.urls")),  # login/logout/token etc.
    path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
    path(
        "dj-rest-auth/social/", include("allauth.socialaccount.urls")
    ),  # Social login redirect
]
