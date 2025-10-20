import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X,AlertCircle, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

interface ExamSchedule {
  id?: number;
  name: string;
  description: string;
  academic_session: number | null;
  term: number | null;
  start_date: string;
  end_date: string;
  registration_start?: string;
  registration_end?: string;
  results_publication_date?: string;
  is_active: boolean;
  allow_late_registration: boolean;
  is_default: boolean;
}

interface AcademicSession {
  id: number;
  name: string;
}

interface Term {
  id: number;
  name: string;
}

const ExamScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ExamSchedule | null>(null);
  const [formData, setFormData] = useState<ExamSchedule>({
    name: '',
    description: '',
    academic_session: null,
    term: null,
    start_date: '',
    end_date: '',
    registration_start: '',
    registration_end: '',
    results_publication_date: '',
    is_active: true,
    allow_late_registration: false,
    is_default: false,
  });

  // Load data
  const loadData = useCallback(async () => {
  try {
    setLoading(true);
    setDataLoadError(null);
    
    console.log('🔍 Loading exam schedules, sessions, and terms...');

    // Load exam schedules
    let schedulesData = [];
    try {
      const response = await api.get('exams/schedules/');
      schedulesData = response;
      console.log('✅ Loaded exam schedules:', schedulesData);
    } catch (err: any) {
      console.warn('⚠️ Could not load exam schedules:', err.message);
    }

    // Load academic sessions - try multiple endpoints
    let sessionsData: AcademicSession[] = [];
    const sessionEndpoints = [
      'fee/academic-sessions/',
      'academic/sessions/',
      'sessions/',
      'academics/academic-sessions/'
    ];
    
    for (const endpoint of sessionEndpoints) {
      try {
        console.log(`🔍 Trying to load academic sessions from: ${endpoint}`);
        const response = await api.get(endpoint);
        console.log('📊 Response:', response);
        
        // Handle different response formats
        if (Array.isArray(response)) {
          sessionsData = response;
        } else if (response?.results && Array.isArray(response.results)) {
          sessionsData = response.results;
        } else if (response?.data && Array.isArray(response.data)) {
          sessionsData = response.data;
        }
        
        if (sessionsData.length > 0) {
          console.log('✅ Loaded academic sessions from:', endpoint, sessionsData);
          break;
        }
      } catch (err: any) {
        console.warn(`⚠️ Failed to load from ${endpoint}:`, err.message);
      }
    }

    // Load terms - try multiple endpoints
    let termsData: Term[] = [];
    const termEndpoints = [
      'fee/terms/',
      'academic/terms/',
      'terms/',
      'academics/terms/'
    ];
    
    for (const endpoint of termEndpoints) {
      try {
        console.log(`🔍 Trying to load terms from: ${endpoint}`);
        const response = await api.get(endpoint);
        console.log('📊 Response:', response);
        
        // Handle different response formats
        if (Array.isArray(response)) {
          termsData = response;
        } else if (response?.results && Array.isArray(response.results)) {
          termsData = response.results;
        } else if (response?.data && Array.isArray(response.data)) {
          termsData = response.data;
        }
        
        if (termsData.length > 0) {
          console.log('✅ Loaded terms from:', endpoint, termsData);
          break;
        }
      } catch (err: any) {
        console.warn(`⚠️ Failed to load from ${endpoint}:`, err.message);
      }
    }

    // Use fallback data only if API calls failed
    if (sessionsData.length === 0) {
      console.warn('⚠️ Using fallback academic sessions');
      setDataLoadError('Could not load academic sessions from database. Using fallback data.');
      sessionsData = [
        { id: 1, name: '2025/2026 Academic Session' },
        { id: 2, name: '2024/2025 Academic Session' },
        { id: 3, name: '2023/2024 Academic Session' },
      ];
    }

    if (termsData.length === 0) {
      console.warn('⚠️ Using fallback terms');
      setDataLoadError('Could not load terms from database. Using fallback data.');
      termsData = [
        { id: 1, name: 'First Term' },
        { id: 2, name: 'Second Term' },
        { id: 3, name: 'Third Term' },
      ];
    }

    setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
    setAcademicSessions(sessionsData);
    setTerms(termsData);

    console.log('✅ Final data loaded:');
    console.log('  - Schedules:', schedulesData.length);
    console.log('  - Academic Sessions:', sessionsData.length);
    console.log('  - Terms:', termsData.length);

  } catch (err: any) {
    console.error('❌ Error loading data:', err);
    toast.error('Failed to load exam schedules');
    setDataLoadError(err.message || 'Failed to load data');
  } finally {
    setLoading(false);
  }
}, []);


const [dataLoadError, setDataLoadError] = useState<string | null>(null);

// 3. Add a warning banner in the JSX to show when fallback data is used:
{dataLoadError && (
  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
    <div>
      <h3 className="text-sm font-semibold text-yellow-800">Using Fallback Data</h3>
      <p className="text-sm text-yellow-700 mt-1">
        {dataLoadError} Please check your API endpoints or contact your administrator.
      </p>
    </div>
  </div>
)}

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      academic_session: null,
      term: null,
      start_date: '',
      end_date: '',
      registration_start: '',
      registration_end: '',
      results_publication_date: '',
      is_active: true,
      allow_late_registration: false,
      is_default: false,
    });
    setEditingSchedule(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Improved validation
    if (!formData.name.trim()) {
      toast.error('Please enter a schedule name');
      return;
    }
    
    if (!formData.academic_session || formData.academic_session === 0) {
      toast.error('Please select an academic session');
      return;
    }
    
    if (!formData.term || formData.term === 0) {
      toast.error('Please select a term');
      return;
    }
    
    if (!formData.start_date) {
      toast.error('Please select a start date');
      return;
    }
    
    if (!formData.end_date) {
      toast.error('Please select an end date');
      return;
    }

    try {
      // Prepare the data for submission
      const submitData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          academic_session: Number(formData.academic_session),
          term: Number(formData.term),
          start_date: formData.start_date,
          end_date: formData.end_date,
          registration_start: formData.registration_start || undefined,
          registration_end: formData.registration_end || undefined,
          results_publication_date: formData.results_publication_date || undefined,
          is_active: formData.is_active,
          allow_late_registration: formData.allow_late_registration,
          is_default: formData.is_default,
      };

      console.log('Submitting schedule data:', submitData);

      if (editingSchedule?.id) {
        // Update existing schedule
        await api.put(`exams/schedules/${editingSchedule.id}/`, submitData);
        toast.success('Exam schedule updated successfully');
      } else {
        // Create new schedule
        await api.post('exams/schedules/', submitData);
        toast.success('Exam schedule created successfully');
      }
      
      setShowForm(false);
      resetForm();
      loadData();
    } catch (err: any) {
      console.error('Error saving schedule:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save exam schedule';
      toast.error(errorMessage);
    }
  };

  // 4. Update handleEdit to ensure proper number conversion:
const handleEdit = (schedule: ExamSchedule) => {
  setEditingSchedule(schedule);
  setFormData({
    ...schedule,
    academic_session: schedule.academic_session,
    term: schedule.term,
  });
  setShowForm(true);
};

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this exam schedule?')) {
      return;
    }

    try {
      await api.delete(`exams/schedules/${id}/`);
      toast.success('Exam schedule deleted successfully');
      loadData();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      toast.error('Failed to delete exam schedule');
    }
  };

  // Handle set as default
  const handleSetDefault = async (id: number) => {
    try {
      await api.post(`exams/schedules/${id}/set-default/`, {});
      toast.success('Default exam schedule updated');
      loadData();
    } catch (err) {
      console.error('Error setting default:', err);
      toast.error('Failed to set default schedule');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exam Schedule Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Schedule
        </button>
      </div>

      {/* Schedule List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Exam Schedules</h2>
          {schedules.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No exam schedules found. Create your first schedule.</p>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{schedule.name}</h3>
                    <p className="text-gray-600 text-sm">{schedule.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>Start: {schedule.start_date}</span>
                      <span>End: {schedule.end_date}</span>
                      <span className={schedule.is_active ? 'text-green-600' : 'text-red-600'}>
                        {schedule.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {schedule.is_default && (
                        <span className="text-blue-600 font-semibold">Default</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!schedule.is_default && (
                      <button
                        onClick={() => handleSetDefault(schedule.id!)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id!)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingSchedule ? 'Edit Exam Schedule' : 'Create Exam Schedule'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., First Term 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Brief description of the exam schedule"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Session *
                  </label>
                  <select
                    value={formData.academic_session || ''}
                    onChange={(e) => setFormData({...formData, academic_session: parseInt(e.target.value) || null})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Academic Session</option>
                    {academicSessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term *
                  </label>
                  <select
                    value={formData.term || ''}
                    onChange={(e) => setFormData({...formData, term: parseInt(e.target.value) || null})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Term</option>
                    {terms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Start
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.registration_start || ''}
                    onChange={(e) => setFormData({...formData, registration_start: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration End
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.registration_end || ''}
                    onChange={(e) => setFormData({...formData, registration_end: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Results Publication Date
                </label>
                <input
                  type="date"
                  value={formData.results_publication_date || ''}
                  onChange={(e) => setFormData({...formData, results_publication_date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.allow_late_registration}
                    onChange={(e) => setFormData({...formData, allow_late_registration: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Allow Late Registration</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Set as Default</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingSchedule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScheduleManagement;