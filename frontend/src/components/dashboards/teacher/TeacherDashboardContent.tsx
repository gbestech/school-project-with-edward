// import React from 'react';
// import { 
//   GraduationCap, 
//   Users, 
//   Calendar, 
//   FileText, 
//   MessageSquare, 
//   Clock,
//   TrendingUp,
//   Award,
//   CheckSquare,
  
//   BarChart3,
//   Bell,
//   Activity
// } from 'lucide-react';
// import { useAuth } from '@/hooks/useAuth';
// import { useNavigate } from 'react-router-dom';
// import { TeacherUserData } from '@/types/types';

// interface TeacherDashboardContentProps {
//   dashboardData: any;
//   onRefresh: () => void;
//   error?: string | null;
// }

// const TeacherDashboardContent: React.FC<TeacherDashboardContentProps> = ({ 
//   dashboardData
// }) => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const teacher = user as TeacherUserData;
//   const teacherData = teacher?.teacher_data;

//   console.log("Teacher data", teacherData)

//   // Add safety checks
//   if (!dashboardData) {
//     return (
//       <div className="p-4">
//         <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
//           <p className="text-yellow-800 dark:text-yellow-200">Loading dashboard data...</p>
//         </div>
//       </div>
//     );
//   }

//   // Use real data from dashboardData or fallback to mock data
//   const stats = dashboardData?.stats || {
//     totalStudents: 0,
//     totalClasses: 0,
//     totalSubjects: 0,
//     attendanceRate: 0,
//     pendingExams: 0,
//     unreadMessages: 0,
//     upcomingLessons: 0,
//     recentResults: 0
//   };

//   // Ensure all stats values are numbers to prevent React errors
//   const safeStats = {
//     totalStudents: Number(stats.totalStudents) || 0,
//     totalClasses: Number(stats.totalClasses) || 0,
//     totalSubjects: Number(stats.totalSubjects) || 0,
//     attendanceRate: Number(stats.attendanceRate) || 0,
//     pendingExams: Number(stats.pendingExams) || 0,
//     unreadMessages: Number(stats.unreadMessages) || 0,
//     upcomingLessons: Number(stats.upcomingLessons) || 0,
//     recentResults: Number(stats.recentResults) || 0
//   };

//   // Extract activities and events from dashboardData
//   const activities = dashboardData?.activities || [];
//   const events = dashboardData?.events || [];
//   const classes = dashboardData?.classes || [];
//   const subjects = dashboardData?.subjects || [];
//   const exams = dashboardData?.exams || [];

//   const quickActions = [
//     {
//       id: 'attendance',
//       title: 'Mark Attendance',
//       description: 'Record student attendance',
//       icon: CheckSquare,
//       color: 'bg-green-500',
//       path: '/teacher/attendance'
//     },
//     {
//       id: 'exam',
//       title: 'Create Exam',
//       description: 'Set up new examination',
//       icon: FileText,
//       color: 'bg-blue-500',
//       path: '/teacher/exams'
//     },
//     {
//       id: 'result',
//       title: 'Record Results',
//       description: 'Enter student results',
//       icon: Award,
//       color: 'bg-purple-500',
//       path: '/teacher/results'
//     },
//     {
//       id: 'message',
//       title: 'Send Message',
//       description: 'Communicate with students/parents',
//       icon: MessageSquare,
//       color: 'bg-orange-500',
//       path: '/teacher/messages'
//     },
//     {
//       id: 'schedule',
//       title: 'View Schedule',
//       description: 'Check your teaching schedule',
//       icon: Calendar,
//       color: 'bg-indigo-500',
//       path: '/teacher/schedule'
//     },
//     {
//       id: 'reports',
//       title: 'Generate Reports',
//       description: 'Create performance reports',
//       icon: BarChart3,
//       color: 'bg-teal-500',
//       path: '/teacher/reports'
//     }
//   ];

//   const handleQuickAction = (action: any) => {
//     navigate(action.path);
//   };

//   try {
//     console.log('🔍 TeacherDashboardContent - About to render component');
    
//     return (
//       <div className="p-4 space-y-6">
//         {/* Welcome Header with Profile Picture */}
//         <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
//           <div className="flex items-center justify-between">
//             <div className="flex-1">
//               <h1 className="text-3xl font-bold mb-2">
//                 Welcome back, {teacherData?.user?.first_name || user?.first_name || 'Teacher'}!
//               </h1>
//               <p className="text-blue-100 text-lg mb-4">
//                 Ready to inspire and educate today?
//               </p>
//               <div className="flex items-center space-x-6 text-sm">
//                 <div className="flex items-center space-x-2">
//                   <Clock className="w-4 h-4" />
//                   <span>{new Date().toLocaleDateString('en-US', { 
//                     weekday: 'long', 
//                     year: 'numeric', 
//                     month: 'long', 
//                     day: 'numeric' 
//                   })}</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Activity className="w-4 h-4" />
//                   <span>Active Teacher</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <GraduationCap className="w-4 h-4" />
//                   <span>{teacherData?.department || 'Secondary'} Department</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Award className="w-4 h-4" />
//                   <span>{teacherData?.qualifications?.[0] || 'Teaching'} Staff</span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex flex-col items-center space-y-3">
//               {/* Teacher Profile Picture */}
//               <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
//                 {teacherData?.photo ? (
//                   <img 
//                     src={teacherData.photo} 
//                     alt="Teacher Profile" 
//                     className="w-20 h-20 rounded-full object-cover"
//                   />
//                 ) : (
//                   <Users className="w-12 h-12 text-white/80" />
//                 )}
//               </div>
//               <div className="text-center">
//                 <p className="font-semibold text-lg">{teacherData?.user?.first_name} {teacherData?.user?.last_name}</p>
//                 <p className="text-blue-100 text-sm">{teacherData?.employee_id || ''}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</p>
//                 <p className="text-2xl font-bold text-slate-900 dark:text-white">{safeStats.totalStudents}</p>
//               </div>
//               <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
//                 <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400">My Classes</p>
//                 <p className="text-2xl font-bold text-slate-900 dark:text-white">{safeStats.totalClasses}</p>
//               </div>
//               <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
//                 <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Subjects</p>
//                 <p className="text-2xl font-bold text-slate-900 dark:text-white">{safeStats.totalSubjects}</p>
//               </div>
//               <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
//                 <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Tasks</p>
//                 <p className="text-2xl font-bold text-slate-900 dark:text-white">{safeStats.pendingExams}</p>
//               </div>
//               <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
//                 <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {quickActions.map((action) => (
//             <div
//               key={action.id}
//               className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
//               onClick={() => handleQuickAction(action)}
//             >
//               <div className="flex items-center space-x-4">
//                 <div className={`p-3 rounded-lg ${action.color} text-white`}>
//                   <action.icon className="w-6 h-6" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{action.title}</h3>
//                   <p className="text-sm text-slate-600 dark:text-slate-400">{action.description}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Classes & Subjects Overview */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* My Classes */}
//           <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Classes</h3>
//               <GraduationCap className="w-5 h-5 text-slate-400" />
//             </div>
//             <div className="space-y-3">
//               {classes && classes.length > 0 ? (
//                 classes.slice(0, 5).map((classItem: any, index: number) => (
//                   <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
//                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-slate-900 dark:text-white">{classItem.name || `Class ${index + 1}`}</p>
//                       <p className="text-xs text-slate-500 dark:text-slate-400">{classItem.grade_level || 'Grade Level'} - {classItem.section || 'Section'}</p>
//                     </div>
//                     <span className="text-xs text-slate-400">{classItem.student_count || 0} students</span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-8">
//                   <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//                   <p className="text-slate-500 dark:text-slate-400">No classes assigned</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* My Subjects */}
//           <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Subjects</h3>
//               <Award className="w-5 h-5 text-slate-400" />
//             </div>
//             <div className="space-y-4">
//               {subjects && subjects.length > 0 ? (
//                 subjects.map((subject: any, index: number) => (
//                   <div key={subject.id || index} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-700/50">
//                     {/* Subject Header */}
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center space-x-3">
//                         <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
//                         <div>
//                           <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{subject.name}</h4>
//                           <p className="text-sm text-slate-500 dark:text-slate-400">{subject.code}</p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <span className="text-xs text-slate-400">
//                           {subject.assignments?.length || 0} class{subject.assignments?.length !== 1 ? 'es' : ''}
//                         </span>
//                       </div>
//                     </div>
                    
