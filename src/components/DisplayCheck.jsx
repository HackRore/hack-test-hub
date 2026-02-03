import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { Maximize, ArrowLeft } from 'lucide-react';

const COLORS = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'];
const LABELS = ['Pure Black', 'Pure White', 'Red', 'Green', 'Blue'];

const DisplayCheck = () => {
    const { setActiveTool } = useStore();
    const [colorIndex, setColorIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    const handleClick = () => {
        if (isFullscreen) {
            setColorIndex((prev) => (prev + 1) % COLORS.length);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && isFullscreen) {
            setIsFullscreen(false);
        }
        if (e.key === ' ' || e.key === 'ArrowRight') {
            setColorIndex((prev) => (prev + 1) % COLORS.length);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    return (
        <div
            className={`w-full h-full flex flex-col items-center justify-center transition-colors duration-300 ${isFullscreen ? 'cursor-pointer' : ''}`}
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

                    <div className="text-center max-w-xl">
                        <h2 className="text-3xl font-bold font-mono text-gray-100 mb-6">DISPLAY DIAGNOSTIC</h2>
                        <p className="text-gray-400 mb-8 font-mono">
                            Checks for dead pixels and color accuracy.
                            <br />Click "START TEST" to enter fullscreen.
                            <br />Tap screen or Spacebar to cycle colors.
                            <br />Press ESC to exit.
                        </p>

                        <button
                            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                            className="flex items-center gap-2 bg-primary text-black px-8 py-3 rounded font-bold hover:bg-secondary hover:scale-105 transition-all"
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
