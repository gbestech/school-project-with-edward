from django.contrib import admin
from .models import Teacher


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = (
        "get_full_name",
        "employee_id",
        "get_email",
        "phone_number",
        "hire_date",
        "is_active",
    )
    list_filter = ("is_active", "hire_date", "specialization")
    search_fields = (
        "employee_id",
        "user__first_name",
        "user__last_name",
        "user__email",
    )
    list_editable = ["is_active"]
    readonly_fields = ("created_at", "updated_at")
    ordering = ["user__first_name", "user__last_name"]

    fieldsets = (
        ("Basic Information", {"fields": ("user", "employee_id", "is_active")}),
        ("Personal Details", {"fields": ("phone_number", "address", "date_of_birth")}),
        (
            "Professional Information",
            {"fields": ("hire_date", "qualification", "specialization")},
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def get_full_name(self, obj):
        return obj.user.get_full_name() if obj.user else f"No User ({obj.employee_id})"

    get_full_name.short_description = "Full Name"
    get_full_name.admin_order_field = "user__first_name"

    def get_email(self, obj):
        return obj.user.email if obj.user else "No Email"

    get_email.short_description = "Email"
    get_email.admin_order_field = "user__email"


# Note: TeacherAssignment model has been deprecated in favor of ClassroomTeacherAssignment
# which provides proper teacher-subject-classroom mapping
# @admin.register(TeacherAssignment)
# class TeacherAssignmentAdmin(admin.ModelAdmin):
#     list_display = ("teacher", "subject", "grade_level", "section")
#     list_filter = ("grade_level", "section", "subject")
#     search_fields = (
#         "teacher__user__first_name",
#         "teacher__user__last_name",
#         "teacher__employee_id",
#         "subject__name",
#     )
#     autocomplete_fields = ("teacher",)  # Requires search_fields in TeacherAdmin
