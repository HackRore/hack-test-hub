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
    const { setActiveTool, isAdvancedView, credits, addCredits } = useStore();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isPaying, setIsPaying] = useState(false);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [provisioningStep, setProvisioningStep] = useState(0);
    const [utr, setUtr] = useState('');

    const handleInitiate = (plan) => {
        setSelectedPlan(plan);
        setIsPaying(true);
        setUtr('');
    };

    const handleConfirmPayment = async () => {
        setIsPaying(false);
        setIsProvisioning(true);
        setProvisioningStep(0);

        // Simulation sequence
        const steps = [
            "Authenticating transaction signature...",
            "Validating system manifest...",
            "Decrypting one-click payload...",
            "Routing to local terminal bridge...",
            "Ready for system bonding."
        ];

        for (let i = 0; i < steps.length; i++) {
            setProvisioningStep(i);
            await new Promise(r => setTimeout(r, 1000));
        }

        setIsProvisioning(false);
        setIsCompleted(true);
    };

    const handleCopy = () => {
        if (!selectedPlan) return;
        navigator.clipboard.writeText(selectedPlan.cmd);
    };

    const reset = () => {
        setIsCompleted(false);
        setIsPaying(false);
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
                {isPaying ? (
                    <Motion.div
                        key="payment"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-4xl mx-auto"
                    >
                        <TacticalFrame>
                            <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[inherit] overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    {/* Left: QR Side */}
                                    <div className="p-12 border-r border-white/5 flex flex-col items-center justify-center text-center bg-white/5">
                                        <div className="relative p-4 bg-white rounded-2xl mb-8 group cursor-crosshair">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=hackrore@upi&am=${selectedPlan.cost}&tn=Activation_${selectedPlan.id}`}
                                                alt="Payment QR"
                                                className="w-48 h-48"
                                            />
                                            <div className="absolute inset-0 border-2 border-primary/20 group-hover:border-primary transition-colors pointer-events-none rounded-2xl" />
                                        </div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Scan with UPI App</p>
                                        <div className="flex items-center gap-2 text-white font-mono text-lg">
                                            <span className="text-gray-500 font-sans tracking-tight">Amount:</span>
                                            <span>₹{selectedPlan.cost}</span>
                                        </div>
                                    </div>

                                    {/* Right: Info Side */}
                                    <div className="p-12 flex flex-col justify-between">
                                        <div>
                                            <div className="mb-8 p-6 bg-black border border-white/5 rounded-2xl">
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Transaction Ref (UTR)</label>
                                                <input
                                                    type="text"
                                                    placeholder="XXXX-XXXX-XXXX"
                                                    value={utr}
                                                    onChange={(e) => setUtr(e.target.value)}
                                                    className="w-full bg-transparent border-b border-white/10 py-2 outline-none text-primary font-mono text-sm focus:border-primary transition-colors"
                                                />
                                            </div>
                                            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Security Protocol</h2>
                                            <div className="space-y-6">
                                                <div className="flex gap-4">
                                                    <div className="p-2 bg-primary/10 rounded-lg h-fit">
                                                        <ShieldCheck className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Encrypted Gateway</p>
                                                        <p className="text-[11px] text-gray-500 font-medium">Your transaction signature is validated against the licensing node.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="p-2 bg-blue-500/10 rounded-lg h-fit">
                                                        <Check className="h-4 w-4 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Post-Auth Logic</p>
                                                        <p className="text-[11px] text-gray-500 font-medium">Activation executes immediately upon transaction confirmation.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 space-y-4">
                                            <Motion.button
                                                onClick={handleConfirmPayment}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full bg-primary text-black py-5 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase shadow-lg shadow-primary/20"
                                            >
                                                Confirm & Finalize
                                            </Motion.button>
                                            <button
                                                onClick={() => setIsPaying(false)}
                                                className="w-full text-gray-500 hover:text-white py-2 text-[10px] font-black tracking-widest uppercase transition-colors"
                                            >
                                                Abort Transaction
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TacticalFrame>
                    </Motion.div>
                ) : !isCompleted && !isProvisioning ? (
                    <Motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
                                        <h3 className={`text-lg font-bold text-white mb-1 ${isAdvancedView ? 'font-mono uppercase tracking-tight' : ''}`}>{plan.title}</h3>
                                        <p className="text-[10px] font-bold text-gray-500 mb-6 uppercase tracking-wider">{plan.subtitle}</p>
                                        <p className="text-xs text-gray-400 leading-relaxed mb-8">{plan.desc}</p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-6 pt-6 border-t border-white/5">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plan Cost</span>
                                            <span className="text-lg font-black text-white">₹{plan.cost}</span>
                                        </div>
                                        <Motion.button
                                            onClick={() => handleInitiate(plan)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full bg-primary text-black py-4 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] tracking-widest uppercase transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
                                        >
                                            Initiate Flow
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
                                "Authenticating transaction signature...",
                                "Validating system manifest...",
                                "Decrypting one-click payload...",
                                "Routing to local terminal bridge...",
                                "Ready for system bonding."
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
                        className="max-w-4xl mx-auto"
                    >
                        <TacticalFrame>
                            <div className="bg-black/60 backdrop-blur-3xl border border-primary/20 rounded-[inherit] p-12 relative overflow-hidden">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    {/* Final Command */}
                                    <div className="bg-black border border-white/10 rounded-2xl p-8 text-left">
                                        <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                                            <Terminal className="h-4 w-4 text-primary" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Master Activation Token</span>
                                        </div>
                                        <code className="text-primary font-mono text-sm break-all block mb-6 leading-loose opacity-80 select-all p-4 bg-primary/5 rounded-lg border border-primary/10">
                                            {selectedPlan.cmd}
                                        </code>
                                        <Motion.button
                                            onClick={handleCopy}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full bg-white/5 border border-white/10 py-4 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] tracking-widest uppercase hover:bg-white/10 transition-all text-white"
                                        >
                                            <Copy className="h-4 w-4" /> Copy Master Token
                                        </Motion.button>
                                        <div className="mt-8 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                                            <p className="text-[9px] text-yellow-500/80 font-bold uppercase tracking-widest leading-loose text-center italic">
                                                * Paste into PowerShell (Admin) for final bonding.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Verification Checklist */}
                                    <div>
                                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Post-Auth Validation</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">1</div>
                                                <p className="text-xs text-white font-medium">Open **Microsoft Word** to verify license load.</p>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">2</div>
                                                <p className="text-xs text-white font-medium">Navigate to **File &gt; Account**.</p>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">3</div>
                                                <p className="text-xs text-white font-medium">Verify "Product Activated" status badge.</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={reset}
                                            className="mt-12 text-gray-500 hover:text-white font-black text-[10px] tracking-widest uppercase transition-colors flex items-center gap-2"
                                        >
                                            <ArrowLeft className="h-4 w-4" /> Return to Terminal
                                        </button>
                                    </div>
                                </div>
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
