import api from './api';
import AnnouncementService from './AnnouncementService';

export interface TeacherNotification {
  id: number;
  type: 'announcement' | 'event' | 'academic' | 'attendance' | 'exam' | 'message';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  updated_at: string;
  related_url?: string;
  sender?: {
    id: number;
    name: string;
    role: string;
  };
}

export interface TeacherAnnouncement {
  id: number;
  title: string;
  content: string;
  announcement_type: 'general' | 'academic' | 'event' | 'emergency';
  is_active: boolean;
  is_pinned: boolean;
  target_audience: string[];
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  created_by_name: string;
}

export interface TeacherEvent {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location?: string;
  is_active: boolean;
  days_until?: number;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  announcements: number;
  events: number;
  academic: number;
  urgent: number;
}

class TeacherNotificationService {
  // Get combined notifications (announcements + events + system notifications)
  async getCombinedNotifications() {
    try {
      // Use existing APIs instead of non-existent teacher-specific endpoints
      const [announcementsResponse, eventsResponse] = await Promise.all([
        AnnouncementService.getAllAnnouncements(),
        this.getEvents()
      ]);

      const announcements = (announcementsResponse || []).map((announcement: any) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        announcement_type: announcement.announcement_type,
        is_active: announcement.is_active,
        is_pinned: announcement.is_pinned,
        target_audience: announcement.target_audience,
        start_date: announcement.start_date,
        end_date: announcement.end_date || '',
        created_at: announcement.created_at,
        updated_at: announcement.updated_at,
        created_by_name: announcement.created_by_name
      }));
      const events = eventsResponse || [];
      
      // Create mock notifications for development
      const notifications: TeacherNotification[] = this.getMockNotifications();
      
      const counts: NotificationCounts = {
        total: notifications.length + announcements.length + events.length,
        unread: notifications.filter(n => !n.is_read).length,
        announcements: announcements.length,
        events: events.length,
        academic: notifications.filter(n => n.type === 'academic').length,
        urgent: notifications.filter(n => n.priority === 'urgent').length
      };

      return {
        notifications,
        announcements,
        events,
        counts
      };
    } catch (error) {
      console.error('Error fetching combined notifications:', error);
      // Return fallback data
      return {
        notifications: this.getMockNotifications(),
        announcements: [],
        events: [],
        counts: {
          total: 0,
          unread: 0,
          announcements: 0,
          events: 0,
          academic: 0,
          urgent: 0
        }
      };
    }
  }

  // Get events (using existing event API if available)
  async getEvents(): Promise<TeacherEvent[]> {
    try {
      // Try to use existing event API
      const response = await api.get('/api/events/');
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          subtitle: event.subtitle,
          description: event.description,
          event_type: event.event_type,
          start_date: event.start_date,
          end_date: event.end_date,
          location: event.location,
          is_active: event.is_active,
          days_until: this.calculateDaysUntil(event.start_date)
        }));
      }
    } catch (error) {
      console.log('Events API not available, using mock data');
    }
    
    // Return mock events for development
    return this.getMockEvents();
  }

  // Get notification counts (mock for now)
  async getNotificationCounts(): Promise<NotificationCounts> {
    try {
      // For now, return mock counts since the teacher notification API doesn't exist
      return {
        total: 5,
        unread: 2,
        announcements: 3,
        events: 2,
        academic: 1,
        urgent: 1
      };
    } catch (error) {
      console.error('Error fetching notification counts:', error);
      return {
        total: 0,
        unread: 0,
        announcements: 0,
        events: 0,
        academic: 0,
        urgent: 0
      };
    }
  }

  // Mark notification as read (mock for now)
  async markAsRead(notificationId: number): Promise<void> {
    try {
      // Mock implementation - in real app, this would call the backend
      console.log(`Marking notification ${notificationId} as read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read (mock for now)
  async markAllAsRead(): Promise<void> {
    try {
      // Mock implementation - in real app, this would call the backend
      console.log('Marking all notifications as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Delete notification (mock for now)
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      // Mock implementation - in real app, this would call the backend
      console.log(`Deleting notification ${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  // Helper method to calculate days until event
  private calculateDaysUntil(dateString: string): number {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Mock notifications for development
  private getMockNotifications(): TeacherNotification[] {
    return [
      {
        id: 1,
        type: 'academic',
        title: 'Exam Schedule Updated',
        content: 'The Mathematics exam has been rescheduled to next Friday.',
        priority: 'high',
        is_read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sender: {
          id: 1,
          name: 'Admin',
          role: 'admin'
        }
      },
      {
        id: 2,
        type: 'attendance',
        title: 'Attendance Reminder',
        content: 'Please mark attendance for Class 10A by 9:00 AM.',
        priority: 'medium',
        is_read: false,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        sender: {
          id: 1,
          name: 'System',
          role: 'system'
        }
      },
      {
        id: 3,
        type: 'message',
        title: 'New Message from Parent',
        content: 'You have received a message from John Doe\'s parent.',
        priority: 'low',
        is_read: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        sender: {
          id: 2,
          name: 'Parent',
          role: 'parent'
        }
      }
    ];
  }

  // Mock events for development
  private getMockEvents(): TeacherEvent[] {
    return [
      {
        id: 1,
        title: 'Parent-Teacher Meeting',
        subtitle: 'Term 1 Review',
        description: 'Annual parent-teacher meeting to discuss student progress.',
        event_type: 'meeting',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        location: 'School Auditorium',
        is_active: true,
        days_until: 7
      },
      {
        id: 2,
        title: 'Staff Training',
        subtitle: 'New Curriculum Implementation',
        description: 'Training session on the new curriculum changes.',
        event_type: 'training',
        start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        location: 'Conference Room',
        is_active: true,
        days_until: 3
      }
    ];
  }
}

export default new TeacherNotificationService();
