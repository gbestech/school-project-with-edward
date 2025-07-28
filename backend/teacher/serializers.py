from rest_framework import serializers
from .models import Teacher, TeacherAssignment


class TeacherSerializer(serializers.ModelSerializer):
    # Expose fields from related user object
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    staff_type = serializers.CharField()
    level = serializers.CharField(allow_blank=True, allow_null=True)
    subjects = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    assigned_subjects = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Teacher
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "address",
            "created_at",
            "staff_type",
            "level",
            "subjects",
            "assigned_subjects",
        ]

    def create(self, validated_data):
        subjects = validated_data.pop("subjects", [])
        teacher = super().create(validated_data)
        if validated_data.get("staff_type") == "teaching" and subjects:
            from .models import TeacherAssignment
            for subject_id in subjects:
                TeacherAssignment.objects.create(teacher=teacher, subject_id=subject_id)
        return teacher

    def update(self, instance, validated_data):
        subjects = validated_data.pop("subjects", None)
        teacher = super().update(instance, validated_data)
        if validated_data.get("staff_type") == "teaching" and subjects is not None:
            from .models import TeacherAssignment
            TeacherAssignment.objects.filter(teacher=teacher).delete()
            for subject_id in subjects:
                TeacherAssignment.objects.create(teacher=teacher, subject_id=subject_id)
        return teacher

    def get_assigned_subjects(self, obj):
        from .models import TeacherAssignment
        assignments = TeacherAssignment.objects.filter(teacher=obj).select_related('subject')
        return [
            {"id": a.subject.id, "name": a.subject.name} for a in assignments if a.subject
        ]


class TeacherAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherAssignment
        fields = "__all__"
