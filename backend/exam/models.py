from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime

from academics.models import AcademicSession, Term
from subject.models import Subject
from classroom.models import GradeLevel, Section
from teacher.models import Teacher
from students.models import Student


# Simplified exam type choices (remove academic types)
EXAM_TYPE_CHOICES = [
    ("quiz", "Quiz"),
    ("test", "Class Test"),
    ("mid_term", "Mid-Term Examination"),
    ("final_exam", "Final Examination"),
    ("practical", "Practical Examination"),
    ("oral_exam", "Oral Examination"),
]

EXAM_STATUS_CHOICES = [
    ("draft", "Draft"),
    ("pending_approval", "Pending Approval"),
    ("approved", "Approved"),
    ("scheduled", "Scheduled"),
    ("in_progress", "In Progress"),
    ("completed", "Completed"),
    ("cancelled", "Cancelled"),
    ("postponed", "Postponed"),
    ("rejected", "Rejected"),
]

DIFFICULTY_CHOICES = [
    ("easy", "Easy"),
    ("medium", "Medium"),
    ("hard", "Hard"),
    ("mixed", "Mixed"),
]


def get_default_exam_schedule_id():
    """
    Get default exam schedule ID with proper fallback logic
    """
    # Try to get marked default
    default_schedule = ExamSchedule.objects.filter(is_default=True).first()
    if default_schedule:
        return default_schedule.id

    # Try to get active schedule
    active_schedule = ExamSchedule.objects.filter(is_active=True).first()
    if active_schedule:
        return active_schedule.id

    # Try to get current schedule based on dates
    current_date = timezone.now().date()
    current_schedule = ExamSchedule.objects.filter(
        start_date__lte=current_date, end_date__gte=current_date
    ).first()
    if current_schedule:
        return current_schedule.id

    # Fallback to any available schedule
    any_schedule = ExamSchedule.objects.first()
    if any_schedule:
        return any_schedule.id

    # If no schedules exist, return None
    return None


class ExamSchedule(models.Model):
    """Exam schedule tied to academic structure"""

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)

    # Use academic app models
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    term = models.ForeignKey(Term, on_delete=models.CASCADE)

    # Schedule dates
    start_date = models.DateField()
    end_date = models.DateField()

    # Registration periods
    registration_start = models.DateTimeField(null=True, blank=True)
    registration_end = models.DateTimeField(null=True, blank=True)
    results_publication_date = models.DateField(null=True, blank=True)

    # Settings
    is_active = models.BooleanField(default=True)
    allow_late_registration = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_default = models.BooleanField(
        default=False, help_text="Mark this as the default exam schedule for new exams"
    )

    class Meta:
        db_table = "exams_schedule"
        ordering = ["-start_date"]
        unique_together = ["academic_session", "term", "name"]

    def __str__(self):
        default_text = " (Default)" if self.is_default else ""
        return f"{self.name} - {self.term} ({self.academic_session}){default_text}"

    def save(self, *args, **kwargs):
        # Ensure only one default schedule exists
        if self.is_default:
            ExamSchedule.objects.filter(is_default=True).exclude(pk=self.pk).update(
                is_default=False
            )
        super().save(*args, **kwargs)

    @classmethod
    def get_default(cls):
        """Get the default exam schedule"""
        return cls.objects.filter(is_default=True).first()

    @classmethod
    def get_current_active(cls):
        """Get currently active exam schedule"""
        current_date = timezone.now().date()
        return cls.objects.filter(
            is_active=True, start_date__lte=current_date, end_date__gte=current_date
        ).first()

    @property
    def session_year(self):
        """Property to get session year for admin display"""
        return self.academic_session.name if self.academic_session else None

    @property
    def is_registration_open(self):
        """Check if registration is currently open"""
        now = timezone.now()
        if not self.registration_start or not self.registration_end:
            return False
        return self.registration_start <= now <= self.registration_end

    @property
    def is_current(self):
        """Check if this schedule is currently active based on dates"""
        current_date = timezone.now().date()
        return self.start_date <= current_date <= self.end_date

    def clean(self):
        # Validate dates are within term dates
        if self.term:
            if (
                self.start_date < self.term.start_date
                or self.end_date > self.term.end_date
            ):
                raise ValidationError("Exam dates must be within term dates")

        # Validate start_date is before end_date
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError("Start date must be before end date")

        # Validate registration dates
        if self.registration_start and self.registration_end:
            if self.registration_start > self.registration_end:
                raise ValidationError(
                    "Registration start must be before registration end"
                )


