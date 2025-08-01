import React, { useState } from 'react';
import { GraduationCap, Plus, X, Calendar, BookOpen, Award, Clock } from 'lucide-react';

// TypeScript interfaces
interface Class {
  id: number;
  name: string;
  level: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  isCore: boolean;
}

interface Grade {
  grade: string;
  min: number;
  max: number;
  description: string;
}

interface SessionConfig {
  currentSession: string;
  currentTerm: string;
  termsPerSession: number;
  sessionStartMonth: string;
}

interface GradingSystem {
  type: 'percentage' | 'letter';
  passMark: number;
  grades: Grade[];
}

interface TimetableConfig {
  maxPeriodsPerDay: number;
  periodDuration: number;
  breakDuration: number;
  startTime: string;
  endTime: string;
  workingDays: string[];
}

const Academic: React.FC = () => {
  // Class & Grade Levels State
  const [classes, setClasses] = useState<Class[]>([
    { id: 1, name: 'Pre-School', level: 'Foundation' },
    { id: 2, name: 'Grade 1', level: 'Primary' },
    { id: 3, name: 'Grade 2', level: 'Primary' }
  ]);
  const [newClass, setNewClass] = useState<Omit<Class, 'id'>>({ name: '', level: 'Primary' });

  // Subjects State
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 1, name: 'Mathematics', code: 'MATH', isCore: true },
    { id: 2, name: 'English Language', code: 'ENG', isCore: true },
    { id: 3, name: 'Science', code: 'SCI', isCore: true }
  ]);
  const [newSubject, setNewSubject] = useState<Omit<Subject, 'id'>>({ name: '', code: '', isCore: false });

  // Session/Term Configuration State
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    currentSession: '2024/2025',
    currentTerm: 'First Term',
    termsPerSession: 3,
    sessionStartMonth: 'September'
  });

  // Grading System State
  const [gradingSystem, setGradingSystem] = useState<GradingSystem>({
    type: 'percentage',
    passMark: 50,
    grades: [
      { grade: 'A', min: 90, max: 100, description: 'Excellent' },
      { grade: 'B', min: 80, max: 89, description: 'Very Good' },
      { grade: 'C', min: 70, max: 79, description: 'Good' },
      { grade: 'D', min: 60, max: 69, description: 'Fair' },
      { grade: 'E', min: 50, max: 59, description: 'Pass' },
      { grade: 'F', min: 0, max: 49, description: 'Fail' }
    ]
  });

  // Timetable Configuration State
  const [timetableConfig, setTimetableConfig] = useState<TimetableConfig>({
    maxPeriodsPerDay: 8,
    periodDuration: 40,
    breakDuration: 20,
    startTime: '08:00',
    endTime: '15:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });

  // Handler functions with proper error handling
  const addClass = (): void => {
    if (newClass.name.trim()) {
      setClasses([...classes, { 
        id: Date.now(), 
        name: newClass.name.trim(), 
        level: newClass.level 
      }]);
      setNewClass({ name: '', level: 'Primary' });
    }
  };

  const removeClass = (id: number): void => {
    setClasses(classes.filter(cls => cls.id !== id));
  };

  const addSubject = (): void => {
    if (newSubject.name.trim() && newSubject.code.trim()) {
      setSubjects([...subjects, { 
        id: Date.now(), 
        name: newSubject.name.trim(),
        code: newSubject.code.trim().toUpperCase(),
        isCore: newSubject.isCore
      }]);
      setNewSubject({ name: '', code: '', isCore: false });
    }
  };

  const removeSubject = (id: number): void => {
    setSubjects(subjects.filter(sub => sub.id !== id));
  };

  const updateGrade = (index: number, field: keyof Grade, value: string | number): void => {
    const updatedGrades = [...gradingSystem.grades];
    const numValue = typeof value === 'string' && field !== 'grade' && field !== 'description' 
      ? parseInt(value) || 0 
      : value;
    
    updatedGrades[index] = { ...updatedGrades[index], [field]: numValue };
    setGradingSystem({ ...gradingSystem, grades: updatedGrades });
  };

  const toggleWorkingDay = (day: string): void => {
    const updatedDays = timetableConfig.workingDays.includes(day)
      ? timetableConfig.workingDays.filter(d => d !== day)
      : [...timetableConfig.workingDays, day];
    setTimetableConfig({ ...timetableConfig, workingDays: updatedDays });
  };

  const handleNumberInput = (value: string, min: number, max: number): number => {
    const num = parseInt(value);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          Academic Configuration
        </h3>
        <p className="text-slate-600">Configure your institution's academic structure, grading system, and timetable settings.</p>
      </div>

      {/* Class & Grade Levels */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Class & Grade Levels
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Class name (e.g., Grade 3)"
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="Class name"
          />
          <div className="flex gap-2">
            <select
              value={newClass.level}
              onChange={(e) => setNewClass({ ...newClass, level: e.target.value })}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              aria-label="Class level"
            >
              <option value="Foundation">Foundation</option>
              <option value="Primary">Primary</option>
              <option value="Secondary">Secondary</option>
              <option value="Senior">Senior</option>
            </select>
            <button
              onClick={addClass}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
              disabled={!newClass.name.trim()}
              aria-label="Add class"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {classes.map((cls) => (
            <div key={cls.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="font-medium text-slate-900">{cls.name}</span>
                <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                  {cls.level}
                </span>
              </div>
              <button
                onClick={() => removeClass(cls.id)}
                className="text-red-500 hover:text-red-700 p-1"
                aria-label={`Remove ${cls.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Management */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-600" />
          Subject Management
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Subject name"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            aria-label="Subject name"
          />
          <input
            type="text"
            placeholder="Subject code"
            value={newSubject.code}
            onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            aria-label="Subject code"
          />
          <div className="flex gap-2">
            <label className="flex items-center gap-2 flex-1">
              <input
                type="checkbox"
                checked={newSubject.isCore}
                onChange={(e) => setNewSubject({ ...newSubject, isCore: e.target.checked })}
                className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                aria-label="Core subject"
              />
              <span className="text-sm">Core Subject</span>
            </label>
            <button
              onClick={addSubject}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              disabled={!newSubject.name.trim() || !newSubject.code.trim()}
              aria-label="Add subject"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {subjects.map((subject) => (
            <div key={subject.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="font-medium text-slate-900">{subject.name}</span>
                <span className="ml-2 px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded">
                  {subject.code}
                </span>
                {subject.isCore && (
                  <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    Core
                  </span>
                )}
              </div>
              <button
                onClick={() => removeSubject(subject.id)}
                className="text-red-500 hover:text-red-700 p-1"
                aria-label={`Remove ${subject.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Session/Term Configuration */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Session & Term Configuration
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Current Session</label>
            <input
              type="text"
              value={sessionConfig.currentSession}
              onChange={(e) => setSessionConfig({ ...sessionConfig, currentSession: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              aria-label="Current session"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Current Term</label>
            <select
              value={sessionConfig.currentTerm}
              onChange={(e) => setSessionConfig({ ...sessionConfig, currentTerm: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              aria-label="Current term"
            >
              <option value="First Term">First Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Third Term">Third Term</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Terms per Session</label>
            <select
              value={sessionConfig.termsPerSession}
              onChange={(e) => setSessionConfig({ ...sessionConfig, termsPerSession: parseInt(e.target.value) || 3 })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              aria-label="Terms per session"
            >
              <option value={2}>2 Terms</option>
              <option value={3}>3 Terms</option>
              <option value={4}>4 Terms</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Session Start Month</label>
            <select
              value={sessionConfig.sessionStartMonth}
              onChange={(e) => setSessionConfig({ ...sessionConfig, sessionStartMonth: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              aria-label="Session start month"
            >
              <option value="January">January</option>
              <option value="September">September</option>
              <option value="February">February</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grading System */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          Grading System
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Grading Type</label>
            <select
              value={gradingSystem.type}
              onChange={(e) => setGradingSystem({ ...gradingSystem, type: e.target.value as 'percentage' | 'letter' })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              aria-label="Grading type"
            >
              <option value="percentage">Percentage Based</option>
              <option value="letter">Letter Grades</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Pass Mark (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={gradingSystem.passMark}
              onChange={(e) => setGradingSystem({ ...gradingSystem, passMark: handleNumberInput(e.target.value, 0, 100) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              aria-label="Pass mark percentage"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-sm font-medium text-slate-700">Grade</th>
                <th className="text-left py-2 text-sm font-medium text-slate-700">Min %</th>
                <th className="text-left py-2 text-sm font-medium text-slate-700">Max %</th>
                <th className="text-left py-2 text-sm font-medium text-slate-700">Description</th>
              </tr>
            </thead>
            <tbody>
              {gradingSystem.grades.map((grade, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="py-2">
                    <input
                      type="text"
                      value={grade.grade}
                      onChange={(e) => updateGrade(index, 'grade', e.target.value)}
                      className="w-16 px-2 py-1 border border-slate-200 rounded text-center"
                      aria-label={`Grade ${index + 1}`}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={grade.min}
                      onChange={(e) => updateGrade(index, 'min', handleNumberInput(e.target.value, 0, 100))}
                      className="w-20 px-2 py-1 border border-slate-200 rounded"
                      aria-label={`Minimum percentage for grade ${index + 1}`}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={grade.max}
                      onChange={(e) => updateGrade(index, 'max', handleNumberInput(e.target.value, 0, 100))}
                      className="w-20 px-2 py-1 border border-slate-200 rounded"
                      aria-label={`Maximum percentage for grade ${index + 1}`}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="text"
                      value={grade.description}
                      onChange={(e) => updateGrade(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded"
                      aria-label={`Description for grade ${index + 1}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timetable Configuration */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Timetable Configuration
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Max Periods per Day</label>
            <input
              type="number"
              min="1"
              max="12"
              value={timetableConfig.maxPeriodsPerDay}
              onChange={(e) => setTimetableConfig({ ...timetableConfig, maxPeriodsPerDay: handleNumberInput(e.target.value, 1, 12) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Maximum periods per day"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Period Duration (minutes)</label>
            <input
              type="number"
              min="30"
              max="90"
              value={timetableConfig.periodDuration}
              onChange={(e) => setTimetableConfig({ ...timetableConfig, periodDuration: handleNumberInput(e.target.value, 30, 90) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Period duration in minutes"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Break Duration (minutes)</label>
            <input
              type="number"
              min="10"
              max="60"
              value={timetableConfig.breakDuration}
              onChange={(e) => setTimetableConfig({ ...timetableConfig, breakDuration: handleNumberInput(e.target.value, 10, 60) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Break duration in minutes"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
            <input
              type="time"
              value={timetableConfig.startTime}
              onChange={(e) => setTimetableConfig({ ...timetableConfig, startTime: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="School start time"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
            <input
              type="time"
              value={timetableConfig.endTime}
              onChange={(e) => setTimetableConfig({ ...timetableConfig, endTime: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="School end time"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Working Days</label>
          <div className="flex flex-wrap gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <button
                key={day}
                onClick={() => toggleWorkingDay(day)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timetableConfig.workingDays.includes(day)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-label={`Toggle ${day} as working day`}
                aria-pressed={timetableConfig.workingDays.includes(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Academic;