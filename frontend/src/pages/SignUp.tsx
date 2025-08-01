import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from './../services/AuthService';
import { toast } from 'react-toastify';

// Step 1: Role selection
const roles = [
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' },
];

const initialStudent = {
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
  registration_number: '', // <-- Add registration number
  parentName: '',
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
};
const initialParent = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
};
const initialTeacher = {
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  phone: '',
  employee_id: '',
};
const initialAdmin = {
  firstName: '',
  lastName: '',
  email: '',
};

const SignUpPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [student, setStudent] = useState(initialStudent);
  const [parent, setParent] = useState(initialParent);
  const [teacher, setTeacher] = useState(initialTeacher);
  const [admin, setAdmin] = useState(initialAdmin);
  const [students, setStudents] = useState([initialStudent]); // for parent role
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const authService = new AuthService();
  const [parentSearch, setParentSearch] = useState('');
  const [parentOptions, setParentOptions] = useState<any[]>([]);
  const [parentSearchLoading, setParentSearchLoading] = useState(false);
  const [selectedParent, setSelectedParent] = useState<any | null>(null);
  const [parentUsernameSearch, setParentUsernameSearch] = useState('');
  const [parentDetails, setParentDetails] = useState<any | null>(null);

  useEffect(() => {
    if (parentSearch.length < 2) {
      setParentOptions([]);
      return;
    }
    setParentSearchLoading(true);
    fetch(`/api/parents/search/?q=${encodeURIComponent(parentSearch)}`)
      .then(res => res.json())
      .then(data => setParentOptions(data))
      .catch(() => setParentOptions([]))
      .finally(() => setParentSearchLoading(false));
  }, [parentSearch]);

  // Step 1: Select role
  const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
    setErrors({});
  };

  // Step 2: Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, who: string, idx?: number) => {
    const { name, value } = e.target;
    if (who === 'student') setStudent(prev => ({ ...prev, [name]: value }));
    if (who === 'parent') setParent(prev => ({ ...prev, [name]: value }));
    if (who === 'teacher') setTeacher(prev => ({ ...prev, [name]: value }));
    if (who === 'admin') setAdmin(prev => ({ ...prev, [name]: value }));
    if (who === 'students' && typeof idx === 'number') {
      setStudents(prev => prev.map((s, i) => i === idx ? { ...s, [name]: value } : s));
    }
  };

  // Step 2: Add/remove students for parent
  const addStudent = () => setStudents(prev => [...prev, initialStudent]);
  const removeStudent = (idx: number) => setStudents(prev => prev.filter((_, i) => i !== idx));

  // Step navigation
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // Step 3: Validate and submit
  const validate = () => {
    const errs: any = {};
    if (!role) errs.role = 'Role is required';
    if (role === 'student') {
      if (!student.firstName) errs.studentFirstName = 'First name required';
      if (!student.lastName) errs.studentLastName = 'Last name required';
      if (!parent.firstName) errs.parentFirstName = 'Parent first name required';
      if (!parent.lastName) errs.parentLastName = 'Parent last name required';
      if (!parent.email) errs.parentEmail = 'Parent email required';
    }
    if (role === 'parent') {
      if (!parent.firstName) errs.parentFirstName = 'First name required';
      if (!parent.lastName) errs.parentLastName = 'Last name required';
      if (!parent.email) errs.parentEmail = 'Email required';
      students.forEach((s, i) => {
        if (!s.firstName) errs[`student${i}FirstName`] = 'Student first name required';
        if (!s.lastName) errs[`student${i}LastName`] = 'Student last name required';
        if (!s.email) errs[`student${i}Email`] = 'Student email required';
      });
    }
    if (role === 'teacher') {
      if (!teacher.firstName) errs.teacherFirstName = 'First name required';
      if (!teacher.lastName) errs.teacherLastName = 'Last name required';
      if (!teacher.email) errs.teacherEmail = 'Email required';
    }
    if (role === 'admin') {
      if (!admin.firstName) errs.adminFirstName = 'First name required';
      if (!admin.lastName) errs.adminLastName = 'Last name required';
      if (!admin.email) errs.adminEmail = 'Email required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handler for searching parent by username
  const handleParentUsernameSearch = async () => {
    if (!parentUsernameSearch) return;
    try {
      const res = await fetch(`/api/parents/search/?q=${encodeURIComponent(parentUsernameSearch)}`);
      const data = await res.json();
      const found = data.find((p: any) => p.username === parentUsernameSearch);
      if (found) {
        setParentDetails(found);
        setSelectedParent(found);
        toast.success('Parent found and details filled!');
      } else {
        toast.error('Parent not found. Please add the parent first.');
        setTimeout(() => navigate('/signup?role=parent'), 1500);
      }
    } catch (err) {
      toast.error('Error searching for parent.');
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      let payload: any = {};
      if (role === 'student') {
        payload = {
          user_email: student.email,
          user_first_name: student.firstName,
          user_middle_name: student.middleName,
          user_last_name: student.lastName,
          gender: student.gender,
          blood_group: student.bloodGroup,
          date_of_birth: student.dateOfBirth,
          place_of_birth: student.placeOfBirth,
          academic_year: student.academicYear,
          education_level: student.education_level,
          student_class: student.student_class,
          address: student.address,
          phone_number: student.phoneNumber.startsWith('+') ? student.phoneNumber : `+${student.phoneNumber}`,
          payment_method: student.paymentMethod,
          medical_conditions: student.medicalConditions,
          special_requirements: student.specialRequirements,
          role: 'student', // <-- Ensure role is set
        };
        if (parentDetails) {
          payload.existing_parent_id = parentDetails.id;
        } else if (selectedParent) {
          payload.existing_parent_id = selectedParent.id;
        } else {
          payload.parent_first_name = parent.firstName;
          payload.parent_last_name = parent.lastName;
          payload.parent_email = parent.email;
          payload.parent_contact = parent.phone.startsWith('+') ? parent.phone : `+${parent.phone}`;
          payload.parent_address = parent.address;
        }
      } else if (role === 'parent') {
        payload = {
          user_email: parent.email,
          user_first_name: parent.firstName,
          user_middle_name: parent.middleName,
          user_last_name: parent.lastName,
          phone: parent.phone,
          address: parent.address,
          students: students.map(s => ({
            user_email: s.email,
            user_first_name: s.firstName,
            user_middle_name: s.middleName,
            user_last_name: s.lastName,
            gender: s.gender,
            date_of_birth: s.dateOfBirth,
            student_class: s.student_class,
          })),
          role: 'parent', // <-- Ensure role is set
        };
      } else if (role === 'teacher') {
        payload = { ...teacher, role: 'teacher' };
      } else if (role === 'admin') {
        payload = { ...admin, role: 'admin' };
      }
      // Use register for all roles
      const response = await authService.register(payload);
      if (response.success) {
        // Redirect or show success
        navigate('/verify-email?email=' + encodeURIComponent(payload.user_email || payload.email));
      } else {
        setErrors(response.errors || { general: 'Registration failed' });
      }
    } catch (e) {
      setErrors({ general: 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // Stepper UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center mb-2">Create an Account</h1>
          <div className="flex items-center justify-center space-x-4">
            {roles.map(r => (
              <button
                key={r.value}
                className={`px-4 py-2 rounded-lg font-semibold border ${role === r.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => { setRole(r.value); setStep(2); }}
              >
                {r.label}
              </button>
            ))}
          </div>
          {errors.role && <p className="text-red-500 text-sm text-center mt-2">{errors.role}</p>}
        </div>
        {/* Step 2: Role-specific fields */}
        {step === 2 && role === 'student' && (
          <>
            <h2 className="text-lg font-semibold mb-4">Student Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input name="firstName" value={student.firstName} onChange={e => handleChange(e, 'student')} placeholder="First Name" className="p-3 border rounded-lg" />
              <input name="middleName" value={student.middleName} onChange={e => handleChange(e, 'student')} placeholder="Middle Name" className="p-3 border rounded-lg" />
              <input name="lastName" value={student.lastName} onChange={e => handleChange(e, 'student')} placeholder="Last Name" className="p-3 border rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <select name="gender" value={student.gender} onChange={e => handleChange(e, 'student')} className="p-3 border rounded-lg">
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
              <select name="bloodGroup" value={student.bloodGroup} onChange={e => handleChange(e, 'student')} className="p-3 border rounded-lg">
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              <input name="dateOfBirth" type="date" value={student.dateOfBirth} onChange={e => handleChange(e, 'student')} className="p-3 border rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input name="placeOfBirth" value={student.placeOfBirth} onChange={e => handleChange(e, 'student')} placeholder="Place of Birth" className="p-3 border rounded-lg" />
              <input name="academicYear" value={student.academicYear} onChange={e => handleChange(e, 'student')} placeholder="Academic Year (2024/2025)" className="p-3 border rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select name="education_level" value={student.education_level} onChange={e => handleChange(e, 'student')} className="p-3 border rounded-lg">
                <option value="">Select Education Level</option>
                <option value="NURSERY">Nursery</option>
                <option value="PRIMARY">Primary</option>
                <option value="SECONDARY">Secondary</option>
              </select>
              <select name="student_class" value={student.student_class} onChange={e => handleChange(e, 'student')} className="p-3 border rounded-lg">
                <option value="">Select Class</option>
                <option value="NURSERY_1">Nursery 1</option>
                <option value="NURSERY_2">Nursery 2</option>
                <option value="PRE_K">Pre-K</option>
                <option value="KINDERGARTEN">Kindergarten</option>
                <option value="GRADE_1">Grade 1</option>
                <option value="GRADE_2">Grade 2</option>
                <option value="GRADE_3">Grade 3</option>
                <option value="GRADE_4">Grade 4</option>
                <option value="GRADE_5">Grade 5</option>
                <option value="GRADE_6">Grade 6</option>
                <option value="GRADE_7">Grade 7</option>
                <option value="GRADE_8">Grade 8</option>
                <option value="GRADE_9">Grade 9</option>
                <option value="GRADE_10">Grade 10</option>
                <option value="GRADE_11">Grade 11</option>
                <option value="GRADE_12">Grade 12</option>
              </select>
            </div>
            <div className="mb-4">
              <input name="registration_number" value={student.registration_number} onChange={e => handleChange(e, 'student')} placeholder="Registration Number (Optional)" className="w-full p-3 border rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input name="phoneNumber" value={student.phoneNumber} onChange={e => handleChange(e, 'student')} placeholder="Phone Number" className="p-3 border rounded-lg" />
            </div>
            <div className="mb-4">
              <textarea name="address" value={student.address} onChange={e => handleChange(e, 'student')} placeholder="Student Address" rows={2} className="w-full p-3 border rounded-lg" />
            </div>
            <div className="mb-4">
              <select name="paymentMethod" value={student.paymentMethod} onChange={e => handleChange(e, 'student')} className="w-full p-3 border rounded-lg">
                <option value="">Select Payment Method</option>
                <option value="cash">Cash</option>
                <option value="debits">Debits</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <textarea name="medicalConditions" value={student.medicalConditions} onChange={e => handleChange(e, 'student')} placeholder="Medical Conditions" rows={2} className="w-full p-3 border rounded-lg" />
              <textarea name="specialRequirements" value={student.specialRequirements} onChange={e => handleChange(e, 'student')} placeholder="Special Requirements" rows={2} className="w-full p-3 border rounded-lg" />
            </div>
            <h2 className="text-lg font-semibold mb-4 mt-6">Parent Information</h2>
            {/* Parent Username Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Parent Username</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={parentUsernameSearch}
                  onChange={e => setParentUsernameSearch(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter parent username"
                />
                <button
                  type="button"
                  onClick={handleParentUsernameSearch}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </div>
            {/* If parent is found, show details read-only */}
            {parentDetails && (
              <div className="mb-4 p-4 bg-green-50 rounded">
                <div><b>Full Name:</b> {parentDetails.full_name}</div>
                <div><b>Email:</b> {parentDetails.email}</div>
                <div><b>Phone:</b> {parentDetails.phone}</div>
                <div><b>Address:</b> {parentDetails.address}</div>
              </div>
            )}
            {/* Only show new parent fields if no parent is found/selected */}
            {!parentDetails && !selectedParent && (
              <>
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
                  {parentOptions.length > 0 && (
                    <ul className="border border-gray-200 rounded mt-2 bg-white max-h-40 overflow-y-auto">
                      {parentOptions.map(parent => (
                        <li
                          key={parent.id}
                          className={`p-2 cursor-pointer hover:bg-blue-50 ${selectedParent && selectedParent.id === parent.id ? 'bg-blue-100' : ''}`}
                          onClick={() => setSelectedParent(parent)}
                        >
                          <div className="font-semibold">{parent.full_name} ({parent.username})</div>
                          <div className="text-xs text-gray-600">{parent.email} | {parent.phone}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {selectedParent && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-green-800 flex items-center justify-between">
                      <span>Selected Parent: <b>{selectedParent.full_name}</b> ({selectedParent.username})</span>
                      <button className="ml-2 text-xs text-red-600 underline" onClick={() => setSelectedParent(null)}>Clear</button>
                    </div>
                  )}
                </div>
                {/* Only show new parent fields if no parent is selected */}
                {!selectedParent && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input name="firstName" value={parent.firstName} onChange={e => handleChange(e, 'parent')} placeholder="Parent First Name" className="p-3 border rounded-lg" />
                      <input name="middleName" value={parent.middleName} onChange={e => handleChange(e, 'parent')} placeholder="Parent Middle Name" className="p-3 border rounded-lg" />
                      <input name="lastName" value={parent.lastName} onChange={e => handleChange(e, 'parent')} placeholder="Parent Last Name" className="p-3 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input name="email" value={parent.email} onChange={e => handleChange(e, 'parent')} placeholder="Parent Email" className="p-3 border rounded-lg" />
                      <input name="phone" value={parent.phone} onChange={e => handleChange(e, 'parent')} placeholder="Parent Phone" className="p-3 border rounded-lg" />
                    </div>
                    <div className="mb-4">
                      <textarea name="address" value={parent.address} onChange={e => handleChange(e, 'parent')} placeholder="Parent Address" rows={2} className="w-full p-3 border rounded-lg" />
                    </div>
                  </>
                )}
              </>
            )}
            <div className="flex justify-between mt-6">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={prevStep}>Back</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Registering...' : 'Register'}</button>
            </div>
            {Object.values(errors).map((err, i) => <p key={i} className="text-red-500 text-sm mt-2">{String(err)}</p>)}
          </>
        )}
        {step === 2 && role === 'parent' && (
          <>
            <h2 className="text-lg font-semibold mb-4">Parent Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input name="firstName" value={parent.firstName} onChange={e => handleChange(e, 'parent')} placeholder="First Name" className="p-3 border rounded-lg" />
              <input name="middleName" value={parent.middleName} onChange={e => handleChange(e, 'parent')} placeholder="Middle Name" className="p-3 border rounded-lg" />
              <input name="lastName" value={parent.lastName} onChange={e => handleChange(e, 'parent')} placeholder="Last Name" className="p-3 border rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input name="email" value={parent.email} onChange={e => handleChange(e, 'parent')} placeholder="Email" className="p-3 border rounded-lg" />
              <input name="phone" value={parent.phone} onChange={e => handleChange(e, 'parent')} placeholder="Phone" className="p-3 border rounded-lg" />
            </div>
            <div className="mb-4">
              <textarea name="address" value={parent.address} onChange={e => handleChange(e, 'parent')} placeholder="Address" rows={2} className="w-full p-3 border rounded-lg" />
            </div>
            <h2 className="text-lg font-semibold mb-4 mt-6">Student(s) Information</h2>
            {students.map((s, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input name="firstName" value={s.firstName} onChange={e => handleChange(e, 'students', idx)} placeholder="Student First Name" className="p-3 border rounded-lg" />
                <input name="middleName" value={s.middleName} onChange={e => handleChange(e, 'students', idx)} placeholder="Student Middle Name" className="p-3 border rounded-lg" />
                <input name="lastName" value={s.lastName} onChange={e => handleChange(e, 'students', idx)} placeholder="Student Last Name" className="p-3 border rounded-lg" />
              </div>
            ))}
            {students.map((s, idx) => (
              <div key={`${idx}-details`} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input name="email" value={s.email} onChange={e => handleChange(e, 'students', idx)} placeholder="Student Email" className="p-3 border rounded-lg" />
                <select name="gender" value={s.gender} onChange={e => handleChange(e, 'students', idx)} className="p-3 border rounded-lg">
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
                <input name="dateOfBirth" type="date" value={s.dateOfBirth} onChange={e => handleChange(e, 'students', idx)} className="p-3 border rounded-lg" />
                <select name="student_class" value={s.student_class} onChange={e => handleChange(e, 'students', idx)} className="p-3 border rounded-lg">
                  <option value="">Select Class</option>
                  <option value="NURSERY_1">Nursery 1</option>
                  <option value="NURSERY_2">Nursery 2</option>
                  <option value="PRE_K">Pre-K</option>
                  <option value="KINDERGARTEN">Kindergarten</option>
                  <option value="GRADE_1">Grade 1</option>
                  <option value="GRADE_2">Grade 2</option>
                  <option value="GRADE_3">Grade 3</option>
                  <option value="GRADE_4">Grade 4</option>
                  <option value="GRADE_5">Grade 5</option>
                  <option value="GRADE_6">Grade 6</option>
                  <option value="GRADE_7">Grade 7</option>
                  <option value="GRADE_8">Grade 8</option>
                  <option value="GRADE_9">Grade 9</option>
                  <option value="GRADE_10">Grade 10</option>
                  <option value="GRADE_11">Grade 11</option>
                  <option value="GRADE_12">Grade 12</option>
            </select>
                {students.length > 1 && <button className="text-red-500" onClick={() => removeStudent(idx)}>Remove</button>}
          </div>
            ))}
            <button className="px-4 py-2 rounded bg-green-500 text-white mt-2" onClick={addStudent}>Add Another Student</button>
            <div className="flex justify-between mt-6">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={prevStep}>Back</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Registering...' : 'Register'}</button>
          </div>
            {Object.values(errors).map((err, i) => <p key={i} className="text-red-500 text-sm mt-2">{String(err)}</p>)}
          </>
        )}
        {step === 2 && role === 'teacher' && (
          <>
            <h2 className="text-lg font-semibold mb-4">Teacher Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input name="firstName" value={teacher.firstName} onChange={e => handleChange(e, 'teacher')} placeholder="First Name" className="p-3 border rounded-lg" />
              <input name="lastName" value={teacher.lastName} onChange={e => handleChange(e, 'teacher')} placeholder="Last Name" className="p-3 border rounded-lg" />
              <input name="email" value={teacher.email} onChange={e => handleChange(e, 'teacher')} placeholder="Email" className="p-3 border rounded-lg" />
              <input name="employee_id" value={teacher.employee_id} onChange={e => handleChange(e, 'teacher')} placeholder="Employment ID (e.g., Emp-001)" className="p-3 border rounded-lg" />
              <input name="subject" value={teacher.subject} onChange={e => handleChange(e, 'teacher')} placeholder="Subject" className="p-3 border rounded-lg" />
              <input name="phone" value={teacher.phone} onChange={e => handleChange(e, 'teacher')} placeholder="Phone" className="p-3 border rounded-lg" />
            </div>
            <div className="flex justify-between mt-6">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={prevStep}>Back</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Registering...' : 'Register'}</button>
            </div>
            {Object.values(errors).map((err, i) => <p key={i} className="text-red-500 text-sm mt-2">{String(err)}</p>)}
          </>
        )}
        {step === 2 && role === 'admin' && (
          <>
            <h2 className="text-lg font-semibold mb-4">Admin Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input name="firstName" value={admin.firstName} onChange={e => handleChange(e, 'admin')} placeholder="First Name" className="p-3 border rounded-lg" />
              <input name="lastName" value={admin.lastName} onChange={e => handleChange(e, 'admin')} placeholder="Last Name" className="p-3 border rounded-lg" />
              <input name="email" value={admin.email} onChange={e => handleChange(e, 'admin')} placeholder="Email" className="p-3 border rounded-lg" />
          </div>
            <div className="flex justify-between mt-6">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={prevStep}>Back</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Registering...' : 'Register'}</button>
          </div>
            {Object.values(errors).map((err, i) => <p key={i} className="text-red-500 text-sm mt-2">{String(err)}</p>)}
          </>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;