import React from 'react';
import { AmlProvider, useAml } from './context/AmlContext';
import { Navbar } from './components/layout/Navbar';
import { AlertsQueueView } from './components/alerts/AlertsQueueView';
import { RuleEngineView } from './components/rules/RuleEngineView';
import { LotesCoeView } from './components/coe/LotesCoeView';
import { DashboardView } from './components/dashboard/DashboardView';
import { InvestigationView } from './components/investigation/InvestigationView';
import { HistoricalAuditView } from './components/audit/HistoricalAuditView';
import { BiAnalyticsView } from './components/analytics/BiAnalyticsView';
import { FlowManagerView } from './components/flow/FlowManagerView';
import { RealEstateCrossView } from './components/analytics/RealEstateCrossView';
import { DirexApprovalView } from './components/direx/DirexApprovalView';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRoute, toastMessage } = useAml();

  const renderCurrentView = () => {
    if (currentRoute.startsWith('/investigacao')) {
      return <InvestigationView />;
    }
    if (currentRoute.startsWith('/direx')) {
      return <DirexApprovalView />;
    }
    if (currentRoute.startsWith('/auditoria')) {
      return <HistoricalAuditView />;
    }
    if (currentRoute.startsWith('/bi') || currentRoute.startsWith('/analytics')) {
      return <BiAnalyticsView />;
    }
    if (currentRoute.startsWith('/flow-manager')) {
      return <FlowManagerView />;
    }
    if (currentRoute.startsWith('/imoveis') || currentRoute.startsWith('/cruzamento-imoveis')) {
      return <RealEstateCrossView />;
    }
    if (currentRoute.startsWith('/regras')) {
      return <RuleEngineView />;
    }
    if (currentRoute.startsWith('/lotes-coe')) {
      return <LotesCoeView />;
    }
    if (currentRoute.startsWith('/dashboard')) {
      return <DashboardView />;
    }
    return <AlertsQueueView />;
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#222222] flex flex-col font-sans selection:bg-[#FFCC01] selection:text-[#0C0A00]">
      {/* Top Main Navigation Header */}
      <Navbar />

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-x-hidden">
        {renderCurrentView()}
      </main>

      {/* Global Animated Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-3 rounded-lg border shadow-xl flex items-center gap-3 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-[#FFFFFF] border-emerald-500 text-emerald-800'
                : toastMessage.type === 'warning'
                ? 'bg-[#FFFBEB] border-[#FFCC01] text-amber-900'
                : toastMessage.type === 'error'
                ? 'bg-[#FEF2F2] border-red-500 text-red-800'
                : 'bg-[#FFFFFF] border-[#D1D5DB] text-zinc-800'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
            {toastMessage.type === 'error' && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-5 h-5 text-zinc-800 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AmlProvider>
      <AppContent />
    </AmlProvider>
  );
}
