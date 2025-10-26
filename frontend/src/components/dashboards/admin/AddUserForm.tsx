// import React, { useState, useEffect } from 'react';
// import { User, X } from 'lucide-react';
// import api from '@/services/api';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useNavigate } from 'react-router-dom';
// import { triggerDashboardRefresh } from '@/hooks/useDashboardRefresh';

// // --- Student Form Types ---
// type StudentFormData = {
//   photo: string | null; // Now stores Cloudinary URL
//   firstName: string;
//   middleName: string;
//   lastName: string;
//   email: string; // <-- Add this line
//   gender: string;
//   bloodGroup: string;
//   dateOfBirth: string;
//   placeOfBirth: string;
//   academicYear: string;
//   education_level: string;
//   student_class: string;
//   stream: string; // <-- Add stream field
//   registration_number: string; // <-- Add registration number
//   existing_parent_id: string;
//   parentFirstName: string;
//   parentLastName: string;
//   parentEmail: string;
//   parentPhoneNumber: string;
//   parentAddress: string;
//   address: string;
//   phoneNumber: string;
//   paymentMethod: string;
//   medicalConditions: string;
//   specialRequirements: string;
//   relationship: string; // <-- Add this line
//   isPrimaryContact: boolean; // <-- Add this line
//   classroom: string;
// };



// const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
// // Backend values for education level and student class
// const educationLevels = [
//   { value: 'NURSERY', label: 'Nursery' },
//   { value: 'PRIMARY', label: 'Primary' },
//   { value: 'JUNIOR_SECONDARY', label: 'Junior Secondary' },
//   { value: 'SENIOR_SECONDARY', label: 'Senior Secondary' },
// ];
// const studentClassesByLevel: Record<string, { value: string; label: string }[]> = {
//   NURSERY: [
//     { value: 'PRE_NURSERY', label: 'Pre-nursery' },
//     { value: 'NURSERY_1', label: 'Nursery 1' },
//     { value: 'NURSERY_2', label: 'Nursery 2' },
//   ],
//   PRIMARY: [
//     { value: 'PRIMARY_1', label: 'Primary 1' },
//     { value: 'PRIMARY_2', label: 'Primary 2' },
//     { value: 'PRIMARY_3', label: 'Primary 3' },
//     { value: 'PRIMARY_4', label: 'Primary 4' },
//     { value: 'PRIMARY_5', label: 'Primary 5' },
//     { value: 'PRIMARY_6', label: 'Primary 6' },
//   ],
//   JUNIOR_SECONDARY: [
//     { value: 'JSS_1', label: 'Junior Secondary 1 (JSS1)' },
//     { value: 'JSS_2', label: 'Junior Secondary 2 (JSS2)' },
//     { value: 'JSS_3', label: 'Junior Secondary 3 (JSS3)' },
//   ],
//   SENIOR_SECONDARY: [
//     { value: 'SS_1', label: 'Senior Secondary 1 (SS1)' },
//     { value: 'SS_2', label: 'Senior Secondary 2 (SS2)' },
//     { value: 'SS_3', label: 'Senior Secondary 3 (SS3)' },
//   ],
// };
// // Map student_class to valid classrooms
// const classroomsByStudentClass: Record<string, string[]> = {
//   // Nursery
//   PRE_NURSERY: ['Pre-Nursery A', 'Pre-Nursery B'],
//   NURSERY_1: ['Nursery 1 A', 'Nursery 1 B'],
//   NURSERY_2: ['Nursery 2 A', 'Nursery 2 B'],
//   // Primary
//   PRIMARY_1: ['Primary 1 A', 'Primary 1 B'],
//   PRIMARY_2: ['Primary 2 A', 'Primary 2 B'],
//   PRIMARY_3: ['Primary 3 A', 'Primary 3 B'],
//   PRIMARY_4: ['Primary 4 A', 'Primary 4 B'],
//   PRIMARY_5: ['Primary 5 A', 'Primary 5 B'],
//   PRIMARY_6: ['Primary 6 A', 'Primary 6 B'],
//   // Junior Secondary
//   JSS_1: ['JSS1 A', 'JSS1 B'],
//   JSS_2: ['JSS2 A', 'JSS2 B'],
//   JSS_3: ['JSS3 A', 'JSS3 B'],
//   // Senior Secondary
//   SS_1: ['SS1 A', 'SS1 B'],
//   SS_2: ['SS2 A', 'SS2 B'],
//   SS_3: ['SS3 A', 'SS3 B'],
// };

// // --- Student Form ---
// interface AddStudentFormProps {
//   onStudentAdded?: () => void;
// }

// const AddStudentForm: React.FC<AddStudentFormProps> = ({ onStudentAdded }) => {
//   const [formData, setFormData] = useState<StudentFormData>({
//     photo: null,
//     firstName: '',
//     middleName: '',
//     lastName: '',
//     email: '', // <-- Add this line
//     gender: '',
//     bloodGroup: '',
//     dateOfBirth: '',
//     placeOfBirth: '',
//     academicYear: '',
//     education_level: '',
//     student_class: '',
//     stream: '', // <-- Add stream field
//     registration_number: '', // <-- Add registration number
//     existing_parent_id: '',
//     parentFirstName: '',
//     parentLastName: '',
//     parentEmail: '',
//     parentPhoneNumber: '',
//     parentAddress: '',
//     address: '',
//     phoneNumber: '',
//     paymentMethod: '',
//     medicalConditions: '',
//     specialRequirements: '',
//     relationship: '', // <-- Add this line
//     isPrimaryContact: false, // <-- Add this line
//     classroom: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//         const [studentPassword, setStudentPassword] = useState<string | null>(null);
//       const [parentPassword, setParentPassword] = useState<string | null>(null);
//       const [showPasswordModal, setShowPasswordModal] = useState(false);
//       const [studentUsername, setStudentUsername] = useState<string | null>(null);
//       const [parentUsername, setParentUsername] = useState<string | null>(null);
//   const [parentSearch, setParentSearch] = useState('');
//   const [parentOptions, setParentOptions] = useState<any[]>([]);
//   const [parentSearchLoading, setParentSearchLoading] = useState(false);
//   const [selectedParent, setSelectedParent] = useState<any | null>(null);
//   const navigate = useNavigate();
//   const [parentUsernameSearch, setParentUsernameSearch] = useState('');
//   const [parentDetails, setParentDetails] = useState<any | null>(null);
//   const [useParentEmail, setUseParentEmail] = useState(false); // <-- Add this line
//   const [uploading, setUploading] = useState(false); // For Cloudinary upload status
//   const [photoPreview, setPhotoPreview] = useState<string | null>(null); // For preview
//   const [streams, setStreams] = useState<any[]>([]); // For stream options

//   // Handler for searching parent by username
//   const handleParentUsernameSearch = async () => {
//     if (!parentUsernameSearch) return;
//     try {
//       console.log('Searching for parent with username:', parentUsernameSearch);
//       const res = await api.get(`/api/parents/search/?q=${encodeURIComponent(parentUsernameSearch)}`);
//       console.log('Search response:', res);
      
//       // The API service returns data directly, not in res.data
//       const parentData = Array.isArray(res) ? res : [];
//       console.log('Parent data array:', parentData);
      
//       // Find the parent by username (exact match or partial match)
//       const found = parentData.find((p: any) => 
//         p.username === parentUsernameSearch || 
//         p.username.includes(parentUsernameSearch) ||
//         p.username.toLowerCase().includes(parentUsernameSearch.toLowerCase())
//       );
//       console.log('Found parent:', found);
      
//       if (found) {
//         setParentDetails(found);
//         setSelectedParent(found);
//         setParentUsernameSearch(found.username); // Update with exact username
//         toast.success('Parent found and details filled!');
//       } else {
//         toast.error('Parent not found. Please check the username or add the parent first.');
//         setTimeout(() => navigate('/admin/parents/add'), 1500);
//       }
//     } catch (err) {
//       console.error('Error searching for parent:', err);
//       toast.error('Error searching for parent.');
//     }
//   };

//   useEffect(() => {
//     if (parentSearch.length < 2) {
//       setParentOptions([]);
//       return;
//     }
//     setParentSearchLoading(true);
//     api.get(`/api/parents/search/?q=${encodeURIComponent(parentSearch)}`)
//       .then(res => {
//         console.log('Parent search response:', res);
//         setParentOptions(res || []);
//       })
//       .catch((err) => {
//         console.error('Parent search error:', err);
//         setParentOptions([]);
//       })
//       .finally(() => setParentSearchLoading(false));
//   }, [parentSearch]);

//   useEffect(() => {
//     if (useParentEmail && (selectedParent || parentDetails)) {
//       const parentEmail = selectedParent?.email || parentDetails?.email || '';
//       setFormData(prev => ({ ...prev, email: parentEmail }));
//     }
//   }, [useParentEmail, selectedParent, parentDetails]);

//   // Fetch streams for Senior Secondary students
//   useEffect(() => {
//       console.log("🔍 useEffect for fetching streams ran");
//     const fetchStreams = async () => {
//       try {
//         const response = await api.get('/api/classrooms/streams/');
//         // const response = await api.get('/api/classrooms/streams/');
//          console.log("Fetched streams response:", response);
//         setStreams(response || []);
//         // setStreams(response.data || []);
//       } catch (error) {
//         console.error('Error fetching streams:', error);
//         setStreams([]);
//       }
//     };
     
//     fetchStreams();
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;
//     if (type === 'checkbox' && 'checked' in e.target) {
//       setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files && e.target.files[0];
//     if (!file) return;
//     setUploading(true);
//     // For preview
//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       setPhotoPreview(ev.target?.result as string);
//     };
//     reader.readAsDataURL(file);
//     // Upload to Cloudinary
//     const cloudinaryData = new FormData();
//     cloudinaryData.append('file', file);
//     cloudinaryData.append('upload_preset', 'profile_upload');
//     try {
//       const res = await axios.post('https://api.cloudinary.com/v1_1/djbz7wunu/image/upload', cloudinaryData);
//       const imageUrl = res.data.secure_url;
//       setFormData(prev => ({ ...prev, photo: imageUrl }));
//       setPhotoPreview(imageUrl); // Use Cloudinary URL for preview after upload
//     } catch (err) {
//       toast.error('Image upload failed. Please try again.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const removePhoto = () => {
//     setFormData(prev => ({ ...prev, photo: null }));
//     setPhotoPreview(null);
//   };

