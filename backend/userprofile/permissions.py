from rest_framework import permissions


class IsOwnerOfProfile(permissions.BasePermission):
    """
    Custom permission to only allow users to view or edit their own profile.
    """

    def has_object_permission(self, request, view, obj):
        # Only allow the user to access their own profile
        return obj.user == request.user
