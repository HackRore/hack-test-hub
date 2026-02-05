import { motion } from 'framer-motion';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  className 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const getColor = () => {
    if (progress >= 80) return 'hsl(var(--accent))';
    if (progress >= 50) return 'hsl(var(--primary))';
    if (progress >= 30) return 'hsl(var(--neon-orange))';
    return 'hsl(var(--destructive))';
  };

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 6px ${getColor()})`,
          }}
        />
      </svg>
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ width: size, height: size, marginTop: -size }}
      >
        <span className="font-display text-2xl font-bold neon-text-cyan">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
