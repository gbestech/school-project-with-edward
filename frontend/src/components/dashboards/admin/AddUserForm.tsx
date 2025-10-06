import React, { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import api from '@/services/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { triggerDashboardRefresh } from '@/hooks/useDashboardRefresh';

// --- Student Form Types ---
type StudentFormData = {
  photo: string | null; // Now stores Cloudinary URL
  firstName: string;
  middleName: string;
  lastName: string;
  email: string; // <-- Add this line
  gender: string;
  bloodGroup: string;
  dateOfBirth: string;
  placeOfBirth: string;
  academicYear: string;
  education_level: string;
  student_class: string;
  stream: string; // <-- Add stream field
  registration_number: string; // <-- Add registration number
  existing_parent_id: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhoneNumber: string;
  parentAddress: string;
  address: string;
  phoneNumber: string;
  paymentMethod: string;
  medicalConditions: string;
  specialRequirements: string;
  relationship: string; // <-- Add this line
  isPrimaryContact: boolean; // <-- Add this line
  classroom: string;
};



const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
// Backend values for education level and student class
const educationLevels = [
  { value: 'NURSERY', label: 'Nursery' },
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'JUNIOR_SECONDARY', label: 'Junior Secondary' },
  { value: 'SENIOR_SECONDARY', label: 'Senior Secondary' },
];
const studentClassesByLevel: Record<string, { value: string; label: string }[]> = {
  NURSERY: [
    { value: 'PRE_NURSERY', label: 'Pre-nursery' },
    { value: 'NURSERY_1', label: 'Nursery 1' },
    { value: 'NURSERY_2', label: 'Nursery 2' },
  ],
  PRIMARY: [
    { value: 'PRIMARY_1', label: 'Primary 1' },
    { value: 'PRIMARY_2', label: 'Primary 2' },
    { value: 'PRIMARY_3', label: 'Primary 3' },
    { value: 'PRIMARY_4', label: 'Primary 4' },
    { value: 'PRIMARY_5', label: 'Primary 5' },
    { value: 'PRIMARY_6', label: 'Primary 6' },
  ],
  JUNIOR_SECONDARY: [
    { value: 'JSS_1', label: 'Junior Secondary 1 (JSS1)' },
    { value: 'JSS_2', label: 'Junior Secondary 2 (JSS2)' },
    { value: 'JSS_3', label: 'Junior Secondary 3 (JSS3)' },
  ],
  SENIOR_SECONDARY: [
    { value: 'SS_1', label: 'Senior Secondary 1 (SS1)' },
    { value: 'SS_2', label: 'Senior Secondary 2 (SS2)' },
    { value: 'SS_3', label: 'Senior Secondary 3 (SS3)' },
  ],
};
// Map student_class to valid classrooms
const classroomsByStudentClass: Record<string, string[]> = {
  // Nursery
  PRE_NURSERY: ['Pre-Nursery A', 'Pre-Nursery B'],
  NURSERY_1: ['Nursery 1 A', 'Nursery 1 B'],
  NURSERY_2: ['Nursery 2 A', 'Nursery 2 B'],
  // Primary
  PRIMARY_1: ['Primary 1 A', 'Primary 1 B'],
  PRIMARY_2: ['Primary 2 A', 'Primary 2 B'],
  PRIMARY_3: ['Primary 3 A', 'Primary 3 B'],
  PRIMARY_4: ['Primary 4 A', 'Primary 4 B'],
  PRIMARY_5: ['Primary 5 A', 'Primary 5 B'],
  PRIMARY_6: ['Primary 6 A', 'Primary 6 B'],
  // Junior Secondary
  JSS_1: ['JSS1 A', 'JSS1 B'],
  JSS_2: ['JSS2 A', 'JSS2 B'],
  JSS_3: ['JSS3 A', 'JSS3 B'],
  // Senior Secondary
  SS_1: ['SS1 A', 'SS1 B'],
  SS_2: ['SS2 A', 'SS2 B'],
  SS_3: ['SS3 A', 'SS3 B'],
};

// --- Student Form ---
interface AddStudentFormProps {
  onStudentAdded?: () => void;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onStudentAdded }) => {
  const [formData, setFormData] = useState<StudentFormData>({
    photo: null,
    firstName: '',
    middleName: '',
    lastName: '',
    email: '', // <-- Add this line
    gender: '',
    bloodGroup: '',
    dateOfBirth: '',
    placeOfBirth: '',
    academicYear: '',
    education_level: '',
    student_class: '',
    stream: '', // <-- Add stream field
    registration_number: '', // <-- Add registration number
    existing_parent_id: '',
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhoneNumber: '',
    parentAddress: '',
    address: '',
    phoneNumber: '',
    paymentMethod: '',
    medicalConditions: '',
    specialRequirements: '',
    relationship: '', // <-- Add this line
    isPrimaryContact: false, // <-- Add this line
    classroom: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
        const [studentPassword, setStudentPassword] = useState<string | null>(null);
      const [parentPassword, setParentPassword] = useState<string | null>(null);
      const [showPasswordModal, setShowPasswordModal] = useState(false);
      const [studentUsername, setStudentUsername] = useState<string | null>(null);
      const [parentUsername, setParentUsername] = useState<string | null>(null);
  const [parentSearch, setParentSearch] = useState('');
  const [parentOptions, setParentOptions] = useState<any[]>([]);
  const [parentSearchLoading, setParentSearchLoading] = useState(false);
  const [selectedParent, setSelectedParent] = useState<any | null>(null);
  const navigate = useNavigate();
  const [parentUsernameSearch, setParentUsernameSearch] = useState('');
  const [parentDetails, setParentDetails] = useState<any | null>(null);
  const [useParentEmail, setUseParentEmail] = useState(false); // <-- Add this line
  const [uploading, setUploading] = useState(false); // For Cloudinary upload status
  const [photoPreview, setPhotoPreview] = useState<string | null>(null); // For preview
  const [streams, setStreams] = useState<any[]>([]); // For stream options

  // Handler for searching parent by username
  const handleParentUsernameSearch = async () => {
    if (!parentUsernameSearch) return;
    try {
      console.log('Searching for parent with username:', parentUsernameSearch);
      const res = await api.get(`/api/parents/search/?q=${encodeURIComponent(parentUsernameSearch)}`);
      console.log('Search response:', res);
      
      // The API service returns data directly, not in res.data
      const parentData = Array.isArray(res) ? res : [];
      console.log('Parent data array:', parentData);
      
      // Find the parent by username (exact match or partial match)
      const found = parentData.find((p: any) => 
        p.username === parentUsernameSearch || 
        p.username.includes(parentUsernameSearch) ||
        p.username.toLowerCase().includes(parentUsernameSearch.toLowerCase())
      );
      console.log('Found parent:', found);
      
      if (found) {
        setParentDetails(found);
        setSelectedParent(found);
        setParentUsernameSearch(found.username); // Update with exact username
        toast.success('Parent found and details filled!');
      } else {
        toast.error('Parent not found. Please check the username or add the parent first.');
        setTimeout(() => navigate('/admin/parents/add'), 1500);
      }
    } catch (err) {
      console.error('Error searching for parent:', err);
      toast.error('Error searching for parent.');
    }
  };

  useEffect(() => {
    if (parentSearch.length < 2) {
      setParentOptions([]);
      return;
    }
    setParentSearchLoading(true);
    api.get(`/api/parents/search/?q=${encodeURIComponent(parentSearch)}`)
      .then(res => {
        console.log('Parent search response:', res);
        setParentOptions(res || []);
      })
      .catch((err) => {
        console.error('Parent search error:', err);
        setParentOptions([]);
      })
      .finally(() => setParentSearchLoading(false));
  }, [parentSearch]);

  useEffect(() => {
    if (useParentEmail && (selectedParent || parentDetails)) {
      const parentEmail = selectedParent?.email || parentDetails?.email || '';
      setFormData(prev => ({ ...prev, email: parentEmail }));
    }
  }, [useParentEmail, selectedParent, parentDetails]);

  // Fetch streams for Senior Secondary students
  useEffect(() => {
      console.log("🔍 useEffect for fetching streams ran");
    const fetchStreams = async () => {
      try {
        // const response = await api.get('/api/classrooms/streams/');
        const response = await api.get('/api/classrooms/streams/');
         console.log("Fetched streams response:", response);
        // setStreams(response || []);
        setStreams(response.data || []);
      } catch (error) {
        console.error('Error fetching streams:', error);
        setStreams([]);
      }
    };
     
    fetchStreams();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && 'checked' in e.target) {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    // For preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    // Upload to Cloudinary
    const cloudinaryData = new FormData();
    cloudinaryData.append('file', file);
    cloudinaryData.append('upload_preset', 'profile_upload');
    try {
      const res = await axios.post('https://api.cloudinary.com/v1_1/djbz7wunu/image/upload', cloudinaryData);
      const imageUrl = res.data.secure_url;
      setFormData(prev => ({ ...prev, photo: imageUrl }));
      setPhotoPreview(imageUrl); // Use Cloudinary URL for preview after upload
    } catch (err) {
      toast.error('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    setPhotoPreview(null);
  };

  const handleSave = async () => {
    setLoading(true);
          setError(null);
      setSuccess(null);
      setStudentPassword(null);
      setParentPassword(null);
      setShowPasswordModal(false);
    try {
      // Debugging: Log the photo and payload
      console.log('profile_picture to send:', formData.photo);
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
        education_level: formData.education_level,
        student_class: formData.student_class,
        stream: formData.stream ?? null,
        registration_number: formData.registration_number,
        classroom: formData.classroom,
        address: formData.address,
        phone_number: formData.phoneNumber,
        payment_method: formData.paymentMethod,
        medical_conditions: formData.medicalConditions,
        special_requirements: formData.specialRequirements,
        profile_picture: formData.photo, // Now a Cloudinary URL
        relationship: formData.relationship,
        is_primary_contact: formData.isPrimaryContact,
      };
      console.log('payload:', payload);
      
      // Validate stream selection for Senior Secondary students
      if (formData.education_level === 'SENIOR_SECONDARY' && !formData.stream) {
        setError('Stream selection is required for Senior Secondary students');
        setLoading(false);
        return;
      }
      
      if (selectedParent) {
        payload.existing_parent_id = selectedParent.id;
      } else {
        payload.parent_first_name = formData.parentFirstName;
        payload.parent_last_name = formData.parentLastName;
        payload.parent_email = formData.parentEmail;
        payload.parent_contact = formData.parentPhoneNumber;
        payload.parent_address = formData.parentAddress;
      }
      // Send as JSON (no FormData)
      const response = await api.post('/api/students/students/', payload);
      setSuccess('Student and Parent created successfully!');
      toast.success('Student and Parent added successfully');
      
      // Trigger dashboard refresh to update recent students
      triggerDashboardRefresh();
      
      // Call the callback to refresh dashboard data
      if (onStudentAdded) {
        onStudentAdded();
      }
      
      if (response) {
        setStudentUsername(response.student_username);
        setStudentPassword(response.student_password);
        setParentUsername(response.parent_username);
        setParentPassword(response.parent_password);
        setShowPasswordModal(true);
      }
      setTimeout(() => {
        setLoading(false);
        setFormData({
          photo: null,
          firstName: '',
          middleName: '',
          lastName: '',
          email: '', // <-- Add this line
          gender: '',
          bloodGroup: '',
          dateOfBirth: '',
          placeOfBirth: '',
          academicYear: '',
          education_level: '',
          student_class: '',
          stream: '',
          registration_number: '', // <-- Add registration number
          existing_parent_id: '',
          parentFirstName: '',
          parentLastName: '',
          parentEmail: '',
          parentPhoneNumber: '',
          parentAddress: '',
          address: '',
          phoneNumber: '',
          paymentMethod: '',
          medicalConditions: '',
          specialRequirements: '',
          relationship: '', // <-- Add this line
          isPrimaryContact: false, // <-- Add this line
          classroom: '',
        });
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create student');
      toast.error('Cannot add student');
      setLoading(false);
    }
  };

  const filteredStudentClasses = formData.education_level ? studentClassesByLevel[formData.education_level] : [];
  const filteredClassrooms = formData.student_class ? classroomsByStudentClass[formData.student_class] || [] : [];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Add New Student</h2>
      </div>
      <div className="p-6">
            {/* Photo Upload */}
        <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo*</label>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-3 bg-gray-50">
  {photoPreview ? (
    <div className="relative">
      <img src={photoPreview} alt="Student" className="w-20 h-20 object-cover rounded" />
      <button onClick={removePhoto} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"><X size={12} /></button>
    </div>
  ) : (<User size={32} className="text-gray-400" />)}
</div>
{uploading && <div className="text-sm text-blue-600">Uploading image...</div>}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="student-photo" />
            <label htmlFor="student-photo" className="bg-blue-600 text-white px-4 py-2 rounded text-sm cursor-pointer hover:bg-blue-700 transition-colors">Choose File</label>
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
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Gender*</label><select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Select Gender</option><option value="M">Male</option><option value="F">Female</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label><select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Select Blood Group</option>{bloodGroups.map(group => (<option key={group} value={group}>{group}</option>))}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth*</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" /></div>
            </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Place of Birth*</label><input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Lagos, Nigeria" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Academic Year*</label><input type="text" name="academicYear" value={formData.academicYear} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="2024/2025" /></div>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Education Level*</label>
            <select name="education_level" value={formData.education_level || ''} onChange={e => {
              handleInputChange(e);
              setFormData(prev => ({ ...prev, student_class: '', classroom: '', stream: '' })); // Reset class, classroom, and stream
            }} className="w-full p-3 border border-gray-300 rounded-lg">
              <option value="">Select Level</option>
              {educationLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Class*</label>
            <select name="student_class" value={formData.student_class || ''} onChange={e => {
              handleInputChange(e);
              setFormData(prev => ({ ...prev, classroom: '', stream: '' })); // Reset classroom and stream
            }} className="w-full p-3 border border-gray-300 rounded-lg" required>
              <option value="">Select Class</option>
              {filteredStudentClasses.map(cls => (
                <option key={cls.value} value={cls.value}>{cls.label}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Stream Selection for Senior Secondary */}
        {formData.education_level === 'SENIOR_SECONDARY' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stream Selection *
              <span className="text-xs text-gray-500 ml-2">
                (Required for Senior Secondary students)
              </span>
            </label>
            <select
              name="stream"
              value={formData.stream || ''}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Your Stream</option>
              {streams.map((stream) => (
                <option key={stream.id} value={stream.id}>
                  {stream.name} ({stream.stream_type})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1">
              Choose the stream that best matches your academic interests and career goals.
            </p>
          </div>
        )}
        {/* Registration Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
          <input
            type="text"
            name="registration_number"
            value={formData.registration_number}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter registration number (optional)"
          />
        </div>
        {/* Classroom Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Classroom</label>
          <select
            name="classroom"
            value={formData.classroom}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required={!!formData.student_class}
            disabled={!formData.student_class}
          >
            <option value="">Select Classroom</option>
            {filteredClassrooms.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
        </div>
        {/* Parent Search/Select */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Existing Parent</label>
          <input
            type="text"
            value={parentSearch}
            onChange={e => {
              setParentSearch(e.target.value);
              setSelectedParent(null);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Type at least 2 characters (name, username, or email)"
          />
          {parentSearchLoading && <div className="text-sm text-gray-500">Searching...</div>}
          {parentOptions && parentOptions.length > 0 && (
            <ul className="border border-gray-200 rounded mt-2 bg-white max-h-40 overflow-y-auto shadow-lg">
              {parentOptions.map(parent => (
                <li
                  key={parent.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedParent && selectedParent.id === parent.id 
                      ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500' 
                      : 'hover:bg-blue-50 text-gray-900'
                  }`}
                  onClick={() => {
                    setSelectedParent(parent);
                    setParentUsernameSearch(parent.username); // Auto-fill the username field
                  }}
                >
                  <div className="font-semibold text-sm">{parent.full_name} ({parent.username})</div>
                  <div className="text-xs text-gray-600 mt-1">{parent.email} | {parent.phone}</div>
                </li>
              ))}
            </ul>
          )}
          {selectedParent && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center justify-between">
              <div>
                <span className="font-medium">Selected Parent:</span> 
                <span className="font-semibold ml-1">{selectedParent.full_name}</span> 
                <span className="text-green-600 ml-1">({selectedParent.username})</span>
              </div>
              <button 
                className="ml-2 text-xs text-red-600 hover:text-red-800 underline font-medium" 
                onClick={() => setSelectedParent(null)}
              >
                Clear
              </button>
            </div>
          )}
        </div>
        {/* Parent Username Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Parent Username</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={parentUsernameSearch}
              onChange={e => setParentUsernameSearch(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter parent username (e.g., PAR/GTS/AUG/25/003)"
            />
            <button
              type="button"
              onClick={handleParentUsernameSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>
          {selectedParent && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Tip:</span> You can also search by partial username (e.g., "GTS/AUG" or "003")
            </div>
          )}
        </div>
        {/* If parent is found, show details read-only */}
        {parentDetails && (
          <div className="mb-4 p-4 bg-white border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-500 mb-2">Parent Details Found:</h4>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium text-green-800">Full Name:</span> <span className="text-green-500">{parentDetails.full_name}</span></div>
              <div><span className="font-medium text-green-800">Email:</span> <span className="text-green-500">{parentDetails.email}</span></div>
              <div><span className="font-medium text-green-800">Phone:</span> <span className="text-green-500">{parentDetails.phone}</span></div>
              <div><span className="font-medium text-green-800">Address:</span> <span className="text-green-500">{parentDetails.address}</span></div>
            </div>
          </div>
        )}
        {/* Only show new parent fields if no parent is found/selected */}
        {!parentDetails && !selectedParent && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Parent First Name*</label><input type="text" name="parentFirstName" value={formData.parentFirstName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Parent first name" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Parent Last Name*</label><input type="text" name="parentLastName" value={formData.parentLastName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Parent last name" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone Number*</label><input type="tel" name="parentPhoneNumber" value={formData.parentPhoneNumber} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="+2341234567890" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Parent Email*</label><input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="parent@example.com" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Parent Address*</label><textarea name="parentAddress" value={formData.parentAddress} onChange={handleInputChange} rows={2} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Parent address..." /></div>
            </div>
          </>
        )}
        {/* If parent is found by username, disable parent fields */}
        {selectedParent && (
          <div className="mt-2 p-2 bg-green-50 rounded text-green-800">
            Parent found and selected. New parent fields are disabled.
          </div>
        )}
        {/* If no parent is found, prompt to create a parent first */}
        {parentSearch.length > 1 && (!parentOptions || parentOptions.length === 0) && !parentSearchLoading && !selectedParent && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 text-xs font-bold">!</span>
              </div>
              <span className="text-yellow-800 font-medium">No parent found. Please create a parent first before adding the student.</span>
            </div>
          </div>
        )}
        <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">Student Email*</label>
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={useParentEmail}
        onChange={e => setUseParentEmail(e.target.checked)}
        id="use-parent-email"
        className="mr-2"
        disabled={!selectedParent && !parentDetails}
      />
      <label htmlFor="use-parent-email" className="text-sm">Use parent's email for student</label>
    </div>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleInputChange}
      className="w-full p-3 border border-gray-300 rounded-lg mt-2"
      placeholder="student@example.com"
      disabled={useParentEmail && (selectedParent || parentDetails)}
      required
    />
  </div>
        <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship to Student*</label>
    <select
      name="relationship"
      value={formData.relationship}
      onChange={handleInputChange}
      className="w-full p-3 border border-gray-300 rounded-lg"
      required
    >
      <option value="">Select Relationship</option>
      <option value="Father">Father</option>
      <option value="Mother">Mother</option>
      <option value="Guardian">Guardian</option>
      <option value="Sponsor">Sponsor</option>
    </select>
  </div>
  <div className="mb-4 flex items-center">
    <input
      type="checkbox"
      name="isPrimaryContact"
      checked={formData.isPrimaryContact}
      onChange={handleInputChange}
      className="mr-2"
      id="is-primary-contact"
    />
    <label htmlFor="is-primary-contact" className="text-sm">Is Primary Contact?</label>
  </div>
        <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Student Address*</label><textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Student address..." /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number*</label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="+2341234567890" /></div>
        </div>
        <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Payment Method*</label><select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Select Payment Method</option><option value="cash">Cash</option><option value="debits">Debits</option></select></div>
        <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label><textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleInputChange} rows={2} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Medical conditions..." /></div>
        <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label><textarea name="specialRequirements" value={formData.specialRequirements} onChange={handleInputChange} rows={2} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Special requirements..." /></div>
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors" disabled={loading}>{loading ? 'Saving...' : 'Save Student'}</button>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {/* Modal for showing passwords */}
        {showPasswordModal && (studentUsername || studentPassword || parentUsername || parentPassword) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
              <h3 className="text-lg font-semibold mb-4 text-blue-700">Account Credentials</h3>
              {studentUsername && (
                <div className="mb-2 p-3 bg-blue-50 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">Student Account</h4>
                  <div className="text-sm text-gray-800">
                    <span className="font-semibold">Username:</span>
                    <span className="ml-2 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{studentUsername}</span>
                    <button onClick={() => navigator.clipboard.writeText(studentUsername!)} className="ml-2 text-xs text-blue-600 underline">Copy</button>
                  </div>
                  <div className="text-sm text-gray-800 mt-2">
                    <span className="font-semibold">Password:</span>
                    <span className="ml-2 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{studentPassword}</span>
                    <button onClick={() => navigator.clipboard.writeText(studentPassword!)} className="ml-2 text-xs text-blue-600 underline">Copy</button>
                  </div>
                </div>
              )}
              {parentUsername && (
                <div className="mb-2 p-3 bg-green-50 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">Parent Account</h4>
                  <div className="text-sm text-gray-800">
                    <span className="font-semibold">Username:</span>
                    <span className="ml-2 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{parentUsername}</span>
                    <button onClick={() => navigator.clipboard.writeText(parentUsername!)} className="ml-2 text-xs text-blue-600 underline">Copy</button>
                  </div>
                  <div className="text-sm text-gray-800 mt-2">
                    <span className="font-semibold">Password:</span>
                    <span className="ml-2 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{parentPassword}</span>
                    <button onClick={() => navigator.clipboard.writeText(parentPassword!)} className="ml-2 text-xs text-blue-600 underline">Copy</button>
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





export default AddStudentForm;