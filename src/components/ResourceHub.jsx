import React, { useState } from 'react';
import useStore from '../store/useStore';
import { TOOLBOX_DATA } from '../data/toolbox';
import {
    Search, ArrowLeft, Download, Terminal, HardDrive,
    ShieldCheck, Activity, Copy, Check, ExternalLink,
    Zap, Cpu, Package, MousePointer, Info, Shield
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import TacticalFrame from './TacticalFrame';

const categoryIcons = {
    hardware: Cpu,
    software: ShieldCheck,
    terminal: Terminal,
    utils: Package,
    boot: Zap,
    security: Shield
};

const ResourceHub = () => {
    const { setActiveTool, isAdvancedView } = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleCopy = (cmd, index) => {
        navigator.clipboard.writeText(cmd);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const filteredData = TOOLBOX_DATA.filter(cat =>
        activeCategory === 'all' || cat.id === activeCategory
    ).map(cat => ({
        ...cat,
        tools: cat.tools?.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.desc.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        commands: cat.commands?.filter(c =>
            c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.cmd.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => (cat.tools?.length > 0) || (cat.commands?.length > 0));

    return (
        <div className="container mx-auto p-8 max-w-7xl min-h-screen font-sans">
            {/* Nav Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                <div>
                    <Motion.button
                        onClick={() => setActiveTool(null)}
                        whileHover={{ x: -5 }}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 group text-xs font-bold"
                    >
                        <ArrowLeft className="h-4 w-4" /> {isAdvancedView ? 'BACK_TO_DASHBOARD' : 'Return to Dashboard'}
                    </Motion.button>
                    <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-4">
                        {isAdvancedView ? 'TECH_RESOURCE_HUB' : 'Resource Library'}
                        <span className={`text-[10px] px-4 py-1.5 rounded-full border tracking-widest uppercase font-bold ${isAdvancedView ? 'text-primary bg-primary/10 border-primary/20' : 'text-gray-400 bg-white/5 border-white/5'}`}>
                            {isAdvancedView ? 'Vault_Active' : 'Live'}
                        </span>
                    </h1>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isAdvancedView ? 'text-gray-600 group-focus-within:text-primary' : 'text-gray-500'}`} />
                    <input
                        type="text"
                        placeholder={isAdvancedView ? "SEARCH_FOR_TOOLS_OR_CMDS..." : "Search for tools or commands..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full bg-white/5 backdrop-blur-md rounded-2xl py-5 pl-12 pr-4 outline-none transition-all text-sm font-medium placeholder:text-gray-700 ${isAdvancedView ? 'border border-gray-800 focus:border-primary/50 font-mono tracking-wider' : 'border border-transparent focus:bg-white/10'}`}
                    />
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-4 overflow-x-auto pb-8 mb-16 no-scrollbar">
                {['all', ...TOOLBOX_DATA.map(c => c.id)].map(id => (
                    <button
                        key={id}
                        onClick={() => setActiveCategory(id)}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border transition-all ${activeCategory === id
                            ? (isAdvancedView ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,255,65,0.3)]' : 'bg-primary text-black border-primary shadow-lg shadow-primary/10')
                            : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10'
                            }`}
                    >
                        {id.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-16">
                <AnimatePresence mode="popLayout">
                    {filteredData.map((cat, catIdx) => {
                        const Icon = categoryIcons[cat.id] || Package;
                        return (
                            <Motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ delay: catIdx * 0.05 }}
                                className="space-y-10"
                            >
                                <div className="flex items-center gap-6 border-b border-white/5 pb-6 relative">
                                    <div className={`p-3 rounded-xl border ${isAdvancedView ? 'bg-gray-950 border-gray-800 shadow-[0_0_15px_rgba(0,255,65,0.05)]' : 'bg-primary/5 border-primary/10'}`}>
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h2 className={`text-2xl font-bold text-white tracking-tight ${isAdvancedView ? 'uppercase tracking-[0.3em]' : ''}`}>{cat.category}</h2>
                                    {isAdvancedView && <div className="absolute bottom-0 left-0 w-24 h-px bg-primary shadow-[0_0_10px_#00ff41]" />}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {/* Tool Cards */}
                                    {cat.tools?.map((tool, i) => (
                                        <TacticalFrame key={tool.name}>
                                            <div className={`p-8 rounded-[inherit] h-full group transition-all ${isAdvancedView ? 'bg-gray-950/40 backdrop-blur-md border border-white/5 hover:bg-gray-900/40' : 'bg-white/5 hover:bg-white/10'}`}>
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className={`p-2 rounded-lg ${isAdvancedView ? 'bg-primary/10' : 'bg-primary/5'}`}>
                                                        <Activity className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <ExternalLink className="h-4 w-4 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <h3 className={`text-xl font-bold text-white mb-3 tracking-tight group-hover:text-primary transition-colors ${isAdvancedView ? 'uppercase font-black' : ''}`}>
                                                    {tool.name}
                                                </h3>
                                                <p className={`text-xs text-gray-500 leading-relaxed mb-8 font-medium line-clamp-2 ${isAdvancedView ? 'uppercase font-bold tracking-widest text-[9px]' : ''}`}>
                                                    {tool.desc}
                                                </p>
                                                <Motion.a
                                                    href={tool.url} target="_blank" rel="noopener noreferrer"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-[10px] font-bold tracking-widest transition-all ${isAdvancedView
                                                            ? 'bg-gray-900 border border-gray-800 hover:bg-primary hover:text-black uppercase'
                                                            : 'bg-primary text-black shadow-lg shadow-primary/10'
                                                        }`}
                                                >
                                                    <Download className="h-4 w-4" /> {isAdvancedView ? 'SYNC_REPO' : 'Download Tool'}
                                                </Motion.a>
                                            </div>
                                        </TacticalFrame>
                                    ))}

                                    {/* Command Cards */}
                                    {cat.commands?.map((c, i) => (
                                        <TacticalFrame key={c.cmd}>
                                            <div className={`p-8 rounded-[inherit] h-full border-l-4 transition-all ${isAdvancedView
                                                    ? 'bg-gray-900/20 backdrop-blur-md border border-blue-500/20 border-l-blue-500/50'
                                                    : 'bg-white/5 border-transparent border-l-blue-500/40 hover:bg-white/10'
                                                }`}>
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className={`p-2 rounded-lg ${isAdvancedView ? 'bg-blue-500/10' : 'bg-blue-500/5'}`}>
                                                        <Terminal className="h-4 w-4 text-blue-500" />
                                                    </div>
                                                    <div className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${isAdvancedView ? 'text-blue-500 bg-blue-500/5 border-blue-500/10' : 'text-gray-500 bg-white/5 border-white/5'}`}>
                                                        {isAdvancedView ? 'SHELL_CMDK' : 'Terminal CMD'}
                                                    </div>
                                                </div>

                                                <h3 className={`text-sm font-bold text-white mb-4 tracking-tight ${isAdvancedView ? 'font-black uppercase' : ''}`}>{c.label}</h3>

                                                <Motion.div
                                                    className={`p-5 rounded-xl border mb-6 font-mono text-xs relative group cursor-pointer overflow-hidden transition-all ${isAdvancedView
                                                            ? 'bg-black/80 border-gray-800 text-blue-400'
                                                            : 'bg-black/40 border-white/5 text-blue-400/80 hover:bg-black/60'
                                                        }`}
                                                    onClick={() => handleCopy(c.cmd, `${cat.id}-${i}`)}
                                                    whileHover={{ borderColor: 'rgba(59, 130, 246, 0.5)' }}
                                                >
                                                    <code className="break-all block pr-8">{c.cmd}</code>
                                                    <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center bg-gray-950/80 border-l border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {copiedIndex === `${cat.id}-${i}` ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                                                    </div>
                                                </Motion.div>
                                                <p className={`text-[9px] text-gray-600 font-bold uppercase tracking-widest ${isAdvancedView ? 'font-black' : ''}`}>{c.desc}</p>
                                            </div>
                                        </TacticalFrame>
                                    ))}
                                </div>
                            </Motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Footer Status */}
            <div className="mt-24 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold tracking-widest text-gray-600 uppercase">
                <div className="flex flex-wrap justify-center items-center gap-8">
                    <span className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isAdvancedView ? 'bg-primary animate-pulse shadow-[0_0_10px_#00ff41]' : 'bg-primary/50'}`} /> Core System: Active
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500/50 rounded-full" /> Total Resources: {TOOLBOX_DATA.reduce((acc, c) => acc + (c.tools?.length || 0) + (c.commands?.length || 0), 0)}
                    </span>
                </div>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-primary transition-colors">Documentation</a>
                    <span className="text-gray-900">|</span>
                    <span className="text-gray-700">{isAdvancedView ? 'Elite_Access_Level' : 'User Mode'}</span>
                </div>
            </div>
        </div>
    );
};

export default ResourceHub;
