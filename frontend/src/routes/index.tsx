
// router/index.tsx
import { createBrowserRouter, Outlet } from 'react-router-dom';
import ErrorBoundary from './../components/ErrorBoundary';
import { AuthProvider } from './../hooks/useAuth';
import { AuthLostProvider } from './../components/common/AuthLostProvider';
// import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { GlobalThemeProvider } from '@/contexts/GlobalThemeContext';
import { lazy } from "react";
// import ContactRibbon from './../components/home/ContactRibbon';
import Navbar from '@/components/home/Nav';
import Footer from '@/components/home/Footer';

// Lazy load all components with consistent import paths and error handling
const Home = lazy(() => import('./../pages/Landing').catch(() => ({ default: () => <div>Error loading Home</div> })));
const School_Activities = lazy(() => import('./../pages/School_Activities').catch(() => ({ default: () => <div>Error loading School Activities</div> })));
const Login = lazy(() => import('./../pages/Login').catch(() => ({ default: () => <div>Error loading Login</div> })));
const SignUp = lazy(() => import('./../pages/SignUp').catch(() => ({ default: () => <div>Error loading SignUp</div> })));
const EmailVerification = lazy(() => import('./../pages/EmailVerification').catch(() => ({ default: () => <div>Error loading Email Verification</div> })));
const About = lazy(() => import('./../pages/About').catch(() => ({ default: () => <div>Error loading About</div> })));
const StudentDashboard = lazy(() => import('./../pages/student/Dashboard').catch(() => ({ default: () => <div>Error loading Student Dashboard</div> })));
const TeacherDashboard = lazy(() => import('./../pages/teacher/Dashboard').catch(() => ({ default: () => <div>Error loading Teacher Dashboard</div> })));
const TeacherProfile = lazy(() => import('./../pages/teacher/Profile').catch(() => ({ default: () => <div>Error loading Teacher Profile</div> })));
const TeacherClasses = lazy(() => import('./../pages/teacher/Classes').catch(() => ({ default: () => <div>Error loading Teacher Classes</div> })));
const TeacherAttendance = lazy(() => import('./../pages/teacher/Attendance').catch(() => ({ default: () => <div>Error loading Teacher Attendance</div> })));
const TeacherStudents = lazy(() => import('./../pages/teacher/Students').catch(() => ({ default: () => <div>Error loading Teacher Students</div> })));
const TeacherStudentProfile = lazy(() => import('./../pages/teacher/StudentProfile').catch(() => ({ default: () => <div>Error loading Teacher Student Profile</div> })));
const TeacherStudentsList = lazy(() => import('./../pages/teacher/StudentsList').catch(() => ({ default: () => <div>Error loading Teacher Students List</div> })));
const TeacherExams = lazy(() => import('./../pages/teacher/Exams').catch(() => ({ default: () => <div>Error loading Teacher Exams</div> })));
const TeacherResults = lazy(() => import('./../pages/teacher/Results').catch(() => ({ default: () => <div>Error loading Teacher Results</div> })));
const TeacherSchedule = lazy(() => import('./../pages/teacher/Schedule').catch(() => ({ default: () => <div>Error loading Teacher Schedule</div> })));
const TeacherSubjects = lazy(() => import('./../pages/teacher/Subjects').catch(() => ({ default: () => <div>Error loading Teacher Subjects</div> })));
const TeacherSubjectDetail = lazy(() => import('./../pages/teacher/SubjectDetail').catch(() => ({ default: () => <div>Error loading Teacher Subject Detail</div> })));
const StudentList = lazy(() => import('./../pages/admin/AdminStudentList').catch(() => ({ default: () => <div>Error loading Student List</div> })));
const ParentDashboard = lazy(() => import('./../pages/parent/Dashboard').catch(() => ({ default: () => <div>Error loading Parent Dashboard</div> })));
const NotFound = lazy(() => import('./../pages/NotFound').catch(() => ({ default: () => <div>Page Not Found</div> })));
// const AdminDashboardLayout = lazy(() => import('./../pages/admin/DashboardHome').catch(() => ({ default: () => <div>Error loading Admin Layout</div> })));
// const DashboardHome = lazy(() => import('./../pages/admin/DashboardHome').catch(() => ({ default: () => <div>Error loading Dashboard Home</div> })));
// const DashboardMainContent = lazy(() => import('./../components/dashboards/admin/DashboardMainContent'));
const AdminClassroomManagement = lazy(() => import('./../pages/admin/AdminClassroomManagement').catch(() => ({ default: () => <div>Error loading Classroom Management</div> })));
const AdminLessonsManagement = lazy(() => import('./../pages/admin/AdminLessonsManagement').catch(() => ({ default: () => <div>Error loading Lessons Management</div> })));
const AdminExamsManagement = lazy(() => import('./../pages/admin/AdminExamsManagement').catch(() => ({ default: () => <div>Error loading Exams Management</div> })));
const AdminExamScheduleManagement = lazy(() => import('./../pages/admin/AdminExamScheduleManagement').catch(() => ({ default: () => <div>Error loading Exam Schedule Management</div> })));
const AdminAtendanceMangement = lazy(() => import('./../pages/admin/AdminAttendanceView').catch(() => ({ default: () => <div>Error loading Attendance Dashboard</div> })));
const AddStudentForm = lazy(() => import('./../pages/admin/AddStudentForm').catch(() => ({ default: () => <div>Error loading Add Student Form</div> })));
const EditStudentForm = lazy(() => import('./../components/dashboards/admin/EditStudentForm').catch(() => ({ default: () => <div>Error loading Edit Student Form</div> })));
const StudentDetailView = lazy(() => import('./../components/dashboards/admin/StudentDetailView').catch(() => ({ default: () => <div>Error loading Student Detail View</div> })));
const AdminSubjectManagement = lazy(() => import('./../pages/admin/AdminSubjectManagement').catch(() => ({ default: () => <div>Error loading Admin Subject Management</div> })));
const AdminResultManagement = lazy(() => import('./../pages/admin/AdminResultManagement').catch(() => ({ default: () => <div>Error loading Admin Result Management</div> })));
const AllTeachers = lazy(() => import('./../pages/admin/AllTeachers').catch(() => ({ default: () => <div>Error loading All Teachers</div> })));
const AddTeacherForm = lazy(() => import('./../pages/admin/AddTeacherForm').catch(() => ({ default: () => <div>Error loading Add Teacher Form</div> })));
const AllParents = lazy(() => import('./../pages/admin/AllParents').catch(() => ({ default: () => <div>Error loading All Parents</div> })));
const AddParentForm = lazy(() => import('./../pages/admin/AddParentForm').catch(() => ({ default: () => <div>Error loading Add Parent Form</div> })));
const AddAdminForm = lazy(() => import('./../pages/admin/AddAdminForm').catch(() => ({ default: () => <div>Error loading Add Admin Form</div> })));
const AllAdmins = lazy(() => import('./../pages/admin/AllAdmins').catch(() => ({ default: () => <div>Error loading All Admins</div> })));
const PasswordRecovery = lazy(() => import('./../pages/admin/PasswordRecovery').catch(() => ({ default: () => <div>Error loading Password Recovery</div> })));
const AdminDashboardContentLoader = lazy(() => import('./../pages/admin/AdminDashboardContentLoader').catch(() => ({ default: () => <div>Error loading Admin Dashboard Content</div> })));
const AdminLayout = lazy(() => import('./../components/layouts/AdminLayout').catch(() => ({ default: () => <div>Error loading Admin Layout</div> })));
const SettingsPage = lazy(() => import('./../pages/admin/Settings').catch(() => ({ default: () => <div>Error loading Settings</div> })));
const MessageManagement = lazy(() => import('./../components/dashboards/admin/MessageManagement').catch(() => ({ default: () => <div>Error loading Message Management</div> })));
const ThemeTest = lazy(() => import('./../pages/ThemeTestPage').catch(() => ({ default: () => <div>Error loading Theme Test</div> })));
const TestHooks = lazy(() => import('./../components/TestHooks').catch(() => ({ default: () => <div>Error loading Test Hooks</div> })));
const StudentLoginPage = lazy(() => import('./../pages/StudentLoginPage').catch(() => ({ default: () => <div>Error loading Student Login</div> })));
const TeacherLoginPage = lazy(() => import('./../pages/TeacherLoginPage').catch(() => ({ default: () => <div>Error loading Teacher Login</div> })));
const ParentLoginPage = lazy(() => import('./../pages/ParentLoginPage').catch(() => ({ default: () => <div>Error loading Parent Login</div> })));
const AdminLoginPage = lazy(() => import('./../pages/AdminLoginPage').catch(() => ({ default: () => <div>Error loading Admin Login</div> })));
const HowToApplyPage = lazy(() => import('./../pages/HowToApplyPage').catch(() => ({ default: () => <div>Error loading How to Apply</div> })));
const PublicTeacherBio = lazy(() => import('./../pages/PublicTeacherBio').catch(() => ({ default: () => <div>Error loading Teacher Bio</div> })));
const ResultChecker = lazy(() => import('./../components/dashboards/admin/ResultChecker').catch(() => ({ default: () => <div>Error loading Result Checker</div> })));
const StudentResultDetail = lazy(() => import('./../components/dashboards/admin/StudentResultDetail').catch(() => ({ default: () => <div>Error loading Student Result Detail</div> })));

const RouteErrorElement = () => {
  const error = (window as any).__routerError || 'Unknown error';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
        <p className="text-white/70 mb-4">
          We encountered an error while loading this page.
        </p>
        
        {/* Debug information - remove in production */}
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6 text-left">
          <p className="text-red-200 text-xs font-mono">
            Debug Info: {JSON.stringify(error, null, 2)}
          </p>
          <p className="text-red-200 text-xs mt-2">
            Current URL: {window.location.href}
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Go Home
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-600 text-white py-2 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

// Root layout component with error handling
// const RootLayout = () => {
//   const { isDarkMode } = useGlobalTheme();
  
//   // Effect to adjust main content padding based on ContactRibbon visibility
//   React.useEffect(() => {
//     const adjustPadding = () => {
//       const mainContent = document.getElementById('main-content');
//       const contactRibbonVisible = localStorage.getItem('contactRibbonVisible') !== 'false';
      
//       if (mainContent) {
//         if (contactRibbonVisible) {
//           mainContent.style.paddingTop = '6rem'; // Reduced padding when ContactRibbon is visible
//         } else {
//           mainContent.style.paddingTop = '4rem'; // Minimal padding when ContactRibbon is hidden
//         }
//       }
//     };

//     // Initial adjustment
//     adjustPadding();

//     // Listen for storage changes
//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === 'contactRibbonVisible') {
//         adjustPadding();
//       }
//     };

//     window.addEventListener('storage', handleStorageChange);
    
//     // Also check periodically for immediate updates
//     const interval = setInterval(adjustPadding, 100);

//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//       clearInterval(interval);
//     };
//   }, []);

//   return (
//     <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
//       <ContactRibbon />
//       <div className="pt-0" id="main-content"> {/* Let individual components handle their own padding */}
//         <Suspense fallback={<LoadingSpinner />}>
//           <Outlet />
//         </Suspense>
//       </div>
//     </div>
//   );
// };

// MainLayout component
const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

// TeacherLayout component
const TeacherLayout = () => (
  <Outlet />
);

// Create the router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <GlobalThemeProvider>
        <AuthProvider>
          <AuthLostProvider>
            <ErrorBoundary>
              <MainLayout />
            </ErrorBoundary>
          </AuthLostProvider>
        </AuthProvider>
      </GlobalThemeProvider>
    ),
    errorElement: <RouteErrorElement />,
    children: [
      {
        index: true,
        element: <Home />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'login',
        element: <Login />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'signup',
        element: <SignUp />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'verify-email',
        element: <EmailVerification />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'about',
        element: <About />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'theme-test',
        element: <ThemeTest />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'test-hooks',
        element: <TestHooks />,
        errorElement: <RouteErrorElement />
      },
    {
        path: 'school_activities', // Fixed typo: was 'school_activites'
      element: <School_Activities/>,
      errorElement: <RouteErrorElement />
    },
      {
        path: 'student',
        children: [
          {
            path: 'dashboard',
            element: <StudentDashboard />,
            errorElement: <RouteErrorElement />
          }
        ]
      },
      {
        path: 'parent',
        children: [
          {
            path: 'dashboard',
            element: <ParentDashboard />,
            errorElement: <RouteErrorElement />
          }
        ]
      },
      {
        path: 'student-login',
        element: <StudentLoginPage />, 
        errorElement: <RouteErrorElement />
      },
      {
        path: 'teacher-login',
        element: <TeacherLoginPage />, 
        errorElement: <RouteErrorElement />
      },
      {
        path: 'parent-login',
        element: <ParentLoginPage />, 
        errorElement: <RouteErrorElement />
      },
      {
        path: 'admin-login',
        element: <AdminLoginPage />, 
        errorElement: <RouteErrorElement />
      },
      {
        path: 'how-to-apply',
        element: <HowToApplyPage />, 
        errorElement: <RouteErrorElement />
      },
      {
        path: 'teacher/bio/:teacherId',
        element: <PublicTeacherBio />, 
        errorElement: <RouteErrorElement />
      },

      
      {
        path: '*',
        element: <NotFound />,
      }
    ]
  },
  // Teacher routes - separate from main layout to avoid navbar conflicts
  {
    path: '/teacher',
    element: (
      <GlobalThemeProvider>
        <AuthProvider>
          <AuthLostProvider>
            <ErrorBoundary>
              <TeacherLayout />
            </ErrorBoundary>
          </AuthLostProvider>
        </AuthProvider>
      </GlobalThemeProvider>
    ),
    errorElement: <RouteErrorElement />,
    children: [
      {
        path: 'dashboard',
        element: <TeacherDashboard />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'profile',
        element: <TeacherProfile />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'classes',
        element: <TeacherClasses />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'attendance/:classId?',
        element: <TeacherAttendance />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'attendance',
        element: <TeacherAttendance />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'students/:classId',
        element: <TeacherStudents />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'student/:studentId',
        element: <TeacherStudentProfile />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'students',
        element: <TeacherStudentsList />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'exams',
        element: <TeacherExams />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'results',
        element: <TeacherResults />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'schedule',
        element: <TeacherSchedule />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'subjects',
        element: <TeacherSubjects />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'subjects/:subjectId',
        element: <TeacherSubjectDetail />,
        errorElement: <RouteErrorElement />
      }
    ]
  },
  // Admin routes - separate from main layout to avoid navbar conflicts
  {
    path: '/admin',
    element: (
      <GlobalThemeProvider>
        <AuthProvider>
          <AuthLostProvider>
            <ErrorBoundary>
              <AdminLayout />
            </ErrorBoundary>
          </AuthLostProvider>
        </AuthProvider>
      </GlobalThemeProvider>
    ),
    errorElement: <RouteErrorElement />,
    children: [
      {
        index: true,
        element: <AdminDashboardContentLoader />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'dashboard',
        element: <AdminDashboardContentLoader />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'students',
        element: <StudentList />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'students/:id',
        element: <StudentDetailView />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'results',
        element: <AdminResultManagement />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'results/student/:studentId',
        element: <StudentResultDetail />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'classes',
        element: <AdminClassroomManagement />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'subjects',
        element: <AdminSubjectManagement />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'exams',
        element: <AdminExamsManagement />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'exam-schedules',
        element: <AdminExamScheduleManagement />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'lessons',
        element: <AdminLessonsManagement />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'attendance',
        element: <AdminAtendanceMangement />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'students/add',
        element: <AddStudentForm />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'students/:id/edit',
        element: <EditStudentForm />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'teachers',
        element: <AllTeachers />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'teachers/add',
        element: <AddTeacherForm />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'parents',
        element: <AllParents />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'parents/add',
        element: <AddParentForm />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'admins',
        element: <AllAdmins />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'admins/add',
        element: <AddAdminForm />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'settings',
        element: <SettingsPage />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'messages',
        element: <MessageManagement />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'password-recovery',
        element: <PasswordRecovery />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'result-checker',
        element: <ResultChecker />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'student-result-checker',
        element: <ResultChecker />,
        errorElement: <RouteErrorElement />
      }
    ]
  }
]);

// Debug logging
console.log('Router configuration loaded');
console.log('Available routes:', [
  '/',
  '/login', 
  '/signup',
  '/about',
  '/school_activities',
  '/student/dashboard',
  '/teacher/dashboard', 
  '/parent/dashboard',
    '/admin/dashboard'
]);