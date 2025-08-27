import api from './api';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  announcement_type: 'general' | 'academic' | 'event' | 'emergency';
  is_active: boolean;
  is_pinned: boolean;
  target_audience: string[];
  start_date: string;
  end_date?: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  announcement_type: 'general' | 'academic' | 'event' | 'emergency';
  target_audience: string[];
  start_date: string;
  end_date?: string;
  is_active?: boolean;
  is_pinned?: boolean;
}

export interface UpdateAnnouncementData extends Partial<CreateAnnouncementData> {
  id: number;
}

class AnnouncementService {
  private baseUrl = '/announcements/';

  async getAllAnnouncements(): Promise<Announcement[]> {
    try {
      const response = await api.get(this.baseUrl);
      return response;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  }

  async getAnnouncement(id: number): Promise<Announcement> {
    try {
      const response = await api.get(`${this.baseUrl}${id}/`);
      return response;
    } catch (error) {
      console.error('Error fetching announcement:', error);
      throw error;
    }
  }

  async createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  async updateAnnouncement(id: number, data: Partial<CreateAnnouncementData>): Promise<Announcement> {
    try {
      const response = await api.patch(`${this.baseUrl}${id}/`, data);
      return response;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  async deleteAnnouncement(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}${id}/`);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  async toggleActive(id: number): Promise<Announcement> {
    try {
      const response = await api.post(`${this.baseUrl}${id}/toggle_active/`);
      return response;
    } catch (error) {
      console.error('Error toggling announcement active status:', error);
      throw error;
    }
  }

  async togglePinned(id: number): Promise<Announcement> {
    try {
      const response = await api.post(`${this.baseUrl}${id}/toggle_pinned/`);
      return response;
    } catch (error) {
      console.error('Error toggling announcement pinned status:', error);
      throw error;
    }
  }
}

export default new AnnouncementService();
