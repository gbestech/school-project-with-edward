# views.py
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Sum, Prefetch, Min, Max
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from django.db import transaction
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.utils import timezone
import logging

from .models import Subject, SUBJECT_CATEGORY_CHOICES, EDUCATION_LEVELS
# from classroom.models import GradeLevel  # Commented out to avoid circular import
from .serializers import (
    SubjectSerializer,
    SubjectListSerializer,
    SubjectCreateUpdateSerializer,
    SubjectEducationLevelSerializer,
)

# Import the separated viewsets
from .subjectviewset import SubjectViewSet
from .analyticalviewset import SubjectAnalyticsViewSet
from .subjectmanagementviewset import SubjectManagementViewSet

logger = logging.getLogger(__name__)


# ==============================================================================
# HEALTH CHECK ENDPOINT
# ==============================================================================
@api_view(["GET"])
def health_check(request):
    """
    Simple health check endpoint for monitoring API status
    """
    return Response(
        {
            "status": "healthy",
            "timestamp": timezone.now().isoformat(),
            "version": "v1.0",
            "service": "subjects-api",
        }
    )


from rest_framework.views import APIView


class SubjectByEducationLevelView(APIView):
    def get(self, request):
        level = request.query_params.get("level")
        if not level:
            return Response({"error": "Missing 'level' query parameter."}, status=400)

        subjects = Subject.objects.filter(education_level=level)
        serializer = SubjectEducationLevelSerializer(subjects, many=True)
        return Response(serializer.data)


# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================
def clear_subject_caches():
    """Helper function to clear all subject-related caches"""
    cache_keys = [
        "subjects_statistics",
        "subjects_statistics_v2",
        "subjects_by_category",
        "subjects_by_category_v2",
        "active_subjects_count",
    ]
    cache.delete_many(cache_keys)


# ==============================================================================
# EXPORTED VIEWSETS
# ==============================================================================
# Export the viewsets so they can be imported in urls.py
__all__ = [
    "SubjectViewSet",
    "SubjectAnalyticsViewSet",
    "SubjectManagementViewSet",
    "SubjectByEducationLevelView",
    "health_check",
    "clear_subject_caches",
]


# ==============================================================================
# VIEWSET CONFIGURATION
# ==============================================================================
"""
This file serves as the main entry point for all subject-related viewsets.

The viewsets are organized as follows:

1. SubjectViewSet (from subjectviewset.py):
   - Core CRUD operations for subjects
   - Filtering, searching, and pagination
   - Grade-level specific queries
   - Subject availability checks
   - Basic subject management

2. SubjectAnalyticsViewSet (from analyticalviewset.py):
   - Read-only analytics and reporting
   - Subject statistics and metrics
   - Category-based groupings
   - Performance analytics
   - Cached analytical data

3. SubjectManagementViewSet (from subjectmanagementviewset.py):
   - Admin-only operations
   - Bulk operations (update, delete, activate)
   - Advanced subject management
   - Audit logging and monitoring
   - Data export/import functions

URL Configuration:
- /api/v1/subjects/ -> SubjectViewSet
- /api/v1/analytics/subjects/ -> SubjectAnalyticsViewSet  
- /api/v1/management/subjects/ -> SubjectManagementViewSet
"""
