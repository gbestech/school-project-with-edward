import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useResultService } from "@/hooks/useResultService";
import { SchoolSettings } from '@/types/types';
import type { 
  GradingSystem, 
  GradeRange,
  ScoringConfiguration,
  ExamSession 
} from "@/services/ResultSettingsService";

// Updated interfaces to match your data structure
export interface StudentBasicInfo {
  id: string;
  name: string;
  full_name?: string;
  class: string;
  house?: string;
  age?: number;
}

export interface TermInfo {
  name: string;
  session: string;
  year: string;
}

export interface SubjectResult {
  id: string;
  subject: {
    id: string;
    name: string;
  };
  continuous_assessment_score: number;
  take_home_test_score: number;
  project_score: number;
  appearance_score: number;
  note_copying_score: number;
  practical_score: number;
  ca_total: number; // 40 marks (15+5+5+5+5+5)
  exam_marks: number; // 60 marks
  total_obtainable: number; // 100 marks
  mark_obtained: number;
  grade?: string;
  position?: string;
  teacher_remark?: string;
  is_passed?: boolean;
}

export interface PrimaryResultData {
  id: string;
  student: StudentBasicInfo;
  term: TermInfo;
  subjects: SubjectResult[];
  total_score: number;
  average_score: number;
  overall_grade: string;
  class_position: number;
  total_students: number;
  attendance: {
    times_opened: number;
    times_present: number;
  };
  next_term_begins: string;
  class_teacher_remark?: string;
  head_teacher_remark?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const SUBJECTS = [
  "ENGLISH STUDIES",
  "MATHEMATICS",
  "BASIC SCIENCE & TECHNOLOGY (BST)",
  "NATIONAL VALUE (NV)",
  "CULTURAL & CREATIVE ARTS (CCA)",
  "PRE VOCATIONAL STUDIES (PVS)",
  "YORUBA/HAUSA/IGBO",
  "CRS / ARABIC",
  "FRENCH LANGUAGE",
  "HAND WRITING",
  "HISTORY",
];

const COLUMN_HEADERS = [
  "C.A\n(15 MARKS)",
  "TAKE HOME\nTEST",
  "PROJECT\nMARKS",
  "APPEARANCE\nMARKS",
  "PRACTICAL\nMARKS",
  "NOTE COPYING\nMARKS",
  "C.A\nTOTAL",
  "EXAM\n(60%)",
  "TOTAL\n(100%)",
  "POSITION",
  "GRADE",
  "CLASS TEACHER REMARKS",
];

const WatermarkLogo = ({ schoolInfo }: { schoolInfo: SchoolSettings }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-3 z-0">
    <div className="text-center">
      <div 
        className="w-64 h-64 rounded-full flex items-center justify-center mb-6 mx-auto border-4"
        style={{ 
          background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.1), rgba(59, 130, 246, 0.1))',
          borderColor: 'rgba(30, 64, 175, 0.2)'
        }}
      >
        <div className="text-center" style={{ color: 'rgba(30, 64, 175, 0.3)' }}>
          {schoolInfo?.logo ? (
            <img 
              src={schoolInfo.logo} 
              alt="School Logo" 
              className="w-16 h-16 opacity-30 mx-auto mb-2" 
            />
          ) : (
            <div className="text-4xl font-bold mb-2">
              {schoolInfo?.school_name?.split(' ').map((word: string) => word[0]).join('') || 'GTS'}
            </div>
          )}
          <div className="text-sm font-semibold">
            {schoolInfo?.school_name?.toUpperCase() || "GOD'S TREASURE SCHOOLS"}
          </div>
        </div>
      </div>
      <div 
        className="text-5xl font-bold tracking-wider"
        style={{ color: 'rgba(30, 64, 175, 0.15)' }}
      >
        {schoolInfo?.school_name?.toUpperCase() || "GOD'S TREASURE SCHOOLS"}
      </div>
    </div>
  </div>
);

// Enhanced interface with additional props
interface PrimaryResultProps {
  data: PrimaryResultData;
  studentId?: string;
  examSessionId?: string;
  templateId?: string;
  onDataChange?: (data: PrimaryResultData) => void;
  onPDFGenerated?: (pdfUrl: string) => void;
  enableEnhancedFeatures?: boolean;
}

export default function PrimaryResult({ 
  data, 
  studentId, 
  examSessionId, 
  templateId,
  onDataChange,
  onPDFGenerated,
  enableEnhancedFeatures = true
}: PrimaryResultProps) {
  const ref = useRef(null);
  const { service, schoolSettings, loading: serviceLoading } = useResultService();
  
  // Debug logging
  console.log('PrimaryResult - schoolSettings:', schoolSettings);
  console.log('PrimaryResult - serviceLoading:', serviceLoading);
  
  const [gradingSystem, setGradingSystem] = useState<GradingSystem | null>(null);
  const [grades, setGrades] = useState<GradeRange[]>([]);
  const [scoringConfig, setScoringConfig] = useState<ScoringConfiguration | null>(null);
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGradingData = async () => {
      if (!service || serviceLoading) return;

      try {
        setLoading(true);
        setError(null);

        // Get active grading systems
        const gradingSystems = await service.getGradingSystems();
        const activeSystem = gradingSystems.find((system: GradingSystem) => system.is_active);
        
        if (activeSystem) {
          setGradingSystem(activeSystem);
          
          // Get grades for this grading system
          const systemGrades = await service.getGrades(activeSystem.id);
          setGrades(systemGrades);
        }

        // Get scoring configuration for primary level
        const scoringConfigs = await service.getScoringConfigurationsByEducationLevel('PRIMARY');
        const primaryScoringConfig = scoringConfigs.find((config: ScoringConfiguration) => 
          config.education_level === 'PRIMARY' && config.is_active
        );
        if (primaryScoringConfig) {
          setScoringConfig(primaryScoringConfig);
        }

        // Load exam session data if examSessionId is provided
        if (examSessionId && enableEnhancedFeatures) {
          try {
            const sessions = await service.getExamSessions();
            const currentSession = sessions.find((session: ExamSession) => session.id === examSessionId);
            if (currentSession) {
              setExamSession(currentSession);
            }
          } catch (sessionError) {
            console.warn('Failed to load exam session:', sessionError);
          }
        }

      } catch (err) {
        console.error('Error fetching grading system:', err);
        setError('Failed to load grading system');
      } finally {
        setLoading(false);
      }
    };

    fetchGradingData();
  }, [service, serviceLoading, examSessionId, enableEnhancedFeatures]);

  // Enhanced PDF generation with better naming and metadata
  const downloadPDF = async () => {
    const element = ref.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        scrollX: 0,
        scrollY: 0
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Get image properties and calculate dimensions
      const imgProps = (pdf as any).getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let finalHeight = imgHeight;
      let finalWidth = imgWidth;
      if (imgHeight > pdfHeight) {
        finalHeight = pdfHeight;
        finalWidth = (imgProps.width * pdfHeight) / imgProps.height;
      }

      // Add image to PDF
      (pdf as any).addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);
      
      // Enhanced filename with more context
      const studentName = data.student?.name || data.student?.full_name || 'student';
      const term = data.term?.name || 'term';
      const session = data.term?.session || data.term?.year || 'session';
      const timestamp = new Date().toISOString().split('T')[0];
      
      const filename = `${studentName.replace(/\s+/g, '_')}_primary_result_${term}_${session}_${timestamp}.pdf`;
      
      // Save PDF
      pdf.save(filename);

      // Call the callback if provided
      if (onPDFGenerated) {
        const pdfBlob = (pdf as any).output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        onPDFGenerated(pdfUrl);
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
    }
  };

  // Enhanced result generation using enhanced result service
  const generateEnhancedPDF = async () => {
    if (!studentId || !examSessionId || !service || !enableEnhancedFeatures) {
      // Fall back to regular PDF generation
      return downloadPDF();
    }

    try {
      const enhancedResult = await service.generateEnhancedResultSheet(studentId, examSessionId);
      
      // Check if enhanced result has a PDF download URL or similar
      if (enhancedResult && 'download_url' in enhancedResult && enhancedResult.download_url) {
        // Open the generated PDF
        window.open(enhancedResult.download_url as string, '_blank');
        
        if (onPDFGenerated) {
          onPDFGenerated(enhancedResult.download_url as string);
        }
      } else {
        // Fall back to client-side PDF generation
        await downloadPDF();
      }
    } catch (error) {
      console.error('Enhanced PDF generation failed:', error);
      // Fall back to client-side PDF generation
      await downloadPDF();
    }
  };

  // Helper function to get grade for a score
  const getGradeForScore = (score: number): { grade: string; remark: string; isPass: boolean } => {
   if (!gradingSystem || grades.length === 0) {
      // Default grading if no system is available
      if (score >= 70) return { grade: 'A', remark: 'Distinction', isPass: true };
      if (score >= 60) return { grade: 'B', remark: 'Very Good', isPass: true };
      if (score >= 50) return { grade: 'C', remark: 'Good', isPass: true };
      if (score >= 45) return { grade: 'D', remark: 'Fair', isPass: true };
      if (score >= 40) return { grade: 'E', remark: 'Pass', isPass: true };
      return { grade: 'F', remark: 'Fail', isPass: false };
    }

    const gradeRange = grades.find(g => score >= g.min_score && score <= g.max_score);
    
    if (gradeRange) {
      return {
        grade: gradeRange.grade,
        remark: gradeRange.remark,
        isPass: gradeRange.is_passing
      };
    }

    const isPass = score >= gradingSystem.pass_mark;
    return {
      grade: isPass ? 'P' : 'F',
      remark: isPass ? 'Pass' : 'Fail',
      isPass
    };
  };

  // Get subject result data
  const getSubjectData = (subjectName: string) => {
    if (!data.subjects || data.subjects.length === 0) return null;
    
    return data.subjects.find(subject => 
      subject.subject.name.toUpperCase().includes(subjectName.toUpperCase()) ||
      subjectName.toUpperCase().includes(subject.subject.name.toUpperCase())
    );
  };

  // Helper function to get position with ordinal suffix
  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  // Handle data changes and propagate to parent
  const handleDataUpdate = (updates: Partial<PrimaryResultData>) => {
    const updatedData = { ...data, ...updates };
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  if (serviceLoading || loading || !schoolSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading result data...</p>
          {examSessionId && (
            <p className="text-sm text-gray-600 mt-2">Loading exam session: {examSessionId}</p>
          )}
          {!schoolSettings && (
            <p className="text-sm text-gray-600 mt-2">Loading school settings...</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
          {studentId && (
            <p className="text-sm mt-2">Student ID: {studentId}</p>
          )}
        </div>
      </div>
    );
  }

  const schoolInfo = schoolSettings;

  return (
    <div className="p-3 bg-gray-100 min-h-screen">
      <div className="mb-4 flex gap-4 flex-wrap">
        <button
          onClick={enableEnhancedFeatures ? generateEnhancedPDF : downloadPDF}
          className="px-4 py-2 bg-indigo-700 text-white rounded shadow hover:bg-indigo-800 transition-colors"
        >
          {enableEnhancedFeatures ? 'Generate Enhanced PDF' : 'Download PDF'}
        </button>
        
        <div className="text-sm text-gray-600 flex items-center gap-4 flex-wrap">
          <span>Student: {data.student?.name}</span>
          <span>Class: {data.student?.class}</span>
          <span>Term: {data.term?.name}</span>
          <span>Session: {data.term?.session || data.term?.year}</span>
          {studentId && <span>ID: {studentId}</span>}
          {examSessionId && <span>Exam Session: {examSessionId}</span>}
          {templateId && <span>Template: {templateId}</span>}
          {data.is_published && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
              ✓ Published
            </span>
          )}
          {examSession && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              Session: {examSession.name}
            </span>
          )}
        </div>
      </div>

      <div
        ref={ref}
        className="bg-white mx-auto p-6 border border-gray-300 relative"
        style={{ width: '850px' }}
      >
        {schoolInfo && <WatermarkLogo schoolInfo={schoolInfo} />}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="grid grid-cols-[20%_60%_20%] gap-4 mb-4">
            {/* Logo section - 30% width */}
            <div className="flex justify-start items-center">
              {schoolSettings?.logo ? (
                <img 
                  src={schoolSettings.logo} 
                  alt="School Logo" 
                  className="w-16 h-16 object-contain rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                  {schoolSettings?.school_name?.split(' ').map((word: string) => word[0]).join('') || 'LOGO'}
                </div>
              )}
            </div>

            {/* School name block - 70% width, centered */}
            <div className="text-center relative z-10">
              <h1 className="text-3xl font-bold text-blue-900 mb-2">
                {schoolInfo?.school_name?.toUpperCase() || "SCHOOL NAME HERE"}
              </h1>
              <p className="text-xs text-gray-600">
                {schoolSettings?.address || "School Address, City, State"}
              </p>
              <p className="text-sm text-gray-600">
                Phone: {schoolSettings?.phone || "(123) 456-7890"} | Email: {schoolSettings?.email || "info@school.com"}
              </p>
            </div>
          </div>

          {/* Student report block - below the grid */}
          <div className="bg-blue-900 text-white py-1 px-2 rounded-lg inline-block">
            <h5 className="text-sm font-semibold">PRIMARY SCHOOL TERMLY REPORT</h5>
            <p className="text-xs">
              {data.term?.name || '1st Term'}, {data.term?.session || data.term?.year || '2025'} Academic Session
            </p>
            {examSession && (
              <p className="text-xs mt-1 opacity-90">
                Exam Session: {examSession.name} ({examSession.exam_type})
              </p>
            )}
          </div>
        </div>

        {/* Student Information */}
        <div className="mb-6 text-sm space-y-3 relative z-10">
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">NAME: </span>
                <span className="bg-white px-2 text-slate-800 font-medium">
                  {data.student?.name || data.student?.full_name || ""}
                </span>
            
              <span className="ml-4 font-semibold text-slate-700">AGE: </span> <span className="bg-white px-2 text-slate-800 font-medium">
                  {data.student?.age || ""}
                </span>
              
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">CLASS: </span> <span className="bg-white px-2 text-slate-800 font-medium">
                  {data.student?.class || 'PRIMARY 1'}
                </span>
              
              <span className="ml-4 font-semibold text-slate-700">NO IN CLASS: </span><span className="bg-white px-2 text-slate-800 font-medium">
                  {data.total_students || ''}
                </span>
              <span className="ml-4 font-semibold text-slate-700">POSITION IN CLASS: </span> <span className="bg-white px-2 text-slate-800 font-medium">
                  {data.class_position ? `${data.class_position}${getOrdinalSuffix(data.class_position)}` : ''}
                </span>
            
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">NUMBER OF TIMES SCHOOL OPENED: </span> <span className="bg-white px-2 text-slate-800 font-medium">
                  {data.attendance?.times_opened || ""}
                </span>
              <span className="ml-4 font-semibold text-slate-700">NUMBER OF TIMES PRESENT: </span><span className="bg-white px-2 text-slate-800 font-medium">
                  {data.attendance?.times_present || ""}
                </span>
              <span className="ml-4 font-semibold text-slate-700">NEXT TERM BEGINS: </span> <span className="bg-white px-2 text-slate-800 font-medium">
                  {data.next_term_begins ? new Date(data.next_term_begins).toLocaleDateString() : ""}
                </span>
              
            </div>
          </div>

          {/* Template and Session Info */}
          {(templateId || examSession) && (
            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
              <div className="text-xs text-gray-700 space-y-1">
                {templateId && (
                  <div><span className="font-medium">Template ID:</span> {templateId}</div>
                )}
                {examSession && (
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-medium">Session Type:</span> {examSession.exam_type}</div>
                    <div><span className="font-medium">Term:</span> {examSession.term}</div>
                    <div><span className="font-medium">Start Date:</span> {new Date(examSession.start_date).toLocaleDateString()}</div>
                    <div><span className="font-medium">End Date:</span> {new Date(examSession.end_date).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Academic Performance title */}
        <div className="text-center font-semibold text-base mb-2 text-blue-900 rounded-lg relative z-10">
          ACADEMIC PERFORMANCE
        </div>

        {/* Main table area */}
        <div className="overflow-x-auto mb-6 relative z-10">
          <table className="w-full border-collapse border-2 border-slate-800 min-w-full bg-white">
            <thead>
              <tr style={{ height: '100px' }}>
                <th 
                  className="border border-slate-600 p-2 text-left align-top bg-slate-100"
                  style={{ width: '180px', height: '100px' }}
                >
                  <div className="text-[10px] font-bold mb-1 text-slate-800">SUBJECTS/KEY TO GRADING</div>
                  {grades.length > 0 ? (
                    <div className="text-[9px] leading-tight space-y-0.5 text-slate-600">
                      {grades
                        .sort((a, b) => b.min_score - a.min_score)
                        .slice(0, 6)
                        .map(grade => (
                          <div key={grade.id}>
                            {grade.grade} {grade.description || grade.remark} {grade.min_score} - {grade.max_score}%
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-[8px] leading-tight space-y-0.5 text-slate-600">
                      <div>A DISTINCTION 70.00 - 100.00%</div>
                      <div>B VERY GOOD 60.00 - 69.00%</div>
                      <div>C GOOD 50.00 - 59.00%</div>
                      <div>D PASS 45.00 - 49.00%</div>
                      <div>D FAIR 40.00 - 44.00%</div>
                      <div>F 0.00 - 39.00%</div>
                    </div>
                  )}
                </th>

                {/* Rotated column headers */}
                {COLUMN_HEADERS.map((header, idx) => (
                  <th 
                    key={idx}
                    className="border border-slate-600 p-0.5 relative bg-slate-200"
                    style={{ 
                      width: '45px', 
                      height: '100px',
                      minWidth: '32px'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="transform -rotate-90 origin-center text-[9px] font-medium text-center leading-tight text-slate-700"
                        style={{ 
                          writingMode: 'horizontal-tb',
                          transformOrigin: 'center center',
                          width: '90px',
                          textAlign: 'center',
                          height: '100px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        {header.split('\n').map((line, i) => (
                          <div key={i} style={{ 
                            marginBottom: i < header.split('\n').length - 1 ? '3px' : '0',
                            lineHeight: '1.1'
                          }}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  </th>
                ))}

                <th 
                  className="border border-slate-600 p-1 text-center font-bold bg-slate-300"
                  style={{ width: '40px', height: '100px' }}
                >
                  <div className="text-[10px] flex items-center justify-center h-full text-slate-800">GRADE</div>
                </th>
              </tr>
            </thead>

            <tbody>
              {SUBJECTS.map((subject, idx) => {
                const subjectData = getSubjectData(subject);
                const totalScore = subjectData ? subjectData.mark_obtained || 0 : 0;
                const gradeInfo = getGradeForScore(totalScore);
                
                return (
                  <tr key={idx}>
                    <td 
                      className={`border border-slate-600 p-2 font-semibold text-[10px] ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                      style={{ minHeight: '24px' }}
                    >
                      {subject}
                    </td>
                    
                    {/* Continuous Assessment Score (15 marks) */}
                    <td className={`border border-slate-600 p-0.5 text-center text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      {subjectData?.continuous_assessment_score && !isNaN(subjectData.continuous_assessment_score) ? Math.round(subjectData.continuous_assessment_score) : ''}
                    </td>
                    
                    {/* Take Home Test */}
                    <td className={`border border-slate-600 p-0.5 text-center text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      {subjectData?.take_home_test_score && !isNaN(subjectData.take_home_test_score) ? Math.round(subjectData.take_home_test_score) : ''}
                    </td>
                    
                    {/* Project Marks */}
                    <td className={`border border-slate-600 p-0.5 text-center text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      {subjectData?.project_score && !isNaN(subjectData.project_score) ? Math.round(subjectData.project_score) : ''}
                    </td>
                    
                    {/* Appearance Marks */}
                    <td className={`border border-slate-600 p-0.5 text-center text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      {subjectData?.appearance_score && !isNaN(subjectData.appearance_score) ? Math.round(subjectData.appearance_score) : ''}
                    </td>
                    
                    {/* Practical Marks */}
                    <td className={`border border-slate-600 p-0.5 text-center text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      {subjectData?.practical_score && !isNaN(subjectData.practical_score) ? Math.round(subjectData.practical_score) : ''}
                    </td>
                    
                    {/* Note Copying Marks */}
                    <td className={`border border-slate-600 p-0.5 text-center text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      {subjectData?.note_copying_score && !isNaN(subjectData.note_copying_score) ? Math.round(subjectData.note_copying_score) : ''}
                    </td>
                    
                    {/* CA Total */}
                    <td className={`border border-slate-600 p-0.5 text-center text-xs font-semibold ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      {subjectData?.ca_total && !isNaN(subjectData.ca_total) ? Math.round(subjectData.ca_total) : ''}
                    </td>
                    
                    {/* Exam Score */}
                    <td className={`border border-slate-600 p-0.5 text-center text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      {subjectData?.exam_marks && !isNaN(subjectData.exam_marks) ? Math.round(subjectData.exam_marks) : ''}
                    </td>
                    
                    {/* Total Score */}
                    <td className={`border border-slate-600 p-0.5 text-center text-xs font-bold ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      {subjectData?.mark_obtained && !isNaN(subjectData.mark_obtained) ? Math.round(subjectData.mark_obtained) : ''}
                    </td>
                    
                    {/* Position */}
                    <td className={`border border-slate-600 p-0.5 text-center text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      {subjectData?.position || ''}
                    </td>
                    
                    {/* Grade */}
                    <td className={`border border-slate-600 p-0.5 text-center text-xs font-bold ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      {subjectData?.grade || (subjectData ? gradeInfo.grade : '')}
                    </td>
                    
                    {/* Teacher Remarks */}
                    <td className={`border border-slate-600 p-0.5 text-center text-[8px] ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      {subjectData?.teacher_remark || ''}
                    </td>
                    
                    <td 
                      className={`border border-slate-600 p-0.5 text-center text-xs font-bold ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                      style={{ width: '40px' }}
                    >
                      {subjectData?.grade || (subjectData ? gradeInfo.grade : '')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer area */}
        <div className="flex justify-between text-sm relative z-10">
          {/* Left side - Totals and Physical Development */}
          <div className="flex-1 pr-6">
            <div className="mb-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="mb-2 text-xs font-semibold text-slate-700">
                Total Scores: <span className="w-20 text-center">
                  {data.total_score ? Math.round(data.total_score) : ''}
                </span>
              </div>
              <div className="mb-2 text-xs font-semibold text-slate-700">
                Average Scores: <span className="w-20 text-center">
                  {data.average_score ? Math.round(data.average_score) : ''}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-700">
                Grade: <span className="w-20 text-center">
                  {data.overall_grade || (data.average_score ? getGradeForScore(data.average_score).grade : '')}
                </span>
              </div>
            </div>

            {/* Physical Development Table */}
            <div className="border-2 border-slate-800 rounded-lg overflow-hidden" style={{ width: '360px' }}>
              <div className="text-center font-bold py-2 text-xs bg-blue-900 text-white">
                PHYSICAL DEVELOPMENT
              </div>
              
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr>
                    <th className="border border-slate-600 p-1 text-center font-bold text-[10px] bg-slate-100" colSpan={2}>
                      HEIGHT
                    </th>
                    <th className="border border-slate-600 p-1 text-center font-bold text-[10px] bg-slate-100" colSpan={2}>
                      WEIGHT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-[9px]">
                    <td className="border border-slate-600 p-1 text-left bg-slate-50">
                      Beginning of<br />Term
                    </td>
                    <td className="border border-slate-600 p-1 text-left bg-white">
                      End of<br />Term
                    </td>
                    <td className="border border-slate-600 p-1 text-left bg-slate-50">
                      Beginning of<br />Term
                    </td>
                    <td className="border border-slate-600 p-1 text-left bg-white">
                      End of<br />Term
                    </td>
                  </tr>
                  <tr className="text-[9px] text-left">
                    <td className="border border-slate-600 p-1 text-center">cm</td>
                    <td className="border border-slate-600 p-1 text-center">cm</td>
                    <td className="border border-slate-600 p-1 text-center">cm</td>
                    <td className="border border-slate-600 p-1 text-center">cm</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-600 p-1 text-left text-[9px] bg-slate-100" colSpan={4}>
                      NURSE'S COMMENT
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right side - Comments and Signatures */}
          <div className="flex-1">
            <div className="mb-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="font-semibold text-[10px] text-slate-800">CLASS TEACHER'S COMMENT:</div>
              <div className="text-[10px] mt-1 text-slate-600">
                {data.class_teacher_remark || "Good and intelligent pupil keep it up"}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-[10px] font-medium text-slate-700">SIGNATURE/DATE: <span className="border-b border-slate-400 inline-block w-28"></span></div>
            </div>

            <div className="mb-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="font-semibold text-[10px] text-slate-800">HEAD TEACHER'S COMMENT:</div>
              <div className="text-[10px] mt-1 text-slate-600">
                {data.head_teacher_remark || "Such a zealous and hard working child. Impressive"}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-[10px] font-medium text-slate-700">SIGNATURE/DATE: <span className="border-b border-slate-400 inline-block w-28"></span></div>
            </div>

            <div>
              <div className="text-[10px] font-medium text-slate-700">PARENT'S SIGNATURE/DATE: <span className="border-b border-slate-400 inline-block w-32"></span></div>
            </div>
          </div>
        </div>

        {/* Enhanced Publication and Template Status */}
        <div className="mt-1 text-center relative z-10">
          {/* Generation timestamp */}
          <div className="mt-2 text-xs text-slate-500">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            {studentId && ` | Student ID: ${studentId}`}
          </div>
        </div>
      </div>
    </div>
  );
}