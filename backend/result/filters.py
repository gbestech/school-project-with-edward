# results/filters.py
import django_filters
from .models import StudentTermResult

class StudentTermResultFilter(django_filters.FilterSet):
    student = django_filters.NumberFilter(field_name="student_id")
    academic_session = django_filters.NumberFilter(
        field_name="academic_session_id"
    )
    term = django_filters.NumberFilter(field_name="term")  # ✅ FIX HERE
    status = django_filters.CharFilter()

    class Meta:
        model = StudentTermResult
        fields = ["student", "academic_session", "term", "status"]
