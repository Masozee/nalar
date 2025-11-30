from rest_framework import permissions


class IsSelfOrAdmin(permissions.BasePermission):
    """Allow users to edit only their own profile, unless admin."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj == request.user or request.user.is_staff
