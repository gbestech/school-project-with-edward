# results/models.py
import logging
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from subject.models import Subject
from academics.models import AcademicSession
from django.utils import timezone
from decimal import Decimal
import uuid

from students.models import Student, CLASS_CHOICES, EDUCATION_LEVEL_CHOICES
from classroom.models import Stream

# Initialize logger
logger = logging.getLogger(__name__)


class GradingSystem(models.Model):
    """Grading system configuration"""

    GRADING_TYPES = [
        ("PERCENTAGE", "Percentage (0-100)"),
        ("POINTS", "Points (0-4.0, 0-5.0, etc.)"),
        ("LETTER", "Letter Grades (A, B, C, etc.)"),
        ("PASS_FAIL", "Pass/Fail"),
    ]

    name = models.CharField(max_length=100, unique=True)
    grading_type = models.CharField(max_length=20, choices=GRADING_TYPES)
    description = models.TextField(blank=True)
    min_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    max_score = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    pass_mark = models.DecimalField(max_digits=5, decimal_places=2, default=40)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_grading_system"
        verbose_name = "Grading System"
        verbose_name_plural = "Grading Systems"

    def __str__(self):
        return f"{self.name} ({self.get_grading_type_display()})"


class Grade(models.Model):
    """Individual grade definitions within a grading system"""

    grading_system = models.ForeignKey(
        GradingSystem, on_delete=models.CASCADE, related_name="grades"
    )
    grade = models.CharField(max_length=5)
    min_score = models.DecimalField(max_digits=5, decimal_places=2)
    max_score = models.DecimalField(max_digits=5, decimal_places=2)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    description = models.CharField(max_length=100, blank=True)
    is_passing = models.BooleanField(default=True)

    class Meta:
        db_table = "results_grade"
        unique_together = ["grading_system", "grade"]
        ordering = ["-min_score"]

    def __str__(self):
        return f"{self.grade} ({self.min_score}-{self.max_score})"

    def clean(self):
        if self.min_score >= self.max_score:
            raise ValidationError("Minimum score must be less than maximum score")


class ScoringConfiguration(models.Model):
    """Configuration for scoring systems across different education levels"""

    EDUCATION_LEVEL_CHOICES = [
        ("NURSERY", "Nursery"),
        ("PRIMARY", "Primary"),
        ("JUNIOR_SECONDARY", "Junior Secondary"),
        ("SENIOR_SECONDARY", "Senior Secondary"),
    ]

    RESULT_TYPE_CHOICES = [
        ("TERMLY", "Termly Result"),
        ("SESSION", "Session Result"),
    ]

    id = models.AutoField(primary_key=True)
    education_level = models.CharField(
        max_length=20, choices=EDUCATION_LEVEL_CHOICES, verbose_name="Education Level"
    )
    result_type = models.CharField(
        max_length=20, choices=RESULT_TYPE_CHOICES, verbose_name="Result Type"
    )
    name = models.CharField(max_length=100, verbose_name="Configuration Name")
    description = models.TextField(blank=True, verbose_name="Description")

    # Test/Assessment configurations
    test1_max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10,
        validators=[MinValueValidator(0)],
        verbose_name="Test 1 Max Score",
    )
    test2_max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10,
        validators=[MinValueValidator(0)],
        verbose_name="Test 2 Max Score",
    )
    test3_max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10,
        validators=[MinValueValidator(0)],
        verbose_name="Test 3 Max Score",
    )

    # CA components for Junior Secondary and Primary
    continuous_assessment_max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=15,
        validators=[MinValueValidator(0)],
        verbose_name="Continuous Assessment Max Score",
    )
    take_home_test_max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5,
        validators=[MinValueValidator(0)],
        verbose_name="Take Home Test Max Score",
    )
    appearance_max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5,
        validators=[MinValueValidator(0)],
        verbose_name="Appearance Max Score",
    )
    practical_max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5,
        validators=[MinValueValidator(0)],
        verbose_name="Practical Max Score",
    )
    project_max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5,
        validators=[MinValueValidator(0)],
        verbose_name="Project Max Score",
    )
    note_copying_max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5,
        validators=[MinValueValidator(0)],
        verbose_name="Note Copying Max Score",
    )

    # Exam configuration
    exam_max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=70,
        validators=[MinValueValidator(0)],
        verbose_name="Exam Max Score",
    )

    # Weight percentages
    ca_weight_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=40,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="CA Weight Percentage",
    )
    exam_weight_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=60,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Exam Weight Percentage",
    )

    # Total configuration
    total_max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100,
        validators=[MinValueValidator(0)],
        verbose_name="Total Max Score",
    )

    # Status
    is_active = models.BooleanField(default=True, verbose_name="Active")
    is_default = models.BooleanField(
        default=False, verbose_name="Default Configuration"
    )

    # Tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_scoring_configs",
        verbose_name="Created By",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_scoring_configuration"
        unique_together = ["education_level", "result_type", "name"]
        ordering = ["education_level", "result_type", "name"]
        indexes = [
            models.Index(fields=["education_level", "result_type"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["is_default"]),
        ]
        verbose_name = "Scoring Configuration"
        verbose_name_plural = "Scoring Configurations"

    def __str__(self):
        return f"{self.get_education_level_display()} - {self.get_result_type_display()} - {self.name}"

    def clean(self):
        """Validate scoring configuration based on result type"""
        if self.result_type == "TERMLY" and self.education_level != "NURSERY":
            if self.ca_weight_percentage + self.exam_weight_percentage != 100:
                raise ValidationError("CA and Exam weight percentages must sum to 100%")

            if self.education_level in ["JUNIOR_SECONDARY", "PRIMARY"]:
                expected_total = (
                    self.continuous_assessment_max_score
                    + self.take_home_test_max_score
                    + self.appearance_max_score
                    + self.practical_max_score
                    + self.project_max_score
                    + self.note_copying_max_score
                    + self.exam_max_score
                )
            elif self.education_level == "SENIOR_SECONDARY":
                expected_total = (
                    self.test1_max_score
                    + self.test2_max_score
                    + self.test3_max_score
                    + self.exam_max_score
                )
            elif self.education_level == "NURSERY":
                expected_total = self.total_max_score

            if expected_total != self.total_max_score:
                raise ValidationError(
                    f"Total max score must equal sum of components ({expected_total})"
                )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def ca_total_max_score(self):
        """Calculate total CA max score based on education level"""
        if self.education_level in ["JUNIOR_SECONDARY", "PRIMARY"]:
            return (
                self.continuous_assessment_max_score
                + self.take_home_test_max_score
                + self.appearance_max_score
                + self.practical_max_score
                + self.project_max_score
                + self.note_copying_max_score
            )
        else:
            return self.test1_max_score + self.test2_max_score + self.test3_max_score


class AssessmentType(models.Model):
    """Types of assessments (Continuous Assessment, Exam, etc.)"""

    EDUCATION_LEVEL_CHOICES = [
        ("NURSERY", "Nursery"),
        ("PRIMARY", "Primary"),
        ("JUNIOR_SECONDARY", "Junior Secondary"),
        ("SENIOR_SECONDARY", "Senior Secondary"),
        ("ALL", "All Levels"),
    ]

    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    education_level = models.CharField(
        max_length=20,
        choices=EDUCATION_LEVEL_CHOICES,
        default="ALL",
        help_text="Education level this assessment type applies to",
    )
    max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10,
        validators=[MinValueValidator(0)],
        help_text="Maximum score for this assessment type",
    )
    weight_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Weight in final score calculation",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "results_assessment_type"
        verbose_name = "Assessment Type"
        verbose_name_plural = "Assessment Types"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.weight_percentage}%)"


class ExamSession(models.Model):
    """Exam sessions within an academic session"""

    EXAM_TYPES = [
        ("FIRST_CA", "First Continuous Assessment"),
        ("SECOND_CA", "Second Continuous Assessment"),
        ("THIRD_CA", "Third Continuous Assessment"),
        ("MID_TERM", "Mid-term Examination"),
        ("FINAL_EXAM", "Final Examination"),
        ("MOCK_EXAM", "Mock Examination"),
        ("PRACTICAL", "Practical Examination"),
        ("PROJECT", "Project Assessment"),
        ("OTHER", "Other"),
    ]

    TERMS = [
        ("FIRST", "First Term"),
        ("SECOND", "Second Term"),
        ("THIRD", "Third Term"),
    ]

    name = models.CharField(max_length=100)
    exam_type = models.CharField(max_length=20, choices=EXAM_TYPES)
    academic_session = models.ForeignKey(
        AcademicSession, on_delete=models.CASCADE, related_name="exam_sessions"
    )
    term = models.CharField(max_length=10, choices=TERMS)
    start_date = models.DateField()
    end_date = models.DateField()
    result_release_date = models.DateField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_exam_session"
        unique_together = ["academic_session", "term", "exam_type"]
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.name} - {self.academic_session.name} ({self.get_term_display()})"

    def clean(self):
        if self.start_date >= self.end_date:
            raise ValidationError("Start date must be before end date")


