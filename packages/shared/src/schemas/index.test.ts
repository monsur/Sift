import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  signupSchema,
  loginSchema,
  scoreSchema,
  createEntrySchema,
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
});
