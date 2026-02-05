import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Keyboard as KeyboardIcon, Trash2, AlertTriangle } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

interface KeyPress {
  key: string;
  code: string;
  timestamp: number;
}

const KEYBOARD_LAYOUT = [
  ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
  ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
  ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
  ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'MetaRight', 'ContextMenu', 'ControlRight'],
];

const KEY_LABELS: Record<string, string> = {
  Escape: 'Esc', Backquote: '`', Backspace: '⌫', Tab: 'Tab',
  BracketLeft: '[', BracketRight: ']', Backslash: '\\', CapsLock: 'Caps',
  Semicolon: ';', Quote: "'", Enter: 'Enter', ShiftLeft: 'Shift', ShiftRight: 'Shift',
  Comma: ',', Period: '.', Slash: '/', ControlLeft: 'Ctrl', ControlRight: 'Ctrl',
  MetaLeft: '⌘', MetaRight: '⌘', AltLeft: 'Alt', AltRight: 'Alt',
  Space: 'Space', ContextMenu: 'Menu', Minus: '-', Equal: '=',
};

export default function KeyboardTest() {
  const setResult = useTestStore((s) => s.setResult);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  const [keyHistory, setKeyHistory] = useState<KeyPress[]>([]);
  const [simultaneousCount, setSimultaneousCount] = useState(0);
  const [maxSimultaneous, setMaxSimultaneous] = useState(0);
  const [ghostingDetected, setGhostingDetected] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    
    setPressedKeys((prev) => {
      const newSet = new Set(prev);
      newSet.add(e.code);
      
      const count = newSet.size;
      setSimultaneousCount(count);
      if (count > maxSimultaneous) {
        setMaxSimultaneous(count);
      }
      
      return newSet;
    });
    
    setTestedKeys((prev) => new Set(prev).add(e.code));
    
    setKeyHistory((prev) => [
      { key: e.key, code: e.code, timestamp: Date.now() },
      ...prev.slice(0, 49),
    ]);
  }, [maxSimultaneous]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    setPressedKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(e.code);
      setSimultaneousCount(newSet.size);
      return newSet;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const totalKeys = KEYBOARD_LAYOUT.flat().length;
    const tested = testedKeys.size;
    
    setResult('keyboard', {
      name: 'Keyboard',
      status: tested > 0 ? 'pass' : 'pending',
      details: `${tested}/${totalKeys} keys tested, ${maxSimultaneous}-key rollover`,
    });
  }, [testedKeys.size, maxSimultaneous, setResult]);

  const clearHistory = () => {
    setKeyHistory([]);
    setTestedKeys(new Set());
    setMaxSimultaneous(0);
    setGhostingDetected(false);
  };

  const getKeyLabel = (code: string) => {
    if (KEY_LABELS[code]) return KEY_LABELS[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('F') && code.length <= 3) return code;
    return code;
  };

  const getKeyWidth = (code: string) => {
    if (code === 'Space') return 'flex-[4]';
    if (['Backspace', 'Tab', 'CapsLock', 'Enter', 'ShiftLeft', 'ShiftRight'].includes(code)) return 'flex-[1.5]';
    if (['ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'].includes(code)) return 'flex-[1.2]';
    return 'flex-1';
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
            <KeyboardIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Keyboard Test</h1>
            <p className="text-muted-foreground">Press keys to test detection and rollover</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card neon-border p-4 text-center"
          >
            <div className="font-display text-3xl font-bold neon-text-cyan">{testedKeys.size}</div>
            <div className="text-sm text-muted-foreground">Keys Tested</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card neon-border p-4 text-center"
          >
            <div className="font-display text-3xl font-bold neon-text-green">{simultaneousCount}</div>
            <div className="text-sm text-muted-foreground">Currently Pressed</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card neon-border p-4 text-center"
          >
            <div className="font-display text-3xl font-bold neon-text-purple">{maxSimultaneous}</div>
            <div className="text-sm text-muted-foreground">Max Rollover</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card neon-border p-4 text-center"
          >
            <div className={`font-display text-3xl font-bold ${ghostingDetected ? 'text-destructive' : 'neon-text-green'}`}>
              {ghostingDetected ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-muted-foreground">Ghosting</div>
          </motion.div>
        </div>

        {/* Virtual Keyboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card neon-border p-4 overflow-x-auto"
        >
          <div className="min-w-[800px] space-y-1">
            {KEYBOARD_LAYOUT.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.map((code) => {
                  const isPressed = pressedKeys.has(code);
                  const isTested = testedKeys.has(code);
                  
                  return (
                    <div
                      key={code}
                      className={`
                        ${getKeyWidth(code)} h-10 min-w-[40px] rounded-md flex items-center justify-center
                        text-xs font-medium transition-all duration-100 border
                        ${isPressed 
                          ? 'bg-primary text-primary-foreground border-primary neon-glow-cyan scale-95' 
                          : isTested 
                            ? 'bg-accent/20 text-accent border-accent/50' 
                            : 'bg-muted/50 text-muted-foreground border-border/50'
                        }
                      `}
                    >
                      {getKeyLabel(code)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card neon-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Key History</h3>
            <NeonButton variant="orange" size="sm" onClick={clearHistory}>
              <Trash2 className="w-4 h-4" />
              Clear
            </NeonButton>
          </div>
          
          <div className="h-32 overflow-y-auto space-y-1 font-mono text-sm">
            {keyHistory.length === 0 ? (
              <p className="text-muted-foreground">Press any key to start...</p>
            ) : (
              keyHistory.map((kp, i) => (
                <div key={`${kp.timestamp}-${i}`} className="flex gap-4">
                  <span className="text-muted-foreground w-24">
                    {new Date(kp.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="neon-text-cyan">{kp.code}</span>
                  <span className="text-muted-foreground">({kp.key})</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Ghosting Warning */}
        {ghostingDetected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
            <div>
              <h4 className="font-display font-semibold text-destructive">Ghosting Detected</h4>
              <p className="text-sm text-muted-foreground">
                Some key combinations may not register correctly on this keyboard.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
