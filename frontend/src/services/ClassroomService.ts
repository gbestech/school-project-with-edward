import api from '@/services/api';

export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  employee_id: string;
  level: 'nursery' | 'primary' | 'junior_secondary' | 'senior_secondary' | 'secondary';
  is_active: boolean;
  assigned_subjects: Array<{
    id: number;
    name: string;
  }>;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_core: boolean;
  is_active: boolean;
}

export interface TeacherAssignment {
  id: number;
  teacher: Teacher;
  subject: Subject;
  assigned_date: string;
  is_active: boolean;
}

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
  teacher_assignments?: TeacherAssignment[];
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

export interface AssignTeacherData {
  teacher_id: number;
  subject_id: number;
}

export interface RemoveTeacherAssignmentData {
  teacher_id: number;
  subject_id: number;
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

  // Assign teacher to classroom
  async assignTeacherToClassroom(classroomId: number, data: AssignTeacherData) {
    const response = await api.post(`/api/classrooms/classrooms/${classroomId}/assign_teacher/`, data);
    return response;
  }

  // Remove teacher assignment from classroom
  async removeTeacherFromClassroom(classroomId: number, data: RemoveTeacherAssignmentData) {
    const response = await api.post(`/api/classrooms/classrooms/${classroomId}/remove_teacher/`, data);
    return response;
  }

  // Get available teachers for assignment
  async getAvailableTeachers(classroomId: number, subjectId?: number) {
    const params = subjectId ? { subject_id: subjectId } : {};
    const response = await api.get(`/api/classrooms/classrooms/${classroomId}/available-teachers/`, { params });
    return response;
  }

  // Get available subjects for classroom
  async getAvailableSubjects(classroomId: number) {
    const response = await api.get(`/api/classrooms/classrooms/${classroomId}/available-subjects/`);
    return response;
  }

  // Get all teachers (for assignment dropdowns)
  async getAllTeachers() {
          const response = await api.get('/api/teachers/teachers/');
    return response;
  }

  // Get all subjects (for assignment dropdowns)
  async getAllSubjects() {
    const response = await api.get('/api/subjects/');
    return response;
  }

  // Get grade levels
  async getGradeLevels() {
    const response = await api.get('/api/classrooms/grades/');
    return response;
  }

  // Get sections for a grade level
  async getSections(gradeLevelId: number) {
    const response = await api.get(`/api/classrooms/grades/${gradeLevelId}/sections/`);
    return response;
  }

  // Get academic years
  async getAcademicYears() {
    const response = await api.get('/api/classrooms/academic-years/');
    return response;
  }

  // Get terms for an academic year
  async getTerms(academicYearId: number) {
    const response = await api.get(`/api/classrooms/academic-years/${academicYearId}/terms/`);
    return response;
  }

  // Auto-assign teachers based on their qualifications
  async autoAssignTeachers() {
    const response = await api.post('/api/classrooms/classrooms/auto-assign/');
    return response;
  }
}

export const classroomService = new ClassroomService();
export default classroomService; 