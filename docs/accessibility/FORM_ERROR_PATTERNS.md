# 📋 Padrões de Erro em Formulários Acessíveis

**Versão:** 1.0  
**Data:** 2025-12-25  
**Projeto:** TSiJUKEBOX

---

## 📊 Visão Geral dos Padrões

| Padrão | Uso Recomendado | Complexidade | UX |
|--------|-----------------|--------------|-----|
| **Inline** | Formulários curtos, login, cadastro | 🟢 Baixa | Feedback imediato |
| **Resumo** | Formulários longos, checkout | 🟡 Média | Visão geral |
| **Toast** | Erros de servidor, ações assíncronas | 🟢 Baixa | Não-bloqueante |
| **Híbrido** | Formulários complexos | 🟠 Alta | Completo |

---

## 🟢 Padrão 1: Erro Inline

### Quando Usar
- Formulários com até 5 campos
- Login e autenticação
- Campos independentes
- Validação em tempo real

### Exemplo Completo: Formulário de Login

```tsx
// components/forms/LoginForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/themed';
import { Button } from '@/components/ui/themed';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

// Schema de validação
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('Digite um e-mail válido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validar ao sair do campo
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      // Lógica de autenticação
      await authenticateUser(data);
    } catch (error) {
      // Erro de servidor tratado separadamente
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-6"
      noValidate // Desabilita validação nativa para controle total
    >
      {/* Campo de E-mail */}
      <div className="space-y-2">
        <Label 
          htmlFor="email"
          className="text-sm font-medium text-[var(--text-primary)]"
        >
          E-mail
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </Label>
        
        <div className="relative">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : 'email-hint'}
            className={cn(
              'w-full',
              errors.email && 'border-red-500 focus:ring-red-500'
            )}
            {...register('email')}
          />
          
          {/* Ícone de erro */}
          {errors.email && (
            <AlertCircle 
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          )}
        </div>
        
        {/* Mensagem de erro - Inline */}
        {errors.email ? (
          <p 
            id="email-error" 
            role="alert"
            className="text-sm text-red-500 flex items-center gap-1"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {errors.email.message}
          </p>
        ) : (
          <p 
            id="email-hint" 
            className="text-sm text-[var(--text-muted)]"
          >
            Digite o e-mail cadastrado
          </p>
        )}
      </div>

      {/* Campo de Senha */}
      <div className="space-y-2">
        <Label 
          htmlFor="password"
          className="text-sm font-medium text-[var(--text-primary)]"
        >
          Senha
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </Label>
        
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-required="true"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : 'password-hint'}
            className={cn(
              'w-full pr-10',
              errors.password && 'border-red-500 focus:ring-red-500'
            )}
            {...register('password')}
          />
          
          {/* Botão mostrar/ocultar senha */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-[var(--text-muted)]" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5 text-[var(--text-muted)]" aria-hidden="true" />
            )}
          </button>
        </div>
        
        {/* Mensagem de erro - Inline */}
        {errors.password ? (
          <p 
            id="password-error" 
            role="alert"
            className="text-sm text-red-500 flex items-center gap-1"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {errors.password.message}
          </p>
        ) : (
          <p 
            id="password-hint" 
            className="text-sm text-[var(--text-muted)]"
          >
            Mínimo de 8 caracteres
          </p>
        )}
      </div>

      {/* Botão de Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
```

### Características do Padrão Inline

| Aspecto | Implementação |
|---------|---------------|
| **aria-invalid** | Dinâmico: `aria-invalid={!!errors.field}` |
| **aria-describedby** | Alterna entre erro e dica |
| **role="alert"** | Na mensagem de erro |
| **Feedback visual** | Borda vermelha + ícone |
| **Timing** | `mode: 'onBlur'` |

---

## 🟡 Padrão 2: Resumo de Erros

### Quando Usar
- Formulários com mais de 5 campos
- Checkout e pagamento
- Cadastros extensos
- Formulários multi-step

### Exemplo Completo: Formulário de Cadastro

