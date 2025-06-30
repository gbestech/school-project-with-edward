// GoogleAuthService.ts
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  verified_email: boolean;
}

export interface GoogleAuthResponse {
  access_token: string;
  user: GoogleUser;
}

export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private gapi: any = null;
  private auth2: any = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<void> | null = null;

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  // Initialize Google API with improved error handling and caching
  async initialize(clientId: string): Promise<void> {
    // Return existing promise if already initializing
    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.gapi && this.auth2) {
      return Promise.resolve();
    }

    this.isInitializing = true;
    this.initPromise = new Promise((resolve, reject) => {
      // Check if Google API is already loaded
      if ((window as any).gapi) {
        this.gapi = (window as any).gapi;
        this.initializeAuth2(clientId, resolve, reject);
        return;
      }

      // Load Google API script
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.gapi = (window as any).gapi;
        this.initializeAuth2(clientId, resolve, reject);
      };
      
      script.onerror = () => {
        this.isInitializing = false;
        this.initPromise = null;
        reject(new Error('Failed to load Google API script'));
      };
      
      document.head.appendChild(script);
    });

    try {
      await this.initPromise;
      this.isInitializing = false;
    } catch (error) {
      this.isInitializing = false;
      this.initPromise = null;
      throw error;
    }
  }

  private initializeAuth2(clientId: string, resolve: () => void, reject: (error: any) => void): void {
    this.gapi.load('auth2', async () => {
      try {
        // Check if auth2 is already initialized
        if (this.gapi.auth2.getAuthInstance()) {
          this.auth2 = this.gapi.auth2.getAuthInstance();
          resolve();
          return;
        }

        this.auth2 = await this.gapi.auth2.init({
          client_id: clientId,
          scope: 'profile email',
          fetch_basic_profile: true,
          ux_mode: 'popup'
        });
        
        resolve();
      } catch (error) {
        console.error('Auth2 initialization failed:', error);
        reject(new Error('Failed to initialize Google Auth2'));
      }
    });
  }

  // Sign in with Google with improved error handling
  async signIn(): Promise<GoogleAuthResponse> {
    if (!this.auth2) {
      throw new Error('Google Auth not initialized. Call initialize() first.');
    }

    try {
      // Check if user is already signed in
      if (this.auth2.isSignedIn.get()) {
        const currentUser = this.auth2.currentUser.get();
        return this.formatUserResponse(currentUser);
      }

      // Perform sign in
      const googleUser = await this.auth2.signIn({
        prompt: 'select_account'
      });
      
      return this.formatUserResponse(googleUser);
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      // Handle specific error cases
      if (typeof error === 'object' && error !== null && 'error' in error) {
        const err = error as { error: string };
        if (err.error === 'popup_closed_by_user') {
          throw new Error('Sign-in was cancelled');
        } else if (err.error === 'access_denied') {
          throw new Error('Access denied by user');
        }
      }
      throw new Error('Google sign-in failed. Please try again.');
    }
  }

  // Format user response consistently
  private formatUserResponse(googleUser: any): GoogleAuthResponse {
    const profile = googleUser.getBasicProfile();
    const authResponse = googleUser.getAuthResponse();

    if (!profile || !authResponse) {
      throw new Error('Invalid Google user data received');
    }

    return {
      access_token: authResponse.access_token,
      user: {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        given_name: profile.getGivenName(),
        family_name: profile.getFamilyName(),
        picture: profile.getImageUrl(),
        verified_email: true
      }
    };
  }

  // Sign out with error handling
  async signOut(): Promise<void> {
    try {
      if (this.auth2 && this.auth2.isSignedIn.get()) {
        await this.auth2.signOut();
      }
    } catch (error) {
      console.error('Google sign-out error:', error);
      throw new Error('Failed to sign out from Google');
    }
  }

  // Check if user is signed in
  isSignedIn(): boolean {
    return this.auth2 ? this.auth2.isSignedIn.get() : false;
  }

  // Get current user if signed in
  getCurrentUser(): GoogleUser | null {
    if (!this.auth2 || !this.auth2.isSignedIn.get()) {
      return null;
    }

    try {
      const currentUser = this.auth2.currentUser.get();
      const profile = currentUser.getBasicProfile();
      
      return {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        given_name: profile.getGivenName(),
        family_name: profile.getFamilyName(),
        picture: profile.getImageUrl(),
        verified_email: true
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Disconnect user from the application
  async disconnect(): Promise<void> {
    try {
      if (this.auth2 && this.auth2.isSignedIn.get()) {
        await this.auth2.disconnect();
      }
    } catch (error) {
      console.error('Google disconnect error:', error);
      throw new Error('Failed to disconnect from Google');
    }
  }

  // Check if Google API is available
  isGoogleApiLoaded(): boolean {
    return !!(window as any).gapi;
  }

  // Get initialization status
  getInitializationStatus(): {
    isInitialized: boolean;
    isInitializing: boolean;
    isGoogleApiLoaded: boolean;
  } {
    return {
      isInitialized: !!(this.gapi && this.auth2),
      isInitializing: this.isInitializing,
      isGoogleApiLoaded: this.isGoogleApiLoaded()
    };
  }
}