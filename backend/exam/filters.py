import django_filters
from django import forms
from django.utils import timezone
from .models import (
    Exam,
    EXAM_TYPE_CHOICES,
    EXAM_STATUS_CHOICES,
    DIFFICULTY_CHOICES,
)
from academics.models import Term


class ExamFilter(django_filters.FilterSet):
    # Date range filters
    start_date = django_filters.DateFilter(
        field_name="exam_date",
        lookup_expr="gte",
        widget=forms.DateInput(attrs={"type": "date", "class": "form-control"}),
        label="From Date",
    )
    end_date = django_filters.DateFilter(
        field_name="exam_date",
        lookup_expr="lte",
        widget=forms.DateInput(attrs={"type": "date", "class": "form-control"}),
        label="To Date",
    )

    # Exact date filter
    exam_date = django_filters.DateFilter(
        field_name="exam_date",
        widget=forms.DateInput(attrs={"type": "date", "class": "form-control"}),
        label="Exact Date",
    )

    # Text search filters
    title = django_filters.CharFilter(
        lookup_expr="icontains",
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "Search exam title..."}
        ),
        label="Exam Title",
    )

    code = django_filters.CharFilter(
        lookup_expr="icontains",
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "Search exam code..."}
        ),
        label="Exam Code",
    )

    # Choice field filters
    exam_type = django_filters.ChoiceFilter(
        choices=EXAM_TYPE_CHOICES,
        empty_label="All Types",
        widget=forms.Select(attrs={"class": "form-control"}),
        label="Exam Type",
    )

    status = django_filters.ChoiceFilter(
        choices=EXAM_STATUS_CHOICES,
        empty_label="All Status",
        widget=forms.Select(attrs={"class": "form-control"}),
        label="Status",
    )

    term = django_filters.ChoiceFilter(
        choices=Term.TERM_CHOICES,
        empty_label="All Terms",
        widget=forms.Select(attrs={"class": "form-control"}),
        label="Term",
    )

    difficulty_level = django_filters.ChoiceFilter(
        choices=DIFFICULTY_CHOICES,
        empty_label="All Difficulties",
        widget=forms.Select(attrs={"class": "form-control"}),
        label="Difficulty",
    )

    # Academic session filter
    session_year = django_filters.CharFilter(
        lookup_expr="icontains",
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "e.g., 2024/2025"}
        ),
        label="Session Year",
    )

    # Boolean filters
    is_practical = django_filters.BooleanFilter(
        widget=forms.CheckboxInput(attrs={"class": "form-check-input"}),
        label="Practical Exam",
    )

    requires_computer = django_filters.BooleanFilter(
        widget=forms.CheckboxInput(attrs={"class": "form-check-input"}),
        label="Requires Computer",
    )

    is_online = django_filters.BooleanFilter(
        widget=forms.CheckboxInput(attrs={"class": "form-check-input"}),
        label="Online Exam",
    )

    # Venue filter
    venue = django_filters.CharFilter(
        lookup_expr="icontains",
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "Search venue..."}
        ),
        label="Venue",
    )

    # Time range filters
    start_time = django_filters.TimeFilter(
        field_name="start_time",
        lookup_expr="gte",
        widget=forms.TimeInput(attrs={"type": "time", "class": "form-control"}),
        label="Start Time From",
    )

    end_time = django_filters.TimeFilter(
        field_name="end_time",
        lookup_expr="lte",
        widget=forms.TimeInput(attrs={"type": "time", "class": "form-control"}),
        label="End Time To",
    )

    # Marks range filters
    total_marks_min = django_filters.NumberFilter(
        field_name="total_marks",
        lookup_expr="gte",
        widget=forms.NumberInput(
            attrs={"class": "form-control", "placeholder": "Min marks"}
        ),
        label="Min Total Marks",
    )

    total_marks_max = django_filters.NumberFilter(
        field_name="total_marks",
        lookup_expr="lte",
        widget=forms.NumberInput(
            attrs={"class": "form-control", "placeholder": "Max marks"}
        ),
        label="Max Total Marks",
    )

    # Duration filter
    duration_minutes_min = django_filters.NumberFilter(
        field_name="duration_minutes",
        lookup_expr="gte",
        widget=forms.NumberInput(
            attrs={"class": "form-control", "placeholder": "Min duration"}
        ),
        label="Min Duration (minutes)",
    )

    duration_minutes_max = django_filters.NumberFilter(
        field_name="duration_minutes",
        lookup_expr="lte",
        widget=forms.NumberInput(
            attrs={"class": "form-control", "placeholder": "Max duration"}
        ),
        label="Max Duration (minutes)",
    )

    class Meta:
        model = Exam
        fields = [
            # Basic relationships
            "subject",
            "grade_level",
            "section",
            "teacher",
            "exam_schedule",
            # Date and time filters
            "start_date",
            "end_date",
            "exam_date",
            "start_time",
            "end_time",
            # Text search
            "title",
            "code",
            "venue",
            # Choice fields
            "exam_type",
            "status",
            "term",
            "difficulty_level",
            "session_year",
            # Boolean filters
            "is_practical",
            "requires_computer",
            "is_online",
            # Numeric ranges
            "total_marks_min",
            "total_marks_max",
            "duration_minutes_min",
            "duration_minutes_max",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Add CSS classes to foreign key fields
        for field_name in [
            "subject",
            "grade_level",
            "section",
            "teacher",
            "exam_schedule",
        ]:
            if field_name in self.form.fields:
                self.form.fields[field_name].widget.attrs.update(
                    {"class": "form-control"}
                )

        # Set empty labels for foreign key fields
        if "subject" in self.form.fields:
            self.form.fields["subject"].empty_label = "All Subjects"
        if "grade_level" in self.form.fields:
            self.form.fields["grade_level"].empty_label = "All Grade Levels"
        if "section" in self.form.fields:
            self.form.fields["section"].empty_label = "All Sections"
        if "teacher" in self.form.fields:
            self.form.fields["teacher"].empty_label = "All Teachers"
        if "exam_schedule" in self.form.fields:
            self.form.fields["exam_schedule"].empty_label = "All Schedules"


# Additional specialized filters for specific use cases
class UpcomingExamFilter(ExamFilter):
    """Filter for upcoming exams only"""

    class Meta(ExamFilter.Meta):
        model = Exam
        fields = ExamFilter.Meta.fields

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Pre-filter to show only scheduled and future exams
        self.queryset = self.queryset.filter(
            status__in=["scheduled", "in_progress"],
            exam_date__gte=timezone.now().date(),
        )


class CompletedExamFilter(ExamFilter):
    """Filter for completed exams only"""

    class Meta(ExamFilter.Meta):
        model = Exam
        fields = ExamFilter.Meta.fields

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Pre-filter to show only completed exams
        self.queryset = self.queryset.filter(status="completed")


class TodayExamFilter(ExamFilter):
    """Filter for today's exams"""

    class Meta(ExamFilter.Meta):
        model = Exam
        fields = [
            "subject",
            "grade_level",
            "section",
            "teacher",
            "exam_type",
            "status",
            "venue",
            "start_time",
            "end_time",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from django.utils import timezone

        # Pre-filter to show only today's exams
        self.queryset = self.queryset.filter(exam_date=timezone.now().date())
