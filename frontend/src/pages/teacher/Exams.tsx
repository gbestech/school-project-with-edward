// import React, { useState, useEffect, useMemo } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import { useNavigate } from 'react-router-dom';
 
// import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
// import TeacherDashboardService from '@/services/TeacherDashboardService';
// import { ExamService, Exam } from '@/services/ExamService';
// import { toast } from 'react-toastify';
// import ExamCreationForm from '@/components/dashboards/teacher/ExamCreationForm';
// import TestCreationForm from '@/components/dashboards/teacher/TestCreationForm';
// import { normalizeExamDataForDisplay } from '@/utils/examDataNormalizer';
// import { 
//   Plus, 
//   Edit, 
//   Trash2, 
//   Eye, 
//   Calendar, 
//   Clock, 
//   BookOpen, 
//   Users, 
//   CheckSquare,
//   CheckCircle,
//   Award,
//   AlertCircle,
//   RefreshCw,
//   Search,
//   X,
//   GraduationCap,
//   Target,
//   Clock3
// } from 'lucide-react';

// interface TeacherExamData {
//   id: number;
//   title: string;
//   code: string;
//   subject_name: string;
//   grade_level_name: string;
//   section_name?: string;
//   exam_type: string;
//   exam_type_display: string;
//   exam_date: string;
//   start_time: string;
//   end_time: string;
//   duration_minutes: number;
//   total_marks: number;
//   status: string;
//   status_display: string;
//   student_count?: number;
//   created_at: string;
//   updated_at: string;
// }

// const TeacherExams: React.FC = () => {
//   const { user, isLoading } = useAuth();
//   const navigate = useNavigate();
  
//   const [exams, setExams] = useState<TeacherExamData[]>([]);
//   // const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterSubject, setFilterSubject] = useState('all');
//   const [filterType, setFilterType] = useState('all');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showTestModal, setShowTestModal] = useState(false);
//   const [editingExam, setEditingExam] = useState<Exam | null>(null);
//   const [editingTest, setEditingTest] = useState<Exam | null>(null);
//   const [selectedExam, setSelectedExam] = useState<TeacherExamData | null>(null);
//   const [selectedExamDetail, setSelectedExamDetail] = useState<Exam | null>(null);
//   const [activeTab, setActiveTab] = useState<'exams' | 'tests'>('exams');

//   // Load teacher data and exams
//   useEffect(() => {
//     if (user && !isLoading) {
//       loadTeacherData();
//     }
//   }, [user, isLoading]);

  
// const loadTeacherData = async () => {
//   try {
//     setLoading(true);
//     setError(null);

//     // Get teacher ID
//     const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
//     console.log('🔍 STEP 1: Teacher ID loaded:', teacherId);
//     console.log('🔍 User object:', user);
    
//     if (!teacherId) {
//       throw new Error('Teacher ID not found');
//     }

//     // Get teacher assignments and exams
//     console.log('🔍 STEP 2: Fetching assignments and exams for teacher:', teacherId);
//     const [assignmentsResponse, examsResponse] = await Promise.all([
//       TeacherDashboardService.getTeacherClasses(teacherId),
//       ExamService.getExamsByTeacher(teacherId)
//     ]);

//     const assignments = assignmentsResponse || [];
//     let examsData = examsResponse || [];

    
//     // Extract subject IDs for fallback
//     const subjectIds = Array.from(new Set(
//       (assignments || []).map((a: any) => a.subject_id).filter((id: any) => !!id)
//     ));
//     console.log('🔍 STEP 4: Subject IDs from assignments:', subjectIds);

//     // Fallback: Get exams by subjects
//     if (subjectIds.length > 0) {
//       try {
//         console.log('🔍 STEP 5: Fetching exams by subjects...');
//         const bySubjectLists = await Promise.all(
//           subjectIds.map((sid: number) => ExamService.getExamsBySubject(sid))
//         );
//         const bySubject = bySubjectLists.flat();
        
        
//         // Merge and deduplicate
//         const examMap = new Map();
//         [...examsData, ...bySubject].forEach((e: any) => {
//           if (e && e.id) {
//             examMap.set(e.id, e);
//           }
//         });
//         examsData = Array.from(examMap.values());
        
//         console.log('🔍 STEP 6: After merging and deduplication:', examsData.length, 'exams');
//       } catch (e) {
//         console.warn('⚠️ Fallback by subject failed:', e);
//       }
//     }

//     // Validate exam data
//     console.log('🔍 STEP 7: Validating exam data...');
//     const validExamsData = examsData.filter((exam: any) => {
//       if (!exam || !exam.id || exam.id <= 0) {
//         console.warn('   ⚠️ Filtering out exam with invalid ID:', exam);
//         return false;
//       }
      
//       if (!exam.title || !exam.exam_type) {
//         console.warn('   ⚠️ Filtering out exam missing required fields:', exam);
//         return false;
//       }
      
//       console.log('   ✅ Valid exam:', exam.id, '-', exam.title);
//       return true;
//     });

//     console.log('🔍 STEP 8: Valid exams after filtering:', validExamsData.length);
    
//     // Transform exams
//     const transformedExams: TeacherExamData[] = validExamsData.map((exam: any) => {
//       const transformed = {
//         id: exam.id,
//         title: exam.title,
//         code: exam.code || `EX-${exam.id}`,
//         subject_name: exam.subject_name || exam.subject?.name || 'Unknown Subject',
//         grade_level_name: exam.grade_level_name || exam.grade_level?.name || 'Unknown Class',
//         section_name: exam.section_name || exam.section?.name,
//         exam_type: exam.exam_type,
//         exam_type_display: exam.exam_type_display || exam.exam_type,
//         exam_date: exam.exam_date || '',
//         start_time: exam.start_time || '',
//         end_time: exam.end_time || '',
//         duration_minutes: exam.duration_minutes || 0,
//         total_marks: exam.total_marks || 0,
//         status: exam.status || 'scheduled',
//         status_display: exam.status_display || exam.status || 'Scheduled',
//         student_count: exam.student_count || 0,
//         created_at: exam.created_at,
//         updated_at: exam.updated_at || exam.created_at
//       };
//       console.log('   📋 Transformed exam:', transformed.id, '-', transformed.title);
//       return transformed;
//     });

//     console.log('✅ STEP 9: Final transformed exams:', transformedExams.length);
//     console.log('✅ Exam details:', transformedExams.map(e => ({ 
//       id: e.id, 
//       title: e.title, 
//       subject: e.subject_name,
//       grade: e.grade_level_name,
//       type: e.exam_type
//     })));

//     setExams(transformedExams);

//     if (transformedExams.length === 0) {
//       console.warn('⚠️ NO EXAMS FOUND for this teacher!');
//       console.warn('⚠️ This could mean:');
//       console.warn('   1. No exams have been created yet');
//       console.warn('   2. Exams were created but teacher ID was not saved');
//       console.warn('   3. Exams exist but are for different subjects/teachers');
//     }

//   } catch (error) {
//     console.error('❌ FATAL ERROR loading teacher data:', error);
//     console.error('❌ Error stack:', error);
//     setError(error instanceof Error ? error.message : 'Failed to load teacher data');
//     toast.error('Failed to load teacher data. Please try again.');
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleRefresh = async () => {
//     await loadTeacherData();
//     toast.success('Data refreshed successfully!');
//   };

//   const handleCreateExam = () => {
//     setShowCreateModal(true);
//     setEditingExam(null);
//   };

//   const handleCreateTest = () => {
//     setShowTestModal(true);
//     setEditingTest(null);
//   };

//   const handleEditExam = async (exam: TeacherExamData) => {
//     console.log('🔍 Attempting to edit exam with ID:', exam.id);
    
//     try {
//       const full = await ExamService.getExam(exam.id);
//       setEditingExam(full);
//       setShowCreateModal(true);
//     } catch (e) {
//       console.error('Error loading exam for editing:', e);
      
//       // Check if it's a 404 error (exam doesn't exist)
//       const is404Error = e instanceof Error && (
//         e.message.includes('404') || 
//         e.message.includes('Not Found') ||
//         e.message.includes('No Exam matches')
//       );
      
//       if (is404Error) {
//         toast.info('This exam no longer exists. Removing from list...');
//         // Remove the phantom exam from the UI and reload data
//         setExams(prevExams => prevExams.filter(e => e.id !== exam.id));
//         await loadTeacherData();
//       } else {
//         // Open create modal with prefill so user can correct and save as new
//         setEditingExam(null);
//         setShowCreateModal(true);
//         toast.warning('Exam not found in database. Opened form to correct and re-save.');
//       }
//     }
//   };

//   const handleEditTest = async (exam: TeacherExamData) => {
//     console.log('🔍 Attempting to edit test with ID:', exam.id);
    
//     try {
//       const full = await ExamService.getExam(exam.id);
//       setEditingTest(full);
//       setShowTestModal(true);
//     } catch (e) {
//       console.error('Error loading test for editing:', e);
      
//       // Check if it's a 404 error (exam doesn't exist)
//       const is404Error = e instanceof Error && (
//         e.message.includes('404') || 
//         e.message.includes('Not Found') ||
//         e.message.includes('No Exam matches')
//       );
      
//       if (is404Error) {
//         toast.info('This test no longer exists. Removing from list...');
//         // Remove the phantom exam from the UI and reload data
//         setExams(prevExams => prevExams.filter(e => e.id !== exam.id));
//         await loadTeacherData();
//       } else {
//         toast.error('Failed to load test details');
//       }
//     }
//   };

//   const handleSubmitForApproval = async (examId: number) => {
//     if (window.confirm('Are you sure you want to submit this exam for approval? You won\'t be able to edit it until it\'s approved or rejected.')) {
//       try {
//         await ExamService.submitForApproval(examId);
//         toast.success('Exam submitted for approval successfully!');
//         await loadTeacherData();
//       } catch (error) {
//         console.error('Error submitting exam for approval:', error);
//         toast.error('Failed to submit exam for approval. Please try again.');
//       }
//     }
//   };

//   const handleDeleteExam = async (examId: number) => {
//   console.log('🔍 Deleting exam:', examId);
  
//   const examToDelete = exams.find(e => e.id === examId);
//   if (!examToDelete) {
//     console.warn('⚠️ Exam not found in state, skipping delete');
//     return;
//   }
  
//   if (!window.confirm(`Are you sure you want to delete "${examToDelete.title}"?`)) {
//     return;
//   }
  
//   try {
//     // Optimistically remove from UI
//     setExams(prevExams => prevExams.filter(e => e.id !== examId));
    
//     // Delete from backend
//     await ExamService.deleteExam(examId);
//     console.log('✅ Exam deleted successfully');
//     toast.success('Exam deleted successfully!');
    
//     // Reload to ensure sync
//     await loadTeacherData();
//   } catch (error) {
//     console.error('❌ Error deleting exam:', error);
    
//     const is404Error = error instanceof Error && (
//       error.message.includes('404') || 
//       error.message.includes('Not Found')
//     );
    
//     if (is404Error) {
//       // Already deleted, just confirm and sync
//       toast.success('Exam removed successfully!');
//       await loadTeacherData();
//     } else {
//       // Real error - restore exam and show error
//       toast.error('Failed to delete exam. Please try again.');
//       await loadTeacherData();
//     }
//   }
// };

//   const handleViewExam = async (exam: TeacherExamData) => {
//   console.log('🔍 Viewing exam:', exam.id, exam.title);
  
//   try {
//     const full = await ExamService.getExam(exam.id);
//     console.log('✅ Loaded full exam details:', full);

//     // NORMALIZE DATA FOR DISPLAY
//       const normalizedFull = normalizeExamDataForDisplay(full);
//       console.log('✅ Normalized exam details:', normalizedFull);
//     setSelectedExam(exam);
//     setSelectedExamDetail(normalizedFull);
//   } catch (e) {
//     console.error('❌ Error loading exam details:', e);
    
//     const is404Error = e instanceof Error && (
//       e.message.includes('404') || 
//       e.message.includes('Not Found') ||
//       e.message.includes('No Exam matches')
//     );
    
//     if (is404Error) {
//       toast.error('This exam no longer exists. Refreshing list...');
//       // Remove from state and reload
//       setExams(prevExams => prevExams.filter(e => e.id !== exam.id));
//       await loadTeacherData();
//     } else {
//       toast.error('Failed to load exam details. Please try again.');
//     }
//   }
// };

//   const closeExamModal = () => {
//     setShowCreateModal(false);
//     setEditingExam(null);
//   };

//   const closeTestModal = () => {
//     setShowTestModal(false);
//     setEditingTest(null);
//   };

//   const closeViewModal = () => {
//     setSelectedExam(null);
//     setSelectedExamDetail(null);
//   };

//   const handleExamCreated = () => {
//     loadTeacherData();
//   };

//   const handleTestCreated = () => {
//     loadTeacherData();
//   };

//   // Filter exams based on current tab and filters
//   const filteredExams = useMemo(() => {
//     let filtered = exams;

//     // Filter by tab (exams vs tests)
//     if (activeTab === 'exams') {
//       filtered = filtered.filter(exam => 
//         exam.exam_type === 'mid_term' || exam.exam_type === 'final_exam' || exam.exam_type === 'practical' || exam.exam_type === 'oral_exam'
//       );
//     } else {
//       filtered = filtered.filter(exam => 
//         exam.exam_type === 'test' || exam.exam_type === 'quiz'
//       );
//     }

//     // Apply search filter
//     if (searchTerm) {
//       filtered = filtered.filter(exam =>
//         exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         exam.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         exam.grade_level_name.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Apply subject filter
//     if (filterSubject !== 'all') {
//       filtered = filtered.filter(exam => exam.subject_name === filterSubject);
//     }

//     // Apply type filter
//     if (filterType !== 'all') {
//       filtered = filtered.filter(exam => exam.exam_type === filterType);
//     }

//     // Apply status filter
//     if (filterStatus !== 'all') {
//       filtered = filtered.filter(exam => exam.status === filterStatus);
//     }

//     return filtered;
//   }, [exams, activeTab, searchTerm, filterSubject, filterType, filterStatus]);

//   // Get unique subjects and types for filters
//   const uniqueSubjects = useMemo(() => {
//     const subjects = Array.from(new Set(exams.map(exam => exam.subject_name)));
//     return subjects.sort();
//   }, [exams]);

  
//   const getStatusBadge = (status: string) => {
//     const statusConfig = {
//       scheduled: { color: 'bg-blue-100 text-blue-800', icon: Calendar, text: 'Scheduled' },
//       in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'In Progress' },
//       completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
//       cancelled: { color: 'bg-red-100 text-red-800', icon: X, text: 'Cancelled' },
//       postponed: { color: 'bg-orange-100 text-orange-800', icon: Clock3, text: 'Postponed' }
//     };

//     const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
//     const Icon = config.icon;

//     return (
//       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
//         <Icon className="w-3 h-3 mr-1" />
//         {config.text}
//       </span>
//     );
//   };

//   const getTypeIcon = (type: string) => {
//     const typeConfig = {
//       test: { icon: Target, color: 'text-green-600' },
//       quiz: { icon: CheckSquare, color: 'text-purple-600' },
//       mid_term: { icon: Calendar, color: 'text-indigo-600' },
//       final_exam: { icon: Award, color: 'text-red-600' },
//       practical: { icon: GraduationCap, color: 'text-blue-600' },
//       oral_exam: { icon: Users, color: 'text-orange-600' }
//     };

//     const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.test;
//     const Icon = config.icon;

//     return <Icon className={`w-5 h-5 ${config.color}`} />;
//   };

//   if (isLoading) {
//     return (
//       <TeacherDashboardLayout>
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//         </div>
//       </TeacherDashboardLayout>
//     );
//   }

//   return (
//     <TeacherDashboardLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2">
//           <div className='p-3'>
//             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
//               Exam & Test Management
//             </h1>
//             <p className="text-slate-600 dark:text-slate-400 mt-1">
//               Create and manage exams, tests, and assessments for your classes
//             </p>
//           </div>
//           <div className="flex items-center space-x-3 mt-4 sm:mt-0">
//             <button
//               onClick={handleRefresh}
//               className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
//             >
//               <RefreshCw className="w-4 h-4" />
//               <span>Refresh</span>
//             </button>
//           </div>
//         </div>

//         {/* Exam Summary */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
//           <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Exams</p>
//                 <p className="text-2xl font-bold text-slate-900 dark:text-white">{exams.length}</p>
//               </div>
//               <BookOpen className="w-8 h-8 text-blue-600" />
//             </div>
//           </div>
          
//           <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Scheduled</p>
//                 <p className="text-2xl font-bold text-blue-600">{exams.filter(e => e.status === 'scheduled').length}</p>
//               </div>
//               <Calendar className="w-8 h-8 text-blue-600" />
//             </div>
//           </div>
          
//           <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400">In Progress</p>
//                 <p className="text-2xl font-bold text-yellow-600">{exams.filter(e => e.status === 'in_progress').length}</p>
//               </div>
//               <AlertCircle className="w-8 h-8 text-yellow-600" />
//             </div>
//           </div>
          
//           <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</p>
//                 <p className="text-2xl font-bold text-green-600">{exams.filter(e => e.status === 'completed').length}</p>
//               </div>
//               <CheckCircle className="w-8 h-8 text-green-600" />
//             </div>
//           </div>
          
//           <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tests & Quizzes</p>
//                 <p className="text-2xl font-bold text-purple-600">{exams.filter(e => e.exam_type === 'test' || e.exam_type === 'quiz').length}</p>
//               </div>
//               <Target className="w-8 h-8 text-purple-600" />
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-700">
//           <button
//             onClick={() => setActiveTab('exams')}
//             className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
//               activeTab === 'exams'
//                 ? 'bg-blue-600 text-white'
//                 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
//             }`}
//           >
//             <div className="flex items-center space-x-2">
//               <GraduationCap className="w-4 h-4" />
//               <span>Exams</span>
//             </div>
//           </button>
//           <button
//             onClick={() => setActiveTab('tests')}
//             className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
//               activeTab === 'tests'
//                 ? 'bg-blue-600 text-white'
//                 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
//             }`}
//           >
//             <div className="flex items-center space-x-2">
//               <Target className="w-4 h-4" />
//               <span>Tests & Quizzes</span>
//             </div>
//           </button>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div className="flex items-center space-x-3">
//             {activeTab === 'exams' ? (
//               <button
//                 onClick={handleCreateExam}
//                 className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>Create New Exam</span>
//               </button>
//             ) : (
//               <button
//                 onClick={handleCreateTest}
//                 className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>Create New Test</span>
//               </button>
//             )}
//           </div>

//           {/* Filters */}
//           <div className="flex items-center space-x-3">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//               <input
//                 type="text"
//                 placeholder="Search exams..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//               />
//             </div>

//             <select
//               value={filterSubject}
//               onChange={(e) => setFilterSubject(e.target.value)}
//               className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//             >
//               <option value="all">All Subjects</option>
//               {uniqueSubjects.map(subject => (
//                 <option key={subject} value={subject}>{subject}</option>
//               ))}
//             </select>

//             <select
//               value={filterType}
//               onChange={(e) => setFilterType(e.target.value)}
//               className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//             >
//               <option value="all">All Types</option>
//               <option value="test">Class Test</option>
//               <option value="quiz">Quiz</option>
//               <option value="mid_term">Mid-Term</option>
//               <option value="final_exam">Final Exam</option>
//               <option value="practical">Practical</option>
//               <option value="oral_exam">Oral Exam</option>
//             </select>

//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//             >
//               <option value="all">All Status</option>
//               <option value="scheduled">Scheduled</option>
//               <option value="in_progress">In Progress</option>
//               <option value="completed">Completed</option>
//               <option value="cancelled">Cancelled</option>
//               <option value="postponed">Postponed</option>
//             </select>
//           </div>
//         </div>

//         {/* Content */}
//         {loading ? (
//           <div className="flex items-center justify-center py-12">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           </div>
//         ) : error ? (
//           <div className="text-center py-12">
//             <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//             <p className="text-red-600 dark:text-red-400">{error}</p>
//             <button
//               onClick={loadTeacherData}
//               className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Try Again
//             </button>
//           </div>
//         ) : filteredExams.length === 0 ? (
//           <div className="text-center py-12">
//             <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//             <p className="text-slate-500 dark:text-slate-400">
//               No {activeTab === 'exams' ? 'exams' : 'tests'} found
//             </p>
//             <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
//               {activeTab === 'exams' 
//                 ? 'Create your first exam to get started'
//                 : 'Create your first test or quiz to get started'
//               }
//             </p>
//           </div>
//         ) : (
//           <div className="grid gap-6">
//             {filteredExams.filter(exam => exam.id !== 9).map((exam) => (
//               <div
//                 key={exam.id}
//                 className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center space-x-3 mb-3">
//                       {getTypeIcon(exam.exam_type)}
//                       <div>
//                         <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
//                           {exam.title}
//                         </h3>
//                         <p className="text-sm text-slate-500 dark:text-slate-400">
//                           {exam.code}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                       <div className="flex items-center space-x-2">
//                         <BookOpen className="w-4 h-4 text-slate-400" />
//                         <span className="text-sm text-slate-600 dark:text-slate-300">
//                           {exam.subject_name}
//                         </span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <Users className="w-4 h-4 text-slate-400" />
//                         <span className="text-sm text-slate-600 dark:text-slate-300">
//                           {exam.grade_level_name}
//                         </span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <Target className="w-4 h-4 text-slate-400" />
//                         <span className="text-sm text-slate-600 dark:text-slate-300">
//                           {exam.total_marks} marks
//                         </span>
//                       </div>
//                     </div>

//                     <div className="flex items-center space-x-4 mb-4">
//                       {getStatusBadge(exam.status)}
//                       <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
//                         <Clock className="w-4 h-4" />
//                         <span>{exam.duration_minutes} min</span>
//                       </div>
//                       {exam.exam_date && (
//                         <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
//                           <Calendar className="w-4 h-4" />
//                           <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
//                         </div>
//                       )}
//                       <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
//                         <Clock3 className="w-4 h-4" />
//                         <span>Created: {new Date(exam.created_at).toLocaleDateString()}</span>
//                       </div>
//                       {exam.updated_at !== exam.created_at && (
//                         <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
//                           <RefreshCw className="w-4 h-4" />
//                           <span>Updated: {new Date(exam.updated_at).toLocaleDateString()}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-2">
//                     <button
//                       onClick={() => handleViewExam(exam)}
//                       className="flex items-center space-x-2 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
//                     >
//                       <Eye className="w-4 h-4" />
//                       <span>View</span>
//                     </button>
                    
//                     {(exam.status === 'scheduled' || exam.status === 'draft') && (
//                       <button
//                         onClick={() => activeTab === 'exams' ? handleEditExam(exam) : handleEditTest(exam)}
//                         className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
//                       >
//                         <Edit className="w-4 h-4" />
//                         <span>Edit</span>
//                       </button>
//                     )}
                    
//                     {(exam.status === 'completed' || exam.status === 'in_progress') && (
//                       <button
//                         onClick={() => navigate('/teacher/results')}
//                         className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
//                       >
//                         <Award className="w-4 h-4" />
//                         <span>Record Results</span>
//                       </button>
//                     )}
                    
//                     {exam.status === 'draft' && (
//                       <button
//                         onClick={() => handleSubmitForApproval(exam.id)}
//                         className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
//                       >
//                         <CheckCircle className="w-4 h-4" />
//                         <span>Submit for Approval</span>
//                       </button>
//                     )}
//                     {(exam.status === 'scheduled' || exam.status === 'draft') && (
//                       <button
//                         onClick={() => handleDeleteExam(exam.id)}
//                         className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                         <span>Delete</span>
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Exam Creation Modal */}
//       {showCreateModal && (
//         <ExamCreationForm
//           isOpen={showCreateModal}
//           onClose={closeExamModal}
//           onExamCreated={handleExamCreated}
//           editingExam={editingExam}
//           prefill={!editingExam && selectedExam ? {
//             title: selectedExam.title,
//             exam_type: selectedExam.exam_type,
//             subject: 0,
//             grade_level: 0,
//           } : undefined}
//         />
//       )}

//       {/* Test Creation Modal */}
//       {showTestModal && (
//         <TestCreationForm
//           isOpen={showTestModal}
//           onClose={closeTestModal}
//           onTestCreated={handleTestCreated}
//           editingTest={editingTest}
//         />
//       )}

//       {/* Exam View Modal */}
//       {selectedExam && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
//               <h2 className="text-xl font-bold text-slate-900 dark:text-white">
//                 Exam Details
//               </h2>
//               <button
//                 onClick={closeViewModal}
//                 className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Title</label>
//                   <p className="text-slate-900 dark:text-white">{selectedExam.title}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Code</label>
//                   <p className="text-slate-900 dark:text-white">{selectedExam.code}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Subject</label>
//                   <p className="text-slate-900 dark:text-white">{selectedExam.subject_name}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Grade Level</label>
//                   <p className="text-slate-900 dark:text-white">{selectedExam.grade_level_name}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Type</label>
//                   <p className="text-slate-900 dark:text-white">{selectedExam.exam_type_display}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Marks</label>
//                   <p className="text-slate-900 dark:text-white">{selectedExam.total_marks}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Duration</label>
//                   <p className="text-slate-900 dark:text-white">{selectedExam.duration_minutes} minutes</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</label>
//                   <div className="mt-1">{getStatusBadge(selectedExam.status)}</div>
//                 </div>
//               </div>

