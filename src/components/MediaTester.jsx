import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { Camera, Mic, AlertTriangle, ArrowLeft } from 'lucide-react';

const MediaTester = () => {
    const { setActiveTool } = useStore();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [error, setError] = useState(null);
    const [stream, setStream] = useState(null);
    const [audioContext, setAudioContext] = useState(null);

    useEffect(() => {
        const startMedia = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }

                // Audio Visualization
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                setAudioContext(ctx);
                const source = ctx.createMediaStreamSource(mediaStream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);

                const canvas = canvasRef.current;
                const canvasCtx = canvas.getContext('2d');
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const draw = () => {
                    if (!canvas) return;
                    requestAnimationFrame(draw);
                    analyser.getByteFrequencyData(dataArray);

                    canvasCtx.fillStyle = '#0a0a0a';
                    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

                    const barWidth = (canvas.width / bufferLength) * 2.5;
                    let barHeight;
                    let x = 0;

                    for (let i = 0; i < bufferLength; i++) {
                        barHeight = dataArray[i] / 2;
                        canvasCtx.fillStyle = `rgb(0, ${barHeight + 100}, 65)`; // Green tint
                        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                        x += barWidth + 1;
                    }
                };

                draw();

            } catch (err) {
                console.error("Media Error:", err);
                setError("Permission Denied or Device Not Found. Please allow access to Camera and Microphone.");
            }
        };

        startMedia();

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (audioContext) audioContext.close();
        };
    }, []);

    return (
        <div className="container mx-auto p-6 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setActiveTool(null)}
                    className="text-primary hover:text-secondary font-mono"
                >
                    <ArrowLeft className="inline h-4 w-4 mr-2" />
                    BACK
                </button>
                <h2 className="text-2xl font-bold font-mono text-gray-100">MEDIA DIAGNOSTICS</h2>
            </div>

            {error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-red-500 bg-red-900/10 border border-red-900 rounded-lg p-8">
                    <AlertTriangle className="h-16 w-16 mb-4" />
                    <h3 className="text-xl font-bold font-mono">ACCESS DENIED</h3>
                    <p className="font-mono mt-2">{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Camera Feed */}
                    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg flex flex-col">
                        <div className="flex items-center gap-2 mb-4 text-primary">
                            <Camera className="h-5 w-5" />
                            <h3 className="font-bold font-mono">CAMERA FEED</h3>
                        </div>
                        <div className="relative aspect-video bg-black rounded overflow-hidden border border-gray-800">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                            />
                            <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/70 px-2 py-1 rounded text-xs text-red-500 font-mono animate-pulse">
                                <div className="w-2 h-2 bg-red-500 rounded-full" /> REC
                            </div>
                        </div>
                    </div>

                    {/* Audio Visualizer */}
                    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg flex flex-col">
                        <div className="flex items-center gap-2 mb-4 text-primary">
                            <Mic className="h-5 w-5" />
                            <h3 className="font-bold font-mono">MICROPHONE INPUT</h3>
                        </div>
                        <div className="flex-1 bg-black rounded border border-gray-800 flex items-center justify-center min-h-[300px]">
                            <canvas
                                ref={canvasRef}
                                width={500}
                                height={300}
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaTester;
