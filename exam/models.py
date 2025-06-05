from django.db import models
from classroom.models import GradeLevel, Section

from subject.models import Subject
from teacher.models import Teacher
from students.models import Student  # ✅ Missing import


class Exam(models.Model):
    title = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    grade_level = models.ForeignKey(GradeLevel, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    teacher = models.ForeignKey(
        Teacher, on_delete=models.SET_NULL, null=True, blank=True
    )
    exam_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} - {self.subject.name} - {self.grade_level.name} - {self.section.name}"


TERM_CHOICES = [
    ("term1", "Term 1"),
    ("term2", "Term 2"),
    ("term3", "Term 3"),
]


class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    term = models.CharField(max_length=10, choices=TERM_CHOICES)
    session_year = models.CharField(max_length=9)  # Format: "2024/2025"
    date_recorded = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = (
            "student",
            "exam",
            "subject",
            "term",
            "session_year",
        )  # ✅ Prevent duplicates

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} - {self.term} - {self.score}"
