export interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher' | 'admin';
  phone?: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string>;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export interface SignupState {
  isLoading: boolean;
  user: User | null;
  token: string | null;
  errors: Record<string, string>;
  successMessage: string;
}

// API Service
export class AuthService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  async register(credentials: SignupCredentials): Promise<ApiResponse> {
  try {
    const payload = {
      first_name: credentials.firstName,
      last_name: credentials.lastName,
      email: credentials.email,
      password: credentials.password,
      confirm_password: credentials.confirmPassword,
      role: credentials.role,
      phone: credentials.phone,
      agree_to_terms: credentials.agreeToTerms,
      subscribe_newsletter: credentials.subscribeNewsletter,
    };

    const response = await fetch(`${this.baseUrl}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Registration failed',
        errors: data.errors || {},
      };
    }

    return {
      success: true,
      message: data.message || 'Account created successfully!',
      data: data.data,
    };
  } catch (error) {
    console.error('Registration API error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
      errors: {},
    };
  }
}


  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/check-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.error('Email check API error:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/send-verification/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Verification email sent' : 'Failed to send email'),
        data: data.data,
      };
    } catch (error) {
      console.error('Send verification email API error:', error);
      return {
        success: false,
        message: 'Failed to send verification email',
      };
    }
  }

  async resendVerification(email: string): Promise<ApiResponse> {
    return this.sendVerificationEmail(email);
  }
}