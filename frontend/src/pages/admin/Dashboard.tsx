import React, { useState, useEffect, useCallback } from 'react';
import AdminDashboard from '@/components/dashboards/Admin';
import { useAdminAuth } from '@/services/AuthServiceAdmin';
import { 
  UserProfile, 
  UserVerificationStatus, 
  UserContactInfo, 
  CustomUser, 
  LoginCredentials,
  AdminUserManagement,
  UserCreationData,
  UserUpdateData,
  AdminDashboardStats, 
  AdminAuditLog,
  FullUserData,
  Student,
  Teacher,
  Parent,
  Gender,
  AttendanceData,
  FeeStatus,
  EmploymentStatus,
  StudentStatus,
  UserRole,
  Classroom,
  Message,
  DashboardStats,
  ChangeType
} from '@/types/types';

// Dashboard data interface
interface DashboardData {
  dashboardStats: DashboardStats | null;
  students: Student[] | null;
  teachers: Teacher[] | null;
  attendanceData: AttendanceData | null;
  classrooms: Classroom[] | null;
  messages: Message[] | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Admin methods interface - match what's actually available in AuthServiceAdmin
interface AdminMethods {
  getUsers: (params?: any) => Promise<any>;
  getDashboardStats: () => Promise<AdminDashboardStats>;
  getUserProfile: (userId: number) => Promise<UserProfile>;
  updateUserProfile?: (userId: number, data: any) => Promise<UserProfile>;
  createUser?: (userData: any) => Promise<any>;
  updateUser?: (userId: number, userData: any) => Promise<any>;
  deleteUser?: (userId: number) => Promise<void>;
  bulkUpdateUsers?: (updates: any[]) => Promise<void>;
  exportUsers?: (format: string) => Promise<Blob>;
  resetUserPassword?: (userId: number) => Promise<any>;
  suspendUser?: (userId: number, reason?: string) => Promise<void>;
  unsuspendUser?: (userId: number) => Promise<void>;
}

const Dashboard: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    logout, 
    isAdmin,
    getUsers,
    getDashboardStats,
    getUserProfile,
    updateUserProfile,
    createUser,
    updateUser,
    deleteUser,
    bulkUpdateUsers,
    exportUsers,
    resetUserPassword,
    suspendUser,
    unsuspendUser,
  } = useAdminAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    dashboardStats: null,
    students: null,
    teachers: null,
    attendanceData: null,
    classrooms: null,
    messages: null,
    userProfile: null,
    loading: true,
    error: null
  });

  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Helper functions that don't need to be in useCallback
  const fetchUserSpecification = async (userId: number) => {
    try {
      console.warn('getUserSpecification method not directly available from useAdminAuth. Simulating.');
      return null;
    } catch (error) {
      console.error('❌ Error fetching user specification:', error);
      return null;
    }
  };

  const fetchEnhancedUserProfile = async (userId: number) => {
    try {
      console.log(`🔍 Fetching enhanced profile for user ID: ${userId}`);
      
      const [profile, specification] = await Promise.allSettled([
        getUserProfile(userId),
        fetchUserSpecification(userId)
      ]);

      const userProfile = profile.status === 'fulfilled' ? profile.value : null;
      const userSpec = specification.status === 'fulfilled' ? specification.value : null;

      if (userProfile) {
        console.log('✅ Enhanced User Profile Data:', userProfile);
        console.log('- Specification:', userSpec);
        
        if (userSpec) {
          return {
            ...userProfile,
            specification: userSpec
          };
        }
      }

      return userProfile;
    } catch (error) {
      console.error('❌ Error fetching enhanced user profile:', error);
      throw error;
    }
  };

  const mapToStudentsEnhanced = async (adminUsers: AdminUserManagement[]): Promise<Student[]> => {
    console.log('🔄 Mapping students with enhanced data...');
    
    const students = await Promise.all(
      adminUsers
        .filter(user => user.user_data.role === UserRole.STUDENT)
        .map(async (user) => {
          if (user.user_data.role !== UserRole.STUDENT) {
            throw new Error('User is not a student');
          }
          
          const studentData = (user.user_data as any).student_data;
          
          let specification = null;
          if (typeof user.user_data.id === 'number') {
            try {
              specification = await fetchUserSpecification(user.user_data.id);
            } catch (error) {
              console.warn(`Failed to fetch specification for student ${user.user_data.id}:`, error);
            }
          }
          
          const student: Student = {
            id: studentData?.id || user.id,
            user: user.user_data,
            student_id: studentData?.student_id || `STU${user.id}`,
            gender: studentData?.gender || 'not_specified' as Gender,
            date_of_birth: studentData?.date_of_birth || new Date().toISOString(),
            admission_date: studentData?.admission_date || new Date().toISOString(),
            graduation_date: studentData?.graduation_date,
            current_grade_level: studentData?.current_grade_level || 'Grade 1',
            current_section: studentData?.current_section || 'A',
            section: studentData?.section || 'A',
            grade: studentData?.grade || '1',
            class: studentData?.class || '1A',
            roll_number: studentData?.roll_number || `R${user.id}`,
            academic_year: studentData?.academic_year || new Date().getFullYear().toString(),
            emergency_contact_name: studentData?.emergency_contact_name || '',
            emergency_contact_phone: studentData?.emergency_contact_phone || '',
            emergency_contact_relationship: studentData?.emergency_contact_relationship || '',
            guardian_name: studentData?.guardian_name || '',
            guardian_phone: studentData?.guardian_phone || '',
            guardian_email: studentData?.guardian_email || '',
            parent_contact: studentData?.parent_contact || '',
            emergency_contact: studentData?.emergency_contact || '',
            enrollment_status: studentData?.enrollment_status || 'active',
            status: studentData?.status || 'active' as StudentStatus,
            enrollment_date: studentData?.enrollment_date || new Date().toISOString(),
            address: studentData?.address || '',
            blood_group: studentData?.blood_group || '',
            medical_conditions: studentData?.medical_conditions || '',
            medical_info: studentData?.medical_info || '',
            allergies: studentData?.allergies || '',
            special_needs: studentData?.special_needs || '',
            previous_school: studentData?.previous_school || '',
            transfer_certificate: studentData?.transfer_certificate || '',
            fee_status: studentData?.fee_status || 'pending' as FeeStatus,
            transport_required: studentData?.transport_required || false,
            hostel_required: studentData?.hostel_required || false,
            extracurricular_activities: studentData?.extracurricular_activities || [],
            disciplinary_records: studentData?.disciplinary_records || [],
            attendance_percentage: studentData?.attendance_percentage || 0,
            full_name: `${user.user_data.first_name} ${user.user_data.last_name}`,
            age: studentData?.age || 0,
            years_enrolled: studentData?.years_enrolled || 0,
            created_at: user.user_data.created_at || new Date().toISOString(),
            updated_at: user.user_data.updated_at || new Date().toISOString()
          };
          
          return student;
        })
    );
    
    console.log(`✅ Mapped ${students.length} students with enhanced data`);
    return students;
  };

  const mapToTeachersEnhanced = async (adminUsers: AdminUserManagement[]): Promise<Teacher[]> => {
    console.log('🔄 Mapping teachers with enhanced data...');
    
    const teachers = await Promise.all(
      adminUsers
        .filter(user => user.user_data.role === UserRole.TEACHER)
        .map(async (user) => {
          if (user.user_data.role !== UserRole.TEACHER) {
            throw new Error('User is not a teacher');
          }
          
          const teacherData = (user.user_data as any).teacher_data;
          
          let specification = null;
          if (typeof user.user_data.id === 'number') {
            try {
              specification = await fetchUserSpecification(user.user_data.id);
            } catch (error) {
              console.warn(`Failed to fetch specification for teacher ${user.user_data.id}:`, error);
            }
          }
          
          const teacher: Teacher = {
            id: teacherData?.id || user.id,
            user: user.user_data,
            employee_id: teacherData?.employee_id || `EMP${user.id}`,
            phone_number: teacherData?.phone_number || '',
            contact_number: teacherData?.contact_number || '',
            address: teacherData?.address || '',
            hire_date: teacherData?.hire_date || new Date().toISOString(),
            employment_status: teacherData?.employment_status || 'active' as EmploymentStatus,
            qualifications: teacherData?.qualifications || ['Bachelor\'s Degree'],
            qualification: teacherData?.qualification || 'Bachelor\'s Degree',
            specializations: teacherData?.specializations || ['General'],
            teaching_subjects: teacherData?.teaching_subjects || ['General'],
            years_experience: teacherData?.years_experience || 0,
            experience_years: teacherData?.experience_years || 0,
            salary_grade: teacherData?.salary_grade || '',
            salary: teacherData?.salary || 0,
            department: teacherData?.department || '',
            subject: teacherData?.subject || 'General',
            date_of_birth: teacherData?.date_of_birth || new Date().toISOString(),
            gender: teacherData?.gender || 'not_specified' as Gender,
            marital_status: teacherData?.marital_status || 'not_specified',
            blood_group: teacherData?.blood_group || '',
            previous_experience: teacherData?.previous_experience || '',
            class_teacher_of: teacherData?.class_teacher_of || '',
            performance_rating: teacherData?.performance_rating || 0,
            certifications: teacherData?.certifications || [],
            training_programs: teacherData?.training_programs || [],
            achievements: teacherData?.achievements || [],
            disciplinary_records: teacherData?.disciplinary_records || [],
            leave_balance: teacherData?.leave_balance || 0,
            attendance_percentage: teacherData?.attendance_percentage || 0,
            emergency_contact_name: teacherData?.emergency_contact_name || '',
            emergency_contact_phone: teacherData?.emergency_contact_phone || '',
            emergency_contact_relationship: teacherData?.emergency_contact_relationship || '',
            emergency_contact: teacherData?.emergency_contact || '',
            full_name: `${user.user_data.first_name} ${user.user_data.last_name}`,
            years_at_school: teacherData?.years_at_school || 0,
            created_at: user.user_data.created_at || new Date().toISOString(),
            updated_at: user.user_data.updated_at || new Date().toISOString()
          };
          
          return teacher;
        })
    );
    
    console.log(`✅ Mapped ${teachers.length} teachers with enhanced data`);
    return teachers;
  };

  const mapToDashboardStats = (adminStats: AdminDashboardStats): DashboardStats => {
    console.log('🔄 Mapping dashboard stats:', adminStats);
    
    return {
      totalStudents: adminStats.total_students || 0,
      totalTeachers: adminStats.total_teachers || 0,
      totalClasses: adminStats.total_classes || 0,
      totalUsers: adminStats.total_users || 0,
      totalParents: adminStats.total_parents || 0,
      activeUsers: adminStats.active_users || 0,
      inactiveUsers: adminStats.inactive_users || 0,
      pendingVerifications: adminStats.pending_verifications || 0,
      recentRegistrations: adminStats.recent_registrations || 0
    };
  };

  const fetchAttendanceData = async (): Promise<AttendanceData> => {
    console.log('🔄 Fetching attendance data...');
    
    try {
      const response = await fetch('/api/attendance/attendance/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Attendance API error: ${response.status} ${response.statusText}`);
      }

      const attendanceRecords = await response.json();
      console.log('✅ Attendance records fetched:', attendanceRecords.length);
      
      return processAttendanceData(attendanceRecords);
    } catch (error) {
      console.error('❌ Attendance fetch failed:', error);
      return getDefaultAttendanceData();
    }
  };

  const processAttendanceData = (attendanceRecords: any[]): AttendanceData => {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const attendanceByDate = attendanceRecords.reduce((acc: any, record: any) => {
      const date = record.date || record.attendance_date;
      if (!acc[date]) {
        acc[date] = { present: 0, absent: 0, late: 0, excused: 0 };
      }
      
      switch (record.status) {
        case 'P':
        case 'present':
          acc[date].present++;
          break;
        case 'A':
        case 'absent':
          acc[date].absent++;
          break;
        case 'L':
        case 'late':
          acc[date].late++;
          break;
        case 'E':
        case 'excused':
          acc[date].excused++;
          break;
      }
      return acc;
    }, {});

    const dailyAttendance = Object.entries(attendanceByDate).map(([date, counts]: [string, any]) => ({
      date,
      present: counts.present,
      absent: counts.absent,
      late: counts.late,
      excused: counts.excused,
      totalExpected: counts.present + counts.absent + counts.late + counts.excused,
      attendanceRate: counts.present / (counts.present + counts.absent + counts.late + counts.excused) * 100
    }));

    const totalPresent = dailyAttendance.reduce((sum, day) => sum + day.present, 0);
    const totalAbsent = dailyAttendance.reduce((sum, day) => sum + day.absent, 0);
    const totalLate = dailyAttendance.reduce((sum, day) => sum + day.late, 0);
    const totalExcused = dailyAttendance.reduce((sum, day) => sum + day.excused, 0);
    const totalStudents = totalPresent + totalAbsent + totalLate + totalExcused;

    return {
      totalPresent,
      totalAbsent,
      totalLate,
      totalExcused,
      totalUnexcused: totalAbsent,
      totalStudents,
      totalTeachers: 0,
      attendanceRate: totalStudents > 0 ? (totalPresent / totalStudents) * 100 : 0,
      absenteeRate: totalStudents > 0 ? (totalAbsent / totalStudents) * 100 : 0,
      lateRate: totalStudents > 0 ? (totalLate / totalStudents) * 100 : 0,
      excusedRate: totalStudents > 0 ? (totalExcused / totalStudents) * 100 : 0,
      dailyAttendance,
      weeklyAttendance: [],
      monthlyAttendance: [],
      classAttendance: [],
      studentAttendanceRecords: attendanceRecords,
      teacherAttendanceRecords: [],
      attendanceTrends: [],
      absenteeismPatterns: [],
      lowAttendanceAlerts: [],
      chronicAbsentees: [],
      previousPeriodComparison: {
        currentPeriod: {
          startDate: startOfMonth.toISOString(),
          endDate: currentDate.toISOString(),
          attendanceRate: totalStudents > 0 ? (totalPresent / totalStudents) * 100 : 0
        },
        previousPeriod: {
          startDate: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() - 1, 1).toISOString(),
          endDate: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 0).toISOString(),
          attendanceRate: 0
        },
        change: 0,
        changeType: ChangeType.STABLE
      },
      gradeComparison: [],
      reportPeriod: {
        startDate: startOfMonth.toISOString(),
        endDate: currentDate.toISOString(),
        totalDays: Math.ceil((currentDate.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)),
        schoolDays: Math.ceil((currentDate.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)),
        holidays: 0
      },
      lastUpdated: currentDate.toISOString(),
      generatedBy: 'Admin Dashboard',
      insights: [],
      recommendations: []
    };
  };

  const getDefaultAttendanceData = (): AttendanceData => {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    return {
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalExcused: 0,
      totalUnexcused: 0,
      totalStudents: 0,
      totalTeachers: 0,
      attendanceRate: 0,
      absenteeRate: 0,
      lateRate: 0,
      excusedRate: 0,
      dailyAttendance: [],
      weeklyAttendance: [],
      monthlyAttendance: [],
      classAttendance: [],
      studentAttendanceRecords: [],
      teacherAttendanceRecords: [],
      attendanceTrends: [],
      absenteeismPatterns: [],
      lowAttendanceAlerts: [],
      chronicAbsentees: [],
      previousPeriodComparison: {
        currentPeriod: {
          startDate: startOfMonth.toISOString(),
          endDate: currentDate.toISOString(),
          attendanceRate: 0
        },
        previousPeriod: {
          startDate: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() - 1, 1).toISOString(),
          endDate: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 0).toISOString(),
          attendanceRate: 0
        },
        change: 0,
        changeType: ChangeType.STABLE
      },
      gradeComparison: [],
      reportPeriod: {
        startDate: startOfMonth.toISOString(),
        endDate: currentDate.toISOString(),
        totalDays: Math.ceil((currentDate.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)),
        schoolDays: Math.ceil((currentDate.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)),
        holidays: 0
      },
      lastUpdated: currentDate.toISOString(),
      generatedBy: 'System Default',
      insights: [],
      recommendations: []
    };
  };

  const fetchClassrooms = async (): Promise<Classroom[]> => {
    console.log('🔄 Fetching classrooms...');
    
    try {
      const response = await fetch('/api/classrooms/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Classrooms API error: ${response.status} ${response.statusText}`);
      }

      const classrooms = await response.json();
      console.log('✅ Classrooms fetched:', classrooms.length);
      return classrooms;
    } catch (error) {
      console.error('❌ Classrooms fetch failed:', error);
    return [];
    }
  };

  const fetchMessages = async (): Promise<Message[]> => {
    console.log('🔄 Fetching messages...');
    
    try {
      const response = await fetch('/api/messaging/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Messages API error: ${response.status} ${response.statusText}`);
      }

      const messages = await response.json();
      console.log('✅ Messages fetched:', messages.length);
      return messages;
    } catch (error) {
      console.error('❌ Messages fetch failed:', error);
    return [];
    }
  };

  // Main fetch function - now properly isolated
  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🚀 Starting enhanced dashboard data fetch...');
      
      if (!isAuthenticated || !user) {
        throw new Error('User not authenticated. Please login again.');
      }
      
      if (!isAdmin()) {
        throw new Error('Admin access required. Insufficient permissions.');
      }
      
      console.log('✅ User authenticated as admin:', user.role);
      
      const dataFetchPromises = [
        getDashboardStats().catch(error => {
          console.error('❌ Dashboard stats fetch failed:', error);
          return null;
        }),
        
        getUsers({ role: UserRole.STUDENT, limit: 100 }).catch(error => {
          console.error('❌ Students fetch failed:', error);
          return { users: [], total: 0 };
        }),
        
        getUsers({ role: UserRole.TEACHER, limit: 100 }).catch(error => {
          console.error('❌ Teachers fetch failed:', error);
          return { users: [], total: 0 };
        }),
        
        fetchAttendanceData().catch(error => {
          console.error('❌ Attendance data fetch failed:', error);
          return null;
        }),
        
        fetchClassrooms().catch(error => {
          console.error('❌ Classrooms fetch failed:', error);
          return [];
        }),
        
        fetchMessages().catch(error => {
          console.error('❌ Messages fetch failed:', error);
          return [];
        }),
        
        user ? fetchEnhancedUserProfile(Number(user.id)).catch(error => {
          console.error('❌ Enhanced profile fetch failed:', error);
          return null;
        }) : Promise.resolve(null)
      ];

      const [
        dashboardStats,
        studentsData,
        teachersData,
        attendanceData,
        classrooms,
        messages,
        userProfile
      ] = await Promise.all(dataFetchPromises) as [
        AdminDashboardStats | null,
        { users: AdminUserManagement[]; total: number } | null,
        { users: AdminUserManagement[]; total: number } | null,
        AttendanceData | null,
        Classroom[] | null,
        Message[] | null,
        UserProfile | null
      ];

      const processedData: DashboardData = {
        dashboardStats: dashboardStats ? mapToDashboardStats(dashboardStats) : null,
        students: studentsData?.users ? await mapToStudentsEnhanced(studentsData.users) : null,
        teachers: teachersData?.users ? await mapToTeachersEnhanced(teachersData.users) : null,
        attendanceData: attendanceData,
        classrooms: classrooms,
        messages: messages,
        userProfile: userProfile,
        loading: false,
        error: null
      };

      setDashboardData(processedData);
      
      console.log('🎉 Enhanced dashboard data fetch completed successfully!');
      console.log('📊 Data Summary:');
      console.log(`- Students: ${processedData.students?.length || 0}`);
      console.log(`- Teachers: ${processedData.teachers?.length || 0}`);
      console.log(`- Messages: ${processedData.messages?.length || 0}`);
      console.log(`- Classrooms: ${processedData.classrooms?.length || 0}`);

    } catch (error) {
      console.error('❌ Critical dashboard fetch error:', error);
      
      if (error instanceof Error && (
        error.message.includes('Authentication failed') ||
        error.message.includes('Admin access required') ||
        error.message.includes('not authenticated')
      )) {
        logout();
        return;
      }
      
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }));
    }
  }, []); // Remove all dependencies to prevent infinite loop

  // Handlers
  const handleRefresh = useCallback(() => {
    console.log('🔄 Refreshing dashboard data...');
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleLogout = useCallback(() => {
    console.log('🚪 Logging out...');
    logout();
  }, [logout]);

  // Effect for initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]); // Only depend on refreshKey, not fetchDashboardData

  // Create comprehensive admin methods object
  const adminMethods: AdminMethods = {
    getUsers,
    getDashboardStats,
    getUserProfile,
    updateUserProfile,
    createUser,
    updateUser,
    deleteUser,
    bulkUpdateUsers: (updates: any[]) => bulkUpdateUsers([], {}),
    exportUsers: (format: string) => exportUsers(format as 'csv' | 'excel'),
    resetUserPassword,
    suspendUser,
    unsuspendUser,
  };

  // Loading state
  if (dashboardData.loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading dashboard...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching latest data...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardData.error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 mb-4 text-lg font-medium">
            {dashboardData.error}
          </div>
          <div className="space-x-4">
          <button 
            onClick={handleRefresh}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
          <button 
            onClick={handleLogout}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard
        dashboardStats={dashboardData.dashboardStats}
        students={dashboardData.students}
        teachers={dashboardData.teachers}
        userProfile={dashboardData.userProfile}
        attendanceData={dashboardData.attendanceData}
        classrooms={dashboardData.classrooms}
        messages={dashboardData.messages}
        notificationCount={Array.isArray(dashboardData.messages) 
          ? dashboardData.messages.filter((msg: Message) => !msg.is_read).length 
          : 0
        }
        messageCount={dashboardData.messages?.length || 0}
        currentUser={user}
        isAdmin={isAdmin()}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
        adminMethods={adminMethods}
      />
    </div>
  );
};

export default Dashboard;