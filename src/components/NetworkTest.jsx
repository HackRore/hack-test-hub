import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { Wifi, WifiOff, Activity, ArrowLeft, RefreshCw, Globe, CheckCircle, XCircle } from 'lucide-react';

const NetworkTest = () => {
    const { setActiveTool } = useStore();
    const [status, setStatus] = useState(navigator.onLine ? 'ONLINE' : 'OFFLINE');
    const [networkInfo, setNetworkInfo] = useState({});
    const [latencyHistory, setLatencyHistory] = useState([]);
    const [isPinging, setIsPinging] = useState(false);
    const [lastPing, setLastPing] = useState(null);

    // Get Network API Info
    const updateNetworkInfo = () => {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
            setNetworkInfo({
                type: conn.type || 'unknown',
                effectiveType: conn.effectiveType || 'unknown',
                rtt: conn.rtt || 0, // Round Trip Time estimate
                downlink: conn.downlink || 0, // Mb/s estimate
                saveData: conn.saveData || false
            });
        }
    };

    useEffect(() => {
        window.addEventListener('online', () => setStatus('ONLINE'));
        window.addEventListener('offline', () => setStatus('OFFLINE'));

        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
            updateNetworkInfo();
            conn.addEventListener('change', updateNetworkInfo);
        }

        return () => {
            window.removeEventListener('online', () => setStatus('ONLINE'));
            window.removeEventListener('offline', () => setStatus('OFFLINE'));
            if (conn) conn.removeEventListener('change', updateNetworkInfo);
        };
    }, []);

    // Manual Ping Test
    const runPingTest = async () => {
        setIsPinging(true);
        const samples = [];
        // Ping 10 times for better jitter data
        for (let i = 0; i < 10; i++) {
            const start = performance.now();
            try {
                // Fetch favicon with no-cache to force network request
                await fetch('/vite.svg?' + new Date().getTime(), { method: 'HEAD', cache: 'no-cache' });
                const end = performance.now();
                const latency = Math.round(end - start);
                samples.push(latency);
                setLastPing(latency);
                setLatencyHistory(prev => [...prev, latency].slice(-24));
            } catch (e) {
                setLatencyHistory(prev => [...prev, -1].slice(-24)); // -1 = Drop
            }
            await new Promise(r => setTimeout(r, 300));
        }

        // Calc Jitter (Avg difference between consecutive samples)
        if (samples.length > 1) {
            let totalDiff = 0;
            for (let i = 1; i < samples.length; i++) {
                totalDiff += Math.abs(samples[i] - samples[i - 1]);
            }
            setJitter(Math.round(totalDiff / (samples.length - 1)));
        }

        setIsPinging(false);
    };

    const getGrade = () => {
        if (lastPing === null) return { l: '?', c: 'text-gray-500' };
        if (lastPing < 30 && jitter < 5) return { l: 'S', c: 'text-primary' };
        if (lastPing < 60 && jitter < 15) return { l: 'A', c: 'text-green-400' };
        if (lastPing < 100) return { l: 'B', c: 'text-yellow-400' };
        return { l: 'F', c: 'text-red-500' };
    };
    const grade = getGrade();

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

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 max-w-3xl w-full">
                <div className="flex items-center gap-4 mb-8 text-primary">
                    <Activity className="h-10 w-10" />
                    <h2 className="text-2xl font-bold font-mono text-gray-100">CONNECTIVITY PULSE</h2>
                </div>

                {/* Status Header */}
                <div className={`p-6 rounded-lg mb-8 text-center border ${status === 'ONLINE' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <div className="flex justify-center items-center gap-3 mb-2">
                        {status === 'ONLINE' ? <Wifi className="h-12 w-12 text-green-500" /> : <WifiOff className="h-12 w-12 text-red-500" />}
                        <span className={`text-4xl font-bold font-mono ${status === 'ONLINE' ? 'text-green-500' : 'text-red-500'}`}>{status}</span>
                    </div>
                    <p className="font-mono text-gray-400 text-sm">
                        {networkInfo.effectiveType?.toUpperCase()} CONNECTION DETECTED
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Details Card */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-gray-400 font-mono text-sm mb-4 border-b border-gray-700 pb-2">CONNECTION DETAILS</h3>
                        <div className="space-y-4 font-mono">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Connection Tech</span>
                                <span className="text-primary">{networkInfo.effectiveType || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Est. Bandwidth</span>
                                <span className="text-primary">{networkInfo.downlink ? `~${networkInfo.downlink} Mbps` : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Est. RTT (API)</span>
                                <span className="text-primary">{networkInfo.rtt ? `${networkInfo.rtt} ms` : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Data Saver</span>
                                <span className={networkInfo.saveData ? 'text-green-500' : 'text-gray-300'}>{networkInfo.saveData ? 'ON' : 'OFF'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Live Ping Test */}
                    <div className="bg-gray-800 p-6 rounded-lg flex gap-4">
                        <div className="flex-1 flex flex-col">
                            <h3 className="text-gray-400 font-mono text-sm mb-4 border-b border-gray-700 pb-2 uppercase italic">Stability Analysis</h3>

                            <div className="flex-1 flex flex-col justify-center items-center mb-4 min-h-[100px]">
                                {isPinging ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                                        <span className="text-xs text-primary animate-pulse font-mono">SAMPLING...</span>
                                    </div>
                                ) : lastPing !== null ? (
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <div className="bg-black/30 p-2 rounded text-center">
                                            <div className="text-2xl font-bold text-primary font-mono">{lastPing}ms</div>
                                            <div className="text-[10px] text-gray-500 uppercase font-bold">Latency</div>
                                        </div>
                                        <div className="bg-black/30 p-2 rounded text-center">
                                            <div className="text-2xl font-bold text-yellow-400 font-mono">{jitter}ms</div>
                                            <div className="text-[10px] text-gray-500 uppercase font-bold">Jitter</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-600 font-mono text-xs uppercase tracking-widest border border-gray-800 p-4 rounded-lg bg-black/20">Awaiting Signal</div>
                                )}
                            </div>

                            <button
                                onClick={runPingTest}
                                disabled={isPinging}
                                className="w-full py-3 bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-black font-bold font-mono rounded transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Activity className="h-4 w-4" /> {isPinging ? 'MONITORING...' : 'INITIATE PULSE TEST'}
                            </button>
                        </div>

                        {/* Grade Badge */}
                        <div className="w-24 bg-black/40 rounded-lg border border-gray-700 flex flex-col items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-[10px] text-gray-500 font-bold uppercase mb-1 z-10">Grade</span>
                            <span className={`text-6xl font-black z-10 drop-shadow-lg ${grade.c}`}>{grade.l}</span>
                        </div>
                    </div>
                </div>

                {/* Visualizer */}
                <div className="mt-6 bg-gray-800 p-4 rounded-lg h-[100px] flex items-end gap-1 relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-xs text-gray-500 font-mono">LATENCY HISTORY (LAST 20)</div>
                    {latencyHistory.map((val, idx) => {
                        const height = val === -1 ? 100 : Math.min(val, 200) / 2; // Cap visual at 200ms
                        const isDrop = val === -1;
                        return (
                            <div
                                key={idx}
                                style={{ height: `${height}%`, width: '5%' }}
                                className={`rounded-t ${isDrop ? 'bg-red-500' : val < 50 ? 'bg-green-500' : val < 100 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                title={isDrop ? 'Timeout' : `${val}ms`}
                            />
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default NetworkTest;
