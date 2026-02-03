import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, BatteryWarning } from 'lucide-react';

const BatteryStatus = () => {
    const [battery, setBattery] = useState(null);

    useEffect(() => {
        if ('getBattery' in navigator) {
            navigator.getBattery().then((bat) => {
                setBattery({
                    level: bat.level,
                    charging: bat.charging,
                    chargingTime: bat.chargingTime,
                    dischargingTime: bat.dischargingTime,
                });

                // Listen for changes
                const updateBattery = () => {
                    setBattery({
                        level: bat.level,
                        charging: bat.charging,
                        chargingTime: bat.chargingTime,
                        dischargingTime: bat.dischargingTime,
                    });
                };

                bat.addEventListener('levelchange', updateBattery);
                bat.addEventListener('chargingchange', updateBattery);
                bat.addEventListener('dischargingtimechange', updateBattery);

                return () => {
                    bat.removeEventListener('levelchange', updateBattery);
                    bat.removeEventListener('chargingchange', updateBattery);
                    bat.removeEventListener('dischargingtimechange', updateBattery);
                };
            });
        }
    }, []);

    if (!battery) return null; // Hide if API not supported

    const levelPercent = Math.round(battery.level * 100);
    let color = 'text-primary';
    if (levelPercent < 20 && !battery.charging) color = 'text-red-500';
    else if (levelPercent < 50 && !battery.charging) color = 'text-yellow-400';

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded p-4 flex flex-col gap-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-wider">
                {battery.charging ? <BatteryCharging className="h-4 w-4 text-green-400" /> : <Battery className="h-4 w-4" />}
                POWER_MANAGEMENT
            </div>

            <div className="flex items-end justify-between">
                <div className={`text-2xl font-bold ${color}`}>
                    {levelPercent}%
                </div>
                <div className="text-gray-500 mb-1">
                    {battery.charging
                        ? 'CHARGING_ACTIVE'
                        : isFinite(battery.dischargingTime)
                            ? `${Math.round(battery.dischargingTime / 60)} MIN REMAINING`
                            : 'ON BATTERY'}
                </div>
            </div>

            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                    className={`h-full transition-all duration-500 ${battery.charging ? 'bg-green-400 animate-pulse' : 'bg-primary'}`}
                    style={{ width: `${levelPercent}%` }}
                />
            </div>
        </div>
    );
};

export default BatteryStatus;
