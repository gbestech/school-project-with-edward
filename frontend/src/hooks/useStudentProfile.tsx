import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface StudentProfile {
  id: string;
  full_name: string;
  short_name: string;
  email: string;
  gender: string;
  date_of_birth: string;
  age: number;
  education_level: string;
  education_level_display: string;
  student_class: string;
  student_class_display: string;
  is_nursery_student: boolean;
  is_primary_student: boolean;
  is_secondary_student: boolean;
  is_active: boolean;
  admission_date: string;
  parent_contact: string;
  emergency_contact: string;
  emergency_contacts: Array<{
    type: string;
    number: string;
    is_primary: boolean;
  }>;
  medical_conditions: string;
  special_requirements: string;
  parents: Array<{
    id: string;
    full_name: string;
    email: string;
    phone: string;
    relationship: string;
    is_primary_contact: boolean;
  }>;
  profile_picture: string;
  classroom: string;
  section_id: string;
  user_info: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    is_active: boolean;
    date_joined: string;
  };
  academic_info: {
    class: string;
    education_level: string;
    admission_date: string;
    registration_number: string;
    classroom: string;
  };
  contact_info: {
    parent_contact: string;
    emergency_contact: string;
  };
  medical_info: {
    medical_conditions: string;
    special_requirements: string;
  };
}

interface UseStudentProfileReturn {
  profile: StudentProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<StudentProfile>) => Promise<void>;
}

export const useStudentProfile = (): UseStudentProfileReturn => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/students/profile/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      console.error('Error fetching student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const updateProfile = async (data: Partial<StudentProfile>) => {
    if (!profile) return;

    try {
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/students/${profile.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      console.error('Error updating student profile:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [isAuthenticated, user]);

  return {
    profile,
    loading,
    error,
    refreshProfile,
    updateProfile,
  };
};





