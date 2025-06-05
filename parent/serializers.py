from rest_framework import serializers
from .models import ParentProfile
from students.models import Student
from users.models import CustomUser


class StudentMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["id", "first_name", "last_name", "full_name", "grade_level"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class ParentProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    students = StudentMinimalSerializer(many=True, read_only=True)
    student_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Student.objects.all(), source="students"
    )

    class Meta:
        model = ParentProfile
        fields = ["id", "user", "students", "student_ids"]
        read_only_fields = ["id", "user"]

    def update(self, instance, validated_data):
        # Allow updating the related students
        students = validated_data.pop("students", None)
        if students is not None:
            instance.students.set(students)
        return super().update(instance, validated_data)

    def create(self, validated_data):
        # Link the profile to the current user automatically (optional)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["user"] = request.user
        return super().create(validated_data)
