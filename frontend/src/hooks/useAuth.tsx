
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { LoginCredentials, UserProfile, FullUserData} from '@/types/types';
import { UserRole, UserVerificationStatus, UserContactInfo } from '@/types/types';
import axios from 'axios';
import api from '@/services/api';






// Helper function to clear auth data
const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('userProfile');
  sessionStorage.clear(); // Clear all session storage
  console.log('Auth data cleared');
};

// Helper function to map server role to enum
const mapServerRoleToEnum = (rawRole: any): UserRole => {
  console.log('🔍 mapServerRoleToEnum: Raw role received:', rawRole);
  console.log('🔍 mapServerRoleToEnum: Raw role type:', typeof rawRole);
  
  if (!rawRole) {
    console.error('🔍 mapServerRoleToEnum: No role provided by server');
    throw new Error('No role provided by server');
  }

  const roleString = rawRole.toString().toUpperCase();
  console.log('🔍 mapServerRoleToEnum: Role string after toUpperCase:', roleString);
  
  const roleMapping: { [key: string]: UserRole } = {
    'ADMIN': UserRole.ADMIN,
    'TEACHER': UserRole.TEACHER,
    'STUDENT': UserRole.STUDENT,
    'PARENT': UserRole.PARENT,
  };

  console.log('🔍 mapServerRoleToEnum: Available role mappings:', Object.keys(roleMapping));
  
  const finalRole = roleMapping[roleString];
  console.log('🔍 mapServerRoleToEnum: Final mapped role:', finalRole);
  
  if (!finalRole) {
    console.error('🔍 mapServerRoleToEnum: Invalid role received:', rawRole);
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

  

const login = async (credentials: LoginCredentials): Promise<FullUserData | undefined> => {
  setIsLoading(true);

  try {
    console.log('🔐 Attempting login with:', { username: credentials.username });

    const loginData = {
      username: credentials.username,
      password: credentials.password,
    };
    
    // Call the Django login endpoint
    const response = await api.post('/api/auth/login/', loginData);
    
    console.log('🔍 Raw login response:', response);
    console.log('🔍 Response type:', typeof response);
    console.log('🔍 Response keys:', Object.keys(response));
    
    // Extract tokens from response
    const token = response.access;
    const refreshToken = response.refresh;

    if (!token) {
      console.error('❌ No access token in response');
      throw new Error('No authentication token received from server');
    }

    // Store tokens
    localStorage.setItem('authToken', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    console.log('✅ Tokens stored successfully');

    // Extract user data from response
    const rawUserData = response.user;
    
    if (!rawUserData) {
      console.error('❌ No user data in login response:', response);
      throw new Error('No user data received from server');
    }

    console.log('🔍 Raw user data:', rawUserData);
    console.log('🔍 User data keys:', Object.keys(rawUserData));
    console.log('🔍 User role from response:', rawUserData.role);

    // Extract and validate role
    const roleValue = rawUserData.role;
    
    if (!roleValue) {
      console.error('❌ No role in user data:', rawUserData);
      throw new Error('No role provided by server');
    }

    console.log('🔍 Role value before mapping:', roleValue);
    const role = mapServerRoleToEnum(roleValue);
    console.log('✅ Mapped role:', role);

    // Build userData object based on role
    let userData: FullUserData;

    const baseUserData = {
      id: rawUserData.id,
      email: rawUserData.email,
      first_name: rawUserData.first_name || '',
      last_name: rawUserData.last_name || '',
      is_superuser: rawUserData.is_superuser || false,
      is_staff: rawUserData.is_staff || false,
      is_active: rawUserData.is_active !== undefined ? rawUserData.is_active : true,
    };

    switch (role) {
      case UserRole.STUDENT:
        userData = {
          ...baseUserData,
          role: UserRole.STUDENT,
          student_data: rawUserData.student_data || {},
        };
        break;

      case UserRole.TEACHER:
        userData = {
          ...baseUserData,
          role: UserRole.TEACHER,
          teacher_data: rawUserData.teacher_data || {},
        };
        break;

      case UserRole.ADMIN:
        userData = {
          ...baseUserData,
          role: UserRole.ADMIN,
        };
        break;

      case UserRole.PARENT:
        userData = {
          ...baseUserData,
          role: UserRole.PARENT,
          parent_data: rawUserData.parent_data || {},
        };
        break;

      default:
        throw new Error(`Unsupported role: ${role}`);
    }

    console.log('✅ User data object created:', userData);

    // Fetch additional profile data (non-blocking, in background)
    Promise.allSettled([
      api.get('/api/profiles/me/'),
      api.get('/api/profiles/verification-status/'),
      api.get('/api/profiles/contact-info/')
    ]).then(([profileData, verificationStatus, contactInfo]) => {
      const updatedUser = { ...userData };
      let hasUpdates = false;

      if (profileData.status === 'fulfilled') {
        updatedUser.profile = profileData.value;
        hasUpdates = true;
      }
      if (verificationStatus.status === 'fulfilled') {
        updatedUser.verification_status = verificationStatus.value;
        hasUpdates = true;
      }
      if (contactInfo.status === 'fulfilled') {
        updatedUser.contact_info = contactInfo.value;
        hasUpdates = true;
      }

      if (hasUpdates) {
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        console.log('✅ Additional profile data loaded');
      }
    }).catch(error => {
      console.warn('⚠️ Could not fetch additional profile data:', error);
    });

    // Store initial user data and set state
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);

    console.log('✅ Login successful');
    console.log('✅ User role:', userData.role);
    console.log('✅ Returning user data');
    
    return userData;
    
  } catch (error) {
    console.error('❌ Login failed:', error);
    
    // Clear stored tokens on error
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    
    if (axios.isAxiosError(error)) {
      console.error('❌ Axios error response:', error.response?.data);
      console.error('❌ Axios error status:', error.response?.status);
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
      
      const response = await api.post('/profiles/profiles/upload_profile_picture/', formData);;
      
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
      const response = await api.get('/api/profiles/profiles/verification_status/');
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
      const response = await api.get('/api/profiles/profiles/contact_info/');
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