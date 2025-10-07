
import api from './api';

export interface SchoolSettings {
  // General settings
  site_name: string;
  school_name: string;
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
      testMode: boolean;
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

// Communication Settings Interface (separate endpoint)
export interface CommunicationSettings {
  notifications: SchoolSettings['notifications'];
}

// Announcement interfaces
export interface SchoolAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  target_audience: 'ALL' | 'STUDENTS' | 'TEACHERS' | 'PARENTS';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface AnnouncementCreateUpdate {
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  target_audience: 'ALL' | 'STUDENTS' | 'TEACHERS' | 'PARENTS';
  is_active: boolean;
  expires_at?: string;
}

// Permission interfaces
export interface Permission {
  id: string;
  name: string;
  codename: string;
  content_type: string;
  description?: string;
}

// Role interfaces
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleCreateUpdate {
  name: string;
  description?: string;
  permissions: string[];
  is_active: boolean;
}

// User Role interfaces
export interface UserRole {
  id: string;
  user: string;
  role: string;
  assigned_by: string;
  assigned_at: string;
  is_active: boolean;
}

export interface UserRoleCreateUpdate {
  user: string;
  role: string;
  is_active: boolean;
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
    
    console.log('🔍 Raw API response:', response);

    // Check if response is HTML (404 error page)
    if (typeof response === 'string' && response.includes('<!DOCTYPE html>')) {
      console.error('Received HTML instead of JSON - likely a 404 or auth error');
      return this.getDefaultSettings();
    }
    
    // Transform with CORRECT field mapping based on actual backend response
    const transformedSettings: SchoolSettings = {
      // Use school_address not address (backend field name)
      site_name: response.site_name ?? response.school_name ?? 'Gods Treasure Schools',
      school_name: response.school_name ?? 'Springfield Elementary School',
      address: response.school_address ?? '', // FIXED: was response.address
      phone: response.school_phone ?? '',     // FIXED: was response.phone
      email: response.school_email ?? '',     // FIXED: was response.email
      logo: response.logo_url ?? response.logo ?? '',
      favicon: response.favicon_url ?? response.favicon ?? '',
      
      // Parse academic_year if it exists (might be "2024/2025" format)
      academicYearStart: response.academic_year_start ?? '',
      academicYearEnd: response.academic_year_end ?? '',
      
      motto: response.school_motto ?? 'Knowledge at its spring', // FIXED: was response.motto
      timezone: response.timezone ?? 'UTC-5',
      dateFormat: response.date_format ?? 'dd/mm/yyyy',
      language: response.language ?? 'English',
      theme: response.theme ?? 'light',
      primaryColor: response.primary_color ?? '#3B82F6',
      secondaryColor: response.secondary_color ?? '#6366F1',
      fontFamily: response.typography ?? 'Inter',
      fontSize: 'medium',
      
      notifications: {
        email: {
          enabled: response.notifications_enabled ?? false,
          welcomeEmail: false,
          resultReleased: false,
          absentNotice: false,
          feeReminder: false,
          examSchedule: false,
          eventAnnouncement: false,
          disciplinaryAction: false,
          provider: 'smtp',
          smtp: {
            host: '',
            port: 587,
            username: '',
            password: '',
            encryption: 'tls',
            fromName: '',
            fromEmail: '',
          },
          brevo: {
            apiKey: '',
            fromName: '',
            fromEmail: '',
            templateId: '',
            senderId: 0,
          },
        },
        sms: {
          enabled: false,
          welcomeSMS: false,
          resultReleased: false,
          absentNotice: false,
          feeReminder: false,
          examSchedule: false,
          eventAnnouncement: false,
          disciplinaryAction: false,
          provider: '',
          apiKey: '',
          apiSecret: '',
          senderID: '',
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
          desktopNotifications: true,
        },
      },
      
      // Rest of the settings with defaults
      paymentGateways: this.getDefaultSettings().paymentGateways,
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
      classLevels: [],
      subjects: [],
      sessions: [],
      grading: {
        grades: [],
        passMark: 40
      },
      markingScheme: {
        continuousAssessment: 30,
        examination: 70,
        components: []
      },
      messageTemplates: this.getDefaultSettings().messageTemplates,
      chatSystem: this.getDefaultSettings().chatSystem,
      userRolePaymentAccess: this.getDefaultSettings().userRolePaymentAccess,
      feeStructure: this.getDefaultSettings().feeStructure,
      discountRules: this.getDefaultSettings().discountRules,
    };
    
