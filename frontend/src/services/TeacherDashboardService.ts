import TeacherService from './TeacherService';
import { getAttendance } from './AttendanceService';
import { LessonService } from './LessonService';
import ResultService from './ResultService';

export interface TeacherDashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalSubjects: number;
  attendanceRate: number;
  pendingExams: number;
  unreadMessages: number;
  upcomingLessons: number;
  recentResults: number;
}

export interface TeacherRecentActivity {
  id: number;
  type: 'attendance' | 'exam' | 'result' | 'message' | 'lesson';
  title: string;
  description: string;
  time: string;
  timestamp: string;
}

export interface TeacherUpcomingEvent {
  id: number;
  title: string;
  time: string;
  type: 'exam' | 'meeting' | 'lesson' | 'event';
  date: string;
  description?: string;
}

export interface TeacherClassData {
  id: number;
  name: string;
  section_id: number;
  section_name: string;
  grade_level_name: string;
  education_level: string;
  student_count: number;
  max_capacity: number;
  subject_name: string;
  subject_code: string;
  room_number: string;
  is_primary_teacher: boolean;
  periods_per_week: number;
  stream_name?: string;
  stream_type?: string;
}

export interface TeacherSubjectData {
  id: number;
  name: string;
  code: string;
  assignments: Array<{
    grade_level: string;
    section: string;
    education_level: string;
  }>;
}

class TeacherDashboardService {
  // Get teacher dashboard statistics
  async getTeacherDashboardStats(teacherId: number): Promise<TeacherDashboardStats> {
    try {
      // Get teacher's classroom assignments
      const teacherResponse = await TeacherService.getTeacher(teacherId);
      const classroomAssignments = teacherResponse.classroom_assignments || [];
      
      // Calculate total students
      const totalStudents = classroomAssignments.reduce((sum: number, assignment: any) => sum + (assignment.student_count || 0), 0);
      
      // Calculate total classes
      const totalClasses = classroomAssignments.length;
      
      // Calculate total subjects
      const uniqueSubjects = new Set(classroomAssignments.map((assignment: any) => assignment.subject_name));
      const totalSubjects = uniqueSubjects.size;
      
      // Get attendance rate for the current month
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const attendanceResponse = await getAttendance({
        teacher: teacherId,
        date__gte: startOfMonth.toISOString().split('T')[0],
        date__lte: endOfMonth.toISOString().split('T')[0]
      });
      
      let attendanceRate = 0;
      if (attendanceResponse && attendanceResponse.length > 0) {
        const totalRecords = attendanceResponse.length;
        const presentRecords = attendanceResponse.filter((record: any) => record.status === 'P').length;
        attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
      }
      
      // Get pending exams (lessons that are scheduled but not completed)
      const pendingExamsResponse = await LessonService.getLessons({
        teacher_id: teacherId,
        status_filter: 'scheduled',
        date_from: new Date().toISOString().split('T')[0]
      });
      
      const pendingExams = pendingExamsResponse?.length || 0;
      
      // Get upcoming lessons
      const upcomingLessonsResponse = await LessonService.getLessons({
        teacher_id: teacherId,
        date_from: new Date().toISOString().split('T')[0],
        status_filter: 'scheduled'
      });
      
      const upcomingLessons = upcomingLessonsResponse?.length || 0;
      
      // Get recent results count (using term results for now)
      const recentResultsResponse = await ResultService.getTermResults({
        // Note: created_at__gte is not supported, using default behavior
      });
      
      const recentResults = recentResultsResponse?.length || 0;
      
      // Mock unread messages (this would need a messaging service)
      const unreadMessages = 0;
      
      return {
        totalStudents,
        totalClasses,
        totalSubjects,
        attendanceRate,
        pendingExams,
        unreadMessages,
        upcomingLessons,
        recentResults
      };
    } catch (error) {
      console.error('Error fetching teacher dashboard stats:', error);
      return {
        totalStudents: 0,
        totalClasses: 0,
        totalSubjects: 0,
        attendanceRate: 0,
        pendingExams: 0,
        unreadMessages: 0,
        upcomingLessons: 0,
        recentResults: 0
      };
    }
  }

