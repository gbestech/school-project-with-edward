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

export interface Subject {
  id: number;
  name: string;
  code: string;
  color?: string;
  description?: string;
}

export interface Teacher {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
}

export interface Classroom {
  id: number;
  name: string;
  building?: string;
  floor?: string;
  capacity?: number;
}

// New interfaces for schedule data
export interface ScheduleItem {
  id: number;
  subject: Subject;
  teacher: Teacher;
  classroom: Classroom;
  start_time: string;
  end_time: string;
  day_of_week: string;
  period: number;
  is_break?: boolean;
  duration_minutes?: number;
  notes?: string;
  is_current?: boolean;
  is_next?: boolean;
  
  // Legacy support for existing frontend code
  subject_name?: string;
  teacher_name?: string;
  classroom_name?: string;
  subject_code?: string;
}

export interface DaySchedule {
  day: string;
  day_display: string;
  date: string;
  periods: ScheduleItem[];
  total_periods?: number;
  break_periods?: number;
}

export interface StudentSchedule {
  student: {
    id: number;
    full_name: string;
    student_class: string;
    section?: string;
  };
  schedule: ScheduleItem[];
  schedule_by_day: {
    [key: string]: DaySchedule;
  };
  metadata: {
    total_periods: number;
    unique_subjects: number;
    unique_teachers: number;
    current_period?: ScheduleItem | null;
    next_period?: ScheduleItem | null;
    today_schedule?: DaySchedule;
  };
  week_start?: string;
  week_end?: string;
  academic_year?: string;
  term?: string;
}

export interface WeeklySchedule {
  student: {
    id: number;
    full_name: string;
    student_class: string;
  };
  week_start: string;
  week_end: string;
  schedule_by_day: {
    [key: string]: DaySchedule;
  };
  summary: {
    total_periods: number;
    subjects_count: number;
    teachers_count: number;
    weekly_hours: number;
  };
}

