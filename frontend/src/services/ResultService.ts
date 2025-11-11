import api from './api';

// Base interfaces matching Django models

export type ResultStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED';
import {
  AcademicSession,  
  ExamSessionInfo, 
NurseryResultData,
PrimaryResultData,
JuniorSecondaryResultData,
SeniorSecondaryResultData,
SeniorSecondarySessionResultData,
StandardResult,
StudentTermResult,
} from '../types/types'

export interface ResultComment {
  id: string;
  comment_type: string;
  comment: string;
  commented_by: {
    id: string;
    username: string;
    full_name: string;
  };
  created_at: string;
}

export interface ExamSession {
  id: string;
  name: string;
  exam_type: string;
  term: string;
  academic_session?: AcademicSession;
  start_date: string;
  end_date: string;
  result_release_date?: string;
  is_published: boolean;
  is_active: boolean;
}

export interface FilterParams {
  student?: string;
  subject?: string;
  exam_session?: string;
  academic_session?: AcademicSession;
  term?: string;
  status?: ResultStatus;
  is_passed?: boolean;
  is_active?: boolean;
  stream?: string;
  search?: string;
  education_level?: string;
  result_type?: 'termly' | 'session';
}

export interface TranscriptOptions {
  include_assessment_details?: boolean;
  include_comments?: boolean;
  include_subject_remarks?: boolean;
  format?: 'PDF' | 'HTML' | 'DOCX';
}

class ResultService {
  private baseURL = '/api/results'; // Updated: removed /api/ prefix since our api helper handles it
  private cache = new Map<string, {data: any; timestamp: number}>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getCachedOrFetch(key: string, fetcher: () => Promise<any>) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

// Helper function to extract session info properly
// Helper function to extract session info properly
private extractSessionInfo(report: any): AcademicSession | undefined {
  // Try to get session from exam_session
  const examSession = report.exam_session;
  if (!examSession) return undefined;
  
  // If the API already returned a full academic_session object, return it (matches AcademicSession)
  if (examSession.academic_session && typeof examSession.academic_session === 'object') {
    return examSession.academic_session as AcademicSession;
  }
  
  // If the API only provided an academic_session_name or an ID, we cannot reliably construct a full AcademicSession,
  // so return undefined to keep the academic_session property compatible with AcademicSession | undefined.
  return undefined;
}

  // Data transformation methods - ADDED: Missing transform methods
  private transformNurseryResults(results: NurseryResultData[]): StandardResult[] {
    return results.map(result => ({
      id: result.id,
      student: result.student,
      subject: result.subject,
      academic_session: this.extractSessionInfo(result),
      education_level: 'NURSERY',
      grading_system: result.grading_system,
      total_score: result.mark_obtained,
      percentage: result.percentage,
      grade: result.grade,
      grade_point: result.grade_point,
      is_passed: result.is_passed,
      position: result.position,
      exam_score: result.mark_obtained,
      breakdown: {
        max_marks_obtainable: result.max_marks_obtainable,
        mark_obtained: result.mark_obtained,
        physical_development: result.physical_development,
        health: result.health,
        cleanliness: result.cleanliness,
        general_conduct: result.general_conduct,
      },
      status: result.status,
      teacher_remark: result.academic_comment,
      created_at: result.created_at,
    }));
   
  }

  private transformPrimaryResults(results: PrimaryResultData[]): StandardResult[] {
    return results.map(result => ({
      id: result.id,
      student: result.student,
      subject: result.subject,
     academic_session: this.extractSessionInfo(result),
      education_level: 'PRIMARY',
      grading_system: result.grading_system,
      total_score: result.total_score,
      percentage: result.total_percentage,
      grade: result.grade,
      grade_point: result.grade_point,
      is_passed: result.is_passed,
      continuous_assessment_score: result.continuous_assessment_score,
      take_home_test_score: result.take_home_test_score,
      practical_score: result.practical_score,
      project_score: result.project_score,
      appearance_score: result.appearance_score,
      note_copying_score: result.note_copying_score,
      exam_score: result.exam_score,
      breakdown: {
        continuous_assessment_score: result.continuous_assessment_score,
        take_home_test_score: result.take_home_test_score,
        practical_score: result.practical_score,
        appearance_score: result.appearance_score,
        project_score: result.project_score,
        note_copying_score: result.note_copying_score,
        ca_total: result.ca_total,
        ca_percentage: result.ca_percentage,
        exam_percentage: result.exam_percentage,
      },
      class_average: result.class_average,
      highest_in_class: result.highest_in_class,
      lowest_in_class: result.lowest_in_class,
      position: result.subject_position,
      status: result.status,
      teacher_remark: result.teacher_remark,
      created_at: result.created_at,
     
    }));
    
  }

