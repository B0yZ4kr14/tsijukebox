import { motion } from 'framer-motion';
import { Card } from "@/components/ui/themed";
import { Skeleton } from '@/components/ui/skeleton';

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  isLoading: boolean;
}

export function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  isLoading 
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-3xl font-bold">{value.toLocaleString()}</p>
              )}
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
