
// import React, { useState, useCallback, useEffect } from "react";
// import { Exam, ExamCreateData, ExamUpdateData, ExamFilters, ExamService } from "@/services/ExamService";
// import ExamListTable from "./ExamListTable";
// import ExamFormModal from "./ExamFormModal";
// import PrintPreviewModal from "./PrintPreviewModal";
// import ApprovalModal from "./ApprovalModal";


// interface ExamsPageProps {
//   searchTerm?: string;
//   selectedExamType?: string;
//   selectedStatus?: string;
//   selectedGrade?: number;
//   selectedSubject?: number;
// }

// const ExamsPage: React.FC<ExamsPageProps> = ({
//   searchTerm = "",
//   selectedExamType = "",
//   selectedStatus = "",
//   selectedGrade = 0,
//   selectedSubject = 0,
// }) => {
//   // Data States
//   const [exams, setExams] = useState<Exam[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [submitting, setSubmitting] = useState(false);

//   // Modal and selected objects
//   const [showExamModal, setShowExamModal] = useState(false);
//   const [editingExam, setEditingExam] = useState<Exam | null>(null);
//   const [showPrintPreview, setShowPrintPreview] = useState(false);
//   const [selectedExamForPrint, setSelectedExamForPrint] = useState<Exam | null>(null);
//   const [showApprovalModal, setShowApprovalModal] = useState(false);
//   const [examForApproval, setExamForApproval] = useState<Exam | null>(null);

//   // Local filter states
//   const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
//   const [localExamType, setLocalExamType] = useState(selectedExamType);
//   const [localStatus, setLocalStatus] = useState(selectedStatus);
//   const [localGrade, setLocalGrade] = useState(selectedGrade);
//   const [localSubject, setLocalSubject] = useState(selectedSubject);

//   // Fetch Exams on mount and when filters change
//   useEffect(() => {
//     fetchExams();
//   }, [localSearchTerm, localExamType, localStatus, localGrade, localSubject]);

//   const fetchExams = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const filters: ExamFilters = {};
      
//       if (localSearchTerm) filters.search = localSearchTerm;
//       if (localExamType) filters.exam_type = localExamType;
//       if (localStatus) filters.status = localStatus;
//       if (localGrade) filters.grade_level = localGrade;
//       if (localSubject) filters.subject = localSubject;

//       const data = await ExamService.getExams(filters);
      
//       // Ensure all exams have their IDs properly set
//       const examsWithIds = (data || []).map(exam => {
//         // If ID is missing at top level but exists nested, extract it
//         if (!exam.id && typeof exam === 'object') {
//           // Try to find ID in common nested locations
//           const possibleId = (exam as any).pk || (exam as any).exam_id || (exam as any).examId;
//           if (possibleId) {
//             return { ...exam, id: possibleId };
//           }
//         }
//         return exam;
//       });
      
//       console.log("📚 Loaded exams:", examsWithIds);
//       setExams(examsWithIds);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to load exams");
//       console.error("Fetch exams error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Create or Update Exam
//   const handleCreateExam = useCallback(
//     async (examData: ExamCreateData) => {
//       setSubmitting(true);
//       try {
//         let savedExam: Exam;
        
//         if (editingExam && editingExam.id) {
//           console.log("🔄 Updating exam with ID:", editingExam.id);
//           console.log("📝 Exam data:", examData);
          
//           // Update existing exam
//           const updateData: ExamUpdateData = examData;
//           savedExam = await ExamService.updateExam(editingExam.id, updateData);
          
//           // Ensure the saved exam has the ID (in case API doesn't return it)
//           if (!savedExam.id) {
//             savedExam = { ...savedExam, id: editingExam.id };
//           }
          
//           console.log("📦 Saved exam object:", savedExam);
          
//           // Update local state
//           setExams((prev) =>
//             prev.map((e) => (e.id === editingExam.id ? savedExam : e))
//           );
          
//           console.log("✅ Exam updated successfully!");
//         } else {
//           console.log("➕ Creating new exam");
//           console.log("📝 Exam data:", examData);
          
//           // Create new exam
//           savedExam = await ExamService.createExam(examData);
          
//           console.log("📦 Created exam object:", savedExam);
          
//           // Add to local state
//           setExams((prev) => [savedExam, ...prev]);
          
//           console.log("✅ Exam created successfully!");
//         }

//         // Close modal and clear editing state
//         setShowExamModal(false);
//         setEditingExam(null);
//       } catch (err) {
//         console.error("❌ Save exam error:", err);
//         setError(err instanceof Error ? err.message : "Failed to save exam");
//       } finally {
//         setSubmitting(false);
//       }
//     },
//     [editingExam]
//   );

//   // Delete Exam
//   const handleDeleteExam = useCallback(async (exam: Exam) => {
//     if (!window.confirm(`Are you sure you want to delete "${exam.title}"?`)) return;

//     try {
//       await ExamService.deleteExam(exam.id);
//       setExams((prev) => prev.filter((e) => e.id !== exam.id));
//       console.log("✅ Exam deleted!");
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to delete exam");
//       console.error("Delete exam error:", err);
//     }
//   }, []);

//   // Edit Exam
//   const handleEditExam = useCallback((exam: Exam) => {
//     console.log("📝 Editing exam:", exam);
//     console.log("🆔 Exam ID:", exam.id);
//     console.log("🔍 Full exam keys:", Object.keys(exam));
    
//     // Ensure the exam object has an ID
//     if (!exam.id) {
//       console.error("❌ Cannot edit exam: Missing ID");
//       console.error("❌ Exam object:", JSON.stringify(exam, null, 2));
//       setError("Cannot edit exam: Missing ID. Please refresh and try again.");
      
//       // Try to recover by fetching fresh data
//       fetchExams();
//       return;
//     }
    
//     setEditingExam(exam);
//     setShowExamModal(true);
//   }, []);

//   // Print Exam
//   const handlePrintExam = useCallback((exam: Exam) => {
//     setSelectedExamForPrint(exam);
//     setShowPrintPreview(true);
//   }, []);

//   // Approve Exam
//   const handleApproveExam = useCallback((exam: Exam) => {
//     setExamForApproval(exam);
//     setShowApprovalModal(true);
//   }, []);

//   // Submit Approval
//   const handleSubmitApproval = useCallback(
//     async (exam: Exam, notes?: string) => {
//       try {
//         const updatedExam = await ExamService.approveExam(exam.id, notes || "");
        
//         await fetchExams();
//         setExams((prev) =>
//           prev.map((e) => (e.id === exam.id ? updatedExam : e))
//         );

//         setShowApprovalModal(false);
//         setExamForApproval(null);
//         console.log("✅ Exam approved!");
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to approve exam");
//       }
//     },
//     []
//   );

//   // Submit Rejection
//   const handleRejectExam = useCallback(
//     async (exam: Exam, reason?: string) => {
//       try {
//         const updatedExam = await ExamService.rejectExam(exam.id, reason || "");
        
//         await fetchExams();
//         setExams((prev) =>
//           prev.map((e) => (e.id === exam.id ? updatedExam : e))
//         );

//         setShowApprovalModal(false);
//         setExamForApproval(null);
//         console.log("✅ Exam rejected!");
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to reject exam");
//       }
//     },
//     []
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Page Header */}
//       <div className="mb-8 flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Exams Management</h1>
//           <p className="text-gray-600 mt-2">View, create, and manage exams</p>
//         </div>
//         <button
//           onClick={() => {
//             setEditingExam(null);
//             setShowExamModal(true);
//           }}
//           className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
//         >
//           + New Exam
//         </button>
//       </div>

