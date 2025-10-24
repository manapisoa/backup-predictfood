// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8120/api/v1',
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
  })
};

// Helper function for making API calls
export const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: API_CONFIG.getHeaders(),
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Redirect to login or handle unauthorized access
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      return null;
    }

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Something went wrong');
    }

    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
