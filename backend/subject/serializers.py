from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import (
    Subject,
    SUBJECT_CATEGORY_CHOICES,
    EDUCATION_LEVELS,
    NURSERY_LEVELS,
    SS_SUBJECT_TYPES,
    SchoolStreamConfiguration,
    SchoolStreamSubjectAssignment,
)


class SubjectSerializer(serializers.ModelSerializer):
    # Read-only computed fields from model properties
    display_name = serializers.ReadOnlyField()
    education_levels_display = serializers.ReadOnlyField()
    nursery_levels_display = serializers.ReadOnlyField()
    full_level_display = serializers.ReadOnlyField()
    # total_weekly_hours field removed - doesn't exist in model
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
    # is_nursery_subject field removed - use education_levels JSONField instead
    # Education level fields removed - use education_levels JSONField instead

    # Custom validation fields
    code = serializers.CharField(
        max_length=15, help_text="Unique subject code (e.g., MATH-NUR, ENG-PRI, PHY-SS)"
    )

    # Method fields for additional context
    grade_levels_info = serializers.SerializerMethodField()
    prerequisite_subjects = serializers.SerializerMethodField()
    dependent_subjects = serializers.SerializerMethodField()
    # subject_summary field removed - doesn't exist in model
    education_level_details = serializers.SerializerMethodField()

    # Nested serialization for related fields
    grade_levels = serializers.StringRelatedField(many=True, read_only=True)
    prerequisites = serializers.StringRelatedField(many=True, read_only=True)
    compatible_streams = serializers.StringRelatedField(many=True, read_only=True)

    # Add new fields
    is_cross_cutting = serializers.BooleanField(read_only=True)
    default_stream_role = serializers.CharField(read_only=True)
    
    # Stream assignments for this subject
    stream_assignments = serializers.SerializerMethodField()

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
            "default_stream_role",
            # Grade level integration
            "grade_levels",
            "grade_levels_info",

            # Prerequisites and dependencies
            "prerequisites",
            "prerequisite_subjects",
            "dependent_subjects",
            "compatible_streams",
            # Status fields
            "is_active",
            # Metadata and organization
            "subject_order",
            # Timestamps
            "created_at",
            "updated_at",
            # Stream assignments
            "stream_assignments",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def get_grade_levels_info(self, obj):
        """Return detailed information about grade levels"""
        grade_levels = getattr(obj, 'grade_levels', None)
        if grade_levels is None:
            return []
        
        try:
            grade_levels = grade_levels.all().order_by("order")
            return [
                {
                    "id": grade.id,
                    "name": grade.name,
                    "order": grade.order,
                }
                for grade in grade_levels
            ]
        except (AttributeError, Exception):
            return []

    def get_prerequisite_subjects(self, obj):
        """Return list of prerequisite subjects"""
        try:
            if hasattr(obj, 'get_prerequisite_subjects'):
                prerequisites = obj.get_prerequisite_subjects()
            else:
                prerequisites = getattr(obj, 'prerequisites', []).filter(is_active=True) if hasattr(obj, 'prerequisites') else []
            
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
        except (AttributeError, Exception):
            return []

    def get_dependent_subjects(self, obj):
        """Return list of subjects that depend on this subject"""
        try:
            if hasattr(obj, 'get_dependent_subjects'):
                dependents = obj.get_dependent_subjects()
            else:
                dependents = getattr(obj, 'unlocks_subjects', []).filter(is_active=True) if hasattr(obj, 'unlocks_subjects') else []
            
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
        except (AttributeError, Exception):
            return []

    def get_education_level_details(self, obj):
        """Return detailed education level information"""
        details = {
            "applicable_levels": [],
            "nursery_specific": [],
            "level_compatibility": {
                "nursery": "NURSERY" in getattr(obj, 'education_levels', []),
                "primary": "PRIMARY" in getattr(obj, 'education_levels', []),
                "junior_secondary": "JUNIOR_SECONDARY" in getattr(obj, 'education_levels', []),
                "senior_secondary": "SENIOR_SECONDARY" in getattr(obj, 'education_levels', []),
            },
        }

        # Add applicable education levels
        education_levels = getattr(obj, 'education_levels', [])
        if education_levels:
            level_dict = dict(EDUCATION_LEVELS)
            details["applicable_levels"] = [
                {"code": level, "name": level_dict.get(level, level)}
                for level in education_levels
            ]

        # Add nursery specific levels
        nursery_levels = getattr(obj, 'nursery_levels', [])
        if nursery_levels:
            nursery_dict = dict(NURSERY_LEVELS)
            details["nursery_specific"] = [
                {"code": level, "name": nursery_dict.get(level, level)}
                for level in nursery_levels
            ]

        return details

    # get_subject_summary method removed - references non-existent fields

    # Helper methods removed - they reference non-existent fields

    def get_stream_assignments(self, obj):
        """Return list of stream assignments for this subject"""
        return SchoolStreamSubjectAssignmentSerializer(
            obj.stream_assignments.all(), many=True
        ).data

    def validate_code(self, value):
        """Ensure subject code follows the new format"""
        if not value:
            raise serializers.ValidationError("Subject code is required.")

        # Convert to uppercase
        value = value.upper()

        # Enhanced format validation for new code structure
        import re

        # Updated regex to support new naming convention with dots and descriptive codes
        if not re.match(r"^[A-Z][A-Z0-9\.\-]{1,14}$", value):
            raise serializers.ValidationError(
                "Subject code must follow format: SUBJECT-LEVEL (e.g., Maths-N-NUR, Eng.S-PRI, Chem. Core-Sc-SSS)"
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



    # validate_practical_hours method removed - field doesn't exist in model

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

        # Assessment validation removed - fields don't exist in model

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
                    "last_updated": getattr(instance, 'updated_at', None),
                    "requires_attention": (not getattr(instance, 'is_active', True)),
                    "has_resource_requirements": getattr(instance, 'requires_lab', False)
                    or getattr(instance, 'requires_special_equipment', False),
                    "curriculum_alignment": getattr(instance, 'curriculum_version', None)
                    or "Not specified",
                }

        return data


class SubjectListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""

    status_summary = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
            "short_name",
            "code",
            "category",
            "education_levels",
            "is_cross_cutting",
            "is_active",
            "status_summary",
            "subject_order",
        ]

    def get_status_summary(self, obj):
        """Get concise status summary"""
        if not getattr(obj, 'is_active', True):
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
            "subject_order",
            "grade_level_ids",
            "prerequisite_ids",
        ]

    def validate_code(self, value):
        """Ensure subject code is unique and properly formatted"""
        if not value:
            raise serializers.ValidationError("Subject code is required.")

        # Convert to uppercase
        value = value.upper()

        # Enhanced format validation for new code structure
        import re

        # Updated regex to support new naming convention with dots and descriptive codes
        if not re.match(r"^[A-Z][A-Z0-9\.\-]{1,14}$", value):
            raise serializers.ValidationError(
                "Subject code must follow format: SUBJECT-LEVEL (e.g., Maths-N-NUR, Eng.S-PRI, Chem. Core-Sc-SSS)"
            )

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
            # "practical_hours",  # Field doesn't exist in model
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
            # "practical_hours",  # Field doesn't exist in model
            # "requires_specialist_teacher",  # Field doesn't exist in model
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

        education_levels = getattr(obj, 'education_levels', [])
        nursery_levels = getattr(obj, 'nursery_levels', [])
        
        if education_levels:
            for level in education_levels:
                level_dict = dict(EDUCATION_LEVELS)
                level_info = {
                    "code": level,
                    "name": level_dict.get(level, level),
                    "is_current": True,
                }

                # Add nursery sub-levels if applicable
                if level == "NURSERY" and nursery_levels:
                    nursery_dict = dict(NURSERY_LEVELS)
                    level_info["sub_levels"] = [
                        {
                            "code": sub_level,
                            "name": nursery_dict.get(sub_level, sub_level),
                        }
                        for sub_level in nursery_levels
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
            "nursery_compatible": "NURSERY" in getattr(obj, 'education_levels', []),
            "primary_compatible": "PRIMARY" in getattr(obj, 'education_levels', []),
            "junior_secondary_compatible": "JUNIOR_SECONDARY" in getattr(obj, 'education_levels', []),
            "senior_secondary_compatible": "SENIOR_SECONDARY" in getattr(obj, 'education_levels', []),
            "all_levels": not getattr(obj, 'education_levels', []),
            "cross_cutting": obj.is_cross_cutting,
            "activity_based": False,  # Field moved to stream configuration
        }

    def get_level_specific_info(self, obj):
        """Get level-specific information"""
        info = {
            "general": {
                # "requires_specialist": obj.requires_specialist_teacher,  # Field doesn't exist
                # "has_practical": obj.has_practical,  # Field doesn't exist
            }
        }

        # Add nursery-specific info
        if "NURSERY" in getattr(obj, 'education_levels', []):
            info["nursery"] = {
                "is_activity_based": False,  # Field moved to stream configuration
                "applicable_levels": getattr(obj, 'nursery_levels_display', ''),
            }

        # Add Senior Secondary specific info
        if "SENIOR_SECONDARY" in getattr(obj, 'education_levels', []):
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

    # is_compulsory filter removed - field moved to stream configuration

    is_cross_cutting = serializers.BooleanField(
        required=False, help_text="Filter cross-cutting subjects"
    )

    # is_activity_based filter removed - field moved to stream configuration

    # requires_specialist filter removed - field doesn't exist in model

    # has_practical filter removed - field doesn't exist in model

    is_active = serializers.BooleanField(
        default=True, help_text="Filter by active status"
    )


class SchoolStreamConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for school stream configurations"""
    
    school_name = serializers.CharField(default='My School', read_only=True)
    stream_name = serializers.CharField(source='stream.name', read_only=True)
    stream_type = serializers.CharField(source='stream.stream_type', read_only=True)
    subject_role_display = serializers.CharField(source='get_subject_role_display', read_only=True)
    stream_id = serializers.IntegerField(source='stream.id', read_only=True)
    subjects = serializers.SerializerMethodField()
    
    def get_subjects(self, obj):
        """Get subjects assigned to this stream configuration"""
        assignments = obj.subject_assignments.filter(is_active=True)
        subjects = []
        for assignment in assignments:
            subjects.append({
                'id': assignment.subject.id,
                'name': assignment.subject.name,
                'code': assignment.subject.code,
                'is_compulsory': assignment.is_compulsory,
                'credit_weight': assignment.credit_weight,
            })
        return subjects
    
    class Meta:
        model = SchoolStreamConfiguration
        fields = [
            'id', 'school_id', 'school_name', 'stream', 'stream_id', 'stream_name', 'stream_type',
            'subject_role', 'subject_role_display', 'min_subjects_required', 
            'max_subjects_allowed', 'is_compulsory', 'display_order', 'is_active',
            'subjects', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SchoolStreamSubjectAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for stream subject assignments"""
    
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    stream_config_info = SchoolStreamConfigurationSerializer(source='stream_config', read_only=True)
    
    class Meta:
        model = SchoolStreamSubjectAssignment
        fields = [
            'id', 'stream_config', 'stream_config_info', 'subject', 'subject_name', 
            'subject_code', 'is_compulsory', 'credit_weight', 'can_be_elective_elsewhere',
            'prerequisites', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class StreamConfigurationSummarySerializer(serializers.Serializer):
    """Serializer for stream configuration summary"""
    
    stream_id = serializers.IntegerField()
    stream_name = serializers.CharField()
    stream_type = serializers.CharField()
    
    cross_cutting_subjects = serializers.ListField(child=serializers.DictField())
    core_subjects = serializers.ListField(child=serializers.DictField())
    elective_subjects = serializers.ListField(child=serializers.DictField())
    
    total_subjects = serializers.IntegerField()
    min_subjects_required = serializers.IntegerField()
    max_subjects_allowed = serializers.IntegerField()
