from django.urls import path, include

"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

# config/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from teacher.views import TeacherViewSet, TeacherAssignmentViewSet
from classroom.views import GradeLevelViewSet, SectionViewSet
from subject.views import SubjectViewSet
from timetable.views import TimetableViewSet
from attendance.views import AttendanceViewSet
from exam.views import ExamViewSet
from parent.views import MyChildrenView

router = DefaultRouter()
router.register(r"teachers", TeacherViewSet)
router.register(r"assignments", TeacherAssignmentViewSet)
router.register(r"grade-levels", GradeLevelViewSet)
router.register(r"sections", SectionViewSet)
router.register(r"subjects", SubjectViewSet)
router.register(r"timetable", TimetableViewSet)
router.register(r"attendance", AttendanceViewSet)
router.register(r"exam", ExamViewSet)
router.register(r"parent", MyChildrenView)

urlpatterns = [
    path("admin/", admin.site.urls),
    path(
        "auth/", include("authentication.urls")
    ),  # Your custom login/logout/password reset
    path("api/", include(router.urls)),
    # For social login & registration via dj-rest-auth
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path("api/auth/social/", include("allauth.socialaccount.urls")),
]
