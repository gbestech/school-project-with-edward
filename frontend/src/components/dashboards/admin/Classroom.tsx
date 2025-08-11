import React, { useState, useEffect } from 'react';
import { 
  School,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Users,
  BookOpen,
  Calendar,
  MapPin,
  Clock,
  X,
  Check,
  AlertCircle,
  Baby,
  GraduationCap,
  ChevronDown,
  Save,
  UserCheck,
  Building
} from 'lucide-react';

// Mock subjects data (would typically come from a subjects API)
const mockSubjects = {
  nursery: [
    { id: 1, name: 'Play Activities', code: 'PA' },
    { id: 2, name: 'Early Learning', code: 'EL' },
    { id: 3, name: 'Creative Arts', code: 'CA' },
    { id: 4, name: 'Physical Development', code: 'PD' },
    { id: 5, name: 'Language Development', code: 'LD' }
  ],
  primary: [
    { id: 6, name: 'Mathematics', code: 'MATH' },
    { id: 7, name: 'English Language', code: 'ENG' },
    { id: 8, name: 'Science', code: 'SCI' },
    { id: 9, name: 'Social Studies', code: 'SS' },
    { id: 10, name: 'Physical Education', code: 'PE' },
    { id: 11, name: 'Art & Craft', code: 'ART' },
    { id: 12, name: 'Computer Studies', code: 'CS' },
    { id: 13, name: 'Religious Studies', code: 'RS' }
  ],
  secondary: [
    { id: 14, name: 'Mathematics', code: 'MATH' },
    { id: 15, name: 'English Language', code: 'ENG' },
    { id: 16, name: 'Physics', code: 'PHY' },
    { id: 17, name: 'Chemistry', code: 'CHEM' },
    { id: 18, name: 'Biology', code: 'BIO' },
    { id: 19, name: 'Geography', code: 'GEO' },
    { id: 20, name: 'History', code: 'HIST' },
    { id: 21, name: 'Economics', code: 'ECON' },
    { id: 22, name: 'Government', code: 'GOV' },
    { id: 23, name: 'Literature', code: 'LIT' },
    { id: 24, name: 'Further Mathematics', code: 'FMATH' },
    { id: 25, name: 'Computer Science', code: 'CS' },
    { id: 26, name: 'Technical Drawing', code: 'TD' }
  ]
};

// Mock teachers data
const mockTeachers = [
  { id: 1, name: 'Sarah Johnson', level: 'nursery' },
  { id: 2, name: 'Michael Chen', level: 'secondary' },
  { id: 3, name: 'Emily Rodriguez', level: 'primary' },
  { id: 4, name: 'David Thompson', level: 'secondary' },
  { id: 5, name: 'Lisa Anderson', level: 'nursery' },
  { id: 6, name: 'James Wilson', level: 'primary' },
  { id: 7, name: 'Maria Garcia', level: 'secondary' },
  { id: 8, name: 'Robert Brown', level: 'primary' }
];

// Define Classroom interface
interface Classroom {
  id: number;
  name: string;
  level: 'nursery' | 'primary' | 'secondary';
  grade: string;
  capacity: number;
  currentEnrollment: number;
  room: string;
  building: string;
  classTeacher: string;
  subjects: number[];
  schedule: string;
  academicYear: string;
  status: string;
  createdDate: string;
}

// Mock classroom data
type Level = 'nursery' | 'primary' | 'secondary';

const mockClassrooms: Classroom[] = [
  {
    id: 1,
    name: 'Nursery 1A',
    level: 'nursery',
    grade: 'Nursery 1',
    capacity: 20,
    currentEnrollment: 18,
    room: 'Room 101',
    building: 'Early Learning Block',
    classTeacher: 'Sarah Johnson',
    subjects: [1, 2, 3, 4, 5],
    schedule: 'Morning (8:00 AM - 12:00 PM)',
    academicYear: '2024/2025',
    status: 'active',
    createdDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Primary 4B',
    level: 'primary',
    grade: 'Primary 4',
    capacity: 35,
    currentEnrollment: 32,
    room: 'Room 204',
    building: 'Primary Block',
    classTeacher: 'Emily Rodriguez',
    subjects: [6, 7, 8, 9, 10, 11],
    schedule: 'Full Day (8:00 AM - 3:00 PM)',
    academicYear: '2024/2025',
    status: 'active',
    createdDate: '2024-01-20'
  },
  {
    id: 3,
    name: 'SS2 Science',
    level: 'secondary',
    grade: 'SS 2',
    capacity: 40,
    currentEnrollment: 38,
    room: 'Room 301',
    building: 'Secondary Block',
    classTeacher: 'Michael Chen',
    subjects: [14, 15, 16, 17, 18, 24],
    schedule: 'Full Day (7:30 AM - 3:30 PM)',
    academicYear: '2024/2025',
    status: 'active',
    createdDate: '2024-02-01'
  }
];

const ClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>(mockClassrooms);
  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>(mockClassrooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    level?: string;
    grade?: string;
    capacity?: string;
    room?: string;
    building?: string;
    classTeacher?: string;
    subjects?: string;
    schedule?: string;
  }>({});

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    level: string;
    grade: string;
    capacity: string;
    room: string;
    building: string;
    classTeacher: string;
    subjects: string[];
    schedule: string;
    academicYear: string;
  }>({
    name: '',
    level: '',
    grade: '',
    capacity: '',
    room: '',
    building: '',
    classTeacher: '',
    subjects: [],
    schedule: '',
    academicYear: '2024/2025'
  });

 
  useEffect(() => {
    let filtered = classrooms;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(classroom =>
        classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classroom.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classroom.classTeacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classroom.room.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by level
    if (levelFilter !== 'all') {
      filtered = filtered.filter(classroom => classroom.level === levelFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(classroom => classroom.status === statusFilter);
    }

    setFilteredClassrooms(filtered);
  }, [classrooms, searchTerm, levelFilter, statusFilter]);

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'nursery': return <Baby size={20} />;
      case 'primary': return <BookOpen size={20} />;
      case 'secondary': return <School size={20} />;
      default: return <GraduationCap size={20} />;
    }
  };

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'nursery': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'primary': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'secondary': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradeOptions = (level: string) => {
    switch(level) {
      case 'nursery': return ['Nursery 1', 'Nursery 2'];
      case 'primary': return ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'];
      case 'secondary': return ['JS 1', 'JS 2', 'JS 3', 'SS 1', 'SS 2', 'SS 3'];
      default: return [];
    }
  };

  const getAvailableSubjects = (level: 'nursery' | 'primary' | 'secondary') => {
    return mockSubjects[level] || [];
  };

  const getAvailableTeachers = (level: 'nursery' | 'primary' | 'secondary') => {
    return mockTeachers.filter(teacher => teacher.level === level);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      level: '',
      grade: '',
      capacity: '',
      room: '',
      building: '',
      classTeacher: '',
      subjects: [],
      schedule: '',
      academicYear: '2024/2025'
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      level?: string;
      grade?: string;
      capacity?: string;
      room?: string;
      building?: string;
      classTeacher?: string;
      subjects?: string;
      schedule?: string;
    } = {};

    if (!formData.name.trim()) newErrors.name = 'Classroom name is required';
    if (!formData.level) newErrors.level = 'Level is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (!formData.capacity || Number(formData.capacity) <= 0) newErrors.capacity = 'Valid capacity is required';
    if (!formData.room.trim()) newErrors.room = 'Room number is required';
    if (!formData.building.trim()) newErrors.building = 'Building is required';
    if (!formData.classTeacher) newErrors.classTeacher = 'Class teacher is required';
    if (formData.subjects.length === 0) newErrors.subjects = 'At least one subject must be selected';
    if (!formData.schedule.trim()) newErrors.schedule = 'Schedule is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddClassroom = () => {
    if (!validateForm()) return;

    const newClassroom: Classroom = {
      ...formData,
      id: Math.max(...classrooms.map(c => c.id)) + 1,
      currentEnrollment: 0,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      subjects: formData.subjects.map((id: string) => parseInt(id)),
      capacity: Number(formData.capacity),
      level: formData.level as Level, // Cast level
    };

    setClassrooms([...classrooms, newClassroom]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditClassroom = () => {
    if (!validateForm()) return;

    const updatedClassrooms = classrooms.map(classroom =>
      classroom.id === selectedClassroom?.id
        ? { ...classroom, ...formData, subjects: formData.subjects.map((id: string) => parseInt(id)), capacity: Number(formData.capacity), level: formData.level as Level }
        : classroom
    );

    setClassrooms(updatedClassrooms);
    setShowEditModal(false);
    setSelectedClassroom(null);
    resetForm();
  };

  const handleDeleteClassroom = () => {
    setClassrooms(classrooms.filter(c => c.id !== classroomToDelete?.id));
    setShowDeleteModal(false);
    setClassroomToDelete(null);
  };

  const openEditModal = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setFormData({
      name: classroom.name,
      level: classroom.level,
      grade: classroom.grade,
      capacity: classroom.capacity.toString(),
      room: classroom.room,
      building: classroom.building,
      classTeacher: classroom.classTeacher,
      subjects: classroom.subjects.map((id: number) => id.toString()),
      schedule: classroom.schedule,
      academicYear: classroom.academicYear
    });
    setShowEditModal(true);
  };

  const openViewModal = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setShowViewModal(true);
  };

  const getSubjectNames = (subjectIds: number[]) => {
    const allSubjects = [...mockSubjects.nursery, ...mockSubjects.primary, ...mockSubjects.secondary];
    return subjectIds.map(id => {
      const subject = allSubjects.find(s => s.id === id);
      return subject ? subject.name : 'Unknown Subject';
    });
  };

  const getStats = () => {
    const total = classrooms.length;
    const active = classrooms.filter(c => c.status === 'active').length;
    const nursery = classrooms.filter(c => c.level === 'nursery').length;
    const primary = classrooms.filter(c => c.level === 'primary').length;
    const secondary = classrooms.filter(c => c.level === 'secondary').length;
    const totalEnrollment = classrooms.reduce((sum, c) => sum + c.currentEnrollment, 0);

    return { total, active, nursery, primary, secondary, totalEnrollment };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Classroom Management</h1>
              <p className="text-gray-600">Manage classrooms across all educational levels</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus size={20} />
              Add Classroom
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex flex-col justify-center items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <School size={24} />
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Check size={24} />
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-pink-100 text-pink-600">
                <Baby size={24} />
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Nursery</p>
                <p className="text-2xl font-bold text-gray-900">{stats.nursery}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <BookOpen size={24} />
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Primary</p>
                <p className="text-2xl font-bold text-gray-900">{stats.primary}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <School size={24} />
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Secondary</p>
                <p className="text-2xl font-bold text-gray-900">{stats.secondary}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Users size={24} />
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollment}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search classrooms by name, grade, teacher, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="all">All Levels</option>
                  <option value="nursery">Nursery</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </select>
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Classrooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((classroom) => (
            <div
              key={classroom.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getLevelColor(classroom.level)}`}>
                      {getLevelIcon(classroom.level)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{classroom.name}</h3>
                      <p className="text-blue-600 font-semibold">{classroom.grade}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    classroom.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {classroom.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <UserCheck size={16} className="mr-2" />
                    <span className="text-sm">{classroom.classTeacher}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    <span className="text-sm">{classroom.room}, {classroom.building}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users size={16} className="mr-2" />
                    <span className="text-sm">{classroom.currentEnrollment}/{classroom.capacity} students</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm">{classroom.schedule}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <BookOpen size={16} className="mr-2" />
                    <span className="text-sm">{classroom.subjects.length} subjects</span>
                  </div>
                </div>

                {/* Enrollment Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Enrollment</span>
                    <span>{Math.round((classroom.currentEnrollment / classroom.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(classroom.currentEnrollment / classroom.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openViewModal(classroom)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors duration-200"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => openEditModal(classroom)}
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors duration-200"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setClassroomToDelete(classroom);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClassrooms.length === 0 && (
          <div className="text-center py-12">
            <School size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No classrooms found matching your criteria.</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Classroom Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {showAddModal ? 'Add New Classroom' : 'Edit Classroom'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classroom Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="e.g., Primary 4A, SS2 Science"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Educational Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value, grade: '', subjects: []})}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.level ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Level</option>
                  <option value="nursery">Nursery</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </select>
                {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.grade ? 'border-red-500' : 'border-gray-200'
                  }`}
                  disabled={!formData.level}
                >
                  <option value="">Select Grade</option>
                  {getGradeOptions(formData.level).map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.capacity ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Maximum number of students"
                  min="1"
                />
                {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number *
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.room ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="e.g., 101, Room 204"
                />
                {errors.room && <p className="text-red-500 text-sm mt-1">{errors.room}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building *
                </label>
                <input
                  type="text"
                  value={formData.building}
                  onChange={(e) => setFormData({...formData, building: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.building ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="e.g., Early Learning Block, Primary Block"
                />
                {errors.building && <p className="text-red-500 text-sm mt-1">{errors.building}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Teacher *
                </label>
                <input
                  type="text"
                  value={formData.classTeacher}
                  onChange={(e) => setFormData({...formData, classTeacher: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.classTeacher ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="e.g., Sarah Johnson, Emily Rodriguez"
                />
                {errors.classTeacher && <p className="text-red-500 text-sm mt-1">{errors.classTeacher}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjects *
                </label>
                <select
                  multiple
                  value={formData.subjects}
                  onChange={(e) => setFormData({...formData, subjects: Array.from(e.target.selectedOptions, option => option.value)})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  {getAvailableSubjects(formData.level as Level).map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
                {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule *
                </label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.schedule ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="e.g., Morning (8:00 AM - 12:00 PM), Full Day (8:00 AM - 3:00 PM)"
                />
                {errors.schedule && <p className="text-red-500 text-sm mt-1">{errors.schedule}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year *
                </label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 2024/2025"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="px-6 py-3 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:border-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={showAddModal ? handleAddClassroom : handleEditClassroom}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {showAddModal ? <Plus size={20} /> : <Save size={20} />}
                {showAddModal ? 'Add Classroom' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Confirm Deletion</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the classroom "{selectedClassroom?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-3 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:border-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClassroom}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Trash2 size={20} />
                Delete Classroom
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Classroom Modal */}
      {showViewModal && selectedClassroom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Classroom Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Classroom Name:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClassroom.name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Educational Level:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClassroom.level.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Grade:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClassroom.grade}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Capacity:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClassroom.capacity}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Current Enrollment:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClassroom.currentEnrollment}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Room:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClassroom.room}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Building:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClassroom.building}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Class Teacher:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClassroom.classTeacher}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Subjects:</p>
                <p className="text-lg font-semibold text-gray-900">{getSubjectNames(selectedClassroom.subjects).join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Schedule:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClassroom.schedule}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Academic Year:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClassroom.academicYear}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Status:</p>
                <p className={`text-lg font-semibold ${
                  selectedClassroom.status === 'active' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {selectedClassroom.status.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Created Date:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClassroom.createdDate}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomManagement;