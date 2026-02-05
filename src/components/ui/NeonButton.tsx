import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeonButtonProps {
  variant?: 'cyan' | 'purple' | 'green' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const variants = {
  cyan: 'bg-primary/20 text-primary border-primary/50 hover:bg-primary/30 hover:border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]',
  purple: 'bg-secondary/20 text-secondary border-secondary/50 hover:bg-secondary/30 hover:border-secondary shadow-[0_0_20px_hsl(var(--secondary)/0.3)]',
  green: 'bg-accent/20 text-accent border-accent/50 hover:bg-accent/30 hover:border-accent shadow-[0_0_20px_hsl(var(--accent)/0.3)]',
  orange: 'bg-neon-orange/20 text-neon-orange border-neon-orange/50 hover:bg-neon-orange/30 hover:border-neon-orange shadow-[0_0_20px_hsl(var(--neon-orange)/0.3)]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant = 'cyan', size = 'md', isLoading, children, disabled, onClick, type = 'button' }, ref) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 rounded-lg border font-display font-medium transition-all duration-300',
          variants[variant],
          sizes[size],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        {isLoading && (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

NeonButton.displayName = 'NeonButton';
