from rest_framework import serializers
from .models import (
    SchoolSettings, 
    NotificationSettings, 
    SystemPreferences, 
    SchoolHoliday, 
    SchoolAnnouncement
)


class SchoolSettingsSerializer(serializers.ModelSerializer):
    """Serializer for school settings"""
    
    class Meta:
        model = SchoolSettings
        fields = [
            'id', 'school_name', 'school_address', 'school_phone', 'school_email', 
            'school_website', 'academic_year', 'current_term', 'school_motto',
            'timezone', 'date_format', 'time_format', 'language',
            'logo', 'favicon', 'auto_save', 'notifications_enabled', 'dark_mode',
            'maintenance_mode', 'session_timeout', 'max_login_attempts',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        """Custom representation to include logo and favicon URLs"""
        data = super().to_representation(instance)
        
        # Only try to build absolute URLs if we have a request context
        if hasattr(self, 'context') and 'request' in self.context:
            if instance.logo:
                data['logo_url'] = self.context['request'].build_absolute_uri(instance.logo.url)
            if instance.favicon:
                data['favicon_url'] = self.context['request'].build_absolute_uri(instance.favicon.url)
        else:
            # Fallback to relative URLs
            if instance.logo:
                data['logo_url'] = instance.logo.url if instance.logo else None
            if instance.favicon:
                data['favicon_url'] = instance.favicon.url if instance.favicon else None
        
        return data


class NotificationSettingsSerializer(serializers.ModelSerializer):
    """Serializer for notification settings"""
    
    class Meta:
        model = NotificationSettings
        fields = [
            'id', 'user_type', 'email_notifications', 'sms_notifications',
            'push_notifications', 'in_app_notifications', 'academic_updates',
            'attendance_alerts', 'fee_reminders', 'exam_notifications',
            'general_announcements', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SystemPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for system preferences"""
    
    class Meta:
        model = SystemPreferences
        fields = [
            'id', 'grading_system', 'pass_percentage', 'max_attendance_percentage',
            'currency', 'currency_symbol', 'late_fee_percentage',
            'password_min_length', 'password_require_special', 'password_require_numbers',
            'password_require_uppercase', 'auto_backup', 'backup_frequency',
            'backup_retention_days', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SchoolHolidaySerializer(serializers.ModelSerializer):
    """Serializer for school holidays"""
    
    class Meta:
        model = SchoolHoliday
        fields = [
            'id', 'name', 'start_date', 'end_date', 'description',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SchoolAnnouncementSerializer(serializers.ModelSerializer):
    """Serializer for school announcements"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = SchoolAnnouncement
        fields = [
            'id', 'title', 'content', 'announcement_type', 'is_active',
            'is_pinned', 'target_audience', 'start_date', 'end_date',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GeneralSettingsUpdateSerializer(serializers.Serializer):
    """Serializer for updating general settings"""
    
    # School Information
    school_name = serializers.CharField(max_length=200, required=False)
    school_address = serializers.CharField(required=False, allow_blank=True)
    school_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    school_email = serializers.EmailField(required=False, allow_blank=True)
    school_website = serializers.URLField(required=False, allow_blank=True)
    
    # Academic Information
    academic_year = serializers.CharField(max_length=20, required=False)
    current_term = serializers.CharField(max_length=20, required=False)
    school_motto = serializers.CharField(max_length=200, required=False, allow_blank=True)
    
    # System Preferences
    timezone = serializers.CharField(max_length=50, required=False)
    date_format = serializers.CharField(max_length=20, required=False)
    time_format = serializers.ChoiceField(choices=[("12", "12-hour"), ("24", "24-hour")], required=False)
    language = serializers.ChoiceField(choices=[("en", "English"), ("es", "Spanish"), ("fr", "French")], required=False)
    
    # General Preferences
    auto_save = serializers.BooleanField(required=False)
    notifications_enabled = serializers.BooleanField(required=False)
    dark_mode = serializers.BooleanField(required=False)
    maintenance_mode = serializers.BooleanField(required=False)
    
    # Session Management
    session_timeout = serializers.IntegerField(min_value=5, max_value=480, required=False)
    max_login_attempts = serializers.IntegerField(min_value=1, max_value=20, required=False)


class LogoUploadSerializer(serializers.Serializer):
    """Serializer for logo upload"""
    logo = serializers.ImageField(
        max_length=None,
        allow_empty_file=False,
        use_url=True,
        required=True
    )
    
    def validate_logo(self, value):
        """Validate logo file"""
        # Check file size (max 2MB)
        if value.size > 2 * 1024 * 1024:
            raise serializers.ValidationError("Logo file size must be less than 2MB")
        
        # Check file extension
        allowed_extensions = ['jpg', 'jpeg', 'png', 'gif']
        file_extension = value.name.split('.')[-1].lower()
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(f"Only {', '.join(allowed_extensions)} files are allowed")
        
        return value


class FaviconUploadSerializer(serializers.Serializer):
    """Serializer for favicon upload"""
    favicon = serializers.ImageField(
        max_length=None,
        allow_empty_file=False,
        use_url=True,
        required=True
    )
    
    def validate_favicon(self, value):
        """Validate favicon file"""
        # Check file size (max 1MB)
        if value.size > 1 * 1024 * 1024:
            raise serializers.ValidationError("Favicon file size must be less than 1MB")
        
        # Check file extension
        allowed_extensions = ['ico', 'png']
        file_extension = value.name.split('.')[-1].lower()
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(f"Only {', '.join(allowed_extensions)} files are allowed")
        
        return value


class SettingsSummarySerializer(serializers.Serializer):
    """Serializer for settings summary"""
    school_name = serializers.CharField()
    academic_year = serializers.CharField()
    current_term = serializers.CharField()
    timezone = serializers.CharField()
    language = serializers.CharField()
    dark_mode = serializers.BooleanField()
    maintenance_mode = serializers.BooleanField()
    logo_url = serializers.CharField(allow_null=True)
    favicon_url = serializers.CharField(allow_null=True)
    last_updated = serializers.DateTimeField() 