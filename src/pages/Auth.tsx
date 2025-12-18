import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Lock, Mail, User, Cloud, Server } from 'lucide-react';
import { LogoBrand } from '@/components/ui/LogoBrand';

export default function Auth() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signUp, isAuthenticated, authConfig } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginIdentifier = authConfig.provider === 'supabase' ? email : identifier;
      const success = await login(loginIdentifier, password);
      
      if (success) {
        toast.success('Login realizado com sucesso');
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (signUpPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, signUpPassword);
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email já está registrado');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Conta criada! Verifique seu email para confirmar.');
      }
    } catch (error) {
      toast.error('Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const isSupabaseProvider = authConfig.provider === 'supabase';

  return (
    <div className="min-h-screen bg-kiosk-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-cyan-500/30 bg-[hsl(220_25%_10%)] backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <LogoBrand size="sm" variant="metal" centered animate className="mb-2" />
          <div>
            <CardDescription className="flex items-center justify-center gap-2 mt-2 text-kiosk-text/70">
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
        <CardContent>
          {isSupabaseProvider ? (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-[hsl(220_25%_14%)]">
                <TabsTrigger value="login" className="data-[state=active]:bg-kiosk-primary/20 text-kiosk-text">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-kiosk-primary/20 text-kiosk-text">Criar Conta</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-label-yellow">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 icon-neon-blue" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        autoComplete="email"
                        className="pl-10 bg-[hsl(220_25%_14%)] border-kiosk-border text-kiosk-text"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-label-yellow">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 icon-neon-blue" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        className="pl-10 bg-[hsl(220_25%_14%)] border-kiosk-border text-kiosk-text"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-label-yellow">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 icon-neon-blue" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        autoComplete="email"
                        className="pl-10 bg-[hsl(220_25%_14%)] border-kiosk-border text-kiosk-text"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-label-yellow">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 icon-neon-blue" />
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        autoComplete="new-password"
                        className="pl-10 bg-[hsl(220_25%_14%)] border-kiosk-border text-kiosk-text"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-label-yellow">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 icon-neon-blue" />
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        required
                        autoComplete="new-password"
                        className="pl-10 bg-[hsl(220_25%_14%)] border-kiosk-border text-kiosk-text"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-label-yellow">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 icon-neon-blue" />
                  <Input
                    id="username"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Digite o usuário"
                    required
                    autoComplete="username"
                    className="pl-10 bg-[hsl(220_25%_14%)] border-kiosk-border text-kiosk-text"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="local-password" className="text-label-yellow">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 icon-neon-blue" />
                  <Input
                    id="local-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha"
                    required
                    autoComplete="current-password"
                    className="pl-10 bg-[hsl(220_25%_14%)] border-kiosk-border text-kiosk-text"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                <Lock className="w-4 h-4 mr-2" />
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
              
              <p className="text-xs text-kiosk-text/60 text-center mt-4">
                Credenciais padrão: tsi / connect
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
