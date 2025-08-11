import DashboardMainContent from '../../components/dashboards/admin/DashboardMainContent';
import { Student, Teacher, Classroom, AttendanceData, DashboardStats, Parent } from '../../types/types';
import { useEffect, useState } from 'react';
import api from '@/services/api';

const AdminDashboardContentLoader = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({} as DashboardStats);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({} as AttendanceData);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle user status updates
  const handleUserStatusUpdate = (userId: number, userType: 'student' | 'teacher' | 'parent', isActive: boolean) => {
    const updateUserInArray = (users: any[]) => {
      return users.map(user => {
        const userToCheck = user.user?.id || user.user_id || user.id;
        if (userToCheck === userId) {
          return {
            ...user,
            user: user.user ? { ...user.user, is_active: isActive } : undefined,
            is_active: isActive
          };
        }
        return user;
      });
    };

    if (userType === 'student') {
      setStudents(prev => updateUserInArray(prev));
    } else if (userType === 'teacher') {
      setTeachers(prev => updateUserInArray(prev));
    } else if (userType === 'parent') {
      setParents(prev => updateUserInArray(prev));
    }
  };

  useEffect(() => {
    setLoading(true);
    console.log('🔄 AdminDashboardContentLoader: Starting data fetch...');
    
    Promise.all([
      api.get('/api/parents/'),
      api.get('/api/students/'),
      api.get('/api/teachers/teachers/'), // Fixed: use correct teachers endpoint
      api.get('/api/attendance/'),
      api.get('/api/classrooms/classrooms/'), // Fixed: use correct classrooms endpoint
      api.get('/api/dashboard/stats/'),
    ])
      .then(([parentsRes, studentsRes, teachersRes, attendanceRes, classroomsRes, statsRes]) => {
        console.log('📊 AdminDashboardContentLoader: Raw API responses:');
        console.log('Parents response:', parentsRes);
        console.log('Students response:', studentsRes);
        console.log('Teachers response:', teachersRes);
        console.log('Attendance response:', attendanceRes);
        console.log('Classrooms response:', classroomsRes);
        console.log('Stats response:', statsRes);
        
        // Process and set data
        const processedParents = parentsRes.results || parentsRes || [];
        const processedStudents = studentsRes.results || studentsRes || [];
        const processedTeachers = teachersRes.results || teachersRes || [];
        const processedAttendance = attendanceRes || {};
        const processedClassrooms = classroomsRes.results || classroomsRes || [];
        const processedStats = statsRes || {};
        
        console.log('🔧 AdminDashboardContentLoader: Processed data:');
        console.log('Processed Parents:', processedParents);
        console.log('Processed Students:', processedStudents);
        console.log('Processed Teachers:', processedTeachers);
        console.log('Processed Attendance:', processedAttendance);
        console.log('Processed Classrooms:', processedClassrooms);
        console.log('Processed Stats:', processedStats);
        
        setParents(processedParents);
        setStudents(processedStudents);
        setTeachers(processedTeachers);
        setAttendanceData(processedAttendance);
        setClassrooms(processedClassrooms);
        setDashboardStats(processedStats);
        
        console.log('✅ AdminDashboardContentLoader: Data set to state successfully');
      })
      .catch((error) => {
        console.error('❌ AdminDashboardContentLoader: Error fetching data:', error);
        setParents([]);
        setStudents([]);
        setTeachers([]);
        setAttendanceData({} as AttendanceData);
        setClassrooms([]);
        setDashboardStats({} as DashboardStats);
      })
      .finally(() => {
        setLoading(false);
        console.log('🏁 AdminDashboardContentLoader: Loading completed');
      });
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  }

  return (
    <DashboardMainContent
      dashboardStats={dashboardStats}
      students={students}
      teachers={teachers}
      attendanceData={attendanceData}
      classrooms={classrooms}
      parents={parents}
      onUserStatusUpdate={handleUserStatusUpdate}
    />
  );
};
export default AdminDashboardContentLoader; 