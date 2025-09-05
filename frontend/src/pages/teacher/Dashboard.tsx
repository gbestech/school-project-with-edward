import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
import TeacherDashboardContent from '@/components/dashboards/teacher/TeacherDashboardContent';
import { TeacherUserData } from '@/types/types';
import TeacherDashboardService from '@/services/TeacherDashboardService';

const TeacherDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('🔍 TeacherDashboard - Component mounted');
  console.log('🔍 TeacherDashboard - Auth state:', { isAuthenticated, isLoading, hasUser: !!user });



  useEffect(() => {
    console.log('🔍 TeacherDashboard - useEffect triggered');
    console.log('🔍 TeacherDashboard - useEffect state:', { isLoading, isAuthenticated, hasUser: !!user, userRole: user?.role });
    
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log('🔍 TeacherDashboard - Not authenticated or no user, redirecting to login');
        navigate('/teacher-login');
        return;
      }

      // Check if user is a teacher
      if (user.role !== 'teacher') {
        console.log('🔍 TeacherDashboard - User is not a teacher, redirecting to home');
        navigate('/');
        return;
      }

      console.log('🔍 TeacherDashboard - User is authenticated teacher, loading dashboard data');
      // Load teacher dashboard data
      loadDashboardData();
    } else {
      console.log('🔍 TeacherDashboard - Still loading auth state');
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Log the user data structure
      console.log('🔍 Teacher Dashboard - User data:', user);
      console.log('🔍 Teacher Dashboard - User role:', user?.role);
      console.log('🔍 Teacher Dashboard - Teacher data:', (user as TeacherUserData)?.teacher_data);
      console.log('🔍 Teacher Dashboard - User profile:', (user as any)?.profile);
      
      // Get teacher ID using the new method
      const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
      
      console.log('🔍 Teacher Dashboard - Found teacher ID:', teacherId);
      
      if (!teacherId) {
        console.error('🔍 Teacher Dashboard - No teacher ID found!');
        throw new Error('Teacher ID not found. Please ensure your teacher profile is properly set up.');
      }

      console.log('🔍 Teacher Dashboard - About to fetch dashboard data for teacher ID:', teacherId);
      
      // Fetch comprehensive dashboard data from the database
      const [data, teacherProfile] = await Promise.all([
        TeacherDashboardService.getTeacherDashboardData(teacherId),
        TeacherDashboardService.getTeacherProfile(teacherId)
      ]);
      
      console.log('🔍 Teacher Dashboard - Dashboard data received:', data);
      console.log('🔍 Teacher Dashboard - Stats object:', data.stats);
      console.log('🔍 Teacher Dashboard - Classes array:', data.classes);
      console.log('🔍 Teacher Dashboard - Subjects array:', data.subjects);
      console.log('🔍 Teacher Dashboard - Teacher profile received:', teacherProfile);
      
      // Combine with user data and teacher profile
      const completeData = {
        teacher: {
          ...user,
          teacher_data: teacherProfile || (user as TeacherUserData)?.teacher_data
        } as TeacherUserData,
        ...data
      };
      
      console.log('🔍 Teacher Dashboard - Complete data set:', completeData);
      
      // Ensure data is safe before setting state
      if (completeData && typeof completeData === 'object') {
        setDashboardData(completeData);
      } else {
        console.error('🔍 Teacher Dashboard - Invalid data received:', completeData);
        setDashboardData({
          teacher: user as TeacherUserData,
          stats: {
            totalStudents: 0,
            totalClasses: 0,
            totalSubjects: 0,
            attendanceRate: 0,
            pendingExams: 0,
            unreadMessages: 0,
            upcomingLessons: 0,
            recentResults: 0
          },
          activities: [],
          events: [],
          classes: [],
          subjects: []
        });
      }
    } catch (error) {
      console.error('Error loading teacher dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      
      // Fallback to mock data if API fails
      const mockData = {
        teacher: user as TeacherUserData,
        stats: {
          totalStudents: 0,
          totalClasses: 0,
          totalSubjects: 0,
          attendanceRate: 0,
          pendingExams: 0,
          unreadMessages: 0,
          upcomingLessons: 0,
          recentResults: 0
        },
        activities: [],
        events: [],
        classes: [],
        subjects: []
      };
      
      setDashboardData(mockData);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-white/70 text-sm">Loading Teacher Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'teacher') {
    return null; // Will redirect
  }

  // Don't render until we have data or an error
  if (!dashboardData && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-white/70 text-sm">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  return (
    <TeacherDashboardLayout>
      <TeacherDashboardContent 
        dashboardData={dashboardData}
        onRefresh={loadDashboardData}
        error={error}
      />
    </TeacherDashboardLayout>
  );
};

export default TeacherDashboard;