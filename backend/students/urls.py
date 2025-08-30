from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r"students", StudentViewSet, basename="student")

# URL patterns - using router for main CRUD operations
urlpatterns = [
    # Include router URLs for main CRUD operations
    path("", include(router.urls)),
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
