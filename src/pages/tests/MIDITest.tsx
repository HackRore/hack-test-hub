import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Music, Piano } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  type: 'input' | 'output';
}

interface MIDINote {
  note: number;
  velocity: number;
  timestamp: number;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function MIDITest() {
  const setResult = useTestStore((s) => s.setResult);
  const [supported, setSupported] = useState(true);
  const [devices, setDevices] = useState<MIDIDevice[]>([]);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [noteHistory, setNoteHistory] = useState<MIDINote[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<number, OscillatorNode>>(new Map());

  const initMIDI = async () => {
    try {
      const access = await navigator.requestMIDIAccess();
      
      const deviceList: MIDIDevice[] = [];
      
      access.inputs.forEach((input) => {
        deviceList.push({
          id: input.id,
          name: input.name || 'Unknown Input',
          manufacturer: input.manufacturer || 'Unknown',
          type: 'input',
        });
        
        input.onmidimessage = handleMIDIMessage;
      });
      
      access.outputs.forEach((output) => {
        deviceList.push({
          id: output.id,
          name: output.name || 'Unknown Output',
          manufacturer: output.manufacturer || 'Unknown',
          type: 'output',
        });
      });

      setDevices(deviceList);
      
      if (deviceList.length > 0) {
        setResult('midi', {
          name: 'MIDI I/O',
          status: 'pass',
          details: `${deviceList.length} MIDI device(s) detected`,
        });
      }
    } catch (error) {
      setSupported(false);
      setResult('midi', {
        name: 'MIDI I/O',
        status: 'fail',
        details: 'MIDI not supported in this browser',
      });
    }
  };

  const handleMIDIMessage = (event: MIDIMessageEvent) => {
    const [status, note, velocity] = event.data;
    const command = status >> 4;
    
    if (command === 9 && velocity > 0) {
      // Note On
      setActiveNotes((prev) => new Set(prev).add(note));
      setNoteHistory((prev) => [
        { note, velocity, timestamp: Date.now() },
        ...prev.slice(0, 49),
      ]);
      playNote(note, velocity);
    } else if (command === 8 || (command === 9 && velocity === 0)) {
      // Note Off
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      stopNote(note);
    }
  };

  const playNote = (note: number, velocity: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    const ctx = audioContextRef.current;
    const frequency = 440 * Math.pow(2, (note - 69) / 12);
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = (velocity / 127) * 0.3;
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillatorsRef.current.set(note, oscillator);
  };

  const stopNote = (note: number) => {
    const oscillator = oscillatorsRef.current.get(note);
    if (oscillator) {
      oscillator.stop();
      oscillatorsRef.current.delete(note);
    }
  };

  const getNoteLabel = (note: number) => {
    const octave = Math.floor(note / 12) - 1;
    const noteName = NOTE_NAMES[note % 12];
    return `${noteName}${octave}`;
  };

  useEffect(() => {
    initMIDI();
    
    return () => {
      oscillatorsRef.current.forEach((osc) => osc.stop());
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (!supported) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
              <Music className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold">MIDI I/O Test</h1>
              <p className="text-destructive">MIDI not supported in this browser</p>
            </div>
          </div>
        </motion.div>
        
        <div className="glass-card neon-border p-8 text-center max-w-xl">
          <p className="text-muted-foreground">
            Web MIDI API is not available. Try using Chrome, Edge, or Opera.
          </p>
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
            <Music className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">MIDI I/O Test</h1>
            <p className="text-muted-foreground">Connect MIDI devices and play notes</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl space-y-6">
        {/* Devices */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card neon-border p-6"
        >
          <h3 className="font-display font-semibold mb-4">Connected Devices</h3>
          {devices.length === 0 ? (
            <p className="text-muted-foreground">
              No MIDI devices detected. Connect a device and refresh.
            </p>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {device.type === 'input' ? (
                      <Piano className="w-5 h-5 text-primary" />
                    ) : (
                      <Music className="w-5 h-5 text-secondary" />
                    )}
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-xs text-muted-foreground">{device.manufacturer}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    device.type === 'input' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-secondary/20 text-secondary'
                  }`}>
                    {device.type}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <NeonButton variant="purple" className="mt-4" onClick={initMIDI}>
            Refresh Devices
          </NeonButton>
        </motion.div>

        {/* Virtual Piano */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card neon-border p-6"
        >
          <h3 className="font-display font-semibold mb-4">Virtual Piano</h3>
          <div className="flex justify-center overflow-x-auto pb-4">
            <div className="flex">
              {Array.from({ length: 25 }).map((_, i) => {
                const note = 48 + i; // C3 to C5
                const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
                const isActive = activeNotes.has(note);
                
                if (isBlack) {
                  return (
                    <div
                      key={note}
                      className={`
                        w-6 h-20 -mx-3 z-10 rounded-b
                        ${isActive 
                          ? 'bg-primary neon-glow-cyan' 
                          : 'bg-foreground'
                        }
                      `}
                    />
                  );
                }
                
                return (
                  <div
                    key={note}
                    className={`
                      w-10 h-32 border-x border-border rounded-b
                      ${isActive 
                        ? 'bg-primary/30 border-primary' 
                        : 'bg-card'
                      }
                    `}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Note History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card neon-border p-6"
        >
          <h3 className="font-display font-semibold mb-4">Note History</h3>
          <div className="h-32 overflow-y-auto space-y-1 font-mono text-sm">
            {noteHistory.length === 0 ? (
              <p className="text-muted-foreground">Play notes on your MIDI device...</p>
            ) : (
              noteHistory.map((n, i) => (
                <div key={`${n.timestamp}-${i}`} className="flex gap-4">
                  <span className="text-muted-foreground">
                    {new Date(n.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="neon-text-cyan font-bold">{getNoteLabel(n.note)}</span>
                  <span className="text-muted-foreground">vel: {n.velocity}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
