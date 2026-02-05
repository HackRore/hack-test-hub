import { useState } from 'react';
import { motion } from 'framer-motion';
import { MemoryStick, Play } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

export default function MemoryBenchmark() {
  const setResult = useTestStore((s) => s.setResult);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  const runBenchmark = async () => {
    setRunning(true);
    setProgress(0);
    setScore(null);

    const arrays: number[][] = [];
    const iterations = 50;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      // Allocate and manipulate memory
      const arr = new Array(100000).fill(0).map((_, j) => Math.random() * j);
      arrays.push(arr);
      
      // Random access pattern
      for (let j = 0; j < 10000; j++) {
        const idx = Math.floor(Math.random() * arr.length);
        arr[idx] = arr[idx] * 2;
      }

      setProgress((i / iterations) * 100);
      setMemoryUsage(arrays.length * 100000 * 8 / (1024 * 1024)); // Approx MB
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    const calculatedScore = Math.round(1000000 / duration * 100);

    // Cleanup
    arrays.length = 0;

    setScore(calculatedScore);
    setProgress(100);
    setRunning(false);

    setResult('memory', {
      name: 'Memory',
      status: calculatedScore >= 500 ? 'pass' : calculatedScore >= 200 ? 'partial' : 'fail',
      score: calculatedScore,
      details: `Score: ${calculatedScore}, Peak usage: ${memoryUsage.toFixed(0)}MB`,
    });
  };

  const getScoreRating = (s: number) => {
    if (s >= 800) return { label: 'Excellent', color: 'neon-text-green' };
    if (s >= 500) return { label: 'Good', color: 'neon-text-cyan' };
    if (s >= 300) return { label: 'Average', color: 'neon-text-purple' };
    return { label: 'Below Average', color: 'text-neon-orange' };
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center neon-glow-cyan">
            <MemoryStick className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Memory Benchmark</h1>
            <p className="text-muted-foreground">Test memory allocation and access speed</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-2xl space-y-6">
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
                  {running ? `${memoryUsage.toFixed(0)}MB` : '---'}
                </div>
                <div className="text-lg text-muted-foreground">
                  {running ? 'Memory Usage' : 'Ready'}
                </div>
              </>
            )}
          </div>

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

          <div className="flex justify-center">
            <NeonButton
              variant="cyan"
              size="lg"
              onClick={runBenchmark}
              disabled={running}
              isLoading={running}
            >
              <Play className="w-5 h-5" />
              {running ? 'Running...' : 'Start Memory Test'}
            </NeonButton>
          </div>
        </motion.div>

        {/* System Memory Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card neon-border p-6"
        >
          <h3 className="font-display font-semibold mb-4">System Memory</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Device Memory</span>
              <span className="font-display font-bold neon-text-cyan">
                {(navigator as Navigator & { deviceMemory?: number }).deviceMemory 
                  ? `${(navigator as Navigator & { deviceMemory?: number }).deviceMemory} GB` 
                  : 'Unknown'}
              </span>
            </div>
            {score && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Peak Usage</span>
                <span className="font-medium">{memoryUsage.toFixed(0)} MB</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
