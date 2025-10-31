
// import React, { useState, useEffect, useMemo } from 'react';
// import { 
//   Calendar, 
//   Clock, 
//   MapPin, 
//   User,  
//   RefreshCw, 
//   ChevronLeft, 
//   ChevronRight,
//   Filter,
//   Grid3x3,
//   List,
//   Eye,
//   EyeOff,
//   Coffee
// } from 'lucide-react';

// // Import types from StudentService to ensure consistency
// import { 
//   StudentSchedule as StudentScheduleType, 
//   DaySchedule, 
//   ScheduleItem as Period, // Alias to match component naming
//   Subject,
//   Teacher,
//   Classroom,
//   ScheduleFilters
// } from '@/services/StudentService';

// interface StudentScheduleProps {
//   scheduleData: StudentScheduleType | null;
//   loading?: boolean;
//   error?: string | null;
//   onRefresh?: () => void;
//   onFilterChange?: (filters: ScheduleFilters) => void;
// }

// // Utility functions
// const formatTime = (timeString: string): string => {
//   try {
//     const [hours, minutes] = timeString.split(':');
//     const date = new Date();
//     date.setHours(parseInt(hours), parseInt(minutes));
//     return date.toLocaleTimeString('en-US', { 
//       hour: 'numeric', 
//       minute: '2-digit',
//       hour12: true 
//     });
//   } catch {
//     return timeString;
//   }
// };

// const getSubjectColor = (subject: string): string => {
//   const colors = [
//     'bg-gradient-to-br from-blue-500 to-blue-600',
//     'bg-gradient-to-br from-green-500 to-green-600',
//     'bg-gradient-to-br from-purple-500 to-purple-600',
//     'bg-gradient-to-br from-red-500 to-red-600',
//     'bg-gradient-to-br from-yellow-500 to-yellow-600',
//     'bg-gradient-to-br from-pink-500 to-pink-600',
//     'bg-gradient-to-br from-indigo-500 to-indigo-600',
//     'bg-gradient-to-br from-teal-500 to-teal-600',
//     'bg-gradient-to-br from-orange-500 to-orange-600',
//     'bg-gradient-to-br from-cyan-500 to-cyan-600'
//   ];
  
//   const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//   return colors[hash % colors.length];
// };

// const getDayShort = (day?: string): string => {
//   const dayMap: { [key: string]: string } = {
//     'monday': 'Mon',
//     'tuesday': 'Tue',
//     'wednesday': 'Wed',
//     'thursday': 'Thu',
//     'friday': 'Fri',
//     'saturday': 'Sat',
//     'sunday': 'Sun'
//   };
//   if (!day || typeof day !== 'string') return '';
//   const lower = day.toLowerCase();
//   return dayMap[lower] || day.slice(0, 3);
// };

// const StudentSchedule: React.FC<StudentScheduleProps> = ({
//   scheduleData,
//   loading = false,
//   error = null,
//   onRefresh,
//   onFilterChange
// }) => {
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [selectedDay, setSelectedDay] = useState<string | null>(null);
//   const [showBreaks, setShowBreaks] = useState(true);
//   const [subjectFilter, setSubjectFilter] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [currentTime, setCurrentTime] = useState(new Date());

//   // Update current time every minute
//   useEffect(() => {
//     const interval = setInterval(() => setCurrentTime(new Date()), 60000);
//     return () => clearInterval(interval);
//   }, []);

//   // Auto-select today's day
//   useEffect(() => {
//     if (scheduleData && !selectedDay) {
//       const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
//       const todaySchedule = scheduleData.schedule_by_day[today];
//       if (todaySchedule) {
//         setSelectedDay(today);
//       } else {
//         // Fallback to first available day
//         const firstDay = Object.keys(scheduleData.schedule_by_day)[0];
//         setSelectedDay(firstDay);
//       }
//     }
//   }, [scheduleData, selectedDay]);

//   // Get unique subjects for filtering
//   const uniqueSubjects = useMemo(() => {
//     if (!scheduleData) return [];
//     const subjects = new Set<string>();
//     Object.values(scheduleData.schedule_by_day).forEach(day => {
//       day.periods.forEach(period => {
//         if (!period.is_break) {
//           subjects.add(period.subject?.name || period.subject_name || 'Unknown');
//         }
//       });
//     });
//     return Array.from(subjects).sort();
//   }, [scheduleData]);

//   // Filter periods based on current filters
//   const filterPeriod = (period: Period): boolean => {
//     if (!showBreaks && period.is_break) return false;
//     if (subjectFilter && period.subject?.name !== subjectFilter && period.subject_name !== subjectFilter) return false;
//     return true;
//   };

//   // Check if a period is currently active
//   const isPeriodActive = (period: Period, dayKey: string): boolean => {
//     const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
//     if (dayKey !== today) return false;

//     const now = currentTime;
//     const [startHour, startMin] = period.start_time.split(':').map(Number);
//     const [endHour, endMin] = period.end_time.split(':').map(Number);
    
//     const start = new Date();
//     start.setHours(startHour, startMin, 0, 0);
//     const end = new Date();
//     end.setHours(endHour, endMin, 0, 0);

//     return now >= start && now <= end;
//   };

//   const handleFilterChange = () => {
//     const filters: ScheduleFilters = {
//       show_breaks: showBreaks,
//       subject_filter: subjectFilter || undefined
//     };
//     onFilterChange?.(filters);
//   };

//   useEffect(() => {
//     handleFilterChange();
//   }, [showBreaks, subjectFilter]);

//   if (loading && !scheduleData) {
//     return (
//       <div className="w-full">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//           {[...Array(5)].map((_, i) => (
//             <div key={i} className="space-y-4">
//               <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 animate-pulse">
//                 <div className="h-6 bg-gray-200 rounded-lg mb-4"></div>
//                 <div className="space-y-3">
//                   {[...Array(6)].map((_, j) => (
//                     <div key={j} className="h-20 bg-gray-100 rounded-xl"></div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="w-full flex justify-center">
//         <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 max-w-md text-center">
//           <Calendar className="h-16 w-16 text-red-400 mx-auto mb-4" />
//           <h3 className="text-red-800 font-semibold text-lg mb-2">Unable to Load Schedule</h3>
//           <p className="text-red-600 mb-4">{error}</p>
//           {onRefresh && (
//             <button 
//               onClick={onRefresh}
//               className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
//             >
//               <RefreshCw className="h-4 w-4 mr-2 inline-block" />
//               Try Again
//             </button>
//           )}
//         </div>
//       </div>
//     );
//   }

//   if (!scheduleData) {
//     return (
//       <div className="w-full flex justify-center">
//         <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 max-w-md text-center">
//           <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-gray-600 font-medium text-lg">No Schedule Available</h3>
//           <p className="text-gray-500 mt-2">Your schedule data is not available at the moment.</p>
//         </div>
//       </div>
//     );
//   }

//   const scheduleEntries = Object.entries(scheduleData.schedule_by_day);
//   const selectedDayData = selectedDay ? scheduleData.schedule_by_day[selectedDay] : null;

//   return (
//     <div className="w-full space-y-6">
//       {/* Header Controls */}
//       <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 shadow-sm">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
//               <Calendar className="h-5 w-5 text-white" />
//             </div>
//             <div>
//               <h3 className="font-bold text-gray-900">Weekly Schedule</h3>
//               <p className="text-sm text-gray-600">
//                 {scheduleData.week_start} - {scheduleData.week_end}
//               </p>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-2">
//             {/* View Mode Toggle */}
//             <div className="bg-gray-100 rounded-xl p-1 flex">
//               <button
//                 onClick={() => setViewMode('grid')}
//                 className={`p-2 rounded-lg transition-all duration-200 ${
//                   viewMode === 'grid' 
//                     ? 'bg-white shadow-sm text-blue-600' 
//                     : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 <Grid3x3 className="h-4 w-4" />
//               </button>
//               <button
//                 onClick={() => setViewMode('list')}
//                 className={`p-2 rounded-lg transition-all duration-200 ${
//                   viewMode === 'list' 
//                     ? 'bg-white shadow-sm text-blue-600' 
//                     : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 <List className="h-4 w-4" />
//               </button>
//             </div>

//             {/* Filters Toggle */}
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className={`p-2 rounded-xl transition-all duration-200 ${
//                 showFilters 
//                   ? 'bg-blue-100 text-blue-600' 
//                   : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
//               }`}
//             >
//               <Filter className="h-4 w-4" />
//             </button>

//             {/* Refresh Button */}
//             {onRefresh && (
//               <button
//                 onClick={onRefresh}
//                 disabled={loading}
//                 className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100"
//               >
//                 <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Filters Panel */}
//         {showFilters && (
//           <div className="mt-4 pt-4 border-t border-gray-200">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() => setShowBreaks(!showBreaks)}
//                   className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
//                     showBreaks 
//                       ? 'bg-green-100 text-green-700' 
//                       : 'bg-gray-100 text-gray-600'
//                   }`}
//                 >
//                   {showBreaks ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
//                   <span className="text-sm font-medium">Show Breaks</span>
//                 </button>
//               </div>
              
//               <div>
//                 <select
//                   value={subjectFilter}
//                   onChange={(e) => setSubjectFilter(e.target.value)}
//                   className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">All Subjects</option>
//                   {uniqueSubjects.map(subject => (
//                     <option key={subject} value={subject}>{subject}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Mobile Day Selector */}
//       <div className="md:hidden">
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4">
//           <div className="flex items-center justify-between mb-3">
//             <button
//               onClick={() => {
//                 const days = Object.keys(scheduleData.schedule_by_day);
//                 const currentIndex = days.indexOf(selectedDay || '');
//                 const prevIndex = currentIndex > 0 ? currentIndex - 1 : days.length - 1;
//                 setSelectedDay(days[prevIndex]);
//               }}
//               className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </button>
            
//             <div className="text-center">
//               <div className="font-semibold text-gray-900">
//                 {selectedDayData?.day_display}
//               </div>
//               <div className="text-sm text-gray-600">
//                 {selectedDayData?.date}
//               </div>
//             </div>
            
//             <button
//               onClick={() => {
//                 const days = Object.keys(scheduleData.schedule_by_day);
//                 const currentIndex = days.indexOf(selectedDay || '');
//                 const nextIndex = currentIndex < days.length - 1 ? currentIndex + 1 : 0;
//                 setSelectedDay(days[nextIndex]);
//               }}
//               className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </button>
//           </div>
          
//           {/* Day Pills */}
//           <div className="flex gap-2 overflow-x-auto pb-2">
//             {scheduleEntries.map(([dayKey, dayData]) => (
//               <button
//                 key={dayKey}
//                 onClick={() => setSelectedDay(dayKey)}
//                 className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
//                   selectedDay === dayKey
//                     ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
//                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                 }`}
//               >
//                 {getDayShort((dayData as any)?.day_display || dayKey)}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Schedule Content */}
//       {viewMode === 'grid' ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//           {scheduleEntries.map(([dayKey, dayData]) => {
//             const filteredPeriods = dayData.periods.filter(filterPeriod);
            
//             return (
//               <div key={dayKey} className={`md:block ${selectedDay === dayKey ? 'block' : 'hidden'}`}>
//                 <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
//                   {/* Day Header */}
//                   <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
//                     <div className="text-center">
//                       <h4 className="font-bold text-gray-900 text-lg">{dayData.day_display}</h4>
//                       <p className="text-sm text-gray-600 font-medium">{dayData.date}</p>
//                       <p className="text-xs text-gray-500 mt-1">
//                         {filteredPeriods.length} {filteredPeriods.length === 1 ? 'period' : 'periods'}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Periods */}
//                   <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
//                     {filteredPeriods.length === 0 ? (
//                       <div className="text-center py-8">
//                         <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                         <p className="text-gray-500 text-sm">No classes scheduled</p>
//                       </div>
//                     ) : (
//                       filteredPeriods.map((period) => {
//                         const isActive = isPeriodActive(period, dayKey);
//                         const subjectName = period.subject?.name || period.subject_name || 'Unknown';
//                         const teacherName = period.teacher?.full_name || period.teacher_name || '';
//                         const classroomName = period.classroom?.name || period.classroom_name || '';

//                         if (period.is_break) {
//                           return (
//                             <div key={period.id} className="flex items-center gap-3 py-3 px-3 bg-gray-50 rounded-xl border border-gray-200">
//                               <div className="flex-shrink-0">
//                                 <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
//                                   <Coffee className="h-5 w-5 text-orange-600" />
//                                 </div>
//                               </div>
//                               <div className="flex-1 min-w-0">
//                                 <div className="flex items-center gap-2 mb-1">
//                                   <Clock className="h-3 w-3 text-gray-500" />
//                                   <span className="text-xs text-gray-600 font-medium">
//                                     {formatTime(period.start_time)} - {formatTime(period.end_time)}
//                                   </span>
//                                 </div>
//                                 <p className="text-sm font-medium text-orange-700">Break Time</p>
//                               </div>
//                             </div>
//                           );
//                         }

//                         return (
//                           <div 
//                             key={period.id} 
//                             className={`relative group overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
//                               isActive ? 'ring-2 ring-blue-400 ring-opacity-60 shadow-lg scale-[1.02]' : ''
//                             }`}
//                           >
//                             <div className={`${getSubjectColor(subjectName)} p-4 text-white relative`}>
//                               {isActive && (
//                                 <div className="absolute top-2 right-2">
//                                   <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
//                                 </div>
//                               )}
                              
//                               <div className="flex items-center gap-2 mb-2">
//                                 <Clock className="h-4 w-4 opacity-90" />
//                                 <span className="text-xs font-semibold opacity-90">
//                                   {formatTime(period.start_time)} - {formatTime(period.end_time)}
//                                 </span>
//                               </div>
                              
//                               <h5 className="font-bold text-sm mb-2 line-clamp-2">
//                                 {subjectName}
//                               </h5>
                              
//                               <div className="space-y-1">
//                                 {teacherName && (
//                                   <div className="flex items-center gap-2">
//                                     <User className="h-3 w-3 opacity-75" />
//                                     <span className="text-xs opacity-90 truncate">{teacherName}</span>
//                                   </div>
//                                 )}
//                                 {classroomName && (
//                                   <div className="flex items-center gap-2">
//                                     <MapPin className="h-3 w-3 opacity-75" />
//                                     <span className="text-xs opacity-90 truncate">{classroomName}</span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         /* List View */
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
//           {scheduleEntries.map(([dayKey, dayData]) => {
//             const filteredPeriods = dayData.periods.filter(filterPeriod);
            
//             return (
//               <div key={dayKey} className="border-b border-gray-200 last:border-b-0">
//                 <div className="p-4">
//                   <div className="flex items-center justify-between mb-4">
//                     <div>
//                       <h4 className="font-bold text-gray-900 text-lg">{dayData.day_display}</h4>
//                       <p className="text-sm text-gray-600">{dayData.date}</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm text-gray-600">
//                         {filteredPeriods.length} {filteredPeriods.length === 1 ? 'period' : 'periods'}
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className="grid gap-3">
//                     {filteredPeriods.length === 0 ? (
//                       <div className="text-center py-4">
//                         <p className="text-gray-500 text-sm">No classes scheduled</p>
//                       </div>
//                     ) : (
//                       filteredPeriods.map((period) => {
//                         const isActive = isPeriodActive(period, dayKey);
//                         const subjectName = period.subject?.name || period.subject_name || 'Unknown';
//                         const teacherName = period.teacher?.full_name || period.teacher_name || '';
//                         const classroomName = period.classroom?.name || period.classroom_name || '';

//                         if (period.is_break) {
//                           return (
//                             <div key={period.id} className="flex items-center gap-4 py-3 px-4 bg-gray-50 rounded-xl">
//                               <div className="flex-shrink-0">
//                                 <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
//                                   <Coffee className="h-6 w-6 text-orange-600" />
//                                 </div>
//                               </div>
//                               <div className="flex-1">
//                                 <p className="font-medium text-orange-700">Break Time</p>
//                                 <p className="text-sm text-gray-600">
//                                   {formatTime(period.start_time)} - {formatTime(period.end_time)}
//                                 </p>
//                               </div>
//                             </div>
//                           );
//                         }

//                         return (
//                           <div 
//                             key={period.id} 
//                             className={`flex items-center gap-4 py-4 px-4 rounded-xl transition-all duration-200 hover:bg-gray-50 ${
//                               isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
//                             }`}
//                           >
//                             <div className="flex-shrink-0">
//                               <div className={`w-12 h-12 ${getSubjectColor(subjectName)} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
//                                 {subjectName.charAt(0)}
//                               </div>
//                             </div>
                            
