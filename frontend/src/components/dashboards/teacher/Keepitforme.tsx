import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Award, GraduationCap, BookOpen, Users, Clock, Edit, Camera, Save, X, Plus, Trash2, Star, CheckCircle, AlertCircle, Building, Briefcase, Heart, Globe, Linkedin, Twitter, Facebook, Instagram, Download, Upload, Eye, EyeOff, FileText, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TeacherUserData } from "@/types/types";
import TeacherService from "@/services/TeacherService";

interface TeacherProfileProps {
  onRefresh?: () => void;
}

interface ProfileTab {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
}

const TeacherProfile: React.FC<TeacherProfileProps> = ({ onRefresh }) => {
  const { user } = useAuth();
  const teacher = user as TeacherUserData;
  const teacherData = teacher?.teacher_data;

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [showBioModal, setShowBioModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    qualification: "",
    specialization: "",
    bio: "",
    date_of_birth: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: ""
  });

  const tabs: ProfileTab[] = [
    { id: "overview", name: "Overview", icon: User },
    { id: "personal", name: "Personal Info", icon: User },
    { id: "professional", name: "Professional", icon: Briefcase },
    { id: "assignments", name: "Assignments", icon: GraduationCap },
    { id: "performance", name: "Performance", icon: Award },
    { id: "documents", name: "Documents", icon: FileText },
  ];

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let teacherId = null;
      if ((user as any)?.teacher_data?.id) {
        teacherId = (user as any).teacher_data.id;
      } else if (teacherData?.id) {
        teacherId = teacherData.id;
      } else {
        teacherId = 19;
      }

      if (!teacherId) {
        throw new Error("Teacher ID not found");
      }

      const response = await TeacherService.getTeacher(teacherId);
      setProfileData(response);
      
      const responseData = response as any;
      setFormData({
        first_name: responseData.user?.first_name || responseData.first_name || "",
        last_name: responseData.user?.last_name || responseData.last_name || "",
        email: responseData.user?.email || responseData.email || "",
        phone_number: responseData.phone_number || "",
        address: responseData.address || "",
        qualification: responseData.qualification || "",
        specialization: responseData.specialization || "",
        bio: responseData.bio || "",
        date_of_birth: responseData.date_of_birth || "",
        emergency_contact_name: responseData.emergency_contact_name || "",
        emergency_contact_phone: responseData.emergency_contact_phone || "",
        emergency_contact_relationship: responseData.emergency_contact_relationship || ""
      });
    } catch (error) {
      console.error("Error loading profile data:", error);
      setError(error instanceof Error ? error.message : "Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let teacherId = null;
      if ((user as any)?.teacher_data?.id) {
        teacherId = (user as any).teacher_data.id;
      } else if (teacherData?.id) {
        teacherId = teacherData.id;
      } else if (profileData?.id) {
        teacherId = profileData.id;
      } else {
        teacherId = 19;
      }

      if (!teacherId) {
        throw new Error("Teacher ID not found");
      }

      const updateData = {
        user: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email
        },
        phone_number: formData.phone_number,
        address: formData.address,
        qualification: formData.qualification,
        specialization: formData.specialization,
        bio: formData.bio,
        date_of_birth: formData.date_of_birth,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship
      };

      const response = await TeacherService.updateTeacher(teacherId, updateData);
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      setProfileData(response);
      
      const responseData = response as any;
      setFormData({
        first_name: responseData.user?.first_name || responseData.first_name || "",
        last_name: responseData.user?.last_name || responseData.last_name || "",
        email: responseData.user?.email || responseData.email || "",
        phone_number: responseData.phone_number || "",
        address: responseData.address || "",
        qualification: responseData.qualification || "",
        specialization: responseData.specialization || "",
        bio: responseData.bio || "",
        date_of_birth: responseData.date_of_birth || "",
        emergency_contact_name: responseData.emergency_contact_name || "",
        emergency_contact_phone: responseData.emergency_contact_phone || "",
        emergency_contact_relationship: responseData.emergency_contact_relationship || ""
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
    
    if (profileData) {
      const profileDataAny = profileData as any;
      setFormData({
        first_name: profileDataAny.user?.first_name || profileDataAny.first_name || "",
        last_name: profileDataAny.user?.last_name || profileDataAny.last_name || "",
        email: profileDataAny.user?.email || profileDataAny.email || "",
        phone_number: profileDataAny.phone_number || "",
        address: profileDataAny.address || "",
        qualification: profileDataAny.qualification || "",
        specialization: profileDataAny.specialization || "",
        bio: profileDataAny.bio || "",
        date_of_birth: profileDataAny.date_of_birth || "",
        emergency_contact_name: profileDataAny.emergency_contact_name || "",
        emergency_contact_phone: profileDataAny.emergency_contact_phone || "",
        emergency_contact_relationship: profileDataAny.emergency_contact_relationship || ""
      });
    }
  };

  const getProfilePicture = () => {
    return (profileData as any)?.photo || (teacherData as any)?.photo || null;
  };

  const getYearsOfService = () => {
    if (!profileData?.hire_date) return 0;
    const hireDate = new Date(profileData.hire_date);
    const currentDate = new Date();
    return Math.floor((currentDate.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
  };

  const truncateBio = (text: string, maxWords: number = 20) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  if (isLoading && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-white/70 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error Loading Profile</h3>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={loadProfileData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                  {getProfilePicture() ? (
                    <img
                      src={getProfilePicture()}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profileData?.user?.first_name || user?.first_name} {profileData?.user?.last_name || user?.last_name}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {profileData?.staff_type || "Teaching Staff"} • Employee ID: {profileData?.employee_id || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-200">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">Profile Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</label>
                        <p className="text-slate-900 dark:text-white">
                          {profileData?.user?.first_name || user?.first_name} {profileData?.user?.last_name || user?.last_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                        <p className="text-slate-900 dark:text-white">{profileData?.user?.email || user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</label>
                        <p className="text-slate-900 dark:text-white">{profileData?.phone_number || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Hire Date</label>
                        <p className="text-slate-900 dark:text-white">
                          {profileData?.hire_date ? new Date(profileData.hire_date).toLocaleDateString() : "Not available"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Qualification</label>
                        <p className="text-slate-900 dark:text-white">{profileData?.qualification || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Specialization</label>
                        <p className="text-slate-900 dark:text-white">{profileData?.specialization || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Years of Service</label>
                        <p className="text-slate-900 dark:text-white">{getYearsOfService()} years</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Subjects</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {profileData?.assigned_subjects?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Classes</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {profileData?.classroom_assignments?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Students</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {profileData?.classroom_assignments?.reduce((sum: number, assignment: any) => sum + (assignment.student_count || 0), 0) || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Bio</h3>
                  {profileData?.bio ? (
                    <div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {truncateBio(profileData.bio)}
                      </p>
                      {profileData.bio.split(" ").length > 20 && (
                        <button
                          onClick={() => setShowBioModal(true)}
                          className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                        >
                          View More
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 italic">
                      No bio provided. Click "Edit Profile" to add your bio.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-6">Performance Overview</h2>
                
                {/* Performance Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Attendance Rate</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">95%</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                        <span className="font-medium">Excellent</span>
                        <span className="ml-1">• Last 30 days</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Student Success Rate</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">87%</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                        <span className="font-medium">Above Average</span>
                        <span className="ml-1">• This term</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Lesson Completion</p>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">92%</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center text-sm text-purple-600 dark:text-purple-400">
                        <span className="font-medium">On Track</span>
                        <span className="ml-1">• This week</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Professional Rating</p>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">4.2/5</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                        <span className="font-medium">Outstanding</span>
                        <span className="ml-1">• Annual review</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Performance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Student Performance Impact</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Average Class Performance</span>
                        <span className="font-semibold text-slate-900 dark:text-white">87.5%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Students Improved</span>
                        <span className="font-semibold text-slate-900 dark:text-white">78%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Pass Rate</span>
                        <span className="font-semibold text-slate-900 dark:text-white">94%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Professional Development</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Training Hours</span>
                        <span className="font-semibold text-slate-900 dark:text-white">48 hrs</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Certifications</span>
                        <span className="font-semibold text-slate-900 dark:text-white">3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Workshops Attended</span>
                        <span className="font-semibold text-slate-900 dark:text-white">12</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "personal" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-6">Personal Information</h2>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        rows={4}
                        placeholder="Tell us about yourself, your teaching philosophy, and experience..."
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</label>
                      <p className="text-slate-900 dark:text-white">
                        {profileData?.user?.first_name || user?.first_name} {profileData?.user?.last_name || user?.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                      <p className="text-slate-900 dark:text-white">{profileData?.user?.email || user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone Number</label>
                      <p className="text-slate-900 dark:text-white">{profileData?.phone_number || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date of Birth</label>
                      <p className="text-slate-900 dark:text-white">
                        {profileData?.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString() : "Not provided"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Address</label>
                      <p className="text-slate-900 dark:text-white">{profileData?.address || "Not provided"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Bio</label>
                      {profileData?.bio ? (
                        <div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {truncateBio(profileData.bio)}
                          </p>
                          {profileData.bio.split(" ").length > 20 && (
                            <button
                              onClick={() => setShowBioModal(true)}
                              className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                            >
                              View More
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400 italic">No bio provided</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Contact Information */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Emergency Contact</h3>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contact Name</label>
                      <input
                        type="text"
                        value={formData.emergency_contact_name}
                        onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contact Phone</label>
                      <input
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Relationship</label>
                      <input
                        type="text"
                        value={formData.emergency_contact_relationship}
                        onChange={(e) => setFormData({...formData, emergency_contact_relationship: e.target.value})}
                        placeholder="e.g., Spouse, Parent, Sibling"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contact Name</label>
                      <p className="text-slate-900 dark:text-white">{profileData?.emergency_contact_name || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contact Phone</label>
                      <p className="text-slate-900 dark:text-white">{profileData?.emergency_contact_phone || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Relationship</label>
                      <p className="text-slate-900 dark:text-white">{profileData?.emergency_contact_relationship || "Not provided"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "professional" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-6">Professional Information</h2>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Qualification</label>
                      <input
                        type="text"
                        value={formData.qualification}
                        onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                        placeholder="e.g., B.Sc Education, M.Ed"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Specialization</label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                        placeholder="e.g., Mathematics, English Literature"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Hire Date</label>
                      <p className="text-slate-900 dark:text-white">
                        {profileData?.hire_date ? new Date(profileData.hire_date).toLocaleDateString() : "Not available"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Years of Service</label>
                      <p className="text-slate-900 dark:text-white">{getYearsOfService()} years</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Qualification</label>
                      <p className="text-slate-900 dark:text-white">{profileData?.qualification || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Specialization</label>
                      <p className="text-slate-900 dark:text-white">{profileData?.specialization || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Hire Date</label>
                      <p className="text-slate-900 dark:text-white">
                        {profileData?.hire_date ? new Date(profileData.hire_date).toLocaleDateString() : "Not available"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Years of Service</label>
                      <p className="text-slate-900 dark:text-white">{getYearsOfService()} years</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Professional Development */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Professional Development</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">48</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Training Hours</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">3</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Certifications</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Workshops Attended</div>
                  </div>
                </div>
              </div>

              {/* Teaching Experience */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Teaching Experience</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Primary Education</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">5 years experience</p>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">2016-2021</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Secondary Education</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">3 years experience</p>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">2021-Present</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "assignments" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-6">Current Assignments</h2>
                
                {/* Subject Assignments */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Subject Assignments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profileData?.assigned_subjects?.length > 0 ? (
                      profileData.assigned_subjects.map((subject: any, index: number) => (
                        <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-900 dark:text-white">{subject.name}</h4>
                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full">
                              {subject.grade_level}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{subject.description || "No description"}</p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">No subject assignments found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Class Assignments */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Class Assignments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profileData?.classroom_assignments?.length > 0 ? (
                      profileData.classroom_assignments.map((assignment: any, index: number) => (
                        <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-900 dark:text-white">{assignment.class_name}</h4>
                            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                              {assignment.student_count || 0} students
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{assignment.schedule || "Schedule not specified"}</p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">No class assignments found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Teaching Schedule */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Weekly Schedule</h3>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                        <div key={day} className="text-center">
                          <h4 className="font-medium text-slate-900 dark:text-white mb-2">{day}</h4>
                          <div className="space-y-2">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              <div>8:00 AM - 9:00 AM</div>
                              <div className="font-medium">Mathematics</div>
                              <div className="text-xs">Class 7A</div>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              <div>10:00 AM - 11:00 AM</div>
                              <div className="font-medium">English</div>
                              <div className="text-xs">Class 8B</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-6">Documents</h2>
              <p className="text-slate-500 dark:text-slate-400">Document management will be available here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bio Modal */}
      {showBioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Teacher Bio</h2>
                <button
                  onClick={() => setShowBioModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    About {profileData?.user?.first_name || user?.first_name} {profileData?.user?.last_name || user?.last_name}
                  </h3>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {profileData?.bio}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={async () => {
                    try {
                      const url = `${window.location.origin}/teacher/bio/${profileData?.id}`;
                      await navigator.clipboard.writeText(url);
                      setSuccessMessage("Shared link copied to clipboard!");
                      setShowBioModal(false);
                    } catch (error) {
                      console.error("Failed to copy link:", error);
                      setError("Failed to copy link. Please try again.");
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Bio</span>
                </button>
                <button
                  onClick={() => setShowBioModal(false)}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfile;
