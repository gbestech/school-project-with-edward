import { AcademicSession } from '@/types/types';
import api from './api';

// Interfaces for result data
export interface StudentBasicInfo {
  id: string;
  name: string;
  admission_number: string;
  username?: string;
  class: string;
  education_level: string;
  gender?: string;
  age?: number;
  house?: string;
}

export interface TermInfo {
  id: string;
  name: string;
  academic_session: AcademicSession;
  start_date: string;
  end_date: string;
}

export interface SubjectResult {
  subject: {
    id: string;
    name: string;
    code: string;
  };
  // Common fields
  total_score: number;
  percentage: number;
  grade: string;
  position: number;
  class_average: number;
  highest_in_class: number;
  lowest_in_class: number;
  teacher_remark?: string;
  status?: string; // DRAFT, SUBMITTED, APPROVED, PUBLISHED
  subject_position?: number;
  
  // Education level specific fields
  test1_score?: number; // Senior Secondary (10 marks)
  test2_score?: number; // Senior Secondary (10 marks)
  test3_score?: number; // Senior Secondary (10 marks)
  exam_score?: number; // Senior Secondary (70 marks)
  
  // Primary/Junior Secondary CA breakdown
  ca1_score?: number; // 15 marks
  ca2_score?: number; // 5 marks
  ca3_score?: number; // 5 marks
  ca4_score?: number; // 5 marks
  ca5_score?: number; // 5 marks
  ca6_score?: number; // 5 marks
  exam_marks?: number; // 60 marks (Primary/Junior) vs 70 (Senior)
}

