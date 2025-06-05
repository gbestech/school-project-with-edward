from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Exam
from .serializers import ExamSerializer
from .filters import ExamFilter

from io import TextIOWrapper
import csv
from classroom.models import GradeLevel, Section
from subject.models import Subject
from teacher.models import Teacher


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ExamFilter
    search_fields = ["title"]
    ordering_fields = ["exam_date", "start_time", "end_time"]

    @action(detail=False, methods=["post"], url_path="import-csv")
    def import_csv(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"error": "No CSV file uploaded."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            decoded_file = TextIOWrapper(file.file, encoding="utf-8")
            reader = csv.DictReader(decoded_file)
            for row in reader:
                subject = Subject.objects.get(id=row["subject"])
                grade_level = GradeLevel.objects.get(id=row["grade_level"])
                section = Section.objects.get(id=row["section"])
                teacher = (
                    Teacher.objects.get(id=row["teacher"]) if row["teacher"] else None
                )

                Exam.objects.create(
                    title=row["title"],
                    subject=subject,
                    grade_level=grade_level,
                    section=section,
                    teacher=teacher,
                    exam_date=row["exam_date"],
                    start_time=row["start_time"],
                    end_time=row["end_time"],
                    description=row.get("description", ""),
                )
            return Response(
                {"message": "CSV import successful."}, status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], url_path="export-csv")
    def export_csv(self, request):
        response = Response(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="exams.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                "title",
                "subject",
                "grade_level",
                "section",
                "teacher",
                "exam_date",
                "start_time",
                "end_time",
                "description",
            ]
        )

        for exam in self.filter_queryset(self.get_queryset()):
            writer.writerow(
                [
                    exam.title,
                    exam.subject.id,
                    exam.grade_level.id,
                    exam.section.id,
                    exam.teacher.id if exam.teacher else "",
                    exam.exam_date,
                    exam.start_time,
                    exam.end_time,
                    exam.description,
                ]
            )

        return response
