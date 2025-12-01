from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    list_display = [
        "username",
        "email",
        "full_name",
        "role",
        "school_code",  # Show school code
        "section",
        "is_active",
        "is_staff",
    ]

    list_filter = [
        "school",  # Filter by school
        "role",
        "section",
        "is_active",
        "is_staff",
        "email_verified",
    ]

    search_fields = [
        "username",
        "email",
        "first_name",
        "last_name",
        "school__school_name",
        "school__school_code",
    ]

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (
            "Personal Info",
            {
                "fields": (
                    "first_name",
                    "middle_name",
                    "last_name",
                    "email",
                    "phone",
                    "phone_number",
                )
            },
        ),
        (
            "School & Role Information",
            {
                "fields": ("school", "role", "section", "reports_to"),
                "description": "Multi-tenant: Users must be assigned to a school",
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Verification",
            {
                "fields": (
                    "email_verified",
                    "verification_code",
                    "verification_code_expires",
                )
            },
        ),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "password1",
                    "password2",
                    "first_name",
                    "last_name",
                    "school",  # Required for new users
                    "role",
                    "section",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )

    readonly_fields = ["date_joined", "last_login"]

    def school_code(self, obj):
        """Display school code in list"""
        return obj.school.school_code if obj.school else "-"

    school_code.short_description = "School"
    school_code.admin_order_field = "school__school_code"

    def get_queryset(self, request):
        """Filter users by school for non-superusers"""
        qs = super().get_queryset(request)

        # True Django superusers see everything
        if request.user.is_superuser:
            return qs

        # School admins only see their school's users
        if hasattr(request.user, "school") and request.user.school:
            return qs.filter(school=request.user.school)

        return qs.none()
