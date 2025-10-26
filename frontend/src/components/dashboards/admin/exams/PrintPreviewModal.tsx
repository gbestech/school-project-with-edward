// import React, { useState, useEffect, useMemo } from "react";
// import { Exam } from "@/services/ExamService";
// import { generateExamHtml } from "@/utils/examHtmlGenerator";
// import { useSettings } from '@/contexts/SettingsContext';
// import { normalizeExamDataForDisplay } from '@/utils/examDataNormalizer';

// interface Question {
//   question_text?: string;
//   question?: string;
//   image?: string;
//   imageUrl?: string;
//   image_url?: string;
//   table?: string | object;
//   subQuestions?: Question[];
//   subSubQuestions?: Question[];
// }

// interface Props {
//   open: boolean;
//   exam?: Exam | null;
//   onClose: () => void;
// }

// const PrintPreviewModal: React.FC<Props> = ({ open, exam, onClose }) => {
//   const [copyType, setCopyType] = useState<"student" | "teacher">("student");
//   const { settings } = useSettings();
//   const [normalizedExam, setNormalizedExam] = useState<any>(null);

//   // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  
//   // Normalize exam data when modal opens
//   useEffect(() => {
//     if (open && exam) {
//       console.log('🔄 Normalizing exam for display...');
//       const normalized = normalizeExamDataForDisplay(exam);
//       setNormalizedExam(normalized);
//       console.log('✅ Normalized exam set:', normalized);
//     } else {
//       setNormalizedExam(null);
//     }
//   }, [open, exam]);

//   // Debug original exam data - ONLY ONCE when modal opens
//   useEffect(() => {
//     if (!open || !exam) return;
    
//     console.group("🔍 ORIGINAL EXAM DATA");
//     console.log("Full exam object:", exam);
    
//     // Check objective questions
//     if (exam.objective_questions && exam.objective_questions.length > 0) {
//       console.group("📊 OBJECTIVE QUESTIONS (Original)");
//       console.log(`Total: ${exam.objective_questions.length}`);
      
//       exam.objective_questions.forEach((q: any, idx: number) => {
//         console.log(`\nQuestion ${idx + 1}:`, {
//           text: q.question_text?.substring(0, 50) + "...",
//           hasImage: !!q.image,
//           imageType: typeof q.image,
//           imageValue: q.image,
//           hasImageUrl: !!q.imageUrl,
//           hasTable: !!q.table,
//           tableType: typeof q.table,
//         });
//       });
//       console.groupEnd();
//     }
    
//     // Check theory questions
//     if (exam.theory_questions && exam.theory_questions.length > 0) {
//       console.group("📝 THEORY QUESTIONS (Original)");
//       console.log(`Total: ${exam.theory_questions.length}`);
      
//       exam.theory_questions.forEach((q: any, idx: number) => {
//         console.log(`\nQuestion ${idx + 1}:`, {
//           text: q.question_text?.substring(0, 50) + "...",
//           hasImage: !!q.image,
//           imageType: typeof q.image,
//           hasTable: !!q.table,
//           tableType: typeof q.table,
//         });
//       });
//       console.groupEnd();
//     }
    
//     console.groupEnd();
//   }, [open, exam]);
  
//   // Debug normalized exam data - ONLY ONCE when normalization completes
//   useEffect(() => {
//     if (!open || !normalizedExam) return;
    
//     console.group("🖼️ NORMALIZED EXAM - IMAGE & TABLE DEBUG");
    
//     let imageCount = 0;
//     let tableCount = 0;
    
//     // Check objective questions
//     if (normalizedExam.objective_questions) {
//       console.group("📊 Objective Questions (Normalized)");
//       normalizedExam.objective_questions.forEach((q: Question, idx: number) => {
//         if (q.image || q.table) {
//           console.log(`Objective ${idx + 1}:`, {
//             hasImage: !!q.image,
//             imageValue: q.image,
//             imageType: typeof q.image,
//             startsWithHttp: typeof q.image === 'string' && q.image.startsWith('http'),
//             first100Chars: q.image ? (typeof q.image === 'string' ? q.image.substring(0, 100) : 'not string') : null,
//             hasTable: !!q.table,
//             tableIsHTML: typeof q.table === 'string' && q.table.includes('<table'),
//           });
//           if (q.image) imageCount++;
//           if (q.table) tableCount++;
//         }
//       });
//       console.groupEnd();
//     }
    
//     // Check theory questions
//     if (normalizedExam.theory_questions) {
//       console.group("📝 Theory Questions (Normalized)");
//       normalizedExam.theory_questions.forEach((q: Question, idx: number) => {
//         if (q.image || q.table) {
//           console.log(`Theory ${idx + 1}:`, {
//             hasImage: !!q.image,
//             imageValue: q.image,
//             imageType: typeof q.image,
//             startsWithHttp: typeof q.image === 'string' && q.image.startsWith('http'),
//             first100Chars: q.image ? (typeof q.image === 'string' ? q.image.substring(0, 100) : 'not string') : null,
//             hasTable: !!q.table,
//             tableIsHTML: typeof q.table === 'string' && q.table.includes('<table'),
//           });
//           if (q.image) imageCount++;
//           if (q.table) tableCount++;
//         }
        
//         // Check sub-questions
//         if (q.subQuestions) {
//           q.subQuestions.forEach((sq: Question, sqIdx: number) => {
//             if (sq.image || sq.table) {
//               console.log(`  Sub ${idx + 1}.${sqIdx + 1}:`, {
//                 hasImage: !!sq.image,
//                 hasTable: !!sq.table,
//               });
//               if (sq.image) imageCount++;
//               if (sq.table) tableCount++;
//             }
//           });
//         }
//       });
//       console.groupEnd();
//     }
    
//     // Check practical questions
//     if (normalizedExam.practical_questions) {
//       console.group("🔬 Practical Questions (Normalized)");
//       (normalizedExam.practical_questions as Question[]).forEach((q: Question, idx: number) => {
//         if (q.image || q.table) {
//           console.log(`Practical ${idx + 1}:`, {
//             hasImage: !!q.image,
//             hasTable: !!q.table,
//           });
//           if (q.image) imageCount++;
//           if (q.table) tableCount++;
//         }
//       });
//       console.groupEnd();
//     }
    
//     console.log(`📊 SUMMARY: ${imageCount} images, ${tableCount} tables`);
//     console.groupEnd();
//   }, [open, normalizedExam]);

//   // Generate HTML - memoized to prevent unnecessary recalculation
//   const html = useMemo(() => {
//     if (!normalizedExam) return '';
//     return generateExamHtml(normalizedExam, copyType, settings);
//   }, [normalizedExam, copyType, settings]);

//   // Debug generated HTML - ONLY when html changes
//   useEffect(() => {
//     if (!open || !html) return;
    
//     console.group("📄 GENERATED HTML DEBUG");
//     console.log("HTML length:", html.length);
//     console.log("Contains <img> tags:", html.includes('<img'));
//     console.log("Contains <table> tags:", html.includes('<table'));
//     console.log("Number of <img> tags:", (html.match(/<img/g) || []).length);
//     console.log("Number of <table> tags:", (html.match(/<table/g) || []).length);
//     console.groupEnd();
//   }, [open, html]);
  
//   // Early return AFTER all hooks
//   if (!open || !exam) return null;
  
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
//             aria-label="Close modal"
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
        
