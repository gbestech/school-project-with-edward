import api from './api';

export interface Parent {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  relationship: string;
  is_primary_contact: boolean;
}

export interface EmergencyContact {
  type: string;
  number: string;
  is_primary: boolean;
}

export interface Student {
  id: number;
  full_name: string;
  short_name?: string;
  age: number;
  gender: string;
  education_level: string;
  education_level_display: string;
  student_class: string;
  student_class_display: string;
  parent_contact: string | null;
  emergency_contact?: string | null;
  emergency_contacts?: EmergencyContact[];
  medical_conditions?: string | null;
  special_requirements?: string | null;
  parents?: Parent[];
  parent_count?: number;
  admission_date: string;
  date_of_birth?: string;
  is_active: boolean;
  is_nursery_student?: boolean;
  is_primary_student?: boolean;
  is_secondary_student?: boolean;
  profile_picture: string | null;
  classroom?: string | null;
  email?: string;
  username?: string;
  section_id?: number | null;
  stream?: number | null;
  stream_name?: string | null;
  stream_type?: string | null;
}

export interface CreateStudentData {
  full_name: string;
  age: number;
  gender: string;
  education_level: string;
  student_class: string;
  email?: string;
  parent_contact?: string;
}

export interface UpdateStudentData {
  full_name?: string;
  age?: number;
  gender?: string;
  education_level?: string;
  student_class?: string;
  email?: string;
  parent_contact?: string;
  is_active?: boolean;
  stream?: number | null;
}

export interface StudentActivationResponse {
  status: string;
  student: any;
}

export class StudentService {
  // Get all students with pagination and search
  async getStudents(params?: {
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<{ results: Student[]; count: number }> {
    try {
      const response = await api.get('/api/students/students/', params);
      return response;
    } catch (error) {
      console.log('Error fetching students:', error);
      throw error;
    }
  }

  // Get a single student by ID
  async getStudent(id: number): Promise<Student> {
    try {
      const endpoint = `/api/students/students/${id}/`;
      console.log('DEBUG: StudentService.getStudent calling', endpoint);
      const response = await api.get(endpoint);
      console.log('DEBUG: StudentService.getStudent response', response);
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ Error in StudentService.getStudent:', error);
      throw error;
    }
  }

  // Create a new student
  async createStudent(data: CreateStudentData): Promise<Student> {
    try {
      const response = await api.post('/api/students/students/', data);
      return response;
    } catch (error) {
      console.log('Error creating student:', error);
      throw error;
    }
  }

  // Update a student
  async updateStudent(id: number, data: UpdateStudentData): Promise<Student> {
    try {
      const response = await api.patch(`/api/students/students/${id}/`, data);
      return response;
    } catch (error) {
      console.log('Error updating student:', error);
      throw error;
    }
  }

  // Delete a student
  async deleteStudent(id: number): Promise<{ message: string; status: string }> {
    try {
      const response = await api.delete(`/api/students/students/${id}/`);
      return response;
    } catch (error) {
      console.log('Error deleting student:', error);
      throw error;
    }
  }

  // Toggle student activation status
  static async toggleStudentStatus(studentId: number): Promise<StudentActivationResponse> {
    try {
      console.log(`🔄 Toggling student status: ${studentId}`);
      
      const response = await api.post(`/api/students/students/${studentId}/toggle_status/`, {});
      console.log('✅ Student status toggle response:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Error toggling student status:', error);
      throw error;
    }
  }

  // Activate a student
  static async activateStudent(studentId: number): Promise<StudentActivationResponse> {
    try {
      console.log(`🔄 Activating student: ${studentId}`);
      
      const response = await api.post(`/api/students/students/${studentId}/activate/`, {});
      console.log('✅ Student activation response:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Error activating student:', error);
      throw error;
    }
  }

  // Deactivate a student
  static async deactivateStudent(studentId: number): Promise<StudentActivationResponse> {
    try {
      console.log(`🔄 Deactivating student: ${studentId}`);
      
      const response = await api.post(`/api/students/students/${studentId}/deactivate/`, {});
      console.log('✅ Student deactivation response:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Error deactivating student:', error);
      throw error;
    }
  }

  // Search students
  async searchStudents(query: string): Promise<Student[]> {
    try {
      console.log('🔍 Searching students with query:', query);
      // Add cache-busting parameter to force fresh data
      const response = await api.get('/api/students/students/', { 
        search: query,
        _t: Date.now() // Cache buster
      });
      console.log('🔍 Search response:', response);
      return Array.isArray(response) ? response : response.results || [];
    } catch (error) {
      console.log('Error searching students:', error);
      return [];
    }
  }

  // Get student statistics
  async getStudentStatistics(): Promise<any> {
    try {
      const response = await api.get('/api/students/students/statistics/');
      return response;
    } catch (error) {
      console.log('Error fetching student statistics:', error);
      return {};
    }
  }

  async getDashboardData(): Promise<any> {
    try {
      const response = await api.get('/students/dashboard/');
      return response;
    } catch (error) {
      console.error('Error fetching student dashboard data:', error);
      throw error;
    }
  }

  // Get student profile picture URL with fallback
  static getProfilePictureUrl(student: any): string | null {
    // Check if student has a profile picture
    if (student.profile_picture) {
      return student.profile_picture;
    }
    
    // Fallback to user profile picture if available
    if (student.user?.profile_picture) {
      return student.user.profile_picture;
    }
    
    // Return default avatar
    return '/images/default-avatar.png';
  }
}

export default new StudentService(); 