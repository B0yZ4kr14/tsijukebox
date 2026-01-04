// Auth templates - 3 arquivos de autenticação

const VERSION = '2.0.0';

export function generateAuthContent(path: string): string | null {
  const authMap: Record<string, () => string> = {
    'src/lib/auth/localUsers.ts': generateLocalUsers,
    'src/lib/auth/passwordUtils.ts': generatePasswordUtils,
    'src/lib/auth/index.ts': generateAuthIndex,
  };

  const generator = authMap[path];
  return generator ? generator() : null;
}

function generateLocalUsers(): string {
  return `// TSiJUKEBOX Local Users - v${VERSION}
// Local user authentication for development/demo

import { validateLocalPassword } from './passwordUtils';

export type UserRole = 'admin' | 'user' | 'newbie';

export interface LocalUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  displayName?: string;
}

// Local users configuration (development only)
// WARNING: Do not use in production - passwords should be hashed in a database
export const LOCAL_USERS_CONFIG: Record<string, { passwordHash: string; role: UserRole }> = {
  admin: {
    passwordHash: '$2a$10$ADMIN_HASH_PLACEHOLDER',
    role: 'admin',
  },
  demo: {
    passwordHash: '$2a$10$DEMO_HASH_PLACEHOLDER',
    role: 'user',
  },
  guest: {
    passwordHash: '$2a$10$GUEST_HASH_PLACEHOLDER',
    role: 'newbie',
  },
};

/**
 * Validate local user credentials
 */
export async function validateLocalUser(
  username: string,
  password: string
): Promise<LocalUser | null> {
  const userConfig = LOCAL_USERS_CONFIG[username.toLowerCase()];
  if (!userConfig) {
    return null;
  }

  const isValid = await validateLocalPassword(password, userConfig.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: \`local-\${username}\`,
    username: username.toLowerCase(),
    email: \`\${username}@local.tsijukebox\`,
    role: userConfig.role,
    displayName: username.charAt(0).toUpperCase() + username.slice(1),
  };
}

/**
 * Check if auto-login is enabled (development only)
 */
export const DEV_AUTO_LOGIN = 
  import.meta.env.DEV && 
  import.meta.env.VITE_AUTO_LOGIN === 'true';

/**
 * Get development auto-login user
 */
export function getDevAutoLoginUser(): LocalUser | null {
  if (!DEV_AUTO_LOGIN) return null;
  
  return {
    id: 'local-dev',
    username: 'dev',
    email: 'dev@local.tsijukebox',
    role: 'admin',
    displayName: 'Developer',
  };
}

/**
 * Get user by ID
 */
export function getLocalUserById(id: string): LocalUser | null {
  const username = id.replace('local-', '');
  const userConfig = LOCAL_USERS_CONFIG[username];
  
  if (!userConfig) return null;
  
  return {
    id,
    username,
    email: \`\${username}@local.tsijukebox\`,
    role: userConfig.role,
    displayName: username.charAt(0).toUpperCase() + username.slice(1),
  };
}

/**
 * Check if user has required role
 */
export function hasRole(user: LocalUser | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    user: 2,
    newbie: 1,
  };
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}
`;
}

function generatePasswordUtils(): string {
  return `// TSiJUKEBOX Password Utils - v${VERSION}
// Password hashing and validation utilities

/**
 * Hash password using Web Crypto API
 * Note: For production, use bcrypt or argon2 in backend
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Validate password against hash
 * Note: This is a simplified version for development
 * In production, use proper bcrypt/argon2 comparison
 */
export async function validateLocalPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  // For placeholder hashes, allow any password in dev
  if (storedHash.includes('PLACEHOLDER')) {
    console.warn('[PasswordUtils] Using placeholder hash - development only!');
    return password.length >= 4; // Minimum 4 chars for dev
  }
  
  const inputHash = await hashPassword(password);
  return inputHash === storedHash;
}

/**
 * Generate random password
 */
export function generatePassword(length = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Mínimo 8 caracteres');
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Use maiúsculas e minúsculas');
  }
  
  if (/\\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione números');
  }
  
  if (/[!@#$%^&*()_+\\-=\\[\\]{};':"|,.<>/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione símbolos especiais');
  }
  
  return { score, feedback };
}

/**
 * Get password strength label
 */
export function getStrengthLabel(score: number): 'weak' | 'fair' | 'good' | 'strong' {
  if (score <= 1) return 'weak';
  if (score <= 2) return 'fair';
  if (score <= 3) return 'good';
  return 'strong';
}

/**
 * Validate password meets minimum requirements
 */
export function validatePasswordRequirements(password: string): boolean {
  const { score } = checkPasswordStrength(password);
  return score >= 3; // Minimum "good" strength
}
`;
}

function generateAuthIndex(): string {
  return `// TSiJUKEBOX Auth Index - v${VERSION}
// Export all auth utilities

export { hashPassword, validateLocalPassword, generatePassword, checkPasswordStrength, getStrengthLabel, validatePasswordRequirements } from './passwordUtils';

export { 
  validateLocalUser,
  getDevAutoLoginUser,
  getLocalUserById,
  hasRole,
  DEV_AUTO_LOGIN,
  LOCAL_USERS_CONFIG,
} from './localUsers';

export type { LocalUser, UserRole } from './localUsers';
`;
}
