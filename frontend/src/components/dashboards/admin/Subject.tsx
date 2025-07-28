import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, BookOpen, Save, X } from 'lucide-react';

type Subject = {
  id: number;
  name: string;
  level: string;
  code: string;
  description: string;
};

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 1, name: 'Maths', level: 'primary', code: 'MATH-P', description: 'Basic arithmetic and problem solving' },
    { id: 2, name: 'English', level: 'secondary-junior', code: 'ENG-JS', description: 'Grammar, composition and literature' },
    { id: 3, name: 'Physics', level: 'secondary-senior', code: 'PHY-SS', description: 'Advanced physics concepts' },
    { id: 4, name: 'Drawing', level: 'nursery', code: 'ART-N', description: 'Creative arts and drawing' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [formData, setFormData] = useState<{
    name: string;
    level: string;
    code: string;
    description: string;
  }>({
    name: '',
    level: 'primary',
    code: '',
    description: ''
  });

  const levels = [
    { value: 'nursery', label: 'Nursery' },
    { value: 'primary', label: 'Primary' },
    { value: 'secondary-junior', label: 'Junior Secondary' },
    { value: 'secondary-senior', label: 'Senior Secondary' }
  ];

  const levelColors: { [key: string]: string } = {
    'nursery': 'bg-pink-100 text-pink-800',
    'primary': 'bg-blue-100 text-blue-800',
    'secondary-junior': 'bg-green-100 text-green-800',
    'secondary-senior': 'bg-purple-100 text-purple-800'
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || subject.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Please fill in required fields');
      return;
    }
    
    if (editingSubject) {
      setSubjects(subjects.map(subject =>
        subject.id === editingSubject.id
          ? { ...subject, ...formData }
          : subject
      ));
    } else {
      const newSubject: Subject = {
        id: Date.now(),
        ...formData
      };
      setSubjects([...subjects, newSubject]);
    }
    
    resetForm();
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      level: subject.level,
      code: subject.code,
      description: subject.description
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      setSubjects(subjects.filter(subject => subject.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      level: 'primary',
      code: '',
      description: ''
    });
    setEditingSubject(null);
    setShowModal(false);
  };

  const generateCode = (name: string, level: string) => {
    if (!name) return '';
    const namePrefix = name.substring(0, 3).toUpperCase();
    const levelSuffix: { [key: string]: string } = {
      'nursery': 'N',
      'primary': 'P',
      'secondary-junior': 'JS',
      'secondary-senior': 'SS'
    };
    return `${namePrefix}-${levelSuffix[level]}`;
  };

  useEffect(() => {
    if (formData.name && formData.level) {
      const autoCode = generateCode(formData.name, formData.level);
      if (!editingSubject || formData.code === generateCode(editingSubject.name, editingSubject.level)) {
        setFormData(prev => ({ ...prev, code: autoCode }));
      }
    }
  }, [formData.name, formData.level, editingSubject]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
          </div>
          <p className="text-gray-600">Manage subjects across all educational levels in your school</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  <option value="all">All Levels</option>
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Subject
            </button>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map(subject => (
            <div key={subject.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{subject.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${levelColors[subject.level]}`}>
                    {levels.find(l => l.value === subject.level)?.label}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(subject)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Code:</span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{subject.code}</span>
                </div>
                {subject.description && (
                  <div>
                    <span className="text-sm text-gray-500">Description:</span>
                    <p className="text-sm text-gray-700 mt-1">{subject.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter subject name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                    >
                      {levels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Code *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="Auto-generated or custom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Subject description (optional)"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingSubject ? 'Update Subject' : 'Create Subject'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManagement;

