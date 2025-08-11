import { 
  EnhancedEvent, 
  EventType, 
  DisplayType, 
  ThemeType, 
  RibbonSpeed,
  EventImage,
  EventManagementServiceInterface
} from '@/types/eventTypes';

// Event Management Service
class EventManagementService implements EventManagementServiceInterface {
  private events: EnhancedEvent[] = [];
  private activeEvent: EnhancedEvent | null = null;
  private listeners: Array<(events: EnhancedEvent[], activeEvent: EnhancedEvent | null) => void> = [];

  // Clear localStorage and reset events
  clearStorage() {
    try {
      localStorage.removeItem('schoolEvents');
      localStorage.removeItem('activeSchoolEvent');
      this.events = [];
      this.activeEvent = null;
      this.notifyListeners();
      console.log('Storage cleared successfully');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Initialize from localStorage
  constructor() {
    this.loadFromStorage();
    
    // Add test carousel event if no events exist
    if (this.events.length === 0) {
      this.createTestCarouselEvent();
    }
  }

  // Create test carousel event for debugging
  private createTestCarouselEvent() {
    const testEvent = {
      title: 'Test Carousel Event',
      subtitle: 'Testing Carousel Display',
      description: 'This is a test carousel event to verify the carousel functionality in HeroSection.',
      event_type: 'announcement' as EventType,
      display_type: 'carousel' as DisplayType,
      background_theme: 'default' as ThemeType,
      is_active: false,
      start_date: '',
      end_date: '',
      cta_text: 'Learn More',
      secondary_cta_text: 'Watch Demo',
      badge_text: 'Test Event',
      ribbon_text: '',
      ribbon_speed: 'medium' as RibbonSpeed,
      carousel_interval: 3000,
      show_indicators: true,
      show_controls: true,
      auto_play: true,
      images: [
        {
          id: 1,
          url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
          image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
          alt_text: 'Students in classroom',
          order: 0,
          title: 'Modern Learning Environment',
          description: 'State-of-the-art classrooms designed for optimal learning experiences.'
        },
        {
          id: 2,
          url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
          image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
          alt_text: 'Students collaborating',
          order: 1,
          title: 'Collaborative Learning',
          description: 'Students working together to solve complex problems and share knowledge.'
        },
        {
          id: 3,
          url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
          image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
          alt_text: 'Technology in education',
          order: 2,
          title: 'Technology Integration',
          description: 'Cutting-edge technology seamlessly integrated into the learning process.'
        }
      ]
    };
    
    this.createEvent(testEvent);
  }

  // Load events from localStorage
  private loadFromStorage() {
    try {
      const storedEvents = localStorage.getItem('schoolEvents');
      const storedActiveEvent = localStorage.getItem('activeSchoolEvent');
      
      if (storedEvents) {
        this.events = JSON.parse(storedEvents);
      }
      
      if (storedActiveEvent) {
        this.activeEvent = JSON.parse(storedActiveEvent);
      }
    } catch (error) {
      console.error('Error loading events from storage:', error);
    }
  }

  // Save to localStorage
  private saveToStorage() {
    try {
      // Compress images before saving to avoid quota issues
      const compressedEvents = this.events.map(event => ({
        ...event,
        images: event.images?.map(image => ({
          ...image,
          url: this.compressImageUrl(image.url),
          image_url: this.compressImageUrl(image.image_url)
        }))
      }));

      const compressedActiveEvent = this.activeEvent ? {
        ...this.activeEvent,
        images: this.activeEvent.images?.map(image => ({
          ...image,
          url: this.compressImageUrl(image.url),
          image_url: this.compressImageUrl(image.image_url)
        }))
      } : null;

      localStorage.setItem('schoolEvents', JSON.stringify(compressedEvents));
      localStorage.setItem('activeSchoolEvent', JSON.stringify(compressedActiveEvent));
    } catch (error) {
      console.error('Error saving events to storage:', error);
      // If still failing, try to save without images
      this.saveEventsWithoutImages();
    }
  }

  // Compress image URL to reduce size
  private compressImageUrl(url: string | undefined): string | undefined {
    if (!url) return url;
    
    // If it's a data URL, keep it as is (user uploaded images)
    if (url.startsWith('data:image/')) {
      return url; // Don't compress user uploaded images
    }
    
    // If it's an external URL, add compression parameters
    if (url.includes('unsplash.com') || url.includes('images.unsplash.com')) {
      return url.includes('?') ? `${url}&w=800&h=600&fit=crop&q=80` : `${url}?w=800&h=600&fit=crop&q=80`;
    }
    
    return url;
  }

  // Compress data URL
  private compressDataUrl(dataUrl: string): string {
    // Keep the original data URL for uploaded images
    return dataUrl;
  }

  // Save events without images as fallback
  private saveEventsWithoutImages() {
    try {
      const eventsWithoutImages = this.events.map(event => ({
        ...event,
        images: event.images?.map(image => ({
          ...image,
          url: undefined,
          image_url: undefined
        }))
      }));

      const activeEventWithoutImages = this.activeEvent ? {
        ...this.activeEvent,
        images: this.activeEvent.images?.map(image => ({
          ...image,
          url: undefined,
          image_url: undefined
        }))
      } : null;

      localStorage.setItem('schoolEvents', JSON.stringify(eventsWithoutImages));
      localStorage.setItem('activeSchoolEvent', JSON.stringify(activeEventWithoutImages));
    } catch (error) {
      console.error('Error saving events without images:', error);
    }
  }

  // Notify listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.events, this.activeEvent));
  }

  // Subscribe to changes
  subscribe(listener: (events: EnhancedEvent[], activeEvent: EnhancedEvent | null) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.events, this.activeEvent);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Create new event
  createEvent(event: Omit<EnhancedEvent, 'id' | 'created_at' | 'updated_at'>): EnhancedEvent {
    console.log('Creating event in service:', event);
    
    const newEvent: EnhancedEvent = {
      ...event,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('New event with ID:', newEvent);
    
    this.events.push(newEvent);
    console.log('Total events after creation:', this.events.length);
    
    this.saveToStorage();
    this.notifyListeners();
    
    console.log('Event created and saved successfully');
    return newEvent;
  }

  // Update event
  updateEvent(id: string | number, updates: Partial<EnhancedEvent>): EnhancedEvent | null {
    const index = this.events.findIndex(e => e.id?.toString() === id.toString());
    if (index === -1) return null;

    const updatedEvent: EnhancedEvent = {
      ...this.events[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.events[index] = updatedEvent;
    
    // Update active event if it's the same one
    if (this.activeEvent?.id?.toString() === id.toString()) {
      this.activeEvent = updatedEvent;
    }

    this.saveToStorage();
    this.notifyListeners();
    return updatedEvent;
  }

  // Delete event
  deleteEvent(id: string | number): boolean {
    const index = this.events.findIndex(e => e.id?.toString() === id.toString());
    if (index === -1) return false;

    this.events.splice(index, 1);
    
    // Deactivate if it was the active event
    if (this.activeEvent?.id?.toString() === id.toString()) {
      this.activeEvent = null;
    }

    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  // Activate event
  activateEvent(id: string | number): boolean {
    const event = this.events.find(e => e.id?.toString() === id.toString());
    if (!event) return false;

    // Deactivate all other events
    this.events.forEach(e => {
      e.is_active = false;
    });

    // Activate the selected event
    event.is_active = true;
    this.activeEvent = event;

    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  // Deactivate all events
  deactivateAllEvents(): void {
    this.events.forEach(e => {
      e.is_active = false;
    });
    this.activeEvent = null;

    this.saveToStorage();
    this.notifyListeners();
  }

  // Get all events
  getAllEvents(): EnhancedEvent[] {
    return [...this.events];
  }

  // Get active event
  getActiveEvent(): EnhancedEvent | null {
    return this.activeEvent;
  }

  // Get events by type
  getEventsByType(type: EventType): EnhancedEvent[] {
    return this.events.filter(e => e.event_type === type);
  }

  // Get ribbon events
  getRibbonEvents(): EnhancedEvent[] {
    return this.events.filter(e => e.display_type === 'ribbon' && e.is_active);
  }

  // Get banner events
  getBannerEvents(): EnhancedEvent[] {
    return this.events.filter(e => e.display_type === 'banner' && e.is_active);
  }

  // Get carousel events
  getCarouselEvents(): EnhancedEvent[] {
    return this.events.filter(e => e.display_type === 'carousel' && e.is_active);
  }

  // Check if event is currently active
  isEventActive(id: string | number): boolean {
    return this.activeEvent?.id?.toString() === id.toString();
  }

  // Get current ribbon text for ContactRibbon
  getCurrentRibbonText(): string | null {
    const ribbonEvent = this.events.find(e => 
      e.display_type === 'ribbon' && 
      e.is_active && 
      e.ribbon_text
    );
    return ribbonEvent?.ribbon_text || null;
  }

  // Get current announcement for ContactRibbon
  getCurrentAnnouncement(): string | null {
    const announcementEvent = this.events.find(e => 
      e.event_type === 'announcement' && 
      e.is_active && 
      e.ribbon_text
    );
    return announcementEvent?.ribbon_text || null;
  }
}

// Create singleton instance
export const eventManagementService = new EventManagementService();

// Export types for use in components
export type { 
  EnhancedEvent, 
  EventType, 
  DisplayType, 
  ThemeType, 
  RibbonSpeed,
  EventImage 
}; 