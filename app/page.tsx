'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppProvider } from '@/components/providers/AppProvider';
import BottomNav, { TabId } from '@/components/ui/BottomNav';
import HomeTab from '@/components/tabs/HomeTab';
import PurchaseTab from '@/components/tabs/PurchaseTab';
import SalesTab from '@/components/tabs/SalesTab';
import SummaryTab from '@/components/tabs/SummaryTab';
import SettingsTab from '@/components/tabs/SettingsTab';

const ORDERED_TABS: TabId[] = ['home', 'purchase', 'sales', 'summary', 'settings'];

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Sadece belirgin yatay kaydırma ise (en az 60px ve dikey kaydırmadan fazla)
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      const currentIndex = ORDERED_TABS.indexOf(activeTab);
      if (deltaX < 0 && currentIndex < ORDERED_TABS.length - 1) {
        // Sağa kaydırma -> sonraki sekme
        setActiveTab(ORDERED_TABS[currentIndex + 1]);
      } else if (deltaX > 0 && currentIndex > 0) {
        // Sola kaydırma -> önceki sekme
        setActiveTab(ORDERED_TABS[currentIndex - 1]);
      }
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'purchase':
        return <PurchaseTab />;
      case 'sales':
        return <SalesTab />;
      case 'summary':
        return <SummaryTab />;
      case 'settings':
        return <SettingsTab />;
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground max-w-lg mx-auto relative overflow-x-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <main className="overflow-y-auto">{renderTab()}</main>
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
