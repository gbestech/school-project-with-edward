from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend

from .models import Teacher, AssignmentRequest, TeacherSchedule
from .serializers import (
    TeacherSerializer,
    AssignmentRequestSerializer,
    TeacherScheduleSerializer,
    ClassroomSerializer,
    SubjectSerializer,
    ClassScheduleSerializer,
)
from classroom.models import (
    GradeLevel,
    Section,
    ClassSchedule,
    ClassroomTeacherAssignment,
)
from subject.models import Subject
from utils.section_filtering import AutoSectionFilterMixin
from schoolSettings.models import UserRole


class TeacherModulePermission(permissions.BasePermission):
    """Custom permission for Teacher module"""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated or not user.is_active:
            return False
        if user.is_superuser:
            return True
        if user.is_staff and user.is_section_admin:
            return True
        if user.is_staff:
            return True
        if hasattr(user, "teacher"):
            if request.method in permissions.SAFE_METHODS + ["PUT", "PATCH"]:
                return True

        # Check role-based permissions
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
        if user.is_superuser or user.is_staff:
            return True
        if hasattr(user, "teacher") and obj.user == user:
            return request.method in permissions.SAFE_METHODS + ["PUT", "PATCH"]
        return self.has_permission(request, view)


class TeacherViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    queryset = Teacher.objects.select_related("user").all()
    serializer_class = TeacherSerializer
    authentication_classes = [
        JWTAuthentication,
        TokenAuthentication,
        SessionAuthentication,
    ]
    permission_classes = [TeacherModulePermission]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["is_active", "specialization"]
    search_fields = ["user__first_name", "user__last_name", "employee_id"]
    ordering_fields = ["user__first_name", "user__last_name", "hire_date"]

    def _get_section_education_levels(self, user):
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
        user_section = getattr(user, "section", None)
        if not user_section and getattr(user, "role", None) in ROLE_TO_SECTION:
            user_section = ROLE_TO_SECTION[user.role]
        return SECTION_TO_EDUCATION_LEVEL.get(user_section, [])

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Teacher.objects.none()
        queryset = super().get_queryset()

        if user.is_superuser or (
            user.is_staff and not getattr(user, "is_section_admin", False)
        ):
            return queryset

        if getattr(user, "is_section_admin", False):
            allowed_levels = self._get_section_education_levels(user)
            teacher_ids = (
                ClassroomTeacherAssignment.objects.filter(
                    classroom__section__grade_level__education_level__in=allowed_levels,
                    is_active=True,
                )
                .values_list("teacher_id", flat=True)
                .distinct()
            )
            return queryset.filter(id__in=teacher_ids)

        if hasattr(user, "teacher"):
            return queryset.filter(user=user)

        return Teacher.objects.none()

    @action(detail=True, methods=["get"])
    def classes(self, request, pk=None):
        teacher = self.get_object()
        primary_serializer = ClassroomSerializer(
            teacher.primary_classes.all(), many=True
        )
        assigned_serializer = ClassroomSerializer(
            teacher.assigned_classes.all(), many=True
        )
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
        serializer = SubjectSerializer([a.subject for a in assignments], many=True)
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


class AssignmentRequestViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    queryset = AssignmentRequest.objects.all()
    serializer_class = AssignmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _get_section_education_levels(self, user):
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
        user_section = getattr(user, "section", None)
        if not user_section and getattr(user, "role", None) in ROLE_TO_SECTION:
            user_section = ROLE_TO_SECTION[user.role]
        return SECTION_TO_EDUCATION_LEVEL.get(user_section, [])

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.is_superuser or (
            user.is_staff and not getattr(user, "is_section_admin", False)
        ):
            return queryset
        if getattr(user, "is_section_admin", False):
            allowed_levels = self._get_section_education_levels(user)
            return queryset.filter(grade_level__education_level__in=allowed_levels)
        if hasattr(user, "teacher"):
            return queryset.filter(teacher__user=user)
        if user.is_staff:
            return queryset
        return queryset.none()

    def perform_create(self, serializer):
        teacher = get_object_or_404(Teacher, user=self.request.user)
        serializer.save(teacher=teacher)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        obj = self.get_object()
        obj.status = "approved"
        obj.reviewed_at = timezone.now()
        obj.reviewed_by = request.user
        obj.save()
        return Response({"status": "Request approved"})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        obj = self.get_object()
        obj.status = "rejected"
        obj.reviewed_at = timezone.now()
        obj.reviewed_by = request.user
        obj.admin_notes = request.data.get("admin_notes", "")
        obj.save()
        return Response({"status": "Request rejected"})

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        obj = self.get_object()
        obj.status = "cancelled"
        obj.save()
        return Response({"status": "Request cancelled"})
