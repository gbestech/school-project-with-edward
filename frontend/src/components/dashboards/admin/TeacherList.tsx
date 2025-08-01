import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Plus, 
  Mail, 
  Phone, 
  GraduationCap,
  Calendar,
  X,
  Check,
  AlertCircle,
  BookOpen,
  Baby,
  School,
  Award,
  Grid3X3,
  List
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  level: 'nursery' | 'primary' | 'secondary';
  grade: string;
  hireDate: string;
  status: 'active' | 'inactive';
  avatar: string;
  experience: string;
  qualification: string;
  classSize: number;
}

// Mock data for demonstration - Updated for nursery, primary, and secondary
const mockTeachers: Teacher[] = [
  {
    id: 1,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@brightfuture.edu',
    phone: '+1 (555) 123-4567',
    subject: 'Early Childhood Development',
    level: 'nursery',
    grade: 'Nursery 1',
    hireDate: '2020-08-15',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    experience: '8 years',
    qualification: 'B.Ed Early Childhood Education',
    classSize: 15
  },
  {
    id: 2,
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@brightfuture.edu',
    phone: '+1 (555) 234-5678',
    subject: 'Mathematics',
    level: 'secondary',
    grade: 'SS 2',
    hireDate: '2019-01-20',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    experience: '12 years',
    qualification: 'M.Sc Mathematics, B.Ed',
    classSize: 35
  },
  {
    id: 3,
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@brightfuture.edu',
    phone: '+1 (555) 345-6789',
    subject: 'English Language',
    level: 'primary',
    grade: 'Primary 4',
    hireDate: '2021-09-01',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    experience: '5 years',
    qualification: 'B.A English, PGDE',
    classSize: 28
  },
  {
    id: 4,
    firstName: 'David',
    lastName: 'Thompson',
    email: 'david.thompson@brightfuture.edu',
    phone: '+1 (555) 456-7890',
    subject: 'Physics',
    level: 'secondary',
    grade: 'SS 3',
    hireDate: '2018-03-15',
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    experience: '15 years',
    qualification: 'M.Sc Physics, B.Ed',
    classSize: 32
  },
  {
    id: 5,
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@brightfuture.edu',
    phone: '+1 (555) 567-8901',
    subject: 'General Studies',
    level: 'nursery',
    grade: 'Nursery 2',
    hireDate: '2022-01-10',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
    experience: '3 years',
    qualification: 'B.Ed Early Childhood Education',
    classSize: 18
  },
  {
    id: 6,
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@brightfuture.edu',
    phone: '+1 (555) 678-9012',
    subject: 'Social Studies',
    level: 'primary',
    grade: 'Primary 6',
    hireDate: '2020-02-01',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    experience: '7 years',
    qualification: 'B.A History, PGDE',
    classSize: 30
  },
  {
    id: 7,
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@brightfuture.edu',
    phone: '+1 (555) 789-0123',
    subject: 'Biology',
    level: 'secondary',
    grade: 'JS 3',
    hireDate: '2021-05-15',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    experience: '4 years',
    qualification: 'B.Sc Biology, B.Ed',
    classSize: 33
  },
  {
    id: 8,
    firstName: 'Robert',
    lastName: 'Brown',
    email: 'robert.brown@brightfuture.edu',
    phone: '+1 (555) 890-1234',
    subject: 'Creative Arts',
    level: 'primary',
    grade: 'Primary 1',
    hireDate: '2019-09-01',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    experience: '9 years',
    qualification: 'B.A Fine Arts, PGDE',
    classSize: 25
  }
];

const TeacherList = () => {
  const { settings } = useSettings();
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>(mockTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  useEffect(() => {
    let filtered = teachers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.grade.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(teacher => teacher.status === statusFilter);
    }

    // Filter by level
    if (levelFilter !== 'all') {
      filtered = filtered.filter(teacher => teacher.level === levelFilter);
    }

    setFilteredTeachers(filtered);
  }, [teachers, searchTerm, statusFilter, levelFilter]);

  const handleDelete = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      setTeachers(teachers.filter(t => t.id !== teacherToDelete.id));
      setShowDeleteModal(false);
      setTeacherToDelete(null);
    }
  };

  const handleViewProfile = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowProfile(true);
  };

  const handleEdit = (teacher: Teacher) => {
    console.log('Edit teacher:', teacher);
    alert(`Edit functionality for ${teacher.firstName} ${teacher.lastName} would be implemented here`);
  };

  const getLevelIcon = (level: 'nursery' | 'primary' | 'secondary') => {
    switch(level) {
      case 'nursery': return <Baby size={14} className="mr-1" />;
      case 'primary': return <BookOpen size={14} className="mr-1" />;
      case 'secondary': return <School size={14} className="mr-1" />;
      default: return <GraduationCap size={14} className="mr-1" />;
    }
  };

  const getLevelColor = (level: 'nursery' | 'primary' | 'secondary') => {
    switch(level) {
      case 'nursery': return 'bg-pink-100 text-pink-800';
      case 'primary': return 'bg-blue-100 text-blue-800';
      case 'secondary': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelStats = () => {
    const nursery = teachers.filter(t => t.level === 'nursery' && t.status === 'active').length;
    const primary = teachers.filter(t => t.level === 'primary' && t.status === 'active').length;
    const secondary = teachers.filter(t => t.level === 'secondary' && t.status === 'active').length;
    return { nursery, primary, secondary };
  };

  const levelStats = getLevelStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{settings?.school_name || "God's Treasure Schools"}</h1>
              <p className="text-gray-600">Teacher Management System - Nursery, Primary & Secondary</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users size={24} />
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{levelStats.nursery}</p>
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
                <p className="text-2xl font-bold text-gray-900">{levelStats.primary}</p>
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
                <p className="text-2xl font-bold text-gray-900">{levelStats.secondary}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {teachers.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter, and View Toggle */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search teachers by name, email, subject, or grade..."
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
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    viewMode === 'cards'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Grid3X3 size={18} />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <List size={18} />
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Display */}
        {viewMode === 'cards' ? (
          /* Improved Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col"
                style={{ minHeight: '480px' }}
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={teacher.avatar}
                      alt={`${teacher.firstName} ${teacher.lastName}`}
                      className="w-16 h-16 rounded-full object-cover border-4 border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                        {teacher.firstName} {teacher.lastName}
                      </h3>
                      <p className="text-blue-600 font-semibold text-sm mb-3 leading-tight">
                        {teacher.subject}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getLevelColor(teacher.level)}`}>
                          {getLevelIcon(teacher.level)}
                          {teacher.level.charAt(0).toUpperCase() + teacher.level.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          teacher.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {teacher.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 pb-4 flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <GraduationCap size={16} className="mr-3 flex-shrink-0 text-gray-400" />
                      <span className="text-sm font-medium">{teacher.grade}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Users size={16} className="mr-3 flex-shrink-0 text-gray-400" />
                      <span className="text-sm">Class Size: {teacher.classSize} students</span>
                    </div>
                    
                    <div className="flex items-start text-gray-600">
                      <Mail size={16} className="mr-3 flex-shrink-0 text-gray-400 mt-0.5" />
                      <span className="text-sm break-all leading-relaxed">{teacher.email}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Phone size={16} className="mr-3 flex-shrink-0 text-gray-400" />
                      <span className="text-sm">{teacher.phone}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Award size={16} className="mr-3 flex-shrink-0 text-gray-400" />
                      <span className="text-sm">{teacher.experience} experience</span>
                    </div>
                    
                    <div className="flex items-start text-gray-600">
                      <Calendar size={16} className="mr-3 flex-shrink-0 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium block">Qualification:</span>
                        <span className="text-sm text-gray-500 leading-relaxed">{teacher.qualification}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 mt-auto">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewProfile(teacher)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors duration-200 text-sm"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors duration-200 text-sm"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors duration-200 text-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Subject & Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={teacher.avatar}
                            alt={`${teacher.firstName} ${teacher.lastName}`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">
                              {teacher.firstName} {teacher.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              TCH-{teacher.id.toString().padStart(4, '0')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{teacher.subject}</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(teacher.level)}`}>
                          {getLevelIcon(teacher.level)}
                          {teacher.level.charAt(0).toUpperCase() + teacher.level.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{teacher.grade}</div>
                        <div className="text-sm text-gray-500">{teacher.classSize} students</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{teacher.email}</div>
                        <div className="text-sm text-gray-500">{teacher.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{teacher.experience}</div>
                        <div className="text-sm text-gray-500">{teacher.qualification}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          teacher.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {teacher.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProfile(teacher)}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors duration-200"
                            title="View Profile"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="text-green-600 hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors duration-200"
                            title="Edit Teacher"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher)}
                            className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                            title="Delete Teacher"
                          >
                            <Trash2 size={16} />
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

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No teachers found matching your criteria.</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Teacher</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{' '}
                <span className="font-semibold">
                  {teacherToDelete?.firstName} {teacherToDelete?.lastName}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Profile Modal */}
      {showProfile && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Teacher Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="text-center md:text-left">
                <img
                  src={selectedTeacher.avatar}
                  alt={`${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
                  className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0 border-4 border-gray-100 mb-4"
                />
                <div className="flex flex-col gap-2">
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold ${getLevelColor(selectedTeacher.level)}`}>
                    {getLevelIcon(selectedTeacher.level)}
                    {selectedTeacher.level.charAt(0).toUpperCase() + selectedTeacher.level.slice(1)}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedTeacher.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedTeacher.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedTeacher.firstName} {selectedTeacher.lastName}
                </h3>
                <p className="text-blue-600 font-semibold text-lg mb-4">{selectedTeacher.subject}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedTeacher.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{selectedTeacher.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade/Class</label>
                    <p className="text-gray-900">{selectedTeacher.grade}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Size</label>
                    <p className="text-gray-900">{selectedTeacher.classSize} students</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <p className="text-gray-900">{selectedTeacher.experience}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <p className="text-gray-900">{selectedTeacher.qualification}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                    <p className="text-gray-900">{new Date(selectedTeacher.hireDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID</label>
                    <p className="text-gray-900">TCH-{selectedTeacher.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      handleEdit(selectedTeacher);
                      setShowProfile(false);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200"
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherList;