from django.db import models


# Create your models here.
class GradeLevel(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Section(models.Model):
    name = models.CharField(max_length=50)
    grade_level = models.ForeignKey(
        GradeLevel, on_delete=models.CASCADE, related_name="sections"
    )

    def __str__(self):
        return f"{self.grade_level.name} - Section {self.name}"