//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-center gap-2 mb-1">
//                                 <h5 className="font-semibold text-gray-900">{subjectName}</h5>
//                                 {isActive && (
//                                   <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                                     Live Now
//                                   </span>
//                                 )}
//                               </div>
//                               <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
//                                 <div className="flex items-center gap-1">
//                                   <Clock className="h-4 w-4" />
//                                   <span>{formatTime(period.start_time)} - {formatTime(period.end_time)}</span>
//                                 </div>
//                                 {teacherName && (
//                                   <div className="flex items-center gap-1">
//                                     <User className="h-4 w-4" />
//                                     <span className="truncate">{teacherName}</span>
//                                   </div>
//                                 )}
//                                 {classroomName && (
//                                   <div className="flex items-center gap-1">
//                                     <MapPin className="h-4 w-4" />
//                                     <span>{classroomName}</span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default StudentSchedule;


import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User,  
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Grid3x3,
  List,
  Eye,
  EyeOff,
  Coffee
} from 'lucide-react';

// Import types from StudentService to ensure consistency
import { 
  StudentSchedule as StudentScheduleType, 
  DaySchedule, 
  ScheduleItem as Period, // Alias to match component naming
  Subject,
  Teacher,
  Classroom,
  ScheduleFilters
} from '@/services/StudentService';

interface StudentScheduleProps {
  scheduleData: StudentScheduleType | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onFilterChange?: (filters: ScheduleFilters) => void;
}

// Utility functions
const formatTime = (timeString: string): string => {
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } catch {
    return timeString;
  }
};

const getSubjectColor = (subject: string): string => {
  const colors = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-red-500 to-red-600',
    'bg-gradient-to-br from-yellow-500 to-yellow-600',
    'bg-gradient-to-br from-pink-500 to-pink-600',
    'bg-gradient-to-br from-indigo-500 to-indigo-600',
    'bg-gradient-to-br from-teal-500 to-teal-600',
    'bg-gradient-to-br from-orange-500 to-orange-600',
    'bg-gradient-to-br from-cyan-500 to-cyan-600'
  ];
  
  const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getDayShort = (day?: string): string => {
  const dayMap: { [key: string]: string } = {
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun'
  };
  if (!day || typeof day !== 'string') return '';
  const lower = day.toLowerCase();
  return dayMap[lower] || day.slice(0, 3);
};

