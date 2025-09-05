from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Prefetch, Count, Avg
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from django.db import transaction, connection
from django.core.exceptions import ValidationError
from .models import (
    Subject,
    SUBJECT_CATEGORY_CHOICES,
    EDUCATION_LEVELS,
    NURSERY_LEVELS,
    SS_SUBJECT_TYPES,
)
import logging
from .serializers import (
    SubjectSerializer,
    SubjectListSerializer,
    SubjectCreateUpdateSerializer,
    SubjectEducationLevelSerializer,
)
# from classroom.models import GradeLevel  # Commented out to avoid circular import

logger = logging.getLogger(__name__)


def filter_by_json_field(queryset, field_name, value):
    """
    Database-agnostic JSON field filtering that works with both SQLite and PostgreSQL.
    
    Args:
        queryset: The base queryset to filter
        field_name: The JSON field name (e.g., 'education_levels', 'nursery_levels')
        value: The value to search for in the JSON array
    
    Returns:
        Filtered queryset
    """
    if connection.vendor == 'postgresql':
        # Use PostgreSQL-specific JSON operators for better performance
        return queryset.filter(**{f"{field_name}__contains": [value]})
    else:
        # Use Python-level filtering for SQLite and other databases
        subject_ids = []
        for subject in Subject.objects.all():
            if value in getattr(subject, field_name, []):
                subject_ids.append(subject.id)
        return queryset.filter(id__in=subject_ids)


