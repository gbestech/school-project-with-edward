import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  User
} from 'lucide-react';
import StudentService, { Student, CreateStudentData, UpdateStudentData } from '@/services/StudentService';
import { useNavigate } from 'react-router-dom';

// Helper for debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Add constants for education level and class choices
const EDUCATION_LEVEL_CHOICES = [
  { value: 'NURSERY', label: 'Nursery' },
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'SECONDARY', label: 'Secondary' },
];
const CLASS_CHOICES = [
  // Nursery
  { value: 'NURSERY_1', label: 'Nursery 1', level: 'NURSERY' },
  { value: 'NURSERY_2', label: 'Nursery 2', level: 'NURSERY' },
  { value: 'PRE_K', label: 'Pre-K', level: 'NURSERY' },
  { value: 'KINDERGARTEN', label: 'Kindergarten', level: 'NURSERY' },
  // Primary
  { value: 'GRADE_1', label: 'Grade 1', level: 'PRIMARY' },
  { value: 'GRADE_2', label: 'Grade 2', level: 'PRIMARY' },
  { value: 'GRADE_3', label: 'Grade 3', level: 'PRIMARY' },
  { value: 'GRADE_4', label: 'Grade 4', level: 'PRIMARY' },
  { value: 'GRADE_5', label: 'Grade 5', level: 'PRIMARY' },
  { value: 'GRADE_6', label: 'Grade 6', level: 'PRIMARY' },
  // Secondary
  { value: 'GRADE_7', label: 'Grade 7', level: 'SECONDARY' },
  { value: 'GRADE_8', label: 'Grade 8', level: 'SECONDARY' },
  { value: 'GRADE_9', label: 'Grade 9', level: 'SECONDARY' },
  { value: 'GRADE_10', label: 'Grade 10', level: 'SECONDARY' },
  { value: 'GRADE_11', label: 'Grade 11', level: 'SECONDARY' },
  { value: 'GRADE_12', label: 'Grade 12', level: 'SECONDARY' },
];

