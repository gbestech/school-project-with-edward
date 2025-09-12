// ResultCreateTab.tsx
import React from 'react';
import ResultRecordingForm from '@/components/dashboards/teacher/ResultRecordingForm';

interface ResultCreateTabProps {
  onResultCreated: () => void;
  onSuccess: () => void;
  onClose: () => void;
}

const ResultCreateTab: React.FC<ResultCreateTabProps> = ({
  onResultCreated,
//   onSuccess,
  onClose
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <ResultRecordingForm
        isOpen={true} // Always true when this tab is active
        onClose={onClose} // Switch back to results tab
        onResultCreated={onResultCreated}
        // onSuccess={onSuccess}
        editResult={null} // Always null for new records
        mode="create" // Always create mode for this tab
      />
    </div>
  );
};

export default ResultCreateTab;