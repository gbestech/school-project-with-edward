from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LessonViewSet, LessonAttendanceViewSet, 
    LessonResourceViewSet, LessonAssessmentViewSet
)

router = DefaultRouter()
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'attendances', LessonAttendanceViewSet, basename='lesson-attendance')
router.register(r'resources', LessonResourceViewSet, basename='lesson-resource')
router.register(r'assessments', LessonAssessmentViewSet, basename='lesson-assessment')

urlpatterns = [
    path('', include(router.urls)),
]
