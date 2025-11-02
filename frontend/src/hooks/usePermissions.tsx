// import { useAuth } from './useAuth';
// import { useState, useEffect } from 'react';
// import api from '@/services/api';

// export interface Permission {
//   module: string;
//   permission_type: 'read' | 'write' | 'delete' | 'admin';
//   section?: 'all' | 'primary' | 'secondary' | 'nursery';
//   granted: boolean;
// }

// export interface UserPermissions {
//   effective_permissions: Record<string, Record<string, boolean>>;
//   role_assignments: Array<{
//     role_id: number;
//     role_name: string;
//     role_color: string;
//     sections: {
//       primary: boolean;
//       secondary: boolean;
//       nursery: boolean;
//     };
//     permissions: Record<string, boolean>;
//   }>;
// }

// export const usePermissions = () => {
//   const authContext = useAuth();
//   const [permissions, setPermissions] = useState<UserPermissions | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const user = authContext?.user || null;
//   const isAuthenticated = authContext?.isAuthenticated || false;

//   const fetchPermissions = async () => {
//     if (!isAuthenticated || !user) {
//       setPermissions(null);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       // Fixed: Include user_id as a query parameter
//       const response = await api.get('/api/school-settings/user-roles/user_permissions/', {
//         user_id: user.id
//       });
//       setPermissions(response);

//     } catch (err: any) {
//       console.error('Failed to fetch permissions:', err);
      
//       // If endpoint doesn't exist (404) or user doesn't have permission (403),
//       // provide default permissions based on their role
//       if (err?.response?.status === 403 || err?.response?.status === 404) {
//         console.log('Permissions endpoint not available, using role-based defaults');
//         setError(null); // Don't show error for expected 403/404
//         setPermissions(null); // Will use role-based fallbacks
//       } else {
//         setError('Failed to load permissions');
//         setPermissions(null);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const hasPermission = (
//     module: string,
//     permissionType: 'read' | 'write' | 'delete' | 'admin',
//     section: 'all' | 'primary' | 'secondary' | 'nursery' = 'all'
//   ): boolean => {
//     // Super admins have full access to everything
//     if (user?.is_superuser && user?.is_staff) {
//       return true;
//     }

//     // If we have detailed permissions, use them
//     if (permissions && permissions.effective_permissions) {
//       const modulePermissions = permissions.effective_permissions[module];
//       if (modulePermissions) {
//         return modulePermissions[permissionType] || false;
//       }
//     }

//     // Check for Secondary Section Admin role assignment
//     if (hasSecondaryAdminRole()) {
//       return getSecondaryAdminPermission(module, permissionType);
//     }

//     // Fallback: Use role-based permissions when detailed permissions aren't available
//     if (user?.role) {
//       return getRoleBasedPermission(user.role, module, permissionType);
//     }

//     return false;
//   };

//   const getSecondaryAdminPermission = (
//     module: string,
//     permissionType: 'read' | 'write' | 'delete' | 'admin'
//   ): boolean => {
//     const secondaryAdminPermissions: Record<string, string[]> = {
//       'students': ['read', 'write', 'delete', 'admin'],
//       'teachers': ['read', 'write'],
//       'attendance': ['read', 'write', 'delete', 'admin'],
//       'results': ['read', 'write', 'delete', 'admin'],
//       'exams': ['read', 'write', 'delete', 'admin'],
//       'classes': ['read', 'write', 'delete', 'admin'],
//       'subjects': ['read', 'write', 'delete', 'admin'],
//       'dashboard': ['read', 'admin'],
//       'announcements': ['read', 'write', 'delete', 'admin'],
//       'events': ['read', 'write', 'delete', 'admin'],
//       'messaging': ['read', 'write', 'delete', 'admin'],
//       'parents': [],
//       'settings': [],
//       'reports': [],
//       'finance': [],
//     };

//     const modulePerms = secondaryAdminPermissions[module];
//     if (!modulePerms) {
//       return false;
//     }

//     return modulePerms.includes(permissionType);
//   };

