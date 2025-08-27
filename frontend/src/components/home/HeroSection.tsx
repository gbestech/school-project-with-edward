import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronRight,
  Zap,
  Target,
  Globe,
  ArrowDown,
  Play,
  Star,
  Settings,
  Image,
  Eye,
  School,
  Trophy,
  Users,
  BookOpen,
  Award,
  Lightbulb,
  GraduationCap,
  UserCheck
} from 'lucide-react';
import { eventManagementService, EnhancedEvent } from '@/services/eventService';
import { useDesign } from '@/contexts/DesignContext';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/types';
import { useNavigate } from 'react-router-dom';

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  secondaryCtaText: string;
  badgeText: string;
  backgroundTheme: string;
  features: Array<{
    icon: any;
    title: string;
    desc: string;
    color: string;
  }>;
}

const HeroSection: React.FC = () => {
  const { settings: designSettings } = useDesign();
  const { isDarkMode } = useGlobalTheme();
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EnhancedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [contactRibbonVisible, setContactRibbonVisible] = useState(true);
  const navigate = useNavigate();

  // Check ContactRibbon visibility
  useEffect(() => {
    const checkContactRibbon = () => {
      const visible = localStorage.getItem('contactRibbonVisible') !== 'false';
      setContactRibbonVisible(visible);
    };

    // Initial check
    checkContactRibbon();

    // Listen for storage changes
    window.addEventListener('storage', checkContactRibbon);
    
    // Check periodically for changes
    const interval = setInterval(checkContactRibbon, 1000);

    return () => {
      window.removeEventListener('storage', checkContactRibbon);
      clearInterval(interval);
    };
  }, []);

  // Calculate top padding based on ContactRibbon visibility
  // When ContactRibbon visible: navbar at top-16 (64px) + navbar height (64px) = 128px
  // When ContactRibbon hidden: navbar at top-0 (0px) + navbar height (64px) = 64px
  const topPadding = contactRibbonVisible ? 'pt-32' : 'pt-16'; // 128px when ribbon visible, 64px when not

  // Admin event management state
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [availableEvents, setAvailableEvents] = useState<EnhancedEvent[]>([]);

  // Fetch available events for admin
  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      const fetchAvailableEvents = async () => {
        try {
          const response = await fetch('/api/events/');
          if (response.ok) {
            const events = await response.json();
            setAvailableEvents(events);
          }
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      };
      fetchAvailableEvents();
    }
  }, [user?.role]);

  // Set active event function
  const setActiveEventById = async (eventId: string | number) => {
    try {
      const response = await fetch(`/api/events/${eventId}/activate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        // Refresh the active event
        const eventManagementService = (window as any).eventManagementService;
        if (eventManagementService) {
          eventManagementService.refreshEvents();
        }
        setShowAdminDropdown(false);
      }
    } catch (error) {
      console.error('Error setting active event:', error);
    }
  };

  // Click outside handler for admin dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showAdminDropdown && !target.closest('.admin-dropdown')) {
        setShowAdminDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAdminDropdown]);

  // Default premium content
  const defaultContent: HeroContent = {
    title: 'Education\nReimagined',
    subtitle: 'Premium Learning Excellence',
    description: 'Experience the pinnacle of educational innovation with our revolutionary AI-powered platform that adapts, evolves, and excels with every student\'s unique journey.',
    ctaText: 'Begin Your Journey',
    secondaryCtaText: 'Watch Experience',
    badgeText: 'Next Generation Learning Platform',
    backgroundTheme: 'default',
    features: [
      { 
        icon: Zap, 
        title: 'AI-Powered Intelligence', 
        desc: 'Advanced algorithms that adapt to your learning style in real-time with unprecedented precision', 
        color: 'from-amber-400 via-orange-400 to-red-500'
      },
      { 
        icon: Target, 
        title: 'Precision Personalization', 
        desc: 'Curated content paths designed specifically for your goals with world-class expertise', 
        color: 'from-emerald-400 via-teal-400 to-cyan-500'
      },
      { 
        icon: Globe, 
        title: 'Global Excellence', 
        desc: 'World-class education accessible from anywhere, delivering premium results consistently', 
        color: 'from-violet-400 via-purple-400 to-fuchsia-500'
      }
    ]
  };

  // Ultra Premium Theme configurations
  const themes = {
    default: {
      background: 'from-slate-950 via-indigo-950 to-purple-950',
      accent: 'from-cyan-400 via-blue-400 to-indigo-400',
      orb1: 'rgba(59, 130, 246, 0.12)',
      orb2: 'rgba(139, 92, 246, 0.10)',
      orb3: 'rgba(236, 72, 153, 0.08)',
      orb4: 'rgba(16, 185, 129, 0.06)',
      features: defaultContent.features
    },
    graduation: {
      background: 'from-emerald-950 via-teal-950 to-cyan-950',
      accent: 'from-emerald-300 via-teal-300 to-cyan-300',
      orb1: 'rgba(16, 185, 129, 0.15)',
      orb2: 'rgba(20, 184, 166, 0.12)',
      orb3: 'rgba(6, 182, 212, 0.10)',
      orb4: 'rgba(34, 197, 94, 0.08)',
      features: [
        { icon: Award, title: 'Graduation Success', desc: 'Celebrating our graduates\' outstanding achievements', color: 'from-emerald-300 via-teal-300 to-cyan-400' },
        { icon: Trophy, title: 'Academic Excellence', desc: 'Recognized for delivering exceptional educational outcomes', color: 'from-amber-300 via-yellow-300 to-orange-400' },
        { icon: Users, title: 'Alumni Network', desc: 'Join thousands of successful graduates worldwide', color: 'from-rose-300 via-pink-300 to-fuchsia-400' }
      ]
    },
    enrollment: {
      background: 'from-fuchsia-950 via-purple-950 to-violet-950',
      accent: 'from-fuchsia-300 via-purple-300 to-violet-300',
      orb1: 'rgba(217, 70, 239, 0.15)',
      orb2: 'rgba(168, 85, 247, 0.12)',
      orb3: 'rgba(139, 92, 246, 0.10)',
      orb4: 'rgba(196, 181, 253, 0.08)',
      features: [
        { icon: BookOpen, title: 'Open Enrollment', desc: 'Secure your spot in our premium programs', color: 'from-fuchsia-300 via-purple-300 to-violet-400' },
        { icon: Star, title: 'Limited Seats', desc: 'Exclusive access to world-class education', color: 'from-amber-300 via-yellow-300 to-orange-400' },
        { icon: School, title: 'Early Bird Benefits', desc: 'Special advantages for early enrollment', color: 'from-emerald-300 via-teal-300 to-cyan-400' }
      ]
    },
    achievement: {
      background: 'from-amber-950 via-orange-950 to-red-950',
      accent: 'from-amber-300 via-orange-300 to-red-300',
      orb1: 'rgba(245, 158, 11, 0.15)',
      orb2: 'rgba(249, 115, 22, 0.12)',
      orb3: 'rgba(239, 68, 68, 0.10)',
      orb4: 'rgba(251, 191, 36, 0.08)',
      features: [
        { icon: Trophy, title: 'Award Winning', desc: 'Recently recognized for educational excellence', color: 'from-amber-300 via-orange-300 to-red-400' },
        { icon: Star, title: 'Top Rated', desc: 'Highest satisfaction scores in the industry', color: 'from-yellow-300 via-amber-300 to-orange-400' },
        { icon: Target, title: 'Proven Results', desc: '98% student success rate across all programs', color: 'from-rose-300 via-pink-300 to-red-400' }
      ]
    },
    innovation: {
      background: 'from-blue-950 via-indigo-950 to-cyan-950',
      accent: 'from-blue-300 via-indigo-300 to-cyan-300',
      orb1: 'rgba(59, 130, 246, 0.15)',
      orb2: 'rgba(99, 102, 241, 0.12)',
      orb3: 'rgba(6, 182, 212, 0.10)',
      orb4: 'rgba(56, 189, 248, 0.08)',
      features: [
        { icon: Lightbulb, title: 'Innovation Lab', desc: 'Cutting-edge research and development initiatives', color: 'from-blue-300 via-indigo-300 to-cyan-400' },
        { icon: Zap, title: 'Tech Breakthrough', desc: 'Revolutionary learning technologies launched', color: 'from-yellow-300 via-amber-300 to-orange-400' },
        { icon: Globe, title: 'Future Ready', desc: 'Preparing students for tomorrow\'s challenges', color: 'from-emerald-300 via-teal-300 to-cyan-400' }
      ]
    },
    premium: {
      background: 'from-rose-950 via-slate-950 to-blue-950',
      accent: 'from-rose-300 via-slate-300 to-blue-300',
      orb1: 'rgba(244, 63, 94, 0.15)',
      orb2: 'rgba(100, 116, 139, 0.12)',
      orb3: 'rgba(59, 130, 246, 0.10)',
      orb4: 'rgba(236, 72, 153, 0.08)',
      features: [
        { icon: Trophy, title: 'Premium Excellence', desc: 'Unmatched quality in educational delivery and outcomes', color: 'from-rose-300 via-pink-300 to-red-400' },
        { icon: Star, title: 'Elite Standards', desc: 'Rigorous academic standards with proven success rates', color: 'from-amber-300 via-yellow-300 to-orange-400' },
        { icon: Award, title: 'Distinguished Recognition', desc: 'Nationally recognized for academic excellence', color: 'from-blue-300 via-indigo-300 to-purple-400' }
      ]
    },
    // New Ultra Premium Themes
    obsidian: {
      background: 'from-gray-950 via-black to-slate-950',
      accent: 'from-emerald-400 via-cyan-400 to-blue-400',
      orb1: 'rgba(16, 185, 129, 0.18)',
      orb2: 'rgba(6, 182, 212, 0.15)',
      orb3: 'rgba(59, 130, 246, 0.12)',
      orb4: 'rgba(34, 197, 94, 0.10)',
      features: [
        { icon: Zap, title: 'Quantum Learning', desc: 'Next-generation AI that learns how you learn', color: 'from-emerald-400 via-cyan-400 to-blue-500' },
        { icon: Target, title: 'Precision Focus', desc: 'Laser-targeted curriculum for maximum impact', color: 'from-cyan-400 via-blue-400 to-indigo-500' },
        { icon: Globe, title: 'Global Network', desc: 'Connect with elite learners worldwide', color: 'from-blue-400 via-indigo-400 to-purple-500' }
      ]
    },
    aurora: {
      background: 'from-indigo-950 via-violet-950 to-pink-950',
      accent: 'from-pink-300 via-violet-300 to-indigo-300',
      orb1: 'rgba(236, 72, 153, 0.18)',
      orb2: 'rgba(139, 92, 246, 0.15)',
      orb3: 'rgba(99, 102, 241, 0.12)',
      orb4: 'rgba(217, 70, 239, 0.10)',
      features: [
        { icon: Sparkles, title: 'Aurora Intelligence', desc: 'Breakthrough AI that illuminates your potential', color: 'from-pink-400 via-violet-400 to-indigo-500' },
        { icon: Star, title: 'Stellar Performance', desc: 'Achieve results that shine brighter than ever', color: 'from-violet-400 via-purple-400 to-fuchsia-500' },
        { icon: Award, title: 'Cosmic Recognition', desc: 'Join the constellation of high achievers', color: 'from-indigo-400 via-blue-400 to-cyan-500' }
      ]
    },
    midnight: {
      background: 'from-slate-950 via-blue-950 to-indigo-950',
      accent: 'from-blue-300 via-cyan-300 to-teal-300',
      orb1: 'rgba(59, 130, 246, 0.20)',
      orb2: 'rgba(6, 182, 212, 0.16)',
      orb3: 'rgba(20, 184, 166, 0.12)',
      orb4: 'rgba(56, 189, 248, 0.08)',
      features: [
        { icon: Globe, title: 'Midnight Mastery', desc: 'Learn at your peak performance hours', color: 'from-blue-400 via-cyan-400 to-teal-500' },
        { icon: Zap, title: 'Night Vision', desc: 'See opportunities others miss in the dark', color: 'from-cyan-400 via-teal-400 to-emerald-500' },
        { icon: Target, title: 'Lunar Precision', desc: 'Navigate your path with celestial accuracy', color: 'from-teal-400 via-emerald-400 to-green-500' }
      ]
    },
    crimson: {
      background: 'from-red-950 via-rose-950 to-pink-950',
      accent: 'from-red-300 via-rose-300 to-pink-300',
      orb1: 'rgba(239, 68, 68, 0.18)',
      orb2: 'rgba(244, 63, 94, 0.15)',
      orb3: 'rgba(236, 72, 153, 0.12)',
      orb4: 'rgba(251, 113, 133, 0.10)',
      features: [
        { icon: Trophy, title: 'Crimson Excellence', desc: 'Bold achievements that demand attention', color: 'from-red-400 via-rose-400 to-pink-500' },
        { icon: Zap, title: 'Passionate Power', desc: 'Fuel your ambition with unstoppable energy', color: 'from-rose-400 via-pink-400 to-fuchsia-500' },
        { icon: Star, title: 'Ruby Recognition', desc: 'Earn accolades as precious as gems', color: 'from-pink-400 via-fuchsia-400 to-purple-500' }
      ]
    },
    forest: {
      background: 'from-green-950 via-emerald-950 to-teal-950',
      accent: 'from-green-300 via-emerald-300 to-teal-300',
      orb1: 'rgba(34, 197, 94, 0.18)',
      orb2: 'rgba(16, 185, 129, 0.15)',
      orb3: 'rgba(20, 184, 166, 0.12)',
      orb4: 'rgba(5, 150, 105, 0.10)',
      features: [
        { icon: Globe, title: 'Forest Wisdom', desc: 'Grow your knowledge like ancient trees', color: 'from-green-400 via-emerald-400 to-teal-500' },
        { icon: Target, title: 'Natural Focus', desc: 'Concentrate with the serenity of nature', color: 'from-emerald-400 via-teal-400 to-cyan-500' },
        { icon: Award, title: 'Organic Growth', desc: 'Sustainable learning that lasts a lifetime', color: 'from-teal-400 via-cyan-400 to-blue-500' }
      ]
    },
    golden: {
      background: 'from-yellow-950 via-amber-950 to-orange-950',
      accent: 'from-yellow-300 via-amber-300 to-orange-300',
      orb1: 'rgba(251, 191, 36, 0.20)',
      orb2: 'rgba(245, 158, 11, 0.16)',
      orb3: 'rgba(249, 115, 22, 0.12)',
      orb4: 'rgba(234, 179, 8, 0.08)',
      features: [
        { icon: Star, title: 'Golden Standard', desc: 'The benchmark for educational excellence', color: 'from-yellow-400 via-amber-400 to-orange-500' },
        { icon: Trophy, title: 'Midas Touch', desc: 'Everything you learn turns to success', color: 'from-amber-400 via-orange-400 to-red-500' },
        { icon: Award, title: 'Gilded Achievement', desc: 'Accomplishments that shine eternally', color: 'from-orange-400 via-red-400 to-pink-500' }
      ]
    }
  };

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Subscribe to event management service
  useEffect(() => {
    const unsubscribe = eventManagementService.subscribe((events, currentActiveEvent) => {
      setActiveEvent(currentActiveEvent);
      setLoading(false);
      // Reset carousel slide when event changes
      setCurrentSlide(0);
    });

    return unsubscribe;
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (activeEvent?.display_type === 'carousel' && activeEvent?.auto_play && activeEvent?.images && activeEvent.images.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % (activeEvent.images?.length || 1));
      }, activeEvent.carousel_interval || 5000);
      return () => clearInterval(interval);
    }
  }, [activeEvent?.display_type, activeEvent?.auto_play, activeEvent?.images, activeEvent?.carousel_interval]);

  // Get current content based on active event or default
  const getCurrentContent = (): HeroContent => {
    if (activeEvent && !previewMode) {
      const theme = themes[activeEvent.background_theme as keyof typeof themes] || themes.default;
      return {
        title: activeEvent.title || '',
        subtitle: activeEvent.subtitle || '',
        description: activeEvent.description || '',
        ctaText: activeEvent.cta_text || '',
        secondaryCtaText: activeEvent.secondary_cta_text || '',
        badgeText: activeEvent.badge_text || '',
        backgroundTheme: activeEvent.background_theme || 'default',
        features: theme.features
      };
    }
    return defaultContent;
  };

  const currentContent = getCurrentContent();
  const currentTheme = themes[currentContent.backgroundTheme as keyof typeof themes] || themes.default;

  // Handle display based on event type
  const renderEventContent = () => {
    if (!activeEvent) {
      // Show carousel as default when no active event
      return renderDefaultCarouselContent();
    }

    // Debug logging
    console.log('Active Event:', activeEvent);
    console.log('Display Type:', activeEvent.display_type);
    console.log('Images:', activeEvent.images);

    switch (activeEvent.display_type) {
      case 'banner':
        return renderBannerContent();
      case 'carousel':
        return renderCarouselContent();
      case 'ribbon':
        return renderRibbonContent();
      default:
        return renderCarouselContent(); // Default to carousel instead of default content
    }
  };

  const renderDefaultContent = () => (
    <div className={`relative z-10 flex flex-col min-h-screen ${topPadding}`} style={{
      background: designSettings?.theme === 'premium'
        ? 'linear-gradient(135deg, #881337 0%, #0f172a 50%, #1e3a8a 100%)'
        : designSettings?.theme === 'default'
        ? 'linear-gradient(135deg, #0f172a 0%, #312e81 50%, #581c87 100%)'
        : `linear-gradient(135deg, ${currentTheme.background.replace('from-', '').replace(' via-', ', ').replace(' to-', ', ')})`
    }}>
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-8 py-12">
        <div className="max-w-8xl mx-auto w-full text-center">
          
          {/* Ultra Premium Badge */}
          <div className={`inline-flex items-center space-x-4 bg-white/10 dark:bg-slate-800/20 backdrop-blur-3xl rounded-full px-10 py-5 mb-16 border border-white/20 dark:border-slate-700/50 shadow-2xl shadow-blue-500/20 dark:shadow-blue-500/10 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="relative">
              <Sparkles className="text-amber-500 dark:text-amber-300 animate-pulse" size={28} />
              <div className="absolute inset-0 text-amber-500 dark:text-amber-300 animate-ping opacity-30">
                <Sparkles size={28} />
              </div>
            </div>
            <span className="text-slate-800 dark:text-slate-100 font-bold text-xl tracking-wide">{currentContent.badgeText}</span>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-500 dark:text-amber-300 fill-current" />
              ))}
            </div>
          </div>
          
          {/* Ultra Premium Hero Title */}
          <div className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] font-black mb-12 leading-[0.85] tracking-tight">
              {currentContent.title.split('\n').map((line, index) => (
                <span key={index} className={`block ${
                  index === 0 
                    ? 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-200 bg-clip-text text-transparent'
                    : `bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent relative`
                }`}>
                  {line}
                  {index === 1 && (
                    <div className={`absolute -right-8 top-4 w-12 h-12 bg-gradient-to-r ${currentTheme.accent} rounded-full opacity-80 animate-bounce`}></div>
                  )}
                </span>
              ))}
            </h1>
          </div>
          
          {/* Ultra Premium Subtitle */}
          {currentContent.subtitle && (
            <div className={`transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-light text-slate-700 dark:text-slate-300 mb-8 tracking-wide">
                {currentContent.subtitle}
              </h2>
            </div>
          )}
          
          {/* Ultra Premium Description */}
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-xl sm:text-2xl md:text-3xl text-slate-600 dark:text-slate-400 mb-20 max-w-5xl mx-auto leading-relaxed font-light">
              {currentContent.description}
            </p>
          </div>
          
          {/* Ultra Premium CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-10 justify-center items-center mb-12 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <button 
              className="group relative text-white px-16 py-6 rounded-3xl font-bold text-2xl shadow-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-3 overflow-hidden min-w-[320px] border border-white/20 dark:border-slate-600/50"
              style={{
                background: designSettings?.theme === 'premium' 
                  ? 'linear-gradient(135deg, #881337 0%, #1e3a8a 50%, #1e40af 100%)'
                  : `linear-gradient(135deg, ${currentTheme.accent.replace('from-', '').replace(' via-', ', ').replace(' to-', ', ')})`,
                boxShadow: designSettings?.theme === 'premium'
                  ? '0 25px 50px -12px rgba(136, 19, 55, 0.4)'
                  : `0 25px 50px -12px ${currentTheme.orb1}`
              }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: designSettings?.theme === 'premium'
                    ? 'linear-gradient(135deg, rgba(136, 19, 55, 0.8) 0%, rgba(30, 58, 138, 0.6) 100%)'
                    : `linear-gradient(135deg, ${currentTheme.orb1} 0%, ${currentTheme.orb2} 100%)`
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="absolute inset-0 rounded-3xl border-2 border-white/20 group-hover:border-white/50 transition-colors duration-500"></div>
              
              <span className="relative z-10 flex items-center justify-center space-x-4">
                <span>{currentContent.ctaText}</span>
                <div className="transform group-hover:translate-x-2 transition-transform duration-300">
                  <ChevronRight size={28} />
                </div>
              </span>
            </button>
            
            <button 
              className="group backdrop-blur-3xl text-slate-800 dark:text-slate-300 px-16 py-6 rounded-3xl font-semibold text-2xl transition-all duration-500 transform hover:scale-105 border-2 min-w-[320px] relative overflow-hidden bg-white/40 dark:bg-slate-800/20 hover:bg-white/60 dark:hover:bg-slate-700/30 border-white/40 dark:border-slate-600/50"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
              ></div>
              <span className="relative z-10 flex items-center justify-center space-x-4">
                <Play className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
                <span>{currentContent.secondaryCtaText}</span>
              </span>
            </button>
          </div>

          {/* Ultra Premium Scroll Indicator */}
          <div className={`transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex flex-col items-center space-y-4 animate-bounce">
              <span className="text-slate-600 dark:text-slate-400 text-lg font-medium tracking-widest uppercase">Discover Excellence</span>
              <ArrowDown className="w-8 h-8 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBannerContent = () => {
    return renderDefaultContent(); // Banner uses the same layout as default
  };



  // Get default carousel slides from localStorage or use fallback
  const getDefaultSlides = () => {
    const savedImages = localStorage.getItem('defaultCarouselImages');
    if (savedImages) {
      const images = JSON.parse(savedImages);
      if (images.length > 0) {
        return images.map((image: any, index: number) => ({
          title: image.title || `Slide ${index + 1}`,
          subtitle: 'Premium Learning Excellence',
          description: image.description || 'Experience the pinnacle of educational innovation with our revolutionary AI-powered platform.',
          ctaText: 'Begin Your Journey',
          secondaryCtaText: 'Watch Experience',
          badgeText: 'Welcome to Our School',
          imageUrl: image.url,
          features: [
            { icon: Zap, title: 'AI-Powered Intelligence', desc: 'Advanced algorithms that adapt to your learning style in real-time', color: 'from-amber-400 to-orange-500' },
            { icon: Target, title: 'Precision Personalization', desc: 'Curated content paths designed specifically for your goals', color: 'from-emerald-400 to-teal-500' },
            { icon: Globe, title: 'Global Excellence', desc: 'World-class education accessible from anywhere', color: 'from-violet-400 to-purple-500' }
          ]
        }));
      }
    }
    
    // Fallback to default slides if no images uploaded
    return [
      {
        title: 'Education Reimagined',
        subtitle: 'Premium Learning Excellence',
        description: 'Experience the pinnacle of educational innovation with our revolutionary AI-powered platform that adapts, evolves, and excels with every student\'s unique journey.',
        ctaText: 'Begin Your Journey',
        secondaryCtaText: 'Watch Experience',
        badgeText: 'Welcome to Our School',
        imageUrl: null,
        features: [
          { icon: Zap, title: 'AI-Powered Intelligence', desc: 'Advanced algorithms that adapt to your learning style in real-time', color: 'from-amber-400 to-orange-500' },
          { icon: Target, title: 'Precision Personalization', desc: 'Curated content paths designed specifically for your goals', color: 'from-emerald-400 to-teal-500' },
          { icon: Globe, title: 'Global Excellence', desc: 'World-class education accessible from anywhere', color: 'from-violet-400 to-purple-500' }
        ]
      },
      {
        title: 'Academic Excellence',
        subtitle: 'Nurturing Future Leaders',
        description: 'Our comprehensive curriculum is designed to challenge and inspire students, fostering critical thinking, creativity, and leadership skills for tomorrow\'s world.',
        ctaText: 'Explore Programs',
        secondaryCtaText: 'Take a Tour',
        badgeText: 'Academic Excellence',
        imageUrl: null,
        features: [
          { icon: BookOpen, title: 'Comprehensive Curriculum', desc: 'Rigorous academic programs designed for success', color: 'from-blue-400 to-indigo-500' },
          { icon: Users, title: 'Expert Faculty', desc: 'World-class educators with proven track records', color: 'from-green-400 to-emerald-500' },
          { icon: Award, title: 'Proven Results', desc: 'Consistently high achievement and success rates', color: 'from-yellow-400 to-orange-500' }
        ]
      },
      {
        title: 'Technology Integration',
        subtitle: 'Future-Ready Learning',
        description: 'Cutting-edge technology seamlessly integrated into every aspect of learning, preparing students for the digital age with hands-on experience and innovation.',
        ctaText: 'Discover Technology',
        secondaryCtaText: 'See Innovation',
        badgeText: 'Tech-Forward Education',
        imageUrl: null,
        features: [
          { icon: Lightbulb, title: 'Innovation Lab', desc: 'State-of-the-art facilities for hands-on learning', color: 'from-purple-400 to-pink-500' },
          { icon: Settings, title: 'Smart Classrooms', desc: 'Interactive learning environments with latest tech', color: 'from-cyan-400 to-blue-500' },
          { icon: Eye, title: 'Digital Literacy', desc: 'Essential skills for the modern workplace', color: 'from-indigo-400 to-purple-500' }
        ]
      }
    ];
  };

  const defaultSlides = getDefaultSlides();

  const [currentDefaultSlide, setCurrentDefaultSlide] = useState(0);

  const nextDefaultSlide = () => {
    setCurrentDefaultSlide((prev) => (prev + 1) % defaultSlides.length);
  };

  const prevDefaultSlide = () => {
    setCurrentDefaultSlide((prev) => (prev - 1 + defaultSlides.length) % defaultSlides.length);
  };

  const goToDefaultSlide = (index: number) => {
    setCurrentDefaultSlide(index);
  };

  // Auto-advance default carousel
  useEffect(() => {
    if (!activeEvent) {
      const interval = setInterval(() => {
        setCurrentDefaultSlide((prev) => (prev + 1) % defaultSlides.length);
      }, 8000); // 8 seconds per slide for slower, more elegant transitions
      return () => clearInterval(interval);
    }
  }, [activeEvent]);

  const renderDefaultCarouselContent = () => {
    return (
      <div className="relative z-10 h-screen">
        {/* Full-width Carousel Container */}
        <div className="relative w-full h-full overflow-hidden">
          {/* Carousel Slides */}
          <div 
            className="flex transition-transform duration-1000 ease-in-out h-full"
            style={{ transform: `translateX(-${currentDefaultSlide * 100}%)` }}
          >
            {defaultSlides.map((slide: any, index: number) => (
              <div key={index} className="w-full flex-shrink-0 relative">
                {/* Background with gradient or uploaded image */}
                <div className="absolute inset-0">
                  {slide.imageUrl ? (
                    <>
                      {/* Uploaded image as background */}
                      <img 
                        src={slide.imageUrl} 
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay gradient for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    </>
                  ) : (
                    <>
                      {/* Default gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
                        {/* Animated background elements */}
                        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
                        <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-green-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
                      </div>
                    </>
                  )}
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              
                    {/* Welcome Badge */}
                    <div className={`inline-flex items-center space-x-2 bg-white/10 backdrop-blur-3xl rounded-full px-3 py-2 mb-4 border border-white/20 shadow-2xl transition-all duration-1000 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                      <div className="relative">
                        <School className="text-blue-300 animate-pulse w-4 h-4" />
                        <div className="absolute inset-0 text-blue-300 animate-ping opacity-30">
                          <School className="w-4 h-4" />
                        </div>
                      </div>
                      <span className="text-white font-bold text-sm tracking-wide">{slide.badgeText}</span>
                      <div className="flex space-x-1">
                        {[...Array(3)].map((_: any, i: number) => (
                          <Star key={i} className="w-3 h-3 text-amber-300 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    {/* Main Title */}
                    <div className={`transition-all duration-1000 delay-300 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                      <h1 className={`font-black leading-[0.9] tracking-tight ${
                        slide.imageUrl 
                          ? 'text-3xl sm:text-5xl md:text-6xl lg:text-7xl mb-6' 
                          : 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl mb-3'
                      }`}>
                        <span className="bg-gradient-to-r from-white via-blue-100 to-slate-200 bg-clip-text text-transparent">
                          {slide.title}
                        </span>
                      </h1>
                    </div>
                    
                    {/* Subtitle */}
                    <div className={`transition-all duration-1000 delay-400 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                      <h2 className={`font-light text-slate-200 tracking-wide ${
                        slide.imageUrl 
                          ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6' 
                          : 'text-base sm:text-lg md:text-xl mb-3'
                      }`}>
                        {slide.subtitle}
                      </h2>
                    </div>
                    
                    {/* Description */}
                    <div className={`transition-all duration-1000 delay-500 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                      <p className={`text-slate-300 leading-relaxed font-light ${
                        slide.imageUrl 
                          ? 'text-base sm:text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto' 
                          : 'text-sm sm:text-base md:text-lg mb-4 max-w-2xl mx-auto'
                      }`}>
                        {slide.description}
                      </p>
                    </div>
                    
                    {/* Feature Cards - Only show when no uploaded image */}
                    {!slide.imageUrl && (
                      <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 transition-all duration-1000 delay-600 ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}>
                        {slide.features.map((feature: any, index: number) => (
                          <div key={index} className="bg-white/10 backdrop-blur-2xl rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
                            <div className="flex items-center justify-center mb-2">
                              <div className={`w-8 h-8 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center`}>
                                <feature.icon className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                            <p className="text-xs text-slate-300">{feature.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* CTA Buttons */}
                    <div className={`flex flex-col sm:flex-row gap-3 justify-center items-center transition-all duration-1000 delay-700 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                      <button 
                        className={`group relative text-white rounded-xl font-bold shadow-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 overflow-hidden border border-white/20 ${
                          slide.imageUrl 
                            ? 'px-8 py-3 text-base min-w-[220px]' 
                            : 'px-6 py-2 text-sm min-w-[200px]'
                        }`}
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                          boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.4)'
                        }}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-600/80 to-purple-600/60"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="absolute inset-0 rounded-xl border-2 border-white/20 group-hover:border-white/50 transition-colors duration-500"></div>
                        
                        <span className="relative z-10 flex items-center justify-center space-x-2">
                          <span>{slide.ctaText}</span>
                          <div className="transform group-hover:translate-x-2 transition-transform duration-300">
                            <ChevronRight size={slide.imageUrl ? 24 : 20} />
                          </div>
                        </span>
                      </button>
                      
                      <button 
                        className={`group backdrop-blur-3xl text-white rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 border-2 relative overflow-hidden bg-white/20 hover:bg-white/30 border-white/40 ${
                          slide.imageUrl 
                            ? 'px-8 py-3 text-base min-w-[220px]' 
                            : 'px-6 py-2 text-sm min-w-[200px]'
                        }`}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                        <span className="relative z-10 flex items-center justify-center space-x-2">
                          <Play className={`group-hover:scale-110 transition-transform duration-300 ${
                            slide.imageUrl ? 'w-5 h-5' : 'w-4 h-4'
                          }`} />
                          <span>{slide.secondaryCtaText}</span>
                        </span>
                      </button>
                    </div>

                    {/* Scroll Indicator */}
                    <div className={`transition-all duration-1000 delay-1000 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                      <div className="flex flex-col items-center space-y-1 animate-bounce mt-4">
                        <span className="text-slate-300 text-xs font-medium tracking-widest uppercase">Discover Excellence</span>
                        <ArrowDown className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevDefaultSlide}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/30 z-20"
            aria-label="Previous slide"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <button
            onClick={nextDefaultSlide}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/30 z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {defaultSlides.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => goToDefaultSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentDefaultSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="absolute top-8 right-8 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium z-20">
            {currentDefaultSlide + 1} / {defaultSlides.length}
          </div>

          {/* Auto-play Indicator */}
          <div className="absolute top-8 left-8 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium z-20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Auto-play</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCarouselContent = () => {
    if (!activeEvent?.images || activeEvent.images.length === 0) {
      return (
        <div className={`relative z-10 flex flex-col min-h-screen ${topPadding}`}>
          <div className="flex-1 flex flex-col justify-center px-6 lg:px-8 py-20">
            <div className="max-w-4xl mx-auto w-full text-center">
              <div className="bg-white/20 dark:bg-white/5 backdrop-blur-3xl rounded-3xl p-12 border border-white/30 dark:border-white/10">
                <Image className="w-24 h-24 text-slate-600 dark:text-white/50 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Carousel Event</h2>
                <p className="text-slate-600 dark:text-white/70 text-lg mb-8">{activeEvent?.title}</p>
                <p className="text-slate-500 dark:text-white/50">{activeEvent?.description}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const nextSlide = () => {
      if (activeEvent?.images) {
        setCurrentSlide((prev) => (prev + 1) % (activeEvent.images?.length || 1));
      }
    };

    const prevSlide = () => {
      if (activeEvent?.images) {
        setCurrentSlide((prev) => (prev - 1 + (activeEvent.images?.length || 1)) % (activeEvent.images?.length || 1));
      }
    };

    const goToSlide = (index: number) => {
      setCurrentSlide(index);
    };

    return (
      <div className={`relative z-10 min-h-screen ${topPadding}`}>
        {/* Full-width Carousel Container */}
        <div className="relative w-full h-screen overflow-hidden">
          {/* Carousel Slides */}
          <div 
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {activeEvent.images?.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0 relative">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={image.image_url || image.url} 
                    alt={image.alt_text || image.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', image);
                      console.error('Image URL:', image.image_url || image.url);
                    }}
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white max-w-6xl mx-auto px-6 lg:px-8">
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/30">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium tracking-wide uppercase">Featured Event</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                      {image.title || activeEvent.title}
                    </h1>

                    {/* Subtitle */}
                    {image.description && (
                      <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
                        {image.description}
                      </p>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <button className="group bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        <span className="flex items-center space-x-2">
                          <span>Learn More</span>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                      </button>
                      <button className="group border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-slate-900 transition-all duration-300 transform hover:scale-105">
                        <span className="flex items-center space-x-2">
                          <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                          <span>Watch Video</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {activeEvent.show_controls && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/30 z-20"
                aria-label="Previous slide"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/30 z-20"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {activeEvent.show_indicators && activeEvent.images && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
              {activeEvent.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Slide Counter */}
          <div className="absolute top-8 right-8 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium z-20">
            {currentSlide + 1} / {activeEvent.images?.length || 1}
          </div>

          {/* Auto-play Indicator */}
          {activeEvent.auto_play && (
            <div className="absolute top-8 left-8 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium z-20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Auto-play</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRibbonContent = () => {
    if (!activeEvent?.ribbon_text) {
      return renderDefaultContent();
    }

    // Check if ContactRibbon is visible to avoid duplicate ribbons
    const contactRibbonVisible = localStorage.getItem('contactRibbonVisible') !== 'false';
    
    // If ContactRibbon is visible, don't render the hero ribbon to avoid duplication
    if (contactRibbonVisible) {
      return renderDefaultContent();
    }

    const speedClass = activeEvent.ribbon_speed === 'slow' ? 'animate-scroll-slow' :
                      activeEvent.ribbon_speed === 'fast' ? 'animate-scroll-fast' :
                      'animate-scroll-medium';

    return (
      <div className={`relative z-10 flex flex-col min-h-screen ${topPadding}`}>
        {/* Ribbon */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-6 overflow-hidden">
          <div className={`whitespace-nowrap ${speedClass} flex items-center justify-center h-full`}>
            <span className="text-lg font-semibold px-8">{activeEvent.ribbon_text}</span>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto w-full text-center">
            <h1 className="text-5xl sm:text-7xl font-black mb-12 leading-tight">
              <span className="bg-gradient-to-r from-slate-800 via-blue-800 to-slate-700 dark:from-white dark:via-blue-100 dark:to-slate-200 bg-clip-text text-transparent">
                {activeEvent.title}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {activeEvent.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl">
                {activeEvent.cta_text}
              </button>
              <button className="bg-white/40 dark:bg-white/10 text-slate-800 dark:text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/60 dark:hover:bg-white/20 transition-colors duration-300 border border-white/40 dark:border-white/20">
                {activeEvent.secondary_cta_text}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-white text-2xl">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-white text-2xl">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section 
      className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'
      }`}
      style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 dark:bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 dark:bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-green-400/20 dark:bg-green-400/10 rounded-full blur-3xl"></div>
        {/* Additional light mode decorative elements */}
        {!isDarkMode && (
          <>
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
          </>
        )}
      </div>

      {/* Render Event Content or Default Content */}
      {renderEventContent()}

      {/* Admin Settings Toggle - Only for Admin Users */}
      {user?.role === UserRole.ADMIN && (
        <div className="admin-dropdown fixed top-20 right-6 z-50">
          <button
            onClick={() => setShowAdminDropdown(!showAdminDropdown)}
            className="bg-white/20 dark:bg-slate-800/50 backdrop-blur-2xl p-4 rounded-2xl border border-white/30 dark:border-slate-600/50 hover:bg-white/30 dark:hover:bg-slate-700/50 transition-all duration-300 group"
          >
            <Settings className="w-6 h-6 text-slate-700 dark:text-slate-300 group-hover:rotate-90 transition-transform duration-300" />
          </button>
          
          {/* Admin Dropdown */}
          {showAdminDropdown && (
            <div className="admin-dropdown absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-xl">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Event Management</h3>
                
                {/* Current Active Event */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Current Active Event</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {activeEvent ? activeEvent.title : 'No active event'}
                  </p>
                </div>
                
                {/* Available Events */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Available Events</h4>
                  {availableEvents.length > 0 ? (
                    availableEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => event.id && setActiveEventById(event.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          activeEvent?.id === event.id
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              activeEvent?.id === event.id
                                ? 'text-green-800 dark:text-green-200'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}>
                              {event.title}
                            </p>
                            <p className={`text-xs ${
                              activeEvent?.id === event.id
                                ? 'text-green-600 dark:text-green-300'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}>
                              {event.display_type} • {event.background_theme}
                            </p>
                          </div>
                          {activeEvent?.id === event.id && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      No events available
                    </p>
                  )}
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setShowAdminDropdown(false)}
                  className="w-full mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default HeroSection;