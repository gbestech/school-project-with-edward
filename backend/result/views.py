# from rest_framework import viewsets, status, filters

from utils.section_filtering import AutoSectionFilterMixin
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from django_filters.rest_framework import DjangoFilterBackend
# from django.db.models import Q, Avg, Count, Max, Min, F, Case, When, DecimalField
# from django.shortcuts import get_object_or_404
# from django.utils import timezone
# from django.db import transaction
# from decimal import Decimal
# import logging
# from utils.section_filtering import SectionFilterMixin, AutoSectionFilterMixin

# from .models import (
#     StudentResult,
#     StudentTermResult,
#     ExamSession,
#     ResultSheet,
#     AssessmentScore,
#     ResultComment,
#     GradingSystem,
#     Grade,
#     AssessmentType,
#     ScoringConfiguration,
#     # Education-level specific models
#     JuniorSecondaryResult,
#     JuniorSecondaryTermReport,
#     PrimaryResult,
#     PrimaryTermReport,
#     NurseryResult,
#     NurseryTermReport,
#     SeniorSecondaryResult,
#     SeniorSecondaryTermReport,
#     SeniorSecondarySessionResult,
#     SeniorSecondarySessionReport,
# )
# from .serializers import (
#     StudentResultSerializer,
#     StudentTermResultSerializer,
#     ExamSessionSerializer,
#     ResultSheetSerializer,
#     AssessmentScoreSerializer,
#     ResultCommentSerializer,
#     GradingSystemSerializer,
#     GradeSerializer,
#     AssessmentTypeSerializer,
#     DetailedStudentResultSerializer,
#     StudentTermResultDetailSerializer,
#     ScoringConfigurationSerializer,
#     ScoringConfigurationCreateUpdateSerializer,
#     # Education-level specific serializers
#     JuniorSecondaryResultSerializer,
#     JuniorSecondaryResultCreateUpdateSerializer,
#     JuniorSecondaryTermReportSerializer,
#     PrimaryResultSerializer,
#     PrimaryResultCreateUpdateSerializer,
#     PrimaryTermReportSerializer,
#     NurseryResultSerializer,
#     NurseryResultCreateUpdateSerializer,
#     NurseryTermReportSerializer,
#     SeniorSecondaryResultSerializer,
#     SeniorSecondaryResultCreateUpdateSerializer,
#     SeniorSecondaryTermReportSerializer,
#     SeniorSecondarySessionResultSerializer,
#     SeniorSecondarySessionResultCreateUpdateSerializer,
#     SeniorSecondarySessionReportSerializer,
#     # Consolidated serializers
#     ConsolidatedTermReportSerializer,
#     ConsolidatedResultSerializer,
# )
# from students.models import Student
# from academics.models import AcademicSession, Term
# from classroom.models import Stream

# logger = logging.getLogger(__name__)


# def get_next_term_begins_date(exam_session):
#     """Get the next term begins date for the given exam session"""
#     try:
#         # Ensure we have the academic_session relationship loaded
#         if (
#             not hasattr(exam_session, "academic_session")
#             or not exam_session.academic_session
#         ):
#             logger.error(
#                 f"Exam session {exam_session.id} does not have academic_session relationship loaded"
#             )
#             return None

#         # Get the current term from the exam session
#         current_term_name = exam_session.term
#         current_academic_session = exam_session.academic_session

#         logger.info(
#             f"Getting next term begins date for term: {current_term_name}, academic_session: {current_academic_session.name}"
#         )

#         # Define term order
#         term_order = ["FIRST", "SECOND", "THIRD"]

#         # Find current term index
#         if current_term_name not in term_order:
#             logger.error(f"Invalid term name: {current_term_name}")
#             return None

#         current_index = term_order.index(current_term_name)

#         # If it's not the last term, get the next term
#         if current_index < len(term_order) - 1:
#             next_term_name = term_order[current_index + 1]
#             next_term = Term.objects.filter(
#                 academic_session=current_academic_session,
#                 name=next_term_name,
#                 is_active=True,
#             ).first()

#             if next_term and next_term.next_term_begins:
#                 logger.info(
#                     f"Found next term {next_term_name} with next_term_begins: {next_term.next_term_begins}"
#                 )
#                 return next_term.next_term_begins
#             else:
#                 logger.warning(
#                     f"Next term {next_term_name} not found or has no next_term_begins date"
#                 )
#         else:
#             # If it's the last term, get the first term of the next academic session
#             next_academic_session = (
#                 AcademicSession.objects.filter(
#                     start_date__gt=current_academic_session.end_date, is_active=True
#                 )
#                 .order_by("start_date")
#                 .first()
#             )

#             if next_academic_session:
#                 next_term = Term.objects.filter(
#                     academic_session=next_academic_session, name="FIRST", is_active=True
#                 ).first()

#                 if next_term and next_term.next_term_begins:
#                     logger.info(
#                         f"Found first term of next academic session with next_term_begins: {next_term.next_term_begins}"
#                     )
#                     return next_term.next_term_begins
#                 else:
#                     logger.warning(
#                         f"First term of next academic session not found or has no next_term_begins date"
#                     )
#             else:
#                 logger.warning(
#                     f"No next academic session found after {current_academic_session.name}"
#                 )

#         return None
#     except Exception as e:
#         logger.error(f"Error getting next term begins date: {e}")
#         return None


# # ===== BASE CONFIGURATION VIEWSETS =====
# class GradingSystemViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
#     queryset = GradingSystem.objects.all()
#     serializer_class = GradingSystemSerializer
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = ["grading_type", "is_active"]
#     search_fields = ["name", "description"]

#     def get_queryset(self):
#         return super().get_queryset().prefetch_related("grades")

#     @action(detail=True, methods=["post"])
#     def activate(self, request, pk=None):
#         """Activate a grading system"""
#         grading_system = self.get_object()
#         grading_system.is_active = True
#         grading_system.save()
#         return Response(GradingSystemSerializer(grading_system).data)

#     @action(detail=True, methods=["post"])
#     def deactivate(self, request, pk=None):
#         """Deactivate a grading system"""
#         grading_system = self.get_object()
#         grading_system.is_active = False
#         grading_system.save()
#         return Response(GradingSystemSerializer(grading_system).data)


# class GradeViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
#     queryset = Grade.objects.all()
#     serializer_class = GradeSerializer
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend]
#     filterset_fields = ["grading_system", "is_passing"]

#     def get_queryset(self):
#         return super().get_queryset().select_related("grading_system")


# class AssessmentTypeViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
#     queryset = AssessmentType.objects.all()
#     serializer_class = AssessmentTypeSerializer
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = ["education_level", "is_active"]
#     search_fields = ["name", "code"]


# class ExamSessionViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
#     queryset = ExamSession.objects.all()
#     serializer_class = ExamSessionSerializer
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = [
#         "exam_type",
#         "term",
#         "academic_session",
#         "is_published",
#         "is_active",
#     ]
#     search_fields = ["name"]

#     def get_queryset(self):
#         return super().get_queryset().select_related("academic_session")

#     @action(detail=True, methods=["post"])
#     def publish(self, request, pk=None):
#         """Publish an exam session"""
#         exam_session = self.get_object()
#         exam_session.is_published = True
#         exam_session.published_by = request.user
#         exam_session.published_date = timezone.now()
#         exam_session.save()
#         return Response(ExamSessionSerializer(exam_session).data)

#     @action(detail=True, methods=["get"])
#     def statistics(self, request, pk=None):
#         """Get statistics for an exam session"""
#         exam_session = self.get_object()

#         # Count results by education level
#         stats = {
#             "total_results": 0,
#             "by_education_level": {},
#             "by_status": {},
#         }

#         education_levels = [
#             "SENIOR_SECONDARY",
#             "JUNIOR_SECONDARY",
#             "PRIMARY",
#             "NURSERY",
#         ]

#         for level in education_levels:
#             if level == "SENIOR_SECONDARY":
#                 results = SeniorSecondaryResult.objects.filter(
#                     exam_session=exam_session
#                 )
#             elif level == "JUNIOR_SECONDARY":
#                 results = JuniorSecondaryResult.objects.filter(
#                     exam_session=exam_session
#                 )
#             elif level == "PRIMARY":
#                 results = PrimaryResult.objects.filter(exam_session=exam_session)
#             elif level == "NURSERY":
#                 results = NurseryResult.objects.filter(exam_session=exam_session)
#             else:
#                 results = StudentResult.objects.none()

#             level_stats = {
#                 "total": results.count(),
#                 "published": results.filter(status="PUBLISHED").count(),
#                 "approved": results.filter(status="APPROVED").count(),
#                 "draft": results.filter(status="DRAFT").count(),
#                 "passed": results.filter(is_passed=True).count(),
#                 "failed": results.filter(is_passed=False).count(),
#             }

#             stats["by_education_level"][level] = level_stats
#             stats["total_results"] += level_stats["total"]

#         return Response(stats)


# # ===== SCORING CONFIGURATION VIEWSET =====
# class ScoringConfigurationViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
#     """ViewSet for Scoring Configuration"""

#     queryset = ScoringConfiguration.objects.all().order_by("education_level", "name")
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = ["education_level", "result_type", "is_active", "is_default"]
#     search_fields = ["name", "description"]

#     def get_serializer_class(self):
#         if self.action in ["create", "update", "partial_update"]:
#             return ScoringConfigurationCreateUpdateSerializer
#         return ScoringConfigurationSerializer

#     def get_queryset(self):
#         return super().get_queryset().select_related("created_by")

#     @action(detail=False, methods=["get"])
#     def by_education_level(self, request):
#         """Get scoring configurations by education level"""
#         education_level = request.query_params.get("education_level")
#         if not education_level:
#             return Response(
#                 {"error": "education_level parameter is required"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         configs = self.get_queryset().filter(education_level=education_level)
#         serializer = ScoringConfigurationSerializer(configs, many=True)
#         return Response(serializer.data)

#     @action(detail=False, methods=["get"])
#     def defaults(self, request):
#         """Get default scoring configurations for all education levels"""
#         configs = self.get_queryset().filter(is_default=True, is_active=True)
#         serializer = ScoringConfigurationSerializer(configs, many=True)
#         return Response(serializer.data)

#     @action(detail=False, methods=["get"])
#     def by_result_type(self, request):
#         """Get scoring configurations by result type"""
#         result_type = request.query_params.get("result_type", "TERMLY")
#         education_level = request.query_params.get("education_level")

#         filters = {"result_type": result_type, "is_active": True}
#         if education_level:
#             filters["education_level"] = education_level

#         configs = self.get_queryset().filter(**filters)
#         serializer = ScoringConfigurationSerializer(configs, many=True)
#         return Response(serializer.data)

#     @action(detail=True, methods=["post"])
#     def set_as_default(self, request, pk=None):
#         """Set a configuration as default for its education level"""
#         config = self.get_object()

#         with transaction.atomic():
#             # Remove default from other configs in same education level
#             ScoringConfiguration.objects.filter(
#                 education_level=config.education_level, result_type=config.result_type
#             ).update(is_default=False)

#             # Set this as default
#             config.is_default = True
#             config.save()

#         return Response(ScoringConfigurationSerializer(config).data)


# # ===== LEGACY STUDENT RESULT VIEWSET =====
# class StudentResultViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):
#     """Base StudentResult ViewSet - mainly for legacy support"""

#     queryset = StudentResult.objects.all()
#     serializer_class = StudentResultSerializer
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = [
#         "student",
#         "subject",
#         "exam_session",
#         "status",
#         "is_passed",
#         "stream",
#     ]
#     search_fields = ["student__full_name", "subject__name"]

#     def get_queryset(self):
#         queryset = super().get_queryset()
#         queryset = queryset.select_related(
#             "student", "subject", "exam_session", "grading_system", "stream"
#         ).prefetch_related("assessment_scores", "comments")

#         # Apply section-based filtering for authenticated users
#         if self.request.user.is_authenticated:
#             # Filter results by student's education level
#             section_access = self.get_user_section_access()
#             education_levels = self.get_education_levels_for_sections(section_access)

#             if not education_levels:
#                 return queryset.none()

#             queryset = queryset.filter(student__education_level__in=education_levels)

#         return queryset

#     def create(self, request, *args, **kwargs):
#         """Create a new student result with automatic calculations"""
#         try:
#             with transaction.atomic():
#                 request.data["entered_by"] = request.user.id

#                 serializer = self.get_serializer(data=request.data)
#                 serializer.is_valid(raise_exception=True)
#                 result = serializer.save()

#                 detailed_serializer = DetailedStudentResultSerializer(result)
#                 return Response(
#                     detailed_serializer.data, status=status.HTTP_201_CREATED
#                 )
#         except Exception as e:
#             logger.error(f"Failed to create result: {str(e)}")
#             return Response(
#                 {"error": f"Failed to create result: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     def update(self, request, *args, **kwargs):
#         """Update a student result with automatic recalculations"""
#         try:
#             with transaction.atomic():
#                 partial = kwargs.pop("partial", False)
#                 instance = self.get_object()
#                 serializer = self.get_serializer(
#                     instance, data=request.data, partial=partial
#                 )
#                 serializer.is_valid(raise_exception=True)
#                 result = serializer.save()

#                 detailed_serializer = DetailedStudentResultSerializer(result)
#                 return Response(detailed_serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to update result: {str(e)}")
#             return Response(
#                 {"error": f"Failed to update result: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=False, methods=["get"])
#     def by_student(self, request):
#         """Get all results for a specific student"""
#         student_id = request.query_params.get("student_id")
#         if not student_id:
#             return Response(
#                 {"error": "student_id parameter is required"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         results = self.get_queryset().filter(student_id=student_id)
#         serializer = DetailedStudentResultSerializer(results, many=True)
#         return Response(serializer.data)

#     @action(detail=False, methods=["get"])
#     def class_statistics(self, request):
#         """Get class statistics for an exam session"""
#         exam_session_id = request.query_params.get("exam_session_id")
#         class_name = request.query_params.get("class")

#         if not exam_session_id or not class_name:
#             return Response(
#                 {"error": "exam_session_id and class parameters are required"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         results = self.get_queryset().filter(
#             exam_session_id=exam_session_id, student__student_class=class_name
#         )

#         if not results.exists():
#             return Response(
#                 {"error": "No results found"}, status=status.HTTP_404_NOT_FOUND
#             )

#         stats = results.aggregate(
#             total_students=Count("student", distinct=True),
#             average_score=Avg("total_score"),
#             highest_score=Max("total_score"),
#             lowest_score=Min("total_score"),
#             passed_count=Count("id", filter=Q(is_passed=True)),
#             failed_count=Count("id", filter=Q(is_passed=False)),
#         )

#         return Response(stats)

#     @action(detail=True, methods=["post"])
#     def approve(self, request, pk=None):
#         """Approve a student result"""
#         try:
#             with transaction.atomic():
#                 result = self.get_object()
#                 result.status = "APPROVED"
#                 result.approved_by = request.user
#                 result.approved_date = timezone.now()
#                 result.save()

#                 serializer = DetailedStudentResultSerializer(result)
#                 return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to approve result: {str(e)}")
#             return Response(
#                 {"error": f"Failed to approve result: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=True, methods=["post"])
#     def publish(self, request, pk=None):
#         """Publish a student result"""
#         try:
#             with transaction.atomic():
#                 result = self.get_object()
#                 result.status = "PUBLISHED"
#                 result.save()

#                 serializer = DetailedStudentResultSerializer(result)
#                 return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to publish result: {str(e)}")
#             return Response(
#                 {"error": f"Failed to publish result: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )


# class StudentTermResultViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):
#     queryset = StudentTermResult.objects.all()
#     serializer_class = StudentTermResultSerializer
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = ["student", "academic_session", "term", "status"]
#     search_fields = ["student__full_name"]

#     def get_queryset(self):
#         queryset = super().get_queryset()
#         queryset = queryset.select_related(
#             "student", "academic_session"
#         ).prefetch_related("comments")

#         # Apply section-based filtering for authenticated users
#         if self.request.user.is_authenticated:
#             # Filter results by student's education level
#             section_access = self.get_user_section_access()
#             education_levels = self.get_education_levels_for_sections(section_access)

#             if not education_levels:
#                 return queryset.none()

#             queryset = queryset.filter(student__education_level__in=education_levels)

#         return queryset

#     @action(detail=False, methods=["get"])
#     def by_student(self, request):
#         """Get all term results for a specific student"""
#         student_id = request.query_params.get("student_id")
#         if not student_id:
#             return Response(
#                 {"error": "student_id parameter is required"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         results = self.get_queryset().filter(student_id=student_id)
#         serializer = StudentTermResultSerializer(results, many=True)
#         return Response(serializer.data)

#     @action(detail=True, methods=["get"])
#     def detailed(self, request, pk=None):
#         """Get detailed term result with all subject results"""
#         term_result = self.get_object()
#         serializer = StudentTermResultDetailSerializer(term_result)
#         return Response(serializer.data)

#     @action(detail=False, methods=["post"])
#     def generate_report(self, request):
#         """Generate term report for a student"""
#         student_id = request.data.get("student_id")
#         exam_session_id = request.data.get("exam_session_id")

#         if not all([student_id, exam_session_id]):
#             return Response(
#                 {"error": "student_id and exam_session_id are required"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         try:
#             student = Student.objects.get(id=student_id)
#             exam_session = ExamSession.objects.select_related("academic_session").get(
#                 id=exam_session_id
#             )

#             # Create or get term result based on education level
#             education_level = student.education_level

#             if education_level == "SENIOR_SECONDARY":
#                 # Get next term begins date
#                 next_term_begins = get_next_term_begins_date(exam_session)

#                 term_result, created = SeniorSecondaryTermReport.objects.get_or_create(
#                     student=student,
#                     exam_session=exam_session,
#                     defaults={
#                         "status": "DRAFT",
#                         "stream": getattr(student, "stream", None),
#                         "next_term_begins": next_term_begins,
#                     },
#                 )
#                 # Update next_term_begins if it's not set or if we have a better value
#                 if not term_result.next_term_begins and next_term_begins:
#                     term_result.next_term_begins = next_term_begins
#                     term_result.save()

#                 if created:
#                     term_result.calculate_metrics()
#                     term_result.calculate_class_position()
#                 serializer = SeniorSecondaryTermReportSerializer(term_result)

#             elif education_level == "JUNIOR_SECONDARY":
#                 # Get next term begins date
#                 next_term_begins = get_next_term_begins_date(exam_session)

#                 term_result, created = JuniorSecondaryTermReport.objects.get_or_create(
#                     student=student,
#                     exam_session=exam_session,
#                     defaults={
#                         "status": "DRAFT",
#                         "next_term_begins": next_term_begins,
#                     },
#                 )
#                 # Update next_term_begins if it's not set or if we have a better value
#                 if not term_result.next_term_begins and next_term_begins:
#                     term_result.next_term_begins = next_term_begins
#                     term_result.save()

#                 if created:
#                     term_result.calculate_metrics()
#                     term_result.calculate_class_position()
#                 serializer = JuniorSecondaryTermReportSerializer(term_result)

#             elif education_level == "PRIMARY":
#                 # Get next term begins date
#                 next_term_begins = get_next_term_begins_date(exam_session)

#                 term_result, created = PrimaryTermReport.objects.get_or_create(
#                     student=student,
#                     exam_session=exam_session,
#                     defaults={
#                         "status": "DRAFT",
#                         "next_term_begins": next_term_begins,
#                     },
#                 )
#                 # Update next_term_begins if it's not set or if we have a better value
#                 if not term_result.next_term_begins and next_term_begins:
#                     term_result.next_term_begins = next_term_begins
#                     term_result.save()

#                 if created:
#                     term_result.calculate_metrics()
#                     term_result.calculate_class_position()
#                 serializer = PrimaryTermReportSerializer(term_result)

#             elif education_level == "NURSERY":
#                 # Get next term begins date
#                 next_term_begins = get_next_term_begins_date(exam_session)

#                 term_result, created = NurseryTermReport.objects.get_or_create(
#                     student=student,
#                     exam_session=exam_session,
#                     defaults={
#                         "status": "DRAFT",
#                         "next_term_begins": next_term_begins,
#                     },
#                 )
#                 # Update next_term_begins if it's not set or if we have a better value
#                 if not term_result.next_term_begins and next_term_begins:
#                     term_result.next_term_begins = next_term_begins
#                     term_result.save()

#                 if created:
#                     term_result.calculate_metrics()
#                     term_result.calculate_class_position()
#                 serializer = NurseryTermReportSerializer(term_result)

#             else:
#                 # Fallback to base StudentTermResult
#                 # Get next term begins date
#                 next_term_begins = get_next_term_begins_date(exam_session)

#                 term_result, created = StudentTermResult.objects.get_or_create(
#                     student=student,
#                     academic_session=exam_session.academic_session,
#                     term=exam_session.term,
#                     defaults={
#                         "status": "DRAFT",
#                         "next_term_begins": next_term_begins,
#                     },
#                 )
#                 # Update next_term_begins if it's not set or if we have a better value
#                 if not term_result.next_term_begins and next_term_begins:
#                     term_result.next_term_begins = next_term_begins
#                     term_result.save()

#                 serializer = StudentTermResultSerializer(term_result)

#             return Response(
#                 serializer.data,
#                 status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
#             )

#         except (Student.DoesNotExist, ExamSession.DoesNotExist) as e:
#             return Response(
#                 {"error": f"Invalid student or exam session: {str(e)}"},
#                 status=status.HTTP_404_NOT_FOUND,
#             )
#         except Exception as e:
#             logger.error(f"Failed to generate report: {str(e)}")
#             return Response(
#                 {"error": f"Failed to generate report: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=True, methods=["post"])
#     def approve(self, request, pk=None):
#         """Approve a term result"""
#         try:
#             with transaction.atomic():
#                 term_result = self.get_object()
#                 term_result.status = "APPROVED"
#                 term_result.save()

#                 serializer = StudentTermResultSerializer(term_result)
#                 return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to approve term result: {str(e)}")
#             return Response(
#                 {"error": f"Failed to approve term result: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=True, methods=["post"])
#     def publish(self, request, pk=None):
#         """Publish a term result"""
#         try:
#             with transaction.atomic():
#                 term_result = self.get_object()
#                 term_result.status = "PUBLISHED"
#                 term_result.save()

#                 serializer = StudentTermResultSerializer(term_result)
#                 return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to publish term result: {str(e)}")
#             return Response(
#                 {"error": f"Failed to publish term result: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )


# # ===== SENIOR SECONDARY VIEWSETS =====
# class SeniorSecondaryTermReportViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):
#     """ViewSet for consolidated Senior Secondary term reports"""

#     queryset = SeniorSecondaryTermReport.objects.all().order_by("-created_at")
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = ["student", "exam_session", "status", "is_published", "stream"]
#     search_fields = ["student__full_name"]

#     def get_serializer_class(self):
#         return SeniorSecondaryTermReportSerializer

#     def get_queryset(self):
#         queryset = (
#             super()
#             .get_queryset()
#             .select_related("student", "exam_session", "stream", "published_by")
#             .prefetch_related("subject_results")
#         )

#         # Apply section-based filtering for authenticated users
#         if self.request.user.is_authenticated:
#             # Filter results by student's education level
#             section_access = self.get_user_section_access()
#             education_levels = self.get_education_levels_for_sections(section_access)

#             if not education_levels:
#                 return queryset.none()

#             queryset = queryset.filter(student__education_level__in=education_levels)

#         return queryset

#     @action(detail=True, methods=["post"])
#     def publish(self, request, pk=None):
#         """Publish a term report"""
#         try:
#             with transaction.atomic():
#                 report = self.get_object()
#                 report.is_published = True
#                 report.published_by = request.user
#                 report.published_date = timezone.now()
#                 report.status = "PUBLISHED"
#                 report.save()

#                 serializer = self.get_serializer(report)
#                 return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to publish report: {str(e)}")
#             return Response(
#                 {"error": f"Failed to publish report: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=True, methods=["post"])
#     def calculate_metrics(self, request, pk=None):
#         """Manually trigger metrics calculation"""
#         try:
#             report = self.get_object()
#             report.calculate_metrics()
#             report.calculate_class_position()

#             serializer = self.get_serializer(report)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to calculate metrics: {str(e)}")
#             return Response(
#                 {"error": f"Failed to calculate metrics: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=False, methods=["post"])
#     def bulk_publish(self, request):
#         """Bulk publish term reports"""
#         report_ids = request.data.get("report_ids", [])
#         if not report_ids:
#             return Response(
#                 {"error": "report_ids are required"}, status=status.HTTP_400_BAD_REQUEST
#             )

#         try:
#             with transaction.atomic():
#                 reports = self.get_queryset().filter(id__in=report_ids)
#                 updated_count = reports.update(
#                     is_published=True,
#                     published_by=request.user,
#                     published_date=timezone.now(),
#                     status="PUBLISHED",
#                 )

#                 return Response(
#                     {
#                         "message": f"Successfully published {updated_count} reports",
#                         "updated_count": updated_count,
#                     }
#                 )
#         except Exception as e:
#             logger.error(f"Failed to bulk publish reports: {str(e)}")
#             return Response(
#                 {"error": f"Failed to bulk publish reports: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )


# class SeniorSecondarySessionReportViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):
#     """ViewSet for consolidated Senior Secondary session reports"""

#     queryset = SeniorSecondarySessionReport.objects.all().order_by("-created_at")
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = [
#         "student",
#         "academic_session",
#         "status",
#         "is_published",
#         "stream",
#     ]
#     search_fields = ["student__full_name"]

#     def get_serializer_class(self):
#         return SeniorSecondarySessionReportSerializer

#     def get_queryset(self):
#         queryset = (
#             super()
#             .get_queryset()
#             .select_related("student", "academic_session", "stream")
#             .prefetch_related("subject_results")
#         )

#         # Apply section-based filtering for authenticated users
#         if self.request.user.is_authenticated:
#             # Filter results by student's education level
#             section_access = self.get_user_section_access()
#             education_levels = self.get_education_levels_for_sections(section_access)

#             if not education_levels:
#                 return queryset.none()

#             queryset = queryset.filter(student__education_level__in=education_levels)

#         return queryset

#     @action(detail=True, methods=["post"])
#     def calculate_metrics(self, request, pk=None):
#         """Manually trigger session metrics calculation"""
#         try:
#             report = self.get_object()
#             report.calculate_session_metrics()
#             report.calculate_class_position()

#             serializer = self.get_serializer(report)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to calculate session metrics: {str(e)}")
#             return Response(
#                 {"error": f"Failed to calculate session metrics: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=False, methods=["post"])
#     def generate_session_report(self, request):
#         """Generate session report for a student"""
#         student_id = request.data.get("student_id")
#         academic_session_id = request.data.get("academic_session_id")

#         if not all([student_id, academic_session_id]):
#             return Response(
#                 {"error": "student_id and academic_session_id are required"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         try:
#             student = Student.objects.get(id=student_id)
#             academic_session = AcademicSession.objects.get(id=academic_session_id)

#             session_report, created = (
#                 SeniorSecondarySessionReport.objects.get_or_create(
#                     student=student,
#                     academic_session=academic_session,
#                     defaults={
#                         "status": "DRAFT",
#                         "stream": getattr(student, "stream", None),
#                     },
#                 )
#             )

#             if created:
#                 session_report.calculate_session_metrics()
#                 session_report.calculate_class_position()

#             serializer = self.get_serializer(session_report)
#             return Response(
#                 serializer.data,
#                 status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
#             )

#         except (Student.DoesNotExist, AcademicSession.DoesNotExist) as e:
#             return Response(
#                 {"error": f"Invalid student or academic session: {str(e)}"},
#                 status=status.HTTP_404_NOT_FOUND,
#             )
#         except Exception as e:
#             logger.error(f"Failed to generate session report: {str(e)}")
#             return Response(
#                 {"error": f"Failed to generate session report: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )


# class SeniorSecondaryResultViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):
#     """ViewSet for Senior Secondary results"""

#     queryset = SeniorSecondaryResult.objects.all().order_by("-created_at")
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = [
#         "student",
#         "subject",
#         "exam_session",
#         "status",
#         "is_passed",
#         "stream",
#     ]
#     search_fields = ["student__full_name", "subject__name"]

#     def get_serializer_class(self):
#         if self.action in ["create", "update", "partial_update"]:
#             return SeniorSecondaryResultCreateUpdateSerializer
#         return SeniorSecondaryResultSerializer

#     def get_queryset(self):
#         queryset = (
#             super()
#             .get_queryset()
#             .select_related(
#                 "student",
#                 "subject",
#                 "exam_session",
#                 "grading_system",
#                 "stream",
#                 "entered_by",
#                 "approved_by",
#                 "published_by",
#                 "last_edited_by",
#             )
#         )

#         # Apply section-based filtering for authenticated users
#         if self.request.user.is_authenticated:
#             # Filter results by student's education level
#             section_access = self.get_user_section_access()
#             education_levels = self.get_education_levels_for_sections(section_access)

#             if not education_levels:
#                 return queryset.none()

#             queryset = queryset.filter(student__education_level__in=education_levels)

#         return queryset

#     def create(self, request, *args, **kwargs):
#         """Create a new Senior Secondary result"""
#         try:
#             with transaction.atomic():
#                 request.data["entered_by"] = request.user.id

#                 serializer = self.get_serializer(data=request.data)
#                 serializer.is_valid(raise_exception=True)
#                 result = serializer.save()

#                 detailed_serializer = SeniorSecondaryResultSerializer(result)
#                 return Response(
#                     detailed_serializer.data, status=status.HTTP_201_CREATED
#                 )
#         except Exception as e:
#             logger.error(f"Failed to create result: {str(e)}")
#             return Response(
#                 {"error": f"Failed to create result: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     def update(self, request, *args, **kwargs):
#         """Update a Senior Secondary result"""
#         try:
#             with transaction.atomic():
#                 instance = self.get_object()
#                 serializer = self.get_serializer(
#                     instance, data=request.data, partial=kwargs.get("partial", False)
#                 )
#                 serializer.is_valid(raise_exception=True)
#                 result = serializer.save()

#                 detailed_serializer = SeniorSecondaryResultSerializer(result)
#                 return Response(detailed_serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to update result: {str(e)}")
#             return Response(
#                 {"error": f"Failed to update result: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=True, methods=["post"])
#     def approve(self, request, pk=None):
#         with transaction.atomic():
#             result = self.get_object()
#             result.status = "APPROVED"
#             result.approved_by = request.user
#             result.approved_date = timezone.now()
#             result.save()
#             return Response(SeniorSecondaryResultSerializer(result).data)

#     @action(detail=True, methods=["post"])
#     def publish(self, request, pk=None):
#         with transaction.atomic():
#             result = self.get_object()
#             result.status = "PUBLISHED"
#             result.published_by = request.user
#             result.published_date = timezone.now()
#             result.save()
#             return Response(SeniorSecondaryResultSerializer(result).data)

#     @action(detail=False, methods=["post"])
#     def bulk_create(self, request):
#         """Bulk create Senior Secondary results"""
#         results_data = request.data.get("results", [])
#         created_results = []
#         errors = []

#         try:
#             with transaction.atomic():
#                 for i, result_data in enumerate(results_data):
#                     try:
#                         result_data["entered_by"] = request.user.id
#                         serializer = self.get_serializer(data=result_data)
#                         serializer.is_valid(raise_exception=True)
#                         result = serializer.save()
#                         created_results.append(
#                             SeniorSecondaryResultSerializer(result).data
#                         )
#                     except Exception as e:
#                         errors.append(
#                             {"index": i, "error": str(e), "data": result_data}
#                         )

#                 if errors and not created_results:
#                     return Response(
#                         {"error": "Failed to create any results", "errors": errors},
#                         status=status.HTTP_400_BAD_REQUEST,
#                     )

#                 response_data = {
#                     "message": f"Successfully created {len(created_results)} results",
#                     "results": created_results,
#                 }

#                 if errors:
#                     response_data["partial_success"] = True
#                     response_data["errors"] = errors

#                 return Response(response_data, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             logger.error(f"Failed to bulk create results: {str(e)}")
#             return Response(
#                 {"error": f"Failed to bulk create results: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=False, methods=["get"])
#     def class_statistics(self, request):
#         """Get class statistics for Senior Secondary results"""
#         exam_session = request.query_params.get("exam_session")
#         student_class = request.query_params.get("student_class")
#         subject = request.query_params.get("subject")

#         filters = {}
#         if exam_session:
#             filters["exam_session"] = exam_session
#         if student_class:
#             filters["student__student_class"] = student_class
#         if subject:
#             filters["subject"] = subject

#         filters["status__in"] = ["APPROVED", "PUBLISHED"]

#         results = self.get_queryset().filter(**filters)

#         if not results.exists():
#             return Response(
#                 {"error": "No results found"}, status=status.HTTP_404_NOT_FOUND
#             )

#         scores = list(results.values_list("total_score", flat=True))
#         statistics = {
#             "total_students": len(scores),
#             "class_average": sum(scores) / len(scores) if scores else 0,
#             "highest_score": max(scores) if scores else 0,
#             "lowest_score": min(scores) if scores else 0,
#             "students_passed": results.filter(is_passed=True).count(),
#             "students_failed": results.filter(is_passed=False).count(),
#         }

#         return Response(statistics)

#     @action(detail=False, methods=["get"])
#     def grade_distribution(self, request):
#         """Get grade distribution for Senior Secondary results"""
#         exam_session = request.query_params.get("exam_session")
#         student_class = request.query_params.get("student_class")

#         filters = {"status__in": ["APPROVED", "PUBLISHED"]}
#         if exam_session:
#             filters["exam_session"] = exam_session
#         if student_class:
#             filters["student__student_class"] = student_class

#         results = self.get_queryset().filter(**filters)

#         grade_stats = (
#             results.values("grade").annotate(count=Count("grade")).order_by("grade")
#         )

#         return Response(list(grade_stats))


# class SeniorSecondarySessionResultViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):
#     """ViewSet for Senior Secondary session results"""

#     queryset = SeniorSecondarySessionResult.objects.all().order_by("-created_at")
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = ["student", "subject", "academic_session", "status", "stream"]
#     search_fields = ["student__full_name", "subject__name"]

#     def get_serializer_class(self):
#         if self.action in ["create", "update", "partial_update"]:
#             return SeniorSecondarySessionResultCreateUpdateSerializer
#         return SeniorSecondarySessionResultSerializer

#     def get_queryset(self):
#         queryset = (
#             super()
#             .get_queryset()
#             .select_related("student", "subject", "academic_session", "stream")
#         )

#         # Apply section-based filtering for authenticated users
#         if self.request.user.is_authenticated:
#             # Filter results by student's education level
#             section_access = self.get_user_section_access()
#             education_levels = self.get_education_levels_for_sections(section_access)

#             if not education_levels:
#                 return queryset.none()

#             queryset = queryset.filter(student__education_level__in=education_levels)

#         return queryset

#     def create(self, request, *args, **kwargs):
#         """Create a new Senior Secondary session result"""
#         try:
#             with transaction.atomic():
#                 serializer = self.get_serializer(data=request.data)
#                 serializer.is_valid(raise_exception=True)
#                 result = serializer.save()

#                 detailed_serializer = SeniorSecondarySessionResultSerializer(result)
#                 return Response(
#                     detailed_serializer.data, status=status.HTTP_201_CREATED
#                 )
#         except Exception as e:
#             logger.error(f"Failed to create session result: {str(e)}")
#             return Response(
#                 {"error": f"Failed to create session result: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )


# # ===== JUNIOR SECONDARY VIEWSETS =====
# class JuniorSecondaryTermReportViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):
#     """ViewSet for consolidated Junior Secondary term reports"""

#     queryset = JuniorSecondaryTermReport.objects.all().order_by("-created_at")
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = ["student", "exam_session", "status", "is_published"]
#     search_fields = ["student__full_name"]

#     def get_serializer_class(self):
#         return JuniorSecondaryTermReportSerializer

#     def get_queryset(self):
#         queryset = (
#             super()
#             .get_queryset()
#             .select_related("student", "exam_session", "published_by")
#             .prefetch_related("subject_results")
#         )

#         # Apply section-based filtering for authenticated users
#         if self.request.user.is_authenticated:
#             # Filter results by student's education level
#             section_access = self.get_user_section_access()
#             education_levels = self.get_education_levels_for_sections(section_access)

#             if not education_levels:
#                 return queryset.none()

#             queryset = queryset.filter(student__education_level__in=education_levels)

#         return queryset

#     @action(detail=True, methods=["post"])
#     def publish(self, request, pk=None):
#         """Publish a Junior Secondary term report"""
#         try:
#             with transaction.atomic():
#                 report = self.get_object()
#                 report.is_published = True
#                 report.published_by = request.user
#                 report.published_date = timezone.now()
#                 report.status = "PUBLISHED"
#                 report.save()

#                 serializer = self.get_serializer(report)
#                 return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to publish report: {str(e)}")
#             return Response(
#                 {"error": f"Failed to publish report: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=True, methods=["post"])
#     def calculate_metrics(self, request, pk=None):
#         """Manually trigger metrics calculation"""
#         try:
#             report = self.get_object()
#             report.calculate_metrics()
#             report.calculate_class_position()

#             serializer = self.get_serializer(report)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to calculate metrics: {str(e)}")
#             return Response(
#                 {"error": f"Failed to calculate metrics: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )


# class JuniorSecondaryResultViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):
#     """ViewSet for Junior Secondary results"""

#     queryset = JuniorSecondaryResult.objects.all().order_by("-created_at")
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = ["student", "subject", "exam_session", "status", "is_passed"]
#     search_fields = ["student__full_name", "subject__name"]

#     def get_serializer_class(self):
#         if self.action in ["create", "update", "partial_update"]:
#             return JuniorSecondaryResultCreateUpdateSerializer
#         return JuniorSecondaryResultSerializer

#     def get_queryset(self):
#         queryset = (
#             super()
#             .get_queryset()
#             .select_related(
#                 "student",
#                 "subject",
#                 "exam_session",
#                 "grading_system",
#                 "entered_by",
#                 "approved_by",
#                 "published_by",
#                 "last_edited_by",
#             )
#         )

#         # Apply section-based filtering for authenticated users
#         if self.request.user.is_authenticated:
#             # Filter results by student's education level
#             section_access = self.get_user_section_access()
#             education_levels = self.get_education_levels_for_sections(section_access)

#             if not education_levels:
#                 return queryset.none()

#             queryset = queryset.filter(student__education_level__in=education_levels)

#         return queryset

#     def create(self, request, *args, **kwargs):
#         """Create a new Junior Secondary result"""
#         try:
#             with transaction.atomic():
#                 request.data["entered_by"] = request.user.id

#                 serializer = self.get_serializer(data=request.data)
#                 serializer.is_valid(raise_exception=True)
#                 result = serializer.save()

#                 detailed_serializer = JuniorSecondaryResultSerializer(result)
#                 return Response(
#                     detailed_serializer.data, status=status.HTTP_201_CREATED
#                 )
#         except Exception as e:
#             logger.error(f"Failed to create result: {str(e)}")
#             return Response(
#                 {"error": f"Failed to create result: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=True, methods=["post"])
#     def approve(self, request, pk=None):
#         with transaction.atomic():
#             result = self.get_object()
#             result.status = "APPROVED"
#             result.approved_by = request.user
#             result.approved_date = timezone.now()
#             result.save()
#             return Response(JuniorSecondaryResultSerializer(result).data)

#     @action(detail=True, methods=["post"])
#     def publish(self, request, pk=None):
#         with transaction.atomic():
#             result = self.get_object()
#             result.status = "PUBLISHED"
#             result.published_by = request.user
#             result.published_date = timezone.now()
#             result.save()
#             return Response(JuniorSecondaryResultSerializer(result).data)

#     @action(detail=False, methods=["post"])
#     def bulk_create(self, request):
#         """Bulk create Junior Secondary results"""
#         results_data = request.data.get("results", [])
#         created_results = []
#         errors = []

#         try:
#             with transaction.atomic():
#                 for i, result_data in enumerate(results_data):
#                     try:
#                         result_data["entered_by"] = request.user.id
#                         serializer = self.get_serializer(data=result_data)
#                         serializer.is_valid(raise_exception=True)
#                         result = serializer.save()
#                         created_results.append(
#                             JuniorSecondaryResultSerializer(result).data
#                         )
#                     except Exception as e:
#                         errors.append(
#                             {"index": i, "error": str(e), "data": result_data}
#                         )

#                 response_data = {
#                     "message": f"Successfully created {len(created_results)} results",
#                     "results": created_results,
#                 }

#                 if errors:
#                     response_data["errors"] = errors

#                 return Response(response_data, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             logger.error(f"Failed to bulk create results: {str(e)}")
#             return Response(
#                 {"error": f"Failed to bulk create results: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=False, methods=["get"])
#     def class_statistics(self, request):
#         """Get class statistics for Junior Secondary results"""
#         return self._get_class_statistics(request, JuniorSecondaryResult)


# # ===== PRIMARY VIEWSETS =====
# class PrimaryTermReportViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):
#     """ViewSet for consolidated Primary term reports"""

#     queryset = PrimaryTermReport.objects.all().order_by("-created_at")
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = ["student", "exam_session", "status", "is_published"]
#     search_fields = ["student__full_name"]

#     def get_serializer_class(self):
#         return PrimaryTermReportSerializer

#     def get_queryset(self):
#         queryset = (
#             super()
#             .get_queryset()
#             .select_related("student", "exam_session", "published_by")
#             .prefetch_related("subject_results")
#         )

#         # Apply section-based filtering for authenticated users
#         if self.request.user.is_authenticated:
#             # Filter results by student's education level
#             section_access = self.get_user_section_access()
#             education_levels = self.get_education_levels_for_sections(section_access)

#             if not education_levels:
#                 return queryset.none()

#             queryset = queryset.filter(student__education_level__in=education_levels)

#         return queryset

#     @action(detail=True, methods=["post"])
#     def publish(self, request, pk=None):
#         """Publish a Primary term report"""
#         try:
#             with transaction.atomic():
#                 report = self.get_object()
#                 report.is_published = True
#                 report.published_by = request.user
#                 report.published_date = timezone.now()
#                 report.status = "PUBLISHED"
#                 report.save()

#                 serializer = self.get_serializer(report)
#                 return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to publish report: {str(e)}")
#             return Response(
#                 {"error": f"Failed to publish report: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=True, methods=["post"])
#     def calculate_metrics(self, request, pk=None):
#         """Manually trigger metrics calculation"""
#         try:
#             report = self.get_object()
#             report.calculate_metrics()
#             report.calculate_class_position()

#             serializer = self.get_serializer(report)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to calculate metrics: {str(e)}")
#             return Response(
#                 {"error": f"Failed to calculate metrics: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )


# class PrimaryResultViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):
#     """ViewSet for Primary results"""

#     queryset = PrimaryResult.objects.all().order_by("-created_at")
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = ["student", "subject", "exam_session", "status", "is_passed"]
#     search_fields = ["student__full_name", "subject__name"]

#     def get_serializer_class(self):
#         if self.action in ["create", "update", "partial_update"]:
#             return PrimaryResultCreateUpdateSerializer
#         return PrimaryResultSerializer

#     def get_queryset(self):
#         queryset = (
#             super()
#             .get_queryset()
#             .select_related(
#                 "student",
#                 "subject",
#                 "exam_session",
#                 "grading_system",
#                 "entered_by",
#                 "approved_by",
#                 "published_by",
#                 "last_edited_by",
#             )
#         )

#         # Apply section-based filtering for authenticated users
#         if self.request.user.is_authenticated:
#             # Filter results by student's education level
#             section_access = self.get_user_section_access()
#             education_levels = self.get_education_levels_for_sections(section_access)

#             if not education_levels:
#                 return queryset.none()

#             queryset = queryset.filter(student__education_level__in=education_levels)

#         return queryset

#     def create(self, request, *args, **kwargs):
#         """Create a new Primary result"""
#         try:
#             with transaction.atomic():
#                 request.data["entered_by"] = request.user.id

#                 serializer = self.get_serializer(data=request.data)
#                 serializer.is_valid(raise_exception=True)
#                 result = serializer.save()

#                 detailed_serializer = PrimaryResultSerializer(result)
#                 return Response(
#                     detailed_serializer.data, status=status.HTTP_201_CREATED
#                 )
#         except Exception as e:
#             logger.error(f"Failed to create result: {str(e)}")
#             return Response(
#                 {"error": f"Failed to create result: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=True, methods=["post"])
#     def approve(self, request, pk=None):
#         with transaction.atomic():
#             result = self.get_object()
#             result.status = "APPROVED"
#             result.approved_by = request.user
#             result.approved_date = timezone.now()
#             result.save()
#             return Response(PrimaryResultSerializer(result).data)

#     @action(detail=True, methods=["post"])
#     def publish(self, request, pk=None):
#         with transaction.atomic():
#             result = self.get_object()
#             result.status = "PUBLISHED"
#             result.published_by = request.user
#             result.published_date = timezone.now()
#             result.save()
#             return Response(PrimaryResultSerializer(result).data)

#     @action(detail=False, methods=["post"])
#     def bulk_create(self, request):
#         """Bulk create Primary results"""
#         results_data = request.data.get("results", [])
#         created_results = []
#         errors = []

#         try:
#             with transaction.atomic():
#                 for i, result_data in enumerate(results_data):
#                     try:
#                         result_data["entered_by"] = request.user.id
#                         serializer = self.get_serializer(data=result_data)
#                         serializer.is_valid(raise_exception=True)
#                         result = serializer.save()
#                         created_results.append(PrimaryResultSerializer(result).data)
#                     except Exception as e:
#                         errors.append(
#                             {"index": i, "error": str(e), "data": result_data}
#                         )

#                 response_data = {
#                     "message": f"Successfully created {len(created_results)} results",
#                     "results": created_results,
#                 }

#                 if errors:
#                     response_data["errors"] = errors

#                 return Response(response_data, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             logger.error(f"Failed to bulk create results: {str(e)}")
#             return Response(
#                 {"error": f"Failed to bulk create results: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=False, methods=["get"])
#     def class_statistics(self, request):
#         """Get class statistics for Primary results"""
#         return self._get_class_statistics(request, PrimaryResult)


# # ===== NURSERY VIEWSETS =====
# class NurseryTermReportViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):
#     """ViewSet for consolidated Nursery term reports"""

#     queryset = NurseryTermReport.objects.all().order_by("-created_at")
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = ["student", "exam_session", "status", "is_published"]
#     search_fields = ["student__full_name"]

#     def get_serializer_class(self):
#         return NurseryTermReportSerializer

#     def get_queryset(self):
#         queryset = (
#             super()
#             .get_queryset()
#             .select_related("student", "exam_session", "published_by")
#             .prefetch_related("subject_results")
#         )

#         # Apply section-based filtering for authenticated users
#         if self.request.user.is_authenticated:
#             # Filter results by student's education level
#             section_access = self.get_user_section_access()
#             education_levels = self.get_education_levels_for_sections(section_access)

#             if not education_levels:
#                 return queryset.none()

#             queryset = queryset.filter(student__education_level__in=education_levels)

#         return queryset

#     @action(detail=True, methods=["post"])
#     def publish(self, request, pk=None):
#         """Publish a Nursery term report"""
#         try:
#             with transaction.atomic():
#                 report = self.get_object()
#                 report.is_published = True
#                 report.published_by = request.user
#                 report.published_date = timezone.now()
#                 report.status = "PUBLISHED"
#                 report.save()

#                 serializer = self.get_serializer(report)
#                 return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to publish report: {str(e)}")
#             return Response(
#                 {"error": f"Failed to publish report: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=True, methods=["post"])
#     def calculate_metrics(self, request, pk=None):
#         """Manually trigger metrics calculation"""
#         try:
#             report = self.get_object()
#             report.calculate_metrics()
#             report.calculate_class_position()

#             serializer = self.get_serializer(report)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to calculate metrics: {str(e)}")
#             return Response(
#                 {"error": f"Failed to calculate metrics: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )


# class NurseryResultViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):
#     """ViewSet for Nursery results"""

#     queryset = NurseryResult.objects.all().order_by("-created_at")
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = ["student", "subject", "exam_session", "status", "is_passed"]
#     search_fields = ["student__full_name", "subject__name"]

#     def get_serializer_class(self):
#         if self.action in ["create", "update", "partial_update"]:
#             return NurseryResultCreateUpdateSerializer
#         return NurseryResultSerializer

#     def get_queryset(self):
#         queryset = (
#             super()
#             .get_queryset()
#             .select_related(
#                 "student",
#                 "subject",
#                 "exam_session",
#                 "grading_system",
#                 "entered_by",
#                 "approved_by",
#                 "published_by",
#                 "last_edited_by",
#             )
#         )

#         # Apply section-based filtering for authenticated users
#         if self.request.user.is_authenticated:
#             # Filter results by student's education level
#             section_access = self.get_user_section_access()
#             education_levels = self.get_education_levels_for_sections(section_access)

#             if not education_levels:
#                 return queryset.none()

#             queryset = queryset.filter(student__education_level__in=education_levels)

#         return queryset

#     def create(self, request, *args, **kwargs):
#         """Create a new Nursery result"""
#         try:
#             with transaction.atomic():
#                 request.data["entered_by"] = request.user.id

#                 serializer = self.get_serializer(data=request.data)
#                 serializer.is_valid(raise_exception=True)
#                 result = serializer.save()

#                 detailed_serializer = NurseryResultSerializer(result)
#                 return Response(
#                     detailed_serializer.data, status=status.HTTP_201_CREATED
#                 )
#         except Exception as e:
#             logger.error(f"Failed to create result: {str(e)}")
#             return Response(
#                 {"error": f"Failed to create result: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=True, methods=["post"])
#     def approve(self, request, pk=None):
#         with transaction.atomic():
#             result = self.get_object()
#             result.status = "APPROVED"
#             result.approved_by = request.user
#             result.approved_date = timezone.now()
#             result.save()
#             return Response(NurseryResultSerializer(result).data)

#     @action(detail=True, methods=["post"])
#     def publish(self, request, pk=None):
#         with transaction.atomic():
#             result = self.get_object()
#             result.status = "PUBLISHED"
#             result.published_by = request.user
#             result.published_date = timezone.now()
#             result.save()
#             return Response(NurseryResultSerializer(result).data)

#     @action(detail=False, methods=["post"])
#     def bulk_create(self, request):
#         """Bulk create Nursery results"""
#         results_data = request.data.get("results", [])
#         created_results = []
#         errors = []

#         try:
#             with transaction.atomic():
#                 for i, result_data in enumerate(results_data):
#                     try:
#                         result_data["entered_by"] = request.user.id
#                         serializer = self.get_serializer(data=result_data)
#                         serializer.is_valid(raise_exception=True)
#                         result = serializer.save()
#                         created_results.append(NurseryResultSerializer(result).data)
#                     except Exception as e:
#                         errors.append(
#                             {"index": i, "error": str(e), "data": result_data}
#                         )

#                 response_data = {
#                     "message": f"Successfully created {len(created_results)} results",
#                     "results": created_results,
#                 }

#                 if errors:
#                     response_data["errors"] = errors

#                 return Response(response_data, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             logger.error(f"Failed to bulk create results: {str(e)}")
#             return Response(
#                 {"error": f"Failed to bulk create results: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=False, methods=["get"])
#     def class_statistics(self, request):
#         """Get class statistics for Nursery results"""
#         exam_session = request.query_params.get("exam_session")
#         student_class = request.query_params.get("student_class")
#         subject = request.query_params.get("subject")

#         filters = {}
#         if exam_session:
#             filters["exam_session"] = exam_session
#         if student_class:
#             filters["student__student_class"] = student_class
#         if subject:
#             filters["subject"] = subject

#         filters["status__in"] = ["APPROVED", "PUBLISHED"]

#         results = self.get_queryset().filter(**filters)

#         if not results.exists():
#             return Response(
#                 {"error": "No results found"}, status=status.HTTP_404_NOT_FOUND
#             )

#         scores = list(results.values_list("percentage", flat=True))
#         statistics = {
#             "total_students": len(scores),
#             "class_average": sum(scores) / len(scores) if scores else 0,
#             "highest_score": max(scores) if scores else 0,
#             "lowest_score": min(scores) if scores else 0,
#             "students_passed": results.filter(is_passed=True).count(),
#             "students_failed": results.filter(is_passed=False).count(),
#         }

#         return Response(statistics)


# # ===== SUPPORTING VIEWSETS =====
# class ResultSheetViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
#     queryset = ResultSheet.objects.all()
#     serializer_class = ResultSheetSerializer
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend]
#     filterset_fields = ["exam_session", "student_class", "education_level", "status"]

#     def get_queryset(self):
#         return (
#             super()
#             .get_queryset()
#             .select_related("exam_session", "prepared_by", "approved_by")
#         )

#     @action(detail=True, methods=["post"])
#     def approve(self, request, pk=None):
#         """Approve a result sheet"""
#         try:
#             with transaction.atomic():
#                 result_sheet = self.get_object()
#                 result_sheet.status = "APPROVED"
#                 result_sheet.approved_by = request.user
#                 result_sheet.approved_date = timezone.now()
#                 result_sheet.save()

#                 return Response(ResultSheetSerializer(result_sheet).data)
#         except Exception as e:
#             logger.error(f"Failed to approve result sheet: {str(e)}")
#             return Response(
#                 {"error": f"Failed to approve result sheet: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#     @action(detail=False, methods=["post"])
#     def generate_sheet(self, request):
#         """Generate result sheet for a class"""
#         exam_session_id = request.data.get("exam_session_id")
#         student_class = request.data.get("student_class")
#         education_level = request.data.get("education_level")

#         if not all([exam_session_id, student_class, education_level]):
#             return Response(
#                 {
#                     "error": "exam_session_id, student_class, and education_level are required"
#                 },
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         try:
#             exam_session = ExamSession.objects.get(id=exam_session_id)

#             # Check if sheet already exists
#             existing_sheet = ResultSheet.objects.filter(
#                 exam_session=exam_session,
#                 student_class=student_class,
#                 education_level=education_level,
#             ).first()

#             if existing_sheet:
#                 return Response(
#                     ResultSheetSerializer(existing_sheet).data,
#                     status=status.HTTP_200_OK,
#                 )

#             # Create new result sheet
#             result_sheet = ResultSheet.objects.create(
#                 exam_session=exam_session,
#                 student_class=student_class,
#                 education_level=education_level,
#                 prepared_by=request.user,
#                 status="DRAFT",
#             )

#             return Response(
#                 ResultSheetSerializer(result_sheet).data, status=status.HTTP_201_CREATED
#             )

#         except ExamSession.DoesNotExist:
#             return Response(
#                 {"error": "Exam session not found"}, status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to generate result sheet: {str(e)}")
#             return Response(
#                 {"error": f"Failed to generate result sheet: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )


# class AssessmentScoreViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
#     queryset = AssessmentScore.objects.all()
#     serializer_class = AssessmentScoreSerializer
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend]
#     filterset_fields = ["student_result", "assessment_type"]

#     def get_queryset(self):
#         return (
#             super().get_queryset().select_related("student_result", "assessment_type")
#         )


# class ResultCommentViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
#     queryset = ResultComment.objects.all()
#     serializer_class = ResultCommentSerializer
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend]
#     filterset_fields = ["student_result", "term_result", "comment_type"]

#     def get_queryset(self):
#         return (
#             super()
#             .get_queryset()
#             .select_related("student_result", "term_result", "commented_by")
#         )

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.template.loader import render_to_string
from django.http import HttpResponse
import tempfile
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count, Max, Min, F, Case, When, DecimalField
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
import logging
from utils.section_filtering import SectionFilterMixin, AutoSectionFilterMixin
from .report_generation import get_report_generator
from .serializers import ReportGenerationSerializer
from utils.teacher_portal_permissions import TeacherPortalCheckMixin

from .models import (
    StudentResult,
    StudentTermResult,
    ExamSession,
    ResultSheet,
    AssessmentScore,
    ResultComment,
    ResultTemplate,
    GradingSystem,
    Grade,
    AssessmentType,
    ScoringConfiguration,
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
    ConsolidatedTermReportSerializer,
    ConsolidatedResultSerializer,
    ResultCommentCreateSerializer,
    ResultTemplateCreateUpdateSerializer,
    ResultTemplateSerializer,
    BulkStatusUpdateSerializer,
    PublishResultSerializer,
    StudentMinimalSerializer,
    SubjectPerformanceSerializer,
    BulkResultUpdateSerializer,
    ResultExportSerializer,
    ResultImportSerializer,
    BulkReportGenerationSerializer,
    ReportGenerationSerializer,
)
from students.models import Student
from academics.models import AcademicSession, Term
from classroom.models import Stream
from schoolSettings.models import SchoolSettings
from django.shortcuts import get_object_or_404
from subject.models import Subject
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.http import HttpResponse
import tempfile

from .serializers import ReportGenerationSerializer
from subject.models import Subject


logger = logging.getLogger(__name__)


def get_next_term_begins_date(exam_session):
    """Get the next term begins date for the given exam session"""
    try:
        if (
            not hasattr(exam_session, "academic_session")
            or not exam_session.academic_session
        ):
            logger.error(
                f"Exam session {exam_session.id} does not have academic_session relationship loaded"
            )
            return None

        current_term_name = exam_session.term
        current_academic_session = exam_session.academic_session

        logger.info(
            f"Getting next term begins date for term: {current_term_name}, academic_session: {current_academic_session.name}"
        )

        term_order = ["FIRST", "SECOND", "THIRD"]

        if current_term_name not in term_order:
            logger.error(f"Invalid term name: {current_term_name}")
            return None

        current_index = term_order.index(current_term_name)

        if current_index < len(term_order) - 1:
            next_term_name = term_order[current_index + 1]
            next_term = Term.objects.filter(
                academic_session=current_academic_session,
                name=next_term_name,
                is_active=True,
            ).first()

            if next_term and next_term.next_term_begins:
                logger.info(
                    f"Found next term {next_term_name} with next_term_begins: {next_term.next_term_begins}"
                )
                return next_term.next_term_begins
            else:
                logger.warning(
                    f"Next term {next_term_name} not found or has no next_term_begins date"
                )
        else:
            next_academic_session = (
                AcademicSession.objects.filter(
                    start_date__gt=current_academic_session.end_date, is_active=True
                )
                .order_by("start_date")
                .first()
            )

            if next_academic_session:
                next_term = Term.objects.filter(
                    academic_session=next_academic_session, name="FIRST", is_active=True
                ).first()

                if next_term and next_term.next_term_begins:
                    logger.info(
                        f"Found first term of next academic session with next_term_begins: {next_term.next_term_begins}"
                    )
                    return next_term.next_term_begins
                else:
                    logger.warning(
                        f"First term of next academic session not found or has no next_term_begins date"
                    )
            else:
                logger.warning(
                    f"No next academic session found after {current_academic_session.name}"
                )

        return None
    except Exception as e:
        logger.error(f"Error getting next term begins date: {e}")
        return None


def check_user_permission(user, permission_name):
    """Check if user has specific permission"""
    if user.is_superuser or user.is_staff:
        return True

    # Check for role-based permissions
    role = getattr(user, "role", None)
    if role in ["admin", "superadmin", "principal"]:
        return True

    # Check Django permissions
    return user.has_perm(permission_name)


def validate_result_for_approval(result):
    """Validate that result is ready for approval"""
    errors = []

    # Check if scores are valid
    if not result.total_score or result.total_score < 0:
        errors.append("Total score is invalid")

    # Check if exam score exists
    if not hasattr(result, "exam_score") or result.exam_score is None:
        errors.append("Exam score is missing")

    # Check if grade is calculated
    if not result.grade:
        errors.append("Grade has not been calculated")

    return errors


# ===== BASE CONFIGURATION VIEWSETS =====
class GradingSystemViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
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
        grading_system = self.get_object()
        grading_system.is_active = True
        grading_system.save()
        return Response(GradingSystemSerializer(grading_system).data)

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        grading_system = self.get_object()
        grading_system.is_active = False
        grading_system.save()
        return Response(GradingSystemSerializer(grading_system).data)


class GradeViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["grading_system", "is_passing"]

    def get_queryset(self):
        return super().get_queryset().select_related("grading_system")


class AssessmentTypeViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    queryset = AssessmentType.objects.all()
    serializer_class = AssessmentTypeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["education_level", "is_active"]
    search_fields = ["name", "code"]


class ExamSessionViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
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
        exam_session = self.get_object()
        exam_session.is_published = True
        exam_session.published_by = request.user
        exam_session.published_date = timezone.now()
        exam_session.save()
        return Response(ExamSessionSerializer(exam_session).data)

    @action(detail=True, methods=["get"])
    def statistics(self, request, pk=None):
        exam_session = self.get_object()

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
class ScoringConfigurationViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
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
        configs = self.get_queryset().filter(is_default=True, is_active=True)
        serializer = ScoringConfigurationSerializer(configs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_result_type(self, request):
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
        config = self.get_object()

        with transaction.atomic():
            ScoringConfiguration.objects.filter(
                education_level=config.education_level, result_type=config.result_type
            ).update(is_default=False)

            config.is_default = True
            config.save()

        return Response(ScoringConfigurationSerializer(config).data)


# ====================================================================================
# SENIOR SECONDARY VIEWSETS
# ====================================================================================


class SeniorSecondaryResultViewSet(
    TeacherPortalCheckMixin, SectionFilterMixin, viewsets.ModelViewSet
):
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
    search_fields = [
        "student__user__first_name",
        "student__user__last_name",
        "subject__name",
    ]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return SeniorSecondaryResultCreateUpdateSerializer
        return SeniorSecondaryResultSerializer

    def get_queryset(self):
        queryset = (
            super(viewsets.ModelViewSet, self)
            .get_queryset()
            .select_related(
                "student",
                "student__user",
                "subject",
                "exam_session",
                "grading_system",
                "entered_by",
                "approved_by",
                "published_by",
                "last_edited_by",
            )
        )

        user = self.request.user

        # ===== SUPER ADMIN / STAFF =====
        if user.is_superuser or user.is_staff:
            logger.info(
                f"✅ Super admin/staff {user.username} - Full access to {queryset.count()} results"
            )
            return queryset

        role = self.get_user_role()
        logger.info(f"User {user.username} role: {role}")

        # ===== ADMIN / PRINCIPAL =====
        if role in ["admin", "superadmin", "principal"]:
            logger.info(
                f"✅ Admin {user.username} - Full access to {queryset.count()} results"
            )
            return queryset

        # ===== SECTION ADMINS =====
        if role in [
            "secondary_admin",
            "nursery_admin",
            "primary_admin",
            "junior_secondary_admin",
            "senior_secondary_admin",
        ]:
            education_levels = self.get_user_education_level_access()
            logger.info(f"Section admin access for {education_levels}")

            if education_levels:
                filtered = queryset.filter(
                    student__education_level__in=education_levels
                )
                logger.info(f"✅ Section admin can see {filtered.count()} results")
                return filtered
            else:
                logger.warning("❌ Section admin has no education level access")
                return queryset.none()

        # ===== TEACHERS =====
        if role == "teacher":
            try:
                from teacher.models import Teacher
                from classroom.models import (
                    Classroom,
                    StudentEnrollment,
                    ClassroomTeacherAssignment,
                )

                teacher = Teacher.objects.get(user=user)

                # Get assigned classrooms
                assigned_classrooms = Classroom.objects.filter(
                    Q(class_teacher=teacher)
                    | Q(classroomteacherassignment__teacher=teacher)
                ).distinct()

                classroom_education_levels = list(
                    assigned_classrooms.values_list(
                        "grade_level__education_level", flat=True
                    ).distinct()
                )

                logger.info(
                    f"Teacher {user.username} classroom education levels: {classroom_education_levels}"
                )

                # Check if this is a classroom teacher (Nursery/Primary)
                is_classroom_teacher = any(
                    level in ["NURSERY", "PRIMARY"]
                    for level in classroom_education_levels
                )

                if is_classroom_teacher:
                    # CLASSROOM TEACHERS: See ALL results for students in their classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    filtered = queryset.filter(student_id__in=student_ids)
                    logger.info(
                        f"✅ Classroom teacher can see {filtered.count()} results"
                    )
                    return filtered
                else:
                    # SUBJECT TEACHERS: See ONLY results for subjects they teach

                    # Get subjects assigned to this teacher
                    teacher_assignments = ClassroomTeacherAssignment.objects.filter(
                        teacher=teacher
                    ).select_related("subject")

                    assigned_subject_ids = list(
                        teacher_assignments.values_list(
                            "subject_id", flat=True
                        ).distinct()
                    )

                    logger.info(
                        f"Teacher {user.username} assigned subjects: {assigned_subject_ids}"
                    )

                    if not assigned_subject_ids:
                        logger.warning(
                            f"❌ Subject teacher {user.username} has no assigned subjects"
                        )
                        return queryset.none()

                    # Get students from assigned classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    # Filter: ONLY their assigned subjects + their students
                    filtered = queryset.filter(
                        subject_id__in=assigned_subject_ids, student_id__in=student_ids
                    )

                    logger.info(
                        f"✅ Subject teacher can see {filtered.count()} results (subjects: {assigned_subject_ids})"
                    )
                    return filtered

            except Teacher.DoesNotExist:
                logger.warning(f"❌ Teacher object not found for user {user.username}")
                return queryset.none()
            except Exception as e:
                logger.error(f"❌ Error filtering for teacher: {str(e)}", exc_info=True)
                return queryset.none()

        # ===== STUDENTS =====
        if role == "student":
            try:
                from students.models import Student

                student = Student.objects.get(user=user)
                # Students only see PUBLISHED results
                filtered = queryset.filter(student=student, status="PUBLISHED")
                logger.info(f"✅ Student can see {filtered.count()} published results")
                return filtered
            except Student.DoesNotExist:
                logger.warning(f"❌ Student object not found for user {user.username}")
                return queryset.none()

        # ===== PARENTS =====
        if role == "parent":
            try:
                from parent.models import Parent

                parent = Parent.objects.get(user=user)
                # Parents only see PUBLISHED results
                filtered = queryset.filter(student__parents=parent, status="PUBLISHED")
                logger.info(f"✅ Parent can see {filtered.count()} published results")
                return filtered
            except:
                logger.warning(f"❌ Parent object not found for user {user.username}")
                return queryset.none()

        # ===== DEFAULT: NO ACCESS =====
        logger.warning(f"❌ No access for user {user.username} with role {role}")
        return queryset.none()

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                student_id = request.data.get("student")
                if student_id:  # ✅ Proper indentation
                    student = Student.objects.get(id=student_id)
                    expected_level = student.education_level
                    if expected_level != "SENIOR_SECONDARY":
                        return Response(
                            {
                                "error": f"Student's education level is {expected_level}, expected SENIOR_SECONDARY."
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                request.data["entered_by"] = request.user.id
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = SeniorSecondarySessionResultSerializer(result)
                return Response(
                    detailed_serializer.data, status=status.HTTP_201_CREATED
                )

        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to create session result: {str(e)}")
            return Response(
                {"error": f"Failed to create session result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                instance = self.get_object()  # ✅ Get instance first

                # Check if modifying published results
                if instance.status == "PUBLISHED" and not check_user_permission(
                    request.user, "results.change_published_results"
                ):
                    return Response(
                        {
                            "error": "You don't have permission to modify published results"
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

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
        result = self.get_object()
        # Check permission
        user_role = self.get_user_role()
        if user_role not in [
            "admin",
            "superadmin",
            "principal",
            "senior_secondary_admin",
        ]:
            return Response(
                {"error": "You don't have permission to approve results"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate data before approving
        if not result.total_score or result.total_score < 0:
            return Response(
                {"error": "Cannot approve result with invalid scores"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate current status allows approval
        if result.status not in ["DRAFT", "SUBMITTED"]:
            return Response(
                {
                    "error": "Invalid status transition",
                    "detail": f"Cannot approve result with status '{result.status}'. Only DRAFT or SUBMITTED results can be approved.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
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


class SeniorSecondarySessionResultViewSet(
    TeacherPortalCheckMixin, SectionFilterMixin, viewsets.ModelViewSet
):
    queryset = SeniorSecondarySessionResult.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "subject", "academic_session", "status", "stream"]
    search_fields = [
        "student__user__first_name",
        "student__user__last_name",
        "subject__name",
    ]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return SeniorSecondarySessionResultCreateUpdateSerializer
        return SeniorSecondarySessionResultSerializer

    def get_queryset(self):
        queryset = (
            super(viewsets.ModelViewSet, self)
            .get_queryset()
            .select_related(
                "student",
                "student__user",
                "subject",
                "academic_session",
                "grading_system",
                "entered_by",
                "approved_by",
                "published_by",
                "last_edited_by",
            )
        )

        user = self.request.user

        # ===== SUPER ADMIN / STAFF =====
        if user.is_superuser or user.is_staff:
            logger.info(
                f"✅ Super admin/staff {user.username} - Full access to {queryset.count()} results"
            )
            return queryset

        role = self.get_user_role()
        logger.info(f"User {user.username} role: {role}")

        # ===== ADMIN / PRINCIPAL =====
        if role in ["admin", "superadmin", "principal"]:
            logger.info(
                f"✅ Admin {user.username} - Full access to {queryset.count()} results"
            )
            return queryset

        # ===== SECTION ADMINS =====
        if role in [
            "secondary_admin",
            "nursery_admin",
            "primary_admin",
            "junior_secondary_admin",
            "senior_secondary_admin",
        ]:
            education_levels = self.get_user_education_level_access()
            logger.info(f"Section admin access for {education_levels}")

            if education_levels:
                filtered = queryset.filter(
                    student__education_level__in=education_levels
                )
                logger.info(f"✅ Section admin can see {filtered.count()} results")
                return filtered
            else:
                logger.warning("❌ Section admin has no education level access")
                return queryset.none()

        # ===== TEACHERS =====
        if role == "teacher":
            try:
                from teacher.models import Teacher
                from classroom.models import (
                    Classroom,
                    StudentEnrollment,
                    ClassroomTeacherAssignment,
                )

                teacher = Teacher.objects.get(user=user)

                # Get assigned classrooms
                assigned_classrooms = Classroom.objects.filter(
                    Q(class_teacher=teacher)
                    | Q(classroomteacherassignment__teacher=teacher)
                ).distinct()

                classroom_education_levels = list(
                    assigned_classrooms.values_list(
                        "grade_level__education_level", flat=True
                    ).distinct()
                )

                logger.info(
                    f"Teacher {user.username} classroom education levels: {classroom_education_levels}"
                )

                # Check if this is a classroom teacher (Nursery/Primary)
                is_classroom_teacher = any(
                    level in ["NURSERY", "PRIMARY"]
                    for level in classroom_education_levels
                )

                if is_classroom_teacher:
                    # CLASSROOM TEACHERS: See ALL results for students in their classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    filtered = queryset.filter(student_id__in=student_ids)
                    logger.info(
                        f"✅ Classroom teacher can see {filtered.count()} results"
                    )
                    return filtered
                else:
                    # SUBJECT TEACHERS: See ONLY results for subjects they teach

                    # Get subjects assigned to this teacher
                    teacher_assignments = ClassroomTeacherAssignment.objects.filter(
                        teacher=teacher
                    ).select_related("subject")

                    assigned_subject_ids = list(
                        teacher_assignments.values_list(
                            "subject_id", flat=True
                        ).distinct()
                    )

                    logger.info(
                        f"Teacher {user.username} assigned subjects: {assigned_subject_ids}"
                    )

                    if not assigned_subject_ids:
                        logger.warning(
                            f"❌ Subject teacher {user.username} has no assigned subjects"
                        )
                        return queryset.none()

                    # Get students from assigned classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    # Filter: ONLY their assigned subjects + their students
                    filtered = queryset.filter(
                        subject_id__in=assigned_subject_ids, student_id__in=student_ids
                    )

                    logger.info(
                        f"✅ Subject teacher can see {filtered.count()} results (subjects: {assigned_subject_ids})"
                    )
                    return filtered

            except Teacher.DoesNotExist:
                logger.warning(f"❌ Teacher object not found for user {user.username}")
                return queryset.none()
            except Exception as e:
                logger.error(f"❌ Error filtering for teacher: {str(e)}", exc_info=True)
                return queryset.none()

        # ===== STUDENTS =====
        if role == "student":
            try:
                from students.models import Student

                student = Student.objects.get(user=user)
                # Students only see PUBLISHED results
                filtered = queryset.filter(student=student, status="PUBLISHED")
                logger.info(f"✅ Student can see {filtered.count()} published results")
                return filtered
            except Student.DoesNotExist:
                logger.warning(f"❌ Student object not found for user {user.username}")
                return queryset.none()

        # ===== PARENTS =====
        if role == "parent":
            try:
                from parent.models import Parent

                parent = Parent.objects.get(user=user)
                # Parents only see PUBLISHED results
                filtered = queryset.filter(student__parents=parent, status="PUBLISHED")
                logger.info(f"✅ Parent can see {filtered.count()} published results")
                return filtered
            except:
                logger.warning(f"❌ Parent object not found for user {user.username}")
                return queryset.none()

        # ===== DEFAULT: NO ACCESS =====
        logger.warning(f"❌ No access for user {user.username} with role {role}")
        return queryset.none()

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                student_id = request.data.get("student")
            if student_id:
                student = Student.objects.get(id=student_id)
                expected_level = student.education_level
                if expected_level != "SENIOR_SECONDARY":
                    return Response(
                        {
                            "error": f"Student's education level is {expected_level}, expected SENIOR_SECONDARY."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                request.data["entered_by"] = request.user.id
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = SeniorSecondarySessionResultSerializer(result)
                return Response(
                    detailed_serializer.data, status=status.HTTP_201_CREATED
                )

        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to create session result: {str(e)}")
            return Response(
                {"error": f"Failed to create session result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class SeniorSecondaryTermReportViewSet(
    TeacherPortalCheckMixin, SectionFilterMixin, viewsets.ModelViewSet
):
    queryset = SeniorSecondaryTermReport.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "exam_session", "status", "is_published", "stream"]
    search_fields = ["student__user__first_name", "student__user__last_name"]

    def get_serializer_class(self):
        return SeniorSecondaryTermReportSerializer

    def get_queryset(self):
        queryset = (
            super(viewsets.ModelViewSet, self)
            .get_queryset()
            .select_related("student", "student__user", "exam_session", "published_by")
            .prefetch_related("subject_results")
        )

        user = self.request.user
        # ===== SUPER ADMIN / STAFF =====
        if user.is_superuser or user.is_staff:
            logger.info(
                f"✅ Super admin/staff {user.username} - Full access to all {queryset.count()} term reports"
            )
            return queryset

        role = self.get_user_role()
        logger.info(f"User {user.username} role: {role}")

        # ===== ADMIN / PRINCIPAL =====
        if role in ["admin", "superadmin", "principal"]:
            logger.info(
                f"✅ Admin {user.username} - Full access to all {queryset.count()} term reports"
            )
            return queryset

        # ===== SECTION ADMINS =====
        if role in [
            "secondary_admin",
            "nursery_admin",
            "primary_admin",
            "junior_secondary_admin",
            "senior_secondary_admin",
        ]:
            education_levels = self.get_user_education_level_access()
            logger.info(f"Section admin access for {education_levels}")

            if education_levels:
                filtered = queryset.filter(
                    student__education_level__in=education_levels
                )
                logger.info(f"✅ Section admin can see {filtered.count()} term reports")
                return filtered
            else:
                logger.warning("❌ Section admin has no education level access")
                return queryset.none()

        # ===== TEACHERS =====
        if role == "teacher":
            try:
                from teacher.models import Teacher
                from classroom.models import Classroom, StudentEnrollment

                teacher = Teacher.objects.get(user=user)

                # Get assigned classrooms (for classroom teachers - Nursery/Primary)
                assigned_classrooms = Classroom.objects.filter(
                    Q(class_teacher=teacher)
                    | Q(classroomteacherassignment__teacher=teacher)
                ).distinct()

                classroom_education_levels = list(
                    assigned_classrooms.values_list(
                        "grade_level__education_level", flat=True
                    ).distinct()
                )

                logger.info(
                    f"Teacher {user.username} classroom education levels: {classroom_education_levels}"
                )

                # Check if this is a classroom teacher (Nursery/Primary)
                is_classroom_teacher = any(
                    level in ["NURSERY", "PRIMARY"]
                    for level in classroom_education_levels
                )

                if is_classroom_teacher:
                    # CLASSROOM TEACHERS: See all term reports for students in their classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    filtered = queryset.filter(student_id__in=student_ids)
                    logger.info(
                        f"✅ Classroom teacher can see {filtered.count()} term reports"
                    )
                    return filtered
                else:
                    # SUBJECT TEACHERS (Secondary): See term reports for students they teach
                    # Get students from assigned classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    # Filter by education level access
                    education_levels = self.get_user_education_level_access()

                    filtered = queryset.filter(
                        student_id__in=student_ids,
                        student__education_level__in=education_levels,
                    )
                    logger.info(
                        f"✅ Subject teacher can see {filtered.count()} term reports"
                    )
                    return filtered

            except Teacher.DoesNotExist:
                logger.warning(f"❌ Teacher object not found for user {user.username}")
                return queryset.none()
            except Exception as e:
                logger.error(f"❌ Error filtering for teacher: {str(e)}")
                return queryset.none()

        # ===== STUDENTS =====
        if role == "student":
            try:
                from students.models import Student

                student = Student.objects.get(user=user)
                filtered = queryset.filter(student=student)
                logger.info(f"✅ Student can see {filtered.count()} own term reports")
                return filtered
            except:
                logger.warning(f"❌ Student object not found for user {user.username}")
                return queryset.none()

        # ===== PARENTS =====
        if role == "parent":
            try:
                from parent.models import Parent

                parent = Parent.objects.get(user=user)
                filtered = queryset.filter(student__parents=parent)
                logger.info(
                    f"✅ Parent can see {filtered.count()} children's term reports"
                )
                return filtered
            except:
                logger.warning(f"❌ Parent object not found for user {user.username}")
                return queryset.none()

        # ===== DEFAULT: NO ACCESS =====
        logger.warning(f"❌ No access for user {user.username} with role {role}")
        return queryset.none()

    @action(detail=True, methods=["post"])
    def submit_for_approval(self, request, pk=None):
        """
        Teacher submits term report for admin approval.
        Validates that all required subjects have results before submitting.
        Changes status from DRAFT to SUBMITTED.
        """
        try:
            with transaction.atomic():
                report = self.get_object()

                # Validate that report has subject results
                if not report.subject_results.exists():
                    return Response(
                        {
                            "error": "Cannot submit empty report",
                            "detail": "Please add subject results before submitting for approval.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Validate current status allows submission
                if report.status not in ["DRAFT", "APPROVED"]:
                    return Response(
                        {
                            "error": "Invalid status transition",
                            "detail": f"Cannot submit report with status '{report.status}'. Only DRAFT reports can be submitted.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update status to SUBMITTED
                report.status = "SUBMITTED"
                report.save()

                logger.info(
                    f"Term report {report.id} submitted for approval by {request.user.username}"
                )

                serializer = self.get_serializer(report)
                return Response(
                    {
                        "message": "Term report submitted for approval successfully",
                        "data": serializer.data,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to submit term report: {str(e)}")
            return Response(
                {"error": f"Failed to submit term report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """
        Admin approves term report.
        Changes status from SUBMITTED to APPROVED.
        Cascades APPROVED status to all individual subject results.
        """
        try:
            with transaction.atomic():
                report = self.get_object()

                # Validate current status allows approval
                if report.status not in ["SUBMITTED", "DRAFT"]:
                    return Response(
                        {
                            "error": "Invalid status transition",
                            "detail": f"Cannot approve report with status '{report.status}'. Only SUBMITTED or DRAFT reports can be approved.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update report status
                report.status = "APPROVED"
                report.save()

                # Cascade approval to all subject results
                updated_count = report.subject_results.update(
                    status="APPROVED",
                    approved_by=request.user,
                    approved_date=timezone.now(),
                )

                logger.info(
                    f"Term report {report.id} approved by {request.user.username}. {updated_count} subject results also approved."
                )

                serializer = self.get_serializer(report)
                return Response(
                    {
                        "message": f"Term report approved successfully. {updated_count} subject result(s) also approved.",
                        "data": serializer.data,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to approve term report: {str(e)}")
            return Response(
                {"error": f"Failed to approve term report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """
        Admin publishes term report.
        Changes status from APPROVED to PUBLISHED.
        Cascades PUBLISHED status to all individual subject results.
        Published results become visible to students and parents.
        """
        try:
            with transaction.atomic():
                report = self.get_object()

                # Validate current status allows publishing
                if report.status not in ["APPROVED", "SUBMITTED"]:
                    return Response(
                        {
                            "error": "Invalid status transition",
                            "detail": f"Cannot publish report with status '{report.status}'. Only APPROVED or SUBMITTED reports can be published.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update report status and metadata
                report.is_published = True
                report.published_by = request.user
                report.published_date = timezone.now()
                report.status = "PUBLISHED"
                report.save()

                # Cascade publish to all subject results
                updated_count = report.subject_results.update(
                    status="PUBLISHED",
                    published_by=request.user,
                    published_date=timezone.now(),
                )

                logger.info(
                    f"Term report {report.id} published by {request.user.username}. {updated_count} subject results also published."
                )

                serializer = self.get_serializer(report)
                return Response(
                    {
                        "message": f"Term report published successfully. {updated_count} subject result(s) also published and are now visible to students.",
                        "data": serializer.data,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to publish report: {str(e)}")
            return Response(
                {"error": f"Failed to publish report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def calculate_metrics(self, request, pk=None):
        """Recalculate term report metrics and class position"""
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
        """
        Bulk publish multiple term reports at once.
        Cascades PUBLISHED status to all associated subject results.
        """
        report_ids = request.data.get("report_ids", [])
        if not report_ids:
            return Response(
                {"error": "report_ids are required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                reports = self.get_queryset().filter(id__in=report_ids)

                # Validate all reports can be published
                invalid_reports = reports.exclude(status__in=["APPROVED", "SUBMITTED"])
                if invalid_reports.exists():
                    return Response(
                        {
                            "error": "Some reports cannot be published",
                            "detail": f"{invalid_reports.count()} report(s) have invalid status. Only APPROVED or SUBMITTED reports can be published.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update all reports
                updated_count = reports.update(
                    is_published=True,
                    published_by=request.user,
                    published_date=timezone.now(),
                    status="PUBLISHED",
                )

                # Cascade publish to all subject results for these reports
                total_subjects_updated = 0
                for report in reports:
                    subjects_updated = report.subject_results.update(
                        status="PUBLISHED",
                        published_by=request.user,
                        published_date=timezone.now(),
                    )
                    total_subjects_updated += subjects_updated

                logger.info(
                    f"Bulk published {updated_count} term reports by {request.user.username}. {total_subjects_updated} subject results also published."
                )

                return Response(
                    {
                        "message": f"Successfully published {updated_count} term report(s)",
                        "reports_published": updated_count,
                        "subjects_published": total_subjects_updated,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to bulk publish reports: {str(e)}")
            return Response(
                {"error": f"Failed to bulk publish reports: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class SeniorSecondarySessionReportViewSet(
    TeacherPortalCheckMixin, SectionFilterMixin, viewsets.ModelViewSet
):
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
    search_fields = ["student__user__first_name", "student__user__last_name"]

    def get_serializer_class(self):
        return SeniorSecondarySessionReportSerializer

    def get_queryset(self):
        queryset = (
            super(viewsets.ModelViewSet, self)
            .get_queryset()
            .select_related("student", "student__user", "academic_session", "stream")
            .prefetch_related("subject_results")
        )

        user = self.request.user

        if user.is_superuser or user.is_staff:
            return queryset

        role = self.get_user_role()

        if role in ["admin", "superadmin", "principal"]:
            return queryset

        if role == "teacher":
            section_access = self.get_user_section_access()
            education_levels = self.get_education_levels_for_sections(section_access)

            if education_levels:
                return queryset.filter(student__education_level__in=education_levels)
            return queryset.none()

        if role == "student":
            try:
                student = Student.objects.get(user=user)
                return queryset.filter(student=student)
            except:
                return queryset.none()

        if role == "parent":
            try:
                from parent.models import Parent

                parent = Parent.objects.get(user=user)
                return queryset.filter(student__parents=parent)
            except:
                return queryset.none()

        section_access = self.get_user_section_access()
        education_levels = self.get_education_levels_for_sections(section_access)

        if not education_levels:
            return queryset.none()

        return queryset.filter(student__education_level__in=education_levels)

    @action(detail=True, methods=["post"])
    def calculate_metrics(self, request, pk=None):
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


class JuniorSecondaryResultViewSet(
    TeacherPortalCheckMixin, SectionFilterMixin, viewsets.ModelViewSet
):
    queryset = JuniorSecondaryResult.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = [
        "student",
        "subject",
        "exam_session",
        "status",
        "is_passed",
    ]
    search_fields = [
        "student__user__first_name",
        "student__user__last_name",
        "subject__name",
    ]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return JuniorSecondaryResultCreateUpdateSerializer
        return JuniorSecondaryResultSerializer

    def get_queryset(self):
        queryset = (
            super(viewsets.ModelViewSet, self)
            .get_queryset()
            .select_related(
                "student",
                "student__user",
                "subject",
                "exam_session",
                "grading_system",
                "entered_by",
                "approved_by",
                "published_by",
                "last_edited_by",
            )
        )

        user = self.request.user

        # ===== SUPER ADMIN / STAFF =====
        if user.is_superuser or user.is_staff:
            logger.info(
                f"✅ Super admin/staff {user.username} - Full access to {queryset.count()} results"
            )
            return queryset

        role = self.get_user_role()
        logger.info(f"User {user.username} role: {role}")

        # ===== ADMIN / PRINCIPAL =====
        if role in ["admin", "superadmin", "principal"]:
            logger.info(
                f"✅ Admin {user.username} - Full access to {queryset.count()} results"
            )
            return queryset

        # ===== SECTION ADMINS =====
        if role in [
            "secondary_admin",
            "nursery_admin",
            "primary_admin",
            "junior_secondary_admin",
            "senior_secondary_admin",
        ]:
            education_levels = self.get_user_education_level_access()
            logger.info(f"Section admin access for {education_levels}")

            if education_levels:
                filtered = queryset.filter(
                    student__education_level__in=education_levels
                )
                logger.info(f"✅ Section admin can see {filtered.count()} results")
                return filtered
            else:
                logger.warning("❌ Section admin has no education level access")
                return queryset.none()

        # ===== TEACHERS =====
        if role == "teacher":
            try:
                from teacher.models import Teacher
                from classroom.models import (
                    Classroom,
                    StudentEnrollment,
                    ClassroomTeacherAssignment,
                )

                teacher = Teacher.objects.get(user=user)

                # Get assigned classrooms
                assigned_classrooms = Classroom.objects.filter(
                    Q(class_teacher=teacher)
                    | Q(classroomteacherassignment__teacher=teacher)
                ).distinct()

                classroom_education_levels = list(
                    assigned_classrooms.values_list(
                        "grade_level__education_level", flat=True
                    ).distinct()
                )

                logger.info(
                    f"Teacher {user.username} classroom education levels: {classroom_education_levels}"
                )

                # Check if this is a classroom teacher (Nursery/Primary)
                is_classroom_teacher = any(
                    level in ["NURSERY", "PRIMARY"]
                    for level in classroom_education_levels
                )

                if is_classroom_teacher:
                    # CLASSROOM TEACHERS: See ALL results for students in their classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    filtered = queryset.filter(student_id__in=student_ids)
                    logger.info(
                        f"✅ Classroom teacher can see {filtered.count()} results"
                    )
                    return filtered
                else:
                    # SUBJECT TEACHERS: See ONLY results for subjects they teach

                    # Get subjects assigned to this teacher
                    teacher_assignments = ClassroomTeacherAssignment.objects.filter(
                        teacher=teacher
                    ).select_related("subject")

                    assigned_subject_ids = list(
                        teacher_assignments.values_list(
                            "subject_id", flat=True
                        ).distinct()
                    )

                    logger.info(
                        f"Teacher {user.username} assigned subjects: {assigned_subject_ids}"
                    )

                    if not assigned_subject_ids:
                        logger.warning(
                            f"❌ Subject teacher {user.username} has no assigned subjects"
                        )
                        return queryset.none()

                    # Get students from assigned classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    # Filter: ONLY their assigned subjects + their students
                    filtered = queryset.filter(
                        subject_id__in=assigned_subject_ids, student_id__in=student_ids
                    )

                    logger.info(
                        f"✅ Subject teacher can see {filtered.count()} results (subjects: {assigned_subject_ids})"
                    )
                    return filtered

            except Teacher.DoesNotExist:
                logger.warning(f"❌ Teacher object not found for user {user.username}")
                return queryset.none()
            except Exception as e:
                logger.error(f"❌ Error filtering for teacher: {str(e)}", exc_info=True)
                return queryset.none()

        # ===== STUDENTS =====
        if role == "student":
            try:
                from students.models import Student

                student = Student.objects.get(user=user)
                # Students only see PUBLISHED results
                filtered = queryset.filter(student=student, status="PUBLISHED")
                logger.info(f"✅ Student can see {filtered.count()} published results")
                return filtered
            except Student.DoesNotExist:
                logger.warning(f"❌ Student object not found for user {user.username}")
                return queryset.none()

        # ===== PARENTS =====
        if role == "parent":
            try:
                from parent.models import Parent

                parent = Parent.objects.get(user=user)
                # Parents only see PUBLISHED results
                filtered = queryset.filter(student__parents=parent, status="PUBLISHED")
                logger.info(f"✅ Parent can see {filtered.count()} published results")
                return filtered
            except:
                logger.warning(f"❌ Parent object not found for user {user.username}")
                return queryset.none()

        # ===== DEFAULT: NO ACCESS =====
        logger.warning(f"❌ No access for user {user.username} with role {role}")
        return queryset.none()

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                student_id = request.data.get("student")
            if student_id:
                student = Student.objects.get(id=student_id)
                expected_level = student.education_level
                if expected_level != "JUNIOR_SECONDARY":
                    return Response(
                        {
                            "error": f"Student's education level is {expected_level}, expected JUNIOR_SECONDARY."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                request.data["entered_by"] = request.user.id

                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = JuniorSecondaryResultSerializer(result)
                return Response(
                    detailed_serializer.data, status=status.HTTP_201_CREATED
                )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            logger.error(f"Failed to create result: {str(e)}")
            return Response(
                {"error": f"Failed to create result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                student_id = request.data.get("student")
            if student_id:
                student = Student.objects.get(id=student_id)
                expected_level = student.education_level

                if expected_level != "JUNIOR_SECONDARY":
                    return Response(
                        {
                            "error": f"Student's education level is {expected_level}, expected JUNIOR_SECONDARY."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                instance = self.get_object()
                serializer = self.get_serializer(
                    instance, data=request.data, partial=kwargs.get("partial", False)
                )
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = JuniorSecondaryResultSerializer(result)
                return Response(detailed_serializer.data)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            logger.error(f"Failed to update result: {str(e)}")
            return Response(
                {"error": f"Failed to update result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):

        result = self.get_object()

        # Check permission
        user_role = self.get_user_role()
        if user_role not in [
            "admin",
            "superadmin",
            "principal",
            "senior_secondary_admin",
        ]:
            return Response(
                {"error": "You don't have permission to approve results"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate data before approving
        if not result.total_score or result.total_score < 0:
            return Response(
                {"error": "Cannot approve result with invalid scores"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate current status allows approval
        if result.status not in ["DRAFT", "SUBMITTED"]:
            return Response(
                {
                    "error": "Invalid status transition",
                    "detail": f"Cannot approve result with status '{result.status}'. Only DRAFT or SUBMITTED results can be approved.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
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


class JuniorSecondaryTermReportViewSet(
    TeacherPortalCheckMixin, SectionFilterMixin, viewsets.ModelViewSet
):
    queryset = JuniorSecondaryTermReport.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "exam_session", "status", "is_published"]
    search_fields = ["student__user__first_name", "student__user__last_name"]

    def get_serializer_class(self):
        return JuniorSecondaryTermReportSerializer

    def get_queryset(self):
        queryset = (
            super(viewsets.ModelViewSet, self)
            .get_queryset()
            .select_related("student", "student__user", "exam_session", "published_by")
            .prefetch_related("subject_results")
        )

        user = self.request.user

        # ===== SUPER ADMIN / STAFF =====
        if user.is_superuser or user.is_staff:
            logger.info(
                f"✅ Super admin/staff {user.username} - Full access to all {queryset.count()} term reports"
            )
            return queryset

        role = self.get_user_role()
        logger.info(f"User {user.username} role: {role}")

        # ===== ADMIN / PRINCIPAL =====
        if role in ["admin", "superadmin", "principal"]:
            logger.info(
                f"✅ Admin {user.username} - Full access to all {queryset.count()} term reports"
            )
            return queryset

        # ===== SECTION ADMINS =====
        if role in [
            "secondary_admin",
            "nursery_admin",
            "primary_admin",
            "junior_secondary_admin",
            "senior_secondary_admin",
        ]:
            education_levels = self.get_user_education_level_access()
            logger.info(f"Section admin access for {education_levels}")

            if education_levels:
                filtered = queryset.filter(
                    student__education_level__in=education_levels
                )
                logger.info(f"✅ Section admin can see {filtered.count()} term reports")
                return filtered
            else:
                logger.warning("❌ Section admin has no education level access")
                return queryset.none()

        # ===== TEACHERS =====
        if role == "teacher":
            try:
                from teacher.models import Teacher
                from classroom.models import Classroom, StudentEnrollment

                teacher = Teacher.objects.get(user=user)

                # Get assigned classrooms (for classroom teachers - Nursery/Primary)
                assigned_classrooms = Classroom.objects.filter(
                    Q(class_teacher=teacher)
                    | Q(classroomteacherassignment__teacher=teacher)
                ).distinct()

                classroom_education_levels = list(
                    assigned_classrooms.values_list(
                        "grade_level__education_level", flat=True
                    ).distinct()
                )

                logger.info(
                    f"Teacher {user.username} classroom education levels: {classroom_education_levels}"
                )

                # Check if this is a classroom teacher (Nursery/Primary)
                is_classroom_teacher = any(
                    level in ["NURSERY", "PRIMARY"]
                    for level in classroom_education_levels
                )

                if is_classroom_teacher:
                    # CLASSROOM TEACHERS: See all term reports for students in their classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    filtered = queryset.filter(student_id__in=student_ids)
                    logger.info(
                        f"✅ Classroom teacher can see {filtered.count()} term reports"
                    )
                    return filtered
                else:
                    # SUBJECT TEACHERS (Secondary): See term reports for students they teach
                    # Get students from assigned classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    # Filter by education level access
                    education_levels = self.get_user_education_level_access()

                    filtered = queryset.filter(
                        student_id__in=student_ids,
                        student__education_level__in=education_levels,
                    )
                    logger.info(
                        f"✅ Subject teacher can see {filtered.count()} term reports"
                    )
                    return filtered

            except Teacher.DoesNotExist:
                logger.warning(f"❌ Teacher object not found for user {user.username}")
                return queryset.none()
            except Exception as e:
                logger.error(f"❌ Error filtering for teacher: {str(e)}")
                return queryset.none()

        # ===== STUDENTS =====
        if role == "student":
            try:
                from students.models import Student

                student = Student.objects.get(user=user)
                filtered = queryset.filter(student=student)
                logger.info(f"✅ Student can see {filtered.count()} own term reports")
                return filtered
            except:
                logger.warning(f"❌ Student object not found for user {user.username}")
                return queryset.none()

        # ===== PARENTS =====
        if role == "parent":
            try:
                from parent.models import Parent

                parent = Parent.objects.get(user=user)
                filtered = queryset.filter(student__parents=parent)
                logger.info(
                    f"✅ Parent can see {filtered.count()} children's term reports"
                )
                return filtered
            except:
                logger.warning(f"❌ Parent object not found for user {user.username}")
                return queryset.none()

        # ===== DEFAULT: NO ACCESS =====
        logger.warning(f"❌ No access for user {user.username} with role {role}")
        return queryset.none()

    @action(detail=True, methods=["post"])
    def submit_for_approval(self, request, pk=None):
        """
        Teacher submits term report for admin approval.
        Validates that all required subjects have results before submitting.
        Changes status from DRAFT to SUBMITTED.
        """
        try:
            with transaction.atomic():
                report = self.get_object()

                # Validate that report has subject results
                if not report.subject_results.exists():
                    return Response(
                        {
                            "error": "Cannot submit empty report",
                            "detail": "Please add subject results before submitting for approval.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Validate current status allows submission
                if report.status not in ["DRAFT", "APPROVED"]:
                    return Response(
                        {
                            "error": "Invalid status transition",
                            "detail": f"Cannot submit report with status '{report.status}'. Only DRAFT reports can be submitted.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update status to SUBMITTED
                report.status = "SUBMITTED"
                report.save()

                logger.info(
                    f"Term report {report.id} submitted for approval by {request.user.username}"
                )

                serializer = self.get_serializer(report)
                return Response(
                    {
                        "message": "Term report submitted for approval successfully",
                        "data": serializer.data,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to submit term report: {str(e)}")
            return Response(
                {"error": f"Failed to submit term report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """
        Admin approves term report.
        Changes status from SUBMITTED to APPROVED.
        Cascades APPROVED status to all individual subject results.
        """
        try:
            with transaction.atomic():
                report = self.get_object()

                # Validate current status allows approval
                if report.status not in ["SUBMITTED", "DRAFT"]:
                    return Response(
                        {
                            "error": "Invalid status transition",
                            "detail": f"Cannot approve report with status '{report.status}'. Only SUBMITTED or DRAFT reports can be approved.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update report status
                report.status = "APPROVED"
                report.save()

                # Cascade approval to all subject results
                updated_count = report.subject_results.update(
                    status="APPROVED",
                    approved_by=request.user,
                    approved_date=timezone.now(),
                )

                logger.info(
                    f"Term report {report.id} approved by {request.user.username}. {updated_count} subject results also approved."
                )

                serializer = self.get_serializer(report)
                return Response(
                    {
                        "message": f"Term report approved successfully. {updated_count} subject result(s) also approved.",
                        "data": serializer.data,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to approve term report: {str(e)}")
            return Response(
                {"error": f"Failed to approve term report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """
        Admin publishes term report.
        Changes status from APPROVED to PUBLISHED.
        Cascades PUBLISHED status to all individual subject results.
        Published results become visible to students and parents.
        """
        try:
            with transaction.atomic():
                report = self.get_object()

                # Validate current status allows publishing
                if report.status not in ["APPROVED", "SUBMITTED"]:
                    return Response(
                        {
                            "error": "Invalid status transition",
                            "detail": f"Cannot publish report with status '{report.status}'. Only APPROVED or SUBMITTED reports can be published.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update report status and metadata
                report.is_published = True
                report.published_by = request.user
                report.published_date = timezone.now()
                report.status = "PUBLISHED"
                report.save()

                # Cascade publish to all subject results
                updated_count = report.subject_results.update(
                    status="PUBLISHED",
                    published_by=request.user,
                    published_date=timezone.now(),
                )

                logger.info(
                    f"Term report {report.id} published by {request.user.username}. {updated_count} subject results also published."
                )

                serializer = self.get_serializer(report)
                return Response(
                    {
                        "message": f"Term report published successfully. {updated_count} subject result(s) also published and are now visible to students.",
                        "data": serializer.data,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to publish report: {str(e)}")
            return Response(
                {"error": f"Failed to publish report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def calculate_metrics(self, request, pk=None):
        """Recalculate term report metrics and class position"""
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
        """
        Bulk publish multiple term reports at once.
        Cascades PUBLISHED status to all associated subject results.
        """
        report_ids = request.data.get("report_ids", [])
        if not report_ids:
            return Response(
                {"error": "report_ids are required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                reports = self.get_queryset().filter(id__in=report_ids)

                # Validate all reports can be published
                invalid_reports = reports.exclude(status__in=["APPROVED", "SUBMITTED"])
                if invalid_reports.exists():
                    return Response(
                        {
                            "error": "Some reports cannot be published",
                            "detail": f"{invalid_reports.count()} report(s) have invalid status. Only APPROVED or SUBMITTED reports can be published.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update all reports
                updated_count = reports.update(
                    is_published=True,
                    published_by=request.user,
                    published_date=timezone.now(),
                    status="PUBLISHED",
                )

                # Cascade publish to all subject results for these reports
                total_subjects_updated = 0
                for report in reports:
                    subjects_updated = report.subject_results.update(
                        status="PUBLISHED",
                        published_by=request.user,
                        published_date=timezone.now(),
                    )
                    total_subjects_updated += subjects_updated

                logger.info(
                    f"Bulk published {updated_count} term reports by {request.user.username}. {total_subjects_updated} subject results also published."
                )

                return Response(
                    {
                        "message": f"Successfully published {updated_count} term report(s)",
                        "reports_published": updated_count,
                        "subjects_published": total_subjects_updated,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to bulk publish reports: {str(e)}")
            return Response(
                {"error": f"Failed to bulk publish reports: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class PrimaryResultViewSet(
    TeacherPortalCheckMixin, SectionFilterMixin, viewsets.ModelViewSet
):
    queryset = PrimaryResult.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = [
        "student",
        "subject",
        "exam_session",
        "status",
        "is_passed",
    ]
    search_fields = [
        "student__user__first_name",
        "student__user__last_name",
        "subject__name",
    ]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return PrimaryResultCreateUpdateSerializer
        return PrimaryResultSerializer

    def get_queryset(self):
        queryset = (
            super(viewsets.ModelViewSet, self)
            .get_queryset()
            .select_related(
                "student",
                "student__user",
                "subject",
                "exam_session",
                "grading_system",
                "entered_by",
                "approved_by",
                "published_by",
                "last_edited_by",
            )
        )

        user = self.request.user

        # ===== SUPER ADMIN / STAFF =====
        if user.is_superuser or user.is_staff:
            logger.info(
                f"✅ Super admin/staff {user.username} - Full access to {queryset.count()} results"
            )
            return queryset

        role = self.get_user_role()
        logger.info(f"User {user.username} role: {role}")

        # ===== ADMIN / PRINCIPAL =====
        if role in ["admin", "superadmin", "principal"]:
            logger.info(
                f"✅ Admin {user.username} - Full access to {queryset.count()} results"
            )
            return queryset

        # ===== SECTION ADMINS =====
        if role in [
            "secondary_admin",
            "nursery_admin",
            "primary_admin",
            "junior_secondary_admin",
            "senior_secondary_admin",
        ]:
            education_levels = self.get_user_education_level_access()
            logger.info(f"Section admin access for {education_levels}")

            if education_levels:
                filtered = queryset.filter(
                    student__education_level__in=education_levels
                )
                logger.info(f"✅ Section admin can see {filtered.count()} results")
                return filtered
            else:
                logger.warning("❌ Section admin has no education level access")
                return queryset.none()

        # ===== TEACHERS =====
        if role == "teacher":
            try:
                from teacher.models import Teacher
                from classroom.models import (
                    Classroom,
                    StudentEnrollment,
                    ClassroomTeacherAssignment,
                )

                teacher = Teacher.objects.get(user=user)

                # Get assigned classrooms
                assigned_classrooms = Classroom.objects.filter(
                    Q(class_teacher=teacher)
                    | Q(classroomteacherassignment__teacher=teacher)
                ).distinct()

                classroom_education_levels = list(
                    assigned_classrooms.values_list(
                        "grade_level__education_level", flat=True
                    ).distinct()
                )

                logger.info(
                    f"Teacher {user.username} classroom education levels: {classroom_education_levels}"
                )

                # Check if this is a classroom teacher (Nursery/Primary)
                is_classroom_teacher = any(
                    level in ["NURSERY", "PRIMARY"]
                    for level in classroom_education_levels
                )

                if is_classroom_teacher:
                    # CLASSROOM TEACHERS: See ALL results for students in their classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    filtered = queryset.filter(student_id__in=student_ids)
                    logger.info(
                        f"✅ Classroom teacher can see {filtered.count()} results"
                    )
                    return filtered
                else:
                    # SUBJECT TEACHERS: See ONLY results for subjects they teach

                    # Get subjects assigned to this teacher
                    teacher_assignments = ClassroomTeacherAssignment.objects.filter(
                        teacher=teacher
                    ).select_related("subject")

                    assigned_subject_ids = list(
                        teacher_assignments.values_list(
                            "subject_id", flat=True
                        ).distinct()
                    )

                    logger.info(
                        f"Teacher {user.username} assigned subjects: {assigned_subject_ids}"
                    )

                    if not assigned_subject_ids:
                        logger.warning(
                            f"❌ Subject teacher {user.username} has no assigned subjects"
                        )
                        return queryset.none()

                    # Get students from assigned classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    # Filter: ONLY their assigned subjects + their students
                    filtered = queryset.filter(
                        subject_id__in=assigned_subject_ids, student_id__in=student_ids
                    )

                    logger.info(
                        f"✅ Subject teacher can see {filtered.count()} results (subjects: {assigned_subject_ids})"
                    )
                    return filtered

            except Teacher.DoesNotExist:
                logger.warning(f"❌ Teacher object not found for user {user.username}")
                return queryset.none()
            except Exception as e:
                logger.error(f"❌ Error filtering for teacher: {str(e)}", exc_info=True)
                return queryset.none()

        # ===== STUDENTS =====
        if role == "student":
            try:
                from students.models import Student

                student = Student.objects.get(user=user)
                # Students only see PUBLISHED results
                filtered = queryset.filter(student=student, status="PUBLISHED")
                logger.info(f"✅ Student can see {filtered.count()} published results")
                return filtered
            except Student.DoesNotExist:
                logger.warning(f"❌ Student object not found for user {user.username}")
                return queryset.none()

        # ===== PARENTS =====
        if role == "parent":
            try:
                from parent.models import Parent

                parent = Parent.objects.get(user=user)
                # Parents only see PUBLISHED results
                filtered = queryset.filter(student__parents=parent, status="PUBLISHED")
                logger.info(f"✅ Parent can see {filtered.count()} published results")
                return filtered
            except:
                logger.warning(f"❌ Parent object not found for user {user.username}")
                return queryset.none()

        # ===== DEFAULT: NO ACCESS =====
        logger.warning(f"❌ No access for user {user.username} with role {role}")
        return queryset.none()

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():

                student_id = request.data.get("student")
            if student_id:
                student = Student.objects.get(id=student_id)
                expected_level = student.education_level

                if expected_level != "PRIMARY":
                    return Response(
                        {
                            "error": f"Student education level mismatch. Expected PRIMARY but got {expected_level}."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                request.data["entered_by"] = request.user.id

                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = PrimaryResultSerializer(result)
                return Response(
                    detailed_serializer.data, status=status.HTTP_201_CREATED
                )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to create result: {str(e)}")
            return Response(
                {"error": f"Failed to create result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():

                student_id = request.data.get("student")
            if student_id:
                student = Student.objects.get(id=student_id)
                expected_level = student.education_level

                if expected_level != "PRIMARY":
                    return Response(
                        {
                            "error": f"Student education level mismatch. Expected PRIMARY but got {expected_level}."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                instance = self.get_object()
                serializer = self.get_serializer(
                    instance, data=request.data, partial=kwargs.get("partial", False)
                )
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = PrimaryResultSerializer(result)
                return Response(detailed_serializer.data)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to update result: {str(e)}")
            return Response(
                {"error": f"Failed to update result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):

        result = self.get_object()

        # Check permission
        user_role = self.get_user_role()
        if user_role not in [
            "admin",
            "superadmin",
            "principal",
            "senior_secondary_admin",
        ]:
            return Response(
                {"error": "You don't have permission to approve results"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate data before approving
        if not result.total_score or result.total_score < 0:
            return Response(
                {"error": "Cannot approve result with invalid scores"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate current status allows approval
        if result.status not in ["DRAFT", "SUBMITTED"]:
            return Response(
                {
                    "error": "Invalid status transition",
                    "detail": f"Cannot approve result with status '{result.status}'. Only DRAFT or SUBMITTED results can be approved.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
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


class PrimaryTermReportViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):
    queryset = PrimaryTermReport.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "exam_session", "status", "is_published"]
    search_fields = ["student__user__first_name", "student__user__last_name"]

    def get_serializer_class(self):
        return PrimaryTermReportSerializer

    def get_queryset(self):
        queryset = (
            super(viewsets.ModelViewSet, self)
            .get_queryset()
            .select_related("student", "student__user", "exam_session", "published_by")
            .prefetch_related("subject_results")
        )

        user = self.request.user

        # ===== SUPER ADMIN / STAFF =====
        if user.is_superuser or user.is_staff:
            logger.info(
                f"✅ Super admin/staff {user.username} - Full access to all {queryset.count()} term reports"
            )
            return queryset

        role = self.get_user_role()
        logger.info(f"User {user.username} role: {role}")

        # ===== ADMIN / PRINCIPAL =====
        if role in ["admin", "superadmin", "principal"]:
            logger.info(
                f"✅ Admin {user.username} - Full access to all {queryset.count()} term reports"
            )
            return queryset

        # ===== SECTION ADMINS =====
        if role in [
            "secondary_admin",
            "nursery_admin",
            "primary_admin",
            "junior_secondary_admin",
            "senior_secondary_admin",
        ]:
            education_levels = self.get_user_education_level_access()
            logger.info(f"Section admin access for {education_levels}")

            if education_levels:
                filtered = queryset.filter(
                    student__education_level__in=education_levels
                )
                logger.info(f"✅ Section admin can see {filtered.count()} term reports")
                return filtered
            else:
                logger.warning("❌ Section admin has no education level access")
                return queryset.none()

        # ===== TEACHERS =====
        if role == "teacher":
            try:
                from teacher.models import Teacher
                from classroom.models import Classroom, StudentEnrollment

                teacher = Teacher.objects.get(user=user)

                # Get assigned classrooms (for classroom teachers - Nursery/Primary)
                assigned_classrooms = Classroom.objects.filter(
                    Q(class_teacher=teacher)
                    | Q(classroomteacherassignment__teacher=teacher)
                ).distinct()

                classroom_education_levels = list(
                    assigned_classrooms.values_list(
                        "grade_level__education_level", flat=True
                    ).distinct()
                )

                logger.info(
                    f"Teacher {user.username} classroom education levels: {classroom_education_levels}"
                )

                # Check if this is a classroom teacher (Nursery/Primary)
                is_classroom_teacher = any(
                    level in ["NURSERY", "PRIMARY"]
                    for level in classroom_education_levels
                )

                if is_classroom_teacher:
                    # CLASSROOM TEACHERS: See all term reports for students in their classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    filtered = queryset.filter(student_id__in=student_ids)
                    logger.info(
                        f"✅ Classroom teacher can see {filtered.count()} term reports"
                    )
                    return filtered
                else:
                    # SUBJECT TEACHERS (Secondary): See term reports for students they teach
                    # Get students from assigned classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    # Filter by education level access
                    education_levels = self.get_user_education_level_access()

                    filtered = queryset.filter(
                        student_id__in=student_ids,
                        student__education_level__in=education_levels,
                    )
                    logger.info(
                        f"✅ Subject teacher can see {filtered.count()} term reports"
                    )
                    return filtered

            except Teacher.DoesNotExist:
                logger.warning(f"❌ Teacher object not found for user {user.username}")
                return queryset.none()
            except Exception as e:
                logger.error(f"❌ Error filtering for teacher: {str(e)}")
                return queryset.none()

        # ===== STUDENTS =====
        if role == "student":
            try:
                from students.models import Student

                student = Student.objects.get(user=user)
                filtered = queryset.filter(student=student)
                logger.info(f"✅ Student can see {filtered.count()} own term reports")
                return filtered
            except:
                logger.warning(f"❌ Student object not found for user {user.username}")
                return queryset.none()

        # ===== PARENTS =====
        if role == "parent":
            try:
                from parent.models import Parent

                parent = Parent.objects.get(user=user)
                filtered = queryset.filter(student__parents=parent)
                logger.info(
                    f"✅ Parent can see {filtered.count()} children's term reports"
                )
                return filtered
            except:
                logger.warning(f"❌ Parent object not found for user {user.username}")
                return queryset.none()

        # ===== DEFAULT: NO ACCESS =====
        logger.warning(f"❌ No access for user {user.username} with role {role}")
        return queryset.none()

    @action(detail=True, methods=["post"])
    def submit_for_approval(self, request, pk=None):
        """
        Teacher submits term report for admin approval.
        Validates that all required subjects have results before submitting.
        Changes status from DRAFT to SUBMITTED.
        """
        try:
            with transaction.atomic():
                report = self.get_object()

                # Validate that report has subject results
                if not report.subject_results.exists():
                    return Response(
                        {
                            "error": "Cannot submit empty report",
                            "detail": "Please add subject results before submitting for approval.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Validate current status allows submission
                if report.status not in ["DRAFT", "APPROVED"]:
                    return Response(
                        {
                            "error": "Invalid status transition",
                            "detail": f"Cannot submit report with status '{report.status}'. Only DRAFT reports can be submitted.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update status to SUBMITTED
                report.status = "SUBMITTED"
                report.save()

                logger.info(
                    f"Term report {report.id} submitted for approval by {request.user.username}"
                )

                serializer = self.get_serializer(report)
                return Response(
                    {
                        "message": "Term report submitted for approval successfully",
                        "data": serializer.data,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to submit term report: {str(e)}")
            return Response(
                {"error": f"Failed to submit term report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """
        Admin approves term report.
        Changes status from SUBMITTED to APPROVED.
        Cascades APPROVED status to all individual subject results.
        """
        try:
            with transaction.atomic():
                report = self.get_object()

                # Validate current status allows approval
                if report.status not in ["SUBMITTED", "DRAFT"]:
                    return Response(
                        {
                            "error": "Invalid status transition",
                            "detail": f"Cannot approve report with status '{report.status}'. Only SUBMITTED or DRAFT reports can be approved.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update report status
                report.status = "APPROVED"
                report.save()

                # Cascade approval to all subject results
                updated_count = report.subject_results.update(
                    status="APPROVED",
                    approved_by=request.user,
                    approved_date=timezone.now(),
                )

                logger.info(
                    f"Term report {report.id} approved by {request.user.username}. {updated_count} subject results also approved."
                )

                serializer = self.get_serializer(report)
                return Response(
                    {
                        "message": f"Term report approved successfully. {updated_count} subject result(s) also approved.",
                        "data": serializer.data,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to approve term report: {str(e)}")
            return Response(
                {"error": f"Failed to approve term report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """
        Admin publishes term report.
        Changes status from APPROVED to PUBLISHED.
        Cascades PUBLISHED status to all individual subject results.
        Published results become visible to students and parents.
        """
        try:
            with transaction.atomic():
                report = self.get_object()

                # Validate current status allows publishing
                if report.status not in ["APPROVED", "SUBMITTED"]:
                    return Response(
                        {
                            "error": "Invalid status transition",
                            "detail": f"Cannot publish report with status '{report.status}'. Only APPROVED or SUBMITTED reports can be published.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update report status and metadata
                report.is_published = True
                report.published_by = request.user
                report.published_date = timezone.now()
                report.status = "PUBLISHED"
                report.save()

                # Cascade publish to all subject results
                updated_count = report.subject_results.update(
                    status="PUBLISHED",
                    published_by=request.user,
                    published_date=timezone.now(),
                )

                logger.info(
                    f"Term report {report.id} published by {request.user.username}. {updated_count} subject results also published."
                )

                serializer = self.get_serializer(report)
                return Response(
                    {
                        "message": f"Term report published successfully. {updated_count} subject result(s) also published and are now visible to students.",
                        "data": serializer.data,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to publish report: {str(e)}")
            return Response(
                {"error": f"Failed to publish report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def calculate_metrics(self, request, pk=None):
        """Recalculate term report metrics and class position"""
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
        """
        Bulk publish multiple term reports at once.
        Cascades PUBLISHED status to all associated subject results.
        """
        report_ids = request.data.get("report_ids", [])
        if not report_ids:
            return Response(
                {"error": "report_ids are required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                reports = self.get_queryset().filter(id__in=report_ids)

                # Validate all reports can be published
                invalid_reports = reports.exclude(status__in=["APPROVED", "SUBMITTED"])
                if invalid_reports.exists():
                    return Response(
                        {
                            "error": "Some reports cannot be published",
                            "detail": f"{invalid_reports.count()} report(s) have invalid status. Only APPROVED or SUBMITTED reports can be published.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update all reports
                updated_count = reports.update(
                    is_published=True,
                    published_by=request.user,
                    published_date=timezone.now(),
                    status="PUBLISHED",
                )

                # Cascade publish to all subject results for these reports
                total_subjects_updated = 0
                for report in reports:
                    subjects_updated = report.subject_results.update(
                        status="PUBLISHED",
                        published_by=request.user,
                        published_date=timezone.now(),
                    )
                    total_subjects_updated += subjects_updated

                logger.info(
                    f"Bulk published {updated_count} term reports by {request.user.username}. {total_subjects_updated} subject results also published."
                )

                return Response(
                    {
                        "message": f"Successfully published {updated_count} term report(s)",
                        "reports_published": updated_count,
                        "subjects_published": total_subjects_updated,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to bulk publish reports: {str(e)}")
            return Response(
                {"error": f"Failed to bulk publish reports: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class NurseryResultViewSet(
    TeacherPortalCheckMixin, SectionFilterMixin, viewsets.ModelViewSet
):
    queryset = NurseryResult.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = [
        "student",
        "subject",
        "exam_session",
        "status",
        "is_passed",
    ]
    search_fields = [
        "student__user__first_name",
        "student__user__last_name",
        "subject__name",
    ]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return NurseryResultCreateUpdateSerializer
        return NurseryResultSerializer

    def get_queryset(self):
        queryset = (
            super(viewsets.ModelViewSet, self)
            .get_queryset()
            .select_related(
                "student",
                "student__user",
                "subject",
                "exam_session",
                "grading_system",
                "entered_by",
                "approved_by",
                "published_by",
                "last_edited_by",
            )
        )

        user = self.request.user

        # ===== SUPER ADMIN / STAFF =====
        if user.is_superuser or user.is_staff:
            logger.info(
                f"✅ Super admin/staff {user.username} - Full access to {queryset.count()} results"
            )
            return queryset

        role = self.get_user_role()
        logger.info(f"User {user.username} role: {role}")

        # ===== ADMIN / PRINCIPAL =====
        if role in ["admin", "superadmin", "principal"]:
            logger.info(
                f"✅ Admin {user.username} - Full access to {queryset.count()} results"
            )
            return queryset

        # ===== SECTION ADMINS =====
        if role in [
            "secondary_admin",
            "nursery_admin",
            "primary_admin",
            "junior_secondary_admin",
            "senior_secondary_admin",
        ]:
            education_levels = self.get_user_education_level_access()
            logger.info(f"Section admin access for {education_levels}")

            if education_levels:
                filtered = queryset.filter(
                    student__education_level__in=education_levels
                )
                logger.info(f"✅ Section admin can see {filtered.count()} results")
                return filtered
            else:
                logger.warning("❌ Section admin has no education level access")
                return queryset.none()

        # ===== TEACHERS =====
        if role == "teacher":
            try:
                from teacher.models import Teacher
                from classroom.models import (
                    Classroom,
                    StudentEnrollment,
                    ClassroomTeacherAssignment,
                )

                teacher = Teacher.objects.get(user=user)

                # Get assigned classrooms
                assigned_classrooms = Classroom.objects.filter(
                    Q(class_teacher=teacher)
                    | Q(classroomteacherassignment__teacher=teacher)
                ).distinct()

                classroom_education_levels = list(
                    assigned_classrooms.values_list(
                        "grade_level__education_level", flat=True
                    ).distinct()
                )

                logger.info(
                    f"Teacher {user.username} classroom education levels: {classroom_education_levels}"
                )

                # Check if this is a classroom teacher (Nursery/Primary)
                is_classroom_teacher = any(
                    level in ["NURSERY", "PRIMARY"]
                    for level in classroom_education_levels
                )

                if is_classroom_teacher:
                    # CLASSROOM TEACHERS: See ALL results for students in their classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    filtered = queryset.filter(student_id__in=student_ids)
                    logger.info(
                        f"✅ Classroom teacher can see {filtered.count()} results"
                    )
                    return filtered
                else:
                    # SUBJECT TEACHERS: See ONLY results for subjects they teach

                    # Get subjects assigned to this teacher
                    teacher_assignments = ClassroomTeacherAssignment.objects.filter(
                        teacher=teacher
                    ).select_related("subject")

                    assigned_subject_ids = list(
                        teacher_assignments.values_list(
                            "subject_id", flat=True
                        ).distinct()
                    )

                    logger.info(
                        f"Teacher {user.username} assigned subjects: {assigned_subject_ids}"
                    )

                    if not assigned_subject_ids:
                        logger.warning(
                            f"❌ Subject teacher {user.username} has no assigned subjects"
                        )
                        return queryset.none()

                    # Get students from assigned classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    # Filter: ONLY their assigned subjects + their students
                    filtered = queryset.filter(
                        subject_id__in=assigned_subject_ids, student_id__in=student_ids
                    )

                    logger.info(
                        f"✅ Subject teacher can see {filtered.count()} results (subjects: {assigned_subject_ids})"
                    )
                    return filtered

            except Teacher.DoesNotExist:
                logger.warning(f"❌ Teacher object not found for user {user.username}")
                return queryset.none()
            except Exception as e:
                logger.error(f"❌ Error filtering for teacher: {str(e)}", exc_info=True)
                return queryset.none()

        # ===== STUDENTS =====
        if role == "student":
            try:
                from students.models import Student

                student = Student.objects.get(user=user)
                # Students only see PUBLISHED results
                filtered = queryset.filter(student=student, status="PUBLISHED")
                logger.info(f"✅ Student can see {filtered.count()} published results")
                return filtered
            except Student.DoesNotExist:
                logger.warning(f"❌ Student object not found for user {user.username}")
                return queryset.none()

        # ===== PARENTS =====
        if role == "parent":
            try:
                from parent.models import Parent

                parent = Parent.objects.get(user=user)
                # Parents only see PUBLISHED results
                filtered = queryset.filter(student__parents=parent, status="PUBLISHED")
                logger.info(f"✅ Parent can see {filtered.count()} published results")
                return filtered
            except:
                logger.warning(f"❌ Parent object not found for user {user.username}")
                return queryset.none()

        # ===== DEFAULT: NO ACCESS =====
        logger.warning(f"❌ No access for user {user.username} with role {role}")
        return queryset.none()

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                student_id = request.data.get("student")
            if student_id:
                student = Student.objects.get(id=student_id)
                expected_level = student.education_level

                if expected_level != "NURSERY":
                    return Response(
                        {
                            "error": f"Student education level mismatch. Expected NURSERY but got {expected_level}."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                request.data["entered_by"] = request.user.id

                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = NurseryResultSerializer(result)
                return Response(
                    detailed_serializer.data, status=status.HTTP_201_CREATED
                )
        except Student.DoesNotExist:
            logger.error(f"Student with id {student_id} does not exist.")
            return Response(
                {"error": f"Student with id {student_id} does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Failed to create result: {str(e)}")
            return Response(
                {"error": f"Failed to create result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():

                student_id = request.data.get("student")
            if student_id:
                student = Student.objects.get(id=student_id)
                expected_level = student.education_level

                if expected_level != "NURSERY":
                    return Response(
                        {
                            "error": f"Student education level mismatch. Expected NURSERY but got {expected_level}."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                instance = self.get_object()
                serializer = self.get_serializer(
                    instance, data=request.data, partial=kwargs.get("partial", False)
                )
                serializer.is_valid(raise_exception=True)
                result = serializer.save()

                detailed_serializer = NurseryResultSerializer(result)
                return Response(detailed_serializer.data)
        except Student.DoesNotExist:
            logger.error(f"Student with id {student_id} does not exist.")
            return Response(
                {"error": f"Student with id {student_id} does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.error(f"Failed to update result: {str(e)}")
            return Response(
                {"error": f"Failed to update result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):

        result = self.get_object()

        # Check permission
        user_role = self.get_user_role()
        if user_role not in [
            "admin",
            "superadmin",
            "principal",
            "senior_secondary_admin",
        ]:
            return Response(
                {"error": "You don't have permission to approve results"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate data before approving
        if not result.total_score or result.total_score < 0:
            return Response(
                {"error": "Cannot approve result with invalid scores"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate current status allows approval
        if result.status not in ["DRAFT", "SUBMITTED"]:
            return Response(
                {
                    "error": "Invalid status transition",
                    "detail": f"Cannot approve result with status '{result.status}'. Only DRAFT or SUBMITTED results can be approved.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
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


class NurseryTermReportViewSet(
    TeacherPortalCheckMixin, SectionFilterMixin, viewsets.ModelViewSet
):
    queryset = NurseryTermReport.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "exam_session", "status", "is_published"]
    search_fields = ["student__user__first_name", "student__user__last_name"]

    def get_serializer_class(self):
        return NurseryTermReportSerializer

    def get_queryset(self):
        queryset = (
            super(viewsets.ModelViewSet, self)
            .get_queryset()
            .select_related("student", "student__user", "exam_session", "published_by")
            .prefetch_related("subject_results")
        )

        user = self.request.user

        # ===== SUPER ADMIN / STAFF =====
        if user.is_superuser or user.is_staff:
            logger.info(
                f"✅ Super admin/staff {user.username} - Full access to all {queryset.count()} term reports"
            )
            return queryset

        role = self.get_user_role()
        logger.info(f"User {user.username} role: {role}")

        # ===== ADMIN / PRINCIPAL =====
        if role in ["admin", "superadmin", "principal"]:
            logger.info(
                f"✅ Admin {user.username} - Full access to all {queryset.count()} term reports"
            )
            return queryset

        # ===== SECTION ADMINS =====
        if role in [
            "secondary_admin",
            "nursery_admin",
            "primary_admin",
            "junior_secondary_admin",
            "senior_secondary_admin",
        ]:
            education_levels = self.get_user_education_level_access()
            logger.info(f"Section admin access for {education_levels}")

            if education_levels:
                filtered = queryset.filter(
                    student__education_level__in=education_levels
                )
                logger.info(f"✅ Section admin can see {filtered.count()} term reports")
                return filtered
            else:
                logger.warning("❌ Section admin has no education level access")
                return queryset.none()

        # ===== TEACHERS =====
        if role == "teacher":
            try:
                from teacher.models import Teacher
                from classroom.models import Classroom, StudentEnrollment

                teacher = Teacher.objects.get(user=user)

                # Get assigned classrooms (for classroom teachers - Nursery/Primary)
                assigned_classrooms = Classroom.objects.filter(
                    Q(class_teacher=teacher)
                    | Q(classroomteacherassignment__teacher=teacher)
                ).distinct()

                classroom_education_levels = list(
                    assigned_classrooms.values_list(
                        "grade_level__education_level", flat=True
                    ).distinct()
                )

                logger.info(
                    f"Teacher {user.username} classroom education levels: {classroom_education_levels}"
                )

                # Check if this is a classroom teacher (Nursery/Primary)
                is_classroom_teacher = any(
                    level in ["NURSERY", "PRIMARY"]
                    for level in classroom_education_levels
                )

                if is_classroom_teacher:
                    # CLASSROOM TEACHERS: See all term reports for students in their classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    filtered = queryset.filter(student_id__in=student_ids)
                    logger.info(
                        f"✅ Classroom teacher can see {filtered.count()} term reports"
                    )
                    return filtered
                else:
                    # SUBJECT TEACHERS (Secondary): See term reports for students they teach
                    # Get students from assigned classrooms
                    student_ids = StudentEnrollment.objects.filter(
                        classroom__in=assigned_classrooms, is_active=True
                    ).values_list("student_id", flat=True)

                    # Filter by education level access
                    education_levels = self.get_user_education_level_access()

                    filtered = queryset.filter(
                        student_id__in=student_ids,
                        student__education_level__in=education_levels,
                    )
                    logger.info(
                        f"✅ Subject teacher can see {filtered.count()} term reports"
                    )
                    return filtered

            except Teacher.DoesNotExist:
                logger.warning(f"❌ Teacher object not found for user {user.username}")
                return queryset.none()
            except Exception as e:
                logger.error(f"❌ Error filtering for teacher: {str(e)}")
                return queryset.none()

        # ===== STUDENTS =====
        if role == "student":
            try:
                from students.models import Student

                student = Student.objects.get(user=user)
                filtered = queryset.filter(student=student)
                logger.info(f"✅ Student can see {filtered.count()} own term reports")
                return filtered
            except:
                logger.warning(f"❌ Student object not found for user {user.username}")
                return queryset.none()

        # ===== PARENTS =====
        if role == "parent":
            try:
                from parent.models import Parent

                parent = Parent.objects.get(user=user)
                filtered = queryset.filter(student__parents=parent)
                logger.info(
                    f"✅ Parent can see {filtered.count()} children's term reports"
                )
                return filtered
            except:
                logger.warning(f"❌ Parent object not found for user {user.username}")
                return queryset.none()

        # ===== DEFAULT: NO ACCESS =====
        logger.warning(f"❌ No access for user {user.username} with role {role}")
        return queryset.none()

    @action(detail=True, methods=["post"])
    def submit_for_approval(self, request, pk=None):
        """
        Teacher submits term report for admin approval.
        Validates that all required subjects have results before submitting.
        Changes status from DRAFT to SUBMITTED.
        """
        try:
            with transaction.atomic():
                report = self.get_object()

                # Validate that report has subject results
                if not report.subject_results.exists():
                    return Response(
                        {
                            "error": "Cannot submit empty report",
                            "detail": "Please add subject results before submitting for approval.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Validate current status allows submission
                if report.status not in ["DRAFT", "APPROVED"]:
                    return Response(
                        {
                            "error": "Invalid status transition",
                            "detail": f"Cannot submit report with status '{report.status}'. Only DRAFT reports can be submitted.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update status to SUBMITTED
                report.status = "SUBMITTED"
                report.save()

                logger.info(
                    f"Term report {report.id} submitted for approval by {request.user.username}"
                )

                serializer = self.get_serializer(report)
                return Response(
                    {
                        "message": "Term report submitted for approval successfully",
                        "data": serializer.data,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to submit term report: {str(e)}")
            return Response(
                {"error": f"Failed to submit term report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """
        Admin approves term report.
        Changes status from SUBMITTED to APPROVED.
        Cascades APPROVED status to all individual subject results.
        """
        try:
            with transaction.atomic():
                report = self.get_object()

                # Validate current status allows approval
                if report.status not in ["SUBMITTED", "DRAFT"]:
                    return Response(
                        {
                            "error": "Invalid status transition",
                            "detail": f"Cannot approve report with status '{report.status}'. Only SUBMITTED or DRAFT reports can be approved.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update report status
                report.status = "APPROVED"
                report.save()

                # Cascade approval to all subject results
                updated_count = report.subject_results.update(
                    status="APPROVED",
                    approved_by=request.user,
                    approved_date=timezone.now(),
                )

                logger.info(
                    f"Term report {report.id} approved by {request.user.username}. {updated_count} subject results also approved."
                )

                serializer = self.get_serializer(report)
                return Response(
                    {
                        "message": f"Term report approved successfully. {updated_count} subject result(s) also approved.",
                        "data": serializer.data,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to approve term report: {str(e)}")
            return Response(
                {"error": f"Failed to approve term report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """
        Admin publishes term report.
        Changes status from APPROVED to PUBLISHED.
        Cascades PUBLISHED status to all individual subject results.
        Published results become visible to students and parents.
        """
        try:
            with transaction.atomic():
                report = self.get_object()

                # Validate current status allows publishing
                if report.status not in ["APPROVED", "SUBMITTED"]:
                    return Response(
                        {
                            "error": "Invalid status transition",
                            "detail": f"Cannot publish report with status '{report.status}'. Only APPROVED or SUBMITTED reports can be published.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update report status and metadata
                report.is_published = True
                report.published_by = request.user
                report.published_date = timezone.now()
                report.status = "PUBLISHED"
                report.save()

                # Cascade publish to all subject results
                updated_count = report.subject_results.update(
                    status="PUBLISHED",
                    published_by=request.user,
                    published_date=timezone.now(),
                )

                logger.info(
                    f"Term report {report.id} published by {request.user.username}. {updated_count} subject results also published."
                )

                serializer = self.get_serializer(report)
                return Response(
                    {
                        "message": f"Term report published successfully. {updated_count} subject result(s) also published and are now visible to students.",
                        "data": serializer.data,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to publish report: {str(e)}")
            return Response(
                {"error": f"Failed to publish report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def calculate_metrics(self, request, pk=None):
        """Recalculate term report metrics and class position"""
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
        """
        Bulk publish multiple term reports at once.
        Cascades PUBLISHED status to all associated subject results.
        """
        report_ids = request.data.get("report_ids", [])
        if not report_ids:
            return Response(
                {"error": "report_ids are required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                reports = self.get_queryset().filter(id__in=report_ids)

                # Validate all reports can be published
                invalid_reports = reports.exclude(status__in=["APPROVED", "SUBMITTED"])
                if invalid_reports.exists():
                    return Response(
                        {
                            "error": "Some reports cannot be published",
                            "detail": f"{invalid_reports.count()} report(s) have invalid status. Only APPROVED or SUBMITTED reports can be published.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update all reports
                updated_count = reports.update(
                    is_published=True,
                    published_by=request.user,
                    published_date=timezone.now(),
                    status="PUBLISHED",
                )

                # Cascade publish to all subject results for these reports
                total_subjects_updated = 0
                for report in reports:
                    subjects_updated = report.subject_results.update(
                        status="PUBLISHED",
                        published_by=request.user,
                        published_date=timezone.now(),
                    )
                    total_subjects_updated += subjects_updated

                logger.info(
                    f"Bulk published {updated_count} term reports by {request.user.username}. {total_subjects_updated} subject results also published."
                )

                return Response(
                    {
                        "message": f"Successfully published {updated_count} term report(s)",
                        "reports_published": updated_count,
                        "subjects_published": total_subjects_updated,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to bulk publish reports: {str(e)}")
            return Response(
                {"error": f"Failed to bulk publish reports: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ===== LEGACY STUDENT RESULT VIEWSET =====
class StudentResultViewSet(
    TeacherPortalCheckMixin, SectionFilterMixin, viewsets.ModelViewSet
):
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
        queryset = queryset.select_related(
            "student", "subject", "exam_session", "grading_system", "stream"
        ).prefetch_related("assessment_scores", "comments")

        # Apply section-based filtering for authenticated users
        if self.request.user.is_authenticated:
            # Filter results by student's education level
            section_access = self.get_user_section_access()
            education_levels = self.get_education_levels_for_sections(section_access)

            if not education_levels:
                return queryset.none()

            queryset = queryset.filter(student__education_level__in=education_levels)

        return queryset

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

        result = self.get_object()

        # Check permission
        user_role = self.get_user_role()
        if user_role not in [
            "admin",
            "superadmin",
            "principal",
            "senior_secondary_admin",
        ]:
            return Response(
                {"error": "You don't have permission to approve results"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate data before approving
        if not result.total_score or result.total_score < 0:
            return Response(
                {"error": "Cannot approve result with invalid scores"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate current status allows approval
        if result.status not in ["DRAFT", "SUBMITTED"]:
            return Response(
                {
                    "error": "Invalid status transition",
                    "detail": f"Cannot approve result with status '{result.status}'. Only DRAFT or SUBMITTED results can be approved.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
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


class StudentTermResultViewSet(
    TeacherPortalCheckMixin, SectionFilterMixin, viewsets.ModelViewSet
):
    queryset = StudentTermResult.objects.all()
    serializer_class = StudentTermResultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["student", "academic_session", "term", "status"]
    search_fields = ["student__full_name"]

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related(
            "student", "academic_session"
        ).prefetch_related("comments")

        # Apply section-based filtering for authenticated users
        if self.request.user.is_authenticated:
            # Filter results by student's education level
            section_access = self.get_user_section_access()
            education_levels = self.get_education_levels_for_sections(section_access)

            if not education_levels:
                return queryset.none()

            queryset = queryset.filter(student__education_level__in=education_levels)

        return queryset

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
            exam_session = ExamSession.objects.select_related("academic_session").get(
                id=exam_session_id
            )

            # Create or get term result based on education level
            education_level = student.education_level

            if education_level == "SENIOR_SECONDARY":
                # Get next term begins date
                next_term_begins = get_next_term_begins_date(exam_session)

                term_result, created = SeniorSecondaryTermReport.objects.get_or_create(
                    student=student,
                    exam_session=exam_session,
                    defaults={
                        "status": "DRAFT",
                        "stream": getattr(student, "stream", None),
                        "next_term_begins": next_term_begins,
                    },
                )
                # Update next_term_begins if it's not set or if we have a better value
                if not term_result.next_term_begins and next_term_begins:
                    term_result.next_term_begins = next_term_begins
                    term_result.save()

                if created:
                    term_result.calculate_metrics()
                    term_result.calculate_class_position()
                serializer = SeniorSecondaryTermReportSerializer(term_result)

            elif education_level == "JUNIOR_SECONDARY":
                # Get next term begins date
                next_term_begins = get_next_term_begins_date(exam_session)

                term_result, created = JuniorSecondaryTermReport.objects.get_or_create(
                    student=student,
                    exam_session=exam_session,
                    defaults={
                        "status": "DRAFT",
                        "next_term_begins": next_term_begins,
                    },
                )
                # Update next_term_begins if it's not set or if we have a better value
                if not term_result.next_term_begins and next_term_begins:
                    term_result.next_term_begins = next_term_begins
                    term_result.save()

                if created:
                    term_result.calculate_metrics()
                    term_result.calculate_class_position()
                serializer = JuniorSecondaryTermReportSerializer(term_result)

            elif education_level == "PRIMARY":
                # Get next term begins date
                next_term_begins = get_next_term_begins_date(exam_session)

                term_result, created = PrimaryTermReport.objects.get_or_create(
                    student=student,
                    exam_session=exam_session,
                    defaults={
                        "status": "DRAFT",
                        "next_term_begins": next_term_begins,
                    },
                )
                # Update next_term_begins if it's not set or if we have a better value
                if not term_result.next_term_begins and next_term_begins:
                    term_result.next_term_begins = next_term_begins
                    term_result.save()

                if created:
                    term_result.calculate_metrics()
                    term_result.calculate_class_position()
                serializer = PrimaryTermReportSerializer(term_result)

            elif education_level == "NURSERY":
                # Get next term begins date
                next_term_begins = get_next_term_begins_date(exam_session)

                term_result, created = NurseryTermReport.objects.get_or_create(
                    student=student,
                    exam_session=exam_session,
                    defaults={
                        "status": "DRAFT",
                        "next_term_begins": next_term_begins,
                    },
                )
                # Update next_term_begins if it's not set or if we have a better value
                if not term_result.next_term_begins and next_term_begins:
                    term_result.next_term_begins = next_term_begins
                    term_result.save()

                if created:
                    term_result.calculate_metrics()
                    term_result.calculate_class_position()
                serializer = NurseryTermReportSerializer(term_result)

            else:
                # Fallback to base StudentTermResult
                # Get next term begins date
                next_term_begins = get_next_term_begins_date(exam_session)

                term_result, created = StudentTermResult.objects.get_or_create(
                    student=student,
                    academic_session=exam_session.academic_session,
                    term=exam_session.term,
                    defaults={
                        "status": "DRAFT",
                        "next_term_begins": next_term_begins,
                    },
                )
                # Update next_term_begins if it's not set or if we have a better value
                if not term_result.next_term_begins and next_term_begins:
                    term_result.next_term_begins = next_term_begins
                    term_result.save()

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

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """Approve a term result"""
        try:
            with transaction.atomic():
                term_result = self.get_object()
                term_result.status = "APPROVED"
                term_result.save()

                serializer = StudentTermResultSerializer(term_result)
                return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to approve term result: {str(e)}")
            return Response(
                {"error": f"Failed to approve term result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """Publish a term result"""
        try:
            with transaction.atomic():
                term_result = self.get_object()
                term_result.status = "PUBLISHED"
                term_result.save()

                serializer = StudentTermResultSerializer(term_result)
                return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to publish term result: {str(e)}")
            return Response(
                {"error": f"Failed to publish term result: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ===== SUPPORTING VIEWSETS =====
class ResultSheetViewSet(AutoSectionFilterMixin, TeacherPortalCheckMixin, viewsets.ModelViewSet):
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


class AssessmentScoreViewSet(AutoSectionFilterMixin, TeacherPortalCheckMixin, viewsets.ModelViewSet):
    queryset = AssessmentScore.objects.all()
    serializer_class = AssessmentScoreSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["student_result", "assessment_type"]

    def get_queryset(self):
        return (
            super().get_queryset().select_related("student_result", "assessment_type")
        )


class ResultCommentViewSet(AutoSectionFilterMixin, TeacherPortalCheckMixin, viewsets.ModelViewSet):
    """ViewSet for managing result comments"""

    queryset = ResultComment.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["student_result", "term_result", "comment_type", "commented_by"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ResultCommentCreateSerializer
        return ResultCommentSerializer

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related("student_result", "term_result", "commented_by")
        )

    def perform_create(self, serializer):
        serializer.save(commented_by=self.request.user)


class ResultTemplateViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """ViewSet for managing result templates"""

    queryset = ResultTemplate.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["template_type", "education_level", "is_active"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ResultTemplateCreateUpdateSerializer
        return ResultTemplateSerializer

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        """Activate a result template"""
        template = self.get_object()
        template.is_active = True
        template.save()
        return Response(ResultTemplateSerializer(template).data)

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        """Deactivate a result template"""
        template = self.get_object()
        template.is_active = False
        template.save()
        return Response(ResultTemplateSerializer(template).data)


class BulkResultOperationsViewSet(viewsets.ViewSet):
    """ViewSet for bulk result operations"""

    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"])
    def bulk_update(self, request):
        """Bulk update multiple results"""
        serializer = BulkResultUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        results_data = serializer.validated_data["results"]
        updated_results = []
        errors = []

        try:
            with transaction.atomic():
                for result_data in results_data:
                    result_id = result_data.pop("id")
                    try:
                        # Determine education level and update accordingly
                        education_level = result_data.get(
                            "education_level", "SENIOR_SECONDARY"
                        )

                        if education_level == "SENIOR_SECONDARY":
                            result = SeniorSecondaryResult.objects.get(id=result_id)
                            update_serializer = (
                                SeniorSecondaryResultCreateUpdateSerializer(
                                    result, data=result_data, partial=True
                                )
                            )
                        elif education_level == "JUNIOR_SECONDARY":
                            result = JuniorSecondaryResult.objects.get(id=result_id)
                            update_serializer = (
                                JuniorSecondaryResultCreateUpdateSerializer(
                                    result, data=result_data, partial=True
                                )
                            )
                        elif education_level == "PRIMARY":
                            result = PrimaryResult.objects.get(id=result_id)
                            update_serializer = PrimaryResultCreateUpdateSerializer(
                                result, data=result_data, partial=True
                            )
                        else:  # NURSERY
                            result = NurseryResult.objects.get(id=result_id)
                            update_serializer = NurseryResultCreateUpdateSerializer(
                                result, data=result_data, partial=True
                            )

                        update_serializer.is_valid(raise_exception=True)
                        updated_result = update_serializer.save()
                        updated_results.append(str(updated_result.id))

                    except Exception as e:
                        errors.append({"id": result_id, "error": str(e)})

                return Response(
                    {
                        "message": f"Successfully updated {len(updated_results)} results",
                        "updated_ids": updated_results,
                        "errors": errors,
                    },
                    status=status.HTTP_200_OK,
                )

        except Exception as e:
            logger.error(f"Bulk update failed: {str(e)}")
            return Response(
                {"error": f"Bulk update failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["post"])
    def bulk_status_update(self, request):
        """Bulk update status of multiple results"""
        serializer = BulkStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result_ids = serializer.validated_data["result_ids"]
        new_status = serializer.validated_data["status"]
        comment = serializer.validated_data.get("comment", "")

        try:
            with transaction.atomic():
                # Update across all result types
                total_updated = 0

                for model in [
                    SeniorSecondaryResult,
                    JuniorSecondaryResult,
                    PrimaryResult,
                    NurseryResult,
                ]:
                    updated = model.objects.filter(id__in=result_ids).update(
                        status=new_status
                    )
                    total_updated += updated

                return Response(
                    {
                        "message": f"Successfully updated status for {total_updated} results",
                        "status": new_status,
                        "comment": comment,
                    },
                    status=status.HTTP_200_OK,
                )

        except Exception as e:
            logger.error(f"Bulk status update failed: {str(e)}")
            return Response(
                {"error": f"Bulk status update failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["post"])
    def bulk_publish_results(self, request):
        """Bulk publish results with notifications"""
        serializer = PublishResultSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result_ids = serializer.validated_data["result_ids"]
        publish_date = serializer.validated_data.get("publish_date", timezone.now())
        send_notifications = serializer.validated_data.get("send_notifications", True)

        try:
            with transaction.atomic():
                total_published = 0

                for model in [
                    SeniorSecondaryResult,
                    JuniorSecondaryResult,
                    PrimaryResult,
                    NurseryResult,
                ]:
                    published = model.objects.filter(id__in=result_ids).update(
                        status="PUBLISHED",
                        published_by=request.user,
                        published_date=publish_date,
                    )
                    total_published += published

                # TODO: Implement notification logic if send_notifications is True

                return Response(
                    {
                        "message": f"Successfully published {total_published} results",
                        "published_date": publish_date,
                        "notifications_sent": send_notifications,
                    },
                    status=status.HTTP_200_OK,
                )

        except Exception as e:
            logger.error(f"Bulk publish failed: {str(e)}")
            return Response(
                {"error": f"Bulk publish failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ResultAnalyticsViewSet(viewsets.ViewSet):
    """ViewSet for result analytics and statistics"""

    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def subject_performance(self, request):
        """Get subject performance statistics"""
        exam_session_id = request.query_params.get("exam_session_id")
        education_level = request.query_params.get("education_level")

        if not exam_session_id:
            return Response(
                {"error": "exam_session_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Determine which model to use based on education level
        model_map = {
            "SENIOR_SECONDARY": SeniorSecondaryResult,
            "JUNIOR_SECONDARY": JuniorSecondaryResult,
            "PRIMARY": PrimaryResult,
            "NURSERY": NurseryResult,
        }

        model = model_map.get(education_level, SeniorSecondaryResult)

        results = (
            model.objects.filter(
                exam_session_id=exam_session_id, status__in=["APPROVED", "PUBLISHED"]
            )
            .values("subject__id", "subject__name", "subject__code")
            .annotate(
                total_students=Count("student", distinct=True),
                average_score=Avg("total_score"),
                highest_score=Max("total_score"),
                lowest_score=Min("total_score"),
                students_passed=Count("id", filter=Q(is_passed=True)),
                students_failed=Count("id", filter=Q(is_passed=False)),
            )
        )

        performance_data = []
        for result in results:
            pass_rate = (
                (result["students_passed"] / result["total_students"] * 100)
                if result["total_students"] > 0
                else 0
            )
            performance_data.append(
                {
                    "subject_id": result["subject__id"],
                    "subject_name": result["subject__name"],
                    "subject_code": result["subject__code"],
                    "total_students": result["total_students"],
                    "average_score": (
                        round(result["average_score"], 2)
                        if result["average_score"]
                        else 0
                    ),
                    "highest_score": result["highest_score"],
                    "lowest_score": result["lowest_score"],
                    "pass_rate": round(pass_rate, 2),
                    "students_passed": result["students_passed"],
                    "students_failed": result["students_failed"],
                }
            )

        serializer = SubjectPerformanceSerializer(performance_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def student_performance_trend(self, request):
        """Get student performance trend across terms"""
        student_id = request.query_params.get("student_id")
        academic_session_id = request.query_params.get("academic_session_id")

        if not student_id:
            return Response(
                {"error": "student_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.get(id=student_id)
            education_level = student.education_level

            # Get term reports based on education level
            if education_level == "SENIOR_SECONDARY":
                term_reports = SeniorSecondaryTermReport.objects.filter(
                    student=student
                ).select_related("exam_session")
            elif education_level == "JUNIOR_SECONDARY":
                term_reports = JuniorSecondaryTermReport.objects.filter(
                    student=student
                ).select_related("exam_session")
            elif education_level == "PRIMARY":
                term_reports = PrimaryTermReport.objects.filter(
                    student=student
                ).select_related("exam_session")
            else:
                term_reports = NurseryTermReport.objects.filter(
                    student=student
                ).select_related("exam_session")

            if academic_session_id:
                term_reports = term_reports.filter(
                    exam_session__academic_session_id=academic_session_id
                )

            term_scores = []
            for report in term_reports:
                term_scores.append(
                    {
                        "term": report.exam_session.term,
                        "average_score": (
                            float(report.average_score) if report.average_score else 0
                        ),
                        "total_score": (
                            float(report.total_score) if report.total_score else 0
                        ),
                        "class_position": report.class_position,
                    }
                )

            # Calculate trend
            if len(term_scores) >= 2:
                first_score = term_scores[0]["average_score"]
                last_score = term_scores[-1]["average_score"]
                percentage_change = (
                    ((last_score - first_score) / first_score * 100)
                    if first_score > 0
                    else 0
                )

                if percentage_change > 5:
                    trend = "IMPROVING"
                elif percentage_change < -5:
                    trend = "DECLINING"
                else:
                    trend = "STABLE"
            else:
                percentage_change = 0
                trend = "STABLE"

            response_data = {
                "student": StudentMinimalSerializer(student).data,
                "term_scores": term_scores,
                "average_score": (
                    sum(s["average_score"] for s in term_scores) / len(term_scores)
                    if term_scores
                    else 0
                ),
                "trend": trend,
                "percentage_change": round(percentage_change, 2),
                "best_subject": None,  # TODO: Implement
                "worst_subject": None,  # TODO: Implement
            }

            return Response(response_data)

        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"])
    def class_performance(self, request):
        """Get class-level performance summary"""
        exam_session_id = request.query_params.get("exam_session_id")
        student_class = request.query_params.get("student_class")
        education_level = request.query_params.get("education_level")

        if not all([exam_session_id, student_class, education_level]):
            return Response(
                {
                    "error": "exam_session_id, student_class, and education_level are required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get appropriate term report model
        report_model_map = {
            "SENIOR_SECONDARY": SeniorSecondaryTermReport,
            "JUNIOR_SECONDARY": JuniorSecondaryTermReport,
            "PRIMARY": PrimaryTermReport,
            "NURSERY": NurseryTermReport,
        }

        report_model = report_model_map.get(education_level)
        if not report_model:
            return Response(
                {"error": "Invalid education level"}, status=status.HTTP_400_BAD_REQUEST
            )

        term_reports = report_model.objects.filter(
            exam_session_id=exam_session_id,
            student__student_class=student_class,
            status__in=["APPROVED", "PUBLISHED"],
        ).select_related("student")

        if not term_reports.exists():
            return Response(
                {"error": "No results found"}, status=status.HTTP_404_NOT_FOUND
            )

        total_students = term_reports.count()
        class_average = (
            term_reports.aggregate(Avg("average_score"))["average_score__avg"] or 0
        )

        # Calculate pass rate (assuming passing is average >= 50)
        passed_count = term_reports.filter(average_score__gte=50).count()
        pass_rate = (passed_count / total_students * 100) if total_students > 0 else 0

        # Get top performers
        top_performers = term_reports.order_by("-average_score")[:5]
        top_performers_data = [
            {
                "student_id": str(report.student.id),
                "student_name": report.student.full_name,
                "average_score": (
                    float(report.average_score) if report.average_score else 0
                ),
                "class_position": report.class_position,
            }
            for report in top_performers
        ]

        response_data = {
            "student_class": student_class,
            "education_level": education_level,
            "total_students": total_students,
            "class_average": round(class_average, 2),
            "pass_rate": round(pass_rate, 2),
            "top_performers": top_performers_data,
            "subject_performance": [],  # TODO: Add subject breakdown
        }

        return Response(response_data)

    @action(detail=False, methods=["get"])
    def result_summary(self, request):
        """Get overall result summary dashboard"""
        exam_session_id = request.query_params.get("exam_session_id")

        if not exam_session_id:
            return Response(
                {"error": "exam_session_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        summary = {
            "total_results": 0,
            "published_results": 0,
            "pending_approval": 0,
            "draft_results": 0,
            "overall_pass_rate": 0,
            "average_class_performance": 0,
            "top_performing_class": None,
            "subjects_summary": [],
        }

        # Aggregate across all education levels
        for model in [
            SeniorSecondaryResult,
            JuniorSecondaryResult,
            PrimaryResult,
            NurseryResult,
        ]:
            results = model.objects.filter(exam_session_id=exam_session_id)

            summary["total_results"] += results.count()
            summary["published_results"] += results.filter(status="PUBLISHED").count()
            summary["pending_approval"] += results.filter(status="SUBMITTED").count()
            summary["draft_results"] += results.filter(status="DRAFT").count()

        # Calculate overall pass rate
        total_passed = 0
        for model in [
            SeniorSecondaryResult,
            JuniorSecondaryResult,
            PrimaryResult,
            NurseryResult,
        ]:
            total_passed += model.objects.filter(
                exam_session_id=exam_session_id, is_passed=True
            ).count()

        summary["overall_pass_rate"] = round(
            (
                (total_passed / summary["total_results"] * 100)
                if summary["total_results"] > 0
                else 0
            ),
            2,
        )

        return Response(summary)


class ResultImportExportViewSet(viewsets.ViewSet):
    """ViewSet for importing and exporting results"""

    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"])
    def import_results(self, request):
        """Import results from file"""
        serializer = ResultImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # TODO: Implement CSV/Excel import logic
        return Response(
            {"message": "Import functionality to be implemented", "status": "pending"},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    @action(detail=False, methods=["post"])
    def export_results(self, request):
        """Export results to file"""
        serializer = ResultExportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # TODO: Implement CSV/Excel/PDF export logic
        return Response(
            {"message": "Export functionality to be implemented", "status": "pending"},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


class ReportGenerationViewSet(viewsets.ViewSet):
    """Dynamic ViewSet for generating student reports"""

    permission_classes = [IsAuthenticated]

    TEMPLATE_MAPPING = {
        # Term Reports
        ("NURSERY", "term"): "result/templates/nursery_term_report.html",
        ("PRIMARY", "term"): "result/templates/primary_term_report.html",
        (
            "JUNIOR_SECONDARY",
            "term",
        ): "result/templates/junior_secondary_term_report.html",
        (
            "SENIOR_SECONDARY",
            "term",
        ): "result/templates/senior_secondary_term_report.html",
        # Session Reports (only for secondary levels in this example)
        (
            "SENIOR_SECONDARY",
            "session",
        ): "result/templates/senior_secondary_session_report.html",
    }

    @action(detail=False, methods=["post"])
    def generate_report(self, request):
        """
        Generate a student report (term/session) dynamically.
        Payload example:
        {
            "student_id": 1,
            "education_level": "SENIOR_SECONDARY",
            "report_type": "term"  # or "session"
        }
        """
        serializer = ReportGenerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student_id = serializer.validated_data["student_id"]
        education_level = serializer.validated_data["education_level"]
        report_type = serializer.validated_data.get("report_type", "term")

        try:
            generator = get_report_generator(education_level, request)
            return generator.generate_term_report(student_id)
        except Exception as e:
            # If external generator fails, return error
            return Response(
                {"error": f"Failed to generate report: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["post"])
    def bulk_generate_reports(self, request):
        """Bulk generate PDF reports"""
        serializer = BulkReportGenerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student_ids = serializer.validated_data.get("student_ids", [])
        exam_session_id = serializer.validated_data["exam_session_id"]
        education_level = serializer.validated_data["education_level"]

        try:
            generator = get_report_generator(education_level, request)
            reports = []

            for student_id in student_ids:
                pdf = generator.generate_term_report(student_id)
                reports.append(pdf)

            # Return ZIP file or individual PDFs
            return Response(
                {"message": f"Generated {len(reports)} reports", "reports": reports}
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
