from rest_framework import serializers
from .models import ParentProfile
from students.models import Student
from users.models import CustomUser


from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)
    recipient = serializers.StringRelatedField()

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "recipient",
            "subject",
            "content",
            "sent_at",
            "is_read",
        ]
        read_only_fields = ["id", "sender", "sent_at", "is_read"]


class StudentMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["id", "first_name", "last_name", "full_name", "grade_level"]

    def get_full_name(self, obj):
        return str(obj)  # Assumes __str__ method returns full name


class ParentProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    students = StudentMinimalSerializer(many=True, read_only=True)

    # Write-only field to update related students by their IDs
    student_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Student.objects.all(),
        source="students",
        help_text="List of student IDs to link with this parent profile",
    )

    class Meta:
        model = ParentProfile
        fields = ["id", "user", "students", "student_ids"]
        read_only_fields = ["id", "user"]

    def update(self, instance, validated_data):
        # Update the ManyToMany 'students' relationship
        students = validated_data.pop("students", None)
        if students is not None:
            instance.students.set(students)
        return super().update(instance, validated_data)

    def create(self, validated_data):
        # Auto-link the parent profile to the authenticated user
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["user"] = request.user
        return super().create(validated_data)
