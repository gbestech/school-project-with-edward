// import React, { useState, useEffect } from 'react';
// import { 
//   Zap, 
//   Megaphone, 
//   Users, 
//   Shield, 
//   Plus, 
//   Edit3, 
//   Trash2, 
//   Eye, 
//   EyeOff,
//   Settings,
//   Save,
//   X,
//   Upload,
//   School,
//   Trophy,
//   BookOpen,
//   Award,
//   Lightbulb,
//   Star,
//   Sparkles,
//   ChevronRight,
//   Play,
//   Globe,
//   Image as ImageIcon,
//   GripVertical,
//   Loader2
// } from 'lucide-react';
// import ToggleSwitch from '@/components/dashboards/admin/settingtab/components/ToggleSwitch';
// import { eventManagementService, EnhancedEvent } from '@/services/eventService';
// import { EventType, DisplayType, ThemeType, RibbonSpeed } from '@/types/eventTypes';
// import DefaultCarouselManager from '@/components/dashboards/admin/DefaultCarouselManager';
// import AnnouncementService, { Announcement as ApiAnnouncement, CreateAnnouncementData } from '@/services/AnnouncementService';

// // TypeScript interfaces
// interface AnnouncementForm {
//   title: string;
//   content: string;
//   announcement_type: 'general' | 'academic' | 'event' | 'emergency';
//   start_date: string;
//   end_date: string;
//   target_audience: string[];
//   is_pinned: boolean;
// }

// interface PortalSettings {
//   enabled: boolean;
//   maintenanceMode: boolean;
//   greeting: string;
//   customWidgets: string[];
// }

// interface PortalSettingsState {
//   studentPortal: PortalSettings;
//   parentPortal: PortalSettings;
//   teacherPortal: PortalSettings;
// }

// // Enhanced Event Management Interfaces
// interface EventImage {
//   id?: number;
//   url?: string;
//   image_url?: string;
//   alt_text: string;
//   order: number;
//   title: string;
//   description: string;
// }

// // Use EnhancedEvent instead of AdminEvent
// type AdminEvent = EnhancedEvent;

// interface HeroContent {
//   title: string;
//   subtitle: string;
//   description: string;
//   ctaText: string;
//   secondaryCtaText: string;
//   badgeText: string;
//   backgroundTheme: string;
//   features: Array<{
//     icon: any;
//     title: string;
//     desc: string;
//     color: string;
//   }>;
// }

// const Advanced: React.FC = () => {
//   const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([]);
//   const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [portalSettings, setPortalSettings] = useState<PortalSettingsState>({
//     studentPortal: {
//       enabled: true,
//       maintenanceMode: false,
//       greeting: 'Welcome back, student!',
//       customWidgets: ['assignments', 'grades', 'schedule']
//     },
//     parentPortal: {
//       enabled: true,
//       maintenanceMode: false,
//       greeting: 'Welcome to the parent portal!',
//       customWidgets: ['student-progress', 'announcements', 'calendar']
//     },
//     teacherPortal: {
//       enabled: true,
//       maintenanceMode: true,
//       greeting: 'Hello, educator!',
//       customWidgets: ['gradebook', 'class-roster', 'analytics']
//     }
//   });

//   // Enhanced Event Management State
//   const [activeEvent, setActiveEvent] = useState<AdminEvent | null>(null);
//   const [events, setEvents] = useState<AdminEvent[]>([]);

//   // Subscribe to event management service
//   useEffect(() => {
//     const unsubscribe = eventManagementService.subscribe((allEvents, currentActiveEvent) => {
//       setEvents(allEvents);
//       setActiveEvent(currentActiveEvent);
//     });

//     return unsubscribe;
//   }, []);

//   // Load announcements from API
//   useEffect(() => {
//     const loadAnnouncements = async () => {
//       try {
//         setLoadingAnnouncements(true);
//         setError(null);
//         const data = await AnnouncementService.getAllAnnouncements();
//         setAnnouncements(data);
//       } catch (error) {
//         console.error('Error loading announcements:', error);
//         setError('Failed to load announcements');
//       } finally {
//         setLoadingAnnouncements(false);
//       }
//     };

//     loadAnnouncements();
//   }, []);
//   const [newEvent, setNewEvent] = useState<Partial<AdminEvent>>({
//     title: '',
//     subtitle: '',
//     description: '',
//     cta_text: 'Begin Your Journey',
//     secondary_cta_text: 'Watch Experience',
//     badge_text: 'Next Generation Learning Platform',
//     background_theme: 'default' as ThemeType,
//     event_type: 'announcement' as EventType,
//     display_type: 'banner' as DisplayType,
//     is_active: false,
//     start_date: '',
//     end_date: '',
//     images: [],
//     ribbon_text: '',
//     ribbon_speed: 'medium' as RibbonSpeed,
//     carousel_interval: 5000,
//     show_indicators: true,
//     show_controls: true,
//     auto_play: true
//   });

//   const [showAnnouncementForm, setShowAnnouncementForm] = useState<boolean>(false);
//   const [editingAnnouncement, setEditingAnnouncement] = useState<ApiAnnouncement | null>(null);
//   const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>({
//     title: '',
//     content: '',
//     announcement_type: 'general',
//     start_date: new Date().toISOString().split('T')[0],
//     end_date: '',
//     target_audience: ['student'],
//     is_pinned: false
//   });

//   // Image upload state
//   const [uploadedImages, setUploadedImages] = useState<EventImage[]>([]);
//   const [dragIndex, setDragIndex] = useState<number | null>(null);

//   // Default premium content
//   const defaultContent: HeroContent = {
//     title: 'Education\nReimagined',
//     subtitle: 'Premium Learning Excellence',
//     description: 'Experience the pinnacle of educational innovation with our revolutionary AI-powered platform that adapts, evolves, and excels with every student\'s unique journey.',
//     ctaText: 'Begin Your Journey',
//     secondaryCtaText: 'Watch Experience',
//     badgeText: 'Next Generation Learning Platform',
//     backgroundTheme: 'default',
//     features: [
//       { 
//         icon: Zap, 
//         title: 'AI-Powered Intelligence', 
//         desc: 'Advanced algorithms that adapt to your learning style in real-time with unprecedented precision', 
//         color: 'from-yellow-400 via-orange-400 to-red-500'
//       },
//       { 
//         icon: Trophy, 
//         title: 'Precision Personalization', 
//         desc: 'Curated content paths designed specifically for your goals with world-class expertise', 
//         color: 'from-emerald-400 via-teal-400 to-blue-500'
//       },
//       { 
//         icon: Globe, 
//         title: 'Global Excellence', 
//         desc: 'World-class education accessible from anywhere, delivering premium results consistently', 
//         color: 'from-purple-400 via-pink-400 to-rose-500'
//       }
//     ]
//   };

