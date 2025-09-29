from rest_framework import serializers
from .models import Student
from users.models import CustomUser
from parent.models import ParentProfile
from django.contrib.auth.models import BaseUserManager, User
from django.contrib.auth.base_user import AbstractBaseUser
from utils import generate_unique_username
from classroom.models import Stream
from classroom.models import ClassSchedule, ClassroomTeacherAssignment


class StudentScheduleSerializer(serializers.ModelSerializer):
    """Enhanced schedule serializer for students based on teacher serializer patterns"""

    # Subject information
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    subject_id = serializers.IntegerField(source="subject.id", read_only=True)

    # Teacher information
    teacher_name = serializers.SerializerMethodField()
    teacher_id = serializers.IntegerField(source="teacher.id", read_only=True)
    teacher_qualification = serializers.CharField(
        source="teacher.qualification", read_only=True
    )

    # Classroom information
    classroom_name = serializers.CharField(source="classroom.name", read_only=True)
    classroom_id = serializers.IntegerField(source="classroom.id", read_only=True)
    room_number = serializers.CharField(source="classroom.room_number", read_only=True)

    # Section and Grade information
    section_name = serializers.CharField(
        source="classroom.section.name", read_only=True
    )
    section_id = serializers.IntegerField(source="classroom.section.id", read_only=True)
    grade_level_name = serializers.CharField(
        source="classroom.section.grade_level.name", read_only=True
    )
    grade_level_id = serializers.IntegerField(
        source="classroom.section.grade_level.id", read_only=True
    )
    education_level = serializers.CharField(
        source="classroom.section.grade_level.education_level", read_only=True
    )

    # Stream information (for Senior Secondary students)
    stream_name = serializers.CharField(source="classroom.stream.name", read_only=True)
    stream_type = serializers.CharField(
        source="classroom.stream.stream_type", read_only=True
    )

    # Academic period information
    academic_year = serializers.CharField(
        source="classroom.academic_year.name", read_only=True
    )
    term = serializers.CharField(
        source="classroom.term.get_name_display", read_only=True
    )

    # Time formatting
    start_time_display = serializers.SerializerMethodField()
    end_time_display = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    day_display = serializers.SerializerMethodField()

    # Additional computed fields
    is_current_period = serializers.SerializerMethodField()
    periods_per_week = serializers.SerializerMethodField()

    class Meta:
        model = ClassSchedule
        fields = [
            "id",
            "day_of_week",
            "start_time",
            "end_time",
            # Subject fields
            "subject_id",
            "subject_name",
            "subject_code",
            # Teacher fields
            "teacher_id",
            "teacher_name",
            "teacher_qualification",
            # Classroom fields
            "classroom_id",
            "classroom_name",
            "room_number",
            # Section and Grade fields
            "section_id",
            "section_name",
            "grade_level_id",
            "grade_level_name",
            "education_level",
            # Stream fields (for Senior Secondary)
            "stream_name",
            "stream_type",
            # Academic period fields
            "academic_year",
            "term",
            # Time display fields
            "start_time_display",
            "end_time_display",
            "duration",
            "day_display",
            # Computed fields
            "is_current_period",
            "periods_per_week",
            "is_active",
        ]
        read_only_fields = ["id", "is_active"]

    def get_start_time_display(self, obj):
        """Format start time for display"""
        if obj.start_time:
            return obj.start_time.strftime("%I:%M %p")
        return None

    def get_teacher_name(self, obj):
        user = getattr(getattr(obj, "teacher", None), "user", None)
        if not user:
            return ""
        # Try common attributes safely
        full = getattr(user, "full_name", None)
        if full:
            return full
        first = getattr(user, "first_name", "") or ""
        last = getattr(user, "last_name", "") or ""
        name = f"{first} {last}".strip()
        return name or getattr(user, "username", "")

    def get_end_time_display(self, obj):
        """Format end time for display"""
        if obj.end_time:
            return obj.end_time.strftime("%I:%M %p")
        return None

    def get_duration(self, obj):
        """Calculate class duration in minutes"""
        if obj.start_time and obj.end_time:
            from datetime import datetime, timedelta

            start = datetime.combine(datetime.today(), obj.start_time)
            end = datetime.combine(datetime.today(), obj.end_time)
            duration = end - start
            return int(duration.total_seconds() / 60)
        return None

    def get_day_display(self, obj):
        """Get full day name"""
        day_mapping = {
            "MON": "Monday",
            "TUE": "Tuesday",
            "WED": "Wednesday",
            "THU": "Thursday",
            "FRI": "Friday",
            "SAT": "Saturday",
            "SUN": "Sunday",
        }
        return day_mapping.get(obj.day_of_week, obj.day_of_week)

    def get_is_current_period(self, obj):
        """Check if this is the current period"""
        from datetime import datetime, time

        now = datetime.now()
        current_day = now.strftime("%a").upper()
        current_time = now.time()

        # Map day abbreviations
        day_map = {
            "MON": "MONDAY",
            "TUE": "TUESDAY",
            "WED": "WEDNESDAY",
            "THU": "THURSDAY",
            "FRI": "FRIDAY",
            "SAT": "SATURDAY",
            "SUN": "SUNDAY",
        }

        schedule_day = day_map.get(current_day[:3])

        return (
            obj.day_of_week == schedule_day
            and obj.start_time <= current_time <= obj.end_time
        )

    def get_periods_per_week(self, obj):
        """Get number of periods per week for this subject"""
        if (
            hasattr(obj, "teacher")
            and hasattr(obj, "classroom")
            and hasattr(obj, "subject")
        ):
            try:
                assignment = ClassroomTeacherAssignment.objects.get(
                    teacher=obj.teacher,
                    classroom=obj.classroom,
                    subject=obj.subject,
                    is_active=True,
                )
                return assignment.periods_per_week
            except ClassroomTeacherAssignment.DoesNotExist:
                return 1
        return 1


class StudentWeeklyScheduleSerializer(serializers.Serializer):
    """Serializer for student's complete weekly schedule"""

    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    classroom_name = serializers.CharField()
    education_level = serializers.CharField()
    academic_year = serializers.CharField()
    term = serializers.CharField()

    # Weekly schedule grouped by days
    monday = StudentScheduleSerializer(many=True)
    tuesday = StudentScheduleSerializer(many=True)
    wednesday = StudentScheduleSerializer(many=True)
    thursday = StudentScheduleSerializer(many=True)
    friday = StudentScheduleSerializer(many=True)
    saturday = StudentScheduleSerializer(many=True, required=False)
    sunday = StudentScheduleSerializer(many=True, required=False)

    # Summary statistics
    total_periods_per_week = serializers.IntegerField()
    total_subjects = serializers.IntegerField()
    total_teachers = serializers.IntegerField()
    average_daily_periods = serializers.FloatField()


class StudentDailyScheduleSerializer(serializers.Serializer):
    """Serializer for student's daily schedule"""

    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    classroom_name = serializers.CharField()
    date = serializers.DateField()
    day_of_week = serializers.CharField()

    # Daily periods
    periods = StudentScheduleSerializer(many=True)

    # Daily statistics
    total_periods = serializers.IntegerField()
    current_period = StudentScheduleSerializer(required=False, allow_null=True)
    next_period = StudentScheduleSerializer(required=False, allow_null=True)

    # Break times (if applicable)
    break_times = serializers.ListField(child=serializers.DictField(), required=False)


class StudentSubjectScheduleSerializer(serializers.Serializer):
    """Serializer for a specific subject's schedule for a student"""

    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    subject_id = serializers.IntegerField()
    subject_name = serializers.CharField()
    subject_code = serializers.CharField()

    # Teacher information
    teacher_id = serializers.IntegerField()
    teacher_name = serializers.CharField()
    teacher_qualification = serializers.CharField()

    # Schedule periods for this subject
    weekly_periods = StudentScheduleSerializer(many=True)

    # Subject statistics
    periods_per_week = serializers.IntegerField()
    total_duration_per_week = serializers.IntegerField()  # in minutes

    # Next class information
    next_class = StudentScheduleSerializer(required=False, allow_null=True)


class StudentDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    short_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    age = serializers.SerializerMethodField()
    education_level = serializers.CharField(read_only=True)
    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True
    )
    student_class_display = serializers.CharField(
        source="get_student_class_display", read_only=True
    )
    # Add 'name' field for frontend compatibility
    name = serializers.SerializerMethodField()
    is_nursery_student = serializers.BooleanField(read_only=True)
    is_primary_student = serializers.BooleanField(read_only=True)
    is_secondary_student = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(required=False)
    parents = serializers.SerializerMethodField()
    emergency_contacts = serializers.SerializerMethodField()
    profile_picture = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    classroom = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    section_id = serializers.SerializerMethodField()
    stream = serializers.PrimaryKeyRelatedField(
        queryset=Stream.objects.all(),
        required=False,
        allow_null=True,
        help_text="Stream for Senior Secondary students",
    )
    stream_name = serializers.CharField(source="stream.name", read_only=True)
    stream_type = serializers.CharField(source="stream.stream_type", read_only=True)

    class Meta:
        model = Student
        fields = [
            "id",
            "full_name",
            "name",
            "short_name",
            "email",
            "username",
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
            "blood_group",
            "place_of_birth",
            "address",
            "phone_number",
            "payment_method",
            "parents",
            "profile_picture",
            "classroom",
            "section_id",
            "stream",
            "stream_name",
            "stream_type",
        ]
        read_only_fields = ["id", "admission_date", "education_level"]

    def get_full_name(self, obj):
        """Returns the full name including middle name if present."""
        return obj.user.full_name

    def get_name(self, obj):
        """Returns the full name for frontend compatibility."""
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
        for rel in relationships.select_related("parent__user"):
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

    def get_section_id(self, obj):
        # Try to get the section PK based on student's class and classroom section
        if obj.classroom:
            from classroom.models import Section, GradeLevel

            # Extract section letter from classroom (e.g., "Nursery 1 A" -> "A")
            classroom_parts = obj.classroom.split()
            if len(classroom_parts) >= 2:
                section_letter = classroom_parts[-1]  # Last part should be the section

                # Map student class to grade level
                class_to_grade = {
                    "NURSERY_1": "Nursery 1",
                    "NURSERY_2": "Nursery 2",
                    "PRE_K": "Pre-K",
                    "KINDERGARTEN": "Kindergarten",
                    "GRADE_1": "Primary 1",
                    "GRADE_2": "Primary 2",
                    "GRADE_3": "Primary 3",
                    "GRADE_4": "Primary 4",
                    "GRADE_5": "Primary 5",
                    "GRADE_6": "Primary 6",
                    "GRADE_7": "JSS 1",
                    "GRADE_8": "JSS 2",
                    "GRADE_9": "JSS 3",
                    "GRADE_10": "SS 1",
                    "GRADE_11": "SS 2",
                    "GRADE_12": "SS 3",
                    # Add direct mappings for the actual class names used in database
                    "SS1": "SS 1",
                    "SS2": "SS 2",
                    "SS3": "SS 3",
                    "SS_1": "SS 1",
                    "SS_2": "SS 2",
                    "SS_3": "SS 3",
                    "JSS1": "JSS 1",
                    "JSS2": "JSS 2",
                    "JSS3": "JSS 3",
                    "JSS_1": "JSS 1",
                    "JSS_2": "JSS 2",
                    "JSS_3": "JSS 3",
                    # Add mappings for the actual classroom names used
                    "PRIMARY_1": "Primary 1",
                    "PRIMARY_2": "Primary 2",
                    "PRIMARY_3": "Primary 3",
                    "PRIMARY_4": "Primary 4",
                    "PRIMARY_5": "Primary 5",
                    "PRIMARY_6": "Primary 6",
                }

                grade_name = class_to_grade.get(obj.student_class)
                if grade_name:
                    try:
                        grade_level = GradeLevel.objects.get(name=grade_name)
                        section = Section.objects.get(
                            name=section_letter, grade_level=grade_level
                        )
                        return section.id
                    except (GradeLevel.DoesNotExist, Section.DoesNotExist):
                        return None
        return None

    def validate_student_class(self, value):
        """Validate that the student class is appropriate for the education level."""
        if self.instance:  # Only validate on updates
            education_level = self.instance.education_level

            nursery_classes = ["PRE_NURSERY", "NURSERY_1", "NURSERY_2"]
            primary_classes = [
                "PRIMARY_1",
                "PRIMARY_2",
                "PRIMARY_3",
                "PRIMARY_4",
                "PRIMARY_5",
                "PRIMARY_6",
            ]
            secondary_classes = [
                "JSS_1",
                "JSS_2",
                "JSS_3",
                "SS_1",
                "SS_2",
                "SS_3",
            ]

            if education_level == "NURSERY" and value not in nursery_classes:
                raise serializers.ValidationError(
                    "Selected class is not valid for nursery level students."
                )
            elif education_level == "PRIMARY" and value not in primary_classes:
                raise serializers.ValidationError(
                    "Selected class is not valid for primary level students."
                )
            elif (
                education_level in ["JUNIOR_SECONDARY", "SENIOR_SECONDARY"]
                and value not in secondary_classes
            ):
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

    def to_representation(self, instance):
        """Add frontend-compatible fields dynamically"""
        data = super().to_representation(instance)
        # Add 'class' field for frontend compatibility (can't use 'class' as field name due to Python keyword)
        data['class'] = instance.student_class
        return data


class StudentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views."""

    full_name = serializers.SerializerMethodField()
    # Add 'name' field for frontend compatibility
    name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True
    )
    student_class_display = serializers.CharField(
        source="get_student_class_display", read_only=True
    )
    is_active = serializers.BooleanField()
    parent_count = serializers.SerializerMethodField()
    profile_picture = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    classroom = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    section_id = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    stream = serializers.PrimaryKeyRelatedField(
        queryset=Stream.objects.all(),
        required=False,
        allow_null=True,
        help_text="Stream for Senior Secondary students",
    )
    stream_name = serializers.CharField(source="stream.name", read_only=True)
    stream_type = serializers.CharField(source="stream.stream_type", read_only=True)

    class Meta:
        model = Student
        fields = [
            "id",
            "full_name",
            "name",
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
            "section_id",
            "user",
            "stream",
            "stream_name",
            "stream_type",
        ]

    def get_full_name(self, obj):
        return obj.user.full_name

    def get_name(self, obj):
        """Returns the full name for frontend compatibility."""
        return obj.user.full_name

    def get_age(self, obj):
        return obj.age

    def get_user(self, obj):
        """Returns user data including date_joined for sorting."""
        return {
            "id": obj.user.id,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
            "email": obj.user.email,
            "date_joined": obj.user.date_joined,
            "is_active": obj.user.is_active,
        }

    def get_parent_count(self, obj):
        """Returns the number of registered parents."""
        from parent.models import ParentStudentRelationship

        return ParentStudentRelationship.objects.filter(student=obj).count()

    def get_section_id(self, obj):
        # Try to get the section PK based on student's class and classroom section
        if obj.classroom:
            from classroom.models import Section, GradeLevel

            # Extract section letter from classroom (e.g., "Nursery 1 A" -> "A")
            classroom_parts = obj.classroom.split()
            if len(classroom_parts) >= 2:
                section_letter = classroom_parts[-1]  # Last part should be the section

                # Map student class to grade level
                class_to_grade = {
                    "NURSERY_1": "Nursery 1",
                    "NURSERY_2": "Nursery 2",
                    "PRE_K": "Pre-K",
                    "KINDERGARTEN": "Kindergarten",
                    "GRADE_1": "Primary 1",
                    "GRADE_2": "Primary 2",
                    "GRADE_3": "Primary 3",
                    "GRADE_4": "Primary 4",
                    "GRADE_5": "Primary 5",
                    "GRADE_6": "Primary 6",
                    "GRADE_7": "JSS 1",
                    "GRADE_8": "JSS 2",
                    "GRADE_9": "JSS 3",
                    "GRADE_10": "SS 1",
                    "GRADE_11": "SS 2",
                    "GRADE_12": "SS 3",
                    # Add direct mappings for the actual class names used in database
                    "SS1": "SS 1",
                    "SS2": "SS 2",
                    "SS3": "SS 3",
                    "SS_1": "SS 1",
                    "SS_2": "SS 2",
                    "SS_3": "SS 3",
                    "JSS1": "JSS 1",
                    "JSS2": "JSS 2",
                    "JSS3": "JSS 3",
                    "JSS_1": "JSS 1",
                    "JSS_2": "JSS 2",
                    "JSS_3": "JSS 3",
                    # Add mappings for the actual classroom names used
                    "PRIMARY_1": "Primary 1",
                    "PRIMARY_2": "Primary 2",
                    "PRIMARY_3": "Primary 3",
                    "PRIMARY_4": "Primary 4",
                    "PRIMARY_5": "Primary 5",
                    "PRIMARY_6": "Primary 6",
                }

                grade_name = class_to_grade.get(obj.student_class)
                if grade_name:
                    try:
                        grade_level = GradeLevel.objects.get(name=grade_name)
                        section = Section.objects.get(
                            name=section_letter, grade_level=grade_level
                        )
                        return section.id
                    except (GradeLevel.DoesNotExist, Section.DoesNotExist):
                        return None
        return None

    def to_representation(self, instance):
        """Add frontend-compatible fields dynamically"""
        data = super().to_representation(instance)
        # Add 'class' field for frontend compatibility (can't use 'class' as field name due to Python keyword)
        data['class'] = instance.student_class
        return data


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
            "registration_number",
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
        print("DEBUG validated_data:", validated_data)
        print("DEBUG profile_picture:", validated_data.get("profile_picture", None))
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
            **validated_data,
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
                raise serializers.ValidationError(
                    f"Student with registration number '{registration_number}' already exists."
                )

        return data

    def validate_student_class(self, value):
        """Validate student class matches education level."""
        education_level = self.initial_data.get("education_level")  # type: ignore

        # Use consistent class mappings that match the frontend and update serializer
        nursery_classes = ["PRE_NURSERY", "NURSERY_1", "NURSERY_2"]
        primary_classes = [
            "PRIMARY_1",
            "PRIMARY_2",
            "PRIMARY_3",
            "PRIMARY_4",
            "PRIMARY_5",
            "PRIMARY_6",
        ]
        secondary_classes = [
            "JSS_1",
            "JSS_2",
            "JSS_3",
            "SS_1",
            "SS_2",
            "SS_3",
        ]

        if education_level == "NURSERY" and value not in nursery_classes:
            raise serializers.ValidationError(
                "Selected class is not valid for nursery level."
            )
        elif education_level == "PRIMARY" and value not in primary_classes:
            raise serializers.ValidationError(
                "Selected class is not valid for primary level."
            )
        elif education_level in ["JUNIOR_SECONDARY", "SENIOR_SECONDARY"] and value not in secondary_classes:
            raise serializers.ValidationError(
                "Selected class is not valid for secondary level."
            )

        return value
