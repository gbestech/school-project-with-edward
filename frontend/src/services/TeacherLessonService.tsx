// Multi-role Lesson API functions for Frontend
import api from './api'; // Import your existing api utility

// Types for better type safety
interface LessonFilters {
  status?: string;
  lesson_type?: string;
  difficulty_level?: string;
  date?: string;
  date__gte?: string;
  date__lte?: string;
  teacher_id?: number;
  classroom_id?: number;
  subject_id?: number;
  date_filter?: 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'overdue';
  status_filter?: 'active' | 'completed' | 'cancelled';
  stream_filter?: string;
  search?: string;
  ordering?: string;
}

export interface TeacherLessonUpdateData {
  title?: string;
  description?: string;
  lesson_type?: string;
  difficulty_level?: string;
  status?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  completion_percentage?: number;
  learning_objectives?: string[];
  key_concepts?: string[];
  materials_needed?: string[];
  assessment_criteria?: string[];
  teacher_notes?: string;
  lesson_notes?: string;
  student_feedback?: string;
  admin_notes?: string;
  attendance_count?: number;
  participation_score?: number;
  resources?: any[];
  attachments?: any[];
}

interface UserRoleInfo {
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'unknown';
  user_id: number;
  username: string;
  teacher_info?: {
    teacher_id: number;
    teacher_name: string;
    subjects_taught: string[];
    classrooms_taught: string[];
  };
  student_info?: {
    student_id: number;
    student_name: string;
    enrolled_classrooms: string[];
  };
  parent_info?: {
    parent_id: number;
    parent_name: string;
    children: string[];
    children_classrooms: string[];
  };
}

interface LessonStatistics {
  role: string;
  total_lessons: number;
  completed_lessons: number;
  scheduled_lessons: number;
  in_progress_lessons: number;
  cancelled_lessons: number;
  avg_completion_percentage: number;
  upcoming_lessons: number;
  overdue_lessons: number;
  lessons_by_type: Array<{ lesson_type: string; count: number }>;
  lessons_by_status: Array<{ status: string; count: number }>;
}

export interface LessonCreateData {
  title: string;
  description?: string;
  lesson_type: string;
  difficulty_level: string;
  teacher: number;
  classroom: number;
  subject: number;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  learning_objectives?: string[];
  key_concepts?: string[];
  materials_needed?: string[];
  assessment_criteria?: string[];
  teacher_notes?: string;
  is_recurring?: boolean;
  recurring_pattern?: string;
  requires_special_equipment?: boolean;
  is_online_lesson?: boolean;
}

