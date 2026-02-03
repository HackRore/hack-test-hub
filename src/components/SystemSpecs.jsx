import React, { useState, useEffect } from 'react';
import { Cpu, Monitor, Globe, Info } from 'lucide-react';
import useStore from '../store/useStore';

const SystemSpecs = () => {
    const { setActiveTool } = useStore();
    const [specs, setSpecs] = useState(null);

    useEffect(() => {
        setSpecs({
            userAgent: navigator.userAgent,
            screenRes: `${window.screen.width}x${window.screen.height}`,
            colorDepth: `${window.screen.colorDepth}-bit`,
            cores: navigator.hardwareConcurrency || 'Unknown',
            platform: navigator.platform,
            language: navigator.language,
            memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown',
        });
    }, []);

    if (!specs) return <div className="p-8 text-primary font-mono">Loading specs...</div>;

    return (
        <div className="container mx-auto p-6 text-gray-100">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setActiveTool(null)}
                    className="text-primary hover:text-secondary font-mono"
                >
                    &lt; BACK
                </button>
                <h2 className="text-2xl font-bold font-mono">SYSTEM SPECIFICATIONS</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4 text-secondary">
                        <Monitor className="h-6 w-6" />
                        <h3 className="font-bold text-lg">Display</h3>
                    </div>
                    <div className="space-y-2 font-mono text-sm">
                        <p><span className="text-gray-500">Resolution:</span> {specs.screenRes}</p>
                        <p><span className="text-gray-500">Color Depth:</span> {specs.colorDepth}</p>
                        <p><span className="text-gray-500">Pixel Ratio:</span> {window.devicePixelRatio}x</p>
                    </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4 text-secondary">
                        <Cpu className="h-6 w-6" />
                        <h3 className="font-bold text-lg">Hardware</h3>
                    </div>
                    <div className="space-y-2 font-mono text-sm">
                        <p><span className="text-gray-500">Logical Cores:</span> {specs.cores}</p>
                        <p><span className="text-gray-500">Est. Memory:</span> {specs.memory}</p>
                        <p><span className="text-gray-500">Platform:</span> {specs.platform}</p>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 bg-gray-900/50 border border-gray-800 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4 text-secondary">
                        <Globe className="h-6 w-6" />
                        <h3 className="font-bold text-lg">Browser Environment</h3>
                    </div>
                    <p className="font-mono text-xs text-gray-400 break-all">{specs.userAgent}</p>
                </div>
            </div>
        </div>
    );
};

export default SystemSpecs;
