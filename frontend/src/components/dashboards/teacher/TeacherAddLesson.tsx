import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import {lessonAPI, LessonCreateData} from "@/services/TeacherLessonService";
import { api } from '@/services/api';

interface TeacherAddLessonProps {
  onClose: () => void;
  onSuccess: () => void;
}

const TeacherAddLesson: React.FC<TeacherAddLessonProps> = ({ onClose, onSuccess }) => {
  const { isDarkMode } = useGlobalTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<LessonCreateData>({
    title: '',
    description: '',
    lesson_type: 'lecture',
    difficulty_level: 'beginner',
    teacher: 0,
    classroom: 0,
    subject: 0,
    date: '',
    start_time: '',
    end_time: '',
    duration_minutes: 45,
    learning_objectives: [],
    key_concepts: [],
    materials_needed: [],
    assessment_criteria: [],
    teacher_notes: '',
    is_recurring: false,
    recurring_pattern: '',
    requires_special_equipment: false,
    is_online_lesson: false,
  });

  const [newObjective, setNewObjective] = useState('');
  const [newConcept, setNewConcept] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

  // Data for dropdowns
  const [teacherId, setTeacherId] = useState<number | null>(null);
const [teacherSubjects, setTeacherSubjects] = useState<any[]>([]);
const [teacherClassrooms, setTeacherClassrooms] = useState<any[]>([]);
  const [sections, setSections] = useState<Array<{ id: number; name: string; grade_level_name: string }>>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Array<{ id: number; user: { first_name: string; last_name: string; full_name: string } }>>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Array<{ id: number; name: string; code: string }>>([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState<Array<{ id: number; name: string; section: { id: number; name: string; grade_level: { name: string } }; grade_level_name?: string; stream_name?: string; stream_type?: string }>>([]);
  const [selectedSection, setSelectedSection] = useState<number>(0);
  const [loadingData, setLoadingData] = useState(true);

  const themeClasses = {
    bgPrimary: isDarkMode ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
    bgCard: isDarkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    iconPrimary: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    buttonPrimary: isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
  };

  // Load dropdown data
  useEffect(() => {
  const fetchTeacherData = async () => {
    try {
      const roleInfo = await lessonAPI.getUserRoleInfo();

      if (roleInfo.role === "teacher" && roleInfo.teacher_info) {
        const tid = roleInfo.teacher_info.teacher_id;
        setTeacherId(tid);
        // Prefill teacher dropdown with current teacher
        const teacherOption = roleInfo.teacher_info && roleInfo.teacher_info.teacher_name
          ? [{ id: tid, user: { first_name: roleInfo.teacher_info.teacher_name.split(' ')[0] || '', last_name: roleInfo.teacher_info.teacher_name.split(' ')[1] || '', full_name: roleInfo.teacher_info.teacher_name } }]
          : [{ id: tid, user: { first_name: '', last_name: '', full_name: `Teacher ${tid}` } }];
        setFilteredTeachers(teacherOption);

        // ✅ Fetch only this teacher’s subjects & classrooms
        const subjects = await lessonAPI.getTeacherSubjects(tid);
        const classrooms = await lessonAPI.getTeacherClassrooms(tid);

        const subjectsList = subjects?.results || subjects || [];
        const classroomsList = classrooms?.results || classrooms || [];

        setTeacherSubjects(subjectsList);
        setTeacherClassrooms(classroomsList);
        setFilteredSubjects(subjectsList);
        setFilteredClassrooms(classroomsList);

        // Preselect teacher in form to unlock dependent selects
        setFormData(prev => ({ ...prev, teacher: tid }));
      }

      // Load sections for filter dropdown
      try {
        const sectionData = await api.get('/api/lessons/lessons/classroom_sections/');
        const mapped = Array.isArray(sectionData)
          ? sectionData.map((s: any) => ({ id: s.id, name: s.name, grade_level_name: s.grade_level_name || s.grade_level?.name || '' }))
          : [];
        setSections(mapped);
      } catch (e) {
        // Silent fail; sections are optional
        setSections([]);
      }

      setLoadingData(false);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      setLoadingData(false);
    }
  };

  fetchTeacherData();
}, []);

  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      const diffMs = end.getTime() - start.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      if (diffMinutes > 0) {
        setFormData(prev => ({ ...prev, duration_minutes: diffMinutes }));
      }
    }
  }, [formData.start_time, formData.end_time]);

  const handleInputChange = (field: keyof LessonCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Handle dependencies
    if (field === 'teacher') {
      handleTeacherChange(value);
    } else if (field === 'subject') {
      handleSubjectChange(value);
    } else if (field === 'classroom') {
      handleClassroomChange(value);
    }
  };

  const handleTeacherChange = async (teacherId: number) => {
    if (teacherId === 0) {
      // Reset to all options
      setFilteredSubjects(teacherSubjects);
      setFilteredClassrooms(teacherClassrooms);
      // Reset form data when teacher is deselected
      setFormData(prev => ({ ...prev, subject: 0, classroom: 0 }));
      setSelectedSection(0);
      return;
    }

    try {
      // Get subjects for this teacher
      const teacherSubjects = await api.get(`/api/lessons/lessons/teacher_subjects/?teacher_id=${teacherId}`);
      setFilteredSubjects(Array.isArray(teacherSubjects) ? teacherSubjects : []);

      // Get classrooms for this teacher
      const teacherClassrooms = await api.get(`/api/lessons/lessons/teacher_classrooms/?teacher_id=${teacherId}`);
      setFilteredClassrooms(Array.isArray(teacherClassrooms) ? teacherClassrooms : []);
      
      // Reset dependent fields when teacher changes
      setFormData(prev => ({ ...prev, subject: 0, classroom: 0 }));
      setSelectedSection(0);
    } catch (error) {
      console.error('Error loading teacher dependencies:', error);
      // Fallback to all options on error
      setFilteredSubjects(teacherSubjects);
      setFilteredClassrooms(teacherClassrooms);
    }
  };

  const handleSubjectChange = async (subjectId: number) => {
    if (subjectId === 0) {
      // Reset classroom to all teacher's classrooms
      if (formData.teacher) {
        try {
          const teacherClassrooms = await api.get(`/api/lessons/lessons/teacher_classrooms/?teacher_id=${formData.teacher}`);
          setFilteredClassrooms(Array.isArray(teacherClassrooms) ? teacherClassrooms : []);
        } catch (error) {
          console.error('Error loading teacher classrooms:', error);
        }
      }
      // Reset form data when subject is deselected
      setFormData(prev => ({ ...prev, classroom: 0 }));
      setSelectedSection(0);
      return;
    }

    try {
      // Filter classrooms to only those where the teacher teaches this specific subject
      if (formData.teacher) {
        const teacherClassrooms = await api.get(`/api/lessons/lessons/teacher_classrooms/?teacher_id=${formData.teacher}&subject_id=${subjectId}`);
        setFilteredClassrooms(Array.isArray(teacherClassrooms) ? teacherClassrooms : []);
      }
      
      // Reset dependent fields when subject changes
      setFormData(prev => ({ ...prev, classroom: 0 }));
      setSelectedSection(0);
    } catch (error) {
      console.error('Error loading subject dependencies:', error);
    }
  };

  const handleSectionChange = (sectionId: number) => {
    setSelectedSection(sectionId);
    // Sections should be tied to the selected classroom only; do not refilter classroom lists here.
  };

  const handleClassroomChange = async (classroomId: number) => {
    if (classroomId === 0) {
      setSelectedSection(0);
      return;
    }

    try {
      // When classroom changes, derive and pin the section from the selected classroom
      const selectedClassroom = filteredClassrooms.find(c => c.id === classroomId);
      if (selectedClassroom?.section?.id) {
        setSelectedSection(selectedClassroom.section.id);
      } else {
        setSelectedSection(0);
      }
    } catch (error) {
      console.error('Error handling classroom change:', error);
    }
  };

  const addArrayItem = (field: 'learning_objectives' | 'key_concepts' | 'materials_needed' | 'assessment_criteria', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'learning_objectives' | 'key_concepts' | 'materials_needed' | 'assessment_criteria', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.teacher || !formData.classroom || !formData.subject || !formData.date || !formData.start_time || !formData.end_time) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // For non-admin teachers, backend auto-assigns teacher; ignore any zero teacher IDs
      const payload = { ...formData } as any;
      if (!payload.teacher) {
        delete payload.teacher;
      }
      const created = await lessonAPI.createLesson(payload);
      console.log('✅ Lesson created:', created);
      setSuccess(true);
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${themeClasses.bgCard} rounded-2xl shadow-2xl max-w-md w-full p-8 text-center`}>
          <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-2`}>Success!</h2>
          <p className={`${themeClasses.textSecondary}`}>Lesson created successfully</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${themeClasses.bgCard} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
        <div className={`p-6 border-b ${themeClasses.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${themeClasses.textPrimary}`}>Add New Lesson</h2>
              <p className={`${themeClasses.textSecondary} mt-1`}>Create a comprehensive lesson plan</p>
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}>
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className={`mb-6 p-4 rounded-lg bg-red-100 border border-red-300 ${isDarkMode ? 'bg-red-900 border-red-700' : ''}`}>
              <div className="flex items-center space-x-2">
                <AlertCircle size={20} className="text-red-600" />
                <p className={`text-red-700 ${isDarkMode ? 'text-red-300' : ''}`}>{error}</p>
              </div>
            </div>
          )}

          {loadingData && (
            <div className={`mb-6 p-4 rounded-lg bg-blue-100 border border-blue-300 ${isDarkMode ? 'bg-blue-900 border-blue-700' : ''}`}>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <p className={`text-blue-700 ${isDarkMode ? 'text-blue-300' : ''}`}>Loading form data...</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lesson Title/Topic - always first */}
            <div className="col-span-2">
              <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Lesson Title / Topic <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter the topic to be treated in this lesson"
                required
              />
              <span className="text-xs text-gray-400">This is the topic or main focus of the lesson (e.g., 'Algebraic Expressions', 'Photosynthesis').</span>
            </div>
            {/* Short Description under title */}
            <div className="col-span-2">
              <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Short Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Briefly describe the lesson topic or focus (e.g., 'Introduction to basic algebraic concepts')"
              />
              <span className="text-xs text-gray-400">Provide a brief summary or context for the lesson topic.</span>
            </div>
            {/* Assignment Order: Teacher -> Subject -> Classroom -> Section */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} flex items-center space-x-2`}>
                <Users size={20} className={themeClasses.iconPrimary} />
                <span>Assignment (Follow the order below)</span>
              </h3>

              {/* 1. Teacher */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Teacher <span className="text-xs text-gray-400">(Start here)</span></label>
                <select
                  value={formData.teacher}
                  onChange={(e) => handleInputChange('teacher', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loadingData}
                >
                  <option value={0}>
                    {loadingData ? 'Loading teachers...' : 'Select a teacher'}
                  </option>
                  {Array.isArray(filteredTeachers) && filteredTeachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.full_name || `${teacher.user.first_name} ${teacher.user.last_name}`}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-400">Select a teacher to see their assigned subjects and classrooms. <span className="text-orange-500">Changing teacher will reset subject, classroom, and section selections.</span></span>
              </div>

              {/* 2. Subject */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loadingData || !formData.teacher}
                >
                  <option value={0}>
                    {!formData.teacher ? 'Select a teacher first' : loadingData ? 'Loading subjects...' : 'Select a subject'}
                  </option>
                  {Array.isArray(filteredSubjects) && filteredSubjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-400">
                  Select a subject assigned to the chosen teacher.
                </span>
              </div>

              {/* 3. Classroom */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Classroom *</label>
                <select
                  value={formData.classroom}
                  onChange={(e) => handleInputChange('classroom', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loadingData || !formData.teacher}
                >
                  <option value={0}>
                    {!formData.teacher ? 'Select a teacher first' : loadingData ? 'Loading classrooms...' : 'Select a classroom'}
                  </option>
                  {Array.isArray(filteredClassrooms) && filteredClassrooms.map(classroom => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name} - {classroom.grade_level_name || classroom.section?.grade_level?.name || 'Unknown Grade'}
                      {classroom.stream_name && ` (${classroom.stream_name})`}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-400">
                  Select a classroom where the teacher is assigned.
                  {formData.classroom && filteredClassrooms.find(c => c.id === formData.classroom)?.stream_name && (
                    <span className="block mt-1 text-blue-600">
                      Stream: {filteredClassrooms.find(c => c.id === formData.classroom)?.stream_name}
                    </span>
                  )}
                </span>
              </div>

              {/* 4. Section */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => handleSectionChange(parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loadingData || !formData.classroom}
                >
                  <option value={0}>
                    {!formData.classroom ? 'Select a classroom first' : 'All Sections'}
                  </option>
                  {Array.isArray(sections) && sections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name} - {section.grade_level_name}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-400">Optionally select a specific section to filter further.</span>
              </div>
            </div>

            {/* Scheduling and Details (unchanged) */}
            <div className="space-y-4">
              {/* Scheduling */}
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} flex items-center space-x-2`}>
                <Calendar size={20} className={themeClasses.iconPrimary} />
                <span>Scheduling</span>
              </h3>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Start Time *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>End Time *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
                  min="15"
                  max="480"
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Lesson Details */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} flex items-center space-x-2`}>
                <Target size={20} className={themeClasses.iconPrimary} />
                <span>Lesson Details</span>
              </h3>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Learning Objectives</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('learning_objectives', newObjective);
                          setNewObjective('');
                        }
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Add learning objective"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem('learning_objectives', newObjective);
                        setNewObjective('');
                      }}
                      className={`px-3 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors`}
                    >
                      Add
                    </button>
                  </div>
                  {formData.learning_objectives && formData.learning_objectives.length > 0 && (
                    <div className="space-y-1">
                      {Array.isArray(formData.learning_objectives) && formData.learning_objectives.map((objective, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm text-blue-800">{objective}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('learning_objectives', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Key Concepts</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newConcept}
                      onChange={(e) => setNewConcept(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('key_concepts', newConcept);
                          setNewConcept('');
                        }
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Add key concept"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem('key_concepts', newConcept);
                        setNewConcept('');
                      }}
                      className={`px-3 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors`}
                    >
                      Add
                    </button>
                  </div>
                  {formData.key_concepts && formData.key_concepts.length > 0 && (
                    <div className="space-y-1">
                      {Array.isArray(formData.key_concepts) && formData.key_concepts.map((concept, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm text-green-800">{concept}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('key_concepts', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Materials Needed</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('materials_needed', newMaterial);
                          setNewMaterial('');
                        }
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Add material"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem('materials_needed', newMaterial);
                        setNewMaterial('');
                      }}
                      className={`px-3 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors`}
                    >
                      Add
                    </button>
                  </div>
                  {formData.materials_needed && formData.materials_needed.length > 0 && (
                    <div className="space-y-1">
                      {Array.isArray(formData.materials_needed) && formData.materials_needed.map((material, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                          <span className="text-sm text-orange-800">{material}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('materials_needed', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Teacher Notes</label>
                <textarea
                  value={formData.teacher_notes}
                  onChange={(e) => handleInputChange('teacher_notes', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Add any additional notes for this lesson"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors flex items-center space-x-2`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Lesson</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherAddLesson;
