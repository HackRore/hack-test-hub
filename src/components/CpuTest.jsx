import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { ArrowLeft, Cpu, Activity, Play, Square, Zap } from 'lucide-react';

const WORKER_CODE = `
self.onmessage = function(e) {
    const { type, duration } = e.data;
    if (type === 'start') {
        const endTime = Date.now() + duration;
        let ops = 0;
        let primesFound = 0;
        
        // Sieve of Eratosthenes Loop
        // We repeatedly sieve a block to generate load
        while (Date.now() < endTime) {
            const size = 10000;
            const sieve = new Uint8Array(size).fill(1);
            sieve[0] = 0;
            sieve[1] = 0;
            
            for (let i = 2; i <= Math.sqrt(size); i++) {
                if (sieve[i]) {
                    for (let j = i * i; j < size; j += i) {
                        sieve[j] = 0;
                    }
                }
            }
            
            // Count primes in this block to ensure memory is read
            for (let i = 0; i < size; i++) {
                if (sieve[i]) primesFound++;
            }
            
            ops += size; // Count operations as items sieved
            
            // Report progress
            if (ops % 200000 === 0) {
                 self.postMessage({ type: 'progress', ops, primesFound });
            }
        }
        self.postMessage({ type: 'complete', ops, primesFound });
    }
};
`;

const CpuTest = () => {
    const { setActiveTool } = useStore();
    const [isRunning, setIsRunning] = useState(false);
    const [threads, setThreads] = useState(navigator.hardwareConcurrency || 4);
    const [score, setScore] = useState(0);
    const [progress, setProgress] = useState(0);
    const [history, setHistory] = useState([]);
    const workersRef = useRef([]);

    useEffect(() => {
        return () => terminateWorkers();
    }, []);

    const terminateWorkers = () => {
        workersRef.current.forEach(w => w.terminate());
        workersRef.current = [];
    };

    const startTest = () => {
        if (isRunning) return;
        setIsRunning(true);
        setScore(0);
        setProgress(0);
        setHistory([]);
        terminateWorkers();

        const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const duration = 5000; // 5 seconds test
        let activeWorkers = threads;
        let totalOps = 0;

        for (let i = 0; i < threads; i++) {
            const worker = new Worker(url);
            worker.onmessage = (e) => {
                const { type, ops } = e.data;
                if (type === 'complete') {
                    totalOps += ops;
                    activeWorkers--;
                    if (activeWorkers === 0) {
                        finishTest(totalOps);
                    }
                }
            };
            worker.postMessage({ type: 'start', duration });
            workersRef.current.push(worker);
        }

        // Progress Timer
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const p = Math.min(100, (elapsed / duration) * 100);
            setProgress(p);

            // Mock Live Score for Visuals
            setHistory(prev => [...prev, Math.random() * 100].slice(-50));

            if (p >= 100) clearInterval(interval);
        }, 100);
    };

    const finishTest = (finalOps) => {
        setIsRunning(false);
        setScore(Math.round(finalOps / 5000)); // Ops per ms roughly
        terminateWorkers();
    };

    return (
        <div className="container mx-auto p-6 flex flex-col items-center">
            <div className="w-full flex items-center justify-start mb-8">
                <button
                    onClick={() => setActiveTool(null)}
                    className="text-primary hover:text-secondary font-mono flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> EXIT CPU LAB
                </button>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 max-w-4xl w-full">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Cpu className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">CPU NEURAL CORE STRESS</h2>
                        <div className="text-xs text-blue-400/80 font-mono tracking-widest uppercase">Multi-Threaded Performance Analysis</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Thread Count</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="16"
                                    value={threads}
                                    onChange={(e) => setThreads(Number(e.target.value))}
                                    className="w-full accent-blue-500"
                                    disabled={isRunning}
                                />
                                <span className="text-xl font-bold text-blue-400 font-mono w-8 text-center">{threads}</span>
                            </div>
                        </div>

                        {!isRunning ? (
                            <button
                                onClick={startTest}
                                className="w-full py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                            >
                                <Play className="h-5 w-5 fill-current" /> INITIATE STRESS
                            </button>
                        ) : (
                            <button
                                onClick={() => terminateWorkers() && setIsRunning(false)}
                                className="w-full py-4 bg-red-500/20 border border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center gap-3"
                            >
                                <Square className="h-5 w-5 fill-current" /> ABORT
                            </button>
                        )}

                        <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
                            <div className="text-xs text-gray-500 uppercase mb-1">Status</div>
                            <div className={`font-mono font-bold ${isRunning ? 'text-yellow-400 animate-pulse' : 'text-gray-400'}`}>
                                {isRunning ? 'CALCULATING...' : 'IDLE'}
                            </div>
                        </div>
                    </div>

                    {/* Visualization */}
                    <div className="md:col-span-2 bg-black/40 rounded-lg border border-gray-800 p-6 relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Graph */}
                        <div className="flex-1 flex items-end gap-1 mt-8 mb-4 min-h-[150px]">
                            {history.length === 0 && !score && (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 font-mono text-sm">
                                    AWAITING DATA STREAM
                                </div>
                            )}
                            {history.map((val, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-blue-500/50 rounded-t-sm"
                                    style={{ height: `${val}%` }}
                                />
                            ))}
                        </div>

                        {/* Result */}
                        <div className="flex items-center justify-between border-t border-gray-800 pt-6">
                            <div>
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Performance Index</div>
                                <div className="text-4xl font-black text-white font-mono tracking-tighter">
                                    {score > 0 ? score.toLocaleString() : '---'}
                                    <span className="text-lg text-gray-600 ml-2">OPS</span>
                                </div>
                            </div>
                            <Zap className={`h-12 w-12 ${isRunning ? 'text-yellow-400 animate-pulse' : 'text-gray-700'}`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CpuTest;
