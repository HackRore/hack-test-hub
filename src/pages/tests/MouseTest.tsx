import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mouse, Trash2 } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

interface ClickEvent {
  x: number;
  y: number;
  button: number;
  timestamp: number;
}

interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

export default function MouseTest() {
  const setResult = useTestStore((s) => s.setResult);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [touches, setTouches] = useState<TouchPoint[]>([]);
  const [scrollDelta, setScrollDelta] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clickCounts, setClickCounts] = useState({ left: 0, middle: 0, right: 0 });

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setClicks((prev) => [...prev.slice(-49), { x, y, button: e.button, timestamp: Date.now() }]);
    
    setClickCounts((prev) => ({
      left: prev.left + (e.button === 0 ? 1 : 0),
      middle: prev.middle + (e.button === 1 ? 1 : 0),
      right: prev.right + (e.button === 2 ? 1 : 0),
    }));

    setResult('mouse', {
      name: 'Mouse & Touch',
      status: 'pass',
      details: 'Input devices working correctly',
    });
  }, [setResult]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    handleClick(e);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    setScrollDelta((prev) => ({
      x: prev.x + e.deltaX,
      y: prev.y + e.deltaY,
    }));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newTouches: TouchPoint[] = [];
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      newTouches.push({
        id: touch.identifier,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }
    setTouches(newTouches);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newTouches: TouchPoint[] = [];
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      newTouches.push({
        id: touch.identifier,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }
    setTouches(newTouches);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setTouches([]);
  }, []);

  const clearData = () => {
    setClicks([]);
    setScrollDelta({ x: 0, y: 0 });
    setClickCounts({ left: 0, middle: 0, right: 0 });
  };

  const getButtonColor = (button: number) => {
    switch (button) {
      case 0: return 'hsl(var(--primary))';
      case 1: return 'hsl(var(--accent))';
      case 2: return 'hsl(var(--secondary))';
      default: return 'hsl(var(--muted-foreground))';
    }
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
            <Mouse className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Mouse & Touch Test</h1>
            <p className="text-muted-foreground">Test clicks, scroll, and multitouch gestures</p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Click Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-card neon-border p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Click & Touch Area</h3>
            <NeonButton variant="orange" size="sm" onClick={clearData}>
              <Trash2 className="w-4 h-4" />
              Clear
            </NeonButton>
          </div>
          
          <div
            ref={canvasRef}
            className="relative w-full h-[400px] bg-muted/30 rounded-lg overflow-hidden cursor-crosshair"
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 grid-pattern opacity-50" />

            {/* Click markers */}
            {clicks.map((click, i) => (
              <motion.div
                key={`${click.timestamp}-${i}`}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1, opacity: 0.6 }}
                className="absolute w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: click.x,
                  top: click.y,
                  backgroundColor: getButtonColor(click.button),
                  boxShadow: `0 0 10px ${getButtonColor(click.button)}`,
                }}
              />
            ))}

            {/* Touch points */}
            {touches.map((touch) => (
              <motion.div
                key={touch.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute w-12 h-12 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none border-2 border-accent"
                style={{
                  left: touch.x,
                  top: touch.y,
                  backgroundColor: 'hsl(var(--accent) / 0.3)',
                  boxShadow: '0 0 20px hsl(var(--accent) / 0.5)',
                }}
              />
            ))}

            {/* Crosshair */}
            <div
              className="absolute w-4 h-4 pointer-events-none"
              style={{
                left: mousePosition.x - 8,
                top: mousePosition.y - 8,
              }}
            >
              <div className="absolute top-1/2 left-0 w-full h-px bg-primary" />
              <div className="absolute left-1/2 top-0 h-full w-px bg-primary" />
            </div>

            {/* Touch count indicator */}
            {touches.length > 0 && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-accent/20 border border-accent/50">
                <span className="font-display font-bold neon-text-green">{touches.length}</span>
                <span className="text-sm text-muted-foreground ml-2">touch points</span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Left Click</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-muted-foreground">Middle Click</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-muted-foreground">Right Click</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="space-y-4">
          {/* Click Counts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card neon-border p-6"
          >
            <h3 className="font-display font-semibold mb-4">Click Counts</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Left Button</span>
                <span className="font-display text-xl font-bold neon-text-cyan">{clickCounts.left}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Middle Button</span>
                <span className="font-display text-xl font-bold neon-text-green">{clickCounts.middle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Right Button</span>
                <span className="font-display text-xl font-bold neon-text-purple">{clickCounts.right}</span>
              </div>
            </div>
          </motion.div>

          {/* Mouse Position */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card neon-border p-6"
          >
            <h3 className="font-display font-semibold mb-4">Cursor Position</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">X</span>
                <span className="font-display text-xl font-bold neon-text-cyan">{Math.round(mousePosition.x)}px</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Y</span>
                <span className="font-display text-xl font-bold neon-text-cyan">{Math.round(mousePosition.y)}px</span>
              </div>
            </div>
          </motion.div>

          {/* Scroll */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card neon-border p-6"
          >
            <h3 className="font-display font-semibold mb-4">Scroll Delta</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Horizontal</span>
                <span className="font-display text-xl font-bold neon-text-purple">{Math.round(scrollDelta.x)}px</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Vertical</span>
                <span className="font-display text-xl font-bold neon-text-purple">{Math.round(scrollDelta.y)}px</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
