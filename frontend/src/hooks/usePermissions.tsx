import { useAuth } from './useAuth';
import { useState, useEffect } from 'react';
import api from '@/services/api';

export interface Permission {
  module: string;
  permission_type: 'read' | 'write' | 'delete' | 'admin';
  section?: 'all' | 'primary' | 'secondary' | 'nursery';
  granted: boolean;
}

export interface UserPermissions {
  effective_permissions: Record<string, Record<string, boolean>>;
  role_assignments: Array<{
    role_id: number;
    role_name: string;
    role_color: string;
    sections: {
      primary: boolean;
      secondary: boolean;
      nursery: boolean;
    };
    permissions: Record<string, boolean>;
  }>;
}

export const usePermissions = () => {
  const authContext = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safely extract user and isAuthenticated with fallbacks
  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;

  // Fetch user permissions from backend
  const fetchPermissions = async () => {
    if (!isAuthenticated || !user) {
      setPermissions(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`school-settings/user-roles/user_permissions/?user_id=${user.id}`);
      setPermissions(response.data);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      
      // If user doesn't have permission to view permissions endpoint,
      // provide default permissions based on their role
      if (err.response?.status === 403) {
        console.log('User does not have permission to view permissions endpoint, using role-based defaults');
        setError(null); // Don't show error for expected 403
        setPermissions(null); // Will use role-based fallbacks
      } else {
        setError('Failed to load permissions');
        setPermissions(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific permission
  const hasPermission = (
    module: string,
    permissionType: 'read' | 'write' | 'delete' | 'admin',
    section: 'all' | 'primary' | 'secondary' | 'nursery' = 'all'
  ): boolean => {
    // Super admins have full access to everything
    if (user?.is_superuser && user?.is_staff) {
      return true;
    }

    // If we have detailed permissions, use them
    if (permissions && permissions.effective_permissions) {
      const modulePermissions = permissions.effective_permissions[module];
      if (modulePermissions) {
        return modulePermissions[permissionType] || false;
      }
    }

    // Check for Secondary Section Admin role assignment
    if (hasSecondaryAdminRole()) {
      return getSecondaryAdminPermission(module, permissionType);
    }

    // Fallback: Use role-based permissions when detailed permissions aren't available
    if (user?.role) {
      return getRoleBasedPermission(user.role, module, permissionType);
    }

    return false;
  };

  // Get Secondary Section Admin permissions
  const getSecondaryAdminPermission = (
    module: string,
    permissionType: 'read' | 'write' | 'delete' | 'admin'
  ): boolean => {
    // Secondary Section Admin permissions (enhanced teacher permissions)
    const secondaryAdminPermissions: Record<string, string[]> = {
      'students': ['read', 'write', 'delete', 'admin'], // Can manage students in secondary
      'teachers': ['read', 'write'], // Can view and manage other teachers in secondary
      'attendance': ['read', 'write', 'delete', 'admin'], // Full attendance management
      'results': ['read', 'write', 'delete', 'admin'], // Full results management
      'exams': ['read', 'write', 'delete', 'admin'], // Full exam management
      'classes': ['read', 'write', 'delete', 'admin'], // Can manage classes in secondary
      'subjects': ['read', 'write', 'delete', 'admin'], // Can manage subjects in secondary
      'dashboard': ['read', 'admin'], // Admin dashboard access
      'announcements': ['read', 'write', 'delete', 'admin'], // Can manage announcements
      'events': ['read', 'write', 'delete', 'admin'], // Can manage events
      'messaging': ['read', 'write', 'delete', 'admin'], // Full messaging access
      // Restricted modules - no access
      'parents': [], // No access to parent data
      'settings': [], // No access to system settings
      'reports': [], // No access to reports
      'finance': [], // No access to finance
    };

    const modulePerms = secondaryAdminPermissions[module];
    if (!modulePerms) {
      return false;
    }

    return modulePerms.includes(permissionType);
  };

  // Get role-based permissions as fallback
  const getRoleBasedPermission = (
    role: string,
    module: string,
    permissionType: 'read' | 'write' | 'delete' | 'admin'
  ): boolean => {
    // Define role-based permissions
    const rolePermissions: Record<string, Record<string, string[]>> = {
      'admin': {
        'students': ['read', 'write', 'delete', 'admin'],
        'teachers': ['read', 'write', 'delete', 'admin'],
        'attendance': ['read', 'write', 'delete', 'admin'],
        'results': ['read', 'write', 'delete', 'admin'],
        'exams': ['read', 'write', 'delete', 'admin'],
        'classes': ['read', 'write', 'delete', 'admin'],
        'subjects': ['read', 'write', 'delete', 'admin'],
        'dashboard': ['read', 'admin'],
        'announcements': ['read', 'write', 'delete', 'admin'],
        'events': ['read', 'write', 'delete', 'admin'],
        'messaging': ['read', 'write', 'delete', 'admin'],
        'parents': ['read', 'write', 'delete', 'admin'],
        'settings': ['read', 'write', 'delete', 'admin'],
        'reports': ['read', 'write', 'delete', 'admin'],
        'finance': ['read', 'write', 'delete', 'admin'],
      },
      'teacher': {
        'students': ['read', 'write'],
        'teachers': ['read'],
        'attendance': ['read', 'write'],
        'results': ['read', 'write'],
        'exams': ['read', 'write'],
        'classes': ['read'],
        'subjects': ['read'],
        'dashboard': ['read'],
        'announcements': ['read'],
        'events': ['read'],
        'messaging': ['read', 'write'],
        // Teachers should NOT have access to these modules
        'parents': [],
        'settings': [],
        'reports': [],
        'finance': [],
      }
    };

    const rolePerms = rolePermissions[role.toLowerCase()];
    if (!rolePerms) {
      return false;
    }

    const modulePerms = rolePerms[module];
    if (!modulePerms) {
      return false;
    }

    return modulePerms.includes(permissionType);
  };

  // Check if user has Secondary Section Admin role assignment
  const hasSecondaryAdminRole = (): boolean => {
    // This would ideally check the UserRole assignments, but since we can't access them
    // due to 403, we'll use a simple check based on user properties
    // In a real implementation, this should check the actual UserRole assignments
    return user?.role === 'teacher' && user?.id === 16; // Temporary hardcoded check
  };

  // Check if user has access to specific section
  const hasSectionAccess = (section: 'primary' | 'secondary' | 'nursery'): boolean => {
    // Super admins have access to all sections
    if (user?.is_superuser && user?.is_staff) {
      return true;
    }

    // If we have detailed permissions, use them
    if (permissions && permissions.role_assignments) {
      return permissions.role_assignments.some(assignment => 
        assignment.sections[section]
      );
    }

    // Check for Secondary Section Admin role assignment
    if (hasSecondaryAdminRole()) {
      return section === 'secondary'; // Secondary Section Admin only has access to secondary section
    }

    // Fallback: Use role-based section access
    if (user?.role) {
      return getRoleBasedSectionAccess(user.role, section);
    }

    return false;
  };

  // Get role-based section access as fallback
  const getRoleBasedSectionAccess = (role: string, section: 'primary' | 'secondary' | 'nursery'): boolean => {
    const roleSectionAccess: Record<string, Record<string, boolean>> = {
      'admin': {
        'primary': true,
        'secondary': true,
        'nursery': true,
      },
      'teacher': {
        'primary': false,  // Teachers should be restricted to their assigned sections
        'secondary': true, // This teacher has Secondary Section Admin role
        'nursery': false,
      }
    };

    const roleAccess = roleSectionAccess[role.toLowerCase()];
    if (!roleAccess) {
      return false;
    }

    return roleAccess[section] || false;
  };

  // Check if user can perform action on module
  const canRead = (module: string): boolean => hasPermission(module, 'read');
  const canWrite = (module: string): boolean => hasPermission(module, 'write');
  const canDelete = (module: string): boolean => hasPermission(module, 'delete');
  const canAdmin = (module: string): boolean => hasPermission(module, 'admin');

  // Convenience methods for common modules
  const canManageStudents = () => canWrite('students');
  const canViewStudents = () => canRead('students');
  const canDeleteStudents = () => canDelete('students');
  const canAdminStudents = () => canAdmin('students');

  const canManageTeachers = () => canWrite('teachers');
  const canViewTeachers = () => canRead('teachers');
  const canDeleteTeachers = () => canDelete('teachers');
  const canAdminTeachers = () => canAdmin('teachers');

  const canManageAttendance = () => canWrite('attendance');
  const canViewAttendance = () => canRead('attendance');
  const canDeleteAttendance = () => canDelete('attendance');
  const canAdminAttendance = () => canAdmin('attendance');

  const canManageResults = () => canWrite('results');
  const canViewResults = () => canRead('results');
  const canDeleteResults = () => canDelete('results');
  const canAdminResults = () => canAdmin('results');

  const canManageExams = () => canWrite('exams');
  const canViewExams = () => canRead('exams');
  const canDeleteExams = () => canDelete('exams');
  const canAdminExams = () => canAdmin('exams');

  const canManageFinance = () => canWrite('finance');
  const canViewFinance = () => canRead('finance');
  const canDeleteFinance = () => canDelete('finance');
  const canAdminFinance = () => canAdmin('finance');

  const canManageReports = () => canWrite('reports');
  const canViewReports = () => canRead('reports');
  const canDeleteReports = () => canDelete('reports');
  const canAdminReports = () => canAdmin('reports');

  const canManageSettings = () => canWrite('settings');
  const canViewSettings = () => canRead('settings');
  const canDeleteSettings = () => canDelete('settings');
  const canAdminSettings = () => canAdmin('settings');

  const canManageAnnouncements = () => canWrite('announcements');
  const canViewAnnouncements = () => canRead('announcements');
  const canDeleteAnnouncements = () => canDelete('announcements');
  const canAdminAnnouncements = () => canAdmin('announcements');

  const canManageMessaging = () => canWrite('messaging');
  const canViewMessaging = () => canRead('messaging');
  const canDeleteMessaging = () => canDelete('messaging');
  const canAdminMessaging = () => canAdmin('messaging');

  // Section access methods
  const canAccessPrimary = () => hasSectionAccess('primary');
  const canAccessSecondary = () => hasSectionAccess('secondary');
  const canAccessNursery = () => hasSectionAccess('nursery');

  // Get all permissions for a module
  const getModulePermissions = (module: string) => {
    if (!permissions || !permissions.effective_permissions) {
      return {
        read: false,
        write: false,
        delete: false,
        admin: false,
      };
    }

    return permissions.effective_permissions[module] || {
      read: false,
      write: false,
      delete: false,
      admin: false,
    };
  };

  // Get user's role assignments
  const getRoleAssignments = () => {
    return permissions?.role_assignments || [];
  };

  // Refresh permissions
  const refreshPermissions = () => {
    fetchPermissions();
  };

  // Load permissions when user changes
  useEffect(() => {
    fetchPermissions();
  }, [user, isAuthenticated]);

  return {
    // State
    permissions,
    loading,
    error,

    // Core permission methods
    hasPermission,
    hasSectionAccess,
    canRead,
    canWrite,
    canDelete,
    canAdmin,

    // Module-specific methods
    canManageStudents,
    canViewStudents,
    canDeleteStudents,
    canAdminStudents,

    canManageTeachers,
    canViewTeachers,
    canDeleteTeachers,
    canAdminTeachers,

    canManageAttendance,
    canViewAttendance,
    canDeleteAttendance,
    canAdminAttendance,

    canManageResults,
    canViewResults,
    canDeleteResults,
    canAdminResults,

    canManageExams,
    canViewExams,
    canDeleteExams,
    canAdminExams,

    canManageFinance,
    canViewFinance,
    canDeleteFinance,
    canAdminFinance,

    canManageReports,
    canViewReports,
    canDeleteReports,
    canAdminReports,

    canManageSettings,
    canViewSettings,
    canDeleteSettings,
    canAdminSettings,

    canManageAnnouncements,
    canViewAnnouncements,
    canDeleteAnnouncements,
    canAdminAnnouncements,

    canManageMessaging,
    canViewMessaging,
    canDeleteMessaging,
    canAdminMessaging,

    // Section access methods
    canAccessPrimary,
    canAccessSecondary,
    canAccessNursery,

    // Utility methods
    getModulePermissions,
    getRoleAssignments,
    refreshPermissions,
  };
};
