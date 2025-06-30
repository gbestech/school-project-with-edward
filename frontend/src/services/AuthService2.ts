// AuthService.ts
interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  // Add other user properties as needed
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  message?: string;
}

export class AuthService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    this.authToken = this.getStoredToken();
  }

  // Get stored token from localStorage
  private getStoredToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      return null;
    }
  }

  // Store token in localStorage
  private storeToken(token: string): void {
    try {
      localStorage.setItem('auth_token', token);
      this.authToken = token;
    } catch (error) {
      console.warn('Failed to store token in localStorage:', error);
    }
  }

  // Remove token from localStorage
  private removeToken(): void {
    try {
      localStorage.removeItem('auth_token');
      this.authToken = null;
    } catch (error) {
      console.warn('Failed to remove token from localStorage:', error);
    }
  }

  // Get current auth token
  getAuthToken(): string | null {
    return this.authToken;
  }

  // Set authorization headers
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Handle API response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data,
          message: data.message || 'Operation successful',
        };
      } else {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          this.removeToken();
        }
        
        return {
          success: false,
          errors: data.errors || { general: data.message || 'Operation failed' },
          message: data.message || 'Operation failed',
        };
      }
    } catch (error) {
      console.error('API response error:', error);
      return {
        success: false,
        errors: { general: 'Invalid response from server' },
        message: 'Invalid response from server',
      };
    }
  }

  // Google Sign-in
  async googleSignIn(accessToken: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/google/signin/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
      });

      const result = await this.handleResponse<{ user: User; token: string }>(response);
      
      // Store token if sign-in was successful
      if (result.success && result.data?.token) {
        this.storeToken(result.data.token);
      }
      
      return result;
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        errors: { general: 'Network error occurred during Google sign-in' },
        message: 'Network error occurred during Google sign-in',
      };
    }
  }

  // Google Sign-up
  async googleSignUp(
    accessToken: string, 
    additionalData?: { role?: string; [key: string]: any }
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/google/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          access_token: accessToken,
          ...additionalData 
        }),
      });

      const result = await this.handleResponse<{ user: User; token: string }>(response);
      
      // Store token if sign-up was successful
      if (result.success && result.data?.token) {
        this.storeToken(result.data.token);
      }
      
      return result;
    } catch (error) {
      console.error('Google sign-up error:', error);
      return {
        success: false,
        errors: { general: 'Network error occurred during Google sign-up' },
        message: 'Network error occurred during Google sign-up',
      };
    }
  }

  // Regular email/password sign-in
  async signIn(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/signin/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await this.handleResponse<{ user: User; token: string }>(response);
      
      if (result.success && result.data?.token) {
        this.storeToken(result.data.token);
      }
      
      return result;
    } catch (error) {
      console.error('Sign-in error:', error);
      return {
        success: false,
        errors: { general: 'Network error occurred during sign-in' },
        message: 'Network error occurred during sign-in',
      };
    }
  }

  // Regular email/password sign-up
  async signUp(userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
    [key: string]: any;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await this.handleResponse<{ user: User; token: string }>(response);
      
      if (result.success && result.data?.token) {
        this.storeToken(result.data.token);
      }
      
      return result;
    } catch (error) {
      console.error('Sign-up error:', error);
      return {
        success: false,
        errors: { general: 'Network error occurred during sign-up' },
        message: 'Network error occurred during sign-up',
      };
    }
  }

  // Sign out
  async signOut(): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/signout/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<void>(response);
      
      // Remove token regardless of API response
      this.removeToken();
      
      return result;
    } catch (error) {
      console.error('Sign-out error:', error);
      // Still remove token on error
      this.removeToken();
      return {
        success: false,
        errors: { general: 'Network error occurred during sign-out' },
        message: 'Network error occurred during sign-out',
      };
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/me/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<User>(response);
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        errors: { general: 'Network error occurred while fetching user data' },
        message: 'Network error occurred while fetching user data',
      };
    }
  }

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<{ token: string }>(response);
      
      if (result.success && result.data?.token) {
        this.storeToken(result.data.token);
      }
      
      return result;
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        errors: { general: 'Network error occurred while refreshing token' },
        message: 'Network error occurred while refreshing token',
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return await this.handleResponse<void>(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        errors: { general: 'Network error occurred while sending reset email' },
        message: 'Network error occurred while sending reset email',
      };
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseURL}/auth/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword }),
      });

      return await this.handleResponse<void>(response);
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        errors: { general: 'Network error occurred while resetting password' },
        message: 'Network error occurred while resetting password',
      };
    }
  }
}