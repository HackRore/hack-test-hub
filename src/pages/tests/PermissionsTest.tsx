import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Camera, Mic, Bell, Check, X, AlertCircle } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useTestStore } from '@/stores/testStore';

type PermissionName = 'camera' | 'microphone' | 'notifications';

interface PermissionStatus {
  name: PermissionName;
  label: string;
  icon: typeof Camera;
  status: 'granted' | 'denied' | 'prompt' | 'checking';
}

export default function PermissionsTest() {
  const setResult = useTestStore((s) => s.setResult);
  const [permissions, setPermissions] = useState<PermissionStatus[]>([
    { name: 'camera', label: 'Camera', icon: Camera, status: 'checking' },
    { name: 'microphone', label: 'Microphone', icon: Mic, status: 'checking' },
    { name: 'notifications', label: 'Notifications', icon: Bell, status: 'checking' },
  ]);

  const checkPermission = async (name: PermissionName): Promise<'granted' | 'denied' | 'prompt'> => {
    try {
      if (name === 'notifications') {
        const result = Notification.permission;
        return result as 'granted' | 'denied' | 'prompt';
      }
      
      const result = await navigator.permissions.query({ name: name as PermissionName });
      return result.state as 'granted' | 'denied' | 'prompt';
    } catch {
      return 'prompt';
    }
  };

  const checkAllPermissions = async () => {
    const updated = await Promise.all(
      permissions.map(async (p) => ({
        ...p,
        status: await checkPermission(p.name),
      }))
    );
    setPermissions(updated);
    
    const granted = updated.filter(p => p.status === 'granted').length;
    setResult('permissions', {
      name: 'Permissions',
      status: granted === updated.length ? 'pass' : granted > 0 ? 'partial' : 'fail',
      details: `${granted}/${updated.length} permissions granted`,
    });
  };

  const requestPermission = async (name: PermissionName) => {
    try {
      if (name === 'camera') {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } else if (name === 'microphone') {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } else if (name === 'notifications') {
        await Notification.requestPermission();
      }
      checkAllPermissions();
    } catch {
      checkAllPermissions();
    }
  };

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted': return <Check className="w-5 h-5 text-accent" />;
      case 'denied': return <X className="w-5 h-5 text-destructive" />;
      case 'checking': return <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />;
      default: return <AlertCircle className="w-5 h-5 text-neon-orange" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'granted': return 'bg-accent/20 border-accent/50';
      case 'denied': return 'bg-destructive/20 border-destructive/50';
      case 'checking': return 'bg-primary/20 border-primary/50';
      default: return 'bg-neon-orange/20 border-neon-orange/50';
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center neon-glow-cyan">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Permissions Test</h1>
            <p className="text-muted-foreground">Verify camera, microphone, and notification access</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 max-w-2xl">
        {permissions.map((permission, index) => {
          const Icon = permission.icon;
          return (
            <motion.div
              key={permission.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card neon-border p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">{permission.label}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      Status: {permission.status}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${getStatusBg(permission.status)}`}>
                    {getStatusIcon(permission.status)}
                    <span className="text-sm font-medium capitalize">{permission.status}</span>
                  </div>
                  
                  {permission.status !== 'granted' && permission.status !== 'checking' && (
                    <NeonButton
                      variant="cyan"
                      size="sm"
                      onClick={() => requestPermission(permission.name)}
                    >
                      Request
                    </NeonButton>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <NeonButton variant="purple" onClick={checkAllPermissions}>
          Recheck All Permissions
        </NeonButton>
      </motion.div>
    </div>
  );
}
