// import api from './api';

// export interface GradingSystem {
//   id: string;
//   name: string;
//   grading_type: string;
//   description: string;
//   min_score: number;
//   max_score: number;
//   pass_mark: number;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
//   grades: Grade[];
// }

// export interface Grade {
//   id: string;
//   grading_system: string;
//   grade: string;
//   min_score: number;
//   max_score: number;
//   grade_point?: number;
//   description: string;
//   is_passing: boolean;
// }

// export interface AssessmentType {
//   id: string;
//   name: string;
//   code: string;
//   description: string;
//   education_level: 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY' | 'ALL';
//   education_level_display: string;
//   max_score: number;
//   weight_percentage: number;
//   is_active: boolean;
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
//   result_release_date: string;
//   is_published: boolean;
//   is_active: boolean;
// }

// export interface ScoringConfiguration {
//   id: string;
//   name: string;
//   education_level: 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY';
//   education_level_display: string;
//   result_type: 'TERMLY' | 'SESSION';
//   description: string;
//   first_test_max_score: number;
//   second_test_max_score: number;
//   third_test_max_score: number;
//   exam_max_score: number;
//   total_max_score: number;
//   ca_weight_percentage: number;
//   exam_weight_percentage: number;
//   total_ca_max_score: number;
//   continuous_assessment_max_score: number;
//   take_home_test_max_score: number;
//   appearance_max_score: number;
//   practical_max_score: number;
//   project_max_score: number;
//   note_copying_max_score: number;
//   is_active: boolean;
//   is_default: boolean;
//   created_at: string;
//   updated_at: string;
// }

// export interface ScoringConfigurationCreateUpdate {
//   name: string;
//   education_level: 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY';
//   result_type: 'TERMLY' | 'SESSION';
//   description: string;
//   first_test_max_score: number;
//   second_test_max_score: number;
//   third_test_max_score: number;
//   exam_max_score: number;
//   total_max_score: number;
//   ca_weight_percentage: number;
//   exam_weight_percentage: number;
//   continuous_assessment_max_score: number;
//   take_home_test_max_score: number;
//   appearance_max_score: number;
//   practical_max_score: number;
//   project_max_score: number;
//   note_copying_max_score: number;
//   is_active: boolean;
//   is_default: boolean;
// }

// export interface GradingSystemCreateUpdate {
//   name: string;
//   grading_type: string;
//   description: string;
//   min_score: number;
//   max_score: number;
//   pass_mark: number;
//   is_active: boolean;
// }

// export interface AssessmentTypeCreateUpdate {
//   name: string;
//   code: string;
//   description: string;
//   education_level: 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY' | 'ALL';
//   max_score: number;
//   weight_percentage: number;
//   is_active: boolean;
// }

// export interface GradeCreateUpdate {
//   grading_system: string;
//   grade: string;
//   min_score: number;
//   max_score: number;
//   grade_point?: number;
//   description: string;
//   is_passing: boolean;
// }

// export interface ExamSessionCreateUpdate {
//   name: string;
//   exam_type: string;
//   term: string;
//   academic_session: string;
//   start_date: string;
//   end_date: string;
//   result_release_date: string;
//   is_published: boolean;
//   is_active: boolean;
// }

// class ResultSettingsService {
//   // Grading Systems
//   async getGradingSystems(): Promise<GradingSystem[]> {
//     try {
//       const response = await api.get('results/grading-systems/');
//       return Array.isArray(response) ? response : [];
//     } catch (error) {
//       console.error('Error fetching grading systems:', error);
//       return [];
//     }
//   }

//   async createGradingSystem(data: GradingSystemCreateUpdate): Promise<GradingSystem> {
//     const response = await api.post('results/grading-systems/', data);
//     return response.data;
//   }

//   async updateGradingSystem(id: string, data: GradingSystemCreateUpdate): Promise<GradingSystem> {
//     const response = await api.put(`results/grading-systems/${id}/`, data);
//     return response.data;
//   }

//   async deleteGradingSystem(id: string): Promise<void> {
//     await api.delete(`results/grading-systems/${id}/`);
//   }

//   // Grades
//   async getGrades(gradingSystemId?: string): Promise<Grade[]> {
//     try {
//       const url = gradingSystemId 
//         ? `results/grades/?grading_system=${gradingSystemId}`
//         : 'results/grades/';
//       const response = await api.get(url);
//       return Array.isArray(response) ? response : [];
//     } catch (error) {
//       console.error('Error fetching grades:', error);
//       return [];
//     }
//   }

//   async createGrade(data: GradeCreateUpdate): Promise<Grade> {
//     const response = await api.post('results/grades/', data);
//     return response;
//   }

//   async updateGrade(id: string, data: GradeCreateUpdate): Promise<Grade> {
//     const response = await api.put(`results/grades/${id}/`, data);
//     return response;
//   }

//   async deleteGrade(id: string): Promise<void> {
//     await api.delete(`results/grades/${id}/`);
//   }

//   // Assessment Types
//   async getAssessmentTypes(): Promise<AssessmentType[]> {
//     try {
//       const response = await api.get('results/assessment-types/');
//       return Array.isArray(response) ? response : [];
//     } catch (error) {
//       console.error('Error fetching assessment types:', error);
//       return [];
//     }
//   }

//   async createAssessmentType(data: AssessmentTypeCreateUpdate): Promise<AssessmentType> {
//     const response = await api.post('results/assessment-types/', data);
//     return response;
//   }

//   async updateAssessmentType(id: string, data: AssessmentTypeCreateUpdate): Promise<AssessmentType> {
//     const response = await api.put(`results/assessment-types/${id}/`, data);
//     return response;
//   }

//   async deleteAssessmentType(id: string): Promise<void> {
//     await api.delete(`results/assessment-types/${id}/`);
//   }

//   // Exam Sessions
//   async getExamSessions(filters?: { is_active?: boolean; is_published?: boolean }): Promise<ExamSession[]> {
//     try {
//       let url = 'results/exam-sessions/';
//       if (filters) {
//         const params = new URLSearchParams();
//         if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
//         if (filters.is_published !== undefined) params.append('is_published', filters.is_published.toString());
//         if (params.toString()) url += `?${params.toString()}`;
//       }
//       const response = await api.get(url);
//       return Array.isArray(response) ? response : [];
//     } catch (error) {
//       console.error('Error fetching exam sessions:', error);
//       return [];
//     }
//   }

//   async createExamSession(data: ExamSessionCreateUpdate): Promise<ExamSession> {
//     const response = await api.post('results/exam-sessions/', data);
//     return response;
//   }

//   async updateExamSession(id: string, data: ExamSessionCreateUpdate): Promise<ExamSession> {
//     const response = await api.put(`results/exam-sessions/${id}/`, data);
//     return response;
//   }

//   async deleteExamSession(id: string): Promise<void> {
//     await api.delete(`results/exam-sessions/${id}/`);
//   }

//   // Scoring Configuration methods
//   async getScoringConfigurations(): Promise<ScoringConfiguration[]> {
//     const response = await api.get('/results/scoring-configurations/');
//     return response;
//   }

//   async getScoringConfiguration(id: string): Promise<ScoringConfiguration> {
//     const response = await api.get(`/results/scoring-configurations/${id}/`);
//     return response;
//   }

//   async createScoringConfiguration(data: ScoringConfigurationCreateUpdate): Promise<ScoringConfiguration> {
//     const response = await api.post('/results/scoring-configurations/', data);
//     return response;
//   }

//   async updateScoringConfiguration(id: string, data: ScoringConfigurationCreateUpdate): Promise<ScoringConfiguration> {
//     const response = await api.put(`/results/scoring-configurations/${id}/`, data);
//     return response;
//   }

//   async deleteScoringConfiguration(id: string): Promise<void> {
//     await api.delete(`/results/scoring-configurations/${id}/`);
//   }

//   async getScoringConfigurationsByEducationLevel(educationLevel: string): Promise<ScoringConfiguration[]> {
//     const response = await api.get(`/results/scoring-configurations/by_education_level/?education_level=${educationLevel}`);
//     return response;
//   }

//   async getDefaultScoringConfigurations(): Promise<Record<string, ScoringConfiguration>> {
//     const response = await api.get('/results/scoring-configurations/defaults/');
//     return response;
//   }

//   // Result Creation Methods
//   async createSeniorSecondaryResult(data: any): Promise<any> {
//     const response = await api.post('/results/senior-secondary-results/', data);
//     return response;
//   }

//   async createJuniorSecondaryResult(data: any): Promise<any> {
//     const response = await api.post('/results/junior-secondary-results/', data);
//     return response;
//   }

//   async createPrimaryResult(data: any): Promise<any> {
//     const response = await api.post('/results/primary-results/', data);
//     return response;
//   }

