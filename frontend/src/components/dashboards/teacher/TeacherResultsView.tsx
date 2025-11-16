// // import React, { useEffect, useMemo, useState, useRef } from 'react';
// // import { useAuth } from '@/hooks/useAuth';
// // import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
// // import TeacherDashboardService from '@/services/TeacherDashboardService';
// // import ResultService from '@/services/ResultService';
// // import ResultCreateTab from '@/components/dashboards/teacher/ResultCreateTab';
// // import useResultActionsManager from '@/components/dashboards/teacher/ResultActionsManager';
// // import { toast } from 'react-toastify';
// // import { TeacherAssignment, StudentResult } from '@/types/types';
// // import {
// //   Plus,
// //   Edit,
// //   Trash2,
// //   Eye,
// //   CheckCircle,
// //   AlertCircle,
// //   RefreshCw,
// //   Search,
// //   X,
// //   FileText,
// //   User,
// //   Archive,
// //   Table as TableIcon,
// //   Grid,
// //   ChevronRight,
// //   ChevronLeft,
// // } from 'lucide-react';

// // type EducationLevel =
// //   | 'NURSERY'
// //   | 'PRIMARY'
// //   | 'JUNIOR_SECONDARY'
// //   | 'SENIOR_SECONDARY'
// //   | 'UNKNOWN'
// //   | 'MIXED'
// //   | string;

// // type ResultStatus = 'DRAFT' | 'PUBLISHED' | 'APPROVED' | 'ARCHIVED' | string;

// // type TableColumn = {
// //   key:
// //     | 'student'
// //     | 'subject'
// //     | 'session'
// //     | 'test1'
// //     | 'test2'
// //     | 'test3'
// //     | 'ca_total'
// //     | 'ca'
// //     | 'project'
// //     | 'take_home'
// //     | 'practical'
// //     | 'note_copy'
// //     | 'exam'
// //     | 'total'
// //     | 'grade'
// //     | 'status'
// //     | 'actions';
// //   label: string;
// //   width: number;
// //   center?: boolean;
// //   sticky?: 'left' | 'right';
// // };

// // const TeacherResults: React.FC = () => {
// //   const { user, isLoading } = useAuth();

// //   const [results, setResults] = useState<StudentResult[]>([]);
// //   const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [filterSubject, setFilterSubject] = useState('all');
// //   const [filterStatus, setFilterStatus] = useState('all');
// //   const [filterEducationLevel, setFilterEducationLevel] = useState<EducationLevel | 'all'>('all');
// //   const [activeTab, setActiveTab] = useState<'results' | 'record'>('results');
// //   const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
// //   const [debugInfo, setDebugInfo] = useState<string>('');
// //   const [canScrollLeft, setCanScrollLeft] = useState(false);
// //   const [canScrollRight, setCanScrollRight] = useState(false);
  
// //   const tableContainerRef = useRef<HTMLDivElement>(null);

// //   async function loadTeacherData() {
// //     try {
// //       setLoading(true);
// //       setError(null);
// //       let debugLog = '';

// //       const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user as unknown as object);
// //       debugLog += `Teacher ID: ${teacherId}\n`;
      
// //       if (!teacherId) throw new Error('Teacher ID not found');

// //       const subjects = await TeacherDashboardService.getTeacherSubjects(teacherId);
// //       debugLog += `Subjects loaded: ${subjects.length}\n`;
// //       debugLog += `Subject IDs: ${subjects.map((s: any) => s.id).join(', ')}\n`;

// //       const assignments: TeacherAssignment[] = subjects.map((subject: any) => {
// //         const educationLevel = subject.education_level 
// //           || subject.grade_level_education_level
// //           || subject.classroom_education_level
// //           || (subject.assignments && subject.assignments[0]?.education_level)
// //           || (subject.assignments && subject.assignments[0]?.grade_level?.education_level)
// //           || 'UNKNOWN';
        
// //         return {
// //           id: subject.id,
// //           classroom_name: subject.classroom ?? 'Unknown',
// //           section_name: subject.section_name ?? subject.section ?? 'Unknown',
// //           grade_level_name: subject.grade_level_name ?? subject.grade_level ?? 'Unknown',
// //           education_level: educationLevel,
// //           subject_name: subject.subject_name ?? subject.name ?? 'Unknown Subject',
// //           subject_code: subject.subject_code ?? subject.code ?? '',
// //           subject_id: Number(subject.subject_id ?? subject.id),
// //           grade_level_id: subject.grade_level_id ?? null,
// //           section_id: subject.section_id ?? null,
// //           student_count: subject.student_count ?? 0,
// //           periods_per_week: subject.periods_per_week ?? 0,
// //           teacher: subject.teacher ?? null,
// //           grade_level: subject.grade_level ?? null,
// //           section: subject.section ?? null,
// //           academic_year: subject.academic_year ?? null,
// //           is_primary_teacher: subject.is_primary_teacher ?? false,
// //         };
// //       });
// //       setTeacherAssignments(assignments);

// //       const subjectIds = subjects.map((s: any) => s.id).filter(Boolean);
// //       debugLog += `Subject IDs for query: ${subjectIds.join(', ')}\n`;

// //       if (subjectIds.length) {
// //         const educationLevels = new Set<string>();
        
// //         subjects.forEach((s: any) => {
// //           const level = s.education_level 
// //             || s.grade_level_education_level
// //             || s.classroom_education_level;
          
// //           if (level) educationLevels.add(level);
          
// //           if (s.assignments && Array.isArray(s.assignments)) {
// //             s.assignments.forEach((assignment: any) => {
// //               const assignmentLevel = assignment.education_level 
// //                 || assignment.grade_level?.education_level
// //                 || assignment.classroom?.education_level;
// //               if (assignmentLevel) educationLevels.add(assignmentLevel);
// //             });
// //           }
// //         });
        
// //         let levelsToQuery = Array.from(educationLevels);
        
// //         if (levelsToQuery.length === 0) {
// //           levelsToQuery = ['NURSERY', 'PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'];
// //           debugLog += `No education levels found, querying all common levels\n`;
// //         } else {
// //           debugLog += `Education levels found: ${levelsToQuery.join(', ')}\n`;
// //         }

// //         const allResults: any[] = [];
        
// //         for (const level of levelsToQuery) {
// //           try {
// //             debugLog += `Querying ${level} with subjects: ${subjectIds.join(',')}\n`;
// //             const levelResults = await ResultService.getStudentResults({ 
// //               subject: subjectIds.join(','),
// //               education_level: level
// //             });
// //             const resultsArray = Array.isArray(levelResults) 
// //               ? levelResults 
// //               : ((levelResults as any)?.data || (levelResults as any)?.results || []);
// //             allResults.push(...resultsArray);
// //             debugLog += `Results for ${level}: ${resultsArray.length}\n`;
// //           } catch (levelErr) {
// //             debugLog += `Error fetching results for ${level}: ${levelErr}\n`;
// //           }
// //         }
        
// //         debugLog += `Total raw results: ${allResults.length}\n`;

// //         const normalized: StudentResult[] = allResults.map((r: any): StudentResult => {
// //           const studentId = (r.student && r.student.id) || r.student || r.student_id;
// //           const subjectId = (r.subject && r.subject.id) || r.subject || r.subject_id;
// //           const examSessionId = (r.exam_session && r.exam_session.id) || r.exam_session || r.exam_session_id || r.session_id;

// //           const caFromSenior = Number(r.first_test_score || 0) + Number(r.second_test_score || 0) + Number(r.third_test_score || 0);
// //           const caFromPrimary =
// //             r.ca_total !== undefined
// //               ? Number(r.ca_total)
// //               : Number(r.continuous_assessment_score || 0) +
// //                 Number(r.take_home_test_score || 0) +
// //                 Number(r.practical_score || 0) +
// //                 Number(r.project_score || 0) +
// //                 Number(r.note_copying_score || 0);
// //           const caFromTotalField = r.total_ca_score !== undefined ? Number(r.total_ca_score) : undefined;
// //           const ca_score = caFromTotalField ?? (caFromSenior > 0 ? caFromSenior : caFromPrimary || 0);

// //           return {
// //             id: r.id ? Number(r.id) : 0,
// //             student: {
// //               id: Number(studentId),
// //               full_name: r.student?.full_name ?? r.student_name ?? r.student_full_name ?? 'Unknown Student',
// //               registration_number: r.student?.registration_number ?? r.registration_number ?? r.student_registration_number ?? '',
// //               profile_picture: r.student?.profile_picture ?? r.student_profile_picture ?? null,
// //               education_level: (r.student?.education_level || r.education_level || 'UNKNOWN') as EducationLevel,
// //             },
// //             subject: {
// //               id: Number(subjectId),
// //               name: r.subject?.name ?? r.subject_name ?? 'Unknown Subject',
// //               code: r.subject?.code ?? r.subject_code ?? '',
// //             },
// //             exam_session: {
// //               id: Number(examSessionId),
// //               name: r.exam_session?.name ?? r.exam_session_name ?? r.session_name ?? 'N/A',
// //               term: r.exam_session?.term ?? r.term ?? '',
// //               academic_session: r.exam_session?.academic_session?.name ?? r.academic_session_name ?? r.academic_session ?? '',
// //             },
// //             first_test_score: Number(r.first_test_score || 0),
// //             second_test_score: Number(r.second_test_score || 0),
// //             third_test_score: Number(r.third_test_score || 0),
// //             continuous_assessment_score: Number(r.continuous_assessment_score || 0),
// //             take_home_test_score: Number(r.take_home_test_score || 0),
// //             practical_score: Number(r.practical_score || 0),
// //             project_score: Number(r.project_score || 0),
// //             note_copying_score: Number(r.note_copying_score || 0),
// //             ca_score,
// //             exam_score: Number((r.exam_score ?? r.exam) ?? 0),
// //             total_score: Number((r.total_score ?? (ca_score + Number(r.exam_score ?? 0))) ?? 0),
// //             education_level: (r.education_level || r.student?.education_level || 'UNKNOWN') as EducationLevel,
// //             grade: r.grade ?? r.letter_grade,
// //             status: (typeof r.status === 'string' ? r.status.toUpperCase() : 'DRAFT') as ResultStatus,
// //             remarks: r.remarks ?? '',
// //             created_at: r.created_at ?? '',
// //             updated_at: r.updated_at ?? '',
// //           };
// //         });

// //         debugLog += `Normalized results: ${normalized.length}\n`;

// //         const idSet = new Set(subjectIds.map((id: number) => String(id)));
// //         const filtered = normalized.filter((item) => idSet.has(String(item.subject.id)));
        
// //         debugLog += `Filtered results: ${filtered.length}\n`;
// //         setResults(filtered);
// //       } else {
// //         setResults([]);
// //         debugLog += 'No subject IDs found\n';
// //       }
      
// //       setDebugInfo(debugLog);
// //       console.log('Debug Info:\n', debugLog);
      
// //     } catch (err) {
// //       console.error('Error loading teacher data:', err);
// //       const errorMsg = err instanceof Error ? err.message : 'Failed to load data';
// //       setError(errorMsg);
// //       setDebugInfo(prev => prev + `\nERROR: ${errorMsg}`);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   const { 
// //     handleEditResult, 
// //     handleViewResult, 
// //     handleDeleteResult, 
// //     ResultModalsComponent,
// //   } = useResultActionsManager(loadTeacherData);

// //   useEffect(() => {
// //     if (user && !isLoading) {
// //       void loadTeacherData();
// //     }
// //   }, [user, isLoading]);

// //   const availableEducationLevels = useMemo(
// //     () => Array.from(new Set(results.map((r) => r.education_level))).filter(Boolean) as EducationLevel[],
// //     [results]
// //   );

// //   const availableSubjects = useMemo(
// //     () =>
// //       teacherAssignments.map((assignment) => ({
// //         id: String(assignment.subject_id),
// //         name: String(assignment.subject_name),
// //         code: String(assignment.subject_code),
// //       })),
// //     [teacherAssignments]
// //   );

// //   const filteredResults = useMemo(() => {
// //     const term = (searchTerm || '').toLowerCase();
// //     return results.filter((result) => {
// //       const matchesSearch =
// //         (result.student?.full_name || '').toLowerCase().includes(term) ||
// //         (result.student?.registration_number || '').toLowerCase().includes(term) ||
// //         (result.subject?.name || '').toLowerCase().includes(term);

// //       const matchesSubject = filterSubject === 'all' || String(result.subject?.id ?? '') === filterSubject;
// //       const matchesStatus =
// //         filterStatus === 'all' || (String(result.status || '').toLowerCase() === filterStatus.toLowerCase());
// //       const matchesEducationLevel =
// //         filterEducationLevel === 'all' || result.education_level === filterEducationLevel;

// //       return matchesSearch && matchesSubject && matchesStatus && matchesEducationLevel;
// //     });
// //   }, [results, searchTerm, filterSubject, filterStatus, filterEducationLevel]);

// //   const checkScrollability = () => {
// //     const container = tableContainerRef.current;
// //     if (container) {
// //       const { scrollLeft, scrollWidth, clientWidth } = container;
// //       setCanScrollLeft(scrollLeft > 5);
// //       setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
// //     }
// //   };

// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       checkScrollability();
// //     }, 100);
    
// //     window.addEventListener('resize', checkScrollability);
// //     const container = tableContainerRef.current;
// //     if (container) {
// //       container.addEventListener('scroll', checkScrollability);
// //     }
    
// //     return () => {
// //       clearTimeout(timer);
// //       window.removeEventListener('resize', checkScrollability);
// //       if (container) {
// //         container.removeEventListener('scroll', checkScrollability);
// //       }
// //     };
// //   }, [filteredResults, viewMode]);

// //   const scrollTable = (direction: 'left' | 'right') => {
// //     if (tableContainerRef.current) {
// //       const scrollAmount = 400;
// //       tableContainerRef.current.scrollBy({
// //         left: direction === 'left' ? -scrollAmount : scrollAmount,
// //         behavior: 'smooth'
// //       });
// //     }
// //   };

// //   const handleCreateResult = () => {
// //     setActiveTab('record');
// //   };

// //   const handleResultSuccess = async (): Promise<void> => {
// //     try {
// //       await loadTeacherData();
// //       setActiveTab('results');
// //       toast.success('Result saved successfully');
// //     } catch (error) {
// //       console.error('Error handling result success:', error);
// //       toast.error('Failed to reload data');
// //     }
// //   };

// //   const getTableColumns = (educationLevel: EducationLevel | 'all'): TableColumn[] => {
// //     const baseColumns: TableColumn[] = [
// //       { key: 'student', label: 'Student', sticky: 'left', width: 250 },
// //       { key: 'subject', label: 'Subject', width: 180 },
// //       { key: 'session', label: 'Session', width: 150 },
// //     ];

// //     const seniorColumns: TableColumn[] = [
// //       { key: 'test1', label: 'Test 1', width: 80, center: true },
// //       { key: 'test2', label: 'Test 2', width: 80, center: true },
// //       { key: 'test3', label: 'Test 3', width: 80, center: true },
// //       { key: 'ca_total', label: 'CA Total', width: 100, center: true },
// //     ];

// //     const primaryJuniorColumns: TableColumn[] = [
// //       { key: 'ca', label: 'CA', width: 80, center: true },
// //       { key: 'project', label: 'Project', width: 90, center: true },
// //       { key: 'take_home', label: 'Take Home', width: 110, center: true },
// //       { key: 'practical', label: 'Practical', width: 100, center: true },
// //       { key: 'note_copy', label: 'Note Copy', width: 110, center: true },
// //     ];

// //     const endColumns: TableColumn[] = [
// //       { key: 'exam', label: 'Exam', width: 80, center: true },
// //       { key: 'total', label: 'Total', width: 80, center: true },
// //       { key: 'grade', label: 'Grade', width: 80, center: true },
// //       { key: 'status', label: 'Status', width: 120, center: true },
// //       { key: 'actions', label: 'Actions', sticky: 'right', width: 140, center: true },
// //     ];

// //     if (educationLevel === 'SENIOR_SECONDARY') return [...baseColumns, ...seniorColumns, ...endColumns];
// //     if (educationLevel === 'PRIMARY' || educationLevel === 'JUNIOR_SECONDARY')
// //       return [...baseColumns, ...primaryJuniorColumns, ...endColumns];

// //     return [...baseColumns, ...seniorColumns, ...primaryJuniorColumns, ...endColumns];
// //   };

// //   const currentEducationLevel: EducationLevel = filterEducationLevel === 'all' ? 'MIXED' : filterEducationLevel;
// //   const tableColumns = useMemo(() => getTableColumns(currentEducationLevel), [currentEducationLevel]);

// //   const getStatusBadge = (status: ResultStatus = 'DRAFT') => {
// //     const STATUS_CONFIG = {
// //       DRAFT: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Edit },
// //       PUBLISHED: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
// //       APPROVED: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Eye },
// //       ARCHIVED: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: Archive },
// //     } as const;

// //     const upper = (status || 'DRAFT').toString().toUpperCase() as keyof typeof STATUS_CONFIG;
// //     const config = STATUS_CONFIG[upper] ?? STATUS_CONFIG.DRAFT;
// //     const Icon = config.icon;

// //     return (
// //       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
// //         <Icon className="w-3 h-3 mr-1" />
// //         {upper}
// //       </span>
// //     );
// //   };

// //   const getGradeColor = (grade?: string) => {
// //     const map: Record<string, string> = {
// //       A: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
// //       B: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
// //       C: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
// //       D: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
// //       F: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
// //     };
// //     return map[(grade || '').toUpperCase()] || 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
// //   };

// //   const renderTableCell = (column: TableColumn, result: StudentResult) => {
// //     const centerClass = column.center ? 'text-center' : '';
    
// //     switch (column.key) {
// //       case 'student':
// //         return (
// //           <div className="flex items-center space-x-3">
// //             {result.student.profile_picture ? (
// //               <img 
// //                 src={result.student.profile_picture} 
// //                 alt={result.student.full_name}
// //                 className="w-8 h-8 rounded-full object-cover flex-shrink-0"
// //               />
// //             ) : (
// //               <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
// //                 <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
// //               </div>
// //             )}
// //             <div className="min-w-0">
// //               <p className="font-medium text-gray-900 dark:text-white truncate">{result.student.full_name}</p>
// //               <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.student.registration_number}</p>
// //             </div>
// //           </div>
// //         );
// //       case 'subject':
// //         return (
// //           <div>
// //             <p className="font-medium text-gray-900 dark:text-white">{result.subject.name}</p>
// //             <p className="text-xs text-gray-500 dark:text-gray-400">{result.subject.code}</p>
// //           </div>
// //         );
// //       case 'session':
// //         return (
// //           <div>
// //             <p className="text-sm text-gray-900 dark:text-white">{result.exam_session.name}</p>
// //             <p className="text-xs text-gray-500 dark:text-gray-400">{result.exam_session.term}</p>
// //           </div>
// //         );
// //       case 'test1':
// //         return <span className={centerClass}>{result.first_test_score}</span>;
// //       case 'test2':
// //         return <span className={centerClass}>{result.second_test_score}</span>;
// //       case 'test3':
// //         return <span className={centerClass}>{result.third_test_score}</span>;
// //       case 'ca_total':
// //         return <span className={`${centerClass} font-semibold`}>{result.ca_score}</span>;
// //       case 'ca':
// //         return <span className={centerClass}>{result.continuous_assessment_score}</span>;
// //       case 'project':
// //         return <span className={centerClass}>{result.project_score}</span>;
// //       case 'take_home':
// //         return <span className={centerClass}>{result.take_home_test_score}</span>;
// //       case 'practical':
// //         return <span className={centerClass}>{result.practical_score}</span>;
// //       case 'note_copy':
// //         return <span className={centerClass}>{result.note_copying_score}</span>;
// //       case 'exam':
// //         return <span className={`${centerClass} font-semibold`}>{result.exam_score}</span>;
// //       case 'total':
// //         return <span className={`${centerClass} font-bold text-blue-600 dark:text-blue-400`}>{result.total_score}</span>;
// //       case 'grade':
// //         return (
// //           <div className={centerClass}>
// //             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
// //               {result.grade ?? '—'}
// //             </span>
// //           </div>
// //         );
// //       case 'status':
// //         return <div className={centerClass}>{getStatusBadge(result.status)}</div>;
// //       case 'actions':
// //         return (
// //           <div className="flex items-center justify-center space-x-1">
// //             <button
// //               onClick={() => handleViewResult(result)}
// //               className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
// //               title="View Details"
// //             >
// //               <Eye className="w-4 h-4" />
// //             </button>
// //             <button
// //               onClick={() => handleEditResult(result)}
// //               className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
// //               title="Edit Result"
// //             >
// //               <Edit className="w-4 h-4" />
// //             </button>
// //             <button
// //               onClick={() => handleDeleteResult(result)}
// //               className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
// //               title="Delete Result"
// //             >
// //               <Trash2 className="w-4 h-4" />
// //             </button>
// //           </div>
// //         );
// //       default:
// //         return null;
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <TeacherDashboardLayout>
// //         <div className="p-6 space-y-6">
// //           <div className="flex items-center justify-center min-h-[400px]">
// //             <div className="flex flex-col items-center space-y-4">
// //               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
// //               <p className="text-slate-600 dark:text-slate-400">Loading your Student Results...</p>
// //             </div>
// //           </div>
// //         </div>
// //       </TeacherDashboardLayout>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <TeacherDashboardLayout>
// //         <div className="p-6">
// //           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
// //             <div className="flex items-center">
// //               <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
// //               <p className="text-red-800">{error}</p>
// //             </div>
// //           </div>
// //           {debugInfo && (
// //             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
// //               <h3 className="font-semibold mb-2">Debug Information:</h3>
// //               <pre className="text-xs overflow-auto whitespace-pre-wrap">{debugInfo}</pre>
// //             </div>
// //           )}
// //         </div>
// //       </TeacherDashboardLayout>
// //     );
// //   }

// //   const totalTableWidth = tableColumns.reduce((sum, col) => sum + col.width, 0);

// //   return (
// //     <TeacherDashboardLayout>
// //       <div className="p-6 space-y-6">
// //         {/* Header */}
// //         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
// //           <div>
// //             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Results Management</h1>
// //             <p className="text-gray-600 dark:text-gray-400 mt-1">
// //               Record and manage student results for your subjects
// //               {results.length > 0 && ` (${results.length} total results)`}
// //             </p>
// //           </div>
// //           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
// //             <button 
// //               onClick={loadTeacherData} 
// //               className="flex items-center justify-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
// //             >
// //               <RefreshCw className="w-4 h-4 mr-2" /> Refresh
// //             </button>
// //             <button 
// //               onClick={handleCreateResult} 
// //               className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
// //             >
// //               <Plus className="w-4 h-4 inline mr-2" /> Record New Result
// //             </button>
// //           </div>
// //         </div>

// //         {/* Record form tab */}
// //         {activeTab === 'record' && (
// //           <ResultCreateTab
// //             onResultCreated={loadTeacherData}
// //             onSuccess={handleResultSuccess}
// //             onClose={() => setActiveTab('results')}
// //           />
// //         )}

// //         {/* Filters and View Toggle */}
// //         {activeTab === 'results' && (
// //           <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
// //             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
// //               <div className="relative">
// //                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
// //                 <input
// //                   type="text"
// //                   placeholder="Search students or subjects..."
// //                   value={searchTerm}
// //                   onChange={(e) => setSearchTerm(e.target.value)}
// //                   className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
// //                 />
// //               </div>

// //               <select
// //                 value={String(filterEducationLevel)}
// //                 onChange={(e) => setFilterEducationLevel(e.target.value as EducationLevel | 'all')}
// //                 className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
// //               >
// //                 <option value="all">All Education Levels</option>
// //                 {availableEducationLevels.map((level) => (
// //                   <option key={String(level)} value={String(level)}>
// //                     {String(level)
// //                       .replace(/_/g, ' ')
// //                       .toLowerCase()
// //                       .replace(/\b\w/g, (l) => l.toUpperCase())}
// //                   </option>
// //                 ))}
// //               </select>

// //               <select
// //                 value={String(filterSubject)}
// //                 onChange={(e) => setFilterSubject(e.target.value)}
// //                 className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
// //               >
// //                 <option value="all">All Subjects</option>
// //                 {availableSubjects.map((subject) => (
// //                   <option key={subject.id} value={subject.id}>
// //                     {subject.name} ({subject.code})
// //                   </option>
// //                 ))}
// //               </select>

// //               <select
// //                 value={String(filterStatus)}
// //                 onChange={(e) => setFilterStatus(e.target.value)}
// //                 className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
// //               >
// //                 <option value="all">All Status</option>
// //                 <option value="draft">Draft</option>
// //                 <option value="published">Published</option>
// //                 <option value="reviewed">Reviewed</option>
// //                 <option value="archived">Archived</option>
// //               </select>

// //               <button
// //                 onClick={() => {
// //                   setSearchTerm('');
// //                   setFilterSubject('all');
// //                   setFilterStatus('all');
// //                   setFilterEducationLevel('all');
// //                 }}
// //                 className="flex items-center justify-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
// //               >
// //                 <X className="w-4 h-4 mr-2" /> Clear
// //               </button>
// //             </div>

// //             {/* View Toggle */}
// //             <div className="flex items-center justify-end space-x-2">
// //               <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
// //               <button
// //                 onClick={() => setViewMode('table')}
// //                 className={`p-2 rounded-lg transition-colors ${
// //                   viewMode === 'table'
// //                     ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
// //                     : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
// //                 }`}
// //                 title="Table View"
// //               >
// //                 <TableIcon className="w-4 h-4" />
// //               </button>
// //               <button
// //                 onClick={() => setViewMode('cards')}
// //                 className={`p-2 rounded-lg transition-colors ${
// //                   viewMode === 'cards'
// //                     ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
// //                     : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
// //                 }`}
// //                 title="Card View"
// //               >
// //                 <Grid className="w-4 h-4" />
// //               </button>
// //             </div>
// //           </div>
// //         )}

// //         {/* Results Display */}
// //         {activeTab === 'results' && (
// //           <>
// //             {filteredResults.length > 0 ? (
// //               viewMode === 'table' ? (
// //                 <div className="w-full">
// //                   <div className="relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    
// //                     {/* Scroll Navigation Buttons */}
// //                     {canScrollLeft && (
// //                       <button
// //                         onClick={() => scrollTable('left')}
// //                         className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-2xl rounded-full p-3 transition-all hover:scale-110"
// //                         style={{ marginTop: '20px' }}
// //                       >
// //                         <ChevronLeft className="w-6 h-6" />
// //                       </button>
// //                     )}
                    
// //                     {canScrollRight && (
// //                       <button
// //                         onClick={() => scrollTable('right')}
// //                         className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-2xl rounded-full p-3 transition-all hover:scale-110 animate-pulse"
// //                         style={{ marginTop: '20px' }}
// //                       >
// //                         <ChevronRight className="w-6 h-6" />
// //                       </button>
// //                     )}

// //                     {/* Table Wrapper with Forced Scroll */}
// //                     <div 
// //                       ref={tableContainerRef}
// //                       style={{
// //                         width: '100%',
// //                         overflowX: 'scroll',
// //                         overflowY: 'auto',
// //                         maxHeight: '70vh',
// //                         WebkitOverflowScrolling: 'touch',
// //                         scrollbarWidth: 'thin',
// //                         scrollbarColor: '#3b82f6 #e5e7eb',
// //                       }}
// //                     >
// //                       {/* Inner wrapper to force width */}
// //                       <div style={{ minWidth: 'max-content' }}>
// //                         <table className="w-full border-collapse">
// //                           <thead>
// //                             <tr className="bg-gray-50 dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
// //                               {tableColumns.map((column) => (
// //                                 <th
// //                                   key={column.key}
// //                                   className={`px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${
// //                                     column.center ? 'text-center' : 'text-left'
// //                                   }`}
// //                                   style={{
// //                                     minWidth: `${column.width}px`,
// //                                     width: `${column.width}px`,
// //                                     position: column.sticky ? 'sticky' : 'static',
// //                                     left: column.sticky === 'left' ? 0 : undefined,
// //                                     right: column.sticky === 'right' ? 0 : undefined,
// //                                     zIndex: column.sticky ? 30 : 1,
// //                                     backgroundColor: column.sticky ? '#f9fafb' : undefined,
// //                                     boxShadow: column.sticky === 'left' 
// //                                       ? '4px 0 6px -2px rgba(0,0,0,0.1)' 
// //                                       : column.sticky === 'right'
// //                                       ? '-4px 0 6px -2px rgba(0,0,0,0.1)'
// //                                       : undefined,
// //                                   }}
// //                                 >
// //                                   {column.label}
// //                                 </th>
// //                               ))}
// //                             </tr>
// //                           </thead>
// //                           <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
// //                             {filteredResults.map((result) => (
// //                               <tr
// //                                 key={result.id}
// //                                 className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
// //                               >
// //                                 {tableColumns.map((column) => (
// //                                   <td
// //                                     key={column.key}
// //                                     className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
// //                                     style={{
// //                                       minWidth: `${column.width}px`,
// //                                       width: `${column.width}px`,
// //                                       position: column.sticky ? 'sticky' : 'static',
// //                                       left: column.sticky === 'left' ? 0 : undefined,
// //                                       right: column.sticky === 'right' ? 0 : undefined,
// //                                       zIndex: column.sticky ? 20 : 1,
// //                                       backgroundColor: column.sticky ? '#ffffff' : undefined,
// //                                       boxShadow: column.sticky === 'left' 
// //                                         ? '4px 0 6px -2px rgba(0,0,0,0.1)' 
// //                                         : column.sticky === 'right'
// //                                         ? '-4px 0 6px -2px rgba(0,0,0,0.1)'
// //                                         : undefined,
// //                                     }}
// //                                   >
// //                                     {renderTableCell(column, result)}
// //                                   </td>
// //                                 ))}
// //                               </tr>
// //                             ))}
// //                           </tbody>
// //                         </table>
// //                       </div>
// //                     </div>

// //                     {/* Footer */}
// //                     <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900">
// //                       <div className="flex items-center justify-between">
// //                         <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
// //                           <ChevronLeft className="w-4 h-4 mr-2" />
// //                           <span>Scroll horizontally to view all {tableColumns.length} columns</span>
// //                           <ChevronRight className="w-4 h-4 ml-2" />
// //                         </div>
// //                         <div className="text-sm font-medium text-gray-900 dark:text-white">
// //                           {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               ) : (
// //                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
// //                   <div className="p-6 space-y-4">
// //                     {filteredResults.map((result) => (
// //                       <div key={result.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
// //                         <div className="flex items-start justify-between mb-4">
// //                           <div className="flex items-center space-x-3">
// //                             {result.student.profile_picture ? (
// //                               <img 
// //                                 src={result.student.profile_picture} 
// //                                 alt={result.student.full_name}
// //                                 className="w-10 h-10 rounded-full object-cover"
// //                               />
// //                             ) : (
// //                               <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
// //                                 <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
// //                               </div>
// //                             )}
// //                             <div>
// //                               <h3 className="font-semibold text-gray-900 dark:text-white">{result.student.full_name}</h3>
// //                               <p className="text-sm text-gray-500 dark:text-gray-400">{result.student.registration_number}</p>
// //                             </div>
// //                           </div>
// //                           {getStatusBadge(result.status)}
// //                         </div>
                        
// //                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
// //                           <div>
// //                             <span className="text-gray-500 dark:text-gray-400">Subject:</span>
// //                             <p className="font-medium text-gray-900 dark:text-white">{result.subject.name}</p>
// //                           </div>
// //                           <div>
// //                             <span className="text-gray-500 dark:text-gray-400">CA:</span>
// //                             <p className="font-medium text-gray-900 dark:text-white">{result.ca_score}</p>
// //                           </div>
// //                           <div>
// //                             <span className="text-gray-500 dark:text-gray-400">Exam:</span>
// //                             <p className="font-medium text-gray-900 dark:text-white">{result.exam_score}</p>
// //                           </div>
// //                           <div>
// //                             <span className="text-gray-500 dark:text-gray-400">Total:</span>
// //                             <p className="font-medium text-blue-600 dark:text-blue-400">{result.total_score}</p>
// //                           </div>
// //                         </div>

// //                         <div className="mt-4 flex items-center justify-between">
// //                           <div>
// //                             <span className="text-gray-500 dark:text-gray-400 text-sm">Grade: </span>
// //                             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
// //                               {result.grade ?? '—'}
// //                             </span>
// //                           </div>
// //                           <div className="flex items-center space-x-2">
// //                             <button
// //                               onClick={() => handleViewResult(result)}
// //                               className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
// //                               title="View Details"
// //                             >
// //                               <Eye className="w-4 h-4" />
// //                             </button>
// //                             <button
// //                               onClick={() => handleEditResult(result)}
// //                               className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
// //                               title="Edit Result"
// //                             >
// //                               <Edit className="w-4 h-4" />
// //                             </button>
// //                             <button
// //                               onClick={() => handleDeleteResult(result)}
// //                               className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
// //                               title="Delete Result"
// //                             >
// //                               <Trash2 className="w-4 h-4" />
// //                             </button>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 </div>
// //               )
// //             ) : (
// //               <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
// //                 <div className="text-center py-12 px-6">
// //                   <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4 mx-auto" />
// //                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
// //                   <p className="text-gray-500 dark:text-gray-400 mb-4">
// //                     {searchTerm || filterSubject !== 'all' || filterStatus !== 'all'
// //                       ? 'Try adjusting your search criteria'
// //                       : 'Start by recording results for your students'}
// //                   </p>
// //                   <button 
// //                     onClick={handleCreateResult} 
// //                     className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
// //                   >
// //                     <Plus className="w-4 h-4 mr-2" /> Record First Result
// //                   </button>
// //                 </div>
// //               </div>
// //             )}
// //           </>
// //         )}

// //         <ResultModalsComponent />
// //       </div>
// //     </TeacherDashboardLayout>
// //   );
// // };

// // export default TeacherResults;


// import React, { useEffect, useMemo, useState, useRef } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
// import TeacherDashboardService from '@/services/TeacherDashboardService';
// import ResultService from '@/services/ResultService';
// import ResultCreateTab from '@/components/dashboards/teacher/ResultCreateTab';
// import useResultActionsManager from '@/components/dashboards/teacher/ResultActionsManager';
// import { toast } from 'react-toastify';
// import { TeacherAssignment, StudentResult } from '@/types/types';
// import {
//   Plus,
//   Edit,
//   Trash2,
//   Eye,
//   CheckCircle,
//   AlertCircle,
//   RefreshCw,
//   Search,
//   X,
//   FileText,
//   User,
//   Archive,
//   Table as TableIcon,
//   Grid,
//   ChevronRight,
//   ChevronLeft,
// } from 'lucide-react';

// type EducationLevel =
//   | 'NURSERY'
//   | 'PRIMARY'
//   | 'JUNIOR_SECONDARY'
//   | 'SENIOR_SECONDARY'
//   | 'UNKNOWN'
//   | 'MIXED'
//   | string;

// type ResultStatus = 'DRAFT' | 'PUBLISHED' | 'APPROVED' | 'ARCHIVED' | string;

// type TableColumn = {
//   key:
//     | 'student'
//     | 'subject'
//     | 'session'
//     | 'test1'
//     | 'test2'
//     | 'test3'
//     | 'ca_total'
//     | 'ca'
//     | 'project'
//     | 'take_home'
//     | 'practical'
//     | 'note_copy'
//     | 'exam'
//     | 'total'
//     | 'grade'
//     | 'status'
//     | 'actions';
//   label: string;
//   width: number;
//   center?: boolean;
//   sticky?: 'left' | 'right';
// };

// const TeacherResults: React.FC = () => {
//   const { user, isLoading } = useAuth();

//   const [results, setResults] = useState<StudentResult[]>([]);
//   const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterSubject, setFilterSubject] = useState('all');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [filterEducationLevel, setFilterEducationLevel] = useState<EducationLevel | 'all'>('all');
//   const [activeTab, setActiveTab] = useState<'results' | 'record'>('results');
//   const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
//   const [debugInfo, setDebugInfo] = useState<string>('');
//   const [canScrollLeft, setCanScrollLeft] = useState(false);
//   const [canScrollRight, setCanScrollRight] = useState(false);
  
//   const tableContainerRef = useRef<HTMLDivElement>(null);

//   async function loadTeacherData() {
//     try {
//       setLoading(true);
//       setError(null);
//       let debugLog = '';

//       const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user as unknown as object);
//       debugLog += `Teacher ID: ${teacherId}\n`;
      
//       if (!teacherId) throw new Error('Teacher ID not found');

//       const subjects = await TeacherDashboardService.getTeacherSubjects(teacherId);
//       debugLog += `Subjects loaded: ${subjects.length}\n`;
//       debugLog += `Subject IDs: ${subjects.map((s: any) => s.id).join(', ')}\n`;

//       const assignments: TeacherAssignment[] = subjects.map((subject: any) => {
//         const educationLevel = subject.education_level 
//           || subject.grade_level_education_level
//           || subject.classroom_education_level
//           || (subject.assignments && subject.assignments[0]?.education_level)
//           || (subject.assignments && subject.assignments[0]?.grade_level?.education_level)
//           || 'UNKNOWN';
        
//         return {
//           id: subject.id,
//           classroom_name: subject.classroom ?? 'Unknown',
//           section_name: subject.section_name ?? subject.section ?? 'Unknown',
//           grade_level_name: subject.grade_level_name ?? subject.grade_level ?? 'Unknown',
//           education_level: educationLevel,
//           subject_name: subject.subject_name ?? subject.name ?? 'Unknown Subject',
//           subject_code: subject.subject_code ?? subject.code ?? '',
//           subject_id: Number(subject.subject_id ?? subject.id),
//           grade_level_id: subject.grade_level_id ?? null,
//           section_id: subject.section_id ?? null,
//           student_count: subject.student_count ?? 0,
//           periods_per_week: subject.periods_per_week ?? 0,
//           teacher: subject.teacher ?? null,
//           grade_level: subject.grade_level ?? null,
//           section: subject.section ?? null,
//           academic_year: subject.academic_year ?? null,
//           is_primary_teacher: subject.is_primary_teacher ?? false,
//         };
//       });
//       setTeacherAssignments(assignments);

//       const subjectIds = subjects.map((s: any) => s.id).filter(Boolean);
//       debugLog += `Subject IDs for query: ${subjectIds.join(', ')}\n`;

//       if (subjectIds.length) {
//         const educationLevels = new Set<string>();
        
//         subjects.forEach((s: any) => {
//           const level = s.education_level 
//             || s.grade_level_education_level
//             || s.classroom_education_level;
          
//           if (level) educationLevels.add(level);
          
//           if (s.assignments && Array.isArray(s.assignments)) {
//             s.assignments.forEach((assignment: any) => {
//               const assignmentLevel = assignment.education_level 
//                 || assignment.grade_level?.education_level
//                 || assignment.classroom?.education_level;
//               if (assignmentLevel) educationLevels.add(assignmentLevel);
//             });
//           }
//         });
        
//         let levelsToQuery = Array.from(educationLevels);
        
//         if (levelsToQuery.length === 0) {
//           levelsToQuery = ['NURSERY', 'PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'];
//           debugLog += `No education levels found, querying all common levels\n`;
//         } else {
//           debugLog += `Education levels found: ${levelsToQuery.join(', ')}\n`;
//         }

//         const allResults: any[] = [];
        
//         for (const level of levelsToQuery) {
//           try {
//             debugLog += `Querying ${level} with subjects: ${subjectIds.join(',')}\n`;
//             const levelResults = await ResultService.getStudentResults({ 
//               subject: subjectIds.join(','),
//               education_level: level
//             });
//             const resultsArray = Array.isArray(levelResults) 
//               ? levelResults 
//               : ((levelResults as any)?.data || (levelResults as any)?.results || []);
//             allResults.push(...resultsArray);
//             debugLog += `Results for ${level}: ${resultsArray.length}\n`;
//           } catch (levelErr) {
//             debugLog += `Error fetching results for ${level}: ${levelErr}\n`;
//           }
//         }
        
//         debugLog += `Total raw results: ${allResults.length}\n`;

//         const normalized: StudentResult[] = allResults.map((r: any): StudentResult => {
//           const studentId = (r.student && r.student.id) || r.student || r.student_id;
//           const subjectId = (r.subject && r.subject.id) || r.subject || r.subject_id;
//           const examSessionId = (r.exam_session && r.exam_session.id) || r.exam_session || r.exam_session_id || r.session_id;

//           const caFromSenior = Number(r.first_test_score || 0) + Number(r.second_test_score || 0) + Number(r.third_test_score || 0);
//           const caFromPrimary =
//             r.ca_total !== undefined
//               ? Number(r.ca_total)
//               : Number(r.continuous_assessment_score || 0) +
//                 Number(r.take_home_test_score || 0) +
//                 Number(r.practical_score || 0) +
//                 Number(r.project_score || 0) +
//                 Number(r.note_copying_score || 0);
//           const caFromTotalField = r.total_ca_score !== undefined ? Number(r.total_ca_score) : undefined;
//           const ca_score = caFromTotalField ?? (caFromSenior > 0 ? caFromSenior : caFromPrimary || 0);

