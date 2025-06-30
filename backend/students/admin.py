from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "get_full_name",
        "get_age",
        "gender",
        "education_level",
        "student_class",
        "get_parent_contact",
        "admission_date",
    ]

    list_filter = [
        "education_level",
        "gender",
        "student_class",
        "admission_date",
        ("date_of_birth", admin.DateFieldListFilter),
    ]

    search_fields = [
        "user__email",
        "user__first_name",
        "user__middle_name",
        "user__last_name",
        "student_class",
        "parent_contact",
        "emergency_contact",
    ]

    date_hierarchy = "admission_date"

    # Improved ordering that groups by education level first
    ordering = [
        "education_level",
        "student_class",
        "user__first_name",
        "user__last_name",
    ]

    # Organize fields in fieldsets for better UX
    fieldsets = (
        ("Basic Information", {"fields": ("user", "gender", "date_of_birth")}),
        (
            "Academic Information",
            {
                "fields": ("education_level", "student_class", "admission_date"),
                "description": "Academic level and class information",
            },
        ),
        (
            "Contact Information",
            {
                "fields": ("parent_contact", "emergency_contact"),
                "description": "Parent and emergency contact details",
            },
        ),
        (
            "Health & Special Requirements",
            {
                "fields": ("medical_conditions", "special_requirements"),
                "classes": ("collapse",),  # Collapsible section
                "description": "Medical conditions, allergies, and special educational needs",
            },
        ),
    )

    # Read-only fields
    readonly_fields = ("admission_date",)

    # Fields to display in list view filters
    list_per_page = 25
    list_max_show_all = 100

    # Enable bulk actions
    actions = ["mark_as_nursery", "mark_as_primary", "mark_as_secondary"]

    def get_full_name(self, obj):
        """Returns the full name of the student including middle name if present."""
        return obj.user.full_name

    get_full_name.short_description = "Full Name"
    get_full_name.admin_order_field = "user__first_name"

    def get_age(self, obj):
        """Display student's current age."""
        age = obj.age
        # Color-code ages for quick visual identification
        if age <= 5:  # Nursery age
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">{} yrs</span>', age
            )
        elif age <= 12:  # Primary age
            return format_html(
                '<span style="color: #007bff; font-weight: bold;">{} yrs</span>', age
            )
        else:  # Secondary age
            return format_html(
                '<span style="color: #6f42c1; font-weight: bold;">{} yrs</span>', age
            )

    get_age.short_description = "Age"
    get_age.admin_order_field = "date_of_birth"

    def get_parent_contact(self, obj):
        """Display parent contact with clickable link if available."""
        if obj.parent_contact:
            return format_html(
                '<a href="tel:{}" style="color: #007bff;">{}</a>',
                obj.parent_contact,
                obj.parent_contact,
            )
        return "-"

    get_parent_contact.short_description = "Parent Contact"
    get_parent_contact.admin_order_field = "parent_contact"

    def get_queryset(self, request):
        """Optimize queryset to reduce database queries."""
        return super().get_queryset(request).select_related("user")

    # Custom admin actions
    def mark_as_nursery(self, request, queryset):
        """Bulk action to mark selected students as nursery level."""
        updated = queryset.update(education_level="NURSERY")
        self.message_user(
            request, f"{updated} student(s) successfully marked as Nursery level."
        )

    mark_as_nursery.short_description = "Mark selected students as Nursery level"

    def mark_as_primary(self, request, queryset):
        """Bulk action to mark selected students as primary level."""
        updated = queryset.update(education_level="PRIMARY")
        self.message_user(
            request, f"{updated} student(s) successfully marked as Primary level."
        )

    mark_as_primary.short_description = "Mark selected students as Primary level"

    def mark_as_secondary(self, request, queryset):
        """Bulk action to mark selected students as secondary level."""
        updated = queryset.update(education_level="SECONDARY")
        self.message_user(
            request, f"{updated} student(s) successfully marked as Secondary level."
        )

    mark_as_secondary.short_description = "Mark selected students as Secondary level"

    def get_form(self, request, obj=None, **kwargs):
        """Customize form based on education level."""
        form = super().get_form(request, obj, **kwargs)

        # If editing an existing nursery student, highlight important fields
        if obj and obj.education_level == "NURSERY":
            # You can add custom form modifications here if needed
            pass

        return form

    def save_model(self, request, obj, form, change):
        """Custom save logic."""
        # Log who added/modified the student
        if not change:  # New student
            # You can add logging here if needed
            pass
        super().save_model(request, obj, form, change)

    # Add custom CSS for better visual organization
    class Media:
        css = {
            "all": ("admin/css/custom_student_admin.css",)  # Optional: custom CSS file
        }


# Optional: Inline admin for related models
# If you have related models like StudentGuardian, StudentMedicalRecord, etc.
# class StudentGuardianInline(admin.TabularInline):
#     model = StudentGuardian
#     extra = 1
#     fields = ('name', 'relationship', 'contact_number', 'is_primary_contact')

# Then add to StudentAdmin:
# inlines = [StudentGuardianInline]
