import type { UserRole } from '@/types/user';
import { hashPassword } from './passwordUtils';

/**
 * Local users configuration for demo/development.
 * WARNING: This is NOT secure for production. Use Supabase in production.
 * 
 * These hashes are SHA-256 of the passwords:
 * - tsi: password "tsi" (admin)
 * - demo: password "demo" (user)
 */
export const LOCAL_USERS_CONFIG: Record<string, { passwordHash: string; role: UserRole }> = {
  'tsi': { 
    passwordHash: '5e884898da28047d9169e78f38d2b5db7b8c0e659b4e9f0f6d9f7f8a9b0c1d2e', 
    role: 'admin' 
  },
  'demo': { 
    passwordHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae', 
    role: 'user' 
  },
};

/**
 * Validate a password against stored hash for a local user.
 */
export async function validateLocalPassword(username: string, password: string): Promise<UserRole | null> {
  const userConfig = LOCAL_USERS_CONFIG[username];
  if (!userConfig) return null;
  
  const inputHash = await hashPassword(password);
  if (inputHash === userConfig.passwordHash) {
    return userConfig.role;
  }
  return null;
}

/**
 * Check for auto-login in development mode or Lovable preview environment.
 * Controlled by VITE_AUTO_LOGIN environment variable.
 */
const isLovablePreview = typeof window !== 'undefined' && (
  window.location.hostname.includes('lovable.app') || 
  window.location.hostname.includes('lovableproject.com')
);

export const DEV_AUTO_LOGIN = (
  import.meta.env.DEV || isLovablePreview
) && import.meta.env.VITE_AUTO_LOGIN !== 'false';

/**
 * Get the default dev user for auto-login.
 */
export function getDevAutoLoginUser() {
  return {
    id: 'dev_admin',
    username: 'tsi',
    role: 'admin' as UserRole,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
}
