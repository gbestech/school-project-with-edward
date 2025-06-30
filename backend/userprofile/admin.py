from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "full_name", "phone_number"]
    search_fields = [
        "user__email",
        "user__first_name",
        "user__middle_name",
        "user__last_name",
        "phone_number",
    ]
    list_filter = ["user__role"]
    autocomplete_fields = ["user"]
    readonly_fields = ["created_at", "updated_at"]

    def full_name(self, obj):
        return obj.user.full_name

    full_name.short_description = "Full Name"
