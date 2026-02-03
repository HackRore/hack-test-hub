import React from 'react';
import useStore from '../store/useStore';
import { Keyboard, Monitor, Camera, MousePointer, Volume2, HardDrive, Cpu, Activity, FileText, Globe, Wifi, Mic, Speaker, Battery } from 'lucide-react';
import { generateReport } from '../utils/generateReport';
import BatteryStatus from './BatteryStatus';

const deviceTests = [
    { id: 'media', title: 'Camera', icon: Camera, desc: 'Test the webcam and take pictures and video.', btn: 'Start Webcam Test' },
    { id: 'media', title: 'Microphone', icon: Mic, desc: 'Test the microphone levels and hear playback.', btn: 'Start Mic Test' },
    { id: 'audio', title: 'Speakers', icon: Volume2, desc: 'Test the speakers and adjust volume and panning.', btn: 'Start Speaker Test' },
    { id: 'display', title: 'Display', icon: Monitor, desc: 'Test the display for dead pixels and color uniformity.', btn: 'Start Display Test' },
    { id: 'touch', title: 'Touch Screen', icon: MousePointer, desc: 'Test multitouch and digitizer linearity.', btn: 'Start Touch Test' }, // New
    { id: 'keyboard', title: 'Keyboard', icon: Keyboard, desc: 'Test the keyboard and see which keys are pressed.', btn: 'Open Keyboard Test' },
    { id: 'input', title: 'Mouse', icon: MousePointer, desc: 'Test mouse buttons and scroll wheel.', btn: 'Start Input Test' },
    { id: 'network', title: 'Network', icon: Globe, desc: 'Test network speed and see connection info.', btn: 'Test Network' },
];

const benchmarkTests = [
    { id: 'gpu', title: 'GPU Test', icon: Cpu, desc: 'Test the GPU using WebGL particle rendering.', btn: 'Start GPU Test' },
    { id: 'storage', title: 'Storage Test', icon: HardDrive, desc: 'Test read/write speeds to benchmark local storage.', btn: 'Start Storage Test' },
    { id: 'battery', title: 'Battery Health', icon: Battery, desc: 'Deep analysis via powercfg report automation.', btn: 'Check Health' },
    { id: 'qc', title: 'QC Wizard', icon: Activity, desc: 'Guided Quality Control workflow with certification.', btn: 'Start QC Mode' }, // New
    { id: 'specs', title: 'System Specs', icon: Activity, desc: 'View detailed system information and environment.', btn: 'View Specs' },
];

import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

// HealthStatusCard is now used as a full-page tool

const Dashboard = () => {
    const { setActiveTool } = useStore();

    // -- FOR REPORT GENERATION --
    const handleGenerateReport = () => {
        const mockSpecs = { platform: navigator.platform, userAgent: navigator.userAgent, screen: { width: window.screen.width, height: window.screen.height } };
        if ('getBattery' in navigator) {
            navigator.getBattery().then(b => {
                generateReport(mockSpecs, { readSpeed: '0.00', writeSpeed: '0.00', readLatency: '0.00', writeLatency: '0.00' }, { level: b.level, charging: b.charging });
            });
        } else {
            generateReport(mockSpecs, null, null);
        }
    };

    const renderCard = (tool) => (
        <motion.div
            key={tool.title}
            variants={cardVariants}
            whileHover={{ scale: 1.02, backgroundColor: '#253045' }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center justify-between bg-[#1e293b] p-8 rounded-xl text-center min-h-[280px] shadow-lg transition-colors cursor-default"
        >
            <div className="flex flex-col items-center gap-4">
                <tool.icon className="h-12 w-12 text-gray-200" />
                <h3 className="text-xl font-bold text-white tracking-wide">{tool.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-[200px]">{tool.desc}</p>
            </div>

            <button
                onClick={() => setActiveTool(tool.id)}
                className="mt-6 px-6 py-2.5 bg-white text-black font-bold text-sm rounded-md hover:bg-gray-100 transition-colors w-full max-w-[200px]"
            >
                {tool.btn}
            </button>
        </motion.div>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container mx-auto p-8 max-w-7xl font-sans"
        >

            {/* Context bar (Report & Battery) */}
            <div className="flex justify-end items-center gap-4 mb-4">
                <button
                    onClick={handleGenerateReport}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary rounded hover:bg-primary hover:text-black transition-colors text-sm font-bold"
                >
                    <FileText className="h-4 w-4" /> GENERATE REPORT
                </button>
            </div>


            {/* SECTION 1: DEVICE TESTS */}
            <div className="mb-20">
                <div className="flex flex-col items-center mb-12">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] mb-3">Diagnostic Tier 1</span>
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">HARDWARE SUITE</h2>
                    <div className="h-1 w-20 bg-primary rounded-full shadow-[0_0_10px_rgba(0,255,65,0.4)]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {deviceTests.map(renderCard)}
                </div>
            </div>

            {/* SECTION 2: BENCHMARK TESTS */}
            <div className="mb-20">
                <div className="flex flex-col items-center mb-12">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em] mb-3">Diagnostic Tier 2</span>
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">PERFORMANCE GRID</h2>
                    <div className="h-1 w-20 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benchmarkTests.map(renderCard)}
                </div>
            </div>

        </motion.div>
    );
};

export default Dashboard;