//                     {/* Classroom Assignments */}
//                     {subject.assignments && subject.assignments.length > 0 ? (
//                       <div className="space-y-2">
//                         <p className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Class Assignments:</p>
//                         {subject.assignments.map((assignment: any, assignmentIndex: number) => (
//                           <div key={assignment.id || assignmentIndex} className="flex items-center justify-between p-2 bg-white dark:bg-slate-600 rounded border border-slate-200 dark:border-slate-500">
//                             <div className="flex-1">
//                               <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
//                                 {assignment.classroom_name || 'Class'}
//                               </p>
//                               <p className="text-xs text-slate-500 dark:text-slate-400">
//                                 {assignment.grade_level} - {assignment.section} ({assignment.education_level})
//                               </p>
//                             </div>
//                             <div className="text-right text-xs text-slate-500 dark:text-slate-400">
//                               <div>{assignment.student_count || 0} students</div>
//                               <div>{assignment.periods_per_week || 1} periods/week</div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-sm text-slate-500 dark:text-slate-400 italic">No class assignments found</p>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-8">
//                   <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//                   <p className="text-slate-500 dark:text-slate-400">No subjects assigned</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* My Exams & Tests */}
//         <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Exams & Tests</h3>
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={() => navigate('/teacher/results')}
//                 className="text-sm px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//               >
//                 Results
//               </button>
//               <button
//                 onClick={() => navigate('/teacher/exams')}
//                 className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Manage
//               </button>
//             </div>
//           </div>
//           {exams && exams.length > 0 ? (
//             <div className="space-y-3">
//               {exams.slice(0, 5).map((exam: any) => (
//                 <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                     <div>
//                       <p className="text-sm font-medium text-slate-900 dark:text-white">{exam.title}</p>
//                       <p className="text-xs text-slate-500 dark:text-slate-400">{exam.subject_name || exam.subject?.name} • {exam.grade_level_name || exam.grade_level?.name}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
//                     {exam.exam_date && (
//                       <div className="flex items-center space-x-1">
//                         <Calendar className="w-3 h-3" />
//                         <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
//                       </div>
//                     )}
//                     <div className="flex items-center space-x-1">
//                       <Clock className="w-3 h-3" />
//                       <span>{exam.duration_minutes || 0} min</span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <button onClick={() => navigate('/teacher/exams')} className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded">View</button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//               <p className="text-slate-500 dark:text-slate-400">No exams yet</p>
//               <button
//                 onClick={() => navigate('/teacher/exams')}
//                 className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Create Exam
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Recent Results */}
//         <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Results</h3>
//             <button
//               onClick={() => navigate('/teacher/results')}
//               className="text-sm px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//             >
//               View All
//             </button>
//           </div>
//           <div className="space-y-3">
//             {dashboardData?.recentResults && dashboardData.recentResults.length > 0 ? (
//               dashboardData.recentResults.slice(0, 5).map((result: any, index: number) => (
//                 <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
//                     <div>
//                       <p className="text-sm font-medium text-slate-900 dark:text-white">
//                         {result.student_name || 'Student'}
//                       </p>
//                       <p className="text-xs text-slate-500 dark:text-slate-400">
//                         {result.subject_name || 'Subject'} • {result.exam_session || 'Session'}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
//                     <div className="flex items-center space-x-1">
//                       <Award className="w-3 h-3" />
//                       <span>{result.total_score || 0}%</span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         result.grade === 'A' ? 'bg-green-100 text-green-800' :
//                         result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
//                         result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
//                         result.grade === 'D' ? 'bg-orange-100 text-orange-800' :
//                         'bg-red-100 text-red-800'
//                       }`}>
//                         {result.grade || 'N/A'}
//                       </span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <button 
//                         onClick={() => navigate('/teacher/results')} 
//                         className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded"
//                       >
//                         View
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8">
//                 <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//                 <p className="text-slate-500 dark:text-slate-400">No recent results</p>
//                 <button
//                   onClick={() => navigate('/teacher/results')}
//                   className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//                 >
//                   Record Results
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Recent Activities & Upcoming Events */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Recent Activities */}
//           <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activities</h3>
//               <Clock className="w-5 h-5 text-slate-400" />
//             </div>
//             <div className="space-y-3">
//               {activities && activities.length > 0 ? (
//                 activities.slice(0, 5).map((activity: any, index: number) => (
//                   <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
//                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title || 'Activity'}</p>
//                       <p className="text-xs text-slate-500 dark:text-slate-400">{activity.description || 'No description'}</p>
//                     </div>
//                     <span className="text-xs text-slate-400">{activity.time || 'Recently'}</span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-8">
//                   <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//                   <p className="text-slate-500 dark:text-slate-400">No recent activities</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Upcoming Events */}
//           <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Events</h3>
//               <Calendar className="w-5 h-5 text-slate-400" />
//             </div>
//             <div className="space-y-3">
//               {events && events.length > 0 ? (
//                 events.slice(0, 5).map((event: any, index: number) => (
//                   <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
//                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-slate-900 dark:text-white">{event.title || 'Event'}</p>
//                       <p className="text-xs text-slate-500 dark:text-slate-400">{event.description || 'No description'}</p>
//                     </div>
//                     <span className="text-xs text-slate-400">{event.date || 'Soon'}</span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-8">
//                   <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//                   <p className="text-slate-500 dark:text-slate-400">No upcoming events</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Performance Overview */}
//         <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Performance Overview</h3>
//             <TrendingUp className="w-5 h-5 text-slate-400" />
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//               <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{safeStats.attendanceRate}%</div>
//               <div className="text-sm text-blue-600 dark:text-blue-400">Attendance Rate</div>
//             </div>
//             <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
//               <div className="text-2xl font-bold text-green-600 dark:text-green-400">{safeStats.recentResults}</div>
//               <div className="text-sm text-green-600 dark:text-green-400">Recent Results</div>
//             </div>
//             <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
//               <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{safeStats.upcomingLessons}</div>
//               <div className="text-sm text-purple-600 dark:text-purple-400">Upcoming Lessons</div>
//             </div>
//           </div>
//         </div>

