import { describe, it, expect, beforeEach } from 'vitest';
import {
  SECURITY,
  hashPassword,
  hashUsername,
  getAttempts,
  getLockUntil,
  getLockCount,
  isLocked,
  recordFailedAttempt,
  resetSecurityOnSuccess,
} from '../lib/security';

// ─── SECURITY CONSTANTS ────────────────────────────────────────────────────────

describe('SECURITY constants', () => {
  it('MAX_ATTEMPTS is 5', () => {
    expect(SECURITY.MAX_ATTEMPTS).toBe(5);
  });

  it('SESSION_DURATION is 8 hours in ms', () => {
    expect(SECURITY.SESSION_DURATION_MS).toBe(8 * 60 * 60 * 1000);
  });

  it('LOCKOUT_BASE is 5 minutes in ms', () => {
    expect(SECURITY.LOCKOUT_BASE_MS).toBe(5 * 60 * 1000);
  });

  it('storage keys are defined and non-empty', () => {
    expect(SECURITY.KEYS.hash).toBeTruthy();
    expect(SECURITY.KEYS.session).toBeTruthy();
    expect(SECURITY.KEYS.attempts).toBeTruthy();
    expect(SECURITY.KEYS.lockUntil).toBeTruthy();
    expect(SECURITY.KEYS.lockCount).toBeTruthy();
  });
});

// ─── HASHING ───────────────────────────────────────────────────────────────────

describe('hashPassword', () => {
  it('returns a 64-character hex string', async () => {
    const hash = await hashPassword('testPassword');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('is deterministic — same input always produces same hash', async () => {
    const h1 = await hashPassword('mySecret');
    const h2 = await hashPassword('mySecret');
    expect(h1).toBe(h2);
  });

  it('different passwords produce different hashes', async () => {
    const h1 = await hashPassword('password1');
    const h2 = await hashPassword('password2');
    expect(h1).not.toBe(h2);
  });

  it('matches the stored default hash for the default password', async () => {
    const hash = await hashPassword('pil3t8r7x5');
    expect(hash).toBe(SECURITY.KEYS.defaultHash);
  });
});

describe('hashUsername', () => {
  it('returns a 64-character hex string', async () => {
    const hash = await hashUsername('admin');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('uses a different salt than hashPassword — same input produces different hash', async () => {
    const passwordHash = await hashPassword('sameInput');
    const usernameHash = await hashUsername('sameInput');
    expect(passwordHash).not.toBe(usernameHash);
  });

  it('is deterministic', async () => {
    const h1 = await hashUsername('Unkh4$m3lo');
    const h2 = await hashUsername('Unkh4$m3lo');
    expect(h1).toBe(h2);
  });
});

// ─── LOCKOUT LOGIC ─────────────────────────────────────────────────────────────

describe('getAttempts / getLockUntil / getLockCount', () => {
  beforeEach(() => {
    // Clean state before each test
    localStorage.clear();
  });

  it('getAttempts returns 0 when nothing is set', () => {
    expect(getAttempts()).toBe(0);
  });

  it('getLockUntil returns 0 when nothing is set', () => {
    expect(getLockUntil()).toBe(0);
  });

  it('getLockCount returns 0 when nothing is set', () => {
    expect(getLockCount()).toBe(0);
  });
});

describe('isLocked', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns false when no lock is set', () => {
    expect(isLocked()).toBe(false);
  });

  it('returns true when lockUntil is in the future', () => {
    localStorage.setItem(SECURITY.KEYS.lockUntil, String(Date.now() + 60_000));
    expect(isLocked()).toBe(true);
  });

  it('returns false and clears lock when lockUntil is in the past', () => {
    localStorage.setItem(SECURITY.KEYS.lockUntil, String(Date.now() - 1000));
    localStorage.setItem(SECURITY.KEYS.attempts, '3');
    expect(isLocked()).toBe(false);
    // Attempts should be reset
    expect(getAttempts()).toBe(0);
    // lockUntil should be removed
    expect(getLockUntil()).toBe(0);
  });
});

describe('recordFailedAttempt', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('increments attempts on each failure', () => {
    recordFailedAttempt();
    expect(getAttempts()).toBe(1);
    recordFailedAttempt();
    expect(getAttempts()).toBe(2);
  });

  it('returns correct remaining attempts', () => {
    const result = recordFailedAttempt();
    expect(result.locked).toBe(false);
    expect(result.remainingAttempts).toBe(SECURITY.MAX_ATTEMPTS - 1);
  });

  it('locks account after MAX_ATTEMPTS failures', () => {
    let result = { locked: false, remainingAttempts: 0 };
    for (let i = 0; i < SECURITY.MAX_ATTEMPTS; i++) {
      result = recordFailedAttempt();
    }
    expect(result.locked).toBe(true);
    expect(result.remainingAttempts).toBe(0);
    expect(isLocked()).toBe(true);
  });

  it('resets attempt counter to 0 when lockout is applied', () => {
    for (let i = 0; i < SECURITY.MAX_ATTEMPTS; i++) {
      recordFailedAttempt();
    }
    // After lockout, attempts should be reset to 0
    expect(getAttempts()).toBe(0);
    expect(getLockCount()).toBe(1);
  });

  it('uses exponential backoff for repeated lockouts', () => {
    // First lockout
    for (let i = 0; i < SECURITY.MAX_ATTEMPTS; i++) recordFailedAttempt();
    const firstLock = getLockUntil();
    const firstDuration = firstLock - Date.now();

    // Simulate lock expiry and second lockout
    localStorage.removeItem(SECURITY.KEYS.lockUntil);
    for (let i = 0; i < SECURITY.MAX_ATTEMPTS; i++) recordFailedAttempt();
    const secondLock = getLockUntil();
    const secondDuration = secondLock - Date.now();

    // Second lockout should be roughly twice as long
    expect(secondDuration).toBeGreaterThan(firstDuration * 1.5);
  });
});

describe('resetSecurityOnSuccess', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('clears all security state', () => {
    // Set up some state
    localStorage.setItem(SECURITY.KEYS.attempts, '3');
    localStorage.setItem(SECURITY.KEYS.lockUntil, String(Date.now() + 60_000));
    localStorage.setItem(SECURITY.KEYS.lockCount, '2');

    resetSecurityOnSuccess();

    expect(getAttempts()).toBe(0);
    expect(getLockUntil()).toBe(0);
    expect(getLockCount()).toBe(0);
  });
});
