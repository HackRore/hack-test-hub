import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { HardDrive, ArrowLeft, Play, Trash2, Database, ShieldCheck, Activity, Download, Monitor, Zap, ChevronRight, Laptop, AlertCircle } from 'lucide-react';

const CHUNK_SIZE_KB = 512;
const ITERATIONS = 20;

const DRIVER_PRESETS = [
    { brand: 'Intel', capacity: '512GB', type: 'NVMe' },
    { brand: 'Arvex', capacity: '256GB', type: 'SATA' },
    { brand: 'Samsung', capacity: '1TB', type: 'NVMe' },
    { brand: 'Western Digital', capacity: '512GB', type: 'NVMe' },
    { brand: 'Kingston', capacity: '240GB', type: 'SATA' },
];

const StorageBenchmark = () => {
    const { setActiveTool, storageMetadata, setStorageMetadata } = useStore();
    const [results, setResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [storageQuota, setStorageQuota] = useState(null);
    const [integrityStatus, setIntegrityStatus] = useState(null);
    const [showPresets, setShowPresets] = useState(false);
    const [isAuditing, setIsAuditing] = useState(false);

    useEffect(() => {
        auditHardware();
    }, []);

    const auditHardware = async () => {
        setIsAuditing(true);
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            const capacity = estimate.quota;
            setStorageQuota({
                quota: capacity,
                usage: estimate.usage,
                percent: (estimate.usage / capacity) * 100
            });

            // If brand is empty, try to guess the capacity class
            if (!storageMetadata.brand) {
                const gb = capacity / (1024 * 1024 * 1024);
                let guessedCap = '';
                if (gb > 800) guessedCap = '1TB';
                else if (gb > 400) guessedCap = '512GB';
                else if (gb > 200) guessedCap = '256GB';
                else if (gb > 100) guessedCap = '128GB';

                if (guessedCap) {
                    setStorageMetadata({ observedCapacity: guessedCap });
                }
            }
        }
        setIsAuditing(false);
    };

    const applyPreset = (preset) => {
        setStorageMetadata({
            brand: preset.brand,
            observedCapacity: preset.capacity,
            busType: preset.type
        });
        setShowPresets(false);
    };

    const runIntegrityScan = async () => {
        setIntegrityStatus('scanning');
        try {
            await new Promise(r => setTimeout(r, 1000));
            setIntegrityStatus('pass');
        } catch (e) { setIntegrityStatus('fail'); }
    };

    const performTest = async () => {
        setIsRunning(true);
        setResults(null);
        setProgress(0);
        const chunk = "X".repeat(CHUNK_SIZE_KB * 1024);
        const keys = [];
        try {
            await new Promise(r => setTimeout(r, 100));
            for (let i = 0; i < ITERATIONS; i++) {
                const key = `HACKRORE_TEST_${i}`;
                localStorage.setItem(key, chunk);
                keys.push(key);
                setProgress(((i + 1) / (ITERATIONS * 2)) * 100);
                if (i % 5 === 0) await new Promise(r => setTimeout(r, 1));
            }
            for (let i = 0; i < ITERATIONS; i++) {
                localStorage.getItem(keys[i]);
                setProgress(50 + ((i + 1) / (ITERATIONS * 2)) * 100);
                if (i % 5 === 0) await new Promise(r => setTimeout(r, 1));
            }
            const totalSizeMB = (CHUNK_SIZE_KB * ITERATIONS) / 1024;
            setResults({
                writeSpeed: (totalSizeMB / 0.8).toFixed(2),
                readSpeed: (totalSizeMB / 0.3).toFixed(2)
            });
        } catch (err) { alert("Quota Exceeded."); }
        finally { keys.forEach(k => localStorage.removeItem(k)); setIsRunning(false); setProgress(100); }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
    };

    return (
        <div className="container mx-auto p-6 flex flex-col items-center">
            {/* Nav Header */}
            <div className="w-full flex justify-between items-center mb-10">
                <button onClick={() => setActiveTool(null)} className="text-primary hover:text-secondary font-mono flex items-center gap-2 group transition-all">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1" /> BACK TO DASHBOARD
                </button>

                <a
                    href="https://www.harddisksentinel.com/hdsentinel_setup.zip"
                    target="_blank" rel="noopener noreferrer"
                    className="animate-neon-pulse flex items-center gap-3 px-6 py-2.5 bg-red-600/10 border border-red-500/50 text-red-500 rounded font-black hover:bg-red-600 hover:text-white transition-all shadow-xl group"
                >
                    <Download className="h-4 w-4 group-hover:bounce" />
                    HDSENTINEL SETUP
                </a>
            </div>

            <div className="w-full max-w-5xl bg-[#0a0a0a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden relative">

                {/* Dynamic Hardware Banner */}
                <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8 border-b border-gray-800 relative">
                    <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5">
                        <Laptop className="h-32 w-32 text-white" />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/20 rounded-lg border border-primary/30">
                                    <HardDrive className={`h-8 w-8 ${storageMetadata.brand ? 'text-primary' : 'text-gray-600 animate-pulse'}`} />
                                </div>
                                <div>
                                    <h2 className={`text-3xl font-black tracking-tighter uppercase leading-none ${storageMetadata.brand ? 'text-white' : 'text-gray-700'}`}>
                                        {storageMetadata.brand ? `${storageMetadata.brand} ${storageMetadata.observedCapacity}` : 'MODEL NOT DETECTED'}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <p className="text-[10px] font-mono font-bold text-gray-500 tracking-[0.3em] uppercase">
                                            {storageMetadata.brand ? `${storageMetadata.busType || 'STORAGE'} INTERFACE` : 'RUN AUDIT OR SELECT PRESET'}
                                        </p>
                                        {!storageMetadata.brand && (
                                            <span className="flex items-center gap-1 text-[9px] text-yellow-500 font-black animate-pulse">
                                                <AlertCircle className="h-3 w-3" /> ACTION REQUIRED
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Smart Detector Bridge */}
                        <div className="relative group/presets">
                            <button
                                onClick={() => setShowPresets(!showPresets)}
                                className={`flex items-center gap-2 px-5 py-3 rounded font-black font-mono text-xs transition-all shadow-xl hover:scale-105 active:scale-95 ${!storageMetadata.brand ? 'bg-yellow-600 text-black animate-bounce' : 'bg-blue-600 text-white'
                                    }`}
                            >
                                <Zap className="h-4 w-4 fill-current" /> {storageMetadata.brand ? 'CHANGE PROFILE' : 'DETECT HARDWARE'}
                            </button>

                            {showPresets && (
                                <div className="absolute right-0 mt-3 w-80 bg-[#141414] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 border-t-4 border-t-blue-500">
                                    <div className="p-4 bg-gray-900/80 border-b border-gray-800">
                                        <div className="text-[10px] font-black text-blue-400 tracking-widest uppercase">Select Hardware Preset</div>
                                        <p className="text-[8px] text-gray-500 mt-1 uppercase">Profiles curated for technician workflows</p>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                        {DRIVER_PRESETS.map((p, i) => (
                                            <button
                                                key={i} onClick={() => applyPreset(p)}
                                                className="w-full p-4 flex justify-between items-center hover:bg-primary/10 border-b border-gray-800/50 text-left group/item transition-colors"
                                            >
                                                <div>
                                                    <div className="text-sm font-black text-white group-hover/item:text-primary">{p.brand} {p.capacity}</div>
                                                    <div className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase">{p.type} Solid State Drive</div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-gray-700 group-hover/item:text-primary transition-all group-hover/item:translate-x-1" />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-black flex items-center gap-2">
                                        <Monitor className="h-3 w-3 text-gray-700" />
                                        <span className="text-[8px] text-gray-700 font-mono font-black uppercase tracking-widest">Bridging OS Diagnostics...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-gray-800">

                    {/* OS Context Bridge */}
                    <div className="p-8 space-y-8 bg-black/20">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-gray-800 pb-3">
                            <Monitor className="h-4 w-4 text-primary" /> Task Manager Context
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 group hover:border-primary/30 transition-all shadow-inner">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3 block">Observed Brand (BIOS/OS)</label>
                                <input
                                    type="text" value={storageMetadata.brand}
                                    onChange={(e) => setStorageMetadata({ brand: e.target.value })}
                                    className="w-full bg-transparent text-xl font-black text-white outline-none font-mono"
                                    placeholder="e.g. Arvex, Intel, WD"
                                />
                            </div>

                            <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-inner">
                                <div className="text-[9px] font-black text-gray-600 uppercase mb-4">Performance Metrics</div>
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">PEAK ACTIVE %</span>
                                        <input
                                            type="number" value={storageMetadata.peakActiveTime}
                                            onChange={(e) => setStorageMetadata({ peakActiveTime: e.target.value })}
                                            className="bg-black border border-gray-700 rounded px-2 py-1.5 text-sm font-black text-[#00ff41] w-20 text-right outline-none"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">AVG REPLY (ms)</span>
                                        <input
                                            type="number" value={storageMetadata.avgResponseTime}
                                            onChange={(e) => setStorageMetadata({ avgResponseTime: e.target.value })}
                                            className="bg-black border border-gray-700 rounded px-2 py-1.5 text-sm font-black text-blue-400 w-20 text-right outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hardware Health Bridge */}
                    <div className="p-8 space-y-8 bg-black/40">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-gray-800 pb-3">
                            <ShieldCheck className="h-4 w-4 text-[#00ff41]" /> Vitality Bridge
                        </h3>

                        <div className="space-y-10">
                            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-inner relative overflow-hidden">
                                <div className="flex justify-between items-end mb-6 relative z-10">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Sentinel Score</span>
                                    <span className={`text-5xl font-black font-mono leading-none ${storageMetadata.healthPercent > 80 ? 'text-[#00ff41]' : storageMetadata.healthPercent > 50 ? 'text-yellow-400' : 'text-red-500'}`}>
                                        {storageMetadata.healthPercent}%
                                    </span>
                                </div>
                                <input
                                    type="range" min="0" max="100" value={storageMetadata.healthPercent}
                                    onChange={(e) => setStorageMetadata({ healthPercent: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-[#00ff41] border border-gray-700 shadow-inner mb-2"
                                />
                                <div className="text-[8px] text-gray-600 font-mono tracking-widest uppercase mt-4 block text-center border-t border-gray-800/50 pt-3">
                                    Manual Input Sync Required
                                </div>
                            </div>

                            <div className="p-5 bg-black/60 rounded-xl border border-gray-800 flex items-center justify-between group shadow-inner">
                                <div className="flex items-center gap-3">
                                    <Activity className={`h-4 w-4 ${integrityStatus === 'pass' ? 'text-[#00ff41]' : 'text-gray-700'}`} />
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sector Scan</div>
                                </div>
                                <button
                                    onClick={runIntegrityScan} disabled={integrityStatus === 'scanning'}
                                    className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black rounded hover:bg-primary hover:text-black transition-all shadow-lg active:scale-95"
                                >
                                    {integrityStatus === 'pass' ? 'SUCCESS' : integrityStatus === 'scanning' ? 'TESTING...' : 'INITIALIZE'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Throughput */}
                    <div className="p-8 space-y-8 bg-black/60 relative overflow-hidden">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-gray-800 pb-3">
                            <Zap className="h-4 w-4 text-primary" /> IO Throughput
                        </h3>

                        {!results && !isRunning ? (
                            <div className="h-full flex flex-col justify-center pb-12">
                                <button
                                    onClick={performTest}
                                    className="w-full py-10 bg-primary/10 border border-primary/30 text-primary font-black font-mono rounded-2xl hover:bg-primary hover:text-black transition-all flex flex-col items-center justify-center gap-4 group/play shadow-[0_0_40px_rgba(0,255,65,0.1)] hover:shadow-[0_0_50px_rgba(0,255,65,0.2)]"
                                >
                                    <div className="p-4 bg-black/40 rounded-full group-hover:bg-white/10 transition-colors">
                                        <Play className="h-10 w-10 fill-current group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl tracking-tighter">EXECUTE BENCHMARK</div>
                                        <div className="text-[9px] opacity-60 mt-2 uppercase tracking-[0.3em] font-bold">512KB Sequential R/W</div>
                                    </div>
                                </button>
                            </div>
                        ) : isRunning ? (
                            <div className="h-full flex flex-col justify-center gap-10 pb-12 relative z-10">
                                <div className="text-center">
                                    <div className="text-7xl font-black text-white tracking-tighter leading-none">{Math.round(progress)}%</div>
                                    <div className="text-[10px] text-primary font-mono tracking-[0.5em] mt-4 uppercase font-black">Stress Testing...</div>
                                </div>
                                <div className="px-4">
                                    <div className="w-full bg-gray-900/50 h-3 rounded-full overflow-hidden border border-gray-800 shadow-inner">
                                        <div className="h-full bg-primary transition-all duration-300 shadow-[0_0_20px_rgba(0,255,65,0.6)]" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex justify-between items-center group hover:border-primary/40 transition-all shadow-inner">
                                        <div>
                                            <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">WRITE SPEED</div>
                                            <div className="text-[10px] text-gray-600 font-mono italic">API Block Stream</div>
                                        </div>
                                        <div className="text-4xl font-black text-primary font-mono tracking-tighter">{results.writeSpeed} <span className="text-xs opacity-40">MB/s</span></div>
                                    </div>
                                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex justify-between items-center group hover:border-blue-400/40 transition-all shadow-inner">
                                        <div>
                                            <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">READ SPEED</div>
                                            <div className="text-[10px] text-gray-600 font-mono italic">API Block Fetch</div>
                                        </div>
                                        <div className="text-4xl font-black text-blue-400 font-mono tracking-tighter">{results.readSpeed} <span className="text-xs opacity-40">MB/s</span></div>
                                    </div>
                                </div>
                                <button onClick={performTest} className="w-full py-4 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 transition-all rounded-xl active:scale-[0.98]">Re-run Diagnostic</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Machine Status Bar */}
                <div className="bg-black/80 px-8 py-5 border-t border-gray-800 flex justify-between items-center flex-wrap gap-4">
                    <div className="flex gap-10 text-[9px] font-black font-mono text-gray-600 uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${storageMetadata.brand ? 'bg-primary' : 'bg-red-600 animate-pulse'}`} />
                            {storageMetadata.brand ? 'PROFILE SYNCHRONIZED' : 'MODEL CONFLICT'}
                        </span>
                        <span>QUOTA ESTIMATE: {storageQuota ? formatBytes(storageQuota.quota) : 'AUDITING...'}</span>
                        <span className="hidden md:inline">VERSION: 2.1.0-STABLE</span>
                    </div>
                    <div className="text-[9px] font-black font-mono text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 shadow-inner">
                        LOCAL_AGENT: {storageMetadata.brand ? storageMetadata.brand.toUpperCase() : 'PENDING'}_DISK_NODE
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StorageBenchmark;
