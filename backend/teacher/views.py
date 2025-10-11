from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Teacher, AssignmentRequest, TeacherSchedule
from .serializers import (
    TeacherSerializer,
    AssignmentRequestSerializer,
    TeacherScheduleSerializer,
)
from classroom.models import GradeLevel, Section
from subject.models import Subject
from utils.section_filtering import SectionFilterMixin


class TeacherViewSet(SectionFilterMixin, viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """
        Allow unauthenticated access to create endpoint (like StudentViewSet)
        but keep other endpoints authenticated
        """
        if self.action == "create":
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        """Override create to include generated credentials in response"""
        print(f"🔍 TeacherViewSet.create called")
        print(f"🔍 User: {request.user}")
        print(f"🔍 Is authenticated: {request.user.is_authenticated}")
        print(f"🔍 Request data keys: {list(request.data.keys())}")

        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            print(f"❌ Serializer validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        print(f"✅ Serializer valid, saving teacher...")
        teacher = serializer.save()

        # Get the response data
        response_serializer = self.get_serializer(teacher)
        response_data = response_serializer.data

        # Add generated credentials if available
        if hasattr(serializer, "context") and "user_password" in serializer.context:
            response_data["user_password"] = serializer.context["user_password"]
            response_data["user_username"] = serializer.context["user_username"]
            print(f"✅ Credentials added to response")
            print(f"✅ Username: {serializer.context['user_username']}")
        else:
            print(f"⚠️ No credentials found in serializer context")

        return Response(response_data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """Override destroy to return a proper JSON response"""
        teacher = self.get_object()
        teacher_name = (
            f"{teacher.user.first_name} {teacher.user.last_name}"
            if teacher.user
            else teacher.employee_id
        )

        # Delete the teacher
        teacher.delete()

        return Response(
            {
                "message": f"Teacher {teacher_name} has been successfully deleted",
                "status": "success",
            },
            status=status.HTTP_200_OK,
        )

    def get_queryset(self):
        queryset = Teacher.objects.all()

        # Apply section-based filtering for authenticated users
        if self.request.user.is_authenticated:
            queryset = self.filter_teachers_by_section_access(queryset)

        # Filter by search term
        search = self.request.query_params.get("search", None)
        if search:
            queryset = (
                queryset.filter(user__first_name__icontains=search)
                | queryset.filter(user__last_name__icontains=search)
                | queryset.filter(employee_id__icontains=search)
            )

        # Filter by level
        level = self.request.query_params.get("level", None)
        if level:
            queryset = queryset.filter(level=level)

        # Filter by status
        status_filter = self.request.query_params.get("status", None)
        if status_filter == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filter == "inactive":
            queryset = queryset.filter(is_active=False)

        return queryset

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        teacher = self.get_object()
        teacher.is_active = True
        teacher.save()
        return Response({"status": "Teacher activated"})

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        teacher = self.get_object()
        teacher.is_active = False
        teacher.save()
        return Response({"status": "Teacher deactivated"})

    @action(detail=False, methods=["get"], url_path="by-user/(?P<user_id>[^/.]+)")
    def by_user(self, request, user_id=None):
        """Get teacher by user ID"""
        try:
            teacher = Teacher.objects.get(user_id=user_id)
            serializer = self.get_serializer(teacher)
            return Response(serializer.data)
        except Teacher.DoesNotExist:
            return Response(
                {"error": "Teacher not found for this user"},
                status=status.HTTP_404_NOT_FOUND,
            )


class AssignmentRequestViewSet(viewsets.ModelViewSet):
    queryset = AssignmentRequest.objects.all()
    serializer_class = AssignmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = AssignmentRequest.objects.all()

        # Filter by teacher
        teacher_id = self.request.query_params.get("teacher_id", None)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)

        # Filter by status
        status_filter = self.request.query_params.get("status", None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by request type
        request_type = self.request.query_params.get("request_type", None)
        if request_type:
            queryset = queryset.filter(request_type=request_type)

        return queryset

    def perform_create(self, serializer):
        # Automatically set the teacher based on the current user
        teacher = get_object_or_404(Teacher, user=self.request.user)
        serializer.save(teacher=teacher)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        assignment_request = self.get_object()
        assignment_request.status = "approved"
        assignment_request.reviewed_at = timezone.now()
        assignment_request.reviewed_by = request.user
        assignment_request.save()

        # Here you could add logic to automatically create assignments
        # based on the approved request

        return Response({"status": "Request approved"})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        assignment_request = self.get_object()
        assignment_request.status = "rejected"
        assignment_request.reviewed_at = timezone.now()
        assignment_request.reviewed_by = request.user
        assignment_request.admin_notes = request.data.get("admin_notes", "")
        assignment_request.save()

        return Response({"status": "Request rejected"})

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        assignment_request = self.get_object()
        assignment_request.status = "cancelled"
        assignment_request.save()

        return Response({"status": "Request cancelled"})


class TeacherScheduleViewSet(viewsets.ModelViewSet):
    queryset = TeacherSchedule.objects.all()
    serializer_class = TeacherScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = TeacherSchedule.objects.all()

        # Filter by teacher
        teacher_id = self.request.query_params.get("teacher_id", None)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)

        # Filter by academic session
        academic_session = self.request.query_params.get("academic_session", None)
        if academic_session:
            queryset = queryset.filter(academic_session=academic_session)

        # Filter by term
        term = self.request.query_params.get("term", None)
        if term:
            queryset = queryset.filter(term=term)

        # Filter by day of week
        day_of_week = self.request.query_params.get("day_of_week", None)
        if day_of_week:
            queryset = queryset.filter(day_of_week=day_of_week)

        return queryset

    @action(detail=False, methods=["get"])
    def weekly_schedule(self, request):
        """Get weekly schedule for a teacher"""
        teacher_id = request.query_params.get("teacher_id")
        if not teacher_id:
            return Response(
                {"error": "teacher_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        schedules = self.get_queryset().filter(teacher_id=teacher_id, is_active=True)

        # Group by day of week
        weekly_schedule = {}
        days = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ]

        for day in days:
            weekly_schedule[day] = schedules.filter(day_of_week=day).order_by(
                "start_time"
            )

        serializer = self.get_serializer(schedules, many=True)
        return Response(
            {"weekly_schedule": weekly_schedule, "schedules": serializer.data}
        )

    @action(detail=False, methods=["post"])
    def bulk_create(self, request):
        """Create multiple schedule entries at once"""
        teacher_id = request.data.get("teacher_id")
        schedules_data = request.data.get("schedules", [])

        if not teacher_id or not schedules_data:
            return Response(
                {"error": "teacher_id and schedules are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_schedules = []
        for schedule_data in schedules_data:
            schedule_data["teacher"] = teacher_id
            serializer = self.get_serializer(data=schedule_data)
            if serializer.is_valid():
                schedule = serializer.save()
                created_schedules.append(schedule)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "message": f"Created {len(created_schedules)} schedule entries",
                "schedules": self.get_serializer(created_schedules, many=True).data,
            }
        )


# Additional utility views for assignment management
class AssignmentManagementViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"])
    def available_subjects(self, request):
        """Get all available subjects"""
        subjects = Subject.objects.filter(is_active=True)
        return Response(
            {
                "subjects": [
                    {"id": subject.id, "name": subject.name, "code": subject.code}
                    for subject in subjects
                ]
            }
        )

    @action(detail=False, methods=["get"])
    def available_grade_levels(self, request):
        """Get all available grade levels"""
        grade_levels = GradeLevel.objects.filter(is_active=True)
        return Response(
            {
                "grade_levels": [
                    {
                        "id": grade.id,
                        "name": grade.name,
                        "education_level": grade.education_level,
                    }
                    for grade in grade_levels
                ]
            }
        )

    @action(detail=False, methods=["get"])
    def available_sections(self, request):
        """Get all available sections"""
        sections = Section.objects.filter(is_active=True)
        return Response(
            {
                "sections": [
                    {
                        "id": section.id,
                        "name": section.name,
                        "grade_level": section.grade_level.name,
                    }
                    for section in sections
                ]
            }
        )

    @action(detail=False, methods=["get"])
    def teacher_assignments_summary(self, request):
        """Get summary of teacher assignments"""
        teacher_id = request.query_params.get("teacher_id")
        if not teacher_id:
            return Response(
                {"error": "teacher_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        teacher = get_object_or_404(Teacher, id=teacher_id)

        # Get assignment counts
        subject_assignments = (
            teacher.teacher_assignments.values("subject").distinct().count()
        )
        class_assignments = (
            teacher.teacher_assignments.values("grade_level", "section")
            .distinct()
            .count()
        )
        total_students = (
            0  # This would need to be calculated based on actual student enrollment
        )

        # Get pending requests
        pending_requests = teacher.assignment_requests.filter(status="pending").count()

        return Response(
            {
                "total_subjects": subject_assignments,
                "total_classes": class_assignments,
                "total_students": total_students,
                "pending_requests": pending_requests,
                "teaching_hours": 25,  # This would need to be calculated from schedule
            }
        )
