from django.contrib import admin
from django.db import models
from django.forms import TextInput, Textarea
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib.admin import SimpleListFilter
from django.utils import timezone
from django.db import transaction
from django.db.models import Count, Avg, Q

# Import from result app
from result.models import StudentResult

from .models import (
    ExamSchedule,
    Exam,
    ExamRegistration,
    ExamStatistics,
)


# Custom Filters
class ExamTypeFilter(SimpleListFilter):
    title = "Exam Type"
    parameter_name = "exam_type"

    def lookups(self, request, model_admin):
        return [
            ("final_exam", "Final Examinations"),
            ("mid_term", "Mid-Term Examinations"),
            ("test", "Class Tests"),
            ("practical", "Practical Examinations"),
            ("quiz", "Quizzes"),
        ]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(exam_type=self.value())
        return queryset


class ExamStatusFilter(SimpleListFilter):
    title = "Exam Status"
    parameter_name = "status"

    def lookups(self, request, model_admin):
        return [
            ("upcoming", "Upcoming"),
            ("today", "Today"),
            ("completed", "Completed"),
            ("overdue", "Overdue"),
        ]

    def queryset(self, request, queryset):
        today = timezone.now().date()
        if self.value() == "upcoming":
            return queryset.filter(exam_date__gt=today, status="scheduled")
        elif self.value() == "today":
            return queryset.filter(exam_date=today)
        elif self.value() == "completed":
            return queryset.filter(status="completed")
        elif self.value() == "overdue":
            return queryset.filter(exam_date__lt=today, status="scheduled")
        return queryset


class TermFilter(SimpleListFilter):
    title = "Academic Term"
    parameter_name = "term"

    def lookups(self, request, model_admin):
        from academics.models import Term

        return [(term.id, term.name) for term in Term.objects.all()]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(term__id=self.value())
        return queryset


class GradeFilter(SimpleListFilter):
    title = "Grade"
    parameter_name = "grade"

    def lookups(self, request, model_admin):
        return [
            ("A", "Grade A (Excellent)"),
            ("B", "Grade B (Very Good)"),
            ("C", "Grade C (Good)"),
            ("D", "Grade D (Satisfactory)"),
            ("E", "Grade E (Pass)"),
            ("F", "Grade F (Fail)"),
        ]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(grade=self.value())
        return queryset


class PassFailFilter(SimpleListFilter):
    title = "Pass/Fail Status"
    parameter_name = "pass_status"

    def lookups(self, request, model_admin):
        return [
            ("pass", "Passed"),
            ("fail", "Failed"),
        ]

    def queryset(self, request, queryset):
        if self.value() == "pass":
            return queryset.filter(is_pass=True)
        elif self.value() == "fail":
            return queryset.filter(is_pass=False)
        return queryset


# Inline Admin Classes
class ExamInline(admin.TabularInline):
    model = Exam
    extra = 0
    fields = ("title", "subject", "exam_date", "start_time", "status")
    readonly_fields = ("created_at",)
    show_change_link = True


class ExamRegistrationInline(admin.TabularInline):
    model = ExamRegistration
    extra = 0
    fields = (
        "student",
        "is_registered",
        "is_present",
        "seat_number",
        "has_special_needs",
    )
    readonly_fields = ("registration_date",)


class ResultInline(admin.TabularInline):
    model = StudentResult
    extra = 0
    fields = ("student", "score", "total_marks", "grade", "percentage", "is_pass")
    readonly_fields = ("percentage", "grade", "is_pass", "date_recorded")


# # Main Admin Classes
# @admin.register(ExamSchedule)
# class ExamScheduleAdmin(admin.ModelAdmin):
#     list_display = [
#         "name",
#         "academic_session",
#         "term",
#         "start_date",
#         "end_date",
#         "registration_status",
#         "exam_count",
#         "is_active",
#         "is_default",
#         "is_current",
#     ]
#     list_filter = ["academic_session", "term", "is_active", "is_default", "start_date"]
#     actions = ["set_as_default", "set_as_active"]
#     search_fields = ["name", "description", "academic_session__name"]
#     date_hierarchy = "start_date"
#     inlines = [ExamInline]
#     ordering = ["-start_date"]

#     fieldsets = (
#         ("Basic Information", {"fields": ("name", "description")}),
#         ("Academic Period", {"fields": ("academic_session", "term")}),
#         ("Schedule", {"fields": ("start_date", "end_date")}),
#         (
#             "Registration",
#             {
#                 "fields": (
#                     "registration_start",
#                     "registration_end",
#                     "allow_late_registration",
#                 )
#             },
#         ),
#         ("Results", {"fields": ("results_publication_date",)}),
#         ("Status", {"fields": ("is_active",)}),
#     )

#     def registration_status(self, obj):
#         if obj.is_registration_open:
#             return format_html('<span style="color: green;">✓ Open</span>')
#         else:
#             return format_html('<span style="color: red;">✗ Closed</span>')

#     registration_status.short_description = "Registration"

#     def exam_count(self, obj):
#         count = obj.exams.count()
#         if count > 0:
#             url = (
#                 reverse("admin:exam_exam_changelist")
#                 + f"?exam_schedule__id__exact={obj.id}"
#             )
#             return format_html('<a href="{}">{} exams</a>', url, count)
#         return "0 exams"

#     exam_count.short_description = "Exams"

#     actions = ["activate_schedules", "deactivate_schedules"]

#     def activate_schedules(self, request, queryset):
#         updated = queryset.update(is_active=True)
#         self.message_user(request, f"{updated} exam schedules activated successfully.")

#     activate_schedules.short_description = "Activate selected exam schedules"

#     def deactivate_schedules(self, request, queryset):
#         updated = queryset.update(is_active=False)
#         self.message_user(
#             request, f"{updated} exam schedules deactivated successfully."
#         )

#     deactivate_schedules.short_description = "Deactivate selected exam schedules"


# @admin.register(Exam)
# class ExamAdmin(admin.ModelAdmin):
#     list_display = [
#         "title",
#         "subject",
#         "grade_level",
#         "exam_date",
#         "duration",
#         "total_marks",
#         "status",
#         "registration_count",
#     ]
#     list_filter = [
#         ExamStatusFilter,
#         ExamTypeFilter,
#         "grade_level",
#         "subject",
#         "exam_date",
#         "exam_schedule",
#     ]
#     search_fields = [
#         "title",
#         "subject__name",
#         "description",
#         "code",
#     ]
#     date_hierarchy = "exam_date"
#     ordering = ["-exam_date", "start_time"]
#     inlines = [ExamRegistrationInline]
#     # Now we can enable autocomplete fields since Subject admin is registered
#     autocomplete_fields = ["subject", "teacher"]
#     filter_horizontal = ["invigilators"]

#     fieldsets = (
#         (
#             "Basic Information",
#             {"fields": ("title", "code", "description", "exam_schedule")},
#         ),
#         (
#             "Academic Details",
#             {"fields": ("subject", "grade_level", "section", "exam_type")},
#         ),
#         (
#             "Schedule & Timing",
#             {"fields": ("exam_date", "start_time", "end_time", "duration_minutes")},
#         ),
#         (
#             "Assessment Details",
#             {"fields": ("total_marks", "pass_marks", "difficulty_level")},
#         ),
#         (
#             "Staff Assignment",
#             {"fields": ("teacher", "invigilators")},
#         ),
#         (
#             "Venue & Logistics",
#             {"fields": ("venue", "max_students")},
#         ),
#         (
#             "Instructions & Materials",
#             {
#                 "fields": ("instructions", "materials_allowed", "materials_provided"),
#                 "classes": ("collapse",),
#             },
#         ),
#         (
#             "File Uploads",
#             {
#                 "fields": ("questions_file", "answer_key"),
#                 "classes": ("collapse",),
#             },
#         ),
#         (
#             "Configuration",
#             {
#                 "fields": ("status", "is_practical", "requires_computer", "is_online"),
#             },
#         ),
#     )

#     readonly_fields = ["code", "duration"]

#     def registration_count(self, obj):
#         count = obj.examregistration_set.count()
#         if count > 0:
#             url = (
#                 reverse("admin:exam_examregistration_changelist")
#                 + f"?exam__id__exact={obj.id}"
#             )
#             return format_html('<a href="{}">{} students</a>', url, count)
#         return "0 students"

#     registration_count.short_description = "Registrations"

#     actions = ["mark_completed", "mark_scheduled", "generate_statistics"]

#     def mark_completed(self, request, queryset):
#         updated = queryset.update(status="completed")
#         self.message_user(request, f"{updated} exams marked as completed.")

#     mark_completed.short_description = "Mark selected exams as completed"

#     def mark_scheduled(self, request, queryset):
#         updated = queryset.update(status="scheduled")
#         self.message_user(request, f"{updated} exams marked as scheduled.")

#     mark_scheduled.short_description = "Mark selected exams as scheduled"

#     def generate_statistics(self, request, queryset):
#         count = 0
#         for exam in queryset:
#             stats, created = ExamStatistics.objects.get_or_create(exam=exam)
#             stats.calculate_statistics()
#             count += 1
#         self.message_user(request, f"Statistics generated for {count} exams.")

#     generate_statistics.short_description = "Generate statistics for selected exams"


@admin.register(ExamSchedule)
class ExamScheduleAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "academic_session",
        "term",
        "start_date",
        "end_date",
        "is_active",
        "is_default",
        "is_current",
    ]
    list_filter = ["is_active", "is_default", "academic_session", "term"]
    search_fields = ["name", "academic_session__name", "term__name"]
    actions = ["set_as_default", "set_as_active"]

    fieldsets = (
        ("Basic Information", {"fields": ("name", "description")}),
        ("Academic Period", {"fields": ("academic_session", "term")}),
        ("Schedule Dates", {"fields": ("start_date", "end_date")}),
        (
            "Registration",
            {
                "fields": (
                    "registration_start",
                    "registration_end",
                    "results_publication_date",
                )
            },
        ),
        (
            "Settings",
            {"fields": ("is_active", "is_default", "allow_late_registration")},
        ),
    )

    def is_current(self, obj):
        return obj.is_current

    is_current.boolean = True
    is_current.short_description = "Current"

    def set_as_default(self, request, queryset):
        """Admin action to set selected schedule as default"""
        if queryset.count() != 1:
            self.message_user(
                request,
                "Please select exactly one schedule to set as default.",
                level="ERROR",
            )
            return

        with transaction.atomic():
            # Remove default from all schedules
            ExamSchedule.objects.update(is_default=False)

            # Set selected as default
            schedule = queryset.first()
            schedule.is_default = True
            schedule.save()

            self.message_user(
                request, f'Set "{schedule.name}" as default exam schedule.'
            )

    set_as_default.short_description = "Set as default exam schedule"

    def set_as_active(self, request, queryset):
        """Admin action to set selected schedules as active"""
        count = queryset.update(is_active=True)
        self.message_user(request, f"Set {count} exam schedule(s) as active.")

    set_as_active.short_description = "Set as active"


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "subject",
        "grade_level",
        "section",
        "exam_schedule",
        "exam_date",
        "start_time",
        "status",
    ]
    list_filter = [
        "exam_schedule",
        "subject",
        "grade_level",
        "exam_type",
        "status",
        "is_practical",
        "is_online",
    ]
    search_fields = ["title", "code", "subject__name"]

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("title", "code", "description", "exam_schedule")},
        ),
        (
            "Academic Details",
            {
                "fields": (
                    "subject",
                    "grade_level",
                    "section",
                    "exam_type",
                    "difficulty_level",
                )
            },
        ),
        (
            "Scheduling",
            {"fields": ("exam_date", "start_time", "end_time", "duration_minutes")},
        ),
        ("Staff Assignment", {"fields": ("teacher", "invigilators")}),
        (
            "Exam Configuration",
            {"fields": ("total_marks", "pass_marks", "venue", "max_students")},
        ),
        (
            "Instructions",
            {"fields": ("instructions", "materials_allowed", "materials_provided")},
        ),
        ("Files", {"fields": ("questions_file", "answer_key")}),
        (
            "Settings",
            {"fields": ("status", "is_practical", "requires_computer", "is_online")},
        ),
    )

    readonly_fields = ["code"]

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Set default exam schedule in form
        if not obj:  # Creating new exam
            default_schedule = ExamSchedule.get_default()
            if default_schedule:
                form.base_fields["exam_schedule"].initial = default_schedule
        return form


# 4. Forms with default handling
from django import forms


class ExamForm(forms.ModelForm):
    class Meta:
        model = Exam
        fields = [
            "title",
            "description",
            "subject",
            "grade_level",
            "section",
            "exam_schedule",
            "exam_type",
            "exam_date",
            "start_time",
            "end_time",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Set default exam schedule for new exams
        if not self.instance.pk:
            default_schedule = ExamSchedule.get_default()
            if default_schedule:
                self.fields["exam_schedule"].initial = default_schedule

        # Make exam_schedule field more user-friendly
        self.fields["exam_schedule"].empty_label = "Select Exam Schedule"
        self.fields["exam_schedule"].queryset = ExamSchedule.objects.filter(
            is_active=True
        ).order_by("-is_default", "-start_date")


@admin.register(ExamRegistration)
class ExamRegistrationAdmin(admin.ModelAdmin):
    list_display = [
        "student_name",
        "exam_title",
        "exam_date",
        "registration_date",
        "is_registered",
        "is_present",
        "seat_number",
        "special_needs_indicator",
    ]
    list_filter = [
        "is_registered",
        "is_present",
        "has_special_needs",
        "exam__exam_date",
        "exam__subject",
        "registration_date",
    ]
    search_fields = [
        "student__user__first_name",
        "student__user__last_name",
        "student__user__email",  # If you want to search by email
        "student__student_class",  # Search by class (GRADE_1, NURSERY_1, etc.)
        "exam__title",
        "exam__subject__name",
    ]
    autocomplete_fields = ["exam", "student"]
    date_hierarchy = "registration_date"
    ordering = ["-registration_date"]

    fieldsets = (
        ("Registration Details", {"fields": ("exam", "student", "is_registered")}),
        ("Attendance", {"fields": ("is_present", "seat_number")}),
        (
            "Special Considerations",
            {
                "fields": (
                    "has_special_needs",
                    "special_needs_description",
                    "extra_time_minutes",
                )
            },
        ),
    )

    def student_name(self, obj):
        return obj.student.get_full_name()

    student_name.short_description = "Student"
    # Remove admin_order_field that might be causing issues
    # student_name.admin_order_field = "student__first_name"

    def exam_title(self, obj):
        return obj.exam.title

    exam_title.short_description = "Exam"
    exam_title.admin_order_field = "exam__title"

    def exam_date(self, obj):
        return obj.exam.exam_date

    exam_date.short_description = "Exam Date"
    exam_date.admin_order_field = "exam__exam_date"

    def special_needs_indicator(self, obj):
        if obj.has_special_needs:
            return format_html('<span style="color: orange;">✓ Special Needs</span>')
        return ""

    special_needs_indicator.short_description = "Special Needs"

    actions = [
        "mark_present",
        "mark_absent",
        "register_students",
        "unregister_students",
    ]

    def mark_present(self, request, queryset):
        updated = queryset.update(is_present=True)
        self.message_user(request, f"{updated} students marked as present.")

    mark_present.short_description = "Mark selected students as present"

    def mark_absent(self, request, queryset):
        updated = queryset.update(is_present=False)
        self.message_user(request, f"{updated} students marked as absent.")

    mark_absent.short_description = "Mark selected students as absent"

    def register_students(self, request, queryset):
        updated = queryset.update(is_registered=True)
        self.message_user(request, f"{updated} students registered successfully.")

    register_students.short_description = "Register selected students"

    def unregister_students(self, request, queryset):
        updated = queryset.update(is_registered=False)
        self.message_user(request, f"{updated} students unregistered.")

    unregister_students.short_description = "Unregister selected students"


@admin.register(ExamStatistics)
class ExamStatisticsAdmin(admin.ModelAdmin):
    list_display = [
        "exam_title",
        "total_registered",
        "total_appeared",
        "average_score",
        "pass_percentage_display",
        "calculated_at",
    ]
    list_filter = [
        "exam__exam_type",
        "exam__subject",
        "exam__grade_level",
        "calculated_at",
    ]
    search_fields = ["exam__title", "exam__subject__name"]
    readonly_fields = [
        "total_registered",
        "total_appeared",
        "total_absent",
        "highest_score",
        "lowest_score",
        "average_score",
        "median_score",
        "grade_a_count",
        "grade_b_count",
        "grade_c_count",
        "grade_d_count",
        "grade_e_count",
        "grade_f_count",
        "total_passed",
        "total_failed",
        "pass_percentage",
        "calculated_at",
    ]
    ordering = ["-calculated_at"]

    fieldsets = (
        ("Exam Information", {"fields": ("exam",)}),
        (
            "Participation Statistics",
            {"fields": ("total_registered", "total_appeared", "total_absent")},
        ),
        (
            "Score Statistics",
            {
                "fields": (
                    "highest_score",
                    "lowest_score",
                    "average_score",
                    "median_score",
                )
            },
        ),
        (
            "Grade Distribution",
            {
                "fields": (
                    ("grade_a_count", "grade_b_count"),
                    ("grade_c_count", "grade_d_count"),
                    ("grade_e_count", "grade_f_count"),
                )
            },
        ),
        (
            "Pass/Fail Analysis",
            {"fields": ("total_passed", "total_failed", "pass_percentage")},
        ),
        ("Last Updated", {"fields": ("calculated_at",)}),
    )

    def exam_title(self, obj):
        return obj.exam.title

    exam_title.short_description = "Exam"
    exam_title.admin_order_field = "exam__title"

    def pass_percentage_display(self, obj):
        if obj.pass_percentage:
            color = (
                "green"
                if obj.pass_percentage >= 75
                else "orange" if obj.pass_percentage >= 50 else "red"
            )
            return format_html(
                '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
                color,
                obj.pass_percentage,
            )
        return "N/A"

    pass_percentage_display.short_description = "Pass Rate"
    pass_percentage_display.admin_order_field = "pass_percentage"

    actions = ["recalculate_statistics", "export_statistics"]

    def recalculate_statistics(self, request, queryset):
        count = 0
        for stats in queryset:
            stats.calculate_statistics()
            count += 1
        self.message_user(request, f"Statistics recalculated for {count} exams.")

    recalculate_statistics.short_description = (
        "Recalculate statistics for selected exams"
    )

    def export_statistics(self, request, queryset):
        # This could be implemented to export statistics to CSV or Excel
        self.message_user(
            request,
            f"Export functionality for {queryset.count()} statistics records would be implemented here.",
        )

    export_statistics.short_description = "Export statistics for selected exams"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("exam__subject")


# Additional customizations for better user experience
admin.site.site_header = "School Exam Management System"
admin.site.site_title = "Exam Admin"
admin.site.index_title = "Welcome to Exam Management"
