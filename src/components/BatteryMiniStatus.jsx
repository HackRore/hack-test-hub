import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging } from 'lucide-react';

const BatteryMiniStatus = () => {
    const [battery, setBattery] = useState(null);

    useEffect(() => {
        if ('getBattery' in navigator) {
            navigator.getBattery().then((bat) => {
                const update = () => setBattery({ level: bat.level, charging: bat.charging });
                update();
                bat.addEventListener('levelchange', update);
                bat.addEventListener('chargingchange', update);
                return () => {
                    bat.removeEventListener('levelchange', update);
                    bat.removeEventListener('chargingchange', update);
                };
            });
        }
    }, []);

    if (!battery) return null;

    const level = Math.round(battery.level * 100);

    return (
        <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2 font-mono shadow-inner">
            <div className="relative">
                {battery.charging ? (
                    <BatteryCharging className="h-4 w-4 text-primary animate-pulse" />
                ) : (
                    <Battery className={`h-4 w-4 ${level < 20 ? 'text-red-500' : 'text-gray-400'}`} />
                )}
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-black text-white leading-none">{level}%</span>
                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">
                    {battery.charging ? 'Charging' : 'On Battery'}
                </span>
            </div>
            <div className="w-12 bg-gray-800 h-1 rounded-full overflow-hidden ml-1">
                <div
                    className={`h-full transition-all duration-500 ${battery.charging ? 'bg-primary animate-pulse' : 'bg-primary/60'}`}
                    style={{ width: `${level}%` }}
                />
            </div>
        </div>
    );
};

export default BatteryMiniStatus;
