import React, { useRef, useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { Cpu, ArrowLeft, Play, Pause, Thermometer } from 'lucide-react';

const GPUTest = () => {
    const { setActiveTool } = useStore();
    const canvasRef = useRef(null);
    const [fps, setFps] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const requestRef = useRef();
    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    const [particleCount, setParticleCount] = useState(2000);

    // Stats Tracking
    const [stats, setStats] = useState({ min: 999, max: 0, avg: 0, totalFrames: 0, secondsRun: 0 });

    const particles = useRef([]);

    const initParticles = (count, width, height) => {
        const p = [];
        for (let i = 0; i < count; i++) {
            p.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                size: Math.random() * 3 + 1,
                color: Math.random() > 0.5 ? '#00ff41' : '#00f0ff'
            });
        }
        particles.current = p;
    };

    const animate = (time) => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;

        ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
        ctx.fillRect(0, 0, width, height);

        particles.current.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        frameCount.current++;
        if (time - lastTime.current >= 1000) {
            const currentFps = Math.round((frameCount.current * 1000) / (time - lastTime.current));
            setFps(currentFps);

            // Update Stats
            if (currentFps > 0) { // Ignore startup blip
                setStats(prev => ({
                    min: Math.min(prev.min, currentFps),
                    max: Math.max(prev.max, currentFps),
                    totalFrames: prev.totalFrames + currentFps,
                    secondsRun: prev.secondsRun + 1,
                    avg: Math.round((prev.totalFrames + currentFps) / (prev.secondsRun + 1))
                }));
            }

            frameCount.current = 0;
            lastTime.current = time;
        }

        if (isRunning) {
            requestRef.current = requestAnimationFrame(animate);
        }
    };

    const toggleTest = () => {
        if (isRunning) {
            setIsRunning(false);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        } else {
            setIsRunning(true);
            setStats({ min: 999, max: 0, avg: 0, totalFrames: 0, secondsRun: 0 }); // Reset stats
            const w = canvasRef.current.offsetWidth;
            const h = canvasRef.current.offsetHeight;
            canvasRef.current.width = w;
            canvasRef.current.height = h;
            initParticles(particleCount, w, h);
            requestRef.current = requestAnimationFrame(animate);
        }
    };

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const rating = fps >= 30 ? { color: 'text-green-500' } : { color: 'text-red-500' };

    return (
        <div className="container mx-auto p-6 flex flex-col items-center h-screen max-h-screen overflow-hidden">
            <div className="w-full flex items-center justify-between mb-4">
                <button
                    onClick={() => setActiveTool(null)}
                    className="text-primary hover:text-secondary font-mono flex items-center gap-2 z-10"
                >
                    <ArrowLeft className="h-4 w-4" /> BACK
                </button>
            </div>

            {/* Stats Overlay */}
            <div className={`absolute top-20 right-6 z-10 bg-black/80 border border-primary p-4 rounded text-right pointer-events-none transition-opacity ${isRunning ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-gray-400 font-mono text-xs mb-1">LIVE FPS</div>
                <div className={`text-5xl font-bold font-mono ${rating.color} mb-4`}>{fps}</div>

                <div className="grid grid-cols-3 gap-4 text-center font-mono text-xs border-t border-gray-700 pt-2">
                    <div>
                        <div className="text-gray-500">MIN</div>
                        <div className="text-red-400 font-bold">{stats.min === 999 ? '-' : stats.min}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">AVG</div>
                        <div className="text-white font-bold">{stats.avg === 0 ? '-' : stats.avg}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">MAX</div>
                        <div className="text-green-400 font-bold">{stats.max === 0 ? '-' : stats.max}</div>
                    </div>
                </div>
                <div className="text-gray-500 font-mono text-[10px] mt-2 italic flex justify-end gap-1 items-center">
                    <Thermometer className="h-3 w-3" /> Detect Throttling
                </div>
            </div>

            <div className="relative w-full flex-1 bg-black border border-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                {!isRunning && (
                    <div className="absolute z-20 flex flex-col items-center">
                        <Cpu className="h-16 w-16 text-primary mb-4" />
                        <h2 className="text-3xl font-bold font-mono text-white mb-2">GPU STRESS TEST</h2>
                        <p className="text-gray-400 font-mono mb-8 max-w-md text-center">
                            Benchmark graphics stability. Watch for FPS drops to identify thermal throttling.
                        </p>

                        <div className="flex gap-4 mb-8">
                            {[1000, 2000, 5000, 20000].map(count => (
                                <button
                                    key={count}
                                    onClick={() => setParticleCount(count)}
                                    className={`px-3 py-1 text-xs font-mono border rounded ${particleCount === count ? 'border-primary text-primary bg-primary/10' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}
                                >
                                    {count.toLocaleString()}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={toggleTest}
                            className="px-8 py-3 bg-primary text-black font-bold font-mono rounded hover:bg-secondary transition-colors flex items-center gap-2"
                        >
                            <Play className="h-5 w-5" /> START LOAD TEST
                        </button>
                    </div>
                )}
                <canvas ref={canvasRef} className="w-full h-full block" />
            </div>
        </div>
    );
};

export default GPUTest;
