from rest_framework import serializers
from .models import Attendance
from students.models import Student
from teacher.models import Teacher
from classroom.models import Stream


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()
    teacher = serializers.PrimaryKeyRelatedField(queryset=Teacher.objects.all(), required=False, allow_null=True)
    student_stream = serializers.SerializerMethodField()
    student_stream_name = serializers.SerializerMethodField()
    student_stream_type = serializers.SerializerMethodField()
    student_education_level = serializers.SerializerMethodField()
    student_education_level_display = serializers.SerializerMethodField()
    student_class_display = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            "id",
            "student",
            "student_name",
            "teacher",
            "teacher_name",
            "section",
            "date",
            "status",
            "time_in",
            "time_out",
            "student_stream",
            "student_stream_name",
            "student_stream_type",
            "student_education_level",
            "student_education_level_display",
            "student_class_display",
        ]
        extra_kwargs = {
            'student': {'required': True},
            'section': {'required': True},
            'date': {'required': True},
            'status': {'required': True},
        }

    def get_student_name(self, obj):
        return (
            f"{obj.student.user.first_name} {obj.student.user.last_name}" if obj.student and obj.student.user else None
        )

    def get_teacher_name(self, obj):
        return (
            f"{obj.teacher.user.first_name} {obj.teacher.user.last_name}" if obj.teacher and obj.teacher.user else None
        )

    def get_student_stream(self, obj):
        return obj.student.stream.id if obj.student and obj.student.stream else None

    def get_student_stream_name(self, obj):
        return obj.student.stream.name if obj.student and obj.student.stream else None

    def get_student_stream_type(self, obj):
        return obj.student.stream.stream_type if obj.student and obj.student.stream else None

    def get_student_education_level(self, obj):
        return obj.student.education_level if obj.student else None

    def get_student_education_level_display(self, obj):
        return obj.student.get_education_level_display() if obj.student else None

    def get_student_class_display(self, obj):
        return obj.student.get_student_class_display() if obj.student else None