const StudentSchedule: React.FC<StudentScheduleProps> = ({
  scheduleData,
  loading = false,
  error = null,
  onRefresh,
  onFilterChange
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showBreaks, setShowBreaks] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-select today's day
  useEffect(() => {
    if (scheduleData && scheduleData.schedule_by_day && !selectedDay) {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const todaySchedule = scheduleData.schedule_by_day[today];
      if (todaySchedule) {
        setSelectedDay(today);
      } else {
        // Fallback to first available day
        const firstDay = Object.keys(scheduleData.schedule_by_day)[0];
        if (firstDay) {
          setSelectedDay(firstDay);
        }
      }
    }
  }, [scheduleData, selectedDay]);

  // Get unique subjects for filtering
  const uniqueSubjects = useMemo(() => {
    if (!scheduleData || !scheduleData.schedule_by_day) return [];
    const subjects = new Set<string>();
    
    try {
      Object.values(scheduleData.schedule_by_day).forEach(day => {
        if (day && day.periods && Array.isArray(day.periods)) {
          day.periods.forEach(period => {
            if (period && !period.is_break) {
              subjects.add(period.subject?.name || period.subject_name || 'Unknown');
            }
          });
        }
      });
    } catch (err) {
      console.error('Error extracting unique subjects:', err);
    }
    
    return Array.from(subjects).sort();
  }, [scheduleData]);

  // Filter periods based on current filters
  const filterPeriod = (period: Period): boolean => {
    if (!period) return false;
    if (!showBreaks && period.is_break) return false;
    if (subjectFilter && period.subject?.name !== subjectFilter && period.subject_name !== subjectFilter) return false;
    return true;
  };

  // Check if a period is currently active
  const isPeriodActive = (period: Period, dayKey: string): boolean => {
    if (!period) return false;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (dayKey !== today) return false;

    try {
      const now = currentTime;
      const [startHour, startMin] = period.start_time.split(':').map(Number);
      const [endHour, endMin] = period.end_time.split(':').map(Number);
      
      const start = new Date();
      start.setHours(startHour, startMin, 0, 0);
      const end = new Date();
      end.setHours(endHour, endMin, 0, 0);

      return now >= start && now <= end;
    } catch (err) {
      console.error('Error checking if period is active:', err);
      return false;
    }
  };

  const handleFilterChange = () => {
    const filters: ScheduleFilters = {
      show_breaks: showBreaks,
      subject_filter: subjectFilter || undefined
    };
    onFilterChange?.(filters);
  };

  useEffect(() => {
    handleFilterChange();
  }, [showBreaks, subjectFilter]);

  if (loading && !scheduleData) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="h-20 bg-gray-100 dark:bg-slate-700 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center">
        <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md text-center">
          <Calendar className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-red-800 dark:text-red-400 font-semibold text-lg mb-2">Unable to Load Schedule</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <RefreshCw className="h-4 w-4 mr-2 inline-block" />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!scheduleData || !scheduleData.schedule_by_day || typeof scheduleData.schedule_by_day !== 'object') {
    return (
      <div className="w-full flex justify-center">
        <div className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-2xl p-8 max-w-md text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-600 dark:text-slate-300 font-medium text-lg">No Schedule Available</h3>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Your schedule data is not available at the moment.</p>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 inline-block" />
              Refresh
            </button>
          )}
        </div>
      </div>
    );
  }

  const scheduleEntries = Object.entries(scheduleData.schedule_by_day || {});
  const selectedDayData = selectedDay && scheduleData.schedule_by_day ? scheduleData.schedule_by_day[selectedDay] : null;

  if (scheduleEntries.length === 0) {
    return (
      <div className="w-full flex justify-center">
        <div className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-2xl p-8 max-w-md text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-600 dark:text-slate-300 font-medium text-lg">No Schedule Data</h3>
          <p className="text-gray-500 dark:text-slate-400 mt-2">There are no scheduled classes for this period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Controls */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-slate-100">Weekly Schedule</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {scheduleData.week_start || 'N/A'} - {scheduleData.week_end || 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-gray-100 dark:bg-slate-700 rounded-xl p-1 flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                showFilters 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-400 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBreaks(!showBreaks)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    showBreaks 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  {showBreaks ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="text-sm font-medium">Show Breaks</span>
                </button>
              </div>
              
              <div>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Subjects</option>
                  {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Day Selector */}
      <div className="md:hidden">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => {
                const days = Object.keys(scheduleData.schedule_by_day || {});
                const currentIndex = days.indexOf(selectedDay || '');
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : days.length - 1;
                setSelectedDay(days[prevIndex]);
              }}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-slate-400" />
            </button>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-slate-100">
                {selectedDayData?.day_display || 'No Day'}
              </div>
              <div className="text-sm text-gray-600 dark:text-slate-400">
                {selectedDayData?.date || ''}
              </div>
            </div>
            
            <button
              onClick={() => {
                const days = Object.keys(scheduleData.schedule_by_day || {});
                const currentIndex = days.indexOf(selectedDay || '');
                const nextIndex = currentIndex < days.length - 1 ? currentIndex + 1 : 0;
                setSelectedDay(days[nextIndex]);
              }}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-slate-400" />
            </button>
          </div>
          
          {/* Day Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {scheduleEntries.map(([dayKey, dayData]) => (
              <button
                key={dayKey}
                onClick={() => setSelectedDay(dayKey)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedDay === dayKey
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {getDayShort((dayData as any)?.day_display || dayKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {scheduleEntries.map(([dayKey, dayData]) => {
            if (!dayData || !dayData.periods) return null;
            
            const filteredPeriods = dayData.periods.filter(filterPeriod);
            
            return (
              <div key={dayKey} className={`md:block ${selectedDay === dayKey ? 'block' : 'hidden'}`}>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 p-4 border-b border-gray-200 dark:border-slate-700">
                    <div className="text-center">
                      <h4 className="font-bold text-gray-900 dark:text-slate-100 text-lg">{dayData.day_display || dayKey}</h4>
                      <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">{dayData.date || ''}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                        {filteredPeriods.length} {filteredPeriods.length === 1 ? 'period' : 'periods'}
                      </p>
                    </div>
                  </div>

                  {/* Periods */}
                  <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                    {filteredPeriods.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-slate-400 text-sm">No classes scheduled</p>
                      </div>
                    ) : (
                      filteredPeriods.map((period) => {
                        if (!period) return null;
                        
                        const isActive = isPeriodActive(period, dayKey);
                        const subjectName = period.subject?.name || period.subject_name || 'Unknown';
                        const teacherName = period.teacher?.full_name || period.teacher_name || '';
                        const classroomName = period.classroom?.name || period.classroom_name || '';

                        if (period.is_break) {
                          return (
                            <div key={period.id} className="flex items-center gap-3 py-3 px-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                  <Coffee className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="h-3 w-3 text-gray-500 dark:text-slate-400" />
                                  <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                                    {formatTime(period.start_time)} - {formatTime(period.end_time)}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Break Time</p>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={period.id} 
                            className={`relative group overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                              isActive ? 'ring-2 ring-blue-400 ring-opacity-60 shadow-lg scale-[1.02]' : ''
                            }`}
                          >
                            <div className={`${getSubjectColor(subjectName)} p-4 text-white relative`}>
                              {isActive && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 opacity-90" />
                                <span className="text-xs font-semibold opacity-90">
                                  {formatTime(period.start_time)} - {formatTime(period.end_time)}
                                </span>
                              </div>
                              
                              <h5 className="font-bold text-sm mb-2 line-clamp-2">
                                {subjectName}
                              </h5>
                              
                              <div className="space-y-1">
                                {teacherName && (
                                  <div className="flex items-center gap-2">
                                    <User className="h-3 w-3 opacity-75" />
                                    <span className="text-xs opacity-90 truncate">{teacherName}</span>
                                  </div>
                                )}
                                {classroomName && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 opacity-75" />
                                    <span className="text-xs opacity-90 truncate">{classroomName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-sm">
          {scheduleEntries.map(([dayKey, dayData]) => {
            if (!dayData || !dayData.periods) return null;
            
            const filteredPeriods = dayData.periods.filter(filterPeriod);
            
            return (
              <div key={dayKey} className="border-b border-gray-200 dark:border-slate-700 last:border-b-0">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-slate-100 text-lg">{dayData.day_display || dayKey}</h4>
                      <p className="text-sm text-gray-600 dark:text-slate-400">{dayData.date || ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        {filteredPeriods.length} {filteredPeriods.length === 1 ? 'period' : 'periods'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-3">
                    {filteredPeriods.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500 dark:text-slate-400 text-sm">No classes scheduled</p>
                      </div>
                    ) : (
                      filteredPeriods.map((period) => {
                        if (!period) return null;
                        
                        const isActive = isPeriodActive(period, dayKey);
                        const subjectName = period.subject?.name || period.subject_name || 'Unknown';
                        const teacherName = period.teacher?.full_name || period.teacher_name || '';
                        const classroomName = period.classroom?.name || period.classroom_name || '';

                        if (period.is_break) {
                          return (
                            <div key={period.id} className="flex items-center gap-4 py-3 px-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                  <Coffee className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-orange-700 dark:text-orange-400">Break Time</p>
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                  {formatTime(period.start_time)} - {formatTime(period.end_time)}
                                </p>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={period.id} 
                            className={`flex items-center gap-4 py-4 px-4 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${
                              isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                            }`}
                          >
                            <div className="flex-shrink-0">
                              <div className={`w-12 h-12 ${getSubjectColor(subjectName)} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                                {subjectName.charAt(0)}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-semibold text-gray-900 dark:text-slate-100">{subjectName}</h5>
                                {isActive && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                    Live Now
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatTime(period.start_time)} - {formatTime(period.end_time)}</span>
                                </div>
                                {teacherName && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    <span className="truncate">{teacherName}</span>
                                  </div>
                                )}
                                {classroomName && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{classroomName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentSchedule;