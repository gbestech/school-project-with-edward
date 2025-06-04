from django.db import models
from users.models import CustomUser

# Create your models here.
GENDER_CHOICES = (
    ("M", "Male"),
    ("F", "Female"),
)


class Student(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="student_profile"
    )
    # first_name = models.CharField(max_length=100)
    # last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    student_class = models.CharField(max_length=20)
    admission_date = models.DateField(auto_now_add=True)


def __str__(self):
    return f"{self.first_name} {self.last_name}"
