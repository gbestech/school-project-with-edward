# from django.db import models
# from users.models import CustomUser

# GENDER_CHOICES = (
#     ("M", "Male"),
#     ("F", "Female"),
# )

# # Education level choices to better organize classes
# EDUCATION_LEVEL_CHOICES = (
#     ("NURSERY", "Nursery"),
#     ("PRIMARY", "Primary"),
#     ("SECONDARY", "Secondary"),
# )

# # Predefined class choices that cover all levels
# CLASS_CHOICES = (
#     # Nursery Classes
#     ("NURSERY_1", "Nursery 1"),
#     ("NURSERY_2", "Nursery 2"),
#     ("PRE_K", "Pre-K"),
#     ("KINDERGARTEN", "Kindergarten"),
#     # Primary Classes
#     ("GRADE_1", "Grade 1"),
#     ("GRADE_2", "Grade 2"),
#     ("GRADE_3", "Grade 3"),
#     ("GRADE_4", "Grade 4"),
#     ("GRADE_5", "Grade 5"),
#     ("GRADE_6", "Grade 6"),
#     # Secondary Classes
#     ("GRADE_7", "Grade 7"),
#     ("GRADE_8", "Grade 8"),
#     ("GRADE_9", "Grade 9"),
#     ("GRADE_10", "Grade 10"),
#     ("GRADE_11", "Grade 11"),
#     ("GRADE_12", "Grade 12"),
# )


# class Student(models.Model):

#     user = models.OneToOneField(
#         CustomUser, on_delete=models.CASCADE, related_name="student_profile"
#     )
#     gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
#     date_of_birth = models.DateField()

#     # Enhanced class field with predefined choices
#     student_class = models.CharField(
#         max_length=20,
#         choices=CLASS_CHOICES,
#         help_text="Select the student's current class/grade",
#     )

#     # New field to categorize education level
#     education_level = models.CharField(
#         max_length=10,
#         choices=EDUCATION_LEVEL_CHOICES,
#         help_text="Education level category",
#     )

#     admission_date = models.DateField(auto_now_add=True)

#     # Optional: Add fields that might be useful for nursery students
#     parent_contact = models.CharField(
#         max_length=15,
#         blank=True,
#         null=True,
#         help_text="Primary parent/guardian contact number",
#     )

#     emergency_contact = models.CharField(
#         max_length=15, blank=True, null=True, help_text="Emergency contact number"
#     )

#     # Medical information might be more critical for younger students
#     medical_conditions = models.TextField(
#         blank=True, null=True, help_text="Any medical conditions or allergies"
#     )

#     # Special needs or requirements
#     special_requirements = models.TextField(
#         blank=True, null=True, help_text="Any special educational or care requirements"
#     )

#     # New: Track if student is active (registered/activated)
#     is_active = models.BooleanField(default=True, help_text="Is the student currently active/registered?")  # type: ignore

#     class Meta:
#         ordering = ["education_level", "student_class", "user__first_name"]
#         verbose_name = "Student"
#         verbose_name_plural = "Students"

#     def __str__(self):
#         user = self.user  # type: ignore
#         return f"{user.full_name} - {self.get_student_class_display()}"  # type: ignore

#     @property
#     def full_name(self):
#         """Returns the full name of the student."""
#         return self.user.full_name  # type: ignore

#     @property
#     def short_name(self):
#         """Returns the short name of the student (First Last only)."""
#         return self.user.short_name  # type: ignore

#     @property
#     def age(self):
#         """Calculate and return the student's current age."""
#         from datetime import date

#         today = date.today()
#         return (
#             today.year
#             - self.date_of_birth.year  # type: ignore
#             - (
#                 (today.month, today.day)
#                 < (self.date_of_birth.month, self.date_of_birth.day)  # type: ignore
#             )
#         )  # type: ignore

#     @property
#     def is_nursery_student(self):
#         """Check if student is in nursery level."""
#         return self.education_level == "NURSERY"

#     @property
#     def is_primary_student(self):
#         """Check if student is in primary level."""
#         return self.education_level == "PRIMARY"

#     @property
#     def is_secondary_student(self):
#         """Check if student is in secondary level."""
#         return self.education_level == "SECONDARY"

#     def save(self, *args, **kwargs):
#         """Override save to automatically set education_level based on student_class."""
#         if not self.education_level:
#             if self.student_class in [
#                 "NURSERY_1",
#                 "NURSERY_2",
#                 "PRE_K",
#                 "KINDERGARTEN",
#             ]:
#                 self.education_level = "NURSERY"
#             elif self.student_class in [
#                 "GRADE_1",
#                 "GRADE_2",
#                 "GRADE_3",
#                 "GRADE_4",
#                 "GRADE_5",
#                 "GRADE_6",
#             ]:
#                 self.education_level = "PRIMARY"
#             elif self.student_class in [
#                 "GRADE_7",
#                 "GRADE_8",
#                 "GRADE_9",
#                 "GRADE_10",
#                 "GRADE_11",
#                 "GRADE_12",
#             ]:
#                 self.education_level = "SECONDARY"
#         self.is_managed_by_parent = self.education_level in ["NURSERY", "PRIMARY"]
#         super().save(*args, **kwargs)


# models.py - Add profile_picture field to your Student model

from django.db import models
from users.models import CustomUser

GENDER_CHOICES = (
    ("M", "Male"),
    ("F", "Female"),
)

EDUCATION_LEVEL_CHOICES = (
    ("NURSERY", "Nursery"),
    ("PRIMARY", "Primary"),
    ("JUNIOR_SECONDARY", "Junior Secondary"),
    ("SENIOR_SECONDARY", "Senior Secondary"),
)

CLASS_CHOICES = (
    # Nursery Classes
    ("PRE_NURSERY", "Pre-nursery"),
    ("NURSERY_1", "Nursery 1"),
    ("NURSERY_2", "Nursery 2"),
    # Primary Classes
    ("PRIMARY_1", "Primary 1"),
    ("PRIMARY_2", "Primary 2"),
    ("PRIMARY_3", "Primary 3"),
    ("PRIMARY_4", "Primary 4"),
    ("PRIMARY_5", "Primary 5"),
    ("PRIMARY_6", "Primary 6"),
    # Junior Secondary Classes
    ("JSS_1", "Junior Secondary 1 (JSS1)"),
    ("JSS_2", "Junior Secondary 2 (JSS2)"),
    ("JSS_3", "Junior Secondary 3 (JSS3)"),
    # Senior Secondary Classes
    ("SS_1", "Senior Secondary 1 (SS1)"),
    ("SS_2", "Senior Secondary 2 (SS2)"),
    ("SS_3", "Senior Secondary 3 (SS3)"),
)


class Student(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="student_profile"
    )
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()

    # Enhanced class field with predefined choices
    student_class = models.CharField(
        max_length=20,
        choices=CLASS_CHOICES,
        help_text="Select the student's current class/grade",
    )

    # New field to categorize education level
    education_level = models.CharField(
        max_length=20,
        choices=EDUCATION_LEVEL_CHOICES,
        help_text="Education level category",
    )

    admission_date = models.DateField(auto_now_add=True)
    
    # Registration number field
    registration_number = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
        help_text="Student's unique registration number",
    )

    # ADD THIS: Profile picture field for students
    profile_picture = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Student profile picture (Cloudinary URL)",
    )

    # New: Classroom assignment (e.g., 'Primary 1 A', 'SS3 B')
    classroom = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Specific classroom assignment (e.g., 'Primary 1 A', 'SS3 B')",
    )
    
    # Stream assignment for Senior Secondary students
    stream = models.ForeignKey(
        "classroom.Stream",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students",
        help_text="Stream assignment for Senior Secondary students",
    )

    # Optional: Add fields that might be useful for nursery students
    parent_contact = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Primary parent/guardian contact number",
    )

    emergency_contact = models.CharField(
        max_length=20, blank=True, null=True, help_text="Emergency contact number"
    )

    # Medical information might be more critical for younger students
    medical_conditions = models.TextField(
        blank=True, null=True, help_text="Any medical conditions or allergies"
    )

    # Special needs or requirements
    special_requirements = models.TextField(
        blank=True, null=True, help_text="Any special educational or care requirements"
    )

    # New: Track if student is active (registered/activated)
    is_active = models.BooleanField(
        default=True, help_text="Is the student currently active/registered?"
    )

    class Meta:
        ordering = ["education_level", "student_class", "user__first_name"]
        verbose_name = "Student"
        verbose_name_plural = "Students"

    def __str__(self):
        user = self.user
        classroom_str = f" ({self.classroom})" if self.classroom else ""
        return f"{user.full_name} - {self.get_student_class_display()}{classroom_str}"

    @property
    def full_name(self):
        """Returns the full name of the student."""
        return self.user.full_name

    @property
    def short_name(self):
        """Returns the short name of the student (First Last only)."""
        return self.user.short_name

    @property
    def age(self):
        """Calculate and return the student's current age."""
        from datetime import date

        today = date.today()
        return (
            today.year
            - self.date_of_birth.year
            - (
                (today.month, today.day)
                < (self.date_of_birth.month, self.date_of_birth.day)
            )
        )

    @property
    def is_nursery_student(self):
        """Check if student is in nursery level."""
        return self.education_level == "NURSERY"

    @property
    def is_primary_student(self):
        """Check if student is in primary level."""
        return self.education_level == "PRIMARY"

    @property
    def is_secondary_student(self):
        """Check if student is in secondary level."""
        return self.education_level in ["JUNIOR_SECONDARY", "SENIOR_SECONDARY"]
    
    @property
    def is_junior_secondary_student(self):
        """Check if student is in junior secondary level."""
        return self.education_level == "JUNIOR_SECONDARY"
    
    @property
    def is_senior_secondary_student(self):
        """Check if student is in senior secondary level."""
        return self.education_level == "SENIOR_SECONDARY"

    def save(self, *args, **kwargs):
        """Override save to automatically set education_level based on student_class."""
        if not self.education_level:
            if self.student_class in [
                "PRE_NURSERY",
                "NURSERY_1",
                "NURSERY_2",
            ]:
                self.education_level = "NURSERY"
            elif self.student_class in [
                "PRIMARY_1",
                "PRIMARY_2",
                "PRIMARY_3",
                "PRIMARY_4",
                "PRIMARY_5",
                "PRIMARY_6",
            ]:
                self.education_level = "PRIMARY"
            elif self.student_class in [
                "JSS_1",
                "JSS_2",
                "JSS_3",
            ]:
                self.education_level = "JUNIOR_SECONDARY"
            elif self.student_class in [
                "SS_1",
                "SS_2",
                "SS_3",
            ]:
                self.education_level = "SENIOR_SECONDARY"
        super().save(*args, **kwargs)