class StudentResult(models.Model):
    """Main result record for a student in a subject"""

    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="results"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="student_results"
    )
    exam_session = models.ForeignKey(
        ExamSession, on_delete=models.CASCADE, related_name="student_results"
    )
    grading_system = models.ForeignKey(
        GradingSystem, on_delete=models.CASCADE, related_name="student_results"
    )
    # Stream support for Senior Secondary
    stream = models.ForeignKey(
        Stream,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="student_results",
        help_text="Stream for Senior Secondary results (Science, Arts, Commercial, Technical)",
    )

    # Score breakdown
    ca_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Continuous Assessment Score",
    )
    exam_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Examination Score",
    )
    total_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0)]
    )
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )

    # Grade information
    grade = models.CharField(max_length=5, blank=True)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )

    # Status and metadata
    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    is_passed = models.BooleanField(default=False)
    position = models.PositiveIntegerField(null=True, blank=True)
    remarks = models.TextField(blank=True)

    # Tracking - FIXED: Using settings.AUTH_USER_MODEL instead of "auth.User"
    entered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="entered_results",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_results",
    )
    approved_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_student_result"
        unique_together = ["student", "subject", "exam_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "exam_session"]),
            models.Index(fields=["subject", "exam_session"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} ({self.total_score})"

    def save(self, *args, **kwargs):
        # Calculate total score and percentage
        self.calculate_scores()
        # Determine grade
        self.determine_grade()
        super().save(*args, **kwargs)

    def calculate_scores(self):
        """Calculate total score and percentage"""
        self.total_score = self.ca_score + self.exam_score

        # Calculate percentage based on grading system max score
        if self.grading_system.max_score > 0:
            self.percentage = (self.total_score / self.grading_system.max_score) * 100
        else:
            self.percentage = 0

    def determine_grade(self):
        """Determine grade based on total score and grading system"""
        grades = self.grading_system.grades.filter(
            min_score__lte=self.total_score, max_score__gte=self.total_score
        ).first()

        if grades:
            self.grade = grades.grade
            self.grade_point = grades.grade_point
            self.is_passed = grades.is_passing
        else:
            # Default to fail if no grade found
            self.grade = "F"
            self.grade_point = 0.0
            self.is_passed = False


# ============================================
# SENIOR SECONDARY MODELS
# ============================================


class SeniorSecondaryTermReport(models.Model):
    """Consolidated senior secondary term report"""

    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="senior_secondary_term_reports"
    )
    exam_session = models.ForeignKey(
        ExamSession,
        on_delete=models.CASCADE,
        related_name="senior_secondary_term_reports",
    )
    stream = models.ForeignKey(
        Stream,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="senior_secondary_term_reports",
    )

    total_score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        verbose_name="Total Score Across All Subjects",
    )
    average_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name="Average Score Percentage",
    )
    overall_grade = models.CharField(
        max_length=5, blank=True, verbose_name="Overall Grade"
    )

    class_position = models.PositiveIntegerField(null=True, blank=True)
    total_students = models.PositiveIntegerField(
        default=0, verbose_name="Total Students in Class"
    )

    times_opened = models.PositiveIntegerField(
        default=0, verbose_name="Number of Times School Opened"
    )
    times_present = models.PositiveIntegerField(
        default=0, verbose_name="Number of Times Student was Present"
    )

    next_term_begins = models.DateField(null=True, blank=True)

    class_teacher_remark = models.TextField(blank=True)
    head_teacher_remark = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    is_published = models.BooleanField(default=False)

    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="published_senior_secondary_term_reports",
    )
    published_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_senior_secondary_term_report"
        unique_together = ["student", "exam_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "exam_session"]),
            models.Index(fields=["status"]),
            models.Index(fields=["is_published"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.exam_session.name} Senior Secondary Term Report"

    def calculate_metrics(self):
        """Calculate consolidated metrics from individual subject results"""
        from django.db.models import Sum, Count, Avg

        subject_results = SeniorSecondaryResult.objects.filter(
            student=self.student,
            exam_session=self.exam_session,
            status__in=["APPROVED", "PUBLISHED"],
        )

        if subject_results.exists():
            totals = subject_results.aggregate(
                total_score_sum=Sum("total_score"),
                subject_count=Count("id"),
                avg_percentage=Avg("percentage"),
            )

            self.total_score = totals["total_score_sum"] or 0
            self.average_score = totals["avg_percentage"] or 0

            if hasattr(subject_results.first(), "grading_system"):
                grading_system = subject_results.first().grading_system
                grade_obj = grading_system.grades.filter(
                    min_score__lte=self.average_score, max_score__gte=self.average_score
                ).first()

                if grade_obj:
                    self.overall_grade = grade_obj.grade
                else:
                    self.overall_grade = self._get_default_grade(self.average_score)
            else:
                self.overall_grade = self._get_default_grade(self.average_score)

        self.save()

    def _get_default_grade(self, percentage):
        """Fallback grading system"""
        if percentage >= 70:
            return "A"
        if percentage >= 60:
            return "B"
        if percentage >= 50:
            return "C"
        if percentage >= 45:
            return "D"
        if percentage >= 39:
            return "E"
        return "F"

    def calculate_class_position(self):
        """Calculate class position among peers"""
        same_class_reports = SeniorSecondaryTermReport.objects.filter(
            exam_session=self.exam_session,
            student__student_class=self.student.student_class,
            student__education_level=self.student.education_level,
            status__in=["APPROVED", "PUBLISHED"],
        ).exclude(id=self.id)

        if same_class_reports.exists():
            higher_performers = same_class_reports.filter(
                average_score__gt=self.average_score
            ).count()

            self.class_position = higher_performers + 1
            self.total_students = same_class_reports.count() + 1
        else:
            self.class_position = 1
            self.total_students = 1

        self.save()

    def sync_status_with_subjects(self):
        """Sync term report status with individual subject results"""
        if self.status in ["APPROVED", "PUBLISHED"]:
            return

        subject_results = self.subject_results.all()

        if not subject_results.exists():
            self.status = "DRAFT"
            self.save()
            return

        statuses = subject_results.values_list("status", flat=True)

        if "DRAFT" in statuses:
            self.status = "DRAFT"
        else:
            self.status = "SUBMITTED"

        self.save()


class SeniorSecondaryResult(models.Model):
    """Senior Secondary specific result model with detailed test scores"""

    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="senior_secondary_results"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="senior_secondary_results"
    )
    exam_session = models.ForeignKey(
        ExamSession, on_delete=models.CASCADE, related_name="senior_secondary_results"
    )
    grading_system = models.ForeignKey(
        GradingSystem, on_delete=models.CASCADE, related_name="senior_secondary_results"
    )

    stream = models.ForeignKey(
        Stream,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="senior_secondary_results",
        help_text="Stream for Senior Secondary results (Science, Arts, Commercial, Technical)",
    )

    term_report = models.ForeignKey(
        "result.SeniorSecondaryTermReport",
        on_delete=models.CASCADE,
        related_name="subject_results",
        null=True,
        blank=True,
        help_text="Link to consolidated term report",
    )

    first_test_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        verbose_name="1st Test Score (10 marks)",
    )
    second_test_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        verbose_name="2nd Test Score (10 marks)",
    )
    third_test_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        verbose_name="3rd Test Score (10 marks)",
    )
    exam_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(70)],
        verbose_name="Examination Score (70 marks)",
    )

    total_ca_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name="Total CA Score (30 marks)",
    )
    total_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name="Total Score (100 marks)",
    )
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )

    grade = models.CharField(max_length=5, blank=True)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    is_passed = models.BooleanField(default=False)

    class_average = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Class Average"
    )
    highest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Highest Score in Class"
    )
    lowest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Lowest Score in Class"
    )
    subject_position = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Position in Subject"
    )

    teacher_remark = models.TextField(blank=True, verbose_name="Teacher's Remark")
    class_teacher_remark = models.TextField(
        blank=True, verbose_name="Class Teacher's Remark"
    )
    head_teacher_remark = models.TextField(
        blank=True, verbose_name="Head Teacher's Remark"
    )

    class_teacher_signature_url = models.URLField(blank=True, null=True)
    head_teacher_signature_url = models.URLField(blank=True, null=True)
    principal_signature_url = models.URLField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    entered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="entered_senior_results",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_senior_results",
    )
    approved_date = models.DateTimeField(null=True, blank=True)

    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="published_senior_secondary_results",
    )
    published_date = models.DateTimeField(null=True, blank=True)
    last_edited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="edited_senior_secondary_results",
    )
    last_edited_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_senior_secondary_result"
        unique_together = ["student", "subject", "exam_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "exam_session"]),
            models.Index(fields=["subject", "exam_session"]),
            models.Index(fields=["status"]),
            models.Index(fields=["term_report"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} ({self.total_score})"

    def save(self, *args, **kwargs):
        self.calculate_scores()
        self.calculate_class_statistics()
        self.determine_grade()
        super().save(*args, **kwargs)
        self.update_term_report()

    def calculate_scores(self):
        """Calculate total CA score, total score, and percentage"""
        self.total_ca_score = (
            self.first_test_score + self.second_test_score + self.third_test_score
        )

        self.total_score = self.total_ca_score + self.exam_score

        if self.grading_system.max_score > 0:
            self.percentage = (self.total_score / self.grading_system.max_score) * 100
        else:
            self.percentage = 0

    def determine_grade(self):
        """Determine grade based on grading system"""
        try:
            grade_obj = self.grading_system.grades.filter(
                min_score__lte=self.total_score, max_score__gte=self.total_score
            ).first()

            if grade_obj:
                self.grade = grade_obj.grade
                self.grade_point = grade_obj.grade_point
                self.is_passed = grade_obj.is_passing
            else:
                self.grade = "N/A"
                self.grade_point = None
                self.is_passed = False
        except Exception:
            self.grade = "N/A"
            self.grade_point = None
            self.is_passed = False

    def calculate_class_statistics(self):
        """Calculate class statistics for this subject"""
        from django.db.models import Avg, Max, Min

        class_results = self.__class__.objects.filter(
            subject=self.subject,
            exam_session=self.exam_session,
            student__student_class=self.student.student_class,
            status__in=["APPROVED", "PUBLISHED"],
        ).exclude(id=self.id)

        if class_results.exists():
            score_field = (
                "total_percentage"
                if hasattr(self, "total_percentage")
                else "total_score"
            )

            self.class_average = (
                class_results.aggregate(avg=Avg(score_field))["avg"] or 0
            )
            self.highest_in_class = (
                class_results.aggregate(max=Max(score_field))["max"] or 0
            )
            self.lowest_in_class = (
                class_results.aggregate(min=Min(score_field))["min"] or 0
            )

            all_scores = list(class_results.values_list(score_field, flat=True)) + [
                getattr(self, score_field)
            ]
            all_scores.sort(reverse=True)
            self.subject_position = all_scores.index(getattr(self, score_field)) + 1

    def update_term_report(self):
        """Update or create the consolidated term report"""
        # Always update term report, even for DRAFT status
        # Get or create the term report
        term_report, created = SeniorSecondaryTermReport.objects.get_or_create(
            student=self.student,
            exam_session=self.exam_session,
            defaults={"status": "DRAFT"},
        )

        # Link this result to the term report (avoid recursive calls)
        if not self.term_report:
            self.__class__.objects.filter(id=self.id).update(term_report=term_report.id)

        # Recalculate term report metrics
        term_report.calculate_metrics()
        term_report.calculate_class_position()

        # Auto-update term report status based on individual results
        term_report.sync_status_with_subjects()

    @property
    def test1_score(self):
        return self.first_test_score

    @property
    def test2_score(self):
        return self.second_test_score

    @property
    def test3_score(self):
        return self.third_test_score

    @property
    def total_obtainable(self):
        return 100

    @property
    def position(self):
        if self.subject_position:
            suffix = (
                "st"
                if self.subject_position == 1
                else (
                    "nd"
                    if self.subject_position == 2
                    else "rd" if self.subject_position == 3 else "th"
                )
            )
            return f"{self.subject_position}{suffix}"
        return ""


class SeniorSecondarySessionReport(models.Model):
    """Consolidated senior secondary session report with TAA"""

    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="senior_secondary_session_reports",
    )
    academic_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.CASCADE,
        related_name="senior_secondary_session_reports",
    )
    stream = models.ForeignKey(
        Stream,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="senior_secondary_session_reports",
    )

    term1_total = models.DecimalField(
        max_digits=8, decimal_places=2, default=0, verbose_name="First Term Total Score"
    )
    term2_total = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        verbose_name="Second Term Total Score",
    )
    term3_total = models.DecimalField(
        max_digits=8, decimal_places=2, default=0, verbose_name="Third Term Total Score"
    )

    taa_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Total Annual Average"
    )
    average_for_year = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Average for the Year"
    )
    obtainable = models.DecimalField(
        max_digits=8, decimal_places=2, default=0, verbose_name="Total Obtainable Marks"
    )
    obtained = models.DecimalField(
        max_digits=8, decimal_places=2, default=0, verbose_name="Total Obtained Marks"
    )
    overall_grade = models.CharField(
        max_length=5, blank=True, verbose_name="Overall Grade for Session"
    )

    class_position = models.PositiveIntegerField(null=True, blank=True)
    total_students = models.PositiveIntegerField(
        default=0, verbose_name="Total Students in Class"
    )

    teacher_remark = models.TextField(blank=True, verbose_name="Form Master's Remark")
    head_teacher_remark = models.TextField(
        blank=True, verbose_name="Principal's Remark"
    )

    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    is_published = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_senior_secondary_session_report"
        unique_together = ["student", "academic_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "academic_session"]),
            models.Index(fields=["status"]),
            models.Index(fields=["is_published"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.academic_session.name} Senior Secondary Session Report"

    def calculate_session_metrics(self):
        """Calculate session metrics from individual subject session results"""
        from django.db.models import Sum, Count, Avg

        session_results = SeniorSecondarySessionResult.objects.filter(
            student=self.student,
            academic_session=self.academic_session,
            status__in=["APPROVED", "PUBLISHED"],
        )

        if session_results.exists():
            totals = session_results.aggregate(
                total_obtained=Sum("obtained"),
                total_obtainable=Sum("obtainable"),
                avg_for_year=Avg("average_for_year"),
            )

            self.obtained = totals["total_obtained"] or 0
            self.obtainable = totals["total_obtainable"] or 0
            self.average_for_year = totals["avg_for_year"] or 0

            if self.obtainable > 0:
                self.taa_score = (self.obtained / self.obtainable) * 100
            else:
                self.taa_score = 0

            self._calculate_term_totals()

            self.overall_grade = self._get_default_grade(self.average_for_year)

        self.save()

    def _calculate_term_totals(self):
        """Calculate individual term totals from term reports"""
        try:
            first_term_session = ExamSession.objects.filter(
                academic_session=self.academic_session, term="FIRST"
            ).first()
            second_term_session = ExamSession.objects.filter(
                academic_session=self.academic_session, term="SECOND"
            ).first()
            third_term_session = ExamSession.objects.filter(
                academic_session=self.academic_session, term="THIRD"
            ).first()

            if first_term_session:
                first_term_report = SeniorSecondaryTermReport.objects.filter(
                    student=self.student, exam_session=first_term_session
                ).first()
                if first_term_report:
                    self.term1_total = first_term_report.total_score

            if second_term_session:
                second_term_report = SeniorSecondaryTermReport.objects.filter(
                    student=self.student, exam_session=second_term_session
                ).first()
                if second_term_report:
                    self.term2_total = second_term_report.total_score

            if third_term_session:
                third_term_report = SeniorSecondaryTermReport.objects.filter(
                    student=self.student, exam_session=third_term_session
                ).first()
                if third_term_report:
                    self.term3_total = third_term_report.total_score

        except Exception as e:
            logger.error(f"Error calculating term totals: {e}")

    def _get_default_grade(self, percentage):
        """Fallback grading system"""
        if percentage >= 70:
            return "A"
        if percentage >= 60:
            return "B"
        if percentage >= 50:
            return "C"
        if percentage >= 45:
            return "D"
        if percentage >= 39:
            return "E"
        return "F"

    def calculate_class_position(self):
        """Calculate class position for session results"""
        same_class_reports = SeniorSecondarySessionReport.objects.filter(
            academic_session=self.academic_session,
            student__student_class=self.student.student_class,
            student__education_level=self.student.education_level,
            status__in=["APPROVED", "PUBLISHED"],
        ).exclude(id=self.id)

        if same_class_reports.exists():
            higher_performers = same_class_reports.filter(
                average_for_year__gt=self.average_for_year
            ).count()

            self.class_position = higher_performers + 1
            self.total_students = same_class_reports.count() + 1
        else:
            self.class_position = 1
            self.total_students = 1

        self.save()


class SeniorSecondarySessionResult(models.Model):
    """Senior Secondary session result with Termly Accumulative Average (TAA)"""

    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="senior_session_results"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="senior_session_results"
    )
    academic_session = models.ForeignKey(
        AcademicSession, on_delete=models.CASCADE, related_name="senior_session_results"
    )
    stream = models.ForeignKey(
        Stream,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="senior_session_results",
    )

    session_report = models.ForeignKey(
        SeniorSecondarySessionReport,
        on_delete=models.CASCADE,
        related_name="subject_results",
        null=True,
        blank=True,
        help_text="Link to consolidated session report",
    )

    first_term_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="1st Term Total Score"
    )
    second_term_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="2nd Term Total Score"
    )
    third_term_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="3rd Term Total Score"
    )

    average_for_year = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Average for the Year"
    )
    obtainable = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=300,
        verbose_name="Total Obtainable (300 marks)",
    )
    obtained = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Total Obtained"
    )

    class_average = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Class Average"
    )
    highest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Highest Score in Class"
    )
    lowest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Lowest Score in Class"
    )
    subject_position = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Position in Subject"
    )

    teacher_remark = models.TextField(blank=True, verbose_name="Teacher's Remark")
    class_teacher_remark = models.TextField(
        blank=True, verbose_name="Class Teacher's Remark"
    )
    head_teacher_remark = models.TextField(
        blank=True, verbose_name="Head Teacher's Remark"
    )

    class_teacher_signature_url = models.URLField(blank=True, null=True)
    head_teacher_signature_url = models.URLField(blank=True, null=True)
    principal_signature_url = models.URLField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_senior_secondary_session_result"
        unique_together = ["student", "subject", "academic_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "academic_session"]),
            models.Index(fields=["subject", "academic_session"]),
            models.Index(fields=["status"]),
            models.Index(fields=["session_report"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} Session Result"

    def save(self, *args, **kwargs):
        self.calculate_class_statistics()
        self.calculate_taa()
        super().save(*args, **kwargs)
        self.update_term_report()

    def calculate_taa(self):
        """Calculate Termly Accumulative Average"""
        self.obtained = (
            self.first_term_score + self.second_term_score + self.third_term_score
        )

        if self.obtainable > 0:
            self.average_for_year = (self.obtained / self.obtainable) * 100
        else:
            self.average_for_year = 0

    def calculate_class_statistics(self):
        """Calculate class statistics for this subject session result"""
        from django.db.models import Avg, Max, Min

        class_results = self.__class__.objects.filter(
            subject=self.subject,
            academic_session=self.academic_session,
            student__student_class=self.student.student_class,
            status__in=["APPROVED", "PUBLISHED"],
        ).exclude(id=self.id)

        if class_results.exists():
            self.class_average = (
                class_results.aggregate(avg=Avg("average_for_year"))["avg"] or 0
            )
            self.highest_in_class = (
                class_results.aggregate(max=Max("average_for_year"))["max"] or 0
            )
            self.lowest_in_class = (
                class_results.aggregate(min=Min("average_for_year"))["min"] or 0
            )

            all_scores = list(
                class_results.values_list("average_for_year", flat=True)
            ) + [self.average_for_year]
            all_scores.sort(reverse=True)
            self.subject_position = all_scores.index(self.average_for_year) + 1

    def update_term_report(self):
        """Update or create the consolidated session report"""
        # Always update session report, even for DRAFT status
        # Get or create the session report
        session_report, created = SeniorSecondarySessionReport.objects.get_or_create(
            student=self.student,
            academic_session=self.academic_session,
            defaults={"status": "DRAFT"},
        )

        # Link this result to the session report (avoid recursive calls)
        if not self.session_report:
            self.__class__.objects.filter(id=self.id).update(
                session_report=session_report.id
            )

        # Recalculate session report metrics
        session_report.calculate_session_metrics()
        session_report.calculate_class_position()

    @property
    def term1_score(self):
        return self.first_term_score

    @property
    def term2_score(self):
        return self.second_term_score

    @property
    def term3_score(self):
        return self.third_term_score

    @property
    def average_score(self):
        return self.average_for_year

    @property
    def position(self):
        if self.subject_position:
            suffix = (
                "st"
                if self.subject_position == 1
                else (
                    "nd"
                    if self.subject_position == 2
                    else "rd" if self.subject_position == 3 else "th"
                )
            )
            return f"{self.subject_position}{suffix}"
        return ""


# ============================================
# JUNIOR SECONDARY MODELS
# ============================================


class JuniorSecondaryTermReport(models.Model):
    """Consolidated junior secondary term report"""

    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="junior_secondary_term_reports"
    )
    exam_session = models.ForeignKey(
        ExamSession,
        on_delete=models.CASCADE,
        related_name="junior_secondary_term_reports",
    )

    total_score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        verbose_name="Total Score Across All Subjects",
    )
    average_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name="Average Score Percentage",
    )
    overall_grade = models.CharField(
        max_length=5, blank=True, verbose_name="Overall Grade"
    )

    class_position = models.PositiveIntegerField(null=True, blank=True)
    total_students = models.PositiveIntegerField(
        default=0, verbose_name="Total Students in Class"
    )

    times_opened = models.PositiveIntegerField(
        default=0, verbose_name="Number of Times School Opened"
    )
    times_present = models.PositiveIntegerField(
        default=0, verbose_name="Number of Times Student was Present"
    )

    next_term_begins = models.DateField(null=True, blank=True)

    class_teacher_remark = models.TextField(blank=True)
    head_teacher_remark = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    is_published = models.BooleanField(default=False)

    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="published_junior_secondary_reports",
    )
    published_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_junior_secondary_term_report"
        unique_together = ["student", "exam_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "exam_session"]),
            models.Index(fields=["status"]),
            models.Index(fields=["is_published"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.exam_session.name} Junior Secondary Report"

    def calculate_metrics(self):
        """Calculate consolidated metrics from individual subject results"""
        from django.db.models import Sum, Count, Avg

        subject_results = JuniorSecondaryResult.objects.filter(
            student=self.student,
            exam_session=self.exam_session,
            status__in=["APPROVED", "PUBLISHED"],
        )

        if subject_results.exists():
            totals = subject_results.aggregate(
                total_score_sum=Sum("total_score"),
                subject_count=Count("id"),
                avg_percentage=Avg("total_percentage"),
            )

            self.total_score = totals["total_score_sum"] or 0
            self.average_score = totals["avg_percentage"] or 0

            if hasattr(subject_results.first(), "grading_system"):
                grading_system = subject_results.first().grading_system
                grade_obj = grading_system.grades.filter(
                    min_score__lte=self.average_score, max_score__gte=self.average_score
                ).first()

                if grade_obj:
                    self.overall_grade = grade_obj.grade
                else:
                    self.overall_grade = self._get_default_grade(self.average_score)
            else:
                self.overall_grade = self._get_default_grade(self.average_score)

        self.save()

    def _get_default_grade(self, percentage):
        """Fallback grading system if no grading system is available"""
        if percentage >= 70:
            return "A"
        if percentage >= 60:
            return "B"
        if percentage >= 50:
            return "C"
        if percentage >= 45:
            return "D"
        if percentage >= 39:
            return "E"
        return "F"

    def calculate_class_position(self):
        """Calculate class position among peers"""
        same_class_reports = JuniorSecondaryTermReport.objects.filter(
            exam_session=self.exam_session,
            student__student_class=self.student.student_class,
            student__education_level=self.student.education_level,
            status__in=["APPROVED", "PUBLISHED"],
        ).exclude(id=self.id)

        if same_class_reports.exists():
            higher_performers = same_class_reports.filter(
                average_score__gt=self.average_score
            ).count()

            self.class_position = higher_performers + 1
            self.total_students = same_class_reports.count() + 1
        else:
            self.class_position = 1
            self.total_students = 1

        self.save()

    def sync_status_with_subjects(self):
        """Sync term report status with individual subject results"""
        if self.status in ["APPROVED", "PUBLISHED"]:
            return

        subject_results = self.subject_results.all()

        if not subject_results.exists():
            self.status = "DRAFT"
            self.save()
            return

        statuses = subject_results.values_list("status", flat=True)

        if "DRAFT" in statuses:
            self.status = "DRAFT"
        else:
            self.status = "SUBMITTED"

        self.save()


class JuniorSecondaryResult(models.Model):
    """Junior Secondary specific result model with detailed CA breakdown"""

    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="junior_secondary_results"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="junior_secondary_results"
    )
    exam_session = models.ForeignKey(
        ExamSession, on_delete=models.CASCADE, related_name="junior_secondary_results"
    )
    grading_system = models.ForeignKey(
        GradingSystem, on_delete=models.CASCADE, related_name="junior_secondary_results"
    )

    term_report = models.ForeignKey(
        JuniorSecondaryTermReport,
        on_delete=models.CASCADE,
        related_name="subject_results",
        null=True,
        blank=True,
        help_text="Link to consolidated term report",
    )

    continuous_assessment_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(15)],
        verbose_name="Continuous Assessment (15 marks)",
    )
    take_home_test_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Take Home Test (5 marks)",
    )
    practical_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Practical (5 marks)",
    )
    appearance_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Appearance (5 marks)",
    )
    project_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Project (5 marks)",
    )
    note_copying_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Note Copying (5 marks)",
    )

    exam_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(60)],
        verbose_name="Examination (60 marks)",
    )

    ca_total = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="C.A Total (35 marks)"
    )
    total_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Total (100 marks)"
    )

    ca_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Continuous Assessment (%)",
    )
    exam_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Examination (%)",
    )
    total_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Total (%)",
    )

    grade = models.CharField(max_length=5, blank=True)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    is_passed = models.BooleanField(default=False)

    class_average = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Class Average"
    )
    highest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Highest Score in Class"
    )
    lowest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Lowest Score in Class"
    )
    subject_position = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Subject Position"
    )

    previous_term_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Previous Term Score"
    )
    cumulative_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Cumulative Score"
    )

    teacher_remark = models.TextField(blank=True, verbose_name="Teacher's Remark")
    class_teacher_remark = models.TextField(
        blank=True, verbose_name="Class Teacher's Remark"
    )
    head_teacher_remark = models.TextField(
        blank=True, verbose_name="Head Teacher's Remark"
    )

    class_teacher_signature_url = models.URLField(blank=True, null=True)
    head_teacher_signature_url = models.URLField(blank=True, null=True)
    principal_signature_url = models.URLField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    entered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="entered_junior_results",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_junior_results",
    )
    approved_date = models.DateTimeField(null=True, blank=True)

    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="published_junior_results",
    )
    published_date = models.DateTimeField(null=True, blank=True)
    last_edited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="edited_junior_results",
    )
    last_edited_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_junior_secondary_result"
        unique_together = ["student", "subject", "exam_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "exam_session"]),
            models.Index(fields=["subject", "exam_session"]),
            models.Index(fields=["status"]),
            models.Index(fields=["term_report"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} ({self.total_score})"

    def save(self, *args, **kwargs):
        self.calculate_scores()
        self.calculate_class_statistics()
        self.determine_grade()
        super().save(*args, **kwargs)
        self.update_term_report()

    def calculate_scores(self):
        """Calculate CA total, total score, and percentages"""
        self.ca_total = (
            self.continuous_assessment_score
            + self.take_home_test_score
            + self.practical_score
            + self.project_score
            + self.appearance_score
            + self.note_copying_score
        )

        self.total_score = self.ca_total + self.exam_score

        self.ca_percentage = (self.ca_total / 35) * 100 if self.ca_total > 0 else 0
        self.exam_percentage = (
            (self.exam_score / 60) * 100 if self.exam_score > 0 else 0
        )
        self.total_percentage = (
            (self.total_score / 100) * 100 if self.total_score > 0 else 0
        )

    def determine_grade(self):
        """Determine grade based on grading system"""
        try:
            grade_obj = self.grading_system.grades.filter(
                min_score__lte=self.total_percentage,
                max_score__gte=self.total_percentage,
            ).first()

            if grade_obj:
                self.grade = grade_obj.grade
                self.grade_point = grade_obj.grade_point
                self.is_passed = grade_obj.is_passing
            else:
                self.grade = "N/A"
                self.grade_point = None
                self.is_passed = False
        except Exception:
            self.grade = "N/A"
            self.grade_point = None
            self.is_passed = False

    def calculate_class_statistics(self):
        """Calculate class statistics for this subject"""
        from django.db.models import Avg, Max, Min

        class_results = self.__class__.objects.filter(
            subject=self.subject,
            exam_session=self.exam_session,
            student__student_class=self.student.student_class,
            status__in=["APPROVED", "PUBLISHED"],
        ).exclude(id=self.id)

        if class_results.exists():
            score_field = (
                "total_percentage"
                if hasattr(self, "total_percentage")
                else "total_score"
            )

            self.class_average = (
                class_results.aggregate(avg=Avg(score_field))["avg"] or 0
            )
            self.highest_in_class = (
                class_results.aggregate(max=Max(score_field))["max"] or 0
            )
            self.lowest_in_class = (
                class_results.aggregate(min=Min(score_field))["min"] or 0
            )

            all_scores = list(class_results.values_list(score_field, flat=True)) + [
                getattr(self, score_field)
            ]
            all_scores.sort(reverse=True)
            self.subject_position = all_scores.index(getattr(self, score_field)) + 1

    def update_term_report(self):
        """Update or create the consolidated term report"""
        # Get or create the term report
        term_report, created = JuniorSecondaryTermReport.objects.get_or_create(
            student=self.student,
            exam_session=self.exam_session,
            defaults={"status": "DRAFT"},
        )

        # Link this result to the term report (avoid recursive calls)
        if not self.term_report:
            self.__class__.objects.filter(id=self.id).update(term_report=term_report.id)

        # Recalculate term report metrics
        term_report.calculate_metrics()
        term_report.calculate_class_position()

        # Auto-update term report status based on individual results
        term_report.sync_status_with_subjects()

    @property
    def exam_marks(self):
        return self.exam_score

    @property
    def mark_obtained(self):
        return self.total_score

    @property
    def total_obtainable(self):
        return 100

    @property
    def position(self):
        if self.subject_position:
            suffix = (
                "st"
                if self.subject_position == 1
                else (
                    "nd"
                    if self.subject_position == 2
                    else "rd" if self.subject_position == 3 else "th"
                )
            )
            return f"{self.subject_position}{suffix}"
        return ""


# ============================================
# PRIMARY MODELS
# ============================================


class PrimaryTermReport(models.Model):
    """Consolidated primary term report"""

    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="primary_term_reports"
    )
    exam_session = models.ForeignKey(
        ExamSession, on_delete=models.CASCADE, related_name="primary_term_reports"
    )

    total_score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        verbose_name="Total Score Across All Subjects",
    )
    average_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name="Average Score Percentage",
    )
    overall_grade = models.CharField(
        max_length=5, blank=True, verbose_name="Overall Grade"
    )

    class_position = models.PositiveIntegerField(null=True, blank=True)
    total_students = models.PositiveIntegerField(
        default=0, verbose_name="Total Students in Class"
    )

    times_opened = models.PositiveIntegerField(
        default=0, verbose_name="Number of Times School Opened"
    )
    times_present = models.PositiveIntegerField(
        default=0, verbose_name="Number of Times Student was Present"
    )

    next_term_begins = models.DateField(null=True, blank=True)

    class_teacher_remark = models.TextField(blank=True)
    head_teacher_remark = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    is_published = models.BooleanField(default=False)

    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="published_primary_reports",
    )
    published_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_primary_term_report"
        unique_together = ["student", "exam_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "exam_session"]),
            models.Index(fields=["status"]),
            models.Index(fields=["is_published"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.exam_session.name} Primary Report"

    def calculate_metrics(self):
        """Calculate consolidated metrics from individual subject results"""
        from django.db.models import Sum, Count, Avg

        subject_results = PrimaryResult.objects.filter(
            student=self.student,
            exam_session=self.exam_session,
            status__in=["APPROVED", "PUBLISHED"],
        )

        if subject_results.exists():
            totals = subject_results.aggregate(
                total_score_sum=Sum("total_score"),
                subject_count=Count("id"),
                avg_percentage=Avg("total_percentage"),
            )

            self.total_score = totals["total_score_sum"] or 0
            self.average_score = totals["avg_percentage"] or 0

            if hasattr(subject_results.first(), "grading_system"):
                grading_system = subject_results.first().grading_system
                grade_obj = grading_system.grades.filter(
                    min_score__lte=self.average_score, max_score__gte=self.average_score
                ).first()

                if grade_obj:
                    self.overall_grade = grade_obj.grade
                else:
                    self.overall_grade = self._get_default_grade(self.average_score)
            else:
                self.overall_grade = self._get_default_grade(self.average_score)

        self.save()

    def _get_default_grade(self, percentage):
        """Fallback grading system if no grading system is available"""
        if percentage >= 70:
            return "A"
        if percentage >= 60:
            return "B"
        if percentage >= 50:
            return "C"
        if percentage >= 45:
            return "D"
        if percentage >= 39:
            return "E"
        return "F"

    def calculate_class_position(self):
        """Calculate class position among peers"""
        same_class_reports = PrimaryTermReport.objects.filter(
            exam_session=self.exam_session,
            student__student_class=self.student.student_class,
            student__education_level=self.student.education_level,
            status__in=["APPROVED", "PUBLISHED"],
        ).exclude(id=self.id)

        if same_class_reports.exists():
            higher_performers = same_class_reports.filter(
                average_score__gt=self.average_score
            ).count()

            self.class_position = higher_performers + 1
            self.total_students = same_class_reports.count() + 1
        else:
            self.class_position = 1
            self.total_students = 1

        self.save()

    def sync_status_with_subjects(self):
        """Sync term report status with individual subject results"""
        if self.status in ["APPROVED", "PUBLISHED"]:
            return

        subject_results = self.subject_results.all()

        if not subject_results.exists():
            self.status = "DRAFT"
            self.save()
            return

        statuses = subject_results.values_list("status", flat=True)

        if "DRAFT" in statuses:
            self.status = "DRAFT"
        else:
            self.status = "SUBMITTED"

        self.save()


class PrimaryResult(models.Model):
    """Primary School specific result model with detailed CA breakdown"""

    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="primary_results"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="primary_results"
    )
    exam_session = models.ForeignKey(
        ExamSession, on_delete=models.CASCADE, related_name="primary_results"
    )
    grading_system = models.ForeignKey(
        GradingSystem, on_delete=models.CASCADE, related_name="primary_results"
    )

    term_report = models.ForeignKey(
        PrimaryTermReport,
        on_delete=models.CASCADE,
        related_name="subject_results",
        null=True,
        blank=True,
        help_text="Link to consolidated term report",
    )

    continuous_assessment_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(15)],
        verbose_name="Continuous Assessment (15 marks)",
    )
    take_home_test_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Take Home Test (5 marks)",
    )
    practical_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Practical (5 marks)",
    )
    appearance_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Appearance (5 marks)",
    )
    project_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Project (5 marks)",
    )
    note_copying_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Note Copying (5 marks)",
    )

    exam_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(60)],
        verbose_name="Examination (60 marks)",
    )

    ca_total = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="C.A Total (35 marks)"
    )
    total_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Total (100 marks)"
    )

    ca_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Continuous Assessment (%)",
    )
    exam_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Examination (%)",
    )
    total_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Total (%)",
    )

    grade = models.CharField(max_length=5, blank=True)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    is_passed = models.BooleanField(default=False)

    class_average = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Class Average"
    )
    highest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Highest Score in Class"
    )
    lowest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Lowest Score in Class"
    )
    subject_position = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Subject Position"
    )

    previous_term_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Previous Term Score"
    )
    cumulative_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name="Cumulative Score"
    )

    teacher_remark = models.TextField(blank=True, verbose_name="Teacher's Remark")
    class_teacher_remark = models.TextField(
        blank=True, verbose_name="Class Teacher's Remark"
    )
    head_teacher_remark = models.TextField(
        blank=True, verbose_name="Head Teacher's Remark"
    )

    class_teacher_signature_url = models.URLField(blank=True, null=True)
    head_teacher_signature_url = models.URLField(blank=True, null=True)
    principal_signature_url = models.URLField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    entered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="entered_primary_results",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_primary_results",
    )
    approved_date = models.DateTimeField(null=True, blank=True)

    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="published_primary_results",
    )
    published_date = models.DateTimeField(null=True, blank=True)
    last_edited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="edited_primary_results",
    )
    last_edited_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_primary_result"
        unique_together = ["student", "subject", "exam_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "exam_session"]),
            models.Index(fields=["subject", "exam_session"]),
            models.Index(fields=["status"]),
            models.Index(fields=["term_report"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} ({self.total_score})"

    def save(self, *args, **kwargs):
        self.calculate_scores()
        self.calculate_class_statistics()
        self.determine_grade()
        super().save(*args, **kwargs)
        self.update_term_report()

    def calculate_scores(self):
        """Calculate CA total, total score, and percentages"""
        self.ca_total = (
            self.continuous_assessment_score
            + self.take_home_test_score
            + self.practical_score
            + self.appearance_score
            + self.project_score
            + self.note_copying_score
        )

        self.total_score = self.ca_total + self.exam_score

        self.ca_percentage = (self.ca_total / 35) * 100 if self.ca_total > 0 else 0
        self.exam_percentage = (
            (self.exam_score / 60) * 100 if self.exam_score > 0 else 0
        )
        self.total_percentage = (
            (self.total_score / 100) * 100 if self.total_score > 0 else 0
        )

    def determine_grade(self):
        """Determine grade based on grading system"""
        try:
            grade_obj = self.grading_system.grades.filter(
                min_score__lte=self.total_percentage,
                max_score__gte=self.total_percentage,
            ).first()

            if grade_obj:
                self.grade = grade_obj.grade
                self.grade_point = grade_obj.grade_point
                self.is_passed = grade_obj.is_passing
            else:
                self.grade = "N/A"
                self.grade_point = None
                self.is_passed = False
        except Exception:
            self.grade = "N/A"
            self.grade_point = None
            self.is_passed = False

    def calculate_class_statistics(self):
        """Calculate class statistics for this subject"""
        from django.db.models import Avg, Max, Min

        class_results = self.__class__.objects.filter(
            subject=self.subject,
            exam_session=self.exam_session,
            student__student_class=self.student.student_class,
            status__in=["APPROVED", "PUBLISHED"],
        ).exclude(id=self.id)

        if class_results.exists():
            score_field = (
                "total_percentage"
                if hasattr(self, "total_percentage")
                else "total_score"
            )

            self.class_average = (
                class_results.aggregate(avg=Avg(score_field))["avg"] or 0
            )
            self.highest_in_class = (
                class_results.aggregate(max=Max(score_field))["max"] or 0
            )
            self.lowest_in_class = (
                class_results.aggregate(min=Min(score_field))["min"] or 0
            )

            all_scores = list(class_results.values_list(score_field, flat=True)) + [
                getattr(self, score_field)
            ]
            all_scores.sort(reverse=True)
            self.subject_position = all_scores.index(getattr(self, score_field)) + 1

    def update_term_report(self):
        """Update or create the consolidated term report"""
        term_report, created = PrimaryTermReport.objects.get_or_create(
            student=self.student,
            exam_session=self.exam_session,
            defaults={"status": "DRAFT"},
        )

        if not self.term_report:
            self.__class__.objects.filter(id=self.id).update(term_report=term_report.id)

        term_report.calculate_metrics()
        term_report.calculate_class_position()
        term_report.sync_status_with_subjects()

    @property
    def exam_marks(self):
        return self.exam_score

    @property
    def mark_obtained(self):
        return self.total_score

    @property
    def total_obtainable(self):
        return 100

    @property
    def position(self):
        if self.subject_position:
            suffix = (
                "st"
                if self.subject_position == 1
                else (
                    "nd"
                    if self.subject_position == 2
                    else "rd" if self.subject_position == 3 else "th"
                )
            )
            return f"{self.subject_position}{suffix}"
        return ""


# ============================================
# NURSERY MODELS
# ============================================


class NurseryTermReport(models.Model):
    """Consolidated nursery term report"""

    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    PHYSICAL_DEVELOPMENT_CHOICES = [
        ("Excellent", "Excellent"),
        ("Very Good", "Very Good"),
        ("Good", "Good"),
        ("Fair", "Fair"),
        ("Poor", "Poor"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="nursery_term_reports"
    )
    exam_session = models.ForeignKey(
        ExamSession, on_delete=models.CASCADE, related_name="nursery_term_reports"
    )

    total_subjects = models.PositiveIntegerField(default=0)
    total_max_marks = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        verbose_name="Total Maximum Marks Obtainable",
    )
    total_marks_obtained = models.DecimalField(
        max_digits=8, decimal_places=2, default=0, verbose_name="Total Marks Obtained"
    )
    overall_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Overall Percentage",
    )

    class_position = models.PositiveIntegerField(null=True, blank=True)
    total_students_in_class = models.PositiveIntegerField(default=0)

    times_school_opened = models.PositiveIntegerField(
        default=0, verbose_name="Number of Times School Opened"
    )
    times_student_present = models.PositiveIntegerField(
        default=0, verbose_name="Number of Times Student was Present"
    )

    physical_development = models.CharField(
        max_length=20,
        choices=PHYSICAL_DEVELOPMENT_CHOICES,
        blank=True,
        verbose_name="Physical Development",
    )
    health = models.CharField(
        max_length=20,
        choices=PHYSICAL_DEVELOPMENT_CHOICES,
        blank=True,
        verbose_name="Health",
    )
    cleanliness = models.CharField(
        max_length=20,
        choices=PHYSICAL_DEVELOPMENT_CHOICES,
        blank=True,
        verbose_name="Cleanliness",
    )
    general_conduct = models.CharField(
        max_length=20,
        choices=PHYSICAL_DEVELOPMENT_CHOICES,
        blank=True,
        verbose_name="General Conduct",
    )
    physical_development_comment = models.TextField(
        blank=True, verbose_name="Physical Development Comment"
    )

    height_beginning = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Height at Beginning (cm)",
    )
    height_end = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Height at End (cm)",
    )
    weight_beginning = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Weight at Beginning (kg)",
    )
    weight_end = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Weight at End (kg)",
    )

    next_term_begins = models.DateField(null=True, blank=True)

    class_teacher_remark = models.TextField(blank=True)
    head_teacher_remark = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    is_published = models.BooleanField(default=False)

    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="published_nursery_reports",
    )
    published_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_nursery_term_report"
        unique_together = ["student", "exam_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "exam_session"]),
            models.Index(fields=["status"]),
            models.Index(fields=["is_published"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.exam_session.name} Report"

    def calculate_metrics(self):
        """Calculate consolidated metrics from individual subject results"""
        from django.db.models import Sum, Count

        subject_results = NurseryResult.objects.filter(
            student=self.student,
            exam_session=self.exam_session,
            status__in=["APPROVED", "PUBLISHED"],
        )

        if subject_results.exists():
            totals = subject_results.aggregate(
                total_max=Sum("max_marks_obtainable"),
                total_obtained=Sum("mark_obtained"),
                subject_count=Count("id"),
            )

            self.total_subjects = totals["subject_count"] or 0
            self.total_max_marks = totals["total_max"] or 0
            self.total_marks_obtained = totals["total_obtained"] or 0

            if self.total_max_marks > 0:
                self.overall_percentage = (
                    self.total_marks_obtained / self.total_max_marks
                ) * 100
            else:
                self.overall_percentage = 0

        self.save()

    def calculate_class_position(self):
        """Calculate class position among peers"""
        same_class_reports = NurseryTermReport.objects.filter(
            exam_session=self.exam_session,
            student__student_class=self.student.student_class,
            student__education_level=self.student.education_level,
            status__in=["APPROVED", "PUBLISHED"],
        ).exclude(id=self.id)

        if same_class_reports.exists():
            higher_performers = same_class_reports.filter(
                overall_percentage__gt=self.overall_percentage
            ).count()

            self.class_position = higher_performers + 1
            self.total_students_in_class = same_class_reports.count() + 1
        else:
            self.class_position = 1
            self.total_students_in_class = 1

        self.save()

    def sync_status_with_subjects(self):
        """Sync term report status with individual subject results"""
        if self.status in ["APPROVED", "PUBLISHED"]:
            return

        subject_results = self.subject_results.all()

        if not subject_results.exists():
            self.status = "DRAFT"
            self.save()
            return

        statuses = subject_results.values_list("status", flat=True)

        if "DRAFT" in statuses:
            self.status = "DRAFT"
        else:
            self.status = "SUBMITTED"

        self.save()


class NurseryResult(models.Model):
    """Individual subject results for nursery students"""

    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="nursery_results"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="nursery_results"
    )
    exam_session = models.ForeignKey(
        ExamSession, on_delete=models.CASCADE, related_name="nursery_results"
    )
    grading_system = models.ForeignKey(
        GradingSystem, on_delete=models.CASCADE, related_name="nursery_results"
    )

    term_report = models.ForeignKey(
        NurseryTermReport,
        on_delete=models.CASCADE,
        related_name="subject_results",
        null=True,
        blank=True,
        help_text="Link to consolidated term report",
    )

    max_marks_obtainable = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Max Marks Obtainable",
    )
    mark_obtained = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Mark Obtained",
    )
    subject_position = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Position in Subject"
    )
    academic_comment = models.TextField(blank=True, verbose_name="Academic Comment")

    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Percentage",
    )

    grade = models.CharField(max_length=5, blank=True)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    is_passed = models.BooleanField(default=False)

    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    entered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="entered_nursery_results",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_nursery_results",
    )
    approved_date = models.DateTimeField(null=True, blank=True)

    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="published_nursery_results",
    )
    published_date = models.DateTimeField(null=True, blank=True)
    last_edited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="edited_nursery_results",
    )
    last_edited_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_nursery_result"
        unique_together = ["student", "subject", "exam_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "exam_session"]),
            models.Index(fields=["subject", "exam_session"]),
            models.Index(fields=["status"]),
            models.Index(fields=["term_report"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} ({self.mark_obtained})"

    def save(self, *args, **kwargs):
        self.calculate_percentage()
        self.calculate_class_statistics()
        self.determine_grade()
        super().save(*args, **kwargs)
        self.update_term_report()

    def calculate_percentage(self):
        """Calculate percentage based on marks obtained and max marks"""
        if self.max_marks_obtainable > 0:
            self.percentage = (self.mark_obtained / self.max_marks_obtainable) * 100
        else:
            self.percentage = 0

    def determine_grade(self):
        """Determine grade based on grading system"""
        try:
            grade_obj = self.grading_system.grades.filter(
                min_score__lte=self.percentage, max_score__gte=self.percentage
            ).first()

            if grade_obj:
                self.grade = grade_obj.grade
                self.grade_point = grade_obj.grade_point
                self.is_passed = grade_obj.is_passing
            else:
                self.grade = "N/A"
                self.grade_point = None
                self.is_passed = False
        except Exception:
            self.grade = "N/A"
            self.grade_point = None
            self.is_passed = False

    def calculate_class_statistics(self):
        """Calculate class statistics for this subject"""
        from django.db.models import Avg, Max, Min

        class_results = self.__class__.objects.filter(
            subject=self.subject,
            exam_session=self.exam_session,
            student__student_class=self.student.student_class,
            status__in=["APPROVED", "PUBLISHED"],
        ).exclude(id=self.id)

        if class_results.exists():
            self.class_average = (
                class_results.aggregate(avg=Avg("percentage"))["avg"] or 0
            )
            self.highest_in_class = (
                class_results.aggregate(max=Max("percentage"))["max"] or 0
            )
            self.lowest_in_class = (
                class_results.aggregate(min=Min("percentage"))["min"] or 0
            )

            all_percentages = list(
                class_results.values_list("percentage", flat=True)
            ) + [self.percentage]
            all_percentages.sort(reverse=True)
            self.subject_position = all_percentages.index(self.percentage) + 1

    def update_term_report(self):
        """Update or create the consolidated term report"""
        term_report, created = NurseryTermReport.objects.get_or_create(
            student=self.student,
            exam_session=self.exam_session,
            defaults={"status": "DRAFT"},
        )

        if not self.term_report:
            self.__class__.objects.filter(id=self.id).update(term_report=term_report.id)

        term_report.calculate_metrics()
        term_report.calculate_class_position()
        term_report.sync_status_with_subjects()


# ============================================
# ADDITIONAL MODELS (FROM DOCUMENT 2)
# ============================================


class AssessmentScore(models.Model):
    """Detailed assessment scores for different assessment types"""

    student_result = models.ForeignKey(
        StudentResult, on_delete=models.CASCADE, related_name="assessment_scores"
    )
    assessment_type = models.ForeignKey(
        AssessmentType, on_delete=models.CASCADE, related_name="scores"
    )
    score = models.DecimalField(
        max_digits=5, decimal_places=2, validators=[MinValueValidator(0)]
    )
    max_score = models.DecimalField(
        max_digits=5, decimal_places=2, validators=[MinValueValidator(0)]
    )
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    remarks = models.TextField(blank=True)
    date_assessed = models.DateField(default=timezone.now)

    class Meta:
        db_table = "results_assessment_score"
        unique_together = ["student_result", "assessment_type"]

    def __str__(self):
        return f"{self.student_result.student.full_name} - {self.assessment_type.name}: {self.score}"

    def save(self, *args, **kwargs):
        if self.max_score > 0:
            self.percentage = (self.score / self.max_score) * 100
        super().save(*args, **kwargs)


class ResultSheet(models.Model):
    """Class result sheet for an exam session"""

    SHEET_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam_session = models.ForeignKey(
        ExamSession, on_delete=models.CASCADE, related_name="result_sheets"
    )
    student_class = models.CharField(max_length=50, choices=CLASS_CHOICES)
    education_level = models.CharField(max_length=50, choices=EDUCATION_LEVEL_CHOICES)

    total_students = models.PositiveIntegerField(default=0)
    students_passed = models.PositiveIntegerField(default=0)
    students_failed = models.PositiveIntegerField(default=0)
    class_average = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    highest_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    lowest_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    status = models.CharField(max_length=20, choices=SHEET_STATUS, default="DRAFT")
    prepared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="prepared_sheets",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_sheets",
    )
    approved_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_result_sheet"
        unique_together = ["exam_session", "student_class", "education_level"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_student_class_display()} - {self.exam_session.name}"

    def calculate_statistics(self):
        """Calculate class statistics"""
        results = StudentResult.objects.filter(
            exam_session=self.exam_session,
            student__student_class=self.student_class,
            student__education_level=self.education_level,
            status="APPROVED",
        )

        if results.exists():
            self.total_students = results.count()
            self.students_passed = results.filter(is_passed=True).count()
            self.students_failed = self.total_students - self.students_passed

            scores = results.values_list("total_score", flat=True)
            if scores:
                self.class_average = sum(scores) / len(scores)
                self.highest_score = max(scores)
                self.lowest_score = min(scores)

        self.save()


class StudentTermResult(models.Model):
    """Consolidated term results for a student"""

    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="term_results"
    )
    academic_session = models.ForeignKey(
        AcademicSession, on_delete=models.CASCADE, related_name="student_term_results"
    )
    term = models.CharField(max_length=10, choices=ExamSession.TERMS)

    total_subjects = models.PositiveIntegerField(default=0)
    subjects_passed = models.PositiveIntegerField(default=0)
    subjects_failed = models.PositiveIntegerField(default=0)
    total_score = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    average_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    class_position = models.PositiveIntegerField(null=True, blank=True)
    total_students = models.PositiveIntegerField(
        default=0, verbose_name="Total Students in Class"
    )

    times_opened = models.PositiveIntegerField(
        default=0, verbose_name="Number of Times School Opened"
    )
    times_present = models.PositiveIntegerField(
        default=0, verbose_name="Number of Times Student was Present"
    )

    next_term_begins = models.DateField(null=True, blank=True)

    class_teacher_remark = models.TextField(blank=True)
    head_teacher_remark = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    is_published = models.BooleanField(default=False)

    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="published_term_results",
    )
    published_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_student_term_result"
        unique_together = ["student", "academic_session", "term"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.full_name} - {self.get_term_display()} {self.academic_session.name}"

    def calculate_metrics(self):
        """Calculate term performance metrics"""
        results = StudentResult.objects.filter(
            student=self.student,
            exam_session__academic_session=self.academic_session,
            exam_session__term=self.term,
            status="APPROVED",
        )

        if results.exists():
            self.total_subjects = results.count()
            self.subjects_passed = results.filter(is_passed=True).count()
            self.subjects_failed = self.total_subjects - self.subjects_passed

            self.total_score = sum(result.total_score for result in results)
            self.average_score = (
                self.total_score / self.total_subjects if self.total_subjects > 0 else 0
            )

            grade_points = [
                result.grade_point
                for result in results
                if result.grade_point is not None
            ]
            self.gpa = sum(grade_points) / len(grade_points) if grade_points else 0

        self.save()


