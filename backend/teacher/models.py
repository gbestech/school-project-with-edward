from django.db import models
from django.conf import settings
from classroom.models import GradeLevel, Section
from subject.models import Subject


from django.db import models
from django.conf import settings
from django.utils import timezone
from classroom.models import GradeLevel, Section
from subject.models import Subject


class Teacher(models.Model):
    """Teacher profile extending User model"""

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    employee_id = models.CharField(max_length=20, unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    hire_date = models.DateField()
    qualification = models.CharField(max_length=200, blank=True)
    specialization = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"


class TeacherAssignment(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    grade_level = models.ForeignKey(GradeLevel, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("teacher", "grade_level", "section", "subject")

    def __str__(self):
        return f"{self.teacher} - {self.subject} ({self.grade_level}) {self.section}"
