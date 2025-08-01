import api from './api';

export interface SchoolSettings {
  // General settings
  siteName: string;
  schoolName: string;
  address: string;
  contactInfo: string;
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

class SettingsService {
  private baseEndpoint = '/school-settings/';

  /**
   * Fetch current school settings
   */
  async getSettings(): Promise<SchoolSettings> {
    try {
      const response = await api.get(this.baseEndpoint);
      return response;
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Return default settings instead of throwing error
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): SchoolSettings {
    return {
      siteName: 'EduAdmin Pro',
      schoolName: 'Springfield Elementary School',
      address: '',
      contactInfo: '',
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
          secretKey: ''
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

  /**
   * Update school settings
   */
  async updateSettings(settings: Partial<SchoolSettings>): Promise<SchoolSettings> {
    try {
      const response = await api.put(this.baseEndpoint, settings);
      return response;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update school settings');
    }
  }

  /**
   * Test payment gateway connection
   */
  async testPaymentGateway(gateway: string, credentials: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/payment-gateways/${gateway}/test/`, credentials);
      return response;
    } catch (error) {
      console.error(`Error testing ${gateway} connection:`, error);
      throw new Error(`Failed to test ${gateway} connection`);
    }
  }

  /**
   * Test email provider connection
   */
  async testEmailConnection(emailConfig: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/notifications/email/test/', emailConfig);
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
      const response = await api.post('/notifications/sms/test/', smsConfig);
      return response;
    } catch (error) {
      console.error('Error testing SMS connection:', error);
      throw new Error('Failed to test SMS connection');
    }
  }

  /**
   * Upload school logo
   */
  async uploadLogo(file: File): Promise<{ logoUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${this.baseEndpoint}upload-logo/`, {
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
      formData.append('favicon', file);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${this.baseEndpoint}upload-favicon/`, {
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
}

export default new SettingsService(); 