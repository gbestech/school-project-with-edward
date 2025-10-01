import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  Award, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  Heart,
  Shield,
  Edit,
  FileText,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  GraduationCap,
  Users,
  CreditCard,
  Stethoscope
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import StudentService, { Student } from '@/services/StudentService';
import { toast } from 'react-toastify';

interface StudentDetailViewProps {}

const StudentDetailView: React.FC<StudentDetailViewProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useGlobalTheme();
  
  // Data State
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const themeClasses = {
    bgPrimary: isDarkMode ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
    bgCard: isDarkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    borderHover: isDarkMode ? 'border-gray-600' : 'border-gray-300',
    iconPrimary: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    iconSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    buttonPrimary: isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    buttonSuccess: isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white',
    buttonWarning: isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-yellow-600 hover:bg-yellow-700 text-white',
    buttonDanger: isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white',
  };

  // Load data on component mount
  useEffect(() => {
    if (id) {
      loadStudentData();
    }
  }, [id]);

  const loadStudentData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const studentData = await StudentService.getStudent(parseInt(id));
      setStudent(studentData);
    } catch (error) {
      console.error('Error loading student data:', error);
      setError('Failed to load student data');
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadStudentData();
    toast.success('Student data refreshed!');
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }
  };

  const getGenderBadge = (gender: string) => {
    // Handle both database format ('M'/'F') and frontend format ('MALE'/'FEMALE')
    const isMale = gender === 'M' || gender === 'MALE';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isMale 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-pink-100 text-pink-800'
      }`}>
        {isMale ? 'Male' : 'Female'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Student</h2>
          <p className="text-gray-600 mb-6">{error || 'Student not found'}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/admin/students')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Students
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/students')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Students
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
                <p className="text-gray-600">Comprehensive student information and management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => navigate(`/admin/students/${student.id}/edit`)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Student
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {student.profile_picture ? (
                      <img
                        src={student.profile_picture}
                        alt={student.full_name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-md">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{student.full_name}</h2>
                    <p className="text-gray-600">Student ID: {student.id}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      {getStatusBadge(student.is_active ?? true)}
                      {getGenderBadge(student.gender)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Date of Birth</p>
                          <p className="font-medium">{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{student.email || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium">{student.phone_number || student.parent_contact || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium">{student.address || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Blood Group</p>
                          <p className="font-medium">{student.blood_group || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Place of Birth</p>
                          <p className="font-medium">{student.place_of_birth || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
                      Academic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Education Level</p>
                          <p className="font-medium">{student.education_level || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Award className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Class</p>
                          <p className="font-medium">{student.student_class || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Classroom</p>
                          <p className="font-medium">{student.classroom || 'Not assigned'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Registration Number</p>
                          <p className="font-medium">{student.username || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Admission Date</p>
                          <p className="font-medium">{student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2 text-red-600" />
                  Medical Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Medical Conditions</h4>
                    <p className="text-gray-600">{student.medical_conditions || 'No medical conditions reported'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Special Requirements</h4>
                    <p className="text-gray-600">{student.special_requirements || 'No special requirements'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                  Financial Information
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">{student.payment_method || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => navigate(`/admin/students/${student.id}/edit`)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Student
                </button>
                <button
                  onClick={() => navigate(`/admin/students/${student.id}/results`)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Results
                </button>
                <button
                  onClick={() => navigate(`/admin/students/${student.id}/results`)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Academic History
                </button>
              </div>
            </div>

            {/* Parent Information */}
            {student.parents && student.parents.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-indigo-600" />
                    Parent Information
                  </h3>
                </div>
                <div className="p-6">
                  {student.parents.map((parent, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <h4 className="font-medium text-gray-900">{parent.full_name}</h4>
                      <p className="text-sm text-gray-600">{parent.email}</p>
                      <p className="text-sm text-gray-600">{parent.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Student Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Age</span>
                    <span className="font-semibold">{student.age || 'N/A'} years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    {getStatusBadge(student.is_active ?? true)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gender</span>
                    {getGenderBadge(student.gender)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailView;




