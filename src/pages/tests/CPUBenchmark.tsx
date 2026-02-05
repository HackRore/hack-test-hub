import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Play, Square } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

export default function CPUBenchmark() {
  const setResult = useTestStore((s) => s.setResult);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [temperature, setTemperature] = useState<string>('N/A');
  const workerRef = useRef<Worker | null>(null);
  const abortRef = useRef(false);

  const runBenchmark = async () => {
    setRunning(true);
    setProgress(0);
    setScore(null);
    setScores([]);
    abortRef.current = false;

    const duration = 30000; // 30 seconds
    const startTime = performance.now();
    const iterationScores: number[] = [];

    const runIteration = () => {
      const iterStart = performance.now();
      
      // CPU-intensive calculation
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
      }
      
      return performance.now() - iterStart;
    };

    const benchmark = async () => {
      while (performance.now() - startTime < duration && !abortRef.current) {
        const iterTime = runIteration();
        const iterScore = Math.round(1000 / iterTime * 100);
        iterationScores.push(iterScore);
        setScores([...iterationScores]);
        
        const elapsed = performance.now() - startTime;
        setProgress(Math.min(100, (elapsed / duration) * 100));
        
        // Yield to UI
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      if (!abortRef.current) {
        const avgScore = Math.round(
          iterationScores.reduce((a, b) => a + b, 0) / iterationScores.length
        );
        setScore(avgScore);
        
        // Check for throttling
        const firstHalf = iterationScores.slice(0, Math.floor(iterationScores.length / 2));
        const secondHalf = iterationScores.slice(Math.floor(iterationScores.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const throttling = ((firstAvg - secondAvg) / firstAvg) * 100;

        setResult('cpu', {
          name: 'CPU Benchmark',
          status: throttling < 10 ? 'pass' : throttling < 25 ? 'partial' : 'fail',
          score: avgScore,
          details: throttling > 10 
            ? `Throttling detected: ${throttling.toFixed(1)}% performance drop`
            : 'No significant throttling detected',
        });
      }

      setRunning(false);
      setProgress(100);
    };

    benchmark();
  };

  const stopBenchmark = () => {
    abortRef.current = true;
    setRunning(false);
  };

  const getScoreRating = (s: number) => {
    if (s >= 800) return { label: 'Excellent', color: 'neon-text-green' };
    if (s >= 500) return { label: 'Good', color: 'neon-text-cyan' };
    if (s >= 300) return { label: 'Average', color: 'neon-text-purple' };
    if (s >= 150) return { label: 'Below Average', color: 'text-neon-orange' };
    return { label: 'Poor', color: 'text-destructive' };
  };

  // Mini chart
  const maxScore = Math.max(...scores, 1);
  const chartHeight = 100;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center neon-glow-cyan">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">CPU Benchmark</h1>
            <p className="text-muted-foreground">Test sustained performance and thermal throttling</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-3xl space-y-6">
        {/* Main Score Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card neon-border p-6"
        >
          <div className="text-center mb-6">
            {score !== null ? (
              <>
                <div className={`font-display text-6xl font-bold ${getScoreRating(score).color}`}>
                  {score}
                </div>
                <div className="text-lg text-muted-foreground">Performance Score</div>
                <div className={`text-sm ${getScoreRating(score).color}`}>
                  {getScoreRating(score).label}
                </div>
              </>
            ) : (
              <>
                <div className="font-display text-6xl font-bold text-muted-foreground">
                  {running ? Math.round(scores[scores.length - 1] || 0) : '---'}
                </div>
                <div className="text-lg text-muted-foreground">
                  {running ? 'Current Score' : 'Ready'}
                </div>
              </>
            )}
          </div>

          {/* Progress */}
          {running && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-display neon-text-cyan">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!running ? (
              <NeonButton variant="cyan" size="lg" onClick={runBenchmark}>
                <Play className="w-5 h-5" />
                Start Benchmark (30s)
              </NeonButton>
            ) : (
              <NeonButton variant="orange" size="lg" onClick={stopBenchmark}>
                <Square className="w-5 h-5" />
                Stop
              </NeonButton>
            )}
          </div>
        </motion.div>

        {/* Performance Chart */}
        {scores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card neon-border p-6"
          >
            <h3 className="font-display font-semibold mb-4">Performance Over Time</h3>
            <div className="relative h-[100px] bg-muted/30 rounded-lg overflow-hidden">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={scores.map((s, i) => {
                    const x = (i / (scores.length - 1)) * 100;
                    const y = 100 - (s / maxScore) * 100;
                    return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                  }).join(' ')}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={`M 0% 100% ` + scores.map((s, i) => {
                    const x = (i / (scores.length - 1)) * 100;
                    const y = 100 - (s / maxScore) * 100;
                    return `L ${x}% ${y}%`;
                  }).join(' ') + ` L 100% 100% Z`}
                  fill="url(#scoreGradient)"
                />
              </svg>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Start</span>
              <span>End ({scores.length} samples)</span>
            </div>
          </motion.div>
        )}

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card neon-border p-6"
        >
          <h3 className="font-display font-semibold mb-4">System Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">CPU Cores</span>
              <span className="font-display font-bold neon-text-cyan">
                {navigator.hardwareConcurrency || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Iterations</span>
              <span className="font-medium">{scores.length}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