class ResultComment(models.Model):
    """Comments on student results"""

    COMMENT_TYPES = [
        ("GENERAL", "General Comment"),
        ("SUBJECT", "Subject-specific Comment"),
        ("BEHAVIOR", "Behavioral Comment"),
        ("RECOMMENDATION", "Recommendation"),
    ]

    student_result = models.ForeignKey(
        StudentResult,
        on_delete=models.CASCADE,
        related_name="comments",
        null=True,
        blank=True,
    )
    term_result = models.ForeignKey(
        StudentTermResult,
        on_delete=models.CASCADE,
        related_name="comments",
        null=True,
        blank=True,
    )
    comment_type = models.CharField(max_length=20, choices=COMMENT_TYPES)
    comment = models.TextField()
    commented_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="result_comments",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "results_result_comment"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Comment by {self.commented_by.username} on {self.created_at}"


class ResultTemplate(models.Model):
    """Templates for result reports"""

    TEMPLATE_TYPES = [
        ("REPORT_CARD", "Report Card"),
        ("TRANSCRIPT", "Academic Transcript"),
        ("CERTIFICATE", "Certificate"),
        ("RESULT_SLIP", "Result Slip"),
    ]

    name = models.CharField(max_length=100, unique=True)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES)
    education_level = models.CharField(
        max_length=50, choices=EDUCATION_LEVEL_CHOICES, blank=True
    )
    template_content = models.TextField(help_text="HTML template content")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_result_template"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"


