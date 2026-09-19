'use client';

import React, { useRef } from 'react';
import { Home, ShoppingCart, TrendingUp, BarChart3, Settings } from 'lucide-react';
import { useApp } from '@/components/providers/AppProvider';

export type TabId = 'home' | 'purchase' | 'sales' | 'summary' | 'settings';

interface BottomNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
}

const tabs: TabItem[] = [
  { id: 'home', label: 'Ana Sayfa', icon: Home },
  { id: 'purchase', label: 'Alış', icon: ShoppingCart },
  { id: 'sales', label: 'Satış', icon: TrendingUp },
  { id: 'summary', label: 'Özet', icon: BarChart3 },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const { settings } = useApp();
  const isWhiteTheme = settings.colorTheme === 'white';
  const isLight = settings.theme === 'light';
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
    const finalIndex = lastTargetIndexRef.current;
    if (finalIndex >= 0 && finalIndex < tabs.length) {
      onChange(tabs[finalIndex].id);
    }
  };

  const isMinimalSaas = settings.uiStyle === 'minimal-saas';

  // ─── Kapsül stili ────────────────────────────────────────────────────────────
  // Tamamen JS tabanlı — dark: Tailwind prefixi kullanmıyoruz (OS tercihine bakmasın)
  const getCapsuleStyle = (): React.CSSProperties => {
    if (isMinimalSaas) {
      if (isWhiteTheme) {
        return {
          backgroundColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.2)',
          borderColor: isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.4)',
          boxShadow: 'none',
        };
      }
      return {
        backgroundColor: isLight ? 'hsl(var(--primary-hsl) / 0.12)' : 'hsl(var(--primary-hsl) / 0.20)',
        borderColor: isLight ? 'hsl(var(--primary-hsl) / 0.35)' : 'hsl(var(--primary-hsl) / 0.45)',
        boxShadow: 'none',
      };
    }

    // Retro Glass Stili (Varsayılan): Cam ışıltısı & parlak yansıma
    if (isWhiteTheme) {
      return isLight
        ? {
            backgroundColor: 'rgba(0, 0, 0, 0.10)',
            borderColor: 'rgba(0, 0, 0, 0.20)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
          }
        : {
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            borderColor: 'rgba(255, 255, 255, 0.7)',
            boxShadow: '0 0 25px rgba(255, 255, 255, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.6)',
          };
    }

    return isLight
      ? {
          backgroundColor: 'hsl(var(--primary-hsl) / 0.16)',
          borderColor: 'hsl(var(--primary-hsl) / 0.45)',
          boxShadow: '0 4px 16px hsl(var(--primary-hsl) / 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
        }
      : {
          backgroundColor: 'hsl(var(--primary-hsl) / 0.22)',
          borderColor: 'hsl(var(--primary-hsl) / 0.55)',
          boxShadow: '0 0 22px hsl(var(--primary-hsl) / 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.35)',
        };
  };

  // ─── Aktif ikon rengi ────────────────────────────────────────────────────────
  const getActiveIconColor = (): string => {
    if (isWhiteTheme) {
      return isLight ? '#0f172a' : '#ffffff';
    }
    return 'hsl(var(--primary-hsl))';
  };

  // ─── Nav bar arka planı ──────────────────────────────────────────────────────
  // Minimal SaaS vs Retro Glass desteği
  const navStyle: React.CSSProperties = isMinimalSaas
    ? isLight
      ? {
          backgroundColor: '#ffffff',
          borderColor: 'rgba(220, 225, 236, 0.95)',
          boxShadow: '0 4px 20px rgba(40, 47, 83, 0.08)',
        }
      : {
          backgroundColor: '#0d1b2a',
          borderColor: 'rgba(43, 58, 80, 0.95)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        }
    : isLight
    ? {
        backgroundColor: 'rgba(255, 255, 255, 0.90)',
        borderColor: 'rgba(0, 0, 0, 0.10)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
      }
    : {
        backgroundColor: 'rgba(12, 14, 20, 0.90)',
        borderColor: 'rgba(255, 255, 255, 0.18)',
        boxShadow: '0 20px 45px -10px rgba(0,0,0,0.7), inset 0 1px 1px 0 rgba(255,255,255,0.28)',
      };

  // Pasif ikon rengi
  const inactiveIconColor = isLight ? '#94a3b8' : 'rgba(255,255,255,0.45)';

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
        className="pointer-events-auto relative w-full max-w-sm h-16 rounded-full px-1.5 py-1 flex items-center backdrop-blur-2xl border select-none cursor-pointer touch-none"
        style={navStyle}
      >
        {/* Kayan Kapsül */}
        <div
          className="absolute top-1.5 bottom-1.5 rounded-full backdrop-blur-xl border transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
          style={{
            width: `calc((100% - 12px) / ${tabs.length})`,
            transform: `translate3d(calc(${activeIndex} * 100%), 0, 0)`,
            ...getCapsuleStyle(),
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
                  strokeWidth={active ? 2.5 : 1.9}
                  className="transition-all duration-300"
                  style={
                    active
                      ? {
                          color: getActiveIconColor(),
                          filter: isLight
                            ? 'drop-shadow(0 2px 5px rgba(0,0,0,0.15))'
                            : `drop-shadow(0 0 8px hsl(var(--primary-hsl) / 0.9))`,
                        }
                      : { color: inactiveIconColor }
                  }
                />
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
