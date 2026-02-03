import React, { useRef, useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { MousePointer, ArrowLeft, Trash2, Grid, Maximize } from 'lucide-react';

const TouchTest = () => {
    const { setActiveTool } = useStore();
    const canvasRef = useRef(null);
    const [showGrid, setShowGrid] = useState(true);
    const [points, setPoints] = useState([]); // Active touch points
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const resize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                draw(); // Redraw immediately
            }
        };
        const syncFullscreen = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        window.addEventListener('resize', resize);
        document.addEventListener('fullscreenchange', syncFullscreen);
        resize();
        return () => {
            window.removeEventListener('resize', resize);
            document.removeEventListener('fullscreenchange', syncFullscreen);
        };
    }, []);

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

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Use composite operation to 'keep' drawings but clear transient UI? 
        // Actually, for a drawing app, we usually don't clear the whole thing every frame unless we keep a history.
        // Simplified: We will just draw ON TOP of the existing canvas for trails, and clear only when requested.

        // HOWEVER, to show the GRID below the drawing, we need layers or to redraw everything.
        // Let's use a dual-layer approach: CSS Grid for background, Canvas for drawing trails.
    };

    // We only need to draw the touch trails physically
    const handleTouchMove = (e) => {
        e.preventDefault(); // Prevent scrolling
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const newPoints = [];

        for (let i = 0; i < e.touches.length; i++) {
            const t = e.touches[i];
            const x = t.clientX - rect.left;
            const y = t.clientY - rect.top;

            newPoints.push({ id: t.identifier, x, y });

            // Draw Trail
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#00ff41'; // Primary Green
            ctx.fill();
        }
        setPoints(newPoints);
    };

    const handleTouchEnd = (e) => {
        e.preventDefault();
        // Update active points only
        const newPoints = [];
        const rect = canvasRef.current.getBoundingClientRect();
        for (let i = 0; i < e.touches.length; i++) {
            const t = e.touches[i];
            newPoints.push({ id: t.identifier, x: t.clientX - rect.left, y: t.clientY - rect.top });
        }
        setPoints(newPoints);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setPoints([]);
    };

    return (
        <div className="fixed inset-0 bg-black touch-none overflow-hidden">
            {/* Background Grid (CSS Pattern) */}
            {showGrid && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                        backgroundSize: '100px 100px'
                    }}
                />
            )}

            {/* UI Layer - Auto-hide when touching to allow testing edges */}
            <div className={`absolute top-4 left-4 z-50 flex gap-4 transition-opacity duration-300 ${points.length > 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button
                    onClick={() => setActiveTool(null)}
                    className="bg-gray-800/80 backdrop-blur text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 hover:bg-gray-700 font-bold text-sm border border-white/5"
                >
                    <ArrowLeft className="h-4 w-4" /> EXIT
                </button>
                <div className="bg-gray-800/80 backdrop-blur text-primary px-4 py-2 rounded shadow-lg font-mono text-sm border border-primary/50">
                    POINTS: {points.length}
                </div>
            </div>

            <div className={`absolute top-4 right-4 z-50 flex gap-4 transition-opacity duration-300 ${points.length > 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button
                    onClick={toggleFullscreen}
                    className="bg-gray-800/80 backdrop-blur text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 hover:bg-gray-700 font-bold text-sm border border-white/5"
                >
                    <Maximize className="h-4 w-4" /> {isFullscreen ? 'EXIT FULL' : 'FULL SCREEN'}
                </button>
                <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`bg-gray-800/80 backdrop-blur text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 hover:bg-gray-700 font-bold text-sm border border-white/5 ${showGrid ? 'text-primary border-primary/30' : ''}`}
                >
                    <Grid className="h-4 w-4" /> GRID
                </button>
                <button
                    onClick={clearCanvas}
                    className="bg-red-900/40 backdrop-blur text-red-500 px-4 py-2 rounded shadow-lg flex items-center gap-2 hover:bg-red-800 font-bold text-sm border border-red-500/30"
                >
                    <Trash2 className="h-4 w-4" /> CLEAR
                </button>
            </div>

            {/* Hint */}
            {points.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-gray-600 font-bold text-2xl animate-pulse select-none">
                        TOUCH SCREEN TO TEST
                    </div>
                    <div className="absolute bottom-20 text-gray-700 text-sm font-mono">
                        Tip: Use Full Screen to test corners.
                    </div>
                </div>
            )}

            {/* Active Points Visualizers (Rings) */}
            {points.map(p => (
                <div
                    key={p.id}
                    className="absolute w-16 h-16 border-2 border-primary rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ top: p.y, left: p.x }}
                >
                    <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                </div>
            ))}

            <canvas
                ref={canvasRef}
                className="block w-full h-full cursor-crosshair active:cursor-none"
                onTouchStart={handleTouchMove}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                // Mouse fallback for non-touch screens to at least test drawing
                onMouseDown={(e) => {
                    e.target.isDrawing = true;
                    handleTouchMove({ touches: [{ clientX: e.clientX, clientY: e.clientY, identifier: 'mouse' }], preventDefault: () => { } });
                }}
                onMouseMove={(e) => {
                    if (e.target.isDrawing) {
                        handleTouchMove({ touches: [{ clientX: e.clientX, clientY: e.clientY, identifier: 'mouse' }], preventDefault: () => { } });
                    }
                }}
                onMouseUp={(e) => {
                    e.target.isDrawing = false;
                    handleTouchEnd({ touches: [], preventDefault: () => { } });
                }}
            />
        </div>
    );
};

export default TouchTest;