# ============================================
# SIGNAL HANDLERS FOR BULK RECALCULATION
# ============================================

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg, Max, Min


# Helper function to recalculate all statistics for a subject/class
def recalculate_subject_statistics(
    result_model, subject, exam_session, student_class, education_level
):
    """
    Recalculate positions and statistics for all students in a subject/class.
    This is the KEY function that fixes your issue.
    """
    # Get all results for this subject and class
    all_results = result_model.objects.filter(
        subject=subject,
        exam_session=exam_session,
        student__student_class=student_class,
        student__education_level=education_level,
        status__in=["APPROVED", "PUBLISHED"],
    ).order_by(
        "-total_score"
        if hasattr(result_model.objects.first() or result_model(), "total_score")
        else "-percentage"
    )

    if not all_results.exists():
        return

    # Determine the scoring field to use
    if hasattr(all_results.first(), "total_percentage"):
        score_field = "total_percentage"
    elif hasattr(all_results.first(), "percentage"):
        score_field = "percentage"
    else:
        score_field = "total_score"

    # Calculate class statistics
    stats = all_results.aggregate(
        avg=Avg(score_field),
        highest=Max(score_field),
        lowest=Min(score_field),
    )

    class_average = stats["avg"] or 0
    highest_in_class = stats["highest"] or 0
    lowest_in_class = stats["lowest"] or 0

    # Get all scores sorted in descending order
    all_scores = list(all_results.values_list(score_field, flat=True))
    all_scores.sort(reverse=True)

    # Update each result with correct position and statistics
    for result in all_results:
        score = getattr(result, score_field)
        position = all_scores.index(score) + 1

        # Update without triggering save signals
        result_model.objects.filter(id=result.id).update(
            subject_position=position,
            class_average=class_average,
            highest_in_class=highest_in_class,
            lowest_in_class=lowest_in_class,
        )


def recalculate_class_positions(
    report_model, exam_session, student_class, education_level
):
    """
    Recalculate class positions for all students in a class.
    """
    # Get all reports for this class
    all_reports = report_model.objects.filter(
        exam_session=exam_session,
        student__student_class=student_class,
        student__education_level=education_level,
        status__in=["APPROVED", "PUBLISHED"],
    ).order_by("-average_score")

    if not all_reports.exists():
        return

    # Get all scores sorted
    all_scores = list(all_reports.values_list("average_score", flat=True))
    all_scores.sort(reverse=True)

    total_students = len(all_scores)

    # Update each report with correct class position
    for report in all_reports:
        position = all_scores.index(report.average_score) + 1

        # Update without triggering save signals
        report_model.objects.filter(id=report.id).update(
            class_position=position,
            total_students=total_students,
        )


# SENIOR SECONDARY SIGNALS
@receiver(post_save, sender=SeniorSecondaryResult)
def recalculate_senior_secondary_on_save(sender, instance, created, **kwargs):
    """Recalculate ALL students when one result is saved/updated"""
    if instance.status in ["APPROVED", "PUBLISHED"]:
        # Recalculate subject statistics for ALL students in this subject/class
        recalculate_subject_statistics(
            SeniorSecondaryResult,
            instance.subject,
            instance.exam_session,
            instance.student.student_class,
            instance.student.education_level,
        )

        # Update or create term report
        term_report, _ = SeniorSecondaryTermReport.objects.get_or_create(
            student=instance.student,
            exam_session=instance.exam_session,
            defaults={"status": "DRAFT"},
        )

        # Link result to report
        if not instance.term_report:
            SeniorSecondaryResult.objects.filter(id=instance.id).update(
                term_report=term_report
            )

        # Recalculate term report
        term_report.calculate_metrics()

        # Recalculate class positions for ALL students
        recalculate_class_positions(
            SeniorSecondaryTermReport,
            instance.exam_session,
            instance.student.student_class,
            instance.student.education_level,
        )

        # Sync status
        term_report.sync_status_with_subjects()


@receiver(post_delete, sender=SeniorSecondaryResult)
def recalculate_senior_secondary_on_delete(sender, instance, **kwargs):
    """Recalculate ALL students when a result is deleted"""
    # Recalculate for remaining students
    recalculate_subject_statistics(
        SeniorSecondaryResult,
        instance.subject,
        instance.exam_session,
        instance.student.student_class,
        instance.student.education_level,
    )

    # Update term report if it exists
    try:
        if instance.term_report:
            instance.term_report.calculate_metrics()
            recalculate_class_positions(
                SeniorSecondaryTermReport,
                instance.exam_session,
                instance.student.student_class,
                instance.student.education_level,
            )
    except SeniorSecondaryTermReport.DoesNotExist:
        pass


@receiver(post_save, sender=SeniorSecondarySessionResult)
def recalculate_senior_session_on_save(sender, instance, created, **kwargs):
    """Recalculate session statistics for all students"""
    if instance.status in ["APPROVED", "PUBLISHED"]:
        # Recalculate subject statistics
        all_results = SeniorSecondarySessionResult.objects.filter(
            subject=instance.subject,
            academic_session=instance.academic_session,
            student__student_class=instance.student.student_class,
            status__in=["APPROVED", "PUBLISHED"],
        ).order_by("-average_for_year")

        if all_results.exists():
            stats = all_results.aggregate(
                avg=Avg("average_for_year"),
                highest=Max("average_for_year"),
                lowest=Min("average_for_year"),
            )

            all_scores = list(all_results.values_list("average_for_year", flat=True))
            all_scores.sort(reverse=True)

            for result in all_results:
                position = all_scores.index(result.average_for_year) + 1
                SeniorSecondarySessionResult.objects.filter(id=result.id).update(
                    subject_position=position,
                    class_average=stats["avg"] or 0,
                    highest_in_class=stats["highest"] or 0,
                    lowest_in_class=stats["lowest"] or 0,
                )

        # Update session report
        session_report, _ = SeniorSecondarySessionReport.objects.get_or_create(
            student=instance.student,
            academic_session=instance.academic_session,
            defaults={"status": "DRAFT"},
        )

        if not instance.session_report:
            SeniorSecondarySessionResult.objects.filter(id=instance.id).update(
                session_report=session_report
            )

        session_report.calculate_session_metrics()

        # Recalculate class positions
        all_reports = SeniorSecondarySessionReport.objects.filter(
            academic_session=instance.academic_session,
            student__student_class=instance.student.student_class,
            student__education_level=instance.student.education_level,
            status__in=["APPROVED", "PUBLISHED"],
        ).order_by("-average_for_year")

        if all_reports.exists():
            all_scores = list(all_reports.values_list("average_for_year", flat=True))
            all_scores.sort(reverse=True)
            total_students = len(all_scores)

            for report in all_reports:
                position = all_scores.index(report.average_for_year) + 1
                SeniorSecondarySessionReport.objects.filter(id=report.id).update(
                    class_position=position,
                    total_students=total_students,
                )


# JUNIOR SECONDARY SIGNALS
@receiver(post_save, sender=JuniorSecondaryResult)
def recalculate_junior_secondary_on_save(sender, instance, created, **kwargs):
    """Recalculate ALL students when one result is saved/updated"""
    if instance.status in ["APPROVED", "PUBLISHED"]:
        recalculate_subject_statistics(
            JuniorSecondaryResult,
            instance.subject,
            instance.exam_session,
            instance.student.student_class,
            instance.student.education_level,
        )

        term_report, _ = JuniorSecondaryTermReport.objects.get_or_create(
            student=instance.student,
            exam_session=instance.exam_session,
            defaults={"status": "DRAFT"},
        )

        if not instance.term_report:
            JuniorSecondaryResult.objects.filter(id=instance.id).update(
                term_report=term_report
            )

        term_report.calculate_metrics()

        recalculate_class_positions(
            JuniorSecondaryTermReport,
            instance.exam_session,
            instance.student.student_class,
            instance.student.education_level,
        )

        term_report.sync_status_with_subjects()


@receiver(post_delete, sender=JuniorSecondaryResult)
def recalculate_junior_secondary_on_delete(sender, instance, **kwargs):
    """Recalculate ALL students when a result is deleted"""
    recalculate_subject_statistics(
        JuniorSecondaryResult,
        instance.subject,
        instance.exam_session,
        instance.student.student_class,
        instance.student.education_level,
    )

    try:
        if instance.term_report:
            instance.term_report.calculate_metrics()
            recalculate_class_positions(
                JuniorSecondaryTermReport,
                instance.exam_session,
                instance.student.student_class,
                instance.student.education_level,
            )
    except JuniorSecondaryTermReport.DoesNotExist:
        pass


