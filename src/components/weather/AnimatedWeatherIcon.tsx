import { motion } from 'framer-motion';

interface AnimatedWeatherIconProps {
  conditionCode: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
};

// Sun Icon - Rotating rays with pulsing center
function SunIcon({ size }: { size: { width: number; height: number } }) {
  return (
    <svg viewBox="0 0 100 100" width={size.width} height={size.height}>
      {/* Rotating rays */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '50px 50px' }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.line
            key={i}
            x1="50"
            y1="10"
            x2="50"
            y2="22"
            stroke="var(--weather-sun)"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ transform: `rotate(${i * 45}deg)`, transformOrigin: '50px 50px' }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </motion.g>
      {/* Pulsing sun center */}
      <motion.circle
        cx="50"
        cy="50"
        r="20"
        fill="var(--weather-sun)"
        animate={{
          scale: [1, 1.1, 1],
          filter: ['drop-shadow(0 0 8px #FFD93D)', 'drop-shadow(0 0 16px #FFD93D)', 'drop-shadow(0 0 8px #FFD93D)'],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

// Cloud Icon - Floating movement
function CloudIcon({ size, color = '#B0BEC5' }: { size: { width: number; height: number }; color?: string }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      width={size.width}
      height={size.height}
      animate={{ x: [-2, 2, -2] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.path
        d="M25 65 Q25 50 40 50 Q45 35 60 35 Q80 35 80 55 Q90 55 90 65 Q90 75 80 75 L30 75 Q25 75 25 65"
        fill={color}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ transformOrigin: '50px 55px' }}
      />
    </motion.svg>
  );
}

// Rain Icon - Cloud with falling drops
function RainIcon({ size }: { size: { width: number; height: number } }) {
  return (
    <svg viewBox="0 0 100 100" width={size.width} height={size.height}>
      {/* Cloud */}
      <motion.path
        d="M20 55 Q20 42 33 42 Q37 30 50 30 Q68 30 68 47 Q77 47 77 55 Q77 63 68 63 L28 63 Q20 63 20 55"
        fill="var(--weather-cloud-dark)"
        animate={{ x: [-1, 1, -1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Rain drops */}
      {[30, 45, 60].map((x, i) => (
        <motion.ellipse
          key={i}
          cx={x}
          cy={75}
          rx="3"
          ry="6"
          fill="var(--weather-rain)"
          animate={{ 
            y: [0, 15, 0],
            opacity: [0, 1, 0],
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeIn',
          }}
        />
      ))}
    </svg>
  );
}

// Snow Icon - Cloud with falling snowflakes
function SnowIcon({ size }: { size: { width: number; height: number } }) {
  return (
    <svg viewBox="0 0 100 100" width={size.width} height={size.height}>
      {/* Cloud */}
      <motion.path
        d="M20 55 Q20 42 33 42 Q37 30 50 30 Q68 30 68 47 Q77 47 77 55 Q77 63 68 63 L28 63 Q20 63 20 55"
        fill="var(--weather-cloud-medium)"
      />
      {/* Snowflakes */}
      {[28, 42, 56, 70].map((x, i) => (
        <motion.text
          key={i}
          x={x}
          y={80}
          fontSize="12"
          fill="var(--weather-snow)"
          textAnchor="middle"
          animate={{
            y: [70, 90, 70],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
          }}
          style={{ transformOrigin: `${x}px 80px` }}
        >
          ❄
        </motion.text>
      ))}
    </svg>
  );
}

// Thunderstorm Icon - Cloud with lightning
function ThunderIcon({ size }: { size: { width: number; height: number } }) {
  return (
    <svg viewBox="0 0 100 100" width={size.width} height={size.height}>
      {/* Dark cloud */}
      <path
        d="M18 50 Q18 38 30 38 Q34 27 46 27 Q62 27 62 42 Q70 42 70 50 Q70 58 62 58 L26 58 Q18 58 18 50"
        fill="#546E7A"
      />
      {/* Lightning bolt */}
      <motion.path
        d="M42 55 L48 65 L44 65 L50 80 L40 68 L45 68 L38 55 Z"
        fill="#FFC107"
        animate={{
          opacity: [0, 1, 1, 0, 0, 1, 0],
          scale: [0.9, 1.1, 1, 0.9, 0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          times: [0, 0.1, 0.2, 0.3, 0.7, 0.8, 1],
        }}
        style={{ transformOrigin: '44px 67px', filter: 'drop-shadow(0 0 8px #FFC107)' }}
      />
    </svg>
  );
}

// Fog/Mist Icon - Layered lines
function FogIcon({ size }: { size: { width: number; height: number } }) {
  return (
    <svg viewBox="0 0 100 100" width={size.width} height={size.height}>
      {[35, 50, 65].map((y, i) => (
        <motion.line
          key={i}
          x1="20"
          y1={y}
          x2="80"
          y2={y}
          stroke="var(--weather-cloud-medium)"
          strokeWidth="6"
          strokeLinecap="round"
          animate={{
            x: [0, i % 2 === 0 ? 5 : -5, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </svg>
  );
}

// Partial Clouds - Sun with cloud
function PartialCloudsIcon({ size }: { size: { width: number; height: number } }) {
  return (
    <svg viewBox="0 0 100 100" width={size.width} height={size.height}>
      {/* Sun behind */}
      <motion.circle
        cx="65"
        cy="35"
        r="15"
        fill="var(--weather-sun)"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ filter: 'drop-shadow(0 0 8px #FFD93D)' }}
      />
      {/* Cloud in front */}
      <motion.path
        d="M15 60 Q15 48 27 48 Q31 38 43 38 Q58 38 58 52 Q66 52 66 60 Q66 68 58 68 L23 68 Q15 68 15 60"
        fill="#ECEFF1"
        animate={{ x: [-1, 1, -1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

export function AnimatedWeatherIcon({ conditionCode, size = 'md', className }: AnimatedWeatherIconProps) {
  const sizeValue = sizes[size];

  // OpenWeatherMap condition codes
  if (conditionCode >= 200 && conditionCode < 300) {
    return <ThunderIcon aria-hidden="true" size={sizeValue} />;
  }
  if (conditionCode >= 300 && conditionCode < 600) {
    return <RainIcon aria-hidden="true" size={sizeValue} />;
  }
  if (conditionCode >= 600 && conditionCode < 700) {
    return <SnowIcon aria-hidden="true" size={sizeValue} />;
  }
  if (conditionCode >= 700 && conditionCode < 800) {
    return <FogIcon aria-hidden="true" size={sizeValue} />;
  }
  if (conditionCode === 800) {
    return <SunIcon aria-hidden="true" size={sizeValue} />;
  }
  if (conditionCode > 800 && conditionCode < 803) {
    return <PartialCloudsIcon aria-hidden="true" size={sizeValue} />;
  }
  if (conditionCode >= 803) {
    return <CloudIcon aria-hidden="true" size={sizeValue} />;
  }
  
  return <SunIcon aria-hidden="true" size={sizeValue} />;
}
