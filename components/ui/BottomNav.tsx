'use client';

import React from 'react';
import { Home, ShoppingCart, TrendingUp, BarChart3, Settings } from 'lucide-react';

export type TabId = 'home' | 'purchase' | 'sales' | 'summary' | 'settings';

interface BottomNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

const tabs = [
  { id: 'home' as TabId, label: 'Ana Sayfa', icon: Home },
  { id: 'purchase' as TabId, label: 'Alış', icon: ShoppingCart },
  { id: 'sales' as TabId, label: 'Satış', icon: TrendingUp },
  { id: 'summary' as TabId, label: 'Özet', icon: BarChart3 },
  { id: 'settings' as TabId, label: 'Ayarlar', icon: Settings },
];

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
      <div className="flex max-w-lg mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-all ${
                active ? 'text-primary' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all ${active ? 'bg-primary/15' : ''}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'opacity-100' : 'opacity-60'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
