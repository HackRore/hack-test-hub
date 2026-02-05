import React, { useState, useEffect } from 'react';
import useStore from './store/useStore';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { motion as Motion, AnimatePresence } from 'framer-motion';

import SystemSpecs from './components/SystemSpecs';
import KeyboardTester from './components/KeyboardTester';
import DisplayCheck from './components/DisplayCheck';
import MediaTester from './components/MediaTester';
import InputTester from './components/InputTester';
import AudioTester from './components/AudioTester';
import BatteryProBridge from './components/BatteryProBridge';
import StorageBenchmark from './components/StorageBenchmark';
import NetworkTest from './components/NetworkTest';
import CpuTest from './components/CpuTest';
import GPUTest from './components/GPUTest';
import TouchTest from './components/TouchTest';
import QCWizard from './components/QCWizard';
import ResourceHub from './components/ResourceHub';
import BootScreen from './components/BootScreen';
import ActivationHub from './components/ActivationHub';


function App() {
  const { activeTool, hasBooted, isAdvancedView } = useStore();
  const [isBooting, setIsBooting] = useState(!hasBooted);

  // Skip boot if we've already done it once in the past
  useEffect(() => {
    if (hasBooted) {
      setIsBooting(false);
    }
  }, [hasBooted]);

  const renderContent = () => {
    switch (activeTool) {
      case 'specs': return <SystemSpecs />;
      case 'keyboard': return <KeyboardTester />;
      case 'display': return <DisplayCheck />;
      case 'media': return <MediaTester />;
      case 'input': return <InputTester />;
      case 'audio': return <AudioTester />;
      case 'storage': return <StorageBenchmark />;
      case 'network': return <NetworkTest />;
      case 'cpu': return <CpuTest />;
      case 'gpu': return <GPUTest />;
      case 'touch': return <TouchTest />;
      case 'qc': return <QCWizard />;
      case 'resources': return <ResourceHub />;
      case 'battery': return <BatteryProBridge />;
      case 'activation': return <ActivationHub />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isBooting && <BootScreen onComplete={() => setIsBooting(false)} />}
      </AnimatePresence>

      <div className={`min-h-screen text-gray-100 font-sans selection:bg-primary selection:text-black transition-all duration-1000 ${isBooting ? 'opacity-0' : 'opacity-100'} ${isAdvancedView ? 'advanced-mode' : ''}`}
        style={{ backgroundColor: 'var(--bg-color)' }}
      >
        {!isBooting && (
          <>
            <Header />
            <main className="flex-1">
              <AnimatePresence mode="wait">
                <Motion.div
                  key={activeTool || 'dashboard'}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {renderContent()}
                </Motion.div>
              </AnimatePresence>
            </main>
          </>
        )}
      </div>
    </>
  );
}

export default App;
