/**
 * Password utilities for local authentication.
 * WARNING: Local auth is for development/demo only. Use Supabase in production.
 */

/**
 * Hash a password using SHA-256.
 * Note: This is NOT cryptographically secure for production.
 * Use bcrypt or argon2 via a server for real password hashing.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compare a plain password against a hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

/**
 * Generate a cryptographically secure session token.
 */
export function generateSessionToken(): string {
  return crypto.randomUUID();
}
