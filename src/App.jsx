import React from 'react';
import useStore from './store/useStore';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';

import SystemSpecs from './components/SystemSpecs';
import KeyboardTester from './components/KeyboardTester';
import DisplayCheck from './components/DisplayCheck';
import MediaTester from './components/MediaTester';
import InputTester from './components/InputTester';
import AudioTester from './components/AudioTester';
import BatteryStatus from './components/BatteryStatus';
import StorageBenchmark from './components/StorageBenchmark';
import NetworkTest from './components/NetworkTest';
import CpuTest from './components/CpuTest';
import GpuTest from './components/GpuTest';
import TouchTest from './components/TouchTest';
import QCWizard from './components/QCWizard';
import HealthStatusCard from './components/HealthStatusCard';


function App() {
  const { activeTool } = useStore();

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
      case 'gpu': return <GpuTest />;
      case 'touch': return <TouchTest />;
      case 'qc': return <QCWizard />;
      case 'battery': return <HealthStatusCard />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 font-mono selection:bg-primary selection:text-black">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTool || 'dashboard'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