//   // Theme configurations
//   const themes = {
//     default: {
//       background: 'from-slate-900 via-blue-900 to-purple-900',
//       accent: 'from-blue-400 via-purple-400 to-pink-400',
//       features: defaultContent.features
//     },
//     graduation: {
//       background: 'from-emerald-900 via-teal-900 to-blue-900',
//       accent: 'from-emerald-400 via-teal-400 to-blue-400',
//       features: [
//         { icon: Award, title: 'Graduation Success', desc: 'Celebrating our graduates\' outstanding achievements', color: 'from-emerald-400 via-teal-400 to-blue-500' },
//         { icon: Trophy, title: 'Academic Excellence', desc: 'Recognized for delivering exceptional educational outcomes', color: 'from-yellow-400 via-orange-400 to-red-500' },
//         { icon: Users, title: 'Alumni Network', desc: 'Join thousands of successful graduates worldwide', color: 'from-purple-400 via-pink-400 to-rose-500' }
//       ]
//     },
//     enrollment: {
//       background: 'from-purple-900 via-pink-900 to-rose-900',
//       accent: 'from-purple-400 via-pink-400 to-rose-400',
//       features: [
//         { icon: BookOpen, title: 'Open Enrollment', desc: 'Secure your spot in our premium programs', color: 'from-purple-400 via-pink-400 to-rose-500' },
//         { icon: Star, title: 'Limited Seats', desc: 'Exclusive access to world-class education', color: 'from-yellow-400 via-orange-400 to-red-500' },
//         { icon: School, title: 'Early Bird Benefits', desc: 'Special advantages for early enrollment', color: 'from-emerald-400 via-teal-400 to-blue-500' }
//       ]
//     },
//     achievement: {
//       background: 'from-yellow-900 via-orange-900 to-red-900',
//       accent: 'from-yellow-400 via-orange-400 to-red-400',
//       features: [
//         { icon: Trophy, title: 'Award Winning', desc: 'Recently recognized for educational excellence', color: 'from-yellow-400 via-orange-400 to-red-500' },
//         { icon: Star, title: 'Top Rated', desc: 'Highest satisfaction scores in the industry', color: 'from-purple-400 via-pink-400 to-rose-500' },
//         { icon: Shield, title: 'Proven Results', desc: '98% student success rate across all programs', color: 'from-emerald-400 via-teal-400 to-blue-500' }
//       ]
//     },
//     innovation: {
//       background: 'from-blue-900 via-indigo-900 to-purple-900',
//       accent: 'from-blue-400 via-indigo-400 to-purple-400',
//       features: [
//         { icon: Lightbulb, title: 'Innovation Lab', desc: 'Cutting-edge research and development initiatives', color: 'from-blue-400 via-indigo-400 to-purple-500' },
//         { icon: Zap, title: 'Tech Breakthrough', desc: 'Revolutionary learning technologies launched', color: 'from-yellow-400 via-orange-400 to-red-500' },
//         { icon: Globe, title: 'Future Ready', desc: 'Preparing students for tomorrow\'s challenges', color: 'from-emerald-400 via-teal-400 to-blue-500' }
//       ]
//     }
//   };

//   // Image Upload Functions
//   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (files) {
//       Array.from(files).forEach((file, index) => {
//         // Check file size (max 2MB)
//         if (file.size > 2 * 1024 * 1024) {
//           alert(`File ${file.name} is too large. Please use images smaller than 2MB.`);
//           return;
//         }

//         const reader = new FileReader();
//         reader.onload = (e) => {
//           const newImage: EventImage = {
//             id: Date.now() + index,
//             url: e.target?.result as string,
//             alt_text: file.name,
//             order: uploadedImages.length + index,
//             title: `Image ${uploadedImages.length + index + 1}`,
//             description: ''
//           };
//           setUploadedImages(prev => [...prev, newImage]);
//         };
//         reader.readAsDataURL(file);
//       });
//     }
//   };

//   const removeImage = (imageId: number | string) => {
//     setUploadedImages(prev => prev.filter(img => img.id !== imageId));
//   };

//   const updateImageDetails = (imageId: number | string, field: keyof EventImage, value: string) => {
//     setUploadedImages(prev => prev.map(img => 
//       img.id === imageId ? { ...img, [field]: value } : img
//     ));
//   };

//   const reorderImages = (fromIndex: number, toIndex: number) => {
//     const newImages = [...uploadedImages];
//     const [movedImage] = newImages.splice(fromIndex, 1);
//     newImages.splice(toIndex, 0, movedImage);
//     setUploadedImages(newImages.map((img, index) => ({ ...img, order: index })));
//   };

//   const handleDragStart = (index: number) => {
//     setDragIndex(index);
//   };

//   const handleDragOver = (e: React.DragEvent, index: number) => {
//     e.preventDefault();
//     if (dragIndex !== null && dragIndex !== index) {
//       reorderImages(dragIndex, index);
//       setDragIndex(index);
//     }
//   };

//   const handleDragEnd = () => {
//     setDragIndex(null);
//   };

//   // Enhanced Event Management Functions
//   const handleCreateEvent = () => {
//     console.log('Save button clicked!');
//     console.log('New Event Data:', newEvent);
//     console.log('Uploaded Images:', uploadedImages);
    
//     if (!newEvent.title || !newEvent.description) {
//       alert('Please fill in both title and description fields.');
//       return;
//     }
    
//     try {
//       const eventData = {
//         title: newEvent.title || '',
//         subtitle: newEvent.subtitle || '',
//         description: newEvent.description || '',
//         cta_text: newEvent.cta_text || 'Begin Your Journey',
//         secondary_cta_text: newEvent.secondary_cta_text || 'Watch Experience',
//         badge_text: newEvent.badge_text || 'Special Announcement',
//         start_date: newEvent.start_date || '',
//         end_date: newEvent.end_date || '',
//         background_theme: newEvent.background_theme || 'default' as ThemeType,
//         display_type: newEvent.display_type || 'banner' as DisplayType,
//         is_active: false,
//         event_type: newEvent.event_type || 'announcement' as EventType,
//         images: uploadedImages,
//         ribbon_text: newEvent.ribbon_text || '',
//         ribbon_speed: newEvent.ribbon_speed || 'medium' as RibbonSpeed,
//         carousel_interval: newEvent.carousel_interval || 5000,
//         show_indicators: newEvent.show_indicators ?? true,
//         show_controls: newEvent.show_controls ?? true,
//         auto_play: newEvent.auto_play ?? true
//       };
      
//       console.log('Creating event with data:', eventData);
      
//       // Use event management service to create event
//       const createdEvent = eventManagementService.createEvent(eventData);
//       console.log('Event created successfully:', createdEvent);
      
//       // Show success message
//       alert('Event saved successfully! You can now activate it.');
      
//       // Reset form
//       setNewEvent({
//         title: '',
//         subtitle: '',
//         description: '',
//         cta_text: 'Begin Your Journey',
//         secondary_cta_text: 'Watch Experience',
//         badge_text: 'Next Generation Learning Platform',
//         background_theme: 'default' as ThemeType,
//         event_type: 'announcement' as EventType,
//         display_type: 'banner' as DisplayType,
//         is_active: false,
//         start_date: '',
//         end_date: '',
//         images: [],
//         ribbon_text: '',
//         ribbon_speed: 'medium' as RibbonSpeed,
//         carousel_interval: 5000,
//         show_indicators: true,
//         show_controls: true,
//         auto_play: true
//       });
//       setUploadedImages([]);
//     } catch (error) {
//       console.error('Error creating event:', error);
//       alert('Error saving event. Please try again.');
//     }
//   };

//   const activateEvent = (event: AdminEvent) => {
//     eventManagementService.activateEvent(event.id!);
//   };

//   const deactivateEvent = () => {
//     eventManagementService.deactivateAllEvents();
//   };

//   const deleteEvent = (eventId: string) => {
//     eventManagementService.deleteEvent(eventId);
//   };

//   // Get current content based on active event or default
//   const getCurrentContent = (): HeroContent => {
//     if (activeEvent) {
//       const theme = themes[activeEvent.background_theme as keyof typeof themes] || themes.default;
//       return {
//         title: activeEvent.title || '',
//         subtitle: activeEvent.subtitle || '',
//         description: activeEvent.description || '',
//         ctaText: activeEvent.cta_text || '',
//         secondaryCtaText: activeEvent.secondary_cta_text || '',
//         badgeText: activeEvent.badge_text || '',
//         backgroundTheme: activeEvent.background_theme || 'default',
//         features: theme.features
//       };
//     }
//     return defaultContent;
//   };

//   const currentContent = getCurrentContent();
//   const currentTheme = themes[currentContent.backgroundTheme as keyof typeof themes] || themes.default;

//   const handleAnnouncementSubmit = async (e: React.FormEvent): Promise<void> => {
//     e.preventDefault();
//     try {
//       if (editingAnnouncement) {
//         // Update existing announcement
//         const updatedAnnouncement = await AnnouncementService.updateAnnouncement(
//           editingAnnouncement.id,
//           {
//             ...announcementForm,
//             end_date: announcementForm.end_date || undefined
//           }
//         );
//         setAnnouncements(prev => prev.map(ann => 
//           ann.id === editingAnnouncement.id ? updatedAnnouncement : ann
//         ));
//         setEditingAnnouncement(null);
//       } else {
//         // Create new announcement
//         const createData: CreateAnnouncementData = {
//           ...announcementForm,
//           end_date: announcementForm.end_date || undefined,
//           is_active: true
//         };
//         const newAnnouncement = await AnnouncementService.createAnnouncement(createData);
//         setAnnouncements(prev => [...prev, newAnnouncement]);
//       }
      
//       // Reset form
//       setAnnouncementForm({
//         title: '',
//         content: '',
//         announcement_type: 'general',
//         start_date: new Date().toISOString().split('T')[0],
//         end_date: '',
//         target_audience: ['student'],
//         is_pinned: false
//       });
//       setShowAnnouncementForm(false);
//       setError(null);
//     } catch (error) {
//       console.error('Error saving announcement:', error);
//       setError('Failed to save announcement');
//     }
//   };

//   const handleEditAnnouncement = (announcement: ApiAnnouncement): void => {
//     setEditingAnnouncement(announcement);
//     setAnnouncementForm({
//       title: announcement.title,
//       content: announcement.content,
//       announcement_type: announcement.announcement_type,
//       start_date: announcement.start_date.split('T')[0],
//       end_date: announcement.end_date ? announcement.end_date.split('T')[0] : '',
//       target_audience: announcement.target_audience,
//       is_pinned: announcement.is_pinned
//     });
//     setShowAnnouncementForm(true);
//   };

//   const handleDeleteAnnouncement = async (id: number): Promise<void> => {
//     try {
//       await AnnouncementService.deleteAnnouncement(id);
//       setAnnouncements(prev => prev.filter(ann => ann.id !== id));
//       setError(null);
//     } catch (error) {
//       console.error('Error deleting announcement:', error);
//       setError('Failed to delete announcement');
//     }
//   };

//   const toggleAnnouncementStatus = async (id: number): Promise<void> => {
//     try {
//       const updatedAnnouncement = await AnnouncementService.toggleActive(id);
//       setAnnouncements(prev => prev.map(ann => 
//         ann.id === id ? updatedAnnouncement : ann
//       ));
//       setError(null);
//     } catch (error) {
//       console.error('Error toggling announcement status:', error);
//       setError('Failed to update announcement status');
//     }
//   };

//   const updatePortalSetting = (portal: string, setting: keyof PortalSettings, value: any): void => {
//     setPortalSettings(prev => ({
//       ...prev,
//       [portal]: {
//         ...prev[portal as keyof PortalSettingsState],
//         [setting]: value
//       }
//     }));
//   };

//   const getTypeColor = (type: string): string => {
//     switch (type) {
//       case 'emergency': return 'bg-red-50 border-red-200 text-red-800';
//       case 'academic': return 'bg-blue-50 border-blue-200 text-blue-800';
//       case 'event': return 'bg-green-50 border-green-200 text-green-800';
//       case 'general':
//       default: return 'bg-gray-50 border-gray-200 text-gray-800';
//     }
//   };

//   return (
//     <div className="space-y-8">
//       {/* Default Carousel Management Section */}
//       <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
//             <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
//               <ImageIcon className="w-4 h-4 text-white" />
//             </div>
//             Default Carousel Management
//           </h3>
//         </div>
//         <DefaultCarouselManager />
//       </div>

//       {/* Event Management Section */}
//       <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
//             <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
//               <Settings className="w-4 h-4 text-white" />
//             </div>
//             Event Management
//           </h3>
//           <button
//             onClick={() => {
//               eventManagementService.clearStorage();
//               alert('Storage cleared! Please refresh the page.');
//             }}
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
//           >
//             Clear Storage
//           </button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Event Management Panel */}
//           <div className="space-y-6">
//             {/* Active Events */}
//             <div>
//               <h4 className="text-lg font-semibold text-slate-900 mb-4">Active Events</h4>
//               {activeEvent ? (
//                 <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 mb-4">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-emerald-300 text-sm font-medium">LIVE</span>
//                     <button
//                       onClick={deactivateEvent}
//                       className="text-slate-600 hover:text-slate-800"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <h5 className="text-slate-900 font-semibold">{activeEvent.title}</h5>
//                   <p className="text-slate-600 text-sm">{activeEvent.description.substring(0, 60)}...</p>
//                 </div>
//               ) : (
//                 <p className="text-slate-500 text-sm">No active events</p>
//               )}
//             </div>

