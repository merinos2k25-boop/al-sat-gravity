'use client';

import React, { useRef, useState } from 'react';
import { Home, ShoppingCart, TrendingUp, BarChart3, Settings } from 'lucide-react';

export type TabId = 'home' | 'purchase' | 'sales' | 'summary' | 'settings';

interface BottomNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

const tabs: TabItem[] = [
  { id: 'home', label: 'Ana Sayfa', icon: Home },
  { id: 'purchase', label: 'Alış', icon: ShoppingCart },
  { id: 'sales', label: 'Satış', icon: TrendingUp },
  { id: 'summary', label: 'Özet', icon: BarChart3 },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);
  const navRef = useRef<HTMLElement>(null);
  const isDraggingRef = useRef(false);
  const lastTargetIndexRef = useRef(activeIndex);

  // Parmağın bar üzerindeki konumuna göre sekme tespiti
  const calculateIndexFromX = (clientX: number): number => {
    if (!navRef.current) return activeIndex;
    const rect = navRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const boundedX = Math.max(0, Math.min(relativeX, rect.width - 1));
    return Math.floor((boundedX / rect.width) * tabs.length);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    const targetIndex = calculateIndexFromX(e.clientX);
    lastTargetIndexRef.current = targetIndex;
    if (targetIndex >= 0 && targetIndex < tabs.length) {
      onChange(tabs[targetIndex].id);
    }
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!isDraggingRef.current) return;
    const targetIndex = calculateIndexFromX(e.clientX);
    if (targetIndex >= 0 && targetIndex < tabs.length) {
      lastTargetIndexRef.current = targetIndex;
      if (tabs[targetIndex].id !== activeTab) {
        onChange(tabs[targetIndex].id);
      }
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    // Parmağın en son bırakıldığı sekmede kesin olarak kal
    const finalIndex = lastTargetIndexRef.current;
    if (finalIndex >= 0 && finalIndex < tabs.length) {
      onChange(tabs[finalIndex].id);
    }
  };

  return (
    <div
      className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <nav
        ref={navRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="pointer-events-auto relative w-full max-w-sm h-16 rounded-full px-1.5 py-1 flex items-center bg-black/75 dark:bg-[#0c0e14]/85 backdrop-blur-2xl border border-white/20 select-none cursor-pointer touch-none shadow-[0_20px_45px_-10px_rgba(0,0,0,0.7),inset_0_1px_1px_0_rgba(255,255,255,0.28)]"
      >
        {/* Sekmeler Arasında Pürüzsüzce Kayan iOS 26 Glass Kapsül Hapı */}
        <div
          className="absolute top-1.5 bottom-1.5 rounded-full bg-white/22 dark:bg-white/18 backdrop-blur-xl border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_15px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
          style={{
            width: `calc((100% - 12px) / ${tabs.length})`,
            transform: `translate3d(calc(${activeIndex} * 100%), 0, 0)`,
          }}
        />

        {/* Sekme Butonları */}
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(id);
              }}
              className="relative z-10 flex-1 h-full flex flex-col items-center justify-center rounded-full transition-transform active:scale-90 group focus:outline-none"
              aria-label={label}
            >
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 1.9}
                  className={`transition-all duration-300 ${
                    active
                      ? 'text-white scale-110 drop-shadow-[0_2px_8px_rgba(255,255,255,0.5)]'
                      : 'text-white/50 group-hover:text-white/80'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