//           return {
//             id: r.id ? Number(r.id) : 0,
//             student: {
//               id: Number(studentId),
//               full_name: r.student?.full_name ?? r.student_name ?? r.student_full_name ?? 'Unknown Student',
//               registration_number: r.student?.registration_number ?? r.registration_number ?? r.student_registration_number ?? '',
//               profile_picture: r.student?.profile_picture ?? r.student_profile_picture ?? null,
//               education_level: (r.student?.education_level || r.education_level || 'UNKNOWN') as EducationLevel,
//             },
//             subject: {
//               id: Number(subjectId),
//               name: r.subject?.name ?? r.subject_name ?? 'Unknown Subject',
//               code: r.subject?.code ?? r.subject_code ?? '',
//             },
//             exam_session: {
//               id: Number(examSessionId),
//               name: r.exam_session?.name ?? r.exam_session_name ?? r.session_name ?? 'N/A',
//               term: r.exam_session?.term ?? r.term ?? '',
//               academic_session: r.exam_session?.academic_session?.name ?? r.academic_session_name ?? r.academic_session ?? '',
//             },
//             first_test_score: Number(r.first_test_score || 0),
//             second_test_score: Number(r.second_test_score || 0),
//             third_test_score: Number(r.third_test_score || 0),
//             continuous_assessment_score: Number(r.continuous_assessment_score || 0),
//             take_home_test_score: Number(r.take_home_test_score || 0),
//             practical_score: Number(r.practical_score || 0),
//             project_score: Number(r.project_score || 0),
//             note_copying_score: Number(r.note_copying_score || 0),
//             ca_score,
//             exam_score: Number((r.exam_score ?? r.exam) ?? 0),
//             total_score: Number((r.total_score ?? (ca_score + Number(r.exam_score ?? 0))) ?? 0),
//             education_level: (r.education_level || r.student?.education_level || 'UNKNOWN') as EducationLevel,
//             grade: r.grade ?? r.letter_grade,
//             status: (typeof r.status === 'string' ? r.status.toUpperCase() : 'DRAFT') as ResultStatus,
//             remarks: r.remarks ?? '',
//             created_at: r.created_at ?? '',
//             updated_at: r.updated_at ?? '',
//           };
//         });

//         debugLog += `Normalized results: ${normalized.length}\n`;

//         const idSet = new Set(subjectIds.map((id: number) => String(id)));
//         const filtered = normalized.filter((item) => idSet.has(String(item.subject.id)));
        
//         debugLog += `Filtered results: ${filtered.length}\n`;
//         setResults(filtered);
//       } else {
//         setResults([]);
//         debugLog += 'No subject IDs found\n';
//       }
      
//       setDebugInfo(debugLog);
//       console.log('Debug Info:\n', debugLog);
      
//     } catch (err) {
//       console.error('Error loading teacher data:', err);
//       const errorMsg = err instanceof Error ? err.message : 'Failed to load data';
//       setError(errorMsg);
//       setDebugInfo(prev => prev + `\nERROR: ${errorMsg}`);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const { 
//     handleEditResult, 
//     handleViewResult, 
//     handleDeleteResult, 
//     ResultModalsComponent,
//   } = useResultActionsManager(loadTeacherData);

//   useEffect(() => {
//     if (user && !isLoading) {
//       void loadTeacherData();
//     }
//   }, [user, isLoading]);

//   const availableEducationLevels = useMemo(
//     () => Array.from(new Set(results.map((r) => r.education_level))).filter(Boolean) as EducationLevel[],
//     [results]
//   );

//   const availableSubjects = useMemo(
//     () =>
//       teacherAssignments.map((assignment) => ({
//         id: String(assignment.subject_id),
//         name: String(assignment.subject_name),
//         code: String(assignment.subject_code),
//       })),
//     [teacherAssignments]
//   );

//   const filteredResults = useMemo(() => {
//     const term = (searchTerm || '').toLowerCase();
//     return results.filter((result) => {
//       const matchesSearch =
//         (result.student?.full_name || '').toLowerCase().includes(term) ||
//         (result.student?.registration_number || '').toLowerCase().includes(term) ||
//         (result.subject?.name || '').toLowerCase().includes(term);

//       const matchesSubject = filterSubject === 'all' || String(result.subject?.id ?? '') === filterSubject;
//       const matchesStatus =
//         filterStatus === 'all' || (String(result.status || '').toLowerCase() === filterStatus.toLowerCase());
//       const matchesEducationLevel =
//         filterEducationLevel === 'all' || result.education_level === filterEducationLevel;

//       return matchesSearch && matchesSubject && matchesStatus && matchesEducationLevel;
//     });
//   }, [results, searchTerm, filterSubject, filterStatus, filterEducationLevel]);

//   const checkScrollability = () => {
//     const container = tableContainerRef.current;
//     if (container) {
//       const { scrollLeft, scrollWidth, clientWidth } = container;
//       setCanScrollLeft(scrollLeft > 5);
//       setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
//     }
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       checkScrollability();
//     }, 100);
    
//     window.addEventListener('resize', checkScrollability);
//     const container = tableContainerRef.current;
//     if (container) {
//       container.addEventListener('scroll', checkScrollability);
//     }
    
//     return () => {
//       clearTimeout(timer);
//       window.removeEventListener('resize', checkScrollability);
//       if (container) {
//         container.removeEventListener('scroll', checkScrollability);
//       }
//     };
//   }, [filteredResults, viewMode]);

//   const scrollTable = (direction: 'left' | 'right') => {
//     if (tableContainerRef.current) {
//       const scrollAmount = 400;
//       tableContainerRef.current.scrollBy({
//         left: direction === 'left' ? -scrollAmount : scrollAmount,
//         behavior: 'smooth'
//       });
//     }
//   };

//   const handleCreateResult = () => {
//     setActiveTab('record');
//   };

//   const handleResultSuccess = async (): Promise<void> => {
//     try {
//       await loadTeacherData();
//       setActiveTab('results');
//       toast.success('Result saved successfully');
//     } catch (error) {
//       console.error('Error handling result success:', error);
//       toast.error('Failed to reload data');
//     }
//   };

//   const getTableColumns = (educationLevel: EducationLevel | 'all'): TableColumn[] => {
//     const baseColumns: TableColumn[] = [
//       { key: 'student', label: 'Student', sticky: 'left', width: 250 },
//       { key: 'subject', label: 'Subject', width: 180 },
//       { key: 'session', label: 'Session', width: 150 },
//     ];

//     const seniorColumns: TableColumn[] = [
//       { key: 'test1', label: 'Test 1', width: 80, center: true },
//       { key: 'test2', label: 'Test 2', width: 80, center: true },
//       { key: 'test3', label: 'Test 3', width: 80, center: true },
//       { key: 'ca_total', label: 'CA Total', width: 100, center: true },
//     ];

//     const primaryJuniorColumns: TableColumn[] = [
//       { key: 'ca', label: 'CA', width: 80, center: true },
//       { key: 'project', label: 'Project', width: 90, center: true },
//       { key: 'take_home', label: 'Take Home', width: 110, center: true },
//       { key: 'practical', label: 'Practical', width: 100, center: true },
//       { key: 'note_copy', label: 'Note Copy', width: 110, center: true },
//     ];

//     const endColumns: TableColumn[] = [
//       { key: 'exam', label: 'Exam', width: 80, center: true },
//       { key: 'total', label: 'Total', width: 80, center: true },
//       { key: 'grade', label: 'Grade', width: 80, center: true },
//       { key: 'status', label: 'Status', width: 120, center: true },
//       { key: 'actions', label: 'Actions', sticky: 'right', width: 140, center: true },
//     ];

//     if (educationLevel === 'SENIOR_SECONDARY') return [...baseColumns, ...seniorColumns, ...endColumns];
//     if (educationLevel === 'PRIMARY' || educationLevel === 'JUNIOR_SECONDARY')
//       return [...baseColumns, ...primaryJuniorColumns, ...endColumns];

//     return [...baseColumns, ...seniorColumns, ...primaryJuniorColumns, ...endColumns];
//   };

//   const currentEducationLevel: EducationLevel = filterEducationLevel === 'all' ? 'MIXED' : filterEducationLevel;
//   const tableColumns = useMemo(() => getTableColumns(currentEducationLevel), [currentEducationLevel]);

//   const getStatusBadge = (status: ResultStatus = 'DRAFT') => {
//     const STATUS_CONFIG = {
//       DRAFT: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Edit },
//       PUBLISHED: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
//       APPROVED: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Eye },
//       ARCHIVED: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: Archive },
//     } as const;

//     const upper = (status || 'DRAFT').toString().toUpperCase() as keyof typeof STATUS_CONFIG;
//     const config = STATUS_CONFIG[upper] ?? STATUS_CONFIG.DRAFT;
//     const Icon = config.icon;

//     return (
//       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
//         <Icon className="w-3 h-3 mr-1" />
//         {upper}
//       </span>
//     );
//   };

//   const getGradeColor = (grade?: string) => {
//     const map: Record<string, string> = {
//       A: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
//       B: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
//       C: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
//       D: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
//       F: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
//     };
//     return map[(grade || '').toUpperCase()] || 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
//   };

//   const renderTableCell = (column: TableColumn, result: StudentResult) => {
//     const centerClass = column.center ? 'text-center' : '';
    
