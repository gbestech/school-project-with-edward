from django.contrib import admin
from .models import ParentProfile
from users.models import CustomUser
from django.utils.html import format_html
import secrets
import string

def reset_parent_and_student_passwords(modeladmin, request, queryset):
    for parent_profile in queryset:
        parent_user = parent_profile.user
        # Generate new password for parent
        parent_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
        parent_user.set_password(parent_password)
        parent_user.save()
        # For each student, generate new password
        for student in parent_profile.students.all():
            student_user = student.user
            student_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
            student_user.set_password(student_password)
            student_user.save()
            modeladmin.message_user(request, f"Student {student_user.username} new password: {student_password}")
        modeladmin.message_user(request, f"Parent {parent_user.username} new password: {parent_password}")
reset_parent_and_student_passwords.short_description = "Reset and display credentials for parent and students"

@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "phone", "address", "created_at", "updated_at")
    search_fields = ("user__email", "user__first_name", "user__last_name", "phone")
    actions = [reset_parent_and_student_passwords]
