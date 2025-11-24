# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import (
#     # Base Configuration ViewSets
#     GradingSystemViewSet,
#     GradeViewSet,
#     AssessmentTypeViewSet,
#     ExamSessionViewSet,
#     ScoringConfigurationViewSet,
#     # Legacy/Base Result ViewSets
#     StudentResultViewSet,
#     StudentTermResultViewSet,
#     # Senior Secondary ViewSets
#     SeniorSecondaryResultViewSet,
#     SeniorSecondarySessionResultViewSet,
#     SeniorSecondaryTermReportViewSet,
#     SeniorSecondarySessionReportViewSet,
#     # Junior Secondary ViewSets
#     JuniorSecondaryResultViewSet,
#     JuniorSecondaryTermReportViewSet,
#     # Primary ViewSets
#     PrimaryResultViewSet,
#     PrimaryTermReportViewSet,
#     # Nursery ViewSets
#     NurseryResultViewSet,
#     NurseryTermReportViewSet,
#     # Supporting ViewSets
#     ResultSheetViewSet,
#     AssessmentScoreViewSet,
#     ResultCommentViewSet,
# )

# # Create the router
# router = DefaultRouter()

# # ===== BASE CONFIGURATION ROUTES =====
# router.register(r"grading-systems", GradingSystemViewSet, basename="grading-system")
# router.register(r"grades", GradeViewSet, basename="grade")
# router.register(r"assessment-types", AssessmentTypeViewSet, basename="assessment-type")
# router.register(r"exam-sessions", ExamSessionViewSet, basename="exam-session")
# router.register(
#     r"scoring-configurations",
#     ScoringConfigurationViewSet,
#     basename="scoring-configuration",
# )

# # ===== LEGACY/BASE RESULT ROUTES =====
# router.register(r"student-results", StudentResultViewSet, basename="student-result")
# router.register(
#     r"student-term-results", StudentTermResultViewSet, basename="student-term-result"
# )

# # ===== SENIOR SECONDARY ROUTES =====
# router.register(
#     r"senior-secondary/results",
#     SeniorSecondaryResultViewSet,
#     basename="senior-secondary-result",
# )
# router.register(
#     r"senior-secondary/session-results",
#     SeniorSecondarySessionResultViewSet,
#     basename="senior-secondary-session-result",
# )
# router.register(
#     r"senior-secondary/term-reports",
#     SeniorSecondaryTermReportViewSet,
#     basename="senior-secondary-term-report",
# )
# router.register(
#     r"senior-secondary/session-reports",
#     SeniorSecondarySessionReportViewSet,
#     basename="senior-secondary-session-report",
# )

# # ===== JUNIOR SECONDARY ROUTES =====
# router.register(
#     r"junior-secondary/results",
#     JuniorSecondaryResultViewSet,
#     basename="junior-secondary-result",
# )
# router.register(
#     r"junior-secondary/term-reports",
#     JuniorSecondaryTermReportViewSet,
#     basename="junior-secondary-term-report",
# )

# # ===== PRIMARY ROUTES =====
# router.register(r"primary/results", PrimaryResultViewSet, basename="primary-result")
# router.register(
#     r"primary/term-reports", PrimaryTermReportViewSet, basename="primary-term-report"
# )

# # ===== NURSERY ROUTES =====
# router.register(r"nursery/results", NurseryResultViewSet, basename="nursery-result")
# router.register(
#     r"nursery/term-reports", NurseryTermReportViewSet, basename="nursery-term-report"
# )

# # ===== SUPPORTING ROUTES =====
# router.register(r"result-sheets", ResultSheetViewSet, basename="result-sheet")
# router.register(
#     r"assessment-scores", AssessmentScoreViewSet, basename="assessment-score"
# )
# router.register(r"result-comments", ResultCommentViewSet, basename="result-comment")

# # URL patterns
# urlpatterns = [
#     path("", include(router.urls)),
#     # Optional: Add custom non-ViewSet routes here if needed
#     # path('custom-endpoint/', custom_view, name='custom-endpoint'),
# ]

# # Optional: Add app_name for namespacing
# app_name = "results"


