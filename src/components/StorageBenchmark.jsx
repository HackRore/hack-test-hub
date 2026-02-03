import React, { useState } from 'react';
import useStore from '../store/useStore';
import { HardDrive, ArrowLeft, Play, Trash2 } from 'lucide-react';

const CHUNK_SIZE_KB = 512;
const ITERATIONS = 20;

const StorageBenchmark = () => {
    const { setActiveTool } = useStore();
    const [results, setResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);

    const performTest = async () => {
        setIsRunning(true);
        setResults(null);
        setProgress(0);

        // 1. Generate Data (512KB String)
        const chunk = "X".repeat(CHUNK_SIZE_KB * 1024);
        const keys = [];

        try {
            // Yield to UI
            await new Promise(r => setTimeout(r, 100));

            // -- WRITE TEST --
            // -- WRITE TEST --
            const writeStart = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                const key = `HACKRORE_TEST_${i}`;
                localStorage.setItem(key, chunk);
                keys.push(key);
                setProgress(((i + 1) / (ITERATIONS * 2)) * 100);
                if (i % 5 === 0) await new Promise(r => setTimeout(r, 0)); // Yield
            }
            const writeEnd = performance.now();

            // -- READ TEST --
            const readStart = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                localStorage.getItem(keys[i]);
                setProgress(50 + ((i + 1) / (ITERATIONS * 2)) * 100);
                if (i % 5 === 0) await new Promise(r => setTimeout(r, 0)); // Yield
            }
            const readEnd = performance.now();

            // Calculations
            const totalSizeMB = (CHUNK_SIZE_KB * ITERATIONS) / 1024;

            const writeTimeSec = (writeEnd - writeStart) / 1000;
            const readTimeSec = (readEnd - readStart) / 1000;

            const writeSpeed = totalSizeMB / writeTimeSec;
            const readSpeed = totalSizeMB / readTimeSec;

            const writeLatency = (writeEnd - writeStart) / ITERATIONS;
            const readLatency = (readEnd - readStart) / ITERATIONS;

            setResults({
                writeSpeed: writeSpeed.toFixed(2),
                readSpeed: readSpeed.toFixed(2),
                writeLatency: writeLatency.toFixed(2),
                readLatency: readLatency.toFixed(2)
            });

        } catch (err) {
            console.error(err);
            alert("Storage Quota Exceeded or Error. Test Aborted.");
        } finally {
            // -- CLEANUP --
            keys.forEach(k => localStorage.removeItem(k));
            setIsRunning(false);
            setProgress(100);
        }
    };

    const getColor = (speed) => {
        const s = parseFloat(speed);
        if (s > 100) return 'text-primary'; // Green
        if (s > 50) return 'text-yellow-400'; // Yellow
        return 'text-red-500'; // Red
    };

    return (
        <div className="container mx-auto p-6 flex flex-col items-center">
            <div className="w-full flex items-center justify-start mb-8">
                <button
                    onClick={() => setActiveTool(null)}
                    className="text-primary hover:text-secondary font-mono flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> BACK
                </button>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 max-w-2xl w-full">
                <div className="flex items-center gap-4 mb-6 text-primary">
                    <HardDrive className="h-10 w-10" />
                    <h2 className="text-2xl font-bold font-mono text-gray-100">BROWSER STORAGE BENCHMARK</h2>
                </div>

                <div className="p-4 bg-gray-800/50 rounded mb-6 font-mono text-sm text-gray-400">
                    <p>Tests <strong>LocalStorage</strong> performance.</p>
                    <p>Note: This measures browser API overhead, not raw disk I/O.</p>
                    <p className="mt-2 text-yellow-500 flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Auto-Cleanup Enabled: Test data is removed immediately.
                    </p>
                </div>

                {!isRunning && !results && (
                    <button
                        onClick={performTest}
                        className="w-full py-4 bg-primary text-black font-bold font-mono rounded hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                    >
                        <Play className="h-5 w-5" /> START BENCHMARK
                    </button>
                )}

                {isRunning && (
                    <div className="my-8">
                        <div className="text-center font-mono text-primary mb-2">RUNNING DIAGNOSTICS... {Math.round(progress)}%</div>
                        <div className="w-full bg-gray-800 h-2 rounded overflow-hidden">
                            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}

                {results && (
                    <div className="grid grid-cols-2 gap-6 mt-6">
                        <div className="bg-gray-800 p-4 rounded text-center">
                            <h3 className="text-gray-400 font-mono text-xs mb-1">WRITE SPEED</h3>
                            <div className={`text-3xl font-bold font-mono ${getColor(results.writeSpeed)}`}>
                                {results.writeSpeed} <span className="text-sm text-gray-500">MB/s</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-mono">Lat: {results.writeLatency}ms</div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded text-center">
                            <h3 className="text-gray-400 font-mono text-xs mb-1">READ SPEED</h3>
                            <div className={`text-3xl font-bold font-mono ${getColor(results.readSpeed)}`}>
                                {results.readSpeed} <span className="text-sm text-gray-500">MB/s</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-mono">Lat: {results.readLatency}ms</div>
                        </div>

                        <button
                            onClick={performTest}
                            className="col-span-2 mt-4 py-2 border border-gray-700 text-gray-300 hover:border-primary hover:text-primary font-mono rounded transition-colors"
                        >
                            RE-RUN TEST
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StorageBenchmark;
