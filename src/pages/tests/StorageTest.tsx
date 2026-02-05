import { useState } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Play } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

export default function StorageTest() {
  const setResult = useTestStore((s) => s.setResult);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    writeSpeed: number;
    readSpeed: number;
    score: number;
  } | null>(null);

  const runBenchmark = async () => {
    setRunning(true);
    setProgress(0);
    setResults(null);

    const testSize = 10 * 1024 * 1024; // 10MB of data
    const chunkSize = 1024 * 1024; // 1MB chunks
    const chunks = testSize / chunkSize;
    const testData = 'x'.repeat(chunkSize);

    // Write test
    const writeStart = performance.now();
    for (let i = 0; i < chunks; i++) {
      try {
        localStorage.setItem(`benchmark_${i}`, testData);
      } catch (e) {
        // Storage quota exceeded, use what we have
        break;
      }
      setProgress((i / chunks) * 50);
    }
    const writeEnd = performance.now();
    const writeTime = writeEnd - writeStart;
    const writeSpeed = (testSize / writeTime) * 1000 / (1024 * 1024); // MB/s

    // Read test
    const readStart = performance.now();
    for (let i = 0; i < chunks; i++) {
      const data = localStorage.getItem(`benchmark_${i}`);
      if (!data) break;
      setProgress(50 + (i / chunks) * 50);
    }
    const readEnd = performance.now();
    const readTime = readEnd - readStart;
    const readSpeed = (testSize / readTime) * 1000 / (1024 * 1024); // MB/s

    // Cleanup
    for (let i = 0; i < chunks; i++) {
      localStorage.removeItem(`benchmark_${i}`);
    }

    const score = Math.round((writeSpeed + readSpeed) * 10);

    setResults({
      writeSpeed,
      readSpeed,
      score,
    });
    setProgress(100);
    setRunning(false);

    setResult('storage', {
      name: 'Storage',
      status: score >= 500 ? 'pass' : score >= 200 ? 'partial' : 'fail',
      score,
      details: `Write: ${writeSpeed.toFixed(1)} MB/s, Read: ${readSpeed.toFixed(1)} MB/s`,
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
            <HardDrive className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Storage Test</h1>
            <p className="text-muted-foreground">Benchmark read/write performance</p>
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
            {results ? (
              <>
                <div className={`font-display text-6xl font-bold ${getScoreRating(results.score).color}`}>
                  {results.score}
                </div>
                <div className="text-lg text-muted-foreground">Performance Score</div>
                <div className={`text-sm ${getScoreRating(results.score).color}`}>
                  {getScoreRating(results.score).label}
                </div>
              </>
            ) : (
              <>
                <div className="font-display text-6xl font-bold text-muted-foreground">
                  ---
                </div>
                <div className="text-lg text-muted-foreground">Ready</div>
              </>
            )}
          </div>

          {running && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {progress < 50 ? 'Writing...' : 'Reading...'}
                </span>
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
              {running ? 'Running...' : 'Start Storage Test'}
            </NeonButton>
          </div>
        </motion.div>

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="glass-card neon-border p-6 text-center">
              <div className="font-display text-3xl font-bold neon-text-purple">
                {results.writeSpeed.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Write Speed (MB/s)</div>
            </div>
            <div className="glass-card neon-border p-6 text-center">
              <div className="font-display text-3xl font-bold neon-text-cyan">
                {results.readSpeed.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Read Speed (MB/s)</div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card neon-border p-6"
        >
          <h3 className="font-display font-semibold mb-4">About This Test</h3>
          <p className="text-sm text-muted-foreground">
            This test uses browser localStorage to benchmark storage performance. 
            Results are relative and may not reflect actual disk speeds, but can help 
            identify slow storage or quota limitations.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
