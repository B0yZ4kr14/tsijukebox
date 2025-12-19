import { z } from 'zod';

// Login schema for Supabase/Cloud auth
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Mínimo 6 caracteres')
    .max(72, 'Máximo 72 caracteres'),
});

// Signup schema extends login with password confirmation
export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Email inválido')
      .max(255, 'Email muito longo'),
    password: z
      .string()
      .min(1, 'Senha é obrigatória')
      .min(6, 'Mínimo 6 caracteres')
      .max(72, 'Máximo 72 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

// Local login schema (username + password)
export const localLoginSchema = z.object({
  username: z
    .string()
    .min(1, 'Usuário é obrigatório')
    .max(50, 'Usuário muito longo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Apenas letras, números, _ e -'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .max(72, 'Máximo 72 caracteres'),
});

// Inferred types for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type LocalLoginFormData = z.infer<typeof localLoginSchema>;
