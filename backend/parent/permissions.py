from rest_framework.permissions import BasePermission


class IsParent(BasePermission):
    """
    Allows access only to users with the 'parent' role.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "parent"


class IsParentOrAdmin(BasePermission):
    """
    Allows access to parents, staff, or superusers.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (getattr(request.user, 'role', None) == 'parent' or request.user.is_staff or request.user.is_superuser)
        )
