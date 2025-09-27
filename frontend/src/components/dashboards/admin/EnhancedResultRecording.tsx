import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Users, BookOpen, Calculator, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import resultSettingsService from '@/services/ResultSettingsService';
import StudentService from '@/services/StudentService';
import SubjectService from '@/services/SubjectService';

interface Student {
  id: string;
  full_name: string;
  student_class: string;
  education_level: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  education_levels: string[];
}

interface ExamSession {
  id: string;
  name: string;
  exam_type: string;
  term: string;
}

interface AssessmentType {
  id: string;
  name: string;
  code: string;
  description: string;
  education_level: 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY' | 'ALL';
  education_level_display: string;
  max_score: number;
  weight_percentage: number;
  is_active: boolean;
  created_at: string;
}


interface EnhancedResultRecordingProps {
  onResultAdded?: () => void;
  onClose?: () => void;
}
const EnhancedResultRecording: React.FC<EnhancedResultRecordingProps> = ({
  onResultAdded,
  onClose

}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [scoringConfigs, setScoringConfigs] = useState<any[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  
  // Form state - now dynamic based on assessment types
  const [formData, setFormData] = useState<{
    student: string;
    subject: string;
    exam_session: string;
    education_level: string;
    teacher_remark: string;
    status: string;
    [key: string]: any; // Dynamic score fields
  }>({
    student: '',
    subject: '',
    exam_session: '',
    education_level: '',
    teacher_remark: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        studentsData,
        subjectsData,
        examSessionsData,
        assessmentTypesData,
        scoringConfigsData
      ] = await Promise.all([
        StudentService.getStudents({ page_size: 1000 }), // Get all students
        SubjectService.getSubjects({ is_active: true }), // Get active subjects
        resultSettingsService.getExamSessions(),
        resultSettingsService.getAssessmentTypes(),
        resultSettingsService.getScoringConfigurations()
      ]);

      // Transform students data to match our interface with proper error handling
      const transformedStudents: Student[] = [];
      if (studentsData && (studentsData.results || Array.isArray(studentsData))) {
        const studentsArray = studentsData.results || studentsData;
        transformedStudents.push(...studentsArray.map((student: any) => ({
          id: student.id?.toString() || '',
          full_name: student.full_name || student.user?.first_name + ' ' + student.user?.last_name || 'Unknown',
          student_class: student.student_class || 'N/A',
          education_level: student.education_level || 'UNKNOWN'
        })));
      }

      // Transform subjects data to match our interface with proper error handling
      const transformedSubjects: Subject[] = [];
      if (subjectsData && (subjectsData.results || Array.isArray(subjectsData))) {
        const subjectsArray = subjectsData.results || subjectsData;
        transformedSubjects.push(...subjectsArray.map((subject: any) => ({
          id: subject.id?.toString() || '',
          name: subject.name || 'Unknown Subject',
          code: subject.code || 'N/A',
          education_levels: subject.education_levels || []
        })));
      }

      // Handle exam sessions data with proper error handling
      const safeExamSessions = Array.isArray(examSessionsData) ? examSessionsData : [];
      
      // Handle assessment types data with proper error handling
      const safeAssessmentTypes = Array.isArray(assessmentTypesData) ? assessmentTypesData : [];
      
      // Handle scoring configs data with proper error handling
      const safeScoringConfigs = Array.isArray(scoringConfigsData) ? scoringConfigsData : [];

      setStudents(transformedStudents);
      setSubjects(transformedSubjects);
      setFilteredSubjects(transformedSubjects); // Initially show all subjects
      setExamSessions(safeExamSessions);
      setAssessmentTypes(safeAssessmentTypes);
      setScoringConfigs(safeScoringConfigs);
      
      console.log('Data loaded successfully:', {
        students: transformedStudents.length,
        subjects: transformedSubjects.length,
        examSessions: safeExamSessions.length,
        assessmentTypes: safeAssessmentTypes.length,
        scoringConfigs: safeScoringConfigs.length
      });
      
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Set empty arrays as fallback to prevent undefined errors
      setStudents([]);
      setSubjects([]);
      setExamSessions([]);
      setAssessmentTypes([]);
      setScoringConfigs([]);
      
      toast.error('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoringConfig = (educationLevel: string, resultType: string = 'TERMLY') => {
    return scoringConfigs.find(config => 
      config.education_level === educationLevel && 
      config.result_type === resultType
    );
  };

  const getActiveScoringConfig = (educationLevel: string) => {
    // First try to find a default configuration
    let config = scoringConfigs.find(c => 
      c.education_level === educationLevel && 
      c.is_default && 
      c.is_active
    );
    
    // If no default, get the first active configuration
    if (!config) {
      config = scoringConfigs.find(c => 
        c.education_level === educationLevel && 
        c.is_active
      );
    }
    
    return config;
  };

  const getAssessmentTypesForLevel = (educationLevel: string): AssessmentType[] => {
    return assessmentTypes.filter(type => 
      type.education_level === educationLevel || type.education_level === 'ALL'
    );
  };

  const getFieldNameFromAssessmentType = (assessmentType: AssessmentType): string => {
    // Convert assessment type code to a field name
    const code = assessmentType.code.toLowerCase();
    if (code.includes('test1') || code.includes('ca')) return 'first_test_score';
    if (code.includes('test2')) return 'second_test_score';
    if (code.includes('test3')) return 'third_test_score';
    if (code.includes('exam')) return 'exam_score';
    if (code.includes('ca')) return 'continuous_assessment_score';
    if (code.includes('tht')) return 'take_home_test_score';
    if (code.includes('app')) return 'appearance_score';
    if (code.includes('pra')) return 'practical_score';
    if (code.includes('pro')) return 'project_score';
    if (code.includes('nc')) return 'note_copying_score';
    if (code.includes('total')) return 'total_score';
    
    // Fallback: create a field name from the code
    return `${code}_score`;
  };

  const filterSubjectsByEducationLevel = (educationLevel: string): Subject[] => {
    // Filter subjects based on education level using the actual education_levels field
    return subjects.filter(subject => {
      // Check if the subject's education_levels array contains the requested education level
      return subject.education_levels && subject.education_levels.includes(educationLevel);
    });
  };

  const validateScoreLimits = (score: number, maxScore: number, fieldName: string) => {
    if (score > maxScore) {
      toast.error(`${fieldName} cannot exceed ${maxScore}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      const student = students.find(s => s.id === formData.student);
      if (!student) {
        toast.error('Please select a student');
        return;
      }

      // Get the active scoring configuration for this education level
      const config = getActiveScoringConfig(student.education_level);
      if (!config) {
        toast.error(`No active scoring configuration found for ${student.education_level.replace('_', ' ')}`);
        return;
      }

      // Get assessment types for this education level
      const levelAssessmentTypes = getAssessmentTypesForLevel(student.education_level);
      
      // Validate score limits based on assessment types
      for (const assessmentType of levelAssessmentTypes) {
        const fieldName = getFieldNameFromAssessmentType(assessmentType);
        const score = formData[fieldName] || 0;
        if (!validateScoreLimits(score, assessmentType.max_score, assessmentType.name)) {
          return;
        }
      }
      
      // Prepare result data based on education level
      let resultData: any = {
        student: formData.student,
        subject: formData.subject,
        exam_session: formData.exam_session,
        grading_system: 2, // Default grading system ID
        teacher_remark: formData.teacher_remark,
        status: formData.status
      };
      
      // Add scores based on assessment types
      for (const assessmentType of levelAssessmentTypes) {
        const fieldName = getFieldNameFromAssessmentType(assessmentType);
        resultData[fieldName] = formData[fieldName] || 0;
      }
      
      // Call appropriate API
      if (student.education_level === 'SENIOR_SECONDARY') {
        await resultSettingsService.createSeniorSecondaryResult(resultData);
      } else if (student.education_level === 'JUNIOR_SECONDARY') {
        await resultSettingsService.createJuniorSecondaryResult(resultData);
      } else if (student.education_level === 'PRIMARY') {
        await resultSettingsService.createPrimaryResult(resultData);
      } else if (student.education_level === 'NURSERY') {
        await resultSettingsService.createNurseryResult(resultData);
      }
      
      toast.success('Result recorded successfully');
      setShowForm(false);
      resetForm();
       if (onResultAdded) {
        onResultAdded();
      }
      if (onClose) {
        onClose();
      } else {
        setShowForm(false);
        resetForm();
      }
    } catch (error: any) {
      console.error('Error saving result:', error);
      toast.error(error.response?.data?.message || 'Failed to save result');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      student: '',
      subject: '',
      exam_session: '',
      education_level: '',
      teacher_remark: '',
      status: 'DRAFT'
    });
    setFilteredSubjects(subjects); // Reset to show all subjects
  };

  const handleStudentSelect = (student: Student) => {
    const levelAssessmentTypes = getAssessmentTypesForLevel(student.education_level);
    
    // Filter subjects for this student's education level
    const levelSubjects = filterSubjectsByEducationLevel(student.education_level);
    setFilteredSubjects(levelSubjects);
    
    // Initialize form data with the student and education level
    const newFormData: any = {
      student: student.id,
      education_level: student.education_level,
      subject: '',
      exam_session: '',
      teacher_remark: '',
      status: 'DRAFT'
    };
    
    // Initialize score fields for this education level
    for (const assessmentType of levelAssessmentTypes) {
      const fieldName = getFieldNameFromAssessmentType(assessmentType);
      newFormData[fieldName] = 0;
    }
    
    setFormData(newFormData);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading Result Recording System...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching students, subjects, and assessment data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Enhanced Result Recording</h1>
                <p className="text-gray-600 mt-1">
                  Record and manage student results across all education levels
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
            >
              <Plus className="h-5 w-5" />
              <span>Record New Result</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exam Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{examSessions.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assessment Types</p>
                <p className="text-2xl font-bold text-gray-900">{assessmentTypes.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Students</h2>
                  <p className="text-green-100 text-sm">Select a student to record results</p>
                </div>
              </div>
              <span className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full">
                {students.length} Students
              </span>
            </div>
          </div>
          
          <div className="p-6">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                <p className="text-gray-600 mb-6">No students are currently registered in the system</p>
                <button
                  onClick={loadData}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Refresh Data</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <div key={student.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {student.student_class}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Level:</span>
                        <span className="font-medium">{student.education_level.replace('_', ' ')}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleStudentSelect(student)}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      Record Result
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Recording Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Record Student Result</h3>
                    <p className="text-blue-100 text-sm">Enter detailed result information</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Subject</option>
                        {filteredSubjects.map(subject => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Exam Session</label>
                      <select
                        value={formData.exam_session}
                        onChange={(e) => setFormData({ ...formData, exam_session: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Exam Session</option>
                        {examSessions.map(session => (
                          <option key={session.id} value={session.id}>{session.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dynamic Score Entry Based on Scoring Configuration */}
                {formData.education_level && (() => {
                  const config = getActiveScoringConfig(formData.education_level);
                  
                  return (
                    <div className="bg-green-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-green-900 mb-4">
                        Score Entry - {formData.education_level.replace('_', ' ')}
                      </h4>
                      
                      {config && (
                        <div className="mb-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Using Configuration:</strong> {config.name} 
                            {config.is_default && <span className="ml-2 bg-blue-200 px-2 py-1 rounded text-xs">Default</span>}
                          </p>
                        </div>
                      )}
                      
                      {!config && (
                        <div className="mb-4 p-3 bg-red-100 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Warning:</strong> No active scoring configuration found for {formData.education_level.replace('_', ' ')}. 
                            Please create one in the Exams & Results Settings.
                          </p>
                        </div>
                      )}
                      
                      {config && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Senior Secondary Fields */}
                          {formData.education_level === 'SENIOR_SECONDARY' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {config.result_type === 'SESSION' ? '1st Term Score' : '1st Test Score'} (Max: {config.first_test_max_score})
                                </label>
                                <input
                                  type="number"
                                  value={formData.first_test_score || 0}
                                  onChange={(e) => setFormData({ 
                                    ...formData, 
                                    first_test_score: parseFloat(e.target.value) || 0 
                                  })}
                                  max={config.first_test_max_score}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {config.result_type === 'SESSION' ? '2nd Term Score' : '2nd Test Score'} (Max: {config.second_test_max_score})
                                </label>
                                <input
                                  type="number"
                                  value={formData.second_test_score || 0}
                                  onChange={(e) => setFormData({ 
                                    ...formData, 
                                    second_test_score: parseFloat(e.target.value) || 0 
                                  })}
                                  max={config.second_test_max_score}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {config.result_type === 'SESSION' ? '3rd Term Score' : '3rd Test Score'} (Max: {config.third_test_max_score})
                                </label>
                                <input
                                  type="number"
                                  value={formData.third_test_score || 0}
                                  onChange={(e) => setFormData({ 
                                    ...formData, 
                                    third_test_score: parseFloat(e.target.value) || 0 
                                  })}
                                  max={config.third_test_max_score}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </div>
                              {config.result_type === 'TERMLY' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Exam Score (Max: {config.exam_max_score})
                                  </label>
                                  <input
                                    type="number"
                                    value={formData.exam_score || 0}
                                    onChange={(e) => setFormData({ 
                                      ...formData, 
                                      exam_score: parseFloat(e.target.value) || 0 
                                    })}
                                    max={config.exam_max_score}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  />
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Primary and Junior Secondary Fields */}
                          {(formData.education_level === 'PRIMARY' || formData.education_level === 'JUNIOR_SECONDARY') && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  CA Score (Max: {config.continuous_assessment_max_score})
                                </label>
                                <input
                                  type="number"
                                  value={formData.continuous_assessment_score || 0}
                                  onChange={(e) => setFormData({ 
                                    ...formData, 
                                    continuous_assessment_score: parseFloat(e.target.value) || 0 
                                  })}
                                  max={config.continuous_assessment_max_score}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Take Home Test (Max: {config.take_home_test_max_score})
                                </label>
                                <input
                                  type="number"
                                  value={formData.take_home_test_score || 0}
                                  onChange={(e) => setFormData({ 
                                    ...formData, 
                                    take_home_test_score: parseFloat(e.target.value) || 0 
                                  })}
                                  max={config.take_home_test_max_score}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Appearance (Max: {config.appearance_max_score})
                                </label>
                                <input
                                  type="number"
                                  value={formData.appearance_score || 0}
                                  onChange={(e) => setFormData({ 
                                    ...formData, 
                                    appearance_score: parseFloat(e.target.value) || 0 
                                  })}
                                  max={config.appearance_max_score}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Practical (Max: {config.practical_max_score})
                                </label>
                                <input
                                  type="number"
                                  value={formData.practical_score || 0}
                                  onChange={(e) => setFormData({ 
                                    ...formData, 
                                    practical_score: parseFloat(e.target.value) || 0 
                                  })}
                                  max={config.practical_max_score}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Project (Max: {config.project_max_score})
                                </label>
                                <input
                                  type="number"
                                  value={formData.project_score || 0}
                                  onChange={(e) => setFormData({ 
                                    ...formData, 
                                    project_score: parseFloat(e.target.value) || 0 
                                  })}
                                  max={config.project_max_score}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Note Copying (Max: {config.note_copying_max_score})
                                </label>
                                <input
                                  type="number"
                                  value={formData.note_copying_score || 0}
                                  onChange={(e) => setFormData({ 
                                    ...formData, 
                                    note_copying_score: parseFloat(e.target.value) || 0 
                                  })}
                                  max={config.note_copying_max_score}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </div>
                              {config.result_type === 'TERMLY' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Exam Score (Max: {config.exam_max_score})
                                  </label>
                                  <input
                                    type="number"
                                    value={formData.exam_score || 0}
                                    onChange={(e) => setFormData({ 
                                      ...formData, 
                                      exam_score: parseFloat(e.target.value) || 0 
                                    })}
                                    max={config.exam_max_score}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  />
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Nursery Fields */}
                          {formData.education_level === 'NURSERY' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Score (Max: {config.total_max_score})
                              </label>
                              <input
                                type="number"
                                value={formData.total_score || 0}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  total_score: parseFloat(e.target.value) || 0 
                                })}
                                max={config.total_max_score}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Teacher Remarks */}
                <div className="bg-purple-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4">Teacher Remarks</h4>
                  <textarea
                    value={formData.teacher_remark}
                    onChange={(e) => setFormData({ ...formData, teacher_remark: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter teacher's remarks about the student's performance..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving || !formData.student || !formData.subject || !formData.exam_session}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Result</span>
                      </>
                    )}
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

export default EnhancedResultRecording;
