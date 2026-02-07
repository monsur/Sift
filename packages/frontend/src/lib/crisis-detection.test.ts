import { describe, it, expect } from 'vitest';
import { detectCrisisLanguage } from './crisis-detection';

describe('detectCrisisLanguage', () => {
  it('returns false for normal text', () => {
    expect(detectCrisisLanguage('Today was a good day')).toBe(false);
    expect(detectCrisisLanguage('I feel happy and grateful')).toBe(false);
    expect(detectCrisisLanguage('')).toBe(false);
  });

  it('detects crisis keywords', () => {
    expect(detectCrisisLanguage('I want to kill myself')).toBe(true);
    expect(detectCrisisLanguage('I want to end my life')).toBe(true);
    expect(detectCrisisLanguage('having suicidal thoughts')).toBe(true);
    expect(detectCrisisLanguage('I want to hurt myself')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(detectCrisisLanguage('I WANT TO KILL MYSELF')).toBe(true);
    expect(detectCrisisLanguage('Suicide')).toBe(true);
  });

  it('detects keywords within longer text', () => {
    expect(
      detectCrisisLanguage(
        'Today was terrible and I feel like there is no reason to live anymore'
      )
    ).toBe(true);
  });
});