//     switch (column.key) {
//       case 'student':
//         return (
//           <div className="flex items-center space-x-3">
//             {result.student.profile_picture ? (
//               <img 
//                 src={result.student.profile_picture} 
//                 alt={result.student.full_name}
//                 className="w-8 h-8 rounded-full object-cover flex-shrink-0"
//               />
//             ) : (
//               <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
//                 <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
//               </div>
//             )}
//             <div className="min-w-0">
//               <p className="font-medium text-gray-900 dark:text-white truncate">{result.student.full_name}</p>
//               <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.student.registration_number}</p>
//             </div>
//           </div>
//         );
//       case 'subject':
//         return (
//           <div>
//             <p className="font-medium text-gray-900 dark:text-white">{result.subject.name}</p>
//             <p className="text-xs text-gray-500 dark:text-gray-400">{result.subject.code}</p>
//           </div>
//         );
//       case 'session':
//         return (
//           <div>
//             <p className="text-sm text-gray-900 dark:text-white">{result.exam_session.name}</p>
//             <p className="text-xs text-gray-500 dark:text-gray-400">{result.exam_session.term}</p>
//           </div>
//         );
//       case 'test1':
//         return <span className={centerClass}>{result.first_test_score}</span>;
//       case 'test2':
//         return <span className={centerClass}>{result.second_test_score}</span>;
//       case 'test3':
//         return <span className={centerClass}>{result.third_test_score}</span>;
//       case 'ca_total':
//         return <span className={`${centerClass} font-semibold`}>{result.ca_score}</span>;
//       case 'ca':
//         return <span className={centerClass}>{result.continuous_assessment_score}</span>;
//       case 'project':
//         return <span className={centerClass}>{result.project_score}</span>;
//       case 'take_home':
//         return <span className={centerClass}>{result.take_home_test_score}</span>;
//       case 'practical':
//         return <span className={centerClass}>{result.practical_score}</span>;
//       case 'note_copy':
//         return <span className={centerClass}>{result.note_copying_score}</span>;
//       case 'exam':
//         return <span className={`${centerClass} font-semibold`}>{result.exam_score}</span>;
//       case 'total':
//         return <span className={`${centerClass} font-bold text-blue-600 dark:text-blue-400`}>{result.total_score}</span>;
//       case 'grade':
//         return (
//           <div className={centerClass}>
//             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
//               {result.grade ?? '—'}
//             </span>
//           </div>
//         );
//       case 'status':
//         return <div className={centerClass}>{getStatusBadge(result.status)}</div>;
//       case 'actions':
//         return (
//           <div className="flex items-center justify-center space-x-1">
//             <button
//               onClick={() => handleViewResult(result)}
//               className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
//               title="View Details"
//             >
//               <Eye className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => handleEditResult(result)}
//               className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
//               title="Edit Result"
//             >
//               <Edit className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => handleDeleteResult(result)}
//               className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
//               title="Delete Result"
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   if (loading) {
//     return (
//       <TeacherDashboardLayout>
//         <div className="p-6 space-y-6">
//           <div className="flex items-center justify-center min-h-[400px]">
//             <div className="flex flex-col items-center space-y-4">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//               <p className="text-slate-600 dark:text-slate-400">Loading your Student Results...</p>
//             </div>
//           </div>
//         </div>
//       </TeacherDashboardLayout>
//     );
//   }

//   if (error) {
//     return (
//       <TeacherDashboardLayout>
//         <div className="p-6">
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//             <div className="flex items-center">
//               <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
//               <p className="text-red-800">{error}</p>
//             </div>
//           </div>
//           {debugInfo && (
//             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
//               <h3 className="font-semibold mb-2">Debug Information:</h3>
//               <pre className="text-xs overflow-auto whitespace-pre-wrap">{debugInfo}</pre>
//             </div>
//           )}
//         </div>
//       </TeacherDashboardLayout>
//     );
//   }

//   const totalTableWidth = tableColumns.reduce((sum, col) => sum + col.width, 0);

//   return (
//     <TeacherDashboardLayout>
//       <div className="p-6 space-y-6">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Results Management</h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-1">
//               Record and manage student results for your subjects
//               {results.length > 0 && ` (${results.length} total results)`}
//             </p>
//           </div>
//           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
//             <button 
//               onClick={loadTeacherData} 
//               className="flex items-center justify-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
//             >
//               <RefreshCw className="w-4 h-4 mr-2" /> Refresh
//             </button>
//             <button 
//               onClick={handleCreateResult} 
//               className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               <Plus className="w-4 h-4 inline mr-2" /> Record New Result
//             </button>
//           </div>
//         </div>

//         {/* Record form tab */}
//         {activeTab === 'record' && (
//           <ResultCreateTab
//             onResultCreated={loadTeacherData}
//             onSuccess={handleResultSuccess}
//             onClose={() => setActiveTab('results')}
//           />
//         )}

//         {/* Filters and View Toggle */}
//         {activeTab === 'results' && (
//           <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input
//                   type="text"
//                   placeholder="Search students or subjects..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                 />
//               </div>

//               <select
//                 value={String(filterEducationLevel)}
//                 onChange={(e) => setFilterEducationLevel(e.target.value as EducationLevel | 'all')}
//                 className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               >
//                 <option value="all">All Education Levels</option>
//                 {availableEducationLevels.map((level) => (
//                   <option key={String(level)} value={String(level)}>
//                     {String(level)
//                       .replace(/_/g, ' ')
//                       .toLowerCase()
//                       .replace(/\b\w/g, (l) => l.toUpperCase())}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 value={String(filterSubject)}
//                 onChange={(e) => setFilterSubject(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               >
//                 <option value="all">All Subjects</option>
//                 {availableSubjects.map((subject) => (
//                   <option key={subject.id} value={subject.id}>
//                     {subject.name} ({subject.code})
//                   </option>
//                 ))}
//               </select>

//               <select
//                 value={String(filterStatus)}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               >
//                 <option value="all">All Status</option>
//                 <option value="draft">Draft</option>
//                 <option value="published">Published</option>
//                 <option value="reviewed">Reviewed</option>
//                 <option value="archived">Archived</option>
//               </select>

//               <button
//                 onClick={() => {
//                   setSearchTerm('');
//                   setFilterSubject('all');
//                   setFilterStatus('all');
//                   setFilterEducationLevel('all');
//                 }}
//                 className="flex items-center justify-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
//               >
//                 <X className="w-4 h-4 mr-2" /> Clear
//               </button>
//             </div>

//             {/* View Toggle */}
//             <div className="flex items-center justify-end space-x-2">
//               <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
//               <button
//                 onClick={() => setViewMode('table')}
//                 className={`p-2 rounded-lg transition-colors ${
//                   viewMode === 'table'
//                     ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
//                     : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
//                 }`}
//                 title="Table View"
//               >
//                 <TableIcon className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={() => setViewMode('cards')}
//                 className={`p-2 rounded-lg transition-colors ${
//                   viewMode === 'cards'
//                     ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
//                     : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
//                 }`}
//                 title="Card View"
//               >
//                 <Grid className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Results Display */}
//         {activeTab === 'results' && (
//           <>
//             {filteredResults.length > 0 ? (
//               viewMode === 'table' ? (
//                 <div className="w-full">
//                   <div className="relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    
//                     {/* Scroll Navigation Buttons */}
//                     {canScrollLeft && (
//                       <button
//                         onClick={() => scrollTable('left')}
//                         className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-2xl rounded-full p-3 transition-all hover:scale-110"
//                       >
//                         <ChevronLeft className="w-6 h-6" />
//                       </button>
//                     )}
                    
//                     {canScrollRight && (
//                       <button
//                         onClick={() => scrollTable('right')}
//                         className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-2xl rounded-full p-3 transition-all hover:scale-110 animate-pulse"
//                       >
//                         <ChevronRight className="w-6 h-6" />
//                       </button>
//                     )}

//                     {/* Table Wrapper with Forced Scroll */}
//                     <div 
//                       ref={tableContainerRef}
//                       style={{
//                         width: '100%',
//                         overflowX: 'scroll',
//                         overflowY: 'auto',
//                         maxHeight: '70vh',
//                         WebkitOverflowScrolling: 'touch',
//                       }}
//                       className="scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200"
//                     >
//                       <table 
//                         style={{ 
//                           width: `${totalTableWidth}px`,
//                           minWidth: `${totalTableWidth}px`,
//                         }}
//                         className="border-collapse"
//                       >
//                         <thead className="sticky top-0 z-10">
//                           <tr className="bg-gray-50 dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
//                             {tableColumns.map((column) => (
//                               <th
//                                 key={column.key}
//                                 className={`px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap ${
//                                   column.center ? 'text-center' : 'text-left'
//                                 }`}
//                                 style={{
//                                   width: `${column.width}px`,
//                                   minWidth: `${column.width}px`,
//                                   maxWidth: `${column.width}px`,
//                                   position: column.sticky ? 'sticky' : 'relative',
//                                   left: column.sticky === 'left' ? 0 : undefined,
//                                   right: column.sticky === 'right' ? 0 : undefined,
//                                   zIndex: column.sticky ? 40 : 10,
//                                   backgroundColor: '#f9fafb',
//                                   boxShadow: column.sticky === 'left' 
//                                     ? '4px 0 8px -2px rgba(0,0,0,0.15)' 
//                                     : column.sticky === 'right'
//                                     ? '-4px 0 8px -2px rgba(0,0,0,0.15)'
//                                     : undefined,
//                                 }}
//                               >
//                                 {column.label}
//                               </th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white dark:bg-gray-800">
//                           {filteredResults.map((result) => (
//                             <tr
//                               key={result.id}
//                               className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                             >
//                               {tableColumns.map((column) => (
//                                 <td
//                                   key={column.key}
//                                   className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
//                                   style={{
//                                     width: `${column.width}px`,
//                                     minWidth: `${column.width}px`,
//                                     maxWidth: `${column.width}px`,
//                                     position: column.sticky ? 'sticky' : 'relative',
//                                     left: column.sticky === 'left' ? 0 : undefined,
//                                     right: column.sticky === 'right' ? 0 : undefined,
//                                     zIndex: column.sticky ? 30 : 1,
//                                     backgroundColor: column.sticky ? '#ffffff' : undefined,
//                                     boxShadow: column.sticky === 'left' 
//                                       ? '4px 0 8px -2px rgba(0,0,0,0.15)' 
//                                       : column.sticky === 'right'
//                                       ? '-4px 0 8px -2px rgba(0,0,0,0.15)'
//                                       : undefined,
//                                   }}
//                                 >
//                                   {renderTableCell(column, result)}
//                                 </td>
//                               ))}
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>

//                     {/* Footer */}
//                     <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
//                           <ChevronLeft className="w-4 h-4 mr-2" />
//                           <span className="font-medium">Table is {totalTableWidth}px wide - Scroll to view all {tableColumns.length} columns</span>
//                           <ChevronRight className="w-4 h-4 ml-2" />
//                         </div>
//                         <div className="text-sm font-medium text-gray-900 dark:text-white">
//                           {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
//                   <div className="p-6 space-y-4">
//                     {filteredResults.map((result) => (
//                       <div key={result.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
//                         <div className="flex items-start justify-between mb-4">
//                           <div className="flex items-center space-x-3">
//                             {result.student.profile_picture ? (
//                               <img 
//                                 src={result.student.profile_picture} 
//                                 alt={result.student.full_name}
//                                 className="w-10 h-10 rounded-full object-cover"
//                               />
//                             ) : (
//                               <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
//                                 <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
//                               </div>
//                             )}
//                             <div>
//                               <h3 className="font-semibold text-gray-900 dark:text-white">{result.student.full_name}</h3>
//                               <p className="text-sm text-gray-500 dark:text-gray-400">{result.student.registration_number}</p>
//                             </div>
//                           </div>
//                           {getStatusBadge(result.status)}
//                         </div>
                        
//                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
//                           <div>
//                             <span className="text-gray-500 dark:text-gray-400">Subject:</span>
//                             <p className="font-medium text-gray-900 dark:text-white">{result.subject.name}</p>
//                           </div>
//                           <div>
//                             <span className="text-gray-500 dark:text-gray-400">CA:</span>
//                             <p className="font-medium text-gray-900 dark:text-white">{result.ca_score}</p>
//                           </div>
//                           <div>
//                             <span className="text-gray-500 dark:text-gray-400">Exam:</span>
//                             <p className="font-medium text-gray-900 dark:text-white">{result.exam_score}</p>
//                           </div>
//                           <div>
//                             <span className="text-gray-500 dark:text-gray-400">Total:</span>
//                             <p className="font-medium text-blue-600 dark:text-blue-400">{result.total_score}</p>
//                           </div>
//                         </div>

//                         <div className="mt-4 flex items-center justify-between">
//                           <div>
//                             <span className="text-gray-500 dark:text-gray-400 text-sm">Grade: </span>
//                             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
//                               {result.grade ?? '—'}
//                             </span>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <button
//                               onClick={() => handleViewResult(result)}
//                               className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
//                               title="View Details"
//                             >
//                               <Eye className="w-4 h-4" />
//                             </button>
//                             <button
//                               onClick={() => handleEditResult(result)}
//                               className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
//                               title="Edit Result"
//                             >
//                               <Edit className="w-4 h-4" />
//                             </button>
//                             <button
//                               onClick={() => handleDeleteResult(result)}
//                               className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
//                               title="Delete Result"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )
//             ) : (
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
//                 <div className="text-center py-12 px-6">
//                   <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4 mx-auto" />
//                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
//                   <p className="text-gray-500 dark:text-gray-400 mb-4">
//                     {searchTerm || filterSubject !== 'all' || filterStatus !== 'all'
//                       ? 'Try adjusting your search criteria'
//                       : 'Start by recording results for your students'}
//                   </p>
//                   <button 
//                     onClick={handleCreateResult} 
//                     className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     <Plus className="w-4 h-4 mr-2" /> Record First Result
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}

//         <ResultModalsComponent />
//       </div>
//     </TeacherDashboardLayout>
//   );
// };

// export default TeacherResults;


// import React, { useEffect, useMemo, useState } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
// import TeacherDashboardService from '@/services/TeacherDashboardService';
// import ResultService from '@/services/ResultService';
// import ResultCreateTab from '@/components/dashboards/teacher/ResultCreateTab';
// import useResultActionsManager from '@/components/dashboards/teacher/ResultActionsManager';
// import { toast } from 'react-toastify';
// import { TeacherAssignment, StudentResult } from '@/types/types';
// import { 
//   Plus, Edit, Trash2, Eye, CheckCircle, AlertCircle, RefreshCw, 
//   Search, X, FileText, Filter, TrendingUp, Award, Calendar, 
//   GraduationCap, Grid, List
// } from 'lucide-react';

// type EducationLevel = 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY' | 'UNKNOWN' | 'MIXED' | string;
// type ResultStatus = 'DRAFT' | 'PUBLISHED' | 'APPROVED' | 'ARCHIVED' | string;
// type ViewMode = 'table' | 'card';

// const TeacherResults: React.FC = () => {
//   const { user, isLoading: authLoading } = useAuth();
  
//   const [results, setResults] = useState<StudentResult[]>([]);
//   const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterSubject, setFilterSubject] = useState('all');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [filterEducationLevel, setFilterEducationLevel] = useState<EducationLevel | 'all'>('all');
//   const [showFilters, setShowFilters] = useState(false);
//   const [activeTab, setActiveTab] = useState<'results' | 'record'>('results');
//   const [viewMode, setViewMode] = useState<ViewMode>('card');
//   const [debugInfo, setDebugInfo] = useState<string>('');

//   async function loadTeacherData() {
//     try {
//       setLoading(true);
//       setError(null);
//       let debugLog = '';

//       const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user as unknown as object);
//       debugLog += `Teacher ID: ${teacherId}\n`;
      
//       if (!teacherId) throw new Error('Teacher ID not found');

//       const subjects = await TeacherDashboardService.getTeacherSubjects(teacherId);
//       debugLog += `Subjects loaded: ${subjects.length}\n`;

//       const assignments: TeacherAssignment[] = subjects.map((subject: any) => {
//         const educationLevel = subject.education_level 
//           || subject.grade_level_education_level
//           || subject.classroom_education_level
//           || (subject.assignments && subject.assignments[0]?.education_level)
//           || (subject.assignments && subject.assignments[0]?.grade_level?.education_level)
//           || 'UNKNOWN';
        
//         return {
//           id: subject.id,
//           classroom_name: subject.classroom ?? 'Unknown',
//           section_name: subject.section_name ?? subject.section ?? 'Unknown',
//           grade_level_name: subject.grade_level_name ?? subject.grade_level ?? 'Unknown',
//           education_level: educationLevel,
//           subject_name: subject.subject_name ?? subject.name ?? 'Unknown Subject',
//           subject_code: subject.subject_code ?? subject.code ?? '',
//           subject_id: Number(subject.subject_id ?? subject.id),
//           grade_level_id: subject.grade_level_id ?? null,
//           section_id: subject.section_id ?? null,
//           student_count: subject.student_count ?? 0,
//           periods_per_week: subject.periods_per_week ?? 0,
//           teacher: subject.teacher ?? null,
//           grade_level: subject.grade_level ?? null,
//           section: subject.section ?? null,
//           academic_year: subject.academic_year ?? null,
//           is_primary_teacher: subject.is_primary_teacher ?? false,
//         };
//       });
//       setTeacherAssignments(assignments);

//       const subjectIds = subjects.map((s: any) => s.id).filter(Boolean);
//       debugLog += `Subject IDs for query: ${subjectIds.join(', ')}\n`;

//       if (subjectIds.length) {
//         const educationLevels = new Set<string>();
        
//         subjects.forEach((s: any) => {
//           const level = s.education_level 
//             || s.grade_level_education_level
//             || s.classroom_education_level;
          
//           if (level) educationLevels.add(level);
          
//           if (s.assignments && Array.isArray(s.assignments)) {
//             s.assignments.forEach((assignment: any) => {
//               const assignmentLevel = assignment.education_level 
//                 || assignment.grade_level?.education_level
//                 || assignment.classroom?.education_level;
//               if (assignmentLevel) educationLevels.add(assignmentLevel);
//             });
//           }
//         });
        
//         let levelsToQuery = Array.from(educationLevels);
        
//         if (levelsToQuery.length === 0) {
//           levelsToQuery = ['NURSERY', 'PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'];
//           debugLog += `No education levels found, querying all common levels\n`;
//         } else {
//           debugLog += `Education levels found: ${levelsToQuery.join(', ')}\n`;
//         }

//         const allResults: any[] = [];
        
//         for (const level of levelsToQuery) {
//           try {
//             debugLog += `Querying ${level} with subjects: ${subjectIds.join(',')}\n`;
//             const levelResults = await ResultService.getStudentResults({ 
//               subject: subjectIds.join(','),
//               education_level: level
//             });
//             const resultsArray = Array.isArray(levelResults) 
//               ? levelResults 
//               : ((levelResults as any)?.data || (levelResults as any)?.results || []);
//             allResults.push(...resultsArray);
//             debugLog += `Results for ${level}: ${resultsArray.length}\n`;
//           } catch (levelErr) {
//             debugLog += `Error fetching results for ${level}: ${levelErr}\n`;
//           }
//         }
        
//         debugLog += `Total raw results: ${allResults.length}\n`;

//         const normalized: StudentResult[] = allResults.map((r: any): StudentResult => {
//           const studentId = (r.student && r.student.id) || r.student || r.student_id;
//           const subjectId = (r.subject && r.subject.id) || r.subject || r.subject_id;
//           const examSessionId = (r.exam_session && r.exam_session.id) || r.exam_session || r.exam_session_id || r.session_id;

