import DashboardMainContent from '../../components/dashboards/admin/DashboardMainContent';
import { Student, Teacher, Classroom, AttendanceData, DashboardStats, Parent } from '../../types/types';
import { useEffect, useState } from 'react';
import { api } from '@/hooks/useAuth';

const AdminDashboardContentLoader = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({} as DashboardStats);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({} as AttendanceData);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/parents/'),
      api.get('/api/students/'),
      api.get('/api/teachers/'),
      api.get('/api/attendance/'),
      api.get('/api/classrooms/'),
      api.get('/api/dashboard/stats/'),
    ])
      .then(([parentsRes, studentsRes, teachersRes, attendanceRes, classroomsRes, statsRes]) => {
        setParents(parentsRes.data.results || parentsRes.data || []);
        setStudents(studentsRes.data.results || studentsRes.data || []);
        setTeachers(teachersRes.data.results || teachersRes.data || []);
        setAttendanceData(attendanceRes.data || {});
        setClassrooms(classroomsRes.data.results || classroomsRes.data || []);
        setDashboardStats(statsRes.data || {});
      })
      .catch(() => {
        setParents([]);
        setStudents([]);
        setTeachers([]);
        setAttendanceData({} as AttendanceData);
        setClassrooms([]);
        setDashboardStats({} as DashboardStats);
      })
      .finally(() => setLoading(false));
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
    />
  );
};
export default AdminDashboardContentLoader; 