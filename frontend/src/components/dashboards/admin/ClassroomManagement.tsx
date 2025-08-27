import React, { useState, useEffect } from 'react';
import { 
  School, Plus, Search, Filter, Edit3, Trash2, Eye, Users, BookOpen, 
  Calendar, MapPin, Clock, X, Check, AlertCircle, Baby, GraduationCap,
  ChevronDown, Save, UserCheck, Building, Grid3X3, List, UserPlus
} from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { classroomService, Classroom, Teacher, Subject, TeacherAssignment } from '@/services/ClassroomService';
import { toast } from 'react-toastify';
import ClassroomViewModal from './ClassroomViewModal';

interface ClassroomManagementProps {}

const ClassroomManagement: React.FC<ClassroomManagementProps> = () => {
  const { theme } = useGlobalTheme();
  const isDark = theme === 'dark';
  
  // State management
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    grade_level: '',
    section: '',
    academic_year: '',
    term: '',
    class_teacher: '',
    room_number: '',
    max_capacity: 30
  });

  // Additional data for forms
  const [gradeLevels, setGradeLevels] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  
  // Assignment form
  const [assignmentData, setAssignmentData] = useState({
    teacher_id: '',
    subject_id: ''
  });

  // Available subjects for selected teacher
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  
  // Multiple subject selection for nursery/primary
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [isMultipleSelection, setIsMultipleSelection] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // View toggle
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classroomsRes, teachersRes, subjectsRes, gradeLevelsRes, academicYearsRes] = await Promise.all([
        classroomService.getClassrooms(),
        classroomService.getAllTeachers(),
        classroomService.getAllSubjects(),
        classroomService.getGradeLevels(),
        classroomService.getAcademicYears()
      ]);
      
      // Handle both response formats: { results: [...] } and direct array
      const classrooms = Array.isArray(classroomsRes) ? classroomsRes : (classroomsRes.results || []);
      const teachers = Array.isArray(teachersRes) ? teachersRes : (teachersRes.results || []);
      const subjects = Array.isArray(subjectsRes) ? subjectsRes : (subjectsRes.results || []);
      const gradeLevels = Array.isArray(gradeLevelsRes) ? gradeLevelsRes : (gradeLevelsRes.results || []);
      const academicYears = Array.isArray(academicYearsRes) ? academicYearsRes : (academicYearsRes.results || []);
      
      setClassrooms(classrooms);
      setFilteredClassrooms(classrooms);
      setTeachers(teachers);
      setSubjects(subjects);
      setGradeLevels(gradeLevels);
      setAcademicYears(academicYears);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load classroom data');
      console.error('❌ Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter classrooms
  useEffect(() => {
    let filtered = classrooms;

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.grade_level_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(c => c.education_level === levelFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.is_active === (statusFilter === 'active'));
    }



    setFilteredClassrooms(filtered);
  }, [classrooms, searchTerm, levelFilter, statusFilter]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedClassroom) {
        await classroomService.updateClassroom(selectedClassroom.id, formData);
        toast.success('Classroom updated successfully');
      } else {
        await classroomService.createClassroom(formData);
        toast.success('Classroom created successfully');
      }
      setShowAddModal(false);
      setShowEditModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    }
  };

  // Handle teacher assignment
  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroom) return;
    
    try {
      // Always use multiple selection logic since we now use checkboxes for all levels
      if (selectedSubjects.length === 0) {
        toast.error('Please select at least one subject');
        return;
      }
      
      // Assign multiple subjects
      const assignmentPromises = selectedSubjects.map(subjectId =>
        classroomService.assignTeacherToClassroom(
          selectedClassroom.id,
          {
            teacher_id: parseInt(assignmentData.teacher_id),
            subject_id: subjectId
          }
        )
      );
      
      await Promise.all(assignmentPromises);
      toast.success(`Teacher assigned to ${selectedSubjects.length} subject(s) successfully`);
      
      setShowAssignTeacherModal(false);
      setAssignmentData({ teacher_id: '', subject_id: '' });
      setAvailableSubjects([]);
      setSelectedSubjects([]);
      setIsMultipleSelection(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Assignment failed');
    }
  };

  // Handle remove teacher assignment
  const handleRemoveAssignment = async (teacherId: number, subjectId: number) => {
    if (!selectedClassroom) return;
    
    try {
      await classroomService.removeTeacherFromClassroom(
        selectedClassroom.id,
        { teacher_id: teacherId, subject_id: subjectId }
      );
      toast.success('Teacher assignment removed successfully');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove assignment');
    }
  };

  // Auto-assign teachers based on their qualifications
  const handleAutoAssign = async () => {
    try {
      await classroomService.autoAssignTeachers();
      toast.success('Teachers auto-assigned successfully based on qualifications');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Auto-assignment failed');
    }
  };

  // Handle delete classroom
  const handleDeleteClassroom = async (classroom: Classroom) => {
    if (!window.confirm(`Are you sure you want to delete the classroom "${classroom.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await classroomService.deleteClassroom(classroom.id);
      toast.success('Classroom deleted successfully');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete classroom');
    }
  };

  // Load sections for a specific grade level
  const loadSectionsForGradeLevel = async (gradeLevelId: number) => {
    try {
      const sectionsRes = await classroomService.getSections(gradeLevelId);
      const sections = Array.isArray(sectionsRes) ? sectionsRes : (sectionsRes.results || []);
      setSections(sections);
    } catch (err: any) {
      console.error('Error loading sections:', err);
      setSections([]);
    }
  };

  // Load terms for a specific academic year
  const loadTermsForAcademicYear = async (academicYearId: number) => {
    try {
      const termsRes = await classroomService.getTerms(academicYearId);
      const terms = Array.isArray(termsRes) ? termsRes : (termsRes.results || []);
      setTerms(terms);
    } catch (err: any) {
      console.error('Error loading terms:', err);
      setTerms([]);
    }
  };

  // Handle select all subjects
  const handleSelectAll = () => {
    if (selectedSubjects.length === availableSubjects.length) {
      // If all are selected, deselect all
      setSelectedSubjects([]);
    } else {
      // Select all available subjects
      setSelectedSubjects(availableSubjects.map(subject => subject.id));
    }
  };

  // Handle individual subject selection
  const handleSubjectToggle = (subjectId: number) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Get available subjects for selected teacher
  const getAvailableSubjectsForTeacher = async (teacherId: string) => {
    if (!teacherId) {
      setAvailableSubjects([]);
      setSelectedSubjects([]);
      setIsMultipleSelection(true); // Always true since we use checkboxes for all levels
      return;
    }

    try {
      const teacher = teachers.find(t => t.id.toString() === teacherId);
      if (teacher && teacher.assigned_subjects) {
        // Map the assigned subjects to full subject objects
        const teacherSubjects = teacher.assigned_subjects.map(assignedSubject => {
          const fullSubject = subjects.find(s => s.id === assignedSubject.id);
          return fullSubject;
        }).filter(Boolean) as Subject[];
        
        setAvailableSubjects(teacherSubjects);
        setIsMultipleSelection(true); // Always true since we use checkboxes for all levels
        setSelectedSubjects([]);
      } else {
        setAvailableSubjects([]);
        setSelectedSubjects([]);
        setIsMultipleSelection(true); // Always true since we use checkboxes for all levels
      }
    } catch (err: any) {
      console.error('Error getting available subjects:', err);
      setAvailableSubjects([]);
      setSelectedSubjects([]);
      setIsMultipleSelection(true); // Always true since we use checkboxes for all levels
    }
  };

  // Helper function to count unique teachers
  const getUniqueTeacherCount = (assignments: any[]) => {
    if (!assignments || assignments.length === 0) return 0;
    return new Set(assignments.map(assignment => assignment.teacher)).size;
  };

  // Theme classes
  const themeClasses = {
    bgPrimary: isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100',
    bgCard: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100',
    textPrimary: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    borderPrimary: isDark ? 'border-gray-700' : 'border-gray-200',
  };



  if (loading) {
    return (
      <div className={`${themeClasses.bgPrimary}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={themeClasses.textSecondary}>Loading classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${themeClasses.bgPrimary}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Classroom Management</h1>
              <p className="text-gray-600">Manage classrooms and teacher assignments</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAutoAssign}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <UserPlus size={20} />
                Auto-Assign Teachers
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Plus size={20} />
                Add Classroom
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className={`${themeClasses.bgCard} rounded-xl p-4 shadow-lg border mb-6 bg-blue-50 border-blue-200`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">i</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Teacher Assignments</h3>
              <p className="text-sm text-blue-700">
                Teacher assignments from the teacher page are qualifications. Use "Auto-Assign Teachers" to convert them to actual classroom assignments.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border mb-8`}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-3 ${themeClasses.textSecondary}`} size={20} />
              <input
                type="text"
                placeholder="Search classrooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.borderPrimary} ${themeClasses.textPrimary}`}
              />
            </div>
            <div className="flex gap-4">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.borderPrimary} ${themeClasses.textPrimary}`}
              >
                <option value="all">All Levels</option>
                <option value="NURSERY">Nursery</option>
                <option value="PRIMARY">Primary</option>
                <option value="SECONDARY">Secondary</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.borderPrimary} ${themeClasses.textPrimary}`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className={`${themeClasses.bgCard} rounded-xl p-4 shadow-lg border mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">View Mode:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('card')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'card'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid3X3 size={16} />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List size={16} />
                  List
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredClassrooms.length} classroom{filteredClassrooms.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Classrooms Display */}
        {viewMode === 'card' ? (
          // Card View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClassrooms.map((classroom) => (
              <div key={classroom.id} className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{classroom.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    classroom.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {classroom.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-gray-600"><strong>Level:</strong> {classroom.grade_level_name}</p>
                  <p className="text-gray-600"><strong>Section:</strong> {classroom.section_name}</p>
                  <p className="text-gray-600"><strong>Room:</strong> {classroom.room_number || 'Not assigned'}</p>
                  <p className="text-gray-600"><strong>Capacity:</strong> {classroom.current_enrollment}/{classroom.max_capacity}</p>
                  <p className="text-gray-600">
                    <strong>Assigned Teachers:</strong> 
                    {classroom.teacher_assignments && classroom.teacher_assignments.length > 0 ? (
                      <span className="text-green-600 font-medium">
                        {getUniqueTeacherCount(classroom.teacher_assignments)} teacher{getUniqueTeacherCount(classroom.teacher_assignments) !== 1 ? 's' : ''} assigned
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">Not assigned</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedClassroom(classroom);
                      setShowViewModal(true);
                    }}
                    className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all duration-200 hover:scale-110 group relative"
                    title="View Details"
                  >
                    <Eye size={18} />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      View
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClassroom(classroom);
                      setAssignmentData({ teacher_id: '', subject_id: '' });
                      setAvailableSubjects([]);
                      setSelectedSubjects([]);
                      setIsMultipleSelection(false);
                      setShowAssignTeacherModal(true);
                    }}
                    className="p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-all duration-200 hover:scale-110 group relative"
                    title="Assign Teacher"
                  >
                    <UserPlus size={18} />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      Assign
                    </span>
                  </button>
                  <button
                    onClick={async () => {
                      setSelectedClassroom(classroom);
                      
                      // Set initial form data
                      const initialFormData = {
                        name: classroom.name,
                        grade_level: '', // Will be set after loading sections
                        section: classroom.section.toString(),
                        academic_year: classroom.academic_year.toString(),
                        term: classroom.term.toString(),
                        class_teacher: classroom.class_teacher?.toString() || '',
                        room_number: classroom.room_number,
                        max_capacity: classroom.max_capacity
                      };
                      
                      setFormData(initialFormData);
                      
                      // Load terms for the academic year
                      if (classroom.academic_year) {
                        await loadTermsForAcademicYear(classroom.academic_year);
                      }
                      
                      // Find the grade level for this section and load sections
                      const section = sections.find(s => s.id === classroom.section);
                      if (section && section.grade_level) {
                        initialFormData.grade_level = section.grade_level.toString();
                        await loadSectionsForGradeLevel(section.grade_level);
                        setFormData(initialFormData);
                      }
                      
                      setShowEditModal(true);
                    }}
                    className="p-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg transition-all duration-200 hover:scale-110 group relative"
                    title="Edit Classroom"
                  >
                    <Edit3 size={18} />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      Edit
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteClassroom(classroom)}
                    className="p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-all duration-200 hover:scale-110 group relative"
                    title="Delete Classroom"
                  >
                    <Trash2 size={18} />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      Delete
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className={`${themeClasses.bgCard} rounded-xl shadow-lg border overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${themeClasses.bgSecondary} border-b`}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Classroom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Level</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Section</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Room</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Capacity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Teachers</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClassrooms.map((classroom) => (
                    <tr key={classroom.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{classroom.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{classroom.grade_level_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{classroom.section_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{classroom.room_number || 'Not assigned'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {classroom.current_enrollment}/{classroom.max_capacity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {classroom.teacher_assignments && classroom.teacher_assignments.length > 0 ? (
                          <span className="text-green-600 font-medium">
                            {getUniqueTeacherCount(classroom.teacher_assignments)} assigned
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          classroom.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {classroom.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedClassroom(classroom);
                              setShowViewModal(true);
                            }}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClassroom(classroom);
                              setAssignmentData({ teacher_id: '', subject_id: '' });
                              setAvailableSubjects([]);
                              setSelectedSubjects([]);
                              setIsMultipleSelection(false);
                              setShowAssignTeacherModal(true);
                            }}
                            className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                            title="Assign Teacher"
                          >
                            <UserPlus size={14} />
                          </button>
                          <button
                            onClick={async () => {
                              setSelectedClassroom(classroom);
                              
                              // Set initial form data
                              const initialFormData = {
                                name: classroom.name,
                                grade_level: '', // Will be set after loading sections
                                section: classroom.section.toString(),
                                academic_year: classroom.academic_year.toString(),
                                term: classroom.term.toString(),
                                class_teacher: classroom.class_teacher?.toString() || '',
                                room_number: classroom.room_number,
                                max_capacity: classroom.max_capacity
                              };
                              
                              setFormData(initialFormData);
                              
                              // Load terms for the academic year
                              if (classroom.academic_year) {
                                await loadTermsForAcademicYear(classroom.academic_year);
                              }
                              
                              // Find the grade level for this section and load sections
                              const section = sections.find(s => s.id === classroom.section);
                              if (section && section.grade_level) {
                                initialFormData.grade_level = section.grade_level.toString();
                                await loadSectionsForGradeLevel(section.grade_level);
                                setFormData(initialFormData);
                              }
                              
                              setShowEditModal(true);
                            }}
                            className="p-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg transition-colors"
                            title="Edit Classroom"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClassroom(classroom)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                            title="Delete Classroom"
                          >
                            <Trash2 size={14} />
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

        {filteredClassrooms.length === 0 && !loading && (
          <div className="text-center py-12">
            <School size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No classrooms found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.bgCard} rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <h2 className="text-2xl font-bold mb-4">
              {showAddModal ? 'Add Classroom' : 'Edit Classroom'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Primary 1A, SS1A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Room Number</label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., 101, Lab 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({...formData, max_capacity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Academic Year</label>
                  <select
                    value={formData.academic_year}
                    onChange={(e) => {
                      const academicYearId = e.target.value;
                      setFormData({...formData, academic_year: academicYearId, term: ''});
                      // Load terms for selected academic year
                      if (academicYearId) {
                        loadTermsForAcademicYear(parseInt(academicYearId));
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.map(year => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Term</label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({...formData, term: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    disabled={!formData.academic_year || terms.length === 0}
                  >
                    <option value="">Select Term</option>
                    {terms.map(term => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Grade Level</label>
                  <select
                    value={formData.grade_level || ''}
                    onChange={(e) => {
                      const gradeLevelId = e.target.value;
                      setFormData({...formData, grade_level: gradeLevelId, section: ''});
                      // Load sections for selected grade level
                      if (gradeLevelId) {
                        loadSectionsForGradeLevel(parseInt(gradeLevelId));
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Grade Level</option>
                    {gradeLevels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name} ({level.education_level})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    disabled={!formData.grade_level || sections.length === 0}
                  >
                    <option value="">Select Section</option>
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setFormData({
                      name: '',
                      grade_level: '',
                      section: '',
                      academic_year: '',
                      term: '',
                      class_teacher: '',
                      room_number: '',
                      max_capacity: 30
                    });
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showAddModal ? 'Create Classroom' : 'Update Classroom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignTeacherModal && selectedClassroom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.bgCard} rounded-xl p-6 max-w-md w-full`}>
                         <h2 className="text-2xl font-bold mb-4">Assign Teacher to {selectedClassroom.name}</h2>
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
               <p className="text-sm text-blue-700">
                 <strong>Note:</strong> Only subjects assigned to the teacher in the teacher page will be available for selection.
                 <span className="block mt-1">
                   <strong>Multiple Selection:</strong> You can select multiple subjects to assign to the teacher at once. Use "Select All" to assign all available subjects.
                 </span>
               </p>
             </div>
             <form onSubmit={handleAssignTeacher} className="space-y-4">
                             <div>
                 <label className="block text-sm font-medium mb-1">Teacher</label>
                 <select
                   value={assignmentData.teacher_id}
                   onChange={(e) => {
                     const teacherId = e.target.value;
                     setAssignmentData({...assignmentData, teacher_id: teacherId, subject_id: ''});
                     getAvailableSubjectsForTeacher(teacherId);
                   }}
                   className="w-full px-3 py-2 border rounded-lg"
                   required
                 >
                   <option value="">Select Teacher</option>
                   {teachers.map(teacher => (
                     <option key={teacher.id} value={teacher.id}>
                       {teacher.first_name} {teacher.last_name} ({teacher.employee_id})
                       {teacher.assigned_subjects && teacher.assigned_subjects.length > 0 && 
                         ` - ${teacher.assigned_subjects.length} subjects`
                       }
                     </option>
                   ))}
                 </select>
               </div>
                               <div>
                  <label className="block text-sm font-medium mb-1">
                    Subjects
                    <span className="text-xs text-gray-500 ml-2">
                      ({selectedSubjects.length} selected)
                    </span>
                  </label>
                  
                  {/* Checkbox selection for all education levels */}
                  <div className="space-y-2">
                    {availableSubjects.length > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          id="select-all"
                          checked={selectedSubjects.length === availableSubjects.length && availableSubjects.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                          Select All ({availableSubjects.length} subjects)
                        </label>
                      </div>
                    )}
                    
                    <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                      {availableSubjects.map(subject => (
                        <div key={subject.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`subject-${subject.id}`}
                            checked={selectedSubjects.includes(subject.id)}
                            onChange={() => handleSubjectToggle(subject.id)}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`subject-${subject.id}`} className="text-sm cursor-pointer flex-1">
                            {subject.name} ({subject.code})
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    {assignmentData.teacher_id && availableSubjects.length === 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        This teacher has no subjects assigned. Please assign subjects in the teacher page first.
                      </p>
                    )}
                  </div>
                </div>
              <div className="flex gap-4">
                                 <button
                   type="button"
                   onClick={() => {
                     setShowAssignTeacherModal(false);
                     setAssignmentData({ teacher_id: '', subject_id: '' });
                     setAvailableSubjects([]);
                     setSelectedSubjects([]);
                     setIsMultipleSelection(false);
                   }}
                   className="flex-1 px-4 py-2 border rounded-lg"
                 >
                   Cancel
                 </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      <ClassroomViewModal
        classroom={selectedClassroom}
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        onRemoveAssignment={handleRemoveAssignment}
      />
    </div>
  );
};

export default ClassroomManagement;
