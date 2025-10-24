// components/ExamListTable.tsx
import React from "react";
import { Exam, ExamService } from "@/services/ExamService";

interface ExamListTableProps {
  exams: Exam[];
  loading: boolean;
  error: string | null;
  onEdit: (exam: Exam) => void;
  onDelete: (exam: Exam) => void;
  onPrint: (exam: Exam) => void;
  onApprove: (exam: Exam) => void;
}

const ExamListTable: React.FC<ExamListTableProps> = ({
  exams,
  loading,
  error,
  onEdit,
  onDelete,
  onPrint,
  onApprove,
}) => {
  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2">Loading exams...</p>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );

  if (!exams.length)
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No exams found. Create your first exam!</p>
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Title
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Code
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Subject
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Grade Level
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Exam Type
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Date
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Marks
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {exams.map((exam) => (
            <tr key={exam.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {exam.title}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {exam.code || "--"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {exam.subject_name || exam.subject || "--"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {exam.grade_level_name || exam.grade_level || "--"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {exam.exam_type_display || exam.exam_type || "--"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : "--"}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  ExamService.getStatusColor(exam.status)
                }`}>
                  {exam.status_display || exam.status || "Unknown"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {exam.total_marks}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => onEdit(exam)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    title="Edit exam"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onPrint(exam)}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                    title="Print preview"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => onApprove(exam)}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                    title="Approve exam"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onDelete(exam)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                    title="Delete exam"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExamListTable;
