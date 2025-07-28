import React, { useState, useMemo } from 'react';
import { mockStudentResults, schoolLogoSVG, StudentResultSheet } from '../../../data/mockResultsData';

const getUnique = (arr: string[]) => Array.from(new Set(arr));

const AdminResult = () => {
  // Filters
  const [classFilter, setClassFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentResultSheet | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Unique filter options
  const classes = useMemo(() => getUnique(mockStudentResults.map(s => s.class)), []);
  const years = useMemo(() => getUnique(mockStudentResults.map(s => s.year)), []);
  const terms = useMemo(() => getUnique(mockStudentResults.map(s => s.term)), []);

  // Filtered students
  const filtered = useMemo(() => {
    return mockStudentResults.filter(s =>
      (classFilter === 'all' || s.class === classFilter) &&
      (yearFilter === 'all' || s.year === yearFilter) &&
      (termFilter === 'all' || s.term === termFilter) &&
      (search === '' ||
        s.studentName.toLowerCase().includes(search.toLowerCase()) ||
        s.username.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [classFilter, yearFilter, termFilter, search]);

  const handleRowClick = (student: StudentResultSheet) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-4">Student Results</h2>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or username"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="border px-2 py-1 rounded">
          <option value="all">All Classes</option>
          {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
        </select>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="border px-2 py-1 rounded">
          <option value="all">All Years</option>
          {years.map(yr => <option key={yr} value={yr}>{yr}</option>)}
        </select>
        <select value={termFilter} onChange={e => setTermFilter(e.target.value)} className="border px-2 py-1 rounded">
          <option value="all">All Terms</option>
          {terms.map(term => <option key={term} value={term}>{term}</option>)}
        </select>
      </div>
      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-2 py-2 border">Name</th>
              <th className="px-2 py-2 border">Username</th>
              <th className="px-2 py-2 border">Class</th>
              <th className="px-2 py-2 border">Term</th>
              <th className="px-2 py-2 border">Year</th>
              <th className="px-2 py-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4">No students found.</td></tr>
            ) : (
              filtered.map(student => (
                <tr key={student.studentId} className="hover:bg-blue-50 cursor-pointer">
                  <td className="border px-2 py-1">{student.studentName}</td>
                  <td className="border px-2 py-1">{student.username}</td>
                  <td className="border px-2 py-1">{student.class}</td>
                  <td className="border px-2 py-1">{student.term}</td>
                  <td className="border px-2 py-1">{student.year}</td>
                  <td className="border px-2 py-1">
                    <button className="text-blue-600 underline" onClick={() => handleRowClick(student)}>View Result</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal for detailed result sheet */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl relative print:w-full print:max-w-none print:shadow-none print:rounded-none" style={{ position: 'relative' }}>
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-500 hover:text-red-600 print:hidden">&times;</button>
            {/* Header with logo and school info */}
            <div className="flex items-center justify-between border-b-2 border-gray-800 pb-2 mb-4 print:mb-2">
              <div dangerouslySetInnerHTML={{ __html: schoolLogoSVG }} style={{ width: 80, height: 80 }} />
              <div className="flex-1 text-center">
                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">God's Treasure Schools</h1>
                <div className="text-sm text-gray-700">NO. 54 DAGBANA ROAD JIKWOYI PHASE 3 ABUJA</div>
                <div className="text-sm text-gray-700">FIRST TERM EXAMINATION {selectedStudent.year} ACADEMIC SESSION</div>
              </div>
              <div>
                <img src={selectedStudent.profilePicUrl} alt="Student" className="w-20 h-20 rounded-full border-2 border-gray-300 object-cover" />
              </div>
            </div>
            {/* Student and exam info */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
              <div><span className="font-semibold">Name:</span> {selectedStudent.studentName}</div>
              <div><span className="font-semibold">Class:</span> {selectedStudent.class}</div>
              <div><span className="font-semibold">Term:</span> {selectedStudent.term}</div>
              <div><span className="font-semibold">Session:</span> {selectedStudent.year}</div>
            </div>
            {/* Results Table */}
            <table className="w-full border mt-2 mb-4 text-sm print:text-xs">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 py-1">Subject</th>
                  <th className="border px-2 py-1">Score</th>
                  <th className="border px-2 py-1">Grade</th>
                  <th className="border px-2 py-1">Remarks</th>
                  <th className="border px-2 py-1">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudent.results.map((res, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{res.subject}</td>
                    <td className="border px-2 py-1 text-center">{res.score}</td>
                    <td className="border px-2 py-1 text-center">{res.grade}</td>
                    <td className="border px-2 py-1">{res.remarks}</td>
                    <td className="border px-2 py-1">{res.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Footer/Signatures */}
            <div className="flex justify-between items-end mt-8 print:mt-4">
              <div className="text-sm">
                <div className="mb-2">__________________________<br />Class Teacher's Signature</div>
                <div>Date: ____________________</div>
              </div>
              <div className="text-sm text-right">
                <div className="mb-2">__________________________<br />Head Teacher's Signature</div>
                <div>Date: ____________________</div>
              </div>
            </div>
            {/* Print Button (hidden on print) */}
            <div className="mt-6 flex justify-center print:hidden">
              <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">Print Result Sheet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResult;