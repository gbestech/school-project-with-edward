# from rest_framework import viewsets, status, permissions
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from django.shortcuts import get_object_or_404
# from django.utils import timezone
# from .models import Teacher, AssignmentRequest, TeacherSchedule
# from .serializers import (
#     TeacherSerializer,
#     AssignmentRequestSerializer,
#     TeacherScheduleSerializer,
# )
# from classroom.models import GradeLevel, Section
# from subject.models import Subject
# from utils.section_filtering import SectionFilterMixin
# from rest_framework.authentication import TokenAuthentication, SessionAuthentication
# from rest_framework_simplejwt.authentication import JWTAuthentication
# from django.db import models


# from rest_framework import permissions
# from schoolSettings.models import UserRole


# class TeacherModulePermission(permissions.BasePermission):
#     """
#     Custom permission to check if user has teachers module permission.
#     - Superadmins: full access.
#     - Teachers: can read and edit their own profile.
#     - Other users: must have role-based permission.
#     """

#     def has_permission(self, request, view):
#         user = request.user

#         if not user or not user.is_authenticated or not user.is_active:
#             return False

#         # 🟩 Super admins have full access
#         if user.is_superuser or user.is_staff:
#             return True

#         # 🟦 Teachers can view and edit their own profile
#         if hasattr(user, "teacher"):
#             # Allow access for safe methods (GET, HEAD, OPTIONS) and write methods (PUT, PATCH)
#             # Exclude DELETE to prevent teachers from deleting themselves
#             if request.method in permissions.SAFE_METHODS or request.method in [
#                 "PUT",
#                 "PATCH",
#             ]:
#                 return True

#         # 🟨 Check role-based permission for others
#         method_to_permission = {
#             "GET": "read",
#             "POST": "write",
#             "PUT": "write",
#             "PATCH": "write",
#             "DELETE": "delete",
#         }
#         permission_type = method_to_permission.get(request.method, "read")

#         user_roles = UserRole.objects.filter(
#             user=user, is_active=True
#         ).prefetch_related("role", "custom_permissions")

#         for user_role in user_roles:
#             if user_role.is_expired():
#                 continue

#             # Check custom permissions first
#             if user_role.custom_permissions.filter(
#                 module="teachers", permission_type=permission_type, granted=True
#             ).exists():
#                 return True

#             # Check role permissions
#             if user_role.role.has_permission("teachers", permission_type):
#                 return True

#         # ❌ No match — deny
#         return False

#     def has_object_permission(self, request, view, obj):
#         user = request.user

#         # Admins/staff full access
#         if user.is_superuser or user.is_staff:
#             return True

#         # Teachers can view and edit their own profile (but not delete)
#         if hasattr(user, "teacher") and obj.user == user:
#             # Allow GET, PUT, PATCH but not DELETE
#             if request.method in permissions.SAFE_METHODS or request.method in [
#                 "PUT",
#                 "PATCH",
#             ]:
#                 return True
#             # Deny DELETE
#             return False

#         # Otherwise, defer to has_permission
#         return self.has_permission(request, view)


# class TeacherViewSet(SectionFilterMixin, viewsets.ModelViewSet):
#     queryset = Teacher.objects.select_related("user").all()
#     serializer_class = TeacherSerializer
#     # Add JWT authentication support
#     authentication_classes = [
#         JWTAuthentication,
#         TokenAuthentication,
#         SessionAuthentication,
#     ]
#     # Use ONLY the custom permission class - remove get_permissions() method
#     permission_classes = [TeacherModulePermission]

#     def create(self, request, *args, **kwargs):
#         """Override create to include generated credentials in response"""
#         print(f"TeacherViewSet.create called")
#         print(f"User: {request.user}")
#         print(f"Is authenticated: {request.user.is_authenticated}")
#         print(f"Request data keys: {list(request.data.keys())}")

