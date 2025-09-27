const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

// Helper function to handle response errors
const handleResponseError = async (response: Response, endpoint: string, method: string) => {
  console.error(`❌ ${method} request failed: ${response.status} - ${response.statusText}`);
  
  let errorData;
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      errorData = await response.json();
    } else {
      errorData = await response.text();
    }
  } catch {
    errorData = `HTTP error! status: ${response.status}`;
  }
  
  console.error(`❌ Error response for ${endpoint}:`, errorData);
  
  // Create error object with response structure for better error handling
  const error = new Error(
    typeof errorData === 'object' && errorData.detail 
      ? errorData.detail 
      : `HTTP error! status: ${response.status}`
  );
  (error as any).response = { 
    status: response.status, 
    statusText: response.statusText,
    data: errorData
  };
  throw error;
};

// Helper function to process endpoint
const processEndpoint = (endpoint: string): string => {
  // If endpoint already starts with /api/, remove the /api prefix
  const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
  // Ensure cleanEndpoint starts with a slash
  return cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
};

// Helper function to build URL with query parameters
const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  const finalEndpoint = processEndpoint(endpoint);
  let url = `${API_BASE_URL}${finalEndpoint}`;
  
  // Add query parameters if provided
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle array parameters (useful for filtering multiple values)
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return url;
};

const api = {
  async get(endpoint: string, params?: Record<string, any>) {
    const url = buildUrl(endpoint, params);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      console.log(`📊 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        await handleResponseError(response, endpoint, 'GET');
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
    const url = buildUrl(endpoint);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        await handleResponseError(response, endpoint, 'POST');
      }
      
      console.log(`✅ POST request successful: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error(`💥 Exception in POST request to ${endpoint}:`, error);
      throw error;
    }
  },

  async put(endpoint: string, data: any) {
    const url = buildUrl(endpoint);
    console.log(`🌐 PUT request to: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        await handleResponseError(response, endpoint, 'PUT');
      }
      
      console.log(`✅ PUT request successful: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error(`💥 Exception in PUT request to ${endpoint}:`, error);
      throw error;
    }
  },

  async patch(endpoint: string, data: any) {
    const url = buildUrl(endpoint);
    console.log(`🌐 PATCH request to: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        await handleResponseError(response, endpoint, 'PATCH');
      }
      
      console.log(`✅ PATCH request successful: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error(`💥 Exception in PATCH request to ${endpoint}:`, error);
      throw error;
    }
  },

  async delete(endpoint: string) {
    const url = buildUrl(endpoint);
    console.log(`🌐 DELETE request to: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        await handleResponseError(response, endpoint, 'DELETE');
      }
      
      console.log(`✅ DELETE request successful: ${response.status}`);
      if (response.status === 204) {
      return null; // Existing services likely expect null/undefined for successful deletes
    }

    try {
      const text = await response.text();
      if (!text.trim()) {
        return null; // Empty response body
      }
      return JSON.parse(text);
    } catch (jsonError) {
      if ((jsonError as Error).message.includes('Unexpected end of JSON input')) {
        console.log('🔄 Empty response body, treating as successful delete');
        return null;
      }
      throw jsonError;
    }
      // return response.json();
    } catch (error: any) {
      console.error(`💥 Exception in DELETE request to ${endpoint}:`, error);
      throw error;
    }
  },

  // Specialized methods for common patterns in your result system
  async getList(endpoint: string, filters?: Record<string, any>, pagination?: { page?: number; page_size?: number }) {
    const params = { ...filters, ...pagination };
    return this.get(endpoint, params);
  },

  async getById(endpoint: string, id: string | number, params?: Record<string, any>) {
    const finalEndpoint = endpoint.endsWith('/') ? `${endpoint}${id}/` : `${endpoint}/${id}/`;
    return this.get(finalEndpoint, params);
  },

  async create(endpoint: string, data: any) {
    return this.post(endpoint, data);
  },

  async update(endpoint: string, id: string | number, data: any, partial: boolean = false) {
    const finalEndpoint = endpoint.endsWith('/') ? `${endpoint}${id}/` : `${endpoint}/${id}/`;
    return partial ? this.patch(finalEndpoint, data) : this.put(finalEndpoint, data);
  },

  async remove(endpoint: string, id: string | number) {
    const finalEndpoint = endpoint.endsWith('/') ? `${endpoint}${id}/` : `${endpoint}/${id}/`;
    return this.delete(finalEndpoint);
  },

  // Bulk operations helper
  async bulkOperation(endpoint: string, operation: 'create' | 'update' | 'delete', data: any[]) {
    const bulkEndpoint = endpoint.endsWith('/') ? `${endpoint}bulk_${operation}/` : `${endpoint}/bulk_${operation}/`;
    return this.post(bulkEndpoint, { items: data });
  }
};

export default api;
export { api };