import django_filters
from .models import Attendance
from classroom.models import Stream


class AttendanceFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(
        field_name="date", lookup_expr="gte"
    )
    end_date = django_filters.DateFilter(
        field_name="date", lookup_expr="lte"
    )
    date = django_filters.DateFilter(field_name="date")
    stream = django_filters.ModelChoiceFilter(
        field_name="student__stream",
        queryset=Stream.objects.all(),
        label="Stream"
    )
    education_level = django_filters.ChoiceFilter(
        field_name="student__education_level",
        choices=[
            ('NURSERY', 'Nursery'),
            ('PRIMARY', 'Primary'),
            ('JUNIOR_SECONDARY', 'Junior Secondary'),
            ('SENIOR_SECONDARY', 'Senior Secondary'),
            ('SECONDARY', 'Secondary (Legacy)'),
        ],
        label="Education Level"
    )

    class Meta:
        model = Attendance
        fields = ["start_date", "end_date", "date", "student", "teacher", "section", "status", "stream", "education_level"]
