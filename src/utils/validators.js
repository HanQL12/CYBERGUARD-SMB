// Input validation utilities

export const isValidUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateScanInput = (input) => {
  if (!input || !input.trim()) {
    return { valid: false, error: 'Please enter a URL or email address' };
  }

  const trimmed = input.trim();

  if (isValidUrl(trimmed)) {
    return { valid: true, type: 'url', value: trimmed };
  }

  if (isValidEmail(trimmed)) {
    return { valid: true, type: 'email', value: trimmed };
  }

  return { valid: false, error: 'Please enter a valid URL or email address' };
};

export const sanitizeInput = (input) => {
  // Remove potentially dangerous characters
  return input.trim().replace(/[<>]/g, '');
};

