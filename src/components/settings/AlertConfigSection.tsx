import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Webhook, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Send,
  Settings,
  Shield,
  Zap,
  Activity,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge, Button, Card, Input, Slider, Toggle } from "@/components/ui/themed"

interface ChannelConfig {
  enabled: boolean;
  webhookUrl?: string;
  apiKey?: string;
  routingKey?: string;
  teamId?: string;
  site?: string;
  recipients?: string[];
  headers?: Record<string, string>;
  method?: string;
}

interface AlertConfig {
  threshold: number;
  cooldownMinutes: number;
  channels: {
    email: ChannelConfig;
    slack: ChannelConfig;
    discord: ChannelConfig;
    pagerduty: ChannelConfig;
    opsgenie: ChannelConfig;
    datadog: ChannelConfig;
    customWebhook: ChannelConfig;
  };
}

const defaultConfig: AlertConfig = {
  threshold: 10,
  cooldownMinutes: 5,
  channels: {
    email: { enabled: false, recipients: [] },
    slack: { enabled: false, webhookUrl: "" },
    discord: { enabled: false, webhookUrl: "" },
    pagerduty: { enabled: false, routingKey: "", apiKey: "" },
    opsgenie: { enabled: false, apiKey: "", teamId: "" },
    datadog: { enabled: false, apiKey: "", site: "us1" },
    customWebhook: { enabled: false, webhookUrl: "", method: "POST", headers: {} },
  },
};

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail className="h-5 w-5" />,
  slack: <MessageSquare className="h-5 w-5" />,
  discord: <MessageSquare className="h-5 w-5" />,
  pagerduty: <AlertTriangle className="h-5 w-5" />,
  opsgenie: <Shield className="h-5 w-5" />,
  datadog: <Activity className="h-5 w-5" />,
  customWebhook: <Webhook className="h-5 w-5" />,
};