//             {/* Saved Events */}
//             <div>
//               <h4 className="text-lg font-semibold text-slate-900 mb-4">Saved Events</h4>
//               <div className="space-y-3 max-h-48 overflow-y-auto">
//                                       {events.map(event => (
//                         <div key={event.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
//                           <div className="flex items-center justify-between mb-2">
//                             <span className={`text-xs font-medium px-2 py-1 rounded-full ${
//                               event.event_type === 'announcement' ? 'bg-blue-500/20 text-blue-700' :
//                               event.event_type === 'enrollment' ? 'bg-purple-500/20 text-purple-700' :
//                               event.event_type === 'achievement' ? 'bg-yellow-500/20 text-yellow-700' :
//                               'bg-green-500/20 text-green-700'
//                             }`}>
//                               {event.event_type.toUpperCase()}
//                             </span>
//                             <div className="flex gap-2">
//                               <button
//                                 onClick={() => activateEvent(event)}
//                                 className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg transition-colors duration-200"
//                               >
//                                 Activate
//                               </button>
//                               <button
//                                 onClick={() => deleteEvent(event.id?.toString() || '')}
//                                 className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg transition-colors duration-200"
//                               >
//                                 <Trash2 className="w-3 h-3" />
//                               </button>
//                             </div>
//                           </div>
//                           <h5 className="text-slate-900 font-medium text-sm">{event.title}</h5>
//                           <p className="text-slate-600 text-xs mt-1">{event.description.substring(0, 40)}...</p>
//                         </div>
//                       ))}
//               </div>
//             </div>

//             {/* Create New Event */}
//             <div className="space-y-4">
//               <h4 className="text-lg font-semibold text-slate-900">Create New Event</h4>
              
//               <div>
//                 <label className="block text-slate-700 text-sm mb-2">Event Type</label>
//                 <select
//                   value={newEvent.event_type}
//                   onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as any })}
//                   className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500"
//                 >
//                   <option value="announcement">Announcement</option>
//                   <option value="enrollment">Enrollment</option>
//                   <option value="event">Event</option>
//                   <option value="achievement">Achievement</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-slate-700 text-sm mb-2">Display Type</label>
//                 <select
//                   value={newEvent.display_type}
//                   onChange={(e) => setNewEvent({ ...newEvent, display_type: e.target.value as any })}
//                   className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500"
//                 >
//                   <option value="banner">Banner</option>
//                   <option value="carousel">Carousel</option>
//                   <option value="ribbon">Announcement Ribbon</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-slate-700 text-sm mb-2">Theme</label>
//                 <select
//                   value={newEvent.background_theme}
//                   onChange={(e) => setNewEvent({ ...newEvent, background_theme: e.target.value as any })}
//                   className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500"
//                 >
//                   <option value="default">Default</option>
//                   <option value="graduation">Graduation</option>
//                   <option value="enrollment">Enrollment</option>
//                   <option value="achievement">Achievement</option>
//                   <option value="innovation">Innovation</option>
//                 </select>
//               </div>
              
//               <div>
//                 <label className="block text-slate-700 text-sm mb-2">Title</label>
//                 <input
//                   type="text"
//                   value={newEvent.title}
//                   onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
//                   className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
//                   placeholder="Enter event title..."
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-slate-700 text-sm mb-2">Subtitle</label>
//                 <input
//                   type="text"
//                   value={newEvent.subtitle}
//                   onChange={(e) => setNewEvent({ ...newEvent, subtitle: e.target.value })}
//                   className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
//                   placeholder="Enter subtitle..."
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-slate-700 text-sm mb-2">Description</label>
//                 <textarea
//                   value={newEvent.description}
//                   onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
//                   className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 h-24"
//                   placeholder="Enter description..."
//                 />
//               </div>

//               <div>
//                 <label className="block text-slate-700 text-sm mb-2">Badge Text</label>
//                 <input
//                   type="text"
//                   value={newEvent.badge_text}
//                   onChange={(e) => setNewEvent({ ...newEvent, badge_text: e.target.value })}
//                   className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
//                   placeholder="Enter badge text..."
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-slate-700 text-sm mb-2">Primary CTA</label>
//                   <input
//                     type="text"
//                     value={newEvent.cta_text}
//                     onChange={(e) => setNewEvent({ ...newEvent, cta_text: e.target.value })}
//                     className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
//                     placeholder="CTA text..."
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-slate-700 text-sm mb-2">Secondary CTA</label>
//                   <input
//                     type="text"
//                     value={newEvent.secondary_cta_text}
//                     onChange={(e) => setNewEvent({ ...newEvent, secondary_cta_text: e.target.value })}
//                     className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
//                     placeholder="Secondary CTA..."
//                   />
//                 </div>
//               </div>

//               {/* Image Upload Section */}
//               <div className="space-y-4">
//                 <h5 className="text-md font-semibold text-slate-800">Images</h5>
                
//                 {/* Image Upload Area */}
//                 <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
//                   <input
//                     type="file"
//                     multiple
//                     accept="image/*"
//                     onChange={handleImageUpload}
//                     className="hidden"
//                     id="image-upload"
//                   />
//                   <label htmlFor="image-upload" className="cursor-pointer">
//                     <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
//                     <p className="text-slate-600 font-medium">Click to upload images</p>
//                     <p className="text-slate-500 text-sm">Supports JPG, PNG, GIF (Max 5MB each)</p>
//                   </label>
//                 </div>

//                 {/* Uploaded Images */}
//                 {uploadedImages.length > 0 && (
//                   <div className="space-y-3">
//                     <h6 className="text-sm font-medium text-slate-700">Uploaded Images ({uploadedImages.length})</h6>
//                     <div className="space-y-2 max-h-48 overflow-y-auto">
//                       {uploadedImages.map((image, index) => (
//                         <div
//                           key={image.id}
//                           className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
//                           draggable
//                           onDragStart={() => handleDragStart(index)}
//                           onDragOver={(e) => handleDragOver(e, index)}
//                           onDragEnd={handleDragEnd}
//                         >
//                           <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
//                           <img
//                             src={image.url}
//                             alt={image.alt_text}
//                             className="w-12 h-12 object-cover rounded-lg"
//                           />
//                           <div className="flex-1 min-w-0">
//                             <input
//                               type="text"
//                               value={image.title || ''}
//                               onChange={(e) => updateImageDetails(image.id || 0, 'title', e.target.value)}
//                               className="w-full text-sm font-medium text-slate-900 bg-transparent border-none focus:outline-none"
//                               placeholder="Image title..."
//                             />
//                             <input
//                               type="text"
//                               value={image.description || ''}
//                               onChange={(e) => updateImageDetails(image.id || 0, 'description', e.target.value)}
//                               className="w-full text-xs text-slate-600 bg-transparent border-none focus:outline-none"
//                               placeholder="Image description..."
//                             />
//                           </div>
//                           <button
//                             onClick={() => removeImage(image.id || 0)}
//                             className="p-1 text-red-500 hover:text-red-700 transition-colors"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Display Type Specific Settings */}
//               {newEvent.display_type === 'ribbon' && (
//                 <div className="space-y-4">
//                   <h5 className="text-md font-semibold text-slate-800">Ribbon Settings</h5>
//                   <div>
//                     <label className="block text-slate-700 text-sm mb-2">Ribbon Text</label>
//                     <textarea
//                       value={newEvent.ribbon_text}
//                       onChange={(e) => setNewEvent({ ...newEvent, ribbon_text: e.target.value })}
//                       className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 h-20"
//                       placeholder="Enter ribbon text to scroll across the page..."
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-slate-700 text-sm mb-2">Scroll Speed</label>
//                     <select
//                       value={newEvent.ribbon_speed}
//                       onChange={(e) => setNewEvent({ ...newEvent, ribbon_speed: e.target.value as any })}
//                       className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500"
//                     >
//                       <option value="slow">Slow</option>
//                       <option value="medium">Medium</option>
//                       <option value="fast">Fast</option>
//                     </select>
//                   </div>
//                 </div>
//               )}

//               {newEvent.display_type === 'carousel' && (
//                 <div className="space-y-4">
//                   <h5 className="text-md font-semibold text-slate-800">Carousel Settings</h5>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-slate-700 text-sm mb-2">Auto-play Interval (ms)</label>
//                       <input
//                         type="number"
//                         value={newEvent.carousel_interval}
//                         onChange={(e) => setNewEvent({ ...newEvent, carousel_interval: parseInt(e.target.value) })}
//                         className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500"
//                         min="1000"
//                         max="10000"
//                         step="500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-slate-700 text-sm mb-2">Speed</label>
//                       <select
//                         value={newEvent.ribbon_speed}
//                         onChange={(e) => setNewEvent({ ...newEvent, ribbon_speed: e.target.value as any })}
//                         className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500"
//                       >
//                         <option value="slow">Slow</option>
//                         <option value="medium">Medium</option>
//                         <option value="fast">Fast</option>
//                       </select>
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <ToggleSwitch
//                       id="auto-play"
//                       checked={newEvent.auto_play ?? true}
//                       onChange={(checked) => setNewEvent({ ...newEvent, auto_play: checked })}
//                       label="Auto-play"
//                       description="Automatically advance carousel"
//                     />
//                     <ToggleSwitch
//                       id="show-indicators"
//                       checked={newEvent.show_indicators ?? true}
//                       onChange={(checked) => setNewEvent({ ...newEvent, show_indicators: checked })}
//                       label="Show Indicators"
//                       description="Display carousel dots"
//                     />
//                     <ToggleSwitch
//                       id="show-controls"
//                       checked={newEvent.show_controls ?? true}
//                       onChange={(checked) => setNewEvent({ ...newEvent, show_controls: checked })}
//                       label="Show Controls"
//                       description="Display navigation arrows"
//                     />
//                   </div>
//                 </div>
//               )}

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-slate-700 text-sm mb-2">Start Date</label>
//                   <input
//                     type="datetime-local"
//                     value={newEvent.start_date}
//                     onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
//                     className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-slate-700 text-sm mb-2">End Date</label>
//                   <input
//                     type="datetime-local"
//                     value={newEvent.end_date}
//                     onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
//                     className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500"
//                   />
//                 </div>
//               </div>
              
//               <button
//                 onClick={() => {
//                   console.log('Save button clicked!');
//                   handleCreateEvent();
//                 }}
//                 className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
//               >
//                 <Save className="w-5 h-5" />
//                 <span>Save Event</span>
//               </button>
//             </div>
//           </div>

//           {/* Event Preview */}
//           <div className="space-y-6">
//             <h4 className="text-lg font-semibold text-slate-900">Event Preview</h4>
            
//             {/* Display Type Preview */}
//             {newEvent.display_type === 'banner' && (
//               <div className="relative min-h-[600px] overflow-hidden rounded-2xl border border-slate-200">
//                 {/* Dynamic Background */}
//                 <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.background}`}>
//                   <div 
//                     className="absolute inset-0 opacity-30"
//                     style={{
//                       background: `radial-gradient(800px circle at 50% 50%, 
//                         rgba(59, 130, 246, 0.15), 
//                         rgba(147, 51, 234, 0.1), 
//                         transparent 50%)`
//                     }}
//                   />
//                 </div>

//                 {/* Enhanced Background Elements */}
//                 <div className="absolute inset-0">
//                   {/* Premium Floating Orbs */}
//                   <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
//                   <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
//                   <div className="absolute top-1/2 left-3/4 w-24 h-24 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
                  
//                   {/* Ultra-premium Grid Pattern */}
//                   <div className="absolute inset-0 opacity-[0.03]" style={{
//                     backgroundImage: `radial-gradient(circle at 3px 3px, white 1px, transparent 0)`,
//                     backgroundSize: '30px 30px'
//                   }}></div>
//                 </div>

//                 {/* Main Content */}
//                 <div className="relative z-10 flex flex-col min-h-[600px] pt-12">
//                   <div className="flex-1 flex flex-col justify-center px-6 py-12">
//                     <div className="max-w-4xl mx-auto w-full text-center">
                      
//                       {/* Ultra Premium Badge */}
//                       <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-3xl rounded-full px-6 py-3 mb-8 border border-white/10 shadow-2xl shadow-blue-500/20">
//                         <div className="relative">
//                           <Sparkles className="text-yellow-400 animate-pulse" size={20} />
//                           <div className="absolute inset-0 text-yellow-400 animate-ping opacity-30">
//                             <Sparkles size={20} />
//                           </div>
//                         </div>
//                         <span className="text-white font-bold text-sm tracking-wide">{currentContent.badgeText}</span>
//                         <div className="flex space-x-1">
//                           {[...Array(3)].map((_, i) => (
//                             <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
//                           ))}
//                         </div>
//                       </div>
                      
//                       {/* Ultra Premium Hero Title */}
//                       <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-[0.85] tracking-tight">
//                         {currentContent.title.split('\n').map((line, index) => (
//                           <span key={index} className={`block ${
//                             index === 0 
//                               ? 'bg-gradient-to-r from-white via-blue-100 to-slate-200 bg-clip-text text-transparent'
//                               : `bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent relative`
//                           }`}>
//                             {line}
//                             {index === 1 && (
//                               <div className="absolute -right-4 top-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-80 animate-bounce"></div>
//                             )}
//                           </span>
//                         ))}
//                       </h1>
                      
//                       {/* Ultra Premium Subtitle */}
//                       {currentContent.subtitle && (
//                         <h2 className="text-lg sm:text-xl md:text-2xl font-light text-slate-200/90 mb-4 tracking-wide">
//                           {currentContent.subtitle}
//                         </h2>
//                       )}
                      
