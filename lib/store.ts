import { Product, AppSettings, AppData, Summary } from './types';

const PRODUCTS_KEY = 'trade_tracker_products';
const SETTINGS_KEY = 'trade_tracker_settings';
const APP_VERSION = '1.0.0';

export const defaultSettings: AppSettings = {
  theme: 'dark',
  colorTheme: 'blue',
  fontFamily: 'default',
};

// --- Products ---
export function getProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Product): Product[] {
  const products = getProducts();
  const updated = [product, ...products];
  saveProducts(updated);
  return updated;
}

export function updateProduct(id: string, updates: Partial<Product>): Product[] {
  const products = getProducts();
  const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveProducts(updated);
  return updated;
}

export function deleteProduct(id: string): Product[] {
  const products = getProducts();
  const updated = products.filter((p) => p.id !== id);
  saveProducts(updated);
  return updated;
}

// --- Settings ---
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// --- Summary ---
export function calculateSummary(products: Product[]): Summary {
  const sold = products.filter((p) => p.status === 'Satıldı');
  const inStock = products.filter((p) => p.status === 'Stokta');

  const totalPurchaseAmount = products.reduce((sum, p) => sum + p.purchasePrice, 0);
  const totalSaleAmount = sold.reduce((sum, p) => sum + (p.salePrice ?? 0), 0);
  const totalExpenses = products.reduce((sum, p) => sum + p.expenses, 0);
  const netProfit = totalSaleAmount - totalPurchaseAmount - totalExpenses;

  const profitableDeals = sold.filter(
    (p) => (p.salePrice ?? 0) - p.purchasePrice - p.expenses > 0
  ).length;
  const unprofitableDeals = sold.filter(
    (p) => (p.salePrice ?? 0) - p.purchasePrice - p.expenses <= 0
  ).length;

  return {
    totalPurchases: products.length,
    totalSales: sold.length,
    inStock: inStock.length,
    totalPurchaseAmount,
    totalSaleAmount,
    totalExpenses,
    netProfit,
    profitableDeals,
    unprofitableDeals,
  };
}

// --- Export / Import ---
export function exportData(): string {
  const data: AppData = {
    products: getProducts(),
    settings: getSettings(),
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): { success: boolean; message: string } {
  try {
    const data: AppData = JSON.parse(jsonString);
    if (!data.products || !Array.isArray(data.products)) {
      return { success: false, message: 'Geçersiz dosya formatı.' };
    }
    saveProducts(data.products);
    if (data.settings) {
      saveSettings({ ...defaultSettings, ...data.settings });
    }
    return { success: true, message: `${data.products.length} ürün başarıyla içe aktarıldı.` };
  } catch {
    return { success: false, message: 'JSON dosyası okunamadı.' };
  }
}

// --- Utils ---
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
