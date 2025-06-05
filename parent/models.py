from django.db import models
from users.models import CustomUser
from students.models import Student


class ParentProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="parent_profile",
        limit_choices_to={"role": "parent"},
    )
    children = models.ManyToManyField(
        Student, related_name="parents", help_text="Students linked to this parent"
    )

    def __str__(self):
        return self.user.full_name
