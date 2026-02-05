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
                    <svg className="absolute -top-1 -left-1 w-4 h-4 text-primary opacity-30 transition-all group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-x-1 group-hover:-translate-y-1" viewBox="0 0 16 16">
                        <path d="M0 16V0h16" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <svg className="absolute -top-1 -right-1 w-4 h-4 text-primary opacity-30 rotate-90 transition-all group-hover:opacity-100 group-hover:scale-110 group-hover:translate-x-1 group-hover:-translate-y-1" viewBox="0 0 16 16">
                        <path d="M0 16V0h16" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <svg className="absolute -bottom-1 -left-1 w-4 h-4 text-primary opacity-30 -rotate-90 transition-all group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-x-1 group-hover:translate-y-1" viewBox="0 0 16 16">
                        <path d="M0 16V0h16" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <svg className="absolute -bottom-1 -right-1 w-4 h-4 text-primary opacity-30 rotate-180 transition-all group-hover:opacity-100 group-hover:scale-110 group-hover:translate-x-1 group-hover:translate-y-1" viewBox="0 0 16 16">
                        <path d="M0 16V0h16" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </>
            )}

            {/* Content Overflow Guard */}
            <div className={`relative ${isAdvancedView ? 'rounded-lg' : 'rounded-3xl'} overflow-hidden h-full transition-all duration-500`}>
                {children}
            </div>

            {/* Glowing Edge (Subtle) */}
            <div className={`absolute inset-0 ${isAdvancedView ? 'rounded-lg border-white/5 group-hover:border-primary/20' : 'rounded-3xl border-transparent'} border pointer-events-none transition-all duration-300`} />
        </div>
    );
};

export default TacticalFrame;
