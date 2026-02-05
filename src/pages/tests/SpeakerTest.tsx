import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Play, Square, ArrowLeftRight } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

export default function SpeakerTest() {
  const setResult = useTestStore((s) => s.setResult);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTest, setCurrentTest] = useState<'stereo' | 'volume' | 'panning' | null>(null);
  const [panValue, setPanValue] = useState(0);
  const [volume, setVolume] = useState(0.5);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);

  const stopAudio = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTest(null);
  };

  const playTone = (frequency: number, duration: number, pan: number = 0) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const panner = ctx.createStereoPanner();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;
    panner.pan.value = pan;

    oscillator.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(ctx.destination);

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    pannerRef.current = panner;

    oscillator.start();
    if (duration > 0) {
      setTimeout(() => {
        oscillator.stop();
        setIsPlaying(false);
        setCurrentTest(null);
      }, duration);
    }
  };

  const runStereoTest = () => {
    stopAudio();
    setIsPlaying(true);
    setCurrentTest('stereo');

    // Left channel
    playTone(440, 0, -1);
    setPanValue(-1);

    setTimeout(() => {
      if (pannerRef.current) {
        pannerRef.current.pan.value = 1;
        setPanValue(1);
      }
    }, 1500);

    setTimeout(() => {
      stopAudio();
      setResult('speaker', {
        name: 'Speaker',
        status: 'pass',
        details: 'Stereo audio test completed',
      });
    }, 3000);
  };

  const runVolumeSweep = () => {
    stopAudio();
    setIsPlaying(true);
    setCurrentTest('volume');
    
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    gainNode.gain.value = 0;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    oscillator.start();

    // Sweep from 0 to max and back
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);

    setTimeout(() => {
      stopAudio();
    }, 4000);
  };

  const runPanningTest = () => {
    stopAudio();
    setIsPlaying(true);
    setCurrentTest('panning');
    
    playTone(440, 0, -1);
    setPanValue(-1);

    let direction = 1;
    const interval = setInterval(() => {
      if (pannerRef.current) {
        const newPan = pannerRef.current.pan.value + direction * 0.1;
        if (newPan >= 1) direction = -1;
        if (newPan <= -1) direction = 1;
        pannerRef.current.pan.value = Math.max(-1, Math.min(1, newPan));
        setPanValue(pannerRef.current.pan.value);
      }
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      stopAudio();
    }, 5000);
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
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
            <Volume2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Speaker Test</h1>
            <p className="text-muted-foreground">Test stereo output, volume sweep, and panning</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-2xl space-y-6">
        {/* Volume Control */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card neon-border p-6"
        >
          <h3 className="font-display font-semibold mb-4">Volume Control</h3>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (gainNodeRef.current) {
                gainNodeRef.current.gain.value = parseFloat(e.target.value);
              }
            }}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>0%</span>
            <span className="font-display font-bold neon-text-cyan">{Math.round(volume * 100)}%</span>
            <span>100%</span>
          </div>
        </motion.div>

        {/* Panning Indicator */}
        {isPlaying && (currentTest === 'stereo' || currentTest === 'panning') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card neon-border p-6"
          >
            <h3 className="font-display font-semibold mb-4">Stereo Position</h3>
            <div className="relative h-4 bg-muted rounded-full">
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary neon-glow-cyan"
                animate={{ left: `calc(${(panValue + 1) * 50}% - 12px)` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className={panValue < -0.3 ? 'neon-text-cyan font-bold' : 'text-muted-foreground'}>
                LEFT
              </span>
              <span className={Math.abs(panValue) <= 0.3 ? 'neon-text-cyan font-bold' : 'text-muted-foreground'}>
                CENTER
              </span>
              <span className={panValue > 0.3 ? 'neon-text-cyan font-bold' : 'text-muted-foreground'}>
                RIGHT
              </span>
            </div>
          </motion.div>
        )}

        {/* Test Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card neon-border p-6"
        >
          <h3 className="font-display font-semibold mb-4">Audio Tests</h3>
          
          <div className="grid sm:grid-cols-3 gap-4">
            <NeonButton
              variant="cyan"
              onClick={runStereoTest}
              disabled={isPlaying}
              className="w-full"
            >
              <Play className="w-4 h-4" />
              Stereo Test
            </NeonButton>
            
            <NeonButton
              variant="purple"
              onClick={runVolumeSweep}
              disabled={isPlaying}
              className="w-full"
            >
              <Volume2 className="w-4 h-4" />
              Volume Sweep
            </NeonButton>
            
            <NeonButton
              variant="green"
              onClick={runPanningTest}
              disabled={isPlaying}
              className="w-full"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Panning Test
            </NeonButton>
          </div>

          {isPlaying && (
            <div className="mt-4">
              <NeonButton variant="orange" onClick={stopAudio}>
                <Square className="w-4 h-4" />
                Stop
              </NeonButton>
            </div>
          )}
        </motion.div>

        {/* Test Descriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card neon-border p-6"
        >
          <h3 className="font-display font-semibold mb-4">Test Descriptions</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Stereo Test:</strong> Plays audio in the left channel, then the right channel.</p>
            <p><strong className="text-foreground">Volume Sweep:</strong> Gradually increases volume from 0% to max, then back down.</p>
            <p><strong className="text-foreground">Panning Test:</strong> Continuously pans audio between left and right channels.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
