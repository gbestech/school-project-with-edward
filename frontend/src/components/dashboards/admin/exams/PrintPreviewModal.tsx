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
import React, { useState } from "react";
import { Exam } from "@/services/ExamService";
import { generateExamHtml } from "@/utils/examHtmlGenerator";
import { useSettings } from '@/contexts/SettingsContext';

interface Props {
  open: boolean;
  exam?: Exam | null;
  onClose: () => void;
}

const PrintPreviewModal: React.FC<Props> = ({ open, exam, onClose }) => {
  const [copyType, setCopyType] = useState<"student" | "teacher">("student");
  const { settings } = useSettings(); // Get settings from context
  
  if (!open || !exam) return null;
  
  // Pass settings to generateExamHtml
  const html = generateExamHtml(exam, copyType, settings);
  
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