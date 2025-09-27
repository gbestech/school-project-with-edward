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
      setError('Failed to load permissions');
      setPermissions(null);
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

    if (!permissions || !permissions.effective_permissions) {
      return false;
    }

    const modulePermissions = permissions.effective_permissions[module];
    if (!modulePermissions) {
      return false;
    }

    return modulePermissions[permissionType] || false;
  };

  // Check if user has access to specific section
  const hasSectionAccess = (section: 'primary' | 'secondary' | 'nursery'): boolean => {
    // Super admins have access to all sections
    if (user?.is_superuser && user?.is_staff) {
      return true;
    }

    if (!permissions || !permissions.role_assignments) {
      return false;
    }

    return permissions.role_assignments.some(assignment => 
      assignment.sections[section]
    );
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