from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # Base Configuration ViewSets
    GradingSystemViewSet,
    GradeViewSet,
    AssessmentTypeViewSet,
    ExamSessionViewSet,
    ScoringConfigurationViewSet,
    # Legacy/Base Result ViewSets
    StudentResultViewSet,
    StudentTermResultViewSet,
    # Senior Secondary ViewSets
    SeniorSecondaryResultViewSet,
    SeniorSecondarySessionResultViewSet,
    SeniorSecondaryTermReportViewSet,
    SeniorSecondarySessionReportViewSet,
    # Junior Secondary ViewSets
    JuniorSecondaryResultViewSet,
    JuniorSecondaryTermReportViewSet,
    # Primary ViewSets
    PrimaryResultViewSet,
    PrimaryTermReportViewSet,
    # Nursery ViewSets
    NurseryResultViewSet,
    NurseryTermReportViewSet,
    # Supporting ViewSets
    ResultSheetViewSet,
    AssessmentScoreViewSet,
    ResultCommentViewSet,
    ResultTemplateViewSet,
    # Bulk Operations & Analytics ViewSets
    BulkResultOperationsViewSet,
    ResultAnalyticsViewSet,
    ResultImportExportViewSet,
    ReportGenerationViewSet,
)

# Create the router
router = DefaultRouter()

# ===== BASE CONFIGURATION ROUTES =====
router.register(r"grading-systems", GradingSystemViewSet, basename="grading-system")
router.register(r"grades", GradeViewSet, basename="grade")
router.register(r"assessment-types", AssessmentTypeViewSet, basename="assessment-type")
router.register(r"exam-sessions", ExamSessionViewSet, basename="exam-session")
router.register(
    r"scoring-configurations",
    ScoringConfigurationViewSet,
    basename="scoring-configuration",
)

# ===== LEGACY/BASE RESULT ROUTES =====
router.register(r"student-results", StudentResultViewSet, basename="student-result")
router.register(
    r"student-term-results", StudentTermResultViewSet, basename="student-term-result"
)

# ===== SENIOR SECONDARY ROUTES =====
router.register(
    r"senior-secondary/results",
    SeniorSecondaryResultViewSet,
    basename="senior-secondary-result",
)
router.register(
    r"senior-secondary/session-results",
    SeniorSecondarySessionResultViewSet,
    basename="senior-secondary-session-result",
)
router.register(
    r"senior-secondary/term-reports",
    SeniorSecondaryTermReportViewSet,
    basename="senior-secondary-term-report",
)
router.register(
    r"senior-secondary/session-reports",
    SeniorSecondarySessionReportViewSet,
    basename="senior-secondary-session-report",
)

# ===== JUNIOR SECONDARY ROUTES =====
router.register(
    r"junior-secondary/results",
    JuniorSecondaryResultViewSet,
    basename="junior-secondary-result",
)
router.register(
    r"junior-secondary/term-reports",
    JuniorSecondaryTermReportViewSet,
    basename="junior-secondary-term-report",
)

# ===== PRIMARY ROUTES =====
router.register(r"primary/results", PrimaryResultViewSet, basename="primary-result")
router.register(
    r"primary/term-reports", PrimaryTermReportViewSet, basename="primary-term-report"
)

# ===== NURSERY ROUTES =====
router.register(r"nursery/results", NurseryResultViewSet, basename="nursery-result")
router.register(
    r"nursery/term-reports", NurseryTermReportViewSet, basename="nursery-term-report"
)

# ===== SUPPORTING ROUTES =====
router.register(r"result-sheets", ResultSheetViewSet, basename="result-sheet")
router.register(
    r"assessment-scores", AssessmentScoreViewSet, basename="assessment-score"
)
router.register(r"result-comments", ResultCommentViewSet, basename="result-comment")
router.register(r"result-templates", ResultTemplateViewSet, basename="result-template")

# ===== BULK OPERATIONS & ANALYTICS ROUTES =====
router.register(
    r"bulk-operations",
    BulkResultOperationsViewSet,
    basename="bulk-result-operations",
)
router.register(r"analytics", ResultAnalyticsViewSet, basename="result-analytics")
router.register(
    r"import-export", ResultImportExportViewSet, basename="result-import-export"
)
router.register(
    r"report-generation", ReportGenerationViewSet, basename="report-generation"
)

# URL patterns
urlpatterns = [
    path("", include(router.urls)),
]

# App namespace
app_name = "results"
