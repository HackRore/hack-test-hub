import React, { useState } from 'react';
import useStore from '../store/useStore';
import {
    ShieldCheck, Key, Zap, Check, Lock, Shield,
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

const MERCHANT_CONFIG = {
    display_id: 'hackrore@upi',
    real_id: '9322026193@superyes',
    merchant_name: 'HACKRORE_GLOBAL_SYSTEMS',
    node_server: 'BAN-NY-01 (Verified)'
};

const ActivationHub = () => {
    const { setActiveTool, isAdvancedView, operator, setOperator, transactions, addTransaction } = useStore();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isPaying, setIsPaying] = useState(false);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [provisioningStep, setProvisioningStep] = useState(0);
    const [authId, setAuthId] = useState('');
    const [paymentError, setPaymentError] = useState('');

    const handleOperatorAuth = (e) => {
        e.preventDefault();
        if (authId.length < 4) return;
        setOperator({ id: `TECH-${Math.floor(Math.random() * 999)}`, name: authId, level: 'L2_OFFICER' });
    };

    const handleInitiate = async (plan) => {
        setSelectedPlan(plan);
        setIsPaying(true);
        setPaymentError('');

        try {
            // Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                initiateRazorpayPayment(plan);
            };
        } catch (error) {
            console.error('Error loading Razorpay:', error);
            setPaymentError('Failed to load payment gateway');
        }
    };

    const initiateRazorpayPayment = async (plan) => {
        try {
            // Create order via backend API (server validates price)
            const orderResponse = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.id,
                    operatorId: operator.id
                })
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create payment order');
            }

            const orderData = await orderResponse.json();

            // Configure Razorpay checkout options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'HackRore Activation Hub',
                description: `${plan.title} - ${plan.subtitle}`,
                order_id: orderData.orderId,
                prefill: {
                    name: operator.name,
                    contact: '9322026193'
                },
                theme: {
                    color: '#00ff41'
                },
                handler: async function (response) {
                    // Payment successful, verify signature
                    await handlePaymentSuccess(response, plan);
                },
                modal: {
                    ondismiss: function () {
                        setIsPaying(false);
                        setPaymentError('Payment cancelled by user');
                    }
                }
            };

            // Open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Error initiating payment:', error);
            setPaymentError(error.message);
            setIsPaying(false);
        }
    };

    const handlePaymentSuccess = async (razorpayResponse, plan) => {
        setIsPaying(false);
        setIsProvisioning(true);
        setProvisioningStep(0);

        try {
            // Verify payment signature via backend
            const verifyResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                    razorpay_signature: razorpayResponse.razorpay_signature
                })
            });

            const verifyData = await verifyResponse.json();

            if (!verifyData.verified) {
                throw new Error('Payment verification failed');
            }

            // Simulate provisioning steps with "Hardware Verified" animation
            const steps = [
                "Authenticating payment signature...",
                "Validating transaction integrity...",
                "Decrypting license payload...",
                "Provisioning activation token...",
                "Hardware verification complete."
            ];

            for (let i = 0; i < steps.length; i++) {
                setProvisioningStep(i);
                await new Promise(r => setTimeout(r, 1200));
            }

            // Add to transaction ledger
            addTransaction({
                id: `TX-${Math.floor(Math.random() * 999)}`,
                utr: razorpayResponse.razorpay_payment_id,
                amount: plan.cost,
                plan: plan.id,
                status: 'VERIFIED',
                time: new Date().toLocaleString()
            });

            setIsProvisioning(false);
            setIsCompleted(true);

        } catch (error) {
            console.error('Payment verification error:', error);
            setIsProvisioning(false);
            setPaymentError('Payment verification failed. Please contact support.');
        }
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
            {!operator ? (
                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto py-20"
                >
                    <TacticalFrame>
                        <div className="bg-black/60 backdrop-blur-3xl border border-white/5 p-12 rounded-[inherit] text-center">
                            <Shield className="h-12 w-12 text-primary mx-auto mb-8 animate-pulse" />
                            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Technician Accreditation</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-10">Restricted Access Licensing Portal</p>

                            <form onSubmit={handleOperatorAuth} className="space-y-6 text-left">
                                <div>
                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3 block">Operator Rank/Name</label>
                                    <input
                                        type="text"
                                        value={authId}
                                        onChange={(e) => setAuthId(e.target.value)}
                                        placeholder="Min. 4 characters"
                                        className="w-full bg-white/5 border border-white/10 px-4 py-4 rounded-xl text-white outline-none focus:border-primary transition-all text-sm font-mono"
                                    />
                                </div>
                                <Motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-primary text-black py-4 rounded-xl font-black text-[10px] tracking-widest uppercase shadow-lg shadow-primary/20"
                                >
                                    Establish Link
                                </Motion.button>
                            </form>
                            <p className="mt-8 text-[9px] text-gray-700 leading-relaxed italic">
                                * Identification is mandatory for transaction logging and UTR ledger synchronization.
                            </p>
                        </div>
                    </TacticalFrame>
                </Motion.div>
            ) : (
                <>
                    {/* Active Session Header */}
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
                                <span className={`text-[10px] px-3 py-1 rounded-full border font-black uppercase tracking-widest ${isAdvancedView ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                                    {operator.id} // {operator.level}
                                </span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4 bg-white/5 backdrop-blur px-6 py-3 rounded-2xl border border-white/5 shadow-xl">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Active Operator</p>
                                    <p className="text-xs font-black text-white leading-none uppercase">{operator.name}</p>
                                </div>
                                <div className="h-4 w-px bg-white/10" />
                                <button
                                    onClick={() => setOperator(null)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                                >
                                    <Lock className="h-4 w-4 text-gray-500 group-hover:text-red-500" />
                                </button>
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
                                className="max-w-2xl mx-auto py-20 text-center"
                            >
                                <TacticalFrame>
                                    <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[inherit] p-12">
                                        {paymentError ? (
                                            <>
                                                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-8" />
                                                <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Payment Error</h2>
                                                <p className="text-sm text-gray-400 mb-8">{paymentError}</p>
                                                <Motion.button
                                                    onClick={() => { setIsPaying(false); setPaymentError(''); }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[10px] tracking-widest uppercase hover:bg-white/10 transition-all"
                                                >
                                                    Try Again
                                                </Motion.button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="relative w-24 h-24 mb-12 mx-auto">
                                                    <Motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                        className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <CreditCard className="h-8 w-8 text-primary animate-pulse" />
                                                    </div>
                                                </div>
                                                <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Initializing Secure Payment</h2>
                                                <p className="text-sm text-gray-400 mb-2">Loading Razorpay checkout...</p>
                                                <p className="text-xs text-gray-600">Plan: {selectedPlan?.title} - ₹{selectedPlan?.cost}</p>
                                            </>
                                        )}
                                    </div>
                                </TacticalFrame>
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

                                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-[0.3em]">Processing Payment</h2>
                                <p className="text-sm text-yellow-500 font-bold uppercase tracking-widest mb-8 animate-pulse">⚠️ Do Not Close This Tab</p>
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
                        ) : isCompleted ? (
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
                        ) : (
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
                        )}
                    </AnimatePresence>

                    {/* Transparency Ledger */}
                    {!isPaying && !isProvisioning && !isCompleted && (
                        <div className="mt-32">
                            <div className="flex items-center gap-4 mb-10">
                                <h3 className="text-xl font-bold text-white tracking-tight uppercase tracking-[0.2em]">Verified Transaction Ledger</h3>
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="flex items-center gap-2 text-[9px] text-primary font-black uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_5px_#00ff41]" /> Live_Sync_Active
                                </span>
                            </div>

                            <div className="overflow-x-auto rounded-3xl border border-white/5 bg-white/5 shadow-2xl">
                                <table className="w-full text-left text-[10px] font-bold tracking-widest uppercase">
                                    <thead>
                                        <tr className="border-b border-white/5 text-gray-500">
                                            <th className="px-8 py-6">ID</th>
                                            <th className="px-8 py-6">UTR Reference</th>
                                            <th className="px-8 py-6">Plan</th>
                                            <th className="px-8 py-6">Amount</th>
                                            <th className="px-8 py-6">Status</th>
                                            <th className="px-8 py-6 text-right">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="text-gray-400 hover:bg-white/5 transition-colors">
                                                <td className="px-8 py-6 text-white font-black">{tx.id}</td>
                                                <td className="px-8 py-6 font-mono text-blue-400">{tx.utr}</td>
                                                <td className="px-8 py-6 font-medium tracking-tight h-full">
                                                    <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{tx.plan.replace('_', ' ')}</span>
                                                </td>
                                                <td className="px-8 py-6 text-white font-black">₹{tx.amount}</td>
                                                <td className="px-8 py-6">
                                                    <span className="flex items-center gap-2 text-primary">
                                                        <Check className="h-3 w-3" /> VERIFIED
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right text-gray-600 lowercase">{tx.time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

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