//   async createNurseryResult(data: any): Promise<any> {
//     const response = await api.post('/results/nursery-results/', data);
//     return response;
//   }

//   async updateSeniorSecondaryResult(id: string, data: any): Promise<any> {
//     const response = await api.put(`/results/senior-secondary-results/${id}/`, data);
//     return response;
//   }

//   async updateJuniorSecondaryResult(id: string, data: any): Promise<any> {
//     const response = await api.put(`/results/junior-secondary-results/${id}/`, data);
//     return response;
//   }

//   async updatePrimaryResult(id: string, data: any): Promise<any> {
//     const response = await api.put(`/results/primary-results/${id}/`, data);
//     return response;
//   }

//   async updateNurseryResult(id: string, data: any): Promise<any> {
//     const response = await api.put(`/results/nursery-results/${id}/`, data);
//     return response;
//   }

//   async deleteSeniorSecondaryResult(id: string): Promise<void> {
//     await api.delete(`/results/senior-secondary-results/${id}/`);
//   }

//   async deleteJuniorSecondaryResult(id: string): Promise<void> {
//     await api.delete(`/results/junior-secondary-results/${id}/`);
//   }

//   async deletePrimaryResult(id: string): Promise<void> {
//     await api.delete(`/results/primary-results/${id}/`);
//   }

//   async deleteNurseryResult(id: string): Promise<void> {
//     await api.delete(`/results/nursery-results/${id}/`);
//   }
// }

// export default new ResultSettingsService();



import api from './api';

export interface GradingSystem {
  id: string;
  name: string;
  grading_type: string;
  description: string;
  min_score: number;
  max_score: number;
  pass_mark: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  grades: Grade[];
}

export interface Grade {
  id: string;
  grading_system: string;
  grade: string;
  min_score: number;
  max_score: number;
  grade_point?: number;
  description: string;
  is_passing: boolean;
}

export interface AssessmentType {
  id: string;
  name: string;
  code: string;
  description: string;
  education_level: 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY' | 'ALL';
  education_level_display: string;
  max_score: number;
  weight_percentage: number;
  is_active: boolean;
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
  result_release_date: string;
  is_published: boolean;
  is_active: boolean;
}

export interface ScoringConfiguration {
  id: string;
  name: string;
  education_level: 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY';
  education_level_display: string;
  result_type: 'TERMLY' | 'SESSION';
  description: string;
  first_test_max_score: number;
  second_test_max_score: number;
  third_test_max_score: number;
  exam_max_score: number;
  total_max_score: number;
  ca_weight_percentage: number;
  exam_weight_percentage: number;
  total_ca_max_score: number;
  continuous_assessment_max_score: number;
  take_home_test_max_score: number;
  appearance_max_score: number;
  practical_max_score: number;
  project_max_score: number;
  note_copying_max_score: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Additional interfaces for missing models
export interface StudentResult {
  id: string;
  student: string;
  subject: string;
  exam_session: string;
  mark_obtained: number;
  max_marks_obtainable: number;
  grade?: string;
  position?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentTermResult {
  id: string;
  student: string;
  term: string;
  academic_session: string;
  total_marks: number;
  total_possible: number;
  average: number;
  position: number;
  class_size: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResultSheet {
  id: string;
  exam_session: string;
  class_level: string;
  subject: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssessmentScore {
  id: string;
  student: string;
  subject: string;
  assessment_type: string;
  score: number;
  max_score: number;
  exam_session: string;
  created_at: string;
  updated_at: string;
}

export interface ResultComment {
  id: string;
  student: string;
  exam_session: string;
  teacher_comment?: string;
  head_teacher_comment?: string;
  created_at: string;
  updated_at: string;
}

// Create/Update interfaces
export interface ScoringConfigurationCreateUpdate {
  name: string;
  education_level: 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY';
  result_type: 'TERMLY' | 'SESSION';
  description: string;
  first_test_max_score: number;
  second_test_max_score: number;
  third_test_max_score: number;
  exam_max_score: number;
  total_max_score: number;
  ca_weight_percentage: number;
  exam_weight_percentage: number;
  continuous_assessment_max_score: number;
  take_home_test_max_score: number;
  appearance_max_score: number;
  practical_max_score: number;
  project_max_score: number;
  note_copying_max_score: number;
  is_active: boolean;
  is_default: boolean;
}

export interface GradingSystemCreateUpdate {
  name: string;
  grading_type: string;
  description: string;
  min_score: number;
  max_score: number;
  pass_mark: number;
  is_active: boolean;
}

export interface AssessmentTypeCreateUpdate {
  name: string;
  code: string;
  description: string;
  education_level: 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY' | 'ALL';
  max_score: number;
  weight_percentage: number;
  is_active: boolean;
}

export interface GradeCreateUpdate {
  grading_system: string;
  grade: string;
  min_score: number;
  max_score: number;
  grade_point?: number;
  description: string;
  is_passing: boolean;
}

export interface ExamSessionCreateUpdate {
  name: string;
  exam_type: string;
  term: string;
  academic_session: string;
  start_date: string;
  end_date: string;
  result_release_date: string;
  is_published: boolean;
  is_active: boolean;
}

class ResultSettingsService {
  // Grading Systems
  async getGradingSystems(): Promise<GradingSystem[]> {
    try {
      const response = await api.get('results/grading-systems/');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching grading systems:', error);
      return [];
    }
  }

  async createGradingSystem(data: GradingSystemCreateUpdate): Promise<GradingSystem> {
    const response = await api.post('results/grading-systems/', data);
    return response.data;
  }

  async updateGradingSystem(id: string, data: GradingSystemCreateUpdate): Promise<GradingSystem> {
    const response = await api.put(`results/grading-systems/${id}/`, data);
    return response.data;
  }

  async deleteGradingSystem(id: string): Promise<void> {
    await api.delete(`results/grading-systems/${id}/`);
  }

  // Grades
  async getGrades(gradingSystemId?: string): Promise<Grade[]> {
    try {
      const url = gradingSystemId 
        ? `results/grades/?grading_system=${gradingSystemId}`
        : 'results/grades/';
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching grades:', error);
      return [];
    }
  }

  async createGrade(data: GradeCreateUpdate): Promise<Grade> {
    const response = await api.post('results/grades/', data);
    return response.data;
  }

  async updateGrade(id: string, data: GradeCreateUpdate): Promise<Grade> {
    const response = await api.put(`results/grades/${id}/`, data);
    return response.data;
  }

  async deleteGrade(id: string): Promise<void> {
    await api.delete(`results/grades/${id}/`);
  }

  // Assessment Types
  async getAssessmentTypes(): Promise<AssessmentType[]> {
    try {
      const response = await api.get('results/assessment-types/');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching assessment types:', error);
      return [];
    }
  }

  async createAssessmentType(data: AssessmentTypeCreateUpdate): Promise<AssessmentType> {
    const response = await api.post('results/assessment-types/', data);
    return response.data;
  }

  async updateAssessmentType(id: string, data: AssessmentTypeCreateUpdate): Promise<AssessmentType> {
    const response = await api.put(`results/assessment-types/${id}/`, data);
    return response.data;
  }

  async deleteAssessmentType(id: string): Promise<void> {
    await api.delete(`results/assessment-types/${id}/`);
  }

  // Exam Sessions
  async getExamSessions(filters?: { is_active?: boolean; is_published?: boolean }): Promise<ExamSession[]> {
    try {
      let url = 'results/exam-sessions/';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
        if (filters.is_published !== undefined) params.append('is_published', filters.is_published.toString());
        if (params.toString()) url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching exam sessions:', error);
      return [];
    }
  }

  async createExamSession(data: ExamSessionCreateUpdate): Promise<ExamSession> {
    const response = await api.post('results/exam-sessions/', data);
    return response.data;
  }

  async updateExamSession(id: string, data: ExamSessionCreateUpdate): Promise<ExamSession> {
    const response = await api.put(`results/exam-sessions/${id}/`, data);
    return response.data;
  }

  async deleteExamSession(id: string): Promise<void> {
    await api.delete(`results/exam-sessions/${id}/`);
  }

  // Scoring Configuration methods
  async getScoringConfigurations(): Promise<ScoringConfiguration[]> {
    try {
      const response = await api.get('results/scoring-configurations/');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching scoring configurations:', error);
      return [];
    }
  }

  async getScoringConfiguration(id: string): Promise<ScoringConfiguration> {
    const response = await api.get(`results/scoring-configurations/${id}/`);
    return response.data;
  }

  async createScoringConfiguration(data: ScoringConfigurationCreateUpdate): Promise<ScoringConfiguration> {
    const response = await api.post('results/scoring-configurations/', data);
    return response.data;
  }

  async updateScoringConfiguration(id: string, data: ScoringConfigurationCreateUpdate): Promise<ScoringConfiguration> {
    const response = await api.put(`results/scoring-configurations/${id}/`, data);
    return response.data;
  }

  async deleteScoringConfiguration(id: string): Promise<void> {
    await api.delete(`results/scoring-configurations/${id}/`);
  }

  async getScoringConfigurationsByEducationLevel(educationLevel: string): Promise<ScoringConfiguration[]> {
    try {
      const response = await api.get(`results/scoring-configurations/by_education_level/?education_level=${educationLevel}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching scoring configurations by education level:', error);
      return [];
    }
  }

  async getDefaultScoringConfigurations(): Promise<Record<string, ScoringConfiguration>> {
    try {
      const response = await api.get('results/scoring-configurations/defaults/');
      return response || {};
    } catch (error) {
      console.error('Error fetching default scoring configurations:', error);
      return {};
    }
  }

  // Student Results (Generic)
  async getStudentResults(filters?: any): Promise<StudentResult[]> {
    try {
      let url = 'results/student-results/';
      if (filters) {
        const params = new URLSearchParams(filters);
        if (params.toString()) url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching student results:', error);
      return [];
    }
  }

  async createStudentResult(data: any): Promise<StudentResult> {
    const response = await api.post('results/student-results/', data);
    return response.data;
  }

  async updateStudentResult(id: string, data: any): Promise<StudentResult> {
    const response = await api.put(`results/student-results/${id}/`, data);
    return response.data;
  }

  async deleteStudentResult(id: string): Promise<void> {
    await api.delete(`results/student-results/${id}/`);
  }

  // Student Term Results
  async getStudentTermResults(filters?: any): Promise<StudentTermResult[]> {
    try {
      let url = 'results/student-term-results/';
      if (filters) {
        const params = new URLSearchParams(filters);
        if (params.toString()) url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching student term results:', error);
      return [];
    }
  }

  async createStudentTermResult(data: any): Promise<StudentTermResult> {
    const response = await api.post('results/student-term-results/', data);
    return response.data;
  }

  async updateStudentTermResult(id: string, data: any): Promise<StudentTermResult> {
    const response = await api.put(`results/student-term-results/${id}/`, data);
    return response.data;
  }

  async deleteStudentTermResult(id: string): Promise<void> {
    await api.delete(`results/student-term-results/${id}/`);
  }

  // Result Sheets
  async getResultSheets(filters?: any): Promise<ResultSheet[]> {
    try {
      let url = 'results/result-sheets/';
      if (filters) {
        const params = new URLSearchParams(filters);
        if (params.toString()) url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching result sheets:', error);
      return [];
    }
  }

  async createResultSheet(data: any): Promise<ResultSheet> {
    const response = await api.post('results/result-sheets/', data);
    return response.data;
  }

  async updateResultSheet(id: string, data: any): Promise<ResultSheet> {
    const response = await api.put(`results/result-sheets/${id}/`, data);
    return response.data;
  }

  async deleteResultSheet(id: string): Promise<void> {
    await api.delete(`results/result-sheets/${id}/`);
  }

  // Assessment Scores
  async getAssessmentScores(filters?: any): Promise<AssessmentScore[]> {
    try {
      let url = 'results/assessment-scores/';
      if (filters) {
        const params = new URLSearchParams(filters);
        if (params.toString()) url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching assessment scores:', error);
      return [];
    }
  }

  async createAssessmentScore(data: any): Promise<AssessmentScore> {
    const response = await api.post('results/assessment-scores/', data);
    return response.data;
  }

  async updateAssessmentScore(id: string, data: any): Promise<AssessmentScore> {
    const response = await api.put(`results/assessment-scores/${id}/`, data);
    return response.data;
  }

  async deleteAssessmentScore(id: string): Promise<void> {
    await api.delete(`results/assessment-scores/${id}/`);
  }

  // Result Comments
  async getResultComments(filters?: any): Promise<ResultComment[]> {
    try {
      let url = 'results/result-comments/';
      if (filters) {
        const params = new URLSearchParams(filters);
        if (params.toString()) url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching result comments:', error);
      return [];
    }
  }

  async createResultComment(data: any): Promise<ResultComment> {
    const response = await api.post('results/result-comments/', data);
    return response.data;
  }

  async updateResultComment(id: string, data: any): Promise<ResultComment> {
    const response = await api.put(`results/result-comments/${id}/`, data);
    return response.data;
  }

  async deleteResultComment(id: string): Promise<void> {
    await api.delete(`results/result-comments/${id}/`);
  }

  // Education-Level Specific Result Creation Methods
  async createNurseryResult(data: any): Promise<any> {
    const response = await api.post('results/nursery-results/', data);
    return response.data;
  }

  async updateNurseryResult(id: string, data: any): Promise<any> {
    const response = await api.put(`results/nursery-results/${id}/`, data);
    return response.data;
  }

  async deleteNurseryResult(id: string): Promise<void> {
    await api.delete(`results/nursery-results/${id}/`);
  }

  async getNurseryResults(filters?: any): Promise<any[]> {
    try {
      let url = 'results/nursery-results/';
      if (filters) {
        const params = new URLSearchParams(filters);
        if (params.toString()) url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching nursery results:', error);
      return [];
    }
  }

  async createPrimaryResult(data: any): Promise<any> {
    const response = await api.post('results/primary-results/', data);
    return response.data;
  }

  async updatePrimaryResult(id: string, data: any): Promise<any> {
    const response = await api.put(`results/primary-results/${id}/`, data);
    return response.data;
  }

  async deletePrimaryResult(id: string): Promise<void> {
    await api.delete(`results/primary-results/${id}/`);
  }

  async getPrimaryResults(filters?: any): Promise<any[]> {
    try {
      let url = 'results/primary-results/';
      if (filters) {
        const params = new URLSearchParams(filters);
        if (params.toString()) url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching primary results:', error);
      return [];
    }
  }

  async createJuniorSecondaryResult(data: any): Promise<any> {
    const response = await api.post('results/junior-secondary-results/', data);
    return response.data;
  }

  async updateJuniorSecondaryResult(id: string, data: any): Promise<any> {
    const response = await api.put(`results/junior-secondary-results/${id}/`, data);
    return response.data;
  }

  async deleteJuniorSecondaryResult(id: string): Promise<void> {
    await api.delete(`results/junior-secondary-results/${id}/`);
  }

  async getJuniorSecondaryResults(filters?: any): Promise<any[]> {
    try {
      let url = 'results/junior-secondary-results/';
      if (filters) {
        const params = new URLSearchParams(filters);
        if (params.toString()) url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching junior secondary results:', error);
      return [];
    }
  }

  async createSeniorSecondaryResult(data: any): Promise<any> {
    const response = await api.post('results/senior-secondary-results/', data);
    return response.data;
  }

  async updateSeniorSecondaryResult(id: string, data: any): Promise<any> {
    const response = await api.put(`results/senior-secondary-results/${id}/`, data);
    return response.data;
  }

  async deleteSeniorSecondaryResult(id: string): Promise<void> {
    await api.delete(`results/senior-secondary-results/${id}/`);
  }

  async getSeniorSecondaryResults(filters?: any): Promise<any[]> {
    try {
      let url = 'results/senior-secondary-results/';
      if (filters) {
        const params = new URLSearchParams(filters);
        if (params.toString()) url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching senior secondary results:', error);
      return [];
    }
  }

  // Senior Secondary Session Results
  async createSeniorSecondarySessionResult(data: any): Promise<any> {
    const response = await api.post('results/senior-secondary-session-results/', data);
    return response.data;
  }

  async updateSeniorSecondarySessionResult(id: string, data: any): Promise<any> {
    const response = await api.put(`results/senior-secondary-session-results/${id}/`, data);
    return response.data;
  }

  async deleteSeniorSecondarySessionResult(id: string): Promise<void> {
    await api.delete(`results/senior-secondary-session-results/${id}/`);
  }

  async getSeniorSecondarySessionResults(filters?: any): Promise<any[]> {
    try {
      let url = 'results/senior-secondary-session-results/';
      if (filters) {
        const params = new URLSearchParams(filters);
        if (params.toString()) url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching senior secondary session results:', error);
      return [];
    }
  }

  // Result Checker
  async checkResult(data: any): Promise<any> {
    const response = await api.post('results/result-checker/', data);
    return response.data;
  }

  async getResultCheckerOptions(): Promise<any> {
    try {
      const response = await api.get('results/result-checker/');
      return response;
    } catch (error) {
      console.error('Error fetching result checker options:', error);
      return {};
    }
  }
}

export default new ResultSettingsService();