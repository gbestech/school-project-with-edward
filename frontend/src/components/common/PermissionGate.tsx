import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
  permission: 'read' | 'write' | 'delete' | 'admin';
  module: string;
  fallback?: React.ReactNode;
}

interface ModuleSpecificPermissionGateProps {
  children: React.ReactNode;
  permission: 'read' | 'write' | 'delete' | 'admin';
  fallback?: React.ReactNode;
}

// Generic PermissionGate component
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  module,
  fallback = null
}) => {
  try {
    const { hasPermission } = usePermissions();
    
    if (hasPermission(module, permission)) {
      return <>{children}</>;
    }
    
    return <>{fallback}</>;
  } catch (error) {
    console.warn('PermissionGate error:', error);
    // If there's an error with permissions, show fallback or nothing
    return <>{fallback}</>;
  }
};

// Students-specific PermissionGate
export const StudentsPermissionGate: React.FC<ModuleSpecificPermissionGateProps> = ({
  children,
  permission,
  fallback
}) => {
  return (
    <PermissionGate module="students" permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

// Teachers-specific PermissionGate
export const TeachersPermissionGate: React.FC<ModuleSpecificPermissionGateProps> = ({
  children,
  permission,
  fallback
}) => {
  return (
    <PermissionGate module="teachers" permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

// Attendance-specific PermissionGate
export const AttendancePermissionGate: React.FC<ModuleSpecificPermissionGateProps> = ({
  children,
  permission,
  fallback
}) => {
  return (
    <PermissionGate module="attendance" permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

// Results-specific PermissionGate
export const ResultsPermissionGate: React.FC<ModuleSpecificPermissionGateProps> = ({
  children,
  permission,
  fallback
}) => {
  return (
    <PermissionGate module="results" permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

// Exams-specific PermissionGate
export const ExamsPermissionGate: React.FC<ModuleSpecificPermissionGateProps> = ({
  children,
  permission,
  fallback
}) => {
  return (
    <PermissionGate module="exams" permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

// Finance-specific PermissionGate
export const FinancePermissionGate: React.FC<ModuleSpecificPermissionGateProps> = ({
  children,
  permission,
  fallback
}) => {
  return (
    <PermissionGate module="finance" permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

// Reports-specific PermissionGate
export const ReportsPermissionGate: React.FC<ModuleSpecificPermissionGateProps> = ({
  children,
  permission,
  fallback
}) => {
  return (
    <PermissionGate module="reports" permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

// Settings-specific PermissionGate
export const SettingsPermissionGate: React.FC<ModuleSpecificPermissionGateProps> = ({
  children,
  permission,
  fallback
}) => {
  return (
    <PermissionGate module="settings" permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

// Announcements-specific PermissionGate
export const AnnouncementsPermissionGate: React.FC<ModuleSpecificPermissionGateProps> = ({
  children,
  permission,
  fallback
}) => {
  return (
    <PermissionGate module="announcements" permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

// Messaging-specific PermissionGate
export const MessagingPermissionGate: React.FC<ModuleSpecificPermissionGateProps> = ({
  children,
  permission,
  fallback
}) => {
  return (
    <PermissionGate module="messaging" permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

export default PermissionGate;
