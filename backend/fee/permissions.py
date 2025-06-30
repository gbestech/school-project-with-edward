# fees/permissions.py
from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.is_staff


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Admin users have full access
        if request.user.is_staff:
            return True

        # Students can only access their own records
        if hasattr(obj, "student"):
            return obj.student.user == request.user

        return False


class IsStudentOwnerOrAdmin(permissions.BasePermission):
    """
    Permission for student fee records
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        if hasattr(request.user, "student_profile"):
            return obj.student == request.user.student_profile

        return False
