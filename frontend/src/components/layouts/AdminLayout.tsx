import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminDashboard from '../dashboards/admin/Admin';
import { Student, Teacher, Classroom, AttendanceData, DashboardStats, Parent } from '../../types/types';
import { useAuth } from '../../hooks/useAuth';
import api from '@/services/api';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({} as DashboardStats);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({} as AttendanceData);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    console.log('🔄 AdminLayout: Starting data fetch...');
    
    Promise.all([
      api.get('/api/parents/'),
      api.get('/api/students/'),
      api.get('/api/teachers/teachers/'),
      api.get('/api/attendance/'),
      api.get('/api/classrooms/classrooms/'),
      api.get('/api/dashboard/stats/'),
    ])
      .then(([parentsRes, studentsRes, teachersRes, attendanceRes, classroomsRes, statsRes]) => {
        // Process and set data
        const processedParents = parentsRes.results || parentsRes || [];
        const processedStudents = studentsRes.results || studentsRes || [];
        const processedTeachers = teachersRes.results || teachersRes || [];
        const processedAttendance = attendanceRes || {};
        const processedClassrooms = classroomsRes.results || classroomsRes || [];
        const processedStats = statsRes || {};
        
        setParents(processedParents);
        setStudents(processedStudents);
        setTeachers(processedTeachers);
        setAttendanceData(processedAttendance);
        setClassrooms(processedClassrooms);
        setDashboardStats(processedStats);
        
        console.log('✅ AdminLayout: Data set to state successfully');
      })
      .catch((error) => {
        console.error('❌ AdminLayout: Error fetching data:', error);
        setParents([]);
        setStudents([]);
        setTeachers([]);
        setAttendanceData({} as AttendanceData);
        setClassrooms([]);
        setDashboardStats({} as DashboardStats);
      })
      .finally(() => {
        setLoading(false);
        console.log('🏁 AdminLayout: Loading completed');
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading admin dashboard...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching latest data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <AdminDashboard
        dashboardStats={dashboardStats}
        students={students}
        teachers={teachers}
        parents={parents}
        attendanceData={attendanceData}
        classrooms={classrooms}
        messages={[]}
        userProfile={null}
        notificationCount={0}
        messageCount={0}
        onRefresh={() => window.location.reload()}
        currentUser={user}
        onLogout={logout}
        isAdmin={true}
        adminMethods={{
          getUsers: async () => ({ users: [], total: 0, page: 1, total_pages: 1 }),
          getDashboardStats: async () => ({} as any),
          getUserProfile: async () => ({} as any)
        }}
      >
        {/* This Outlet will render the specific admin page content */}
        <Outlet />
      </AdminDashboard>
    </div>
  );
};

export default AdminLayout;
