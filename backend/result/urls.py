from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GradingSystemViewSet, GradeViewSet, AssessmentTypeViewSet,
    ExamSessionViewSet, StudentResultViewSet, StudentTermResultViewSet,
    ResultSheetViewSet, AssessmentScoreViewSet, ResultCommentViewSet,
    SeniorSecondaryResultViewSet, SeniorSecondarySessionResultViewSet,
    JuniorSecondaryResultViewSet, PrimaryResultViewSet, NurseryResultViewSet,
    ScoringConfigurationViewSet, ResultCheckerViewSet
)

router = DefaultRouter()
router.register(r'grading-systems', GradingSystemViewSet)
router.register(r'grades', GradeViewSet)
router.register(r'assessment-types', AssessmentTypeViewSet)
router.register(r'exam-sessions', ExamSessionViewSet)
router.register(r'student-results', StudentResultViewSet)
router.register(r'student-term-results', StudentTermResultViewSet)
router.register(r'result-sheets', ResultSheetViewSet)
router.register(r'assessment-scores', AssessmentScoreViewSet)
router.register(r'result-comments', ResultCommentViewSet)
router.register(r'senior-secondary-results', SeniorSecondaryResultViewSet)
router.register(r'senior-secondary-session-results', SeniorSecondarySessionResultViewSet)
router.register(r'junior-secondary-results', JuniorSecondaryResultViewSet)
router.register(r'primary-results', PrimaryResultViewSet)
router.register(r'nursery-results', NurseryResultViewSet)
router.register(r'scoring-configurations', ScoringConfigurationViewSet)
router.register(r'result-checker', ResultCheckerViewSet, basename='result-checker')

urlpatterns = [
    path('', include(router.urls)),
] 