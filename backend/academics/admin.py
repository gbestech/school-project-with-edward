# Add this to your academics/admin.py file

from django.contrib import admin
from .models import Subject, AcademicSession, Term


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
