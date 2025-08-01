from rest_framework import serializers
from .models import Student
from users.models import CustomUser
from parent.models import ParentProfile
from django.contrib.auth.models import BaseUserManager, User
from django.contrib.auth.base_user import AbstractBaseUser
from utils import generate_unique_username


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
    is_active = serializers.BooleanField(required=False)
    parents = serializers.SerializerMethodField()
    emergency_contacts = serializers.SerializerMethodField()
    profile_picture = serializers.CharField(read_only=True, allow_blank=True, allow_null=True)
    classroom = serializers.CharField(allow_blank=True, allow_null=True, required=False)

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
            "is_active",
            "admission_date",
            "parent_contact",
            "emergency_contact",
            "emergency_contacts",
            "medical_conditions",
            "special_requirements",
            "parents",
            "profile_picture",
            "classroom",
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
        """Returns detailed parent information including contact details and relationship."""
        parent_data = []
        from parent.models import ParentStudentRelationship
        relationships = ParentStudentRelationship.objects.filter(student=obj)
        for rel in relationships.select_related('parent__user'):
            parent_profile = rel.parent
            parent_info = {
                "id": parent_profile.id,
                "full_name": parent_profile.user.full_name,
                "email": parent_profile.user.email,
                "phone": getattr(parent_profile, "phone", None),
                "relationship": rel.relationship,  # <-- This is now correct
                "is_primary_contact": rel.is_primary_contact,
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

    # profile_picture is now a URL string, just return it directly

    # def get_profile_picture(self, obj):
    #     # Prefer userprofile image, fallback to user.profile_picture
    #     if hasattr(obj.user, "profile") and getattr(
    #         obj.user.profile, "profile_picture", None
    #     ):
    #         try:
    #             return obj.user.profile.profile_picture.url
    #         except Exception:
    #             pass
    #     return getattr(obj.user, "profile_picture", None)

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
    is_active = serializers.BooleanField()
    parent_count = serializers.SerializerMethodField()
    profile_picture = serializers.CharField(read_only=True, allow_blank=True, allow_null=True)
    classroom = serializers.CharField(allow_blank=True, allow_null=True, required=False)

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
            "is_active",
            "parent_contact",
            "parent_count",
            "admission_date",
            "profile_picture",
            "classroom",
        ]

    def get_full_name(self, obj):
        return obj.user.full_name

    def get_age(self, obj):
        return obj.age

    def get_parent_count(self, obj):
        """Returns the number of registered parents."""
        return obj.parents.count()

    # profile_picture is now a URL string, just return it directly


class StudentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new students with automatic parent creation."""

    user_email = serializers.EmailField(write_only=True)
    user_first_name = serializers.CharField(write_only=True, max_length=30)
    user_last_name = serializers.CharField(write_only=True, max_length=30)
    user_middle_name = serializers.CharField(
        write_only=True, max_length=30, required=False, allow_blank=True
    )

    # Registration number field
    registration_number = serializers.CharField(
        max_length=20, required=False, allow_blank=True, allow_null=True
    )

    # ADD THIS: Profile picture support for creation
    profile_picture = serializers.URLField(required=False, allow_null=True)

    # Parent fields (optional when linking to existing parent)
    existing_parent_id = serializers.IntegerField(write_only=True, required=False)
    parent_first_name = serializers.CharField(
        write_only=True, max_length=30, required=False
    )
    parent_last_name = serializers.CharField(
        write_only=True, max_length=30, required=False
    )
    parent_email = serializers.EmailField(write_only=True, required=False)
    parent_contact = serializers.CharField(
        write_only=True, max_length=15, required=False
    )
    parent_address = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    relationship = serializers.ChoiceField(
        choices=["Father", "Mother", "Guardian", "Sponsor"],
        write_only=True,
        required=False,
    )
    is_primary_contact = serializers.BooleanField(write_only=True, required=False)
    classroom = serializers.CharField(required=False, allow_blank=True, allow_null=True)

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
            "profile_picture",  # ADD THIS
            "classroom",
            "existing_parent_id",
            "parent_first_name",
            "parent_last_name",
            "parent_email",
            "parent_contact",
            "parent_address",
            "emergency_contact",
            "medical_conditions",
            "special_requirements",
            "relationship",
            "is_primary_contact",
        ]

    def create(self, validated_data):
        print('DEBUG validated_data:', validated_data)
        print('DEBUG profile_picture:', validated_data.get('profile_picture', None))
        # Extract profile_picture and registration_number before creating student
        profile_picture = validated_data.pop("profile_picture", None)
        registration_number = validated_data.pop("registration_number", None)

        from parent.models import ParentProfile, ParentStudentRelationship

        first_name = validated_data.pop("user_first_name")
        last_name = validated_data.pop("user_last_name")
        middle_name = validated_data.pop("user_middle_name", "")
        email = validated_data.pop("user_email")
        relationship = validated_data.pop("relationship", None)
        is_primary_contact = validated_data.pop("is_primary_contact", False)
        role = "student"
        # Check if linking to existing parent
        existing_parent_id = validated_data.pop("existing_parent_id", None)
        if existing_parent_id:
            try:
                parent_profile = ParentProfile.objects.get(id=existing_parent_id)
                parent_user = parent_profile.user
                self._generated_parent_password = None
                self._generated_parent_username = parent_user.username
            except ParentProfile.DoesNotExist:
                raise serializers.ValidationError(
                    "Parent not found with the provided ID."
                )
        else:
            parent_first_name = validated_data.pop("parent_first_name")
            parent_last_name = validated_data.pop("parent_last_name")
            parent_email = validated_data.pop("parent_email")
            parent_contact = validated_data.pop("parent_contact")
            parent_address = validated_data.pop("parent_address", "")
            if CustomUser.objects.filter(email=parent_email).exists():
                raise serializers.ValidationError(
                    "A parent with this email already exists."
                )
            import secrets
            import string

            parent_password = "".join(
                secrets.choice(string.ascii_letters + string.digits) for _ in range(10)
            )
            parent_username = generate_unique_username("parent")
            parent_user = CustomUser.objects.create_user(
                email=parent_email,
                username=parent_username,
                first_name=parent_first_name,
                last_name=parent_last_name,
                role="parent",
                password=parent_password,
                is_active=True,
            )
            parent_profile, created = ParentProfile.objects.get_or_create(
                user=parent_user,
                defaults={
                    "phone": parent_contact,
                    "address": parent_address,
                },
            )
            if not created:
                parent_profile.phone = parent_contact
                parent_profile.address = parent_address
                parent_profile.save()
            self._generated_parent_password = parent_password
            self._generated_parent_username = parent_username
        import secrets
        import string

        student_password = "".join(
            secrets.choice(string.ascii_letters + string.digits) for _ in range(10)
        )
        # Use registration number for username generation
        student_username = generate_unique_username("student", registration_number)
        student_user = CustomUser.objects.create_user(
            email=email,
            username=student_username,
            first_name=first_name,
            last_name=last_name,
            middle_name=middle_name,
            role=role,
            password=student_password,
            is_active=True,
        )
        student = Student.objects.create(
            user=student_user, 
            profile_picture=profile_picture, 
            registration_number=registration_number,
            **validated_data
        )

        print(
            f"🖼️ Created student {student.full_name} with profile_picture: {student.profile_picture}"
        )
        # Link parent and student with relationship and is_primary_contact
        ParentStudentRelationship.objects.create(
            parent=parent_profile,
            student=student,
            relationship=relationship or "Guardian",
            is_primary_contact=is_primary_contact,
        )
        # Set parent_contact from parent_profile.phone if using existing parent
        if existing_parent_id and parent_profile.phone:
            student.parent_contact = parent_profile.phone
            student.save()
        self._generated_student_password = student_password
        self._generated_student_username = student_username
        try:
            from utils.email import send_email_via_brevo

            if self._generated_parent_password:
                parent_subject = "Welcome to SchoolMS - Your Parent Account Details"
                parent_html_content = f"""
                <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">
                    <h2 style=\"color: #333; text-align: center;\">Welcome to SchoolMS!</h2>
                    <p>Hello {parent_user.first_name} {parent_user.last_name},</p>
                    <p>Your parent account has been created successfully by the school administrator.</p>
                    <p>You are now linked to your child: {first_name} {last_name}</p>
                    <p><strong>Your Login Credentials:</strong></p>
                    <ul>
                        <li><strong>Email:</strong> {parent_user.email}</li>
                        <li><strong>Password:</strong> {self._generated_parent_password}</li>
                    </ul>
                    <p>Please change your password after your first login for security.</p>
                    <p>Best regards,<br>SchoolMS Team</p>
                    <hr style=\"margin: 30px 0; border: none; border-top: 1px solid #eee;\">
                    <p style=\"color: #666; font-size: 12px; text-align: center;\">
                        This is an automated message from SchoolMS. Please do not reply to this email.
                    </p>
                </div>
                """
                send_email_via_brevo(
                    parent_subject, parent_html_content, parent_user.email
                )
            else:
                parent_subject = "New Student Added to Your Account - SchoolMS"
                parent_html_content = f"""
                <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">
                    <h2 style=\"color: #333; text-align: center;\">New Student Added</h2>
                    <p>Hello {parent_user.first_name} {parent_user.last_name},</p>
                    <p>A new student has been added to your parent account:</p>
                    <div style=\"background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px;\">
                        <p><strong>Student Name:</strong> {first_name} {last_name}</p>
                    </div>
                    <p>You can now view and manage this student's information through your parent dashboard.</p>
                    <p>Best regards,<br>SchoolMS Team</p>
                    <hr style=\"margin: 30px 0; border: none; border-top: 1px solid #eee;\">
                    <p style=\"color: #666; font-size: 12px; text-align: center;\">
                        This is an automated message from SchoolMS. Please do not reply to this email.
                    </p>
                </div>
                """
                send_email_via_brevo(
                    parent_subject, parent_html_content, parent_user.email
                )
        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send welcome emails: {e}")
        return student

    def validate(self, data):
        existing_parent_id = data.get("existing_parent_id")
        parent_fields = [
            "parent_first_name",
            "parent_last_name",
            "parent_email",
            "parent_contact",
        ]
        if existing_parent_id:
            for field in parent_fields:
                if data.get(field):
                    raise serializers.ValidationError(
                        f"Cannot provide {field} when linking to existing parent."
                    )
        else:
            for field in parent_fields:
                if not data.get(field):
                    raise serializers.ValidationError(
                        f"{field.replace('_', ' ').title()} is required when creating a new parent."
                    )
        
        # Validate registration number uniqueness
        registration_number = data.get("registration_number")
        if registration_number:
            from utils import generate_unique_username
            from users.models import CustomUser
            base_username = generate_unique_username("student", registration_number)
            if CustomUser.objects.filter(username=base_username).exists():
                raise serializers.ValidationError(f"Student with registration number '{registration_number}' already exists.")
        
        return data

    def validate_student_class(self, value):
        """Validate student class matches education level."""
        education_level = self.initial_data.get("education_level")  # type: ignore

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
