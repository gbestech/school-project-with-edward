# from rest_framework import viewsets, status, filters
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from django_filters.rest_framework import DjangoFilterBackend
# from django.db.models import Q, Prefetch, Count, Avg
# from django.utils.decorators import method_decorator
# from django.views.decorators.cache import cache_page
# from django.core.cache import cache
# from django.db import transaction
# from django.utils import timezone
# from datetime import datetime, timedelta
# from .models import Lesson, LessonAttendance, LessonResource, LessonAssessment
# from .serializers import (
#     LessonSerializer,
#     LessonListSerializer,
#     LessonCreateSerializer,
#     LessonUpdateSerializer,
#     LessonStatusUpdateSerializer,
#     LessonBulkCreateSerializer,
#     LessonAttendanceSerializer,
#     LessonResourceSerializer,
#     LessonAssessmentSerializer,
# )
# from teacher.models import Teacher
# from teacher.serializers import TeacherSerializer
# from subject.models import Subject
# from subject.serializers import SubjectSerializer
# from classroom.models import Classroom
# from classroom.serializers import ClassroomSerializer, SectionSerializer
# import logging

# logger = logging.getLogger(__name__)


# class LessonViewSet(viewsets.ModelViewSet):
#     """
#     Comprehensive ViewSet for Lesson CRUD operations with advanced features.

#     Features:
#     - Full CRUD operations
#     - Advanced filtering and search
#     - Status management
#     - Scheduling conflict detection
#     - Bulk operations
#     - Calendar view support
#     - Statistics and analytics
#     """

#     queryset = Lesson.objects.all()
#     permission_classes = [IsAuthenticated]

#     # Enhanced filtering and searching
#     filter_backends = [
#         DjangoFilterBackend,
#         filters.SearchFilter,
#         filters.OrderingFilter,
#     ]

#     filterset_fields = {
#         "status": ["exact", "in"],
#         "lesson_type": ["exact", "in"],
#         "difficulty_level": ["exact", "in"],
#         "date": ["exact", "gte", "lte", "range"],
#         "teacher_id": ["exact", "in"],
#         "classroom_id": ["exact", "in"],
#         "subject_id": ["exact", "in"],
#         "is_recurring": ["exact"],
#         "requires_special_equipment": ["exact"],
#         "is_online_lesson": ["exact"],
#         "is_active": ["exact"],
#         "completion_percentage": ["exact", "gte", "lte"],
#     }

#     search_fields = [
#         "title",
#         "description",
#         "teacher__user__first_name",
#         "teacher__user__last_name",
#         "classroom__name",
#         "subject__name",
#         "teacher_notes",
#         "lesson_notes",
#     ]

#     ordering_fields = [
#         "date",
#         "start_time",
#         "title",
#         "status",
#         "completion_percentage",
#         "created_at",
#         "updated_at",
#     ]

#     ordering = ["-date", "start_time"]

#     def get_serializer_class(self):
#         """Return appropriate serializer based on action"""
#         serializer_map = {
#             "list": LessonListSerializer,
#             "create": LessonCreateSerializer,
#             "update": LessonUpdateSerializer,
#             "partial_update": LessonUpdateSerializer,
#             "bulk_create": LessonBulkCreateSerializer,
#             "update_status": LessonStatusUpdateSerializer,
#             "calendar": LessonListSerializer,
#             "statistics": LessonListSerializer,
#         }
#         return serializer_map.get(self.action, LessonSerializer)

#     def get_queryset(self):
#         """Enhanced queryset with smart prefetching and filtering"""
#         queryset = Lesson.objects.select_related(
#             "teacher__user",
#             "classroom__section__grade_level",
#             "subject",
#             "created_by",
#             "last_modified_by",
#         ).prefetch_related("attendances__student__user")

#         # Check if request has query_params (DRF Request object)
#         if hasattr(self.request, "query_params"):
#             # Date filtering
#             date_filter = self.request.query_params.get("date_filter")
#             if date_filter:
#                 today = timezone.now().date()
#                 if date_filter == "today":
#                     queryset = queryset.filter(date=today)
#                 elif date_filter == "tomorrow":
#                     tomorrow = today + timedelta(days=1)
#                     queryset = queryset.filter(date=tomorrow)
#                 elif date_filter == "this_week":
#                     week_start = today - timedelta(days=today.weekday())
#                     week_end = week_start + timedelta(days=6)
#                     queryset = queryset.filter(date__range=[week_start, week_end])
#                 elif date_filter == "next_week":
#                     next_week_start = today + timedelta(days=7 - today.weekday())
#                     next_week_end = next_week_start + timedelta(days=6)
#                     queryset = queryset.filter(
#                         date__range=[next_week_start, next_week_end]
#                     )
#                 elif date_filter == "overdue":
#                     queryset = queryset.filter(
#                         date__lt=today, status__in=["scheduled", "in_progress"]
#                     )

#             # Status filtering
#             status_filter = self.request.query_params.get("status_filter")
#             if status_filter:
#                 if status_filter == "active":
#                     queryset = queryset.filter(status__in=["scheduled", "in_progress"])
#                 elif status_filter == "completed":
#                     queryset = queryset.filter(status="completed")
#                 elif status_filter == "cancelled":
#                     queryset = queryset.filter(status="cancelled")

#             # Teacher filtering
#             teacher_id = self.request.query_params.get("teacher_id")
#             if teacher_id:
#                 queryset = queryset.filter(teacher_id=teacher_id)

#             # Classroom filtering
#             classroom_id = self.request.query_params.get("classroom_id")
#             if classroom_id:
#                 queryset = queryset.filter(classroom_id=classroom_id)

#             # Subject filtering
#             subject_id = self.request.query_params.get("subject_id")
#             if subject_id:
#                 queryset = queryset.filter(subject_id=subject_id)

#             # Stream filtering
#             stream_filter = self.request.query_params.get("stream_filter")
#             if stream_filter:
#                 queryset = queryset.filter(classroom__stream__name=stream_filter)

#         return queryset

