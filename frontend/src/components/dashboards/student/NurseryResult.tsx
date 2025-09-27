import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useResultService } from '@/hooks/useResultService';
import type { GradingSystem, GradeRange } from '@/services/ResultSettingsService';

// Updated interfaces to match your data structure
export interface StudentBasicInfo {
  id: string;
  name: string;
  full_name?: string;
  class: string;
  house?: string;
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
  max_marks_obtainable: number;
  mark_obtained: number;
  grade?: string;
  position?: string;
  is_passed?: boolean;
  physical_development_score?: number;
  // Physical development attributes
  physical_development?: 'EXCELLENT' | 'VERY GOOD' | 'GOOD' | 'FAIR';
  health?: 'EXCELLENT' | 'VERY GOOD' | 'GOOD' | 'FAIR';
  cleanliness?: 'EXCELLENT' | 'VERY GOOD' | 'GOOD' | 'FAIR';
  general_conduct?: 'EXCELLENT' | 'VERY GOOD' | 'GOOD' | 'FAIR';
  academic_comment?: string;
}

export interface NurseryResultData {
  id: string;
  student: StudentBasicInfo;
  term: TermInfo;
  subjects: SubjectResult[];
  total_score: number;
  max_marks_obtainable: number;
  mark_obtained: number;
  position: number;
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

type NurseryResultProps = {
  data: NurseryResultData;
  onDataChange?: (data: NurseryResultData) => void;
};

const SchoolLogo = ({ logoUrl, school_name }: { logoUrl?: string; school_name?: string }) => {
  if (logoUrl) {
    return (
      <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-blue-600">
        <img 
          src={logoUrl} 
          alt={`${school_name || 'School'} Logo`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="w-full h-full rounded-xl flex items-center justify-center text-white shadow-lg hidden" 
             style={{
               background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
               border: '2px solid #1e40af'
             }}>
          <div className="text-center text-xs">
            <div className="font-bold text-lg mb-1">
              {school_name?.split(' ').map(word => word[0]).join('').slice(0, 3) || 'SCH'}
            </div>
            <div className="text-[8px] font-medium">SCHOOL</div>
            <div className="text-[8px] font-medium">LOGO</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-20 h-20 rounded-xl flex items-center justify-center text-white shadow-lg" 
         style={{
           background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
           border: '2px solid #1e40af'
         }}>
      <div className="text-center text-xs">
        <div className="font-bold text-lg mb-1">
          {school_name?.split(' ').map(word => word[0]).join('').slice(0, 3) || 'SCH'}
        </div>
        <div className="text-[8px] font-medium">
          {school_name?.split(' ')[0]?.slice(0, 8) || 'SCHOOL'}
        </div>
        <div className="text-[8px] font-medium">
          {school_name?.split(' ')[1]?.slice(0, 8) || 'LOGO'}
        </div>
      </div>
    </div>
  );
};

const WatermarkLogo = ({ logoUrl, school_name }: { logoUrl?: string; school_name?: string }) => {
  if (logoUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
        <div className="text-center">
          <div className="w-80 h-80 rounded-full overflow-hidden mb-8 border-4 border-blue-600">
            <img 
              src={logoUrl} 
              alt="Watermark"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
          <div className="text-8xl font-bold" style={{ color: '#1e40af' }}>
            {school_name?.toUpperCase() || 'SCHOOL NAME'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
      <div className="text-center">
        <div className="w-80 h-80 rounded-full flex items-center justify-center mb-8 border-4"
             style={{
               background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
               borderColor: '#1e40af'
             }}>
          <div className="text-center text-white">
            <div className="text-6xl font-bold mb-4">
              {school_name?.split(' ').map(word => word[0]).join('').slice(0, 3) || 'SCH'}
            </div>
            <div className="text-2xl font-semibold">
              {school_name?.split(' ')[0] || 'SCHOOL'}
            </div>
            <div className="text-xl font-semibold">
              {school_name?.split(' ').slice(1).join(' ') || 'NAME'}
            </div>
          </div>
        </div>
        <div className="text-8xl font-bold" style={{ color: '#1e40af' }}>
          {school_name?.toUpperCase() || 'SCHOOL NAME'}
        </div>
      </div>
    </div>
  );
};

export default function NurseryResult({ data }: NurseryResultProps) {
  const { service, schoolSettings, loading: serviceLoading, error: serviceError } = useResultService();
  const [gradingSystem, setGradingSystem] = useState<GradingSystem | null>(null);
  const [grades, setGrades] = useState<GradeRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load grading system and grades
  useEffect(() => {
    const fetchGradingData = async () => {
      if (!service || serviceLoading) return;

      try {
        setLoading(true);
        setError(null);

        const gradingSystems = await service.getGradingSystems();
        const activeSystem = gradingSystems.find((system: GradingSystem) => system.is_active);
        
        if (activeSystem) {
          setGradingSystem(activeSystem);
          const systemGrades = await service.getGrades(activeSystem.id);
          setGrades(systemGrades);
        } else {
          setError('No active grading system found');
        }
      } catch (err) {
        console.error('Error fetching grading system:', err);
        setError('Failed to load grading system');
      } finally {
        setLoading(false);
      }
    };

    fetchGradingData();
  }, [service, serviceLoading]);

  // Helper function to get grade for a score
  const getGradeForScore = (score: number): { grade: string; remark: string; isPass: boolean } => {
    if (!gradingSystem || grades.length === 0) {
      return { grade: 'N/A', remark: 'Loading...', isPass: false };
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

  // Calculate percentage
  const calculatePercentage = (obtained: number, total: number): number => {
    return total > 0 ? (obtained / total) * 100 : 0;
  };

  // Enhanced results with calculated grades
  const enhancedResults = data.subjects?.map(subject => {
    const percentage = calculatePercentage(subject.mark_obtained, subject.max_marks_obtainable);
    const gradeInfo = getGradeForScore(percentage);
    
    return {
      ...subject,
      percentage,
      calculated_grade: gradeInfo.grade,
      calculated_remark: gradeInfo.remark,
      is_calculated_pass: gradeInfo.isPass,
      grade: subject.grade || gradeInfo.grade,
      is_passed: subject.is_passed !== undefined ? subject.is_passed : gradeInfo.isPass
    };
  }) || [];

  // Calculate overall statistics using the main data structure
  const overallPercentage = data.max_marks_obtainable > 0 
    ? (data.mark_obtained / data.max_marks_obtainable) * 100 
    : 0;
  const overallGrade = getGradeForScore(overallPercentage);

  const downloadPDF = async () => {
    const input = document.getElementById("nursery-result-sheet");
    if (!input) return;
    
    try {
      const canvas = await html2canvas(input, { 
        scale: 1.7,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pageWidth = 210;
      const pageHeight = 297;
      
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(`${data.student?.name || "nursery-result"}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Get physical development data - check if any subject has this data
  const getPhysicalDevelopmentData = (category: string) => {
    const subjectWithData = data.subjects?.find(subject => {
      switch(category) {
        case "PHYSICAL DEVELOPMENT": return subject.physical_development;
        case "HEALTH": return subject.health;
        case "CLEANLINESS": return subject.cleanliness;
        case "GENERAL CONDUCT": return subject.general_conduct;
        default: return false;
      }
    });

    if (!subjectWithData) return '';

    switch(category) {
      case "PHYSICAL DEVELOPMENT": return subjectWithData.physical_development;
      case "HEALTH": return subjectWithData.health;
      case "CLEANLINESS": return subjectWithData.cleanliness;
      case "GENERAL CONDUCT": return subjectWithData.general_conduct;
      default: return '';
    }
  };

  if (serviceLoading || loading || !schoolSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading school settings and grading system...</p>
        </div>
      </div>
    );
  }

  if (serviceError || error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Grading System</p>
          <p className="text-sm">{serviceError || error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" style={{
      background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
      minHeight: '100vh'
    }}>
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-indigo-700 text-white rounded shadow hover:bg-indigo-800 transition-colors"
        >
          Download PDF
        </button>
        
        {schoolSettings && (
          <div className="mb-4 text-sm text-gray-600">
            <span className="font-medium">School:</span> {schoolSettings.school_name} 
            {gradingSystem && (
              <>
                <span className="ml-4 font-medium">Grading System:</span> {gradingSystem.name} 
                <span className="ml-2">({gradingSystem.min_score}-{gradingSystem.max_score}, Pass: {gradingSystem.pass_mark})</span>
              </>
            )}
          </div>
        )}
      </div>

      <div id="nursery-result-sheet" className="relative p-6 w-[794px] mx-auto bg-white text-xs overflow-hidden shadow-2xl rounded-2xl border border-slate-200">
        
        {/* Background Watermark */}
        <WatermarkLogo 
          logoUrl={schoolSettings?.logo} 
          school_name={schoolSettings?.school_name} 
        />
        
        {/* Content Layer */}
        <div className="relative z-10">
          
          {/* HEADER with Logo */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <SchoolLogo 
                logoUrl={schoolSettings?.logo} 
                school_name={schoolSettings?.school_name} 
              />
            </div>
            <div className="flex-2 text-center mx-6">
              <h1 className="text-3xl font-black mb-2 tracking-tight" 
                  style={{ color: '#1e40af' }}>
                {schoolSettings?.school_name?.toUpperCase() || 'SCHOOL NAME'}
              </h1>
              <p className="text-sm text-slate-600 mb-1 font-medium">
                {schoolSettings?.address || 'School Address Not Set'}
              </p>
              <div className="text-sm text-slate-600 mb-3 font-medium">
                {schoolSettings?.phone && (
                  <span>Phone: {schoolSettings.phone}</span>
                )}
                {schoolSettings?.phone && schoolSettings?.email && ' | '}
                {schoolSettings?.email && (
                  <span>Email: {schoolSettings.email}</span>
                )}
              </div>
              {schoolSettings?.motto && (
                <p className="text-xs text-slate-500 mb-3 italic">
                  "{schoolSettings.motto}"
                </p>
              )}
              <div className="bg-red-600 text-white py-2 px-4 rounded-lg inline-block">
                <h2 className="text-lg font-bold">NURSERY SCHOOL TERMLY REPORT</h2>
                <p className="text-sm">{data.term?.name || '1st Term'}, {data.term?.session || data.term?.year || '2025'} Academic Session</p>
              </div>
            </div>
            <div className="flex-1"></div>
          </div>

          {/* Grading System Information */}
          {gradingSystem && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-sm mb-2 text-blue-900">Grading System: {gradingSystem.name}</h3>
              <div className="grid grid-cols-2 gap-4 text-xs text-blue-800">
                <div><span className="font-medium">Score Range:</span> {gradingSystem.min_score} - {gradingSystem.max_score}</div>
                <div><span className="font-medium">Pass Mark:</span> {gradingSystem.pass_mark}</div>
                <div><span className="font-medium">Grading Type:</span> {gradingSystem.grading_type}</div>
                <div><span className="font-medium">Total Subjects:</span> {enhancedResults.length}</div>
              </div>
              
              {/* Grade Legend */}
              {grades.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium text-xs text-blue-900 mb-1">Grade Legend:</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {grades.map(grade => (
                      <div key={grade.id} className="flex justify-between">
                        <span className="font-bold">{grade.grade}:</span>
                        <span>{grade.min_score}-{grade.max_score}</span>
                        <span className="text-blue-600">({grade.remark})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STUDENT INFORMATION */}
          <div className="mb-6 p-4 rounded-xl border border-slate-200"
               style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
            <div className="text-center font-black mb-4 text-lg tracking-wide"
                 style={{ color: '#1e40af' }}>
              PUPIL'S INFORMATION
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[150px]">NAME:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {data.student?.name || data.student?.full_name || ""}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[150px]">CLASS:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {data.student?.class || ""}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[150px]">TERM:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {data.term?.name || ""}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[150px]">HOUSE:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {data.student?.house || ""}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[150px]">NO OF TIMES SCHOOL OPENED:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {data.attendance?.times_opened || ""}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[150px]">NO OF TIMES PRESENT:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {data.attendance?.times_present || ""}
                </span>
              </div>
            </div>
          </div>

          {/* PHYSICAL DEVELOPMENT */}
          <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-slate-200">
            <div className="text-center font-bold py-3 text-white text-sm tracking-wide"
                 style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
              PHYSICAL DEVELOPMENT / SPECIAL REPORTS DURING THE TERM
            </div>
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
                  <th className="border border-slate-300 w-1/4 py-3 text-center font-bold text-slate-700"> </th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">EXCELLENT</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">VERY GOOD</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">GOOD</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">FAIR</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">COMMENTS</th>
                </tr>
              </thead>
              <tbody>
                {["PHYSICAL DEVELOPMENT", "HEALTH", "CLEANLINESS", "GENERAL CONDUCT"].map((item, idx) => {
                  const value = getPhysicalDevelopmentData(item);

                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 text-left px-4 py-3 font-bold text-slate-700">{item}</td>
                      <td className="border border-slate-300 py-3 h-10 text-center">
                        {value === 'EXCELLENT' ? '✓' : ''}
                      </td>
                      <td className="border border-slate-300 py-3 h-10 text-center">
                        {value === 'VERY GOOD' ? '✓' : ''}
                      </td>
                      <td className="border border-slate-300 py-3 h-10 text-center">
                        {value === 'GOOD' ? '✓' : ''}
                      </td>
                      <td className="border border-slate-300 py-3 h-10 text-center">
                        {value === 'FAIR' ? '✓' : ''}
                      </td>
                      <td className="border border-slate-300 py-3 h-10 text-center">
                        {value && !['EXCELLENT', 'VERY GOOD', 'GOOD', 'FAIR'].includes(value) ? value : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ACADEMIC PERFORMANCE */}
          <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-slate-200">
            <div className="text-center font-bold py-3 text-white text-sm tracking-wide"
                 style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
              ACADEMIC PERFORMANCE
            </div>
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
                  <th className="border border-slate-300 w-2/5 py-3 text-center font-bold text-slate-700">SUBJECTS</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">MAX MARKS<br/>OBTAINABLE</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">MARK<br/>OBTAINED</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">%</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">GRADE</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">POSITIONS</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">COMMENTS</th>
                </tr>
              </thead>
              <tbody>
                {enhancedResults.length > 0 ? (
                  enhancedResults.map((result, idx) => (
                    <tr key={result.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 text-left px-4 py-3 font-medium text-slate-700">
                        {result.subject?.name || 'N/A'}
                      </td>
                      <td className="border border-slate-300 py-3 h-10 text-center">
                        {result.max_marks_obtainable}
                      </td>
                      <td className="border border-slate-300 py-3 h-10 text-center">
                        {result.mark_obtained}
                      </td>
                      <td className="border border-slate-300 py-3 h-10 text-center">
                        {result.percentage.toFixed(1)}%
                      </td>
                      <td className="border border-slate-300 py-3 h-10 text-center font-bold">
                        {result.calculated_grade}
                      </td>
                      <td className="border border-slate-300 py-3 h-10 text-center">
                        {result.position || 'N/A'}
                      </td>
                      <td className="border border-slate-300 py-3 h-10 text-center">
                        {result.calculated_remark}
                      </td>
                    </tr>
                  ))
                ) : (
                  // Default subjects when no data is available
                  [
                    "English (Alphabet)", "Mathematics (Numbers)", "Social Studies", "Basic Science",
                    "Christian Religious Studies", "Computer Studies", "Moral & Value Studies (MVS)",
                    "Colouring Activities", "Rhymes", "Physical & Health Education", "Writing Skill", "Craft"
                  ].map((subject, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 text-left px-4 py-3 font-medium text-slate-700">{subject}</td>
                      <td className="border border-slate-300 py-3 h-10 text-center">{gradingSystem?.max_score || 100}</td>
                      <td className="border border-slate-300 py-3 h-10 text-center"></td>
                      <td className="border border-slate-300 py-3 h-10 text-center"></td>
                      <td className="border border-slate-300 py-3 h-10 text-center"></td>
                      <td className="border border-slate-300 py-3 h-10 text-center"></td>
                      <td className="border border-slate-300 py-3 h-10"></td>
                    </tr>
                  ))
                )}
                <tr style={{ background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)' }}>
                  <td className="border border-slate-300 font-black text-right px-4 py-3 text-slate-800">Total</td>
                  <td className="border border-slate-300 py-3 h-10 text-center font-bold">
                    {data.max_marks_obtainable}
                  </td>
                  <td className="border border-slate-300 py-3 h-10 text-center font-bold">
                    {data.mark_obtained}
                  </td>
                  <td className="border border-slate-300 py-3 h-10 text-center font-bold">
                    {overallPercentage.toFixed(1)}%
                  </td>
                  <td className="border border-slate-300 py-3 h-10 text-center font-bold">
                    {overallGrade.grade}
                  </td>
                  <td className="border border-slate-300 py-3 h-10 text-center"></td>
                  <td className="border border-slate-300 py-3 h-10 text-center font-bold">
                    {overallGrade.remark}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PUPIL'S POSITION */}
          <div className="mb-6 p-5 rounded-xl border border-slate-200"
               style={{ background: 'linear-gradient(135deg, #fef7cd, #fef3c7)' }}>
            <div className="text-center font-black mb-4 text-lg tracking-wide"
                 style={{ color: '#dc2626' }}>
              PUPIL'S POSITION
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <span className="font-bold text-slate-700 block mb-2">PERCENTAGE AVERAGE</span>
                <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md flex items-center justify-center">
                  {overallPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <span className="font-bold text-slate-700 block mb-2">GRADE</span>
                <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md flex items-center justify-center">
                  {overallGrade.grade}
                </div>
              </div>
              <div className="text-center">
                <span className="font-bold text-slate-700 block mb-2">POSITION</span>
                <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md flex items-center justify-center">
                  {data.class_position ? `${data.class_position}${getOrdinalSuffix(data.class_position)}` : ''}
                </div>
              </div>
              <div className="text-center">
                <span className="font-bold text-slate-700 block mb-2">TOTAL PUPILS</span>
                <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md flex items-center justify-center">
                  {data.total_students || ''}
                </div>
              </div>
            </div>
          </div>

          {/* COMMENTS AND SIGNATURES */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-slate-200"
                 style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
              <div className="font-bold text-slate-800 mb-3 text-center">CLASS TEACHER'S COMMENT</div>
              <div className="border-b-2 border-green-400 h-20 bg-white rounded-md p-2 text-sm">
                {data.class_teacher_remark || ''}
              </div>
              <div className="mt-3 text-center">
                <span className="font-medium text-slate-700">SIGNATURE/DATE</span>
                <div className="border-b-2 border-green-400 h-6 bg-white rounded-md mt-1"></div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200"
                 style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
              <div className="font-bold text-slate-800 mb-3 text-center">HEAD TEACHER'S COMMENT</div>
              <div className="border-b-2 border-amber-400 h-20 bg-white rounded-md p-2 text-sm">
                {data.head_teacher_remark || ''}
              </div>
              <div className="mt-3 text-center">
                <span className="font-medium text-slate-700">SIGNATURE/DATE</span>
                <div className="border-b-2 border-amber-400 h-6 bg-white rounded-md mt-1"></div>
              </div>
            </div>
          </div>

          {/* NEXT TERM BEGINS & PARENT'S SIGNATURE */}
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-slate-200"
                 style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
              <div className="text-center">
                <span className="font-bold text-slate-700 block mb-2">NEXT TERM BEGINS</span>
                <div className="border-b-2 border-blue-400 h-8 bg-white rounded-md flex items-center justify-center">
                  {data.next_term_begins ? new Date(data.next_term_begins).toLocaleDateString() : ''}
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-slate-200"
                 style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
              <div className="text-center">
                <span className="font-bold text-slate-700 block mb-2">PARENT'S SIGNATURE/DATE</span>
                <div className="border-b-2 border-blue-400 h-8 bg-white rounded-md"></div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          {enhancedResults.length > 0 && (
            <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="font-bold text-center text-slate-800 mb-3">PERFORMANCE SUMMARY</h3>
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div className="text-center">
                  <div className="font-bold text-slate-700">Subjects Passed</div>
                  <div className="text-lg font-bold text-green-600">
                    {enhancedResults.filter(r => r.is_calculated_pass).length} / {enhancedResults.length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-slate-700">Average Score</div>
                  <div className="text-lg font-bold text-blue-600">
                    {overallPercentage.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-slate-700">Overall Grade</div>
                  <div className="text-lg font-bold text-purple-600">
                    {overallGrade.grade} ({overallGrade.remark})
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-slate-700">Attendance</div>
                  <div className="text-lg font-bold text-orange-600">
                    {data.attendance?.times_present || 0} / {data.attendance?.times_opened || 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Publication Status Indicator */}
          {data.is_published && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Published Report
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper function to add ordinal suffix to position numbers
  function getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  }
}