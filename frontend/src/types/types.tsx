// import { User } from '@/services/AuthService';
import { ReactNode, ComponentType } from 'react';

// ==========================================
// BASE TYPES & ENUMS
// ==========================================

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  PARENT = 'parent',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  NURSERY_ADMIN = 'nursery_admin',
  PRIMARY_ADMIN = 'primary_admin',
  JUNIOR_SECONDARY_ADMIN = 'junior_secondary_admin',
  SENIOR_SECONDARY_ADMIN = 'senior_secondary_admin',
  SECONDARY_ADMIN = 'secondary_admin'
}

export interface ApiResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface TermReportSubjectResult {
  id: string;
  subject: Subject;
  total_ca_score: number;
  ca_total: number;
  exam_score: number;
  total_score: number;
  percentage: number;
  grade: string;
  grade_point: number;
  is_passed: boolean;
  status: ResultStatus;
}

export interface NurseryPhysicalDevelopment {
  physical_development?: string;
  health?: string;
  cleanliness?: string;
  general_conduct?: string;
  height_beginning?: number;
  height_end?: number;
  weight_beginning?: number;
  weight_end?: number;
}

export interface TermReport {
  id: string;
  student: Student;
  academic_session?: AcademicSession;
  term: string;
  total_subjects: number;
  subjects_passed: number;
  subjects_failed: number;
  total_score: number;
  average_score: number;
  gpa: number;
  class_position: number | null;
  total_students: number;
  status: ResultStatus;
  remarks: string;
  next_term_begins: string | null;
  subject_results: TermReportSubjectResult[];
  created_at: string;
  updated_at: string;
  overall_grade: string;
  education_level: string;
}

export interface NurseryTermReport extends TermReport, NurseryPhysicalDevelopment {
  education_level: 'NURSERY';
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

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  UNEXCUSED = 'unexcused',
  PARTIAL = 'partial',
  SICK = 'sick',
  VACATION = 'vacation',
  SUSPENSION = 'suspension',
  OTHER = 'other'
}

export enum AttendanceAlertLevel {
  NORMAL = 'normal',
  WARNING = 'warning',
  CRITICAL = 'critical',
  SEVERE = 'severe'
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRANSFERRED = 'transferred',
  GRADUATED = 'graduated',
  SUSPENDED = 'suspended'
}

export enum EmploymentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  GRADUATED = 'graduated'
}

export enum FeeStatus {
  PAID = 'paid',
  PENDING = 'pending',
  OVERDUE = 'overdue'
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  NOT_SPECIFIED = 'not_specified'
}

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  GRADUATED = 'graduated'
}

export enum RelationshipType {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
  OTHER = 'other'
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum MessageType {
  NOTIFICATION = 'notification',
  ANNOUNCEMENT = 'announcement',
  ALERT = 'alert',
  REMINDER = 'reminder'
}

export enum MessageCategory {
  ACADEMIC = 'academic',
  ADMINISTRATIVE = 'administrative',
  SOCIAL = 'social',
  EMERGENCY = 'emergency',
  GENERAL = 'general'
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

export enum ClassroomStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

export enum AttendanceStatusRating {
  GOOD = 'good',
  AVERAGE = 'average',
  POOR = 'poor',
  CRITICAL = 'critical'
}

export enum TeacherAttendanceStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  AVERAGE = 'average',
  POOR = 'poor'
}

export enum TrendDirection {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable'
}

export enum ChangeType {
  IMPROVEMENT = 'improvement',
  INCREASE = 'increase',
  DECLINE = 'decline',
  DECREASE = 'decrease',
  STABLE = 'stable'
}

export enum EventType {
  ACADEMIC = 'academic',
  SPORTS = 'sports',
  CULTURAL = 'cultural',
  ADMINISTRATIVE = 'administrative',
  HOLIDAY = 'holiday'
}

export enum ContactMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  APP = 'app'
}

type EducationLevel =
  | 'NURSERY'
  |'PRIMARY'
  | 'JUNIOR_SECONDARY'
  | 'SENIOR_SECONDARY'
  | 'UNKNOWN'
  | 'MIXED'
  | string; // keep flexible for unexpected values

  type ResultStatus = 'DRAFT' | 'PUBLISHED' | 'APPROVED' | 'ARCHIVED' | string;

// ==========================================
// UTILITY TYPES
// ==========================================

export type ID = number | string;
export type ISODateString = string;
export type ISODateTimeString = string;
export type AttendanceStatusType = keyof typeof AttendanceStatus;
export type AttendanceAlertLevelType = keyof typeof AttendanceAlertLevel;

// Generic base entity with audit fields
export interface BaseEntity {
  id: ID;
  created_at?: ISODateTimeString;
  updated_at?: ISODateTimeString;
}

// For entities that can be soft deleted
export interface SoftDeletableEntity extends BaseEntity {
  deleted_at?: ISODateTimeString;
  is_deleted: boolean;
}

