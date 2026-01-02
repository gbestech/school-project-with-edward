import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import WeasyPrintPDFService, { EducationLevel, TermType } from '@/services/WeasyPrintPDFService';

// ============================================================================
// TYPES
// ============================================================================

export interface WeasyPrintPDFStatus {
  isGenerating: boolean;
  isDownloading: boolean;
  isVerifying: boolean;
  isLoading: boolean;
  reportId: string | null;
  error: string | null;
}

export interface UseWeasyPrintPDFOptions {
  studentId: string;
  studentName: string;
  educationLevel: EducationLevel;
  examSessionId?: string;
  term?: TermType;
  session?: string;
  // Optional callbacks
  onSuccess?: (reportId?: string) => void;
  onError?: (error: string) => void;
  // Toast control
  showToasts?: boolean;
}

export interface UseWeasyPrintPDFReturn extends WeasyPrintPDFStatus {
  // Actions
  generateReport: () => Promise<string | null>;
  verifyReport: (reportId: string) => Promise<boolean>;
  downloadPDF: (reportId: string) => Promise<void>;
  generateAndDownload: () => Promise<void>;
  reset: () => void;
  // Utility
  canGenerate: boolean;
  canDownload: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export const useWeasyPrintPDF = (
  options: UseWeasyPrintPDFOptions
): UseWeasyPrintPDFReturn => {
  const {
    studentId,
    studentName,
    educationLevel,
    examSessionId,
    term,
    session,
    onSuccess,
    onError,
    showToasts = true
  } = options;

  // ============================================================================
  // STATE
  // ============================================================================
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ============================================================================
  // COMPUTED STATE (Memoized)
  // ============================================================================

  const isLoading = useMemo(
    () => isGenerating || isDownloading || isVerifying,
    [isGenerating, isDownloading, isVerifying]
  );

  const canGenerate = useMemo(
    () => !isLoading && !!examSessionId && !!studentId,
    [isLoading, examSessionId, studentId]
  );

  const canDownload = useMemo(
    () => !isLoading && !!reportId,
    [isLoading, reportId]
  );

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const handleError = useCallback((errorMsg: string, showToast = showToasts) => {
    if (!isMountedRef.current) return;
    
    setError(errorMsg);
    if (showToast) {
      toast.error(errorMsg);
    }
    onError?.(errorMsg);
  }, [showToasts, onError]);

  const handleSuccess = useCallback((message: string, reportId?: string, showToast = showToasts) => {
    if (!isMountedRef.current) return;
    
    if (showToast) {
      toast.success(message);
    }
    onSuccess?.(reportId);
  }, [showToasts, onSuccess]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Generate a new term report
   */
  const generateReport = useCallback(async (): Promise<string | null> => {
    if (!examSessionId) {
      handleError('Exam session is required to generate report');
      return null;
    }

    if (!studentId) {
      handleError('Student ID is required');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('🔄 [useWeasyPrintPDF] Generating report for:', studentName);

      const newReportId = await WeasyPrintPDFService.generateTermReport({
        studentId,
        examSessionId
      });

      if (newReportId && isMountedRef.current) {
        setReportId(newReportId);
        handleSuccess('Report generated successfully!', newReportId);
        return newReportId;
      }

      throw new Error('Failed to generate report');

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate report';
      handleError(errorMsg);
      console.error('❌ [useWeasyPrintPDF] Generation error:', err);
      return null;

    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false);
      }
    }
  }, [studentId, studentName, examSessionId, handleError, handleSuccess]);

  /**
   * Verify if a report exists
   */
  const verifyReport = useCallback(async (reportIdToVerify: string): Promise<boolean> => {
    if (!reportIdToVerify) {
      handleError('Report ID is required for verification', false);
      return false;
    }

    setIsVerifying(true);
    setError(null);

    try {
      console.log('🔍 [useWeasyPrintPDF] Verifying report:', reportIdToVerify);

      const exists = await WeasyPrintPDFService.verifyReportExists({
        reportId: reportIdToVerify,
        educationLevel
      });

      if (!exists) {
        handleError('Report not found in database', false);
      }

      return exists;

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to verify report';
      handleError(errorMsg, false);
      console.error('❌ [useWeasyPrintPDF] Verification error:', err);
      return false;

    } finally {
      if (isMountedRef.current) {
        setIsVerifying(false);
      }
    }
  }, [educationLevel, handleError]);

  /**
   * Download PDF for an existing report
   */
  const downloadPDF = useCallback(async (reportIdToDownload: string): Promise<void> => {
    if (!reportIdToDownload) {
      handleError('Report ID is required for download');
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      console.log('📥 [useWeasyPrintPDF] Downloading PDF for report:', reportIdToDownload);

      const blob = await WeasyPrintPDFService.downloadTermReportPDF({
        reportId: reportIdToDownload,
        educationLevel,
        term
      });

      const filename = WeasyPrintPDFService.generateFilename(
        studentName,
        educationLevel,
        term,
        session
      );

      WeasyPrintPDFService.triggerBlobDownload(blob, filename);
      handleSuccess('PDF downloaded successfully!');

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to download PDF';
      handleError(errorMsg);
      console.error('❌ [useWeasyPrintPDF] Download error:', err);

    } finally {
      if (isMountedRef.current) {
        setIsDownloading(false);
      }
    }
  }, [educationLevel, term, studentName, session, handleError, handleSuccess]);

  /**
   * Complete workflow: Generate and download
   */
  const generateAndDownload = useCallback(async (): Promise<void> => {
    if (!examSessionId) {
      handleError('Exam session is required');
      return;
    }

    if (!studentId) {
      handleError('Student ID is required');
      return;
    }

    try {
      console.log('🔄 [useWeasyPrintPDF] Starting complete workflow...');

      await WeasyPrintPDFService.generateAndDownloadReport(
        studentId,
        studentName,
        examSessionId,
        educationLevel,
        term,
        session
      );

      handleSuccess('Report generated and downloaded successfully!');

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate and download report';
      handleError(errorMsg);
      console.error('❌ [useWeasyPrintPDF] Workflow error:', err);
    }
  }, [
    studentId,
    studentName,
    examSessionId,
    educationLevel,
    term,
    session,
    handleError,
    handleSuccess
  ]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setIsGenerating(false);
    setIsDownloading(false);
    setIsVerifying(false);
    setReportId(null);
    setError(null);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    isGenerating,
    isDownloading,
    isVerifying,
    isLoading,
    reportId,
    error,
    
    // Actions
    generateReport,
    verifyReport,
    downloadPDF,
    generateAndDownload,
    reset,

    // Utility
    canGenerate,
    canDownload
  };
};

export default useWeasyPrintPDF;