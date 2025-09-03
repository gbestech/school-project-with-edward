import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useState, useEffect } from "react";
import resultSettingsService, { GradingSystem } from "../../../services/ResultSettingsService";

type ResultSheetProps = {
  studentData: {
    name?: string;
    class?: string;
    term?: string;
    date?: string;
    house?: string;
    timesOpened?: string;
    timesPresent?: string;
    // Add other fields as needed
  };
};



const SchoolLogo = () => (
  <div className="w-20 h-20 rounded-xl flex items-center justify-center text-white shadow-lg" 
       style={{
         background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
         border: '2px solid #1e40af'
       }}>
    <div className="text-center text-xs">
      <div className="font-bold text-lg mb-1">GTS</div>
      <div className="text-[8px] font-medium">GOD'S TREASURE</div>
      <div className="text-[8px] font-medium">SCHOOLS</div>
    </div>
  </div>
);

const WatermarkLogo = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
    <div className="text-center">
      <div className="w-80 h-80 rounded-full flex items-center justify-center mb-8 border-4"
           style={{
             background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
             borderColor: '#1e40af'
           }}>
        <div className="text-center text-white">
          <div className="text-6xl font-bold mb-4">GTS</div>
          <div className="text-2xl font-semibold">GOD'S TREASURE</div>
          <div className="text-xl font-semibold">SCHOOLS</div>
        </div>
      </div>
      <div className="text-8xl font-bold" style={{ color: '#1e40af' }}>
        GOD'S TREASURE SCHOOLS
      </div>
    </div>
  </div>
);

export default function ResultSheet({ studentData }: ResultSheetProps) {
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
    const input = document.getElementById("result-sheet");
    if (!input) return;
    
    const canvas = await html2canvas(input, { 
      scale: 1.7, // Increased scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    
    // A4 dimensions in mm
    const pageWidth = 210;
    const pageHeight = 297;
    
    // Use the full page dimensions without margins
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save(`${studentData.name || "result-sheet"}.pdf`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading grading system...</div>;
  }

  return (
    <div className="p-6" style={{
      background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
      minHeight: '100vh'
    }}>
      <button
        onClick={downloadPDF}
        className="mb-4 px-4 py-2 bg-indigo-700 text-white rounded shadow hover:bg-indigo-800 transition-colors"
      >
        Download PDF
      </button>

      <div id="result-sheet" className="relative p-6 w-[794px] mx-auto bg-white text-xs overflow-hidden shadow-2xl rounded-2xl border border-slate-200">
        
        {/* Background Watermark */}
        <WatermarkLogo />
        
        {/* Content Layer */}
        <div className="relative z-10">
          
          {/* HEADER with Logo */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <SchoolLogo />
            </div>
            <div className="flex-2 text-center mx-6">
              <h1 className="text-3xl font-black mb-2 tracking-tight" 
                  style={{ color: '#1e40af' }}>
                GOD'S TREASURE SCHOOLS
              </h1>
              <p className="text-sm text-slate-600 mb-1 font-medium">
                No 54 Dagbana Road, Opp. St. Kevin's Catholic Church, Jikwoyi Phase III Abuja.
              </p>
              <p className="text-sm text-slate-600 mb-3 font-medium">
                Phone: (123) 456-7890 | Email: info@godstreasureschools.com
              </p>
              <div className="bg-red-600 text-white py-2 px-4 rounded-lg inline-block">
                <h2 className="text-lg font-bold">NURSERY SCHOOL TERMLY REPORT</h2>
                <p className="text-sm">{studentData?.term || '1st'} Term, {studentData?.date || '2025'} Academic Session</p>
              </div>
            </div>
            <div className="flex-1"></div>
          </div>

          {/* Grading System Information */}
          {gradingSystem && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-sm mb-2 text-blue-900">Grading System: {gradingSystem.name}</h3>
              <div className="text-xs space-y-1 text-blue-800">
                <div><span className="font-medium">Score Range:</span> {gradingSystem.min_score} - {gradingSystem.max_score}</div>
                <div><span className="font-medium">Pass Mark:</span> {gradingSystem.pass_mark}</div>
                <div><span className="font-medium">Grading Type:</span> {gradingSystem.grading_type}</div>
              </div>
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
                  {studentData.name || ""}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[150px]">CLASS:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {studentData.class || ""}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[150px]">TERM:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {studentData.term || ""}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[150px]">HOUSE:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {studentData.house || ""}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[150px]">NO OF TIMES SCHOOL OPENED:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {studentData.timesOpened || ""}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[150px]">NO OF TIMES PRESENT:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {studentData.timesPresent || ""}
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
                {["PHYSICAL DEVELOPMENT", "HEALTH", "CLEANLINESS", "GENERAL CONDUCT"].map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border border-slate-300 text-left px-4 py-3 font-bold text-slate-700">{item}</td>
                    <td className="border border-slate-300 py-3 h-10"></td>
                    <td className="border border-slate-300 py-3 h-10"></td>
                    <td className="border border-slate-300 py-3 h-10"></td>
                    <td className="border border-slate-300 py-3 h-10"></td>
                    <td className="border border-slate-300 py-3 h-10"></td>
                  </tr>
                ))}
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
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">POSITIONS</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">COMMENTS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "English (Alphabet)", "Mathematics (Numbers)", "Social Studies", "Basic Science",
                  "Christian Religious Studies", "Computer Studies", "Moral & Value Studies (MVS)",
                  "Colouring Activities", "Rhymes", "Physical & Health Education", "Writing Skill", "Craft"
                ].map((subject, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border border-slate-300 text-left px-4 py-3 font-medium text-slate-700">{subject}</td>
                    <td className="border border-slate-300 py-3 h-10 text-center"></td>
                    <td className="border border-slate-300 py-3 h-10 text-center"></td>
                    <td className="border border-slate-300 py-3 h-10 text-center"></td>
                    <td className="border border-slate-300 py-3 h-10"></td>
                  </tr>
                ))}
                <tr style={{ background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)' }}>
                  <td className="border border-slate-300 font-black text-right px-4 py-3 text-slate-800">Total</td>
                  <td className="border border-slate-300 py-3 h-10 text-center"></td>
                  <td className="border border-slate-300 py-3 h-10 text-center"></td>
                  <td className="border border-slate-300 py-3 h-10 text-center"></td>
                  <td className="border border-slate-300 py-3 h-10"></td>
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
                <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md"></div>
              </div>
              <div className="text-center">
                <span className="font-bold text-slate-700 block mb-2">GRADE</span>
                <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md"></div>
              </div>
              <div className="text-center">
                <span className="font-bold text-slate-700 block mb-2">POSITION</span>
                <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md"></div>
              </div>
              <div className="text-center">
                <span className="font-bold text-slate-700 block mb-2">TOTAL PUPILS</span>
                <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md"></div>
              </div>
            </div>
          </div>

          {/* COMMENTS AND SIGNATURES */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-slate-200"
                 style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
              <div className="font-bold text-slate-800 mb-3 text-center">CLASS TEACHER'S COMMENT</div>
              <div className="border-b-2 border-green-400 h-20 bg-white rounded-md"></div>
              <div className="mt-3 text-center">
                <span className="font-medium text-slate-700">SIGNATURE/DATE</span>
                <div className="border-b-2 border-green-400 h-6 bg-white rounded-md mt-1"></div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200"
                 style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
              <div className="font-bold text-slate-800 mb-3 text-center">HEAD TEACHER'S COMMENT</div>
              <div className="border-b-2 border-amber-400 h-20 bg-white rounded-md"></div>
              <div className="mt-3 text-center">
                <span className="font-medium text-slate-700">SIGNATURE/DATE</span>
                <div className="border-b-2 border-amber-400 h-6 bg-white rounded-md mt-1"></div>
              </div>
            </div>
          </div>

          {/* PARENT'S SIGNATURE */}
          <div className="mt-6 p-4 rounded-xl border border-slate-200"
               style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
            <div className="text-center">
              <span className="font-bold text-slate-700 block mb-2">PARENT'S SIGNATURE/DATE</span>
              <div className="border-b-2 border-blue-400 h-8 bg-white rounded-md max-w-md mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}