import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { Button } from '@/components/ui/button';
import { Music, Settings } from 'lucide-react';

interface IndexLoadingStateProps {
  message: string;
}

export function IndexLoadingState({ message }: IndexLoadingStateProps) {
  return (
    <KioskLayout>
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <LogoBrand size="xl" variant="metal" showTagline animate />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-16 h-16 rounded-full bg-kiosk-surface/50 flex items-center justify-center mx-auto mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Music className="w-8 h-8 text-kiosk-primary" />
              </motion.div>
            </div>
            <p className="text-kiosk-text/90">{message}</p>
          </motion.div>
        </div>
      </div>
    </KioskLayout>
  );
}

interface IndexErrorStateProps {
  apiUrl: string;
  isDev: boolean;
  errorMessage: string;
  enableDemoModeText: string;
  settingsText: string;
}

export function IndexErrorState({ 
  apiUrl, 
  isDev, 
  errorMessage, 
  enableDemoModeText,
  settingsText,
}: IndexErrorStateProps) {
  return (
    <KioskLayout>
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-kiosk-text">{errorMessage}</h2>
          <p className="text-kiosk-text/90">
            {errorMessage} <br />
            <code className="text-kiosk-primary">{apiUrl}</code>
          </p>
          <p className="text-sm text-kiosk-text/85">
            {isDev ? enableDemoModeText : errorMessage}
          </p>
          <Link to="/settings">
            <Button className="mt-4 bg-kiosk-primary hover:bg-kiosk-primary/90">
              <Settings className="w-4 h-4 mr-2" />
              {settingsText}
            </Button>
          </Link>
        </div>
      </div>
    </KioskLayout>
  );
}
