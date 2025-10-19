import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Award, BookOpen, GraduationCap, Users, Briefcase, AlertCircle, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import TeacherService from "@/services/TeacherService";

const PublicTeacherBio: React.FC = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeacherBio();
  }, [teacherId]);

  const loadTeacherBio = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    if (!teacherId) {
      throw new Error("Teacher ID not found");
    }

    const response = await TeacherService.getTeacher(parseInt(teacherId));
    
    // 👇 ADD THESE DEBUG LOGS
    console.log("=== PUBLIC BIO DEBUG ===");
    console.log("1. Full response:", response);
    console.log("2. response.user:", response.user);
    console.log("3. response.user?.bio:", response.user?.bio);
    console.log("4. Type of response.user:", typeof response.user);
    console.log("5. response.user exists?", !!response.user);
    console.log("6. Bio exists?", !!response.user?.bio);
    console.log("7. Bio length:", response.user?.bio?.length);
    console.log("======================");
    
    setProfileData(response);
    
    // 👇 ADD THIS LOG AFTER STATE UPDATE
    console.log("8. profileData set to:", response);
    
  } catch (error) {
    console.error("Error loading teacher bio:", error);
    setError(error instanceof Error ? error.message : "Failed to load teacher bio");
  } finally {
    setIsLoading(false);
  }
};

  const getBio = () => {
  
  if (!profileData) {
    console.log("getBio - No profileData");
    return "";
  }
  
  if (!profileData.user) {
    console.log("getBio - No user object in profileData");
    return "";
  }
  
  const bio = profileData.user.bio || "";
  
  
  return bio;
};
  const getProfilePicture = () => {
    return profileData?.photo || 
           profileData?.user?.photo || 
           profileData?.user?.profile_picture ||
           null;
  };

  const getYearsOfService = () => {
    if (!profileData?.hire_date) return 0;
    const hireDate = new Date(profileData.hire_date);
    const currentDate = new Date();
    return Math.floor((currentDate.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Loading teacher profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Profile Not Found</h3>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {error || "The teacher profile you're looking for is not available."}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium w-full"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const bioContent = getBio();
  const firstName = profileData?.user?.first_name || profileData?.first_name || "Teacher";
  const lastName = profileData?.user?.last_name || profileData?.last_name || "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <button
            onClick={() => navigate('teaher/dashboard')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden ring-4 ring-white/30">
                {getProfilePicture() ? (
                  <img src={getProfilePicture()} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {firstName?.charAt(0)}{lastName?.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                {firstName} {lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg font-medium">
                  {profileData?.staff_type || "Teaching Staff"}
                </span>
                <span className="text-white/70">•</span>
                <span className="text-white/90">{getYearsOfService()} years of service</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Bio Section */}
        {/* Bio Section */}
<div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">
    About {profileData?.user?.first_name || profileData?.first_name}
  </h2>
  
  {profileData?.user?.bio ? (
    <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
      {profileData.user.bio}
    </div>
  ) : (
    <div className="text-center py-8">
      <User className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
      <p className="text-slate-500 dark:text-slate-400 text-sm">
        Bio not available yet. The teacher hasn't added their bio information.
      </p>
    </div>
  )}
</div>

        {/* Professional Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Qualification */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Qualification</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              {profileData?.qualification || "Not specified"}
            </p>
          </div>

          {/* Specialization */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Specialization</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              {profileData?.specialization || "Not specified"}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">Teaching Overview</h3>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-4 sm:p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {profileData?.assigned_subjects?.length || 0}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Subjects</div>
            </div>
            <div className="text-center p-4 sm:p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {profileData?.classroom_assignments?.length || 0}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Classes</div>
            </div>
            <div className="text-center p-4 sm:p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {profileData?.classroom_assignments?.reduce(
                  (sum: number, a: { student_count?: number }) => sum + (a.student_count || 0),
                  0
                ) || 0}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Students</div>
            </div>
          </div>
        </div>

        {/* Contact Info (if available) */}
        {(profileData?.user?.email || profileData?.phone_number) && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">Contact Information</h3>
            <div className="space-y-4">
              {profileData?.user?.email && (
                <div className="flex items-center gap-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</div>
                    <a 
                      href={`mailto:${profileData.user.email}`}
                      className="text-sm sm:text-base font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all"
                    >
                      {profileData.user.email}
                    </a>
                  </div>
                </div>
              )}
              {profileData?.phone_number && (
                <div className="flex items-center gap-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Phone</div>
                    <a 
                      href={`tel:${profileData.phone_number}`}
                      className="text-sm sm:text-base font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {profileData.phone_number}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicTeacherBio;


