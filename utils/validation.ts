import { AUTH_CONSTANTS } from '@/constants/auth';
import { ValidationRules } from '@/types/auth';

export const validationRules: ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: AUTH_CONSTANTS.VALIDATION.EMAIL_INVALID,
  },
  password: {
    required: true,
    minLength: AUTH_CONSTANTS.PASSWORD_MIN_LENGTH,
    maxLength: AUTH_CONSTANTS.PASSWORD_MAX_LENGTH,
    message: AUTH_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH,
  },
  name: {
    required: true,
    minLength: AUTH_CONSTANTS.NAME_MIN_LENGTH,
    maxLength: AUTH_CONSTANTS.NAME_MAX_LENGTH,
    message: AUTH_CONSTANTS.VALIDATION.NAME_MIN_LENGTH,
  },
  userName: {
    required: true,
    minLength: AUTH_CONSTANTS.USERNAME_MIN_LENGTH,
    maxLength: AUTH_CONSTANTS.USERNAME_MAX_LENGTH,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: AUTH_CONSTANTS.VALIDATION.USERNAME_PATTERN,
  },
  mobileNumber: {
    pattern: /^[0-9]{10,15}$/,
    message: AUTH_CONSTANTS.VALIDATION.MOBILE_INVALID,
  },
};

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export const validateField = (field: string, value: string): string => {
  const rules = validationRules[field];
  if (!rules) return '';

  // Check required field
  if (rules.required && (!value || value.trim() === '')) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
  }

  // Skip further validation if field is empty and not required
  if (!value || value.trim() === '') {
    return '';
  }

  // Check min length
  if (rules.minLength && value.length < rules.minLength) {
    return rules.message;
  }

  // Check max length
  if (rules.maxLength && value.length > rules.maxLength) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} must be less than ${rules.maxLength} characters`;
  }

  // Check pattern
  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.message;
  }

  return '';
};

export const validateForm = (fields: { [key: string]: string }): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  Object.keys(fields).forEach(field => {
    const error = validateField(field, fields[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Specific validation functions
export const validateEmail = (email: string): string => {
  return validateField('email', email);
};

export const validatePassword = (password: string): string => {
  return validateField('password', password);
};

export const validateName = (name: string): string => {
  return validateField('name', name);
};

export const validateUsername = (username: string): string => {
  return validateField('userName', username);
};