//               {selectedExam.exam_date && (
//                 <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
//                   <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Schedule</h3>
//                   <div className="grid grid-cols-3 gap-4">
//                     <div>
//                       <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Date</label>
//                       <p className="text-slate-900 dark:text-white">
//                         {new Date(selectedExam.exam_date).toLocaleDateString()}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Start Time</label>
//                       <p className="text-slate-900 dark:text-white">{selectedExam.start_time}</p>
//                     </div>
//                     <div>
//                       <label className="text-sm font-medium text-slate-500 dark:text-slate-400">End Time</label>
//                       <p className="text-slate-900 dark:text-white">{selectedExam.end_time}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Questions Preview */}
//               {selectedExamDetail && (
//                 <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-6">
//                   {(selectedExamDetail.objective_questions || []).length > 0 && (
//                     <div>
//                       <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Objective Questions</h3>
//                       <div className="space-y-3">
//                         {selectedExamDetail.objective_questions!.map((q: any, i: number) => (
//                           <div key={i} className="p-3 border border-slate-200 dark:border-slate-600 rounded">
//                             <div className="font-medium mb-2">{i + 1}. {q.question}</div>
//                             {q.imageUrl && (
//                               <img src={q.imageUrl} alt={q.imageAlt || 'question image'} className="max-h-40 object-contain mb-2" />
//                             )}
//                             <div className="grid grid-cols-2 gap-2 text-sm">
//                               <div>A. {q.optionA}</div>
//                               <div>B. {q.optionB}</div>
//                               <div>C. {q.optionC}</div>
//                               <div>D. {q.optionD}</div>
//                             </div>
//                             <div className="text-xs text-slate-500 mt-1">Marks: {q.marks}</div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {(selectedExamDetail.theory_questions || []).length > 0 && (
//                     <div>
//                       <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Theory Questions</h3>
//                       <div className="space-y-3">
//                         {selectedExamDetail.theory_questions!.map((q: any, i: number) => (
//                           <div key={i} className="p-3 border border-slate-200 dark:border-slate-600 rounded">
//                             <div className="font-medium mb-2">{i + 1}. {q.question}</div>
//                             {q.imageUrl && (
//                               <img src={q.imageUrl} alt={q.imageAlt || 'theory image'} className="max-h-40 object-contain mb-2" />
//                             )}
//                             {q.table && (
//                               <div className="overflow-auto mb-2">
//                                 <table className="min-w-[300px] border border-slate-300 dark:border-slate-600 text-sm">
//                                   <tbody>
//                                     {q.table.data.map((row: string[], r: number) => (
//                                       <tr key={r}>
//                                         {row.map((cell: string, c: number) => (
//                                           <td key={c} className="border border-slate-300 dark:border-slate-600 p-1">{cell}</td>
//                                         ))}
//                                       </tr>
//                                     ))}
//                                   </tbody>
//                                 </table>
//                               </div>
//                             )}
//                             {(q.subQuestions || []).length > 0 && (
//                               <div className="space-y-2">
//                                 {q.subQuestions.map((sq: any, si: number) => (
//                                   <div key={si} className="pl-3">
//                                     <div className="mb-1">{i + 1}{String.fromCharCode(97 + si)}. {sq.question} ({sq.marks || 0} marks)</div>
//                                     {(sq.subSubQuestions || []).length > 0 && (
//                                       <div className="pl-3 space-y-1">
//                                         {sq.subSubQuestions.map((ssq: any, ssi: number) => (
//                                           <div key={ssi}>{i + 1}{String.fromCharCode(97 + si)}{String.fromCharCode(105 + ssi)}. {ssq.question} ({ssq.marks || 0})</div>
//                                         ))}
//                                       </div>
//                                     )}
//                                   </div>
//                                 ))}
//                               </div>
//                             )}
//                             <div className="text-xs text-slate-500 mt-1">Marks: {q.marks}</div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {(selectedExamDetail.custom_sections || []).length > 0 && (
//                     <div>
//                       <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Custom Sections</h3>
//                       <div className="space-y-3">
//                         {selectedExamDetail.custom_sections!.map((s: any, si: number) => (
//                           <div key={s.id || si} className="p-3 border border-slate-200 dark:border-slate-600 rounded">
//                             <div className="font-medium mb-1">{s.name}</div>
//                             {s.instructions && <div className="text-xs text-slate-500 mb-2">{s.instructions}</div>}
//                             {(s.questions || []).map((q: any, qi: number) => (
//                               <div key={q.id || qi} className="mt-2">
//                                 <div className="mb-1">{qi + 1}. {q.question}</div>
//                                 {q.imageUrl && (
//                                   <img src={q.imageUrl} alt={q.imageAlt || 'custom image'} className="max-h-40 object-contain mb-2" />
//                                 )}
//                                 {q.table && (
//                                   <div className="overflow-auto mb-2">
//                                     <table className="min-w-[300px] border border-slate-300 dark:border-slate-600 text-sm">
//                                       <tbody>
//                                         {q.table.data.map((row: string[], r: number) => (
//                                           <tr key={r}>
//                                             {row.map((cell: string, c: number) => (
//                                               <td key={c} className="border border-slate-300 dark:border-slate-600 p-1">{cell}</td>
//                                             ))}
//                                           </tr>
//                                         ))}
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                 )}
//                                 <div className="text-xs text-slate-500">Marks: {q.marks || 0}</div>
//                               </div>
//                             ))}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </TeacherDashboardLayout>
//   );
// };

// export default TeacherExams;


// import React, { useState, useEffect, useMemo } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import { useNavigate } from 'react-router-dom';
 
// import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
// import TeacherDashboardService from '@/services/TeacherDashboardService';
// import { ExamService, Exam } from '@/services/ExamService';
// import { toast } from 'react-toastify';
// import ExamCreationForm from '@/components/dashboards/teacher/ExamCreationForm';
// import TestCreationForm from '@/components/dashboards/teacher/TestCreationForm';
// import { normalizeExamDataForDisplay } from '@/utils/examDataNormalizer';
// import { 
//   Plus, 
//   Edit, 
//   Trash2, 
//   Eye, 
//   Calendar, 
//   Clock, 
//   BookOpen, 
//   Users, 
//   CheckSquare,
//   CheckCircle,
//   Award,
//   AlertCircle,
//   RefreshCw,
//   Search,
//   X,
//   GraduationCap,
//   Target,
//   Clock3,
//   Filter,
//   ChevronDown,
//   MoreVertical
// } from 'lucide-react';

// interface TeacherExamData {
//   id: number;
//   title: string;
//   code: string;
//   subject_name: string;
//   grade_level_name: string;
//   section_name?: string;
//   exam_type: string;
//   exam_type_display: string;
//   exam_date: string;
//   start_time: string;
//   end_time: string;
//   duration_minutes: number;
//   total_marks: number;
//   status: string;
//   status_display: string;
//   student_count?: number;
//   created_at: string;
//   updated_at: string;
// }

// const TeacherExams: React.FC = () => {
//   const { user, isLoading } = useAuth();
//   const navigate = useNavigate();
  
//   const [exams, setExams] = useState<TeacherExamData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterSubject, setFilterSubject] = useState('all');
//   const [filterType, setFilterType] = useState('all');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showTestModal, setShowTestModal] = useState(false);
//   const [editingExam, setEditingExam] = useState<Exam | null>(null);
//   const [editingTest, setEditingTest] = useState<Exam | null>(null);
//   const [selectedExam, setSelectedExam] = useState<TeacherExamData | null>(null);
//   const [selectedExamDetail, setSelectedExamDetail] = useState<Exam | null>(null);
//   const [activeTab, setActiveTab] = useState<'exams' | 'tests'>('exams');
//   const [showFilters, setShowFilters] = useState(false);
//   const [activeExamMenu, setActiveExamMenu] = useState<number | null>(null);

//   // Load teacher data and exams
//   useEffect(() => {
//     if (user && !isLoading) {
//       loadTeacherData();
//     }
//   }, [user, isLoading]);

  
// const loadTeacherData = async () => {
//   try {
//     setLoading(true);
//     setError(null);

//     const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
    
//     if (!teacherId) {
//       throw new Error('Teacher ID not found');
//     }

//     const [assignmentsResponse, examsResponse] = await Promise.all([
//       TeacherDashboardService.getTeacherClasses(teacherId),
//       ExamService.getExamsByTeacher(teacherId)
//     ]);

//     const assignments = assignmentsResponse || [];
//     let examsData = examsResponse || [];

//     const subjectIds = Array.from(new Set(
//       (assignments || []).map((a: any) => a.subject_id).filter((id: any) => !!id)
//     ));

//     if (subjectIds.length > 0) {
//       try {
//         const bySubjectLists = await Promise.all(
//           subjectIds.map((sid: number) => ExamService.getExamsBySubject(sid))
//         );
//         const bySubject = bySubjectLists.flat();
        
//         const examMap = new Map();
//         [...examsData, ...bySubject].forEach((e: any) => {
//           if (e && e.id) {
//             examMap.set(e.id, e);
//           }
//         });
//         examsData = Array.from(examMap.values());
//       } catch (e) {
//         console.warn('Fallback by subject failed:', e);
//       }
//     }

//     const validExamsData = examsData.filter((exam: any) => {
//       return exam && exam.id && exam.id > 0 && exam.title && exam.exam_type;
//     });
    
//     const transformedExams: TeacherExamData[] = validExamsData.map((exam: any) => ({
//       id: exam.id,
//       title: exam.title,
//       code: exam.code || `EX-${exam.id}`,
//       subject_name: exam.subject_name || exam.subject?.name || 'Unknown Subject',
//       grade_level_name: exam.grade_level_name || exam.grade_level?.name || 'Unknown Class',
//       section_name: exam.section_name || exam.section?.name,
//       exam_type: exam.exam_type,
//       exam_type_display: exam.exam_type_display || exam.exam_type,
//       exam_date: exam.exam_date || '',
//       start_time: exam.start_time || '',
//       end_time: exam.end_time || '',
//       duration_minutes: exam.duration_minutes || 0,
//       total_marks: exam.total_marks || 0,
//       status: exam.status || 'scheduled',
//       status_display: exam.status_display || exam.status || 'Scheduled',
//       student_count: exam.student_count || 0,
//       created_at: exam.created_at,
//       updated_at: exam.updated_at || exam.created_at
//     }));

//     setExams(transformedExams);

