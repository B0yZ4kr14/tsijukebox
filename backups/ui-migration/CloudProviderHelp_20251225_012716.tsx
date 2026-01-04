import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

type CloudProvider = 'aws' | 'gdrive' | 'dropbox' | 'mega' | 'onedrive' | 'storj';

interface CloudProviderHelpProps {
  provider: CloudProvider;
}

const providerInstructions: Record<CloudProvider, {
  title: string;
  description: string;
  steps: string[];
  fields: { name: string; description: string; example?: string }[];
  securityTips: string[];
  links: { label: string; url: string }[];
}> = {
  aws: {
    title: 'AWS S3 Configuration',
    description: 'Amazon S3 (Simple Storage Service) provides scalable object storage with high durability.',
    steps: [
      '1. Access AWS Console at aws.amazon.com',
      '2. Go to IAM → Users → Create User',
      '3. Select "Programmatic access"',
      '4. Attach policy "AmazonS3FullAccess" (or create a custom policy)',
      '5. Copy Access Key ID and Secret Access Key',
      '6. Go to S3 → Create Bucket',
      '7. Choose a unique bucket name and region',
      '8. Configure bucket permissions (block public access recommended)',
    ],
    fields: [
      { name: 'Access Key ID', description: 'IAM user access key identifier', example: 'AKIAIOSFODNN7EXAMPLE' },
      { name: 'Secret Access Key', description: 'Secret key paired with Access Key ID', example: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' },
      { name: 'Bucket Name', description: 'Unique S3 bucket name (lowercase, no spaces)', example: 'my-backup-bucket-2025' },
      { name: 'Region', description: 'AWS region where bucket is located', example: 'us-east-1, sa-east-1, eu-west-1' },
    ],
    securityTips: [
      '⚠️ Never share your Secret Access Key',
      '🔒 Enable MFA for your AWS account',
      '📋 Use IAM policies with minimum required permissions',
      '🔄 Rotate access keys periodically (every 90 days)',
      '💾 Enable versioning on your S3 bucket',
    ],
    links: [
      { label: 'AWS S3 Documentation', url: 'https://docs.aws.amazon.com/s3/' },
      { label: 'IAM Best Practices', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html' },
    ],
  },
  gdrive: {
    title: 'Google Drive Configuration',
    description: 'Google Drive offers 15GB free storage with OAuth 2.0 authentication.',
    steps: [
      '1. Access Google Cloud Console (console.cloud.google.com)',
      '2. Create a new project or select existing',
      '3. Enable Google Drive API',
      '4. Go to "Credentials" → Create OAuth 2.0 Client',
      '5. Configure OAuth consent screen',
      '6. Download client credentials JSON',
      '7. Click "Authenticate" to complete OAuth flow',
    ],
    fields: [
      { name: 'OAuth Authentication', description: 'Click the authenticate button to authorize access to your Google Drive' },
    ],
    securityTips: [
      '🔒 Only grant access to specific folders, not entire Drive',
      '📋 Review connected apps periodically at myaccount.google.com',
      '🔄 Revoke access when no longer needed',
      '⚠️ Use a dedicated folder for backups',
    ],
    links: [
      { label: 'Google Drive API', url: 'https://developers.google.com/drive' },
      { label: 'OAuth 2.0 Guide', url: 'https://developers.google.com/identity/protocols/oauth2' },
    ],
  },
  dropbox: {
    title: 'Dropbox Configuration',
    description: 'Dropbox provides cloud storage with easy file synchronization and sharing.',
    steps: [
      '1. Access Dropbox App Console (dropbox.com/developers/apps)',
      '2. Click "Create App"',
      '3. Choose "Scoped access" and "Full Dropbox" or "App folder"',
      '4. Name your app and create it',
      '5. In Settings, generate an Access Token (or use OAuth)',
      '6. Click "Authenticate" to complete the authorization',
    ],
    fields: [
      { name: 'OAuth Authentication', description: 'Click the authenticate button to authorize access to your Dropbox' },
    ],
    securityTips: [
      '📁 Consider using "App folder" permission for isolated access',
      '🔒 Regularly review app permissions at dropbox.com/account/connected_apps',
      '⚠️ Don\'t store access tokens in plain text',
      '🔄 Use refresh tokens for long-term access',
    ],
    links: [
      { label: 'Dropbox Developers', url: 'https://www.dropbox.com/developers' },
      { label: 'API Documentation', url: 'https://www.dropbox.com/developers/documentation/http/overview' },
    ],
  },
  mega: {
    title: 'MEGA Configuration',
    description: 'MEGA offers 20GB free encrypted cloud storage with end-to-end encryption.',
    steps: [
      '1. Create a MEGA account at mega.io',
      '2. Verify your email address',
      '3. Use your MEGA email and password here',
      '4. Optionally create an app password for security',
      '5. Your data is encrypted with your password',
    ],
    fields: [
      { name: 'Email', description: 'Your MEGA account email', example: 'your@email.com' },
      { name: 'Password', description: 'Your MEGA account password (used for encryption)', example: '••••••••' },
    ],
    securityTips: [
      '🔐 MEGA uses end-to-end encryption - your password IS the encryption key',
      '⚠️ If you lose your password, your data cannot be recovered',
      '🔒 Consider using an app-specific password',
      '📋 Enable 2FA on your MEGA account',
      '💾 MEGA passwords are never stored on their servers',
    ],
    links: [
      { label: 'MEGA Website', url: 'https://mega.io' },
      { label: 'MEGA Security', url: 'https://mega.io/security' },
    ],
  },
  onedrive: {
    title: 'OneDrive Configuration',
    description: 'Microsoft OneDrive integrates with Microsoft 365 and offers 5GB free storage.',
    steps: [
      '1. Access Azure Portal (portal.azure.com)',
      '2. Go to Azure Active Directory → App registrations',
      '3. Create new registration',
      '4. Add redirect URI: http://localhost (for local apps)',
      '5. Under API permissions, add Microsoft Graph → Files.ReadWrite',
      '6. Create a client secret (or use certificate)',
      '7. Click "Authenticate" to complete OAuth flow',
    ],
    fields: [
      { name: 'OAuth Authentication', description: 'Click the authenticate button to authorize access via Microsoft Graph API' },
    ],
    securityTips: [
      '🔒 Use minimum required Graph API permissions',
      '📋 Set appropriate token lifetimes',
      '🔄 Client secrets expire - plan for rotation',
      '⚠️ Consider using certificate authentication for production',
      '📁 Create a dedicated backup folder in OneDrive',
    ],
    links: [
      { label: 'Microsoft Graph', url: 'https://developer.microsoft.com/graph' },
      { label: 'OneDrive API', url: 'https://learn.microsoft.com/onedrive/developer/' },
    ],
  },
  storj: {
    title: 'Storj Configuration',
    description: 'Storj is a decentralized cloud storage network with S3 compatibility.',
    steps: [
      '1. Create account at storj.io',
      '2. Create a new project',
      '3. Go to "Access" section',
      '4. Create an Access Grant (recommended) or S3 Credentials',
      '5. For Access Grant: Copy the generated token',
      '6. For S3: Note Access Key, Secret Key, and Endpoint',
    ],
    fields: [
      { name: 'Access Grant', description: 'Storj access grant token with encoded permissions', example: '1DZZn8j6EdQaTUvnzYz...' },
    ],
    securityTips: [
      '🔐 Storj data is encrypted and distributed across nodes',
      '📋 Access grants contain encryption keys - keep them secure',
      '🔒 Create grants with limited bucket access when possible',
      '⚠️ Access grants cannot be recovered if lost',
      '💾 Consider creating read-only grants for verification',
    ],
    links: [
      { label: 'Storj Documentation', url: 'https://docs.storj.io' },
      { label: 'S3 Compatibility', url: 'https://docs.storj.io/dcs/api/s3/' },
    ],
  },
};

export function CloudProviderHelp({ provider }: CloudProviderHelpProps) {
  const info = providerInstructions[provider];
  
  if (!info) return null;

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-cyan-500/20"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Click for detailed instructions
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="max-w-2xl bg-kiosk-surface border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            {info.title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Description */}
            <p className="text-kiosk-text/80 text-sm">{info.description}</p>

            {/* Steps */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-section-cyan">📋 Setup Steps</h3>
              <div className="bg-kiosk-bg/50 rounded-lg p-3 border border-kiosk-border">
                {info.steps.map((step, idx) => (
                  <p key={idx} className="text-sm text-white/90 py-1">{step}</p>
                ))}
              </div>
            </div>

            {/* Required Fields */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-section-cyan">🔧 Required Fields</h3>
              <div className="space-y-2">
                {info.fields.map((field, idx) => (
                  <div key={idx} className="bg-kiosk-bg/50 rounded-lg p-3 border border-kiosk-border">
                    <p className="text-sm font-medium text-cyan-400">{field.name}</p>
                    <p className="text-xs text-kiosk-text/90 mt-1">{field.description}</p>
                    {field.example && (
                      <code className="text-xs text-green-400 mt-1 block font-mono bg-black/30 px-2 py-1 rounded">
                        Example: {field.example}
                      </code>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Security Tips */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-label-orange">🔒 Security Tips</h3>
              <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/30">
                {info.securityTips.map((tip, idx) => (
                  <p key={idx} className="text-sm text-white/90 py-1">{tip}</p>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-section-cyan">🔗 Documentation</h3>
              <div className="flex flex-wrap gap-2">
                {info.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}