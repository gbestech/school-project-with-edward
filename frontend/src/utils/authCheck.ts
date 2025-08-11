// Utility to check authentication status and debug classroom form issues
export const checkAuthStatus = () => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  console.log('=== Authentication Status Check ===');
  console.log('Token exists:', !!token);
  console.log('Token length:', token?.length || 0);
  console.log('User data exists:', !!userData);
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('User role:', user.role);
      console.log('User email:', user.email);
    } catch (e) {
      console.log('Error parsing user data:', e);
    }
  }
  
  return {
    isAuthenticated: !!token,
    token: token,
    userData: userData
  };
};

export const testClassroomAPI = async () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.error('No authentication token found. Please log in first.');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:8000/api/classrooms/sections/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sections API working:', data);
    } else {
      console.error('❌ Sections API failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Sections API error:', error);
  }
}; 