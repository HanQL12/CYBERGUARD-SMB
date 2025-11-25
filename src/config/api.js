// API Configuration
// In production, these should come from environment variables

const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  endpoints: {
    dashboardData: '/dashboard-data', // Unified API - trả về cả stats và emails
    scanUrl: '/scan-url',
    reportsData: '/reports-data', // Reports data với daily trends và threat types
    health: '/health'
  },
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
};

// Request cache to prevent duplicate requests
const requestCache = new Map();
const CACHE_DURATION = 5000; // 5 seconds

// Helper function to make API calls with error handling and caching
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  
  // Create cache key (only cache GET requests)
  const isGetRequest = (options.method || 'GET').toUpperCase() === 'GET';
  const cacheKey = isGetRequest ? `${options.method || 'GET'}:${url}` : null;
  
  // Check cache for GET requests
  if (cacheKey && requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    requestCache.delete(cacheKey);
  }
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  // Handle body for POST/PUT requests
  if (defaultOptions.body && typeof defaultOptions.body === 'object') {
    defaultOptions.body = JSON.stringify(defaultOptions.body);
  }

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
    const result = { success: true, data };
    
    // Cache GET requests
    if (cacheKey) {
      requestCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }
    
    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    throw error;
  }
};

// Retry wrapper for API calls with exponential backoff
export const apiCallWithRetry = async (endpoint, options = {}, retries = API_CONFIG.retryAttempts) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall(endpoint, options);
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.message.includes('4') && !error.message.includes('429')) {
        throw error;
      }
      
      if (i < retries - 1) {
        // Exponential backoff: 1s, 2s, 4s...
        const delay = API_CONFIG.retryDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

export default API_CONFIG;

