from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Prefetch
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Subject, SUBJECT_CATEGORY_CHOICES, EDUCATION_LEVELS
import logging
from .serializers import (
    SubjectSerializer,
    SubjectListSerializer,
    SubjectCreateUpdateSerializer,
    SubjectGradeCheckSerializer,
    SubjectPrerequisiteSerializer,
    SubjectEducationLevelSerializer,
)
from classroom.models import GradeLevel

logger = logging.getLogger(__name__)


class SubjectViewSet(viewsets.ModelViewSet):
    """
    Core ViewSet for basic Subject CRUD operations, filtering, and searching.

    Responsibilities:
    - Standard CRUD operations (list, create, retrieve, update, delete)
    - Basic filtering and searching
    - Subject availability checks
    - Grade-level specific queries
    - Search suggestions

    URL Pattern: /api/subjects/
    """

    queryset = Subject.objects.all()
    permission_classes = [IsAuthenticated]

    # Filtering and searching
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = {
        "category": ["exact", "in"],
        "education_levels": ["exact", "in", "contains"],
        "is_compulsory": ["exact"],
        "is_active": ["exact"],
        "is_core": ["exact"],
        "is_discontinued": ["exact"],
        "credit_hours": ["exact", "gte", "lte"],
        "practical_hours": ["exact", "gte", "lte"],
        "pass_mark": ["exact", "gte", "lte"],
        "has_practical": ["exact"],
        "requires_lab": ["exact"],
        "requires_special_equipment": ["exact"],
        "introduced_year": ["exact", "gte", "lte"],
    }
    search_fields = ["name", "code", "description", "equipment_notes"]
    ordering_fields = ["name", "code", "category", "credit_hours", "created_at"]
    ordering = ["category", "name"]

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        serializer_map = {
            "list": SubjectListSerializer,
            "create": SubjectCreateUpdateSerializer,
            "update": SubjectCreateUpdateSerializer,
            "partial_update": SubjectCreateUpdateSerializer,
            "check_availability": SubjectGradeCheckSerializer,
            "prerequisites": SubjectPrerequisiteSerializer,
            "education_levels": SubjectEducationLevelSerializer,
        }
        return serializer_map.get(self.action, SubjectSerializer)

    def get_permissions(self):
        """Set permissions based on action"""
        admin_actions = ["create", "update", "partial_update", "destroy"]
        if self.action in admin_actions:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        """Optimized queryset with smart prefetching"""
        queryset = Subject.objects.select_related().prefetch_related(
            "grade_levels",
            "prerequisites",
            Prefetch(
                "prerequisites", queryset=Subject.objects.only("id", "name", "code")
            ),
        )

        # Apply your existing filtering logic here
        # (education_level, grade_level, available_only, etc.)
        # ... [Keep your existing filtering logic] ...

        return queryset

    @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        """Enhanced list with metadata"""
        response = super().list(request, *args, **kwargs)
        if hasattr(response, "data") and isinstance(response.data, dict):
            if "results" in response.data:
                response.data["metadata"] = {
                    "total_categories": len(SUBJECT_CATEGORY_CHOICES),
                    "filters_applied": bool(request.query_params),
                }
        return response

    def perform_create(self, serializer):
        """Create with logging and cache invalidation"""
        with transaction.atomic():
            subject = serializer.save()
            cache.delete("subjects_cache_v1")  # Clear relevant caches
            logger.info(f"Subject '{subject.name}' created by {self.request.user}")

    def perform_update(self, serializer):
        """Update with logging and cache invalidation"""
        with transaction.atomic():
            old_name = serializer.instance.name
            subject = serializer.save()
            cache.delete("subjects_cache_v1")
            logger.info(f"Subject '{old_name}' updated by {self.request.user}")

    def perform_destroy(self, instance):
        """Smart delete with soft-delete logic"""
        with transaction.atomic():
            if (
                hasattr(instance, "student_subjects")
                and instance.student_subjects.exists()
            ):
                # Soft delete for subjects with dependencies
                instance.is_active = False
                instance.is_discontinued = True
                instance.save()
                logger.info(
                    f"Subject '{instance.name}' soft deleted by {self.request.user}"
                )
            else:
                # Hard delete if no dependencies
                super().perform_destroy(instance)
                logger.info(
                    f"Subject '{instance.name}' permanently deleted by {self.request.user}"
                )
            cache.delete("subjects_cache_v1")

    @action(detail=False, methods=["get"])
    def by_category(self, request):
        """Get subjects grouped by category"""
        cache_key = "subjects_by_category_v3"
        result = cache.get(cache_key)

        if not result:
            result = {}
            for category, display in SUBJECT_CATEGORY_CHOICES:
                subjects = (
                    self.get_queryset()
                    .filter(category=category, is_active=True, is_discontinued=False)
                    .order_by("name")
                )

                result[category] = {
                    "display_name": display,
                    "count": subjects.count(),
                    "subjects": SubjectListSerializer(subjects, many=True).data,
                }
            cache.set(cache_key, result, 60 * 30)

        return Response(result)

    @action(detail=False, methods=["get"])
    def for_grade(self, request):
        """Get subjects for specific grade level"""
        grade_level = request.query_params.get("grade")
        if not grade_level:
            return Response({"error": "grade parameter required"}, status=400)

        try:
            grade = int(grade_level)
            grade_obj = GradeLevel.objects.get(order=grade)
            subjects = (
                self.get_queryset()
                .filter(grade_levels=grade_obj, is_active=True)
                .order_by("category", "name")
            )
        except (ValueError, GradeLevel.DoesNotExist):
            return Response({"error": "Invalid grade level"}, status=400)

        compulsory = subjects.filter(is_compulsory=True)
        elective = subjects.filter(is_compulsory=False)

        return Response(
            {
                "grade_level": grade,
                "grade_name": grade_obj.name,
                "summary": {"total_subjects": subjects.count()},
                "compulsory": {
                    "count": compulsory.count(),
                    "subjects": SubjectListSerializer(compulsory, many=True).data,
                },
                "elective": {
                    "count": elective.count(),
                    "subjects": SubjectListSerializer(elective, many=True).data,
                },
            }
        )

    @action(detail=True, methods=["post"])
    def check_availability(self, request, pk=None):
        """Check subject availability for grade level"""
        subject = self.get_object()
        serializer = SubjectGradeCheckSerializer(data=request.data)

        if serializer.is_valid():
            grade_level_id = serializer.validated_data["grade_level_id"]
            try:
                grade_level = GradeLevel.objects.get(id=grade_level_id)
                is_available = subject.grade_levels.filter(id=grade_level_id).exists()

                return Response(
                    {
                        "subject": {
                            "id": subject.id,
                            "name": subject.name,
                            "code": subject.code,
                        },
                        "grade_level": {"id": grade_level.id, "name": grade_level.name},
                        "is_available": is_available
                        and subject.is_active
                        and not subject.is_discontinued,
                        "subject_info": {
                            "is_compulsory": subject.is_compulsory,
                            "credit_hours": subject.credit_hours,
                            "has_practical": subject.has_practical,
                        },
                    }
                )
            except GradeLevel.DoesNotExist:
                return Response({"error": "Grade level not found"}, status=404)

        return Response(serializer.errors, status=400)

    @action(detail=False, methods=["get"])
    def search_suggestions(self, request):
        """Get search suggestions for autocomplete"""
        query = request.query_params.get("q", "").strip()
        if len(query) < 2:
            return Response({"suggestions": []})

        subjects = Subject.objects.filter(
            Q(name__icontains=query) | Q(code__icontains=query),
            is_active=True,
            is_discontinued=False,
        ).values("id", "name", "code", "category")[:10]

        suggestions = [
            {
                "id": s["id"],
                "label": f"{s['name']} ({s['code']})",
                "name": s["name"],
                "code": s["code"],
                "category": dict(SUBJECT_CATEGORY_CHOICES).get(s["category"]),
            }
            for s in subjects
        ]

        return Response({"query": query, "suggestions": suggestions})

    @action(detail=True, methods=["get"])
    def prerequisites(self, request, pk=None):
        """Get subject prerequisites"""
        subject = self.get_object()
        serializer = SubjectPrerequisiteSerializer(
            subject, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def education_levels(self, request, pk=None):
        """Get education level compatibility"""
        subject = self.get_object()
        serializer = SubjectEducationLevelSerializer(
            subject, context={"request": request}
        )
        return Response(serializer.data)
