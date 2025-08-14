from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import (
    GradeLevel,
    Section,
    AcademicYear,
    Term,
    Student,
    Subject,
    Classroom,
    ClassroomTeacherAssignment,
    StudentEnrollment,
    ClassSchedule,
)

from teacher.models import Teacher


# User Serializer
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "full_name"]
        read_only_fields = ["id"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


# Basic Serializers
class GradeLevelSerializer(serializers.ModelSerializer):
    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True
    )
    section_count = serializers.SerializerMethodField()

    class Meta:
        model = GradeLevel
        fields = [
            "id",
            "name",
            "description",
            "education_level",
            "education_level_display",
            "order",
            "is_active",
            "section_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_section_count(self, obj):
        return obj.sections.filter(is_active=True).count()


class SectionSerializer(serializers.ModelSerializer):
    grade_level_name = serializers.CharField(source="grade_level.name", read_only=True)
    education_level = serializers.CharField(
        source="grade_level.education_level", read_only=True
    )
    education_level_display = serializers.CharField(
        source="grade_level.get_education_level_display", read_only=True
    )
    classroom_count = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = [
            "id",
            "name",
            "grade_level",
            "grade_level_name",
            "education_level",
            "education_level_display",
            "classroom_count",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_classroom_count(self, obj):
        return obj.classrooms.filter(is_active=True).count()


class AcademicYearSerializer(serializers.ModelSerializer):
    term_count = serializers.SerializerMethodField()
    classroom_count = serializers.SerializerMethodField()
    is_current_year = serializers.BooleanField(source="is_current", read_only=True)

    class Meta:
        model = AcademicYear
        fields = [
            "id",
            "name",
            "start_date",
            "end_date",
            "is_current",
            "is_current_year",
            "is_active",
            "term_count",
            "classroom_count",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_term_count(self, obj):
        return obj.terms.filter(is_active=True).count()

    def get_classroom_count(self, obj):
        return obj.classrooms.filter(is_active=True).count()

    def validate(self, data):
        if data["start_date"] >= data["end_date"]:
            raise serializers.ValidationError("End date must be after start date.")
        return data


class TermSerializer(serializers.ModelSerializer):
    academic_year_name = serializers.CharField(
        source="academic_year.name", read_only=True
    )
    name_display = serializers.CharField(source="get_name_display", read_only=True)
    classroom_count = serializers.SerializerMethodField()

    class Meta:
        model = Term
        fields = [
            "id",
            "name",
            "name_display",
            "academic_year",
            "academic_year_name",
            "start_date",
            "end_date",
            "is_current",
            "is_active",
            "classroom_count",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_classroom_count(self, obj):
        return obj.classrooms.filter(is_active=True).count()

    def validate(self, data):
        if data["start_date"] >= data["end_date"]:
            raise serializers.ValidationError("End date must be after start date.")
        return data


class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    primary_classes_count = serializers.SerializerMethodField()
    assigned_classes_count = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = [
            "id",
            "user",
            "user_id",
            "employee_id",
            "full_name",
            "phone_number",
            "address",
            "date_of_birth",
            "age",
            "hire_date",
            "qualification",
            "specialization",
            "primary_classes_count",
            "assigned_classes_count",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_age(self, obj):
        if obj.date_of_birth:
            today = timezone.now().date()
            return (
                today.year
                - obj.date_of_birth.year
                - (
                    (today.month, today.day)
                    < (obj.date_of_birth.month, obj.date_of_birth.day)
                )
            )
        return None

    def get_primary_classes_count(self, obj):
        return obj.primary_classes.filter(is_active=True).count()

    def get_assigned_classes_count(self, obj):
        return obj.assigned_classes.filter(is_active=True).count()

    def validate_employee_id(self, value):
        if (
            Teacher.objects.filter(employee_id=value)
            .exclude(pk=self.instance.pk if self.instance else None)
            .exists()
        ):
            raise serializers.ValidationError("Employee ID must be unique.")
        return value


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    current_classroom = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id",
            "admission_number",
            "first_name",
            "middle_name",
            "last_name",
            "full_name",
            "date_of_birth",
            "age",
            "gender",
            "address",
            "phone_number",
            "email",
            "guardian_name",
            "guardian_phone",
            "guardian_email",
            "guardian_relationship",
            "admission_date",
            "current_classroom",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_full_name(self, obj):
        return obj.full_name

    def get_age(self, obj):
        return obj.age

    def get_current_classroom(self, obj):
        enrollment = obj.enrolled_classes.filter(
            studentenrollment__is_active=True, is_active=True
        ).first()
        if enrollment:
            return {
                "id": enrollment.id,
                "name": enrollment.name,
                "section": enrollment.section.name,
                "grade_level": enrollment.section.grade_level.name,
            }
        return None

    def validate_admission_number(self, value):
        if (
            Student.objects.filter(admission_number=value)
            .exclude(pk=self.instance.pk if self.instance else None)
            .exists()
        ):
            raise serializers.ValidationError("Admission number must be unique.")
        return value


class SubjectSerializer(serializers.ModelSerializer):
    grade_levels_display = serializers.SerializerMethodField()
    is_core_display = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
            "code",
            "description",
            "grade_levels",
            "grade_levels_display",
            "is_core",
            "is_core_display",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_grade_levels_display(self, obj):
        return [
            {"id": gl.id, "name": gl.name, "education_level": gl.education_level}
            for gl in obj.grade_levels.all()
        ]

    def get_is_core_display(self, obj):
        return "Core Subject" if obj.is_core else "Elective Subject"

    def validate_code(self, value):
        if (
            Subject.objects.filter(code=value)
            .exclude(pk=self.instance.pk if self.instance else None)
            .exists()
        ):
            raise serializers.ValidationError("Subject code must be unique.")
        return value


# Nested Serializers for Related Models
class ClassroomTeacherAssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(
        source="teacher.user.get_full_name", read_only=True
    )
    teacher_email = serializers.CharField(
        source="teacher.user.email", read_only=True
    )
    teacher_phone = serializers.CharField(
        source="teacher.phone_number", read_only=True
    )
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_code = serializers.CharField(source="subject.code", read_only=True)

    class Meta:
        model = ClassroomTeacherAssignment
        fields = [
            "id",
            "teacher",
            "teacher_name",
            "teacher_email",
            "teacher_phone",
            "subject",
            "subject_name",
            "subject_code",
            "assigned_date",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class StudentEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    admission_number = serializers.CharField(
        source="student.admission_number", read_only=True
    )

    class Meta:
        model = StudentEnrollment
        fields = [
            "id",
            "student",
            "student_name",
            "admission_number",
            "enrollment_date",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ClassScheduleSerializer(serializers.ModelSerializer):
    day_display = serializers.CharField(
        source="get_day_of_week_display", read_only=True
    )
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    teacher_name = serializers.CharField(
        source="teacher.user.get_full_name", read_only=True
    )
    duration_minutes = serializers.SerializerMethodField()
    time_slot = serializers.SerializerMethodField()

    class Meta:
        model = ClassSchedule
        fields = [
            "id",
            "subject",
            "subject_name",
            "teacher",
            "teacher_name",
            "day_of_week",
            "day_display",
            "start_time",
            "end_time",
            "time_slot",
            "duration_minutes",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_duration_minutes(self, obj):
        return obj.duration

    def get_time_slot(self, obj):
        return f"{obj.start_time.strftime('%H:%M')} - {obj.end_time.strftime('%H:%M')}"

    def validate(self, data):
        if data["start_time"] >= data["end_time"]:
            raise serializers.ValidationError("End time must be after start time.")
        return data


# Main Classroom Serializer
class ClassroomSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(source="section.name", read_only=True)
    grade_level_name = serializers.CharField(
        source="section.grade_level.name", read_only=True
    )
    education_level = serializers.CharField(
        source="section.grade_level.education_level", read_only=True
    )
    academic_year_name = serializers.CharField(
        source="academic_year.name", read_only=True
    )
    term_name = serializers.CharField(source="term.get_name_display", read_only=True)
    class_teacher_name = serializers.CharField(
        source="class_teacher.user.get_full_name", read_only=True
    )

    # Enrollment statistics
    current_enrollment = serializers.SerializerMethodField()
    available_spots = serializers.SerializerMethodField()
    enrollment_percentage = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()

    class Meta:
        model = Classroom
        fields = [
            "id",
            "name",
            "section",
            "section_name",
            "grade_level_name",
            "education_level",
            "academic_year",
            "academic_year_name",
            "term",
            "term_name",
            "class_teacher",
            "class_teacher_name",
            "room_number",
            "max_capacity",
            "current_enrollment",
            "available_spots",
            "enrollment_percentage",
            "is_full",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_current_enrollment(self, obj):
        return obj.current_enrollment

    def get_available_spots(self, obj):
        return obj.available_spots

    def get_enrollment_percentage(self, obj):
        if obj.max_capacity > 0:
            return round((obj.current_enrollment / obj.max_capacity) * 100, 1)
        return 0

    def get_is_full(self, obj):
        return obj.is_full

    def validate_max_capacity(self, value):
        if value < 1:
            raise serializers.ValidationError("Maximum capacity must be at least 1.")
        if value > 100:
            raise serializers.ValidationError("Maximum capacity cannot exceed 100.")
        return value


# Detailed Classroom Serializer with nested data
class ClassroomDetailSerializer(ClassroomSerializer):
    teacher_assignments = serializers.SerializerMethodField()
    student_enrollments = StudentEnrollmentSerializer(
        source="studentenrollment_set", many=True, read_only=True
    )
    class_schedules = ClassScheduleSerializer(
        source="schedules", many=True, read_only=True
    )

    class Meta(ClassroomSerializer.Meta):
        fields = ClassroomSerializer.Meta.fields + [
            "teacher_assignments",
            "student_enrollments",
            "class_schedules",
        ]

    def get_teacher_assignments(self, obj):
        """Get only active teacher assignments"""
        active_assignments = obj.classroomteacherassignment_set.filter(is_active=True)
        return ClassroomTeacherAssignmentSerializer(active_assignments, many=True).data


# Simplified serializers for dropdowns/lists
class GradeLevelSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeLevel
        fields = ["id", "name", "education_level"]


class SectionSimpleSerializer(serializers.ModelSerializer):
    grade_level_name = serializers.CharField(source="grade_level.name", read_only=True)

    class Meta:
        model = Section
        fields = ["id", "name", "grade_level", "grade_level_name"]


class TeacherSimpleSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = Teacher
        fields = ["id", "employee_id", "full_name", "specialization"]


class StudentSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "admission_number", "first_name", "last_name", "full_name"]


class SubjectSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name", "code", "is_core"]


class ClassroomSimpleSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Classroom
        fields = ["id", "name", "display_name"]

    def get_display_name(self, obj):
        return str(obj)


# Bulk operation serializers
class BulkStudentEnrollmentSerializer(serializers.Serializer):
    classroom_id = serializers.IntegerField()
    student_ids = serializers.ListField(
        child=serializers.IntegerField(), min_length=1, max_length=50
    )
    enrollment_date = serializers.DateField(default=timezone.now().date())

    def validate_classroom_id(self, value):
        if not Classroom.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Invalid classroom ID.")
        return value

    def validate_student_ids(self, value):
        existing_ids = Student.objects.filter(id__in=value, is_active=True).values_list(
            "id", flat=True
        )
        invalid_ids = set(value) - set(existing_ids)
        if invalid_ids:
            raise serializers.ValidationError(
                f"Invalid student IDs: {list(invalid_ids)}"
            )
        return value
