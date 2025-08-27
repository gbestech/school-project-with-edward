import React from "react";

type Result = {
  subject: string;
  term1: number;
  term2: number;
  term3: number;
  annualAvg: number;
  grade: string;
  remark: string;
};

interface ResultTableProps {
  results: Result[];
}

const ResultTable: React.FC<ResultTableProps> = ({ results }) => {
  return (
    <table className="w-full border-collapse border text-sm text-center shadow-sm">
      <thead>
        <tr className="bg-blue-100">
          <th className="border p-2">Subject</th>
          <th className="border p-2">1st Term</th>
          <th className="border p-2">2nd Term</th>
          <th className="border p-2">3rd Term</th>
          <th className="border p-2 font-bold">Annual Avg</th>
          <th className="border p-2">Grade</th>
          <th className="border p-2">Teacher’s Remark</th>
        </tr>
      </thead>
      <tbody>
        {results.map((res, index) => (
          <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
            <td className="border p-2">{res.subject}</td>
            <td className="border p-2">{res.term1}</td>
            <td className="border p-2">{res.term2}</td>
            <td className="border p-2">{res.term3}</td>
            <td className="border p-2 font-semibold">{res.annualAvg}</td>
            <td className="border p-2">{res.grade}</td>
            <td className="border p-2 italic">{res.remark}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ResultTable;

// Mock data for annual result
export const mockAnnualResult = {
  student: {
    name: 'Jane Doe',
    className: 'SS2A',
    age: 16,
    classSize: 32,
    attendance: '95%',
    annualAvg: 87.3,
    photo: '',
    formRemark: 'Excellent performance throughout the year.',
    principalRemark: 'Keep up the good work! Ready for next class.',
  },
  school: {
    name: 'Bright Future College',
    address: '123 School Lane, City',
    logo: '',
    session: '2023/2024',
  },
  results: [
    { subject: 'Mathematics', term1: 88, term2: 90, term3: 85, annualAvg: 87.7, grade: 'A', remark: 'Great job' },
    { subject: 'English', term1: 82, term2: 85, term3: 80, annualAvg: 82.3, grade: 'B+', remark: 'Good effort' },
    { subject: 'Biology', term1: 90, term2: 92, term3: 89, annualAvg: 90.3, grade: 'A', remark: 'Excellent' },
    { subject: 'Chemistry', term1: 85, term2: 87, term3: 88, annualAvg: 86.7, grade: 'A-', remark: 'Well done' },
  ],
  session: '2023/2024',
};

// Mock data for termly result
export const mockTermlyResult = {
  student: {
    name: 'Jane Doe',
    className: 'SS2A',
    age: 16,
    classSize: 32,
    attendance: '32/34',
    avg: 88.5,
    photo: '',
    formRemark: 'Very attentive and hardworking.',
    principalRemark: 'Promoted to next class.',
  },
  school: {
    name: 'Bright Future College',
    address: '123 School Lane, City',
    logo: '',
    session: '2023/2024',
  },
  results: [
    { subject: 'Mathematics', score: 90, grade: 'A', remark: 'Excellent' },
    { subject: 'English', score: 85, grade: 'B+', remark: 'Good' },
    { subject: 'Biology', score: 92, grade: 'A', remark: 'Outstanding' },
    { subject: 'Chemistry', score: 87, grade: 'A-', remark: 'Very good' },
  ],
  term: '3rd',
};