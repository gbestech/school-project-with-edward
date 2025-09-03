// Academic Calendar Service for accessing session and term data throughout the app

export interface AcademicSession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Term {
  id: string;
  name: string;
  academic_session: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_active: boolean;
  next_term_begins?: string;
  holidays_start?: string;
  holidays_end?: string;
  created_at: string;
}

class AcademicCalendarService {
  private baseUrl = '/api/fee';

  // Get all academic sessions
  async getAcademicSessions(): Promise<AcademicSession[]> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseUrl}/academic-sessions/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch academic sessions');
      }
    } catch (error) {
      console.error('Error fetching academic sessions:', error);
      return [];
    }
  }

  // Get current active academic session
  async getCurrentSession(): Promise<AcademicSession | null> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseUrl}/academic-sessions/active/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching current session:', error);
      return null;
    }
  }

  // Get all terms
  async getTerms(): Promise<Term[]> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseUrl}/terms/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch terms');
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
      return [];
    }
  }

  // Get current active term
  async getCurrentTerm(): Promise<Term | null> {
    try {
      const terms = await this.getTerms();
      return terms.find(term => term.is_current) || null;
    } catch (error) {
      console.error('Error fetching current term:', error);
      return null;
    }
  }

  // Get terms for a specific academic session
  async getTermsBySession(sessionId: string): Promise<Term[]> {
    try {
      const terms = await this.getTerms();
      return terms.filter(term => term.academic_session === sessionId);
    } catch (error) {
      console.error('Error fetching terms by session:', error);
      return [];
    }
  }

  // Check if a date falls within current term
  async isDateInCurrentTerm(date: Date): Promise<boolean> {
    try {
      const currentTerm = await this.getCurrentTerm();
      if (!currentTerm) return false;

      const termStart = new Date(currentTerm.start_date);
      const termEnd = new Date(currentTerm.end_date);

      return date >= termStart && date <= termEnd;
    } catch (error) {
      console.error('Error checking date in current term:', error);
      return false;
    }
  }

  // Get academic calendar summary
  async getCalendarSummary() {
    try {
      const [currentSession, currentTerm, allSessions, allTerms] = await Promise.all([
        this.getCurrentSession(),
        this.getCurrentTerm(),
        this.getAcademicSessions(),
        this.getTerms()
      ]);

      return {
        currentSession,
        currentTerm,
        totalSessions: allSessions.length,
        totalTerms: allTerms.length,
        activeSessions: allSessions.filter(s => s.is_active).length,
        activeTerms: allTerms.filter(t => t.is_active).length
      };
    } catch (error) {
      console.error('Error fetching calendar summary:', error);
      return null;
    }
  }

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get term display name
  getTermDisplayName(termName: string): string {
    const termMap: { [key: string]: string } = {
      'FIRST': 'First Term',
      'SECOND': 'Second Term',
      'THIRD': 'Third Term'
    };
    return termMap[termName] || termName;
  }
}

export default new AcademicCalendarService();




