import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';

// Full 104-Key Layout Definition
const KEY_LAYOUT = [
    // Row 1
    [{ code: 'Escape', label: 'ESC', w: 1 }, { code: 'F1', label: 'F1' }, { code: 'F2', label: 'F2' }, { code: 'F3', label: 'F3' }, { code: 'F4', label: 'F4' }, { code: 'F5', label: 'F5' }, { code: 'F6', label: 'F6' }, { code: 'F7', label: 'F7' }, { code: 'F8', label: 'F8' }, { code: 'F9', label: 'F9' }, { code: 'F10', label: 'F10' }, { code: 'F11', label: 'F11' }, { code: 'F12', label: 'F12' }, { code: 'PrintScreen', label: 'PRTSC' }, { code: 'ScrollLock', label: 'SCRLK' }, { code: 'Pause', label: 'PAUSE' }],
    // Row 2
    [{ code: 'Backquote', label: '~' }, { code: 'Digit1', label: '1' }, { code: 'Digit2', label: '2' }, { code: 'Digit3', label: '3' }, { code: 'Digit4', label: '4' }, { code: 'Digit5', label: '5' }, { code: 'Digit6', label: '6' }, { code: 'Digit7', label: '7' }, { code: 'Digit8', label: '8' }, { code: 'Digit9', label: '9' }, { code: 'Digit0', label: '0' }, { code: 'Minus', label: '-' }, { code: 'Equal', label: '=' }, { code: 'Backspace', label: 'BACKSPACE', w: 2 }, { code: 'Insert', label: 'INS' }, { code: 'Home', label: 'HOME' }, { code: 'PageUp', label: 'PGUP' }, { code: 'NumLock', label: 'NUM' }, { code: 'NumpadDivide', label: '/' }, { code: 'NumpadMultiply', label: '*' }, { code: 'NumpadSubtract', label: '-' }],
    // Row 3
    [{ code: 'Tab', label: 'TAB', w: 1.5 }, { code: 'KeyQ', label: 'Q' }, { code: 'KeyW', label: 'W' }, { code: 'KeyE', label: 'E' }, { code: 'KeyR', label: 'R' }, { code: 'KeyT', label: 'T' }, { code: 'KeyY', label: 'Y' }, { code: 'KeyU', label: 'U' }, { code: 'KeyI', label: 'I' }, { code: 'KeyO', label: 'O' }, { code: 'KeyP', label: 'P' }, { code: 'BracketLeft', label: '[' }, { code: 'BracketRight', label: ']' }, { code: 'Backslash', label: '\\', w: 1.5 }, { code: 'Delete', label: 'DEL' }, { code: 'End', label: 'END' }, { code: 'PageDown', label: 'PGDN' }, { code: 'Numpad7', label: '7' }, { code: 'Numpad8', label: '8' }, { code: 'Numpad9', label: '9' }, { code: 'NumpadAdd', label: '+', h: 2 }],
    // Row 4
    [{ code: 'CapsLock', label: 'CAPS', w: 1.75 }, { code: 'KeyA', label: 'A' }, { code: 'KeyS', label: 'S' }, { code: 'KeyD', label: 'D' }, { code: 'KeyF', label: 'F' }, { code: 'KeyG', label: 'G' }, { code: 'KeyH', label: 'H' }, { code: 'KeyJ', label: 'J' }, { code: 'KeyK', label: 'K' }, { code: 'KeyL', label: 'L' }, { code: 'Semicolon', label: ';' }, { code: 'Quote', label: "'" }, { code: 'Enter', label: 'ENTER', w: 2.25 }, { className: 'invisible' }, { className: 'invisible' }, { className: 'invisible' }, { code: 'Numpad4', label: '4' }, { code: 'Numpad5', label: '5' }, { code: 'Numpad6', label: '6' }],
    // Row 5
    [{ code: 'ShiftLeft', label: 'SHIFT', w: 2.25 }, { code: 'KeyZ', label: 'Z' }, { code: 'KeyX', label: 'X' }, { code: 'KeyC', label: 'C' }, { code: 'KeyV', label: 'V' }, { code: 'KeyB', label: 'B' }, { code: 'KeyN', label: 'N' }, { code: 'KeyM', label: 'M' }, { code: 'Comma', label: ',' }, { code: 'Period', label: '.' }, { code: 'Slash', label: '/' }, { code: 'ShiftRight', label: 'SHIFT', w: 2.75 }, { className: 'invisible' }, { code: 'ArrowUp', label: '↑' }, { className: 'invisible' }, { code: 'Numpad1', label: '1' }, { code: 'Numpad2', label: '2' }, { code: 'Numpad3', label: '3' }, { code: 'NumpadEnter', label: 'ENT', h: 2 }],
    // Row 6
    [{ code: 'ControlLeft', label: 'CTRL', w: 1.25 }, { code: 'MetaLeft', label: 'WIN', w: 1.25 }, { code: 'AltLeft', label: 'ALT', w: 1.25 }, { code: 'Space', label: 'SPACE', w: 6.25 }, { code: 'AltRight', label: 'ALT', w: 1.25 }, { code: 'MetaRight', label: 'WIN', w: 1.25 }, { code: 'ContextMenu', label: 'MENU', w: 1.25 }, { code: 'ControlRight', label: 'CTRL', w: 1.25 }, { code: 'ArrowLeft', label: '←' }, { code: 'ArrowDown', label: '↓' }, { code: 'ArrowRight', label: '→' }, { code: 'Numpad0', label: '0', w: 2 }, { code: 'NumpadDecimal', label: '.' }]
];

