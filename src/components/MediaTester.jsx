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

    // Device Selection State
    const [devices, setDevices] = useState({ video: [], audio: [] });
    const [selectedVideo, setSelectedVideo] = useState('');
    const [selectedAudio, setSelectedAudio] = useState('');

    const startMedia = async (vId, aId) => {
        // Cleanup old stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (audioContext) {
            audioContext.close();
        }

        try {
            const constraints = {
                video: vId ? { deviceId: { exact: vId } } : true,
                audio: aId ? { deviceId: { exact: aId } } : true
            };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
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
            if (canvas) {
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
            }

        } catch (err) {
            console.error("Media Error:", err);
            setError("Permission Denied or Device Not Found. Please allow access to Camera and Microphone.");
        }
    };

    useEffect(() => {
        const getDevices = async () => {
            try {
                // Request initial permissions to get labels
                await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                const v = allDevices.filter(d => d.kind === 'videoinput');
                const a = allDevices.filter(d => d.kind === 'audioinput');
                setDevices({ video: v, audio: a });
                if (v.length > 0) setSelectedVideo(v[0].deviceId);
                if (a.length > 0) setSelectedAudio(a[0].deviceId);

                // Start with defaults
                startMedia(v[0]?.deviceId, a[0]?.deviceId);
            } catch (err) {
                console.error("Device Enum Error:", err);
                setError("Could not access media devices.");
            }
        };

        getDevices();

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (audioContext) audioContext.close();
        };
    }, []);

    const handleVideoChange = (e) => {
        const id = e.target.value;
        setSelectedVideo(id);
        startMedia(id, selectedAudio);
    };

    const handleAudioChange = (e) => {
        const id = e.target.value;
        setSelectedAudio(id);
        startMedia(selectedVideo, id);
    };

    return (
        <div className="container mx-auto p-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveTool(null)}
                        className="text-primary hover:text-secondary font-mono"
                    >
                        <ArrowLeft className="inline h-4 w-4 mr-2" />
                        BACK
                    </button>
                    <h2 className="text-2xl font-bold font-mono text-gray-100 uppercase tracking-tighter">Camera and microphone test</h2>
                </div>

                {/* Selectors */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-500 font-bold uppercase">Camera Source</label>
                        <select
                            value={selectedVideo}
                            onChange={handleVideoChange}
                            className="bg-gray-900 border border-gray-800 text-gray-300 text-xs rounded p-2 focus:border-primary outline-none"
                        >
                            {devices.video.map(d => (
                                <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}`}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-500 font-bold uppercase">Microphone Source</label>
                        <select
                            value={selectedAudio}
                            onChange={handleAudioChange}
                            className="bg-gray-900 border border-gray-800 text-gray-300 text-xs rounded p-2 focus:border-primary outline-none"
                        >
                            {devices.audio.map(d => (
                                <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 5)}`}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-red-500 bg-red-900/10 border border-red-900 rounded-lg p-8">
                    <AlertTriangle className="h-16 w-16 mb-4" />
                    <h3 className="text-xl font-bold font-mono text-center">ACCESS DENIED</h3>
                    <p className="font-mono mt-2 text-center text-sm">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-500 text-white rounded text-xs font-bold uppercase">Retry</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Camera Feed */}
                    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg flex flex-col">
                        <div className="flex items-center gap-2 mb-4 text-primary">
                            <Camera className="h-5 w-5" />
                            <h3 className="font-bold font-mono text-sm tracking-widest uppercase">Visual Pulse</h3>
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
                                <div className="w-2 h-2 bg-red-500 rounded-full" /> ACTIVE
                            </div>
                        </div>
                    </div>

                    {/* Audio Visualizer */}
                    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg flex flex-col">
                        <div className="flex items-center gap-2 mb-4 text-primary">
                            <Mic className="h-5 w-5" />
                            <h3 className="font-bold font-mono text-sm tracking-widest uppercase">Audio Frequency</h3>
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
