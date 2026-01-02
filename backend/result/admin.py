from django.contrib import admin
from .models import (
    SeniorSecondaryResult,
    JuniorSecondaryResult,
    PrimaryResult,
    NurseryResult,
    SeniorSecondaryTermReport,
    JuniorSecondaryTermReport,
    PrimaryTermReport,
    NurseryTermReport,
)
from classroom.models import Section
from .models import GradingSystem, Grade, ExamSession


class GradeInline(admin.TabularInline):
    model = Grade
    extra = 1


@admin.register(GradingSystem)
class GradingSystemAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "grading_type",
        "min_score",
        "max_score",
        "pass_mark",
        "is_active",
    ]
    list_filter = ["grading_type", "is_active"]
    search_fields = ["name", "description"]
    inlines = [GradeInline]
    ordering = ["name"]


@admin.register(ExamSession)
class ExamSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "term", "academic_session")  # customize fields
    search_fields = ("name", "term", "academic_session")


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ["grade", "min_score", "max_score", "grading_system", "is_passing"]
    list_filter = ["grading_system", "is_passing"]
    search_fields = ["grade", "description"]
    ordering = ["grading_system", "-min_score"]


# Base Result Admin Class (to avoid code duplication)
class BaseResultAdmin(admin.ModelAdmin):
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


# Register all Result models
@admin.register(SeniorSecondaryResult)
class SeniorSecondaryResultAdmin(BaseResultAdmin):
    pass


@admin.register(JuniorSecondaryResult)
class JuniorSecondaryResultAdmin(BaseResultAdmin):
    pass


@admin.register(PrimaryResult)
class PrimaryResultAdmin(BaseResultAdmin):
    pass


@admin.register(NurseryResult)
class NurseryResultAdmin(BaseResultAdmin):
    # Override list_display to remove total_score if it doesn't exist
    list_display = [
        "id",
        "student",
        "subject",
        "exam_session",
        "grade",
        "status",
        "created_at",
    ]


# Base Term Report Admin Class - FIXED with correct field names
class BaseTermReportAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "student",
        "exam_session",  # Changed from 'term' and 'academic_session'
        "status",
        "created_at",
    ]
    list_filter = [
        "exam_session",
        "status",
    ]  # Changed from 'term' and 'academic_session'
    search_fields = [
        "student__user__username",
        "student__user__first_name",
        "student__user__last_name",
        "student__admission_number",
    ]
    readonly_fields = ["created_at", "updated_at"]

    def get_queryset(self, request):
        """Filter term reports based on user role"""
        qs = super().get_queryset(request)
        user = request.user

        # Superadmin sees everything
        if user.role == "superadmin" or user.is_superuser:
            return qs

        # Principal sees all reports
        if user.role == "principal":
            return qs

        # Students see only their own reports
        if user.role == "student":
            return qs.filter(student__user=user)

        # Default: no access
        return qs.none()


# Register all Term Report models
@admin.register(SeniorSecondaryTermReport)
class SeniorSecondaryTermReportAdmin(BaseTermReportAdmin):
    pass


@admin.register(JuniorSecondaryTermReport)
class JuniorSecondaryTermReportAdmin(BaseTermReportAdmin):
    pass


@admin.register(PrimaryTermReport)
class PrimaryTermReportAdmin(BaseTermReportAdmin):
    pass


@admin.register(NurseryTermReport)
class NurseryTermReportAdmin(BaseTermReportAdmin):
    pass
