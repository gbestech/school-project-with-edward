from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator
from django.utils import timezone
import uuid

User = get_user_model()

class SchoolSettings(models.Model):
    """Main school settings model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # School Information
    school_name = models.CharField(max_length=200, default="Gods Treasure Schools")
    school_address = models.TextField(blank=True, null=True)
    school_phone = models.CharField(max_length=20, blank=True, null=True)
    school_email = models.EmailField(blank=True, null=True)
    school_website = models.URLField(blank=True, null=True)
    
    # Academic Information
    academic_year = models.CharField(max_length=20, default="2024-2025")
    current_term = models.CharField(max_length=20, default="First Term")
    school_motto = models.CharField(max_length=200, blank=True, null=True)
    
    # System Preferences
    timezone = models.CharField(max_length=50, default="UTC")
    date_format = models.CharField(max_length=20, default="DD/MM/YYYY")
    time_format = models.CharField(max_length=10, default="12", choices=[("12", "12-hour"), ("24", "24-hour")])
    language = models.CharField(max_length=10, default="en", choices=[("en", "English"), ("es", "Spanish"), ("fr", "French")])
    
    # Logo and Branding
    logo = models.ImageField(upload_to='school_logos/', blank=True, null=True, 
                           validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])])
    favicon = models.ImageField(upload_to='school_favicons/', blank=True, null=True,
                              validators=[FileExtensionValidator(allowed_extensions=['ico', 'png'])])
    
    # General Preferences
    auto_save = models.BooleanField(default=True)
    notifications_enabled = models.BooleanField(default=True)
    dark_mode = models.BooleanField(default=False)
    maintenance_mode = models.BooleanField(default=False)
    
    # Session Management
    session_timeout = models.IntegerField(default=30, help_text="Session timeout in minutes")
    max_login_attempts = models.IntegerField(default=5)
    
    # Created and Updated
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = "School Settings"
        verbose_name_plural = "School Settings"
    
    def __str__(self):
        return f"Settings for {self.school_name}"
    
    def save(self, *args, **kwargs):
        # Ensure only one settings instance exists
        if not self.pk and SchoolSettings.objects.exists():
            return
        super().save(*args, **kwargs)


class NotificationSettings(models.Model):
    """Notification preferences for different user types"""
    NOTIFICATION_TYPES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
        ('in_app', 'In-App Notification'),
    ]
    
    user_type = models.CharField(max_length=20, choices=[
        ('admin', 'Administrator'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
        ('parent', 'Parent'),
    ])
    
    # Notification types enabled
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)
    in_app_notifications = models.BooleanField(default=True)
    
    # Specific notification settings
    academic_updates = models.BooleanField(default=True)
    attendance_alerts = models.BooleanField(default=True)
    fee_reminders = models.BooleanField(default=True)
    exam_notifications = models.BooleanField(default=True)
    general_announcements = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Notification Setting"
        verbose_name_plural = "Notification Settings"
        unique_together = ['user_type']
    
    def __str__(self):
        return f"Notification Settings for {self.get_user_type_display()}"


class SystemPreferences(models.Model):
    """System-wide preferences and configurations"""
    
    # Academic Settings
    grading_system = models.CharField(max_length=20, default="percentage", 
                                   choices=[("percentage", "Percentage"), ("letter", "Letter Grade"), ("gpa", "GPA")])
    pass_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=40.00)
    max_attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=75.00)
    
    # Fee Settings
    currency = models.CharField(max_length=3, default="NGN")
    currency_symbol = models.CharField(max_length=5, default="₦")
    late_fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    
    # Security Settings
    password_min_length = models.IntegerField(default=8)
    password_require_special = models.BooleanField(default=True)
    password_require_numbers = models.BooleanField(default=True)
    password_require_uppercase = models.BooleanField(default=True)
    
    # Backup Settings
    auto_backup = models.BooleanField(default=True)
    backup_frequency = models.CharField(max_length=20, default="daily", 
                                     choices=[("daily", "Daily"), ("weekly", "Weekly"), ("monthly", "Monthly")])
    backup_retention_days = models.IntegerField(default=30)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "System Preference"
        verbose_name_plural = "System Preferences"
    
    def __str__(self):
        return "System Preferences"


class SchoolHoliday(models.Model):
    """School holidays and breaks"""
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "School Holiday"
        verbose_name_plural = "School Holidays"
        ordering = ['start_date']
    
    def __str__(self):
        return f"{self.name} ({self.start_date} - {self.end_date})"


class SchoolAnnouncement(models.Model):
    """School-wide announcements"""
    ANNOUNCEMENT_TYPES = [
        ('general', 'General'),
        ('academic', 'Academic'),
        ('event', 'Event'),
        ('emergency', 'Emergency'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    announcement_type = models.CharField(max_length=20, choices=ANNOUNCEMENT_TYPES, default='general')
    is_active = models.BooleanField(default=True)
    is_pinned = models.BooleanField(default=False)
    
    # Target audience
    target_audience = models.JSONField(default=list, help_text="List of user types to target")
    
    # Schedule
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(blank=True, null=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "School Announcement"
        verbose_name_plural = "School Announcements"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
