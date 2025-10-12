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
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication


class TeacherModulePermission(permissions.BasePermission):
    """
    Custom permission to check if user has teachers module permission
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if not request.user.is_active:
            return False

        # Super admins have full access
        if request.user.is_superuser and request.user.is_staff:
            return True

        # Determine permission type based on HTTP method
        method_to_permission = {
            "GET": "read",
            "POST": "write",
            "PUT": "write",
            "PATCH": "write",
            "DELETE": "delete",
        }
        permission_type = method_to_permission.get(request.method, "read")

        # Check if user has the required permission
        from schoolSettings.models import UserRole

        user_roles = UserRole.objects.filter(
            user=request.user, is_active=True
        ).prefetch_related("role", "custom_permissions")

        for user_role in user_roles:
            # Skip expired assignments
            if user_role.is_expired():
                continue

            # Check custom permissions first
            custom_perm = user_role.custom_permissions.filter(
                module="teachers", permission_type=permission_type, granted=True
            ).first()

            if custom_perm:
                return True

            # Check role permissions
            if user_role.role.has_permission("teachers", permission_type):
                return True

        return False


class TeacherViewSet(SectionFilterMixin, viewsets.ModelViewSet):
    queryset = Teacher.objects.select_related("user").all()
    serializer_class = TeacherSerializer
    # Add JWT authentication support
    authentication_classes = [
        JWTAuthentication,
        TokenAuthentication,
        SessionAuthentication,
    ]
    # Use ONLY the custom permission class - remove get_permissions() method
    permission_classes = [TeacherModulePermission]

    def create(self, request, *args, **kwargs):
        """Override create to include generated credentials in response"""
        print(f"TeacherViewSet.create called")
        print(f"User: {request.user}")
        print(f"Is authenticated: {request.user.is_authenticated}")
        print(f"Request data keys: {list(request.data.keys())}")

        # Validate required fields before serialization
        required_fields = [
            "user_email",
            "user_first_name",
            "user_last_name",
            "employee_id",
        ]
        missing_fields = [
            field for field in required_fields if not request.data.get(field)
        ]

        if missing_fields:
            print(f"Missing required fields: {missing_fields}")
            return Response(
                {
                    "error": "Missing required fields",
                    "missing_fields": missing_fields,
                    "message": f"Please provide: {', '.join(missing_fields)}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            print(f"Serializer validation errors: {serializer.errors}")
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            print(f"Serializer valid, saving teacher...")
            teacher = serializer.save()
            print(f"Teacher saved successfully with ID: {teacher.id}")

            # Build response manually to avoid datetime serialization issues
            response_data = {
                "id": teacher.id,
                "employee_id": teacher.employee_id,
                "staff_type": teacher.staff_type,
                "level": teacher.level,
                "phone_number": teacher.phone_number,
                "address": teacher.address,
                "date_of_birth": (
                    teacher.date_of_birth.isoformat() if teacher.date_of_birth else None
                ),
                "hire_date": (
                    teacher.hire_date.isoformat() if teacher.hire_date else None
                ),
                "qualification": teacher.qualification,
                "specialization": teacher.specialization,
                "photo": teacher.photo,
                "is_active": teacher.is_active,
                "created_at": teacher.created_at.isoformat(),
                "updated_at": teacher.updated_at.isoformat(),
                "full_name": f"{teacher.user.first_name} {teacher.user.last_name}",
                "email_readonly": teacher.user.email,
                "username": teacher.user.username,
                "user": {
                    "id": teacher.user.id,
                    "first_name": teacher.user.first_name,
                    "last_name": teacher.user.last_name,
                    "email": teacher.user.email,
                    "username": teacher.user.username,
                    "date_joined": (
                        teacher.user.date_joined.isoformat()
                        if teacher.user.date_joined
                        else None
                    ),
                    "is_active": teacher.user.is_active,
                },
            }

            # Add generated credentials if available
            if hasattr(serializer, "context") and "user_password" in serializer.context:
                response_data["user_password"] = serializer.context["user_password"]
                response_data["user_username"] = serializer.context.get(
                    "user_username", ""
                )
                print(f"Credentials added to response")
                print(f"Username: {serializer.context['user_username']}")
            else:
                print(f"No credentials found in serializer context")

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Error in create method: {e}")
            import traceback

            print(f"Full traceback: {traceback.format_exc()}")
            return Response(
                {"error": "Failed to create teacher", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get_queryset(self):
        """
        Filter queryset based on user permissions and section access
        """
        queryset = Teacher.objects.select_related("user").all()

        if self.request.user.is_authenticated:
            # Apply section filtering based on user's role permissions
            queryset = self.filter_teachers_by_section_access(queryset)

        # Apply search filters
        search = self.request.query_params.get("search", None)
        if search:
            queryset = (
                queryset.filter(user__first_name__icontains=search)
                | queryset.filter(user__last_name__icontains=search)
                | queryset.filter(employee_id__icontains=search)
            )

        # Apply level filter
        level = self.request.query_params.get("level", None)
        if level:
            queryset = queryset.filter(level=level)

        # Apply status filter
        status_filter = self.request.query_params.get("status", None)
        if status_filter == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filter == "inactive":
            queryset = queryset.filter(is_active=False)

        return queryset


# Keep your other ViewSets as they are...
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
        teacher_id = self.request.query_params.get("teacher_id", None)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        academic_session = self.request.query_params.get("academic_session", None)
        if academic_session:
            queryset = queryset.filter(academic_session=academic_session)
        term = self.request.query_params.get("term", None)
        if term:
            queryset = queryset.filter(term=term)
        day_of_week = self.request.query_params.get("day_of_week", None)
        if day_of_week:
            queryset = queryset.filter(day_of_week=day_of_week)
        return queryset

    @action(detail=False, methods=["get"])
    def weekly_schedule(self, request):
        teacher_id = request.query_params.get("teacher_id")
        if not teacher_id:
            return Response(
                {"error": "teacher_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        schedules = self.get_queryset().filter(teacher_id=teacher_id, is_active=True)
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


class AssignmentManagementViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"])
    def available_subjects(self, request):
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
        teacher_id = request.query_params.get("teacher_id")
        if not teacher_id:
            return Response(
                {"error": "teacher_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        teacher = get_object_or_404(Teacher, id=teacher_id)
        subject_assignments = (
            teacher.teacher_assignments.values("subject").distinct().count()
        )
        class_assignments = (
            teacher.teacher_assignments.values("grade_level", "section")
            .distinct()
            .count()
        )
        total_students = 0
        pending_requests = teacher.assignment_requests.filter(status="pending").count()
        return Response(
            {
                "total_subjects": subject_assignments,
                "total_classes": class_assignments,
                "total_students": total_students,
                "pending_requests": pending_requests,
                "teaching_hours": 25,
            }
        )
