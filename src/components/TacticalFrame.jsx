import React from 'react';
import { motion as Motion } from 'framer-motion';
import useStore from '../store/useStore';

const TacticalFrame = ({ children, color = "rgba(0, 255, 65, 0.5)", className = "" }) => {
    const { isAdvancedView } = useStore();

    return (
        <div className={`relative ${className} group`}>
            {/* L-Brackets - Only in Advanced View or on Hover for flavor */}
            {isAdvancedView && (
                <>
                    <svg className="absolute -top-1 -left-1 w-5 h-5 text-primary opacity-60 transition-all group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-x-1 group-hover:-translate-y-1" viewBox="0 0 16 16">
                        <path d="M0 16V0h16" fill="none" stroke="currentColor" strokeWidth="2.5" />
                    </svg>
                    <svg className="absolute -top-1 -right-1 w-5 h-5 text-primary opacity-60 rotate-90 transition-all group-hover:opacity-100 group-hover:scale-110 group-hover:translate-x-1 group-hover:-translate-y-1" viewBox="0 0 16 16">
                        <path d="M0 16V0h16" fill="none" stroke="currentColor" strokeWidth="2.5" />
                    </svg>
                    <svg className="absolute -bottom-1 -left-1 w-5 h-5 text-primary opacity-60 -rotate-90 transition-all group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-x-1 group-hover:translate-y-1" viewBox="0 0 16 16">
                        <path d="M0 16V0h16" fill="none" stroke="currentColor" strokeWidth="2.5" />
                    </svg>
                    <svg className="absolute -bottom-1 -right-1 w-5 h-5 text-primary opacity-60 rotate-180 transition-all group-hover:opacity-100 group-hover:scale-110 group-hover:translate-x-1 group-hover:translate-y-1" viewBox="0 0 16 16">
                        <path d="M0 16V0h16" fill="none" stroke="currentColor" strokeWidth="2.5" />
                    </svg>
                </>
            )}

            {/* Content Overflow Guard */}
            <div className={`relative ${isAdvancedView ? 'rounded-none' : 'rounded-3xl'} overflow-hidden h-full transition-all duration-500 shadow-2xl`}>
                {children}
            </div>

            {/* Glowing Edge (Subtle in Standard, Neon in Advanced) */}
            <div className={`absolute inset-0 ${isAdvancedView ? 'rounded-none border-primary/20 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(0,255,65,0.15)]' : 'rounded-3xl border-transparent'} border pointer-events-none transition-all duration-300`} />
        </div>
    );
};

export default TacticalFrame;
