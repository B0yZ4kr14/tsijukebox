/**
 * Auth Page - TSiJUKEBOX
 * 
 * Página de autenticação completa com suporte a:
 * - Login/Signup com Supabase (Cloud)
 * - Login Local (Backend)
 * - OAuth (Google, GitHub, Spotify)
 * - Remember Me / Esqueci Senha
 * - Animações com Framer Motion
 * 
 * @version 2.0.0
 * @author TSiJUKEBOX Team
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Cloud, 
  Server, 
  RefreshCw, 
  Github, 
  Mail,
  Music,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { LoginForm, SignUpForm, LocalLoginForm } from '@/components/auth';
import type { LoginFormData, SignUpFormData, LocalLoginFormData } from '@/lib/validations/authSchemas';
import { Button, Card } from "@/components/ui/themed"

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: 'easeOut',
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.02, 1],
    transition: { 
      duration: 2, 
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// ============================================================================
// OAUTH PROVIDERS
// ============================================================================

interface OAuthProvider {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  hoverColor: string;
}

const oauthProviders: OAuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    color: 'bg-white text-gray-700 border border-gray-300',
    hoverColor: 'hover:bg-gray-50'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    color: 'bg-gray-900 text-white',
    hoverColor: 'hover:bg-gray-800'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: Music,
    color: 'bg-[#1DB954] text-white',
    hoverColor: 'hover:bg-[#1ed760]'
  }
];

// ============================================================================
// FORGOT PASSWORD VIEW
// ============================================================================

interface ForgotPasswordViewProps {
  onBack: () => void;
  isLoading: boolean;
  onSubmit: (email: string) => Promise<void>;
}

function ForgotPasswordView({ onBack, isLoading, onSubmit }: ForgotPasswordViewProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email);
    setSent(true);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-kiosk-text/60 hover:text-kiosk-text gap-2 -ml-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>

      {sent ? (
        <motion.div 
          variants={itemVariants}
          className="text-center space-y-4 py-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <CheckCircle2 className="w-16 h-16 mx-auto text-accent-green" />
          </motion.div>
          <h3 className="text-lg font-semibold text-kiosk-text">Email Enviado!</h3>
          <p className="text-sm text-kiosk-text/70">
            Verifique sua caixa de entrada para redefinir sua senha.
          </p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants} className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-kiosk-text">Esqueceu sua senha?</h3>
            <p className="text-sm text-kiosk-text/70">
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
          </motion.div>

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-kiosk-text">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-text/50" />
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-kiosk-surface-alt border border-kiosk-border/30 rounded-lg text-kiosk-text placeholder:text-kiosk-text/40 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-accent-cyan hover:bg-accent-cyan/90"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Link de Redefinição'
              )}
            </Button>
          </motion.form>
        </>
      )}
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  const { login, signUp, isAuthenticated, authConfig, setAuthProvider, loginWithOAuth, resetPassword } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for redirect params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
    }
    
    const error = searchParams.get('error');
    if (error) {
      toast.error(decodeURIComponent(error));
    }

    const success = searchParams.get('success');
    if (success) {
      toast.success(decodeURIComponent(success));
    }
  }, [searchParams]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/';
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, searchParams]);

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.password, rememberMe);
      if (success) {
        toast.success('Login realizado com sucesso!', {
          icon: <CheckCircle2 className="w-4 h-4 text-accent-green" />
        });
        navigate('/');
      } else {
        toast.error('Credenciais inválidas', {
          icon: <AlertCircle className="w-4 h-4 text-red-500" />
        });
      }
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password);
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email já está registrado');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Conta criada! Verifique seu email para confirmar.', {
          duration: 5000,
          icon: <CheckCircle2 className="w-4 h-4 text-accent-green" />
        });
        setActiveTab('login');
      }
    } catch (error) {
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalLogin = async (data: LocalLoginFormData) => {
    setIsLoading(true);
    try {
      const success = await login(data.username, data.password, rememberMe);
      if (success) {
        toast.success('Login realizado com sucesso!');
        navigate('/');
      } else {
        toast.error('Credenciais inválidas');
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (providerId: string) => {
    setOauthLoading(providerId);
    try {
      await loginWithOAuth?.(providerId);
    } catch (error) {
      toast.error(`Erro ao conectar com ${providerId}`);
    } finally {
      setOauthLoading(null);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await resetPassword?.(email);
      toast.success('Email de redefinição enviado!');
    } catch (error) {
      toast.error('Erro ao enviar email. Verifique o endereço.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProvider = () => {
    const newProvider = isSupabaseProvider ? 'local' : 'supabase';
    setAuthProvider(newProvider);
    toast.info(`Provedor alterado para: ${newProvider === 'supabase' ? 'Lovable Cloud' : 'Backend Local'}`, {
      icon: newProvider === 'supabase' ? <Cloud className="w-4 h-4" /> : <Server className="w-4 h-4" />
    });
  };

  const isSupabaseProvider = authConfig.provider === 'supabase';

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <div 
      className="min-h-screen bg-kiosk-bg flex items-center justify-center p-4 relative overflow-hidden" 
      data-testid="auth-page"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-magenta/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        <Card 
          className="border-cyan-500/30 bg-kiosk-surface/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/10" 
          data-testid="auth-card"
        >
          <motion.div variants={pulseVariants} animate="pulse">
              <LogoBrand 
                size="sm" 
                variant="metal" 
                centered 
                animate 
                className="mb-2" 
                data-testid="auth-logo" 
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <p className="text-sm text-[var(--text-muted)]">
                {isSupabaseProvider ? (
                  <>
                    <Cloud className="w-4 h-4 text-accent-cyan" />
                    <span>Lovable Cloud</span>
                  </>
                ) : (
                  <>
                    <Server className="w-4 h-4 text-accent-green" />
                    <span>Autenticação Local</span>
                  </>
                )}
              </p>
            </motion.div>
          

          <div className="mt-4">
            <AnimatePresence mode="wait">
              {showForgotPassword ? (
                <ForgotPasswordView
                  key="forgot-password"
                  onBack={() => setShowForgotPassword(false)}
                  isLoading={isLoading}
                  onSubmit={handleForgotPassword}
                />
              ) : isSupabaseProvider ? (
                <motion.div
                  key="supabase-auth"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* OAuth Buttons */}
                  <motion.div variants={itemVariants} className="space-y-3 mb-6">
                    {oauthProviders.map((provider) => (
                      <Button
                        key={provider.id}
                        variant="outline"
                        className={`w-full ${provider.color} ${provider.hoverColor} transition-all duration-200`}
                        onClick={() => handleOAuthLogin(provider.id)}
                        disabled={oauthLoading !== null}
                      >
                        {oauthLoading === provider.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <provider.icon className="w-4 h-4 mr-2" />
                        )}
                        Continuar com {provider.name}
                      </Button>
                    ))}
                  </motion.div>

                  <motion.div variants={itemVariants} className="relative my-6">
                    <Separator className="bg-kiosk-border/30" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-kiosk-surface px-3 text-xs text-kiosk-text/50">
                      ou continue com email
                    </span>
                  </motion.div>

                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')} className="w-full">
                    <motion.div variants={itemVariants}>
                      <TabsList className="grid w-full grid-cols-2 mb-6 bg-kiosk-surface-alt">
                        <TabsTrigger 
                          value="login" 
                          data-testid="login-tab" 
                          className="data-[state=active]:bg-accent-cyan/20 data-[state=active]:text-accent-cyan text-kiosk-text transition-all"
                        >
                          Entrar
                        </TabsTrigger>
                        <TabsTrigger 
                          value="signup" 
                          data-testid="signup-tab" 
                          className="data-[state=active]:bg-accent-cyan/20 data-[state=active]:text-accent-cyan text-kiosk-text transition-all"
                        >
                          Criar Conta
                        </TabsTrigger>
                      </TabsList>
                    </motion.div>
                    
                    <TabsContent value="login" className="space-y-4">
                      <motion.div variants={itemVariants}>
                        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="remember" 
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            className="border-kiosk-border/50 data-[state=checked]:bg-accent-cyan data-[state=checked]:border-accent-cyan"
                          />
                          <Label 
                            htmlFor="remember" 
                            className="text-sm text-kiosk-text/70 cursor-pointer"
                          >
                            Lembrar-me
                          </Label>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-accent-cyan hover:text-accent-cyan/80 p-0 h-auto"
                        >
                          Esqueceu a senha?
                        </Button>
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="signup">
                      <motion.div variants={itemVariants}>
                        <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} />
                      </motion.div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              ) : (
                <motion.div
                  key="local-auth"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.div variants={itemVariants}>
                    <LocalLoginForm onSubmit={handleLocalLogin} isLoading={isLoading} />
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="flex items-center space-x-2 mt-4">
                    <Checkbox 
                      id="remember-local" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-kiosk-border/50 data-[state=checked]:bg-accent-green data-[state=checked]:border-accent-green"
                    />
                    <Label 
                      htmlFor="remember-local" 
                      className="text-sm text-kiosk-text/70 cursor-pointer"
                    >
                      Manter conectado
                    </Label>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Provider Toggle Button */}
            <motion.div variants={itemVariants} className="pt-4 border-t border-kiosk-border/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleProvider}
                className="w-full text-kiosk-text/60 hover:text-kiosk-text/90 gap-2 group"
              >
                <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                {isSupabaseProvider ? 'Usar Backend Local' : 'Usar Lovable Cloud'}
              </Button>
            </motion.div>

            {/* Version Info */}
            <motion.p 
              variants={itemVariants}
              className="text-center text-xs text-kiosk-text/40 pt-2"
            >
              TSiJUKEBOX v4.2.1 • Secure Authentication
            </motion.p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
