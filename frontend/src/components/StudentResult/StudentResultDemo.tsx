// @ts-nocheck
import React, { useRef, useState } from "react";
import SecondaryAnnualResult from "./SecondaryAnnualResult";
import { mockAnnualResult } from "./ResultTable";
import { Eye, Printer, Download, X } from 'lucide-react';

// Import types for external libraries
type ReactToPrint = typeof import('react-to-print')['useReactToPrint'];
type JsPDF = typeof import('jspdf')['default'];
type Html2Canvas = typeof import('html2canvas')['default'];

// Dynamic imports to avoid TypeScript errors
const useReactToPrint = async (): Promise<ReactToPrint> => {
  const module = await import('react-to-print');
  return module.useReactToPrint;
};

const getJsPDF = async (): Promise<JsPDF> => {
  const module = await import('jspdf');
  return module.default;
};

const getHtml2Canvas = async (): Promise<Html2Canvas> => {
  const module = await import('html2canvas');
  return module.default;
};

const StudentResultDemo = () => {
  const [showResult, setShowResult] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Handle Print (Portrait A4, minimal margins)
const handlePrint = async () => {
  setIsPrinting(true);
  try {
    const printHook = await useReactToPrint();
    const print = printHook({
      content: () => resultRef.current,
      documentTitle: "Student_Result_Sheet",
      pageStyle: `
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `,
      onAfterPrint: () => setIsPrinting(false),
    });
    print();
  } catch (error) {
    console.error("Print failed:", error);
    setIsPrinting(false);
  }
};

// Handle Download as PDF (Portrait A4, fills page)
const handleDownload = async () => {
  if (!resultRef.current) return;
  setIsDownloading(true);

  try {
    const html2canvas = await getHtml2Canvas();
    const jsPDF = await getJsPDF();

    const element = resultRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4"); // 👈 Portrait A4
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Keep aspect ratio
    const imgWidth = pageWidth - 10; // 5mm margin each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
    pdf.save("Student_Result_Sheet.pdf");
  } catch (error) {
    console.error("Download failed:", error);
  } finally {
    setIsDownloading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Result Action Buttons */}
      <div className="max-w-screen-xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Result Sheet</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowResult(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye size={20} />
              View Result
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className={`flex items-center gap-2 px-4 py-2 ${
                isPrinting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              } text-white rounded-lg transition-colors`}
            >
              <Printer size={20} />
              {isPrinting ? 'Printing...' : 'Print Result'}
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex items-center gap-2 px-4 py-2 ${
                isDownloading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
              } text-white rounded-lg transition-colors`}
            >
              <Download size={20} />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setShowResult(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            
            {/* Result Content */}
            <div ref={resultRef}>
              <SecondaryAnnualResult
                student={mockAnnualResult.student}
                school={mockAnnualResult.school}
                results={mockAnnualResult.results}
                session={mockAnnualResult.session}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResultDemo;