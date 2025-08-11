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

from .models import (
    Subject,
    GradeLevel,
    Classroom,
    ClassroomTeacherAssignment,
    StudentEnrollment,
    ClassSchedule,
    Section,
    AcademicYear,
    Term,
    Student,
)
from teacher.models import Teacher
from subject.models import (
    SUBJECT_CATEGORY_CHOICES,
    EDUCATION_LEVELS,
    NURSERY_LEVELS,
    SS_SUBJECT_TYPES,
)
from .serializers import (
    SubjectSerializer,
    ClassroomSerializer,
    ClassroomDetailSerializer,
    ClassroomTeacherAssignmentSerializer,
    StudentEnrollmentSerializer,
    ClassScheduleSerializer,
    GradeLevelSerializer,
    SectionSerializer,
    AcademicYearSerializer,
    TermSerializer,
    TeacherSerializer,
    StudentSerializer,
)
from subject.serializers import (
    SubjectListSerializer,
    SubjectCreateUpdateSerializer,
    SubjectEducationLevelSerializer,
)

# Import the separated viewsets
# from .subjectviewset import SubjectViewSet
# from .analyticalviewset import SubjectAnalyticsViewSet
# from .subjectmanagementviewset import SubjectManagementViewSet

logger = logging.getLogger(__name__)

# ==============================================================================
# BASIC VIEWSETS FOR CLASSROOM APP
# ==============================================================================

class GradeLevelViewSet(viewsets.ModelViewSet):
    """ViewSet for GradeLevel model"""
    permission_classes = []  # Allow public access
    serializer_class = GradeLevelSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['education_level', 'is_active']
    search_fields = ['name', 'education_level']
    ordering_fields = ['order', 'name']
    
    def get_queryset(self):
        return GradeLevel.objects.all()
    
    @action(detail=True, methods=['get'])
    def subjects(self, request, pk=None):
        """Get subjects for a specific grade level"""
        grade = self.get_object()
        subjects = Subject.objects.filter(grade_levels=grade)
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get students for a specific grade level"""
        # Placeholder - implement when student model is available
        return Response({"message": "Students endpoint not implemented yet"})
    
    @action(detail=True, methods=['get'])
    def classrooms(self, request, pk=None):
        """Get classrooms for a specific grade level"""
        # Placeholder - implement when classroom model is available
        return Response({"message": "Classrooms endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def nursery_grades(self, request):
        """Get nursery grade levels"""
        grades = GradeLevel.objects.filter(education_level='NURSERY')
        serializer = SubjectSerializer(grades, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def primary_grades(self, request):
        """Get primary grade levels"""
        grades = GradeLevel.objects.filter(education_level='PRIMARY')
        serializer = SubjectSerializer(grades, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def junior_secondary_grades(self, request):
        """Get junior secondary grade levels"""
        grades = GradeLevel.objects.filter(education_level='JUNIOR_SECONDARY')
        serializer = SubjectSerializer(grades, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def senior_secondary_grades(self, request):
        """Get senior secondary grade levels"""
        grades = GradeLevel.objects.filter(education_level='SENIOR_SECONDARY')
        serializer = SubjectSerializer(grades, many=True)
        return Response(serializer.data)

class SectionViewSet(viewsets.ModelViewSet):
    """ViewSet for Section model"""
    permission_classes = []  # Allow public access for section loading
    serializer_class = SectionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['grade_level', 'grade_level__education_level', 'is_active']
    search_fields = ['name', 'grade_level__name']
    ordering_fields = ['name', 'grade_level__order']
    
    def get_queryset(self):
        return Section.objects.select_related('grade_level').all()

class AcademicYearViewSet(viewsets.ModelViewSet):
    """ViewSet for AcademicYear model"""
    permission_classes = [IsAuthenticated]
    serializer_class = AcademicYearSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_current']
    search_fields = ['name']
    ordering_fields = ['start_date', 'name']
    
    def get_queryset(self):
        return AcademicYear.objects.all()
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current academic year"""
        current_year = AcademicYear.objects.filter(is_current=True).first()
        if current_year:
            serializer = AcademicYearSerializer(current_year)
            return Response(serializer.data)
        return Response({"message": "No current academic year set"})
    
    @action(detail=True, methods=['get'])
    def terms(self, request, pk=None):
        """Get terms for a specific academic year"""
        academic_year = self.get_object()
        terms = academic_year.terms.all()
        serializer = TermSerializer(terms, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get statistics for a specific academic year"""
        academic_year = self.get_object()
        classroom_count = academic_year.classrooms.count()
        term_count = academic_year.terms.count()
        
        return Response({
            'classroom_count': classroom_count,
            'term_count': term_count,
            'is_current': academic_year.is_current
        })

class TermViewSet(viewsets.ModelViewSet):
    """ViewSet for Term model"""
    permission_classes = [IsAuthenticated]
    serializer_class = TermSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['academic_year', 'is_active', 'is_current']
    search_fields = ['name', 'academic_year__name']
    ordering_fields = ['name', 'start_date']
    
    def get_queryset(self):
        return Term.objects.select_related('academic_year').all()
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current term"""
        current_term = Term.objects.filter(is_current=True).first()
        if current_term:
            serializer = TermSerializer(current_term)
            return Response(serializer.data)
        return Response({"message": "No current term set"})
    
    @action(detail=True, methods=['get'])
    def subjects(self, request, pk=None):
        """Get subjects for a specific term"""
        term = self.get_object()
        # This would need to be implemented based on your subject-term relationship
        return Response({"message": "Subjects endpoint not implemented yet"})

class TeacherViewSet(viewsets.ModelViewSet):
    """ViewSet for Teacher model"""
    permission_classes = [IsAuthenticated]
    serializer_class = TeacherSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'specialization']
    search_fields = ['user__first_name', 'user__last_name', 'employee_id']
    ordering_fields = ['user__first_name', 'user__last_name', 'hire_date']
    
    def get_queryset(self):
        return Teacher.objects.select_related('user').all()
    
    @action(detail=True, methods=['get'])
    def classes(self, request, pk=None):
        """Get classes for a specific teacher"""
        teacher = self.get_object()
        primary_classes = teacher.primary_classes.all()
        assigned_classes = teacher.assigned_classes.all()
        
        primary_serializer = ClassroomSerializer(primary_classes, many=True)
        assigned_serializer = ClassroomSerializer(assigned_classes, many=True)
        
        return Response({
            'primary_classes': primary_serializer.data,
            'assigned_classes': assigned_serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def subjects(self, request, pk=None):
        """Get subjects for a specific teacher"""
        teacher = self.get_object()
        assignments = teacher.classroomteacherassignment_set.filter(is_active=True).select_related('subject')
        subjects = [assignment.subject for assignment in assignments]
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        """Get schedule for a specific teacher"""
        teacher = self.get_object()
        schedules = ClassSchedule.objects.filter(teacher=teacher, is_active=True).select_related('classroom', 'subject')
        serializer = ClassScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def workload(self, request, pk=None):
        """Get workload for a specific teacher"""
        teacher = self.get_object()
        primary_classes_count = teacher.primary_classes.count()
        assigned_classes_count = teacher.assigned_classes.count()
        total_subjects = teacher.classroomteacherassignment_set.filter(is_active=True).count()
        
        return Response({
            'primary_classes_count': primary_classes_count,
            'assigned_classes_count': assigned_classes_count,
            'total_subjects': total_subjects,
            'total_workload': primary_classes_count + assigned_classes_count
        })

class StudentViewSet(viewsets.ModelViewSet):
    """ViewSet for Student model"""
    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer  # Placeholder
    
    def get_queryset(self):
        return []  # Placeholder - implement when Student model is available
    
    @action(detail=True, methods=['get'])
    def current_class(self, request, pk=None):
        """Get current class for a specific student"""
        return Response({"message": "Current class endpoint not implemented yet"})
    
    @action(detail=True, methods=['get'])
    def subjects(self, request, pk=None):
        """Get subjects for a specific student"""
        return Response({"message": "Subjects endpoint not implemented yet"})
    
    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        """Get schedule for a specific student"""
        return Response({"message": "Schedule endpoint not implemented yet"})
    
    @action(detail=True, methods=['get'])
    def enrollment_history(self, request, pk=None):
        """Get enrollment history for a specific student"""
        return Response({"message": "Enrollment history endpoint not implemented yet"})

class SubjectViewSet(viewsets.ModelViewSet):
    """ViewSet for Subject model"""
    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active', 'is_compulsory']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'subject_order']
    
    def get_queryset(self):
        return Subject.objects.all()
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get subjects grouped by category"""
        return Response({"message": "By category endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def by_education_level(self, request):
        """Get subjects grouped by education level"""
        return Response({"message": "By education level endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def nursery_subjects(self, request):
        """Get nursery subjects"""
        subjects = Subject.objects.filter(education_levels__contains=['NURSERY'])
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def senior_secondary_subjects(self, request):
        """Get senior secondary subjects"""
        subjects = Subject.objects.filter(education_levels__contains=['SENIOR_SECONDARY'])
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def cross_cutting_subjects(self, request):
        """Get cross-cutting subjects"""
        subjects = Subject.objects.filter(is_cross_cutting=True)
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def for_grade(self, request):
        """Get subjects for a specific grade"""
        return Response({"message": "For grade endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def search_suggestions(self, request):
        """Get search suggestions"""
        return Response({"message": "Search suggestions endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get subject statistics"""
        return Response({"message": "Statistics endpoint not implemented yet"})
    
    @action(detail=True, methods=['post'])
    def check_availability(self, request, pk=None):
        """Check subject availability"""
        return Response({"message": "Check availability endpoint not implemented yet"})
    
    @action(detail=True, methods=['get'])
    def prerequisites(self, request, pk=None):
        """Get prerequisites for a subject"""
        return Response({"message": "Prerequisites endpoint not implemented yet"})
    
    @action(detail=True, methods=['get'])
    def education_levels(self, request, pk=None):
        """Get education levels for a subject"""
        return Response({"message": "Education levels endpoint not implemented yet"})

class SubjectAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Subject analytics (read-only)"""
    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer
    
    def get_queryset(self):
        return Subject.objects.all()

class SubjectManagementViewSet(viewsets.ModelViewSet):
    """ViewSet for Subject management (admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = SubjectSerializer
    
    def get_queryset(self):
        return Subject.objects.all()

class ClassroomViewSet(viewsets.ModelViewSet):
    """ViewSet for Classroom model"""
    permission_classes = []  # Allow public access for classroom assignment
    serializer_class = ClassroomSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['section__grade_level__education_level', 'is_active', 'academic_year']
    search_fields = ['name', 'section__name', 'section__grade_level__name']
    ordering_fields = ['name', 'created_at', 'current_enrollment']
    
    def get_queryset(self):
        return Classroom.objects.select_related(
            'section__grade_level', 
            'academic_year', 
            'term', 
            'class_teacher__user'
        ).prefetch_related(
            'students',
            'subject_teachers',
            'schedules'
        )
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ClassroomDetailSerializer
        return ClassroomSerializer
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get students for a specific classroom"""
        classroom = self.get_object()
        enrollments = classroom.studentenrollment_set.filter(is_active=True).select_related('student')
        serializer = StudentEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def teachers(self, request, pk=None):
        """Get teachers for a specific classroom"""
        classroom = self.get_object()
        assignments = classroom.classroomteacherassignment_set.filter(is_active=True).select_related('teacher__user', 'subject')
        serializer = ClassroomTeacherAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def subjects(self, request, pk=None):
        """Get subjects for a specific classroom"""
        classroom = self.get_object()
        subjects = Subject.objects.filter(
            classroomteacherassignment__classroom=classroom,
            classroomteacherassignment__is_active=True
        ).distinct()
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        """Get schedule for a specific classroom"""
        classroom = self.get_object()
        schedules = classroom.schedules.filter(is_active=True).select_related('subject', 'teacher__user')
        serializer = ClassScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get classroom statistics"""
        total_classrooms = Classroom.objects.count()
        active_classrooms = Classroom.objects.filter(is_active=True).count()
        total_enrollment = sum(c.current_enrollment for c in Classroom.objects.all())
        avg_enrollment = total_enrollment / total_classrooms if total_classrooms > 0 else 0
        
        # By education level
        nursery_count = Classroom.objects.filter(section__grade_level__education_level='NURSERY').count()
        primary_count = Classroom.objects.filter(section__grade_level__education_level='PRIMARY').count()
        secondary_count = Classroom.objects.filter(section__grade_level__education_level='SECONDARY').count()
        
        return Response({
            'total_classrooms': total_classrooms,
            'active_classrooms': active_classrooms,
            'total_enrollment': total_enrollment,
            'average_enrollment': round(avg_enrollment, 1),
            'by_education_level': {
                'nursery': nursery_count,
                'primary': primary_count,
                'secondary': secondary_count
            }
        })

class ClassroomTeacherAssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for ClassroomTeacherAssignment model"""
    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer  # Placeholder
    
    def get_queryset(self):
        return []  # Placeholder - implement when model is available
    
    @action(detail=False, methods=['get'])
    def by_academic_year(self, request):
        """Get assignments by academic year"""
        return Response({"message": "By academic year endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def by_subject(self, request):
        """Get assignments by subject"""
        return Response({"message": "By subject endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def workload_analysis(self, request):
        """Get workload analysis"""
        return Response({"message": "Workload analysis endpoint not implemented yet"})

class StudentEnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for StudentEnrollment model"""
    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer  # Placeholder
    
    def get_queryset(self):
        return []  # Placeholder - implement when model is available
    
    @action(detail=False, methods=['get'])
    def by_academic_year(self, request):
        """Get enrollments by academic year"""
        return Response({"message": "By academic year endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def by_grade(self, request):
        """Get enrollments by grade"""
        return Response({"message": "By grade endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get enrollment statistics"""
        return Response({"message": "Statistics endpoint not implemented yet"})

class ClassScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for ClassSchedule model"""
    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer  # Placeholder
    
    def get_queryset(self):
        return []  # Placeholder - implement when model is available
    
    @action(detail=False, methods=['get'])
    def by_classroom(self, request):
        """Get schedules by classroom"""
        return Response({"message": "By classroom endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def by_teacher(self, request):
        """Get schedules by teacher"""
        return Response({"message": "By teacher endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def by_subject(self, request):
        """Get schedules by subject"""
        return Response({"message": "By subject endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def conflicts(self, request):
        """Get schedule conflicts"""
        return Response({"message": "Conflicts endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def daily_schedule(self, request):
        """Get daily schedule"""
        return Response({"message": "Daily schedule endpoint not implemented yet"})
    
    @action(detail=False, methods=['get'])
    def weekly_schedule(self, request):
        """Get weekly schedule"""
        return Response({"message": "Weekly schedule endpoint not implemented yet"})


# ==============================================================================
# HEALTH CHECK ENDPOINT
# ==============================================================================
@api_view(["GET"])
def health_check(request):
    """
    Enhanced health check endpoint for monitoring API status with system information
    """
    try:
        # Basic database connectivity check
        total_subjects = Subject.objects.count()
        active_subjects = Subject.objects.filter(is_active=True).count()

        # Check cache connectivity
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


# ==============================================================================
# ENHANCED EDUCATION LEVEL VIEW
# ==============================================================================
class SubjectByEducationLevelView(APIView):
    """
    Enhanced view for retrieving subjects by education level with detailed information
    """

    permission_classes = [IsAuthenticated]

    @method_decorator(cache_page(60 * 10))
    def get(self, request):
        """
        Get subjects filtered by education level with comprehensive information

        Query Parameters:
        - level: Education level (NURSERY, PRIMARY, JUNIOR_SECONDARY, SENIOR_SECONDARY)
        - nursery_level: Specific nursery level (PRE_NURSERY, NURSERY_1, NURSERY_2)
        - ss_type: Senior Secondary subject type
        - category: Subject category
        - active_only: Boolean to filter active subjects only (default: true)
        - include_discontinued: Boolean to include discontinued subjects (default: false)
        """
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

        # Validate education level
        valid_levels = [code for code, _ in EDUCATION_LEVELS]
        if level not in valid_levels:
            return Response(
                {
                    "error": f"Invalid education level: {level}",
                    "valid_levels": valid_levels,
                },
                status=400,
            )

        # Base queryset
        queryset = Subject.objects.filter(
            education_levels__contains=[level]
        ).prefetch_related("grade_levels", "prerequisites")

        # Apply additional filters
        active_only = request.query_params.get("active_only", "true").lower() == "true"
        include_discontinued = (
            request.query_params.get("include_discontinued", "false").lower() == "true"
        )

        if active_only:
            queryset = queryset.filter(is_active=True)

        if not include_discontinued:
            queryset = queryset.filter(is_discontinued=False)

        # Nursery level filtering
        nursery_level = request.query_params.get("nursery_level")
        if nursery_level and level == "NURSERY":
            valid_nursery_levels = [code for code, _ in NURSERY_LEVELS]
            if nursery_level in valid_nursery_levels:
                queryset = queryset.filter(nursery_levels__contains=[nursery_level])

        # Senior Secondary type filtering
        ss_type = request.query_params.get("ss_type")
        if ss_type and level == "SENIOR_SECONDARY":
            valid_ss_types = [code for code, _ in SS_SUBJECT_TYPES]
            if ss_type in valid_ss_types:
                queryset = queryset.filter(ss_subject_type=ss_type)

        # Category filtering
        category = request.query_params.get("category")
        if category:
            valid_categories = [code for code, _ in SUBJECT_CATEGORY_CHOICES]
            if category in valid_categories:
                queryset = queryset.filter(category=category)

        # Order subjects appropriately
        queryset = queryset.order_by("category", "subject_order", "name")

        # Serialize data
        serializer = SubjectEducationLevelSerializer(
            queryset, many=True, context={"request": request}
        )

        # Build response with metadata
        level_name = dict(EDUCATION_LEVELS).get(level, level)

        response_data = {
            "education_level": {
                "code": level,
                "name": level_name,
            },
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

        # Add level-specific information
        if level == "NURSERY":
            response_data["nursery_breakdown"] = self._get_nursery_breakdown(queryset)
        elif level == "SENIOR_SECONDARY":
            response_data["ss_breakdown"] = self._get_ss_breakdown(queryset)

        return Response(response_data)

    def _get_nursery_breakdown(self, queryset):
        """Get breakdown of nursery subjects by nursery levels"""
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
        """Get breakdown of Senior Secondary subjects by type"""
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
    Lightweight search endpoint for autocomplete and quick lookups
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Quick search for subjects with minimal data transfer

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

        # Apply additional filters
        education_level = request.query_params.get("education_level")
        if education_level:
            queryset = queryset.filter(education_levels__contains=[education_level])

        category = request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        # Get results
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
            education_display = []
            if subject["education_levels"]:
                level_dict = dict(EDUCATION_LEVELS)
                education_display = [
                    level_dict.get(level, level)
                    for level in subject["education_levels"]
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


# ==============================================================================
# SUBJECT COMPARISON VIEW
# ==============================================================================
class SubjectComparisonView(APIView):
    """
    Compare multiple subjects side by side
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Compare subjects by their IDs

        Request body:
        {
            "subject_ids": [1, 2, 3, ...]
        }
        """
        subject_ids = request.data.get("subject_ids", [])

        if not subject_ids or not isinstance(subject_ids, list):
            return Response(
                {"error": "Please provide a list of subject_ids in the request body"},
                status=400,
            )

        if len(subject_ids) > 5:
            return Response(
                {"error": "Maximum 5 subjects can be compared at once"}, status=400
            )

        # Get subjects
        subjects = Subject.objects.filter(
            id__in=subject_ids, is_active=True
        ).prefetch_related("prerequisites", "grade_levels")

        if not subjects:
            return Response(
                {"error": "No valid subjects found for the provided IDs"}, status=404
            )

        # Build comparison data
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
                            if subject.is_nursery_subject
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


# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================
def clear_subject_caches():
    """
    Enhanced helper function to clear all subject-related caches
    """
    cache_keys = [
        # Legacy cache keys
        "subjects_statistics",
        "subjects_statistics_v2",
        "subjects_by_category",
        "subjects_by_category_v2",
        "active_subjects_count",
        # New cache keys from enhanced model
        "subjects_cache_v1",
        "subjects_by_category_v3",
        "subjects_by_education_level_v2",
        "nursery_subjects_v1",
        "ss_subjects_by_type_v1",
        "cross_cutting_subjects_v1",
        "subject_statistics_v1",
        # Pattern-based cache clearing
        "subject_*",
        "education_level_*",
        "nursery_*",
        "ss_*",
    ]

    try:
        cache.delete_many(cache_keys)

        # If using Redis or similar, also clear pattern-based keys
        if hasattr(cache, "delete_pattern"):
            patterns = ["subject_*", "education_*", "nursery_*", "ss_*"]
            for pattern in patterns:
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
    API endpoint to manually clear caches (admin only)
    """
    success = clear_subject_caches()

    if success:
        return Response(
            {
                "status": "success",
                "message": "Subject caches cleared successfully",
                "timestamp": timezone.now().isoformat(),
            }
        )
    else:
        return Response(
            {
                "status": "error",
                "message": "Failed to clear some caches",
                "timestamp": timezone.now().isoformat(),
            },
            status=500,
        )


# ==============================================================================
# SYSTEM INFO ENDPOINT
# ==============================================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def system_info(request):
    """
    Get comprehensive system information about the subjects API
    """
    try:
        # Get database statistics
        total_subjects = Subject.objects.count()
        active_subjects = Subject.objects.filter(is_active=True).count()
        discontinued_subjects = Subject.objects.filter(is_discontinued=True).count()

        # Education level statistics
        education_stats = {}
        for level_code, level_name in EDUCATION_LEVELS:
            count = Subject.objects.filter(
                education_levels__contains=[level_code], is_active=True
            ).count()
            education_stats[level_code] = {"name": level_name, "count": count}

        # Category statistics
        category_stats = {}
        for category_code, category_name in SUBJECT_CATEGORY_CHOICES:
            count = Subject.objects.filter(
                category=category_code, is_active=True
            ).count()
            category_stats[category_code] = {"name": category_name, "count": count}

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
                        if total_subjects > 0
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


# ==============================================================================
# EXPORTED COMPONENTS
# ==============================================================================
__all__ = [
    # Main viewsets
    "SubjectViewSet",
    "SubjectAnalyticsViewSet",
    "SubjectManagementViewSet",
    # Additional views
    "SubjectByEducationLevelView",
    "SubjectQuickSearchView",
    "SubjectComparisonView",
    # API endpoints
    "health_check",
    "clear_caches_endpoint",
    "system_info",
    # Utility functions
    "clear_subject_caches",
]


# ==============================================================================
# VIEWSET CONFIGURATION DOCUMENTATION
# ==============================================================================
"""
Enhanced Nigerian Education Subjects API - Views Configuration

This file serves as the main entry point for all subject-related viewsets and views,
specifically designed for the Nigerian education system structure.

=== VIEWSET ORGANIZATION ===

1. SubjectViewSet (from subjectviewset.py):
   - Core CRUD operations for subjects
   - Nigerian education level filtering (NURSERY, PRIMARY, JUNIOR_SECONDARY, SENIOR_SECONDARY)
   - Nursery sub-level filtering (PRE_NURSERY, NURSERY_1, NURSERY_2)
   - Senior Secondary subject type filtering (cross_cutting, core_science, core_art, etc.)
   - Grade-level integration
   - Subject availability checks
   - Prerequisites management
   - Enhanced filtering and searching

2. SubjectAnalyticsViewSet (from analyticalviewset.py):
   - Read-only analytics and reporting
   - Education level statistics
   - Category-based analytics
   - Performance metrics
   - Workload analysis
   - Cached analytical data
   - Cross-cutting subject analysis

3. SubjectManagementViewSet (from subjectmanagementviewset.py):
   - Admin-only operations
   - Bulk operations (update, delete, activate)
   - Advanced subject management
   - Audit logging and monitoring
   - Data export/import functions
   - Subject lifecycle management

=== ADDITIONAL VIEWS ===

4. SubjectByEducationLevelView:
   - Detailed education level filtering
   - Nursery and SS breakdown
   - Comprehensive metadata

5. SubjectQuickSearchView:
   - Lightweight autocomplete search
   - Minimal data transfer
   - Fast response times

6. SubjectComparisonView:
   - Side-by-side subject comparison
   - Comprehensive subject details
   - Academic requirement analysis

=== URL CONFIGURATION ===

Recommended URL patterns:
- /api/v1/subjects/ -> SubjectViewSet
- /api/v1/analytics/subjects/ -> SubjectAnalyticsViewSet  
- /api/v1/management/subjects/ -> SubjectManagementViewSet
- /api/v1/subjects/by-level/ -> SubjectByEducationLevelView
- /api/v1/subjects/quick-search/ -> SubjectQuickSearchView
- /api/v1/subjects/compare/ -> SubjectComparisonView
- /api/v1/health/ -> health_check
- /api/v1/system-info/ -> system_info
- /api/v1/clear-caches/ -> clear_caches_endpoint

=== FEATURES SUPPORTED ===

✅ Nigerian Education System Structure
✅ Nursery Level Management (Pre-Nursery, Nursery 1, Nursery 2)
✅ Primary Education Support
✅ Junior Secondary Education
✅ Senior Secondary with subject type classification
✅ Cross-cutting subjects for SS
✅ Activity-based subjects for nursery
✅ Practical/laboratory requirements
✅ Specialist teacher requirements
✅ Prerequisites and dependencies
✅ Comprehensive caching
✅ Advanced analytics
✅ Bulk operations
✅ API health monitoring
✅ Performance optimization

=== CACHING STRATEGY ===

The system uses multi-level caching:
- View-level caching (15 minutes for lists, 10 minutes for specific queries)
- Object-level caching (30 minutes for categories, 20 minutes for education levels)
- Statistics caching (10 minutes for dynamic stats)
- Search result caching (5 minutes for quick searches)

Cache keys are versioned and can be cleared via the admin endpoint.
"""
