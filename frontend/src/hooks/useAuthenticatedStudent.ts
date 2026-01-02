import { useState, useEffect } from 'react';
import api from '@/services/api';

interface AuthenticatedStudentData {
  authenticatedStudentId: string | null;
  studentRecord: any | null;
  loading: boolean;
  error: string | null;
}

export const useAuthenticatedStudent = (): AuthenticatedStudentData => {
  const [authenticatedStudentId, setAuthenticatedStudentId] = useState<string | null>(null);
  const [studentRecord, setStudentRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthenticatedStudent = async () => {
      try {
        console.log('🔍 Fetching authenticated user...');
        const userResponse = await api.get('/api/dj-rest-auth/user/');
        
        const authUserId = userResponse.pk?.toString() || userResponse.id?.toString();
        
        if (!authUserId) {
          throw new Error('No user ID found in authentication response');
        }
        
        console.log('✅ Authenticated User ID:', authUserId);
        
        const studentsResponse = await api.get(`/api/students/students/?user=${authUserId}`);
        const students = Array.isArray(studentsResponse) 
          ? studentsResponse 
          : (studentsResponse.results || []);
        
        if (students.length > 0) {
          const studentRecord = students[0];
          const realStudentId = studentRecord.id.toString();
          
          console.log('✅ Found student record:', {
            userId: authUserId,
            studentId: realStudentId,
            studentName: studentRecord.full_name
          });
          
          setAuthenticatedStudentId(realStudentId);
          setStudentRecord(studentRecord);
        } else {
          throw new Error(`No student record found for user ID ${authUserId}`);
        }
      } catch (err: any) {
        console.error('❌ Error fetching authenticated student:', err);
        setError(err.message || 'Failed to fetch authenticated student');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthenticatedStudent();
  }, []);

  return { authenticatedStudentId, studentRecord, loading, error };
};