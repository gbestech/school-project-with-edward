import api from './api';

export interface SubjectResult {
  id: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  exam_session: {
    id: string;
    name: string;
    exam_type: string;
    term: string;
  };
  // Stream support for Senior Secondary
  stream?: {
    id: string;
    name: string;
    stream_type: string;
  } | null;
  stream_name?: string;
  stream_type?: string;
  ca_score: number;
  exam_score: number;
  total_score: number;
  percentage: number;
  grade: string;
  grade_point: number;
  is_passed: boolean;
  position: number | null;
  remarks: string;
  status: string;
  assessment_scores: AssessmentScore[];
  created_at: string;
}

export interface AssessmentScore {
  id: string;
  assessment_type: {
    id: string;
    name: string;
    code: string;
    weight_percentage: number;
  };
  score: number;
  max_score: number;
  percentage: number;
  remarks: string;
  date_assessed: string;
}

export interface StudentTermResult {
  id: string;
  student: {
    id: string;
    full_name: string;
    username: string;
    student_class: string;
    education_level: string;
    profile_picture?: string;
  };
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
  class_position: number | null;
  total_students: number;
  status: string;
  remarks: string;
  next_term_begins?: string;
  subject_results: SubjectResult[];
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

export interface ClassStatistics {
  total_students: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  passed_count: number;
  failed_count: number;
}

class ResultService {
  // Get all student results
  async getStudentResults(params?: {
    student?: string;
    subject?: string;
    exam_session?: string;
    status?: string;
    is_passed?: boolean;
    stream?: string;
    search?: string;
  }) {
    try {
      // Try to get results from individual endpoints
      if (import.meta.env.DEV) {
        console.log('ResultService.getStudentResults called with params:', params);
      }
      const [nurseryResults, primaryResults, jssResults, sssResults] = await Promise.allSettled([
        api.get('/results/nursery-results/'),
        api.get('/results/primary-results/'),
        api.get('/results/junior-secondary-results/'),
        api.get('/results/senior-secondary-results/')
      ]);
      
      let allResults: any[] = [];
      
      // Process nursery results
      if (nurseryResults.status === 'fulfilled') {
        const nurseryData = nurseryResults.value;
        const nurseryArray = Array.isArray(nurseryData) ? nurseryData : (nurseryData?.results || []);
        allResults = allResults.concat(nurseryArray.map((result: any) => ({
          ...result,
          education_level: 'NURSERY'
        })));
      }
      
      // Process primary results
      if (primaryResults.status === 'fulfilled') {
        const primaryData = primaryResults.value;
        const primaryArray = Array.isArray(primaryData) ? primaryData : (primaryData?.results || []);
        allResults = allResults.concat(primaryArray.map((result: any) => ({
          ...result,
          education_level: 'PRIMARY'
        })));
      }
      
      // Process JSS results
      if (jssResults.status === 'fulfilled') {
        const jssData = jssResults.value;
        const jssArray = Array.isArray(jssData) ? jssData : (jssData?.results || []);
        allResults = allResults.concat(jssArray.map((result: any) => ({
          ...result,
          education_level: 'JUNIOR_SECONDARY'
        })));
      }
      
      // Process SSS results
      if (sssResults.status === 'fulfilled') {
        const sssData = sssResults.value;
        const sssArray = Array.isArray(sssData) ? sssData : (sssData?.results || []);
        allResults = allResults.concat(sssArray.map((result: any) => ({
          ...result,
          education_level: 'SENIOR_SECONDARY'
        })));
      }
      
      // Apply filters if provided
      if (params) {
        const toIdSet = (value?: string | boolean): Set<string> | null => {
          if (value === undefined || value === null) return null;
          if (typeof value !== 'string') return new Set([String(value)]);
          const parts = value.split(',').map(v => v.trim()).filter(Boolean);
          return new Set(parts.length ? parts : [value]);
        };
        if (import.meta.env.DEV) {
          console.log('ResultService.getStudentResults before filter count:', allResults.length);
        }
        if (params.student) {
          const targets = toIdSet(params.student);
          if (targets) {
            allResults = allResults.filter(result => {
              const candidate = (result.student?.id ?? result.student ?? result.student_id);
              return candidate !== undefined && candidate !== null && targets.has(candidate.toString());
            });
          }
        }
        if (params.subject) {
          const targets = toIdSet(params.subject);
          if (import.meta.env.DEV) {
            console.log('Filtering by subject targets:', Array.from(targets || []));
          }
          if (targets) {
            allResults = allResults.filter(result => {
              const candidate = (result.subject?.id ?? result.subject ?? result.subject_id);
              return candidate !== undefined && candidate !== null && targets.has(candidate.toString());
            });
          }
        }
        if (params.exam_session) {
          const targets = toIdSet(params.exam_session);
          if (targets) {
            allResults = allResults.filter(result => {
              const candidate = (result.exam_session?.id ?? result.exam_session ?? result.exam_session_id);
              return candidate !== undefined && candidate !== null && targets.has(candidate.toString());
            });
          }
        }
        if (params.status) {
          allResults = allResults.filter(result => result.status === params.status);
        }
        if (params.is_passed !== undefined) {
          allResults = allResults.filter(result => result.is_passed === params.is_passed);
        }
        if (params.stream) {
          const targets = toIdSet(params.stream);
          if (targets) {
            allResults = allResults.filter(result => {
              const candidate = (result.stream?.id ?? result.stream ?? result.stream_id);
              return candidate !== undefined && candidate !== null && targets.has(candidate.toString());
            });
          }
        }
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          allResults = allResults.filter(result => 
            (result.student?.full_name ?? result.student_name ?? '').toLowerCase().includes(searchLower) ||
            (result.subject?.name ?? result.subject_name ?? '').toLowerCase().includes(searchLower)
          );
        }
        if (import.meta.env.DEV) {
          console.log('ResultService.getStudentResults after filter count:', allResults.length, 'sample:', allResults.slice(0,3));
        }
      }
      
      return allResults;
    } catch (error) {
      console.error('Error fetching student results:', error);
      return [];
    }
  }

