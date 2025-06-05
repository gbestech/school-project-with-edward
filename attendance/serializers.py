from rest_framework import serializers
from .models import Attendance
from students.models import Student
from teacher.models import Teacher


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            "id",
            "student",
            "student_name",
            "teacher",
            "teacher_name",
            "section",
            "attendance_date",
            "status",
        ]

    def get_student_name(self, obj):
        return (
            f"{obj.student.first_name} {obj.student.last_name}" if obj.student else None
        )

    def get_teacher_name(self, obj):
        return (
            f"{obj.teacher.first_name} {obj.teacher.last_name}" if obj.teacher else None
        )
