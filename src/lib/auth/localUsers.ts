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
/**
 * Local users configuration for demo/development.
 * WARNING: This is NOT secure for production. Use Supabase in production.
 * 
 * Password hashes (SHA-256):
 * - admin: "admin" → 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
 * - tsi: "tsi" → 4dc7c9ec434ed06502767136789763ec11d2c4b7571a4528a27fd7c87e4a81c2
 * - demo: "demo" → 2a97516c354b68848cdbd8f54a226a0a55b21ed138e207ad6c5cbb9c00aa5aea
 */
export const LOCAL_USERS_CONFIG: Record<string, { passwordHash: string; role: UserRole }> = {
  'admin': { 
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 
    role: 'admin' 
  },
  'tsi': { 
    passwordHash: '4dc7c9ec434ed06502767136789763ec11d2c4b7571a4528a27fd7c87e4a81c2', 
    role: 'admin' 
  },
  'demo': { 
    passwordHash: '2a97516c354b68848cdbd8f54a226a0a55b21ed138e207ad6c5cbb9c00aa5aea', 
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
