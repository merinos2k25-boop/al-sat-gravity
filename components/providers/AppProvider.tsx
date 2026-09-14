'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Product, AppSettings, Summary } from '@/lib/types';
import {
  getProducts,
  getSettings,
  saveProducts,
  saveSettings,
  addProduct as storeAddProduct,
  updateProduct as storeUpdateProduct,
  deleteProduct as storeDeleteProduct,
  calculateSummary,
  exportData,
  importData,
  defaultSettings,
} from '@/lib/store';

interface AppContextType {
  products: Product[];
  settings: AppSettings;
  summary: Summary;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  exportJSON: () => void;
  importJSON: (file: File) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    setProducts(getProducts());
    const s = getSettings();
    setSettings(s);
  }, []);

  // Apply theme & font to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', settings.theme === 'dark');

    const colorMap: Record<string, string> = {
      blue: '221 83% 53%',
      green: '142 71% 45%',
      purple: '270 76% 58%',
      orange: '25 95% 53%',
      rose: '347 89% 60%',
    };
    root.style.setProperty('--color-primary', colorMap[settings.colorTheme] ?? colorMap.blue);

    const fontMap: Record<string, string> = {
      default: "'Inter', 'Helvetica Neue', sans-serif",
      mono: "'JetBrains Mono', 'Courier New', monospace",
      rounded: "'Nunito', 'Arial Rounded MT Bold', sans-serif",
    };
    root.style.setProperty('--font-family', fontMap[settings.fontFamily] ?? fontMap.default);
  }, [settings]);

  const summary = calculateSummary(products);

  const addProduct = useCallback((product: Product) => {
    const updated = storeAddProduct(product);
    setProducts(updated);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const updated = storeUpdateProduct(id, updates);
    setProducts(updated);
  }, []);

  const deleteProduct = useCallback((id: string) => {
    const updated = storeDeleteProduct(id);
    setProducts(updated);
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const exportJSON = useCallback(() => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticaret-takip-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importJSON = useCallback(async (file: File): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const result = importData(text);
        if (result.success) {
          setProducts(getProducts());
          const s = getSettings();
          setSettings(s);
        }
        resolve(result);
      };
      reader.onerror = () => resolve({ success: false, message: 'Dosya okunamadı.' });
      reader.readAsText(file);
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        products,
        settings,
        summary,
        addProduct,
        updateProduct,
        deleteProduct,
        updateSettings,
        exportJSON,
        importJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
