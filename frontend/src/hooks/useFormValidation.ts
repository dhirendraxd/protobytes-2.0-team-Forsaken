import { useState, useCallback } from 'react';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationRules {
  [key: string]: ((value: string) => string | null)[];
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((fieldName: string, value: string) => {
    const fieldRules = rules[fieldName];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
        return error;
      }
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    return null;
  }, [rules]);

  const validateAll = useCallback((formData: Record<string, string>) => {
    const newErrors: Record<string, string> = {};

    Object.keys(rules).forEach(fieldName => {
      const fieldRules = rules[fieldName];
      const value = formData[fieldName] || '';

      for (const rule of fieldRules) {
        const error = rule(value);
        if (error) {
          newErrors[fieldName] = error;
          break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [rules]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validateField,
    validateAll,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0,
  };
};

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required') => (value: string) => {
    return value.trim() === '' ? message : null;
  },

  email: (message = 'Please enter a valid email address') => (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? message : null;
  },

  minLength: (minLength: number, message?: string) => (value: string) => {
    return value.length < minLength
      ? message || `Must be at least ${minLength} characters`
      : null;
  },

  maxLength: (maxLength: number, message?: string) => (value: string) => {
    return value.length > maxLength
      ? message || `Must not exceed ${maxLength} characters`
      : null;
  },

  password: (message = 'Password must contain at least 8 characters, including uppercase, lowercase, and a number') => (value: string) => {
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const isLengthValid = value.length >= 8;

    return !hasUpperCase || !hasLowerCase || !hasNumber || !isLengthValid ? message : null;
  },

  phoneNumber: (message = 'Please enter a valid phone number') => (value: string) => {
    const phoneRegex = /^[0-9+\s()\-]+$/;
    return !phoneRegex.test(value) || value.replace(/\D/g, '').length < 7
      ? message
      : null;
  },

  url: (message = 'Please enter a valid URL') => (value: string) => {
    try {
      new URL(value);
      return null;
    } catch {
      return message;
    }
  },

  match: (otherValue: string, message = 'Fields do not match') => (value: string) => {
    return value !== otherValue ? message : null;
  },

  custom: (validator: (value: string) => boolean, message: string) => (value: string) => {
    return !validator(value) ? message : null;
  },
};
