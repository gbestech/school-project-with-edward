// import React, { useState, useEffect } from "react";
// import { User, Mail, Phone, Award, BookOpen, GraduationCap, Users, Briefcase, AlertCircle, ArrowLeft } from "lucide-react";
// import { useParams, useNavigate } from "react-router-dom";
// import TeacherService from "@/services/TeacherService";

// const PublicTeacherBio: React.FC = () => {
//   const { teacherId } = useParams<{ teacherId: string }>();
//   const navigate = useNavigate();
//   const [profileData, setProfileData] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     loadTeacherBio();
//   }, [teacherId]);

//   const loadTeacherBio = async () => {
//   try {
//     setIsLoading(true);
//     setError(null);
    
//     if (!teacherId) {
//       throw new Error("Teacher ID not found");
//     }

//     const response = await TeacherService.getTeacher(parseInt(teacherId));
    
//     // 👇 ADD THESE DEBUG LOGS
//     console.log("=== PUBLIC BIO DEBUG ===");
//     console.log("1. Full response:", response);
//     console.log("2. response.user:", response.user);
//     console.log("3. response.user?.bio:", response.user?.bio);
//     console.log("4. Type of response.user:", typeof response.user);
//     console.log("5. response.user exists?", !!response.user);
//     console.log("6. Bio exists?", !!response.user?.bio);
//     console.log("7. Bio length:", response.user?.bio?.length);
//     console.log("======================");
    
//     setProfileData(response);
    
//     // 👇 ADD THIS LOG AFTER STATE UPDATE
//     console.log("8. profileData set to:", response);
    
//   } catch (error) {
//     console.error("Error loading teacher bio:", error);
//     setError(error instanceof Error ? error.message : "Failed to load teacher bio");
//   } finally {
//     setIsLoading(false);
//   }
// };

//   const getBio = () => {
//   // Add explicit checks and logging
//   console.log("getBio called - profileData:", profileData);
//   console.log("getBio - profileData.user:", profileData?.user);
//   console.log("getBio - profileData.user.bio:", profileData?.user?.bio);
  
//   if (!profileData) {
//     console.log("getBio - No profileData");
//     return "";
//   }
  
//   if (!profileData.user) {
//     console.log("getBio - No user object in profileData");
//     return "";
//   }
  
//   const bio = profileData.user.bio || "";
//   console.log("getBio - Final bio value:", bio);
//   console.log("getBio - Bio length:", bio.length);
  
//   return bio;
// };
//   const getProfilePicture = () => {
//     return profileData?.photo || 
//            profileData?.user?.photo || 
//            profileData?.user?.profile_picture ||
//            null;
//   };

//   const getYearsOfService = () => {
//     if (!profileData?.hire_date) return 0;
//     const hireDate = new Date(profileData.hire_date);
//     const currentDate = new Date();
//     return Math.floor((currentDate.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
//         <div className="flex flex-col items-center space-y-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="text-slate-600 dark:text-slate-400 text-sm">Loading teacher profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !profileData) {
//     return (
//       <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
//         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md mx-4">
//           <div className="flex items-center space-x-3 mb-4">
//             <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
//             <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Profile Not Found</h3>
//           </div>
//           <p className="text-red-700 dark:text-red-300 mb-4">
//             {error || "The teacher profile you're looking for is not available."}
//           </p>
//           <button
//             onClick={() => navigate('/')}
//             className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium w-full"
//           >
//             Go to Homepage
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const bioContent = getBio();
//   const firstName = profileData?.user?.first_name || profileData?.first_name || "Teacher";
//   const lastName = profileData?.user?.last_name || profileData?.last_name || "";

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
//       {/* Header */}
//       <div className="bg-blue-600 text-white">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             <span className="text-sm font-medium">Back</span>
//           </button>

//           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
//             {/* Profile Picture */}
//             <div className="relative flex-shrink-0">
//               <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden ring-4 ring-white/30">
//                 {getProfilePicture() ? (
//                   <img src={getProfilePicture()} alt="Profile" className="w-full h-full object-cover" />
//                 ) : (
//                   <span className="text-3xl sm:text-4xl font-bold text-white">
//                     {firstName?.charAt(0)}{lastName?.charAt(0)}
//                   </span>
//                 )}
//               </div>
//             </div>
            
//             {/* Profile Info */}
//             <div className="flex-1 min-w-0">
//               <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
//                 {firstName} {lastName}
//               </h1>
//               <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
//                 <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg font-medium">
//                   {profileData?.staff_type || "Teaching Staff"}
//                 </span>
//                 <span className="text-white/70">•</span>
//                 <span className="text-white/90">{getYearsOfService()} years of service</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
//         {/* Bio Section */}
//         {/* Bio Section */}
// <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
//   <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">
//     About {profileData?.user?.first_name || profileData?.first_name}
//   </h2>
  
//   {profileData?.user?.bio ? (
//     <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
//       {profileData.user.bio}
//     </div>
//   ) : (
//     <div className="text-center py-8">
//       <User className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
//       <p className="text-slate-500 dark:text-slate-400 text-sm">
//         Bio not available yet. The teacher hasn't added their bio information.
//       </p>
//     </div>
//   )}
// </div>

//         {/* Professional Info */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
//           {/* Qualification */}
//           <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center gap-3 mb-3">
//               <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
//                 <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//               </div>
//               <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Qualification</h3>
//             </div>
//             <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
//               {profileData?.qualification || "Not specified"}
//             </p>
//           </div>

//           {/* Specialization */}
//           <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center gap-3 mb-3">
//               <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
//                 <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//               </div>
//               <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Specialization</h3>
//             </div>
//             <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
//               {profileData?.specialization || "Not specified"}
//             </p>
//           </div>
//         </div>

//         {/* Quick Stats */}
//         <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
//           <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">Teaching Overview</h3>
//           <div className="grid grid-cols-3 gap-3 sm:gap-4">
//             <div className="text-center p-4 sm:p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
//               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-2">
//                 <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//               </div>
//               <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
//                 {profileData?.assigned_subjects?.length || 0}
//               </div>
//               <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Subjects</div>
//             </div>
//             <div className="text-center p-4 sm:p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
//               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-2">
//                 <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//               </div>
//               <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
//                 {profileData?.classroom_assignments?.length || 0}
//               </div>
//               <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Classes</div>
//             </div>
//             <div className="text-center p-4 sm:p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
//               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-2">
//                 <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//               </div>
//               <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
//                 {profileData?.classroom_assignments?.reduce(
//                   (sum: number, a: { student_count?: number }) => sum + (a.student_count || 0),
//                   0
//                 ) || 0}
//               </div>
//               <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Students</div>
//             </div>
//           </div>
//         </div>

//         {/* Contact Info (if available) */}
//         {(profileData?.user?.email || profileData?.phone_number) && (
//           <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
//             <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">Contact Information</h3>
//             <div className="space-y-4">
//               {profileData?.user?.email && (
//                 <div className="flex items-center gap-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
//                   <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
//                     <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</div>
//                     <a 
//                       href={`mailto:${profileData.user.email}`}
//                       className="text-sm sm:text-base font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all"
//                     >
//                       {profileData.user.email}
//                     </a>
//                   </div>
//                 </div>
//               )}
//               {profileData?.phone_number && (
//                 <div className="flex items-center gap-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
//                   <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
//                     <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Phone</div>
//                     <a 
//                       href={`tel:${profileData.phone_number}`}
//                       className="text-sm sm:text-base font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
//                     >
//                       {profileData.phone_number}
//                     </a>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PublicTeacherBio;


import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Award, BookOpen, GraduationCap, Users, Briefcase, AlertCircle, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import TeacherService from "@/services/TeacherService";

const PublicTeacherBio: React.FC = () => {
  // 🚨 FIRST DEBUG - Component Loading
  console.log("🚀🚀🚀 PublicTeacherBio COMPONENT LOADED AT:", new Date().toISOString());
  
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔥 RENDER DEBUG - Every time component renders
  console.log("🔥 COMPONENT RENDER CHECK:", {
    renderTime: new Date().toISOString(),
    teacherId: teacherId,
    hasProfileData: !!profileData,
    hasUser: !!profileData?.user,
    hasBio: !!profileData?.user?.bio,
    bioLength: profileData?.user?.bio?.length,
    profileDataKeys: profileData ? Object.keys(profileData) : [],
    userKeys: profileData?.user ? Object.keys(profileData.user) : []
  });

  useEffect(() => {
    console.log("⚡ useEffect triggered - calling loadTeacherBio");
    loadTeacherBio();
  }, [teacherId]);

  const loadTeacherBio = async () => {
    try {
      console.log("📡 Starting loadTeacherBio for teacherId:", teacherId);
      setIsLoading(true);
      setError(null);
      
      if (!teacherId) {
        throw new Error("Teacher ID not found");
      }

      const response = await TeacherService.getTeacher(parseInt(teacherId));
      
      // 🔥 DETAILED DEBUG LOGS
      console.log("=== PUBLIC BIO DEBUG START ===");
      console.log("1. Full response object:", response);
      console.log("2. response.user object:", response.user);
      console.log("3. response.user?.bio:", response?.user?.bio);
      console.log("4. response.bio (if exists):", response?.bio);
      console.log("5. Type of response:", typeof response);
      console.log("6. Keys in response:", Object.keys(response));
      console.log("7. Keys in response.user:", response.user ? Object.keys(response.user) : "NO USER OBJECT");
      console.log("8. Bio exists in user?", !!response?.user?.bio);
      console.log("9. Bio type:", typeof response?.user?.bio);
      console.log("10. Bio length:", response?.user?.bio?.length || 0);
      console.log("11. First 200 chars of bio:", response?.user?.bio?.substring(0, 200) || "NO BIO");
      console.log("12. Is bio truthy?", response?.user?.bio ? "YES ✅" : "NO ❌");
      console.log("=== PUBLIC BIO DEBUG END ===");
      
      setProfileData(response);
      
      // 🔥 VERIFY STATE UPDATE
      console.log("✅ setProfileData called with:", response);
      console.log("✅ State should now have bio:", !!response?.user?.bio);
      
    } catch (error) {
      console.error("❌ ERROR in loadTeacherBio:", error);
      setError(error instanceof Error ? error.message : "Failed to load teacher bio");
    } finally {
      setIsLoading(false);
      console.log("🏁 loadTeacherBio finished, isLoading set to false");
    }
  };

  // 🔍 ADD EFFECT TO MONITOR STATE CHANGES
  useEffect(() => {
    console.log("📊 profileData STATE CHANGED:", {
      hasData: !!profileData,
      hasUser: !!profileData?.user,
      hasBio: !!profileData?.user?.bio,
      bioPreview: profileData?.user?.bio?.substring(0, 100)
    });
  }, [profileData]);

  if (isLoading) {
    console.log("⏳ Rendering LOADING state");
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading teacher profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    console.log("❌ Rendering ERROR state:", error);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-4" />
          <p className="text-red-700 text-center mb-4">{error || "Profile not found"}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  console.log("✅ Rendering MAIN CONTENT with profileData");
  
  const firstName = profileData?.user?.first_name || profileData?.first_name || "Teacher";
  const lastName = profileData?.user?.last_name || profileData?.last_name || "";
  const bioText = profileData?.user?.bio || "";

  console.log("📝 Display variables:", { firstName, lastName, bioLength: bioText.length });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold">{firstName} {lastName}</h1>
          <p className="text-white/80 mt-2">{profileData?.staff_type || "Teaching Staff"}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* 🔍 MEGA DEBUG BOX - Shows everything */}
        <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 border-4 border-yellow-700 p-6 mb-6 rounded-xl shadow-2xl">
          <h3 className="font-bold text-black text-2xl mb-4 flex items-center gap-2">
            🔍 DEBUG INFORMATION PANEL
          </h3>
          
          <div className="space-y-3 bg-white p-5 rounded-lg border-2 border-gray-300">
            <div className="text-lg">
              <strong className="text-blue-600">Component Status:</strong>
              <p className="ml-4 text-green-600 font-bold">✅ Component Loaded Successfully</p>
            </div>
            
            <div className="border-t-2 border-gray-200 pt-3 mt-3">
              <strong className="text-blue-600 text-lg">Data Status:</strong>
              <div className="ml-4 space-y-1 mt-2">
                <p>profileData exists: <strong className={profileData ? "text-green-600" : "text-red-600"}>{profileData ? "✅ YES" : "❌ NO"}</strong></p>
                <p>user object exists: <strong className={profileData?.user ? "text-green-600" : "text-red-600"}>{profileData?.user ? "✅ YES" : "❌ NO"}</strong></p>
                <p>bio field exists: <strong className={profileData?.user?.bio ? "text-green-600" : "text-red-600"}>{profileData?.user?.bio ? "✅ YES" : "❌ NO"}</strong></p>
                <p>bio type: <strong className="text-purple-600">{typeof profileData?.user?.bio}</strong></p>
                <p>bio length: <strong className="text-purple-600">{profileData?.user?.bio?.length || 0} characters</strong></p>
                <p>bioText variable: <strong className={bioText ? "text-green-600" : "text-red-600"}>{bioText ? "✅ HAS VALUE" : "❌ EMPTY"}</strong></p>
              </div>
            </div>
            
            <div className="border-t-2 border-gray-200 pt-3 mt-3">
              <strong className="text-blue-600 text-lg">Object Keys:</strong>
              <div className="ml-4 mt-2">
                <p className="text-sm"><strong>profileData keys:</strong></p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded mt-1">{profileData ? Object.keys(profileData).join(', ') : 'N/A'}</p>
                <p className="text-sm mt-2"><strong>user keys:</strong></p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded mt-1">{profileData?.user ? Object.keys(profileData.user).join(', ') : 'N/A'}</p>
              </div>
            </div>
            
            <div className="border-t-2 border-gray-200 pt-3 mt-3">
              <strong className="text-blue-600 text-lg">Bio Preview (First 300 characters):</strong>
              <div className="mt-2 p-4 bg-gray-50 rounded border border-gray-300 max-h-40 overflow-y-auto">
                <p className="text-sm font-mono whitespace-pre-wrap break-words">
                  {bioText ? bioText.substring(0, 300) + (bioText.length > 300 ? '...' : '') : "❌ NO BIO CONTENT - This is the problem!"}
                </p>
              </div>
            </div>
            
            <div className="border-t-2 border-gray-200 pt-3 mt-3">
              <strong className="text-blue-600 text-lg">Raw Data:</strong>
              <div className="mt-2 p-3 bg-gray-800 text-green-400 rounded font-mono text-xs max-h-60 overflow-y-auto">
                <pre>{JSON.stringify({ 
                  user: profileData?.user,
                  hasBio: !!profileData?.user?.bio,
                  bioLength: profileData?.user?.bio?.length 
                }, null, 2)}</pre>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded border-2 border-blue-400">
            <p className="text-sm text-blue-900">
              <strong>📋 Instructions:</strong> Take a screenshot of this entire debug box and share it. 
              It shows exactly what data the component is receiving.
            </p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
            About {firstName}
          </h2>
          
          <div className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
            {bioText || "❌ No bio available - Check debug box above"}
          </div>
          
          {/* Extra debug right in the bio section */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-xs">
            <p><strong>Bio Section Debug:</strong></p>
            <p>bioText value: {bioText ? `"${bioText.substring(0, 50)}..."` : "EMPTY STRING"}</p>
            <p>Conditional result: {bioText ? "Should show bio" : "Showing fallback message"}</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Qualification</h3>
            </div>
            <p className="text-slate-600">{profileData?.qualification || "Not specified"}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Specialization</h3>
            </div>
            <p className="text-slate-600">{profileData?.specialization || "Not specified"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicTeacherBio;
