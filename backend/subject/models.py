from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


# Updated subject categories to match your school structure
SUBJECT_CATEGORY_CHOICES = [
    ("core", "Core Subject"),
    ("elective", "Elective Subject"),
    ("cross_cutting", "Cross Cutting Subject"),
    ("core_science", "Core Science"),
    ("core_art", "Core Art"),
    ("core_humanities", "Core Humanities"),
    ("vocational", "Vocational/Pre-vocational"),
    ("creative_arts", "Cultural & Creative Arts"),
    ("religious", "Religious Studies"),
    ("physical", "Physical & Health Education"),
    ("language", "Language"),
    ("practical", "Practical/Skills"),
    ("nursery_activities", "Nursery Activities"),
]

# Education levels matching your school structure
EDUCATION_LEVELS = [
    ("NURSERY", "Nursery"),
    ("PRIMARY", "Primary"),
    ("JUNIOR_SECONDARY", "Junior Secondary"),
    ("SENIOR_SECONDARY", "Senior Secondary"),
]

# Nursery sub-levels
NURSERY_LEVELS = [
    ("PRE_NURSERY", "Pre-Nursery"),
    ("NURSERY_1", "Nursery 1"),
    ("NURSERY_2", "Nursery 2"),
]

# Subject classification for Senior Secondary
SS_SUBJECT_TYPES = [
    ("cross_cutting", "Cross Cutting"),
    ("core_science", "Core Science"),
    ("core_art", "Core Art"),
    ("core_humanities", "Core Humanities"),
    ("elective", "Elective"),
]


class Subject(models.Model):
    """Enhanced Subject model aligned with Nigerian educational structure"""

    name = models.CharField(
        max_length=100,
        help_text="Full subject name (e.g., 'Basic Science and Technology')",
    )

    short_name = models.CharField(
        max_length=50,
        blank=True,
        help_text="Abbreviated name for display (e.g., 'Basic Science')",
    )

    code = models.CharField(
        max_length=15,
        unique=True,
        help_text="Unique subject code (e.g., MATH-NUR, ENG-PRI, PHY-SS)",
    )

    description = models.TextField(
        blank=True, help_text="Brief description of the subject content and objectives"
    )

    # Category and classification
    category = models.CharField(
        max_length=25,
        choices=SUBJECT_CATEGORY_CHOICES,
        default="core",
        help_text="Subject category for organization",
    )

    # Education level compatibility - Updated for your structure
    education_levels = models.JSONField(
        default=list,
        help_text="Education levels this subject applies to (NURSERY, PRIMARY, JUNIOR_SECONDARY, SENIOR_SECONDARY)",
    )

    # Nursery specific levels
    nursery_levels = models.JSONField(
        default=list,
        blank=True,
        help_text="Specific nursery levels (PRE_NURSERY, NURSERY_1, NURSERY_2)",
    )

    # Senior Secondary classification
    ss_subject_type = models.CharField(
        max_length=20,
        choices=SS_SUBJECT_TYPES,
        blank=True,
        null=True,
        help_text="Classification for Senior Secondary subjects",
    )

    # Integration with GradeLevel model
    grade_levels = models.ManyToManyField(
        "classroom.GradeLevel",
        related_name="subjects",
        blank=True,
        help_text="Specific grade levels where this subject is taught",
    )

    # Academic configuration
    credit_hours = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Number of credit hours per week",
    )

    # Subject requirements and classification
    is_compulsory = models.BooleanField(
        default=True, help_text="Is this subject mandatory for students?"
    )

    is_core = models.BooleanField(
        default=False, help_text="Core subject for all students"
    )

    # New field for cross-cutting subjects in SS
    is_cross_cutting = models.BooleanField(
        default=False, help_text="Cross-cutting subject required for all SS students"
    )

    # Prerequisites and progression
    prerequisites = models.ManyToManyField(
        "self",
        blank=True,
        symmetrical=False,
        related_name="unlocks_subjects",
        help_text="Subjects required before taking this subject",
    )

    # Assessment configuration
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

    # Practical and activity components
    has_practical = models.BooleanField(
        default=False, help_text="Does this subject have practical components?"
    )

    practical_hours = models.PositiveIntegerField(
        default=0, help_text="Number of practical hours per week"
    )

    # Special for nursery activities
    is_activity_based = models.BooleanField(
        default=False, help_text="Activity-based subject (for nursery level)"
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

    # Teaching requirements
    requires_specialist_teacher = models.BooleanField(
        default=False, help_text="Requires a subject specialist teacher"
    )

    # Status and metadata
    is_active = models.BooleanField(
        default=True, help_text="Is this subject currently being offered?"
    )

    is_discontinued = models.BooleanField(
        default=False,
        help_text="Is this subject discontinued but kept for historical records?",
    )

    # Academic tracking
    introduced_year = models.PositiveIntegerField(
        null=True, blank=True, help_text="Year this subject was introduced"
    )

    curriculum_version = models.CharField(
        max_length=20,
        blank=True,
        help_text="Curriculum version (e.g., '2022 Curriculum')",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # New fields for better organization
    subject_order = models.PositiveIntegerField(
        default=0, help_text="Order for displaying subjects within a category"
    )

    # Learning outcomes
    learning_outcomes = models.TextField(
        blank=True, help_text="Key learning outcomes for this subject"
    )

    class Meta:
        ordering = ["education_levels", "category", "subject_order", "name"]
        verbose_name = "Subject"
        verbose_name_plural = "Subjects"
        indexes = [
            models.Index(fields=["category", "is_active"]),
            models.Index(fields=["is_compulsory", "is_active"]),
            models.Index(fields=["education_levels"]),
            models.Index(fields=["ss_subject_type"]),
            models.Index(fields=["is_cross_cutting"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["name", "education_levels"],
                name="unique_subject_per_education_level",
            )
        ]

    def __str__(self):
        display_name = self.short_name or self.name
        education_display = self.education_levels_display
        return f"{display_name} ({education_display})"

    def clean(self):
        """Enhanced validation for the Nigerian education system"""
        errors = {}

        # Validate practical hours
        if self.has_practical and self.practical_hours == 0:
            errors["practical_hours"] = (
                "Practical hours must be greater than 0 when subject has practical components."
            )

        # Validate equipment notes
        if self.requires_special_equipment and not self.equipment_notes:
            errors["equipment_notes"] = (
                "Equipment notes are required when subject requires special equipment."
            )

        # Validate education levels
        if self.education_levels:
            valid_levels = [choice[0] for choice in EDUCATION_LEVELS]
            for level in self.education_levels:
                if level not in valid_levels:
                    errors["education_levels"] = (
                        f"Invalid education level: {level}. Must be one of {valid_levels}"
                    )
                    break

        # Validate nursery levels
        if self.nursery_levels:
            valid_nursery_levels = [choice[0] for choice in NURSERY_LEVELS]
            for level in self.nursery_levels:
                if level not in valid_nursery_levels:
                    errors["nursery_levels"] = (
                        f"Invalid nursery level: {level}. Must be one of {valid_nursery_levels}"
                    )
                    break

        # Validate Senior Secondary subject type
        if (
            "SENIOR_SECONDARY" in (self.education_levels or [])
            and not self.ss_subject_type
        ):
            errors["ss_subject_type"] = (
                "Senior Secondary subjects must have a subject type classification."
            )

        # Cross-cutting subjects validation
        if self.is_cross_cutting and "SENIOR_SECONDARY" not in (
            self.education_levels or []
        ):
            errors["is_cross_cutting"] = (
                "Cross-cutting subjects can only be applied to Senior Secondary level."
            )

        # Activity-based validation for nursery
        if self.is_activity_based and "NURSERY" not in (self.education_levels or []):
            errors["is_activity_based"] = (
                "Activity-based subjects can only be applied to Nursery level."
            )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        # Auto-generate short name if not provided
        if not self.short_name:
            self.short_name = self.name

        # Auto-set cross cutting for certain subjects in SS
        if "SENIOR_SECONDARY" in (self.education_levels or []):
            cross_cutting_subjects = ["Mathematics", "English", "Civic Education"]
            if any(
                subject.lower() in self.name.lower()
                for subject in cross_cutting_subjects
            ):
                self.is_cross_cutting = True

        # Sync is_core with is_compulsory for backward compatibility
        if self.is_core and not self.is_compulsory:
            self.is_compulsory = True

        super().save(*args, **kwargs)

    # Enhanced property methods
    @property
    def display_name(self):
        """Returns the preferred display name"""
        return self.short_name or self.name

    @property
    def total_weekly_hours(self):
        """Calculate total weekly hours including practical"""
        return self.credit_hours + self.practical_hours

    @property
    def education_levels_display(self):
        """Returns formatted education levels"""
        if not self.education_levels:
            return "All levels"

        level_names = []
        for level in self.education_levels:
            level_dict = dict(EDUCATION_LEVELS)
            level_names.append(level_dict.get(level, level))

        return ", ".join(level_names)

    @property
    def nursery_levels_display(self):
        """Returns formatted nursery levels"""
        if not self.nursery_levels:
            return ""

        level_names = []
        for level in self.nursery_levels:
            level_dict = dict(NURSERY_LEVELS)
            level_names.append(level_dict.get(level, level))

        return ", ".join(level_names)

    @property
    def full_level_display(self):
        """Returns complete level information"""
        base_levels = self.education_levels_display
        if "NURSERY" in (self.education_levels or []) and self.nursery_levels:
            nursery_display = self.nursery_levels_display
            return f"{base_levels} ({nursery_display})"
        return base_levels

    @property
    def is_nursery_subject(self):
        """Check if this is a nursery subject"""
        return "NURSERY" in (self.education_levels or [])

    @property
    def is_primary_subject(self):
        """Check if this is a primary subject"""
        return "PRIMARY" in (self.education_levels or [])

    @property
    def is_junior_secondary_subject(self):
        """Check if this is a junior secondary subject"""
        return "JUNIOR_SECONDARY" in (self.education_levels or [])

    @property
    def is_senior_secondary_subject(self):
        """Check if this is a senior secondary subject"""
        return "SENIOR_SECONDARY" in (self.education_levels or [])

    # Enhanced query methods
    def is_available_for_education_level(self, education_level):
        """Check if subject is available for a specific education level"""
        return (
            (not self.education_levels or education_level in self.education_levels)
            and self.is_active
            and not self.is_discontinued
        )

    def is_available_for_nursery_level(self, nursery_level):
        """Check if subject is available for a specific nursery level"""
        return (
            self.is_nursery_subject
            and (not self.nursery_levels or nursery_level in self.nursery_levels)
            and self.is_active
            and not self.is_discontinued
        )

    def get_prerequisite_subjects(self):
        """Get all prerequisite subjects"""
        return self.prerequisites.filter(is_active=True)

    def get_dependent_subjects(self):
        """Get subjects that depend on this subject"""
        return self.unlocks_subjects.filter(is_active=True)

    # Enhanced class methods for your school structure
    @classmethod
    def get_nursery_subjects(cls):
        """Get all nursery subjects"""
        return cls.objects.filter(
            education_levels__contains=["NURSERY"], is_active=True
        ).order_by("subject_order", "name")

    @classmethod
    def get_primary_subjects(cls):
        """Get all primary subjects"""
        return cls.objects.filter(
            education_levels__contains=["PRIMARY"], is_active=True
        ).order_by("subject_order", "name")

    @classmethod
    def get_junior_secondary_subjects(cls):
        """Get all junior secondary subjects"""
        return cls.objects.filter(
            education_levels__contains=["JUNIOR_SECONDARY"], is_active=True
        ).order_by("subject_order", "name")

    @classmethod
    def get_senior_secondary_subjects(cls):
        """Get all senior secondary subjects"""
        return cls.objects.filter(
            education_levels__contains=["SENIOR_SECONDARY"], is_active=True
        ).order_by("ss_subject_type", "subject_order", "name")

    @classmethod
    def get_cross_cutting_subjects(cls):
        """Get cross-cutting subjects for Senior Secondary"""
        return cls.objects.filter(is_cross_cutting=True, is_active=True)

    @classmethod
    def get_ss_subjects_by_type(cls, subject_type):
        """Get Senior Secondary subjects by type"""
        return cls.objects.filter(
            ss_subject_type=subject_type,
            education_levels__contains=["SENIOR_SECONDARY"],
            is_active=True,
        )

    @classmethod
    def get_core_science_subjects(cls):
        """Get core science subjects for SS"""
        return cls.get_ss_subjects_by_type("core_science")

    @classmethod
    def get_core_art_subjects(cls):
        """Get core art subjects for SS"""
        return cls.get_ss_subjects_by_type("core_art")

    @classmethod
    def get_core_humanities_subjects(cls):
        """Get core humanities subjects for SS"""
        return cls.get_ss_subjects_by_type("core_humanities")

    @classmethod
    def get_elective_subjects(cls):
        """Get elective subjects for SS"""
        return cls.get_ss_subjects_by_type("elective")

    @classmethod
    def get_activity_based_subjects(cls):
        """Get activity-based subjects (typically for nursery)"""
        return cls.objects.filter(is_activity_based=True, is_active=True)

    @classmethod
    def get_subjects_requiring_specialist(cls):
        """Get subjects requiring specialist teachers"""
        return cls.objects.filter(requires_specialist_teacher=True, is_active=True)

    # Display methods with icons
    def get_category_display_with_icon(self):
        """Returns category with appropriate icon for UI display"""
        icons = {
            "core": "📚",
            "elective": "🎯",
            "cross_cutting": "🌐",
            "core_science": "🔬",
            "core_art": "🎨",
            "core_humanities": "📖",
            "vocational": "🔧",
            "creative_arts": "🎭",
            "religious": "🙏",
            "physical": "⚽",
            "language": "🗣️",
            "practical": "✋",
            "nursery_activities": "🎈",
        }
        return f"{icons.get(self.category, '📖')} {self.get_category_display()}"
