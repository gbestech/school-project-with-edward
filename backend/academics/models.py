from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import date


class AcademicSession(models.Model):
    """Academic year/session model"""

    name = models.CharField(max_length=50, unique=True)  # e.g., "2024/2025"
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "academics_session"
        ordering = ["-start_date"]
        verbose_name = "Academic Session"
        verbose_name_plural = "Academic Sessions"

    def __str__(self):
        return self.name

    def clean(self):
        if self.start_date >= self.end_date:
            raise ValidationError("Start date must be before end date")

        # Ensure only one current session
        if self.is_current:
            current_sessions = AcademicSession.objects.filter(is_current=True)
            if self.pk:
                current_sessions = current_sessions.exclude(pk=self.pk)
            if current_sessions.exists():
                raise ValidationError(
                    "Only one academic session can be current at a time"
                )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def is_ongoing(self):
        """Check if the session is currently ongoing"""
        today = date.today()
        return self.start_date <= today <= self.end_date


class Term(models.Model):
    """Academic term model"""

    TERM_CHOICES = [
        ("FIRST", "First Term"),
        ("SECOND", "Second Term"),
        ("THIRD", "Third Term"),
    ]

    name = models.CharField(max_length=20, choices=TERM_CHOICES)
    academic_session = models.ForeignKey(
        'fee.AcademicSession', on_delete=models.CASCADE, related_name="terms"
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # Additional term settings
    next_term_begins = models.DateField(null=True, blank=True)
    holidays_start = models.DateField(null=True, blank=True)
    holidays_end = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "academics_term"
        unique_together = ["academic_session", "name"]
        ordering = ["academic_session", "name"]
        verbose_name = "Academic Term"
        verbose_name_plural = "Academic Terms"

    def __str__(self):
        return f"{self.get_name_display()} - {self.academic_session.name}"

    def clean(self):
        if self.start_date >= self.end_date:
            raise ValidationError("Start date must be before end date")

        # Validate dates are within academic session
        if self.academic_session:
            if (
                self.start_date < self.academic_session.start_date
                or self.end_date > self.academic_session.end_date
            ):
                raise ValidationError(
                    "Term dates must be within academic session dates"
                )

        # Ensure only one current term per session
        if self.is_current and self.academic_session:
            current_terms = Term.objects.filter(
                academic_session=self.academic_session, is_current=True
            )
            if self.pk:
                current_terms = current_terms.exclude(pk=self.pk)
            if current_terms.exists():
                raise ValidationError(
                    "Only one term can be current per academic session"
                )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def is_ongoing(self):
        """Check if the term is currently ongoing"""
        today = date.today()
        return self.start_date <= today <= self.end_date


class Subject(models.Model):
    """Subject model"""

    SUBJECT_TYPES = [
        ("CORE", "Core Subject"),
        ("ELECTIVE", "Elective Subject"),
        ("PRACTICAL", "Practical Subject"),
        ("LANGUAGE", "Language Subject"),
        ("VOCATIONAL", "Vocational Subject"),
    ]

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    subject_type = models.CharField(
        max_length=20, choices=SUBJECT_TYPES, default="CORE"
    )

    # Subject configuration
    is_compulsory = models.BooleanField(default=True)
    has_practical = models.BooleanField(default=False)
    credit_units = models.PositiveIntegerField(default=1)

    # Level configuration
    education_levels = models.CharField(
        max_length=200,
        help_text="Comma-separated education levels (e.g., 'NURSERY,PRIMARY')",
        blank=True,
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "academics_subject"
        ordering = ["name"]
        verbose_name = "Subject"
        verbose_name_plural = "Subjects"

    def __str__(self):
        return f"{self.name} ({self.code})"

    def save(self, *args, **kwargs):
        # Auto-generate code if not provided
        if not self.code:
            self.code = self.generate_subject_code()

        # Ensure code is uppercase
        self.code = self.code.upper()
        super().save(*args, **kwargs)

    def generate_subject_code(self):
        """Generate a unique subject code based on name"""
        # Take first 3 characters of each word
        words = self.name.split()
        if len(words) == 1:
            base_code = words[0][:4].upper()
        else:
            base_code = "".join(word[:2] for word in words[:3]).upper()

        # Ensure uniqueness
        counter = 1
        code = base_code
        while Subject.objects.filter(code=code).exists():
            code = f"{base_code}{counter}"
            counter += 1

        return code

    @property
    def education_level_list(self):
        """Return list of education levels this subject is available for"""
        if self.education_levels:
            return [level.strip() for level in self.education_levels.split(",")]
        return []


class SubjectAllocation(models.Model):
    """Subject allocation to teachers and classes"""

    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="allocations"
    )
    teacher = models.ForeignKey(
        "teacher.Teacher", on_delete=models.CASCADE, related_name="subject_allocations"
    )
    academic_session = models.ForeignKey(
        'fee.AcademicSession', on_delete=models.CASCADE, related_name="subject_allocations"
    )

    # Class assignment
    education_level = models.CharField(max_length=20)
    student_class = models.CharField(max_length=50)

    # Schedule information
    periods_per_week = models.PositiveIntegerField(default=1)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "academics_subject_allocation"
        unique_together = [
            "subject",
            "teacher",
            "academic_session",
            "education_level",
            "student_class",
        ]
        ordering = ["academic_session", "education_level", "student_class", "subject"]
        verbose_name = "Subject Allocation"
        verbose_name_plural = "Subject Allocations"

    def __str__(self):
        return f"{self.subject.name} - {self.teacher.user.full_name} ({self.student_class})"


class Curriculum(models.Model):
    """Curriculum structure for different education levels"""

    name = models.CharField(max_length=100)
    education_level = models.CharField(max_length=20)
    academic_session = models.ForeignKey(
        'fee.AcademicSession', on_delete=models.CASCADE, related_name="curricula"
    )
    subjects = models.ManyToManyField(
        Subject, through="CurriculumSubject", related_name="curricula"
    )

    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "academics_curriculum"
        unique_together = ["name", "education_level", "academic_session"]
        ordering = ["education_level", "name"]
        verbose_name = "Curriculum"
        verbose_name_plural = "Curricula"

    def __str__(self):
        return f"{self.name} - {self.education_level} ({self.academic_session.name})"


class CurriculumSubject(models.Model):
    """Through model for Curriculum-Subject relationship"""

    curriculum = models.ForeignKey(
        Curriculum, on_delete=models.CASCADE, related_name="curriculum_subjects"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="curriculum_subjects"
    )

    is_compulsory = models.BooleanField(default=True)
    minimum_score = models.DecimalField(max_digits=5, decimal_places=2, default=40.00)
    maximum_score = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    weight_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100.00,
        help_text="Weight in overall computation",
    )

    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "academics_curriculum_subject"
        unique_together = ["curriculum", "subject"]
        ordering = ["curriculum", "order", "subject__name"]

    def __str__(self):
        return f"{self.curriculum.name} - {self.subject.name}"


class AcademicCalendar(models.Model):
    """Academic calendar events"""

    EVENT_TYPES = [
        ("TERM_START", "Term Start"),
        ("TERM_END", "Term End"),
        ("HOLIDAY", "Holiday"),
        ("EXAM", "Examination"),
        ("REGISTRATION", "Student Registration"),
        ("GRADUATION", "Graduation"),
        ("ORIENTATION", "Orientation"),
        ("SPORTS", "Sports Event"),
        ("CULTURAL", "Cultural Event"),
        ("MEETING", "Academic Meeting"),
        ("OTHER", "Other Event"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)

    academic_session = models.ForeignKey(
        'fee.AcademicSession', on_delete=models.CASCADE, related_name="calendar_events"
    )
    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name="calendar_events",
        null=True,
        blank=True,
    )

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)

    location = models.CharField(max_length=200, blank=True)
    is_public = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "academics_calendar"
        ordering = ["start_date", "start_time"]
        verbose_name = "Academic Calendar Event"
        verbose_name_plural = "Academic Calendar Events"

    def __str__(self):
        return f"{self.title} - {self.start_date}"

    def clean(self):
        if self.end_date and self.start_date > self.end_date:
            raise ValidationError("Start date must be before or equal to end date")

        if (
            self.start_time
            and self.end_time
            and self.end_date == self.start_date
            and self.start_time >= self.end_time
        ):
            raise ValidationError(
                "Start time must be before end time for same-day events"
            )
