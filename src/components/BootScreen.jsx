import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import useStore from '../store/useStore';

const BootScreen = ({ onComplete }) => {
    const { setHasBooted } = useStore();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const duration = 1200; // 1.2 seconds
        const interval = 20;
        const step = (100 / (duration / interval));

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => {
                        setHasBooted();
                        onComplete();
                    }, 200);
                    return 100;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [onComplete, setHasBooted]);

    return (
        <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center z-[1000] font-sans overflow-hidden">
            {/* Very subtle ambient background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #00ff41 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="relative flex flex-col items-center gap-8 max-w-sm w-full px-8">
                <Motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(0,255,65,0.1)]">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-white tracking-tight mb-1">HackRore Suite</h2>
                        <p className="text-sm text-gray-500 font-medium tracking-wide">Preparing your dashboard...</p>
                    </div>
                </Motion.div>

                <div className="w-full space-y-3">
                    <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden border border-white/5">
                        <Motion.div
                            style={{ width: `${progress}%` }}
                            className="h-full bg-primary shadow-[0_0_15px_rgba(0,255,65,0.4)] transition-all duration-75 ease-linear"
                        />
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">INITIALIZING_SECURE_SESSION</span>
                        <span className="font-mono text-[10px] text-primary font-bold">{Math.round(progress)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BootScreen;