export interface SchoolSettings {
  // General settings
  site_name: string;
  school_name: string;
  school_code: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  favicon: string;
  academicYearStart: string;
  academicYearEnd: string;
  motto: string;
  timezone: string;
  dateFormat: string;
  language: string;
  
  // Design settings
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: string;
  
  // Communication settings
  notifications: {
    email: {
      enabled: boolean;
      welcomeEmail: boolean;
      resultReleased: boolean;
      absentNotice: boolean;
      feeReminder: boolean;
      examSchedule: boolean;
      eventAnnouncement: boolean;
      disciplinaryAction: boolean;
      provider: string; // smtp, brevo, sendgrid, etc.
      smtp: {
        host: string;
        port: number;
        username: string;
        password: string;
        encryption: string;
        fromName: string;
        fromEmail: string;
      };
      brevo: {
        apiKey: string;
        fromName: string;
        fromEmail: string;
        templateId: string;
        senderId: number;
      };
    };
    sms: {
      enabled: boolean;
      welcomeSMS: boolean;
      resultReleased: boolean;
      absentNotice: boolean;
      feeReminder: boolean;
      examSchedule: boolean;
      eventAnnouncement: boolean;
      disciplinaryAction: boolean;
      provider: string;
      apiKey: string;
      apiSecret: string;
      senderID: string;
    };
    inApp: {
      enabled: boolean;
      welcomeMessage: boolean;
      resultReleased: boolean;
      absentNotice: boolean;
      feeReminder: boolean;
      examSchedule: boolean;
      eventAnnouncement: boolean;
      disciplinaryAction: boolean;
      soundEnabled: boolean;
      desktopNotifications: boolean;
    };
  };
  
  // Payment gateways
  paymentGateways: {
    paystack: {
      enabled: boolean;
      publicKey: string;
      secretKey: string;
      testMode: boolean;
    };
    stripe: {
      enabled: boolean;
      publishableKey: string;
      secretKey: string;
      testMode: boolean;
    };
    flutterwave: {
      enabled: boolean;
      publicKey: string;
      secretKey: string;
    };
    bankTransfer: {
      enabled: boolean;
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  };
  
  // User role payment access
  userRolePaymentAccess: {
    teachers: {
      paystack: boolean;
      stripe: boolean;
      flutterwave: boolean;
      bankTransfer: boolean;
    };
    students: {
      paystack: boolean;
      stripe: boolean;
      flutterwave: boolean;
      bankTransfer: boolean;
    };
    parents: {
      paystack: boolean;
      stripe: boolean;
      flutterwave: boolean;
      bankTransfer: boolean;
    };
  };
  
  // Fee structure
  feeStructure: {
    categories: Array<{
      id: number;
      name: string;
      amount: number;
      mandatory: boolean;
      description: string;
    }>;
    paymentPlans: {
      fullPayment: boolean;
      twoInstallments: boolean;
      threeInstallments: boolean;
    };
  };
  
  // Discount rules
  discountRules: {
    siblingDiscount: {
      enabled: boolean;
      secondChild: number;
      thirdChild: number;
    };
  };
  
  // Academic settings
  classLevels: Array<{ id: number; name: string }>;
  subjects: Array<{ id: number; name: string }>;
  sessions: Array<{ id: number; name: string; terms: string[] }>;
  grading: {
    grades: Array<{ letter: string; min: number; max: number }>;
    passMark: number;
  };
  markingScheme: {
    continuousAssessment: number;
    examination: number;
    components: Array<{ name: string; weight: number; color: string }>;
  };
  
  // Security settings
  allowSelfRegistration: boolean;
  emailVerificationRequired: boolean;
  registrationApprovalRequired: boolean;
  defaultUserRole: string;
  passwordMinLength: number;
  passwordResetInterval: number;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  passwordRequireUppercase: boolean;
  allowProfileImageUpload: boolean;
  profileImageMaxSize: number;
  
  // Message templates
  messageTemplates: {
    welcomeEmail: { subject: string; content: string; active: boolean };
    resultReleased: { subject: string; content: string; active: boolean };
    absentNotice: { subject: string; content: string; active: boolean };
    feeReminder: { subject: string; content: string; active: boolean };
  };
  
  // Chat system
  chatSystem: {
    enabled: boolean;
    adminToTeacher: {
      enabled: boolean;
      allowFileSharing: boolean;
      maxFileSize: number;
      allowedFileTypes: string[];
      moderationEnabled: boolean;
    };
    teacherToParent: {
      enabled: boolean;
      allowFileSharing: boolean;
      maxFileSize: number;
      allowedFileTypes: string[];
      moderationEnabled: boolean;
      requireApproval: boolean;
    };
    teacherToStudent: {
      enabled: boolean;
      allowFileSharing: boolean;
      maxFileSize: number;
      allowedFileTypes: string[];
      moderationEnabled: boolean;
      requireApproval: boolean;
    };
    parentToParent: {
      enabled: boolean;
      allowFileSharing: boolean;
      moderationEnabled: boolean;
      requireApproval: boolean;
    };
    moderation: {
      enabled: boolean;
      profanityFilter: boolean;
      keywordBlacklist: string[];
      autoModeration: boolean;
      flaggedContentAction: string;
      moderators: string[];
      businessHoursOnly: boolean;
      businessHours: { start: string; end: string };
    };
  };
}

// ==========================================
// USER TYPES
// ==========================================

export interface CustomUser extends BaseEntity {
  username?: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  rememberMe?: boolean;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  date_joined?: ISODateTimeString;
  last_login?: ISODateTimeString;
  
