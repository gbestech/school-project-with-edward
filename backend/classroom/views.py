# views.py
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Sum, Prefetch, Min, Max
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from django.db import transaction
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
import logging

from utils.section_filtering import AutoSectionFilterMixin, SectionFilterMixin
from academics.models import AcademicSession, Term
from subject.models import (
    Subject,
    SUBJECT_CATEGORY_CHOICES,
    EDUCATION_LEVELS,
    NURSERY_LEVELS,
    SS_SUBJECT_TYPES,
)
from .models import (
    GradeLevel,
    Classroom,
    ClassroomTeacherAssignment,
    StudentEnrollment,
    ClassSchedule,
    Section,
    Stream,
)
from students.models import Student
from teacher.models import Teacher
from subject.serializers import (
    SubjectSerializer,
    SubjectListSerializer,
    SubjectCreateUpdateSerializer,
    SubjectEducationLevelSerializer,
)
from academics.serializers import AcademicSessionSerializer, TermSerializer
from .serializers import (
    ClassroomSerializer,
    ClassroomDetailSerializer,
    ClassroomTeacherAssignmentSerializer,
    StudentEnrollmentSerializer,
    ClassScheduleSerializer,
    GradeLevelSerializer,
    SectionSerializer,
    TeacherSerializer,
    StreamSerializer,
)

logger = logging.getLogger(__name__)


# ==============================================================================
# BASIC VIEWSETS FOR CLASSROOM APP
# ==============================================================================


class GradeLevelViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """ViewSet for GradeLevel model"""

    permission_classes = []
    serializer_class = GradeLevelSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["education_level", "is_active"]
    search_fields = ["name", "education_level"]
    ordering_fields = ["order", "name"]

    def get_queryset(self):
        """Apply automatic section filtering"""
        queryset = super().get_queryset()
        return queryset

    @action(detail=True, methods=["get"])
    def subjects(self, request, pk=None):
        grade = self.get_object()
        subjects = Subject.objects.filter(grade_levels=grade)
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def students(self, request, pk=None):
        return Response({"message": "Students endpoint not implemented yet"})

    @action(detail=True, methods=["get"])
    def classrooms(self, request, pk=None):
        return Response({"message": "Classrooms endpoint not implemented yet"})

    @action(detail=True, methods=["get"])
    def sections(self, request, pk=None):
        grade = self.get_object()
        sections = Section.objects.filter(grade_level=grade)
        serializer = SectionSerializer(sections, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def nursery_grades(self, request):
        grades = GradeLevel.objects.filter(education_level="NURSERY")
        serializer = GradeLevelSerializer(grades, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def primary_grades(self, request):
        grades = GradeLevel.objects.filter(education_level="PRIMARY")
        serializer = GradeLevelSerializer(grades, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def junior_secondary_grades(self, request):
        grades = GradeLevel.objects.filter(education_level="JUNIOR_SECONDARY")
        serializer = GradeLevelSerializer(grades, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def senior_secondary_grades(self, request):
        grades = GradeLevel.objects.filter(education_level="SENIOR_SECONDARY")
        serializer = GradeLevelSerializer(grades, many=True)
        return Response(serializer.data)


class SectionViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """ViewSet for Section model"""

    permission_classes = []
    serializer_class = SectionSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["grade_level", "grade_level__education_level", "is_active"]
    search_fields = ["name", "grade_level__name"]
    ordering_fields = ["name", "grade_level__order"]

    def get_queryset(self):
        """Apply section filtering"""
        queryset = super().get_queryset()
        return Section.objects.select_related("grade_level").all()


class StreamViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """ViewSet for Stream model"""

    permission_classes = []
    serializer_class = StreamSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["stream_type", "is_active"]
    search_fields = ["name", "code", "description"]
    ordering_fields = ["name", "stream_type", "created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset

    @action(detail=False, methods=["get"])
    def by_type(self, request):
        stream_type = request.query_params.get("stream_type")
        if stream_type:
            streams = Stream.objects.filter(stream_type=stream_type, is_active=True)
        else:
            streams = Stream.objects.filter(is_active=True)
        serializer = StreamSerializer(streams, many=True)
        return Response(serializer.data)


class TeacherViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """ViewSet for Teacher model"""

    permission_classes = [IsAuthenticated]
    serializer_class = TeacherSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["is_active", "specialization"]
    search_fields = ["user__first_name", "user__last_name", "employee_id"]
    ordering_fields = ["user__first_name", "user__last_name", "hire_date"]

    def get_queryset(self):
        queryset = super().get_queryset()
        return Teacher.objects.select_related("user").all()

    @action(detail=True, methods=["get"])
    def classes(self, request, pk=None):
        teacher = self.get_object()
        primary_classes = teacher.primary_classes.all()
        assigned_classes = teacher.assigned_classes.all()

        primary_serializer = ClassroomSerializer(primary_classes, many=True)
        assigned_serializer = ClassroomSerializer(assigned_classes, many=True)

        return Response(
            {
                "primary_classes": primary_serializer.data,
                "assigned_classes": assigned_serializer.data,
            }
        )

    @action(detail=True, methods=["get"])
    def subjects(self, request, pk=None):
        teacher = self.get_object()
        assignments = teacher.classroomteacherassignment_set.filter(
            is_active=True
        ).select_related("subject")
        subjects = [assignment.subject for assignment in assignments]
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def schedule(self, request, pk=None):
        teacher = self.get_object()
        schedules = ClassSchedule.objects.filter(
            teacher=teacher, is_active=True
        ).select_related("classroom", "subject")
        serializer = ClassScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def workload(self, request, pk=None):
        teacher = self.get_object()
        primary_classes_count = teacher.primary_classes.count()
        assigned_classes_count = teacher.assigned_classes.count()
        total_subjects = teacher.classroomteacherassignment_set.filter(
            is_active=True
        ).count()
        return Response(
            {
                "primary_classes_count": primary_classes_count,
                "assigned_classes_count": assigned_classes_count,
                "total_subjects": total_subjects,
                "total_workload": primary_classes_count + assigned_classes_count,
            }
        )


class StudentViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """ViewSet for Student model"""

    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer  # Placeholder

    def get_queryset(self):
        queryset = super().get_queryset()
        return []  # Placeholder

    @action(detail=True, methods=["get"])
    def current_class(self, request, pk=None):
        return Response({"message": "Current class endpoint not implemented yet"})

    @action(detail=True, methods=["get"])
    def subjects(self, request, pk=None):
        return Response({"message": "Subjects endpoint not implemented yet"})

    @action(detail=True, methods=["get"])
    def schedule(self, request, pk=None):
        return Response({"message": "Schedule endpoint not implemented yet"})

    @action(detail=True, methods=["get"])
    def enrollment_history(self, request, pk=None):
        return Response({"message": "Enrollment history endpoint not implemented yet"})


class SubjectViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """ViewSet for Subject model"""

    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["category", "is_active", "is_compulsory"]
    search_fields = ["name", "code", "description"]
    ordering_fields = ["name", "code", "subject_order"]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset

    @action(detail=False, methods=["get"])
    def by_category(self, request):
        return Response({"message": "By category endpoint not implemented yet"})

    @action(detail=False, methods=["get"])
    def by_education_level(self, request):
        return Response({"message": "By education level endpoint not implemented yet"})

    @action(detail=False, methods=["get"])
    def nursery_subjects(self, request):
        subjects = Subject.objects.filter(education_levels__contains=["NURSERY"])
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def senior_secondary_subjects(self, request):
        subjects = Subject.objects.filter(
            education_levels__contains=["SENIOR_SECONDARY"]
        )
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def cross_cutting_subjects(self, request):
        subjects = Subject.objects.filter(is_cross_cutting=True)
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def for_grade(self, request):
        return Response({"message": "For grade endpoint not implemented yet"})

    @action(detail=False, methods=["get"])
    def search_suggestions(self, request):
        return Response({"message": "Search suggestions endpoint not implemented yet"})

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        return Response({"message": "Statistics endpoint not implemented yet"})

    @action(detail=True, methods=["post"])
    def check_availability(self, request, pk=None):
        return Response({"message": "Check availability endpoint not implemented yet"})

    @action(detail=True, methods=["get"])
    def prerequisites(self, request, pk=None):
        return Response({"message": "Prerequisites endpoint not implemented yet"})

    @action(detail=True, methods=["get"])
    def education_levels(self, request, pk=None):
        return Response({"message": "Education levels endpoint not implemented yet"})


class SubjectAnalyticsViewSet(AutoSectionFilterMixin, viewsets.ReadOnlyModelViewSet):
    """ViewSet for Subject analytics (read-only)"""

    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset


class SubjectManagementViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """ViewSet for Subject management (admin only)"""

    permission_classes = [IsAdminUser]
    serializer_class = SubjectSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset


class ClassroomTeacherAssignmentViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """ViewSet for ClassroomTeacherAssignment model"""

    permission_classes = [IsAuthenticated]
    serializer_class = ClassroomTeacherAssignmentSerializer

    def get_queryset(self):
        # Apply section filtering
        queryset = super().get_queryset()
        return ClassroomTeacherAssignment.objects.select_related(
            "classroom", "teacher__user", "subject"
        ).filter(is_active=True)

    def create(self, request, *args, **kwargs):
        """Override create to add debugging"""
        logger.debug("Received data: %s", request.data)
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def by_academic_year(self, request):
        """Get assignments by academic session"""
        academic_session_id = request.query_params.get("academic_session_id")
        if not academic_session_id:
            return Response(
                {"error": "academic_session_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assignments = self.get_queryset().filter(
            classroom__academic_session_id=academic_session_id
        )
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_subject(self, request):
        """Get assignments by subject"""
        subject_id = request.query_params.get("subject_id")
        if not subject_id:
            return Response(
                {"error": "subject_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assignments = self.get_queryset().filter(subject_id=subject_id)
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def workload_analysis(self, request):
        """Get workload analysis"""
        teacher_workload = (
            self.get_queryset()
            .values("teacher__user__first_name", "teacher__user__last_name")
            .annotate(
                total_assignments=Count("id"),
                total_classrooms=Count("classroom", distinct=True),
                total_subjects=Count("subject", distinct=True),
            )
        )

        return Response(
            {
                "teacher_workload": teacher_workload,
                "total_assignments": self.get_queryset().count(),
                "total_teachers": self.get_queryset()
                .values("teacher")
                .distinct()
                .count(),
                "total_classrooms": self.get_queryset()
                .values("classroom")
                .distinct()
                .count(),
                "total_subjects": self.get_queryset()
                .values("subject")
                .distinct()
                .count(),
            }
        )


# ================================
# StudentEnrollment ViewSet
# ================================
class StudentEnrollmentViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """ViewSet for StudentEnrollment model"""

    permission_classes = [IsAuthenticated]
    serializer_class = StudentEnrollmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return StudentEnrollment.objects.select_related(
            "student__user", "classroom"
        ).filter(is_active=True)

    @action(detail=False, methods=["get"])
    def by_academic_year(self, request):
        """Get enrollments by academic year"""
        academic_year_id = request.query_params.get("academic_year_id")
        if not academic_year_id:
            return Response(
                {"error": "academic_year_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        enrollments = self.get_queryset().filter(
            classroom__academic_year_id=academic_year_id
        )
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_grade(self, request):
        """Get enrollments by grade"""
        grade_level_id = request.query_params.get("grade_level_id")
        if not grade_level_id:
            return Response(
                {"error": "grade_level_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        enrollments = self.get_queryset().filter(
            classroom__section__grade_level_id=grade_level_id
        )
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        """Get enrollment statistics"""
        qs = self.get_queryset()
        total_enrollments = qs.count()
        active_students = qs.filter(student__is_active=True).count()

        # By education level
        nursery_enrollments = qs.filter(
            classroom__section__grade_level__education_level="NURSERY"
        ).count()
        primary_enrollments = qs.filter(
            classroom__section__grade_level__education_level="PRIMARY"
        ).count()
        secondary_enrollments = qs.filter(
            classroom__section__grade_level__education_level="SECONDARY"
        ).count()

        return Response(
            {
                "total_enrollments": total_enrollments,
                "active_students": active_students,
                "by_education_level": {
                    "nursery": nursery_enrollments,
                    "primary": primary_enrollments,
                    "secondary": secondary_enrollments,
                },
            }
        )


# ================================
# ClassSchedule ViewSet (Placeholder)
# ================================
class ClassScheduleViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """ViewSet for ClassSchedule model"""

    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer  # Placeholder

    def get_queryset(self):
        queryset = super().get_queryset()
        return []  # Implement when model is available

    @action(detail=False, methods=["get"])
    def by_classroom(self, request):
        return Response({"message": "By classroom endpoint not implemented yet"})

    @action(detail=False, methods=["get"])
    def by_teacher(self, request):
        return Response({"message": "By teacher endpoint not implemented yet"})

    @action(detail=False, methods=["get"])
    def by_subject(self, request):
        return Response({"message": "By subject endpoint not implemented yet"})

    @action(detail=False, methods=["get"])
    def conflicts(self, request):
        return Response({"message": "Conflicts endpoint not implemented yet"})

    @action(detail=False, methods=["get"])
    def daily_schedule(self, request):
        return Response({"message": "Daily schedule endpoint not implemented yet"})

    @action(detail=False, methods=["get"])
    def weekly_schedule(self, request):
        return Response({"message": "Weekly schedule endpoint not implemented yet"})


# ================================
# HEALTH CHECK ENDPOINT
# ================================
@api_view(["GET"])
def health_check(request):
    """Enhanced health check endpoint"""
    try:
        total_subjects = Subject.objects.count()
        active_subjects = Subject.objects.filter(is_active=True).count()

        # Cache check
        cache_key = "health_check_test"
        cache.set(cache_key, "test", 10)
        cache_working = cache.get(cache_key) == "test"
        cache.delete(cache_key)

        return Response(
            {
                "status": "healthy",
                "timestamp": timezone.now().isoformat(),
                "version": "v2.0",
                "service": "nigerian-education-subjects-api",
                "system_info": {
                    "database": {
                        "connected": True,
                        "total_subjects": total_subjects,
                        "active_subjects": active_subjects,
                    },
                    "cache": {
                        "connected": cache_working,
                        "backend": getattr(settings, "CACHES", {})
                        .get("default", {})
                        .get("BACKEND", "unknown"),
                    },
                    "education_system": {
                        "total_education_levels": len(EDUCATION_LEVELS),
                        "total_subject_categories": len(SUBJECT_CATEGORY_CHOICES),
                        "nursery_levels": len(NURSERY_LEVELS),
                        "ss_subject_types": len(SS_SUBJECT_TYPES),
                    },
                },
                "endpoints": {
                    "subjects": "/api/v1/subjects/",
                    "analytics": "/api/v1/analytics/subjects/",
                    "management": "/api/v1/management/subjects/",
                    "health": "/api/v1/health/",
                },
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return Response(
            {
                "status": "unhealthy",
                "timestamp": timezone.now().isoformat(),
                "error": str(e),
                "service": "nigerian-education-subjects-api",
            },
            status=500,
        )


# ================================
# SubjectByEducationLevel View
# ================================
class SubjectByEducationLevelView(APIView):
    """Enhanced view for retrieving subjects by education level"""

    permission_classes = [IsAuthenticated]

    @method_decorator(cache_page(60 * 10))
    def get(self, request):
        level = request.query_params.get("level")
        if not level:
            return Response(
                {
                    "error": "Missing 'level' query parameter.",
                    "valid_levels": [code for code, _ in EDUCATION_LEVELS],
                    "example": "/api/v1/subjects/by-level/?level=PRIMARY",
                },
                status=400,
            )

        valid_levels = [code for code, _ in EDUCATION_LEVELS]
        if level not in valid_levels:
            return Response(
                {
                    "error": f"Invalid education level: {level}",
                    "valid_levels": valid_levels,
                },
                status=400,
            )

        queryset = Subject.objects.filter(
            education_levels__contains=[level]
        ).prefetch_related("grade_levels", "prerequisites")

        active_only = request.query_params.get("active_only", "true").lower() == "true"
        include_discontinued = (
            request.query_params.get("include_discontinued", "false").lower() == "true"
        )

        if active_only:
            queryset = queryset.filter(is_active=True)
        if not include_discontinued:
            queryset = queryset.filter(is_discontinued=False)

        nursery_level = request.query_params.get("nursery_level")
        if nursery_level and level == "NURSERY":
            valid_nursery_levels = [code for code, _ in NURSERY_LEVELS]
            if nursery_level in valid_nursery_levels:
                queryset = queryset.filter(nursery_levels__contains=[nursery_level])

        ss_type = request.query_params.get("ss_type")
        if ss_type and level == "SENIOR_SECONDARY":
            valid_ss_types = [code for code, _ in SS_SUBJECT_TYPES]
            if ss_type in valid_ss_types:
                queryset = queryset.filter(ss_subject_type=ss_type)

        category = request.query_params.get("category")
        if category:
            valid_categories = [code for code, _ in SUBJECT_CATEGORY_CHOICES]
            if category in valid_categories:
                queryset = queryset.filter(category=category)

        queryset = queryset.order_by("category", "subject_order", "name")
        serializer = SubjectEducationLevelSerializer(
            queryset, many=True, context={"request": request}
        )

        level_name = dict(EDUCATION_LEVELS).get(level, level)
        response_data = {
            "education_level": {"code": level, "name": level_name},
            "filters_applied": {
                "active_only": active_only,
                "include_discontinued": include_discontinued,
                "nursery_level": nursery_level,
                "ss_type": ss_type,
                "category": category,
            },
            "summary": {
                "total_count": queryset.count(),
                "compulsory_count": queryset.filter(is_compulsory=True).count(),
                "elective_count": queryset.filter(is_compulsory=False).count(),
                "with_practicals": queryset.filter(has_practical=True).count(),
                "activity_based": queryset.filter(is_activity_based=True).count(),
                "cross_cutting": queryset.filter(is_cross_cutting=True).count(),
                "requires_specialist": queryset.filter(
                    requires_specialist_teacher=True
                ).count(),
            },
            "subjects": serializer.data,
        }

        if level == "NURSERY":
            response_data["nursery_breakdown"] = self._get_nursery_breakdown(queryset)
        elif level == "SENIOR_SECONDARY":
            response_data["ss_breakdown"] = self._get_ss_breakdown(queryset)

        return Response(response_data)

    def _get_nursery_breakdown(self, queryset):
        breakdown = {}
        for level_code, level_name in NURSERY_LEVELS:
            level_subjects = queryset.filter(nursery_levels__contains=[level_code])
            breakdown[level_code] = {
                "name": level_name,
                "count": level_subjects.count(),
                "activity_based_count": level_subjects.filter(
                    is_activity_based=True
                ).count(),
            }
        return breakdown

    def _get_ss_breakdown(self, queryset):
        breakdown = {}
        for type_code, type_name in SS_SUBJECT_TYPES:
            type_subjects = queryset.filter(ss_subject_type=type_code)
            breakdown[type_code] = {
                "name": type_name,
                "count": type_subjects.count(),
                "compulsory_count": type_subjects.filter(is_compulsory=True).count(),
            }
        return breakdown


# ==============================================================================
# QUICK SEARCH VIEW
# ==============================================================================
class SubjectQuickSearchView(APIView):
    """
    Lightweight search endpoint for autocomplete and quick lookups.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Quick search for subjects with minimal data transfer.

        Query Parameters:
        - q: Search query (minimum 2 characters)
        - limit: Maximum results (default: 10, max: 25)
        - education_level: Filter by education level
        - category: Filter by category
        """
        query = request.query_params.get("q", "").strip()
        if len(query) < 2:
            return Response(
                {
                    "error": "Search query must be at least 2 characters long",
                    "suggestions": [],
                }
            )

        # Parse limit
        try:
            limit = min(int(request.query_params.get("limit", 10)), 25)
        except ValueError:
            limit = 10

        # Build search queryset
        search_filter = (
            Q(name__icontains=query)
            | Q(short_name__icontains=query)
            | Q(code__icontains=query)
            | Q(description__icontains=query)
        )
        queryset = Subject.objects.filter(
            search_filter, is_active=True, is_discontinued=False
        )

        # Additional filters
        education_level = request.query_params.get("education_level")
        if education_level:
            queryset = queryset.filter(education_levels__contains=[education_level])

        category = request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        # Limit results
        subjects = queryset.values(
            "id",
            "name",
            "short_name",
            "code",
            "category",
            "education_levels",
            "is_compulsory",
            "is_cross_cutting",
            "is_activity_based",
            "credit_hours",
        ).order_by("name")[:limit]

        # Format results
        suggestions = []
        for subject in subjects:
            display_name = subject["short_name"] or subject["name"]
            # Build education levels display
            education_display = [
                dict(EDUCATION_LEVELS).get(level, level)
                for level in subject.get("education_levels", [])
            ]
            # Build badges
            badges = []
            if subject["is_compulsory"]:
                badges.append("Compulsory")
            if subject["is_cross_cutting"]:
                badges.append("Cross-cutting")
            if subject["is_activity_based"]:
                badges.append("Activity-based")

            suggestions.append(
                {
                    "id": subject["id"],
                    "name": subject["name"],
                    "display_name": display_name,
                    "code": subject["code"],
                    "label": f"{display_name} ({subject['code']})",
                    "category": dict(SUBJECT_CATEGORY_CHOICES).get(subject["category"]),
                    "education_levels": ", ".join(education_display),
                    "credit_hours": subject["credit_hours"],
                    "badges": badges,
                }
            )

        return Response(
            {
                "query": query,
                "count": len(suggestions),
                "total_found": queryset.count(),
                "suggestions": suggestions,
            }
        )


# =====================================================================
# SUBJECT COMPARISON VIEW
# =====================================================================
class SubjectComparisonView(APIView):
    """
    Compare multiple subjects side by side.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Compare subjects by their IDs.

        Request body:
        {
            "subject_ids": [1, 2, 3, ...]
        }
        """
        subject_ids = request.data.get("subject_ids", [])

        if not isinstance(subject_ids, list) or not subject_ids:
            return Response(
                {"error": "Please provide a list of subject_ids in the request body"},
                status=400,
            )

        if len(subject_ids) > 5:
            return Response(
                {"error": "Maximum 5 subjects can be compared at once"},
                status=400,
            )

        subjects = Subject.objects.filter(
            id__in=subject_ids, is_active=True
        ).prefetch_related("prerequisites", "grade_levels")

        if not subjects.exists():
            return Response(
                {"error": "No valid subjects found for the provided IDs"}, status=404
            )

        comparison_data = []
        for subject in subjects:
            comparison_data.append(
                {
                    "id": subject.id,
                    "name": subject.name,
                    "short_name": subject.short_name,
                    "code": subject.code,
                    "category": {
                        "code": subject.category,
                        "name": subject.get_category_display(),
                        "icon": subject.get_category_display_with_icon(),
                    },
                    "education_levels": {
                        "codes": subject.education_levels,
                        "display": subject.education_levels_display,
                    },
                    "academic_info": {
                        "is_compulsory": subject.is_compulsory,
                        "is_core": subject.is_core,
                        "is_cross_cutting": subject.is_cross_cutting,
                        "credit_hours": subject.credit_hours,
                        "practical_hours": subject.practical_hours,
                        "total_weekly_hours": subject.total_weekly_hours,
                        "pass_mark": subject.pass_mark,
                    },
                    "practical_requirements": {
                        "has_practical": subject.has_practical,
                        "requires_lab": subject.requires_lab,
                        "requires_special_equipment": subject.requires_special_equipment,
                        "equipment_notes": subject.equipment_notes,
                    },
                    "teaching_requirements": {
                        "requires_specialist_teacher": subject.requires_specialist_teacher,
                    },
                    "assessment": {
                        "has_continuous_assessment": subject.has_continuous_assessment,
                        "has_final_exam": subject.has_final_exam,
                    },
                    "prerequisites": {
                        "count": subject.prerequisites.count(),
                        "subjects": [
                            {
                                "id": prereq.id,
                                "name": prereq.display_name,
                                "code": prereq.code,
                            }
                            for prereq in subject.prerequisites.all()
                        ],
                    },
                    "special_attributes": {
                        "is_activity_based": subject.is_activity_based,
                        "nursery_levels": (
                            subject.nursery_levels_display
                            if getattr(subject, "is_nursery_subject", False)
                            else None
                        ),
                        "ss_subject_type": (
                            subject.get_ss_subject_type_display()
                            if subject.ss_subject_type
                            else None
                        ),
                    },
                }
            )

        return Response(
            {
                "comparison_count": len(comparison_data),
                "subjects": comparison_data,
                "summary": {
                    "total_credit_hours": sum(s.credit_hours for s in subjects),
                    "total_practical_hours": sum(s.practical_hours for s in subjects),
                    "subjects_with_practicals": sum(
                        1 for s in subjects if s.has_practical
                    ),
                    "compulsory_subjects": sum(1 for s in subjects if s.is_compulsory),
                    "cross_cutting_subjects": sum(
                        1 for s in subjects if s.is_cross_cutting
                    ),
                },
            }
        )


# =====================================================================
# CACHE UTILITY
# =====================================================================
def clear_subject_caches():
    """
    Enhanced helper function to clear all subject-related caches.
    """
    cache_keys = [
        "subjects_statistics",
        "subjects_statistics_v2",
        "subjects_by_category",
        "subjects_by_category_v2",
        "active_subjects_count",
        "subjects_cache_v1",
        "subjects_by_category_v3",
        "subjects_by_education_level_v2",
        "nursery_subjects_v1",
        "ss_subjects_by_type_v1",
        "cross_cutting_subjects_v1",
        "subject_statistics_v1",
        "subject_*",
        "education_level_*",
        "nursery_*",
        "ss_*",
    ]

    try:
        cache.delete_many(cache_keys)
        if hasattr(cache, "delete_pattern"):
            for pattern in ["subject_*", "education_*", "nursery_*", "ss_*"]:
                cache.delete_pattern(pattern)
        logger.info("Subject caches cleared successfully")
        return True
    except Exception as e:
        logger.error(f"Error clearing subject caches: {str(e)}")
        return False


@api_view(["POST"])
@permission_classes([IsAdminUser])
def clear_caches_endpoint(request):
    """
    API endpoint to manually clear caches (admin only).
    """
    success = clear_subject_caches()
    status_code = 200 if success else 500
    return Response(
        {
            "status": "success" if success else "error",
            "message": (
                "Subject caches cleared successfully"
                if success
                else "Failed to clear some caches"
            ),
            "timestamp": timezone.now().isoformat(),
        },
        status=status_code,
    )


# =====================================================================
# SYSTEM INFO ENDPOINT
# =====================================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def system_info(request):
    """
    Get comprehensive system information about the subjects API.
    """
    try:
        total_subjects = Subject.objects.count()
        active_subjects = Subject.objects.filter(is_active=True).count()
        discontinued_subjects = Subject.objects.filter(is_discontinued=True).count()

        education_stats = {
            code: {
                "name": name,
                "count": Subject.objects.filter(
                    education_levels__contains=[code], is_active=True
                ).count(),
            }
            for code, name in EDUCATION_LEVELS
        }

        category_stats = {
            code: {
                "name": name,
                "count": Subject.objects.filter(category=code, is_active=True).count(),
            }
            for code, name in SUBJECT_CATEGORY_CHOICES
        }

        return Response(
            {
                "system": {
                    "service_name": "Nigerian Education Subjects API",
                    "version": "v2.0",
                    "timestamp": timezone.now().isoformat(),
                },
                "database": {
                    "total_subjects": total_subjects,
                    "active_subjects": active_subjects,
                    "discontinued_subjects": discontinued_subjects,
                    "utilization_rate": (
                        f"{(active_subjects/total_subjects*100):.1f}%"
                        if total_subjects
                        else "0%"
                    ),
                },
                "education_system": {
                    "levels": education_stats,
                    "categories": category_stats,
                    "special_counts": {
                        "cross_cutting": Subject.objects.filter(
                            is_cross_cutting=True, is_active=True
                        ).count(),
                        "activity_based": Subject.objects.filter(
                            is_activity_based=True, is_active=True
                        ).count(),
                        "with_practicals": Subject.objects.filter(
                            has_practical=True, is_active=True
                        ).count(),
                        "requires_specialist": Subject.objects.filter(
                            requires_specialist_teacher=True, is_active=True
                        ).count(),
                    },
                },
                "configuration": {
                    "education_levels": dict(EDUCATION_LEVELS),
                    "nursery_levels": dict(NURSERY_LEVELS),
                    "ss_subject_types": dict(SS_SUBJECT_TYPES),
                    "subject_categories": dict(SUBJECT_CATEGORY_CHOICES),
                },
            }
        )
    except Exception as e:
        logger.error(f"System info endpoint failed: {str(e)}")
        return Response(
            {
                "error": "Failed to retrieve system information",
                "timestamp": timezone.now().isoformat(),
            },
            status=500,
        )
