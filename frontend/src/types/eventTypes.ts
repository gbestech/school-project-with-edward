// Enhanced Event Types
export type EventType = 'announcement' | 'enrollment' | 'achievement' | 'event' | 'ribbon';
export type DisplayType = 'banner' | 'carousel' | 'ribbon';
export type ThemeType = 'default' | 'graduation' | 'enrollment' | 'achievement' | 'innovation';
export type RibbonSpeed = 'slow' | 'medium' | 'fast';

// Base Event Interface
export interface BaseEvent {
  id?: string | number;
  title: string;
  subtitle?: string;
  description: string;
  event_type: EventType;
  display_type: DisplayType;
  background_theme: ThemeType;
  ribbon_text?: string;
  ribbon_speed?: RibbonSpeed;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  cta_text?: string;
  secondary_cta_text?: string;
  badge_text?: string;
  carousel_interval?: number;
  show_indicators?: boolean;
  show_controls?: boolean;
  auto_play?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EventImage {
  id?: number;
  url?: string;
  image_url?: string;
  alt_text: string;
  order: number;
  title: string;
  description: string;
}

// Enhanced Event Interface
export interface EnhancedEvent extends BaseEvent {
  images?: EventImage[];
}

// Event Management Service Interface
export interface EventManagementServiceInterface {
  subscribe(listener: (events: EnhancedEvent[], activeEvent: EnhancedEvent | null) => void): () => void;
  createEvent(event: Omit<EnhancedEvent, 'id' | 'created_at' | 'updated_at'>): EnhancedEvent;
  updateEvent(id: string | number, updates: Partial<EnhancedEvent>): EnhancedEvent | null;
  deleteEvent(id: string | number): boolean;
  activateEvent(id: string | number): boolean;
  deactivateAllEvents(): void;
  getAllEvents(): EnhancedEvent[];
  getActiveEvent(): EnhancedEvent | null;
  getEventsByType(type: EventType): EnhancedEvent[];
  getRibbonEvents(): EnhancedEvent[];
  getBannerEvents(): EnhancedEvent[];
  getCarouselEvents(): EnhancedEvent[];
  isEventActive(id: string | number): boolean;
  getCurrentRibbonText(): string | null;
  getCurrentAnnouncement(): string | null;
} 