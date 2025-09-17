// import api from './api';

// // Interfaces for result data
// export interface StudentBasicInfo {
//   id: string;
//   name: string;
//   admission_number: string;
//   username?: string;
//   class: string;
//   education_level: string;
//   gender?: string;
//   age?: number;
//   house?: string;
// }

// export interface TermInfo {
//   id: string;
//   name: string;
//   start_date: string;
//   end_date: string;
//   academic_session: {
//     id: string;
//     name: string;
//     start_year: number;
//     end_year: number;
//   };
// }

// export interface SubjectResult {
//   subject: {
//     id: string;
//     name: string;
//     code: string;
//   };
//   test1_score?: number;
//   test2_score?: number;
//   test3_score?: number;
//   exam_score?: number;
//   total_score: number;
//   percentage: number;
//   grade: string;
//   position: number;
//   class_average: number;
//   highest_in_class: number;
//   lowest_in_class: number;
//   teacher_remark?: string;
// }

// export interface TermlyResult {
//   id: string;
//   student: StudentBasicInfo;
//   term: TermInfo;
//   subjects: SubjectResult[];
//   total_score: number;
//   average_score: number;
//   overall_grade: string;
//   class_position: number;
//   total_students: number;
//   attendance: {
//     times_opened: number;
//     times_present: number;
//   };
//   next_term_begins: string;
//   class_teacher_remark?: string;
//   head_teacher_remark?: string;
//   is_published: boolean;
//   created_at: string;
//   updated_at: string;
// }

// export interface SessionResult {
//   id: string;
//   student: StudentBasicInfo;
//   academic_session: {
//     id: string;
//     name: string;
//     start_year: number;
//     end_year: number;
//   };
//   term1_total: number;
//   term2_total: number;
//   term3_total: number;
//   average_for_year: number;
//   obtainable: number;
//   obtained: number;
//   overall_grade: string;
//   class_position: number;
//   total_students: number;
//   subjects: {
//     subject: {
//       id: string;
//       name: string;
//       code: string;
//     };
//     term1_score: number;
//     term2_score: number;
//     term3_score: number;
//     average_score: number;
//     class_average: number;
//     highest_in_class: number;
//     lowest_in_class: number;
//     position: number;
//     teacher_remark?: string;
//   }[];
//   is_published: boolean;
//   created_at: string;
//   updated_at: string;
// }

// export interface ResultSearchFilters {
//   student_id?: string;
//   class_id?: string;
//   term_id?: string;
//   academic_session_id?: string;
//   result_type?: 'termly' | 'session';
//   is_published?: boolean;
//   education_level?: 'SENIOR_SECONDARY' | 'JUNIOR_SECONDARY' | 'PRIMARY' | 'NURSERY';
// }

// class ResultCheckerService {
//   // Get termly results for admin (all students) - supports all education levels
//   async getTermlyResults(filters: ResultSearchFilters = {}): Promise<TermlyResult[]> {
//     const params = new URLSearchParams();
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value !== undefined) {
//         params.append(key, value.toString());
//       }
//     });
    
//     const response = await api.get(`/api/results/result-checker/termly_results/?${params.toString()}`);
//     return response;
//   }

//   // Get session results for admin (all students) - supports all education levels
//   async getSessionResults(filters: ResultSearchFilters = {}): Promise<SessionResult[]> {
//     const params = new URLSearchParams();
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value !== undefined) {
//         params.append(key, value.toString());
//       }
//     });
    
//     const response = await api.get(`/api/results/result-checker/session_results/?${params.toString()}`);
//     return response;
//   }

//   // Get termly results for teacher (assigned classes only) - supports all education levels
//   async getTeacherTermlyResults(filters: ResultSearchFilters = {}): Promise<TermlyResult[]> {
//     const params = new URLSearchParams();
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value !== undefined) {
//         params.append(key, value.toString());
//       }
//     });
    
//     const response = await api.get(`/api/results/result-checker/termly_results/?${params.toString()}`);
//     return response;
//   }

//   // Get session results for teacher (assigned classes only) - supports all education levels
//   async getTeacherSessionResults(filters: ResultSearchFilters = {}): Promise<SessionResult[]> {
//     const params = new URLSearchParams();
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value !== undefined) {
//         params.append(key, value.toString());
//       }
//     });
    
//     const response = await api.get(`/api/results/result-checker/session_results/?${params.toString()}`);
//     return response;
//   }

//   // Get student's own termly results - supports all education levels
//   async getStudentTermlyResults(filters: ResultSearchFilters = {}): Promise<TermlyResult[]> {
//     const params = new URLSearchParams();
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value !== undefined) {
//         params.append(key, value.toString());
//       }
//     });
    
//     const response = await api.get(`/api/results/result-checker/termly_results/?${params.toString()}`);
//     return response;
//   }

//   // Get student's own session results - supports all education levels
//   async getStudentSessionResults(filters: ResultSearchFilters = {}): Promise<SessionResult[]> {
//     const params = new URLSearchParams();
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value !== undefined) {
//         params.append(key, value.toString());
//       }
//     });
    
//     const response = await api.get(`/api/results/result-checker/session_results/?${params.toString()}`);
//     return response;
//   }

//   // Get parent's children results (published only) - supports all education levels
//   async getParentResults(filters: ResultSearchFilters = {}): Promise<{
//     termly_results: TermlyResult[];
//     session_results: SessionResult[];
//   }> {
//     const params = new URLSearchParams();
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value !== undefined) {
//         params.append(key, value.toString());
//       }
//     });
    
//     const response = await api.get(`/api/results/result-checker/parent_results/?${params.toString()}`);
//     return response;
//   }

//   // Get specific termly result by ID - supports all education levels
//   async getTermlyResultById(resultId: string, educationLevel: string): Promise<TermlyResult> {
//     let endpoint = '';
//     switch (educationLevel) {
//       case 'SENIOR_SECONDARY':
//         endpoint = `/api/results/senior-secondary-results/${resultId}/`;
//         break;
//       case 'JUNIOR_SECONDARY':
//         endpoint = `/api/results/junior-secondary-results/${resultId}/`;
//         break;
//       case 'PRIMARY':
//         endpoint = `/api/results/primary-results/${resultId}/`;
//         break;
//       case 'NURSERY':
//         endpoint = `/api/results/nursery-results/${resultId}/`;
//         break;
//       default:
//         endpoint = `/api/results/senior-secondary-results/${resultId}/`;
//     }
//     const response = await api.get(endpoint);
//     return response;
//   }

//   // Get specific session result by ID - supports all education levels
//   async getSessionResultById(resultId: string, educationLevel: string): Promise<SessionResult> {
//     let endpoint = '';
//     switch (educationLevel) {
//       case 'SENIOR_SECONDARY':
//         endpoint = `/api/results/senior-secondary-session-results/${resultId}/`;
//         break;
//       case 'JUNIOR_SECONDARY':
//         endpoint = `/api/results/junior-secondary-results/${resultId}/`;
//         break;
//       case 'PRIMARY':
//         endpoint = `/api/results/primary-results/${resultId}/`;
//         break;
//       case 'NURSERY':
//         endpoint = `/api/results/nursery-results/${resultId}/`;
//         break;
//       default:
//         endpoint = `/api/results/senior-secondary-session-results/${resultId}/`;
//     }
//     const response = await api.get(endpoint);
//     return response;
//   }

//   // Get available terms for filtering
//   async getAvailableTerms(): Promise<TermInfo[]> {
//     const response = await api.get(`/api/fee/terms/`);
//     return response;
//   }

//   // Get available academic sessions for filtering
//   async getAvailableSessions(): Promise<{
//     id: string;
//     name: string;
//     start_year: number;
//     end_year: number;
//   }[]> {
//     const response = await api.get(`/api/fee/academic-sessions/`);
//     return response;
//   }

//   // Get available classes for filtering (admin/teacher only)
//   async getAvailableClasses(): Promise<{
//     id: string;
//     name: string;
//     section: string;
//   }[]> {
//     const response = await api.get(`/api/classrooms/classes/`);
//     return response;
//   }

//   // Get students for filtering (admin/teacher only)
//   async getStudents(filters: { class_id?: string; search?: string; education_level?: string } = {}): Promise<StudentBasicInfo[]> {
//     const params = new URLSearchParams();
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value !== undefined) {
//         params.append(key, value.toString());
//       }
//     });
    
//     // Use the public search endpoint from ResultCheckerViewSet
//     const response = await api.get(`/api/results/result-checker/search_students/?${params.toString()}`);
//     return response.results || response;
//   }

//   // Get education level specific results
//   async getEducationLevelResults(educationLevel: string, filters: ResultSearchFilters = {}): Promise<TermlyResult[]> {
//     const params = new URLSearchParams();
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value !== undefined) {
//         params.append(key, value.toString());
//       }
//     });
    
//     let endpoint = '';
//     switch (educationLevel) {
//       case 'SENIOR_SECONDARY':
//         endpoint = `/api/results/senior-secondary-results/?${params.toString()}`;
//         break;
//       case 'JUNIOR_SECONDARY':
//         endpoint = `/api/results/junior-secondary-results/?${params.toString()}`;
//         break;
//       case 'PRIMARY':
//         endpoint = `/api/results/primary-results/?${params.toString()}`;
//         break;
//       case 'NURSERY':
//         endpoint = `/api/results/nursery-results/?${params.toString()}`;
//         break;
//       default:
//         endpoint = `/api/results/senior-secondary-results/?${params.toString()}`;
//     }
    
//     const response = await api.get(endpoint);
//     return response;
//   }

//   // Get class statistics for specific education level
//   async getClassStatistics(educationLevel: string, filters: { exam_session?: string; student_class?: string; subject?: string }): Promise<any> {
//     const params = new URLSearchParams();
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value !== undefined) {
//         params.append(key, value.toString());
//       }
//     });
    
//     let endpoint = '';
//     switch (educationLevel) {
//       case 'SENIOR_SECONDARY':
//         endpoint = `/api/results/senior-secondary-results/class_statistics/?${params.toString()}`;
//         break;
//       case 'JUNIOR_SECONDARY':
//         endpoint = `/api/results/junior-secondary-results/class_statistics/?${params.toString()}`;
//         break;
//       case 'PRIMARY':
//         endpoint = `/api/results/primary-results/class_statistics/?${params.toString()}`;
//         break;
//       case 'NURSERY':
//         endpoint = `/api/results/nursery-results/class_statistics/?${params.toString()}`;
//         break;
//       default:
//         endpoint = `/api/results/senior-secondary-results/class_statistics/?${params.toString()}`;
//     }
    
//     const response = await api.get(endpoint);
//     return response;
//   }
// }

// export default new ResultCheckerService();


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
export interface NurseryResult {
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

export interface PrimaryResult {
  id: string;
  student: StudentBasicInfo;
  term: TermInfo;
  subjects: (SubjectResult & {
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

export interface JuniorSecondaryResult extends PrimaryResult {} // Same structure as Primary

export interface SeniorSecondaryResult {
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

export interface SeniorSecondarySessionResult {
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
  }[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Generic type for all result types
export type TermlyResult = NurseryResult | PrimaryResult | JuniorSecondaryResult | SeniorSecondaryResult;
export type SessionResult = SeniorSecondarySessionResult;

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
  // Get all results using the main result-checker endpoint
  async getResults(filters: ResultSearchFilters = {}): Promise<{
    termly_results: TermlyResult[];
    session_results: SessionResult[];
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/api/results/result-checker/?${params.toString()}`);
    return response;
  }

  // Get termly results by education level
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
        endpoint = `/api/results/nursery-results/?${params.toString()}`;
        break;
      case 'PRIMARY':
        endpoint = `/api/results/primary-results/?${params.toString()}`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `/api/results/junior-secondary-results/?${params.toString()}`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `/api/results/senior-secondary-results/?${params.toString()}`;
        break;
      default:
        throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    const response = await api.get(endpoint);
    return response.results || response;
  }

  // Get session results (Senior Secondary only)
  async getSessionResults(filters: ResultSearchFilters = {}): Promise<SessionResult[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/api/results/senior-secondary-session-results/?${params.toString()}`);
    return response.results || response;
  }

  // Get student term results (generic endpoint)
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

  // Get student results (generic endpoint)
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

  // Get specific result by ID
  async getResultById(resultId: string, educationLevel: string, resultType: 'termly' | 'session' = 'termly'): Promise<TermlyResult | SessionResult> {
    let endpoint = '';
    
    if (resultType === 'session' && educationLevel.toUpperCase() === 'SENIOR_SECONDARY') {
      endpoint = `/api/results/senior-secondary-session-results/${resultId}/`;
    } else {
      switch (educationLevel.toUpperCase()) {
        case 'NURSERY':
          endpoint = `/api/results/nursery-results/${resultId}/`;
          break;
        case 'PRIMARY':
          endpoint = `/api/results/primary-results/${resultId}/`;
          break;
        case 'JUNIOR_SECONDARY':
          endpoint = `/api/results/junior-secondary-results/${resultId}/`;
          break;
        case 'SENIOR_SECONDARY':
          endpoint = `/api/results/senior-secondary-results/${resultId}/`;
          break;
        default:
          throw new Error(`Unsupported education level: ${educationLevel}`);
      }
    }
    
    const response = await api.get(endpoint);
    return response;
  }

  // Get class statistics
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
        endpoint = `/api/results/nursery-results/class_statistics/?${params.toString()}`;
        break;
      case 'PRIMARY':
        endpoint = `/api/results/primary-results/class_statistics/?${params.toString()}`;
        break;
      case 'JUNIOR_SECONDARY':
        endpoint = `/api/results/junior-secondary-results/class_statistics/?${params.toString()}`;
        break;
      case 'SENIOR_SECONDARY':
        endpoint = `/api/results/senior-secondary-results/class_statistics/?${params.toString()}`;
        break;
      default:
        throw new Error(`Unsupported education level: ${educationLevel}`);
    }
    
    const response = await api.get(endpoint);
    return response;
  }

  // Get exam sessions
  async getExamSessions(): Promise<any[]> {
    const response = await api.get('/api/results/exam-sessions/');
    return response.results || response;
  }

  // Get grading systems
  async getGradingSystems(): Promise<any[]> {
    const response = await api.get('/api/results/grading-systems/');
    return response.results || response;
  }

  // Get assessment types
  async getAssessmentTypes(): Promise<any[]> {
    const response = await api.get('/api/results/assessment-types/');
    return response.results || response;
  }

  // Get scoring configurations
  async getScoringConfigurations(): Promise<any[]> {
    const response = await api.get('/api/results/scoring-configurations/');
    return response.results || response;
  }

  // Get available terms for filtering
  async getAvailableTerms(): Promise<TermInfo[]> {
    const response = await api.get('/api/fee/terms/');
    return response.results || response;
  }

  // Get available academic sessions for filtering
  async getAvailableSessions(): Promise<{
    id: string;
    name: string;
    start_year: number;
    end_year: number;
  }[]> {
    const response = await api.get('/api/fee/academic-sessions/');
    return response.results || response;
  }

  // Get available classes for filtering
  async getAvailableClasses(): Promise<{
    id: string;
    name: string;
    section: string;
    education_level?: string;
  }[]> {
    const response = await api.get('/api/classrooms/classes/');
    return response.results || response;
  }

  // Search students
  async searchStudents(filters: { 
    class_id?: string; 
    search?: string; 
    education_level?: string;
    admission_number?: string;
  } = {}): Promise<StudentBasicInfo[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/api/results/result-checker/search_students/?${params.toString()}`);
    return response.results || response;
  }

  // Get result sheets
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

  // Get assessment scores
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

  // Get result comments
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
}

export default new ResultCheckerService();