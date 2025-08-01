import React, { useState, useMemo, useEffect } from 'react';
import ResultService, { StudentTermResult, ExamSession } from '../../../services/ResultService';
import { useSettings } from '@/contexts/SettingsContext';

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
  logo: settings?.logo_url || "🏫",
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

  const handleRowClick = (student: StudentResult): void => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handlePrint = () => {
    window.print();
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
              <th className="px-4 py-3 border text-left font-semibold">Action</th>
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
                  <td className="border px-4 py-3 text-center font-semibold">{student.average_score.toFixed(1)}%</td>
                  <td className="border px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getGradeColor(student.subject_results[0]?.grade || 'F')}`}>
                      {student.subject_results[0]?.grade || 'N/A'}
                    </span>
                  </td>
                  <td className="border px-4 py-3">
                    <button 
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                      onClick={() => handleRowClick(student)}
                    >
                      View Result
                    </button>
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
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-red-600 text-2xl font-bold print:hidden bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
            >
              ×
            </button>

            {/* Result Sheet Content */}
            <div className="p-8 print:p-4">
              
              {/* Header */}
              <div className="text-center mb-6 border-b-2 border-black pb-4">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="text-4xl">{getSchoolData(settings).logo}</div>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold uppercase tracking-wider">{getSchoolData(settings).name}</h1>
                    <p className="text-sm mt-1">{getSchoolData(settings).address}</p>
                  </div>
                  <div>
                    <img 
                      src={selectedStudent.student.profile_picture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"} 
                      alt="Student" 
                      className="w-20 h-20 rounded border-2 border-gray-300 object-cover" 
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 text-sm">
                  <div className="border border-black px-4 py-1">
                    <strong>{getTermDisplay(selectedStudent.term)}</strong>
                  </div>
                  <div>
                    <strong>Next Term Begins:</strong> {selectedStudent.next_term_begins || getSchoolData(settings).nextTermBegins}
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold w-20">Name:</span>
                    <span className="border-b border-dotted border-black flex-1 px-2">{selectedStudent.student.full_name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-16">Class:</span>
                    <span className="border-b border-dotted border-black w-20 px-2">{selectedStudent.student.student_class}</span>
                    <span className="font-semibold ml-4 w-16">Year:</span>
                    <span className="border-b border-dotted border-black flex-1 px-2">{selectedStudent.academic_session.name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-32">Average Score:</span>
                    <span className="border-b border-dotted border-black w-20 px-2">{selectedStudent.average_score.toFixed(1)}</span>
                    <span className="font-semibold ml-4 w-16">G.P:</span>
                    <span className="border-b border-dotted border-black w-16 px-2">{selectedStudent.gpa.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold w-24">Total Subjects:</span>
                    <span className="border-b border-dotted border-black w-16 px-2">{selectedStudent.total_subjects}</span>
                    <span className="font-semibold ml-4 w-28">Subjects Passed:</span>
                    <span className="border-b border-dotted border-black w-16 px-2">{selectedStudent.subjects_passed}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-16">Grade:</span>
                    <span className="border-b border-dotted border-black w-16 px-2">{selectedStudent.subject_results[0]?.grade || 'N/A'}</span>
                    <span className="font-semibold ml-4 w-20">Status:</span>
                    <span className="border-b border-dotted border-black flex-1 px-2 font-bold">{selectedStudent.status}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-32">Class Position:</span>
                                         <span className="border-b border-dotted border-black w-16 px-2">{selectedStudent.class_position ? selectedStudent.class_position.toString() : 'N/A'}</span>
                    <span className="font-semibold ml-4 w-24">Total Students:</span>
                    <span className="border-b border-dotted border-black w-16 px-2">{selectedStudent.total_students}</span>
                  </div>
                </div>
              </div>

              {/* Academic Report Title */}
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold border-2 border-black inline-block px-4 py-2">
                  TERMLY ACADEMIC REPORT
                </h2>
                <p className="text-sm mt-2 font-semibold">CONTINUOUS ASSESSMENT DOSSIER FOR {getEducationLevelDisplay(selectedStudent.student.education_level)}</p>
              </div>

              {/* Subjects Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border-2 border-black text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-2 text-left w-8">S/N</th>
                      <th className="border border-black p-2 text-left">Subject</th>
                      <th className="border border-black p-2 text-center" colSpan={4}>Test/Examination Score = 100%</th>
                      <th className="border border-black p-2 text-center">Term Total</th>
                      <th className="border border-black p-2 text-center">Percentage</th>
                      <th className="border border-black p-2 text-center">Grade</th>
                      <th className="border border-black p-2 text-center">Subject Teacher's Remark</th>
                    </tr>
                    <tr className="bg-gray-50">
                      <th className="border border-black p-1"></th>
                      <th className="border border-black p-1 font-semibold">Core Subjects</th>
                      <th className="border border-black p-1 text-center">CA (30)</th>
                      <th className="border border-black p-1 text-center">Exam (70)</th>
                      <th className="border border-black p-1"></th>
                      <th className="border border-black p-1"></th>
                      <th className="border border-black p-1"></th>
                      <th className="border border-black p-1"></th>
                      <th className="border border-black p-1"></th>
                      <th className="border border-black p-1 text-center">(Learning Attitude)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.subject_results.map((subject, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-black p-2 text-center font-semibold">{index + 1}</td>
                        <td className="border border-black p-2">{subject.subject.name}</td>
                        <td className="border border-black p-2 text-center">{subject.ca_score}</td>
                        <td className="border border-black p-2 text-center">{subject.exam_score}</td>
                        <td className="border border-black p-2"></td>
                        <td className="border border-black p-2"></td>
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
                    <span className="border-b border-dotted border-black flex-1 px-2">{selectedStudent.total_score.toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex">
                    <span className="font-semibold w-48">Average Score:</span>
                    <span className="border-b border-dotted border-black flex-1 px-2">{selectedStudent.average_score.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Remarks Section */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-start">
                    <span className="font-semibold w-32 mt-1">Form Master's Remark:</span>
                    <div className="flex-1 border-b border-dotted border-black min-h-16 px-2 py-1">
                      {selectedStudent.remarks || "Student shows good academic performance and maintains consistent attendance."}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start">
                    <span className="font-semibold w-32 mt-1">Principal's Remarks:</span>
                    <div className="flex-1 border-b border-dotted border-black min-h-16 px-2 py-1">
                      {selectedStudent.comments.find(c => c.comment_type === 'PRINCIPAL')?.comment || "A promising student who demonstrates good character and academic potential. Continue to work hard and maintain good study habits."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end">
                <div className="text-center">
                  <div className="border-t border-black w-48 mb-2"></div>
                  <p className="text-sm font-semibold">Principal's Signature, Stamp & Date</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold mb-2">
                    {selectedStudent.subjects_passed >= selectedStudent.total_subjects * 0.5 ? "PROMOTED" : "NOT PROMOTED"}
                  </p>
                  <div className="border border-black px-4 py-2">
                    <span className="font-semibold">Status: {selectedStudent.subjects_passed >= selectedStudent.total_subjects * 0.5 ? "PROMOTED" : "NOT PROMOTED"}</span>
                  </div>
                </div>
              </div>

              {/* Print Button */}
              <div className="text-center mt-8 print:hidden">
                <button 
                  onClick={handlePrint} 
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors mr-4"
                >
                  Print Result
                </button>
                <button 
                  onClick={handleCloseModal} 
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:p-4 {
            padding: 1rem !important;
          }
          .print\\:max-h-none {
            max-height: none !important;
          }
          .print\\:overflow-visible {
            overflow: visible !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .fixed {
            position: static !important;
          }
          .bg-black {
            background-color: transparent !important;
          }
          .bg-opacity-50 {
            background-color: transparent !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SchoolResultTemplate;