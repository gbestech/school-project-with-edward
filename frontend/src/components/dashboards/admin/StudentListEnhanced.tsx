import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus,  
  Filter,
  MoreVertical,
  Edit,
  User,
  AlertCircle,
  Grid3X3,
  List,
  Eye,
  FileText,
  GraduationCap,
  Calendar,
  Mail,
  BookOpen,
  Trash2
} from 'lucide-react';
import StudentService, { Student } from '@/services/StudentService';
import { useNavigate } from 'react-router-dom';
import ResultSheetView from './ResultSheetView';

// Helper for debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Education level and class choices
const EDUCATION_LEVEL_CHOICES = [
  { value: 'NURSERY', label: 'Nursery' },
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'JUNIOR_SECONDARY', label: 'Junior Secondary' },
  { value: 'SENIOR_SECONDARY', label: 'Senior Secondary' },
  { value: 'SECONDARY', label: 'Secondary (Legacy)' },
];

const CLASS_CHOICES = [
  // Nursery
  { value: 'PRE_NURSERY', label: 'Pre-nursery', level: 'NURSERY' },
  { value: 'NURSERY_1', label: 'Nursery 1', level: 'NURSERY' },
  { value: 'NURSERY_2', label: 'Nursery 2', level: 'NURSERY' },
  // Primary
  { value: 'PRIMARY_1', label: 'Primary 1', level: 'PRIMARY' },
  { value: 'PRIMARY_2', label: 'Primary 2', level: 'PRIMARY' },
  { value: 'PRIMARY_3', label: 'Primary 3', level: 'PRIMARY' },
  { value: 'PRIMARY_4', label: 'Primary 4', level: 'PRIMARY' },
  { value: 'PRIMARY_5', label: 'Primary 5', level: 'PRIMARY' },
  { value: 'PRIMARY_6', label: 'Primary 6', level: 'PRIMARY' },
  // Junior Secondary
  { value: 'JSS_1', label: 'Junior Secondary 1 (JSS1)', level: 'JUNIOR_SECONDARY' },
  { value: 'JSS_2', label: 'Junior Secondary 2 (JSS2)', level: 'JUNIOR_SECONDARY' },
  { value: 'JSS_3', label: 'Junior Secondary 3 (JSS3)', level: 'JUNIOR_SECONDARY' },
  // Senior Secondary
  { value: 'SS_1', label: 'Senior Secondary 1 (SS1)', level: 'SENIOR_SECONDARY' },
  { value: 'SS_2', label: 'Senior Secondary 2 (SS2)', level: 'SENIOR_SECONDARY' },
  { value: 'SS_3', label: 'Senior Secondary 3 (SS3)', level: 'SENIOR_SECONDARY' },
];

const StudentListEnhanced: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [educationLevelFilter, setEducationLevelFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [showResultSheet, setShowResultSheet] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await StudentService.getStudents();
      const studentsArray = Array.isArray(response) ? response : [];
      setStudents(studentsArray);
      setFilteredStudents(studentsArray);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter students based on search and filters
  useEffect(() => {
    let filtered = students;

    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter(student => 
        student.full_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        student.username?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        student.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Education level filter
    if (educationLevelFilter) {
      filtered = filtered.filter(student => student.education_level === educationLevelFilter);
    }

    // Class filter
    if (classFilter) {
      filtered = filtered.filter(student => student.student_class === classFilter);
    }

    // Gender filter
    if (genderFilter) {
      filtered = filtered.filter(student => student.gender === genderFilter);
    }

    setFilteredStudents(filtered);
  }, [students, debouncedSearch, educationLevelFilter, classFilter, genderFilter]);

  // Handle result sheet view
  const handleViewResultSheet = () => {
    setShowResultSheet(true);
  };

  // Handle delete student
  const handleDeleteStudent = (studentId: number) => {
    setDeleteStudentId(studentId);
    setShowDeleteModal(true);
  };

  // Confirm delete student
  const confirmDeleteStudent = async () => {
    if (!deleteStudentId) return;

    try {
      setDeleting(true);
      await StudentService.deleteStudent(deleteStudentId);
      
      // Remove the student from the local state
      setStudents(prev => prev.filter(student => student.id !== deleteStudentId));
      setFilteredStudents(prev => prev.filter(student => student.id !== deleteStudentId));
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setDeleteStudentId(null);
      
      // Show success message (you could add a toast notification here)
      console.log('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      setError('Failed to delete student. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteStudentId(null);
  };


  // Get class label
  const getClassLabel = (classValue: string) => {
    const classChoice = CLASS_CHOICES.find(c => c.value === classValue);
    return classChoice ? classChoice.label : classValue;
  };

  // Get education level label
  const getEducationLevelLabel = (level: string) => {
    const levelChoice = EDUCATION_LEVEL_CHOICES.find(l => l.value === level);
    return levelChoice ? levelChoice.label : level;
  };

  // Get filtered classes based on education level
  const getFilteredClasses = () => {
    if (!educationLevelFilter) return CLASS_CHOICES;
    return CLASS_CHOICES.filter(c => c.level === educationLevelFilter);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Students</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStudents}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600 mt-1">
              {filteredStudents.length} of {students.length} students
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleViewResultSheet}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText size={16} />
              <span>Result Sheet</span>
            </button>
            <button
              onClick={() => navigate('/admin/students/add')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>Add Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name, registration number, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters || educationLevelFilter || classFilter || genderFilter
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              {(educationLevelFilter || classFilter || genderFilter) && (
                <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  {[educationLevelFilter, classFilter, genderFilter].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Grid3X3 size={16} />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <List size={16} />
              <span>List</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education Level
                </label>
                <select
                  value={educationLevelFilter}
                  onChange={(e) => {
                    setEducationLevelFilter(e.target.value);
                    setClassFilter(''); // Reset class filter when level changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Levels</option>
                  {EDUCATION_LEVEL_CHOICES.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Classes</option>
                  {getFilteredClasses().map(cls => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Genders</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setEducationLevelFilter('');
                  setClassFilter('');
                  setGenderFilter('');
                }}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Students Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {student.full_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {student.username || 'No Reg. No.'}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {selectedStudent?.id === student.id && (
                      <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                        <button
                          onClick={() => navigate(`/admin/students/${student.id}`)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => navigate(`/admin/students/${student.id}/edit`)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => navigate(`/admin/students/${student.id}/results`)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 text-sm"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View Results</span>
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-red-50 text-sm text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {getClassLabel(student.student_class)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {getEducationLevelLabel(student.education_level)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 truncate">
                      {student.email || 'No email'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    (student.gender === 'M' || student.gender === 'MALE')
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-pink-100 text-pink-800'
                  }`}>
                    {(student.gender === 'M' || student.gender === 'MALE') ? 'Male' : 'Female'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.full_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.username || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getClassLabel(student.student_class)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getEducationLevelLabel(student.education_level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (student.gender === 'M' || student.gender === 'MALE')
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        {(student.gender === 'M' || student.gender === 'MALE') ? 'Male' : 'Female'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/admin/students/${student.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/students/${student.id}/edit`)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/students/${student.id}/results`)}
                          className="text-purple-600 hover:text-purple-900"
                          title="View Results"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || educationLevelFilter || classFilter || genderFilter
              ? 'Try adjusting your search or filters.'
              : 'Get started by adding a new student.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/admin/students/add')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Student
            </button>
          </div>
        </div>
      )}

      {/* Result Sheet Modal */}
      <ResultSheetView
        isOpen={showResultSheet}
        onClose={() => setShowResultSheet(false)}
        selectedClass={classFilter}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Student</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this student? This will permanently remove the student and all associated data from the system.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStudent}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Student</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentListEnhanced;
