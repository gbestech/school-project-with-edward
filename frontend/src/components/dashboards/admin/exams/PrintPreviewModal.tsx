// // components/PrintPreviewModal.tsx
// import React, { useState } from "react";
// import { Exam } from "@/services/ExamService";
// import { generateExamHtml } from "@/utils/examHtmlGenerator";

// interface Props {
//   open: boolean;
//   exam?: Exam | null;
//   onClose: () => void;
// }

// const PrintPreviewModal: React.FC<Props> = ({ open, exam, onClose }) => {
//   const [copyType, setCopyType] = useState<"student" | "teacher">("student");

//   if (!open || !exam) return null;

//   const html = generateExamHtml(exam, copyType);

//   const handlePrint = () => {
//     const printWin = window.open("");
//     if (printWin) {
//       printWin.document.write(html);
//       printWin.document.close();
//       printWin.focus();
//       printWin.print();
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-4xl">
        
//         {/* Modal Header */}
//         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center gap-4">
//           <div className="flex-1">
//             <h2 className="text-2xl font-bold text-gray-900">Print Preview</h2>
//             <p className="text-sm text-gray-600 mt-1">{exam.title}</p>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 text-3xl font-light flex-shrink-0"
//           >
//             ×
//           </button>
//         </div>

//         {/* Copy Type Selector */}
//         <div className="sticky top-16 bg-gray-50 border-b border-gray-200 px-6 py-4">
//           <div className="flex gap-4 items-center">
//             <span className="font-medium text-gray-700">View as:</span>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setCopyType("student")}
//                 className={`px-4 py-2 rounded-lg font-medium transition ${
//                   copyType === "student"
//                     ? "bg-blue-600 text-white"
//                     : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//                 }`}
//               >
//                 Student Copy
//               </button>
//               <button
//                 onClick={() => setCopyType("teacher")}
//                 className={`px-4 py-2 rounded-lg font-medium transition ${
//                   copyType === "teacher"
//                     ? "bg-green-600 text-white"
//                     : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//                 }`}
//               >
//                 Teacher's Copy
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Preview Content */}
//         <div className="p-6">
//           <div
//             className="prose prose-sm max-w-none bg-white p-8 border border-gray-200 rounded shadow-sm"
//             dangerouslySetInnerHTML={{ __html: html }}
//           />
//         </div>

//         {/* Modal Footer */}
//         <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
//           >
//             Close
//           </button>
//           <button
//             onClick={handlePrint}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
//           >
//             🖨️ Print {copyType === "teacher" ? "Teacher's Copy" : "Student Copy"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PrintPreviewModal;

// components/PrintPreviewModal.tsx
// import React, { useState } from "react";
// import { Exam } from "@/services/ExamService";
// import { generateExamHtml } from "@/utils/examHtmlGenerator";
// import { useSettings } from '@/contexts/SettingsContext';

// interface Props {
//   open: boolean;
//   exam?: Exam | null;
//   onClose: () => void;
// }

// const PrintPreviewModal: React.FC<Props> = ({ open, exam, onClose }) => {
//   const [copyType, setCopyType] = useState<"student" | "teacher">("student");
//   const { settings } = useSettings(); // Get settings from context
  
//   if (!open || !exam) return null;
  
  
// // Debug: Log exam data to console
//   console.log("🔍 Exam data for preview:", exam);
//   if (exam.objective_questions?.length > 0) {
//     console.log("📊 Sample objective question:", exam.objective_questions[0]);
//     console.log("🖼️ Image data:", exam.objective_questions[0].image);
//     console.log("📋 Table data:", exam.objective_questions[0].table);
//   }
//   if (exam.theory_questions?.length > 0) {
//     console.log("📝 Sample theory question:", exam.theory_questions[0]);
//   }

//   // Pass settings to generateExamHtml
//   const html = generateExamHtml(exam, copyType, settings);
  
//   const handlePrint = () => {
//     const printWin = window.open("");
//     if (printWin) {
//       printWin.document.write(html);
//       printWin.document.close();
//       printWin.focus();
//       printWin.print();
//     }
//   };
  
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-4xl">
       
//         {/* Modal Header */}
//         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center gap-4">
//           <div className="flex-1">
//             <h2 className="text-2xl font-bold text-gray-900">Print Preview</h2>
//             <p className="text-sm text-gray-600 mt-1">{exam.title}</p>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 text-3xl font-light flex-shrink-0"
//           >
//             ×
//           </button>
//         </div>
        
//         {/* Copy Type Selector */}
//         <div className="sticky top-16 bg-gray-50 border-b border-gray-200 px-6 py-4 z-10">
//           <div className="flex gap-4 items-center">
//             <span className="font-medium text-gray-700">View as:</span>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setCopyType("student")}
//                 className={`px-4 py-2 rounded-lg font-medium transition ${
//                   copyType === "student"
//                     ? "bg-blue-600 text-white"
//                     : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//                 }`}
//               >
//                 Student Copy
//               </button>
//               <button
//                 onClick={() => setCopyType("teacher")}
//                 className={`px-4 py-2 rounded-lg font-medium transition ${
//                   copyType === "teacher"
//                     ? "bg-green-600 text-white"
//                     : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//                 }`}
//               >
//                 Teacher's Copy
//               </button>
//             </div>
//           </div>
//         </div>
        
//         {/* Preview Content */}
//         <div className="p-6">
//           <div
//             className="prose prose-sm max-w-none bg-white p-8 border border-gray-200 rounded shadow-sm"
//             dangerouslySetInnerHTML={{ __html: html }}
//           />
//         </div>
        
//         {/* Modal Footer */}
//         <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
//           >
//             Close
//           </button>
//           <button
//             onClick={handlePrint}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
//           >
//             🖨️ Print {copyType === "teacher" ? "Teacher's Copy" : "Student Copy"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PrintPreviewModal;



import React, { useState, useEffect } from "react";
import { Exam } from "@/services/ExamService";
import { generateExamHtml } from "@/utils/examHtmlGenerator";
import { useSettings } from '@/contexts/SettingsContext';
import { normalizeExamDataForDisplay } from '@/utils/examDataNormalizer';

interface Props {
  open: boolean;
  exam?: Exam | null;
  onClose: () => void;
}

const PrintPreviewModal: React.FC<Props> = ({ open, exam, onClose }) => {
  const [copyType, setCopyType] = useState<"student" | "teacher">("student");
  const { settings } = useSettings();
  
  // Enhanced debugging
  useEffect(() => {
    if (open && exam) {
      console.group("🔍 EXAM DEBUG INFO");
      console.log("Full exam object:", exam);
      
      // Check objective questions
      if (exam.objective_questions && exam.objective_questions.length > 0) {
        console.group("📊 OBJECTIVE QUESTIONS");
        console.log(`Total: ${exam.objective_questions.length}`);
        
        exam.objective_questions.forEach((q, idx) => {
          console.log(`\nQuestion ${idx + 1}:`, {
            text: q.question_text?.substring(0, 50) + "...",
            hasImage: !!q.image,
            imageType: typeof q.image,
            imageValue: q.image,
            imageLength: q.image?.length,
            hasTable: !!q.table,
            tableType: typeof q.table,
            tableValue: q.table,
            tableIsString: typeof q.table === 'string',
            tableParsed: typeof q.table === 'string' ? JSON.parse(q.table) : q.table
          });
          console.log("📊 Sample objective question:", q);
  console.log("🖼️ Image fields:", {
    image: q.image,
    imageUrl: q.imageUrl,
    image_url: q.image_url
  });
  console.log("📋 Table data:", q.table);
  console.log("📝 Question text:", q.question || q.question_text);
        });
        console.groupEnd();
      }
      
      // Check theory questions
      if (exam.theory_questions && exam.theory_questions.length > 0) {
        console.group("📝 THEORY QUESTIONS");
        console.log(`Total: ${exam.theory_questions.length}`);
        
        exam.theory_questions.forEach((q, idx) => {
          console.log(`\nQuestion ${idx + 1}:`, {
            text: q.question_text?.substring(0, 50) + "...",
            hasImage: !!q.image,
            imageType: typeof q.image,
            hasTable: !!q.table,
            tableType: typeof q.table,
          });
        });
        console.groupEnd();
      }
      
      console.groupEnd();
    }
  }, [open, exam]);
  
  if (!open || !exam) return null;

  // Generate HTML with settings
  const html = generateExamHtml(exam, copyType, settings);
  
  // Log generated HTML to check if images/tables are in the output
  console.log("📄 Generated HTML preview (first 1000 chars):", html.substring(0, 1000));
  console.log("🖼️ HTML contains <img> tags:", html.includes('<img'));
  console.log("📋 HTML contains <table> tags:", html.includes('<table'));
  
  const handlePrint = () => {
    const printWin = window.open("");
    if (printWin) {
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
      printWin.print();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-4xl">
       
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Print Preview</h2>
            <p className="text-sm text-gray-600 mt-1">{exam.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-light flex-shrink-0"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        {/* Copy Type Selector */}
        <div className="sticky top-16 bg-gray-50 border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex gap-4 items-center">
            <span className="font-medium text-gray-700">View as:</span>
            <div className="flex gap-3">
              <button
                onClick={() => setCopyType("student")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  copyType === "student"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Student Copy
              </button>
              <button
                onClick={() => setCopyType("teacher")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  copyType === "teacher"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Teacher's Copy
              </button>
            </div>
          </div>
        </div>
        
        {/* Debug Info Panel (Remove in production) */}
        <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <details>
            <summary className="cursor-pointer font-semibold text-yellow-800">
              🐛 Debug Info (Click to expand)
            </summary>
            <div className="mt-2 space-y-2 text-yellow-900">
              <div>Objective Questions: {exam.objective_questions?.length || 0}</div>
              <div>Theory Questions: {exam.theory_questions?.length || 0}</div>
              <div>
                Questions with images: {
                  (exam.objective_questions?.filter(q => q.image)?.length || 0) +
                  (exam.theory_questions?.filter(q => q.image)?.length || 0)
                }
              </div>
              <div>
                Questions with tables: {
                  (exam.objective_questions?.filter(q => q.table)?.length || 0) +
                  (exam.theory_questions?.filter(q => q.table)?.length || 0)
                }
              </div>
              <div className="text-xs mt-2 p-2 bg-white rounded border border-yellow-300">
                <div className="font-semibold">Sample table data:</div>
                <pre className="overflow-x-auto">{
                  JSON.stringify(
                    exam.objective_questions?.[0]?.table || 
                    exam.theory_questions?.[0]?.table || 
                    "No table data",
                    null,
                    2
                  )
                }</pre>
              </div>
            </div>
          </details>
        </div>
        
        {/* Preview Content */}
        <div className="p-6">
          <div
            className="prose prose-sm max-w-none bg-white p-8 border border-gray-200 rounded shadow-sm"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        
        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
          >
            🖨️ Print {copyType === "teacher" ? "Teacher's Copy" : "Student Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;