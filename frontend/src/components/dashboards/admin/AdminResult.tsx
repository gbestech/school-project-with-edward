import React, { useState, useMemo, useEffect } from 'react';
import ResultService, { StudentTermResult, ExamSession } from '../../../services/ResultService';
import { useSettings } from '@/contexts/SettingsContext';
import { getAbsoluteUrl } from '@/utils/urlUtils';
import { Eye, Edit, Trash2, Download, Printer } from 'lucide-react';

interface SubjectResult {
  id: string;
  subject: {
    name: string;
    code: string;
  };
  ca_score: number;
  exam_score: number;
  total_score: number;
  percentage: number;
  grade: string;
  grade_point: number;
  is_passed: boolean;
  position: number | null;
  remarks: string;
  status: string;
  assessment_scores: any[];
  created_at: string;
}

interface StudentResult {
  id: string;
  student: {
    id: string;
    full_name: string;
    username: string;
    student_class: string;
    education_level: string;
    profile_picture?: string;
  };
  academic_session: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  };
  term: string;
  total_subjects: number;
  subjects_passed: number;
  subjects_failed: number;
  total_score: number;
  average_score: number;
  gpa: number;
  class_position: number | null;
  total_students: number;
  status: string;
  remarks: string;
  next_term_begins?: string;
  subject_results: SubjectResult[];
  comments: any[];
  created_at: string;
}

interface SchoolData {
  name: string;
  address: string;
  logo: string;
  nextTermBegins: string;
}

// Dynamic school data from settings
const getSchoolData = (settings: any) => ({
  name: settings?.school_name || "GOD'S TREASURE SCHOOLS",
  address: settings?.school_address || "No 54 Dagbana Road, Opp. St. Kevin's Catholic Church, Phase III Jikwoyi, Abuja",
  logo: getAbsoluteUrl(settings?.logo_url) || "🏫",
  nextTermBegins: settings?.current_term || "12th September, 2024"
});

const getUnique = (arr: string[]): string[] => Array.from(new Set(arr));

const SchoolResultTemplate = () => {
  const { settings } = useSettings();
  // State for API data
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [classFilter, setClassFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Edit/Delete states
  const [editingResult, setEditingResult] = useState<StudentResult | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resultToDelete, setResultToDelete] = useState<StudentResult | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load term results and exam sessions
        const [termResultsData, examSessionsData] = await Promise.all([
          ResultService.getTermResults(),
          ResultService.getExamSessions({ is_active: true })
        ]);
        
        setStudentResults(termResultsData);
        setExamSessions(examSessionsData);
      } catch (err) {
        console.error('Error loading results:', err);
        setError('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Unique filter options
  const classes = useMemo(() => getUnique(studentResults.map(s => s.student.student_class)), [studentResults]);
  const years = useMemo(() => getUnique(studentResults.map(s => s.academic_session.name)), [studentResults]);
  const terms = useMemo(() => getUnique(studentResults.map(s => s.term)), [studentResults]);
  const sections = useMemo(() => getUnique(studentResults.map(s => s.student.education_level)), [studentResults]);

  // Filtered students
  const filtered = useMemo(() => {
    return studentResults.filter(s =>
      (classFilter === 'all' || s.student.student_class === classFilter) &&
      (yearFilter === 'all' || s.academic_session.name === yearFilter) &&
      (termFilter === 'all' || s.term === termFilter) &&
      (sectionFilter === 'all' || s.student.education_level === sectionFilter) &&
      (search === '' ||
        s.student.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.student.username.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [studentResults, classFilter, yearFilter, termFilter, sectionFilter, search]);

  // Safe average score calculation
  const getSafeAverageScore = (student: StudentResult): string => {
    if (student.average_score === null || student.average_score === undefined || isNaN(student.average_score)) {
      return 'N/A';
    }
    return student.average_score.toFixed(1) + '%';
  };

  const handleRowClick = (student: StudentResult): void => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleEdit = (student: StudentResult) => {
    setEditingResult(student);
    setShowEditModal(true);
  };

  const handleDelete = (student: StudentResult) => {
    setResultToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!resultToDelete) return;
    
    try {
      setActionLoading('delete');
      await ResultService.deleteStudentResult(resultToDelete.id);
      
      // Remove from local state
      setStudentResults(prev => prev.filter(r => r.id !== resultToDelete.id));
      setShowDeleteModal(false);
      setResultToDelete(null);
    } catch (error) {
      console.error('Error deleting result:', error);
      alert('Failed to delete result. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = (student: StudentResult) => {
    // Implement PDF download functionality
    console.log('Downloading result for:', student.student.full_name);
    // You can implement PDF generation here
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'bg-green-100 text-green-800';
    if (grade === 'B' || grade === 'B+') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getTermDisplay = (term: string) => {
    const termMap: { [key: string]: string } = {
      'FIRST': '1ST TERM',
      'SECOND': '2ND TERM',
      'THIRD': '3RD TERM'
    };
    return termMap[term] || term;
  };

  const getEducationLevelDisplay = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'PRIMARY': 'PRIMARY SCHOOL',
      'JUNIOR_SECONDARY': 'JUNIOR SECONDARY SCHOOL',
      'SENIOR_SECONDARY': 'SENIOR SECONDARY SCHOOL',
      'NURSERY': 'NURSERY SCHOOL'
    };
    return levelMap[level] || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading results...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-4">Student Results Management</h2>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or username"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select 
          value={sectionFilter} 
          onChange={e => setSectionFilter(e.target.value)} 
          className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Sections</option>
          {sections.map(section => <option key={section} value={section}>{getEducationLevelDisplay(section)}</option>)}
        </select>
        <select 
          value={classFilter} 
          onChange={e => setClassFilter(e.target.value)} 
          className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Classes</option>
          {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
        </select>
        <select 
          value={yearFilter} 
          onChange={e => setYearFilter(e.target.value)} 
          className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Years</option>
          {years.map(yr => <option key={yr} value={yr}>{yr}</option>)}
        </select>
        <select 
          value={termFilter} 
          onChange={e => setTermFilter(e.target.value)} 
          className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Terms</option>
          {terms.map(term => <option key={term} value={term}>{getTermDisplay(term)}</option>)}
        </select>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-3 border text-left font-semibold">Name</th>
              <th className="px-4 py-3 border text-left font-semibold">Username</th>
              <th className="px-4 py-3 border text-left font-semibold">Section</th>
              <th className="px-4 py-3 border text-left font-semibold">Class</th>
              <th className="px-4 py-3 border text-left font-semibold">Term</th>
              <th className="px-4 py-3 border text-left font-semibold">Year</th>
              <th className="px-4 py-3 border text-left font-semibold">Average</th>
              <th className="px-4 py-3 border text-left font-semibold">Grade</th>
              <th className="px-4 py-3 border text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-gray-500">No students found.</td></tr>
            ) : (
              filtered.map(student => (
                <tr key={student.id} className="hover:bg-blue-50 transition-colors">
                  <td className="border px-4 py-3">{student.student.full_name}</td>
                  <td className="border px-4 py-3">{student.student.username}</td>
                  <td className="border px-4 py-3 text-sm">{getEducationLevelDisplay(student.student.education_level)}</td>
                  <td className="border px-4 py-3">{student.student.student_class}</td>
                  <td className="border px-4 py-3">{getTermDisplay(student.term)}</td>
                  <td className="border px-4 py-3">{student.academic_session.name}</td>
                  <td className="border px-4 py-3 text-center font-semibold">{getSafeAverageScore(student)}</td>
                  <td className="border px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getGradeColor(student.subject_results[0]?.grade || 'F')}`}>
                      {student.subject_results[0]?.grade || 'N/A'}
                    </span>
                  </td>
                  <td className="border px-4 py-3">
                    <div className="flex space-x-2">
                      <button 
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                        onClick={() => handleRowClick(student)}
                        title="View Result"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors"
                        onClick={() => handleEdit(student)}
                        title="Edit Result"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors"
                        onClick={() => handleDelete(student)}
                        title="Delete Result"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition-colors"
                        onClick={() => handleDownload(student)}
                        title="Download Result"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for detailed result sheet */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white shadow-2xl rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto print:w-full print:max-w-none print:shadow-none print:rounded-none print:max-h-none print:overflow-visible">
            
            {/* Close button */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 print:hidden"
            >
              ✕
            </button>

            {/* Header */}
            <div className="p-6 border-b print:border-none">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getSchoolData(settings).logo}</div>
                  <div>
                    <h1 className="text-xl font-bold">{getSchoolData(settings).name}</h1>
                    <p className="text-sm text-gray-600">{getSchoolData(settings).address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-semibold">STUDENT'S REPORT CARD</h2>
                  <p className="text-sm text-gray-600">Next Term Begins: {selectedStudent.next_term_begins || getSchoolData(settings).nextTermBegins}</p>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="p-6 border-b print:border-none">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Name:</strong> {selectedStudent.student.full_name}</p>
                  <p><strong>Class:</strong> {selectedStudent.student.student_class}</p>
                  <p><strong>Term:</strong> {getTermDisplay(selectedStudent.term)}</p>
                </div>
                <div>
                  <p><strong>Academic Session:</strong> {selectedStudent.academic_session.name}</p>
                  <p><strong>Total Subjects:</strong> {selectedStudent.total_subjects}</p>
                  <p><strong>Position:</strong> {selectedStudent.class_position ? `${selectedStudent.class_position} of ${selectedStudent.total_students}` : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="p-6">
              <table className="w-full border-collapse border border-black text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2 text-center font-semibold">S/N</th>
                    <th className="border border-black p-2 text-center font-semibold">Subject</th>
                    <th className="border border-black p-2 text-center font-semibold">CA</th>
                    <th className="border border-black p-2 text-center font-semibold">Exam</th>
                    <th className="border border-black p-2 text-center font-semibold">Total</th>
                    <th className="border border-black p-2 text-center font-semibold">Percentage</th>
                    <th className="border border-black p-2 text-center font-semibold">Grade</th>
                    <th className="border border-black p-2 text-center font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudent.subject_results.map((subject, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-black p-2 text-center font-semibold">{index + 1}</td>
                      <td className="border border-black p-2">{subject.subject.name}</td>
                      <td className="border border-black p-2 text-center">{subject.ca_score}</td>
                      <td className="border border-black p-2 text-center">{subject.exam_score}</td>
                      <td className="border border-black p-2 text-center font-semibold">{subject.total_score}</td>
                      <td className="border border-black p-2 text-center">{subject.percentage.toFixed(1)}%</td>
                      <td className="border border-black p-2 text-center font-semibold">{subject.grade}</td>
                      <td className="border border-black p-2 text-center">{subject.remarks}</td>
                    </tr>
                  ))}
                  {/* Empty rows for additional subjects */}
                  {Array.from({ length: Math.max(0, 15 - selectedStudent.subject_results.length) }, (_, i) => (
                    <tr key={`empty-${i}`}>
                      <td className="border border-black p-2 text-center">{selectedStudent.subject_results.length + i + 1}</td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <div className="flex">
                  <span className="font-semibold w-32">Total Score:</span>
                  <span>{selectedStudent.total_score}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">Average Score:</span>
                  <span>{getSafeAverageScore(selectedStudent)}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">GPA:</span>
                  <span>{selectedStudent.gpa.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <div className="flex">
                  <span className="font-semibold w-32">Subjects Passed:</span>
                  <span>{selectedStudent.subjects_passed}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">Subjects Failed:</span>
                  <span>{selectedStudent.subjects_failed}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${selectedStudent.status === 'PASSED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Remarks */}
            {selectedStudent.remarks && (
              <div className="p-6 border-t print:border-none">
                <h3 className="font-semibold mb-2">Remarks:</h3>
                <p className="text-sm">{selectedStudent.remarks}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-6 border-t print:hidden">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Printer size={16} />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => handleDownload(selectedStudent)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && resultToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the result for <strong>{resultToDelete.student.full_name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setResultToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                disabled={actionLoading === 'delete'}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={actionLoading === 'delete'}
              >
                {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Placeholder for future implementation */}
      {showEditModal && editingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Result</h3>
            <p className="text-gray-600 mb-6">
              Edit functionality will be implemented here for {editingResult.student.full_name}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingResult(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolResultTemplate;