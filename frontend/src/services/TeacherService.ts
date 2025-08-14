import api from '@/services/api';

export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  staff_type: 'teaching' | 'non-teaching';
  level: 'nursery' | 'primary' | 'secondary' | null;
  hire_date: string;
  qualification: string;
  specialization: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  photo?: string; // Profile picture URL
  assigned_subjects: Array<{
    id: number;
    name: string;
    assignments?: Array<{
      grade_level: string;
      section: string;
      education_level: string;
    }>;
  }>;
  teacher_assignments?: Array<{
    id: number;
    grade_level_name: string;
    section_name: string;
    subject_name: string;
    education_level: string;
  }>;
}

export interface CreateTeacherData {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  };
  employee_id: string;
  staff_type: 'teaching' | 'non-teaching';
  level?: 'nursery' | 'primary' | 'secondary';
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
  hire_date: string;
  qualification?: string;
  specialization?: string;
  subjects?: number[];
  assignments?: Array<{
    grade_level_id: string;
    section_id: string;
    subject_id: string;
  }>;
  photo?: string;
}

export interface UpdateTeacherData {
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  employee_id?: string;
  staff_type?: 'teaching' | 'non-teaching';
  level?: 'nursery' | 'primary' | 'secondary';
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
  hire_date?: string;
  qualification?: string;
  specialization?: string;
  subjects?: string[];
  assignments?: Array<{
    grade_level_id: string;
    section_id: string;
    subject_id: string;
  }>;
  photo?: string;
  is_active?: boolean;
}

class TeacherService {
  // Get all teachers
  async getTeachers(params?: { 
    search?: string; 
    level?: string; 
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ results: Teacher[]; count: number }> {
    try {
      const response = await api.get('/api/teachers/teachers/', { 
        params: { 
          ...params,
          _t: Date.now() // Cache busting
        } 
      });
      console.log('Raw API response:', response);
      
      // Handle both response formats: { results: [...] } and direct array
      if (response && response.results && Array.isArray(response.results)) {
        return { results: response.results, count: response.results.length };
      } else if (Array.isArray(response)) {
        return { results: response, count: response.length };
      } else {
        console.warn('Unexpected response format:', response);
        return { results: [], count: 0 };
      }
    } catch (error) {
      console.error('Error in getTeachers:', error);
      return { results: [], count: 0 };
    }
  }

  // Get single teacher
  async getTeacher(id: number): Promise<Teacher> {
    const response = await api.get(`/api/teachers/teachers/${id}/`);
    return response;
  }

  // Create teacher
  async createTeacher(data: CreateTeacherData): Promise<Teacher> {
    const response = await api.post('/api/teachers/teachers/', data);
    return response;
  }

  // Update teacher
  async updateTeacher(id: number, data: UpdateTeacherData): Promise<Teacher> {
    // Transform the data to match backend expectations
    const updateData: any = { ...data };
    
    // If user data is provided, extract it for separate user update
    if (data.user) {
      // The backend expects user fields at the top level for updates
      updateData.first_name = data.user.first_name;
      updateData.last_name = data.user.last_name;
      updateData.email = data.user.email;
      delete updateData.user;
    }
    
    // Convert subjects from string array to number array if needed
    if (data.subjects && Array.isArray(data.subjects)) {
      updateData.subjects = data.subjects.map(s => parseInt(s, 10));
    }
    
    const response = await api.patch(`/api/teachers/teachers/${id}/`, updateData);
    return response;
  }

  // Delete teacher
  async deleteTeacher(id: number): Promise<void> {
    await api.delete(`/api/teachers/teachers/${id}/`);
  }

  // Activate teacher
  async activateTeacher(id: number): Promise<{ status: string }> {
    const response = await api.post(`/api/teachers/teachers/${id}/activate/`, {});
    return response;
  }

  // Deactivate teacher
  async deactivateTeacher(id: number): Promise<{ status: string }> {
    const response = await api.post(`/api/teachers/teachers/${id}/deactivate/`, {});
    return response;
  }

  // Get teacher statistics
  async getTeacherStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    by_level: {
      nursery: number;
      primary: number;
      secondary: number;
    };
  }> {
    const response = await api.get('/api/teachers/teachers/', { 
      params: { 
        _t: Date.now(),
        statistics: true 
      } 
    });
    
    // Calculate statistics from the response
    const teachers = response.results || response;
    const total = teachers.length;
    const active = teachers.filter((t: Teacher) => t.is_active).length;
    const inactive = total - active;
    
    const by_level = {
      nursery: teachers.filter((t: Teacher) => t.level === 'nursery' && t.is_active).length,
      primary: teachers.filter((t: Teacher) => t.level === 'primary' && t.is_active).length,
      secondary: teachers.filter((t: Teacher) => t.level === 'secondary' && t.is_active).length,
    };

    return { total, active, inactive, by_level };
  }
}

export default new TeacherService(); 