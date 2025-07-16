
// ModernGoogleAuthService.ts - Using Google Identity Services
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

export class ModernGoogleAuthService {
  private static instance: ModernGoogleAuthService;
  private isInitialized: boolean = false;
 private clientId: string = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  static getInstance(): ModernGoogleAuthService {
    if (!ModernGoogleAuthService.instance) {
      ModernGoogleAuthService.instance = new ModernGoogleAuthService();
    }
    return ModernGoogleAuthService.instance;
  }

  async initialize(clientId: string): Promise<void> {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    this.clientId = clientId;

    return new Promise((resolve, reject) => {
      // Check if Google Identity Services is already loaded
      if ((window as any).google?.accounts?.id) {
        this.initializeGoogleIdentity(resolve, reject);
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Google Identity Services script loaded');
        this.initializeGoogleIdentity(resolve, reject);
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Identity Services script');
        reject(new Error('Failed to load Google Identity Services script'));
      };
      
      document.head.appendChild(script);
    });
  }

  private initializeGoogleIdentity(resolve: () => void, reject: (error: any) => void): void {
    try {
      const google = (window as any).google;
      
      if (!google?.accounts?.id) {
        throw new Error('Google Identity Services not available');
      }

      // Initialize Google Identity Services
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: false
      });

      this.isInitialized = true;
      console.log('Google Identity Services initialized successfully');
      resolve();
    } catch (error) {
      console.error('Google Identity Services initialization failed:', error);
      reject(error);
    }
  }

  private handleCredentialResponse(response: any): void {
    console.log('Credential response received:', response);
    // This will be called when using the One Tap flow
  }

  async signIn(): Promise<GoogleAuthResponse> {
    if (!this.isInitialized) {
      throw new Error('Google Auth not initialized. Call initialize() first.');
    }

    return new Promise((resolve, reject) => {
      const google = (window as any).google;
      
      if (!google?.accounts?.oauth2) {
        reject(new Error('Google OAuth2 not available'));
        return;
      }

      // Request access token
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'profile email',
        callback: async (response: any) => {
          console.log('Token response:', response);
          
          if (response.error) {
            reject(new Error(response.error));
            return;
          }

          try {
            // Get user info using the access token
            const userInfo = await this.fetchUserInfo(response.access_token);
            
            const authResponse: GoogleAuthResponse = {
              access_token: response.access_token,
              user: {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                given_name: userInfo.given_name,
                family_name: userInfo.family_name,
                picture: userInfo.picture,
                verified_email: userInfo.verified_email
              }
            };
            
            resolve(authResponse);
          } catch (error) {
            reject(error);
          }
        },
        error_callback: (error: any) => {
          console.error('Token client error:', error);
          reject(new Error('Failed to get access token'));
        }
      });

      // Request access token (this will show the popup)
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    });
  }

  private async fetchUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  }

  // Alternative method using popup
  async signInWithPopup(): Promise<GoogleAuthResponse> {
    if (!this.isInitialized) {
      throw new Error('Google Auth not initialized. Call initialize() first.');
    }

    return new Promise((_, reject) => {
      // Create a popup window
      const popup = window.open(
        '',
        'google-signin',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      // Build the OAuth URL
      const params = new URLSearchParams({
        client_id: this.clientId,
        redirect_uri: window.location.origin,
        response_type: 'code',
        scope: 'profile email',
        access_type: 'online',
        prompt: 'select_account'
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      popup.location.href = authUrl;

      // Monitor the popup
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Sign-in was cancelled'));
        }
      }, 1000);

      // Handle the callback (you'll need to implement this based on your setup)
      // This is a simplified version - you'll need proper callback handling
    });
  }

  // Check if Google Identity Services is available
  isGoogleIdentityLoaded(): boolean {
    return !!((window as any).google?.accounts?.id);
  }

  // Get initialization status
  getInitializationStatus(): {
    isInitialized: boolean;
    isGoogleIdentityLoaded: boolean;
    clientId: string;
  } {
    return {
      isInitialized: this.isInitialized,
      isGoogleIdentityLoaded: this.isGoogleIdentityLoaded(),
      clientId: this.clientId
    };
  }
}