import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ForecastDay } from '@/hooks/system';
import { AnimatedWeatherIcon } from '@/components/weather/AnimatedWeatherIcon';
import { cn } from '@/lib/utils';

interface WeatherForecastChartProps {
  forecast: ForecastDay[];
  className?: string;
}

export function WeatherForecastChart({ forecast, className }: WeatherForecastChartProps) {
  if (!forecast.length) return null;

  const chartData = forecast.map((day) => ({
    name: day.dayName,
    min: day.tempMin,
    max: day.tempMax,
    avg: Math.round((day.tempMin + day.tempMax) / 2),
  }));

  return (
    <motion.div
      className={cn("space-y-4", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Temperature Chart */}
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(346, 84%, 61%)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(346, 84%, 61%)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'hsl(0, 0%, 70%)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(value) => `${value}°`}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(240, 10%, 15%)',
                border: '1px solid hsl(240, 10%, 25%)',
                borderRadius: '8px',
                color: 'hsl(0, 0%, 93%)',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [
                `${value}°C`,
                name === 'min' ? 'Mínima' : name === 'max' ? 'Máxima' : 'Média',
              ]}
            />
            <Area
              type="monotone"
              dataKey="max"
              stroke="hsl(346, 84%, 61%)"
              strokeWidth={2}
              fill="url(#tempGradient)"
            />
            <Area
              type="monotone"
              dataKey="min"
              stroke="hsl(200, 80%, 50%)"
              strokeWidth={2}
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Day Cards */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {forecast.map((day, index) => (
          <motion.div
            key={day.date.toISOString()}
            className={cn(
              "flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg",
              "bg-kiosk-surface/50 border border-kiosk-surface",
              index === 0 && "bg-kiosk-primary/20 border-kiosk-primary/30"
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="text-xs font-medium text-kiosk-text/85">
              {day.dayName}
            </span>
            <AnimatedWeatherIcon aria-hidden="true" conditionCode={day.conditionCode} size="sm" />
            <div className="flex items-center gap-1 text-xs">
              <span className="text-kiosk-primary font-bold">{day.tempMax}°</span>
              <span className="text-kiosk-text/85">/</span>
              <span className="text-blue-400">{day.tempMin}°</span>
            </div>
            <span className="text-[10px] text-kiosk-text/85">{day.precipitation}%</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
