from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class GradeLevel(models.Model):
    """Educational grade levels (Nursery, Primary, Secondary)"""

    EDUCATION_LEVELS = [
        ("NURSERY", "Nursery"),
        ("PRIMARY", "Primary"),
        ("JUNIOR_SECONDARY", "Junior Secondary"),
        ("SENIOR_SECONDARY", "Senior Secondary"),
    ]

    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    education_level = models.CharField(max_length=20, choices=EDUCATION_LEVELS)
    order = models.PositiveIntegerField(
        help_text="Order of grade level (e.g., 1 for Grade 1)"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["education_level", "order"]
        unique_together = ["education_level", "order"]

    def __str__(self):
        return self.name


class Section(models.Model):
    """Class sections within a grade level"""

    name = models.CharField(max_length=50)
    grade_level = models.ForeignKey(
        GradeLevel, on_delete=models.CASCADE, related_name="sections"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["grade_level", "name"]
        ordering = ["grade_level", "name"]

    def __str__(self):
        return f"{self.grade_level.name} - Section {self.name}"


class AcademicYear(models.Model):
    """Academic year management"""

    name = models.CharField(max_length=50, unique=True)  # e.g., "2024-2025"
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure only one academic year is current
        if self.is_current:
            AcademicYear.objects.filter(is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class Term(models.Model):
    """Academic terms/quarters within an academic year"""

    TERM_CHOICES = [
        ("FIRST", "First Term"),
        ("SECOND", "Second Term"),
        ("THIRD", "Third Term"),
    ]

    name = models.CharField(max_length=20, choices=TERM_CHOICES)
    academic_year = models.ForeignKey(
        AcademicYear, on_delete=models.CASCADE, related_name="terms"
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["academic_year", "name"]
        ordering = ["academic_year", "name"]

    def __str__(self):
        return f"{self.academic_year.name} - {self.get_name_display()}"


class Student(models.Model):
    """Student profile"""

    GENDER_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
    ]

    admission_number = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    address = models.TextField()
    phone_number = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)

    # Guardian information
    guardian_name = models.CharField(max_length=100)
    guardian_phone = models.CharField(max_length=15)
    guardian_email = models.EmailField(blank=True)
    guardian_relationship = models.CharField(max_length=50)

    admission_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["first_name", "last_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.admission_number})"

    @property
    def full_name(self):
        middle = f" {self.middle_name}" if self.middle_name else ""
        return f"{self.first_name}{middle} {self.last_name}"

    @property
    def age(self):
        today = timezone.now().date()
        return (
            today.year
            - self.date_of_birth.year
            - (
                (today.month, today.day)
                < (self.date_of_birth.month, self.date_of_birth.day)
            )
        )


class Subject(models.Model):
    """Subjects taught in school"""

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    grade_levels = models.ManyToManyField(GradeLevel, related_name="classroom_subjects")
    is_core = models.BooleanField(
        default=False, help_text="Core subject for all students"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class Classroom(models.Model):
    """Main classroom model linking all components"""

    name = models.CharField(max_length=100)
    section = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name="classrooms"
    )
    academic_year = models.ForeignKey(
        AcademicYear, on_delete=models.CASCADE, related_name="classrooms"
    )
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name="classrooms")

    # Teacher assignments - Now using teacher.Teacher model
    class_teacher = models.ForeignKey(
        "teacher.Teacher",  # Reference to teacher app's Teacher model
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="primary_classes",
        help_text="Main class teacher",
    )
    subject_teachers = models.ManyToManyField(
        "teacher.Teacher",  # Reference to teacher app's Teacher model
        through="ClassroomTeacherAssignment",
        related_name="assigned_classes",
    )

    # Students
    students = models.ManyToManyField(
        Student, through="StudentEnrollment", related_name="enrolled_classes"
    )

    # Classroom details
    room_number = models.CharField(max_length=20, blank=True)
    max_capacity = models.PositiveIntegerField(
        default=30, validators=[MinValueValidator(1), MaxValueValidator(100)]
    )

    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["section", "academic_year", "term"]
        ordering = ["section__grade_level", "section__name", "academic_year"]

    def __str__(self):
        return f"{self.section} - {self.academic_year.name} ({self.term.get_name_display()})"

    @property
    def current_enrollment(self):
        return self.students.filter(
            studentenrollment__is_active=True, is_active=True
        ).count()

    @property
    def is_full(self):
        return self.current_enrollment >= self.max_capacity

    @property
    def available_spots(self):
        return max(0, self.max_capacity - self.current_enrollment)


class ClassroomTeacherAssignment(models.Model):
    """Teacher assignment to classroom for specific subjects"""

    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    teacher = models.ForeignKey(
        "teacher.Teacher", on_delete=models.CASCADE
    )  # Reference to teacher app's Teacher model
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    assigned_date = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["classroom", "subject"]
        ordering = ["classroom", "subject"]

    def __str__(self):
        return f"{self.teacher} - {self.subject} ({self.classroom})"


class StudentEnrollment(models.Model):
    """Student enrollment in classroom"""

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    enrollment_date = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["student", "classroom"]
        ordering = ["classroom", "student__first_name"]

    def __str__(self):
        return f"{self.student} enrolled in {self.classroom}"


class ClassSchedule(models.Model):
    """Class schedule/timetable"""

    DAYS_OF_WEEK = [
        ("MONDAY", "Monday"),
        ("TUESDAY", "Tuesday"),
        ("WEDNESDAY", "Wednesday"),
        ("THURSDAY", "Thursday"),
        ("FRIDAY", "Friday"),
        ("SATURDAY", "Saturday"),
    ]

    classroom = models.ForeignKey(
        Classroom, on_delete=models.CASCADE, related_name="schedules"
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(
        "teacher.Teacher", on_delete=models.CASCADE
    )  # Reference to teacher app's Teacher model
    day_of_week = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["classroom", "day_of_week", "start_time"]
        ordering = ["classroom", "day_of_week", "start_time"]

    def __str__(self):
        return f"{self.classroom} - {self.subject} ({self.get_day_of_week_display()} {self.start_time})"

    @property
    def duration(self):
        """Calculate class duration in minutes"""
        from datetime import datetime, timedelta

        start = datetime.combine(datetime.today(), self.start_time)
        end = datetime.combine(datetime.today(), self.end_time)
        return int((end - start).total_seconds() / 60)
