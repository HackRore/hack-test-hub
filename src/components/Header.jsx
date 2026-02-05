import React from 'react';
import { Shield, Home } from 'lucide-react';
import useStore from '../store/useStore';

const Header = () => {
    const { setActiveTool, isAdvancedView } = useStore();
    const [pulse, setPulse] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setPulse(Math.floor(Math.random() * 20) + 10); // Simulated CPU %
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl sticky top-0 z-[100]">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <div
                    onClick={() => setActiveTool(null)}
                    className="flex items-center gap-4 cursor-pointer group"
                >
                    <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Shield className="h-7 w-7 text-primary group-hover:rotate-12 transition-transform" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-white font-sans leading-none">
                            HackRore<span className="text-primary italic font-black">.pro</span>
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                            {isAdvancedView ? 'Diagnostic Intelligence' : 'Command Center'}
                        </span>
                    </div>
                </div>

                {/* System Stats (Live) */}
                <div className="hidden lg:flex items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-gray-500 font-bold uppercase">{isAdvancedView ? 'System Load' : 'CPU Usage'}</span>
                            <span className={`text-xs font-bold font-sans text-primary`}>{pulse}%</span>
                        </div>
                        <div className="w-12 bg-gray-900 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${pulse}%` }} />
                        </div>
                    </div>

                    <div className="h-8 w-[1px] bg-white/5" />

                    <div className="flex items-center gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full ${isAdvancedView ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]'}`} />
                        <span className="text-xs font-bold text-gray-400 tracking-tight uppercase">
                            {isAdvancedView ? 'Technician Online' : 'Active Session'}
                        </span>
                    </div>
                </div>

                {/* Nav Links (Mock) */}
                <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    <button onClick={() => setActiveTool(null)} className="hover:text-primary transition-colors">Workspace</button>
                    <button onClick={() => setActiveTool('resources')} className="hover:text-primary transition-colors">Library</button>
                    <button className="hover:text-primary transition-colors">Settings</button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
