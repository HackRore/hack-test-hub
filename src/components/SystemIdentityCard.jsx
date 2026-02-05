import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { Monitor, Settings, Check, Zap, HardDrive, ShieldCheck, Activity, ExternalLink } from 'lucide-react';

const SystemIdentityCard = () => {
    const { systemIdentity, setSystemIdentity } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [detected, setDetected] = useState({
        cores: '?',
        memory: '?',
        gpu: 'Detecting...',
        platform: '?'
    });

    // Reset to a unified "Elite" aesthetic without bridge/verification logic
    const accentClass = 'text-primary';
    const borderClass = 'border-primary/20';
    const bgClass = 'bg-primary/10';

    useEffect(() => {
        const getGPU = () => {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (!gl) return 'Generic Accelerator';
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Standard WebGL';
            } catch (e) { return 'Access Denied'; }
        };

        setDetected({
            cores: navigator.hardwareConcurrency || '?',
            memory: navigator.deviceMemory ? `${navigator.deviceMemory}GB+` : 'Standard',
            gpu: getGPU(),
            platform: navigator.platform
        });
    }, []);

    return (
        <div className="w-full mb-12 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />

            <div className="relative bg-[#050505] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                <div className="grid grid-cols-1 lg:grid-cols-12">

                    {/* Hero ID Section */}
                    <div className="lg:col-span-4 p-10 bg-gradient-to-br from-gray-950 to-transparent border-r border-gray-900 flex flex-col justify-center relative">

                        <div className="flex items-center gap-4 mb-8">
                            <div className={`p-4 ${bgClass} rounded-2xl border ${borderClass} shadow-lg transition-all`}>
                                <Monitor className={`h-8 w-8 ${accentClass}`} />
                            </div>
                            <div>
                                <div className={`text-[10px] font-black font-mono ${accentClass} uppercase tracking-[0.3em] mb-1`}>
                                    SYSTEM_IDENTITY
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-tight font-sans">THIS SYSTEM</h1>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 font-mono">CHASSIS_MODEL</span>
                                {isEditing ? (
                                    <input
                                        className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm outline-none focus:border-primary/50 w-full uppercase"
                                        value={systemIdentity.modelName}
                                        onChange={(e) => setSystemIdentity({ ...systemIdentity, modelName: e.target.value })}
                                        placeholder="e.g. Acer Swift 5"
                                    />
                                ) : (
                                    <span className="text-xl font-bold text-white tracking-tight leading-tight uppercase font-sans">
                                        {systemIdentity.modelName || 'MODEL_MISSING'}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 font-mono">SERIAL_SIGNATURE</span>
                                {isEditing ? (
                                    <input
                                        className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm outline-none focus:border-primary/50 uppercase w-full"
                                        value={systemIdentity.serialNumber}
                                        onChange={(e) => setSystemIdentity({ ...systemIdentity, serialNumber: e.target.value.toUpperCase() })}
                                        placeholder="SN-XXXX-XXXX"
                                    />
                                ) : (
                                    <span className={`text-xs font-black ${accentClass} font-mono ${bgClass} px-3 py-1.5 rounded-md border ${borderClass} w-fit tracking-wider`}>
                                        {systemIdentity.serialNumber || 'SN: SCAN_REQUIRED'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`mt-10 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[11px] tracking-widest transition-all ${isEditing ? 'bg-white text-black' : 'bg-transparent text-gray-700 border border-gray-800 hover:border-gray-600'}`}
                        >
                            {isEditing ? <Check className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                            {isEditing ? 'COMMIT_DATA' : 'MANUAL_REFINE'}
                        </button>
                    </div>

                    {/* Telemetry Section */}
                    <div className="lg:col-span-8 p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-black/5 items-start relative">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                            <Zap className="h-64 w-64 text-white" />
                        </div>

                        {/* CPU Tooltip */}
                        <div className="bg-gray-950/50 p-6 rounded-[24px] border border-gray-900 relative group/card transition-all hover:border-gray-700">
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 font-mono">CPU_CLUSTER</div>
                            <div className="space-y-3">
                                {isEditing ? (
                                    <input
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs"
                                        value={systemIdentity.processor}
                                        onChange={(e) => setSystemIdentity({ ...systemIdentity, processor: e.target.value })}
                                        placeholder="i7-12700H"
                                    />
                                ) : (
                                    <div className="text-lg font-black text-white leading-tight uppercase font-sans tracking-tight">
                                        {systemIdentity.processor || `Core_i${detected.cores}_System`}
                                    </div>
                                )}
                                <div className="text-[10px] font-bold text-gray-500 font-mono tracking-tighter uppercase">
                                    {detected.cores} LOGICAL_THREADS detected
                                </div>
                            </div>
                        </div>

                        {/* Memory Tooltip */}
                        <div className="bg-gray-950/50 p-6 rounded-[24px] border border-gray-900 relative group/card transition-all hover:border-gray-700">
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 font-mono">MEMORY_BANK</div>
                            <div className="space-y-3">
                                <div className="text-lg font-black text-white uppercase">{detected.memory} PHYSICAL</div>
                                {isEditing ? (
                                    <input
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs"
                                        value={systemIdentity.ramFrequency}
                                        onChange={(e) => setSystemIdentity({ ...systemIdentity, ramFrequency: e.target.value })}
                                        placeholder="3200MHz / 4800MHz"
                                    />
                                ) : (
                                    <div className={`text-[10px] font-bold text-gray-500 font-mono tracking-widest uppercase`}>
                                        {systemIdentity.ramFrequency || 'FREQ_UNCHECKED'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Graphics Tooltip */}
                        <div className="bg-gray-950/50 p-6 rounded-[24px] border border-gray-900 relative group/card transition-all hover:border-gray-700">
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 font-mono">VIDEO_SUBSYSTEM</div>
                            <div className="space-y-3">
                                {isEditing ? (
                                    <input
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs"
                                        value={systemIdentity.gpuDetails}
                                        onChange={(e) => setSystemIdentity({ ...systemIdentity, gpuDetails: e.target.value })}
                                        placeholder="RTX 3060 Mobile"
                                    />
                                ) : (
                                    <div className="text-[11px] font-black text-white leading-snug line-clamp-3 uppercase font-mono tracking-tighter">
                                        {systemIdentity.gpuDetails || detected.gpu}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Storage Tooltip */}
                        <div className="lg:col-span-3 bg-gray-950/80 p-8 rounded-[32px] border border-gray-900 backdrop-blur-md">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                <div className="space-y-5">
                                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest font-mono flex items-center gap-2">
                                        <HardDrive className="h-3 w-3" /> PRIMARY_STORAGE_BRIDGE
                                    </div>
                                    <div className="flex items-center gap-12">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-gray-700 uppercase mb-1 font-mono">MANUFACTURER</span>
                                            {isEditing ? (
                                                <input
                                                    className="bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs w-full uppercase"
                                                    value={systemIdentity.storageBrand}
                                                    onChange={(e) => setSystemIdentity({ ...systemIdentity, storageBrand: e.target.value })}
                                                    placeholder="Samsung / WD"
                                                />
                                            ) : (
                                                <span className="text-xl font-black text-white uppercase">{systemIdentity.storageBrand || 'PRIMARY_BLOCK'}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-gray-700 uppercase mb-1 font-mono">PLATFORM_BUS</span>
                                            <span className="text-xl font-black text-blue-400 font-mono tracking-tighter">{detected.platform}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <a
                                        href="https://www.hdsentinel.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl group/link hover:bg-red-500/20 transition-all"
                                    >
                                        <ShieldCheck className="h-5 w-5 text-red-500" />
                                        <div className="text-left">
                                            <div className="text-[10px] font-black text-red-500 font-mono leading-none mb-1">SENTINEL_BRIDGE</div>
                                            <div className="text-[8px] font-bold text-gray-500 font-mono tracking-tighter uppercase flex items-center gap-1">
                                                EXTERNAL_AUDIT <ExternalLink className="h-2 w-2" />
                                            </div>
                                        </div>
                                    </a>
                                    <div className="flex items-center gap-3 px-6 py-2 bg-gray-900 border border-gray-800 rounded-xl">
                                        <Activity className="h-4 w-4 text-primary animate-pulse" />
                                        <span className="text-[9px] font-bold text-gray-400 font-mono tracking-widest uppercase">Drive_State: Nominal</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemIdentityCard;