//                       {/* Ultra Premium Description */}
//                       <p className="text-sm sm:text-base md:text-lg text-slate-300/90 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
//                         {currentContent.description}
//                       </p>
                      
//                       {/* Ultra Premium CTA Buttons */}
//                       <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//                         <button className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden min-w-[200px]">
//                           <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
//                           <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-white/50 transition-colors duration-500"></div>
                          
//                           <span className="relative z-10 flex items-center justify-center space-x-2">
//                             <span>{currentContent.ctaText}</span>
//                             <div className="transform group-hover:translate-x-1 transition-transform duration-300">
//                               <ChevronRight size={16} />
//                             </div>
//                           </span>
//                         </button>
                        
//                         <button className="group bg-white/5 backdrop-blur-3xl text-white px-8 py-3 rounded-2xl font-semibold text-sm hover:bg-white/10 transition-all duration-500 transform hover:scale-105 border border-white/10 hover:border-white/30 min-w-[200px] relative overflow-hidden">
//                           <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//                           <span className="relative z-10 flex items-center justify-center space-x-2">
//                             <Play className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
//                             <span>{currentContent.secondaryCtaText}</span>
//                           </span>
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Carousel Preview */}
//             {newEvent.display_type === 'carousel' && (
//               <div className="relative min-h-[400px] overflow-hidden rounded-2xl border border-slate-200">
//                 <div className="bg-slate-900 p-4">
//                   <h5 className="text-white font-semibold mb-4">Carousel Preview</h5>
//                   {uploadedImages.length > 0 ? (
//                     <div className="relative h-64 bg-slate-800 rounded-lg overflow-hidden">
//                       <div className="flex transition-transform duration-500 ease-in-out">
//                         {uploadedImages.map((image, index) => (
//                           <div key={image.id} className="min-w-full h-64 relative">
//                             <img
//                               src={image.url}
//                               alt={image.alt_text}
//                               className="w-full h-full object-cover"
//                             />
//                             <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
//                               <h6 className="font-semibold">{image.title || `Slide ${index + 1}`}</h6>
//                               <p className="text-sm opacity-90">{image.description}</p>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
                      
//                       {/* Carousel Controls */}
//                       {newEvent.show_controls && (
//                         <div className="absolute inset-0 flex items-center justify-between p-4">
//                           <button className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
//                             <ChevronRight className="w-4 h-4 rotate-180" />
//                           </button>
//                           <button className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
//                             <ChevronRight className="w-4 h-4" />
//                           </button>
//                         </div>
//                       )}
                      
//                       {/* Carousel Indicators */}
//                       {newEvent.show_indicators && (
//                         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
//                           {uploadedImages.map((_, index) => (
//                             <button
//                               key={index}
//                               className="w-2 h-2 bg-white/50 rounded-full hover:bg-white transition-colors"
//                             />
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="h-64 bg-slate-800 rounded-lg flex items-center justify-center">
//                       <div className="text-center text-slate-400">
//                         <ImageIcon className="w-12 h-12 mx-auto mb-2" />
//                         <p>Upload images to see carousel preview</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Ribbon Preview */}
//             {newEvent.display_type === 'ribbon' && (
//               <div className="relative min-h-[200px] overflow-hidden rounded-2xl border border-slate-200">
//                 <div className="bg-slate-900 p-4">
//                   <h5 className="text-white font-semibold mb-4">Ribbon Preview</h5>
//                   <div className="bg-blue-600 text-white p-4 overflow-hidden">
//                     <div className={`whitespace-nowrap ${
//                       newEvent.ribbon_speed === 'slow' ? 'animate-scroll-slow' :
//                       newEvent.ribbon_speed === 'fast' ? 'animate-scroll-fast' :
//                       'animate-scroll-medium'
//                     }`}>
//                       <span className="inline-block px-4">
//                         {newEvent.ribbon_text || 'Enter ribbon text to see preview...'}
//                       </span>
//                       <span className="inline-block px-4">
//                         {newEvent.ribbon_text || 'Enter ribbon text to see preview...'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Preview Info */}
//             <div className="bg-slate-50 rounded-lg p-4">
//               <h6 className="font-semibold text-slate-800 mb-2">Preview Information</h6>
//               <div className="space-y-1 text-sm text-slate-600">
//                 <p><span className="font-medium">Display Type:</span> {newEvent.display_type}</p>
//                 <p><span className="font-medium">Images:</span> {uploadedImages.length} uploaded</p>
//                 {newEvent.display_type === 'carousel' && (
//                   <>
//                     <p><span className="font-medium">Auto-play:</span> {newEvent.auto_play ? 'Yes' : 'No'}</p>
//                     <p><span className="font-medium">Interval:</span> {newEvent.carousel_interval}ms</p>
//                   </>
//                 )}
//                 {newEvent.display_type === 'ribbon' && (
//                   <p><span className="font-medium">Speed:</span> {newEvent.ribbon_speed}</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Original Advanced Settings */}
//       <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
//         <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
//           <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
//             <Zap className="w-4 h-4 text-white" />
//           </div>
//           Advanced Settings
//         </h3>

//         {/* Announcements & Bulletin Board */}
//         <div className="space-y-6">
//           <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
//             <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded flex items-center justify-center">
//               <Megaphone className="w-3 h-3 text-white" />
//             </div>
//             <h4 className="text-lg font-semibold text-slate-800">Announcements & Bulletin Board</h4>
//           </div>

//           <div className="flex justify-between items-center">
//             <p className="text-slate-600">Manage system-wide announcements and notices</p>
//             <button
//               onClick={() => setShowAnnouncementForm(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
//               aria-label="Create new announcement"
//             >
//               <Plus className="w-4 h-4" />
//               New Announcement
//             </button>
//           </div>

//           {/* Error Display */}
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
//               {error}
//             </div>
//           )}

//           {/* Announcement Form */}
//           {showAnnouncementForm && (
//             <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
//               <h5 className="font-semibold text-slate-800 mb-4">
//                 {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
//               </h5>
//               <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
//                   <input
//                     type="text"
//                     value={announcementForm.title}
//                     onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//                     required
//                     aria-label="Announcement title"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
//                   <textarea
//                     value={announcementForm.content}
//                     onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
//                     rows={3}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//                     required
//                     aria-label="Announcement content"
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
//                     <select
//                       value={announcementForm.announcement_type}
//                       onChange={(e) => setAnnouncementForm(prev => ({ ...prev, announcement_type: e.target.value as any }))}
//                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//                     >
//                       <option value="general">General</option>
//                       <option value="academic">Academic</option>
//                       <option value="event">Event</option>
//                       <option value="emergency">Emergency</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
//                     <input
//                       type="date"
//                       value={announcementForm.start_date}
//                       onChange={(e) => setAnnouncementForm(prev => ({ ...prev, start_date: e.target.value }))}
//                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">End Date (Optional)</label>
//                     <input
//                       type="date"
//                       value={announcementForm.end_date}
//                       onChange={(e) => setAnnouncementForm(prev => ({ ...prev, end_date: e.target.value }))}
//                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
//                     <select
//                       multiple
//                       value={announcementForm.target_audience}
//                       onChange={(e) => setAnnouncementForm(prev => ({ 
//                         ...prev, 
//                         target_audience: Array.from(e.target.selectedOptions, option => option.value)
//                       }))}
//                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//                       size={3}
//                     >
//                       <option value="student">Students</option>
//                       <option value="parent">Parents</option>
//                       <option value="teacher">Teachers</option>
//                       <option value="admin">Administrators</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     id="isPinned"
//                     checked={announcementForm.is_pinned}
//                     onChange={(e) => setAnnouncementForm(prev => ({ ...prev, is_pinned: e.target.checked }))}
//                     className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
//                   />
//                   <label htmlFor="isPinned" className="text-sm text-slate-700">Pin to top</label>
//                 </div>
//                 <div className="flex gap-3">
//                   <button
//                     type="submit"
//                     className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
//                   >
//                     {editingAnnouncement ? 'Update' : 'Create'} Announcement
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowAnnouncementForm(false);
//                       setEditingAnnouncement(null);
//                       setAnnouncementForm({
//                         title: '',
//                         content: '',
//                         announcement_type: 'general',
//                         start_date: new Date().toISOString().split('T')[0],
//                         end_date: '',
//                         target_audience: ['student'],
//                         is_pinned: false
//                       });
//                       setError(null);
//                     }}
//                     className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           )}

//           {/* Announcements List */}
//           <div className="space-y-3">
//             {loadingAnnouncements ? (
//               <div className="flex items-center justify-center py-8">
//                 <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
//                 <span className="ml-2 text-slate-600">Loading announcements...</span>
//               </div>
//             ) : announcements.length > 0 ? (
//               announcements.map(announcement => (
//                 <div
//                   key={announcement.id}
//                   className={`p-4 rounded-lg border ${getTypeColor(announcement.announcement_type)}`}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-2">
//                         <h5 className="font-semibold">{announcement.title}</h5>
//                         {announcement.is_pinned && (
//                           <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
//                             Pinned
//                           </span>
//                         )}
//                         <span className={`text-xs px-2 py-1 rounded-full ${
//                           announcement.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
//                         }`}>
//                           {announcement.is_active ? 'Active' : 'Inactive'}
//                         </span>
//                         <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
//                           {announcement.announcement_type}
//                         </span>
//                       </div>
//                       <p className="text-sm mb-2">{announcement.content}</p>
//                       <div className="text-xs opacity-75 space-y-1">
//                         <p>Start: {new Date(announcement.start_date).toLocaleDateString()}</p>
//                         {announcement.end_date && (
//                           <p>End: {new Date(announcement.end_date).toLocaleDateString()}</p>
//                         )}
//                         <p>Target: {announcement.target_audience.join(', ')}</p>
//                         <p>Created by: {announcement.created_by_name}</p>
//                       </div>
//                     </div>
//                     <div className="flex gap-2 ml-4">
//                       <button
//                         onClick={() => handleEditAnnouncement(announcement)}
//                         className="p-1 text-slate-600 hover:text-slate-800 transition-colors"
//                         aria-label="Edit announcement"
//                       >
//                         <Edit3 className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={() => toggleAnnouncementStatus(announcement.id)}
//                         className="p-1 text-slate-600 hover:text-slate-800 transition-colors"
//                         aria-label="Toggle announcement status"
//                       >
//                         {announcement.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                       </button>
//                       <button
//                         onClick={() => handleDeleteAnnouncement(announcement.id)}
//                         className="p-1 text-red-600 hover:text-red-800 transition-colors"
//                         aria-label="Delete announcement"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8 text-slate-500">
//                 <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
//                 <p>No announcements yet</p>
//                 <p className="text-sm">Create your first announcement to get started</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Portal Settings */}
//         <div className="space-y-6 mt-8">
//           <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
//             <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded flex items-center justify-center">
//               <Users className="w-3 h-3 text-white" />
//             </div>
//             <h4 className="text-lg font-semibold text-slate-800">Portal Settings</h4>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {Object.entries(portalSettings).map(([portal, settings]) => (
//               <div key={portal} className="bg-slate-50 rounded-lg p-6 border border-slate-200">
//                 <h5 className="font-semibold text-slate-800 mb-4 capitalize">
//                   {portal.replace(/([A-Z])/g, ' $1').trim()} Portal
//                 </h5>
//                 <div className="space-y-4">
//                   <ToggleSwitch
//                     id={`${portal}-enabled`}
//                     checked={settings.enabled}
//                     onChange={(checked) => updatePortalSetting(portal, 'enabled', checked)}
//                     label="Enable Portal"
//                     description="Allow access to this portal"
//                   />
//                   <ToggleSwitch
//                     id={`${portal}-maintenance`}
//                     checked={settings.maintenanceMode}
//                     onChange={(checked) => updatePortalSetting(portal, 'maintenanceMode', checked)}
//                     label="Maintenance Mode"
//                     description="Temporarily disable access"
//                   />
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">Greeting Message</label>
//                     <input
//                       type="text"
//                       value={settings.greeting}
//                       onChange={(e) => updatePortalSetting(portal, 'greeting', e.target.value)}
//                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Advanced;



import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Megaphone, 
  Users, 
  Shield, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  Settings,
  Save,
  X,
  Upload,
  School,
  Trophy,
  BookOpen,
  Award,
  Lightbulb,
  Star,
  Sparkles,
  ChevronRight,
  Play,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

