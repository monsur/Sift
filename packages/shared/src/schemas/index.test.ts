import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  scoreSchema,
  createEntrySchema,
  entryListParamsSchema,
} from './index.js';

describe('Auth Schemas', () => {
  describe('emailSchema', () => {
    it('accepts valid email', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
    });

    it('rejects invalid email', () => {
      expect(emailSchema.safeParse('not-an-email').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('accepts strong password', () => {
      expect(passwordSchema.safeParse('SecurePass123!').success).toBe(true);
    });

    it('rejects password too short', () => {
      const result = passwordSchema.safeParse('Short1!');
      expect(result.success).toBe(false);
    });

    it('rejects password without uppercase', () => {
      const result = passwordSchema.safeParse('securepass123!');
      expect(result.success).toBe(false);
    });

    it('rejects password without lowercase', () => {
      const result = passwordSchema.safeParse('SECUREPASS123!');
      expect(result.success).toBe(false);
    });

    it('rejects password without number', () => {
      const result = passwordSchema.safeParse('SecurePassword!');
      expect(result.success).toBe(false);
    });

    it('rejects password without special character', () => {
      const result = passwordSchema.safeParse('SecurePassword123');
      expect(result.success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('accepts valid signup data', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'SecurePass123!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = signupSchema.safeParse({
        email: 'invalid',
        password: 'SecurePass123!',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Verification & Password Reset Schemas', () => {
  describe('verifyEmailSchema', () => {
    it('accepts valid token', () => {
      expect(verifyEmailSchema.safeParse({ token: 'abc123' }).success).toBe(
        true
      );
    });

    it('rejects empty token', () => {
      expect(verifyEmailSchema.safeParse({ token: '' }).success).toBe(false);
    });
  });

  describe('resendVerificationSchema', () => {
    it('accepts valid email', () => {
      expect(
        resendVerificationSchema.safeParse({ email: 'test@example.com' })
          .success
      ).toBe(true);
    });

    it('rejects invalid email', () => {
      expect(
        resendVerificationSchema.safeParse({ email: 'not-email' }).success
      ).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('accepts valid email', () => {
      expect(
        forgotPasswordSchema.safeParse({ email: 'test@example.com' }).success
      ).toBe(true);
    });

    it('rejects invalid email', () => {
      expect(
        forgotPasswordSchema.safeParse({ email: '' }).success
      ).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('accepts valid token and strong password', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'reset-token-123',
        password: 'SecurePass123!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty token', () => {
      const result = resetPasswordSchema.safeParse({
        token: '',
        password: 'SecurePass123!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects weak password', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'reset-token-123',
        password: 'weak',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('accepts valid current and new password', () => {
      const result = changePasswordSchema.safeParse({
        current_password: 'oldPassword',
        new_password: 'NewSecure123!Pass',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty current password', () => {
      const result = changePasswordSchema.safeParse({
        current_password: '',
        new_password: 'NewSecure123!Pass',
      });
      expect(result.success).toBe(false);
    });

    it('rejects weak new password', () => {
      const result = changePasswordSchema.safeParse({
        current_password: 'oldPassword',
        new_password: 'weak',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('accepts valid settings', () => {
      const result = updateProfileSchema.safeParse({
        settings: { theme: 'dark', default_refine_enabled: true },
      });
      expect(result.success).toBe(true);
    });

    it('accepts partial settings', () => {
      const result = updateProfileSchema.safeParse({
        settings: { theme: 'light' },
      });
      expect(result.success).toBe(true);
    });

    it('accepts empty object', () => {
      const result = updateProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('rejects invalid theme', () => {
      const result = updateProfileSchema.safeParse({
        settings: { theme: 'rainbow' },
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Entry Schemas', () => {
  describe('scoreSchema', () => {
    it('accepts valid scores 1-10', () => {
      for (let i = 1; i <= 10; i++) {
        expect(scoreSchema.safeParse(i).success).toBe(true);
      }
    });

    it('rejects score below 1', () => {
      expect(scoreSchema.safeParse(0).success).toBe(false);
    });

    it('rejects score above 10', () => {
      expect(scoreSchema.safeParse(11).success).toBe(false);
    });

    it('rejects non-integer', () => {
      expect(scoreSchema.safeParse(5.5).success).toBe(false);
    });
  });

  describe('createEntrySchema', () => {
    it('accepts valid entry', () => {
      const result = createEntrySchema.safeParse({
        entry_date: '2024-01-15',
        raw_entry: 'Today was a good day.',
      });
      expect(result.success).toBe(true);
    });

    it('accepts entry with optional score', () => {
      const result = createEntrySchema.safeParse({
        entry_date: '2024-01-15',
        raw_entry: 'Today was a good day.',
        score: 8,
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid date format', () => {
      const result = createEntrySchema.safeParse({
        entry_date: '01-15-2024',
        raw_entry: 'Today was a good day.',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty entry', () => {
      const result = createEntrySchema.safeParse({
        entry_date: '2024-01-15',
        raw_entry: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('entryListParamsSchema', () => {
    it('applies defaults for empty object', () => {
      const result = entryListParamsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sort_by).toBe('entry_date');
        expect(result.data.sort_order).toBe('desc');
      }
    });

    it('coerces string numbers', () => {
      const result = entryListParamsSchema.safeParse({
        page: '3',
        limit: '10',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(10);
      }
    });

    it('rejects page less than 1', () => {
      const result = entryListParamsSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects limit greater than 100', () => {
      const result = entryListParamsSchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it('rejects invalid sort_by', () => {
      const result = entryListParamsSchema.safeParse({ sort_by: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('accepts valid sort options', () => {
      const result = entryListParamsSchema.safeParse({
        sort_by: 'score',
        sort_order: 'asc',
      });
      expect(result.success).toBe(true);
    });
  });
});
