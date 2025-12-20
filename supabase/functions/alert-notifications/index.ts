import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertPayload {
  type: 'failure_rate' | 'error_spike' | 'installation_stuck' | 'custom';
  channel: 'email' | 'slack' | 'discord' | 'database';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  metadata?: Record<string, unknown>;
  recipients?: string[]; // For email
}

interface SlackPayload {
  text: string;
  blocks?: Array<{
    type: string;
    text?: { type: string; text: string; emoji?: boolean };
    elements?: Array<{ type: string; text: string }>;
  }>;
}

interface DiscordPayload {
  content: string;
  embeds?: Array<{
    title: string;
    description: string;
    color: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp?: string;
  }>;
}

// Severity to color mapping
const SEVERITY_COLORS = {
  info: 0x3498db,    // Blue
  warning: 0xf39c12, // Orange
  critical: 0xe74c3c, // Red
};

const SEVERITY_EMOJIS = {
  info: 'ℹ️',
  warning: '⚠️',
  critical: '🚨',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: AlertPayload = await req.json();
    const { type, channel, title, message, severity, metadata, recipients } = payload;

    console.log('[alert-notifications] Received alert:', { type, channel, severity });

    const results: Record<string, { success: boolean; error?: string }> = {};

    // Send to specified channel
    switch (channel) {
      case 'email': {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
          results.email = { success: false, error: 'RESEND_API_KEY not configured' };
          break;
        }

        const emailRecipients = recipients || [Deno.env.get('ALERT_EMAIL') || 'admin@example.com'];
        
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'TSiJUKEBOX Alerts <alerts@tsijukebox.com>',
              to: emailRecipients,
              subject: `${SEVERITY_EMOJIS[severity]} [${severity.toUpperCase()}] ${title}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: ${severity === 'critical' ? '#e74c3c' : severity === 'warning' ? '#f39c12' : '#3498db'}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 20px;">${SEVERITY_EMOJIS[severity]} ${title}</h1>
                  </div>
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0 0 16px; color: #333;">${message}</p>
                    ${metadata ? `
                      <div style="background: white; padding: 12px; border-radius: 4px; border: 1px solid #ddd;">
                        <h3 style="margin: 0 0 8px; font-size: 14px; color: #666;">Detalhes:</h3>
                        <pre style="margin: 0; font-size: 12px; overflow-x: auto;">${JSON.stringify(metadata, null, 2)}</pre>
                      </div>
                    ` : ''}
                    <p style="margin: 16px 0 0; font-size: 12px; color: #999;">
                      TSiJUKEBOX Installer Metrics - ${new Date().toISOString()}
                    </p>
                  </div>
                </div>
              `,
            }),
          });

          if (response.ok) {
            results.email = { success: true };
          } else {
            const error = await response.text();
            results.email = { success: false, error };
          }
        } catch (error) {
          results.email = { success: false, error: String(error) };
        }
        break;
      }

      case 'slack': {
        const slackWebhook = Deno.env.get('SLACK_WEBHOOK_URL');
        if (!slackWebhook) {
          results.slack = { success: false, error: 'SLACK_WEBHOOK_URL not configured' };
          break;
        }

        const slackPayload: SlackPayload = {
          text: `${SEVERITY_EMOJIS[severity]} ${title}`,
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: `${SEVERITY_EMOJIS[severity]} ${title}`, emoji: true },
            },
            {
              type: 'section',
              text: { type: 'mrkdwn', text: message },
            },
            ...(metadata ? [{
              type: 'section',
              text: { type: 'mrkdwn', text: `\`\`\`${JSON.stringify(metadata, null, 2)}\`\`\`` },
            }] : []),
            {
              type: 'context',
              elements: [
                { type: 'mrkdwn', text: `*Severity:* ${severity} | *Type:* ${type} | *Time:* ${new Date().toISOString()}` },
              ],
            },
          ],
        };

        try {
          const response = await fetch(slackWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slackPayload),
          });

          if (response.ok) {
            results.slack = { success: true };
          } else {
            const error = await response.text();
            results.slack = { success: false, error };
          }
        } catch (error) {
          results.slack = { success: false, error: String(error) };
        }
        break;
      }

      case 'discord': {
        const discordWebhook = Deno.env.get('DISCORD_WEBHOOK_URL');
        if (!discordWebhook) {
          results.discord = { success: false, error: 'DISCORD_WEBHOOK_URL not configured' };
          break;
        }

        const discordPayload: DiscordPayload = {
          content: `${SEVERITY_EMOJIS[severity]} **${title}**`,
          embeds: [{
            title: title,
            description: message,
            color: SEVERITY_COLORS[severity],
            fields: metadata ? Object.entries(metadata).map(([name, value]) => ({
              name,
              value: String(value),
              inline: true,
            })) : undefined,
            timestamp: new Date().toISOString(),
          }],
        };

        try {
          const response = await fetch(discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload),
          });

          if (response.ok) {
            results.discord = { success: true };
          } else {
            const error = await response.text();
            results.discord = { success: false, error };
          }
        } catch (error) {
          results.discord = { success: false, error: String(error) };
        }
        break;
      }

      case 'database': {
        // Store alert in notifications table
        const { error: insertError } = await supabase
          .from('notifications')
          .insert({
            type: type,
            title: title,
            message: message,
            severity: severity,
            metadata: metadata || {},
            read: false,
          });

        if (insertError) {
          console.error('[alert-notifications] Database insert error:', insertError);
          results.database = { success: false, error: insertError.message };
        } else {
          results.database = { success: true };
        }
        break;
      }
    }

    console.log('[alert-notifications] Results:', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[alert-notifications] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
