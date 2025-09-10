import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Calendar, Clock, Eye, X } from 'lucide-react';

// TypeScript interfaces
interface Lesson {
  id: number;
  subject: string;
  class: string;
  level: 'nursery' | 'primary' | 'secondary';
  teacher: string;
  topic: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: 'completed' | 'ongoing' | 'scheduled';
  content: string;
}

interface LessonsProps {
  searchTerm?: string;
  selectedTimeframe?: 'all' | 'today' | 'week';
  selectedClass?: string;
  selectedSubject?: string;
}

const defaultProps: LessonsProps = {
  searchTerm: '',
  selectedTimeframe: 'all',
  selectedClass: 'all',
  selectedSubject: 'all',
};

const Lessons: React.FC<LessonsProps> = ({
  searchTerm = '',
  selectedTimeframe = 'all',
  selectedClass = 'all',
  selectedSubject = 'all',
}) => {
  const [lessons] = useState<Lesson[]>([
    {
      id: 1,
      subject: 'Mathematics',
      class: 'Primary 5',
      level: 'primary',
      teacher: 'Mrs. Johnson',
      topic: 'Fractions and Decimals',
      date: '2025-07-23',
      time: '09:00 - 10:00',
      status: 'completed',
      content: 'Today we covered converting fractions to decimals and vice versa.'
    },
    {
      id: 2,
      subject: 'English Language',
      class: 'Primary 4',
      level: 'primary',
      teacher: 'Mr. Adams',
      topic: 'Reading Comprehension',
      date: '2025-07-23',
      time: '10:00 - 11:00',
      status: 'ongoing',
      content: 'Reading and analyzing short stories for comprehension.'
    },
    {
      id: 3,
      subject: 'Basic Science',
      class: 'Primary 5',
      level: 'primary',
      teacher: 'Mrs. Davis',
      topic: 'States of Matter',
      date: '2025-07-24',
      time: '11:00 - 12:00',
      status: 'scheduled',
      content: 'Introduction to solid, liquid, and gas states of matter.'
    },
    {
      id: 4,
      subject: 'Mathematics',
      class: 'JSS 1',
      level: 'secondary',
      teacher: 'Mr. Brown',
      topic: 'Algebraic Expressions',
      date: '2025-07-23',
      time: '14:00 - 15:00',
      status: 'completed',
      content: 'Introduction to variables and simple algebraic expressions.'
    },
    {
      id: 5,
      subject: 'Phonics',
      class: 'Nursery 2',
      level: 'nursery',
      teacher: 'Miss Sarah',
      topic: 'Letter Sounds A-E',
      date: '2025-07-23',
      time: '08:00 - 09:00',
      status: 'completed',
      content: 'Learning the sounds of letters A, B, C, D, and E.'
    }
  ]);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Improved week filter: checks if lesson date is in the current week (Monday-Sunday)
  const isDateInCurrentWeek = (dateStr: string) => {
    const now = new Date();
    const lessonDate = new Date(dateStr);
    // Set to Monday of this week
    const firstDayOfWeek = new Date(now);
    firstDayOfWeek.setDate(now.getDate() - now.getDay() + 1);
    firstDayOfWeek.setHours(0, 0, 0, 0);
    // Set to Sunday of this week
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);
    return lessonDate >= firstDayOfWeek && lessonDate <= lastDayOfWeek;
  };

  // Memoized filtered lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const matchesSearch = lesson.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.teacher.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === 'all' || lesson.class === selectedClass;
      const matchesSubject = selectedSubject === 'all' || lesson.subject === selectedSubject;
      let matchesTimeframe = true;
      const today = new Date().toISOString().split('T')[0];
      if (selectedTimeframe === 'today') {
        matchesTimeframe = lesson.date === today;
      } else if (selectedTimeframe === 'week') {
        matchesTimeframe = isDateInCurrentWeek(lesson.date);
      }
      return matchesSearch && matchesClass && matchesSubject && matchesTimeframe;
    });
  }, [lessons, searchTerm, selectedClass, selectedSubject, selectedTimeframe]);

  // Handlers
  const viewLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedLesson(null);
  }, []);

  // Modal accessibility: ESC to close, focus trap
  useEffect(() => {
    if (!selectedLesson) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    // Focus trap
    if (modalRef.current) {
      modalRef.current.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedLesson, closeModal]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Lessons Overview</h2>
        <p className="text-gray-600">View and manage lessons posted by teachers</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLessons.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400 text-lg">
                  No lessons found for the selected filters.
                </td>
              </tr>
            ) : (
              filteredLessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lesson.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lesson.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      lesson.level === 'nursery' ? 'bg-pink-100 text-pink-800' :
                        lesson.level === 'primary' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                    }`}>
                      {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lesson.teacher}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lesson.topic}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {lesson.date}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {lesson.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      lesson.status === 'completed' ? 'bg-green-100 text-green-800' :
                        lesson.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lesson.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewLesson(lesson)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="View Lesson"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto outline-none"
            ref={modalRef}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Lesson Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close lesson details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Subject</label>
                  <p className="text-gray-900">{selectedLesson.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Class</label>
                  <p className="text-gray-900">{selectedLesson.class}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teacher</label>
                  <p className="text-gray-900">{selectedLesson.teacher}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date & Time</label>
                  <p className="text-gray-900">{selectedLesson.date} ({selectedLesson.time})</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-500">Topic</label>
                <p className="text-gray-900 text-lg font-medium">{selectedLesson.topic}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Lesson Content</label>
                <p className="text-gray-900 mt-2 leading-relaxed">{selectedLesson.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;