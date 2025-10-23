// TeacherResults.tsx (Complete)
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

  // Initialize the result actions manager
  const { 
    handleEditResult, 
    handleViewResult, 
    handleDeleteResult, 
    ResultModalsComponent,
  } = useResultActionsManager(loadTeacherData);

  // ---- Data loading ----
  async function loadTeacherData() {
    try {
      setLoading(true);
      setError(null);

      // Get teacher ID from current user
      const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user as unknown as object);
      if (!teacherId) throw new Error('Teacher ID not found');

      // Load teacher subjects
      const subjects = await TeacherDashboardService.getTeacherSubjects(teacherId);

      // Map subjects to TeacherAssignment shape fallback (for UI filters)
      const assignments: TeacherAssignment[] = subjects.map((subject: any) => ({
        id: subject.id,
        classroom_name: subject.classroom ?? 'Unknown',
        section_name: subject.section_name ?? subject.section ?? 'Unknown',
        grade_level_name: subject.grade_level_name ?? subject.grade_level ?? 'Unknown',
        education_level: subject.education_level ?? 'Unknown',
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
      }));
      setTeacherAssignments(assignments);

      // Load results for teacher's subjects (by their IDs)
      const subjectIds = subjects.map((s: any) => s.id).filter(Boolean);
      if (subjectIds.length) {
        const resultsData = await ResultService.getStudentResults({ subject: subjectIds.join(',') });
        const raw: any[] = Array.isArray(resultsData)
          ? resultsData
          : (resultsData && (resultsData as { data?: unknown[] }).data) || [];

        const normalized: StudentResult[] = raw.map((r: any): StudentResult => {
          const studentId = (r.student && r.student.id) || r.student;
          const subjectId = (r.subject && r.subject.id) || r.subject;
          const examSessionId = (r.exam_session && r.exam_session.id) || r.exam_session;

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
              full_name: r.student?.full_name ?? r.student_name ?? '',
              registration_number: r.student?.registration_number ?? r.registration_number ?? '',
              profile_picture: r.student?.profile_picture ?? r.student_profile_picture ?? null,
              education_level: (r.student?.education_level || 'UNKNOWN') as EducationLevel,
            },
            subject: {
              id: Number(subjectId),
              name: r.subject?.name ?? r.subject_name ?? 'Unknown Subject',
              code: r.subject?.code ?? r.subject_code ?? '',
            },
            exam_session: {
              id: Number(examSessionId),
              name: r.exam_session?.name ?? r.exam_session_name ?? 'N/A',
              term: r.exam_session?.term ?? r.term ?? '',
              academic_session: r.exam_session?.academic_session?.name ?? r.academic_session_name ?? r.academic_session ?? '',
            },
            // Senior
            first_test_score: Number(r.first_test_score || 0),
            second_test_score: Number(r.second_test_score || 0),
            third_test_score: Number(r.third_test_score || 0),
            // Primary/Junior
            continuous_assessment_score: Number(r.continuous_assessment_score || 0),
            take_home_test_score: Number(r.take_home_test_score || 0),
            practical_score: Number(r.practical_score || 0),
            project_score: Number(r.project_score || 0),
            note_copying_score: Number(r.note_copying_score || 0),
            // Computed
            ca_score,
            exam_score: Number((r.exam_score ?? r.exam) ?? 0),
            total_score: Number((r.total_score ?? (ca_score + Number(r.exam_score ?? 0))) ?? 0),
            // Misc
            education_level: (r.education_level || r.student?.education_level || 'UNKNOWN') as EducationLevel,
            grade: r.grade,
            status: (typeof r.status === 'string' ? r.status.toUpperCase() : 'DRAFT') as ResultStatus,
            remarks: r.remarks ?? '',
            created_at: r.created_at ?? '',
            updated_at: r.updated_at ?? '',
          };
        });

        // Filter by teacher's subject IDs (post-normalization) to avoid service-side shape issues
        const idSet = new Set(subjectIds.map((id: number) => String(id)));
        const filtered = normalized.filter((item) => idSet.has(String(item.subject.id)));
        setResults(filtered);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Error loading teacher data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user && !isLoading) {
      void loadTeacherData();
    }
  }, [user, isLoading]);

  // ---- Actions ----
  const handleCreateResult = () => {
    setActiveTab('record');
  };

  const handleResultSuccess = async (): Promise<void> => {
    try {
      await loadTeacherData(); // Reload the data
      setActiveTab('results'); // Switch back to results tab
      toast.success('Result saved successfully');
    } catch (error) {
      console.error('Error handling result success:', error);
      toast.error('Failed to reload data');
    }
  };

  // ---- Derived data & filters ----
  const availableEducationLevels = useMemo(
    () => Array.from(new Set(results.map((r) => r.education_level))).filter(Boolean) as EducationLevel[],
    [results]
  );

  const availableSubjects = useMemo(
    () =>
      teacherAssignments.map((assignment) => ({
        id: assignment.subject_id,
        name: assignment.subject_name,
        code: assignment.subject_code,
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

  // ---- Table columns ----
  const getTableColumns = (educationLevel: EducationLevel | 'all'): TableColumn[] => {
    const baseColumns: TableColumn[] = [
      { key: 'student', label: 'Student', sticky: 'left', width: 'w-64' },
      { key: 'subject', label: 'Subject', width: 'w-40' },
      { key: 'session', label: 'Session', width: 'w-36' },
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
      { key: 'status', label: 'Status', width: 'w-28', center: true },
      { key: 'actions', label: 'Actions', sticky: 'right', width: 'w-32', center: true },
    ];

    if (educationLevel === 'SENIOR_SECONDARY') return [...baseColumns, ...seniorColumns, ...endColumns];
    if (educationLevel === 'PRIMARY' || educationLevel === 'JUNIOR_SECONDARY')
      return [...baseColumns, ...primaryJuniorColumns, ...endColumns];

    // MIXED / unknown: show all
    return [...baseColumns, ...seniorColumns, ...primaryJuniorColumns, ...endColumns];
  };

  const currentEducationLevel: EducationLevel = filterEducationLevel === 'all' ? 'MIXED' : filterEducationLevel;
  const tableColumns = useMemo(() => getTableColumns(currentEducationLevel), [currentEducationLevel]);

  // ---- UI helpers ----
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

  // ---- Render ----
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout>
      <div className="p-6 space-y-9">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Results Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Record and manage student results for your subjects</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button 
              onClick={loadTeacherData} 
              className="flex items-center justify-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
              <FileText className="w-4 h-4 inline mr-2" /> All Results
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

        {/* Filters - only show on results tab */}
        {activeTab === 'results' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
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
                value={filterEducationLevel}
                onChange={(e) => setFilterEducationLevel(e.target.value as EducationLevel | 'all')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Education Levels</option>
                {availableEducationLevels.map((level) => (
                  <option key={level} value={level}>
                    {String(level)
                      .replace(/_/g, ' ')
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>

              <select
                value={filterSubject}
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
                value={filterStatus}
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
                className="flex items-center justify-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-4 h-4 mr-2" /> Clear
              </button>
            </div>
          </div>
        )}

        {/* Results Table */}
        {activeTab === 'results' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Table Header Info */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span>Senior Secondary: Test 1, Test 2, Test 3, CA Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>Primary/Junior: CA, Project, Take Home, Practical, Note Copy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded" />
                  <span>All Levels: Exam, Total, Grade, Status</span>
                </div>
              </div>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden p-4 space-y-4">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <div key={result.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex items-center">
                      {result.student.profile_picture ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={result.student.profile_picture} 
                          alt={result.student.full_name} 
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {result.student.full_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {result.student.registration_number}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Subject</div>
                        <div className="text-gray-900 dark:text-white">{result.subject.name}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Session</div>
                        <div className="text-gray-900 dark:text-white">{result.exam_session.name}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Exam</div>
                        <div className="text-gray-900 dark:text-white">{result.exam_score}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Total</div>
                        <div className="text-gray-900 dark:text-white font-semibold">{result.total_score}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Grade</div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
                            {result.grade ?? '—'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getStatusBadge(result.status)}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center space-x-2">
                      <button
                        onClick={() => handleViewResult(result)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditResult(result)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded"
                        title="Edit Result"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteResult(result)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded"
                        title="Delete Result"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-2 py-8 text-center">
                  <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3 inline-block" />
                  <div className="text-gray-700 dark:text-gray-200 font-medium">No results found</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your search criteria</div>
                </div>
              )}
            </div>

            {/* Desktop/Table View */}
            <div className="hidden md:block relative">
              <div className="overflow-x-auto overflow-y-auto max-h-[70vh] lg:max-w-auto xl:max-w-[80vw] 2xl:max-w-[70vw]">
                <div className="min-w-max">
                  <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {tableColumns.map((column) => (
                          <th
                            key={column.key}
                            className={`
                              sticky top-0 z-20 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider
                              ${column.center ? 'text-center' : 'text-left'}
                              ${column.width || ''}
                            `}
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredResults.length > 0 ? (
                        filteredResults.map((result) => {
                          const isSeniorSecondary = result.education_level === 'SENIOR_SECONDARY';
                          const showSeniorColumns =
                            currentEducationLevel === 'SENIOR_SECONDARY' || currentEducationLevel === 'MIXED';
                          const showPrimaryJuniorColumns =
                            currentEducationLevel === 'PRIMARY' ||
                            currentEducationLevel === 'JUNIOR_SECONDARY' ||
                            currentEducationLevel === 'MIXED';

                          return (
                            <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              {tableColumns.map((column) => {
                                const cellClass = `
                                  px-4 py-4 whitespace-nowrap
                                  ${column.center ? 'text-center' : ''}
                                `;

                                switch (column.key) {
                                  case 'student':
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className="flex items-center">
                                          <div className="flex-shrink-0 h-8 w-8">
                                            {result.student.profile_picture ? (
                                              <img
                                                className="h-8 w-8 rounded-full object-cover"
                                                src={result.student.profile_picture}
                                                alt={result.student.full_name}
                                              />
                                            ) : (
                                              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                              {result.student.full_name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              {result.student.registration_number}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    );

                                  case 'subject':
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className="text-sm text-gray-900 dark:text-white">{result.subject.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{result.subject.code}</div>
                                      </td>
                                    );

                                  case 'session':
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className="text-sm text-gray-900 dark:text-white">{result.exam_session.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{result.exam_session.term}</div>
                                      </td>
                                    );

                                  // Senior Secondary columns
                                  case 'test1':
                                    if (!showSeniorColumns) return null;
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className={`text-sm font-medium ${
                                          isSeniorSecondary ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                                        }`}>
                                          {isSeniorSecondary ? result.first_test_score : '-'}
                                        </div>
                                      </td>
                                    );

                                  case 'test2':
                                    if (!showSeniorColumns) return null;
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className={`text-sm font-medium ${
                                          isSeniorSecondary ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                                        }`}>
                                          {isSeniorSecondary ? result.second_test_score : '-'}
                                        </div>
                                      </td>
                                    );

                                  case 'test3':
                                    if (!showSeniorColumns) return null;
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className={`text-sm font-medium ${
                                          isSeniorSecondary ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                                        }`}>
                                          {isSeniorSecondary ? result.third_test_score : '-'}
                                        </div>
                                      </td>
                                    );

                                  case 'ca_total':
                                    if (!showSeniorColumns) return null;
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className={`text-sm font-medium ${
                                          isSeniorSecondary ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'
                                        }`}>
                                          {isSeniorSecondary ? result.ca_score : '-'}
                                        </div>
                                      </td>
                                    );

                                  // Primary/Junior Secondary columns
                                  case 'ca':
                                    if (!showPrimaryJuniorColumns) return null;
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className={`text-sm font-medium ${
                                          !isSeniorSecondary ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                                        }`}>
                                          {!isSeniorSecondary ? result.continuous_assessment_score : '-'}
                                        </div>
                                      </td>
                                    );

                                  case 'project':
                                    if (!showPrimaryJuniorColumns) return null;
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className={`text-sm font-medium ${
                                          !isSeniorSecondary ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                                        }`}>
                                          {!isSeniorSecondary ? result.project_score : '-'}
                                        </div>
                                      </td>
                                    );

                                  case 'take_home':
                                    if (!showPrimaryJuniorColumns) return null;
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className={`text-sm font-medium ${
                                          !isSeniorSecondary ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                                        }`}>
                                          {!isSeniorSecondary ? result.take_home_test_score : '-'}
                                        </div>
                                      </td>
                                    );

                                  case 'practical':
                                    if (!showPrimaryJuniorColumns) return null;
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className={`text-sm font-medium ${
                                          !isSeniorSecondary ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                                        }`}>
                                          {!isSeniorSecondary ? result.practical_score : '-'}
                                        </div>
                                      </td>
                                    );

                                  case 'note_copy':
                                    if (!showPrimaryJuniorColumns) return null;
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className={`text-sm font-medium ${
                                          !isSeniorSecondary ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                                        }`}>
                                          {!isSeniorSecondary ? result.note_copying_score : '-'}
                                        </div>
                                      </td>
                                    );

                                  // Common columns
                                  case 'exam':
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{result.exam_score}</div>
                                      </td>
                                    );

                                  case 'total':
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{result.total_score}</div>
                                      </td>
                                    );

                                  case 'grade':
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(
                                          result.grade
                                        )}`}>
                                          {result.grade ?? '—'}
                                        </span>
                                      </td>
                                    );

                                  case 'status':
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        {getStatusBadge(result.status)}
                                      </td>
                                    );

                                  case 'actions':
                                    return (
                                      <td key={column.key} className={cellClass}>
                                        <div className="flex items-center justify-center space-x-1">
                                          <button
                                            onClick={() => handleViewResult(result)}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                                            title="View Details"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleEditResult(result)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded"
                                            title="Edit Result"
                                          >
                                            <Edit className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteResult(result)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded"
                                            title="Delete Result"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </td>
                                    );

                                  default:
                                    return null;
                                }
                              })}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={tableColumns.length} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
                              <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {searchTerm || filterSubject !== 'all' || filterStatus !== 'all'
                                  ? 'Try adjusting your search criteria'
                                  : 'Start by recording results for your students'}
                              </p>
                              <button 
                                onClick={handleCreateResult} 
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                <Plus className="w-4 h-4 mr-2" /> Record First Result
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Render the modals from the actions manager */}
        <ResultModalsComponent />
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherResults;