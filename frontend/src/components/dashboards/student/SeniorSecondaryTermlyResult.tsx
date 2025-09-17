// ResultSheetTemplate2.jsx
import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import resultSettingsService, { GradingSystem } from "../../../services/ResultSettingsService";

/**
 * ResultSheetTemplate2
 * - TailwindCSS friendly (you can convert inline styles to regular CSS if needed)
 * - Replace LOGO placeholder with <img src="/path/to/logo.png" alt="logo" />
 * - Uses html2canvas + jsPDF to export the sheet as an A4 PDF
 */

const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Literature in English",
  "Biology",
  "Physics",
  "Chemistry",
  "Geography",
  "Animal Husbandry",
  "Government",
  "History",
  "Economic",
  "Commerce",
  "CRK",
  "Yoruba/Hausa/Igbo",
  "Food & Nut or H.Mgt",
  "BookKeeping/Accounting",
  "Further Maths",
  "Computer",
];

interface SubjectScore {
    subject: string;
    t1: number | string;
    t2: number | string;
    t3: number | string;
    exam: number | string;
    teacherRemark: string;
}

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



export default function SeniorSecondaryTermlyResult({ studentData }: ResultSheetProps) {
  const ref = useRef<HTMLDivElement | null>(null);
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

  const gradeFromScore = (score: number | string): string => {
    if (score === "" || score === null || isNaN(Number(score))) return "";
    if (!gradingSystem) return "";
    
    return resultSettingsService.getGradeFromScore(Number(score), gradingSystem);
  };

  // Mock data if none provided
  const student = {
    name: studentData?.name || "John Doe",
    className: studentData?.class || "SSS 2",
    year: studentData?.academicSession || "2025",
    term: studentData?.term || "1st",
    age: 16,
    average: 72,
    classAge: 16,
    noInClass: 36,
    nextTermBegins: "13th Sept 2025",
    noOfTimesOpened: 40,
    attendance: 32,
    gp: 3.6,
    averageScore: 72,
    grade: "B",
    passFail: "PASS",
    // Provide sample scores for first 6 subjects; others empty
    scores: SUBJECTS.map((s, i) =>
      i === 0
        ? { subject: s, t1: 8, t2: 9, t3: 9, exam: 55, teacherRemark: "" }
        : i === 1
        ? { subject: s, t1: 7, t2: 8, t3: 6, exam: 50, teacherRemark: "" }
        : i === 2
        ? { subject: s, t1: 6, t2: 6, t3: 7, exam: 48, teacherRemark: "" }
        : i === 3
        ? { subject: s, t1: 9, t2: 8, t3: 9, exam: 58, teacherRemark: "" }
        : i === 4
        ? { subject: s, t1: 8, t2: 8, t3: 7, exam: 52, teacherRemark: "" }
        : { subject: s, t1: "", t2: "", t3: "", exam: "", teacherRemark: "" }
    ),
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading grading system...</div>;
  }

  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs">
            LOGO
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold">SCHOOL NAME</h1>
            <p className="text-sm">School Address, City, State</p>
            <p className="text-sm">Phone: (123) 456-7890 | Email: info@school.com</p>
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-2">STUDENT'S TERMLY REPORT</h2>
        <p className="text-sm">{student.term} Term, {student.year} Academic Session</p>
      </div>

      {/* Student Information */}
      <div className="mb-6 text-sm space-y-2">
        <div className="flex w-full">
          <span className="font-semibold flex-[20]">Name: {student.name}</span>
          <span className="font-semibold flex-[15]">Class: {student.className}</span>
          <span className="font-semibold flex-[15]">Year: {student.year}</span>
        </div>
        <div className="flex w-full">
          <span className="font-semibold flex-[12]">Age:  {student.age}</span>
          
          <span className="ml-6 font-semibold flex-[15]">Average:  {student.average}</span>
          <span className="ml-6 font-semibold flex-[20]">Class Age:  {student.classAge}</span>
          
          <span className="ml-6 font-semibold flex-[23]">No in class:  {student.noInClass}</span>
          
          <span className="ml-6 font-semibold flex-[40]">Next Term Begins:  {student.nextTermBegins}</span>
        </div>

        <div className="flex w-full">
          <span className="font-semibold flex-[50]">No of Times School Opened: {student.noOfTimesOpened}</span>
          

          <span className="ml-6 font-semibold flex-[40]">No of Attendance: {student.attendance}</span>
          
          <span className="ml-6 font-semibold flex-[10]">G.P.: {student.gp}</span>
         
        </div>

        <div>
          <span className="font-semibold">Average Score</span>
          <span className="dotted ml-3" style={{ width: 220 }}>{student.averageScore}</span>

          <span className="ml-6 font-semibold">Grade</span>
          <span className="dotted ml-3" style={{ width: 160 }}>{student.grade}</span>

          <span className="ml-6 font-semibold">PASS/FAIL</span>
          <span className="dotted ml-3" style={{ width: 120 }}>{student.passFail}</span>
        </div>

        {/* Grading System Information */}
        {gradingSystem && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Grading System: {gradingSystem.name}</h3>
            <div className="text-xs space-y-1">
              <div><span className="font-medium">Score Range:</span> {gradingSystem.min_score} - {gradingSystem.max_score}</div>
              <div><span className="font-medium">Pass Mark:</span> {gradingSystem.pass_mark}</div>
              <div><span className="font-medium">Grading Type:</span> {gradingSystem.grading_type}</div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-xs" style={{ border: "1px solid #333" }}>
          <thead>
            <tr>
              <th
                className="border px-2 py-2 text-left"
                rowSpan={2}
                style={{ width: 260, verticalAlign: "middle" }}
              >
                <div className="font-semibold">Subject</div>
                <div className="text-[10px]">Core Subjects</div>
              </th>

              <th className="border px-1 py-1 text-center" colSpan={4}>
                <div className="font-semibold">Test/Examination Score =100%</div>
              </th>

              <th className="border px-2 py-1 text-center" rowSpan={2} style={{ width: 50 }}>
                Term Total
              </th>

              <th className="border px-2 py-1 text-center" rowSpan={2} style={{ width: 60 }}>
                Class Average
              </th>

              <th className="border px-2 py-1 text-center" rowSpan={2} style={{ width: 60 }}>
                Highest in Class
              </th>

              <th className="border px-2 py-1 text-center" rowSpan={2} style={{ width: 60 }}>
                Lowest in Class
              </th>

              <th className="border px-2 py-1 text-center" rowSpan={2} style={{ width: 70 }}>
                Subject Position
              </th>

              <th className="border px-2 py-1 text-center" rowSpan={2} style={{ width: 50 }}>
                Grade
              </th>

              <th className="border px-2 py-1 text-center" rowSpan={2} style={{ width: 180 }}>
                Subject Teacher's Remark
              </th>
            </tr>

            <tr>
              <th className="border px-1 py-1 text-center" style={{ width: 40 }}>10<br />1st</th>
              <th className="border px-1 py-1 text-center" style={{ width: 40 }}>10<br />2nd</th>
              <th className="border px-1 py-1 text-center" style={{ width: 40 }}>10<br />3rd</th>
              <th className="border px-1 py-1 text-center" style={{ width: 48 }}>70<br />Exam</th>
            </tr>
          </thead>

          <tbody>
            {student.scores.map((row, idx) => {
              // compute term total: t1 + t2 + t3 + exam (if numeric)
              const t1 = Number(row.t1) || 0;
              const t2 = Number(row.t2) || 0;
              const t3 = Number(row.t3) || 0;
              const exam = Number(row.exam) || 0;
              const termTotal = row.t1 === "" && row.t2 === "" && row.t3 === "" && row.exam === "" ? "" : t1 + t2 + t3 + exam;
              const grade = termTotal === "" ? "" : gradeFromScore(termTotal);
              return (
                <tr key={idx} className={`${idx % 2 === 0 ? "" : ""}`}>
                  <td className="border px-2 py-2 align-top text-sm">{row.subject}</td>

                  <td className="border px-1 py-2 text-center">{row.t1 ?? ""}</td>
                  <td className="border px-1 py-2 text-center">{row.t2 ?? ""}</td>
                  <td className="border px-1 py-2 text-center">{row.t3 ?? ""}</td>
                  <td className="border px-1 py-2 text-center">{row.exam ?? ""}</td>

                  <td className="border px-1 py-2 text-center font-medium">{termTotal === "" ? "" : termTotal}</td>
                  <td className="border px-1 py-2 text-center"></td> {/* Class Average */}
                  <td className="border px-1 py-2 text-center"></td> {/* Highest */}
                  <td className="border px-1 py-2 text-center"></td> {/* Lowest */}
                  <td className="border px-1 py-2 text-center"></td> {/* Position */}
                  <td className="border px-1 py-2 text-center">{grade}</td>
                  <td className="border px-2 py-2 text-sm">{row.teacherRemark ?? ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer remarks and signature lines */}
      <div className="mt-6 text-sm">
        <div className="mb-3">
          <div className="font-semibold">Form Master's Remark: An eloquent, responsible and intelligent student always working hard to continue to lead.</div>
         
        </div>

        <div className="mb-3">
          <div className="font-semibold">Principal's Remarks: Excellent performance and uncommon commitment to succeed. Keep it up</div>
      
        </div>

        <div className="flex items-center justify-between mt-6">
          <div>
            <div className="dotted" style={{ width: 300, height: 10 }} />
            <div className="text-xs text-center mt-1">Form Master's Signature</div>
          </div>

          <div className="text-right">
            <div className="dotted" style={{ width: 300, height: 10 }} />
            <div className="text-xs text-right mt-1">Principal's Signature & Stamp</div>
          </div>
        </div>
      </div>
    </div>
  );
}
