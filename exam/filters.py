import django_filters
from .models import Exam


class ExamFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name="exam_date", lookup_expr="gte")
    end_date = django_filters.DateFilter(field_name="exam_date", lookup_expr="lte")

    class Meta:
        model = Exam
        fields = [
            "subject",
            "grade_level",
            "section",
            "teacher",
            "start_date",
            "end_date",
        ]
