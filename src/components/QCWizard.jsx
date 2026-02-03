import React, { useState, useRef } from 'react';
import useStore from '../store/useStore';
import { generateReport } from '../utils/generateReport';
import { FileText, CheckCircle, XCircle, ArrowRight, Clipboard, Zap, AlertTriangle } from 'lucide-react';

const STEPS = [
    { id: 'meta', title: 'Device Information' },
    { id: 'battery', title: 'Power System (Advanced)' }, // New Step
    { id: 'display', title: 'Visual Inspection (Display)' },
    { id: 'input', title: 'Input Devices (Keys/Touch)' },
    { id: 'audio', title: 'Audio System (Spk/Mic)' },
    { id: 'thermal', title: 'Thermal & Fans' },
    { id: 'finish', title: 'Complete' }
];

const QCWizard = () => {
    const { setActiveTool, batteryStats, setBatteryStats } = useStore();
    const [stepIndex, setStepIndex] = useState(0);
    const [formData, setFormData] = useState({ serial: '', technician: '', notes: '' });
    // Battery Advanced Data - Local state synced to store
    const [batteryData, setBatteryData] = useState({
        cycleCount: batteryStats.cycleCount || '',
        designCap: batteryStats.designCapacity || '',
        fullCap: batteryStats.fullChargeCapacity || '',
        health: 0
    });
    const [results, setResults] = useState([]);

    // Signature State
    const sigCanvasRef = useRef(null);
    const [isSigned, setIsSigned] = useState(false);

    // Check if we are at a specific step to show custom UI
    const currentStep = STEPS[stepIndex];

    const startDrawing = (e) => {
        const canvas = sigCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        canvas.isDrawing = true;
    };

    const draw = (e) => {
        const canvas = sigCanvasRef.current;
        if (!canvas.isDrawing) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        ctx.stroke();
        setIsSigned(true);
    };

    const stopDrawing = () => {
        if (sigCanvasRef.current) sigCanvasRef.current.isDrawing = false;
    };

    const clearSignature = () => {
        const canvas = sigCanvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsSigned(false);
    };

    const calculateHealth = (design, full) => {
        if (!design || !full) return 0;
        const d = parseFloat(design);
        const f = parseFloat(full);
        if (d === 0) return 0;
        return Math.round((f / d) * 100);
    };

    const handleBatteryUpdate = (key, value) => {
        const newData = { ...batteryData, [key]: value };
        // Auto-calc health
        if (key === 'designCap' || key === 'fullCap') {
            newData.health = calculateHealth(
                key === 'designCap' ? value : newData.designCap,
                key === 'fullCap' ? value : newData.fullCap
            );
        }
        setBatteryData(newData);

        // Push to global store immediately for dashboard visibility
        setBatteryStats({
            designCapacity: Number(newData.designCap),
            fullChargeCapacity: Number(newData.fullCap),
            cycleCount: Number(newData.cycleCount)
        });
    };

    const handlePass = (testName) => {
        setResults([...results, { test: testName, status: 'PASS' }]);
        setStepIndex(prev => prev + 1);
    };

    const handleFail = (testName) => {
        setResults([...results, { test: testName, status: 'FAIL' }]);
        setStepIndex(prev => prev + 1);
    };

    const handleFinish = () => {
        const mockSpecs = { platform: navigator.platform, userAgent: navigator.userAgent, screen: { width: window.screen.width, height: window.screen.height } };
        const sigData = isSigned ? sigCanvasRef.current.toDataURL() : null;

        // Generate
        if ('getBattery' in navigator) {
            navigator.getBattery().then(b => {
                generateReport(mockSpecs, null, { level: b.level, charging: b.charging }, { ...formData, qcResults: results, batteryAdvanced: batteryData, signature: sigData });
            });
        } else {
            generateReport(mockSpecs, null, null, { ...formData, qcResults: results, batteryAdvanced: batteryData, signature: sigData });
        }
        alert('Report Generated Successfully!');
        setActiveTool(null);
    };

    const copyCommand = () => {
        navigator.clipboard.writeText('powercfg /batteryreport');
        alert('Command copied! Run in PowerShell/CMD.');
    };

    // -- RENDER STEPS --

    if (currentStep.id === 'meta') {
        return (
            <div className="container mx-auto p-6 max-w-xl">
                <div className="bg-[#1e293b] p-8 rounded-xl shadow-lg border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Clipboard className="h-6 w-6 text-primary" /> Start QC Inspection
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-1">Technician Name</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-primary focus:outline-none"
                                placeholder="e.g. Agent Smith"
                                value={formData.technician}
                                onChange={e => setFormData({ ...formData, technician: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-1">Device Serial Number (SN)</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-primary focus:outline-none"
                                placeholder="e.g. HR-2026-X99"
                                value={formData.serial}
                                onChange={e => setFormData({ ...formData, serial: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setStepIndex(1)}
                        disabled={!formData.technician || !formData.serial}
                        className="w-full mt-8 bg-primary text-black font-bold py-3 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        START WIZARD
                    </button>
                    <button onClick={() => setActiveTool(null)} className="w-full mt-4 text-gray-500 hover:text-white text-sm">Cancel</button>
                </div>
            </div>
        );
    }

    if (currentStep.id === 'battery') {
        return (
            <div className="container mx-auto p-6 max-w-2xl">
                <div className="bg-[#1e293b] p-8 rounded-xl shadow-lg border border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="h-32 w-32 text-primary" />
                    </div>

                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4 relative z-10">
                        <h2 className="text-xl font-bold text-white">Power System Analysis</h2>
                        <span className="text-gray-500 font-mono text-sm">STEP {stepIndex} / {STEPS.length - 1}</span>
                    </div>

                    {/* Command Box */}
                    <div className="bg-black/40 p-4 rounded-lg border border-gray-700 mb-8 relative z-10">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Step 1: Run Command</label>
                            <button onClick={copyCommand} className="text-xs text-primary hover:text-white underline">Copy</button>
                        </div>
                        <code className="block bg-black p-3 rounded text-green-400 font-mono text-sm select-all">
                            powercfg /batteryreport
                        </code>
                        <p className="text-gray-500 text-xs mt-2">Open Report html to find values below.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Design Capacity (mWh)</label>
                            <input
                                type="number"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary font-mono"
                                placeholder="50000"
                                value={batteryData.designCap}
                                onChange={e => handleBatteryUpdate('designCap', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Full Charge Cap (mWh)</label>
                            <input
                                type="number"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary font-mono"
                                placeholder="45000"
                                value={batteryData.fullCap}
                                onChange={e => handleBatteryUpdate('fullCap', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Cycle Count</label>
                            <input
                                type="number"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary font-mono"
                                placeholder="150"
                                value={batteryData.cycleCount}
                                onChange={e => handleBatteryUpdate('cycleCount', e.target.value)}
                            />
                        </div>
                        <div className="bg-gray-800 p-2 rounded flex flex-col justify-center items-center">
                            <span className="text-xs text-gray-400">Calculated Health</span>
                            <span className={`text-2xl font-bold ${batteryData.health > 80 ? 'text-green-500' : batteryData.health > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                                {batteryData.health}%
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <button
                            onClick={() => handleFail('Battery System')}
                            className="bg-red-900/30 border border-red-500/50 text-red-500 py-4 rounded-lg font-bold hover:bg-red-900/50 transition-colors"
                        >
                            FAIL (REPLACE)
                        </button>
                        <button
                            onClick={() => handlePass('Battery System')}
                            className="bg-green-900/30 border border-green-500/50 text-green-500 py-4 rounded-lg font-bold hover:bg-green-900/50 transition-colors"
                        >
                            PASS
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep.id === 'finish') {
        return (
            <div className="container mx-auto p-6 max-w-xl text-center">
                <div className="bg-[#1e293b] p-8 rounded-xl shadow-lg border border-primary relative">
                    <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-1">Inspection Ready</h2>
                    <p className="text-gray-400 mb-8 border-b border-gray-700 pb-4">Technician sign-off required.</p>

                    {/* Signature Pad */}
                    <div className="mb-8">
                        <label className="block text-xs font-bold text-gray-500 uppercase text-left mb-2">Technician Digital Signature</label>
                        <div className="bg-black rounded-lg border border-gray-700 overflow-hidden relative group">
                            <canvas
                                ref={sigCanvasRef}
                                width={500}
                                height={150}
                                className="w-full touch-none cursor-crosshair"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />
                            {!isSigned && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-800 font-mono text-sm uppercase translate-y-2">
                                    Sign Here
                                </div>
                            )}
                            <button
                                onClick={clearSignature}
                                className="absolute bottom-2 right-2 text-xs text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleFinish}
                        disabled={!isSigned}
                        className="w-full bg-primary text-black font-bold py-4 rounded hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <FileText className="h-5 w-5" /> AUTHORIZE & GENERATE PDF
                    </button>
                </div>
            </div>
        );
    }

    // GENERIC STEP UI
    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <div className="bg-[#1e293b] p-8 rounded-xl shadow-lg border border-gray-700">
                <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                    <h2 className="text-xl font-bold text-white">{currentStep.title}</h2>
                    <span className="text-gray-500 font-mono text-sm">STEP {stepIndex} / {STEPS.length - 1}</span>
                </div>

                <p className="text-gray-300 mb-8 text-lg">
                    Perform the necessary physical checks for this component. Does it pass quality standards?
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleFail(currentStep.title)}
                        className="bg-red-900/30 border border-red-500/50 text-red-500 py-6 rounded-lg font-bold hover:bg-red-900/50 transition-colors flex flex-col items-center gap-2"
                    >
                        <XCircle className="h-8 w-8" />
                        FAIL
                    </button>
                    <button
                        onClick={() => handlePass(currentStep.title)}
                        className="bg-green-900/30 border border-green-500/50 text-green-500 py-6 rounded-lg font-bold hover:bg-green-900/50 transition-colors flex flex-col items-center gap-2"
                    >
                        <CheckCircle className="h-8 w-8" />
                        PASS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QCWizard;
