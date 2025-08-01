from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import (
    Subject,
    SUBJECT_CATEGORY_CHOICES,
    EDUCATION_LEVELS,
    NURSERY_LEVELS,
    SS_SUBJECT_TYPES,
)


class SubjectSerializer(serializers.ModelSerializer):
    # Read-only computed fields from model properties
    display_name = serializers.ReadOnlyField()
    education_levels_display = serializers.ReadOnlyField()
    nursery_levels_display = serializers.ReadOnlyField()
    full_level_display = serializers.ReadOnlyField()
    total_weekly_hours = serializers.ReadOnlyField()
    category_display_with_icon = serializers.CharField(
        source="get_category_display_with_icon", read_only=True
    )

    # Display values for choice fields
    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )
    ss_subject_type_display = serializers.CharField(
        source="get_ss_subject_type_display", read_only=True
    )

    # Boolean property fields
    is_nursery_subject = serializers.ReadOnlyField()
    is_primary_subject = serializers.ReadOnlyField()
    is_junior_secondary_subject = serializers.ReadOnlyField()
    is_senior_secondary_subject = serializers.ReadOnlyField()

    # Custom validation fields
    code = serializers.CharField(
        max_length=15, help_text="Unique subject code (e.g., MATH-NUR, ENG-PRI, PHY-SS)"
    )

    # Method fields for additional context
    grade_levels_info = serializers.SerializerMethodField()
    prerequisite_subjects = serializers.SerializerMethodField()
    dependent_subjects = serializers.SerializerMethodField()
    subject_summary = serializers.SerializerMethodField()
    education_level_details = serializers.SerializerMethodField()

    # Nested serialization for related fields
    grade_levels = serializers.StringRelatedField(many=True, read_only=True)
    prerequisites = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = [
            # Basic fields
            "id",
            "name",
            "short_name",
            "display_name",
            "code",
            "description",
            "category",
            "category_display",
            "category_display_with_icon",
            # Education level fields
            "education_levels",
            "education_levels_display",
            "nursery_levels",
            "nursery_levels_display",
            "full_level_display",
            "education_level_details",
            # Senior Secondary specific
            "ss_subject_type",
            "ss_subject_type_display",
            "is_cross_cutting",
            # Grade level integration
            "grade_levels",
            "grade_levels_info",
            # Academic configuration
            "credit_hours",
            "is_compulsory",
            "is_core",
            # Prerequisites and dependencies
            "prerequisites",
            "prerequisite_subjects",
            "dependent_subjects",
            # Assessment configuration
            "has_continuous_assessment",
            "has_final_exam",
            "pass_mark",
            # Practical and activity components
            "has_practical",
            "practical_hours",
            "is_activity_based",
            "total_weekly_hours",
            # Resource requirements
            "requires_lab",
            "requires_special_equipment",
            "equipment_notes",
            "requires_specialist_teacher",
            # Educational level checks
            "is_nursery_subject",
            "is_primary_subject",
            "is_junior_secondary_subject",
            "is_senior_secondary_subject",
            # Status fields
            "is_active",
            "is_discontinued",
            # Metadata and organization
            "introduced_year",
            "curriculum_version",
            "subject_order",
            "learning_outcomes",
            "subject_summary",
            # Timestamps
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def get_grade_levels_info(self, obj):
        """Return detailed information about grade levels"""
        grade_levels = obj.grade_levels.all().order_by("order")
        return [
            {
                "id": grade.id,
                "name": grade.name,
                "order": grade.order,
            }
            for grade in grade_levels
        ]

    def get_prerequisite_subjects(self, obj):
        """Return list of prerequisite subjects"""
        prerequisites = obj.get_prerequisite_subjects()
        return [
            {
                "id": subject.id,
                "name": subject.name,
                "short_name": subject.short_name,
                "code": subject.code,
                "display_name": subject.display_name,
            }
            for subject in prerequisites
        ]

    def get_dependent_subjects(self, obj):
        """Return list of subjects that depend on this subject"""
        dependents = obj.get_dependent_subjects()
        return [
            {
                "id": subject.id,
                "name": subject.name,
                "short_name": subject.short_name,
                "code": subject.code,
                "display_name": subject.display_name,
            }
            for subject in dependents
        ]

    def get_education_level_details(self, obj):
        """Return detailed education level information"""
        details = {
            "applicable_levels": [],
            "nursery_specific": [],
            "level_compatibility": {
                "nursery": obj.is_nursery_subject,
                "primary": obj.is_primary_subject,
                "junior_secondary": obj.is_junior_secondary_subject,
                "senior_secondary": obj.is_senior_secondary_subject,
            },
        }

        # Add applicable education levels
        if obj.education_levels:
            level_dict = dict(EDUCATION_LEVELS)
            details["applicable_levels"] = [
                {"code": level, "name": level_dict.get(level, level)}
                for level in obj.education_levels
            ]

        # Add nursery specific levels
        if obj.nursery_levels:
            nursery_dict = dict(NURSERY_LEVELS)
            details["nursery_specific"] = [
                {"code": level, "name": nursery_dict.get(level, level)}
                for level in obj.nursery_levels
            ]

        return details

    def get_subject_summary(self, obj):
        """Return comprehensive subject summary"""
        return {
            "basic_info": {
                "display_name": obj.display_name,
                "total_credit_hours": obj.credit_hours,
                "total_practical_hours": obj.practical_hours,
                "total_weekly_hours": obj.total_weekly_hours,
            },
            "classification": {
                "category": obj.get_category_display(),
                "is_compulsory": obj.is_compulsory,
                "is_core": obj.is_core,
                "is_cross_cutting": obj.is_cross_cutting,
                "is_activity_based": obj.is_activity_based,
                "ss_subject_type": (
                    obj.get_ss_subject_type_display() if obj.ss_subject_type else None
                ),
            },
            "relationships": {
                "has_prerequisites": obj.prerequisites.exists(),
                "prerequisite_count": obj.prerequisites.count(),
                "dependent_count": obj.unlocks_subjects.count(),
                "grade_level_count": obj.grade_levels.count(),
            },
            "assessment": {
                "assessment_type": self._get_assessment_type(obj),
                "pass_mark": obj.pass_mark,
            },
            "resources": {
                "resource_requirements": self._get_resource_requirements(obj),
                "requires_specialist": obj.requires_specialist_teacher,
            },
            "status": {
                "status": self._get_status_summary(obj),
                "introduced_year": obj.introduced_year,
                "curriculum_version": obj.curriculum_version,
            },
        }

    def _get_assessment_type(self, obj):
        """Helper method to determine assessment type"""
        if obj.has_continuous_assessment and obj.has_final_exam:
            return "Both Continuous and Final"
        elif obj.has_continuous_assessment:
            return "Continuous Assessment Only"
        elif obj.has_final_exam:
            return "Final Exam Only"
        else:
            return "No Standard Assessment"

    def _get_resource_requirements(self, obj):
        """Helper method to get resource requirements"""
        requirements = []
        if obj.requires_lab:
            requirements.append("Laboratory")
        if obj.requires_special_equipment:
            requirements.append("Special Equipment")
        if obj.has_practical:
            requirements.append("Practical Facilities")
        return requirements if requirements else ["Standard Classroom"]

    def _get_status_summary(self, obj):
        """Helper method to get status summary"""
        if obj.is_discontinued:
            return "Discontinued"
        elif not obj.is_active:
            return "Inactive"
        else:
            return "Active"

    def validate_code(self, value):
        """Ensure subject code follows the new format"""
        if not value:
            raise serializers.ValidationError("Subject code is required.")

        # Convert to uppercase
        value = value.upper()

        # Enhanced format validation for new code structure
        import re

        if not re.match(r"^[A-Z]{2,6}-[A-Z]{2,4}$", value):
            raise serializers.ValidationError(
                "Subject code must follow format: SUBJECT-LEVEL (e.g., MATH-NUR, ENG-PRI, PHY-SS)"
            )

        return value

    def validate_name(self, value):
        """Validate subject name"""
        if not value or not value.strip():
            raise serializers.ValidationError("Subject name cannot be empty.")

        if len(value.strip()) < 2:
            raise serializers.ValidationError(
                "Subject name must be at least 2 characters long."
            )

        return value.strip().title()

    def validate_credit_hours(self, value):
        """Validate credit hours based on category and education level"""
        if value < 1:
            raise serializers.ValidationError("Credit hours must be at least 1.")

        category = self.initial_data.get("category", "")
        education_levels = self.initial_data.get("education_levels", [])

        # Nursery subjects typically have fewer credit hours
        if "NURSERY" in education_levels and value > 3:
            raise serializers.ValidationError(
                "Nursery subjects typically have maximum 3 credit hours."
            )

        # Cross-cutting subjects validation
        if category in ["cross_cutting"] and value < 2:
            raise serializers.ValidationError(
                "Cross-cutting subjects typically have minimum 2 credit hours."
            )

        return value

    def validate_practical_hours(self, value):
        """Validate practical hours"""
        has_practical = self.initial_data.get("has_practical", False)
        if has_practical and value == 0:
            raise serializers.ValidationError(
                "Practical hours must be greater than 0 when subject has practical components."
            )
        elif not has_practical and value > 0:
            raise serializers.ValidationError(
                "Practical hours should be 0 when subject has no practical components."
            )
        return value

    def validate_education_levels(self, value):
        """Validate education levels"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Education levels must be a list.")

        valid_levels = [choice[0] for choice in EDUCATION_LEVELS]
        for level in value:
            if level not in valid_levels:
                raise serializers.ValidationError(
                    f"Invalid education level: {level}. Must be one of {valid_levels}"
                )
        return value

    def validate_nursery_levels(self, value):
        """Validate nursery levels"""
        if not value:
            return value

        if not isinstance(value, list):
            raise serializers.ValidationError("Nursery levels must be a list.")

        valid_levels = [choice[0] for choice in NURSERY_LEVELS]
        for level in value:
            if level not in valid_levels:
                raise serializers.ValidationError(
                    f"Invalid nursery level: {level}. Must be one of {valid_levels}"
                )
        return value

    def validate_ss_subject_type(self, value):
        """Validate Senior Secondary subject type"""
        if not value:
            return value

        valid_types = [choice[0] for choice in SS_SUBJECT_TYPES]
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Invalid SS subject type: {value}. Must be one of {valid_types}"
            )
        return value

    def validate(self, data):
        """Cross-field validation"""
        # Practical hours validation
        has_practical = data.get("has_practical", False)
        practical_hours = data.get("practical_hours", 0)

        if has_practical and practical_hours == 0:
            raise serializers.ValidationError(
                {
                    "practical_hours": "Practical hours must be greater than 0 when subject has practical components."
                }
            )

        # Equipment notes validation
        requires_special_equipment = data.get("requires_special_equipment", False)
        equipment_notes = data.get("equipment_notes", "")

        if requires_special_equipment and not equipment_notes.strip():
            raise serializers.ValidationError(
                {
                    "equipment_notes": "Equipment notes are required when subject requires special equipment."
                }
            )

        # Senior Secondary validations
        education_levels = data.get("education_levels", [])
        ss_subject_type = data.get("ss_subject_type")
        is_cross_cutting = data.get("is_cross_cutting", False)

        if "SENIOR_SECONDARY" in education_levels and not ss_subject_type:
            raise serializers.ValidationError(
                {
                    "ss_subject_type": "Senior Secondary subjects must have a subject type."
                }
            )

        if is_cross_cutting and "SENIOR_SECONDARY" not in education_levels:
            raise serializers.ValidationError(
                {
                    "is_cross_cutting": "Cross-cutting subjects can only be applied to Senior Secondary level."
                }
            )

        # Nursery validations
        is_activity_based = data.get("is_activity_based", False)
        nursery_levels = data.get("nursery_levels", [])

        if is_activity_based and "NURSERY" not in education_levels:
            raise serializers.ValidationError(
                {
                    "is_activity_based": "Activity-based subjects can only be applied to Nursery level."
                }
            )

        if nursery_levels and "NURSERY" not in education_levels:
            raise serializers.ValidationError(
                {
                    "nursery_levels": "Nursery levels can only be specified for nursery subjects."
                }
            )

        # Assessment validation
        has_continuous = data.get("has_continuous_assessment", True)
        has_final = data.get("has_final_exam", True)

        if not has_continuous and not has_final:
            raise serializers.ValidationError(
                "Subject must have at least one form of assessment (continuous or final exam)."
            )

        return data

    def create(self, validated_data):
        """Custom create method with additional validation"""
        try:
            instance = super().create(validated_data)
            instance.full_clean()
            return instance
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)

    def update(self, instance, validated_data):
        """Custom update method with additional validation"""
        try:
            instance = super().update(instance, validated_data)
            instance.full_clean()
            return instance
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)

    def to_representation(self, instance):
        """Customize output representation"""
        data = super().to_representation(instance)

        # Add dynamic fields based on context
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            if hasattr(request.user, "is_staff") and request.user.is_staff:
                data["admin_info"] = {
                    "last_updated": instance.updated_at,
                    "requires_attention": instance.is_discontinued
                    or (not instance.is_active and instance.is_compulsory),
                    "has_resource_requirements": instance.requires_lab
                    or instance.requires_special_equipment,
                    "curriculum_alignment": instance.curriculum_version
                    or "Not specified",
                }

        return data


class SubjectListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""

    category_display_with_icon = serializers.CharField(
        source="get_category_display_with_icon", read_only=True
    )
    display_name = serializers.ReadOnlyField()
    full_level_display = serializers.ReadOnlyField()
    total_weekly_hours = serializers.ReadOnlyField()
    status_summary = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
            "short_name",
            "display_name",
            "code",
            "category_display_with_icon",
            "full_level_display",
            "credit_hours",
            "practical_hours",
            "total_weekly_hours",
            "is_compulsory",
            "is_core",
            "is_cross_cutting",
            "is_activity_based",
            "is_active",
            "is_discontinued",
            "status_summary",
            "subject_order",
        ]

    def get_status_summary(self, obj):
        """Get concise status summary"""
        if obj.is_discontinued:
            return "Discontinued"
        elif not obj.is_active:
            return "Inactive"
        else:
            return "Active"


class SubjectCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer focused on create/update operations"""

    # Writable fields for many-to-many relationships
    grade_level_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="List of grade level IDs",
    )
    prerequisite_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="List of prerequisite subject IDs",
    )

    class Meta:
        model = Subject
        fields = [
            "name",
            "short_name",
            "code",
            "description",
            "category",
            "education_levels",
            "nursery_levels",
            "ss_subject_type",
            "is_cross_cutting",
            "credit_hours",
            "is_compulsory",
            "is_core",
            "has_continuous_assessment",
            "has_final_exam",
            "pass_mark",
            "has_practical",
            "practical_hours",
            "is_activity_based",
            "requires_lab",
            "requires_special_equipment",
            "equipment_notes",
            "requires_specialist_teacher",
            "is_active",
            "is_discontinued",
            "introduced_year",
            "curriculum_version",
            "subject_order",
            "learning_outcomes",
            "grade_level_ids",
            "prerequisite_ids",
        ]

    def validate_code(self, value):
        """Ensure subject code is unique and properly formatted"""
        value = value.upper()

        # Check uniqueness (excluding current instance during updates)
        queryset = Subject.objects.filter(code=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("Subject with this code already exists.")

        return value

    def validate_grade_level_ids(self, value):
        """Validate grade level IDs"""
        from .models import GradeLevel  # Assuming GradeLevel model exists

        if not value:
            return value

        existing_ids = set(
            GradeLevel.objects.filter(id__in=value).values_list("id", flat=True)
        )
        provided_ids = set(value)

        if provided_ids != existing_ids:
            invalid_ids = provided_ids - existing_ids
            raise serializers.ValidationError(
                f"Invalid grade level IDs: {list(invalid_ids)}"
            )

        return value

    def validate_prerequisite_ids(self, value):
        """Validate prerequisite subject IDs"""
        if not value:
            return value

        existing_ids = set(
            Subject.objects.filter(id__in=value).values_list("id", flat=True)
        )
        provided_ids = set(value)

        if provided_ids != existing_ids:
            invalid_ids = provided_ids - existing_ids
            raise serializers.ValidationError(
                f"Invalid prerequisite subject IDs: {list(invalid_ids)}"
            )

        # Check for circular dependencies
        if self.instance and self.instance.id in provided_ids:
            raise serializers.ValidationError(
                "Subject cannot be a prerequisite of itself."
            )

        return value

    def create(self, validated_data):
        """Handle many-to-many relationships during creation"""
        grade_level_ids = validated_data.pop("grade_level_ids", [])
        prerequisite_ids = validated_data.pop("prerequisite_ids", [])

        instance = super().create(validated_data)

        # Set many-to-many relationships
        if grade_level_ids:
            instance.grade_levels.set(grade_level_ids)
        if prerequisite_ids:
            instance.prerequisites.set(prerequisite_ids)

        return instance

    def update(self, instance, validated_data):
        """Handle many-to-many relationships during updates"""
        grade_level_ids = validated_data.pop("grade_level_ids", None)
        prerequisite_ids = validated_data.pop("prerequisite_ids", None)

        instance = super().update(instance, validated_data)

        # Update many-to-many relationships if provided
        if grade_level_ids is not None:
            instance.grade_levels.set(grade_level_ids)
        if prerequisite_ids is not None:
            instance.prerequisites.set(prerequisite_ids)

        return instance


class NurserySubjectSerializer(serializers.ModelSerializer):
    """Specialized serializer for nursery subjects"""

    nursery_levels_display = serializers.ReadOnlyField()
    is_activity_based = serializers.BooleanField(default=True)

    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
            "short_name",
            "code",
            "description",
            "nursery_levels",
            "nursery_levels_display",
            "is_activity_based",
            "credit_hours",
            "practical_hours",
            "is_active",
            "subject_order",
        ]

    def validate(self, data):
        # Ensure this is a nursery subject
        if "NURSERY" not in data.get("education_levels", ["NURSERY"]):
            data["education_levels"] = ["NURSERY"]
        return super().validate(data)


class SeniorSecondarySubjectSerializer(serializers.ModelSerializer):
    """Specialized serializer for Senior Secondary subjects"""

    ss_subject_type_display = serializers.CharField(
        source="get_ss_subject_type_display", read_only=True
    )

    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
            "short_name",
            "code",
            "description",
            "ss_subject_type",
            "ss_subject_type_display",
            "is_cross_cutting",
            "credit_hours",
            "practical_hours",
            "requires_specialist_teacher",
            "is_active",
        ]

    def validate(self, data):
        # Ensure this is a Senior Secondary subject
        if "SENIOR_SECONDARY" not in data.get("education_levels", ["SENIOR_SECONDARY"]):
            data["education_levels"] = ["SENIOR_SECONDARY"]

        # Require ss_subject_type for SS subjects
        if not data.get("ss_subject_type"):
            raise serializers.ValidationError(
                {
                    "ss_subject_type": "Senior Secondary subjects must have a subject type."
                }
            )

        return super().validate(data)


class SubjectEducationLevelSerializer(serializers.ModelSerializer):
    """Serializer for education level specific operations"""

    applicable_education_levels = serializers.SerializerMethodField()
    education_level_compatibility = serializers.SerializerMethodField()
    level_specific_info = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
            "code",
            "education_levels",
            "nursery_levels",
            "applicable_education_levels",
            "education_level_compatibility",
            "level_specific_info",
        ]

    def get_applicable_education_levels(self, obj):
        """Get formatted education levels"""
        result = []

        if obj.education_levels:
            for level in obj.education_levels:
                level_dict = dict(EDUCATION_LEVELS)
                level_info = {
                    "code": level,
                    "name": level_dict.get(level, level),
                    "is_current": True,
                }

                # Add nursery sub-levels if applicable
                if level == "NURSERY" and obj.nursery_levels:
                    nursery_dict = dict(NURSERY_LEVELS)
                    level_info["sub_levels"] = [
                        {
                            "code": sub_level,
                            "name": nursery_dict.get(sub_level, sub_level),
                        }
                        for sub_level in obj.nursery_levels
                    ]

                result.append(level_info)
        else:
            # If no specific levels, show all as applicable
            for level_code, level_name in EDUCATION_LEVELS:
                result.append(
                    {"code": level_code, "name": level_name, "is_current": False}
                )

        return result

    def get_education_level_compatibility(self, obj):
        """Check compatibility with different education levels"""
        return {
            "nursery_compatible": obj.is_nursery_subject,
            "primary_compatible": obj.is_primary_subject,
            "junior_secondary_compatible": obj.is_junior_secondary_subject,
            "senior_secondary_compatible": obj.is_senior_secondary_subject,
            "all_levels": not obj.education_levels,
            "cross_cutting": obj.is_cross_cutting,
            "activity_based": obj.is_activity_based,
        }

    def get_level_specific_info(self, obj):
        """Get level-specific information"""
        info = {
            "general": {
                "requires_specialist": obj.requires_specialist_teacher,
                "has_practical": obj.has_practical,
                "credit_hours": obj.credit_hours,
            }
        }

        # Add nursery-specific info
        if obj.is_nursery_subject:
            info["nursery"] = {
                "is_activity_based": obj.is_activity_based,
                "applicable_levels": obj.nursery_levels_display,
            }

        # Add Senior Secondary specific info
        if obj.is_senior_secondary_subject:
            info["senior_secondary"] = {
                "subject_type": (
                    obj.get_ss_subject_type_display() if obj.ss_subject_type else None
                ),
                "is_cross_cutting": obj.is_cross_cutting,
            }

        return info


class SubjectFilterSerializer(serializers.Serializer):
    """Serializer for filtering subjects by various criteria"""

    education_level = serializers.ChoiceField(
        choices=EDUCATION_LEVELS, required=False, help_text="Filter by education level"
    )

    nursery_level = serializers.ChoiceField(
        choices=NURSERY_LEVELS, required=False, help_text="Filter by nursery level"
    )

    category = serializers.ChoiceField(
        choices=SUBJECT_CATEGORY_CHOICES,
        required=False,
        help_text="Filter by subject category",
    )

    ss_subject_type = serializers.ChoiceField(
        choices=SS_SUBJECT_TYPES,
        required=False,
        help_text="Filter by Senior Secondary subject type",
    )

    is_compulsory = serializers.BooleanField(
        required=False, help_text="Filter by compulsory status"
    )

    is_cross_cutting = serializers.BooleanField(
        required=False, help_text="Filter cross-cutting subjects"
    )

    is_activity_based = serializers.BooleanField(
        required=False, help_text="Filter activity-based subjects"
    )

    requires_specialist = serializers.BooleanField(
        required=False, help_text="Filter subjects requiring specialist teachers"
    )

    has_practical = serializers.BooleanField(
        required=False, help_text="Filter subjects with practical components"
    )

    is_active = serializers.BooleanField(
        default=True, help_text="Filter by active status"
    )
