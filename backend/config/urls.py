# # config/urls.py - FIXED VERSION
# from django.contrib import admin
# from django.urls import path, include
# from .views import api_root, debug_login_function
# from authentication.views import GoogleLogin

# urlpatterns = [
#     path("admin/", admin.site.urls),
#     # API root
#     path("api/", api_root),
#     # Debug endpoint (keep at top for specificity)
#     path("api/debug/login/", debug_login_function, name="debug_login"),
#     # Django Rest Auth routes (MAIN AUTHENTICATION)
#     path("api/dj-rest-auth/", include("dj_rest_auth.urls")),
#     path("api/dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
#     # Social login routes
#     path("api/dj-rest-auth/google/", GoogleLogin.as_view(), name="google_login"),
#     # Custom authentication routes (if you have additional custom auth)
#     path("api/auth/", include("authentication.urls")),
#     # App-specific API routes
#     path("api/dashboard/", include("dashboard.urls")),
#     path("api/", include("userprofile.urls")),
#     path("api/teachers/", include("teacher.urls")),
#     path("api/classrooms/", include("classroom.urls")),
#     path("api/subjects/", include("subject.urls")),
#     path("api/timetable/", include("timetable.urls")),
#     path("api/attendance/", include("attendance.urls")),
#     path("api/exams/", include("exam.urls")),
#     path("api/parents/", include("parent.urls")),
#     path("api/students/", include("students.urls")),
#     path("api/messaging/", include("messaging.urls")),
#     path("api/utils/", include("utils.urls")),
#     path("api/invitations/", include("invitations.urls")),
#     # Social account routes (optional, mainly for admin)
#     path("api/socialaccounts/", include("allauth.socialaccount.urls")),
#     # Social provider routes (if needed for direct provider integration)
#     path("api/auth/google/", include("allauth.socialaccount.providers.google.urls")),
#     path(
#         "api/auth/facebook/", include("allauth.socialaccount.providers.facebook.urls")
#     ),
# ]


# config/urls.py - SIMPLE FIX (Keep your current structure)
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import api_root, debug_login_function
from authentication.views import GoogleLogin

urlpatterns = [
    path("admin/", admin.site.urls),
    # API root
    path("api/", api_root, name="api_root"),
    # Debug endpoint (keep at top for specificity)
    path("api/debug/login/", debug_login_function, name="debug_login"),
    # Django Rest Auth routes (MAIN AUTHENTICATION)
    path("api/dj-rest-auth/", include("dj_rest_auth.urls")),
    path("api/dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
    # Social login routes
    path("api/dj-rest-auth/google/", GoogleLogin.as_view(), name="google_login"),
    # Custom authentication routes
    path("api/auth/", include("authentication.urls")),
    # App-specific API routes
    path("api/dashboard/", include("dashboard.urls")),
    path("api/profiles/", include("userprofile.urls")),  # FIXED: Added specific path
    path("api/teachers/", include("teacher.urls")),
    path("api/subjects/", include("subject.urls")),
    path("api/timetable/", include("timetable.urls")),
    path("api/attendance/", include("attendance.urls")),
    path("api/exams/", include("exam.urls")),
    path("api/parents/", include("parent.urls")),
    path("api/students/", include("students.urls")),
    path("api/messaging/", include("messaging.urls")),
    path("api/utils/", include("utils.urls")),
    path("api/invitations/", include("invitations.urls")),
    path("api/results/", include("result.urls")),
    path("api/classrooms/", include("classroom.urls")),
    path("api/", include("schoolSettings.urls")),
    path("api/", include("events.urls")),
    path("api/lessons/", include("lesson.urls")),
    path("api/fee/", include("fee.urls")),
    # Social account routes (optional, mainly for admin)
    path("api/socialaccounts/", include("allauth.socialaccount.urls")),
    # Social provider routes (if needed for direct provider integration)
    path("api/auth/google/", include("allauth.socialaccount.providers.google.urls")),
    path(
        "api/auth/facebook/", include("allauth.socialaccount.providers.facebook.urls")
    ),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Add debug toolbar in development
if settings.DEBUG and "debug_toolbar" in settings.INSTALLED_APPS:
    import debug_toolbar

    urlpatterns = [
        path("__debug__/", include(debug_toolbar.urls)),
    ] + urlpatterns
