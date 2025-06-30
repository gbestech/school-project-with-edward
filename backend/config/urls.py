from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    # Admin panel
    path("admin/", admin.site.urls),
    # Authentication: JWT, registration, password reset, social login
    path("api/auth/", include("authentication.urls")),
    # User profile (optional, if you expose profile API separately)
    path("api/user-profiles/", include("userprofile.urls")),  # Optional
    # App-specific routes
    path("api/teachers/", include("teacher.urls")),
    path("api/classrooms/", include("classroom.urls")),
    path("api/subjects/", include("subject.urls")),
    path("api/timetable/", include("timetable.urls")),
    path("api/attendance/", include("attendance.urls")),
    path("api/exams/", include("exam.urls")),
    path("api/parents/", include("parent.urls")),
    path("api/students/", include("students.urls")),
    path("api/messaging/", include("messaging.urls")),
    path("api/utils/", include("utils.urls")),
]

# Redirect root to /api/
urlpatterns += [
    path("", RedirectView.as_view(url="/api/", permanent=False)),
]
