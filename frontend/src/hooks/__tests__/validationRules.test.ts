import { validationRules } from '@/hooks/useFormValidation';

describe('Validation Rules', () => {
  describe('required', () => {
    it('should reject empty strings', () => {
      const rule = validationRules.required('This field is required');
      expect(rule('')).toBe('This field is required');
      expect(rule('   ')).toBe('This field is required');
    });

    it('should accept non-empty strings', () => {
      const rule = validationRules.required();
      expect(rule('valid')).toBeNull();
    });

    it('should use default message when not provided', () => {
      const rule = validationRules.required();
      expect(rule('')).toBe('This field is required');
    });
  });

  describe('email', () => {
    it('should validate email format', () => {
      const rule = validationRules.email();

      // Valid emails
      expect(rule('test@example.com')).toBeNull();
      expect(rule('user.name@example.co.uk')).toBeNull();
      expect(rule('a@b.c')).toBeNull();

      // Invalid emails
      expect(rule('invalid')).not.toBeNull();
      expect(rule('invalid@')).not.toBeNull();
      expect(rule('@example.com')).not.toBeNull();
      expect(rule('test@.com')).not.toBeNull();
    });

    it('should use custom message when provided', () => {
      const rule = validationRules.email('Invalid email format');
      expect(rule('invalid')).toBe('Invalid email format');
    });
  });

  describe('minLength', () => {
    it('should validate minimum length', () => {
      const rule = validationRules.minLength(5);

      expect(rule('ab')).not.toBeNull();
      expect(rule('abcde')).toBeNull();
      expect(rule('abcdef')).toBeNull();
    });

    it('should use custom message when provided', () => {
      const customMsg = 'Must be longer';
      const rule = validationRules.minLength(5, customMsg);
      expect(rule('ab')).toBe(customMsg);
    });

    it('should use default message when not provided', () => {
      const rule = validationRules.minLength(5);
      expect(rule('ab')).toContain('5');
    });
  });

  describe('maxLength', () => {
    it('should validate maximum length', () => {
      const rule = validationRules.maxLength(5);

      expect(rule('abcdef')).not.toBeNull();
      expect(rule('abcde')).toBeNull();
      expect(rule('ab')).toBeNull();
    });

    it('should use custom message when provided', () => {
      const customMsg = 'Too long';
      const rule = validationRules.maxLength(5, customMsg);
      expect(rule('abcdef')).toBe(customMsg);
    });
  });

  describe('password', () => {
    it('should validate password strength', () => {
      const rule = validationRules.password();

      // Weak passwords
      expect(rule('weak')).not.toBeNull();
      expect(rule('12345678')).not.toBeNull();
      expect(rule('abcdefgh')).not.toBeNull();
      expect(rule('ABCDEFGH')).not.toBeNull();

      // Strong password
      expect(rule('StrongPass123')).toBeNull();
      expect(rule('MyP@ssw0rd')).toBeNull();
    });

    it('should require uppercase, lowercase, number, and min 8 chars', () => {
      const rule = validationRules.password();

      expect(rule('NoNumber')).not.toBeNull(); // Missing number
      expect(rule('nonumber123')).not.toBeNull(); // Missing uppercase
      expect(rule('NOLOWER123')).not.toBeNull(); // Missing lowercase
      expect(rule('Short12Ab')).toBeNull(); // All requirements met
    });
  });

  describe('phoneNumber', () => {
    it('should validate phone number format', () => {
      const rule = validationRules.phoneNumber();

      // Valid phone numbers
      expect(rule('9841234567')).toBeNull();
      expect(rule('984-123-4567')).toBeNull();
      expect(rule('+977 984 1234567')).toBeNull();

      // Invalid phone numbers
      expect(rule('abc')).not.toBeNull();
      expect(rule('12345')).not.toBeNull();
    });
  });

  describe('url', () => {
    it('should validate URL format', () => {
      const rule = validationRules.url();

      // Valid URLs
      expect(rule('https://example.com')).toBeNull();
      expect(rule('http://www.example.com')).toBeNull();
      expect(rule('ftp://files.example.com')).toBeNull();

      // Invalid URLs
      expect(rule('not-a-url')).not.toBeNull();
      expect(rule('example.com')).not.toBeNull();
    });
  });

  describe('match', () => {
    it('should validate field matching', () => {
      const rule = validationRules.match('password123');

      expect(rule('password123')).toBeNull();
      expect(rule('different')).not.toBeNull();
    });

    it('should use custom message when provided', () => {
      const rule = validationRules.match('test', 'Does not match');
      expect(rule('other')).toBe('Does not match');
    });
  });

  describe('custom', () => {
    it('should support custom validators', () => {
      const rule = validationRules.custom(
        (value) => value === 'valid',
        'Not valid'
      );

      expect(rule('valid')).toBeNull();
      expect(rule('invalid')).toBe('Not valid');
    });

    it('should work with complex validators', () => {
      const rule = validationRules.custom(
        (value) => {
          const hasSpecialChars = /[!@#$%^&*]/.test(value);
          const isLongEnough = value.length >= 10;
          return hasSpecialChars && isLongEnough;
        },
        'Must be 10+ chars with special characters'
      );

      expect(rule('short')).not.toBeNull();
      expect(rule('longpassword')).not.toBeNull();
      expect(rule('longenough!pass')).toBeNull();
    });
  });
});
