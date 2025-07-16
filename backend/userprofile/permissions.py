from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import get_user_model

User = get_user_model()


class IsOwnerOfProfile(permissions.BasePermission):
    """
    Custom permission to only allow owners of a profile to view/edit it.
    """

    message = "You can only access your own profile."

    def has_permission(self, request, view):
        """
        Check if user has permission to access the view.
        """
        if not request.user or not request.user.is_authenticated:
            return False

        # Allow access if user is authenticated and active
        if not request.user.is_active:
            self.message = "Your account is not active. Please contact support."
            return False

        return True

    def has_object_permission(self, request, view, obj):
        """
        Check if user has permission to access specific profile object.
        """
        # Profile object owner check
        if hasattr(obj, "user"):
            return obj.user == request.user

        # If obj is a User instance
        if isinstance(obj, User):
            return obj == request.user

        return False


class IsProfileOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read-only access to public profiles,
    but write access only to profile owners.
    """

    def has_permission(self, request, view):
        """
        Check if user has permission to access the view.
        """
        if not request.user or not request.user.is_authenticated:
            return request.method in permissions.SAFE_METHODS

        return request.user.is_active

    def has_object_permission(self, request, view, obj):
        """
        Check object-level permissions.
        """
        # Read permissions for public profiles
        if request.method in permissions.SAFE_METHODS:
            # Check if profile is public
            if hasattr(obj, "is_profile_public") and obj.is_profile_public:
                return True
            # If profile is private, only owner can read
            if hasattr(obj, "user"):
                return obj.user == request.user
            return False

        # Write permissions only for profile owner
        if hasattr(obj, "user"):
            return obj.user == request.user

        return False


class IsVerifiedUser(permissions.BasePermission):
    """
    Custom permission to only allow verified users to access certain views.
    """

    message = "You must verify your email address to access this resource."

    def has_permission(self, request, view):
        """
        Check if user is verified.
        """
        if not request.user or not request.user.is_authenticated:
            return False

        if not request.user.is_active:
            self.message = "Your account is not active."
            return False

        if not request.user.email_verified:
            return False

        return True


class IsActiveUser(permissions.BasePermission):
    """
    Custom permission to only allow active users to access views.
    """

    message = "Your account is not active. Please contact support."

    def has_permission(self, request, view):
        """
        Check if user is active.
        """
        if not request.user or not request.user.is_authenticated:
            return False

        return request.user.is_active


class CanUpdateProfile(permissions.BasePermission):
    """
    Custom permission for profile updates with specific rules.
    """

    def has_permission(self, request, view):
        """
        Check if user can update profiles.
        """
        if not request.user or not request.user.is_authenticated:
            return False

        if not request.user.is_active:
            return False

        # Only allow verified users to update certain fields
        if view.action in ["update_preferences", "upload_profile_picture"]:
            return request.user.email_verified

        return True

    def has_object_permission(self, request, view, obj):
        """
        Check object-level permissions for profile updates.
        """
        # Only owner can update their profile
        if hasattr(obj, "user"):
            return obj.user == request.user

        return False


class IsProfilePublic(permissions.BasePermission):
    """
    Custom permission to check if profile is public.
    """

    message = "This profile is private."

    def has_object_permission(self, request, view, obj):
        """
        Check if profile is public or if user is the owner.
        """
        # Owner can always access their profile
        if hasattr(obj, "user") and obj.user == request.user:
            return True

        # Check if profile is public
        if hasattr(obj, "is_profile_public"):
            return obj.is_profile_public

        return False


class RoleBasedPermission(permissions.BasePermission):
    """
    Custom permission based on user roles.
    """

    allowed_roles = []  # Override in subclasses

    def has_permission(self, request, view):
        """
        Check if user has required role.
        """
        if not request.user or not request.user.is_authenticated:
            return False

        if not request.user.is_active:
            return False

        if not self.allowed_roles:
            return True

        return request.user.role in self.allowed_roles


class IsAdminUser(RoleBasedPermission):
    """
    Permission for admin users only.
    """

    allowed_roles = ["admin"]
    message = "Admin access required."


class IsTeacherOrAdmin(RoleBasedPermission):
    """
    Permission for teachers and admins.
    """

    allowed_roles = ["teacher", "admin"]
    message = "Teacher or admin access required."


class IsStudentTeacherOrAdmin(RoleBasedPermission):
    """
    Permission for students, teachers, and admins.
    """

    allowed_roles = ["student", "teacher", "admin"]
    message = "Student, teacher, or admin access required."


class CanViewProfileBasedOnRole(permissions.BasePermission):
    """
    Custom permission to control profile viewing based on user roles.
    """

    def has_object_permission(self, request, view, obj):
        """
        Check if user can view profile based on role relationships.
        """
        # Owner can always view their profile
        if hasattr(obj, "user") and obj.user == request.user:
            return True

        # Public profiles can be viewed by anyone
        if hasattr(obj, "is_profile_public") and obj.is_profile_public:
            return True

        # Role-based access rules
        if request.user.role == "admin":
            return True

        if request.user.role == "teacher":
            # Teachers can view student profiles
            if hasattr(obj, "user") and obj.user.role == "student":
                return True

        if request.user.role == "parent":
            # Parents can view their children's profiles
            # (This would need additional logic based on parent-child relationships)
            pass

        return False


# Composite permissions for common use cases
class ProfileOwnerPermission(permissions.BasePermission):
    """
    Composite permission combining multiple checks for profile access.
    """

    def has_permission(self, request, view):
        """
        Check base permissions.
        """
        return request.user and request.user.is_authenticated and request.user.is_active

    def has_object_permission(self, request, view, obj):
        """
        Check object-level permissions.
        """
        # Owner check
        if hasattr(obj, "user") and obj.user == request.user:
            return True

        # For read-only operations, check if profile is public
        if request.method in permissions.SAFE_METHODS:
            if hasattr(obj, "is_profile_public") and obj.is_profile_public:
                return True

        return False


class SecureProfilePermission(permissions.BasePermission):
    """
    High-security permission for sensitive profile operations.
    """

    def has_permission(self, request, view):
        """
        Check if user meets security requirements.
        """
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and request.user.email_verified
        )

    def has_object_permission(self, request, view, obj):
        """
        Check object-level security permissions.
        """
        # Only profile owner can perform secure operations
        if hasattr(obj, "user"):
            return obj.user == request.user

        return False
