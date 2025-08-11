
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { CustomUser, LoginCredentials, UserProfile, FullUserData, StudentUserData, TeacherUserData, ParentUserData } from '@/types/types';
import { UserRole, UserVerificationStatus, UserContactInfo } from '@/types/types';
import axios, { AxiosError } from 'axios';
import api from '@/services/api';






// Helper function to clear auth data
const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('userProfile');
  console.log('Auth data cleared');
};

// Helper function to map server role to enum
const mapServerRoleToEnum = (rawRole: any): UserRole => {
  if (!rawRole) {
    throw new Error('No role provided by server');
  }

  const roleString = rawRole.toString().toUpperCase();
  const roleMapping: { [key: string]: UserRole } = {
    'ADMIN': UserRole.ADMIN,
    'TEACHER': UserRole.TEACHER,
    'STUDENT': UserRole.STUDENT,
    'PARENT': UserRole.PARENT || UserRole.ADMIN, // fallback if PARENT doesn't exist
  };

  const finalRole = roleMapping[roleString];
  if (!finalRole) {
    throw new Error(`Invalid role received: ${rawRole}. Expected one of: ${Object.values(UserRole).join(', ')}`);
  }

  return finalRole;
};

interface AuthContextType {
  user: FullUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<FullUserData | undefined>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<FullUserData>) => void;
  // Profile management functions
  fetchUserProfile: () => Promise<UserProfile | null>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile | null>;
  uploadProfilePicture: (file: File) => Promise<string | null>;
  fetchVerificationStatus: () => Promise<UserVerificationStatus | null>;
  fetchContactInfo: () => Promise<UserContactInfo | null>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ✅ FIXED: Initialize auth state without making API calls immediately
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Token in localStorage at checkAuth:", localStorage.getItem('authToken'));

        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        console.log('Auth check:', { 
          hasToken: !!token, 
          hasUserData: !!userData 
        });

        if (token && userData) {
          try {
            const parsedUser: FullUserData = JSON.parse(userData);
            setUser(parsedUser);
            
            // Only verify token if we have both token and user data
            console.log('Verifying token validity...');

            await api.get('/api/profiles/me/');

            console.log('Token validation successful');
            
            // Optionally refresh user data in background
            refreshUserData().catch(console.warn);
          } catch (error) {
            console.warn('Token validation failed, clearing auth data:', error);
            clearAuthData();
            setUser(null);
          }
        } else {
          console.log('No auth data found');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuthData();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ✅ FIXED: Enhanced login function with better error handling
  const login = async (credentials: LoginCredentials): Promise<FullUserData | undefined> => {
  setIsLoading(true);

  try {
    console.log('Attempting login with:', { username: credentials.username });

    const loginData = {
      username: credentials.username,
      password: credentials.password,
    };

    console.log('Login data prepared:', loginData);
    
    // Use the custom JWT authentication endpoint
    const response = await api.post('/api/auth/login/', loginData);
    console.log('Login response received:', {
      hasUser: !!response.user,
      hasAccessToken: !!response.access,
      hasKey: !!response.key,
      keys: Object.keys(response)
    });

    // Extract tokens - handle JWT format
    let token: string | undefined;
    let refreshToken: string | undefined;

    if ('access' in response) {
      token = response.access;
      refreshToken = response.refresh;
    } else if ('access_token' in response) {
      token = response.access_token;
      refreshToken = response.refresh_token;
    } else if ('key' in response) {
      token = response.key;
    }

    if (!token) {
      console.error('No token in response:', response.data);
      throw new Error('No authentication token received from server');
    }

    localStorage.setItem('authToken', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    console.log('Tokens stored, fetching user data...');

    let userData: FullUserData;
    let role: UserRole;
    let rawUserData: any;

    if (response.user) {
      rawUserData = response;
      role = mapServerRoleToEnum(rawUserData.user.role || rawUserData.role);
    } else {
      console.log('No user data in login response, fetching from profile...');
      const profileResponse = await api.get('/api/profiles/me/');
      rawUserData = profileResponse;
      role = mapServerRoleToEnum(rawUserData.role || rawUserData.user?.role);
    }

    console.log('User role determined:', role);

    switch (role) {
      case UserRole.STUDENT:
        userData = {
          id: rawUserData.user?.id || rawUserData.id,
          email: rawUserData.user?.email || rawUserData.email,
          first_name: rawUserData.user?.first_name || rawUserData.first_name || '',
          last_name: rawUserData.user?.last_name || rawUserData.last_name || '',
          role: UserRole.STUDENT,
          student_data: rawUserData.student_data || {},
        };
        break;
      case UserRole.TEACHER:
        userData = {
          id: rawUserData.user?.id || rawUserData.id,
          email: rawUserData.user?.email || rawUserData.email,
          first_name: rawUserData.user?.first_name || rawUserData.first_name || '',
          last_name: rawUserData.user?.last_name || rawUserData.last_name || '',
          role: UserRole.TEACHER,
          teacher_data: rawUserData.teacher_data || {},
        };
        break;
      case UserRole.ADMIN:
        userData = {
          id: rawUserData.user?.id || rawUserData.id,
          email: rawUserData.user?.email || rawUserData.email,
          first_name: rawUserData.user?.first_name || rawUserData.first_name || '',
          last_name: rawUserData.user?.last_name || rawUserData.last_name || '',
          role: UserRole.ADMIN,
        };
        break;
      case UserRole.PARENT:
        userData = {
          id: rawUserData.user?.id || rawUserData.id,
          email: rawUserData.user?.email || rawUserData.email,
          first_name: rawUserData.user?.first_name || rawUserData.first_name || '',
          last_name: rawUserData.user?.last_name || rawUserData.last_name || '',
          role: UserRole.PARENT,
          parent_data: rawUserData.parent_data || {},
        };
        break;
      default:
        throw new Error(`Unsupported role: ${role}`);
    }

    try {
      console.log('Fetching additional profile data...');
      // Use correct endpoints based on actual backend URL structure
      const [profileData, verificationStatus, contactInfo] = await Promise.allSettled([
        api.get('/api/profiles/me/'),
        api.get('/api/profiles/verification-status/'),
        api.get('/api/profiles/contact-info/')
      ]);

      if (profileData.status === 'fulfilled') {
        userData.profile = profileData.value;
      }
      if (verificationStatus.status === 'fulfilled') {
        userData.verification_status = verificationStatus.value;
      }
      if (contactInfo.status === 'fulfilled') {
        userData.contact_info = contactInfo.value;
      }
    } catch (error) {
      console.warn('Some profile data could not be fetched:', error);
    }

    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);

    console.log('✅ Login successful, user state updated');
    return userData; // ✅ FIXED: Return actual user data
  } catch (error) {
    console.error('Login failed:', error);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    if (axios.isAxiosError(error)) {
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
    }
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  // ✅ Enhanced logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token && refreshToken) {
        try {
          // Send the refresh token as required by the backend
          await api.post('/api/auth/logout/', {
            refresh: refreshToken
          });
          console.log('Server logout successful');
        } catch (error) {
          console.warn('Server logout failed, continuing with local logout:', error);
        }
      }

      clearAuthData();
      setUser(null);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userUpdate: Partial<FullUserData>): void => {
    if (!user) return;

    const updatedRole = userUpdate.role || user.role;
    let updatedUser: FullUserData;

    switch (updatedRole) {
      case UserRole.STUDENT: {
        const current = user.role === UserRole.STUDENT ? user : { ...user, student_data: {} };
        updatedUser = {
          ...current,
          ...userUpdate,
          role: UserRole.STUDENT,
          student_data: {
            ...(current as any).student_data,
            ...(userUpdate as any).student_data,
          },
        };
        break;
      }

      case UserRole.TEACHER: {
        const current = user.role === UserRole.TEACHER ? user : { ...user, teacher_data: {} };
        updatedUser = {
          ...current,
          ...userUpdate,
          role: UserRole.TEACHER,
          teacher_data: {
            ...(current as any).teacher_data,
            ...(userUpdate as any).teacher_data,
          },
        };
        break;
      }

      case UserRole.PARENT: {
        const current = user.role === UserRole.PARENT ? user : { ...user, parent_data: {} };
        updatedUser = {
          ...current,
          ...userUpdate,
          role: UserRole.PARENT,
          parent_data: {
            ...(current as any).parent_data,
            ...(userUpdate as any).parent_data,
          },
        };
        break;
      }

      case UserRole.ADMIN: {
        updatedUser = {
          ...user,
          ...userUpdate,
          role: UserRole.ADMIN,
        };
        break;
      }

      default:
        throw new Error(`Unsupported role: ${updatedRole}`);
    }

    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  // ✅ Fetch user profile
  const fetchUserProfile = async (): Promise<UserProfile | null> => {
    try {
      const response = await api.get('/api/profiles/me/');
      const profile = response;
      
      if (user) {
        const updatedUser = { ...user, profile };
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      return profile;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  };

  // ✅ Update user profile
  const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      const response = await api.patch('/api/profiles/update_preferences/', profileData);
      const updatedProfile = response;
      
      if (user) {
        const updatedUser = { ...user, profile: updatedProfile };
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return null;
    }
  };

  // ✅ Upload profile picture
  const uploadProfilePicture = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('profile_image', file);
      
      const response = await api.post('/api/profiles/upload_profile_picture/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const profilePictureUrl = response.profile_picture_url;
      
      // Update user state with new profile picture
      if (user && user.profile) {
        const updatedUser = {
          ...user,
          profile: {
            ...user.profile,
            profile_image_url: profilePictureUrl,
          },
        };
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      return profilePictureUrl;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      return null;
    }
  };

  // ✅ Fetch verification status
  const fetchVerificationStatus = async (): Promise<UserVerificationStatus | null> => {
    try {
      const response = await api.get('/api/profiles/verification_status/');
      const verificationStatus = response;
      
      if (user) {
        const updatedUser = { ...user, verification_status: verificationStatus };
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      return verificationStatus;
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
      return null;
    }
  };

  // ✅ Fetch contact info
  const fetchContactInfo = async (): Promise<UserContactInfo | null> => {
    try {
      const response = await api.get('/api/profiles/contact_info/');
      const contactInfo = response;
      
      if (user) {
        const updatedUser = { ...user, contact_info: contactInfo };
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      return contactInfo;
    } catch (error) {
      console.error('Failed to fetch contact info:', error);
      return null;
    }
  };

  // ✅ Refresh all user data
  const refreshUserData = async (): Promise<void> => {
    if (!user) return;

    try {
      const [profileData, verificationStatus, contactInfo] = await Promise.allSettled([
        api.get('/api/profiles/me/'),
        api.get('/api/profiles/verification-status/'),
        api.get('/api/profiles/contact-info/')
      ]);

      const updatedUser = { ...user };

      if (profileData.status === 'fulfilled') {
        updatedUser.profile = profileData.value.data;
      }
      if (verificationStatus.status === 'fulfilled') {
        updatedUser.verification_status = verificationStatus.value.data;
      }
      if (contactInfo.status === 'fulfilled') {
        updatedUser.contact_info = contactInfo.value.data;
      }

      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    updateUser,
    fetchUserProfile,
    updateUserProfile,
    uploadProfilePicture,
    fetchVerificationStatus,
    fetchContactInfo,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// ✅ Export the configured axios instance and types
export { api };