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
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import TeacherService, { Teacher as TeacherType } from '@/services/TeacherService';
import { toast } from 'react-toastify';

interface Teacher {
  id: number;
  employee_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  staff_type: 'teaching' | 'non-teaching';
  level: 'nursery' | 'primary' | 'secondary' | '' | null;
  hire_date: string;
  qualification: string;
  specialization: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  photo?: string; // Profile picture URL
  assigned_subjects: Array<{
    id: number;
    name: string;
  }>;
  teacher_assignments?: Array<{
    id: number;
    grade_level_name: string;
    section_name: string;
    subject_name: string;
    education_level: string; // Added for detailed assignments
  }>;
}

const TeacherList = () => {
  const { settings } = useSettings();
  const { theme } = useGlobalTheme();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme-aware color classes
  const isDark = theme === 'dark';
  
  const themeClasses = {
    bgPrimary: isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100',
    bgCard: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100',
    bgModal: isDark ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDark ? 'text-gray-400' : 'text-gray-500',
    textMuted: isDark ? 'text-gray-500' : 'text-gray-400',
    borderPrimary: isDark ? 'border-gray-700' : 'border-gray-200',
    inputBg: isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200',
    inputFocus: isDark ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500',
    hoverCard: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    statusActive: isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800',
    statusInactive: isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800',
    levelNursery: isDark ? 'bg-pink-900 text-pink-300' : 'bg-pink-100 text-pink-800',
    levelPrimary: isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800',
    levelSecondary: isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800',
    iconPrimary: isDark ? 'text-blue-400' : 'text-blue-600',
    iconSecondary: isDark ? 'text-gray-400' : 'text-gray-400',
    iconSuccess: isDark ? 'text-green-400' : 'text-green-600',
    iconDanger: isDark ? 'text-red-400' : 'text-red-600',
    btnPrimary: isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
    btnSecondary: isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    btnSuccess: isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white',
    btnDanger: isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white',
    actionView: isDark ? 'bg-blue-900 hover:bg-blue-800 text-blue-300' : 'bg-blue-50 hover:bg-blue-100 text-blue-700',
    actionEdit: isDark ? 'bg-green-900 hover:bg-green-800 text-green-300' : 'bg-green-50 hover:bg-green-100 text-green-700',
    actionDelete: isDark ? 'bg-red-900 hover:bg-red-800 text-red-300' : 'bg-red-50 hover:bg-red-100 text-red-700',
  };

  // Load teachers data
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await TeacherService.getTeachers();
        console.log('TeacherService response:', response);
        const teachersData = Array.isArray(response.results) ? response.results : 
                           Array.isArray(response) ? response : [];
        console.log('Processed teachers data:', teachersData);
        setTeachers(teachersData);
        setFilteredTeachers(teachersData);
      } catch (err: any) {
        console.error('Error loading teachers:', err);
        setError(err.response?.data?.message || 'Failed to load teachers');
        toast.error('Failed to load teachers');
        setTeachers([]);
        setFilteredTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, []);

  // Filter teachers
  useEffect(() => {
    let filtered = Array.isArray(teachers) ? teachers : [];

    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.assigned_subjects && teacher.assigned_subjects.some(subject => 
          subject.name.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        teacher.qualification.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(teacher => 
        statusFilter === 'active' ? teacher.is_active : !teacher.is_active
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(teacher => teacher.level === levelFilter);
    }

    setFilteredTeachers(filtered);
  }, [teachers, searchTerm, statusFilter, levelFilter]);

  const handleDelete = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (teacherToDelete) {
      try {
        console.log('Attempting to delete teacher:', teacherToDelete.id);
        await TeacherService.deleteTeacher(teacherToDelete.id);
        
        // Update the UI immediately after successful deletion
        const teachersArray = Array.isArray(teachers) ? teachers : [];
        const updatedTeachers = teachersArray.filter(t => t.id !== teacherToDelete.id);
        setTeachers(updatedTeachers);
        
        // Close modal and reset state
        setShowDeleteModal(false);
        setTeacherToDelete(null);
        
        // Show success message
        toast.success('Teacher deleted successfully');
        
        console.log('Teacher deleted successfully, UI updated');
      } catch (err: any) {
        console.error('Error deleting teacher:', err);
        
        // Show detailed error message
        const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           err.message || 
                           'Failed to delete teacher';
        
        toast.error(errorMessage);
        
        // Keep modal open on error so user can try again
        console.log('Delete failed, keeping modal open');
      }
    }
  };

  const handleViewProfile = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowProfile(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setTeacherToEdit(teacher);
    setShowEditModal(true);
  };

  const handleUpdateTeacher = async (updatedData: Partial<Teacher>) => {
    if (!teacherToEdit) return;
    
    try {
      // Convert level to the expected type
      const processedData = {
        ...updatedData,
        level: updatedData.level === '' ? undefined : updatedData.level
      };
      
      const updatedTeacher = await TeacherService.updateTeacher(teacherToEdit.id, processedData);
      
      // Update the teachers list with the updated teacher
      const teachersArray = Array.isArray(teachers) ? teachers : [];
      setTeachers(teachersArray.map(t => 
        t.id === teacherToEdit.id ? { ...t, ...updatedTeacher } : t
      ));
      
      setShowEditModal(false);
      setTeacherToEdit(null);
      toast.success('Teacher updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update teacher');
    }
  };

  const handleToggleActive = async (teacher: Teacher) => {
    try {
      if (teacher.is_active) {
        await TeacherService.deactivateTeacher(teacher.id);
      } else {
        await TeacherService.activateTeacher(teacher.id);
      }
      
      // Update the teacher's active status in the list
      const teachersArray = Array.isArray(teachers) ? teachers : [];
      setTeachers(teachersArray.map(t => 
        t.id === teacher.id ? { ...t, is_active: !t.is_active } : t
      ));
      
      toast.success(`Teacher ${teacher.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update teacher status');
    }
  };

  const getLevelIcon = (level: 'nursery' | 'primary' | 'secondary' | null) => {
    switch(level) {
      case 'nursery': return <Baby size={14} className="mr-1" />;
      case 'primary': return <BookOpen size={14} className="mr-1" />;
      case 'secondary': return <School size={14} className="mr-1" />;
      default: return <GraduationCap size={14} className="mr-1" />;
    }
  };

  const getLevelColor = (level: 'nursery' | 'primary' | 'secondary' | null) => {
    switch(level) {
      case 'nursery': return themeClasses.levelNursery;
      case 'primary': return themeClasses.levelPrimary;
      case 'secondary': return themeClasses.levelSecondary;
      default: return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelStats = () => {
    const teachersArray = Array.isArray(teachers) ? teachers : [];
    const nursery = teachersArray.filter(t => t.level === 'nursery' && t.is_active).length;
    const primary = teachersArray.filter(t => t.level === 'primary' && t.is_active).length;
    const secondary = teachersArray.filter(t => t.level === 'secondary' && t.is_active).length;
    return { nursery, primary, secondary };
  };

  const levelStats = getLevelStats();

  // Helper function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Enhanced profile picture rendering with debugging
  const renderProfilePicture = (teacher: Teacher) => {
    console.log(`🖼️ Rendering profile for ${teacher.first_name} ${teacher.last_name}:`, teacher.photo);
    
    if (teacher.photo) {
      // Check if it's a full URL or just a path
      const imageUrl = teacher.photo.startsWith('http') 
        ? teacher.photo 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${teacher.photo}`;
      
      console.log(`🖼️ Final image URL for ${teacher.first_name} ${teacher.last_name}:`, imageUrl);
      
      return (
        <img
          src={imageUrl}
          alt={`${teacher.first_name} ${teacher.last_name}`}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          onError={(e) => {
            console.error(`❌ Failed to load image for ${teacher.first_name} ${teacher.last_name}:`, imageUrl);
            // Hide the broken image and show initials instead
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
          onLoad={() => {
            console.log(`✅ Successfully loaded image for ${teacher.first_name} ${teacher.last_name}`);
          }}
        />
      );
    }
    
    return null;
  };

  const renderInitialsAvatar = (teacher: Teacher) => {
    return (
      <div className={`w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center ${teacher.photo ? 'hidden' : ''}`}>
        <span className="text-lg font-bold text-white">
          {getInitials(teacher.first_name, teacher.last_name)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPrimary} p-6 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={`${themeClasses.textSecondary}`}>Loading teachers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPrimary} p-6 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle size={48} className={`mx-auto ${themeClasses.textMuted} mb-4`} />
            <p className={`${themeClasses.textSecondary} text-lg`}>Error loading teachers</p>
            <p className={`${themeClasses.textTertiary} text-sm mt-2`}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={`mt-4 px-4 py-2 ${themeClasses.btnPrimary} rounded-lg`}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bgPrimary} p-6 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className={`text-4xl font-bold ${themeClasses.textPrimary} mb-2 transition-colors duration-300`}>
                {settings?.school_name || "God's Treasure School"}
              </h1>
              <p className={`${themeClasses.textSecondary} transition-colors duration-300`}>
                Teacher Management System - Nursery, Primary & Secondary
              </p>
            </div>

          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                <Users size={24} />
              </div>
              <div className="ml-4">
                <p className={`${themeClasses.textSecondary} text-sm`}>Total Teachers</p>
                <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{teachers.length}</p>
              </div>
            </div>
          </div>
          
          <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${isDark ? 'bg-pink-900 text-pink-300' : 'bg-pink-100 text-pink-600'}`}>
                <Baby size={24} />
              </div>
              <div className="ml-4">
                <p className={`${themeClasses.textSecondary} text-sm`}>Nursery</p>
                <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{levelStats.nursery}</p>
              </div>
            </div>
          </div>

          <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                <BookOpen size={24} />
              </div>
              <div className="ml-4">
                <p className={`${themeClasses.textSecondary} text-sm`}>Primary</p>
                <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{levelStats.primary}</p>
              </div>
            </div>
          </div>

          <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>
                <School size={24} />
              </div>
              <div className="ml-4">
                <p className={`${themeClasses.textSecondary} text-sm`}>Secondary</p>
                <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{levelStats.secondary}</p>
              </div>
            </div>
          </div>

          <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600'}`}>
                <Check size={24} />
              </div>
              <div className="ml-4">
                <p className={`${themeClasses.textSecondary} text-sm`}>Active</p>
                <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>
                  {teachers.filter(t => t.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border mb-8 transition-all duration-300`}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-3 ${themeClasses.textMuted}`} size={20} />
              <input
                type="text"
                placeholder="Search teachers by name, email, subject, or qualification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.inputBg} ${themeClasses.inputFocus} ${themeClasses.textPrimary}`}
              />
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Filter className={`absolute left-3 top-3 ${themeClasses.textMuted}`} size={20} />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className={`pl-10 pr-8 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.inputBg} ${themeClasses.inputFocus} ${themeClasses.textPrimary}`}
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
                  className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.inputBg} ${themeClasses.inputFocus} ${themeClasses.textPrimary}`}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className={`flex ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1 transition-all duration-300`}>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    viewMode === 'cards'
                      ? `${isDark ? 'bg-gray-600 text-blue-300' : 'bg-white text-blue-600'} shadow-sm`
                      : `${themeClasses.textSecondary} hover:text-blue-600`
                  }`}
                >
                  <Grid3X3 size={18} />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? `${isDark ? 'bg-gray-600 text-blue-300' : 'bg-white text-blue-600'} shadow-sm`
                      : `${themeClasses.textSecondary} hover:text-blue-600`
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className={`${themeClasses.bgCard} rounded-xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col`}
                style={{ minHeight: '480px' }}
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 relative">
                      {renderProfilePicture(teacher)}
                      {renderInitialsAvatar(teacher)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-bold ${themeClasses.textPrimary} leading-tight mb-1`}>
                        {teacher.first_name} {teacher.last_name}
                      </h3>
                      <p className={`${themeClasses.iconPrimary} font-semibold text-sm mb-3 leading-tight`}>
                        {teacher.staff_type === 'teaching' ? 'Teaching Staff' : 'Non-Teaching Staff'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {teacher.level && (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getLevelColor(teacher.level)}`}>
                            {getLevelIcon(teacher.level)}
                            {teacher.level.charAt(0).toUpperCase() + teacher.level.slice(1)}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          teacher.is_active 
                            ? themeClasses.statusActive
                            : themeClasses.statusInactive
                        }`}>
                          {teacher.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 pb-4 flex-1">
                  <div className="space-y-3">
                    <div className={`flex items-center ${themeClasses.textSecondary}`}>
                      <Mail size={16} className={`mr-3 flex-shrink-0 ${themeClasses.iconSecondary}`} />
                      <span className="text-sm break-all leading-relaxed">{teacher.email}</span>
                    </div>
                    
                    <div className={`flex items-center ${themeClasses.textSecondary}`}>
                      <Phone size={16} className={`mr-3 flex-shrink-0 ${themeClasses.iconSecondary}`} />
                      <span className="text-sm">{teacher.phone_number || 'No phone'}</span>
                    </div>
                    
                    <div className={`flex items-start ${themeClasses.textSecondary}`}>
                      <Award size={16} className={`mr-3 flex-shrink-0 ${themeClasses.iconSecondary} mt-0.5`} />
                      <span className="text-sm">{teacher.qualification || 'No qualification'}</span>
                    </div>
                    
                    <div className={`flex items-start ${themeClasses.textSecondary}`}>
                      <Calendar size={16} className={`mr-3 flex-shrink-0 ${themeClasses.iconSecondary} mt-0.5`} />
                      <div>
                        <span className="text-sm font-medium block">Hire Date:</span>
                        <span className="text-sm text-gray-500 leading-relaxed">
                          {new Date(teacher.hire_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {teacher.assigned_subjects.length > 0 && (
                      <div className={`flex items-start ${themeClasses.textSecondary}`}>
                        <BookOpen size={16} className={`mr-3 flex-shrink-0 ${themeClasses.iconSecondary} mt-0.5`} />
                        <div>
                          <span className="text-sm font-medium block">Subjects:</span>
                          <span className="text-sm text-gray-500 leading-relaxed">
                            {teacher.assigned_subjects.map(s => s.name).join(', ')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Display detailed assignments if available */}
                    {teacher.teacher_assignments && teacher.teacher_assignments.length > 0 && (
                      <div className={`flex items-start ${themeClasses.textSecondary}`}>
                        <BookOpen size={16} className={`mr-3 flex-shrink-0 ${themeClasses.iconSecondary} mt-0.5`} />
                        <div>
                          <span className="text-sm font-medium block">Assignments:</span>
                          <div className="text-xs text-gray-500 space-y-1 mt-1">
                            {teacher.teacher_assignments.slice(0, 2).map((assignment, idx) => (
                              <div key={idx} className="flex items-center">
                                <span className="bg-blue-100 text-blue-800 px-1 rounded text-xs mr-1">
                                  {assignment.grade_level_name} {assignment.section_name}
                                </span>
                                <span>{assignment.subject_name}</span>
                              </div>
                            ))}
                            {teacher.teacher_assignments.length > 2 && (
                              <div className="text-xs text-blue-600">
                                +{teacher.teacher_assignments.length - 2} more assignments
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 mt-auto">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewProfile(teacher)}
                      className={`flex-1 px-3 py-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors duration-200 text-sm ${themeClasses.actionView}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(teacher)}
                      className={`flex-1 px-3 py-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors duration-200 text-sm ${themeClasses.actionEdit}`}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher)}
                      className={`flex-1 px-3 py-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors duration-200 text-sm ${themeClasses.actionDelete}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`${themeClasses.bgCard} rounded-xl shadow-lg border overflow-hidden transition-all duration-300`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} ${themeClasses.borderPrimary} border-b`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                      Teacher
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                      Contact
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                      Level & Type
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                      Qualification
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${themeClasses.borderPrimary}`}>
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className={`${themeClasses.hoverCard} transition-colors duration-200`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative">
                            {teacher.photo ? (
                              <img
                                src={teacher.photo.startsWith('http') ? teacher.photo : `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${teacher.photo}`}
                                alt={`${teacher.first_name} ${teacher.last_name}`}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center ${teacher.photo ? 'hidden' : ''}`}>
                              <span className="text-sm font-bold text-white">
                                {getInitials(teacher.first_name, teacher.last_name)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-bold ${themeClasses.textPrimary}`}>
                              {teacher.first_name} {teacher.last_name}
                            </div>
                            <div className={`text-sm ${themeClasses.textTertiary}`}>
                              {teacher.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${themeClasses.textPrimary}`}>{teacher.phone_number || 'No phone'}</div>
                        <div className={`text-sm ${themeClasses.textTertiary}`}>{teacher.address || 'No address'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${themeClasses.iconPrimary}`}>
                          {teacher.staff_type === 'teaching' ? 'Teaching' : 'Non-Teaching'}
                        </div>
                        {teacher.level && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(teacher.level)}`}>
                            {getLevelIcon(teacher.level)}
                            {teacher.level.charAt(0).toUpperCase() + teacher.level.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${themeClasses.textPrimary}`}>{teacher.qualification || 'No qualification'}</div>
                        <div className={`text-sm ${themeClasses.textTertiary}`}>{teacher.specialization || 'No specialization'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          teacher.is_active 
                            ? themeClasses.statusActive
                            : themeClasses.statusInactive
                        }`}>
                          {teacher.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProfile(teacher)}
                            className={`${themeClasses.iconPrimary} hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors duration-200`}
                            title="View Profile"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(teacher)}
                            className={`${themeClasses.iconSuccess} hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors duration-200`}
                            title="Edit Teacher"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher)}
                            className={`${themeClasses.iconDanger} hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200`}
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
            <Users size={48} className={`mx-auto ${themeClasses.textMuted} mb-4`} />
            <p className={`${themeClasses.textSecondary} text-lg`}>No teachers found matching your criteria.</p>
            <p className={`${themeClasses.textTertiary} text-sm mt-2`}>Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.bgModal} rounded-xl p-6 max-w-md w-full transition-all duration-300`}>
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isDark ? 'bg-red-900' : 'bg-red-100'} mb-4`}>
                <AlertCircle className={`h-6 w-6 ${isDark ? 'text-red-300' : 'text-red-600'}`} />
              </div>
              <h3 className={`text-lg font-bold ${themeClasses.textPrimary} mb-2`}>Delete Teacher</h3>
              <p className={`${themeClasses.textSecondary} mb-6`}>
                Are you sure you want to delete{' '}
                <span className="font-semibold">
                  {teacherToDelete?.first_name} {teacherToDelete?.last_name}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors duration-200 ${themeClasses.btnSecondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${themeClasses.btnDanger}`}
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
          <div className={`${themeClasses.bgModal} rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${themeClasses.textPrimary}`}>Teacher Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className={`p-2 ${themeClasses.hoverCard} rounded-full transition-colors duration-200`}
              >
                <X size={24} className={themeClasses.textSecondary} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="text-center md:text-left">
                <div className="mx-auto md:mx-0 mb-4 relative">
                  {selectedTeacher.photo ? (
                    <img
                      src={selectedTeacher.photo.startsWith('http') ? selectedTeacher.photo : `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${selectedTeacher.photo}`}
                      alt={`${selectedTeacher.first_name} ${selectedTeacher.last_name}`}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center ${selectedTeacher.photo ? 'hidden' : ''}`}>
                    <span className="text-3xl font-bold text-white">
                      {getInitials(selectedTeacher.first_name, selectedTeacher.last_name)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {selectedTeacher.level && (
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold ${getLevelColor(selectedTeacher.level)}`}>
                      {getLevelIcon(selectedTeacher.level)}
                      {selectedTeacher.level.charAt(0).toUpperCase() + selectedTeacher.level.slice(1)}
                    </span>
                  )}
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedTeacher.is_active 
                      ? themeClasses.statusActive
                      : themeClasses.statusInactive
                  }`}>
                    {selectedTeacher.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <h3 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-2`}>
                  {selectedTeacher.first_name} {selectedTeacher.last_name}
                </h3>
                <p className={`${themeClasses.iconPrimary} font-semibold text-lg mb-4`}>
                  {selectedTeacher.staff_type === 'teaching' ? 'Teaching Staff' : 'Non-Teaching Staff'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>Email</label>
                    <p className={themeClasses.textPrimary}>{selectedTeacher.email}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>Phone</label>
                    <p className={themeClasses.textPrimary}>{selectedTeacher.phone_number || 'No phone'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>Address</label>
                    <p className={themeClasses.textPrimary}>{selectedTeacher.address || 'No address'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>Qualification</label>
                    <p className={themeClasses.textPrimary}>{selectedTeacher.qualification || 'No qualification'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>Specialization</label>
                    <p className={themeClasses.textPrimary}>{selectedTeacher.specialization || 'No specialization'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>Hire Date</label>
                    <p className={themeClasses.textPrimary}>{new Date(selectedTeacher.hire_date).toLocaleDateString()}</p>
                  </div>
                  {selectedTeacher.assigned_subjects.length > 0 && (
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-1`}>Assigned Subjects</label>
                      <p className={themeClasses.textPrimary}>
                        {selectedTeacher.assigned_subjects.map(s => s.name).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Detailed Assignments */}
                  {selectedTeacher.teacher_assignments && selectedTeacher.teacher_assignments.length > 0 && (
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Detailed Assignments</label>
                      <div className="space-y-2">
                        {selectedTeacher.teacher_assignments.map((assignment, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                assignment.education_level === 'SENIOR_SECONDARY' ? 'bg-purple-100 text-purple-800' :
                                assignment.education_level === 'JUNIOR_SECONDARY' ? 'bg-blue-100 text-blue-800' :
                                assignment.education_level === 'PRIMARY' ? 'bg-green-100 text-green-800' :
                                'bg-pink-100 text-pink-800'
                              }`}>
                                {assignment.grade_level_name} {assignment.section_name}
                              </span>
                              <span className="text-sm font-medium">{assignment.subject_name}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {assignment.education_level.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      handleEdit(selectedTeacher);
                      setShowProfile(false);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200 ${themeClasses.btnPrimary}`}
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

      {/* Edit Teacher Modal */}
      {showEditModal && teacherToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.bgModal} rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${themeClasses.textPrimary}`}>Edit Teacher</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setTeacherToEdit(null);
                }}
                className={`p-2 ${themeClasses.hoverCard} rounded-full transition-colors duration-200`}
              >
                <X size={24} className={themeClasses.textSecondary} />
              </button>
            </div>

            <EditTeacherForm 
              teacher={teacherToEdit}
              onSave={handleUpdateTeacher}
              onCancel={() => {
                setShowEditModal(false);
                setTeacherToEdit(null);
              }}
              themeClasses={themeClasses}
              isDark={isDark}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Teacher Form Component
interface EditTeacherFormProps {
  teacher: Teacher;
  onSave: (data: Partial<Teacher>) => void;
  onCancel: () => void;
  themeClasses: any;
  isDark: boolean;
}

const EditTeacherForm: React.FC<EditTeacherFormProps> = ({ teacher, onSave, onCancel, themeClasses, isDark }) => {
  const [formData, setFormData] = useState({
    first_name: teacher.first_name,
    last_name: teacher.last_name,
    email: teacher.email,
    employee_id: teacher.employee_id || '',
    phone_number: teacher.phone_number || '',
    address: teacher.address || '',
    qualification: teacher.qualification || '',
    specialization: teacher.specialization || '',
    staff_type: teacher.staff_type,
    level: teacher.level || '',
    is_active: teacher.is_active,
    photo: teacher.photo || null
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(teacher.photo || null);
  const [uploading, setUploading] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<{id: string, name: string}[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Helper function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Load subjects when level changes
  useEffect(() => {
    if (formData.staff_type === 'teaching' && formData.level) {
      const levelMap: Record<string, string> = { 
        nursery: 'NURSERY', 
        primary: 'PRIMARY', 
        secondary: 'JUNIOR_SECONDARY' 
      };
      
      fetch(`/api/subjects/?education_levels=${levelMap[formData.level]}`)
        .then(res => res.json())
        .then(data => {
          const subjects = Array.isArray(data.results) ? data.results : data;
          setSubjectOptions(subjects.map((s: any) => ({ id: s.id, name: s.name })));
        })
        .catch(error => {
          console.error('Error fetching subjects:', error);
          setSubjectOptions([]);
        });
    } else {
      setSubjectOptions([]);
    }
  }, [formData.staff_type, formData.level]);

  // Load current teacher's subjects
  useEffect(() => {
    if (teacher.assigned_subjects) {
      setSelectedSubjects(teacher.assigned_subjects.map(s => s.id.toString()));
    }
  }, [teacher.assigned_subjects]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        // Upload to Cloudinary
        const cloudinaryData = new FormData();
        cloudinaryData.append('file', file);
        cloudinaryData.append('upload_preset', 'profile_upload');
        
        const res = await fetch('https://api.cloudinary.com/v1_1/djbz7wunu/image/upload', {
          method: 'POST',
          body: cloudinaryData
        });
        
        const data = await res.json();
        const imageUrl = data.secure_url;
        
        console.log('Cloudinary upload successful:', imageUrl);
        
        setFormData(prev => ({ ...prev, photo: imageUrl }));
        setPhotoPreview(imageUrl);
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        alert('Failed to upload image');
      } finally {
        setUploading(false);
      }
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    setPhotoPreview(null);
  };

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects(prev => [...prev, subjectId]);
    } else {
      setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for backend
    const updateData = {
      ...formData,
      subjects: selectedSubjects,
      // Map frontend fields to backend expected fields
      user: {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email
      }
    };
    
    onSave(updateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Upload */}
      <div className="mb-6">
        <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
          Profile Picture
        </label>
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-3 bg-gray-50 relative">
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Teacher" className="w-20 h-20 object-cover rounded" />
                <button 
                  type="button"
                  onClick={removePhoto} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {getInitials(formData.first_name, formData.last_name)}
                </span>
              </div>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoUpload} 
            className="hidden" 
            id="edit-teacher-photo" 
            disabled={uploading} 
          />
          <label 
            htmlFor="edit-teacher-photo" 
            className={`px-4 py-2 rounded text-sm cursor-pointer transition-colors ${
              uploading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Choose New Photo'}
          </label>
          {photoPreview && (
            <button 
              type="button"
              onClick={removePhoto} 
              className="text-red-500 text-sm mt-2 hover:text-red-700"
            >
              Remove Photo
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
            First Name *
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.inputBg} ${themeClasses.inputFocus} ${themeClasses.textPrimary}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
            Last Name *
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.inputBg} ${themeClasses.inputFocus} ${themeClasses.textPrimary}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.inputBg} ${themeClasses.inputFocus} ${themeClasses.textPrimary}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
            Employee ID
          </label>
          <input
            type="text"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleInputChange}
            placeholder="e.g., EMP001"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.inputBg} ${themeClasses.inputFocus} ${themeClasses.textPrimary}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
            Phone Number
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.inputBg} ${themeClasses.inputFocus} ${themeClasses.textPrimary}`}
          />
        </div>

        <div className="md:col-span-2">
          <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.inputBg} ${themeClasses.inputFocus} ${themeClasses.textPrimary}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
            Staff Type
          </label>
          <select
            name="staff_type"
            value={formData.staff_type}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.inputBg} ${themeClasses.inputFocus} ${themeClasses.textPrimary}`}
          >
            <option value="teaching">Teaching</option>
            <option value="non-teaching">Non-Teaching</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
            Level
          </label>
          <select
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.inputBg} ${themeClasses.inputFocus} ${themeClasses.textPrimary}`}
          >
            <option value="">Select Level</option>
            <option value="nursery">Nursery</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
            Qualification
          </label>
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.inputBg} ${themeClasses.inputFocus} ${themeClasses.textPrimary}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
            Specialization
          </label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${themeClasses.inputBg} ${themeClasses.inputFocus} ${themeClasses.textPrimary}`}
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>
              Active Status
            </span>
          </label>
        </div>
      </div>

      {/* Subject Selection (only for teaching staff) */}
      {formData.staff_type === 'teaching' && formData.level && (
        <div className="mb-4">
          <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
            Assigned Subjects
          </label>
          {subjectOptions.length === 0 ? (
            <div className="bg-gray-50 p-3 rounded border">
              <span className="text-gray-500">No subjects found for this level.</span>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subjectOptions.map(subj => (
                  <label key={subj.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subj.id)}
                      onChange={(e) => handleSubjectChange(subj.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{subj.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors duration-200 ${themeClasses.btnSecondary}`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${themeClasses.btnPrimary}`}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default TeacherList; 