# 2. Update your Exam model with default
class Exam(models.Model):
    """Streamlined exam model focused on logistics"""

    # Basic info
    title = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True, blank=True)
    description = models.TextField(blank=True)

    # Academic relationships (use academic app)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    grade_level = models.ForeignKey(GradeLevel, on_delete=models.CASCADE)
    section = models.ForeignKey(
        Section, on_delete=models.SET_NULL, null=True, blank=True
    )
    # Stream support for Senior Secondary
    stream = models.ForeignKey(
        "classroom.Stream",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="exams",
        help_text="Stream for Senior Secondary exams (Science, Arts, Commercial, Technical)",
    )
    exam_schedule = models.ForeignKey(
        ExamSchedule,
        on_delete=models.CASCADE,
        related_name="exams",
        null=True,
        blank=True,
        help_text="Exam schedule this exam belongs to",
    )

    # Staff assignment
    teacher = models.ForeignKey(
        Teacher, on_delete=models.SET_NULL, null=True, blank=True
    )
    invigilators = models.ManyToManyField(
        Teacher, blank=True, related_name="invigilated_exams"
    )

    # Exam configuration
    exam_type = models.CharField(
        max_length=25, choices=EXAM_TYPE_CHOICES, default="final_exam"
    )
    difficulty_level = models.CharField(
        max_length=10, choices=DIFFICULTY_CHOICES, default="medium"
    )

    # Scheduling
    exam_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)

    # Exam settings
    total_marks = models.PositiveIntegerField(
        default=100, validators=[MinValueValidator(1)]
    )
    pass_marks = models.PositiveIntegerField(null=True, blank=True)

    # Venue and logistics
    venue = models.CharField(max_length=100, blank=True)
    max_students = models.PositiveIntegerField(null=True, blank=True)

    # Instructions
    instructions = models.TextField(blank=True)
    materials_allowed = models.TextField(blank=True)
    materials_provided = models.TextField(blank=True)

    # Question data (stored as JSON)
    objective_questions = models.JSONField(default=list, blank=True)
    theory_questions = models.JSONField(default=list, blank=True)
    practical_questions = models.JSONField(default=list, blank=True)
    custom_sections = models.JSONField(default=list, blank=True)
    objective_instructions = models.TextField(blank=True)
    theory_instructions = models.TextField(blank=True)
    practical_instructions = models.TextField(blank=True)

    # File uploads (optional)
    questions_file = models.FileField(
        upload_to="exam_questions/", blank=True, null=True
    )
    answer_key = models.FileField(upload_to="exam_answers/", blank=True, null=True)

    # Status and flags
    status = models.CharField(
        max_length=20, choices=EXAM_STATUS_CHOICES, default="draft"
    )
    is_practical = models.BooleanField(default=False)
    requires_computer = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)

    # Approval workflow
    approved_by = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_exams",
        help_text="Admin/Teacher who approved this exam",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    approval_notes = models.TextField(blank=True, help_text="Notes from the approver")
    rejection_reason = models.TextField(
        blank=True, help_text="Reason for rejection if applicable"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "exams_exam"
        ordering = ["exam_date", "start_time"]
        # Note: unique_together removed since section can be null
        # This allows multiple exams for the same subject/grade_level/exam_type/schedule
        # even if they have different sections or no section

    def __str__(self):
        return f"{self.title} - {self.subject.name} ({self.exam_schedule.name if self.exam_schedule else 'No Schedule'})"

    def approve(self, approver, notes=""):
        """Approve the exam"""
        from django.utils import timezone

        self.status = "approved"
        self.approved_by = approver
        self.approved_at = timezone.now()
        self.approval_notes = notes
        self.rejection_reason = ""  # Clear any previous rejection reason
        self.save()

    def reject(self, approver, reason=""):
        """Reject the exam"""
        from django.utils import timezone

        self.status = "rejected"
        self.approved_by = approver
        self.approved_at = timezone.now()
        self.rejection_reason = reason
        self.approval_notes = ""  # Clear any previous approval notes
        self.save()

    def submit_for_approval(self):
        """Submit exam for approval"""
        self.status = "pending_approval"
        self.save()

    @property
    def is_pending_approval(self):
        """Check if exam is pending approval"""
        return self.status == "pending_approval"

    @property
    def is_approved(self):
        """Check if exam is approved"""
        return self.status == "approved"

    @property
    def is_rejected(self):
        """Check if exam is rejected"""
        return self.status == "rejected"

    @property
    def duration(self):
        """Property to display duration in admin"""
        if self.duration_minutes:
            hours = self.duration_minutes // 60
            minutes = self.duration_minutes % 60
            if hours > 0:
                return f"{hours}h {minutes}m"
            return f"{minutes}m"
        return "Not set"

    @property
    def academic_session(self):
        """Get academic session from exam schedule"""
        return self.exam_schedule.academic_session

    @property
    def term(self):
        """Get term from exam schedule"""
        return self.exam_schedule.term

    @property
    def session_year(self):
        """Get session year from exam schedule"""
        return self.exam_schedule.session_year

    def save(self, *args, **kwargs):
        # Auto-generate code
        if not self.code:
            self.code = self.generate_exam_code()

        # Calculate duration
        if not self.duration_minutes and self.start_time and self.end_time:
            start_datetime = datetime.combine(self.exam_date, self.start_time)
            end_datetime = datetime.combine(self.exam_date, self.end_time)
            duration = end_datetime - start_datetime
            self.duration_minutes = int(duration.total_seconds() / 60)

        super().save(*args, **kwargs)

    def generate_exam_code(self):
        """Generate unique exam code"""
        base_code = f"{self.subject.code}-{self.exam_date.strftime('%Y%m%d')}"
        counter = 1
        code = f"{base_code}-{counter:02d}"

        while Exam.objects.filter(code=code).exists():
            counter += 1
            code = f"{base_code}-{counter:02d}"

        return code

    def clean(self):
        # Validate exam schedule exists
        if not self.exam_schedule_id:
            raise ValidationError(
                "No exam schedule available. Please create an exam schedule first."
            )

        # Validate exam date is within schedule dates
        if self.exam_schedule:
            if (
                self.exam_date < self.exam_schedule.start_date
                or self.exam_date > self.exam_schedule.end_date
            ):
                raise ValidationError("Exam date must be within schedule period")

        # Validate start_time is before end_time
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError("Start time must be before end time")

        # Validate pass_marks is not greater than total_marks
        if self.pass_marks and self.total_marks and self.pass_marks > self.total_marks:
            raise ValidationError("Pass marks cannot be greater than total marks")


class ExamRegistration(models.Model):
    """Student exam registration with special needs"""

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    # Registration status
    registration_date = models.DateTimeField(auto_now_add=True)
    is_registered = models.BooleanField(default=True)
    is_present = models.BooleanField(default=False)

    # Special accommodations
    has_special_needs = models.BooleanField(default=False)
    special_needs_description = models.TextField(blank=True)
    extra_time_minutes = models.PositiveIntegerField(default=0)

    # Logistics
    seat_number = models.CharField(max_length=10, blank=True)

    class Meta:
        db_table = "exams_registration"
        unique_together = ("exam", "student")
        # Fix: Remove the problematic ordering for now, or use correct field path
        # ordering = ["exam__exam_date", "student__first_name"]  # This was causing the error
        # ordering = ["exam__exam_date", "registration_date"]  # Use available fields
        ordering = ["id"]

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.exam.title}"