# PRIMARY SIGNALS
@receiver(post_save, sender=PrimaryResult)
def recalculate_primary_on_save(sender, instance, created, **kwargs):
    """Recalculate ALL students when one result is saved/updated"""
    if instance.status in ["APPROVED", "PUBLISHED"]:
        recalculate_subject_statistics(
            PrimaryResult,
            instance.subject,
            instance.exam_session,
            instance.student.student_class,
            instance.student.education_level,
        )

        term_report, _ = PrimaryTermReport.objects.get_or_create(
            student=instance.student,
            exam_session=instance.exam_session,
            defaults={"status": "DRAFT"},
        )

        if not instance.term_report:
            PrimaryResult.objects.filter(id=instance.id).update(term_report=term_report)

        term_report.calculate_metrics()

        recalculate_class_positions(
            PrimaryTermReport,
            instance.exam_session,
            instance.student.student_class,
            instance.student.education_level,
        )

        term_report.sync_status_with_subjects()


@receiver(post_delete, sender=PrimaryResult)
def recalculate_primary_on_delete(sender, instance, **kwargs):
    """Recalculate ALL students when a result is deleted"""
    recalculate_subject_statistics(
        PrimaryResult,
        instance.subject,
        instance.exam_session,
        instance.student.student_class,
        instance.student.education_level,
    )

    try:
        if instance.term_report:
            instance.term_report.calculate_metrics()
            recalculate_class_positions(
                PrimaryTermReport,
                instance.exam_session,
                instance.student.student_class,
                instance.student.education_level,
            )
    except PrimaryTermReport.DoesNotExist:
        pass


# NURSERY SIGNALS
@receiver(post_save, sender=NurseryResult)
def recalculate_nursery_on_save(sender, instance, created, **kwargs):
    """Recalculate ALL students when one result is saved/updated"""
    if instance.status in ["APPROVED", "PUBLISHED"]:
        # For nursery, recalculate positions
        all_results = NurseryResult.objects.filter(
            subject=instance.subject,
            exam_session=instance.exam_session,
            student__student_class=instance.student.student_class,
            student__education_level=instance.student.education_level,
            status__in=["APPROVED", "PUBLISHED"],
        ).order_by("-mark_obtained")

        if all_results.exists():
            all_scores = list(all_results.values_list("mark_obtained", flat=True))
            all_scores.sort(reverse=True)

            for result in all_results:
                position = all_scores.index(result.mark_obtained) + 1
                NurseryResult.objects.filter(id=result.id).update(
                    subject_position=position
                )

        term_report, _ = NurseryTermReport.objects.get_or_create(
            student=instance.student,
            exam_session=instance.exam_session,
            defaults={"status": "DRAFT"},
        )

        if not instance.term_report:
            NurseryResult.objects.filter(id=instance.id).update(term_report=term_report)

        term_report.calculate_metrics()

        recalculate_class_positions(
            NurseryTermReport,
            instance.exam_session,
            instance.student.student_class,
            instance.student.education_level,
        )

        term_report.sync_status_with_subjects()


@receiver(post_delete, sender=NurseryResult)
def recalculate_nursery_on_delete(sender, instance, **kwargs):
    """Recalculate ALL students when a result is deleted"""
    all_results = NurseryResult.objects.filter(
        subject=instance.subject,
        exam_session=instance.exam_session,
        student__student_class=instance.student.student_class,
        student__education_level=instance.student.education_level,
        status__in=["APPROVED", "PUBLISHED"],
    ).order_by("-mark_obtained")

    if all_results.exists():
        all_scores = list(all_results.values_list("mark_obtained", flat=True))
        all_scores.sort(reverse=True)

        for result in all_results:
            position = all_scores.index(result.mark_obtained) + 1
            NurseryResult.objects.filter(id=result.id).update(subject_position=position)

    try:
        if instance.term_report:
            instance.term_report.calculate_metrics()
            recalculate_class_positions(
                NurseryTermReport,
                instance.exam_session,
                instance.student.student_class,
                instance.student.education_level,
            )
    except NurseryTermReport.DoesNotExist:
        pass
