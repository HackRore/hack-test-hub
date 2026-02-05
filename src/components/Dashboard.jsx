import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { generateReport } from '../utils/generateReport';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
    Keyboard, Monitor, Camera, MousePointer, Volume2,
    HardDrive, Cpu, Activity, FileText, Globe,
    Wifi, Mic, Speaker, Battery, CheckCircle2,
    Package, Shield, ShieldCheck, Terminal, Zap, Info, Settings2, X
} from 'lucide-react';
import BatteryMiniStatus from './BatteryMiniStatus';
import TacticalFrame from './TacticalFrame';

const deviceTests = [
    { id: 'media', title: 'Audio & Video', icon: Camera, desc: 'Check your webcam and microphone hardware.', btn: 'Launch Test', qcId: 'media' },
    { id: 'audio', title: 'Speaker Quality', icon: Volume2, desc: 'Verify speaker output and stereo separation.', btn: 'Test Audio', qcId: 'audio' },
    { id: 'display', title: 'Screen Check', icon: Monitor, desc: 'Find dead pixels and verify color accuracy.', btn: 'Test Screen', qcId: 'display' },
    { id: 'touch', title: 'Touch Screen', icon: MousePointer, desc: 'Map your screen to find non-responsive areas.', btn: 'Test Touch', qcId: 'input' },
    { id: 'keyboard', title: 'Keyboard Test', icon: Keyboard, desc: 'Ensure every key is functioning correctly.', btn: 'Test Keys', qcId: 'input' },
    { id: 'input', title: 'Mouse & Trackpad', icon: MousePointer, desc: 'Verify buttons, scroll, and responsiveness.', btn: 'Test Mouse', qcId: 'input' },
    { id: 'network', title: 'Internet Speed', icon: Globe, desc: 'Analyze your current network connectivity.', btn: 'Check Speed' },
];

const benchmarkTests = [
    { id: 'cpu', title: 'Processor Load', icon: Cpu, desc: 'Stress test your CPU with complex calculations.', btn: 'Start Stress' },
    { id: 'gpu', title: 'Graphics Power', icon: Activity, desc: 'Benchmark your GPU with 3D particle rendering.', btn: 'Start GPU' },
    { id: 'storage', title: 'Storage Speed', icon: HardDrive, desc: 'Measure how fast your drive reads and writes.', btn: 'Test Drive' },
    { id: 'battery', title: 'Battery Health', icon: Battery, desc: 'Analyze battery wear and energy capacity.', btn: 'Check Health', qcId: 'battery' },
    { id: 'resources', title: 'Resource Library', desc: 'Technician tools & software vault.', icon: Package },
    { id: 'activation', title: 'Activation Hub', desc: 'Windows & Office provisioning.', icon: ShieldCheck },
    { id: 'qc', title: 'System Report', icon: CheckCircle2, desc: 'Generate a professional certification for this PC.', btn: 'Start Wizard' },
];



const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const cardVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

