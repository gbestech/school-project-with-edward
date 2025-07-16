from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = [
        "user_email",
        "display_name",
        "user_role",
        "is_verified",
        "is_active",
        "profile_picture_preview",
        "is_profile_public",
        "created_at",
        "last_updated",
    ]

    list_filter = [
        "user__role",
        "user__is_active",
        "user__email_verified",
        "is_profile_public",
        "receive_notifications",
        "gender",
        "created_at",
        "updated_at",
    ]

    search_fields = [
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
        "phone_number",
        "bio",
    ]

    readonly_fields = [
        "user_info",
        "profile_picture_preview",
        "profile_stats",
        "created_at",
        "updated_at",
    ]

    fieldsets = (
        ("User Information", {"fields": ("user_info", "user"), "classes": ("wide",)}),
        (
            "Contact Information",
            {"fields": ("phone_number", "address"), "classes": ("wide",)},
        ),
        (
            "Personal Information",
            {"fields": ("bio", "date_of_birth", "gender"), "classes": ("wide",)},
        ),
        (
            "Profile Picture",
            {
                "fields": ("profile_picture_preview", "profile_picture"),
                "classes": ("wide",),
            },
        ),
        (
            "Social Media",
            {
                "fields": ("linkedin_url", "twitter_url", "facebook_url"),
                "classes": ("collapse",),
            },
        ),
        (
            "Privacy & Notifications",
            {
                "fields": ("is_profile_public", "receive_notifications"),
                "classes": ("wide",),
            },
        ),
        ("Statistics", {"fields": ("profile_stats",), "classes": ("collapse",)}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def user_email(self, obj):
        """Display user email with link to user admin"""
        if obj.user:
            url = reverse("admin:users_customuser_change", args=[obj.user.id])
            return format_html('<a href="{}">{}</a>', url, obj.user.email)
        return "-"

    user_email.short_description = "User Email"
    user_email.admin_order_field = "user__email"

    def display_name(self, obj):
        """Display user's full name"""
        return obj.display_name

    display_name.short_description = "Full Name"
    display_name.admin_order_field = "user__first_name"

    def user_role(self, obj):
        """Display user role with color coding"""
        role = obj.user_role
        color_map = {
            "Admin": "#dc3545",
            "Teacher": "#28a745",
            "Student": "#007bff",
            "Parent": "#ffc107",
        }
        color = color_map.get(role, "#6c757d")
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>', color, role
        )

    user_role.short_description = "Role"
    user_role.admin_order_field = "user__role"

    def is_verified(self, obj):
        """Display verification status with icon"""
        if obj.is_verified:
            return format_html('<span style="color: green;">✓ Verified</span>')
        return format_html('<span style="color: red;">✗ Not Verified</span>')

    is_verified.short_description = "Verified"
    is_verified.boolean = True
    is_verified.admin_order_field = "user__email_verified"

    def is_active(self, obj):
        """Display active status with icon"""
        if obj.user.is_active:
            return format_html('<span style="color: green;">✓ Active</span>')
        return format_html('<span style="color: red;">✗ Inactive</span>')

    is_active.short_description = "Active"
    is_active.boolean = True
    is_active.admin_order_field = "user__is_active"

    def profile_picture_preview(self, obj):
        """Display profile picture preview"""
        if obj.profile_picture:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; '
                'border-radius: 50%; object-fit: cover;" />',
                obj.profile_picture.url,
            )
        elif obj.user.profile_picture:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; '
                'border-radius: 50%; object-fit: cover;" />',
                obj.user.profile_picture,
            )
        return format_html(
            '<div style="width: 50px; height: 50px; border-radius: 50%; '
            "background-color: #f8f9fa; display: flex; align-items: center; "
            'justify-content: center; border: 1px solid #dee2e6;">'
            '<span style="color: #6c757d; font-size: 12px;">No Image</span></div>'
        )

    profile_picture_preview.short_description = "Profile Picture"

    def last_updated(self, obj):
        """Display last updated time"""
        return obj.updated_at

    last_updated.short_description = "Last Updated"
    last_updated.admin_order_field = "updated_at"

    def user_info(self, obj):
        """Display comprehensive user information"""
        if not obj.user:
            return "No user associated"

        user = obj.user
        info_html = f"""
        <div style="font-family: monospace; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
            <strong>User Details:</strong><br>
            Email: {user.email}<br>
            Username: {user.username}<br>
            Full Name: {user.full_name}<br>
            Role: {user.get_role_display()}<br>
            Active: {'Yes' if user.is_active else 'No'}<br>
            Verified: {'Yes' if user.email_verified else 'No'}<br>
            Date Joined: {user.date_joined.strftime('%Y-%m-%d %H:%M')}<br>
            Last Login: {user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else 'Never'}
        </div>
        """
        return mark_safe(info_html)

    user_info.short_description = "User Information"

    def profile_stats(self, obj):
        """Display profile statistics"""
        stats_html = f"""
        <div style="font-family: monospace; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
            <strong>Profile Statistics:</strong><br>
            Profile Created: {obj.created_at.strftime('%Y-%m-%d %H:%M')}<br>
            Last Updated: {obj.updated_at.strftime('%Y-%m-%d %H:%M')}<br>
            Profile Public: {'Yes' if obj.is_profile_public else 'No'}<br>
            Notifications: {'Enabled' if obj.receive_notifications else 'Disabled'}<br>
            Has Bio: {'Yes' if obj.bio else 'No'}<br>
            Has Address: {'Yes' if obj.address else 'No'}<br>
            Has Phone: {'Yes' if obj.primary_phone else 'No'}<br>
            Has Profile Picture: {'Yes' if obj.profile_image_url else 'No'}<br>
            Social Media Links: {sum([1 for link in [obj.linkedin_url, obj.twitter_url, obj.facebook_url] if link])}
        </div>
        """
        return mark_safe(stats_html)

    profile_stats.short_description = "Profile Statistics"

    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related("user")

    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of profiles"""
        return False

    actions = [
        "make_profile_public",
        "make_profile_private",
        "enable_notifications",
        "disable_notifications",
    ]

    def make_profile_public(self, request, queryset):
        """Make selected profiles public"""
        updated = queryset.update(is_profile_public=True)
        self.message_user(request, f"{updated} profiles made public.")

    make_profile_public.short_description = "Make selected profiles public"

    def make_profile_private(self, request, queryset):
        """Make selected profiles private"""
        updated = queryset.update(is_profile_public=False)
        self.message_user(request, f"{updated} profiles made private.")

    make_profile_private.short_description = "Make selected profiles private"

    def enable_notifications(self, request, queryset):
        """Enable notifications for selected profiles"""
        updated = queryset.update(receive_notifications=True)
        self.message_user(request, f"Notifications enabled for {updated} profiles.")

    enable_notifications.short_description = (
        "Enable notifications for selected profiles"
    )

    def disable_notifications(self, request, queryset):
        """Disable notifications for selected profiles"""
        updated = queryset.update(receive_notifications=False)
        self.message_user(request, f"Notifications disabled for {updated} profiles.")

    disable_notifications.short_description = (
        "Disable notifications for selected profiles"
    )
