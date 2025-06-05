from django.db import models
from django.conf import settings
from classroom.models import GradeLevel, Section
from subject.models import Subject


class Teacher(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.user.email})"


class TeacherAssignment(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    grade_level = models.ForeignKey(GradeLevel, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE
    )  # You can reference directly since you already imported

    class Meta:
        unique_together = ("teacher", "grade_level", "section", "subject")

    def __str__(self):
        return f"{self.teacher} - {self.subject} ({self.grade_level}) {self.section}"