  // Get results by student
  async getResultsByStudent(studentId: string) {
    return api.get(`/results/student-results/by_student/?student_id=${studentId}`);
  }

  // Get results by exam session
  async getResultsByExamSession(examSessionId: string) {
    return api.get(`/results/student-results/by_exam_session/?exam_session_id=${examSessionId}`);
  }

  // Get class statistics
  async getClassStatistics(examSessionId: string, className: string): Promise<ClassStatistics> {
    return api.get(`/results/student-results/class_statistics/?exam_session_id=${examSessionId}&class=${className}`);
  }

  // Get all term results
  async getTermResults(params?: {
    student?: string;
    academic_session?: string;
    term?: string;
    status?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/results/student-term-results/${queryString ? `?${queryString}` : ''}`;
    return api.get(endpoint);
  }

  // Get detailed term result
  async getDetailedTermResult(termResultId: string): Promise<StudentTermResult> {
    return api.get(`/results/student-term-results/${termResultId}/detailed/`);
  }

  // Get term results by student
  async getTermResultsByStudent(studentId: string): Promise<StudentTermResult[]> {
    return api.get(`/results/student-term-results/by_student/?student_id=${studentId}`);
  }

  // Get term results by academic session
  async getTermResultsByAcademicSession(sessionId: string, term?: string): Promise<StudentTermResult[]> {
    const params = new URLSearchParams({ session_id: sessionId });
    if (term) {
      params.append('term', term);
    }
    return api.get(`/results/student-term-results/by_academic_session/?${params.toString()}`);
  }

  // Get all exam sessions
  async getExamSessions(params?: {
    exam_type?: string;
    term?: string;
    academic_session?: string;
    is_published?: boolean;
    is_active?: boolean;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/results/exam-sessions/${queryString ? `?${queryString}` : ''}`;
    return api.get(endpoint);
  }

  // Create a new student result
  async createStudentResult(data: {
    student: string;
    subject: string;
    exam_session: string;
    grading_system?: number | string;
    stream?: string;
    // Primary/Junior fields
    ca_score?: number;
    exam_score?: number;
    total_score?: number;
    grade?: string;
    // Senior fields
    first_test_score?: number;
    second_test_score?: number;
    third_test_score?: number;
    teacher_remark?: string;
    remarks?: string;
    status?: string;
    education_level?: string;
    class_statistics?: any;
    physical_development?: any;
    percentage?: number;
    grade_point?: number;
    is_passed?: boolean;
    position?: number;
  }) {
    // Determine the correct endpoint based on education level
    let endpoint = '';
    
    if (data.education_level) {
      switch (data.education_level.toUpperCase()) {
        case 'NURSERY':
          endpoint = '/results/nursery-results/';
          break;
        case 'PRIMARY':
          endpoint = '/results/primary-results/';
          break;
        case 'JUNIOR_SECONDARY':
          endpoint = '/results/junior-secondary-results/';
          break;
        case 'SENIOR_SECONDARY':
          endpoint = '/results/senior-secondary-results/';
          break;
        default:
          // Fallback to the old endpoint if education level is not specified
          endpoint = '/results/student-results/';
      }
    } else {
      // Fallback to the old endpoint if education level is not specified
      endpoint = '/results/student-results/';
    }
    
    return api.post(endpoint, data);
  }

  // Update a student result
  async updateStudentResult(resultId: string, data: Partial<{
    student: string;
    subject: string;
    exam_session: string;
    grading_system?: number | string;
    // Primary/Junior fields
    ca_score?: number;
    exam_score?: number;
    total_score?: number;
    grade?: string;
    // Senior fields
    first_test_score?: number;
    second_test_score?: number;
    third_test_score?: number;
    teacher_remark?: string;
    remarks?: string;
    status?: string;
    education_level?: string;
    class_statistics?: any;
    physical_development?: any;
  }>) {
    // Determine the correct endpoint based on education level
    let endpoint = '';
    
    if (data.education_level) {
      switch (data.education_level.toUpperCase()) {
        case 'NURSERY':
          endpoint = `/results/nursery-results/${resultId}/`;
          break;
        case 'PRIMARY':
          endpoint = `/results/primary-results/${resultId}/`;
          break;
        case 'JUNIOR_SECONDARY':
          endpoint = `/results/junior-secondary-results/${resultId}/`;
          break;
        case 'SENIOR_SECONDARY':
          endpoint = `/results/senior-secondary-results/${resultId}/`;
          break;
        default:
          // Fallback to the old endpoint if education level is not specified
          endpoint = `/results/student-results/${resultId}/`;
      }
    } else {
      // Fallback to the old endpoint if education level is not specified
      endpoint = `/results/student-results/${resultId}/`;
    }
    
    return api.put(endpoint, data);
  }

  // Find an existing student result id by composite keys
  async findResultIdByComposite(params: {
    student: string | number;
    subject: string | number;
    exam_session: string | number;
    education_level: string;
  }): Promise<string | null> {
    const education = (params.education_level || '')
      .toString()
      .replace(/\s+/g, '_')
      .toUpperCase();

    let base = '';
    switch (education) {
      case 'NURSERY':
        base = '/results/nursery-results/';
        break;
      case 'PRIMARY':
        base = '/results/primary-results/';
        break;
      case 'JUNIOR_SECONDARY':
        base = '/results/junior-secondary-results/';
        break;
      case 'SENIOR_SECONDARY':
        base = '/results/senior-secondary-results/';
        break;
      default:
        base = '/results/student-results/';
    }

    const qs = new URLSearchParams({
      student: String(params.student),
      subject: String(params.subject),
      exam_session: String(params.exam_session),
    }).toString();

    const res = await api.get(`${base}?${qs}`);
    const array = Array.isArray(res) ? res : (res?.results || res?.data || []);
    if (Array.isArray(array) && array.length > 0) {
      const first = array[0];
      const id = first?.id ?? first?.pk;
      if (id != null && id !== '') {
        return String(id);
      }
    }
    return null;
  }

  // Delete a student result
  async deleteStudentResult(resultId: string, educationLevel?: string) {
    // Determine the correct endpoint based on education level
    let endpoint = '';
    
    if (educationLevel) {
      switch (educationLevel.toUpperCase()) {
        case 'NURSERY':
          endpoint = `/results/nursery-results/${resultId}/`;
          break;
        case 'PRIMARY':
          endpoint = `/results/primary-results/${resultId}/`;
          break;
        case 'JUNIOR_SECONDARY':
          endpoint = `/results/junior-secondary-results/${resultId}/`;
          break;
        case 'SENIOR_SECONDARY':
          endpoint = `/results/senior-secondary-results/${resultId}/`;
          break;
        default:
          // Fallback to the old endpoint if education level is not specified
          endpoint = `/results/student-results/${resultId}/`;
      }
    } else {
      // Fallback to the old endpoint if education level is not specified
      endpoint = `/results/student-results/${resultId}/`;
    }
    
    // DELETE requests often return 204 No Content, so we need to handle empty responses
    try {
      const response = await api.delete(endpoint);
      return response;
    } catch (error: any) {
      // If it's a JSON parse error but the status is 204, it's actually successful
      if (error.message?.includes('Unexpected end of JSON input') && error.response?.status === 204) {
        return { data: null, status: 204 };
      }
      throw error;
    }
  }

  // Approve a student result
  async approveStudentResult(resultId: string) {
    return api.post(`/results/student-results/${resultId}/approve/`, {});
  }

  // Publish a student result
  async publishStudentResult(resultId: string) {
    return api.post(`/results/student-results/${resultId}/publish/`, {});
  }

  // Get result summary statistics
  async getResultSummary() {
    return api.get('/results/student-results/summary/');
  }

  // Bulk create results
  async bulkCreateResults(results: any[]) {
    return api.post('/results/student-results/bulk_create/', { results });
  }

  // Create a new term result
  async createTermResult(data: {
    student: string;
    academic_session: string;
    term: string;
    remarks?: string;
    next_term_begins?: string;
  }) {
    return api.post('/results/term-results/', data);
  }

  // Update a term result
  async updateTermResult(termResultId: string, data: Partial<{
    remarks: string;
    status: string;
    next_term_begins: string;
  }>) {
    return api.put(`/results/term-results/${termResultId}/`, data);
  }

  // Add a comment to a result
  async addResultComment(data: {
    student_result?: string;
    term_result?: string;
    comment_type: string;
    comment: string;
  }) {
    return api.post('/results/result-comments/', data);
  }

  // Get grading systems
  async getGradingSystems(params?: {
    grading_type?: string;
    is_active?: boolean;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/results/grading-systems/${queryString ? `?${queryString}` : ''}`;
    return api.get(endpoint);
  }

  // Get assessment types
  async getAssessmentTypes(params?: {
    is_active?: boolean;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/results/assessment-types/${queryString ? `?${queryString}` : ''}`;
    return api.get(endpoint);
  }
}

export default new ResultService();