export interface ScheduleFilters {
  // Date range filters
  date?: string;
  week_start?: string;
  week_end?: string;
  // Subject/Teacher filters (canonical)
  subject?: string;
  teacher?: string;
  include_breaks?: boolean;
  // Legacy/UI-friendly aliases (optional)
  show_breaks?: boolean;
  subject_filter?: string;
  teacher_filter?: string;
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
      const response = await api.get('/api/students/students/dashboard/');
      return response;
    } catch (error) {
      console.error('Error fetching student dashboard data:', error);
      throw error;
    }
  }

  async getProfile(): Promise<Student> {
    try {
      const response = await api.get('/api/students/students/profile/');
      return response;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      throw error;
    }
  }
  
  // Get comprehensive student schedule with metadata
  async getStudentSchedule(studentId?: number, filters?: ScheduleFilters): Promise<StudentSchedule> {
    try {
      const endpoint = studentId 
        ? `/api/students/students/${studentId}/schedule/`
        : '/api/students/students/my-schedule/';
      
      console.log('🔄 Fetching student schedule from:', endpoint);
      
      const response = await api.get(endpoint, filters);
      console.log('✅ Student schedule response:', response);
      
      if (!response) {
        throw new Error('No schedule data received from server');
      }

      // Transform response to ensure backward compatibility
      const transformedResponse = this.transformScheduleResponse(response);
      
      return transformedResponse;
    } catch (error) {
      console.error('❌ Error fetching student schedule:', error);
      throw this.handleScheduleError(error);
    }
  }

  // Get weekly schedule with enhanced structure
  async getWeeklySchedule(studentId?: number, weekStart?: string): Promise<WeeklySchedule> {
    try {
      const endpoint = studentId 
        ? `/api/students/students/${studentId}/weekly_schedule/`
        : '/api/students/students/my-weekly-schedule/';
      
      const params = weekStart ? { week_start: weekStart } : undefined;
      
      console.log('🔄 Fetching weekly schedule from:', endpoint, params);
      
      const response = await api.get(endpoint, params);
      console.log('✅ Weekly schedule response:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Error fetching weekly schedule:', error);
      throw this.handleScheduleError(error);
    }
  }

  // Get today's schedule with current/next period information
  async getTodaySchedule(studentId?: number): Promise<DaySchedule & { current_period?: ScheduleItem; next_period?: ScheduleItem }> {
    try {
      const endpoint = studentId 
        ? `/api/students/students/${studentId}/today_schedule/`
        : '/api/students/students/my-today-schedule/';
      
      console.log('🔄 Fetching today\'s schedule from:', endpoint);
      
      const response = await api.get(endpoint);
      console.log('✅ Today\'s schedule response:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Error fetching today\'s schedule:', error);
      throw this.handleScheduleError(error);
    }
  }

  // Get current and next period information
  async getCurrentPeriod(studentId?: number): Promise<{ current?: ScheduleItem; next?: ScheduleItem }> {
    try {
      const endpoint = studentId 
        ? `/api/students/students/${studentId}/current_period/`
        : '/api/students/students/my-current-period/';
      
      console.log('🔄 Fetching current period from:', endpoint);
      
      const response = await api.get(endpoint);
      console.log('✅ Current period response:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Error fetching current period:', error);
      throw this.handleScheduleError(error);
    }
  }

   // UTILITY METHODS

  // Transform schedule response for backward compatibility
  private transformScheduleResponse(response: any): StudentSchedule {
    const transformItem = (item: ScheduleItem) => ({
      ...item,
      subject_name: (item as any).subject?.name || (item as any).subject_name,
      teacher_name: (item as any).teacher?.full_name || (item as any).teacher_name,
      classroom_name: (item as any).classroom?.name || (item as any).classroom_name,
      subject_code: (item as any).subject?.code || (item as any).subject_code,
    });

    // Add legacy fields to schedule items for backward compatibility
    if (Array.isArray(response?.schedule)) {
      response.schedule = response.schedule.map(transformItem);
    }

    // Transform schedule_by_day items and normalize shape to { periods: [...] }
    if (response && response.schedule_by_day && typeof response.schedule_by_day === 'object') {
      Object.keys(response.schedule_by_day).forEach(day => {
        const val = response.schedule_by_day[day];
        const periodsArray = Array.isArray(val)
          ? val
          : (Array.isArray(val?.periods) ? val.periods : []);
        const mapped = periodsArray.map(transformItem);
        response.schedule_by_day[day] = {
          ...(val && !Array.isArray(val) && typeof val === 'object' ? val : {}),
          periods: mapped,
        };
      });
    }

    return response;
  }

  // Enhanced error handling for schedule-related requests
  private handleScheduleError(error: any): Error {
    if (error.response?.status === 404) {
      return new Error('Schedule not found. The student may not have a schedule assigned.');
    } else if (error.response?.status === 403) {
      return new Error('Access denied. You do not have permission to view this schedule.');
    } else if (error.response?.status === 400) {
      return new Error(error.response?.data?.detail || 'Invalid schedule request.');
    } else if (error.response?.status >= 500) {
      return new Error('Server error. Please try again later.');
    }
    
    return error instanceof Error ? error : new Error('Failed to load schedule');
  }

  // Format time for display
  static formatTime(timeString: string): string {
    try {
      const date = new Date(`2024-01-01T${timeString}`);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  }

  // Format duration
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours}h ${mins}m`;
    }
  }

  // Get day name from date
  static getDayName(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }

  // Check if a period is currently active
  static isPeriodActive(item: ScheduleItem): boolean {
    const now = new Date();
    const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    // This is a simplified check - you might need to adjust based on your date handling
    const startTime = new Date(`${today}T${item.start_time}`);
    const endTime = new Date(`${today}T${item.end_time}`);
    
    return now >= startTime && now <= endTime;
  }

  // Get student profile picture URL with fallback
  static getProfilePictureUrl(student: any): string | null {
    if (student.profile_picture) {
      return student.profile_picture;
    }
    
    if (student.user?.profile_picture) {
      return student.user.profile_picture;
    }
    
    return '/images/default-avatar.png';
  }
}
  // Get student schedule by date range - OPTIONAL ADDITIONAL METHOD
  

export default new StudentService();