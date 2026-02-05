import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  Zap,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { useTestStore } from '@/stores/testStore';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { NeonButton } from '@/components/ui/NeonButton';

const testCategories = [
  {
    title: 'Permissions & Input',
    tests: [
      { id: 'permissions', name: 'Permissions', icon: Shield, path: '/permissions', description: 'Camera, mic & notifications' },
      { id: 'webcam', name: 'Webcam', icon: Camera, path: '/webcam', description: 'Video capture & resolution' },
      { id: 'microphone', name: 'Microphone', icon: Mic, path: '/microphone', description: 'Audio input & levels' },
      { id: 'speaker', name: 'Speaker', icon: Volume2, path: '/speaker', description: 'Audio output & panning' },
    ],
  },
  {
    title: 'Controls & Display',
    tests: [
      { id: 'keyboard', name: 'Keyboard', icon: Keyboard, path: '/keyboard', description: 'Key detection & rollover' },
      { id: 'display', name: 'Display', icon: Monitor, path: '/display', description: 'Colors & backlight bleed' },
      { id: 'mouse', name: 'Mouse & Touch', icon: Mouse, path: '/mouse', description: 'Clicks, scroll & gestures' },
      { id: 'controller', name: 'Controller', icon: Gamepad2, path: '/controller', description: 'Gamepad input & vibration' },
    ],
  },
  {
    title: 'Performance',
    tests: [
      { id: 'cpu', name: 'CPU Benchmark', icon: Cpu, path: '/cpu', description: 'Processing performance' },
      { id: 'gpu', name: 'GPU Benchmark', icon: Zap, path: '/gpu', description: 'Graphics rendering' },
      { id: 'memory', name: 'Memory', icon: MemoryStick, path: '/memory', description: 'RAM performance' },
      { id: 'storage', name: 'Storage', icon: HardDrive, path: '/storage', description: 'Read/write speed' },
    ],
  },
  {
    title: 'Connectivity & Info',
    tests: [
      { id: 'network', name: 'Network', icon: Wifi, path: '/network', description: 'Speed & latency' },
      { id: 'midi', name: 'MIDI I/O', icon: Music, path: '/midi', description: 'MIDI device testing' },
      { id: 'system', name: 'System Info', icon: Info, path: '/system', description: 'Device & browser info' },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { results, getHealthScore, clearResults } = useTestStore();
  const healthScore = getHealthScore();
  const testsCompleted = Object.keys(results).length;
  const totalTests = 15;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
              <span className="neon-text-cyan">HackRore</span>{' '}
              <span className="text-foreground">Test Suit</span>
            </h1>
            <p className="text-muted-foreground">
              Diagnose, Benchmark, and Optimize Your Devices Instantly.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <NeonButton variant="purple" onClick={clearResults}>
              Clear Results
            </NeonButton>
            <Link to="/system">
              <NeonButton variant="green">
                <Activity className="w-4 h-4" />
                System Report
              </NeonButton>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Health Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card neon-border p-6 lg:p-8 mb-8"
      >
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="relative">
            <ProgressRing progress={healthScore} size={140} strokeWidth={10} />
          </div>
          
          <div className="flex-1 text-center lg:text-left">
            <h2 className="font-display text-2xl font-bold mb-2">System Health Score</h2>
            <p className="text-muted-foreground mb-4">
              {testsCompleted === 0
                ? 'Run tests to calculate your system health score'
                : `Based on ${testsCompleted} of ${totalTests} tests completed`}
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <StatusBadge status="pass" label={`${Object.values(results).filter(r => r.status === 'pass').length} Passed`} />
              <StatusBadge status="fail" label={`${Object.values(results).filter(r => r.status === 'fail').length} Failed`} />
              <StatusBadge status="pending" label={`${totalTests - testsCompleted} Pending`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="glass-card p-4 rounded-lg">
              <div className="font-display text-2xl font-bold neon-text-cyan">{testsCompleted}</div>
              <div className="text-xs text-muted-foreground">Tests Run</div>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="font-display text-2xl font-bold neon-text-green">{totalTests - testsCompleted}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Test Categories */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {testCategories.map((category) => (
          <motion.section key={category.title} variants={itemVariants}>
            <h2 className="font-display text-lg font-semibold mb-4 text-muted-foreground">
              {category.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.tests.map((test) => {
                const Icon = test.icon;
                const result = results[test.id];
                const status = result?.status || 'pending';

                return (
                  <Link key={test.id} to={test.path}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="glass-card neon-border p-5 h-full group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center transition-all
                          ${status === 'pass' ? 'bg-accent/20' : ''}
                          ${status === 'fail' ? 'bg-destructive/20' : ''}
                          ${status === 'running' ? 'bg-primary/20' : ''}
                          ${status === 'pending' ? 'bg-muted group-hover:bg-primary/20' : ''}
                        `}>
                          <Icon className={`
                            w-5 h-5 transition-colors
                            ${status === 'pass' ? 'text-accent' : ''}
                            ${status === 'fail' ? 'text-destructive' : ''}
                            ${status === 'running' ? 'text-primary' : ''}
                            ${status === 'pending' ? 'text-muted-foreground group-hover:text-primary' : ''}
                          `} />
                        </div>
                        <StatusBadge status={status} />
                      </div>
                      
                      <h3 className="font-display font-semibold mb-1">{test.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                      
                      <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Run Test <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        ))}
      </motion.div>
    </div>
  );
}
