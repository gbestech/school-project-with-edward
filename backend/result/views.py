from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count, Max, Min, F, Case, When, DecimalField
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
import logging

from .models import (
    StudentResult,
    StudentTermResult,
    ExamSession,
    ResultSheet,
    AssessmentScore,
    ResultComment,
    GradingSystem,
    Grade,
    AssessmentType,
    ScoringConfiguration,
    # Education-level specific models
    JuniorSecondaryResult,
    JuniorSecondaryTermReport,
    PrimaryResult,
    PrimaryTermReport,
    NurseryResult,
    NurseryTermReport,
    SeniorSecondaryResult,
    SeniorSecondaryTermReport,
    SeniorSecondarySessionResult,
    SeniorSecondarySessionReport,
)
from .serializers import (
    StudentResultSerializer,
    StudentTermResultSerializer,
    ExamSessionSerializer,
    ResultSheetSerializer,
    AssessmentScoreSerializer,
    ResultCommentSerializer,
    GradingSystemSerializer,
    GradeSerializer,
    AssessmentTypeSerializer,
    DetailedStudentResultSerializer,
    StudentTermResultDetailSerializer,
    ScoringConfigurationSerializer,
    ScoringConfigurationCreateUpdateSerializer,
    # Education-level specific serializers
    JuniorSecondaryResultSerializer,
    JuniorSecondaryResultCreateUpdateSerializer,
    JuniorSecondaryTermReportSerializer,
    PrimaryResultSerializer,
    PrimaryResultCreateUpdateSerializer,
    PrimaryTermReportSerializer,
    NurseryResultSerializer,
    NurseryResultCreateUpdateSerializer,
    NurseryTermReportSerializer,
    SeniorSecondaryResultSerializer,
    SeniorSecondaryResultCreateUpdateSerializer,
    SeniorSecondaryTermReportSerializer,
    SeniorSecondarySessionResultSerializer,
    SeniorSecondarySessionResultCreateUpdateSerializer,
    SeniorSecondarySessionReportSerializer,
    # Consolidated serializers
    ConsolidatedTermReportSerializer,
    ConsolidatedResultSerializer,
)
from students.models import Student
from academics.models import AcademicSession
from classroom.models import Stream

logger = logging.getLogger(__name__)


# ===== BASE CONFIGURATION VIEWSETS =====
class GradingSystemViewSet(viewsets.ModelViewSet):
    queryset = GradingSystem.objects.all()
    serializer_class = GradingSystemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["grading_type", "is_active"]
    search_fields = ["name", "description"]

    def get_queryset(self):
        return super().get_queryset().prefetch_related("grades")

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        """Activate a grading system"""
        grading_system = self.get_object()
        grading_system.is_active = True
        grading_system.save()
        return Response(GradingSystemSerializer(grading_system).data)

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        """Deactivate a grading system"""
        grading_system = self.get_object()
        grading_system.is_active = False
        grading_system.save()
        return Response(GradingSystemSerializer(grading_system).data)


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["grading_system", "is_passing"]

    def get_queryset(self):
        return super().get_queryset().select_related("grading_system")


class AssessmentTypeViewSet(viewsets.ModelViewSet):
    queryset = AssessmentType.objects.all()
    serializer_class = AssessmentTypeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["education_level", "is_active"]
    search_fields = ["name", "code"]


class ExamSessionViewSet(viewsets.ModelViewSet):
    queryset = ExamSession.objects.all()
    serializer_class = ExamSessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = [
        "exam_type",
        "term",
        "academic_session",
        "is_published",
        "is_active",
    ]
    search_fields = ["name"]

    def get_queryset(self):
        return super().get_queryset().select_related("academic_session")

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """Publish an exam session"""
        exam_session = self.get_object()
        exam_session.is_published = True
        exam_session.published_by = request.user
        exam_session.published_date = timezone.now()
        exam_session.save()
        return Response(ExamSessionSerializer(exam_session).data)

    @action(detail=True, methods=["get"])
    def statistics(self, request, pk=None):
        """Get statistics for an exam session"""
        exam_session = self.get_object()

        # Count results by education level
        stats = {
            "total_results": 0,
            "by_education_level": {},
            "by_status": {},
        }

        education_levels = [
            "SENIOR_SECONDARY",
            "JUNIOR_SECONDARY",
            "PRIMARY",
            "NURSERY",
        ]

        for level in education_levels:
            if level == "SENIOR_SECONDARY":
                results = SeniorSecondaryResult.objects.filter(
                    exam_session=exam_session
                )
            elif level == "JUNIOR_SECONDARY":
                results = JuniorSecondaryResult.objects.filter(
                    exam_session=exam_session
                )
            elif level == "PRIMARY":
                results = PrimaryResult.objects.filter(exam_session=exam_session)
            elif level == "NURSERY":
                results = NurseryResult.objects.filter(exam_session=exam_session)
            else:
                results = StudentResult.objects.none()

            level_stats = {
                "total": results.count(),
                "published": results.filter(status="PUBLISHED").count(),
                "approved": results.filter(status="APPROVED").count(),
                "draft": results.filter(status="DRAFT").count(),
                "passed": results.filter(is_passed=True).count(),
                "failed": results.filter(is_passed=False).count(),
            }

            stats["by_education_level"][level] = level_stats
            stats["total_results"] += level_stats["total"]

        return Response(stats)


# ===== SCORING CONFIGURATION VIEWSET =====
class ScoringConfigurationViewSet(viewsets.ModelViewSet):
    """ViewSet for Scoring Configuration"""

    queryset = ScoringConfiguration.objects.all().order_by("education_level", "name")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["education_level", "result_type", "is_active", "is_default"]
    search_fields = ["name", "description"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ScoringConfigurationCreateUpdateSerializer
        return ScoringConfigurationSerializer

    def get_queryset(self):
        return super().get_queryset().select_related("created_by")

    @action(detail=False, methods=["get"])
    def by_education_level(self, request):
        """Get scoring configurations by education level"""
        education_level = request.query_params.get("education_level")
        if not education_level:
            return Response(
                {"error": "education_level parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        configs = self.get_queryset().filter(education_level=education_level)
        serializer = ScoringConfigurationSerializer(configs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def defaults(self, request):
        """Get default scoring configurations for all education levels"""
        configs = self.get_queryset().filter(is_default=True, is_active=True)
        serializer = ScoringConfigurationSerializer(configs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_result_type(self, request):
        """Get scoring configurations by result type"""
        result_type = request.query_params.get("result_type", "TERMLY")
        education_level = request.query_params.get("education_level")

        filters = {"result_type": result_type, "is_active": True}
        if education_level:
            filters["education_level"] = education_level

        configs = self.get_queryset().filter(**filters)
        serializer = ScoringConfigurationSerializer(configs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def set_as_default(self, request, pk=None):
        """Set a configuration as default for its education level"""
        config = self.get_object()

        with transaction.atomic():
            # Remove default from other configs in same education level
            ScoringConfiguration.objects.filter(
                education_level=config.education_level, result_type=config.result_type
            ).update(is_default=False)

            # Set this as default
            config.is_default = True
            config.save()

        return Response(ScoringConfigurationSerializer(config).data)


# ===== LEGACY STUDENT RESULT VIEWSET =====
class StudentResultViewSet(viewsets.ModelViewSet):
    """Base StudentResult ViewSet - mainly for legacy support"""

    queryset = StudentResult.objects.all()
    serializer_class = StudentResultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = [
        "student",
        "subject",
        "exam_session",
        "status",
        "is_passed",
        "stream",
    ]
    search_fields = ["student__full_name", "subject__name"]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related(
            "student", "subject", "exam_session", "grading_system", "stream"
        ).prefetch_related("assessment_scores", "comments")

    def create(self, request, *args, **kwargs):
        """Create a new student result with automatic calculations"""
        try:
            with transaction.atomic():
                request.data["entered_by"] = request.user.id

                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = DetailedStudentResultSerializer(result)
                return Response(
                    detailed_serializer.data, status=status.HTTP_201_CREATED
                )
        except Exception as e:
            logger.error(f"Failed to create result: {str(e)}")
            return Response(
                {"error": f"Failed to create result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def update(self, request, *args, **kwargs):
        """Update a student result with automatic recalculations"""
        try:
            with transaction.atomic():
                partial = kwargs.pop("partial", False)
                instance = self.get_object()
                serializer = self.get_serializer(
                    instance, data=request.data, partial=partial
                )
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = DetailedStudentResultSerializer(result)
                return Response(detailed_serializer.data)
        except Exception as e:
            logger.error(f"Failed to update result: {str(e)}")
            return Response(
                {"error": f"Failed to update result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["get"])
    def by_student(self, request):
        """Get all results for a specific student"""
        student_id = request.query_params.get("student_id")
        if not student_id:
            return Response(
                {"error": "student_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = self.get_queryset().filter(student_id=student_id)
        serializer = DetailedStudentResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def class_statistics(self, request):
        """Get class statistics for an exam session"""
        exam_session_id = request.query_params.get("exam_session_id")
        class_name = request.query_params.get("class")

        if not exam_session_id or not class_name:
            return Response(
                {"error": "exam_session_id and class parameters are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = self.get_queryset().filter(
            exam_session_id=exam_session_id, student__student_class=class_name
        )

        if not results.exists():
            return Response(
                {"error": "No results found"}, status=status.HTTP_404_NOT_FOUND
            )

        stats = results.aggregate(
            total_students=Count("student", distinct=True),
            average_score=Avg("total_score"),
            highest_score=Max("total_score"),
            lowest_score=Min("total_score"),
            passed_count=Count("id", filter=Q(is_passed=True)),
            failed_count=Count("id", filter=Q(is_passed=False)),
        )

        return Response(stats)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """Approve a student result"""
        try:
            with transaction.atomic():
                result = self.get_object()
                result.status = "APPROVED"
                result.approved_by = request.user
                result.approved_date = timezone.now()
                result.save()

                serializer = DetailedStudentResultSerializer(result)
                return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to approve result: {str(e)}")
            return Response(
                {"error": f"Failed to approve result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """Publish a student result"""
        try:
            with transaction.atomic():
                result = self.get_object()
                result.status = "PUBLISHED"
                result.save()

                serializer = DetailedStudentResultSerializer(result)
                return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to publish result: {str(e)}")
            return Response(
                {"error": f"Failed to publish result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class StudentTermResultViewSet(viewsets.ModelViewSet):
    queryset = StudentTermResult.objects.all()
    serializer_class = StudentTermResultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "academic_session", "term", "status"]
    search_fields = ["student__full_name"]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related("student", "academic_session").prefetch_related(
            "comments"
        )

    @action(detail=False, methods=["get"])
    def by_student(self, request):
        """Get all term results for a specific student"""
        student_id = request.query_params.get("student_id")
        if not student_id:
            return Response(
                {"error": "student_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = self.get_queryset().filter(student_id=student_id)
        serializer = StudentTermResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def detailed(self, request, pk=None):
        """Get detailed term result with all subject results"""
        term_result = self.get_object()
        serializer = StudentTermResultDetailSerializer(term_result)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def generate_report(self, request):
        """Generate term report for a student"""
        student_id = request.data.get("student_id")
        exam_session_id = request.data.get("exam_session_id")

        if not all([student_id, exam_session_id]):
            return Response(
                {"error": "student_id and exam_session_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            student = Student.objects.get(id=student_id)
            exam_session = ExamSession.objects.get(id=exam_session_id)

            # Create or get term result based on education level
            education_level = student.education_level

            if education_level == "SENIOR_SECONDARY":
                term_result, created = SeniorSecondaryTermReport.objects.get_or_create(
                    student=student,
                    exam_session=exam_session,
                    defaults={
                        "status": "DRAFT",
                        "stream": getattr(student, "stream", None),
                    },
                )
                if created:
                    term_result.calculate_metrics()
                    term_result.calculate_class_position()
                serializer = SeniorSecondaryTermReportSerializer(term_result)

            elif education_level == "JUNIOR_SECONDARY":
                term_result, created = JuniorSecondaryTermReport.objects.get_or_create(
                    student=student,
                    exam_session=exam_session,
                    defaults={"status": "DRAFT"},
                )
                if created:
                    term_result.calculate_metrics()
                    term_result.calculate_class_position()
                serializer = JuniorSecondaryTermReportSerializer(term_result)

            elif education_level == "PRIMARY":
                term_result, created = PrimaryTermReport.objects.get_or_create(
                    student=student,
                    exam_session=exam_session,
                    defaults={"status": "DRAFT"},
                )
                if created:
                    term_result.calculate_metrics()
                    term_result.calculate_class_position()
                serializer = PrimaryTermReportSerializer(term_result)

            elif education_level == "NURSERY":
                term_result, created = NurseryTermReport.objects.get_or_create(
                    student=student,
                    exam_session=exam_session,
                    defaults={"status": "DRAFT"},
                )
                if created:
                    term_result.calculate_metrics()
                    term_result.calculate_class_position()
                serializer = NurseryTermReportSerializer(term_result)

            else:
                # Fallback to base StudentTermResult
                term_result, created = StudentTermResult.objects.get_or_create(
                    student=student,
                    academic_session=exam_session.academic_session,
                    term=exam_session.term,
                    defaults={"status": "DRAFT"},
                )
                serializer = StudentTermResultSerializer(term_result)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )

        except (Student.DoesNotExist, ExamSession.DoesNotExist) as e:
            return Response(
                {"error": f"Invalid student or exam session: {str(e)}"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.error(f"Failed to generate report: {str(e)}")
            return Response(
                {"error": f"Failed to generate report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ===== SENIOR SECONDARY VIEWSETS =====
class SeniorSecondaryTermReportViewSet(viewsets.ModelViewSet):
    """ViewSet for consolidated Senior Secondary term reports"""

    queryset = SeniorSecondaryTermReport.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "exam_session", "status", "is_published", "stream"]
    search_fields = ["student__full_name"]

    def get_serializer_class(self):
        return SeniorSecondaryTermReportSerializer

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related("student", "exam_session", "stream", "published_by")
            .prefetch_related("subject_results")
        )

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """Publish a term report"""
        try:
            with transaction.atomic():
                report = self.get_object()
                report.is_published = True
                report.published_by = request.user
                report.published_date = timezone.now()
                report.status = "PUBLISHED"
                report.save()

                serializer = self.get_serializer(report)
                return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to publish report: {str(e)}")
            return Response(
                {"error": f"Failed to publish report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def calculate_metrics(self, request, pk=None):
        """Manually trigger metrics calculation"""
        try:
            report = self.get_object()
            report.calculate_metrics()
            report.calculate_class_position()

            serializer = self.get_serializer(report)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to calculate metrics: {str(e)}")
            return Response(
                {"error": f"Failed to calculate metrics: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["post"])
    def bulk_publish(self, request):
        """Bulk publish term reports"""
        report_ids = request.data.get("report_ids", [])
        if not report_ids:
            return Response(
                {"error": "report_ids are required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                reports = self.get_queryset().filter(id__in=report_ids)
                updated_count = reports.update(
                    is_published=True,
                    published_by=request.user,
                    published_date=timezone.now(),
                    status="PUBLISHED",
                )

                return Response(
                    {
                        "message": f"Successfully published {updated_count} reports",
                        "updated_count": updated_count,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to bulk publish reports: {str(e)}")
            return Response(
                {"error": f"Failed to bulk publish reports: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class SeniorSecondarySessionReportViewSet(viewsets.ModelViewSet):
    """ViewSet for consolidated Senior Secondary session reports"""

    queryset = SeniorSecondarySessionReport.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = [
        "student",
        "academic_session",
        "status",
        "is_published",
        "stream",
    ]
    search_fields = ["student__full_name"]

    def get_serializer_class(self):
        return SeniorSecondarySessionReportSerializer

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related("student", "academic_session", "stream")
            .prefetch_related("subject_results")
        )

    @action(detail=True, methods=["post"])
    def calculate_metrics(self, request, pk=None):
        """Manually trigger session metrics calculation"""
        try:
            report = self.get_object()
            report.calculate_session_metrics()
            report.calculate_class_position()

            serializer = self.get_serializer(report)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to calculate session metrics: {str(e)}")
            return Response(
                {"error": f"Failed to calculate session metrics: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["post"])
    def generate_session_report(self, request):
        """Generate session report for a student"""
        student_id = request.data.get("student_id")
        academic_session_id = request.data.get("academic_session_id")

        if not all([student_id, academic_session_id]):
            return Response(
                {"error": "student_id and academic_session_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            student = Student.objects.get(id=student_id)
            academic_session = AcademicSession.objects.get(id=academic_session_id)

            session_report, created = (
                SeniorSecondarySessionReport.objects.get_or_create(
                    student=student,
                    academic_session=academic_session,
                    defaults={
                        "status": "DRAFT",
                        "stream": getattr(student, "stream", None),
                    },
                )
            )

            if created:
                session_report.calculate_session_metrics()
                session_report.calculate_class_position()

            serializer = self.get_serializer(session_report)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )

        except (Student.DoesNotExist, AcademicSession.DoesNotExist) as e:
            return Response(
                {"error": f"Invalid student or academic session: {str(e)}"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.error(f"Failed to generate session report: {str(e)}")
            return Response(
                {"error": f"Failed to generate session report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class SeniorSecondaryResultViewSet(viewsets.ModelViewSet):
    """ViewSet for Senior Secondary results"""

    queryset = SeniorSecondaryResult.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = [
        "student",
        "subject",
        "exam_session",
        "status",
        "is_passed",
        "stream",
    ]
    search_fields = ["student__full_name", "subject__name"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return SeniorSecondaryResultCreateUpdateSerializer
        return SeniorSecondaryResultSerializer

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related(
                "student",
                "subject",
                "exam_session",
                "grading_system",
                "stream",
                "entered_by",
                "approved_by",
                "published_by",
                "last_edited_by",
            )
        )

    def create(self, request, *args, **kwargs):
        """Create a new Senior Secondary result"""
        try:
            with transaction.atomic():
                request.data["entered_by"] = request.user.id

                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = SeniorSecondaryResultSerializer(result)
                return Response(
                    detailed_serializer.data, status=status.HTTP_201_CREATED
                )
        except Exception as e:
            logger.error(f"Failed to create result: {str(e)}")
            return Response(
                {"error": f"Failed to create result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def update(self, request, *args, **kwargs):
        """Update a Senior Secondary result"""
        try:
            with transaction.atomic():
                instance = self.get_object()
                serializer = self.get_serializer(
                    instance, data=request.data, partial=kwargs.get("partial", False)
                )
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = SeniorSecondaryResultSerializer(result)
                return Response(detailed_serializer.data)
        except Exception as e:
            logger.error(f"Failed to update result: {str(e)}")
            return Response(
                {"error": f"Failed to update result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        with transaction.atomic():
            result = self.get_object()
            result.status = "APPROVED"
            result.approved_by = request.user
            result.approved_date = timezone.now()
            result.save()
            return Response(SeniorSecondaryResultSerializer(result).data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        with transaction.atomic():
            result = self.get_object()
            result.status = "PUBLISHED"
            result.published_by = request.user
            result.published_date = timezone.now()
            result.save()
            return Response(SeniorSecondaryResultSerializer(result).data)

    @action(detail=False, methods=["post"])
    def bulk_create(self, request):
        """Bulk create Senior Secondary results"""
        results_data = request.data.get("results", [])
        created_results = []
        errors = []

        try:
            with transaction.atomic():
                for i, result_data in enumerate(results_data):
                    try:
                        result_data["entered_by"] = request.user.id
                        serializer = self.get_serializer(data=result_data)
                        serializer.is_valid(raise_exception=True)
                        result = serializer.save()
                        created_results.append(
                            SeniorSecondaryResultSerializer(result).data
                        )
                    except Exception as e:
                        errors.append(
                            {"index": i, "error": str(e), "data": result_data}
                        )

                if errors and not created_results:
                    return Response(
                        {"error": "Failed to create any results", "errors": errors},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                response_data = {
                    "message": f"Successfully created {len(created_results)} results",
                    "results": created_results,
                }

                if errors:
                    response_data["partial_success"] = True
                    response_data["errors"] = errors

                return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Failed to bulk create results: {str(e)}")
            return Response(
                {"error": f"Failed to bulk create results: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["get"])
    def class_statistics(self, request):
        """Get class statistics for Senior Secondary results"""
        exam_session = request.query_params.get("exam_session")
        student_class = request.query_params.get("student_class")
        subject = request.query_params.get("subject")

        filters = {}
        if exam_session:
            filters["exam_session"] = exam_session
        if student_class:
            filters["student__student_class"] = student_class
        if subject:
            filters["subject"] = subject

        filters["status__in"] = ["APPROVED", "PUBLISHED"]

        results = self.get_queryset().filter(**filters)

        if not results.exists():
            return Response(
                {"error": "No results found"}, status=status.HTTP_404_NOT_FOUND
            )

        scores = list(results.values_list("total_score", flat=True))
        statistics = {
            "total_students": len(scores),
            "class_average": sum(scores) / len(scores) if scores else 0,
            "highest_score": max(scores) if scores else 0,
            "lowest_score": min(scores) if scores else 0,
            "students_passed": results.filter(is_passed=True).count(),
            "students_failed": results.filter(is_passed=False).count(),
        }

        return Response(statistics)

    @action(detail=False, methods=["get"])
    def grade_distribution(self, request):
        """Get grade distribution for Senior Secondary results"""
        exam_session = request.query_params.get("exam_session")
        student_class = request.query_params.get("student_class")

        filters = {"status__in": ["APPROVED", "PUBLISHED"]}
        if exam_session:
            filters["exam_session"] = exam_session
        if student_class:
            filters["student__student_class"] = student_class

        results = self.get_queryset().filter(**filters)

        grade_stats = (
            results.values("grade").annotate(count=Count("grade")).order_by("grade")
        )

        return Response(list(grade_stats))


class SeniorSecondarySessionResultViewSet(viewsets.ModelViewSet):
    """ViewSet for Senior Secondary session results"""

    queryset = SeniorSecondarySessionResult.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "subject", "academic_session", "status", "stream"]
    search_fields = ["student__full_name", "subject__name"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return SeniorSecondarySessionResultCreateUpdateSerializer
        return SeniorSecondarySessionResultSerializer

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related("student", "subject", "academic_session", "stream")
        )

    def create(self, request, *args, **kwargs):
        """Create a new Senior Secondary session result"""
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = SeniorSecondarySessionResultSerializer(result)
                return Response(
                    detailed_serializer.data, status=status.HTTP_201_CREATED
                )
        except Exception as e:
            logger.error(f"Failed to create session result: {str(e)}")
            return Response(
                {"error": f"Failed to create session result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ===== JUNIOR SECONDARY VIEWSETS =====
class JuniorSecondaryTermReportViewSet(viewsets.ModelViewSet):
    """ViewSet for consolidated Junior Secondary term reports"""

    queryset = JuniorSecondaryTermReport.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "exam_session", "status", "is_published"]
    search_fields = ["student__full_name"]

    def get_serializer_class(self):
        return JuniorSecondaryTermReportSerializer

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related("student", "exam_session", "published_by")
            .prefetch_related("subject_results")
        )

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """Publish a Junior Secondary term report"""
        try:
            with transaction.atomic():
                report = self.get_object()
                report.is_published = True
                report.published_by = request.user
                report.published_date = timezone.now()
                report.status = "PUBLISHED"
                report.save()

                serializer = self.get_serializer(report)
                return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to publish report: {str(e)}")
            return Response(
                {"error": f"Failed to publish report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def calculate_metrics(self, request, pk=None):
        """Manually trigger metrics calculation"""
        try:
            report = self.get_object()
            report.calculate_metrics()
            report.calculate_class_position()

            serializer = self.get_serializer(report)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to calculate metrics: {str(e)}")
            return Response(
                {"error": f"Failed to calculate metrics: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class JuniorSecondaryResultViewSet(viewsets.ModelViewSet):
    """ViewSet for Junior Secondary results"""

    queryset = JuniorSecondaryResult.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "subject", "exam_session", "status", "is_passed"]
    search_fields = ["student__full_name", "subject__name"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return JuniorSecondaryResultCreateUpdateSerializer
        return JuniorSecondaryResultSerializer

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related(
                "student",
                "subject",
                "exam_session",
                "grading_system",
                "entered_by",
                "approved_by",
                "published_by",
                "last_edited_by",
            )
        )

    def create(self, request, *args, **kwargs):
        """Create a new Junior Secondary result"""
        try:
            with transaction.atomic():
                request.data["entered_by"] = request.user.id

                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = JuniorSecondaryResultSerializer(result)
                return Response(
                    detailed_serializer.data, status=status.HTTP_201_CREATED
                )
        except Exception as e:
            logger.error(f"Failed to create result: {str(e)}")
            return Response(
                {"error": f"Failed to create result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        with transaction.atomic():
            result = self.get_object()
            result.status = "APPROVED"
            result.approved_by = request.user
            result.approved_date = timezone.now()
            result.save()
            return Response(JuniorSecondaryResultSerializer(result).data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        with transaction.atomic():
            result = self.get_object()
            result.status = "PUBLISHED"
            result.published_by = request.user
            result.published_date = timezone.now()
            result.save()
            return Response(JuniorSecondaryResultSerializer(result).data)

    @action(detail=False, methods=["post"])
    def bulk_create(self, request):
        """Bulk create Junior Secondary results"""
        results_data = request.data.get("results", [])
        created_results = []
        errors = []

        try:
            with transaction.atomic():
                for i, result_data in enumerate(results_data):
                    try:
                        result_data["entered_by"] = request.user.id
                        serializer = self.get_serializer(data=result_data)
                        serializer.is_valid(raise_exception=True)
                        result = serializer.save()
                        created_results.append(
                            JuniorSecondaryResultSerializer(result).data
                        )
                    except Exception as e:
                        errors.append(
                            {"index": i, "error": str(e), "data": result_data}
                        )

                response_data = {
                    "message": f"Successfully created {len(created_results)} results",
                    "results": created_results,
                }

                if errors:
                    response_data["errors"] = errors

                return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Failed to bulk create results: {str(e)}")
            return Response(
                {"error": f"Failed to bulk create results: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["get"])
    def class_statistics(self, request):
        """Get class statistics for Junior Secondary results"""
        return self._get_class_statistics(request, JuniorSecondaryResult)


# ===== PRIMARY VIEWSETS =====
class PrimaryTermReportViewSet(viewsets.ModelViewSet):
    """ViewSet for consolidated Primary term reports"""

    queryset = PrimaryTermReport.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "exam_session", "status", "is_published"]
    search_fields = ["student__full_name"]

    def get_serializer_class(self):
        return PrimaryTermReportSerializer

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related("student", "exam_session", "published_by")
            .prefetch_related("subject_results")
        )

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """Publish a Primary term report"""
        try:
            with transaction.atomic():
                report = self.get_object()
                report.is_published = True
                report.published_by = request.user
                report.published_date = timezone.now()
                report.status = "PUBLISHED"
                report.save()

                serializer = self.get_serializer(report)
                return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to publish report: {str(e)}")
            return Response(
                {"error": f"Failed to publish report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def calculate_metrics(self, request, pk=None):
        """Manually trigger metrics calculation"""
        try:
            report = self.get_object()
            report.calculate_metrics()
            report.calculate_class_position()

            serializer = self.get_serializer(report)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to calculate metrics: {str(e)}")
            return Response(
                {"error": f"Failed to calculate metrics: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class PrimaryResultViewSet(viewsets.ModelViewSet):
    """ViewSet for Primary results"""

    queryset = PrimaryResult.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "subject", "exam_session", "status", "is_passed"]
    search_fields = ["student__full_name", "subject__name"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return PrimaryResultCreateUpdateSerializer
        return PrimaryResultSerializer

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related(
                "student",
                "subject",
                "exam_session",
                "grading_system",
                "entered_by",
                "approved_by",
                "published_by",
                "last_edited_by",
            )
        )

    def create(self, request, *args, **kwargs):
        """Create a new Primary result"""
        try:
            with transaction.atomic():
                request.data["entered_by"] = request.user.id

                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = PrimaryResultSerializer(result)
                return Response(
                    detailed_serializer.data, status=status.HTTP_201_CREATED
                )
        except Exception as e:
            logger.error(f"Failed to create result: {str(e)}")
            return Response(
                {"error": f"Failed to create result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        with transaction.atomic():
            result = self.get_object()
            result.status = "APPROVED"
            result.approved_by = request.user
            result.approved_date = timezone.now()
            result.save()
            return Response(PrimaryResultSerializer(result).data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        with transaction.atomic():
            result = self.get_object()
            result.status = "PUBLISHED"
            result.published_by = request.user
            result.published_date = timezone.now()
            result.save()
            return Response(PrimaryResultSerializer(result).data)

    @action(detail=False, methods=["post"])
    def bulk_create(self, request):
        """Bulk create Primary results"""
        results_data = request.data.get("results", [])
        created_results = []
        errors = []

        try:
            with transaction.atomic():
                for i, result_data in enumerate(results_data):
                    try:
                        result_data["entered_by"] = request.user.id
                        serializer = self.get_serializer(data=result_data)
                        serializer.is_valid(raise_exception=True)
                        result = serializer.save()
                        created_results.append(PrimaryResultSerializer(result).data)
                    except Exception as e:
                        errors.append(
                            {"index": i, "error": str(e), "data": result_data}
                        )

                response_data = {
                    "message": f"Successfully created {len(created_results)} results",
                    "results": created_results,
                }

                if errors:
                    response_data["errors"] = errors

                return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Failed to bulk create results: {str(e)}")
            return Response(
                {"error": f"Failed to bulk create results: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["get"])
    def class_statistics(self, request):
        """Get class statistics for Primary results"""
        return self._get_class_statistics(request, PrimaryResult)


# ===== NURSERY VIEWSETS =====
class NurseryTermReportViewSet(viewsets.ModelViewSet):
    """ViewSet for consolidated Nursery term reports"""

    queryset = NurseryTermReport.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "exam_session", "status", "is_published"]
    search_fields = ["student__full_name"]

    def get_serializer_class(self):
        return NurseryTermReportSerializer

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related("student", "exam_session", "published_by")
            .prefetch_related("subject_results")
        )

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """Publish a Nursery term report"""
        try:
            with transaction.atomic():
                report = self.get_object()
                report.is_published = True
                report.published_by = request.user
                report.published_date = timezone.now()
                report.status = "PUBLISHED"
                report.save()

                serializer = self.get_serializer(report)
                return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to publish report: {str(e)}")
            return Response(
                {"error": f"Failed to publish report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def calculate_metrics(self, request, pk=None):
        """Manually trigger metrics calculation"""
        try:
            report = self.get_object()
            report.calculate_metrics()
            report.calculate_class_position()

            serializer = self.get_serializer(report)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to calculate metrics: {str(e)}")
            return Response(
                {"error": f"Failed to calculate metrics: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class NurseryResultViewSet(viewsets.ModelViewSet):
    """ViewSet for Nursery results"""

    queryset = NurseryResult.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "subject", "exam_session", "status", "is_passed"]
    search_fields = ["student__full_name", "subject__name"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return NurseryResultCreateUpdateSerializer
        return NurseryResultSerializer

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related(
                "student",
                "subject",
                "exam_session",
                "grading_system",
                "entered_by",
                "approved_by",
                "published_by",
                "last_edited_by",
            )
        )

    def create(self, request, *args, **kwargs):
        """Create a new Nursery result"""
        try:
            with transaction.atomic():
                request.data["entered_by"] = request.user.id

                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = NurseryResultSerializer(result)
                return Response(
                    detailed_serializer.data, status=status.HTTP_201_CREATED
                )
        except Exception as e:
            logger.error(f"Failed to create result: {str(e)}")
            return Response(
                {"error": f"Failed to create result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        with transaction.atomic():
            result = self.get_object()
            result.status = "APPROVED"
            result.approved_by = request.user
            result.approved_date = timezone.now()
            result.save()
            return Response(NurseryResultSerializer(result).data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        with transaction.atomic():
            result = self.get_object()
            result.status = "PUBLISHED"
            result.published_by = request.user
            result.published_date = timezone.now()
            result.save()
            return Response(NurseryResultSerializer(result).data)

    @action(detail=False, methods=["post"])
    def bulk_create(self, request):
        """Bulk create Nursery results"""
        results_data = request.data.get("results", [])
        created_results = []
        errors = []

        try:
            with transaction.atomic():
                for i, result_data in enumerate(results_data):
                    try:
                        result_data["entered_by"] = request.user.id
                        serializer = self.get_serializer(data=result_data)
                        serializer.is_valid(raise_exception=True)
                        result = serializer.save()
                        created_results.append(NurseryResultSerializer(result).data)
                    except Exception as e:
                        errors.append(
                            {"index": i, "error": str(e), "data": result_data}
                        )

                response_data = {
                    "message": f"Successfully created {len(created_results)} results",
                    "results": created_results,
                }

                if errors:
                    response_data["errors"] = errors

                return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Failed to bulk create results: {str(e)}")
            return Response(
                {"error": f"Failed to bulk create results: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["get"])
    def class_statistics(self, request):
        """Get class statistics for Nursery results"""
        exam_session = request.query_params.get("exam_session")
        student_class = request.query_params.get("student_class")
        subject = request.query_params.get("subject")

        filters = {}
        if exam_session:
            filters["exam_session"] = exam_session
        if student_class:
            filters["student__student_class"] = student_class
        if subject:
            filters["subject"] = subject

        filters["status__in"] = ["APPROVED", "PUBLISHED"]

        results = self.get_queryset().filter(**filters)

        if not results.exists():
            return Response(
                {"error": "No results found"}, status=status.HTTP_404_NOT_FOUND
            )

        scores = list(results.values_list("percentage", flat=True))
        statistics = {
            "total_students": len(scores),
            "class_average": sum(scores) / len(scores) if scores else 0,
            "highest_score": max(scores) if scores else 0,
            "lowest_score": min(scores) if scores else 0,
            "students_passed": results.filter(is_passed=True).count(),
            "students_failed": results.filter(is_passed=False).count(),
        }

        return Response(statistics)


# ===== SUPPORTING VIEWSETS =====
class ResultSheetViewSet(viewsets.ModelViewSet):
    queryset = ResultSheet.objects.all()
    serializer_class = ResultSheetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["exam_session", "student_class", "education_level", "status"]

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related("exam_session", "prepared_by", "approved_by")
        )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """Approve a result sheet"""
        try:
            with transaction.atomic():
                result_sheet = self.get_object()
                result_sheet.status = "APPROVED"
                result_sheet.approved_by = request.user
                result_sheet.approved_date = timezone.now()
                result_sheet.save()

                return Response(ResultSheetSerializer(result_sheet).data)
        except Exception as e:
            logger.error(f"Failed to approve result sheet: {str(e)}")
            return Response(
                {"error": f"Failed to approve result sheet: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["post"])
    def generate_sheet(self, request):
        """Generate result sheet for a class"""
        exam_session_id = request.data.get("exam_session_id")
        student_class = request.data.get("student_class")
        education_level = request.data.get("education_level")

        if not all([exam_session_id, student_class, education_level]):
            return Response(
                {
                    "error": "exam_session_id, student_class, and education_level are required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            exam_session = ExamSession.objects.get(id=exam_session_id)

            # Check if sheet already exists
            existing_sheet = ResultSheet.objects.filter(
                exam_session=exam_session,
                student_class=student_class,
                education_level=education_level,
            ).first()

            if existing_sheet:
                return Response(
                    ResultSheetSerializer(existing_sheet).data,
                    status=status.HTTP_200_OK,
                )

            # Create new result sheet
            result_sheet = ResultSheet.objects.create(
                exam_session=exam_session,
                student_class=student_class,
                education_level=education_level,
                prepared_by=request.user,
                status="DRAFT",
            )

            return Response(
                ResultSheetSerializer(result_sheet).data, status=status.HTTP_201_CREATED
            )

        except ExamSession.DoesNotExist:
            return Response(
                {"error": "Exam session not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to generate result sheet: {str(e)}")
            return Response(
                {"error": f"Failed to generate result sheet: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class AssessmentScoreViewSet(viewsets.ModelViewSet):
    queryset = AssessmentScore.objects.all()
    serializer_class = AssessmentScoreSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["student_result", "assessment_type"]

    def get_queryset(self):
        return (
            super().get_queryset().select_related("student_result", "assessment_type")
        )


class ResultCommentViewSet(viewsets.ModelViewSet):
    queryset = ResultComment.objects.all()
    serializer_class = ResultCommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["student_result", "term_result", "comment_type"]

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related("student_result", "term_result", "commented_by")
        )
