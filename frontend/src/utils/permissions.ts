// // utils/permissions.js or hooks/usePermissions.js

// /**
//  * Permission utility functions for hiding UI elements based on user role
//  */

// export const ROLES = {
//   SUPERADMIN: 'superadmin',
//   SECONDARY_ADMIN: 'secondary_admin',
//   SENIOR_SECONDARY_ADMIN: 'senior_secondary_admin',
//   JUNIOR_SECONDARY_ADMIN: 'junior_secondary_admin',
//   PRIMARY_ADMIN: 'primary_admin',
//   NURSERY_ADMIN: 'nursery_admin',
//   ADMIN: 'admin',
//   TEACHER: 'teacher',
//   STUDENT: 'student',
//   PARENT: 'parent',
// };

// export const SECTIONS = {
//   NURSERY: 'nursery',
//   PRIMARY: 'primary',
//   SECONDARY: 'secondary',
//   JUNIOR_SECONDARY: 'junior_secondary',
//   SENIOR_SECONDARY: 'senior_secondary',
// };

// /**
//  * Check if user is a superadmin
//  */
// export const isSuperAdmin = (user) => {
//   return user?.role === ROLES.SUPERADMIN || user?.is_superuser === true;
// };

// /**
//  * Check if user is a section admin (not superadmin)
//  */
// export const isSectionAdmin = (user) => {
//   return [
//     ROLES.SECONDARY_ADMIN,
//     ROLES.SENIOR_SECONDARY_ADMIN,
//     ROLES.JUNIOR_SECONDARY_ADMIN,
//     ROLES.PRIMARY_ADMIN,
//     ROLES.NURSERY_ADMIN,
//   ].includes(user?.role);
// };

// /**
//  * Check if user is any type of admin
//  */
// export const isAnyAdmin = (user) => {
//   return isSuperAdmin(user) || isSectionAdmin(user) || user?.role === ROLES.ADMIN;
// };

// /**
//  * Check if user can view admin list
//  */
// export const canViewAdminList = (user) => {
//   return isSuperAdmin(user);
// };

// /**
//  * Check if user can manage password recovery
//  */
// export const canManagePasswordRecovery = (user) => {
//   return isSuperAdmin(user);
// };

// /**
//  * Check if user can create admins
//  */
// export const canCreateAdmin = (user) => {
//   return isSuperAdmin(user);
// };

// /**
//  * Check if user can view/manage all parents
//  */
// export const canViewAllParents = (user) => {
//   return isSuperAdmin(user);
// };

// /**
//  * Check if user can view/manage all lesson schedules
//  */
// export const canViewAllLessonSchedules = (user) => {
//   return isSuperAdmin(user);
// };

// /**
//  * Check if user can access a specific section's data
//  */
// export const canAccessSection = (user, section) => {
//   if (isSuperAdmin(user)) return true;
//   if (!isSectionAdmin(user)) return false;
//   return user?.section === section;
// };

// /**
//  * Get user's accessible sections
//  */
// export const getAccessibleSections = (user) => {
//   if (isSuperAdmin(user)) {
//     return Object.values(SECTIONS);
//   }
//   if (isSectionAdmin(user) && user?.section) {
//     return [user.section];
//   }
//   return [];
// };

// /**
//  * React hook for permissions (if using React)
//  */
// export const usePermissions = (user) => {
//   return {
//     isSuperAdmin: isSuperAdmin(user),
//     isSectionAdmin: isSectionAdmin(user),
//     isAnyAdmin: isAnyAdmin(user),
//     canViewAdminList: canViewAdminList(user),
//     canManagePasswordRecovery: canManagePasswordRecovery(user),
//     canCreateAdmin: canCreateAdmin(user),
//     canViewAllParents: canViewAllParents(user),
//     canViewAllLessonSchedules: canViewAllLessonSchedules(user),
//     canAccessSection: (section) => canAccessSection(user, section),
//     accessibleSections: getAccessibleSections(user),
//   };
// };

// /**
//  * HOC to conditionally render components based on permissions
//  */
// export const withPermission = (Component, permissionCheck) => {
//   return (props) => {
//     const { user } = props; // Adjust based on how you pass user
//     if (!permissionCheck(user)) {
//       return null; // or return a "No Permission" message
//     }
//     return <Component {...props} />;
//   };
// };

// // Usage examples:

// /*
// // 1. In a component - Hide admin tab for section admins
// import { usePermissions } from '@/utils/permissions';

// function AdminDashboard() {
//   const user = useUser(); // Your auth hook
//   const permissions = usePermissions(user);
  
//   return (
//     <div>
//       {permissions.canViewAdminList && (
//         <Link to="/admin/users">Admin Management</Link>
//       )}
      
//       {permissions.canManagePasswordRecovery && (
//         <Link to="/admin/password-recovery">Password Recovery</Link>
//       )}
      
//       {permissions.isSuperAdmin && (
//         <FloatingButton onClick={handleCreateAdmin} />
//       )}
//     </div>
//   );
// }

// // 2. Conditional rendering for password recovery tab
// {!isSectionAdmin(user) && (
//   <Tab label="Password Recovery" />
// )}

// // 3. Hide floating button for section admins
// {canCreateAdmin(user) && (
//   <FloatingActionButton onClick={handleCreate} />
// )}

// // 4. Filter navigation items
// const navigationItems = [
//   { label: 'Dashboard', path: '/dashboard', show: true },
//   { label: 'Admins', path: '/admins', show: canViewAdminList(user) },
//   { label: 'Parents', path: '/parents', show: isAnyAdmin(user) },
//   { label: 'Password Recovery', path: '/password-recovery', show: canManagePasswordRecovery(user) },
// ].filter(item => item.show);
// */

