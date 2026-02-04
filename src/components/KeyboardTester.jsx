import React, { useState, useEffect, useCallback, useRef } from 'react';
import useStore from '../store/useStore';
import { ArrowLeft, RefreshCcw, Terminal, Layout, Monitor } from 'lucide-react';

// Laptop 75% Layout Definition
const LAPTOP_LAYOUT = [
    // Row 1: Function Keys
    [
        { code: 'Escape', label: 'ESC', w: 1 },
        { spacer: 0.5 },
        { code: 'F1', label: 'F1' }, { code: 'F2', label: 'F2' }, { code: 'F3', label: 'F3' }, { code: 'F4', label: 'F4' },
        { spacer: 0.5 },
        { code: 'F5', label: 'F5' }, { code: 'F6', label: 'F6' }, { code: 'F7', label: 'F7' }, { code: 'F8', label: 'F8' },
        { spacer: 0.5 },
        { code: 'F9', label: 'F9' }, { code: 'F10', label: 'F10' }, { code: 'F11', label: 'F11' }, { code: 'F12', label: 'F12' },
        { spacer: 0.5 },
        { code: 'PrintScreen', label: 'PRT' }, { code: 'Delete', label: 'DEL' }
    ],
    // Row 2: Numbers
    [
        { code: 'Backquote', label: '~' }, { code: 'Digit1', label: '1' }, { code: 'Digit2', label: '2' }, { code: 'Digit3', label: '3' }, { code: 'Digit4', label: '4' }, { code: 'Digit5', label: '5' }, { code: 'Digit6', label: '6' }, { code: 'Digit7', label: '7' }, { code: 'Digit8', label: '8' }, { code: 'Digit9', label: '9' }, { code: 'Digit0', label: '0' }, { code: 'Minus', label: '-' }, { code: 'Equal', label: '=' }, { code: 'Backspace', label: 'BKSP', w: 2 }, { code: 'Home', label: 'HM' }
    ],
    // Row 3: Tab/QWERTY
    [
        { code: 'Tab', label: 'TAB', w: 1.5 }, { code: 'KeyQ', label: 'Q' }, { code: 'KeyW', label: 'W' }, { code: 'KeyE', label: 'E' }, { code: 'KeyR', label: 'R' }, { code: 'KeyT', label: 'T' }, { code: 'KeyY', label: 'Y' }, { code: 'KeyU', label: 'U' }, { code: 'KeyI', label: 'I' }, { code: 'KeyO', label: 'O' }, { code: 'KeyP', label: 'P' }, { code: 'BracketLeft', label: '[' }, { code: 'BracketRight', label: ']' }, { code: 'Backslash', label: '\\', w: 1.5 }, { code: 'End', label: 'END' }
    ],
    // Row 4: Caps/ASDF
    [
        { code: 'CapsLock', label: 'CAPS', w: 1.75 }, { code: 'KeyA', label: 'A' }, { code: 'KeyS', label: 'S' }, { code: 'KeyD', label: 'D' }, { code: 'KeyF', label: 'F' }, { code: 'KeyG', label: 'G' }, { code: 'KeyH', label: 'H' }, { code: 'KeyJ', label: 'J' }, { code: 'KeyK', label: 'K' }, { code: 'KeyL', label: 'L' }, { code: 'Semicolon', label: ';' }, { code: 'Quote', label: "'" }, { code: 'Enter', label: 'ENTER', w: 2.25 }, { code: 'PageUp', label: 'PU' }
    ],
    // Row 5: Shift/ZXCV
    [
        { code: 'ShiftLeft', label: 'SHIFT', w: 2.25 }, { code: 'KeyZ', label: 'Z' }, { code: 'KeyX', label: 'X' }, { code: 'KeyC', label: 'C' }, { code: 'KeyV', label: 'V' }, { code: 'KeyB', label: 'B' }, { code: 'KeyN', label: 'N' }, { code: 'KeyM', label: 'M' }, { code: 'Comma', label: ',' }, { code: 'Period', label: '.' }, { code: 'Slash', label: '/' }, { code: 'ShiftRight', label: 'SHIFT', w: 1.75 }, { code: 'ArrowUp', label: '↑' }, { code: 'PageDown', label: 'PD' }
    ],
    // Row 6: Bottom Row
    [
        { code: 'ControlLeft', label: 'CTRL', w: 1.25 },
        { code: 'MetaLeft', label: 'WIN', w: 1.25 },
        { code: 'ValidationFn', label: 'FN', w: 1.25, isVirtual: true },
        { code: 'AltLeft', label: 'ALT', w: 1.25 },
        { code: 'Space', label: '', w: 6.25 },
        { code: 'AltRight', label: 'ALT', w: 1 },
        { code: 'ControlRight', label: 'CTRL', w: 1 },
        { code: 'ArrowLeft', label: '←' },
        { code: 'ArrowDown', label: '↓' },
        { code: 'ArrowRight', label: '→' }
    ]
];

// Laptop 96% Layout (With Numpad)
const LAPTOP_NUMPAD_LAYOUT = [
    // Row 1
    [
        { code: 'Escape', label: 'ESC', w: 1 }, { spacer: 0.5 }, { code: 'F1', label: 'F1' }, { code: 'F2', label: 'F2' }, { code: 'F3', label: 'F3' }, { code: 'F4', label: 'F4' }, { spacer: 0.5 }, { code: 'F5', label: 'F5' }, { code: 'F6', label: 'F6' }, { code: 'F7', label: 'F7' }, { code: 'F8', label: 'F8' }, { spacer: 0.5 }, { code: 'F9', label: 'F9' }, { code: 'F10', label: 'F10' }, { code: 'F11', label: 'F11' }, { code: 'F12', label: 'F12' }, { spacer: 0.5 }, { code: 'Delete', label: 'DEL' }, { code: 'Home', label: 'HM' }, { code: 'End', label: 'END' }, { code: 'PageUp', label: 'PU' }, { code: 'PageDown', label: 'PD' }
    ],
    // Row 2
    [
        { code: 'Backquote', label: '~' }, { code: 'Digit1', label: '1' }, { code: 'Digit2', label: '2' }, { code: 'Digit3', label: '3' }, { code: 'Digit4', label: '4' }, { code: 'Digit5', label: '5' }, { code: 'Digit6', label: '6' }, { code: 'Digit7', label: '7' }, { code: 'Digit8', label: '8' }, { code: 'Digit9', label: '9' }, { code: 'Digit0', label: '0' }, { code: 'Minus', label: '-' }, { code: 'Equal', label: '=' }, { code: 'Backspace', label: 'BKSP', w: 2 }, { code: 'NumLock', label: 'N' }, { code: 'NumpadDivide', label: '/' }, { code: 'NumpadMultiply', label: '*' }, { code: 'NumpadSubtract', label: '-' }
    ],
    // Row 3
    [
        { code: 'Tab', label: 'TAB', w: 1.5 }, { code: 'KeyQ', label: 'Q' }, { code: 'KeyW', label: 'W' }, { code: 'KeyE', label: 'E' }, { code: 'KeyR', label: 'R' }, { code: 'KeyT', label: 'T' }, { code: 'KeyY', label: 'Y' }, { code: 'KeyU', label: 'U' }, { code: 'KeyI', label: 'I' }, { code: 'KeyO', label: 'O' }, { code: 'KeyP', label: 'P' }, { code: 'BracketLeft', label: '[' }, { code: 'BracketRight', label: ']' }, { code: 'Backslash', label: '\\', w: 1.5 }, { code: 'Numpad7', label: '7' }, { code: 'Numpad8', label: '8' }, { code: 'Numpad9', label: '9' }, { code: 'NumpadAdd', label: '+', w: 1 }
    ],
    // Row 4
    [
        { code: 'CapsLock', label: 'CAPS', w: 1.75 }, { code: 'KeyA', label: 'A' }, { code: 'KeyS', label: 'S' }, { code: 'KeyD', label: 'D' }, { code: 'KeyF', label: 'F' }, { code: 'KeyG', label: 'G' }, { code: 'KeyH', label: 'H' }, { code: 'KeyJ', label: 'J' }, { code: 'KeyK', label: 'K' }, { code: 'KeyL', label: 'L' }, { code: 'Semicolon', label: ';' }, { code: 'Quote', label: "'" }, { code: 'Enter', label: 'ENTER', w: 2.25 }, { code: 'Numpad4', label: '4' }, { code: 'Numpad5', label: '5' }, { code: 'Numpad6', label: '6' }, { spacer: 1 }
    ],
    // Row 5
    [
        { code: 'ShiftLeft', label: 'SHIFT', w: 2.25 }, { code: 'KeyZ', label: 'Z' }, { code: 'KeyX', label: 'X' }, { code: 'KeyC', label: 'C' }, { code: 'KeyV', label: 'V' }, { code: 'KeyB', label: 'B' }, { code: 'KeyN', label: 'N' }, { code: 'KeyM', label: 'M' }, { code: 'Comma', label: ',' }, { code: 'Period', label: '.' }, { code: 'Slash', label: '/' }, { code: 'ShiftRight', label: 'SHIFT', w: 1.75 }, { code: 'ArrowUp', label: '↑' }, { code: 'Numpad1', label: '1' }, { code: 'Numpad2', label: '2' }, { code: 'Numpad3', label: '3' }, { code: 'NumpadEnter', label: 'E', w: 1 }
    ],
    // Row 6
    [
        { code: 'ControlLeft', label: 'CTRL', w: 1.25 }, { code: 'MetaLeft', label: 'WIN', w: 1.25 }, { code: 'ValidationFn', label: 'FN', w: 1.25, isVirtual: true }, { code: 'AltLeft', label: 'ALT', w: 1.25 }, { code: 'Space', label: '', w: 6.25 }, { code: 'AltRight', label: 'ALT', w: 1 }, { code: 'ControlRight', label: 'CTRL', w: 1 }, { code: 'ArrowLeft', label: '←' }, { code: 'ArrowDown', label: '↓' }, { code: 'ArrowRight', label: '→' }, { code: 'Numpad0', label: '0', w: 2 }, { code: 'NumpadDecimal', label: '.' }, { spacer: 1 }
    ]
];

// Full 104-Key Layout
const FULL_LAYOUT = [
    // Row 1
    [{ code: 'Escape', label: 'ESC', w: 1 }, { spacer: 1 }, { code: 'F1', label: 'F1' }, { code: 'F2', label: 'F2' }, { code: 'F3', label: 'F3' }, { code: 'F4', label: 'F4' }, { spacer: 0.5 }, { code: 'F5', label: 'F5' }, { code: 'F6', label: 'F6' }, { code: 'F7', label: 'F7' }, { code: 'F8', label: 'F8' }, { spacer: 0.5 }, { code: 'F9', label: 'F9' }, { code: 'F10', label: 'F10' }, { code: 'F11', label: 'F11' }, { code: 'F12', label: 'F12' }, { spacer: 0.5 }, { code: 'PrintScreen', label: 'PRT' }, { code: 'ScrollLock', label: 'SCR' }, { code: 'Pause', label: 'PAU' }],
    // Row 2
    [{ code: 'Backquote', label: '~' }, { code: 'Digit1', label: '1' }, { code: 'Digit2', label: '2' }, { code: 'Digit3', label: '3' }, { code: 'Digit4', label: '4' }, { code: 'Digit5', label: '5' }, { code: 'Digit6', label: '6' }, { code: 'Digit7', label: '7' }, { code: 'Digit8', label: '8' }, { code: 'Digit9', label: '9' }, { code: 'Digit0', label: '0' }, { code: 'Minus', label: '-' }, { code: 'Equal', label: '=' }, { code: 'Backspace', label: 'BKSP', w: 2 }, { spacer: 0.5 }, { code: 'Insert', label: 'INS' }, { code: 'Home', label: 'HM' }, { code: 'PageUp', label: 'PU' }, { spacer: 0.5 }, { code: 'NumLock', label: 'NM' }, { code: 'NumpadDivide', label: '/' }, { code: 'NumpadMultiply', label: '*' }, { code: 'NumpadSubtract', label: '-' }],
    // Row 3
    [{ code: 'Tab', label: 'TAB', w: 1.5 }, { code: 'KeyQ', label: 'Q' }, { code: 'KeyW', label: 'W' }, { code: 'KeyE', label: 'E' }, { code: 'KeyR', label: 'R' }, { code: 'KeyT', label: 'T' }, { code: 'KeyY', label: 'Y' }, { code: 'KeyU', label: 'U' }, { code: 'KeyI', label: 'I' }, { code: 'KeyO', label: 'O' }, { code: 'KeyP', label: 'P' }, { code: 'BracketLeft', label: '[' }, { code: 'BracketRight', label: ']' }, { code: 'Backslash', label: '\\', w: 1.5 }, { spacer: 0.5 }, { code: 'Delete', label: 'DEL' }, { code: 'End', label: 'END' }, { code: 'PageDown', label: 'PD' }, { spacer: 0.5 }, { code: 'Numpad7', label: '7' }, { code: 'Numpad8', label: '8' }, { code: 'Numpad9', label: '9' }, { code: 'NumpadAdd', label: '+', w: 1 }],
    // Row 4
    [{ code: 'CapsLock', label: 'CAPS', w: 1.75 }, { code: 'KeyA', label: 'A' }, { code: 'KeyS', label: 'S' }, { code: 'KeyD', label: 'D' }, { code: 'KeyF', label: 'F' }, { code: 'KeyG', label: 'G' }, { code: 'KeyH', label: 'H' }, { code: 'KeyJ', label: 'J' }, { code: 'KeyK', label: 'K' }, { code: 'KeyL', label: 'L' }, { code: 'Semicolon', label: ';' }, { code: 'Quote', label: "'" }, { code: 'Enter', label: 'ENTER', w: 2.25 }, { spacer: 4 }, { code: 'Numpad4', label: '4' }, { code: 'Numpad5', label: '5' }, { code: 'Numpad6', label: '6' }, { spacer: 1 }],
    // Row 5
    [{ code: 'ShiftLeft', label: 'SHIFT', w: 2.25 }, { code: 'KeyZ', label: 'Z' }, { code: 'KeyX', label: 'X' }, { code: 'KeyC', label: 'C' }, { code: 'KeyV', label: 'V' }, { code: 'KeyB', label: 'B' }, { code: 'KeyN', label: 'N' }, { code: 'KeyM', label: 'M' }, { code: 'Comma', label: ',' }, { code: 'Period', label: '.' }, { code: 'Slash', label: '/' }, { code: 'ShiftRight', label: 'SHIFT', w: 2.75 }, { spacer: 1.5 }, { code: 'ArrowUp', label: '↑' }, { spacer: 1.5 }, { code: 'Numpad1', label: '1' }, { code: 'Numpad2', label: '2' }, { code: 'Numpad3', label: '3' }, { code: 'NumpadEnter', label: 'ENT', w: 1 }],
    // Row 6
    [{ code: 'ControlLeft', label: 'CTRL', w: 1.25 }, { code: 'MetaLeft', label: 'WIN', w: 1.25 }, { code: 'AltLeft', label: 'ALT', w: 1.25 }, { code: 'Space', label: '', w: 6.25 }, { code: 'AltRight', label: 'ALT', w: 1.25 }, { code: 'MetaRight', label: 'WIN', w: 1.25 }, { code: 'ContextMenu', label: 'MN', w: 1.25 }, { code: 'ControlRight', label: 'CTRL', w: 1.25 }, { spacer: 0.5 }, { code: 'ArrowLeft', label: '←' }, { code: 'ArrowDown', label: '↓' }, { code: 'ArrowRight', label: '→' }, { spacer: 0.5 }, { code: 'Numpad0', label: '0', w: 2 }, { code: 'NumpadDecimal', label: '.' }, { spacer: 1 }]
];

const KeyboardTester = () => {
    const { setActiveTool } = useStore();
    const [activeKeys, setActiveKeys] = useState(new Set());
    const [testedKeys, setTestedKeys] = useState(new Set());
    const [maxRollover, setMaxRollover] = useState(0);
    const [eventLog, setEventLog] = useState([]);
    const [layout, setLayout] = useState('laptop'); // 'laptop', 'laptop_num', 'full'
    const [layoutName, setLayoutName] = useState('Standard HID');
    const logEndRef = useRef(null);

    // Auto-detect best layout based on screen width
    useEffect(() => {
        if (window.innerWidth > 1650) {
            setLayout('full');
        } else if (window.innerWidth > 1400) {
            setLayout('laptop_num');
        } else {
            setLayout('laptop');
        }
    }, [])

    // Scroll log to bottom
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [eventLog]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            e.preventDefault();
            const code = e.code;

            setActiveKeys(prev => {
                const next = new Set(prev).add(code);
                if (next.size > maxRollover) setMaxRollover(next.size);
                return next;
            });

            setTestedKeys(prev => new Set(prev).add(code));

            // Add to Chatter Log with high precision
            const timestamp = new Date();
            const timeStr = `${timestamp.toLocaleTimeString([], { hour12: false })}.${String(timestamp.getMilliseconds()).padStart(3, '0')}`;

            setEventLog(prev => [
                ...prev.slice(-49), // Keep last 50 events
                { id: Date.now() + Math.random(), time: timeStr, code: code, key: e.key, type: 'down' }
            ]);
        };

        const handleKeyUp = (e) => {
            const code = e.code;
            setActiveKeys(prev => {
                const next = new Set(prev);
                next.delete(code);
                return next;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [maxRollover]);


    useEffect(() => {
        if (navigator.keyboard) {
            navigator.keyboard.getLayoutMap().then(() => {
                setLayoutName('Detected: ' + (navigator.language === 'en-US' ? 'ANSI (US)' : navigator.language.toUpperCase()));
            }).catch(() => {
                setLayoutName('Standard HID Keyboard');
            });
        }
    }, []);

    const resetTest = () => {
        setTestedKeys(new Set());
        setEventLog([]);
        setMaxRollover(0);
    };

    // Adaptive Scaling Logic
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                // Base widths in rem (approx): Laptop ~55rem (770px), Full ~75rem (1050px)
                const targetWidth = layout === 'laptop' ? 800 : 1150;
                const newScale = Math.min(1, (containerWidth - 40) / targetWidth); // -40 for padding
                setScale(newScale);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call

        // Small delay to allow layout paint
        setTimeout(handleResize, 100);

        return () => window.removeEventListener('resize', handleResize);
    }, [layout]);

    const currentLayout = layout === 'laptop_num' ? LAPTOP_NUMPAD_LAYOUT : LAPTOP_LAYOUT;

    return (
        <div className="fixed inset-0 bg-black text-gray-300 font-mono flex flex-col p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setActiveTool(null)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="tracking-widest text-sm font-bold">EXIT</span>
                    </button>
                    <div className="h-8 w-px bg-gray-800" />
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tighter leading-none">KEY_MATRIX<span className="text-[#00ff41]">.EXE</span></h1>
                        <div className="text-[10px] text-gray-500 tracking-[0.2em] uppercase">Mechanical Switch Diagnostic Tool</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Stats */}
                    <div className="flex bg-gray-900 border border-gray-800 rounded-sm overflow-hidden">
                        <div className="px-4 py-2 border-r border-gray-800">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">NKRO Max</div>
                            <div className="text-xl font-bold text-[#00ff41] leading-none mt-1">{maxRollover}</div>
                        </div>
                        <div className="px-4 py-2">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Tested</div>
                            <div className="text-xl font-bold text-white leading-none mt-1">{testedKeys.size}</div>
                        </div>
                    </div>

                    {/* Simplified Numpad Toggle */}
                    <button
                        onClick={() => setLayout(prev => prev === 'laptop' ? 'laptop_num' : 'laptop')}
                        className={`
                            px-4 py-2 rounded-sm border transition-all flex items-center gap-2
                            ${layout === 'laptop_num'
                                ? 'bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41]'
                                : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-gray-300'}
                        `}
                    >
                        <Layout className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {layout === 'laptop_num' ? 'Hide Numpad' : 'Show Numpad'}
                        </span>
                    </button>

                    {/* Device Info Panel */}
                    <div className="hidden lg:flex flex-col items-end">
                        <div className="bg-gray-900 border border-gray-800 rounded-sm px-3 py-1.5 flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-[#00ff41] rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Input Source Active</span>
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono">
                            LAYOUT: <span className="text-gray-400">{layoutName}</span>
                        </div>
                    </div>

                    <button
                        onClick={resetTest}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-2 rounded-sm transition-all flex items-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-8 min-h-0">
                {/* Keyboard Visualizer */}
                <div ref={containerRef} className="flex-1 bg-gray-900/50 border border-gray-800 rounded-lg p-8 flex items-center justify-center relative overflow-hidden">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                    <div
                        className="relative z-10 origin-center transition-all duration-300 ease-out"
                        style={{ transform: `scale(${scale})`, width: layout === 'laptop' ? '800px' : '1150px' }}
                    >
                        {currentLayout.map((row, rIndex) => (
                            <div key={rIndex} className="flex gap-2 mb-2 justify-center">
                                {row.map((key, kIndex) => {
                                    if (key.spacer) return <div key={kIndex} style={{ width: `${key.spacer * 3.5}rem` }} />;

                                    const code = key.code;
                                    const isActive = activeKeys.has(code);
                                    const isTested = testedKeys.has(code);

                                    // Visual Logic per specs
                                    let keyStyle = "bg-[#111] border-gray-700 text-gray-600";
                                    let shadowStyle = "";

                                    if (isActive) {
                                        keyStyle = "bg-[#00ff41] border-[#00ff41] text-black shadow-[0_0_20px_rgba(0,255,65,0.6)] translate-y-[2px]";
                                    } else if (isTested) {
                                        keyStyle = "bg-[#00ff41]/10 border-[#00ff41]/40 text-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.1)]";
                                    } else if (key.isVirtual) {
                                        keyStyle = "bg-gray-800/50 border-gray-700/50 text-gray-600 cursor-not-allowed"; // Fn key usually not detectable
                                    }

                                    const w = key.w || 1;
                                    const h = key.h || 1;
                                    return (
                                        <div
                                            key={kIndex}
                                            className={`
                                                rounded-sm border-b-4 active:border-b-0
                                                flex items-center justify-center font-bold text-sm select-none transition-all duration-75
                                                ${keyStyle}
                                            `}
                                            style={{
                                                width: `${w * 3.5}rem`,
                                                height: `${h * 3.5}rem` // Use h multiplier (default 1 = 3.5rem)
                                            }}
                                        >
                                            {key.label}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chatter Log (Terminal Feed) */}
                <div className="w-80 bg-black border border-gray-800 rounded-lg flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#00ff41]" />
                        <span className="text-xs font-bold text-gray-400 tracking-wider">EVENT LOG</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
                        {eventLog.length === 0 && (
                            <div className="text-gray-700 italic text-center mt-10">Waiting for input...</div>
                        )}
                        {eventLog.map((log) => (
                            <div key={log.id} className={`grid grid-cols-[1fr_auto] gap-2 border-b border-gray-900 pb-1 mb-1 last:border-0 hover:bg-gray-900/30 ${log.isChatter ? 'bg-red-500/20' : ''}`}>
                                <div>
                                    <span className="text-gray-500">[{log.time}]</span>{' '}
                                    <span className={`${log.isChatter ? 'text-red-500 animate-pulse' : 'text-[#00ff41]'} font-bold`}>
                                        {log.code} {log.isChatter && `(!${log.delta}ms)`}
                                    </span>
                                </div>
                                <div className="text-gray-600">{log.key}</div>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeyboardTester;
