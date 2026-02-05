import { cn } from '@/lib/utils';
import { TestStatus } from '@/stores/testStore';
import { Check, X, Loader2, Minus, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: TestStatus;
  label?: string;
  className?: string;
}

const config = {
  pending: { 
    icon: Minus, 
    label: 'Pending', 
    className: 'bg-muted text-muted-foreground' 
  },
  running: { 
    icon: Loader2, 
    label: 'Running', 
    className: 'bg-primary/20 text-primary animate-pulse' 
  },
  pass: { 
    icon: Check, 
    label: 'Pass', 
    className: 'bg-accent/20 text-accent' 
  },
  fail: { 
    icon: X, 
    label: 'Fail', 
    className: 'bg-destructive/20 text-destructive' 
  },
  partial: { 
    icon: AlertCircle, 
    label: 'Partial', 
    className: 'bg-neon-orange/20 text-neon-orange' 
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const { icon: Icon, label: defaultLabel, className: statusClass } = config[status];

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      statusClass,
      className
    )}>
      <Icon className={cn('w-3.5 h-3.5', status === 'running' && 'animate-spin')} />
      {label || defaultLabel}
    </span>
  );
}
