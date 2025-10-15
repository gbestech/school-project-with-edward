import api from './api';

// Exam Types
export interface Exam {
  id: number;
  title: string;
  code: string;
  description?: string;
  subject: any; // Can be number or nested object
  subject_name?: string; // Flat property for display
  subject_code?: string; // Flat property for display
  grade_level: any; // Can be number or nested object
  grade_level_name?: string; // Flat property for display
  section?: number | null;
  stream?: any; // Can be number or nested object
  stream_name?: string; // Flat property for display
  stream_type?: string; // Flat property for display
  teacher?: any; // Can be number or nested object
  teacher_name?: string; // Flat property for display
  exam_schedule?: number;
  exam_type: string;
  exam_type_display: string;
  difficulty_level: string;
  difficulty_level_display: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_marks: number;
  pass_marks?: number;
  pass_percentage: number;
  venue?: string;
  max_students?: number;
  instructions?: string;
  materials_allowed?: string;
  materials_provided?: string;
  status: string;
  status_display: string;
  is_practical: boolean;
  requires_computer: boolean;
  is_online: boolean;
  created_at: string;
  updated_at: string;
  // Question data
  objective_questions?: any[];
  theory_questions?: any[];
  practical_questions?: any[];
  custom_sections?: any[];
  objective_instructions?: string;
  theory_instructions?: string;
  practical_instructions?: string;
}

export interface ExamCreateData {
  title: string;
  code?: string;
  description?: string;
  subject: number;
  grade_level: number;
  section?: number | null; // Made optional since we removed section selection
  stream?: number;
  teacher?: number;
  exam_schedule?: number;
  exam_type: string;
  difficulty_level: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  total_marks: number;
  pass_marks?: number;
  venue?: string;
  max_students?: number;
  instructions?: string;
  materials_allowed?: string;
  materials_provided?: string;
  status: string;
  is_practical: boolean;
  requires_computer: boolean;
  is_online: boolean;
  // Question data
  objective_questions?: any[];
  theory_questions?: any[];
  practical_questions?: any[];
  custom_sections?: any[];
  objective_instructions?: string;
  theory_instructions?: string;
  practical_instructions?: string;
}

export interface ExamUpdateData {
  title?: string;
  code?: string;
  description?: string;
  subject?: number;
  grade_level?: number;
  section?: number | null;
  stream?: number;
  teacher?: number;
  exam_schedule?: number;
  exam_type?: string;
  difficulty_level?: string;
  exam_date?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  total_marks?: number;
  // Question data
  objective_questions?: any[];
  theory_questions?: any[];
  practical_questions?: any[];
  custom_sections?: any[];
  objective_instructions?: string;
  theory_instructions?: string;
  practical_instructions?: string;
  pass_marks?: number;
  venue?: string;
  max_students?: number;
  instructions?: string;
  materials_allowed?: string;
  materials_provided?: string;
  status?: string;
  is_practical?: boolean;
  requires_computer?: boolean;
  is_online?: boolean;
}

export interface ExamFilters {
  search?: string;
  exam_type?: string;
  status?: string;
  subject?: number;
  grade_level?: number;
  section?: number;
  stream?: number;
  teacher?: number;
  exam_schedule?: number;
  difficulty_level?: string;
  is_practical?: boolean;
  requires_computer?: boolean;
  is_online?: boolean;
  exam_date?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  total_marks_min?: number;
  total_marks_max?: number;
  duration_minutes_min?: number;
  duration_minutes_max?: number;
  venue?: string;
  term?: string;
  session_year?: string;
  ordering?: string;
}

