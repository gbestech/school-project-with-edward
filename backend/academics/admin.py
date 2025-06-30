# Add this to your academics/admin.py file

from django.contrib import admin
from .models import Subject, AcademicSession, Term


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "is_compulsory", "is_active"]
    list_filter = ["is_compulsory", "is_active"]
    search_fields = ["name", "code", "description"]  # This enables autocomplete
    list_editable = [
        "is_compulsory",
        "is_active",
    ]  # Add is_compulsory to list_display first
    ordering = ["name"]

    fieldsets = (
        ("Basic Information", {"fields": ("name", "code", "description")}),
        ("Settings", {"fields": ("is_compulsory", "is_active")}),
    )


# Register other models if not already registered
@admin.register(AcademicSession)
class AcademicSessionAdmin(admin.ModelAdmin):
    list_display = ["name", "start_date", "end_date", "is_active"]
    list_filter = ["is_active", "start_date"]
    search_fields = ["name"]
    ordering = ["-start_date"]


@admin.register(Term)
class TermAdmin(admin.ModelAdmin):
    list_display = ["name", "academic_session", "start_date", "end_date", "is_active"]
    list_filter = ["academic_session", "is_active", "start_date"]
    search_fields = ["name", "academic_session__name"]
    ordering = ["-start_date"]
