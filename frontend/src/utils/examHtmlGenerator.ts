// // // utils/examHtmlGenerator.ts
// // import { Exam } from "../services/ExamService";

// // export function generateExamHtml(exam: Exam): string {
// //   const renderList = (title: string, questions: any[], renderer: (q: any, idx: number) => string) =>
// //     questions?.length
// //       ? `<div style="margin-top: 20px;"><h4 style="border-bottom: 2px solid #333; padding-bottom: 10px;">${title}</h4><ol>${questions.map(renderer).join("")}</ol></div>`
// //       : "";

// // interface ObjectiveQuestion {
// //     question?: string;
// //     optionA?: string;
// //     option_a?: string;
// //     optionB?: string;
// //     option_b?: string;
// //     optionC?: string;
// //     option_c?: string;
// //     optionD?: string;
// //     option_d?: string;
// //     marks?: number;
// // }

// // interface SubQuestion {
// //     question?: string;
// //     expected_points?: string | number;
// //     expectedPoints?: string | number;
// //     word_limit?: number;
// //     wordLimit?: number;
// //     marks?: number;
// // }

// // interface TheoryQuestion {
// //     question?: string;
// //     expected_points?: string | number;
// //     expectedPoints?: string | number;
// //     word_limit?: number;
// //     wordLimit?: number;
// //     marks?: number;
// //     subQuestions?: SubQuestion[];
// // }

// // interface PracticalQuestion {
// //     task?: string;
// //     question?: string;
// //     materials?: string;
// //     expected_outcome?: string;
// //     expectedOutcome?: string;
// //     time_limit?: string | number;
// //     timeLimit?: string | number;
// //     marks?: number;
// // }

// // interface CustomQuestion {
// //     question?: string;
// //     word_limit?: number;
// //     wordLimit?: number;
// //     marks?: number;
// // }

// // interface CustomSection {
// //     name?: string;
// //     instructions?: string;
// //     questions?: CustomQuestion[];
// // }

// // let html: string = `
// //     <!DOCTYPE html>
// //     <html>
// //     <head>
// //         <meta charset="UTF-8">
// //         <title>${exam.title}</title>
// //         <style>
// //             body { 
// //                 font-family: Arial, sans-serif; 
// //                 margin: 40px; 
// //                 line-height: 1.6;
// //                 color: #333;
// //             }
// //             h1 { 
// //                 border-bottom: 3px solid #007bff; 
// //                 padding-bottom: 10px;
// //                 margin-bottom: 20px;
// //             }
// //             h2, h4 { 
// //                 color: #0056b3;
// //                 margin-top: 20px;
// //             }
// //             .exam-header {
// //                 background-color: #f0f0f0;
// //                 padding: 15px;
// //                 border-radius: 5px;
// //                 margin-bottom: 20px;
// //             }
// //             .exam-header p {
// //                 margin: 5px 0;
// //             }
// //             .instructions {
// //                 background-color: #fff3cd;
// //                 padding: 15px;
// //                 border-left: 4px solid #ffc107;
// //                 margin: 15px 0;
// //                 border-radius: 3px;
// //             }
// //             .question {
// //                 margin-bottom: 15px;
// //                 page-break-inside: avoid;
// //             }
// //             .question ol { margin-top: 8px; }
// //             .question li { margin: 8px 0; }
// //             table {
// //                 border-collapse: collapse;
// //                 width: 100%;
// //                 margin: 10px 0;
// //             }
// //             table, th, td {
// //                 border: 1px solid #ddd;
// //             }
// //             th, td {
// //                 padding: 8px;
// //                 text-align: left;
// //             }
// //             img {
// //                 max-width: 100%;
// //                 height: auto;
// //                 margin: 10px 0;
// //             }
// //             @media print {
// //                 body { margin: 20px; }
// //                 .question { page-break-inside: avoid; }
// //             }
// //         </style>
// //     </head>
// //     <body>
// //         <h1>${exam.title}</h1>
        
// //         <div class="exam-header">
// //             <p><strong>Code:</strong> ${exam.code || "N/A"}</p>
// //             <p><strong>Subject:</strong> ${exam.subject_name || exam.subject || "N/A"}</p>
// //             <p><strong>Grade Level:</strong> ${exam.grade_level_name || exam.grade_level || "N/A"}</p>
// //             <p><strong>Exam Type:</strong> ${exam.exam_type_display || exam.exam_type || "N/A"}</p>
// //             <p><strong>Difficulty Level:</strong> ${exam.difficulty_level_display || exam.difficulty_level || "N/A"}</p>
// //             <p><strong>Date:</strong> ${exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : "N/A"}</p>
// //             <p><strong>Time:</strong> ${exam.start_time || "N/A"} - ${exam.end_time || "N/A"}</p>
// //             <p><strong>Duration:</strong> ${exam.duration_minutes || "N/A"} minutes</p>
// //             <p><strong>Total Marks:</strong> ${exam.total_marks || 0}</p>
// //             <p><strong>Pass Marks:</strong> ${exam.pass_marks || "N/A"}</p>
// //             ${exam.venue ? `<p><strong>Venue:</strong> ${exam.venue}</p>` : ""}
// //             ${exam.max_students ? `<p><strong>Max Students:</strong> ${exam.max_students}</p>` : ""}
// //         </div>

// //         ${
// //             exam.instructions
// //                 ? `<div class="instructions"><strong>General Instructions:</strong><br/>${exam.instructions}</div>`
// //                 : ""
// //         }

// //         ${
// //             exam.materials_allowed
// //                 ? `<div class="instructions"><strong>Materials Allowed:</strong><br/>${exam.materials_allowed}</div>`
// //                 : ""
// //         }

// //         ${
// //             exam.materials_provided
// //                 ? `<div class="instructions"><strong>Materials Provided:</strong><br/>${exam.materials_provided}</div>`
// //                 : ""
// //         }

// //         <!-- OBJECTIVE QUESTIONS SECTION -->
// //         ${
// //             exam.objective_questions?.length
// //                 ? `
// //                     <h2>Section A: Objective Questions</h2>
// //                     ${
// //                         exam.objective_instructions
// //                             ? `<div class="instructions">${exam.objective_instructions}</div>`
// //                             : ""
// //                     }
// //                     ${exam.objective_questions
// //                         .map(
// //                             (q: ObjectiveQuestion, idx: number) => `
// //                         <div class="question">
// //                             <strong>${idx + 1}. ${q.question || ""}</strong>
// //                             <ol type="A">
// //                                 <li>${q.optionA || q.option_a || ""}</li>
// //                                 <li>${q.optionB || q.option_b || ""}</li>
// //                                 <li>${q.optionC || q.option_c || ""}</li>
// //                                 <li>${q.optionD || q.option_d || ""}</li>
// //                             </ol>
// //                             <p style="margin-top: 10px; color: #666;"><em>Marks: ${q.marks || 1}</em></p>
// //                         </div>
// //                     `
// //                         )
// //                         .join("")}
// //                 `
// //                 : ""
// //         }

// //         <!-- THEORY QUESTIONS SECTION -->
// //         ${
// //             exam.theory_questions?.length
// //                 ? `
// //                     <h2>Section B: Theory Questions</h2>
// //                     ${
// //                         exam.theory_instructions
// //                             ? `<div class="instructions">${exam.theory_instructions}</div>`
// //                             : ""
// //                     }
// //                     ${exam.theory_questions
// //                         .map(
// //                             (q: TheoryQuestion, idx: number) => `
// //                         <div class="question">
// //                             <strong>${idx + 1}. ${q.question || ""}</strong>
// //                             ${q.expectedPoints ? `<p><strong>Expected Points:</strong> ${q.expected_points || q.expectedPoints}</p>` : ""}
// //                             ${q.wordLimit || q.word_limit ? `<p><strong>Word Limit:</strong> ${q.word_limit || q.wordLimit} words</p>` : ""}
// //                             <p style="margin-top: 10px; color: #666;"><em>Marks: ${q.marks || 1}</em></p>
// //                             ${
// //                                 q.subQuestions && q.subQuestions.length
// //                                     ? `
//                                 // <div style="margin-left: 20px; margin-top: 10px;">
//                                 //     <strong>Sub-questions:</strong>
//                                 //     <ol>
//                                 //         ${q.subQuestions
//                                 //             .map(
//                                 //                 (sq: SubQuestion) => `
//                                 //             <li>
//                                 //                 ${sq.question || ""}
//                                 //                 ${sq.expectedPoints ? `<br/><em>Expected: ${sq.expected_points || sq.expectedPoints}</em>` : ""}
//                                 //                 ${sq.wordLimit || sq.word_limit ? `<br/><em>Word Limit: ${sq.word_limit || sq.wordLimit}</em>` : ""}
//                                 //                 <br/><em>Marks: ${sq.marks || 1}</em>
//                                 //             </li>
//                                 //         `
//                                 //             )
//                                 //             .join("")}
//                                 //     </ol>
//                                 // </div>
// //                             `
// //                                     : ""
// //                             }
// //                         </div>
// //                     `
// //                         )
// //                         .join("")}
// //                 `
// //                 : ""
// //         }

// //         <!-- PRACTICAL QUESTIONS SECTION -->
// //         ${
// //             exam.practical_questions?.length
// //                 ? `
// //                     <h2>Section C: Practical Questions</h2>
// //                     ${
// //                         exam.practical_instructions
// //                             ? `<div class="instructions">${exam.practical_instructions}</div>`
// //                             : ""
// //                     }
// //                     ${exam.practical_questions
// //                         .map(
// //                             (q: PracticalQuestion, idx: number) => `
// //                         <div class="question">
// //                             <strong>${idx + 1}. ${q.task || q.question || ""}</strong>
// //                             ${q.materials ? `<p><strong>Materials Required:</strong> ${q.materials}</p>` : ""}
// //                             ${q.expectedOutcome || q.expected_outcome ? `<p><strong>Expected Outcome:</strong> ${q.expected_outcome || q.expectedOutcome}</p>` : ""}
// //                             ${q.timeLimit || q.time_limit ? `<p><strong>Time Limit:</strong> ${q.time_limit || q.timeLimit}</p>` : ""}
// //                             <p style="margin-top: 10px; color: #666;"><em>Marks: ${q.marks || 1}</em></p>
// //                         </div>
// //                     `
// //                         )
// //                         .join("")}
// //                 `
// //                 : ""
// //         }

// //         <!-- CUSTOM SECTIONS -->
// //         ${
// //             exam.custom_sections?.length
// //                 ? exam.custom_sections
// //                         .map(
// //                             (section: CustomSection, sidx: number) => `
// //                     <h2>Section ${String.fromCharCode(68 + sidx)}: ${section.name || "Custom Section"}</h2>
// //                     ${
// //                         section.instructions
// //                             ? `<div class="instructions">${section.instructions}</div>`
// //                             : ""
// //                     }
// //                     ${
// //                         section.questions && section.questions.length
// //                             ? section.questions
// //                                     .map(
// //                                         (q: CustomQuestion, qidx: number) => `
// //                                 <div class="question">
// //                                     <strong>${qidx + 1}. ${q.question || ""}</strong>
// //                                     ${q.wordLimit || q.word_limit ? `<p><strong>Word Limit:</strong> ${q.word_limit || q.wordLimit} words</p>` : ""}
// //                                     <p style="margin-top: 10px; color: #666;"><em>Marks: ${q.marks || 1}</em></p>
// //                                 </div>
// //                             `
// //                                     )
// //                                     .join("")
// //                             : ""
// //                     }
// //                 `
// //                         )
// //                         .join("")
// //                 : ""
// //         }

// //         <!-- FOOTER -->
// //         <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px;">
// //             <p>This is an exam paper generated on ${new Date().toLocaleString()}</p>
// //             <p>Status: ${exam.status_display || exam.status}</p>
// //         </div>
// //     </body>
// //     </html>
// // `;

// //   return html;
// // }

// // utils/examHtmlGenerator.ts
// // utils/examHtmlGenerator.ts
// import { Exam } from "../services/ExamService";
// import { useSettings } from '@/contexts/SettingsContext';

// export function generateExamHtml(exam: Exam, copyType: "student" | "teacher" = "student"): string {
//      const { settings } = useSettings();

// // Use dynamic school information from settings
//     const schoolName = settings?.school_name || 'School Name';
//     const schoolAddress = settings?.address || 'School Address';
//     const academicSession = settings?.academicYear || 'Academic Year';
//     const currentTerm = settings?.currentTerm || 'Current Term';
    
//     // Get grade level name (handle both flat and nested structures)
//     const gradeLevelName = exam.grade_level_name || exam.grade_level?.name || 'Class';
    
//     // Get subject name (handle both flat and nested structures)
//     const subjectName = exam.subject_name || exam.subject?.name || 'Subject';

//   let html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <title>${exam.title} - ${copyType === "student" ? "Student Copy" : "Teacher's Copy"}</title>
//       <style>
//         body { 
//         body::before {
//       content: "${schoolName}";
//       position: fixed;
//       top: 40%;
//       left: 50%;
//       transform: translate(-50%, -50%) rotate(-30deg);
//       font-size: 60px;
//       color: #cccccc;
//       opacity: 0.12;
//       z-index: 0;
//       pointer-events: none;
//       white-space: pre;
//       width: 100vw;
//       text-align: center;
//       font-weight: bold;
//       user-select: none;
//     }
//           font-family: Arial, sans-serif; 
//           margin: 40px; 
//           line-height: 1.6;
//           color: #333;
//         }
//         .copy-header {
//           text-align: center;
//           color: #666;
//           font-size: 12px;
//           margin-bottom: 7px;
//           font-style: italic;
//         }
//         h1 { 
//           border-bottom: 3px solid #007bff; 
//           padding-bottom: 10px;
//           margin-bottom: 20px;
//         }

//         .school-name { font-weight: bold; font-size: 20px; margin-bottom: 2px; text-align: center; }
//         .school-address { font-size: 12px; margin-bottom: 2px; text-align: center; }
//         .exam-title { font-size: 12px; font-weight: bold; margin-bottom: 2px;text-align: center; }
//         h2, h4 { 
//           color: #0056b3;
//           margin-top: 5px;
//         }
//         .exam-header {
//           background-color: #f0f0f0;
//           padding: 10px;
//           border-radius: 5px;
//           margin-bottom: 7px;
//         }
//         .exam-header p {
//           margin: 3px 0;
//         }
//         .instructions {
//           background-color: #fff3cd;
//           padding: 5px;
//           border-left: 3px solid #ffc107;
//           margin: 5px 0;
//           border-radius: 3px;
//         }
//         .question {
//           margin-bottom: 5px;
//           page-break-inside: avoid;
//         }
//         .options-row {
//           display: flex;
//           gap: 8px;
//           margin-top: 8px;
//           flex-wrap: wrap;
//         }
//         .option {
//           flex: 1;
//           min-width: 50px;
//           padding: 8px;
//           background-color: #fafafa;
//         }
//         .option-letter {
//           font-weight: bold;
//           color: #0056b3;
//         }
//         .correct-answer {
//           background-color: #d4edda;
//           border: 2px solid #28a745;
//           color: #155724;
//           font-weight: bold;
//           margin-top: 10px;
//           padding: 8px;
//           border-radius: 4px;
//         }
//         .expected-points {
//           background-color: #e7f3ff;
//           border-left: 4px solid #007bff;
//           padding: 8px;
//           margin-top: 8px;
//           font-size: 12px;
//         }
//         table {
//           border-collapse: collapse;
//           width: 100%;
//           margin: 10px 0;
//         }
//         table, th, td {
//           border: 1px solid #ddd;
//         }
//         th, td {
//           padding: 8px;
//           text-align: left;
//         }
//         img {
//           max-width: 100%;
//           height: auto;
//           margin: 10px 0;
//         }
//         .marks {
//           color: #666;
//           font-size: 12px;
//           margin-top: 8px;
//         }
//         .teacher-only {
//           display: ${copyType === "teacher" ? "block" : "none"};
//         }
//         @media print {
//           body { margin: 5px; }
//           .question { page-break-inside: avoid; }
//         }
//       </style>
//     </head>
//     <body>      
//       <div class="header">
//     <div class="school-name">${schoolName}</div>
//     <div class="school-address">${schoolAddress}</div>
//     <div class="exam-title">${currentTerm} EXAMINATION  ${academicSession} ACADEMIC SESSION</div>
//   </div>
//   <table class="exam-details-table">
//     <tr>
//       <td class="label">CLASS:</td>
//       <td class="value">${gradeLevelName}</td>
//       <td class="label">TIME:</td>
//       <td class="value">${exam.duration_minutes} minutes</td>
//     </tr>
//     <tr>
//       <td class="label">SUBJECT:</td>
//       <td class="value">${subjectName}</td>
//       <td class="label">DATE:</td>
//       <td class="value">${exam.exam_date}</td>
//     </tr>
//   </table>
//   <div class="student-info">
//     <span class="label">STUDENT NAME:</span> ________________________________________________
//   </div>

//       ${exam.instructions ? `<div class="instructions"><strong>General Instructions:</strong><br/>${exam.instructions}</div>` : ""}

//       ${exam.materials_allowed ? `<div class="instructions"><strong>Materials Allowed:</strong><br/>${exam.materials_allowed}</div>` : ""}

//       ${exam.materials_provided && copyType === "teacher" ? `<div class="instructions teacher-only"><strong>Materials Provided:</strong><br/>${exam.materials_provided}</div>` : ""}

//       <!-- OBJECTIVE QUESTIONS SECTION -->
//       ${
//         exam.objective_questions?.length
//           ? `
//             <h4>Section A: Objective Questions</h4>
//             ${exam.objective_instructions ? `<div class="instructions">${exam.objective_instructions}</div>` : ""}
//             ${exam.objective_questions
//               .map(
//                 (q: any, idx: number) => `
//               <div class="question">
//                 <strong>${idx + 1}. ${q.question || ""}</strong>
//                 <div class="options-row">
//                   <div class="option"><span class="option-letter">A)</span> ${q.optionA || q.option_a || ""}</div>
//                   <div class="option"><span class="option-letter">B)</span> ${q.optionB || q.option_b || ""}</div>
//                   <div class="option"><span class="option-letter">C)</span> ${q.optionC || q.option_c || ""}</div>
//                   <div class="option"><span class="option-letter">D)</span> ${q.optionD || q.option_d || ""}</div>
//                 </div>
//                 ${copyType === "teacher" && (q.marks || 1) ? ` <div class="marks">Marks: ${q.marks || 1}</div>` : ""}
//                 ${copyType === "teacher" && (q.correctAnswer || q.correct_answer) ? `<div class="correct-answer">✓ Correct Answer: ${q.correctAnswer || q.correct_answer}</div>` : ""}
//               </div>
//             `
//               )
//               .join("")}
//           `
//           : ""
//       }

//       <!-- THEORY QUESTIONS SECTION -->
//       ${
//         exam.theory_questions?.length
//           ? `
//             <h4>Section B: Theory Questions</h4>
//             ${exam.theory_instructions ? `<div class="instructions">${exam.theory_instructions}</div>` : ""}
//             ${exam.theory_questions
//               .map(
//                 (q: any, idx: number) => `
//               <div class="question">
//                 <strong>${idx + 1}. ${q.question || ""}</strong>
//                 ${copyType === "teacher" && (q.wordLimit || q.word_limit) ? `<p><strong>Word Limit:</strong> ${q.word_limit || q.wordLimit} words</p>` : ""}
//                 ${copyType === "teacher" && (q.marks || 1) ? ` <div class="marks">Marks: ${q.marks || 1}</div>` : ""}
//                 ${copyType === "teacher" && (q.expectedPoints || q.expected_points) ? `<div class="expected-points"><strong>Expected Points:</strong><br/>${q.expected_points || q.expectedPoints}</div>` : ""}
//                 ${
//                   q.subQuestions && q.subQuestions.length
//                     ? `
//                   <div style="margin-left: 20px; margin-top: 10px;">
//                     <strong>Sub-questions:</strong>
//                     <ol>
//                       ${q.subQuestions
//                         .map(
//                           (sq: any) => `
//                         <li>
//                           ${sq.question || ""}
//                           ${copyType === "teacher" && (sq.wordLimit || sq.word_limit) ? `<br/><em>Word Limit: ${sq.word_limit || sq.wordLimit}</em>` : ""}
//                           ${copyType === "teacher" && (q.marks || 1) ? ` <div class="marks">Marks: ${q.marks || 1}</div>` : ""}
                          
//                           ${copyType === "teacher" && (sq.expectedPoints || sq.expected_points) ? `<div class="expected-points" style="margin-top: 5px; margin-left: 10px;"><strong>Expected:</strong> ${sq.expected_points || sq.expectedPoints}</div>` : ""}
//                         </li>
//                       `
//                         )
//                         .join("")}
//                     </ol>
//                   </div>
//                 `
//                     : ""
//                 }
//               </div>
//             `
//               )
//               .join("")}
//           `
//           : ""
//       }

//       <!-- PRACTICAL QUESTIONS SECTION -->
//       ${
//         exam.practical_questions?.length
//           ? `
//             <h4>Section C: Practical Questions</h4>
//             ${exam.practical_instructions ? `<div class="instructions">${exam.practical_instructions}</div>` : ""}
//             ${exam.practical_questions
//               .map(
//                 (q: any, idx: number) => `
//               <div class="question">
//                 <strong>${idx + 1}. ${q.task || q.question || ""}</strong>
//                 ${q.materials ? `<p><strong>Materials Required:</strong> ${q.materials}</p>` : ""}
//                 ${q.timeLimit || q.time_limit ? `<p><strong>Time Limit:</strong> ${q.time_limit || q.timeLimit}</p>` : ""}
//                 ${copyType === "teacher" && (q.marks || 1) ? ` <div class="marks">Marks: ${q.marks || 1}</div>` : ""}
//                 ${copyType === "teacher" && (q.expectedOutcome || q.expected_outcome) ? `<div class="expected-points"><strong>Expected Outcome:</strong><br/>${q.expected_outcome || q.expectedOutcome}</div>` : ""}
//               </div>
//             `
//               )
//               .join("")}
//           `
//           : ""
//       }

//       <!-- CUSTOM SECTIONS -->
//       ${
//         exam.custom_sections?.length
//           ? exam.custom_sections
//               .map(
//                 (section: any, sidx: number) => `
//             <h4>Section ${String.fromCharCode(68 + sidx)}: ${section.name || "Custom Section"}</h4>
//             ${section.instructions ? `<div class="instructions">${section.instructions}</div>` : ""}
//             ${
//               section.questions && section.questions.length
//                 ? section.questions
//                     .map(
//                       (q: any, qidx: number) => `
//                   <div class="question">
//                     <strong>${qidx + 1}. ${q.question || ""}</strong>
//                     ${q.wordLimit || q.word_limit ? `<p><strong>Word Limit:</strong> ${q.word_limit || q.wordLimit} words</p>` : ""}
//                    ${copyType === "teacher" && (q.marks || 1) ? ` <div class="marks">Marks: ${q.marks || 1}</div>` : ""}
//                   </div>
//                 `
//                     )
//                     .join("")
//                 : ""
//             }
//           `
//               )
//               .join("")
//           : ""
//       }

//       <!-- FOOTER -->
//       <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px;">
//         <p>Generated on ${new Date().toLocaleString()}</p>
//         <p><strong>${copyType === "student" ? "STUDENT COPY" : "TEACHER'S COPY WITH MARKING SCHEME"}</strong></p>
//       </div>
//     </body>
//     </html>
//   `;

//   return html;
// }

// utils/examHtmlGenerator.ts
import { Exam } from "../services/ExamService";
import { useSettings } from '@/contexts/SettingsContext';

// Helper function to convert numbers to Roman numerals
function toRomanNumeral(num: number): string {
  const romanNumerals: [number, string][] = [
    [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']
  ];
  let result = '';
  for (const [value, numeral] of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

export function generateExamHtml(exam: Exam, copyType: "student" | "teacher" = "student"): string {
  const { settings } = useSettings();

  // Use dynamic school information from settings
  const schoolName = settings?.school_name || 'School Name';
  const schoolAddress = settings?.address || 'School Address';
  const academicSession = settings?.academicYear || 'Academic Year';
  const currentTerm = settings?.currentTerm || 'Current Term';
  
  // Get grade level name (handle both flat and nested structures)
  const gradeLevelName = exam.grade_level_name || exam.grade_level?.name || 'Class';
  
  // Get subject name (handle both flat and nested structures)
  const subjectName = exam.subject_name || exam.subject?.name || 'Subject';

  // Format date
  const examDate = exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'TBA';

  if (copyType === "teacher") {
    return generateTeacherCopy(exam, schoolName, schoolAddress, academicSession, currentTerm, gradeLevelName, subjectName, examDate);
  }

  return generateStudentCopy(exam, schoolName, schoolAddress, academicSession, currentTerm, gradeLevelName, subjectName, examDate);
}

function generateStudentCopy(
  exam: Exam,
  schoolName: string,
  schoolAddress: string,
  academicSession: string,
  currentTerm: string,
  gradeLevelName: string,
  subjectName: string,
  examDate: string
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${exam.title} - STUDENT COPY</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 15mm; 
      line-height: 1.3; 
      font-size: 14px; 
      position: relative; 
    }
    body::before {
      content: "${schoolName}";
      position: fixed;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 60px;
      color: #cccccc;
      opacity: 0.12;
      z-index: 0;
      pointer-events: none;
      white-space: pre;
      width: 100vw;
      text-align: center;
      font-weight: bold;
      user-select: none;
    }
    .header, .exam-details-table, .student-info, .section, .section h3, .section-instruction, .question {
      position: relative;
      z-index: 1;
    }
    .header { 
      text-align: center; 
      margin-bottom: 0; 
      border-bottom: none; 
      padding-bottom: 2px; 
      page-break-after: avoid; 
    }
    .school-name { font-weight: bold; font-size: 20px; margin-bottom: 2px; }
    .school-address { font-size: 13px; margin-bottom: 2px; }
    .exam-title { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
    .exam-details-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 2px 0 0 0; 
      font-size: 14px; 
      border-bottom: 1.5px solid #000; 
      page-break-after: avoid; 
    }
    .exam-details-table td { padding: 1px 4px; vertical-align: top; }
    .exam-details-table .label { font-weight: bold; width: 60px; }
    .exam-details-table .value { width: 120px; }
    .student-info { 
      margin: 2px 0 2px 0; 
      padding-bottom: 2px; 
      font-size: 14px; 
      border-bottom: none; 
    }
    .section { margin: 6px 0; page-break-inside: avoid; }
    .section h3 { 
      background-color: #f0f0f0; 
      padding: 4px 8px; 
      margin: 6px 0 4px 0; 
      border-left: 4px solid #333; 
      font-size: 16px; 
      font-weight: bold; 
    }
    .section-instruction { 
      margin: 4px 0 6px 0; 
      font-weight: bold; 
      font-size: 13px; 
      background-color: #fff3cd;
      padding: 6px 8px;
      border-left: 3px solid #ffc107;
      border-radius: 3px;
    }
    .question { margin: 4px 0; padding-left: 8px; }
    .options { 
      margin-left: 16px; 
      margin-top: 2px; 
      font-size: 13px; 
      display: flex; 
      justify-content: flex-start; 
      gap: 2px; 
      flex-wrap: wrap; 
    }
    .options > div { margin-right: 8px; }
    .sub-questions { margin-left: 16px; margin-top: 3px; }
    @media print { 
      body { margin: 10mm; font-size: 14px; } 
      .section { page-break-inside: avoid; } 
      .question { page-break-inside: avoid; } 
      .header, .exam-details-table { page-break-after: avoid; } 
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="school-name">${schoolName}</div>
    <div class="school-address">${schoolAddress}</div>
    <div class="exam-title">${currentTerm} EXAMINATION ${academicSession} ACADEMIC SESSION</div>
  </div>
  
  <table class="exam-details-table">
    <tr>
      <td class="label">CLASS:</td>
      <td class="value">${gradeLevelName}</td>
      <td class="label">TIME:</td>
      <td class="value">${exam.duration_minutes} minutes</td>
    </tr>
    <tr>
      <td class="label">SUBJECT:</td>
      <td class="value">${subjectName}</td>
      <td class="label">DATE:</td>
      <td class="value">${examDate}</td>
    </tr>
  </table>
  
  <div class="student-info">
    <span class="label">STUDENT NAME:</span> ________________________________________________
  </div>

  ${exam.instructions ? `
  <div class="section">
    <h3>GENERAL INSTRUCTIONS</h3>
    <div class="section-instruction">${exam.instructions}</div>
  </div>
  ` : ''}

  ${exam.materials_allowed ? `
  <div class="section">
    <h3>MATERIALS ALLOWED</h3>
    <div class="section-instruction">${exam.materials_allowed}</div>
  </div>
  ` : ''}

  ${exam.objective_questions?.length ? `
  <div class="section">
    <h3>SECTION A: OBJECTIVE QUESTIONS</h3>
    ${exam.objective_instructions ? `<div class="section-instruction">${exam.objective_instructions}</div>` : ''}
    ${exam.objective_questions.map((q: any, index: number) => `
    <div class="question">
      <strong>${index + 1}.</strong> ${q.question}
      <div class="options">
        ${q.optionA || q.option_a ? `<div>A. ${q.optionA || q.option_a}</div>` : ''}
        ${q.optionB || q.option_b ? `<div>B. ${q.optionB || q.option_b}</div>` : ''}
        ${q.optionC || q.option_c ? `<div>C. ${q.optionC || q.option_c}</div>` : ''}
        ${q.optionD || q.option_d ? `<div>D. ${q.optionD || q.option_d}</div>` : ''}
      </div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${exam.theory_questions?.length ? `
  <div class="section">
    <h3>SECTION B: THEORY QUESTIONS</h3>
    ${exam.theory_instructions ? `<div class="section-instruction">${exam.theory_instructions}</div>` : ''}
    ${exam.theory_questions.map((q: any, index: number) => `
    <div class="question">
      <strong>${index + 1}.</strong> ${q.question}
      ${q.subQuestions && q.subQuestions.length ? `
      <div class="sub-questions">
        ${q.subQuestions.map((sq: any, sqIndex: number) => `
        <div class="question">
          <strong>${index + 1}${String.fromCharCode(97 + sqIndex)}.</strong> ${sq.question}
          ${sq.subSubQuestions && sq.subSubQuestions.length ? `
          <div class="sub-questions">
            ${sq.subSubQuestions.map((ssq: any, ssqIndex: number) => `
            <div class="question">
              <strong>${index + 1}${String.fromCharCode(97 + sqIndex)}${toRomanNumeral(ssqIndex + 1)}.</strong> ${ssq.question}
            </div>
            `).join('')}
          </div>
          ` : ''}
        </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${exam.practical_questions?.length ? `
  <div class="section">
    <h3>SECTION C: PRACTICAL QUESTIONS</h3>
    ${exam.practical_instructions ? `<div class="section-instruction">${exam.practical_instructions}</div>` : ''}
    ${exam.practical_questions.map((q: any, index: number) => `
    <div class="question">
      <strong>${index + 1}.</strong> ${q.task || q.question}
      ${q.materials ? `<div style="margin-left: 16px; margin-top: 4px;"><strong>Materials:</strong> ${q.materials}</div>` : ''}
      ${q.timeLimit || q.time_limit ? `<div style="margin-left: 16px;"><strong>Time Limit:</strong> ${q.timeLimit || q.time_limit}</div>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${exam.custom_sections?.length ? exam.custom_sections.map((section: any, sectionIndex: number) => `
  <div class="section">
    <h3>SECTION ${String.fromCharCode(68 + sectionIndex)}: ${section.name.toUpperCase()}</h3>
    ${section.instructions ? `<div class="section-instruction">${section.instructions}</div>` : ''}
    ${section.questions && section.questions.length ? section.questions.map((q: any, qIndex: number) => `
    <div class="question">
      <strong>${qIndex + 1}.</strong> ${q.question}
    </div>
    `).join('') : ''}
  </div>
  `).join('') : ''}

  <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px;">
    <p>Generated on ${new Date().toLocaleString()}</p>
    <p><strong>STUDENT COPY</strong></p>
  </div>
</body>
</html>`;
}

function generateTeacherCopy(
  exam: Exam,
  schoolName: string,
  schoolAddress: string,
  academicSession: string,
  currentTerm: string,
  gradeLevelName: string,
  subjectName: string,
  examDate: string
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${exam.title} - TEACHER MARKING PAPER</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 15mm; 
      line-height: 1.3; 
      font-size: 14px; 
      position: relative; 
    }
    body::before {
      content: "${schoolName} - TEACHER COPY";
      position: fixed;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 60px;
      color: #cccccc;
      opacity: 0.12;
      z-index: 0;
      pointer-events: none;
      white-space: pre;
      width: 100vw;
      text-align: center;
      font-weight: bold;
      user-select: none;
    }
    .header, .exam-details-table, .student-info, .section, .section h3, .section-instruction, .question, .options, .sub-questions, .answer, .expected-points {
      position: relative;
      z-index: 1;
    }
    .header { 
      text-align: center; 
      margin-bottom: 0; 
      border-bottom: none; 
      padding-bottom: 2px; 
      page-break-after: avoid; 
    }
    .school-name { font-weight: bold; font-size: 20px; margin-bottom: 2px; }
    .school-address { font-size: 13px; margin-bottom: 2px; }
    .exam-title { font-size: 14px; font-weight: bold; margin-bottom: 2px; color: #d32f2f; }
    .exam-details-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 2px 0 0 0; 
      font-size: 14px; 
      border-bottom: 1.5px solid #000; 
      page-break-after: avoid; 
    }
    .exam-details-table td { padding: 1px 4px; vertical-align: top; }
    .exam-details-table .label { font-weight: bold; width: 60px; }
    .exam-details-table .value { width: 120px; }
    .student-info { 
      margin: 2px 0 2px 0; 
      padding-bottom: 2px; 
      font-size: 14px; 
      border-bottom: none; 
    }
    .section { margin: 6px 0; page-break-inside: avoid; }
    .section h3 { 
      background-color: #f0f0f0; 
      padding: 4px 8px; 
      margin: 6px 0 4px 0; 
      border-left: 4px solid #333; 
      font-size: 16px; 
      font-weight: bold; 
    }
    .section-instruction { 
      margin: 4px 0 6px 0; 
      font-weight: bold; 
      font-size: 13px; 
    }
    .question { margin: 4px 0; padding-left: 8px; }
    .options { 
      margin-left: 16px; 
      margin-top: 2px; 
      font-size: 13px; 
      display: flex; 
      justify-content: flex-start; 
      gap: 2px; 
      flex-wrap: wrap; 
    }
    .options > div { margin-right: 8px; }
    .sub-questions { margin-left: 16px; margin-top: 3px; }
    .answer { 
      background-color: #e8f5e8; 
      padding: 4px 8px; 
      margin: 4px 0; 
      border-left: 3px solid #4caf50; 
      font-weight: bold; 
    }
    .expected-points { 
      background-color: #fff3e0; 
      padding: 4px 8px; 
      margin: 4px 0; 
      border-left: 3px solid #ff9800; 
      font-style: italic; 
    }
    @media print { 
      body { margin: 10mm; font-size: 14px; } 
      .section { page-break-inside: avoid; } 
      .question { page-break-inside: avoid; } 
      .header, .exam-details-table { page-break-after: avoid; } 
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="school-name">${schoolName}</div>
    <div class="school-address">${schoolAddress}</div>
    <div class="exam-title">${currentTerm} ${academicSession} - TEACHER MARKING PAPER</div>
  </div>
  
  <table class="exam-details-table">
    <tr>
      <td class="label">CLASS:</td>
      <td class="value">${gradeLevelName}</td>
      <td class="label">TIME:</td>
      <td class="value">${exam.duration_minutes} minutes</td>
    </tr>
    <tr>
      <td class="label">SUBJECT:</td>
      <td class="value">${subjectName}</td>
      <td class="label">DATE:</td>
      <td class="value">${examDate}</td>
    </tr>
  </table>
  
  <div class="student-info">
    <span class="label">STUDENT NAME:</span> ________________________________________________
  </div>

  <div class="section">
    <h3>EXAM INSTRUCTIONS</h3>
    <div class="section-instruction">${exam.instructions || 'No specific instructions provided.'}</div>
  </div>

  <div class="section">
    <h3>EXAM DETAILS</h3>
    <div class="section-instruction">
      <strong>Total Marks:</strong> ${exam.total_marks}<br>
      <strong>Pass Marks:</strong> ${exam.pass_marks || 'N/A'}<br>
      <strong>Duration:</strong> ${exam.duration_minutes} minutes<br>
      <strong>Venue:</strong> ${exam.venue || 'To be announced'}<br>
      <strong>Materials Allowed:</strong> ${exam.materials_allowed || 'None specified'}<br>
      <strong>Materials Provided:</strong> ${exam.materials_provided || 'None specified'}
    </div>
  </div>

  ${exam.objective_questions?.length ? `
  <div class="section">
    <h3>SECTION A: OBJECTIVE QUESTIONS - ANSWERS</h3>
    ${exam.objective_instructions ? `<div class="section-instruction">${exam.objective_instructions}</div>` : ''}
    ${exam.objective_questions.map((q: any, index: number) => `
    <div class="question">
      <strong>${index + 1}.</strong> ${q.question}
      <div class="options">
        ${q.optionA || q.option_a ? `<div>A. ${q.optionA || q.option_a}</div>` : ''}
        ${q.optionB || q.option_b ? `<div>B. ${q.optionB || q.option_b}</div>` : ''}
        ${q.optionC || q.option_c ? `<div>C. ${q.optionC || q.option_c}</div>` : ''}
        ${q.optionD || q.option_d ? `<div>D. ${q.optionD || q.option_d}</div>` : ''}
      </div>
      <div class="answer"><strong>Correct Answer:</strong> ${q.correctAnswer || q.correct_answer}</div>
      <div class="expected-points"><strong>Marks:</strong> ${q.marks || 1}</div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${exam.theory_questions?.length ? `
  <div class="section">
    <h3>SECTION B: THEORY QUESTIONS - MARKING GUIDE</h3>
    ${exam.theory_instructions ? `<div class="section-instruction">${exam.theory_instructions}</div>` : ''}
    ${exam.theory_questions.map((q: any, index: number) => `
    <div class="question">
      <strong>${index + 1}.</strong> ${q.question}
      ${q.expectedPoints || q.expected_points ? `<div class="expected-points"><strong>Expected Points:</strong> ${q.expectedPoints || q.expected_points}</div>` : ''}
      ${q.wordLimit || q.word_limit ? `<div class="section-instruction"><strong>Word Limit:</strong> ${q.wordLimit || q.word_limit} words</div>` : ''}
      <div class="expected-points"><strong>Marks:</strong> ${q.marks || 1}</div>
      ${q.subQuestions && q.subQuestions.length ? `
      <div class="sub-questions">
        ${q.subQuestions.map((sq: any, sqIndex: number) => `
        <div class="question">
          <strong>${index + 1}${String.fromCharCode(97 + sqIndex)}.</strong> ${sq.question}
          ${sq.expectedPoints || sq.expected_points ? `<div class="expected-points"><strong>Expected Points:</strong> ${sq.expectedPoints || sq.expected_points}</div>` : ''}
          ${sq.wordLimit || sq.word_limit ? `<div class="section-instruction"><strong>Word Limit:</strong> ${sq.wordLimit || sq.word_limit} words</div>` : ''}
          <div class="expected-points"><strong>Marks:</strong> ${sq.marks || 1}</div>
          ${sq.subSubQuestions && sq.subSubQuestions.length ? `
          <div class="sub-questions">
            ${sq.subSubQuestions.map((ssq: any, ssqIndex: number) => `
            <div class="question">
              <strong>${index + 1}${String.fromCharCode(97 + sqIndex)}${toRomanNumeral(ssqIndex + 1)}.</strong> ${ssq.question}
              ${ssq.expectedPoints || ssq.expected_points ? `<div class="expected-points"><strong>Expected Points:</strong> ${ssq.expectedPoints || ssq.expected_points}</div>` : ''}
              ${ssq.wordLimit || ssq.word_limit ? `<div class="section-instruction"><strong>Word Limit:</strong> ${ssq.wordLimit || ssq.word_limit} words</div>` : ''}
              <div class="expected-points"><strong>Marks:</strong> ${ssq.marks || 1}</div>
            </div>
            `).join('')}
          </div>
          ` : ''}
        </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${exam.practical_questions?.length ? `
  <div class="section">
    <h3>SECTION C: PRACTICAL QUESTIONS - MARKING GUIDE</h3>
    ${exam.practical_instructions ? `<div class="section-instruction">${exam.practical_instructions}</div>` : ''}
    ${exam.practical_questions.map((q: any, index: number) => `
    <div class="question">
      <strong>${index + 1}.</strong> ${q.task || q.question}
      ${q.materials ? `<div class="section-instruction"><strong>Materials:</strong> ${q.materials}</div>` : ''}
      ${q.expectedOutcome || q.expected_outcome ? `<div class="expected-points"><strong>Expected Outcome:</strong> ${q.expectedOutcome || q.expected_outcome}</div>` : ''}
      ${q.timeLimit || q.time_limit ? `<div class="section-instruction"><strong>Time Limit:</strong> ${q.timeLimit || q.time_limit}</div>` : ''}
      <div class="expected-points"><strong>Marks:</strong> ${q.marks || 1}</div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${exam.custom_sections?.length ? exam.custom_sections.map((section: any, sectionIndex: number) => `
  <div class="section">
    <h3>SECTION ${String.fromCharCode(68 + sectionIndex)}: ${section.name.toUpperCase()} - MARKING GUIDE</h3>
    ${section.instructions ? `<div class="section-instruction">${section.instructions}</div>` : ''}
    ${section.questions && section.questions.length ? section.questions.map((q: any, qIndex: number) => `
    <div class="question">
      <strong>${qIndex + 1}.</strong> ${q.question}
      ${q.wordLimit || q.word_limit ? `<div class="section-instruction"><strong>Word Limit:</strong> ${q.wordLimit || q.word_limit} words</div>` : ''}
      <div class="expected-points"><strong>Marks:</strong> ${q.marks || 1}</div>
    </div>
    `).join('') : ''}
  </div>
  `).join('') : ''}

  <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px;">
    <p>Generated on ${new Date().toLocaleString()}</p>
    <p><strong>TEACHER'S COPY WITH MARKING SCHEME</strong></p>
  </div>
</body>
</html>`;
}