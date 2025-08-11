from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    SchoolSettings,
    ClassLevel,
    Subject,
    AcademicSession,
    Term,
    GradingSystem,
    Grade,
    TimetableSettings,
    Role,
    Permission,
    Announcement,
    QuickLink,
    UserProfile,
)


class ClassLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassLevel
        fields = ["id", "name", "order"]


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name", "code"]


class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = ["id", "name", "start_date", "end_date", "order"]


class AcademicSessionSerializer(serializers.ModelSerializer):
    terms = TermSerializer(many=True, read_only=True)

    class Meta:
        model = AcademicSession
        fields = ["id", "name", "start_date", "end_date", "is_current", "terms"]


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ["id", "letter", "min_score", "max_score"]


class GradingSystemSerializer(serializers.ModelSerializer):
    grades = GradeSerializer(many=True, read_only=True)

    class Meta:
        model = GradingSystem
        fields = ["id", "pass_mark", "grades"]


class TimetableSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimetableSettings
        fields = ["id", "max_periods_per_day", "min_break_minutes"]


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ["id", "module", "permission_type", "granted"]


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    user_count = serializers.ReadOnlyField()

    # Nested permissions structure for frontend compatibility
    permissions_dict = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "description",
            "color",
            "is_system",
            "user_count",
            "permissions",
            "permissions_dict",
        ]

    def get_permissions_dict(self, obj):
        """
        Convert permissions to nested dictionary structure
        matching the frontend format
        """
        permissions_dict = {}

        # Initialize all modules with default permissions
        modules = [
            "dashboard",
            "students",
            "teachers",
            "attendance",
            "results",
            "messaging",
            "finance",
            "reports",
            "settings",
        ]

        for module in modules:
            permissions_dict[module] = {
                "read": False,
                "write": False,
                "delete": False,
                "admin": False,
            }

        # Set actual permissions
        for permission in obj.permissions.all():
            if permission.module in permissions_dict:
                permissions_dict[permission.module][
                    permission.permission_type
                ] = permission.granted

        return permissions_dict


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "content",
            "active",
            "order",
            "created_at",
            "updated_at",
        ]


class QuickLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuickLink
        fields = ["id", "title", "url", "icon", "active", "order"]


class UserProfileSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source="role.name", read_only=True)
    role_color = serializers.CharField(source="role.color", read_only=True)
    full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    needs_password_reset = serializers.ReadOnlyField()

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",
            "email",
            "full_name",
            "role",
            "role_name",
            "role_color",
            "avatar",
            "phone",
            "address",
            "date_of_birth",
            "is_approved",
            "email_verified",
            "last_password_change",
            "needs_password_reset",
            "created_at",
            "updated_at",
        ]


class SchoolSettingsSerializer(serializers.ModelSerializer):
    # Custom fields for frontend compatibility
    logo_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()

    class Meta:
        model = SchoolSettings
        fields = [
            # General Settings
            "id",
            "school_name",
            "school_address",
            "school_phone",
            "school_email",
            "school_website",
            "academic_year",
            "current_term",
            "school_motto",
            "logo_url",
            "favicon_url",
            # System Preferences
            "timezone",
            "date_format",
            "time_format",
            "language",
            "auto_save",
            "notifications_enabled",
            "dark_mode",
            "maintenance_mode",
            "session_timeout",
            "max_login_attempts",
            # Design Settings
            "primary_color",
            "theme",
            "animations_enabled",
            "compact_mode",
            "typography",
            "border_radius",
            "shadow_style",
            # Timestamps
            "created_at",
            "updated_at",
        ]

    def get_logo_url(self, obj):
        if obj.logo:
            # Return relative URL so it works with frontend proxy
            return f"/media/school_logos/{obj.logo.name.split('/')[-1]}"
        return None

    def get_favicon_url(self, obj):
        if obj.favicon:
            # Return relative URL so it works with frontend proxy
            return f"/media/school_favicons/{obj.favicon.name.split('/')[-1]}"
        return None


# Write-only serializers for updates
class SchoolSettingsUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating school settings without nested relationships"""

    class Meta:
        model = SchoolSettings
        fields = [
            "school_name",
            "school_address",
            "school_phone",
            "school_email",
            "school_website",
            "academic_year",
            "current_term",
            "school_motto",
            "logo",
            "favicon",
            "timezone",
            "date_format",
            "time_format",
            "language",
            "auto_save",
            "notifications_enabled",
            "dark_mode",
            "maintenance_mode",
            "session_timeout",
            "max_login_attempts",
        ]


class ClassLevelCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassLevel
        fields = ["name", "order"]

    def create(self, validated_data):
        school_settings = self.context["school_settings"]
        return ClassLevel.objects.create(
            school_settings=school_settings, **validated_data
        )


class SubjectCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["name", "code"]

    def create(self, validated_data):
        school_settings = self.context["school_settings"]
        return Subject.objects.create(school_settings=school_settings, **validated_data)


class AcademicSessionCreateUpdateSerializer(serializers.ModelSerializer):
    terms_data = serializers.ListField(
        child=serializers.CharField(max_length=50), write_only=True, required=False
    )

    class Meta:
        model = AcademicSession
        fields = ["name", "start_date", "end_date", "is_current", "terms_data"]

    def create(self, validated_data):
        terms_data = validated_data.pop("terms_data", [])
        school_settings = self.context["school_settings"]

        session = AcademicSession.objects.create(
            school_settings=school_settings, **validated_data
        )

        # Create terms
        for i, term_name in enumerate(terms_data, 1):
            Term.objects.create(session=session, name=term_name, order=i)

        return session

    def update(self, instance, validated_data):
        terms_data = validated_data.pop("terms_data", None)

        # Update session
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update terms if provided
        if terms_data is not None:
            # Delete existing terms
            instance.terms.all().delete()

            # Create new terms
            for i, term_name in enumerate(terms_data, 1):
                Term.objects.create(session=instance, name=term_name, order=i)

        return instance


class GradeCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ["letter", "min_score", "max_score"]

    def validate(self, data):
        if data["min_score"] > data["max_score"]:
            raise serializers.ValidationError(
                "Minimum score cannot be greater than maximum score."
            )
        return data


class GradingSystemUpdateSerializer(serializers.ModelSerializer):
    grades_data = GradeCreateUpdateSerializer(
        many=True, write_only=True, required=False
    )

    class Meta:
        model = GradingSystem
        fields = ["pass_mark", "grades_data"]

    def update(self, instance, validated_data):
        grades_data = validated_data.pop("grades_data", None)

        # Update grading system
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update grades if provided
        if grades_data is not None:
            # Delete existing grades
            instance.grades.all().delete()

            # Create new grades
            for grade_data in grades_data:
                Grade.objects.create(grading_system=instance, **grade_data)

        return instance


class RoleCreateUpdateSerializer(serializers.ModelSerializer):
    permissions_data = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = Role
        fields = ["name", "description", "color", "permissions_data"]

    def create(self, validated_data):
        permissions_data = validated_data.pop("permissions_data", {})
        school_settings = self.context["school_settings"]

        role = Role.objects.create(school_settings=school_settings, **validated_data)

        # Create permissions
        self._create_permissions(role, permissions_data)

        return role

    def update(self, instance, validated_data):
        permissions_data = validated_data.pop("permissions_data", None)

        # Update role
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update permissions if provided
        if permissions_data is not None:
            # Delete existing permissions
            instance.permissions.all().delete()

            # Create new permissions
            self._create_permissions(instance, permissions_data)

        return instance

    def _create_permissions(self, role, permissions_data):
        """Helper method to create permissions from nested dictionary"""
        for module, module_permissions in permissions_data.items():
            for permission_type, granted in module_permissions.items():
                Permission.objects.create(
                    role=role,
                    module=module,
                    permission_type=permission_type,
                    granted=granted,
                )


class AnnouncementCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ["title", "content", "active", "order"]

    def create(self, validated_data):
        school_settings = self.context["school_settings"]
        return Announcement.objects.create(
            school_settings=school_settings, **validated_data
        )


class QuickLinkCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuickLink
        fields = ["title", "url", "icon", "active", "order"]

    def create(self, validated_data):
        school_settings = self.context["school_settings"]
        return QuickLink.objects.create(
            school_settings=school_settings, **validated_data
        )


class TimetableSettingsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimetableSettings
        fields = ["max_periods_per_day", "min_break_minutes"]


# Bulk operations serializers
class BulkClassLevelSerializer(serializers.Serializer):
    class_levels = ClassLevelCreateUpdateSerializer(many=True)

    def create(self, validated_data):
        school_settings = self.context["school_settings"]
        class_levels_data = validated_data["class_levels"]

        # Delete existing class levels
        ClassLevel.objects.filter(school_settings=school_settings).delete()

        # Create new class levels
        class_levels = []
        for class_level_data in class_levels_data:
            class_levels.append(
                ClassLevel(school_settings=school_settings, **class_level_data)
            )

        return ClassLevel.objects.bulk_create(class_levels)


class BulkSubjectSerializer(serializers.Serializer):
    subjects = SubjectCreateUpdateSerializer(many=True)

    def create(self, validated_data):
        school_settings = self.context["school_settings"]
        subjects_data = validated_data["subjects"]

        # Delete existing subjects
        Subject.objects.filter(school_settings=school_settings).delete()

        # Create new subjects
        subjects = []
        for subject_data in subjects_data:
            subjects.append(Subject(school_settings=school_settings, **subject_data))

        return Subject.objects.bulk_create(subjects)


class BulkAnnouncementSerializer(serializers.Serializer):
    announcements = AnnouncementCreateUpdateSerializer(many=True)

    def create(self, validated_data):
        school_settings = self.context["school_settings"]
        announcements_data = validated_data["announcements"]

        # Delete existing announcements
        Announcement.objects.filter(school_settings=school_settings).delete()

        # Create new announcements
        announcements = []
        for announcement_data in announcements_data:
            announcements.append(
                Announcement(school_settings=school_settings, **announcement_data)
            )

        return Announcement.objects.bulk_create(announcements)


class BulkQuickLinkSerializer(serializers.Serializer):
    quick_links = QuickLinkCreateUpdateSerializer(many=True)

    def create(self, validated_data):
        school_settings = self.context["school_settings"]
        quick_links_data = validated_data["quick_links"]

        # Delete existing quick links
        QuickLink.objects.filter(school_settings=school_settings).delete()

        # Create new quick links
        quick_links = []
        for quick_link_data in quick_links_data:
            quick_links.append(
                QuickLink(school_settings=school_settings, **quick_link_data)
            )

        return QuickLink.objects.bulk_create(quick_links)