//         {/* Success Message */}
//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <p className="text-green-800">
//             🎉 Dashboard is working perfectly! Stats: {safeStats.totalStudents} students, {safeStats.totalClasses} classes, {safeStats.totalSubjects} subjects
//           </p>
//         </div>
//       </div>
//     );
//   } catch (error) {
//     console.error('🔍 TeacherDashboardContent - Error during render:', error);
//     return (
//       <div className="p-4">
//         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
//           <p className="text-red-800 dark:text-red-200">Error rendering dashboard: {error instanceof Error ? error.message : 'Unknown error'}</p>
//         </div>
//       </div>
//     );
//   }
// };

// export default TeacherDashboardContent;


import React from 'react';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Clock,
  TrendingUp,
  Award,
  CheckSquare,
  BarChart3,
  Bell,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { TeacherUserData } from '@/types/types';

interface TeacherDashboardContentProps {
  dashboardData: any;
  onRefresh: () => void;
  error?: string | null;
}

const TeacherDashboardContent: React.FC<TeacherDashboardContentProps> = ({ 
  dashboardData
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const teacher = user as TeacherUserData;
  const teacherData = teacher?.teacher_data;

  console.log("Teacher data", teacherData);

  if (!dashboardData) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalStudents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    attendanceRate: 0,
    pendingExams: 0,
    unreadMessages: 0,
    upcomingLessons: 0,
    recentResults: 0
  };

  const safeStats = {
    totalStudents: Number(stats.totalStudents) || 0,
    totalClasses: Number(stats.totalClasses) || 0,
    totalSubjects: Number(stats.totalSubjects) || 0,
    attendanceRate: Number(stats.attendanceRate) || 0,
    pendingExams: Number(stats.pendingExams) || 0,
    unreadMessages: Number(stats.unreadMessages) || 0,
    upcomingLessons: Number(stats.upcomingLessons) || 0,
    recentResults: Number(stats.recentResults) || 0
  };

  const activities = dashboardData?.activities || [];
  const events = dashboardData?.events || [];
  const classes = dashboardData?.classes || [];
  const subjects = dashboardData?.subjects || [];
  const exams = dashboardData?.exams || [];

  const quickActions = [
    {
      id: 'attendance',
      title: 'Attendance',
      icon: CheckSquare,
      color: 'bg-green-500',
      path: '/teacher/attendance'
    },
    {
      id: 'exam',
      title: 'Exam',
      icon: FileText,
      color: 'bg-blue-500',
      path: '/teacher/exams'
    },
    {
      id: 'result',
      title: 'Results',
      icon: Award,
      color: 'bg-purple-500',
      path: '/teacher/results'
    },
    {
      id: 'message',
      title: 'Messages',
      icon: MessageSquare,
      color: 'bg-orange-500',
      path: '/teacher/messages'
    },
    {
      id: 'schedule',
      title: 'Schedule',
      icon: Calendar,
      color: 'bg-indigo-500',
      path: '/teacher/schedule'
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: BarChart3,
      color: 'bg-teal-500',
      path: '/teacher/reports'
    }
  ];

  const handleQuickAction = (action: any) => {
    navigate(action.path);
  };

  try {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 truncate">
                  Welcome back, {teacherData?.user?.first_name || user?.first_name || 'Teacher'}!
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm md:text-base mb-2 sm:mb-4">
                  Ready to inspire and educate today?
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{new Date().toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">Active</span>
                  </div>
                  <div className="hidden xs:flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{teacherData?.department || 'Secondary'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center border-3 border-white/30 flex-shrink-0">
                  {teacherData?.photo ? (
                    <img 
                      src={teacherData.photo} 
                      alt="Teacher Profile" 
                      className="w-14 h-14 sm:w-18 sm:h-18 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white/80" />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                    {teacherData?.user?.first_name} {teacherData?.user?.last_name}
                  </p>
                  <p className="text-blue-100 text-xs truncate">
                    {teacherData?.employee_id || 'ID'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <StatCard 
              label="Students" 
              value={safeStats.totalStudents} 
              icon={Users} 
              color="blue" 
            />
            <StatCard 
              label="Classes" 
              value={safeStats.totalClasses} 
              icon={GraduationCap} 
              color="green" 
            />
            <StatCard 
              label="Subjects" 
              value={safeStats.totalSubjects} 
              icon={Award} 
              color="purple" 
            />
            <StatCard 
              label="Tasks" 
              value={safeStats.pendingExams} 
              icon={Bell} 
              color="orange" 
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-lg transition-all active:scale-95"
              >
                <div className={`${action.color} p-2 rounded-lg text-white mb-2 inline-block`}>
                  <action.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white text-left">
                  {action.title}
                </h3>
              </button>
            ))}
          </div>

          {/* Classes & Subjects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <Section
              title="My Classes"
              icon={GraduationCap}
              items={classes}
              renderItem={(classItem, index) => (
                <div className="flex items-center space-x-2 p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">
                      {classItem.name || `Class ${index + 1}`}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {classItem.grade_level || 'Grade'} - {classItem.section || 'Section'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                    {classItem.student_count || 0}
                  </span>
                </div>
              )}
              emptyMessage="No classes assigned"
            />

            <Section
              title="My Subjects"
              icon={Award}
              items={subjects}
              renderItem={(subject) => (
                <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50">
                  <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-base font-semibold text-slate-900 dark:text-white truncate">
                          {subject.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {subject.code}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                      {subject.assignments?.length || 0}
                    </span>
                  </div>
                  {subject.assignments?.length > 0 && (
                    <div className="space-y-1.5 sm:space-y-2">
                      {subject.assignments.slice(0, 2).map((assignment: any, idx: number) => (
                        <div key={assignment.id || idx} className="text-xs p-1.5 sm:p-2 bg-white dark:bg-slate-600 rounded border border-slate-200 dark:border-slate-500">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {assignment.classroom_name}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 truncate">
                            {assignment.grade_level} {assignment.section}
                          </p>
                        </div>
                      ))}
                      {subject.assignments?.length > 2 && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          +{subject.assignments.length - 2} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              emptyMessage="No subjects assigned"
            />
          </div>

          {/* Exams */}
          <Section
            title="My Exams & Tests"
            icon={FileText}
            items={exams}
            actionButtons={[
              { label: 'Results', onClick: () => navigate('/teacher/results'), color: 'purple' },
              { label: 'Manage', onClick: () => navigate('/teacher/exams'), color: 'blue' }
            ]}
            renderItem={(exam) => (
              <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">
                      {exam.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {exam.subject_name || exam.subject?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {exam.exam_date && (
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(exam.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            )}
            emptyMessage="No exams yet"
          />

          {/* Recent Results */}
          <Section
            title="Recent Results"
            icon={Award}
            items={dashboardData?.recentResults}
            actionButtons={[
              { label: 'View All', onClick: () => navigate('/teacher/results'), color: 'purple' }
            ]}
            renderItem={(result) => (
              <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">
                      {result.student_name || 'Student'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {result.subject_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {result.total_score || 0}%
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                    result.grade === 'A' ? 'bg-green-100 text-green-800' :
                    result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                    result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.grade || 'N/A'}
                  </span>
                </div>
              </div>
            )}
            emptyMessage="No recent results"
          />

          {/* Activities & Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <Section
              title="Recent Activities"
              icon={Clock}
              items={activities}
              renderItem={(activity) => (
                <div className="flex items-center space-x-2 p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">
                      {activity.title || 'Activity'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {activity.description || 'No description'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                    {activity.time || 'Soon'}
                  </span>
                </div>
              )}
              emptyMessage="No recent activities"
            />

            <Section
              title="Upcoming Events"
              icon={Calendar}
              items={events}
              renderItem={(event) => (
                <div className="flex items-center space-x-2 p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">
                      {event.title || 'Event'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {event.description || 'No description'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                    {event.date || 'Soon'}
                  </span>
                </div>
              )}
              emptyMessage="No upcoming events"
            />
          </div>

          {/* Performance Overview */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                Performance Overview
              </h3>
              <TrendingUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <PerformanceCard 
                value={`${safeStats.attendanceRate}%`} 
                label="Attendance Rate" 
                color="blue" 
              />
              <PerformanceCard 
                value={safeStats.recentResults} 
                label="Recent Results" 
                color="green" 
              />
              <PerformanceCard 
                value={safeStats.upcomingLessons} 
                label="Upcoming Lessons" 
                color="purple" 
              />
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
            <p className="text-green-800 dark:text-green-200 text-xs sm:text-sm">
              Dashboard loaded: {safeStats.totalStudents} students, {safeStats.totalClasses} classes, {safeStats.totalSubjects} subjects
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error during render:', error);
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">
            Error rendering dashboard
          </p>
        </div>
      </div>
    );
  }
};

// Reusable Components
interface StatCardProps {
  label: string;
  value: number;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className={`${colorClasses[color]} w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 flex-shrink-0`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium mb-1">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
};

interface SectionProps {
  title: string;
  icon: any;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  actionButtons?: Array<{ label: string; onClick: () => void; color: string }>;
  emptyMessage: string;
}

const Section: React.FC<SectionProps> = ({ title, icon: Icon, items, renderItem, actionButtons, emptyMessage }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
    <div className="flex items-center justify-between mb-4 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
          {title}
        </h3>
      </div>
      {actionButtons && (
        <div className="flex gap-1.5 flex-shrink-0">
          {actionButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.onClick}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap"
              style={{
                backgroundColor: btn.color === 'purple' ? '#a855f7' : '#3b82f6',
                color: 'white'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </div>
    
    {items && items.length > 0 ? (
      <div className="space-y-2 sm:space-y-3">
        {items.slice(0, 5).map((item, idx) => (
          <div key={item.id || idx}>
            {renderItem(item, idx)}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-6 sm:py-8">
        <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-2 sm:mb-3" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {emptyMessage}
        </p>
      </div>
    )}
  </div>
);

interface PerformanceCardProps {
  value: string | number;
  label: string;
  color: 'blue' | 'green' | 'purple';
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ value, label, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-3 sm:p-4 text-center`}>
      <div className="text-xl sm:text-2xl font-bold">
        {value}
      </div>
      <div className="text-xs sm:text-sm font-medium mt-1">
        {label}
      </div>
    </div>
  );
};

export default TeacherDashboardContent;