  private transformJuniorSecondaryResults(results: JuniorSecondaryResultData[]): StandardResult[] {
    return results.map(result => ({
      id: result.id,
      student: result.student,
      subject: result.subject,
      academic_session: this.extractSessionInfo(result),
      education_level: 'JUNIOR_SECONDARY',
      grading_system: result.grading_system,
      total_score: result.total_score,
      percentage: result.total_percentage,
      grade: result.grade,
      grade_point: result.grade_point,
      is_passed: result.is_passed,
      continuous_assessment_score: result.continuous_assessment_score,
      take_home_test_score: result.take_home_test_score,
      practical_score: result.practical_score,
      project_score: result.project_score,
      appearance_score: result.appearance_score,
      note_copying_score: result.note_copying_score,
      exam_score: result.exam_score,
      breakdown: {
        continuous_assessment_score: result.continuous_assessment_score,
        take_home_test_score: result.take_home_test_score,
        practical_score: result.practical_score,
        appearance_score: result.appearance_score,
        project_score: result.project_score,
        note_copying_score: result.note_copying_score,
        ca_total: result.ca_total,
        ca_percentage: result.ca_percentage,
        exam_percentage: result.exam_percentage,
      },
      class_average: result.class_average,
      highest_in_class: result.highest_in_class,
      lowest_in_class: result.lowest_in_class,
      position: result.subject_position,
      status: result.status,
      teacher_remark: result.teacher_remark,
      created_at: result.created_at,
    }));
  }

  private transformSeniorSecondaryResults(results: SeniorSecondaryResultData[]): StandardResult[] {
    return results.map(result => ({
      id: result.id,
      student: result.student,
      subject: result.subject,
      academic_session: this.extractSessionInfo(result),
      education_level: 'SENIOR_SECONDARY',
      stream: result.stream,
      grading_system: result.grading_system,
      total_score: result.total_score,
      percentage: result.percentage,
      grade: result.grade,
      grade_point: result.grade_point,
      is_passed: result.is_passed,
      first_test_score: result.first_test_score,
      second_test_score: result.second_test_score,
      third_test_score: result.third_test_score,
      exam_score: result.exam_score,
      breakdown: {
        first_test_score: result.first_test_score,
        second_test_score: result.second_test_score,
        third_test_score: result.third_test_score,
        exam_score: result.exam_score,
      },
      class_average: result.class_average,
      highest_in_class: result.highest_in_class,
      lowest_in_class: result.lowest_in_class,
      position: result.subject_position,
      status: result.status,
      teacher_remark: result.teacher_remark,
      created_at: result.created_at,
    }));
  }

