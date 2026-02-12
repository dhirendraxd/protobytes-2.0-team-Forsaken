/**
 * Input Validation Utilities
 * Provides comprehensive validation functions for form inputs across the application
 * All validations are client-side and should be complemented by server-side validation
 */

// ============================================
// EMAIL VALIDATION
// ============================================

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Sanitize email input
 * @param email - Email to sanitize
 * @returns trimmed and lowercased email
 */
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

// ============================================
// PHONE NUMBER VALIDATION
// ============================================

/**
 * Validate phone number (supports various formats)
 * @param phone - Phone number to validate
 * @returns true if valid phone format
 */
export const isValidPhone = (phone: string): boolean => {
  // Supports: 1660XXXXXXX, 1670XXXXXXX, +977..., (XXX) XXX-XXXX, etc.
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, '')) && phone.length >= 10;
};

/**
 * Sanitize phone number (remove non-digit characters except +)
 * @param phone - Phone number to sanitize
 * @returns sanitized phone number
 */
export const sanitizePhone = (phone: string): string => {
  return phone.replace(/[^\d+]/g, '');
};

/**
 * Format phone number for display
 * @param phone - Phone number to format
 * @returns formatted phone number
 */
export const formatPhone = (phone: string): string => {
  const cleaned = sanitizePhone(phone);
  // Format for Nepal: 1660-1234567
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  return cleaned;
};

// ============================================
// PASSWORD VALIDATION
// ============================================

/**
 * Validate password strength
 * Requirements: At least 8 characters, 1 uppercase, 1 number, 1 special char
 * @param password - Password to validate
 * @returns object with validation result and reasons
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { isValid: false, score: 0, feedback: ['Password is required'] };
  }

  if (password.length < 8) {
    feedback.push('At least 8 characters required');
  } else {
    score += 25;
  }

  if (/[A-Z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('At least one uppercase letter required');
  }

  if (/[0-9]/.test(password)) {
    score += 25;
  } else {
    feedback.push('At least one number required');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(password)) {
    score += 25;
  } else {
    feedback.push('At least one special character required');
  }

  return {
    isValid: score === 100,
    score,
    feedback: feedback.length === 0 ? ['Strong password'] : feedback,
  };
};

// ============================================
// TEXT FIELD VALIDATION
// ============================================

/**
 * Validate required field (not empty)
 * @param value - Value to validate
 * @returns true if not empty
 */
export const isRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validate text length
 * @param value - Value to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @returns true if within bounds
 */
export const isValidLength = (
  value: string,
  minLength: number = 1,
  maxLength: number = 255
): boolean => {
  const length = value.trim().length;
  return length >= minLength && length <= maxLength;
};

/**
 * Validate text contains only alphanumeric and spaces
 * @param value - Value to validate
 * @returns true if valid
 */
export const isAlphanumeric = (value: string): boolean => {
  return /^[a-zA-Z0-9\s'-]+$/.test(value);
};

/**
 * Validate name field (alphanumeric + spaces and common name characters)
 * @param name - Name to validate
 * @returns true if valid
 */
export const isValidName = (name: string): boolean => {
  return isRequired(name) && isValidLength(name, 2, 100) && /^[a-zA-Z\s'-]+$/.test(name);
};

/**
 * Sanitize text input (trim and remove leading/trailing spaces)
 * @param text - Text to sanitize
 * @returns sanitized text
 */
export const sanitizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

// ============================================
// URL VALIDATION
// ============================================

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns true if valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ============================================
// LOCATION VALIDATION
// ============================================

/**
 * Validate that province and village are selected
 * @param province - Province value
 * @param village - Village value
 * @returns true if both are selected
 */
export const isValidLocation = (province: string, village: string): boolean => {
  return isRequired(province) && isRequired(village);
};

// ============================================
// FORM DATA SANITIZATION
// ============================================

/**
 * Remove sensitive fields from object before storing
 * @param data - Object to sanitize
 * @param fieldsToRemove - Array of field names to remove
 * @returns new object without sensitive fields
 */
export const removeSensitiveFields = <T extends Record<string, any>>(
  data: T,
  fieldsToRemove: string[] = ['password', 'confirmPassword', 'otp']
): Partial<T> => {
  const sanitized = { ...data };
  fieldsToRemove.forEach(field => {
    delete sanitized[field];
  });
  return sanitized;
};

/**
 * Create a safe copy of form data for local storage (excludes sensitive info)
 * @param data - Form data to store
 * @returns safe object suitable for localStorage
 */
export const createSafeStorageData = <T extends Record<string, any>>(data: T): Partial<T> => {
  return removeSensitiveFields(data, [
    'password',
    'confirmPassword',
    'otp',
    'pin',
    'securityAnswer',
    'creditCard',
    'bankAccount',
    'ssn',
  ]);
};

// ============================================
// VALIDATION SCHEMAS (Objects with multiple fields)
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate moderator application form data
 * @param data - Form data to validate
 * @returns validation result with any errors
 */
export const validateModeratorApplication = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  // Personal Info
  if (!isValidName(data.fullName)) {
    errors.fullName = 'Full name is required (2-100 characters)';
  }

  if (!isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  if (!isValidPhone(data.phone)) {
    errors.phone = 'Valid phone number is required';
  }

  // Location Info
  if (!isValidLocation(data.province, data.village)) {
    errors.location = 'Province and village selection required';
  }

  // Password validation (check strength, not in form data)
  if (data.password) {
    const passwordCheck = validatePasswordStrength(data.password);
    if (!passwordCheck.isValid) {
      errors.password = passwordCheck.feedback.join('; ');
    }
  }

  // Required text fields
  if (!isRequired(data.reasonForApplying)) {
    errors.reasonForApplying = 'Please explain your motivation';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate contributor application form data
 * @param data - Form data to validate
 * @returns validation result with any errors
 */
export const validateContributorApplication = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!isValidName(data.name)) {
    errors.name = 'Name is required (2-100 characters)';
  }

  if (!isValidEmail(data.email) && data.email) {
    errors.email = 'Invalid email format';
  }

  if (!isValidPhone(data.phone)) {
    errors.phone = 'Valid phone number is required';
  }

  if (!isValidLocation(data.province, data.village)) {
    errors.location = 'Province and village selection required';
  }

  if (!isRequired(data.reason)) {
    errors.reason = 'Please provide your reason for applying';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate alert submission data
 * @param data - Alert data to validate
 * @returns validation result with any errors
 */
export const validateAlert = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!isValidLength(data.title, 5, 200)) {
    errors.title = 'Title must be 5-200 characters';
  }

  if (!isValidLength(data.description, 10, 2000)) {
    errors.description = 'Description must be 10-2000 characters';
  }

  if (data.contactInfo && !isValidPhone(data.contactInfo)) {
    errors.contactInfo = 'Invalid phone number';
  }

  if (!isValidLocation(data.province, data.village)) {
    errors.location = 'Province and village selection required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================
// RATE LIMITING (Client-side)
// ============================================

interface RateLimitStore {
  [key: string]: number[];
}

const rateLimitStore: RateLimitStore = {};

/**
 * Check if action is rate limited
 * @param key - Unique identifier for the action (e.g., 'alert_submit', 'app_submit')
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limited, false if allowed
 */
export const isRateLimited = (
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000 // 1 minute
): boolean => {
  const now = Date.now();
  
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = [];
  }

  // Remove old entries outside the time window
  rateLimitStore[key] = rateLimitStore[key].filter(time => now - time < windowMs);

  // Check if limit exceeded
  if (rateLimitStore[key].length >= maxAttempts) {
    return true;
  }

  // Record this attempt
  rateLimitStore[key].push(now);
  return false;
};

/**
 * Get remaining attempts
 * @param key - Unique identifier for the action
 * @param maxAttempts - Maximum attempts allowed
 * @returns number of remaining attempts
 */
export const getRemainingAttempts = (key: string, maxAttempts: number = 5): number => {
  return Math.max(0, maxAttempts - (rateLimitStore[key]?.length || 0));
};

/**
 * Reset rate limit for a key
 * @param key - Unique identifier to reset
 */
export const resetRateLimit = (key: string): void => {
  delete rateLimitStore[key];
};