//   const getRoleBasedPermission = (
//     role: string,
//     module: string,
//     permissionType: 'read' | 'write' | 'delete' | 'admin'
//   ): boolean => {
//     const rolePermissions: Record<string, Record<string, string[]>> = {
//       'admin': {
//         'students': ['read', 'write', 'delete', 'admin'],
//         'teachers': ['read', 'write', 'delete', 'admin'],
//         'attendance': ['read', 'write', 'delete', 'admin'],
//         'results': ['read', 'write', 'delete', 'admin'],
//         'exams': ['read', 'write', 'delete', 'admin'],
//         'classes': ['read', 'write', 'delete', 'admin'],
//         'subjects': ['read', 'write', 'delete', 'admin'],
//         'dashboard': ['read', 'admin'],
//         'announcements': ['read', 'write', 'delete', 'admin'],
//         'events': ['read', 'write', 'delete', 'admin'],
//         'messaging': ['read', 'write', 'delete', 'admin'],
//         'parents': ['read', 'write', 'delete', 'admin'],
//         'settings': ['read', 'write', 'delete', 'admin'],
//         'reports': ['read', 'write', 'delete', 'admin'],
//         'finance': ['read', 'write', 'delete', 'admin'],
//       },
//       'teacher': {
//         'students': ['read', 'write'],
//         'teachers': ['read'],
//         'attendance': ['read', 'write'],
//         'results': ['read', 'write'],
//         'exams': ['read', 'write'],
//         'classes': ['read'],
//         'subjects': ['read'],
//         'dashboard': ['read'],
//         'announcements': ['read'],
//         'events': ['read'],
//         'messaging': ['read', 'write'],
//         'parents': [],
//         'settings': [],
//         'reports': [],
//         'finance': [],
//       }
//     };

//     const rolePerms = rolePermissions[role.toLowerCase()];
//     if (!rolePerms) {
//       return false;
//     }

//     const modulePerms = rolePerms[module];
//     if (!modulePerms) {
//       return false;
//     }

//     return modulePerms.includes(permissionType);
//   };

//   const hasSecondaryAdminRole = (): boolean => {
//     return user?.role === 'teacher' && user?.id === 16;
//   };

//   const hasSectionAccess = (section: 'primary' | 'secondary' | 'nursery'): boolean => {
//     if (user?.is_superuser && user?.is_staff) {
//       return true;
//     }

//     if (permissions && permissions.role_assignments) {
//       return permissions.role_assignments.some(assignment => 
//         assignment.sections[section]
//       );
//     }

//     if (hasSecondaryAdminRole()) {
//       return section === 'secondary';
//     }

//     if (user?.role) {
//       return getRoleBasedSectionAccess(user.role, section);
//     }

//     return false;
//   };

//   const getRoleBasedSectionAccess = (role: string, section: 'primary' | 'secondary' | 'nursery'): boolean => {
//     const roleSectionAccess: Record<string, Record<string, boolean>> = {
//       'admin': {
//         'primary': true,
//         'secondary': true,
//         'nursery': true,
//       },
//       'teacher': {
//         'primary': false,
//         'secondary': true,
//         'nursery': false,
//       }
//     };

//     const roleAccess = roleSectionAccess[role.toLowerCase()];
//     if (!roleAccess) {
//       return false;
//     }

//     return roleAccess[section] || false;
//   };

//   const canRead = (module: string): boolean => hasPermission(module, 'read');
//   const canWrite = (module: string): boolean => hasPermission(module, 'write');
//   const canDelete = (module: string): boolean => hasPermission(module, 'delete');
//   const canAdmin = (module: string): boolean => hasPermission(module, 'admin');

//   const canManageStudents = () => canWrite('students');
//   const canViewStudents = () => canRead('students');
//   const canDeleteStudents = () => canDelete('students');
//   const canAdminStudents = () => canAdmin('students');

//   const canManageTeachers = () => canWrite('teachers');
//   const canViewTeachers = () => canRead('teachers');
//   const canDeleteTeachers = () => canDelete('teachers');
//   const canAdminTeachers = () => canAdmin('teachers');

//   const canManageAttendance = () => canWrite('attendance');
//   const canViewAttendance = () => canRead('attendance');
//   const canDeleteAttendance = () => canDelete('attendance');
//   const canAdminAttendance = () => canAdmin('attendance');

//   const canManageResults = () => canWrite('results');
//   const canViewResults = () => canRead('results');
//   const canDeleteResults = () => canDelete('results');
//   const canAdminResults = () => canAdmin('results');

//   const canManageExams = () => canWrite('exams');
//   const canViewExams = () => canRead('exams');
//   const canDeleteExams = () => canDelete('exams');
//   const canAdminExams = () => canAdmin('exams');

//   const canManageFinance = () => canWrite('finance');
//   const canViewFinance = () => canRead('finance');
//   const canDeleteFinance = () => canDelete('finance');
//   const canAdminFinance = () => canAdmin('finance');

//   const canManageReports = () => canWrite('reports');
//   const canViewReports = () => canRead('reports');
//   const canDeleteReports = () => canDelete('reports');
//   const canAdminReports = () => canAdmin('reports');

//   const canManageSettings = () => canWrite('settings');
//   const canViewSettings = () => canRead('settings');
//   const canDeleteSettings = () => canDelete('settings');
//   const canAdminSettings = () => canAdmin('settings');

//   const canManageAnnouncements = () => canWrite('announcements');
//   const canViewAnnouncements = () => canRead('announcements');
//   const canDeleteAnnouncements = () => canDelete('announcements');
//   const canAdminAnnouncements = () => canAdmin('announcements');

//   const canManageMessaging = () => canWrite('messaging');
//   const canViewMessaging = () => canRead('messaging');
//   const canDeleteMessaging = () => canDelete('messaging');
//   const canAdminMessaging = () => canAdmin('messaging');

//   const canAccessPrimary = () => hasSectionAccess('primary');
//   const canAccessSecondary = () => hasSectionAccess('secondary');
//   const canAccessNursery = () => hasSectionAccess('nursery');

//   const getModulePermissions = (module: string) => {
//     if (!permissions || !permissions.effective_permissions) {
//       return {
//         read: false,
//         write: false,
//         delete: false,
//         admin: false,
//       };
//     }

//     return permissions.effective_permissions[module] || {
//       read: false,
//       write: false,
//       delete: false,
//       admin: false,
//     };
//   };

//   const getRoleAssignments = () => {
//     return permissions?.role_assignments || [];
//   };

//   const refreshPermissions = () => {
//     fetchPermissions();
//   };

//   useEffect(() => {
//     fetchPermissions();
//   }, [user?.id, isAuthenticated]);

//   return {
//     permissions,
//     loading,
//     error,
//     hasPermission,
//     hasSectionAccess,
//     canRead,
//     canWrite,
//     canDelete,
//     canAdmin,
//     canManageStudents,
//     canViewStudents,
//     canDeleteStudents,
//     canAdminStudents,
//     canManageTeachers,
//     canViewTeachers,
//     canDeleteTeachers,
//     canAdminTeachers,
//     canManageAttendance,
//     canViewAttendance,
//     canDeleteAttendance,
//     canAdminAttendance,
//     canManageResults,
//     canViewResults,
//     canDeleteResults,
//     canAdminResults,
//     canManageExams,
//     canViewExams,
//     canDeleteExams,
//     canAdminExams,
//     canManageFinance,
//     canViewFinance,
//     canDeleteFinance,
//     canAdminFinance,
//     canManageReports,
//     canViewReports,
//     canDeleteReports,
//     canAdminReports,
//     canManageSettings,
//     canViewSettings,
//     canDeleteSettings,
//     canAdminSettings,
//     canManageAnnouncements,
//     canViewAnnouncements,
//     canDeleteAnnouncements,
//     canAdminAnnouncements,
//     canManageMessaging,
//     canViewMessaging,
//     canDeleteMessaging,
//     canAdminMessaging,
//     canAccessPrimary,
//     canAccessSecondary,
//     canAccessNursery,
//     getModulePermissions,
//     getRoleAssignments,
//     refreshPermissions,
//   };
// };


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

// ✅ Helper functions to check admin types
const isSuperAdmin = (user: any): boolean => {
  return user?.role === 'superadmin' || user?.is_superuser === true;
};

const isSectionAdmin = (user: any): boolean => {
  return [
    'secondary_admin',
    'senior_secondary_admin',
    'junior_secondary_admin',
    'primary_admin',
    'nursery_admin',
  ].includes(user?.role);
};

const isAnyAdmin = (user: any): boolean => {
  return isSuperAdmin(user) || isSectionAdmin(user) || user?.role === 'admin';
};

// ✅ Get section from admin role
const getAdminSection = (role: string): 'primary' | 'secondary' | 'nursery' | 'all' => {
  if (role === 'primary_admin') return 'primary';
  if (role === 'nursery_admin') return 'nursery';
  if (role === 'secondary_admin' || role === 'senior_secondary_admin' || role === 'junior_secondary_admin') {
    return 'secondary';
  }
  return 'all';
};

export const usePermissions = () => {
  const authContext = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;

  const fetchPermissions = async () => {
    if (!isAuthenticated || !user) {
      setPermissions(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/school-settings/user-roles/user_permissions/', {
        user_id: user.id
      });
      setPermissions(response);

    } catch (err: any) {
      console.error('Failed to fetch permissions:', err);
      
      if (err?.response?.status === 403 || err?.response?.status === 404) {
        console.log('Permissions endpoint not available, using role-based defaults');
        setError(null);
        setPermissions(null);
      } else {
        setError('Failed to load permissions');
        setPermissions(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (
    module: string,
    permissionType: 'read' | 'write' | 'delete' | 'admin',
    _section: 'all' | 'primary' | 'secondary' | 'nursery' = 'all'
  ): boolean => {
    // ✅ Super admins have full access to everything
    if (isSuperAdmin(user)) {
      return true;
    }

    // ✅ Check for section admin permissions
    if (user && isSectionAdmin(user)) {
      return getSectionAdminPermission(user.role, module, permissionType);
    }

    // If we have detailed permissions, use them
    if (permissions && permissions.effective_permissions) {
      const modulePermissions = permissions.effective_permissions[module];
      if (modulePermissions) {
        return modulePermissions[permissionType] || false;
      }
    }

    // Fallback: Use role-based permissions
    if (user?.role) {
      return getRoleBasedPermission(user.role, module, permissionType);
    }

    return false;
  };

  // ✅ Section admin permissions based on their section
  const getSectionAdminPermission = (
    role: string,
    module: string,
    permissionType: 'read' | 'write' | 'delete' | 'admin'
  ): boolean => {
    // Section admins have full control over their section, but limited access to others
    const sectionAdminPermissions: Record<string, string[]> = {
      'students': ['read', 'write', 'delete', 'admin'],
      'teachers': ['read', 'write'],
      'attendance': ['read', 'write', 'delete', 'admin'],
      'results': ['read', 'write', 'delete', 'admin'],
      'exams': ['read', 'write', 'delete', 'admin'],
      'classes': ['read', 'write', 'delete', 'admin'],
      'subjects': ['read', 'write', 'delete', 'admin'],
      'lessons': ['read', 'write', 'delete', 'admin'],
      'exam_schedules': ['read', 'write', 'delete', 'admin'],
      'dashboard': ['read', 'admin'],
      'announcements': ['read', 'write', 'delete', 'admin'],
      'events': ['read', 'write', 'delete', 'admin'],
      'messaging': ['read', 'write', 'delete', 'admin'],
      'parents': ['read'],
      'settings': [], // ❌ No settings access for section admins
      'admins': [], // ❌ No admin management
      'password_recovery': [], // ❌ No password recovery access
      'reports': ['read'],
      'finance': [],
    };

    const modulePerms = sectionAdminPermissions[module];
    if (!modulePerms) {
      return false;
    }

    return modulePerms.includes(permissionType);
  };

  const getRoleBasedPermission = (
    role: string,
    module: string,
    permissionType: 'read' | 'write' | 'delete' | 'admin'
  ): boolean => {
    const rolePermissions: Record<string, Record<string, string[]>> = {
      'superadmin': {
        'students': ['read', 'write', 'delete', 'admin'],
        'teachers': ['read', 'write', 'delete', 'admin'],
        'attendance': ['read', 'write', 'delete', 'admin'],
        'results': ['read', 'write', 'delete', 'admin'],
        'exams': ['read', 'write', 'delete', 'admin'],
        'classes': ['read', 'write', 'delete', 'admin'],
        'subjects': ['read', 'write', 'delete', 'admin'],
        'lessons': ['read', 'write', 'delete', 'admin'],
        'exam_schedules': ['read', 'write', 'delete', 'admin'],
        'dashboard': ['read', 'admin'],
        'announcements': ['read', 'write', 'delete', 'admin'],
        'events': ['read', 'write', 'delete', 'admin'],
        'messaging': ['read', 'write', 'delete', 'admin'],
        'parents': ['read', 'write', 'delete', 'admin'],
        'settings': ['read', 'write', 'delete', 'admin'],
        'admins': ['read', 'write', 'delete', 'admin'],
        'password_recovery': ['read', 'write', 'delete', 'admin'],
        'reports': ['read', 'write', 'delete', 'admin'],
        'finance': ['read', 'write', 'delete', 'admin'],
      },
      'admin': {
        'students': ['read', 'write', 'delete', 'admin'],
        'teachers': ['read', 'write', 'delete', 'admin'],
        'attendance': ['read', 'write', 'delete', 'admin'],
        'results': ['read', 'write', 'delete', 'admin'],
        'exams': ['read', 'write', 'delete', 'admin'],
        'classes': ['read', 'write', 'delete', 'admin'],
        'subjects': ['read', 'write', 'delete', 'admin'],
        'lessons': ['read', 'write', 'delete', 'admin'],
        'exam_schedules': ['read', 'write', 'delete', 'admin'],
        'dashboard': ['read', 'admin'],
        'announcements': ['read', 'write', 'delete', 'admin'],
        'events': ['read', 'write', 'delete', 'admin'],
        'messaging': ['read', 'write', 'delete', 'admin'],
        'parents': ['read', 'write', 'delete', 'admin'],
        'settings': ['read', 'write', 'delete', 'admin'],
        'admins': ['read', 'write', 'delete', 'admin'],
        'password_recovery': ['read', 'write', 'delete', 'admin'],
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
        'lessons': ['read'],
        'exam_schedules': ['read'],
        'dashboard': ['read'],
        'announcements': ['read'],
        'events': ['read'],
        'messaging': ['read', 'write'],
        'parents': [],
        'settings': [],
        'admins': [],
        'password_recovery': [],
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

  const hasSectionAccess = (section: 'primary' | 'secondary' | 'nursery'): boolean => {
    // ✅ Super admins have access to all sections
    if (isSuperAdmin(user)) {
      return true;
    }

    // ✅ Section admins only have access to their section
    if (isSectionAdmin(user)) {
      const adminSection = getAdminSection(user?.role ?? '');
      return adminSection === 'all' || adminSection === section;
    }

    if (permissions && permissions.role_assignments) {
      return permissions.role_assignments.some(assignment => 
        assignment.sections[section]
      );
    }

    if (user?.role) {
      return getRoleBasedSectionAccess(user.role, section);
    }

    return false;
  };

  const getRoleBasedSectionAccess = (role: string, section: 'primary' | 'secondary' | 'nursery'): boolean => {
    const roleSectionAccess: Record<string, Record<string, boolean>> = {
      'superadmin': {
        'primary': true,
        'secondary': true,
        'nursery': true,
      },
      'admin': {
        'primary': true,
        'secondary': true,
        'nursery': true,
      },
      'primary_admin': {
        'primary': true,
        'secondary': false,
        'nursery': false,
      },
      'secondary_admin': {
        'primary': false,
        'secondary': true,
        'nursery': false,
      },
      'senior_secondary_admin': {
        'primary': false,
        'secondary': true,
        'nursery': false,
      },
      'junior_secondary_admin': {
        'primary': false,
        'secondary': true,
        'nursery': false,
      },
      'nursery_admin': {
        'primary': false,
        'secondary': false,
        'nursery': true,
      },
      'teacher': {
        'primary': false,
        'secondary': true,
        'nursery': false,
      }
    };

    const roleAccess = roleSectionAccess[role.toLowerCase()];
    if (!roleAccess) {
      return false;
    }

    return roleAccess[section] || false;
  };

  const canRead = (module: string): boolean => hasPermission(module, 'read');
  const canWrite = (module: string): boolean => hasPermission(module, 'write');
  const canDelete = (module: string): boolean => hasPermission(module, 'delete');
  const canAdmin = (module: string): boolean => hasPermission(module, 'admin');

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

  // ✅ New permission checks for restricted features
  const canViewAdminList = () => {
    return isSuperAdmin(user) || user?.role === 'admin';
  };

  const canAccessPasswordRecovery = () => {
    return isSuperAdmin(user) || user?.role === 'admin';
  };

  const canAccessPrimary = () => hasSectionAccess('primary');
  const canAccessSecondary = () => hasSectionAccess('secondary');
  const canAccessNursery = () => hasSectionAccess('nursery');

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

  const getRoleAssignments = () => {
    return permissions?.role_assignments || [];
  };

  const refreshPermissions = () => {
    fetchPermissions();
  };

  // ✅ Export helper functions
  const checkIsSuperAdmin = () => isSuperAdmin(user);
  const checkIsSectionAdmin = () => isSectionAdmin(user);
  const checkIsAnyAdmin = () => isAnyAdmin(user);

  useEffect(() => {
    fetchPermissions();
  }, [user?.id, isAuthenticated]);

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasSectionAccess,
    canRead,
    canWrite,
    canDelete,
    canAdmin,
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
    canViewAdminList,
    canAccessPasswordRecovery,
    canAccessPrimary,
    canAccessSecondary,
    canAccessNursery,
    getModulePermissions,
    getRoleAssignments,
    refreshPermissions,
    isSuperAdmin: checkIsSuperAdmin,
    isSectionAdmin: checkIsSectionAdmin,
    isAnyAdmin: checkIsAnyAdmin,
  };
};