  // Get teacher's recent activities
  async getTeacherRecentActivities(teacherId: number): Promise<TeacherRecentActivity[]> {
    try {
      const activities: TeacherRecentActivity[] = [];
      
      // Get recent attendance records
      const attendanceResponse = await getAttendance({
        teacher: teacherId,
        date__gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ordering: '-date'
      });
      
      if (attendanceResponse && attendanceResponse.length > 0) {
        const latestAttendance = attendanceResponse[0];
        const presentCount = attendanceResponse.filter((record: any) => record.status === 'P').length;
        const absentCount = attendanceResponse.filter((record: any) => record.status === 'A').length;
        
        activities.push({
          id: latestAttendance.id,
          type: 'attendance',
          title: 'Marked attendance',
          description: `${presentCount} students present, ${absentCount} absent`,
          time: this.getTimeAgo(new Date(latestAttendance.date)),
          timestamp: latestAttendance.date
        });
      }
      
      // Get recent lessons
      const lessonsResponse = await LessonService.getLessons({
        teacher_id: teacherId,
        ordering: '-created_at'
      });
      
      if (lessonsResponse && lessonsResponse.length > 0) {
        const recentLesson = lessonsResponse[0];
        activities.push({
          id: recentLesson.id,
          type: 'lesson',
          title: `${recentLesson.status === 'completed' ? 'Completed' : 'Started'} lesson`,
          description: `${recentLesson.subject_name} - ${recentLesson.classroom_name}`,
          time: this.getTimeAgo(new Date(recentLesson.created_at)),
          timestamp: recentLesson.created_at
        });
      }
      
      // Get recent results (using term results for now)
      const resultsResponse = await ResultService.getTermResults({
        // Note: ordering is not supported in getTermResults
      });
      
      if (resultsResponse && resultsResponse.length > 0) {
        const recentResult = resultsResponse[0];
        activities.push({
          id: recentResult.id,
          type: 'result',
          title: 'Updated results',
          description: `${recentResult.subject_name} - ${recentResult.student_count || 0} students`,
          time: this.getTimeAgo(new Date(recentResult.created_at)),
          timestamp: recentResult.created_at
        });
      }
      
      // Sort activities by timestamp (most recent first)
      return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error fetching teacher recent activities:', error);
      return [];
    }
  }

  // Get teacher's upcoming events
  async getTeacherUpcomingEvents(teacherId: number): Promise<TeacherUpcomingEvent[]> {
    try {
      const events: TeacherUpcomingEvent[] = [];
      
      // Get upcoming lessons
      const upcomingLessonsResponse = await LessonService.getLessons({
        teacher_id: teacherId,
        date_from: new Date().toISOString().split('T')[0],
        status_filter: 'scheduled',
        ordering: 'date'
      });
      
      if (upcomingLessonsResponse && upcomingLessonsResponse.length > 0) {
        upcomingLessonsResponse.forEach((lesson: any) => {
          events.push({
            id: lesson.id,
            title: `${lesson.subject_name} - ${lesson.classroom_name}`,
            time: this.formatEventTime(lesson.date, lesson.start_time),
            type: 'lesson',
            date: lesson.date,
            description: `Lesson scheduled for ${lesson.classroom_name}`
          });
        });
      }
      
      // Get upcoming exams (lessons with exam type)
      const upcomingExamsResponse = await LessonService.getLessons({
        teacher_id: teacherId,
        date_from: new Date().toISOString().split('T')[0],
        lesson_type: 'exam',
        status_filter: 'scheduled',
        ordering: 'date'
      });
      
      if (upcomingExamsResponse && upcomingExamsResponse.length > 0) {
        upcomingExamsResponse.forEach((exam: any) => {
          events.push({
            id: exam.id,
            title: `${exam.subject_name} Test - ${exam.classroom_name}`,
            time: this.formatEventTime(exam.date, exam.start_time),
            type: 'exam',
            date: exam.date,
            description: `Exam scheduled for ${exam.classroom_name}`
          });
        });
      }
      
      // Sort events by date (earliest first)
      return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('Error fetching teacher upcoming events:', error);
      return [];
    }
  }

  // Get teacher's assigned classes
  async getTeacherClasses(teacherId: number): Promise<TeacherClassData[]> {
    try {
      const teacherResponse = await TeacherService.getTeacher(teacherId);
      const classroomAssignments = teacherResponse.classroom_assignments || [];
      
      // Transform to match TeacherClassData interface
      return classroomAssignments.map((assignment: any) => ({
        id: assignment.classroom_id, // Use classroom_id instead of assignment.id
        name: assignment.classroom_name,
        section_id: assignment.section_id, // Add section_id for attendance
        section_name: assignment.section_name,
        grade_level_name: assignment.grade_level_name,
        education_level: assignment.education_level,
        student_count: assignment.student_count,
        max_capacity: assignment.max_capacity,
        subject_name: assignment.subject_name,
        subject_code: assignment.subject_code,
        room_number: assignment.room_number,
        is_primary_teacher: assignment.is_primary_teacher,
        periods_per_week: assignment.periods_per_week,
        stream_name: assignment.stream_name,
        stream_type: assignment.stream_type
      }));
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      return [];
    }
  }

  // Get teacher ID from user data or fetch teacher profile
  async getTeacherIdFromUser(user: any): Promise<number | null> {
    try {
      console.log('🔍 TeacherDashboardService.getTeacherIdFromUser - Input user:', user);
      console.log('🔍 TeacherDashboardService.getTeacherIdFromUser - user.teacher_data:', (user as any)?.teacher_data);
      console.log('🔍 TeacherDashboardService.getTeacherIdFromUser - user.teacher_data.id:', (user as any)?.teacher_data?.id);
      
      // First, try to get teacher ID from user data structure
      let teacherId = (user as any)?.teacher_data?.id;
      
      if (teacherId) {
        console.log('🔍 TeacherDashboardService.getTeacherIdFromUser - Found teacher ID from teacher_data.id:', teacherId);
        return Number(teacherId);
      }
      
      // If not found in teacher_data, try to get from user ID
      const userId = user?.id;
      if (userId) {
        console.log('🔍 TeacherDashboardService.getTeacherIdFromUser - Trying to find teacher by user ID:', userId);
        
        // Try to find teacher by user ID
        const teachersResponse = await TeacherService.getTeachers({ 
          search: user?.email || user?.username 
        });
        
        console.log('🔍 TeacherDashboardService.getTeacherIdFromUser - Teachers response:', teachersResponse);
        
        if (teachersResponse.results && teachersResponse.results.length > 0) {
          // Find teacher that matches the current user
          const teacher = teachersResponse.results.find((t: any) => 
            t.user?.id === userId || t.user?.email === user?.email
          );
          
          if (teacher) {
            console.log('🔍 TeacherDashboardService.getTeacherIdFromUser - Found teacher by user ID:', teacher.id);
            return Number(teacher.id);
          }
        }
        
        // If still not found, try a more direct approach
        console.log('🔍 TeacherDashboardService.getTeacherIdFromUser - Trying direct teacher lookup...');
        try {
          const directTeacherResponse = await TeacherService.getTeacherByUserId(userId);
          if (directTeacherResponse && directTeacherResponse.id) {
            console.log('🔍 TeacherDashboardService.getTeacherIdFromUser - Found teacher by direct lookup:', directTeacherResponse.id);
            return Number(directTeacherResponse.id);
          }
        } catch (directError) {
          console.log('🔍 TeacherDashboardService.getTeacherIdFromUser - Direct lookup failed:', directError);
        }
      }
      
      console.log('🔍 TeacherDashboardService.getTeacherIdFromUser - No teacher ID found');
      return null;
    } catch (error) {
      console.error('Error getting teacher ID from user:', error);
      return null;
    }
  }

  // Get teacher's assigned subjects
  async getTeacherSubjects(teacherId: number): Promise<TeacherSubjectData[]> {
    try {
      const teacherResponse = await TeacherService.getTeacher(teacherId);
      const assignedSubjects = teacherResponse.assigned_subjects || [];
      
      // Transform to match TeacherSubjectData interface
      return assignedSubjects.map((subject: any) => ({
        id: subject.id,
        name: subject.name,
        code: subject.code || '',
        assignments: subject.assignments || []
      }));
    } catch (error) {
      console.error('Error fetching teacher subjects:', error);
      return [];
    }
  }

  // Helper function to format time ago
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  // Helper function to format event time
  private formatEventTime(date: string, time?: string): string {
    const eventDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return `Today, ${time || '9:00 AM'}`;
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${time || '9:00 AM'}`;
    } else {
      return eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      }) + `, ${time || '9:00 AM'}`;
    }
  }

  // Get comprehensive teacher dashboard data
  async getTeacherDashboardData(teacherId: number) {
    try {
      const [stats, activities, events, classes, subjects] = await Promise.all([
        this.getTeacherDashboardStats(teacherId),
        this.getTeacherRecentActivities(teacherId),
        this.getTeacherUpcomingEvents(teacherId),
        this.getTeacherClasses(teacherId),
        this.getTeacherSubjects(teacherId)
      ]);

      return {
        stats,
        activities,
        events,
        classes,
        subjects
      };
    } catch (error) {
      console.error('Error fetching teacher dashboard data:', error);
      return {
        stats: {
          totalStudents: 0,
          totalClasses: 0,
          totalSubjects: 0,
          attendanceRate: 0,
          pendingExams: 0,
          unreadMessages: 0,
          upcomingLessons: 0,
          recentResults: 0
        },
        activities: [],
        events: [],
        classes: [],
        subjects: []
      };
    }
  }

  // Get teacher profile data
  async getTeacherProfile(teacherId: number) {
    try {
      const teacherResponse = await TeacherService.getTeacher(teacherId);
      return teacherResponse;
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      return null;
    }
  }
}

export default new TeacherDashboardService();