#         # Validate required fields before serialization
#         required_fields = [
#             "user_email",
#             "user_first_name",
#             "user_last_name",
#             "employee_id",
#         ]
#         missing_fields = [
#             field for field in required_fields if not request.data.get(field)
#         ]

#         if missing_fields:
#             print(f"Missing required fields: {missing_fields}")
#             return Response(
#                 {
#                     "error": "Missing required fields",
#                     "missing_fields": missing_fields,
#                     "message": f"Please provide: {', '.join(missing_fields)}",
#                 },
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         serializer = self.get_serializer(data=request.data)

#         if not serializer.is_valid():
#             print(f"Serializer validation errors: {serializer.errors}")
#             return Response(
#                 {"error": "Validation failed", "details": serializer.errors},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         try:
#             print(f"Serializer valid, saving teacher...")
#             teacher = serializer.save()
#             print(f"Teacher saved successfully with ID: {teacher.id}")

#             # Build response manually to avoid datetime serialization issues
#             response_data = {
#                 "id": teacher.id,
#                 "employee_id": teacher.employee_id,
#                 "staff_type": teacher.staff_type,
#                 "level": teacher.level,
#                 "phone_number": teacher.phone_number,
#                 "address": teacher.address,
#                 "date_of_birth": (
#                     teacher.date_of_birth.isoformat() if teacher.date_of_birth else None
#                 ),
#                 "hire_date": (
#                     teacher.hire_date.isoformat() if teacher.hire_date else None
#                 ),
#                 "qualification": teacher.qualification,
#                 "specialization": teacher.specialization,
#                 "photo": teacher.photo,
#                 "is_active": teacher.is_active,
#                 "created_at": teacher.created_at.isoformat(),
#                 "updated_at": teacher.updated_at.isoformat(),
#                 "full_name": f"{teacher.user.first_name} {teacher.user.last_name}",
#                 "email_readonly": teacher.user.email,
#                 "username": teacher.user.username,
#                 "user": {
#                     "id": teacher.user.id,
#                     "first_name": teacher.user.first_name,
#                     "last_name": teacher.user.last_name,
#                     "email": teacher.user.email,
#                     "username": teacher.user.username,
#                     "date_joined": (
#                         teacher.user.date_joined.isoformat()
#                         if teacher.user.date_joined
#                         else None
#                     ),
#                     "is_active": teacher.user.is_active,
#                 },
#             }

#             # Add generated credentials if available
#             if hasattr(serializer, "context") and "user_password" in serializer.context:
#                 response_data["user_password"] = serializer.context["user_password"]
#                 response_data["user_username"] = serializer.context.get(
#                     "user_username", ""
#                 )
#                 print(f"Credentials added to response")
#                 print(f"Username: {serializer.context['user_username']}")
#             else:
#                 print(f"No credentials found in serializer context")

#             return Response(response_data, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             print(f"Error in create method: {e}")
#             import traceback

#             print(f"Full traceback: {traceback.format_exc()}")
#             return Response(
#                 {"error": "Failed to create teacher", "message": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )

#     # In teachers/views.py - Updated get_queryset() method

#     def get_queryset(self):
#         """
#         Filter queryset based on user permissions and section access.
#         - Admins/staff see all teachers.
#         - Teachers see only their own profile.
#         - Other users (students/parents) see none.
#         """
#         user = self.request.user
#         print(f"[TeacherViewSet] get_queryset called for user: {user}")

#         if not user.is_authenticated:
#             print("User not authenticated — returning none.")
#             return Teacher.objects.none()

#         # 🟩 Admin / staff — full access
#         if user.is_superuser or user.is_staff:
#             queryset = Teacher.objects.select_related("user").all()
#             print(f"Admin user — total teachers: {queryset.count()}")

#         # 🟦 Teacher — see only their own profile
#         elif hasattr(user, "teacher"):
#             queryset = Teacher.objects.select_related("user").filter(user=user)
#             print(f"Teacher user — restricted to self: {queryset.count()}")

