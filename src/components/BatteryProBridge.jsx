import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { Battery, BatteryCharging, Zap, ShieldCheck, Activity, Download, Terminal, RefreshCcw, Info, ArrowLeft, Copy, Check, FileUp, AlertCircle } from 'lucide-react';

const BatteryProBridge = () => {
    const { setActiveTool, batteryStats, setBatteryStats } = useStore();
    const [battery, setBattery] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

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
                    const text = td.innerText.toUpperCase();
                    if (text.includes('DESIGN CAPACITY')) {
                        const val = tds[idx + 1]?.innerText.replace(/[^\d]/g, '');
                        if (val) design = Number(val);
                    }
                    if (text.includes('FULL CHARGE CAPACITY')) {
                        const val = tds[idx + 1]?.innerText.replace(/[^\d]/g, '');
                        if (val) full = Number(val);
                    }
                    if (text.includes('CYCLE COUNT')) {
                        const val = tds[idx + 1]?.innerText.replace(/[^\d]/g, '');
                        if (val) cycles = Number(val);
                    }
                });

                if (design && full) {
                    setBatteryStats({
                        designCapacity: design,
                        fullChargeCapacity: full,
                        cycleCount: cycles || batteryStats.cycleCount
                    });
                } else {
                    alert("Could not find capacity data. Ensure it's a valid Windows Battery Report.");
                }
            } catch (err) {
                alert("Error parsing file.");
            } finally {
                setIsParsing(false);
            }
        };
        reader.readAsText(file);
    };

    const health = batteryStats.designCapacity > 0
        ? Math.min(100, Math.round((batteryStats.fullChargeCapacity / batteryStats.designCapacity) * 100))
        : 0;

    const copyCommand = () => {
        navigator.clipboard.writeText('powercfg /batteryreport');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container mx-auto p-6 flex flex-col items-center">
            {/* Header Navigation */}
            <div className="w-full flex justify-between items-center mb-8 text-gray-400">
                <button
                    onClick={() => setActiveTool(null)}
                    className="hover:text-white font-mono flex items-center gap-2 group transition-all"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1" /> BACK TO DASHBOARD
                </button>
                <div className="text-[10px] font-black font-mono text-gray-500 uppercase tracking-widest bg-gray-900 px-4 py-2 rounded-full border border-gray-800 flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    NODE_IDENTITY: BATTERY_PRO_v2.5
                </div>
            </div>

            <div className="w-full max-w-5xl bg-[#0a0a0a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">

                {/* Hero section: Live Status & Health */}
                <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 p-10 border-b border-gray-800 relative">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Activity className="h-40 w-40 text-primary" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                        <div className="flex items-center gap-8">
                            <div className="p-6 bg-primary/10 rounded-3xl border border-primary/20 shadow-[0_0_30px_rgba(0,255,65,0.1)]">
                                {battery?.charging ? (
                                    <BatteryCharging className="h-16 w-16 text-[#00ff41] animate-pulse" />
                                ) : (
                                    <Battery className="h-16 w-16 text-primary" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                                    {battery ? `${Math.round(battery.level * 100)}%` : '---%'}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <p className="text-[11px] font-mono font-bold text-gray-500 tracking-[0.4em] uppercase">
                                        {battery?.charging ? 'RESTORE_ACTIVE' : 'DC_DISCHARGE'}
                                    </p>
                                    {!batteryStats.designCapacity && (
                                        <span className="flex items-center gap-1 text-[9px] text-yellow-500 font-black animate-pulse bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                                            <AlertCircle className="h-3 w-3" /> NO_DATA
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-16">
                            <div className="text-right">
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Battery Health</div>
                                <div className={`text-6xl font-black font-mono leading-none tracking-tighter ${health > 80 ? 'text-[#00ff41]' : health > 50 ? 'text-yellow-400' : 'text-red-500'}`}>
                                    {health > 0 ? `${health}%` : '--'}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Cycle Count</div>
                                <div className="text-6xl font-black font-mono text-white leading-none tracking-tighter">
                                    {batteryStats.cycleCount || '--'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full bg-gray-950 h-3 rounded-full overflow-hidden mt-12 border border-gray-900 shadow-inner p-0.5">
                        <div
                            className={`h-full transition-all duration-1000 rounded-full ${battery?.charging ? 'bg-gradient-to-r from-blue-500 to-primary animate-pulse' : 'bg-primary shadow-[0_0_10px_rgba(0,255,65,0.5)]'}`}
                            style={{ width: battery ? `${battery.level * 100}%` : '0%' }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-gray-800">

                    {/* Column 1: Workflow Instructions */}
                    <div className="p-10 space-y-8 bg-black/20">
                        <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2 border-b border-gray-800 pb-4">
                            <Terminal className="h-4 w-4 text-blue-400" /> SYSTEM WORKFLOW
                        </h3>

                        <div className="space-y-6">
                            <div className="p-5 bg-black/40 border border-gray-800 rounded-2xl relative overflow-hidden group">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-[10px]">1</div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Execute Command</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/60 p-3 rounded-xl border border-gray-800 group hover:border-blue-500/40 transition-all cursor-pointer" onClick={copyCommand}>
                                    <code className="text-[10px] text-blue-400 font-mono flex-1">powercfg /batteryreport</code>
                                    {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-gray-700 group-hover:text-blue-400" />}
                                </div>
                                <p className="mt-3 text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Copy and Run in Admin Terminal</p>
                            </div>

                            <div className="p-5 bg-black/40 border border-gray-800 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-[10px]">2</div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Auto-Bridge Report</span>
                                </div>
                                <label className="flex items-center justify-center gap-3 bg-primary/5 text-primary border border-primary/20 font-black py-4 px-6 rounded-xl hover:bg-primary hover:text-black cursor-pointer transition-all shadow-lg active:scale-95 group">
                                    <FileUp className={`h-5 w-5 ${isParsing ? 'animate-spin' : 'group-hover:bounce'}`} />
                                    <div className="text-left leading-none">
                                        <div className="text-[10px] uppercase font-mono">Sync HTML File</div>
                                        <div className="text-[8px] opacity-50 uppercase mt-1">Direct Parser Sync</div>
                                    </div>
                                    <input type="file" className="hidden" accept=".html" onChange={handleFileUpload} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Data Input Bridge */}
                    <div className="p-10 space-y-10 bg-black/40">
                        <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2 border-b border-gray-800 pb-4">
                            <RefreshCcw className="h-4 w-4 text-primary" /> MANUAL_CALIBRATION
                        </h3>

                        <div className="space-y-8">
                            <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800 focus-within:border-primary/40 transition-all shadow-inner group">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-4 block group-focus-within:text-primary transition-colors">Design Capacity (mWh)</label>
                                <input
                                    type="number"
                                    value={batteryStats.designCapacity || ''}
                                    onChange={(e) => setBatteryStats({ designCapacity: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-transparent text-3xl font-black text-white outline-none font-mono placeholder:text-gray-900"
                                    placeholder="00000"
                                />
                            </div>

                            <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800 focus-within:border-blue-400/40 transition-all shadow-inner group">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-4 block group-focus-within:text-blue-400 transition-colors">Full Charge (mWh)</label>
                                <input
                                    type="number"
                                    value={batteryStats.fullChargeCapacity || ''}
                                    onChange={(e) => setBatteryStats({ fullChargeCapacity: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-transparent text-3xl font-black text-white outline-none font-mono placeholder:text-gray-900"
                                    placeholder="00000"
                                />
                            </div>

                            <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800 focus-within:border-white/20 transition-all shadow-inner group">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-4 block group-focus-within:text-white transition-colors">Total_CYCLES</label>
                                <input
                                    type="number"
                                    value={batteryStats.cycleCount || ''}
                                    onChange={(e) => setBatteryStats({ cycleCount: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-transparent text-3xl font-black text-white outline-none font-mono placeholder:text-gray-900"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Health Analysis */}
                    <div className="p-10 space-y-10 bg-black/60 relative overflow-hidden">
                        <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2 border-b border-gray-800 pb-4">
                            <Zap className="h-4 w-4 text-primary" /> VITALITY_AUDIT
                        </h3>

                        <div className="space-y-8">
                            <div className="bg-black/95 p-8 rounded-3xl border border-gray-800 text-center relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Integrity Status</div>
                                <div className={`text-6xl font-black font-mono tracking-tighter mb-4 ${health > 80 ? 'text-[#00ff41]' : health > 50 ? 'text-yellow-400' : health > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                    {health > 0 ? `${health}%` : 'OFFLINE'}
                                </div>
                                <div className="py-2 px-4 rounded-full bg-gray-900 border border-gray-800 inline-block">
                                    <span className={`text-[10px] font-black font-mono tracking-widest uppercase ${health > 80 ? 'text-primary' : 'text-gray-600'}`}>
                                        {health > 90 ? 'PRISTINE_CONDITION' : health > 80 ? 'SYS_OPTIMAL' : health > 50 ? 'MODERATE_WEAR' : health > 0 ? 'CRITICAL_FAILURE' : 'WAITING_FOR_DATA'}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-950/50 p-6 rounded-2xl border border-gray-800 space-y-5 shadow-inner">
                                <div className="flex justify-between items-center text-[10px] font-black tracking-widest">
                                    <span className="text-gray-600 uppercase">WEAR_LEVEL:</span>
                                    <span className="text-red-500 font-mono">{health > 0 ? 100 - health : '--'}%</span>
                                </div>
                                <div className="w-full bg-black h-2 rounded-full overflow-hidden p-0.5 border border-gray-900">
                                    <div className="h-full bg-red-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(239,68,68,0.3)]" style={{ width: `${health > 0 ? 100 - health : 0}%` }} />
                                </div>
                            </div>

                            <div className="p-5 bg-red-600/5 border border-red-500/20 rounded-2xl flex gap-4">
                                <Info className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[9px] text-gray-500 leading-relaxed font-bold uppercase font-mono">
                                    Warning: This audit is stored on the local agent node. Ensure data matches physical battery label if possible.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tactical Footer */}
                <div className="bg-black p-6 border-t border-gray-800 flex justify-between items-center overflow-hidden">
                    <div className="flex gap-10 text-[9px] font-black font-mono text-gray-700 uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> SENSOR_INPUT: ACTIVE
                        </span>
                        <span className="hidden md:inline">NODE_ID: {navigator.hardwareConcurrency || '8'}_AXIS_CORE</span>
                        <span>PERSISTENCE: LOCAL_STORE</span>
                    </div>
                    <div className="text-[9px] font-black font-mono text-gray-400 bg-gray-950 px-5 py-2 rounded-full border border-gray-800 shadow-inner">
                        REPORT_FINGERPRINT: {batteryStats.designCapacity ? `BATT_${batteryStats.designCapacity}_LOG` : 'PENDING_INIT'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatteryProBridge;
