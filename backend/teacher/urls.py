from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TeacherViewSet, 
    AssignmentRequestViewSet, 
    TeacherScheduleViewSet, 
    AssignmentManagementViewSet
)

router = DefaultRouter()
router.register(r"teachers", TeacherViewSet, basename="teacher")
router.register(r"assignment-requests", AssignmentRequestViewSet, basename="assignment-request")
router.register(r"teacher-schedules", TeacherScheduleViewSet, basename="teacher-schedule")
router.register(r"assignment-management", AssignmentManagementViewSet, basename="assignment-management")

urlpatterns = [
    path("", include(router.urls)),
]
