from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user information serializer"""

    full_name = serializers.ReadOnlyField()
    short_name = serializers.ReadOnlyField()
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "middle_name",
            "last_name",
            "full_name",
            "short_name",
            "role",
            "role_display",
            "is_active",
            "email_verified",
            "date_joined",
            "last_login",
        ]
        read_only_fields = [
            "id",
            "email",
            "is_active",
            "email_verified",
            "date_joined",
            "last_login",
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    """Complete user profile serializer"""

    user = UserBasicSerializer(read_only=True)

    # Read-only computed fields from the model
    display_name = serializers.ReadOnlyField()
    short_name = serializers.ReadOnlyField()
    user_role = serializers.ReadOnlyField()
    is_verified = serializers.ReadOnlyField()
    primary_phone = serializers.ReadOnlyField()
    profile_image_url = serializers.ReadOnlyField()

    # Gender display
    gender_display = serializers.CharField(source="get_gender_display", read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "user",
            "phone_number",
            "address",
            "profile_picture",
            "bio",
            "date_of_birth",
            "gender",
            "gender_display",
            "linkedin_url",
            "twitter_url",
            "facebook_url",
            "is_profile_public",
            "receive_notifications",
            "display_name",
            "short_name",
            "user_role",
            "is_verified",
            "primary_phone",
            "profile_image_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "display_name",
            "short_name",
            "user_role",
            "is_verified",
            "primary_phone",
            "profile_image_url",
            "created_at",
            "updated_at",
        ]

    def validate_phone_number(self, value):
        """Validate phone number format"""
        if value and not value.startswith("+234"):
            # Auto-format if user enters without country code
            if value.startswith("0"):
                value = "+234" + value[1:]
            elif value.startswith("234"):
                value = "+" + value
            elif len(value) == 10:
                value = "+234" + value
        return value

    def validate_date_of_birth(self, value):
        """Validate date of birth"""
        if value:
            from datetime import date

            if value > date.today():
                raise serializers.ValidationError(
                    "Date of birth cannot be in the future."
                )

            # Check if user is at least 13 years old (common age requirement)
            age = date.today().year - value.year
            if age < 13:
                raise serializers.ValidationError("User must be at least 13 years old.")
        return value

    def validate_bio(self, value):
        """Validate bio length"""
        if value and len(value) > 500:
            raise serializers.ValidationError("Bio cannot exceed 500 characters.")
        return value


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating profile information only"""

    class Meta:
        model = UserProfile
        fields = [
            "phone_number",
            "address",
            "bio",
            "date_of_birth",
            "gender",
            "linkedin_url",
            "twitter_url",
            "facebook_url",
            "is_profile_public",
            "receive_notifications",
        ]

    def validate_phone_number(self, value):
        """Validate phone number format"""
        if value and not value.startswith("+234"):
            if value.startswith("0"):
                value = "+234" + value[1:]
            elif value.startswith("234"):
                value = "+" + value
            elif len(value) == 10:
                value = "+234" + value
        return value


class UserProfileSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for profile summary"""

    display_name = serializers.ReadOnlyField()
    short_name = serializers.ReadOnlyField()
    user_role = serializers.ReadOnlyField()
    is_verified = serializers.ReadOnlyField()
    primary_phone = serializers.ReadOnlyField()
    profile_image_url = serializers.ReadOnlyField()
    email = serializers.CharField(source="user.email", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    date_joined = serializers.DateTimeField(source="user.date_joined", read_only=True)
    last_login = serializers.DateTimeField(source="user.last_login", read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "display_name",
            "short_name",
            "email",
            "user_role",
            "is_verified",
            "primary_phone",
            "profile_image_url",
            "is_active",
            "date_joined",
            "last_login",
            "bio",
            "address",
        ]


class UserProfileContactSerializer(serializers.ModelSerializer):
    """Serializer for contact information"""

    email = serializers.CharField(source="user.email", read_only=True)
    primary_phone = serializers.ReadOnlyField()

    class Meta:
        model = UserProfile
        fields = [
            "email",
            "primary_phone",
            "address",
            "linkedin_url",
            "twitter_url",
            "facebook_url",
        ]


class UserProfilePictureSerializer(serializers.ModelSerializer):
    """Serializer for profile picture upload"""

    profile_image_url = serializers.ReadOnlyField()

    class Meta:
        model = UserProfile
        fields = ["profile_picture", "profile_image_url"]

    def validate_profile_picture(self, value):
        """Validate profile picture"""
        if value:
            # Check file size (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Profile picture cannot exceed 5MB.")

            # Check file type
            allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    "Only JPEG, PNG, GIF, and WebP images are allowed."
                )
        return value


class UserVerificationStatusSerializer(serializers.ModelSerializer):
    """Serializer for user verification status"""

    email_verified = serializers.BooleanField(
        source="user.email_verified", read_only=True
    )
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    verification_code_valid = serializers.SerializerMethodField()
    can_login = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ["email_verified", "is_active", "verification_code_valid", "can_login"]

    def get_verification_code_valid(self, obj):
        """Check if verification code is valid"""
        return (
            hasattr(obj.user, "is_verification_code_valid")
            and obj.user.is_verification_code_valid()
        )

    def get_can_login(self, obj):
        """Check if user can login"""
        return obj.user.is_active and obj.user.email_verified


class UserPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for user preferences"""

    subscribe_newsletter = serializers.BooleanField(
        source="user.subscribe_newsletter", read_only=True
    )

    class Meta:
        model = UserProfile
        fields = ["is_profile_public", "receive_notifications", "subscribe_newsletter"]
        read_only_fields = ["subscribe_newsletter"]


class UserFullProfileDataSerializer(serializers.Serializer):
    """Serializer for the complete profile data dictionary"""

    user_id = serializers.IntegerField()
    email = serializers.EmailField()
    username = serializers.CharField()
    full_name = serializers.CharField()
    short_name = serializers.CharField()
    first_name = serializers.CharField()
    middle_name = serializers.CharField(allow_null=True)
    last_name = serializers.CharField()
    role = serializers.CharField()
    phone_number = serializers.CharField(allow_null=True)
    address = serializers.CharField(allow_null=True)
    bio = serializers.CharField(allow_null=True)
    date_of_birth = serializers.DateField(allow_null=True)
    gender = serializers.CharField(allow_null=True)
    profile_picture = serializers.URLField(allow_null=True)
    is_verified = serializers.BooleanField()
    is_active = serializers.BooleanField()
    date_joined = serializers.DateTimeField()
    last_login = serializers.DateTimeField(allow_null=True)
    social_media = serializers.DictField()
    preferences = serializers.DictField()
