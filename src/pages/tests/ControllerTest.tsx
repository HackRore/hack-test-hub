import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Vibrate } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

interface GamepadState {
  id: string;
  buttons: boolean[];
  axes: number[];
}

export default function ControllerTest() {
  const setResult = useTestStore((s) => s.setResult);
  const [gamepads, setGamepads] = useState<GamepadState[]>([]);
  const [connected, setConnected] = useState(false);
  const animationRef = useRef<number>(0);

  const pollGamepads = () => {
    const pads = navigator.getGamepads();
    const states: GamepadState[] = [];
    
    for (const pad of pads) {
      if (pad) {
        states.push({
          id: pad.id,
          buttons: pad.buttons.map(b => b.pressed),
          axes: Array.from(pad.axes),
        });
      }
    }
    
    setGamepads(states);
    setConnected(states.length > 0);
    
    if (states.length > 0) {
      const anyPressed = states.some(s => s.buttons.some(b => b));
      if (anyPressed) {
        setResult('controller', {
          name: 'Controller',
          status: 'pass',
          details: `${states.length} controller(s) detected`,
        });
      }
    }
    
    animationRef.current = requestAnimationFrame(pollGamepads);
  };

  const triggerVibration = async (index: number) => {
    const pads = navigator.getGamepads();
    const pad = pads[index];
    
    if (pad?.vibrationActuator) {
      await pad.vibrationActuator.playEffect('dual-rumble', {
        duration: 500,
        strongMagnitude: 1.0,
        weakMagnitude: 0.5,
      });
    }
  };

  useEffect(() => {
    const handleConnect = () => {
      pollGamepads();
    };

    const handleDisconnect = () => {
      pollGamepads();
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);
    
    animationRef.current = requestAnimationFrame(pollGamepads);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center neon-glow-cyan">
            <Gamepad2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Controller Test</h1>
            <p className="text-muted-foreground">Detect gamepad input, buttons, and vibration</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-3xl space-y-6">
        {!connected ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card neon-border p-12 text-center"
          >
            <Gamepad2 className="w-20 h-20 mx-auto mb-6 text-muted-foreground animate-pulse" />
            <h3 className="font-display text-xl font-semibold mb-2">No Controller Detected</h3>
            <p className="text-muted-foreground mb-4">
              Connect a controller and press any button to begin.
            </p>
            <p className="text-sm text-muted-foreground">
              Supported: Xbox, PlayStation, Nintendo Switch Pro, and most HID-compatible controllers
            </p>
          </motion.div>
        ) : (
          gamepads.map((gamepad, index) => (
            <motion.div
              key={gamepad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card neon-border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-semibold">{gamepad.id}</h3>
                  <p className="text-sm text-muted-foreground">Controller {index + 1}</p>
                </div>
                <NeonButton
                  variant="purple"
                  size="sm"
                  onClick={() => triggerVibration(index)}
                >
                  <Vibrate className="w-4 h-4" />
                  Vibrate
                </NeonButton>
              </div>

              {/* Buttons */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Buttons</h4>
                <div className="flex flex-wrap gap-2">
                  {gamepad.buttons.map((pressed, i) => (
                    <div
                      key={i}
                      className={`
                        w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold
                        transition-all duration-100
                        ${pressed 
                          ? 'bg-primary text-primary-foreground neon-glow-cyan scale-90' 
                          : 'bg-muted text-muted-foreground'
                        }
                      `}
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </div>

              {/* Axes */}
              <div>
                <h4 className="text-sm font-medium mb-3">Axes</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[0, 2].map((baseIndex) => (
                    <div key={baseIndex} className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 rounded-full border-2 border-muted" />
                      <div className="absolute inset-4 rounded-full border border-muted/50" />
                      <motion.div
                        className="absolute w-4 h-4 rounded-full bg-primary neon-glow-cyan"
                        style={{
                          left: `calc(50% + ${(gamepad.axes[baseIndex] || 0) * 50}% - 8px)`,
                          top: `calc(50% + ${(gamepad.axes[baseIndex + 1] || 0) * 50}% - 8px)`,
                        }}
                      />
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                        {baseIndex === 0 ? 'Left Stick' : 'Right Stick'}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Triggers */}
                {gamepad.axes.length > 4 && (
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {[4, 5].map((axisIndex) => (
                      <div key={axisIndex}>
                        <div className="text-xs text-muted-foreground mb-2">
                          {axisIndex === 4 ? 'Left Trigger' : 'Right Trigger'}
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary"
                            style={{
                              width: `${((gamepad.axes[axisIndex] || -1) + 1) / 2 * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