// Education Level Specific Result Interfaces
export interface NurseryResultData {
  id: string;
  student: StudentBasicInfo;
  term: TermInfo;
  subjects: (SubjectResult & {
    max_marks_obtainable: number;
    mark_obtained: number;
    physical_development_score?: number;
  })[];
  total_score: number;
  max_marks_obtainable: number;
  mark_obtained: number;
  position: number;
  class_position: number;
  total_students: number;
  attendance: {
    times_opened: number;
    times_present: number;
  };
  next_term_begins: string;
  class_teacher_remark?: string;
  head_teacher_remark?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrimaryResultData {
  id: string;
  student: StudentBasicInfo;
  term: TermInfo;
  subjects: (SubjectResult & {
   continuous_assessment_score: number;
    take_home_test_score: number;
    project_score: number;
    appearance_score:number;
    note_copying_score: number;
     practical_score: number;
    ca_total: number; // 40 marks (15+5+5+5+5+5)
    exam_marks: number; // 60 marks
    total_obtainable: number; // 100 marks
  })[];
  total_score: number;
  average_score: number;
  overall_grade: string;
  class_position: number;
  total_students: number;
  attendance: {
    times_opened: number;
    times_present: number;
  };
  next_term_begins: string;
  class_teacher_remark?: string;
  head_teacher_remark?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface JuniorSecondaryResultData extends PrimaryResultData {} // Same structure as Primary

export interface SeniorSecondaryTermlyResultData {
  id: string;
  student: StudentBasicInfo;
  term: TermInfo;
  subjects: (SubjectResult & {
    test1_score: number; // 10 marks
    test2_score: number; // 10 marks
    test3_score: number; // 10 marks
    exam_score: number; // 70 marks
    total_obtainable: number; // 100 marks
  })[];
  total_score: number;
  average_score: number;
  overall_grade: string;
  class_position: number;
  total_students: number;
  attendance: {
    times_opened: number;
    times_present: number;
  };
  next_term_begins: string;
  class_teacher_remark?: string;
  head_teacher_remark?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeniorSecondarySessionResultData {
  id: string;
  student: StudentBasicInfo;
  academic_session: {
    id: string;
    name: string;
    start_year: number;
    end_year: number;
  };
  term1_total: number;
  term2_total: number;
  term3_total: number;
  taa_score: number; // Total Annual Average
  average_for_year: number;
  obtainable: number;
  obtained: number;
  overall_grade: string;
  class_position: number;
  total_students: number;
  subjects: {
    subject: {
      id: string;
      name: string;
      code: string;
    };
    term1_score: number;
    term2_score: number;
    term3_score: number;
    average_score: number;
    class_average: number;
    highest_in_class: number;
    lowest_in_class: number;
    position: number;
    teacher_remark?: string;
    head_teacher_remark: string
  }[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Generic type for all result types
export type TermlyResult = NurseryResultData | PrimaryResultData | JuniorSecondaryResultData | SeniorSecondaryTermlyResultData;
export type SessionResult = SeniorSecondarySessionResultData;

export interface ResultSearchFilters {
  student_id?: string;
  class_id?: string;
  term_id?: string;
  academic_session_id?: string;
  exam_session_id?: string;
  result_type?: 'termly' | 'session';
  is_published?: boolean;
  education_level?: 'SENIOR_SECONDARY' | 'JUNIOR_SECONDARY' | 'PRIMARY' | 'NURSERY';
}

class ResultCheckerService {
  // FIXED: Get all results using existing hierarchical endpoints
  async getResults(filters: ResultSearchFilters = {}): Promise<{
    termly_results: TermlyResult[];
    session_results: SessionResult[];
  }> {
    try {
      // If education level is specified, only fetch for that level
      if (filters.education_level) {
        const termlyResults = await this.getTermlyResults(filters.education_level, filters);
        const results = { termly_results: termlyResults, session_results: [] as SessionResult[] };
        
        // Add session results for Senior Secondary
        if (filters.education_level === 'SENIOR_SECONDARY') {
          const sessionResults = await this.getSessionResults(filters);
          results.session_results = sessionResults;
        }
        
        return results;
      }

      // Otherwise fetch from all education levels
      const educationLevels = ['NURSERY', 'PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'] as const;
      
      // Fetch termly results for all education levels
      const termlyPromises = educationLevels.map(level => 
        this.getTermlyResults(level, filters).catch(() => [] as TermlyResult[])
      );

      // Fetch session results separately (only for Senior Secondary)
      const sessionResultsPromise = this.getSessionResults(filters).catch(() => [] as SessionResult[]);

      // Wait for all termly results
      const termlyResultsArrays = await Promise.all(termlyPromises);
      
      // Wait for session results
      const sessionResults = await sessionResultsPromise;

      // Flatten all termly results into a single array
      const allTermlyResults: TermlyResult[] = termlyResultsArrays.flat().filter(Boolean);

      return {
        termly_results: allTermlyResults,
        session_results: sessionResults
      };
    } catch (error) {
      console.error('Error fetching results:', error);
      return { termly_results: [], session_results: [] };
    }
  }

  // Get termly results by education level - UPDATED for new hierarchical structure
  async getTermlyResults(educationLevel: string, filters: ResultSearchFilters = {}): Promise<TermlyResult[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    let endpoint = '';
    switch (educationLevel.toUpperCase()) {
      case 'NURSERY':
        endpoint = `/api/results/nursery/results/?${params.toString()}`;
        break;
      case 'PRIMARY':
        endpoint = `/api/results/primary/results/?${params.toString()}`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `/api/results/junior-secondary/results/?${params.toString()}`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `/api/results/senior-secondary/results/?${params.toString()}`;
        break;
      default:
        throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    const response = await api.get(endpoint);
    return response.results || response;
  }

  // Get session results (Senior Secondary only) - UPDATED
  async getSessionResults(filters: ResultSearchFilters = {}): Promise<SessionResult[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/api/results/senior-secondary/session-results/?${params.toString()}`);
    return response.results || response;
  }

  // Get term reports by education level - NEW methods for term reports
  async getTermReports(educationLevel: string, filters: ResultSearchFilters = {}): Promise<any[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    let endpoint = '';
    switch (educationLevel.toUpperCase()) {
      case 'NURSERY':
        endpoint = `/api/results/nursery/term-reports/?${params.toString()}`;
        break;
      case 'PRIMARY':
        endpoint = `/api/results/primary/term-reports/?${params.toString()}`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `/api/results/junior-secondary/term-reports/?${params.toString()}`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `/api/results/senior-secondary/term-reports/?${params.toString()}`;
        break;
      default:
        throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    const response = await api.get(endpoint);
    return response.results || response;
  }

  // Get session reports (Senior Secondary only) - NEW
  async getSessionReports(filters: ResultSearchFilters = {}): Promise<any[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/api/results/senior-secondary/session-reports/?${params.toString()}`);
    return response.results || response;
  }

  // Get student term results (generic endpoint) - KEPT for backward compatibility
  async getStudentTermResults(filters: ResultSearchFilters = {}): Promise<any[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/api/results/student-term-results/?${params.toString()}`);
    return response.results || response;
  }

  // Get student results (generic endpoint) - KEPT for backward compatibility
  async getStudentResults(filters: ResultSearchFilters = {}): Promise<any[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/api/results/student-results/?${params.toString()}`);
    return response.results || response;
  }

  // Get specific result by ID - UPDATED
  async getResultById(resultId: string, educationLevel: string, resultType: 'termly' | 'session' = 'termly'): Promise<TermlyResult | SessionResult> {
    let endpoint = '';
    
    if (resultType === 'session' && educationLevel.toUpperCase() === 'SENIOR_SECONDARY') {
      endpoint = `/api/results/senior-secondary/session-results/${resultId}/`;
    } else {
      switch (educationLevel.toUpperCase()) {
        case 'NURSERY':
          endpoint = `/api/results/nursery/results/${resultId}/`;
          break;
        case 'PRIMARY':
          endpoint = `/api/results/primary/results/${resultId}/`;
          break;
        case 'JUNIOR_SECONDARY':
          endpoint = `/api/results/junior-secondary/results/${resultId}/`;
          break;
        case 'SENIOR_SECONDARY':
          endpoint = `/api/results/senior-secondary/results/${resultId}/`;
          break;
        default:
          throw new Error(`Unsupported education level: ${educationLevel}`);
      }
    }
    
    const response = await api.get(endpoint);
    return response;
  }

  // Get term report by ID - NEW
  async getTermReportById(reportId: string, educationLevel: string): Promise<any> {
    let endpoint = '';
    
    switch (educationLevel.toUpperCase()) {
      case 'NURSERY':
        endpoint = `/api/results/nursery/term-reports/${reportId}/`;
        break;
      case 'PRIMARY':
        endpoint = `/api/results/primary/term-reports/${reportId}/`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `/api/results/junior-secondary/term-reports/${reportId}/`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `/api/results/senior-secondary/term-reports/${reportId}/`;
        break;
      default:
        throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    const response = await api.get(endpoint);
    return response;
  }

  // Get session report by ID - NEW
  async getSessionReportById(reportId: string): Promise<any> {
    const response = await api.get(`/api/results/senior-secondary/session-reports/${reportId}/`);
    return response;
  }

  // Get class statistics - UPDATED
  async getClassStatistics(educationLevel: string, filters: { 
    exam_session?: string; 
    student_class?: string; 
    subject?: string;
    term_id?: string;
  } = {}): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    let endpoint = '';
    switch (educationLevel.toUpperCase()) {
      case 'NURSERY':
        endpoint = `/api/results/nursery/results/class_statistics/?${params.toString()}`;
        break;
      case 'PRIMARY':
        endpoint = `/api/results/primary/results/class_statistics/?${params.toString()}`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `/api/results/junior-secondary/results/class_statistics/?${params.toString()}`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `/api/results/senior-secondary/results/class_statistics/?${params.toString()}`;
        break;
      default:
        throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    const response = await api.get(endpoint);
    return response;
  }

  // Get grade distribution - NEW method to utilize the ViewSet action
  async getGradeDistribution(educationLevel: string, filters: {
    exam_session?: string;
    student_class?: string;
  } = {}): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    // Only Senior Secondary has grade distribution endpoint based on the views
    if (educationLevel.toUpperCase() === 'SENIOR_SECONDARY') {
      const response = await api.get(`/api/results/senior-secondary/results/grade_distribution/?${params.toString()}`);
      return response;
    }
    
    throw new Error('Grade distribution is only available for Senior Secondary');
  }

  // Get exam sessions - UPDATED
   async getExamSessions(): Promise<any[]> {
    try {
      // Try the hierarchical endpoint first
      const response = await api.get('/api/results/exam-sessions/');
      return response.results || response;
    } catch (error) {
      console.warn('Failed to fetch from /api/results/exam-sessions/, trying alternative');
      try {
        // Fallback to academic sessions
        const sessionsResponse = await api.get('/api/fee/academic-sessions/');
        const sessions = sessionsResponse.results || sessionsResponse;
        
        if (!sessions || sessions.length === 0) {
          console.warn('No exam sessions found');
          return [];
        }
        
        // Transform academic sessions to exam sessions format
        return sessions.map((session: any) => ({
          id: session.id,
          name: session.name || `${session.start_year}/${session.end_year}`,
          academic_session: session.id,
          is_current: session.is_current,
          is_active: session.is_active,
          start_date: session.start_date,
          end_date: session.end_date
        }));
      } catch (fallbackError) {
        console.error('Failed to fetch exam sessions from fallback:', fallbackError);
        return [];
      }
    }
  }

  // Get grading systems - UPDATED
  async getGradingSystems(): Promise<any[]> {
    const response = await api.get('/api/results/grading-systems/');
    return response.results || response;
  }

  // Get assessment types - UPDATED
  async getAssessmentTypes(): Promise<any[]> {
    const response = await api.get('/api/results/assessment-types/');
    return response.results || response;
  }

  // Get scoring configurations - UPDATED
  async getScoringConfigurations(): Promise<any[]> {
    const response = await api.get('/api/results/scoring-configurations/');
    return response.results || response;
  }

  // Get scoring configurations by education level - NEW
  async getScoringConfigurationsByEducationLevel(educationLevel: string): Promise<any[]> {
    const response = await api.get(`/api/results/scoring-configurations/by_education_level/?education_level=${educationLevel}`);
    return response;
  }

  // Get default scoring configurations - NEW
  async getDefaultScoringConfigurations(): Promise<any[]> {
    const response = await api.get('/api/results/scoring-configurations/defaults/');
    return response;
  }

  // Get available terms for filtering
  async getAvailableTerms(): Promise<TermInfo[]> {
    try {
      // Try the new endpoint structure first
      const response = await api.get('/api/fee/terms/');
      return response.results || response;
    } catch (error) {
      console.warn('Failed to fetch from /api/fee/terms/, trying alternative endpoint');
      try {
        // Fallback to academic sessions endpoint
        const sessionsResponse = await api.get('/api/fee/academic-sessions/');
        const sessions = sessionsResponse.results || sessionsResponse;
        
        // Return empty array if no sessions, frontend will handle gracefully
        if (!sessions || sessions.length === 0) {
          console.warn('No academic sessions found');
          return [];
        }
        
        // Generate term data from sessions
        const terms: TermInfo[] = [];
        sessions.forEach((session: any) => {
          ['First Term', 'Second Term', 'Third Term'].forEach((termName, index) => {
            terms.push({
              id: `${session.id}-term-${index + 1}`,
              name: termName,
              academic_session: {
                id: session.id,
                name: session.name,
                start_date: session.start_date,
                end_date: session.end_date,
                is_current: session.is_current,
                is_active: session.is_active,
                created_at: session.created_at,
                updated_at: session.updated_at
              },
              start_date: session.start_date,
              end_date: session.end_date
            });
          });
        });
        
        return terms;
      } catch (fallbackError) {
        console.error('Failed to fetch terms from fallback endpoint:', fallbackError);
        return [];
      }
    }
  }

  // Get available academic sessions for filtering
  async getAvailableSessions(): Promise<AcademicSession[]> {
    try {
      const response = await api.get('/api/fee/academic-sessions/');
      const data = response.results || response;
      
      if (!data || data.length === 0) {
        console.warn('No academic sessions found');
        return [];
      }
      
      return data.map((s: any) => ({
        id: s.id,
        name: s.name || `${s.start_year}/${s.end_year}`,
        start_date: s.start_date ?? `${s.start_year}-01-01`,
        end_date: s.end_date ?? `${s.end_year}-12-31`,
        is_current: s.is_current ?? false,
        is_active: s.is_active ?? false,
        created_at: s.created_at ?? new Date().toISOString(),
        updated_at: s.updated_at ?? new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching academic sessions:', error);
      return [];
    }
  }

  // Get available classes for filtering
  async getAvailableClasses(): Promise<{
    id: string;
    name: string;
    section: string;
    education_level?: string;
  }[]> {
    try {
      // Try to get classes from classrooms endpoint
      const response = await api.get('/api/classrooms/classrooms/');
      const classrooms = response.results || response;
      
      if (classrooms && classrooms.length > 0) {
        // Transform classroom data to include education level
        const transformedClasses = classrooms.map((classroom: any) => ({
          id: classroom.id.toString(),
          name: classroom.name,
          section: classroom.section?.name || 'A',
          education_level: classroom.section?.grade_level?.education_level || 'UNKNOWN'
        }));
        
        console.log('🔍 [ResultCheckerService] Loaded classes from API:', transformedClasses);
        return transformedClasses;
      }
      
      // Fallback: return comprehensive class list if API fails
      console.warn('🔍 [ResultCheckerService] API returned no classes, using fallback');
      return this.getFallbackClasses();
      
    } catch (error) {
      console.error('🔍 [ResultCheckerService] Error loading classes from API:', error);
      // Return comprehensive fallback classes
      return this.getFallbackClasses();
    }
  }

  // Fallback classes when API fails
  private getFallbackClasses(): {
    id: string;
    name: string;
    section: string;
    education_level?: string;
  }[] {
    return [
      // Nursery classes
      { id: 'pre-nursery', name: 'Pre-Nursery', section: 'A', education_level: 'NURSERY' },
      { id: 'nursery-1', name: 'Nursery 1', section: 'A', education_level: 'NURSERY' },
      { id: 'nursery-2', name: 'Nursery 2', section: 'A', education_level: 'NURSERY' },
      
      // Primary classes
      { id: 'primary-1', name: 'Primary 1', section: 'A', education_level: 'PRIMARY' },
      { id: 'primary-2', name: 'Primary 2', section: 'A', education_level: 'PRIMARY' },
      { id: 'primary-3', name: 'Primary 3', section: 'A', education_level: 'PRIMARY' },
      { id: 'primary-4', name: 'Primary 4', section: 'A', education_level: 'PRIMARY' },
      { id: 'primary-5', name: 'Primary 5', section: 'A', education_level: 'PRIMARY' },
      { id: 'primary-6', name: 'Primary 6', section: 'A', education_level: 'PRIMARY' },
      
      // Junior Secondary classes
      { id: 'jss-1', name: 'JSS 1', section: 'A', education_level: 'JUNIOR_SECONDARY' },
      { id: 'jss-2', name: 'JSS 2', section: 'A', education_level: 'JUNIOR_SECONDARY' },
      { id: 'jss-3', name: 'JSS 3', section: 'A', education_level: 'JUNIOR_SECONDARY' },
      
      // Senior Secondary classes
      { id: 'ss-1', name: 'SS 1', section: 'A', education_level: 'SENIOR_SECONDARY' },
      { id: 'ss-2', name: 'SS 2', section: 'A', education_level: 'SENIOR_SECONDARY' },
      { id: 'ss-3', name: 'SS 3', section: 'A', education_level: 'SENIOR_SECONDARY' },
    ];
  }

  // FIXED: Search students using direct student search endpoint
  async searchStudents(filters: { 
    class_id?: string; 
    search?: string; 
    education_level?: string;
    admission_number?: string;
  } = {}): Promise<StudentBasicInfo[]> {
    try {
      console.log('🔍 [ResultCheckerService] Starting student search with filters:', filters);
      
      // Use the direct student search endpoint
      const params = new URLSearchParams();
      
      // Build search parameters for student search
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.admission_number) {
        params.append('admission_number', filters.admission_number);
      }
      if (filters.class_id) {
        params.append('class_id', filters.class_id);
      }
      if (filters.education_level) {
        params.append('education_level', filters.education_level);
      }
      
      console.log('🔍 [ResultCheckerService] Searching students with params:', params.toString());
      
      // Search directly through the student endpoint
      const response = await api.get(`/api/students/students/?${params.toString()}`);
      console.log('🔍 [ResultCheckerService] Student search response:', response);
      
      const students = Array.isArray(response) ? response : (response.results || []);
      console.log('🔍 [ResultCheckerService] Found students:', students.length);
      
      // Transform student data to match StudentBasicInfo interface
      const transformedStudents: StudentBasicInfo[] = students
        .filter((student: any) => student && student.id) // Filter out invalid students
        .map((student: any) => {
          console.log('🔍 [ResultCheckerService] Raw student data:', {
            id: student.id,
            name: student.full_name || student.name,
            username: student.username,
            user: student.user,
            userUsername: student.user?.username,
            fullStudent: student
          });
          
          return {
            id: student.id || '',
            name: student.full_name || student.name || 'Unknown Student',
            admission_number: student.admission_number || 'N/A',
            username: student.username || student.user?.username || 'N/A',
            class: student.student_class || student.class_name || 'Unknown',
            education_level: student.education_level || 'Unknown',
            gender: student.gender || '',
            age: student.age || 0,
            house: student.house || ''
          };
        });
      
      console.log('🔍 [ResultCheckerService] Transformed students:', transformedStudents);
      return transformedStudents;
    } catch (error) {
      console.error('❌ [ResultCheckerService] Error searching students:', error);
      return [];
    }
  }

  // Get result sheets - UPDATED
  async getResultSheets(filters: ResultSearchFilters = {}): Promise<any[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/api/results/result-sheets/?${params.toString()}`);
    return response.results || response;
  }

  // Get assessment scores - UPDATED
  async getAssessmentScores(filters: {
    student_id?: string;
    subject_id?: string;
    assessment_type_id?: string;
    exam_session_id?: string;
  } = {}): Promise<any[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/api/results/assessment-scores/?${params.toString()}`);
    return response.results || response;
  }

  // Get result comments - UPDATED
  async getResultComments(filters: {
    student_id?: string;
    term_id?: string;
    result_type?: string;
  } = {}): Promise<any[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/api/results/result-comments/?${params.toString()}`);
    return response.results || response;
  }

  // New utility methods for bulk operations based on your ViewSets

  // Bulk create results
  async bulkCreateResults(educationLevel: string, results: any[]): Promise<any> {
    let endpoint = '';
    switch (educationLevel.toUpperCase()) {
      case 'NURSERY':
        endpoint = '/api/results/nursery/results/bulk_create/';
        break;
      case 'PRIMARY':
        endpoint = '/api/results/primary/results/bulk_create/';
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = '/api/results/junior-secondary/results/bulk_create/';
        break;
      case 'SENIOR_SECONDARY':
        endpoint = '/api/results/senior-secondary/results/bulk_create/';
        break;
      default:
        throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    const response = await api.post(endpoint, { results });
    return response;
  }

  // Approve result
  async approveResult(resultId: string, educationLevel: string): Promise<any> {
    let endpoint = '';
    switch (educationLevel.toUpperCase()) {
      case 'NURSERY':
        endpoint = `/api/results/nursery/results/${resultId}/approve/`;
        break;
      case 'PRIMARY':
        endpoint = `/api/results/primary/results/${resultId}/approve/`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `/api/results/junior-secondary/results/${resultId}/approve/`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `/api/results/senior-secondary/results/${resultId}/approve/`;
        break;
      default:
        throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    const response = await api.post(endpoint, {});
    return response;
  }

  // Publish result
  async publishResult(resultId: string, educationLevel: string): Promise<any> {
    let endpoint = '';
    switch (educationLevel.toUpperCase()) {
      case 'NURSERY':
        endpoint = `/api/results/nursery/results/${resultId}/publish/`;
        break;
      case 'PRIMARY':
        endpoint = `/api/results/primary/results/${resultId}/publish/`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `/api/results/junior-secondary/results/${resultId}/publish/`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `/api/results/senior-secondary/results/${resultId}/publish/`;
        break;
      default:
        throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    const response = await api.post(endpoint, {});
    return response;
  }

  // Publish term report
  async publishTermReport(reportId: string, educationLevel: string): Promise<any> {
    let endpoint = '';
    switch (educationLevel.toUpperCase()) {
      case 'NURSERY':
        endpoint = `/api/results/nursery/term-reports/${reportId}/publish/`;
        break;
      case 'PRIMARY':
        endpoint = `/api/results/primary/term-reports/${reportId}/publish/`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `/api/results/junior-secondary/term-reports/${reportId}/publish/`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `/api/results/senior-secondary/term-reports/${reportId}/publish/`;
        break;
      default:
        throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    const response = await api.post(endpoint, {});
    return response;
  }

  // Calculate metrics for term report
  async calculateTermReportMetrics(reportId: string, educationLevel: string): Promise<any> {
    let endpoint = '';
    switch (educationLevel.toUpperCase()) {
      case 'NURSERY':
        endpoint = `/api/results/nursery/term-reports/${reportId}/calculate_metrics/`;
        break;
      case 'PRIMARY':
        endpoint = `/api/results/primary/term-reports/${reportId}/calculate_metrics/`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `/api/results/junior-secondary/term-reports/${reportId}/calculate_metrics/`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `/api/results/senior-secondary/term-reports/${reportId}/calculate_metrics/`;
        break;
      default:
        throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    const response = await api.post(endpoint, {});
    return response;
  }
}

export default new ResultCheckerService();