// Lesson API functions
export const lessonAPI = {
  // === CORE LESSON FUNCTIONS ===

  /**
   * Get lessons filtered by user role
   * - Admin: All lessons
   * - Teacher: Their lessons only
   * - Student: Lessons for their enrolled classes
   * - Parent: Lessons for their children's classes
   */
  async getLessons(filters?: LessonFilters) {
    try {
      console.log('🔍 Fetching lessons with filters:', filters);
      const response = await api.get('/lessons/', filters);
      console.log('✅ Lessons fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching lessons:', error);
      throw error;
    }
  },

  /**
   * Get lessons specifically for current user (convenience endpoint)
   */
  async getMyLessons() {
    try {
      console.log('🔍 Fetching my lessons');
      const response = await api.get('/lessons/my_lessons/');
      console.log('✅ My lessons fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching my lessons:', error);
      throw error;
    }
  },

  /**
   * Get current user's role and access information
   */
  async getUserRoleInfo(): Promise<UserRoleInfo> {
    try {
      console.log('🔍 Fetching user role info');
      const response = await api.get('/lessons/role_info/');
      console.log('✅ User role info fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching user role info:', error);
      throw error;
    }
  },

  /**
   * Get single lesson by ID (role-filtered)
   */
  async getLesson(lessonId: number) {
    try {
      console.log(`🔍 Fetching lesson ${lessonId}`);
      const response = await api.get(`/lessons/${lessonId}/`);
      console.log('✅ Lesson fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching lesson ${lessonId}:`, error);
      throw error;
    }
  },

  /**
   * Create new lesson (Admin and Teacher only)
   * static async createLesson(data: LessonCreateData): Promise<Lesson> {
   */
  async createLesson(lessonData: LessonCreateData) {
    try {
      console.log('📝 Creating new lesson:', lessonData);
      const response = await api.post('/lessons/', lessonData);
      console.log('✅ Lesson created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating lesson:', error);
      throw error;
    }
  },

  /**
   * Update lesson (Admin or lesson owner only)
   */
  async updateLesson(lessonId: number, lessonData: any) {
    try {
      console.log(`📝 Updating lesson ${lessonId}:`, lessonData);
      const response = await api.put(`/lessons/${lessonId}/`, lessonData);
      console.log('✅ Lesson updated successfully:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error updating lesson ${lessonId}:`, error);
      throw error;
    }
  },

  /**
   * Delete lesson (Admin or lesson owner only)
   */
  async deleteLesson(lessonId: number) {
    try {
      console.log(`🗑️ Deleting lesson ${lessonId}`);
      const response = await api.delete(`/lessons/${lessonId}/`);
      console.log('✅ Lesson deleted successfully');
      return response;
    } catch (error) {
      console.error(`❌ Error deleting lesson ${lessonId}:`, error);
      throw error;
    }
  },

  // === LESSON MANAGEMENT FUNCTIONS ===

  /**
   * Start a lesson (Teachers and Admins only)
   */
  async startLesson(lessonId: number) {
    try {
      console.log(`▶️ Starting lesson ${lessonId}`);
      const response = await api.post(`/lessons/${lessonId}/start_lesson/`, {});
      console.log('✅ Lesson started successfully:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error starting lesson ${lessonId}:`, error);
      throw error;
    }
  },

  /**
   * Complete a lesson (Teachers and Admins only)
   */
  async completeLesson(lessonId: number) {
    try {
      console.log(`✅ Completing lesson ${lessonId}`);
      const response = await api.post(`/lessons/${lessonId}/complete_lesson/`, {});
      console.log('✅ Lesson completed successfully:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error completing lesson ${lessonId}:`, error);
      throw error;
    }
  },

  /**
   * Cancel a lesson (Teachers and Admins only)
   */
  async cancelLesson(lessonId: number) {
    try {
      console.log(`Cancelling lesson ${lessonId}`);
      const response = await api.post(`/lessons/${lessonId}/cancel_lesson/`, {});
      console.log('Lesson cancelled successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error cancelling lesson ${lessonId}:`, error);
      throw error;
    }
  },

  /**
   * Update lesson status (Teachers and Admins only)
   */
  async updateLessonStatus(lessonId: number, statusData: { status: string; actual_start_time?: string; actual_end_time?: string; completion_percentage?: number }) {
    try {
      console.log(`Updating lesson ${lessonId} status:`, statusData);
      const response = await api.post(`/lessons/${lessonId}/update_status/`, statusData);
      console.log('Lesson status updated successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error updating lesson ${lessonId} status:`, error);
      throw error;
    }
  },

  /**
   * Get lesson progress
   */
  async getLessonProgress(lessonId: number) {
    try {
      console.log(`Getting progress for lesson ${lessonId}`);
      const response = await api.get(`/lessons/${lessonId}/get_progress/`);
      console.log('Lesson progress fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error getting lesson ${lessonId} progress:`, error);
      throw error;
    }
  },

  // === CALENDAR AND SCHEDULING ===

  /**
   * Get lessons for calendar view (role-filtered)
   */
  async getCalendarLessons(startDate?: string, endDate?: string) {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      console.log('Getting calendar lessons:', params);
      const response = await api.get('/lessons/calendar/', params);
      console.log('Calendar lessons fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Error fetching calendar lessons:', error);
      throw error;
    }
  },

  /**
   * Check for lesson scheduling conflicts
   */
  async checkLessonConflicts(classroomId: number, date: string, startTime: string, endTime: string, lessonId?: number) {
    try {
      const params = {
        classroom_id: classroomId,
        date,
        start_time: startTime,
        end_time: endTime,
        ...(lessonId && { lesson_id: lessonId })
      };
      
      console.log('Checking lesson conflicts:', params);
      const response = await api.get('/lessons/conflicts/', params);
      console.log('Conflict check completed:', response);
      return response;
    } catch (error) {
      console.error('Error checking lesson conflicts:', error);
      throw error;
    }
  },

  // === STATISTICS AND ANALYTICS ===

  /**
   * Get role-based lesson statistics
   */
  async getLessonStatistics(): Promise<LessonStatistics> {
    try {
      console.log('Fetching lesson statistics');
      const response = await api.get('/lessons/statistics/');
      console.log('Lesson statistics fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Error fetching lesson statistics:', error);
      throw error;
    }
  },

  // === HELPER FUNCTIONS ===

  /**
   * Get subjects for a selected teacher
   */
  async getTeacherSubjects(teacherId: number) {
    try {
      console.log(`Getting subjects for teacher ${teacherId}`);
      const response = await api.get('/lessons/teacher_subjects/', { teacher_id: teacherId });
      console.log('Teacher subjects fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching subjects for teacher ${teacherId}:`, error);
      throw error;
    }
  },

  /**
   * Get teachers for a selected subject
   */
  async getSubjectTeachers(subjectId: number) {
    try {
      console.log(`Getting teachers for subject ${subjectId}`);
      const response = await api.get('/lessons/subject_teachers/', { subject_id: subjectId });
      console.log('Subject teachers fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching teachers for subject ${subjectId}:`, error);
      throw error;
    }
  },

  /**
   * Get classrooms for a selected teacher
   */
  async getTeacherClassrooms(teacherId: number, subjectId?: number) {
    try {
      const params: any = { teacher_id: teacherId };
      if (subjectId) params.subject_id = subjectId;
      
      console.log(`Getting classrooms for teacher ${teacherId}:`, params);
      const response = await api.get('/lessons/teacher_classrooms/', params);
      console.log('Teacher classrooms fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching classrooms for teacher ${teacherId}:`, error);
      throw error;
    }
  },

  /**
   * Get subjects filtered by education level
   */
  async getSubjectsByLevel(educationLevel: string, gradeLevelId?: number, stream?: string) {
    try {
      const params: any = { education_level: educationLevel };
      if (gradeLevelId) params.grade_level_id = gradeLevelId;
      if (stream) params.stream = stream;
      
      console.log('Getting subjects by level:', params);
      const response = await api.get('/lessons/subjects_by_level/', params);
      console.log('Subjects by level fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Error fetching subjects by level:', error);
      throw error;
    }
  },

  /**
   * Get enrolled students for a lesson
   */
  async getLessonEnrolledStudents(lessonId: number) {
    try {
      console.log(`Getting enrolled students for lesson ${lessonId}`);
      const response = await api.get(`/lessons/${lessonId}/enrolled_students/`);
      console.log('Enrolled students fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching enrolled students for lesson ${lessonId}:`, error);
      throw error;
    }
  },

  /**
   * Download lesson report
   */
  async downloadLessonReport(lessonId: number) {
    try {
      console.log(`Downloading report for lesson ${lessonId}`);
      const response = await api.get(`/lessons/${lessonId}/download_report/`);
      console.log('Lesson report downloaded successfully');
      return response;
    } catch (error) {
      console.error(`Error downloading report for lesson ${lessonId}:`, error);
      throw error;
    }
  },

  // === BULK OPERATIONS ===

  /**
   * Create multiple lessons at once
   */
  async bulkCreateLessons(lessonsData: any[]) {
    try {
      console.log('Creating bulk lessons:', lessonsData);
      const response = await api.post('/lessons/bulk_create/', { lessons: lessonsData });
      console.log('Bulk lessons created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating bulk lessons:', error);
      throw error;
    }
  },
};

// === ATTENDANCE API ===
export const attendanceAPI = {
  /**
   * Get attendance records (role-filtered)
   * - Admin: All attendance
   * - Teacher: Attendance for their lessons
   * - Student: Their own attendance
   * - Parent: Their children's attendance
   */
  async getAttendance(filters?: { lesson_id?: number; student_id?: number; status?: string }) {
    try {
      console.log('Fetching attendance with filters:', filters);
      const response = await api.get('/attendances/', filters);
      console.log('Attendance fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  /**
   * Create attendance record
   */
  async createAttendance(attendanceData: any) {
    try {
      console.log('Creating attendance record:', attendanceData);
      const response = await api.post('/attendances/', attendanceData);
      console.log('Attendance record created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating attendance record:', error);
      throw error;
    }
  },

  /**
   * Update attendance record
   */
  async updateAttendance(attendanceId: number, attendanceData: any) {
    try {
      console.log(`Updating attendance ${attendanceId}:`, attendanceData);
      const response = await api.put(`/attendances/${attendanceId}/`, attendanceData);
      console.log('Attendance updated successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error updating attendance ${attendanceId}:`, error);
      throw error;
    }
  },
};

// === LESSON RESOURCES API ===
export const resourceAPI = {
  /**
   * Get lesson resources (role-filtered)
   */
  async getResources(filters?: { lesson_id?: number; resource_type?: string; is_required?: boolean }) {
    try {
      console.log('Fetching resources with filters:', filters);
      const response = await api.get('/resources/', filters);
      console.log('Resources fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },

  /**
   * Create lesson resource
   */
  async createResource(resourceData: any) {
    try {
      console.log('Creating resource:', resourceData);
      const response = await api.post('/resources/', resourceData);
      console.log('Resource created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },
};

// === LESSON ASSESSMENTS API ===
export const assessmentAPI = {
  /**
   * Get lesson assessments (role-filtered)
   */
  async getAssessments(filters?: { lesson_id?: number; assessment_type?: string; due_date?: string }) {
    try {
      console.log('Fetching assessments with filters:', filters);
      const response = await api.get('/assessments/', filters);
      console.log('Assessments fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  },

  /**
   * Create lesson assessment
   */
  async createAssessment(assessmentData: any) {
    try {
      console.log('Creating assessment:', assessmentData);
      const response = await api.post('/assessments/', assessmentData);
      console.log('Assessment created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  },
};

// === ROLE-SPECIFIC HELPER FUNCTIONS ===

/**
 * Get lessons based on user role with smart defaults
 */
export const getRoleBasisedLessons = async (customFilters?: LessonFilters) => {
  try {
    // First get user role info
    const roleInfo = await lessonAPI.getUserRoleInfo();
    
    // Set default filters based on role
    let defaultFilters: LessonFilters = {};
    
    switch (roleInfo.role) {
      case 'student':
        // Students typically want upcoming lessons
        defaultFilters = {
          status_filter: 'active',
          date_filter: 'this_week'
        };
        break;
      case 'parent':
        // Parents typically want to see upcoming lessons for their children
        defaultFilters = {
          status_filter: 'active',
          date_filter: 'this_week'
        };
        break;
      case 'teacher':
        // Teachers might want to see their upcoming lessons
        defaultFilters = {
          date_filter: 'this_week'
        };
        break;
      case 'admin':
        // Admins might want to see all recent lessons
        defaultFilters = {
          date_filter: 'this_week'
        };
        break;
    }
    
    // Merge custom filters with defaults
    const finalFilters = { ...defaultFilters, ...customFilters };
    
    // Get lessons with combined filters
    const lessons = await lessonAPI.getLessons(finalFilters);
    
    return {
      roleInfo,
      lessons,
      appliedFilters: finalFilters
    };
  } catch (error) {
    console.error('Error getting role-based lessons:', error);
    throw error;
  }
};

// === USAGE EXAMPLES ===

/*
// Example: Get lessons for current user
const userLessons = await lessonAPI.getMyLessons();

// Example: Get role-specific lessons with smart defaults
const { roleInfo, lessons } = await getRoleBasisedLessons();

// Example: Get lessons with custom filters
const filteredLessons = await lessonAPI.getLessons({
  status: 'scheduled',
  date_filter: 'this_week',
  subject_id: 123
});

// Example: Check user role before showing UI elements
const roleInfo = await lessonAPI.getUserRoleInfo();
if (roleInfo.role === 'teacher' || roleInfo.role === 'admin') {
  // Show lesson creation button
}

// Example: Get calendar lessons
const calendarLessons = await lessonAPI.getCalendarLessons('2024-01-01', '2024-01-31');

// Example: Student getting their attendance
const myAttendance = await attendanceAPI.getAttendance();

// Example: Parent getting their children's attendance
const childrenAttendance = await attendanceAPI.getAttendance();

// Example: Teacher checking lesson conflicts before creating
const conflicts = await lessonAPI.checkLessonConflicts(1, '2024-01-15', '09:00', '10:00');
if (conflicts.conflicts.length === 0) {
  // Safe to create lesson
}
*/