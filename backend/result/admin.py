from django.contrib import admin
from .models import SeniorSecondaryResult
from classroom.models import Section


@admin.register(SeniorSecondaryResult)
class SeniorSecondaryResultAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "student",
        "subject",
        "exam_session",
        "total_score",
        "grade",
        "status",
        "created_at",
    ]
    list_filter = ["exam_session", "subject", "grade", "status", "is_passed"]
    search_fields = [
        "student__user__username",
        "student__user__first_name",
        "student__user__last_name",
        "subject__name",
    ]
    readonly_fields = [
        "created_at",
        "updated_at",
        "entered_by",
        "approved_by",
        "approved_date",
        "published_by",
        "published_date",
        "last_edited_by",
        "last_edited_at",
    ]

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
        if request.user.is_superuser or request.user.role == "superadmin":
            return True
        return super().has_view_permission(request, obj)

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role == "superadmin":
            return True
        if request.user.role in ["principal", "teacher"]:
            return True
        return False

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser or request.user.role == "superadmin":
            return True
        if request.user.role == "principal":
            return True
        return False

    def has_add_permission(self, request):
        if request.user.is_superuser or request.user.role == "superadmin":
            return True
        if request.user.role in ["principal", "teacher"]:
            return True
        return False

    def save_model(self, request, obj, form, change):
        """Track who created/edited the result"""
        if not change:  # Creating new result
            obj.entered_by = request.user
        else:  # Editing existing result
            obj.last_edited_by = request.user
        super().save_model(request, obj, form, change)
