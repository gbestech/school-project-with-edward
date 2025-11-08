from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import SeniorSecondaryResult
from classroom.models import Section


@admin.register(SeniorSecondaryResult)
class SeniorSecondaryResultAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "student",
        "session",
        "term",
        "total_score",
        "average",
        "created_at",
    ]
    list_filter = ["session", "term", "student__section"]
    search_fields = [
        "student__user__username",
        "student__user__first_name",
        "student__user__last_name",
    ]
    readonly_fields = ["created_at", "updated_at"]

    def get_queryset(self, request):
        """Filter results based on user role"""
        qs = super().get_queryset(request)
        user = request.user

        # Superadmin sees everything
        if user.role == "superadmin" or user.is_superuser:
            return qs

        # Principal sees all results
        if user.role == "principal":
            return qs

        # Teacher sees only their sections
        if user.role == "teacher":
            teacher_sections = Section.objects.filter(
                class_teacher=user
            ) | Section.objects.filter(subject_teachers=user)
            education_levels = teacher_sections.values_list(
                "grade_level__education_level", flat=True
            ).distinct()
            return qs.filter(student__education_level__in=education_levels)

        # Students see only their own results
        if user.role == "student":
            return qs.filter(student__user=user)

        # Default: no access
        return qs.none()

    def has_view_permission(self, request, obj=None):
        """Check view permission"""
        if request.user.is_superuser or request.user.role == "superadmin":
            return True
        return super().has_view_permission(request, obj)

    def has_change_permission(self, request, obj=None):
        """Check change permission"""
        if request.user.is_superuser or request.user.role == "superadmin":
            return True
        if request.user.role in ["principal", "teacher"]:
            return True
        return False

    def has_delete_permission(self, request, obj=None):
        """Check delete permission"""
        if request.user.is_superuser or request.user.role == "superadmin":
            return True
        if request.user.role == "principal":
            return True
        return False

    def has_add_permission(self, request):
        """Check add permission"""
        if request.user.is_superuser or request.user.role == "superadmin":
            return True
        if request.user.role in ["principal", "teacher"]:
            return True
        return False
