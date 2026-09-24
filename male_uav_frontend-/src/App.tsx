import React, { useState, useEffect } from 'react';
import { GcsProvider, useGcs } from './contexts/GcsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { DemoTourModal } from './components/common/DemoTourModal';
import { CommandConsole } from './components/common/CommandConsole';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { AIPredictionsPage } from './pages/AIPredictionsPage';
import { HybridVerificationPage } from './pages/HybridVerificationPage';
import { MissionControlPage } from './pages/MissionControlPage';
import { MissionReplayPage } from './pages/MissionReplayPage';
import { FaultInjectionPage } from './pages/FaultInjectionPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { FleetMonitoringPage } from './pages/FleetMonitoringPage';
import { AlertCenterPage } from './pages/AlertCenterPage';
import { MultiAgentAiPage } from './pages/MultiAgentAiPage';
import { ContinuousLearningPage } from './pages/ContinuousLearningPage';
import { ReportsPage } from './pages/ReportsPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { GarudaAIPage } from './pages/GarudaAIPage';
import { GarudaFloatingBadge } from './components/GarudaFloatingBadge';

const MainLayout: React.FC = () => {
  const { systemReady, activeTab, nightVisionMode, startDemoTour } = useGcs();
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Keyboard shortcut handlers for tactical operator ergonomics
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '`' || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        setIsConsoleOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!systemReady) {
    return (
      <div className="fixed inset-0 bg-[#F8FAFC] text-[#0F172A] font-mono-code z-50 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-[#E2E8F0] border-t-blue-500 animate-spin" />
          <div className="w-16 h-16 rounded-full border-4 border-[#E2E8F0] border-b-indigo-400 animate-spin absolute" style={{ animationDirection: 'reverse' }} />
        </div>

        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-widest animate-pulse">
            DRDO GCS MISSION INITIALIZATION
          </span>
          <h2 className="font-heading font-bold text-2xl text-[#0F172A] tracking-wider">
            Restoring Mission &amp; Subsystem State...
          </h2>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Synchronizing TimescaleDB telemetry snapshots, restoring active fault vectors, Digital Twin CAD state &amp; AI prognostics.
          </p>
        </div>

        <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-xl p-3 text-[11px] space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-[#475569]">
            <span>Database Connection (TimescaleDB):</span>
            <span className="text-green-600 font-bold">CONNECTED</span>
          </div>
          <div className="flex justify-between items-center text-[#475569]">
            <span>SCADA Avionics Stream:</span>
            <span className="text-blue-600 font-bold">SYNCHRONIZING</span>
          </div>
          <div className="flex justify-between items-center text-[#475569]">
            <span>Digital Twin 3D State:</span>
            <span className="text-indigo-500 font-bold">RESTORING</span>
          </div>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'live-monitoring':
        return <LiveMonitoringPage />;
      case 'digital-twin':
        return <DigitalTwinPage />;
      case 'ai-predictions':
        return <AIPredictionsPage />;
      case 'hybrid-verification':
        return <HybridVerificationPage />;
      case 'mission-control':
        return <MissionControlPage />;
      case 'replay':
        return <MissionReplayPage />;
      case 'fault-injection':
        return <FaultInjectionPage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'fleet':
        return <FleetMonitoringPage />;
      case 'alerts':
        return <AlertCenterPage />;
      case 'multi-agent':
        return <MultiAgentAiPage />;
      case 'continuous-learning':
        return <ContinuousLearningPage />;
      case 'reports':
        return <ReportsPage />;
      case 'system-health':
        return <SystemHealthPage />;
      case 'garuda-ai':
        return <GarudaAIPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-blue-500/20 selection:text-blue-900 ${
      nightVisionMode ? 'theme-night-vision' : ''
    }`}>
      {/* Tactical Header Navbar */}
      <Navbar onOpenConsole={() => setIsConsoleOpen(true)} />

      {/* Main App Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tactical Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Main Viewport Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] relative grid-bg custom-scrollbar">
          <div key={activeTab} className="relative z-10 page-fade-in">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Professional Polish Tactical Footer */}
      <footer className="h-9 bg-white border-t border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between text-[10px] text-[#334155] uppercase monospace shrink-0 z-20">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
          <div className="flex items-center gap-1.5 whitespace-nowrap font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 led-glow"></span>
            <span>Telemetry: 20Hz Link-A Active</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap hidden sm:flex font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 led-glow"></span>
            <span>AI Neural Engine: Nominal</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap hidden md:flex font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-500 led-glow"></span>
            <span>DT Sync: 2.4ms Latency</span>
          </div>
        </div>

        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className="text-[#334155] font-semibold">System Build: <strong className="text-[#1E40AF] font-bold">v4.2.8-STABLE</strong></span>
          <span className="text-[#CBD5E1] hidden sm:inline">|</span>
          <span className="text-amber-800 font-bold hidden sm:inline">DRDO ADE RESTRICTED</span>
        </div>
      </footer>

      {/* Slide-out AI Tactical Copilot Console */}
      <CommandConsole
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
      />

      {/* Judge Guided Presentation & Evaluation Tour Modal */}
      <DemoTourModal />

      {/* Persistent Global Mission Intelligence Floating Badge */}
      <GarudaFloatingBadge />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <GcsProvider>
        <MainLayout />
      </GcsProvider>
    </ThemeProvider>
  );
}
