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
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/results/student-results/${queryString ? `?${queryString}` : ''}`;
    return api.get(endpoint);
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
    const endpoint = `/results/term-results/${queryString ? `?${queryString}` : ''}`;
    return api.get(endpoint);
  }

  // Get detailed term result
  async getDetailedTermResult(termResultId: string): Promise<StudentTermResult> {
    return api.get(`/results/term-results/${termResultId}/detailed/`);
  }

  // Get term results by student
  async getTermResultsByStudent(studentId: string): Promise<StudentTermResult[]> {
    return api.get(`/results/term-results/by_student/?student_id=${studentId}`);
  }

  // Get term results by academic session
  async getTermResultsByAcademicSession(sessionId: string, term?: string): Promise<StudentTermResult[]> {
    const params = new URLSearchParams({ session_id: sessionId });
    if (term) {
      params.append('term', term);
    }
    return api.get(`/results/term-results/by_academic_session/?${params.toString()}`);
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
    grading_system: string;
    stream?: string;
    ca_score: number;
    exam_score: number;
    total_score?: number;
    percentage?: number;
    grade?: string;
    grade_point?: number;
    is_passed?: boolean;
    position?: number;
    remarks?: string;
    status?: string;
  }) {
    return api.post('/results/student-results/', data);
  }

  // Update a student result
  async updateStudentResult(resultId: string, data: Partial<{
    ca_score: number;
    exam_score: number;
    remarks: string;
    status: string;
  }>) {
    return api.put(`/results/student-results/${resultId}/`, data);
  }

  // Delete a student result
  async deleteStudentResult(resultId: string) {
    return api.delete(`/results/student-results/${resultId}/`);
  }

  // Approve a student result
  async approveStudentResult(resultId: string) {
    return api.post(`/results/student-results/${resultId}/approve/`);
  }

  // Publish a student result
  async publishStudentResult(resultId: string) {
    return api.post(`/results/student-results/${resultId}/publish/`);
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