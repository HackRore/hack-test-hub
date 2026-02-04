import React, { useRef, useEffect, useState, useCallback } from 'react';
import useStore from '../store/useStore';
import { MousePointer, ArrowLeft, Trash2, Grid, Maximize, RefreshCcw, Eraser } from 'lucide-react';

// Neon colors palette for multi-touch
const TOUCH_COLORS = [
    '#00ff41', // Matrix Green
    '#00ffff', // Cyan
    '#ff00ff', // Magenta
    '#ffff00', // Yellow
    '#ff0000', // Red
    '#0000ff', // Blue
    '#ff8800', // Orange
    '#aa00ff', // Purple
    '#00ffaa', // Mint
    '#ff00aa', // Hot Pink
];

const TouchTest = () => {
    const { setActiveTool } = useStore();
    const canvasRef = useRef(null);
    const [showGrid, setShowGrid] = useState(false); // Default off per request, toggleable
    const [points, setPoints] = useState([]); // Active touch points
    const [maxPoints, setMaxPoints] = useState(0); // Max simultaneous points
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [uiVisible, setUiVisible] = useState(true);
    const uiTimeoutRef = useRef(null);

    // Refs for logic
    const lastTouchTime = useRef(0);
    const lastTapTime = useRef(0);
    const isDrawingRef = useRef(false);

    // Store previous coordinates for smooth line drawing: { [identifier]: { x, y } }
    const prevCoords = useRef({});

    // Activity handler to show UI then hide after delay
    const handleActivity = useCallback(() => {
        // Prevent mousemove from overriding touch-based hiding
        if (Date.now() - lastTouchTime.current < 1000) return;

        setUiVisible(true);
        if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);

        uiTimeoutRef.current = setTimeout(() => {
            setUiVisible(false);
        }, 3000);
    }, []);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setPoints([]);
        setMaxPoints(0);
        prevCoords.current = {};
    };

    useEffect(() => {
        const resize = () => {
            if (canvasRef.current) {
                // Resize fetches current drawing? No, for persistent drawing we risk losing it on resize.
                // Professional tools often just clear or stick to a fixed buffer. 
                // Let's try to save the image data if we want to be fancy, but clear is acceptable for resize.

                // For now, simpler: resize clears canvas (standard behavior)
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        const syncFullscreen = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(err => console.log(err));
                }
                setIsFullscreen(false);
            }
        };

        window.addEventListener('resize', resize);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousemove', handleActivity);
        document.addEventListener('fullscreenchange', syncFullscreen);

        resize();
        handleActivity();

        // Auto-Fullscreen on Mount
        const enterFull = async () => {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                }
            } catch (err) {
                console.log("Auto-fullscreen blocked:", err);
            }
        };
        enterFull();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousemove', handleActivity);
            document.removeEventListener('fullscreenchange', syncFullscreen);
            if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
        };
    }, [handleActivity]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                console.log(`Error attempting to enable fullscreen: ${e.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    // Draw Line Logic
    const drawLine = (ctx, x1, y1, x2, y2, color, force) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Force sensitivity: standard 4px, up to 12px with pressure
        ctx.lineWidth = 4 + (force * 8);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };

    const handleTouchStart = (e) => {
        e.preventDefault();
        lastTouchTime.current = Date.now();
        setUiVisible(false);
        if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const newPoints = [];
        const touches = e.touches;

        // 3-Finger Tap Detection (Simple variant: if 3 fingers start roughly same time)
        // Better: Check active touches count in End or here?
        // Request: "Double Tap with 3 Fingers". This is complex. 
        // Let's simplified approach: If 3 fingers are detected, we check for a "tap" pattern?
        // Or actually, just implement "3 Finger Tap" to Clear (Easier/More standard)
        // User asked specifically for "Double Tap with 3 Fingers". 
        // Let's try: on TouchStart, if e.touches.length === 3, record time. If happens again < 400ms, clear.

        if (e.touches.length === 3) {
            const now = Date.now();
            if (now - lastTapTime.current < 400) {
                clearCanvas();
            }
            lastTapTime.current = now;
        }

        for (let i = 0; i < touches.length; i++) {
            const t = touches[i];
            const x = t.clientX - rect.left;
            const y = t.clientY - rect.top;

            // Register start point
            prevCoords.current[t.identifier] = { x, y };

            const colorId = t.identifier % TOUCH_COLORS.length;

            newPoints.push({
                id: t.identifier,
                x,
                y,
                color: TOUCH_COLORS[Math.abs(colorId)],
                force: t.force || 0.5
            });
        }
        setPoints(newPoints);
        if (newPoints.length > maxPoints) setMaxPoints(newPoints.length);
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        lastTouchTime.current = Date.now();
        setUiVisible(false);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const newPoints = [];
        const touches = e.touches;

        for (let i = 0; i < touches.length; i++) {
            const t = touches[i];
            const x = t.clientX - rect.left;
            const y = t.clientY - rect.top;
            const force = t.force || 0.5;

            const colorId = t.identifier % TOUCH_COLORS.length;
            const color = TOUCH_COLORS[Math.abs(colorId)];

            const prev = prevCoords.current[t.identifier];

            if (prev) {
                drawLine(ctx, prev.x, prev.y, x, y, color, force);
            }

            // Update prev coord
            prevCoords.current[t.identifier] = { x, y };

            newPoints.push({ id: t.identifier, x, y, color, force });
        }

        setPoints(newPoints);
        if (newPoints.length > maxPoints) setMaxPoints(newPoints.length);
    };

    const handleTouchEnd = (e) => {
        e.preventDefault();
        lastTouchTime.current = Date.now();

        // Cleanup prev coords for ended touches
        const activeIds = new Set();
        const newPoints = [];
        const rect = canvasRef.current.getBoundingClientRect();

        for (let i = 0; i < e.touches.length; i++) {
            const t = e.touches[i];
            activeIds.add(t.identifier);

            const x = t.clientX - rect.left;
            const y = t.clientY - rect.top;
            const colorId = t.identifier % TOUCH_COLORS.length;
            newPoints.push({
                id: t.identifier,
                x,
                y,
                color: TOUCH_COLORS[Math.abs(colorId)],
                force: t.force || 0.5
            });
        }

        // Remove old prevCoords
        Object.keys(prevCoords.current).forEach(id => {
            if (!activeIds.has(parseInt(id))) {
                delete prevCoords.current[id];
            }
        });

        setPoints(newPoints);

        // UI restore timer if empty
        if (e.touches.length === 0) {
            handleActivity();
        }
    };

    return (
        <div className="fixed inset-0 bg-black touch-none overflow-hidden cursor-crosshair">
            {/* Background Grid (Professional Linearity Check) */}
            {showGrid && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                    }}
                />
            )}

            {/* UI Layer */}
            <div className={`absolute top-6 left-6 z-50 flex gap-4 transition-all duration-300 ${!uiVisible ? 'opacity-0 pointer-events-none translate-y-[-20px]' : 'opacity-100 translate-y-0'}`}>
                <button
                    onClick={() => setActiveTool(null)}
                    className="group bg-black/80 backdrop-blur-md text-gray-300 border border-gray-700 hover:border-red-500 hover:text-red-400 px-5 py-2.5 rounded-none skew-x-[-10deg] shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all flex items-center gap-2"
                >
                    <div className="skew-x-[10deg] flex items-center gap-2 font-mono font-bold text-sm">
                        <ArrowLeft className="h-4 w-4" /> EXIT
                    </div>
                </button>
            </div>

            <div className={`absolute top-6 right-6 z-50 flex flex-col items-end gap-3 transition-all duration-300 ${!uiVisible ? 'opacity-0 pointer-events-none translate-y-[-20px]' : 'opacity-100 translate-y-0'}`}>
                {/* Stats Panel */}
                <div className="flex gap-4 mb-2">
                    <div className="bg-black/80 backdrop-blur border border-primary/50 text-emerald-400 px-4 py-2 rounded-none skew-x-[-10deg] shadow-[0_0_15px_rgba(0,255,65,0.2)]">
                        <div className="skew-x-[10deg] text-xs font-mono tracking-widest uppercase">Active</div>
                        <div className="skew-x-[10deg] text-2xl font-black font-mono leading-none text-center">{points.length}</div>
                    </div>
                    <div className="bg-black/80 backdrop-blur border border-blue-500/50 text-blue-400 px-4 py-2 rounded-none skew-x-[-10deg] shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <div className="skew-x-[10deg] text-xs font-mono tracking-widest uppercase">Max Points</div>
                        <div className="skew-x-[10deg] text-2xl font-black font-mono leading-none text-center">{maxPoints}</div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={toggleFullscreen}
                        className="bg-gray-900/80 backdrop-blur text-gray-300 border border-gray-700 hover:border-white hover:text-white px-4 py-2 rounded-none skew-x-[-10deg] transition-all"
                        title="Toggle Fullscreen"
                    >
                        <Maximize className="h-4 w-4 skew-x-[10deg]" />
                    </button>
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`bg-gray-900/80 backdrop-blur border border-gray-700 px-4 py-2 rounded-none skew-x-[-10deg] transition-all ${showGrid ? 'text-white border-white/60 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-gray-400'}`}
                        title="Toggle Linearity Grid"
                    >
                        <Grid className="h-4 w-4 skew-x-[10deg]" />
                    </button>
                    <button
                        onClick={clearCanvas}
                        className="bg-gray-900/80 backdrop-blur text-gray-300 border border-gray-700 hover:border-red-500 hover:text-red-500 px-4 py-2 rounded-none skew-x-[-10deg] transition-all"
                        title="Clear Canvas"
                    >
                        <Eraser className="h-4 w-4 skew-x-[10deg]" />
                    </button>
                </div>
            </div>

            {/* Hint */}
            {points.length === 0 && maxPoints === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                        <MousePointer className="h-16 w-16 text-primary relative z-10 animate-bounce" />
                    </div>
                    <div className="mt-8 text-primary font-bold text-2xl font-mono tracking-widest">
                        TOUCH SCREEN TO TEST
                    </div>
                    <div className="mt-2 text-gray-500 text-sm font-mono tracking-wide text-center">
                        Multi-touch • Force Touch • Persistent Drawing
                        <br /><span className="text-gray-600 block mt-1">3-Finger Double Tap to Clear</span>
                    </div>
                    <div className="absolute bottom-20 text-gray-600 text-xs font-mono animate-pulse">
                        [ SYSTEM READY ]
                    </div>
                </div>
            )}

            {/* Active Points Visualizers (Cyberpunk Rings) - Uses same color as path */}
            {points.map(p => (
                <div
                    key={p.id}
                    className="absolute pointer-events-none"
                    style={{ top: p.y, left: p.x, transform: 'translate(-50%, -50%)' }}
                >
                    {/* Outer Ring */}
                    <div
                        className="w-20 h-20 border rounded-full animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]"
                        style={{ borderColor: p.color, opacity: 0.5 }}
                    />
                    {/* Inner Ring */}
                    <div
                        className="absolute top-1/2 left-1/2 w-12 h-12 border-2 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        style={{ borderColor: p.color }}
                    />
                    {/* Core */}
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />

                    {/* Coordinates Label */}
                    <div className="absolute top-10 left-10 bg-black/80 border px-2 py-0.5 text-[10px] font-mono whitespace-nowrap" style={{ borderColor: p.color, color: p.color }}>
                        X:{Math.round(p.x)} Y:{Math.round(p.y)} F:{p.force.toFixed(2)}
                    </div>
                </div>
            ))}

            <canvas
                ref={canvasRef}
                className="block w-full h-full"
                onTouchStart={handleTouchStart} // Added Start
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                // Mouse fallback
                onMouseDown={(e) => {
                    e.target.isDrawing = true;
                    handleTouchStart({ touches: [{ clientX: e.clientX, clientY: e.clientY, identifier: 0, force: 0.5 }], preventDefault: () => { } });
                }}
                onMouseMove={(e) => {
                    if (e.target.isDrawing) {
                        handleTouchMove({ touches: [{ clientX: e.clientX, clientY: e.clientY, identifier: 0, force: 0.5 }], preventDefault: () => { } });
                    }
                }}
                onMouseUp={(e) => {
                    e.target.isDrawing = false;
                    handleTouchEnd({ touches: [], preventDefault: () => { } });
                }}
                onMouseLeave={(e) => {
                    e.target.isDrawing = false;
                    handleTouchEnd({ touches: [], preventDefault: () => { } });
                }}
            />
        </div>
    );
};

export default TouchTest;
