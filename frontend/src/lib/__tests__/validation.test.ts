import {
  isValidEmail,
  sanitizeEmail,
  isValidPhone,
  sanitizePhone,
  formatPhone,
  validatePasswordStrength,
  createSafeStorageData,
  isRateLimited,
  resetRateLimit,
} from '@/lib/validation';

describe('Email Validation', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.co.uk')).toBe(true);
      expect(isValidEmail('a@b.c')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
    });

    it('should reject emails longer than 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe('sanitizeEmail', () => {
    it('should trim and lowercase email', () => {
      expect(sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
      expect(sanitizeEmail('User@Example.Com')).toBe('user@example.com');
    });

    it('should handle already clean emails', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
    });
  });
});

describe('Phone Number Validation', () => {
  describe('isValidPhone', () => {
    it('should validate nepal phone numbers', () => {
      expect(isValidPhone('9841234567')).toBe(true);
      expect(isValidPhone('+977 9841234567')).toBe(true);
      expect(isValidPhone('984-123-4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc1234567')).toBe(false);
    });

    it('should require at least 10 digits', () => {
      expect(isValidPhone('12345')).toBe(false);
      expect(isValidPhone('1234567890')).toBe(true);
    });
  });

  describe('sanitizePhone', () => {
    it('should remove non-digit characters except +', () => {
      expect(sanitizePhone('984-123-4567')).toBe('9841234567');
      expect(sanitizePhone('+977 984 1234567')).toBe('+9779841234567');
    });
  });

  describe('formatPhone', () => {
    it('should format 10-digit phone numbers', () => {
      expect(formatPhone('9841234567')).toBe('9841-234567');
    });

    it('should return original for non-standard lengths', () => {
      expect(formatPhone('+9779841234567')).toBe('+9779841234567');
    });
  });
});

describe('Password Validation', () => {
  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const result = validatePasswordStrength('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePasswordStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should require minimum 8 characters', () => {
      const result = validatePasswordStrength('Short1');
      expect(result.feedback).toContainEqual(expect.stringContaining('8 characters'));
    });

    it('should require uppercase letters', () => {
      const result = validatePasswordStrength('lowercase123');
      expect(result.feedback).toContainEqual(expect.stringContaining('uppercase'));
    });

    it('should require numbers', () => {
      const result = validatePasswordStrength('NoNumbers');
      expect(result.feedback).toContainEqual(expect.stringContaining('number'));
    });

    it('should provide feedback for missing requirements', () => {
      const result = validatePasswordStrength('Test');
      expect(result.feedback.length).toBeGreaterThan(0);
    });
  });
});

describe('Safe Storage Data', () => {
  describe('createSafeStorageData', () => {
    it('should remove sensitive fields', () => {
      const data = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePassword123',
        ssn: '123-45-6789',
      };

      const safeData = createSafeStorageData(data);

      expect(safeData.fullName).toBe('John Doe');
      expect(safeData.email).toBe('john@example.com');
      expect(safeData.password).toBeUndefined();
      expect(safeData.ssn).toBeUndefined();
    });

    it('should keep allowed fields', () => {
      const data = {
        fullName: 'John',
        email: 'john@test.com',
        phone: '9841234567',
        area: 'Kathmandu',
      };

      const safeData = createSafeStorageData(data);

      expect(safeData.fullName).toBe('John');
      expect(safeData.email).toBe('john@test.com');
      expect(safeData.phone).toBe('9841234567');
      expect(safeData.area).toBe('Kathmandu');
    });
  });
});

describe('Rate Limiting', () => {
  describe('isRateLimited', () => {
    it('should return false for first attempt', () => {
      localStorage.clear();
      expect(isRateLimited('test_key')).toBe(false);
    });

    it('should track attempts and limit after max within window', () => {
      localStorage.clear();
      resetRateLimit('test_key');

      const first = isRateLimited('test_key', 2, 1000);
      const second = isRateLimited('test_key', 2, 1000);
      const third = isRateLimited('test_key', 2, 1000);

      expect(first).toBe(false);
      expect(second).toBe(false);
      expect(third).toBe(true);
    });
  });
});
