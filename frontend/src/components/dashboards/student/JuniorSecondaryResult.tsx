import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import resultSettingsService, { GradingSystem } from "../../../services/ResultSettingsService";


const SUBJECTS = [
  "ENGLISH STUDIES",
  "MATHEMATICS",
  "BASIC SCIENCE TECHNOLOGY (BST)",
  "NATIONAL VALUE (NV)",
  "CULTURAL & CREATIVE ARTS (CCA)",
  "PRE VOCATIONAL STUDIES (PVS)",
  "NIGERIAN LANGUAGE (YORUBA/HAUSA/IGBO)",
  "CHRISTIAN RELIGIOUS STUDIES / ARABIC",
  "FRENCH LANGUAGE",
  "HAND WRITING",
  "HISTORY",
  "BUSINESS STUDIES",
  "HAUSA",
  "",
];

const COLUMN_HEADERS = [
  "C.A\n(15 MARKS)",
  "TAKE HOME\nMARKS",
  "TAKE HOME\nTEST",
  "APPEARANCE\nMARKS",
  "PRACTICAL\nMARKS",
  "PROJECT\nMARKS",
  "NOTE COPYING\nMARKS",
  "C.A\nTOTAL",
  "EXAM\n(60%)",
  "TOTAL\n(100%)",
  "POSITION",
  "GRADE",
  "REMARKS BY\nCLASS TEACHER",
];



const WatermarkLogo = () => (
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
          <div className="text-4xl font-bold mb-2">GTS</div>
          <div className="text-sm font-semibold">GOD'S TREASURE</div>
          <div className="text-sm font-semibold">SCHOOLS</div>
        </div>
      </div>
      <div 
        className="text-5xl font-bold tracking-wider"
        style={{ color: 'rgba(30, 64, 175, 0.15)' }}
      >
        GOD'S TREASURE SCHOOLS
      </div>
    </div>
  </div>
);

interface StudentData {
  name?: string;
  class?: string;
  term?: string;
  academicSession?: string;
  resultType?: string;
}

interface ResultSheetProps {
  studentData?: StudentData;
  subjectResults?: any[];
  termResults?: any[];
}

export default function JuniorSecondaryResult({ studentData }: ResultSheetProps) {
  const ref = useRef(null);
  const [gradingSystem, setGradingSystem] = useState<GradingSystem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGradingSystem = async () => {
      try {
        setLoading(true);
        // Get the first active grading system (you might want to make this configurable)
        const gradingSystems = await resultSettingsService.getGradingSystems();
        const activeSystem = gradingSystems.find((system: GradingSystem) => system.is_active);
        if (activeSystem) {
          setGradingSystem(activeSystem);
        }
      } catch (error) {
        console.error('Error fetching grading system:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGradingSystem();
  }, []);

  const downloadPDF = async () => {
    const element = ref.current;
    if (!element) return;

    // Capture with optimized settings
    const canvas = await html2canvas(element, { 
      scale: 1.5, 
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
    
    const imgProps = (pdf as any).getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // If taller than page, shrink proportionally
    let finalHeight = imgHeight;
    let finalWidth = imgWidth;
    if (imgHeight > pdfHeight) {
      finalHeight = pdfHeight;
      finalWidth = (imgProps.width * pdfHeight) / imgProps.height;
    }

    (pdf as any).addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);
    pdf.save(`${studentData?.name || 'student'}_junior_secondary_result.pdf`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading grading system...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={downloadPDF}
        className="mb-4 px-4 py-2 bg-indigo-700 text-white rounded shadow hover:bg-indigo-800 transition-colors"
      >
        Download PDF
      </button>

      <div
        ref={ref}
        className="bg-white mx-auto p-6 border border-gray-300 relative"
        style={{ width: '850px' }}
      >
        <WatermarkLogo />

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">GOD'S TREASURE SCHOOLS</h1>
          <p className="text-sm text-gray-600 mb-1">No 54 Dagbana Road, Opp. St. Kevin's Catholic Church, Phase III Jikwoyi, Abuja</p>
          <p className="text-sm text-gray-600 mb-4">Phone: (123) 456-7890 | Email: info@godstreasureschools.com</p>
          
          <div className="bg-blue-900 text-white py-2 px-4 rounded-lg inline-block">
            <h2 className="text-lg font-semibold">JUNIOR SECONDARY SCHOOL TERMLY REPORT</h2>
            <p className="text-sm">{studentData?.term || '1st'} Term, {studentData?.academicSession || '2025'} Academic Session</p>
          </div>
        </div>

        {/* Student Information */}
        <div className="mb-6 text-sm space-y-3 relative z-10">
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">NAME</span>
              <div className="w-64 border-b border-slate-400" style={{ height: 1 }} />
              <span className="ml-4 font-semibold text-slate-700">AGE</span>
              <div className="w-24 border-b border-slate-400" style={{ height: 1 }} />
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">CLASS</span>
              <div className="w-36 border-b border-slate-400" style={{ height: 1 }} />
              <span className="ml-4 font-semibold text-slate-700">NO IN CLASS</span>
              <div className="w-36 border-b border-slate-400" style={{ height: 1 }} />
              <span className="ml-4 font-semibold text-slate-700">POSITION IN CLASS</span>
              <div className="w-36 border-b border-slate-400" style={{ height: 1 }} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">NUMBER OF TIMES SCHOOL OPENED:</span>
              <div className="w-40 border-b border-slate-400" style={{ height: 1 }} />
              <span className="ml-4 font-semibold text-slate-700">NUMBER OF TIMES PRESENT:</span>
              <div className="w-40 border-b border-slate-400" style={{ height: 1 }} />
              <span className="ml-4 font-semibold text-slate-700">NEXT TERM BEGINS</span>
              <div className="w-40 border-b border-slate-400" style={{ height: 1 }} />
            </div>
          </div>

          {/* Grading System Information */}
          {gradingSystem && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-sm mb-2 text-blue-900">Grading System: {gradingSystem.name}</h3>
              <div className="text-xs space-y-1 text-blue-800">
                <div><span className="font-medium">Score Range:</span> {gradingSystem.min_score} - {gradingSystem.max_score}</div>
                <div><span className="font-medium">Pass Mark:</span> {gradingSystem.pass_mark}</div>
                <div><span className="font-medium">Grading Type:</span> {gradingSystem.grading_type}</div>
              </div>
            </div>
          )}
        </div>

        {/* Academic Performance title */}
        <div className="text-center font-semibold text-base py-3 mb-4 bg-blue-900 text-white rounded-lg relative z-10">
          {studentData?.resultType === 'yearly' ? 'YEARLY' : studentData?.resultType === 'annually' ? 'ANNUAL' : 'ACADEMIC'} PERFORMANCE
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
                  {gradingSystem ? (
                    <div className="text-[8px] leading-tight space-y-0.5 text-slate-600">
                      {gradingSystem.grades
                        .sort((a, b) => b.min_score - a.min_score)
                        .slice(0, 6) // Show top 6 grades
                        .map(grade => (
                          <div key={grade.id}>
                            {grade.grade} {grade.description} {grade.min_score} - {grade.max_score}%
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-[8px] leading-tight space-y-0.5 text-slate-600">
                      <div>A DISTINCTION 70 - 100%</div>
                      <div>B+ VERY GOOD 60 - 69%</div>
                      <div>B GOOD 50 - 59%</div>
                      <div>C FAIRLY GOOD 45 - 49%</div>
                      <div>D PASS 40 - 45%</div>
                      <div>E VERY WEAK BELOW 39%</div>
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
                        className="transform -rotate-90 origin-center text-[7px] font-medium text-center leading-tight text-slate-700"
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
              {SUBJECTS.map((subject, idx) => (
                <tr key={idx}>
                  <td 
                    className={`border border-slate-600 p-3 font-semibold text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                    style={{ minHeight: '24px' }}
                  >
                    {subject}
                  </td>
                  
                  {COLUMN_HEADERS.map((_, colIdx) => (
                    <td 
                      key={colIdx}
                      className={`border border-slate-600 p-0.5 text-center text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                      style={{ width: '32px', height: '24px' }}
                    >
                    </td>
                  ))}
                  
                  <td 
                    className={`border border-slate-600 p-0.5 text-center text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                    style={{ width: '40px' }}
                  >
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer area */}
        <div className="flex justify-between text-sm relative z-10">
          {/* Left side - Totals and Physical Development */}
          <div className="flex-1 pr-6">
            <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="mb-1 text-xs font-semibold text-slate-700">Total Scores: <span className="border-b border-slate-400 inline-block w-16"></span></div>
              <div className="mb-1 text-xs font-semibold text-slate-700">Average Scores: <span className="border-b border-slate-400 inline-block w-16"></span></div>
              <div className="text-xs font-semibold text-slate-700">Grade: <span className="border-b border-slate-400 inline-block w-16"></span></div>
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
              <div className="text-[10px] mt-1 text-slate-600 italic">Good and intelligent pupil keep it up</div>
            </div>
            
            <div className="mb-4">
              <div className="text-[10px] font-medium text-slate-700">SIGNATURE/DATE: <span className="border-b border-slate-400 inline-block w-28"></span></div>
            </div>

            <div className="mb-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="font-semibold text-[10px] text-slate-800">HEAD TEACHER'S COMMENT:</div>
              <div className="text-[10px] mt-1 text-slate-600 italic">Such a zealous and hard working child. impressive</div>
            </div>
            
            <div className="mb-4">
              <div className="text-[10px] font-medium text-slate-700">SIGNATURE/DATE: <span className="border-b border-slate-400 inline-block w-28"></span></div>
            </div>

            <div>
              <div className="text-[10px] font-medium text-slate-700">PARENT'S SIGNATURE/DATE: <span className="border-b border-slate-400 inline-block w-32"></span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}