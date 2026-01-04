import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/themed";
import { Skeleton } from '@/components/ui/skeleton';
import { GitHubContributor } from '@/hooks/system/useGitHubStats';

interface ContributorsChartProps {
  contributors: GitHubContributor[];
  isLoading: boolean;
}

export function ContributorsChart({ contributors, isLoading }: ContributorsChartProps) {
  const contributorData = contributors.slice(0, 8).map(c => ({
    name: c.login,
    contributions: c.contributions,
    avatar: c.avatar_url
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            <Users className="h-5 w-5 text-primary" />
            Top Contribuidores
          </h3>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : contributorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={contributorData} layout="vertical">
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Contribuições']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="contributions" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-10">Sem dados de contribuidores</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
