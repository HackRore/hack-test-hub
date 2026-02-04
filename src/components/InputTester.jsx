import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { MousePointer, ArrowLeft, RefreshCw } from 'lucide-react';

const InputTester = () => {
    const { setActiveTool } = useStore();
    const canvasRef = useRef(null);
    const [stats, setStats] = useState({ x: 0, y: 0, buttons: [], scroll: 0 });
    const [clicks, setClicks] = useState([]);
    const [inputDevices, setInputDevices] = useState([]);

    // Detect input devices
    useEffect(() => {
        const devices = [];

        // Check for mouse
        if (matchMedia('(pointer:fine)').matches) {
            devices.push({ type: 'Mouse', icon: 'pointer', detected: true });
        }

        // Check for touchpad/touchscreen
        if (matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window) {
            devices.push({ type: 'Touch', icon: 'touch', detected: true });
        }

        // Check for keyboard
        devices.push({ type: 'Keyboard', icon: 'keyboard', detected: true });

        // Check for gamepad
        if (navigator.getGamepads) {
            const gamepads = navigator.getGamepads();
            if (gamepads && Array.from(gamepads).some(g => g !== null)) {
                devices.push({ type: 'Gamepad', icon: 'gamepad', detected: true });
            }
        }

        setInputDevices(devices);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrame;

        // Resize canvas
        const resize = () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        resize();
        window.addEventListener('resize', resize);

        // Trail State
        let trail = [];

        const draw = () => {
            ctx.fillStyle = 'rgba(10, 10, 10, 0.1)'; // Fade effect
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            ctx.strokeStyle = '#00ff41';
            ctx.lineWidth = 2;

            for (let i = 0; i < trail.length - 1; i++) {
                const point = trail[i];
                const next = trail[i + 1];
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(next.x, next.y);
            }
            ctx.stroke();

            // Remove old points
            if (trail.length > 50) trail.shift();

            animationFrame = requestAnimationFrame(draw);
        };
        draw();

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            trail.push({ x, y });
            setStats(prev => ({ ...prev, x: Math.round(x), y: Math.round(y) }));
        };

        const handleMouseDown = (e) => {
            const btnMap = { 0: 'Left', 1: 'Middle', 2: 'Right' };
            const btn = btnMap[e.button] || 'Unknown';

            setClicks(prev => [...prev, { btn, time: Date.now() }].slice(-10));

            setStats(prev => ({
                ...prev,
                buttons: [...new Set([...prev.buttons, btn])] // Unique buttons pressed session
            }));
        };

        const handleScroll = (e) => {
            setStats(prev => ({ ...prev, scroll: prev.scroll + e.deltaY }));
        };

        // Right click menu prevention
        const handleContextMenu = (e) => e.preventDefault();

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('wheel', handleScroll);
        canvas.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('wheel', handleScroll);
            canvas.removeEventListener('contextmenu', handleContextMenu);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    return (
        <div className="container mx-auto p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveTool(null)}
                        className="text-primary hover:text-secondary font-mono"
                    >
                        <ArrowLeft className="inline h-4 w-4 mr-2" />
                        BACK
                    </button>
                    <h2 className="text-2xl font-bold font-mono text-gray-100">INPUT DIAGNOSTICS</h2>
                </div>
                <button
                    onClick={() => { setClicks([]); setStats(s => ({ ...s, buttons: [], scroll: 0 })); }}
                    className="text-gray-400 hover:text-white flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" /> Reset
                </button>
            </div>

            {/* Input Devices Panel */}
            {inputDevices.length > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-4">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Detected Input Devices</h3>
                    <div className="flex flex-wrap gap-2">
                        {inputDevices.map((device, idx) => (
                            <span key={idx} className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary rounded text-xs font-mono">
                                {device.type}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
                {/* Canvas Area */}
                <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden relative group cursor-crosshair">
                    <canvas ref={canvasRef} className="w-full h-full block" />
                    <div className="absolute top-4 left-4 pointer-events-none text-xs font-mono text-gray-500">
                        Move mouse to draw trail. Click buttons to test. Scroll anywhere.
                    </div>
                </div>

                {/* Stats Panel */}
                <div className="lg:col-span-1 bg-gray-900/50 border border-gray-800 rounded-lg p-6 flex flex-col gap-6 font-mono">
                    <div>
                        <h3 className="text-secondary font-bold mb-2">POINTER</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>X: <span className="text-primary">{stats.x}</span></div>
                            <div>Y: <span className="text-primary">{stats.y}</span></div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-secondary font-bold mb-2">SCROLL DELTA</h3>
                        <div className="text-3xl text-gray-100">{stats.scroll}</div>
                    </div>

                    <div>
                        <h3 className="text-secondary font-bold mb-2">BUTTONS DETECTED</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Left', 'Middle', 'Right'].map(btn => (
                                <span
                                    key={btn}
                                    className={`px-2 py-1 rounded text-xs border ${stats.buttons.includes(btn) ? 'bg-primary text-black border-primary' : 'bg-transparent text-gray-600 border-gray-800'}`}
                                >
                                    {btn.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <h3 className="text-secondary font-bold mb-2">CLICK LOG</h3>
                        <div className="space-y-1 text-xs text-gray-400">
                            {clicks.slice().reverse().map((c, i) => (
                                <div key={i}>[{new Date(c.time).toLocaleTimeString()}] {c.btn} Click</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputTester;
