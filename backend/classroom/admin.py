from django.contrib import admin
from .models import (
    GradeLevel,
    Section,
    AcademicYear,
    Term,
    Student,
    Subject,
    Classroom,
    ClassroomTeacherAssignment,
    StudentEnrollment,
    ClassSchedule,
)

from django.utils.html import format_html
from django.db.models import Count


# Register your classroom models
@admin.register(GradeLevel)
class GradeLevelAdmin(admin.ModelAdmin):
    list_display = ("name", "education_level", "order", "is_active")
    list_filter = ("education_level", "is_active")
    search_fields = ("name",)
    ordering = ("education_level", "order")


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("name", "grade_level", "is_active")
    list_filter = ("grade_level", "is_active")
    search_fields = ("name",)


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ("name", "start_date", "end_date", "is_current", "is_active")
    list_filter = ("is_current", "is_active")
    search_fields = ("name",)


@admin.register(Term)
class TermAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "academic_year",
        "start_date",
        "end_date",
        "is_current",
        "is_active",
    )
    list_filter = ("academic_year", "name", "is_current", "is_active")
    search_fields = ("academic_year__name",)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        "admission_number",
        "first_name",
        "last_name",
        "gender",
        "is_active",
    )
    list_filter = ("gender", "is_active", "admission_date")
    search_fields = ("admission_number", "first_name", "last_name", "guardian_name")
    readonly_fields = ("age",)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "is_core", "is_active")
    list_filter = ("is_core", "is_active")
    search_fields = ("name", "code")
    filter_horizontal = ("grade_levels",)


# For Classroom Admin - Removed problematic field
@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "is_active",  # Common field
    ]
    list_filter = [
        "is_active",  # Common field
        "created_at",  # Assuming this exists
    ]
    search_fields = ["name", "description"]
    ordering = ["name"]  # Use a field that exists

    fieldsets = (
        ("Basic Information", {"fields": ("name", "description")}),
        ("Status", {"fields": ("is_active",)}),
    )

    def student_count(self, obj):
        # Assuming there's a relationship to count students
        if hasattr(obj, "students"):
            return obj.students.count()
        return 0

    student_count.short_description = "Students"

    actions = ["activate_classrooms", "deactivate_classrooms"]

    def activate_classrooms(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} classrooms activated successfully.")

    activate_classrooms.short_description = "Activate selected classrooms"

    def deactivate_classrooms(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} classrooms deactivated successfully.")

    deactivate_classrooms.short_description = "Deactivate selected classrooms"


@admin.register(ClassroomTeacherAssignment)
class ClassroomTeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ("classroom", "teacher", "subject", "assigned_date", "is_active")
    list_filter = ("assigned_date", "is_active", "subject")
    search_fields = (
        "classroom__name",
        "teacher__user__first_name",
        "teacher__user__last_name",
        "subject__name",
    )


@admin.register(StudentEnrollment)
class StudentEnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "classroom", "enrollment_date", "is_active")
    list_filter = ("enrollment_date", "is_active", "classroom__academic_year")
    search_fields = ("student__first_name", "student__last_name", "classroom__name")


@admin.register(ClassSchedule)
class ClassScheduleAdmin(admin.ModelAdmin):
    list_display = (
        "classroom",
        "subject",
        "teacher",
        "day_of_week",
        "start_time",
        "end_time",
    )
    list_filter = ("day_of_week", "classroom__academic_year", "is_active")
    search_fields = (
        "classroom__name",
        "subject__name",
        "teacher__user__first_name",
        "teacher__user__last_name",
    )
