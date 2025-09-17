// import api from './api';

// // Base interfaces matching Django models
// export interface StudentInfo {
//   id: string;
//   full_name: string;
//   username?: string;
//   student_class: string;
//   education_level: string;
//   profile_picture?: string;
// }

// export interface SubjectInfo {
//   id: string;
//   name: string;
//   code: string;
// }

// export interface ExamSessionInfo {
//   id: string;
//   name: string;
//   exam_type: string;
//   term: string;
//   academic_session: {
//     id: string;
//     name: string;
//   };
//   start_date: string;
//   end_date: string;
//   is_published: boolean;
//   is_active: boolean;
// }

// export interface StreamInfo {
//   id: string;
//   name: string;
//   stream_type: string;
// }

// export interface GradingSystemInfo {
//   id: string;
//   name: string;
//   grading_type: string;
//   min_score: number;
//   max_score: number;
//   pass_mark: number;
// }

// // Education-level specific result interfaces
// export interface NurseryResult {
//   id: string;
//   student: StudentInfo;
//   subject: SubjectInfo;
//   exam_session: ExamSessionInfo;
//   grading_system: GradingSystemInfo;
//   max_marks_obtainable: number;
//   mark_obtained: number;
//   percentage: number;
//   grade: string;
//   grade_point?: number;
//   is_passed: boolean;
//   position?: number;
//   academic_comment?: string;
//   physical_development?: string;
//   health?: string;
//   cleanliness?: string;
//   general_conduct?: string;
//   physical_development_comment?: string;
//   status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface PrimaryResult {
//   id: string;
//   student: StudentInfo;
//   subject: SubjectInfo;
//   exam_session: ExamSessionInfo;
//   grading_system: GradingSystemInfo;
//   continuous_assessment_score: number;
//   take_home_test_score: number;
//   practical_score: number;
//   project_score: number;
//   appearance_score?: number;
//   note_copying_score: number;
//   exam_score: number;
//   ca_total: number;
//   total_score: number;
//   ca_percentage: number;
//   exam_percentage: number;
//   total_percentage: number;
//   grade: string;
//   grade_point?: number;
//   is_passed: boolean;
//   class_average: number;
//   highest_in_class: number;
//   lowest_in_class: number;
//   subject_position?: number;
//   previous_term_score: number;
//   cumulative_score: number;
//   teacher_remark?: string;
//   status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface JuniorSecondaryResult {
//   id: string;
//   student: StudentInfo;
//   subject: SubjectInfo;
//   exam_session: ExamSessionInfo;
//   grading_system: GradingSystemInfo;
//   continuous_assessment_score: number;
//   take_home_test_score: number;
//   practical_score: number;
//   appearance_score?: number;
//   project_score: number;
//   note_copying_score: number;
//   exam_score: number;
//   ca_total: number;
//   total_score: number;
//   ca_percentage: number;
//   exam_percentage: number;
//   total_percentage: number;
//   grade: string;
//   grade_point?: number;
//   is_passed: boolean;
//   class_average: number;
//   highest_in_class: number;
//   lowest_in_class: number;
//   subject_position?: number;
//   previous_term_score: number;
//   cumulative_score: number;
//   teacher_remark?: string;
//   status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface SeniorSecondaryResult {
//   id: string;
//   student: StudentInfo;
//   subject: SubjectInfo;
//   exam_session: ExamSessionInfo;
//   grading_system: GradingSystemInfo;
//   stream?: StreamInfo;
//   first_test_score: number;
//   second_test_score: number;
//   third_test_score: number;
//   exam_score: number;
//   total_ca_score: number;
//   total_score: number;
//   percentage: number;
//   grade: string;
//   grade_point?: number;
//   is_passed: boolean;
//   class_average: number;
//   highest_in_class: number;
//   lowest_in_class: number;
//   subject_position?: number;
//   teacher_remark?: string;
//   status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface SeniorSecondarySessionResult {
//   id: string;
//   student: StudentInfo;
//   subject: SubjectInfo;
//   academic_session: {
//     id: string;
//     name: string;
//   };
//   stream?: StreamInfo;
//   first_term_score: number;
//   second_term_score: number;
//   third_term_score: number;
//   average_for_year: number;
//   obtainable: number;
//   obtained: number;
//   class_average: number;
//   highest_in_class: number;
//   lowest_in_class: number;
//   subject_position?: number;
//   teacher_remark?: string;
//   status: string;
//   created_at: string;
//   updated_at: string;
// }

// // Unified result type for components
// export interface StandardResult {
//   id: string;
//   student: StudentInfo;
//   subject: SubjectInfo;
//   exam_session?: ExamSessionInfo;
//   academic_session?: { id: string; name: string };
//   education_level: string;
//   stream?: StreamInfo;
  
//   // Standardized score fields
//   total_score: number;
//   percentage: number;
//   grade: string;
//   grade_point?: number;
//   is_passed: boolean;
//   position?: number;
  
//   // Education-level specific breakdown
//   breakdown?: {
//     // Senior Secondary
//     first_test_score?: number;
//     second_test_score?: number;
//     third_test_score?: number;
//     exam_score?: number;
    
//     // Primary/Junior Secondary
//     continuous_assessment_score?: number;
//     take_home_test_score?: number;
//     practical_score?: number;
//     appearance_score?: number;
//     project_score?: number;
//     note_copying_score?: number;
//     ca_total?: number;
//     ca_percentage?: number;
//     exam_percentage?: number;
    
//     // Nursery
//     max_marks_obtainable?: number;
//     mark_obtained?: number;
//     physical_development?: string;
//     health?: string;
//     cleanliness?: string;
//     general_conduct?: string;
//   };
  
//   // Class statistics
//   class_average?: number;
//   highest_in_class?: number;
//   lowest_in_class?: number;
  
//   // Status and metadata
//   status: string;
//   remarks?: string;
//   created_at: string;
// }

// export interface StudentTermResult {
//   id: string;
//   student: StudentInfo;
//   academic_session: {
//     id: string;
//     name: string;
//     start_date: string;
//     end_date: string;
//   };
//   term: string;
//   total_subjects: number;
//   subjects_passed: number;
//   subjects_failed: number;
//   total_score: number;
//   average_score: number;
//   gpa: number;
//   class_position?: number;
//   total_students: number;
//   status: string;
//   remarks: string;
//   next_term_begins?: string;
//   subject_results: StandardResult[];
//   comments: ResultComment[];
//   created_at: string;
// }

// export interface ResultComment {
//   id: string;
//   comment_type: string;
//   comment: string;
//   commented_by: {
//     id: string;
//     username: string;
//     full_name: string;
//   };
//   created_at: string;
// }

// export interface ExamSession {
//   id: string;
//   name: string;
//   exam_type: string;
//   term: string;
//   academic_session: {
//     id: string;
//     name: string;
//   };
//   start_date: string;
//   end_date: string;
//   result_release_date?: string;
//   is_published: boolean;
//   is_active: boolean;
// }

// export interface FilterParams {
//   student?: string;
//   subject?: string;
//   exam_session?: string;
//   academic_session?: string;
//   term?: string;
//   status?: string;
//   is_passed?: boolean;
//   stream?: string;
//   search?: string;
//   education_level?: string;
//   result_type?: 'termly' | 'session';
// }

// export interface TranscriptOptions {
//   include_assessment_details?: boolean;
//   include_comments?: boolean;
//   include_subject_remarks?: boolean;
//   format?: 'PDF' | 'HTML' | 'DOCX';
// }

// class ResultService {
//   private baseURL = '/api/results';
//   private cache = new Map<string, {data: any; timestamp: number}>();
//   private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

//   async getCachedOrFetch(key: string, fetcher: () => Promise<any>) {
//     const cached = this.cache.get(key);
//     if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
//       return cached.data;
//     }
    
//     const data = await fetcher();
//     this.cache.set(key, { data, timestamp: Date.now() });
//     return data;
//   }

//   // Education level determination helper
//   private getEducationLevelFromClass(className: string): string {
//     const classLower = className.toLowerCase();
//     if (classLower.includes('nursery')) return 'NURSERY';
//     if (classLower.includes('primary')) return 'PRIMARY';
//     if (classLower.includes('jss') || classLower.includes('junior')) return 'JUNIOR_SECONDARY';
//     if (classLower.includes('sss') || classLower.includes('senior')) return 'SENIOR_SECONDARY';
//     return 'UNKNOWN';
//   }

//   // Data transformation methods
//   private transformNurseryResults(results: NurseryResult[]): StandardResult[] {
//     return results.map(result => ({
//       id: result.id,
//       student: result.student,
//       subject: result.subject,
//       exam_session: result.exam_session,
//       education_level: 'NURSERY',
//       total_score: result.mark_obtained,
//       percentage: result.percentage,
//       grade: result.grade,
//       grade_point: result.grade_point,
//       is_passed: result.is_passed,
//       position: result.position,
//       breakdown: {
//         max_marks_obtainable: result.max_marks_obtainable,
//         mark_obtained: result.mark_obtained,
//         physical_development: result.physical_development,
//         health: result.health,
//         cleanliness: result.cleanliness,
//         general_conduct: result.general_conduct,
//       },
//       status: result.status,
//       remarks: result.academic_comment,
//       created_at: result.created_at,
//     }));
//   }

