import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
import TeacherDashboardService from '@/services/TeacherDashboardService';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Clock, 
  Calendar,
  Award,
  TrendingUp,
  BarChart3,
  Loader2,
  ArrowLeft,
  Eye,
  UserCheck,
  FileText,
  Target,
  AlertCircle,
  Clock3,
  MapPin,
  Building
} from 'lucide-react';
import { toast } from 'react-toastify';

interface SubjectDetailData {
  id: number;
  name: string;
  code: string;
  description?: string;
  category?: string;
  education_levels?: string[];
  is_compulsory?: boolean;
  periods_per_week?: number;
  assignments: Array<{
    id: number;
    classroom_name: string;
    classroom_id: number;
    grade_level: string;
    section: string;
    education_level: string;
    stream_type?: string;
    student_count: number;
    is_class_teacher: boolean;
    periods_per_week: number;
    room_number?: string;
    academic_year?: string;
    term?: string;
  }>;
}

interface SubjectStats {
  totalClasses: number;
  totalStudents: number;
  averageStudentsPerClass: number;
  totalPeriodsPerWeek: number;
  classTeacherCount: number;
  averagePeriodsPerWeek: number;
}

const SubjectDetail: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState<SubjectDetailData | null>(null);
  const [stats, setStats] = useState<SubjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && subjectId) {
      loadSubjectDetail();
    }
  }, [user, subjectId]);

  const loadSubjectDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get teacher ID from user data
      const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
      if (!teacherId) {
        throw new Error('Teacher ID not found. Please ensure your teacher profile is properly set up.');
      }

      // Get all teacher subjects and find the specific one
      const allSubjects = await TeacherDashboardService.getTeacherSubjects(teacherId);
      const targetSubject = allSubjects.find(s => s.id === parseInt(subjectId!));
      
      if (!targetSubject) {
        throw new Error('Subject not found or you are not assigned to this subject.');
      }

      setSubject(targetSubject);
      calculateSubjectStats(targetSubject);
      
    } catch (error) {
      console.error('Error loading subject detail:', error);
      setError(error instanceof Error ? error.message : 'Failed to load subject details');
      toast.error('Failed to load subject details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubjectStats = (subjectData: SubjectDetailData) => {
    const totalClasses = subjectData.assignments.length;
    const totalStudents = subjectData.assignments.reduce((sum, assignment) => sum + assignment.student_count, 0);
    const averageStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;
    const totalPeriodsPerWeek = subjectData.assignments.reduce((sum, assignment) => sum + (assignment.periods_per_week || 0), 0);
    const classTeacherCount = subjectData.assignments.filter(assignment => assignment.is_class_teacher).length;
    const averagePeriodsPerWeek = totalClasses > 0 ? Math.round(totalPeriodsPerWeek / totalClasses) : 0;
    
    setStats({
      totalClasses,
      totalStudents,
      averageStudentsPerClass,
      totalPeriodsPerWeek,
      classTeacherCount,
      averagePeriodsPerWeek
    });
  };

  const getEducationLevelDisplay = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'NURSERY': 'Nursery',
      'PRIMARY': 'Primary',
      'JUNIOR_SECONDARY': 'Junior Secondary',
      'SENIOR_SECONDARY': 'Senior Secondary'
    };
    return levelMap[level] || level;
  };

  const getCategoryDisplay = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'core': 'Core',
      'elective': 'Elective',
      'cross_cutting': 'Cross-Cutting',
      'practical': 'Practical'
    };
    return categoryMap[category] || category;
  };

  if (loading) {
    return (
      <TeacherDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Loading subject details...</p>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  if (error || !subject) {
    return (
      <TeacherDashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error Loading Subject</h3>
                <p className="text-red-700 dark:text-red-300">{error || 'Subject not found'}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/teacher/subjects')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Subjects
            </button>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/teacher/subjects')}
              className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Subjects</span>
            </button>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{subject.name}</h1>
                  <p className="text-xl text-slate-600 dark:text-slate-400 font-mono">{subject.code}</p>
                </div>
              </div>
              
              {subject.description && (
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-3 max-w-3xl">
                  {subject.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mt-4">
                {subject.category && (
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm">
                    {getCategoryDisplay(subject.category)}
                  </span>
                )}
                {subject.education_levels && subject.education_levels.length > 0 && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                    {getEducationLevelDisplay(subject.education_levels[0])}
                  </span>
                )}
                {subject.is_compulsory && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm">
                    Compulsory
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Classes</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalClasses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg. Students/Class</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.averageStudentsPerClass}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Periods/Week</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalPeriodsPerWeek}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                  <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Class Teacher Assignments</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.classTeacherCount}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stats.classTeacherCount > 0 ? 'You are the class teacher for these classes' : 'No class teacher assignments'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg">
                  <Clock3 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Periods/Class</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.averagePeriodsPerWeek}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stats.averagePeriodsPerWeek > 0 ? 'Periods per week per class' : 'No periods assigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Class Assignments Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Class Assignments ({subject.assignments.length})
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Detailed information about all classes where you teach {subject.name}
            </p>
          </div>
          
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {subject.assignments.map((assignment, index) => (
              <div key={assignment.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Class Information */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-slate-400" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {assignment.classroom_name}
                      </h3>
                      {assignment.is_class_teacher && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                          Class Teacher
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {assignment.grade_level} - {assignment.section}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {assignment.education_level}
                        </span>
                      </div>
                      
                      {assignment.stream_type && (
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {assignment.stream_type}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Academic Details */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900 dark:text-white">Academic Details</h4>
                    <div className="space-y-2 text-sm">
                      {assignment.academic_year && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Academic Year: {assignment.academic_year}
                          </span>
                        </div>
                      )}
                      
                      {assignment.term && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Term: {assignment.term}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {assignment.periods_per_week || 0} periods per week
                        </span>
                      </div>
                      
                      {assignment.room_number && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Room: {assignment.room_number}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Information & Actions */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900 dark:text-white">Students & Actions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {assignment.student_count} students enrolled
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 pt-2">
                      <button
                        onClick={() => navigate(`/teacher/students/${assignment.classroom_id}`)}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Students</span>
                      </button>
                      
                      <button
                        onClick={() => navigate(`/teacher/classes/${assignment.classroom_id}`)}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Class Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/teacher/subjects')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>All Subjects</span>
            </button>
            
            <button
              onClick={() => navigate('/teacher/classes')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
            >
              <GraduationCap className="w-5 h-5" />
              <span>All Classes</span>
            </button>
            
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </TeacherDashboardLayout>
  );
};

export default SubjectDetail;
