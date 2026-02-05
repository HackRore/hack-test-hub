import { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Palette, Sun, Grid, Maximize } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

type DisplayMode = 'colors' | 'patterns' | 'backlight' | 'flicker' | null;

const SOLID_COLORS = [
  { name: 'Red', color: '#FF0000' },
  { name: 'Green', color: '#00FF00' },
  { name: 'Blue', color: '#0000FF' },
  { name: 'White', color: '#FFFFFF' },
  { name: 'Black', color: '#000000' },
  { name: 'Yellow', color: '#FFFF00' },
  { name: 'Cyan', color: '#00FFFF' },
  { name: 'Magenta', color: '#FF00FF' },
];

const PATTERNS = [
  { name: 'Checkerboard', pattern: 'checkerboard' },
  { name: 'Horizontal Lines', pattern: 'h-lines' },
  { name: 'Vertical Lines', pattern: 'v-lines' },
  { name: 'Gradient', pattern: 'gradient' },
];

export default function DisplayTest() {
  const setResult = useTestStore((s) => s.setResult);
  const [mode, setMode] = useState<DisplayMode>(null);
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [currentPattern, setCurrentPattern] = useState('checkerboard');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      console.error('Fullscreen not available');
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    setIsFullscreen(false);
    setMode(null);
  };

  const startColorTest = (color: string) => {
    setCurrentColor(color);
    setMode('colors');
    enterFullscreen();
    setResult('display', {
      name: 'Display',
      status: 'pass',
      details: 'Display test completed',
    });
  };

  const startPatternTest = (pattern: string) => {
    setCurrentPattern(pattern);
    setMode('patterns');
    enterFullscreen();
  };

  const startBacklightTest = () => {
    setMode('backlight');
    enterFullscreen();
  };

  const startFlickerTest = () => {
    setMode('flicker');
    enterFullscreen();
  };

  const getPatternStyle = () => {
    switch (currentPattern) {
      case 'checkerboard':
        return {
          backgroundImage: `
            linear-gradient(45deg, #000 25%, transparent 25%),
            linear-gradient(-45deg, #000 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #000 75%),
            linear-gradient(-45deg, transparent 75%, #000 75%)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
          backgroundColor: '#fff',
        };
      case 'h-lines':
        return {
          backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 2px, #fff 2px, #fff 4px)',
        };
      case 'v-lines':
        return {
          backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px)',
        };
      case 'gradient':
        return {
          background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
        };
      default:
        return {};
    }
  };

  // Fullscreen overlay
  if (mode && isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 cursor-pointer"
        onClick={exitFullscreen}
        style={
          mode === 'colors'
            ? { backgroundColor: currentColor }
            : mode === 'patterns'
            ? getPatternStyle()
            : mode === 'backlight'
            ? { backgroundColor: '#000000' }
            : mode === 'flicker'
            ? { animation: 'flicker 0.016s infinite' }
            : {}
        }
      >
        <style>{`
          @keyframes flicker {
            0%, 50% { background-color: #000; }
            51%, 100% { background-color: #fff; }
          }
        `}</style>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium px-4 py-2 rounded-lg bg-black/50 text-white backdrop-blur-sm">
          Click anywhere to exit
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center neon-glow-cyan">
            <Monitor className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Display Test</h1>
            <p className="text-muted-foreground">Test colors, patterns, and backlight bleed</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl space-y-6">
        {/* Solid Colors */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card neon-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">Solid Colors</h3>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {SOLID_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => startColorTest(c.color)}
                className="aspect-square rounded-lg border-2 border-border hover:border-primary transition-colors group relative overflow-hidden"
                style={{ backgroundColor: c.color }}
              >
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Patterns */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card neon-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Grid className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">Test Patterns</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PATTERNS.map((p) => (
              <button
                key={p.pattern}
                onClick={() => startPatternTest(p.pattern)}
                className="aspect-video rounded-lg border-2 border-border hover:border-primary transition-colors overflow-hidden relative group"
              >
                <div
                  className="absolute inset-0"
                  style={
                    p.pattern === 'checkerboard'
                      ? {
                          backgroundImage: `
                            linear-gradient(45deg, #000 25%, transparent 25%),
                            linear-gradient(-45deg, #000 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #000 75%),
                            linear-gradient(-45deg, transparent 75%, #000 75%)
                          `,
                          backgroundSize: '20px 20px',
                          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                          backgroundColor: '#fff',
                        }
                      : p.pattern === 'h-lines'
                      ? { backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 2px, #fff 2px, #fff 4px)' }
                      : p.pattern === 'v-lines'
                      ? { backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px)' }
                      : { background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' }
                  }
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">{p.name}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Special Tests */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card neon-border p-6"
        >
          <h3 className="font-display font-semibold mb-4">Special Tests</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <NeonButton
              variant="purple"
              className="w-full justify-start"
              onClick={startBacklightTest}
            >
              <Sun className="w-4 h-4" />
              <div className="text-left">
                <div className="font-semibold">Backlight Bleed Test</div>
                <div className="text-xs opacity-70">Pure black at 100% brightness</div>
              </div>
            </NeonButton>
            
            <NeonButton
              variant="orange"
              className="w-full justify-start"
              onClick={startFlickerTest}
            >
              <Maximize className="w-4 h-4" />
              <div className="text-left">
                <div className="font-semibold">Flicker Test</div>
                <div className="text-xs opacity-70">High-frequency pattern</div>
              </div>
            </NeonButton>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card neon-border p-6"
        >
          <h3 className="font-display font-semibold mb-4">How to Use</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong className="text-foreground">Solid Colors:</strong> Check for dead pixels and color accuracy</li>
            <li>• <strong className="text-foreground">Patterns:</strong> Test for uniformity and response time issues</li>
            <li>• <strong className="text-foreground">Backlight Bleed:</strong> View in a dark room to check for light leaking around edges</li>
            <li>• <strong className="text-foreground">Flicker Test:</strong> If you see bands moving across the screen, your display may have PWM flicker</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
