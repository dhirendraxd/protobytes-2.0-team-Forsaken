import { renderHook, act } from '@testing-library/react';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';

describe('useFormValidation Hook', () => {
  describe('Basic Validation', () => {
    it('should initialize with no errors', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          email: [validationRules.required()],
        })
      );

      expect(result.current.errors).toEqual({});
      expect(result.current.hasErrors).toBe(false);
    });

    it('should validate required field', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          email: [validationRules.required('Email is required')],
        })
      );

      act(() => {
        result.current.validateField('email', '');
      });

      expect(result.current.errors.email).toBe('Email is required');
      expect(result.current.hasErrors).toBe(true);
    });

    it('should validate email format', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          email: [validationRules.email()],
        })
      );

      act(() => {
        result.current.validateField('email', 'invalid-email');
      });

      expect(result.current.errors.email).toBeDefined();
      expect(result.current.hasErrors).toBe(true);
    });
  });

  describe('Password Validation', () => {
    it('should validate password strength', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          password: [validationRules.password()],
        })
      );

      // Test weak password
      act(() => {
        result.current.validateField('password', 'weak');
      });

      expect(result.current.errors.password).toBeDefined();

      // Test strong password
      act(() => {
        result.current.validateField('password', 'StrongPass123');
      });

      expect(result.current.errors.password).toBeUndefined();
    });

    it('should validate minimum length', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          password: [validationRules.minLength(8)],
        })
      );

      act(() => {
        result.current.validateField('password', 'short');
      });

      expect(result.current.errors.password).toBeDefined();
    });
  });

  describe('Phone Number Validation', () => {
    it('should validate phone number format', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          phone: [validationRules.phoneNumber()],
        })
      );

      act(() => {
        result.current.validateField('phone', '1234567');
      });

      expect(result.current.errors.phone).toBeUndefined();

      act(() => {
        result.current.validateField('phone', 'abc');
      });

      expect(result.current.errors.phone).toBeDefined();
    });
  });

  describe('Multiple Field Validation', () => {
    it('should validate all fields', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          email: [validationRules.required(), validationRules.email()],
          password: [validationRules.required(), validationRules.minLength(6)],
        })
      );

      let isValid: boolean = false;
      act(() => {
        isValid = result.current.validateAll({
          email: 'test@example.com',
          password: 'password123',
        }) as boolean;
      });

      expect(isValid).toBe(true);
      expect(result.current.hasErrors).toBe(false);
    });

    it('should collect multiple field errors', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          email: [validationRules.required(), validationRules.email()],
          password: [validationRules.required()],
        })
      );

      act(() => {
        result.current.validateAll({
          email: 'invalid',
          password: '',
        });
      });

      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
      expect(result.current.hasErrors).toBe(true);
    });
  });

  describe('Error Management', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          email: [validationRules.required()],
        })
      );

      act(() => {
        result.current.validateField('email', '');
      });

      expect(result.current.hasErrors).toBe(true);

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors).toEqual({});
      expect(result.current.hasErrors).toBe(false);
    });

    it('should clear specific field error', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          email: [validationRules.required()],
          password: [validationRules.required()],
        })
      );

      act(() => {
        result.current.validateField('email', '');
        result.current.validateField('password', '');
      });

      expect(Object.keys(result.current.errors).length).toBe(2);

      act(() => {
        result.current.clearFieldError('email');
      });

      expect(result.current.errors.email).toBeUndefined();
      expect(result.current.errors.password).toBeDefined();
    });
  });

  describe('Custom Validation Rules', () => {
    it('should support custom validators', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          username: [
            validationRules.custom(
              (value) => value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value),
              'Username must be 3+ characters and contain only letters, numbers, and underscores'
            ),
          ],
        })
      );

      act(() => {
        result.current.validateField('username', 'ab');
      });

      expect(result.current.errors.username).toBeDefined();

      act(() => {
        result.current.validateField('username', 'valid_user123');
      });

      expect(result.current.errors.username).toBeUndefined();
    });

    it('should support match validation', () => {
      const password = 'Password123';
      const { result } = renderHook(() =>
        useFormValidation({
          confirmPassword: [
            validationRules.match(password, 'Passwords do not match'),
          ],
        })
      );

      act(() => {
        result.current.validateField('confirmPassword', 'WrongPassword');
      });

      expect(result.current.errors.confirmPassword).toBeDefined();

      act(() => {
        result.current.validateField('confirmPassword', password);
      });

      expect(result.current.errors.confirmPassword).toBeUndefined();
    });
  });
});
