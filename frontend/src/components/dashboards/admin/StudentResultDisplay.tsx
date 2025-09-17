
// import React, { useState, useEffect } from 'react';
// import { Trophy, Download, Printer, Loader2, AlertCircle } from 'lucide-react';
// import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
// import ResultService from '@/services/ResultService';
// import { toast } from 'react-hot-toast';

// // Import result templates based on education level
// import NurseryResult from '../student/NurseryResult';
// import PrimaryResult from '../student/PrimaryResult';
// import JuniorSecondaryResult from '../student/JuniorSecondaryResult';
// import SeniorSecondarySessionResult from '../student/SeniorSecondarySessionResult';
// import SeniorSecondaryTermlyResult from '../student/SeniorSecondaryTermlyResult';

// interface StudentData {
//   id: string;
//   full_name: string;
//   username: string;
//   student_class: string;
//   education_level: string;
//   profile_picture?: string;
// }

// interface SelectionData {
//   academicSession: string;
//   term: string;
//   class: string;
//   resultType?: string;
// }

// interface StudentResultDisplayProps {
//   student: StudentData;
//   selections: SelectionData;
// }

// const StudentResultDisplay: React.FC<StudentResultDisplayProps> = ({ student, selections }) => {
//   const { isDarkMode } = useGlobalTheme();
//   const [results, setResults] = useState<any[]>([]);
//   const [termResults, setTermResults] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const themeClasses = {
//     bgPrimary: isDarkMode ? 'bg-gray-900' : 'bg-white',
//     bgSecondary: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
//     bgCard: isDarkMode ? 'bg-gray-800' : 'bg-white',
//     textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
//     textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
//     textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
//     border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
//     borderHover: isDarkMode ? 'border-gray-600' : 'border-gray-300',
//     iconPrimary: isDarkMode ? 'text-blue-400' : 'text-blue-600',
//     iconSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
//     buttonPrimary: isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
//     buttonSecondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
//     buttonSuccess: isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white',
//     buttonWarning: isDarkMode ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white',
//     buttonDanger: isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white',
//   };

//   // Helper method to determine education level from class name if not provided
//   const getEducationLevel = (): string => {
//     if (student.education_level) {
//       return student.education_level.toUpperCase();
//     }
    
//     const className = student.student_class?.toLowerCase() || '';
//     if (className.includes('nursery')) return 'NURSERY';
//     if (className.includes('primary')) return 'PRIMARY';
//     if (className.includes('jss') || className.includes('junior')) return 'JUNIOR_SECONDARY';
//     if (className.includes('sss') || className.includes('senior')) return 'SENIOR_SECONDARY';
//     return 'UNKNOWN';
//   };

//   // Convert term format for API consistency
//   const normalizeTermFormat = (term: string): string => {
//     const termMap: { [key: string]: string } = {
//       '1st Term': 'FIRST',
//       '2nd Term': 'SECOND', 
//       '3rd Term': 'THIRD',
//       'First Term': 'FIRST',
//       'Second Term': 'SECOND',
//       'Third Term': 'THIRD',
//       'FIRST': 'FIRST',
//       'SECOND': 'SECOND',
//       'THIRD': 'THIRD'
//     };
//     return termMap[term] || term.toUpperCase();
//   };

//   // Convert academic session format for API consistency
//   const normalizeAcademicSession = (session: string): string => {
//     // Ensure format like "2023/2024" is properly handled
//     return session.trim();
//   };

//   // Load results data
//   useEffect(() => {
//     const loadResults = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const educationLevel = getEducationLevel();
//         const normalizedTerm = normalizeTermFormat(selections.term);
//         const normalizedSession = normalizeAcademicSession(selections.academicSession);

//         if (import.meta.env.DEV) {
//           console.log('Loading results for:', {
//             studentId: student.id,
//             educationLevel,
//             term: normalizedTerm,
//             session: normalizedSession,
//             originalTerm: selections.term,
//             originalSession: selections.academicSession
//           });
//         }

//         // Use the unified getStudentResults method
//         const [resultsData, termResultsData] = await Promise.all([
//           ResultService.getStudentResults({
//             student: student.id,
//             education_level: educationLevel !== 'UNKNOWN' ? educationLevel : undefined
//           }),
//           ResultService.getTermResultsByStudent(student.id)
//         ]);

//         if (import.meta.env.DEV) {
//           console.log('Raw results data:', resultsData);
//           console.log('Raw term results data:', termResultsData);
//         }

//         // Filter results by selected criteria with more flexible matching
//         const filteredResults = (resultsData || []).filter((result: any) => {
//           // Term matching - try multiple formats
//           const resultTerm = result.exam_session?.term?.toUpperCase() || '';
//           const termMatch = resultTerm === normalizedTerm || 
//                            resultTerm === selections.term.toUpperCase() ||
//                            resultTerm.includes(normalizedTerm) ||
//                            normalizedTerm.includes(resultTerm);

//           // Session matching - try multiple formats
//           const resultSessionName = result.exam_session?.academic_session?.name || '';
//           const sessionMatch = resultSessionName === normalizedSession ||
//                                resultSessionName === selections.academicSession ||
//                                resultSessionName.includes(normalizedSession) ||
//                                normalizedSession.includes(resultSessionName);

//           // Education level matching
//           const educationMatch = educationLevel === 'UNKNOWN' || 
//                                  result.education_level === educationLevel ||
//                                  !result.education_level; // Include results without education level

//           if (import.meta.env.DEV) {
//             console.log('Result filter check:', {
//               resultId: result.id,
//               resultTerm,
//               normalizedTerm,
//               termMatch,
//               resultSessionName,
//               normalizedSession,
//               sessionMatch,
//               resultEducationLevel: result.education_level,
//               educationLevel,
//               educationMatch,
//               overallMatch: termMatch && sessionMatch && educationMatch
//             });
//           }

//           return termMatch && sessionMatch && educationMatch;
//         });

//         const filteredTermResults = (termResultsData || []).filter((termResult: any) => {
//           const termMatch = termResult.term?.toUpperCase() === normalizedTerm ||
//                             termResult.term === selections.term;
//           const sessionMatch = termResult.academic_session?.name === normalizedSession ||
//                               termResult.academic_session?.name === selections.academicSession;
//           return termMatch && sessionMatch;
//         });

//         if (import.meta.env.DEV) {
//           console.log('Filtered results:', filteredResults);
//           console.log('Filtered term results:', filteredTermResults);
//         }

//         setResults(filteredResults);
//         setTermResults(filteredTermResults);

//         if (filteredResults.length === 0 && filteredTermResults.length === 0) {
//           setError('No results found for the selected criteria. Please ensure the academic session and term have published results.');
//         }
//       } catch (err) {
//         console.error('Error loading results:', err);
//         setError('Failed to load results. Please try again.');
//         toast.error('Failed to load results');
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadResults();
//   }, [student.id, selections]);

//   const getGradeColor = (grade: string) => {
//     if (!grade) return 'text-gray-600 bg-gray-100';
//     if (grade === 'A' || grade === 'A+') return 'text-green-600 bg-green-100';
//     if (grade === 'B' || grade === 'B+') return 'text-blue-600 bg-blue-100';
//     if (grade === 'C' || grade === 'C+') return 'text-yellow-600 bg-yellow-100';
//     if (grade === 'D' || grade === 'D+') return 'text-orange-600 bg-orange-100';
//     return 'text-red-600 bg-red-100';
//   };

//   const getStatusColor = (status: string) => {
//     if (!status) return 'text-gray-600 bg-gray-100';
//     switch (status.toUpperCase()) {
//       case 'PUBLISHED': return 'text-green-600 bg-green-100';
//       case 'APPROVED': return 'text-blue-600 bg-blue-100';
//       case 'DRAFT': return 'text-yellow-600 bg-yellow-100';
//       default: return 'text-gray-600 bg-gray-100';
//     }
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleDownload = async () => {
//     try {
//       // You can implement PDF generation here
//       toast.success('Download functionality will be implemented');
//     } catch (error) {
//       toast.error('Download failed');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-center">
//           <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading results...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//         <h4 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h4>
//         <p className="text-gray-600 mb-4">{error}</p>
//         <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
//           <p><strong>Student:</strong> {student.full_name}</p>
//           <p><strong>Class:</strong> {student.student_class}</p>
//           <p><strong>Education Level:</strong> {getEducationLevel()}</p>
//           <p><strong>Academic Session:</strong> {selections.academicSession}</p>
//           <p><strong>Term:</strong> {selections.term} (API: {normalizeTermFormat(selections.term)})</p>
//           {selections.resultType && <p><strong>Result Type:</strong> {selections.resultType}</p>}
//         </div>
//       </div>
//     );
//   }

//   // Determine which result template to use based on education level
//   const getResultTemplate = () => {
//     const educationLevel = getEducationLevel();
//     const className = student.student_class?.toLowerCase() || '';
    
//     if (import.meta.env.DEV) {
//       console.log('Selecting template for:', {
//         educationLevel,
//         className,
//         resultType: selections.resultType
//       });
//     }
    
//     // Nursery classes
//     if (educationLevel === 'NURSERY') {
//       return (
//         <NurseryResult 
//           studentData={{ 
//             name: student.full_name,
//             class: student.student_class,
//             term: selections.term,
//             date: new Date().toLocaleDateString(),
//             house: 'Blue House', // You might want to make this dynamic
//             timesOpened: '120', // You might want to make this dynamic
//             timesPresent: '115' // You might want to make this dynamic
//           }} 
//           subjectResults={results}
//           termResults={termResults}
//         />
//       );
//     }
    
//     // Primary classes
//     if (educationLevel === 'PRIMARY') {
//       return (
//         <PrimaryResult 
//           studentData={{ 
//             name: student.full_name,
//             class: student.student_class,
//             term: selections.term,
//             academicSession: selections.academicSession
//           }} 
//           subjectResults={results}
//           termResults={termResults}
//         />
//       );
//     }
    
//     // Junior Secondary classes (JSS)
//     if (educationLevel === 'JUNIOR_SECONDARY') {
//       return (
//         <JuniorSecondaryResult 
//           studentData={{ 
//             name: student.full_name,
//             class: student.student_class,
//             term: selections.term,
//             academicSession: selections.academicSession,
//             resultType: selections.resultType
//           }} 
//           subjectResults={results}
//           termResults={termResults}
//         />
//       );
//     }
    
//     // Senior Secondary classes (SSS)
//     if (educationLevel === 'SENIOR_SECONDARY') {
//       // Use SessionResult for Annually, TermlyResult for Termly
//       if (selections.resultType === 'annually') {
//         return (
//           <SeniorSecondarySessionResult 
//             studentData={{ 
//               name: student.full_name,
//               class: student.student_class,
//               term: selections.term,
//               academicSession: selections.academicSession,
//               resultType: selections.resultType
//             }} 
//             subjectResults={results}
//             termResults={termResults}
//           />
//         );
//       } else {
//         return (
//           <SeniorSecondaryTermlyResult 
//             studentData={{ 
//               name: student.full_name,
//               class: student.student_class,
//               term: selections.term,
//               academicSession: selections.academicSession,
//               resultType: selections.resultType
//             }} 
//             subjectResults={results}
//             termResults={termResults}
//           />
//         );
//       }
//     }
    
//     // Default fallback - show the generic result display
//     return (
//       <div className="space-y-6 print:space-y-4">
//         {/* Print Header - Only visible when printing */}
//         <div className="hidden print:block print:mb-6">
//           <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
//             <h1 className="text-2xl font-bold text-gray-900">GOD'S TREASURE SCHOOLS</h1>
//             <p className="text-gray-600">Student Result Report</p>
//             <p className="text-sm text-gray-500 mt-2">
//               Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
//             </p>
//           </div>
//           <div className="grid grid-cols-2 gap-4 mb-6">
//             <div>
//               <p><strong>Student Name:</strong> {student.full_name}</p>
//               <p><strong>Username:</strong> {student.username}</p>
//               <p><strong>Class:</strong> {student.student_class}</p>
//             </div>
//             <div>
//               <p><strong>Academic Session:</strong> {selections.academicSession}</p>
//               <p><strong>Term:</strong> {selections.term}</p>
//               <p><strong>Education Level:</strong> {educationLevel}</p>
//             </div>
//           </div>
//         </div>

//         {/* Term Results Summary */}
//         {termResults.length > 0 && (
//           <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 print:bg-white print:border-gray-300">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center print:text-black">
//               <Trophy className="w-5 h-5 text-blue-600 mr-2" />
//               Term Summary
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {termResults.map((termResult, index) => (
//                 <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 print:border-gray-300">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm font-medium text-gray-600 dark:text-gray-300 print:text-black">
//                       {termResult.term} Term
//                     </span>
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(termResult.status)} print:bg-gray-200 print:text-black`}>
//                       {termResult.status}
//                     </span>
//                   </div>
//                   <div className="space-y-2">
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600 dark:text-gray-300 print:text-black">Total Subjects:</span>
//                       <span className="font-semibold print:text-black">{termResult.total_subjects}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600 dark:text-gray-300 print:text-black">Passed:</span>
//                       <span className="font-semibold text-green-600 print:text-black">{termResult.subjects_passed}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600 dark:text-gray-300 print:text-black">Failed:</span>
//                       <span className="font-semibold text-red-600 print:text-black">{termResult.subjects_failed}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600 dark:text-gray-300 print:text-black">Average:</span>
//                       <span className="font-semibold print:text-black">{termResult.average_score?.toFixed(1)}%</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600 dark:text-gray-300 print:text-black">GPA:</span>
//                       <span className="font-semibold print:text-black">{termResult.gpa?.toFixed(2)}</span>
//                     </div>
//                     {termResult.class_position && (
//                       <div className="flex justify-between">
//                         <span className="text-sm text-gray-600 dark:text-gray-300 print:text-black">Position:</span>
//                         <span className="font-semibold print:text-black">{termResult.class_position}/{termResult.total_students}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Individual Subject Results */}
//         {results.length > 0 && (
//           <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden print:border-gray-300">
//             <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white print:text-black">
//                 Subject Results
//               </h3>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 dark:bg-gray-700 print:bg-gray-100">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
//                       Subject
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
//                       CA Score
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
//                       Exam Score
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
//                       Total
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
//                       Percentage
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
//                       Grade
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
//                       Status
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 print:divide-gray-300">
//                   {results.map((result, index) => (
//                     <tr key={result.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent">
//                       <td className="px-6 py-4 whitespace-nowrap print:border-b print:border-gray-200">
//                         <div>
//                           <div className="text-sm font-medium text-gray-900 dark:text-white print:text-black">
//                             {result.subject?.name || 'N/A'}
//                           </div>
//                           <div className="text-sm text-gray-500 dark:text-gray-300 print:text-black">
//                             {result.subject?.code || ''}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white print:text-black print:border-b print:border-gray-200">
//                         {result.ca_score ?? 0}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white print:text-black print:border-b print:border-gray-200">
//                         {result.exam_score ?? 0}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white print:text-black print:border-b print:border-gray-200">
//                         {result.total_score ?? 0}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white print:text-black print:border-b print:border-gray-200">
//                         {result.percentage?.toFixed(1) || '0.0'}%
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap print:border-b print:border-gray-200">
//                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(result.grade)} print:bg-gray-200 print:text-black`}>
//                           {result.grade || 'N/A'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap print:border-b print:border-gray-200">
//                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)} print:bg-gray-200 print:text-black`}>
//                           {result.status || 'N/A'}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* No Results Message */}
//         {results.length === 0 && termResults.length === 0 && !loading && !error && (
//           <div className="text-center py-12">
//             <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//               No Results Available
//             </h4>
//             <p className="text-gray-600 dark:text-gray-300">
//               No results have been published for this student yet.
//             </p>
//           </div>
//         )}

//         {/* Print Footer - Only visible when printing */}
//         <div className="hidden print:block print:mt-8 print:pt-4 print:border-t print:border-gray-300">
//           <div className="text-center text-sm text-gray-500">
//             <p>This is an official result document from GOD'S TREASURE SCHOOLS</p>
//             <p>Generated by Admin Portal on {new Date().toLocaleDateString()}</p>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6 print:space-y-4">
//       {/* Action Buttons - Hidden when printing */}
//       <div className="flex items-center justify-end space-x-3 print:hidden">
//         <button
//           onClick={handlePrint}
//           className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${themeClasses.buttonSecondary}`}
//         >
//           <Printer size={16} />
//           <span>Print</span>
//         </button>
//         <button
//           onClick={handleDownload}
//           className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${themeClasses.buttonPrimary}`}
//         >
//           <Download size={16} />
//           <span>Download</span>
//         </button>
//       </div>

//       {/* Display the appropriate result template */}
//       {getResultTemplate()}
//     </div>
//   );
// };

// export default StudentResultDisplay;


import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Download, Printer, Loader2, AlertCircle } from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import ResultService, { 
  StandardResult, 
  StudentTermResult, 
  FilterParams 
} from '@/services/ResultService';
import { toast } from 'react-hot-toast';

// Import result templates based on education level
import NurseryResult from '../student/NurseryResult';
import PrimaryResult from '../student/PrimaryResult';
import JuniorSecondaryResult from '../student/JuniorSecondaryResult';
import SeniorSecondarySessionResult from '../student/SeniorSecondarySessionResult';
import SeniorSecondaryTermlyResult from '../student/SeniorSecondaryTermlyResult';

interface StudentData {
  id: string;
  full_name: string;
  username: string;
  student_class: string;
  education_level: string;
  profile_picture?: string;
}

interface SelectionData {
  academicSession: string;
  term: string;
  class: string;
  resultType?: string;
}

interface StudentResultDisplayProps {
  student: StudentData;
  selections: SelectionData;
}

const StudentResultDisplay: React.FC<StudentResultDisplayProps> = ({ student, selections }) => {
  const { isDarkMode } = useGlobalTheme();
  const [results, setResults] = useState<StandardResult[]>([]);
  const [termResults, setTermResults] = useState<StudentTermResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const themeClasses = {
    bgPrimary: isDarkMode ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
    bgCard: isDarkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    borderHover: isDarkMode ? 'border-gray-600' : 'border-gray-300',
    iconPrimary: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    iconSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    buttonPrimary: isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    buttonSuccess: isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white',
    buttonWarning: isDarkMode ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white',
    buttonDanger: isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white',
  };

  // Memoized education level determination
  const educationLevel = useMemo(() => {
    if (student.education_level) {
      return student.education_level.toUpperCase();
    }
    
    const className = student.student_class?.toLowerCase() || '';
    if (className.includes('nursery')) return 'NURSERY';
    if (className.includes('primary')) return 'PRIMARY';
    if (className.includes('jss') || className.includes('junior')) return 'JUNIOR_SECONDARY';
    if (className.includes('sss') || className.includes('senior')) return 'SENIOR_SECONDARY';
    return 'UNKNOWN';
  }, [student.education_level, student.student_class]);

  // Memoized term format conversion
  const normalizedTerm = useMemo(() => {
    const termMap: { [key: string]: string } = {
      '1st Term': 'FIRST',
      '2nd Term': 'SECOND', 
      '3rd Term': 'THIRD',
      'First Term': 'FIRST',
      'Second Term': 'SECOND',
      'Third Term': 'THIRD',
      'FIRST': 'FIRST',
      'SECOND': 'SECOND',
      'THIRD': 'THIRD'
    };
    return termMap[selections.term] || selections.term.toUpperCase();
  }, [selections.term]);

  // Load results data with improved error handling and filtering
  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        setError(null);

        if (educationLevel === 'UNKNOWN') {
          throw new Error('Unable to determine education level from student data');
        }

        const filterParams: FilterParams = {
          student: student.id,
          education_level: educationLevel,
          result_type: selections.resultType === 'annually' ? 'session' : 'termly'
        };

        // Add academic session filter if available
        if (selections.academicSession) {
          filterParams.academic_session = selections.academicSession;
        }

        // Add term filter if available
        if (normalizedTerm && selections.resultType !== 'annually') {
          filterParams.term = normalizedTerm;
        }

        if (import.meta.env.DEV) {
          console.log('Loading results with params:', filterParams);
          setDebugInfo({
            studentId: student.id,
            educationLevel,
            originalTerm: selections.term,
            normalizedTerm,
            academicSession: selections.academicSession,
            resultType: selections.resultType,
            filterParams
          });
        }

        const [resultsData, termResultsData] = await Promise.allSettled([
          ResultService.getStudentResults(filterParams),
          ResultService.getTermResultsByStudent(student.id)
        ]);

        // Handle results data
        let processedResults: StandardResult[] = [];
        if (resultsData.status === 'fulfilled') {
          processedResults = resultsData.value || [];
        } else {
          console.error('Error fetching results:', resultsData.reason);
          toast.error('Failed to load subject results');
        }

        // Handle term results data
        let processedTermResults: StudentTermResult[] = [];
        if (termResultsData.status === 'fulfilled') {
          processedTermResults = termResultsData.value || [];
          
          // Filter term results by selection criteria
          processedTermResults = processedTermResults.filter((termResult) => {
            const termMatch = !normalizedTerm || 
                             termResult.term?.toUpperCase() === normalizedTerm ||
                             termResult.term === selections.term;
            
            const sessionMatch = !selections.academicSession ||
                                termResult.academic_session?.name === selections.academicSession;
            
            return termMatch && sessionMatch;
          });
        } else {
          console.error('Error fetching term results:', termResultsData.reason);
          // Term results are optional, so don't throw an error here
        }

        if (import.meta.env.DEV) {
          console.log('Processed results:', {
            subjectResults: processedResults.length,
            termResults: processedTermResults.length,
            sampleResult: processedResults[0],
            sampleTermResult: processedTermResults[0]
          });
        }

        setResults(processedResults);
        setTermResults(processedTermResults);

        // Set appropriate error message if no results found
        if (processedResults.length === 0 && processedTermResults.length === 0) {
          setError(`No results found for ${student.full_name} in ${selections.academicSession} ${selections.term}. Please verify that results have been published for this academic session and term.`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load results';
        console.error('Error loading results:', err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [student.id, educationLevel, normalizedTerm, selections.academicSession, selections.resultType]);

  // Utility functions
  const getGradeColor = (grade: string) => {
    if (!grade || grade === 'N/A') return isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100';
    
    const gradeUpper = grade.toUpperCase();
    if (gradeUpper.includes('A')) return isDarkMode ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-100';
    if (gradeUpper.includes('B')) return isDarkMode ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-100';
    if (gradeUpper.includes('C')) return isDarkMode ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-600 bg-yellow-100';
    if (gradeUpper.includes('D')) return isDarkMode ? 'text-orange-400 bg-orange-900/30' : 'text-orange-600 bg-orange-100';
    return isDarkMode ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    if (!status) return isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100';
    
    switch (status.toUpperCase()) {
      case 'PUBLISHED': 
      case 'APPROVED':
        return isDarkMode ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-100';
      case 'DRAFT':
      case 'PENDING':
        return isDarkMode ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-600 bg-yellow-100';
      case 'REJECTED':
        return isDarkMode ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-100';
      default: 
        return isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      // Implement PDF generation using the generateTranscript method
      await ResultService.generateTranscript(student.id, {
        include_assessment_details: true,
        include_comments: true,
        include_subject_remarks: true,
        format: 'PDF'
      });
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  // Render appropriate result template
  const getResultTemplate = () => {
    const commonStudentData = {
      name: student.full_name,
      class: student.student_class,
      term: selections.term,
      academicSession: selections.academicSession,
      resultType: selections.resultType
    };

    switch (educationLevel) {
      case 'NURSERY':
        return (
          <NurseryResult 
            studentData={{
              ...commonStudentData,
              date: new Date().toLocaleDateString(),
              house: 'Blue House', // Consider making this dynamic
              timesOpened: '120', // Consider making this dynamic
              timesPresent: '115' // Consider making this dynamic
            }} 
            subjectResults={results}
            termResults={termResults}
          />
        );

      case 'PRIMARY':
        return (
          <PrimaryResult 
            studentData={commonStudentData} 
            subjectResults={results}
            termResults={termResults}
          />
        );

      case 'JUNIOR_SECONDARY':
        return (
          <JuniorSecondaryResult 
            studentData={commonStudentData} 
            subjectResults={results}
            termResults={termResults}
          />
        );

      case 'SENIOR_SECONDARY':
        if (selections.resultType === 'annually') {
          return (
            <SeniorSecondarySessionResult 
              studentData={commonStudentData} 
              subjectResults={results}
              termResults={termResults}
            />
          );
        } else {
          return (
            <SeniorSecondaryTermlyResult 
              studentData={commonStudentData} 
              subjectResults={results}
              termResults={termResults}
            />
          );
        }

      default:
        return <GenericResultDisplay />;
    }
  };

  // Generic fallback result display component
  const GenericResultDisplay = () => (
    <div className="space-y-6 print:space-y-4">
      {/* Print Header */}
      <div className="hidden print:block print:mb-6">
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">GOD'S TREASURE SCHOOLS</h1>
          <p className="text-gray-600">Student Result Report</p>
          <p className="text-sm text-gray-500 mt-2">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>Student Name:</strong> {student.full_name}</p>
            <p><strong>Username:</strong> {student.username}</p>
            <p><strong>Class:</strong> {student.student_class}</p>
          </div>
          <div>
            <p><strong>Academic Session:</strong> {selections.academicSession}</p>
            <p><strong>Term:</strong> {selections.term}</p>
            <p><strong>Education Level:</strong> {educationLevel}</p>
          </div>
        </div>
      </div>

      {/* Term Results Summary */}
      {termResults.length > 0 && (
        <div className={`${themeClasses.bgCard} rounded-lg p-6 border ${themeClasses.border} print:bg-white print:border-gray-300`}>
          <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4 flex items-center print:text-black`}>
            <Trophy className="w-5 h-5 text-blue-600 mr-2" />
            Term Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {termResults.map((termResult, index) => (
              <div key={termResult.id || index} className={`${themeClasses.bgSecondary} rounded-lg p-4 border ${themeClasses.border} print:border-gray-300 print:bg-gray-50`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${themeClasses.textSecondary} print:text-black`}>
                    {termResult.term} Term
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(termResult.status)} print:bg-gray-200 print:text-black`}>
                    {termResult.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${themeClasses.textSecondary} print:text-black`}>Total Subjects:</span>
                    <span className={`font-semibold ${themeClasses.textPrimary} print:text-black`}>{termResult.total_subjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${themeClasses.textSecondary} print:text-black`}>Passed:</span>
                    <span className="font-semibold text-green-600 print:text-black">{termResult.subjects_passed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${themeClasses.textSecondary} print:text-black`}>Failed:</span>
                    <span className="font-semibold text-red-600 print:text-black">{termResult.subjects_failed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${themeClasses.textSecondary} print:text-black`}>Average:</span>
                    <span className={`font-semibold ${themeClasses.textPrimary} print:text-black`}>{termResult.average_score?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${themeClasses.textSecondary} print:text-black`}>GPA:</span>
                    <span className={`font-semibold ${themeClasses.textPrimary} print:text-black`}>{termResult.gpa?.toFixed(2)}</span>
                  </div>
                  {termResult.class_position && (
                    <div className="flex justify-between">
                      <span className={`text-sm ${themeClasses.textSecondary} print:text-black`}>Position:</span>
                      <span className={`font-semibold ${themeClasses.textPrimary} print:text-black`}>
                        {termResult.class_position}/{termResult.total_students}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Subject Results */}
      {results.length > 0 && (
        <div className={`${themeClasses.bgCard} rounded-lg border ${themeClasses.border} overflow-hidden print:border-gray-300`}>
          <div className={`px-6 py-4 border-b ${themeClasses.border} print:border-gray-300`}>
            <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} print:text-black`}>
              Subject Results
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${themeClasses.bgSecondary} print:bg-gray-100`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider print:text-black print:border-b print:border-gray-300`}>
                    Subject
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider print:text-black print:border-b print:border-gray-300`}>
                    Total Score
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider print:text-black print:border-b print:border-gray-300`}>
                    Percentage
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider print:text-black print:border-b print:border-gray-300`}>
                    Grade
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider print:text-black print:border-b print:border-gray-300`}>
                    Position
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider print:text-black print:border-b print:border-gray-300`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className={`${themeClasses.bgCard} divide-y ${themeClasses.border.replace('border-', 'divide-')} print:divide-gray-300`}>
                {results.map((result, index) => (
                  <tr key={result.id || index} className={`hover:${themeClasses.bgSecondary} print:hover:bg-transparent`}>
                    <td className="px-6 py-4 whitespace-nowrap print:border-b print:border-gray-200">
                      <div>
                        <div className={`text-sm font-medium ${themeClasses.textPrimary} print:text-black`}>
                          {result.subject?.name || 'N/A'}
                        </div>
                        <div className={`text-sm ${themeClasses.textSecondary} print:text-gray-600`}>
                          {result.subject?.code || ''}
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${themeClasses.textPrimary} print:text-black print:border-b print:border-gray-200`}>
                      {result.total_score ?? 0}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textPrimary} print:text-black print:border-b print:border-gray-200`}>
                      {result.percentage?.toFixed(1) || '0.0'}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap print:border-b print:border-gray-200">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(result.grade)} print:bg-gray-200 print:text-black`}>
                        {result.grade || 'N/A'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textPrimary} print:text-black print:border-b print:border-gray-200`}>
                      {result.position ? `${result.position}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap print:border-b print:border-gray-200">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)} print:bg-gray-200 print:text-black`}>
                        {result.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className={themeClasses.textSecondary}>Loading results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h4 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-2`}>No Results Found</h4>
        <p className={`${themeClasses.textSecondary} mb-4`}>{error}</p>
        
        {/* Debug information in development */}
        {import.meta.env.DEV && debugInfo && (
          <details className="text-left max-w-2xl mx-auto">
            <summary className={`cursor-pointer ${themeClasses.textSecondary} mb-2`}>
              Debug Information (Development Only)
            </summary>
            <div className={`text-xs ${themeClasses.bgSecondary} p-4 rounded-lg`}>
              <pre className="whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Action Buttons - Hidden when printing */}
      <div className="flex items-center justify-end space-x-3 print:hidden">
        <button
          onClick={handlePrint}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${themeClasses.buttonSecondary}`}
        >
          <Printer size={16} />
          <span>Print</span>
        </button>
        <button
          onClick={handleDownload}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${themeClasses.buttonPrimary}`}
        >
          <Download size={16} />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Display the appropriate result template */}
      {getResultTemplate()}

      {/* Print Footer */}
      <div className="hidden print:block print:mt-8 print:pt-4 print:border-t print:border-gray-300">
        <div className="text-center text-sm text-gray-500">
          <p>This is an official result document from GOD'S TREASURE SCHOOLS</p>
          <p>Generated by Admin Portal on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentResultDisplay;