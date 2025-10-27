// services/RolePermissionsService.ts
import api from './api';

export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type?: number;
  module?: string;
  action?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  is_system?: boolean;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface RolePermissionUpdate {
  permission_ids?: number[];
  permissions?: number[];
  add_permissions?: number[];
  remove_permissions?: number[];
}

export interface ModulePermission {
  module: string;
  permissions: {
    read?: boolean;
    write?: boolean;
    delete?: boolean;
    admin?: boolean;
  };
}

export class RolePermissionsService {
  private static baseUrl = '/api/school-settings';

  /**
   * Get all available permissions
   */
  static async getPermissions(): Promise<Permission[]> {
    try {
      const response = await api.get(`${this.baseUrl}/permissions/`);
      return response.results || response || [];
    } catch (error) {
      console.error('❌ Error fetching permissions:', error);
      throw error;
    }
  }

  /**
   * Get all roles
   */
  static async getRoles(): Promise<Role[]> {
    try {
      const response = await api.get(`${this.baseUrl}/roles/`);
      return response.results || response || [];
    } catch (error) {
      console.error('❌ Error fetching roles:', error);
      throw error;
    }
  }

  /**
   * Get a single role with its permissions
   */
  static async getRole(roleId: number): Promise<Role> {
    try {
      const response = await api.get(`${this.baseUrl}/roles/${roleId}/`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching role:', error);
      throw error;
    }
  }

  /**
   * Create a new role
   */
  static async createRole(data: { name: string; description?: string; permission_ids?: number[] }): Promise<Role> {
    try {
      const response = await api.post(`${this.baseUrl}/roles/`, data);
      return response;
    } catch (error) {
      console.error('❌ Error creating role:', error);
      throw error;
    }
  }

  /**
   * Update role basic info (name, description)
   */
  static async updateRole(roleId: number, data: { name?: string; description?: string }): Promise<Role> {
    try {
      const response = await api.patch(`${this.baseUrl}/roles/${roleId}/`, data);
      return response;
    } catch (error) {
      console.error('❌ Error updating role:', error);
      throw error;
    }
  }

  /**
   * Update role permissions - tries multiple endpoint patterns
   */
  static async updateRolePermissions(roleId: number, permissionIds: number[]): Promise<Role> {
    const endpoints = [
      // Try common endpoint patterns
      { url: `${this.baseUrl}/roles/${roleId}/permissions/`, method: 'PUT', data: { permission_ids: permissionIds } },
      { url: `${this.baseUrl}/roles/${roleId}/permissions/`, method: 'POST', data: { permission_ids: permissionIds } },
      { url: `${this.baseUrl}/roles/${roleId}/permissions/`, method: 'PATCH', data: { permission_ids: permissionIds } },
      { url: `${this.baseUrl}/roles/${roleId}/`, method: 'PATCH', data: { permission_ids: permissionIds } },
      { url: `${this.baseUrl}/roles/${roleId}/`, method: 'PATCH', data: { permissions: permissionIds } },
    ];

    // Try each endpoint pattern
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying ${endpoint.method} ${endpoint.url}...`);
        
        let response;
        if (endpoint.method === 'PUT') {
          response = await api.put(endpoint.url, endpoint.data);
        } else if (endpoint.method === 'POST') {
          response = await api.post(endpoint.url, endpoint.data);
        } else {
          response = await api.patch(endpoint.url, endpoint.data);
        }
        
        console.log('✅ Successfully updated permissions:', response);
        return response;
      } catch (error: any) {
        console.log(`❌ Failed with ${endpoint.method} ${endpoint.url}:`, error?.message);
        
        // If this is the last endpoint, throw the error
        if (endpoint === endpoints[endpoints.length - 1]) {
          throw new Error('All permission update endpoints failed. Please check your backend API configuration.');
        }
        // Otherwise continue to next endpoint
      }
    }

    throw new Error('Failed to update role permissions');
  }

  /**
   * Delete a role
   */
  static async deleteRole(roleId: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/roles/${roleId}/`);
    } catch (error) {
      console.error('❌ Error deleting role:', error);
      throw error;
    }
  }

  /**
   * Get permissions grouped by module
   */
  static groupPermissionsByModule(permissions: Permission[]): Record<string, Permission[]> {
    const grouped: Record<string, Permission[]> = {};
    
    permissions.forEach(permission => {
      // Extract module name from permission codename or name
      // e.g., "can_view_students" -> "students"
      // or "students.read" -> "students"
      let module = permission.module;
      
      if (!module) {
        // Try to extract from codename
        const parts = permission.codename.split('_');
        if (parts.length > 2) {
          module = parts[parts.length - 1]; // Last part is usually the module
        } else {
          module = 'general';
        }
      }
      
      if (!grouped[module]) {
        grouped[module] = [];
      }
      
      grouped[module].push(permission);
    });
    
    return grouped;
  }

  /**
   * Convert flat permission IDs to structured module permissions
   */
  static convertToModulePermissions(
    permissions: Permission[], 
    selectedIds: number[]
  ): Record<string, ModulePermission> {
    const modulePerms: Record<string, ModulePermission> = {};
    
    selectedIds.forEach(id => {
      const permission = permissions.find(p => p.id === id);
      if (!permission) return;
      
      const module = permission.module || 'general';
      const action = permission.action || this.extractActionFromCodename(permission.codename);
      
      if (!modulePerms[module]) {
        modulePerms[module] = {
          module,
          permissions: {}
        };
      }
      
      if (action === 'read' || action === 'view') {
        modulePerms[module].permissions.read = true;
      } else if (action === 'write' || action === 'create' || action === 'update') {
        modulePerms[module].permissions.write = true;
      } else if (action === 'delete') {
        modulePerms[module].permissions.delete = true;
      } else if (action === 'admin' || action === 'manage') {
        modulePerms[module].permissions.admin = true;
      }
    });
    
    return modulePerms;
  }

  /**
   * Extract action type from permission codename
   */
  private static extractActionFromCodename(codename: string): string {
    const lowerCode = codename.toLowerCase();
    
    if (lowerCode.includes('view') || lowerCode.includes('read')) return 'read';
    if (lowerCode.includes('add') || lowerCode.includes('create')) return 'write';
    if (lowerCode.includes('change') || lowerCode.includes('update') || lowerCode.includes('edit')) return 'write';
    if (lowerCode.includes('delete') || lowerCode.includes('remove')) return 'delete';
    if (lowerCode.includes('admin') || lowerCode.includes('manage')) return 'admin';
    
    return 'read'; // Default
  }

  /**
   * Get default modules for permission management
   */
  static getDefaultModules(): string[] {
    return [
      'dashboard',
      'students',
      'teachers',
      'parents',
      'attendance',
      'results',
      'exams',
      'messaging',
      'reports',
      'announcements',
      'events',
      'library',
      'timetable',
      'subjects',
      'classes',
      'settings'
    ];
  }

  /**
   * Get permission actions
   */
  static getPermissionActions(): string[] {
    return ['read', 'write', 'delete', 'admin'];
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(
    userPermissions: Permission[], 
    module: string, 
    action: string
  ): boolean {
    return userPermissions.some(p => 
      (p.module === module || p.codename.includes(module)) &&
      (p.action === action || p.codename.includes(action))
    );
  }
}

export default RolePermissionsService;