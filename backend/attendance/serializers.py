from rest_framework import serializers
from .models import Attendance
from students.models import Student
from teacher.models import Teacher


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()
    teacher = serializers.PrimaryKeyRelatedField(queryset=Teacher.objects.all(), required=False, allow_null=True)

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