class SubjectViewSet(viewsets.ModelViewSet):
    """
    Enhanced ViewSet for Subject CRUD operations aligned with Nigerian educational structure.

    Responsibilities:
    - Standard CRUD operations with Nigerian education system support
    - Education level and nursery level filtering
    - Senior Secondary subject type filtering
    - Cross-cutting subject management
    - Activity-based subject support
    - Enhanced search and filtering
    - Prerequisite management
    - Resource requirement tracking

    URL Pattern: /api/subjects/
    """

    queryset = Subject.objects.all()
    permission_classes = [IsAuthenticated]

    # Enhanced filtering and searching
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = {
        "category": ["exact", "in"],
        "ss_subject_type": ["exact", "in"],
        "is_active": ["exact"],
        "is_cross_cutting": ["exact"],
        "subject_order": ["exact", "gte", "lte"],
    }

    search_fields = [
        "name",
        "short_name",
        "code",
        "description",
    ]

    ordering_fields = [
        "name",
        "short_name",
        "code",
        "category",

        "subject_order",
        "created_at",
    ]

    ordering = ["education_levels", "category", "subject_order", "name"]

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        serializer_map = {
            "list": SubjectListSerializer,
            "create": SubjectCreateUpdateSerializer,
            "update": SubjectCreateUpdateSerializer,
            "partial_update": SubjectCreateUpdateSerializer,
            "check_availability": SubjectSerializer,  # Using main serializer as fallback
            "prerequisites": SubjectSerializer,  # Using main serializer as fallback
            "education_levels": SubjectEducationLevelSerializer,
        }
        return serializer_map.get(self.action, SubjectSerializer)

    def get_permissions(self):
        """Set permissions based on action"""
        # Temporarily allow unauthenticated access for testing
        if self.action in ["list", "statistics", "destroy", "create", "update", "partial_update"]:
            return []  # Allow unauthenticated access for CRUD operations during testing
        return [IsAuthenticated()]

    def get_queryset(self):
        """Enhanced queryset with smart prefetching and filtering"""
        queryset = Subject.objects.select_related().prefetch_related(
            "grade_levels",
            Prefetch(
                "prerequisites",
                queryset=Subject.objects.only("id", "name", "short_name", "code"),
            ),
        )

        # Education level filtering
        education_level = self.request.query_params.get("education_level")
        if education_level:
            queryset = filter_by_json_field(queryset, 'education_levels', education_level)

        # Nursery level filtering
        nursery_level = self.request.query_params.get("nursery_level")
        if nursery_level:
            queryset = filter_by_json_field(queryset, 'nursery_levels', nursery_level)

        # Grade level filtering (integration with GradeLevel model)
        grade_level = self.request.query_params.get("grade_level")
        if grade_level:
            try:
                grade_id = int(grade_level)
                queryset = queryset.filter(grade_levels__id=grade_id)
            except ValueError:
                pass

        # Active only filtering (default behavior)
        available_only = self.request.query_params.get("available_only", "true").lower()
        if available_only == "true":
            queryset = queryset.filter(is_active=True)

        # Cross-cutting subjects filtering
        cross_cutting_only = self.request.query_params.get("cross_cutting_only")
        if cross_cutting_only == "true":
            queryset = queryset.filter(is_cross_cutting=True)

        # Activity-based filtering (for nursery)
        activity_based = self.request.query_params.get("activity_based")
        if activity_based == "true":
            queryset = queryset.filter(is_activity_based=True)

        # Specialist teacher requirement filtering
        requires_specialist = self.request.query_params.get("requires_specialist")
        if requires_specialist == "true":
            queryset = queryset.filter(requires_specialist_teacher=True)

        # Teacher filtering - filter subjects by assigned teacher
        teacher_id = self.request.query_params.get("teacher_id")
        if teacher_id:
            try:
                from teacher.models import TeacherAssignment
                teacher_assignments = TeacherAssignment.objects.filter(
                    teacher_id=teacher_id
                ).values_list('subject_id', flat=True)
                queryset = queryset.filter(id__in=teacher_assignments)
            except (ValueError, ImportError):
                pass

        # Teacher specialization filtering
        teacher_specialization = self.request.query_params.get("teacher_specialization")
        if teacher_specialization:
            try:
                from teacher.models import Teacher
                teachers_with_specialization = Teacher.objects.filter(
                    specialization__icontains=teacher_specialization,
                    is_active=True
                ).values_list('id', flat=True)
                
                from teacher.models import TeacherAssignment
                teacher_assignments = TeacherAssignment.objects.filter(
                    teacher_id__in=teachers_with_specialization
                ).values_list('subject_id', flat=True)
                queryset = queryset.filter(id__in=teacher_assignments)
            except (ValueError, ImportError):
                pass

        return queryset

    def list(self, request, *args, **kwargs):
        """Enhanced list with comprehensive metadata"""
        response = super().list(request, *args, **kwargs)
        if hasattr(response, "data") and isinstance(response.data, dict):
            if "results" in response.data:
                # Add comprehensive metadata
                queryset = self.filter_queryset(self.get_queryset())
                response.data["metadata"] = {
                    "total_categories": len(SUBJECT_CATEGORY_CHOICES),
                    "total_education_levels": len(EDUCATION_LEVELS),
                    "total_nursery_levels": len(NURSERY_LEVELS),
                    "total_ss_subject_types": len(SS_SUBJECT_TYPES),
                    "filters_applied": bool(request.query_params),
                    "summary": {
                        "total_subjects": queryset.count(),
                        "active_subjects": queryset.filter(is_active=True).count(),
                        "cross_cutting_subjects": queryset.filter(
                            is_cross_cutting=True
                        ).count(),
                        "activity_based_subjects": queryset.filter(
                            is_activity_based=True
                        ).count(),

                    },
                }
        return response

    def perform_create(self, serializer):
        """Create with enhanced logging and cache invalidation"""
        with transaction.atomic():
            subject = serializer.save()
            self._clear_subject_caches()
            logger.info(
                f"Subject '{subject.name}' ({subject.code}) created by {self.request.user} "
                f"for levels: {subject.education_levels_display}"
            )

    def perform_update(self, serializer):
        """Update with enhanced logging and cache invalidation"""
        with transaction.atomic():
            old_name = serializer.instance.name
            old_levels = serializer.instance.education_levels_display
            subject = serializer.save()
            self._clear_subject_caches()
            logger.info(
                f"Subject '{old_name}' updated to '{subject.name}' by {self.request.user} "
                f"(Levels: {old_levels} -> {subject.education_levels_display})"
            )

    def perform_destroy(self, instance):
        """Smart delete with enhanced soft-delete logic"""
        with transaction.atomic():
            # Check for dependencies across different relationships
            has_student_subjects = (
                hasattr(instance, "student_subjects")
                and instance.student_subjects.exists()
            )
            has_dependent_subjects = instance.unlocks_subjects.exists()
            has_grade_assignments = instance.grade_levels.exists()

            # Get user info safely
            user_info = getattr(self.request, 'user', None)
            user_name = getattr(user_info, 'username', 'unknown') if user_info else 'unknown'

            logger.info(f"🗑️ Deleting subject '{instance.name}' ({instance.code}) by {user_name}")
            logger.info(f"📊 Dependencies check: student_subjects={has_student_subjects}, dependent_subjects={has_dependent_subjects}, grade_assignments={has_grade_assignments}")

            if has_student_subjects or has_dependent_subjects or has_grade_assignments:
                # Soft delete for subjects with dependencies
                instance.is_active = False
                instance.save()
                logger.info(
                    f"✅ Subject '{instance.name}' ({instance.code}) soft deleted by {user_name} "
                    f"due to existing dependencies"
                )
            else:
                # Hard delete if no dependencies
                super().perform_destroy(instance)
                logger.info(
                    f"✅ Subject '{instance.name}' ({instance.code}) permanently deleted by {user_name}"
                )
            
            logger.info("🧹 Clearing subject caches...")
            self._clear_subject_caches()
            logger.info("✅ Subject caches cleared successfully")

    def _clear_subject_caches(self):
        """Clear all subject-related caches"""
        cache_keys = [
            "subjects_cache_v1",
            "subjects_by_category_v3",
            "subjects_by_education_level_v2",
            "nursery_subjects_v1",
            "ss_subjects_by_type_v1",
            "cross_cutting_subjects_v1",
        ]
        for key in cache_keys:
            cache.delete(key)

    @action(detail=False, methods=["get"])
    def by_category(self, request):
        """Get subjects grouped by category with enhanced metadata"""
        cache_key = "subjects_by_category_v3"
        result = cache.get(cache_key)

        if not result:
            result = {}
            for category, display in SUBJECT_CATEGORY_CHOICES:
                subjects = (
                    self.get_queryset()
                    .filter(category=category, is_active=True)
                    .order_by("subject_order", "name")
                )

                result[category] = {
                    "display_name": display,
                    "icon": self._get_category_icon(category),
                    "count": subjects.count(),
                    "summary": {
                        "cross_cutting": subjects.filter(is_cross_cutting=True).count(),
                    },
                    "subjects": SubjectListSerializer(subjects, many=True).data,
                }
            cache.set(cache_key, result, 60 * 30)

        return Response(result)

    @action(detail=False, methods=["get"])
    def by_education_level(self, request):
        """Get subjects grouped by education level"""
        cache_key = "subjects_by_education_level_v2"
        result = cache.get(cache_key)

        if not result:
            result = {}
            for level_code, level_name in EDUCATION_LEVELS:
                subjects_queryset = (
                    self.get_queryset()
                    .filter(
                        education_levels__contains=[level_code],
                        is_active=True,
                    )
                    .order_by("category", "subject_order", "name")
                )

                # Special handling for nursery subjects
                nursery_breakdown = {}
                if level_code == "NURSERY":
                    for nursery_code, nursery_name in NURSERY_LEVELS:
                        nursery_subjects = subjects_queryset.filter(
                            nursery_levels__contains=[nursery_code]
                        )
                        if nursery_subjects.exists():
                            nursery_breakdown[nursery_code] = {
                                "name": nursery_name,
                                "count": nursery_subjects.count(),
                                "subjects": SubjectListSerializer(
                                    nursery_subjects, many=True
                                ).data,
                            }

                # Special handling for Senior Secondary subjects
                ss_breakdown = {}
                if level_code == "SENIOR_SECONDARY":
                    for ss_type_code, ss_type_name in SS_SUBJECT_TYPES:
                        ss_subjects = subjects_queryset.filter(
                            ss_subject_type=ss_type_code
                        )
                        if ss_subjects.exists():
                            ss_breakdown[ss_type_code] = {
                                "name": ss_type_name,
                                "count": ss_subjects.count(),
                                "subjects": SubjectListSerializer(
                                    ss_subjects, many=True
                                ).data,
                            }

                result[level_code] = {
                    "name": level_name,
                    "count": subjects_queryset.count(),
                    "summary": {
                        "cross_cutting": subjects_queryset.filter(
                            is_cross_cutting=True
                        ).count(),
                    },
                    "subjects": SubjectListSerializer(
                        subjects_queryset, many=True
                    ).data,
                    "nursery_breakdown": (
                        nursery_breakdown if level_code == "NURSERY" else None
                    ),
                    "ss_breakdown": (
                        ss_breakdown if level_code == "SENIOR_SECONDARY" else None
                    ),
                }

            cache.set(cache_key, result, 60 * 30)

        return Response(result)

    @action(detail=False, methods=["get"])
    def nursery_subjects(self, request):
        """Get nursery subjects with detailed breakdown"""
        cache_key = "nursery_subjects_v1"
        result = cache.get(cache_key)

        if not result:
            nursery_level = request.query_params.get("level")
            base_query = Subject.get_nursery_subjects()

            if nursery_level:
                base_query = base_query.filter(nursery_levels__contains=[nursery_level])

            result = {
                "total_count": base_query.count(),
                "activity_based_count": base_query.filter(
                    is_activity_based=True
                ).count(),
                "by_nursery_level": {},
                "subjects": SubjectListSerializer(base_query, many=True).data,
            }

            # Breakdown by nursery levels
            for level_code, level_name in NURSERY_LEVELS:
                level_subjects = base_query.filter(
                    nursery_levels__contains=[level_code]
                )
                result["by_nursery_level"][level_code] = {
                    "name": level_name,
                    "count": level_subjects.count(),
                    "subjects": SubjectListSerializer(level_subjects, many=True).data,
                }

            cache.set(cache_key, result, 60 * 20)

        return Response(result)

    @action(detail=False, methods=["get"])
    def senior_secondary_subjects(self, request):
        """Get Senior Secondary subjects with classification breakdown"""
        cache_key = "ss_subjects_by_type_v1"
        result = cache.get(cache_key)

        if not result:
            ss_subjects = Subject.get_senior_secondary_subjects()
            subject_type = request.query_params.get("type")

            if subject_type:
                ss_subjects = ss_subjects.filter(ss_subject_type=subject_type)

            result = {
                "total_count": ss_subjects.count(),
                "cross_cutting_count": ss_subjects.filter(
                    is_cross_cutting=True
                ).count(),
                "by_subject_type": {},
                "cross_cutting_subjects": SubjectListSerializer(
                    Subject.get_cross_cutting_subjects(), many=True
                ).data,
                "all_subjects": SubjectListSerializer(ss_subjects, many=True).data,
            }

            # Breakdown by subject types
            for type_code, type_name in SS_SUBJECT_TYPES:
                type_subjects = ss_subjects.filter(ss_subject_type=type_code)
                result["by_subject_type"][type_code] = {
                    "name": type_name,
                    "count": type_subjects.count(),
                    "subjects": SubjectListSerializer(type_subjects, many=True).data,
                }

            cache.set(cache_key, result, 60 * 20)

        return Response(result)

    @action(detail=False, methods=["get"])
    def cross_cutting_subjects(self, request):
        """Get cross-cutting subjects for Senior Secondary"""
        cache_key = "cross_cutting_subjects_v1"
        result = cache.get(cache_key)

        if not result:
            cross_cutting = Subject.get_cross_cutting_subjects()
            result = {
                "count": cross_cutting.count(),
                "description": "Cross-cutting subjects required for all Senior Secondary students",
                "subjects": SubjectListSerializer(cross_cutting, many=True).data,
            }
            cache.set(cache_key, result, 60 * 30)

        return Response(result)

    @action(detail=False, methods=["get"])
    def for_grade(self, request):
        """Enhanced grade-specific subject retrieval"""
        grade_level = request.query_params.get("grade")
        if not grade_level:
            return Response({"error": "grade parameter required"}, status=400)

        try:
            grade = int(grade_level)
            grade_obj = GradeLevel.objects.get(order=grade)
            subjects = (
                self.get_queryset()
                .filter(grade_levels=grade_obj, is_active=True)
                .order_by("category", "subject_order", "name")
            )
        except (ValueError, GradeLevel.DoesNotExist):
            return Response({"error": "Invalid grade level"}, status=400)

        # Categorize subjects
        compulsory = subjects.filter(is_compulsory=True)
        elective = subjects.filter(is_compulsory=False)
        cross_cutting = subjects.filter(is_cross_cutting=True)
        activity_based = subjects.filter(is_activity_based=True)
        with_practicals = subjects.filter(has_practical=True)

        return Response(
            {
                "grade_level": grade,
                "grade_name": grade_obj.name,
                "summary": {
                    "total_subjects": subjects.count(),
                },
                "categories": {
                    "cross_cutting": {
                        "count": cross_cutting.count(),
                        "subjects": SubjectListSerializer(
                            cross_cutting, many=True
                        ).data,
                    },
                },
            }
        )

    @action(detail=True, methods=["post"])
    def check_availability(self, request, pk=None):
        """Enhanced availability check with comprehensive information"""
        subject = self.get_object()
        serializer = SubjectGradeCheckSerializer(data=request.data)

        if serializer.is_valid():
            grade_level_id = serializer.validated_data["grade_level_id"]
            try:
                grade_level = GradeLevel.objects.get(id=grade_level_id)
                is_available = subject.grade_levels.filter(id=grade_level_id).exists()
                final_availability = (
                    is_available and subject.is_active
                )

                return Response(
                    {
                        "subject": {
                            "id": subject.id,
                            "name": subject.name,
                            "short_name": subject.short_name,
                            "code": subject.code,
                            "display_name": subject.display_name,
                        },
                        "grade_level": {"id": grade_level.id, "name": grade_level.name},
                        "availability": {
                            "is_available": final_availability,
                            "reasons": self._get_availability_reasons(
                                subject, is_available
                            ),
                        },
                        "subject_details": {
                            "is_cross_cutting": subject.is_cross_cutting,
                            "education_levels": subject.education_levels,
                            "category": subject.category,
                        },
                    }
                )
            except GradeLevel.DoesNotExist:
                return Response({"error": "Grade level not found"}, status=404)

        return Response(serializer.errors, status=400)

    @action(detail=False, methods=["get"])
    def search_suggestions(self, request):
        """Enhanced search suggestions with better categorization"""
        query = request.query_params.get("q", "").strip()
        if len(query) < 2:
            return Response({"suggestions": []})

        subjects = Subject.objects.filter(
            Q(name__icontains=query)
            | Q(short_name__icontains=query)
            | Q(code__icontains=query),
            is_active=True,
        ).values(
            "id",
            "name",
            "short_name",
            "code",
            "category",
            "education_levels",
            "is_cross_cutting",
            "is_activity_based",
        )[
            :15
        ]

        suggestions = []
        for s in subjects:
            display_name = s["short_name"] or s["name"]
            category_display = dict(SUBJECT_CATEGORY_CHOICES).get(s["category"])

            # Build education level display
            education_display = []
            if s["education_levels"]:
                for level in s["education_levels"]:
                    level_dict = dict(EDUCATION_LEVELS)
                    education_display.append(level_dict.get(level, level))

            suggestions.append(
                {
                    "id": s["id"],
                    "label": f"{display_name} ({s['code']})",
                    "name": s["name"],
                    "short_name": s["short_name"],
                    "display_name": display_name,
                    "code": s["code"],
                    "category": category_display,
                    "education_levels": (
                        ", ".join(education_display)
                        if education_display
                        else "All levels"
                    ),
                    "badges": self._get_subject_badges(s),
                }
            )

        return Response(
            {"query": query, "count": len(suggestions), "suggestions": suggestions}
        )

    @action(detail=True, methods=["get"])
    def prerequisites(self, request, pk=None):
        """Enhanced prerequisites with dependency tree"""
        subject = self.get_object()
        serializer = SubjectPrerequisiteSerializer(
            subject, context={"request": request}
        )

        # Add dependency information
        dependent_subjects = subject.get_dependent_subjects()

        response_data = serializer.data
        response_data["unlocks_subjects"] = {
            "count": dependent_subjects.count(),
            "subjects": SubjectListSerializer(dependent_subjects, many=True).data,
        }

        return Response(response_data)

    @action(detail=True, methods=["get"])
    def education_levels(self, request, pk=None):
        """Enhanced education level compatibility information"""
        subject = self.get_object()
        serializer = SubjectEducationLevelSerializer(
            subject, context={"request": request}
        )

        response_data = serializer.data

        # Add level-specific information
        response_data["level_specific_info"] = {}

        if subject.is_nursery_subject:
            response_data["level_specific_info"]["nursery"] = {
                "nursery_levels": subject.nursery_levels_display,
                "is_activity_based": subject.is_activity_based,
            }

        if subject.is_senior_secondary_subject:
            response_data["level_specific_info"]["senior_secondary"] = {
                "subject_type": (
                    subject.get_ss_subject_type_display()
                    if subject.ss_subject_type
                    else None
                ),
                "is_cross_cutting": subject.is_cross_cutting,
            }

        return Response(response_data)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        """Get comprehensive subject statistics"""
        cache_key = "subject_statistics_v1"
        result = cache.get(cache_key)

        if not result:
            # Use the base queryset without filtering to avoid query_params issues
            queryset = Subject.objects.all()

            result = {
                "overview": {
                    "total_subjects": queryset.count(),
                    "active_subjects": queryset.filter(is_active=True).count(),
                    
                },
                "by_education_level": {},
                "by_category": {},
                "by_requirements": {
                    "cross_cutting": queryset.filter(is_cross_cutting=True).count(),
                },
            }

            # Statistics by education level
            for level_code, level_name in EDUCATION_LEVELS:
                level_subjects = filter_by_json_field(queryset, 'education_levels', level_code)
                result["by_education_level"][level_code] = {
                    "name": level_name,
                    "count": level_subjects.count(),
                }

            # Statistics by category
            for category_code, category_name in SUBJECT_CATEGORY_CHOICES:
                category_subjects = queryset.filter(category=category_code)
                result["by_category"][category_code] = {
                    "name": category_name,
                    "count": category_subjects.count(),
                }

            cache.set(cache_key, result, 60 * 10)

        return Response(result)

    @action(detail=False, methods=["get"])
    def by_teacher(self, request):
        """Get subjects assigned to a specific teacher"""
        teacher_id = request.query_params.get("teacher_id")
        teacher_specialization = request.query_params.get("teacher_specialization")
        
        if not teacher_id and not teacher_specialization:
            return Response(
                {"error": "Either teacher_id or teacher_specialization parameter is required"},
                status=400
            )
        
        try:
            from teacher.models import Teacher, TeacherAssignment
            
            if teacher_id:
                # Get subjects assigned to specific teacher
                teacher_assignments = TeacherAssignment.objects.filter(
                    teacher_id=teacher_id
                ).select_related('subject', 'teacher', 'grade_level', 'section')
                
                subjects = [assignment.subject for assignment in teacher_assignments]
                
                # Get teacher info
                teacher = Teacher.objects.get(id=teacher_id)
                teacher_info = {
                    "id": teacher.id,
                    "name": teacher.user.full_name,
                    "employee_id": teacher.employee_id,
                    "specialization": teacher.specialization,
                    "level": teacher.level
                }
                
            else:
                # Get subjects by teacher specialization
                teachers_with_specialization = Teacher.objects.filter(
                    specialization__icontains=teacher_specialization,
                    is_active=True
                )
                
                teacher_assignments = TeacherAssignment.objects.filter(
                    teacher__in=teachers_with_specialization
                ).select_related('subject', 'teacher', 'grade_level', 'section')
                
                subjects = [assignment.subject for assignment in teacher_assignments]
                teacher_info = {
                    "specialization": teacher_specialization,
                    "teacher_count": teachers_with_specialization.count()
                }
            
            # Remove duplicates while preserving order
            seen_subjects = set()
            unique_subjects = []
            for subject in subjects:
                if subject.id not in seen_subjects:
                    seen_subjects.add(subject.id)
                    unique_subjects.append(subject)
            
            serializer = SubjectListSerializer(unique_subjects, many=True)
            
            response_data = {
                "teacher_info": teacher_info,
                "subjects": serializer.data,
                "total_subjects": len(unique_subjects),
                "assignments": []
            }
            
            # Add assignment details if requested
            include_assignments = request.query_params.get("include_assignments", "false").lower() == "true"
            if include_assignments:
                for assignment in teacher_assignments:
                    response_data["assignments"].append({
                        "id": assignment.id,
                        "subject": assignment.subject.name,
                        "grade_level": assignment.grade_level.name if assignment.grade_level else None,
                        "section": assignment.section.name if assignment.section else None,
                        "teacher": assignment.teacher.user.full_name
                    })
            
            return Response(response_data)
            
        except (ValueError, Teacher.DoesNotExist, ImportError) as e:
            return Response(
                {"error": f"Invalid teacher information: {str(e)}"},
                status=400
            )

    def _get_category_icon(self, category):
        """Get icon for category display"""
        icons = {
            "core": "📚",
            "elective": "🎯",
            "cross_cutting": "🌐",
            "core_science": "🔬",
            "core_art": "🎨",
            "core_humanities": "📖",
            "vocational": "🔧",
            "creative_arts": "🎭",
            "religious": "🙏",
            "physical": "⚽",
            "language": "🗣️",
            "practical": "✋",
            "nursery_activities": "🎈",
        }
        return icons.get(category, "📖")

    def _get_availability_reasons(self, subject, is_grade_available):
        """Get reasons for availability status"""
        reasons = []

        if not subject.is_active:
            reasons.append("Subject is not currently active")
        if not is_grade_available:
            reasons.append("Subject is not available for this grade level")
        if not reasons:
            reasons.append("Subject is available")

        return reasons

    def _get_subject_badges(self, subject_data):
        """Get display badges for subjects"""
        badges = []

        if subject_data.get("is_cross_cutting"):
            badges.append({"text": "Cross-cutting", "type": "info"})
        if subject_data.get("is_activity_based"):
            badges.append({"text": "Activity-based", "type": "success"})

        return badges
