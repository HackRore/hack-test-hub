import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, Play, Square, Volume2 } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

export default function MicrophoneTest() {
  const setResult = useTestStore((s) => s.setResult);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<{ name: string; sampleRate: number } | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);

  const updateLevel = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(average / 255 * 100);
    }
    animationRef.current = requestAnimationFrame(updateLevel);
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const track = stream.getAudioTracks()[0];
      setDeviceInfo({
        name: track.label,
        sampleRate: audioContext.sampleRate,
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      updateLevel();

      setResult('microphone', {
        name: 'Microphone',
        status: 'pass',
        details: `Recording at ${audioContext.sampleRate}Hz`,
      });
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      setResult('microphone', {
        name: 'Microphone',
        status: 'fail',
        details: 'Microphone access denied or not available',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      cancelAnimationFrame(animationRef.current);
      setAudioLevel(0);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.play();
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
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
            <Mic className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Microphone Test</h1>
            <p className="text-muted-foreground">Record and playback audio, monitor input levels</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-2xl space-y-6">
        {/* Level Meter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card neon-border p-6"
        >
          <h3 className="font-display font-semibold mb-4">Input Level</h3>
          
          <div className="relative h-8 bg-muted rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: audioLevel > 80 
                  ? 'hsl(var(--destructive))' 
                  : audioLevel > 50 
                    ? 'hsl(var(--neon-orange))' 
                    : 'hsl(var(--accent))',
                boxShadow: audioLevel > 0 ? `0 0 20px hsl(var(--accent) / 0.5)` : 'none',
              }}
              animate={{ width: `${audioLevel}%` }}
              transition={{ duration: 0.05 }}
            />
            <div className="absolute inset-0 flex items-center justify-end pr-4">
              <span className="font-display text-sm font-bold">
                {Math.round(audioLevel)}%
              </span>
            </div>
          </div>

          {/* Visual Bars */}
          <div className="flex gap-1 h-24 items-end justify-center">
            {Array.from({ length: 32 }).map((_, i) => {
              const barHeight = Math.max(10, audioLevel * (0.5 + Math.random() * 0.5));
              return (
                <motion.div
                  key={i}
                  className="w-2 rounded-t"
                  style={{
                    background: barHeight > 80 
                      ? 'hsl(var(--destructive))' 
                      : barHeight > 50 
                        ? 'hsl(var(--primary))' 
                        : 'hsl(var(--accent))',
                  }}
                  animate={{ height: `${barHeight}%` }}
                  transition={{ duration: 0.05 }}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card neon-border p-6"
        >
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {!isRecording ? (
              <NeonButton variant="cyan" onClick={startRecording}>
                <Mic className="w-4 h-4" />
                Start Recording
              </NeonButton>
            ) : (
              <NeonButton variant="orange" onClick={stopRecording}>
                <Square className="w-4 h-4" />
                Stop Recording
              </NeonButton>
            )}

            {audioBlob && !isRecording && (
              <NeonButton
                variant="green"
                onClick={playRecording}
                disabled={isPlaying}
              >
                <Volume2 className="w-4 h-4" />
                {isPlaying ? 'Playing...' : 'Play Recording'}
              </NeonButton>
            )}
          </div>
        </motion.div>

        {/* Device Info */}
        {deviceInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card neon-border p-6"
          >
            <h3 className="font-display font-semibold mb-4">Device Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Device</span>
                <span className="font-medium truncate ml-4 max-w-[250px]">{deviceInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sample Rate</span>
                <span className="font-display font-bold neon-text-cyan">{deviceInfo.sampleRate} Hz</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
