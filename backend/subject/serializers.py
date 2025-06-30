from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Subject, SUBJECT_CATEGORY_CHOICES, EDUCATION_LEVELS


class SubjectSerializer(serializers.ModelSerializer):
    # Read-only computed fields from model properties
    grade_range_display = serializers.ReadOnlyField()
    education_levels_display = serializers.ReadOnlyField()
    total_weekly_hours = serializers.ReadOnlyField()
    category_display_with_icon = serializers.CharField(
        source="get_category_display_with_icon", read_only=True
    )

    # Display values for choice fields
    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )

    # Custom validation fields
    code = serializers.CharField(
        max_length=10, help_text="Unique subject code (e.g., MATH101, ENG201)"
    )

    # Method fields for additional context
    grade_levels_info = serializers.SerializerMethodField()
    prerequisite_subjects = serializers.SerializerMethodField()
    dependent_subjects = serializers.SerializerMethodField()
    subject_summary = serializers.SerializerMethodField()

    # Nested serialization for related fields
    grade_levels = serializers.StringRelatedField(many=True, read_only=True)
    prerequisites = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = [
            # Basic fields
            "id",
            "name",
            "code",
            "description",
            "category",
            "category_display",
            "category_display_with_icon",
            # Grade and education level fields
            "grade_levels",
            "grade_levels_info",
            "grade_range_display",
            "education_levels",
            "education_levels_display",
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
            # Practical components
            "has_practical",
            "practical_hours",
            "total_weekly_hours",
            # Resource requirements
            "requires_lab",
            "requires_special_equipment",
            "equipment_notes",
            # Status fields
            "is_active",
            "is_discontinued",
            # Metadata
            "introduced_year",
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
                "code": subject.code,
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
                "code": subject.code,
            }
            for subject in dependents
        ]

    def get_subject_summary(self, obj):
        """Return comprehensive subject summary"""
        return {
            "total_credit_hours": obj.credit_hours,
            "total_practical_hours": obj.practical_hours,
            "total_weekly_hours": obj.total_weekly_hours,
            "has_prerequisites": obj.prerequisites.exists(),
            "prerequisite_count": obj.prerequisites.count(),
            "dependent_count": obj.unlocks_subjects.count(),
            "grade_level_count": obj.grade_levels.count(),
            "assessment_type": self._get_assessment_type(obj),
            "resource_requirements": self._get_resource_requirements(obj),
            "status": self._get_status_summary(obj),
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
        """Ensure subject code is uppercase and follows format"""
        if not value:
            raise serializers.ValidationError("Subject code is required.")

        # Convert to uppercase
        value = value.upper()

        # Basic format validation (letters followed by numbers)
        import re

        if not re.match(r"^[A-Z]{2,4}\d{2,4}$", value):
            raise serializers.ValidationError(
                "Subject code must be 2-4 letters followed by 2-4 numbers (e.g., MATH101, ENG201)"
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
        """Validate credit hours based on category"""
        if value < 1:
            raise serializers.ValidationError("Credit hours must be at least 1.")

        category = self.initial_data.get("category", "")
        if category == "extra_curricular" and value > 2:
            raise serializers.ValidationError(
                "Extra-curricular subjects typically have maximum 2 credit hours."
            )
        elif category == "core" and value < 2:
            raise serializers.ValidationError(
                "Core subjects typically have minimum 2 credit hours."
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

    def validate_pass_mark(self, value):
        """Validate pass mark"""
        if not (1 <= value <= 100):
            raise serializers.ValidationError("Pass mark must be between 1 and 100.")
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

        # Category and compulsory field logic
        category = data.get("category")
        is_compulsory = data.get("is_compulsory")

        if category == "extra_curricular" and is_compulsory:
            raise serializers.ValidationError(
                {"is_compulsory": "Extra-curricular subjects cannot be compulsory."}
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
                }

        return data


class SubjectListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""

    category_display_with_icon = serializers.CharField(
        source="get_category_display_with_icon", read_only=True
    )
    grade_range_display = serializers.ReadOnlyField()
    total_weekly_hours = serializers.ReadOnlyField()
    status_summary = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
            "code",
            "category_display_with_icon",
            "grade_range_display",
            "credit_hours",
            "practical_hours",
            "total_weekly_hours",
            "is_compulsory",
            "is_active",
            "is_discontinued",
            "status_summary",
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
            "code",
            "description",
            "category",
            "education_levels",
            "credit_hours",
            "is_compulsory",
            "is_core",
            "has_continuous_assessment",
            "has_final_exam",
            "pass_mark",
            "has_practical",
            "practical_hours",
            "requires_lab",
            "requires_special_equipment",
            "equipment_notes",
            "is_active",
            "is_discontinued",
            "introduced_year",
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


class SubjectGradeCheckSerializer(serializers.Serializer):
    """Serializer for checking subject availability for specific grades"""

    grade_level_id = serializers.IntegerField(help_text="Grade level ID to check")

    def validate_grade_level_id(self, value):
        """Validate grade level ID exists"""
        from .models import GradeLevel

        if not GradeLevel.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                "Grade level with this ID does not exist."
            )

        return value


class SubjectPrerequisiteSerializer(serializers.ModelSerializer):
    """Serializer for managing subject prerequisites"""

    prerequisites_info = serializers.SerializerMethodField()
    can_add_prerequisites = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
            "code",
            "prerequisites_info",
            "can_add_prerequisites",
        ]

    def get_prerequisites_info(self, obj):
        """Get detailed prerequisite information"""
        prerequisites = obj.get_prerequisite_subjects()
        return [
            {
                "id": prereq.id,
                "name": prereq.name,
                "code": prereq.code,
                "category": prereq.get_category_display(),
            }
            for prereq in prerequisites
        ]

    def get_can_add_prerequisites(self, obj):
        """Check if more prerequisites can be added"""
        # Business logic: prevent circular dependencies
        potential_prereqs = (
            Subject.objects.filter(is_active=True)
            .exclude(id=obj.id)
            .exclude(prerequisites=obj)
        )
        return potential_prereqs.exists()


class SubjectEducationLevelSerializer(serializers.ModelSerializer):
    """Serializer for education level specific operations"""

    applicable_education_levels = serializers.SerializerMethodField()
    education_level_compatibility = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
            "code",
            "education_levels",
            "applicable_education_levels",
            "education_level_compatibility",
        ]

    def get_applicable_education_levels(self, obj):
        """Get formatted education levels"""
        return (
            [
                {"code": level, "name": dict(EDUCATION_LEVELS).get(level, level)}
                for level in obj.education_levels
            ]
            if obj.education_levels
            else [{"code": level[0], "name": level[1]} for level in EDUCATION_LEVELS]
        )

    def get_education_level_compatibility(self, obj):
        """Check compatibility with different education levels"""
        return {
            "nursery_compatible": not obj.education_levels
            or "NURSERY" in obj.education_levels,
            "primary_compatible": not obj.education_levels
            or "PRIMARY" in obj.education_levels,
            "secondary_compatible": not obj.education_levels
            or "SECONDARY" in obj.education_levels,
            "all_levels": not obj.education_levels,
        }
