// Application Constants
export const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  STATS: 30000, // 30 seconds
};

export const TIMEOUTS = {
  API: 30000, // 30 seconds
  SCAN: 60000, // 60 seconds
  DASHBOARD: 30000, // 30 seconds
};

export const CACHE_DURATION = {
  REQUEST: 5000, // 5 seconds
  EMAIL_DETAILS: 300000, // 5 minutes
};

export const EMAIL_FILTERS = {
  ALL: 'all',
  SAFE: 'safe',
  PHISHING: 'phishing',
};

export const RISK_LEVELS = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  UNKNOWN: 'UNKNOWN',
};

export const THREAT_TYPES = {
  PHISHING: 'Phishing',
  MALWARE: 'Malware',
  SPAM: 'Spam',
  SAFE: 'Safe',
  CEO_FRAUD: 'CEO Fraud',
};

export const WORKFLOW_STATUS = {
  LOADING: 'loading',
  ACTIVE: 'active',
  ERROR: 'error',
};

