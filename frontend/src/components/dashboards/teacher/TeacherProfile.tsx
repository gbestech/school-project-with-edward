import React, { useState, useEffect } from "react";
import { User, Award, GraduationCap, Edit, BookOpen, TrendingUp, Users, Camera, Save, X, CheckCircle, AlertCircle, Briefcase, FileText, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TeacherUserData } from "@/types/types";
import TeacherService from "@/services/TeacherService";
import AssignmentManagement from "./AssignmentManagement";

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
    date_of_birth: ""
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
      
      // First priority: Get from user.teacher_data.id
      if ((user as any)?.teacher_data?.id) {
        teacherId = (user as any).teacher_data.id;
      } 
      // Second priority: Get from teacherData.id
      else if (teacherData?.id) {
        teacherId = teacherData.id;
      } 
      // Third priority: Try to get from user ID by making an API call
      else if (user?.id) {
        try {
          // Try to find teacher by user ID
          const teachersResponse = await TeacherService.getTeachers({ 
            search: user.email || user.username 
          });
          
          if (teachersResponse.results && teachersResponse.results.length > 0) {
            const teacher = teachersResponse.results.find((t: any) => 
              t.user?.id === user.id || t.user?.email === user.email
            );
            
            if (teacher) {
              teacherId = teacher.id;
            }
          }
        } catch (error) {
          console.warn('Failed to find teacher by user lookup:', error);
        }
      }
      
      // If still no teacher ID found, show error
      if (!teacherId) {
        throw new Error("Teacher ID not found. Please ensure your teacher profile is properly set up.");
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
    bio: responseData.bio || "", // FIX: Get from top level, not user.bio
    date_of_birth: responseData.date_of_birth || "" // FIX: Already correct
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
      bio: profileDataAny.bio || "", // FIX: Get from top level
      date_of_birth: profileDataAny.date_of_birth || "",
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
      {/* <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
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
      </div> */}
       <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-600/5 dark:via-purple-600/5 dark:to-pink-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-white/50 dark:ring-slate-800/50">
                  {getProfilePicture() ? (
                    <img src={getProfilePicture()} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg hover:scale-110">
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {profileData?.user?.first_name || user?.first_name} {profileData?.user?.last_name || user?.last_name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm sm:text-base">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium">
                    {profileData?.staff_type || "Teaching Staff"}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">•</span>
                  <span className="text-slate-600 dark:text-slate-400">ID: {profileData?.employee_id || "N/A"}</span>
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all font-medium"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
       {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl p-4 shadow-lg animate-in slide-in-from-top">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        {/* <div className="border-b border-slate-200 dark:border-slate-700 mb-8">
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
        </div> */}

         <div className="mb-8">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex overflow-x-auto scrollbar-hide gap-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
         <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Summary Card */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-800/50">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Summary</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                        <p className="text-slate-900 dark:text-white mt-1 font-medium">
                          {profileData?.user?.first_name} {profileData?.user?.last_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</label>
                        <p className="text-slate-900 dark:text-white mt-1 font-medium">{profileData?.user?.email}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</label>
                        <p className="text-slate-900 dark:text-white mt-1 font-medium">{profileData?.phone_number || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qualification</label>
                        <p className="text-slate-900 dark:text-white mt-1 font-medium">{profileData?.qualification || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Specialization</label>
                        <p className="text-slate-900 dark:text-white mt-1 font-medium">{profileData?.specialization || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Years of Service</label>
                        <p className="text-slate-900 dark:text-white mt-1 font-medium">{getYearsOfService()} years</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-800/50">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Subjects</span>
                      </div>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {profileData?.assigned_subjects?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Classes</span>
                      </div>
                      <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {profileData?.classroom_assignments?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Students</span>
                      </div>
                      <span className="text-xl font-bold text-pink-600 dark:text-pink-400">
                        {profileData?.classroom_assignments?.reduce(
                          (sum: number, a: { student_count?: number }) => sum + (a.student_count || 0),
                          0
                        ) || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio Card */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-800/50">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Bio</h3>
                  {profileData?.bio ? (
                    <div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                        {truncateBio(profileData.bio)}
                      </p>
                      {profileData.bio.split(" ").length > 20 && (
                        <button
                          onClick={() => setShowBioModal(true)}
                          className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold transition-colors"
                        >
                          Read More →
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                      No bio provided. Click "Edit Profile" to add your bio.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "personal" && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Personal Information</h2>
              
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows={4}
                      placeholder="Tell us about yourself, your teaching philosophy, and experience..."
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                    <p className="text-slate-900 dark:text-white mt-1 font-medium">
                      {profileData?.user?.first_name} {profileData?.user?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</label>
                    <p className="text-slate-900 dark:text-white mt-1 font-medium">{profileData?.user?.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                    <p className="text-slate-900 dark:text-white mt-1 font-medium">{profileData?.phone_number || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date of Birth</label>
                    <p className="text-slate-900 dark:text-white mt-1 font-medium">
                      {profileData?.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString() : "Not provided"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Address</label>
                    <p className="text-slate-900 dark:text-white mt-1 font-medium">{profileData?.address || "Not provided"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bio</label>
                    {profileData?.bio ? (
                      <div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                          {truncateBio(profileData.bio)}
                        </p>
                        {profileData.bio.split(" ").length > 20 && (
                          <button
                            onClick={() => setShowBioModal(true)}
                            className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold transition-colors"
                          >
                            Read More →
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 italic mt-2">
                        No bio provided. Click "Edit Profile" to add your bio.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "professional" && (
            <div className="space-y-6">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-800/50">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Professional Information</h2>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Qualification</label>
                      <input
                        type="text"
                        value={formData.qualification}
                        onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                        placeholder="e.g., B.Sc Education, M.Ed"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Specialization</label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                        placeholder="e.g., Mathematics, English Literature"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qualification</label>
                      <p className="text-slate-900 dark:text-white mt-1 font-medium">{profileData?.qualification || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Specialization</label>
                      <p className="text-slate-900 dark:text-white mt-1 font-medium">{profileData?.specialization || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hire Date</label>
                      <p className="text-slate-900 dark:text-white mt-1 font-medium">
                        {profileData?.hire_date ? new Date(profileData.hire_date).toLocaleDateString() : "Not available"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Years of Service</label>
                      <p className="text-slate-900 dark:text-white mt-1 font-medium">{getYearsOfService()} years</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Professional Development */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-800/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Professional Development</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">48</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Training Hours</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">3</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Certifications</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">12</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Workshops</div>
                  </div>
                </div>
              </div>

              {/* Teaching Experience */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-800/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Teaching Experience</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Primary Education</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">5 years experience</p>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">2016-2021</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Secondary Education</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">3 years experience</p>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">2021-Present</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-6">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-800/50">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Performance Overview</h2>
                
                {/* Performance Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-white/70" />
                    </div>
                    <p className="text-sm font-medium text-white/80 mb-1">Attendance Rate</p>
                    <p className="text-3xl font-bold">95%</p>
                    <p className="text-xs text-white/70 mt-2">Excellent • Last 30 days</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Users className="w-6 h-6" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-white/70" />
                    </div>
                    <p className="text-sm font-medium text-white/80 mb-1">Student Success</p>
                    <p className="text-3xl font-bold">87%</p>
                    <p className="text-xs text-white/70 mt-2">Above Average • This term</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-white/70" />
                    </div>
                    <p className="text-sm font-medium text-white/80 mb-1">Lesson Completion</p>
                    <p className="text-3xl font-bold">92%</p>
                    <p className="text-xs text-white/70 mt-2">On Track • This week</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Award className="w-6 h-6" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-white/70" />
                    </div>
                    <p className="text-sm font-medium text-white/80 mb-1">Professional Rating</p>
                    <p className="text-3xl font-bold">4.2/5</p>
                    <p className="text-xs text-white/70 mt-2">Outstanding • Annual review</p>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Student Performance Impact</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Average Class Performance</span>
                        <span className="font-bold text-slate-900 dark:text-white">87.5%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Students Improved</span>
                        <span className="font-bold text-slate-900 dark:text-white">78%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Pass Rate</span>
                        <span className="font-bold text-slate-900 dark:text-white">94%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Professional Development</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Training Hours</span>
                        <span className="font-bold text-slate-900 dark:text-white">48 hrs</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Certifications</span>
                        <span className="font-bold text-slate-900 dark:text-white">3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Workshops Attended</span>
                        <span className="font-bold text-slate-900 dark:text-white">12</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "assignments" && (
            <AssignmentManagement
              teacherId={profileData?.id || 0}
              profileData={profileData}
              onRefresh={loadProfileData}
            />
          )}

          {activeTab === "documents" && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Documents</h2>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">Document management will be available here.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bio Modal */}
      {/* Bio Modal */}
      {showBioModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Teacher Bio</h2>
                <button
                  onClick={() => setShowBioModal(false)}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  About {profileData?.user?.first_name} {profileData?.user?.last_name}
                </h3>
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {profileData?.bio}
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
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
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Bio</span>
                </button>
                <button
                  onClick={() => setShowBioModal(false)}
                  className="flex-1 px-5 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all font-medium"
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