//       {/* Error Alert */}
//       {error && (
//         <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
//           <span>{error}</span>
//           <button
//             onClick={() => setError(null)}
//             className="text-red-700 hover:text-red-900 font-bold text-xl"
//           >
//             ×
//           </button>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="mb-6 bg-white rounded-lg shadow p-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Search
//             </label>
//             <input
//               type="text"
//               placeholder="Search exams..."
//               value={localSearchTerm}
//               onChange={(e) => setLocalSearchTerm(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Exam Type
//             </label>
//             <select
//               value={localExamType}
//               onChange={(e) => setLocalExamType(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="">All Types</option>
//               {ExamService.getExamTypes().map((type) => (
//                 <option key={type.value} value={type.value}>
//                   {type.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Status
//             </label>
//             <select
//               value={localStatus}
//               onChange={(e) => setLocalStatus(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="">All Status</option>
//               {ExamService.getExamStatuses().map((status) => (
//                 <option key={status.value} value={status.value}>
//                   {status.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Grade Level
//             </label>
//             <input
//               type="number"
//               placeholder="Grade ID"
//               value={localGrade || ""}
//               onChange={(e) => setLocalGrade(e.target.value ? parseInt(e.target.value) : 0)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Subject
//             </label>
//             <input
//               type="number"
//               placeholder="Subject ID"
//               value={localSubject || ""}
//               onChange={(e) => setLocalSubject(e.target.value ? parseInt(e.target.value) : 0)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Exam Table */}
//       <ExamListTable
//         exams={exams}
//         loading={loading}
//         error={error}
//         onEdit={handleEditExam}
//         onDelete={handleDeleteExam}
//         onPrint={handlePrintExam}
//         onApprove={handleApproveExam}
//       />

//       {/* Modals */}
//       <ExamFormModal
//         open={showExamModal}
//         exam={editingExam}
//         onClose={() => {
//           setShowExamModal(false);
//           setEditingExam(null);
//         }}
//         onSubmit={handleCreateExam}
//       />

//       <PrintPreviewModal
//         open={showPrintPreview}
//         exam={selectedExamForPrint}
//         onClose={() => setShowPrintPreview(false)}
//       />

//       <ApprovalModal
//         open={showApprovalModal}
//         exam={examForApproval}
//         onApprove={handleSubmitApproval}
//         onReject={handleRejectExam}
//         onClose={() => setShowApprovalModal(false)}
//       />
//     </div>
//   );
// };

// export default ExamsPage;



import React, { useState, useCallback, useEffect } from "react";
import { Exam, ExamCreateData, ExamUpdateData, ExamFilters, ExamService } from "@/services/ExamService";
import ExamListTable from "./ExamListTable";
import ExamFormModal from "./ExamFormModal";
import PrintPreviewModal from "./PrintPreviewModal";
import ApprovalModal from "./ApprovalModal";
import { normalizeExamDataForDisplay, normalizeExamDataForEdit } from "@/utils/examDataNormalizer";

interface ExamsPageProps {
  searchTerm?: string;
  selectedExamType?: string;
  selectedStatus?: string;
  selectedGrade?: number;
  selectedSubject?: number;
}

const ExamsPage: React.FC<ExamsPageProps> = ({
  searchTerm = "",
  selectedExamType = "",
  selectedStatus = "",
  selectedGrade = 0,
  selectedSubject = 0,
}) => {
  // Data States
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal and selected objects
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedExamForPrint, setSelectedExamForPrint] = useState<Exam | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [examForApproval, setExamForApproval] = useState<Exam | null>(null);

  // Local filter states
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localExamType, setLocalExamType] = useState(selectedExamType);
  const [localStatus, setLocalStatus] = useState(selectedStatus);
  const [localGrade, setLocalGrade] = useState(selectedGrade);
  const [localSubject, setLocalSubject] = useState(selectedSubject);

  // Fetch Exams on mount and when filters change
  useEffect(() => {
    fetchExams();
  }, [localSearchTerm, localExamType, localStatus, localGrade, localSubject]);

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: ExamFilters = {};
      
      if (localSearchTerm) filters.search = localSearchTerm;
      if (localExamType) filters.exam_type = localExamType;
      if (localStatus) filters.status = localStatus;
      if (localGrade) filters.grade_level = localGrade;
      if (localSubject) filters.subject = localSubject;

      const data = await ExamService.getExams(filters);
      
      // CRITICAL: Normalize all exams for display
      // This ensures images and tables are properly formatted
      const normalizedExams = (data || []).map(exam => {
        // Ensure ID is preserved
        const examWithId = {
          ...exam,
          id: exam.id || (exam as any).pk || (exam as any).exam_id || (exam as any).examId
        };
        
        // Normalize for display (converts tables to HTML, standardizes image fields)
        const normalized = normalizeExamDataForDisplay(examWithId);
        
        // Ensure ID is still present after normalization
        return normalized ? { ...normalized, id: examWithId.id } : examWithId;
      });
      
      console.log("📚 Loaded and normalized exams:", normalizedExams);
      console.log(`✅ Total exams: ${normalizedExams.length}`);
      
      // Log image/table statistics
      const stats = normalizedExams.reduce((acc, exam) => {
        const objWithImages = (exam.objective_questions || []).filter((q: any) => q.image).length;
        const objWithTables = (exam.objective_questions || []).filter((q: any) => q.table).length;
        const theoryWithImages = (exam.theory_questions || []).filter((q: any) => q.image).length;
        const theoryWithTables = (exam.theory_questions || []).filter((q: any) => q.table).length;
        
        return {
          images: acc.images + objWithImages + theoryWithImages,
          tables: acc.tables + objWithTables + theoryWithTables
        };
      }, { images: 0, tables: 0 });
      
      console.log(`📊 Found ${stats.images} questions with images, ${stats.tables} questions with tables`);
      
      setExams(normalizedExams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load exams");
      console.error("❌ Fetch exams error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create or Update Exam
  const handleCreateExam = useCallback(
    async (examData: ExamCreateData) => {
      setSubmitting(true);
      try {
        let savedExam: Exam;
        
        if (editingExam && editingExam.id) {
          console.log("🔄 Updating exam with ID:", editingExam.id);
          console.log("📝 Exam data:", examData);
          
          // Update existing exam
          const updateData: ExamUpdateData = examData;
          savedExam = await ExamService.updateExam(editingExam.id, updateData);
          
          // Ensure the saved exam has the ID (in case API doesn't return it)
          if (!savedExam.id) {
            savedExam = { ...savedExam, id: editingExam.id };
          }
          
          // Normalize for display
          const normalizedSaved = normalizeExamDataForDisplay(savedExam);
          
          console.log("📦 Saved and normalized exam:", normalizedSaved);
          
          // Update local state
          setExams((prev) =>
            prev.map((e) => (e.id === editingExam.id ? normalizedSaved || savedExam : e))
          );
          
          console.log("✅ Exam updated successfully!");
        } else {
          console.log("➕ Creating new exam");
          console.log("📝 Exam data:", examData);
          
          // Create new exam
          savedExam = await ExamService.createExam(examData);
          
          // Normalize for display
          const normalizedSaved = normalizeExamDataForDisplay(savedExam);
          
          console.log("📦 Created and normalized exam:", normalizedSaved);
          
          // Add to local state
          setExams((prev) => [normalizedSaved || savedExam, ...prev]);
          
          console.log("✅ Exam created successfully!");
        }

        // Close modal and clear editing state
        setShowExamModal(false);
        setEditingExam(null);
      } catch (err) {
        console.error("❌ Save exam error:", err);
        setError(err instanceof Error ? err.message : "Failed to save exam");
      } finally {
        setSubmitting(false);
      }
    },
    [editingExam]
  );

  // Delete Exam
  const handleDeleteExam = useCallback(async (exam: Exam) => {
    if (!window.confirm(`Are you sure you want to delete "${exam.title}"?`)) return;

    try {
      await ExamService.deleteExam(exam.id);
      setExams((prev) => prev.filter((e) => e.id !== exam.id));
      console.log("✅ Exam deleted!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete exam");
      console.error("❌ Delete exam error:", err);
    }
  }, []);

  // Edit Exam
  const handleEditExam = useCallback((exam: Exam) => {
    console.log("📝 Editing exam:", exam);
    console.log("🆔 Exam ID:", exam.id);
    
    // Ensure the exam object has an ID
    if (!exam.id) {
      console.error("❌ Cannot edit exam: Missing ID");
      console.error("❌ Exam object:", JSON.stringify(exam, null, 2));
      setError("Cannot edit exam: Missing ID. Please refresh and try again.");
      
      // Try to recover by fetching fresh data
      fetchExams();
      return;
    }
    
    // CRITICAL: Normalize for edit (parses table JSON, handles field name variations)
    const normalizedForEdit = normalizeExamDataForEdit(exam);
    
    console.log("✅ Normalized exam for editing:", normalizedForEdit);
    
    setEditingExam(normalizedForEdit);
    setShowExamModal(true);
  }, []);

  // Print Exam
  const handlePrintExam = useCallback((exam: Exam) => {
    console.log("🖨️ Preparing exam for print:", exam.title);
    
    // Data is already normalized from fetchExams, but ensure it's ready for print
    const normalizedForPrint = normalizeExamDataForDisplay(exam);
    
    setSelectedExamForPrint(normalizedForPrint);
    setShowPrintPreview(true);
  }, []);

  // Approve Exam
  const handleApproveExam = useCallback((exam: Exam) => {
    setExamForApproval(exam);
    setShowApprovalModal(true);
  }, []);

  // Submit Approval
  const handleSubmitApproval = useCallback(
    async (exam: Exam, notes?: string) => {
      try {
        const updatedExam = await ExamService.approveExam(exam.id, notes || "");
        
        // Normalize the updated exam
        const normalizedUpdated = normalizeExamDataForDisplay(updatedExam);
        
        // Update local state
        setExams((prev) =>
          prev.map((e) => (e.id === exam.id ? normalizedUpdated || updatedExam : e))
        );

        setShowApprovalModal(false);
        setExamForApproval(null);
        console.log("✅ Exam approved!");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to approve exam");
        console.error("❌ Approve exam error:", err);
      }
    },
    []
  );

  // Submit Rejection
  const handleRejectExam = useCallback(
    async (exam: Exam, reason?: string) => {
      try {
        const updatedExam = await ExamService.rejectExam(exam.id, reason || "");
        
        // Normalize the updated exam
        const normalizedUpdated = normalizeExamDataForDisplay(updatedExam);
        
        // Update local state
        setExams((prev) =>
          prev.map((e) => (e.id === exam.id ? normalizedUpdated || updatedExam : e))
        );

        setShowApprovalModal(false);
        setExamForApproval(null);
        console.log("✅ Exam rejected!");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reject exam");
        console.error("❌ Reject exam error:", err);
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exams Management</h1>
          <p className="text-gray-600 mt-2">View, create, and manage exams</p>
        </div>
        <button
          onClick={() => {
            setEditingExam(null);
            setShowExamModal(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
        >
          + New Exam
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 font-bold text-xl"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search exams..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Type
            </label>
            <select
              value={localExamType}
              onChange={(e) => setLocalExamType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {ExamService.getExamTypes().map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={localStatus}
              onChange={(e) => setLocalStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              {ExamService.getExamStatuses().map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade Level
            </label>
            <input
              type="number"
              placeholder="Grade ID"
              value={localGrade || ""}
              onChange={(e) => setLocalGrade(e.target.value ? parseInt(e.target.value) : 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="number"
              placeholder="Subject ID"
              value={localSubject || ""}
              onChange={(e) => setLocalSubject(e.target.value ? parseInt(e.target.value) : 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Exam Table */}
      <ExamListTable
        exams={exams}
        loading={loading}
        error={error}
        onEdit={handleEditExam}
        onDelete={handleDeleteExam}
        onPrint={handlePrintExam}
        onApprove={handleApproveExam}
      />

      {/* Modals */}
      <ExamFormModal
        open={showExamModal}
        exam={editingExam}
        onClose={() => {
          setShowExamModal(false);
          setEditingExam(null);
        }}
        onSubmit={handleCreateExam}
      />

      <PrintPreviewModal
        open={showPrintPreview}
        exam={selectedExamForPrint}
        onClose={() => setShowPrintPreview(false)}
      />

      <ApprovalModal
        open={showApprovalModal}
        exam={examForApproval}
        onApprove={handleSubmitApproval}
        onReject={handleRejectExam}
        onClose={() => setShowApprovalModal(false)}
      />
    </div>
  );
};

export default ExamsPage;