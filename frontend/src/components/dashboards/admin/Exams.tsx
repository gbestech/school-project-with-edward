import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, Printer, Download, X, Eye } from 'lucide-react';
import { mockExams, Exam, ObjectiveQuestion, TheoryQuestion, SchoolInfo, SectionCQuestion } from '../../../data/mockExamsData';
import { useSettings } from '@/contexts/SettingsContext';

interface ExamsPageProps {
  searchTerm?: string;
  selectedLevel?: 'all' | 'nursery' | 'primary' | 'secondary';
  selectedClass?: string;
  selectedSubject?: string;
}

const defaultProps: ExamsPageProps = {
  searchTerm: '',
  selectedLevel: 'all',
  selectedClass: 'all',
  selectedSubject: 'all',
};

const ExamsPage: React.FC<ExamsPageProps> = ({
  searchTerm = '',
  selectedLevel = 'all',
  selectedClass = 'all',
  selectedSubject = 'all',
}) => {
  const { settings } = useSettings();
  // Use imported mockExams as the initial state
  const [exams, setExams] = useState<Exam[]>(mockExams);

  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedExamForPrint, setSelectedExamForPrint] = useState<Exam | null>(null);

  const [newExam, setNewExam] = useState<Exam>({
    id: 0,
    title: '',
    subject: '',
    class: '',
    level: 'primary',
    teacher: '',
    date: '',
    duration: '',
    totalMarks: 0,
    instructions: {
      objectives: 'Answer all questions. Choose the correct option from A to D.',
      theory: 'Answer all questions. Show your working clearly.',
      sectionc: 'Read the passage carefully and answer the questions that follow.'
    },
    questions: { objectives: [], theory: [], sectionc: [] },
    school: {
      name: settings?.school_name || "GOD'S TREASURE SCHOOLS",
      address: settings?.school_address || "NO. 54 DAGBANA ROAD JIKWOYI PHASE 3 ABUJA",
      session: settings?.academic_year || "2024/2025 ACADEMIC SESSION",
      term: settings?.current_term || "FIRST TERM EXAMINATION"
    }
  });

  const modalRef = useRef<HTMLDivElement>(null);

  const classes = ['all', 'Nursery 1', 'Nursery 2', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'];
  const subjects = ['all', 'Mathematics', 'English Language', 'Basic Science and Technology', 'Social Studies', 'French', 'Phonics', 'Creative Arts'];

  // Update newExam when settings change
  useEffect(() => {
    setNewExam(prev => ({
      ...prev,
      school: {
        name: settings?.school_name || "GOD'S TREASURE SCHOOLS",
        address: settings?.school_address || "NO. 54 DAGBANA ROAD JIKWOYI PHASE 3 ABUJA",
        session: settings?.academic_year || "2024/2025 ACADEMIC SESSION",
        term: settings?.current_term || "FIRST TERM EXAMINATION"
      }
    }));
  }, [settings]);

  // Memoized filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.teacher.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = selectedLevel === 'all' || exam.level === selectedLevel;
      const matchesClass = selectedClass === 'all' || exam.class === selectedClass;
      const matchesSubject = selectedSubject === 'all' || exam.subject === selectedSubject;
      return matchesSearch && matchesLevel && matchesClass && matchesSubject;
    });
  }, [exams, searchTerm, selectedLevel, selectedClass, selectedSubject]);

  // Handlers
  const handleCreateExam = useCallback(() => {
    if (editingExam) {
      setExams(exams.map(exam => exam.id === editingExam.id ? { ...newExam, id: editingExam.id } : exam));
      setEditingExam(null);
    } else {
      setExams([...exams, { ...newExam, id: Date.now() }]);
    }
    resetExamForm();
  }, [editingExam, exams, newExam]);

  const resetExamForm = useCallback(() => {
    setNewExam({
      id: 0,
      title: '',
      subject: '',
      class: '',
      level: 'primary',
      teacher: '',
      date: '',
      duration: '',
      totalMarks: 0,
      instructions: {
        objectives: 'Answer all questions. Choose the correct option from A to D.',
        theory: 'Answer all questions. Show your working clearly.',
        sectionc: 'Read the passage carefully and answer the questions that follow.'
      },
      questions: { objectives: [], theory: [], sectionc: [] },
      school: {
        name: settings?.school_name || "GOD'S TREASURE SCHOOLS",
        address: settings?.school_address || "NO. 54 DAGBANA ROAD JIKWOYI PHASE 3 ABUJA",
        session: settings?.academic_year || "2024/2025 ACADEMIC SESSION",
        term: settings?.current_term || "FIRST TERM EXAMINATION"
      }
    });
    setShowExamModal(false);
  }, [settings]);

  const handleEditExam = useCallback((exam: Exam) => {
    setNewExam({ ...exam });
    setEditingExam(exam);
    setShowExamModal(true);
  }, []);

  const handleDeleteExam = useCallback((examId: number) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      setExams(exams.filter(exam => exam.id !== examId));
    }
  }, [exams]);

  const handlePrintExam = useCallback((exam: Exam) => {
    setSelectedExamForPrint(exam);
    setShowPrintPreview(true);
  }, []);

  const handleDownloadExam = useCallback((exam: Exam) => {
    const element = document.createElement('a');
    const examContent = generateExamHTML(exam);
    const file = new Blob([examContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${exam.title}_${exam.class.replace(' ', '_')}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, []);

  const generateExamHTML = (exam: Exam) => {
    const objectivesMarks = exam.questions.objectives.length;
    const theoryMarks = exam.questions.theory.reduce((sum, q) => sum + q.marks, 0);
    const sectionC = exam.questions.sectionc;
    
    // Use dynamic school information from settings
    const schoolName = settings?.school_name || exam.school.name;
    const schoolAddress = settings?.school_address || exam.school.address;
    const academicSession = settings?.academic_year || exam.school.session;
    const currentTerm = settings?.current_term || exam.school.term;
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>${exam.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 15mm; line-height: 1.3; font-size: 14px; position: relative; }
    body::before {
      content: "${schoolName}";
      position: fixed;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 60px;
      color: #cccccc;
      opacity: 0.12;
      z-index: 0;
      pointer-events: none;
      white-space: pre;
      width: 100vw;
      text-align: center;
      font-weight: bold;
      user-select: none;
    }
    .header, .exam-details-table, .student-info, .section, .section h3, .section-instruction, .question, .options, .sub-questions, .section-c-passage, .section-c-question {
      position: relative;
      z-index: 1;
    }
    .header { text-align: center; margin-bottom: 0; border-bottom: none; padding-bottom: 2px; page-break-after: avoid; }
    .school-name { font-weight: bold; font-size: 20px; margin-bottom: 2px; }
    .school-address { font-size: 13px; margin-bottom: 2px; }
    .exam-title { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
    .exam-details-table { width: 100%; border-collapse: collapse; margin: 2px 0 0 0; font-size: 14px; border-bottom: 1.5px solid #000; page-break-after: avoid; }
    .exam-details-table td { padding: 1px 4px; vertical-align: top; }
    .exam-details-table .label { font-weight: bold; width: 60px; }
    .exam-details-table .value { width: 120px; }
    .student-info { margin: 2px 0 2px 0; padding-bottom: 2px; font-size: 14px; border-bottom: none; }
    .section { margin: 6px 0; page-break-inside: avoid; }
    .section h3 { background-color: #f0f0f0; padding: 4px 8px; margin: 6px 0 4px 0; border-left: 4px solid #333; font-size: 16px; font-weight: bold; }
    .section-instruction { margin: 4px 0 6px 0; font-weight: bold; font-size: 13px; }
    .question { margin: 4px 0; padding-left: 8px; }
    .options { margin-left: 16px; margin-top: 2px; font-size: 13px; }
    .sub-questions { margin-left: 16px; margin-top: 3px; }
    .section-c-passage { background: #f9fafb; border-left: 4px solid #6366f1; padding: 8px; margin-bottom: 6px; font-style: italic; white-space: pre-line; font-size: 13px; }
    .section-c-question { margin-bottom: 4px; }
    @media print { body { margin: 10mm; font-size: 14px; } .no-print { display: none; } .section { page-break-inside: avoid; } .question { page-break-inside: avoid; } .header, .exam-details-table { page-break-after: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="school-name">${schoolName}</div>
    <div class="school-address">${schoolAddress}</div>
    <div class="exam-title">${currentTerm} ${academicSession}</div>
  </div>
  <table class="exam-details-table">
    <tr>
      <td class="label">CLASS:</td>
      <td class="value">${exam.class}</td>
      <td class="label">TIME:</td>
      <td class="value">${exam.duration}</td>
    </tr>
    <tr>
      <td class="label">SUBJECT:</td>
      <td class="value">${exam.subject}</td>
      <td class="label">DATE:</td>
      <td class="value">_____________</td>
    </tr>
  </table>
  <div class="student-info">
    <span class="label">NAME:</span> ________________________________________________
  </div>
  ${exam.questions.objectives.length > 0 ? `<div class="section">
    <h3>SECTION "A" OBJECTIVES</h3>
    <div class="section-instruction">INSTRUCTION: ${exam.instructions.objectives} (${objectivesMarks} MARKS)</div>
    ${exam.questions.objectives.map((q, index) => `<div class="question">
      ${index + 1}. ${q.question}
      <div class="options">
        (a) ${q.options[0]} (b) ${q.options[1]} (c) ${q.options[2]} (d) ${q.options[3]}
      </div>
    </div>`).join('')}
  </div>` : ''}
  ${exam.questions.theory.length > 0 ? `<div class="section">
    <h3>SECTION B: THEORY</h3>
    <div class="section-instruction">INSTRUCTION: ${exam.instructions.theory} (${theoryMarks} MARKS)</div>
    ${exam.questions.theory.map((q, index) => `<div class="question">
      ${index + 1}. ${q.question} (${q.marks} marks)
      ${q.subQuestions && q.subQuestions.length > 0 ? `<div class="sub-questions">
        ${q.subQuestions.map((sub, subIndex) => `${String.fromCharCode(97 + subIndex)}. ${sub}`).join('<br>')}
      </div>` : ''}
    </div>`).join('')}
  </div>` : ''}
  ${sectionC && sectionC.length > 0 ? `<div class="section">
    <h3>SECTION C: LITERATURE</h3>
    <div class="section-instruction">INSTRUCTION: ${exam.instructions.sectionc}</div>
    ${sectionC.map((c, idx) => `<div class="section-c-passage">
      <strong>Literature: ${c.title}${c.subtitle ? ': ' + c.subtitle : ''}</strong><br />
      ${c.text}
    </div>
    <div>
      ${c.questions.map((q, qidx) => `<div class="section-c-question">
        ${qidx + 1}. ${q.question} (${q.marks} marks)
      </div>`).join('')}
    </div>`).join('')}
  </div>` : ''}
</body>
</html>`;
  };

  // Objective and Theory question handlers (typed)
  const addObjectiveQuestion = useCallback(() => {
    setNewExam(prev => ({
      ...prev,
      questions: {
        ...prev.questions,
        objectives: [
          ...prev.questions.objectives,
          { question: '', options: ['', '', '', ''], answer: 'a' }
        ]
      }
    }));
  }, []);

  const addTheoryQuestion = useCallback(() => {
    setNewExam(prev => ({
      ...prev,
      questions: {
        ...prev.questions,
        theory: [
          ...prev.questions.theory,
          { question: '', subQuestions: [], marks: 5 }
        ]
      }
    }));
  }, []);

  const updateObjectiveQuestion = useCallback((index: number, field: keyof ObjectiveQuestion, value: any) => {
    setNewExam(prev => {
      const updatedObjectives = [...prev.questions.objectives];
      if (field === 'options') {
        updatedObjectives[index].options = value as string[];
      } else {
        (updatedObjectives[index][field] as string) = value;
      }
      return {
        ...prev,
        questions: {
          ...prev.questions,
          objectives: updatedObjectives
        }
      };
    });
  }, []);

  const updateTheoryQuestion = useCallback((index: number, field: keyof TheoryQuestion, value: any) => {
    setNewExam(prev => {
      const updatedTheory = [...prev.questions.theory];
      (updatedTheory[index][field] as string | number | string[]) = value;
      return {
        ...prev,
        questions: {
          ...prev.questions,
          theory: updatedTheory
        }
      };
    });
  }, []);

  const addSubQuestion = useCallback((theoryIndex: number) => {
    setNewExam(prev => {
      const updatedTheory = [...prev.questions.theory];
      updatedTheory[theoryIndex].subQuestions.push('');
      return {
        ...prev,
        questions: {
          ...prev.questions,
          theory: updatedTheory
        }
      };
    });
  }, []);

  const updateSubQuestion = useCallback((theoryIndex: number, subIndex: number, value: string) => {
    setNewExam(prev => {
      const updatedTheory = [...prev.questions.theory];
      updatedTheory[theoryIndex].subQuestions[subIndex] = value;
      return {
        ...prev,
        questions: {
          ...prev.questions,
          theory: updatedTheory
        }
      };
    });
  }, []);

  const removeSubQuestion = useCallback((theoryIndex: number, subIndex: number) => {
    setNewExam(prev => {
      const updatedTheory = [...prev.questions.theory];
      updatedTheory[theoryIndex].subQuestions.splice(subIndex, 1);
      return {
        ...prev,
        questions: {
          ...prev.questions,
          theory: updatedTheory
        }
      };
    });
  }, []);

  const removeObjectiveQuestion = useCallback((index: number) => {
    setNewExam(prev => ({
      ...prev,
      questions: {
        ...prev.questions,
        objectives: prev.questions.objectives.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const removeTheoryQuestion = useCallback((index: number) => {
    setNewExam(prev => ({
      ...prev,
      questions: {
        ...prev.questions,
        theory: prev.questions.theory.filter((_, i) => i !== index)
      }
    }));
  }, []);

  // Print preview handler
  const printPreview = useCallback(() => {
    if (!selectedExamForPrint) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateExamHTML(selectedExamForPrint));
      printWindow.document.close();
      printWindow.print();
    }
  }, [selectedExamForPrint]);

  // Modal accessibility: ESC to close, focus trap
  useEffect(() => {
    if (!showExamModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowExamModal(false);
        setEditingExam(null);
        resetExamForm();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    if (modalRef.current) {
      modalRef.current.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showExamModal, resetExamForm]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Exam Management</h2>
            <p className="text-gray-600">Create, edit, and manage exam papers</p>
          </div>
          <button
            onClick={() => setShowExamModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Exam
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredExams.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400 text-lg">
                  No exams found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredExams.map((exam) => (
                <tr key={exam.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      exam.level === 'nursery' ? 'bg-pink-100 text-pink-800' :
                        exam.level === 'primary' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                    }`}>
                      {exam.level.charAt(0).toUpperCase() + exam.level.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.teacher}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePrintExam(exam)}
                        className="text-green-600 hover:text-green-900"
                        title="Print Exam"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadExam(exam)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Download Exam"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditExam(exam)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit Exam"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto outline-none"
            ref={modalRef}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingExam ? 'Edit Exam' : 'Create New Exam'}</h3>
              <button
                onClick={() => {
                  setShowExamModal(false);
                  setEditingExam(null);
                  resetExamForm();
                }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close exam modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title</label>
                  <input
                    type="text"
                    value={newExam.title}
                    onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter exam title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={newExam.subject}
                    onChange={(e) => setNewExam({...newExam, subject: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.filter(s => s !== 'all').map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={newExam.class}
                    onChange={(e) => setNewExam({...newExam, class: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Class</option>
                    {classes.filter(c => c !== 'all').map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    value={newExam.level}
                    onChange={(e) => setNewExam({...newExam, level: e.target.value as Exam['level']})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="nursery">Nursery</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
                  <input
                    type="text"
                    value={newExam.teacher}
                    onChange={(e) => setNewExam({...newExam, teacher: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter teacher name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newExam.date}
                    onChange={(e) => setNewExam({...newExam, date: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={newExam.duration}
                    onChange={(e) => setNewExam({...newExam, duration: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1 Hour 30 Minutes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                  <input
                    type="number"
                    value={newExam.totalMarks}
                    onChange={(e) => setNewExam({...newExam, totalMarks: parseInt(e.target.value) || 0})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter total marks"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Exam Instructions</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Objectives Section Instructions</label>
                  <textarea
                    value={newExam.instructions.objectives}
                    onChange={(e) => setNewExam({...newExam, instructions: {...newExam.instructions, objectives: e.target.value}})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Enter instructions for the objectives section"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theory Section Instructions</label>
                  <textarea
                    value={newExam.instructions.theory}
                    onChange={(e) => setNewExam({...newExam, instructions: {...newExam.instructions, theory: e.target.value}})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Enter instructions for the theory section"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section C Instructions</label>
                  <textarea
                    value={newExam.instructions.sectionc}
                    onChange={(e) => setNewExam({...newExam, instructions: {...newExam.instructions, sectionc: e.target.value}})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Enter instructions for section C"
                  />
                </div>
              </div>

              {/* Objective Questions */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Objective Questions</h4>
                  <button
                    onClick={addObjectiveQuestion}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                  >
                    Add Objective Question
                  </button>
                </div>
                
                {newExam.questions.objectives.map((obj, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium">Question {index + 1}</h5>
                      <button
                        onClick={() => removeObjectiveQuestion(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Question</label>
                        <textarea
                          value={obj.question}
                          onChange={(e) => updateObjectiveQuestion(index, 'question', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Options</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={obj.options[0]}
                            onChange={(e) => updateObjectiveQuestion(index, 'options', [e.target.value, obj.options[1], obj.options[2], obj.options[3]])}
                            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Option A"
                          />
                          <input
                            type="text"
                            value={obj.options[1]}
                            onChange={(e) => updateObjectiveQuestion(index, 'options', [obj.options[0], e.target.value, obj.options[2], obj.options[3]])}
                            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Option B"
                          />
                          <input
                            type="text"
                            value={obj.options[2]}
                            onChange={(e) => updateObjectiveQuestion(index, 'options', [obj.options[0], obj.options[1], e.target.value, obj.options[3]])}
                            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Option C"
                          />
                          <input
                            type="text"
                            value={obj.options[3]}
                            onChange={(e) => updateObjectiveQuestion(index, 'options', [obj.options[0], obj.options[1], obj.options[2], e.target.value])}
                            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Option D"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Answer</label>
                        <select
                          value={obj.answer}
                          onChange={(e) => updateObjectiveQuestion(index, 'answer', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="a">Option A</option>
                          <option value="b">Option B</option>
                          <option value="c">Option C</option>
                          <option value="d">Option D</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Theory Questions */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Theory Questions</h4>
                  <button
                    onClick={addTheoryQuestion}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                  >
                    Add Theory Question
                  </button>
                </div>
                
                {newExam.questions.theory.map((theory, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium">Question {index + 1}</h5>
                      <button
                        onClick={() => removeTheoryQuestion(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Question</label>
                        <textarea
                          value={theory.question}
                          onChange={(e) => updateTheoryQuestion(index, 'question', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Marks</label>
                        <input
                          type="number"
                          value={theory.marks}
                          onChange={(e) => updateTheoryQuestion(index, 'marks', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter marks"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sub-Questions</label>
                        {theory.subQuestions.map((sub, subIndex) => (
                          <div key={subIndex} className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-700">Sub-Question {subIndex + 1}:</span>
                            <input
                              type="text"
                              value={sub}
                              onChange={(e) => updateSubQuestion(index, subIndex, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              onClick={() => removeSubQuestion(index, subIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addSubQuestion(index)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Add Sub-Question
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section C Questions */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Section C Questions</h4>
                  <button
                    onClick={() => setNewExam(prev => ({ ...prev, questions: { ...prev.questions, sectionc: [...(prev.questions.sectionc ?? []), { title: '', subtitle: '', text: '', questions: [] }] } }))}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                  >
                    Add Section C Passage
                  </button>
                </div>
                
                {(newExam.questions.sectionc ?? []).map((section, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium">Section {index + 1}</h5>
                      <button
                        onClick={() => setNewExam(prev => ({ ...prev, questions: { ...prev.questions, sectionc: (prev.questions.sectionc ?? []).filter((_, i) => i !== index) } }))}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => setNewExam(prev => ({ ...prev, questions: { ...prev.questions, sectionc: (prev.questions.sectionc ?? []).map((s, i) => i === index ? { ...s, title: e.target.value } : s) } }))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter section title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Subtitle (Optional)</label>
                        <input
                          type="text"
                          value={section.subtitle}
                          onChange={(e) => setNewExam(prev => ({ ...prev, questions: { ...prev.questions, sectionc: (prev.questions.sectionc ?? []).map((s, i) => i === index ? { ...s, subtitle: e.target.value } : s) } }))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter section subtitle"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Text</label>
                        <textarea
                          value={section.text}
                          onChange={(e) => setNewExam(prev => ({ ...prev, questions: { ...prev.questions, sectionc: (prev.questions.sectionc ?? []).map((s, i) => i === index ? { ...s, text: e.target.value } : s) } }))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Questions</label>
                        {(section.questions ?? []).map((q, qIndex) => (
                          <div key={qIndex} className="border border-gray-200 rounded-md p-3 mb-3">
                            <div className="flex justify-between items-start mb-2">
                              <h6 className="font-medium">Question {qIndex + 1}</h6>
                              <button
                                onClick={() => setNewExam(prev => ({ ...prev, questions: { ...prev.questions, sectionc: (prev.questions.sectionc ?? []).map((s, i) => i === index ? { ...s, questions: (s.questions ?? []).filter((_, j) => j !== qIndex) } : s) } }))}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Question Text</label>
                                <textarea
                                  value={q.question}
                                  onChange={(e) => setNewExam(prev => ({ ...prev, questions: { ...prev.questions, sectionc: (prev.questions.sectionc ?? []).map((s, i) => i === index ? { ...s, questions: (s.questions ?? []).map((qq, j) => j === qIndex ? { ...qq, question: e.target.value } : qq) } : s) } }))}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Marks</label>
                                <input
                                  type="number"
                                  value={q.marks}
                                  onChange={(e) => setNewExam(prev => ({ ...prev, questions: { ...prev.questions, sectionc: (prev.questions.sectionc ?? []).map((s, i) => i === index ? { ...s, questions: (s.questions ?? []).map((qq, j) => j === qIndex ? { ...qq, marks: parseInt(e.target.value) || 0 } : qq) } : s) } }))}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter marks"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => setNewExam(prev => ({ ...prev, questions: { ...prev.questions, sectionc: (prev.questions.sectionc ?? []).map((s, i) => i === index ? { ...s, questions: [...(s.questions ?? []), { question: '', marks: 5 }] } : s) } }))}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Add Question
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={resetExamForm}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateExam}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingExam ? 'Update Exam' : 'Create Exam'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintPreview && selectedExamForPrint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto outline-none"
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Print Preview: {selectedExamForPrint.title}</h3>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close print preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div dangerouslySetInnerHTML={{ __html: generateExamHTML(selectedExamForPrint) }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;