#     def perform_create(self, serializer):
#         """Create with enhanced logging and validation"""
#         with transaction.atomic():
#             # Debug: Print the validated data
#             print("Validated data:", serializer.validated_data)
#             lesson = serializer.save()
#             logger.info(
#                 f"Lesson '{lesson.title}' created by {self.request.user} "
#                 f"for {lesson.classroom} on {lesson.date} at {lesson.start_time}"
#             )

#     def perform_update(self, serializer):
#         """Update with enhanced logging and validation"""
#         with transaction.atomic():
#             old_status = serializer.instance.status
#             lesson = serializer.save()
#             logger.info(
#                 f"Lesson '{lesson.title}' updated by {self.request.user} "
#                 f"(Status: {old_status} -> {lesson.status})"
#             )

#     def perform_destroy(self, instance):
#         """Delete with enhanced logging and error handling"""
#         try:
#             logger.info(f"Lesson '{instance.title}' deleted by {self.request.user}")
#             super().perform_destroy(instance)
#         except Exception as e:
#             logger.error(f"Failed to delete lesson '{instance.title}': {e}")
#             from rest_framework.response import Response
#             from rest_framework import status

#             raise Exception(f"Lesson cannot be deleted: {e}")

#     @action(detail=False, methods=["get"])
#     def calendar(self, request):
#         """Get lessons for calendar view"""
#         start_date = request.query_params.get("start_date")
#         end_date = request.query_params.get("end_date")

#         queryset = self.get_queryset()

#         if start_date and end_date:
#             queryset = queryset.filter(date__range=[start_date, end_date])

#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data)

#     @action(detail=False, methods=["get"])
#     def statistics(self, request):
#         """Get lesson statistics"""
#         queryset = self.get_queryset()

#         # Calculate statistics
#         total_lessons = queryset.count()
#         completed_lessons = queryset.filter(status="completed").count()
#         scheduled_lessons = queryset.filter(status="scheduled").count()
#         in_progress_lessons = queryset.filter(status="in_progress").count()
#         cancelled_lessons = queryset.filter(status="cancelled").count()

#         # Average completion percentage
#         avg_completion = (
#             queryset.aggregate(avg_completion=Avg("completion_percentage"))[
#                 "avg_completion"
#             ]
#             or 0
#         )

#         # Lessons by type
#         lessons_by_type = queryset.values("lesson_type").annotate(count=Count("id"))

#         # Lessons by status
#         lessons_by_status = queryset.values("status").annotate(count=Count("id"))

#         # Upcoming lessons (next 7 days)
#         today = timezone.now().date()
#         week_from_now = today + timedelta(days=7)
#         upcoming_lessons = queryset.filter(
#             date__range=[today, week_from_now], status="scheduled"
#         ).count()

#         # Overdue lessons
#         overdue_lessons = queryset.filter(
#             date__lt=today, status__in=["scheduled", "in_progress"]
#         ).count()

#         return Response(
#             {
#                 "total_lessons": total_lessons,
#                 "completed_lessons": completed_lessons,
#                 "scheduled_lessons": scheduled_lessons,
#                 "in_progress_lessons": in_progress_lessons,
#                 "cancelled_lessons": cancelled_lessons,
#                 "avg_completion_percentage": round(avg_completion, 2),
#                 "upcoming_lessons": upcoming_lessons,
#                 "overdue_lessons": overdue_lessons,
#                 "lessons_by_type": list(lessons_by_type),
#                 "lessons_by_status": list(lessons_by_status),
#             }
#         )

#     @action(detail=True, methods=["post"])
#     def update_status(self, request, pk=None):
#         """Update lesson status with validation"""
#         lesson = self.get_object()
#         serializer = LessonStatusUpdateSerializer(
#             lesson, data=request.data, partial=True
#         )

#         if serializer.is_valid():
#             serializer.save()
#             logger.info(
#                 f"Lesson '{lesson.title}' status updated to '{lesson.status}' "
#                 f"by {request.user}"
#             )
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     @action(detail=True, methods=["post"])
#     def start_lesson(self, request, pk=None):
#         """Start a lesson"""
#         lesson = self.get_object()

#         if lesson.start_lesson():
#             serializer = self.get_serializer(lesson)
#             logger.info(f"Lesson '{lesson.title}' started by {request.user}")
#             return Response(
#                 {"message": "Lesson started successfully", "lesson": serializer.data}
#             )

#         return Response(
#             {"error": "Lesson cannot be started"}, status=status.HTTP_400_BAD_REQUEST
#         )

#     @action(detail=True, methods=["post"])
#     def complete_lesson(self, request, pk=None):
#         """Complete a lesson"""
#         lesson = self.get_object()

#         if lesson.complete_lesson():
#             serializer = self.get_serializer(lesson)
#             logger.info(f"Lesson '{lesson.title}' completed by {request.user}")
#             return Response(
#                 {"message": "Lesson completed successfully", "lesson": serializer.data}
#             )

#         return Response(
#             {"error": "Lesson cannot be completed"}, status=status.HTTP_400_BAD_REQUEST
#         )

#     @action(detail=True, methods=["get"])
#     def get_progress(self, request, pk=None):
#         """Get current progress of a lesson"""
#         lesson = self.get_object()
#         progress = lesson.update_progress()
#         serializer = self.get_serializer(lesson)
#         return Response({"progress": progress, "lesson": serializer.data})

#     @action(detail=True, methods=["post"])
#     def update_progress(self, request, pk=None):
#         """Manually update lesson progress"""
#         lesson = self.get_object()
#         progress = lesson.update_progress()
#         serializer = self.get_serializer(lesson)
#         return Response({"progress": progress, "lesson": serializer.data})

#     @action(detail=True, methods=["post"])
#     def cancel_lesson(self, request, pk=None):
#         """Cancel a lesson"""
#         lesson = self.get_object()

#         if not lesson.can_cancel():
#             return Response(
#                 {"error": "Lesson cannot be cancelled"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         lesson.status = "cancelled"
#         lesson.save()

#         logger.info(f"Lesson '{lesson.title}' cancelled by {request.user}")
#         return Response({"message": "Lesson cancelled successfully"})

#     @action(detail=False, methods=["post"])
#     def bulk_create(self, request):
#         """Create multiple lessons at once"""
#         serializer = LessonBulkCreateSerializer(data=request.data)

#         if serializer.is_valid():
#             result = serializer.save()
#             logger.info(
#                 f"Bulk created {len(result['lessons'])} lessons by {request.user}"
#             )
#             return Response(result, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     @action(detail=False, methods=["get"])
#     def conflicts(self, request):
#         """Check for scheduling conflicts"""
#         classroom_id = request.query_params.get("classroom_id")
#         date = request.query_params.get("date")
#         start_time = request.query_params.get("start_time")
#         end_time = request.query_params.get("end_time")
#         lesson_id = request.query_params.get("lesson_id")  # For updates

#         if not all([classroom_id, date, start_time, end_time]):
#             return Response(
#                 {"error": "Missing required parameters"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         conflicting_lessons = Lesson.objects.filter(
#             classroom_id=classroom_id,
#             date=date,
#             status__in=["scheduled", "in_progress"],
#         )

#         if lesson_id:
#             conflicting_lessons = conflicting_lessons.exclude(id=lesson_id)

#         conflicts = []
#         for lesson in conflicting_lessons:
#             if start_time < lesson.end_time.strftime(
#                 "%H:%M"
#             ) and end_time > lesson.start_time.strftime("%H:%M"):
#                 conflicts.append(
#                     {
#                         "id": lesson.id,
#                         "title": lesson.title,
#                         "start_time": lesson.start_time.strftime("%H:%M"),
#                         "end_time": lesson.end_time.strftime("%H:%M"),
#                         "teacher": lesson.teacher.user.full_name,
#                         "subject": lesson.subject.name,
#                     }
#                 )

#         return Response({"conflicts": conflicts})

#     @action(detail=False, methods=["get"])
#     def teacher_subjects(self, request):
#         """Get subjects for a selected teacher"""
#         teacher_id = request.query_params.get("teacher_id")

#         if not teacher_id:
#             return Response(
#                 {"error": "teacher_id parameter is required"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         try:
#             teacher = Teacher.objects.get(id=teacher_id)

#             # Get subjects from ClassroomTeacherAssignment
#             from classroom.models import ClassroomTeacherAssignment

#             classroom_allocations = ClassroomTeacherAssignment.objects.filter(
#                 teacher=teacher, is_active=True
#             )

#             # Combine subjects from ClassroomTeacherAssignment only
#             # (TeacherAssignment model is deprecated)
#             subjects = set()
#             for allocation in classroom_allocations:
#                 subjects.add(allocation.subject)

#             # For Junior Secondary, show component subjects instead of parent subjects
#             filtered_subjects = set()
#             for subject in subjects:
#                 # If this is a parent subject (has component subjects), get the components
#                 if subject.component_subjects.exists():
#                     # Only show component subjects for Junior Secondary
#                     component_subjects = subject.component_subjects.filter(
#                         education_levels=["JUNIOR_SECONDARY"]
#                     )
#                     filtered_subjects.update(component_subjects)
#                 else:
#                     # If it's a component subject or regular subject, include it
#                     filtered_subjects.add(subject)

#             subjects = filtered_subjects

#             if subjects:
#                 subjects = list(subjects)
#             else:
#                 # If no allocations exist, return all active subjects
#                 subjects = Subject.objects.filter(is_active=True)

#             serializer = SubjectSerializer(subjects, many=True)
#             return Response(serializer.data)
#         except Teacher.DoesNotExist:
#             return Response(
#                 {"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND
#             )

#     @action(detail=False, methods=["get"])
#     def subject_teachers(self, request):
#         """Get teachers for a selected subject"""
#         subject_id = request.query_params.get("subject_id")

#         if not subject_id:
#             return Response(
#                 {"error": "subject_id parameter is required"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         try:
#             subject = Subject.objects.get(id=subject_id)

#             # Get teachers from ClassroomTeacherAssignment
#             from classroom.models import ClassroomTeacherAssignment

#             classroom_allocations = ClassroomTeacherAssignment.objects.filter(
#                 subject=subject, is_active=True
#             )

#             # Combine teachers from ClassroomTeacherAssignment only
#             # (TeacherAssignment model is deprecated)
#             teachers = set()
#             for allocation in classroom_allocations:
#                 teachers.add(allocation.teacher)

#             # If this is a component subject, also get teachers assigned to the parent subject
#             if subject.parent_subject:
#                 parent_classroom_allocations = (
#                     ClassroomTeacherAssignment.objects.filter(
#                         subject=subject.parent_subject, is_active=True
#                     )
#                 )

#                 for allocation in parent_classroom_allocations:
#                     teachers.add(allocation.teacher)

#             if teachers:
#                 teachers = list(teachers)
#             else:
#                 # If no allocations exist, return all active teachers
#                 teachers = Teacher.objects.filter(is_active=True)

#             serializer = TeacherSerializer(teachers, many=True)
#             return Response(serializer.data)
#         except Subject.DoesNotExist:
#             return Response(
#                 {"error": "Subject not found"}, status=status.HTTP_404_NOT_FOUND
#             )

#     @action(detail=False, methods=["get"])
#     def teacher_classrooms(self, request):
#         """Get classrooms for a selected teacher, optionally filtered by subject"""
#         teacher_id = request.query_params.get("teacher_id")
#         subject_id = request.query_params.get("subject_id")

#         if not teacher_id:
#             return Response(
#                 {"error": "teacher_id parameter is required"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         try:
#             teacher = Teacher.objects.get(id=teacher_id)

#             # Get classrooms from ClassroomTeacherAssignment
#             from classroom.models import ClassroomTeacherAssignment

#             classroom_allocations = ClassroomTeacherAssignment.objects.filter(
#                 teacher=teacher, is_active=True
#             )

#             # Filter by subject if specified
#             if subject_id:
#                 classroom_allocations = classroom_allocations.filter(
#                     subject_id=subject_id
#                 )

#             # Combine classrooms from ClassroomTeacherAssignment only
#             # (TeacherAssignment model is deprecated)
#             classrooms = set()
#             for allocation in classroom_allocations:
#                 classrooms.add(allocation.classroom)

#             if classrooms:
#                 classrooms = list(classrooms)
#             else:
#                 # If no assigned classrooms exist, return all active classrooms
#                 classrooms = Classroom.objects.filter(is_active=True)

#             serializer = ClassroomSerializer(classrooms, many=True)
#             return Response(serializer.data)
#         except Teacher.DoesNotExist:
#             return Response(
#                 {"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND
#             )

#     @action(detail=False, methods=["get"])
#     def classroom_sections(self, request):
#         """Get all classroom sections for filtering"""
#         from classroom.models import Section

#         sections = Section.objects.filter(is_active=True)
#         serializer = SectionSerializer(sections, many=True)
#         return Response(serializer.data)

#     @action(detail=False, methods=["get"])
#     def subjects_by_level(self, request):
#         """Get subjects filtered by education level, grade level, and stream"""
#         education_level = request.query_params.get("education_level")
#         grade_level_id = request.query_params.get("grade_level_id")
#         stream = request.query_params.get("stream")

#         if not education_level:
#             return Response(
#                 {"error": "education_level parameter is required"}, status=400
#             )

#         # Use the new enhanced method for better backend differentiation
#         subjects = Subject.get_subjects_by_education_level(education_level)

#         if grade_level_id:
#             # Filter by grade level if specified
#             subjects = [
#                 s for s in subjects if s.grade_levels.filter(id=grade_level_id).exists()
#             ]

#         if stream:
#             # Filter by stream if specified (for Senior Secondary)
#             subjects = [
#                 s for s in subjects if s.compatible_streams.filter(name=stream).exists()
#             ]

#         serializer = SubjectSerializer(subjects, many=True)
#         return Response(serializer.data)

#     @action(detail=True, methods=["get"])
#     def download_report(self, request, pk=None):
#         """Download lesson report as JSON"""
#         try:
#             lesson = self.get_object()
#             report_data = lesson.generate_lesson_report()

#             from django.http import JsonResponse

#             response = JsonResponse(report_data, json_dumps_params={"indent": 2})
#             response["Content-Disposition"] = (
#                 f'attachment; filename="lesson_report_{lesson.id}_{lesson.date}.json"'
#             )
#             return response

#         except Lesson.DoesNotExist:
#             return Response({"error": "Lesson not found"}, status=404)

#     @action(detail=True, methods=["get"])
#     def enrolled_students(self, request, pk=None):
#         """Get list of students enrolled in the lesson's classroom"""
#         try:
#             lesson = self.get_object()
#             enrolled_students = lesson.get_enrolled_students()

#             from students.serializers import (
#                 StudentDetailSerializer as StudentSerializer,
#             )

#             serializer = StudentSerializer(enrolled_students, many=True)
#             return Response(
#                 {"count": lesson.enrolled_students_count, "students": serializer.data}
#             )
#         except Lesson.DoesNotExist:
#             return Response({"error": "Lesson not found"}, status=404)


# class LessonAttendanceViewSet(viewsets.ModelViewSet):
#     """ViewSet for lesson attendance management"""

#     queryset = LessonAttendance.objects.all()
#     serializer_class = LessonAttendanceSerializer
#     permission_classes = [IsAuthenticated]

#     filterset_fields = ["lesson_id", "student_id", "status"]
#     search_fields = ["student__user__first_name", "student__user__last_name", "notes"]

#     def get_queryset(self):
#         return LessonAttendance.objects.select_related("lesson", "student__user")


# class LessonResourceViewSet(viewsets.ModelViewSet):
#     """ViewSet for lesson resources management"""

#     queryset = LessonResource.objects.all()
#     serializer_class = LessonResourceSerializer
#     permission_classes = [IsAuthenticated]

#     filterset_fields = ["lesson_id", "resource_type", "is_required"]
#     search_fields = ["title", "description"]

#     def get_queryset(self):
#         return LessonResource.objects.select_related("lesson")


# class LessonAssessmentViewSet(viewsets.ModelViewSet):
#     """ViewSet for lesson assessments management"""

#     queryset = LessonAssessment.objects.all()
#     serializer_class = LessonAssessmentSerializer
#     permission_classes = [IsAuthenticated]

#     filterset_fields = ["lesson_id", "assessment_type", "due_date"]
#     search_fields = ["title", "description"]
#     ordering_fields = ["due_date", "total_points", "weight_percentage"]
#     ordering = ["due_date"]

#     def get_queryset(self):
#         return LessonAssessment.objects.select_related("lesson")


from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Prefetch, Count, Avg
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Lesson, LessonAttendance, LessonResource, LessonAssessment
from .serializers import (
    LessonSerializer,
    LessonListSerializer,
    LessonCreateSerializer,
    LessonUpdateSerializer,
    LessonStatusUpdateSerializer,
    LessonBulkCreateSerializer,
    LessonAttendanceSerializer,
    LessonResourceSerializer,
    LessonAssessmentSerializer,
)
from teacher.models import Teacher, TeacherSchedule
from parent.models import (
    ParentProfile as Parent,
    ParentStudentRelationship as StudentParentRelationship,
)
from teacher.serializers import TeacherSerializer
from subject.models import Subject
from subject.serializers import SubjectSerializer
from classroom.models import Classroom
from classroom.serializers import ClassroomSerializer, SectionSerializer
import logging

logger = logging.getLogger(__name__)


class LessonViewSet(viewsets.ModelViewSet):
    """
    Multi-role ViewSet for Lesson CRUD operations with comprehensive access control.

    Access Control:
    - Admin: See all lessons from all teachers
    - Teacher: See only lessons they created
    - Student: See lessons for their enrolled classes and subjects
    - Parent: See lessons for their children's enrolled classes and subjects
    """

    queryset = Lesson.objects.all()
    permission_classes = [IsAuthenticated]

    # Enhanced filtering and searching
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = {
        "status": ["exact", "in"],
        "lesson_type": ["exact", "in"],
        "difficulty_level": ["exact", "in"],
        "date": ["exact", "gte", "lte", "range"],
        "teacher_id": ["exact", "in"],
        "classroom_id": ["exact", "in"],
        "subject_id": ["exact", "in"],
        "is_recurring": ["exact"],
        "requires_special_equipment": ["exact"],
        "is_online_lesson": ["exact"],
        "is_active": ["exact"],
        "completion_percentage": ["exact", "gte", "lte"],
    }

    search_fields = [
        "title",
        "description",
        "teacher__user__first_name",
        "teacher__user__last_name",
        "classroom__name",
        "subject__name",
        "teacher_notes",
        "lesson_notes",
    ]

    ordering_fields = [
        "date",
        "start_time",
        "title",
        "status",
        "completion_percentage",
        "created_at",
        "updated_at",
    ]

    ordering = ["-date", "start_time"]

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        serializer_map = {
            "list": LessonListSerializer,
            "create": LessonCreateSerializer,
            "update": LessonUpdateSerializer,
            "partial_update": LessonUpdateSerializer,
            "bulk_create": LessonBulkCreateSerializer,
            "update_status": LessonStatusUpdateSerializer,
            "calendar": LessonListSerializer,
            "statistics": LessonListSerializer,
        }
        return serializer_map.get(self.action, LessonSerializer)

    def get_user_role_info(self):
        """
        Determine user role and get relevant instances.
        Returns tuple: (role, instance, additional_info)
        """
        user = self.request.user

        # Check Admin role
        if user.is_superuser or user.is_staff:
            return ("admin", None, {})

        # Check Teacher role
        try:
            teacher = Teacher.objects.get(user=user, is_active=True)
            return ("teacher", teacher, {})
        except Teacher.DoesNotExist:
            pass

        # Check Student role
        try:
            from students.models import Student, StudentEnrollment

            student = Student.objects.get(user=user, is_active=True)

            # Get student's enrolled classrooms and subjects
            enrollments = StudentEnrollment.objects.filter(
                student=student, is_active=True
            ).select_related("classroom", "classroom__section__grade_level")

            enrolled_classrooms = [enrollment.classroom for enrollment in enrollments]

            return (
                "student",
                student,
                {
                    "enrolled_classrooms": enrolled_classrooms,
                    "enrollments": enrollments,
                },
            )
        except:
            pass

        # Check Parent role
        try:
            # Align with actual app and model names
            from parent.models import (
                ParentProfile as Parent,
                ParentStudentRelationship as StudentParentRelationship,
            )

            parent = Parent.objects.get(user=user, is_active=True)

            # Get parent's children and their enrollments
            relationships = StudentParentRelationship.objects.filter(
                parent=parent, is_active=True
            ).select_related("student")

            children = [rel.student for rel in relationships if rel.student.is_active]

            # Get all classrooms where children are enrolled
            from students.models import StudentEnrollment

            children_classrooms = []
            children_enrollments = []

            for child in children:
                child_enrollments = StudentEnrollment.objects.filter(
                    student=child, is_active=True
                ).select_related("classroom", "classroom__section__grade_level")

                children_enrollments.extend(child_enrollments)
                children_classrooms.extend(
                    [enrollment.classroom for enrollment in child_enrollments]
                )

            return (
                "parent",
                parent,
                {
                    "children": children,
                    "children_classrooms": list(set(children_classrooms)),
                    "children_enrollments": children_enrollments,
                },
            )
        except:
            pass

        # Unknown role
        return ("unknown", None, {})

    def get_queryset(self):
        """
        Multi-role queryset filtering with optimized prefetching.
        """
        # Base queryset with optimized prefetching
        queryset = Lesson.objects.select_related(
            "teacher__user",
            "classroom__section__grade_level",
            "subject",
            "created_by",
            "last_modified_by",
        ).prefetch_related("attendances__student__user")

        # Get user role information
        role, instance, additional_info = self.get_user_role_info()

        # Apply role-based filtering
        if role == "admin":
            # Admin can see all lessons
            logger.info(f"Admin user {self.request.user} accessing all lessons")
            # queryset remains unchanged - shows all lessons

        elif role == "teacher":
            # Teacher can only see lessons they created
            queryset = queryset.filter(teacher=instance)
            logger.info(f"Teacher {self.request.user} accessing their lessons only")

        elif role == "student":
            # Student can see lessons for their enrolled classrooms
            enrolled_classrooms = additional_info.get("enrolled_classrooms", [])
            if enrolled_classrooms:
                queryset = queryset.filter(classroom__in=enrolled_classrooms)
                logger.info(
                    f"Student {self.request.user} accessing lessons for {len(enrolled_classrooms)} classrooms"
                )
            else:
                queryset = queryset.none()
                logger.warning(f"Student {self.request.user} has no active enrollments")

        elif role == "parent":
            # Parent can see lessons for their children's classrooms
            children_classrooms = additional_info.get("children_classrooms", [])
            if children_classrooms:
                queryset = queryset.filter(classroom__in=children_classrooms)
                logger.info(
                    f"Parent {self.request.user} accessing lessons for {len(children_classrooms)} children's classrooms"
                )
            else:
                queryset = queryset.none()
                logger.warning(
                    f"Parent {self.request.user} has no active children or enrollments"
                )

        else:
            # Unknown role - no access
            logger.warning(
                f"User {self.request.user} has unknown role, returning empty queryset"
            )
            queryset = queryset.none()

        # Apply additional filters if request has query_params
        if hasattr(self.request, "query_params"):
            # Support date_from/date_to as aliases for date__gte/date__lte
            date_from = self.request.query_params.get("date_from")
            date_to = self.request.query_params.get("date_to")
            if date_from:
                queryset = queryset.filter(date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__lte=date_to)

            # Date filtering
            date_filter = self.request.query_params.get("date_filter")
            if date_filter:
                today = timezone.now().date()
                if date_filter == "today":
                    queryset = queryset.filter(date=today)
                elif date_filter == "tomorrow":
                    tomorrow = today + timedelta(days=1)
                    queryset = queryset.filter(date=tomorrow)
                elif date_filter == "this_week":
                    week_start = today - timedelta(days=today.weekday())
                    week_end = week_start + timedelta(days=6)
                    queryset = queryset.filter(date__range=[week_start, week_end])
                elif date_filter == "next_week":
                    next_week_start = today + timedelta(days=7 - today.weekday())
                    next_week_end = next_week_start + timedelta(days=6)
                    queryset = queryset.filter(
                        date__range=[next_week_start, next_week_end]
                    )
                elif date_filter == "overdue":
                    queryset = queryset.filter(
                        date__lt=today, status__in=["scheduled", "in_progress"]
                    )

            # Status filtering
            status_filter = self.request.query_params.get("status_filter")
            if status_filter:
                if status_filter == "active":
                    queryset = queryset.filter(status__in=["scheduled", "in_progress"])
                elif status_filter == "completed":
                    queryset = queryset.filter(status="completed")
                elif status_filter == "cancelled":
                    queryset = queryset.filter(status="cancelled")

            # Teacher filtering (only for admin users)
            teacher_id = self.request.query_params.get("teacher_id")
            if teacher_id and role == "admin":
                queryset = queryset.filter(teacher_id=teacher_id)

            # Classroom filtering
            classroom_id = self.request.query_params.get("classroom_id")
            if classroom_id:
                queryset = queryset.filter(classroom_id=classroom_id)

            # Subject filtering
            subject_id = self.request.query_params.get("subject_id")
            if subject_id:
                queryset = queryset.filter(subject_id=subject_id)

            # Stream filtering
            stream_filter = self.request.query_params.get("stream_filter")
            if stream_filter:
                queryset = queryset.filter(classroom__stream__name=stream_filter)

        return queryset

    def can_modify_lesson(self, lesson):
        """Check if user can modify a specific lesson"""
        role, instance, _ = self.get_user_role_info()

        if role == "admin":
            return True
        elif role == "teacher" and lesson.teacher == instance:
            return True
        else:
            return False

    def perform_create(self, serializer):
        """
        Create with role-based validation and automatic assignments.
        """
        role, instance, _ = self.get_user_role_info()

        # Only admins and teachers can create lessons
        if role not in ["admin", "teacher"]:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "Only administrators and teachers can create lessons"
            )

        with transaction.atomic():
            # For teachers, automatically set the teacher to the current user's teacher profile
            if role == "teacher":
                serializer.validated_data["teacher"] = instance

            lesson = serializer.save()
            logger.info(
                f"Lesson '{lesson.title}' created by {self.request.user} ({role}) "
                f"for {lesson.classroom} on {lesson.date} at {lesson.start_time}"
            )

    def perform_update(self, serializer):
        """Update with role-based restrictions"""
        lesson = serializer.instance

        if not self.can_modify_lesson(lesson):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("You can only modify lessons you created")

        with transaction.atomic():
            old_status = serializer.instance.status
            lesson = serializer.save()
            logger.info(
                f"Lesson '{lesson.title}' updated by {self.request.user} "
                f"(Status: {old_status} -> {lesson.status})"
            )

    def perform_destroy(self, instance):
        """Delete with role-based restrictions"""
        if not self.can_modify_lesson(instance):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("You can only delete lessons you created")

        try:
            logger.info(f"Lesson '{instance.title}' deleted by {self.request.user}")
            super().perform_destroy(instance)
        except Exception as e:
            logger.error(f"Failed to delete lesson '{instance.title}': {e}")
            raise Exception(f"Lesson cannot be deleted: {e}")

    @action(detail=False, methods=["get"])
    def my_lessons(self, request):
        """Get lessons for the current user based on their role"""
        role, instance, additional_info = self.get_user_role_info()

        if role == "admin":
            return Response(
                {
                    "message": "Admins can use the main lesson list endpoint to see all lessons",
                    "role": role,
                }
            )

        # Use the existing queryset which is already filtered by role
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        response_data = {
            "role": role,
            "count": queryset.count(),
            "lessons": serializer.data,
        }

        # Add role-specific information
        if role == "teacher":
            response_data["teacher_info"] = {
                "teacher_id": instance.id,
                "teacher_name": f"{instance.user.first_name} {instance.user.last_name}",
            }
        elif role == "student":
            response_data["student_info"] = {
                "student_id": instance.id,
                "enrolled_classrooms": len(
                    additional_info.get("enrolled_classrooms", [])
                ),
            }
        elif role == "parent":
            response_data["parent_info"] = {
                "parent_id": instance.id,
                "children_count": len(additional_info.get("children", [])),
                "children_classrooms": len(
                    additional_info.get("children_classrooms", [])
                ),
            }

        return Response(response_data)

    @action(detail=False, methods=["get"])
    def role_info(self, request):
        """Get current user's role and access information"""
        role, instance, additional_info = self.get_user_role_info()

        response_data = {
            "role": role,
            "user_id": request.user.id,
            "username": request.user.username,
        }

        if role == "teacher":
            # Use ClassroomTeacherAssignment for teacher assignments
            from classroom.models import ClassroomTeacherAssignment

            assignments = ClassroomTeacherAssignment.objects.filter(
                teacher=instance, is_active=True
            ).select_related("subject", "classroom")

            subjects_taught = sorted({a.subject.name for a in assignments})
            classrooms_taught = sorted({a.classroom.name for a in assignments})

            response_data["teacher_info"] = {
                "teacher_id": instance.id,
                "teacher_name": f"{instance.user.first_name} {instance.user.last_name}",
                "subjects_taught": subjects_taught,
                "classrooms_taught": classrooms_taught,
            }
        elif role == "student":
            response_data["student_info"] = {
                "student_id": instance.id,
                "student_name": f"{instance.user.first_name} {instance.user.last_name}",
                "enrolled_classrooms": [
                    classroom.name
                    for classroom in additional_info.get("enrolled_classrooms", [])
                ],
            }
        elif role == "parent":
            children = additional_info.get("children", [])
            response_data["parent_info"] = {
                "parent_id": instance.id,
                "parent_name": f"{instance.user.first_name} {instance.user.last_name}",
                "children": [
                    f"{child.user.first_name} {child.user.last_name}"
                    for child in children
                ],
                "children_classrooms": [
                    classroom.name
                    for classroom in additional_info.get("children_classrooms", [])
                ],
            }

        return Response(response_data)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        """Get role-based lesson statistics"""
        role, instance, additional_info = self.get_user_role_info()
        queryset = self.get_queryset()

        # Calculate statistics
        total_lessons = queryset.count()
        completed_lessons = queryset.filter(status="completed").count()
        scheduled_lessons = queryset.filter(status="scheduled").count()
        in_progress_lessons = queryset.filter(status="in_progress").count()
        cancelled_lessons = queryset.filter(status="cancelled").count()

        # Average completion percentage
        avg_completion = (
            queryset.aggregate(avg_completion=Avg("completion_percentage"))[
                "avg_completion"
            ]
            or 0
        )

        # Lessons by type
        lessons_by_type = queryset.values("lesson_type").annotate(count=Count("id"))

        # Lessons by status
        lessons_by_status = queryset.values("status").annotate(count=Count("id"))

        # Upcoming lessons (next 7 days)
        today = timezone.now().date()
        week_from_now = today + timedelta(days=7)
        upcoming_lessons = queryset.filter(
            date__range=[today, week_from_now], status="scheduled"
        ).count()

        # Overdue lessons
        overdue_lessons = queryset.filter(
            date__lt=today, status__in=["scheduled", "in_progress"]
        ).count()

        return Response(
            {
                "role": role,
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons,
                "scheduled_lessons": scheduled_lessons,
                "in_progress_lessons": in_progress_lessons,
                "cancelled_lessons": cancelled_lessons,
                "avg_completion_percentage": round(avg_completion, 2),
                "upcoming_lessons": upcoming_lessons,
                "overdue_lessons": overdue_lessons,
                "lessons_by_type": list(lessons_by_type),
                "lessons_by_status": list(lessons_by_status),
            }
        )

    # Existing action methods with role-based access control
    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        """Update lesson status with role-based access"""
        lesson = self.get_object()

        if not self.can_modify_lesson(lesson):
            return Response(
                {"error": "You can only update status of lessons you created"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = LessonStatusUpdateSerializer(
            lesson, data=request.data, partial=True
        )

        if serializer.is_valid():
            serializer.save()
            logger.info(
                f"Lesson '{lesson.title}' status updated to '{lesson.status}' "
                f"by {request.user}"
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Calendar and other methods remain the same but use role-filtered querysets
    @action(detail=False, methods=["get"])
    def calendar(self, request):
        """Get lessons for calendar view with role-based filtering"""
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        queryset = self.get_queryset()

        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])

        serializer = self.get_serializer(queryset, many=True)
        role, _, _ = self.get_user_role_info()

        return Response({"role": role, "lessons": serializer.data})


    # Expose helper endpoints used by the router under /lessons/
    @action(detail=False, methods=["get"])
    def teacher_subjects(self, request):
        """Get subjects for a selected teacher using ClassroomTeacherAssignment"""
        teacher_id = request.query_params.get("teacher_id")
        if not teacher_id:
            return Response({"error": "teacher_id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        from classroom.models import ClassroomTeacherAssignment

        assignments = ClassroomTeacherAssignment.objects.filter(
            teacher=teacher, is_active=True
        ).select_related("subject")

        # Collect subjects; expand component subjects for Junior Secondary if needed
        subjects = {a.subject for a in assignments}
        filtered_subjects = set()
        for subj in subjects:
            try:
                # If parent subject and has components for JUNIOR_SECONDARY, prefer components
                if hasattr(subj, "component_subjects") and subj.component_subjects.exists():
                    components = subj.component_subjects.filter(education_levels=["JUNIOR_SECONDARY"])  # type: ignore[arg-type]
                    if components.exists():
                        filtered_subjects.update(list(components))
                        continue
                filtered_subjects.add(subj)
            except Exception:
                filtered_subjects.add(subj)

        subjects_list = list(filtered_subjects) if filtered_subjects else list(Subject.objects.filter(is_active=True))
        serializer = SubjectSerializer(subjects_list, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def subject_teachers(self, request):
        """Get teachers for a selected subject using ClassroomTeacherAssignment"""
        subject_id = request.query_params.get("subject_id")
        if not subject_id:
            return Response({"error": "subject_id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            subject = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
            return Response({"error": "Subject not found"}, status=status.HTTP_404_NOT_FOUND)

        from classroom.models import ClassroomTeacherAssignment

        assignments = ClassroomTeacherAssignment.objects.filter(subject=subject, is_active=True).select_related("teacher__user")
        teachers = {a.teacher for a in assignments}

        # If component subject, include parent subject teachers as well
        if getattr(subject, "parent_subject", None):
            parent_assignments = ClassroomTeacherAssignment.objects.filter(subject=subject.parent_subject, is_active=True)
            teachers.update({a.teacher for a in parent_assignments})

        if not teachers:
            teachers = set(Teacher.objects.filter(is_active=True))

        serializer = TeacherSerializer(list(teachers), many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def teacher_classrooms(self, request):
        """Get classrooms for a selected teacher, optionally filtered by subject"""
        teacher_id = request.query_params.get("teacher_id")
        subject_id = request.query_params.get("subject_id")
        if not teacher_id:
            return Response({"error": "teacher_id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        from classroom.models import ClassroomTeacherAssignment

        assignments = ClassroomTeacherAssignment.objects.filter(teacher=teacher, is_active=True).select_related("classroom")
        if subject_id:
            assignments = assignments.filter(subject_id=subject_id)

        classrooms = sorted({a.classroom for a in assignments}, key=lambda c: c.name)
        if not classrooms:
            classrooms = list(Classroom.objects.filter(is_active=True))

        serializer = ClassroomSerializer(classrooms, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def classroom_sections(self, request):
        """Get all classroom sections for filtering"""
        from classroom.models import Section

        sections = Section.objects.filter(is_active=True)
        serializer = SectionSerializer(sections, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def subjects_by_level(self, request):
        """Get subjects filtered by education level, grade level, and stream"""
        education_level = request.query_params.get("education_level")
        grade_level_id = request.query_params.get("grade_level_id")
        stream = request.query_params.get("stream")

        if not education_level:
            return Response({"error": "education_level parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        subjects = Subject.get_subjects_by_education_level(education_level)

        if grade_level_id:
            subjects = [s for s in subjects if s.grade_levels.filter(id=grade_level_id).exists()]
        if stream:
            subjects = [s for s in subjects if s.compatible_streams.filter(name=stream).exists()]

        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def download_report(self, request, pk=None):
        """Download lesson report as JSON"""
        try:
            lesson = self.get_object()
            report_data = lesson.generate_lesson_report()
            from django.http import JsonResponse
            response = JsonResponse(report_data, json_dumps_params={"indent": 2})
            response["Content-Disposition"] = f'attachment; filename="lesson_report_{lesson.id}_{lesson.date}.json"'
            return response
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=404)

    @action(detail=True, methods=["get"])
    def enrolled_students(self, request, pk=None):
        """Get list of students enrolled in the lesson's classroom"""
        try:
            lesson = self.get_object()
            enrolled_students = lesson.get_enrolled_students()
            from students.serializers import StudentDetailSerializer as StudentSerializer
            serializer = StudentSerializer(enrolled_students, many=True)
            return Response({"count": getattr(lesson, "enrolled_students_count", len(enrolled_students)), "students": serializer.data})
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=404)


# Updated related ViewSets to support multi-role access
class LessonAttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for lesson attendance management with multi-role access"""

    queryset = LessonAttendance.objects.all()
    serializer_class = LessonAttendanceSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ["lesson_id", "student_id", "status"]
    search_fields = ["student__user__first_name", "student__user__last_name", "notes"]

    def get_queryset(self):
        """Filter attendance records based on user role"""
        queryset = LessonAttendance.objects.select_related("lesson", "student__user")

        user = self.request.user

        # Admin - see all
        if user.is_superuser or user.is_staff:
            return queryset

        # Teacher - see attendance for their lessons only
        try:
            teacher = Teacher.objects.get(user=user, is_active=True)
            return queryset.filter(lesson__teacher=teacher)
        except Teacher.DoesNotExist:
            pass

        # Student - see only their own attendance
        try:
            from students.models import Student

            student = Student.objects.get(user=user, is_active=True)
            return queryset.filter(student=student)
        except:
            pass

        # Parent - see attendance for their children
        try:
            # Align with actual app and model names
            from parent.models import (
                ParentProfile as Parent,
                ParentStudentRelationship as StudentParentRelationship,
            )

            parent = Parent.objects.get(user=user, is_active=True)

            # Get parent's children
            relationships = StudentParentRelationship.objects.filter(
                parent=parent, is_active=True
            )
            children_ids = [
                rel.student.id for rel in relationships if rel.student.is_active
            ]

            return queryset.filter(student_id__in=children_ids)
        except:
            pass

        return queryset.none()


class LessonResourceViewSet(viewsets.ModelViewSet):
    """ViewSet for lesson resources management with multi-role access"""

    queryset = LessonResource.objects.all()
    serializer_class = LessonResourceSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ["lesson_id", "resource_type", "is_required"]
    search_fields = ["title", "description"]

    def get_queryset(self):
        queryset = LessonResource.objects.select_related("lesson")

        user = self.request.user

        # Admin - see all
        if user.is_superuser or user.is_staff:
            return queryset

        # Teacher - see resources for their lessons only
        try:
            teacher = Teacher.objects.get(user=user, is_active=True)
            return queryset.filter(lesson__teacher=teacher)
        except Teacher.DoesNotExist:
            pass

        # Student - see resources for lessons in their classrooms
        try:
            from students.models import Student, StudentEnrollment

            student = Student.objects.get(user=user, is_active=True)
            enrollments = StudentEnrollment.objects.filter(
                student=student, is_active=True
            )
            classrooms = [enrollment.classroom for enrollment in enrollments]
            return queryset.filter(lesson__classroom__in=classrooms)
        except Exception:
            pass

        # Parent - see resources for their children's classrooms
        try:
            from parent.models import (
                ParentProfile as Parent,
                ParentStudentRelationship as StudentParentRelationship,
            )
            from students.models import StudentEnrollment

            parent = Parent.objects.get(user=user)
            relationships = StudentParentRelationship.objects.filter(parent=parent)
            children = [rel.student for rel in relationships]
            classrooms = []
            for child in children:
                classrooms.extend(
                    [
                        e.classroom
                        for e in StudentEnrollment.objects.filter(
                            student=child, is_active=True
                        )
                    ]
                )
            return queryset.filter(lesson__classroom__in=classrooms)
        except Exception:
            pass

        return queryset.none()


class LessonAssessmentViewSet(viewsets.ModelViewSet):
    """ViewSet for lesson assessments management with multi-role access"""

    queryset = LessonAssessment.objects.all()
    serializer_class = LessonAssessmentSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ["lesson_id", "assessment_type", "due_date"]
    search_fields = ["title", "description"]
    ordering_fields = ["due_date", "total_points", "weight_percentage"]
    ordering = ["due_date"]

    def get_queryset(self):
        queryset = LessonAssessment.objects.select_related("lesson")

        user = self.request.user

        # Admin - see all
        if user.is_superuser or user.is_staff:
            return queryset

        # Teacher - see assessments for their lessons only
        try:
            teacher = Teacher.objects.get(user=user, is_active=True)
            return queryset.filter(lesson__teacher=teacher)
        except Teacher.DoesNotExist:
            pass

        # Student - see assessments for lessons in their classrooms
        try:
            from students.models import Student, StudentEnrollment

            student = Student.objects.get(user=user, is_active=True)
            enrollments = StudentEnrollment.objects.filter(
                student=student, is_active=True
            )
            classrooms = [enrollment.classroom for enrollment in enrollments]
            return queryset.filter(lesson__classroom__in=classrooms)
        except Exception:
            pass

        # Parent - see assessments for their children's classrooms
        try:
            from parent.models import (
                ParentProfile as Parent,
                ParentStudentRelationship as StudentParentRelationship,
            )
            from students.models import StudentEnrollment

            parent = Parent.objects.get(user=user)
            relationships = StudentParentRelationship.objects.filter(parent=parent)
            children = [rel.student for rel in relationships]
            classrooms = []
            for child in children:
                classrooms.extend(
                    [
                        e.classroom
                        for e in StudentEnrollment.objects.filter(
                            student=child, is_active=True
                        )
                    ]
                )
            return queryset.filter(lesson__classroom__in=classrooms)
        except Exception:
            pass

        return queryset.none()
