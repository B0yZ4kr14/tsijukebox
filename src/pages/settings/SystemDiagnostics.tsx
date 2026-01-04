import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Server, 
  Cloud, 
  Music, 
  CloudSun, 
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Play,
  ArrowLeft,
  Download,
  RefreshCw,
  Clock,
  Wifi,
  Database,
  Zap,
  Wrench,
  Settings,
  ExternalLink
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api/client';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { Badge, Button, Card } from "@/components/ui/themed"

interface DiagnosticResult {
  status: 'pending' | 'running' | 'success' | 'warning' | 'error' | 'skipped';
  message: string;
  latency?: number;
  details?: string;
}

interface RepairAction {
  id: string;
  label: string;
  description: string;
  severity: 'auto' | 'manual';
  action: () => Promise<void>;
}

interface DiagnosticTest {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'connection' | 'api' | 'system';
  test: () => Promise<DiagnosticResult>;
}

export default function SystemDiagnostics() {
  const navigate = useNavigate();
  const { apiUrl, weather, spotify, isDemoMode, setDemoMode } = useSettings();
  const [results, setResults] = useState<Record<string, DiagnosticResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const diagnosticTests: DiagnosticTest[] = [
    {
      id: 'backend-health',
      name: 'Backend FastAPI',
      description: 'Verifica se o servidor principal está respondendo',
      icon: Server,
      category: 'connection',
      test: async () => {
        if (isDemoMode) {
          return { status: 'skipped', message: 'Modo Demo ativo' };
        }
        const start = Date.now();
        try {
          await api.healthCheck();
          return { status: 'success', message: 'Servidor online', latency: Date.now() - start };
        } catch (error) {
          return { status: 'error', message: 'Servidor não responde', details: String(error) };
        }
      }
    },
    {
      id: 'backend-status',
      name: 'Status do Sistema',
      description: 'Obtém métricas de CPU, memória e temperatura',
      icon: Activity,
      category: 'connection',
      test: async () => {
        if (isDemoMode) {
          return { status: 'skipped', message: 'Modo Demo ativo' };
        }
        const start = Date.now();
        try {
          const status = await api.getStatus();
          return { 
            status: 'success', 
            message: `CPU: ${status.cpu}%, Mem: ${status.memory}%`,
            latency: Date.now() - start,
            details: JSON.stringify(status, null, 2)
          };
        } catch (error) {
          return { status: 'error', message: 'Não foi possível obter status', details: String(error) };
        }
      }
    },
    {
      id: 'lovable-cloud',
      name: 'Lovable Cloud',
      description: 'Verifica conexão com banco de dados na nuvem',
      icon: Cloud,
      category: 'connection',
      test: async () => {
        const start = Date.now();
        try {
          const { error } = await supabase.from('user_roles').select('count').limit(1);
          if (error && error.code !== 'PGRST116') {
            return { status: 'warning', message: error.message, latency: Date.now() - start };
          }
          return { status: 'success', message: 'Conectado', latency: Date.now() - start };
        } catch (error) {
          return { status: 'error', message: 'Falha na conexão', details: String(error) };
        }
      }
    },
    {
      id: 'spotify-auth',
      name: 'Autenticação Spotify',
      description: 'Verifica se as credenciais do Spotify estão configuradas',
      icon: Music,
      category: 'api',
      test: async () => {
        if (!spotify.clientId || !spotify.clientSecret) {
          return { status: 'skipped', message: 'Credenciais não configuradas' };
        }
        if (!spotify.tokens?.accessToken) {
          return { status: 'warning', message: 'Token não gerado - faça login' };
        }
        // Check if token is expired
        if (spotify.tokens?.expiresAt && Date.now() > spotify.tokens.expiresAt) {
          return { status: 'warning', message: 'Token expirado - renove' };
        }
        return { status: 'success', message: spotify.isConnected ? 'Conectado' : 'Credenciais válidas' };
      }
    },
    {
      id: 'weather-api',
      name: 'API de Clima',
      description: 'Verifica conexão com OpenWeatherMap',
      icon: CloudSun,
      category: 'api',
      test: async () => {
        if (!weather.apiKey || !weather.city) {
          return { status: 'skipped', message: 'Não configurado' };
        }
        const start = Date.now();
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(weather.city)}&appid=${weather.apiKey}&units=metric`
          );
          if (response.ok) {
            const data = await response.json();
            return { 
              status: 'success', 
              message: `${weather.city}: ${Math.round(data.main.temp)}°C`,
              latency: Date.now() - start 
            };
          }
          if (response.status === 401) {
            return { status: 'error', message: 'Chave API inválida' };
          }
          return { status: 'error', message: `Erro ${response.status}` };
        } catch (error) {
          return { status: 'error', message: 'Falha na conexão', details: String(error) };
        }
      }
    },
    {
      id: 'network',
      name: 'Conectividade de Rede',
      description: 'Verifica acesso à internet',
      icon: Wifi,
      category: 'system',
      test: async () => {
        const start = Date.now();
        try {
          const response = await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
          return { status: 'success', message: 'Internet disponível', latency: Date.now() - start };
        } catch {
          return { status: 'error', message: 'Sem acesso à internet' };
        }
      }
    },
    {
      id: 'local-storage',
      name: 'Armazenamento Local',
      description: 'Verifica se localStorage está disponível',
      icon: Database,
      category: 'system',
      test: async () => {
        try {
          const testKey = '__diagnostic_test__';
          localStorage.setItem(testKey, 'test');
          localStorage.removeItem(testKey);
          const used = JSON.stringify(localStorage).length;
          return { 
            status: 'success', 
            message: `Disponível (~${Math.round(used / 1024)}KB usado)` 
          };
        } catch {
          return { status: 'error', message: 'localStorage indisponível' };
        }
      }
    },
  ];

  // Repair actions for each test
  const repairActions: Record<string, RepairAction> = {
    'backend-health': {
      id: 'enable-demo',
      label: 'Ativar Modo Demo',
      description: 'Usar dados simulados enquanto servidor está offline',
      severity: 'auto',
      action: async () => {
        setDemoMode(true);
        toast.success('Modo Demo ativado automaticamente');
      }
    },
    'backend-status': {
      id: 'reconnect-backend',
      label: 'Reconectar',
      description: 'Tentar reconexão automática ao servidor',
      severity: 'auto',
      action: async () => {
        toast.info('Tentando reconexão...');
        const test = diagnosticTests.find(t => t.id === 'backend-status');
        if (test) {
          setResults(prev => ({ ...prev, 'backend-status': { status: 'running', message: 'Reconectando...' } }));
          await new Promise(r => setTimeout(r, 1500));
          const result = await test.test();
          setResults(prev => ({ ...prev, 'backend-status': result }));
          if (result.status === 'success') {
            toast.success('Reconexão bem-sucedida!');
          } else {
            toast.error('Falha na reconexão');
          }
        }
      }
    },
    'lovable-cloud': {
      id: 'retry-cloud',
      label: 'Reconectar Cloud',
      description: 'Tentar reconexão com Lovable Cloud',
      severity: 'auto',
      action: async () => {
        toast.info('Reconectando ao Cloud...');
        const test = diagnosticTests.find(t => t.id === 'lovable-cloud');
        if (test) {
          setResults(prev => ({ ...prev, 'lovable-cloud': { status: 'running', message: 'Testando...' } }));
          const result = await test.test();
          setResults(prev => ({ ...prev, 'lovable-cloud': result }));
        }
      }
    },
    'spotify-auth': {
      id: 'config-spotify',
      label: 'Configurar Spotify',
      description: 'Abrir configurações do Spotify',
      severity: 'manual',
      action: async () => {
        navigate('/settings', { state: { category: 'integrations' } });
      }
    },
    'weather-api': {
      id: 'config-weather',
      label: 'Configurar Clima',
      description: 'Adicionar chave OpenWeatherMap',
      severity: 'manual',
      action: async () => {
        navigate('/settings', { state: { category: 'integrations' } });
      }
    },
    'network': {
      id: 'retry-network',
      label: 'Tentar Novamente',
      description: 'Refazer teste de rede',
      severity: 'auto',
      action: async () => {
        const test = diagnosticTests.find(t => t.id === 'network');
        if (test) {
          setResults(prev => ({ ...prev, 'network': { status: 'running', message: 'Testando...' } }));
          const result = await test.test();
          setResults(prev => ({ ...prev, 'network': result }));
        }
      }
    },
    'local-storage': {
      id: 'clear-storage',
      label: 'Limpar Cache',
      description: 'Limpar dados do localStorage',
      severity: 'auto',
      action: async () => {
        try {
          const keysToKeep = ['theme', 'language', 'tsi_api_url'];
          const allKeys = Object.keys(localStorage);
          let cleared = 0;
          allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
              localStorage.removeItem(key);
              cleared++;
            }
          });
          sessionStorage.clear();
          toast.success(`Cache limpo: ${cleared} itens removidos`);
        } catch (e) {
          toast.error('Erro ao limpar cache');
        }
      }
    }
  };

  const handleRepairAll = async () => {
    const failedTests = Object.entries(results)
      .filter(([, r]) => r.status === 'error' || r.status === 'warning')
      .map(([id]) => id);

    let repaired = 0;
    for (const testId of failedTests) {
      const repair = repairActions[testId];
      if (repair && repair.severity === 'auto') {
        try {
          await repair.action();
          repaired++;
        } catch (e) {
          console.error(`Erro ao reparar ${testId}:`, e);
        }
      }
    }

    if (repaired > 0) {
      toast.success(`${repaired} problema(s) corrigido(s) automaticamente`);
      // Re-run tests after repairs
      setTimeout(() => runAllTests(), 500);
    } else {
      toast.info('Nenhum problema pode ser corrigido automaticamente');
    }
  };

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    
    const newResults: Record<string, DiagnosticResult> = {};
    
    for (let i = 0; i < diagnosticTests.length; i++) {
      const test = diagnosticTests[i];
      
      // Set running state for current test
      setResults(prev => ({
        ...prev,
        [test.id]: { status: 'running', message: 'Testando...' }
      }));
      
      try {
        const result = await test.test();
        newResults[test.id] = result;
      } catch (error) {
        newResults[test.id] = { 
          status: 'error', 
          message: 'Erro inesperado',
          details: String(error)
        };
      }
      
      setResults(prev => ({ ...prev, [test.id]: newResults[test.id] }));
      setProgress(((i + 1) / diagnosticTests.length) * 100);
      
      // Small delay between tests for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setLastRun(new Date());
    setIsRunning(false);
    
    const successCount = Object.values(newResults).filter(r => r.status === 'success').length;
    const errorCount = Object.values(newResults).filter(r => r.status === 'error').length;
    const warningCount = Object.values(newResults).filter(r => r.status === 'warning').length;
    
    if (errorCount > 0) {
      toast.error(`Diagnóstico concluído: ${errorCount} erro(s) encontrado(s)`);
    } else if (warningCount > 0) {
      toast.warning(`Diagnóstico concluído: ${warningCount} aviso(s)`);
    } else {
      toast.success(`Diagnóstico concluído: ${successCount} testes OK`);
    }
  }, [diagnosticTests, isDemoMode, weather, spotify]);

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      environment: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        online: navigator.onLine,
        apiUrl,
        isDemoMode,
      },
      results: Object.entries(results).map(([id, result]) => ({
        id,
        name: diagnosticTests.find(t => t.id === id)?.name,
        ...result
      }))
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostico-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado');
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />;
      case 'skipped':
        return <AlertTriangle className="w-5 h-5 text-cyan-400/60" />;
      default:
        return <Clock className="w-5 h-5 text-cyan-500/50" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants: Record<string, string> = {
      success: 'bg-green-500/20 text-green-400 border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30',
      running: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      skipped: 'bg-cyan-500/10 text-cyan-400/60 border-cyan-500/20',
      pending: 'bg-cyan-500/10 text-cyan-500/50 border-cyan-500/20',
    };
    return variants[status] || variants.pending;
  };

  const categorizedTests = {
    connection: diagnosticTests.filter(t => t.category === 'connection'),
    api: diagnosticTests.filter(t => t.category === 'api'),
    system: diagnosticTests.filter(t => t.category === 'system'),
  };

  const summary = {
    total: diagnosticTests.length,
    success: Object.values(results).filter(r => r.status === 'success').length,
    warning: Object.values(results).filter(r => r.status === 'warning').length,
    error: Object.values(results).filter(r => r.status === 'error').length,
    skipped: Object.values(results).filter(r => r.status === 'skipped').length,
  };

  return (
    <div className="min-h-screen bg-kiosk-bg p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/settings')}
              className="text-kiosk-text/90 hover:text-kiosk-text" aria-label="Voltar">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-neon-action-label flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Diagnóstico do Sistema
              </h1>
              <p className="text-sm text-kiosk-text/85">
                Verifique todas as conexões e APIs configuradas
              </p>
            </div>
          </div>
          <LogoBrand variant="metal" size="sm" />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-kiosk-surface/50 border-cyan-500/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={runAllTests}
                  disabled={isRunning}
                  className="button-primary-glow-3d"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Executar Todos os Testes
                    </>
                  )}
                </Button>
                <Button
                  variant="kiosk-outline"
                  onClick={exportReport}
                  disabled={Object.keys(results).length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Relatório
                </Button>
                
                {summary.error > 0 && (
                  <Button
                    variant="kiosk-outline"
                    onClick={handleRepairAll}
                    disabled={isRunning}
                    className="text-amber-400"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Reparar Todos ({summary.error})
                  </Button>
                )}
              </div>
              
              {lastRun && (
                <span className="text-xs text-kiosk-text/85 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Última execução: {lastRun.toLocaleTimeString()}
                </span>
              )}
            </div>

            {isRunning && (
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-kiosk-text/85 mt-1 text-center">
                  {Math.round(progress)}% concluído
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Test Categories */}
        <div className="space-y-4">
          {/* Connections */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-kiosk-surface/50 border-cyan-500/20">
              <h3 className="text-sm font-semibold text-neon-action-label mb-3 flex items-center gap-2">
                <Server className="w-4 h-4" />
                CONEXÕES
              </h3>
              <div className="space-y-2">
                {categorizedTests.connection.map(test => {
                  const result = results[test.id];
                  const repair = repairActions[test.id];
                  const Icon = test.icon;
                  const showRepair = result && (result.status === 'error' || result.status === 'warning') && repair;
                  
                  return (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-kiosk-bg/50 border border-kiosk-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/10">
                          <Icon className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-medium text-kiosk-text">{test.name}</p>
                          <p className="text-xs text-kiosk-text/85">{test.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {result?.latency && (
                          <span className="text-xs text-kiosk-text/85">{result.latency}ms</span>
                        )}
                        {result && (
                          <Badge className={getStatusBadge(result.status)}>
                            {getStatusIcon(result.status)}
                            <span className="ml-1">{result.message}</span>
                          </Badge>
                        )}
                        {!result && (
                          <Badge className={getStatusBadge('pending')}>
                            <Clock className="w-4 h-4" />
                            <span className="ml-1">Aguardando</span>
                          </Badge>
                        )}
                        {showRepair && (
                          <Button
                            size="sm"
                            variant="kiosk-outline"
                            onClick={() => repair.action()}
                            className="h-7 text-xs text-amber-400 hover:bg-amber-500/10"
                            title={repair.description}
                          >
                            {repair.severity === 'auto' ? (
                              <Wrench className="w-3 h-3 mr-1" />
                            ) : (
                              <Settings className="w-3 h-3 mr-1" />
                            )}
                            {repair.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* APIs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 bg-kiosk-surface/50 border-cyan-500/20">
              <h3 className="text-sm font-semibold text-neon-action-label-gold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                APIs EXTERNAS
              </h3>
              <div className="space-y-2">
                {categorizedTests.api.map(test => {
                  const result = results[test.id];
                  const repair = repairActions[test.id];
                  const Icon = test.icon;
                  const showRepair = result && (result.status === 'error' || result.status === 'warning') && repair;
                  
                  return (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-kiosk-bg/50 border border-kiosk-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Icon className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-kiosk-text">{test.name}</p>
                          <p className="text-xs text-kiosk-text/85">{test.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {result?.latency && (
                          <span className="text-xs text-kiosk-text/85">{result.latency}ms</span>
                        )}
                        {result && (
                          <Badge className={getStatusBadge(result.status)}>
                            {getStatusIcon(result.status)}
                            <span className="ml-1">{result.message}</span>
                          </Badge>
                        )}
                        {!result && (
                          <Badge className={getStatusBadge('pending')}>
                            <Clock className="w-4 h-4" />
                            <span className="ml-1">Aguardando</span>
                          </Badge>
                        )}
                        {showRepair && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => repair.action()}
                            className="h-7 text-xs border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                            title={repair.description}
                          >
                            {repair.severity === 'auto' ? (
                              <Wrench className="w-3 h-3 mr-1" />
                            ) : (
                              <Settings className="w-3 h-3 mr-1" />
                            )}
                            {repair.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* System */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 bg-kiosk-surface/50 border-cyan-500/20">
              <h3 className="text-sm font-semibold text-neon-action-label-purple mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                SISTEMA
              </h3>
              <div className="space-y-2">
                {categorizedTests.system.map(test => {
                  const result = results[test.id];
                  const repair = repairActions[test.id];
                  const Icon = test.icon;
                  const showRepair = result && (result.status === 'error' || result.status === 'warning') && repair;
                  
                  return (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-kiosk-bg/50 border border-kiosk-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Icon className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-kiosk-text">{test.name}</p>
                          <p className="text-xs text-kiosk-text/85">{test.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {result?.latency && (
                          <span className="text-xs text-kiosk-text/85">{result.latency}ms</span>
                        )}
                        {result && (
                          <Badge className={getStatusBadge(result.status)}>
                            {getStatusIcon(result.status)}
                            <span className="ml-1">{result.message}</span>
                          </Badge>
                        )}
                        {!result && (
                          <Badge className={getStatusBadge('pending')}>
                            <Clock className="w-4 h-4" />
                            <span className="ml-1">Aguardando</span>
                          </Badge>
                        )}
                        {showRepair && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => repair.action()}
                            className="h-7 text-xs border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                            title={repair.description}
                          >
                            {repair.severity === 'auto' ? (
                              <Wrench className="w-3 h-3 mr-1" />
                            ) : (
                              <Settings className="w-3 h-3 mr-1" />
                            )}
                            {repair.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Summary */}
        <AnimatePresence>
          {Object.keys(results).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="p-4 bg-kiosk-surface/50 border-cyan-500/20">
                <h3 className="text-sm font-semibold text-kiosk-text/80 mb-3">RESUMO</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-kiosk-text">
                      <strong className="text-green-400">{summary.success}</strong> OK
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-kiosk-text">
                      <strong className="text-yellow-400">{summary.warning}</strong> Avisos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-kiosk-text">
                      <strong className="text-red-400">{summary.error}</strong> Erros
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-cyan-400/60" />
                    <span className="text-sm text-kiosk-text">
                      <strong className="text-cyan-400/60">{summary.skipped}</strong> Ignorados
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
