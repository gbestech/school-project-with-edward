import api from './api';

export interface SchoolSettings {
  site_name: string;
  school_name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  favicon: string;
  academicYear: string;
  currentTerm?: string;
  motto: string;
  timezone: string;
  dateFormat: string;
  language: string;
  theme: string;
  primaryColor: string;
  fontFamily: string;
  fontSize: string;
  student_portal_enabled: boolean;
  teacher_portal_enabled: boolean;  // 🔥 ADD THIS
  parent_portal_enabled: boolean;   // 🔥 ADD THIS
  notifications: any;
  paymentGateways: any;
  userRolePaymentAccess: any;
  feeStructure: any;
  discountRules: any;
  classLevels: Array<{ id: number; name: string }>;
  subjects: Array<{ id: number; name: string }>;
  sessions: Array<{ id: number; name: string; terms: string[] }>;
  grading: any;
  markingScheme: any;
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
  security?: {
    twoFactorAuth: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      passwordExpiry: number;
    };
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    ipWhitelist: string[];
    auditLogging: boolean;
    dataEncryption: boolean;
  };
  messageTemplates: any;
  chatSystem: any;
}

class SettingsService {
  
  async getSettings(): Promise<SchoolSettings> {
    try {
      const cacheBuster = `${Date.now()}_${Math.random()}`;
      const response = await api.get(`/api/school-settings/school-settings/?_=${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (typeof response === 'string' && response.includes('<!DOCTYPE html>')) {
        console.error('Received HTML instead of JSON - likely a 404 or auth error');
        return this.getDefaultSettings();
      }
      
      console.log('📥 Raw backend response:', response);
      
      return this.transformBackendToFrontend(response);
    } catch (error) {
      console.error('Error fetching settings:', error);
      return this.getDefaultSettings();
    }
  }

  async updateSettings(settings: Partial<SchoolSettings>): Promise<SchoolSettings> {
    try {
      console.log('📤 Sending settings update:', settings);
      
      const backendSettings: any = {};
      
      // General settings
      if (settings.school_name !== undefined) backendSettings.school_name = settings.school_name;
      if (settings.site_name !== undefined) backendSettings.site_name = settings.site_name;
      if (settings.address !== undefined) backendSettings.school_address = settings.address;
      if (settings.phone !== undefined) backendSettings.school_phone = settings.phone;
      if (settings.email !== undefined) backendSettings.school_email = settings.email;
      if (settings.motto !== undefined) backendSettings.school_motto = settings.motto;
      if (settings.timezone !== undefined) backendSettings.timezone = settings.timezone;
      if (settings.dateFormat !== undefined) backendSettings.date_format = settings.dateFormat;
      if (settings.language !== undefined) backendSettings.language = settings.language;
      if (settings.student_portal_enabled !== undefined) backendSettings.student_portal_enabled = settings.student_portal_enabled;
      if (settings.teacher_portal_enabled !== undefined) backendSettings.teacher_portal_enabled = settings.teacher_portal_enabled;  // 🔥 ADD THIS
      if (settings.parent_portal_enabled !== undefined) backendSettings.parent_portal_enabled = settings.parent_portal_enabled;    // 🔥 ADD THIS
      // Design settings
      if (settings.theme !== undefined) backendSettings.theme = settings.theme;
      if (settings.primaryColor !== undefined) backendSettings.primary_color = settings.primaryColor;
      if (settings.fontFamily !== undefined) backendSettings.typography = settings.fontFamily;
      
      // Academic year
      if (settings.academicYear !== undefined) backendSettings.academic_year = settings.academicYear;
      if (settings.currentTerm !== undefined) backendSettings.current_term = settings.currentTerm;
      
      // Files
      if (settings.logo !== undefined) backendSettings.logo = settings.logo;
      if (settings.favicon !== undefined) backendSettings.favicon = settings.favicon;
      
      // Basic security
      if (settings.allowSelfRegistration !== undefined) backendSettings.allow_self_registration = settings.allowSelfRegistration;
      if (settings.emailVerificationRequired !== undefined) backendSettings.email_verification_required = settings.emailVerificationRequired;
      if (settings.registrationApprovalRequired !== undefined) backendSettings.registration_approval_required = settings.registrationApprovalRequired;
      if (settings.defaultUserRole !== undefined) backendSettings.default_user_role = settings.defaultUserRole;
      if (settings.passwordMinLength !== undefined) backendSettings.password_min_length = settings.passwordMinLength;
      if (settings.passwordResetInterval !== undefined) backendSettings.password_reset_interval = settings.passwordResetInterval;
      if (settings.passwordRequireNumbers !== undefined) backendSettings.password_require_numbers = settings.passwordRequireNumbers;
      if (settings.passwordRequireSymbols !== undefined) backendSettings.password_require_symbols = settings.passwordRequireSymbols;
      if (settings.passwordRequireUppercase !== undefined) backendSettings.password_require_uppercase = settings.passwordRequireUppercase;
      if (settings.allowProfileImageUpload !== undefined) backendSettings.allow_profile_image_upload = settings.allowProfileImageUpload;
      if (settings.profileImageMaxSize !== undefined) backendSettings.profile_image_max_size = settings.profileImageMaxSize;
      
      // Complex objects
      if (settings.notifications !== undefined) backendSettings.notifications = settings.notifications;
      if (settings.paymentGateways !== undefined) backendSettings.payment_gateways = settings.paymentGateways;
      if (settings.classLevels !== undefined) backendSettings.class_levels = settings.classLevels;
      if (settings.subjects !== undefined) backendSettings.subjects = settings.subjects;
      if (settings.sessions !== undefined) backendSettings.sessions = settings.sessions;
      if (settings.grading !== undefined) backendSettings.grading = settings.grading;
      if (settings.markingScheme !== undefined) backendSettings.marking_scheme = settings.markingScheme;
      if (settings.messageTemplates !== undefined) backendSettings.message_templates = settings.messageTemplates;
      if (settings.chatSystem !== undefined) backendSettings.chat_system = settings.chatSystem;
      if (settings.userRolePaymentAccess !== undefined) backendSettings.user_role_payment_access = settings.userRolePaymentAccess;
      if (settings.feeStructure !== undefined) backendSettings.fee_structure = settings.feeStructure;
      if (settings.discountRules !== undefined) backendSettings.discount_rules = settings.discountRules;
      
      // 🔥 FIXED: Map security settings to flat backend fields
      if ((settings as any).security !== undefined) {
        const security = (settings as any).security;
        
        // Map to flat fields that match your backend
        if (security.passwordPolicy !== undefined) {
          if (security.passwordPolicy.minLength !== undefined) {
            backendSettings.password_min_length = security.passwordPolicy.minLength;
          }
          if (security.passwordPolicy.requireUppercase !== undefined) {
            backendSettings.password_require_uppercase = security.passwordPolicy.requireUppercase;
          }
          if (security.passwordPolicy.requireNumbers !== undefined) {
            backendSettings.password_require_numbers = security.passwordPolicy.requireNumbers;
          }
          if (security.passwordPolicy.requireSpecialChars !== undefined) {
            backendSettings.password_require_symbols = security.passwordPolicy.requireSpecialChars;
          }
          if (security.passwordPolicy.passwordExpiry !== undefined) {
            backendSettings.password_expiration = security.passwordPolicy.passwordExpiry;
          }
        }
        
        if (security.sessionTimeout !== undefined) {
          backendSettings.session_timeout = security.sessionTimeout;
        }
        if (security.maxLoginAttempts !== undefined) {
          backendSettings.max_login_attempts = security.maxLoginAttempts;
        }
        if (security.lockoutDuration !== undefined) {
          backendSettings.account_lock_duration = security.lockoutDuration;
        }
      }
      
      console.log('📤 Transformed for backend:', backendSettings);
      
      const response = await api.put('/api/school-settings/school-settings/', backendSettings);
      console.log('✅ Backend response:', response);
      
      const transformedResponse = this.transformBackendToFrontend(response);
      console.log('✅ Transformed response:', transformedResponse);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('settings-updated', { detail: transformedResponse }));
      }
      
      return transformedResponse;
    } catch (error: any) {
      console.error('Error updating settings:', error);
      
      const errorData = error.response?.data;
      let errorMessage = 'Failed to update school settings';
      
      if (typeof errorData === 'object' && errorData !== null) {
        const errors: string[] = [];
        for (const [field, messages] of Object.entries(errorData)) {
          if (Array.isArray(messages)) {
            errors.push(`${field}: ${messages.join(', ')}`);
          } else if (typeof messages === 'string') {
            errors.push(`${field}: ${messages}`);
          } else if (typeof messages === 'object') {
            errors.push(`${field}: ${JSON.stringify(messages)}`);
          }
        }
        if (errors.length > 0) {
          errorMessage = `Validation errors:\n${errors.join('\n')}`;
        }
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  private transformBackendToFrontend(response: any): SchoolSettings {
    console.log('🔄 Transforming backend response');
    
    const defaultSettings = this.getDefaultSettings();
    
    return {
      site_name: response.site_name ?? response.school_name ?? 'Gods Treasure Schools',
      school_name: response.school_name ?? 'Gods Treasure Schools',
      address: response.school_address ?? '',
      phone: response.school_phone ?? '',
      email: response.school_email ?? '',
      logo: response.logo_url ?? response.logo ?? '',
      favicon: response.favicon_url ?? response.favicon ?? '',
      academicYear: response.academic_year ?? '',
      currentTerm: response.current_term ?? '',
      motto: response.school_motto ?? 'Knowledge at its spring',
      timezone: response.timezone ?? 'UTC+1',
      dateFormat: response.date_format ?? 'DD/MM/YYYY',
      language: response.language ?? 'en',
      
      theme: response.theme ?? 'default',
      primaryColor: response.primary_color ?? '#3B82F6',
      fontFamily: response.typography ?? 'Inter',
      fontSize: 'medium',
      student_portal_enabled: response.student_portal_enabled ?? true,
      teacher_portal_enabled: response.teacher_portal_enabled ?? true, 
      parent_portal_enabled: response.parent_portal_enabled ?? true,  
      notifications: response.notifications ?? defaultSettings.notifications,
      paymentGateways: response.payment_gateways ?? defaultSettings.paymentGateways,
      allowSelfRegistration: response.allow_self_registration ?? true,
      emailVerificationRequired: response.email_verification_required ?? true,
      registrationApprovalRequired: response.registration_approval_required ?? false,
      defaultUserRole: response.default_user_role ?? 'student',
      passwordMinLength: response.password_min_length ?? 8,
      passwordResetInterval: response.password_reset_interval ?? 90,
      passwordRequireNumbers: response.password_require_numbers ?? true,
      passwordRequireSymbols: response.password_require_symbols ?? false,
      passwordRequireUppercase: response.password_require_uppercase ?? false,
      allowProfileImageUpload: response.allow_profile_image_upload ?? true,
      profileImageMaxSize: response.profile_image_max_size ?? 2,
      classLevels: response.class_levels ?? [],
      subjects: response.subjects ?? [],
      sessions: response.sessions ?? [],
      grading: response.grading ?? { grades: [], passMark: 40 },
      markingScheme: response.marking_scheme ?? {
        continuousAssessment: 30,
        examination: 70,
        components: []
      },
      messageTemplates: response.message_templates ?? defaultSettings.messageTemplates,
      chatSystem: response.chat_system ?? defaultSettings.chatSystem,
      userRolePaymentAccess: response.user_role_payment_access ?? defaultSettings.userRolePaymentAccess,
      feeStructure: response.fee_structure ?? defaultSettings.feeStructure,
      discountRules: response.discount_rules ?? defaultSettings.discountRules,
      
      // 🔥 FIXED: Map from flat backend fields to nested frontend structure
      security: {
        twoFactorAuth: true, // Backend doesn't have this field yet
        passwordPolicy: {
          minLength: response.password_min_length ?? 8,
          requireUppercase: response.password_require_uppercase ?? false,
          requireLowercase: true, // Backend doesn't have this field
          requireNumbers: response.password_require_numbers ?? false,
          requireSpecialChars: response.password_require_symbols ?? false,
          passwordExpiry: response.password_expiration ?? 90
        },
        sessionTimeout: response.session_timeout ?? 30,
        maxLoginAttempts: response.max_login_attempts ?? 5,
        lockoutDuration: response.account_lock_duration ?? 15,
        ipWhitelist: [], // Backend doesn't have this field yet
        auditLogging: true, // Backend doesn't have this field yet
        dataEncryption: true // Backend doesn't have this field yet
      },
    };
  }

  // ... rest of your methods (uploadLogo, uploadFavicon, etc.) stay the same
  
  async uploadLogo(file: File): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    
    const getCsrfToken = () => {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') return decodeURIComponent(value);
      }
      return null;
    };
    
    const headers: any = {};
    const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    const csrfToken = getCsrfToken();
    
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    if (csrfToken) headers['X-CSRFToken'] = csrfToken;
    
    const response = await fetch(
      "https://school-management-project-qpox.onrender.com/api/school-settings/school-settings/upload-logo/",
      {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      }
    );
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      const errorData = contentType?.includes('application/json') 
        ? await response.json()
        : { error: await response.text() };
      throw new Error(`Failed to upload logo: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  }

  async uploadFavicon(file: File): Promise<{ faviconUrl: string }> {
    const formData = new FormData();
    formData.append('favicon', file);
    
    const getCsrfToken = () => {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') return decodeURIComponent(value);
      }
      return null;
    };
    
    const headers: any = {};
    const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    const csrfToken = getCsrfToken();
    
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    if (csrfToken) headers['X-CSRFToken'] = csrfToken;
    
    const response = await fetch(
      "https://school-management-project-qpox.onrender.com/api/school-settings/school-settings/upload-favicon/",
      {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      }
    );
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      const errorData = contentType?.includes('application/json')
        ? await response.json()
        : { error: await response.text() };
      throw new Error(`Failed to upload favicon: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  }
  
  private getDefaultSettings(): SchoolSettings {
    return {
      site_name: 'Gods treasure schools',
      school_name: 'Gods Treasure Schools',
      address: '',
      phone: '',
      email: '',
      logo: '',
      favicon: '',
      academicYear: '',
      motto: 'Knowledge at its spring',
      timezone: 'UTC-5',
      dateFormat: 'dd/mm/yyyy',
      language: 'English',
      theme: 'light',
      primaryColor: '#3B82F6',
      fontFamily: 'Inter',
      fontSize: 'medium',
      student_portal_enabled: true,
      teacher_portal_enabled: true, 
      parent_portal_enabled: true, 
      notifications: {
        email: {
          enabled: true,
          welcomeEmail: true,
          resultReleased: true,
          absentNotice: true,
          feeReminder: true,
          examSchedule: true,
          eventAnnouncement: true,
          disciplinaryAction: false,
          provider: 'smtp',
          smtp: {
            host: 'smtp.gmail.com',
            port: 587,
            username: '',
            password: '',
            encryption: 'TLS',
            fromName: 'School',
            fromEmail: 'admin@school.edu'
          },
          brevo: {
            apiKey: '',
            fromName: 'School',
            fromEmail: 'admin@school.edu',
            templateId: '',
            senderId: 1
          }
        },
        sms: {
          enabled: false,
          welcomeSMS: false,
          resultReleased: true,
          absentNotice: true,
          feeReminder: true,
          examSchedule: false,
          eventAnnouncement: false,
          disciplinaryAction: false,
          provider: 'twilio',
          apiKey: '',
          apiSecret: '',
          senderID: 'SCHOOL'
        },
        inApp: {
          enabled: true,
          welcomeMessage: true,
          resultReleased: true,
          absentNotice: true,
          feeReminder: true,
          examSchedule: true,
          eventAnnouncement: true,
          disciplinaryAction: true,
          soundEnabled: true,
          desktopNotifications: true
        }
      },
      paymentGateways: {
        paystack: { enabled: false, publicKey: '', secretKey: '', testMode: false },
        stripe: { enabled: false, publishableKey: '', secretKey: '', testMode: false },
        flutterwave: { enabled: false, publicKey: '', secretKey: '', testMode: true },
        bankTransfer: { enabled: false, bankName: '', accountNumber: '', accountName: '' }
      },
      userRolePaymentAccess: {
        teachers: { paystack: false, stripe: false, flutterwave: false, bankTransfer: false },
        students: { paystack: false, stripe: false, flutterwave: false, bankTransfer: false },
        parents: { paystack: false, stripe: false, flutterwave: false, bankTransfer: false }
      },
      feeStructure: {
        categories: [],
        paymentPlans: { fullPayment: false, twoInstallments: false, threeInstallments: false }
      },
      discountRules: {
        siblingDiscount: { enabled: false, secondChild: 0, thirdChild: 0 }
      },
      classLevels: [],
      subjects: [],
      sessions: [],
      grading: { grades: [], passMark: 40 },
      markingScheme: { continuousAssessment: 30, examination: 70, components: [] },
      allowSelfRegistration: true,
      emailVerificationRequired: true,
      registrationApprovalRequired: false,
      defaultUserRole: 'student',
      passwordMinLength: 8,
      passwordResetInterval: 90,
      passwordRequireNumbers: true,
      passwordRequireSymbols: false,
      passwordRequireUppercase: false,
      allowProfileImageUpload: true,
      profileImageMaxSize: 2,
      messageTemplates: {
        welcomeEmail: { subject: 'Welcome', content: 'Welcome!', active: true },
        resultReleased: { subject: 'Results Available', content: 'Results available.', active: true },
        absentNotice: { subject: 'Absence Notice', content: 'Absent today.', active: true },
        feeReminder: { subject: 'Fee Reminder', content: 'Pay fees.', active: true }
      },
      chatSystem: {
        enabled: true,
        adminToTeacher: { enabled: true, allowFileSharing: true, maxFileSize: 10, allowedFileTypes: ['pdf'], moderationEnabled: false },
        teacherToParent: { enabled: true, allowFileSharing: true, maxFileSize: 5, allowedFileTypes: ['pdf'], moderationEnabled: true, requireApproval: false },
        teacherToStudent: { enabled: false, allowFileSharing: false, maxFileSize: 2, allowedFileTypes: ['pdf'], moderationEnabled: true, requireApproval: true },
        parentToParent: { enabled: false, allowFileSharing: false, moderationEnabled: true, requireApproval: true },
        moderation: {
          enabled: true,
          profanityFilter: true,
          keywordBlacklist: [],
          autoModeration: true,
          flaggedContentAction: 'hide',
          moderators: [],
          businessHoursOnly: false,
          businessHours: { start: '08:00', end: '16:00' }
        }
      }
    };
  }
}

export default new SettingsService();