const channelColors: Record<string, string> = {
  email: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  slack: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  discord: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  pagerduty: "bg-green-500/20 text-green-400 border-green-500/30",
  opsgenie: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  datadog: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  customWebhook: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export function AlertConfigSection() {
  const [config, setConfig] = useState<AlertConfig>(defaultConfig);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("tsijukebox-alert-config");
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse alert config:", e);
      }
    }
  }, []);

  // Save config to localStorage
  const saveConfig = () => {
    setIsSaving(true);
    try {
      localStorage.setItem("tsijukebox-alert-config", JSON.stringify(config));
      toast.success("Configurações de alerta salvas!");
    } catch (e) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  // Test webhook
  const testChannel = async (channel: string) => {
    setTestingChannel(channel);
    setTestResults((prev) => ({ ...prev, [channel]: null }));

    try {
      const { data, error } = await supabase.functions.invoke("alert-notifications", {
        body: {
          type: "test",
          channel: channel === "customWebhook" ? "webhook" : channel,
          title: "Teste de Alerta - TSiJUKEBOX",
          message: "Este é um alerta de teste do sistema de monitoramento.",
          severity: "info",
          metadata: {
            testTime: new Date().toISOString(),
            source: "AlertConfigSection",
          },
          // Pass channel-specific config
          ...(channel === "pagerduty" && {
            routingKey: config.channels.pagerduty.routingKey,
          }),
          ...(channel === "opsgenie" && {
            apiKey: config.channels.opsgenie.apiKey,
            teamId: config.channels.opsgenie.teamId,
          }),
          ...(channel === "datadog" && {
            apiKey: config.channels.datadog.apiKey,
            site: config.channels.datadog.site,
          }),
          ...(channel === "customWebhook" && {
            webhookUrl: config.channels.customWebhook.webhookUrl,
            method: config.channels.customWebhook.method,
            headers: config.channels.customWebhook.headers,
          }),
        },
      });

      if (error) throw error;
      
      setTestResults((prev) => ({ ...prev, [channel]: true }));
      toast.success(`Teste de ${channel} enviado com sucesso!`);
    } catch (e) {
      console.error(`Test failed for ${channel}:`, e);
      setTestResults((prev) => ({ ...prev, [channel]: false }));
      toast.error(`Falha no teste de ${channel}`);
    } finally {
      setTestingChannel(null);
    }
  };

  const updateChannel = (channel: keyof AlertConfig["channels"], updates: Partial<ChannelConfig>) => {
    setConfig((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: { ...prev.channels[channel], ...updates },
      },
    }));
  };

  const enabledCount = Object.values(config.channels).filter((c) => c.enabled).length;

  return (
    <Card className="card-dark-neon-border">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Bell aria-hidden="true" className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Configuração de Alertas</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Configure webhooks para PagerDuty, Opsgenie, Datadog e integrações personalizadas
              </p>
            </div>
          </div>
          <Badge variant="outline" className={enabledCount > 0 ? "border-green-500/50 text-green-400" : ""}>
            {enabledCount} ativo{enabledCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      
      <div className="mt-4">
        {/* Global Settings */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-settings-label flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Limiar de Taxa de Falha
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[config.threshold]}
                onValueChange={([value]) => setConfig((prev) => ({ ...prev, threshold: value }))}
                min={5}
                max={50}
                step={1}
                className="flex-1"
              />
              <span className="text-lg font-bold text-primary w-16 text-right">{config.threshold}%</span>
            </div>
            <p className="text-xs text-settings-hint">Alertas são disparados quando a taxa de falha ultrapassa este valor</p>
          </div>

          <div className="space-y-2">
            <Label className="text-settings-label flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-500" />
              Cooldown entre Alertas
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[config.cooldownMinutes]}
                onValueChange={([value]) => setConfig((prev) => ({ ...prev, cooldownMinutes: value }))}
                min={1}
                max={60}
                step={1}
                className="flex-1"
              />
              <span className="text-lg font-bold text-cyan-400 w-20 text-right">{config.cooldownMinutes} min</span>
            </div>
            <p className="text-xs text-settings-hint">Tempo mínimo entre alertas consecutivos</p>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Channel Tabs */}
        <Tabs defaultValue="corporate" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30">
            <TabsTrigger value="corporate">Corporativo</TabsTrigger>
            <TabsTrigger value="messaging">Mensageria</TabsTrigger>
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
          </TabsList>

          {/* Corporate Integrations */}
          <TabsContent value="corporate" className="space-y-4 mt-4">
            {/* PagerDuty */}
            <Card className={`transition-all ${config.channels.pagerduty.enabled ? channelColors.pagerduty : "bg-muted/10 border-border/30"}`}>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {channelIcons.pagerduty}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">PagerDuty</h3>
                      <p className="text-sm text-[var(--text-muted)]">Gestão de incidentes e alertas on-call</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.channels.pagerduty.enabled}
                    onCheckedChange={(enabled) => updateChannel("pagerduty", { enabled })}
                  />
                </div>
              
              {config.channels.pagerduty.enabled && (
                <div className="mt-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Routing Key (Integration Key)</Label>
                      <Input
                        type="password"
                        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={config.channels.pagerduty.routingKey || ""}
                        onChange={(e) => updateChannel("pagerduty", { routingKey: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">API Key (opcional)</Label>
                      <Input
                        type="password"
                        placeholder="u+xxxxxxxxxxxxxxxx"
                        value={config.channels.pagerduty.apiKey || ""}
                        onChange={(e) => updateChannel("pagerduty", { apiKey: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <a
                      href="https://support.pagerduty.com/docs/services-and-integrations#create-a-generic-events-api-integration"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <ExternalLink aria-hidden="true" className="h-3 w-3" /> Como configurar
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testChannel("pagerduty")}
                      disabled={testingChannel === "pagerduty" || !config.channels.pagerduty.routingKey}
                    >
                      {testingChannel === "pagerduty" ? (
                        "Testando..."
                      ) : testResults.pagerduty === true ? (
                        <><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> OK</>
                      ) : testResults.pagerduty === false ? (
                        <><XCircle className="h-4 w-4 text-red-500 mr-1" /> Falhou</>
                      ) : (
                        <><Send className="h-4 w-4 mr-1" /> Testar</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Opsgenie */}
            <Card className={`transition-all ${config.channels.opsgenie.enabled ? channelColors.opsgenie : "bg-muted/10 border-border/30"}`}>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {channelIcons.opsgenie}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Opsgenie</h3>
                      <p className="text-sm text-[var(--text-muted)]">Gestão de alertas e escalação Atlassian</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.channels.opsgenie.enabled}
                    onCheckedChange={(enabled) => updateChannel("opsgenie", { enabled })}
                  />
                </div>
              
              {config.channels.opsgenie.enabled && (
                <div className="mt-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">API Key</Label>
                      <Input
                        type="password"
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={config.channels.opsgenie.apiKey || ""}
                        onChange={(e) => updateChannel("opsgenie", { apiKey: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Team ID (opcional)</Label>
                      <Input
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={config.channels.opsgenie.teamId || ""}
                        onChange={(e) => updateChannel("opsgenie", { teamId: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <a
                      href="https://support.atlassian.com/opsgenie/docs/api-key-management/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <ExternalLink aria-hidden="true" className="h-3 w-3" /> Como configurar
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testChannel("opsgenie")}
                      disabled={testingChannel === "opsgenie" || !config.channels.opsgenie.apiKey}
                    >
                      {testingChannel === "opsgenie" ? (
                        "Testando..."
                      ) : testResults.opsgenie === true ? (
                        <><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> OK</>
                      ) : testResults.opsgenie === false ? (
                        <><XCircle className="h-4 w-4 text-red-500 mr-1" /> Falhou</>
                      ) : (
                        <><Send className="h-4 w-4 mr-1" /> Testar</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Datadog */}
            <Card className={`transition-all ${config.channels.datadog.enabled ? channelColors.datadog : "bg-muted/10 border-border/30"}`}>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {channelIcons.datadog}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Datadog</h3>
                      <p className="text-sm text-[var(--text-muted)]">Monitoramento e observabilidade</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.channels.datadog.enabled}
                    onCheckedChange={(enabled) => updateChannel("datadog", { enabled })}
                  />
                </div>
              
              {config.channels.datadog.enabled && (
                <div className="mt-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">API Key</Label>
                      <Input
                        type="password"
                        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={config.channels.datadog.apiKey || ""}
                        onChange={(e) => updateChannel("datadog", { apiKey: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Site Region</Label>
                      <select
                        value={config.channels.datadog.site || "us1"}
                        onChange={(e) => updateChannel("datadog", { site: e.target.value })}
                        className="w-full h-9 rounded-md border border-input bg-background/50 px-3 py-1 text-sm"
                      >
                        <option value="us1">US1 (datadoghq.com)</option>
                        <option value="us3">US3 (us3.datadoghq.com)</option>
                        <option value="us5">US5 (us5.datadoghq.com)</option>
                        <option value="eu1">EU1 (datadoghq.eu)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <a
                      href="https://docs.datadoghq.com/account_management/api-app-keys/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <ExternalLink aria-hidden="true" className="h-3 w-3" /> Como configurar
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testChannel("datadog")}
                      disabled={testingChannel === "datadog" || !config.channels.datadog.apiKey}
                    >
                      {testingChannel === "datadog" ? (
                        "Testando..."
                      ) : testResults.datadog === true ? (
                        <><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> OK</>
                      ) : testResults.datadog === false ? (
                        <><XCircle className="h-4 w-4 text-red-500 mr-1" /> Falhou</>
                      ) : (
                        <><Send className="h-4 w-4 mr-1" /> Testar</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Messaging Integrations */}
          <TabsContent value="messaging" className="space-y-4 mt-4">
            {/* Slack */}
            <Card className={`transition-all ${config.channels.slack.enabled ? channelColors.slack : "bg-muted/10 border-border/30"}`}>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {channelIcons.slack}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Slack</h3>
                      <p className="text-sm text-[var(--text-muted)]">Enviar alertas para canais Slack</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.channels.slack.enabled}
                    onCheckedChange={(enabled) => updateChannel("slack", { enabled })}
                  />
                </div>
              
              {config.channels.slack.enabled && (
                <div className="mt-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Webhook URL</Label>
                    <Input
                      type="password"
                      placeholder="https://hooks.slack.com/services/..."
                      value={config.channels.slack.webhookUrl || ""}
                      onChange={(e) => updateChannel("slack", { webhookUrl: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <a
                      href="https://api.slack.com/messaging/webhooks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <ExternalLink aria-hidden="true" className="h-3 w-3" /> Criar webhook
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testChannel("slack")}
                      disabled={testingChannel === "slack" || !config.channels.slack.webhookUrl}
                    >
                      {testingChannel === "slack" ? (
                        "Testando..."
                      ) : testResults.slack === true ? (
                        <><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> OK</>
                      ) : testResults.slack === false ? (
                        <><XCircle className="h-4 w-4 text-red-500 mr-1" /> Falhou</>
                      ) : (
                        <><Send className="h-4 w-4 mr-1" /> Testar</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Discord */}
            <Card className={`transition-all ${config.channels.discord.enabled ? channelColors.discord : "bg-muted/10 border-border/30"}`}>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {channelIcons.discord}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Discord</h3>
                      <p className="text-sm text-[var(--text-muted)]">Enviar alertas para servidores Discord</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.channels.discord.enabled}
                    onCheckedChange={(enabled) => updateChannel("discord", { enabled })}
                  />
                </div>
              
              {config.channels.discord.enabled && (
                <div className="mt-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Webhook URL</Label>
                    <Input
                      type="password"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={config.channels.discord.webhookUrl || ""}
                      onChange={(e) => updateChannel("discord", { webhookUrl: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <a
                      href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <ExternalLink aria-hidden="true" className="h-3 w-3" /> Criar webhook
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testChannel("discord")}
                      disabled={testingChannel === "discord" || !config.channels.discord.webhookUrl}
                    >
                      {testingChannel === "discord" ? (
                        "Testando..."
                      ) : testResults.discord === true ? (
                        <><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> OK</>
                      ) : testResults.discord === false ? (
                        <><XCircle className="h-4 w-4 text-red-500 mr-1" /> Falhou</>
                      ) : (
                        <><Send className="h-4 w-4 mr-1" /> Testar</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Email */}
            <Card className={`transition-all ${config.channels.email.enabled ? channelColors.email : "bg-muted/10 border-border/30"}`}>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {channelIcons.email}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Email</h3>
                      <p className="text-sm text-[var(--text-muted)]">Enviar alertas por email (requer RESEND_API_KEY)</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.channels.email.enabled}
                    onCheckedChange={(enabled) => updateChannel("email", { enabled })}
                  />
                </div>
              
              {config.channels.email.enabled && (
                <div className="mt-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Destinatários (separados por vírgula)</Label>
                    <Input
                      placeholder="admin@example.com, ops@example.com"
                      value={config.channels.email.recipients?.join(", ") || ""}
                      onChange={(e) => updateChannel("email", { 
                        recipients: e.target.value.split(",").map((r) => r.trim()).filter(Boolean) 
                      })}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <a
                      href="https://resend.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <ExternalLink aria-hidden="true" className="h-3 w-3" /> Configurar Resend
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testChannel("email")}
                      disabled={testingChannel === "email" || !config.channels.email.recipients?.length}
                    >
                      {testingChannel === "email" ? (
                        "Testando..."
                      ) : testResults.email === true ? (
                        <><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> OK</>
                      ) : testResults.email === false ? (
                        <><XCircle className="h-4 w-4 text-red-500 mr-1" /> Falhou</>
                      ) : (
                        <><Send className="h-4 w-4 mr-1" /> Testar</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Custom Webhook */}
          <TabsContent value="custom" className="space-y-4 mt-4">
            <Card className={`transition-all ${config.channels.customWebhook.enabled ? channelColors.customWebhook : "bg-muted/10 border-border/30"}`}>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {channelIcons.customWebhook}
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Webhook Personalizado</h3>
                      <p className="text-sm text-[var(--text-muted)]">Configure qualquer endpoint HTTP para receber alertas</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.channels.customWebhook.enabled}
                    onCheckedChange={(enabled) => updateChannel("customWebhook", { enabled })}
                  />
                </div>
              
              {config.channels.customWebhook.enabled && (
                <div className="mt-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="md:col-span-3 space-y-1">
                      <Label className="text-xs">URL do Webhook</Label>
                      <Input
                        placeholder="https://your-service.com/webhook"
                        value={config.channels.customWebhook.webhookUrl || ""}
                        onChange={(e) => updateChannel("customWebhook", { webhookUrl: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Método</Label>
                      <select
                        value={config.channels.customWebhook.method || "POST"}
                        onChange={(e) => updateChannel("customWebhook", { method: e.target.value })}
                        className="w-full h-9 rounded-md border border-input bg-background/50 px-3 py-1 text-sm"
                      >
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Headers Personalizados (JSON)</Label>
                    <Input
                      placeholder='{"Authorization": "Bearer xxx", "X-Custom-Header": "value"}'
                      value={JSON.stringify(config.channels.customWebhook.headers || {})}
                      onChange={(e) => {
                        try {
                          const headers = JSON.parse(e.target.value);
                          updateChannel("customWebhook", { headers });
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                      className="bg-background/50 font-mono text-xs"
                    />
                  </div>
                  <div className="p-3 rounded-md bg-muted/20 border border-border/30">
                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>Formato do payload:</strong>
                    </p>
                    <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
{`{
  "type": "failure_rate",
  "title": "Taxa de falha crítica",
  "message": "A taxa de falha ultrapassou 10%",
  "severity": "critical",
  "metadata": { "failureRate": 15.2 },
  "timestamp": "2025-01-01T12:00:00Z"
}`}
                    </pre>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testChannel("customWebhook")}
                      disabled={testingChannel === "customWebhook" || !config.channels.customWebhook.webhookUrl}
                    >
                      {testingChannel === "customWebhook" ? (
                        "Testando..."
                      ) : testResults.customWebhook === true ? (
                        <><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> OK</>
                      ) : testResults.customWebhook === false ? (
                        <><XCircle className="h-4 w-4 text-red-500 mr-1" /> Falhou</>
                      ) : (
                        <><Send className="h-4 w-4 mr-1" /> Testar</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="bg-border/50" />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={saveConfig} disabled={isSaving} className="gap-2">
            <Settings aria-hidden="true" className="h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
