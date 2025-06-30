from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r"students", StudentViewSet, basename="students")

# Additional URL patterns for specific functionality
urlpatterns = [
    # Include router URLs
    path("", include(router.urls)),
    # Custom endpoints for education level filtering
    path(
        "students/nursery/",
        StudentViewSet.as_view({"get": "nursery_students"}),
        name="nursery-students",
    ),
    path(
        "students/primary/",
        StudentViewSet.as_view({"get": "primary_students"}),
        name="primary-students",
    ),
    path(
        "students/secondary/",
        StudentViewSet.as_view({"get": "secondary_students"}),
        name="secondary-students",
    ),
    # Custom endpoints for class-specific filtering
    path(
        "students/by-class/<str:class_name>/",
        StudentViewSet.as_view({"get": "students_by_class"}),
        name="students-by-class",
    ),
    # Age-based filtering endpoints
    path(
        "students/by-age/<int:min_age>/<int:max_age>/",
        StudentViewSet.as_view({"get": "students_by_age_range"}),
        name="students-by-age-range",
    ),
    # Statistics endpoints
    path(
        "students/stats/",
        StudentViewSet.as_view({"get": "student_statistics"}),
        name="student-statistics",
    ),
    path(
        "students/stats/by-level/",
        StudentViewSet.as_view({"get": "statistics_by_level"}),
        name="student-statistics-by-level",
    ),
    # Bulk operations
    path(
        "students/bulk-update-level/",
        StudentViewSet.as_view({"post": "bulk_update_education_level"}),
        name="bulk-update-education-level",
    ),
    # Export endpoints
    path(
        "students/export/csv/",
        StudentViewSet.as_view({"get": "export_csv"}),
        name="export-students-csv",
    ),
    path(
        "students/export/nursery-csv/",
        StudentViewSet.as_view({"get": "export_nursery_csv"}),
        name="export-nursery-students-csv",
    ),
    # Emergency contact endpoints
    path(
        "students/<int:pk>/emergency-contacts/",
        StudentViewSet.as_view({"get": "emergency_contacts"}),
        name="student-emergency-contacts",
    ),
    # Parent-student relationship endpoints
    path(
        "students/<int:pk>/parents/",
        StudentViewSet.as_view({"get": "student_parents"}),
        name="student-parents",
    ),
    # Health and special requirements endpoints
    path(
        "students/with-medical-conditions/",
        StudentViewSet.as_view({"get": "students_with_medical_conditions"}),
        name="students-with-medical-conditions",
    ),
    path(
        "students/with-special-requirements/",
        StudentViewSet.as_view({"get": "students_with_special_requirements"}),
        name="students-with-special-requirements",
    ),
]

# Alternative URL patterns if you prefer a more RESTful approach
# You can uncomment this section and comment out the above if you prefer
# to use query parameters instead of separate endpoints

"""
# RESTful approach using query parameters
urlpatterns = [
    path('', include(router.urls)),
]

# Usage examples with query parameters:
# GET /api/students/?education_level=NURSERY
# GET /api/students/?student_class=NURSERY_1
# GET /api/students/?age_min=3&age_max=5
# GET /api/students/?has_medical_conditions=true
# GET /api/students/?has_special_requirements=true
"""
