import React, { useState, useEffect, useMemo } from "react";
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
      console.log('🔄 Normalizing exam for display...');
      const normalized = normalizeExamDataForDisplay(exam);
      setNormalizedExam(normalized);
      console.log('✅ Normalized exam set:', normalized);
    } else {
      setNormalizedExam(null);
    }
  }, [open, exam]);

  // Debug original exam data
  useEffect(() => {
    if (open && exam) {
      console.group("🔍 ORIGINAL EXAM DATA");
      console.log("Full exam object:", exam);
      
      // Check objective questions
      if (exam.objective_questions && exam.objective_questions.length > 0) {
        console.group("📊 OBJECTIVE QUESTIONS (Original)");
        console.log(`Total: ${exam.objective_questions.length}`);
        
        exam.objective_questions.forEach((q: any, idx: number) => {
          console.log(`\nQuestion ${idx + 1}:`, {
            text: q.question_text?.substring(0, 50) + "...",
            hasImage: !!q.image,
            imageType: typeof q.image,
            imageValue: q.image,
            imageLength: q.image?.length,
            hasImageUrl: !!q.imageUrl,
            imageUrlValue: q.imageUrl,
            hasTable: !!q.table,
            tableType: typeof q.table,
            tableIsString: typeof q.table === 'string'
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
        console.group("📝 THEORY QUESTIONS (Original)");
        console.log(`Total: ${exam.theory_questions.length}`);
        
        exam.theory_questions.forEach((q: any, idx: number) => {
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
  
  // Debug normalized exam data with focus on images and tables
  useEffect(() => {
    if (open && normalizedExam) {
      console.group("🖼️ NORMALIZED EXAM - IMAGE & TABLE DEBUG");
      
      let imageCount = 0;
      let tableCount = 0;
      
      // Check objective questions
      if (normalizedExam.objective_questions) {
        console.group("📊 Objective Questions (Normalized)");
        normalizedExam.objective_questions.forEach((q: Question, idx: number) => {
          if (q.image || q.table) {
            console.log(`Objective ${idx + 1}:`, {
              hasImage: !!q.image,
              imageValue: q.image,
              imageType: typeof q.image,
              startsWithHttp: typeof q.image === 'string' && q.image.startsWith('http'),
              includesImgTag: typeof q.image === 'string' && q.image.includes('<img'),
              first100Chars: q.image ? (typeof q.image === 'string' ? q.image.substring(0, 100) : JSON.stringify(q.image).substring(0, 100)) : null,
              hasTable: !!q.table,
              tableIsHTML: typeof q.table === 'string' && q.table.includes('<table'),
              tablePreview: q.table ? (typeof q.table === 'string' ? q.table.substring(0, 150) : JSON.stringify(q.table).substring(0, 150)) : null
            });
            if (q.image) imageCount++;
            if (q.table) tableCount++;
          }
        });
        console.groupEnd();
      }
      
      // Check theory questions
      if (normalizedExam.theory_questions) {
        console.group("📝 Theory Questions (Normalized)");
        normalizedExam.theory_questions.forEach((q: Question, idx: number) => {
          if (q.image || q.table) {
            console.log(`Theory ${idx + 1}:`, {
              hasImage: !!q.image,
              imageValue: q.image,
              imageType: typeof q.image,
              startsWithHttp: typeof q.image === 'string' && q.image.startsWith('http'),
              includesImgTag: typeof q.image === 'string' && q.image.includes('<img'),
              first100Chars: q.image ? (typeof q.image === 'string' ? q.image.substring(0, 100) : JSON.stringify(q.image).substring(0, 100)) : null,
              hasTable: !!q.table,
              tableIsHTML: typeof q.table === 'string' && q.table.includes('<table'),
              tablePreview: q.table ? (typeof q.table === 'string' ? q.table.substring(0, 150) : JSON.stringify(q.table).substring(0, 150)) : null
            });
            if (q.image) imageCount++;
            if (q.table) tableCount++;
          }
          
          // Check sub-questions
          if (q.subQuestions) {
            q.subQuestions.forEach((sq: Question, sqIdx: number) => {
              if (sq.image || sq.table) {
                console.log(`  Sub ${idx + 1}.${sqIdx + 1}:`, {
                  hasImage: !!sq.image,
                  imageValue: sq.image,
                  hasTable: !!sq.table,
                  tablePreview: sq.table ? (typeof sq.table === 'string' ? sq.table.substring(0, 100) : JSON.stringify(sq.table).substring(0, 100)) : null
                });
                if (sq.image) imageCount++;
                if (sq.table) tableCount++;
              }
            });
          }
        });
        console.groupEnd();
      }
      
      // Check practical questions
      if (normalizedExam.practical_questions) {
        console.group("🔬 Practical Questions (Normalized)");
        (normalizedExam.practical_questions as Question[]).forEach((q: Question, idx: number) => {
          if (q.image || q.table) {
            console.log(`Practical ${idx + 1}:`, {
              hasImage: !!q.image,
              imageValue: q.image,
              hasTable: !!q.table,
              tablePreview: q.table ? (typeof q.table === 'string' ? q.table.substring(0, 100) : JSON.stringify(q.table).substring(0, 100)) : null
            });
            if (q.image) imageCount++;
            if (q.table) tableCount++;
          }
        });
        console.groupEnd();
      }
      
      console.log(`📊 SUMMARY: ${imageCount} images, ${tableCount} tables`);
      console.groupEnd();
    }
  }, [open, normalizedExam]);

  // Generate HTML with normalized exam data and settings - memoized to prevent unnecessary recalculation
  // MUST be called before early return to follow Rules of Hooks
  const html = useMemo(() => {
    if (!normalizedExam) return '';
    console.log('🔨 Generating HTML with:', { normalizedExam, copyType });
    return generateExamHtml(normalizedExam, copyType, settings);
  }, [normalizedExam, copyType, settings]);
  
  if (!open || !exam) return null;

  // Debug generated HTML - runs only when dependencies change
  useEffect(() => {
    if (open && html) {
      console.group("📄 GENERATED HTML DEBUG");
      console.log("HTML length:", html.length);
      console.log("Contains <img> tags:", html.includes('<img'));
      console.log("Contains <table> tags:", html.includes('<table'));
      console.log("Number of <img> tags:", (html.match(/<img/g) || []).length);
      console.log("Number of <table> tags:", (html.match(/<table/g) || []).length);
      console.log("First 1000 chars:", html.substring(0, 1000));
      console.groupEnd();
    }
  }, [open, normalizedExam, copyType]); // Don't depend on html itself to avoid infinite loop!
  
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
        
        {/* Debug Info Panel */}
        <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <details>
            <summary className="cursor-pointer font-semibold text-yellow-800">
              🐛 Debug Info (Click to expand)
            </summary>
            <div className="mt-2 space-y-2 text-yellow-900">
              <div>Objective Questions: {exam.objective_questions?.length || 0}</div>
              <div>Theory Questions: {exam.theory_questions?.length || 0}</div>
              <div>Practical Questions: {exam.practical_questions?.length || 0}</div>
              <div>
                Questions with images (original): {
                  ((exam.objective_questions as any)?.filter((q: any) => q.image || q.imageUrl)?.length || 0) +
                  ((exam.theory_questions as any)?.filter((q: any) => q.image || q.imageUrl)?.length || 0) +
                  ((exam.practical_questions as any)?.filter((q: any) => q.image || q.imageUrl)?.length || 0)
                }
              </div>
              <div>
                Questions with tables (original): {
                  ((exam.objective_questions as any)?.filter((q: any) => q.table)?.length || 0) +
                  ((exam.theory_questions as any)?.filter((q: any) => q.table)?.length || 0) +
                  ((exam.practical_questions as any)?.filter((q: any) => q.table)?.length || 0)
                }
              </div>
              {normalizedExam && (
                <>
                  <div className="font-semibold mt-2 pt-2 border-t border-yellow-300">
                    After Normalization:
                  </div>
                  <div>
                    Questions with images (normalized): {
                      (normalizedExam.objective_questions?.filter((q: Question) => q.image)?.length || 0) +
                      (normalizedExam.theory_questions?.filter((q: Question) => q.image)?.length || 0) +
                      (normalizedExam.practical_questions?.filter((q: Question) => q.image)?.length || 0)
                    }
                  </div>
                  <div>
                    Questions with tables (normalized): {
                      (normalizedExam.objective_questions?.filter((q: Question) => q.table)?.length || 0) +
                      (normalizedExam.theory_questions?.filter((q: Question) => q.table)?.length || 0) +
                      (normalizedExam.practical_questions?.filter((q: Question) => q.table)?.length || 0)
                    }
                  </div>
                </>
              )}
              <div className="text-xs mt-2 p-2 bg-white rounded border border-yellow-300">
                <div className="font-semibold">Sample data (first question):</div>
                <pre className="overflow-x-auto max-h-40">{
                  JSON.stringify({
                    original: {
                      image: (exam.objective_questions as any)?.[0]?.image || (exam.theory_questions as any)?.[0]?.image || "No image",
                      imageUrl: (exam.objective_questions as any)?.[0]?.imageUrl || (exam.theory_questions as any)?.[0]?.imageUrl,
                      table: (exam.objective_questions as any)?.[0]?.table || (exam.theory_questions as any)?.[0]?.table || "No table"
                    },
                    normalized: normalizedExam ? {
                      image: normalizedExam.objective_questions?.[0]?.image || normalizedExam.theory_questions?.[0]?.image || "No image",
                      table: normalizedExam.objective_questions?.[0]?.table ? 
                        (typeof normalizedExam.objective_questions[0].table === 'string' ? normalizedExam.objective_questions[0].table.substring(0, 100) + "..." : 'Not a string') :
                        (normalizedExam.theory_questions?.[0]?.table ? 
                          (typeof normalizedExam.theory_questions[0].table === 'string' ? normalizedExam.theory_questions[0].table.substring(0, 100) + "..." : 'Not a string') :
                          "No table")
                    } : "Not normalized yet"
                  }, null, 2)
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