// ==================== API SERVICE ====================
const API_BASE_URL = 'https://school-management-project-qpox.onrender.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  const headers: any = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const SettingsAPI = {
  async getSettings() {
    const cacheBuster = `${Date.now()}_${Math.random()}`;
    const response = await fetch(
      `${API_BASE_URL}/api/school-settings/school-settings/?_=${cacheBuster}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  async updateSettings(settings: any) {
    const response = await fetch(
      `${API_BASE_URL}/api/school-settings/school-settings/`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(settings)
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
};

// ==================== TYPES ====================
interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SchoolSettings {
  student_portal_enabled: boolean;
  teacher_portal_enabled: boolean;
  parent_portal_enabled: boolean;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  announcement_type: 'general' | 'academic' | 'event' | 'emergency';
  start_date: string;
  end_date?: string;
  target_audience: string[];
  is_pinned: boolean;
  is_active: boolean;
  created_by_name: string;
}

// ==================== TOGGLE SWITCH COMPONENT ====================
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  id, 
  checked, 
  onChange, 
  label, 
  description, 
  disabled = false 
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex-1">
      <label htmlFor={id} className={`text-sm font-medium ${disabled ? 'text-slate-400' : 'text-slate-700'} cursor-pointer`}>
        {label}
      </label>
      {description && (
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      )}
    </div>
    <button
      type="button"
      id={id}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// ==================== PORTAL SETTINGS SECTION ====================
const PortalSettingsSection: React.FC<{
  currentSettings: SchoolSettings;
  onSettingsChange: (settings: Partial<SchoolSettings>) => Promise<void>;
}> = ({ currentSettings, onSettingsChange }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState(currentSettings);

  useEffect(() => {
    setLocalSettings(currentSettings);
  }, [currentSettings]);

  const handleToggleChange = async (field: keyof SchoolSettings, value: boolean) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Optimistically update UI
      setLocalSettings(prev => ({
        ...prev,
        [field]: value
      }));

      // Call parent handler which makes API call
      await onSettingsChange({ [field]: value });

      const fieldName = field.replace(/_/g, ' ').replace('portal enabled', 'Portal');
      setSuccess(`${fieldName} updated successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating portal setting:', err);
      setError(err instanceof Error ? err.message : 'Failed to update setting');
      
      // Revert on error
      setLocalSettings(prev => ({
        ...prev,
        [field]: !value
      }));
    } finally {
      setSaving(false);
    }
  };

  const getPortalStatus = (enabled: boolean) => {
    return enabled ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <X className="w-3 h-3 mr-1" />
        Disabled
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded flex items-center justify-center">
          <Users className="w-3 h-3 text-white" />
        </div>
        <h4 className="text-lg font-semibold text-slate-800">Portal Access Control</h4>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Success</p>
            <p className="text-sm capitalize">{success}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Portal */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Student Portal
            </h5>
            {getPortalStatus(localSettings.student_portal_enabled)}
          </div>
          
          <div className="space-y-4">
            <ToggleSwitch
              id="student-portal-enabled"
              checked={localSettings.student_portal_enabled}
              onChange={(checked) => handleToggleChange('student_portal_enabled', checked)}
              label="Enable Student Portal"
              description="Allow students to access their portal"
              disabled={saving}
            />
            
            {saving && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-slate-600 mb-2 font-medium">Features:</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li className="flex items-start gap-1">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>View results and grades</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Check attendance records</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Access class schedule</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Submit assignments</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Pay school fees</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Teacher Portal */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Teacher Portal
            </h5>
            {getPortalStatus(localSettings.teacher_portal_enabled)}
          </div>
          
          <div className="space-y-4">
            <ToggleSwitch
              id="teacher-portal-enabled"
              checked={localSettings.teacher_portal_enabled}
              onChange={(checked) => handleToggleChange('teacher_portal_enabled', checked)}
              label="Enable Teacher Portal"
              description="Allow teachers to access their portal"
              disabled={saving}
            />

            {saving && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-xs text-slate-600 mb-2 font-medium">Features:</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li className="flex items-start gap-1">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>Manage class roster</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>Record attendance</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>Enter grades</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>Create assignments</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>View analytics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Parent Portal */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Parent Portal
            </h5>
            {getPortalStatus(localSettings.parent_portal_enabled)}
          </div>
          
          <div className="space-y-4">
            <ToggleSwitch
              id="parent-portal-enabled"
              checked={localSettings.parent_portal_enabled}
              onChange={(checked) => handleToggleChange('parent_portal_enabled', checked)}
              label="Enable Parent Portal"
              description="Allow parents to access their portal"
              disabled={saving}
            />

            {saving && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs text-slate-600 mb-2 font-medium">Features:</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li className="flex items-start gap-1">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Monitor child's progress</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>View attendance</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Check grades & results</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Pay fees online</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Communicate with teachers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h6 className="font-semibold text-amber-900 mb-1">Security Notice</h6>
            <p className="text-sm text-amber-800">
              Disabling a portal will immediately prevent all users of that type from accessing their accounts. 
              Existing sessions will be terminated on their next request. Re-enabling will restore access instantly.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h6 className="font-semibold text-slate-800 mb-3">Portal Status Summary</h6>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className={`text-3xl font-bold ${localSettings.student_portal_enabled ? 'text-blue-600' : 'text-slate-400'}`}>
              {localSettings.student_portal_enabled ? 'ON' : 'OFF'}
            </p>
            <p className="text-xs text-slate-600 mt-1">Student Portal</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className={`text-3xl font-bold ${localSettings.teacher_portal_enabled ? 'text-purple-600' : 'text-slate-400'}`}>
              {localSettings.teacher_portal_enabled ? 'ON' : 'OFF'}
            </p>
            <p className="text-xs text-slate-600 mt-1">Teacher Portal</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className={`text-3xl font-bold ${localSettings.parent_portal_enabled ? 'text-green-600' : 'text-slate-400'}`}>
              {localSettings.parent_portal_enabled ? 'ON' : 'OFF'}
            </p>
            <p className="text-xs text-slate-600 mt-1">Parent Portal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const Advanced: React.FC = () => {
  const [portalSettings, setPortalSettings] = useState<SchoolSettings>({
    student_portal_enabled: true,
    teacher_portal_enabled: true,
    parent_portal_enabled: true
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      
      const response = await SettingsAPI.getSettings();
      
      console.log('Loaded settings from API:', response);
      
      setPortalSettings({
        student_portal_enabled: response.student_portal_enabled ?? true,
        teacher_portal_enabled: response.teacher_portal_enabled ?? true,
        parent_portal_enabled: response.parent_portal_enabled ?? true
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePortalSettingsChange = async (settings: Partial<SchoolSettings>) => {
    try {
      console.log('Updating portal settings:', settings);
      
      // Make API call
      const response = await SettingsAPI.updateSettings(settings);
      
      console.log('Settings updated successfully:', response);
      
      // Update local state
      setPortalSettings(prev => ({ ...prev, ...settings }));
      
      // Dispatch event for other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('settings-updated', { 
          detail: { ...portalSettings, ...settings } 
        }));
      }
    } catch (error) {
      console.error('Error updating portal settings:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to Load Settings</h2>
          <p className="text-slate-600 mb-4">{loadError}</p>
          <button
            onClick={loadSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Advanced Settings</h1>
            <p className="text-slate-600">Manage portal access, events, and system-wide configurations</p>
          </div>
        </div>
      </div>

      {/* Portal Settings */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <PortalSettingsSection 
          currentSettings={portalSettings}
          onSettingsChange={handlePortalSettingsChange}
        />
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Pro Tip: Portal Management</h3>
            <p className="text-sm text-slate-700">
              Use portal toggles to control access during maintenance, emergencies, or special events. 
              All changes take effect immediately and are logged for security auditing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advanced;