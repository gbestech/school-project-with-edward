from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError


# Subject categories for better organization
SUBJECT_CATEGORY_CHOICES = [
    ("core", "Core Subject"),
    ("elective", "Elective Subject"),
    ("vocational", "Vocational Subject"),
    ("extra_curricular", "Extra-Curricular"),
    ("language", "Language"),
    ("science", "Science"),
    ("mathematics", "Maths"),
    ("social_studies", "Social Studies"),
    ("arts", "Arts"),
    ("physical_education", "Physical Education"),
    ("religious_studies", "Religious Studies"),
    ("computer_science", "Computer Science"),
]

# School levels
EDUCATION_LEVELS = [
    ("NURSERY", "Nursery"),
    ("PRIMARY", "Primary"),
    ("SECONDARY", "Secondary"),
]


class Subject(models.Model):
    """Enhanced Subject model with better integration and functionality"""

    name = models.CharField(max_length=100)
    code = models.CharField(
        max_length=10,
        unique=True,
        help_text="Unique subject code (e.g., MATH101, ENG201)",
    )
    description = models.TextField(
        blank=True, help_text="Brief description of the subject"
    )

    # Category and classification
    category = models.CharField(
        max_length=20,
        choices=SUBJECT_CATEGORY_CHOICES,
        default="core",
        help_text="Subject category for organization",
    )

    # Integration with GradeLevel model
    grade_levels = models.ManyToManyField(
        "classroom.GradeLevel",  # Specify the app name
        related_name="subjects",
        help_text="Grade levels where this subject is taught",
    )

    # Education level compatibility
    education_levels = models.JSONField(
        default=list,
        help_text="Education levels this subject applies to (NURSERY, PRIMARY, SECONDARY)",
    )

    # Academic configuration
    credit_hours = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Number of credit hours for this subject",
    )

    # Subject requirements and classification
    is_compulsory = models.BooleanField(
        default=True, help_text="Is this subject mandatory for students?"
    )
    is_core = models.BooleanField(
        default=False, help_text="Core subject for all students (legacy compatibility)"
    )

    # Prerequisites
    prerequisites = models.ManyToManyField(
        "self",
        blank=True,
        symmetrical=False,
        related_name="unlocks_subjects",
        help_text="Subjects required before taking this subject",
    )

    # Grading and assessment
    has_continuous_assessment = models.BooleanField(
        default=True, help_text="Does this subject have continuous assessment?"
    )
    has_final_exam = models.BooleanField(
        default=True, help_text="Does this subject have a final examination?"
    )
    pass_mark = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Minimum pass mark percentage",
    )

    # Practical components
    has_practical = models.BooleanField(
        default=False, help_text="Does this subject have practical components?"
    )
    practical_hours = models.PositiveIntegerField(
        default=0, help_text="Number of practical hours per week"
    )

    # Resource requirements
    requires_lab = models.BooleanField(
        default=False, help_text="Does this subject require laboratory facilities?"
    )
    requires_special_equipment = models.BooleanField(
        default=False, help_text="Does this subject require special equipment?"
    )
    equipment_notes = models.TextField(
        blank=True, help_text="Notes about required equipment or facilities"
    )

    # Status and metadata
    is_active = models.BooleanField(
        default=True, help_text="Is this subject currently being offered?"
    )
    is_discontinued = models.BooleanField(
        default=False,
        help_text="Is this subject discontinued but kept for historical records?",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Academic year tracking
    introduced_year = models.PositiveIntegerField(
        null=True, blank=True, help_text="Year this subject was introduced"
    )

    class Meta:
        ordering = ["category", "name"]
        verbose_name = "Subject"
        verbose_name_plural = "Subjects"
        indexes = [
            models.Index(fields=["category", "is_active"]),
            models.Index(fields=["is_compulsory", "is_active"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"

    def clean(self):
        """Enhanced validation"""
        errors = {}

        # Validate practical hours if has_practical is True
        if self.has_practical and self.practical_hours == 0:
            errors["practical_hours"] = (
                "Practical hours must be greater than 0 when subject has practical components."
            )

        # Validate equipment notes if requires special equipment
        if self.requires_special_equipment and not self.equipment_notes:
            errors["equipment_notes"] = (
                "Equipment notes are required when subject requires special equipment."
            )

        # Validate education levels format
        if self.education_levels:
            valid_levels = [choice[0] for choice in EDUCATION_LEVELS]
            for level in self.education_levels:
                if level not in valid_levels:
                    errors["education_levels"] = (
                        f"Invalid education level: {level}. Must be one of {valid_levels}"
                    )
                    break

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        # Sync is_core with is_compulsory for backward compatibility
        if self.is_core and not self.is_compulsory:
            self.is_compulsory = True
        super().save(*args, **kwargs)

    # Property methods
    @property
    def total_weekly_hours(self):
        """Calculate total weekly hours including practical"""
        return self.credit_hours + self.practical_hours

    @property
    def grade_range_display(self):
        """Returns a formatted string of applicable grades"""
        grade_levels = self.grade_levels.all().order_by("order")
        if not grade_levels:
            return "No grades assigned"

        if grade_levels.count() == 1:
            return grade_levels.first().name

        return f"{grade_levels.first().name} - {grade_levels.last().name}"

    @property
    def education_levels_display(self):
        """Returns formatted education levels"""
        if not self.education_levels:
            return "All levels"
        return ", ".join(
            [
                dict(EDUCATION_LEVELS).get(level, level)
                for level in self.education_levels
            ]
        )

    # Query methods
    def is_available_for_grade_level(self, grade_level):
        """Check if subject is available for a specific grade level"""
        return (
            self.grade_levels.filter(id=grade_level.id).exists()
            and self.is_active
            and not self.is_discontinued
        )

    def is_available_for_education_level(self, education_level):
        """Check if subject is available for a specific education level"""
        return (
            (not self.education_levels or education_level in self.education_levels)
            and self.is_active
            and not self.is_discontinued
        )

    def get_prerequisite_subjects(self):
        """Get all prerequisite subjects"""
        return self.prerequisites.filter(is_active=True)

    def get_dependent_subjects(self):
        """Get subjects that depend on this subject"""
        return self.unlocks_subjects.filter(is_active=True)

    def has_prerequisites_met(self, student_subjects):
        """Check if student has met prerequisites for this subject"""
        prerequisites = self.get_prerequisite_subjects()
        if not prerequisites.exists():
            return True

        student_subject_ids = set(student_subjects.values_list("id", flat=True))
        prerequisite_ids = set(prerequisites.values_list("id", flat=True))

        return prerequisite_ids.issubset(student_subject_ids)

    # Display methods
    def get_category_display_with_icon(self):
        """Returns category with appropriate icon for UI display"""
        icons = {
            "core": "📚",
            "elective": "🎯",
            "vocational": "🔧",
            "extra_curricular": "🎭",
            "language": "🗣️",
            "science": "🔬",
            "mathematics": "🧮",
            "social_studies": "🌍",
            "arts": "🎨",
            "physical_education": "⚽",
            "religious_studies": "🙏",
            "computer_science": "💻",
        }
        return f"{icons.get(self.category, '📖')} {self.get_category_display()}"

    # Class methods
    @classmethod
    def get_core_subjects(cls):
        """Get all core/compulsory subjects"""
        return cls.objects.filter(is_compulsory=True, is_active=True)

    @classmethod
    def get_elective_subjects(cls):
        """Get all elective subjects"""
        return cls.objects.filter(is_compulsory=False, is_active=True)

    @classmethod
    def get_subjects_by_category(cls, category):
        """Get subjects by category"""
        return cls.objects.filter(category=category, is_active=True)

    @classmethod
    def get_subjects_for_grade_level(cls, grade_level):
        """Get all subjects available for a specific grade level"""
        return cls.objects.filter(
            grade_levels=grade_level, is_active=True, is_discontinued=False
        )

    @classmethod
    def get_subjects_requiring_lab(cls):
        """Get subjects that require laboratory facilities"""
        return cls.objects.filter(requires_lab=True, is_active=True)
