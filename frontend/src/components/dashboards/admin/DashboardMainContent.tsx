import React from 'react';
import EnhancedDashboard from './EnhancedDashboard';

interface DashboardMainContentProps {
  dashboardStats: any;
  students: any;
  teachers: any;
  attendanceData: any;
  classrooms: any;
  parents: any;
  onRefresh?: () => void;
  onUserStatusUpdate?: (userId: number, userType: 'student' | 'teacher' | 'parent', isActive: boolean) => void;
  user?: any;
  activateStudent?: (studentId: number) => Promise<void>;
  activateTeacher?: (teacherId: number) => Promise<void>;
  activateParent?: (parentId: number) => Promise<void>;
}

const DashboardMainContent: React.FC<DashboardMainContentProps> = (props) => {
  console.log('📋 DashboardMainContent: Received props:', {
    dashboardStats: props.dashboardStats,
    students: props.students,
    teachers: props.teachers,
    attendanceData: props.attendanceData,
    classrooms: props.classrooms,
    parents: props.parents
  });
  
  return <EnhancedDashboard {...props} />;
};

export default DashboardMainContent; 