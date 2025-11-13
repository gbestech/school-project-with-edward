// TeacherResults.tsx (Fixed - with proper tables and error handling)
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
import TeacherDashboardService from '@/services/TeacherDashboardService';
import ResultService from '@/services/ResultService';
import ResultCreateTab from '@/components/dashboards/teacher/ResultCreateTab';
import useResultActionsManager from '@/components/dashboards/teacher/ResultActionsManager ';
import { toast } from 'react-toastify';
import { TeacherAssignment, StudentResult } from '@/types/types';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  X,
  FileText,
  User,
  Archive,
  Table as TableIcon,
  Grid,
} from 'lucide-react';

type EducationLevel =
  | 'NURSERY'
  | 'PRIMARY'
  | 'JUNIOR_SECONDARY'
  | 'SENIOR_SECONDARY'
  | 'UNKNOWN'
  | 'MIXED'
  | string;

type ResultStatus = 'DRAFT' | 'PUBLISHED' | 'APPROVED' | 'ARCHIVED' | string;

type TableColumn = {
  key:
    | 'student'
    | 'subject'
    | 'session'
    | 'test1'
    | 'test2'
    | 'test3'
    | 'ca_total'
    | 'ca'
    | 'project'
    | 'take_home'
    | 'practical'
    | 'note_copy'
    | 'exam'
    | 'total'
    | 'grade'
    | 'status'
    | 'actions';
  label: string;
  width: string;
  center?: boolean;
  sticky?: 'left' | 'right';
};

const TeacherResults: React.FC = () => {
  const { user, isLoading } = useAuth();

  const [results, setResults] = useState<StudentResult[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEducationLevel, setFilterEducationLevel] = useState<EducationLevel | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'results' | 'record'>('results');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const { 
    handleEditResult, 
    handleViewResult, 
    handleDeleteResult, 
    ResultModalsComponent,
  } = useResultActionsManager(loadTeacherData);

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
      debugLog += `Subject IDs: ${subjects.map((s: any) => s.id).join(', ')}\n`;

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
              registration_number: r.student?.registration_number ?? r.registration_number ?? r.student_registration_number ?? '',
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
              name: r.exam_session?.name ?? r.exam_session_name ?? r.session_name ?? 'N/A',
              term: r.exam_session?.term ?? r.term ?? '',
              academic_session: r.exam_session?.academic_session?.name ?? r.academic_session_name ?? r.academic_session ?? '',
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
      console.log('Debug Info:\n', debugLog);
      
    } catch (err) {
      console.error('Error loading teacher data:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMsg);
      setDebugInfo(prev => prev + `\nERROR: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user && !isLoading) {
      void loadTeacherData();
    }
  }, [user, isLoading]);

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

  const availableEducationLevels = useMemo(
    () => Array.from(new Set(results.map((r) => r.education_level))).filter(Boolean) as EducationLevel[],
    [results]
  );

  const availableSubjects = useMemo(
    () =>
      teacherAssignments.map((assignment) => ({
        id: String(assignment.subject_id), // Convert to string for select value
        name: String(assignment.subject_name),
        code: String(assignment.subject_code),
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

  const getTableColumns = (educationLevel: EducationLevel | 'all'): TableColumn[] => {
    const baseColumns: TableColumn[] = [
      { key: 'student', label: 'Student', sticky: 'left', width: 'min-w-[200px]' },
      { key: 'subject', label: 'Subject', width: 'min-w-[120px]' },
      { key: 'session', label: 'Session', width: 'min-w-[100px]' },
    ];

    const seniorColumns: TableColumn[] = [
      { key: 'test1', label: 'Test 1', width: 'w-20', center: true },
      { key: 'test2', label: 'Test 2', width: 'w-20', center: true },
      { key: 'test3', label: 'Test 3', width: 'w-20', center: true },
      { key: 'ca_total', label: 'CA Total', width: 'w-24', center: true },
    ];

    const primaryJuniorColumns: TableColumn[] = [
      { key: 'ca', label: 'CA', width: 'w-20', center: true },
      { key: 'project', label: 'Project', width: 'w-20', center: true },
      { key: 'take_home', label: 'Take Home', width: 'w-24', center: true },
      { key: 'practical', label: 'Practical', width: 'w-24', center: true },
      { key: 'note_copy', label: 'Note Copy', width: 'w-24', center: true },
    ];

    const endColumns: TableColumn[] = [
      { key: 'exam', label: 'Exam', width: 'w-20', center: true },
      { key: 'total', label: 'Total', width: 'w-20', center: true },
      { key: 'grade', label: 'Grade', width: 'w-20', center: true },
      { key: 'status', label: 'Status', width: 'min-w-[100px]', center: true },
      { key: 'actions', label: 'Actions', sticky: 'right', width: 'w-32', center: true },
    ];

    if (educationLevel === 'SENIOR_SECONDARY') return [...baseColumns, ...seniorColumns, ...endColumns];
    if (educationLevel === 'PRIMARY' || educationLevel === 'JUNIOR_SECONDARY')
      return [...baseColumns, ...primaryJuniorColumns, ...endColumns];

    return [...baseColumns, ...seniorColumns, ...primaryJuniorColumns, ...endColumns];
  };

  const currentEducationLevel: EducationLevel = filterEducationLevel === 'all' ? 'MIXED' : filterEducationLevel;
  const tableColumns = useMemo(() => getTableColumns(currentEducationLevel), [currentEducationLevel]);

  const getStatusBadge = (status: ResultStatus = 'DRAFT') => {
    const STATUS_CONFIG = {
      DRAFT: { color: 'bg-yellow-100 text-yellow-800', icon: Edit },
      PUBLISHED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      APPROVED: { color: 'bg-blue-100 text-blue-800', icon: Eye },
      ARCHIVED: { color: 'bg-gray-100 text-gray-800', icon: Archive },
    } as const;

    const upper = (status || 'DRAFT').toString().toUpperCase() as keyof typeof STATUS_CONFIG;
    const config = STATUS_CONFIG[upper] ?? STATUS_CONFIG.DRAFT;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {upper}
      </span>
    );
  };

  const getGradeColor = (grade?: string) => {
    const map: Record<string, string> = {
      A: 'text-green-600 bg-green-100',
      B: 'text-blue-600 bg-blue-100',
      C: 'text-yellow-600 bg-yellow-100',
      D: 'text-orange-600 bg-orange-100',
      F: 'text-red-600 bg-red-100',
    };
    return map[(grade || '').toUpperCase()] || 'text-gray-600 bg-gray-100';
  };

  const renderTableCell = (column: TableColumn, result: StudentResult) => {
    const centerClass = column.center ? 'text-center' : '';
    
    switch (column.key) {
      case 'student':
        return (
          <div className="flex items-center space-x-3 min-w-[250px]">
            {result.student.profile_picture ? (
              <img 
                src={result.student.profile_picture} 
                alt={result.student.full_name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{result.student.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{result.student.registration_number}</p>
            </div>
          </div>
        );
      case 'subject':
        return (
          <div className="min-w-[180px]">
            <p className="font-medium text-gray-900 dark:text-white">{result.subject.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{result.subject.code}</p>
          </div>
        );
      case 'session':
        return (
          <div className="min-w-[150px]">
            <p className="text-sm text-gray-900 dark:text-white">{result.exam_session.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{result.exam_session.term}</p>
          </div>
        );
      case 'test1':
        return <span className={centerClass}>{result.first_test_score}</span>;
      case 'test2':
        return <span className={centerClass}>{result.second_test_score}</span>;
      case 'test3':
        return <span className={centerClass}>{result.third_test_score}</span>;
      case 'ca_total':
        return <span className={`${centerClass} font-semibold`}>{result.ca_score}</span>;
      case 'ca':
        return <span className={centerClass}>{result.continuous_assessment_score}</span>;
      case 'project':
        return <span className={centerClass}>{result.project_score}</span>;
      case 'take_home':
        return <span className={centerClass}>{result.take_home_test_score}</span>;
      case 'practical':
        return <span className={centerClass}>{result.practical_score}</span>;
      case 'note_copy':
        return <span className={centerClass}>{result.note_copying_score}</span>;
      case 'exam':
        return <span className={`${centerClass} font-semibold`}>{result.exam_score}</span>;
      case 'total':
        return <span className={`${centerClass} font-bold text-blue-600 dark:text-blue-400`}>{result.total_score}</span>;
      case 'grade':
        return (
          <div className={centerClass}>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
              {result.grade ?? '—'}
            </span>
          </div>
        );
      case 'status':
        return <div className={centerClass}>{getStatusBadge(result.status)}</div>;
      case 'actions':
        return (
          <div className="flex items-center justify-center space-x-1">
            <button
              onClick={() => handleViewResult(result)}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditResult(result)}
              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              title="Edit Result"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteResult(result)}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete Result"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <TeacherDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading your Student Results...</p>
            </div>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  if (error) {
    return (
      <TeacherDashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
          {debugInfo && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold mb-2">Debug Information:</h3>
              <pre className="text-xs overflow-auto whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Debug Info */}
        {debugInfo && (
          <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold">Debug Information (Click to expand)</summary>
            <pre className="text-xs overflow-auto mt-2 whitespace-pre-wrap">{debugInfo}</pre>
          </details>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Results Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Record and manage student results for your subjects
              {results.length > 0 && ` (${results.length} total results)`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button 
              onClick={loadTeacherData} 
              className="flex items-center justify-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 rounded-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </button>
            <button 
              onClick={handleCreateResult} 
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Record Result
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab('results')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" /> All Results ({filteredResults.length})
            </button>
            <button
              onClick={() => setActiveTab('record')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'record'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" /> Record New Result
            </button>
          </nav>
        </div>

        {/* Record form tab */}
        {activeTab === 'record' && (
          <ResultCreateTab
            onResultCreated={loadTeacherData}
            onSuccess={handleResultSuccess}
            onClose={() => setActiveTab('results')}
          />
        )}

        {/* Filters and View Toggle */}
        {activeTab === 'results' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search students or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <select
                value={String(filterEducationLevel)}
                onChange={(e) => setFilterEducationLevel(e.target.value as EducationLevel | 'all')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Education Levels</option>
                {availableEducationLevels.map((level) => (
                  <option key={String(level)} value={String(level)}>
                    {String(level)
                      .replace(/_/g, ' ')
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>

              <select
                value={String(filterSubject)}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Subjects</option>
                {availableSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>

              <select
                value={String(filterStatus)}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="reviewed">Reviewed</option>
                <option value="archived">Archived</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterSubject('all');
                  setFilterStatus('all');
                  setFilterEducationLevel('all');
                }}
                className="flex items-center justify-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 rounded-lg"
              >
                <X className="w-4 h-4 mr-2" /> Clear
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-end space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg ${
                  viewMode === 'table'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg ${
                  viewMode === 'cards'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                title="Card View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Results Display */}
        {activeTab === 'results' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {filteredResults.length > 0 ? (
              viewMode === 'table' ? (
                // Table View
                <div className="overflow-x-auto overflow-y-visible">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed" style={{ minWidth: '1400px' }}>
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        {tableColumns.map((column) => (
                          <th
                            key={column.key}
                            className={`px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${
                              column.center ? 'text-center' : 'text-left'
                            } ${
                              column.sticky === 'left'
                                ? 'sticky left-0 z-20 bg-gray-50 dark:bg-gray-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                                : column.sticky === 'right'
                                ? 'sticky right-0 z-20 bg-gray-50 dark:bg-gray-900 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                                : ''
                            }`}
                            style={
                              column.key === 'student' ? { minWidth: '250px' } :
                              column.key === 'subject' ? { minWidth: '180px' } :
                              column.key === 'session' ? { minWidth: '150px' } :
                              column.key === 'actions' ? { minWidth: '140px' } :
                              { minWidth: '80px' }
                            }
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredResults.map((result) => (
                        <tr
                          key={result.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          {tableColumns.map((column) => (
                            <td
                              key={column.key}
                              className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap ${
                                column.sticky === 'left'
                                  ? 'sticky left-0 z-10 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                                  : column.sticky === 'right'
                                  ? 'sticky right-0 z-10 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                                  : ''
                              }`}
                              style={
                                column.key === 'student' ? { minWidth: '250px' } :
                                column.key === 'subject' ? { minWidth: '180px' } :
                                column.key === 'session' ? { minWidth: '150px' } :
                                column.key === 'actions' ? { minWidth: '140px' } :
                                { minWidth: '80px' }
                              }
                            >
                              {renderTableCell(column, result)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    </div>
                  </div>
                </div>
              ) : (
                // Card View
                <div className="p-6 space-y-4">
                  {filteredResults.map((result) => (
                    <div key={result.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {result.student.profile_picture ? (
                            <img 
                              src={result.student.profile_picture} 
                              alt={result.student.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{result.student.full_name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{result.student.registration_number}</p>
                          </div>
                        </div>
                        {getStatusBadge(result.status)}
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Subject:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{result.subject.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">CA:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{result.ca_score}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Exam:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{result.exam_score}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Total:</span>
                          <p className="font-medium text-blue-600 dark:text-blue-400">{result.total_score}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Grade: </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
                            {result.grade ?? '—'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewResult(result)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditResult(result)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            title="Edit Result"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteResult(result)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete Result"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12 px-6">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4 mx-auto" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm || filterSubject !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your search criteria'
                    : 'Start by recording results for your students'}
                </p>
                <button 
                  onClick={handleCreateResult} 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" /> Record First Result
                </button>
              </div>
            )}
          </div>
        )}

        <ResultModalsComponent />
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherResults;