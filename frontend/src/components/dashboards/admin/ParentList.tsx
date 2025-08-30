import React, { useState, useEffect } from 'react';
import { User, Plus, Users, Mail, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/services/api';
import { triggerDashboardRefresh } from '@/hooks/useDashboardRefresh';

interface Parent {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
  };
  is_active?: boolean; // <-- Add this line
  students: Array<{
    id: number;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  }>;
  phone?: string;
}

interface AddStudentToParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parent: Parent | null;
  onStudentAdded: () => void;
}

const AddStudentToParentModal: React.FC<AddStudentToParentModalProps> = ({
  isOpen,
  onClose,
  parent,
  onStudentAdded
}) => {
  const [formData, setFormData] = useState({
    user_email: '',
    user_first_name: '',
    user_middle_name: '',
    user_last_name: '',
    gender: '',
    date_of_birth: '',
    education_level: '',
    student_class: '',
    stream: '',
    emergency_contact: '',
    medical_conditions: '',
    special_requirements: '',
  });
  const [loading, setLoading] = useState(false);

  const educationLevels = [
    { value: 'NURSERY', label: 'Nursery' },
    { value: 'PRIMARY', label: 'Primary' },
    { value: 'JUNIOR_SECONDARY', label: 'Junior Secondary' },
    { value: 'SENIOR_SECONDARY', label: 'Senior Secondary' },
  ];

  const studentClasses = [
    { value: 'PRE_NURSERY', label: 'Pre-nursery' },
    { value: 'NURSERY_1', label: 'Nursery 1' },
    { value: 'NURSERY_2', label: 'Nursery 2' },
    { value: 'PRIMARY_1', label: 'Primary 1' },
    { value: 'PRIMARY_2', label: 'Primary 2' },
    { value: 'PRIMARY_3', label: 'Primary 3' },
    { value: 'PRIMARY_4', label: 'Primary 4' },
    { value: 'PRIMARY_5', label: 'Primary 5' },
    { value: 'PRIMARY_6', label: 'Primary 6' },
    { value: 'JSS_1', label: 'Junior Secondary 1 (JSS1)' },
    { value: 'JSS_2', label: 'Junior Secondary 2 (JSS2)' },
    { value: 'JSS_3', label: 'Junior Secondary 3 (JSS3)' },
    { value: 'SS_1', label: 'Senior Secondary 1 (SS1)' },
    { value: 'SS_2', label: 'Senior Secondary 2 (SS2)' },
    { value: 'SS_3', label: 'Senior Secondary 3 (SS3)' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parent) return;

    setLoading(true);
    try {
      const response = await api.post(`/api/parents/${parent.id}/add_student/`, formData);
      
      toast.success('Student added successfully!');
      
      // Trigger dashboard refresh to update recent students
      triggerDashboardRefresh();
      
      if (response.data.student_password) {
        toast.info(`Student password: ${response.data.student_password}`);
      }
      
      setFormData({
        user_email: '',
        user_first_name: '',
        user_middle_name: '',
        user_last_name: '',
        gender: '',
        date_of_birth: '',
        education_level: '',
        student_class: '',
        stream: '',
        emergency_contact: '',
        medical_conditions: '',
        special_requirements: '',
      });
      
      onStudentAdded();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !parent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Add Student to {parent.user.first_name} {parent.user.last_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Email *
              </label>
              <input
                type="email"
                name="user_email"
                value={formData.user_email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="user_first_name"
                value={formData.user_first_name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Middle Name
              </label>
              <input
                type="text"
                name="user_middle_name"
                value={formData.user_middle_name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="user_last_name"
                value={formData.user_last_name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education Level *
              </label>
              <select
                name="education_level"
                value={formData.education_level}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Education Level</option>
                {educationLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Class *
              </label>
              <select
                name="student_class"
                value={formData.student_class}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Class</option>
                {studentClasses.map(cls => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stream Selection for Senior Secondary */}
          {formData.education_level === 'SENIOR_SECONDARY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stream (Optional)
              </label>
              <select
                name="stream"
                value={formData.stream}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select Stream (Optional)</option>
                <option value="1">Science</option>
                <option value="2">Arts</option>
                <option value="3">Commercial</option>
                <option value="4">Technical</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact
            </label>
            <input
              type="tel"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Conditions
            </label>
            <textarea
              name="medical_conditions"
              value={formData.medical_conditions}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requirements
            </label>
            <textarea
              name="special_requirements"
              value={formData.special_requirements}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ParentList: React.FC = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  const fetchParents = async () => {
    try {
      const response = await api.get('/api/parents/');
      setParents(response.data);
    } catch (error) {
      toast.error('Failed to fetch parents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleAddStudent = (parent: Parent) => {
    setSelectedParent(parent);
    setShowAddStudentModal(true);
  };

  const handleStudentAdded = () => {
    fetchParents(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading parents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Parents</h2>
        <div className="text-sm text-gray-500">
          Total: {parents.length} parents
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parents.map((parent) => (
          <div
            key={parent.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {parent.user.first_name} {parent.user.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{parent.user.email}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  (parent.is_active ?? parent.user.is_active)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {(parent.is_active ?? parent.user.is_active) ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {parent.user.email}
              </div>
              {parent.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {parent.phone}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                {parent.students.length} student{parent.students.length !== 1 ? 's' : ''}
              </div>
            </div>

            {parent.students.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Students:</h4>
                <div className="space-y-1">
                  {parent.students.map((student) => (
                    <div
                      key={student.id}
                      className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded"
                    >
                      {student.user.first_name} {student.user.last_name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => handleAddStudent(parent)}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        ))}
      </div>

      <AddStudentToParentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        parent={selectedParent}
        onStudentAdded={handleStudentAdded}
      />
    </div>
  );
};

export default ParentList; 