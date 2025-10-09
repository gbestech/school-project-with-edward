import api from '@/services/api';

export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone_number?: string;
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

// Updated to use the new ClassroomTeacherAssignment model
export interface ClassroomTeacherAssignment {
  id: number;
  teacher: number; // teacher ID
  subject: number; // subject ID
  classroom: number; // classroom ID
  classroom_name?: string;
  // Teacher details as separate fields
  teacher_name?: string;
  teacher_email?: string;
  teacher_phone?: string;
  teacher_employee_id?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  // Subject details as separate fields
  subject_name?: string;
  subject_code?: string;
  is_primary_teacher: boolean;
  periods_per_week: number;
  assigned_date: string;
  is_active: boolean;
}

// Legacy interface for backward compatibility (deprecated)
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
  class_teacher_phone?: string;
  class_teacher_employee_id?: string;
  room_number: string;
  max_capacity: number;
  current_enrollment: number;
  available_spots: number;
  enrollment_percentage: number;
  is_full: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Stream information for Senior Secondary
  stream?: number;
  stream_name?: string;
  stream_type?: string;
  // Updated to use new assignment model
  teacher_assignments?: ClassroomTeacherAssignment[];
  // Legacy field for backward compatibility
  old_teacher_assignments?: TeacherAssignment[];
}

export interface AcademicSession {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_active: boolean;
  description?: string;
}

export interface Term {
  id: number;
  name: string;
  academic_session: number;
  academic_session_name?: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_active: boolean;
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
  stream?: number; // New field for Senior Secondary streams
}

export interface UpdateClassroomData extends Partial<CreateClassroomData> {
  is_active?: boolean;
}

export interface AssignTeacherData {
  teacher_id: number;
  subject_id: number;
  is_primary_teacher?: boolean;
  periods_per_week?: number;
}

export interface RemoveTeacherAssignmentData {
  teacher_id: number;
  subject_id: number;
}

// New interface for enhanced teacher assignment
export interface CreateTeacherAssignmentData {
  classroom_id: number;
  teacher_id: number;
  subject_id: number;
  is_primary_teacher?: boolean;
  periods_per_week?: number;
}

export interface UpdateTeacherAssignmentData {
  is_primary_teacher?: boolean;
  periods_per_week?: number;
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
  async deleteClassroom(id: number): Promise<{ message: string; status: string }> {
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

  // Assign teacher to classroom (using new ClassroomTeacherAssignment model)
  async assignTeacherToClassroom(classroomId: number, data: AssignTeacherData) {
    const response = await api.post(`/api/classrooms/classrooms/${classroomId}/assign_teacher/`, data);
    return response;
  }

  // Remove teacher assignment from classroom
  async removeTeacherFromClassroom(classroomId: number, data: RemoveTeacherAssignmentData) {
    const response = await api.post(`/api/classrooms/classrooms/${classroomId}/remove_teacher/`, data);
    return response;
  }

  // New methods for enhanced teacher assignment management
  async createTeacherAssignment(data: CreateTeacherAssignmentData) {
    const response = await api.post('/api/classrooms/teacher-assignments/', data);
    return response;
  }

  async updateTeacherAssignment(assignmentId: number, data: UpdateTeacherAssignmentData) {
    const response = await api.patch(`/api/classrooms/teacher-assignments/${assignmentId}/`, data);
    return response;
  }

  async deleteTeacherAssignment(assignmentId: number) {
    const response = await api.delete(`/api/classrooms/teacher-assignments/${assignmentId}/`);
    return response;
  }

  async getTeacherAssignments(classroomId?: number, teacherId?: number) {
    const params: any = {};
    if (classroomId) params.classroom = classroomId;
    if (teacherId) params.teacher = teacherId;
    
    const response = await api.get('/api/classrooms/teacher-assignments/', { params });
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
    try {
      console.log('🔍 [ClassroomService] Fetching all subjects...');
      const response = await api.get('/api/subjects/');
      console.log('🔍 [ClassroomService] Subjects response:', response);
      return response;
    } catch (error) {
      console.error('🔍 [ClassroomService] Error fetching subjects:', error);
      // Return fallback subjects structure
      return {
        results: [
          { id: 1, name: 'English Studies', code: 'ENG', education_levels: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'], is_active: true },
          { id: 2, name: 'Mathematics', code: 'MATH', education_levels: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'], is_active: true },
          { id: 3, name: 'Basic Science', code: 'SCI', education_levels: ['PRIMARY', 'JUNIOR_SECONDARY'], is_active: true },
          { id: 4, name: 'Social Studies', code: 'SOC', education_levels: ['PRIMARY', 'JUNIOR_SECONDARY'], is_active: true },
          { id: 5, name: 'Physics', code: 'PHY', education_levels: ['SENIOR_SECONDARY'], is_active: true },
          { id: 6, name: 'Chemistry', code: 'CHEM', education_levels: ['SENIOR_SECONDARY'], is_active: true },
          { id: 7, name: 'Biology', code: 'BIO', education_levels: ['SENIOR_SECONDARY'], is_active: true },
        ]
      };
    }
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

  // ✅ UPDATED: Get academic sessions (previously academic years)
  async getAcademicYears() {
    const response = await api.get('/api/classrooms/academic-sessions/');
    return response;
  }

  // ✅ NEW: Get current academic session
  async getCurrentAcademicSession() {
    const response = await api.get('/api/classrooms/academic-sessions/current/');
    return response;
  }

  // ✅ NEW: Set current academic session
  async setCurrentAcademicSession(sessionId: number) {
    const response = await api.post(`/api/classrooms/academic-sessions/${sessionId}/set-current/`, {});
    return response;
  }

  // ✅ NEW: Get academic session statistics
  async getAcademicSessionStats(sessionId: number) {
    const response = await api.get(`/api/classrooms/academic-sessions/${sessionId}/statistics/`);
    return response;
  }

  // ✅ UPDATED: Get terms for an academic session (with enhanced filtering)
  async getTerms(academicSessionId?: number) {
    if (academicSessionId) {
      // Use the specific endpoint that returns terms for a session
      const response = await api.get(`/api/classrooms/academic-sessions/${academicSessionId}/terms/`);
      return response;
    } else {
      // Get all terms with optional filtering
      const response = await api.get('/api/classrooms/terms/');
      return response;
    }
  }

  // ✅ NEW: Get terms by session using query parameter
  async getTermsBySession(sessionId: number) {
    const response = await api.get('/api/classrooms/terms/by-session/', {
      params: { session_id: sessionId }
    });
    return response;
  }

  // ✅ NEW: Get current term
  async getCurrentTerm() {
    const response = await api.get('/api/classrooms/terms/current/');
    return response;
  }

  // ✅ NEW: Set current term
  async setCurrentTerm(termId: number) {
    const response = await api.post(`/api/classrooms/terms/${termId}/set-current/`, {});
    return response;
  }

  // ✅ NEW: Get subjects for a specific term
  async getTermSubjects(termId: number) {
    const response = await api.get(`/api/classrooms/terms/${termId}/subjects/`);
    return response;
  }

  // Get streams for Senior Secondary
  async getStreams() {
    const response = await api.get('/api/classrooms/streams/');
    return response;
  }

  // Get streams by type
  async getStreamsByType(streamType?: string) {
    const params = streamType ? { stream_type: streamType } : {};
    const response = await api.get('/api/classrooms/streams/by-type/', { params });
    return response;
  }

  // Get detailed student information
  async getStudentDetails(studentId: number) {
    const response = await api.get(`/api/students/students/${studentId}/`);
    return response;
  }
}

export const classroomService = new ClassroomService();
export default classroomService;