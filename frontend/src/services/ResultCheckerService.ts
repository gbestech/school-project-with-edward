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
        endpoint = `results/nursery/results/?${params.toString()}`;
        break;
      case 'PRIMARY':
        endpoint = `results/primary/results/?${params.toString()}`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `results/junior-secondary/results/?${params.toString()}`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `results/senior-secondary/results/?${params.toString()}`;
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
    
    const response = await api.get(`results/senior-secondary/session-results/?${params.toString()}`);
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
        endpoint = `results/nursery/term-reports/?${params.toString()}`;
        break;
      case 'PRIMARY':
        endpoint = `results/primary/term-reports/?${params.toString()}`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `results/junior-secondary/term-reports/?${params.toString()}`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `results/senior-secondary/term-reports/?${params.toString()}`;
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
    
    const response = await api.get(`results/senior-secondary/session-reports/?${params.toString()}`);
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
    
    const response = await api.get(`results/student-term-results/?${params.toString()}`);
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
    
    const response = await api.get(`results/student-results/?${params.toString()}`);
    return response.results || response;
  }

  // Get specific result by ID - UPDATED
  async getResultById(resultId: string, educationLevel: string, resultType: 'termly' | 'session' = 'termly'): Promise<TermlyResult | SessionResult> {
    let endpoint = '';
    
    if (resultType === 'session' && educationLevel.toUpperCase() === 'SENIOR_SECONDARY') {
      endpoint = `results/senior-secondary/session-results/${resultId}/`;
    } else {
      switch (educationLevel.toUpperCase()) {
        case 'NURSERY':
          endpoint = `results/nursery/results/${resultId}/`;
          break;
        case 'PRIMARY':
          endpoint = `results/primary/results/${resultId}/`;
          break;
        case 'JUNIOR_SECONDARY':
          endpoint = `results/junior-secondary/results/${resultId}/`;
          break;
        case 'SENIOR_SECONDARY':
          endpoint = `results/senior-secondary/results/${resultId}/`;
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
        endpoint = `results/nursery/term-reports/${reportId}/`;
        break;
      case 'PRIMARY':
        endpoint = `results/primary/term-reports/${reportId}/`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `results/junior-secondary/term-reports/${reportId}/`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `results/senior-secondary/term-reports/${reportId}/`;
        break;
      default:
        throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    const response = await api.get(endpoint);
    return response;
  }

  // Get session report by ID - NEW
  async getSessionReportById(reportId: string): Promise<any> {
    const response = await api.get(`results/senior-secondary/session-reports/${reportId}/`);
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
        endpoint = `results/nursery/results/class_statistics/?${params.toString()}`;
        break;
      case 'PRIMARY':
        endpoint = `results/primary/results/class_statistics/?${params.toString()}`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `results/junior-secondary/results/class_statistics/?${params.toString()}`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `results/senior-secondary/results/class_statistics/?${params.toString()}`;
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
      const response = await api.get(`results/senior-secondary/results/grade_distribution/?${params.toString()}`);
      return response;
    }
    
    throw new Error('Grade distribution is only available for Senior Secondary');
  }

  // Get exam sessions - UPDATED
  async getExamSessions(): Promise<any[]> {
    const response = await api.get('results/exam-sessions/');
    return response.results || response;
  }

  // Get grading systems - UPDATED
  async getGradingSystems(): Promise<any[]> {
    const response = await api.get('results/grading-systems/');
    return response.results || response;
  }

  // Get assessment types - UPDATED
  async getAssessmentTypes(): Promise<any[]> {
    const response = await api.get('results/assessment-types/');
    return response.results || response;
  }

  // Get scoring configurations - UPDATED
  async getScoringConfigurations(): Promise<any[]> {
    const response = await api.get('results/scoring-configurations/');
    return response.results || response;
  }

  // Get scoring configurations by education level - NEW
  async getScoringConfigurationsByEducationLevel(educationLevel: string): Promise<any[]> {
    const response = await api.get(`results/scoring-configurations/by_education_level/?education_level=${educationLevel}`);
    return response;
  }

  // Get default scoring configurations - NEW
  async getDefaultScoringConfigurations(): Promise<any[]> {
    const response = await api.get('results/scoring-configurations/defaults/');
    return response;
  }

  // Get available terms for filtering
  async getAvailableTerms(): Promise<TermInfo[]> {
    const response = await api.get('fee/terms/');
    return response.results || response;
  }

  // Get available academic sessions for filtering
  async getAvailableSessions(): Promise<AcademicSession[]> {
    const response = await api.get('fee/academic-sessions/');
     const data = response.results || response;
    
     return data.map((s: any) => ({
      id: s.id,
      name: s.name,
      start_date: s.start_date ?? `${s.start_year}-01-01`,
      end_date: s.end_date ?? `${s.end_year}-12-31`,
      is_current: s.is_current ?? false,
      is_active: s.is_active ?? false,
      created_at: s.created_at ?? new Date().toISOString(),
      updated_at: s.upated_at ?? new Date().toISOString()
     })).results || response;
  }

  // Get available classes for filtering
  async getAvailableClasses(): Promise<{
    id: string;
    name: string;
    section: string;
    education_level?: string;
  }[]> {
    const response = await api.get('classrooms/classrooms/');
    return response.results || response;
  }

  // FIXED: Search students using existing endpoints
  async searchStudents(filters: { 
    class_id?: string; 
    search?: string; 
    education_level?: string;
    admission_number?: string;
  } = {}): Promise<StudentBasicInfo[]> {
    try {
      console.log('Starting comprehensive student search with filters:', filters);
      const params = new URLSearchParams();
      
      // Build search parameters
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
      
      // Try to search through student results to find students
      // This approach searches through existing result records to find students
      const allResults: any[] = [];
      
      // Search through different education levels based on filters
      const educationLevels = filters.education_level ? [filters.education_level] : 
        ['NURSERY', 'PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'];
      
      for (const level of educationLevels) {
        try {
          const results = await this.getTermlyResults(level, {
            class_id: filters.class_id,
            // Add other filters as needed
          });
          allResults.push(...results);
        } catch (error) {
          // Continue if one level fails
          console.warn(`Failed to fetch results for ${level}:`, error);
        }
      }
      
      // Extract unique students from results
      const studentsMap = new Map<string, StudentBasicInfo>();
      
      allResults.forEach(result => {
        if (result.student) {
          const student = result.student;
          
          // Apply search filters
          const searchTerm = filters.search?.toLowerCase();
          const admissionNumber = filters.admission_number?.toLowerCase();
          
          if (searchTerm) {
            const matchesSearch = 
              student.name?.toLowerCase().includes(searchTerm) ||
              student.username?.toLowerCase().includes(searchTerm) ||
              student.admission_number?.toLowerCase().includes(searchTerm);
            
            if (!matchesSearch) return;
          }
          
          if (admissionNumber) {
            if (!student.admission_number?.toLowerCase().includes(admissionNumber)) {
              return;
            }
          }
          
          studentsMap.set(student.id, student);
        }
      });
      
      return Array.from(studentsMap.values());
    } catch (error) {
      console.error('Error searching students:', error);
      
      // Fallback: try to search through student endpoints if available
      try {
        // Alternative approach: search through student-results endpoint
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
        
        const response = await api.get(`results/student-results/?${params.toString()}`);
        const results = response.results || response;
        
        // Extract unique students
        const studentsMap = new Map<string, StudentBasicInfo>();
        results.forEach((result: any) => {
          if (result.student) {
            studentsMap.set(result.student.id, result.student);
          }
        });
        
        return Array.from(studentsMap.values());
      } catch (fallbackError) {
        console.error('Fallback student search failed:', fallbackError);
        return [];
      }
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
    
    const response = await api.get(`results/result-sheets/?${params.toString()}`);
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
    
    const response = await api.get(`results/assessment-scores/?${params.toString()}`);
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
    
    const response = await api.get(`results/result-comments/?${params.toString()}`);
    return response.results || response;
  }

  // New utility methods for bulk operations based on your ViewSets

  // Bulk create results
  async bulkCreateResults(educationLevel: string, results: any[]): Promise<any> {
    let endpoint = '';
    switch (educationLevel.toUpperCase()) {
      case 'NURSERY':
        endpoint = 'results/nursery/results/bulk_create/';
        break;
      case 'PRIMARY':
        endpoint = 'results/primary/results/bulk_create/';
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = 'results/junior-secondary/results/bulk_create/';
        break;
      case 'SENIOR_SECONDARY':
        endpoint = 'results/senior-secondary/results/bulk_create/';
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
        endpoint = `results/nursery/results/${resultId}/approve/`;
        break;
      case 'PRIMARY':
        endpoint = `results/primary/results/${resultId}/approve/`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `results/junior-secondary/results/${resultId}/approve/`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `results/senior-secondary/results/${resultId}/approve/`;
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
        endpoint = `results/nursery/results/${resultId}/publish/`;
        break;
      case 'PRIMARY':
        endpoint = `results/primary/results/${resultId}/publish/`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `results/junior-secondary/results/${resultId}/publish/`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `results/senior-secondary/results/${resultId}/publish/`;
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
        endpoint = `results/nursery/term-reports/${reportId}/publish/`;
        break;
      case 'PRIMARY':
        endpoint = `results/primary/term-reports/${reportId}/publish/`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `results/junior-secondary/term-reports/${reportId}/publish/`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `results/senior-secondary/term-reports/${reportId}/publish/`;
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
        endpoint = `results/nursery/term-reports/${reportId}/calculate_metrics/`;
        break;
      case 'PRIMARY':
        endpoint = `results/primary/term-reports/${reportId}/calculate_metrics/`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `results/junior-secondary/term-reports/${reportId}/calculate_metrics/`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `results/senior-secondary/term-reports/${reportId}/calculate_metrics/`;
        break;
      default:
        throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    const response = await api.post(endpoint, {});
    return response;
  }
}

export default new ResultCheckerService();