//   private transformPrimaryResults(results: PrimaryResult[]): StandardResult[] {
//     return results.map(result => ({
//       id: result.id,
//       student: result.student,
//       subject: result.subject,
//       exam_session: result.exam_session,
//       education_level: 'PRIMARY',
//       total_score: result.total_score,
//       percentage: result.total_percentage,
//       grade: result.grade,
//       grade_point: result.grade_point,
//       is_passed: result.is_passed,
//       position: result.subject_position,
//       breakdown: {
//         continuous_assessment_score: result.continuous_assessment_score,
//         take_home_test_score: result.take_home_test_score,
//         practical_score: result.practical_score,
//         appearance_score: result.appearance_score,
//         project_score: result.project_score,
//         note_copying_score: result.note_copying_score,
//         exam_score: result.exam_score,
//         ca_total: result.ca_total,
//         ca_percentage: result.ca_percentage,
//         exam_percentage: result.exam_percentage,
//       },
//       class_average: result.class_average,
//       highest_in_class: result.highest_in_class,
//       lowest_in_class: result.lowest_in_class,
//       status: result.status,
//       remarks: result.teacher_remark,
//       created_at: result.created_at,
//     }));
//   }

//   private transformJuniorSecondaryResults(results: JuniorSecondaryResult[]): StandardResult[] {
//     return results.map(result => ({
//       id: result.id,
//       student: result.student,
//       subject: result.subject,
//       exam_session: result.exam_session,
//       education_level: 'JUNIOR_SECONDARY',
//       total_score: result.total_score,
//       percentage: result.total_percentage,
//       grade: result.grade,
//       grade_point: result.grade_point,
//       is_passed: result.is_passed,
//       position: result.subject_position,
//       breakdown: {
//         continuous_assessment_score: result.continuous_assessment_score,
//         take_home_test_score: result.take_home_test_score,
//         practical_score: result.practical_score,
//         appearance_score: result.appearance_score,
//         project_score: result.project_score,
//         note_copying_score: result.note_copying_score,
//         exam_score: result.exam_score,
//         ca_total: result.ca_total,
//         ca_percentage: result.ca_percentage,
//         exam_percentage: result.exam_percentage,
//       },
//       class_average: result.class_average,
//       highest_in_class: result.highest_in_class,
//       lowest_in_class: result.lowest_in_class,
//       status: result.status,
//       remarks: result.teacher_remark,
//       created_at: result.created_at,
//     }));
//   }

//   private transformSeniorSecondaryResults(results: SeniorSecondaryResult[]): StandardResult[] {
//     return results.map(result => ({
//       id: result.id,
//       student: result.student,
//       subject: result.subject,
//       exam_session: result.exam_session,
//       education_level: 'SENIOR_SECONDARY',
//       stream: result.stream,
//       total_score: result.total_score,
//       percentage: result.percentage,
//       grade: result.grade,
//       grade_point: result.grade_point,
//       is_passed: result.is_passed,
//       position: result.subject_position,
//       breakdown: {
//         first_test_score: result.first_test_score,
//         second_test_score: result.second_test_score,
//         third_test_score: result.third_test_score,
//         exam_score: result.exam_score,
//       },
//       class_average: result.class_average,
//       highest_in_class: result.highest_in_class,
//       lowest_in_class: result.lowest_in_class,
//       status: result.status,
//       remarks: result.teacher_remark,
//       created_at: result.created_at,
//     }));
//   }

//   private transformSeniorSessionResults(results: SeniorSecondarySessionResult[]): StandardResult[] {
//     return results.map(result => ({
//       id: result.id,
//       student: result.student,
//       subject: result.subject,
//       academic_session: result.academic_session,
//       education_level: 'SENIOR_SECONDARY',
//       stream: result.stream,
//       total_score: result.obtained,
//       percentage: result.average_for_year,
//       grade: 'N/A', // Session results might not have grades
//       is_passed: result.average_for_year >= 40, // Assuming 40% pass mark
//       position: result.subject_position,
//       class_average: result.class_average,
//       highest_in_class: result.highest_in_class,
//       lowest_in_class: result.lowest_in_class,
//       status: result.status,
//       remarks: result.teacher_remark,
//       created_at: result.created_at,
//     }));
//   }

//   // Core API methods - education level specific
//   async getNurseryResults(params?: FilterParams): Promise<NurseryResult[]> {
//     try {
//       const response = await api.get(`${this.baseURL}/nursery-results/`, { params });
//       return Array.isArray(response) ? response : (response?.results || []);
//     } catch (error) {
//       console.error('Error fetching nursery results:', error);
//       return [];
//     }
//   }

//   async getPrimaryResults(params?: FilterParams): Promise<PrimaryResult[]> {
//     try {
//       const response = await api.get(`${this.baseURL}/primary-results/`, { params });
//       return Array.isArray(response) ? response : (response?.results || []);
//     } catch (error) {
//       console.error('Error fetching primary results:', error);
//       return [];
//     }
//   }

//   async getJuniorSecondaryResults(params?: FilterParams): Promise<JuniorSecondaryResult[]> {
//     try {
//       const response = await api.get(`${this.baseURL}/junior-secondary-results/`, { params });
//       return Array.isArray(response) ? response : (response?.results || []);
//     } catch (error) {
//       console.error('Error fetching junior secondary results:', error);
//       return [];
//     }
//   }

//   async getSeniorSecondaryResults(params?: FilterParams): Promise<SeniorSecondaryResult[]> {
//     try {
//       const response = await api.get(`${this.baseURL}/senior-secondary-results/`, { params });
//       return Array.isArray(response) ? response : (response?.results || []);
//     } catch (error) {
//       console.error('Error fetching senior secondary results:', error);
//       return [];
//     }
//   }

//   async getSeniorSecondarySessionResults(params?: FilterParams): Promise<SeniorSecondarySessionResult[]> {
//     try {
//       const response = await api.get(`${this.baseURL}/senior-secondary-session-results/`, { params });
//       return Array.isArray(response) ? response : (response?.results || []);
//     } catch (error) {
//       console.error('Error fetching senior secondary session results:', error);
//       return [];
//     }
//   }

//   // Unified method that routes to appropriate endpoint
//   async getStudentResults(params: FilterParams): Promise<StandardResult[]> {
//     const { education_level, result_type = 'termly' } = params;

//     if (!education_level) {
//       throw new Error('education_level is required');
//     }

//     try {
//       switch (education_level.toUpperCase()) {
//         case 'NURSERY':
//           const nurseryResults = await this.getNurseryResults(params);
//           return this.transformNurseryResults(nurseryResults);
        
//         case 'PRIMARY':
//           const primaryResults = await this.getPrimaryResults(params);
//           return this.transformPrimaryResults(primaryResults);
        
//         case 'JUNIOR_SECONDARY':
//           const juniorResults = await this.getJuniorSecondaryResults(params);
//           return this.transformJuniorSecondaryResults(juniorResults);
        
//         case 'SENIOR_SECONDARY':
//           if (result_type === 'session') {
//             const sessionResults = await this.getSeniorSecondarySessionResults(params);
//             return this.transformSeniorSessionResults(sessionResults);
//           } else {
//             const seniorResults = await this.getSeniorSecondaryResults(params);
//             return this.transformSeniorSecondaryResults(seniorResults);
//           }
        
//         default:
//           throw new Error(`Unsupported education level: ${education_level}`);
//       }
//     } catch (error) {
//       console.error('Error in getStudentResults:', error);
//       throw error;
//     }
//   }

//   // Convenience methods
//   async getResultsByStudent(studentId: string, educationLevel: string): Promise<StandardResult[]> {
//     return this.getStudentResults({ 
//       student: studentId, 
//       education_level: educationLevel 
//     });
//   }

//   async getResultsByExamSession(examSessionId: string, educationLevel: string): Promise<StandardResult[]> {
//     return this.getStudentResults({ 
//       exam_session: examSessionId, 
//       education_level: educationLevel 
//     });
//   }

//   // Term results
//   async getTermResults(params?: FilterParams) {
//     try {
//       const response = await api.get(`${this.baseURL}/student-term-results/`, { params });
//       return Array.isArray(response) ? response : (response?.results || []);
//     } catch (error) {
//       console.error('Error fetching term results:', error);
//       return [];
//     }
//   }

//   async getDetailedTermResult(termResultId: string): Promise<StudentTermResult> {
//     return api.get(`${this.baseURL}/student-term-results/${termResultId}/detailed/`);
//   }

//   async getTermResultsByStudent(studentId: string): Promise<StudentTermResult[]> {
//     try {
//       const response = await api.get(`${this.baseURL}/student-term-results/by_student/?student_id=${studentId}`);
//       return Array.isArray(response) ? response : (response?.results || []);
//     } catch (error) {
//       console.error('Error fetching term results by student:', error);
//       return [];
//     }
//   }

//   // Exam sessions
//   async getExamSessions(params?: FilterParams): Promise<ExamSession[]> {
//     try {
//       const response = await api.get(`${this.baseURL}/exam-sessions/`, { params });
//       return Array.isArray(response) ? response : (response?.results || []);
//     } catch (error) {
//       console.error('Error fetching exam sessions:', error);
//       return [];
//     }
//   }

//   // CRUD operations
//   async createStudentResult(data: any, educationLevel: string) {
//     const endpoints = {
//       'NURSERY': `${this.baseURL}/nursery-results/`,
//       'PRIMARY': `${this.baseURL}/primary-results/`,
//       'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary-results/`,
//       'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary-results/`,
//     };
    
//     const endpoint = endpoints[educationLevel as keyof typeof endpoints];
//     if (!endpoint) {
//       throw new Error(`Unsupported education level: ${educationLevel}`);
//     }
    
//     return api.post(endpoint, data);
//   }

//   async updateStudentResult(resultId: string, data: any, educationLevel: string) {
//     const endpoints = {
//       'NURSERY': `${this.baseURL}/nursery-results/${resultId}/`,
//       'PRIMARY': `${this.baseURL}/primary-results/${resultId}/`,
//       'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary-results/${resultId}/`,
//       'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary-results/${resultId}/`,
//     };
    
//     const endpoint = endpoints[educationLevel as keyof typeof endpoints];
//     if (!endpoint) {
//       throw new Error(`Unsupported education level: ${educationLevel}`);
//     }
    
//     return api.put(endpoint, data);
//   }

//   async deleteStudentResult(resultId: string, educationLevel: string) {
//     const endpoints = {
//       'NURSERY': `${this.baseURL}/nursery-results/${resultId}/`,
//       'PRIMARY': `${this.baseURL}/primary-results/${resultId}/`,
//       'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary-results/${resultId}/`,
//       'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary-results/${resultId}/`,
//     };
    
//     const endpoint = endpoints[educationLevel as keyof typeof endpoints];
//     if (!endpoint) {
//       throw new Error(`Unsupported education level: ${educationLevel}`);
//     }
    
//     return api.delete(endpoint);
//   }

//   // Additional utility methods
//   async generateTranscript(studentId: string, options?: TranscriptOptions) {
//     return api.post(`${this.baseURL}/transcripts/generate/`, {
//       student_id: studentId,
//       ...options
//     });
//   }

//   async verifyResult(resultId: string, verificationCode: string) {
//     return api.post(`${this.baseURL}/verify/`, {
//       result_id: resultId,
//       code: verificationCode
//     });
//   }

//   async getAvailableStreams(classLevel?: string) {
//     return api.get('/api/academic/streams/', { class_level: classLevel });
//   }
// }

// export default new ResultService();

import api from './api';

// Base interfaces matching Django models
export interface StudentInfo {
  id: string;
  full_name: string;
  username?: string;
  student_class: string;
  education_level: string;
  profile_picture?: string;
}

export interface SubjectInfo {
  id: string;
  name: string;
  code: string;
}

export interface ExamSessionInfo {
  id: string;
  name: string;
  exam_type: string;
  term: string;
  academic_session: {
    id: string;
    name: string;
  };
  start_date: string;
  end_date: string;
  is_published: boolean;
  is_active: boolean;
}

export interface StreamInfo {
  id: string;
  name: string;
  stream_type: string;
}

export interface GradingSystemInfo {
  id: string;
  name: string;
  grading_type: string;
  min_score: number;
  max_score: number;
  pass_mark: number;
}

// Education-level specific result interfaces
export interface NurseryResult {
  id: string;
  student: StudentInfo;
  subject: SubjectInfo;
  exam_session: ExamSessionInfo;
  grading_system: GradingSystemInfo;
  max_marks_obtainable: number;
  mark_obtained: number;
  percentage: number;
  grade: string;
  grade_point?: number;
  is_passed: boolean;
  position?: number;
  academic_comment?: string;
  physical_development?: string;
  health?: string;
  cleanliness?: string;
  general_conduct?: string;
  physical_development_comment?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PrimaryResult {
  id: string;
  student: StudentInfo;
  subject: SubjectInfo;
  exam_session: ExamSessionInfo;
  grading_system: GradingSystemInfo;
  continuous_assessment_score: number;
  take_home_test_score: number;
  practical_score: number;
  project_score: number;
  appearance_score?: number;
  note_copying_score: number;
  exam_score: number;
  ca_total: number;
  total_score: number;
  ca_percentage: number;
  exam_percentage: number;
  total_percentage: number;
  grade: string;
  grade_point?: number;
  is_passed: boolean;
  class_average: number;
  highest_in_class: number;
  lowest_in_class: number;
  subject_position?: number;
  previous_term_score: number;
  cumulative_score: number;
  teacher_remark?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface JuniorSecondaryResult {
  id: string;
  student: StudentInfo;
  subject: SubjectInfo;
  exam_session: ExamSessionInfo;
  grading_system: GradingSystemInfo;
  continuous_assessment_score: number;
  take_home_test_score: number;
  practical_score: number;
  appearance_score?: number;
  project_score: number;
  note_copying_score: number;
  exam_score: number;
  ca_total: number;
  total_score: number;
  ca_percentage: number;
  exam_percentage: number;
  total_percentage: number;
  grade: string;
  grade_point?: number;
  is_passed: boolean;
  class_average: number;
  highest_in_class: number;
  lowest_in_class: number;
  subject_position?: number;
  previous_term_score: number;
  cumulative_score: number;
  teacher_remark?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SeniorSecondaryResult {
  id: string;
  student: StudentInfo;
  subject: SubjectInfo;
  exam_session: ExamSessionInfo;
  grading_system: GradingSystemInfo;
  stream?: StreamInfo;
  first_test_score: number;
  second_test_score: number;
  third_test_score: number;
  exam_score: number;
  total_ca_score: number;
  total_score: number;
  percentage: number;
  grade: string;
  grade_point?: number;
  is_passed: boolean;
  class_average: number;
  highest_in_class: number;
  lowest_in_class: number;
  subject_position?: number;
  teacher_remark?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SeniorSecondarySessionResult {
  id: string;
  student: StudentInfo;
  subject: SubjectInfo;
  academic_session: {
    id: string;
    name: string;
  };
  stream?: StreamInfo;
  first_term_score: number;
  second_term_score: number;
  third_term_score: number;
  average_for_year: number;
  obtainable: number;
  obtained: number;
  class_average: number;
  highest_in_class: number;
  lowest_in_class: number;
  subject_position?: number;
  teacher_remark?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Unified result type for components
export interface StandardResult {
  id: string;
  student: StudentInfo;
  subject: SubjectInfo;
  exam_session?: ExamSessionInfo;
  academic_session?: { id: string; name: string };
  education_level: string;
  stream?: StreamInfo;
  
  // Standardized score fields
  total_score: number;
  percentage: number;
  grade: string;
  grade_point?: number;
  is_passed: boolean;
  position?: number;
  
  // Education-level specific breakdown
  breakdown?: {
    // Senior Secondary
    first_test_score?: number;
    second_test_score?: number;
    third_test_score?: number;
    exam_score?: number;
    
    // Primary/Junior Secondary
    continuous_assessment_score?: number;
    take_home_test_score?: number;
    practical_score?: number;
    appearance_score?: number;
    project_score?: number;
    note_copying_score?: number;
    ca_total?: number;
    ca_percentage?: number;
    exam_percentage?: number;
    
    // Nursery
    max_marks_obtainable?: number;
    mark_obtained?: number;
    physical_development?: string;
    health?: string;
    cleanliness?: string;
    general_conduct?: string;
  };
  
  // Class statistics
  class_average?: number;
  highest_in_class?: number;
  lowest_in_class?: number;
  
  // Status and metadata
  status: string;
  remarks?: string;
  created_at: string;
}

export interface StudentTermResult {
  id: string;
  student: StudentInfo;
  academic_session: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  };
  term: string;
  total_subjects: number;
  subjects_passed: number;
  subjects_failed: number;
  total_score: number;
  average_score: number;
  gpa: number;
  class_position?: number;
  total_students: number;
  status: string;
  remarks: string;
  next_term_begins?: string;
  subject_results: StandardResult[];
  comments: ResultComment[];
  created_at: string;
}

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
  academic_session: {
    id: string;
    name: string;
  };
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
  academic_session?: string;
  term?: string;
  status?: string;
  is_passed?: boolean;
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
  private baseURL = '/api/results';
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

  // Education level determination helper
  private getEducationLevelFromClass(className: string): string {
    const classLower = className.toLowerCase();
    if (classLower.includes('nursery')) return 'NURSERY';
    if (classLower.includes('primary')) return 'PRIMARY';
    if (classLower.includes('jss') || classLower.includes('junior')) return 'JUNIOR_SECONDARY';
    if (classLower.includes('sss') || classLower.includes('senior')) return 'SENIOR_SECONDARY';
    return 'UNKNOWN';
  }

  // Data transformation methods
  private transformNurseryResults(results: NurseryResult[]): StandardResult[] {
    return results.map(result => ({
      id: result.id,
      student: result.student,
      subject: result.subject,
      exam_session: result.exam_session,
      education_level: 'NURSERY',
      total_score: result.mark_obtained,
      percentage: result.percentage,
      grade: result.grade,
      grade_point: result.grade_point,
      is_passed: result.is_passed,
      position: result.position,
      breakdown: {
        max_marks_obtainable: result.max_marks_obtainable,
        mark_obtained: result.mark_obtained,
        physical_development: result.physical_development,
        health: result.health,
        cleanliness: result.cleanliness,
        general_conduct: result.general_conduct,
      },
      status: result.status,
      remarks: result.academic_comment,
      created_at: result.created_at,
    }));
  }

  private transformPrimaryResults(results: PrimaryResult[]): StandardResult[] {
    return results.map(result => ({
      id: result.id,
      student: result.student,
      subject: result.subject,
      exam_session: result.exam_session,
      education_level: 'PRIMARY',
      total_score: result.total_score,
      percentage: result.total_percentage,
      grade: result.grade,
      grade_point: result.grade_point,
      is_passed: result.is_passed,
      position: result.subject_position,
      breakdown: {
        continuous_assessment_score: result.continuous_assessment_score,
        take_home_test_score: result.take_home_test_score,
        practical_score: result.practical_score,
        appearance_score: result.appearance_score,
        project_score: result.project_score,
        note_copying_score: result.note_copying_score,
        exam_score: result.exam_score,
        ca_total: result.ca_total,
        ca_percentage: result.ca_percentage,
        exam_percentage: result.exam_percentage,
      },
      class_average: result.class_average,
      highest_in_class: result.highest_in_class,
      lowest_in_class: result.lowest_in_class,
      status: result.status,
      remarks: result.teacher_remark,
      created_at: result.created_at,
    }));
  }

  private transformJuniorSecondaryResults(results: JuniorSecondaryResult[]): StandardResult[] {
    return results.map(result => ({
      id: result.id,
      student: result.student,
      subject: result.subject,
      exam_session: result.exam_session,
      education_level: 'JUNIOR_SECONDARY',
      total_score: result.total_score,
      percentage: result.total_percentage,
      grade: result.grade,
      grade_point: result.grade_point,
      is_passed: result.is_passed,
      position: result.subject_position,
      breakdown: {
        continuous_assessment_score: result.continuous_assessment_score,
        take_home_test_score: result.take_home_test_score,
        practical_score: result.practical_score,
        appearance_score: result.appearance_score,
        project_score: result.project_score,
        note_copying_score: result.note_copying_score,
        exam_score: result.exam_score,
        ca_total: result.ca_total,
        ca_percentage: result.ca_percentage,
        exam_percentage: result.exam_percentage,
      },
      class_average: result.class_average,
      highest_in_class: result.highest_in_class,
      lowest_in_class: result.lowest_in_class,
      status: result.status,
      remarks: result.teacher_remark,
      created_at: result.created_at,
    }));
  }

  private transformSeniorSecondaryResults(results: SeniorSecondaryResult[]): StandardResult[] {
    return results.map(result => ({
      id: result.id,
      student: result.student,
      subject: result.subject,
      exam_session: result.exam_session,
      education_level: 'SENIOR_SECONDARY',
      stream: result.stream,
      total_score: result.total_score,
      percentage: result.percentage,
      grade: result.grade,
      grade_point: result.grade_point,
      is_passed: result.is_passed,
      position: result.subject_position,
      breakdown: {
        first_test_score: result.first_test_score,
        second_test_score: result.second_test_score,
        third_test_score: result.third_test_score,
        exam_score: result.exam_score,
      },
      class_average: result.class_average,
      highest_in_class: result.highest_in_class,
      lowest_in_class: result.lowest_in_class,
      status: result.status,
      remarks: result.teacher_remark,
      created_at: result.created_at,
    }));
  }

  private transformSeniorSessionResults(results: SeniorSecondarySessionResult[]): StandardResult[] {
    return results.map(result => ({
      id: result.id,
      student: result.student,
      subject: result.subject,
      academic_session: result.academic_session,
      education_level: 'SENIOR_SECONDARY',
      stream: result.stream,
      total_score: result.obtained,
      percentage: result.average_for_year,
      grade: 'N/A', // Session results might not have grades
      is_passed: result.average_for_year >= 40, // Assuming 40% pass mark
      position: result.subject_position,
      class_average: result.class_average,
      highest_in_class: result.highest_in_class,
      lowest_in_class: result.lowest_in_class,
      status: result.status,
      remarks: result.teacher_remark,
      created_at: result.created_at,
    }));
  }

  // Core API methods - education level specific
  async getNurseryResults(params?: FilterParams): Promise<NurseryResult[]> {
    try {
      const response = await api.get(`${this.baseURL}/nursery-results/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching nursery results:', error);
      return [];
    }
  }

  async getPrimaryResults(params?: FilterParams): Promise<PrimaryResult[]> {
    try {
      const response = await api.get(`${this.baseURL}/primary-results/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching primary results:', error);
      return [];
    }
  }

  async getJuniorSecondaryResults(params?: FilterParams): Promise<JuniorSecondaryResult[]> {
    try {
      const response = await api.get(`${this.baseURL}/junior-secondary-results/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching junior secondary results:', error);
      return [];
    }
  }

  async getSeniorSecondaryResults(params?: FilterParams): Promise<SeniorSecondaryResult[]> {
    try {
      const response = await api.get(`${this.baseURL}/senior-secondary-results/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching senior secondary results:', error);
      return [];
    }
  }

  async getSeniorSecondarySessionResults(params?: FilterParams): Promise<SeniorSecondarySessionResult[]> {
    try {
      const response = await api.get(`${this.baseURL}/senior-secondary-session-results/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching senior secondary session results:', error);
      return [];
    }
  }

  // Fixed unified method with proper parameter validation
  async getStudentResults(params: FilterParams = {}): Promise<StandardResult[]> {
    const { education_level, result_type = 'termly' } = params;

    // If no education level specified, return empty array instead of throwing error
    if (!education_level) {
      console.warn('No education_level specified in getStudentResults, returning empty array');
      return [];
    }

    try {
      switch (education_level.toUpperCase()) {
        case 'NURSERY':
          const nurseryResults = await this.getNurseryResults(params);
          return this.transformNurseryResults(nurseryResults);
        
        case 'PRIMARY':
          const primaryResults = await this.getPrimaryResults(params);
          return this.transformPrimaryResults(primaryResults);
        
        case 'JUNIOR_SECONDARY':
          const juniorResults = await this.getJuniorSecondaryResults(params);
          return this.transformJuniorSecondaryResults(juniorResults);
        
        case 'SENIOR_SECONDARY':
          if (result_type === 'session') {
            const sessionResults = await this.getSeniorSecondarySessionResults(params);
            return this.transformSeniorSessionResults(sessionResults);
          } else {
            const seniorResults = await this.getSeniorSecondaryResults(params);
            return this.transformSeniorSecondaryResults(seniorResults);
          }
        
        default:
          console.warn(`Unsupported education level: ${education_level}`);
          return [];
      }
    } catch (error) {
      console.error('Error in getStudentResults:', error);
      return [];
    }
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

  // Convenience methods
  async getResultsByStudent(studentId: string, educationLevel?: string): Promise<StandardResult[]> {
    if (educationLevel) {
      return this.getStudentResults({ 
        student: studentId, 
        education_level: educationLevel 
      });
    }
    
    // If no education level provided, get all results and filter by student
    const allResults = await this.getAllResults();
    return allResults.filter(result => {
      const resultStudentId = typeof result.student === 'object' ? result.student.id : result.student;
      return resultStudentId === studentId;
    });
  }

  async getResultsByExamSession(examSessionId: string, educationLevel: string): Promise<StandardResult[]> {
    return this.getStudentResults({ 
      exam_session: examSessionId, 
      education_level: educationLevel 
    });
  }

  // Term results
  async getTermResults(params?: FilterParams) {
    try {
      const response = await api.get(`${this.baseURL}/student-term-results/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching term results:', error);
      return [];
    }
  }

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

  // Exam sessions
  async getExamSessions(params?: FilterParams): Promise<ExamSession[]> {
    try {
      const response = await api.get(`${this.baseURL}/exam-sessions/`, { params });
      return Array.isArray(response) ? response : (response?.results || []);
    } catch (error) {
      console.error('Error fetching exam sessions:', error);
      return [];
    }
  }

  // CRUD operations
  async createStudentResult(data: any, educationLevel: string) {
    const endpoints = {
      'NURSERY': `${this.baseURL}/nursery-results/`,
      'PRIMARY': `${this.baseURL}/primary-results/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary-results/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary-results/`,
    };
    
    const endpoint = endpoints[educationLevel as keyof typeof endpoints];
    if (!endpoint) {
      throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    return api.post(endpoint, data);
  }

  async updateStudentResult(resultId: string, data: any, educationLevel: string) {
    const endpoints = {
      'NURSERY': `${this.baseURL}/nursery-results/${resultId}/`,
      'PRIMARY': `${this.baseURL}/primary-results/${resultId}/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary-results/${resultId}/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary-results/${resultId}/`,
    };
    
    const endpoint = endpoints[educationLevel as keyof typeof endpoints];
    if (!endpoint) {
      throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    return api.put(endpoint, data);
  }

  async deleteStudentResult(resultId: string, educationLevel: string) {
    const endpoints = {
      'NURSERY': `${this.baseURL}/nursery-results/${resultId}/`,
      'PRIMARY': `${this.baseURL}/primary-results/${resultId}/`,
      'JUNIOR_SECONDARY': `${this.baseURL}/junior-secondary-results/${resultId}/`,
      'SENIOR_SECONDARY': `${this.baseURL}/senior-secondary-results/${resultId}/`,
    };
    
    const endpoint = endpoints[educationLevel as keyof typeof endpoints];
    if (!endpoint) {
      throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    return api.delete(endpoint);
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
    return api.get('/api/academic/streams/', { class_level: classLevel });
  }
}

export default new ResultService();