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
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["id", "first_name", "last_name", "full_name", "education_level"]

    def get_full_name(self, obj):
        return obj.user.full_name if obj.user else str(obj)


class ParentProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    students = StudentMinimalSerializer(many=True, read_only=True)
    is_active = serializers.SerializerMethodField(read_only=True)

    # Write-only field to update related students by their IDs
    student_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Student.objects.all(),
        source="students",
        help_text="List of student IDs to link with this parent profile",
        required=False,  # <-- Make it optional
    )
    # User creation fields
    user_email = serializers.EmailField(write_only=True, required=False)
    user_first_name = serializers.CharField(write_only=True, required=False)
    user_last_name = serializers.CharField(write_only=True, required=False)
    parent_contact = serializers.CharField(write_only=True, required=False)
    parent_address = serializers.CharField(write_only=True, required=False)

    parent_username = serializers.CharField(read_only=True)
    parent_password = serializers.CharField(read_only=True)

    class Meta:
        model = ParentProfile
        fields = [
            "id", "user", "students", "student_ids",
            "user_email", "user_first_name", "user_last_name",
            "parent_contact", "parent_address",
            "parent_username", "parent_password",
            "is_active"
        ]
        read_only_fields = ["id", "user", "parent_username", "parent_password", "is_active"]

    def update(self, instance, validated_data):
        students = validated_data.pop("students", None)
        if students is not None:
            instance.students.set(students)
        return super().update(instance, validated_data)

    def create(self, validated_data):
        from utils import generate_unique_username
        import secrets
        import string
        user_email = validated_data.pop("user_email", None)
        user_first_name = validated_data.pop("user_first_name", None)
        user_last_name = validated_data.pop("user_last_name", None)
        parent_contact = validated_data.pop("parent_contact", None)
        parent_address = validated_data.pop("parent_address", None)
        parent_username = None
        parent_password = None
        user = None
        if not (user_email and user_first_name and user_last_name):
            raise serializers.ValidationError("user_email, user_first_name, and user_last_name are required to create a parent user.")
        user_qs = CustomUser.objects.filter(email=user_email, role="parent")
        if user_qs.exists():
            user = user_qs.first()
            if ParentProfile.objects.filter(user=user).exists():
                raise serializers.ValidationError("A parent profile for this user already exists.")
        else:
            parent_username = generate_unique_username("parent")
            parent_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
            user = CustomUser.objects.create_user(
                email=user_email,
                username=parent_username,
                first_name=user_first_name,
                last_name=user_last_name,
                role="parent",
                password=parent_password,
                is_active=True,
            )
        print(f"Creating ParentProfile for user: {user} (username: {user.username})")
        validated_data["user"] = user
        if parent_contact:
            validated_data["phone"] = parent_contact
        if parent_address:
            validated_data["address"] = parent_address
        parent_profile = super().create(validated_data)
        parent_profile.parent_username = parent_username or user.username
        parent_profile.parent_password = parent_password or ""
        return parent_profile

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Attach credentials if present
        data["parent_username"] = getattr(instance, "parent_username", "")
        data["parent_password"] = getattr(instance, "parent_password", "")
        return data

    def get_is_active(self, obj):
        return obj.user.is_active if obj.user else False
