
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
  /**
   * School Settings Methods
   */
  
  /**
   * Fetch current school settings
   */
  async getSettings(): Promise<SchoolSettings> {
    try {
      console.log('Making API call to school-settings/school-settings/');
      const response = await api.get('school-settings/school-settings/');
      console.log('Raw API response:', response);
      
      // Transform the response to match the frontend interface
      const transformedSettings: SchoolSettings = {
        site_name: response.site_name || response.school_name || 'EduAdmin Pro',
        school_name: response.school_name || 'Springfield Elementary School',
        address: response.address || response.school_address || '',
        phone: response.phone || response.school_phone || '',
        email: response.email || response.school_email || '',
        logo: response.logo || response.logo_url || '',
        favicon: response.favicon || response.favicon_url || '',
        academicYearStart: response.academic_year_start || '',
        academicYearEnd: response.academic_year_end || '',
        motto: response.motto || response.school_motto || 'Excellence in Education',
        timezone: response.timezone || 'UTC-5',
        dateFormat: response.date_format || 'dd/mm/yyyy',
        language: response.language || 'English',
        theme: response.theme || 'light',
        primaryColor: response.primary_color || '#3B82F6',
        secondaryColor: response.secondary_color || '#6366F1',
        fontFamily: response.typography || 'Inter',
        fontSize: 'medium',
        notifications: {
          email: {
            enabled: response.notifications_enabled || false,
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
        paymentGateways: {
          paystack: {
            enabled: false,
            publicKey: '',
            secretKey: '',
            testMode: true,
          },
          stripe: {
            enabled: false,
            publishableKey: '',
            secretKey: '',
            testMode: true,
          },
          flutterwave: {
            enabled: false,
            publicKey: '',
            secretKey: '',
            testMode: true,
          },
          bankTransfer: {
            enabled: false,
            bankName: '',
            accountNumber: '',
            accountName: '',
          },
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
        messageTemplates: {
          welcomeEmail: { subject: '', content: '', active: false },
          resultReleased: { subject: '', content: '', active: false },
          absentNotice: { subject: '', content: '', active: false },
          feeReminder: { subject: '', content: '', active: false }
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
            keywordBlacklist: [],
            autoModeration: true,
            flaggedContentAction: 'hide',
            moderators: [],
            businessHoursOnly: false,
            businessHours: { start: '08:00', end: '16:00' }
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
      };
      
      console.log('Transformed settings:', transformedSettings);
      return transformedSettings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Return default settings instead of throwing error
      return this.getDefaultSettings();
    }
  }

  /**
   * Update school settings
   */
  async updateSettings(settings: Partial<SchoolSettings>): Promise<SchoolSettings> {
    try {
      const response = await api.put('school-settings/school-settings/', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update school settings');
    }
  }

  /**
   * Communication Settings Methods
   */

  /**
   * Get communication settings
   */
  async getCommunicationSettings(): Promise<CommunicationSettings> {
    try {
      const response = await api.get('communication-settings/');
      return response;
    } catch (error) {
      console.error('Error fetching communication settings:', error);
      throw new Error('Failed to fetch communication settings');
    }
  }

  /**
   * Update communication settings
   */
  async updateCommunicationSettings(settings: Partial<CommunicationSettings>): Promise<CommunicationSettings> {
    try {
      const response = await api.put('school-settings/communication-settings/', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating communication settings:', error);
      throw new Error('Failed to update communication settings');
    }
  }

  /**
   * Payment Gateway Testing Methods
   */

  /**
   * Test payment gateway connection
   */
  async testPaymentGateway(gateway: string, credentials: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`school-settings/payment-gateways/${gateway}/test/`, credentials);
      return response;
    } catch (error) {
      console.error(`Error testing ${gateway} connection:`, error);
      throw new Error(`Failed to test ${gateway} connection`);
    }
  }

  /**
   * Notification Testing Methods
   */

  /**
   * Test email provider connection
   */
  async testEmailConnection(emailConfig: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('notifications/email/test/', emailConfig);
      return response;
    } catch (error) {
      console.error('Error testing email connection:', error);
      throw new Error('Failed to test email connection');
    }
  }

  /**
   * Test SMS provider connection
   */
  async testSMSConnection(smsConfig: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('notifications/sms/test/', smsConfig);
      return response;
    } catch (error) {
      console.error('Error testing SMS connection:', error);
      throw new Error('Failed to test SMS connection');
    }
  }

  /**
   * Test Brevo email connection
   */
  async testBrevoConnection(brevoConfig: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('notifications/brevo/test/', brevoConfig);
      return response;
    } catch (error) {
      console.error('Error testing Brevo connection:', error);
      throw new Error('Failed to test Brevo connection');
    }
  }

  /**
   * Test Twilio SMS connection
   */
  async testTwilioConnection(twilioConfig: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('notifications/twilio/test/', twilioConfig);
      return response;
    } catch (error) {
      console.error('Error testing Twilio connection:', error);
      throw new Error('Failed to test Twilio connection');
    }
  }

  /**
   * Send test email via Brevo
   */
  async sendTestEmail(emailData: { to: string; subject: string; content: string }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('notifications/brevo/send-test/', emailData);
      return response;
    } catch (error) {
      console.error('Error sending test email:', error);
      throw new Error('Failed to send test email');
    }
  }

  /**
   * Send test SMS via Twilio
   */
  async sendTestSMS(smsData: { to: string; message: string }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('notifications/twilio/send-test/', smsData);
      return response;
    } catch (error) {
      console.error('Error sending test SMS:', error);
      throw new Error('Failed to send test SMS');
    }
  }

  /**
   * File Upload Methods
   */

  /**
   * Upload school logo
   */
  async uploadLogo(file: File): Promise<{ logoUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/school-settings/school-settings/upload-logo/`, {   
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw new Error('Failed to upload logo');
    }
  }

  /**
   * Upload school favicon
   */
  async uploadFavicon(file: File): Promise<{ faviconUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/school-settings/school-settings/upload-favicon`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload favicon');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading favicon:', error);
      throw new Error('Failed to upload favicon');
    }
  }

  /**
   * Announcements Methods
   */

  /**
   * Get all announcements
   */
  async getAnnouncements(filters?: {
    target_audience?: string;
    is_active?: boolean;
    priority?: string;
  }): Promise<SchoolAnnouncement[]> {
    try {
      let url = 'announcements/';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.target_audience) params.append('target_audience', filters.target_audience);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
        if (filters.priority) params.append('priority', filters.priority);
        if (params.toString()) url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  }

  /**
   * Get single announcement
   */
  async getAnnouncement(id: string): Promise<SchoolAnnouncement> {
    const response = await api.get(`school-settings/announcements/${id}/`);
    return response.data;
  }

  /**
   * Create announcement
   */
  async createAnnouncement(data: AnnouncementCreateUpdate): Promise<SchoolAnnouncement> {
    const response = await api.post('school-settings/announcements/', data);
    return response.data;
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(id: string, data: Partial<AnnouncementCreateUpdate>): Promise<SchoolAnnouncement> {
    const response = await api.put(`announcements/${id}/`, data);
    return response.data;
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id: string): Promise<void> {
    await api.delete(`announcements/${id}/`);
  }

  /**
   * Permissions Methods
   */

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<Permission[]> {
    try {
      const response = await api.get('permissions/');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  }

  /**
   * Get single permission
   */
  async getPermission(id: string): Promise<Permission> {
    const response = await api.get(`permissions/${id}/`);
    return response.data;
  }

  /**
   * Roles Methods
   */

  /**
   * Get all roles
   */
  async getRoles(filters?: { is_active?: boolean }): Promise<Role[]> {
    try {
      let url = 'roles/';
      if (filters?.is_active !== undefined) {
        url += `?is_active=${filters.is_active}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  /**
   * Get single role
   */
  async getRole(id: string): Promise<Role> {
    const response = await api.get(`roles/${id}/`);
    return response.data;
  }

  /**
   * Create role
   */
  async createRole(data: RoleCreateUpdate): Promise<Role> {
    const response = await api.post('roles/', data);
    return response.data;
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: Partial<RoleCreateUpdate>): Promise<Role> {
    const response = await api.put(`roles/${id}/`, data);
    return response.data;
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<void> {
    await api.delete(`roles/${id}/`);
  }

  /**
   * User Roles Methods
   */

  /**
   * Get user roles
   */
  async getUserRoles(filters?: { 
    user?: string; 
    role?: string; 
    is_active?: boolean; 
  }): Promise<UserRole[]> {
    try {
      let url = 'user-roles/';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.user) params.append('user', filters.user);
        if (filters.role) params.append('role', filters.role);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
        if (params.toString()) url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  /**
   * Get single user role
   */
  async getUserRole(id: string): Promise<UserRole> {
    const response = await api.get(`user-roles/${id}/`);
    return response.data;
  }

  /**
   * Create user role assignment
   */
  async createUserRole(data: UserRoleCreateUpdate): Promise<UserRole> {
    const response = await api.post('user-roles/', data);
    return response.data;
  }

  /**
   * Update user role
   */
  async updateUserRole(id: string, data: Partial<UserRoleCreateUpdate>): Promise<UserRole> {
    const response = await api.put(`user-roles/${id}/`, data);
    return response.data;
  }

  /**
   * Delete user role assignment
   */
  async deleteUserRole(id: string): Promise<void> {
    await api.delete(`user-roles/${id}/`);
  }

  /**
   * Get default settings (private method)
   */
  private getDefaultSettings(): SchoolSettings {
    return {
      site_name: 'EduAdmin Pro',
      school_name: 'Springfield Elementary School',
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
        { id: 1, name: '2023/2024', terms: ['First Term', 'Second Term', 'Third Term'] }
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