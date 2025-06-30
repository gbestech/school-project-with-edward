# subjects/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.urlpatterns import format_suffix_patterns

from .views import (
    SubjectViewSet,
    SubjectAnalyticsViewSet,
    SubjectManagementViewSet,
    SubjectByEducationLevelView,
    health_check,
)

# ==============================================================================
# ROUTER CONFIGURATION
# ==============================================================================

# Main router for core subject operations
router = DefaultRouter()
router.register(r"subjects", SubjectViewSet, basename="subject")

# Analytics router for read-only analytics endpoints
analytics_router = DefaultRouter()
analytics_router.register(
    r"subjects", SubjectAnalyticsViewSet, basename="subject-analytics"
)

# Management router for admin-only operations
management_router = DefaultRouter()
management_router.register(
    r"subjects", SubjectManagementViewSet, basename="subject-management"
)

# ==============================================================================
# URL PATTERNS
# ==============================================================================

app_name = "subjects"

urlpatterns = [
    # Health check endpoint
    path("health/", health_check, name="health-check"),
    # Core subject operations - /api/v1/subjects/
    path("", include(router.urls)),
    # Analytics endpoints - /api/v1/analytics/subjects/
    path("analytics/", include(analytics_router.urls)),
    # Management endpoints - /api/v1/management/subjects/
    path("management/", include(management_router.urls)),
]

# Apply format suffix patterns for content negotiation (.json, .xml, etc.)
urlpatterns = format_suffix_patterns(urlpatterns)

# ==============================================================================
# URL PATTERN DOCUMENTATION
# ==============================================================================
"""
URL Structure Overview:

1. CORE SUBJECT OPERATIONS (/api/v1/subjects/)
   - GET    /api/v1/subjects/                    # List all subjects
   - POST   /api/v1/subjects/                    # Create new subject
   - GET    /api/v1/subjects/{id}/               # Retrieve specific subject
   - PUT    /api/v1/subjects/{id}/               # Update specific subject
   - PATCH  /api/v1/subjects/{id}/               # Partial update subject
   - DELETE /api/v1/subjects/{id}/               # Delete specific subject
   
   Custom Actions (if implemented in SubjectViewSet):
   - GET    /api/v1/subjects/by_grade/{grade_id}/           # Subjects by grade
   - GET    /api/v1/subjects/available/                     # Available subjects
   - GET    /api/v1/subjects/search/                        # Advanced search
   - POST   /api/v1/subjects/{id}/check_prerequisites/      # Check prerequisites
   - GET    /api/v1/subjects/categories/                    # Subject categories

2. ANALYTICS OPERATIONS (/api/v1/analytics/subjects/)
   - GET    /api/v1/analytics/subjects/                     # Basic analytics list
   - GET    /api/v1/analytics/subjects/statistics/          # Overall statistics
   - GET    /api/v1/analytics/subjects/by_category/         # Category breakdown
   - GET    /api/v1/analytics/subjects/performance/         # Performance metrics
   - GET    /api/v1/analytics/subjects/trends/              # Usage trends
   - GET    /api/v1/analytics/subjects/reports/             # Generated reports

3. MANAGEMENT OPERATIONS (/api/v1/management/subjects/) - Admin Only
   - POST   /api/v1/management/subjects/bulk_create/        # Bulk create subjects
   - PATCH  /api/v1/management/subjects/bulk_update/        # Bulk update subjects
   - DELETE /api/v1/management/subjects/bulk_delete/        # Bulk delete subjects
   - POST   /api/v1/management/subjects/bulk_activate/      # Bulk activate/deactivate
   - GET    /api/v1/management/subjects/export/             # Export subject data
   - POST   /api/v1/management/subjects/import/             # Import subject data
   - GET    /api/v1/management/subjects/audit_log/          # Audit log
   - POST   /api/v1/management/subjects/validate/           # Validate subject data

4. UTILITY ENDPOINTS
   - GET    /api/v1/subjects/health/                        # Health check

Query Parameters (Available on most endpoints):
   - ?search=term                    # Text search
   - ?category=category_name         # Filter by category
   - ?education_level=level          # Filter by education level
   - ?is_active=true/false          # Filter by active status
   - ?grade_level=grade_id          # Filter by grade level
   - ?ordering=field_name           # Sort results
   - ?page=1&page_size=20           # Pagination

Examples:
   GET /api/v1/subjects/?search=math&category=core&is_active=true
   GET /api/v1/analytics/subjects/statistics/?education_level=secondary
   POST /api/v1/management/subjects/bulk_update/
"""
