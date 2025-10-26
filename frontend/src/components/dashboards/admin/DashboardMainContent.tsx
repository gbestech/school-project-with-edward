// import React from 'react';
// import EnhancedDashboard from './EnhancedDashboard';

// interface DashboardMainContentProps {
//   dashboardStats: any;
//   students: any;
//   teachers: any;
//   attendanceData: any;
//   classrooms: any;
//   parents: any;
//   onRefresh?: () => void;
//   onUserStatusUpdate?: (userId: number, userType: 'student' | 'teacher' | 'parent', isActive: boolean) => void;
//   user?: any;
//   activateStudent?: (studentId: number) => Promise<void>;
//   activateTeacher?: (teacherId: number) => Promise<void>;
//   activateParent?: (parentId: number) => Promise<void>;
// }

// const DashboardMainContent: React.FC<DashboardMainContentProps> = (props) => {
//   console.log('📋 DashboardMainContent: Received props:', {
//     dashboardStats: props.dashboardStats,
//     students: props.students,
//     teachers: props.teachers,
//     attendanceData: props.attendanceData,
//     classrooms: props.classrooms,
//     parents: props.parents,
//     onRefresh: !!props.onRefresh
//   });
  
//   return <EnhancedDashboard {...props} />;
// };

// export default DashboardMainContent; 

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
    parents: props.parents,
    onRefresh: !!props.onRefresh,
    user: props.user
  });

  // Extract data structure info for debugging
  console.log('🔍 Data Structure Analysis:', {
    studentsType: Array.isArray(props.students) ? 'array' : typeof props.students,
    studentsHasResults: props.students?.results ? 'yes' : 'no',
    studentsCount: props.students?.count || (Array.isArray(props.students) ? props.students.length : 0),
    teachersType: Array.isArray(props.teachers) ? 'array' : typeof props.teachers,
    teachersHasResults: props.teachers?.results ? 'yes' : 'no',
    teachersCount: props.teachers?.count || (Array.isArray(props.teachers) ? props.teachers.length : 0),
    parentsType: Array.isArray(props.parents) ? 'array' : typeof props.parents,
    parentsHasResults: props.parents?.results ? 'yes' : 'no',
    parentsCount: props.parents?.count || (Array.isArray(props.parents) ? props.parents.length : 0)
  });
 
  return <EnhancedDashboard {...props} />;
};

export default DashboardMainContent;