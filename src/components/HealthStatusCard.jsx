import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Battery, BatteryCharging, ShieldCheck, ShieldAlert, Zap, Settings2, Check, X, Database, FileUp, RefreshCw, ArrowLeft, Terminal, Clipboard } from 'lucide-react';
import useStore from '../store/useStore';

const HealthStatusCard = () => {
    const { batteryStats, setBatteryStats, setActiveTool } = useStore();
    const [battery, setBattery] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [editStats, setEditStats] = useState({
        design: batteryStats.designCapacity || '',
        full: batteryStats.fullChargeCapacity || ''
    });

    useEffect(() => {
        if ('getBattery' in navigator) {
            navigator.getBattery().then((bat) => {
                const update = () => {
                    setBattery({
                        level: bat.level,
                        charging: bat.charging,
                    });
                };
                update();
                bat.addEventListener('levelchange', update);
                bat.addEventListener('chargingchange', update);
                return () => {
                    bat.removeEventListener('levelchange', update);
                    bat.removeEventListener('chargingchange', update);
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

            // Extraction Logic
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, 'text/html');
                const tds = Array.from(doc.querySelectorAll('td'));

                let design = null;
                let full = null;

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
                });

                if (design && full) {
                    setBatteryStats({
                        designCapacity: design,
                        fullChargeCapacity: full,
                        cycleCount: batteryStats.cycleCount
                    });
                    setEditStats({ design, full });
                    // alert(`Synced! Health: ${Math.round((full/design)*100)}%`);
                } else {
                    alert("Could not find capacity data in this file. Ensure it's a valid Windows Battery Report.");
                }
            } catch (err) {
                console.error("Parse Error:", err);
                alert("Error parsing file.");
            } finally {
                setIsParsing(false);
            }
        };
        reader.readAsText(file);
    };

    if (!battery) return null;

    const chargePercent = Math.round(battery.level * 100);

    // Calculate Health if stats exist
    let healthPercent = null;
    if (batteryStats.designCapacity && batteryStats.fullChargeCapacity) {
        healthPercent = Math.round((batteryStats.fullChargeCapacity / batteryStats.designCapacity) * 100);
    }

    // Determine status
    let status = {
        label: 'SYSTEM OPTIMAL',
        color: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/30',
        icon: ShieldCheck,
        desc: healthPercent
            ? `Battery Health is at ${healthPercent}%. The cells are holding power effectively.`
            : 'Battery levels are within nominal operating range. Import a report for deep health metrics.'
    };

    if (healthPercent !== null && healthPercent < 80) {
        status = {
            label: 'DEGRADED HEALTH',
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10',
            border: 'border-yellow-400/30',
            icon: ShieldAlert,
            desc: `HEALTH WARNING: Capacity has dropped to ${healthPercent}%. Consider replacement for professional use.`
        };
    } else if (chargePercent < 20 && !battery.charging) {
        status = {
            label: 'LOW POWER WARNING',
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            icon: ShieldAlert,
            desc: 'Battery critical. Connect to power source immediately.'
        };
    } else if (battery.charging) {
        status = {
            label: 'RESTORE ACTIVE',
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-400/30',
            icon: Zap,
            desc: 'External power source detected. Recharging components.'
        };
    }

    const copyCommand = () => {
        navigator.clipboard.writeText('powercfg /batteryreport');
        alert('Command copied! Run in Terminal/PowerShell.');
    };

    const handleSaveStats = () => {
        setBatteryStats({
            designCapacity: Number(editStats.design),
            fullChargeCapacity: Number(editStats.full),
            cycleCount: batteryStats.cycleCount
        });
        setIsEditing(false);
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => setActiveTool(null)}
                    className="text-gray-400 hover:text-white flex items-center gap-2 font-bold uppercase text-xs tracking-widest transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> BACK TO DASHBOARD
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-full p-8 rounded-2xl border ${status.border} ${status.bg} relative overflow-hidden transition-all duration-500`}
            >
                {/* Glow Effect */}
                <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full mix-blend-screen blur-[100px] opacity-20 ${battery.charging ? 'bg-blue-500' : 'bg-primary'}`} />

                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <status.icon className={`h-6 w-6 ${status.color}`} />
                                <span className={`text-sm font-black uppercase tracking-[0.2em] ${status.color}`}>
                                    {status.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors group flex items-center gap-2" title="Sync from HTML Report">
                                    <FileUp className="h-4 w-4 text-gray-500 group-hover:text-primary" />
                                    <input type="file" className="hidden" accept=".html" onChange={handleFileUpload} />
                                </label>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                                >
                                    <Settings2 className="h-4 w-4 text-gray-500 group-hover:text-white" />
                                </button>
                            </div>
                        </div>

                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-tight">
                            Power Capacity <span className="text-gray-500">&</span> Health
                        </h2>

                        <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                            {status.desc}
                        </p>

                        <AnimatePresence>
                            {isEditing ? (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-black/60 p-4 rounded-xl border border-white/10 space-y-4 mt-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Design Capacity (mWh)</label>
                                            <input
                                                type="number"
                                                value={editStats.design}
                                                onChange={(e) => setEditStats({ ...editStats, design: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none"
                                                placeholder="e.g. 50000"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Full Charge (mWh)</label>
                                            <input
                                                type="number"
                                                value={editStats.full}
                                                onChange={(e) => setEditStats({ ...editStats, full: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none"
                                                placeholder="e.g. 42000"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><RefreshCw className={`h-3 w-3 ${isParsing ? 'animate-spin' : ''}`} /> Run powercfg /batteryreport</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-white flex items-center gap-1">
                                                <X className="h-3 w-3" /> CANCEL
                                            </button>
                                            <button onClick={handleSaveStats} className="px-4 py-1.5 bg-primary text-black text-xs font-black rounded hover:bg-white transition-colors flex items-center gap-1">
                                                <Check className="h-3 w-3" /> CALIBRATE
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>

                    {/* VISUAL METERS */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Ring 1: CURRENT CHARGE */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                    <motion.circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={364}
                                        initial={{ strokeDashoffset: 364 }}
                                        animate={{ strokeDashoffset: 364 - (364 * battery.level) }}
                                        className={`${battery.charging ? 'text-blue-400' : 'text-primary'} transition-all duration-1000 ease-out`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-3xl font-black ${battery.charging ? 'text-blue-400' : 'text-white'}`}>{chargePercent}%</span>
                                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Charge</span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-px h-24 bg-white/10" />

                        {/* Ring 2: OVERALL HEALTH (Calculated) */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                                    {healthPercent !== null && (
                                        <motion.circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            strokeDasharray={364}
                                            initial={{ strokeDashoffset: 364 }}
                                            animate={{ strokeDashoffset: 364 - (364 * (healthPercent / 100)) }}
                                            className={`${healthPercent < 80 ? 'text-yellow-400' : 'text-primary'} opacity-50`}
                                        />
                                    )}
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    {healthPercent !== null ? (
                                        <>
                                            <span className={`text-2xl font-black ${healthPercent < 80 ? 'text-yellow-400' : 'text-primary'}`}>{healthPercent}%</span>
                                            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Health</span>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-110">
                                            <FileUp className="h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" />
                                            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-1">Sync Report</span>
                                            <input type="file" className="hidden" accept=".html" onChange={handleFileUpload} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* AUTOMATION HELPER */}
            <div className="mt-8 bg-[#1e293b] p-8 rounded-xl border border-gray-700 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Terminal className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-bold text-white uppercase tracking-tight">System Report Automation</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                            To get a truly accurate health reading, you need to generate a Windows System Report. Copy the command below, run it in PowerShell, and then sync the result here.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <button
                            onClick={copyCommand}
                            className="flex items-center justify-center gap-3 bg-primary text-black font-black py-4 px-8 rounded-lg hover:bg-white transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/10"
                        >
                            <Clipboard className="h-5 w-5" /> COPY GENERATOR COMMAND
                        </button>
                        <label className="flex items-center justify-center gap-3 bg-gray-800 text-white font-bold py-4 px-8 rounded-lg hover:bg-gray-700 cursor-pointer transition-all border border-white/5">
                            <FileUp className="h-5 w-5" /> SYNC GENERATED REPORT
                            <input type="file" className="hidden" accept=".html" onChange={handleFileUpload} />
                        </label>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3 text-gray-500">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-mono text-xs">1</div>
                        <span className="text-xs uppercase font-bold tracking-widest">Copy Command</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-mono text-xs">2</div>
                        <span className="text-xs uppercase font-bold tracking-widest">Run in PowerShell</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-mono text-xs">3</div>
                        <span className="text-xs uppercase font-bold tracking-widest">Upload Result</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthStatusCard;
