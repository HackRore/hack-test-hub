import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Info, 
  Globe, 
  Battery, 
  Monitor, 
  Cpu, 
  HardDrive, 
  Wifi,
  RefreshCw 
} from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

interface SystemInfo {
  browser: {
    name: string;
    version: string;
    userAgent: string;
    language: string;
    platform: string;
    cookiesEnabled: boolean;
    doNotTrack: boolean;
  };
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
    orientation: string;
  };
  hardware: {
    cores: number;
    memory: number;
    maxTouchPoints: number;
  };
  network: {
    online: boolean;
    connectionType: string;
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  battery: {
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
  } | null;
  location: {
    ip: string;
    city: string;
    region: string;
    country: string;
    timezone: string;
  } | null;
}

export default function SystemInfoTest() {
  const setResult = useTestStore((s) => s.setResult);
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSystemInfo = async () => {
    setLoading(true);
    
    // Browser info
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = '';
    
    if (ua.includes('Firefox')) {
      browserName = 'Firefox';
      browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || '';
    } else if (ua.includes('Chrome')) {
      browserName = 'Chrome';
      browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || '';
    } else if (ua.includes('Safari')) {
      browserName = 'Safari';
      browserVersion = ua.match(/Version\/(\d+)/)?.[1] || '';
    } else if (ua.includes('Edge')) {
      browserName = 'Edge';
      browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || '';
    }

    // Network info
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    
    // Battery info
    let batteryInfo = null;
    try {
      const battery = await (navigator as Navigator & { getBattery?: () => Promise<BatteryManager> }).getBattery?.();
      if (battery) {
        batteryInfo = {
          level: Math.round(battery.level * 100),
          charging: battery.charging,
          chargingTime: battery.chargingTime || 0,
          dischargingTime: battery.dischargingTime || 0,
        };
      }
    } catch (e) {
      // Battery API not available
    }

    // Location info
    let locationInfo = null;
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      locationInfo = {
        ip: data.ip || 'Unknown',
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        country: data.country_name || 'Unknown',
        timezone: data.timezone || 'Unknown',
      };
    } catch (e) {
      // Location fetch failed
    }

    const systemInfo: SystemInfo = {
      browser: {
        name: browserName,
        version: browserVersion,
        userAgent: ua,
        language: navigator.language,
        platform: navigator.platform,
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack === '1',
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        orientation: screen.orientation?.type || 'Unknown',
      },
      hardware: {
        cores: navigator.hardwareConcurrency || 0,
        memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0,
        maxTouchPoints: navigator.maxTouchPoints || 0,
      },
      network: {
        online: navigator.onLine,
        connectionType: connection?.type || 'Unknown',
        effectiveType: connection?.effectiveType || 'Unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
      },
      battery: batteryInfo,
      location: locationInfo,
    };

    setInfo(systemInfo);
    setLoading(false);

    setResult('system', {
      name: 'System Info',
      status: 'pass',
      details: `${browserName} ${browserVersion} on ${navigator.platform}`,
    });
  };

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const InfoSection = ({ title, icon: Icon, children }: { title: string; icon: typeof Info; children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card neon-border p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  const InfoRow = ({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) => (
    <div className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? 'font-display font-bold neon-text-cyan' : 'font-medium'}>{value}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Gathering system information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center neon-glow-cyan">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold">System Info</h1>
              <p className="text-muted-foreground">Device and browser information</p>
            </div>
          </div>
          <NeonButton variant="purple" onClick={fetchSystemInfo}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </NeonButton>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Browser */}
        <InfoSection title="Browser" icon={Globe}>
          <InfoRow label="Browser" value={`${info?.browser.name} ${info?.browser.version}`} highlight />
          <InfoRow label="Language" value={info?.browser.language || 'Unknown'} />
          <InfoRow label="Platform" value={info?.browser.platform || 'Unknown'} />
          <InfoRow label="Cookies" value={info?.browser.cookiesEnabled ? 'Enabled' : 'Disabled'} />
          <InfoRow label="Do Not Track" value={info?.browser.doNotTrack ? 'Enabled' : 'Disabled'} />
        </InfoSection>

        {/* Screen */}
        <InfoSection title="Display" icon={Monitor}>
          <InfoRow label="Resolution" value={`${info?.screen.width} × ${info?.screen.height}`} highlight />
          <InfoRow label="Color Depth" value={`${info?.screen.colorDepth}-bit`} />
          <InfoRow label="Pixel Ratio" value={`${info?.screen.pixelRatio}x`} />
          <InfoRow label="Orientation" value={info?.screen.orientation || 'Unknown'} />
        </InfoSection>

        {/* Hardware */}
        <InfoSection title="Hardware" icon={Cpu}>
          <InfoRow label="CPU Cores" value={info?.hardware.cores || 'Unknown'} highlight />
          <InfoRow label="Memory" value={info?.hardware.memory ? `${info.hardware.memory} GB` : 'Unknown'} />
          <InfoRow label="Touch Points" value={info?.hardware.maxTouchPoints || 0} />
        </InfoSection>

        {/* Network */}
        <InfoSection title="Network" icon={Wifi}>
          <InfoRow label="Status" value={info?.network.online ? 'Online' : 'Offline'} highlight />
          <InfoRow label="Type" value={info?.network.connectionType || 'Unknown'} />
          <InfoRow label="Effective Type" value={info?.network.effectiveType || 'Unknown'} />
          <InfoRow label="Downlink" value={info?.network.downlink ? `${info.network.downlink} Mbps` : 'Unknown'} />
          <InfoRow label="RTT" value={info?.network.rtt ? `${info.network.rtt} ms` : 'Unknown'} />
        </InfoSection>

        {/* Battery */}
        {info?.battery && (
          <InfoSection title="Battery" icon={Battery}>
            <InfoRow label="Level" value={`${info.battery.level}%`} highlight />
            <InfoRow label="Status" value={info.battery.charging ? 'Charging' : 'Discharging'} />
            {info.battery.charging && info.battery.chargingTime !== Infinity && (
              <InfoRow label="Time to Full" value={`${Math.round(info.battery.chargingTime / 60)} min`} />
            )}
            {!info.battery.charging && info.battery.dischargingTime !== Infinity && (
              <InfoRow label="Time Remaining" value={`${Math.round(info.battery.dischargingTime / 60)} min`} />
            )}
          </InfoSection>
        )}

        {/* Location */}
        {info?.location && (
          <InfoSection title="Location" icon={Globe}>
            <InfoRow label="IP Address" value={info.location.ip} highlight />
            <InfoRow label="City" value={info.location.city} />
            <InfoRow label="Region" value={info.location.region} />
            <InfoRow label="Country" value={info.location.country} />
            <InfoRow label="Timezone" value={info.location.timezone} />
          </InfoSection>
        )}
      </div>

      {/* User Agent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card neon-border p-6 mt-6"
      >
        <h3 className="font-display font-semibold mb-4">User Agent</h3>
        <p className="text-sm text-muted-foreground break-all font-mono bg-muted/30 p-3 rounded-lg">
          {info?.browser.userAgent}
        </p>
      </motion.div>
    </div>
  );
}

// Type definitions for Navigator extensions
interface NetworkInformation {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

interface BatteryManager {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}
