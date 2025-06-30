// ==========================================
// SCHOOL MANAGEMENT SYSTEM TYPES - IMPROVED
// ==========================================

import { ReactNode, ComponentType } from 'react';

// ==========================================
// BASE TYPES & ENUMS
// ==========================================

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  PARENT = 'parent',
  ADMIN = 'admin'
}

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
  PREFER_NOT_TO_SAY = 'P'
}

export enum ActivityType {
  ASSIGNMENT = 'assignment',
  EXAM = 'exam',
  MEETING = 'meeting',
  ANNOUNCEMENT = 'announcement',
  MESSAGE = 'message',
  ATTENDANCE = 'attendance',
  GRADE_SUBMISSION = 'grade_submission'
}

export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type ID = number | string;
export type ISODateString = string;
export type ISODateTimeString = string;

// Generic base entity with audit fields
export interface BaseEntity {
  id: ID;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

// For entities that can be soft deleted
export interface SoftDeletableEntity extends BaseEntity {
  deleted_at?: ISODateTimeString;
  is_deleted: boolean;
}

// ==========================================
// USER TYPES
// ==========================================

export interface CustomUser extends BaseEntity {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: ISODateTimeString;
  last_login?: ISODateTimeString;


// interface CustomUser {
//   id: number;
//   username: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   role: string;
//   is_active: boolean;
//   is_staff: boolean;
//   is_superuser: boolean;
//   date_joined: string;
//   full_name: string;
// }

  
  // Additional profile fields
  phone?: string;
  date_of_birth?: ISODateString;
  location?: string;
  avatar_url?: string;
  bio?: string;
  
  // Computed properties (read-only)
  readonly full_name: string;
  readonly initials: string;
}



export interface LoginCredentials {
  email: string;
  password: string;
  role: string;
  rememberMe: boolean;
}


export interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: ISODateString;
  location?: string;
  agreeToTerms: boolean;
  subscribeNewsletter?: boolean;
}

// ==========================================
// ACADEMIC STRUCTURE TYPES
// ==========================================

export interface GradeLevel extends BaseEntity {
  name: string; // e.g., "Grade 1", "Grade 2", "Kindergarten"
  level: number; // numerical level for sorting (0 for Kindergarten, 1 for Grade 1, etc.)
  description?: string;
  min_age?: number;
  max_age?: number;
  is_active: boolean;
}

export interface Section extends BaseEntity {
  name: string; // e.g., "A", "B", "C"
  grade_level: GradeLevel;
  capacity: number;
  current_enrollment: number;
  homeroom_teacher?: Teacher;
  is_active: boolean;
  
  // Computed properties
  readonly is_full: boolean;
  readonly available_spots: number;
}

export interface Subject extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  grade_levels: GradeLevel[]; // Which grades this subject is taught in
  credit_hours?: number;
  is_core_subject: boolean;
  is_active: boolean;
}

// ==========================================
// STUDENT TYPES
// ==========================================

export interface Student extends BaseEntity {
  user: CustomUser;
  student_id: string; // Unique student identifier
  gender: Gender;
  date_of_birth: ISODateString;
  admission_date: ISODateString;
  graduation_date?: ISODateString;
  
  // Academic info
  current_grade_level: GradeLevel;
  current_section: Section;
  academic_year: string; // e.g., "2024-2025"
  
  // Contact info
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  
  // Status
  enrollment_status: 'active' | 'inactive' | 'transferred' | 'graduated' | 'suspended';
  
  // Medical/Special needs
  medical_conditions?: string;
  allergies?: string;
  special_needs?: string;
  
  // Computed properties
  readonly full_name: string;
  readonly age: number;
  readonly years_enrolled: number;
}

export interface CreateStudentData {
  user_id: ID;
  student_id: string;
  gender: Gender;
  date_of_birth: ISODateString;
  current_grade_level_id: ID;
  current_section_id: ID;
  admission_date: ISODateString;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  medical_conditions?: string;
  allergies?: string;
  special_needs?: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  id: ID;
  enrollment_status?: Student['enrollment_status'];
}

// ==========================================
// TEACHER TYPES
// ==========================================

export interface Teacher extends BaseEntity {
  user: CustomUser;
  employee_id: string; // Unique employee identifier
  phone_number?: string;
  address?: string;
  hire_date: ISODateString;
  employment_status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  
  // Professional info
  qualifications: string[];
  specializations: Subject[];
  years_experience?: number;
  salary_grade?: string;
  
  // Emergency contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  
  // Computed properties
  readonly full_name: string;
  readonly years_at_school: number;
}

export interface TeacherAssignment extends BaseEntity {
  teacher: Teacher;
  grade_level: GradeLevel;
  section: Section;
  subject: Subject;
  academic_year: string;
  is_primary_teacher: boolean; // Is this their main/homeroom class?
  schedule?: WeeklySchedule;
}

export interface WeeklySchedule {
  [key: string]: TimeSlot[]; // Day of week as key
}

export interface TimeSlot {
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  room?: string;
}

export interface CreateTeacherData {
  user_id: ID;
  employee_id: string;
  phone_number?: string;
  address?: string;
  hire_date: ISODateString;
  qualifications?: string[];
  specialization_ids?: ID[];
  years_experience?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface UpdateTeacherData extends Partial<CreateTeacherData> {
  id: ID;
  employment_status?: Teacher['employment_status'];
}

// ==========================================
// PARENT TYPES
// ==========================================

export interface ParentProfile extends BaseEntity {
  user: CustomUser;
  students: Student[];
  
  // Contact preferences
  preferred_contact_method: 'email' | 'phone' | 'sms' | 'app';
  notification_preferences: NotificationPreferences;
  
  // Emergency contact info
  work_phone?: string;
  home_address?: string;
  work_address?: string;
  
  // Computed properties
  readonly full_name: string;
  readonly children_count: number;
  readonly children_names: string[];
}

export interface NotificationPreferences {
  academic_updates: boolean;
  attendance_alerts: boolean;
  behavior_reports: boolean;
  event_reminders: boolean;
  payment_reminders: boolean;
  general_announcements: boolean;
}

export interface CreateParentData {
  user_id: ID;
  student_ids: ID[];
  preferred_contact_method?: ParentProfile['preferred_contact_method'];
  notification_preferences?: Partial<NotificationPreferences>;
  work_phone?: string;
  home_address?: string;
  work_address?: string;
}

export interface UpdateParentData extends Partial<CreateParentData> {
  id: ID;
}

// ==========================================
// MESSAGING TYPES
// ==========================================

export interface Message extends BaseEntity {
  sender: CustomUser;
  recipients: CustomUser[]; // Support for multiple recipients
  subject: string;
  content: string;
  sent_at: ISODateTimeString;
  
  // Message metadata
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'academic' | 'administrative' | 'social' | 'emergency' | 'general';
  attachments?: MessageAttachment[];
  
  // Thread support
  parent_message_id?: ID;
  thread_id?: ID;
  
  // Delivery tracking
  read_by: MessageReceipt[];
}

export interface MessageAttachment {
  id: ID;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
}

export interface MessageReceipt {
  recipient_id: ID;
  read_at?: ISODateTimeString;
  delivered_at: ISODateTimeString;
}

export interface CreateMessageData {
  recipient_ids: ID[];
  subject: string;
  content: string;
  priority?: Message['priority'];
  category?: Message['category'];
  parent_message_id?: ID;
  attachments?: File[];
}

// ==========================================
// AUTHENTICATION TYPES
// ==========================================



export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: CustomUser;
  expires_in: number;
  permissions: string[];
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  invitation_code?: string; // For restricted registration
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  status_code: number;
  timestamp: ISODateTimeString;
}

export interface PaginatedResponse<T = any> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status_code: number;
  error_code?: string;
  timestamp: ISODateTimeString;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ==========================================
// DASHBOARD TYPES
// ==========================================

export interface DashboardStats {
  overview: {
    total_students: number;
    total_teachers: number;
    total_parents: number;
    total_subjects: number;
    total_classes: number;
    active_academic_year: string;
  };
  recent_activities: Activity[];
  upcoming_events: SchoolEvent[];
  alerts: Alert[];
  quick_stats: QuickStat[];
}

export interface Activity extends BaseEntity {
  title: string;
  description: string;
  type: ActivityType;
  timestamp: ISODateTimeString;
  user: CustomUser;
  metadata?: Record<string, any>;
  is_important: boolean;
}

export interface SchoolEvent extends BaseEntity {
  title: string;
  description?: string;
  start_date: ISODateTimeString;
  end_date: ISODateTimeString;
  location?: string;
  event_type: 'academic' | 'sports' | 'cultural' | 'administrative' | 'holiday';
  target_audience: UserRole[];
  is_mandatory: boolean;
  organizer: CustomUser;
}

export interface Alert extends BaseEntity {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  target_roles: UserRole[];
  expires_at?: ISODateTimeString;
  is_dismissible: boolean;
  action_url?: string;
  action_text?: string;
}

export interface QuickStat {
  label: string;
  value: number | string;
  change?: number; // Percentage change from previous period
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  icon?: string;
}

// ==========================================
// FORM TYPES
// ==========================================

export interface FormField<T = any> {
  name: keyof T;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'multiselect' | 'date' | 'datetime' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'number';
  required: boolean;
  disabled?: boolean;
  readonly?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  hint?: string;
  validation?: FieldValidation;
  dependencies?: FieldDependency[];
  conditional?: ConditionalField;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface FieldDependency {
  field: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
}

export interface ConditionalField {
  when: Record<string, any>;
  then: Partial<FormField>;
  else?: Partial<FormField>;
}

export interface FormErrors {
  [key: string]: string | string[];
}

export interface FormState<T = any> {
  values: Partial<T>;
  errors: FormErrors;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// ==========================================
// TABLE & LIST TYPES
// ==========================================

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => ReactNode;
  sorter?: (a: T, b: T) => number;
  filters?: FilterOption[];
}

export interface FilterOption {
  text: string;
  value: any;
}

export interface SortOrder {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  search?: string;
  role?: UserRole;
  grade_level?: ID;
  section?: ID;
  subject?: ID;
  is_active?: boolean;
  enrollment_status?: Student['enrollment_status'];
  employment_status?: Teacher['employment_status'];
  date_from?: ISODateString;
  date_to?: ISODateString;
  academic_year?: string;
}

// ==========================================
// COMPONENT PROPS TYPES
// ==========================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  closable?: boolean;
  maskClosable?: boolean;
  destroyOnClose?: boolean;
  footer?: ReactNode;
  className?: string;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  htmlType?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  label?: string;
  error?: string | string[];
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  hint?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  prefix?: ReactNode;
  suffix?: ReactNode;
  maxLength?: number;
  showCount?: boolean;
  className?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: ReactNode;
  group?: string;
}

// ==========================================
// NAVIGATION TYPES
// ==========================================

export interface NavigationItem {
  id: string;
  label: string;
  icon?: ComponentType<any>;
  path?: string;
  roles: UserRole[];
  permissions?: string[];
  children?: NavigationItem[];
  badge?: string | number;
  isExternal?: boolean;
  onClick?: () => void;
  divider?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: ComponentType<any>;
  dropdown?: BreadcrumbItem[];
}

export interface TabItem {
  key: string;
  label: string;
  icon?: ComponentType<any>;
  content?: ReactNode;
  disabled?: boolean;
  closable?: boolean;
}

// ==========================================
// NOTIFICATION TYPES
// ==========================================

export interface Notification extends BaseEntity {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipient: CustomUser;
  sender?: CustomUser;
  is_read: boolean;
  read_at?: ISODateTimeString;
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
  expires_at?: ISODateTimeString;
}

// ==========================================
// SEARCH TYPES
// ==========================================

export interface SearchResult<T = any> {
  item: T;
  score: number;
  highlights: string[];
  type: string;
}

export interface SearchOptions {
  query: string;
  types?: string[];
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  sort?: SortOrder[];
}

// ==========================================
// EXPORT ALIASES FOR BACKWARD COMPATIBILITY
// ==========================================

export type {
  Student as StudentType,
  Teacher as TeacherType,
  ParentProfile as ParentType,
  CustomUser as UserType,
  Message as MessageType,
  Subject as SubjectType,
  GradeLevel as GradeLevelType,
  Section as SectionType,
};

// ==========================================
// UTILITY TYPE HELPERS
// ==========================================

// Make all properties optional except for specified keys
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Make specified properties required
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Extract API data type (remove computed/readonly fields)
export type ApiData<T> = Omit<T, 'readonly' | keyof BaseEntity>;

// Create type for form initial values
export type FormInitialValues<T> = Partial<Omit<T, keyof BaseEntity | 'readonly'>>;

// Type for entity relations that can be either ID or full object
export type Relation<T> = T | ID;