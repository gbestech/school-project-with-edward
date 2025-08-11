import api from '@/services/api';

export interface Subject {
  id: number;
  name: string;
  short_name?: string;
  display_name: string;
  code: string;
  description?: string;
  category: string;
  category_display: string;
  category_display_with_icon: string;
  education_levels: string[];
  education_levels_display: string;
  nursery_levels?: string[];
  nursery_levels_display?: string;
  full_level_display: string;
  education_level_details: any;
  ss_subject_type?: string;
  ss_subject_type_display?: string;
  is_cross_cutting: boolean;
  grade_levels: string[];
  grade_levels_info: any;
  is_compulsory: boolean;
  is_core: boolean;
  prerequisites: string[];
  prerequisite_subjects: any[];
  dependent_subjects: any[];
  has_continuous_assessment: boolean;
  has_final_exam: boolean;
  pass_mark: number;
  has_practical: boolean;
  practical_hours: number;
  is_activity_based: boolean;
  total_weekly_hours: number;
  requires_lab: boolean;
  requires_special_equipment: boolean;
  equipment_notes?: string;
  requires_specialist_teacher: boolean;
  is_active: boolean;
  is_discontinued: boolean;
  introduced_year?: number;
  curriculum_version?: string;
  subject_order: number;
  learning_outcomes?: string;
  subject_summary: any;
  created_at: string;
  updated_at: string;
}

export interface CreateSubjectData {
  name: string;
  short_name?: string;
  code: string;
  description?: string;
  category: string;
  education_levels: string[];
  nursery_levels?: string[];
  ss_subject_type?: string;
  grade_level_ids?: number[];
  is_compulsory: boolean;
  is_core?: boolean;
  is_cross_cutting?: boolean;
  has_continuous_assessment?: boolean;
  has_final_exam?: boolean;
  pass_mark?: number;
  has_practical?: boolean;
  practical_hours?: number;
  is_activity_based?: boolean;
  requires_lab?: boolean;
  requires_special_equipment?: boolean;
  equipment_notes?: string;
  requires_specialist_teacher?: boolean;
  introduced_year?: number;
  curriculum_version?: string;
  subject_order?: number;
  learning_outcomes?: string;
}

export interface UpdateSubjectData extends Partial<CreateSubjectData> {
  is_active?: boolean;
  is_discontinued?: boolean;
}

export interface SubjectFilters {
  search?: string;
  category?: string;
  education_level?: string;
  nursery_level?: string;
  ss_subject_type?: string;
  is_compulsory?: boolean;
  is_cross_cutting?: boolean;
  is_activity_based?: boolean;
  is_active?: boolean;
  has_practical?: boolean;
  requires_specialist_teacher?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface SubjectStatistics {
  total_subjects: number;
  active_subjects: number;
  by_category: Record<string, number>;
  by_education_level: Record<string, number>;
  by_ss_subject_type: Record<string, number>;
  cross_cutting_subjects: number;
  activity_based_subjects: number;
  subjects_with_practical: number;
  subjects_requiring_specialist: number;
}

class SubjectService {
  // Get all subjects with optional filters
  async getSubjects(params?: SubjectFilters) {
    // Ensure we only get active, non-discontinued subjects by default
    // Add cache-busting parameter to avoid cached responses
    const queryParams = { 
      available_only: 'true', 
      _t: Date.now(), // Cache busting
      ...params 
    };
    const response = await api.get('/api/subjects/', { params: queryParams });
    return response;
  }

  // Get a single subject by ID
  async getSubject(id: number) {
    const response = await api.get(`/api/subjects/${id}/`);
    return response;
  }

  // Create a new subject
  async createSubject(data: CreateSubjectData) {
    const response = await api.post('/api/subjects/', data);
    return response.data;
  }

  // Update a subject
  async updateSubject(id: number, data: UpdateSubjectData) {
    const response = await api.patch(`/api/subjects/${id}/`, data);
    return response.data;
  }

  // Delete a subject
  async deleteSubject(id: number) {
    const response = await api.delete(`/api/subjects/${id}/`);
    return response.data;
  }

  // Get subject statistics
  async getSubjectStatistics() {
    const response = await api.get('/api/subjects/statistics/', {
      params: { _t: Date.now() } // Cache busting
    });
    return response;
  }

  // Get subjects by education level
  async getSubjectsByEducationLevel(educationLevel: string) {
    const response = await api.get(`/api/subjects/?education_level=${educationLevel}`);
    return response;
  }

  // Get subjects by category
  async getSubjectsByCategory(category: string) {
    const response = await api.get(`/api/subjects/?category=${category}`);
    return response;
  }

  // Get active subjects
  async getActiveSubjects() {
    const response = await api.get('/api/subjects/?is_active=true');
    return response;
  }

  // Get cross-cutting subjects (Senior Secondary)
  async getCrossCuttingSubjects() {
    const response = await api.get('/api/subjects/?is_cross_cutting=true');
    return response;
  }

  // Get activity-based subjects (Nursery)
  async getActivityBasedSubjects() {
    const response = await api.get('/api/subjects/?is_activity_based=true');
    return response;
  }

  // Get subjects with practical components
  async getSubjectsWithPractical() {
    const response = await api.get('/api/subjects/?has_practical=true');
    return response;
  }

  // Get subjects requiring specialist teachers
  async getSubjectsRequiringSpecialist() {
    const response = await api.get('/api/subjects/?requires_specialist_teacher=true');
    return response;
  }

  // Bulk operations (Admin only)
  async bulkCreateSubjects(subjects: CreateSubjectData[]) {
    const response = await api.post('/api/management/subjects/bulk_create/', { subjects });
    return response.data;
  }

  async bulkUpdateSubjects(subjects: { id: number; data: UpdateSubjectData }[]) {
    const response = await api.patch('/api/management/subjects/bulk_update/', { subjects });
    return response.data;
  }

  async bulkDeleteSubjects(subjectIds: number[]) {
    const response = await api.delete('/api/management/subjects/bulk_delete/', { 
      data: { subject_ids: subjectIds } 
    });
    return response.data;
  }

  async bulkActivateSubjects(subjectIds: number[], activate: boolean) {
    const response = await api.post('/api/management/subjects/bulk_activate/', {
      subject_ids: subjectIds,
      activate
    });
    return response.data;
  }

  // Export and import (Admin only)
  async exportSubjects(format: 'csv' | 'xlsx' = 'csv') {
    const response = await api.get(`/api/management/subjects/export/?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async importSubjects(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/management/subjects/import/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Utility methods
  async getSubjectCategories() {
    const response = await api.get('/api/subjects/categories/');
    return response;
  }

  async getEducationLevels() {
    const response = await api.get('/api/subjects/education_levels/');
    return response;
  }

  async getNurseryLevels() {
    const response = await api.get('/api/subjects/nursery_levels/');
    return response;
  }

  async getSSSubjectTypes() {
    const response = await api.get('/api/subjects/ss_subject_types/');
    return response;
  }

  // Health check
  async healthCheck() {
    const response = await api.get('/api/subjects/health/');
    return response;
  }
}

export const subjectService = new SubjectService();
export default subjectService; 