  // Additional profile fields
  phone?: string;
  date_of_birth?: ISODateString;
  location?: string;
  avatar_url?: string;
  bio?: string;
  
  // Computed properties (read-only)
  readonly full_name?: string;
  readonly initials?: string;
}

export interface UserProfile extends BaseEntity {
  user: CustomUser;
  user_middle_name?: string;
  bio?: string;
  profile_image?: string;
  profile_image_url?: string;
  date_of_birth?: ISODateString;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  is_profile_complete?: boolean;
  is_verified?: boolean;
}

export interface UserVerificationStatus {
  email_verified: boolean;
  is_active: boolean;
  verification_code_valid: boolean;
  can_login: boolean;
}

export interface UserContactInfo {
  email: string;
  phone_number?: string;
  address?: string;
  social_media: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
  role: UserRole;
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
  invitation_code?: string;
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
// ACADEMIC STRUCTURE TYPES
// ==========================================

export interface GradeLevel extends BaseEntity {
  name: string;
  level: number;
  description?: string;
  min_age?: number;
  max_age?: number;
  is_active: boolean;
}

export interface Section extends BaseEntity {
  name: string;
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
  grade_levels: GradeLevel[];
  credit_hours?: number;
  is_core_subject: boolean;
  is_active: boolean;
}

export interface Classroom extends BaseEntity {
  name: string;
  capacity?: number;
  building?: string;
  floor?: number;
  room_number?: string;
  equipment?: string[];
  status?: ClassroomStatus;
  teacher_id?: number;
  subjects?: string[];
}

// ==========================================
// STUDENT TYPES
// ==========================================

export interface Student extends BaseEntity {
  user: CustomUser;
  student_id: string;
  gender?: Gender;
  date_of_birth?: ISODateString;
  admission_date: ISODateString;
  graduation_date?: ISODateString;
  
  // Academic info
  current_grade_level?: GradeLevel | string;
  current_section: Section | string;
  section: string;
  grade: string;
  class: string;
  roll_number?: string;
  academic_year: string;
  // Education level info
  education_level?: EducationLevel;
  education_level_display?: string;
  student_class?: string;
  
  // Contact info
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  parent_contact?: string;
  emergency_contact?: string;
  
  // Status
  enrollment_status: EnrollmentStatus;
  status?: StudentStatus;
  enrollment_date?: string;
  
  // Additional info
  address?: string;
  blood_group?: string;
  medical_conditions?: string;
  medical_info?: string;
  allergies?: string;
  special_needs?: string;
  previous_school?: string;
  transfer_certificate?: string;
  
  // Financial and services
  fee_status?: FeeStatus;
  transport_required?: boolean;
  hostel_required?: boolean;
  
  // Activities and performance
  extracurricular_activities?: string[];
  disciplinary_records?: string[];
  attendance_percentage?: number;
  
  // Computed properties
  readonly full_name?: string;
  readonly age: number;
  readonly years_enrolled: number;
  // Add is_active for dashboard activation status
  is_active?: boolean;
}

export interface CreateStudentData {
  user_id: ID;
  student_id: string;
  gender?: Gender;
  date_of_birth?: ISODateString;
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
  enrollment_status?: EnrollmentStatus;
}

// ==========================================
// TEACHER TYPES
// ==========================================

export interface Teacher extends BaseEntity {
  user: CustomUser;
  employee_id: string;
  
  // Contact information
  phone_number?: string;
  contact_number?: string;
  address?: string;
  
  // Employment info
  hire_date: ISODateString;
  employment_status?: EmploymentStatus;
  
  // Professional info
  qualifications: string[];
  qualification?: string;
  specializations?: Subject[] | string[];
  teaching_subjects?: string[];
  years_experience?: number;
  experience_years?: number;
  salary_grade?: string;
  salary?: number;
  department?: string;
  subject?: string;
  
  // Personal info
  date_of_birth?: ISODateString;
  gender?: Gender;
  marital_status?: MaritalStatus;
  blood_group?: string;
  previous_experience?: string;
  class_teacher_of?: string;
  photo?: string;
  
  // Performance and development
  performance_rating?: number;
  certifications?: string[];
  training_programs?: string[];
  achievements?: string[];
  disciplinary_records?: string[];
  
  // Leave and attendance
  leave_balance?: number;
  attendance_percentage?: number;
  
  // Emergency contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  emergency_contact?: string;
  
  // Computed properties
  readonly full_name?: string;
  readonly years_at_school?: number;
  // Add is_active for dashboard activation status
  is_active?: boolean;
}

// Updated to use the new ClassroomTeacherAssignment model
export interface ClassroomTeacherAssignment extends BaseEntity {
  teacher: Teacher;
  subject: Subject;
  classroom: number; // classroom ID
  classroom_name?: string;
  is_primary_teacher: boolean;
  periods_per_week: number;
  assigned_date: string;
  is_active: boolean;
}

// Legacy interface for backward compatibility (deprecated)
export interface TeacherAssignment extends BaseEntity {
  teacher: Teacher;
  grade_level: GradeLevel;
  section: Section;
  subject?: Subject;
  academic_year: string;
  is_primary_teacher: boolean;
  schedule?: WeeklySchedule;
   id: number;
  classroom_name: string;
  section_name: string;
  grade_level_name: string;
  education_level: EducationLevel;
  subject_name: string;
  subject_code: string;
  subject_id: number;
  grade_level_id: number;
  section_id: number;
  student_count: number;
  periods_per_week: number;
}



export interface WeeklySchedule {
  [key: string]: TimeSlot[];
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
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
  employment_status?: EmploymentStatus;
}

// ==========================================
// PARENT TYPES
// ==========================================

export interface Parent extends BaseEntity {
  user: CustomUser;
  parent_id?: string;
  students?: Student[];
  children?: Student[];
  children_ids?: number[];
  
  // Contact preferences
  preferred_contact_method?: ContactMethod;
  notification_preferences?: NotificationPreferences;
  
  // Professional info
  occupation?: string;
  annual_income?: number;
  highest_education_aquired?: string;
  
  // Personal info
  relationship_to_student?: RelationshipType;
  marital_status?: MaritalStatus;
  
  // Contact info
  work_phone?: string;
  home_address?: string;
  work_address?: string;
  emergency_contact?: string;
  
  // Computed properties
  readonly full_name?: string;
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
  preferred_contact_method?: ContactMethod;
  notification_preferences?: Partial<NotificationPreferences>;
  work_phone?: string;
  home_address?: string;
  work_address?: string;
}

export interface UpdateParentData extends Partial<CreateParentData> {
  id: ID;
}

// ==========================================
// ATTENDANCE TYPES
// ==========================================

export interface AttendanceData {
  // Basic statistics
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  totalUnexcused: number;
  totalStudents: number;
  totalTeachers: number;
  
  // Percentage calculations
  attendanceRate: number;
  absenteeRate: number;
  lateRate: number;
  excusedRate: number;
  
  // Time-based statistics
  dailyAttendance: DailyAttendance[];
  weeklyAttendance: WeeklyAttendance[];
  monthlyAttendance: MonthlyAttendance[];
  
  // Class-wise attendance
  classAttendance: ClassAttendance[];
  
  // Individual attendance records
  studentAttendanceRecords: StudentAttendanceRecord[];
  teacherAttendanceRecords: TeacherAttendanceRecord[];
  
  // Trends and analytics
  attendanceTrends: AttendanceTrend[];
  absenteeismPatterns: AbsenteeismPattern[];
  
  // Alerts and notifications
  lowAttendanceAlerts: LowAttendanceAlert[];
  chronicAbsentees: ChronicAbsentee[];
  
  // Comparative data
  previousPeriodComparison: PeriodComparison;
  gradeComparison: GradeComparison[];
  
  // Additional metadata
  reportPeriod: ReportPeriod;
  
  // Last updated information
  lastUpdated: string;
  generatedBy: string;
  
  // Summary insights
  insights?: AttendanceInsight[] | string[];
  recommendations?: AttendanceRecommendation[] | string[];
}

export interface DailyAttendance {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  totalExpected: number;
  total?: number;
  attendanceRate: number;
  rate?: number;
  weather?: string;
  specialEvents?: string[];
}

export interface WeeklyAttendance {
  weekStartDate?: string;
  weekEndDate?: string;
  weekNumber?: number;
  week?: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  present: number;
  absent: number;
  averageAttendanceRate: number;
  rate: number;
  dailyBreakdown?: DailyAttendance[];
}

export interface MonthlyAttendance {
  month: string;
  year?: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  present: number;
  absent: number;
  averageAttendanceRate: number;
  rate: number;
  schoolDays?: number;
  weeklyBreakdown?: WeeklyAttendance[];
}

export interface ClassAttendance {
  classId: string;
  className: string;
  grade?: string;
  section?: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
  present: number;
  absent: number;
  attendanceRate: number;
  rate: number;
  classTeacher?: string;
  lastUpdated?: string;
}

export interface StudentAttendanceRecord {
  studentId: string | number;
  studentName: string;
  studentNumber?: string;
  grade?: string;
  section?: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  unexcusedDays: number;
  present: number;
  absent: number;
  attendanceRate: number;
  rate: number;
  consecutiveAbsences?: number;
  lastAbsenceDate?: string;
  parentNotified?: boolean;
  attendanceStatus?: AttendanceStatusType;
}

export interface TeacherAttendanceRecord {
  teacherId: string | number;
  teacherName: string;
  employeeId?: string;
  department?: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leavesTaken?: number;
  present: number;
  absent: number;
  attendanceRate: number;
  rate: number;
  lastAbsenceDate?: string;
  attendanceStatus?: TeacherAttendanceStatus;
}

export interface AttendanceTrend {
  period: string;
  attendanceRate: number;
  rate: number;
  trend?: TrendDirection;
  change?: number;
  changePercentage?: number;
  factors?: string[];
}

export interface AbsenteeismPattern {
  pattern: string;
  frequency: number;
  count: number;
  percentage: number;
  affectedStudents?: number;
  commonReasons?: string[];
  recommendations?: string[];
}

export interface LowAttendanceAlert {
  studentId?: string | number;
  studentName?: string;
  userId: number;
  userName: string;
  userType: 'student' | 'teacher';
  grade?: string;
  section?: string;
  attendanceRate: number;
  rate: number;
  threshold: number;
  consecutiveAbsences?: number;
  alertLevel?: AttendanceAlertLevel;
  parentContacted?: boolean;
  interventionRequired?: boolean;
  lastContactDate?: string;
}

export interface ChronicAbsentee {
  studentId?: string | number;
  studentName?: string;
  userId: number;
  userName: string;
  userType: 'student' | 'teacher';
  grade?: string;
  section?: string;
  totalAbsences: number;
  consecutiveAbsences: number;
  attendanceRate?: number;
  interventionsPlan?: string[];
  caseWorkerAssigned?: boolean;
  progressNotes?: string[];
}

export interface PeriodComparison {
  currentPeriod: {
    startDate: string;
    endDate: string;
    attendanceRate: number;
  };
  previousPeriod: {
    startDate: string;
    endDate: string;
    attendanceRate: number;
  };
  change?: number;
  changeType: ChangeType;
}

export interface GradeComparison {
  grade: string;
  totalStudents?: number;
  attendanceRate: number;
  ranking: number;
  comparisonWithSchoolAverage?: number;
  topPerformingSection?: string;
  lowestPerformingSection?: string;
}

export interface AttendanceInsight {
  type: 'positive' | 'negative' | 'neutral';
  category: 'overall' | 'grade' | 'individual' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  data: any;
}

export interface AttendanceRecommendation {
  priority?: MessagePriority;
  category: 'policy' | 'intervention' | 'communication' | 'system';
  title: string;
  description: string;
  actionItems: string[];
  expectedOutcome: string;
  timeframe: string;
  responsibility: string;
}

export interface ReportPeriod {
  startDate: string;
  endDate: string;
  totalDays: number;
  schoolDays: number;
  holidays: number;
}

// ==========================================
// MESSAGING TYPES
// ==========================================

export interface Message extends BaseEntity {
  sender?: CustomUser | string;
  recipients?: CustomUser[];
  recipient?: string;
  subject?: string;
  title?: string;
  content?: string;
  message?: string;
  sent_at?: ISODateTimeString;
  
  // Message metadata
  priority?: MessagePriority;
  category?: MessageCategory | string;
  message_type?: MessageType;
  attachments?: MessageAttachment[];
  
  // Thread support
  parent_message_id?: ID;
  thread_id?: ID;
  
  // Delivery tracking
  read_by?: MessageReceipt[];
  is_read?: boolean;
  read_at?: ISODateTimeString;
  archived?: boolean;
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
  subject?: string;
  content: string;
  priority?: MessagePriority;
  category?: MessageCategory;
  parent_message_id?: ID;
  attachments?: File[];
}

// ==========================================
// ROLE-SPECIFIC USER DATA
// ==========================================

export interface BaseFullUserData extends CustomUser {
  profile?: UserProfile;
  verification_status?: UserVerificationStatus;
  contact_info?: UserContactInfo;
}

export interface StudentUserData extends BaseFullUserData {
  role: UserRole.STUDENT;
  student_data: Student;
}

export interface TeacherUserData extends BaseFullUserData {
  role: UserRole.TEACHER;
  teacher_data: Teacher;
}

export interface ParentUserData extends BaseFullUserData {
  role: UserRole.PARENT;
  parent_data: Parent;
  children?: StudentEntity[];
}

export interface AdminUserData extends BaseFullUserData {
  role: 
    | UserRole.ADMIN 
    | UserRole.SUPERADMIN
    | UserRole.NURSERY_ADMIN
    | UserRole.PRIMARY_ADMIN
    | UserRole.JUNIOR_SECONDARY_ADMIN
    | UserRole.SENIOR_SECONDARY_ADMIN
    | UserRole.SECONDARY_ADMIN;
  admin_data?: Record<string, any>; // Optional admin-specific data
}

export type FullUserData = StudentUserData | TeacherUserData | ParentUserData | AdminUserData;

// ==========================================
// ADMIN TYPES
// ==========================================

export interface AdminUserManagement {
  id: number;
  user_data: FullUserData;
  permissions: string[];
  last_login?: string;
  created_by?: number;
  is_suspended?: boolean;
  suspension_reason?: string;
  notes?: string;
}

export interface UserCreationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  profile_data?: Partial<UserProfile>;
  send_welcome_email?: boolean;
}

export interface UserUpdateData {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_active?: boolean;
  profile_data?: Partial<UserProfile>;
}

export interface AdminDashboardStats {
  total_users?: number;
  total_students?: number;
  active_students?: number;
  inactive_students?: number;
  total_teachers?: number;
  active_teachers?: number;
  inactive_teachers?: number;
  total_parents?: number;
  active_parents?: number;
  inactive_parents?: number;
  total_admins?: number;
  active_users?: number;
  inactive_users?: number;
  total_classes?: number;
  total_subjects?: number;
  pending_verifications?: number;
  recent_registrations?: number;
  users_by_role?: Record<string, number>;
  login_activity?: {
    date: string;
    count: number;
  }[];
}

export interface AdminAuditLog {
  id: number;
  admin_user: number;
  action: string;
  target_user?: number;
  details: string;
  timestamp: string;
  ip_address?: string;
}

// ==========================================
// DASHBOARD TYPES
// ==========================================

export interface DashboardStats {
  overview?: {
    total_students: number;
    total_teachers: number;
    total_parents: number;
    total_subjects: number;
    total_classes: number;
    active_academic_year: string;
  };
  totalStudents?: number;
  totalTeachers?: number;
  totalClasses?: number;
  totalUsers?: number;
  totalParents?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  pendingVerifications?: number;
  recentRegistrations?: number;
  recent_activities?: Activity[];
  upcoming_events?: SchoolEvent[];
  alerts?: Alert[];
  quick_stats?: QuickStat[];
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
  event_type: EventType;
  target_audience: UserRole[];
  is_mandatory: boolean;
  organizer: CustomUser;
}

export interface Alert extends BaseEntity {
  title: string;
  message: string;
  type: NotificationType;
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
  change?: number;
  trend?: TrendDirection;
  color?: string;
  icon?: string;
}

export interface Notification extends BaseEntity {
  title: string;
  message: string;
  type?: NotificationType;
  recipient: CustomUser;
  sender?: CustomUser | string;
  is_read?: boolean;
  read_at?: ISODateTimeString;
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
  expires_at?: ISODateTimeString;
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

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: ReactNode;
  group?: string;
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
  employment_status?: EmploymentStatus;
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
  type?: NotificationType;
  recipient: CustomUser;
  sender?: CustomUser | string;
  is_read?: boolean;
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

// ==================== ENHANCED TYPES ====================
export interface UserProfile {
  id: number;
  user: CustomUser;
  user_middle_name?: string
  bio?: string;
  profile_image?: string;
  profile_image_url?: string;
  date_of_birth?: ISODateString;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  is_profile_complete?: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}




export interface UserVerificationStatus {
  email_verified: boolean;
  is_active: boolean;
  verification_code_valid: boolean;
  can_login: boolean;
}

export interface UserContactInfo {
  email: string;
  phone_number?: string;
  address?: string;
  social_media: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

// Enhanced Student interface matching your Dashboard requirements
export interface StudentEntity {
  id: number;
  user: CustomUser;
  student_id: string;
  grade: string;
  class: string;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
  parent_contact: string;
  emergency_contact: string;
  medical_info: string;
  gender: Gender;
  date_of_birth: string;
  admission_date: string;
  current_grade_level: string;
  section: string;
  roll_number: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  address: string;
  blood_group: string;
  allergies: string;
  previous_school: string;
  transfer_certificate: string;
  academic_year: string;
  fee_status: 'paid' | 'pending' | 'overdue';
  transport_required: boolean;
  hostel_required: boolean;
  extracurricular_activities: string[];
  disciplinary_records: string[];
  attendance_percentage: number;
  full_name: string;
  created_at: string;
  updated_at: string;
}

// Enhanced Teacher interface matching your Dashboard requirements
export interface TeacherEntity {
  id: number;
  user: CustomUser;
  employee_id: string;
  hire_date: string;
  employment_status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  department: string;
  subject: string;
  qualification: string;
  experience_years: number;
  qualifications: string[];
  specializations: string[];
  full_name: string;
  years_at_school: number;
  salary: number;
  contact_number: string;
  emergency_contact: string;
  address: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other' | 'not_specified';
  marital_status: 'single' | 'married' | 'divorced' | 'widowed' | 'not_specified';
  blood_group: string;
  previous_experience: string;
  teaching_subjects: string[];
  class_teacher_of: string;
  performance_rating: number;
  certifications: string[];
  training_programs: string[];
  achievements: string[];
  disciplinary_records: string[];
  leave_balance: number;
  attendance_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Parent {
  id: number;
  user: CustomUser;
  parent_id?: string;
  occupation?: string;
  relationship_to_student?: RelationshipType;
  children_ids?: number[];
  emergency_contact?: string;
  work_address?: string;
  annual_income?: number;
  highest_education_acquired?: string;
  marital_status?: MaritalStatus;
  children?: Student[];
  created_at: string;
  updated_at: string;
  // Add is_active for dashboard activation status
  is_active?: boolean;
}

// Enhanced AttendanceData interface
export interface AttendanceData {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  totalUnexcused: number;
  totalStudents: number;
  totalTeachers: number;
  attendanceRate: number;
  absenteeRate: number;
  lateRate: number;
  excusedRate: number;
  dailyAttendance: DailyAttendance[];
  weeklyAttendance: WeeklyAttendance[];
  monthlyAttendance: MonthlyAttendance[];
  classAttendance: ClassAttendance[];
  studentAttendanceRecords: StudentAttendanceRecord[];
  teacherAttendanceRecords: TeacherAttendanceRecord[];
  attendanceTrends: AttendanceTrend[];
  absenteeismPatterns: AbsenteeismPattern[];
  lowAttendanceAlerts: LowAttendanceAlert[];
  chronicAbsentees: ChronicAbsentee[];
  previousPeriodComparison: PeriodComparison;
  gradeComparison: GradeComparison[];
  reportPeriod: ReportPeriod;
  lastUpdated: string;
  generatedBy: string;
  insights?: AttendanceInsight[] | string[];
  recommendations?: AttendanceRecommendation[] |string[];
}

// Supporting interfaces for AttendanceData
export interface DailyAttendance {
  date: string;
  present: number;
  absent: number;
  late: number;
  total?: number;
}

export interface WeeklyAttendance {
  week?: string;
  present: number;
  absent: number;
  rate: number;
}

export interface MonthlyAttendance {
  month: string;
  present: number;
  absent: number;
  rate: number;
}

export interface ClassAttendance {
  classId: string;
  className: string;
  present: number;
  absent: number;
  rate: number;
}

export interface StudentAttendanceRecord {
  studentId: string | number;
  studentName: string;
  present: number;
  absent: number;
  rate: number;
}

export interface TeacherAttendanceRecord {
  teacherId: string | number;
  teacherName: string;
  present: number;
  absent: number;
  rate: number;
}

export interface AttendanceTrend {
  period: string;
  rate: number;
  change?: number;
}

export interface AbsenteeismPattern {
  pattern: string;
  count: number;
  percentage: number;
}

export interface LowAttendanceAlert {
  userId: number;
  userName: string;
  userType: 'student' | 'teacher';
  rate: number;
  threshold: number;
}

export interface ChronicAbsentee {
  userId: number;
  userName: string;
  userType: 'student' | 'teacher';
  consecutiveAbsences: number;
  totalAbsences: number;
}



export interface GradeComparison {
  grade: string;
  attendanceRate: number;
  ranking: number;
}

export interface ReportPeriod {
  startDate: string;
  endDate: string;
  totalDays: number;
  schoolDays: number;
  holidays: number;
}


export interface AdminUserManagement {
  id: number;
  user_data: FullUserData;
  permissions: string[];
  last_login?: string;
  created_by?: number;
  is_suspended?: boolean;
  suspension_reason?: string;
  notes?: string;
}



export interface UserCreationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  profile_data?: Partial<UserProfile>;
  send_welcome_email?: boolean;
}

export interface UserUpdateData {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_active?: boolean;
  profile_data?: Partial<UserProfile>;
}


export interface AdminDashboardStats {
  total_users?: number;
  total_students?: number;
  total_teachers?: number;
  total_parents?: number;
  total_admins?: number;
  active_users?: number;
  inactive_users?: number;
  total_classes?: number;
  total_subjects?: number;
  pending_verifications?: number;
  recent_registrations?: number;
  users_by_role?: Record<string, number>;
  login_activity?: {
    date: string;
    count: number;
  }[];
}



export interface AdminAuditLog {
  id: number;
  admin_user: number;
  action: string;
  target_user?: number;
  details: string;
  timestamp: string;
  ip_address?: string;
}




// Dashboard-specific interfaces
export interface DashboardStats {
  totalStudents?: number;
  totalTeachers?: number;
  totalClasses?: number;
  totalUsers?: number;
  totalParents?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  pendingVerifications?: number;
  recentRegistrations?: number;
}

export interface Message {
  id: number;
  is_read?: boolean;
  title?: string;
  content?: string;
  created_at?: string;
  sender?: CustomUser |string;
  recipient?: string;
  message_type?: MessageType;
  priority?: MessagePriority;
  category?: string;
  read_at?: string;
  archived?: boolean;
}

export interface Classroom {
  id: number;
  name: string;
  capacity?: number;
  building?: string;
  floor?: number;
  room_number?: string;
  equipment?: string[];
  status?: ClassroomStatus;
  teacher_id?: number;
  subjects?: string[];
  created_at?: string;
  updated_at?: string;
}

// ===============================================================================



export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  angle: number;
}

export interface StudentInfo {
  id: string;
  full_name: string;
  username?: string;
  student_class: string;
  education_level: string;
  profile_picture?: string;
}

export interface ObjectiveQuestion {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  marks: number;
}

export interface SubSubQuestion {
  id: number;
  question: string;
  expectedPoints: string;
  marks: number;
  wordLimit: string;
}

export interface SubQuestion {
  id: number;
  question: string;
  expectedPoints: string;
  marks: number;
  wordLimit: string;
  subSubQuestions: SubSubQuestion[];
}

export interface TheoryQuestion {
  id: number;
  question: string;
  expectedPoints: string;
  marks: number;
  wordLimit: string;
  subQuestions: SubQuestion[];
}

export interface PracticalQuestion {
  id: number;
  task: string;
  materials: string;
  expectedOutcome: string;
  marks: number;
  timeLimit: string;
}

export interface Question {
  id: number;
  question: string;
  marks: number;
  wordLimit?: string;
}

export interface CustomSection {
  id: number;
  name: string;
  instructions: string;
  questions: Question[];
}

 
 export interface AcademicSession {
  id: string;        // Django uses AutoField (int), but DRF usually serializes as string or number.
  name: string;
  academic_session?: string;
  academic_session_name?: string 
  start_date: string;  // "YYYY-MM-DD"
  end_date: string;    // "YYYY-MM-DD"
  is_current: boolean;
  is_active: boolean;
  created_at: string;  // ISO datetime string
  updated_at: string;  // ISO datetime string
}
export interface ExamSession {
  id: string;
  name: string;
  exam_type: string;
  term: string;
   academic_session?: AcademicSession | string | number;
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
  academic_session?: AcademicSession;
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

export interface SelectionData {
  academicSession: AcademicSession; 
  term: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    academic_session: AcademicSession;
  };
  class: {
    id: string;
    name: string;
    section: string;
    education_level?: string;
  };
  resultType?: string;
  examSession?: string;
}

// Unified result type for components
export interface StandardResult {
  id: string;
  student: StudentInfo;
  subject: SubjectInfo;
  exam_session?: ExamSessionInfo;
  academic_session?: AcademicSession;
  education_level: string;
  stream?: StreamInfo;
  grading_system?: GradingSystemInfo;
  
