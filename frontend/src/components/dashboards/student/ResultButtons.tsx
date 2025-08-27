import React from 'react';
import { Eye, Printer, Download } from 'lucide-react';

interface ResultButtonsProps {
  onView: () => void;
  onPrint: () => void;
  onDownload: () => void;
  isPrinting: boolean;
  isDownloading: boolean;
}

const ResultButtons: React.FC<ResultButtonsProps> = ({
  onView,
  onPrint,
  onDownload,
  isPrinting,
  isDownloading
}) => {
  return (
    <div className="flex justify-center gap-4">
      <button
        onClick={onView}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
      >
        <Eye size={20} />
        View Result
      </button>
      <button
        onClick={onPrint}
        disabled={isPrinting}
        className={`flex items-center gap-2 px-6 py-3 ${
          isPrinting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
        } text-white rounded-xl transition-colors`}
      >
        <Printer size={20} />
        {isPrinting ? 'Printing...' : 'Print Result'}
      </button>
      <button
        onClick={onDownload}
        disabled={isDownloading}
        className={`flex items-center gap-2 px-6 py-3 ${
          isDownloading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
        } text-white rounded-xl transition-colors`}
      >
        <Download size={20} />
        {isDownloading ? 'Downloading...' : 'Download PDF'}
      </button>
    </div>
  );
};

export default ResultButtons;
