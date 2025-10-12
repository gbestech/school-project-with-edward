from rest_framework import serializers
from .models import Teacher, AssignmentRequest, TeacherSchedule
from classroom.models import GradeLevel, Section, ClassroomTeacherAssignment, Classroom
from subject.models import Subject


# Note: TeacherAssignment model has been deprecated in favor of ClassroomTeacherAssignment
# which provides proper teacher-subject-classroom mapping
class TeacherAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for the new ClassroomTeacherAssignment model"""

    grade_level_name = serializers.CharField(
        source="classroom.section.grade_level.name", read_only=True
    )
    section_name = serializers.CharField(
        source="classroom.section.name", read_only=True
    )
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    education_level = serializers.CharField(
        source="classroom.section.grade_level.education_level", read_only=True
    )
    classroom_name = serializers.CharField(source="classroom.name", read_only=True)

    class Meta:
        model = ClassroomTeacherAssignment
        fields = [
            "id",
            "teacher",
            "classroom",
            "subject",
            "grade_level_name",
            "section_name",
            "subject_name",
            "education_level",
            "classroom_name",
            "is_primary_teacher",
            "periods_per_week",
            "assigned_date",
            "is_active",
        ]


class AssignmentRequestSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(
        source="teacher.user.full_name", read_only=True
    )
    teacher_id = serializers.IntegerField(source="teacher.id", read_only=True)
    requested_subjects_names = serializers.SerializerMethodField()
    requested_grade_levels_names = serializers.SerializerMethodField()
    requested_sections_names = serializers.SerializerMethodField()
    reviewed_by_name = serializers.CharField(
        source="reviewed_by.full_name", read_only=True
    )
    days_since_submitted = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentRequest
        fields = [
            "id",
            "teacher",
            "teacher_name",
            "teacher_id",
            "request_type",
            "title",
            "description",
            "requested_subjects",
            "requested_subjects_names",
            "requested_grade_levels",
            "requested_grade_levels_names",
            "requested_sections",
            "requested_sections_names",
            "preferred_schedule",
            "reason",
            "status",
            "admin_notes",
            "submitted_at",
            "reviewed_at",
            "reviewed_by",
            "reviewed_by_name",
            "days_since_submitted",
        ]
        read_only_fields = ["teacher", "submitted_at", "reviewed_at", "reviewed_by"]

    def get_requested_subjects_names(self, obj):
        return [subject.name for subject in obj.requested_subjects.all()]

    def get_requested_grade_levels_names(self, obj):
        return [grade.name for grade in obj.requested_grade_levels.all()]

    def get_requested_sections_names(self, obj):
        return [section.name for section in obj.requested_sections.all()]

    def get_days_since_submitted(self, obj):
        from django.utils import timezone

        delta = timezone.now() - obj.submitted_at
        return delta.days


class TeacherScheduleSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    classroom_name = serializers.CharField(source="classroom.name", read_only=True)

    class Meta:
        model = TeacherSchedule
        fields = [
            "id",
            "teacher",
            "subject",
            "classroom",
            "subject_name",
            "classroom_name",
            "day_of_week",
            "start_time",
            "end_time",
            "is_active",
        ]


class TeacherSerializer(serializers.ModelSerializer):
    # User creation fields (handle both formats)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)

    # Alternative user creation fields (from frontend)
    user_first_name = serializers.CharField(write_only=True, required=False)
    user_last_name = serializers.CharField(write_only=True, required=False)
    user_email = serializers.EmailField(write_only=True, required=False)
    user_middle_name = serializers.CharField(write_only=True, required=False)

    # User profile fields
    bio = serializers.CharField(write_only=True, required=False)
    date_of_birth = serializers.DateField(write_only=True, required=False)

    # Assignment fields
    assignments = serializers.ListField(write_only=True, required=False)
    subjects = serializers.ListField(write_only=True, required=False)

    # Read-only computed fields
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email_readonly = serializers.CharField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    user = serializers.SerializerMethodField()

    # Teacher assignments using the new model
    teacher_assignments = TeacherAssignmentSerializer(many=True, read_only=True)

    # New classroom assignments field for frontend compatibility
    classroom_assignments = serializers.SerializerMethodField()

    # Additional computed fields
    total_students = serializers.SerializerMethodField()
    total_subjects = serializers.SerializerMethodField()
    years_experience = serializers.SerializerMethodField()
    assigned_subjects = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = [
            "id",
            "user",
            "employee_id",
            "staff_type",
            "level",
            "phone_number",
            "address",
            "date_of_birth",
            "hire_date",
            "qualification",
            "specialization",
            "photo",
            "is_active",
            "created_at",
            "updated_at",
            # User creation fields
            "first_name",
            "last_name",
            "password",
            # Alternative user creation fields (from frontend)
            "user_first_name",
            "user_last_name",
            "user_email",
            "user_middle_name",
            # User profile fields
            "bio",
            # Assignment fields
            "assignments",
            "subjects",
            # Read-only computed fields
            "full_name",
            "email_readonly",
            "username",
            "is_active",
            # Teacher assignments
            "teacher_assignments",
            # New classroom assignments
            "classroom_assignments",
            # Additional computed fields
            "total_students",
            "total_subjects",
            "years_experience",
            "assigned_subjects",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "user"]

    def get_total_students(self, obj):
        """Get total number of students taught by this teacher"""
        from classroom.models import ClassroomTeacherAssignment

        # Collect unique classrooms to avoid double-counting the same class across multiple subjects
        assignments = ClassroomTeacherAssignment.objects.filter(
            teacher=obj,
            is_active=True,
        ).select_related("classroom")

        unique_classroom_ids = set()
        unique_classrooms = []
        for assignment in assignments:
            classroom = assignment.classroom
            if classroom and classroom.id not in unique_classroom_ids:
                unique_classroom_ids.add(classroom.id)
                unique_classrooms.append(classroom)

        # Sum enrollment once per classroom
        return sum(c.current_enrollment for c in unique_classrooms)

    def get_total_subjects(self, obj):
        """Get total number of subjects taught by this teacher"""
        from classroom.models import ClassroomTeacherAssignment

        return ClassroomTeacherAssignment.objects.filter(
            teacher=obj, is_active=True
        ).count()

    def get_years_experience(self, obj):
        """Calculate years of experience"""
        from datetime import date

        if obj.hire_date:
            today = date.today()
            return (
                today.year
                - obj.hire_date.year
                - ((today.month, today.day) < (obj.hire_date.month, obj.hire_date.day))
            )
        return 0

    def get_user(self, obj):
        """Returns user data including date_joined for sorting."""
        if obj.user:
            user_data = {
                "id": obj.user.id,
                "first_name": obj.user.first_name,
                "last_name": obj.user.last_name,
                "email": obj.user.email,
                "username": obj.user.username,
                "date_joined": (
                    obj.user.date_joined.isoformat() if obj.user.date_joined else None
                ),  # Convert to ISO string
                "is_active": obj.user.is_active,
            }

            # Add profile information if available
            try:
                if hasattr(obj.user, "profile") and obj.user.profile:
                    user_data["bio"] = obj.user.profile.bio
                    # Ensure date_of_birth is a date, not datetime
                    if obj.user.profile.date_of_birth:
                        dob = obj.user.profile.date_of_birth
                        user_data["date_of_birth"] = (
                            dob.date() if hasattr(dob, "date") else dob
                        )
                    else:
                        user_data["date_of_birth"] = None
            except Exception as e:
                print(f"❌ Error getting user profile data: {e}")

            return user_data
        return None

    def get_assigned_subjects(self, obj):
        """Returns the subjects assigned to this teacher."""
        from classroom.models import ClassroomTeacherAssignment

        assignments = ClassroomTeacherAssignment.objects.filter(
            teacher=obj, is_active=True
        ).select_related("subject")

        # Use a set to get unique subjects
        subjects = []
        seen_subject_ids = set()

        for assignment in assignments:
            if assignment.subject and assignment.subject.id not in seen_subject_ids:
                subjects.append(
                    {
                        "id": assignment.subject.id,
                        "name": assignment.subject.name,
                        "code": assignment.subject.code,
                    }
                )
                seen_subject_ids.add(assignment.subject.id)

        return subjects

    def get_classroom_assignments(self, obj):
        """Returns the classroom assignments for this teacher in the format expected by the frontend."""
        from classroom.models import ClassroomTeacherAssignment

        assignments = ClassroomTeacherAssignment.objects.filter(
            teacher=obj, is_active=True
        ).select_related(
            "classroom",
            "classroom__section",
            "classroom__section__grade_level",
            "classroom__academic_year",
            "classroom__term",
            "subject",
        )

        classroom_assignments = []
        for assignment in assignments:
            classroom = assignment.classroom
            section = classroom.section
            grade_level = section.grade_level

            # Get student count for this classroom
            student_count = classroom.current_enrollment

            assignment_data = {
                "id": assignment.id,
                "classroom_name": classroom.name,
                "classroom_id": classroom.id,
                "section_id": section.id,  # Add section_id for attendance
                "section_name": section.name,
                "grade_level_id": grade_level.id,  # Add grade_level_id for form dropdowns
                "grade_level_name": grade_level.name,
                "education_level": grade_level.education_level,
                "academic_session": classroom.academic_session.name,
                "term": classroom.term.get_name_display(),
                "subject_id": assignment.subject.id,  # Add missing subject_id field
                "subject_name": assignment.subject.name,
                "subject_code": assignment.subject.code,
                "assigned_date": (
                    assignment.assigned_date.isoformat()
                    if assignment.assigned_date
                    else None
                ),
                "room_number": classroom.room_number or "",
                "student_count": student_count,
                "max_capacity": classroom.max_capacity,
                "is_primary_teacher": assignment.is_primary_teacher,
                "periods_per_week": assignment.periods_per_week,
            }

            # Add stream information if available (for Senior Secondary)
            if hasattr(classroom, "stream") and classroom.stream:
                assignment_data["stream_name"] = classroom.stream.name
                assignment_data["stream_type"] = (
                    classroom.stream.get_stream_type_display()
                )

            classroom_assignments.append(assignment_data)

        return classroom_assignments

    def create(self, validated_data):
        print(f"🔍 TeacherSerializer.create called")
        print(f"🔍 Validated data keys: {list(validated_data.keys())}")

        # Extract user creation data - FIXED: Handle both old and new field names
        first_name = validated_data.pop("first_name", None) or validated_data.pop(
            "user_first_name", None
        )
        last_name = validated_data.pop("last_name", None) or validated_data.pop(
            "user_last_name", None
        )
        # FIX: Use user_email, not email
        email = validated_data.pop("user_email", None) or validated_data.pop(
            "email", None
        )
        password = validated_data.pop("password", None)
        middle_name = validated_data.pop("user_middle_name", None)

        print(f"🔍 Extracted user data:")
        print(f"🔍 First name: {first_name}")
        print(f"🔍 Last name: {last_name}")
        print(f"🔍 Middle name: {middle_name}")
        print(f"🔍 Email: {email}")
        print(f"🔍 Password: {'*' * len(password) if password else 'None'}")

        # Extract profile data
        bio = validated_data.pop("bio", None)
        date_of_birth = validated_data.pop("date_of_birth", None)

        # Extract assignment data
        assignments = validated_data.pop("assignments", None)
        subjects = validated_data.pop("subjects", [])

        # Validate required fields
        if not email:
            raise serializers.ValidationError(
                "Email is required to create a teacher user account"
            )

        if not first_name or not last_name:
            raise serializers.ValidationError("First name and last name are required")

        # Create user
        user = None
        from django.contrib.auth import get_user_model

        User = get_user_model()

        print(f"🔍 Creating user with email: {email}")

        # Generate a default password if none provided
        if not password:
            import secrets
            import string

            password = "".join(
                secrets.choice(string.ascii_letters + string.digits) for _ in range(12)
            )
            print(f"🔍 Generated password: {password}")

        try:
            # Generate unique username in format: TCH/GTS/AUG/25/EMP035
            from datetime import datetime

            current_date = datetime.now()
            month = current_date.strftime("%b").upper()
            year = str(current_date.year)[-2:]  # Last 2 digits of year

            # Get employee_id from validated_data
            employee_id = validated_data.get("employee_id", "EMP001")

            # Generate username format: TCH/GTS/MONTH/YEAR/EMPLOYEE_ID
            username = f"TCH/GTS/{month}/{year}/{employee_id}"

            # Ensure username is unique
            counter = 1
            original_username = username
            while User.objects.filter(username=username).exists():
                username = f"{original_username}_{counter}"
                counter += 1

            print(f"🔍 Generated unique username: {username}")

            # Check if email already exists
            if User.objects.filter(email=email).exists():
                raise serializers.ValidationError(
                    f"A user with email {email} already exists"
                )

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name or "",
                last_name=last_name or "",
                role="teacher",
                is_active=True,
            )
            print(f"✅ Created user for teacher: {user.email}")
            print(f"✅ User ID: {user.id}")
            print(f"✅ Username: {user.username}")
            print(f"✅ User is_active: {user.is_active}")

            # Create user profile if bio or date_of_birth provided
            if bio or date_of_birth:
                try:
                    from userprofile.models import UserProfile

                    user_profile, created = UserProfile.objects.get_or_create(user=user)
                    if bio:
                        user_profile.bio = bio
                    if date_of_birth:
                        user_profile.date_of_birth = date_of_birth
                    user_profile.save()
                    print(f"✅ Created user profile")
                except Exception as e:
                    print(f"⚠️ Warning: Could not create user profile: {e}")

            # Store the generated password and username in the response
            self.context["user_password"] = password
            self.context["user_username"] = username

        except serializers.ValidationError:
            raise
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            print(f"❌ Error type: {type(e)}")
            import traceback

            print(f"❌ Full traceback: {traceback.format_exc()}")
            raise serializers.ValidationError(f"Error creating user: {str(e)}")

        print(f"🔍 About to create teacher with user: {user}")
        print(f"🔍 Validated data keys: {list(validated_data.keys())}")

        try:
            # Create teacher with explicit active status
            teacher = Teacher.objects.create(
                user=user,
                is_active=True,
                **validated_data,
            )
            print(f"✅ Created teacher: {teacher}")
            print(f"✅ Teacher is_active: {teacher.is_active}")

            # Handle teacher assignments using the new ClassroomTeacherAssignment model
            if assignments or subjects:
                self._create_classroom_assignments(teacher, assignments, subjects)

            return teacher
        except Exception as e:
            # If teacher creation fails, delete the user we just created
            print(f"❌ Error creating teacher: {e}")
            if user:
                user.delete()
                print(f"🧹 Cleaned up user after teacher creation failure")
            raise serializers.ValidationError(f"Error creating teacher: {str(e)}")

    class TeacherSerializer(serializers.ModelSerializer):
        # User creation fields (handle both formats)
        first_name = serializers.CharField(write_only=True, required=False)
        last_name = serializers.CharField(write_only=True, required=False)
        password = serializers.CharField(write_only=True, required=False)

        # Alternative user creation fields (from frontend)
        user_first_name = serializers.CharField(write_only=True, required=False)
        user_last_name = serializers.CharField(write_only=True, required=False)
        user_email = serializers.EmailField(write_only=True, required=False)
        user_middle_name = serializers.CharField(write_only=True, required=False)

        # User profile fields
        bio = serializers.CharField(write_only=True, required=False)
        date_of_birth = serializers.DateField(write_only=True, required=False)

        # Assignment fields
        assignments = serializers.ListField(write_only=True, required=False)
        subjects = serializers.ListField(write_only=True, required=False)

        # Read-only computed fields
        full_name = serializers.CharField(source="user.full_name", read_only=True)
        email_readonly = serializers.CharField(source="user.email", read_only=True)
        username = serializers.CharField(source="user.username", read_only=True)
        is_active = serializers.BooleanField(source="user.is_active", read_only=True)
        user = serializers.SerializerMethodField()

        # Teacher assignments using the new model
        teacher_assignments = TeacherAssignmentSerializer(many=True, read_only=True)

        # New classroom assignments field for frontend compatibility
        classroom_assignments = serializers.SerializerMethodField()

        # Additional computed fields
        total_students = serializers.SerializerMethodField()
        total_subjects = serializers.SerializerMethodField()
        years_experience = serializers.SerializerMethodField()
        assigned_subjects = serializers.SerializerMethodField()

        class Meta:
            model = Teacher
            fields = [
                "id",
                "user",
                "employee_id",
                "staff_type",
                "level",
                "phone_number",
                "address",
                "date_of_birth",
                "hire_date",
                "qualification",
                "specialization",
                "photo",
                "is_active",
                "created_at",
                "updated_at",
                # User creation fields
                "first_name",
                "last_name",
                "password",
                # Alternative user creation fields (from frontend)
                "user_first_name",
                "user_last_name",
                "user_email",
                "user_middle_name",
                # User profile fields
                "bio",
                # Assignment fields
                "assignments",
                "subjects",
                # Read-only computed fields
                "full_name",
                "email_readonly",
                "username",
                "is_active",
                # Teacher assignments
                "teacher_assignments",
                # New classroom assignments
                "classroom_assignments",
                # Additional computed fields
                "total_students",
                "total_subjects",
                "years_experience",
                "assigned_subjects",
            ]
            read_only_fields = ["id", "created_at", "updated_at", "user"]

        def get_total_students(self, obj):
            """Get total number of students taught by this teacher"""
            from classroom.models import ClassroomTeacherAssignment

            assignments = ClassroomTeacherAssignment.objects.filter(
                teacher=obj,
                is_active=True,
            ).select_related("classroom")

            unique_classroom_ids = set()
            unique_classrooms = []
            for assignment in assignments:
                classroom = assignment.classroom
                if classroom and classroom.id not in unique_classroom_ids:
                    unique_classroom_ids.add(classroom.id)
                    unique_classrooms.append(classroom)

            return sum(c.current_enrollment for c in unique_classrooms)

        def get_total_subjects(self, obj):
            """Get total number of subjects taught by this teacher"""
            from classroom.models import ClassroomTeacherAssignment

            return ClassroomTeacherAssignment.objects.filter(
                teacher=obj, is_active=True
            ).count()

        def get_years_experience(self, obj):
            """Calculate years of experience"""
            from datetime import date

            if obj.hire_date:
                today = date.today()
                return (
                    today.year
                    - obj.hire_date.year
                    - (
                        (today.month, today.day)
                        < (obj.hire_date.month, obj.hire_date.day)
                    )
                )
            return 0

        def get_user(self, obj):
            """Returns user data including date_joined for sorting."""
            if obj.user:
                user_data = {
                    "id": obj.user.id,
                    "first_name": obj.user.first_name,
                    "last_name": obj.user.last_name,
                    "email": obj.user.email,
                    "username": obj.user.username,
                    "date_joined": (
                        obj.user.date_joined.isoformat()
                        if obj.user.date_joined
                        else None
                    ),
                    "is_active": obj.user.is_active,
                }

                # Add profile information if available
                try:
                    if hasattr(obj.user, "profile") and obj.user.profile:
                        user_data["bio"] = obj.user.profile.bio
                        # Handle date_of_birth - ensure it's a string
                        if obj.user.profile.date_of_birth:
                            dob = obj.user.profile.date_of_birth
                            if hasattr(dob, "isoformat"):
                                user_data["date_of_birth"] = dob.isoformat()
                            else:
                                user_data["date_of_birth"] = str(dob)
                        else:
                            user_data["date_of_birth"] = None
                except Exception as e:
                    print(f"❌ Error getting user profile data: {e}")

                return user_data
            return None

        def get_assigned_subjects(self, obj):
            """Returns the subjects assigned to this teacher."""
            from classroom.models import ClassroomTeacherAssignment

            assignments = ClassroomTeacherAssignment.objects.filter(
                teacher=obj, is_active=True
            ).select_related("subject")

            subjects = []
            seen_subject_ids = set()

            for assignment in assignments:
                if assignment.subject and assignment.subject.id not in seen_subject_ids:
                    subjects.append(
                        {
                            "id": assignment.subject.id,
                            "name": assignment.subject.name,
                            "code": assignment.subject.code,
                        }
                    )
                    seen_subject_ids.add(assignment.subject.id)

            return subjects

        def get_classroom_assignments(self, obj):
            """Returns the classroom assignments for this teacher in the format expected by the frontend."""
            from classroom.models import ClassroomTeacherAssignment

            assignments = ClassroomTeacherAssignment.objects.filter(
                teacher=obj, is_active=True
            ).select_related(
                "classroom",
                "classroom__section",
                "classroom__section__grade_level",
                "classroom__academic_year",
                "classroom__term",
                "subject",
            )

            classroom_assignments = []
            for assignment in assignments:
                classroom = assignment.classroom
                section = classroom.section
                grade_level = section.grade_level

                student_count = classroom.current_enrollment

                assignment_data = {
                    "id": assignment.id,
                    "classroom_name": classroom.name,
                    "classroom_id": classroom.id,
                    "section_id": section.id,
                    "section_name": section.name,
                    "grade_level_id": grade_level.id,
                    "grade_level_name": grade_level.name,
                    "education_level": grade_level.education_level,
                    "academic_session": classroom.academic_session.name,
                    "term": classroom.term.get_name_display(),
                    "subject_id": assignment.subject.id,
                    "subject_name": assignment.subject.name,
                    "subject_code": assignment.subject.code,
                    "assigned_date": (
                        assignment.assigned_date.isoformat()
                        if assignment.assigned_date
                        else None
                    ),
                    "room_number": classroom.room_number or "",
                    "student_count": student_count,
                    "max_capacity": classroom.max_capacity,
                    "is_primary_teacher": assignment.is_primary_teacher,
                    "periods_per_week": assignment.periods_per_week,
                }

                if hasattr(classroom, "stream") and classroom.stream:
                    assignment_data["stream_name"] = classroom.stream.name
                    assignment_data["stream_type"] = (
                        classroom.stream.get_stream_type_display()
                    )

                classroom_assignments.append(assignment_data)

            return classroom_assignments

        def create(self, validated_data):
            print(f"🔍 TeacherSerializer.create called")
            print(f"🔍 Validated data keys: {list(validated_data.keys())}")

            # Extract user creation data
            first_name = validated_data.pop("first_name", None) or validated_data.pop(
                "user_first_name", None
            )
            last_name = validated_data.pop("last_name", None) or validated_data.pop(
                "user_last_name", None
            )
            email = validated_data.pop("user_email", None) or validated_data.pop(
                "email", None
            )
            password = validated_data.pop("password", None)
            middle_name = validated_data.pop("user_middle_name", None)

            # Extract profile data (MUST be removed from validated_data)
            bio = validated_data.pop("bio", None)
            date_of_birth_field = validated_data.pop("date_of_birth", None)

            # Extract assignment data
            assignments = validated_data.pop("assignments", None)
            subjects = validated_data.pop("subjects", [])

            print(f"🔍 Extracted user data:")
            print(f"🔍 First name: {first_name}")
            print(f"🔍 Last name: {last_name}")
            print(f"🔍 Email: {email}")

            # Validate required fields
            if not email:
                raise serializers.ValidationError(
                    "Email is required to create a teacher user account"
                )

            if not first_name or not last_name:
                raise serializers.ValidationError(
                    "First name and last name are required"
                )

            # Create user
            from django.contrib.auth import get_user_model

            User = get_user_model()

            # Generate password if not provided
            if not password:
                import secrets
                import string

                password = "".join(
                    secrets.choice(string.ascii_letters + string.digits)
                    for _ in range(12)
                )

            try:
                from datetime import datetime

                current_date = datetime.now()
                month = current_date.strftime("%b").upper()
                year = str(current_date.year)[-2:]

                employee_id = validated_data.get("employee_id", "EMP001")
                username = f"TCH/GTS/{month}/{year}/{employee_id}"

                counter = 1
                original_username = username
                while User.objects.filter(username=username).exists():
                    username = f"{original_username}_{counter}"
                    counter += 1

                if User.objects.filter(email=email).exists():
                    raise serializers.ValidationError(
                        f"A user with email {email} already exists"
                    )

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name or "",
                    last_name=last_name or "",
                    role="teacher",
                    is_active=True,
                )
                print(f"✅ Created user: {user.username}")

                # Create user profile if needed
                if bio or date_of_birth_field:
                    try:
                        from userprofile.models import UserProfile

                        user_profile, created = UserProfile.objects.get_or_create(
                            user=user
                        )
                        if bio:
                            user_profile.bio = bio
                        if date_of_birth_field:
                            user_profile.date_of_birth = date_of_birth_field
                        user_profile.save()
                        print(f"✅ Created user profile")
                    except Exception as e:
                        print(f"⚠️ Warning: Could not create user profile: {e}")

                self.context["user_password"] = password
                self.context["user_username"] = username

            except serializers.ValidationError:
                raise
            except Exception as e:
                print(f"❌ Error creating user: {e}")
                import traceback

                print(f"❌ Traceback: {traceback.format_exc()}")
                raise serializers.ValidationError(f"Error creating user: {str(e)}")

            try:
                teacher = Teacher.objects.create(
                    user=user,
                    is_active=True,
                    **validated_data,
                )
                print(f"✅ Created teacher: {teacher.id}")

                if assignments or subjects:
                    self._create_classroom_assignments(teacher, assignments, subjects)

                return teacher
            except Exception as e:
                print(f"❌ Error creating teacher: {e}")
                if user:
                    user.delete()
                raise serializers.ValidationError(f"Error creating teacher: {str(e)}")

        def update(self, instance, validated_data):
            # Extract assignment data
            assignments = validated_data.pop("assignments", None)
            subjects = validated_data.pop("subjects", None)

            # Handle user profile updates
            bio = validated_data.pop("bio", None)
            date_of_birth = validated_data.pop("date_of_birth", None)

            if bio is not None or date_of_birth is not None:
                try:
                    from userprofile.models import UserProfile

                    user_profile, created = UserProfile.objects.get_or_create(
                        user=instance.user
                    )
                    if bio is not None:
                        user_profile.bio = bio
                    if date_of_birth is not None:
                        user_profile.date_of_birth = date_of_birth
                    user_profile.save()
                except Exception as e:
                    print(f"❌ Error updating user profile: {e}")

            # Update teacher
            teacher = super().update(instance, validated_data)

            # Update classroom assignments if provided
            if assignments is not None or subjects is not None:
                self._create_classroom_assignments(teacher, assignments, subjects)

            return teacher

    class TeacherSerializer(serializers.ModelSerializer):
        # User creation fields (handle both formats)
        first_name = serializers.CharField(write_only=True, required=False)
        last_name = serializers.CharField(write_only=True, required=False)
        password = serializers.CharField(write_only=True, required=False)

        # Alternative user creation fields (from frontend)
        user_first_name = serializers.CharField(write_only=True, required=False)
        user_last_name = serializers.CharField(write_only=True, required=False)
        user_email = serializers.EmailField(write_only=True, required=False)
        user_middle_name = serializers.CharField(write_only=True, required=False)

        # User profile fields
        bio = serializers.CharField(write_only=True, required=False)
        date_of_birth = serializers.DateField(write_only=True, required=False)

        # Assignment fields
        assignments = serializers.ListField(write_only=True, required=False)
        subjects = serializers.ListField(write_only=True, required=False)

        # Read-only computed fields
        full_name = serializers.CharField(source="user.full_name", read_only=True)
        email_readonly = serializers.CharField(source="user.email", read_only=True)
        username = serializers.CharField(source="user.username", read_only=True)
        is_active = serializers.BooleanField(source="user.is_active", read_only=True)
        user = serializers.SerializerMethodField()

        # Teacher assignments using the new model
        teacher_assignments = TeacherAssignmentSerializer(many=True, read_only=True)

        # New classroom assignments field for frontend compatibility
        classroom_assignments = serializers.SerializerMethodField()

        # Additional computed fields
        total_students = serializers.SerializerMethodField()
        total_subjects = serializers.SerializerMethodField()
        years_experience = serializers.SerializerMethodField()
        assigned_subjects = serializers.SerializerMethodField()

        class Meta:
            model = Teacher
            fields = [
                "id",
                "user",
                "employee_id",
                "staff_type",
                "level",
                "phone_number",
                "address",
                "date_of_birth",
                "hire_date",
                "qualification",
                "specialization",
                "photo",
                "is_active",
                "created_at",
                "updated_at",
                # User creation fields
                "first_name",
                "last_name",
                "password",
                # Alternative user creation fields (from frontend)
                "user_first_name",
                "user_last_name",
                "user_email",
                "user_middle_name",
                # User profile fields
                "bio",
                # Assignment fields
                "assignments",
                "subjects",
                # Read-only computed fields
                "full_name",
                "email_readonly",
                "username",
                "is_active",
                # Teacher assignments
                "teacher_assignments",
                # New classroom assignments
                "classroom_assignments",
                # Additional computed fields
                "total_students",
                "total_subjects",
                "years_experience",
                "assigned_subjects",
            ]
            read_only_fields = ["id", "created_at", "updated_at", "user"]

        def get_total_students(self, obj):
            """Get total number of students taught by this teacher"""
            from classroom.models import ClassroomTeacherAssignment

            assignments = ClassroomTeacherAssignment.objects.filter(
                teacher=obj,
                is_active=True,
            ).select_related("classroom")

            unique_classroom_ids = set()
            unique_classrooms = []
            for assignment in assignments:
                classroom = assignment.classroom
                if classroom and classroom.id not in unique_classroom_ids:
                    unique_classroom_ids.add(classroom.id)
                    unique_classrooms.append(classroom)

            return sum(c.current_enrollment for c in unique_classrooms)

        def get_total_subjects(self, obj):
            """Get total number of subjects taught by this teacher"""
            from classroom.models import ClassroomTeacherAssignment

            return ClassroomTeacherAssignment.objects.filter(
                teacher=obj, is_active=True
            ).count()

        def get_years_experience(self, obj):
            """Calculate years of experience"""
            from datetime import date

            if obj.hire_date:
                today = date.today()
                return (
                    today.year
                    - obj.hire_date.year
                    - (
                        (today.month, today.day)
                        < (obj.hire_date.month, obj.hire_date.day)
                    )
                )
            return 0

        def get_user(self, obj):
            """Returns user data including date_joined for sorting."""
            if obj.user:
                user_data = {
                    "id": obj.user.id,
                    "first_name": obj.user.first_name,
                    "last_name": obj.user.last_name,
                    "email": obj.user.email,
                    "username": obj.user.username,
                    "date_joined": (
                        obj.user.date_joined.isoformat()
                        if obj.user.date_joined
                        else None
                    ),
                    "is_active": obj.user.is_active,
                }

                # Add profile information if available
                try:
                    if hasattr(obj.user, "profile") and obj.user.profile:
                        user_data["bio"] = obj.user.profile.bio
                        # Handle date_of_birth - ensure it's a string
                        if obj.user.profile.date_of_birth:
                            dob = obj.user.profile.date_of_birth
                            if hasattr(dob, "isoformat"):
                                user_data["date_of_birth"] = dob.isoformat()
                            else:
                                user_data["date_of_birth"] = str(dob)
                        else:
                            user_data["date_of_birth"] = None
                except Exception as e:
                    print(f"❌ Error getting user profile data: {e}")

                return user_data
            return None

        def get_assigned_subjects(self, obj):
            """Returns the subjects assigned to this teacher."""
            from classroom.models import ClassroomTeacherAssignment

            assignments = ClassroomTeacherAssignment.objects.filter(
                teacher=obj, is_active=True
            ).select_related("subject")

            subjects = []
            seen_subject_ids = set()

            for assignment in assignments:
                if assignment.subject and assignment.subject.id not in seen_subject_ids:
                    subjects.append(
                        {
                            "id": assignment.subject.id,
                            "name": assignment.subject.name,
                            "code": assignment.subject.code,
                        }
                    )
                    seen_subject_ids.add(assignment.subject.id)

            return subjects

        def get_classroom_assignments(self, obj):
            """Returns the classroom assignments for this teacher in the format expected by the frontend."""
            from classroom.models import ClassroomTeacherAssignment

            assignments = ClassroomTeacherAssignment.objects.filter(
                teacher=obj, is_active=True
            ).select_related(
                "classroom",
                "classroom__section",
                "classroom__section__grade_level",
                "classroom__academic_year",
                "classroom__term",
                "subject",
            )

            classroom_assignments = []
            for assignment in assignments:
                classroom = assignment.classroom
                section = classroom.section
                grade_level = section.grade_level

                student_count = classroom.current_enrollment

                assignment_data = {
                    "id": assignment.id,
                    "classroom_name": classroom.name,
                    "classroom_id": classroom.id,
                    "section_id": section.id,
                    "section_name": section.name,
                    "grade_level_id": grade_level.id,
                    "grade_level_name": grade_level.name,
                    "education_level": grade_level.education_level,
                    "academic_session": classroom.academic_session.name,
                    "term": classroom.term.get_name_display(),
                    "subject_id": assignment.subject.id,
                    "subject_name": assignment.subject.name,
                    "subject_code": assignment.subject.code,
                    "assigned_date": (
                        assignment.assigned_date.isoformat()
                        if assignment.assigned_date
                        else None
                    ),
                    "room_number": classroom.room_number or "",
                    "student_count": student_count,
                    "max_capacity": classroom.max_capacity,
                    "is_primary_teacher": assignment.is_primary_teacher,
                    "periods_per_week": assignment.periods_per_week,
                }

                if hasattr(classroom, "stream") and classroom.stream:
                    assignment_data["stream_name"] = classroom.stream.name
                    assignment_data["stream_type"] = (
                        classroom.stream.get_stream_type_display()
                    )

                classroom_assignments.append(assignment_data)

            return classroom_assignments

        def create(self, validated_data):
            print(f"🔍 TeacherSerializer.create called")
            print(f"🔍 Validated data keys: {list(validated_data.keys())}")

            # Extract user creation data
            first_name = validated_data.pop("first_name", None) or validated_data.pop(
                "user_first_name", None
            )
            last_name = validated_data.pop("last_name", None) or validated_data.pop(
                "user_last_name", None
            )
            email = validated_data.pop("user_email", None) or validated_data.pop(
                "email", None
            )
            password = validated_data.pop("password", None)
            middle_name = validated_data.pop("user_middle_name", None)

            # Extract profile data (MUST be removed from validated_data)
            bio = validated_data.pop("bio", None)
            date_of_birth_field = validated_data.pop("date_of_birth", None)

            # Extract assignment data
            assignments = validated_data.pop("assignments", None)
            subjects = validated_data.pop("subjects", [])

            print(f"🔍 Extracted user data:")
            print(f"🔍 First name: {first_name}")
            print(f"🔍 Last name: {last_name}")
            print(f"🔍 Email: {email}")

            # Validate required fields
            if not email:
                raise serializers.ValidationError(
                    "Email is required to create a teacher user account"
                )

            if not first_name or not last_name:
                raise serializers.ValidationError(
                    "First name and last name are required"
                )

            # Create user
            from django.contrib.auth import get_user_model

            User = get_user_model()

            # Generate password if not provided
            if not password:
                import secrets
                import string

                password = "".join(
                    secrets.choice(string.ascii_letters + string.digits)
                    for _ in range(12)
                )

            try:
                from datetime import datetime

                current_date = datetime.now()
                month = current_date.strftime("%b").upper()
                year = str(current_date.year)[-2:]

                employee_id = validated_data.get("employee_id", "EMP001")
                username = f"TCH/GTS/{month}/{year}/{employee_id}"

                counter = 1
                original_username = username
                while User.objects.filter(username=username).exists():
                    username = f"{original_username}_{counter}"
                    counter += 1

                if User.objects.filter(email=email).exists():
                    raise serializers.ValidationError(
                        f"A user with email {email} already exists"
                    )

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name or "",
                    last_name=last_name or "",
                    role="teacher",
                    is_active=True,
                )
                print(f"✅ Created user: {user.username}")

                # Create user profile if needed
                if bio or date_of_birth_field:
                    try:
                        from userprofile.models import UserProfile

                        user_profile, created = UserProfile.objects.get_or_create(
                            user=user
                        )
                        if bio:
                            user_profile.bio = bio
                        if date_of_birth_field:
                            user_profile.date_of_birth = date_of_birth_field
                        user_profile.save()
                        print(f"✅ Created user profile")
                    except Exception as e:
                        print(f"⚠️ Warning: Could not create user profile: {e}")

                self.context["user_password"] = password
                self.context["user_username"] = username

            except serializers.ValidationError:
                raise
            except Exception as e:
                print(f"❌ Error creating user: {e}")
                import traceback

                print(f"❌ Traceback: {traceback.format_exc()}")
                raise serializers.ValidationError(f"Error creating user: {str(e)}")

            try:
                teacher = Teacher.objects.create(
                    user=user,
                    is_active=True,
                    **validated_data,
                )
                print(f"✅ Created teacher: {teacher.id}")

                if assignments or subjects:
                    self._create_classroom_assignments(teacher, assignments, subjects)

                return teacher
            except Exception as e:
                print(f"❌ Error creating teacher: {e}")
                if user:
                    user.delete()
                raise serializers.ValidationError(f"Error creating teacher: {str(e)}")

        def update(self, instance, validated_data):
            print(f"🔍 TeacherSerializer.update called for teacher {instance.id}")
            print(f"🔍 Validated data keys: {list(validated_data.keys())}")

            # Extract assignment data
            assignments = validated_data.pop("assignments", None)
            subjects = validated_data.pop("subjects", None)

            print(f"🔍 Assignments data: {assignments}")
            print(f"🔍 Subjects data: {subjects}")

            # Handle user profile updates
            bio = validated_data.pop("bio", None)
            date_of_birth = validated_data.pop("date_of_birth", None)

            if bio is not None or date_of_birth is not None:
                try:
                    # Get or create user profile
                    from userprofile.models import UserProfile

                    user_profile, created = UserProfile.objects.get_or_create(
                        user=instance.user
                    )

                    if bio is not None:
                        user_profile.bio = bio
                    if date_of_birth is not None:
                        user_profile.date_of_birth = date_of_birth

                    user_profile.save()
                    print(f"✅ Updated user profile for teacher {instance.id}")
                    print(f"✅ Bio: {bio}")
                    print(f"✅ Date of birth: {date_of_birth}")
                except Exception as e:
                    print(f"❌ Error updating user profile: {e}")
                    import traceback

                    print(f"❌ Full traceback: {traceback.format_exc()}")

            # Update teacher
            teacher = super().update(instance, validated_data)

            # Update classroom assignments if provided
            if assignments is not None or subjects is not None:
                print(
                    f"🔍 Creating/updating classroom assignments for teacher {teacher.id}"
                )
                self._create_classroom_assignments(teacher, assignments, subjects)
            else:
                print(f"🔍 No assignments or subjects provided for update")

            return teacher

        def _create_classroom_assignments(self, teacher, assignments, subjects):
            """Create classroom assignments using the new ClassroomTeacherAssignment model"""
            print(f"🔍 Creating classroom assignments for teacher {teacher.id}")

            ClassroomTeacherAssignment.objects.filter(teacher=teacher).delete()

            if assignments:
                for assignment_data in assignments:
                    try:
                        classroom_id = assignment_data.get("classroom_id")
                        grade_level_id = assignment_data.get("grade_level_id")
                        section_id = assignment_data.get("section_id")
                        subject_ids = assignment_data.get("subject_ids", [])
                        is_primary = assignment_data.get("is_primary_teacher", False)
                        periods_per_week = assignment_data.get("periods_per_week", 1)

                        if classroom_id:
                            try:
                                classroom = Classroom.objects.get(id=classroom_id)
                            except Classroom.DoesNotExist:
                                continue
                        elif grade_level_id and section_id:
                            try:
                                section = Section.objects.get(id=section_id)
                                classroom = Classroom.objects.get(section=section)
                            except (Section.DoesNotExist, Classroom.DoesNotExist):
                                continue
                        else:
                            continue

                        subject_ids = assignment_data.get("subject_ids", [])
                        subject_id = assignment_data.get("subject_id")

                        if subject_ids:
                            for subj_id in subject_ids:
                                try:
                                    subject = Subject.objects.get(id=subj_id)
                                    ClassroomTeacherAssignment.objects.create(
                                        teacher=teacher,
                                        classroom=classroom,
                                        subject=subject,
                                        is_primary_teacher=is_primary,
                                        periods_per_week=periods_per_week,
                                    )
                                except Subject.DoesNotExist:
                                    continue
                        elif subject_id:
                            try:
                                subject = Subject.objects.get(id=subject_id)
                                ClassroomTeacherAssignment.objects.create(
                                    teacher=teacher,
                                    classroom=classroom,
                                    subject=subject,
                                    is_primary_teacher=is_primary,
                                    periods_per_week=periods_per_week,
                                )
                            except Subject.DoesNotExist:
                                continue
                        else:
                            print(
                                f"❌ No subject_id or subject_ids provided in assignment"
                            )

                    except Exception as e:
                        print(f"❌ Error processing assignment: {e}")
            elif subjects:
                # Handle general subject assignments (for backward compatibility)
                print(
                    f"🔍 Creating general subject assignments for {len(subjects)} subjects"
                )
                # This would need to be implemented based on your specific logic
                # For now, we'll skip this as it requires classroom context
