import api from './api';

export interface Student {
  id: number;
  full_name: string;
  age: number;
  gender: string;
  education_level: string;
  education_level_display: string;
  student_class: string;
  student_class_display: string;
  parent_contact: string | null;
  parent_count: number;
  admission_date: string;
  is_active: boolean;
  profile_picture: string | null;
  email?: string;
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
}

class StudentService {
  // Get all students with pagination and search
  async getStudents(params?: {
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<{ results: Student[]; count: number }> {
    try {
      const response = await api.get('/api/students/', params);
      return response;
    } catch (error) {
      console.log('Error fetching students:', error);
      throw error;
    }
  }

  // Get a single student by ID
  async getStudent(id: number): Promise<Student> {
    try {
      const response = await api.get(`/api/students/${id}/`);
      return response;
    } catch (error) {
      console.log('Error fetching student:', error);
      throw error;
    }
  }

  // Create a new student
  async createStudent(data: CreateStudentData): Promise<Student> {
    try {
      const response = await api.post('/api/students/', data);
      return response;
    } catch (error) {
      console.log('Error creating student:', error);
      throw error;
    }
  }

  // Update a student
  async updateStudent(id: number, data: UpdateStudentData): Promise<Student> {
    try {
      const response = await api.patch(`/api/students/${id}/`, data);
      return response;
    } catch (error) {
      console.log('Error updating student:', error);
      throw error;
    }
  }

  // Delete a student
  async deleteStudent(id: number): Promise<void> {
    try {
      await api.delete(`/api/students/${id}/`);
    } catch (error) {
      console.log('Error deleting student:', error);
      throw error;
    }
  }

  // Toggle student active status
  async toggleStudentStatus(id: number): Promise<Student> {
    try {
      const response = await api.patch(`/api/students/${id}/toggle-status/`);
      return response;
    } catch (error) {
      console.log('Error toggling student status:', error);
      throw error;
    }
  }

  // Search students
  async searchStudents(query: string): Promise<Student[]> {
    try {
      const response = await api.get('/api/students/', { search: query });
      return Array.isArray(response) ? response : response.results || [];
    } catch (error) {
      console.log('Error searching students:', error);
      return [];
    }
  }

  // Get student statistics
  async getStudentStatistics(): Promise<any> {
    try {
      const response = await api.get('/api/students/statistics/');
      return response;
    } catch (error) {
      console.log('Error fetching student statistics:', error);
      return {};
    }
  }
}

export default new StudentService(); 