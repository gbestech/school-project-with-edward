import React, { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


// --- Teacher Form Types ---
type TeacherFormData = {
  photo: string | null; // Now stores Cloudinary URL
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  bloodGroup: string;
  dateOfBirth: string;
  placeOfBirth: string;
  academicYear: string;
  employeeId: string;
  address: string;
  email: string;
  phoneNumber: string;
  staffType: string;
  level: string;
  subjects: string[];
  hireDate: string;
  qualification: string;
  specialization: string;
  assignments: Array<{
    grade_level_id: string | number;
    section_id: string;
    subject_ids: string[]; // Changed from subject_id to subject_ids array
  }>;
};


const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Function to create fallback classroom options
const createFallbackClassrooms = (level: string) => {
  const classroomMap: Record<string, string[]> = {
    nursery: ['Pre-Nursery A', 'Pre-Nursery B', 'Pre-Nursery C', 'Nursery 1 A', 'Nursery 1 B', 'Nursery 1 C', 'Nursery 2 A', 'Nursery 2 B', 'Nursery 2 C'],
    primary: ['Primary 1 A', 'Primary 1 B', 'Primary 1 C', 'Primary 2 A', 'Primary 2 B', 'Primary 2 C', 'Primary 3 A', 'Primary 3 B', 'Primary 3 C', 'Primary 4 A', 'Primary 4 B', 'Primary 4 C', 'Primary 5 A', 'Primary 5 B', 'Primary 5 C', 'Primary 6 A', 'Primary 6 B', 'Primary 6 C'],
    junior_secondary: ['JSS 1 A', 'JSS 1 B', 'JSS 1 C', 'JSS 2 A', 'JSS 2 B', 'JSS 2 C', 'JSS 3 A', 'JSS 3 B', 'JSS 3 C'],
    senior_secondary: ['SS 1 A', 'SS 1 B', 'SS 1 C', 'SS 2 A', 'SS 2 B', 'SS 2 C', 'SS 3 A', 'SS 3 B', 'SS 3 C']
  };
  
  const classrooms = classroomMap[level] || [];
  return classrooms.map((name, index) => ({
    id: `${level}-${index + 1}`,
    name: name
  }));
};

// Backend values for education level and student class
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



// --- Teacher Form ---
const AddTeacherForm: React.FC = () => {
  // State for form data and options
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
    employeeId: '',
    address: '',
    email: '',
    phoneNumber: '',
    staffType: 'teaching',
    level: '',
    subjects: [],
    hireDate: '',
    qualification: '',
    specialization: '',
    assignments: [],
  });
    const [loading, setLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [success, setSuccess] = useState<string | null>(null);
            const [teacherUsername, setTeacherUsername] = useState<string | null>(null);
          const [teacherPassword, setTeacherPassword] = useState<string | null>(null);
          const [showPasswordModal, setShowPasswordModal] = useState(false);
          const [subjectOptions, setSubjectOptions] = useState<Array<{ id: string; name: string; education_levels?: string[] }>>([]);
          const [classroomOptions, setClassroomOptions] = useState<Array<{ id: string; name: string }>>([]);
          const [gradeLevelOptions, setGradeLevelOptions] = useState<Array<{ id: string | number; name: string; education_level: string }>>([]);
          const [sectionOptions, setSectionOptions] = useState<Array<{ id: string; name: string; grade_level_id: string | number }>>([]);
          const [currentAssignments, setCurrentAssignments] = useState<Array<{
            id: string;
            classroom_id: string | number;
            subject_id: string;
            is_primary_teacher: boolean;
            periods_per_week: number;
          }>>([]);
  // Load subjects when staff type and level change
  useEffect(() => {
    if (formData.staffType === 'teaching' && formData.level) {
      const levelMap: Record<string, string> = { 
        nursery: 'NURSERY', 
        primary: 'PRIMARY', 
        junior_secondary: 'JUNIOR_SECONDARY',
        senior_secondary: 'SENIOR_SECONDARY'
      };
      
      const educationLevel = levelMap[formData.level];
      if (educationLevel) {
        // Fetch subjects for the selected level
        fetch(`/api/subjects/?education_level=${educationLevel}`)
          .then(res => res.json())
          .then(data => {
            const subjects = Array.isArray(data) ? data : (data.results || []);
            setSubjectOptions(subjects.map((s: any) => ({ id: s.id, name: s.name, education_levels: s.education_levels })));
            // For nursery/primary, auto-select all
            if (formData.level === 'nursery' || formData.level === 'primary') {
              setFormData(prev => ({ ...prev, subjects: subjects.map((s: any) => s.id) }));
            }
          })
          .catch(error => {
            console.error('Error fetching subjects:', error);
            setSubjectOptions([]);
          });
        
        // Fetch classrooms for the selected level
        fetch(`/api/classrooms/classrooms/?section__grade_level__education_level=${educationLevel}`)
          .then(res => {
            if (res.ok) {
              return res.json();
            } else {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
          })
          .then(data => {
            const classrooms = Array.isArray(data) ? data : (data.results || []);
            
            if (classrooms && classrooms.length > 0) {
              // Use existing classrooms with better display names and remove duplicates
              const uniqueClassrooms = new Map();
              classrooms.forEach((c: any) => {
                const displayName = c.grade_level_name && c.section_name ? 
                  `${c.grade_level_name} ${c.section_name}` : 
                  c.name || 'Unnamed Classroom';
                
                // Use display name as key to prevent duplicates
                if (!uniqueClassrooms.has(displayName)) {
                  uniqueClassrooms.set(displayName, {
                    id: c.id,
                    name: displayName
                  });
                }
              });
              
              setClassroomOptions(Array.from(uniqueClassrooms.values()));
            } else {
              // Create fallback classroom options based on the level
              const fallbackClassrooms = createFallbackClassrooms(formData.level);
              setClassroomOptions(fallbackClassrooms);
            }
          })
          .catch(error => {
            console.error('Error fetching classrooms:', error);
            // Create fallback classroom options
            const fallbackClassrooms = createFallbackClassrooms(formData.level);
            setClassroomOptions(fallbackClassrooms);
          });
      } else {
        setClassroomOptions([]);
      }
    } else {
      setSubjectOptions([]);
      setClassroomOptions([]);
      setFormData(prev => ({ ...prev, subjects: [] }));
    }
  }, [formData.staffType, formData.level]);

  // Load grade levels for assignment selection - filtered by selected level
  useEffect(() => {
    if (formData.staffType === 'teaching' && formData.level) {
      const levelMap: Record<string, string> = { 
        nursery: 'NURSERY', 
        primary: 'PRIMARY', 
        junior_secondary: 'JUNIOR_SECONDARY',
        senior_secondary: 'SENIOR_SECONDARY'
      };
      
      const educationLevel = levelMap[formData.level];
      if (educationLevel) {
        fetch(`/api/classrooms/grades/?education_level=${educationLevel}`)
          .then(res => {
            return res.json();
          })
          .then(data => {
            const gradeLevels = Array.isArray(data) ? data : (data.results || []);
            
            if (gradeLevels && gradeLevels.length > 0) {
              setGradeLevelOptions(gradeLevels.map((gl: any) => ({ 
                id: gl.id, 
                name: gl.name, 
                education_level: gl.education_level 
              })));
            } else {
              setGradeLevelOptions([]);
            }
          })
          .catch(error => {
            console.error('Error fetching grade levels:', error);
            setGradeLevelOptions([]);
          });
      }
    }
  }, [formData.staffType, formData.level]);

  // Check if current level is secondary (allows multiple assignments)
  const isSecondaryLevel = formData.level === 'junior_secondary' || formData.level === 'senior_secondary';
  const isPrimaryLevel = formData.level === 'nursery' || formData.level === 'primary';

  // Auto-create assignment for primary/nursery levels
  useEffect(() => {
    if (isPrimaryLevel && currentAssignments.length === 0) {
      addAssignment();
    }
  }, [isPrimaryLevel, currentAssignments.length]);

  // Load sections when grade level changes
  const loadSectionsForGradeLevel = (gradeLevelId: string | number, assignmentId?: string) => {
    if (!gradeLevelId) {
      if (assignmentId) {
        // Update specific assignment's sections
        setCurrentAssignments(prev => 
          prev.map(assignment => 
            assignment.id === assignmentId 
              ? { ...assignment, sectionOptions: [] }
              : assignment
          )
        );
      } else {
        // Update global sections (for primary/nursery)
        setSectionOptions([]);
      }
      return;
    }
    
    fetch(`/api/classrooms/sections/?grade_level=${gradeLevelId}`)
      .then(res => {
        return res.json();
      })
      .then(data => {
        const sections = Array.isArray(data.results) ? data.results : data;
        
        if (sections && sections.length > 0) {
          const mappedSections = sections.map((s: any) => ({ 
            id: s.id, 
            name: s.name, 
            grade_level_id: typeof s.grade_level === 'object' ? s.grade_level.id : s.grade_level
          }));
          
          if (assignmentId) {
            // Update specific assignment's sections
            setCurrentAssignments(prev => 
              prev.map(assignment => 
                assignment.id === assignmentId 
                  ? { ...assignment, sectionOptions: mappedSections }
                  : assignment
              )
            );
          } else {
            // Update global sections (for primary/nursery)
            setSectionOptions(mappedSections);
          }
        } else {
          if (assignmentId) {
            setCurrentAssignments(prev => 
              prev.map(assignment => 
                assignment.id === assignmentId 
                  ? { ...assignment, sectionOptions: [] }
                  : assignment
              )
            );
          } else {
            setSectionOptions([]);
          }
        }
      })
      .catch(error => {
        console.error('Error fetching sections:', error);
        if (assignmentId) {
          setCurrentAssignments(prev => 
            prev.map(assignment => 
              assignment.id === assignmentId 
                ? { ...assignment, sectionOptions: [] }
                : assignment
            )
          );
        } else {
          setSectionOptions([]);
        }
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    setFormData(prev => {
      const newSubjects = checked 
        ? [...prev.subjects, subjectId]
        : prev.subjects.filter(id => id !== subjectId);
      
      return {
        ...prev,
        subjects: newSubjects
      };
    });
  };

  // Assignment management functions
  const addAssignment = () => {
    const newAssignment = {
      id: Date.now().toString(),
      classroom_id: '',
      subject_id: '',
      is_primary_teacher: false,
      periods_per_week: 1,
    };
    setCurrentAssignments(prev => {
      const updated = [...prev, newAssignment];
      return updated;
    });
  };

  // Add multiple assignments for secondary teachers
  const addMultipleAssignments = (gradeLevelIds: (string | number)[]) => {
    const newAssignments = gradeLevelIds.map(gradeLevelId => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      grade_level_id: gradeLevelId,
      section_id: '',
      subject_ids: [],
      sectionOptions: [], // Initialize empty sections
    }));
    
    setCurrentAssignments(prev => {
      const updated = [...prev, ...newAssignments];
      return updated;
    });

    // Load sections for each new assignment
    newAssignments.forEach(assignment => {
      loadSectionsForGradeLevel(assignment.grade_level_id, assignment.id);
    });
  };

  const removeAssignment = (assignmentId: string) => {
    setCurrentAssignments(prev => prev.filter(a => a.id !== assignmentId));
  };

  const updateAssignment = (assignmentId: string, field: string, value: string | string[] | number) => {
    setCurrentAssignments(prev => 
      prev.map(assignment => {
        if (assignment.id === assignmentId) {
          const updatedAssignment = { ...assignment, [field]: value };
          
          // If grade level changed, reset section and load new sections
          if (field === 'grade_level_id') {
            updatedAssignment.section_id = '';
            updatedAssignment.subject_ids = [];
            // Load sections for the new grade level - pass assignmentId for secondary
            if (isSecondaryLevel) {
              loadSectionsForGradeLevel(value as string | number, assignmentId);
            } else {
              loadSectionsForGradeLevel(value as string | number);
            }
          }
          
          // If section changed, reset subjects
          if (field === 'section_id') {
            updatedAssignment.subject_ids = [];
          }
          
          return updatedAssignment;
        }
        return assignment;
      })
    );
  };

  // Handle subject selection in assignments
  const handleAssignmentSubjectChange = (assignmentId: string, subjectId: string, checked: boolean) => {
    setCurrentAssignments(prev => 
      prev.map(assignment => {
        if (assignment.id === assignmentId) {
          const newSubjectIds = [...assignment.subject_ids];
          if (checked) {
            newSubjectIds.push(subjectId);
          } else {
            newSubjectIds.splice(newSubjectIds.indexOf(subjectId), 1);
          }
          return { ...assignment, subject_ids: newSubjectIds };
        }
        return assignment;
      })
    );
  };

  // Get subjects for a specific grade level
  const getSubjectOptionsForGradeLevel = (gradeLevelId: string) => {
    if (!gradeLevelId) return [];
    
    const gradeLevel = gradeLevelOptions.find(gl => gl.id === gradeLevelId);
    if (!gradeLevel) return [];
    
    // Filter subjects based on the grade level's education level
    return subjectOptions.filter(subject => {
      // For now, return all subjects since we're already filtering by level
      // In the future, you might want to add subject-grade level relationships
      return true;
    });
  };

  const [uploading, setUploading] = useState(false); // For Cloudinary upload status
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        // Upload to Cloudinary
        const cloudinaryData = new FormData();
        cloudinaryData.append('file', file);
        cloudinaryData.append('upload_preset', 'profile_upload');
        
        const res = await axios.post('https://api.cloudinary.com/v1_1/djbz7wunu/image/upload', cloudinaryData);
        const imageUrl = res.data.secure_url;
        
        setFormData(prev => ({ ...prev, photo: imageUrl })); // Store Cloudinary URL
        setPhotoPreview(imageUrl); // Use Cloudinary URL for preview after upload
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        toast.error('Failed to upload image');
      } finally {
        setUploading(false);
      }
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
    try {
      // Prepare assignments data based on educational level
      let assignments = [];
      
      if (isPrimaryLevel) {
        // For primary/nursery: Ensure there's one assignment with classroom selected
        if (currentAssignments.length > 0 && currentAssignments[0]?.grade_level_id && currentAssignments[0]?.section_id) {
          assignments = [{
            grade_level_id: currentAssignments[0].grade_level_id,
            section_id: currentAssignments[0].section_id,
            subject_ids: formData.subjects // All selected subjects for the classroom
          }];
        } else {
          // No classroom selected for primary/nursery
          toast.error('Please select a classroom for this teacher');
          setLoading(false);
          return;
        }
      } else {
        // For secondary: Use specific assignments
        assignments = currentAssignments
          .filter(a => a.classroom_id && a.subject_id) // Filter out assignments without classroom or subject
          .map(a => ({
            classroom_id: a.classroom_id,
            subject_id: a.subject_id,
            is_primary_teacher: a.is_primary_teacher || false,
            periods_per_week: a.periods_per_week || 1
          }));
      }

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
        employee_id: formData.employeeId,
        address: formData.address,
        phone_number: formData.phoneNumber,
        photo: formData.photo,
        staff_type: formData.staffType,
        level: formData.level,
        subjects: formData.subjects,
        hire_date: formData.hireDate,
        qualification: formData.qualification,
        specialization: formData.specialization,
        assignments: assignments,
      };
      const response = await api.post('/api/teachers/teachers/', payload);
      console.log('🔍 Teacher creation response:', response);
      setSuccess('Teacher created successfully!');
      toast.success('Teacher added successfully');
      
      // Show popup with credentials if available
      if (response) {
        // Extract credentials from the response structure
        const username = response.user_username;
        const password = response.user_password;
        
        console.log('🔍 Extracted credentials:', { username, password });
        
        if (username && password) {
          console.log('✅ Setting credentials and showing modal');
          setTeacherUsername(username);
          setTeacherPassword(password);
          setShowPasswordModal(true);
        } else {
          console.log('❌ No credentials found in response');
          // Show success message even without credentials
          toast.info('Teacher created successfully! Check admin panel for credentials.');
        }
        
        // Check for assigned subjects in the response
        if (response.assigned_subjects) {
          // The assigned_subjects are now part of the assignments array, so we don't need a separate state for them here.
          // The assignments state itself contains the subject_ids.
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
          employeeId: '',
          address: '',
          email: '',
          phoneNumber: '',
          staffType: 'teaching',
          level: '',
          subjects: [],
          hireDate: '',
          qualification: '',
          specialization: '',
          assignments: [],
        });
        setCurrentAssignments([]);
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
                          {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Teacher" className="w-20 h-20 object-cover rounded" />
                  <button onClick={removePhoto} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"><X size={12} /></button>
                </div>
              ) : (<User size={32} className="text-gray-400" />)}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="teacher-photo" disabled={uploading} />
            <label htmlFor="teacher-photo" className={`px-4 py-2 rounded text-sm cursor-pointer transition-colors ${uploading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {uploading ? 'Uploading...' : 'Choose File'}
            </label>
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
              <option value="junior_secondary">Junior Secondary</option>
              <option value="senior_secondary">Senior Secondary</option>
            </select>
          </div>
        )}
        {/* Subjects (only for teaching) */}
        {formData.staffType === 'teaching' && formData.level && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Available Subjects*</label>
              {subjectOptions.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allSubjectIds = subjectOptions.map(s => s.id);
                      setFormData(prev => ({
                        ...prev,
                        subjects: allSubjectIds,
                      }));
                    }}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        subjects: [],
                      }));
                    }}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
            {subjectOptions.length === 0 ? (
              <div className="bg-gray-50 p-3 rounded border">
                <span className="text-gray-500">No subjects found for this level.</span>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subjectOptions
                    // Filter: Only show subjects that include the selected education level
                    .filter(subj => {
                      const levelMap: Record<string, string> = { nursery: 'NURSERY', primary: 'PRIMARY', junior_secondary: 'JUNIOR_SECONDARY', senior_secondary: 'SENIOR_SECONDARY' };
                      const levelKey = formData.level as keyof typeof levelMap;
                      const educationLevel = levelMap[levelKey] || formData.level;
                      return subj.education_levels && subj.education_levels.includes(educationLevel);
                    })
                    // Remove duplicates by name+education_levels
                    .filter((subj, idx, arr) =>
                      arr.findIndex(s => s.name === subj.name && JSON.stringify(s.education_levels) === JSON.stringify(subj.education_levels)) === idx
                    )
                    .map(subj => (
                      <label key={subj.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-3 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.subjects.includes(subj.id)}
                          onChange={(e) => handleSubjectChange(subj.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700 font-medium">{subj.name}</span>
                        {/* Show education level badge */}
                        <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                          {subj.education_levels && subj.education_levels.length > 0
                            ? subj.education_levels.map(lvl => {
                                if (lvl === 'NURSERY') return 'Nursery';
                                if (lvl === 'PRIMARY') return 'Primary';
                                if (lvl === 'JUNIOR_SECONDARY') return 'Jnr Sec.';
                                if (lvl === 'SENIOR_SECONDARY') return 'Snr Sec.';
                                return lvl;
                              }).join(', ')
                            : 'Unknown'}
                        </span>
                      </label>
                    ))}
                </div>
                {subjectOptions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Selected: {formData.subjects.length} of {subjectOptions.length} subjects
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Multiple Assignments Section */}
        {formData.staffType === 'teaching' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {isPrimaryLevel ? 'Classroom Assignment' : 'Subject Assignments'}
              </label>
              {isSecondaryLevel && (
                <button
                  type="button"
                  onClick={addAssignment}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <span>+</span>
                  Add Assignment
                </button>
              )}
            </div>
            
            {isPrimaryLevel ? (
              // Primary/Nursery: Single classroom assignment
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Grade Level Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                    <select
                      value={currentAssignments[0]?.grade_level_id || ''}
                      onChange={(e) => {
                        if (currentAssignments.length === 0) {
                          addAssignment();
                        }
                        updateAssignment(currentAssignments[0]?.id || '', 'grade_level_id', e.target.value);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Grade Level</option>
                      {gradeLevelOptions.map(gl => (
                        <option key={gl.id} value={gl.id}>
                          {gl.name} ({gl.education_level.replace('_', ' ')})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                    <select
                      value={currentAssignments[0]?.section_id || ''}
                      onChange={(e) => {
                        if (currentAssignments.length === 0) {
                          addAssignment();
                        }
                        updateAssignment(currentAssignments[0]?.id || '', 'section_id', e.target.value);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      disabled={!currentAssignments[0]?.grade_level_id}
                    >
                      <option value="">Select Section</option>
                      {sectionOptions
                        .filter(s => s.grade_level_id == currentAssignments[0]?.grade_level_id)
                        .map(section => (
                          <option key={section.id} value={section.id}>
                            {section.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> This teacher will be assigned to teach all selected subjects in the specified class.
                  </p>
                </div>
              </div>
            ) : (
              // Secondary: Multiple subject assignments with enhanced class selection
              <>
                {/* Class Selection Summary for Secondary */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">Secondary Teacher Assignment</h4>
                  <p className="text-xs text-blue-600">
                    For secondary teachers, you can assign subjects across multiple classes. Add assignments for each class-subject combination.
                  </p>
                </div>

                {/* Quick Class Selection for Secondary */}
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Class Selection</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Junior Secondary Quick Selection */}
                    {formData.level === 'junior_secondary' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            // Add assignments for JSS1, JSS2, JSS3
                            const jssGradeLevels = gradeLevelOptions.filter(gl => 
                              gl.education_level === 'JUNIOR_SECONDARY' && 
                              ['JSS1', 'JSS2', 'JSS3'].some(name => gl.name.includes(name))
                            );
                            const gradeLevelIds = jssGradeLevels.map(gl => gl.id);
                            addMultipleAssignments(gradeLevelIds);
                          }}
                          className="p-3 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors border border-green-300"
                        >
                          Add JSS1, JSS2, JSS3
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Add assignments for all JSS classes
                            const jssGradeLevels = gradeLevelOptions.filter(gl => 
                              gl.education_level === 'JUNIOR_SECONDARY'
                            );
                            const gradeLevelIds = jssGradeLevels.map(gl => gl.id);
                            addMultipleAssignments(gradeLevelIds);
                          }}
                          className="p-3 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-300"
                        >
                          Add All JSS Classes
                        </button>
                      </>
                    )}

                    {/* Senior Secondary Quick Selection */}
                    {formData.level === 'senior_secondary' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            // Add assignments for SS1, SS2, SS3
                            const ssGradeLevels = gradeLevelOptions.filter(gl => 
                              gl.education_level === 'SENIOR_SECONDARY' && 
                              ['SS1', 'SS2', 'SS3'].some(name => gl.name.includes(name))
                            );
                            const gradeLevelIds = ssGradeLevels.map(gl => gl.id);
                            addMultipleAssignments(gradeLevelIds);
                          }}
                          className="p-3 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors border border-green-300"
                        >
                          Add SS1, SS2, SS3
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Add assignments for all SS classes
                            const ssGradeLevels = gradeLevelOptions.filter(gl => 
                              gl.education_level === 'SENIOR_SECONDARY'
                            );
                            const gradeLevelIds = ssGradeLevels.map(gl => gl.id);
                            addMultipleAssignments(gradeLevelIds);
                          }}
                          className="p-3 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-300"
                        >
                          Add All SS Classes
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Assignment Summary for Secondary */}
                {currentAssignments.length > 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-yellow-700">Current Assignments ({currentAssignments.length})</h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Assign all selected subjects to all assignments
                            const allSubjectIds = formData.subjects;
                            setCurrentAssignments(prev => 
                              prev.map(assignment => ({
                                ...assignment,
                                subject_ids: allSubjectIds
                              }))
                            );
                          }}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                        >
                          Assign All Subjects
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentAssignments([])}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {currentAssignments.map((assignment, index) => {
                        const classroom = classroomOptions.find(c => c.id == assignment.classroom_id);
                        const subject = subjectOptions.find(s => s.id == assignment.subject_id);
                        
                        return (
                          <div key={assignment.id} className="text-xs bg-white p-2 rounded border">
                            <div className="font-medium text-gray-700">
                              {classroom ? classroom.name : 'No Classroom'}
                            </div>
                            <div className="text-gray-600">
                              {subject ? subject.name : 'No Subject'}
                            </div>
                            <div className="text-green-600">
                              {assignment.is_primary_teacher ? 'Primary Teacher' : 'Subject Teacher'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentAssignments.length === 0 ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-500 text-sm text-center">
                      No assignments added yet. Use the quick selection buttons above or click "Add Assignment" to assign subjects to specific classes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentAssignments.map((assignment, index) => (
                      <div key={assignment.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">Assignment {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeAssignment(assignment.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* Classroom Selection */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Classroom</label>
                            <select
                              value={assignment.classroom_id}
                              onChange={(e) => updateAssignment(assignment.id, 'classroom_id', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            >
                              <option value="">Select Classroom</option>
                              {classroomOptions.map(classroom => (
                                <option key={classroom.id} value={classroom.id}>
                                  {classroom.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Subject Selection */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                            <select
                              value={assignment.subject_id}
                              onChange={(e) => updateAssignment(assignment.id, 'subject_id', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            >
                              <option value="">Select Subject</option>
                              {subjectOptions.map(subject => (
                                <option key={subject.id} value={subject.id}>
                                  {subject.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Periods per Week */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Periods per Week</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={assignment.periods_per_week}
                              onChange={(e) => updateAssignment(assignment.id, 'periods_per_week', parseInt(e.target.value) || 1)}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                          </div>

                          {/* Primary Teacher Checkbox */}
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`primary-${assignment.id}`}
                              checked={assignment.is_primary_teacher}
                              onChange={(e) => updateAssignment(assignment.id, 'is_primary_teacher', e.target.checked)}
                              className="rounded border-gray-300 mr-2"
                            />
                            <label htmlFor={`primary-${assignment.id}`} className="text-xs font-medium text-gray-600 cursor-pointer">
                              Primary Teacher
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {/* Assigned Subjects (after creation) */}
        {/* The assigned_subjects are now part of the assignments array, so we don't need a separate state for them here.
            The assignments state itself contains the subject_ids. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Email*</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="teacher@example.com" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number*</label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="+2341234567890" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Hire Date*</label><input type="date" name="hireDate" value={formData.hireDate} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Employee ID*</label><input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="EMP001" /></div>
        </div>
        <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Address*</label><textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Teacher address..." /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Academic Qualification*</label><input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g., B.Sc. Mathematics, M.Ed. Education" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Area of Specialization*</label><input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g., Mathematics, Science, English" /></div>
        </div>
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