# parent/permissions.py

from rest_framework.permissions import BasePermission


class IsParent(BasePermission):
    """
    Allows access only to users with the 'parent' role.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "parent"


class IsParentOrAdmin(BasePermission):
    """
    🔥 UPDATED: Allows access to parents, staff, superusers, AND section admins.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Superusers and staff always have access
        if user.is_superuser or user.is_staff:
            return True

        # Get user role
        role = getattr(user, "role", None)

        if not role:
            return False

        # Allow parent role
        if role == "parent":
            return True

        # 🔥 NEW: Allow all admin roles (section admins)
        admin_roles = [
            "admin",
            "principal",
            "secondary_admin",
            "nursery_admin",
            "primary_admin",
            "junior_secondary_admin",
            "senior_secondary_admin",
        ]

        if role in admin_roles:
            return True

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Superusers and staff have full access
        if user.is_superuser or user.is_staff:
            return True

        # Get user role
        role = getattr(user, "role", None)

        if not role:
            return False

        # Section admins have access (filtering handled by mixin)
        admin_roles = [
            "admin",
            "principal",
            "secondary_admin",
            "nursery_admin",
            "primary_admin",
            "junior_secondary_admin",
            "senior_secondary_admin",
        ]

        if role in admin_roles:
            return True

        # Parents can only access their own profile
        if role == "parent" and hasattr(user, "parent_profile"):
            return obj == user.parent_profile

        return False
