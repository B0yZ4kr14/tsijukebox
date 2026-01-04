import { motion } from 'framer-motion';
import { Code } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/themed";
import { Skeleton } from '@/components/ui/skeleton';

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  CSS: '#264de4',
  HTML: '#e34c26',
  Python: '#3776ab',
  Shell: '#89e051',
  Dockerfile: '#2496ed',
  JSON: '#000000',
  Markdown: '#083fa1',
  YAML: '#cb171e',
};

function getLanguageColor(lang: string): string {
  return LANGUAGE_COLORS[lang] || `hsl(${Math.random() * 360}, 70%, 50%)`;
}

interface LanguagesChartProps {
  languages: Record<string, number>;
  isLoading: boolean;
}

export function LanguagesChart({ languages, isLoading }: LanguagesChartProps) {
  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
  const languageData = Object.entries(languages).map(([name, bytes]) => ({
    name,
    value: bytes,
    percentage: totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : '0',
    color: getLanguageColor(name)
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            <Code className="h-5 w-5 text-primary" />
            Linguagens
          </h3>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="h-[250px] flex items-center justify-center">
              <Skeleton className="h-40 w-40 rounded-full" />
            </div>
          ) : languageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  labelLine={false}
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${(value / 1024).toFixed(1)} KB`, 'Tamanho']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-10">Sem dados de linguagens</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
