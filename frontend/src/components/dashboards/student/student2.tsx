import { useState, useEffect } from "react";
import { 
  User, Calendar, BookOpen, Trophy, Clock, CreditCard, MessageSquare, Settings,
  GraduationCap, Home, AlertTriangle, ArrowLeft, Loader2, Download, Eye,
  LogOut, Menu, X, ChevronRight
} from 'lucide-react';

// Import your actual components
import PortalLogin from './PortalLogin';
import ResultSelection from './ResultSelection';
import StudentResultDisplay from '../admin/StudentResultDisplay';
import StudentResultDisplay2 from '../admin/StudentResultDisplay2';
import DashboardContent from './DashboardContent';
import ProfileTab from './ProfileTab';
import StudentLessons from '@/pages/student/StudentLessons';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface TokenVerificationData {
  is_valid: boolean;
  message: string;
  school_term: string;
  expires_at: string;
  student_id?: string | number;
  student_name?: string;
  current_class?: string;
  education_level?: string;
}

interface SelectionData {
  academicSession: any;
  term: any;
  class: any;
  resultType?: string;
  examSession?: string;
}

interface StudentRecord {
  id: number;
  full_name: string;
  username: string;
  student_class: string;
  education_level: string;
  profile_picture?: string;
  user: number;
}

const StudentPortal = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  const isStudentPortalEnabled = settings?.student_portal_enabled !== false;
  
  // Navigation state
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Portal authentication flow states
  const [portalStep, setPortalStep] = useState<'login' | 'selection' | 'results'>('login');
  const [verifiedTokenData, setVerifiedTokenData] = useState<TokenVerificationData | null>(null);
  const [selections, setSelections] = useState<SelectionData | null>(null);
  
  // CRITICAL: Add state for actual student record
  const [studentRecord, setStudentRecord] = useState<StudentRecord | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  // CRITICAL FIX: Fetch actual student record when user is authenticated
  useEffect(() => {
    const fetchStudentRecord = async () => {
      if (!user?.id) {
        console.log('⏳ No authenticated user yet');
        return;
      }

      try {
        setLoadingStudent(true);
        console.log('🔍 Fetching student record for user ID:', user.id);
        
        // Query students by user_id
        const response = await api.get(`/api/students/students/?user=${user.id}`);
        console.log('✅ Student query response:', response);
        
        const students = Array.isArray(response) ? response : (response.results || []);
        
        if (students.length > 0) {
          const student = students[0];
          console.log('✅ Found student record:', {
            userId: user.id,
            studentId: student.id,
            studentName: student.full_name,
            educationLevel: student.education_level,
            class: student.student_class
          });
          
          setStudentRecord(student);
        } else {
          console.error('❌ No student record found for user ID:', user.id);
        }
      } catch (error) {
        console.error('❌ Error fetching student record:', error);
      } finally {
        setLoadingStudent(false);
      }
    };

    fetchStudentRecord();
  }, [user?.id]);

  // CRITICAL FIX: Get the actual student ID (not user ID)
  const getAuthenticatedStudentId = (): string => {
    // Priority 1: From student record (this is the CORRECT student ID)
    if (studentRecord?.id) {
      console.log('✅ Using student record ID:', studentRecord.id);
      return String(studentRecord.id);
    }
    
    // Priority 2: From verified token data
    if (verifiedTokenData?.student_id) {
      console.log('⚠️ Using token student ID:', verifiedTokenData.student_id);
      return String(verifiedTokenData.student_id);
    }
    
    // DO NOT fallback to user.id - this is the wrong ID!
    console.error('❌ No student record found! Cannot use user ID as student ID.');
    return '';
  };

  const handleTokenVerified = (tokenData?: TokenVerificationData | any) => {
    console.log('✅ Token verified in parent:', tokenData);
    
    // Use the student record ID if we have it, otherwise try to extract from token
    const studentId = studentRecord?.id || tokenData?.student_id;
    
    if (!studentId) {
      console.warn('⚠️ No student ID available during token verification');
    }
    
    const enhancedTokenData: TokenVerificationData = {
      is_valid: tokenData?.is_valid ?? true,
      message: tokenData?.message ?? 'Token verified successfully',
      school_term: tokenData?.school_term ?? 'Current Term',
      expires_at: tokenData?.expires_at ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      student_id: studentId,
      student_name: tokenData?.student_name ?? studentRecord?.full_name ?? user?.full_name,
      current_class: tokenData?.current_class ?? studentRecord?.student_class,
      education_level: tokenData?.education_level ?? studentRecord?.education_level
    };
    
    console.log('🔍 Enhanced token data with student_id:', enhancedTokenData);
    console.log('🔑 AUTHENTICATED STUDENT ID:', studentId);
    
    setVerifiedTokenData(enhancedTokenData);
    setPortalStep('selection');
  };

  const handleSelectionComplete = (data: SelectionData) => {
    console.log('✅ Selection completed:', data);
    console.log('🔍 Authenticated student ID at selection:', getAuthenticatedStudentId());
    setSelections(data);
    setPortalStep('results');
  };

  const handleBackToSelection = () => {
    setPortalStep('selection');
  };

  const handlePortalLogout = () => {
    setPortalStep('login');
    setVerifiedTokenData(null);
    setSelections(null);
  };

  const handleTabChange = (tabId: string) => {
    setActiveSection(tabId);
    setIsSidebarOpen(false);
    if (tabId !== 'portal') {
      setPortalStep('login');
      setVerifiedTokenData(null);
      setSelections(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'from-blue-500 to-blue-600' },
    { id: 'portal', label: 'Portal', icon: GraduationCap, color: 'from-purple-500 to-purple-600' },
    { id: 'profile', label: 'Profile', icon: User, color: 'from-green-500 to-green-600' },
    { id: 'academics', label: 'Academics', icon: GraduationCap, color: 'from-indigo-500 to-indigo-600' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, color: 'from-pink-500 to-pink-600' },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, color: 'from-orange-500 to-orange-600' },
    { id: 'grades', label: 'Grades', icon: Trophy, color: 'from-yellow-500 to-yellow-600' },
    { id: 'attendance', label: 'Attendance', icon: Clock, color: 'from-red-500 to-red-600' },
    { id: 'fees', label: 'Fees', icon: CreditCard, color: 'from-teal-500 to-teal-600' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'from-cyan-500 to-cyan-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-gray-600' }
  ];

  // Show loading while fetching student record
  if (loadingStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Loader2 className="w-12 h-12 animate-spin text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">Loading Student Portal</h3>
          <p className="text-gray-600 dark:text-slate-400">Please wait while we fetch your information...</p>
        </div>
      </div>
    );
  }

  // Show error if user is authenticated but no student record found
  if (user && !studentRecord && !loadingStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 max-w-md text-center shadow-2xl border border-red-200 dark:border-red-800">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-3">
            Student Record Not Found
          </h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6">
            Your user account (ID: {user.id}) is not linked to a student record. 
            Please contact your school administrator for assistance.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleGoHome}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Home size={18} />
              Go Home
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800 dark:text-slate-100">Student Portal</h1>
                  <p className="text-xs text-gray-600 dark:text-slate-400">{studentRecord?.full_name}</p>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleGoHome}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
              >
                <Home size={18} />
                <span className="hidden lg:inline">Home</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <LogOut size={18} />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <nav className={`${
            isSidebarOpen ? 'fixed inset-0 z-40 bg-black/50 md:relative md:bg-transparent' : 'hidden md:block'
          } md:w-72 transition-all duration-300`}
          onClick={(e) => e.target === e.currentTarget && setIsSidebarOpen(false)}>
            <div className={`${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            } fixed md:relative left-0 top-0 h-full md:h-auto w-72 bg-white dark:bg-slate-800 md:rounded-2xl shadow-2xl md:shadow-lg border-r md:border border-gray-200 dark:border-slate-700 p-4 transition-transform duration-300 overflow-y-auto`}>
              {/* Mobile Header */}
              <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">Menu</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Student Info Card */}
              {studentRecord && (
                <div className="mb-6 p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    {studentRecord.profile_picture ? (
                      <img 
                        src={studentRecord.profile_picture} 
                        alt={studentRecord.full_name}
                        className="w-14 h-14 rounded-full border-2 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white">
                        <User size={28} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base truncate">{studentRecord.full_name}</h3>
                      <p className="text-xs opacity-90">{studentRecord.student_class}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-white/10 rounded-lg px-3 py-2">
                    <span className="opacity-90">ID: {studentRecord.id}</span>
                    <span className="opacity-90">{studentRecord.education_level}</span>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <ul className="space-y-2">
                {menuItems.map(item => (
                  <li key={item.id}>
                    <button
                      className={`flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        activeSection === item.id 
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105` 
                          : 'bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:scale-102'
                      }`}
                      onClick={() => handleTabChange(item.id)}
                    >
                      <item.icon className="mr-3 flex-shrink-0" size={20} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {activeSection === item.id && (
                        <ChevronRight size={18} className="animate-pulse" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Mobile Actions */}
              <div className="md:hidden mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 space-y-2">
                <button
                  onClick={handleGoHome}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium"
                >
                  <Home size={20} />
                  Go to Home
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {!isStudentPortalEnabled ? (
              <DisabledPortalMessage onGoHome={handleGoHome} onLogout={handleLogout} />
            ) : activeSection === 'portal' ? (
              <PortalContent
                portalStep={portalStep}
                verifiedTokenData={verifiedTokenData}
                selections={selections}
                studentRecord={studentRecord}
                onTokenVerified={handleTokenVerified}
                onSelectionComplete={handleSelectionComplete}
                onBackToSelection={handleBackToSelection}
                onPortalLogout={handlePortalLogout}
                getAuthenticatedStudentId={getAuthenticatedStudentId}
              />
            ) : activeSection === 'dashboard' ? (
              <DashboardContent />
            ) : activeSection === 'profile' ? (
              <ProfileTab />
            ) : activeSection === 'schedule' ? (
              <StudentLessons />
            ) : (
              <ComingSoonMessage sectionName={menuItems.find(item => item.id === activeSection)?.label} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// Portal Content Component
const PortalContent = ({
  portalStep,
  verifiedTokenData,
  selections,
  studentRecord,
  onTokenVerified,
  onSelectionComplete,
  onBackToSelection,
  onPortalLogout,
  getAuthenticatedStudentId
}: any) => {
  const [showBackendPdf, setShowBackendPdf] = useState(false);

  if (!studentRecord) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-xl border border-gray-200 dark:border-slate-700">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-slate-400 text-lg">
          Student record not available. Please refresh the page.
        </p>
      </div>
    );
  }

  // Log selection data for debugging
  useEffect(() => {
    if (selections) {
      console.log('🔍 [PortalContent] Current selections:', {
        academicSession: selections.academicSession,
        term: selections.term,
        class: selections.class,
        resultType: selections.resultType,
        examSession: selections.examSession,
        studentId: studentRecord.id
      });
    }
  }, [selections, studentRecord]);

  return (
    <div className="space-y-6">
      {/* Progress Indicator - Only show after login */}
      {portalStep !== 'login' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-1">Your Progress</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">Track your result retrieval journey</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {studentRecord.full_name} • ID: {studentRecord.id}
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-500 mt-0.5">
                  {studentRecord.student_class} • {studentRecord.education_level}
                </p>
              </div>
              <button
                onClick={onPortalLogout}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium border border-red-200 dark:border-red-800 flex items-center gap-2"
              >
                <LogOut size={14} />
                Exit Portal
              </button>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center">
            <Step label="Verified" active={true} completed={true} />
            <div className="flex-1 h-1.5 mx-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-500 rounded-full ${
                portalStep === 'results' ? 'bg-gradient-to-r from-green-500 to-emerald-500 w-full' : 'bg-gradient-to-r from-blue-500 to-blue-600 w-1/2'
              }`} />
            </div>
            <Step label="Selection" active={portalStep === 'selection'} completed={portalStep === 'results'} />
            <div className="flex-1 h-1.5 mx-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-500 rounded-full ${
                portalStep === 'results' ? 'bg-gradient-to-r from-green-500 to-emerald-500 w-full' : 'bg-gray-200 dark:bg-slate-600'
              }`} />
            </div>
            <Step label="Results" active={portalStep === 'results'} completed={false} />
          </div>
        </div>
      )}

      {/* Content based on step */}
      {portalStep === 'login' && (
        <PortalLogin onSuccess={onTokenVerified} />
      )}

      {portalStep === 'selection' && verifiedTokenData && (
        <div className="space-y-6">
          {/* Token Verification Success Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">✅ Access Granted!</h3>
                <p className="text-white/90 mb-3">{verifiedTokenData.school_term}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/10 rounded-lg px-3 py-2">
                    <p className="text-white/70 text-xs mb-1">Student</p>
                    <p className="font-semibold">{studentRecord.full_name}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-2">
                    <p className="text-white/70 text-xs mb-1">Class & Level</p>
                    <p className="font-semibold">{studentRecord.student_class} • {studentRecord.education_level}</p>
                  </div>
                </div>
                <p className="text-xs text-white/70 mt-3">
                  ⏰ Token expires: {new Date(verifiedTokenData.expires_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <ResultSelection 
            onSelectionComplete={onSelectionComplete}
            verifiedTokenData={verifiedTokenData}
          />
        </div>
      )}

      {portalStep === 'results' && selections && verifiedTokenData && (
        <div className="space-y-6">
          <button
            onClick={onBackToSelection}
            className="px-5 py-3 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 flex items-center gap-2 shadow-lg border border-gray-200 dark:border-slate-700 font-medium group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Selection
          </button>

          {/* View Mode Toggle */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4">Choose View Mode</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowBackendPdf(false)}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all duration-200 font-medium ${
                  !showBackendPdf
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <Eye size={20} />
                <span>View Online</span>
              </button>
              <button
                onClick={() => setShowBackendPdf(true)}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all duration-200 font-medium ${
                  showBackendPdf
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <Download size={20} />
                <span>Download Official PDF</span>
              </button>
            </div>
          </div>
          
          {!showBackendPdf ? (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8 border-2 border-yellow-200 dark:border-yellow-800 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                    Frontend PDF Generator (Temporarily Disabled)
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-400 mb-4">
                    This view has been temporarily disabled to debug the backend PDF generator.
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500">
                    Please use the "Download Official PDF" option to access your results.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-slate-700">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Download className="text-white" size={40} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                </div>
                
                <div className="text-center max-w-md">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-3">
                    Official Report Card
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 mb-6">
                    Download a professionally formatted PDF report card generated by the server with official stamps and signatures.
                  </p>
                </div>
                
                <StudentResultDisplay2 
                  student={{
                    id: String(studentRecord.id),
                    full_name: studentRecord.full_name,
                    username: studentRecord.username,
                    student_class: studentRecord.student_class,
                    education_level: studentRecord.education_level,
                    profile_picture: studentRecord.profile_picture
                  }}
                  selections={selections}
                  currentUser={{
                    id: String(studentRecord.user),
                    student_id: String(studentRecord.id)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Progress Step Component
const Step = ({ label, active, completed }: { label: string; active: boolean; completed: boolean }) => (
  <div className="flex flex-col items-center min-w-[80px]">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
      completed ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-110' :
      active ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110' :
      'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-400'
    }`}>
      {completed ? '✓' : active ? '●' : '○'}
    </div>
    <span className={`text-xs mt-2 font-medium text-center ${
      active ? 'text-blue-600 dark:text-blue-400' : 
      completed ? 'text-green-600 dark:text-green-400' :
      'text-gray-500 dark:text-slate-400'
    }`}>
      {label}
    </span>
  </div>
);

// Disabled Portal Message
const DisabledPortalMessage = ({ onGoHome, onLogout }: { onGoHome: () => void; onLogout: () => void }) => (
  <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-2xl border-2 border-red-200 dark:border-red-800 text-center">
    <div className="w-28 h-28 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
      <AlertTriangle className="text-white" size={48} />
    </div>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-3">Portal Access Disabled</h2>
    <p className="text-gray-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
      The student portal is currently disabled by the administrator. Please contact your school for more information.
    </p>
    <div className="flex gap-3 justify-center">
      <button
        onClick={onGoHome}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
      >
        <Home size={18} />
        Go Home
      </button>
      <button
        onClick={onLogout}
        className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  </div>
);

// Coming Soon Message
const ComingSoonMessage = ({ sectionName }: { sectionName?: string }) => (
  <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-2xl border border-gray-200 dark:border-slate-700 text-center">
    <div className="relative inline-block mb-6">
      <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
        <Settings className="text-white animate-spin-slow" size={48} />
      </div>
      <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
        <span className="text-lg">🚀</span>
      </div>
    </div>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-3">Coming Soon</h2>
    <p className="text-gray-600 dark:text-slate-400 mb-2 text-lg">
      The <span className="font-semibold text-blue-600 dark:text-blue-400">{sectionName}</span> section is under development.
    </p>
    <p className="text-sm text-gray-500 dark:text-slate-500">
      We're working hard to bring you this feature. Stay tuned!
    </p>
  </div>
);

export default StudentPortal;