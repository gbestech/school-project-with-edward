
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import TeacherDashboardService from '@/services/TeacherDashboardService';
// import ResultService from '@/services/ResultService';
// import ResultSettingsService from '@/services/ResultSettingsService';
// import { toast } from 'react-toastify';
// import { 
//   X, 
//   Save, 
//   User,
//   FileText,
//   GraduationCap,
//   Users,
//   TrendingUp,
//   BarChart3
// } from 'lucide-react';

// interface Student {
//   id: number;
//   full_name: string;
//   registration_number: string;
//   profile_picture?: string;
//   classroom: {
//     id: number;
//     name: string;
//     grade_level: string;
//     section: string;
//   };
// }

// interface Subject {
//   id: number;
//   name: string;
//   code: string;
// }

// interface ExamSession {
//   id: number;
//   name: string;
//   term: string;
//   academic_session: string;
//   is_active: boolean;
// }

// interface TeacherAssignment {
//   id: number;
//   classroom_name: string;
//   section_name: string;
//   grade_level_name: string;
//   education_level: string;
//   subject_name: string;
//   subject_code: string;
//   subject_id: number;
//   grade_level_id: number;
//   section_id: number;
//   student_count: number;
//   periods_per_week: number;
// }

// interface ClassOption {
//   id: number;
//   name: string;
//   section_name: string;
//   grade_level_name: string;
//   education_level: string;
//   student_count: number;
// }

// // Enhanced assessment interfaces
// interface AssessmentScores {
//   // Senior Secondary (Test + Exam)
//   test1?: number | string;
//   test2?: number | string;
//   test3?: number | string;
//   exam?: number | string;
  
//   // Primary/Junior Secondary (C.A breakdown)
//   ca_score?: number | string;
//   take_home_marks?: number | string;
//   take_home_test?: number | string;
//   appearance_marks?: number | string;
//   practical_marks?: number | string;
//   project_marks?: number | string;
//   note_copying_marks?: number | string;
//   ca_total?: number | string;
//   exam_score?: number | string;
  
//   // Nursery (Simple)
//   max_marks?: number | string;
//   mark_obtained?: number | string;
  
//   // Common fields
//   total?: number | string;
//   position?: number | string;
//   grade?: string;
//   remarks?: string;
// }

// interface ClassStatistics {
//   class_average?: number;
//   highest_in_class?: number;
//   lowest_in_class?: number;
//   class_position?: number;
//   total_students?: number;
// }

// interface PhysicalDevelopment {
//   height_beginning?: number;
//   height_end?: number;
//   weight_beginning?: number;
//   weight_end?: number;
//   nurse_comment?: string;
// }

// // Removed unused EnhancedResultData interface

// interface ResultRecordingFormProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess?: () => Promise<void>;
//   onResultCreated: () => void;
//   editResult?: any;
//   mode?: 'create' | 'edit';
  
// }

// // Helper functions for education level assessment structures
// const getAssessmentStructure = (educationLevel: string, scoringConfig?: any) => {
//   const level = (educationLevel || '')
//     .toString()
//     .replace(/_/g, ' ')
//     .toLowerCase()
//     .trim();

//   // If a scoring configuration is provided, prefer it to build dynamic fields
//   if (scoringConfig) {
//     const upperLevel = (educationLevel || '')
//       .toString()
//       .replace(/\s+/g, '_')
//       .toUpperCase();

//     if (upperLevel === 'SENIOR_SECONDARY') {
//       return {
//         type: 'senior',
//         fields: ['test1', 'test2', 'test3', 'exam'],
//         labels: [
//           `1st Test (${Number(scoringConfig.first_test_max_score) || 10})`,
//           `2nd Test (${Number(scoringConfig.second_test_max_score) || 10})`,
//           `3rd Test (${Number(scoringConfig.third_test_max_score) || 10})`,
//           `Exam (${Number(scoringConfig.exam_max_score) || 70})`
//         ],
//         maxValues: [
//           Number(scoringConfig.first_test_max_score) || 10,
//           Number(scoringConfig.second_test_max_score) || 10,
//           Number(scoringConfig.third_test_max_score) || 10,
//           Number(scoringConfig.exam_max_score) || 70
//         ],
//         showPhysicalDevelopment: false,
//         showClassStatistics: true
//       };
//     }

//     if (upperLevel === 'PRIMARY' || upperLevel === 'JUNIOR_SECONDARY') {
//       return {
//         type: upperLevel === 'PRIMARY' ? 'primary' : 'junior',
//         fields: [
//           'ca_score',
//           'take_home_marks',
//           'take_home_test',
//           'appearance_marks',
//           'practical_marks',
//           'project_marks',
//           'note_copying_marks',
//           'ca_total',
//           'exam_score'
//         ],
//         labels: [
//           `C.A (${Number(scoringConfig.continuous_assessment_max_score) || 15})`,
//           'Take Home',
//           `Take Home Test (${Number(scoringConfig.take_home_test_max_score) || 10})`,
//           `Appearance (${Number(scoringConfig.appearance_max_score) || 10})`,
//           `Practical (${Number(scoringConfig.practical_max_score) || 10})`,
//           `Project (${Number(scoringConfig.project_max_score) || 10})`,
//           `Note Copying (${Number(scoringConfig.note_copying_max_score) || 10})`,
//           `C.A Total (${Number(scoringConfig.total_ca_max_score) || 75})`,
//           `Exam (${Number(scoringConfig.exam_max_score) || 60})`
//         ],
//         maxValues: [
//           Number(scoringConfig.continuous_assessment_max_score) || 15,
//           10,
//           Number(scoringConfig.take_home_test_max_score) || 10,
//           Number(scoringConfig.appearance_max_score) || 10,
//           Number(scoringConfig.practical_max_score) || 10,
//           Number(scoringConfig.project_max_score) || 10,
//           Number(scoringConfig.note_copying_max_score) || 10,
//           Number(scoringConfig.total_ca_max_score) || 75,
//           Number(scoringConfig.exam_max_score) || 60
//         ],
//         showPhysicalDevelopment: true,
//         showClassStatistics: true
//       };
//     }

//     if (upperLevel === 'NURSERY') {
//       const totalMax = Number(scoringConfig.total_max_score) || 100;
//       return {
//         type: 'nursery',
//         fields: ['max_marks', 'mark_obtained'],
//         labels: ['Max Marks', 'Mark Obtained'],
//         maxValues: [totalMax, totalMax],
//         showPhysicalDevelopment: true,
//         showClassStatistics: false
//       };
//     }
//   }

//   switch (level) {
//     case 'nursery':
//       return {
//         type: 'nursery',
//         fields: ['max_marks', 'mark_obtained'],
//         labels: ['Max Marks', 'Mark Obtained'],
//         maxValues: [100, 100],
//         showPhysicalDevelopment: true,
//         showClassStatistics: false
//       };
//     case 'primary':
//       return {
//         type: 'primary',
//         fields: ['ca_score', 'take_home_marks', 'take_home_test', 'appearance_marks', 'practical_marks', 'project_marks', 'note_copying_marks', 'ca_total', 'exam_score'],
//         labels: ['C.A (15)', 'Take Home', 'Take Home Test', 'Appearance', 'Practical', 'Project', 'Note Copying', 'C.A Total', 'Exam (60%)'],
//         maxValues: [15, 10, 10, 10, 10, 10, 10, 75, 60],
//         showPhysicalDevelopment: true,
//         showClassStatistics: true
//       };
//     case 'junior secondary':
//       return {
//         type: 'junior',
//         fields: ['ca_score', 'take_home_marks', 'take_home_test', 'appearance_marks', 'practical_marks', 'project_marks', 'note_copying_marks', 'ca_total', 'exam_score'],
//         labels: ['C.A (15)', 'Take Home', 'Take Home Test', 'Appearance', 'Practical', 'Project', 'Note Copying', 'C.A Total', 'Exam (60%)'],
//         maxValues: [15, 10, 10, 10, 10, 10, 10, 75, 60],
//         showPhysicalDevelopment: true,
//         showClassStatistics: true
//       };
//     case 'senior secondary':
//       return {
//         type: 'senior',
//         fields: ['test1', 'test2', 'test3', 'exam'],
//         labels: ['1st Test (10)', '2nd Test (10)', '3rd Test (10)', 'Exam (70)'],
//         maxValues: [10, 10, 10, 70],
//         showPhysicalDevelopment: false,
//         showClassStatistics: true
//       };
//     default:
//       return {
//         type: 'default',
//         fields: ['ca_score', 'exam_score'],
//         labels: ['CA Score (30)', 'Exam Score (70)'],
//         maxValues: [30, 70],
//         showPhysicalDevelopment: false,
//         showClassStatistics: false
//       };
//   }
// };

// const calculateTotalScore = (scores: AssessmentScores, educationLevel: string) => {
//   const structure = getAssessmentStructure(educationLevel);
  
//   switch (structure.type) {
//     case 'nursery':
//       return parseFloat(scores.mark_obtained?.toString() || '0');
//     case 'primary':
//     case 'junior':
//       const caTotal = parseFloat(scores.ca_total?.toString() || '0');
//       const exam = parseFloat(scores.exam_score?.toString() || '0');
//       return caTotal + exam;
//     case 'senior':
//       const test1 = parseFloat(scores.test1?.toString() || '0');
//       const test2 = parseFloat(scores.test2?.toString() || '0');
//       const test3 = parseFloat(scores.test3?.toString() || '0');
//       const seniorExam = parseFloat(scores.exam?.toString() || '0');
//       return test1 + test2 + test3 + seniorExam;
//     default:
//       const ca = parseFloat(scores.ca_score?.toString() || '0');
//       const defaultExam = parseFloat(scores.exam_score?.toString() || '0');
//       return ca + defaultExam;
//   }
// };

// const ResultRecordingForm = ({
//   isOpen,
//   onClose,
//   onResultCreated,
//   editResult
  
// }: ResultRecordingFormProps) => {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
//   const [selectedEducationLevel, setSelectedEducationLevel] = useState<string>('');
  
//   // Data states
//   const [subjects, setSubjects] = useState<Subject[]>([]);
//   const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
//   const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
//   const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
//   const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([]);
//   const [selectedClass, setSelectedClass] = useState<string>('');
//   const [gradingSystemId, setGradingSystemId] = useState<number | null>(null);
//   const [scoringConfigs, setScoringConfigs] = useState<any[]>([]);
//   const [activeScoringConfig, setActiveScoringConfig] = useState<any | null>(null);

//   const normalizeEducationLevelForApi = (level: string) =>
//     (level || '')
//       .toString()
//       .trim()
//       .replace(/\s+/g, '_')
//       .toUpperCase();
  
  
//   // Enhanced form state for single result
//   const [formData, setFormData] = useState({
//     student: '',
//     subject: '',
//     exam_session: '',
//     status: 'DRAFT'
//   });

//   // Enhanced assessment scores
//   const [assessmentScores, setAssessmentScores] = useState<AssessmentScores>({});
//   const [classStatistics, setClassStatistics] = useState<ClassStatistics>({});
//   const [physicalDevelopment, setPhysicalDevelopment] = useState<PhysicalDevelopment>({});

//   // Enhanced form state for bulk results
//   const [bulkResults, setBulkResults] = useState<Array<{
//     student_id: number;
//     student_name: string;
//     assessment_scores: AssessmentScores;
//     class_statistics?: ClassStatistics;
//     physical_development?: PhysicalDevelopment;
//   }>>([]);

//   const [currentTeacherId, setCurrentTeacherId] = useState<number | null>(null);

//   useEffect(() => {
//     if (isOpen) {
//       loadTeacherData();
//     }
//   }, [isOpen]);

  
// useEffect(() => {
//   if (editResult && teacherAssignments.length > 0 && currentTeacherId) {
//     console.log('Setting up edit mode with editResult:', editResult);
    
//     const setupEditResult = async () => {
//       try {
//         // Set form data first
//         const studentId = (editResult.student?.id ?? editResult.student_id ?? editResult.student)?.toString();
//         const subjectId = (editResult.subject?.id ?? editResult.subject_id ?? editResult.subject)?.toString();
//         const examSessionId = (editResult.exam_session?.id ?? editResult.exam_session_id ?? editResult.exam_session)?.toString();
        
//         setFormData({
//           student: studentId,
//           subject: subjectId,
//           exam_session: examSessionId,
//           status: editResult.status || 'DRAFT'
//         });
        
//         // Set education level FIRST before setting scores
//         let normalizedLevel = '';
//         if (editResult.education_level) {
//           normalizedLevel = (editResult.education_level || '')
//             .toString()
//             .replace(/_/g, ' ')
//             .toLowerCase()
//             .trim();
//           setSelectedEducationLevel(normalizedLevel);
//         }
        
//         // Set up class data
//         if (subjectId) {
//           const subjectAssignments = teacherAssignments.filter(a => a.subject_id === parseInt(subjectId));
          
//           if (subjectAssignments.length > 0) {
//             // If we don't have normalized level yet, get it from assignments
//             if (!normalizedLevel) {
//               normalizedLevel = (subjectAssignments[0].education_level || '')
//                 .toString()
//                 .replace(/_/g, ' ')
//                 .toLowerCase()
//                 .trim();
//               setSelectedEducationLevel(normalizedLevel);
//             }
            
//             const classOptions = subjectAssignments.map(assignment => ({
//               id: assignment.section_id,
//               name: assignment.classroom_name,
//               section_name: assignment.section_name,
//               grade_level_name: assignment.grade_level_name,
//               education_level: normalizedLevel,
//               student_count: assignment.student_count
//             }));
            
//             setAvailableClasses(classOptions);
            
//             // Find and set the correct class
//             if (studentId) {
//               try {
//                 const studentClassPromises = classOptions.map(async (classOption) => {
//                   try {
//                     const classStudents = await TeacherDashboardService.getStudentsForClass(classOption.id);
//                     const studentExists = classStudents.find((s: Student) => s.id.toString() === studentId);
//                     return studentExists ? classOption : null;
//                   } catch {
//                     return null;
//                   }
//                 });
                
//                 const results = await Promise.all(studentClassPromises);
//                 const studentClass = results.find(result => result !== null);
                
//                 if (studentClass) {
//                   const classId = studentClass.id.toString();
//                   setSelectedClass(classId);
                  
//                   // Load students for this class
//                   const studentsData = await TeacherDashboardService.getStudentsForClass(studentClass.id);
//                   setFilteredStudents(studentsData);
//                 }
//               } catch (error) {
//                 console.error('Error finding student class:', error);
//               }
//             }
//           }
//         }
        
//         // NOW set the assessment scores after education level is established
//         const educationLevel = String(editResult.education_level || '').toUpperCase();
//         console.log('Teacher Remark found:', editResult.remarks || editResult.teacher_remark);
//         if (educationLevel.includes('SENIOR')) {
//           setAssessmentScores({
//             test1: (editResult.first_test_score ?? editResult.test1 ?? 0).toString(),
//             test2: (editResult.second_test_score ?? editResult.test2 ?? 0).toString(), 
//             test3: (editResult.third_test_score ?? editResult.test3 ?? 0).toString(),
//             exam: (editResult.exam_score ?? editResult.exam ?? 0).toString(),
//             remarks: editResult.remarks || editResult.teacher_remark || ''
//           });
          
//         } else if (educationLevel.includes('NURSERY')) {
//           setAssessmentScores({
//             max_marks: (editResult.max_marks ?? 100).toString(),
//             mark_obtained: (editResult.mark_obtained ?? editResult.total_score ?? editResult.ca_score ?? 0).toString(),
//             remarks: editResult.remarks || editResult.teacher_remark || ''
//           });
          
//         } else if (educationLevel.includes('PRIMARY') || educationLevel.includes('JUNIOR')) {
//           setAssessmentScores({
//             ca_score: (editResult.ca_score ?? editResult.continuous_assessment_score ?? 0).toString(),
//             take_home_marks: (editResult.take_home_marks ?? editResult.take_home_score ?? 0).toString(),
//             take_home_test: (editResult.take_home_test ?? editResult.take_home_test_score ?? 0).toString(),
//             appearance_marks: (editResult.appearance_marks ?? editResult.appearance_score ?? 0).toString(),
//             practical_marks: (editResult.practical_marks ?? editResult.practical_score ?? 0).toString(),
//             project_marks: (editResult.project_marks ?? editResult.project_score ?? 0).toString(),
//             note_copying_marks: (editResult.note_copying_marks ?? editResult.note_copying_score ?? 0).toString(),
//             ca_total: (editResult.ca_total ?? editResult.total_ca_score ?? 0).toString(),
//             exam_score: (editResult.exam_score ?? editResult.exam ?? 0).toString(),
//             remarks: editResult.remarks || editResult.teacher_remark || ''
//           });
          
//           // Set physical development if available
//           if (editResult.physical_development || editResult.height_beginning) {
//             setPhysicalDevelopment({
//               height_beginning: editResult.physical_development?.height_beginning ?? editResult.height_beginning ?? 0,
//               height_end: editResult.physical_development?.height_end ?? editResult.height_end ?? 0,
//               weight_beginning: editResult.physical_development?.weight_beginning ?? editResult.weight_beginning ?? 0,
//               weight_end: editResult.physical_development?.weight_end ?? editResult.weight_end ?? 0,
//               nurse_comment: editResult.physical_development?.nurse_comment ?? editResult.nurse_comment ?? ''
//             });
//           }
          
//         } else {
//           setAssessmentScores({
//             ca_score: (editResult.ca_score ?? editResult.continuous_assessment_score ?? 0).toString(),
//             exam_score: (editResult.exam_score ?? editResult.exam ?? 0).toString(),
//             remarks: editResult.remarks || editResult.teacher_remark || ''
//           });
//         }
        
//         // Set class statistics if available
//         if (editResult.class_statistics || editResult.class_average) {
//           setClassStatistics({
//             class_average: editResult.class_statistics?.class_average ?? editResult.class_average ?? 0,
//             highest_in_class: editResult.class_statistics?.highest_in_class ?? editResult.highest_in_class ?? 0,
//             lowest_in_class: editResult.class_statistics?.lowest_in_class ?? editResult.lowest_in_class ?? 0,
//             class_position: editResult.class_statistics?.class_position ?? editResult.class_position ?? editResult.position ?? 0,
//             total_students: editResult.class_statistics?.total_students ?? editResult.total_students ?? 0
//           });
//         }
        
//         console.log('Edit mode setup completed successfully');
        
//       } catch (error) {
//         console.error('Error setting up edit result:', error);
//         toast.error('Failed to load edit data');
//       }
//     };

//     setupEditResult();
//   }
// }, [editResult, teacherAssignments, currentTeacherId]);


//   // Auto-select class when only one option is available (useful for edit prefill)
//   useEffect(() => {
//     if (formData.subject && availableClasses.length === 1 && !selectedClass) {
//       const onlyClass = availableClasses[0];
//       setSelectedClass(String(onlyClass.id));
//       setTimeout(() => handleClassChange(String(onlyClass.id)), 0);
//     }
//   }, [availableClasses]);

//   const loadTeacherData = async () => {
//     try {
//       setLoading(true);
      
//       // Get teacher ID
//       const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
//       if (!teacherId) {
//         throw new Error('Teacher ID not found');
//       }
//       setCurrentTeacherId(teacherId);

//       // Load teacher subjects
//       const subjects = await TeacherDashboardService.getTeacherSubjects(teacherId);
      
//       // Flatten assignments from subjects
//       const assignments: any[] = [];
//       const uniqueSubjects: Subject[] = [];
      
//       subjects.forEach(subject => {
//         // Add to unique subjects list
//         const existingSubject = uniqueSubjects.find(s => s.id === subject.id);
//         if (!existingSubject) {
//           uniqueSubjects.push({
//             id: subject.id,
//             name: subject.name,
//             code: subject.code
//           });
//         }
        
//         // Flatten assignments for this subject
//         if (subject.assignments && Array.isArray(subject.assignments)) {
//           subject.assignments.forEach((assignment: any) => {
//             assignments.push({
//               id: assignment.id,
//               classroom_name: assignment.classroom_name || 'Unknown',
//               section_name: assignment.section || 'Unknown',
//               grade_level_name: assignment.grade_level || 'Unknown',
//               education_level: assignment.education_level || 'Unknown',
//               subject_name: subject.name,
//               subject_code: subject.code,
//               subject_id: subject.id,
//               grade_level_id: assignment.grade_level_id,
//               section_id: assignment.classroom_id, // This is actually the classroom_id
//               student_count: assignment.student_count || 0,
//               periods_per_week: assignment.periods_per_week || 0
//             });
//           });
//         }
//       });
      
//       setTeacherAssignments(assignments);
//       setSubjects(uniqueSubjects);

//       // Load exam sessions
//       const sessions = await ResultService.getExamSessions();
//       setExamSessions(sessions.data || sessions || []);
//       // Load scoring configurations once
//       try {
//         const configsResponse = await ResultSettingsService.getScoringConfigurations();
//         const configsArray = Array.isArray(configsResponse) ? configsResponse : (configsResponse?.results || configsResponse?.data || []);
//         setScoringConfigs(configsArray || []);
//       } catch (e) {
//         console.warn('Could not load scoring configurations.', e);
//         setScoringConfigs([]);
//       }
//       // Load active grading systems and pick a default
//       try {
//         const gsResp = await ResultService.getGradingSystems({ is_active: true });
//         const gsArray = Array.isArray(gsResp) ? gsResp : (gsResp?.results || gsResp?.data || []);
//         if (gsArray && gsArray.length) {
//           const firstId = Number(gsArray[0].id || gsArray[0].pk || gsArray[0]);
//           if (!Number.isNaN(firstId)) setGradingSystemId(firstId);
//         }
//       } catch (e) {
//         console.warn('Could not load grading systems; will rely on backend default.', e);
//       }

//       // Load active grading systems and pick a default
//       try {
//         const gsResp = await ResultService.getGradingSystems({ is_active: true });
//         const gsArray = Array.isArray(gsResp) ? gsResp : (gsResp?.results || gsResp?.data || []);
//         if (gsArray && gsArray.length) {
//           const firstId = Number(gsArray[0].id || gsArray[0].pk || gsArray[0]);
//           if (!Number.isNaN(firstId)) setGradingSystemId(firstId);
//         }
//       } catch (e) {
//         console.warn('Could not load grading systems; will rely on backend default.', e);
//       }

//     } catch (error) {
//       console.error('Error loading teacher data:', error);
//       toast.error('Failed to load teacher data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubjectChange = async (subjectId: string, isEditMode = false) => {
//   console.log('handleSubjectChange called with subjectId:', subjectId, 'currentTeacherId:', currentTeacherId, 'isEditMode:', isEditMode);
//   if (!subjectId || !currentTeacherId) {
//     console.log('Early return: subjectId or currentTeacherId missing');
//     return;
//   }

//   try {
//     // Find all assignments for this subject
//     const subjectAssignments = teacherAssignments.filter(a => a.subject_id === parseInt(subjectId));
//     console.log('Subject assignments found:', subjectAssignments);
    
//     if (subjectAssignments.length === 0) {
//       console.log('No assignments found for subject');
//       return;
//     }

//     // Set normalized education level for assessment structure (use first assignment)
//     const normalizedLevel = (subjectAssignments[0].education_level || '')
//       .toString()
//       .replace(/_/g, ' ')
//       .toLowerCase()
//       .trim();
//     setSelectedEducationLevel(normalizedLevel);

//     // Pick active scoring config for this education level
//     const upperLevel = (subjectAssignments[0].education_level || '')
//       .toString()
//       .replace(/\s+/g, '_')
//       .toUpperCase();
//     const configForLevel = scoringConfigs.find((c: any) => c.education_level === upperLevel && (c.is_default || c.is_active));
//     setActiveScoringConfig(configForLevel || null);

//     // Create class options from assignments
//     const classOptions: ClassOption[] = subjectAssignments.map(assignment => ({
//       id: assignment.section_id,
//       name: assignment.classroom_name,
//       section_name: assignment.section_name,
//       grade_level_name: assignment.grade_level_name,
//       education_level: normalizedLevel,
//       student_count: assignment.student_count
//     }));

//     console.log('Class options created:', classOptions);
//     setAvailableClasses(classOptions);
    
//     // Only reset if NOT in edit mode
//     if (!isEditMode) {
//       // Reset class selection and students
//       setSelectedClass('');
//       setFilteredStudents([]);
//       setBulkResults([]);

//       // Reset assessment scores for single form
//       setAssessmentScores({});
//       setClassStatistics({});
//       setPhysicalDevelopment({});
//     }

//     console.log('Subject change completed successfully');

//   } catch (error) {
//     console.error('Error loading subject data:', error);
//     toast.error('Failed to load subject data');
//   }

  
// };




//   const handleClassChange = async (classId: string, isEditMode = false) => {
//   console.log('handleClassChange called with classId:', classId, 'currentTeacherId:', currentTeacherId, 'isEditMode:', isEditMode);
//   if (!classId || !currentTeacherId) {
//     console.log('Early return: classId or currentTeacherId missing');
//     return;
//   }

//   try {
//     console.log('Loading students for class:', classId);
//     // Load students for the selected class
//     const studentsData = await TeacherDashboardService.getStudentsForClass(parseInt(classId));
//     console.log('Students loaded:', studentsData);
    
//     setFilteredStudents(studentsData);
    
//     // Only recompute stats and reset scores if NOT in edit mode
//     if (!isEditMode) {
//       setTimeout(recomputeClassStats, 0);

//       // Initialize bulk results with enhanced structure
//       const initialBulkResults = studentsData.map((student: Student) => ({
//         student_id: student.id,
//         student_name: student.full_name,
//         assessment_scores: {},
//         class_statistics: {},
//         physical_development: {}
//       }));
//       setBulkResults(initialBulkResults);

//       // Reset assessment scores for single form
//       setAssessmentScores({});
//       setClassStatistics({});
//       setPhysicalDevelopment({});
//     }

//     console.log('Class change completed successfully');

//   } catch (error) {
//     console.error('Error loading students:', error);
//     toast.error('Failed to load students');
//   }
// };


//   const handleSingleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateSingleForm()) return;

//     try {
//       setSaving(true);
      
//       // Ensure grading system id before submit
//       let gsId = gradingSystemId;
//       if (gsId == null) {
//         try {
//           const gsResp = await ResultService.getGradingSystems({ is_active: true });
//           const gsArray = Array.isArray(gsResp) ? gsResp : (gsResp?.results || gsResp?.data || []);
//           if (gsArray && gsArray.length) {
//             const firstId = Number(gsArray[0].id || gsArray[0].pk || gsArray[0]);
//             if (!Number.isNaN(firstId)) {
//               gsId = firstId;
//               setGradingSystemId(firstId);
//             }
//           }
//         } catch {}
//       }
//       // Calculate total score
//       const totalScore = calculateTotalScore(assessmentScores, selectedEducationLevel);
      
//       // Prepare enhanced result data
//       const structure = getAssessmentStructure(selectedEducationLevel);
//       let ca_score = 0;
//       let exam_score = 0;
//       let education_level = normalizeEducationLevelForApi(selectedEducationLevel);

//       // Extract ca_score and exam_score based on education level
//       if (structure.type === 'senior') {
//         ca_score =
//           parseFloat(assessmentScores.test1?.toString() || '0') +
//           parseFloat(assessmentScores.test2?.toString() || '0') +
//           parseFloat(assessmentScores.test3?.toString() || '0');
//         exam_score = parseFloat(assessmentScores.exam?.toString() || '0');
//       } else if (structure.type === 'nursery') {
//         ca_score = parseFloat(assessmentScores.mark_obtained?.toString() || '0');
//         exam_score = 0;
//       } else {
//         ca_score = parseFloat(assessmentScores.ca_total?.toString() || assessmentScores.ca_score?.toString() || '0');
//         exam_score = parseFloat(assessmentScores.exam_score?.toString() || '0');
//       }

//       let resultData: any;
//       if (structure.type === 'senior') {
//         resultData = {
//           student: formData.student,
//           subject: formData.subject,
//           exam_session: formData.exam_session,
//           grading_system: gsId ?? undefined,
//           first_test_score: parseFloat(assessmentScores.test1?.toString() || '0'),
//           second_test_score: parseFloat(assessmentScores.test2?.toString() || '0'),
//           third_test_score: parseFloat(assessmentScores.test3?.toString() || '0'),
//           exam_score: parseFloat(assessmentScores.exam?.toString() || '0'),
//           teacher_remark: assessmentScores.remarks || '',
//           status: formData.status,
//           education_level,
//         };
//       } else {
//         resultData = {
//           student: formData.student,
//           subject: formData.subject,
//           exam_session: formData.exam_session,
//           grading_system: gsId ?? undefined,
//           ca_score,
//           exam_score,
//           total_score: totalScore,
//           grade: getGrade(totalScore),
//           remarks: assessmentScores.remarks || '',
//           status: formData.status,
//           education_level,
//           class_statistics: classStatistics,
//           physical_development: physicalDevelopment
//         };
//       }

//       if (editResult) {
//         console.log('Edit result object:', editResult);
//         console.log('Edit result keys:', Object.keys(editResult));
        
//         const candidates = [
//           editResult?.id,
//           editResult?.pk,
//           editResult?.result_id,
//           editResult?.student_result_id,
//           editResult?.studentResultId,
//           editResult?.result?.id
//         ];
//         console.log('ID candidates:', candidates);
        
//         const numeric = candidates
//           .map((v) => (v !== null && v !== undefined ? Number(v) : NaN))
//           .find((n) => Number.isFinite(n) && n > 0);
//         const safeId = numeric ? String(numeric) : '';
        
//         console.log('Selected ID:', safeId);
        
//         let finalId = safeId;
//         if (!finalId) {
//           // Attempt to resolve by composite keys
//           try {
//             const resolvedId = await ResultService.findResultIdByComposite({
//               student: formData.student,
//               subject: formData.subject,
//               exam_session: formData.exam_session,
//               education_level: education_level,
//             });
//             if (resolvedId) {
//               finalId = resolvedId;
//               console.log('Resolved result id via composite lookup:', finalId);
//             }
//           } catch (e) {
//             console.warn('Composite id lookup failed', e);
//           }
//         }
//         if (!finalId) {
//           console.error('No valid ID found in editResult or via lookup:', editResult);
//           toast.error('Cannot update: missing result ID. Please refresh and try again.');
//           throw new Error('Invalid result id for update');
//         }
//         await ResultService.updateStudentResult(finalId, resultData);
//         toast.success('Result updated successfully!');
//       } else {
//         try {
//           await ResultService.createStudentResult(resultData);
//           toast.success('Result recorded successfully!');
//         } catch (error: any) {
//           console.error('Error creating result:', error);
          
//           // Handle unique constraint violation
//           if (error.response?.status === 400 && error.response?.data?.non_field_errors) {
//             const errorMessage = error.response.data.non_field_errors[0];
//             if (errorMessage.includes('unique')) {
//               toast.error('A result already exists for this student, subject, and exam session. Please edit the existing result instead.');
//               return;
//             }
//           }
          
//           // Handle other errors
//           const errorMessage = error.response?.data?.message || error.message || 'Failed to create result';
//           toast.error(errorMessage);
//           throw error;
//         }
//       }

//       onResultCreated();
//       onClose();
//     } catch (error) {
//       console.error('Error saving result:', error);
//       toast.error('Failed to save result. Please try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleBulkSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateBulkForm()) return;

//     try {
//       setSaving(true);
      
//       const validResults = bulkResults.filter(result => {
//         const total = calculateTotalScore(result.assessment_scores, selectedEducationLevel);
//         return total > 0;
//       });

//       // Ensure grading system id before submit
//       let gsId = gradingSystemId;
//       if (gsId == null) {
//         try {
//           const gsResp = await ResultService.getGradingSystems({ is_active: true });
//           const gsArray = Array.isArray(gsResp) ? gsResp : (gsResp?.results || gsResp?.data || []);
//           if (gsArray && gsArray.length) {
//             const firstId = Number(gsArray[0].id || gsArray[0].pk || gsArray[0]);
//             if (!Number.isNaN(firstId)) {
//               gsId = firstId;
//               setGradingSystemId(firstId);
//             }
//           }
//         } catch {}
//       }

//       for (const result of validResults) {
//         const totalScore = calculateTotalScore(result.assessment_scores, selectedEducationLevel);
        
//         // Map assessment_scores to top-level fields
//         const structure = getAssessmentStructure(selectedEducationLevel);
//         let ca_score = 0;
//         let exam_score = 0;
//         let education_level = normalizeEducationLevelForApi(selectedEducationLevel);

//         // Extract ca_score and exam_score based on education level
//         if (structure.type === 'senior') {
//           ca_score = 
//             parseFloat(result.assessment_scores.test1?.toString() || '0') +
//             parseFloat(result.assessment_scores.test2?.toString() || '0') +
//             parseFloat(result.assessment_scores.test3?.toString() || '0');
//           exam_score = parseFloat(result.assessment_scores.exam?.toString() || '0');
//         } else if (structure.type === 'nursery') {
//           ca_score = parseFloat(result.assessment_scores.mark_obtained?.toString() || '0');
//           exam_score = 0;
//         } else {
//           ca_score = parseFloat(result.assessment_scores.ca_total?.toString() || result.assessment_scores.ca_score?.toString() || '0');
//           exam_score = parseFloat(result.assessment_scores.exam_score?.toString() || '0');
//         }

//         let resultData: any;
//         if (structure.type === 'senior') {
//           resultData = {
//             student: result.student_id.toString(),
//             subject: formData.subject,
//             exam_session: formData.exam_session,
//             grading_system: gsId ?? undefined,
//             first_test_score: parseFloat(result.assessment_scores.test1?.toString() || '0'),
//             second_test_score: parseFloat(result.assessment_scores.test2?.toString() || '0'),
//             third_test_score: parseFloat(result.assessment_scores.test3?.toString() || '0'),
//             exam_score: parseFloat(result.assessment_scores.exam?.toString() || '0'),
//             teacher_remark: result.assessment_scores.remarks || '',
//             status: 'DRAFT',
//             education_level,
//           };
//         } else {
//           resultData = {
//             student: result.student_id.toString(),
//             subject: formData.subject,
//             exam_session: formData.exam_session,
//             grading_system: gsId ?? undefined,
//             ca_score,
//             exam_score,
//             total_score: totalScore,
//             grade: getGrade(totalScore),
//             remarks: result.assessment_scores.remarks || '',
//             status: 'DRAFT',
//             education_level,
//             class_statistics: result.class_statistics || {},
//             physical_development: result.physical_development || {}
//           };
//         }

//         await ResultService.createStudentResult(resultData);
//       }

//       toast.success(`${validResults.length} results recorded successfully!`);
//       onResultCreated();
//       onClose();
//     } catch (error) {
//       console.error('Error saving bulk results:', error);
//       toast.error('Failed to save results. Please try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const validateSingleForm = () => {
//     if (!formData.student) {
//       toast.error('Please select a student');
//       return false;
//     }
//     if (!formData.subject) {
//       toast.error('Please select a subject');
//       return false;
//     }
//     if (!selectedClass) {
//       toast.error('Please select a class');
//       return false;
//     }
//     if (!formData.exam_session) {
//       toast.error('Please select an exam session');
//       return false;
//     }

//     const structure = getAssessmentStructure(selectedEducationLevel);
//     const totalScore = calculateTotalScore(assessmentScores, selectedEducationLevel);
    
//     if (totalScore <= 0) {
//       toast.error('Please enter at least one valid score');
//       return false;
//     }

//     // Validate individual scores based on education level
//     for (let i = 0; i < structure.fields.length; i++) {
//       const field = structure.fields[i];
//       const value = assessmentScores[field as keyof AssessmentScores];
//       const maxValue = structure.maxValues[i];
      
//       if (value && value !== '') {
//         const numValue = parseFloat(value.toString());
//         if (isNaN(numValue) || numValue < 0 || numValue > maxValue) {
//           toast.error(`${structure.labels[i]} must be between 0 and ${maxValue}`);
//           return false;
//         }
//       }
//     }

//     return true;
//   };

//   const validateBulkForm = () => {
//     if (!formData.subject) {
//       toast.error('Please select a subject');
//       return false;
//     }
//     if (!selectedClass) {
//       toast.error('Please select a class');
//       return false;
//     }
//     if (!formData.exam_session) {
//       toast.error('Please select an exam session');
//       return false;
//     }

//     const validResults = bulkResults.filter(result => {
//       const total = calculateTotalScore(result.assessment_scores, selectedEducationLevel);
//       return total > 0;
//     });

//     if (validResults.length === 0) {
//       toast.error('Please enter scores for at least one student');
//       return false;
//     }

//     // Validate each result
//     const structure = getAssessmentStructure(selectedEducationLevel);
//     for (const result of validResults) {
//       for (let i = 0; i < structure.fields.length; i++) {
//         const field = structure.fields[i];
//         const value = result.assessment_scores[field as keyof AssessmentScores];
//         const maxValue = structure.maxValues[i];
        
//         if (value && value !== '') {
//           const numValue = parseFloat(value.toString());
//           if (isNaN(numValue) || numValue < 0 || numValue > maxValue) {
//             toast.error(`Invalid ${structure.labels[i]} for ${result.student_name}. Must be 0-${maxValue}`);
//             return false;
//           }
//         }
//       }
//     }

//     return true;
//   };

//   const updateBulkResult = (index: number, field: string, value: string) => {
//     setBulkResults(prev => prev.map((result, i) => 
//       i === index ? { 
//         ...result, 
//         assessment_scores: { 
//           ...result.assessment_scores, 
//           [field]: value 
//         } 
//       } : result
//     ));
//     // Recompute stats after change
//     setTimeout(recomputeClassStats, 0);
//   };

//   const updateAssessmentScore = (field: keyof AssessmentScores, value: string) => {
//     setAssessmentScores(prev => ({ ...prev, [field]: value }));
//     // Recompute stats for single entry context
//     setTimeout(recomputeClassStats, 0);
//   };

//   // Removed manual update; stats are computed automatically

//   const updatePhysicalDevelopment = (field: keyof PhysicalDevelopment, value: string | number) => {
//     setPhysicalDevelopment(prev => ({ ...prev, [field]: value }));
//   };

//   const getGrade = (total: number) => {
//     if (total >= 80) return 'A';
//     if (total >= 70) return 'B';
//     if (total >= 60) return 'C';
//     if (total >= 50) return 'D';
//     return 'F';
//   };

//   const getGradeColor = (grade: string) => {
//     const gradeConfig = {
//       'A': 'text-green-600 bg-green-100',
//       'B': 'text-blue-600 bg-blue-100',
//       'C': 'text-yellow-600 bg-yellow-100',
//       'D': 'text-orange-600 bg-orange-100',
//       'F': 'text-red-600 bg-red-100'
//     };
//     return gradeConfig[grade as keyof typeof gradeConfig] || 'text-gray-600 bg-gray-100';
//   };

//   const resetForm = () => {
//     setFormData({
//       student: '',
//       subject: '',
//       exam_session: '',
//       status: 'DRAFT'
//     });
//     setAssessmentScores({});
//     setClassStatistics({});
//     setPhysicalDevelopment({});
//     setBulkResults([]);
//     // no-op: students state removed
//     setFilteredStudents([]);
//     setSelectedEducationLevel('');
//     setAvailableClasses([]);
//     setSelectedClass('');
//   };

//   // Recompute class statistics based on bulkResults totals (and current single form if present)
//   const recomputeClassStats = () => {
//     try {
//       const totals: number[] = [];
//       // Include bulk rows with a positive total
//       bulkResults.forEach((r) => {
//         const t = calculateTotalScore(r.assessment_scores, selectedEducationLevel);
//         if (!isNaN(t) && t >= 0) totals.push(t);
//       });
//       // Include single form total if a student is selected and there is any score
//       const singleSelected = formData.student && formData.student !== '';
//       const singleTotal = calculateTotalScore(assessmentScores, selectedEducationLevel);
//       if (singleSelected && singleTotal >= 0) totals.push(singleTotal);
//       if (totals.length === 0) {
//         setClassStatistics({});
//         return;
//       }
//       const sum = totals.reduce((a, b) => a + b, 0);
//       const avg = parseFloat((sum / totals.length).toFixed(2));
//       const high = Math.max(...totals);
//       const low = Math.min(...totals);
//       // For single form, compute provisional position among current totals
//       let position: number | undefined = undefined;
//       if (singleSelected) {
//         const sorted = [...totals].sort((a, b) => b - a);
//         position = sorted.indexOf(singleTotal) + 1;
//       }
//       setClassStatistics((prev) => ({
//         ...prev,
//         class_average: avg,
//         highest_in_class: high,
//         lowest_in_class: low,
//         class_position: position,
//         total_students: totals.length,
//       }));
//     } catch (e) {
//       // Silent fail to avoid blocking typing
//     }
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   // Component to render assessment fields dynamically
//   const renderAssessmentFields = (scores: AssessmentScores, onUpdate: (field: keyof AssessmentScores, value: string) => void) => {
//     const structure = getAssessmentStructure(selectedEducationLevel, activeScoringConfig);
    
//     return (
//       <div className="space-y-4">
//         <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
//           <BarChart3 className="w-5 h-5 mr-2" />
//           Assessment Scores ({structure.type.toUpperCase()})
//         </h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {structure.fields.map((field, index) => (
//             <div key={field}>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 {structure.labels[index]} (0-{structure.maxValues[index]})
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 max={structure.maxValues[index]}
//                 step="0.1"
//                 value={scores[field as keyof AssessmentScores] || ''}
//                 onChange={(e) => onUpdate(field as keyof AssessmentScores, e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                 placeholder={`Enter ${structure.labels[index]}`}
//               />
//             </div>
//           ))}
//         </div>
        
//         {/* Total Score Display */}
//         {(() => {
//           const total = calculateTotalScore(scores, selectedEducationLevel);
//           return total > 0 ? (
//             <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Score:</span>
//                 <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{total}</span>
//               </div>
//               <div className="mt-2">
//                 <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(getGrade(total))}`}>
//                   Grade: {getGrade(total)}
//                 </span>
//               </div>
//             </div>
//           ) : null;
//         })()}
//       </div>
//     );
//   };

//   // Component to render class statistics
//   const renderClassStatistics = (stats: ClassStatistics) => {
//     const structure = getAssessmentStructure(selectedEducationLevel);
//     if (!structure.showClassStatistics) return null;

//     return (
//       <div className="space-y-4">
//         <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
//           <TrendingUp className="w-5 h-5 mr-2" />
//           Class Statistics
//         </h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Class Average (auto)
//             </label>
//             <input
//               type="number"
//               min="0"
//               max="100"
//               step="0.1"
//               value={stats.class_average || ''}
//               readOnly
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Highest in Class (auto)
//             </label>
//             <input
//               type="number"
//               min="0"
//               max="100"
//               step="0.1"
//               value={stats.highest_in_class || ''}
//               readOnly
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Lowest in Class (auto)
//             </label>
//             <input
//               type="number"
//               min="0"
//               max="100"
//               step="0.1"
//               value={stats.lowest_in_class || ''}
//               readOnly
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Class Position (auto for single entry)
//             </label>
//             <input
//               type="number"
//               min="1"
//               value={stats.class_position || ''}
//               readOnly
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
//             />
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Component to render physical development
//   const renderPhysicalDevelopment = (physical: PhysicalDevelopment, onUpdate: (field: keyof PhysicalDevelopment, value: string | number) => void) => {
//     const structure = getAssessmentStructure(selectedEducationLevel);
//     if (!structure.showPhysicalDevelopment) return null;

//     return (
//       <div className="space-y-4">
//         <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
//           <Users className="w-5 h-5 mr-2" />
//           Physical Development
//         </h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Height (Beginning of Term) - cm
//             </label>
//             <input
//               type="number"
//               min="0"
//               value={physical.height_beginning || ''}
//               onChange={(e) => onUpdate('height_beginning', parseFloat(e.target.value) || 0)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               placeholder="Height in cm"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Height (End of Term) - cm
//             </label>
//             <input
//               type="number"
//               min="0"
//               value={physical.height_end || ''}
//               onChange={(e) => onUpdate('height_end', parseFloat(e.target.value) || 0)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               placeholder="Height in cm"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Weight (Beginning of Term) - kg
//             </label>
//             <input
//               type="number"
//               min="0"
//               step="0.1"
//               value={physical.weight_beginning || ''}
//               onChange={(e) => onUpdate('weight_beginning', parseFloat(e.target.value) || 0)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               placeholder="Weight in kg"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Weight (End of Term) - kg
//             </label>
//             <input
//               type="number"
//               min="0"
//               step="0.1"
//               value={physical.weight_end || ''}
//               onChange={(e) => onUpdate('weight_end', parseFloat(e.target.value) || 0)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               placeholder="Weight in kg"
//             />
//           </div>
//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Nurse's Comment
//             </label>
//             <textarea
//               value={physical.nurse_comment || ''}
//               onChange={(e) => onUpdate('nurse_comment', e.target.value)}
//               rows={2}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               placeholder="Nurse's comment on physical development"
//             />
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//               {editResult ? 'Edit Result' : 'Record Student Result'}
//             </h3>
//             <button
//               onClick={handleClose}
//               className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>

//           {/* Tabs */}
//           <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
//             <nav className="-mb-px flex space-x-8">
//               <button
//                 onClick={() => setActiveTab('single')}
//                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === 'single'
//                     ? 'border-blue-500 text-blue-600 dark:text-blue-400'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
//                 }`}
//               >
//                 <User className="w-4 h-4 inline mr-2" />
//                 Single Result
//               </button>
//               <button
//                 onClick={() => setActiveTab('bulk')}
//                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === 'bulk'
//                     ? 'border-blue-500 text-blue-600 dark:text-blue-400'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
//                 }`}
//               >
//                 <FileText className="w-4 h-4 inline mr-2" />
//                 Bulk Results
//               </button>
//             </nav>
//           </div>

//           {loading ? (
//             <div className="flex items-center justify-center h-32">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//             </div>
//           ) : (
//             <>
//               {/* Single Result Form */}
//               {activeTab === 'single' && (
//                 <form onSubmit={handleSingleSubmit} className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {/* Subject Selection */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Subject *
//                       </label>
//                       <select
//                         value={formData.subject}
//                         onChange={(e) => {
//                           setFormData(prev => ({ ...prev, subject: e.target.value, student: '' }));
//                           handleSubjectChange(e.target.value, !!editResult);
//                         }}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                         required
//                       >
//                         <option value="">Select Subject</option>
//                         {subjects.map(subject => (
//                           <option key={subject.id} value={subject.id}>
//                             {subject.name} ({subject.code})
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Class Selection */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Class *
//                       </label>
//                       <select
//                         value={selectedClass}
//                         onChange={(e) => {
//                           console.log('Class selection changed:', e.target.value);
//                           setSelectedClass(e.target.value);
//                           setFormData(prev => ({ ...prev, student: '' }));
//                           handleClassChange(e.target.value);
//                         }}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                         required
//                         disabled={!formData.subject || availableClasses.length === 0}
//                       >
//                         <option value="">Select Class</option>
//                         {availableClasses.map(classOption => (
//                           <option key={classOption.id} value={classOption.id}>
//                             {classOption.grade_level_name} {classOption.section_name} ({classOption.student_count} students)
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Exam Session */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Exam Session *
//                       </label>
//                       <select
//                         value={formData.exam_session}
//                         onChange={(e) => setFormData(prev => ({ ...prev, exam_session: e.target.value }))}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                         required
//                       >
//                         <option value="">Select Exam Session</option>
//                         {examSessions.map(session => (
//                           <option key={session.id} value={session.id}>
//                             {session.name} - {session.term} {session.academic_session}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Student Selection */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Student * 
//                         <span className="text-xs text-gray-500 ml-2">
//                           (selectedClass: {selectedClass}, students: {filteredStudents.length})
//                         </span>
//                       </label>
//                       <select
//                         value={formData.student}
//                         onChange={(e) => {
//                           console.log('Student selection changed:', e.target.value);
//                           setFormData(prev => ({ ...prev, student: e.target.value }));
//                         }}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                         required
//                         disabled={!selectedClass || filteredStudents.length === 0}
//                       >
//                         <option value="">Select Student</option>
//                         {filteredStudents.map(student => (
//                           <option key={student.id} value={student.id}>
//                             {student.full_name} ({student.registration_number})
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Status */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Status
//                       </label>
//                       <select
//                         value={formData.status}
//                         onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                       >
//                         <option value="DRAFT">Draft</option>
//                         <option value="PUBLISHED">Published</option>
//                         <option value="APPROVED">Approved</option>
//                       </select>
//                     </div>

//                   </div>

//                   {/* Enhanced Assessment Fields */}
//                   {selectedEducationLevel && (
//                     <>
//                       {renderAssessmentFields(assessmentScores, updateAssessmentScore)}
                      
//                       {/* Remarks */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                           Teacher's Remarks
//                         </label>
//                         <textarea
//                           value={assessmentScores.remarks || ''}
//                           onChange={(e) => updateAssessmentScore('remarks', e.target.value)}
//                           rows={3}
//                           className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                           placeholder="Enter any remarks about the student's performance..."
//                         />
//                       </div>

//                       {/* Class Statistics - Always show for create form */}
//                       {renderClassStatistics(classStatistics)}

//                       {/* Physical Development - Always show for create form */}
//                       {renderPhysicalDevelopment(physicalDevelopment, updatePhysicalDevelopment)}
//                     </>
//                   )}

//                   {/* Submit Buttons */}
//                   <div className="flex justify-end space-x-3">
//                     <button
//                       type="button"
//                       onClick={handleClose}
//                       className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={saving}
//                       className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                     >
//                       {saving ? (
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                       ) : (
//                         <Save className="w-4 h-4 mr-2" />
//                       )}
//                       {editResult ? 'Update Result' : 'Record Result'}
//                     </button>
//                   </div>
//                 </form>
//               )}

//               {/* Bulk Results Form */}
//               {activeTab === 'bulk' && (
//                 <form onSubmit={handleBulkSubmit} className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {/* Subject Selection */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Subject *
//                       </label>
//                       <select
//                         value={formData.subject}
//                         onChange={(e) => {
//                           setFormData(prev => ({ ...prev, subject: e.target.value }));
//                           handleSubjectChange(e.target.value);
//                         }}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                         required
//                       >
//                         <option value="">Select Subject</option>
//                         {subjects.map(subject => (
//                           <option key={subject.id} value={subject.id}>
//                             {subject.name} ({subject.code})
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Class Selection */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Class *
//                       </label>
//                       <select
//                         value={selectedClass}
//                         onChange={(e) => {
//                           setSelectedClass(e.target.value);
//                           handleClassChange(e.target.value);
//                         }}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                         required
//                         disabled={!formData.subject || availableClasses.length === 0}
//                       >
//                         <option value="">Select Class</option>
//                         {availableClasses.map(classOption => (
//                           <option key={classOption.id} value={classOption.id}>
//                             {classOption.grade_level_name} {classOption.section_name} ({classOption.student_count} students)
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Exam Session */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Exam Session *
//                       </label>
//                       <select
//                         value={formData.exam_session}
//                         onChange={(e) => setFormData(prev => ({ ...prev, exam_session: e.target.value }))}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                         required
//                       >
//                         <option value="">Select Exam Session</option>
//                         {examSessions.map(session => (
//                           <option key={session.id} value={session.id}>
//                             {session.name} - {session.term} {session.academic_session}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   {/* Enhanced Bulk Results Table */}
//                   {bulkResults.length > 0 && selectedEducationLevel && (
//                     <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
//                       <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
//                         <GraduationCap className="w-5 h-5 mr-2" />
//                         Enter Scores for Students ({getAssessmentStructure(selectedEducationLevel, activeScoringConfig).type.toUpperCase()})
//                       </h4>
//                       <div className="overflow-x-auto">
//                         <table className="min-w-full">
//                           <thead>
//                             <tr className="border-b border-gray-200 dark:border-gray-600">
//                               <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                                 Student
//                               </th>
//                               {getAssessmentStructure(selectedEducationLevel, activeScoringConfig).fields.map((field, index) => (
//                                 <th key={field} className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                                   {getAssessmentStructure(selectedEducationLevel, activeScoringConfig).labels[index]}
//                                 </th>
//                               ))}
//                               <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                                 Total
//                               </th>
//                               <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                                 Grade
//                               </th>
//                               <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                                 Remarks
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {bulkResults.map((result, index) => {
//                               const total = calculateTotalScore(result.assessment_scores, selectedEducationLevel);
//                               const grade = getGrade(total);
//                               return (
//                                 <tr key={result.student_id} className="border-b border-gray-200 dark:border-gray-600">
//                                   <td className="py-2 px-3 text-sm text-gray-900 dark:text-white">
//                                     {result.student_name}
//                                   </td>
//                                   {getAssessmentStructure(selectedEducationLevel, activeScoringConfig).fields.map((field, fieldIndex) => (
//                                     <td key={field} className="py-2 px-3">
//                                       <input
//                                         type="number"
//                                         min="0"
//                                         max={getAssessmentStructure(selectedEducationLevel, activeScoringConfig).maxValues[fieldIndex]}
//                                         step="0.1"
//                                         value={result.assessment_scores[field as keyof AssessmentScores] || ''}
//                                         onChange={(e) => updateBulkResult(index, field, e.target.value)}
//                                         className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                                         placeholder="0"
//                                       />
//                                     </td>
//                                   ))}
//                                   <td className="py-2 px-3 text-sm font-medium text-gray-900 dark:text-white">
//                                     {total > 0 ? total : '-'}
//                                   </td>
//                                   <td className="py-2 px-3">
//                                     {total > 0 && (
//                                       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(grade)}`}>
//                                         {grade}
//                                       </span>
//                                     )}
//                                   </td>
//                                   <td className="py-2 px-3">
//                                     <input
//                                       type="text"
//                                       value={result.assessment_scores.remarks || ''}
//                                       onChange={(e) => updateBulkResult(index, 'remarks', e.target.value)}
//                                       className="w-32 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                                       placeholder="Remarks"
//                                     />
//                                   </td>
//                                 </tr>
//                               );
//                             })}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   )}

//                   {/* Submit Buttons */}
//                   <div className="flex justify-end space-x-3">
//                     <button
//                       type="button"
//                       onClick={handleClose}
//                       className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={saving || bulkResults.length === 0}
//                       className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                     >
//                       {saving ? (
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                       ) : (
//                         <Save className="w-4 h-4 mr-2" />
//                       )}
//                       Record {bulkResults.filter(r => calculateTotalScore(r.assessment_scores, selectedEducationLevel) > 0).length} Results
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResultRecordingForm;

// import React, { useState, useEffect } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import TeacherDashboardService from '@/services/TeacherDashboardService';
// import ResultService from '@/services/ResultService';
// import ResultSettingsService from '@/services/ResultSettingsService';
// import { toast } from 'react-toastify';
// import { ExamSessionInfo } from '@/types/types';
// import { 
//   X, 
//   Save, 
//   User,
//   FileText,
//   GraduationCap,
//   Users,
//   TrendingUp,
//   BarChart3
// } from 'lucide-react';

// interface Student {
//   id: number;
//   full_name: string;
//   registration_number: string;
//   profile_picture?: string;
//   classroom: {
//     id: number;
//     name: string;
//     grade_level: string;
//     section: string;
//   };
// }

// interface Subject {
//   id: number;
//   name: string;
//   code: string;
// }

// interface TeacherAssignment {
//   id: number;
//   classroom_name: string;
//   section_name: string;
//   grade_level_name: string;
//   education_level: string;
//   subject_name: string;
//   subject_code: string;
//   subject_id: number;
//   grade_level_id: number;
//   section_id: number;
//   student_count: number;
//   periods_per_week: number;
// }

// interface ClassOption {
//   id: number;
//   name: string;
//   section_name: string;
//   grade_level_name: string;
//   education_level: string;
//   student_count: number;
// }

// interface AssessmentScores {
//   test1?: number | string;
//   test2?: number | string;
//   test3?: number | string;
//   exam?: number | string;
//   ca_score?: number | string;
//   take_home_marks?: number | string;
//   take_home_test?: number | string;
//   appearance_marks?: number | string;
//   practical_marks?: number | string;
//   project_marks?: number | string;
//   note_copying_marks?: number | string;
//   ca_total?: number | string;
//   exam_score?: number | string;
//   max_marks?: number | string;
//   mark_obtained?: number | string;
//   total?: number | string;
//   position?: number | string;
//   grade?: string;
//   remarks?: string;
// }

// interface ClassStatistics {
//   class_average?: number;
//   highest_in_class?: number;
//   lowest_in_class?: number;
//   class_position?: number;
//   total_students?: number;
// }

// interface PhysicalDevelopment {
//   height_beginning?: number;
//   height_end?: number;
//   weight_beginning?: number;
//   weight_end?: number;
//   nurse_comment?: string;
// }

// interface ResultRecordingFormProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess?: () => Promise<void>;
//   onResultCreated: () => void;
//   editResult?: any;
//   mode?: 'create' | 'edit';
// }

// const getAssessmentStructure = (educationLevel: string, scoringConfig?: any) => {
//   const level = (educationLevel || '')
//     .toString()
//     .replace(/_/g, ' ')
//     .toLowerCase()
//     .trim();

//   if (scoringConfig) {
//     const upperLevel = (educationLevel || '')
//       .toString()
//       .replace(/\s+/g, '_')
//       .toUpperCase();

//     if (upperLevel === 'SENIOR_SECONDARY') {
//       return {
//         type: 'senior',
//         fields: ['test1', 'test2', 'test3', 'exam'],
//         labels: [
//           `1st Test (${Number(scoringConfig.first_test_max_score) || 10})`,
//           `2nd Test (${Number(scoringConfig.second_test_max_score) || 10})`,
//           `3rd Test (${Number(scoringConfig.third_test_max_score) || 10})`,
//           `Exam (${Number(scoringConfig.exam_max_score) || 70})`
//         ],
//         maxValues: [
//           Number(scoringConfig.first_test_max_score) || 10,
//           Number(scoringConfig.second_test_max_score) || 10,
//           Number(scoringConfig.third_test_max_score) || 10,
//           Number(scoringConfig.exam_max_score) || 70
//         ],
//         showPhysicalDevelopment: false,
//         showClassStatistics: true
//       };
//     }

//     if (upperLevel === 'PRIMARY' || upperLevel === 'JUNIOR_SECONDARY') {
//       return {
//         type: upperLevel === 'PRIMARY' ? 'primary' : 'junior',
//         fields: [
//           'ca_score',
//           'take_home_marks',
//           'appearance_marks',
//           'practical_marks',
//           'project_marks',
//           'note_copying_marks',
//           'ca_total',
//           'exam_score'
//         ],
//         labels: [
//           `C.A (${Number(scoringConfig.continuous_assessment_max_score) || 15})`,
//           `Take Home Test (${Number(scoringConfig.take_home_test_max_score) || 5})`,
//           `Appearance (${Number(scoringConfig.appearance_max_score) || 5})`,
//           `Practical (${Number(scoringConfig.practical_max_score) || 5})`,
//           `Project (${Number(scoringConfig.project_max_score) || 5})`,
//           `Note Copying (${Number(scoringConfig.note_copying_max_score) || 5})`,
//           `C.A Total (${Number(scoringConfig.total_ca_max_score) || 40})`,
//           `Exam (${Number(scoringConfig.exam_max_score) || 60})`
//         ],
//         maxValues: [
//           Number(scoringConfig.continuous_assessment_max_score) || 15,
//           Number(scoringConfig.take_home_test_max_score) || 5,
//           Number(scoringConfig.appearance_max_score) || 5,
//           Number(scoringConfig.practical_max_score) || 5,
//           Number(scoringConfig.project_max_score) || 5,
//           Number(scoringConfig.note_copying_max_score) || 5,
//           Number(scoringConfig.total_ca_max_score) || 40,
//           Number(scoringConfig.exam_max_score) || 60
//         ],
//         showPhysicalDevelopment: true,
//         showClassStatistics: true
//       };
//     }

//     if (upperLevel === 'NURSERY') {
//       const totalMax = Number(scoringConfig.total_max_score) || 100;
//       return {
//         type: 'nursery',
//         fields: ['max_marks', 'mark_obtained'],
//         labels: ['Max Marks', 'Mark Obtained'],
//         maxValues: [totalMax, totalMax],
//         showPhysicalDevelopment: true,
//         showClassStatistics: false
//       };
//     }
//   }

//   switch (level) {
//     case 'nursery':
//       return {
//         type: 'nursery',
//         fields: ['max_marks', 'mark_obtained'],
//         labels: ['Max Marks', 'Mark Obtained'],
//         maxValues: [100, 100],
//         showPhysicalDevelopment: true,
//         showClassStatistics: false
//       };
//     case 'primary':
//       return {
//         type: 'primary',
//         fields: ['ca_score', 'take_home_marks', 'take_home_test', 'appearance_marks', 'practical_marks', 'project_marks', 'note_copying_marks', 'ca_total', 'exam_score'],
//         labels: ['C.A (15)', 'Take Home', 'Take Home Test', 'Appearance', 'Practical', 'Project', 'Note Copying', 'C.A Total', 'Exam (60%)'],
//         maxValues: [15, 5, 5, 5, 5, 5, 5, 40, 60],
//         showPhysicalDevelopment: true,
//         showClassStatistics: true
//       };
//     case 'junior secondary':
//       return {
//         type: 'junior',
//         fields: ['ca_score', 'take_home_marks', 'take_home_test', 'appearance_marks', 'practical_marks', 'project_marks', 'note_copying_marks', 'ca_total', 'exam_score'],
//         labels: ['C.A (15)', 'Take Home', 'Take Home Test', 'Appearance', 'Practical', 'Project', 'Note Copying', 'C.A Total', 'Exam (60%)'],
//         maxValues: [15, 5, 5, 5, 5, 5, 5, 40, 60],
//         showPhysicalDevelopment: true,
//         showClassStatistics: true
//       };
//     case 'senior secondary':
//       return {
//         type: 'senior',
//         fields: ['test1', 'test2', 'test3', 'exam'],
//         labels: ['1st Test (10)', '2nd Test (10)', '3rd Test (10)', 'Exam (70)'],
//         maxValues: [10, 10, 10, 70],
//         showPhysicalDevelopment: false,
//         showClassStatistics: true
//       };
//     default:
//       return {
//         type: 'default',
//         fields: ['ca_score', 'exam_score'],
//         labels: ['CA Score (30)', 'Exam Score (70)'],
//         maxValues: [30, 70],
//         showPhysicalDevelopment: false,
//         showClassStatistics: false
//       };
//   }
// };

// const calculateTotalScore = (scores: AssessmentScores, educationLevel: string) => {
//   const structure = getAssessmentStructure(educationLevel);
  
//   switch (structure.type) {
//     case 'nursery':
//       return parseFloat(scores.mark_obtained?.toString() || '0');
//     case 'primary':
//     case 'junior':
//       const caTotal = parseFloat(scores.ca_total?.toString() || '0');
//       const exam = parseFloat(scores.exam_score?.toString() || '0');
//       return caTotal + exam;
//     case 'senior':
//       const test1 = parseFloat(scores.test1?.toString() || '0');
//       const test2 = parseFloat(scores.test2?.toString() || '0');
//       const test3 = parseFloat(scores.test3?.toString() || '0');
//       const seniorExam = parseFloat(scores.exam?.toString() || '0');
//       return test1 + test2 + test3 + seniorExam;
//     default:
//       const ca = parseFloat(scores.ca_score?.toString() || '0');
//       const defaultExam = parseFloat(scores.exam_score?.toString() || '0');
//       return ca + defaultExam;
//   }
// };

// const ResultRecordingForm = ({
//   isOpen,
//   onClose,
//   onResultCreated,
//   editResult
// }: ResultRecordingFormProps) => {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
//   const [selectedEducationLevel, setSelectedEducationLevel] = useState<string>('');
  
//   const [subjects, setSubjects] = useState<Subject[]>([]);
//   const [examSessions, setExamSessions] = useState<ExamSessionInfo[]>([]);
//   const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
//   const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
//   const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([]);
//   const [selectedClass, setSelectedClass] = useState<string>('');
//   const [gradingSystemId, setGradingSystemId] = useState<number | null>(null);
//   const [scoringConfigs, setScoringConfigs] = useState<any[]>([]);
//   const [activeScoringConfig, setActiveScoringConfig] = useState<any | null>(null);

//   const normalizeEducationLevelForApi = (level: string) =>
//     (level || '')
//       .toString()
//       .trim()
//       .replace(/\s+/g, '_')
//       .toUpperCase();
  
//   const [formData, setFormData] = useState({
//     student: '',
//     subject: '',
//     exam_session: '',
//     status: 'DRAFT'
//   });

//   const [assessmentScores, setAssessmentScores] = useState<AssessmentScores>({});
//   const [classStatistics, setClassStatistics] = useState<ClassStatistics>({});
//   const [physicalDevelopment, setPhysicalDevelopment] = useState<PhysicalDevelopment>({});

//   const [bulkResults, setBulkResults] = useState<Array<{
//     student_id: number;
//     student_name: string;
//     assessment_scores: AssessmentScores;
//     class_statistics?: ClassStatistics;
//     physical_development?: PhysicalDevelopment;
//   }>>([]);

//   const [currentTeacherId, setCurrentTeacherId] = useState<number | null>(null);

//   const recomputeClassStats = () => {
//     try {
//       const totals: number[] = [];
//       bulkResults.forEach((r) => {
//         const t = calculateTotalScore(r.assessment_scores, selectedEducationLevel);
//         if (!isNaN(t) && t >= 0) totals.push(t);
//       });
      
//       const singleSelected = formData.student && formData.student !== '';
//       const singleTotal = calculateTotalScore(assessmentScores, selectedEducationLevel);
//       if (singleSelected && singleTotal >= 0) totals.push(singleTotal);
      
//       if (totals.length === 0) {
//         setClassStatistics({});
//         return;
//       }
      
//       const sum = totals.reduce((a, b) => a + b, 0);
//       const avg = parseFloat((sum / totals.length).toFixed(2));
//       const high = Math.max(...totals);
//       const low = Math.min(...totals);
      
//       let position: number | undefined = undefined;
//       if (singleSelected) {
//         const sorted = [...totals].sort((a, b) => b - a);
//         position = sorted.indexOf(singleTotal) + 1;
//       }
      
//       setClassStatistics((prev) => ({
//         ...prev,
//         class_average: avg,
//         highest_in_class: high,
//         lowest_in_class: low,
//         class_position: position,
//         total_students: totals.length,
//       }));
//     } catch (e) {
//       // Silent fail
//     }
//   };

//   const handleClassChange = async (classId: string, isEditMode = false) => {
//     if (!classId || !currentTeacherId) return;

//     try {
//       const studentsData = await TeacherDashboardService.getStudentsForClass(parseInt(classId));
//       setFilteredStudents(studentsData);
      
//       if (!isEditMode) {
//         setTimeout(recomputeClassStats, 0);

//         const initialBulkResults = studentsData.map((student: Student) => ({
//           student_id: student.id,
//           student_name: student.full_name,
//           assessment_scores: {},
//           class_statistics: {},
//           physical_development: {}
//         }));
//         setBulkResults(initialBulkResults);

//         setAssessmentScores({});
//         setClassStatistics({});
//         setPhysicalDevelopment({});
//       }
//     } catch (error) {
//       console.error('Error loading students:', error);
//       toast.error('Failed to load students');
//     }
//   };

//   const handleSubjectChange = async (subjectId: string, isEditMode = false) => {
//     if (!subjectId || !currentTeacherId) return;

//     try {
//       const subjectAssignments = teacherAssignments.filter(a => a.subject_id === parseInt(subjectId));
      
//       if (subjectAssignments.length === 0) return;

//       const normalizedLevel = (subjectAssignments[0].education_level || '')
//         .toString()
//         .replace(/_/g, ' ')
//         .toLowerCase()
//         .trim();
//       setSelectedEducationLevel(normalizedLevel);

//       const upperLevel = (subjectAssignments[0].education_level || '')
//         .toString()
//         .replace(/\s+/g, '_')
//         .toUpperCase();
//       const configForLevel = scoringConfigs.find((c: any) => c.education_level === upperLevel && (c.is_default || c.is_active));
//       setActiveScoringConfig(configForLevel || null);

//       const classOptions: ClassOption[] = subjectAssignments.map(assignment => ({
//         id: assignment.section_id,
//         name: assignment.classroom_name,
//         section_name: assignment.section_name,
//         grade_level_name: assignment.grade_level_name,
//         education_level: normalizedLevel,
//         student_count: assignment.student_count
//       }));

//       setAvailableClasses(classOptions);
      
//       if (!isEditMode) {
//         setSelectedClass('');
//         setFilteredStudents([]);
//         setBulkResults([]);
//         setAssessmentScores({});
//         setClassStatistics({});
//         setPhysicalDevelopment({});
//       }
//     } catch (error) {
//       console.error('Error loading subject data:', error);
//       toast.error('Failed to load subject data');
//     }
//   };

//   useEffect(() => {
//     if (isOpen) {
//       loadTeacherData();
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (editResult && teacherAssignments.length > 0 && currentTeacherId) {
//       setupEditResult();
//     }
//   }, [editResult, teacherAssignments, currentTeacherId]);

//   const setupEditResult = async () => {
//     try {
//       const studentId = (editResult.student?.id ?? editResult.student_id ?? editResult.student)?.toString();
//       const subjectId = (editResult.subject?.id ?? editResult.subject_id ?? editResult.subject)?.toString();
//       const examSessionId = (editResult.exam_session?.id ?? editResult.exam_session_id ?? editResult.exam_session)?.toString();
      
//       setFormData({
//         student: studentId,
//         subject: subjectId,
//         exam_session: examSessionId,
//         status: editResult.status || 'DRAFT'
//       });
      
//       let normalizedLevel = '';
//       if (editResult.education_level) {
//         normalizedLevel = (editResult.education_level || '')
//           .toString()
//           .replace(/_/g, ' ')
//           .toLowerCase()
//           .trim();
//         setSelectedEducationLevel(normalizedLevel);
//       }
      
//       if (subjectId) {
//         const subjectAssignments = teacherAssignments.filter(a => a.subject_id === parseInt(subjectId));
        
//         if (subjectAssignments.length > 0) {
//           if (!normalizedLevel) {
//             normalizedLevel = (subjectAssignments[0].education_level || '')
//               .toString()
//               .replace(/_/g, ' ')
//               .toLowerCase()
//               .trim();
//             setSelectedEducationLevel(normalizedLevel);
//           }
          
//           const classOptions = subjectAssignments.map(assignment => ({
//             id: assignment.section_id,
//             name: assignment.classroom_name,
//             section_name: assignment.section_name,
//             grade_level_name: assignment.grade_level_name,
//             education_level: normalizedLevel,
//             student_count: assignment.student_count
//           }));
          
//           setAvailableClasses(classOptions);
          
//           if (studentId) {
//             try {
//               const studentClassPromises = classOptions.map(async (classOption) => {
//                 try {
//                   const classStudents = await TeacherDashboardService.getStudentsForClass(classOption.id);
//                   const studentExists = classStudents.find((s: Student) => s.id.toString() === studentId);
//                   return studentExists ? classOption : null;
//                 } catch {
//                   return null;
//                 }
//               });
              
//               const results = await Promise.all(studentClassPromises);
//               const studentClass = results.find(result => result !== null);
              
//               if (studentClass) {
//                 const classId = studentClass.id.toString();
//                 setSelectedClass(classId);
                
//                 const studentsData = await TeacherDashboardService.getStudentsForClass(studentClass.id);
//                 setFilteredStudents(studentsData);
//               }
//             } catch (error) {
//               console.error('Error finding student class:', error);
//             }
//           }
//         }
//       }
      
//       const educationLevel = String(editResult.education_level || '').toUpperCase();
      
//       if (educationLevel.includes('SENIOR')) {
//         setAssessmentScores({
//           test1: (editResult.first_test_score ?? editResult.test1 ?? 0).toString(),
//           test2: (editResult.second_test_score ?? editResult.test2 ?? 0).toString(), 
//           test3: (editResult.third_test_score ?? editResult.test3 ?? 0).toString(),
//           exam: (editResult.exam_score ?? editResult.exam ?? 0).toString(),
//           remarks: editResult.remarks || editResult.teacher_remark || ''
//         });
//       } else if (educationLevel.includes('NURSERY')) {
//         setAssessmentScores({
//           max_marks: (editResult.max_marks ?? 100).toString(),
//           mark_obtained: (editResult.mark_obtained ?? editResult.total_score ?? editResult.ca_score ?? 0).toString(),
//           remarks: editResult.remarks || editResult.teacher_remark || ''
//         });
//       } else if (educationLevel.includes('PRIMARY') || educationLevel.includes('JUNIOR')) {
//         setAssessmentScores({
//           ca_score: (editResult.ca_score ?? editResult.continuous_assessment_score ?? 0).toString(),
//           take_home_marks: (editResult.take_home_marks ?? editResult.take_home_score ?? 0).toString(),
//           take_home_test: (editResult.take_home_test ?? editResult.take_home_test_score ?? 0).toString(),
//           appearance_marks: (editResult.appearance_marks ?? editResult.appearance_score ?? 0).toString(),
//           practical_marks: (editResult.practical_marks ?? editResult.practical_score ?? 0).toString(),
//           project_marks: (editResult.project_marks ?? editResult.project_score ?? 0).toString(),
//           note_copying_marks: (editResult.note_copying_marks ?? editResult.note_copying_score ?? 0).toString(),
//           ca_total: (editResult.ca_total ?? editResult.total_ca_score ?? 0).toString(),
//           exam_score: (editResult.exam_score ?? editResult.exam ?? 0).toString(),
//           remarks: editResult.remarks || editResult.teacher_remark || ''
//         });
        
//         if (editResult.physical_development || editResult.height_beginning) {
//           setPhysicalDevelopment({
//             height_beginning: editResult.physical_development?.height_beginning ?? editResult.height_beginning ?? 0,
//             height_end: editResult.physical_development?.height_end ?? editResult.height_end ?? 0,
//             weight_beginning: editResult.physical_development?.weight_beginning ?? editResult.weight_beginning ?? 0,
//             weight_end: editResult.physical_development?.weight_end ?? editResult.weight_end ?? 0,
//             nurse_comment: editResult.physical_development?.nurse_comment ?? editResult.nurse_comment ?? ''
//           });
//         }
//       } else {
//         setAssessmentScores({
//           ca_score: (editResult.ca_score ?? editResult.continuous_assessment_score ?? 0).toString(),
//           exam_score: (editResult.exam_score ?? editResult.exam ?? 0).toString(),
//           remarks: editResult.remarks || editResult.teacher_remark || ''
//         });
//       }
      
//       if (editResult.class_statistics || editResult.class_average) {
//         setClassStatistics({
//           class_average: editResult.class_statistics?.class_average ?? editResult.class_average ?? 0,
//           highest_in_class: editResult.class_statistics?.highest_in_class ?? editResult.highest_in_class ?? 0,
//           lowest_in_class: editResult.class_statistics?.lowest_in_class ?? editResult.lowest_in_class ?? 0,
//           class_position: editResult.class_statistics?.class_position ?? editResult.class_position ?? editResult.position ?? 0,
//           total_students: editResult.class_statistics?.total_students ?? editResult.total_students ?? 0
//         });
//       }
//     } catch (error) {
//       console.error('Error setting up edit result:', error);
//       toast.error('Failed to load edit data');
//     }
//   };

//   useEffect(() => {
//     if (formData.subject && availableClasses.length === 1 && !selectedClass) {
//       const onlyClass = availableClasses[0];
//       setSelectedClass(String(onlyClass.id));
//       setTimeout(() => handleClassChange(String(onlyClass.id)), 0);
//     }
//   }, [availableClasses, formData.subject, selectedClass]);

//   const loadTeacherData = async () => {
//     try {
//       setLoading(true);
      
//       const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
//       if (!teacherId) {
//         throw new Error('Teacher ID not found');
//       }
//       setCurrentTeacherId(teacherId);

//       const subjects = await TeacherDashboardService.getTeacherSubjects(teacherId);
      
//       const assignments: any[] = [];
//       const uniqueSubjects: Subject[] = [];
      
//       subjects.forEach(subject => {
//         const existingSubject = uniqueSubjects.find(s => s.id === subject.id);
//         if (!existingSubject) {
//           uniqueSubjects.push({
//             id: subject.id,
//             name: subject.name,
//             code: subject.code
//           });
//         }
        
//         if (subject.assignments && Array.isArray(subject.assignments)) {
//           subject.assignments.forEach((assignment: any) => {
//             assignments.push({
//               id: assignment.id,
//               classroom_name: assignment.classroom_name || 'Unknown',
//               section_name: assignment.section || 'Unknown',
//               grade_level_name: assignment.grade_level || 'Unknown',
//               education_level: assignment.education_level || 'Unknown',
//               subject_name: subject.name,
//               subject_code: subject.code,
//               subject_id: subject.id,
//               grade_level_id: assignment.grade_level_id,
//               section_id: assignment.classroom_id,
//               student_count: assignment.student_count || 0,
//               periods_per_week: assignment.periods_per_week || 0
//             });
//           });
//         }
//       });
      
//       setTeacherAssignments(assignments);
//       setSubjects(uniqueSubjects);

//       const sessionsResponse = await ResultService.getExamSessions();
//       const sessions = Array.isArray(sessionsResponse) ? sessionsResponse : [];
//       setExamSessions(sessions);
      
//       try {
//         const configsResponse = await ResultSettingsService.getScoringConfigurations();
//         const configsArray = Array.isArray(configsResponse)
//           ? configsResponse
//           : ((configsResponse as any)?.results || (configsResponse as any)?.data || []);
//         setScoringConfigs(configsArray || []);
//       } catch (e) {
//         console.warn('Could not load scoring configurations.', e);
//         setScoringConfigs([]);
//       }
      
//       try {
//         const gsResp = await ResultService.getGradingSystems();
//         const gsArray = Array.isArray(gsResp) ? gsResp : (gsResp?.results || gsResp?.data || []);
//         if (gsArray && gsArray.length) {
//           const firstId = Number(gsArray[0].id || gsArray[0].pk || gsArray[0]);
//           if (!Number.isNaN(firstId)) setGradingSystemId(firstId);
//         }
//       } catch (e) {
//         console.warn('Could not load grading systems; will rely on backend default.', e);
//       }

//     } catch (error) {
//       console.error('Error loading teacher data:', error);
//       toast.error('Failed to load teacher data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSingleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateSingleForm()) return;

//     try {
//       setSaving(true);
      
//       let gsId = gradingSystemId;
//       if (gsId == null) {
//         try {
//           const gsResp = await ResultService.getGradingSystems();
//           const gsArray = Array.isArray(gsResp) ? gsResp : (gsResp?.results || gsResp?.data || []);
//           if (gsArray && gsArray.length) {
//             const firstId = Number(gsArray[0].id || gsArray[0].pk || gsArray[0]);
//             if (!Number.isNaN(firstId)) {
//               gsId = firstId;
//               setGradingSystemId(firstId);
//             }
//           }
//         } catch {}
//       }
      
//       const totalScore = calculateTotalScore(assessmentScores, selectedEducationLevel);
//       const structure = getAssessmentStructure(selectedEducationLevel);
//       let ca_score = 0;
//       let exam_score = 0;
//       let education_level = normalizeEducationLevelForApi(selectedEducationLevel);

//       if (structure.type === 'senior') {
//         ca_score =
//           parseFloat(assessmentScores.test1?.toString() || '0') +
//           parseFloat(assessmentScores.test2?.toString() || '0') +
//           parseFloat(assessmentScores.test3?.toString() || '0');
//         exam_score = parseFloat(assessmentScores.exam?.toString() || '0');
//       } else if (structure.type === 'nursery') {
//         ca_score = parseFloat(assessmentScores.mark_obtained?.toString() || '0');
//         exam_score = 0;
//       } else {
//         ca_score = parseFloat(assessmentScores.ca_total?.toString() || assessmentScores.ca_score?.toString() || '0');
//         exam_score = parseFloat(assessmentScores.exam_score?.toString() || '0');
//       }

//       let resultData: any;
//       if (structure.type === 'senior') {
//         resultData = {
//           student: formData.student,
//           subject: formData.subject,
//           exam_session: formData.exam_session,
//           grading_system: gsId ?? undefined,
//           first_test_score: parseFloat(assessmentScores.test1?.toString() || '0'),
//           second_test_score: parseFloat(assessmentScores.test2?.toString() || '0'),
//           third_test_score: parseFloat(assessmentScores.test3?.toString() || '0'),
//           exam_score: parseFloat(assessmentScores.exam?.toString() || '0'),
//           teacher_remark: assessmentScores.remarks || '',
//           status: formData.status,
//           education_level,
//         };
//       } else {
//         resultData = {
//           student: formData.student,
//           subject: formData.subject,
//           exam_session: formData.exam_session,
//           grading_system: gsId ?? undefined,
//           ca_score,
//           exam_score,
//           total_score: totalScore,
//           grade: getGrade(totalScore),
//           remarks: assessmentScores.remarks || '',
//           status: formData.status,
//           education_level,
//           class_statistics: classStatistics,
//           physical_development: physicalDevelopment
//         };
//       }

//       if (editResult) {
//         const candidates = [
//           editResult?.id,
//           editResult?.pk,
//           editResult?.result_id,
//           editResult?.student_result_id,
//           editResult?.studentResultId,
//           editResult?.result?.id
//         ];
        
//         const numeric = candidates
//           .map((v) => (v !== null && v !== undefined ? Number(v) : NaN))
//           .find((n) => Number.isFinite(n) && n > 0);
//         const safeId = numeric ? String(numeric) : '';
        
//         let finalId = safeId;
//         if (!finalId) {
//           try {
//             const resolvedId = await ResultService.findResultIdByComposite({
//               student: formData.student,
//               subject: formData.subject,
//               exam_session: formData.exam_session,
//               education_level: education_level,
//             });
//             if (resolvedId) {
//               finalId = resolvedId;
//             }
//           } catch (e) {
//             console.warn('Composite id lookup failed', e);
//           }
//         }
//         if (!finalId) {
//           toast.error('Cannot update: missing result ID. Please refresh and try again.');
//           throw new Error('Invalid result id for update');
//         }
//         await ResultService.updateStudentResult(finalId, resultData, education_level);
//         toast.success('Result updated successfully!');
//       } else {
//         try {
//           await ResultService.createStudentResult(resultData, education_level);
//           toast.success('Result recorded successfully!');
//         } catch (error: any) {
//           console.error('Error creating result:', error);
          
//           if (error.response?.status === 400 && error.response?.data?.non_field_errors) {
//             const errorMessage = error.response.data.non_field_errors[0];
//             if (errorMessage.includes('unique')) {
//               toast.error('A result already exists for this student, subject, and exam session. Please edit the existing result instead.');
//               return;
//             }
//           }
          
//           const errorMessage = error.response?.data?.message || error.message || 'Failed to create result';
//           toast.error(errorMessage);
//           throw error;
//         }
//       }

//       onResultCreated();
//       onClose();
//     } catch (error) {
//       console.error('Error saving result:', error);
//       toast.error('Failed to save result. Please try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleBulkSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateBulkForm()) return;

//     try {
//       setSaving(true);
      
//       const validResults = bulkResults.filter(result => {
//         const total = calculateTotalScore(result.assessment_scores, selectedEducationLevel);
//         return total > 0;
//       });

//       let gsId = gradingSystemId;
//       if (gsId == null) {
//         try {
//           const gsResp = await ResultService.getGradingSystems();
//           const gsArray = Array.isArray(gsResp) ? gsResp : (gsResp?.results || gsResp?.data || []);
//           if (gsArray && gsArray.length) {
//             const firstId = Number(gsArray[0].id || gsArray[0].pk || gsArray[0]);
//             if (!Number.isNaN(firstId)) {
//               gsId = firstId;
//               setGradingSystemId(firstId);
//             }
//           }
//         } catch {}
//       }

//       for (const result of validResults) {
//         const totalScore = calculateTotalScore(result.assessment_scores, selectedEducationLevel);
        
//         const structure = getAssessmentStructure(selectedEducationLevel);
//         let ca_score = 0;
//         let exam_score = 0;
//         let education_level = normalizeEducationLevelForApi(selectedEducationLevel);

//         if (structure.type === 'senior') {
//           ca_score = 
//             parseFloat(result.assessment_scores.test1?.toString() || '0') +
//             parseFloat(result.assessment_scores.test2?.toString() || '0') +
//             parseFloat(result.assessment_scores.test3?.toString() || '0');
//           exam_score = parseFloat(result.assessment_scores.exam?.toString() || '0');
//         } else if (structure.type === 'nursery') {
//           ca_score = parseFloat(result.assessment_scores.mark_obtained?.toString() || '0');
//           exam_score = 0;
//         } else {
//           ca_score = parseFloat(result.assessment_scores.ca_total?.toString() || result.assessment_scores.ca_score?.toString() || '0');
//           exam_score = parseFloat(result.assessment_scores.exam_score?.toString() || '0');
//         }

//         let resultData: any;
//         if (structure.type === 'senior') {
//           resultData = {
//             student: result.student_id.toString(),
//             subject: formData.subject,
//             exam_session: formData.exam_session,
//             grading_system: gsId ?? undefined,
//             first_test_score: parseFloat(result.assessment_scores.test1?.toString() || '0'),
//             second_test_score: parseFloat(result.assessment_scores.test2?.toString() || '0'),
//             third_test_score: parseFloat(result.assessment_scores.test3?.toString() || '0'),
//             exam_score: parseFloat(result.assessment_scores.exam?.toString() || '0'),
//             teacher_remark: result.assessment_scores.remarks || '',
//             status: 'DRAFT',
//             education_level,
//           };
//         } else {
//           resultData = {
//             student: result.student_id.toString(),
//             subject: formData.subject,
//             exam_session: formData.exam_session,
//             grading_system: gsId ?? undefined,
//             ca_score,
//             exam_score,
//             total_score: totalScore,
//             grade: getGrade(totalScore),
//             remarks: result.assessment_scores.remarks || '',
//             status: 'DRAFT',
//             education_level,
//             class_statistics: result.class_statistics || {},
//             physical_development: result.physical_development || {}
//           };
//         }

//         await ResultService.createStudentResult(resultData, education_level);
//       }

//       toast.success(`${validResults.length} results recorded successfully!`);
//       onResultCreated();
//       onClose();
//     } catch (error) {
//       console.error('Error saving bulk results:', error);
//       toast.error('Failed to save results. Please try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const validateSingleForm = () => {
//     if (!formData.student) {
//       toast.error('Please select a student');
//       return false;
//     }
//     if (!formData.subject) {
//       toast.error('Please select a subject');
//       return false;
//     }
//     if (!selectedClass) {
//       toast.error('Please select a class');
//       return false;
//     }
//     if (!formData.exam_session) {
//       toast.error('Please select an exam session');
//       return false;
//     }

//     const structure = getAssessmentStructure(selectedEducationLevel);
//     const totalScore = calculateTotalScore(assessmentScores, selectedEducationLevel);
    
//     if (totalScore <= 0) {
//       toast.error('Please enter at least one valid score');
//       return false;
//     }

//     for (let i = 0; i < structure.fields.length; i++) {
//       const field = structure.fields[i];
//       const value = assessmentScores[field as keyof AssessmentScores];
//       const maxValue = structure.maxValues[i];
      
//       if (value && value !== '') {
//         const numValue = parseFloat(value.toString());
//         if (isNaN(numValue) || numValue < 0 || numValue > maxValue) {
//           toast.error(`${structure.labels[i]} must be between 0 and ${maxValue}`);
//           return false;
//         }
//       }
//     }

//     return true;
//   };

//   const validateBulkForm = () => {
//     if (!formData.subject) {
//       toast.error('Please select a subject');
//       return false;
//     }
//     if (!selectedClass) {
//       toast.error('Please select a class');
//       return false;
//     }
//     if (!formData.exam_session) {
//       toast.error('Please select an exam session');
//       return false;
//     }

//     const validResults = bulkResults.filter(result => {
//       const total = calculateTotalScore(result.assessment_scores, selectedEducationLevel);
//       return total > 0;
//     });

//     if (validResults.length === 0) {
//       toast.error('Please enter scores for at least one student');
//       return false;
//     }

//     const structure = getAssessmentStructure(selectedEducationLevel);
//     for (const result of validResults) {
//       for (let i = 0; i < structure.fields.length; i++) {
//         const field = structure.fields[i];
//         const value = result.assessment_scores[field as keyof AssessmentScores];
//         const maxValue = structure.maxValues[i];
        
//         if (value && value !== '') {
//           const numValue = parseFloat(value.toString());
//           if (isNaN(numValue) || numValue < 0 || numValue > maxValue) {
//             toast.error(`Invalid ${structure.labels[i]} for ${result.student_name}. Must be 0-${maxValue}`);
//             return false;
//           }
//         }
//       }
//     }

//     return true;
//   };

//   const updateBulkResult = (index: number, field: string, value: string) => {
//     setBulkResults(prev => prev.map((result, i) => 
//       i === index ? { 
//         ...result, 
//         assessment_scores: { 
//           ...result.assessment_scores, 
//           [field]: value 
//         } 
//       } : result
//     ));
//     setTimeout(recomputeClassStats, 0);
//   };

//   const updateAssessmentScore = (field: keyof AssessmentScores, value: string) => {
//     setAssessmentScores(prev => ({ ...prev, [field]: value }));
//     setTimeout(recomputeClassStats, 0);
//   };

//   const updatePhysicalDevelopment = (field: keyof PhysicalDevelopment, value: string | number) => {
//     setPhysicalDevelopment(prev => ({ ...prev, [field]: value }));
//   };

//   const getGrade = (total: number) => {
//     if (total >= 70) return 'A';
//     if (total >= 60) return 'B';
//     if (total >= 50) return 'C';
//     if (total >= 45) return 'D';
//     if (total >= 39) return 'E';
//     return 'F';
//   };

//   const getGradeColor = (grade: string) => {
//     const gradeConfig = {
//       'A': 'text-green-600 bg-green-100',
//       'B': 'text-blue-600 bg-blue-100',
//       'C': 'text-yellow-600 bg-yellow-100',
//       'D': 'text-orange-600 bg-orange-100',
//       'E': 'text-purple-600 bg-purple-100',
//       'F': 'text-red-600 bg-red-100'
//     };
//     return gradeConfig[grade as keyof typeof gradeConfig] || 'text-gray-600 bg-gray-100';
//   };

//   const resetForm = () => {
//     setFormData({
//       student: '',
//       subject: '',
//       exam_session: '',
//       status: 'DRAFT'
//     });
//     setAssessmentScores({});
//     setClassStatistics({});
//     setPhysicalDevelopment({});
//     setBulkResults([]);
//     setFilteredStudents([]);
//     setSelectedEducationLevel('');
//     setAvailableClasses([]);
//     setSelectedClass('');
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const renderAssessmentFields = (scores: AssessmentScores, onUpdate: (field: keyof AssessmentScores, value: string) => void) => {
//     const structure = getAssessmentStructure(selectedEducationLevel, activeScoringConfig);
    
//     return (
//       <div className="space-y-4">
//         <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
//           <BarChart3 className="w-5 h-5 mr-2" />
//           Assessment Scores ({structure.type.toUpperCase()})
//         </h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {structure.fields.map((field, index) => (
//             <div key={field}>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 {structure.labels[index]} (0-{structure.maxValues[index]})
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 max={structure.maxValues[index]}
//                 step="0.1"
//                 value={scores[field as keyof AssessmentScores] || ''}
//                 onChange={(e) => onUpdate(field as keyof AssessmentScores, e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//                 placeholder={`Enter ${structure.labels[index]}`}
//               />
//             </div>
//           ))}
//         </div>
        
//         {(() => {
//           const total = calculateTotalScore(scores, selectedEducationLevel);
//           return total > 0 ? (
//             <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Score:</span>
//                 <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{total}</span>
//               </div>
//               <div className="mt-2">
//                 <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(getGrade(total))}`}>
//                   Grade: {getGrade(total)}
//                 </span>
//               </div>
//             </div>
//           ) : null;
//         })()}
//       </div>
//     );
//   };

//   const renderClassStatistics = (stats: ClassStatistics) => {
//     const structure = getAssessmentStructure(selectedEducationLevel);
//     if (!structure.showClassStatistics) return null;

//     return (
//       <div className="space-y-4">
//         <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
//           <TrendingUp className="w-5 h-5 mr-2" />
//           Class Statistics
//         </h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Class Average (auto)
//             </label>
//             <input
//               type="number"
//               value={stats.class_average || ''}
//               readOnly
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Highest in Class (auto)
//             </label>
//             <input
//               type="number"
//               value={stats.highest_in_class || ''}
//               readOnly
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Lowest in Class (auto)
//             </label>
//             <input
//               type="number"
//               value={stats.lowest_in_class || ''}
//               readOnly
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Class Position (auto)
//             </label>
//             <input
//               type="number"
//               value={stats.class_position || ''}
//               readOnly
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
//             />
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderPhysicalDevelopment = (physical: PhysicalDevelopment, onUpdate: (field: keyof PhysicalDevelopment, value: string | number) => void) => {
//     const structure = getAssessmentStructure(selectedEducationLevel);
//     if (!structure.showPhysicalDevelopment) return null;

//     return (
//       <div className="space-y-4">
//         <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
//           <Users className="w-5 h-5 mr-2" />
//           Physical Development
//         </h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Height (Beginning) - cm
//             </label>
//             <input
//               type="number"
//               min="0"
//               value={physical.height_beginning || ''}
//               onChange={(e) => onUpdate('height_beginning', parseFloat(e.target.value) || 0)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Height (End) - cm
//             </label>
//             <input
//               type="number"
//               min="0"
//               value={physical.height_end || ''}
//               onChange={(e) => onUpdate('height_end', parseFloat(e.target.value) || 0)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Weight (Beginning) - kg
//             </label>
//             <input
//               type="number"
//               min="0"
//               step="0.1"
//               value={physical.weight_beginning || ''}
//               onChange={(e) => onUpdate('weight_beginning', parseFloat(e.target.value) || 0)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Weight (End) - kg
//             </label>
//             <input
//               type="number"
//               min="0"
//               step="0.1"
//               value={physical.weight_end || ''}
//               onChange={(e) => onUpdate('weight_end', parseFloat(e.target.value) || 0)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//             />
//           </div>
//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Nurse's Comment
//             </label>
//             <textarea
//               value={physical.nurse_comment || ''}
//               onChange={(e) => onUpdate('nurse_comment', e.target.value)}
//               rows={2}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//             />
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//               {editResult ? 'Edit Result' : 'Record Student Result'}
//             </h3>
//             <button
//               onClick={handleClose}
//               className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>

//           <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
//             <nav className="-mb-px flex space-x-8">
//               <button
//                 onClick={() => setActiveTab('single')}
//                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === 'single'
//                     ? 'border-blue-500 text-blue-600 dark:text-blue-400'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
//                 }`}
//               >
//                 <User className="w-4 h-4 inline mr-2" />
//                 Single Result
//               </button>
//               <button
//                 onClick={() => setActiveTab('bulk')}
//                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === 'bulk'
//                     ? 'border-blue-500 text-blue-600 dark:text-blue-400'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
//                 }`}
//               >
//                 <FileText className="w-4 h-4 inline mr-2" />
//                 Bulk Results
//               </button>
//             </nav>
//           </div>

//           {loading ? (
//             <div className="flex items-center justify-center h-32">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//             </div>
//           ) : (
//             <>
//               {activeTab === 'single' && (
//                 <form onSubmit={handleSingleSubmit} className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Subject *
//                       </label>
//                       <select
//                         value={formData.subject}
//                         onChange={(e) => {
//                           setFormData(prev => ({ ...prev, subject: e.target.value, student: '' }));
//                           handleSubjectChange(e.target.value, !!editResult);
//                         }}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                         required
//                       >
//                         <option value="">Select Subject</option>
//                         {subjects.map(subject => (
//                           <option key={subject.id} value={subject.id}>
//                             {subject.name} ({subject.code})
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Class *
//                       </label>
//                       <select
//                         value={selectedClass}
//                         onChange={(e) => {
//                           setSelectedClass(e.target.value);
//                           setFormData(prev => ({ ...prev, student: '' }));
//                           handleClassChange(e.target.value);
//                         }}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                         required
//                         disabled={!formData.subject || availableClasses.length === 0}
//                       >
//                         <option value="">Select Class</option>
//                         {availableClasses.map(classOption => (
//                           <option key={classOption.id} value={classOption.id}>
//                             {classOption.grade_level_name} {classOption.section_name} ({classOption.student_count} students)
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Exam Session *
//                       </label>
//                       <select
//                         value={formData.exam_session}
//                         onChange={(e) => setFormData(prev => ({ ...prev, exam_session: e.target.value }))}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                         required
//                       >
//                         <option value="">Select Exam Session</option>
//                         {examSessions.map(session => (
//                           <option key={session.id} value={session.id}>
//                             {session.academic_session?.name} - {session.term} {typeof session.academic_session === 'object' ? session.academic_session?.name : session.academic_session || ''}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Student *
//                       </label>
//                       <select
//                         value={formData.student}
//                         onChange={(e) => setFormData(prev => ({ ...prev, student: e.target.value }))}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                         required
//                         disabled={!selectedClass || filteredStudents.length === 0}
//                       >
//                         <option value="">Select Student</option>
//                         {filteredStudents.map(student => (
//                           <option key={student.id} value={student.id}>
//                             {student.full_name}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Status
//                       </label>
//                       <select
//                         value={formData.status}
//                         onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                       >
//                         <option value="DRAFT">Draft</option>
//                         <option value="PUBLISHED">Published</option>
//                         <option value="APPROVED">Approved</option>
//                       </select>
//                     </div>
//                   </div>

//                   {selectedEducationLevel && (
//                     <>
//                       {renderAssessmentFields(assessmentScores, updateAssessmentScore)}
                      
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                           Teacher's Remarks
//                         </label>
//                         <textarea
//                           value={assessmentScores.remarks || ''}
//                           onChange={(e) => updateAssessmentScore('remarks', e.target.value)}
//                           rows={3}
//                           className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                           placeholder="Enter remarks..."
//                         />
//                       </div>

//                       {renderClassStatistics(classStatistics)}
//                       {renderPhysicalDevelopment(physicalDevelopment, updatePhysicalDevelopment)}
//                     </>
//                   )}

//                   <div className="flex justify-end space-x-3">
//                     <button
//                       type="submit"
//                       disabled={saving}
//                       className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                     >
//                       {saving ? (
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                       ) : (
//                         <Save className="w-4 h-4 mr-2" />
//                       )}
//                       {editResult ? 'Update Result' : 'Record Result'}
//                     </button>
//                   </div>
//                 </form>
//               )}

//               {activeTab === 'bulk' && (
//                 <form onSubmit={handleBulkSubmit} className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Subject *
//                       </label>
//                       <select
//                         value={formData.subject}
//                         onChange={(e) => {
//                           setFormData(prev => ({ ...prev, subject: e.target.value }));
//                           handleSubjectChange(e.target.value);
//                         }}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                         required
//                       >
//                         <option value="">Select Subject</option>
//                         {subjects.map(subject => (
//                           <option key={subject.id} value={subject.id}>
//                             {subject.name} ({subject.code})
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Class *
//                       </label>
//                       <select
//                         value={selectedClass}
//                         onChange={(e) => {
//                           setSelectedClass(e.target.value);
//                           handleClassChange(e.target.value);
//                         }}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                         required
//                         disabled={!formData.subject || availableClasses.length === 0}
//                       >
//                         <option value="">Select Class</option>
//                         {availableClasses.map(classOption => (
//                           <option key={classOption.id} value={classOption.id}>
//                             {classOption.grade_level_name} {classOption.section_name} ({classOption.student_count} students)
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Exam Session *
//                       </label>
//                       <select
//                         value={formData.exam_session}
//                         onChange={(e) => setFormData(prev => ({ ...prev, exam_session: e.target.value }))}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                         required
//                       >
//                         <option value="">Select Exam Session</option>
//                         {examSessions.map(session => (
//                           <option key={session.id} value={session.id}>
//                             {session.academic_session?.name} - {session.term} {typeof session.academic_session === 'object' ? session.academic_session?.name : session.academic_session || ''}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   {bulkResults.length > 0 && selectedEducationLevel && (
//                     <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
//                       <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
//                         <GraduationCap className="w-5 h-5 mr-2" />
//                         Enter Scores for Students ({getAssessmentStructure(selectedEducationLevel, activeScoringConfig).type.toUpperCase()})
//                       </h4>
//                       <div className="overflow-x-auto">
//                         <table className="min-w-full">
//                           <thead>
//                             <tr className="border-b border-gray-200 dark:border-gray-600">
//                               <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                                 Student
//                               </th>
//                               {getAssessmentStructure(selectedEducationLevel, activeScoringConfig).fields.map((field, index) => (
//                                 <th key={field} className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                                   {getAssessmentStructure(selectedEducationLevel, activeScoringConfig).labels[index]}
//                                 </th>
//                               ))}
//                               <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                                 Total
//                               </th>
//                               <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                                 Grade
//                               </th>
//                               <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                                 Remarks
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {bulkResults.map((result, index) => {
//                               const total = calculateTotalScore(result.assessment_scores, selectedEducationLevel);
//                               const grade = getGrade(total);
//                               return (
//                                 <tr key={result.student_id} className="border-b border-gray-200 dark:border-gray-600">
//                                   <td className="py-2 px-3 text-sm text-gray-900 dark:text-white">
//                                     {result.student_name}
//                                   </td>
//                                   {getAssessmentStructure(selectedEducationLevel, activeScoringConfig).fields.map((field, fieldIndex) => (
//                                     <td key={field} className="py-2 px-3">
//                                       <input
//                                         type="number"
//                                         min="0"
//                                         max={getAssessmentStructure(selectedEducationLevel, activeScoringConfig).maxValues[fieldIndex]}
//                                         step="0.1"
//                                         value={result.assessment_scores[field as keyof AssessmentScores] || ''}
//                                         onChange={(e) => updateBulkResult(index, field, e.target.value)}
//                                         className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                         placeholder="0"
//                                       />
//                                     </td>
//                                   ))}
//                                   <td className="py-2 px-3 text-sm font-medium text-gray-900 dark:text-white">
//                                     {total > 0 ? total : '-'}
//                                   </td>
//                                   <td className="py-2 px-3">
//                                     {total > 0 && (
//                                       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(grade)}`}>
//                                         {grade}
//                                       </span>
//                                     )}
//                                   </td>
//                                   <td className="py-2 px-3">
//                                     <input
//                                       type="text"
//                                       value={result.assessment_scores.remarks || ''}
//                                       onChange={(e) => updateBulkResult(index, 'remarks', e.target.value)}
//                                       className="w-32 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                       placeholder="Remarks"
//                                     />
//                                   </td>
//                                 </tr>
//                               );
//                             })}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   )}

//                   <div className="flex justify-end space-x-3">
//                     <button
//                       type="button"
//                       onClick={handleClose}
//                       className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={saving || bulkResults.length === 0}
//                       className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                     >
//                       {saving ? (
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                       ) : (
//                         <Save className="w-4 h-4 mr-2" />
//                       )}
//                       Record {bulkResults.filter(r => calculateTotalScore(r.assessment_scores, selectedEducationLevel) > 0).length} Results
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResultRecordingForm;


import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import TeacherDashboardService from '@/services/TeacherDashboardService';
import ResultService from '@/services/ResultService';
import ResultSettingsService from '@/services/ResultSettingsService';
import { toast } from 'react-toastify';
import { ExamSessionInfo } from '@/types/types';
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

interface AssessmentScores {
  test1?: number | string;
  test2?: number | string;
  test3?: number | string;
  exam?: number | string;
  ca_score?: number | string;
  take_home_marks?: number | string;
  take_home_test?: number | string;
  appearance_marks?: number | string;
  practical_marks?: number | string;
  project_marks?: number | string;
  note_copying_marks?: number | string;
  ca_total?: number | string;
  exam_score?: number | string;
  max_marks?: number | string;
  mark_obtained?: number | string;
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

interface ResultRecordingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void>;
  onResultCreated: () => void;
  editResult?: any;
  mode?: 'create' | 'edit';
}

const getAssessmentStructure = (educationLevel: string, scoringConfig?: any) => {
  const level = (educationLevel || '')
    .toString()
    .replace(/_/g, ' ')
    .toLowerCase()
    .trim();

  if (scoringConfig) {
    const upperLevel = (educationLevel || '')
      .toString()
      .replace(/\s+/g, '_')
      .toUpperCase();

    if (upperLevel === 'SENIOR_SECONDARY') {
      return {
        type: 'senior',
        fields: ['test1', 'test2', 'test3', 'exam'],
        labels: [
          `1st Test (${Number(scoringConfig.first_test_max_score) || 10})`,
          `2nd Test (${Number(scoringConfig.second_test_max_score) || 10})`,
          `3rd Test (${Number(scoringConfig.third_test_max_score) || 10})`,
          `Exam (${Number(scoringConfig.exam_max_score) || 70})`
        ],
        maxValues: [
          Number(scoringConfig.first_test_max_score) || 10,
          Number(scoringConfig.second_test_max_score) || 10,
          Number(scoringConfig.third_test_max_score) || 10,
          Number(scoringConfig.exam_max_score) || 70
        ],
        showPhysicalDevelopment: false,
        showClassStatistics: true
      };
    }

    if (upperLevel === 'PRIMARY' || upperLevel === 'JUNIOR_SECONDARY') {
      return {
        type: upperLevel === 'PRIMARY' ? 'primary' : 'junior',
        fields: [
          'ca_score',
          'take_home_marks',
          'appearance_marks',
          'practical_marks',
          'project_marks',
          'note_copying_marks',
          'ca_total',
          'exam_score'
        ],
        labels: [
          `C.A (${Number(scoringConfig.continuous_assessment_max_score) || 15})`,
          `Take Home Test (${Number(scoringConfig.take_home_test_max_score) || 5})`,
          `Appearance (${Number(scoringConfig.appearance_max_score) || 5})`,
          `Practical (${Number(scoringConfig.practical_max_score) || 5})`,
          `Project (${Number(scoringConfig.project_max_score) || 5})`,
          `Note Copying (${Number(scoringConfig.note_copying_max_score) || 5})`,
          `C.A Total (${Number(scoringConfig.total_ca_max_score) || 40})`,
          `Exam (${Number(scoringConfig.exam_max_score) || 60})`
        ],
        maxValues: [
          Number(scoringConfig.continuous_assessment_max_score) || 15,
          Number(scoringConfig.take_home_test_max_score) || 5,
          Number(scoringConfig.appearance_max_score) || 5,
          Number(scoringConfig.practical_max_score) || 5,
          Number(scoringConfig.project_max_score) || 5,
          Number(scoringConfig.note_copying_max_score) || 5,
          Number(scoringConfig.total_ca_max_score) || 40,
          Number(scoringConfig.exam_max_score) || 60
        ],
        showPhysicalDevelopment: true,
        showClassStatistics: true
      };
    }

    if (upperLevel === 'NURSERY') {
      const totalMax = Number(scoringConfig.total_max_score) || 100;
      return {
        type: 'nursery',
        fields: ['max_marks', 'mark_obtained'],
        labels: ['Max Marks', 'Mark Obtained'],
        maxValues: [totalMax, totalMax],
        showPhysicalDevelopment: true,
        showClassStatistics: false
      };
    }
  }

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
        maxValues: [15, 5, 5, 5, 5, 5, 5, 40, 60],
        showPhysicalDevelopment: true,
        showClassStatistics: true
      };
    case 'junior secondary':
      return {
        type: 'junior',
        fields: ['ca_score', 'take_home_marks', 'take_home_test', 'appearance_marks', 'practical_marks', 'project_marks', 'note_copying_marks', 'ca_total', 'exam_score'],
        labels: ['C.A (15)', 'Take Home', 'Take Home Test', 'Appearance', 'Practical', 'Project', 'Note Copying', 'C.A Total', 'Exam (60%)'],
        maxValues: [15, 5, 5, 5, 5, 5, 5, 40, 60],
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
  editResult
}: ResultRecordingFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<string>('');
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSessionInfo[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [gradingSystemId, setGradingSystemId] = useState<number | null>(null);
  const [scoringConfigs, setScoringConfigs] = useState<any[]>([]);
  const [activeScoringConfig, setActiveScoringConfig] = useState<any | null>(null);

  const normalizeEducationLevelForApi = (level: string) =>
    (level || '')
      .toString()
      .trim()
      .replace(/\s+/g, '_')
      .toUpperCase();
  
  const [formData, setFormData] = useState({
    student: '',
    subject: '',
    exam_session: '',
    status: 'DRAFT'
  });

  const [assessmentScores, setAssessmentScores] = useState<AssessmentScores>({});
  const [classStatistics, setClassStatistics] = useState<ClassStatistics>({});
  const [physicalDevelopment, setPhysicalDevelopment] = useState<PhysicalDevelopment>({});

  const [bulkResults, setBulkResults] = useState<Array<{
    student_id: number;
    student_name: string;
    assessment_scores: AssessmentScores;
    class_statistics?: ClassStatistics;
    physical_development?: PhysicalDevelopment;
  }>>([]);

  const [currentTeacherId, setCurrentTeacherId] = useState<number | null>(null);

  const recomputeClassStats = () => {
    try {
      const totals: number[] = [];
      bulkResults.forEach((r) => {
        const t = calculateTotalScore(r.assessment_scores, selectedEducationLevel);
        if (!isNaN(t) && t >= 0) totals.push(t);
      });
      
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
      // Silent fail
    }
  };

  const handleClassChange = async (classId: string, isEditMode = false) => {
    if (!classId || !currentTeacherId) return;

    try {
      const studentsData = await TeacherDashboardService.getStudentsForClass(parseInt(classId));
      setFilteredStudents(studentsData);
      
      if (!isEditMode) {
        setTimeout(recomputeClassStats, 0);

        const initialBulkResults = studentsData.map((student: Student) => ({
          student_id: student.id,
          student_name: student.full_name,
          assessment_scores: {},
          class_statistics: {},
          physical_development: {}
        }));
        setBulkResults(initialBulkResults);

        setAssessmentScores({});
        setClassStatistics({});
        setPhysicalDevelopment({});
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    }
  };

  const handleSubjectChange = async (subjectId: string, isEditMode = false) => {
    if (!subjectId || !currentTeacherId) return;

    try {
      const subjectAssignments = teacherAssignments.filter(a => a.subject_id === parseInt(subjectId));
      
      if (subjectAssignments.length === 0) return;

      const normalizedLevel = (subjectAssignments[0].education_level || '')
        .toString()
        .replace(/_/g, ' ')
        .toLowerCase()
        .trim();
      setSelectedEducationLevel(normalizedLevel);

      const upperLevel = (subjectAssignments[0].education_level || '')
        .toString()
        .replace(/\s+/g, '_')
        .toUpperCase();
      const configForLevel = scoringConfigs.find((c: any) => c.education_level === upperLevel && (c.is_default || c.is_active));
      setActiveScoringConfig(configForLevel || null);

      const classOptions: ClassOption[] = subjectAssignments.map(assignment => ({
        id: assignment.section_id,
        name: assignment.classroom_name,
        section_name: assignment.section_name,
        grade_level_name: assignment.grade_level_name,
        education_level: normalizedLevel,
        student_count: assignment.student_count
      }));

      setAvailableClasses(classOptions);
      
      if (!isEditMode) {
        setSelectedClass('');
        setFilteredStudents([]);
        setBulkResults([]);
        setAssessmentScores({});
        setClassStatistics({});
        setPhysicalDevelopment({});
      }
    } catch (error) {
      console.error('Error loading subject data:', error);
      toast.error('Failed to load subject data');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTeacherData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editResult && teacherAssignments.length > 0 && currentTeacherId) {
      setupEditResult();
    }
  }, [editResult, teacherAssignments, currentTeacherId]);

  const setupEditResult = async () => {
    try {
      console.log('📝 Edit Result Data:', editResult);
      
      const studentId = (editResult.student?.id ?? editResult.student_id ?? editResult.student)?.toString();
      const subjectId = (editResult.subject?.id ?? editResult.subject_id ?? editResult.subject)?.toString();
      const examSessionId = (editResult.exam_session?.id ?? editResult.exam_session_id ?? editResult.exam_session)?.toString();
      
      setFormData({
        student: studentId,
        subject: subjectId,
        exam_session: examSessionId,
        status: editResult.status || 'DRAFT'
      });
      
      let normalizedLevel = '';
      if (subjectId) {
        const subjectAssignments = teacherAssignments.filter(a => a.subject_id === parseInt(subjectId));
        
        if (subjectAssignments.length > 0) {
          // CRITICAL: Use education level from assignment, NOT from editResult
          normalizedLevel = (subjectAssignments[0].education_level || '')
            .toString()
            .replace(/_/g, ' ')
            .toLowerCase()
            .trim();
          setSelectedEducationLevel(normalizedLevel);
          
          const upperLevel = (subjectAssignments[0].education_level || '')
            .toString()
            .replace(/\s+/g, '_')
            .toUpperCase();
          const configForLevel = scoringConfigs.find((c: any) => c.education_level === upperLevel && (c.is_default || c.is_active));
          setActiveScoringConfig(configForLevel || null);
          
          console.log('📝 Education level from assignment:', normalizedLevel);
          
          const classOptions = subjectAssignments.map(assignment => ({
            id: assignment.section_id,
            name: assignment.classroom_name,
            section_name: assignment.section_name,
            grade_level_name: assignment.grade_level_name,
            education_level: normalizedLevel,
            student_count: assignment.student_count
          }));
          
          setAvailableClasses(classOptions);
          
          if (studentId) {
            try {
              const studentClassPromises = classOptions.map(async (classOption) => {
                try {
                  const classStudents = await TeacherDashboardService.getStudentsForClass(classOption.id);
                  const studentExists = classStudents.find((s: Student) => s.id.toString() === studentId);
                  return studentExists ? classOption : null;
                } catch {
                  return null;
                }
              });
              
              const results = await Promise.all(studentClassPromises);
              const studentClass = results.find(result => result !== null);
              
              if (studentClass) {
                const classId = studentClass.id.toString();
                setSelectedClass(classId);
                
                const studentsData = await TeacherDashboardService.getStudentsForClass(studentClass.id);
                setFilteredStudents(studentsData);
              }
            } catch (error) {
              console.error('Error finding student class:', error);
            }
          }
        }
      }
      
      // Use the education level from assignment (normalizedLevel), NOT from editResult
      const educationLevel = String(normalizedLevel || '').toUpperCase();
      
      // Extract remarks from all possible fields
      const extractedRemarks = 
        editResult.teacher_remark || 
        editResult.remarks || 
        editResult.comment || 
        editResult.teacher_comment || 
        editResult.remark ||
        '';
      
      console.log('📝 Using education level for field structure:', educationLevel);
      console.log('📝 Extracted remarks:', extractedRemarks);
      
      if (educationLevel.includes('SENIOR')) {
        console.log('📝 Loading SENIOR SECONDARY fields');
        setAssessmentScores({
          test1: (editResult.first_test_score ?? editResult.test1 ?? 0).toString(),
          test2: (editResult.second_test_score ?? editResult.test2 ?? 0).toString(), 
          test3: (editResult.third_test_score ?? editResult.test3 ?? 0).toString(),
          exam: (editResult.exam_score ?? editResult.exam ?? 0).toString(),
          remarks: extractedRemarks
        });
      } else if (educationLevel.includes('NURSERY')) {
        console.log('📝 Loading NURSERY fields');
        setAssessmentScores({
          max_marks: (editResult.max_marks ?? 100).toString(),
          mark_obtained: (editResult.mark_obtained ?? editResult.total_score ?? editResult.ca_score ?? 0).toString(),
          remarks: extractedRemarks
        });
      } else if (educationLevel.includes('PRIMARY') || educationLevel.includes('JUNIOR')) {
        console.log('📝 Loading PRIMARY/JUNIOR fields');
        setAssessmentScores({
          ca_score: (editResult.ca_score ?? editResult.continuous_assessment_score ?? 0).toString(),
          take_home_marks: (editResult.take_home_marks ?? editResult.take_home_score ?? 0).toString(),
          take_home_test: (editResult.take_home_test ?? editResult.take_home_test_score ?? 0).toString(),
          appearance_marks: (editResult.appearance_marks ?? editResult.appearance_score ?? 0).toString(),
          practical_marks: (editResult.practical_marks ?? editResult.practical_score ?? 0).toString(),
          project_marks: (editResult.project_marks ?? editResult.project_score ?? 0).toString(),
          note_copying_marks: (editResult.note_copying_marks ?? editResult.note_copying_score ?? 0).toString(),
          ca_total: (editResult.ca_total ?? editResult.total_ca_score ?? 0).toString(),
          exam_score: (editResult.exam_score ?? editResult.exam ?? 0).toString(),
          remarks: extractedRemarks
        });
        
        if (editResult.physical_development || editResult.height_beginning) {
          setPhysicalDevelopment({
            height_beginning: editResult.physical_development?.height_beginning ?? editResult.height_beginning ?? 0,
            height_end: editResult.physical_development?.height_end ?? editResult.height_end ?? 0,
            weight_beginning: editResult.physical_development?.weight_beginning ?? editResult.weight_beginning ?? 0,
            weight_end: editResult.physical_development?.weight_end ?? editResult.weight_end ?? 0,
            nurse_comment: editResult.physical_development?.nurse_comment ?? editResult.nurse_comment ?? ''
          });
        }
      } else {
        console.log('📝 Loading DEFAULT fields');
        setAssessmentScores({
          ca_score: (editResult.ca_score ?? editResult.continuous_assessment_score ?? 0).toString(),
          exam_score: (editResult.exam_score ?? editResult.exam ?? 0).toString(),
          remarks: extractedRemarks
        });
      }
      
      if (editResult.class_statistics || editResult.class_average) {
        setClassStatistics({
          class_average: editResult.class_statistics?.class_average ?? editResult.class_average ?? 0,
          highest_in_class: editResult.class_statistics?.highest_in_class ?? editResult.highest_in_class ?? 0,
          lowest_in_class: editResult.class_statistics?.lowest_in_class ?? editResult.lowest_in_class ?? 0,
          class_position: editResult.class_statistics?.class_position ?? editResult.class_position ?? editResult.position ?? 0,
          total_students: editResult.class_statistics?.total_students ?? editResult.total_students ?? 0
        });
      }
    } catch (error) {
      console.error('Error setting up edit result:', error);
      toast.error('Failed to load edit data');
    }
  };

  useEffect(() => {
    if (formData.subject && availableClasses.length === 1 && !selectedClass && !editResult) {
      const onlyClass = availableClasses[0];
      setSelectedClass(String(onlyClass.id));
      setTimeout(() => handleClassChange(String(onlyClass.id)), 0);
    }
  }, [availableClasses, formData.subject, selectedClass, editResult]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      
      const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
      if (!teacherId) {
        throw new Error('Teacher ID not found');
      }
      setCurrentTeacherId(teacherId);

      const subjects = await TeacherDashboardService.getTeacherSubjects(teacherId);
      
      const assignments: any[] = [];
      const uniqueSubjects: Subject[] = [];
      
      subjects.forEach(subject => {
        const existingSubject = uniqueSubjects.find(s => s.id === subject.id);
        if (!existingSubject) {
          uniqueSubjects.push({
            id: subject.id,
            name: subject.name,
            code: subject.code
          });
        }
        
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
              section_id: assignment.classroom_id,
              student_count: assignment.student_count || 0,
              periods_per_week: assignment.periods_per_week || 0
            });
          });
        }
      });
      
      setTeacherAssignments(assignments);
      setSubjects(uniqueSubjects);

      const sessionsResponse = await ResultService.getExamSessions();
      const sessions = Array.isArray(sessionsResponse) ? sessionsResponse : [];
      setExamSessions(sessions);
      
      try {
        const configsResponse = await ResultSettingsService.getScoringConfigurations();
        const configsArray = Array.isArray(configsResponse)
          ? configsResponse
          : ((configsResponse as any)?.results || (configsResponse as any)?.data || []);
        setScoringConfigs(configsArray || []);
      } catch (e) {
        console.warn('Could not load scoring configurations.', e);
        setScoringConfigs([]);
      }
      
      try {
        const gsResp = await ResultService.getGradingSystems();
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

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSingleForm()) return;

    try {
      setSaving(true);
      
      let gsId = gradingSystemId;
      if (gsId == null) {
        try {
          const gsResp = await ResultService.getGradingSystems();
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
      
      const totalScore = calculateTotalScore(assessmentScores, selectedEducationLevel);
      const structure = getAssessmentStructure(selectedEducationLevel);
      let ca_score = 0;
      let exam_score = 0;
      let education_level = normalizeEducationLevelForApi(selectedEducationLevel);

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
          first_test_score: parseFloat(assessmentScores.test1?.toString() || '0'),
          second_test_score: parseFloat(assessmentScores.test2?.toString() || '0'),
          third_test_score: parseFloat(assessmentScores.test3?.toString() || '0'),
          exam_score: parseFloat(assessmentScores.exam?.toString() || '0'),
          teacher_remark: assessmentScores.remarks || '',
          status: formData.status,
          education_level,
        };
        
        if (!editResult) {
          resultData.student = formData.student;
          resultData.subject = formData.subject;
          resultData.exam_session = formData.exam_session;
          resultData.grading_system = gsId ?? undefined;
        } else {
          if (gsId) resultData.grading_system = gsId;
        }
      } else {
        resultData = {
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
        
        if (!editResult) {
          resultData.student = formData.student;
          resultData.subject = formData.subject;
          resultData.exam_session = formData.exam_session;
          resultData.grading_system = gsId ?? undefined;
        } else {
          if (gsId) resultData.grading_system = gsId;
        }
      }

      if (editResult) {
        const candidates = [
          editResult?.id,
          editResult?.pk,
          editResult?.result_id,
          editResult?.student_result_id,
          editResult?.studentResultId,
          editResult?.result?.id
        ];
        
        const numeric = candidates
          .map((v) => (v !== null && v !== undefined ? Number(v) : NaN))
          .find((n) => Number.isFinite(n) && n > 0);
        const safeId = numeric ? String(numeric) : '';
        
        let finalId = safeId;
        if (!finalId) {
          try {
            const resolvedId = await ResultService.findResultIdByComposite({
              student: formData.student,
              subject: formData.subject,
              exam_session: formData.exam_session,
              education_level: education_level,
            });
            if (resolvedId) {
              finalId = resolvedId;
            }
          } catch (e) {
            console.warn('Composite id lookup failed', e);
          }
        }
        if (!finalId) {
          toast.error('Cannot update: missing result ID. Please refresh and try again.');
          throw new Error('Invalid result id for update');
        }
        await ResultService.updateStudentResult(finalId, resultData, education_level);
        toast.success('Result updated successfully!');
      } else {
        try {
          await ResultService.createStudentResult(resultData, education_level);
          toast.success('Result recorded successfully!');
        } catch (error: any) {
          console.error('Error creating result:', error);
          
          if (error.response?.status === 400 && error.response?.data?.non_field_errors) {
            const errorMessage = error.response.data.non_field_errors[0];
            if (errorMessage.includes('unique')) {
              toast.error('A result already exists for this student, subject, and exam session. Please edit the existing result instead.');
              return;
            }
          }
          
          const errorMessage = error.response?.data?.message || error.message || 'Failed to create result';
          toast.error(errorMessage);
          throw error;
        }
      }

      onResultCreated();
      onClose();
    } catch (error) {
      console.error('Error saving result:', error);
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

      let gsId = gradingSystemId;
      if (gsId == null) {
        try {
          const gsResp = await ResultService.getGradingSystems();
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
        
        const structure = getAssessmentStructure(selectedEducationLevel);
        let ca_score = 0;
        let exam_score = 0;
        let education_level = normalizeEducationLevelForApi(selectedEducationLevel);

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
            class_statistics: result.class_statistics || {},
            physical_development: result.physical_development || {}
          };
        }

        await ResultService.createStudentResult(resultData, education_level);
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
    setTimeout(recomputeClassStats, 0);
  };

  const updateAssessmentScore = (field: keyof AssessmentScores, value: string) => {
    setAssessmentScores(prev => ({ ...prev, [field]: value }));
    setTimeout(recomputeClassStats, 0);
  };

  const updatePhysicalDevelopment = (field: keyof PhysicalDevelopment, value: string | number) => {
    setPhysicalDevelopment(prev => ({ ...prev, [field]: value }));
  };

  const getGrade = (total: number) => {
    if (total >= 70) return 'A';
    if (total >= 60) return 'B';
    if (total >= 50) return 'C';
    if (total >= 45) return 'D';
    if (total >= 39) return 'E';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    const gradeConfig = {
      'A': 'text-green-600 bg-green-100',
      'B': 'text-blue-600 bg-blue-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'E': 'text-purple-600 bg-purple-100',
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
    setFilteredStudents([]);
    setSelectedEducationLevel('');
    setAvailableClasses([]);
    setSelectedClass('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderAssessmentFields = (scores: AssessmentScores, onUpdate: (field: keyof AssessmentScores, value: string) => void) => {
    const structure = getAssessmentStructure(selectedEducationLevel, activeScoringConfig);
    
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
              value={stats.lowest_in_class || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Class Position (auto)
            </label>
            <input
              type="number"
              value={stats.class_position || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>
      </div>
    );
  };

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
              Height (Beginning) - cm
            </label>
            <input
              type="number"
              min="0"
              value={physical.height_beginning || ''}
              onChange={(e) => onUpdate('height_beginning', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Height (End) - cm
            </label>
            <input
              type="number"
              min="0"
              value={physical.height_end || ''}
              onChange={(e) => onUpdate('height_end', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weight (Beginning) - kg
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={physical.weight_beginning || ''}
              onChange={(e) => onUpdate('weight_beginning', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weight (End) - kg
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={physical.weight_end || ''}
              onChange={(e) => onUpdate('weight_end', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editResult ? 'Edit Result' : 'Record Student Result'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('single')}
                disabled={!!editResult}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'single'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                } ${editResult ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Single Result
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                disabled={!!editResult}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bulk'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                } ${editResult ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              {activeTab === 'single' && (
                <form onSubmit={handleSingleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject *
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, subject: e.target.value, student: '' }));
                          handleSubjectChange(e.target.value, !!editResult);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                        disabled={!!editResult}
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </option>
                        ))}
                      </select>
                      {editResult && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Cannot change subject for existing result
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Class *
                      </label>
                      <select
                        value={selectedClass}
                        onChange={(e) => {
                          setSelectedClass(e.target.value);
                          setFormData(prev => ({ ...prev, student: '' }));
                          handleClassChange(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                        disabled={!!editResult || !formData.subject || availableClasses.length === 0}
                      >
                        <option value="">Select Class</option>
                        {availableClasses.map(classOption => (
                          <option key={classOption.id} value={classOption.id}>
                            {classOption.grade_level_name} {classOption.section_name} ({classOption.student_count} students)
                          </option>
                        ))}
                      </select>
                      {editResult && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Cannot change class for existing result
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Exam Session *
                      </label>
                      <select
                        value={formData.exam_session}
                        onChange={(e) => setFormData(prev => ({ ...prev, exam_session: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                        disabled={!!editResult}
                      >
                        <option value="">Select Exam Session</option>
                        {examSessions.map(session => (
                          <option key={session.id} value={session.id}>
                            {session.academic_session?.name} - {session.term}
                          </option>
                        ))}
                      </select>
                      {editResult && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Cannot change exam session for existing result
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Student *
                      </label>
                      <select
                        value={formData.student}
                        onChange={(e) => setFormData(prev => ({ ...prev, student: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                        disabled={!!editResult || !selectedClass || filteredStudents.length === 0}
                      >
                        <option value="">Select Student</option>
                        {filteredStudents.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.full_name}
                          </option>
                        ))}
                      </select>
                      {editResult && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Cannot change student for existing result
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="APPROVED">Approved</option>
                      </select>
                    </div>
                  </div>

                  {selectedEducationLevel && (
                    <>
                      {renderAssessmentFields(assessmentScores, updateAssessmentScore)}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Teacher's Remarks
                        </label>
                        <textarea
                          value={assessmentScores.remarks || ''}
                          onChange={(e) => updateAssessmentScore('remarks', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter remarks..."
                        />
                      </div>

                      {renderClassStatistics(classStatistics)}
                      {renderPhysicalDevelopment(physicalDevelopment, updatePhysicalDevelopment)}
                    </>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900"
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
                      {editResult ? 'Update Result' : 'Record Result'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'bulk' && (
                <form onSubmit={handleBulkSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Exam Session *
                      </label>
                      <select
                        value={formData.exam_session}
                        onChange={(e) => setFormData(prev => ({ ...prev, exam_session: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select Exam Session</option>
                        {examSessions.map(session => (
                          <option key={session.id} value={session.id}>
                            {session.academic_session?.name} - {session.term}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {bulkResults.length > 0 && selectedEducationLevel && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Enter Scores for Students ({getAssessmentStructure(selectedEducationLevel, activeScoringConfig).type.toUpperCase()})
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-600">
                              <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Student
                              </th>
                              {getAssessmentStructure(selectedEducationLevel, activeScoringConfig).fields.map((field, index) => (
                                <th key={field} className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {getAssessmentStructure(selectedEducationLevel, activeScoringConfig).labels[index]}
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
                                  {getAssessmentStructure(selectedEducationLevel, activeScoringConfig).fields.map((field, fieldIndex) => (
                                    <td key={field} className="py-2 px-3">
                                      <input
                                        type="number"
                                        min="0"
                                        max={getAssessmentStructure(selectedEducationLevel, activeScoringConfig).maxValues[fieldIndex]}
                                        step="0.1"
                                        value={result.assessment_scores[field as keyof AssessmentScores] || ''}
                                        onChange={(e) => updateBulkResult(index, field, e.target.value)}
                                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                                      className="w-32 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900"
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