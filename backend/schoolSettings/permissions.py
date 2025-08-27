from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import get_user_model

User = get_user_model()

class HasModulePermission(permissions.BasePermission):
    """
    Check if user has specific module permission based on HTTP method.
    """
    
    def __init__(self, module_name, permission_type=None):
        self.module_name = module_name
        self.permission_type = permission_type
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        # Determine permission type based on HTTP method
        if self.permission_type:
            permission_type = self.permission_type
        else:
            permission_type = self.get_permission_type_from_method(request.method)
        
        # Check if user has the required permission
        return self.user_has_permission(request.user, self.module_name, permission_type)
    
    def get_permission_type_from_method(self, method):
        """Map HTTP methods to permission types"""
        method_to_permission = {
            'GET': 'read',
            'POST': 'write',
            'PUT': 'write',
            'PATCH': 'write',
            'DELETE': 'delete',
        }
        return method_to_permission.get(method.upper(), 'read')
    
    def user_has_permission(self, user, module, permission_type):
        """Check if user has specific permission through their role assignments"""
        # Super admins have full access to everything
        if user.is_superuser and user.is_staff:
            return True
        
        # Get all active role assignments for the user
        from schoolSettings.models import UserRole
        
        user_roles = UserRole.objects.filter(
            user=user,
            is_active=True
        ).prefetch_related('role', 'custom_permissions')
        
        for user_role in user_roles:
            # Skip expired assignments
            if user_role.is_expired():
                continue
            
            # Check custom permissions first (they override role permissions)
            custom_perm = user_role.custom_permissions.filter(
                module=module,
                permission_type=permission_type,
                granted=True
            ).first()
            
            if custom_perm:
                return True
            
            # Check role permissions
            if user_role.role.has_permission(module, permission_type):
                return True
        
        return False

class HasModulePermissionOrReadOnly(HasModulePermission):
    """
    Allow read access to all authenticated users, but require specific permissions for write operations.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated and request.user.is_active
        
        return super().has_permission(request, view)

class HasModulePermissionOrAdmin(HasModulePermission):
    """
    Allow admin users full access, but require specific permissions for others.
    """
    
    def has_permission(self, request, view):
        # Admin users have full access
        if request.user and request.user.is_staff:
            return True
        
        return super().has_permission(request, view)

class PublicReadOnly(permissions.BasePermission):
    """
    Allow public read access, but require authentication for write operations.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True  # Allow public read access
        
        # Require authentication for write operations
        return request.user and request.user.is_authenticated and request.user.is_active

# Convenience classes for common modules
class HasStudentsPermission(HasModulePermission):
    def __init__(self, permission_type=None):
        super().__init__('students', permission_type)

class HasStudentsPermissionOrReadOnly(HasModulePermissionOrReadOnly):
    def __init__(self, permission_type=None):
        super().__init__('students', permission_type)

class HasTeachersPermission(HasModulePermission):
    def __init__(self, permission_type=None):
        super().__init__('teachers', permission_type)

class HasTeachersPermissionOrReadOnly(HasModulePermissionOrReadOnly):
    def __init__(self, permission_type=None):
        super().__init__('teachers', permission_type)

class HasAttendancePermission(HasModulePermission):
    def __init__(self, permission_type=None):
        super().__init__('attendance', permission_type)

class HasAttendancePermissionOrReadOnly(HasModulePermissionOrReadOnly):
    def __init__(self, permission_type=None):
        super().__init__('attendance', permission_type)

class HasResultsPermission(HasModulePermission):
    def __init__(self, permission_type=None):
        super().__init__('results', permission_type)

class HasResultsPermissionOrReadOnly(HasModulePermissionOrReadOnly):
    def __init__(self, permission_type=None):
        super().__init__('results', permission_type)

class HasExamsPermission(HasModulePermission):
    def __init__(self, permission_type=None):
        super().__init__('exams', permission_type)

class HasExamsPermissionOrReadOnly(HasModulePermissionOrReadOnly):
    def __init__(self, permission_type=None):
        super().__init__('exams', permission_type)

class HasFinancePermission(HasModulePermission):
    def __init__(self, permission_type=None):
        super().__init__('finance', permission_type)

class HasFinancePermissionOrReadOnly(HasModulePermissionOrReadOnly):
    def __init__(self, permission_type=None):
        super().__init__('finance', permission_type)

class HasReportsPermission(HasModulePermission):
    def __init__(self, permission_type=None):
        super().__init__('reports', permission_type)

class HasReportsPermissionOrReadOnly(HasModulePermissionOrReadOnly):
    def __init__(self, permission_type=None):
        super().__init__('reports', permission_type)

class HasSettingsPermission(HasModulePermission):
    def __init__(self, permission_type=None):
        super().__init__('settings', permission_type)

class HasSettingsPermissionOrReadOnly(HasModulePermissionOrReadOnly):
    def __init__(self, permission_type=None):
        super().__init__('settings', permission_type)

class HasAnnouncementsPermission(HasModulePermission):
    def __init__(self, permission_type=None):
        super().__init__('announcements', permission_type)

class HasAnnouncementsPermissionOrReadOnly(HasModulePermissionOrReadOnly):
    def __init__(self, permission_type=None):
        super().__init__('announcements', permission_type)

class HasMessagingPermission(HasModulePermission):
    def __init__(self, permission_type=None):
        super().__init__('messaging', permission_type)

class HasMessagingPermissionOrReadOnly(HasModulePermissionOrReadOnly):
    def __init__(self, permission_type=None):
        super().__init__('messaging', permission_type)

# Section-specific permissions
class HasSectionPermission(permissions.BasePermission):
    """
    Check if user has access to specific school sections.
    """
    
    def __init__(self, section):
        self.section = section
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        # Get user's section access from role assignments
        from schoolSettings.models import UserRole
        
        user_roles = UserRole.objects.filter(
            user=request.user,
            is_active=True
        )
        
        for user_role in user_roles:
            if user_role.is_expired():
                continue
            
            # Check section access
            if self.section == 'primary' and user_role.primary_section_access:
                return True
            elif self.section == 'secondary' and user_role.secondary_section_access:
                return True
            elif self.section == 'nursery' and user_role.nursery_section_access:
                return True
        
        return False

class HasPrimarySectionAccess(HasSectionPermission):
    def __init__(self):
        super().__init__('primary')

class HasSecondarySectionAccess(HasSectionPermission):
    def __init__(self):
        super().__init__('secondary')

class HasNurserySectionAccess(HasSectionPermission):
    def __init__(self):
        super().__init__('nursery')
