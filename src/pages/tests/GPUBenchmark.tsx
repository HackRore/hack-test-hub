import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, Play, Square } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

export default function GPUBenchmark() {
  const setResult = useTestStore((s) => s.setResult);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const fpsHistoryRef = useRef<number[]>([]);

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return null;

    // Vertex shader
    const vsSource = `
      attribute vec4 aVertexPosition;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform float uTime;
      void main() {
        vec4 pos = aVertexPosition;
        pos.x += sin(uTime + pos.y * 2.0) * 0.1;
        pos.y += cos(uTime + pos.x * 2.0) * 0.1;
        gl_Position = uProjectionMatrix * uModelViewMatrix * pos;
      }
    `;

    // Fragment shader
    const fsSource = `
      precision mediump float;
      uniform float uTime;
      void main() {
        vec3 color = vec3(
          sin(uTime) * 0.5 + 0.5,
          cos(uTime * 0.7) * 0.5 + 0.5,
          sin(uTime * 1.3) * 0.5 + 0.5
        );
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Compile shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Create buffers with many vertices for GPU load
    const positions: number[] = [];
    const gridSize = 100;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = (i / gridSize - 0.5) * 2;
        const y = (j / gridSize - 0.5) * 2;
        positions.push(x, y, 0, 1);
        positions.push(x + 0.02, y, 0, 1);
        positions.push(x, y + 0.02, 0, 1);
      }
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const vertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    gl.vertexAttribPointer(vertexPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    return {
      gl,
      program,
      vertexCount: positions.length / 4,
    };
  }, []);

  const runBenchmark = useCallback(() => {
    const webgl = initWebGL();
    if (!webgl) return;

    const { gl, program, vertexCount } = webgl;
    const duration = 30000;
    startTimeRef.current = performance.now();
    frameCountRef.current = 0;
    lastTimeRef.current = performance.now();
    fpsHistoryRef.current = [];
    setFpsHistory([]);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');
    const uModelViewMatrix = gl.getUniformLocation(program, 'uModelViewMatrix');

    const projectionMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
    const modelViewMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, -3, 1,
    ]);

    gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

    const render = (time: number) => {
      const elapsed = time - startTimeRef.current;
      if (elapsed >= duration) {
        const finalAvg = Math.round(
          fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
        );
        setAvgFps(finalAvg);
        setRunning(false);
        setProgress(100);

        setResult('gpu', {
          name: 'GPU Benchmark',
          status: finalAvg >= 50 ? 'pass' : finalAvg >= 30 ? 'partial' : 'fail',
          score: finalAvg,
          details: `Average ${finalAvg} FPS over 30 seconds`,
        });
        return;
      }

      // Calculate FPS
      const delta = time - lastTimeRef.current;
      frameCountRef.current++;
      
      if (delta >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / delta);
        setFps(currentFps);
        fpsHistoryRef.current.push(currentFps);
        setFpsHistory([...fpsHistoryRef.current]);
        frameCountRef.current = 0;
        lastTimeRef.current = time;
      }

      setProgress((elapsed / duration) * 100);

      // Render
      gl.clearColor(0.05, 0.05, 0.1, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(uTime, time * 0.001);

      // Draw multiple times for GPU stress
      for (let i = 0; i < 10; i++) {
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);
  }, [initWebGL, setResult]);

  const startBenchmark = () => {
    setRunning(true);
    setFps(0);
    setAvgFps(0);
    setProgress(0);
    runBenchmark();
  };

  const stopBenchmark = () => {
    cancelAnimationFrame(animationRef.current);
    setRunning(false);
    if (fpsHistoryRef.current.length > 0) {
      const avg = Math.round(
        fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
      );
      setAvgFps(avg);
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const getFpsRating = (f: number) => {
    if (f >= 60) return { label: 'Excellent', color: 'neon-text-green' };
    if (f >= 45) return { label: 'Good', color: 'neon-text-cyan' };
    if (f >= 30) return { label: 'Acceptable', color: 'neon-text-purple' };
    if (f >= 20) return { label: 'Low', color: 'text-neon-orange' };
    return { label: 'Very Low', color: 'text-destructive' };
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
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">GPU Benchmark</h1>
            <p className="text-muted-foreground">WebGL rendering stress test</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-3xl space-y-6">
        {/* Render Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card neon-border p-4"
        >
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full rounded-lg bg-black"
          />
          
          {running && (
            <div className="absolute top-8 left-8 bg-black/70 px-3 py-2 rounded-lg">
              <span className="font-display text-2xl font-bold neon-text-cyan">{fps}</span>
              <span className="text-sm text-muted-foreground ml-2">FPS</span>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card neon-border p-4 text-center"
          >
            <div className={`font-display text-3xl font-bold ${running ? 'neon-text-cyan' : 'text-muted-foreground'}`}>
              {fps || '---'}
            </div>
            <div className="text-sm text-muted-foreground">Current FPS</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card neon-border p-4 text-center"
          >
            <div className={`font-display text-3xl font-bold ${avgFps ? getFpsRating(avgFps).color : 'text-muted-foreground'}`}>
              {avgFps || '---'}
            </div>
            <div className="text-sm text-muted-foreground">Average FPS</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card neon-border p-4 text-center"
          >
            <div className="font-display text-3xl font-bold neon-text-purple">
              {Math.round(progress)}%
            </div>
            <div className="text-sm text-muted-foreground">Progress</div>
          </motion.div>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card neon-border p-6"
        >
          <div className="flex justify-center gap-4">
            {!running ? (
              <NeonButton variant="cyan" size="lg" onClick={startBenchmark}>
                <Play className="w-5 h-5" />
                Start GPU Benchmark (30s)
              </NeonButton>
            ) : (
              <NeonButton variant="orange" size="lg" onClick={stopBenchmark}>
                <Square className="w-5 h-5" />
                Stop
              </NeonButton>
            )}
          </div>

          {running && (
            <div className="mt-6">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* FPS History */}
        {fpsHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card neon-border p-6"
          >
            <h3 className="font-display font-semibold mb-4">FPS Over Time</h3>
            <div className="flex gap-1 h-20 items-end">
              {fpsHistory.map((f, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all"
                  style={{
                    height: `${Math.min(100, (f / 60) * 100)}%`,
                    background: f >= 50 ? 'hsl(var(--accent))' : f >= 30 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
