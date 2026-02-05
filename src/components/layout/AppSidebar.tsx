import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Shield,
  Camera,
  Mic,
  Volume2,
  Keyboard,
  Monitor,
  Mouse,
  Wifi,
  Cpu,
  HardDrive,
  MemoryStick,
  Gamepad2,
  Music,
  Info,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTestStore, TestStatus } from '@/stores/testStore';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Activity },
  { path: '/permissions', label: 'Permissions', icon: Shield },
  { path: '/webcam', label: 'Webcam', icon: Camera },
  { path: '/microphone', label: 'Microphone', icon: Mic },
  { path: '/speaker', label: 'Speaker', icon: Volume2 },
  { path: '/keyboard', label: 'Keyboard', icon: Keyboard },
  { path: '/display', label: 'Display', icon: Monitor },
  { path: '/mouse', label: 'Mouse & Touch', icon: Mouse },
  { path: '/network', label: 'Network', icon: Wifi },
  { path: '/gpu', label: 'GPU Benchmark', icon: Zap },
  { path: '/cpu', label: 'CPU Benchmark', icon: Cpu },
  { path: '/memory', label: 'Memory', icon: MemoryStick },
  { path: '/storage', label: 'Storage', icon: HardDrive },
  { path: '/controller', label: 'Controller', icon: Gamepad2 },
  { path: '/midi', label: 'MIDI I/O', icon: Music },
  { path: '/system', label: 'System Info', icon: Info },
];

const getStatusColor = (status?: TestStatus) => {
  switch (status) {
    case 'pass': return 'bg-accent';
    case 'fail': return 'bg-destructive';
    case 'partial': return 'bg-neon-orange';
    case 'running': return 'bg-primary animate-pulse';
    default: return 'bg-muted-foreground/30';
  }
};

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const results = useTestStore((s) => s.results);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center neon-glow-cyan">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-sm font-bold neon-text-cyan">
                  HackRore
                </h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Test Suit
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="mini"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-10 h-10 mx-auto rounded-lg bg-primary/20 flex items-center justify-center neon-glow-cyan"
            >
              <Zap className="w-6 h-6 text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const testId = item.path.slice(1) || 'dashboard';
          const status = results[testId]?.status;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary/20 text-primary neon-border'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'neon-text-cyan')} />
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Status indicator */}
              {item.path !== '/' && (
                <div
                  className={cn(
                    'w-2 h-2 rounded-full ml-auto flex-shrink-0',
                    getStatusColor(status)
                  )}
                />
              )}

              {/* Active indicator line */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center text-sidebar-foreground hover:bg-primary/20 hover:text-primary transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] text-muted-foreground text-center"
            >
              Diagnose • Benchmark • Optimize
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
