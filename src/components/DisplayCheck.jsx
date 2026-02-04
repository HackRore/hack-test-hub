import React, { useState, useEffect, useCallback, useRef } from 'react';
import useStore from '../store/useStore';
import { Maximize, ArrowLeft } from 'lucide-react';

const COLORS = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#00FFFF', '#FF00FF', '#FFFF00'];
const LABELS = ['Pure Black', 'Pure White', 'Red', 'Green', 'Blue', 'Cyan', 'Magenta', 'Yellow'];

const DisplayCheck = () => {
    const { setActiveTool } = useStore();
    const [colorIndex, setColorIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [displayInfo, setDisplayInfo] = useState(null);
    const [cursorVisible, setCursorVisible] = useState(true);
    const cursorTimeout = useRef(null);

    useEffect(() => {
        // Gather display information
        const info = {
            resolution: `${window.screen.width} × ${window.screen.height}`,
            availableResolution: `${window.screen.availWidth} × ${window.screen.availHeight}`,
            colorDepth: `${window.screen.colorDepth}-bit`,
            pixelRatio: window.devicePixelRatio || 1,
            orientation: window.screen.orientation?.type || 'N/A'
        };
        setDisplayInfo(info);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleClick = useCallback(() => {
        console.log('Click detected! isFullscreen:', isFullscreen, 'colorIndex:', colorIndex);
        if (isFullscreen) {
            setColorIndex((prev) => {
                const next = (prev + 1) % COLORS.length;
                console.log('Changing color from', prev, 'to', next, COLORS[next]);
                return next;
            });
        }
    }, [isFullscreen, colorIndex]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && isFullscreen) {
            setIsFullscreen(false);
        }
        if (isFullscreen && (e.key === ' ' || e.key === 'ArrowRight')) {
            e.preventDefault();
            setColorIndex((prev) => (prev + 1) % COLORS.length);
        }
    }, [isFullscreen]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        const onChange = () => {
            const newFullscreenState = !!document.fullscreenElement;
            setIsFullscreen(newFullscreenState);
            console.log("Fullscreen change event detected. isFullscreen:", newFullscreenState);
        };
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    useEffect(() => {
        if (!isFullscreen) {
            setCursorVisible(true);
            return;
        }

        const onMouseMove = () => {
            setCursorVisible(true);
            if (cursorTimeout.current) clearTimeout(cursorTimeout.current);
            cursorTimeout.current = setTimeout(() => {
                setCursorVisible(false);
            }, 2000);
        };

        window.addEventListener('mousemove', onMouseMove);
        // Initial timeout to hide cursor if no movement
        cursorTimeout.current = setTimeout(() => setCursorVisible(false), 2000);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            if (cursorTimeout.current) clearTimeout(cursorTimeout.current);
        };
    }, [isFullscreen]);


    return (
        <div
            className={`w-full h-full min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${isFullscreen && !cursorVisible ? 'cursor-none' : 'cursor-default'}`}
            style={{ backgroundColor: isFullscreen ? COLORS[colorIndex] : '' }}
            onClick={handleClick}
        >
            {!isFullscreen ? (
                <div className="container mx-auto p-6 flex flex-col items-center">
                    <div className="w-full flex items-center justify-start mb-12">
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveTool(null); }}
                            className="text-primary hover:text-secondary font-mono flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" /> BACK
                        </button>
                    </div>

                    <div className="text-center max-w-2xl">
                        <h2 className="text-3xl font-bold font-mono text-gray-100 mb-6">DISPLAY DIAGNOSTIC</h2>

                        {/* Display Info Panel */}
                        {displayInfo && (
                            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6 text-left">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Detected Display</h3>
                                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                                    <div>
                                        <span className="text-gray-500">Resolution:</span>
                                        <span className="text-gray-300 ml-2">{displayInfo.resolution}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Available:</span>
                                        <span className="text-gray-300 ml-2">{displayInfo.availableResolution}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Color Depth:</span>
                                        <span className="text-gray-300 ml-2">{displayInfo.colorDepth}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Pixel Ratio:</span>
                                        <span className="text-gray-300 ml-2">{displayInfo.pixelRatio}x</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <p className="text-gray-400 mb-8 font-mono text-sm">
                            Checks for dead pixels and color accuracy.
                            <br />Click "START TEST" to enter fullscreen.
                            <br />Tap screen or Spacebar to cycle colors.
                            <br />Press ESC to exit.
                        </p>

                        <button
                            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                            className="flex items-center gap-2 bg-primary text-black px-8 py-3 rounded font-bold hover:bg-secondary hover:scale-105 transition-all mx-auto"
                        >
                            <Maximize className="h-5 w-5" />
                            START TEST
                        </button>
                    </div>
                </div>
            ) : (
                /* Usage Hint Overlay (fades out?) - keeping simple for now */
                <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-mono pointer-events-none select-none">
                    {LABELS[colorIndex]} - Click to Cycle - ESC to Exit
                </div>
            )}
        </div>
    );
};

export default DisplayCheck;
