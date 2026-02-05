import React, { useState } from 'react';
import useStore from '../store/useStore';
import {
    ShieldCheck, Key, Zap, Check, Lock,
    ArrowLeft, HelpCircle, AlertCircle, Terminal,
    Copy, Info, CreditCard, ChevronRight
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import TacticalFrame from './TacticalFrame';

const ACTIVATION_PLANS = [
    {
        id: 'kms-180',
        title: 'Standard Activation',
        subtitle: 'KMS Renew (180 Days)',
        desc: 'Standard enterprise licensing. Auto-renews every 180 days. Ideal for quick system turnarounds.',
        cost: 50,
        type: 'KMS',
        icon: Zap,
        cmd: 'irm https://get.activated.win | iex',
        args: '1'
    },
    {
        id: 'kms-365',
        title: 'Advanced Licensing',
        subtitle: 'KMS Extended (1 Year)',
        desc: 'Long-term enterprise sync. Stable for 365 days before renewal trigger. Best value for business units.',
        cost: 90,
        type: 'KMS_EXT',
        icon: Terminal,
        cmd: 'irm https://get.activated.win | iex',
        args: '1'
    },
    {
        id: 'hwid-perm',
        title: 'Premium HWID',
        subtitle: 'Permanent Hardware ID',
        desc: 'Binds a lifetime digital license to the motherboard. Never expires. Survives OS reinstalls.',
        cost: 250,
        type: 'PERMANENT',
        icon: ShieldCheck,
        cmd: 'irm https://get.activated.win | iex',
        args: '1'
    },
    {
        id: 'office-ohook',
        title: 'Office Suite Pro',
        subtitle: 'Ohook Global Licensing',
        desc: 'Permanent office activation bypassing local licensing calls. Lifetime stability for VL suites.',
        cost: 150,
        type: 'OFFICE',
        icon: Key,
        cmd: 'irm https://get.activated.win | iex',
        args: '1'
    }
];

const ActivationHub = () => {
    const { setActiveTool, isAdvancedView, credits, deductCredits } = useStore();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [provisioningStep, setProvisioningStep] = useState(0);

    const handleActivate = async (plan) => {
        if (credits < plan.cost) return;

        setSelectedPlan(plan);
        setIsProvisioning(true);
        setProvisioningStep(0);

        // Simulation sequence
        const steps = [
            "Initializing secure handshake...",
            "Validating system manifest...",
            "Deducting service credits...",
            "Encrypting licensing token...",
            "Ready for terminal execution."
        ];

        for (let i = 0; i < steps.length; i++) {
            setProvisioningStep(i);
            await new Promise(r => setTimeout(r, 800));
            if (i === 2) deductCredits(plan.cost);
        }

        setIsProvisioning(false);
        setIsCompleted(true);
    };

    const handleCopy = () => {
        if (!selectedPlan) return;
        navigator.clipboard.writeText(selectedPlan.cmd);
        // We could add a toast here
    };

    const reset = () => {
        setIsCompleted(false);
        setSelectedPlan(null);
        setProvisioningStep(0);
    };

    return (
        <div className="container mx-auto p-8 max-w-7xl min-h-screen">
            {/* Nav Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 px-2">
                <div>
                    <Motion.button
                        onClick={() => setActiveTool(null)}
                        whileHover={{ x: -5 }}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 group text-xs font-bold"
                    >
                        <ArrowLeft className="h-4 w-4" /> Return to Dashboard
                    </Motion.button>
                    <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-4">
                        Activation Hub
                        <span className="text-[10px] px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-widest">
                            Provisioning_v2.4
                        </span>
                    </h1>
                </div>

                <div className="flex items-center gap-4 bg-white/5 backdrop-blur px-6 py-4 rounded-2xl border border-white/5 shadow-xl">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <CreditCard className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Provisioning Balance</p>
                        <p className="text-xl font-black text-white leading-none">₹{credits}</p>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!isCompleted && !isProvisioning ? (
                    <Motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {ACTIVATION_PLANS.map((plan) => (
                            <TacticalFrame key={plan.id}>
                                <div className={`p-8 rounded-[inherit] h-full flex flex-col justify-between transition-all duration-300 ${isAdvancedView ? 'bg-black/60 border border-primary/10' : 'bg-white/5 hover:bg-white/10'}`}>
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`p-3 rounded-xl ${isAdvancedView ? 'bg-primary/10' : 'bg-primary/5'}`}>
                                                <plan.icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest px-2 py-1 bg-primary/5 rounded border border-primary/10">
                                                    {plan.type}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className={`text-xl font-bold text-white mb-1 ${isAdvancedView ? 'font-mono' : ''}`}>{plan.title}</h3>
                                        <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-wider">{plan.subtitle}</p>
                                        <p className="text-xs text-gray-400 leading-relaxed mb-8">{plan.desc}</p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-6 pt-6 border-t border-white/5">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plan Cost</span>
                                            <span className="text-lg font-black text-white">₹{plan.cost}</span>
                                        </div>
                                        <Motion.button
                                            onClick={() => handleActivate(plan)}
                                            disabled={credits < plan.cost}
                                            whileHover={credits >= plan.cost ? { scale: 1.02 } : {}}
                                            whileTap={credits >= plan.cost ? { scale: 0.98 } : {}}
                                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] tracking-widest uppercase transition-all ${credits >= plan.cost
                                                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                                : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                                                }`}
                                        >
                                            {credits >= plan.cost ? 'Initiate Activation' : 'Insufficient Credits'}
                                        </Motion.button>
                                    </div>
                                </div>
                            </TacticalFrame>
                        ))}
                    </Motion.div>
                ) : isProvisioning ? (
                    <Motion.div
                        key="provisioning"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 max-w-2xl mx-auto text-center"
                    >
                        <div className="relative w-24 h-24 mb-12">
                            <Motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Lock className="h-8 w-8 text-primary animate-pulse" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-[0.3em]">System Provisioning</h2>
                        <div className="w-full bg-gray-900 border border-white/5 rounded-2xl p-6 font-mono text-[10px] text-primary/80 space-y-2 text-left shadow-2xl">
                            {[
                                "Initializing secure handshake...",
                                "Validating system manifest...",
                                "Deducting service credits...",
                                "Encrypting licensing token...",
                                "Ready for terminal execution."
                            ].map((step, i) => (
                                <div key={i} className={`flex items-center gap-3 transition-opacity duration-300 ${i <= provisioningStep ? 'opacity-100' : 'opacity-20'}`}>
                                    {i < provisioningStep ? <Check className="h-3 w-3 text-primary" /> : <div className="w-3 h-3 border border-primary/40 rounded-full" />}
                                    <span>{step}</span>
                                </div>
                            ))}
                        </div>
                    </Motion.div>
                ) : (
                    <Motion.div
                        key="completed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <TacticalFrame>
                            <div className="bg-black/60 backdrop-blur-3xl border border-primary/20 rounded-[inherit] p-12 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8">
                                    <div className="w-24 h-24 bg-primary/5 rounded-full blur-3xl" />
                                </div>

                                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
                                    <Check className="h-10 w-10 text-primary" />
                                </div>

                                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Provisioning Successful</h2>
                                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-12">Action required: Terminal Finalization</p>

                                <div className="bg-black border border-white/10 rounded-2xl p-8 text-left mb-12">
                                    <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                                        <Terminal className="h-4 w-4 text-primary" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure Licensing Token</span>
                                    </div>
                                    <code className="text-primary font-mono text-sm break-all block mb-6 leading-loose opacity-80 select-all">
                                        {selectedPlan.cmd}
                                    </code>
                                    <p className="text-[10px] text-gray-600 font-medium italic mb-8">
                                        * Paste this command into Windows PowerShell (Admin) and follow the on-screen prompts.
                                    </p>
                                    <Motion.button
                                        onClick={handleCopy}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-white/5 border border-white/10 py-4 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] tracking-widest uppercase hover:bg-white/10 transition-all text-white"
                                    >
                                        <Copy className="h-4 w-4" /> Copy Access Token
                                    </Motion.button>
                                </div>

                                <button
                                    onClick={reset}
                                    className="text-gray-500 hover:text-white font-black text-[10px] tracking-widest uppercase transition-colors"
                                >
                                    Return to Selection
                                </button>
                            </div>
                        </TacticalFrame>
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* Footer Advice */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                <div className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/5 shadow-xl">
                    <Info className="h-6 w-6 text-primary shrink-0" />
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Usage Disclaimer</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            Requires pre-installed Microsoft software. This hub provides licensing provisioning calls via official open-source MAS methods. Always verify your local regional licensing laws.
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/5 shadow-xl">
                    <AlertCircle className="h-6 w-6 text-yellow-500 shrink-0" />
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Execution Safety</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            The generated token is a standard PowerShell command. It requires administrative privileges to bond the license to your system manifests.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivationHub;
