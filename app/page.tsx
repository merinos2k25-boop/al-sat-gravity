'use client';

import React, { useState, useEffect } from 'react';
import { AppProvider } from '@/components/providers/AppProvider';
import BottomNav, { TabId } from '@/components/ui/BottomNav';
import HomeTab from '@/components/tabs/HomeTab';
import PurchaseTab from '@/components/tabs/PurchaseTab';
import SalesTab from '@/components/tabs/SalesTab';
import SummaryTab from '@/components/tabs/SummaryTab';
import SettingsTab from '@/components/tabs/SettingsTab';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('home');

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <HomeTab />;
      case 'purchase': return <PurchaseTab />;
      case 'sales': return <SalesTab />;
      case 'summary': return <SummaryTab />;
      case 'settings': return <SettingsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground max-w-lg mx-auto relative">
      <main className="overflow-y-auto">
        {renderTab()}
      </main>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">📊</div>
          <p className="text-white/40 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
