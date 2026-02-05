import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Play, Square, Download, RefreshCw } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

export default function WebcamTest() {
  const setResult = useTestStore((s) => s.setResult);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{
    width: number;
    height: number;
    frameRate: number;
    deviceName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 },
        },
      });
      
      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          const track = mediaStream.getVideoTracks()[0];
          const settings = track.getSettings();
          setVideoInfo({
            width: settings.width || 0,
            height: settings.height || 0,
            frameRate: settings.frameRate || 0,
            deviceName: track.label,
          });

          setResult('webcam', {
            name: 'Webcam',
            status: 'pass',
            details: `${settings.width}x${settings.height} @ ${Math.round(settings.frameRate || 0)}fps`,
          });
        };
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      setResult('webcam', {
        name: 'Webcam',
        status: 'fail',
        details: 'Camera access denied or not available',
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setVideoInfo(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        setCapturedImage(canvas.toDataURL('image/png'));
      }
    }
  };

  const downloadPhoto = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `hackrore-webcam-${Date.now()}.png`;
      link.click();
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center neon-glow-cyan">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Webcam Test</h1>
            <p className="text-muted-foreground">Test video capture, resolution, and frame rate</p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Video Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card neon-border p-4"
        >
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {!isActive && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Click "Start Camera" to begin</p>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
                <p className="text-destructive text-center px-4">{error}</p>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-3 mt-4">
            {!isActive ? (
              <NeonButton variant="cyan" onClick={startCamera}>
                <Play className="w-4 h-4" />
                Start Camera
              </NeonButton>
            ) : (
              <>
                <NeonButton variant="orange" onClick={stopCamera}>
                  <Square className="w-4 h-4" />
                  Stop
                </NeonButton>
                <NeonButton variant="purple" onClick={capturePhoto}>
                  <Camera className="w-4 h-4" />
                  Capture
                </NeonButton>
              </>
            )}
          </div>
        </motion.div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Camera Info */}
          {videoInfo && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card neon-border p-6"
            >
              <h3 className="font-display font-semibold mb-4">Camera Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Device</span>
                  <span className="font-medium truncate ml-4 max-w-[200px]">{videoInfo.deviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolution</span>
                  <span className="font-display font-bold neon-text-cyan">
                    {videoInfo.width} × {videoInfo.height}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frame Rate</span>
                  <span className="font-display font-bold neon-text-green">
                    {Math.round(videoInfo.frameRate)} FPS
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Captured Image */}
          {capturedImage && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card neon-border p-4"
            >
              <h3 className="font-display font-semibold mb-4">Captured Photo</h3>
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full rounded-lg mb-4"
              />
              <div className="flex gap-3">
                <NeonButton variant="green" size="sm" onClick={downloadPhoto}>
                  <Download className="w-4 h-4" />
                  Download
                </NeonButton>
                <NeonButton variant="purple" size="sm" onClick={() => setCapturedImage(null)}>
                  <RefreshCw className="w-4 h-4" />
                  Clear
                </NeonButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
