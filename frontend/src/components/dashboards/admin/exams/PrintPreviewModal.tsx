// components/PrintPreviewModal.tsx
import React from "react";
import { Exam } from "@/services/ExamService";
import { generateExamHtml } from "@/utils/examHtmlGenerator";

interface Props {
  open: boolean;
  exam?: Exam | null;
  onClose: () => void;
}

const PrintPreviewModal: React.FC<Props> = ({ open, exam, onClose }) => {
  if (!open || !exam) return null;

  const html = generateExamHtml(exam);

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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Print Preview - {exam.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-light"
          >
            ×
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          <div 
            className="prose prose-sm max-w-none bg-white p-6 border border-gray-200 rounded"
            dangerouslySetInnerHTML={{ __html: html }} 
          />
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            🖨️ Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;
