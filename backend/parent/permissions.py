from rest_framework.permissions import BasePermission


class IsParent(BasePermission):
    """
    Allows access only to users with the 'parent' role.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "parent"
