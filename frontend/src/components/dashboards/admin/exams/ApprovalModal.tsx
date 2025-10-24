// components/ApprovalModal.tsx
import React, { useState } from "react";
import { Exam } from "@/services/ExamService";

interface Props {
  open: boolean;
  exam?: Exam | null;
  onApprove: (exam: Exam, notes?: string) => void;
  onReject: (exam: Exam, notes?: string) => void;
  onClose: () => void;
}

const ApprovalModal: React.FC<Props> = ({ open, exam, onApprove, onReject, onClose }) => {
  const [notes, setNotes] = useState("");

  if (!open || !exam) return null;

  const handleApprove = () => {
    onApprove(exam, notes);
    setNotes("");
  };

  const handleReject = () => {
    onReject(exam, notes);
    setNotes("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        
        {/* Modal Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Approve or Reject Exam</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              <strong>Exam:</strong> {exam.title}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Subject:</strong> {exam.subject_name || exam.subject}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Status:</strong> {exam.status_display || exam.status}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              placeholder="Add approval or rejection notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Reject
          </button>
          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
