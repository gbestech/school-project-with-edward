import django_filters
from .models import Attendance


class AttendanceFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(
        field_name="attendance_date", lookup_expr="gte"
    )
    end_date = django_filters.DateFilter(
        field_name="attendance_date", lookup_expr="lte"
    )

    class Meta:
        model = Attendance
        fields = ["start_date", "end_date", "student", "teacher", "section", "status"]
