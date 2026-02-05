import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TestStatus } from '@/stores/testStore';

interface TestCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status?: TestStatus;
  score?: number;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const statusConfig = {
  pending: { label: 'Not Tested', color: 'text-muted-foreground', bg: 'bg-muted' },
  running: { label: 'Running...', color: 'text-primary', bg: 'bg-primary/20' },
  pass: { label: 'Passed', color: 'text-accent', bg: 'bg-accent/20' },
  fail: { label: 'Failed', color: 'text-destructive', bg: 'bg-destructive/20' },
  partial: { label: 'Partial', color: 'text-neon-orange', bg: 'bg-neon-orange/20' },
};

export function TestCard({
  title,
  description,
  icon: Icon,
  status = 'pending',
  score,
  onClick,
  children,
  className,
}: TestCardProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'glass-card neon-border p-6 cursor-pointer group',
        status === 'running' && 'animate-pulse-glow',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
            status === 'pass' && 'bg-accent/20 neon-glow-green',
            status === 'fail' && 'bg-destructive/20',
            status === 'running' && 'bg-primary/20 neon-glow-cyan',
            (status === 'pending' || status === 'partial') && 'bg-muted'
          )}>
            <Icon className={cn(
              'w-6 h-6 transition-colors',
              status === 'pass' && 'text-accent',
              status === 'fail' && 'text-destructive',
              status === 'running' && 'text-primary',
              (status === 'pending' || status === 'partial') && 'text-muted-foreground group-hover:text-primary'
            )} />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={cn(
            'px-2 py-1 rounded-md text-xs font-medium',
            config.bg,
            config.color
          )}>
            {config.label}
          </span>
          {score !== undefined && (
            <span className="font-display text-2xl font-bold neon-text-cyan">
              {score}
            </span>
          )}
        </div>
      </div>

      {children && (
        <div className="mt-4 pt-4 border-t border-border/50">
          {children}
        </div>
      )}
    </motion.div>
  );
}
