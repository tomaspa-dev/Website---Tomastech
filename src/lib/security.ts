export const SECURITY = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_BASE_MS: 5 * 60 * 1000, // 5 minutos base
  SESSION_DURATION_MS: 8 * 60 * 60 * 1000, // 8 horas
  KEYS: {
    hash: 'tt_admin_hash_v2',
    usernameHash: 'tt_admin_user_v2',
    session: 'tt_admin_session',
    attempts: 'tt_admin_attempts',
    lockUntil: 'tt_admin_lock_until',
    lockCount: 'tt_admin_lock_count',
    defaultHash: '1ff0809952e44b9a210e7466c82afd743e162153631de4337c83cc2793dc11f0', // hash of 'pil3t8r7x5'
    defaultUserHash: '', // Will be computed at runtime
  },
};

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = 'tt_billing_2026_salt_';
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Hash username with different salt to prevent rainbow table attacks */
export async function hashUsername(username: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = 'tt_user_2026_salt_';
  const data = encoder.encode(salt + username);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Default username: Unkh4$m3lo */
let _defaultUserHashCache: string | null = null;
export async function getDefaultUserHash(): Promise<string> {
  if (_defaultUserHashCache) return _defaultUserHashCache;
  _defaultUserHashCache = await hashUsername('Unkh4$m3lo');
  return _defaultUserHashCache;
}

export function getAttempts(): number {
  return parseInt(localStorage.getItem(SECURITY.KEYS.attempts) || '0');
}

export function getLockUntil(): number {
  return parseInt(localStorage.getItem(SECURITY.KEYS.lockUntil) || '0');
}

export function getLockCount(): number {
  return parseInt(localStorage.getItem(SECURITY.KEYS.lockCount) || '0');
}

export function isLocked(): boolean {
  const lockUntil = getLockUntil();
  if (lockUntil && Date.now() < lockUntil) return true;
  if (lockUntil && Date.now() >= lockUntil) {
    localStorage.setItem(SECURITY.KEYS.attempts, '0');
    localStorage.removeItem(SECURITY.KEYS.lockUntil);
  }
  return false;
}

export function recordFailedAttempt(): { locked: boolean; remainingAttempts: number } {
  const attempts = getAttempts() + 1;
  localStorage.setItem(SECURITY.KEYS.attempts, attempts.toString());

  if (attempts >= SECURITY.MAX_ATTEMPTS) {
    const lockCount = getLockCount() + 1;
    const lockDuration = SECURITY.LOCKOUT_BASE_MS * Math.pow(2, lockCount - 1);
    localStorage.setItem(SECURITY.KEYS.lockUntil, (Date.now() + lockDuration).toString());
    localStorage.setItem(SECURITY.KEYS.lockCount, lockCount.toString());
    localStorage.setItem(SECURITY.KEYS.attempts, '0');
    return { locked: true, remainingAttempts: 0 };
  }

  return { locked: false, remainingAttempts: SECURITY.MAX_ATTEMPTS - attempts };
}

export function resetSecurityOnSuccess(): void {
  localStorage.setItem(SECURITY.KEYS.attempts, '0');
  localStorage.removeItem(SECURITY.KEYS.lockUntil);
  localStorage.setItem(SECURITY.KEYS.lockCount, '0');
}
