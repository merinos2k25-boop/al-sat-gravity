'use client';

import React, { useRef, useState } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import { AppTheme, ColorTheme } from '@/lib/types';
import {
  Moon, Sun, Palette, Download, Upload, Info, ChevronDown, ChevronUp,
  Trash2, Check, FileSpreadsheet
} from 'lucide-react';

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  storageKey?: string;
}

function Section({ icon, title, children, defaultOpen = false, storageKey }: SectionProps) {
  const [open, setOpen] = useState(() => {
    if (typeof window !== 'undefined' && storageKey) {
      const saved = localStorage.getItem(`section_${storageKey}`);
      if (saved !== null) return saved === 'true';
    }
    return defaultOpen;
  });

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined' && storageKey) {
        localStorage.setItem(`section_${storageKey}`, String(next));
      }
      return next;
    });
  };

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-primary">{icon}</span>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-white/10 pt-3">{children}</div>}
    </div>
  );
}

export default function SettingsTab() {
  const { settings, updateSettings, exportJSON, exportExcel, importJSON } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importJSON(file);
    setImportMsg({ type: result.success ? 'success' : 'error', text: result.message });
    e.target.value = '';
    setTimeout(() => setImportMsg(null), 4000);
  };

  const handleClearAll = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('trade_tracker_products');
      window.location.reload();
    }
  };

  const themes: { id: ColorTheme; label: string; color: string }[] = [
    { id: 'white', label: 'Beyaz / Gümüş', color: '#ffffff' },
    { id: 'blue', label: 'Mavi', color: '#3b82f6' },
    { id: 'green', label: 'Yeşil', color: '#22c55e' },
    { id: 'purple', label: 'Mor', color: '#a855f7' },
    { id: 'orange', label: 'Turuncu', color: '#f97316' },
    { id: 'rose', label: 'Pembe', color: '#f43f5e' },
    { id: 'amber', label: 'Kehribar', color: '#f59e0b' },
    { id: 'emerald', label: 'Zümrüt', color: '#10b981' },
    { id: 'cyan', label: 'Turkuaz', color: '#06b6d4' },
    { id: 'indigo', label: 'İndigo', color: '#6366f1' },
    { id: 'crimson', label: 'Kırmızı', color: '#e11d48' },
  ];

  return (
    <div className="px-4 pt-6 pb-32 space-y-4">
      <div className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">⚙️ Ayarlar</h1>
        <p className="text-white/50 text-xs mt-1">Uygulama tercihlerini özelleştir</p>
      </div>

      {/* Theme */}
      <Section icon={<Moon size={16} />} title="Görünüm Teması" defaultOpen storageKey="theme">
        <div className="flex gap-3">
          {([
            { id: 'dark' as AppTheme, label: 'Koyu Mod', icon: Moon, desc: 'Karanlık & Şık' },
            { id: 'light' as AppTheme, label: 'Açık Mod', icon: Sun, desc: 'Ferah & Net Siyah' },
          ]).map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => updateSettings({ theme: id })}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-3 rounded-xl border transition-all ${
                settings.theme === id
                  ? 'border-primary bg-primary/15 font-semibold shadow-sm'
                  : 'border-white/10 bg-white/5 text-white/60 hover:text-white/90'
              }`}
              style={settings.theme === id ? { color: 'hsl(var(--primary-hsl))' } : undefined}
            >
              <Icon size={22} />
              <span className="text-xs">{label}</span>
              <span className="text-[10px] opacity-60 text-center">{desc}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Color theme */}
      <Section icon={<Palette size={16} />} title="Renk Teması" defaultOpen storageKey="color">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {themes.map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => updateSettings({ colorTheme: id })}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                settings.colorTheme === id
                  ? 'border-primary bg-primary/15 shadow-sm font-semibold'
                  : 'border-white/10 bg-white/5 text-white/60 hover:text-white/90'
              }`}
              style={settings.colorTheme === id ? { color: 'hsl(var(--primary-hsl))' } : undefined}
            >
              <span
                className="w-4 h-4 rounded-full inline-block shrink-0 shadow-sm border border-white/30"
                style={{ backgroundColor: color }}
              />
              <span className="truncate">{label}</span>
              {settings.colorTheme === id && (
                <Check size={13} className="ml-auto shrink-0" style={{ color: 'hsl(var(--primary-hsl))' }} />
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* Data */}
      <Section icon={<Download size={16} />} title="Veri Yönetimi" defaultOpen storageKey="data">
        <div className="space-y-2.5">
          {/* Excel Export */}
          <button
            onClick={exportExcel}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition"
          >
            <FileSpreadsheet size={18} className="text-emerald-400 shrink-0" />
            <div className="text-left">
              <div className="font-semibold text-emerald-400">Excel ile Dışa Aktar (.xlsx)</div>
              <div className="text-xs text-emerald-400/70">Derlenmiş Excel tablosu ve özet sayfası olarak indir</div>
            </div>
          </button>

          {/* JSON Export */}
          <button
            onClick={exportJSON}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition"
          >
            <Download size={18} className="shrink-0" />
            <div className="text-left">
              <div className="font-semibold">JSON Yedek İndir</div>
              <div className="text-xs text-primary/70">Tüm verilerini JSON formatında yedekle</div>
            </div>
          </button>

          {/* JSON Import */}
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition"
          >
            <Upload size={18} className="shrink-0" />
            <div className="text-left">
              <div className="font-semibold">JSON Yedek Yükle</div>
              <div className="text-xs text-white/40">Daha önce kaydedilen JSON yedeğini geri yükle</div>
            </div>
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileRef}
            onChange={handleImport}
            className="hidden"
          />

          {importMsg && (
            <div
              className={`text-xs px-3 py-2 rounded-xl ${
                importMsg.type === 'success'
                  ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                  : 'bg-red-500/15 text-red-400 border border-red-500/20'
              }`}
            >
              {importMsg.text}
            </div>
          )}

          {/* Danger zone */}
          <div className="pt-2 border-t border-white/10">
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition"
              >
                <Trash2 size={18} className="shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">Tüm Verileri Sıfırla</div>
                  <div className="text-xs text-red-400/60">Kayıtlı tüm ürünleri ve ayarları sil</div>
                </div>
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-red-400 text-center">Tüm veriler silinecek. Emin misiniz?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearAll}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold"
                  >
                    Evet, Sil
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 text-sm"
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* About */}
      <Section icon={<Info size={16} />} title="Hakkında" storageKey="about">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-bold text-base">Ticaret Takip</h3>
              <p className="text-white/40 text-xs mt-1">Versiyon 1.0.0</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-white/60">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span>Geliştirici</span>
              <span className="text-white font-medium">HAKAN KORKMAZ</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span>Telif Hakkı</span>
              <span className="text-white font-medium">© 2026</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span>Lisans</span>
              <span className="text-white font-medium">Özel</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Versiyon</span>
              <span className="text-white font-medium">1.0.0</span>
            </div>
          </div>
          <p className="text-center text-[10px] text-white/30 pt-2">
            Ticaret Takip — HAKAN KORKMAZ tarafından tasarlanmıştır.
            <br />Copyright © 2026 Tüm hakları saklıdır.
          </p>
        </div>
      </Section>
    </div>
  );
}
