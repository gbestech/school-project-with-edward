import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  Target, 
  FileText, 
  Package,
  AlertTriangle,
  CheckCircle,
  Play,
  StopCircle,
  ChevronRight,
  ChevronDown,
  Star,
  TrendingUp,
  BarChart3,
  Download,
  Edit,
  Eye,
  MessageCircle,
  Trophy,
  Heart,
  Sparkles,
  Lightbulb,
  Zap
} from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { Lesson, getLessonAttendance, updateLessonAttendance, getLessonEnrolledStudents, LessonAttendanceRecordBackend, LessonService } from '@/services/LessonService';
import LessonProgressTracker from './LessonProgressTracker';

interface LessonViewModalProps {
  lesson: Lesson;
  onClose: () => void;
  onEdit: () => void;
  onLessonUpdate?: (lesson: Lesson) => void;
}

type TabType = 'overview' | 'details' | 'progress' | 'resources' | 'attendance';

const LessonViewModal: React.FC<LessonViewModalProps> = ({ lesson, onClose, onEdit, onLessonUpdate }) => {
  const { isDarkMode } = useGlobalTheme();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);
  const [attendanceTabLoading, setAttendanceTabLoading] = useState(false);
  const [attendanceTabError, setAttendanceTabError] = useState<string | null>(null);
  const [lessonAttendance, setLessonAttendance] = useState<LessonAttendanceRecordBackend[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [enrolledStudentsCount, setEnrolledStudentsCount] = useState(0);

  // Fetch lesson attendance when attendance tab is active
  useEffect(() => {
    if (activeTab === 'attendance') {
      setAttendanceTabLoading(true);
      setAttendanceTabError(null);
      
      // Fetch attendance records first
      getLessonAttendance({ lesson_id: lesson.id })
        .then((attendanceData) => {
          const attendanceRecords = attendanceData.results || attendanceData || [];
          setLessonAttendance(Array.isArray(attendanceRecords) ? attendanceRecords : []);
        })
        .catch((error) => {
          console.error('Error loading lesson attendance:', error);
          // Handle different types of errors
          if (error.response) {
            const status = error.response.status;
            if (status === 404) {
              // No attendance records found - this is normal
              setLessonAttendance([]);
            } else if (status === 401 || status === 403) {
              setAttendanceTabError('Authentication required. Please log in again.');
            } else if (status >= 500) {
              setAttendanceTabError('Server error. Please try again later.');
            } else {
              setAttendanceTabError('Failed to load attendance data');
            }
          } else if (error.message && error.message.includes('Network')) {
            setAttendanceTabError('Network error. Please check your connection.');
          } else {
            setAttendanceTabError('Failed to load attendance data');
          }
        });

      // Fetch enrolled students (optional - if this fails, we'll just not show the count)
      getLessonEnrolledStudents(lesson.id)
        .then((enrolledData) => {
          setEnrolledStudents(enrolledData.students || []);
          setEnrolledStudentsCount(enrolledData.count || 0);
        })
        .catch((error) => {
          console.error('Error loading enrolled students:', error);
          // Don't show error for this - just set defaults
          setEnrolledStudents([]);
          setEnrolledStudentsCount(0);
        })
        .finally(() => setAttendanceTabLoading(false));
    }
  }, [activeTab, lesson.id]);

  const handleAttendanceStatusChange = async (record: LessonAttendanceRecordBackend, newStatus: string) => {
    setAttendanceTabLoading(true);
    setAttendanceTabError(null);
    try {
      await updateLessonAttendance(record.id, { status: newStatus as LessonAttendanceRecordBackend['status'] });
      setLessonAttendance((prev) => prev.map((r) => r.id === record.id ? { ...r, status: newStatus as LessonAttendanceRecordBackend['status'] } : r));
    } catch {
      setAttendanceTabError('Failed to update attendance');
    } finally {
      setAttendanceTabLoading(false);
    }
  };

  const attendanceStatuses = ['present', 'absent', 'late', 'excused', 'sick'];

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
    buttonWarning: isDarkMode ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white',
    buttonDanger: isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white',
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      postponed: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = () => {
    if (lesson.is_overdue) return 'text-red-600';
    if (lesson.is_today) return 'text-orange-600';
    if (lesson.is_upcoming) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getPriorityIcon = () => {
    if (lesson.is_overdue) return <AlertTriangle size={16} />;
    if (lesson.is_today) return <Clock size={16} />;
    if (lesson.is_upcoming) return <Calendar size={16} />;
    return <Calendar size={16} />;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye size={16} /> },
    { id: 'details', label: 'Details', icon: <FileText size={16} /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp size={16} /> },
    { id: 'resources', label: 'Resources', icon: <Package size={16} /> },
    { id: 'attendance', label: 'Attendance', icon: <Users size={16} /> },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${themeClasses.bgCard} rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border ${themeClasses.border}`}>
        {/* Header */}
        <div className={`relative p-8 border-b ${themeClasses.border} bg-gradient-to-r from-blue-600 to-purple-600 text-white`}>
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
                  <div className="flex items-center space-x-4 text-white text-opacity-90">
                    <span className="flex items-center space-x-1">
                      <Users size={16} />
                      <span>{lesson.teacher_name}</span>
                    </span>
                    <span>•</span>
                    <span>{lesson.classroom_name}</span>
                    {lesson.classroom_stream_name && (
                      <>
                        <span>•</span>
                        <span>{lesson.classroom_stream_name}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{lesson.subject_name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {(lesson.status === 'completed' || lesson.status === 'in_progress') && (
                  <button
                    onClick={async () => {
                      try {
                        await LessonService.downloadLessonReport(lesson.id);
                      } catch (error) {
                        console.error('Failed to download report:', error);
                        // You could add a toast notification here
                      }
                    }}
                    className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm hover:bg-opacity-30 transition-all duration-200"
                    title="Download Lesson Report"
                  >
                    <Download size={20} />
                  </button>
                )}
                <button
                  onClick={onEdit}
                  className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm hover:bg-opacity-30 transition-all duration-200"
                  title="Edit Lesson"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={onClose}
                  className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm hover:bg-opacity-30 transition-all duration-200"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Status and Priority */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(lesson.status)}`}>
                  {lesson.status_display}
                </span>
                <div className={`flex items-center space-x-1 ${getPriorityColor()}`}>
                  {getPriorityIcon()}
                  <span className="text-sm font-medium">
                    {lesson.is_overdue ? 'Overdue' : lesson.is_today ? 'Today' : lesson.is_upcoming ? 'Upcoming' : 'Scheduled'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white text-opacity-80">ID: {lesson.id}</span>
                <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full"></div>
                <span className="text-sm text-white text-opacity-80">{lesson.time_slot}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`px-8 py-4 border-b ${themeClasses.border} ${themeClasses.bgSecondary}`}>
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? `${themeClasses.buttonPrimary} shadow-lg`
                    : `${themeClasses.textSecondary} hover:${themeClasses.textPrimary} hover:bg-opacity-10`
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border} hover:shadow-lg transition-all duration-200`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Clock size={20} className="text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{lesson.duration_formatted}</span>
                  </div>
                  <h3 className="font-semibold mb-1">Duration</h3>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>Total lesson time</p>
                </div>

                <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border} hover:shadow-lg transition-all duration-200`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <TrendingUp size={20} className="text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">{lesson.completion_percentage}%</span>
                  </div>
                  <h3 className="font-semibold mb-1">Progress</h3>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>Completion rate</p>
                </div>

                <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border} hover:shadow-lg transition-all duration-200`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Users size={20} className="text-purple-600" />
                    </div>
                    <span className="text-2xl font-bold text-purple-600">{lesson.attendance_count || 0}</span>
                  </div>
                  <h3 className="font-semibold mb-1">Attendance</h3>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>Students present</p>
                </div>

                <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border} hover:shadow-lg transition-all duration-200`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Star size={20} className="text-orange-600" />
                    </div>
                    <span className="text-2xl font-bold text-orange-600">{lesson.participation_score || 0}%</span>
                  </div>
                  <h3 className="font-semibold mb-1">Participation</h3>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>Student engagement</p>
                </div>
              </div>

              {/* Description */}
              <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border}`}>
                <div className="flex items-center space-x-2 mb-4">
                  <FileText size={20} className={themeClasses.iconPrimary} />
                  <h3 className="text-lg font-semibold">Description</h3>
                </div>
                <p className={`${themeClasses.textSecondary} leading-relaxed`}>
                  {lesson.description || 'No description provided for this lesson.'}
                </p>
              </div>

              {/* Quick Actions */}
              <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border}`}>
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {lesson.can_start && (
                    <button className={`flex flex-col items-center space-y-2 p-4 rounded-xl ${themeClasses.buttonSuccess} transition-all duration-200 hover:scale-105`}>
                      <Play size={24} />
                      <span className="text-sm font-medium">Start Lesson</span>
                    </button>
                  )}
                  {lesson.can_complete && (
                    <button className={`flex flex-col items-center space-y-2 p-4 rounded-xl ${themeClasses.buttonSuccess} transition-all duration-200 hover:scale-105`}>
                      <CheckCircle size={24} />
                      <span className="text-sm font-medium">Complete</span>
                    </button>
                  )}
                  {lesson.can_cancel && (
                    <button className={`flex flex-col items-center space-y-2 p-4 rounded-xl ${themeClasses.buttonWarning} transition-all duration-200 hover:scale-105`}>
                      <StopCircle size={24} />
                      <span className="text-sm font-medium">Cancel</span>
                    </button>
                  )}
                  <button className={`flex flex-col items-center space-y-2 p-4 rounded-xl ${themeClasses.buttonSecondary} transition-all duration-200 hover:scale-105`}>
                    <Download size={24} />
                    <span className="text-sm font-medium">Export</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Learning Objectives */}
              <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target size={20} className={themeClasses.iconPrimary} />
                    <h3 className="text-lg font-semibold">Learning Objectives</h3>
                  </div>
                  <button
                    onClick={() => toggleSection('objectives')}
                    className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                  >
                    {expandedSections.includes('objectives') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>
                {expandedSections.includes('objectives') && (
                  <div className="space-y-3">
                                    {Array.isArray(lesson.learning_objectives) && lesson.learning_objectives.length > 0 ? (
                  lesson.learning_objectives.map((objective, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <div className="p-1 bg-blue-600 rounded-full mt-1">
                            <CheckCircle size={12} className="text-white" />
                          </div>
                          <span className="text-blue-800">{objective}</span>
                        </div>
                      ))
                    ) : (
                      <p className={`${themeClasses.textTertiary} italic`}>No learning objectives set</p>
                    )}
                  </div>
                )}
              </div>

              {/* Key Concepts */}
              <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Lightbulb size={20} className="text-yellow-600" />
                    <h3 className="text-lg font-semibold">Key Concepts</h3>
                  </div>
                  <button
                    onClick={() => toggleSection('concepts')}
                    className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                  >
                    {expandedSections.includes('concepts') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>
                {expandedSections.includes('concepts') && (
                  <div className="space-y-3">
                                    {Array.isArray(lesson.key_concepts) && lesson.key_concepts.length > 0 ? (
                  lesson.key_concepts.map((concept, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="p-1 bg-yellow-600 rounded-full mt-1">
                            <Zap size={12} className="text-white" />
                          </div>
                          <span className="text-yellow-800">{concept}</span>
                        </div>
                      ))
                    ) : (
                      <p className={`${themeClasses.textTertiary} italic`}>No key concepts defined</p>
                    )}
                  </div>
                )}
              </div>

              {/* Materials Needed */}
              <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Package size={20} className="text-orange-600" />
                    <h3 className="text-lg font-semibold">Materials Needed</h3>
                  </div>
                  <button
                    onClick={() => toggleSection('materials')}
                    className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                  >
                    {expandedSections.includes('materials') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>
                {expandedSections.includes('materials') && (
                  <div className="space-y-3">
                                    {Array.isArray(lesson.materials_needed) && lesson.materials_needed.length > 0 ? (
                  lesson.materials_needed.map((material, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                          <div className="p-1 bg-orange-600 rounded-full mt-1">
                            <Package size={12} className="text-white" />
                          </div>
                          <span className="text-orange-800">{material}</span>
                        </div>
                      ))
                    ) : (
                      <p className={`${themeClasses.textTertiary} italic`}>No materials specified</p>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MessageCircle size={20} className="text-green-600" />
                    <h3 className="text-lg font-semibold">Notes & Feedback</h3>
                  </div>
                  <button
                    onClick={() => toggleSection('notes')}
                    className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                  >
                    {expandedSections.includes('notes') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>
                {expandedSections.includes('notes') && (
                  <div className="space-y-4">
                    {lesson.teacher_notes && (
                      <div>
                        <h4 className="font-medium mb-2 text-green-700">Teacher Notes</h4>
                        <p className={`${themeClasses.textSecondary} bg-green-50 p-3 rounded-lg`}>{lesson.teacher_notes}</p>
                      </div>
                    )}
                    {lesson.lesson_notes && (
                      <div>
                        <h4 className="font-medium mb-2 text-blue-700">Lesson Notes</h4>
                        <p className={`${themeClasses.textSecondary} bg-blue-50 p-3 rounded-lg`}>{lesson.lesson_notes}</p>
                      </div>
                    )}
                    {lesson.student_feedback && (
                      <div>
                        <h4 className="font-medium mb-2 text-purple-700">Student Feedback</h4>
                        <p className={`${themeClasses.textSecondary} bg-purple-50 p-3 rounded-lg`}>{lesson.student_feedback}</p>
                      </div>
                    )}
                    {lesson.admin_notes && (
                      <div>
                        <h4 className="font-medium mb-2 text-gray-700">Admin Notes</h4>
                        <p className={`${themeClasses.textSecondary} bg-gray-50 p-3 rounded-lg`}>{lesson.admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              {/* Progress Tracker */}
              <LessonProgressTracker
                lesson={lesson}
                onProgressUpdate={(updatedLesson) => {
                  if (onLessonUpdate) {
                    onLessonUpdate(updatedLesson);
                  }
                }}
                onStatusChange={(updatedLesson) => {
                  if (onLessonUpdate) {
                    onLessonUpdate(updatedLesson);
                  }
                }}
              />

              {/* Progress Overview */}
              <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border}`}>
                <div className="flex items-center space-x-2 mb-6">
                  <BarChart3 size={20} className={themeClasses.iconPrimary} />
                  <h3 className="text-lg font-semibold">Progress Overview</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Completion Progress</span>
                      <span className="font-bold text-blue-600">{lesson.completion_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${lesson.completion_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{lesson.attendance_count || 0}</div>
                      <div className="text-sm text-blue-700">Students Present</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{lesson.participation_score || 0}%</div>
                      <div className="text-sm text-green-700">Participation Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border}`}>
                <h3 className="text-lg font-semibold mb-4">Lesson Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Calendar size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Scheduled</div>
                      <div className={`text-sm ${themeClasses.textSecondary}`}>
                        {new Date(lesson.date).toLocaleDateString()} at {lesson.time_slot}
                      </div>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                  </div>
                  
                  {lesson.actual_start_time && (
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <Play size={16} className="text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Started</div>
                        <div className={`text-sm ${themeClasses.textSecondary}`}>
                          {lesson.actual_start_time}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {lesson.actual_end_time && (
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <StopCircle size={16} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Completed</div>
                        <div className={`text-sm ${themeClasses.textSecondary}`}>
                          {lesson.actual_end_time}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border}`}>
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <Trophy size={24} className="text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-blue-600">{lesson.completion_percentage}%</div>
                    <div className="text-sm text-blue-700">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <Heart size={24} className="text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-green-600">{lesson.participation_score || 0}%</div>
                    <div className="text-sm text-green-700">Engagement</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <Sparkles size={24} className="text-purple-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-purple-600">{lesson.attendance_count || 0}</div>
                    <div className="text-sm text-purple-700">Attendance</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Users size={20} className={themeClasses.iconPrimary} />
                  <h3 className="text-lg font-semibold ml-2">Lesson Attendance</h3>
                </div>
                {!attendanceTabLoading && enrolledStudentsCount > 0 && (
                  <div className={`text-sm ${themeClasses.textSecondary}`}>
                    {enrolledStudentsCount} student{enrolledStudentsCount !== 1 ? 's' : ''} enrolled
                  </div>
                )}
              </div>
              {attendanceTabLoading && <div className="text-blue-600">Loading attendance...</div>}
              {attendanceTabError && <div className="text-red-600">{attendanceTabError}</div>}
              
              {!attendanceTabLoading && !attendanceTabError && enrolledStudentsCount === 0 && (
                <div className="text-center py-8">
                  <Users size={48} className={`mx-auto mb-4 ${themeClasses.iconSecondary}`} />
                  <p className={`${themeClasses.textSecondary} mb-4`}>No students enrolled in this lesson</p>
                  <p className={`text-sm ${themeClasses.textTertiary}`}>Students must be enrolled in the classroom before attendance can be taken</p>
                </div>
              )}
              
              {!attendanceTabLoading && !attendanceTabError && enrolledStudentsCount > 0 && lessonAttendance.length === 0 && (
                <div className="text-center py-8">
                  <Users size={48} className={`mx-auto mb-4 ${themeClasses.iconSecondary}`} />
                  <p className={`${themeClasses.textSecondary} mb-4`}>No attendance records yet</p>
                  <p className={`text-sm ${themeClasses.textTertiary}`}>There are {enrolledStudentsCount} students enrolled. Attendance records will appear here once taken.</p>
                </div>
              )}
              
              {!attendanceTabLoading && !attendanceTabError && lessonAttendance.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lessonAttendance.map((record) => (
                        <tr key={record.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.student}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={record.status}
                              onChange={(e) => handleAttendanceStatusChange(record, e.target.value)}
                              className="px-2 py-1 border rounded"
                              disabled={attendanceTabLoading}
                            >
                              {attendanceStatuses.map((status) => (
                                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.arrival_time || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.notes || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {/* Optionally add delete/edit buttons here */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              {/* Resources */}
              <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Package size={20} className={themeClasses.iconPrimary} />
                    <h3 className="text-lg font-semibold">Lesson Resources</h3>
                  </div>
                  <button className={`px-4 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors`}>
                    <Download size={16} className="mr-2" />
                    Add Resource
                  </button>
                </div>
                <div className="space-y-3">
                                  {Array.isArray(lesson.resources) && lesson.resources.length > 0 ? (
                  lesson.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{resource.title || `Resource ${index + 1}`}</div>
                            <div className={`text-sm ${themeClasses.textSecondary}`}>
                              {resource.type || 'Document'}
                            </div>
                          </div>
                        </div>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Package size={48} className={`mx-auto mb-4 ${themeClasses.iconSecondary}`} />
                      <p className={`${themeClasses.textSecondary} mb-4`}>No resources uploaded yet</p>
                      <button className={`px-4 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors`}>
                        Upload Resources
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments */}
              <div className={`${themeClasses.bgSecondary} rounded-2xl p-6 border ${themeClasses.border}`}>
                <h3 className="text-lg font-semibold mb-4">Attachments</h3>
                <div className="space-y-3">
                                  {Array.isArray(lesson.attachments) && lesson.attachments.length > 0 ? (
                  lesson.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileText size={16} className="text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">{attachment.name || `Attachment ${index + 1}`}</div>
                            <div className={`text-sm ${themeClasses.textSecondary}`}>
                              {attachment.size || 'Unknown size'}
                            </div>
                          </div>
                        </div>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText size={48} className={`mx-auto mb-4 ${themeClasses.iconSecondary}`} />
                      <p className={`${themeClasses.textSecondary}`}>No attachments available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonViewModal;
