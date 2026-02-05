import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import PermissionsTest from "./pages/tests/PermissionsTest";
import WebcamTest from "./pages/tests/WebcamTest";
import MicrophoneTest from "./pages/tests/MicrophoneTest";
import SpeakerTest from "./pages/tests/SpeakerTest";
import KeyboardTest from "./pages/tests/KeyboardTest";
import DisplayTest from "./pages/tests/DisplayTest";
import MouseTest from "./pages/tests/MouseTest";
import NetworkTest from "./pages/tests/NetworkTest";
import CPUBenchmark from "./pages/tests/CPUBenchmark";
import GPUBenchmark from "./pages/tests/GPUBenchmark";
import MemoryBenchmark from "./pages/tests/MemoryBenchmark";
import StorageTest from "./pages/tests/StorageTest";
import ControllerTest from "./pages/tests/ControllerTest";
import MIDITest from "./pages/tests/MIDITest";
import SystemInfoTest from "./pages/tests/SystemInfoTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/permissions" element={<PermissionsTest />} />
            <Route path="/webcam" element={<WebcamTest />} />
            <Route path="/microphone" element={<MicrophoneTest />} />
            <Route path="/speaker" element={<SpeakerTest />} />
            <Route path="/keyboard" element={<KeyboardTest />} />
            <Route path="/display" element={<DisplayTest />} />
            <Route path="/mouse" element={<MouseTest />} />
            <Route path="/network" element={<NetworkTest />} />
            <Route path="/cpu" element={<CPUBenchmark />} />
            <Route path="/gpu" element={<GPUBenchmark />} />
            <Route path="/memory" element={<MemoryBenchmark />} />
            <Route path="/storage" element={<StorageTest />} />
            <Route path="/controller" element={<ControllerTest />} />
            <Route path="/midi" element={<MIDITest />} />
            <Route path="/system" element={<SystemInfoTest />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
