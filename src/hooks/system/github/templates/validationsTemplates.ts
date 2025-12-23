// Validations templates - 2 arquivos
// Geração automática de conteúdo para src/lib/validations/

const VERSION = '2.5.0';
const GENERATED_AT = new Date().toISOString();

export function generateValidationsContent(path: string): string | null {
  const fileName = path.split('/').pop();
  
  switch (fileName) {
    case 'index.ts':
      return generateValidationsIndex();
    case 'authSchemas.ts':
      return generateAuthSchemas();
    default:
      return null;
  }
}

function generateValidationsIndex(): string {
  return `// Validation schemas - centralized exports
// TSiJUKEBOX v${VERSION}
// Generated: ${GENERATED_AT}

export * from './authSchemas';

// Common validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidUsername = (username: string): boolean => {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
`;
}

function generateAuthSchemas(): string {
  return `// Auth validation schemas using Zod
// TSiJUKEBOX v${VERSION}
// Generated: ${GENERATED_AT}

import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/,
      'Senha deve conter maiúscula, minúscula e número'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Reset password schema
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Update password schema
export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/,
      'Senha deve conter maiúscula, minúscula e número'
    ),
  confirmNewPassword: z
    .string()
    .min(1, 'Confirmação é obrigatória'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Senhas não conferem',
  path: ['confirmNewPassword'],
});

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
`;
}
