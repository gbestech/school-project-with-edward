const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Debug logging to see what the actual values are
console.log('🔧 API_BASE_URL:', API_BASE_URL);

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  const sessionToken = sessionStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
    
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Token found in localStorage and included in request');
  } else if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
    console.log('🔑 Token found in sessionStorage and included in request');
  } else {
    console.warn('⚠️ No auth token found in localStorage or sessionStorage');
  }
  
  return headers;
};

const api = {
  async get(endpoint: string, params?: Record<string, any>) {
    // If endpoint already starts with /api/, remove the /api prefix and use the base URL
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
    // Ensure cleanEndpoint starts with a slash
    const finalEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    let url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${finalEndpoint}`;
    
    // Add query parameters if provided
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      console.log(`📊 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.error(`❌ GET request failed: ${response.status} - ${response.statusText}`);
        const errorText = await response.text();
        console.error(`❌ Error response:`, errorText);
        
        // Create error object with response structure for better error handling
        const error = new Error(`HTTP error! status: ${response.status}`);
        (error as any).response = { 
          status: response.status, 
          statusText: response.statusText,
          data: errorText
        };
        throw error;
      }
      
      const data = await response.json();
      console.log(`✅ GET request successful for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`💥 Exception in GET request to ${endpoint}:`, error);
      throw error;
    }
  },

  

  async post(endpoint: string, data: any) {
    // If endpoint already starts with /api/, remove the /api prefix and use the base URL
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
    // Ensure cleanEndpoint starts with a slash
    const finalEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${finalEndpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ POST request failed: ${response.status} - ${response.statusText}`, errorData);
      
      // Create error object with response structure for better error handling
      const error = new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      (error as any).response = { 
        status: response.status, 
        statusText: response.statusText,
        data: errorData
      };
      throw error;
    }
    
    console.log(`✅ POST request successful: ${response.status}`);
    return response.json();
  },

  async put(endpoint: string, data: any) {
    // If endpoint already starts with /api/, remove the /api prefix and use the base URL
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
    // Ensure cleanEndpoint starts with a slash
    const finalEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${finalEndpoint}`;
    console.log(`🌐 PUT request to: ${url}`);
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error(`❌ PUT request failed: ${response.status} - ${response.statusText}`);
      
      // Create error object with response structure for better error handling
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).response = { 
        status: response.status, 
        statusText: response.statusText
      };
      throw error;
    }
    
    return response.json();
  },

  async patch(endpoint: string, data: any) {
    // If endpoint already starts with /api/, remove the /api prefix and use the base URL
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
    // Ensure cleanEndpoint starts with a slash
    const finalEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${finalEndpoint}`;
    console.log(`🌐 PATCH request to: ${url}`);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error(`❌ PATCH request failed: ${response.status} - ${response.statusText}`);
      
      // Create error object with response structure for better error handling
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).response = { 
        status: response.status, 
        statusText: response.statusText
      };
      throw error;
    }
    
    return response.json();
  },

  async delete(endpoint: string) {
    // If endpoint already starts with /api/, remove the /api prefix and use the base URL
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
    // Ensure cleanEndpoint starts with a slash
    const finalEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${finalEndpoint}`;
    console.log(`🌐 DELETE request to: ${url}`);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      console.error(`❌ DELETE request failed: ${response.status} - ${response.statusText}`);
      
      // Create error object with response structure for better error handling
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).response = { 
        status: response.status, 
        statusText: response.statusText
      };
      throw error;
    }
    
    return response.json();
  },
};

export default api;
export { api }; 