  // Standardized score fields
  total_score: number;
  percentage: number;
  grade: string;
  grade_point?: number;
  is_passed: boolean;
  position?: number;
  
  // Raw score fields for editing (keep original field names)
  first_test_score?: number;
  second_test_score?: number;
  third_test_score?: number;
  continuous_assessment_score?: number;
  take_home_test_score?: number;
  appearance_score?: number;
  practical_score?: number;
  project_score?: number;
  note_copying_score?: number;
  exam_score: number;
  
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
  status: ResultStatus;
  remarks?: string;
  teacher_remark?: string;
  created_at: string;
}

// Education-level specific result interfaces
export interface NurseryResultData {
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
  status: ResultStatus;
  created_at: string;
  updated_at: string;
}

export interface PrimaryResultData {
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
  status: ResultStatus;
  created_at: string;
  updated_at: string;
}

export interface JuniorSecondaryResultData {
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
  status: ResultStatus;
  created_at: string;
  updated_at: string;
}

export interface SeniorSecondaryResultData {
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
  status: ResultStatus;
  created_at: string;
  updated_at: string;
    term_display: string,
    term: string,
    academic_session_name: string,
    name: string,
    exam_session_name: string,
    session_name: string,
  
}

export interface SeniorSecondarySessionResultData {
  id: string;
  student: StudentInfo;
  subject: SubjectInfo;
  academic_session?: AcademicSession;
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
  status: ResultStatus;
  created_at: string;
  updated_at: string;
}
export interface StudentTermResult {
  id: string;
  student: StudentInfo;
  academic_session?: AcademicSession;
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


export interface StudentResult {
  id: number;
  student: {
    id: number;
    full_name: string;
    registration_number: string;
    profile_picture?: string;
    education_level: EducationLevel;
  };
  subject: {
    id: number;
    name: string;
    code: string;
  };
  exam_session: {
    id: number;
    name: string;
    term: string;
    academic_session: string;
  };
  academic_session: AcademicSession;
  
   // Computed
  ca_score: number;
  ca_total: number;
  exam_score: number;
  total_score: number;
 grade?: 'A' | 'B' | 'C' | 'D' | 'F' | string;
  remarks: string;
  teacher_remark?: string;
  status?: ResultStatus;
  created_at: string;
  updated_at: string;
  education_level: EducationLevel;
  // Senior Secondary specific fields
  first_test_score?: number;
  second_test_score?: number;
  third_test_score?: number;
  // Primary/Junior Secondary specific fields
  continuous_assessment_score?: number;
  take_home_test_score?: number;
  practical_score?: number;
  appearance_score?: number;
  project_score?: number;
  note_copying_score?: number;
}

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


// ==========================================
// EXPORT ALIASES FOR BACKWARD COMPATIBILITY
// ==========================================

export type {
  Student as StudentType,
  Teacher as TeacherType,
  ParentProfile as ParentType,
  CustomUser as UserType,
  
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