//   const handleSave = async () => {
//     setLoading(true);
//           setError(null);
//       setSuccess(null);
//       setStudentPassword(null);
//       setParentPassword(null);
//       setShowPasswordModal(false);
//     try {
//       // Debugging: Log the photo and payload
//       console.log('profile_picture to send:', formData.photo);
//       // Map formData to backend expected fields
//       const payload: any = {
//         user_email: formData.email,
//         user_first_name: formData.firstName,
//         user_middle_name: formData.middleName,
//         user_last_name: formData.lastName,
//         gender: formData.gender,
//         blood_group: formData.bloodGroup,
//         date_of_birth: formData.dateOfBirth,
//         place_of_birth: formData.placeOfBirth,
//         academic_year: formData.academicYear,
//         education_level: formData.education_level,
//         student_class: formData.student_class,
//         stream: formData.stream ?? null,
//         registration_number: formData.registration_number,
//         classroom: formData.classroom,
//         address: formData.address,
//         phone_number: formData.phoneNumber,
//         payment_method: formData.paymentMethod,
//         medical_conditions: formData.medicalConditions,
//         special_requirements: formData.specialRequirements,
//         profile_picture: formData.photo, // Now a Cloudinary URL
//         relationship: formData.relationship,
//         is_primary_contact: formData.isPrimaryContact,
//       };
//       console.log('payload:', payload);
      
//       // Validate stream selection for Senior Secondary students
//       if (formData.education_level === 'SENIOR_SECONDARY' && !formData.stream) {
//         setError('Stream selection is required for Senior Secondary students');
//         setLoading(false);
//         return;
//       }
      
//       if (selectedParent) {
//         payload.existing_parent_id = selectedParent.id;
//       } else {
//         payload.parent_first_name = formData.parentFirstName;
//         payload.parent_last_name = formData.parentLastName;
//         payload.parent_email = formData.parentEmail;
//         payload.parent_contact = formData.parentPhoneNumber;
//         payload.parent_address = formData.parentAddress;
//       }
//       // Send as JSON (no FormData)
//       const response = await api.post('/api/students/students/', payload);
//       setSuccess('Student and Parent created successfully!');
//       toast.success('Student and Parent added successfully');
      
//       // Trigger dashboard refresh to update recent students
//       triggerDashboardRefresh();
      
//       // Call the callback to refresh dashboard data
//       if (onStudentAdded) {
//         onStudentAdded();
//       }
      
//       if (response) {
//         setStudentUsername(response.student_username);
//         setStudentPassword(response.student_password);
//         setParentUsername(response.parent_username);
//         setParentPassword(response.parent_password);
//         setShowPasswordModal(true);
//       }
//       setTimeout(() => {
//         setLoading(false);
//         setFormData({
//           photo: null,
//           firstName: '',
//           middleName: '',
//           lastName: '',
//           email: '', // <-- Add this line
//           gender: '',
//           bloodGroup: '',
//           dateOfBirth: '',
//           placeOfBirth: '',
//           academicYear: '',
//           education_level: '',
//           student_class: '',
//           stream: '',
//           registration_number: '', // <-- Add registration number
//           existing_parent_id: '',
//           parentFirstName: '',
//           parentLastName: '',
//           parentEmail: '',
//           parentPhoneNumber: '',
//           parentAddress: '',
//           address: '',
//           phoneNumber: '',
//           paymentMethod: '',
//           medicalConditions: '',
//           specialRequirements: '',
//           relationship: '', // <-- Add this line
//           isPrimaryContact: false, // <-- Add this line
//           classroom: '',
//         });
//       }, 1200);
//     } catch (err: any) {
//       setError(err.response?.data?.detail || 'Failed to create student');
//       toast.error('Cannot add student');
//       setLoading(false);
//     }
//   };

//   const filteredStudentClasses = formData.education_level ? studentClassesByLevel[formData.education_level] : [];
//   const filteredClassrooms = formData.student_class ? classroomsByStudentClass[formData.student_class] || [] : [];

