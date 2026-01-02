// types/results.ts

// ===== EDUCATION LEVELS =====
export type EducationLevel = 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY';

export type ResultStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED';

export type Term = 'FIRST' | 'SECOND' | 'THIRD';

// ===== BASE INTERFACES =====
export interface BaseUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}
export type RemarkPerformance =
  | 'excellent'
  | 'good'
  | 'average'
  | 'needs_improvement';


  export type RemarkEducationKey =
  | 'nursery'
  | 'primary'
  | 'junior_secondary'
  | 'senior_secondary';

  export interface RemarkPerformanceTemplates {
  excellent: string[];
  good: string[];
  average: string[];
  needs_improvement: string[];
}

export type RemarkTemplatesByEducation = {
  [level in RemarkEducationKey]: RemarkPerformanceTemplates;
};


export interface MinimalStudent {
  id: string;
  admission_number: string;
  full_name: string;
  student_class: string;
  student_class_display: string;
  education_level: EducationLevel;
  education_level_display: string;
}

export interface MinimalSubject {
  id: number;
  name: string;
  code: string;
}

export interface AcademicSession {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface ExamSession {
  id: string;
  name: string;
  exam_type: string;
  exam_type_display: string;
  term: Term;
  term_display: string;
  academic_session: AcademicSession;
  academic_session_name: string;
  start_date: string;
  end_date: string;
  result_release_date: string | null;
  is_published: boolean;
  is_active: boolean;
}

// ===== TERM REPORTS =====
export interface BaseTermReport {
  id: string;
  student: MinimalStudent;
  exam_session: ExamSession;
  total_score: number;
  average_score: number;
  overall_grade: string;
  class_position: number | null;
  total_students: number;
  times_opened: number;
  times_present: number;
  next_term_begins: string | null;
  class_teacher_remark: string;
  head_teacher_remark: string;
  class_teacher_signature: string | null;
  class_teacher_signed_at: string | null;
  head_teacher_signature: string | null;
  head_teacher_signed_at: string | null;
  status: ResultStatus;
  status_display: string;
  is_published: boolean;
  published_by: BaseUser | null;
  published_date: string | null;
  created_at: string;
  updated_at: string;
  can_edit_teacher_remark: boolean;
  can_edit_head_teacher_remark: boolean;
  first_signatory_role: string;
}

export interface SeniorSecondaryTermReport extends BaseTermReport {
  stream_name: string | null;
}

export interface JuniorSecondaryTermReport extends BaseTermReport {}

export interface PrimaryTermReport extends BaseTermReport {}

export interface NurseryTermReport extends BaseTermReport {
  total_subjects: number;
  total_max_marks: number;
  total_marks_obtained: number;
  overall_percentage: number;
  total_students_in_class: number;
  times_school_opened: number;
  times_student_present: number;
  physical_development: string;
  physical_development_display: string;
  health: string;
  health_display: string;
  cleanliness: string;
  cleanliness_display: string;
  general_conduct: string;
  general_conduct_display: string;
  physical_development_comment: string;
  height_beginning: number | null;
  height_end: number | null;
  weight_beginning: number | null;
  weight_end: number | null;
}

// ===== PROFESSIONAL ASSIGNMENT TYPES =====
export interface AssignedStudent {
  id: string;
  full_name: string;
  admission_number: string;
  student_class: string;
  education_level: EducationLevel;
  average_score: number | null;
  term_report_id: string | null;
  has_remark: boolean;
  remark_status: 'completed' | 'pending' | 'draft';
  last_remark: string;
  has_signature: boolean;
  classroom: string | null;
}

export interface AssignedStudentsSummary {
  total_students: number;
  completed_remarks: number;
  pending_remarks: number;
  completion_percentage: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T;
}

export interface AssignedStudentsResponse {
  exam_session: ExamSession;
  students: AssignedStudent[];
  summary: AssignedStudentsSummary;
  is_classroom_teacher: boolean;
  count?: number;
  next?: string | null;
  previous?: string | null;
}

// ===== REMARK UPDATE INTERFACES =====
export interface UpdateTeacherRemarkRequest {
  term_report_id: string;
  education_level: EducationLevel;
  class_teacher_remark: string;
}

export interface UpdateTeacherRemarkResponse {
  message: string;
  term_report_id: string;
  class_teacher_remark: string;
  status: ResultStatus;
}

export interface UpdateHeadTeacherRemarkRequest {
  term_report_id: string;
  education_level: EducationLevel;
  head_teacher_remark: string;
}

export interface UpdateHeadTeacherRemarkResponse {
  message: string;
  term_report_id: string;
}

// ===== SIGNATURE INTERFACES =====
export interface SignatureUploadResponse {
  message: string;
  signature_url: string;
  public_id: string;
  width: number;
  height: number;
}

export interface ApplySignatureRequest {
  signature_url: string;
  term_report_ids: string[];
  education_level: EducationLevel;
}

export interface ApplySignatureResponse {
  message: string;
  updated_count: number;
  errors?: Array<{
    report_id: string;
    error: string;
  }>;
}

// ===== REMARK TEMPLATES =====
export interface RemarkTemplates {
  excellent: string[];
  good: string[];
  average: string[];
  needs_improvement: string[];
}

export interface RemarkTemplatesResponse {
  templates: RemarkTemplatesByEducation;
  usage: string;
}

// ===== HEAD TEACHER REVIEW =====
export interface PendingReview {
  id: string;
  student: {
    id: string;
    full_name: string;
    student_class: string;
  };
  education_level: EducationLevel;
  class_teacher_remark: string;
  head_teacher_remark: string;
  has_head_teacher_remark: boolean;
  has_head_teacher_signature: boolean;
  status: ResultStatus;
  average_score: number | null;
}

export interface PendingReviewsResponse {
  exam_session: ExamSession;
  pending_reviews: PendingReview[];
  total_pending: number;
}

// ===== API ERROR RESPONSE =====
export interface ApiError {
  error: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

// ===== FILTERS =====
export interface StudentFilters {
  exam_session?: string;
  search?: string;
  education_level?: EducationLevel;
  student_class?: string;
  remark_status?: 'completed' | 'pending' | 'draft';
  page?: number;        // ADD THIS
  page_size?: number;   // ADD THIS
}

export interface ReportFilters {
  exam_session?: string;
  status?: ResultStatus;
  education_level?: EducationLevel;
}

