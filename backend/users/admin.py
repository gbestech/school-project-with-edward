from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group, Permission

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser

# Group is already registered by Django, so unregister it first
admin.site.unregister(Group)

# Permission is NOT registered by default, so just register it directly
# No need to unregister Permission


@admin.register(Group)
class CustomGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "get_permissions_count", "get_users_count")
    search_fields = ("name",)
    filter_horizontal = ("permissions",)

    def get_permissions_count(self, obj):
        return obj.permissions.count()

    get_permissions_count.short_description = "Permissions"

    def get_users_count(self, obj):
        return obj.user_set.count()

    get_users_count.short_description = "Users"


@admin.register(Permission)
class CustomPermissionAdmin(admin.ModelAdmin):
    list_display = ("name", "content_type", "codename")
    list_filter = ("content_type",)
    search_fields = ("name", "codename")


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm

    list_display = ("email", "full_name", "role", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active", "role")
    search_fields = ("email", "first_name", "middle_name", "last_name")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal info",
            {"fields": ("first_name", "middle_name", "last_name", "role")},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_staff",
                    "is_active",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "middle_name",
                    "last_name",
                    "role",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )

    def full_name(self, obj):
        return obj.full_name

    full_name.short_description = "Full Name"

    def save_model(self, request, obj, form, change):
        """Sync custom role field with Django Groups and auto-verify admin-created users"""

        # Auto-verify new users created by admins
        if not change:  # This is a new user being created
            obj.email_verified = True
            obj.is_active = True

        super().save_model(request, obj, form, change)

        if obj.role:
            group, _ = Group.objects.get_or_create(name=obj.role)

            # ❗ Ensure only one role per user — replace groups
            obj.groups.set([group])
