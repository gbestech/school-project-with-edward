
import { useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface StudentData {
  name?: string;
  class?: string;
  term?: string;
  academicSession?: string;
  resultType?: string;
}

interface ResultSheetProps {
  studentData?: StudentData;
}

const SeniorSecondarySessionResult = ({ studentData }: ResultSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const element = sheetRef.current;
    if (!element) {
      alert("Result sheet not found.");
      return;
    }
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("result-sheet.pdf");
  };

  interface SubjectScore {
    subject: string;
    t1: number | string;
    t2: number | string;
    t3: number | string;
    exam: number | string;
    teacherRemark: string;
}

  interface StudentData {
    name: string;
    className: string;
    year: string;
    age: number;
    average: number;
    term: string;
    classAge: number;
    noInClass: number;
    nextTermBegins: string;
    noOfTimesOpened: number;
    attendance: number;
    gp: number;
    averageScore: number;
    grade: string;
    passFail: string;
    scores: SubjectScore[];
}

//   const handleDownloadPDF = async () => {
//   const element = sheetRef.current;
//   if (!element) return;

//   const canvas = await html2canvas(element, { scale: 2, useCORS: true });
//   const imgData = canvas.toDataURL("image/png");
//   const pdf = new jsPDF("p", "mm", "a4");

//   const pdfWidth = pdf.internal.pageSize.getWidth();
//   const pdfHeight = pdf.internal.pageSize.getHeight();

//   const imgProps = (pdf as any).getImageProperties(imgData);
//   const imgWidth = pdfWidth;
//   const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

//   // ✅ If taller than page, shrink proportionally
//   let finalHeight = imgHeight;
//   let finalWidth = imgWidth;
//   if (imgHeight > pdfHeight) {
//     finalHeight = pdfHeight;
//     finalWidth = (imgProps.width * pdfHeight) / imgProps.height;
//   }

//  (pdf as any).pdf.addImage(imgData, "PNG", 0, 0, finalWidth, finalHeight);
//   pdf.save(`${student.name.replace(/\s+/g, "_")}_result.pdf`);
// };


  // mock student data
  const student = {
    name: studentData?.name || "Ogonnaya Edward aja",
    class: studentData?.class || "SSS 2",
    year: studentData?.academicSession || "2025",
    age: 16,
    average: 75,
    classAge: 16,
    term: studentData?.term || "3rd Term",
    classNo: 35,
    attendance: 32,
    noInClass: 36,
    noOfTimesOpened: 40,
    nextTermBegins: "13th Sept 2025",
    finalScoreAverage: 76.4,
    gp: 3.8,
    scores: [
      { subject: "Mathematics", scores: [80, 75, 85], obtainable: 100 },
      { subject: "English Language", scores: [70, 65, 78], obtainable: 100 },
      { subject: "Literature in English", scores: [88, 90, 84], obtainable: 100 },
      { subject: "Biology", scores: [75, 70, 80], obtainable: 100 },
      { subject: "Physics", scores: [80, 75, 85], obtainable: 100 },
      { subject: "Chemistry", scores: [70, 65, 78], obtainable: 100 },
      { subject: "Geography", scores: [88, 90, 84], obtainable: 100 },
      { subject: "Animal Husbandary", scores: [75, 70, 80], obtainable: 100 },
    { subject: "Government", scores: [80, 75, 85], obtainable: 100 },
      { subject: "History", scores: [70, 65, 78], obtainable: 100 },
      { subject: "Economics", scores: [88, 90, 84], obtainable: 100 },
      { subject: "Commerce", scores: [75, 70, 80], obtainable: 100 },
      { subject: "CRK", scores: [80, 75, 85], obtainable: 100 },
      { subject: "Yoruba/Hausa/Igbo", scores: [70, 65, 78], obtainable: 100 },
      { subject: "Food & Nutrition or H. Mgt.", scores: [70, 65, 78], obtainable: 100 },
      { subject: "Book Keeping / Accounting", scores: [88, 90, 84], obtainable: 100 },
      { subject: "Further Maths", scores: [75, 70, 80], obtainable: 100 },
      { subject: "Computer", scores: [75, 70, 80], obtainable: 100 },
    ],
  };

  return (
    <div className="p-6">
      <button
        onClick={handleDownloadPDF}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
      >
        Download PDF
      </button>

      <div
        ref={sheetRef}
        className="bg-white p-8 border border-gray-300 w-[850px] mx-auto text-gray-900"
      >
        {/* Header with Logo + School Info */}
        <div className="flex items-center justify-between border-b pb-2">
          <div className="w-24 h-24 border flex items-center justify-center text-xs">
            LOGO
          </div>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">
              GOD’S TREASURE SCHOOLS
            </h1>
            <p className="m-2">knowledge at its spring</p>
            <p className="text-sm text-blue-600 font-semibold mb-1">
              No 54 Dagbana Road, Opp. St. Kevin’s Catholic Church, Phase III
              Jikwoyi, Abuja
            </p>
            <p className="text-xs italic text-red-700 font-semibold">
              CONTINUOUS ASSESSMENT DOSSIER FOR SENIOR SECONDARY SCHOOL
            </p>
          </div>
          <div className="w-24 h-24"></div>
        </div>

        {/* Summary Line */}
        <div className="mt-4 text-sm text-blue-990 flex justify-between border-b pb-1">
          <h2 className="text-xl text-blue-900 font-bold">
            Summary of Annual Academic Report {student.term}
          </h2>
           <span className="ml-6 font-semibold flex-[40]">Next Term Begins:  {student.nextTermBegins}</span>
        </div>

        {/* Student Info Section */}
        <div className="mt-4 text-sm space-y-2">
         <div className="flex w-full">
            <span className="font-semibold flex-[70]">Name: {student.name}</span>
            <span className="font-semibold flex-[15]">Class: {student.class}</span>
            <span className="dotted flex-1"></span>
            <span className="font-semibold flex-[15]">Year: {student.year}</span>
          </div>
          {/* <p>
            <strong>Age:</strong> {student.age} &nbsp;&nbsp;&nbsp; 
            <strong>Average:</strong> {student.average} &nbsp;&nbsp;&nbsp; 
            <strong>Class Age:</strong> {student.classAge} &nbsp;&nbsp;&nbsp; 
            <strong>No in Class:</strong> {student.classNo} &nbsp;&nbsp;&nbsp; 
            <strong>No of Attendance:</strong> {student.attendance}
          </p> */}

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
          {/* <p>
            <strong>Class Final Score Average:</strong> {student.finalScoreAverage} &nbsp;&nbsp;&nbsp; 
            <strong>Average Score:</strong> {student.average} &nbsp;&nbsp;&nbsp; 
            <strong>G.P:</strong> {student.gp}
          </p> */}
        </div>

        {/* Table */}
        <table className="mt-6 w-full border-collapse text-xs">
          <thead>
            <tr>
              <th rowSpan={2} className="border px-2 py-1">
                Subject
              </th>
              <th colSpan={4} className="border px-2 py-1">
                Termly Cumulative Average
              </th>
              <th rowSpan={2} className="border px-2 py-1">
                Obtainable
              </th>
              <th rowSpan={2} className="border px-2 py-1">
                Obtained
              </th>
              <th rowSpan={2} className="border px-2 py-1">
                Class Avg
              </th>
              <th rowSpan={2} className="border px-2 py-1">
                Highest in Class
              </th>
              <th rowSpan={2} className="border px-2 py-1">
                Lowest in Class
              </th>
              <th rowSpan={2} className="border px-2 py-1">
                Position
              </th>
              <th rowSpan={2} className="border px-2 py-1">
                Teacher’s Remark
              </th>
            </tr>
            <tr>
              <th className="border px-2 py-1">1st Term</th>
              <th className="border px-2 py-1">2nd Term</th>
              <th className="border px-2 py-1">3rd Term</th>
              <th className="border px-2 py-1">Average of Year</th>
            </tr>
          </thead>
          <tbody>
            {student.scores.map((item, index) => {
              const avg =
                item.scores.reduce((a, b) => a + b, 0) / item.scores.length;
              return (
                <tr key={index}>
                  <td className="border px-2 py-1">{item.subject}</td>
                  {item.scores.map((s, i) => (
                    <td key={i} className="border px-2 py-1 text-center">
                      {s}
                    </td>
                  ))}
                  <td className="border px-2 py-1 text-center">
                    {avg.toFixed(1)}
                  </td>
                  <td className="border px-2 py-1 text-center">{item.obtainable}</td>
                  <td className="border px-2 py-1 text-center">
                    {avg.toFixed(0)}
                  </td>
                  <td className="border px-2 py-1 text-center">-</td>
                  <td className="border px-2 py-1 text-center">-</td>
                  <td className="border px-2 py-1 text-center">-</td>
                  <td className="border px-2 py-1 text-center">-</td>
                  <td className="border px-2 py-1">Good</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Remarks */}
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
    </div>
  );
};

export default SeniorSecondarySessionResult;