//           const caFromSenior = Number(r.first_test_score || 0) + Number(r.second_test_score || 0) + Number(r.third_test_score || 0);
//           const caFromPrimary =
//             r.ca_total !== undefined
//               ? Number(r.ca_total)
//               : Number(r.continuous_assessment_score || 0) +
//                 Number(r.take_home_test_score || 0) +
//                 Number(r.practical_score || 0) +
//                 Number(r.project_score || 0) +
//                 Number(r.note_copying_score || 0);
//           const caFromTotalField = r.total_ca_score !== undefined ? Number(r.total_ca_score) : undefined;
//           const ca_score = caFromTotalField ?? (caFromSenior > 0 ? caFromSenior : caFromPrimary || 0);

//           return {
//             id: r.id ? Number(r.id) : 0,
//             student: {
//               id: Number(studentId),
//               full_name: r.student?.full_name ?? r.student_name ?? r.student_full_name ?? 'Unknown Student',
//               registration_number: r.student?.registration_number ?? r.registration_number ?? r.student_registration_number ?? '',
//               profile_picture: r.student?.profile_picture ?? r.student_profile_picture ?? null,
//               education_level: (r.student?.education_level || r.education_level || 'UNKNOWN') as EducationLevel,
//             },
//             subject: {
//               id: Number(subjectId),
//               name: r.subject?.name ?? r.subject_name ?? 'Unknown Subject',
//               code: r.subject?.code ?? r.subject_code ?? '',
//             },
//             exam_session: {
//               id: Number(examSessionId),
//               name: r.exam_session?.name ?? r.session?.name ?? r.exam_session_name ?? r.session_name ?? (typeof r.exam_session === 'object' ? r.exam_session?.session_name : null) ?? 'First Term',
//               term: r.exam_session?.term ?? r.session?.term ?? r.term ?? r.term_name ?? (typeof r.exam_session === 'object' ? r.exam_session?.term_name : null) ?? 'Term 1',
//               academic_session: r.exam_session?.academic_session?.name ?? r.exam_session?.academic_year ?? r.academic_session_name ?? r.academic_session ?? r.academic_year ?? '2024/2025',
//             },
//             first_test_score: Number(r.first_test_score || 0),
//             second_test_score: Number(r.second_test_score || 0),
//             third_test_score: Number(r.third_test_score || 0),
//             continuous_assessment_score: Number(r.continuous_assessment_score || 0),
//             take_home_test_score: Number(r.take_home_test_score || 0),
//             practical_score: Number(r.practical_score || 0),
//             project_score: Number(r.project_score || 0),
//             note_copying_score: Number(r.note_copying_score || 0),
//             ca_score,
//             exam_score: Number((r.exam_score ?? r.exam) ?? 0),
//             total_score: Number((r.total_score ?? (ca_score + Number(r.exam_score ?? 0))) ?? 0),
//             education_level: (r.education_level || r.student?.education_level || 'UNKNOWN') as EducationLevel,
//             grade: r.grade ?? r.letter_grade,
//             status: (typeof r.status === 'string' ? r.status.toUpperCase() : 'DRAFT') as ResultStatus,
//             remarks: r.remarks ?? '',
//             created_at: r.created_at ?? '',
//             updated_at: r.updated_at ?? '',
//           };
//         });

//         debugLog += `Normalized results: ${normalized.length}\n`;

//         const idSet = new Set(subjectIds.map((id: number) => String(id)));
//         const filtered = normalized.filter((item) => idSet.has(String(item.subject.id)));
        
//         debugLog += `Filtered results: ${filtered.length}\n`;
//         setResults(filtered);
//       } else {
//         setResults([]);
//         debugLog += 'No subject IDs found\n';
//       }
      
//       setDebugInfo(debugLog);
      
//     } catch (err) {
//       console.error('Error loading teacher data:', err);
//       const errorMsg = err instanceof Error ? err.message : 'Failed to load data';
//       setError(errorMsg);
//       setDebugInfo(prev => prev + `\nERROR: ${errorMsg}`);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const { 
//     handleEditResult, 
//     handleViewResult, 
//     handleDeleteResult, 
//     ResultModalsComponent,
//   } = useResultActionsManager(loadTeacherData);

//   useEffect(() => {
//     if (user && !authLoading) {
//       void loadTeacherData();
//     }
//   }, [user, authLoading]);

//   const availableEducationLevels = useMemo(
//     () => Array.from(new Set(results.map((r) => r.education_level))).filter(Boolean) as EducationLevel[],
//     [results]
//   );

//   const availableSubjects = useMemo(
//     () =>
//       teacherAssignments.map((assignment) => ({
//         id: String(assignment.subject_id),
//         name: String(assignment.subject_name),
//         code: String(assignment.subject_code),
//       })),
//     [teacherAssignments]
//   );

//   const filteredResults = useMemo(() => {
//     const term = (searchTerm || '').toLowerCase();
//     return results.filter((result) => {
//       const matchesSearch =
//         (result.student?.full_name || '').toLowerCase().includes(term) ||
//         (result.student?.registration_number || '').toLowerCase().includes(term) ||
//         (result.subject?.name || '').toLowerCase().includes(term);

//       const matchesSubject = filterSubject === 'all' || String(result.subject?.id ?? '') === filterSubject;
//       const matchesStatus =
//         filterStatus === 'all' || (String(result.status || '').toLowerCase() === filterStatus.toLowerCase());
//       const matchesEducationLevel =
//         filterEducationLevel === 'all' || result.education_level === filterEducationLevel;

//       return matchesSearch && matchesSubject && matchesStatus && matchesEducationLevel;
//     });
//   }, [results, searchTerm, filterSubject, filterStatus, filterEducationLevel]);

//   const stats = useMemo(() => [
//     { label: 'Total', value: results.length, icon: FileText, color: 'bg-blue-500' },
//     { label: 'Published', value: results.filter(r => r.status === 'PUBLISHED').length, icon: CheckCircle, color: 'bg-green-500' },
//     { label: 'Average', value: results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.total_score, 0) / results.length) : 0, icon: TrendingUp, color: 'bg-purple-500' },
//     { label: 'A Grades', value: results.filter(r => r.grade === 'A').length, icon: Award, color: 'bg-amber-500' }
//   ], [results]);

//   const handleCreateResult = () => {
//     setActiveTab('record');
//   };

//   const handleResultSuccess = async (): Promise<void> => {
//     try {
//       await loadTeacherData();
//       setActiveTab('results');
//       toast.success('Result saved successfully');
//     } catch (error) {
//       console.error('Error handling result success:', error);
//       toast.error('Failed to reload data');
//     }
//   };

//   const getStatusColor = (status: ResultStatus) => {
//     const colors: Record<string, string> = {
//       DRAFT: 'bg-amber-100 text-amber-700 border-amber-200',
//       PUBLISHED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
//       APPROVED: 'bg-blue-100 text-blue-700 border-blue-200',
//       ARCHIVED: 'bg-gray-100 text-gray-700 border-gray-200'
//     };
//     return colors[status] || colors.DRAFT;
//   };

//   const getGradeColor = (grade?: string) => {
//     const colors: Record<string, string> = {
//       A: 'bg-green-500 text-white',
//       B: 'bg-blue-500 text-white',
//       C: 'bg-yellow-500 text-white',
//       D: 'bg-orange-500 text-white',
//       F: 'bg-red-500 text-white'
//     };
//     return colors[grade || ''] || 'bg-gray-400 text-white';
//   };

//   if (loading) {
//     return (
//       <TeacherDashboardLayout>
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
//           <div className="flex flex-col items-center space-y-4">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
//             <p className="text-sm md:text-base text-gray-600 font-medium">Loading Results...</p>
//           </div>
//         </div>
//       </TeacherDashboardLayout>
//     );
//   }

//   if (error) {
//     return (
//       <TeacherDashboardLayout>
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
//           <div className="max-w-2xl mx-auto">
//             <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 md:p-6">
//               <div className="flex items-center gap-3 mb-4">
//                 <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600 flex-shrink-0" />
//                 <h3 className="text-base md:text-lg font-semibold text-red-900">Error Loading Data</h3>
//               </div>
//               <p className="text-sm text-red-800 mb-4">{error}</p>
//               <button 
//                 onClick={loadTeacherData}
//                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
//               >
//                 Try Again
//               </button>
//             </div>
//           </div>
//         </div>
//       </TeacherDashboardLayout>
//     );
//   }

//   if (activeTab === 'record') {
//     return (
//       <TeacherDashboardLayout>
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 md:p-6">
//           <div className="max-w-6xl mx-auto">
//             <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
//               <div className="flex items-center justify-between mb-4 md:mb-6">
//                 <h2 className="text-lg md:text-xl font-bold text-gray-900">Record Result</h2>
//                 <button 
//                   onClick={() => setActiveTab('results')}
//                   className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 hover:bg-gray-100 rounded-lg transition-colors"
//                 >
//                   <X className="w-4 h-4" /> Close
//                 </button>
//               </div>
//               <ResultCreateTab
//                 onResultCreated={loadTeacherData}
//                 onSuccess={handleResultSuccess}
//                 onClose={() => setActiveTab('results')}
//               />
//             </div>
//           </div>
//         </div>
//       </TeacherDashboardLayout>
//     );
//   }

//   return (
//     <TeacherDashboardLayout>
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//         {/* Compact Header */}
//         <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
//           <div className="max-w-7xl mx-auto px-3 md:px-6 py-3">
//             <div className="flex items-center justify-between gap-3">
//               <div className="flex items-center gap-2 min-w-0">
//                 <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-white" />
//                 </div>
//                 <div className="min-w-0">
//                   <h1 className="text-base md:text-lg font-bold text-gray-900 truncate">Results</h1>
//                   <p className="text-xs text-gray-500 hidden sm:block">Manage performance</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2 flex-shrink-0">
//                 <button 
//                   onClick={loadTeacherData}
//                   disabled={loading}
//                   className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
//                   title="Refresh"
//                 >
//                   <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//                 </button>
//                 <button 
//                   onClick={handleCreateResult}
//                   className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-1.5 text-sm font-medium"
//                 >
//                   <Plus className="w-4 h-4" />
//                   <span className="hidden sm:inline">Record</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-4 space-y-3 md:space-y-4">
//           {/* Compact Stats */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
//             {stats.map((stat, idx) => (
//               <div key={idx} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
//                 <div className="flex items-center justify-between gap-2">
//                   <div className="min-w-0">
//                     <p className="text-xs text-gray-600 mb-0.5 truncate">{stat.label}</p>
//                     <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
//                   </div>
//                   <div className={`w-8 h-8 md:w-10 md:h-10 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
//                     <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Compact Search and Filters */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
//             <div className="flex flex-col gap-2">
//               <div className="flex gap-2">
//                 <div className="flex-1 relative">
//                   <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//                   <input
//                     type="text"
//                     placeholder="Search..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
//                   />
//                 </div>
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1.5"
//                 >
//                   <Filter className="w-4 h-4" />
//                   <span className="hidden sm:inline">Filters</span>
//                   {(filterSubject !== 'all' || filterStatus !== 'all' || filterEducationLevel !== 'all') && (
//                     <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
//                   )}
//                 </button>
//                 {/* View Mode Toggle - Hidden on Mobile */}
//                 <div className="hidden md:flex border border-gray-200 rounded-lg overflow-hidden">
//                   <button
//                     onClick={() => setViewMode('table')}
//                     className={`p-2 ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
//                     title="Table View"
//                   >
//                     <List className="w-4 h-4" />
//                   </button>
//                   <button
//                     onClick={() => setViewMode('card')}
//                     className={`p-2 ${viewMode === 'card' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'} transition-colors border-l border-gray-200`}
//                     title="Card View"
//                   >
//                     <Grid className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>

//               {showFilters && (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-gray-100">
//                   <select
//                     value={String(filterEducationLevel)}
//                     onChange={(e) => setFilterEducationLevel(e.target.value as EducationLevel | 'all')}
//                     className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
//                   >
//                     <option value="all">All Levels</option>
//                     {availableEducationLevels.map((level) => (
//                       <option key={String(level)} value={String(level)}>
//                         {String(level).replace(/_/g, ' ')}
//                       </option>
//                     ))}
//                   </select>

//                   <select
//                     value={filterSubject}
//                     onChange={(e) => setFilterSubject(e.target.value)}
//                     className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
//                   >
//                     <option value="all">All Subjects</option>
//                     {availableSubjects.map((subject) => (
//                       <option key={subject.id} value={subject.id}>
//                         {subject.name}
//                       </option>
//                     ))}
//                   </select>

//                   <select
//                     value={filterStatus}
//                     onChange={(e) => setFilterStatus(e.target.value)}
//                     className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="draft">Draft</option>
//                     <option value="published">Published</option>
//                     <option value="approved">Approved</option>
//                     <option value="archived">Archived</option>
//                   </select>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Results Display - Card View on Mobile, Toggle on Desktop */}
//           {(viewMode === 'card' || window.innerWidth < 768) ? (
//             <div className="space-y-3">
//               <div className="flex items-center justify-between px-1">
//                 <p className="text-xs md:text-sm text-gray-600">
//                   {filteredResults.length} of {results.length} results
//                 </p>
//               </div>
              
//               {filteredResults.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                   {filteredResults.map((result) => (
//                     <div key={result.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
//                       {/* Card Header */}
//                       <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 border-b border-gray-100">
//                         <div className="flex items-start gap-2">
//                           {result.student.profile_picture ? (
//                             <img 
//                               src={result.student.profile_picture} 
//                               alt={result.student.full_name} 
//                               className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" 
//                             />
//                           ) : (
//                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm">
//                               {result.student.full_name.charAt(0)}
//                             </div>
//                           )}
//                           <div className="flex-1 min-w-0">
//                             <h3 className="font-semibold text-sm text-gray-900 truncate">{result.student.full_name}</h3>
//                             <p className="text-xs text-gray-500 truncate">{result.student.registration_number}</p>
//                           </div>
//                           <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(result.status ?? 'DRAFT')} flex-shrink-0`}>
//                             {result.status ?? 'DRAFT'}
//                           </span>
//                         </div>
//                       </div>

//                       {/* Card Body */}
//                       <div className="p-3 space-y-2">
//                         <div className="flex items-center justify-between text-xs">
//                           <span className="text-gray-600">Subject:</span>
//                           <span className="font-medium text-gray-900 truncate ml-2">{result.subject.name}</span>
//                         </div>
                        
//                         <div className="flex items-center gap-1.5 text-xs text-gray-600">
//                           <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
//                           <span className="truncate">{result.exam_session.name} - {result.exam_session.term}</span>
//                         </div>

//                         <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
//                           <div className="text-center">
//                             <p className="text-xs text-gray-500 mb-1">CA</p>
//                             <div className="bg-blue-50 rounded-lg py-1.5">
//                               <p className="text-base font-bold text-blue-900">{result.ca_score}</p>
//                             </div>
//                           </div>
//                           <div className="text-center">
//                             <p className="text-xs text-gray-500 mb-1">Exam</p>
//                             <div className="bg-purple-50 rounded-lg py-1.5">
//                               <p className="text-base font-bold text-purple-900">{result.exam_score}</p>
//                             </div>
//                           </div>
//                           <div className="text-center">
//                             <p className="text-xs text-gray-500 mb-1">Total</p>
//                             <div className="bg-green-50 rounded-lg py-1.5">
//                               <p className="text-base font-bold text-green-900">{result.total_score}</p>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="flex items-center justify-between pt-2">
//                           <div className="flex items-center gap-2">
//                             <span className="text-xs text-gray-600">Grade:</span>
//                             <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${getGradeColor(result.grade)}`}>
//                               {result.grade ?? '—'}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <button 
//                               onClick={() => handleViewResult(result)} 
//                               className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" 
//                               title="View"
//                             >
//                               <Eye className="w-4 h-4 text-gray-600" />
//                             </button>
//                             <button 
//                               onClick={() => handleEditResult(result)} 
//                               className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors" 
//                               title="Edit"
//                             >
//                               <Edit className="w-4 h-4 text-gray-600" />
//                             </button>
//                             <button 
//                               onClick={() => handleDeleteResult(result)} 
//                               className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" 
//                               title="Delete"
//                             >
//                               <Trash2 className="w-4 h-4 text-gray-600" />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="bg-white rounded-lg p-8 md:p-12 text-center">
//                   <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
//                     <FileText className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
//                   </div>
//                   <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No results found</h3>
//                   <p className="text-sm text-gray-500 mb-4 md:mb-6">
//                     {searchTerm || filterSubject !== 'all' || filterStatus !== 'all' || filterEducationLevel !== 'all'
//                       ? 'Try adjusting your filters' 
//                       : 'Start by recording your first result'}
//                   </p>
//                   <button 
//                     onClick={handleCreateResult} 
//                     className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all inline-flex items-center gap-2 font-medium text-sm"
//                   >
//                     <Plus className="w-4 h-4" /> Record First Result
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
//               <div className="p-3 md:p-4 border-b border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className="text-base md:text-lg font-semibold text-gray-900">Student Results</h2>
//                     <p className="text-xs md:text-sm text-gray-500">{filteredResults.length} of {results.length} results</p>
//                   </div>
//                 </div>
//               </div>

//               {filteredResults.length > 0 ? (
//                 <div className="overflow-x-auto">
//                   <div style={{ minWidth: '1200px' }}>
//                     <table className="w-full">
//                       <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
//                         <tr>
//                           <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '200px' }}>
//                             Student
//                           </th>
//                           <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '160px' }}>
//                             Subject
//                           </th>
//                           <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '180px' }}>
//                             Session
//                           </th>
//                           <th className="px-3 py-2.5 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider bg-blue-50 whitespace-nowrap" style={{ minWidth: '90px' }}>
//                             CA
//                           </th>
//                           <th className="px-3 py-2.5 text-center text-xs font-semibold text-purple-800 uppercase tracking-wider bg-purple-50 whitespace-nowrap" style={{ minWidth: '90px' }}>
//                             Exam
//                           </th>
//                           <th className="px-3 py-2.5 text-center text-xs font-semibold text-green-800 uppercase tracking-wider bg-green-50 whitespace-nowrap" style={{ minWidth: '90px' }}>
//                             Total
//                           </th>
//                           <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '80px' }}>
//                             Grade
//                           </th>
//                           <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '120px' }}>
//                             Status
//                           </th>
//                           <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '140px' }}>
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-100">
//                         {filteredResults.map((result, index) => (
//                           <tr key={result.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
//                             <td className="px-3 py-2.5 whitespace-nowrap" style={{ minWidth: '200px' }}>
//                               <div className="flex items-center gap-2">
//                                 {result.student.profile_picture ? (
//                                   <img 
//                                     src={result.student.profile_picture} 
//                                     alt={result.student.full_name} 
//                                     className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" 
//                                   />
//                                 ) : (
//                                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0 text-xs">
//                                     {result.student.full_name.charAt(0)}
//                                   </div>
//                                 )}
//                                 <div className="min-w-0">
//                                   <p className="font-medium text-gray-900 text-xs truncate">{result.student.full_name}</p>
//                                   <p className="text-xs text-gray-500 truncate">{result.student.registration_number}</p>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="px-3 py-2.5 whitespace-nowrap" style={{ minWidth: '160px' }}>
//                               <p className="font-medium text-gray-900 text-xs truncate">{result.subject.name}</p>
//                               <p className="text-xs text-gray-500">{result.subject.code}</p>
//                             </td>
//                             <td className="px-3 py-2.5 whitespace-nowrap" style={{ minWidth: '180px' }}>
//                               <p className="text-xs text-gray-900 truncate">{result.exam_session.name}</p>
//                               <p className="text-xs text-gray-500 truncate">{result.exam_session.term}</p>
//                             </td>
//                             <td className="px-3 py-2.5 text-center bg-blue-50/50 whitespace-nowrap" style={{ minWidth: '90px' }}>
//                               <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs">
//                                 {result.ca_score}
//                               </span>
//                             </td>
//                             <td className="px-3 py-2.5 text-center bg-purple-50/50 whitespace-nowrap" style={{ minWidth: '90px' }}>
//                               <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-bold text-xs">
//                                 {result.exam_score}
//                               </span>
//                             </td>
//                             <td className="px-3 py-2.5 text-center bg-green-50/50 whitespace-nowrap" style={{ minWidth: '90px' }}>
//                               <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-green-100 text-green-900 font-bold text-xs">
//                                 {result.total_score}
//                               </span>
//                             </td>
//                             <td className="px-3 py-2.5 text-center whitespace-nowrap" style={{ minWidth: '80px' }}>
//                               <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs ${getGradeColor(result.grade)}`}>
//                                 {result.grade ?? '—'}
//                               </span>
//                             </td>
//                             <td className="px-3 py-2.5 text-center whitespace-nowrap" style={{ minWidth: '120px' }}>
//                               <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(result.status ?? 'DRAFT')}`}>
//                                 {result.status ?? 'DRAFT'}
//                               </span>
//                             </td>
//                             <td className="px-3 py-2.5 text-center whitespace-nowrap" style={{ minWidth: '140px' }}>
//                               <div className="flex items-center justify-center gap-1">
//                                 <button 
//                                   onClick={() => handleViewResult(result)} 
//                                   className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" 
//                                   title="View"
//                                 >
//                                   <Eye className="w-4 h-4 text-gray-600" />
//                                 </button>
//                                 <button 
//                                   onClick={() => handleEditResult(result)} 
//                                   className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors" 
//                                   title="Edit"
//                                 >
//                                   <Edit className="w-4 h-4 text-gray-600" />
//                                 </button>
//                                 <button 
//                                   onClick={() => handleDeleteResult(result)} 
//                                   className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" 
//                                   title="Delete"
//                                 >
//                                   <Trash2 className="w-4 h-4 text-gray-600" />
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="p-8 md:p-12 text-center">
//                   <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
//                     <FileText className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
//                   </div>
//                   <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No results found</h3>
//                   <p className="text-sm text-gray-500 mb-4 md:mb-6">
//                     {searchTerm || filterSubject !== 'all' || filterStatus !== 'all' || filterEducationLevel !== 'all'
//                       ? 'Try adjusting your filters' 
//                       : 'Start by recording your first result'}
//                   </p>
//                   <button 
//                     onClick={handleCreateResult} 
//                     className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all inline-flex items-center gap-2 font-medium text-sm"
//                   >
//                     <Plus className="w-4 h-4" /> Record First Result
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         <ResultModalsComponent />
//       </div>
//     </TeacherDashboardLayout>
//   );
// };

// export default TeacherResults;

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
import TeacherDashboardService from '@/services/TeacherDashboardService';
import ResultService from '@/services/ResultService';
import ResultCreateTab from '@/components/dashboards/teacher/ResultCreateTab';
import useResultActionsManager from '@/components/dashboards/teacher/ResultActionsManager';
import { toast } from 'react-toastify';
import { TeacherAssignment, StudentResult } from '@/types/types';
import { 
  Plus, Edit, Trash2, Eye, CheckCircle, AlertCircle, RefreshCw, 
  Search, X, FileText, Filter, TrendingUp, Award, Calendar, 
  GraduationCap, Grid, List
} from 'lucide-react';

type EducationLevel = 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY' | 'UNKNOWN' | 'MIXED' | string;
type ResultStatus = 'DRAFT' | 'PUBLISHED' | 'APPROVED' | 'ARCHIVED' | string;
type ViewMode = 'table' | 'card';

const TeacherResults: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  
  const [results, setResults] = useState<StudentResult[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEducationLevel, setFilterEducationLevel] = useState<EducationLevel | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'record'>('results');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  async function loadTeacherData() {
    try {
      setLoading(true);
      setError(null);
      let debugLog = '';

      const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user as unknown as object);
      debugLog += `Teacher ID: ${teacherId}\n`;
      
      if (!teacherId) throw new Error('Teacher ID not found');

      const subjects = await TeacherDashboardService.getTeacherSubjects(teacherId);
      debugLog += `Subjects loaded: ${subjects.length}\n`;

      const assignments: TeacherAssignment[] = subjects.map((subject: any) => {
        const educationLevel = subject.education_level 
          || subject.grade_level_education_level
          || subject.classroom_education_level
          || (subject.assignments && subject.assignments[0]?.education_level)
          || (subject.assignments && subject.assignments[0]?.grade_level?.education_level)
          || 'UNKNOWN';
        
        return {
          id: subject.id,
          classroom_name: subject.classroom ?? 'Unknown',
          section_name: subject.section_name ?? subject.section ?? 'Unknown',
          grade_level_name: subject.grade_level_name ?? subject.grade_level ?? 'Unknown',
          education_level: educationLevel,
          subject_name: subject.subject_name ?? subject.name ?? 'Unknown Subject',
          subject_code: subject.subject_code ?? subject.code ?? '',
          subject_id: Number(subject.subject_id ?? subject.id),
          grade_level_id: subject.grade_level_id ?? null,
          section_id: subject.section_id ?? null,
          student_count: subject.student_count ?? 0,
          periods_per_week: subject.periods_per_week ?? 0,
          teacher: subject.teacher ?? null,
          grade_level: subject.grade_level ?? null,
          section: subject.section ?? null,
          academic_year: subject.academic_year ?? null,
          is_primary_teacher: subject.is_primary_teacher ?? false,
        };
      });
      setTeacherAssignments(assignments);

      const subjectIds = subjects.map((s: any) => s.id).filter(Boolean);
      debugLog += `Subject IDs for query: ${subjectIds.join(', ')}\n`;

      if (subjectIds.length) {
        const educationLevels = new Set<string>();
        
        subjects.forEach((s: any) => {
          const level = s.education_level 
            || s.grade_level_education_level
            || s.classroom_education_level;
          
          if (level) educationLevels.add(level);
          
          if (s.assignments && Array.isArray(s.assignments)) {
            s.assignments.forEach((assignment: any) => {
              const assignmentLevel = assignment.education_level 
                || assignment.grade_level?.education_level
                || assignment.classroom?.education_level;
              if (assignmentLevel) educationLevels.add(assignmentLevel);
            });
          }
        });
        
        let levelsToQuery = Array.from(educationLevels);
        
        if (levelsToQuery.length === 0) {
          levelsToQuery = ['NURSERY', 'PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'];
          debugLog += `No education levels found, querying all common levels\n`;
        } else {
          debugLog += `Education levels found: ${levelsToQuery.join(', ')}\n`;
        }

        const allResults: any[] = [];
        
        for (const level of levelsToQuery) {
          try {
            debugLog += `Querying ${level} with subjects: ${subjectIds.join(',')}\n`;
            const levelResults = await ResultService.getStudentResults({ 
              subject: subjectIds.join(','),
              education_level: level
            });
            const resultsArray = Array.isArray(levelResults) 
              ? levelResults 
              : ((levelResults as any)?.data || (levelResults as any)?.results || []);
            allResults.push(...resultsArray);
            debugLog += `Results for ${level}: ${resultsArray.length}\n`;
          } catch (levelErr) {
            debugLog += `Error fetching results for ${level}: ${levelErr}\n`;
          }
        }
        
        debugLog += `Total raw results: ${allResults.length}\n`;

        const normalized: StudentResult[] = allResults.map((r: any): StudentResult => {
          const studentId = (r.student && r.student.id) || r.student || r.student_id;
          const subjectId = (r.subject && r.subject.id) || r.subject || r.subject_id;
          const examSessionId = (r.exam_session && r.exam_session.id) || r.exam_session || r.exam_session_id || r.session_id;

          const caFromSenior = Number(r.first_test_score || 0) + Number(r.second_test_score || 0) + Number(r.third_test_score || 0);
          const caFromPrimary =
            r.ca_total !== undefined
              ? Number(r.ca_total)
              : Number(r.continuous_assessment_score || 0) +
                Number(r.take_home_test_score || 0) +
                Number(r.practical_score || 0) +
                Number(r.project_score || 0) +
                Number(r.note_copying_score || 0);
          const caFromTotalField = r.total_ca_score !== undefined ? Number(r.total_ca_score) : undefined;
          const ca_score = caFromTotalField ?? (caFromSenior > 0 ? caFromSenior : caFromPrimary || 0);

          return {
            id: r.id ? Number(r.id) : 0,
            student: {
              id: Number(studentId),
              full_name: r.student?.full_name ?? r.student_name ?? r.student_full_name ?? 'Unknown Student',
              registration_number: r.student?.username ?? r.registration_number ?? r.student_registration_number ?? '',
              profile_picture: r.student?.profile_picture ?? r.student_profile_picture ?? null,
              education_level: (r.student?.education_level || r.education_level || 'UNKNOWN') as EducationLevel,
            },
            subject: {
              id: Number(subjectId),
              name: r.subject?.name ?? r.subject_name ?? 'Unknown Subject',
              code: r.subject?.code ?? r.subject_code ?? '',
            },
            exam_session: {
              id: Number(examSessionId),
              name: r.exam_session?.academic_session_name ?? r.session?.name ?? r.exam_session_name ?? r.session_name ?? (typeof r.exam_session === 'object' ? r.exam_session?.session_name : null) ?? 'First Term',
              term: r.exam_session?.term ?? r.session?.term ?? r.term ?? r.term_name ?? (typeof r.exam_session === 'object' ? r.exam_session?.term_name : null) ?? 'Term 1',
              academic_session: r.exam_session?.academic_session?.name ?? r.exam_session?.academic_session?.name ?? r.exam_session?.academic_year ?? r.academic_session_name ?? r.academic_session ?? r.academic_year ?? '2024/2025',
            },
            first_test_score: Number(r.first_test_score || 0),
            second_test_score: Number(r.second_test_score || 0),
            third_test_score: Number(r.third_test_score || 0),
            continuous_assessment_score: Number(r.continuous_assessment_score || 0),
            take_home_test_score: Number(r.take_home_test_score || 0),
            practical_score: Number(r.practical_score || 0),
            project_score: Number(r.project_score || 0),
            note_copying_score: Number(r.note_copying_score || 0),
            ca_score,
            exam_score: Number((r.exam_score ?? r.exam) ?? 0),
            total_score: Number((r.total_score ?? (ca_score + Number(r.exam_score ?? 0))) ?? 0),
            education_level: (r.education_level || r.student?.education_level || 'UNKNOWN') as EducationLevel,
            grade: r.grade ?? r.letter_grade,
            status: (typeof r.status === 'string' ? r.status.toUpperCase() : 'DRAFT') as ResultStatus,
            remarks: r.remarks ?? '',
            created_at: r.created_at ?? '',
            updated_at: r.updated_at ?? '',
          };
        });

        debugLog += `Normalized results: ${normalized.length}\n`;

        const idSet = new Set(subjectIds.map((id: number) => String(id)));
        const filtered = normalized.filter((item) => idSet.has(String(item.subject.id)));
        
        debugLog += `Filtered results: ${filtered.length}\n`;
        setResults(filtered);
      } else {
        setResults([]);
        debugLog += 'No subject IDs found\n';
      }
      
      setDebugInfo(debugLog);
      
    } catch (err) {
      console.error('Error loading teacher data:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMsg);
      setDebugInfo(prev => prev + `\nERROR: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }

  const { 
    handleEditResult, 
    handleViewResult, 
    handleDeleteResult, 
    ResultModalsComponent,
  } = useResultActionsManager(loadTeacherData);

  useEffect(() => {
    if (user && !authLoading) {
      void loadTeacherData();
    }
  }, [user, authLoading]);

  const availableEducationLevels = useMemo(
    () => Array.from(new Set(results.map((r) => r.education_level))).filter(Boolean) as EducationLevel[],
    [results]
  );

  const availableSubjects = useMemo(
    () =>
      teacherAssignments.map((assignment) => ({
        id: String(assignment.subject_id),
        name: String(assignment.subject_name || 'Unknown'),
        code: String(assignment.subject_code || ''),
      })),
    [teacherAssignments]
  );

  const filteredResults = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    return results.filter((result) => {
      const matchesSearch =
        (result.student?.full_name || '').toLowerCase().includes(term) ||
        (result.student?.registration_number || '').toLowerCase().includes(term) ||
        (result.subject?.name || '').toLowerCase().includes(term);

      const matchesSubject = filterSubject === 'all' || String(result.subject?.id ?? '') === filterSubject;
      const matchesStatus =
        filterStatus === 'all' || (String(result.status || '').toLowerCase() === filterStatus.toLowerCase());
      const matchesEducationLevel =
        filterEducationLevel === 'all' || result.education_level === filterEducationLevel;

      return matchesSearch && matchesSubject && matchesStatus && matchesEducationLevel;
    });
  }, [results, searchTerm, filterSubject, filterStatus, filterEducationLevel]);

  const stats = useMemo(() => [
    { label: 'Total', value: String(results.length), icon: FileText, color: 'bg-blue-500' },
    { label: 'Published', value: String(results.filter(r => r.status === 'PUBLISHED').length), icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Average', value: String(results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.total_score, 0) / results.length) : 0), icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'A Grades', value: String(results.filter(r => r.grade === 'A').length), icon: Award, color: 'bg-amber-500' }
  ], [results]);

  const handleCreateResult = () => {
    setActiveTab('record');
  };

  const handleResultSuccess = async (): Promise<void> => {
    try {
      await loadTeacherData();
      setActiveTab('results');
      toast.success('Result saved successfully');
    } catch (error) {
      console.error('Error handling result success:', error);
      toast.error('Failed to reload data');
    }
  };

  const getStatusColor = (status: ResultStatus) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-amber-100 text-amber-700 border-amber-200',
      PUBLISHED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      APPROVED: 'bg-blue-100 text-blue-700 border-blue-200',
      ARCHIVED: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status] || colors.DRAFT;
  };

  const getGradeColor = (grade?: string) => {
    const colors: Record<string, string> = {
      A: 'bg-green-500 text-white',
      B: 'bg-blue-500 text-white',
      C: 'bg-yellow-500 text-white',
      D: 'bg-orange-500 text-white',
      F: 'bg-red-500 text-white'
    };
    return colors[grade || ''] || 'bg-gray-400 text-white';
  };

  if (loading) {
    return (
      <TeacherDashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="text-sm md:text-base text-gray-600 font-medium">Loading Results...</p>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  if (error) {
    return (
      <TeacherDashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600 flex-shrink-0" />
                <h3 className="text-base md:text-lg font-semibold text-red-900">Error Loading Data</h3>
              </div>
              <p className="text-sm text-red-800 mb-4">{error}</p>
              <button 
                onClick={loadTeacherData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  if (activeTab === 'record') {
    return (
      <TeacherDashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 md:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Record Result</h2>
                <button 
                  onClick={() => setActiveTab('results')}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" /> Close
                </button>
              </div>
              <ResultCreateTab
                onResultCreated={loadTeacherData}
                onSuccess={handleResultSuccess}
                onClose={() => setActiveTab('results')}
              />
            </div>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Compact Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 md:px-6 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base md:text-lg font-bold text-gray-900 truncate">Results</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Manage performance</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button 
                  onClick={loadTeacherData}
                  disabled={loading}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={handleCreateResult}
                  className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-1.5 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-4 space-y-3 md:space-y-4">
          {/* Compact Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 mb-0.5 truncate">{stat.label}</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-8 h-8 md:w-10 md:h-10 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compact Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1.5"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {(filterSubject !== 'all' || filterStatus !== 'all' || filterEducationLevel !== 'all') && (
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  )}
                </button>
                {/* View Mode Toggle - Hidden on Mobile */}
                <div className="hidden md:flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-2 ${viewMode === 'card' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'} transition-colors border-l border-gray-200`}
                    title="Card View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                  <select
                    value={String(filterEducationLevel)}
                    onChange={(e) => setFilterEducationLevel(e.target.value as EducationLevel | 'all')}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="all">All Levels</option>
                    {availableEducationLevels.map((level) => (
                      <option key={String(level)} value={String(level)}>
                        {String(level).replace(/_/g, ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="all">All Subjects</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="approved">Approved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Results Display - Card View on Mobile, Toggle on Desktop */}
          {(viewMode === 'card' || isMobile) ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs md:text-sm text-gray-600">
                  {filteredResults.length} of {results.length} results
                </p>
              </div>
              
              {filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredResults.map((result) => (
                    <div key={result.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 border-b border-gray-100">
                        <div className="flex items-start gap-2">
                          {result.student.profile_picture ? (
                            <img 
                              src={result.student.profile_picture} 
                              alt={result.student.full_name} 
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm">
                              {result.student.full_name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 truncate">{result.student?.full_name || 'Unknown'}</h3>
                            <p className="text-xs text-gray-500 truncate">{result.student?.registration_number || 'N/A'}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(result.status ?? 'DRAFT')} flex-shrink-0`}>
                            {result.status ?? 'DRAFT'}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Subject:</span>
                          <span className="font-medium text-gray-900 truncate ml-2">{result.subject?.name || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{result.exam_session?.name || 'N/A'} - {result.exam_session?.term || 'N/A'}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">CA</p>
                            <div className="bg-blue-50 rounded-lg py-1.5">
                              <p className="text-base font-bold text-blue-900">{result.ca_score}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Exam</p>
                            <div className="bg-purple-50 rounded-lg py-1.5">
                              <p className="text-base font-bold text-purple-900">{result.exam_score}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Total</p>
                            <div className="bg-green-50 rounded-lg py-1.5">
                              <p className="text-base font-bold text-green-900">{result.total_score}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">Grade:</span>
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${getGradeColor(result.grade)}`}>
                              {result.grade ?? '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleViewResult(result)} 
                              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" 
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button 
                              onClick={() => handleEditResult(result)} 
                              className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors" 
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button 
                              onClick={() => handleDeleteResult(result)} 
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" 
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 md:p-12 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <FileText className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-sm text-gray-500 mb-4 md:mb-6">
                    {searchTerm || filterSubject !== 'all' || filterStatus !== 'all' || filterEducationLevel !== 'all'
                      ? 'Try adjusting your filters' 
                      : 'Start by recording your first result'}
                  </p>
                  <button 
                    onClick={handleCreateResult} 
                    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all inline-flex items-center gap-2 font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" /> Record First Result
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-3 md:p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base md:text-lg font-semibold text-gray-900">Student Results</h2>
                    <p className="text-xs md:text-sm text-gray-500">{filteredResults.length} of {results.length} results</p>
                  </div>
                </div>
              </div>

              {filteredResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <div style={{ minWidth: '1200px' }}>
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '200px' }}>
                            Student
                          </th>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '160px' }}>
                            Subject
                          </th>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '180px' }}>
                            Session
                          </th>
                          <th className="px-3 py-2.5 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider bg-blue-50 whitespace-nowrap" style={{ minWidth: '90px' }}>
                            CA
                          </th>
                          <th className="px-3 py-2.5 text-center text-xs font-semibold text-purple-800 uppercase tracking-wider bg-purple-50 whitespace-nowrap" style={{ minWidth: '90px' }}>
                            Exam
                          </th>
                          <th className="px-3 py-2.5 text-center text-xs font-semibold text-green-800 uppercase tracking-wider bg-green-50 whitespace-nowrap" style={{ minWidth: '90px' }}>
                            Total
                          </th>
                          <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '80px' }}>
                            Grade
                          </th>
                          <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '120px' }}>
                            Status
                          </th>
                          <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '140px' }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {filteredResults.map((result, index) => (
                          <tr key={result.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                            <td className="px-3 py-2.5 whitespace-nowrap" style={{ minWidth: '200px' }}>
                              <div className="flex items-center gap-2">
                                {result.student.profile_picture ? (
                                  <img 
                                    src={result.student.profile_picture} 
                                    alt={result.student.full_name} 
                                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" 
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0 text-xs">
                                    {result.student?.full_name?.charAt(0) || '?'}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 text-xs truncate">{result.student?.full_name || 'Unknown'}</p>
                                  <p className="text-xs text-gray-500 truncate">{result.student?.registration_number || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap" style={{ minWidth: '160px' }}>
                              <p className="font-medium text-gray-900 text-xs truncate">{result.subject?.name || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{result.subject?.code || ''}</p>
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap" style={{ minWidth: '180px' }}>
                              <p className="text-xs text-gray-900 truncate">{result.exam_session?.name || 'N/A'}</p>
                              <p className="text-xs text-gray-500 truncate">{result.exam_session?.term || 'N/A'}</p>
                            </td>
                            <td className="px-3 py-2.5 text-center bg-blue-50/50 whitespace-nowrap" style={{ minWidth: '90px' }}>
                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs">
                                {result.ca_score}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center bg-purple-50/50 whitespace-nowrap" style={{ minWidth: '90px' }}>
                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-bold text-xs">
                                {result.exam_score}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center bg-green-50/50 whitespace-nowrap" style={{ minWidth: '90px' }}>
                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-green-100 text-green-900 font-bold text-xs">
                                {result.total_score}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center whitespace-nowrap" style={{ minWidth: '80px' }}>
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs ${getGradeColor(result.grade)}`}>
                                {result.grade ?? '—'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center whitespace-nowrap" style={{ minWidth: '120px' }}>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(result.status ?? 'DRAFT')}`}>
                                {result.status ?? 'DRAFT'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center whitespace-nowrap" style={{ minWidth: '140px' }}>
                              <div className="flex items-center justify-center gap-1">
                                <button 
                                  onClick={() => handleViewResult(result)} 
                                  className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" 
                                  title="View"
                                >
                                  <Eye className="w-4 h-4 text-gray-600" />
                                </button>
                                <button 
                                  onClick={() => handleEditResult(result)} 
                                  className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors" 
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4 text-gray-600" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteResult(result)} 
                                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" 
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-12 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <FileText className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-sm text-gray-500 mb-4 md:mb-6">
                    {searchTerm || filterSubject !== 'all' || filterStatus !== 'all' || filterEducationLevel !== 'all'
                      ? 'Try adjusting your filters' 
                      : 'Start by recording your first result'}
                  </p>
                  <button 
                    onClick={handleCreateResult} 
                    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all inline-flex items-center gap-2 font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" /> Record First Result
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <ResultModalsComponent />
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherResults;