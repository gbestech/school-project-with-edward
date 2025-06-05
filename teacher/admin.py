from django.contrib import admin
from .models import Teacher, TeacherAssignment


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at")  # Customize as needed
    search_fields = ("user__email",)


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ("id", "teacher", "subject", "grade_level", "section")
    search_fields = ("teacher__user__email", "subject__name")
    list_filter = ("grade_level", "section")