const KeyboardTester = () => {
    const { setActiveTool, addKeyToHistory, keyHistory } = useStore();
    const [activeKeys, setActiveKeys] = useState(new Set());
    const [testedKeys, setTestedKeys] = useState(new Set());
    const [maxRollover, setMaxRollover] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            e.preventDefault();
            const code = e.code;

            setActiveKeys(prev => {
                const next = new Set(prev).add(code);
                // Track Rollover peak
                if (next.size > maxRollover) setMaxRollover(next.size);
                return next;
            });

            setTestedKeys(prev => new Set(prev).add(code));
            addKeyToHistory({ code: e.code, key: e.key, time: Date.now() });
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
    }, [addKeyToHistory]);

    const resetTest = () => {
        setTestedKeys(new Set());
        // clearKeyHistory(); // Optional: Clear history too
    };

    return (
        <div className="container mx-auto p-6 min-h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveTool(null)}
                        className="text-primary hover:text-secondary font-mono"
                    >
                        &lt; BACK
                    </button>
                    <h2 className="text-2xl font-bold font-mono text-gray-100">KEYBOARD TESTER</h2>
                </div>
                <div className="flex gap-4">
                    <div className="bg-gray-800 px-4 py-2 rounded text-sm font-mono flex gap-3 border border-gray-700">
                        <div>
                            <span className="text-gray-500 uppercase text-[10px] block">Tested</span>
                            <span className="text-primary font-bold text-lg">{testedKeys.size}</span>
                        </div>
                        <div className="border-l border-gray-700 pl-3">
                            <span className="text-gray-500 uppercase text-[10px] block">NKRO Peak</span>
                            <span className="text-yellow-400 font-bold text-lg">{maxRollover}</span>
                        </div>
                    </div>
                    <button
                        onClick={resetTest}
                        className="bg-gray-800 px-4 py-2 rounded text-sm font-mono hover:bg-red-900/50 text-red-100 transition-colors border border-red-900/30"
                    >
                        RESET
                    </button>
                </div>
            </div>

            {/* Keyboard Visualizer */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-900/30 rounded-xl border border-gray-800 mb-6 w-full overflow-x-auto">
                <div className="flex flex-col gap-2 min-w-[1000px]">
                    {KEY_LAYOUT.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-2 justify-center">
                            {row.map((key, keyIndex) => {
                                if (key.className === 'invisible') return <div key={keyIndex} className="w-12 h-12 invisible" />; // Spacer

                                const isActive = activeKeys.has(key.code);
                                const isTested = testedKeys.has(key.code);

                                let bgClass = "bg-gray-800 border-gray-700";
                                if (isActive) bgClass = "bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,255,65,0.5)] transform scale-95";
                                else if (isTested) bgClass = "bg-primary/20 text-primary border-primary/50";

                                const widthStyle = key.w ? `${key.w * 3.5}rem` : '3.5rem'; // Base size multiplier
                                const heightStyle = key.h ? `${key.h * 3.5}rem` : '3.5rem';

                                return (
                                    <div
                                        key={key.code || keyIndex}
                                        className={`
                      ${bgClass} border-2 rounded flex items-center justify-center
                      font-mono font-bold text-sm transition-all duration-75 select-none
                    `}
                                        style={{ width: widthStyle, height: heightStyle }}
                                    >
                                        {key.label}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Log */}
            <div className="h-32 bg-black border border-gray-800 rounded p-4 font-mono text-xs overflow-y-auto">
                <div className="text-gray-500 mb-2">Event Log:</div>
                {keyHistory.slice().reverse().map((k, i) => (
                    <div key={i} className="text-gray-300">
                        <span className="text-gray-500">[{new Date(k.time).toLocaleTimeString()}]</span> Key: <span className="text-primary">{k.key}</span> (Code: {k.code})
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KeyboardTester;