class ExamStatistics(models.Model):
    """Pre-calculated exam statistics for performance"""

    exam = models.OneToOneField(
        Exam, on_delete=models.CASCADE, related_name="statistics"
    )

    # Participation
    total_registered = models.PositiveIntegerField(default=0)
    total_appeared = models.PositiveIntegerField(default=0)
    total_absent = models.PositiveIntegerField(default=0)

    # Performance
    highest_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    lowest_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    average_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    median_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    # Grade distribution
    grade_a_count = models.PositiveIntegerField(default=0)
    grade_b_count = models.PositiveIntegerField(default=0)
    grade_c_count = models.PositiveIntegerField(default=0)
    grade_d_count = models.PositiveIntegerField(default=0)
    grade_e_count = models.PositiveIntegerField(default=0)
    grade_f_count = models.PositiveIntegerField(default=0)

    # Pass/Fail
    total_passed = models.PositiveIntegerField(default=0)
    total_failed = models.PositiveIntegerField(default=0)
    pass_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "exams_statistics"

    def __str__(self):
        return f"Statistics for {self.exam.title}"

    def calculate_statistics(self):
        """Method to recalculate statistics"""
        from result.models import StudentResult

        # Get all results for this exam
        results = StudentResult.objects.filter(exam=self.exam)

        if results.exists():
            scores = results.values_list("score", flat=True)
            self.total_appeared = results.count()
            self.highest_score = max(scores) if scores else 0
            self.lowest_score = min(scores) if scores else 0
            self.average_score = sum(scores) / len(scores) if scores else 0

            # Calculate pass/fail
            self.total_passed = results.filter(is_pass=True).count()
            self.total_failed = results.filter(is_pass=False).count()
            self.pass_percentage = (
                (self.total_passed / self.total_appeared) * 100
                if self.total_appeared > 0
                else 0
            )

            # Grade distribution
            self.grade_a_count = results.filter(grade="A").count()
            self.grade_b_count = results.filter(grade="B").count()
            self.grade_c_count = results.filter(grade="C").count()
            self.grade_d_count = results.filter(grade="D").count()
            self.grade_e_count = results.filter(grade="E").count()
            self.grade_f_count = results.filter(grade="F").count()

        # Registration statistics
        registrations = ExamRegistration.objects.filter(exam=self.exam)
        self.total_registered = registrations.count()
        self.total_absent = registrations.filter(is_present=False).count()

        self.save()