export interface ExamSchedule {
  id: number;
  name: string;
  description?: string;
  term: string;
  session_year: string;
  start_date: string;
  end_date: string;
  registration_start?: string;
  registration_end?: string;
  results_publication_date?: string;
  is_active: boolean;
  allow_late_registration: boolean;
  is_registration_open: boolean;
  is_ongoing: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExamStatistics {
  id: number;
  exam: number;
  total_students: number;
  registered_students: number;
  completed_students: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  pass_rate: number;
  fail_rate: number;
  grade_distribution: Record<string, number>;
  calculated_at: string;
}

export interface ExamRegistration {
  id: number;
  exam: number;
  student: number;
  student_name: string;
  registration_date: string;
  status: string;
  special_needs?: string;
  accommodations?: string;
  notes?: string;
}

export class ExamService {
  private static baseUrl = '/api/exams';

  /**
   * Get all exams with optional filtering
   */
  static async getExams(filters: ExamFilters = {}): Promise<Exam[]> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const queryString = params.toString();
      const endpoint = `${this.baseUrl}/exams/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);
      return response.results || response || [];
    } catch (error) {
      console.error('❌ ExamService: Error fetching exams:', error);
      throw error;
    }
  }

  /**
   * Get a single exam by ID
   */
  static async getExam(id: number): Promise<Exam> {
    try {
      const response = await api.get(`${this.baseUrl}/exams/${id}/`);
      return response;
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw error;
    }
  }

  /**
   * Create a new exam
   */
  static async createExam(data: ExamCreateData): Promise<Exam> {
    try {
      const response = await api.post(`${this.baseUrl}/exams/`, data);
      return response;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  }

  /**
   * Update an existing exam
   */
  static async updateExam(id: number, data: ExamUpdateData): Promise<Exam> {
    try {
      const response = await api.put(`${this.baseUrl}/exams/${id}/`, data);
      return response;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  }

  /**
   * Delete an exam
   */
  static async deleteExam(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/exams/${id}/`);
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  }

  /**
   * Get exam schedules
   */
  static async getExamSchedules(): Promise<ExamSchedule[]> {
    try {
      const response = await api.get(`${this.baseUrl}/schedules/`);
      return response.results || response || [];
    } catch (error) {
      console.error('Error fetching exam schedules:', error);
      throw error;
    }
  }

  /**
   * Get exam statistics
   */
  static async getExamStatistics(examId: number): Promise<ExamStatistics> {
    try {
      const response = await api.get(`${this.baseUrl}/exams/${examId}/statistics/`);
      return response;
    } catch (error) {
      console.error('Error fetching exam statistics:', error);
      throw error;
    }
  }

  /**
   * Get exam registrations
   */
  static async getExamRegistrations(examId: number): Promise<ExamRegistration[]> {
    try {
      const response = await api.get(`${this.baseUrl}/exams/${examId}/registrations/`);
      return response.results || response || [];
    } catch (error) {
      console.error('Error fetching exam registrations:', error);
      throw error;
    }
  }

  /**
   * Start an exam
   */
  static async startExam(examId: number): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/exams/${examId}/start/`, {});
    } catch (error) {
      console.error('Error starting exam:', error);
      throw error;
    }
  }

  /**
   * End an exam
   */
  static async endExam(examId: number): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/exams/${examId}/end/`, {});
    } catch (error) {
      console.error('Error ending exam:', error);
      throw error;
    }
  }

  /**
   * Cancel an exam
   */
  static async cancelExam(examId: number, reason?: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/exams/${examId}/cancel/`, reason ? { reason } : {});
    } catch (error) {
      console.error('Error cancelling exam:', error);
      throw error;
    }
  }

  /**
   * Postpone an exam
   */
  static async postponeExam(examId: number, payload: { new_date: string; new_start_time?: string; new_end_time?: string; reason?: string }): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/exams/${examId}/postpone/`, payload);
    } catch (error) {
      console.error('Error postponing exam:', error);
      throw error;
    }
  }

  /**
   * Get upcoming exams
   */
  static async getUpcomingExams(): Promise<Exam[]> {
    try {
      const response = await api.get(`${this.baseUrl}/upcoming/`);
      return response.results || response || [];
    } catch (error) {
      console.error('Error fetching upcoming exams:', error);
      throw error;
    }
  }

  /**
   * Get completed exams
   */
  static async getCompletedExams(): Promise<Exam[]> {
    try {
      const response = await api.get(`${this.baseUrl}/completed/`);
      return response.results || response || [];
    } catch (error) {
      console.error('Error fetching completed exams:', error);
      throw error;
    }
  }

  /**
   * Get ongoing exams
   */
  static async getOngoingExams(): Promise<Exam[]> {
    try {
      const response = await api.get(`${this.baseUrl}/ongoing/`);
      return response.results || response || [];
    } catch (error) {
      console.error('Error fetching ongoing exams:', error);
      throw error;
    }
  }

  /**
   * Get exams by schedule
   */
  static async getExamsBySchedule(scheduleId: number): Promise<Exam[]> {
    try {
      const response = await api.get(`${this.baseUrl}/by-schedule/${scheduleId}/`);
      return response.results || response || [];
    } catch (error) {
      console.error('Error fetching exams by schedule:', error);
      throw error;
    }
  }

  /**
   * Get exams by subject
   */
  static async getExamsBySubject(subjectId: number): Promise<Exam[]> {
    try {
      const response = await api.get(`${this.baseUrl}/by-subject/${subjectId}/`);
      return response.results || response || [];
    } catch (error) {
      console.error('Error fetching exams by subject:', error);
      throw error;
    }
  }

  /**
   * Get exams by grade level
   */
  static async getExamsByGrade(gradeId: number): Promise<Exam[]> {
    try {
      const response = await api.get(`${this.baseUrl}/by-grade/${gradeId}/`);
      return response.results || response || [];
    } catch (error) {
      console.error('Error fetching exams by grade:', error);
      throw error;
    }
  }

  /**
   * Get exams by teacher
   */
  static async getExamsByTeacher(teacherId: number): Promise<Exam[]> {
    try {
      const response = await api.get(`${this.baseUrl}/by-teacher/${teacherId}/`);
      return response.results || response || [];
    } catch (error) {
      console.error('Error fetching exams by teacher:', error);
      throw error;
    }
  }

  /**
   * Approve an exam
   */
  static async approveExam(examId: number, notes: string = ''): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/exams/${examId}/approve/`, { notes });
      return response;
    } catch (error) {
      console.error('Error approving exam:', error);
      throw error;
    }
  }

  /**
   * Reject an exam
   */
  static async rejectExam(examId: number, reason: string = ''): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/exams/${examId}/reject/`, { reason });
      return response;
    } catch (error) {
      console.error('Error rejecting exam:', error);
      throw error;
    }
  }

  /**
   * Submit exam for approval
   */
  static async submitForApproval(examId: number): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/exams/${examId}/submit_for_approval/`, {});
      return response;
    } catch (error) {
      console.error('Error submitting exam for approval:', error);
      throw error;
    }
  }

  /**
   * Get exam types for dropdown
   */
  static getExamTypes() {
    return [
      { value: 'quiz', label: 'Quiz' },
      { value: 'test', label: 'Class Test' },
      { value: 'mid_term', label: 'Mid-Term Examination' },
      { value: 'final_exam', label: 'Final Examination' },
      { value: 'practical', label: 'Practical Examination' },
      { value: 'oral_exam', label: 'Oral Examination' },
    ];
  }

  /**
   * Get exam statuses for dropdown
   */
  static getExamStatuses() {
    return [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'postponed', label: 'Postponed' },
    ];
  }

  /**
   * Get difficulty levels for dropdown
   */
  static getDifficultyLevels() {
    return [
      { value: 'easy', label: 'Easy' },
      { value: 'medium', label: 'Medium' },
      { value: 'hard', label: 'Hard' },
      { value: 'mixed', label: 'Mixed' },
    ];
  }

  /**
   * Get status color for UI
   */
  static getStatusColor(status: string): string {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      postponed: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

