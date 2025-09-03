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
  start_date: string;
  end_date: string;
  academic_session: {
    id: string;
    name: string;
    start_year: number;
    end_year: number;
  };
}

export interface SubjectResult {
  subject: {
    id: string;
    name: string;
    code: string;
  };
  test1_score?: number;
  test2_score?: number;
  test3_score?: number;
  exam_score?: number;
  total_score: number;
  percentage: number;
  grade: string;
  position: number;
  class_average: number;
  highest_in_class: number;
  lowest_in_class: number;
  teacher_remark?: string;
}

export interface TermlyResult {
  id: string;
  student: StudentBasicInfo;
  term: TermInfo;
  subjects: SubjectResult[];
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

export interface SessionResult {
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
  }[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResultSearchFilters {
  student_id?: string;
  class_id?: string;
  term_id?: string;
  academic_session_id?: string;
  result_type?: 'termly' | 'session';
  is_published?: boolean;
  education_level?: 'SENIOR_SECONDARY' | 'JUNIOR_SECONDARY' | 'PRIMARY' | 'NURSERY';
}

class ResultCheckerService {
  // Get termly results for admin (all students) - supports all education levels
  async getTermlyResults(filters: ResultSearchFilters = {}): Promise<TermlyResult[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`results/result-checker/termly_results/?${params.toString()}`);
    return response;
  }

  // Get session results for admin (all students) - supports all education levels
  async getSessionResults(filters: ResultSearchFilters = {}): Promise<SessionResult[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`results/result-checker/session_results/?${params.toString()}`);
    return response;
  }

  // Get termly results for teacher (assigned classes only) - supports all education levels
  async getTeacherTermlyResults(filters: ResultSearchFilters = {}): Promise<TermlyResult[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`results/result-checker/termly_results/?${params.toString()}`);
    return response;
  }

  // Get session results for teacher (assigned classes only) - supports all education levels
  async getTeacherSessionResults(filters: ResultSearchFilters = {}): Promise<SessionResult[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`results/result-checker/session_results/?${params.toString()}`);
    return response;
  }

  // Get student's own termly results - supports all education levels
  async getStudentTermlyResults(filters: ResultSearchFilters = {}): Promise<TermlyResult[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`results/result-checker/termly_results/?${params.toString()}`);
    return response;
  }

  // Get student's own session results - supports all education levels
  async getStudentSessionResults(filters: ResultSearchFilters = {}): Promise<SessionResult[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`results/result-checker/session_results/?${params.toString()}`);
    return response;
  }

  // Get parent's children results (published only) - supports all education levels
  async getParentResults(filters: ResultSearchFilters = {}): Promise<{
    termly_results: TermlyResult[];
    session_results: SessionResult[];
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`results/result-checker/parent_results/?${params.toString()}`);
    return response;
  }

  // Get specific termly result by ID - supports all education levels
  async getTermlyResultById(resultId: string, educationLevel: string): Promise<TermlyResult> {
    let endpoint = '';
    switch (educationLevel) {
      case 'SENIOR_SECONDARY':
        endpoint = `results/senior-secondary-results/${resultId}/`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `results/junior-secondary-results/${resultId}/`;
        break;
      case 'PRIMARY':
        endpoint = `results/primary-results/${resultId}/`;
        break;
      case 'NURSERY':
        endpoint = `results/nursery-results/${resultId}/`;
        break;
      default:
        endpoint = `results/senior-secondary-results/${resultId}/`;
    }
    const response = await api.get(endpoint);
    return response;
  }

  // Get specific session result by ID - supports all education levels
  async getSessionResultById(resultId: string, educationLevel: string): Promise<SessionResult> {
    let endpoint = '';
    switch (educationLevel) {
      case 'SENIOR_SECONDARY':
        endpoint = `results/senior-secondary-session-results/${resultId}/`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `results/junior-secondary-results/${resultId}/`;
        break;
      case 'PRIMARY':
        endpoint = `results/primary-results/${resultId}/`;
        break;
      case 'NURSERY':
        endpoint = `results/nursery-results/${resultId}/`;
        break;
      default:
        endpoint = `results/senior-secondary-session-results/${resultId}/`;
    }
    const response = await api.get(endpoint);
    return response;
  }

  // Get available terms for filtering
  async getAvailableTerms(): Promise<TermInfo[]> {
    const response = await api.get('fee/terms/');
    return response;
  }

  // Get available academic sessions for filtering
  async getAvailableSessions(): Promise<{
    id: string;
    name: string;
    start_year: number;
    end_year: number;
  }[]> {
    const response = await api.get('fee/academic-sessions/');
    return response;
  }

  // Get available classes for filtering (admin/teacher only)
  async getAvailableClasses(): Promise<{
    id: string;
    name: string;
    section: string;
  }[]> {
    const response = await api.get('classroom/classes/');
    return response;
  }

  // Get students for filtering (admin/teacher only)
  async getStudents(filters: { class_id?: string; search?: string; education_level?: string } = {}): Promise<StudentBasicInfo[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    // Use the public search endpoint from ResultCheckerViewSet
    const response = await api.get(`results/result-checker/search_students/?${params.toString()}`);
    return response.results || response;
  }

  // Get education level specific results
  async getEducationLevelResults(educationLevel: string, filters: ResultSearchFilters = {}): Promise<TermlyResult[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    let endpoint = '';
    switch (educationLevel) {
      case 'SENIOR_SECONDARY':
        endpoint = `results/senior-secondary-results/?${params.toString()}`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `results/junior-secondary-results/?${params.toString()}`;
        break;
      case 'PRIMARY':
        endpoint = `results/primary-results/?${params.toString()}`;
        break;
      case 'NURSERY':
        endpoint = `results/nursery-results/?${params.toString()}`;
        break;
      default:
        endpoint = `results/senior-secondary-results/?${params.toString()}`;
    }
    
    const response = await api.get(endpoint);
    return response;
  }

  // Get class statistics for specific education level
  async getClassStatistics(educationLevel: string, filters: { exam_session?: string; student_class?: string; subject?: string }): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    let endpoint = '';
    switch (educationLevel) {
      case 'SENIOR_SECONDARY':
        endpoint = `results/senior-secondary-results/class_statistics/?${params.toString()}`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `results/junior-secondary-results/class_statistics/?${params.toString()}`;
        break;
      case 'PRIMARY':
        endpoint = `results/primary-results/class_statistics/?${params.toString()}`;
        break;
      case 'NURSERY':
        endpoint = `results/nursery-results/class_statistics/?${params.toString()}`;
        break;
      default:
        endpoint = `results/senior-secondary-results/class_statistics/?${params.toString()}`;
    }
    
    const response = await api.get(endpoint);
    return response;
  }
}

export default new ResultCheckerService();
