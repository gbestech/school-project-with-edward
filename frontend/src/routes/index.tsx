
// router/index.tsx
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { ErrorBoundary } from './../components/ErrorBoundary';
import { AuthProvider } from './../hooks/useAuth';
import { ThemeProvider } from './../hooks/useTheme';
import { lazy, Suspense } from "react";




// Lazy load all components
const Home = lazy(() => import('./../pages/Landing'));
const School_Activities =lazy(()=> import('./../pages/School_Activities'))
const Login = lazy(() => import('./../pages/Login'));
const SignUp = lazy(() => import('./../pages/SignUp'));
const About = lazy(() => import("./../pages/About"));
const StudentDashboard = lazy(() => import('./../pages/student/Dashboard'));
const TeacherDashboard = lazy(() => import('./../pages/teacher/Dashboard'));
const ParentDashboard = lazy(() => import('./../pages/parent/Dashboard'));
const NotFound = lazy(() => import('./../pages/NotFound'));

// Loading fallback component
const LoadingSpinner = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="text-white/70 text-sm">Loading...</p>
    </div>
  </div>
);

// Enhanced Error element for route-level errors with debugging
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
const RootLayout = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <div className="min-h-screen">
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Test component to verify SignUp route works
// const SignUpTest = () => (
//   <div className="min-h-screen flex items-center justify-center bg-green-100">
//     <div className="bg-white p-8 rounded-lg shadow-lg">
//       <h1 className="text-2xl font-bold text-green-600 mb-4">SignUp Route Working!</h1>
//       <p className="text-gray-600">This is a test component to verify the route works.</p>
//       <p className="text-sm text-gray-500 mt-2">
//         Replace this with your actual SignUp component import.
//       </p>
//     </div>
//   </div>
// );

// Create the router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
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
        // Temporarily use test component to isolate the issue
        element: <SignUp />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'about',
        element: <About />,
        errorElement: <RouteErrorElement />
      },
    {
      path: 'school_activites',
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
        path: 'teacher',
        children: [
          {
            path: 'dashboard',
            element: <TeacherDashboard />,
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
        path: '*',
        element: <NotFound />,
      }
    ]
  }
]);

// Additional debugging - check if components are loading correctly
console.log('Router configuration loaded');
console.log('Available routes:', [
  '/',
  '/login', 
  '/signup',
  '/about',
  '/student/dashboard',
  '/teacher/dashboard', 
  '/parent/dashboard'
]);