const Dashboard = () => {
    const { setActiveTool, qcResults, setWizardStep, systemIdentity, isAdvancedView, setAdvancedView, hintShown, setHintShown } = useStore();
    const [showTooltip, setShowTooltip] = useState(false);

    const handleToolClick = (tool) => {
        if (tool.id === 'qc') {
            setWizardStep(2);
        }
        setActiveTool(tool.id);
    };

    const handleGenerateReport = () => {
        const mockSpecs = { platform: navigator.platform, userAgent: navigator.userAgent, screen: { width: window.screen.width, height: window.screen.height } };
        if ('getBattery' in navigator) {
            navigator.getBattery().then(b => {
                generateReport(mockSpecs, { readSpeed: '0.00', writeSpeed: '0.00', readLatency: '0.00', writeLatency: '0.00' }, { level: b.level, charging: b.charging }, { systemIdentity });
            });
        } else {
            generateReport(mockSpecs, null, null, { systemIdentity });
        }
    };

    const renderCard = (tool) => {
        const isCompleted = tool.qcId && qcResults[tool.qcId];

        return (
            <Motion.div
                key={tool.id}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="h-full"
            >
                <TacticalFrame className="h-full">
                    <div className={`flex flex-col items-center justify-between p-8 rounded-[inherit] text-center h-full transition-all group/card ${isAdvancedView ? 'bg-black/80 backdrop-blur-xl border border-primary/10' : 'bg-white/5 hover:bg-white/10'}`}>
                        {isCompleted && (
                            <div className="absolute top-4 right-4 focus-visible:outline-none">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                        )}

                        <div className="flex flex-col items-center gap-6">
                            <div className={`p-4 rounded-2xl transition-all duration-500 relative ${isAdvancedView ? 'bg-black border border-primary/20 shadow-[0_0_20px_rgba(0,255,65,0.1)] group-hover/card:border-primary group-hover/card:shadow-[0_0_40px_rgba(0,255,65,0.3)]' : 'bg-primary/5'}`}>
                                <tool.icon className={`h-8 w-8 transition-colors ${isAdvancedView ? 'text-primary' : 'text-primary'}`} />
                                {isAdvancedView && <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover/card:opacity-100 transition-opacity" />}
                            </div>
                            <div>
                                <h3 className={`text-base font-bold text-white mb-2 transition-all ${isAdvancedView ? 'tracking-[0.4em] font-black uppercase font-mono' : ''}`}>
                                    {isAdvancedView ? tool.title.toUpperCase().replace(' ', '_') : tool.title}
                                </h3>
                                <p className={`text-xs text-gray-400 font-medium leading-relaxed px-2 transition-all ${isAdvancedView ? 'text-[9px] uppercase tracking-[0.2em] font-mono text-primary/60' : ''}`}>
                                    {tool.desc}
                                </p>
                            </div>
                        </div>

                        <Motion.button
                            onClick={() => handleToolClick(tool)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`mt-8 px-6 py-3 font-bold text-xs rounded-xl transition-all w-full ${isAdvancedView
                                ? 'bg-gray-900 border border-gray-800 text-primary hover:bg-primary hover:text-black tracking-[0.2em] uppercase text-[10px]'
                                : 'bg-primary text-black shadow-lg shadow-primary/10 hover:shadow-primary/20'
                                }`}
                        >
                            {isAdvancedView ? `INIT_${tool.btn.toUpperCase()}` : tool.btn}
                        </Motion.button>
                    </div>
                </TacticalFrame>
            </Motion.div>
        );
    };

    return (
        <Motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container mx-auto p-8 max-w-7xl font-sans"
        >
            {/* Top Navigation & Hint */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 px-2">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">System Dashboard</h1>
                    <p className="text-gray-500 text-sm font-medium italic">Status: Secure session active.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative">
                    {/* Advanced View Toggle */}
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur px-4 py-2 rounded-2xl border border-white/5 relative group">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Advanced View</span>
                        <button
                            onClick={() => setAdvancedView(!isAdvancedView)}
                            className="relative w-12 h-6 bg-gray-900 rounded-full border border-gray-800 transition-colors py-1 px-1 h-full"
                        >
                            <Motion.div
                                animate={{ x: isAdvancedView ? 24 : 0 }}
                                className={`w-4 h-4 rounded-full ${isAdvancedView ? 'bg-primary shadow-[0_0_10px_rgba(0,255,65,0.5)]' : 'bg-gray-600'}`}
                            />
                        </button>

                        <Info
                            className="h-4 w-4 text-gray-600 cursor-help hover:text-gray-400"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        />

                        <AnimatePresence>
                            {showTooltip && (
                                <Motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black tracking-widest px-4 py-2 rounded-lg border border-gray-800 whitespace-nowrap z-50 pointer-events-none shadow-2xl"
                                >
                                    FOR EXPERIENCED USERS ONLY
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-gray-800 rotate-45" />
                                </Motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Hint Notification */}
                    <AnimatePresence>
                        {!hintShown && (
                            <Motion.div
                                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                className="flex items-center gap-4 bg-primary/10 border border-primary/20 p-4 rounded-2xl shadow-xl z-40 max-w-sm"
                            >
                                <Zap className="h-5 w-5 text-primary shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Operator Tip</p>
                                    <p className="text-[11px] text-gray-300 font-medium">Try "Advanced View" for the full tactical HUD experience.</p>
                                </div>
                                <button onClick={() => setHintShown()} className="text-gray-500 hover:text-white p-1">
                                    <X className="h-4 w-4" />
                                </button>
                            </Motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Tactical Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase px-2">System Health</span>
                    <div className="flex items-center gap-6 bg-white/5 backdrop-blur border border-white/5 px-6 py-4 rounded-3xl">
                        <div className="text-center">
                            <div className="text-xl font-bold text-white">{Object.keys(qcResults).length}<span className="text-xs text-gray-600">/12</span></div>
                            <div className="text-[9px] text-gray-500 font-bold uppercase">Tests Run</div>
                        </div>
                        <div className="w-px h-8 bg-gray-800" />
                        <div className="text-center">
                            <div className="text-xl font-bold text-green-500">Normal</div>
                            <div className="text-[9px] text-gray-500 font-bold uppercase">Status</div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-6">
                    <BatteryMiniStatus />
                    <Motion.button
                        onClick={handleGenerateReport}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-3xl hover:bg-white/10 transition-all text-xs font-bold w-full md:w-auto"
                    >
                        <FileText className="h-4 w-4 text-primary" /> Generate System Report
                    </Motion.button>
                </div>
            </div>



            {/* SECTION 1: SYSTEM DIAGNOSTICS */}
            <div className="mb-24">
                <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Device Diagnostics</h2>
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Hardware Suite</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {deviceTests.map(renderCard)}
                </div>
            </div>

            {/* SECTION 2: PERFORMANCE TOOLS */}
            <div className="mb-24">
                <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Performance Tools</h2>
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Compute Core</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benchmarkTests.map(renderCard)}
                </div>
            </div>

        </Motion.div>
    );
};

export default Dashboard;
