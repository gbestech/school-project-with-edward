
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import TeacherDashboardService from '@/services/TeacherDashboardService';
import ResultService from '@/services/ResultService';
import { toast } from 'react-toastify';
import { 
  X, 
  Save, 
  User,
  FileText,
  GraduationCap,
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface Student {
  id: number;
  full_name: string;
  registration_number: string;
  profile_picture?: string;
  classroom: {
    id: number;
    name: string;
    grade_level: string;
    section: string;
  };
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface ExamSession {
  id: number;
  name: string;
  term: string;
  academic_session: string;
  is_active: boolean;
}

interface TeacherAssignment {
  id: number;
  classroom_name: string;
  section_name: string;
  grade_level_name: string;
  education_level: string;
  subject_name: string;
  subject_code: string;
  subject_id: number;
  grade_level_id: number;
  section_id: number;
  student_count: number;
  periods_per_week: number;
}

interface ClassOption {
  id: number;
  name: string;
  section_name: string;
  grade_level_name: string;
  education_level: string;
  student_count: number;
}

// Enhanced assessment interfaces
interface AssessmentScores {
  // Senior Secondary (Test + Exam)
  test1?: number | string;
  test2?: number | string;
  test3?: number | string;
  exam?: number | string;
  
  // Primary/Junior Secondary (C.A breakdown)
  ca_score?: number | string;
  take_home_marks?: number | string;
  take_home_test?: number | string;
  appearance_marks?: number | string;
  practical_marks?: number | string;
  project_marks?: number | string;
  note_copying_marks?: number | string;
  ca_total?: number | string;
  exam_score?: number | string;
  
  // Nursery (Simple)
  max_marks?: number | string;
  mark_obtained?: number | string;
  
  // Common fields
  total?: number | string;
  position?: number | string;
  grade?: string;
  remarks?: string;
}

interface ClassStatistics {
  class_average?: number;
  highest_in_class?: number;
  lowest_in_class?: number;
  class_position?: number;
  total_students?: number;
}

interface PhysicalDevelopment {
  height_beginning?: number;
  height_end?: number;
  weight_beginning?: number;
  weight_end?: number;
  nurse_comment?: string;
}

// Removed unused EnhancedResultData interface

interface ResultRecordingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void>;
  onResultCreated: () => void;
  editingResult?: any;
}

// Helper functions for education level assessment structures
const getAssessmentStructure = (educationLevel: string) => {
  const level = (educationLevel || '')
    .toString()
    .replace(/_/g, ' ')
    .toLowerCase()
    .trim();
  switch (level) {
    case 'nursery':
      return {
        type: 'nursery',
        fields: ['max_marks', 'mark_obtained'],
        labels: ['Max Marks', 'Mark Obtained'],
        maxValues: [100, 100],
        showPhysicalDevelopment: true,
        showClassStatistics: false
      };
    case 'primary':
      return {
        type: 'primary',
        fields: ['ca_score', 'take_home_marks', 'take_home_test', 'appearance_marks', 'practical_marks', 'project_marks', 'note_copying_marks', 'ca_total', 'exam_score'],
        labels: ['C.A (15)', 'Take Home', 'Take Home Test', 'Appearance', 'Practical', 'Project', 'Note Copying', 'C.A Total', 'Exam (60%)'],
        maxValues: [15, 10, 10, 10, 10, 10, 10, 75, 60],
        showPhysicalDevelopment: true,
        showClassStatistics: true
      };
    case 'junior secondary':
      return {
        type: 'junior',
        fields: ['ca_score', 'take_home_marks', 'take_home_test', 'appearance_marks', 'practical_marks', 'project_marks', 'note_copying_marks', 'ca_total', 'exam_score'],
        labels: ['C.A (15)', 'Take Home', 'Take Home Test', 'Appearance', 'Practical', 'Project', 'Note Copying', 'C.A Total', 'Exam (60%)'],
        maxValues: [15, 10, 10, 10, 10, 10, 10, 75, 60],
        showPhysicalDevelopment: true,
        showClassStatistics: true
      };
    case 'senior secondary':
      return {
        type: 'senior',
        fields: ['test1', 'test2', 'test3', 'exam'],
        labels: ['1st Test (10)', '2nd Test (10)', '3rd Test (10)', 'Exam (70)'],
        maxValues: [10, 10, 10, 70],
        showPhysicalDevelopment: false,
        showClassStatistics: true
      };
    default:
      return {
        type: 'default',
        fields: ['ca_score', 'exam_score'],
        labels: ['CA Score (30)', 'Exam Score (70)'],
        maxValues: [30, 70],
        showPhysicalDevelopment: false,
        showClassStatistics: false
      };
  }
};

const calculateTotalScore = (scores: AssessmentScores, educationLevel: string) => {
  const structure = getAssessmentStructure(educationLevel);
  
  switch (structure.type) {
    case 'nursery':
      return parseFloat(scores.mark_obtained?.toString() || '0');
    case 'primary':
    case 'junior':
      const caTotal = parseFloat(scores.ca_total?.toString() || '0');
      const exam = parseFloat(scores.exam_score?.toString() || '0');
      return caTotal + exam;
    case 'senior':
      const test1 = parseFloat(scores.test1?.toString() || '0');
      const test2 = parseFloat(scores.test2?.toString() || '0');
      const test3 = parseFloat(scores.test3?.toString() || '0');
      const seniorExam = parseFloat(scores.exam?.toString() || '0');
      return test1 + test2 + test3 + seniorExam;
    default:
      const ca = parseFloat(scores.ca_score?.toString() || '0');
      const defaultExam = parseFloat(scores.exam_score?.toString() || '0');
      return ca + defaultExam;
  }
};

const ResultRecordingForm = ({
  isOpen,
  onClose,
  onResultCreated,
  editingResult
}: ResultRecordingFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<string>('');
  
  // Data states
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [gradingSystemId, setGradingSystemId] = useState<number | null>(null);

  const normalizeEducationLevelForApi = (level: string) =>
    (level || '')
      .toString()
      .trim()
      .replace(/\s+/g, '_')
      .toUpperCase();
  
  
  // Enhanced form state for single result
  const [formData, setFormData] = useState({
    student: '',
    subject: '',
    exam_session: '',
    status: 'DRAFT'
  });

  // Enhanced assessment scores
  const [assessmentScores, setAssessmentScores] = useState<AssessmentScores>({});
  const [classStatistics, setClassStatistics] = useState<ClassStatistics>({});
  const [physicalDevelopment, setPhysicalDevelopment] = useState<PhysicalDevelopment>({});

  // Enhanced form state for bulk results
  const [bulkResults, setBulkResults] = useState<Array<{
    student_id: number;
    student_name: string;
    assessment_scores: AssessmentScores;
    class_statistics?: ClassStatistics;
    physical_development?: PhysicalDevelopment;
  }>>([]);

  const [currentTeacherId, setCurrentTeacherId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTeacherData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingResult) {
      setFormData({
        student: (editingResult.student?.id ?? editingResult.student)?.toString(),
        subject: (editingResult.subject?.id ?? editingResult.subject)?.toString(),
        exam_session: (editingResult.exam_session?.id ?? editingResult.exam_session)?.toString(),
        status: editingResult.status || 'DRAFT'
      });
      // Infer education level for structure
      if (editingResult.education_level) {
        const normalizedLevel = (editingResult.education_level || '')
          .toString()
          .replace(/_/g, ' ')
          .toLowerCase()
          .trim();
        setSelectedEducationLevel(normalizedLevel);
      }
      // Map assessment values depending on level
      const maybeSenior = String(editingResult.education_level || '').toUpperCase().includes('SENIOR');
      if (maybeSenior) {
        setAssessmentScores({
          test1: (editingResult.first_test_score ?? editingResult.test1 ?? '').toString(),
          test2: (editingResult.second_test_score ?? editingResult.test2 ?? '').toString(),
          test3: (editingResult.third_test_score ?? editingResult.test3 ?? '').toString(),
          exam: (editingResult.exam_score ?? editingResult.exam ?? '').toString(),
          remarks: editingResult.remarks || ''
        });
      } else {
        setAssessmentScores({
          ca_total: (editingResult.ca_total ?? editingResult.total_ca_score ?? editingResult.ca_score ?? '').toString(),
          exam_score: (editingResult.exam_score ?? editingResult.exam ?? '').toString(),
          remarks: editingResult.remarks || ''
        });
      }

      // Populate classes for the subject so the class dropdown is active
      const subjId = (editingResult.subject?.id ?? editingResult.subject)?.toString();
      if (subjId) {
        // Defer to ensure state is applied before loading
        setTimeout(() => handleSubjectChange(subjId), 0);
      }
    }
  }, [editingResult]);

  // Auto-select class when only one option is available (useful for edit prefill)
  useEffect(() => {
    if (formData.subject && availableClasses.length === 1 && !selectedClass) {
      const onlyClass = availableClasses[0];
      setSelectedClass(String(onlyClass.id));
      setTimeout(() => handleClassChange(String(onlyClass.id)), 0);
    }
  }, [availableClasses]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      
      // Get teacher ID
      const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
      if (!teacherId) {
        throw new Error('Teacher ID not found');
      }
      setCurrentTeacherId(teacherId);

      // Load teacher subjects
      const subjects = await TeacherDashboardService.getTeacherSubjects(teacherId);
      
      // Flatten assignments from subjects
      const assignments: any[] = [];
      const uniqueSubjects: Subject[] = [];
      
      subjects.forEach(subject => {
        // Add to unique subjects list
        const existingSubject = uniqueSubjects.find(s => s.id === subject.id);
        if (!existingSubject) {
          uniqueSubjects.push({
            id: subject.id,
            name: subject.name,
            code: subject.code
          });
        }
        
        // Flatten assignments for this subject
        if (subject.assignments && Array.isArray(subject.assignments)) {
          subject.assignments.forEach((assignment: any) => {
            assignments.push({
              id: assignment.id,
              classroom_name: assignment.classroom_name || 'Unknown',
              section_name: assignment.section || 'Unknown',
              grade_level_name: assignment.grade_level || 'Unknown',
              education_level: assignment.education_level || 'Unknown',
              subject_name: subject.name,
              subject_code: subject.code,
              subject_id: subject.id,
              grade_level_id: assignment.grade_level_id,
              section_id: assignment.classroom_id, // This is actually the classroom_id
              student_count: assignment.student_count || 0,
              periods_per_week: assignment.periods_per_week || 0
            });
          });
        }
      });
      
      setTeacherAssignments(assignments);
      setSubjects(uniqueSubjects);

      // Load exam sessions
      const sessions = await ResultService.getExamSessions();
      setExamSessions(sessions.data || sessions || []);
      // Load active grading systems and pick a default
      try {
        const gsResp = await ResultService.getGradingSystems({ is_active: true });
        const gsArray = Array.isArray(gsResp) ? gsResp : (gsResp?.results || gsResp?.data || []);
        if (gsArray && gsArray.length) {
          const firstId = Number(gsArray[0].id || gsArray[0].pk || gsArray[0]);
          if (!Number.isNaN(firstId)) setGradingSystemId(firstId);
        }
      } catch (e) {
        console.warn('Could not load grading systems; will rely on backend default.', e);
      }

      // Load active grading systems and pick a default
      try {
        const gsResp = await ResultService.getGradingSystems({ is_active: true });
        const gsArray = Array.isArray(gsResp) ? gsResp : (gsResp?.results || gsResp?.data || []);
        if (gsArray && gsArray.length) {
          const firstId = Number(gsArray[0].id || gsArray[0].pk || gsArray[0]);
          if (!Number.isNaN(firstId)) setGradingSystemId(firstId);
        }
      } catch (e) {
        console.warn('Could not load grading systems; will rely on backend default.', e);
      }

    } catch (error) {
      console.error('Error loading teacher data:', error);
      toast.error('Failed to load teacher data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = async (subjectId: string) => {
    console.log('handleSubjectChange called with subjectId:', subjectId, 'currentTeacherId:', currentTeacherId);
    if (!subjectId || !currentTeacherId) {
      console.log('Early return: subjectId or currentTeacherId missing');
      return;
    }

    try {
      // Find all assignments for this subject
      const subjectAssignments = teacherAssignments.filter(a => a.subject_id === parseInt(subjectId));
      console.log('Subject assignments found:', subjectAssignments);
      
      if (subjectAssignments.length === 0) {
        console.log('No assignments found for subject');
        return;
      }

      // Set normalized education level for assessment structure (use first assignment)
      const normalizedLevel = (subjectAssignments[0].education_level || '')
        .toString()
        .replace(/_/g, ' ')
        .toLowerCase()
        .trim();
      setSelectedEducationLevel(normalizedLevel);

      // Create class options from assignments
      const classOptions: ClassOption[] = subjectAssignments.map(assignment => ({
        id: assignment.section_id, // This is actually the classroom_id from the assignment
        name: assignment.classroom_name,
        section_name: assignment.section_name,
        grade_level_name: assignment.grade_level_name,
        education_level: (assignment.education_level || '').toString().replace(/_/g, ' ').toLowerCase().trim(),
        student_count: assignment.student_count
      }));

      console.log('Class options created:', classOptions);
      setAvailableClasses(classOptions);
      
      // Reset class selection and students
      setSelectedClass('');
      // no-op: students state removed
      setFilteredStudents([]);
      setBulkResults([]);

      // Reset assessment scores for single form
      setAssessmentScores({});
      setClassStatistics({});
      setPhysicalDevelopment({});

      console.log('Subject change completed successfully');

    } catch (error) {
      console.error('Error loading subject data:', error);
      toast.error('Failed to load subject data');
    }
  };

  const handleClassChange = async (classId: string) => {
    console.log('handleClassChange called with classId:', classId, 'currentTeacherId:', currentTeacherId);
    if (!classId || !currentTeacherId) {
      console.log('Early return: classId or currentTeacherId missing');
      return;
    }

    try {
      console.log('Loading students for class:', classId);
      // Load students for the selected class
      const studentsData = await TeacherDashboardService.getStudentsForClass(parseInt(classId));
      console.log('Students loaded:', studentsData);
      
      // no-op: students state removed
      setFilteredStudents(studentsData);
      // After loading a class, recompute stats for a clean slate in this context
      setTimeout(recomputeClassStats, 0);

      // Initialize bulk results with enhanced structure
      interface BulkResult {
        student_id: number;
        student_name: string;
        assessment_scores: AssessmentScores;
        class_statistics?: ClassStatistics;
        physical_development?: PhysicalDevelopment;
      }

      const initialBulkResults: BulkResult[] = studentsData.map((student: Student) => ({
        student_id: student.id,
        student_name: student.full_name,
        assessment_scores: {},
        class_statistics: {},
        physical_development: {}
      }));
      setBulkResults(initialBulkResults);

      // Reset assessment scores for single form
      setAssessmentScores({});
      setClassStatistics({});
      setPhysicalDevelopment({});

      console.log('Class change completed successfully');

    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSingleForm()) return;

    try {
      setSaving(true);
      
      // Ensure grading system id before submit
      let gsId = gradingSystemId;
      if (gsId == null) {
        try {
          const gsResp = await ResultService.getGradingSystems({ is_active: true });
          const gsArray = Array.isArray(gsResp) ? gsResp : (gsResp?.results || gsResp?.data || []);
          if (gsArray && gsArray.length) {
            const firstId = Number(gsArray[0].id || gsArray[0].pk || gsArray[0]);
            if (!Number.isNaN(firstId)) {
              gsId = firstId;
              setGradingSystemId(firstId);
            }
          }
        } catch {}
      }
      // Calculate total score
      const totalScore = calculateTotalScore(assessmentScores, selectedEducationLevel);
      
      // Prepare enhanced result data
      const structure = getAssessmentStructure(selectedEducationLevel);
      let ca_score = 0;
      let exam_score = 0;
      let education_level = normalizeEducationLevelForApi(selectedEducationLevel);

      // Extract ca_score and exam_score based on education level
      if (structure.type === 'senior') {
        ca_score =
          parseFloat(assessmentScores.test1?.toString() || '0') +
          parseFloat(assessmentScores.test2?.toString() || '0') +
          parseFloat(assessmentScores.test3?.toString() || '0');
        exam_score = parseFloat(assessmentScores.exam?.toString() || '0');
      } else if (structure.type === 'nursery') {
        ca_score = parseFloat(assessmentScores.mark_obtained?.toString() || '0');
        exam_score = 0;
      } else {
        ca_score = parseFloat(assessmentScores.ca_total?.toString() || assessmentScores.ca_score?.toString() || '0');
        exam_score = parseFloat(assessmentScores.exam_score?.toString() || '0');
      }

      let resultData: any;
      if (structure.type === 'senior') {
        resultData = {
          student: formData.student,
          subject: formData.subject,
          exam_session: formData.exam_session,
          grading_system: gsId ?? undefined,
          first_test_score: parseFloat(assessmentScores.test1?.toString() || '0'),
          second_test_score: parseFloat(assessmentScores.test2?.toString() || '0'),
          third_test_score: parseFloat(assessmentScores.test3?.toString() || '0'),
          exam_score: parseFloat(assessmentScores.exam?.toString() || '0'),
          teacher_remark: assessmentScores.remarks || '',
          status: formData.status,
          education_level,
        };
      } else {
        resultData = {
          student: formData.student,
          subject: formData.subject,
          exam_session: formData.exam_session,
          grading_system: gsId ?? undefined,
          ca_score,
          exam_score,
          total_score: totalScore,
          grade: getGrade(totalScore),
          remarks: assessmentScores.remarks || '',
          status: formData.status,
          education_level,
          class_statistics: classStatistics,
          physical_development: physicalDevelopment
        };
      }

      if (editingResult) {
        await ResultService.updateStudentResult(editingResult.id, resultData);
        toast.success('Result updated successfully!');
      } else {
        await ResultService.createStudentResult(resultData);
        toast.success('Result recorded successfully!');
      }

      onResultCreated();
      onClose();
    } catch (error) {
      console.error('Error saving result:', error);
      toast.error('Failed to save result. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBulkForm()) return;

    try {
      setSaving(true);
      
      const validResults = bulkResults.filter(result => {
        const total = calculateTotalScore(result.assessment_scores, selectedEducationLevel);
        return total > 0;
      });

      // Ensure grading system id before submit
      let gsId = gradingSystemId;
      if (gsId == null) {
        try {
          const gsResp = await ResultService.getGradingSystems({ is_active: true });
          const gsArray = Array.isArray(gsResp) ? gsResp : (gsResp?.results || gsResp?.data || []);
          if (gsArray && gsArray.length) {
            const firstId = Number(gsArray[0].id || gsArray[0].pk || gsArray[0]);
            if (!Number.isNaN(firstId)) {
              gsId = firstId;
              setGradingSystemId(firstId);
            }
          }
        } catch {}
      }

      for (const result of validResults) {
        const totalScore = calculateTotalScore(result.assessment_scores, selectedEducationLevel);
        
        // Map assessment_scores to top-level fields
        const structure = getAssessmentStructure(selectedEducationLevel);
        let ca_score = 0;
        let exam_score = 0;
        let education_level = normalizeEducationLevelForApi(selectedEducationLevel);

        // Extract ca_score and exam_score based on education level
        if (structure.type === 'senior') {
          ca_score = 
            parseFloat(result.assessment_scores.test1?.toString() || '0') +
            parseFloat(result.assessment_scores.test2?.toString() || '0') +
            parseFloat(result.assessment_scores.test3?.toString() || '0');
          exam_score = parseFloat(result.assessment_scores.exam?.toString() || '0');
        } else if (structure.type === 'nursery') {
          ca_score = parseFloat(result.assessment_scores.mark_obtained?.toString() || '0');
          exam_score = 0;
        } else {
          ca_score = parseFloat(result.assessment_scores.ca_total?.toString() || result.assessment_scores.ca_score?.toString() || '0');
          exam_score = parseFloat(result.assessment_scores.exam_score?.toString() || '0');
        }

        let resultData: any;
        if (structure.type === 'senior') {
          resultData = {
            student: result.student_id.toString(),
            subject: formData.subject,
            exam_session: formData.exam_session,
            grading_system: gsId ?? undefined,
            first_test_score: parseFloat(result.assessment_scores.test1?.toString() || '0'),
            second_test_score: parseFloat(result.assessment_scores.test2?.toString() || '0'),
            third_test_score: parseFloat(result.assessment_scores.test3?.toString() || '0'),
            exam_score: parseFloat(result.assessment_scores.exam?.toString() || '0'),
            teacher_remark: result.assessment_scores.remarks || '',
            status: 'DRAFT',
            education_level,
          };
        } else {
          resultData = {
            student: result.student_id.toString(),
            subject: formData.subject,
            exam_session: formData.exam_session,
            grading_system: gsId ?? undefined,
            ca_score,
            exam_score,
            total_score: totalScore,
            grade: getGrade(totalScore),
            remarks: result.assessment_scores.remarks || '',
            status: 'DRAFT',
            education_level,
          };
        }

        await ResultService.createStudentResult(resultData);
      }

      toast.success(`${validResults.length} results recorded successfully!`);
      onResultCreated();
      onClose();
    } catch (error) {
      console.error('Error saving bulk results:', error);
      toast.error('Failed to save results. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const validateSingleForm = () => {
    if (!formData.student) {
      toast.error('Please select a student');
      return false;
    }
    if (!formData.subject) {
      toast.error('Please select a subject');
      return false;
    }
    if (!selectedClass) {
      toast.error('Please select a class');
      return false;
    }
    if (!formData.exam_session) {
      toast.error('Please select an exam session');
      return false;
    }

    const structure = getAssessmentStructure(selectedEducationLevel);
    const totalScore = calculateTotalScore(assessmentScores, selectedEducationLevel);
    
    if (totalScore <= 0) {
      toast.error('Please enter at least one valid score');
      return false;
    }

    // Validate individual scores based on education level
    for (let i = 0; i < structure.fields.length; i++) {
      const field = structure.fields[i];
      const value = assessmentScores[field as keyof AssessmentScores];
      const maxValue = structure.maxValues[i];
      
      if (value && value !== '') {
        const numValue = parseFloat(value.toString());
        if (isNaN(numValue) || numValue < 0 || numValue > maxValue) {
          toast.error(`${structure.labels[i]} must be between 0 and ${maxValue}`);
          return false;
        }
      }
    }

    return true;
  };

  const validateBulkForm = () => {
    if (!formData.subject) {
      toast.error('Please select a subject');
      return false;
    }
    if (!selectedClass) {
      toast.error('Please select a class');
      return false;
    }
    if (!formData.exam_session) {
      toast.error('Please select an exam session');
      return false;
    }

    const validResults = bulkResults.filter(result => {
      const total = calculateTotalScore(result.assessment_scores, selectedEducationLevel);
      return total > 0;
    });

    if (validResults.length === 0) {
      toast.error('Please enter scores for at least one student');
      return false;
    }

    // Validate each result
    const structure = getAssessmentStructure(selectedEducationLevel);
    for (const result of validResults) {
      for (let i = 0; i < structure.fields.length; i++) {
        const field = structure.fields[i];
        const value = result.assessment_scores[field as keyof AssessmentScores];
        const maxValue = structure.maxValues[i];
        
        if (value && value !== '') {
          const numValue = parseFloat(value.toString());
          if (isNaN(numValue) || numValue < 0 || numValue > maxValue) {
            toast.error(`Invalid ${structure.labels[i]} for ${result.student_name}. Must be 0-${maxValue}`);
            return false;
          }
        }
      }
    }

    return true;
  };

  const updateBulkResult = (index: number, field: string, value: string) => {
    setBulkResults(prev => prev.map((result, i) => 
      i === index ? { 
        ...result, 
        assessment_scores: { 
          ...result.assessment_scores, 
          [field]: value 
        } 
      } : result
    ));
    // Recompute stats after change
    setTimeout(recomputeClassStats, 0);
  };

  const updateAssessmentScore = (field: keyof AssessmentScores, value: string) => {
    setAssessmentScores(prev => ({ ...prev, [field]: value }));
    // Recompute stats for single entry context
    setTimeout(recomputeClassStats, 0);
  };

  // Removed manual update; stats are computed automatically

  const updatePhysicalDevelopment = (field: keyof PhysicalDevelopment, value: string | number) => {
    setPhysicalDevelopment(prev => ({ ...prev, [field]: value }));
  };

  const getGrade = (total: number) => {
    if (total >= 80) return 'A';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    if (total >= 50) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    const gradeConfig = {
      'A': 'text-green-600 bg-green-100',
      'B': 'text-blue-600 bg-blue-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100'
    };
    return gradeConfig[grade as keyof typeof gradeConfig] || 'text-gray-600 bg-gray-100';
  };

  const resetForm = () => {
    setFormData({
      student: '',
      subject: '',
      exam_session: '',
      status: 'DRAFT'
    });
    setAssessmentScores({});
    setClassStatistics({});
    setPhysicalDevelopment({});
    setBulkResults([]);
    // no-op: students state removed
    setFilteredStudents([]);
    setSelectedEducationLevel('');
    setAvailableClasses([]);
    setSelectedClass('');
  };

  // Recompute class statistics based on bulkResults totals (and current single form if present)
  const recomputeClassStats = () => {
    try {
      const totals: number[] = [];
      // Include bulk rows with a positive total
      bulkResults.forEach((r) => {
        const t = calculateTotalScore(r.assessment_scores, selectedEducationLevel);
        if (!isNaN(t) && t >= 0) totals.push(t);
      });
      // Include single form total if a student is selected and there is any score
      const singleSelected = formData.student && formData.student !== '';
      const singleTotal = calculateTotalScore(assessmentScores, selectedEducationLevel);
      if (singleSelected && singleTotal >= 0) totals.push(singleTotal);
      if (totals.length === 0) {
        setClassStatistics({});
        return;
      }
      const sum = totals.reduce((a, b) => a + b, 0);
      const avg = parseFloat((sum / totals.length).toFixed(2));
      const high = Math.max(...totals);
      const low = Math.min(...totals);
      // For single form, compute provisional position among current totals
      let position: number | undefined = undefined;
      if (singleSelected) {
        const sorted = [...totals].sort((a, b) => b - a);
        position = sorted.indexOf(singleTotal) + 1;
      }
      setClassStatistics((prev) => ({
        ...prev,
        class_average: avg,
        highest_in_class: high,
        lowest_in_class: low,
        class_position: position,
        total_students: totals.length,
      }));
    } catch (e) {
      // Silent fail to avoid blocking typing
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Component to render assessment fields dynamically
  const renderAssessmentFields = (scores: AssessmentScores, onUpdate: (field: keyof AssessmentScores, value: string) => void) => {
    const structure = getAssessmentStructure(selectedEducationLevel);
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Assessment Scores ({structure.type.toUpperCase()})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {structure.fields.map((field, index) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {structure.labels[index]} (0-{structure.maxValues[index]})
              </label>
              <input
                type="number"
                min="0"
                max={structure.maxValues[index]}
                step="0.1"
                value={scores[field as keyof AssessmentScores] || ''}
                onChange={(e) => onUpdate(field as keyof AssessmentScores, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder={`Enter ${structure.labels[index]}`}
              />
            </div>
          ))}
        </div>
        
        {/* Total Score Display */}
        {(() => {
          const total = calculateTotalScore(scores, selectedEducationLevel);
          return total > 0 ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Score:</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{total}</span>
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(getGrade(total))}`}>
                  Grade: {getGrade(total)}
                </span>
              </div>
            </div>
          ) : null;
        })()}
      </div>
    );
  };

  // Component to render class statistics
  const renderClassStatistics = (stats: ClassStatistics) => {
    const structure = getAssessmentStructure(selectedEducationLevel);
    if (!structure.showClassStatistics) return null;

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Class Statistics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Class Average (auto)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={stats.class_average || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Highest in Class (auto)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={stats.highest_in_class || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lowest in Class (auto)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={stats.lowest_in_class || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Class Position (auto for single entry)
            </label>
            <input
              type="number"
              min="1"
              value={stats.class_position || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>
      </div>
    );
  };

  // Component to render physical development
  const renderPhysicalDevelopment = (physical: PhysicalDevelopment, onUpdate: (field: keyof PhysicalDevelopment, value: string | number) => void) => {
    const structure = getAssessmentStructure(selectedEducationLevel);
    if (!structure.showPhysicalDevelopment) return null;

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Physical Development
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Height (Beginning of Term) - cm
            </label>
            <input
              type="number"
              min="0"
              value={physical.height_beginning || ''}
              onChange={(e) => onUpdate('height_beginning', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Height in cm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Height (End of Term) - cm
            </label>
            <input
              type="number"
              min="0"
              value={physical.height_end || ''}
              onChange={(e) => onUpdate('height_end', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Height in cm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weight (Beginning of Term) - kg
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={physical.weight_beginning || ''}
              onChange={(e) => onUpdate('weight_beginning', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Weight in kg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weight (End of Term) - kg
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={physical.weight_end || ''}
              onChange={(e) => onUpdate('weight_end', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Weight in kg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nurse's Comment
            </label>
            <textarea
              value={physical.nurse_comment || ''}
              onChange={(e) => onUpdate('nurse_comment', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Nurse's comment on physical development"
            />
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingResult ? 'Edit Result' : 'Record Student Result'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('single')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'single'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Single Result
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bulk'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Bulk Results
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Single Result Form */}
              {activeTab === 'single' && (
                <form onSubmit={handleSingleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subject Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject *
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, subject: e.target.value, student: '' }));
                          handleSubjectChange(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Class Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Class *
                      </label>
                      <select
                        value={selectedClass}
                        onChange={(e) => {
                          console.log('Class selection changed:', e.target.value);
                          setSelectedClass(e.target.value);
                          setFormData(prev => ({ ...prev, student: '' }));
                          handleClassChange(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                        disabled={!formData.subject || availableClasses.length === 0}
                      >
                        <option value="">Select Class</option>
                        {availableClasses.map(classOption => (
                          <option key={classOption.id} value={classOption.id}>
                            {classOption.grade_level_name} {classOption.section_name} ({classOption.student_count} students)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Exam Session */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Exam Session *
                      </label>
                      <select
                        value={formData.exam_session}
                        onChange={(e) => setFormData(prev => ({ ...prev, exam_session: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select Exam Session</option>
                        {examSessions.map(session => (
                          <option key={session.id} value={session.id}>
                            {session.name} - {session.term} {session.academic_session}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Student Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Student * 
                        <span className="text-xs text-gray-500 ml-2">
                          (selectedClass: {selectedClass}, students: {filteredStudents.length})
                        </span>
                      </label>
                      <select
                        value={formData.student}
                        onChange={(e) => {
                          console.log('Student selection changed:', e.target.value);
                          setFormData(prev => ({ ...prev, student: e.target.value }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                        disabled={!selectedClass || filteredStudents.length === 0}
                      >
                        <option value="">Select Student</option>
                        {filteredStudents.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.full_name} ({student.registration_number})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="REVIEWED">Reviewed</option>
                      </select>
                    </div>

                  </div>

                  {/* Enhanced Assessment Fields */}
                  {selectedEducationLevel && (
                    <>
                      {renderAssessmentFields(assessmentScores, updateAssessmentScore)}
                      
                      {/* Remarks */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Teacher's Remarks
                        </label>
                        <textarea
                          value={assessmentScores.remarks || ''}
                          onChange={(e) => updateAssessmentScore('remarks', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Enter any remarks about the student's performance..."
                        />
                      </div>

                      {/* Class Statistics */}
                      {renderClassStatistics(classStatistics)}

                      {/* Physical Development */}
                      {renderPhysicalDevelopment(physicalDevelopment, updatePhysicalDevelopment)}
                    </>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {editingResult ? 'Update Result' : 'Record Result'}
                    </button>
                  </div>
                </form>
              )}

              {/* Bulk Results Form */}
              {activeTab === 'bulk' && (
                <form onSubmit={handleBulkSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subject Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject *
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, subject: e.target.value }));
                          handleSubjectChange(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Class Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Class *
                      </label>
                      <select
                        value={selectedClass}
                        onChange={(e) => {
                          setSelectedClass(e.target.value);
                          handleClassChange(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                        disabled={!formData.subject || availableClasses.length === 0}
                      >
                        <option value="">Select Class</option>
                        {availableClasses.map(classOption => (
                          <option key={classOption.id} value={classOption.id}>
                            {classOption.grade_level_name} {classOption.section_name} ({classOption.student_count} students)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Exam Session */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Exam Session *
                      </label>
                      <select
                        value={formData.exam_session}
                        onChange={(e) => setFormData(prev => ({ ...prev, exam_session: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select Exam Session</option>
                        {examSessions.map(session => (
                          <option key={session.id} value={session.id}>
                            {session.name} - {session.term} {session.academic_session}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Enhanced Bulk Results Table */}
                  {bulkResults.length > 0 && selectedEducationLevel && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Enter Scores for Students ({getAssessmentStructure(selectedEducationLevel).type.toUpperCase()})
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-600">
                              <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Student
                              </th>
                              {getAssessmentStructure(selectedEducationLevel).fields.map((field, index) => (
                                <th key={field} className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {getAssessmentStructure(selectedEducationLevel).labels[index]}
                                </th>
                              ))}
                              <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Total
                              </th>
                              <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Grade
                              </th>
                              <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Remarks
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkResults.map((result, index) => {
                              const total = calculateTotalScore(result.assessment_scores, selectedEducationLevel);
                              const grade = getGrade(total);
                              return (
                                <tr key={result.student_id} className="border-b border-gray-200 dark:border-gray-600">
                                  <td className="py-2 px-3 text-sm text-gray-900 dark:text-white">
                                    {result.student_name}
                                  </td>
                                  {getAssessmentStructure(selectedEducationLevel).fields.map((field, fieldIndex) => (
                                    <td key={field} className="py-2 px-3">
                                      <input
                                        type="number"
                                        min="0"
                                        max={getAssessmentStructure(selectedEducationLevel).maxValues[fieldIndex]}
                                        step="0.1"
                                        value={result.assessment_scores[field as keyof AssessmentScores] || ''}
                                        onChange={(e) => updateBulkResult(index, field, e.target.value)}
                                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="0"
                                      />
                                    </td>
                                  ))}
                                  <td className="py-2 px-3 text-sm font-medium text-gray-900 dark:text-white">
                                    {total > 0 ? total : '-'}
                                  </td>
                                  <td className="py-2 px-3">
                                    {total > 0 && (
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(grade)}`}>
                                        {grade}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="text"
                                      value={result.assessment_scores.remarks || ''}
                                      onChange={(e) => updateBulkResult(index, 'remarks', e.target.value)}
                                      className="w-32 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                      placeholder="Remarks"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving || bulkResults.length === 0}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Record {bulkResults.filter(r => calculateTotalScore(r.assessment_scores, selectedEducationLevel) > 0).length} Results
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultRecordingForm;