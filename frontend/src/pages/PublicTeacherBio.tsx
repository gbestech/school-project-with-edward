// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { 
//   User, 
//   GraduationCap, 
//   Calendar, 
//   MapPin, 
//   Share2,
//   Copy,
//   CheckCircle,
//   ExternalLink,
//   ArrowLeft
// } from 'lucide-react';
// import TeacherService from '@/services/TeacherService';

// interface TeacherBioData {
//   id: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   qualification: string;
//   specialization: string;
//   bio: string;
//   hire_date: string;
//   photo?: string;
//   staff_type: string;
//   user?: {
//     first_name: string;
//     last_name: string;
//     email: string;
//   };
// }

// const PublicTeacherBio: React.FC = () => {
//   const { teacherId } = useParams<{ teacherId: string }>();
//   const [teacherData, setTeacherData] = useState<TeacherBioData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [copied, setCopied] = useState(false);

//   useEffect(() => {
//     loadTeacherBio();
//   }, [teacherId]);

//   const loadTeacherBio = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       if (!teacherId) {
//         throw new Error('Teacher ID not found');
//       }

//       const response = await TeacherService.getTeacher(parseInt(teacherId));
//       setTeacherData(response);
//     } catch (error) {
//       console.error('Error loading teacher bio:', error);
//       setError('Teacher bio not found or unavailable.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getYearsOfService = () => {
//     if (!teacherData?.hire_date) return 0;
//     const hireDate = new Date(teacherData.hire_date);
//     const currentDate = new Date();
//     return Math.floor((currentDate.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
//   };

//   const copyToClipboard = async () => {
//     try {
//       await navigator.clipboard.writeText(window.location.href);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (error) {
//       console.error('Failed to copy:', error);
//     }
//   };

//   const shareOnSocialMedia = (platform: string) => {
//     const url = encodeURIComponent(window.location.href);
//     const text = encodeURIComponent(`Meet ${teacherData?.first_name} ${teacherData?.last_name}, a dedicated teacher at our school!`);
    
//     let shareUrl = '';
    
//     switch (platform) {
//       case 'twitter':
//         shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
//         break;
//       case 'facebook':
//         shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
//         break;
//       case 'linkedin':
//         shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
//         break;
//       case 'whatsapp':
//         shareUrl = `https://wa.me/?text=${text}%20${url}`;
//         break;
//       default:
//         return;
//     }
    
//     window.open(shareUrl, '_blank', 'width=600,height=400');
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
//         <div className="flex flex-col items-center space-y-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//           <p className="text-slate-600 dark:text-slate-400 text-sm">Loading teacher bio...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !teacherData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
//         <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg max-w-md mx-4 text-center">
//           <div className="text-red-500 mb-4">
//             <User className="w-16 h-16 mx-auto" />
//           </div>
//           <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Teacher Not Found</h2>
//           <p className="text-slate-600 dark:text-slate-400 mb-6">{error || 'The teacher bio you are looking for is not available.'}</p>
//           <button
//             onClick={() => window.history.back()}
//             className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             <span>Go Back</span>
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
//       {/* Header */}
//       <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
//                  {teacherData.photo ? (
//                    <img 
//                      src={teacherData.photo}
//                      alt="Profile"
//                      className="w-16 h-16 rounded-full object-cover"
//                      onError={(e) => {
//                        // Fallback to initials if image fails to load
//                        const target = e.target as HTMLImageElement;
//                        target.style.display = 'none';
//                        const parent = target.parentElement;
//                        if (parent) {
//                          const initials = document.createElement('span');
//                          initials.className = 'text-xl font-bold text-white';
//                          initials.textContent = `${teacherData.first_name?.charAt(0) || ''}${teacherData.last_name?.charAt(0) || ''}`;
//                          parent.appendChild(initials);
//                        }
//                      }}
//                    />
//                  ) : (
//                    <span className="text-xl font-bold text-white">
//                      {teacherData.first_name?.charAt(0) || teacherData.user?.first_name?.charAt(0) || ''}{teacherData.last_name?.charAt(0) || teacherData.user?.last_name?.charAt(0) || ''}
//                    </span>
//                  )}
//                </div>
//                              <div>
//                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
//                    {teacherData.user?.first_name || teacherData.first_name} {teacherData.user?.last_name || teacherData.last_name}
//                  </h1>
//                  <p className="text-slate-600 dark:text-slate-400">
//                    {teacherData.staff_type || 'Teaching Staff'}
//                  </p>
//                </div>
//             </div>
            
//             {/* Share Button */}
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={copyToClipboard}
//                 className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
//               >
//                 {copied ? (
//                   <>
//                     <CheckCircle className="w-4 h-4 text-green-500" />
//                     <span>Copied!</span>
//                   </>
//                 ) : (
//                   <>
//                     <Copy className="w-4 h-4" />
//                     <span>Copy Link</span>
//                   </>
//                 )}
//               </button>
//               <button
//                 onClick={() => shareOnSocialMedia('twitter')}
//                 className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//                 title="Share on Twitter"
//               >
//                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
//                 </svg>
//               </button>
//               <button
//                 onClick={() => shareOnSocialMedia('facebook')}
//                 className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 title="Share on Facebook"
//               >
//                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
//                 </svg>
//               </button>
//               <button
//                 onClick={() => shareOnSocialMedia('whatsapp')}
//                 className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//                 title="Share on WhatsApp"
//               >
//                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
//           {/* Teacher Info */}
//           <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="flex items-center space-x-3">
//                 <GraduationCap className="w-6 h-6" />
//                 <div>
//                   <p className="text-blue-100 text-sm">Qualification</p>
//                   <p className="font-semibold">{teacherData.qualification || 'Not specified'}</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <Calendar className="w-6 h-6" />
//                 <div>
//                   <p className="text-blue-100 text-sm">Years of Service</p>
//                   <p className="font-semibold">{getYearsOfService()} years</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <MapPin className="w-6 h-6" />
//                 <div>
//                   <p className="text-blue-100 text-sm">Specialization</p>
//                   <p className="font-semibold">{teacherData.specialization || 'Not specified'}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Bio Content */}
//           <div className="p-8">
//                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
//                About {teacherData.user?.first_name || teacherData.first_name}
//              </h2>
            
//             {teacherData.bio ? (
//               <div className="prose prose-slate dark:prose-invert max-w-none">
//                 <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
//                   <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
//                     {teacherData.bio}
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
//                 <p className="text-slate-500 dark:text-slate-400 text-lg">
//                   Bio not available yet.
//                 </p>
//               </div>
//             )}

//             {/* Contact Info */}
//             <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
//                     <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
//                                          <p className="font-medium text-slate-900 dark:text-white">{teacherData.user?.email || teacherData.email}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
//                     <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-500 dark:text-slate-400">Position</p>
//                     <p className="font-medium text-slate-900 dark:text-white">{teacherData.staff_type || 'Teaching Staff'}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-8 text-center">
//                      <p className="text-slate-500 dark:text-slate-400 text-sm">
//              This is a public profile shared by {teacherData.user?.first_name || teacherData.first_name} {teacherData.user?.last_name || teacherData.last_name}
//            </p>
//           <div className="mt-4 flex items-center justify-center space-x-4">
//             <button
//               onClick={() => window.history.back()}
//               className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               <span>Go Back</span>
//             </button>
//             <span className="text-slate-300 dark:text-slate-600">|</span>
//             <a
//               href="/"
//               className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
//             >
//               <span>Visit Our School</span>
//               <ExternalLink className="w-4 h-4" />
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PublicTeacherBio;