//         {/* Debug Info Panel */}
//         <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-xs">
//           <details>
//             <summary className="cursor-pointer font-semibold text-yellow-800">
//               🐛 Debug Info (Click to expand)
//             </summary>
//             <div className="mt-2 space-y-2 text-yellow-900">
//               <div>Objective Questions: {exam.objective_questions?.length || 0}</div>
//               <div>Theory Questions: {exam.theory_questions?.length || 0}</div>
//               <div>Practical Questions: {exam.practical_questions?.length || 0}</div>
//               <div>
//                 Questions with images (original): {
//                   ((exam.objective_questions as any)?.filter((q: any) => q.image || q.imageUrl)?.length || 0) +
//                   ((exam.theory_questions as any)?.filter((q: any) => q.image || q.imageUrl)?.length || 0) +
//                   ((exam.practical_questions as any)?.filter((q: any) => q.image || q.imageUrl)?.length || 0)
//                 }
//               </div>
//               <div>
//                 Questions with tables (original): {
//                   ((exam.objective_questions as any)?.filter((q: any) => q.table)?.length || 0) +
//                   ((exam.theory_questions as any)?.filter((q: any) => q.table)?.length || 0) +
//                   ((exam.practical_questions as any)?.filter((q: any) => q.table)?.length || 0)
//                 }
//               </div>
//               {normalizedExam && (
//                 <>
//                   <div className="font-semibold mt-2 pt-2 border-t border-yellow-300">
//                     After Normalization:
//                   </div>
//                   <div>
//                     Questions with images (normalized): {
//                       (normalizedExam.objective_questions?.filter((q: Question) => q.image)?.length || 0) +
//                       (normalizedExam.theory_questions?.filter((q: Question) => q.image)?.length || 0) +
//                       (normalizedExam.practical_questions?.filter((q: Question) => q.image)?.length || 0)
//                     }
//                   </div>
//                   <div>
//                     Questions with tables (normalized): {
//                       (normalizedExam.objective_questions?.filter((q: Question) => q.table)?.length || 0) +
//                       (normalizedExam.theory_questions?.filter((q: Question) => q.table)?.length || 0) +
//                       (normalizedExam.practical_questions?.filter((q: Question) => q.table)?.length || 0)
//                     }
//                   </div>
//                 </>
//               )}
//             </div>
//           </details>
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

import React, { useState, useEffect, useMemo } from "react";
import { X, Printer, FileText, Eye } from "lucide-react";
import { Exam } from "@/services/ExamService";
import { generateExamHtml } from "@/utils/examHtmlGenerator";
import { useSettings } from '@/contexts/SettingsContext';
import { normalizeExamDataForDisplay } from '@/utils/examDataNormalizer';

interface Question {
  question_text?: string;
  question?: string;
  image?: string;
  imageUrl?: string;
  image_url?: string;
  table?: string | object;
  subQuestions?: Question[];
  subSubQuestions?: Question[];
}

interface Props {
  open: boolean;
  exam?: Exam | null;
  onClose: () => void;
}

const PrintPreviewModal: React.FC<Props> = ({ open, exam, onClose }) => {
  const [copyType, setCopyType] = useState<"student" | "teacher">("student");
  const { settings } = useSettings();
  const [normalizedExam, setNormalizedExam] = useState<any>(null);

  // Normalize exam data when modal opens
  useEffect(() => {
    if (open && exam) {
      const normalized = normalizeExamDataForDisplay(exam);
      setNormalizedExam(normalized);
    } else {
      setNormalizedExam(null);
    }
  }, [open, exam]);

  // Generate HTML - memoized to prevent unnecessary recalculation
  const html = useMemo(() => {
    if (!normalizedExam) return '';
    return generateExamHtml(normalizedExam, copyType, settings);
  }, [normalizedExam, copyType, settings]);
  
  // Early return AFTER all hooks
  if (!open || !exam) return null;
  
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full h-full sm:h-[95vh] sm:rounded-2xl shadow-2xl flex flex-col sm:max-w-6xl overflow-hidden">
       
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">Print Preview</h2>
                <p className="text-sm text-slate-600 mt-0.5 truncate">{exam.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
        
        {/* Copy Type Selector */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            <span className="font-semibold text-slate-700 text-sm sm:text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              View as:
            </span>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setCopyType("student")}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all ${
                  copyType === "student"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Student Copy
              </button>
              <button
                onClick={() => setCopyType("teacher")}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all ${
                  copyType === "teacher"
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Teacher's Copy
              </button>
            </div>
          </div>
        </div>
        
        {/* Preview Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-4 sm:p-8 max-w-5xl mx-auto">
            <div
              className="prose prose-sm sm:prose-base max-w-none bg-white p-6 sm:p-10 md:p-16 border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm"
              style={{
                minHeight: '297mm', // A4 height
                lineHeight: '1.6',
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
        
        {/* Modal Footer - Sticky */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg"
            >
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Print {copyType === "teacher" ? "Teacher's" : "Student"} Copy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;