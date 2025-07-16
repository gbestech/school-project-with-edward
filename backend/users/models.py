# models.py
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.utils import timezone

# User roles
ROLE_CHOICES = (
    ("admin", "Admin"),
    ("student", "Student"),
    ("teacher", "Teacher"),
    ("parent", "Parent"),
)


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("User must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)  # Superusers are active by default

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)

    def create_staffuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150)
    middle_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True, null=True)
    phone_number = models.CharField(
        max_length=20, blank=True, null=True
    )  # For SMS verification
    agree_to_terms = models.BooleanField(default=False)
    subscribe_newsletter = models.BooleanField(default=False)
    profile_picture = models.URLField(blank=True, null=True)

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    is_active = models.BooleanField(
        default=False
    )  # Users start inactive until verified
    is_staff = models.BooleanField(default=False)

    # Email/SMS verification fields
    verification_code = models.CharField(max_length=6, blank=True, null=True)
    verification_code_expires = models.DateTimeField(blank=True, null=True)
    email_verified = models.BooleanField(default=False)

    # Timestamps
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name", "role"]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        """
        Returns the full name with optional middle name.
        Format: "First Middle Last" or "First Last" if no middle name.
        """
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"

    @property
    def short_name(self):
        """
        Returns a shorter version of the name for display purposes.
        Format: "First Last" (excludes middle name)
        """
        return f"{self.first_name} {self.last_name}"

    def is_verification_code_valid(self):
        """Check if the verification code is still valid"""
        if not self.verification_code_expires:
            return False
        return timezone.now() < self.verification_code_expires

    def clear_verification_code(self):
        """Clear verification code and expiry"""
        self.verification_code = None
        self.verification_code_expires = None
        self.save()
