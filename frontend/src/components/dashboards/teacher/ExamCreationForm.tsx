// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '@/hooks/useAuth';
// import TeacherDashboardService from '@/services/TeacherDashboardService';
// import { ExamService, ExamCreateData } from '@/services/ExamService';
// import { toast } from 'react-toastify';
// import { X, Plus, Trash2, Save, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// interface ExamCreationFormProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onExamCreated: () => void;
//   editingExam?: any;
//   prefill?: Partial<ExamCreateData>;
// }

// const ExamCreationForm: React.FC<ExamCreationFormProps> = ({
//   isOpen,
//   onClose,
//   onExamCreated,
//   editingExam,
//   prefill
// }) => {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [savingDraft, setSavingDraft] = useState(false);
//   const [activeTab, setActiveTab] = useState<'basic' | 'questions'>('basic');
  
//   const [formData, setFormData] = useState<ExamCreateData>({
//     title: '',
//     subject: 0,
//     grade_level: 0,
//     exam_type: 'test',
//     difficulty_level: 'medium',
//     exam_date: '',
//     start_time: '',
//     end_time: '',
//     duration_minutes: 45,
//     total_marks: 100,
//     pass_marks: 50,
//     venue: '',
//     instructions: '',
//     status: 'scheduled', // Default to scheduled for teachers (matches backend choices)
//     is_practical: false,
//     requires_computer: false,
//     is_online: false,
//     objective_questions: [],
//     theory_questions: [],
//     practical_questions: [],
//     custom_sections: [],
//     objective_instructions: '',
//     theory_instructions: '',
//     practical_instructions: ''
//   });

//   const [objectiveQuestions, setObjectiveQuestions] = useState<any[]>([]);
//   const [theoryQuestions, setTheoryQuestions] = useState<any[]>([]);
//   const [practicalQuestions, setPracticalQuestions] = useState<any[]>([]);
//   const [customSections, setCustomSections] = useState<any[]>([]);
//   const [sectionOrder, setSectionOrder] = useState<Array<{ kind: 'objective' | 'theory' | 'practical' | 'custom'; id?: number }>>([]);
//   const [gradeLevels, setGradeLevels] = useState<any[]>([]);
//   const [subjects, setSubjects] = useState<any[]>([]);
//   const [objectiveInstructions, setObjectiveInstructions] = useState<string>('');
//   const [theoryInstructions, setTheoryInstructions] = useState<string>('');
//   const [practicalInstructions, setPracticalInstructions] = useState<string>('');
//   const [currentTeacherId, setCurrentTeacherId] = useState<number | null>(null);

//   // Helper function to generate proper question numbering
//   const getQuestionNumber = (questionIndex: number, subQuestionIndex?: number, subSubQuestionIndex?: number) => {
//     const baseNumber = questionIndex + 1;
    
//     if (subSubQuestionIndex !== undefined) {
//       // Sub-sub-question: 1ai, 1aii, etc.
//       return `${baseNumber}${String.fromCharCode(97 + (subQuestionIndex || 0))}${String.fromCharCode(105 + subSubQuestionIndex)}`;
//     } else if (subQuestionIndex !== undefined) {
//       // Sub-question: if main question has sub-questions, start from 'b', otherwise from 'a'
//       const question = theoryQuestions[questionIndex];
//       if (question && question.subQuestions && question.subQuestions.length > 0) {
//         // If main question has sub-questions, sub-questions start from 'b'
//         return `${baseNumber}${String.fromCharCode(98 + subQuestionIndex)}`;
//       } else {
//         // If no main question sub-questions, start from 'a'
//         return `${baseNumber}${String.fromCharCode(97 + subQuestionIndex)}`;
//       }
//     } else {
//       // Main question: check if it has sub-questions
//       const question = theoryQuestions[questionIndex];
//       if (question && question.subQuestions && question.subQuestions.length > 0) {
//         // If main question has sub-questions, it becomes 1a
//         return `${baseNumber}a`;
//       } else {
//         // If no sub-questions, just use the number
//         return `${baseNumber}.`;
//       }
//     }
//   };

//   useEffect(() => {
//     if (isOpen) {
//       loadTeacherData();
//     }
//   }, [isOpen]);

//   // Apply prefill when opening for create (not editing)
//   useEffect(() => {
//     if (isOpen && !editingExam && prefill) {
//       setFormData(prev => ({
//         ...prev,
//         ...prefill,
//         subject: prefill.subject ?? prev.subject,
//         grade_level: prefill.grade_level ?? prev.grade_level,
//       }));
//     }
//   }, [isOpen, editingExam, prefill]);

//   useEffect(() => {
//     if (editingExam) {
//       setFormData({
//         title: editingExam.title || '',
//         subject: editingExam.subject?.id || editingExam.subject || 0,
//         grade_level: editingExam.grade_level?.id || editingExam.grade_level || 0,
//         exam_type: editingExam.exam_type || 'test',
//         difficulty_level: editingExam.difficulty_level || 'medium',
//         exam_date: editingExam.exam_date || '',
//         start_time: editingExam.start_time || '',
//         end_time: editingExam.end_time || '',
//         duration_minutes: editingExam.duration_minutes || 45,
//         total_marks: editingExam.total_marks || 100,
//         pass_marks: editingExam.pass_marks || 50,
//         venue: editingExam.venue || '',
//         instructions: editingExam.instructions || '',
//         status: editingExam.status || 'scheduled',
//         is_practical: editingExam.is_practical || false,
//         requires_computer: editingExam.is_requires_computer || false,
//         is_online: editingExam.is_online || false,
//         objective_questions: editingExam.objective_questions || [],
//         theory_questions: editingExam.theory_questions || [],
//         practical_questions: editingExam.practical_questions || [],
//         custom_sections: editingExam.custom_sections || [],
//         objective_instructions: editingExam.objective_instructions || '',
//         theory_instructions: editingExam.theory_instructions || '',
//         practical_instructions: editingExam.practical_instructions || ''
//       });

//       // Load existing questions
//       setObjectiveQuestions(editingExam.objective_questions || []);
//       setTheoryQuestions(editingExam.theory_questions || []);
//       setPracticalQuestions(editingExam.practical_questions || []);
//       const existingCustom = editingExam.custom_sections || [];
//       setCustomSections(existingCustom);
//       setObjectiveInstructions(editingExam.objective_instructions || '');
//       setTheoryInstructions(editingExam.theory_instructions || '');
//       setPracticalInstructions(editingExam.practical_instructions || '');
//       const order: Array<{ kind: 'objective' | 'theory' | 'practical' | 'custom'; id?: number }> = [
//         { kind: 'objective' },
//         { kind: 'theory' },
//         { kind: 'practical' }
//       ];
//       for (const s of existingCustom) {
//         order.push({ kind: 'custom', id: s.id });
//       }
//       setSectionOrder(order);
//     }
//   }, [editingExam]);

//   useEffect(() => {
//     if (isOpen && !editingExam) {
//       setSectionOrder([
//         { kind: 'objective' },
//         { kind: 'theory' },
//         { kind: 'practical' }
//       ]);
//     }
//   }, [isOpen, editingExam]);

//   const loadTeacherData = async () => {
//     try {
//       const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
//       if (!teacherId) {
//         toast.error('Teacher ID not found');
//         return;
//       }
//       setCurrentTeacherId(Number(teacherId));

//       const assignments = await TeacherDashboardService.getTeacherClasses(teacherId);
//       console.log('🔍 Teacher assignments:', assignments);

//       // Extract unique grade levels and subjects with their IDs
//       const uniqueGradeLevels = Array.from(
//         new Map(assignments.map((a: any) => [a.grade_level_id, { id: a.grade_level_id, name: a.grade_level_name }])).values()
//       );
//       const uniqueSubjects = Array.from(
//         new Map(assignments.map((a: any) => [a.subject_id, { id: a.subject_id, name: a.subject_name }])).values()
//       );

//       console.log('🔍 Unique grade levels:', uniqueGradeLevels);
//       console.log('🔍 Unique subjects:', uniqueSubjects);

//       setGradeLevels(uniqueGradeLevels);
//       setSubjects(uniqueSubjects);
//     } catch (error) {
//       console.error('Error loading teacher data:', error);
//       toast.error('Failed to load teacher data');
//     }
//   };

//   const handleInputChange = (field: keyof ExamCreateData, value: any) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const addObjectiveQuestion = () => {
//     const newQuestion = {
//       id: Date.now(),
//       question: '',
//       optionA: '',
//       optionB: '',
//       optionC: '',
//       optionD: '',
//       correctAnswer: '',
//       marks: 1,
//       imageUrl: '',
//       imageAlt: ''
//     };
//     setObjectiveQuestions(prev => [...prev, newQuestion]);
//   };

//   const updateObjectiveQuestion = (index: number, field: string, value: string) => {
//     setObjectiveQuestions(prev => prev.map((q, i) => 
//       i === index ? { ...q, [field]: value } : q
//     ));
//   };

//   const removeObjectiveQuestion = (index: number) => {
//     setObjectiveQuestions(prev => prev.filter((_, i) => i !== index));
//   };

//   const addTheoryQuestion = () => {
//     const newQuestion = {
//       id: Date.now(),
//       question: '',
//       expectedPoints: '',
//       marks: 5,
//       wordLimit: '100-150',
//       imageUrl: '',
//       imageAlt: '',
//       subQuestions: [],
//       table: null as null | { rows: number; cols: number; data: string[][] }
//     };
//     setTheoryQuestions(prev => [...prev, newQuestion]);
//   };

//   const updateTheoryQuestion = (index: number, field: string, value: string | number) => {
//     setTheoryQuestions(prev => prev.map((q, i) => 
//       i === index ? { ...q, [field]: value } : q
//     ));
//   };

//   const removeTheoryQuestion = (index: number) => {
//     setTheoryQuestions(prev => prev.filter((_, i) => i !== index));
//   };

//   const addPracticalQuestion = () => {
//     const newQuestion = {
//       id: Date.now(),
//       task: '',
//       materials: '',
//       expectedOutcome: '',
//       marks: 10,
//       timeLimit: '30 minutes',
//       imageUrl: '',
//       imageAlt: ''
//     };
//     setPracticalQuestions(prev => [...prev, newQuestion]);
//   };

//   const updatePracticalQuestion = (index: number, field: string, value: string | number) => {
//     setPracticalQuestions(prev => prev.map((q, i) => 
//       i === index ? { ...q, [field]: value } : q
//     ));
//   };

//   const removePracticalQuestion = (index: number) => {
//     setPracticalQuestions(prev => prev.filter((_, i) => i !== index));
//   };

//   const addCustomSection = () => {
//     const newSection = {
//       id: Date.now(),
//       name: '',
//       instructions: '',
//       questions: [] as Array<{ id: number; question: string; marks: number; imageUrl?: string; imageAlt?: string; table?: { rows: number; cols: number; data: string[][] } }>
//     };
//     setCustomSections(prev => [...prev, newSection]);
//     setSectionOrder(prev => [...prev, { kind: 'custom', id: newSection.id }]);
//   };

//   // legacy helpers kept for compatibility if referenced in JSX in the future
//   // const updateCustomSection = (index: number, field: string, value: string) => {
//   //   setCustomSections(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
//   // };

//   // const removeCustomSection = (index: number) => {
//   //   const removed = customSections[index];
//   //   setCustomSections(prev => prev.filter((_, i) => i !== index));
//   //   if (removed) {
//   //     setSectionOrder(prev => prev.filter(item => !(item.kind === 'custom' && item.id === removed.id)));
//   //   }
//   // };

//   const insertCustomSectionAt = (position: number) => {
//     const newSection = {
//       id: Date.now(),
//       name: '',
//       instructions: '',
//       questions: []
//     };
//     setCustomSections(prev => [...prev, newSection]);
//     setSectionOrder(prev => {
//       const copy = [...prev];
//       copy.splice(position, 0, { kind: 'custom', id: newSection.id });
//       return copy;
//     });
//   };

//   const removeCustomSectionById = (sectionId: number) => {
//     setCustomSections(prev => prev.filter(s => s.id !== sectionId));
//     setSectionOrder(prev => prev.filter(item => !(item.kind === 'custom' && item.id === sectionId)));
//   };

//   // Using inline String.fromCharCode where needed; keep util for potential reuse
//   // const getSectionLabel = (index: number) => String.fromCharCode(65 + index);

//   const getOrderedCustomSections = () => {
//     const idToSection = new Map(customSections.map(s => [s.id, s] as const));
//     return sectionOrder.filter(s => s.kind === 'custom' && s.id).map(s => idToSection.get(s.id!)).filter(Boolean);
//   };

//   const calculateTotalMarks = () => {
//     const objectiveMarks = objectiveQuestions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);
//     const theoryMarks = theoryQuestions.reduce((sum: number, q: any) => {
//       const base = sum + (q.marks || 0);
//       const subQ = (q.subQuestions || []).reduce((ss: number, sq: any) => {
//         const baseSq = ss + (sq.marks || 0);
//         const subSub = (sq.subSubQuestions || []).reduce((sss: number, s2: any) => sss + (s2.marks || 0), 0);
//         return baseSq + subSub;
//       }, 0);
//       return base + subQ;
//     }, 0);
//     const practicalMarks = practicalQuestions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);
//     const customMarks = customSections.reduce((sum: number, s: any) =>
//       sum + (s.questions || []).reduce((qSum: number, q: any) => qSum + (q.marks || 0), 0), 0
//     );
//     return objectiveMarks + theoryMarks + practicalMarks + customMarks;
//   };

//   // Image upload helper (Cloudinary)
//   const uploadImage = async (file: File): Promise<string | null> => {
//     try {
//       const cloudinaryData = new FormData();
//       cloudinaryData.append('file', file);
//       cloudinaryData.append('upload_preset', 'profile_upload');
//       const res = await axios.post('https://api.cloudinary.com/v1_1/djbz7wunu/image/upload', cloudinaryData);
//       return res.data.secure_url as string;
//     } catch (err) {
//       toast.error('Image upload failed. Please try again.');
//       return null;
//     }
//   };

//   // Theory sub-question helpers
//   const addSubQuestion = (questionIndex: number) => {
//     const newSub = { id: Date.now(), question: '', marks: 0, subSubQuestions: [] as Array<{ id: number; question: string; marks: number }> };
//     setTheoryQuestions(prev => prev.map((q, i) => i === questionIndex ? { ...q, subQuestions: [ ...(q.subQuestions || []), newSub ] } : q));
//   };

//   const updateSubQuestion = (questionIndex: number, subIndex: number, field: string, value: any) => {
//     setTheoryQuestions(prev => prev.map((q, i) => {
//       if (i !== questionIndex) return q;
//       const copy = [ ...(q.subQuestions || []) ];
//       copy[subIndex] = { ...copy[subIndex], [field]: value };
//       return { ...q, subQuestions: copy };
//     }));
//   };

//   const removeSubQuestion = (questionIndex: number, subIndex: number) => {
//     setTheoryQuestions(prev => prev.map((q, i) => i === questionIndex ? { ...q, subQuestions: (q.subQuestions || []).filter((_: any, idx: number) => idx !== subIndex) } : q));
//   };

//   const addSubSubQuestion = (questionIndex: number, subIndex: number) => {
//     const newSubSub = { id: Date.now(), question: '', marks: 0 };
//     setTheoryQuestions(prev => prev.map((q, i) => {
//       if (i !== questionIndex) return q;
//       const subs = [ ...(q.subQuestions || []) ];
//       const target = subs[subIndex];
//       const updated = { ...target, subSubQuestions: [ ...(target.subSubQuestions || []), newSubSub ] };
//       subs[subIndex] = updated;
//       return { ...q, subQuestions: subs };
//     }));
//   };

//   const updateSubSubQuestion = (questionIndex: number, subIndex: number, subSubIndex: number, field: string, value: any) => {
//     setTheoryQuestions(prev => prev.map((q, i) => {
//       if (i !== questionIndex) return q;
//       const subs = [ ...(q.subQuestions || []) ];
//       const target = subs[subIndex];
//       const subsubs = [ ...(target.subSubQuestions || []) ];
//       subsubs[subSubIndex] = { ...subsubs[subSubIndex], [field]: value };
//       subs[subIndex] = { ...target, subSubQuestions: subsubs };
//       return { ...q, subQuestions: subs };
//     }));
//   };

//   const removeSubSubQuestion = (questionIndex: number, subIndex: number, subSubIndex: number) => {
//     setTheoryQuestions(prev => prev.map((q, i) => {
//       if (i !== questionIndex) return q;
//       const subs = [ ...(q.subQuestions || []) ];
//       const target = subs[subIndex];
//       const subsubs = (target.subSubQuestions || []).filter((_: any, idx: number) => idx !== subSubIndex);
//       subs[subIndex] = { ...target, subSubQuestions: subsubs };
//       return { ...q, subQuestions: subs };
//     }));
//   };

//   // Table helpers for theory/custom questions
//   const initQuestionTable = (_q: any, rows: number, cols: number) => ({ rows, cols, data: Array.from({ length: rows }, () => Array.from({ length: cols }, () => '')) });

//   const setTheoryTable = (index: number, rows: number, cols: number) => {
//     setTheoryQuestions(prev => prev.map((q, i) => i === index ? { ...q, table: initQuestionTable(q, rows, cols) } : q));
//   };

//   const updateTheoryTableCell = (qIndex: number, r: number, c: number, value: string) => {
//     setTheoryQuestions(prev => prev.map((q, i) => {
//       if (i !== qIndex) return q;
//       const table = q.table;
//       if (!table) return q;
//       const data = table.data.map((row: string[], ri: number) => row.map((cell, ci) => (ri === r && ci === c ? value : cell)));
//       return { ...q, table: { ...table, data } };
//     }));
//   };

//   const addTheoryTableRow = (qIndex: number) => {
//     setTheoryQuestions(prev => prev.map((q, i) => {
//       if (i !== qIndex || !q.table) return q;
//       const cols = q.table.cols;
//       const newRow = Array.from({ length: cols }, () => '');
//       return { ...q, table: { ...q.table, rows: q.table.rows + 1, data: [...q.table.data, newRow] } };
//     }));
//   };

//   const addTheoryTableCol = (qIndex: number) => {
//     setTheoryQuestions(prev => prev.map((q, i) => {
//       if (i !== qIndex || !q.table) return q;
//       const newData = q.table.data.map((row: string[]) => [...row, '']);
//       return { ...q, table: { ...q.table, cols: q.table.cols + 1, data: newData } };
//     }));
//   };

//   const removeTheoryTableRow = (qIndex: number, rowIndex?: number) => {
//     setTheoryQuestions(prev => prev.map((q, i) => {
//       if (i !== qIndex || !q.table || q.table.rows <= 1) return q;
//       const idx = rowIndex !== undefined ? rowIndex : q.table.rows - 1;
//       const newData = q.table.data.filter((_: any, r: number) => r !== idx);
//       return { ...q, table: { ...q.table, rows: q.table.rows - 1, data: newData } };
//     }));
//   };

//   const removeTheoryTableCol = (qIndex: number, colIndex?: number) => {
//     setTheoryQuestions(prev => prev.map((q, i) => {
//       if (i !== qIndex || !q.table || q.table.cols <= 1) return q;
//       const idx = colIndex !== undefined ? colIndex : q.table.cols - 1;
//       const newData = q.table.data.map((row: string[]) => row.filter((_: any, c: number) => c !== idx));
//       return { ...q, table: { ...q.table, cols: q.table.cols - 1, data: newData } };
//     }));
//   };

//   const setCustomTable = (sectionId: number, qIndex: number, rows: number, cols: number) => {
//     setCustomSections(prev => prev.map(s => {
//       if (s.id !== sectionId) return s;
//       const qs = [...(s.questions || [])];
//       const target = qs[qIndex];
//       qs[qIndex] = { ...target, table: initQuestionTable(target, rows, cols) };
//       return { ...s, questions: qs };
//     }));
//   };

//   const updateCustomTableCell = (sectionId: number, qIndex: number, r: number, c: number, value: string) => {
//     setCustomSections(prev => prev.map(s => {
//       if (s.id !== sectionId) return s;
//       const qs = [...(s.questions || [])];
//       const target = qs[qIndex];
//       const table = target.table;
//       if (!table) return s;
//       const data = table.data.map((row: string[], ri: number) => row.map((cell, ci) => (ri === r && ci === c ? value : cell)));
//       qs[qIndex] = { ...target, table: { ...table, data } };
//       return { ...s, questions: qs };
//     }));
//   };

//   const addCustomTableRow = (sectionId: number, qIndex: number) => {
//     setCustomSections(prev => prev.map(s => {
//       if (s.id !== sectionId) return s;
//       const qs = [...(s.questions || [])];
//       const q = qs[qIndex];
//       if (!q?.table) return s;
//       const cols = q.table.cols;
//       const newRow = Array.from({ length: cols }, () => '');
//       qs[qIndex] = { ...q, table: { ...q.table, rows: q.table.rows + 1, data: [...q.table.data, newRow] } };
//       return { ...s, questions: qs };
//     }));
//   };

//   const addCustomTableCol = (sectionId: number, qIndex: number) => {
//     setCustomSections(prev => prev.map(s => {
//       if (s.id !== sectionId) return s;
//       const qs = [...(s.questions || [])];
//       const q = qs[qIndex];
//       if (!q?.table) return s;
//       const newData = q.table.data.map((row: string[]) => [...row, '']);
//       qs[qIndex] = { ...q, table: { ...q.table, cols: q.table.cols + 1, data: newData } };
//       return { ...s, questions: qs };
//     }));
//   };

//   const removeCustomTableRow = (sectionId: number, qIndex: number, rowIndex?: number) => {
//     setCustomSections(prev => prev.map(s => {
//       if (s.id !== sectionId) return s;
//       const qs = [...(s.questions || [])];
//       const q = qs[qIndex];
//       if (!q?.table || q.table.rows <= 1) return s;
//       const idx = rowIndex !== undefined ? rowIndex : q.table.rows - 1;
//       const newData = q.table.data.filter((_: any, r: number) => r !== idx);
//       qs[qIndex] = { ...q, table: { ...q.table, rows: q.table.rows - 1, data: newData } };
//       return { ...s, questions: qs };
//     }));
//   };

//   const removeCustomTableCol = (sectionId: number, qIndex: number, colIndex?: number) => {
//     setCustomSections(prev => prev.map(s => {
//       if (s.id !== sectionId) return s;
//       const qs = [...(s.questions || [])];
//       const q = qs[qIndex];
//       if (!q?.table || q.table.cols <= 1) return s;
//       const idx = colIndex !== undefined ? colIndex : q.table.cols - 1;
//       const newData = q.table.data.map((row: string[]) => row.filter((_: any, c: number) => c !== idx));
//       qs[qIndex] = { ...q, table: { ...q.table, cols: q.table.cols - 1, data: newData } };
//       return { ...s, questions: qs };
//     }));
//   };

//   const validateForm = () => {
//     if (!formData.title.trim()) {
//       toast.error('Please enter exam title');
//       return false;
//     }
//     if (!formData.subject) {
//       toast.error('Please select a subject');
//       return false;
//     }
//     if (!formData.grade_level) {
//       toast.error('Please select a grade level');
//       return false;
//     }
//     if (!formData.exam_date) {
//       toast.error('Please select exam date');
//       return false;
//     }
//     if (!formData.start_time || !formData.end_time) {
//       toast.error('Please set start and end times');
//       return false;
//     }
//     if (objectiveQuestions.length === 0 && theoryQuestions.length === 0 && 
//         practicalQuestions.length === 0 && customSections.length === 0) {
//       toast.error('Please add at least one question');
//       return false;
//     }
//     return true;
//   };

//   const saveAsDraft = async () => {
//     if (!validateForm()) return;

//     try {
//       setSavingDraft(true);
      
//       const examData: ExamCreateData = {
//         ...formData,
//         status: 'scheduled', // Use 'scheduled' status for drafts (matches backend choices)
//         teacher: currentTeacherId && currentTeacherId > 0 ? currentTeacherId : undefined,
//         objective_questions: objectiveQuestions,
//         theory_questions: theoryQuestions,
//         practical_questions: practicalQuestions,
//         custom_sections: getOrderedCustomSections(),
//         objective_instructions: objectiveInstructions,
//         theory_instructions: theoryInstructions,
//         practical_instructions: practicalInstructions,
//         total_marks: calculateTotalMarks()
//       };

//       if (editingExam) {
//         await ExamService.updateExam(editingExam.id, examData);
//         toast.success('Exam updated successfully!');
//       } else {
//         await ExamService.createExam(examData);
//         toast.success('Exam saved successfully!');
//       }

//       onExamCreated();
//       onClose();
//     } catch (error) {
//       console.error('Error saving draft:', error);
//       toast.error('Failed to save draft. Please try again.');
//     } finally {
//       setSavingDraft(false);
//     }
//   };

//   const submitForApproval = async () => {
//     if (!validateForm()) return;

//     try {
//       setLoading(true);
      
//       const examData: ExamCreateData = {
//         ...formData,
//         status: 'scheduled', // Use 'scheduled' status for admin review (matches backend choices)
//         teacher: currentTeacherId && currentTeacherId > 0 ? currentTeacherId : undefined,
//         objective_questions: objectiveQuestions,
//         theory_questions: theoryQuestions,
//         practical_questions: practicalQuestions,
//         custom_sections: getOrderedCustomSections(),
//         objective_instructions: objectiveInstructions,
//         theory_instructions: theoryInstructions,
//         practical_instructions: practicalInstructions,
//         total_marks: calculateTotalMarks()
//       };

//       if (editingExam) {
//         await ExamService.updateExam(editingExam.id, examData);
//         toast.success('Exam submitted for review successfully!');
//       } else {
//         await ExamService.createExam(examData);
//         toast.success('Exam submitted for review successfully!');
//       }

//       onExamCreated();
//       onClose();
//     } catch (error) {
//       console.error('Error submitting exam:', error);
//       toast.error('Failed to submit exam. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     const statusConfig = {
//       scheduled: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Scheduled' },
//       in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'In Progress' },
//       completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
//       cancelled: { color: 'bg-red-100 text-red-800', icon: X, text: 'Cancelled' },
//       postponed: { color: 'bg-orange-100 text-orange-800', icon: Clock, text: 'Postponed' }
//     };

//     const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
//     const Icon = config.icon;

//     return (
//       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
//         <Icon className="w-3 h-3 mr-1" />
//         {config.text}
//       </span>
//     );
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
//           <div className="flex items-center space-x-3">
//             <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
//               {editingExam ? 'Edit Exam' : 'Create New Exam'}
//             </h2>
//             {editingExam && getStatusBadge(editingExam.status)}
//           </div>
//           <button
//             onClick={onClose}
//             className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Tabs */}
//         <div className="flex border-b border-slate-200 dark:border-slate-700">
//           <button
//             onClick={() => setActiveTab('basic')}
//             className={`px-6 py-3 text-sm font-medium ${
//               activeTab === 'basic'
//                 ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
//                 : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
//             }`}
//           >
//             Basic Information
//           </button>
//           <button
//             onClick={() => setActiveTab('questions')}
//             className={`px-6 py-3 text-sm font-medium ${
//               activeTab === 'questions'
//                 ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
//                 : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
//             }`}
//           >
//             Questions & Instructions
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {activeTab === 'basic' ? (
//             <div className="space-y-6">
//               {/* Basic Exam Information */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Exam Title *
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.title}
//                     onChange={(e) => handleInputChange('title', e.target.value)}
//                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//                     placeholder="Enter exam title"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Exam Type *
//                   </label>
//                   <select
//                     value={formData.exam_type}
//                     onChange={(e) => handleInputChange('exam_type', e.target.value)}
//                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//                   >
//                     <option value="test">Class Test</option>
//                     <option value="quiz">Quiz</option>
//                     <option value="mid_term">Mid-Term Examination</option>
//                     <option value="final_exam">Final Examination</option>
//                     <option value="practical">Practical Examination</option>
//                     <option value="oral_exam">Oral Examination</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Subject *
//                   </label>
//                   <select
//                     value={formData.subject}
//                     onChange={(e) => handleInputChange('subject', parseInt(e.target.value))}
//                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//                   >
//                     <option value={0}>Select Subject</option>
//                     {subjects.map((subject: any) => (
//                       <option key={subject.id} value={subject.id}>
//                         {subject.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Grade Level *
//                   </label>
//                   <select
//                     value={formData.grade_level}
//                     onChange={(e) => handleInputChange('grade_level', parseInt(e.target.value))}
//                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//                   >
//                     <option value={0}>Select Grade Level</option>
//                     {gradeLevels.map((gradeLevel: any) => (
//                       <option key={gradeLevel.id} value={gradeLevel.id}>
//                         {gradeLevel.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Difficulty Level
//                   </label>
//                   <select
//                     value={formData.difficulty_level}
//                     onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
//                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//                   >
//                     <option value="easy">Easy</option>
//                     <option value="medium">Medium</option>
//                     <option value="hard">Hard</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Duration (minutes)
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.duration_minutes}
//                     onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
//                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//                     min="15"
//                     max="300"
//                   />
//                 </div>
//               </div>

//               {/* Date and Time */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Exam Date *
//                   </label>
//                   <input
//                     type="date"
//                     value={formData.exam_date}
//                     onChange={(e) => handleInputChange('exam_date', e.target.value)}
//                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Start Time *
//                   </label>
//                   <input
//                     type="time"
//                     value={formData.start_time}
//                     onChange={(e) => handleInputChange('start_time', e.target.value)}
//                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     End Time *
//                   </label>
//                   <input
//                     type="time"
//                     value={formData.end_time}
//                     onChange={(e) => handleInputChange('end_time', e.target.value)}
//                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//                   />
//                 </div>
//               </div>

//               {/* Additional Settings */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Venue
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.venue}
//                     onChange={(e) => handleInputChange('venue', e.target.value)}
//                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//                     placeholder="e.g., Room 101, Computer Lab"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Instructions
//                   </label>
//                   <textarea
//                     value={formData.instructions}
//                     onChange={(e) => handleInputChange('instructions', e.target.value)}
//                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
//                     rows={3}
//                     placeholder="General instructions for students"
//                   />
//                 </div>
//               </div>

//               {/* Checkboxes */}
//               <div className="space-y-3">
//                 <label className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={formData.is_practical}
//                     onChange={(e) => handleInputChange('is_practical', e.target.checked)}
//                     className="mr-2"
//                   />
//                   <span className="text-sm text-slate-700 dark:text-slate-300">Practical Exam</span>
//                 </label>

//                 <label className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={formData.requires_computer}
//                     onChange={(e) => handleInputChange('requires_computer', e.target.checked)}
//                     className="mr-2"
//                   />
//                   <span className="text-sm text-slate-700 dark:text-slate-300">Requires Computer</span>
//                 </label>

//                 <label className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={formData.is_online}
//                     onChange={(e) => handleInputChange('is_online', e.target.checked)}
//                     className="mr-2"
//                   />
//                   <span className="text-sm text-slate-700 dark:text-slate-300">Online Exam</span>
//                 </label>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {/* Ordered sections with insert controls */}
//               <div className="space-y-6">
//                 {sectionOrder.map((section, orderIndex) => (
//                   <div key={`${section.kind}-${section.id ?? 'builtin'}`} className="border border-slate-200 dark:border-slate-600 rounded-lg">
//                     <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
//                       <div className="flex items-center space-x-3">
//                         <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Section {String.fromCharCode(65 + orderIndex)}:</span>
//                         <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
//                           {section.kind === 'objective' && 'Objective Questions'}
//                           {section.kind === 'theory' && 'Theory Questions'}
//                           {section.kind === 'practical' && 'Practical Questions'}
//                           {section.kind === 'custom' && (customSections.find(s => s.id === section.id)?.name || 'Custom Section')}
//                         </h3>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <button onClick={() => insertCustomSectionAt(orderIndex)} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600">Add Section Before</button>
//                         <button onClick={() => insertCustomSectionAt(orderIndex + 1)} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600">Add Section After</button>
//                         {section.kind === 'custom' && (
//                           <button onClick={() => section.id && removeCustomSectionById(section.id)} className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 dark:hover:bg-slate-700">Remove Section</button>
//                         )}
//                       </div>
//                     </div>

//                     <div className="p-4">
//                       {section.kind === 'objective' && (
//                         <div className="space-y-4">
//                           <div>
//                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Section Instructions (Objective)</label>
//                             <textarea value={objectiveInstructions} onChange={(e) => setObjectiveInstructions(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" rows={2} placeholder="Enter instructions for this section" />
//                           </div>
//                           <div className="flex items-center justify-between">
//                             <button onClick={addObjectiveQuestion} className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//                               <Plus className="w-4 h-4" />
//                               <span>Add Question</span>
//                             </button>
//                           </div>
//                           {objectiveQuestions.length > 0 && (
//                             <div className="space-y-4">
//                               {objectiveQuestions.map((question, index) => (
//                                 <div key={question.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
//                                   <div className="flex items-center justify-between mb-3">
//                                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Question {index + 1}</span>
//                                     <button onClick={() => removeObjectiveQuestion(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
//                                   </div>
//                                   <div className="space-y-3">
//                                     <input type="text" value={question.question} onChange={(e) => updateObjectiveQuestion(index, 'question', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Enter question" />
//                                     <div className="grid grid-cols-3 gap-3">
//                                       <input type="text" value={question.imageUrl || ''} onChange={(e) => updateObjectiveQuestion(index, 'imageUrl', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Image URL (optional)" />
//                                       <input type="text" value={question.imageAlt || ''} onChange={(e) => updateObjectiveQuestion(index, 'imageAlt', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Alt text" />
//                                       <label className="flex items-center justify-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer text-sm text-slate-700 dark:text-slate-300">
//                                         <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
//                                           const file = e.target.files && e.target.files[0];
//                                           if (!file) return;
//                                           const url = await uploadImage(file);
//                                           if (url) updateObjectiveQuestion(index, 'imageUrl', url);
//                                         }} />
//                                         Upload Image
//                                       </label>
//                                     </div>
//                                     <div className="grid grid-cols-2 gap-3">
//                                       <input type="text" value={question.optionA} onChange={(e) => updateObjectiveQuestion(index, 'optionA', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Option A" />
//                                       <input type="text" value={question.optionB} onChange={(e) => updateObjectiveQuestion(index, 'optionB', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Option B" />
//                                       <input type="text" value={question.optionC} onChange={(e) => updateObjectiveQuestion(index, 'optionC', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Option C" />
//                                       <input type="text" value={question.optionD} onChange={(e) => updateObjectiveQuestion(index, 'optionD', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Option D" />
//                                     </div>
//                                     <div className="grid grid-cols-2 gap-3">
//                                       <select value={question.correctAnswer} onChange={(e) => updateObjectiveQuestion(index, 'correctAnswer', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
//                                         <option value="">Select correct answer</option>
//                                         <option value="A">A</option>
//                                         <option value="B">B</option>
//                                         <option value="C">C</option>
//                                         <option value="D">D</option>
//                                       </select>
//                                       <input type="number" value={question.marks} onChange={(e) => updateObjectiveQuestion(index, 'marks', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Marks" min="1" />
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       )}

//                       {section.kind === 'theory' && (
//                         <div className="space-y-4">
//                           <div>
//                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Section Instructions (Theory)</label>
//                             <textarea value={theoryInstructions} onChange={(e) => setTheoryInstructions(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" rows={2} placeholder="Enter instructions for this section" />
//                           </div>
//                           <div className="flex items-center justify-between">
//                             <button onClick={addTheoryQuestion} className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
//                               <Plus className="w-4 h-4" />
//                               <span>Add Question</span>
//                             </button>
//                           </div>
//                           {theoryQuestions.length > 0 && (
//                             <div className="space-y-4">
//                               {theoryQuestions.map((question, index) => (
//                                 <div key={question.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
//                                   <div className="flex items-center justify-between mb-3">
//                                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Question {getQuestionNumber(index)}</span>
//                                     <button onClick={() => removeTheoryQuestion(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
//                                   </div>
//                                   <div className="space-y-3">
//                                     <textarea value={question.question} onChange={(e) => updateTheoryQuestion(index, 'question', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" rows={3} placeholder="Enter question" />
//                                     {/* Image attach (URL + upload) */}
//                                     <div className="grid grid-cols-3 gap-3">
//                                       <input type="text" value={question.imageUrl || ''} onChange={(e) => updateTheoryQuestion(index, 'imageUrl', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Image URL (optional)" />
//                                       <input type="text" value={question.imageAlt || ''} onChange={(e) => updateTheoryQuestion(index, 'imageAlt', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Alt text" />
//                                       <label className="flex items-center justify-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer text-sm text-slate-700 dark:text-slate-300">
//                                         <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
//                                           const file = e.target.files && e.target.files[0];
//                                           if (!file) return;
//                                           const url = await uploadImage(file);
//                                           if (url) updateTheoryQuestion(index, 'imageUrl', url);
//                                         }} />
//                                         Upload Image
//                                       </label>
//                                     </div>

//                                     <div className="grid grid-cols-3 gap-3">
//                                       <input type="text" value={question.expectedPoints} onChange={(e) => updateTheoryQuestion(index, 'expectedPoints', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Expected points" />
//                                       <input type="number" value={question.marks} onChange={(e) => updateTheoryQuestion(index, 'marks', parseInt(e.target.value))} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Marks" min="1" />
//                                       <input type="text" value={question.wordLimit} onChange={(e) => updateTheoryQuestion(index, 'wordLimit', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Word limit" />
//                                     </div>

//                                     {/* Table builder */}
//                                     <div className="space-y-2">
//                                       <div className="flex items-center space-x-2">
//                                         <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => setTheoryTable(index, 2, 2)}>Add 2x2 Table</button>
//                                         <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => setTheoryTable(index, 3, 3)}>Add 3x3 Table</button>
//                                         {question.table && (
//                                           <>
//                                             <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => addTheoryTableRow(index)}>+ Row</button>
//                                             <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => addTheoryTableCol(index)}>+ Col</button>
//                                             <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => removeTheoryTableRow(index)}>- Row</button>
//                                             <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => removeTheoryTableCol(index)}>- Col</button>
//                                           </>
//                                         )}
//                                       </div>
//                                       {question.table && (
//                                         <div className="overflow-auto">
//                                           <table className="min-w-[300px] border border-slate-300 dark:border-slate-600">
//                                             <tbody>
//                                               {question.table.data.map((row: string[], r: number) => (
//                                                 <tr key={r}>
//                                                   {row.map((cell: string, c: number) => (
//                                                     <td key={c} className="border border-slate-300 dark:border-slate-600 p-1">
//                                                       <input type="text" value={cell} onChange={(e) => updateTheoryTableCell(index, r, c, e.target.value)} className="w-full px-2 py-1 bg-transparent focus:outline-none" />
//                                                     </td>
//                                                   ))}
//                                                 </tr>
//                                               ))}
//                                             </tbody>
//                                           </table>
//                                         </div>
//                                       )}
//                                     </div>

//                                     {/* Sub-questions */}
//                                     <div className="space-y-2">
//                                       <div>
//                                         <button onClick={() => addSubQuestion(index)} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded">Add Sub-question</button>
//                                       </div>
//                                       {(question.subQuestions || []).map((sq: any, sqi: number) => (
//                                         <div key={sq.id} className="border border-slate-200 dark:border-slate-600 rounded p-2">
//                                           <div className="flex items-center justify-between">
//                                             <span className="text-sm">{getQuestionNumber(index, sqi)}</span>
//                                             <div className="space-x-2">
//                                               <button onClick={() => addSubSubQuestion(index, sqi)} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded">Add Sub-Sub</button>
//                                               <button onClick={() => removeSubQuestion(index, sqi)} className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded">Remove</button>
//                                             </div>
//                                           </div>
//                                           <div className="grid grid-cols-6 gap-2 mt-2">
//                                             <textarea value={sq.question} onChange={(e) => updateSubQuestion(index, sqi, 'question', e.target.value)} className="col-span-5 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded" rows={2} placeholder="Enter sub-question" />
//                                             <input type="number" value={sq.marks || 0} onChange={(e) => updateSubQuestion(index, sqi, 'marks', parseInt(e.target.value))} className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded" placeholder="Marks" />
//                                           </div>
//                                           {(sq.subSubQuestions || []).map((ssq: any, ssqi: number) => (
//                                             <div key={ssq.id} className="grid grid-cols-6 gap-2 mt-2">
//                                               <span className="text-sm col-span-1">{getQuestionNumber(index, sqi, ssqi)}</span>
//                                               <textarea value={ssq.question} onChange={(e) => updateSubSubQuestion(index, sqi, ssqi, 'question', e.target.value)} className="col-span-4 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded" rows={2} placeholder="Enter sub-sub-question" />
//                                               <input type="number" value={ssq.marks || 0} onChange={(e) => updateSubSubQuestion(index, sqi, ssqi, 'marks', parseInt(e.target.value))} className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded" placeholder="Marks" />
//                                               <button onClick={() => removeSubSubQuestion(index, sqi, ssqi)} className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded">Remove</button>
//                                             </div>
//                                           ))}
//                                         </div>
//                                       ))}
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       )}

//                       {section.kind === 'practical' && (
//                         <div className="space-y-4">
//                           <div>
//                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Section Instructions (Practical)</label>
//                             <textarea value={practicalInstructions} onChange={(e) => setPracticalInstructions(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" rows={2} placeholder="Enter instructions for this section" />
//                           </div>
//                           <div className="flex items-center justify-between">
//                             <button onClick={addPracticalQuestion} className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
//                               <Plus className="w-4 h-4" />
//                               <span>Add Question</span>
//                             </button>
//                           </div>
//                           {practicalQuestions.length > 0 && (
//                             <div className="space-y-4">
//                               {practicalQuestions.map((question, index) => (
//                                 <div key={question.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
//                                   <div className="flex items-center justify-between mb-3">
//                                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Question {index + 1}</span>
//                                     <button onClick={() => removePracticalQuestion(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
//                                   </div>
//                                   <div className="space-y-3">
//                                     <textarea value={question.task} onChange={(e) => updatePracticalQuestion(index, 'task', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" rows={2} placeholder="Task description" />
//                                     <div className="grid grid-cols-2 gap-3">
//                                       <input type="text" value={question.materials} onChange={(e) => updatePracticalQuestion(index, 'materials', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Required materials" />
//                                       <input type="text" value={question.expectedOutcome} onChange={(e) => updatePracticalQuestion(index, 'expectedOutcome', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Expected outcome" />
//                                     </div>
//                                     <div className="grid grid-cols-2 gap-3">
//                                       <input type="number" value={question.marks} onChange={(e) => updatePracticalQuestion(index, 'marks', parseInt(e.target.value))} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Marks" min="1" />
//                                       <input type="text" value={question.timeLimit} onChange={(e) => updatePracticalQuestion(index, 'timeLimit', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Time limit" />
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       )}

//                       {section.kind === 'custom' && (
//                         <div className="space-y-4">
//                           {(() => {
//                             const custom = customSections.find(s => s.id === section.id);
//                             if (!custom) return null;
//                             const updateCustomField = (field: string, value: any) => {
//                               setCustomSections(prev => prev.map(s => s.id === custom.id ? { ...s, [field]: value } : s));
//                             };
//                             const addQuestionToCustom = () => {
//                               const newQ = { id: Date.now(), question: '', marks: 1, imageUrl: '', imageAlt: '' };
//                               setCustomSections(prev => prev.map(s => s.id === custom.id ? { ...s, questions: [...(s.questions || []), newQ] } : s));
//                             };
//                             const updateCustomQuestion = (qIndex: number, field: string, value: any) => {
//                               setCustomSections(prev => prev.map(s => {
//                                 if (s.id !== custom.id) return s;
//                                 const qs = [...(s.questions || [])];
//                                 qs[qIndex] = { ...qs[qIndex], [field]: value };
//                                 return { ...s, questions: qs };
//                               }));
//                             };
//                             const removeCustomQuestion = (qIndex: number) => {
//                               setCustomSections(prev => prev.map(s => {
//                                 if (s.id !== custom.id) return s;
//                                 return { ...s, questions: (s.questions || []).filter((_: any, i: number) => i !== qIndex) };
//                               }));
//                             };
//                             return (
//                               <div className="space-y-4">
//                                 <div className="grid grid-cols-2 gap-3">
//                                   <input type="text" value={custom.name} onChange={(e) => updateCustomField('name', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Section name (e.g., Comprehension)" />
//                                   <input type="text" value={custom.instructions} onChange={(e) => updateCustomField('instructions', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Section instructions" />
//                                 </div>
//                                 <div className="flex items-center justify-between">
//                                   <button onClick={addQuestionToCustom} className="flex items-center space-x-2 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
//                                     <Plus className="w-4 h-4" />
//                                     <span>Add Question</span>
//                                   </button>
//                                 </div>
//                                 {(custom.questions || []).length > 0 && (
//                                   <div className="space-y-3">
//                                     {custom.questions.map((q: any, qi: number) => (
//                                       <div key={q.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3">
//                                         <div className="flex items-center justify-between mb-2">
//                                           <span className="text-sm text-slate-600 dark:text-slate-300">Question {qi + 1}</span>
//                                           <button onClick={() => removeCustomQuestion(qi)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
//                                         </div>
//                                         <div className="grid grid-cols-6 gap-3">
//                                           <textarea value={q.question} onChange={(e) => updateCustomQuestion(qi, 'question', e.target.value)} className="col-span-5 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" rows={2} placeholder="Enter question" />
//                                           <input type="number" value={q.marks} onChange={(e) => updateCustomQuestion(qi, 'marks', parseInt(e.target.value))} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Marks" min="0" />
//                                         </div>
//                                         <div className="grid grid-cols-3 gap-3 mt-2">
//                                           <input type="text" value={q.imageUrl || ''} onChange={(e) => updateCustomQuestion(qi, 'imageUrl', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Image URL (optional)" />
//                                           <input type="text" value={q.imageAlt || ''} onChange={(e) => updateCustomQuestion(qi, 'imageAlt', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Alt text" />
//                                           <label className="flex items-center justify-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer text-sm text-slate-700 dark:text-slate-300">
//                                             <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
//                                               const file = e.target.files && e.target.files[0];
//                                               if (!file) return;
//                                               const url = await uploadImage(file);
//                                               if (url) updateCustomQuestion(qi, 'imageUrl', url);
//                                             }} />
//                                             Upload Image
//                                           </label>
//                                         </div>
//                                         {/* Optional table for custom question */}
//                                         <div className="space-y-2 mt-2">
//                                           <div className="flex items-center space-x-2">
//                                             <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => setCustomTable(custom.id, qi, 2, 2)}>Add 2x2 Table</button>
//                                             <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => setCustomTable(custom.id, qi, 3, 3)}>Add 3x3 Table</button>
//                                             {q.table && (
//                                               <>
//                                                 <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => addCustomTableRow(custom.id, qi)}>+ Row</button>
//                                                 <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => addCustomTableCol(custom.id, qi)}>+ Col</button>
//                                                 <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => removeCustomTableRow(custom.id, qi)}>- Row</button>
//                                                 <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => removeCustomTableCol(custom.id, qi)}>- Col</button>
//                                               </>
//                                             )}
//                                           </div>
//                                           {q.table && (
//                                             <div className="overflow-auto">
//                                               <table className="min-w-[300px] border border-slate-300 dark:border-slate-600">
//                                                 <tbody>
//                                                   {q.table.data.map((row: string[], r: number) => (
//                                                     <tr key={r}>
//                                                       {row.map((cell: string, c: number) => (
//                                                         <td key={c} className="border border-slate-300 dark:border-slate-600 p-1">
//                                                           <input type="text" value={cell} onChange={(e) => updateCustomTableCell(custom.id, qi, r, c, e.target.value)} className="w-full px-2 py-1 bg-transparent focus:outline-none" />
//                                                         </td>
//                                                       ))}
//                                                     </tr>
//                                                   ))}
//                                                 </tbody>
//                                               </table>
//                                             </div>
//                                           )}
//                                         </div>
//                                       </div>
//                                     ))}
//                                   </div>
//                                 )}
//                               </div>
//                             );
//                           })()}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div>
//                 <button onClick={addCustomSection} className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600">
//                   <Plus className="w-4 h-4" />
//                   <span>Add Section at End</span>
//                 </button>
//               </div>

//               <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
//                 <div className="flex items-center justify-between">
//                   <span className="text-lg font-semibold text-slate-900 dark:text-white">Total Marks: {calculateTotalMarks()}</span>
//                   <span className="text-sm text-slate-600 dark:text-slate-400">Pass Marks: {formData.pass_marks || 0}</span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer Actions */}
//         <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
//           <div className="text-sm text-slate-600 dark:text-slate-400">
//             {editingExam ? 'Update exam details and save changes' : 'Fill in exam details and add questions to submit for admin review'}
//           </div>
          
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
//             >
//               Cancel
//             </button>
            
//                          <button
//                onClick={saveAsDraft}
//                disabled={savingDraft}
//                className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
//              >
//                <Save className="w-4 h-4" />
//                <span>{savingDraft ? 'Saving...' : 'Save Exam'}</span>
//              </button>
            
//                          <button
//                onClick={submitForApproval}
//                disabled={loading}
//                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//              >
//                <CheckCircle className="w-4 h-4" />
//                <span>{loading ? 'Submitting...' : 'Submit for Review'}</span>
//              </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExamCreationForm;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import TeacherDashboardService from '@/services/TeacherDashboardService';
import { ExamService, ExamCreateData } from '@/services/ExamService';
import { toast } from 'react-toastify';
import { X, Plus, Trash2, Save, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ExamCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onExamCreated: () => void;
  editingExam?: any;
  prefill?: Partial<ExamCreateData>;
}

const ExamCreationForm: React.FC<ExamCreationFormProps> = ({
  isOpen,
  onClose,
  onExamCreated,
  editingExam,
  prefill
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'questions'>('basic');
  
  const [formData, setFormData] = useState<ExamCreateData>({
    title: '',
    subject: 0,
    grade_level: 0,
    exam_type: 'test',
    difficulty_level: 'medium',
    exam_date: '',
    start_time: '',
    end_time: '',
    duration_minutes: 45,
    total_marks: 100,
    pass_marks: 50,
    venue: '',
    instructions: '',
    status: 'scheduled',
    is_practical: false,
    requires_computer: false,
    is_online: false,
    objective_questions: [],
    theory_questions: [],
    practical_questions: [],
    custom_sections: [],
    objective_instructions: '',
    theory_instructions: '',
    practical_instructions: ''
  });

  const [objectiveQuestions, setObjectiveQuestions] = useState<any[]>([]);
  const [theoryQuestions, setTheoryQuestions] = useState<any[]>([]);
  const [practicalQuestions, setPracticalQuestions] = useState<any[]>([]);
  const [customSections, setCustomSections] = useState<any[]>([]);
  const [sectionOrder, setSectionOrder] = useState<Array<{ kind: 'objective' | 'theory' | 'practical' | 'custom'; id?: number }>>([]);
  const [gradeLevels, setGradeLevels] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [objectiveInstructions, setObjectiveInstructions] = useState<string>('');
  const [theoryInstructions, setTheoryInstructions] = useState<string>('');
  const [practicalInstructions, setPracticalInstructions] = useState<string>('');
  const [currentTeacherId, setCurrentTeacherId] = useState<number | null>(null);

  const getQuestionNumber = (questionIndex: number, subQuestionIndex?: number, subSubQuestionIndex?: number) => {
    const baseNumber = questionIndex + 1;
    
    if (subSubQuestionIndex !== undefined) {
      return `${baseNumber}${String.fromCharCode(97 + (subQuestionIndex || 0))}${String.fromCharCode(105 + subSubQuestionIndex)}`;
    } else if (subQuestionIndex !== undefined) {
      const question = theoryQuestions[questionIndex];
      if (question && question.subQuestions && question.subQuestions.length > 0) {
        return `${baseNumber}${String.fromCharCode(98 + subQuestionIndex)}`;
      } else {
        return `${baseNumber}${String.fromCharCode(97 + subQuestionIndex)}`;
      }
    } else {
      const question = theoryQuestions[questionIndex];
      if (question && question.subQuestions && question.subQuestions.length > 0) {
        return `${baseNumber}a`;
      } else {
        return `${baseNumber}.`;
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTeacherData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !editingExam && prefill) {
      setFormData(prev => ({
        ...prev,
        ...prefill,
        subject: prefill.subject ?? prev.subject,
        grade_level: prefill.grade_level ?? prev.grade_level,
      }));
    }
  }, [isOpen, editingExam, prefill]);

  useEffect(() => {
    if (editingExam) {
      setFormData({
        title: editingExam.title || '',
        subject: editingExam.subject?.id || editingExam.subject || 0,
        grade_level: editingExam.grade_level?.id || editingExam.grade_level || 0,
        exam_type: editingExam.exam_type || 'test',
        difficulty_level: editingExam.difficulty_level || 'medium',
        exam_date: editingExam.exam_date || '',
        start_time: editingExam.start_time || '',
        end_time: editingExam.end_time || '',
        duration_minutes: editingExam.duration_minutes || 45,
        total_marks: editingExam.total_marks || 100,
        pass_marks: editingExam.pass_marks || 50,
        venue: editingExam.venue || '',
        instructions: editingExam.instructions || '',
        status: editingExam.status || 'scheduled',
        is_practical: editingExam.is_practical || false,
        requires_computer: editingExam.is_requires_computer || false,
        is_online: editingExam.is_online || false,
        objective_questions: editingExam.objective_questions || [],
        theory_questions: editingExam.theory_questions || [],
        practical_questions: editingExam.practical_questions || [],
        custom_sections: editingExam.custom_sections || [],
        objective_instructions: editingExam.objective_instructions || '',
        theory_instructions: editingExam.theory_instructions || '',
        practical_instructions: editingExam.practical_instructions || ''
      });

      setObjectiveQuestions(editingExam.objective_questions || []);
      setTheoryQuestions(editingExam.theory_questions || []);
      setPracticalQuestions(editingExam.practical_questions || []);
      const existingCustom = editingExam.custom_sections || [];
      setCustomSections(existingCustom);
      setObjectiveInstructions(editingExam.objective_instructions || '');
      setTheoryInstructions(editingExam.theory_instructions || '');
      setPracticalInstructions(editingExam.practical_instructions || '');
      const order: Array<{ kind: 'objective' | 'theory' | 'practical' | 'custom'; id?: number }> = [
        { kind: 'objective' },
        { kind: 'theory' },
        { kind: 'practical' }
      ];
      for (const s of existingCustom) {
        order.push({ kind: 'custom', id: s.id });
      }
      setSectionOrder(order);
    }
  }, [editingExam]);

  useEffect(() => {
    if (isOpen && !editingExam) {
      setSectionOrder([
        { kind: 'objective' },
        { kind: 'theory' },
        { kind: 'practical' }
      ]);
    }
  }, [isOpen, editingExam]);

  const loadTeacherData = async () => {
    try {
      const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
      console.log('🔍 Loaded Teacher ID:', teacherId);
      
      if (!teacherId) {
        toast.error('Teacher ID not found');
        return;
      }
      setCurrentTeacherId(Number(teacherId));

      const assignments = await TeacherDashboardService.getTeacherClasses(teacherId);
      console.log('🔍 Teacher assignments:', assignments);

      const uniqueGradeLevels = Array.from(
        new Map(assignments.map((a: any) => [a.grade_level_id, { id: a.grade_level_id, name: a.grade_level_name }])).values()
      );
      const uniqueSubjects = Array.from(
        new Map(assignments.map((a: any) => [a.subject_id, { id: a.subject_id, name: a.subject_name }])).values()
      );

      setGradeLevels(uniqueGradeLevels);
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error loading teacher data:', error);
      toast.error('Failed to load teacher data');
    }
  };

  const handleInputChange = (field: keyof ExamCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addObjectiveQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      marks: 1,
      imageUrl: '',
      imageAlt: ''
    };
    setObjectiveQuestions(prev => [...prev, newQuestion]);
  };

  const updateObjectiveQuestion = (index: number, field: string, value: string) => {
    setObjectiveQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const removeObjectiveQuestion = (index: number) => {
    setObjectiveQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const addTheoryQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      expectedPoints: '',
      marks: 5,
      wordLimit: '100-150',
      imageUrl: '',
      imageAlt: '',
      subQuestions: [],
      table: null as null | { rows: number; cols: number; data: string[][] }
    };
    setTheoryQuestions(prev => [...prev, newQuestion]);
  };

  const updateTheoryQuestion = (index: number, field: string, value: string | number) => {
    setTheoryQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const removeTheoryQuestion = (index: number) => {
    setTheoryQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const addPracticalQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      task: '',
      materials: '',
      expectedOutcome: '',
      marks: 10,
      timeLimit: '30 minutes',
      imageUrl: '',
      imageAlt: ''
    };
    setPracticalQuestions(prev => [...prev, newQuestion]);
  };

  const updatePracticalQuestion = (index: number, field: string, value: string | number) => {
    setPracticalQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const removePracticalQuestion = (index: number) => {
    setPracticalQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomSection = () => {
    const newSection = {
      id: Date.now(),
      name: '',
      instructions: '',
      questions: [] as Array<{ id: number; question: string; marks: number; imageUrl?: string; imageAlt?: string; table?: { rows: number; cols: number; data: string[][] } }>
    };
    setCustomSections(prev => [...prev, newSection]);
    setSectionOrder(prev => [...prev, { kind: 'custom', id: newSection.id }]);
  };

  const insertCustomSectionAt = (position: number) => {
    const newSection = {
      id: Date.now(),
      name: '',
      instructions: '',
      questions: []
    };
    setCustomSections(prev => [...prev, newSection]);
    setSectionOrder(prev => {
      const copy = [...prev];
      copy.splice(position, 0, { kind: 'custom', id: newSection.id });
      return copy;
    });
  };

  const removeCustomSectionById = (sectionId: number) => {
    setCustomSections(prev => prev.filter(s => s.id !== sectionId));
    setSectionOrder(prev => prev.filter(item => !(item.kind === 'custom' && item.id === sectionId)));
  };

  const getOrderedCustomSections = () => {
    const idToSection = new Map(customSections.map(s => [s.id, s] as const));
    return sectionOrder.filter(s => s.kind === 'custom' && s.id).map(s => idToSection.get(s.id!)).filter(Boolean);
  };

  const calculateTotalMarks = () => {
    const objectiveMarks = objectiveQuestions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);
    const theoryMarks = theoryQuestions.reduce((sum: number, q: any) => {
      const base = sum + (q.marks || 0);
      const subQ = (q.subQuestions || []).reduce((ss: number, sq: any) => {
        const baseSq = ss + (sq.marks || 0);
        const subSub = (sq.subSubQuestions || []).reduce((sss: number, s2: any) => sss + (s2.marks || 0), 0);
        return baseSq + subSub;
      }, 0);
      return base + subQ;
    }, 0);
    const practicalMarks = practicalQuestions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);
    const customMarks = customSections.reduce((sum: number, s: any) =>
      sum + (s.questions || []).reduce((qSum: number, q: any) => qSum + (q.marks || 0), 0), 0
    );
    return objectiveMarks + theoryMarks + practicalMarks + customMarks;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const cloudinaryData = new FormData();
      cloudinaryData.append('file', file);
      cloudinaryData.append('upload_preset', 'profile_upload');
      const res = await axios.post('https://api.cloudinary.com/v1_1/djbz7wunu/image/upload', cloudinaryData);
      return res.data.secure_url as string;
    } catch (err) {
      toast.error('Image upload failed. Please try again.');
      return null;
    }
  };

  const addSubQuestion = (questionIndex: number) => {
    const newSub = { id: Date.now(), question: '', marks: 0, subSubQuestions: [] as Array<{ id: number; question: string; marks: number }> };
    setTheoryQuestions(prev => prev.map((q, i) => i === questionIndex ? { ...q, subQuestions: [ ...(q.subQuestions || []), newSub ] } : q));
  };

  const updateSubQuestion = (questionIndex: number, subIndex: number, field: string, value: any) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q;
      const copy = [ ...(q.subQuestions || []) ];
      copy[subIndex] = { ...copy[subIndex], [field]: value };
      return { ...q, subQuestions: copy };
    }));
  };

  const removeSubQuestion = (questionIndex: number, subIndex: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => i === questionIndex ? { ...q, subQuestions: (q.subQuestions || []).filter((_: any, idx: number) => idx !== subIndex) } : q));
  };

  const addSubSubQuestion = (questionIndex: number, subIndex: number) => {
    const newSubSub = { id: Date.now(), question: '', marks: 0 };
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q;
      const subs = [ ...(q.subQuestions || []) ];
      const target = subs[subIndex];
      const updated = { ...target, subSubQuestions: [ ...(target.subSubQuestions || []), newSubSub ] };
      subs[subIndex] = updated;
      return { ...q, subQuestions: subs };
    }));
  };

  const updateSubSubQuestion = (questionIndex: number, subIndex: number, subSubIndex: number, field: string, value: any) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q;
      const subs = [ ...(q.subQuestions || []) ];
      const target = subs[subIndex];
      const subsubs = [ ...(target.subSubQuestions || []) ];
      subsubs[subSubIndex] = { ...subsubs[subSubIndex], [field]: value };
      subs[subIndex] = { ...target, subSubQuestions: subsubs };
      return { ...q, subQuestions: subs };
    }));
  };

  const removeSubSubQuestion = (questionIndex: number, subIndex: number, subSubIndex: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q;
      const subs = [ ...(q.subQuestions || []) ];
      const target = subs[subIndex];
      const subsubs = (target.subSubQuestions || []).filter((_: any, idx: number) => idx !== subSubIndex);
      subs[subIndex] = { ...target, subSubQuestions: subsubs };
      return { ...q, subQuestions: subs };
    }));
  };

  const initQuestionTable = (_q: any, rows: number, cols: number) => ({ rows, cols, data: Array.from({ length: rows }, () => Array.from({ length: cols }, () => '')) });

  const setTheoryTable = (index: number, rows: number, cols: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => i === index ? { ...q, table: initQuestionTable(q, rows, cols) } : q));
  };

  const updateTheoryTableCell = (qIndex: number, r: number, c: number, value: string) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const table = q.table;
      if (!table) return q;
      const data = table.data.map((row: string[], ri: number) => row.map((cell, ci) => (ri === r && ci === c ? value : cell)));
      return { ...q, table: { ...table, data } };
    }));
  };

  const addTheoryTableRow = (qIndex: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex || !q.table) return q;
      const cols = q.table.cols;
      const newRow = Array.from({ length: cols }, () => '');
      return { ...q, table: { ...q.table, rows: q.table.rows + 1, data: [...q.table.data, newRow] } };
    }));
  };

  const addTheoryTableCol = (qIndex: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex || !q.table) return q;
      const newData = q.table.data.map((row: string[]) => [...row, '']);
      return { ...q, table: { ...q.table, cols: q.table.cols + 1, data: newData } };
    }));
  };

  const removeTheoryTableRow = (qIndex: number, rowIndex?: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex || !q.table || q.table.rows <= 1) return q;
      const idx = rowIndex !== undefined ? rowIndex : q.table.rows - 1;
      const newData = q.table.data.filter((_: any, r: number) => r !== idx);
      return { ...q, table: { ...q.table, rows: q.table.rows - 1, data: newData } };
    }));
  };

  const removeTheoryTableCol = (qIndex: number, colIndex?: number) => {
    setTheoryQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex || !q.table || q.table.cols <= 1) return q;
      const idx = colIndex !== undefined ? colIndex : q.table.cols - 1;
      const newData = q.table.data.map((row: string[]) => row.filter((_: any, c: number) => c !== idx));
      return { ...q, table: { ...q.table, cols: q.table.cols - 1, data: newData } };
    }));
  };

  const setCustomTable = (sectionId: number, qIndex: number, rows: number, cols: number) => {
    setCustomSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const qs = [...(s.questions || [])];
      const target = qs[qIndex];
      qs[qIndex] = { ...target, table: initQuestionTable(target, rows, cols) };
      return { ...s, questions: qs };
    }));
  };

  const updateCustomTableCell = (sectionId: number, qIndex: number, r: number, c: number, value: string) => {
    setCustomSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const qs = [...(s.questions || [])];
      const target = qs[qIndex];
      const table = target.table;
      if (!table) return s;
      const data = table.data.map((row: string[], ri: number) => row.map((cell, ci) => (ri === r && ci === c ? value : cell)));
      qs[qIndex] = { ...target, table: { ...table, data } };
      return { ...s, questions: qs };
    }));
  };

  const addCustomTableRow = (sectionId: number, qIndex: number) => {
    setCustomSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const qs = [...(s.questions || [])];
      const q = qs[qIndex];
      if (!q?.table) return s;
      const cols = q.table.cols;
      const newRow = Array.from({ length: cols }, () => '');
      qs[qIndex] = { ...q, table: { ...q.table, rows: q.table.rows + 1, data: [...q.table.data, newRow] } };
      return { ...s, questions: qs };
    }));
  };

  const addCustomTableCol = (sectionId: number, qIndex: number) => {
    setCustomSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const qs = [...(s.questions || [])];
      const q = qs[qIndex];
      if (!q?.table) return s;
      const newData = q.table.data.map((row: string[]) => [...row, '']);
      qs[qIndex] = { ...q, table: { ...q.table, cols: q.table.cols + 1, data: newData } };
      return { ...s, questions: qs };
    }));
  };

  const removeCustomTableRow = (sectionId: number, qIndex: number, rowIndex?: number) => {
    setCustomSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const qs = [...(s.questions || [])];
      const q = qs[qIndex];
      if (!q?.table || q.table.rows <= 1) return s;
      const idx = rowIndex !== undefined ? rowIndex : q.table.rows - 1;
      const newData = q.table.data.filter((_: any, r: number) => r !== idx);
      qs[qIndex] = { ...q, table: { ...q.table, rows: q.table.rows - 1, data: newData } };
      return { ...s, questions: qs };
    }));
  };

  const removeCustomTableCol = (sectionId: number, qIndex: number, colIndex?: number) => {
    setCustomSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const qs = [...(s.questions || [])];
      const q = qs[qIndex];
      if (!q?.table || q.table.cols <= 1) return s;
      const idx = colIndex !== undefined ? colIndex : q.table.cols - 1;
      const newData = q.table.data.map((row: string[]) => row.filter((_: any, c: number) => c !== idx));
      qs[qIndex] = { ...q, table: { ...q.table, cols: q.table.cols - 1, data: newData } };
      return { ...s, questions: qs };
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter exam title');
      return false;
    }
    if (!formData.subject) {
      toast.error('Please select a subject');
      return false;
    }
    if (!formData.grade_level) {
      toast.error('Please select a grade level');
      return false;
    }
    if (!formData.exam_date) {
      toast.error('Please select exam date');
      return false;
    }
    if (!formData.start_time || !formData.end_time) {
      toast.error('Please set start and end times');
      return false;
    }
    if (objectiveQuestions.length === 0 && theoryQuestions.length === 0 && 
        practicalQuestions.length === 0 && customSections.length === 0) {
      toast.error('Please add at least one question');
      return false;
    }
    
    if (!currentTeacherId || currentTeacherId <= 0) {
      toast.error('Teacher ID not found. Please refresh and try again.');
      return false;
    }
    
    return true;
  };

  const saveAsDraft = async () => {
    if (!validateForm()) return;

    try {
      setSavingDraft(true);
      
      const examData: ExamCreateData = {
        ...formData,
        status: 'scheduled',
        teacher: currentTeacherId!,
        objective_questions: objectiveQuestions,
        theory_questions: theoryQuestions,
        practical_questions: practicalQuestions,
        custom_sections: getOrderedCustomSections(),
        objective_instructions: objectiveInstructions,
        theory_instructions: theoryInstructions,
        practical_instructions: practicalInstructions,
        total_marks: calculateTotalMarks()
      };

      console.log('🔍 Saving exam with data:', {
        teacher: examData.teacher,
        title: examData.title,
        subject: examData.subject,
        grade_level: examData.grade_level
      });

      if (editingExam) {
        await ExamService.updateExam(editingExam.id, examData);
        toast.success('Exam updated successfully!');
      } else {
        const response = await ExamService.createExam(examData);
        console.log('🔍 Exam created successfully:', response);
        toast.success('Exam saved successfully!');
      }

      onExamCreated();
      onClose();
    } catch (error) {
      console.error('❌ Error saving exam:', error);
      toast.error('Failed to save exam. Please try again.');
    } finally {
      setSavingDraft(false);
    }
  };

  const submitForApproval = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const examData: ExamCreateData = {
        ...formData,
        status: 'scheduled',
        teacher: currentTeacherId!,
        objective_questions: objectiveQuestions,
        theory_questions: theoryQuestions,
        practical_questions: practicalQuestions,
        custom_sections: getOrderedCustomSections(),
        objective_instructions: objectiveInstructions,
        theory_instructions: theoryInstructions,
        practical_instructions: practicalInstructions,
        total_marks: calculateTotalMarks()
      };

      console.log('🔍 Submitting exam for approval with data:', {
        teacher: examData.teacher,
        title: examData.title,
        subject: examData.subject,
        grade_level: examData.grade_level
      });

      if (editingExam) {
        await ExamService.updateExam(editingExam.id, examData);
        toast.success('Exam submitted for review successfully!');
      } else {
        const response = await ExamService.createExam(examData);
        console.log('🔍 Exam created and submitted successfully:', response);
        toast.success('Exam submitted for review successfully!');
      }

      onExamCreated();
      onClose();
    } catch (error) {
      console.error('❌ Error submitting exam:', error);
      toast.error('Failed to submit exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Scheduled' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X, text: 'Cancelled' },
      postponed: { color: 'bg-orange-100 text-orange-800', icon: Clock, text: 'Postponed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {editingExam ? 'Edit Exam' : 'Create New Exam'}
            </h2>
            {editingExam && getStatusBadge(editingExam.status)}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {currentTeacherId && (
          <div className="px-6 pt-2 text-xs text-slate-500">
            Teacher ID: {currentTeacherId}
          </div>
        )}

        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'basic'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Basic Information
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'questions'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Questions & Instructions
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'basic' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    placeholder="Enter exam title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Exam Type *
                  </label>
                  <select
                    value={formData.exam_type}
                    onChange={(e) => handleInputChange('exam_type', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="test">Class Test</option>
                    <option value="quiz">Quiz</option>
                    <option value="mid_term">Mid-Term Examination</option>
                    <option value="final_exam">Final Examination</option>
                    <option value="practical">Practical Examination</option>
                    <option value="oral_exam">Oral Examination</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value={0}>Select Subject</option>
                    {subjects.map((subject: any) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Grade Level *
                  </label>
                  <select
                    value={formData.grade_level}
                    onChange={(e) => handleInputChange('grade_level', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value={0}>Select Grade Level</option>
                    {gradeLevels.map((gradeLevel: any) => (
                      <option key={gradeLevel.id} value={gradeLevel.id}>
                        {gradeLevel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    min="15"
                    max="300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) => handleInputChange('exam_date', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    placeholder="e.g., Room 101, Computer Lab"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    rows={3}
                    placeholder="General instructions for students"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_practical}
                    onChange={(e) => handleInputChange('is_practical', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Practical Exam</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requires_computer}
                    onChange={(e) => handleInputChange('requires_computer', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Requires Computer</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_online}
                    onChange={(e) => handleInputChange('is_online', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Online Exam</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {sectionOrder.map((section, orderIndex) => (
                <div key={`${section.kind}-${section.id ?? 'builtin'}`} className="border border-slate-200 dark:border-slate-600 rounded-lg">
                  <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Section {String.fromCharCode(65 + orderIndex)}:</span>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {section.kind === 'objective' && 'Objective Questions'}
                        {section.kind === 'theory' && 'Theory Questions'}
                        {section.kind === 'practical' && 'Practical Questions'}
                        {section.kind === 'custom' && (customSections.find(s => s.id === section.id)?.name || 'Custom Section')}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => insertCustomSectionAt(orderIndex)} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600">Add Section Before</button>
                      <button onClick={() => insertCustomSectionAt(orderIndex + 1)} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600">Add Section After</button>
                      {section.kind === 'custom' && (
                        <button onClick={() => section.id && removeCustomSectionById(section.id)} className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 dark:hover:bg-slate-700">Remove Section</button>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    {section.kind === 'objective' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Section Instructions (Objective)</label>
                          <textarea value={objectiveInstructions} onChange={(e) => setObjectiveInstructions(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" rows={2} placeholder="Enter instructions for this section" />
                        </div>
                        <div className="flex items-center justify-between">
                          <button onClick={addObjectiveQuestion} className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Plus className="w-4 h-4" />
                            <span>Add Question</span>
                          </button>
                        </div>
                        {objectiveQuestions.length > 0 && (
                          <div className="space-y-4">
                            {objectiveQuestions.map((question, index) => (
                              <div key={question.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Question {index + 1}</span>
                                  <button onClick={() => removeObjectiveQuestion(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="space-y-3">
                                  <input type="text" value={question.question} onChange={(e) => updateObjectiveQuestion(index, 'question', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Enter question" />
                                  <div className="grid grid-cols-3 gap-3">
                                    <input type="text" value={question.imageUrl || ''} onChange={(e) => updateObjectiveQuestion(index, 'imageUrl', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Image URL (optional)" />
                                    <input type="text" value={question.imageAlt || ''} onChange={(e) => updateObjectiveQuestion(index, 'imageAlt', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Alt text" />
                                    <label className="flex items-center justify-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                        const file = e.target.files && e.target.files[0];
                                        if (!file) return;
                                        const url = await uploadImage(file);
                                        if (url) updateObjectiveQuestion(index, 'imageUrl', url);
                                      }} />
                                      Upload Image
                                    </label>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <input type="text" value={question.optionA} onChange={(e) => updateObjectiveQuestion(index, 'optionA', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Option A" />
                                    <input type="text" value={question.optionB} onChange={(e) => updateObjectiveQuestion(index, 'optionB', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Option B" />
                                    <input type="text" value={question.optionC} onChange={(e) => updateObjectiveQuestion(index, 'optionC', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Option C" />
                                    <input type="text" value={question.optionD} onChange={(e) => updateObjectiveQuestion(index, 'optionD', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Option D" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <select value={question.correctAnswer} onChange={(e) => updateObjectiveQuestion(index, 'correctAnswer', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                                      <option value="">Select correct answer</option>
                                      <option value="A">A</option>
                                      <option value="B">B</option>
                                      <option value="C">C</option>
                                      <option value="D">D</option>
                                    </select>
                                    <input type="number" value={question.marks} onChange={(e) => updateObjectiveQuestion(index, 'marks', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Marks" min="1" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {section.kind === 'theory' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Section Instructions (Theory)</label>
                          <textarea value={theoryInstructions} onChange={(e) => setTheoryInstructions(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" rows={2} placeholder="Enter instructions for this section" />
                        </div>
                        <div className="flex items-center justify-between">
                          <button onClick={addTheoryQuestion} className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <Plus className="w-4 h-4" />
                            <span>Add Question</span>
                          </button>
                        </div>
                        {theoryQuestions.length > 0 && (
                          <div className="space-y-4">
                            {theoryQuestions.map((question, index) => (
                              <div key={question.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Question {getQuestionNumber(index)}</span>
                                  <button onClick={() => removeTheoryQuestion(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="space-y-3">
                                  <textarea value={question.question} onChange={(e) => updateTheoryQuestion(index, 'question', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" rows={3} placeholder="Enter question" />
                                  <div className="grid grid-cols-3 gap-3">
                                    <input type="text" value={question.imageUrl || ''} onChange={(e) => updateTheoryQuestion(index, 'imageUrl', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Image URL (optional)" />
                                    <input type="text" value={question.imageAlt || ''} onChange={(e) => updateTheoryQuestion(index, 'imageAlt', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Alt text" />
                                    <label className="flex items-center justify-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                        const file = e.target.files && e.target.files[0];
                                        if (!file) return;
                                        const url = await uploadImage(file);
                                        if (url) updateTheoryQuestion(index, 'imageUrl', url);
                                      }} />
                                      Upload Image
                                    </label>
                                  </div>

                                  <div className="grid grid-cols-3 gap-3">
                                    <input type="text" value={question.expectedPoints} onChange={(e) => updateTheoryQuestion(index, 'expectedPoints', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Expected points" />
                                    <input type="number" value={question.marks} onChange={(e) => updateTheoryQuestion(index, 'marks', parseInt(e.target.value))} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Marks" min="1" />
                                    <input type="text" value={question.wordLimit} onChange={(e) => updateTheoryQuestion(index, 'wordLimit', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Word limit" />
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => setTheoryTable(index, 2, 2)}>Add 2x2 Table</button>
                                      <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => setTheoryTable(index, 3, 3)}>Add 3x3 Table</button>
                                      {question.table && (
                                        <>
                                          <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => addTheoryTableRow(index)}>+ Row</button>
                                          <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => addTheoryTableCol(index)}>+ Col</button>
                                          <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => removeTheoryTableRow(index)}>- Row</button>
                                          <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => removeTheoryTableCol(index)}>- Col</button>
                                        </>
                                      )}
                                    </div>
                                    {question.table && (
                                      <div className="overflow-auto">
                                        <table className="min-w-[300px] border border-slate-300 dark:border-slate-600">
                                          <tbody>
                                            {question.table.data.map((row: string[], r: number) => (
                                              <tr key={r}>
                                                {row.map((cell: string, c: number) => (
                                                  <td key={c} className="border border-slate-300 dark:border-slate-600 p-1">
                                                    <input type="text" value={cell} onChange={(e) => updateTheoryTableCell(index, r, c, e.target.value)} className="w-full px-2 py-1 bg-transparent focus:outline-none" />
                                                  </td>
                                                ))}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <div>
                                      <button onClick={() => addSubQuestion(index)} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded">Add Sub-question</button>
                                    </div>
                                    {(question.subQuestions || []).map((sq: any, sqi: number) => (
                                      <div key={sq.id} className="border border-slate-200 dark:border-slate-600 rounded p-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm">{getQuestionNumber(index, sqi)}</span>
                                          <div className="space-x-2">
                                            <button onClick={() => addSubSubQuestion(index, sqi)} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded">Add Sub-Sub</button>
                                            <button onClick={() => removeSubQuestion(index, sqi)} className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded">Remove</button>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-6 gap-2 mt-2">
                                          <textarea value={sq.question} onChange={(e) => updateSubQuestion(index, sqi, 'question', e.target.value)} className="col-span-5 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded" rows={2} placeholder="Enter sub-question" />
                                          <input type="number" value={sq.marks || 0} onChange={(e) => updateSubQuestion(index, sqi, 'marks', parseInt(e.target.value))} className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded" placeholder="Marks" />
                                        </div>
                                        {(sq.subSubQuestions || []).map((ssq: any, ssqi: number) => (
                                          <div key={ssq.id} className="grid grid-cols-6 gap-2 mt-2">
                                            <span className="text-sm col-span-1">{getQuestionNumber(index, sqi, ssqi)}</span>
                                            <textarea value={ssq.question} onChange={(e) => updateSubSubQuestion(index, sqi, ssqi, 'question', e.target.value)} className="col-span-4 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded" rows={2} placeholder="Enter sub-sub-question" />
                                            <input type="number" value={ssq.marks || 0} onChange={(e) => updateSubSubQuestion(index, sqi, ssqi, 'marks', parseInt(e.target.value))} className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded" placeholder="Marks" />
                                            <button onClick={() => removeSubSubQuestion(index, sqi, ssqi)} className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded">Remove</button>
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {section.kind === 'practical' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Section Instructions (Practical)</label>
                          <textarea value={practicalInstructions} onChange={(e) => setPracticalInstructions(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" rows={2} placeholder="Enter instructions for this section" />
                        </div>
                        <div className="flex items-center justify-between">
                          <button onClick={addPracticalQuestion} className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <Plus className="w-4 h-4" />
                            <span>Add Question</span>
                          </button>
                        </div>
                        {practicalQuestions.length > 0 && (
                          <div className="space-y-4">
                            {practicalQuestions.map((question, index) => (
                              <div key={question.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Question {index + 1}</span>
                                  <button onClick={() => removePracticalQuestion(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="space-y-3">
                                  <textarea value={question.task} onChange={(e) => updatePracticalQuestion(index, 'task', e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" rows={2} placeholder="Task description" />
                                  <div className="grid grid-cols-2 gap-3">
                                    <input type="text" value={question.materials} onChange={(e) => updatePracticalQuestion(index, 'materials', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Required materials" />
                                    <input type="text" value={question.expectedOutcome} onChange={(e) => updatePracticalQuestion(index, 'expectedOutcome', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Expected outcome" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <input type="number" value={question.marks} onChange={(e) => updatePracticalQuestion(index, 'marks', parseInt(e.target.value))} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Marks" min="1" />
                                    <input type="text" value={question.timeLimit} onChange={(e) => updatePracticalQuestion(index, 'timeLimit', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Time limit" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {section.kind === 'custom' && (
                      <div className="space-y-4">
                        {(() => {
                          const custom = customSections.find(s => s.id === section.id);
                          if (!custom) return null;
                          const updateCustomField = (field: string, value: any) => {
                            setCustomSections(prev => prev.map(s => s.id === custom.id ? { ...s, [field]: value } : s));
                          };
                          const addQuestionToCustom = () => {
                            const newQ = { id: Date.now(), question: '', marks: 1, imageUrl: '', imageAlt: '' };
                            setCustomSections(prev => prev.map(s => s.id === custom.id ? { ...s, questions: [...(s.questions || []), newQ] } : s));
                          };
                          const updateCustomQuestion = (qIndex: number, field: string, value: any) => {
                            setCustomSections(prev => prev.map(s => {
                              if (s.id !== custom.id) return s;
                              const qs = [...(s.questions || [])];
                              qs[qIndex] = { ...qs[qIndex], [field]: value };
                              return { ...s, questions: qs };
                            }));
                          };
                          const removeCustomQuestion = (qIndex: number) => {
                            setCustomSections(prev => prev.map(s => {
                              if (s.id !== custom.id) return s;
                              return { ...s, questions: (s.questions || []).filter((_: any, i: number) => i !== qIndex) };
                            }));
                          };
                          return (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <input type="text" value={custom.name} onChange={(e) => updateCustomField('name', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Section name (e.g., Comprehension)" />
                                <input type="text" value={custom.instructions} onChange={(e) => updateCustomField('instructions', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Section instructions" />
                              </div>
                              <div className="flex items-center justify-between">
                                <button onClick={addQuestionToCustom} className="flex items-center space-x-2 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                                  <Plus className="w-4 h-4" />
                                  <span>Add Question</span>
                                </button>
                              </div>
                              {(custom.questions || []).length > 0 && (
                                <div className="space-y-3">
                                  {custom.questions.map((q: any, qi: number) => (
                                    <div key={q.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-600 dark:text-slate-300">Question {qi + 1}</span>
                                        <button onClick={() => removeCustomQuestion(qi)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                      </div>
                                      <div className="grid grid-cols-6 gap-3">
                                        <textarea value={q.question} onChange={(e) => updateCustomQuestion(qi, 'question', e.target.value)} className="col-span-5 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" rows={2} placeholder="Enter question" />
                                        <input type="number" value={q.marks} onChange={(e) => updateCustomQuestion(qi, 'marks', parseInt(e.target.value))} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Marks" min="0" />
                                      </div>
                                      <div className="grid grid-cols-3 gap-3 mt-2">
                                        <input type="text" value={q.imageUrl || ''} onChange={(e) => updateCustomQuestion(qi, 'imageUrl', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Image URL (optional)" />
                                        <input type="text" value={q.imageAlt || ''} onChange={(e) => updateCustomQuestion(qi, 'imageAlt', e.target.value)} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Alt text" />
                                        <label className="flex items-center justify-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                            const file = e.target.files && e.target.files[0];
                                            if (!file) return;
                                            const url = await uploadImage(file);
                                            if (url) updateCustomQuestion(qi, 'imageUrl', url);
                                          }} />
                                          Upload Image
                                        </label>
                                      </div>
                                      <div className="space-y-2 mt-2">
                                        <div className="flex items-center space-x-2">
                                          <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => setCustomTable(custom.id, qi, 2, 2)}>Add 2x2 Table</button>
                                          <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => setCustomTable(custom.id, qi, 3, 3)}>Add 3x3 Table</button>
                                          {q.table && (
                                            <>
                                              <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => addCustomTableRow(custom.id, qi)}>+ Row</button>
                                              <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => addCustomTableCol(custom.id, qi)}>+ Col</button>
                                              <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => removeCustomTableRow(custom.id, qi)}>- Row</button>
                                              <button className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded" onClick={() => removeCustomTableCol(custom.id, qi)}>- Col</button>
                                            </>
                                          )}
                                        </div>
                                        {q.table && (
                                          <div className="overflow-auto">
                                            <table className="min-w-[300px] border border-slate-300 dark:border-slate-600">
                                              <tbody>
                                                {q.table.data.map((row: string[], r: number) => (
                                                  <tr key={r}>
                                                    {row.map((cell: string, c: number) => (
                                                      <td key={c} className="border border-slate-300 dark:border-slate-600 p-1">
                                                        <input type="text" value={cell} onChange={(e) => updateCustomTableCell(custom.id, qi, r, c, e.target.value)} className="w-full px-2 py-1 bg-transparent focus:outline-none" />
                                                      </td>
                                                    ))}
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div>
                <button onClick={addCustomSection} className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600">
                  <Plus className="w-4 h-4" />
                  <span>Add Section at End</span>
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">Total Marks: {calculateTotalMarks()}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Pass Marks: {formData.pass_marks || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {editingExam ? 'Update exam details and save changes' : 'Fill in exam details and add questions to submit for admin review'}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={saveAsDraft}
              disabled={savingDraft || !currentTeacherId}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingDraft ? 'Saving...' : 'Save Exam'}</span>
            </button>
            
            <button
              onClick={submitForApproval}
              disabled={loading || !currentTeacherId}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit for Review'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCreationForm;