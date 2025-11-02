# users/permissions.py
from rest_framework import permissions


class IsSuperAdminOnly(permissions.BasePermission):
    """
    Only superadmins can access this resource.
    Section admins are denied.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "superadmin"
        )


class IsSuperAdminOrReadOnly(permissions.BasePermission):
    """
    Superadmins have full access.
    Section admins have read-only access to their section's data.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superadmins always have full access
        if request.user.role == "superadmin":
            return True

        # Section admins can only read
        if request.user.is_section_admin:
            return request.method in permissions.SAFE_METHODS

        return False


class CanManageSection(permissions.BasePermission):
    """
    Check if user can manage resources in a specific section.
    - Superadmins can manage all sections
    - Section admins can only manage their own section
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superadmins can manage everything
        if request.user.role == "superadmin":
            return True

        # Section admins can manage their section
        return request.user.is_section_admin

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superadmins can access everything
        if request.user.role == "superadmin":
            return True

        # Section admins can only access their section's objects
        if request.user.is_section_admin:
            # Check if object has a section field
            if hasattr(obj, "section"):
                return obj.section == request.user.section
            # Check if object has a grade_level with section
            elif hasattr(obj, "grade_level") and hasattr(obj.grade_level, "section"):
                return obj.grade_level.section == request.user.section
            # Check if object is a user
            elif hasattr(obj, "role"):
                return obj.section == request.user.section

        return False


class CanViewAdminList(permissions.BasePermission):
    """
    Only superadmins can view the admin list.
    Section admins are explicitly denied.
    """

    message = "You don't have permission to view the admin list."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "superadmin"
        )


class CanManagePasswordRecovery(permissions.BasePermission):
    """
    Only superadmins can manage password recovery for other users.
    Section admins cannot access this feature.
    """

    message = "You don't have permission to manage password recovery."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "superadmin"
        )
