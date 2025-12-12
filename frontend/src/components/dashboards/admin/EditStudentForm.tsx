
import React, { useState, useEffect } from 'react';
import { User, Upload, Camera, Save, ArrowLeft } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import StudentService, { Student } from '@/services/StudentService';

// --- Student Form Types ---
type StudentFormData = {
  photo: string | null;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  gender: string;
  bloodGroup: string;
  dateOfBirth: string;
  placeOfBirth: string;
  education_level: string;
  student_class: string;
  stream: string;
  registration_number: string;
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
  classroom: string;
  academicYear: string;
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

const classroomsByStudentClass: Record<string, string[]> = {
  PRE_NURSERY: ['Pre-Nursery A', 'Pre-Nursery B'],
  NURSERY_1: ['Nursery 1 A', 'Nursery 1 B'],
  NURSERY_2: ['Nursery 2 A', 'Nursery 2 B'],
  PRIMARY_1: ['Primary 1 A', 'Primary 1 B'],
  PRIMARY_2: ['Primary 2 A', 'Primary 2 B'],
  PRIMARY_3: ['Primary 3 A', 'Primary 3 B'],
  PRIMARY_4: ['Primary 4 A', 'Primary 4 B'],
  PRIMARY_5: ['Primary 5 A', 'Primary 5 B'],
  PRIMARY_6: ['Primary 6 A', 'Primary 6 B'],
  JSS_1: ['JSS1 A', 'JSS1 B'],
  JSS_2: ['JSS2 A', 'JSS2 B'],
  JSS_3: ['JSS3 A', 'JSS3 B'],
  SS_1: ['SS1 A', 'SS1 B'],
  SS_2: ['SS2 A', 'SS2 B'],
  SS_3: ['SS3 A', 'SS3 B'],
};

interface EditStudentFormProps {
  onStudentUpdated?: (student: Student) => void;
}

const EditStudentForm: React.FC<EditStudentFormProps> = ({ onStudentUpdated }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isSuperAdmin = user?.is_superuser && user?.is_staff;
  
  const [formData, setFormData] = useState<StudentFormData>({
    photo: null,
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    gender: '',
    bloodGroup: '',
    dateOfBirth: '',
    placeOfBirth: '',
    education_level: '',
    student_class: '',
    stream: '',
    registration_number: '',
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
    classroom: '',
    academicYear: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (id) {
      loadStudentData();
    }
  }, [id]);

  const loadStudentData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const studentData = await StudentService.getStudent(parseInt(id));
      setStudent(studentData);
      
      const mapGenderValue = (backendGender: string) => {
        if (backendGender === 'M') return 'M';
        if (backendGender === 'F') return 'F';
        return backendGender;
      };
      
      // IMPROVED NAME PARSING LOGIC
      const nameParts = (studentData.full_name || '').trim().split(' ').filter(part => part.length > 0);
      let firstName = '';
      let middleName = '';
      let lastName = '';
      
      if (nameParts.length === 1) {
        firstName = nameParts[0];
      } else if (nameParts.length === 2) {
        firstName = nameParts[0];
        lastName = nameParts[1];
      } else if (nameParts.length >= 3) {
        firstName = nameParts[0];
        middleName = nameParts.slice(1, -1).join(' ');
        lastName = nameParts[nameParts.length - 1];
      }
      
      console.log('🔍 DEBUG: Loaded student name:', studentData.full_name);
      console.log('🔍 DEBUG: Parsed as - First:', firstName, 'Middle:', middleName, 'Last:', lastName);
      
      setFormData({
        photo: studentData.profile_picture || null,
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        email: studentData.email || '',
        gender: mapGenderValue(studentData.gender || ''),
        bloodGroup: studentData.blood_group || '',
        dateOfBirth: studentData.date_of_birth || '',
        placeOfBirth: studentData.place_of_birth || '',
        education_level: studentData.education_level || '',
        student_class: studentData.student_class || '',
        stream: studentData.stream?.toString() || '',
        registration_number: studentData.username || '',
        existing_parent_id: studentData.parents?.[0]?.id?.toString() || '',
        parentFirstName: studentData.parents?.[0]?.full_name?.split(' ')[0] || '',
        parentLastName: studentData.parents?.[0]?.full_name?.split(' ').slice(1).join(' ') || '',
        parentEmail: studentData.parents?.[0]?.email || '',
        parentPhoneNumber: studentData.parents?.[0]?.phone || '',
        parentAddress: '',
        address: studentData.address || '',
        phoneNumber: studentData.phone_number || '',
        paymentMethod: studentData.payment_method || '',
        medicalConditions: studentData.medical_conditions || '',
        specialRequirements: studentData.special_requirements || '',
        classroom: studentData.classroom || '',
        academicYear: '',
      });
      
    } catch (error) {
      console.error('Error loading student data:', error);
      setError('Failed to load student data');
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StudentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isSuperAdmin) {
      toast.error('Only super administrators can upload profile pictures');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const cloudinaryData = new FormData();
      cloudinaryData.append('file', file);
      cloudinaryData.append('upload_preset', 'profile_upload');
      
      const response = await fetch('https://api.cloudinary.com/v1_1/djbz7wunu/image/upload', {
        method: 'POST',
        body: cloudinaryData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      const photoUrl = result.secure_url;
      
      handleInputChange('photo', photoUrl);
      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // IMPROVED FULL NAME CONSTRUCTION - Remove empty parts and extra spaces
      const nameParts = [
        formData.firstName.trim(),
        formData.middleName.trim(),
        formData.lastName.trim()
      ].filter(part => part.length > 0);
      
      const fullName = nameParts.join(' ');
      
      // Prepare update data
      const updateData = {
        full_name: fullName,
        email: formData.email,
        gender: formData.gender,
        blood_group: formData.bloodGroup,
        date_of_birth: formData.dateOfBirth,
        place_of_birth: formData.placeOfBirth,
        education_level: formData.education_level,
        student_class: formData.student_class,
        stream: formData.stream ? parseInt(formData.stream) : null,
        registration_number: formData.registration_number,
        address: formData.address,
        phone_number: formData.phoneNumber,
        payment_method: formData.paymentMethod,
        medical_conditions: formData.medicalConditions,
        special_requirements: formData.specialRequirements,
        classroom: formData.classroom,
        ...(formData.photo ? { profile_picture: formData.photo } : {}),
      };
      
      console.log('🔍 DEBUG: Submitting student update');
      console.log('🔍 DEBUG: Full name being sent:', fullName);
      console.log('🔍 DEBUG: Name parts - First:', formData.firstName, '| Middle:', formData.middleName, '| Last:', formData.lastName);
      console.log('🔍 DEBUG: Complete update data:', updateData);

      const response = await StudentService.updateStudent(parseInt(id), updateData);
      
      console.log('✅ DEBUG: Update response:', response);
      
      setSuccess('Student updated successfully');
      toast.success('Student updated successfully');
      
      if (onStudentUpdated) {
        onStudentUpdated(student!);
      }
      
      setTimeout(() => {
        navigate('/admin/students');
      }, 1500);
      
    } catch (error) {
      console.error('❌ ERROR: Failed to update student:', error);
      setError('Failed to update student');
      toast.error('Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const getAvailableClassrooms = () => {
    if (!formData.student_class) return [];
    return classroomsByStudentClass[formData.student_class] || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/students')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Students
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Student</h1>
              <p className="text-gray-600 mt-1">
                Update student information {isSuperAdmin ? '(Super Admin Access)' : '(Limited Access)'}
              </p>
            </div>
            
            {student && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Student ID</p>
                <p className="text-lg font-semibold text-gray-900">{student.id}</p>
              </div>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Profile Picture Section */}
          {isSuperAdmin && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Profile Picture
              </h3>
              
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-md">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                      id="photo-upload"
                    />
                    <div className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {formData.photo ? 'Change Photo' : 'Upload Photo'}
                        </>
                      )}
                    </div>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Student Information */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place of Birth
                </label>
                <input
                  type="text"
                  value={formData.placeOfBirth}
                  onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Lagos, Nigeria"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., +2348012345678"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Student's home address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Payment Method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online Payment">Online Payment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education Level *
                </label>
                <select
                  value={formData.education_level}
                  onChange={(e) => handleInputChange('education_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Education Level</option>
                  {educationLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class *
                </label>
                <select
                  value={formData.student_class}
                  onChange={(e) => handleInputChange('student_class', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Class</option>
                  {formData.education_level && studentClassesByLevel[formData.education_level]?.map(cls => (
                    <option key={cls.value} value={cls.value}>{cls.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classroom
                </label>
                <select
                  value={formData.classroom}
                  onChange={(e) => handleInputChange('classroom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Classroom</option>
                  {getAvailableClassrooms().map(classroom => (
                    <option key={classroom} value={classroom}>{classroom}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  value={formData.registration_number}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2024/2025"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stream
                </label>
                <input
                  type="text"
                  value={formData.stream}
                  onChange={(e) => handleInputChange('stream', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Science, Arts, Commercial"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Conditions
                </label>
                <textarea
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any known medical conditions..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requirements
                </label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special requirements or accommodations..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate('/admin/students')}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Access Notice for Non-Super Admins */}
        {!isSuperAdmin && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Limited Access
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>You have limited editing permissions. Only super administrators can upload profile pictures and modify certain sensitive fields.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditStudentForm;