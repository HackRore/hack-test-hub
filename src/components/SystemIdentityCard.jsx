import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { Cpu, HardDrive, Cpu as Gpu, Hash, Monitor, Settings, Check, CreditCard, Layers, Zap, Activity, Copy, Terminal } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const SystemIdentityCard = () => {
    const { systemIdentity, setSystemIdentity, setStorageMetadata } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(null);
    const [detected, setDetected] = useState({
        cores: '?',
        memory: '?',
        gpu: 'Detecting...',
        platform: '?'
    });

    const isVerified = systemIdentity.serialNumber && systemIdentity.serialNumber.length > 5;
    const accentColor = isVerified ? '#00ff41' : '#00f0ff';
    const accentClass = isVerified ? 'text-primary' : 'text-secondary';
    const borderClass = isVerified ? 'border-primary/20' : 'border-secondary/20';
    const bgClass = isVerified ? 'bg-primary/10' : 'bg-secondary/10';

    const handleCopy = (cmd, label) => {
        navigator.clipboard.writeText(cmd);
        setCopyFeedback(label);
        setTimeout(() => setCopyFeedback(null), 2000);
    };

    const applyArvex = () => {
        setStorageMetadata({
            brand: 'Arvex',
            observedCapacity: '256GB',
            busType: 'SATA'
        });
        setSystemIdentity({ storageBrand: 'Arvex' });
    };

    useEffect(() => {
        // Auto-detection logic
        const getGPU = () => {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (!gl) return 'Generic Accelerator';
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Standard WebGL';
            } catch (e) {
                return 'Access Denied';
            }
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
            {/* Ambient Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/10 to-primary/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

            <div className="relative bg-[#050505] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
                {/* Visual Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

                <div className="grid grid-cols-1 lg:grid-cols-12">

                    {/* Hero ID Section */}
                    <div className="lg:col-span-4 p-10 bg-gradient-to-br from-[#00ff41]/5 to-transparent border-r border-gray-900 flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`p-4 ${bgClass} rounded-2xl border ${borderClass} shadow-[0_0_20px_rgba(0,255,65,0.1)] transition-colors duration-700`}>
                                <Monitor className={`h-8 w-8 ${accentClass} transition-colors duration-700`} />
                            </div>
                            <div>
                                <div className={`text-[10px] font-black font-mono ${accentClass} uppercase tracking-[0.3em] mb-1 transition-colors duration-700`}>
                                    {isVerified ? 'MACHINE_AUDITED' : 'SYSTEM_ID_001'}
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-tight font-sans">THIS SYSTEM</h1>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 font-mono">CHASSIS_MODEL</span>
                                {isEditing ? (
                                    <input
                                        className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm outline-none focus:border-primary/50 w-full"
                                        value={systemIdentity.modelName}
                                        onChange={(e) => setSystemIdentity({ modelName: e.target.value })}
                                        placeholder="e.g. Acer Swift 5"
                                    />
                                ) : (
                                    <span className="text-xl font-bold text-white tracking-tight">{systemIdentity.modelName || 'UNDEFINED_PRODUCT'}</span>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 font-mono">SERIAL_SIGNATURE</span>
                                {isEditing ? (
                                    <input
                                        className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm outline-none focus:border-primary/50 uppercase w-full"
                                        value={systemIdentity.serialNumber}
                                        onChange={(e) => setSystemIdentity({ serialNumber: e.target.value.toUpperCase() })}
                                        placeholder="SN-XXXX-XXXX"
                                    />
                                ) : (
                                    <span className={`text-xs font-black ${accentClass} font-mono ${bgClass} px-3 py-1 rounded-md border ${borderClass} w-fit transition-all duration-700`}>
                                        {systemIdentity.serialNumber || 'SN: PENDING_SCAN'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* DISCOVERY TOOLBOX */}
                        <div className="mt-8 pt-8 border-t border-gray-900">
                            <div className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                                <Terminal className="h-3 w-3" /> DISCOVERY_BRIDGE
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { label: 'Get SN', cmd: 'wmic bios get serialnumber' },
                                    { label: 'Get Model', cmd: 'wmic csproduct get name' },
                                    { label: 'Get RAM', cmd: 'wmic memorychip get speed' },
                                ].map((tool) => (
                                    <button
                                        key={tool.label}
                                        onClick={() => handleCopy(tool.cmd, tool.label)}
                                        className="flex items-center justify-between px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg group/btn hover:border-gray-600 transition-all active:scale-95"
                                    >
                                        <span className="text-[10px] font-bold text-gray-400 font-mono">{tool.label}</span>
                                        {copyFeedback === tool.label ? (
                                            <Check className="h-3 w-3 text-primary" />
                                        ) : (
                                            <Copy className="h-3 w-3 text-gray-600 group-hover/btn:text-gray-300" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`mt-6 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[11px] tracking-widest transition-all ${isEditing ? 'bg-primary text-black shadow-[0_0_20px_rgba(0,255,65,0.3)]' : 'bg-gray-950 text-gray-500 border border-gray-800 hover:text-white hover:border-gray-700'}`}
                        >
                            {isEditing ? <Check className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                            {isEditing ? 'COMMIT_CHANGES' : 'REFINE_SPECS'}
                        </button>
                    </div>

                    {/* Telemetry Section */}
                    <div className="lg:col-span-8 p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                        {/* CPU Tooltip */}
                        <div className="bg-gray-950/50 p-6 rounded-[24px] border border-gray-900 relative group/card overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-10 transition-opacity">
                                <Cpu className="h-10 w-10 text-primary" />
                            </div>
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 font-mono">CPU_CLUSTER</div>
                            <div className="space-y-3">
                                {isEditing ? (
                                    <input
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs"
                                        value={systemIdentity.processor}
                                        onChange={(e) => setSystemIdentity({ processor: e.target.value })}
                                        placeholder="i7-12700H"
                                    />
                                ) : (
                                    <div className="text-lg font-black text-white">{systemIdentity.processor || `NATIVE_${detected.cores}C`}</div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono">{detected.cores} LOGICAL_CORES</span>
                                </div>
                            </div>
                        </div>

                        {/* Memory Tooltip */}
                        <div className="bg-gray-950/50 p-6 rounded-[24px] border border-gray-900 relative group/card overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-10 transition-opacity">
                                <Layers className="h-10 w-10 text-blue-400" />
                            </div>
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 font-mono">MEMORY_BANK</div>
                            <div className="space-y-3">
                                <div className="text-lg font-black text-white">{detected.memory} PHYSICAL</div>
                                {isEditing ? (
                                    <input
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs"
                                        value={systemIdentity.ramFrequency}
                                        onChange={(e) => setSystemIdentity({ ramFrequency: e.target.value })}
                                        placeholder="3200MHz / 4800MHz"
                                    />
                                ) : (
                                    <div className="text-[9px] font-black text-gray-500 tracking-widest uppercase font-mono">{systemIdentity.ramFrequency || 'FREQ: UNTESTED'}</div>
                                )}
                            </div>
                        </div>

                        {/* Graphics Tooltip */}
                        <div className="bg-gray-950/50 p-6 rounded-[24px] border border-gray-900 relative group/card overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-10 transition-opacity">
                                <Gpu className="h-10 w-10 text-red-500" />
                            </div>
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 font-mono">VIDEO_SUBSYSTEM</div>
                            <div className="space-y-3">
                                {isEditing ? (
                                    <input
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs"
                                        value={systemIdentity.gpuDetails}
                                        onChange={(e) => setSystemIdentity({ gpuDetails: e.target.value })}
                                        placeholder="RTX 3060 Mobile"
                                    />
                                ) : (
                                    <div className="text-xs font-black text-white leading-snug line-clamp-2 uppercase font-mono">
                                        {systemIdentity.gpuDetails || detected.gpu.split('(')[0]}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Storage Tooltip */}
                        <div className="lg:col-span-3 bg-gray-950/50 p-6 rounded-[24px] border border-gray-900 relative group/card overflow-hidden">
                            <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-5 group-hover/card:opacity-10 transition-opacity pointer-events-none">
                                <HardDrive className="h-24 w-24 text-gray-500" />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 font-mono">PRIMARY_STORAGE_BRIDGE</div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-gray-700 uppercase mb-1 font-mono">MANUFACTURER</span>
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        className="bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs w-full"
                                                        value={systemIdentity.storageBrand}
                                                        onChange={(e) => setSystemIdentity({ storageBrand: e.target.value })}
                                                        placeholder="Samsung / WD"
                                                    />
                                                    <button
                                                        onClick={applyArvex}
                                                        className="px-2 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded hover:bg-blue-500/20 text-[8px] font-black font-mono transition-all"
                                                    >
                                                        ARVEX
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xl font-black text-white">{systemIdentity.storageBrand || 'INTERNAL_BLOCK_DEV'}</span>
                                            )}
                                        </div>
                                        <div className="h-10 w-[1px] bg-gray-900" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-gray-700 uppercase mb-1 font-mono">PLATFORM_BUS</span>
                                            <span className="text-xl font-black text-blue-400 font-mono tracking-tighter">{detected.platform}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black text-primary font-mono tracking-widest">DRIVE_HEALTH: OPTIMAL</span>
                                    </div>
                                    <div className="text-[9px] font-black text-gray-500 font-mono tracking-tighter">CERTIFIED_IO: SYNCHRONIZED</div>
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
