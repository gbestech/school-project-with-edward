/**
 * WeasyPrintPDFService.ts
 * Dedicated service for handling WeasyPrint PDF generation and downloads
 * Completely separate from React PDF functionality
 */

import api from './api';

export type EducationLevel = 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY';
export type TermType = 'FIRST' | 'SECOND' | 'THIRD';

interface PDFDownloadOptions {
  reportId: string;
  educationLevel: EducationLevel;
  term?: TermType;
}

interface BulkPDFDownloadOptions {
  reportIds: string[];
  educationLevel: EducationLevel;
}

interface VerifyReportOptions {
  reportId: string;
  educationLevel: EducationLevel;
}

interface GenerateReportOptions {
  studentId: string;
  examSessionId: string;
}

class WeasyPrintPDFService {
  private baseURL = '/api/results/report-generation';

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string {
    const token = 
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    return token;
  }

  /**
   * Get base API URL from environment
   */
  private getBaseURL(): string {
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }

  /**
   * Verify if a report exists in the database
   */
  async verifyReportExists(options: VerifyReportOptions): Promise<boolean> {
    try {
      console.log('🔍 [WeasyPrint] Verifying report:', options);

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(options.reportId)) {
        console.error('❌ [WeasyPrint] Invalid report ID format:', options.reportId);
        return false;
      }

      const response = await api.get(`${this.baseURL}/verify-report/`, {
        params: {
          report_id: options.reportId,
          education_level: options.educationLevel.toUpperCase()
        }
      });

      console.log('✅ [WeasyPrint] Report verified:', response);
      return true;

    } catch (error: any) {
      console.error('❌ [WeasyPrint] Report verification failed:', error);
      
      if (error?.response?.status === 404) {
        console.log('⚠️ [WeasyPrint] Report not found in database');
      }
      
      return false;
    }
  }

  /**
   * Generate a new term report
   */
  async generateTermReport(options: GenerateReportOptions): Promise<string | null> {
    try {
      console.log('📝 [WeasyPrint] Generating term report:', options);

      const response = await api.post('/api/results/student-term-results/generate_report/', {
        student_id: options.studentId,
        exam_session_id: options.examSessionId
      });

      console.log('✅ [WeasyPrint] Term report generated:', response);

      if (!response.id || typeof response.id !== 'string') {
        console.error('❌ [WeasyPrint] Invalid report ID returned:', response.id);
        throw new Error('Invalid report ID returned from server');
      }

      // Wait for database commit
      console.log('⏳ [WeasyPrint] Waiting for database commit...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      return response.id;

    } catch (error: any) {
      console.error('❌ [WeasyPrint] Failed to generate term report:', error);
      throw new Error(
        error?.response?.data?.detail || 
        error?.response?.data?.message || 
        'Failed to generate term report'
      );
    }
  }

  /**
   * Download term report as PDF
   */
  async downloadTermReportPDF(options: PDFDownloadOptions): Promise<Blob> {
    try {
      console.group('📥 [WeasyPrint] downloadTermReportPDF');
      console.log('Options:', options);

      const authToken = this.getAuthToken();
      const baseURL = this.getBaseURL();
      
      const url = new URL(`${baseURL}${this.baseURL}/download-term-report/`);
      url.searchParams.append('report_id', options.reportId);
      url.searchParams.append('education_level', options.educationLevel.toUpperCase());

      if (options.term) {
        url.searchParams.append('term', options.term.toUpperCase());
      }

      console.log('📡 Fetching from:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/pdf, application/octet-stream, */*'
        }
      });

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const blob = await response.blob();
      
      console.log('✅ PDF blob received:', {
        size: blob.size,
        type: blob.type,
        sizeInKB: (blob.size / 1024).toFixed(2) + ' KB'
      });

      if (blob.size === 0) {
        throw new Error('Received empty PDF file. The report may not be ready yet.');
      }

      console.log('✅ Download successful');
      console.groupEnd();

      return blob;

    } catch (error: any) {
      console.error('❌ [WeasyPrint] Error downloading term report PDF:', error);
      console.groupEnd();
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  /**
   * Download session report as PDF (Senior Secondary only)
   */
  async downloadSessionReportPDF(reportId: string): Promise<Blob> {
    try {
      console.group('📥 [WeasyPrint] downloadSessionReportPDF');
      console.log('Report ID:', reportId);

      const authToken = this.getAuthToken();
      const baseURL = this.getBaseURL();
      
      const url = new URL(`${baseURL}${this.baseURL}/download-session-report/`);
      url.searchParams.append('report_id', reportId);

      console.log('📡 Fetching from:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/pdf, application/octet-stream, */*'
        }
      });

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const blob = await response.blob();
      console.log('✅ PDF blob received:', blob.size, 'bytes');
      console.groupEnd();

      return blob;

    } catch (error) {
      console.error('❌ [WeasyPrint] Error downloading session report PDF:', error);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * Bulk download multiple term reports as ZIP
   */
  async bulkDownloadTermReports(options: BulkPDFDownloadOptions): Promise<Blob> {
    try {
      console.group('📥 [WeasyPrint] bulkDownloadTermReports');
      console.log('Report IDs:', options.reportIds);
      console.log('Education Level:', options.educationLevel);

      const authToken = this.getAuthToken();
      const baseURL = this.getBaseURL();
      const url = `${baseURL}${this.baseURL}/bulk-download/`;

      console.log('📡 Posting to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/zip, application/octet-stream, */*'
        },
        body: JSON.stringify({
          report_ids: options.reportIds,
          education_level: options.educationLevel.toUpperCase()
        })
      });

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const blob = await response.blob();
      
      console.log('✅ ZIP blob received:', {
        size: blob.size,
        type: blob.type,
        sizeInMB: (blob.size / 1024 / 1024).toFixed(2) + ' MB'
      });

      if (blob.size === 0) {
        throw new Error('Received empty ZIP file');
      }

      console.log('✅ Bulk download successful');
      console.groupEnd();

      return blob;

    } catch (error) {
      console.error('❌ [WeasyPrint] Error bulk downloading reports:', error);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * Trigger browser download of a blob
   */
  triggerBlobDownload(blob: Blob, filename: string): void {
    try {
      console.log('💾 [WeasyPrint] Triggering download:', filename);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('✅ [WeasyPrint] Download triggered and cleaned up');
      }, 100);

    } catch (error) {
      console.error('❌ [WeasyPrint] Error triggering download:', error);
      throw new Error('Failed to trigger file download');
    }
  }

  /**
   * Generate filename for PDF download
   */
  generateFilename(
    studentName: string,
    educationLevel: EducationLevel,
    term?: string,
    session?: string
  ): string {
    const sanitizedName = studentName.replace(/[^a-z0-9]/gi, '_');
    const termPart = term ? `_${term}` : '';
    const sessionPart = session ? `_${session}` : '';
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `${sanitizedName}_${educationLevel}${termPart}${sessionPart}_${timestamp}.pdf`;
  }

  /**
   * Handle error responses from API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
        console.error('❌ [WeasyPrint] Error data:', errorData);
      } else {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }
    } catch (parseError) {
      console.warn('⚠️ [WeasyPrint] Could not parse error response');
    }

    console.error('❌ [WeasyPrint] Request failed:', errorMessage);

    // Provide helpful error messages
    if (response.status === 404) {
      throw new Error('Report not found. Please ensure the report has been generated.');
    } else if (response.status === 403) {
      throw new Error('Access denied. You may not have permission to view this report.');
    } else if (response.status === 401) {
      throw new Error('Authentication expired. Please log in again.');
    } else {
      throw new Error(errorMessage);
    }
  }

  /**
   * Complete workflow: Generate report and download PDF
   */
  async generateAndDownloadReport(
    studentId: string,
    studentName: string,
    examSessionId: string,
    educationLevel: EducationLevel,
    term?: TermType,
    session?: string
  ): Promise<void> {
    try {
      console.log('🔄 [WeasyPrint] Starting generate and download workflow...');

      // Step 1: Generate report
      const reportId = await this.generateTermReport({
        studentId,
        examSessionId
      });

      if (!reportId) {
        throw new Error('Failed to generate report');
      }

      // Step 2: Verify report exists
      let verifyAttempts = 0;
      let exists = false;

      while (verifyAttempts < 3 && !exists) {
        exists = await this.verifyReportExists({
          reportId,
          educationLevel
        });

        if (!exists) {
          verifyAttempts++;
          if (verifyAttempts < 3) {
            console.log(`⏳ [WeasyPrint] Verification attempt ${verifyAttempts} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        }
      }

      if (!exists) {
        throw new Error('Report was created but could not be verified after 3 attempts');
      }

      // Step 3: Download PDF
      const blob = await this.downloadTermReportPDF({
        reportId,
        educationLevel,
        term
      });

      // Step 4: Trigger download
      const filename = this.generateFilename(studentName, educationLevel, term, session);
      this.triggerBlobDownload(blob, filename);

      console.log('✅ [WeasyPrint] Complete workflow finished successfully');

    } catch (error) {
      console.error('❌ [WeasyPrint] Workflow failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new WeasyPrintPDFService();