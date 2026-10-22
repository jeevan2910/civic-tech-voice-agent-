import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { LoginPage } from '@/pages/LoginPage';
import { OfficerDashboard } from '@/pages/OfficerDashboard';
import { SupervisorDashboard } from '@/pages/SupervisorDashboard';
import { ClustersPage } from '@/pages/ClustersPage';
import { AnalyticsHeatmapPage } from '@/pages/AnalyticsHeatmapPage';
import { SubmitGrievancePage } from '@/pages/SubmitGrievancePage';
import { VoiceAgentPage } from '@/pages/VoiceAgentPage';
// import { GuardrailsEvalsPage } from '@/pages/GuardrailsEvalsPage';
import { api } from '@/api/client';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('officer');
  const [criticalCount, setCriticalCount] = useState(48);

  useEffect(() => {
    if (user?.role === 'supervisor') {
      setActiveView('supervisor');
    } else if (user?.role === 'citizen') {
      setActiveView('submit');
    } else {
      setActiveView('officer');
    }

    // Load initial critical count for badge
    api.getOfficerSummary()
      .then(res => {
        if (res?.priority_breakdown?.critical) {
          setCriticalCount(res.priority_breakdown.critical);
        }
      })
      .catch(console.error);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#181d26] border-t-transparent mx-auto" />
          <p className="text-xs font-medium text-[#41454d]">
            Initializing CivicAI Intelligence Engine...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#181d26] selection:text-white">
      {/* Top Navbar */}
      <Navbar 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto">
        
        {/* Sidebar */}
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          criticalCount={criticalCount}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-7 overflow-y-auto max-w-full">
          {activeView === 'officer' && <OfficerDashboard />}
          {activeView === 'supervisor' && <SupervisorDashboard />}
          {activeView === 'clusters' && <ClustersPage />}
          {activeView === 'heatmap' && <AnalyticsHeatmapPage />}
          {activeView === 'submit' && (
            <SubmitGrievancePage 
              onGrievanceSubmitted={() => {
                api.getOfficerSummary().then(res => {
                  if (res?.priority_breakdown?.critical) setCriticalCount(res.priority_breakdown.critical);
                });
              }} 
            />
          )}
          {activeView === 'voice' && <VoiceAgentPage />}
          {/* {activeView === 'evals' && <GuardrailsEvalsPage />} */}
        </main>


      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