  private transformSeniorSessionResults(results: SeniorSecondarySessionResultData[]): StandardResult[] {
    return results.map(result => ({
      id: result.id,
      student: result.student,
      subject: result.subject,
      academic_session: this.extractSessionInfo(result),
      education_level: 'SENIOR_SECONDARY',
      stream: result.stream,
      total_score: result.obtained,
      percentage: (result.obtained / result.obtainable) * 100,
      grade: '', // You might want to calculate this based on percentage
      is_passed: result.obtained >= (result.obtainable * 0.4), // Assuming 40% pass mark
      exam_score: result.obtained,
      class_average: result.class_average,
      highest_in_class: result.highest_in_class,
      lowest_in_class: result.lowest_in_class,
      position: result.subject_position,
      status: result.status,
      teacher_remark: result.teacher_remark,
      created_at: result.created_at,
    }));
  }


  
  // Core API methods - UPDATED to use new hierarchical structure
  async getNurseryResults(params?: FilterParams): Promise<NurseryResultData[]> {
    try {
      const response = await api.get(`${this.baseURL}/nursery/results/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching nursery results:', error);
      return [];
    }
  }

  async getPrimaryResults(params?: FilterParams): Promise<PrimaryResultData[]> {
    try {
      const response = await api.get(`${this.baseURL}/primary/results/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching primary results:', error);
      return [];
    }
  }

  async getJuniorSecondaryResults(params?: FilterParams): Promise<JuniorSecondaryResultData[]> {
    try {
      const response = await api.get(`${this.baseURL}/junior-secondary/results/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching junior secondary results:', error);
      return [];
    }
  }

  async getSeniorSecondaryResults(params?: FilterParams): Promise<SeniorSecondaryResultData[]> {
    try {
      const response = await api.get(`${this.baseURL}/senior-secondary/results/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching senior secondary results:', error);
      return [];
    }
  }

  async getSeniorSecondarySessionResults(params?: FilterParams): Promise<SeniorSecondarySessionResultData[]> {
    try {
      const response = await api.get(`${this.baseURL}/senior-secondary/session-results/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching senior secondary session results:', error);
      return [];
    }
  }

  // NEW: Term report methods
  async getNurseryTermReports(params?: FilterParams): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseURL}/nursery/term-reports/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching nursery term reports:', error);
      return [];
    }
  }

  async getPrimaryTermReports(params?: FilterParams): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseURL}/primary/term-reports/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching primary term reports:', error);
      return [];
    }
  }

  async getJuniorSecondaryTermReports(params?: FilterParams): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseURL}/junior-secondary/term-reports/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching junior secondary term reports:', error);
      return [];
    }
  }

  async getSeniorSecondaryTermReports(params?: FilterParams): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseURL}/senior-secondary/term-reports/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching senior secondary term reports:', error);
      return [];
    }
  }


  async approveSubjectResult(resultId: string, educationLevel: string) {
  try {
    const normalizedLevel = educationLevel.toUpperCase().replace(/\s+/g, '_');
    
    const endpoints: Record<string, string> = {
      'NURSERY': `${this.baseURL}/nursery/results/${resultId}/approve/`,
      'PRIMARY': `${this.baseURL}/primary/results/${resultId}/approve/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary/results/${resultId}/approve/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary/results/${resultId}/approve/`,
    };
    
    const endpoint = endpoints[normalizedLevel];
    if (!endpoint) {
      throw new Error(`Unsupported education level for approve subject result: ${normalizedLevel}`);
    }
    
    return api.post(endpoint, {});
  } catch (error) {
    console.error('Error approving subject result:', error);
    throw error;
  }
}

/**
 * Publish an individual subject result (not a term report)
 */
async publishSubjectResult(resultId: string, educationLevel: string) {
  try {
    const normalizedLevel = educationLevel.toUpperCase().replace(/\s+/g, '_');
    
    const endpoints: Record<string, string> = {
      'NURSERY': `${this.baseURL}/nursery/results/${resultId}/publish/`,
      'PRIMARY': `${this.baseURL}/primary/results/${resultId}/publish/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary/results/${resultId}/publish/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary/results/${resultId}/publish/`,
    };
    
    const endpoint = endpoints[normalizedLevel];
    if (!endpoint) {
      throw new Error(`Unsupported education level for publish subject result: ${normalizedLevel}`);
    }
    
    return api.post(endpoint, {});
  } catch (error) {
    console.error('Error publishing subject result:', error);
    throw error;
  }
}

  async getSeniorSecondarySessionReports(params?: FilterParams): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseURL}/senior-secondary/session-reports/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching senior secondary session reports:', error);
      return [];
    }
  }

  async getStudentResults(params: FilterParams): Promise<StandardResult[]> {
    const { education_level, result_type = 'termly', student } = params;

    console.log('getStudentResults called with params:', params);

    // If no education level specified, return empty array
    if (!education_level) {
      console.warn('No education_level specified in getStudentResults, returning empty array');
      return [];
    }

    try {
      let results: StandardResult[] = [];
      
      switch (education_level.toUpperCase()) {
        case 'NURSERY':
          const nurseryResults = await this.getNurseryResults(params);
          results = this.transformNurseryResults(nurseryResults);
          break;
        
        case 'PRIMARY':
          const primaryResults = await this.getPrimaryResults(params);
          results = this.transformPrimaryResults(primaryResults);
          break;
        
        case 'JUNIOR_SECONDARY':
          const juniorResults = await this.getJuniorSecondaryResults(params);
          results = this.transformJuniorSecondaryResults(juniorResults);
          break;
        
        case 'SENIOR_SECONDARY':
          if (result_type === 'session') {
            const sessionResults = await this.getSeniorSecondarySessionResults(params);
            results = this.transformSeniorSessionResults(sessionResults);
          } else {
            const seniorResults = await this.getSeniorSecondaryResults(params);
            results = this.transformSeniorSecondaryResults(seniorResults);
          }
          break;
        
        default:
          console.warn(`Unsupported education level: ${education_level}`);
          return [];
      }

      console.log('Transformed results:', results);

      // Additional client-side filtering by student if needed
      if (student && results.length > 0) {
        const filtered = results.filter(result => {
          if (!result || !result.student) return false;
          
          const resultStudentId = typeof result.student === 'object' ? result.student.id : result.student;
          return resultStudentId?.toString() === student?.toString();
        });
        console.log('Client-side filtered results:', filtered);
        return filtered;
      }

      return results;
    } catch (error) {
      console.error('Error in getStudentResults:', error);
      return [];
    }
  }

  // Add this method to your ResultService class

/**
 * Get ALL term results across all education levels
 * This fetches from education-level-specific term report endpoints
 */
async getTermResults(params?: FilterParams) {
  try {
    console.log('Fetching term results with params:', params);
    
    // Fetch from all education-level-specific term report endpoints
    const [nurseryReports, primaryReports, juniorReports, seniorReports] = await Promise.all([
      api.get(`${this.baseURL}/nursery/term-reports/`, { params }).catch(() => ({ results: [] })),
      api.get(`${this.baseURL}/primary/term-reports/`, { params }).catch(() => ({ results: [] })),
      api.get(`${this.baseURL}/junior-secondary/term-reports/`, { params }).catch(() => ({ results: [] })),
      api.get(`${this.baseURL}/senior-secondary/term-reports/`, { params }).catch(() => ({ results: [] })),
    ]);

    // Extract arrays from responses
    const nursery = Array.isArray(nurseryReports) ? nurseryReports : (nurseryReports?.results || []);
    const primary = Array.isArray(primaryReports) ? primaryReports : (primaryReports?.results || []);
    const junior = Array.isArray(juniorReports) ? juniorReports : (juniorReports?.results || []);
    const senior = Array.isArray(seniorReports) ? seniorReports : (seniorReports?.results || []);


    console.log('🔍 API Response Analysis:');
    console.log('Nursery reports count:', nursery.length);
    console.log('Primary reports count:', primary.length);
    console.log('Junior reports count:', junior.length);
    console.log('Senior reports count:', senior.length);
    
    // Log sample raw data from API
    if (senior.length > 0) {
      console.log('📄 Sample Senior Report (RAW from API):', senior[0]);
      console.log('   Status from API:', senior[0].status);
    }
    if (primary.length > 0) {
      console.log('📄 Sample Primary Report (RAW from API):', primary[0]);
      console.log('   Status from API:', primary[0].status);
    }

    // Helper function to calculate overall grade from average score
    const calculateGrade = (averageScore: number) => {
      if (!averageScore || isNaN(averageScore)) return 'N/A';
      if (averageScore >= 70) return 'A';
      if (averageScore >= 60) return 'B';
      if (averageScore >= 50) return 'C';
      if (averageScore >= 45) return 'D';
      if (averageScore >= 39) return 'E';
      return 'F';
    };

    // Normalize all reports to a common structure matching the UI interface
    const allReports = [
      ...nursery.map((report: any) => ({
        id: report.id,
        student: report.student || {},
        academic_session: report.exam_session?.academic_session || {},
        term: report.exam_session?.term || 'N/A',
        total_subjects: report.total_subjects || 0,
        subjects_passed: 0, // Nursery doesn't track this separately
        subjects_failed: 0,
        total_score: report.total_marks_obtained || 0,
        average_score: report.overall_percentage || 0,
        gpa: 0, // Nursery doesn't use GPA
        class_position: report.class_position || null,
        total_students: report.total_students_in_class || 0,
        status: report.status || 'DRAFT',
        remarks: '',
        next_term_begins: report.next_term_begins || null,
        subject_results: report.subject_results || [],
        created_at: report.created_at,
        updated_at: report.updated_at,
        overall_grade: calculateGrade(report.overall_percentage),
        education_level: 'NURSERY',
      })),
      ...primary.map((report: any) => ({
        id: report.id,
        student: report.student || {},
        academic_session: report.exam_session?.academic_session || {},
        term: report.exam_session?.term || 'N/A',
        total_subjects: report.total_subjects || 0,
        subjects_passed: 0, // Calculated from subject_results if needed
        subjects_failed: 0,
        total_score: report.total_score || 0,
        average_score: report.average_score || 0,
        gpa: 0,
        class_position: report.class_position || null,
        total_students: report.total_students || 0,
        status: report.status || 'DRAFT',
        remarks: '',
        next_term_begins: report.next_term_begins || null,
        subject_results: report.subject_results || [],
        created_at: report.created_at,
        updated_at: report.updated_at,
        overall_grade: report.overall_grade || calculateGrade(report.average_score),
        education_level: 'PRIMARY',
      })),
      ...junior.map((report: any) => ({
        id: report.id,
        student: report.student || {},
        academic_session: report.exam_session?.academic_session || {},
        term: report.exam_session?.term || 'N/A',
        total_subjects: report.total_subjects || 0,
        subjects_passed: 0,
        subjects_failed: 0,
        total_score: report.total_score || 0,
        average_score: report.average_score || 0,
        gpa: 0,
        class_position: report.class_position || null,
        total_students: report.total_students || 0,
        status: report.status || 'DRAFT',
        remarks: '',
        next_term_begins: report.next_term_begins || null,
        subject_results: report.subject_results || [],
        created_at: report.created_at,
        updated_at: report.updated_at,
        overall_grade: report.overall_grade || calculateGrade(report.average_score),
        education_level: 'JUNIOR_SECONDARY',
      })),
      ...senior.map((report: any) => ({
        id: report.id,
        student: report.student || {},
        academic_session: report.exam_session?.academic_session || {},
        term: report.exam_session?.term || 'N/A',
        total_subjects: 0, // Calculate from subject_results
        subjects_passed: 0,
        subjects_failed: 0,
        total_score: report.total_score || 0,
        average_score: report.average_score || 0,
        gpa: 0,
        class_position: report.class_position || null,
        total_students: report.total_students || 0,
        status: report.status || 'DRAFT',
        remarks: '',
        next_term_begins: report.next_term_begins || null,
        subject_results: report.subject_results || [],
        created_at: report.created_at,
        updated_at: report.updated_at,
        overall_grade: report.overall_grade || calculateGrade(report.average_score),
        education_level: 'SENIOR_SECONDARY',
        stream: report.stream || null,
      })),
    ];

    console.log(`Fetched ${allReports.length} term reports across all education levels`);
    console.log('Sample report:', allReports[0]); // Debug log
    return allReports;
  } catch (error) {
    console.error('Error fetching term results:', error);
    return [];
  }
}

/**
 * Get term results for a specific education level
 */
async getTermResultsByEducationLevel(educationLevel: string, params?: FilterParams) {
  try {
    const endpoints: Record<string, string> = {
      'NURSERY': `${this.baseURL}/nursery/term-reports/`,
      'PRIMARY': `${this.baseURL}/primary/term-reports/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary/term-reports/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary/term-reports/`,
    };

    const endpoint = endpoints[educationLevel.toUpperCase()];
    if (!endpoint) {
      console.warn(`Unsupported education level: ${educationLevel}`);
      return [];
    }

    const response = await api.get(endpoint, { params });
    return Array.isArray(response) ? response : (response?.results || []);
  } catch (error) {
    console.error(`Error fetching ${educationLevel} term results:`, error);
    return [];
  }
}

/**
 * Trigger term report generation for a specific student
 * This should be called after all subject results for a term are published
 */
async generateTermReport(studentId: string, examSessionId: string) {
  try {
    const response = await api.post(`${this.baseURL}/student-term-results/generate_report/`, {
      student_id: studentId,
      exam_session_id: examSessionId,
    });
    return response;
  } catch (error) {
    console.error('Error generating term report:', error);
    throw error;
  }
}
// Add to ResultService
async debugTermReports() {
  console.log('=== Debugging Term Reports ===');
  
  const nursery = await this.getNurseryTermReports();
  console.log('Nursery Reports:', nursery.length);
  
  const primary = await this.getPrimaryTermReports();
  console.log('Primary Reports:', primary.length);
  
  const junior = await this.getJuniorSecondaryTermReports();
  console.log('Junior Secondary Reports:', junior.length);
  
  const senior = await this.getSeniorSecondaryTermReports();
  console.log('Senior Secondary Reports:', senior.length);
  
  console.log('=== End Debug ===');
}

  // Fixed method to get all results without education level requirement
  async getAllResults(): Promise<StandardResult[]> {
    try {
      const [nursery, primary, juniorSecondary, seniorSecondary] = await Promise.all([
        this.getNurseryResults(),
        this.getPrimaryResults(),
        this.getJuniorSecondaryResults(),
        this.getSeniorSecondaryResults()
      ]);

      return [
        ...this.transformNurseryResults(nursery),
        ...this.transformPrimaryResults(primary),
        ...this.transformJuniorSecondaryResults(juniorSecondary),
        ...this.transformSeniorSecondaryResults(seniorSecondary)
      ];
    } catch (error) {
      console.error('Error fetching all results:', error);
      return [];
    }
  }

  // FIXED: Convenience methods with proper filtering
  async getResultsByStudent(studentId: string | number, educationLevel?: string): Promise<StandardResult[]> {
    console.log('Getting results for student:', studentId, 'education level:', educationLevel);
    
    if (educationLevel) {
      // Use education level to filter properly
      const results = await this.getStudentResults({ 
        student: studentId.toString(), 
        education_level: educationLevel 
      });
      console.log('Results from specific education level:', results);
      return results;
    }
    
    // If no education level provided, get all results and filter by student
    const allResults = await this.getAllResults();
    const filteredResults = allResults.filter(result => {
      if (!result || !result.student) return false;
      
      const resultStudentId = typeof result.student === 'object' ? result.student.id : result.student;
      const matches = resultStudentId?.toString() === studentId?.toString();
      
      if (matches) {
        console.log('Found matching result:', result);
      }
      
      return matches;
    });
    
    console.log('Filtered results:', filteredResults);
    return filteredResults;
  }

  async getResultsByExamSession(examSessionId: string, educationLevel: string): Promise<StandardResult[]> {
    return this.getStudentResults({ 
      exam_session: examSessionId, 
      education_level: educationLevel 
    });
  }

  // Term results - UPDATED for backward compatibility
  // async getTermResults(params?: FilterParams) {
  //   try {
  //     const response = await api.get(`${this.baseURL}/student-term-results/`, { params });
  //     return Array.isArray(response) ? response : (response?.results || []);
  //   } catch (error) {
  //     console.error('Error fetching term results:', error);
  //     return [];
  //   }
  // }

  async getDetailedTermResult(termResultId: string): Promise<StudentTermResult> {
    return api.get(`${this.baseURL}/student-term-results/${termResultId}/detailed/`);
  }

  async getTermResultsByStudent(studentId: string): Promise<StudentTermResult[]> {
    try {
      const response = await api.get(`${this.baseURL}/student-term-results/by_student/?student_id=${studentId}`);
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching term results by student:', error);
      return [];
    }
  }

  // Delete term result
  // async deleteTermResult(termResultId: string): Promise<void> {
  //   try {
  //     // First check if the term result exists
  //     try {
  //       await api.get(`${this.baseURL}/student-term-results/${termResultId}/`);
  //     } catch (checkError: any) {
  //       if (checkError.response?.status === 404) {
  //         throw new Error(`Term result with ID ${termResultId} not found.`);
  //       }
  //       throw checkError;
  //     }
      
  //     await api.delete(`${this.baseURL}/student-term-results/${termResultId}/`);
  //   } catch (error) {
  //     console.error('Error deleting term result:', error);
  //     throw error;
  //   }
  // }

  // Exam sessions - UPDATED
  async getExamSessions(params?: FilterParams): Promise<ExamSessionInfo[]> {
    try {
      const response = await api.get(`${this.baseURL}/exam-sessions/`, { params });
        console.log("Here is the session", response)
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching exam sessions:', error);
      return [];
    }
    
  }


  // CRUD operations - UPDATED to use hierarchical endpoints
  async createStudentResult(data: any, educationLevel: string) {
    const endpoints = {
      'NURSERY': `${this.baseURL}/nursery/results/`,
      'PRIMARY': `${this.baseURL}/primary/results/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary/results/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary/results/`,
    };
    
    const endpoint = endpoints[educationLevel as keyof typeof endpoints];
    if (!endpoint) {
      throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    return api.post(endpoint, data);
  }

  async updateStudentResult(resultId: string, data: any, educationLevel: string) {
    const endpoints = {
      'NURSERY': `${this.baseURL}/nursery/results/${resultId}/`,
      'PRIMARY': `${this.baseURL}/primary/results/${resultId}/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary/results/${resultId}/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary/results/${resultId}/`,
    };
    
    const endpoint = endpoints[educationLevel as keyof typeof endpoints];
    if (!endpoint) {
      throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    return api.put(endpoint, data);
  }

  async deleteStudentResult(resultId: string, educationLevel: string) {
    const endpoints = {
      'NURSERY': `${this.baseURL}/nursery/results/${resultId}/`,
      'PRIMARY': `${this.baseURL}/primary/results/${resultId}/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary/results/${resultId}/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary/results/${resultId}/`,
    };
    
    const endpoint = endpoints[educationLevel as keyof typeof endpoints];
    if (!endpoint) {
      throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    // First check if the individual result exists
    try {
      await api.get(endpoint);
    } catch (checkError: any) {
      if (checkError.response?.status === 404) {
        throw new Error(`${educationLevel} result with ID ${resultId} not found. This might be a term report ID instead of an individual result ID.`);
      }
      throw checkError;
    }
    
    return api.delete(endpoint);
  }

  // NEW: Bulk operations
  async bulkCreateResults(data: any[], educationLevel: string) {
    const endpoints = {
      'NURSERY': `${this.baseURL}/nursery/results/bulk_create/`,
      'PRIMARY': `${this.baseURL}/primary/results/bulk_create/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary/results/bulk_create/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary/results/bulk_create/`,
    };
    
    const endpoint = endpoints[educationLevel as keyof typeof endpoints];
    if (!endpoint) {
      throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    return api.post(endpoint, { results: data });
  }

  
  // Add to ResultService
async testTermReports() {
  console.log('=== TESTING TERM REPORTS API ===');
  
  try {
    // Test each endpoint individually
    const seniorResults = await api.get(`${this.baseURL}/senior-secondary/term-reports/`);
    console.log('Senior Secondary Reports:', seniorResults);
    console.log('Count:', Array.isArray(seniorResults) ? seniorResults.length : seniorResults?.results?.length);
    
    const juniorResults = await api.get(`${this.baseURL}/junior-secondary/term-reports/`);
    console.log('Junior Secondary Reports:', juniorResults);
    
    const primaryResults = await api.get(`${this.baseURL}/primary/term-reports/`);
    console.log('Primary Reports:', primaryResults);
    
    const nurseryResults = await api.get(`${this.baseURL}/nursery/term-reports/`);
    console.log('Nursery Reports:', nurseryResults);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  console.log('=== END TEST ===');
}
  // NEW: Result approval and publishing
  // async approveResult(resultId: string, educationLevel: string) {
  //   // Use the student-term-results endpoint for term reports
  //   return api.post(`${this.baseURL}/student-term-results/${resultId}/approve/`, {});
  // }

  // async publishResult(resultId: string, educationLevel: string) {
  //   // Use the student-term-results endpoint for term reports
  //   return api.post(`${this.baseURL}/student-term-results/${resultId}/publish/`, {});
  // }

// Add these updated methods to your ResultService class

/**
 * Approve a term result (education-level aware)
 */
async approveResult(resultId: string, educationLevel: string) {
  try {
    const normalizedLevel = educationLevel.toUpperCase().replace(/\s+/g, '_');
    
    const endpoints: Record<string, string> = {
      'NURSERY': `${this.baseURL}/nursery/term-reports/${resultId}/approve/`,
      'PRIMARY': `${this.baseURL}/primary/term-reports/${resultId}/approve/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary/term-reports/${resultId}/approve/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary/term-reports/${resultId}/approve/`,
    };
    
    const endpoint = endpoints[normalizedLevel];
    if (!endpoint) {
      console.warn(`Unsupported education level for approve: ${normalizedLevel}`);
      // Fallback to base endpoint
      return api.post(`${this.baseURL}/student-term-results/${resultId}/approve/`, {});
    }
    
    return api.post(endpoint, {});
  } catch (error) {
    console.error('Error approving result:', error);
    throw error;
  }
}

/**
 * Publish a term result (education-level aware)
 */
async publishResult(resultId: string, educationLevel: string) {
  try {
    const normalizedLevel = educationLevel.toUpperCase().replace(/\s+/g, '_');
    
    const endpoints: Record<string, string> = {
      'NURSERY': `${this.baseURL}/nursery/term-reports/${resultId}/publish/`,
      'PRIMARY': `${this.baseURL}/primary/term-reports/${resultId}/publish/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary/term-reports/${resultId}/publish/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary/term-reports/${resultId}/publish/`,
    };
    
    const endpoint = endpoints[normalizedLevel];
    if (!endpoint) {
      console.warn(`Unsupported education level for publish: ${normalizedLevel}`);
      // Fallback to base endpoint
      return api.post(`${this.baseURL}/student-term-results/${resultId}/publish/`, {});
    }
    
    return api.post(endpoint, {});
  } catch (error) {
    console.error('Error publishing result:', error);
    throw error;
  }
}

/**
 * Delete a term result (education-level aware)
 */
async deleteTermResult(termResultId: string, educationLevel?: string): Promise<void> {
  try {
    if (!educationLevel) {
      // Try to delete from base endpoint first
      try {
        await api.delete(`${this.baseURL}/student-term-results/${termResultId}/`);
        return;
      } catch (baseError: any) {
        console.log('Base endpoint delete failed, trying education-level specific endpoints');
      }
    }
    
    const normalizedLevel = educationLevel?.toUpperCase().replace(/\s+/g, '_');
    
    const endpoints: Record<string, string> = {
      'NURSERY': `${this.baseURL}/nursery/term-reports/${termResultId}/`,
      'PRIMARY': `${this.baseURL}/primary/term-reports/${termResultId}/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary/term-reports/${termResultId}/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary/term-reports/${termResultId}/`,
    };
    
    if (normalizedLevel && endpoints[normalizedLevel]) {
      await api.delete(endpoints[normalizedLevel]);
    } else {
      // Try all endpoints
      for (const endpoint of Object.values(endpoints)) {
        try {
          await api.delete(endpoint);
          return;
        } catch (err) {
          // Continue to next endpoint
        }
      }
      throw new Error(`Term result with ID ${termResultId} not found in any education level.`);
    }
  } catch (error) {
    console.error('Error deleting term result:', error);
    throw error;
  }
}
  // NEW: Class statistics
  async getClassStatistics(educationLevel: string, params?: {
    exam_session?: string;
    student_class?: string;
    subject?: string;
  }) {
    const endpoints = {
      'NURSERY': `${this.baseURL}/nursery/results/class_statistics/`,
      'PRIMARY': `${this.baseURL}/primary/results/class_statistics/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary/results/class_statistics/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary/results/class_statistics/`,
    };
    
    const endpoint = endpoints[educationLevel as keyof typeof endpoints];
    if (!endpoint) {
      throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    return api.get(endpoint, { params });
  }

  async findResultIdByComposite(params: {
  student: string;
  subject: string;
  exam_session: string;
  education_level: string;
}): Promise<string | null> {
  try {
    const { education_level, ...filterParams } = params;
    const normalizedLevel = education_level.toUpperCase().replace(/\s+/g, '_');
    
    const endpoints: Record<string, string> = {
      'NURSERY': `${this.baseURL}/nursery/results/`,
      'PRIMARY': `${this.baseURL}/primary/results/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary/results/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary/results/`,
    };
    
    const endpoint = endpoints[normalizedLevel];
    if (!endpoint) {
      console.warn(`Unsupported education level: ${normalizedLevel}`);
      return null;
    }
    
    const response = await api.get(endpoint, { params: filterParams });
    const results = Array.isArray(response) ? response : (response?.results || []);
    
    if (results.length > 0) {
      return results[0].id?.toString() || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding result by composite:', error);
    return null;
  }
}

  // NEW: Grade distribution (Senior Secondary only)
  async getGradeDistribution(params?: {
    exam_session?: string;
    student_class?: string;
  }) {
    return api.get(`${this.baseURL}/senior-secondary/results/grade_distribution/`, { params });
  }

  // Additional utility methods
  async generateTranscript(studentId: string, options?: TranscriptOptions) {
    return api.post(`${this.baseURL}/transcripts/generate/`, {
      student_id: studentId,
      ...options
    });
  }

  async verifyResult(resultId: string, verificationCode: string) {
    return api.post(`${this.baseURL}/verify/`, {
      result_id: resultId,
      code: verificationCode
    });
  }

  async getAvailableStreams(classLevel?: string) {
    return api.get(`${this.baseURL}/academic/streams/`, { class_level: classLevel });
  }

  // NEW: Configuration methods - UPDATED endpoints
  async getGradingSystems() {
    return api.get(`${this.baseURL}/grading-systems/`);
  }

  async getAssessmentTypes() {
    return api.get(`${this.baseURL}/assessment-types/`);
  }

  async getScoringConfigurations() {
    return api.get(`${this.baseURL}/scoring-configurations/`);
  }

  async getResultSheets(params?: FilterParams) {
    return api.get(`${this.baseURL}/result-sheets/`, { params });
  }

  async getAssessmentScores(params?: FilterParams) {
    return api.get(`${this.baseURL}/assessment-scores/`, { params });
  }

  async getResultComments(params?: FilterParams) {
    return api.get(`${this.baseURL}/result-comments/`, { params });
  }
}

export default new ResultService();