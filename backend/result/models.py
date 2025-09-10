# results/models.py
from django.db import models
from django.conf import settings  # Add this import
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from subject.models import Subject
from academics.models import AcademicSession
from django.utils import timezone
from decimal import Decimal
import uuid

from students.models import Student, CLASS_CHOICES, EDUCATION_LEVEL_CHOICES
from classroom.models import Stream


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
        max_length=20, 
        choices=EDUCATION_LEVEL_CHOICES,
        verbose_name="Education Level"
    )
    result_type = models.CharField(
        max_length=20,
        choices=RESULT_TYPE_CHOICES,
        verbose_name="Result Type"
    )
    name = models.CharField(
        max_length=100,
        verbose_name="Configuration Name"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    
    # Test/Assessment configurations
    test1_max_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=10,
        validators=[MinValueValidator(0)],
        verbose_name="Test 1 Max Score"
    )
    test2_max_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=10,
        validators=[MinValueValidator(0)],
        verbose_name="Test 2 Max Score"
    )
    test3_max_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=10,
        validators=[MinValueValidator(0)],
        verbose_name="Test 3 Max Score"
    )
    
    # CA components for Junior Secondary and Primary
    continuous_assessment_max_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=15,
        validators=[MinValueValidator(0)],
        verbose_name="Continuous Assessment Max Score"
    )
    take_home_test_max_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=5,
        validators=[MinValueValidator(0)],
        verbose_name="Take Home Test Max Score"
    )
    appearance_max_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=5,
        validators=[MinValueValidator(0)],
        verbose_name="Appearance Max Score"
    )
    practical_max_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=5,
        validators=[MinValueValidator(0)],
        verbose_name="Practical Max Score"
    )
    project_max_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=5,
        validators=[MinValueValidator(0)],
        verbose_name="Project Max Score"
    )
    note_copying_max_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=5,
        validators=[MinValueValidator(0)],
        verbose_name="Note Copying Max Score"
    )
    
    # Exam configuration
    exam_max_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=70,
        validators=[MinValueValidator(0)],
        verbose_name="Exam Max Score"
    )
    
    # Weight percentages
    ca_weight_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=40,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="CA Weight Percentage"
    )
    exam_weight_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=60,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Exam Weight Percentage"
    )
    
    # Total configuration
    total_max_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=100,
        validators=[MinValueValidator(0)],
        verbose_name="Total Max Score"
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name="Active")
    is_default = models.BooleanField(default=False, verbose_name="Default Configuration")
    
    # Tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_scoring_configs",
        verbose_name="Created By"
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
        # Only validate weight percentages for TERMLY result type and non-Nursery education levels
        if self.result_type == 'TERMLY' and self.education_level != 'NURSERY':
            if self.ca_weight_percentage + self.exam_weight_percentage != 100:
                raise ValidationError("CA and Exam weight percentages must sum to 100%")
            
            # Validate total max score matches sum of components for TERMLY
            if self.education_level in ["JUNIOR_SECONDARY", "PRIMARY"]:
                expected_total = (
                    self.continuous_assessment_max_score +
                    self.take_home_test_max_score +
                    self.appearance_max_score +
                    self.practical_max_score +
                    self.project_max_score +
                    self.note_copying_max_score +
                    self.exam_max_score
                )
            elif self.education_level == "SENIOR_SECONDARY":
                # For TERMLY result type, the total should be tests + exam
                expected_total = (
                    self.test1_max_score +
                    self.test2_max_score +
                    self.test3_max_score +
                    self.exam_max_score
                )
            elif self.education_level == "NURSERY":
                # For Nursery, the total is just the max mark obtainable
                expected_total = self.total_max_score
            
            if expected_total != self.total_max_score:
                raise ValidationError(f"Total max score must equal sum of components ({expected_total})")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    @property
    def ca_total_max_score(self):
        """Calculate total CA max score based on education level"""
        if self.education_level in ["JUNIOR_SECONDARY", "PRIMARY"]:
            return (
                self.continuous_assessment_max_score +
                self.take_home_test_max_score +
                self.appearance_max_score +
                self.practical_max_score +
                self.project_max_score +
                self.note_copying_max_score
            )
        else:  # SENIOR_SECONDARY
            return self.test1_max_score + self.test2_max_score + self.test3_max_score

class Grade(models.Model):
    """Individual grade definitions within a grading system"""

    grading_system = models.ForeignKey(
        GradingSystem, on_delete=models.CASCADE, related_name="grades"
    )
    grade = models.CharField(max_length=5)  # A+, A, B+, B, etc.
    min_score = models.DecimalField(max_digits=5, decimal_places=2)
    max_score = models.DecimalField(max_digits=5, decimal_places=2)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    description = models.CharField(max_length=100, blank=True)  # Excellent, Good, etc.
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
        help_text="Education level this assessment type applies to"
    )
    max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10,
        validators=[MinValueValidator(0)],
        help_text="Maximum score for this assessment type"
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
        help_text="Stream for Senior Secondary results (Science, Arts, Commercial, Technical)"
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
        # Calculate percentage
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

    # Statistics
    total_students = models.PositiveIntegerField(default=0)
    students_passed = models.PositiveIntegerField(default=0)
    students_failed = models.PositiveIntegerField(default=0)
    class_average = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    highest_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    lowest_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    # Status and tracking - FIXED: Using settings.AUTH_USER_MODEL instead of "auth.User"
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

            # Calculate averages
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

    # Performance metrics
    total_subjects = models.PositiveIntegerField(default=0)
    subjects_passed = models.PositiveIntegerField(default=0)
    subjects_failed = models.PositiveIntegerField(default=0)
    total_score = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    average_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    # Class position
    class_position = models.PositiveIntegerField(null=True, blank=True)
    total_students = models.PositiveIntegerField(default=0)

    # Status
    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    remarks = models.TextField(blank=True)

    # Next term resumption
    next_term_begins = models.DateField(null=True, blank=True)

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
        # Get all results for this student, session, and term
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

            # Calculate totals and averages
            self.total_score = sum(result.total_score for result in results)
            self.average_score = (
                self.total_score / self.total_subjects if self.total_subjects > 0 else 0
            )

            # Calculate GPA
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
        StudentResult, on_delete=models.CASCADE, related_name="comments", null=True, blank=True
    )
    term_result = models.ForeignKey(
        'StudentTermResult', on_delete=models.CASCADE, related_name="comments", null=True, blank=True
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
        help_text="Stream for Senior Secondary results (Science, Arts, Commercial, Technical)"
    )

    # Detailed test scores for Senior Secondary
    first_test_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        verbose_name="1st Test Score (10 marks)"
    )
    second_test_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        verbose_name="2nd Test Score (10 marks)"
    )
    third_test_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        verbose_name="3rd Test Score (10 marks)"
    )
    exam_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(70)],
        verbose_name="Examination Score (70 marks)"
    )

    # Calculated scores
    total_ca_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Total CA Score (30 marks)"
    )
    total_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Total Score (100 marks)"
    )
    percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    # Grade information
    grade = models.CharField(max_length=5, blank=True)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    is_passed = models.BooleanField(default=False)

    # Class statistics
    class_average = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Class Average"
    )
    highest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Highest Score in Class"
    )
    lowest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Lowest Score in Class"
    )
    subject_position = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Position in Subject"
    )

    # Teacher remarks
    teacher_remark = models.TextField(blank=True, verbose_name="Teacher's Remark")

    # Status and tracking
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

    # Publishing and editing metadata
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
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} ({self.total_score})"

    def save(self, *args, **kwargs):
        # Calculate scores
        self.calculate_scores()
        # Determine grade
        self.determine_grade()
        # Calculate class statistics
        self.calculate_class_statistics()
        super().save(*args, **kwargs)

    def calculate_scores(self):
        """Calculate total CA score, total score, and percentage"""
        # Calculate total CA score (sum of all tests)
        self.total_ca_score = (
            self.first_test_score + 
            self.second_test_score + 
            self.third_test_score
        )
        
        # Calculate total score (CA + Exam)
        self.total_score = self.total_ca_score + self.exam_score
        
        # Calculate percentage
        if self.grading_system.max_score > 0:
            self.percentage = (self.total_score / self.grading_system.max_score) * 100
        else:
            self.percentage = 0

    def determine_grade(self):
        """Determine grade based on grading system"""
        try:
            grade_obj = self.grading_system.grades.filter(
                min_score__lte=self.total_score,
                max_score__gte=self.total_score
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
        
        # Get all results for this subject and exam session in the same class
        class_results = SeniorSecondaryResult.objects.filter(
            subject=self.subject,
            exam_session=self.exam_session,
            student__student_class=self.student.student_class,
            status__in=['APPROVED', 'PUBLISHED']
        ).exclude(id=self.id)  # Exclude current result
        
        if class_results.exists():
            # Calculate statistics
            self.class_average = class_results.aggregate(avg=Avg('total_score'))['avg'] or 0
            self.highest_in_class = class_results.aggregate(max=Max('total_score'))['max'] or 0
            self.lowest_in_class = class_results.aggregate(min=Min('total_score'))['min'] or 0
            
            # Calculate position
            all_scores = list(class_results.values_list('total_score', flat=True)) + [self.total_score]
            all_scores.sort(reverse=True)
            self.subject_position = all_scores.index(self.total_score) + 1


class SeniorSecondarySessionResult(models.Model):
    """Senior Secondary session result with Termly Accumulative Average (TAA)"""
    
    RESULT_STATUS = [
        ("DRAFT", "Draft"),
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
        related_name="senior_session_results"
    )

    # Term scores
    first_term_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="1st Term Total Score"
    )
    second_term_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="2nd Term Total Score"
    )
    third_term_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="3rd Term Total Score"
    )

    # TAA calculations
    average_for_year = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Average for the Year"
    )
    obtainable = models.DecimalField(
        max_digits=5, decimal_places=2, default=300,
        verbose_name="Total Obtainable (300 marks)"
    )
    obtained = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Total Obtained"
    )

    # Class statistics
    class_average = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Class Average"
    )
    highest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Highest Score in Class"
    )
    lowest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Lowest Score in Class"
    )
    subject_position = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Position in Subject"
    )

    # Teacher remarks
    teacher_remark = models.TextField(blank=True, verbose_name="Teacher's Remark")

    # Status
    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_senior_secondary_session_result"
        unique_together = ["student", "subject", "academic_session"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} Session Result"

    def save(self, *args, **kwargs):
        # Calculate TAA
        self.calculate_taa()
        # Calculate class statistics
        self.calculate_class_statistics()
        super().save(*args, **kwargs)

    def calculate_taa(self):
        """Calculate Termly Accumulative Average"""
        # Calculate total obtained
        self.obtained = (
            self.first_term_score + 
            self.second_term_score + 
            self.third_term_score
        )
        
        # Calculate average for the year
        if self.obtainable > 0:
            self.average_for_year = (self.obtained / self.obtainable) * 100
        else:
            self.average_for_year = 0

    def calculate_class_statistics(self):
        """Calculate class statistics for this subject session result"""
        from django.db.models import Avg, Max, Min
        
        # Get all session results for this subject and academic session in the same class
        class_results = SeniorSecondarySessionResult.objects.filter(
            subject=self.subject,
            academic_session=self.academic_session,
            student__student_class=self.student.student_class,
            status__in=['APPROVED', 'PUBLISHED']
        ).exclude(id=self.id)
        
        if class_results.exists():
            # Calculate statistics
            self.class_average = class_results.aggregate(avg=Avg('average_for_year'))['avg'] or 0
            self.highest_in_class = class_results.aggregate(max=Max('average_for_year'))['max'] or 0
            self.lowest_in_class = class_results.aggregate(min=Min('average_for_year'))['min'] or 0
            
            # Calculate position
            all_scores = list(class_results.values_list('average_for_year', flat=True)) + [self.average_for_year]
            all_scores.sort(reverse=True)
            self.subject_position = all_scores.index(self.average_for_year) + 1



    def get_default_for_level(cls, education_level):
        """Get the default configuration for a specific education level"""
        return cls.objects.filter(
            education_level=education_level,
            is_default=True,
            is_active=True
        ).first()


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


    # Continuous Assessment Breakdown (Total 40%)
    continuous_assessment_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(15)],
        verbose_name="Continuous Assessment (15 marks)"
    )
    take_home_test_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Take Home Test (5 marks)"
    )
    practical_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Practical (5 marks)"
    )
    project_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Project (5 marks)"
    )
    note_copying_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Note Copying (5 marks)"
    )

    # Exam Score (60%)
    exam_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(60)],
        verbose_name="Examination (60 marks)"
    )

    # Calculated scores
    ca_total = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="C.A Total (35 marks)"
    )
    total_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Total (100 marks)"
    )

    # Percentages
    ca_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Continuous Assessment (%)"
    )
    exam_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Examination (%)"
    )
    total_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Total (%)"
    )

    # Grade information
    grade = models.CharField(max_length=5, blank=True)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    is_passed = models.BooleanField(default=False)

    # Class statistics
    class_average = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Class Average"
    )
    highest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Highest Score in Class"
    )
    lowest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Lowest Score in Class"
    )
    subject_position = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Subject Position"
    )

    # Previous term and cumulative
    previous_term_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Previous Term Score"
    )
    cumulative_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Cumulative Score"
    )

    # Teacher remarks
    teacher_remark = models.TextField(blank=True, verbose_name="Teacher's Remark")

    # Status and tracking
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

    # Publishing and editing metadata
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
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} ({self.total_score})"

    def save(self, *args, **kwargs):
        # Calculate scores
        self.calculate_scores()
        # Determine grade
        self.determine_grade()
        # Calculate class statistics
        self.calculate_class_statistics()
        super().save(*args, **kwargs)

    def calculate_scores(self):
        """Calculate CA total, total score, and percentages"""
        # Calculate CA total (sum of all CA components)
        self.ca_total = (
            self.continuous_assessment_score + 
            self.take_home_test_score + 
            self.practical_score + 
            self.project_score + 
            self.note_copying_score
        )
        
        # Calculate total score (CA + Exam)
        self.total_score = self.ca_total + self.exam_score
        
        # Calculate percentages
        self.ca_percentage = (self.ca_total / 35) * 100 if self.ca_total > 0 else 0
        self.exam_percentage = (self.exam_score / 60) * 100 if self.exam_score > 0 else 0
        self.total_percentage = (self.total_score / 100) * 100 if self.total_score > 0 else 0

    def determine_grade(self):
        """Determine grade based on grading system"""
        try:
            grade_obj = self.grading_system.grades.filter(
                min_score__lte=self.total_percentage,
                max_score__gte=self.total_percentage
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
        
        # Get all results for this subject and exam session in the same class
        class_results = JuniorSecondaryResult.objects.filter(
            subject=self.subject,
            exam_session=self.exam_session,
            student__student_class=self.student.student_class,
            status__in=['APPROVED', 'PUBLISHED']
        ).exclude(id=self.id)  # Exclude current result
        
        if class_results.exists():
            # Calculate statistics
            self.class_average = class_results.aggregate(avg=Avg('total_percentage'))['avg'] or 0
            self.highest_in_class = class_results.aggregate(max=Max('total_percentage'))['max'] or 0
            self.lowest_in_class = class_results.aggregate(min=Min('total_percentage'))['min'] or 0
            
            # Calculate position
            all_scores = list(class_results.values_list('total_percentage', flat=True)) + [self.total_percentage]
            all_scores.sort(reverse=True)
            self.subject_position = all_scores.index(self.total_percentage) + 1


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


    # Continuous Assessment Breakdown (Total 40%)
    continuous_assessment_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(15)],
        verbose_name="Continuous Assessment (15 marks)"
    )
    take_home_test_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Take Home Test (5 marks)"
    )
    practical_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Practical (5 marks)"
    )
    project_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Project (5 marks)"
    )
    note_copying_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Note Copying (5 marks)"
    )

    # Exam Score (60%)
    exam_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(60)],
        verbose_name="Examination (60 marks)"
    )

    # Calculated scores
    ca_total = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="C.A Total (35 marks)"
    )
    total_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Total (100 marks)"
    )

    # Percentages
    ca_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Continuous Assessment (%)"
    )
    exam_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Examination (%)"
    )
    total_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Total (%)"
    )

    # Grade information
    grade = models.CharField(max_length=5, blank=True)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    is_passed = models.BooleanField(default=False)

    # Class statistics
    class_average = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Class Average"
    )
    highest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Highest Score in Class"
    )
    lowest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Lowest Score in Class"
    )
    subject_position = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Subject Position"
    )

    # Previous term and cumulative
    previous_term_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Previous Term Score"
    )
    cumulative_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Cumulative Score"
    )

    # Teacher remarks
    teacher_remark = models.TextField(blank=True, verbose_name="Teacher's Remark")

    # Status and tracking
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

    # Publishing and editing metadata
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
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} ({self.total_score})"

    def save(self, *args, **kwargs):
        # Calculate scores
        self.calculate_scores()
        # Determine grade
        self.determine_grade()
        # Calculate class statistics
        self.calculate_class_statistics()
        super().save(*args, **kwargs)

    def calculate_scores(self):
        """Calculate CA total, total score, and percentages"""
        # Calculate CA total (sum of all CA components)
        self.ca_total = (
            self.continuous_assessment_score + 
            self.take_home_test_score + 
            self.practical_score + 
            self.project_score + 
            self.note_copying_score
        )
        
        # Calculate total score (CA + Exam)
        self.total_score = self.ca_total + self.exam_score
        
        # Calculate percentages
        self.ca_percentage = (self.ca_total / 35) * 100 if self.ca_total > 0 else 0
        self.exam_percentage = (self.exam_score / 60) * 100 if self.exam_score > 0 else 0
        self.total_percentage = (self.total_score / 100) * 100 if self.total_score > 0 else 0

    def determine_grade(self):
        """Determine grade based on grading system"""
        try:
            grade_obj = self.grading_system.grades.filter(
                min_score__lte=self.total_percentage,
                max_score__gte=self.total_percentage
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
        
        # Get all results for this subject and exam session in the same class
        class_results = PrimaryResult.objects.filter(
            subject=self.subject,
            exam_session=self.exam_session,
            student__student_class=self.student.student_class,
            status__in=['APPROVED', 'PUBLISHED']
        ).exclude(id=self.id)  # Exclude current result
        
        if class_results.exists():
            # Calculate statistics
            self.class_average = class_results.aggregate(avg=Avg('total_percentage'))['avg'] or 0
            self.highest_in_class = class_results.aggregate(max=Max('total_percentage'))['max'] or 0
            self.lowest_in_class = class_results.aggregate(min=Min('total_percentage'))['min'] or 0
            
            # Calculate position
            all_scores = list(class_results.values_list('total_percentage', flat=True)) + [self.total_percentage]
            all_scores.sort(reverse=True)
            self.subject_position = all_scores.index(self.total_percentage) + 1


class NurseryResult(models.Model):
    """Nursery School specific result model with academic performance and physical development"""
    
    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    PHYSICAL_DEVELOPMENT_CHOICES = [
        ("EXCELLENT", "Excellent"),
        ("VERY_GOOD", "Very Good"),
        ("GOOD", "Good"),
        ("FAIR", "Fair"),
        ("POOR", "Poor"),
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


    # Academic Performance
    max_marks_obtainable = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Max Marks Obtainable"
    )
    mark_obtained = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Mark Obtained"
    )
    position = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Position"
    )
    academic_comment = models.TextField(
        blank=True,
        verbose_name="Academic Comment"
    )

    # Physical Development / Special Reports
    physical_development = models.CharField(
        max_length=20,
        choices=PHYSICAL_DEVELOPMENT_CHOICES,
        blank=True,
        verbose_name="Physical Development"
    )
    health = models.CharField(
        max_length=20,
        choices=PHYSICAL_DEVELOPMENT_CHOICES,
        blank=True,
        verbose_name="Health"
    )
    cleanliness = models.CharField(
        max_length=20,
        choices=PHYSICAL_DEVELOPMENT_CHOICES,
        blank=True,
        verbose_name="Cleanliness"
    )
    general_conduct = models.CharField(
        max_length=20,
        choices=PHYSICAL_DEVELOPMENT_CHOICES,
        blank=True,
        verbose_name="General Conduct"
    )
    physical_development_comment = models.TextField(
        blank=True,
        verbose_name="Physical Development Comment"
    )

    # Calculated scores
    percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Percentage"
    )

    # Grade information
    grade = models.CharField(max_length=5, blank=True)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    is_passed = models.BooleanField(default=False)

    # Status and tracking
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

    # Publishing and editing metadata
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
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} ({self.mark_obtained})"

    def save(self, *args, **kwargs):
        # Calculate percentage
        self.calculate_percentage()
        # Determine grade
        self.determine_grade()
        super().save(*args, **kwargs)

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
                min_score__lte=self.percentage,
                max_score__gte=self.percentage
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