    console.log('✅ Transformed settings:', transformedSettings);
    return transformedSettings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return this.getDefaultSettings();
  }
}

  async updateSettings(settings: Partial<SchoolSettings>): Promise<SchoolSettings> {
  try {
    console.log('📤 Sending settings update:', settings);
    
    // Transform ALL frontend fields to backend format
    const backendSettings: any = {};
    
    // General settings transformations
     // CRITICAL FIXES - Map frontend field names to backend field names
    if (settings.school_name !== undefined) backendSettings.school_name = settings.school_name;
    if (settings.site_name !== undefined) backendSettings.site_name = settings.site_name;
    
    // These were WRONG - they need the school_ prefix
    if (settings.address !== undefined) backendSettings.school_address = settings.address;  // ← FIX
    if (settings.phone !== undefined) backendSettings.school_phone = settings.phone;        // ← FIX
    if (settings.email !== undefined) backendSettings.school_email = settings.email;        // ← FIX
    if (settings.motto !== undefined) backendSettings.school_motto = settings.motto;        // ← FIX
    
    if (settings.timezone !== undefined) backendSettings.timezone = settings.timezone;
    if (settings.dateFormat !== undefined) backendSettings.date_format = settings.dateFormat;
    if (settings.language !== undefined) backendSettings.language = settings.language;
    
    // Design settings transformations
    if (settings.theme !== undefined) backendSettings.theme = settings.theme;
    if (settings.primaryColor !== undefined) backendSettings.primary_color = settings.primaryColor;
    if (settings.secondaryColor !== undefined) backendSettings.secondary_color = settings.secondaryColor;
    if (settings.fontFamily !== undefined) backendSettings.typography = settings.fontFamily;
    
    // Academic year transformations
    if (settings.academicYearStart !== undefined) backendSettings.academic_year_start = settings.academicYearStart;
    if (settings.academicYearEnd !== undefined) backendSettings.academic_year_end = settings.academicYearEnd;
    
    // File uploads (only if they're actual files or URLs)
    if (settings.logo !== undefined) backendSettings.logo = settings.logo;
    if (settings.favicon !== undefined) backendSettings.favicon = settings.favicon;
    
    // Security settings transformations
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
    
    // Nested object transformations (if your backend accepts them)
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
    
    console.log('📤 Transformed for backend:', backendSettings);
    
    const response = await api.put('/api/school-settings/school-settings/', backendSettings);
    console.log('✅ Backend response:', response);
    
    // Transform response back to frontend format
    const transformedResponse = await this.transformBackendToFrontend(response);
    console.log('✅ Transformed response:', transformedResponse);
    
    // Broadcast the update to all listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('settings-updated', { detail: transformedResponse }));
    }
    
    return transformedResponse;
  } catch (error: any) {
    console.error('❌ Error updating settings:', error);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error data:', error.response?.data);
    
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

private async transformBackendToFrontend(response: any): Promise<SchoolSettings> {
  return {
    site_name: response.site_name ?? response.school_name ?? 'EduAdmin Pro',
    school_name: response.school_name ?? 'Springfield Elementary School',
    address: response.school_address ?? '',     // FIXED
    phone: response.school_phone ?? '',         // FIXED
    email: response.school_email ?? '',         // FIXED
    logo: response.logo_url ?? response.logo ?? '',
    favicon: response.favicon_url ?? response.favicon ?? '',
    academicYearStart: response.academic_year_start ?? '',
    academicYearEnd: response.academic_year_end ?? '',
    motto: response.school_motto ?? 'Excellence in Education', // FIXED
    timezone: response.timezone ?? 'UTC-5',
    dateFormat: response.date_format ?? 'dd/mm/yyyy',
    language: response.language ?? 'English',
    theme: response.theme ?? 'light',
    primaryColor: response.primary_color ?? '#3B82F6',
    secondaryColor: response.secondary_color ?? '#6366F6',
    fontFamily: response.typography ?? 'Inter',
    fontSize: 'medium',
    notifications: response.notifications ?? this.getDefaultSettings().notifications,
    paymentGateways: response.payment_gateways ?? this.getDefaultSettings().paymentGateways,
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
    classLevels: response.classLevels ?? [],
    subjects: response.subjects ?? [],
    sessions: response.sessions ?? [],
    grading: response.grading ?? { grades: [], passMark: 40 },
    markingScheme: response.markingScheme ?? {
      continuousAssessment: 30,
      examination: 70,
      components: []
    },
    messageTemplates: response.messageTemplates ?? this.getDefaultSettings().messageTemplates,
    chatSystem: response.chatSystem ?? this.getDefaultSettings().chatSystem,
    userRolePaymentAccess: response.userRolePaymentAccess ?? this.getDefaultSettings().userRolePaymentAccess,
    feeStructure: response.feeStructure ?? this.getDefaultSettings().feeStructure,
    discountRules: response.discountRules ?? this.getDefaultSettings().discountRules,
  };
}
async testSaveAndRetrieve() {
  console.log('🧪 Testing save and retrieve...');
  
  // Save test data
  const testData = {
    school_name: 'Test School ' + Date.now(),
    email: 'test@example.com'
  };
  console.log('📤 Saving:', testData);
  const saved = await this.updateSettings(testData);
  console.log('✅ Saved response:', saved);

  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  console.log('📥 Retrieving...');
  const retrieved = await this.getSettings();
  console.log('✅ Retrieved:', retrieved);

  // Check if they match
  if (retrieved.school_name === testData.school_name) {
    console.log('✅ TEST PASSED: Data persisted correctly!');
  } else {
    console.error('❌ TEST FAILED: Data did not persist');
    console.error('Expected:', testData.school_name);
    console.error('Got:', retrieved.school_name);
  }
}

  async getCommunicationSettings(): Promise<CommunicationSettings> {
    try {
      const response = await api.get('/api/school-settings/communication-settings/');
      return response;
    } catch (error) {
      console.error('Error fetching communication settings:', error);
      throw new Error('Failed to fetch communication settings');
    }
  }

  async updateCommunicationSettings(settings: Partial<CommunicationSettings>): Promise<CommunicationSettings> {
    try {
      const response = await api.put('/api/school-settings/communication-settings/', settings);
      return response;
    } catch (error) {
      console.error('Error updating communication settings:', error);
      throw new Error('Failed to update communication settings');
    }
  }

  async testPaymentGateway(gateway: string, credentials: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/api/school-settings/payment-gateways/${gateway}/test/`, credentials);
      return response;
    } catch (error) {
      console.error(`Error testing ${gateway} connection:`, error);
      throw new Error(`Failed to test ${gateway} connection`);
    }
  }

  async testEmailConnection(emailConfig: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/school-settings/notifications/email/test/', emailConfig);
      return response;
    } catch (error) {
      console.error('Error testing email connection:', error);
      throw new Error('Failed to test email connection');
    }
  }

  async testSMSConnection(smsConfig: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/school-settings/notifications/sms/test/', smsConfig);
      return response;
    } catch (error) {
      console.error('Error testing SMS connection:', error);
      throw new Error('Failed to test SMS connection');
    }
  }

  async testBrevoConnection(brevoConfig: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/school-settings/notifications/brevo/test/', brevoConfig);
      return response;
    } catch (error) {
      console.error('Error testing Brevo connection:', error);
      throw new Error('Failed to test Brevo connection');
    }
  }

  async testTwilioConnection(twilioConfig: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/school-settings/notifications/twilio/test/', twilioConfig);
      return response;
    } catch (error) {
      console.error('Error testing Twilio connection:', error);
      throw new Error('Failed to test Twilio connection');
    }
  }

  async sendTestEmail(emailData: { to: string; subject: string; content: string }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/school-settings/notifications/brevo/send-test/', emailData);
      return response;
    } catch (error) {
      console.error('Error sending test email:', error);
      throw new Error('Failed to send test email');
    }
  }

  async sendTestSMS(smsData: { to: string; message: string }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/school-settings/notifications/twilio/send-test/', smsData);
      return response;
    } catch (error) {
      console.error('Error sending test SMS:', error);
      throw new Error('Failed to send test SMS');
    }
  }
// Update these methods in your SettingsService.ts

async uploadLogo(file: File): Promise<{ logoUrl: string }> {
  try {
    const formData = new FormData();
    formData.append('logo', file);
    
    console.log('Uploading logo to Cloudinary via backend...');

    
    const response = await fetch('/api/school-settings/school-settings/upload-logo/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', response.status, errorText);
      throw new Error(`Failed to upload logo: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
}

async uploadFavicon(file: File): Promise<{ faviconUrl: string }> {
  try {
    const formData = new FormData();
    formData.append('favicon', file);
    
    console.log('Uploading favicon to Cloudinary via backend...');
    
    const response = await fetch('/api/school-settings/school-settings/upload-favicon/ ', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', response.status, errorText);
      throw new Error(`Failed to upload favicon: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error('Error uploading favicon:', error);
    throw error;
  }
}
  async getAnnouncements(filters?: {
    target_audience?: string;
    is_active?: boolean;
    priority?: string;
  }): Promise<SchoolAnnouncement[]> {
    try {
      const response = await api.get('/api/school-settings/announcements/', filters);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  }

  async getAnnouncement(id: string): Promise<SchoolAnnouncement> {
    const response = await api.get(`/api/school-settings/announcements/${id}/`);
    return response;
  }

  async createAnnouncement(data: AnnouncementCreateUpdate): Promise<SchoolAnnouncement> {
    const response = await api.post('/api/school-settings/announcements/', data);
    return response;
  }

  async updateAnnouncement(id: string, data: Partial<AnnouncementCreateUpdate>): Promise<SchoolAnnouncement> {
    const response = await api.put(`/api/school-settings/announcements/${id}/`, data);
    return response;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await api.delete(`/api/school-settings/announcements/${id}/`);
  }

  async getPermissions(): Promise<Permission[]> {
    try {
      const response = await api.get('/api/school-settings/permissions/');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  }

  async getPermission(id: string): Promise<Permission> {
    const response = await api.get(`/api/school-settings/permissions/${id}/`);
    return response;
  }

  async getRoles(filters?: { is_active?: boolean }): Promise<Role[]> {
    try {
      const response = await api.get('/api/school-settings/roles/', filters);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  async getRole(id: string): Promise<Role> {
    const response = await api.get(`/api/school-settings/roles/${id}/`);
    return response;
  }

  async createRole(data: RoleCreateUpdate): Promise<Role> {
    const response = await api.post('/api/school-settings/roles/', data);
    return response;
  }

  async updateRole(id: string, data: Partial<RoleCreateUpdate>): Promise<Role> {
    const response = await api.put(`/api/school-settings/roles/${id}/`, data);
    return response;
  }

  async deleteRole(id: string): Promise<void> {
    await api.delete(`/api/school-settings/roles/${id}/`);
  }

  async getUserRoles(filters?: { 
    user?: string; 
    role?: string; 
    is_active?: boolean; 
  }): Promise<UserRole[]> {
    try {
      const response = await api.get('/api/school-settings/user-roles/', filters);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  async getUserRole(id: string): Promise<UserRole> {
    const response = await api.get(`/api/school-settings/user-roles/${id}/`);
    return response;
  }

  async createUserRole(data: UserRoleCreateUpdate): Promise<UserRole> {
    const response = await api.post('/api/school-settings/user-roles/', data);
    return response;
  }

  async updateUserRole(id: string, data: Partial<UserRoleCreateUpdate>): Promise<UserRole> {
    const response = await api.put(`/api/school-settings/user-roles/${id}/`, data);
    return response;
  }

  async deleteUserRole(id: string): Promise<void> {
    await api.delete(`/api/school-settings/user-roles/${id}/`);
  }

  private getDefaultSettings(): SchoolSettings {
    // ... keep your existing default settings implementation
    return {
      site_name: 'Gods treasure schools',
      school_name: 'Gods Treasure Schools',
      address: '',
      phone: '',
      email: '',
      logo: '',
      favicon: '',
      academicYearStart: '',
      academicYearEnd: '',
      motto: 'Excellence in Education',
      timezone: 'UTC-5',
      dateFormat: 'dd/mm/yyyy',
      language: 'English',
      theme: 'light',
      primaryColor: '#3B82F6',
      secondaryColor: '#6366F1',
      fontFamily: 'Inter',
      fontSize: 'medium',
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
            fromName: 'Springfield Elementary',
            fromEmail: 'admin@springfield.edu'
          },
          brevo: {
            apiKey: '',
            fromName: 'Springfield Elementary',
            fromEmail: 'admin@springfield.edu',
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
          senderID: 'SPRINGFIELD'
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
        paystack: {
          enabled: false,
          publicKey: '',
          secretKey: '',
          testMode: false
        },
        stripe: {
          enabled: false,
          publishableKey: '',
          secretKey: '',
          testMode: false
        },
        flutterwave: {
          enabled: false,
          publicKey: '',
          secretKey: '',
          testMode: true
        },
        bankTransfer: {
          enabled: false,
          bankName: '',
          accountNumber: '',
          accountName: ''
        }
      },
      userRolePaymentAccess: {
        teachers: {
          paystack: false,
          stripe: false,
          flutterwave: false,
          bankTransfer: false
        },
        students: {
          paystack: false,
          stripe: false,
          flutterwave: false,
          bankTransfer: false
        },
        parents: {
          paystack: false,
          stripe: false,
          flutterwave: false,
          bankTransfer: false
        }
      },
      feeStructure: {
        categories: [],
        paymentPlans: {
          fullPayment: false,
          twoInstallments: false,
          threeInstallments: false
        }
      },
      discountRules: {
        siblingDiscount: {
          enabled: false,
          secondChild: 0,
          thirdChild: 0
        }
      },
      classLevels: [
        { id: 1, name: 'Grade 1' },
        { id: 2, name: 'Grade 2' },
        { id: 3, name: 'Grade 3' }
      ],
      subjects: [
        { id: 1, name: 'Mathematics' },
        { id: 2, name: 'English' },
        { id: 3, name: 'Science' }
      ],
      sessions: [
        { id: 1, name: '2025/2026', terms: ['First Term', 'Second Term', 'Third Term'] }
      ],
      grading: {
        grades: [
          { letter: 'A', min: 70, max: 100 },
          { letter: 'B', min: 60, max: 69 },
          { letter: 'C', min: 50, max: 59 },
          { letter: 'D', min: 45, max: 49 },
          { letter: 'E', min: 40, max: 44 },
          { letter: 'F', min: 0, max: 39 }
        ],
        passMark: 40
      },
      markingScheme: {
        continuousAssessment: 30,
        examination: 70,
        components: [
          { name: 'Classwork', weight: 10, color: '#3B82F6' },
          { name: 'Homework', weight: 10, color: '#10B981' },
          { name: 'Projects', weight: 10, color: '#F59E0B' }
        ]
      },
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
        welcomeEmail: {
          subject: 'Welcome to Springfield Elementary School',
          content: 'Welcome to our school!',
          active: true
        },
        resultReleased: {
          subject: 'Academic Results Available',
          content: 'Your results are now available.',
          active: true
        },
        absentNotice: {
          subject: 'Absence Notice',
          content: 'Your child was absent today.',
          active: true
        },
        feeReminder: {
          subject: 'Fee Payment Reminder',
          content: 'Please pay your fees.',
          active: true
        }
      },
      chatSystem: {
        enabled: true,
        adminToTeacher: {
          enabled: true,
          allowFileSharing: true,
          maxFileSize: 10,
          allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
          moderationEnabled: false
        },
        teacherToParent: {
          enabled: true,
          allowFileSharing: true,
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'jpg', 'png'],
          moderationEnabled: true,
          requireApproval: false
        },
        teacherToStudent: {
          enabled: false,
          allowFileSharing: false,
          maxFileSize: 2,
          allowedFileTypes: ['pdf'],
          moderationEnabled: true,
          requireApproval: true
        },
        parentToParent: {
          enabled: false,
          allowFileSharing: false,
          moderationEnabled: true,
          requireApproval: true
        },
        moderation: {
          enabled: true,
          profanityFilter: true,
          keywordBlacklist: ['inappropriate', 'bad_word_1', 'bad_word_2'],
          autoModeration: true,
          flaggedContentAction: 'hide',
          moderators: ['admin', 'principal'],
          businessHoursOnly: false,
          businessHours: {
            start: '08:00',
            end: '16:00'
          }
        }
      }
    };
  }
}

export default new SettingsService();