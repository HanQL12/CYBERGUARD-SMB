// API Configuration
// In production, these should come from environment variables

const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://nguyennam0408.app.n8n.cloud/webhook',
  endpoints: {
    stats: '/phishing-stats',
    scanUrl: '/scan-url',
    getEmails: '/get-emails'
  },
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
};

// Helper function to make API calls with error handling
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const response = await fetch(url, {
      ...defaultOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    throw error;
  }
};

// Retry wrapper for API calls
export const apiCallWithRetry = async (endpoint, options = {}, retries = API_CONFIG.retryAttempts) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall(endpoint, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * (i + 1)));
    }
  }
};

export default API_CONFIG;

