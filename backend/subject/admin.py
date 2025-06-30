from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Q, Count
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import Subject


class PrerequisiteInline(admin.TabularInline):
    """Inline for managing subject prerequisites"""

    model = Subject.prerequisites.through
    fk_name = "to_subject"
    verbose_name = "Prerequisite Subject"
    verbose_name_plural = "Prerequisite Subjects"
    extra = 0

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("from_subject")


from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from .models import Subject


# You need to define this inline if it's referenced
class PrerequisiteInline(admin.TabularInline):
    model = Subject.prerequisites.through
    fk_name = "to_subject"
    extra = 1
    verbose_name = "Prerequisite"
    verbose_name_plural = "Prerequisites"


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    # Display configuration - FIXED: Added is_compulsory directly for list_editable
    list_display = (
        "id",
        "name",
        "code",
        "category_with_icon",
        "education_levels_display",
        "grade_levels_display",
        "credit_hours",
        "practical_hours_display",
        "is_compulsory",  # Added directly instead of is_compulsory_display
        "has_prerequisites_display",
        "is_active_display",
        "enrollment_count_display",
        "created_at",
    )

    list_display_links = ("id", "name")

    # Filtering options
    list_filter = (
        "category",
        "is_compulsory",
        "is_core",
        "is_active",
        "is_discontinued",
        "has_practical",
        "requires_lab",
        "requires_special_equipment",
        "has_continuous_assessment",
        "has_final_exam",
        "credit_hours",
        "pass_mark",
        "practical_hours",
        "introduced_year",
        "created_at",
    )

    # Search functionality - THIS IS CRITICAL FOR AUTOCOMPLETE
    search_fields = (
        "name",
        "code",
        "description",
        "equipment_notes",
    )

    # Ordering
    ordering = ("category", "name")

    # Advanced filtering
    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .prefetch_related("grade_levels", "prerequisites", "unlocks_subjects")
            .annotate(enrollment_count=Count("grade_levels__students", distinct=True))
        )

    # Fields organization in detail view
    fieldsets = (
        ("Basic Information", {"fields": ("name", "code", "description")}),
        (
            "Classification & Levels",
            {
                "fields": (
                    "category",
                    "education_levels",
                    "grade_levels",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Academic Configuration",
            {
                "fields": (
                    "credit_hours",
                    "is_compulsory",
                    "is_core",
                    "pass_mark",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Assessment & Evaluation",
            {
                "fields": (
                    "has_continuous_assessment",
                    "has_final_exam",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Practical Components",
            {
                "fields": (
                    "has_practical",
                    "practical_hours",
                    "requires_lab",
                    "requires_special_equipment",
                    "equipment_notes",
                ),
                "classes": ("collapse",),
                "description": "Configure practical and laboratory requirements for this subject.",
            },
        ),
        (
            "Prerequisites",
            {
                "fields": ("prerequisites",),
                "classes": ("collapse",),
                "description": "Select subjects that students must complete before taking this subject.",
            },
        ),
        (
            "Status & Metadata",
            {
                "fields": (
                    "is_active",
                    "is_discontinued",
                    "introduced_year",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    # Read-only fields
    readonly_fields = ("created_at", "updated_at")

    # Form field configurations
    filter_horizontal = ("grade_levels", "prerequisites")

    # Bulk actions
    actions = [
        "activate_subjects",
        "deactivate_subjects",
        "discontinue_subjects",
        "make_compulsory",
        "make_elective",
        "enable_practical_component",
        "disable_practical_component",
        "mark_as_lab_required",
        "export_subjects_csv",
    ]

    # Enable list editing for quick changes - FIXED: Now works since is_compulsory is in list_display
    list_editable = ("is_compulsory",)

    # Items per page
    list_per_page = 25

    # Enable date hierarchy
    date_hierarchy = "created_at"

    # Inlines - Only include if PrerequisiteInline is properly defined
    inlines = [PrerequisiteInline]

    # Custom methods for display
    @admin.display(description="Category", ordering="category")
    def category_with_icon(self, obj):
        return obj.get_category_display_with_icon()

    @admin.display(description="Education Levels")
    def education_levels_display(self, obj):
        return obj.education_levels_display

    @admin.display(description="Grade Levels")
    def grade_levels_display(self, obj):
        return obj.grade_range_display

    @admin.display(description="Practical Hours")
    def practical_hours_display(self, obj):
        if obj.has_practical and obj.practical_hours > 0:
            return f"{obj.practical_hours}h"
        return "-"

    @admin.display(description="Prerequisites")
    def has_prerequisites_display(self, obj):
        count = obj.prerequisites.count()
        if count > 0:
            return format_html(
                '<span style="color: orange;">● {}</span>',
                f"{count} prerequisite{'s' if count > 1 else ''}",
            )
        return format_html('<span style="color: green;">✓ None</span>')

    @admin.display(description="Active", boolean=True, ordering="is_active")
    def is_active_display(self, obj):
        if obj.is_discontinued:
            return format_html('<span style="color: red;">⚠ Discontinued</span>')
        return obj.is_active

    @admin.display(description="Enrollments", ordering="enrollment_count")
    def enrollment_count_display(self, obj):
        count = getattr(obj, "enrollment_count", 0)
        if count > 0:
            return format_html('<strong style="color: blue;">{}</strong>', count)
        return count or 0

    # Custom bulk actions
    @admin.action(description="✅ Activate selected subjects")
    def activate_subjects(self, request, queryset):
        updated = queryset.update(is_active=True, is_discontinued=False)
        self.message_user(
            request,
            f"Successfully activated {updated} subject(s).",
        )

    @admin.action(description="❌ Deactivate selected subjects")
    def deactivate_subjects(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(
            request,
            f"Successfully deactivated {updated} subject(s).",
        )

    @admin.action(description="⚠️ Mark as discontinued")
    def discontinue_subjects(self, request, queryset):
        updated = queryset.update(is_discontinued=True, is_active=False)
        self.message_user(
            request,
            f"Successfully marked {updated} subject(s) as discontinued.",
        )

    @admin.action(description="📚 Mark as compulsory")
    def make_compulsory(self, request, queryset):
        updated = queryset.update(is_compulsory=True)
        self.message_user(
            request,
            f"Successfully marked {updated} subject(s) as compulsory.",
        )

    @admin.action(description="🎯 Mark as elective")
    def make_elective(self, request, queryset):
        updated = queryset.update(is_compulsory=False)
        self.message_user(
            request,
            f"Successfully marked {updated} subject(s) as elective.",
        )

    @admin.action(description="🔬 Enable practical component")
    def enable_practical_component(self, request, queryset):
        updated = queryset.update(has_practical=True)
        self.message_user(
            request,
            f"Successfully enabled practical component for {updated} subject(s).",
        )

    @admin.action(description="📖 Disable practical component")
    def disable_practical_component(self, request, queryset):
        updated = queryset.update(has_practical=False, practical_hours=0)
        self.message_user(
            request,
            f"Successfully disabled practical component for {updated} subject(s).",
        )

    @admin.action(description="🥽 Mark as requiring lab")
    def mark_as_lab_required(self, request, queryset):
        updated = queryset.update(requires_lab=True)
        self.message_user(
            request,
            f"Successfully marked {updated} subject(s) as requiring lab facilities.",
        )

    @admin.action(description="📊 Export to CSV")
    def export_subjects_csv(self, request, queryset):
        import csv
        from django.http import HttpResponse

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="subjects_export.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                "Name",
                "Code",
                "Category",
                "Education Levels",
                "Credit Hours",
                "Practical Hours",
                "Is Compulsory",
                "Has Prerequisites",
                "Is Active",
            ]
        )

        for subject in queryset:
            writer.writerow(
                [
                    subject.name,
                    subject.code,
                    subject.get_category_display(),
                    subject.education_levels_display,
                    subject.credit_hours,
                    subject.practical_hours if subject.has_practical else 0,
                    "Yes" if subject.is_compulsory else "No",
                    "Yes" if subject.prerequisites.exists() else "No",
                    "Yes" if subject.is_active else "No",
                ]
            )

        self.message_user(
            request,
            f"Successfully exported {queryset.count()} subject(s) to CSV.",
        )
        return response

    # Form validation and customization
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)

        # Add custom help text
        help_texts = {
            "education_levels": 'Select education levels where this subject is taught (e.g., ["PRIMARY", "SECONDARY"])',
            "pass_mark": "Minimum percentage required to pass this subject",
            "practical_hours": "Weekly practical/lab hours (set to 0 if no practical component)",
            "equipment_notes": "Describe any special equipment or facilities required",
        }

        for field_name, help_text in help_texts.items():
            if field_name in form.base_fields:
                form.base_fields[field_name].help_text = help_text

        return form

    # Custom save behavior with enhanced validation
    def save_model(self, request, obj, form, change):
        try:
            # Perform model validation
            obj.full_clean()
            super().save_model(request, obj, form, change)

            if not change:  # If creating new object
                self.message_user(
                    request,
                    format_html(
                        "Subject '<strong>{}</strong>' was created successfully. "
                        "Don't forget to assign it to appropriate grade levels!",
                        obj.name,
                    ),
                )
            else:  # If updating existing object
                self.message_user(
                    request,
                    format_html(
                        "Subject '<strong>{}</strong>' was updated successfully.",
                        obj.name,
                    ),
                )
        except Exception as e:
            self.message_user(request, f"Error saving subject: {str(e)}", level="ERROR")

    # Add custom CSS and JavaScript
    class Media:
        css = {"all": ("admin/css/subject_admin.css",)}
        js = ("admin/js/subject_admin.js",)


# Enhanced inline for use in other admin classes
class SubjectInline(admin.TabularInline):
    model = Subject.grade_levels.through
    verbose_name = "Subject Assignment"
    verbose_name_plural = "Subject Assignments"
    fields = ("subject", "subject_category", "subject_credit_hours", "subject_status")
    readonly_fields = ("subject_category", "subject_credit_hours", "subject_status")
    extra = 0
    show_change_link = True

    @admin.display(description="Category")
    def subject_category(self, obj):
        return obj.subject.get_category_display() if obj.subject else "-"

    @admin.display(description="Credit Hours")
    def subject_credit_hours(self, obj):
        return obj.subject.credit_hours if obj.subject else "-"

    @admin.display(description="Status")
    def subject_status(self, obj):
        if not obj.subject:
            return "-"

        status_parts = []
        if obj.subject.is_compulsory:
            status_parts.append("Compulsory")
        if obj.subject.has_practical:
            status_parts.append("Practical")
        if obj.subject.requires_lab:
            status_parts.append("Lab Required")

        return " | ".join(status_parts) if status_parts else "Standard"
