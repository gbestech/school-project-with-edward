const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Token found and included in request');
  } else {
    console.warn('⚠️ No auth token found in localStorage');
  }
  
  return headers;
};

const api = {
  async get(endpoint: string) {
    console.log(`🌐 GET request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      console.error(`❌ GET request failed: ${response.status} - ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  async post(endpoint: string, data: any) {
    console.log(`🌐 POST request to: ${API_BASE_URL}${endpoint}`, data);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ POST request failed: ${response.status} - ${response.statusText}`, errorData);
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    console.log(`✅ POST request successful: ${response.status}`);
    return response.json();
  },

  async put(endpoint: string, data: any) {
    console.log(`🌐 PUT request to: ${API_BASE_URL}${endpoint}`, data);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error(`❌ PUT request failed: ${response.status} - ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  async delete(endpoint: string) {
    console.log(`🌐 DELETE request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      console.error(`❌ DELETE request failed: ${response.status} - ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};

export default api; 