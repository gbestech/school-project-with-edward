// import React, { useState, useEffect } from 'react';
// import { X, Save, AlertCircle, BookOpen, Calculator } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
// import api from '../../../services/api';

import { Edit } from "lucide-react";

// // Interface matching the StudentResult from EnhancedResultsManagement
// interface StudentResult {
//   id: string;
//   student: {
//     id: string;
//     full_name: string;
//     username: string;
//     student_class: string;
//     education_level: string;
//     profile_picture?: string;
//   };
//   academic_session: {
//     id: string;
//     name: string;
//     start_date: string;
//     end_date: string;
//   };
//   term: string;
//   total_subjects: number;
//   subjects_passed: number;
//   subjects_failed: number;
//   total_score: number;
//   average_score: number;
//   gpa: number;
//   class_position: number | null;
//   total_students: number;
//   status: 'DRAFT' | 'APPROVED' | 'PUBLISHED';
//   remarks: string;
//   next_term_begins?: string;
//   subject_results: SubjectResult[];
//   created_at: string;
//   updated_at: string;
// }

// interface SubjectResult {
//   id: string;
//   subject: {
//     name: string;
//     code: string;
//   };
//   total_ca_score: number;
//   exam_score: number;
//   total_score: number;
//   percentage: number;
//   grade: string;
//   grade_point: number;
//   is_passed: boolean;
//   status: string;
//   // Nursery-specific fields
//   max_marks_obtainable?: number;
//   mark_obtained?: number;
//   academic_comment?: string;
//   // Breakdown object for nursery results
//   breakdown?: {
//     max_marks_obtainable?: number;
//     mark_obtained?: number;
//     physical_development?: string;
//     health?: string;
//     cleanliness?: string;
//     general_conduct?: string;
//   };
// }

// interface EditSubjectResultFormProps {
//   result: StudentResult;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// interface SubjectFormData {
//   // Senior Secondary specific fields
//   first_test_score: number;
//   second_test_score: number;
//   third_test_score: number;
  
//   // Primary/Junior Secondary specific fields
//   continuous_assessment_score: number;
//   take_home_test_score: number;
//   practical_score: number;
//   appearance_score: number;
//   project_score: number;
//   note_copying_score: number;
  
//   // Common fields
//   exam_score: number;
//   grade: string;
//   status: string;
//   teacher_remark: string;
  
//   // Nursery specific fields
//   max_marks_obtainable: number;
// }

// const EditSubjectResultForm: React.FC<EditSubjectResultFormProps> = ({
//   result,
//   onClose,
//   onSuccess,
// }) => {
//   const { isDarkMode } = useGlobalTheme();
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});
//   const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
//   const [selectedSubject, setSelectedSubject] = useState<SubjectResult | null>(null);

//   const [formData, setFormData] = useState<SubjectFormData>({
//     // Senior Secondary fields
//     first_test_score: 0,
//     second_test_score: 0,
//     third_test_score: 0,
    
//     // Primary/Junior Secondary fields
//     continuous_assessment_score: 0,
//     take_home_test_score: 0,
//     practical_score: 0,
//     appearance_score: 0,
//     project_score: 0,
//     note_copying_score: 0,
    
//     // Common fields
//     exam_score: 0,
//     grade: '',
//     status: 'DRAFT',
//     teacher_remark: '',
    
//     // Nursery specific fields
//     max_marks_obtainable: 100,
//   });

//   const themeClasses = {
//     bgCard: isDarkMode ? 'bg-gray-800' : 'bg-white',
//     textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
//     textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
//     border: isDarkMode ? 'border-gray-700' : 'border-gray-300',
//     inputBg: isDarkMode ? 'bg-gray-700' : 'bg-white',
//     inputText: isDarkMode ? 'text-white' : 'text-gray-900',
//     buttonPrimary: isDarkMode 
//       ? 'bg-blue-600 hover:bg-blue-700 text-white' 
//       : 'bg-blue-600 hover:bg-blue-700 text-white',
//     buttonSecondary: isDarkMode 
//       ? 'bg-gray-600 hover:bg-gray-700 text-white' 
//       : 'bg-gray-500 hover:bg-gray-600 text-white',
//   };


//   // Safe score formatting function
//   const formatScore = (score: any): string => {
//     if (score === null || score === undefined) return 'N/A';
//     const numScore = typeof score === 'string' ? parseFloat(score) : score;
//     if (typeof numScore !== 'number' || isNaN(numScore)) return 'N/A';
//     return `${numScore.toFixed(1)}%`;
//   };

//   // Calculate total score and percentage based on education level
//   const calculateTotalScore = (): number => {
//     const examScore = formData.exam_score || 0;
    
//     if (result.student.education_level === 'SENIOR_SECONDARY') {
//       // Senior Secondary: Test 1 + Test 2 + Test 3 (30 marks) + Exam (70 marks)
//       const testTotal = (formData.first_test_score || 0) + (formData.second_test_score || 0) + (formData.third_test_score || 0);
//       return testTotal + examScore;
//     } else if (result.student.education_level === 'PRIMARY' || result.student.education_level === 'JUNIOR_SECONDARY') {
//       // Primary/Junior Secondary: CA breakdown (40 marks) + Exam (60 marks)
//       const caTotal = (formData.continuous_assessment_score || 0) + 
//                      (formData.take_home_test_score || 0) + 
//                      (formData.practical_score || 0) + 
//                      (formData.appearance_score || 0) + 
//                      (formData.project_score || 0) + 
//                      (formData.note_copying_score || 0);
//       return caTotal + examScore;
//     } else {
//       // Nursery or other levels
//       return examScore;
//     }
//   };

//   const calculatePercentage = (): number => {
//     const total = calculateTotalScore();
//     if (result.student.education_level === 'NURSERY') {
//       // Nursery uses max_marks_obtainable as the denominator
//       return total > 0 ? (total / formData.max_marks_obtainable) * 100 : 0;
//     } else {
//       // All other levels use 100 as max score
//       return total > 0 ? (total / 100) * 100 : 0;
//     }
//   };

//   // Calculate CA total for display
//   const calculateCATotal = (): number => {
//     if (result.student.education_level === 'SENIOR_SECONDARY') {
//       return (formData.first_test_score || 0) + (formData.second_test_score || 0) + (formData.third_test_score || 0);
//     } else if (result.student.education_level === 'PRIMARY' || result.student.education_level === 'JUNIOR_SECONDARY') {
//       return (formData.continuous_assessment_score || 0) + 
//              (formData.take_home_test_score || 0) + 
//              (formData.practical_score || 0) + 
//              (formData.appearance_score || 0) + 
//              (formData.project_score || 0) + 
//              (formData.note_copying_score || 0);
//     }
//     return 0;
//   };

//   // Determine grade based on percentage
//   const determineGrade = (percentage: number): string => {
//     if (percentage >= 70) return 'A';
//     if (percentage >= 60) return 'B';
//     if (percentage >= 50) return 'C';
//     if (percentage >= 45) return 'D';
//     if (percentage >= 39) return 'E';
//     return 'F';
//   };
//   // Generate automatic teacher remark based on score and grade
//   const generateTeacherRemark = (totalScore: number, grade: string): string => {
//     const score = Number(totalScore) || 0;
    
//     // Define remark templates based on grade ranges
//     const remarkTemplates = {
//       'A': [
//         'Excellent performance! Outstanding work and dedication.',
//         'Exceptional achievement. Keep up the excellent work!',
//         'Outstanding performance. You are a model student.',
//         'Brilliant work! Your dedication is commendable.'
//       ],
//       'B': [
//         'Very good performance. Well done!',
//         'Excellent work. Keep maintaining this standard.',
//         'Great achievement. Continue to excel.',
//         'Very good performance. You should be proud.'
//       ],
//       'C': [
//         'Good performance. Keep up the good work.',
//         'Well done! Continue to improve.',
//         'Good effort. You are making progress.',
//         'Satisfactory performance. Keep working hard.'
//       ],
//       'D': [
//         'Fair performance. Room for improvement.',
//         'Average work. Try to do better next time.',
//         'Satisfactory performance. Keep working hard.',
//         'Fair effort. Focus on areas that need improvement.'
//       ],
//       'E': [
//         'Below average performance. More effort needed.',
//         'Needs improvement. Focus on your studies.',
//         'Below expectations. Work harder next time.',
//         'Room for improvement. Keep working hard.'
//       ],
//       'F': [
//         'Failed. Immediate remedial action required.',
//         'Complete failure. Urgent academic intervention needed.',
//         'Failed grade. Parent consultation and support required.',
//         'Critical failure. Seek immediate academic help.'
//       ]
//     };

//     // Get appropriate remarks based on grade
//     let gradeRemarks = remarkTemplates[grade as keyof typeof remarkTemplates] || remarkTemplates['F'];
    
//     // If no grade provided, determine based on score
//     if (!grade && score > 0) {
//       if (score >= 70) gradeRemarks = remarkTemplates['A'];
//       else if (score >= 60) gradeRemarks = remarkTemplates['B'];
//       else if (score >= 50) gradeRemarks = remarkTemplates['C'];
//       else if (score >= 45) gradeRemarks = remarkTemplates['D'];
//       else if (score >= 39) gradeRemarks = remarkTemplates['E'];
//       else gradeRemarks = remarkTemplates['F'];
//     }

//     // Return a random remark from the appropriate category
//     return gradeRemarks[Math.floor(Math.random() * gradeRemarks.length)];
//   };

//   const validateForm = (): boolean => {

//   // Handle subject selection
//   // const handleSubjectSelect = (subjectId: string) => {
//   //   setSelectedSubjectId(subjectId);
//   //   const subject = result.subject_results.find(s => s.id === subjectId);
//   //   if (subject) {
//   //     setSelectedSubject(subject);
      
//   //     // Populate form data based on education level
//   //     const baseFormData = {
//   //       exam_score: subject.exam_score || 0,
//   //       grade: subject.grade || '',
//   //       status: subject.status || 'DRAFT',
//   //     };

//   //     if (result.student.education_level === 'SENIOR_SECONDARY') {
//   //       // Senior Secondary: Use test scores
//   //       setFormData({
//   //         ...baseFormData,
//   //         first_test_score: (subject as any).first_test_score || 0,
//   //         second_test_score: (subject as any).second_test_score || 0,
//   //         third_test_score: (subject as any).third_test_score || 0,
//   //         // Set other fields to 0
//   //         continuous_assessment_score: 0,
//   //         take_home_test_score: 0,
//   //         practical_score: 0,
//   //         appearance_score: 0,
//   //         project_score: 0,
//   //         note_copying_score: 0,
//   //         // Preserve/assign max marks for compatibility with SubjectFormData
//   //         max_marks_obtainable: (subject as any)?.breakdown?.max_marks_obtainable ?? formData.max_marks_obtainable ?? 100,
//   //       });
//   //       setFormData({
//   //         ...baseFormData,
//   //         continuous_assessment_score: (subject as any).continuous_assessment_score || 0,
//   //         take_home_test_score: (subject as any).take_home_test_score || 0,
//   //         practical_score: (subject as any).practical_score || 0,
//   //         appearance_score: (subject as any).appearance_score || 0,
//   //         project_score: (subject as any).project_score || 0,
//   //         note_copying_score: (subject as any).note_copying_score || 0,
//   //         // Set test scores to 0
//   //         first_test_score: 0,
//   //         second_test_score: 0,
//   //         third_test_score: 0,
//   //         // Preserve/assign max marks for compatibility with SubjectFormData
//   //         max_marks_obtainable: (subject as any)?.breakdown?.max_marks_obtainable ?? formData.max_marks_obtainable ?? 100,
//   //       });
       
//   //     } else {
//   //       // Nursery or other levels: Use basic structure
//   //       setFormData({
//   //         ...baseFormData,
//   //         // For nursery, use mark_obtained from breakdown if available, otherwise exam_score
//   //         exam_score: (subject as any).breakdown?.mark_obtained || subject.exam_score || 0,
//   //         // Set max_marks_obtainable from the breakdown data
//   //         max_marks_obtainable: (subject as any).breakdown?.max_marks_obtainable || 100,
//   //         // Set all other fields to 0
//   //         first_test_score: 0,
//   //         second_test_score: 0,
//   //         third_test_score: 0,
//   //         continuous_assessment_score: 0,
//   //         take_home_test_score: 0,
//   //         practical_score: 0,
//   //         appearance_score: 0,
//   //         project_score: 0,
//   //         note_copying_score: 0,
//   //       });
//   //     }
//   //   }
//   // };

//   // Handle subject selection - FIXED to properly extract and populate all fields
//   const handleSubjectSelect = async (subjectId: string) => {
//     setSelectedSubjectId(subjectId);
//     const subject = result.subject_results.find(s => s.id === subjectId);
//     if (!subject) return;
    
//     setSelectedSubject(subject);
    
//     try {
//       // Fetch the full result data from the API to get all fields
//       let endpoint = '';
//       const educationLevel = result.student.education_level;
      
//       if (educationLevel === 'SENIOR_SECONDARY') {
//         endpoint = `/api/results/senior-secondary/results/${subjectId}/`;
//       } else if (educationLevel === 'JUNIOR_SECONDARY') {
//         endpoint = `/api/results/junior-secondary/results/${subjectId}/`;
//       } else if (educationLevel === 'PRIMARY') {
//         endpoint = `/api/results/primary/results/${subjectId}/`;
//       } else if (educationLevel === 'NURSERY') {
//         endpoint = `/api/results/nursery/results/${subjectId}/`;
//       }
      
//       if (endpoint) {
//         const fullResultData = await api.get(endpoint);
//         console.log('Full result data from API:', fullResultData);
        
//         // Populate form data based on education level with API data
//         const baseFormData = {
//           exam_score: fullResultData.exam_score || 0,
//           grade: fullResultData.grade || '',
//           status: fullResultData.status || 'DRAFT',
//         };

//         if (educationLevel === 'SENIOR_SECONDARY') {
//           // Senior Secondary: Use test scores
//           setFormData({
//             ...baseFormData,
//             first_test_score: fullResultData.first_test_score || 0,
//             second_test_score: fullResultData.second_test_score || 0,
//             third_test_score: fullResultData.third_test_score || 0,
//             // Set other fields to 0
//             continuous_assessment_score: 0,
//             take_home_test_score: 0,
//             practical_score: 0,
//             appearance_score: 0,
//             project_score: 0,
//             note_copying_score: 0,
//             max_marks_obtainable: 100,
//             teacher_remark: fullResultData.teacher_remark || '',
//           });
//         } else if (educationLevel === 'PRIMARY' || educationLevel === 'JUNIOR_SECONDARY') {
//           // Primary/Junior Secondary: Use CA breakdown
//           setFormData({
//             ...baseFormData,
//             continuous_assessment_score: fullResultData.continuous_assessment_score || 0,
//             take_home_test_score: fullResultData.take_home_test_score || 0,
//             practical_score: fullResultData.practical_score || 0,
//             appearance_score: fullResultData.appearance_score || 0,
//             project_score: fullResultData.project_score || 0,
//             note_copying_score: fullResultData.note_copying_score || 0,
//             // Set test scores to 0
//             first_test_score: 0,
//             second_test_score: 0,
//             third_test_score: 0,
//             max_marks_obtainable: 100,
//             teacher_remark: fullResultData.teacher_remark || '',
//           });
//         } else {
//           // Nursery: Use basic structure
//           setFormData({
//             ...baseFormData,
//             // For nursery, use mark_obtained
//             exam_score: fullResultData.mark_obtained || 0,
//             max_marks_obtainable: fullResultData.max_marks_obtainable || 100,
//             // Set all other fields to 0
//             first_test_score: 0,
//             second_test_score: 0,
//             third_test_score: 0,
//             continuous_assessment_score: 0,
//             take_home_test_score: 0,
//             practical_score: 0,
//             appearance_score: 0,
//             project_score: 0,
//             note_copying_score: 0,
//             teacher_remark: fullResultData.academic_comment || '',
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching full result data:', error);
//       toast.error('Failed to load complete result data');
      
//       // Fallback to using the subject data we have
//       const baseFormData = {
//         exam_score: subject.exam_score || 0,
//         grade: subject.grade || '',
//         status: subject.status || 'DRAFT',
//         teacher_remark: fullResultData.teacher_remark || fullResultData.academic_comment || '',
//       };

//       setFormData({
//         ...baseFormData,
//         first_test_score: 0,
//         second_test_score: 0,
//         third_test_score: 0,
//         continuous_assessment_score: 0,
//         take_home_test_score: 0,
//         practical_score: 0,
//         appearance_score: 0,
//         project_score: 0,
//         note_copying_score: 0,
//         max_marks_obtainable: 100,
//       });
//     }
//   };

  

//   const validateForm = (): boolean => {
//     const newErrors: { [key: string]: string } = {};

//     if (!selectedSubject) {
//       newErrors.subject = 'Please select a subject to edit';
//     }

//     // Validate based on education level
//     if (result.student.education_level === 'SENIOR_SECONDARY') {
//       // Senior Secondary: Test scores (10 marks each) + Exam (70 marks)
//       if (formData.first_test_score < 0 || formData.first_test_score > 10) {
//         newErrors.first_test_score = 'Test 1 score must be between 0 and 10';
//       }
//       if (formData.second_test_score < 0 || formData.second_test_score > 10) {
//         newErrors.second_test_score = 'Test 2 score must be between 0 and 10';
//       }
//       if (formData.third_test_score < 0 || formData.third_test_score > 10) {
//         newErrors.third_test_score = 'Test 3 score must be between 0 and 10';
//       }
//       if (formData.exam_score < 0 || formData.exam_score > 70) {
//         newErrors.exam_score = 'Exam score must be between 0 and 70';
//       }
//     } else if (result.student.education_level === 'PRIMARY' || result.student.education_level === 'JUNIOR_SECONDARY') {
//       // Primary/Junior Secondary: CA breakdown (40 marks total) + Exam (60 marks)
//       if (formData.continuous_assessment_score < 0 || formData.continuous_assessment_score > 15) {
//         newErrors.continuous_assessment_score = 'Continuous Assessment must be between 0 and 15';
//       }
//       if (formData.take_home_test_score < 0 || formData.take_home_test_score > 5) {
//         newErrors.take_home_test_score = 'Take Home Test must be between 0 and 5';
//       }
//       if (formData.practical_score < 0 || formData.practical_score > 5) {
//         newErrors.practical_score = 'Practical must be between 0 and 5';
//       }
//       if (formData.appearance_score < 0 || formData.appearance_score > 5) {
//         newErrors.appearance_score = 'Appearance must be between 0 and 5';
//       }
//       if (formData.project_score < 0 || formData.project_score > 5) {
//         newErrors.project_score = 'Project must be between 0 and 5';
//       }
//       if (formData.note_copying_score < 0 || formData.note_copying_score > 5) {
//         newErrors.note_copying_score = 'Note Copying must be between 0 and 5';
//       }
//       if (formData.exam_score < 0 || formData.exam_score > 60) {
//         newErrors.exam_score = 'Exam score must be between 0 and 60';
//       }
//     } else {
//       // Nursery or other levels: Basic validation
//       if (formData.exam_score < 0 || formData.exam_score > formData.max_marks_obtainable) {
//         newErrors.exam_score = `Score must be between 0 and ${formData.max_marks_obtainable}`;
//       }
//       if (formData.max_marks_obtainable <= 0) {
//         newErrors.max_marks_obtainable = 'Max marks obtainable must be greater than 0';
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleInputChange = (field: keyof SubjectFormData, value: any) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value,
//     }));
    
//     // Auto-calculate grade when any score changes
//     const scoreFields = ['first_test_score', 'second_test_score', 'third_test_score', 
//                         'continuous_assessment_score', 'take_home_test_score', 'practical_score',
//                         'appearance_score', 'project_score', 'note_copying_score', 'exam_score'];
    
//     if (scoreFields.includes(field)) {
//       // Recalculate grade after a short delay to ensure state is updated
//       setTimeout(() => {
//         const newPercentage = calculatePercentage();
//         const newGrade = determineGrade(newPercentage);
//         setFormData(prev => ({
//           ...prev,
//           grade: newGrade,
//         }));
//       }, 100);
//     }
    
//     // Clear error when user starts typing
//     if (errors[field]) {
//       setErrors(prev => ({
//         ...prev,
//         [field]: '',
//       }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm() || !selectedSubject) {
//       toast.error('Please fix the errors in the form');
//       return;
//     }

//     try {
//       setLoading(true);
      
//       // Update the individual subject result with correct field names based on education level
//       let updateData: any = {
//         status: formData.status,
//       };

//       // Set the correct field names based on education level
//       // Set the correct field names based on education level
//       if (result.student.education_level === 'SENIOR_SECONDARY') {
//         // Senior Secondary: Use test scores (30 marks CA + 70 marks Exam)
//         updateData.first_test_score = formData.first_test_score;
//         updateData.second_test_score = formData.second_test_score;
//         updateData.third_test_score = formData.third_test_score;
//         updateData.exam_score = formData.exam_score;
//         updateData.teacher_remark = formData.teacher_remark || '';
//         // Note: grade is calculated automatically by backend, don't send it
//       } else if (result.student.education_level === 'PRIMARY' || result.student.education_level === 'JUNIOR_SECONDARY') {
//         // Primary/Junior Secondary: Use CA breakdown (40 marks CA + 60 marks Exam)
//         updateData.continuous_assessment_score = formData.continuous_assessment_score;
//         updateData.take_home_test_score = formData.take_home_test_score;
//         updateData.practical_score = formData.practical_score;
//         updateData.appearance_score = formData.appearance_score;
//         updateData.project_score = formData.project_score;
//         updateData.note_copying_score = formData.note_copying_score;
//         updateData.exam_score = formData.exam_score;
//         updateData.teacher_remark = formData.teacher_remark || '';
//         // Note: grade is calculated automatically by backend, don't send it
//       } else {
//         // Nursery: Use mark_obtained instead of exam_score
//         updateData.mark_obtained = formData.exam_score;
//         // Include max_marks_obtainable from form data
//         updateData.max_marks_obtainable = formData.max_marks_obtainable;
//         updateData.academic_comment = formData.teacher_remark || '';
//         // Note: grade is calculated automatically by backend, don't send it
//       }

//       console.log('Updating subject result:', selectedSubject.id, updateData);

//       // Check if the individual result ID exists by trying to get it first
//       let endpoint = '';
//       if (result.student.education_level === 'SENIOR_SECONDARY') {
//         endpoint = `/api/results/senior-secondary/results/${selectedSubject.id}/`;
//       } else if (result.student.education_level === 'JUNIOR_SECONDARY') {
//         endpoint = `/api/results/junior-secondary/results/${selectedSubject.id}/`;
//       } else if (result.student.education_level === 'PRIMARY') {
//         endpoint = `/api/results/primary/results/${selectedSubject.id}/`;
//       } else if (result.student.education_level === 'NURSERY') {
//         endpoint = `/api/results/nursery/results/${selectedSubject.id}/`;
//       } else {
//         endpoint = `/api/results/student-results/${selectedSubject.id}/`;
//       }

//       // First, try to get the individual result to verify it exists
//       try {
//         await api.get(endpoint);
//       } catch (error: any) {
//         if (error.response?.status === 404) {
//           throw new Error(`Individual result with ID ${selectedSubject.id} not found. This might be a term report ID. Please refresh the page and try again.`);
//         }
//         throw error;
//       }

//       await api.put(endpoint, updateData);
      
//       toast.success('Subject result updated successfully!');
//       onSuccess();
//       onClose();
//     } catch (error: any) {
//       console.error('Error updating subject result:', error);
//       const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update subject result';
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between pb-4 border-b border-gray-200">
//         <h3 className="text-lg font-medium text-gray-900">
//           Edit Subject Results - {result.student?.full_name}
//         </h3>
//         <button
//           type="button"
//           onClick={onClose}
//           className="text-gray-400 hover:text-gray-600"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Term Information Display */}
//       <div className="bg-gray-50 p-4 rounded-lg">
//         <h4 className="font-medium text-gray-900 mb-2">Term Information</h4>
//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <div>
//             <span className="text-gray-600">Term:</span>
//             <span className="ml-2 font-medium">{result.term}</span>
//           </div>
//           <div>
//             <span className="text-gray-600">Session:</span>
//             <span className="ml-2 font-medium">{result.academic_session?.name}</span>
//           </div>
//           <div>
//             <span className="text-gray-600">Class:</span>
//             <span className="ml-2 font-medium">{result.student?.student_class}</span>
//           </div>
//           <div>
//             <span className="text-gray-600">Total Subjects:</span>
//             <span className="ml-2 font-medium">{result.subject_results?.length || 0}</span>
//           </div>
//         </div>
//       </div>

//       {/* Subject Selection */}
//       <div>
//         <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//           Select Subject to Edit *
//         </label>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//           {result.subject_results?.map((subject) => (
//             <button
//               key={subject.id}
//               type="button"
//               onClick={() => handleSubjectSelect(subject.id)}
//               className={`p-3 rounded-lg border-2 transition-all text-left ${
//                 selectedSubjectId === subject.id
//                   ? 'border-blue-500 bg-blue-50'
//                   : 'border-gray-200 hover:border-gray-300'
//               }`}
//             >
//               <div className="flex items-center space-x-3">
//                 <BookOpen className="w-5 h-5 text-blue-600" />
//                 <div>
//                   <div className="font-medium text-gray-900">{subject.subject.name}</div>
//                   <div className="text-sm text-gray-500">{subject.subject.code}</div>
//                   <div className="text-sm text-gray-600">
//                     Current: {formatScore(subject.percentage)} ({subject.grade})
//                   </div>
//                 </div>
//               </div>
//             </button>
//           ))}
//         </div>
//         {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
//       </div>

//       {/* Subject Edit Form */}
//       {selectedSubject && (
//         <div className="border border-gray-200 rounded-lg p-4">
//           <h4 className="font-medium text-gray-900 mb-4 flex items-center">
//             <Calculator className="w-5 h-5 mr-2" />
//             Edit {selectedSubject.subject.name} Scores
//           </h4>
          
//           <div className="space-y-6">
//             {/* Education Level Specific Fields */}
//             {result.student.education_level === 'SENIOR_SECONDARY' && (
//               <div className="space-y-4">
//                 <h5 className={`font-medium ${themeClasses.textPrimary}`}>Senior Secondary - CA Scores (30 marks total)</h5>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                       Test 1 (0-10) *
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="10"
//                       step="0.1"
//                       value={formData.first_test_score}
//                       onChange={(e) => handleInputChange('first_test_score', parseFloat(e.target.value) || 0)}
//                       className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.first_test_score ? 'border-red-500' : ''}`}
//                       placeholder="0-10"
//                     />
//                     {errors.first_test_score && <p className="text-red-500 text-xs mt-1">{errors.first_test_score}</p>}
//                   </div>
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                       Test 2 (0-10) *
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="10"
//                       step="0.1"
//                       value={formData.second_test_score}
//                       onChange={(e) => handleInputChange('second_test_score', parseFloat(e.target.value) || 0)}
//                       className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.second_test_score ? 'border-red-500' : ''}`}
//                       placeholder="0-10"
//                     />
//                     {errors.second_test_score && <p className="text-red-500 text-xs mt-1">{errors.second_test_score}</p>}
//                   </div>
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                       Test 3 (0-10) *
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="10"
//                       step="0.1"
//                       value={formData.third_test_score}
//                       onChange={(e) => handleInputChange('third_test_score', parseFloat(e.target.value) || 0)}
//                       className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.third_test_score ? 'border-red-500' : ''}`}
//                       placeholder="0-10"
//                     />
//                     {errors.third_test_score && <p className="text-red-500 text-xs mt-1">{errors.third_test_score}</p>}
//                   </div>
//                 </div>
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                     Exam Score (0-70) *
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     max="70"
//                     step="0.1"
//                     value={formData.exam_score}
//                     onChange={(e) => handleInputChange('exam_score', parseFloat(e.target.value) || 0)}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.exam_score ? 'border-red-500' : ''}`}
//                     placeholder="0-70"
//                   />
//                   {errors.exam_score && <p className="text-red-500 text-xs mt-1">{errors.exam_score}</p>}
//                 </div>
//               </div>
//             )}

//             {(result.student.education_level === 'PRIMARY' || result.student.education_level === 'JUNIOR_SECONDARY') && (
//               <div className="space-y-4">
//                 <h5 className={`font-medium ${themeClasses.textPrimary}`}>Primary/Junior Secondary - CA Scores (40 marks total)</h5>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                       Continuous Assessment (0-15) *
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="15"
//                       step="0.1"
//                       value={formData.continuous_assessment_score}
//                       onChange={(e) => handleInputChange('continuous_assessment_score', parseFloat(e.target.value) || 0)}
//                       className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.continuous_assessment_score ? 'border-red-500' : ''}`}
//                       placeholder="0-15"
//                     />
//                     {errors.continuous_assessment_score && <p className="text-red-500 text-xs mt-1">{errors.continuous_assessment_score}</p>}
//                   </div>
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                       Take Home Test (0-5) *
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="5"
//                       step="0.1"
//                       value={formData.take_home_test_score}
//                       onChange={(e) => handleInputChange('take_home_test_score', parseFloat(e.target.value) || 0)}
//                       className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.take_home_test_score ? 'border-red-500' : ''}`}
//                       placeholder="0-5"
//                     />
//                     {errors.take_home_test_score && <p className="text-red-500 text-xs mt-1">{errors.take_home_test_score}</p>}
//                   </div>
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                       Practical (0-5) *
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="5"
//                       step="0.1"
//                       value={formData.practical_score}
//                       onChange={(e) => handleInputChange('practical_score', parseFloat(e.target.value) || 0)}
//                       className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.practical_score ? 'border-red-500' : ''}`}
//                       placeholder="0-5"
//                     />
//                     {errors.practical_score && <p className="text-red-500 text-xs mt-1">{errors.practical_score}</p>}
//                   </div>
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                       Appearance (0-5) *
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="5"
//                       step="0.1"
//                       value={formData.appearance_score}
//                       onChange={(e) => handleInputChange('appearance_score', parseFloat(e.target.value) || 0)}
//                       className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.appearance_score ? 'border-red-500' : ''}`}
//                       placeholder="0-5"
//                     />
//                     {errors.appearance_score && <p className="text-red-500 text-xs mt-1">{errors.appearance_score}</p>}
//                   </div>
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                       Project (0-5) *
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="5"
//                       step="0.1"
//                       value={formData.project_score}
//                       onChange={(e) => handleInputChange('project_score', parseFloat(e.target.value) || 0)}
//                       className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.project_score ? 'border-red-500' : ''}`}
//                       placeholder="0-5"
//                     />
//                     {errors.project_score && <p className="text-red-500 text-xs mt-1">{errors.project_score}</p>}
//                   </div>
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                       Note Copying (0-5) *
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="5"
//                       step="0.1"
//                       value={formData.note_copying_score}
//                       onChange={(e) => handleInputChange('note_copying_score', parseFloat(e.target.value) || 0)}
//                       className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.note_copying_score ? 'border-red-500' : ''}`}
//                       placeholder="0-5"
//                     />
//                     {errors.note_copying_score && <p className="text-red-500 text-xs mt-1">{errors.note_copying_score}</p>}
//                   </div>
//                 </div>
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                     Exam Score (0-60) *
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     max="60"
//                     step="0.1"
//                     value={formData.exam_score}
//                     onChange={(e) => handleInputChange('exam_score', parseFloat(e.target.value) || 0)}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.exam_score ? 'border-red-500' : ''}`}
//                     placeholder="0-60"
//                   />
//                   {errors.exam_score && <p className="text-red-500 text-xs mt-1">{errors.exam_score}</p>}
//                 </div>
//               </div>
//             )}

//             {result.student.education_level === 'NURSERY' && (
//               <div className="space-y-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                     Max Marks Obtainable *
//                   </label>
//                   <input
//                     type="number"
//                     min="1"
//                     step="0.1"
//                     value={formData.max_marks_obtainable}
//                     onChange={(e) => handleInputChange('max_marks_obtainable', parseFloat(e.target.value) || 100)}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.max_marks_obtainable ? 'border-red-500' : ''}`}
//                     placeholder="100"
//                   />
//                   {errors.max_marks_obtainable && <p className="text-red-500 text-xs mt-1">{errors.max_marks_obtainable}</p>}
//                 </div>
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                     Mark Obtained (0-{formData.max_marks_obtainable}) *
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     max={formData.max_marks_obtainable}
//                     step="0.1"
//                     value={formData.exam_score}
//                     onChange={(e) => handleInputChange('exam_score', parseFloat(e.target.value) || 0)}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.exam_score ? 'border-red-500' : ''}`}
//                     placeholder={`0-${formData.max_marks_obtainable}`}
//                   />
//                   {errors.exam_score && <p className="text-red-500 text-xs mt-1">{errors.exam_score}</p>}
//                 </div>
//               </div>
//             )}

//             {/* Calculated Values Display */}
//             <div className="md:col-span-2">
//               <div className="bg-blue-50 p-4 rounded-lg">
//                 <h5 className="font-medium text-blue-900 mb-2">Calculated Results</h5>
//                 <div className="grid grid-cols-3 gap-4 text-sm">
//                   <div>
//                     <span className="text-blue-700">CA Total:</span>
//                     <span className="ml-2 font-medium">{calculateCATotal() && typeof calculateCATotal() === 'number' ? calculateCATotal().toFixed(1) : '0.0'}</span>
//                   </div>
//                   <div>
//                     <span className="text-blue-700">Total Score:</span>
//                     <span className="ml-2 font-medium">{calculateTotalScore() && typeof calculateTotalScore() === 'number' ? calculateTotalScore().toFixed(1) : '0.0'}</span>
//                   </div>
//                   <div>
//                     <span className="text-blue-700">Percentage:</span>
//                     <span className="ml-2 font-medium">{calculatePercentage() && typeof calculatePercentage() === 'number' ? calculatePercentage().toFixed(1) : '0.0'}%</span>
//                   </div>
//                   <div>
//                     <span className="text-blue-700">Grade:</span>
//                     <span className="ml-2 font-medium">{formData.grade}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* Teacher Remark */}
//             {/* Teacher Remark */}
//             <div className="md:col-span-2">
//               <div className="flex items-center justify-between mb-2">
//                 <label className={`block text-sm font-medium ${themeClasses.textSecondary}`}>
//                   Teacher Remark
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     const totalScore = calculateTotalScore();
//                     const grade = formData.grade || determineGrade(calculatePercentage());
//                     const newRemark = generateTeacherRemark(totalScore, grade);
//                     handleInputChange('teacher_remark', newRemark);
//                   }}
//                   className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
//                 >
//                   Generate Remark
//                 </button>
//               </div>
//               <textarea
//                 value={formData.teacher_remark}
//                 onChange={(e) => handleInputChange('teacher_remark', e.target.value)}
//                 rows={3}
//                 className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
//                 placeholder="Enter teacher's remark about student's performance..."
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Optional: Add a comment about the student's performance in this subject. Click "Generate Remark" for automatic suggestions.
//               </p>
//             </div>

//             {/* Status */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
//                 Status
//               </label>
//               <select
//                 value={formData.status}
//                 onChange={(e) => handleInputChange('status', e.target.value)}
//                 className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
//               >
//                 <option value="DRAFT">Draft</option>
//                 <option value="APPROVED">Approved</option>
//                 <option value="PUBLISHED">Published</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
//         <button
//           type="button"
//           onClick={onClose}
//           className={`px-4 py-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors duration-200`}
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={loading || !selectedSubject}
//           className={`px-4 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors duration-200 flex items-center space-x-2 ${
//             loading ? 'opacity-50 cursor-not-allowed' : ''
//           }`}
//         >
//           {loading ? (
//             <>
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//               <span>Saving...</span>
//             </>
//           ) : (
//             <>
//               <Save className="w-4 h-4" />
//               <span>Save Changes</span>
//             </>
//           )}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default EditSubjectResultForm;


import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Save, AlertCircle, BookOpen, Calculator, Sparkles, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import api from '../../../services/api';

// Type definitions
interface Student {
  id: string;
  full_name: string;
  username: string;
  student_class: string;
  education_level: 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY';
  profile_picture?: string;
}

interface AcademicSession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

interface Subject {
  name: string;
  code: string;
}

interface SubjectResult {
  id: string;
  subject: Subject;
  total_ca_score: number;
  exam_score: number;
  total_score: number;
  percentage: number;
  grade: string;
  grade_point: number;
  is_passed: boolean;
  status: string;
  max_marks_obtainable?: number;
  mark_obtained?: number;
  academic_comment?: string;
  teacher_remark?: string;
  breakdown?: {
    max_marks_obtainable?: number;
    mark_obtained?: number;
    physical_development?: string;
    health?: string;
    cleanliness?: string;
    general_conduct?: string;
  };
}

interface StudentResult {
  id: string;
  student: Student;
  academic_session: AcademicSession;
  term: string;
  total_subjects: number;
  subjects_passed: number;
  subjects_failed: number;
  total_score: number;
  average_score: number;
  gpa: number;
  class_position: number | null;
  total_students: number;
  status: 'DRAFT' | 'APPROVED' | 'PUBLISHED';
  remarks: string;
  next_term_begins?: string;
  subject_results: SubjectResult[];
  created_at: string;
  updated_at: string;
}

interface SubjectFormData {
  first_test_score: number;
  second_test_score: number;
  third_test_score: number;
  continuous_assessment_score: number;
  take_home_test_score: number;
  practical_score: number;
  appearance_score: number;
  project_score: number;
  note_copying_score: number;
  exam_score: number;
  grade: string;
  status: string;
  teacher_remark: string;
  max_marks_obtainable: number;
}

interface EditSubjectResultFormProps {
  result: StudentResult;
  onClose: () => void;
  onSuccess: () => void;
}

const EditSubjectResultForm: React.FC<EditSubjectResultFormProps> = ({
  result,
  onClose,
  onSuccess,
}) => {
  const { isDarkMode } = useGlobalTheme();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectResult | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>({
    first_test_score: 0,
    second_test_score: 0,
    third_test_score: 0,
    continuous_assessment_score: 0,
    take_home_test_score: 0,
    practical_score: 0,
    appearance_score: 0,
    project_score: 0,
    note_copying_score: 0,
    exam_score: 0,
    grade: '',
    status: 'DRAFT',
    teacher_remark: '',
    max_marks_obtainable: 100,
  });

  const themeClasses = {
    bgCard: isDarkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-300',
    inputBg: isDarkMode ? 'bg-gray-700' : 'bg-white',
    inputText: isDarkMode ? 'text-white' : 'text-gray-900',
    bgPrimary: isDarkMode ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
  };

  // Education level configurations
  const educationConfig = useMemo(() => {
    const level = result.student.education_level;
    
    const configs = {
      SENIOR_SECONDARY: {
        name: 'Senior Secondary',
        caFields: [
          { key: 'first_test_score', label: 'Test 1', max: 10 },
          { key: 'second_test_score', label: 'Test 2', max: 10 },
          { key: 'third_test_score', label: 'Test 3', max: 10 },
        ],
        examMax: 70,
        caTotal: 30,
        totalMax: 100,
        useCustomMax: false,
      },
      JUNIOR_SECONDARY: {
        name: 'Junior Secondary',
        caFields: [
          { key: 'continuous_assessment_score', label: 'Continuous Assessment', max: 15 },
          { key: 'take_home_test_score', label: 'Take Home Test', max: 5 },
          { key: 'practical_score', label: 'Practical', max: 5 },
          { key: 'appearance_score', label: 'Appearance', max: 5 },
          { key: 'project_score', label: 'Project', max: 5 },
          { key: 'note_copying_score', label: 'Note Copying', max: 5 },
        ],
        examMax: 60,
        caTotal: 40,
        totalMax: 100,
        useCustomMax: false,
      },
      PRIMARY: {
        name: 'Primary',
        caFields: [
          { key: 'continuous_assessment_score', label: 'Continuous Assessment', max: 15 },
          { key: 'take_home_test_score', label: 'Take Home Test', max: 5 },
          { key: 'practical_score', label: 'Practical', max: 5 },
          { key: 'appearance_score', label: 'Appearance', max: 5 },
          { key: 'project_score', label: 'Project', max: 5 },
          { key: 'note_copying_score', label: 'Note Copying', max: 5 },
        ],
        examMax: 60,
        caTotal: 40,
        totalMax: 100,
        useCustomMax: false,
      },
      NURSERY: {
        name: 'Nursery',
        caFields: [],
        examMax: 100,
        caTotal: 0,
        totalMax: 100,
        useCustomMax: true,
      },
    };

    return configs[level] || configs.NURSERY;
  }, [result.student.education_level]);

  // Calculate CA total
  const caTotal = useMemo(() => {
    return educationConfig.caFields.reduce((sum, field) => {
      const value = formData[field.key as keyof SubjectFormData];
      return sum + (Number(value) || 0);
    }, 0);
  }, [formData, educationConfig.caFields]);

  // Calculate total score
  const totalScore = useMemo(() => {
    const exam = Number(formData.exam_score) || 0;
    return result.student.education_level === 'NURSERY' ? exam : caTotal + exam;
  }, [caTotal, formData.exam_score, result.student.education_level]);

  // Calculate percentage
  const percentage = useMemo(() => {
    if (totalScore === 0) return 0;
    const max = result.student.education_level === 'NURSERY' 
      ? (Number(formData.max_marks_obtainable) || 100)
      : educationConfig.totalMax;
    if (max === 0) return 0;
    return (totalScore / max) * 100;
  }, [totalScore, formData.max_marks_obtainable, educationConfig.totalMax, result.student.education_level]);
  // Determine grade
  const grade = useMemo(() => {
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 45) return 'D';
    if (percentage >= 39) return 'E';
    return 'F';
  }, [percentage]);

  // Update grade when percentage changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, grade }));
  }, [grade]);

  // Format score for display
  const formatScore = (score: any): string => {
    if (score == null) return 'N/A';
    const num = typeof score === 'string' ? parseFloat(score) : score;
    return isNaN(num) ? 'N/A' : `${num.toFixed(1)}%`;
  };

  // Generate teacher remark
  const generateRemark = useCallback(() => {
    const remarks = {
      A: [
        'Excellent performance! Outstanding work and dedication.',
        'Exceptional achievement. Keep up the excellent work!',
        'Outstanding performance. You are a model student.',
        'Brilliant work! Your dedication is commendable.'
      ],
      B: [
        'Very good performance. Well done!',
        'Excellent work. Keep maintaining this standard.',
        'Great achievement. Continue to excel.',
        'Very good performance. You should be proud.'
      ],
      C: [
        'Good performance. Keep up the good work.',
        'Well done! Continue to improve.',
        'Good effort. You are making progress.',
        'Satisfactory performance. Keep working hard.'
      ],
      D: [
        'Fair performance. Room for improvement.',
        'Average work. Try to do better next time.',
        'Satisfactory performance. Keep working hard.',
        'Fair effort. Focus on areas that need improvement.'
      ],
      E: [
        'Below average performance. More effort needed.',
        'Needs improvement. Focus on your studies.',
        'Below expectations. Work harder next time.',
        'Room for improvement. Keep working hard.'
      ],
      F: [
        'Failed. Immediate remedial action required.',
        'Complete failure. Urgent academic intervention needed.',
        'Failed grade. Parent consultation and support required.',
        'Critical failure. Seek immediate academic help.'
      ]
    };

    const gradeRemarks = remarks[grade as keyof typeof remarks] || remarks.F;
    return gradeRemarks[Math.floor(Math.random() * gradeRemarks.length)];
  }, [grade]);

  // Handle subject selection
  const handleSubjectSelect = useCallback(async (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const subject = result.subject_results.find(s => s.id === subjectId);
    if (!subject) return;
    
    setSelectedSubject(subject);
    setLoading(true);

    try {
      const endpoints = {
        SENIOR_SECONDARY: `/api/results/senior-secondary/results/${subjectId}/`,
        JUNIOR_SECONDARY: `/api/results/junior-secondary/results/${subjectId}/`,
        PRIMARY: `/api/results/primary/results/${subjectId}/`,
        NURSERY: `/api/results/nursery/results/${subjectId}/`,
      };

      const endpoint = endpoints[result.student.education_level];
      if (!endpoint) throw new Error('Invalid education level');

      const fullResultData = await api.get(endpoint);
      console.log('Full result data from API:', fullResultData);
      
      const baseData = {
        exam_score: fullResultData.exam_score || 0,
        grade: fullResultData.grade || '',
        status: fullResultData.status || 'DRAFT',
        teacher_remark: fullResultData.teacher_remark || fullResultData.academic_comment || '',
      };

      let newFormData: SubjectFormData;

      if (result.student.education_level === 'SENIOR_SECONDARY') {
        newFormData = {
          ...baseData,
          first_test_score: fullResultData.first_test_score || 0,
          second_test_score: fullResultData.second_test_score || 0,
          third_test_score: fullResultData.third_test_score || 0,
          continuous_assessment_score: 0,
          take_home_test_score: 0,
          practical_score: 0,
          appearance_score: 0,
          project_score: 0,
          note_copying_score: 0,
          max_marks_obtainable: 100,
        };
      } else if (['PRIMARY', 'JUNIOR_SECONDARY'].includes(result.student.education_level)) {
        newFormData = {
          ...baseData,
          continuous_assessment_score: fullResultData.continuous_assessment_score || 0,
          take_home_test_score: fullResultData.take_home_test_score || 0,
          practical_score: fullResultData.practical_score || 0,
          appearance_score: fullResultData.appearance_score || 0,
          project_score: fullResultData.project_score || 0,
          note_copying_score: fullResultData.note_copying_score || 0,
          first_test_score: 0,
          second_test_score: 0,
          third_test_score: 0,
          max_marks_obtainable: 100,
        };
      } else {
        newFormData = {
          ...baseData,
          exam_score: fullResultData.mark_obtained || 0,
          max_marks_obtainable: fullResultData.max_marks_obtainable || 100,
          first_test_score: 0,
          second_test_score: 0,
          third_test_score: 0,
          continuous_assessment_score: 0,
          take_home_test_score: 0,
          practical_score: 0,
          appearance_score: 0,
          project_score: 0,
          note_copying_score: 0,
        };
      }

      setFormData(newFormData);
    } catch (error: any) {
      console.error('Error fetching result data:', error);
      toast.error('Failed to load complete result data');
      
      // Fallback
      const baseFormData = {
        exam_score: subject.exam_score || 0,
        grade: subject.grade || '',
        status: subject.status || 'DRAFT',
        teacher_remark: subject.teacher_remark || subject.academic_comment || '',
        first_test_score: 0,
        second_test_score: 0,
        third_test_score: 0,
        continuous_assessment_score: 0,
        take_home_test_score: 0,
        practical_score: 0,
        appearance_score: 0,
        project_score: 0,
        note_copying_score: 0,
        max_marks_obtainable: 100,
      };
      setFormData(baseFormData);
    } finally {
      setLoading(false);
    }
  }, [result]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedSubject) {
      newErrors.subject = 'Please select a subject to edit';
      setErrors(newErrors);
      return false;
    }

    educationConfig.caFields.forEach(field => {
      const value = formData[field.key as keyof SubjectFormData] as number;
      if (value < 0 || value > field.max) {
        newErrors[field.key] = `${field.label} must be between 0 and ${field.max}`;
      }
    });

    const examMax = educationConfig.useCustomMax ? formData.max_marks_obtainable : educationConfig.examMax;
    if (formData.exam_score < 0 || formData.exam_score > examMax) {
      newErrors.exam_score = `Exam score must be between 0 and ${examMax}`;
    }

    if (result.student.education_level === 'NURSERY' && formData.max_marks_obtainable <= 0) {
      newErrors.max_marks_obtainable = 'Max marks obtainable must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedSubject, educationConfig, result.student.education_level]);

  // Handle input change
  const handleInputChange = useCallback((field: keyof SubjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedSubject) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      let updateData: any = { status: formData.status };

      if (result.student.education_level === 'SENIOR_SECONDARY') {
        updateData = {
          ...updateData,
          first_test_score: formData.first_test_score,
          second_test_score: formData.second_test_score,
          third_test_score: formData.third_test_score,
          exam_score: formData.exam_score,
          teacher_remark: formData.teacher_remark || '',
        };
      } else if (['PRIMARY', 'JUNIOR_SECONDARY'].includes(result.student.education_level)) {
        updateData = {
          ...updateData,
          continuous_assessment_score: formData.continuous_assessment_score,
          take_home_test_score: formData.take_home_test_score,
          practical_score: formData.practical_score,
          appearance_score: formData.appearance_score,
          project_score: formData.project_score,
          note_copying_score: formData.note_copying_score,
          exam_score: formData.exam_score,
          teacher_remark: formData.teacher_remark || '',
        };
      } else {
        updateData = {
          ...updateData,
          mark_obtained: formData.exam_score,
          max_marks_obtainable: formData.max_marks_obtainable,
          academic_comment: formData.teacher_remark || '',
        };
      }

      const endpoints = {
        SENIOR_SECONDARY: `/api/results/senior-secondary/results/${selectedSubject.id}/`,
        JUNIOR_SECONDARY: `/api/results/junior-secondary/results/${selectedSubject.id}/`,
        PRIMARY: `/api/results/primary/results/${selectedSubject.id}/`,
        NURSERY: `/api/results/nursery/results/${selectedSubject.id}/`,
      };

      const endpoint = endpoints[result.student.education_level];
      
      // Verify result exists
      await api.get(endpoint);
      await api.put(endpoint, updateData);

      toast.success('Subject result updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating subject result:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update subject result';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Subject Results</h2>
              <p className="text-sm text-gray-600 mt-1">{result.student?.full_name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Term Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2 text-blue-600" />
              Term Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Term</div>
                <div className="font-semibold text-gray-900">{result.term}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Session</div>
                <div className="font-semibold text-gray-900">{result.academic_session?.name}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Class</div>
                <div className="font-semibold text-gray-900">{result.student?.student_class}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Total Subjects</div>
                <div className="font-semibold text-gray-900">{result.subject_results?.length || 0}</div>
              </div>
            </div>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Subject to Edit *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.subject_results?.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => handleSubjectSelect(subject.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedSubjectId === subject.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedSubjectId === subject.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <BookOpen className={`w-5 h-5 ${
                        selectedSubjectId === subject.id ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{subject.subject.name}</div>
                      <div className="text-sm text-gray-500">{subject.subject.code}</div>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-600">Current:</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          subject.is_passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {formatScore(subject.percentage)} ({subject.grade})
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {errors.subject && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.subject}
              </p>
            )}
          </div>

          {/* Subject Edit Form */}
          {selectedSubject && (
            <div className="border-2 border-blue-100 rounded-xl p-6 bg-gradient-to-br from-white to-blue-50/30">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                Edit {selectedSubject.subject.name} Scores
                <span className="ml-auto text-sm font-normal text-gray-600">
                  {educationConfig.name}
                </span>
              </h3>

              <div className="space-y-6">
                {/* CA Scores */}
                {educationConfig.caFields.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                      Continuous Assessment ({educationConfig.caTotal} marks total)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {educationConfig.caFields.map(field => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label} (0-{field.max}) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={field.max}
                            step="0.1"
                            value={formData[field.key as keyof SubjectFormData]}
                            onChange={(e) => handleInputChange(field.key as keyof SubjectFormData, parseFloat(e.target.value) || 0)}
                            className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[field.key] ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                            placeholder={`0-${field.max}`}
                          />
                          {errors[field.key] && (
                            <p className="text-red-600 text-xs mt-1">{errors[field.key]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exam Score */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                    Examination
                  </h4>
                  {result.student.education_level === 'NURSERY' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Marks Obtainable *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={formData.max_marks_obtainable}
                        onChange={(e) => handleInputChange('max_marks_obtainable', parseFloat(e.target.value) || 100)}
                        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.max_marks_obtainable ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.max_marks_obtainable && (
                        <p className="text-red-600 text-xs mt-1">{errors.max_marks_obtainable}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {result.student.education_level === 'NURSERY' ? 'Mark Obtained' : 'Exam Score'} 
                      {' '}(0-{educationConfig.useCustomMax ? formData.max_marks_obtainable : educationConfig.examMax}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={educationConfig.useCustomMax ? formData.max_marks_obtainable : educationConfig.examMax}
                      step="0.1"
                      value={formData.exam_score}
                      onChange={(e) => handleInputChange('exam_score', parseFloat(e.target.value) || 0)}
                      className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.exam_score ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.exam_score && (
                      <p className="text-red-600 text-xs mt-1">{errors.exam_score}</p>
                    )}
                  </div>
                </div>

                {/* Calculated Results */}
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-5 rounded-xl border-2 border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculated Results
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {caTotal > 0 && (
                      <div>
                        <div className="text-sm text-blue-700 mb-1">CA Total</div>
                        <div className="text-xl font-bold text-blue-900">
                          {typeof caTotal === 'number' ? caTotal.toFixed(1) : '0.0'}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-blue-700 mb-1">Total Score</div>
                      <div className="text-xl font-bold text-blue-900">
                        {typeof totalScore === 'number' ? totalScore.toFixed(1) : '0.0'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-700 mb-1">Percentage</div>
                      <div className="text-xl font-bold text-blue-900">
                        {typeof percentage === 'number' ? percentage.toFixed(1) : '0.0'}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-700 mb-1">Grade</div>
                      <div className={`text-xl font-bold px-3 py-1 rounded-lg inline-block ${
                        ['A', 'B'].includes(grade) ? 'bg-green-500 text-white' :
                        ['C', 'D'].includes(grade) ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>{grade || 'N/A'}</div>
                    </div>
                  </div>
                  {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {caTotal > 0 && (
                      <div>
                        <div className="text-sm text-blue-700 mb-1">CA Total</div>
                        <div className="text-xl font-bold text-blue-900">{caTotal.toFixed(1)}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-blue-700 mb-1">Total Score</div>
                      <div className="text-xl font-bold text-blue-900">{totalScore.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-700 mb-1">Percentage</div>
                      <div className="text-xl font-bold text-blue-900">{percentage.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-700 mb-1">Grade</div>
                      <div className={`text-xl font-bold px-3 py-1 rounded-lg inline-block ${
                        ['A', 'B'].includes(grade) ? 'bg-green-500 text-white' :
                        ['C', 'D'].includes(grade) ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>{grade}</div>
                    </div>
                  </div> */}
                </div>

                {/* Teacher Remark */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Teacher Remark
                    </label>
                    <button
                      type="button"
                      onClick={() => handleInputChange('teacher_remark', generateRemark())}
                      className="flex items-center space-x-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Remark</span>
                    </button>
                  </div>
                  <textarea
                    value={formData.teacher_remark}
                    onChange={(e) => handleInputChange('teacher_remark', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    placeholder="Enter teacher's remark about student's performance..."
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Info className="w-3 h-3 mr-1" />
                    Optional: Add a comment about the student's performance. Click "Generate Remark" for suggestions.
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t-2 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedSubject}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                loading || !selectedSubject
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



export default EditSubjectResultForm