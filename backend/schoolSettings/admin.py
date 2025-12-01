# Register your models here.
from django.contrib import admin
from .models import SchoolSettings


@admin.register(SchoolSettings)
class SchoolSettingsAdmin(admin.ModelAdmin):
    list_display = ["school_name", "school_code", "created_at"]
    search_fields = ["school_name", "school_code"]
    readonly_fields = ["school_code", "created_at", "updated_at"]

    def has_delete_permission(self, request, obj=None):
        # Prevent accidental deletion of schools
        return False