#         # 🟥 Others — no access
#         else:
#             print("Non-teacher, non-admin user — returning none.")
#             return Teacher.objects.none()

#         # Apply section filtering only for non-admins (optional)
#         if not (user.is_superuser or user.is_staff):
#             queryset = self.filter_teachers_by_section_access(queryset)
#             print(f"After section filtering count: {queryset.count()}")

#         # Apply search filter
#         search = self.request.query_params.get("search")
#         if search:
#             print(f"Applying search filter: {search}")
#             queryset = queryset.filter(
#                 models.Q(user__first_name__icontains=search)
#                 | models.Q(user__last_name__icontains=search)
#                 | models.Q(employee_id__icontains=search)
#             ).distinct()

#         # Apply level filter
#         level = self.request.query_params.get("level")
#         if level:
#             queryset = queryset.filter(level=level)
#             print(f"Filtered by level={level}, count={queryset.count()}")

#         # Apply status filter
#         status_filter = self.request.query_params.get("status")
#         if status_filter:
#             if status_filter == "active":
#                 queryset = queryset.filter(is_active=True)
#             elif status_filter == "inactive":
#                 queryset = queryset.filter(is_active=False)
#             print(f"Filtered by status={status_filter}, count={queryset.count()}")

#         print(f"Final queryset count: {queryset.count()}")
#         return queryset


# # Keep your other ViewSets as they are...
# class AssignmentRequestViewSet(viewsets.ModelViewSet):
#     queryset = AssignmentRequest.objects.all()
#     serializer_class = AssignmentRequestSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         queryset = AssignmentRequest.objects.all()

#         # Filter by teacher
#         teacher_id = self.request.query_params.get("teacher_id", None)
#         if teacher_id:
#             queryset = queryset.filter(teacher_id=teacher_id)

#         # Filter by status
#         status_filter = self.request.query_params.get("status", None)
#         if status_filter:
#             queryset = queryset.filter(status=status_filter)

#         # Filter by request type
#         request_type = self.request.query_params.get("request_type", None)
#         if request_type:
#             queryset = queryset.filter(request_type=request_type)

#         return queryset

#     def perform_create(self, serializer):
#         # Automatically set the teacher based on the current user
#         teacher = get_object_or_404(Teacher, user=self.request.user)
#         serializer.save(teacher=teacher)

#     @action(detail=True, methods=["post"])
#     def approve(self, request, pk=None):
#         assignment_request = self.get_object()
#         assignment_request.status = "approved"
#         assignment_request.reviewed_at = timezone.now()
#         assignment_request.reviewed_by = request.user
#         assignment_request.save()
#         return Response({"status": "Request approved"})

#     @action(detail=True, methods=["post"])
#     def reject(self, request, pk=None):
#         assignment_request = self.get_object()
#         assignment_request.status = "rejected"
#         assignment_request.reviewed_at = timezone.now()
#         assignment_request.reviewed_by = request.user
#         assignment_request.admin_notes = request.data.get("admin_notes", "")
#         assignment_request.save()
#         return Response({"status": "Request rejected"})

#     @action(detail=True, methods=["post"])
#     def cancel(self, request, pk=None):
#         assignment_request = self.get_object()
#         assignment_request.status = "cancelled"
#         assignment_request.save()
#         return Response({"status": "Request cancelled"})


# class TeacherScheduleViewSet(viewsets.ModelViewSet):
#     queryset = TeacherSchedule.objects.all()
#     serializer_class = TeacherScheduleSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         queryset = TeacherSchedule.objects.all()
#         teacher_id = self.request.query_params.get("teacher_id", None)
#         if teacher_id:
#             queryset = queryset.filter(teacher_id=teacher_id)
#         academic_session = self.request.query_params.get("academic_session", None)
#         if academic_session:
#             queryset = queryset.filter(academic_session=academic_session)
#         term = self.request.query_params.get("term", None)
#         if term:
#             queryset = queryset.filter(term=term)
#         day_of_week = self.request.query_params.get("day_of_week", None)
#         if day_of_week:
#             queryset = queryset.filter(day_of_week=day_of_week)
#         return queryset

#     @action(detail=False, methods=["get"])
#     def weekly_schedule(self, request):
#         teacher_id = request.query_params.get("teacher_id")
#         if not teacher_id:
#             return Response(
#                 {"error": "teacher_id is required"}, status=status.HTTP_400_BAD_REQUEST
#             )
#         schedules = self.get_queryset().filter(teacher_id=teacher_id, is_active=True)
#         weekly_schedule = {}
#         days = [
#             "monday",
#             "tuesday",
#             "wednesday",
#             "thursday",
#             "friday",
#             "saturday",
#             "sunday",
#         ]
#         for day in days:
#             weekly_schedule[day] = schedules.filter(day_of_week=day).order_by(
#                 "start_time"
#             )
#         serializer = self.get_serializer(schedules, many=True)
#         return Response(
#             {"weekly_schedule": weekly_schedule, "schedules": serializer.data}
#         )

#     @action(detail=False, methods=["post"])
#     def bulk_create(self, request):
#         teacher_id = request.data.get("teacher_id")
#         schedules_data = request.data.get("schedules", [])
#         if not teacher_id or not schedules_data:
#             return Response(
#                 {"error": "teacher_id and schedules are required"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )
#         created_schedules = []
#         for schedule_data in schedules_data:
#             schedule_data["teacher"] = teacher_id
#             serializer = self.get_serializer(data=schedule_data)
#             if serializer.is_valid():
#                 schedule = serializer.save()
#                 created_schedules.append(schedule)
#             else:
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         return Response(
#             {
#                 "message": f"Created {len(created_schedules)} schedule entries",
#                 "schedules": self.get_serializer(created_schedules, many=True).data,
#             }
#         )


# class AssignmentManagementViewSet(viewsets.ViewSet):
#     permission_classes = [permissions.IsAuthenticated]

#     @action(detail=False, methods=["get"])
#     def available_subjects(self, request):
#         subjects = Subject.objects.filter(is_active=True)
#         return Response(
#             {
#                 "subjects": [
#                     {"id": subject.id, "name": subject.name, "code": subject.code}
#                     for subject in subjects
#                 ]
#             }
#         )

#     @action(detail=False, methods=["get"])
#     def available_grade_levels(self, request):
#         grade_levels = GradeLevel.objects.filter(is_active=True)
#         return Response(
#             {
#                 "grade_levels": [
#                     {
#                         "id": grade.id,
#                         "name": grade.name,
#                         "education_level": grade.education_level,
#                     }
#                     for grade in grade_levels
#                 ]
#             }
#         )

#     @action(detail=False, methods=["get"])
#     def available_sections(self, request):
#         sections = Section.objects.filter(is_active=True)
#         return Response(
#             {
#                 "sections": [
#                     {
#                         "id": section.id,
#                         "name": section.name,
#                         "grade_level": section.grade_level.name,
#                     }
#                     for section in sections
#                 ]
#             }
#         )

#     @action(detail=False, methods=["get"])
#     def teacher_assignments_summary(self, request):
#         teacher_id = request.query_params.get("teacher_id")
#         if not teacher_id:
#             return Response(
#                 {"error": "teacher_id is required"}, status=status.HTTP_400_BAD_REQUEST
#             )
#         teacher = get_object_or_404(Teacher, id=teacher_id)
#         subject_assignments = (
#             teacher.teacher_assignments.values("subject").distinct().count()
#         )
#         class_assignments = (
#             teacher.teacher_assignments.values("grade_level", "section")
#             .distinct()
#             .count()
#         )
#         total_students = 0
#         pending_requests = teacher.assignment_requests.filter(status="pending").count()
#         return Response(
#             {
#                 "total_subjects": subject_assignments,
#                 "total_classes": class_assignments,
#                 "total_students": total_students,
#                 "pending_requests": pending_requests,
#                 "teaching_hours": 25,
#             }
#         )


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
from django.db import models


from rest_framework import permissions
from schoolSettings.models import UserRole


class TeacherModulePermission(permissions.BasePermission):
    """
    Custom permission to check if user has teachers module permission.
    - Superadmins: full access.
    - Section Admins: can manage teachers in their section.
    - Teachers: can read and edit their own profile.
    - Other users: must have role-based permission.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated or not user.is_active:
            return False

        # 🟩 Super admins have full access
        if user.is_superuser:
            return True

        # 🟨 Section admins have access to teachers in their section
        if user.is_staff and user.is_section_admin:
            return True

        # 🟩 Regular staff have full access
        if user.is_staff:
            return True

        # 🟦 Teachers can view and edit their own profile
        if hasattr(user, "teacher"):
            if request.method in permissions.SAFE_METHODS or request.method in [
                "PUT",
                "PATCH",
            ]:
                return True

        # 🟨 Check role-based permission for others
        method_to_permission = {
            "GET": "read",
            "POST": "write",
            "PUT": "write",
            "PATCH": "write",
            "DELETE": "delete",
        }
        permission_type = method_to_permission.get(request.method, "read")

        user_roles = UserRole.objects.filter(
            user=user, is_active=True
        ).prefetch_related("role", "custom_permissions")

        for user_role in user_roles:
            if user_role.is_expired():
                continue

            if user_role.custom_permissions.filter(
                module="teachers", permission_type=permission_type, granted=True
            ).exists():
                return True

            if user_role.role.has_permission("teachers", permission_type):
                return True

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Admins/staff full access
        if user.is_superuser or user.is_staff:
            return True

        # Teachers can view and edit their own profile (but not delete)
        if hasattr(user, "teacher") and obj.user == user:
            if request.method in permissions.SAFE_METHODS or request.method in [
                "PUT",
                "PATCH",
            ]:
                return True
            return False

        return self.has_permission(request, view)


class TeacherViewSet(SectionFilterMixin, viewsets.ModelViewSet):
    queryset = Teacher.objects.select_related("user").all()
    serializer_class = TeacherSerializer
    authentication_classes = [
        JWTAuthentication,
        TokenAuthentication,
        SessionAuthentication,
    ]
    permission_classes = [TeacherModulePermission]

    def _get_section_education_levels(self, user):
        """
        Helper method to get education levels based on user's section/role
        Returns a list of education levels the user can access
        """
        SECTION_TO_EDUCATION_LEVEL = {
            "nursery": ["NURSERY"],
            "primary": ["PRIMARY"],
            "junior_secondary": ["JUNIOR_SECONDARY"],
            "senior_secondary": ["SENIOR_SECONDARY"],
            "secondary": ["JUNIOR_SECONDARY", "SENIOR_SECONDARY"],
        }

        ROLE_TO_SECTION = {
            "nursery_admin": "nursery",
            "primary_admin": "primary",
            "junior_secondary_admin": "junior_secondary",
            "senior_secondary_admin": "senior_secondary",
            "secondary_admin": "secondary",
        }

        user_section = user.section
        if not user_section and user.role in ROLE_TO_SECTION:
            user_section = ROLE_TO_SECTION[user.role]

        return SECTION_TO_EDUCATION_LEVEL.get(user_section, [])

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

        # For section admins, validate teacher's section matches admin's section
        user = request.user
        if user.is_staff and user.is_section_admin:
            teacher_section = request.data.get("section")
            admin_section = user.section

            # Map section to education levels for validation
            education_levels = self._get_section_education_levels(user)

            # If teacher section is provided, validate it
            if teacher_section:
                # Teacher section should match admin's manageable sections
                valid_sections = []
                if admin_section == "nursery":
                    valid_sections = ["nursery"]
                elif admin_section == "primary":
                    valid_sections = ["primary"]
                elif admin_section == "junior_secondary":
                    valid_sections = ["junior_secondary"]
                elif admin_section == "senior_secondary":
                    valid_sections = ["senior_secondary"]
                elif admin_section == "secondary":
                    valid_sections = [
                        "junior_secondary",
                        "senior_secondary",
                        "secondary",
                    ]

                if teacher_section not in valid_sections:
                    return Response(
                        {
                            "error": f"You can only create teachers in your section ({', '.join(valid_sections)})"
                        },
                        status=status.HTTP_403_FORBIDDEN,
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
        Filter queryset based on user permissions and section access.
        - Superadmin: See all teachers
        - Section Admin: See only teachers in their section (based on assignments)
        - Regular Staff: See all teachers
        - Teacher: See only their own profile
        """
        user = self.request.user
        print(f"[TeacherViewSet] get_queryset called for user: {user}")

        if not user.is_authenticated:
            print("User not authenticated — returning none.")
            return Teacher.objects.none()

        # 🟩 Superadmin — full access
        if user.is_superuser:
            queryset = Teacher.objects.select_related("user").all()
            print(f"Superadmin user — total teachers: {queryset.count()}")

        # 🟨 Section Admin — see only teachers in their section
        elif user.is_staff and user.is_section_admin:
            education_levels = self._get_section_education_levels(user)

            if not education_levels:
                print(f"Section admin {user.username} has no valid section")
                return Teacher.objects.none()

            # Get teachers who have assignments in the section's education levels
            from classroom.models import ClassroomTeacherAssignment

            teacher_ids = (
                ClassroomTeacherAssignment.objects.filter(
                    classroom__section__grade_level__education_level__in=education_levels,
                    is_active=True,
                )
                .values_list("teacher_id", flat=True)
                .distinct()
            )

            queryset = Teacher.objects.select_related("user").filter(id__in=teacher_ids)

            print(
                f"Section admin {user.username} ({user.role}) — "
                f"education_levels: {education_levels}, "
                f"teachers count: {queryset.count()}"
            )

        # 🟩 Regular staff — full access
        elif user.is_staff:
            queryset = Teacher.objects.select_related("user").all()
            print(f"Regular staff user — total teachers: {queryset.count()}")

        # 🟦 Teacher — see only their own profile
        elif hasattr(user, "teacher"):
            queryset = Teacher.objects.select_related("user").filter(user=user)
            print(f"Teacher user — restricted to self: {queryset.count()}")

        # 🟥 Others — no access
        else:
            print("Non-teacher, non-admin user — returning none.")
            return Teacher.objects.none()

        # Apply search filter
        search = self.request.query_params.get("search")
        if search:
            print(f"Applying search filter: {search}")
            queryset = queryset.filter(
                models.Q(user__first_name__icontains=search)
                | models.Q(user__last_name__icontains=search)
                | models.Q(employee_id__icontains=search)
            ).distinct()

        # Apply level filter
        level = self.request.query_params.get("level")
        if level:
            queryset = queryset.filter(level=level)
            print(f"Filtered by level={level}, count={queryset.count()}")

        # Apply status filter
        status_filter = self.request.query_params.get("status")
        if status_filter:
            if status_filter == "active":
                queryset = queryset.filter(is_active=True)
            elif status_filter == "inactive":
                queryset = queryset.filter(is_active=False)
            print(f"Filtered by status={status_filter}, count={queryset.count()}")

        print(f"Final queryset count: {queryset.count()}")
        return queryset


class AssignmentRequestViewSet(viewsets.ModelViewSet):
    queryset = AssignmentRequest.objects.all()
    serializer_class = AssignmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _get_section_education_levels(self, user):
        """Helper method to get education levels based on user's section/role"""
        SECTION_TO_EDUCATION_LEVEL = {
            "nursery": ["NURSERY"],
            "primary": ["PRIMARY"],
            "junior_secondary": ["JUNIOR_SECONDARY"],
            "senior_secondary": ["SENIOR_SECONDARY"],
            "secondary": ["JUNIOR_SECONDARY", "SENIOR_SECONDARY"],
        }

        ROLE_TO_SECTION = {
            "nursery_admin": "nursery",
            "primary_admin": "primary",
            "junior_secondary_admin": "junior_secondary",
            "senior_secondary_admin": "senior_secondary",
            "secondary_admin": "secondary",
        }

        user_section = user.section
        if not user_section and user.role in ROLE_TO_SECTION:
            user_section = ROLE_TO_SECTION[user.role]

        return SECTION_TO_EDUCATION_LEVEL.get(user_section, [])

    def get_queryset(self):
        """
        Filter assignment requests based on user role.
        - Superadmin: See all requests
        - Section Admin: See requests for their section only
        - Teacher: See only their own requests
        """
        queryset = AssignmentRequest.objects.all()
        user = self.request.user

        # Superadmin - see all
        if user.is_superuser:
            pass

        # Section admin - see requests in their section
        elif user.is_staff and user.is_section_admin:
            education_levels = self._get_section_education_levels(user)
            if education_levels:
                queryset = queryset.filter(
                    grade_level__education_level__in=education_levels
                )
            else:
                queryset = queryset.none()

        # Teacher - see only their own requests
        elif hasattr(user, "teacher"):
            queryset = queryset.filter(teacher__user=user)

        # Regular staff - see all
        elif user.is_staff:
            pass

        # Others - no access
        else:
            queryset = queryset.none()

        # Apply additional filters
        teacher_id = self.request.query_params.get("teacher_id", None)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)

        status_filter = self.request.query_params.get("status", None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        request_type = self.request.query_params.get("request_type", None)
        if request_type:
            queryset = queryset.filter(request_type=request_type)

        return queryset

    def perform_create(self, serializer):
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

    def _get_section_education_levels(self, user):
        """Helper method to get education levels based on user's section/role"""
        SECTION_TO_EDUCATION_LEVEL = {
            "nursery": ["NURSERY"],
            "primary": ["PRIMARY"],
            "junior_secondary": ["JUNIOR_SECONDARY"],
            "senior_secondary": ["SENIOR_SECONDARY"],
            "secondary": ["JUNIOR_SECONDARY", "SENIOR_SECONDARY"],
        }

        ROLE_TO_SECTION = {
            "nursery_admin": "nursery",
            "primary_admin": "primary",
            "junior_secondary_admin": "junior_secondary",
            "senior_secondary_admin": "senior_secondary",
            "secondary_admin": "secondary",
        }

        user_section = user.section
        if not user_section and user.role in ROLE_TO_SECTION:
            user_section = ROLE_TO_SECTION[user.role]

        return SECTION_TO_EDUCATION_LEVEL.get(user_section, [])

    def get_queryset(self):
        """
        Filter teacher schedules based on user role.
        - Superadmin: See all schedules
        - Section Admin: See schedules for teachers in their section
        - Teacher: See only their own schedule
        """
        queryset = TeacherSchedule.objects.all()
        user = self.request.user

        # Superadmin - see all
        if user.is_superuser or (user.is_staff and not user.is_section_admin):
            pass

        # Section admin - see schedules for their section's teachers
        elif user.is_staff and user.is_section_admin:
            education_levels = self._get_section_education_levels(user)
            if education_levels:
                from classroom.models import ClassroomTeacherAssignment

                teacher_ids = (
                    ClassroomTeacherAssignment.objects.filter(
                        classroom__section__grade_level__education_level__in=education_levels,
                        is_active=True,
                    )
                    .values_list("teacher_id", flat=True)
                    .distinct()
                )

                queryset = queryset.filter(teacher_id__in=teacher_ids)
            else:
                queryset = queryset.none()

        # Teacher - see only their own schedule
        elif hasattr(user, "teacher"):
            queryset = queryset.filter(teacher__user=user)

        # Others - no access
        else:
            queryset = queryset.none()

        # Apply additional filters
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