```tsx
// components/forms/RegistrationForm.tsx
import { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/themed';
import { Button } from '@/components/ui/themed';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle } from 'lucide-react';

// Schema de validação
const registrationSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório').regex(
    /^\(\d{2}\) \d{4,5}-\d{4}$/,
    'Formato: (11) 99999-9999'
  ),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter letra maiúscula')
    .regex(/[0-9]/, 'Deve conter número'),
  confirmPassword: z.string().min(1, 'Confirme a senha'),
  terms: z.boolean().refine(val => val === true, 'Aceite os termos'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

// Mapeamento de campos para labels amigáveis
const fieldLabels: Record<string, string> = {
  firstName: 'Nome',
  lastName: 'Sobrenome',
  email: 'E-mail',
  phone: 'Telefone',
  password: 'Senha',
  confirmPassword: 'Confirmar senha',
  terms: 'Termos de uso',
};

export function RegistrationForm() {
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    setFocus,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onSubmit', // Validar apenas no submit
  });

  // Focar no resumo de erros quando aparecer
  useEffect(() => {
    if (isSubmitted && Object.keys(errors).length > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [isSubmitted, errors]);

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      setSubmitSuccess(true);
    } catch (error) {
      // Tratar erro de servidor
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navegar para o campo com erro
  const handleErrorClick = (fieldName: string) => {
    setFocus(fieldName as keyof RegistrationFormData);
  };

  const errorCount = Object.keys(errors).length;

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-6"
      noValidate
      aria-labelledby="form-title"
    >
      <h2 id="form-title" className="text-2xl font-bold">
        Criar Conta
      </h2>

      {/* ========================================
          RESUMO DE ERROS - Aparece após submit
          ======================================== */}
      {isSubmitted && errorCount > 0 && (
        <div
          ref={errorSummaryRef}
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle 
              className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" 
              aria-hidden="true" 
            />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                {errorCount === 1 
                  ? 'Há 1 erro no formulário' 
                  : `Há ${errorCount} erros no formulário`}
              </h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                Corrija os erros abaixo para continuar:
              </p>
              
              {/* Lista de erros com links */}
              <ul className="mt-3 space-y-1">
                {Object.entries(errors).map(([fieldName, error]) => (
                  <li key={fieldName}>
                    <button
                      type="button"
                      onClick={() => handleErrorClick(fieldName)}
                      className="text-sm text-red-700 dark:text-red-300 hover:underline focus:underline focus:outline-none"
                    >
                      <span className="font-medium">
                        {fieldLabels[fieldName] || fieldName}:
                      </span>{' '}
                      {error?.message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          MENSAGEM DE SUCESSO
          ======================================== */}
      {submitSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
            <p className="text-green-800 dark:text-green-200 font-medium">
              Conta criada com sucesso! Verifique seu e-mail.
            </p>
          </div>
        </div>
      )}

      {/* ========================================
          CAMPOS DO FORMULÁRIO
          ======================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <FormField
          id="firstName"
          label="Nome"
          required
          error={errors.firstName?.message}
          {...register('firstName')}
        />

        {/* Sobrenome */}
        <FormField
          id="lastName"
          label="Sobrenome"
          required
          error={errors.lastName?.message}
          {...register('lastName')}
        />

        {/* E-mail */}
        <FormField
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          className="md:col-span-2"
          {...register('email')}
        />

        {/* Telefone */}
        <FormField
          id="phone"
          label="Telefone"
          type="tel"
          autoComplete="tel"
          placeholder="(11) 99999-9999"
          required
          error={errors.phone?.message}
          className="md:col-span-2"
          {...register('phone')}
        />

        {/* Senha */}
        <FormField
          id="password"
          label="Senha"
          type="password"
          autoComplete="new-password"
          required
          error={errors.password?.message}
          hint="Mínimo 8 caracteres, 1 maiúscula e 1 número"
          {...register('password')}
        />

        {/* Confirmar Senha */}
        <FormField
          id="confirmPassword"
          label="Confirmar Senha"
          type="password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      {/* Termos de Uso */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            aria-required="true"
            aria-invalid={!!errors.terms}
            aria-describedby={errors.terms ? 'terms-error' : undefined}
            className={cn(
              'mt-1 h-4 w-4 rounded border-gray-300',
              errors.terms && 'border-red-500'
            )}
            {...register('terms')}
          />
          <Label htmlFor="terms" className="text-sm">
            Li e aceito os{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Termos de Uso
            </a>{' '}
            e a{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          </Label>
        </div>
        {errors.terms && (
          <p id="terms-error" role="alert" className="text-sm text-red-500">
            {errors.terms.message}
          </p>
        )}
      </div>

      {/* Botão de Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
      </Button>

      {/* Contador de erros para screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {errorCount > 0 && `${errorCount} erros no formulário`}
      </div>
    </form>
  );
}

// ========================================
// COMPONENTE AUXILIAR: FormField
// ========================================
interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, error, hint, required, className, ...props }, ref) => {
    const describedBy = [
      error && `${id}-error`,
      hint && !error && `${id}-hint`,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('space-y-2', className)}>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          )}
        </Label>
        
        <Input
          ref={ref}
          id={id}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(error && 'border-red-500 focus:ring-red-500')}
          {...props}
        />
        
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-sm text-red-500">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-sm text-[var(--text-muted)]">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
FormField.displayName = 'FormField';
```

### Características do Padrão Resumo

| Aspecto | Implementação |
|---------|---------------|
| **Posição** | Topo do formulário, antes dos campos |
| **Foco automático** | `useEffect` + `ref.focus()` |
| **aria-live** | `assertive` para anúncio imediato |
| **Links clicáveis** | Navegam para o campo com erro |
| **Contagem** | "Há X erros no formulário" |
| **Timing** | `mode: 'onSubmit'` |

---

## 🔄 Padrão 3: Híbrido (Resumo + Inline)

### Quando Usar
- Formulários críticos (pagamento, dados sensíveis)
- Melhor experiência de usuário
- Requisitos de acessibilidade rigorosos

### Implementação

Combina os dois padrões:
1. **Resumo no topo** após submit com erros
2. **Erros inline** em cada campo
3. **Validação em tempo real** para campos críticos

```tsx
// Configuração do react-hook-form para padrão híbrido
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur',           // Validação inline ao sair do campo
  reValidateMode: 'onChange', // Revalidar ao digitar (após primeiro erro)
});
```

---

## 📊 Comparação dos Padrões

| Aspecto | Inline | Resumo | Híbrido |
|---------|--------|--------|---------|
| **Feedback** | Imediato | Após submit | Ambos |
| **Navegação** | Campo a campo | Lista de links | Ambos |
| **Complexidade** | Baixa | Média | Alta |
| **UX Mobile** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Screen Reader** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Formulários curtos** | ✅ Ideal | ❌ Overkill | ⚠️ Opcional |
| **Formulários longos** | ⚠️ Parcial | ✅ Ideal | ✅ Ideal |

---

## ✅ Checklist de Implementação

### Para Padrão Inline
- [ ] `aria-invalid` dinâmico em cada campo
- [ ] `aria-describedby` alternando erro/dica
- [ ] `role="alert"` na mensagem de erro
- [ ] Feedback visual (borda, ícone)
- [ ] Validação `onBlur` ou `onChange`

### Para Padrão Resumo
- [ ] Container com `role="alert"` e `aria-live="assertive"`
- [ ] Foco automático no resumo após submit
- [ ] Links clicáveis para cada campo com erro
- [ ] Contagem de erros anunciada
- [ ] `tabIndex={-1}` para foco programático

### Para Ambos
- [ ] Labels associados (`htmlFor` + `id`)
- [ ] Campos obrigatórios com `aria-required`
- [ ] Autocomplete apropriado
- [ ] Mensagens de erro descritivas
- [ ] Teste com NVDA/VoiceOver

---

*Documento gerado em: 2025-12-25*  
*Projeto: TSiJUKEBOX Accessibility*
