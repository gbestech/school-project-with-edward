import api from './api';

export interface Parent {
  id: number;
  user: string | {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    is_active: boolean;
    date_joined: string;
  };
  students: Child[];
  is_active: boolean;
  parent_username?: string;
  parent_password?: string;
  user_first_name?: string;
  user_last_name?: string;
  parent_contact?: string;
  parent_address?: string;
}

export interface Child {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  education_level: string;
  education_level_display?: string;
  student_class_display?: string;
  stream_name?: string;
  stream_type?: string;
}

export interface CreateParentData {
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  phone?: string;
  address?: string;
  student_ids?: number[];
}

export interface UpdateParentData {
  user_first_name?: string;
  user_last_name?: string;
  phone?: string;
  address?: string;
  student_ids?: number[];
}

class ParentService {
  // Get all parents
  async getParents(): Promise<Parent[]> {
    try {
      const response = await api.get('/api/parents/');
      return Array.isArray(response.results) ? response.results : response;
    } catch (error) {
      console.error('Error fetching parents:', error);
      return [];
    }
  }

  // Get a single parent by ID
  async getParent(id: number): Promise<Parent | null> {
    try {
      const response = await api.get(`/api/parents/${id}/`);
      return response;
    } catch (error) {
      console.error('Error fetching parent:', error);
      return null;
    }
  }

  // Create a new parent
  async createParent(data: CreateParentData): Promise<Parent> {
    try {
      const response = await api.post('/api/parents/', data);
      return response;
    } catch (error) {
      console.error('Error creating parent:', error);
      throw error;
    }
  }

  // Update a parent
  async updateParent(id: number, data: UpdateParentData): Promise<Parent> {
    try {
      const response = await api.put(`/api/parents/${id}/`, data);
      return response;
    } catch (error) {
      console.error('Error updating parent:', error);
      throw error;
    }
  }

  // Delete a parent
  async deleteParent(id: number): Promise<void> {
    try {
      await api.delete(`/api/parents/${id}/`);
    } catch (error) {
      console.error('Error deleting parent:', error);
      throw error;
    }
  }

  // Activate a parent
  async activateParent(id: number): Promise<void> {
    try {
      await api.post(`/api/parents/${id}/activate/`);
    } catch (error) {
      console.error('Error activating parent:', error);
      throw error;
    }
  }

  // Deactivate a parent
  async deactivateParent(id: number): Promise<void> {
    try {
      await api.post(`/api/parents/${id}/deactivate/`);
    } catch (error) {
      console.error('Error deactivating parent:', error);
      throw error;
    }
  }

  // Search parents
  async searchParents(query: string): Promise<Parent[]> {
    try {
      const response = await api.get(`/api/parents/search/?q=${encodeURIComponent(query)}`);
      return Array.isArray(response.results) ? response.results : response;
    } catch (error) {
      console.error('Error searching parents:', error);
      return [];
    }
  }

  // Add existing student to parent
  async addStudentToParent(parentId: number, studentId: number): Promise<void> {
    try {
      await api.post(`/api/parents/${parentId}/add-existing-student/`, {
        student_id: studentId
      });
    } catch (error) {
      console.error('Error adding student to parent:', error);
      throw error;
    }
  }

  // Get parent statistics
  async getParentStatistics(): Promise<any> {
    try {
      const response = await api.get('/api/parents/statistics/');
      return response;
    } catch (error) {
      console.error('Error fetching parent statistics:', error);
      return {};
    }
  }
}

export default new ParentService();