//   return (
//     <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
//       <div className="p-6 border-b border-gray-200">
//         <h2 className="text-xl font-semibold text-gray-800">Add New Student</h2>
//       </div>
//       <div className="p-6">
//             {/* Photo Upload */}
//         <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Photo*</label>
//               <div className="flex flex-col items-center">
//                 <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-3 bg-gray-50">
//   {photoPreview ? (
//     <div className="relative">
//       <img src={photoPreview} alt="Student" className="w-20 h-20 object-cover rounded" />
//       <button onClick={removePhoto} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"><X size={12} /></button>
//     </div>
//   ) : (<User size={32} className="text-gray-400" />)}
// </div>
// {uploading && <div className="text-sm text-blue-600">Uploading image...</div>}
//             <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="student-photo" />
//             <label htmlFor="student-photo" className="bg-blue-600 text-white px-4 py-2 rounded text-sm cursor-pointer hover:bg-blue-700 transition-colors">Choose File</label>
//             <button onClick={removePhoto} className="text-red-500 text-sm mt-2 hover:text-red-700">Remove</button>
//           </div>
//               </div>
//         {/* Name Fields */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//           <div><label className="block text-sm font-medium text-gray-700 mb-2">First Name*</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="First name" /></div>
//           <div><label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label><input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Middle name" /></div>
//           <div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name*</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Last name" /></div>
//             </div>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//           <div><label className="block text-sm font-medium text-gray-700 mb-2">Gender*</label><select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Select Gender</option><option value="M">Male</option><option value="F">Female</option></select></div>
//           <div><label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label><select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Select Blood Group</option>{bloodGroups.map(group => (<option key={group} value={group}>{group}</option>))}</select></div>
//           <div><label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth*</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" /></div>
//             </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <div><label className="block text-sm font-medium text-gray-700 mb-2">Place of Birth*</label><input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Lagos, Nigeria" /></div>
//           <div><label className="block text-sm font-medium text-gray-700 mb-2">Academic Year*</label><input type="text" name="academicYear" value={formData.academicYear} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="2024/2025" /></div>
//           </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//             <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Education Level*</label>
//             <select name="education_level" value={formData.education_level || ''} onChange={e => {
//               handleInputChange(e);
//               setFormData(prev => ({ ...prev, student_class: '', classroom: '', stream: '' })); // Reset class, classroom, and stream
//             }} className="w-full p-3 border border-gray-300 rounded-lg">
//               <option value="">Select Level</option>
//               {educationLevels.map(level => (
//                 <option key={level.value} value={level.value}>{level.label}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Student Class*</label>
//             <select name="student_class" value={formData.student_class || ''} onChange={e => {
//               handleInputChange(e);
//               setFormData(prev => ({ ...prev, classroom: '', stream: '' })); // Reset classroom and stream
//             }} className="w-full p-3 border border-gray-300 rounded-lg" required>
//               <option value="">Select Class</option>
//               {filteredStudentClasses.map(cls => (
//                 <option key={cls.value} value={cls.value}>{cls.label}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//         {/* Stream Selection for Senior Secondary */}
//         {formData.education_level === 'SENIOR_SECONDARY' && (
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Stream Selection *
//               <span className="text-xs text-gray-500 ml-2">
//                 (Required for Senior Secondary students)
//               </span>
//             </label>
//             <select
//               name="stream"
//               value={formData.stream || ''}
//               onChange={handleInputChange}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               required
//             >
//               <option value="">Select Your Stream</option>
//               {streams.map((stream) => (
//                 <option key={stream.id} value={stream.id}>
//                   {stream.name} ({stream.stream_type})
//                 </option>
//               ))}
//             </select>
//             <p className="text-xs text-gray-600 mt-1">
//               Choose the stream that best matches your academic interests and career goals.
//             </p>
//           </div>
//         )}
//         {/* Registration Number */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
//           <input
//             type="text"
//             name="registration_number"
//             value={formData.registration_number}
//             onChange={handleInputChange}
//             className="w-full p-3 border border-gray-300 rounded-lg"
//             placeholder="Enter registration number (optional)"
//           />
//         </div>
//         {/* Classroom Selection */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-2">Classroom</label>
//           <select
//             name="classroom"
//             value={formData.classroom}
//             onChange={handleInputChange}
//             className="w-full p-3 border border-gray-300 rounded-lg"
//             required={!!formData.student_class}
//             disabled={!formData.student_class}
//           >
//             <option value="">Select Classroom</option>
//             {filteredClassrooms.map(room => (
//               <option key={room} value={room}>{room}</option>
//             ))}
//           </select>
//         </div>
//         {/* Parent Search/Select */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-2">Search Existing Parent</label>
//           <input
//             type="text"
//             value={parentSearch}
//             onChange={e => {
//               setParentSearch(e.target.value);
//               setSelectedParent(null);
//             }}
//             className="w-full p-3 border border-gray-300 rounded-lg"
//             placeholder="Type at least 2 characters (name, username, or email)"
//           />
//           {parentSearchLoading && <div className="text-sm text-gray-500">Searching...</div>}
//           {parentOptions && parentOptions.length > 0 && (
//             <ul className="border border-gray-200 rounded mt-2 bg-white max-h-40 overflow-y-auto shadow-lg">
//               {parentOptions.map(parent => (
//                 <li
//                   key={parent.id}
//                   className={`p-3 cursor-pointer transition-colors ${
//                     selectedParent && selectedParent.id === parent.id 
//                       ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500' 
//                       : 'hover:bg-blue-50 text-gray-900'
//                   }`}
//                   onClick={() => {
//                     setSelectedParent(parent);
//                     setParentUsernameSearch(parent.username); // Auto-fill the username field
//                   }}
//                 >
//                   <div className="font-semibold text-sm">{parent.full_name} ({parent.username})</div>
//                   <div className="text-xs text-gray-600 mt-1">{parent.email} | {parent.phone}</div>
//                 </li>
//               ))}
//             </ul>
//           )}
//           {selectedParent && (
//             <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center justify-between">
//               <div>
//                 <span className="font-medium">Selected Parent:</span> 
//                 <span className="font-semibold ml-1">{selectedParent.full_name}</span> 
//                 <span className="text-green-600 ml-1">({selectedParent.username})</span>
//               </div>
//               <button 
//                 className="ml-2 text-xs text-red-600 hover:text-red-800 underline font-medium" 
//                 onClick={() => setSelectedParent(null)}
//               >
//                 Clear
//               </button>
//             </div>
//           )}
//         </div>
//         {/* Parent Username Search */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-2">Parent Username</label>
//           <div className="flex gap-2">
//             <input
//               type="text"
//               value={parentUsernameSearch}
//               onChange={e => setParentUsernameSearch(e.target.value)}
//               className="w-full p-3 border border-gray-300 rounded-lg"
//               placeholder="Enter parent username (e.g., PAR/GTS/AUG/25/003)"
//             />
//             <button
//               type="button"
//               onClick={handleParentUsernameSearch}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               Search
//             </button>
//           </div>
//           {selectedParent && (
//             <div className="mt-2 text-sm text-gray-600">
//               <span className="font-medium">Tip:</span> You can also search by partial username (e.g., "GTS/AUG" or "003")
//             </div>
//           )}
//         </div>
//         {/* If parent is found, show details read-only */}
//         {parentDetails && (
//           <div className="mb-4 p-4 bg-white border border-green-200 rounded-lg">
//             <h4 className="font-semibold text-green-500 mb-2">Parent Details Found:</h4>
//             <div className="space-y-1 text-sm">
//               <div><span className="font-medium text-green-800">Full Name:</span> <span className="text-green-500">{parentDetails.full_name}</span></div>
//               <div><span className="font-medium text-green-800">Email:</span> <span className="text-green-500">{parentDetails.email}</span></div>
//               <div><span className="font-medium text-green-800">Phone:</span> <span className="text-green-500">{parentDetails.phone}</span></div>
//               <div><span className="font-medium text-green-800">Address:</span> <span className="text-green-500">{parentDetails.address}</span></div>
//             </div>
//           </div>
//         )}
//         {/* Only show new parent fields if no parent is found/selected */}
//         {!parentDetails && !selectedParent && (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Parent First Name*</label><input type="text" name="parentFirstName" value={formData.parentFirstName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Parent first name" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Parent Last Name*</label><input type="text" name="parentLastName" value={formData.parentLastName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Parent last name" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone Number*</label><input type="tel" name="parentPhoneNumber" value={formData.parentPhoneNumber} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="+2341234567890" /></div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Parent Email*</label><input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="parent@example.com" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-2">Parent Address*</label><textarea name="parentAddress" value={formData.parentAddress} onChange={handleInputChange} rows={2} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Parent address..." /></div>
//             </div>
//           </>
//         )}
//         {/* If parent is found by username, disable parent fields */}
//         {selectedParent && (
//           <div className="mt-2 p-2 bg-green-50 rounded text-green-800">
//             Parent found and selected. New parent fields are disabled.
//           </div>
//         )}
//         {/* If no parent is found, prompt to create a parent first */}
//         {parentSearch.length > 1 && (!parentOptions || parentOptions.length === 0) && !parentSearchLoading && !selectedParent && (
//           <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//             <div className="flex items-center gap-2">
//               <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
//                 <span className="text-yellow-800 text-xs font-bold">!</span>
//               </div>
//               <span className="text-yellow-800 font-medium">No parent found. Please create a parent first before adding the student.</span>
//             </div>
//           </div>
//         )}
//         <div className="mb-4">
//     <label className="block text-sm font-medium text-gray-700 mb-2">Student Email*</label>
//     <div className="flex items-center gap-2">
//       <input
//         type="checkbox"
//         checked={useParentEmail}
//         onChange={e => setUseParentEmail(e.target.checked)}
//         id="use-parent-email"
//         className="mr-2"
//         disabled={!selectedParent && !parentDetails}
//       />
//       <label htmlFor="use-parent-email" className="text-sm">Use parent's email for student</label>
//     </div>
//     <input
//       type="email"
//       name="email"
//       value={formData.email}
//       onChange={handleInputChange}
//       className="w-full p-3 border border-gray-300 rounded-lg mt-2"
//       placeholder="student@example.com"
//       disabled={useParentEmail && (selectedParent || parentDetails)}
//       required
//     />
//   </div>
//         <div className="mb-4">
//     <label className="block text-sm font-medium text-gray-700 mb-2">Relationship to Student*</label>
//     <select
//       name="relationship"
//       value={formData.relationship}
//       onChange={handleInputChange}
//       className="w-full p-3 border border-gray-300 rounded-lg"
//       required
//     >
//       <option value="">Select Relationship</option>
//       <option value="Father">Father</option>
//       <option value="Mother">Mother</option>
//       <option value="Guardian">Guardian</option>
//       <option value="Sponsor">Sponsor</option>
//     </select>
//   </div>
//   <div className="mb-4 flex items-center">
//     <input
//       type="checkbox"
//       name="isPrimaryContact"
//       checked={formData.isPrimaryContact}
//       onChange={handleInputChange}
//       className="mr-2"
//       id="is-primary-contact"
//     />
//     <label htmlFor="is-primary-contact" className="text-sm">Is Primary Contact?</label>
//   </div>
//         <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Student Address*</label><textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Student address..." /></div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number*</label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="+2341234567890" /></div>
//         </div>
//         <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Payment Method*</label><select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Select Payment Method</option><option value="cash">Cash</option><option value="debits">Debits</option></select></div>
//         <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label><textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleInputChange} rows={2} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Medical conditions..." /></div>
//         <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label><textarea name="specialRequirements" value={formData.specialRequirements} onChange={handleInputChange} rows={2} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Special requirements..." /></div>
//         <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
//           <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors" disabled={loading}>{loading ? 'Saving...' : 'Save Student'}</button>
//         </div>
//         {error && <div className="text-red-500 mt-2">{error}</div>}
//         {success && <div className="text-green-600 mt-2">{success}</div>}
//         {/* Modal for showing passwords */}
//         {showPasswordModal && (studentUsername || studentPassword || parentUsername || parentPassword) && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
//             <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
//               <h3 className="text-lg font-semibold mb-4 text-blue-700">Account Credentials</h3>
//               {studentUsername && (
//                 <div className="mb-2 p-3 bg-blue-50 rounded">
//                   <h4 className="font-semibold text-blue-800 mb-2">Student Account</h4>
//                   <div className="text-sm text-gray-800">
//                     <span className="font-semibold">Username:</span>
//                     <span className="ml-2 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{studentUsername}</span>
//                     <button onClick={() => navigator.clipboard.writeText(studentUsername!)} className="ml-2 text-xs text-blue-600 underline">Copy</button>
//                   </div>
//                   <div className="text-sm text-gray-800 mt-2">
//                     <span className="font-semibold">Password:</span>
//                     <span className="ml-2 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{studentPassword}</span>
//                     <button onClick={() => navigator.clipboard.writeText(studentPassword!)} className="ml-2 text-xs text-blue-600 underline">Copy</button>
//                   </div>
//                 </div>
//               )}
//               {parentUsername && (
//                 <div className="mb-2 p-3 bg-green-50 rounded">
//                   <h4 className="font-semibold text-green-800 mb-2">Parent Account</h4>
//                   <div className="text-sm text-gray-800">
//                     <span className="font-semibold">Username:</span>
//                     <span className="ml-2 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{parentUsername}</span>
//                     <button onClick={() => navigator.clipboard.writeText(parentUsername!)} className="ml-2 text-xs text-blue-600 underline">Copy</button>
//                   </div>
//                   <div className="text-sm text-gray-800 mt-2">
//                     <span className="font-semibold">Password:</span>
//                     <span className="ml-2 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{parentPassword}</span>
//                     <button onClick={() => navigator.clipboard.writeText(parentPassword!)} className="ml-2 text-xs text-blue-600 underline">Copy</button>
//                   </div>
//                 </div>
//               )}
//               <p className="text-sm text-gray-600 mb-4">Please copy and send these credentials to the respective users. They should be required to reset their passwords on first login.</p>
//               <button onClick={() => setShowPasswordModal(false)} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Close</button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };





// export default AddStudentForm;

import React, { useState, useEffect } from 'react';
import { User, X, Calendar, Search, Check } from 'lucide-react';
import api from '@/services/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { triggerDashboardRefresh } from '@/hooks/useDashboardRefresh';

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
  academicYear: string;
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
  relationship: string;
  isPrimaryContact: boolean;
  classroom: string;
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

interface AddStudentFormProps {
  onStudentAdded?: () => void;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onStudentAdded }) => {
  const [formData, setFormData] = useState<StudentFormData>({
    photo: null, firstName: '', middleName: '', lastName: '', email: '',
    gender: '', bloodGroup: '', dateOfBirth: '', placeOfBirth: '',
    academicYear: '', education_level: '', student_class: '', stream: '',
    registration_number: '', existing_parent_id: '', parentFirstName: '',
    parentLastName: '', parentEmail: '', parentPhoneNumber: '', parentAddress: '',
    address: '', phoneNumber: '', paymentMethod: '', medicalConditions: '',
    specialRequirements: '', relationship: '', isPrimaryContact: false, classroom: '',
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
  const [useParentEmail, setUseParentEmail] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [streams, setStreams] = useState<any[]>([]);
  
  // Date picker states
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  const handleParentUsernameSearch = async () => {
    if (!parentUsernameSearch) return;
    try {
      const res = await api.get(`/api/parents/search/?q=${encodeURIComponent(parentUsernameSearch)}`);
      const parentData = Array.isArray(res) ? res : [];
      const found = parentData.find((p: any) => 
        p.username === parentUsernameSearch || 
        p.username.includes(parentUsernameSearch) ||
        p.username.toLowerCase().includes(parentUsernameSearch.toLowerCase())
      );
      if (found) {
        setParentDetails(found);
        setSelectedParent(found);
        setParentUsernameSearch(found.username);
        toast.success('Parent found and details filled!');
      } else {
        toast.error('Parent not found. Please check the username or add the parent first.');
        setTimeout(() => navigate('/admin/parents/add'), 1500);
      }
    } catch (err) {
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
      .then(res => setParentOptions(res || []))
      .catch(() => setParentOptions([]))
      .finally(() => setParentSearchLoading(false));
  }, [parentSearch]);

  useEffect(() => {
    if (useParentEmail && (selectedParent || parentDetails)) {
      const parentEmail = selectedParent?.email || parentDetails?.email || '';
      setFormData(prev => ({ ...prev, email: parentEmail }));
    }
  }, [useParentEmail, selectedParent, parentDetails]);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await api.get('/api/classrooms/streams/');
        setStreams(response || []);
      } catch (error) {
        setStreams([]);
      }
    };
    fetchStreams();
  }, []);

  // Update dateOfBirth when day/month/year changes
  useEffect(() => {
    if (dobDay && dobMonth && dobYear) {
      const month = dobMonth.padStart(2, '0');
      const day = dobDay.padStart(2, '0');
      setFormData(prev => ({ ...prev, dateOfBirth: `${dobYear}-${month}-${day}` }));
    }
  }, [dobDay, dobMonth, dobYear]);

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
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    const cloudinaryData = new FormData();
    cloudinaryData.append('file', file);
    cloudinaryData.append('upload_preset', 'profile_upload');
    try {
      const res = await axios.post('https://api.cloudinary.com/v1_1/djbz7wunu/image/upload', cloudinaryData);
      const imageUrl = res.data.secure_url;
      setFormData(prev => ({ ...prev, photo: imageUrl }));
      setPhotoPreview(imageUrl);
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
        profile_picture: formData.photo,
        relationship: formData.relationship,
        is_primary_contact: formData.isPrimaryContact,
      };
      
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
      
      const response = await api.post('/api/students/students/', payload);
      setSuccess('Student and Parent created successfully!');
      toast.success('Student and Parent added successfully');
      
      triggerDashboardRefresh();
      
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
          photo: null, firstName: '', middleName: '', lastName: '', email: '',
          gender: '', bloodGroup: '', dateOfBirth: '', placeOfBirth: '',
          academicYear: '', education_level: '', student_class: '', stream: '',
          registration_number: '', existing_parent_id: '', parentFirstName: '',
          parentLastName: '', parentEmail: '', parentPhoneNumber: '', parentAddress: '',
          address: '', phoneNumber: '', paymentMethod: '', medicalConditions: '',
          specialRequirements: '', relationship: '', isPrimaryContact: false, classroom: '',
        });
        setDobDay('');
        setDobMonth('');
        setDobYear('');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create student');
      toast.error('Cannot add student');
      setLoading(false);
    }
  };

  const filteredStudentClasses = formData.education_level ? studentClassesByLevel[formData.education_level] : [];
  const filteredClassrooms = formData.student_class ? classroomsByStudentClass[formData.student_class] || [] : [];

  // Generate day, month, year options
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Add New Student</h2>
        <p className="text-slate-600 text-sm mt-1">Fill in the student details below</p>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Photo Upload */}
        <div className="flex flex-col items-center">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Student Photo</label>
          <div className="relative">
            <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
              {photoPreview ? (
                <div className="relative w-full h-full">
                  <img src={photoPreview} alt="Student" className="w-full h-full object-cover rounded-2xl" />
                  <button
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>
          </div>
          {uploading && <div className="text-sm text-blue-600 mt-2 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Uploading...
          </div>}
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="student-photo" />
          <label
            htmlFor="student-photo"
            className="mt-3 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md font-medium text-sm"
          >
            Choose Photo
          </label>
        </div>

        {/* Personal Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">First Name*</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Middle name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Last Name*</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gender*</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Place of Birth*</label>
              <input
                type="text"
                name="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Lagos, Nigeria"
              />
            </div>
          </div>

          {/* Mobile-Friendly Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date of Birth*
            </label>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={dobDay}
                onChange={(e) => setDobDay(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Day</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <select
                value={dobMonth}
                onChange={(e) => setDobMonth(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Month</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            {formData.dateOfBirth && (
              <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Selected: {new Date(formData.dateOfBirth).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}
          </div>
        </div>

        {/* Academic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Academic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Academic Year*</label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="2024/2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Registration Number</label>
              <input
                type="text"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="REG12345"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Education Level*</label>
              <select
                name="education_level"
                value={formData.education_level}
                onChange={(e) => {
                  handleInputChange(e);
                  setFormData(prev => ({ ...prev, student_class: '', classroom: '', stream: '' }));
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Level</option>
                {educationLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Student Class*</label>
              <select
                name="student_class"
                value={formData.student_class}
                onChange={(e) => {
                  handleInputChange(e);
                  setFormData(prev => ({ ...prev, classroom: '', stream: '' }));
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Class</option>
                {filteredStudentClasses.map(cls => (
                  <option key={cls.value} value={cls.value}>{cls.label}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.education_level === 'SENIOR_SECONDARY' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stream* <span className="text-xs text-slate-500">(Required for Senior Secondary)</span>
              </label>
              <select
                name="stream"
                value={formData.stream}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Stream</option>
                {streams.map((stream) => (
                  <option key={stream.id} value={stream.id}>
                    {stream.name} ({stream.stream_type})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Classroom</label>
            <select
              name="classroom"
              value={formData.classroom}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={!formData.student_class}
            >
              <option value="">Select Classroom</option>
              {filteredClassrooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Parent Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Parent/Guardian Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Existing Parent</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={parentSearch}
                onChange={(e) => {
                  setParentSearch(e.target.value);
                  setSelectedParent(null);
                }}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Search by name, username, or email..."
              />
            </div>
            {parentSearchLoading && (
              <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </div>
            )}
            {parentOptions && parentOptions.length > 0 && (
              <ul className="mt-2 border border-slate-200 rounded-xl bg-white max-h-60 overflow-y-auto shadow-lg">
                {parentOptions.map(parent => (
                  <li
                    key={parent.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedParent && selectedParent.id === parent.id 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      setSelectedParent(parent);
                      setParentUsernameSearch(parent.username);
                    }}
                  >
                    <div className="font-semibold text-slate-900">{parent.full_name}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      {parent.username} • {parent.email} • {parent.phone}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {selectedParent && (
              <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-900">{selectedParent.full_name}</div>
                    <div className="text-sm text-emerald-700">{selectedParent.username}</div>
                  </div>
                </div>
                <button 
                  className="text-sm text-rose-600 hover:text-rose-800 font-medium underline" 
                  onClick={() => setSelectedParent(null)}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Or Search by Username</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={parentUsernameSearch}
                onChange={(e) => setParentUsernameSearch(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="PAR/GTS/AUG/25/003"
              />
              <button
                type="button"
                onClick={handleParentUsernameSearch}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md font-medium"
              >
                Search
              </button>
            </div>
          </div>

          {parentDetails && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
              <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Parent Found
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-emerald-800">Full Name:</span>
                  <span className="ml-2 text-emerald-700">{parentDetails.full_name}</span>
                </div>
                <div>
                  <span className="font-medium text-emerald-800">Email:</span>
                  <span className="ml-2 text-emerald-700">{parentDetails.email}</span>
                </div>
                <div>
                  <span className="font-medium text-emerald-800">Phone:</span>
                  <span className="ml-2 text-emerald-700">{parentDetails.phone}</span>
                </div>
                <div>
                  <span className="font-medium text-emerald-800">Address:</span>
                  <span className="ml-2 text-emerald-700">{parentDetails.address}</span>
                </div>
              </div>
            </div>
          )}

          {!parentDetails && !selectedParent && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Parent First Name*</label>
                  <input
                    type="text"
                    name="parentFirstName"
                    value={formData.parentFirstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Parent first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Parent Last Name*</label>
                  <input
                    type="text"
                    name="parentLastName"
                    value={formData.parentLastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Parent last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Parent Phone*</label>
                  <input
                    type="tel"
                    name="parentPhoneNumber"
                    value={formData.parentPhoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="+234 123 456 7890"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Parent Email*</label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="parent@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Parent Address*</label>
                  <textarea
                    name="parentAddress"
                    value={formData.parentAddress}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Parent address..."
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Relationship to Student*</label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
                <option value="Sponsor">Sponsor</option>
              </select>
            </div>
            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                name="isPrimaryContact"
                checked={formData.isPrimaryContact}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                id="is-primary-contact"
              />
              <label htmlFor="is-primary-contact" className="ml-3 text-sm font-medium text-slate-700">
                Set as Primary Contact
              </label>
            </div>
          </div>
        </div>

        {/* Student Contact & Additional Info */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Contact & Additional Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Student Email*</label>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                checked={useParentEmail}
                onChange={(e) => setUseParentEmail(e.target.checked)}
                id="use-parent-email"
                className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                disabled={!selectedParent && !parentDetails}
              />
              <label htmlFor="use-parent-email" className="text-sm text-slate-600">
                Use parent's email for student
              </label>
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="student@example.com"
              disabled={useParentEmail && (selectedParent || parentDetails)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Student Phone*</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="+234 123 456 7890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method*</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Payment Method</option>
                <option value="cash">Cash</option>
                <option value="debits">Debits</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Student Address*</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Enter student's residential address..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Medical Conditions</label>
              <textarea
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Any medical conditions or allergies..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Special Requirements</label>
              <textarea
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Any special requirements or accommodations..."
              />
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3">
            <X className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              'Save Student'
            )}
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (studentUsername || studentPassword || parentUsername || parentPassword) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Account Credentials Created</h3>
            
            {studentUsername && (
              <div className="mb-4 p-5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Account
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-slate-700">Username:</span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="flex-1 font-mono text-lg bg-white px-4 py-2 rounded-lg border border-blue-200">
                        {studentUsername}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(studentUsername!);
                          toast.success('Username copied!');
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-700">Password:</span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="flex-1 font-mono text-lg bg-white px-4 py-2 rounded-lg border border-blue-200">
                        {studentPassword}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(studentPassword!);
                          toast.success('Password copied!');
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {parentUsername && (
              <div className="mb-6 p-5 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Parent Account
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-slate-700">Username:</span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="flex-1 font-mono text-lg bg-white px-4 py-2 rounded-lg border border-emerald-200">
                        {parentUsername}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(parentUsername!);
                          toast.success('Username copied!');
                        }}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-700">Password:</span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="flex-1 font-mono text-lg bg-white px-4 py-2 rounded-lg border border-emerald-200">
                        {parentPassword}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(parentPassword!);
                          toast.success('Password copied!');
                        }}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-slate-600 mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              ⚠️ Please copy and securely send these credentials to the respective users. They should change their passwords on first login.
            </p>

            <button
              onClick={() => setShowPasswordModal(false)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStudentForm;