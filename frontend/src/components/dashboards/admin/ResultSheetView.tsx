import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Search, 
  Filter,
  FileText,
  GraduationCap,
  Calendar,
  Trophy,
  TrendingUp,
  Users,
  BookOpen,
  RefreshCw,
  Printer,
  Eye,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc
} from 'lucide-react';
import StudentService, { Student } from '@/services/StudentService';
import { toast } from 'react-toastify';

interface SubjectResult {
  name: string;
  assessment: number;
  exam: number;
  total: number;
  grade: string;
  position?: number;
}

interface StudentResult {
  student_id: number;
  student_name: string;
  registration_number: string;
  class: string;
  education_level: string;
  subjects: SubjectResult[];
  total_score: number;
  average: number;
  position: number;
  remarks: string;
  teacher_remark?: string;
  principal_remark?: string;
  term: string;
  academic_year: string;
}

interface ResultSheetViewProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass?: string;
  selectedTerm?: string;
  selectedAcademicYear?: string;
}

const ResultSheetView: React.FC<ResultSheetViewProps> = ({
  isOpen,
  onClose,
  selectedClass,
  selectedTerm,
  selectedAcademicYear
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [resultSheetData, setResultSheetData] = useState<StudentResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'position' | 'average' | 'name'>('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [classFilter, setClassFilter] = useState(selectedClass || '');
  const [termFilter, setTermFilter] = useState(selectedTerm || '');
  const [academicYearFilter, setAcademicYearFilter] = useState(selectedAcademicYear || '');
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set());

  // Mock data for demonstration - replace with actual API calls
  const generateMockResultData = (students: Student[]): StudentResult[] => {
    const subjects = [
      'Mathematics', 'English Studies', 'Basic Science', 'Social Studies',
      'Christian Religious Studies', 'Cultural and Creative Arts', 'Physical and Health Education',
      'Information Technology', 'Business Studies', 'French'
    ];

    return students.map((student, index) => {
      const studentSubjects = subjects.slice(0, Math.floor(Math.random() * 6) + 4); // 4-9 subjects
      const subjectResults: SubjectResult[] = studentSubjects.map(subject => {
        const assessment = Math.floor(Math.random() * 30) + 70; // 70-100
        const exam = Math.floor(Math.random() * 30) + 70; // 70-100
        const total = (assessment + exam) / 2;
        const grade = total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : total >= 50 ? 'D' : 'F';
        
        return {
          name: subject,
          assessment,
          exam,
          total: Math.round(total * 10) / 10,
          grade
        };
      });

      const totalScore = subjectResults.reduce((sum, subject) => sum + subject.total, 0);
      const average = Math.round((totalScore / subjectResults.length) * 10) / 10;
      const position = index + 1;

      return {
        student_id: student.id,
        student_name: student.user,
        registration_number: student.registration_number || 'N/A',
        class: student.student_class,
        education_level: student.education_level,
        subjects: subjectResults,
        total_score: Math.round(totalScore * 10) / 10,
        average,
        position,
        remarks: average >= 80 ? 'Excellent performance. Keep it up!' :
                average >= 70 ? 'Good performance. Continue working hard.' :
                average >= 60 ? 'Fair performance. Need more effort.' :
                'Poor performance. Requires immediate attention.',
        teacher_remark: 'Student shows good potential. Continue with current study habits.',
        principal_remark: 'Approved for promotion to next class.',
        term: 'First Term',
        academic_year: '2025-2026'
      };
    });
  };

  // Fetch students and generate result data
  const fetchResultData = async () => {
    try {
      setLoading(true);
      const response = await StudentService.getStudents();
      const studentsArray = Array.isArray(response) ? response : [];
      setStudents(studentsArray);
      
      // Generate mock result data
      const mockData = generateMockResultData(studentsArray);
      setResultSheetData(mockData);
      setFilteredResults(mockData);
    } catch (error) {
      console.error('Error fetching result data:', error);
      toast.error('Failed to load result sheet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchResultData();
    }
  }, [isOpen]);

  // Filter and sort results
  useEffect(() => {
    let filtered = resultSheetData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Class filter
    if (classFilter) {
      filtered = filtered.filter(result => result.class === classFilter);
    }

    // Term filter
    if (termFilter) {
      filtered = filtered.filter(result => result.term === termFilter);
    }

    // Academic year filter
    if (academicYearFilter) {
      filtered = filtered.filter(result => result.academic_year === academicYearFilter);
    }

    // Sort results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'position':
          aValue = a.position;
          bValue = b.position;
          break;
        case 'average':
          aValue = a.average;
          bValue = b.average;
          break;
        case 'name':
          aValue = a.student_name;
          bValue = b.student_name;
          break;
        default:
          aValue = a.position;
          bValue = b.position;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredResults(filtered);
  }, [resultSheetData, searchTerm, classFilter, termFilter, academicYearFilter, sortBy, sortOrder]);

  // Toggle student expansion
  const toggleStudentExpansion = (studentId: number) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  // Handle sort
  const handleSort = (field: 'position' | 'average' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    toast.info('PDF export functionality will be implemented soon');
  };

  // Print result sheet
  const printResultSheet = () => {
    window.print();
  };

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Result Sheet</h2>
            <p className="text-gray-600 mt-1">
              {filteredResults.length} students • {classFilter || 'All Classes'} • {termFilter || 'All Terms'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={printResultSheet}
              className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters || classFilter || termFilter || academicYearFilter
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSort('position')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  sortBy === 'position' ? 'bg-blue-600 text-white' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span>Position</span>
                {sortBy === 'position' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleSort('average')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  sortBy === 'average' ? 'bg-blue-600 text-white' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span>Average</span>
                {sortBy === 'average' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleSort('name')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  sortBy === 'name' ? 'bg-blue-600 text-white' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span>Name</span>
                {sortBy === 'name' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Classes</option>
                    <option value="PRIMARY_1">Primary 1</option>
                    <option value="PRIMARY_2">Primary 2</option>
                    <option value="PRIMARY_3">Primary 3</option>
                    <option value="PRIMARY_4">Primary 4</option>
                    <option value="PRIMARY_5">Primary 5</option>
                    <option value="PRIMARY_6">Primary 6</option>
                    <option value="JSS_1">JSS 1</option>
                    <option value="JSS_2">JSS 2</option>
                    <option value="JSS_3">JSS 3</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                  <select
                    value={termFilter}
                    onChange={(e) => setTermFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Terms</option>
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <select
                    value={academicYearFilter}
                    onChange={(e) => setAcademicYearFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Years</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setClassFilter('');
                    setTermFilter('');
                    setAcademicYearFilter('');
                  }}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {filteredResults.map((studentResult) => (
                <div key={studentResult.student_id} className="border rounded-lg overflow-hidden">
                  {/* Student Header */}
                  <div 
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleStudentExpansion(studentResult.student_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-blue-600">
                            #{studentResult.position}
                          </span>
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {studentResult.student_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Reg. No: {studentResult.registration_number} | Class: {studentResult.class}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {studentResult.average}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Average
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {studentResult.total_score}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Score
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {expandedStudents.has(studentResult.student_id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedStudents.has(studentResult.student_id) && (
                    <div className="p-6">
                      {/* Subjects Table */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Subject Results</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Subject
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                  Assessment
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                  Exam
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                  Total
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                  Grade
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                  Position
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {studentResult.subjects.map((subject, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {subject.name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-center text-gray-900">
                                    {subject.assessment}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-center text-gray-900">
                                    {subject.exam}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">
                                    {subject.total}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(subject.grade)}`}>
                                      {subject.grade}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-center text-gray-900">
                                    {subject.position || 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Summary and Remarks */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-blue-900 mb-2">Performance Summary</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Score:</span>
                              <span className="font-medium">{studentResult.total_score}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Average:</span>
                              <span className="font-medium">{studentResult.average}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Position:</span>
                              <span className="font-medium">{studentResult.position}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subjects:</span>
                              <span className="font-medium">{studentResult.subjects.length}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-green-900 mb-2">Remarks</h5>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600 font-medium">General:</span>
                              <p className="text-gray-800 mt-1">{studentResult.remarks}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Teacher:</span>
                              <p className="text-gray-800 mt-1">{studentResult.teacher_remark}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Principal:</span>
                              <p className="text-gray-800 mt-1">{studentResult.principal_remark}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultSheetView;


