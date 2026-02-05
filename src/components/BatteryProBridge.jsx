import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { Battery, BatteryCharging, Zap, ShieldCheck, Activity, Download, Terminal, RefreshCcw, Info, ArrowLeft, Copy, Check, FileUp, AlertCircle, Gauge } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const BatteryProBridge = () => {
    const { setActiveTool, batteryStats, setBatteryStats } = useStore();
    const [battery, setBattery] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isRebooting, setIsRebooting] = useState(false);

    const handleReboot = () => {
        setIsRebooting(true);
        setTimeout(() => {
            setIsRebooting(false);
        }, 2000);
    };

    useEffect(() => {
        if ('getBattery' in navigator) {
            navigator.getBattery().then((bat) => {
                const updateBattery = () => {
                    setBattery({
                        level: bat.level,
                        charging: bat.charging,
                    });
                };
                updateBattery();
                bat.addEventListener('levelchange', updateBattery);
                bat.addEventListener('chargingchange', updateBattery);
                return () => {
                    bat.removeEventListener('levelchange', updateBattery);
                    bat.removeEventListener('chargingchange', updateBattery);
                };
            });
        }
    }, []);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsParsing(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, 'text/html');
                const tds = Array.from(doc.querySelectorAll('td'));

                let design = null;
                let full = null;
                let cycles = null;

                tds.forEach((td, idx) => {
                    const text = (td.textContent || td.innerText || '').toUpperCase().trim();
                    // Precise targeting for battery-report.html tables
                    if (text === 'DESIGN CAPACITY' || text.includes('DESIGN CAPACITY')) {
                        const val = tds[idx + 1]?.textContent.replace(/[^\d]/g, '');
                        if (val && !design) design = Number(val);
                    }
                    if (text === 'FULL CHARGE CAPACITY' || text.includes('FULL CHARGE CAPACITY')) {
                        const val = tds[idx + 1]?.textContent.replace(/[^\d]/g, '');
                        if (val && !full) full = Number(val);
                    }
                    if (text === 'CYCLE COUNT' || text.includes('CYCLE COUNT')) {
                        const val = tds[idx + 1]?.textContent.replace(/[^\d]/g, '');
                        if (val && !cycles) cycles = Number(val);
                    }
                });

                if (design && full) {
                    setBatteryStats({
                        designCapacity: design,
                        fullChargeCapacity: full,
                        cycleCount: cycles || batteryStats.cycleCount
                    });
                } else {
                    alert("Precision mismatch. Ensure it's a standard Windows Battery Report (mWh).");
                }
            } catch (err) {
                alert("Critical: IO Stream Failure during parsing.");
            } finally {
                setIsParsing(false);
            }
        };
        reader.readAsText(file);
    };

    // Industry Standard SOH (State of Health) Formula
    const health = batteryStats.designCapacity > 0
        ? Math.min(100, Math.round((batteryStats.fullChargeCapacity / batteryStats.designCapacity) * 100))
        : 0;

    // Wear Level = 100% - Health%
    const wearLevel = health > 0 ? 100 - health : 0;

    // Elite Color Coding
    const getHealthColor = (h) => {
        if (h >= 90) return 'text-[#00ff41]'; // Electric Green
        if (h >= 70) return 'text-cyan-400'; // Aging (Cyan/Yellow transition)
        return 'text-red-500'; // Replace Soon
    };

    const getHealthGlow = (h) => {
        if (h >= 90) return 'shadow-[0_0_20px_rgba(0,255,65,0.3)]';
        if (h >= 70) return 'shadow-[0_0_20px_rgba(34,211,238,0.3)]';
        return 'shadow-[0_0_20px_rgba(239,68,68,0.3)]';
    };

    const copyCommand = () => {
        navigator.clipboard.writeText('powercfg /batteryreport');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto p-6 flex flex-col items-center min-h-screen"
        >
            {/* Header Navigation */}
            <div className="w-full flex justify-between items-center mb-8 text-gray-400">
                <button
                    onClick={() => setActiveTool(null)}
                    className="hover:text-white font-mono flex items-center gap-2 group transition-all"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1" /> BACK TO DASHBOARD
                </button>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleReboot}
                        className="text-[10px] font-black font-mono text-primary uppercase tracking-widest bg-primary/5 hover:bg-primary/20 px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <RefreshCcw className={`h-3 w-3 ${isRebooting ? 'animate-spin' : ''}`} />
                        SIMULATE_REBOOT
                    </button>
                    <div className="text-[10px] font-black font-mono text-gray-500 uppercase tracking-widest bg-gray-950 px-5 py-2.5 rounded-full border border-gray-800 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        NODE_ID: BATTERY_PRO_v2.5_ELITE
                    </div>
                </div>
            </div>

            <div className="w-full max-w-6xl bg-[#0a0a0a] border border-gray-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">

                {/* Reboot Overlay */}
                {isRebooting && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center space-y-4"
                    >
                        <RefreshCcw className="h-12 w-12 text-primary animate-spin" />
                        <div className="text-primary font-mono font-black text-xs tracking-[0.4em] uppercase">Diagnostic Buffer Reset...</div>
                    </Motion.div>
                )}

                {/* Visual Background Decorators */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                </div>

                {/* Hero section: High-Precision Telemetry */}
                <div className="bg-gradient-to-br from-[#0f172a] via-[#050505] to-[#0f172a] p-12 border-b border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.07] pointer-events-none">
                        <Gauge className="h-64 w-64 text-primary" />
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-center gap-16 relative z-10">
                        <div className="flex items-center gap-10">
                            <div className={`p-8 bg-gray-950 rounded-[40px] border border-gray-800 relative group transition-all duration-500 ${getHealthGlow(health)}`}>
                                <div className="absolute inset-0 bg-primary/5 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                {battery?.charging ? (
                                    <BatteryCharging className="h-20 w-20 text-[#00ff41] animate-pulse relative z-10" />
                                ) : (
                                    <Battery className={`h-20 w-20 relative z-10 ${(battery?.level || 0) * 100 < 20 ? 'text-red-500' : 'text-primary'}`} />
                                )}
                            </div>
                            <div className="space-y-3">
                                <div className="text-[11px] font-black text-gray-600 uppercase tracking-[0.5em] font-mono mb-1">Live Power Stream</div>
                                <h2 className="text-7xl font-black text-white tracking-tighter uppercase leading-none font-mono">
                                    {battery ? `${Math.round(battery.level * 100)}%` : '---%'}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-md text-[10px] font-black font-mono border ${battery?.charging ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                                        {battery?.charging ? 'RESTORE_ACTIVE' : 'DC_DISCHARGE'}
                                    </div>
                                    {!batteryStats.designCapacity && (
                                        <div className="px-3 py-1 rounded-md text-[9px] font-black font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 animate-pulse">
                                            CALIBRATION_NEEDED
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-16">
                            <div className="space-y-2">
                                <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest font-mono">Health (SOH)</div>
                                <div className={`text-7xl font-black font-mono leading-none tracking-tighter ${getHealthColor(health)}`}>
                                    {health > 0 ? `${health}%` : '--'}
                                </div>
                                <div className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">Full / Design Capacity</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest font-mono">Wear Level</div>
                                <div className={`text-7xl font-black font-mono leading-none tracking-tighter ${wearLevel > 30 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {health > 0 ? `${wearLevel}%` : '--'}
                                </div>
                                <div className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">Total Degradation</div>
                            </div>
                        </div>
                    </div>

                    {/* Elite Multi-Bar Telemetry */}
                    <div className="mt-16 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold font-mono text-gray-500 uppercase tracking-widest">
                                <span>Real-time Buffer Status</span>
                                <span>{battery ? Math.round(battery.level * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-950 h-3.5 rounded-full overflow-hidden border border-gray-900 shadow-inner p-1">
                                <Motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: battery ? `${battery.level * 100}%` : '0%' }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full rounded-full ${battery?.charging ? 'bg-gradient-to-r from-blue-500 via-primary to-blue-500 bg-[length:200%_100%] animate-[gradient_2s_linear_infinite]' : 'bg-primary shadow-[0_0_15px_rgba(0,255,65,0.4)]'}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-gray-800 bg-[#050505]">

                    {/* Column 1: Precision Workflow */}
                    <div className="p-12 space-y-10">
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3 border-b border-gray-900 pb-5">
                            <Terminal className="h-4 w-4 text-blue-500" /> TECHNICIAN_LINK
                        </h3>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-[11px] border border-blue-500/20">01</div>
                                    <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Generate Native Report</span>
                                </div>
                                <button
                                    onClick={copyCommand}
                                    className="w-full flex items-center gap-3 bg-gray-950 p-4 rounded-2xl border border-gray-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                                    <code className="text-[11px] text-blue-400 font-mono flex-1 relative z-10">powercfg /batteryreport</code>
                                    <div className="relative z-10">
                                        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-600 group-hover:text-blue-400" />}
                                    </div>
                                </button>
                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter px-1">Execute in Windows Terminal (Admin)</p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-900">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-black text-[11px] border border-primary/20">02</div>
                                    <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Auto-Bridge Telemetry</span>
                                </div>
                                <label className="flex items-center justify-center gap-4 bg-primary/10 text-primary border border-primary/20 font-black py-5 px-6 rounded-2xl hover:bg-primary hover:text-black cursor-pointer transition-all shadow-xl active:scale-[0.97] group">
                                    <FileUp className={`h-6 w-6 ${isParsing ? 'animate-spin' : 'group-hover:-translate-y-1 transition-transform'}`} />
                                    <div className="text-left leading-none">
                                        <div className="text-[12px] uppercase font-mono">IMPORT HTML REPORT</div>
                                        <div className="text-[9px] opacity-60 uppercase mt-1.5 font-bold">mWh Precision Parser</div>
                                    </div>
                                    <input type="file" className="hidden" accept=".html" onChange={handleFileUpload} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Hardware Calibration Bridge */}
                    <div className="p-12 space-y-10 bg-black/40">
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3 border-b border-gray-900 pb-5">
                            <RefreshCcw className="h-4 w-4 text-primary" /> CALIBRATION_IO
                        </h3>

                        <div className="space-y-8">
                            <div className="bg-gray-950 p-7 rounded-[32px] border border-gray-900 focus-within:border-primary/40 transition-all shadow-inner group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <Zap className="h-12 w-12 text-primary" />
                                </div>
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 block group-focus-within:text-primary transition-colors font-mono">Factory Design (mWh)</label>
                                <input
                                    type="number"
                                    value={batteryStats.designCapacity || ''}
                                    onChange={(e) => setBatteryStats({ designCapacity: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-transparent text-4xl font-black text-white outline-none font-mono placeholder:text-gray-900"
                                    placeholder="DESIGN"
                                />
                            </div>

                            <div className="bg-gray-950 p-7 rounded-[32px] border border-gray-900 focus-within:border-blue-400/40 transition-all shadow-inner group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <Activity className="h-12 w-12 text-blue-400" />
                                </div>
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 block group-focus-within:text-blue-400 transition-colors font-mono">Full Potential (mWh)</label>
                                <input
                                    type="number"
                                    value={batteryStats.fullChargeCapacity || ''}
                                    onChange={(e) => setBatteryStats({ fullChargeCapacity: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-transparent text-4xl font-black text-white outline-none font-mono placeholder:text-gray-900"
                                    placeholder="FULL"
                                />
                            </div>

                            <div className="bg-gray-950 p-7 rounded-[32px] border border-gray-900 focus-within:border-white/20 transition-all shadow-inner group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <RefreshCcw className="h-12 w-12 text-white" />
                                </div>
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 block group-focus-within:text-white transition-colors font-mono">Charge Cycles</label>
                                <input
                                    type="number"
                                    value={batteryStats.cycleCount || ''}
                                    onChange={(e) => setBatteryStats({ cycleCount: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-transparent text-4xl font-black text-white outline-none font-mono placeholder:text-gray-900"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Pro Vitality Audit */}
                    <div className="p-12 space-y-10 bg-black/60">
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3 border-b border-gray-900 pb-5">
                            <Activity className="h-4 w-4 text-red-500" /> VITALITY_AUDIT
                        </h3>

                        <div className="space-y-10 text-center">
                            <div className="bg-gray-950/80 p-10 rounded-[40px] border border-gray-900 relative shadow-2xl group">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                                <div className="text-[11px] font-black text-gray-600 uppercase tracking-[0.3em] font-mono mb-6">INTEGRITY_INDEX</div>

                                <Motion.div
                                    className={`text-8xl font-black font-mono tracking-tighter mb-6 ${getHealthColor(health)}`}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    {health > 0 ? `${health}%` : 'OFFLINE'}
                                </Motion.div>

                                <div className="py-3 px-6 rounded-2xl bg-gray-900 border border-gray-800 inline-block">
                                    <span className={`text-[11px] font-black font-mono tracking-widest uppercase ${health > 80 ? 'text-primary' : 'text-gray-500'}`}>
                                        {health >= 90 ? 'PRISTINE_CONDITION' : health >= 70 ? 'SYS_AGED_STABLE' : health > 0 ? 'CRITICAL_FAILURE' : 'WAITING_FOR_DATA'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6 bg-gray-950 p-8 rounded-3xl border border-gray-900 shadow-inner">
                                <div className="flex justify-between items-center text-[11px] font-black tracking-[0.2em] font-mono">
                                    <span className="text-gray-600 uppercase">WEAR_LEVEL:</span>
                                    <span className="text-red-500">{wearLevel}%</span>
                                </div>
                                <div className="w-full bg-black h-4 rounded-full overflow-hidden p-1 border border-gray-900">
                                    <Motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${wearLevel}%` }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                        className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                                    />
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="text-[9px] text-gray-700 font-black uppercase">Service Status</span>
                                        <span className={`text-[10px] font-black font-mono uppercase ${health > 70 ? 'text-green-500/50' : 'text-red-500'}`}>
                                            {health > 70 ? 'GOOD' : 'REPLACE_SOON'}
                                        </span>
                                    </div>
                                    <div className="h-10 w-[1px] bg-gray-900" />
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[9px] text-gray-700 font-black uppercase">Cycle Risk</span>
                                        <span className={`text-[10px] font-black font-mono uppercase ${batteryStats.cycleCount < 500 ? 'text-green-500/50' : 'text-yellow-500'}`}>
                                            {batteryStats.cycleCount > 0 ? (batteryStats.cycleCount > 500 ? 'HIGH' : 'LOW') : '--'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-950 border border-gray-900 rounded-3xl flex gap-5 text-left">
                                <Info className="h-6 w-6 text-primary shrink-0 opacity-50" />
                                <p className="text-[9px] text-gray-600 leading-relaxed font-bold uppercase font-mono tracking-tighter">
                                    Elite Audit Synchronized: All capacity metrics are calculated using the State of Health (SOH) industry standard.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tactical Footer */}
                <div className="bg-black p-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
                    <div className="flex items-center gap-12 text-[10px] font-black font-mono text-gray-700 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_5px_rgba(0,255,65,0.5)]" /> SENSOR_LINK: ACTIVE
                        </span>
                        <span>PERSISTENCE: {localStorage ? 'ENCRYPTED_LOCAL' : 'NULL'}</span>
                        <span className="hidden lg:inline text-gray-800">Uptime: {Math.floor(performance.now() / 1000)}s</span>
                    </div>
                    <div className="text-[10px] font-black font-mono text-primary bg-primary/5 px-6 py-2.5 rounded-full border border-primary/10 shadow-inner flex items-center gap-3">
                        <Activity className="h-3 w-3" />
                        REPORT_HASH: {batteryStats.designCapacity ? `BATT_${batteryStats.designCapacity}_${health}PC` : 'PENDING_INIT'}
                    </div>
                </div>
            </div>
        </Motion.div>
    );
};

export default BatteryProBridge;
