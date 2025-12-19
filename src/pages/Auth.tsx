import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Cloud, Server, RefreshCw } from 'lucide-react';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { LoginForm, SignUpForm, LocalLoginForm } from '@/components/auth';
import type { LoginFormData, SignUpFormData, LocalLoginFormData } from '@/lib/validations/authSchemas';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, signUp, isAuthenticated, authConfig, setAuthProvider } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success('Login realizado com sucesso');
        navigate('/');
      } else {
        toast.error('Credenciais inválidas');
      }
    } catch {
      toast.error('Erro ao fazer login');
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
        toast.success('Conta criada! Verifique seu email para confirmar.');
      }
    } catch {
      toast.error('Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalLogin = async (data: LocalLoginFormData) => {
    setIsLoading(true);
    try {
      const success = await login(data.username, data.password);
      if (success) {
        toast.success('Login realizado com sucesso');
        navigate('/');
      } else {
        toast.error('Credenciais inválidas');
      }
    } catch {
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProvider = () => {
    const newProvider = isSupabaseProvider ? 'local' : 'supabase';
    setAuthProvider(newProvider);
    toast.info(`Provedor alterado para: ${newProvider === 'supabase' ? 'Lovable Cloud' : 'Backend Local'}`);
  };

  const isSupabaseProvider = authConfig.provider === 'supabase';

  return (
    <div className="min-h-screen bg-kiosk-bg flex items-center justify-center p-4" data-testid="auth-page">
      <Card className="w-full max-w-md border-cyan-500/30 bg-kiosk-surface backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <LogoBrand size="sm" variant="metal" centered animate className="mb-2" />
          <div>
            <CardDescription className="flex items-center justify-center gap-2 mt-2 text-kiosk-text/90">
              {isSupabaseProvider ? (
                <>
                  <Cloud className="w-4 h-4 icon-neon-blue" />
                  Lovable Cloud
                </>
              ) : (
                <>
                  <Server className="w-4 h-4 icon-neon-blue" />
                  Autenticação Local
                </>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSupabaseProvider ? (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-kiosk-surface-alt">
                <TabsTrigger value="login" data-testid="login-tab" className="data-[state=active]:bg-kiosk-primary/20 text-kiosk-text">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" data-testid="signup-tab" className="data-[state=active]:bg-kiosk-primary/20 text-kiosk-text">
                  Criar Conta
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="signup">
                <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          ) : (
            <LocalLoginForm onSubmit={handleLocalLogin} isLoading={isLoading} />
          )}
          
          {/* Provider Toggle Button */}
          <div className="pt-4 border-t border-kiosk-border/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleProvider}
              className="w-full text-kiosk-text/60 hover:text-kiosk-text/90 gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              {isSupabaseProvider ? 'Usar Backend Local' : 'Usar Lovable Cloud'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