const StudentsComponent = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  const navigate = useNavigate();
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState<number | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // PDF Export Function
  const exportToPDF = async () => {
    try {
      // Temporary: Just show a message instead of generating PDF
      alert('PDF export functionality is temporarily disabled. Please use the browser print function instead.');
      return;
      
      // TODO: Implement proper PDF export when jsPDF issues are resolved
      // For now, users can use browser print (Ctrl+P) to save as PDF
    } catch (error) {
      console.log('Error generating PDF:', error);
      setError('Failed to generate PDF. Please use browser print function instead.');
    }
  };

  // Enhanced fetch students with profile picture debugging
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      console.log('🔍 Fetching students with token:', token ? 'Present' : 'Missing');
      
      const params: any = {};
      if (debouncedSearch) params.search = debouncedSearch;
      params.page = page;
      params.page_size = pageSize;
      
      console.log('🔍 Request params:', params);
      console.log('🔍 API base URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000/api');
      
      const res = await StudentService.getStudents(params);
      
      console.log('✅ Students API Response:', res);
      
      const data = res;
      let studentsData: Student[] = [];
      
      if (Array.isArray(data)) {
        studentsData = data;
        setCount(data.length);
      } else {
        studentsData = data.results || [];
        setCount(data.count || 0);
      }

      // 🔍 Debug profile pictures specifically
      console.log('🖼️ Profile Picture Debug:');
      studentsData.forEach((student, index) => {
        console.log(`Student ${index + 1} (${student.full_name}):`);
        console.log(`  - ID: ${student.id}`);
        console.log(`  - Profile Picture: ${student.profile_picture}`);
        console.log(`  - Profile Picture Type: ${typeof student.profile_picture}`);
        console.log(`  - Full Student Object:`, student);
      });

      // Check if any students have profile pictures
      const studentsWithPictures = studentsData.filter(s => s.profile_picture);
      console.log(`📊 Students with profile pictures: ${studentsWithPictures.length}/${studentsData.length}`);
      
      setStudents(studentsData);
      
    } catch (err: any) {
      console.log('❌ Students fetch error:', err);
      console.log('❌ Error response:', err.response?.data);
      console.log('❌ Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to access student data.');
      } else if (err.response?.status === 404) {
        setError('Students endpoint not found. Check your API URL.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Unknown error occurred');
      }
      
      setStudents([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => {
    fetchStudents();
    setSelectAll(false);
    setSelectedStudents([]);
  }, [fetchStudents]);

  const toggleStudentSelection = (id: number) => {
    setSelectedStudents(prev => 
      prev.includes(id) 
        ? prev.filter((studentId: number) => studentId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  // Enhanced profile picture rendering with debugging
  const renderProfilePicture = (student: Student) => {
    console.log(`🖼️ Rendering profile for ${student.full_name}:`, student.profile_picture);
    
    if (student.profile_picture) {
      // Check if it's a full URL or just a path
      const imageUrl = student.profile_picture.startsWith('http') 
        ? student.profile_picture 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${student.profile_picture}`;
      
      console.log(`🖼️ Final image URL for ${student.full_name}:`, imageUrl);
      
      return (
        <img
          src={imageUrl}
          alt={student.full_name}
          className="w-10 h-10 rounded-full object-cover border"
          onError={(e) => {
            console.log(`❌ Failed to load image for ${student.full_name}:`, imageUrl);
            // Hide the broken image and show initials instead
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
          onLoad={() => {
            console.log(`✅ Successfully loaded image for ${student.full_name}`);
          }}
        />
      );
    }
    
    return null;
  };

  const renderInitialsAvatar = (student: Student) => {
    return (
      <div className={`w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ${student.profile_picture ? 'hidden' : ''}`}>
        <span className="text-sm font-medium text-white">
          {getInitials(student.full_name)}
        </span>
      </div>
    );
  };

  // Handler: View student details
  const handleViewStudent = async (studentId: number) => {
    setModalLoading(true);
    setViewError(null);
    try {
      const res = await StudentService.getStudent(studentId);
      setViewStudent(res);
    } catch (err: any) {
      setViewError(err.response?.data?.detail || err.message || 'Failed to fetch student details');
      setViewStudent(null);
    } finally {
      setModalLoading(false);
    }
  };

  // Handler: Open edit modal and load student data
  const handleEditStudent = async (studentId: number) => {
    setModalLoading(true);
    try {
      const res = await StudentService.getStudent(studentId);
      setEditStudent(res);
      setEditForm(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student for editing');
    } finally {
      setModalLoading(false);
    }
  };

  // Handler: Submit edit
  const handleEditSubmit = async () => {
    if (!editStudent) return;
    setModalLoading(true);
    try {
      const payload = {
        ...editForm,
        education_level: editForm.education_level,
        student_class: editForm.student_class,
      };
      const res = await StudentService.updateStudent(editStudent.id, payload);
      setStudents((prev) => prev.map((s) => (s.id === editStudent.id ? { ...s, ...res } : s)));
      setEditStudent(null);
      setEditForm({});
    } catch (err: any) {
      setError(err.response?.data?.student_class?.[0] || err.message || 'Failed to update student');
    } finally {
      setModalLoading(false);
    }
  };

  // Handler: Delete student (open modal)
  const handleDeleteStudent = (studentId: number) => {
    setDeleteStudentId(studentId);
  };
  // Handler: Confirm delete
  const confirmDeleteStudent = async () => {
    if (!deleteStudentId) return;
    setLoading(true);
    try {
      await StudentService.deleteStudent(deleteStudentId);
      setStudents((prev) => prev.filter((s) => s.id !== deleteStudentId));
      setSelectedStudents((prev) => prev.filter((id) => id !== deleteStudentId));
      setDeleteStudentId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };
  // Handler: Cancel delete
  const cancelDeleteStudent = () => setDeleteStudentId(null);

  // Handler: Toggle student active status
  const handleToggleActive = async (student: Student) => {
    try {
      const res = await StudentService.toggleStudentStatus(student.id);
      setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, is_active: res.is_active } : s)));
    } catch (err: any) {
      setError(err.message || 'Failed to toggle student status');
    }
  };

  // Pagination controls
  const totalPages = Math.ceil(count / pageSize);
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handlePage = (p: number) => setPage(p);

  // Filter class choices by selected level in editForm
  const filteredClassChoices = CLASS_CHOICES.filter(
    (c) => c.level === editForm.education_level
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Students</h1>
              <p className="text-gray-600 mt-1">Manage student information and records</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={exportToPDF}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => navigate('/admin/students/add')}
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
            

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-green-600">{students.filter(s => s.is_active).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Students</p>
                <p className="text-2xl font-bold text-red-600">{students.filter(s => !s.is_active).length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-red-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Photos</p>
                <p className="text-2xl font-bold text-purple-600">{students.filter(s => s.profile_picture).length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <select 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option>Newest</option>
                <option>Oldest</option>
                <option>Name A-Z</option>
                <option>Name Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading students...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No students found.</div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Student</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">ID</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Admission Date</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Parent Contact</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Class</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Level</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 relative">
                          {renderProfilePicture(student)}
                          {renderInitialsAvatar(student)}
                        </div>
                        <div>
                          <p className="font-medium w-3xs text-gray-900">{student.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-indigo-600 font-medium">{student.id}</span>
                    </td>
                    <td className="w-3xs py-4 px-6 text-gray-700">{student.admission_date}</td>
                    <td className="py-4 px-6 text-gray-700">{student.parent_contact || '-'}</td>
                    <td className="w-3xs py-4 px-6 text-gray-700">{student.student_class_display}</td>
                    <td className="py-4 px-6 text-gray-700">{student.education_level_display}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${student.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 relative">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-indigo-600 transition-colors" onClick={() => handleEditStudent(student.id)}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors" onClick={() => handleDeleteStudent(student.id)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => setActionMenuOpen(actionMenuOpen === student.id ? null : student.id)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {actionMenuOpen === student.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => { handleViewStudent(student.id); setActionMenuOpen(null); }}>View</button>
                              <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => { handleEditStudent(student.id); setActionMenuOpen(null); }}>Edit</button>
                              <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => { handleDeleteStudent(student.id); setActionMenuOpen(null); }}>Delete</button>
                              <button
                                onClick={() => { handleToggleActive(student); setActionMenuOpen(null); }}
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                              >
                                {student.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, count)}</span> of{' '}
                <span className="font-medium">{count}</span> results
              </div>
              <div className="flex space-x-2">
                <button onClick={handlePrev} disabled={page === 1} className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50">
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePage(i + 1)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${page === i + 1 ? 'bg-indigo-600 text-white' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={handleNext} disabled={page === totalPages} className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* View Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setViewStudent(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Student Details</h2>
            {modalLoading ? <div>Loading...</div> : viewError ? (
              <div className="text-red-500">{viewError}</div>
            ) : (
              <div>
                <p><b>Name:</b> {viewStudent.full_name}</p>
                <p><b>Email:</b> {viewStudent.email}</p>
                <p><b>Gender:</b> {viewStudent.gender}</p>
                <p><b>Class:</b> {viewStudent.student_class_display}</p>
                <p><b>Level:</b> {viewStudent.education_level_display}</p>
                <p><b>Status:</b> {viewStudent.is_active ? 'Active' : 'Inactive'}</p>
                <p><b>Parent Contact:</b> {viewStudent.parent_contact}</p>
                <p><b>Admission Date:</b> {viewStudent.admission_date}</p>
                {/* Add more fields as needed */}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setEditStudent(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Edit Student</h2>
            {modalLoading ? <div>Loading...</div> : (
              <form onSubmit={e => { e.preventDefault(); handleEditSubmit(); }}>
                <div className="mb-2">
                  <label className="block text-sm font-medium">Full Name</label>
                  <input type="text" className="w-full border rounded px-2 py-1" value={editForm.full_name || ''} onChange={e => setEditForm((f: any) => ({ ...f, full_name: e.target.value }))} disabled />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full border rounded px-2 py-1"
                    value={editForm.date_of_birth ? editForm.date_of_birth.slice(0, 10) : ''}
                    onChange={e => setEditForm((f: any) => ({ ...f, date_of_birth: e.target.value }))}
                  />
                  {error && error.toLowerCase().includes('date_of_birth') && (
                    <div className="text-red-500 text-xs mt-1">{error}</div>
                  )}
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium">Education Level</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={editForm.education_level || ''}
                    onChange={e => setEditForm((f: any) => ({ ...f, education_level: e.target.value, student_class: '' }))}
                  >
                    <option value="">Select Level</option>
                    {EDUCATION_LEVEL_CHOICES.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium">Class</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={editForm.student_class || ''}
                    onChange={e => setEditForm((f: any) => ({ ...f, student_class: e.target.value }))}
                    disabled={!editForm.education_level}
                  >
                    <option value="">Select Class</option>
                    {filteredClassChoices.map((cls) => (
                      <option key={cls.value} value={cls.value}>{cls.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium">Parent Contact</label>
                  <input type="text" className="w-full border rounded px-2 py-1" value={editForm.parent_contact || ''} onChange={e => setEditForm((f: any) => ({ ...f, parent_contact: e.target.value }))} />
                </div>
                {/* Add more fields as needed */}
                <div className="flex justify-end mt-4">
                  <button type="button" className="mr-2 px-4 py-2 bg-gray-200 rounded" onClick={() => setEditStudent(null)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this student?</p>
            <div className="flex justify-end mt-4">
              <button className="mr-2 px-4 py-2 bg-gray-200 rounded" onClick={cancelDeleteStudent}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={confirmDeleteStudent}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsComponent;