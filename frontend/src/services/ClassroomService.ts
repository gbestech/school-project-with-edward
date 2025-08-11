import api from '@/services/api';

export interface Classroom {
  id: number;
  name: string;
  section: number;
  section_name: string;
  grade_level_name: string;
  education_level: string;
  academic_year: number;
  academic_year_name: string;
  term: number;
  term_name: string;
  class_teacher: number | null;
  class_teacher_name: string;
  room_number: string;
  max_capacity: number;
  current_enrollment: number;
  available_spots: number;
  enrollment_percentage: number;
  is_full: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassroomStats {
  total_classrooms: number;
  active_classrooms: number;
  total_enrollment: number;
  average_enrollment: number;
  by_education_level: {
    nursery: number;
    primary: number;
    secondary: number;
  };
}

export interface CreateClassroomData {
  name: string;
  section: number;
  academic_year: number;
  term: number;
  class_teacher?: number;
  room_number?: string;
  max_capacity: number;
}

export interface UpdateClassroomData extends Partial<CreateClassroomData> {
  is_active?: boolean;
}

class ClassroomService {
  // Get all classrooms with optional filters
  async getClassrooms(params?: {
    search?: string;
    education_level?: string;
    is_active?: boolean;
    academic_year?: number;
    ordering?: string;
    page?: number;
    page_size?: number;
  }) {
    const response = await api.get('/api/classrooms/classrooms/', { params });
    return response;
  }

  // Get a single classroom by ID
  async getClassroom(id: number) {
    const response = await api.get(`/api/classrooms/classrooms/${id}/`);
    return response;
  }

  // Create a new classroom
  async createClassroom(data: CreateClassroomData) {
    const response = await api.post('/api/classrooms/classrooms/', data);
    return response;
  }

  // Update a classroom
  async updateClassroom(id: number, data: UpdateClassroomData) {
    const response = await api.patch(`/api/classrooms/classrooms/${id}/`, data);
    return response;
  }

  // Delete a classroom
  async deleteClassroom(id: number) {
    const response = await api.delete(`/api/classrooms/classrooms/${id}/`);
    return response;
  }

  // Get classroom statistics
  async getClassroomStats() {
    const response = await api.get('/api/classrooms/classrooms/statistics/');
    return response;
  }

  // Get students in a classroom
  async getClassroomStudents(classroomId: number) {
    const response = await api.get(`/api/classrooms/classrooms/${classroomId}/students/`);
    return response;
  }

  // Get teachers in a classroom
  async getClassroomTeachers(classroomId: number) {
    const response = await api.get(`/api/classrooms/classrooms/${classroomId}/teachers/`);
    return response;
  }

  // Get subjects in a classroom
  async getClassroomSubjects(classroomId: number) {
    const response = await api.get(`/api/classrooms/classrooms/${classroomId}/subjects/`);
    return response;
  }

  // Get schedule for a classroom
  async getClassroomSchedule(classroomId: number) {
    const response = await api.get(`/api/classrooms/classrooms/${classroomId}/schedule/`);
    return response;
  }

  // Get sections for dropdown
  async getSections() {
    const response = await api.get('/api/classrooms/sections/');
    return response;
  }

  // Get academic years for dropdown
  async getAcademicYears() {
    const response = await api.get('/api/classrooms/academic-years/');
    return response;
  }

  // Get terms for dropdown
  async getTerms() {
    const response = await api.get('/api/classrooms/terms/');
    return response;
  }

  // Get teachers for dropdown
  async getTeachers() {
    const response = await api.get('/api/teachers/teachers/');
    return response;
  }

  // Get subjects for dropdown
  async getSubjects() {
    const response = await api.get('/api/subjects/');
    return response;
  }
}

export const classroomService = new ClassroomService(); 