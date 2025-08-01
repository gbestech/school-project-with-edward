from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentResultViewSet,
    StudentTermResultViewSet,
    ExamSessionViewSet,
    ResultSheetViewSet,
    AssessmentScoreViewSet,
    ResultCommentViewSet,
    GradingSystemViewSet,
    GradeViewSet,
    AssessmentTypeViewSet
)

router = DefaultRouter()
router.register(r'student-results', StudentResultViewSet)
router.register(r'term-results', StudentTermResultViewSet)
router.register(r'exam-sessions', ExamSessionViewSet)
router.register(r'result-sheets', ResultSheetViewSet)
router.register(r'assessment-scores', AssessmentScoreViewSet)
router.register(r'result-comments', ResultCommentViewSet)
router.register(r'grading-systems', GradingSystemViewSet)
router.register(r'grades', GradeViewSet)
router.register(r'assessment-types', AssessmentTypeViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 