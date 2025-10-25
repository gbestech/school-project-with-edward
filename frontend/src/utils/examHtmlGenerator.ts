// // utils/examHtmlGenerator.ts
// import { Exam } from "../services/ExamService";
// import { useSettings } from '@/contexts/SettingsContext';


// // Helper function to convert numbers to Roman numerals
// function toRomanNumeral(num: number): string {
//   const romanNumerals: [number, string][] = [
//     [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']
//   ];
//   let result = '';
//   for (const [value, numeral] of romanNumerals) {
//     while (num >= value) {
//       result += numeral;
//       num -= value;
//     }
//   }
//   return result;
// }

// // Helper function to process and render rich content (images, tables, formatted text)
// function renderRichContent(content: string): string {
//   if (!content) return '';
  
//   // Handle images - look for image URLs or base64 data
//   let processedContent = content.replace(
//     /<img\s+[^>]*src="([^"]*)"[^>]*>/gi,
//     '<img src="$1" style="max-width: 100%; height: auto; margin: 10px 0; display: block;" />'
//   );
  
//   // Handle tables - ensure proper styling
//   processedContent = processedContent.replace(
//     /<table/gi,
//     '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;"'
//   );
  
//   processedContent = processedContent.replace(
//     /<th/gi,
//     '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0; text-align: left; font-weight: bold;"'
//   );
  
//   processedContent = processedContent.replace(
//     /<td/gi,
//     '<td style="border: 1px solid #ddd; padding: 8px; text-align: left;"'
//   );
  
//   return processedContent;
// }

// export function generateExamHtml(
//   exam: Exam, 
//   copyType: "student" | "teacher" = "student",
//   settings?: any
// ): string {
//   // Use dynamic school information from settings
//   const schoolName = settings?.school_name || 'School Name';
//   const schoolAddress = settings?.address || 'School Address';
//   const academicSession = settings?.academicYear || 'Academic Year';
//   const currentTerm = settings?.currentTerm || 'Current Term';
  
//   // Get grade level name (handle both flat and nested structures)
//   const gradeLevelName = exam.grade_level_name || exam.grade_level?.name || 'Class';
  
//   // Get subject name (handle both flat and nested structures)
//   const subjectName = exam.subject_name || exam.subject?.name || 'Subject';

//   // Format date
//   const examDate = exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'TBA';

//   if (copyType === "teacher") {
//     return generateTeacherCopy(exam, schoolName, schoolAddress, academicSession, currentTerm, gradeLevelName, subjectName, examDate);
//   }

//   return generateStudentCopy(exam, schoolName, schoolAddress, academicSession, currentTerm, gradeLevelName, subjectName, examDate);
// }

// function generateStudentCopy(
//   exam: Exam,
//   schoolName: string,
//   schoolAddress: string,
//   academicSession: string,
//   currentTerm: string,
//   gradeLevelName: string,
//   subjectName: string,
//   examDate: string
// ): string {
//   return `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <title>${exam.title} - STUDENT COPY</title>
//   <style>
//     body { 
//       font-family: Arial, sans-serif; 
//       margin: 15mm; 
//       line-height: 1.3; 
//       font-size: 14px; 
//       position: relative; 
//     }
//     body::before {
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
//     .header, .exam-details-table, .student-info, .section, .section h3, .section-instruction, .question {
//       position: relative;
//       z-index: 1;
//     }
//     .header { 
//       text-align: center; 
//       margin-bottom: 0; 
//       border-bottom: none; 
//       padding-bottom: 2px; 
//       page-break-after: avoid; 
//     }
//     .school-name { font-weight: bold; font-size: 20px; margin-bottom: 2px; }
//     .school-address { font-size: 13px; margin-bottom: 2px; }
//     .exam-title { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
//     .exam-details-table { 
//       width: 100%; 
//       border-collapse: collapse; 
//       margin: 2px 0 0 0; 
//       font-size: 14px; 
//       border-bottom: 1.5px solid #000; 
//       page-break-after: avoid; 
//     }
//     .exam-details-table td { padding: 1px 4px; vertical-align: top; }
//     .exam-details-table .label { font-weight: bold; width: 60px; }
//     .exam-details-table .value { width: 120px; }
//     .student-info { 
//       margin: 2px 0 2px 0; 
//       padding-bottom: 2px; 
//       font-size: 14px; 
//       border-bottom: none; 
//     }
//     .section { margin: 6px 0; page-break-inside: avoid; }
//     .section h3 { 
//       background-color: #f0f0f0; 
//       padding: 4px 8px; 
//       margin: 6px 0 4px 0; 
//       border-left: 4px solid #333; 
//       font-size: 16px; 
//       font-weight: bold; 
//     }
//     .section-instruction { 
//       margin: 4px 0 6px 0; 
//       font-weight: bold; 
//       font-size: 13px; 
//       background-color: #fff3cd;
//       padding: 6px 8px;
//       border-left: 3px solid #ffc107;
//       border-radius: 3px;
//     }
//     .question { margin: 4px 0; padding-left: 8px; }
//     .question-content {
//       margin: 4px 0;
//     }
//     .question-content img {
//       max-width: 100%;
//       height: auto;
//       margin: 10px 0;
//       display: block;
//       border: 1px solid #ddd;
//       border-radius: 4px;
//       padding: 4px;
//     }
//     .question-content table {
//       border-collapse: collapse;
//       width: 100%;
//       margin: 10px 0;
//       border: 1px solid #ddd;
//     }
//     .question-content th {
//       border: 1px solid #ddd;
//       padding: 8px;
//       background-color: #f0f0f0;
//       text-align: left;
//       font-weight: bold;
//     }
//     .question-content td {
//       border: 1px solid #ddd;
//       padding: 8px;
//       text-align: left;
//     }
//     .options { 
//       margin-left: 16px; 
//       margin-top: 2px; 
//       font-size: 13px; 
//       display: flex; 
//       justify-content: flex-start; 
//       gap: 2px; 
//       flex-wrap: wrap; 
//     }
//     .options > div { margin-right: 8px; }
//     .sub-questions { margin-left: 16px; margin-top: 3px; }
//     @media print { 
//       body { margin: 10mm; font-size: 14px; } 
//       .section { page-break-inside: avoid; } 
//       .question { page-break-inside: avoid; } 
//       .header, .exam-details-table { page-break-after: avoid; }
//       .question-content img { max-width: 90%; page-break-inside: avoid; }
//     }
//   </style>
// </head>
// <body>
//   <div class="header">
//     <div class="school-name">${schoolName}</div>
//     <div class="school-address">${schoolAddress}</div>
//     <div class="exam-title">${currentTerm} EXAMINATION ${academicSession} ACADEMIC SESSION</div>
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
//       <td class="value">${examDate}</td>
//     </tr>
//   </table>
  
//   <div class="student-info">
//     <span class="label">STUDENT NAME:</span> ________________________________________________
//   </div>

//   ${exam.instructions ? `
//   <div class="section">
//     <h3>GENERAL INSTRUCTIONS</h3>
//     <div class="section-instruction">${renderRichContent(exam.instructions)}</div>
//   </div>
//   ` : ''}

//   ${exam.materials_allowed ? `
//   <div class="section">
//     <h3>MATERIALS ALLOWED</h3>
//     <div class="section-instruction">${renderRichContent(exam.materials_allowed)}</div>
//   </div>
//   ` : ''}

//   ${exam.objective_questions?.length ? `
//   <div class="section">
//     <h3>SECTION A: OBJECTIVE QUESTIONS</h3>
//     ${exam.objective_instructions ? `<div class="section-instruction">${renderRichContent(exam.objective_instructions)}</div>` : ''}
//     ${exam.objective_questions.map((q: any, index: number) => `
//     <div class="question">
//       <strong>${index + 1}.</strong> 
//       <div class="question-content">${renderRichContent(q.question)}</div>
//       ${q.image ? `<div class="question-content"><img src="${q.image}" alt="Question ${index + 1} Image" /></div>` : ''}
//       ${q.table ? `<div class="question-content">${renderRichContent(q.table)}</div>` : ''}
//       <div class="options">
//         ${q.optionA || q.option_a ? `<div>A. ${renderRichContent(q.optionA || q.option_a)}</div>` : ''}
//         ${q.optionB || q.option_b ? `<div>B. ${renderRichContent(q.optionB || q.option_b)}</div>` : ''}
//         ${q.optionC || q.option_c ? `<div>C. ${renderRichContent(q.optionC || q.option_c)}</div>` : ''}
//         ${q.optionD || q.option_d ? `<div>D. ${renderRichContent(q.optionD || q.option_d)}</div>` : ''}
//       </div>
//     </div>
//     `).join('')}
//   </div>
//   ` : ''}

//   ${exam.theory_questions?.length ? `
//   <div class="section">
//     <h3>SECTION B: THEORY QUESTIONS</h3>
//     ${exam.theory_instructions ? `<div class="section-instruction">${renderRichContent(exam.theory_instructions)}</div>` : ''}
//     ${exam.theory_questions.map((q: any, index: number) => `
//     <div class="question">
//       <strong>${index + 1}.</strong> 
//       <div class="question-content">${renderRichContent(q.question)}</div>
//       ${q.image ? `<div class="question-content"><img src="${q.image}" alt="Question ${index + 1} Image" /></div>` : ''}
//       ${q.table ? `<div class="question-content">${renderRichContent(q.table)}</div>` : ''}
//       ${q.subQuestions && q.subQuestions.length ? `
//       <div class="sub-questions">
//         ${q.subQuestions.map((sq: any, sqIndex: number) => `
//         <div class="question">
//           <strong>${index + 1}${String.fromCharCode(97 + sqIndex)}.</strong> 
//           <div class="question-content">${renderRichContent(sq.question)}</div>
//           ${sq.image ? `<div class="question-content"><img src="${sq.image}" alt="Sub-question ${index + 1}${String.fromCharCode(97 + sqIndex)} Image" /></div>` : ''}
//           ${sq.table ? `<div class="question-content">${renderRichContent(sq.table)}</div>` : ''}
//           ${sq.subSubQuestions && sq.subSubQuestions.length ? `
//           <div class="sub-questions">
//             ${sq.subSubQuestions.map((ssq: any, ssqIndex: number) => `
//             <div class="question">
//               <strong>${index + 1}${String.fromCharCode(97 + sqIndex)}${toRomanNumeral(ssqIndex + 1)}.</strong> 
//               <div class="question-content">${renderRichContent(ssq.question)}</div>
//               ${ssq.image ? `<div class="question-content"><img src="${ssq.image}" alt="Sub-sub-question Image" /></div>` : ''}
//               ${ssq.table ? `<div class="question-content">${renderRichContent(ssq.table)}</div>` : ''}
//             </div>
//             `).join('')}
//           </div>
//           ` : ''}
//         </div>
//         `).join('')}
//       </div>
//       ` : ''}
//     </div>
//     `).join('')}
//   </div>
//   ` : ''}

//   ${exam.practical_questions?.length ? `
//   <div class="section">
//     <h3>SECTION C: PRACTICAL QUESTIONS</h3>
//     ${exam.practical_instructions ? `<div class="section-instruction">${renderRichContent(exam.practical_instructions)}</div>` : ''}
//     ${exam.practical_questions.map((q: any, index: number) => `
//     <div class="question">
//       <strong>${index + 1}.</strong> 
//       <div class="question-content">${renderRichContent(q.task || q.question)}</div>
//       ${q.image ? `<div class="question-content"><img src="${q.image}" alt="Practical Question ${index + 1} Image" /></div>` : ''}
//       ${q.table ? `<div class="question-content">${renderRichContent(q.table)}</div>` : ''}
//       ${q.materials ? `<div style="margin-left: 16px; margin-top: 4px;"><strong>Materials:</strong> ${renderRichContent(q.materials)}</div>` : ''}
//       ${q.timeLimit || q.time_limit ? `<div style="margin-left: 16px;"><strong>Time Limit:</strong> ${q.timeLimit || q.time_limit}</div>` : ''}
//     </div>
//     `).join('')}
//   </div>
//   ` : ''}

//   ${exam.custom_sections?.length ? exam.custom_sections.map((section: any, sectionIndex: number) => `
//   <div class="section">
//     <h3>SECTION ${String.fromCharCode(68 + sectionIndex)}: ${section.name.toUpperCase()}</h3>
//     ${section.instructions ? `<div class="section-instruction">${renderRichContent(section.instructions)}</div>` : ''}
//     ${section.questions && section.questions.length ? section.questions.map((q: any, qIndex: number) => `
//     <div class="question">
//       <strong>${qIndex + 1}.</strong> 
//       <div class="question-content">${renderRichContent(q.question)}</div>
//       ${q.image ? `<div class="question-content"><img src="${q.image}" alt="Question ${qIndex + 1} Image" /></div>` : ''}
//       ${q.table ? `<div class="question-content">${renderRichContent(q.table)}</div>` : ''}
//     </div>
//     `).join('') : ''}
//   </div>
//   `).join('') : ''}

//   <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px;">
//     <p>Generated on ${new Date().toLocaleString()}</p>
//     <p><strong>STUDENT COPY</strong></p>
//   </div>
// </body>
// </html>`;
// }

// function generateTeacherCopy(
//   exam: Exam,
//   schoolName: string,
//   schoolAddress: string,
//   academicSession: string,
//   currentTerm: string,
//   gradeLevelName: string,
//   subjectName: string,
//   examDate: string
// ): string {
//   return `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <title>${exam.title} - TEACHER MARKING PAPER</title>
//   <style>
//     body { 
//       font-family: Arial, sans-serif; 
//       margin: 15mm; 
//       line-height: 1.3; 
//       font-size: 14px; 
//       position: relative; 
//     }
//     body::before {
//       content: "${schoolName} - TEACHER COPY";
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
//     .header, .exam-details-table, .student-info, .section, .section h3, .section-instruction, .question, .options, .sub-questions, .answer, .expected-points {
//       position: relative;
//       z-index: 1;
//     }
//     .header { 
//       text-align: center; 
//       margin-bottom: 0; 
//       border-bottom: none; 
//       padding-bottom: 2px; 
//       page-break-after: avoid; 
//     }
//     .school-name { font-weight: bold; font-size: 20px; margin-bottom: 2px; }
//     .school-address { font-size: 13px; margin-bottom: 2px; }
//     .exam-title { font-size: 14px; font-weight: bold; margin-bottom: 2px; color: #d32f2f; }
//     .exam-details-table { 
//       width: 100%; 
//       border-collapse: collapse; 
//       margin: 2px 0 0 0; 
//       font-size: 14px; 
//       border-bottom: 1.5px solid #000; 
//       page-break-after: avoid; 
//     }
//     .exam-details-table td { padding: 1px 4px; vertical-align: top; }
//     .exam-details-table .label { font-weight: bold; width: 60px; }
//     .exam-details-table .value { width: 120px; }
//     .student-info { 
//       margin: 2px 0 2px 0; 
//       padding-bottom: 2px; 
//       font-size: 14px; 
//       border-bottom: none; 
//     }
//     .section { margin: 6px 0; page-break-inside: avoid; }
//     .section h3 { 
//       background-color: #f0f0f0; 
//       padding: 4px 8px; 
//       margin: 6px 0 4px 0; 
//       border-left: 4px solid #333; 
//       font-size: 16px; 
//       font-weight: bold; 
//     }
//     .section-instruction { 
//       margin: 4px 0 6px 0; 
//       font-weight: bold; 
//       font-size: 13px; 
//     }
//     .question { margin: 4px 0; padding-left: 8px; }
//     .question-content {
//       margin: 4px 0;
//     }
//     .question-content img {
//       max-width: 100%;
//       height: auto;
//       margin: 10px 0;
//       display: block;
//       border: 1px solid #ddd;
//       border-radius: 4px;
//       padding: 4px;
//     }
//     .question-content table {
//       border-collapse: collapse;
//       width: 100%;
//       margin: 10px 0;
//       border: 1px solid #ddd;
//     }
//     .question-content th {
//       border: 1px solid #ddd;
//       padding: 8px;
//       background-color: #f0f0f0;
//       text-align: left;
//       font-weight: bold;
//     }
//     .question-content td {
//       border: 1px solid #ddd;
//       padding: 8px;
//       text-align: left;
//     }
//     .options { 
//       margin-left: 16px; 
//       margin-top: 2px; 
//       font-size: 13px; 
//       display: flex; 
//       justify-content: flex-start; 
//       gap: 2px; 
//       flex-wrap: wrap; 
//     }
//     .options > div { margin-right: 8px; }
//     .sub-questions { margin-left: 16px; margin-top: 3px; }
//     .answer { 
//       background-color: #e8f5e8; 
//       padding: 4px 8px; 
//       margin: 4px 0; 
//       border-left: 3px solid #4caf50; 
//       font-weight: bold; 
//     }
//     .expected-points { 
//       background-color: #fff3e0; 
//       padding: 4px 8px; 
//       margin: 4px 0; 
//       border-left: 3px solid #ff9800; 
//       font-style: italic; 
//     }
//     @media print { 
//       body { margin: 10mm; font-size: 14px; } 
//       .section { page-break-inside: avoid; } 
//       .question { page-break-inside: avoid; } 
//       .header, .exam-details-table { page-break-after: avoid; }
//       .question-content img { max-width: 90%; page-break-inside: avoid; }
//     }
//   </style>
// </head>
// <body>
//   <div class="header">
//     <div class="school-name">${schoolName}</div>
//     <div class="school-address">${schoolAddress}</div>
//     <div class="exam-title">${currentTerm} ${academicSession} - TEACHER MARKING PAPER</div>
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
//       <td class="value">${examDate}</td>
//     </tr>
//   </table>
  
//   <div class="student-info">
//     <span class="label">STUDENT NAME:</span> ________________________________________________
//   </div>

//   <div class="section">
//     <h3>EXAM INSTRUCTIONS</h3>
//     <div class="section-instruction">${renderRichContent(exam.instructions || 'No specific instructions provided.')}</div>
//   </div>

//   <div class="section">
//     <h3>EXAM DETAILS</h3>
//     <div class="section-instruction">
//       <strong>Total Marks:</strong> ${exam.total_marks}<br>
//       <strong>Pass Marks:</strong> ${exam.pass_marks || 'N/A'}<br>
//       <strong>Duration:</strong> ${exam.duration_minutes} minutes<br>
//       <strong>Venue:</strong> ${exam.venue || 'To be announced'}<br>
//       <strong>Materials Allowed:</strong> ${renderRichContent(exam.materials_allowed || 'None specified')}<br>
//       <strong>Materials Provided:</strong> ${renderRichContent(exam.materials_provided || 'None specified')}
//     </div>
//   </div>

//   ${exam.objective_questions?.length ? `
//   <div class="section">
//     <h3>SECTION A: OBJECTIVE QUESTIONS - ANSWERS</h3>
//     ${exam.objective_instructions ? `<div class="section-instruction">${renderRichContent(exam.objective_instructions)}</div>` : ''}
//     ${exam.objective_questions.map((q: any, index: number) => `
//     <div class="question">
//       <strong>${index + 1}.</strong> 
//       <div class="question-content">${renderRichContent(q.question)}</div>
//       ${q.image ? `<div class="question-content"><img src="${q.image}" alt="Question ${index + 1} Image" /></div>` : ''}
//       ${q.table ? `<div class="question-content">${renderRichContent(q.table)}</div>` : ''}
//       <div class="options">
//         ${q.optionA || q.option_a ? `<div>A. ${renderRichContent(q.optionA || q.option_a)}</div>` : ''}
//         ${q.optionB || q.option_b ? `<div>B. ${renderRichContent(q.optionB || q.option_b)}</div>` : ''}
//         ${q.optionC || q.option_c ? `<div>C. ${renderRichContent(q.optionC || q.option_c)}</div>` : ''}
//         ${q.optionD || q.option_d ? `<div>D. ${renderRichContent(q.optionD || q.option_d)}</div>` : ''}
//       </div>
//       <div class="answer"><strong>Correct Answer:</strong> ${q.correctAnswer || q.correct_answer}</div>
//       <div class="expected-points"><strong>Marks:</strong> ${q.marks || 1}</div>
//     </div>
//     `).join('')}
//   </div>
//   ` : ''}

//   ${exam.theory_questions?.length ? `
//   <div class="section">
//     <h3>SECTION B: THEORY QUESTIONS - MARKING GUIDE</h3>
//     ${exam.theory_instructions ? `<div class="section-instruction">${exam.theory_instructions}</div>` : ''}
//     ${exam.theory_questions.map((q: any, index: number) => `
//     <div class="question">
//       <strong>${index + 1}.</strong> ${q.question}
//       ${q.expectedPoints || q.expected_points ? `<div class="expected-points"><strong>Expected Points:</strong> ${q.expectedPoints || q.expected_points}</div>` : ''}
//       ${q.wordLimit || q.word_limit ? `<div class="section-instruction"><strong>Word Limit:</strong> ${q.wordLimit || q.word_limit} words</div>` : ''}
//       <div class="expected-points"><strong>Marks:</strong> ${q.marks || 1}</div>
//       ${q.subQuestions && q.subQuestions.length ? `
//       <div class="sub-questions">
//         ${q.subQuestions.map((sq: any, sqIndex: number) => `
//         <div class="question">
//           <strong>${index + 1}${String.fromCharCode(97 + sqIndex)}.</strong> ${sq.question}
//           ${sq.expectedPoints || sq.expected_points ? `<div class="expected-points"><strong>Expected Points:</strong> ${sq.expectedPoints || sq.expected_points}</div>` : ''}
//           ${sq.wordLimit || sq.word_limit ? `<div class="section-instruction"><strong>Word Limit:</strong> ${sq.wordLimit || sq.word_limit} words</div>` : ''}
//           <div class="expected-points"><strong>Marks:</strong> ${sq.marks || 1}</div>
//           ${sq.subSubQuestions && sq.subSubQuestions.length ? `
//           <div class="sub-questions">
//             ${sq.subSubQuestions.map((ssq: any, ssqIndex: number) => `
//             <div class="question">
//               <strong>${index + 1}${String.fromCharCode(97 + sqIndex)}${toRomanNumeral(ssqIndex + 1)}.</strong> ${ssq.question}
//               ${ssq.image ? `<div class="question-content"><img src="${ssq.image}" alt="Sub-sub-question Image" /></div>` : ''}
//               ${ssq.table ? `<div class="question-content">${renderRichContent(ssq.table)}</div>` : ''}
//               ${ssq.expectedPoints || ssq.expected_points ? `<div class="expected-points"><strong>Expected Points:</strong> ${ssq.expectedPoints || ssq.expected_points}</div>` : ''}
//               ${ssq.wordLimit || ssq.word_limit ? `<div class="section-instruction"><strong>Word Limit:</strong> ${ssq.wordLimit || ssq.word_limit} words</div>` : ''}
//               <div class="expected-points"><strong>Marks:</strong> ${ssq.marks || 1}</div>
//             </div>
//             `).join('')}
//           </div>
//           ` : ''}
//         </div>
//         `).join('')}
//       </div>
//       ` : ''}
//     </div>
//     `).join('')}
//   </div>
//   ` : ''}

//   ${exam.practical_questions?.length ? `
//   <div class="section">
//     <h3>SECTION C: PRACTICAL QUESTIONS - MARKING GUIDE</h3>
//     ${exam.practical_instructions ? `<div class="section-instruction">${exam.practical_instructions}</div>` : ''}
//     ${exam.practical_questions.map((q: any, index: number) => `
//     <div class="question">
//       <strong>${index + 1}.</strong> ${q.task || q.question}
//       ${q.materials ? `<div class="section-instruction"><strong>Materials:</strong> ${q.materials}</div>` : ''}
//       ${q.expectedOutcome || q.expected_outcome ? `<div class="expected-points"><strong>Expected Outcome:</strong> ${q.expectedOutcome || q.expected_outcome}</div>` : ''}
//       ${q.timeLimit || q.time_limit ? `<div class="section-instruction"><strong>Time Limit:</strong> ${q.timeLimit || q.time_limit}</div>` : ''}
//       <div class="expected-points"><strong>Marks:</strong> ${q.marks || 1}</div>
//     </div>
//     `).join('')}
//   </div>
//   ` : ''}

//   ${exam.custom_sections?.length ? exam.custom_sections.map((section: any, sectionIndex: number) => `
//   <div class="section">
//     <h3>SECTION ${String.fromCharCode(68 + sectionIndex)}: ${section.name.toUpperCase()} - MARKING GUIDE</h3>
//     ${section.instructions ? `<div class="section-instruction">${section.instructions}</div>` : ''}
//     ${section.questions && section.questions.length ? section.questions.map((q: any, qIndex: number) => `
//     <div class="question">
//       <strong>${qIndex + 1}.</strong> ${q.question}
//       ${q.wordLimit || q.word_limit ? `<div class="section-instruction"><strong>Word Limit:</strong> ${q.wordLimit || q.word_limit} words</div>` : ''}
//       <div class="expected-points"><strong>Marks:</strong> ${q.marks || 1}</div>
//     </div>
//     `).join('') : ''}
//   </div>
//   `).join('') : ''}

//   <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px;">
//     <p>Generated on ${new Date().toLocaleString()}</p>
//     <p><strong>TEACHER'S COPY WITH MARKING SCHEME</strong></p>
//   </div>
// </body>
// </html>`;
// }



// utils/examHtmlGenerator.ts
// utils/examHtmlGenerator.ts
import { Exam } from "../services/ExamService";

// Helper function to safely convert any value to string
function safeString(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

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

// Helper function to process and render rich content (images, tables, formatted text)
function renderRichContent(content: any): string {
  // CRITICAL FIX: Convert to string first
  const contentStr = safeString(content);
  
  if (!contentStr) return '';
  
  // Handle images - look for image URLs or base64 data
  let processedContent = contentStr.replace(
    /<img\s+[^>]*src="([^"]*)"[^>]*>/gi,
    '<img src="$1" style="max-width: 100%; height: auto; margin: 10px 0; display: block;" />'
  );
  
  // Handle tables - ensure proper styling
  processedContent = processedContent.replace(
    /<table/gi,
    '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;"'
  );
  
  processedContent = processedContent.replace(
    /<th/gi,
    '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0; text-align: left; font-weight: bold;"'
  );
  
  processedContent = processedContent.replace(
    /<td/gi,
    '<td style="border: 1px solid #ddd; padding: 8px; text-align: left;"'
  );
  
  return processedContent;
}

export function generateExamHtml(
  exam: Exam, 
  copyType: "student" | "teacher" = "student",
  settings?: any
): string {
  // Use dynamic school information from settings
  const schoolName = safeString(settings?.school_name || 'School Name');
  const schoolAddress = safeString(settings?.address || 'School Address');
  const academicSession = safeString(settings?.academicYear || 'Academic Year');
  const currentTerm = safeString(settings?.currentTerm || 'Current Term');
  
  // Get grade level name (handle both flat and nested structures)
  const gradeLevelName = safeString(exam.grade_level_name || exam.grade_level?.name || 'Class');
  
  // Get subject name (handle both flat and nested structures)
  const subjectName = safeString(exam.subject_name || exam.subject?.name || 'Subject');

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
  <title>${safeString(exam.title)} - STUDENT COPY</title>
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
    .question-content {
      margin: 4px 0;
    }
    .question-content img {
      max-width: 100%;
      height: auto;
      margin: 10px 0;
      display: block;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px;
    }
    .question-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 10px 0;
      border: 1px solid #ddd;
    }
    .question-content th {
      border: 1px solid #ddd;
      padding: 8px;
      background-color: #f0f0f0;
      text-align: left;
      font-weight: bold;
    }
    .question-content td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    .options { 
      margin-left: 16px; 
      margin-top: 4px; 
      font-size: 13px; 
    }
    .options > div { 
      margin: 2px 0; 
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    .sub-questions { margin-left: 16px; margin-top: 3px; }
    @media print { 
      body { margin: 10mm; font-size: 14px; } 
      .section { page-break-inside: avoid; } 
      .question { page-break-inside: avoid; } 
      .header, .exam-details-table { page-break-after: avoid; }
      .question-content img { max-width: 90%; page-break-inside: avoid; }
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
      <td class="value">${safeString(exam.duration_minutes)} minutes</td>
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
    <div class="section-instruction">${renderRichContent(exam.instructions)}</div>
  </div>
  ` : ''}

  ${exam.materials_allowed ? `
  <div class="section">
    <h3>MATERIALS ALLOWED</h3>
    <div class="section-instruction">${renderRichContent(exam.materials_allowed)}</div>
  </div>
  ` : ''}

  ${exam.objective_questions?.length ? `
  <div class="section">
    <h3>SECTION A: OBJECTIVE QUESTIONS</h3>
    ${exam.objective_instructions ? `<div class="section-instruction">${renderRichContent(exam.objective_instructions)}</div>` : ''}
    ${exam.objective_questions.map((q: any, index: number) => `
    <div class="question">
      <strong>${index + 1}.</strong> 
      <div class="question-content">${renderRichContent(q.question)}</div>
      ${q.image ? `<div class="question-content"><img src="${safeString(q.image)}" alt="Question ${index + 1} Image" /></div>` : ''}
      ${q.table ? `<div class="question-content">${renderRichContent(q.table)}</div>` : ''}
      <div class="options">
        ${q.optionA || q.option_a ? `<div>A. ${renderRichContent(q.optionA || q.option_a)}</div>` : ''}
        ${q.optionB || q.option_b ? `<div>B. ${renderRichContent(q.optionB || q.option_b)}</div>` : ''}
        ${q.optionC || q.option_c ? `<div>C. ${renderRichContent(q.optionC || q.option_c)}</div>` : ''}
        ${q.optionD || q.option_d ? `<div>D. ${renderRichContent(q.optionD || q.option_d)}</div>` : ''}
      </div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${exam.theory_questions?.length ? `
  <div class="section">
    <h3>SECTION B: THEORY QUESTIONS</h3>
    ${exam.theory_instructions ? `<div class="section-instruction">${renderRichContent(exam.theory_instructions)}</div>` : ''}
    ${exam.theory_questions.map((q: any, index: number) => `
    <div class="question">
      <strong>${index + 1}.</strong> 
      <div class="question-content">${renderRichContent(q.question)}</div>
      ${q.image ? `<div class="question-content"><img src="${safeString(q.image)}" alt="Question ${index + 1} Image" /></div>` : ''}
      ${q.table ? `<div class="question-content">${renderRichContent(q.table)}</div>` : ''}
      ${q.subQuestions && q.subQuestions.length ? `
      <div class="sub-questions">
        ${q.subQuestions.map((sq: any, sqIndex: number) => `
        <div class="question">
          <strong>${index + 1}${String.fromCharCode(97 + sqIndex)}.</strong> 
          <div class="question-content">${renderRichContent(sq.question)}</div>
          ${sq.image ? `<div class="question-content"><img src="${safeString(sq.image)}" alt="Sub-question ${index + 1}${String.fromCharCode(97 + sqIndex)} Image" /></div>` : ''}
          ${sq.table ? `<div class="question-content">${renderRichContent(sq.table)}</div>` : ''}
          ${sq.subSubQuestions && sq.subSubQuestions.length ? `
          <div class="sub-questions">
            ${sq.subSubQuestions.map((ssq: any, ssqIndex: number) => `
            <div class="question">
              <strong>${index + 1}${String.fromCharCode(97 + sqIndex)}${toRomanNumeral(ssqIndex + 1)}.</strong> 
              <div class="question-content">${renderRichContent(ssq.question)}</div>
              ${ssq.image ? `<div class="question-content"><img src="${safeString(ssq.image)}" alt="Sub-sub-question Image" /></div>` : ''}
              ${ssq.table ? `<div class="question-content">${renderRichContent(ssq.table)}</div>` : ''}
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
    ${exam.practical_instructions ? `<div class="section-instruction">${renderRichContent(exam.practical_instructions)}</div>` : ''}
    ${exam.practical_questions.map((q: any, index: number) => `
    <div class="question">
      <strong>${index + 1}.</strong> 
      <div class="question-content">${renderRichContent(q.task || q.question)}</div>
      ${q.image ? `<div class="question-content"><img src="${safeString(q.image)}" alt="Practical Question ${index + 1} Image" /></div>` : ''}
      ${q.table ? `<div class="question-content">${renderRichContent(q.table)}</div>` : ''}
      ${q.materials ? `<div style="margin-left: 16px; margin-top: 4px;"><strong>Materials:</strong> ${renderRichContent(q.materials)}</div>` : ''}
      ${q.timeLimit || q.time_limit ? `<div style="margin-left: 16px;"><strong>Time Limit:</strong> ${safeString(q.timeLimit || q.time_limit)}</div>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${exam.custom_sections?.length ? exam.custom_sections.map((section: any, sectionIndex: number) => `
  <div class="section">
    <h3>SECTION ${String.fromCharCode(68 + sectionIndex)}: ${safeString(section.name).toUpperCase()}</h3>
    ${section.instructions ? `<div class="section-instruction">${renderRichContent(section.instructions)}</div>` : ''}
    ${section.questions && section.questions.length ? section.questions.map((q: any, qIndex: number) => `
    <div class="question">
      <strong>${qIndex + 1}.</strong> 
      <div class="question-content">${renderRichContent(q.question)}</div>
      ${q.image ? `<div class="question-content"><img src="${safeString(q.image)}" alt="Question ${qIndex + 1} Image" /></div>` : ''}
      ${q.table ? `<div class="question-content">${renderRichContent(q.table)}</div>` : ''}
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
  <title>${safeString(exam.title)} - TEACHER MARKING PAPER</title>
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
    .question-content {
      margin: 4px 0;
    }
    .question-content img {
      max-width: 100%;
      height: auto;
      margin: 10px 0;
      display: block;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px;
    }
    .question-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 10px 0;
      border: 1px solid #ddd;
    }
    .question-content th {
      border: 1px solid #ddd;
      padding: 8px;
      background-color: #f0f0f0;
      text-align: left;
      font-weight: bold;
    }
    .question-content td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    .options { 
      margin-left: 16px; 
      margin-top: 4px; 
      font-size: 13px; 
    }
    .options > div { 
      margin: 2px 0; 
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
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
      .question-content img { max-width: 90%; page-break-inside: avoid; }
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
      <td class="value">${safeString(exam.duration_minutes)} minutes</td>
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
    <div class="section-instruction">${renderRichContent(exam.instructions || 'No specific instructions provided.')}</div>
  </div>

  <div class="section">
    <h3>EXAM DETAILS</h3>
    <div class="section-instruction">
      <strong>Total Marks:</strong> ${safeString(exam.total_marks)}<br>
      <strong>Pass Marks:</strong> ${safeString(exam.pass_marks || 'N/A')}<br>
      <strong>Duration:</strong> ${safeString(exam.duration_minutes)} minutes<br>
      <strong>Venue:</strong> ${safeString(exam.venue || 'To be announced')}<br>
      <strong>Materials Allowed:</strong> ${renderRichContent(exam.materials_allowed || 'None specified')}<br>
      <strong>Materials Provided:</strong> ${renderRichContent(exam.materials_provided || 'None specified')}
    </div>
  </div>

  ${exam.objective_questions?.length ? `
  <div class="section">
    <h3>SECTION A: OBJECTIVE QUESTIONS - ANSWERS</h3>
    ${exam.objective_instructions ? `<div class="section-instruction">${renderRichContent(exam.objective_instructions)}</div>` : ''}
    ${exam.objective_questions.map((q: any, index: number) => `
    <div class="question">
      <strong>${index + 1}.</strong> 
      <div class="question-content">${renderRichContent(q.question)}</div>
      ${q.image ? `<div class="question-content"><img src="${safeString(q.image)}" alt="Question ${index + 1} Image" /></div>` : ''}
      ${q.table ? `<div class="question-content">${renderRichContent(q.table)}</div>` : ''}
      <div class="options">
        ${q.optionA || q.option_a ? `<div>A. ${renderRichContent(q.optionA || q.option_a)}</div>` : ''}
        ${q.optionB || q.option_b ? `<div>B. ${renderRichContent(q.optionB || q.option_b)}</div>` : ''}
        ${q.optionC || q.option_c ? `<div>C. ${renderRichContent(q.optionC || q.option_c)}</div>` : ''}
        ${q.optionD || q.option_d ? `<div>D. ${renderRichContent(q.optionD || q.option_d)}</div>` : ''}
      </div>
      <div class="answer"><strong>Correct Answer:</strong> ${safeString(q.correctAnswer || q.correct_answer)}</div>
      <div class="expected-points"><strong>Marks:</strong> ${safeString(q.marks || 1)}</div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${exam.theory_questions?.length ? `
  <div class="section">
    <h3>SECTION B: THEORY QUESTIONS - MARKING GUIDE</h3>
    ${exam.theory_instructions ? `<div class="section-instruction">${renderRichContent(exam.theory_instructions)}</div>` : ''}
    ${exam.theory_questions.map((q: any, index: number) => `
    <div class="question">
      <strong>${index + 1}.</strong> 
      <div class="question-content">${renderRichContent(q.question)}</div>
      ${q.image ? `<div class="question-content"><img src="${safeString(q.image)}" alt="Question ${index + 1} Image" /></div>` : ''}
      ${q.table ? `<div class="question-content">${renderRichContent(q.table)}</div>` : ''}
      ${q.expectedPoints || q.expected_points ? `<div class="expected-points"><strong>Expected Points:</strong> ${renderRichContent(q.expectedPoints || q.expected_points)}</div>` : ''}
      ${q.wordLimit || q.word_limit ? `<div class="section-instruction"><strong>Word Limit:</strong> ${safeString(q.wordLimit || q.word_limit)} words</div>` : ''}
      <div class="expected-points"><strong>Marks:</strong> ${safeString(q.marks || 1)}</div>
      ${q.subQuestions && q.subQuestions.length ? `
      <div class="sub-questions">
        ${q.subQuestions.map((sq: any, sqIndex: number) => `
        <div class="question">
          <strong>${index + 1}${String.fromCharCode(97 + sqIndex)}.</strong> 
          <div class="question-content">${renderRichContent(sq.question)}</div>
          ${sq.image ? `<div class="question-content"><img src="${safeString(sq.image)}" alt="Sub-question Image" /></div>` : ''}
          ${sq.table ? `<div class="question-content">${renderRichContent(sq.table)}</div>` : ''}
          ${sq.expectedPoints || sq.expected_points ? `<div class="expected-points"><strong>Expected Points:</strong> ${renderRichContent(sq.expectedPoints || sq.expected_points)}</div>` : ''}
          ${sq.wordLimit || sq.word_limit ? `<div class="section-instruction"><strong>Word Limit:</strong> ${safeString(sq.wordLimit || sq.word_limit)} words</div>` : ''}
          <div class="expected-points"><strong>Marks:</strong> ${safeString(sq.marks || 1)}</div>
          ${sq.subSubQuestions && sq.subSubQuestions.length ? `
          <div class="sub-questions">
            ${sq.subSubQuestions.map((ssq: any, ssqIndex: number) => `
            <div class="question">
              <strong>${index + 1}${String.fromCharCode(97 + sqIndex)}${toRomanNumeral(ssqIndex + 1)}.</strong> 
              <div class="question-content">${renderRichContent(ssq.question)}</div>
              ${ssq.image ? `<div class="question-content"><img src="${safeString(ssq.image)}" alt="Sub-sub-question Image" /></div>` : ''}
              ${ssq.table ? `<div class="question-content">${renderRichContent(ssq.table)}</div>` : ''}
              ${ssq.expectedPoints || ssq.expected_points ? `<div class="expected-points"><strong>Expected Points:</strong> ${renderRichContent(ssq.expectedPoints || ssq.expected_points)}</div>` : ''}
              ${ssq.wordLimit || ssq.word_limit ? `<div class="section-instruction"><strong>Word Limit:</strong> ${safeString(ssq.wordLimit || ssq.word_limit)} words</div>` : ''}
              <div class="expected-points"><strong>Marks:</strong> ${safeString(ssq.marks || 1)}</div>
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
    ${exam.practical_instructions ? `<div class="section-instruction">${renderRichContent(exam.practical_instructions)}</div>` : ''}
    ${exam.practical_questions.map((q: any, index: number) => `
    <div class="question">
      <strong>${index + 1}.</strong> 
      <div class="question-content">${renderRichContent(q.task || q.question)}</div>
      ${q.image ? `<div class="question-content"><img src="${safeString(q.image)}" alt="Practical Question ${index + 1} Image" /></div>` : ''}
      ${q.table ? `<div class="question-content">${renderRichContent(q.table)}</div>` : ''}
      ${q.materials ? `<div class="section-instruction"><strong>Materials:</strong> ${renderRichContent(q.materials)}</div>` : ''}
      ${q.expectedOutcome || q.expected_outcome ? `<div class="expected-points"><strong>Expected Outcome:</strong> ${renderRichContent(q.expectedOutcome || q.expected_outcome)}</div>` : ''}
      ${q.timeLimit || q.time_limit ? `<div class="section-instruction"><strong>Time Limit:</strong> ${safeString(q.timeLimit || q.time_limit)}</div>` : ''}
      <div class="expected-points"><strong>Marks:</strong> ${safeString(q.marks || 1)}</div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${exam.custom_sections?.length ? exam.custom_sections.map((section: any, sectionIndex: number) => `
  <div class="section">
    <h3>SECTION ${String.fromCharCode(68 + sectionIndex)}: ${safeString(section.name).toUpperCase()} - MARKING GUIDE</h3>
    ${section.instructions ? `<div class="section-instruction">${renderRichContent(section.instructions)}</div>` : ''}
    ${section.questions && section.questions.length ? section.questions.map((q: any, qIndex: number) => `
    <div class="question">
      <strong>${qIndex + 1}.</strong> 
      <div class="question-content">${renderRichContent(q.question)}</div>
      ${q.image ? `<div class="question-content"><img src="${safeString(q.image)}" alt="Question ${qIndex + 1} Image" /></div>` : ''}
      ${q.table ? `<div class="question-content">${renderRichContent(q.table)}</div>` : ''}
      ${q.wordLimit || q.word_limit ? `<div class="section-instruction"><strong>Word Limit:</strong> ${safeString(q.wordLimit || q.word_limit)} words</div>` : ''}
      <div class="expected-points"><strong>Marks:</strong> ${safeString(q.marks || 1)}</div>
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