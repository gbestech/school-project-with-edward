import React from "react";

const TermlyResultSheet = ({ student, school, results, term }) => {
  return (
    <div className="w-[800px] mx-auto bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        {/* Logo */}
        <img
          src={school.logo || "/logo.png"}
          alt="School Logo"
          className="w-20 h-20 object-contain"
        />

        {/* School Name */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-800">{school.name}</h1>
          <p className="text-gray-600">{school.address}</p>
          <p className="font-semibold">
            {term} Term Result Sheet - {school.session}
          </p>
        </div>

        {/* Student Profile */}
        <img
          src={student.photo || "/student-placeholder.png"}
          alt="Student"
          className="w-20 h-20 rounded-full border-2 border-blue-600 object-cover"
        />
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 mb-6 bg-gray-50">
        <p>
          <span className="font-semibold">Name:</span> {student.name}
        </p>
        <p>
          <span className="font-semibold">Class:</span> {student.className}
        </p>
        <p>
          <span className="font-semibold">Age:</span> {student.age}
        </p>
        <p>
          <span className="font-semibold">No. in Class:</span> {student.classSize}
        </p>
        <p>
          <span className="font-semibold">Attendance:</span> {student.attendance}
        </p>
        <p>
          <span className="font-semibold">Average:</span> {student.avg}
        </p>
      </div>

      {/* Results Table */}
      <table className="w-full border-collapse border text-sm text-center shadow-sm">
        <thead>
          <tr className="bg-green-100">
            <th className="border p-2">Subject</th>
            <th className="border p-2">{term} Term Score</th>
            <th className="border p-2">Grade</th>
            <th className="border p-2">Teacher’s Remark</th>
          </tr>
        </thead>
        <tbody>
          {results.map((res, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
              <td className="border p-2">{res.subject}</td>
              <td className="border p-2">{res.score}</td>
              <td className="border p-2 font-semibold">{res.grade}</td>
              <td className="border p-2 italic">{res.remark}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Remarks Section */}
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="p-4 bg-yellow-50 border rounded-lg">
          <h2 className="font-semibold mb-2">Form Master’s Remark:</h2>
          <p>{student.formRemark}</p>
        </div>
        <div className="p-4 bg-green-50 border rounded-lg">
          <h2 className="font-semibold mb-2">Principal’s Remark:</h2>
          <p>{student.principalRemark}</p>
        </div>
      </div>
    </div>
  );
};

export default TermlyResultSheet;
