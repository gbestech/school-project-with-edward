from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import Exam, ExamSchedule, ExamRegistration, ExamStatistics
from result.models import StudentResult
from classroom.models import GradeLevel, Section
from subject.models import Subject
from teacher.models import Teacher
from students.models import Student


# Nested serializers for related models
class GradeLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeLevel
        fields = ["id", "name", "code", "description"]


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ["id", "name", "code", "capacity"]


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name", "code", "description", "pass_mark", "has_practical"]


class TeacherSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Teacher
        fields = ["id", "full_name", "employee_id", "email", "phone"]


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Student
        fields = ["id", "full_name", "student_id", "email"]


class ExamScheduleSerializer(serializers.ModelSerializer):
    is_registration_open = serializers.ReadOnlyField()
    is_ongoing = serializers.ReadOnlyField()

    class Meta:
        model = ExamSchedule
        fields = [
            "id",
            "name",
            "description",
            "term",
            "session_year",
            "start_date",
            "end_date",
            "registration_start",
            "registration_end",
            "results_publication_date",
            "is_active",
            "allow_late_registration",
            "is_registration_open",
            "is_ongoing",
            "created_at",
            "updated_at",
        ]


# Main Exam Serializers
class ExamListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for exam lists"""

    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    grade_level_name = serializers.CharField(source="grade_level.name", read_only=True)
    section_name = serializers.CharField(source="section.name", read_only=True)
    teacher_name = serializers.CharField(source="teacher.full_name", read_only=True)
    exam_schedule_name = serializers.CharField(
        source="exam_schedule.name", read_only=True
    )

    # Computed fields
    duration_hours = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    is_ongoing = serializers.ReadOnlyField()
    registered_students_count = serializers.ReadOnlyField()
    pass_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            "id",
            "title",
            "code",
            "exam_type",
            "exam_date",
            "start_time",
            "end_time",
            "status",
            "venue",
            "total_marks",
            "pass_marks",
            "duration_minutes",
            "subject_name",
            "subject_code",
            "grade_level_name",
            "section_name",
            "teacher_name",
            "exam_schedule_name",
            "term",
            "session_year",
            "is_practical",
            "requires_computer",
            "is_online",
            "duration_hours",
            "is_completed",
            "is_ongoing",
            "registered_students_count",
            "pass_percentage",
        ]

    def get_pass_percentage(self, obj):
        return obj.get_pass_percentage()


class ExamDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single exam view"""

    # Nested related objects
    subject = SubjectSerializer(read_only=True)
    grade_level = GradeLevelSerializer(read_only=True)
    section = SectionSerializer(read_only=True)
    teacher = TeacherSerializer(read_only=True)
    exam_schedule = ExamScheduleSerializer(read_only=True)
    invigilators = TeacherSerializer(many=True, read_only=True)

    # Computed fields
    duration_hours = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    is_ongoing = serializers.ReadOnlyField()
    registered_students_count = serializers.ReadOnlyField()
    pass_percentage = serializers.SerializerMethodField()

    # Human-readable choice fields
    exam_type_display = serializers.CharField(
        source="get_exam_type_display", read_only=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    term_display = serializers.CharField(source="get_term_display", read_only=True)
    difficulty_level_display = serializers.CharField(
        source="get_difficulty_level_display", read_only=True
    )

    class Meta:
        model = Exam
        fields = [
            "id",
            "title",
            "code",
            "description",
            "instructions",
            "subject",
            "grade_level",
            "section",
            "teacher",
            "exam_schedule",
            "invigilators",
            "exam_type",
            "exam_type_display",
            "difficulty_level",
            "difficulty_level_display",
            "exam_date",
            "start_time",
            "end_time",
            "duration_minutes",
            "duration_hours",
            "total_marks",
            "pass_marks",
            "pass_percentage",
            "venue",
            "max_students",
            "materials_allowed",
            "materials_provided",
            "status",
            "status_display",
            "is_practical",
            "requires_computer",
            "is_online",
            "term",
            "term_display",
            "session_year",
            "is_completed",
            "is_ongoing",
            "registered_students_count",
            "created_at",
            "updated_at",
        ]

    def get_pass_percentage(self, obj):
        return obj.get_pass_percentage()


class ExamCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating exams"""

    # Foreign key fields with validation
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    grade_level = serializers.PrimaryKeyRelatedField(queryset=GradeLevel.objects.all())
    section = serializers.PrimaryKeyRelatedField(queryset=Section.objects.all())
    teacher = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), required=False, allow_null=True
    )
    exam_schedule = serializers.PrimaryKeyRelatedField(
        queryset=ExamSchedule.objects.all(), required=False, allow_null=True
    )
    invigilators = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), many=True, required=False
    )

    class Meta:
        model = Exam
        fields = [
            "title",
            "code",
            "description",
            "instructions",
            "subject",
            "grade_level",
            "section",
            "teacher",
            "exam_schedule",
            "invigilators",
            "exam_type",
            "difficulty_level",
            "exam_date",
            "start_time",
            "end_time",
            "total_marks",
            "pass_marks",
            "duration_minutes",
            "venue",
            "max_students",
            "materials_allowed",
            "materials_provided",
            "status",
            "is_practical",
            "requires_computer",
            "is_online",
            "term",
            "session_year",
        ]
        extra_kwargs = {
            "code": {"required": False},  # Auto-generated if not provided
            "duration_minutes": {"required": False},  # Calculated if not provided
            "pass_marks": {"required": False},  # Set from subject if not provided
        }

    def validate(self, data):
        """Cross-field validation"""
        errors = {}

        # Validate time
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        if start_time and end_time and start_time >= end_time:
            errors["end_time"] = "End time must be after start time."

        # Validate pass marks
        pass_marks = data.get("pass_marks")
        total_marks = data.get("total_marks")
        if pass_marks and total_marks and pass_marks > total_marks:
            errors["pass_marks"] = "Pass marks cannot exceed total marks."

        # Validate exam date (only for new exams or when changing date)
        exam_date = data.get("exam_date")
        if exam_date and exam_date < timezone.now().date():
            status = data.get("status", getattr(self.instance, "status", "scheduled"))
            if status == "scheduled":
                errors["exam_date"] = "Cannot schedule exam for past date."

        # Validate subject compatibility with grade level
        subject = data.get("subject")
        grade_level = data.get("grade_level")
        if subject and grade_level:
            if hasattr(subject, "is_available_for_grade_level"):
                if not subject.is_available_for_grade_level(grade_level):
                    errors["subject"] = (
                        f"Subject {subject.name} is not available for {grade_level.name}."
                    )

        # Validate practical exam settings
        is_practical = data.get("is_practical", False)
        if (
            is_practical
            and subject
            and hasattr(subject, "has_practical")
            and not subject.has_practical
        ):
            errors["is_practical"] = (
                f"Subject {subject.name} does not have practical components."
            )

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def validate_exam_date(self, value):
        """Validate exam date"""
        if value < timezone.now().date():
            if not self.instance or self.instance.status == "scheduled":
                raise serializers.ValidationError("Cannot schedule exam for past date.")
        return value

    def validate_max_students(self, value):
        """Validate maximum students"""
        if value is not None and value <= 0:
            raise serializers.ValidationError(
                "Maximum students must be a positive number."
            )
        return value


# Registration and Result Serializers
class ExamRegistrationSerializer(serializers.ModelSerializer):
    exam = ExamListSerializer(read_only=True)
    student = StudentSerializer(read_only=True)
    exam_id = serializers.PrimaryKeyRelatedField(
        queryset=Exam.objects.all(), source="exam", write_only=True
    )
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), source="student", write_only=True
    )

    class Meta:
        model = ExamRegistration
        fields = [
            "id",
            "exam",
            "student",
            "exam_id",
            "student_id",
            "registration_date",
            "is_registered",
            "is_present",
            "has_special_needs",
            "special_needs_description",
            "extra_time_minutes",
            "seat_number",
        ]


class ResultSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    exam = ExamListSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    recorded_by = TeacherSerializer(read_only=True)

    # Computed fields
    grade_point = serializers.ReadOnlyField()
    performance_level = serializers.ReadOnlyField()

    # Human-readable fields
    grade_display = serializers.CharField(source="get_grade_display", read_only=True)
    term_display = serializers.CharField(source="get_term_display", read_only=True)

    class Meta:
        model = StudentResult
        fields = [
            "id",
            "student",
            "exam",
            "subject",
            "recorded_by",
            "score",
            "total_marks",
            "percentage",
            "grade",
            "grade_display",
            "grade_point",
            "is_pass",
            "rank_in_class",
            "performance_level",
            "continuous_assessment_score",
            "exam_score",
            "practical_score",
            "teacher_comment",
            "remarks",
            "term",
            "term_display",
            "session_year",
            "date_recorded",
            "date_updated",
        ]


class ResultCreateUpdateSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    exam = serializers.PrimaryKeyRelatedField(queryset=Exam.objects.all())
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())

    class Meta:
        model = StudentResult
        fields = [
            "student",
            "exam",
            "subject",
            "score",
            "total_marks",
            "continuous_assessment_score",
            "exam_score",
            "practical_score",
            "teacher_comment",
            "remarks",
            "term",
            "session_year",
        ]
        extra_kwargs = {
            "total_marks": {"required": False},  # Set from exam if not provided
        }

    def validate(self, data):
        """Validate result data"""
        errors = {}

        score = data.get("score")
        total_marks = data.get("total_marks")

        # Validate score against total marks
        if score and total_marks and score > total_marks:
            errors["score"] = "Score cannot exceed total marks."

        # Validate component scores
        ca_score = data.get("continuous_assessment_score", 0)
        exam_score = data.get("exam_score", 0)
        practical_score = data.get("practical_score", 0)
        component_total = ca_score + exam_score + practical_score

        if score and component_total > score:
            errors["score"] = "Total component scores cannot exceed main score."

        if errors:
            raise serializers.ValidationError(errors)

        return data


class ExamStatisticsSerializer(serializers.ModelSerializer):
    exam = ExamListSerializer(read_only=True)

    class Meta:
        model = ExamStatistics
        fields = [
            "id",
            "exam",
            "total_registered",
            "total_appeared",
            "total_absent",
            "highest_score",
            "lowest_score",
            "average_score",
            "median_score",
            "grade_a_count",
            "grade_b_count",
            "grade_c_count",
            "grade_d_count",
            "grade_e_count",
            "grade_f_count",
            "total_passed",
            "total_failed",
            "pass_percentage",
            "calculated_at",
        ]


# Specialized serializers for specific endpoints
class ExamSummarySerializer(serializers.ModelSerializer):
    """Minimal serializer for exam summaries and dropdowns"""

    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            "id",
            "title",
            "code",
            "exam_date",
            "exam_type",
            "status",
            "display_name",
        ]

    def get_display_name(self, obj):
        return f"{obj.title} - {obj.subject.name} ({obj.exam_date})"


class ExamCalendarSerializer(serializers.ModelSerializer):
    """Serializer for calendar view of exams"""

    subject_name = serializers.CharField(source="subject.name", read_only=True)
    grade_section = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            "id",
            "title",
            "exam_date",
            "start_time",
            "end_time",
            "subject_name",
            "grade_section",
            "venue",
            "status",
            "color",
        ]

    def get_grade_section(self, obj):
        return f"{obj.grade_level.name}{obj.section.name}"

    def get_color(self, obj):
        """Return color based on exam status"""
        color_map = {
            "scheduled": "#007bff",  # Blue
            "in_progress": "#28a745",  # Green
            "completed": "#6c757d",  # Gray
            "cancelled": "#dc3545",  # Red
            "postponed": "#ffc107",  # Yellow
        }
        return color_map.get(obj.status, "#007bff")


# Bulk operations serializers
class BulkExamUpdateSerializer(serializers.Serializer):
    exam_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        help_text="List of exam IDs to update",
    )
    status = serializers.ChoiceField(
        choices=Exam._meta.get_field("status").choices,
        required=False,
        help_text="New status for selected exams",
    )
    venue = serializers.CharField(max_length=100, required=False)

    def validate_exam_ids(self, value):
        """Validate that all exam IDs exist"""
        existing_ids = set(
            Exam.objects.filter(id__in=value).values_list("id", flat=True)
        )
        missing_ids = set(value) - existing_ids
        if missing_ids:
            raise serializers.ValidationError(
                f"Exam IDs not found: {list(missing_ids)}"
            )
        return value
