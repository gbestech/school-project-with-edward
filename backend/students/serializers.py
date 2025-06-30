from rest_framework import serializers
from .models import Student
from users.models import CustomUser
from parent.models import ParentProfile


class StudentDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    short_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    age = serializers.SerializerMethodField()
    education_level = serializers.CharField(read_only=True)
    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True
    )
    student_class_display = serializers.CharField(
        source="get_student_class_display", read_only=True
    )
    is_nursery_student = serializers.BooleanField(read_only=True)
    is_primary_student = serializers.BooleanField(read_only=True)
    is_secondary_student = serializers.BooleanField(read_only=True)
    parents = serializers.SerializerMethodField()
    emergency_contacts = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id",
            "full_name",
            "short_name",
            "email",
            "gender",
            "date_of_birth",
            "age",
            "education_level",
            "education_level_display",
            "student_class",
            "student_class_display",
            "is_nursery_student",
            "is_primary_student",
            "is_secondary_student",
            "admission_date",
            "parent_contact",
            "emergency_contact",
            "emergency_contacts",
            "medical_conditions",
            "special_requirements",
            "parents",
        ]
        read_only_fields = ["id", "admission_date", "education_level"]

    def get_full_name(self, obj):
        """Returns the full name including middle name if present."""
        return obj.user.full_name

    def get_short_name(self, obj):
        """Returns the short name (first and last name only)."""
        return obj.user.short_name

    def get_age(self, obj):
        """Returns the student's current age."""
        return obj.age

    def get_parents(self, obj):
        """Returns detailed parent information including contact details."""
        parent_data = []
        for parent in obj.parents.all():
            parent_info = {
                "id": parent.id,
                "full_name": parent.user.full_name,
                "email": parent.user.email,
                "phone": getattr(parent, "phone", None),
                "relationship": getattr(parent, "relationship", None),
                "is_primary_contact": getattr(parent, "is_primary_contact", False),
            }
            parent_data.append(parent_info)
        return parent_data

    def get_emergency_contacts(self, obj):
        """Returns formatted emergency contact information."""
        contacts = []

        # Add parent contact if available
        if obj.parent_contact:
            contacts.append(
                {"type": "Parent", "number": obj.parent_contact, "is_primary": True}
            )

        # Add emergency contact if different from parent contact
        if obj.emergency_contact and obj.emergency_contact != obj.parent_contact:
            contacts.append(
                {
                    "type": "Emergency",
                    "number": obj.emergency_contact,
                    "is_primary": False,
                }
            )

        return contacts

    def validate_student_class(self, value):
        """Validate that the student class is appropriate for the education level."""
        if self.instance:  # Only validate on updates
            education_level = self.instance.education_level

            nursery_classes = ["NURSERY_1", "NURSERY_2", "PRE_K", "KINDERGARTEN"]
            primary_classes = [
                "GRADE_1",
                "GRADE_2",
                "GRADE_3",
                "GRADE_4",
                "GRADE_5",
                "GRADE_6",
            ]
            secondary_classes = [
                "GRADE_7",
                "GRADE_8",
                "GRADE_9",
                "GRADE_10",
                "GRADE_11",
                "GRADE_12",
            ]

            if education_level == "NURSERY" and value not in nursery_classes:
                raise serializers.ValidationError(
                    "Selected class is not valid for nursery level students."
                )
            elif education_level == "PRIMARY" and value not in primary_classes:
                raise serializers.ValidationError(
                    "Selected class is not valid for primary level students."
                )
            elif education_level == "SECONDARY" and value not in secondary_classes:
                raise serializers.ValidationError(
                    "Selected class is not valid for secondary level students."
                )

        return value

    def validate_date_of_birth(self, value):
        """Validate date of birth is reasonable."""
        from datetime import date, timedelta

        today = date.today()
        min_age_date = today - timedelta(days=365 * 25)  # Max 25 years old
        max_age_date = today - timedelta(days=365 * 2)  # Min 2 years old

        if value < min_age_date:
            raise serializers.ValidationError("Student cannot be older than 25 years.")
        if value > max_age_date:
            raise serializers.ValidationError("Student must be at least 2 years old.")

        return value

    def validate(self, data):
        """Cross-field validation."""
        # Ensure nursery students have parent contact
        if data.get("education_level") == "NURSERY" or (
            self.instance and self.instance.education_level == "NURSERY"
        ):
            if not data.get("parent_contact") and not (
                self.instance and self.instance.parent_contact
            ):
                raise serializers.ValidationError(
                    "Parent contact is required for nursery students."
                )

        return data


class StudentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views."""

    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True
    )
    student_class_display = serializers.CharField(
        source="get_student_class_display", read_only=True
    )
    parent_count = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id",
            "full_name",
            "age",
            "gender",
            "education_level",
            "education_level_display",
            "student_class",
            "student_class_display",
            "parent_contact",
            "parent_count",
            "admission_date",
        ]

    def get_full_name(self, obj):
        return obj.user.full_name

    def get_age(self, obj):
        return obj.age

    def get_parent_count(self, obj):
        """Returns the number of registered parents."""
        return obj.parents.count()


class StudentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new students."""

    user_email = serializers.EmailField(write_only=True)
    user_first_name = serializers.CharField(write_only=True, max_length=30)
    user_last_name = serializers.CharField(write_only=True, max_length=30)
    user_middle_name = serializers.CharField(
        write_only=True, max_length=30, required=False, allow_blank=True
    )

    class Meta:
        model = Student
        fields = [
            "user_email",
            "user_first_name",
            "user_middle_name",
            "user_last_name",
            "gender",
            "date_of_birth",
            "education_level",
            "student_class",
            "parent_contact",
            "emergency_contact",
            "medical_conditions",
            "special_requirements",
        ]

    def create(self, validated_data):
        """Create user and student profile."""
        # Extract user data
        user_data = {
            "email": validated_data.pop("user_email"),
            "first_name": validated_data.pop("user_first_name"),
            "last_name": validated_data.pop("user_last_name"),
            "middle_name": validated_data.pop("user_middle_name", ""),
            "user_type": "student",  # Assuming you have user types
        }

        # Create user
        user = CustomUser.objects.create_user(**user_data)

        # Create student profile
        student = Student.objects.create(user=user, **validated_data)

        return student

    def validate_student_class(self, value):
        """Validate student class matches education level."""
        education_level = self.initial_data.get("education_level")

        nursery_classes = ["NURSERY_1", "NURSERY_2", "PRE_K", "KINDERGARTEN"]
        primary_classes = [
            "GRADE_1",
            "GRADE_2",
            "GRADE_3",
            "GRADE_4",
            "GRADE_5",
            "GRADE_6",
        ]
        secondary_classes = [
            "GRADE_7",
            "GRADE_8",
            "GRADE_9",
            "GRADE_10",
            "GRADE_11",
            "GRADE_12",
        ]

        if education_level == "NURSERY" and value not in nursery_classes:
            raise serializers.ValidationError(
                "Selected class is not valid for nursery level."
            )
        elif education_level == "PRIMARY" and value not in primary_classes:
            raise serializers.ValidationError(
                "Selected class is not valid for primary level."
            )
        elif education_level == "SECONDARY" and value not in secondary_classes:
            raise serializers.ValidationError(
                "Selected class is not valid for secondary level."
            )

        return value
