import React, { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import { api } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';


// --- Teacher Form Types ---
type TeacherFormData = {
  photo: string | ArrayBuffer | null;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  bloodGroup: string;
  dateOfBirth: string;
  placeOfBirth: string;
  academicYear: string;
  classroomAssigned: string;
  teachingSubject: string;
  employeeId: string;
  address: string;
  email: string;
  phoneNumber: string;
  staffType: string; // <-- Add this line
  level: string;     // <-- Add this line
  subjects: string[]; // <-- Add this line
  hireDate: string; // <-- Add this line
};


const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Backend values for education level and student class
const educationLevels = [
  { value: 'NURSERY', label: 'Nursery' },
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'SECONDARY', label: 'Secondary' },
];
const studentClasses = [
  { value: 'NURSERY_1', label: 'Nursery 1' },
  { value: 'NURSERY_2', label: 'Nursery 2' },
  { value: 'PRE_K', label: 'Pre-K' },
  { value: 'KINDERGARTEN', label: 'Kindergarten' },
  { value: 'GRADE_1', label: 'Grade 1' },
  { value: 'GRADE_2', label: 'Grade 2' },
  { value: 'GRADE_3', label: 'Grade 3' },
  { value: 'GRADE_4', label: 'Grade 4' },
  { value: 'GRADE_5', label: 'Grade 5' },
  { value: 'GRADE_6', label: 'Grade 6' },
  { value: 'GRADE_7', label: 'Grade 7' },
  { value: 'GRADE_8', label: 'Grade 8' },
  { value: 'GRADE_9', label: 'Grade 9' },
  { value: 'GRADE_10', label: 'Grade 10' },
  { value: 'GRADE_11', label: 'Grade 11' },
  { value: 'GRADE_12', label: 'Grade 12' },
];
const classrooms = [
  'Pre-Nursery A', 'Pre-Nursery B', 'Nursery 1 A', 'Nursery 1 B', 'Nursery 2 A', 'Nursery 2 B',
  'Primary 1 A', 'Primary 1 B', 'Primary 2 A', 'Primary 2 B', 'Primary 3 A', 'Primary 3 B',
  'Primary 4 A', 'Primary 4 B', 'Primary 5 A', 'Primary 5 B', 'JSS1 A', 'JSS1 B', 'JSS2 A', 'JSS2 B',
  'JSS3 A', 'JSS3 B', 'SS1 A', 'SS1 B', 'SS2 A', 'SS2 B', 'SS3 A', 'SS3 B'
];


// --- Teacher Form ---
const AddTeacherForm: React.FC = () => {
  const [formData, setFormData] = useState<TeacherFormData>({
    photo: null,
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    bloodGroup: '',
    dateOfBirth: '',
    placeOfBirth: '',
    academicYear: '',
    classroomAssigned: '',
    teachingSubject: '',
    employeeId: '',
    address: '',
    email: '',
    phoneNumber: '',
    staffType: 'teaching',
    level: '',
    subjects: [],
    hireDate: '',
  });
    const [loading, setLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [success, setSuccess] = useState<string | null>(null);
            const [teacherUsername, setTeacherUsername] = useState<string | null>(null);
          const [teacherPassword, setTeacherPassword] = useState<string | null>(null);
          const [showPasswordModal, setShowPasswordModal] = useState(false);
          const [subjectOptions, setSubjectOptions] = useState<{id: string, name: string}[]>([]);
          const [assignedSubjects, setAssignedSubjects] = useState<{id: string, name: string}[]>([]);
  // Fetch subjects when staffType or level changes
  useEffect(() => {
    if (formData.staffType === 'teaching' && formData.level) {
      // Fetch subjects for the selected level
      const levelMap: Record<string, string> = { nursery: 'NURSERY', primary: 'PRIMARY', secondary: 'SECONDARY' };
      fetch(`/api/subjects/?education_levels=${levelMap[formData.level]}`)
        .then(res => res.json())
        .then(data => {
          // data.results for paginated, or data for non-paginated
          const subjects = Array.isArray(data.results) ? data.results : data;
          setSubjectOptions(subjects.map((s: any) => ({ id: s.id, name: s.name })));
          // For nursery/primary, auto-select all
          if (formData.level === 'nursery' || formData.level === 'primary') {
            setFormData(prev => ({ ...prev, subjects: subjects.map((s: any) => s.id) }));
          }
        });
    } else {
      setSubjectOptions([]);
      setFormData(prev => ({ ...prev, subjects: [] }));
    }
  }, [formData.staffType, formData.level]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setFormData(prev => ({ ...prev, subjects: selected }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({ ...prev, photo: ev.target ? ev.target.result : null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Map formData to backend expected fields
      const payload: any = {
        user_email: formData.email,
        user_first_name: formData.firstName,
        user_middle_name: formData.middleName,
        user_last_name: formData.lastName,
        gender: formData.gender,
        blood_group: formData.bloodGroup,
        date_of_birth: formData.dateOfBirth,
        place_of_birth: formData.placeOfBirth,
        academic_year: formData.academicYear,
        classroom_assigned: formData.classroomAssigned,
        teaching_subject: formData.teachingSubject,
        employee_id: formData.employeeId,
        address: formData.address,
        phone_number: formData.phoneNumber,
        photo: formData.photo,
        staff_type: formData.staffType,
        level: formData.level,
        subjects: formData.subjects,
        hire_date: formData.hireDate, // <-- Add this line
      };
      const response = await api.post('/api/teachers/teachers/', payload);
      setSuccess('Teacher created successfully!');
      toast.success('Teacher added successfully');
      if (response.data) {
        setTeacherUsername(response.data.user_username);
        setTeacherPassword(response.data.user_password);
        setShowPasswordModal(true);
        if (response.data.assigned_subjects) {
          setAssignedSubjects(response.data.assigned_subjects);
        }
      }
      setTimeout(() => {
        setLoading(false);
        setFormData({
          photo: null,
          firstName: '',
          middleName: '',
          lastName: '',
          gender: '',
          bloodGroup: '',
          dateOfBirth: '',
          placeOfBirth: '',
          academicYear: '',
          classroomAssigned: '',
          teachingSubject: '',
          employeeId: '',
          address: '',
          email: '',
          phoneNumber: '',
          staffType: 'teaching',
          level: '',
          subjects: [],
          hireDate: '', // <-- Add this line
        });
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create teacher');
      toast.error('Cannot add teacher');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Add New Teacher</h2>
      </div>
      <div className="p-6">
        {/* Photo Upload */}
        <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo*</label>
                <div className="flex flex-col items-center">
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-3 bg-gray-50">
              {formData.photo && typeof formData.photo === 'string' ? (
                      <div className="relative">
                  <img src={formData.photo} alt="Teacher" className="w-20 h-20 object-cover rounded" />
                  <button onClick={removePhoto} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"><X size={12} /></button>
                </div>
              ) : (<User size={32} className="text-gray-400" />)}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="teacher-photo" />
            <label htmlFor="teacher-photo" className="bg-blue-600 text-white px-4 py-2 rounded text-sm cursor-pointer hover:bg-blue-700 transition-colors">Choose File</label>
            <button onClick={removePhoto} className="text-red-500 text-sm mt-2 hover:text-red-700">Remove</button>
          </div>
        </div>
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">First Name*</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="First name" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label><input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Middle name" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name*</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Last name" /></div>
            </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Employee ID*</label><input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="EMP001" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Gender*</label><select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Select Gender</option><option value="M">Male</option><option value="F">Female</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label><select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Select Blood Group</option>{bloodGroups.map(group => (<option key={group} value={group}>{group}</option>))}</select></div>
            </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth*</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Place of Birth*</label><input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Lagos, Nigeria" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Academic Year*</label><input type="text" name="academicYear" value={formData.academicYear} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="2024/2025" /></div>
          </div>
        {/* Hire Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date*</label>
          <input type="date" name="hireDate" value={formData.hireDate} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
        </div>
        {/* Staff Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Staff Type*</label>
          <select name="staffType" value={formData.staffType} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg">
            <option value="teaching">Teaching</option>
            <option value="non-teaching">Non-Teaching</option>
          </select>
        </div>
        {/* Level (only for teaching) */}
        {formData.staffType === 'teaching' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Level*</label>
            <select name="level" value={formData.level} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg">
              <option value="">Select Level</option>
              <option value="nursery">Nursery</option>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </select>
          </div>
        )}
        {/* Subjects (only for teaching) */}
        {formData.staffType === 'teaching' && formData.level && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subjects*</label>
            {formData.level === 'nursery' || formData.level === 'primary' ? (
              <div className="bg-gray-50 p-2 rounded">
                {subjectOptions.length === 0 ? (
                  <span className="text-gray-500">No subjects found for this level.</span>
                ) : (
                  <ul className="list-disc ml-6">
                    {subjectOptions.map(subj => (
                      <li key={subj.id}>{subj.name}</li>
                    ))}
                  </ul>
                )}
                <span className="text-xs text-gray-500">All subjects for this level will be assigned.</span>
              </div>
            ) : (
              <select multiple name="subjects" value={formData.subjects} onChange={handleSubjectChange} className="w-full p-3 border border-gray-300 rounded-lg">
                {subjectOptions.map(subj => (
                  <option key={subj.id} value={subj.id}>{subj.name}</option>
                ))}
              </select>
            )}
          </div>
        )}
        {/* Hide classroom/subject assignment if non-teaching */}
        {formData.staffType === 'non-teaching' ? null : (
          <>
            {/* Classroom Assigned and Teaching Subject fields can remain for teaching staff if needed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Classroom Assigned*</label><select name="classroomAssigned" value={formData.classroomAssigned} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Select Classroom</option>{classrooms.map(classroom => (<option key={classroom} value={classroom}>{classroom}</option>))}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Teaching Subject*</label><input type="text" name="teachingSubject" value={formData.teachingSubject} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Mathematics, English, etc." /></div>
            </div>
          </>
        )}
        {/* Assigned Subjects (after creation) */}
        {assignedSubjects.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Subjects</label>
            <ul className="list-disc ml-6">
              {assignedSubjects.map(subj => (
                <li key={subj.id}>{subj.name}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Email*</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="teacher@example.com" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number*</label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="+2341234567890" /></div>
        </div>
        <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Address*</label><textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Teacher address..." /></div>
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors" disabled={loading}>{loading ? 'Saving...' : 'Save Teacher'}</button>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {/* Modal for showing passwords */}
        {showPasswordModal && (teacherUsername || teacherPassword) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
              <h3 className="text-lg font-semibold mb-4 text-blue-700">Account Credentials</h3>
              {teacherUsername && (
                <div className="mb-2 p-3 bg-blue-50 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">Teacher Account</h4>
                  <div className="text-sm text-gray-800">
                    <span className="font-semibold">Username:</span>
                    <span className="ml-2 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{teacherUsername}</span>
                    <button onClick={() => navigator.clipboard.writeText(teacherUsername!)} className="ml-2 text-xs text-blue-600 underline">Copy</button>
                  </div>
                  <div className="text-sm text-gray-800 mt-2">
                    <span className="font-semibold">Password:</span>
                    <span className="ml-2 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{teacherPassword}</span>
                    <button onClick={() => navigator.clipboard.writeText(teacherPassword!)} className="ml-2 text-xs text-blue-600 underline">Copy</button>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600 mb-4">Please copy and send these credentials to the respective users. They should be required to reset their passwords on first login.</p>
              <button onClick={() => setShowPasswordModal(false)} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTeacherForm;