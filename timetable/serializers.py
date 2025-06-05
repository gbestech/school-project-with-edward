from rest_framework import serializers
from .models import Timetable


class TimetableSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(source="section.__str__", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    teacher_name = serializers.CharField(source="teacher.__str__", read_only=True)

    class Meta:
        model = Timetable
        fields = [
            "id",
            "section",
            "section_name",
            "subject",
            "subject_name",
            "teacher",
            "teacher_name",
            "day",
            "start_time",
            "end_time",
        ]