//   } catch (error) {
//     console.error('Error loading teacher data:', error);
//     setError(error instanceof Error ? error.message : 'Failed to load teacher data');
//     toast.error('Failed to load teacher data. Please try again.');
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleRefresh = async () => {
//     await loadTeacherData();
//     toast.success('Data refreshed successfully!');
//   };

//   const handleCreateExam = () => {
//     setShowCreateModal(true);
//     setEditingExam(null);
//   };

//   const handleCreateTest = () => {
//     setShowTestModal(true);
//     setEditingTest(null);
//   };

//   const handleEditExam = async (exam: TeacherExamData) => {
//     try {
//       const full = await ExamService.getExam(exam.id);
//       setEditingExam(full);
//       setShowCreateModal(true);
//       setActiveExamMenu(null);
//     } catch (e) {
//       console.error('Error loading exam for editing:', e);
      
//       const is404Error = e instanceof Error && (
//         e.message.includes('404') || 
//         e.message.includes('Not Found') ||
//         e.message.includes('No Exam matches')
//       );
      
//       if (is404Error) {
//         toast.info('This exam no longer exists. Removing from list...');
//         setExams(prevExams => prevExams.filter(e => e.id !== exam.id));
//         await loadTeacherData();
//       } else {
//         setEditingExam(null);
//         setShowCreateModal(true);
//         toast.warning('Exam not found in database. Opened form to correct and re-save.');
//       }
//     }
//   };

//   const handleEditTest = async (exam: TeacherExamData) => {
//     try {
//       const full = await ExamService.getExam(exam.id);
//       setEditingTest(full);
//       setShowTestModal(true);
//       setActiveExamMenu(null);
//     } catch (e) {
//       console.error('Error loading test for editing:', e);
      
//       const is404Error = e instanceof Error && (
//         e.message.includes('404') || 
//         e.message.includes('Not Found') ||
//         e.message.includes('No Exam matches')
//       );
      
//       if (is404Error) {
//         toast.info('This test no longer exists. Removing from list...');
//         setExams(prevExams => prevExams.filter(e => e.id !== exam.id));
//         await loadTeacherData();
//       } else {
//         toast.error('Failed to load test details');
//       }
//     }
//   };

//   const handleSubmitForApproval = async (examId: number) => {
//     if (window.confirm('Are you sure you want to submit this exam for approval? You won\'t be able to edit it until it\'s approved or rejected.')) {
//       try {
//         await ExamService.submitForApproval(examId);
//         toast.success('Exam submitted for approval successfully!');
//         await loadTeacherData();
//         setActiveExamMenu(null);
//       } catch (error) {
//         console.error('Error submitting exam for approval:', error);
//         toast.error('Failed to submit exam for approval. Please try again.');
//       }
//     }
//   };

//   const handleDeleteExam = async (examId: number) => {
//     const examToDelete = exams.find(e => e.id === examId);
//     if (!examToDelete) {
//       return;
//     }
    
//     if (!window.confirm(`Are you sure you want to delete "${examToDelete.title}"?`)) {
//       return;
//     }
    
//     try {
//       setExams(prevExams => prevExams.filter(e => e.id !== examId));
//       await ExamService.deleteExam(examId);
//       toast.success('Exam deleted successfully!');
//       await loadTeacherData();
//       setActiveExamMenu(null);
//     } catch (error) {
//       console.error('Error deleting exam:', error);
      
//       const is404Error = error instanceof Error && (
//         error.message.includes('404') || 
//         error.message.includes('Not Found')
//       );
      
//       if (is404Error) {
//         toast.success('Exam removed successfully!');
//         await loadTeacherData();
//       } else {
//         toast.error('Failed to delete exam. Please try again.');
//         await loadTeacherData();
//       }
//     }
//   };

//   const handleViewExam = async (exam: TeacherExamData) => {
//     try {
//       const full = await ExamService.getExam(exam.id);
//       const normalizedFull = normalizeExamDataForDisplay(full);
//       setSelectedExam(exam);
//       setSelectedExamDetail(normalizedFull);
//       setActiveExamMenu(null);
//     } catch (e) {
//       console.error('Error loading exam details:', e);
      
//       const is404Error = e instanceof Error && (
//         e.message.includes('404') || 
//         e.message.includes('Not Found') ||
//         e.message.includes('No Exam matches')
//       );
      
//       if (is404Error) {
//         toast.error('This exam no longer exists. Refreshing list...');
//         setExams(prevExams => prevExams.filter(e => e.id !== exam.id));
//         await loadTeacherData();
//       } else {
//         toast.error('Failed to load exam details. Please try again.');
//       }
//     }
//   };

//   const closeExamModal = () => {
//     setShowCreateModal(false);
//     setEditingExam(null);
//   };

//   const closeTestModal = () => {
//     setShowTestModal(false);
//     setEditingTest(null);
//   };

//   const closeViewModal = () => {
//     setSelectedExam(null);
//     setSelectedExamDetail(null);
//   };

//   const handleExamCreated = () => {
//     loadTeacherData();
//   };

//   const handleTestCreated = () => {
//     loadTeacherData();
//   };

//   // Filter exams based on current tab and filters
//   const filteredExams = useMemo(() => {
//     let filtered = exams;

//     if (activeTab === 'exams') {
//       filtered = filtered.filter(exam => 
//         exam.exam_type === 'mid_term' || exam.exam_type === 'final_exam' || exam.exam_type === 'practical' || exam.exam_type === 'oral_exam'
//       );
//     } else {
//       filtered = filtered.filter(exam => 
//         exam.exam_type === 'test' || exam.exam_type === 'quiz'
//       );
//     }

//     if (searchTerm) {
//       filtered = filtered.filter(exam =>
//         exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         exam.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         exam.grade_level_name.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (filterSubject !== 'all') {
//       filtered = filtered.filter(exam => exam.subject_name === filterSubject);
//     }

//     if (filterType !== 'all') {
//       filtered = filtered.filter(exam => exam.exam_type === filterType);
//     }

//     if (filterStatus !== 'all') {
//       filtered = filtered.filter(exam => exam.status === filterStatus);
//     }

//     return filtered;
//   }, [exams, activeTab, searchTerm, filterSubject, filterType, filterStatus]);

//   const uniqueSubjects = useMemo(() => {
//     const subjects = Array.from(new Set(exams.map(exam => exam.subject_name)));
//     return subjects.sort();
//   }, [exams]);

  
//   const getStatusBadge = (status: string) => {
//     const statusConfig = {
//       scheduled: { color: 'bg-blue-100 text-blue-800', icon: Calendar, text: 'Scheduled' },
//       in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'In Progress' },
//       completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
//       cancelled: { color: 'bg-red-100 text-red-800', icon: X, text: 'Cancelled' },
//       postponed: { color: 'bg-orange-100 text-orange-800', icon: Clock3, text: 'Postponed' }
//     };

//     const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
//     const Icon = config.icon;

//     return (
//       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
//         <Icon className="w-3 h-3 mr-1" />
//         {config.text}
//       </span>
//     );
//   };

//   const getTypeIcon = (type: string) => {
//     const typeConfig = {
//       test: { icon: Target, color: 'text-green-600' },
//       quiz: { icon: CheckSquare, color: 'text-purple-600' },
//       mid_term: { icon: Calendar, color: 'text-indigo-600' },
//       final_exam: { icon: Award, color: 'text-red-600' },
//       practical: { icon: GraduationCap, color: 'text-blue-600' },
//       oral_exam: { icon: Users, color: 'text-orange-600' }
//     };

//     const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.test;
//     const Icon = config.icon;

//     return <Icon className={`w-5 h-5 ${config.color}`} />;
//   };

//   if (isLoading) {
//     return (
//       <TeacherDashboardLayout>
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//         </div>
//       </TeacherDashboardLayout>
//     );
//   }

//   return (
//     <TeacherDashboardLayout>
//       <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
//         {/* Header - Mobile Optimized */}
//         <div className="space-y-3">
//           <div className="flex flex-col space-y-2">
//             <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
//               Exam & Test Management
//             </h1>
//             <p className="text-sm text-slate-600 dark:text-slate-400">
//               Create and manage exams, tests, and assessments
//             </p>
//           </div>
//           <button
//             onClick={handleRefresh}
//             className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
//           >
//             <RefreshCw className="w-4 h-4" />
//             <span>Refresh</span>
//           </button>
//         </div>

//         {/* Summary Cards - Mobile Grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
//           <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
//             <div className="flex flex-col items-center sm:items-start">
//               <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2" />
//               <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total</p>
//               <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{exams.length}</p>
//             </div>
//           </div>
          
//           <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
//             <div className="flex flex-col items-center sm:items-start">
//               <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2" />
//               <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Scheduled</p>
//               <p className="text-xl sm:text-2xl font-bold text-blue-600">{exams.filter(e => e.status === 'scheduled').length}</p>
//             </div>
//           </div>
          
//           <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
//             <div className="flex flex-col items-center sm:items-start">
//               <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 mb-2" />
//               <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Active</p>
//               <p className="text-xl sm:text-2xl font-bold text-yellow-600">{exams.filter(e => e.status === 'in_progress').length}</p>
//             </div>
//           </div>
          
//           <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
//             <div className="flex flex-col items-center sm:items-start">
//               <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mb-2" />
//               <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Done</p>
//               <p className="text-xl sm:text-2xl font-bold text-green-600">{exams.filter(e => e.status === 'completed').length}</p>
//             </div>
//           </div>
          
//           <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
//             <div className="flex flex-col items-center sm:items-start">
//               <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mb-2" />
//               <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Tests</p>
//               <p className="text-xl sm:text-2xl font-bold text-purple-600">{exams.filter(e => e.exam_type === 'test' || e.exam_type === 'quiz').length}</p>
//             </div>
//           </div>
//         </div>

//         {/* Tabs - Mobile Friendly */}
//         <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
//           <button
//             onClick={() => setActiveTab('exams')}
//             className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
//               activeTab === 'exams'
//                 ? 'bg-blue-600 text-white'
//                 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
//             }`}
//           >
//             <div className="flex items-center justify-center space-x-2">
//               <GraduationCap className="w-4 h-4" />
//               <span>Exams</span>
//             </div>
//           </button>
//           <button
//             onClick={() => setActiveTab('tests')}
//             className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
//               activeTab === 'tests'
//                 ? 'bg-blue-600 text-white'
//                 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
//             }`}
//           >
//             <div className="flex items-center justify-center space-x-2">
//               <Target className="w-4 h-4" />
//               <span>Tests</span>
//             </div>
//           </button>
//         </div>

//         {/* Action Buttons & Search - Mobile Layout */}
//         <div className="space-y-3">
//           {activeTab === 'exams' ? (
//             <button
//               onClick={handleCreateExam}
//               className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//             >
//               <Plus className="w-5 h-5" />
//               <span>Create New Exam</span>
//             </button>
//           ) : (
//             <button
//               onClick={handleCreateTest}
//               className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
//             >
//               <Plus className="w-5 h-5" />
//               <span>Create New Test</span>
//             </button>
//           )}

//           {/* Search Bar */}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//             <input
//               type="text"
//               placeholder="Search exams..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//             />
//           </div>

//           {/* Mobile Filter Toggle */}
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
//           >
//             <Filter className="w-4 h-4" />
//             <span>Filters</span>
//             <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
//           </button>

//           {/* Filters - Collapsible on Mobile */}
//           {showFilters && (
//             <div className="space-y-2">
//               <select
//                 value={filterSubject}
//                 onChange={(e) => setFilterSubject(e.target.value)}
//                 className="w-full px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//               >
//                 <option value="all">All Subjects</option>
//                 {uniqueSubjects.map(subject => (
//                   <option key={subject} value={subject}>{subject}</option>
//                 ))}
//               </select>

//               <select
//                 value={filterType}
//                 onChange={(e) => setFilterType(e.target.value)}
//                 className="w-full px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//               >
//                 <option value="all">All Types</option>
//                 <option value="test">Class Test</option>
//                 <option value="quiz">Quiz</option>
//                 <option value="mid_term">Mid-Term</option>
//                 <option value="final_exam">Final Exam</option>
//                 <option value="practical">Practical</option>
//                 <option value="oral_exam">Oral Exam</option>
//               </select>

//               <select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//                 className="w-full px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//               >
//                 <option value="all">All Status</option>
//                 <option value="scheduled">Scheduled</option>
//                 <option value="in_progress">In Progress</option>
//                 <option value="completed">Completed</option>
//                 <option value="cancelled">Cancelled</option>
//                 <option value="postponed">Postponed</option>
//               </select>
//             </div>
//           )}
//         </div>

//         {/* Content */}
//         {loading ? (
//           <div className="flex items-center justify-center py-12">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           </div>
//         ) : error ? (
//           <div className="text-center py-12">
//             <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//             <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
//             <button
//               onClick={loadTeacherData}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Try Again
//             </button>
//           </div>
//         ) : filteredExams.length === 0 ? (
//           <div className="text-center py-12">
//             <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//             <p className="text-slate-500 dark:text-slate-400 mb-1">
//               No {activeTab === 'exams' ? 'exams' : 'tests'} found
//             </p>
//             <p className="text-sm text-slate-400 dark:text-slate-500">
//               {activeTab === 'exams' 
//                 ? 'Create your first exam to get started'
//                 : 'Create your first test or quiz to get started'
//               }
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {filteredExams.filter(exam => exam.id !== 9).map((exam) => (
//               <div
//                 key={exam.id}
//                 className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
//               >
//                 {/* Card Header */}
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex items-start space-x-3 flex-1 min-w-0">
//                     <div className="flex-shrink-0 mt-0.5">
//                       {getTypeIcon(exam.exam_type)}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
//                         {exam.title}
//                       </h3>
//                       <p className="text-xs text-slate-500 dark:text-slate-400">
//                         {exam.code}
//                       </p>
//                     </div>
//                   </div>
                  
//                   {/* Mobile Menu */}
//                   <div className="relative flex-shrink-0">
//                     <button
//                       onClick={() => setActiveExamMenu(activeExamMenu === exam.id ? null : exam.id)}
//                       className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
//                     >
//                       <MoreVertical className="w-5 h-5" />
//                     </button>
                    
//                     {activeExamMenu === exam.id && (
//                       <>
//                         <div 
//                           className="fixed inset-0 z-40" 
//                           onClick={() => setActiveExamMenu(null)}
//                         />
//                         <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
//                           <button
//                             onClick={() => handleViewExam(exam)}
//                             className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
//                           >
//                             <Eye className="w-4 h-4" />
//                             <span>View Details</span>
//                           </button>
                          
//                           {(exam.status === 'scheduled' || exam.status === 'draft') && (
//                             <button
//                               onClick={() => activeTab === 'exams' ? handleEditExam(exam) : handleEditTest(exam)}
//                               className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
//                             >
//                               <Edit className="w-4 h-4" />
//                               <span>Edit</span>
//                             </button>
//                           )}
                          
//                           {(exam.status === 'completed' || exam.status === 'in_progress') && (
//                             <button
//                               onClick={() => navigate('/teacher/results')}
//                               className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
//                             >
//                               <Award className="w-4 h-4" />
//                               <span>Record Results</span>
//                             </button>
//                           )}
                          
//                           {exam.status === 'draft' && (
//                             <button
//                               onClick={() => handleSubmitForApproval(exam.id)}
//                               className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
//                             >
//                               <CheckCircle className="w-4 h-4" />
//                               <span>Submit for Approval</span>
//                             </button>
//                           )}
                          
//                           {(exam.status === 'scheduled' || exam.status === 'draft') && (
//                             <button
//                               onClick={() => handleDeleteExam(exam.id)}
//                               className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                               <span>Delete</span>
//                             </button>
//                           )}
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 </div>

//                 {/* Card Body - Mobile Optimized */}
//                 <div className="space-y-2 mb-3">
//                   <div className="flex flex-wrap items-center gap-2">
//                     <div className="flex items-center space-x-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
//                       <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
//                       <span className="truncate">{exam.subject_name}</span>
//                     </div>
//                     <span className="text-slate-300 dark:text-slate-600">•</span>
//                     <div className="flex items-center space-x-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
//                       <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
//                       <span className="truncate">{exam.grade_level_name}</span>
//                     </div>
//                   </div>
                  
//                   <div className="flex flex-wrap items-center gap-2">
//                     {getStatusBadge(exam.status)}
//                     <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
//                       <Clock className="w-3.5 h-3.5" />
//                       <span>{exam.duration_minutes} min</span>
//                     </div>
//                     <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
//                       <Target className="w-3.5 h-3.5" />
//                       <span>{exam.total_marks} marks</span>
//                     </div>
//                   </div>
                  
//                   {exam.exam_date && (
//                     <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
//                       <Calendar className="w-3.5 h-3.5" />
//                       <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
//                       {exam.start_time && (
//                         <span>• {exam.start_time}</span>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Exam Creation Modal */}
//       {showCreateModal && (
//         <ExamCreationForm
//           isOpen={showCreateModal}
//           onClose={closeExamModal}
//           onExamCreated={handleExamCreated}
//           editingExam={editingExam}
//           prefill={!editingExam && selectedExam ? {
//             title: selectedExam.title,
//             exam_type: selectedExam.exam_type,
//             subject: 0,
//             grade_level: 0,
//           } : undefined}
//         />
//       )}

//       {/* Test Creation Modal */}
//       {showTestModal && (
//         <TestCreationForm
//           isOpen={showTestModal}
//           onClose={closeTestModal}
//           onTestCreated={handleTestCreated}
//           editingTest={editingTest}
//         />
//       )}

//       {/* Exam View Modal - Mobile Optimized */}
//       {selectedExam && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
//           <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 z-10">
//               <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
//                 Exam Details
//               </h2>
//               <button
//                 onClick={closeViewModal}
//                 className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="p-4 sm:p-6 space-y-4">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Title</label>
//                   <p className="text-sm sm:text-base text-slate-900 dark:text-white mt-1">{selectedExam.title}</p>
//                 </div>
//                 <div>
//                   <label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Code</label>
//                   <p className="text-sm sm:text-base text-slate-900 dark:text-white mt-1">{selectedExam.code}</p>
//                 </div>
//                 <div>
//                   <label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Subject</label>
//                   <p className="text-sm sm:text-base text-slate-900 dark:text-white mt-1">{selectedExam.subject_name}</p>
//                 </div>
//                 <div>
//                   <label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Grade Level</label>
//                   <p className="text-sm sm:text-base text-slate-900 dark:text-white mt-1">{selectedExam.grade_level_name}</p>
//                 </div>
//                 <div>
//                   <label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Type</label>
//                   <p className="text-sm sm:text-base text-slate-900 dark:text-white mt-1">{selectedExam.exam_type_display}</p>
//                 </div>
//                 <div>
//                   <label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Total Marks</label>
//                   <p className="text-sm sm:text-base text-slate-900 dark:text-white mt-1">{selectedExam.total_marks}</p>
//                 </div>
//                 <div>
//                   <label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Duration</label>
//                   <p className="text-sm sm:text-base text-slate-900 dark:text-white mt-1">{selectedExam.duration_minutes} minutes</p>
//                 </div>
//                 <div>
//                   <label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Status</label>
//                   <div className="mt-1">{getStatusBadge(selectedExam.status)}</div>
//                 </div>
//               </div>

//               {selectedExam.exam_date && (
//                 <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
//                   <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3">Schedule</h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                     <div>
//                       <label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Date</label>
//                       <p className="text-sm sm:text-base text-slate-900 dark:text-white mt-1">
//                         {new Date(selectedExam.exam_date).toLocaleDateString()}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Start Time</label>
//                       <p className="text-sm sm:text-base text-slate-900 dark:text-white mt-1">{selectedExam.start_time}</p>
//                     </div>
//                     <div>
//                       <label className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">End Time</label>
//                       <p className="text-sm sm:text-base text-slate-900 dark:text-white mt-1">{selectedExam.end_time}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Questions Preview - Mobile Optimized */}
//               {selectedExamDetail && (
//                 <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-6">
//                   {(selectedExamDetail.objective_questions || []).length > 0 && (
//                     <div>
//                       <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3">Objective Questions</h3>
//                       <div className="space-y-3">
//                         {selectedExamDetail.objective_questions!.map((q: any, i: number) => (
//                           <div key={i} className="p-3 border border-slate-200 dark:border-slate-600 rounded text-sm">
//                             <div className="font-medium mb-2">{i + 1}. {q.question}</div>
//                             {q.imageUrl && (
//                               <img src={q.imageUrl} alt={q.imageAlt || 'question image'} className="max-h-32 sm:max-h-40 object-contain mb-2 rounded" />
//                             )}
//                             <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
//                               <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded">A. {q.optionA}</div>
//                               <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded">B. {q.optionB}</div>
//                               <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded">C. {q.optionC}</div>
//                               <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded">D. {q.optionD}</div>
//                             </div>
//                             <div className="text-xs text-slate-500 mt-2">Marks: {q.marks}</div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {(selectedExamDetail.theory_questions || []).length > 0 && (
//                     <div>
//                       <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3">Theory Questions</h3>
//                       <div className="space-y-3">
//                         {selectedExamDetail.theory_questions!.map((q: any, i: number) => (
//                           <div key={i} className="p-3 border border-slate-200 dark:border-slate-600 rounded text-sm">
//                             <div className="font-medium mb-2">{i + 1}. {q.question}</div>
//                             {q.imageUrl && (
//                               <img src={q.imageUrl} alt={q.imageAlt || 'theory image'} className="max-h-32 sm:max-h-40 object-contain mb-2 rounded" />
//                             )}
//                             {q.table && (
//                               <div className="overflow-auto mb-2">
//                                 <table className="min-w-full border border-slate-300 dark:border-slate-600 text-xs sm:text-sm">
//                                   <tbody>
//                                     {q.table.data.map((row: string[], r: number) => (
//                                       <tr key={r}>
//                                         {row.map((cell: string, c: number) => (
//                                           <td key={c} className="border border-slate-300 dark:border-slate-600 p-1">{cell}</td>
//                                         ))}
//                                       </tr>
//                                     ))}
//                                   </tbody>
//                                 </table>
//                               </div>
//                             )}
//                             {(q.subQuestions || []).length > 0 && (
//                               <div className="space-y-2 mt-2">
//                                 {q.subQuestions.map((sq: any, si: number) => (
//                                   <div key={si} className="pl-3 border-l-2 border-slate-300 dark:border-slate-600">
//                                     <div className="mb-1 text-xs sm:text-sm">{i + 1}{String.fromCharCode(97 + si)}. {sq.question} ({sq.marks || 0} marks)</div>
//                                     {(sq.subSubQuestions || []).length > 0 && (
//                                       <div className="pl-3 space-y-1">
//                                         {sq.subSubQuestions.map((ssq: any, ssi: number) => (
//                                           <div key={ssi} className="text-xs">{i + 1}{String.fromCharCode(97 + si)}{String.fromCharCode(105 + ssi)}. {ssq.question} ({ssq.marks || 0})</div>
//                                         ))}
//                                       </div>
//                                     )}
//                                   </div>
//                                 ))}
//                               </div>
//                             )}
//                             <div className="text-xs text-slate-500 mt-2">Marks: {q.marks}</div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {(selectedExamDetail.custom_sections || []).length > 0 && (
//                     <div>
//                       <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3">Custom Sections</h3>
//                       <div className="space-y-3">
//                         {selectedExamDetail.custom_sections!.map((s: any, si: number) => (
//                           <div key={s.id || si} className="p-3 border border-slate-200 dark:border-slate-600 rounded">
//                             <div className="font-medium mb-1 text-sm sm:text-base">{s.name}</div>
//                             {s.instructions && <div className="text-xs text-slate-500 mb-2">{s.instructions}</div>}
//                             {(s.questions || []).map((q: any, qi: number) => (
//                               <div key={q.id || qi} className="mt-2 text-sm">
//                                 <div className="mb-1">{qi + 1}. {q.question}</div>
//                                 {q.imageUrl && (
//                                   <img src={q.imageUrl} alt={q.imageAlt || 'custom image'} className="max-h-32 sm:max-h-40 object-contain mb-2 rounded" />
//                                 )}
//                                 {q.table && (
//                                   <div className="overflow-auto mb-2">
//                                     <table className="min-w-full border border-slate-300 dark:border-slate-600 text-xs">
//                                       <tbody>
//                                         {q.table.data.map((row: string[], r: number) => (
//                                           <tr key={r}>
//                                             {row.map((cell: string, c: number) => (
//                                               <td key={c} className="border border-slate-300 dark:border-slate-600 p-1">{cell}</td>
//                                             ))}
//                                           </tr>
//                                         ))}
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                 )}
//                                 <div className="text-xs text-slate-500">Marks: {q.marks || 0}</div>
//                               </div>
//                             ))}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </TeacherDashboardLayout>
//   );
// };

// export default TeacherExams;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import TeacherDashboardService from '@/services/TeacherDashboardService';
import { ExamService, ExamCreateData } from '@/services/ExamService';
import { toast } from 'react-toastify';
import { X, Plus, Trash2, Save, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  normalizeExamDataForSave, 
  normalizeExamDataForEdit 
} from '@/utils/examDataNormalizer';

interface ExamCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onExamCreated: () => void;
  editingExam?: any;
  prefill?: Partial<ExamCreateData>;
}

const ExamCreationForm: React.FC<ExamCreationFormProps> = ({
  isOpen,
  onClose,
  onExamCreated,
  editingExam,
  prefill
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'questions'>('basic');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState<ExamCreateData>({
    title: '',
    subject: 0,
    grade_level: 0,
    exam_type: 'test',
    difficulty_level: 'medium',
    exam_date: '',
    start_time: '',
    end_time: '',
    duration_minutes: 45,
    total_marks: 100,
    pass_marks: 50,
    venue: '',
    instructions: '',
    status: 'scheduled',
    is_practical: false,
    requires_computer: false,
    is_online: false,
    objective_questions: [],
    theory_questions: [],
    practical_questions: [],
    custom_sections: [],
    objective_instructions: '',
    theory_instructions: '',
    practical_instructions: ''
  });

  const [objectiveQuestions, setObjectiveQuestions] = useState<any[]>([]);
  const [theoryQuestions, setTheoryQuestions] = useState<any[]>([]);
  const [practicalQuestions, setPracticalQuestions] = useState<any[]>([]);
  const [customSections, setCustomSections] = useState<any[]>([]);
  const [sectionOrder, setSectionOrder] = useState<Array<{ kind: 'objective' | 'theory' | 'practical' | 'custom'; id?: number }>>([]);
  const [gradeLevels, setGradeLevels] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [objectiveInstructions, setObjectiveInstructions] = useState<string>('');
  const [theoryInstructions, setTheoryInstructions] = useState<string>('');
  const [practicalInstructions, setPracticalInstructions] = useState<string>('');
  const [currentTeacherId, setCurrentTeacherId] = useState<number | null>(null);

  const getQuestionNumber = (questionIndex: number, subQuestionIndex?: number, subSubQuestionIndex?: number) => {
    const baseNumber = questionIndex + 1;
    
    if (subSubQuestionIndex !== undefined) {
      return `${baseNumber}${String.fromCharCode(97 + (subQuestionIndex || 0))}${String.fromCharCode(105 + subSubQuestionIndex)}`;
    } else if (subQuestionIndex !== undefined) {
      const question = theoryQuestions[questionIndex];
      if (question && question.subQuestions && question.subQuestions.length > 0) {
        return `${baseNumber}${String.fromCharCode(98 + subQuestionIndex)}`;
      } else {
        return `${baseNumber}${String.fromCharCode(97 + subQuestionIndex)}`;
      }
    } else {
      const question = theoryQuestions[questionIndex];
      if (question && question.subQuestions && question.subQuestions.length > 0) {
        return `${baseNumber}a`;
      } else {
        return `${baseNumber}.`;
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTeacherData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !editingExam && prefill) {
      setFormData(prev => ({
        ...prev,
        ...prefill,
        subject: prefill.subject ?? prev.subject,
        grade_level: prefill.grade_level ?? prev.grade_level,
      }));
    }
  }, [isOpen, editingExam, prefill]);

  useEffect(() => {
    if (editingExam) {
      const normalized = normalizeExamDataForEdit(editingExam);
      
      setFormData({
        title: normalized.title || '',
        subject: normalized.subject?.id || normalized.subject || 0,
        grade_level: normalized.grade_level?.id || normalized.grade_level || 0,
        exam_type: normalized.exam_type || 'test',
        difficulty_level: normalized.difficulty_level || 'medium',
        exam_date: normalized.exam_date || '',
        start_time: normalized.start_time || '',
        end_time: normalized.end_time || '',
        duration_minutes: normalized.duration_minutes || 45,
        total_marks: normalized.total_marks || 100,
        pass_marks: normalized.pass_marks || 50,
        venue: normalized.venue || '',
        instructions: normalized.instructions || '',
        status: normalized.status || 'scheduled',
        is_practical: normalized.is_practical || false,
        requires_computer: normalized.is_requires_computer || false,
        is_online: normalized.is_online || false,
        objective_questions: normalized.objective_questions || [],
        theory_questions: normalized.theory_questions || [],
        practical_questions: normalized.practical_questions || [],
        custom_sections: normalized.custom_sections || [],
        objective_instructions: normalized.objective_instructions || '',
        theory_instructions: normalized.theory_instructions || '',
        practical_instructions: normalized.practical_instructions || ''
      });

      setObjectiveQuestions(normalized.objective_questions || []);
      setTheoryQuestions(normalized.theory_questions || []);
      setPracticalQuestions(normalized.practical_questions || []);
      const existingCustom = normalized.custom_sections || [];
      setCustomSections(existingCustom);
      setObjectiveInstructions(normalized.objective_instructions || '');
      setTheoryInstructions(normalized.theory_instructions || '');
      setPracticalInstructions(normalized.practical_instructions || '');
      const order: Array<{ kind: 'objective' | 'theory' | 'practical' | 'custom'; id?: number }> = [
        { kind: 'objective' },
        { kind: 'theory' },
        { kind: 'practical' }
      ];
      for (const s of existingCustom) {
        order.push({ kind: 'custom', id: s.id });
      }
      setSectionOrder(order);
    }
  }, [editingExam]);

  useEffect(() => {
    if (isOpen && !editingExam) {
      setSectionOrder([
        { kind: 'objective' },
        { kind: 'theory' },
        { kind: 'practical' }
      ]);
    }
  }, [isOpen, editingExam]);

  const loadTeacherData = async () => {
    try {
      const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
      
      if (!teacherId) {
        toast.error('Teacher ID not found');
        return;
      }
      setCurrentTeacherId(Number(teacherId));

      const assignments = await TeacherDashboardService.getTeacherClasses(teacherId);

      const uniqueGradeLevels = Array.from(
        new Map(assignments.map((a: any) => [a.grade_level_id, { id: a.grade_level_id, name: a.grade_level_name }])).values()
      );
      const uniqueSubjects = Array.from(
        new Map(assignments.map((a: any) => [a.subject_id, { id: a.subject_id, name: a.subject_name }])).values()
      );

      setGradeLevels(uniqueGradeLevels);
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error loading teacher data:', error);
      toast.error('Failed to load teacher data');
    }
  };

  const handleInputChange = (field: keyof ExamCreateData, value: any) => {
    const numericFields: (keyof ExamCreateData)[] = ['total_marks', 'pass_marks', 'duration_minutes'];
    const parsedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: parsedValue }));
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const toggleQuestion = (questionKey: string) => {
    setExpandedQuestions(prev => ({ ...prev, [questionKey]: !prev[questionKey] }));
  };

  const addObjectiveQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      marks: 1,
      imageUrl: '',
      imageAlt: ''
    };
    setObjectiveQuestions(prev => [...prev, newQuestion]);
    setExpandedQuestions(prev => ({ ...prev, [`obj-${newQuestion.id}`]: true }));
  };

  const updateObjectiveQuestion = (index: number, field: string, value: string) => {
    setObjectiveQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: field === 'marks' ? Number(value) : value } : q
    ));
  };

  const removeObjectiveQuestion = (index: number) => {
    setObjectiveQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const addTheoryQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      expectedPoints: '',
      marks: 5,
      wordLimit: '100-150',
      imageUrl: '',
      imageAlt: '',
      subQuestions: [],
      table: null as null | { rows: number; cols: number; data: string[][] }
    };
    setTheoryQuestions(prev => [...prev, newQuestion]);
    setExpandedQuestions(prev => ({ ...prev, [`theory-${newQuestion.id}`]: true }));
  };

  const updateTheoryQuestion = (index: number, field: string, value: string | number) => {
    setTheoryQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const removeTheoryQuestion = (index: number) => {
    setTheoryQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const addPracticalQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      task: '',
      materials: '',
      expectedOutcome: '',
      marks: 10,
      timeLimit: '30 minutes',
      imageUrl: '',
      imageAlt: ''
    };
    setPracticalQuestions(prev => [...prev, newQuestion]);
    setExpandedQuestions(prev => ({ ...prev, [`prac-${newQuestion.id}`]: true }));
  };

  const updatePracticalQuestion = (index: number, field: string, value: string | number) => {
    setPracticalQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const removePracticalQuestion = (index: number) => {
    setPracticalQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomSection = () => {
    const newSection = {
      id: Date.now(),
      name: '',
      instructions: '',
      questions: [] as Array<{ id: number; question: string; marks: number; imageUrl?: string; imageAlt?: string; table?: { rows: number; cols: number; data: string[][] } }>
    };
    setCustomSections(prev => [...prev, newSection]);
    setSectionOrder(prev => [...prev, { kind: 'custom', id: newSection.id }]);
    setExpandedSections(prev => ({ ...prev, [`custom-${newSection.id}`]: true }));
  };

  const insertCustomSectionAt = (position: number) => {
    const newSection = {
      id: Date.now(),
      name: '',
      instructions: '',
      questions: []
    };
    setCustomSections(prev => [...prev, newSection]);
    setSectionOrder(prev => {
      const copy = [...prev];
      copy.splice(position, 0, { kind: 'custom', id: newSection.id });
      return copy;
    });
    setExpandedSections(prev => ({ ...prev, [`custom-${newSection.id}`]: true }));
  };

  const removeCustomSectionById = (sectionId: number) => {
    setCustomSections(prev => prev.filter(s => s.id !== sectionId));
    setSectionOrder(prev => prev.filter(item => !(item.kind === 'custom' && item.id === sectionId)));
  };

  const getOrderedCustomSections = () => {
    const idToSection = new Map(customSections.map(s => [s.id, s] as const));
    return sectionOrder.filter(s => s.kind === 'custom' && s.id).map(s => idToSection.get(s.id!)).filter(Boolean);
  };

  const calculateTotalMarks = () => {
    const objectiveMarks = objectiveQuestions.reduce((sum: number, q: any) => sum + (Number(q.marks) || 0), 0);
    const theoryMarks = theoryQuestions.reduce((sum: number, q: any) => {
      const base = sum + (Number(q.marks) || 0);
      const subQ = (q.subQuestions || []).reduce((ss: number, sq: any) => {
        const baseSq = ss + (Number(sq.marks) || 0);
        const subSub = (sq.subSubQuestions || []).reduce((sss: number, s2: any) => sss + (Number(s2.marks) || 0), 0);
        return baseSq + subSub;
      }, 0);
      return base + subQ;
    }, 0);
    const practicalMarks = practicalQuestions.reduce((sum: number, q: any) => sum + (Number(q.marks) || 0), 0);
    const customMarks = customSections.reduce((sum: number, s: any) =>
      sum + (s.questions || []).reduce((qSum: number, q: any) => qSum + (Number(q.marks) || 0), 0), 0
    );
    return objectiveMarks + theoryMarks + practicalMarks + customMarks;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const cloudinaryData = new FormData();
      cloudinaryData.append('file', file);
      cloudinaryData.append('upload_preset', 'profile_upload');
      const res = await axios.post('https://api.cloudinary.com/v1_1/djbz7wunu/image/upload', cloudinaryData);
      return res.data.secure_url as string;
    } catch (err) {
      toast.error('Image upload failed. Please try again.');
      return null;
    }
  };

  const addSubQuestion = (questionIndex: number) => {
    const newSub = { id: Date.now(), question: '', marks: 0, subSubQuestions: [] as Array<{ id: number; question: string; marks: number }> };
    setTheoryQuestions(prev => prev.map((q, i) => i === questionIndex ? { ...q, subQuestions: [ ...(q.subQuestions || []), newSub ] } : q));
  };

  const updateSubQuestion = (questionIndex: number, subIndex: number, field: string, value: any) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q;
      const copy = [ ...(q.subQuestions || []) ];
      copy[subIndex] = { ...copy[subIndex], [field]: value };
      return { ...q, subQuestions: copy };
    }));
  };

  const removeSubQuestion = (questionIndex: number, subIndex: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => i === questionIndex ? { ...q, subQuestions: (q.subQuestions || []).filter((_: any, idx: number) => idx !== subIndex) } : q));
  };

  const addSubSubQuestion = (questionIndex: number, subIndex: number) => {
    const newSubSub = { id: Date.now(), question: '', marks: 0 };
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q;
      const subs = [ ...(q.subQuestions || []) ];
      const target = subs[subIndex];
      const updated = { ...target, subSubQuestions: [ ...(target.subSubQuestions || []), newSubSub ] };
      subs[subIndex] = updated;
      return { ...q, subQuestions: subs };
    }));
  };

  const updateSubSubQuestion = (questionIndex: number, subIndex: number, subSubIndex: number, field: string, value: any) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q;
      const subs = [ ...(q.subQuestions || []) ];
      const target = subs[subIndex];
      const subsubs = [ ...(target.subSubQuestions || []) ];
      subsubs[subSubIndex] = { ...subsubs[subSubIndex], [field]: value };
      subs[subIndex] = { ...target, subSubQuestions: subsubs };
      return { ...q, subQuestions: subs };
    }));
  };

  const removeSubSubQuestion = (questionIndex: number, subIndex: number, subSubIndex: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q;
      const subs = [ ...(q.subQuestions || []) ];
      const target = subs[subIndex];
      const subsubs = (target.subSubQuestions || []).filter((_: any, idx: number) => idx !== subSubIndex);
      subs[subIndex] = { ...target, subSubQuestions: subsubs };
      return { ...q, subQuestions: subs };
    }));
  };

  const initQuestionTable = (_q: any, rows: number, cols: number) => ({ rows, cols, data: Array.from({ length: rows }, () => Array.from({ length: cols }, () => '')) });

  const setTheoryTable = (index: number, rows: number, cols: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => i === index ? { ...q, table: initQuestionTable(q, rows, cols) } : q));
  };

  const updateTheoryTableCell = (qIndex: number, r: number, c: number, value: string) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const table = q.table;
      if (!table) return q;
      const data = table.data.map((row: string[], ri: number) => row.map((cell, ci) => (ri === r && ci === c ? value : cell)));
      return { ...q, table: { ...table, data } };
    }));
  };

  const addTheoryTableRow = (qIndex: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex || !q.table) return q;
      const cols = q.table.cols;
      const newRow = Array.from({ length: cols }, () => '');
      return { ...q, table: { ...q.table, rows: q.table.rows + 1, data: [...q.table.data, newRow] } };
    }));
  };

  const addTheoryTableCol = (qIndex: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex || !q.table) return q;
      const newData = q.table.data.map((row: string[]) => [...row, '']);
      return { ...q, table: { ...q.table, cols: q.table.cols + 1, data: newData } };
    }));
  };

  const removeTheoryTableRow = (qIndex: number, rowIndex?: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex || !q.table || q.table.rows <= 1) return q;
      const idx = rowIndex !== undefined ? rowIndex : q.table.rows - 1;
      const newData = q.table.data.filter((_: any, r: number) => r !== idx);
      return { ...q, table: { ...q.table, rows: q.table.rows - 1, data: newData } };
    }));
  };

  const removeTheoryTableCol = (qIndex: number, colIndex?: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex || !q.table || q.table.cols <= 1) return q;
      const idx = colIndex !== undefined ? colIndex : q.table.cols - 1;
      const newData = q.table.data.map((row: string[]) => row.filter((_: any, c: number) => c !== idx));
      return { ...q, table: { ...q.table, cols: q.table.cols - 1, data: newData } };
    }));
  };

  const setCustomTable = (sectionId: number, qIndex: number, rows: number, cols: number) => {
    setCustomSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const qs = [...(s.questions || [])];
      const target = qs[qIndex];
      qs[qIndex] = { ...target, table: initQuestionTable(target, rows, cols) };
      return { ...s, questions: qs };
    }));
  };

  const updateCustomTableCell = (sectionId: number, qIndex: number, r: number, c: number, value: string) => {
    setCustomSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const qs = [...(s.questions || [])];
      const target = qs[qIndex];
      const table = target.table;
      if (!table) return s;
      const data = table.data.map((row: string[], ri: number) => row.map((cell, ci) => (ri === r && ci === c ? value : cell)));
      qs[qIndex] = { ...target, table: { ...table, data } };
      return { ...s, questions: qs };
    }));
  };

  const addCustomTableRow = (sectionId: number, qIndex: number) => {
    setCustomSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const qs = [...(s.questions || [])];
      const q = qs[qIndex];
      if (!q?.table) return s;
      const cols = q.table.cols;
      const newRow = Array.from({ length: cols }, () => '');
      qs[qIndex] = { ...q, table: { ...q.table, rows: q.table.rows + 1, data: [...q.table.data, newRow] } };
      return { ...s, questions: qs };
    }));
  };

  const addCustomTableCol = (sectionId: number, qIndex: number) => {
    setCustomSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const qs = [...(s.questions || [])];
      const q = qs[qIndex];
      if (!q?.table) return s;
      const newData = q.table.data.map((row: string[]) => [...row, '']);
      qs[qIndex] = { ...q, table: { ...q.table, cols: q.table.cols + 1, data: newData } };
      return { ...s, questions: qs };
    }));
  };

  const removeCustomTableRow = (sectionId: number, qIndex: number, rowIndex?: number) => {
    setCustomSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const qs = [...(s.questions || [])];
      const q = qs[qIndex];
      if (!q?.table || q.table.rows <= 1) return s;
      const idx = rowIndex !== undefined ? rowIndex : q.table.rows - 1;
      const newData = q.table.data.filter((_: any, r: number) => r !== idx);
      qs[qIndex] = { ...q, table: { ...q.table, rows: q.table.rows - 1, data: newData } };
      return { ...s, questions: qs };
    }));
  };

  const removeCustomTableCol = (sectionId: number, qIndex: number, colIndex?: number) => {
    setCustomSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const qs = [...(s.questions || [])];
      const q = qs[qIndex];
      if (!q?.table || q.table.cols <= 1) return s;
      const idx = colIndex !== undefined ? colIndex : q.table.cols - 1;
      const newData = q.table.data.map((row: string[]) => row.filter((_: any, c: number) => c !== idx));
      qs[qIndex] = { ...q, table: { ...q.table, cols: q.table.cols - 1, data: newData } };
      return { ...s, questions: qs };
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter exam title');
      return false;
    }
    if (!formData.subject) {
      toast.error('Please select a subject');
      return false;
    }
    if (!formData.grade_level) {
      toast.error('Please select a grade level');
      return false;
    }
    if (!formData.exam_date) {
      toast.error('Please select exam date');
      return false;
    }
    if (!formData.start_time || !formData.end_time) {
      toast.error('Please set start and end times');
      return false;
    }
    if (objectiveQuestions.length === 0 && theoryQuestions.length === 0 && 
        practicalQuestions.length === 0 && customSections.length === 0) {
      toast.error('Please add at least one question');
      return false;
    }
    
    if (!currentTeacherId || currentTeacherId <= 0) {
      toast.error('Teacher ID not found. Please refresh and try again.');
      return false;
    }
    
    return true;
  };

  const saveAsDraft = async () => {
    if (!validateForm()) return;

    try {
      setSavingDraft(true);
      
      const examData: ExamCreateData = {
        ...formData,
        status: 'scheduled',
        teacher: currentTeacherId!,
        objective_questions: objectiveQuestions,
        theory_questions: theoryQuestions,
        practical_questions: practicalQuestions,
        custom_sections: getOrderedCustomSections(),
        objective_instructions: objectiveInstructions,
        theory_instructions: theoryInstructions,
        practical_instructions: practicalInstructions,
        total_marks: calculateTotalMarks()
      };

      const normalizedData = normalizeExamDataForSave(examData);

      if (editingExam) {
        await ExamService.updateExam(editingExam.id, normalizedData);
        toast.success('Exam updated successfully!');
      } else {
        const response = await ExamService.createExam(normalizedData);
        toast.success(`Exam saved successfully! ID: ${response?.id || 'N/A'}`);
      }

      onExamCreated();
      onClose();
    } catch (error) {
      console.error('❌ Error saving exam:', error);
      toast.error('Failed to save exam. Please try again.');
    } finally {
      setSavingDraft(false);
    }
  };

  const submitForApproval = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const examData: ExamCreateData = {
        ...formData,
        status: 'scheduled',
        teacher: currentTeacherId!,
        objective_questions: objectiveQuestions,
        theory_questions: theoryQuestions,
        practical_questions: practicalQuestions,
        custom_sections: getOrderedCustomSections(),
        objective_instructions: objectiveInstructions,
        theory_instructions: theoryInstructions,
        practical_instructions: practicalInstructions,
        total_marks: calculateTotalMarks()
      };

      const normalizedData = normalizeExamDataForSave(examData);

      if (editingExam) {
        await ExamService.updateExam(editingExam.id, normalizedData);
        toast.success('Exam submitted for review successfully!');
      } else {
        await ExamService.createExam(normalizedData);
        toast.success('Exam submitted for review successfully!');
      }

      onExamCreated();
      onClose();
    } catch (error) {
      console.error('❌ Error submitting exam:', error);
      toast.error('Failed to submit exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Scheduled' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X, text: 'Cancelled' },
      postponed: { color: 'bg-orange-100 text-orange-800', icon: Clock, text: 'Postponed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-6xl my-4 sm:my-8 max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-3 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
              {editingExam ? 'Edit Exam' : 'Create New Exam'}
            </h2>
            {editingExam && <div className="hidden sm:block">{getStatusBadge(editingExam.status)}</div>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 shrink-0">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {currentTeacherId && (
          <div className="px-3 sm:px-6 py-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 border-b dark:border-slate-600">
            Teacher ID: {currentTeacherId}
          </div>
        )}

        {/* Tabs */}
        <div className="sticky top-[60px] sm:top-[88px] z-10 flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto bg-white dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'basic' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'questions' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Questions
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {activeTab === 'basic' ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Exam Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm sm:text-base" placeholder="Enter exam title" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject *</label>
                  <select value={formData.subject} onChange={(e) => handleInputChange('subject', parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm sm:text-base">
                    <option value={0}>Select Subject</option>
                    {subjects.map((subject: any) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Grade Level *</label>
                  <select value={formData.grade_level} onChange={(e) => handleInputChange('grade_level', parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm sm:text-base">
                    <option value={0}>Select Grade Level</option>
                    {gradeLevels.map((gradeLevel: any) => (
                      <option key={gradeLevel.id} value={gradeLevel.id}>{gradeLevel.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Exam Type *</label>
                  <select value={formData.exam_type} onChange={(e) => handleInputChange('exam_type', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm sm:text-base">
                    <option value="test">Class Test</option>
                    <option value="quiz">Quiz</option>
                    <option value="mid_term">Mid-Term Examination</option>
                    <option value="final_exam">Final Examination</option>
                    <option value="practical">Practical Examination</option>
                    <option value="oral_exam">Oral Examination</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Difficulty Level</label>
                  <select value={formData.difficulty_level} onChange={(e) => handleInputChange('difficulty_level', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm sm:text-base">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Exam Date *</label>
                  <input type="date" value={formData.exam_date} onChange={(e) => handleInputChange('exam_date', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm sm:text-base" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Time *</label>
                  <input type="time" value={formData.start_time} onChange={(e) => handleInputChange('start_time', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm sm:text-base" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Time *</label>
                  <input type="time" value={formData.end_time} onChange={(e) => handleInputChange('end_time', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm sm:text-base" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration (minutes)</label>
                  <input type="number" value={formData.duration_minutes} onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm sm:text-base" min="15" max="300" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Total Marks</label>
                  <input type="number" value={formData.total_marks} onChange={(e) => handleInputChange('total_marks', parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm sm:text-base" min="1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pass Marks</label>
                  <input type="number" value={formData.pass_marks} onChange={(e) => handleInputChange('pass_marks', parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm sm:text-base" min="1" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Venue</label>
                  <input type="text" value={formData.venue} onChange={(e) => handleInputChange('venue', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm sm:text-base" placeholder="e.g., Room 101, Computer Lab" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Instructions</label>
                  <textarea value={formData.instructions} onChange={(e) => handleInputChange('instructions', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm sm:text-base" rows={3} placeholder="General instructions for students" />
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-700 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Exam Settings</h3>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.is_practical} onChange={(e) => handleInputChange('is_practical', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Practical Exam</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.requires_computer} onChange={(e) => handleInputChange('requires_computer', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Requires Computer</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.is_online} onChange={(e) => handleInputChange('is_online', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Online Exam</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sectionOrder.map((section, orderIndex) => {
                const sectionKey = `${section.kind}-${section.id ?? 'builtin'}`;
                const isExpanded = expandedSections[sectionKey] !== false;

                return (
                  <div key={sectionKey} className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 cursor-pointer" onClick={() => toggleSection(sectionKey)}>
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 shrink-0">Section {String.fromCharCode(65 + orderIndex)}:</span>
                        <h3 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                          {section.kind === 'objective' && 'Objective Questions'}
                          {section.kind === 'theory' && 'Theory Questions'}
                          {section.kind === 'practical' && 'Practical Questions'}
                          {section.kind === 'custom' && (customSections.find(s => s.id === section.id)?.name || 'Custom Section')}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3 sm:p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                          <button onClick={() => insertCustomSectionAt(orderIndex)} className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Add Before</button>
                          <button onClick={() => insertCustomSectionAt(orderIndex + 1)} className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Add After</button>
                          {section.kind === 'custom' && (
                            <button onClick={() => section.id && removeCustomSectionById(section.id)} className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 dark:hover:bg-slate-700 transition-colors">Remove Section</button>
                          )}
                        </div>

                        {section.kind === 'objective' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Section Instructions</label>
                              <textarea value={objectiveInstructions} onChange={(e) => setObjectiveInstructions(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" rows={2} placeholder="Enter instructions for this section" />
                            </div>

                            <button onClick={addObjectiveQuestion} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start">
                              <Plus className="w-4 h-4" />
                              <span>Add Question</span>
                            </button>

                            {objectiveQuestions.length > 0 && (
                              <div className="space-y-3">
                                {objectiveQuestions.map((question, index) => {
                                  const questionKey = `obj-${question.id}`;
                                  const isQuestionExpanded = expandedQuestions[questionKey] !== false;

                                  return (
                                    <div key={question.id} className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-slate-700 cursor-pointer" onClick={() => toggleQuestion(questionKey)}>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Question {index + 1}</span>
                                        <div className="flex items-center space-x-2">
                                          <button onClick={(e) => { e.stopPropagation(); removeObjectiveQuestion(index); }} className="text-red-500 hover:text-red-700 p-1">
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                          {isQuestionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                      </div>

                                      {isQuestionExpanded && (
                                        <div className="p-3 space-y-3">
                                          <textarea value={question.question} onChange={(e) => updateObjectiveQuestion(index, 'question', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" rows={2} placeholder="Enter question" />

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <input type="text" value={question.optionA} onChange={(e) => updateObjectiveQuestion(index, 'optionA', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Option A" />
                                            <input type="text" value={question.optionB} onChange={(e) => updateObjectiveQuestion(index, 'optionB', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Option B" />
                                            <input type="text" value={question.optionC} onChange={(e) => updateObjectiveQuestion(index, 'optionC', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Option C" />
                                            <input type="text" value={question.optionD} onChange={(e) => updateObjectiveQuestion(index, 'optionD', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Option D" />
                                          </div>

                                          <div className="grid grid-cols-2 gap-2">
                                            <select value={question.correctAnswer} onChange={(e) => updateObjectiveQuestion(index, 'correctAnswer', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm">
                                              <option value="">Correct Answer</option>
                                              <option value="A">A</option>
                                              <option value="B">B</option>
                                              <option value="C">C</option>
                                              <option value="D">D</option>
                                            </select>
                                            <input type="number" value={question.marks} onChange={(e) => updateObjectiveQuestion(index, 'marks', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Marks" min="1" />
                                          </div>

                                          <div className="grid grid-cols-1 gap-2">
                                            <input type="text" value={question.imageUrl || ''} onChange={(e) => updateObjectiveQuestion(index, 'imageUrl', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Image URL (optional)" />
                                            <label className="flex items-center justify-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                                              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                const file = e.target.files && e.target.files[0];
                                                if (!file) return;
                                                const url = await uploadImage(file);
                                                if (url) updateObjectiveQuestion(index, 'imageUrl', url);
                                              }} />
                                              Upload Image
                                            </label>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {section.kind === 'theory' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Section Instructions</label>
                              <textarea value={theoryInstructions} onChange={(e) => setTheoryInstructions(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" rows={2} placeholder="Enter instructions for this section" />
                            </div>

                            <button onClick={addTheoryQuestion} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start">
                              <Plus className="w-4 h-4" />
                              <span>Add Question</span>
                            </button>

                            {theoryQuestions.length > 0 && (
                              <div className="space-y-3">
                                {theoryQuestions.map((question, index) => {
                                  const questionKey = `theory-${question.id}`;
                                  const isQuestionExpanded = expandedQuestions[questionKey] !== false;

                                  return (
                                    <div key={question.id} className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-slate-700 cursor-pointer" onClick={() => toggleQuestion(questionKey)}>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Question {getQuestionNumber(index)}</span>
                                        <div className="flex items-center space-x-2">
                                          <button onClick={(e) => { e.stopPropagation(); removeTheoryQuestion(index); }} className="text-red-500 hover:text-red-700 p-1">
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                          {isQuestionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                      </div>

                                      {isQuestionExpanded && (
                                        <div className="p-3 space-y-3">
                                          <textarea value={question.question} onChange={(e) => updateTheoryQuestion(index, 'question', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" rows={3} placeholder="Enter question" />

                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <input type="text" value={question.expectedPoints} onChange={(e) => updateTheoryQuestion(index, 'expectedPoints', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Expected points" />
                                            <input type="number" value={question.marks} onChange={(e) => updateTheoryQuestion(index, 'marks', parseInt(e.target.value))} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Marks" min="1" />
                                            <input type="text" value={question.wordLimit} onChange={(e) => updateTheoryQuestion(index, 'wordLimit', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Word limit" />
                                          </div>

                                          <div className="flex flex-wrap gap-2">
                                            <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => setTheoryTable(index, 2, 2)}>Add 2x2 Table</button>
                                            <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => setTheoryTable(index, 3, 3)}>Add 3x3 Table</button>
                                            {question.table && (
                                              <>
                                                <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => addTheoryTableRow(index)}>+ Row</button>
                                                <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => addTheoryTableCol(index)}>+ Col</button>
                                                <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => removeTheoryTableRow(index)}>- Row</button>
                                                <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => removeTheoryTableCol(index)}>- Col</button>
                                              </>
                                            )}
                                          </div>

                                          {question.table && (
                                            <div className="overflow-x-auto -mx-3 px-3">
                                              <table className="min-w-full border border-slate-300 dark:border-slate-600">
                                                <tbody>
                                                  {question.table.data.map((row: string[], r: number) => (
                                                    <tr key={r}>
                                                      {row.map((cell: string, c: number) => (
                                                        <td key={c} className="border border-slate-300 dark:border-slate-600 p-1">
                                                          <input type="text" value={cell} onChange={(e) => updateTheoryTableCell(index, r, c, e.target.value)} className="w-full px-2 py-1 bg-transparent focus:outline-none text-sm" />
                                                        </td>
                                                      ))}
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}

                                          <div>
                                            <button onClick={() => addSubQuestion(index)} className="px-3 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600">Add Sub-question</button>
                                          </div>

                                          {(question.subQuestions || []).map((sq: any, sqi: number) => (
                                            <div key={sq.id} className="border border-slate-200 dark:border-slate-600 rounded p-2 sm:p-3 bg-slate-50 dark:bg-slate-800">
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs sm:text-sm font-medium">{getQuestionNumber(index, sqi)}</span>
                                                <div className="flex items-center space-x-2">
                                                  <button onClick={() => addSubSubQuestion(index, sqi)} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600">Add Sub-Sub</button>
                                                  <button onClick={() => removeSubQuestion(index, sqi)} className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 dark:hover:bg-slate-700">Remove</button>
                                                </div>
                                              </div>
                                              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                                                <textarea value={sq.question} onChange={(e) => updateSubQuestion(index, sqi, 'question', e.target.value)} className="sm:col-span-5 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white" rows={2} placeholder="Enter sub-question" />
                                                <input type="number" value={sq.marks || 0} onChange={(e) => updateSubQuestion(index, sqi, 'marks', parseInt(e.target.value))} className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white" placeholder="Marks" />
                                              </div>

                                              {(sq.subSubQuestions || []).map((ssq: any, ssqi: number) => (
                                                <div key={ssq.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 mt-2 pl-2 sm:pl-4 border-l-2 border-slate-300 dark:border-slate-600">
                                                  <span className="text-xs col-span-1 pt-2">{getQuestionNumber(index, sqi, ssqi)}</span>
                                                  <textarea value={ssq.question} onChange={(e) => updateSubSubQuestion(index, sqi, ssqi, 'question', e.target.value)} className="col-span-12 sm:col-span-8 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white" rows={2} placeholder="Enter sub-sub-question" />
                                                  <input type="number" value={ssq.marks || 0} onChange={(e) => updateSubSubQuestion(index, sqi, ssqi, 'marks', parseInt(e.target.value))} className="col-span-6 sm:col-span-2 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white" placeholder="Marks" />
                                                  <button onClick={() => removeSubSubQuestion(index, sqi, ssqi)} className="col-span-6 sm:col-span-1 px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 dark:hover:bg-slate-700">
                                                    <Trash2 className="w-3 h-3 mx-auto" />
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {section.kind === 'practical' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Section Instructions</label>
                              <textarea value={practicalInstructions} onChange={(e) => setPracticalInstructions(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" rows={2} placeholder="Enter instructions for this section" />
                            </div>

                            <button onClick={addPracticalQuestion} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start">
                              <Plus className="w-4 h-4" />
                              <span>Add Question</span>
                            </button>

                            {practicalQuestions.length > 0 && (
                              <div className="space-y-3">
                                {practicalQuestions.map((question, index) => {
                                  const questionKey = `prac-${question.id}`;
                                  const isQuestionExpanded = expandedQuestions[questionKey] !== false;

                                  return (
                                    <div key={question.id} className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-slate-700 cursor-pointer" onClick={() => toggleQuestion(questionKey)}>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Question {index + 1}</span>
                                        <div className="flex items-center space-x-2">
                                          <button onClick={(e) => { e.stopPropagation(); removePracticalQuestion(index); }} className="text-red-500 hover:text-red-700 p-1">
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                          {isQuestionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                      </div>

                                      {isQuestionExpanded && (
                                        <div className="p-3 space-y-3">
                                          <textarea value={question.task} onChange={(e) => updatePracticalQuestion(index, 'task', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" rows={2} placeholder="Task description" />

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <input type="text" value={question.materials} onChange={(e) => updatePracticalQuestion(index, 'materials', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Required materials" />
                                            <input type="text" value={question.expectedOutcome} onChange={(e) => updatePracticalQuestion(index, 'expectedOutcome', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Expected outcome" />
                                          </div>

                                          <div className="grid grid-cols-2 gap-2">
                                            <input type="number" value={question.marks} onChange={(e) => updatePracticalQuestion(index, 'marks', parseInt(e.target.value))} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Marks" min="1" />
                                            <input type="text" value={question.timeLimit} onChange={(e) => updatePracticalQuestion(index, 'timeLimit', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Time limit" />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {section.kind === 'custom' && (
                          <div className="space-y-4">
                            {(() => {
                              const custom = customSections.find(s => s.id === section.id);
                              if (!custom) return null;

                              const updateCustomField = (field: string, value: any) => {
                                setCustomSections(prev => prev.map(s => s.id === custom.id ? { ...s, [field]: value } : s));
                              };

                              const addQuestionToCustom = () => {
                                const newQ = { id: Date.now(), question: '', marks: 1, imageUrl: '', imageAlt: '' };
                                setCustomSections(prev => prev.map(s => s.id === custom.id ? { ...s, questions: [...(s.questions || []), newQ] } : s));
                                setExpandedQuestions(prev => ({ ...prev, [`custom-${custom.id}-q-${newQ.id}`]: true }));
                              };

                              const updateCustomQuestion = (qIndex: number, field: string, value: any) => {
                                setCustomSections(prev => prev.map(s => {
                                  if (s.id !== custom.id) return s;
                                  const qs = [...(s.questions || [])];
                                  qs[qIndex] = { ...qs[qIndex], [field]: value };
                                  return { ...s, questions: qs };
                                }));
                              };

                              const removeCustomQuestion = (qIndex: number) => {
                                setCustomSections(prev => prev.map(s => {
                                  if (s.id !== custom.id) return s;
                                  return { ...s, questions: (s.questions || []).filter((_: any, i: number) => i !== qIndex) };
                                }));
                              };

                              return (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input type="text" value={custom.name} onChange={(e) => updateCustomField('name', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Section name (e.g., Comprehension)" />
                                    <input type="text" value={custom.instructions} onChange={(e) => updateCustomField('instructions', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Section instructions" />
                                  </div>

                                  <button onClick={addQuestionToCustom} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start">
                                    <Plus className="w-4 h-4" />
                                    <span>Add Question</span>
                                  </button>

                                  {(custom.questions || []).length > 0 && (
                                    <div className="space-y-3">
                                      {custom.questions.map((q: any, qi: number) => {
                                        const questionKey = `custom-${custom.id}-q-${q.id}`;
                                        const isQuestionExpanded = expandedQuestions[questionKey] !== false;

                                        return (
                                          <div key={q.id} className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 cursor-pointer" onClick={() => toggleQuestion(questionKey)}>
                                              <span className="text-sm text-slate-600 dark:text-slate-300">Question {qi + 1}</span>
                                              <div className="flex items-center space-x-2">
                                                <button onClick={(e) => { e.stopPropagation(); removeCustomQuestion(qi); }} className="text-red-500 hover:text-red-700 p-1">
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                                {isQuestionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                              </div>
                                            </div>

                                            {isQuestionExpanded && (
                                              <div className="p-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                                                  <textarea value={q.question} onChange={(e) => updateCustomQuestion(qi, 'question', e.target.value)} className="sm:col-span-5 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" rows={2} placeholder="Enter question" />
                                                  <input type="number" value={q.marks} onChange={(e) => updateCustomQuestion(qi, 'marks', parseInt(e.target.value))} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm" placeholder="Marks" min="0" />
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                  <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => setCustomTable(custom.id, qi, 2, 2)}>Add 2x2 Table</button>
                                                  <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => setCustomTable(custom.id, qi, 3, 3)}>Add 3x3 Table</button>
                                                  {q.table && (
                                                    <>
                                                      <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => addCustomTableRow(custom.id, qi)}>+ Row</button>
                                                      <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => addCustomTableCol(custom.id, qi)}>+ Col</button>
                                                      <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => removeCustomTableRow(custom.id, qi)}>- Row</button>
                                                      <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => removeCustomTableCol(custom.id, qi)}>- Col</button>
                                                    </>
                                                  )}
                                                </div>

                                                {q.table && (
                                                  <div className="mt-3 overflow-x-auto -mx-3 px-3">
                                                    <table className="min-w-full border border-slate-300 dark:border-slate-600">
                                                      <tbody>
                                                        {q.table.data.map((row: string[], r: number) => (
                                                          <tr key={r}>
                                                            {row.map((cell: string, c: number) => (
                                                              <td key={c} className="border border-slate-300 dark:border-slate-600 p-1">
                                                                <input type="text" value={cell} onChange={(e) => updateCustomTableCell(custom.id, qi, r, c, e.target.value)} className="w-full px-2 py-1 bg-transparent focus:outline-none text-sm" />
                                                              </td>
                                                            ))}
                                                          </tr>
                                                        ))}
                                                      </tbody>
                                                    </table>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-center">
                <button onClick={addCustomSection} className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors w-full sm:w-auto justify-center">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add Section at End</span>
                </button>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Total Marks: {calculateTotalMarks()}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Pass Marks: {formData.pass_marks || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left hidden sm:block">
            {editingExam ? 'Update exam details and save changes' : 'Fill in exam details and add questions to submit for admin review'}
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button onClick={onClose} className="px-4 py-2.5 sm:py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
              Cancel
            </button>
            
            <button onClick={saveAsDraft} disabled={savingDraft || !currentTeacherId} className="flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
              <Save className="w-4 h-4" />
              <span>{savingDraft ? 'Saving...' : 'Save Exam'}</span>
            </button>
            
            <button onClick={submitForApproval} disabled={loading || !currentTeacherId} className="flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit for Review'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCreationForm;