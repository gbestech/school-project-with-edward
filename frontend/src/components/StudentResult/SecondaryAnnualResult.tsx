import React from "react";
import { User } from 'lucide-react';

interface SecondaryAnnualResultProps {
  student: any;
  school: any;
  results: any[];
  session: string;
}

const SecondaryAnnualResult: React.FC<SecondaryAnnualResultProps> = ({
  student,
  school,
  results,
  session,
}) => {
  return (
    <div className="w-full mx-auto bg-white">
      <div className="w-full p-8 relative min-w-[1200px]">
        {/* Watermark - School Name */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform -rotate-45 text-[120px] font-bold text-gray-100 opacity-20 whitespace-nowrap">
            School Name
          </div>
        </div>

        {/* Watermark - School Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 opacity-5">
            <img
              src={school.logo || "/school-logo.png"}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Content Container - Everything on top of watermark */}
        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            {/* School Logo */}
            <div className="w-40">
              <img
                src={school.logo || "/school-logo.png"}
                alt="School Logo"
                className="w-full"
              />
            </div>
            
            {/* School Name and Address */}
            <div className="text-center flex-1 px-4">
              <h1 className="text-[#000080] text-5xl font-bold mb-3">School Name</h1>
              <p className="text-[#87CEEB] text-xl mb-1">No 54 Dagbana Road, Opp. St. Kevin's</p>
              <p className="text-[#87CEEB] text-xl">Catholic Church, Phase III Jikwoyi, Abuja</p>
            </div>

            {/* Student Photo */}
            <div className="w-40 flex flex-col items-center">
              {student?.photo ? (
                <img
                  src={student.photo}
                  alt="Student"
                  className="w-32 h-40 object-cover border-4 border-[#000080] rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-32 h-40 bg-gray-200 border-4 border-[#000080] rounded-lg shadow-lg flex items-center justify-center">
                  <User size={64} className="text-gray-400" />
                </div>
              )}
              <div className="mt-2 text-sm text-center text-gray-600">
                Student Photo
              </div>
            </div>
          </div>

          {/* Assessment Title */}
          <div className="text-right mb-4">
            <h2 className="text-red-600 text-2xl font-semibold">CONTINUOUS ASSESSMENT DOSSIER</h2>
            <h3 className="text-red-600 text-2xl font-semibold">FOR SENIOR SECONDARY SCHOOL</h3>
          </div>

          {/* Report Title */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">Summary of Annual Academic Report.............(TERM)</h2>
            <div className="border border-gray-400 p-2">
              <span>Next Term Begins:.............................</span>
            </div>
          </div>

          {/* Student Info */}
          <div className="space-y-4 mb-8 text-gray-700 text-lg">
            <div className="flex gap-x-8">
              <p>Name.......................................................</p>
              <p>Class.....................................</p>
              <p>Year...................</p>
            </div>
            <div className="flex gap-x-8">
              <p>Age...........................</p>
              <p>Average..Class Age.....................</p>
              <p>No in class...................</p>
              <p>No of Attendance...................</p>
            </div>
            <div className="flex gap-x-8">
              <p>Class Final Score Average......................................</p>
              <p>Average Score .....................................</p>
              <p>G.P......................</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-400 mb-8">
              {/* ... existing table code ... */}
              <thead>
                <tr className="bg-gray-50">
                  <th rowSpan={2} className="border border-gray-400 p-3 text-left w-48">
                    Subject<br />Core Subjects<br />(NB Delete Appropriately)
                  </th>
                  <th colSpan={3} className="border border-gray-400 p-3 text-center">
                    Termly Cumulative Average
                  </th>
                  <th rowSpan={2} className="border border-gray-400 p-3">Average for this Year</th>
                  <th rowSpan={2} className="border border-gray-400 p-3">Obtainable</th>
                  <th rowSpan={2} className="border border-gray-400 p-3">Obtained</th>
                  <th rowSpan={2} className="border border-gray-400 p-3">Class Average</th>
                  <th rowSpan={2} className="border border-gray-400 p-3">Highest in Class</th>
                  <th rowSpan={2} className="border border-gray-400 p-3">Lowest in Class</th>
                  <th rowSpan={2} className="border border-gray-400 p-3">Position</th>
                  <th rowSpan={2} className="border border-gray-400 p-3 w-48">Subject Teacher's Remark</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border border-gray-400 p-3">1st Term</th>
                  <th className="border border-gray-400 p-3">2nd Term</th>
                  <th className="border border-gray-400 p-3">3rd Term</th>
                </tr>
              </thead>
              <tbody>
                {[
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
                  "Yoruba / Hausa / Igbo",
                  "Technical Drawing",
                  "Wood Work / Automechanic",
                  "Health Science",
                  "Food & Nutrition or H. Mgt",
                  "Book Keeping / Accounting",
                  "Further Maths",
                  "Computer",
                ].map((subject, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50/80" : "bg-white/80"}>
                    <td className="border border-gray-400 p-3">{subject}</td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                  </tr>
                ))}
                {/* Empty rows for additional subjects */}
                {[22, 23, 24, 25].map((num) => (
                  <tr key={num} className="bg-white/80">
                    <td className="border border-gray-400 p-3">{num}.</td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                    <td className="border border-gray-400 p-3"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Remarks Section */}
          <div className="space-y-6 mb-8">
            <div>
              <p className="text-[#6B5B95] text-lg">Form Master's Remark...........................................................................................................................................</p>
               <div className="m-5"></div>
              <div className="border-b border-gray-400 mt-2"></div>
            </div>
            <div>
              <p className="text-[#6B5B95] text-lg">Principal's Remarks.............................................................................................................................................</p>
                <div className="m-5"></div>
              <div className="border-b border-gray-400 mt-2"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end mt-10">
            <div className="text-[#6B5B95] text-lg">
              Promoted / Not Promoted
            </div>
            <div className="text-right text-[#6B5B95] text-lg">
              <div className="border-b border-gray-400 w-80 mb-2"></div>
              Principal's Signature, Stamp & Date
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondaryAnnualResult;