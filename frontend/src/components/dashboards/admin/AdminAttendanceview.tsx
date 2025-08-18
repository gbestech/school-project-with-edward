import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Users, Calendar, Download, Eye } from 'lucide-react';
import {
  getAttendance,
  addAttendance,
  updateAttendance,
  deleteAttendance,
  AttendanceStatusMap,
  AttendanceRecordBackend,
  AttendanceCodeToStatusMap,
} from '@/services/AttendanceService';
import StudentService, { Student } from '@/services/StudentService';

interface AttendanceRecord {
  id: number;
  name: string;
  type: 'student' | 'teacher' | 'staff';
  level: string;
  class: string;
  section: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  timeIn: string;
  timeOut: string;
  term: string;
}

const AttendanceDashboard = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [filters, setFilters] = useState<{
    level: string;
    class: string;
    type: string;
    period: string;
    date: string;
    section: string;
  }>({
    level: 'all',
    class: 'all',
    type: 'all',
    period: 'daily',
    date: new Date().toISOString().slice(0, 10),
    section: 'all',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const levels = ['all', 'nursery', 'primary', 'secondary'];
  const types = ['all', 'student', 'teacher', 'staff'];
  const periods = ['daily', 'weekly', 'termly'];
  const sections = ['all', 'Blue', 'Red', 'Green', 'Staff', 'Support'];
  const statuses = ['present', 'absent', 'late', 'excused'];

  // Fetch attendance from backend
  useEffect(() => {
    setLoading(true);
    setError(null);
    getAttendance({ date: filters.date })
      .then((data) => {
        // Map backend data to AttendanceRecord[]
        const mapped: AttendanceRecord[] = (data.results || data).map((rec: AttendanceRecordBackend) => ({
          id: rec.id,
          name: rec.student || rec.teacher ? `ID ${rec.student || rec.teacher}` : 'Unknown',
          type: rec.student ? 'student' : rec.teacher ? 'teacher' : 'staff',
          level: '', // You may fetch student/teacher/class info for richer display
          class: '',
          section: '',
          date: rec.date,
          status: AttendanceCodeToStatusMap[rec.status],
          timeIn: '',
          timeOut: '',
          term: '',
        }));
        setAttendanceRecords(mapped);
      })
      .catch((err) => setError('Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [filters.date]);

  useEffect(() => {
    let filtered = attendanceRecords.filter(record => {
      return (
        (filters.level === 'all' || record.level === filters.level) &&
        (filters.type === 'all' || record.type === filters.type) &&
        (filters.section === 'all' || record.section === filters.section) &&
        record.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredRecords(filtered);
  }, [filters, attendanceRecords, searchTerm]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAdd = (): void => {
    setEditingRecord(null);
    setShowModal(true);
  };

  const handleEdit = (record: AttendanceRecord): void => {
    setEditingRecord(record);
    setShowModal(true);
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setLoading(true);
      try {
        await deleteAttendance(id);
        setAttendanceRecords(prev => prev.filter(record => record.id !== id));
      } catch (err) {
        setError('Failed to delete record');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async (formData: any): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { selectedStudent, ...rest } = formData;
      if (!selectedStudent) {
        setError('Please select a student.');
        setLoading(false);
        return;
      }
      // Add new record
      const newRec = await addAttendance({
        student: selectedStudent.id,
        section: selectedStudent.section_id, // Use section_id PK
        date: filters.date,
        status: AttendanceStatusMap[rest.status as keyof typeof AttendanceStatusMap],
        // Optionally add timeIn/timeOut if your backend supports it
      });
      setAttendanceRecords(prev => [...prev, {
        ...rest,
        id: newRec.id,
        date: filters.date,
        name: selectedStudent.full_name,
        type: 'student',
        level: selectedStudent.education_level_display || '',
        class: selectedStudent.student_class_display || '',
        section: selectedStudent.classroom || '',
      } as AttendanceRecord]);
      setShowModal(false);
    } catch (err) {
      setError('Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      excused: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAttendanceStats = () => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter(r => r.status === 'present').length;
    const absent = filteredRecords.filter(r => r.status === 'absent').length;
    const late = filteredRecords.filter(r => r.status === 'late').length;
    return { total, present, absent, late, rate: total > 0 ? ((present / total) * 100).toFixed(1) : 0 };
  };

  const stats = getAttendanceStats();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Dashboard</h1>
        <p className="text-gray-600">Manage student, teacher, and staff attendance</p>
      </div>
      {loading && <div className="text-blue-600 mb-2">Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <div className="h-4 w-4 bg-green-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <div className="h-4 w-4 bg-red-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-purple-600">{stats.rate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {types.slice(1).map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
          
          <select
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            {levels.slice(1).map(level => (
              <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
            ))}
          </select>

          <select
            value={filters.section}
            onChange={(e) => handleFilterChange('section', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sections</option>
            {sections.slice(1).map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>

          <select
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periods.map(period => (
              <option key={period} value={period}>{period.charAt(0).toUpperCase() + period.slice(1)}</option>
            ))}
          </select>

          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Record
          </button>
          
          <div className="flex gap-2">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Report
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{record.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{record.level}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.section}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.timeIn || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.timeOut || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(record)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <AttendanceModal
          record={editingRecord}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          levels={levels.slice(1)}
          sections={sections.slice(1)}
          statuses={statuses}
          types={types.slice(1)}
        />
      )}
    </div>
  );
};

interface AttendanceModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
  onSave: (formData: Omit<AttendanceRecord, 'id' | 'date'> & { date?: string }) => void;
  levels: string[];
  sections: string[];
  statuses: string[];
  types: string[];
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ record, onClose, onSave, levels, sections, statuses, types }) => {
  const [formData, setFormData] = useState<Omit<AttendanceRecord, 'id' | 'date'> & { date?: string }>({
    name: record?.name || '',
    type: (record?.type as 'student' | 'teacher' | 'staff') || 'student',
    level: record?.level || 'primary',
    class: record?.class || '',
    section: record?.section || 'Blue',
    status: (record?.status as 'present' | 'absent' | 'late' | 'excused') || 'present',
    timeIn: record?.timeIn || '',
    timeOut: record?.timeOut || '',
    term: record?.term || 'Second Term',
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentQuery, setStudentQuery] = useState('');
  const [studentOptions, setStudentOptions] = useState<Student[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);

  // Autocomplete student search
  useEffect(() => {
    if (studentQuery.length < 2) {
      setStudentOptions([]);
      return;
    }
    setStudentLoading(true);
    StudentService.searchStudents(studentQuery).then((students) => {
      setStudentOptions(students);
      setStudentLoading(false);
    });
  }, [studentQuery]);

  // When a student is selected, auto-populate fields and store the student object
  const handleStudentSelect = (student: Student) => {
    setFormData(prev => ({
      ...prev,
      name: student.full_name,
      type: 'student',
      level: student.education_level_display || '',
      class: student.student_class_display || '',
      section: student.classroom || '',
    }));
    setSelectedStudent(student);
    setStudentQuery(student.full_name);
    setStudentOptions([]);
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass selectedStudent along with formData
    onSave({ ...formData, selectedStudent });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {record ? 'Edit Attendance Record' : 'Add Attendance Record'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Username</label>
              <input
                type="text"
                value={studentQuery}
                onChange={e => setStudentQuery(e.target.value)}
                placeholder="Search by username..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="off"
              />
              {studentLoading && <div className="text-xs text-gray-400">Searching...</div>}
              {studentOptions.length > 0 && (
                <ul className="border rounded bg-white mt-1 max-h-40 overflow-y-auto z-10">
                  {studentOptions.map(student => (
                    <li
                      key={student.id}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => handleStudentSelect(student)}
                    >
                      {student.full_name} ({student.email || student.id})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <input
                type="text"
                value={formData.type}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <input
                type="text"
                value={formData.level}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <input
                type="text"
                value={formData.class}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <input
                type="text"
                value={formData.section}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time In</label>
                <input
                  type="time"
                  value={formData.timeIn}
                  onChange={(e) => handleChange('timeIn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Out</label>
                <input
                  type="time"
                  value={formData.timeOut}
                  onChange={(e) => handleChange('timeOut', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
              >
                {record ? 'Update' : 'Add'} Record
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;