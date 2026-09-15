import { Product, AppSettings, AppData, Summary } from './types';
import * as XLSX from 'xlsx';

const PRODUCTS_KEY = 'trade_tracker_products';
const SETTINGS_KEY = 'trade_tracker_settings';
const APP_VERSION = '1.0.0';

export const defaultSettings: AppSettings = {
  theme: 'dark',
  colorTheme: 'blue',
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

  // Stoktaki ürünlerin alış fiyatları kar/zarardan DÜŞÜLMEZ. Net kar = Yalnızca satılanların toplam kar/zararı!
  const netProfit = sold.reduce(
    (sum, p) => sum + ((p.salePrice ?? 0) - p.purchasePrice - p.expenses),
    0
  );

  const profitableDeals = sold.filter(
    (p) => (p.salePrice ?? 0) - p.purchasePrice - p.expenses > 0
  ).length;
  const unprofitableDeals = sold.filter(
    (p) => (p.salePrice ?? 0) - p.purchasePrice - p.expenses <= 0
  ).length;

  const inStockValue = inStock.reduce((sum, p) => sum + p.purchasePrice + p.expenses, 0);

  return {
    totalPurchases: products.length,
    totalSales: sold.length,
    inStock: inStock.length,
    inStockValue,
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

// --- Excel Export (Güzelce derlenmiş Excel tablosu) ---
export function exportExcel(): void {
  const products = getProducts();
  const summary = calculateSummary(products);

  if (products.length === 0) {
    alert('Dışa aktarılacak ürün kaydı bulunamadı.');
    return;
  }

  const rows = products.map((p, index) => {
    const isSold = p.status === 'Satıldı';
    const profit = isSold && p.salePrice != null
      ? p.salePrice - p.purchasePrice - p.expenses
      : 0;

    return {
      'Sıra No': index + 1,
      'Kategori': p.category,
      'Marka': p.brand,
      'Model': p.model,
      'Hafıza': p.memory || '-',
      'Durum': p.status,
      'Alış Fiyatı (₺)': p.purchasePrice,
      'Satış Fiyatı (₺)': isSold && p.salePrice != null ? p.salePrice : '-',
      'Harcanan Masraf (₺)': p.expenses,
      'Net Kar / Zarar (₺)': isSold ? profit : '-',
      'Alış Tarihi': p.purchaseDate || '-',
      'Satış Tarihi': isSold && p.saleDate ? p.saleDate : '-',
      'Notlar': p.notes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Kolon genişlikleri ayarla
  worksheet['!cols'] = [
    { wch: 8 },  // Sıra No
    { wch: 12 }, // Kategori
    { wch: 16 }, // Marka
    { wch: 24 }, // Model
    { wch: 12 }, // Hafıza
    { wch: 10 }, // Durum
    { wch: 16 }, // Alış Fiyatı
    { wch: 16 }, // Satış Fiyatı
    { wch: 18 }, // Masraf
    { wch: 18 }, // Net Kar
    { wch: 14 }, // Alış Tarihi
    { wch: 14 }, // Satış Tarihi
    { wch: 28 }, // Notlar
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Alış ve Satışlar');

  // Özet Sayfası
  const summaryRows = [
    { 'Gösterge': 'Toplam Kayıtlı Ürün', 'Değer': `${summary.totalPurchases} adet` },
    { 'Gösterge': 'Toplam Yapılan Satış', 'Değer': `${summary.totalSales} adet` },
    { 'Gösterge': 'Stokta Kalan Ürün', 'Değer': `${summary.inStock} adet` },
    { 'Gösterge': 'Stoktaki Ürünlerin Değeri', 'Değer': `${summary.inStockValue.toLocaleString('tr-TR')} ₺` },
    { 'Gösterge': 'Toplam Alış Tutarı', 'Değer': `${summary.totalPurchaseAmount.toLocaleString('tr-TR')} ₺` },
    { 'Gösterge': 'Toplam Satış Hasılatı', 'Değer': `${summary.totalSaleAmount.toLocaleString('tr-TR')} ₺` },
    { 'Gösterge': 'Toplam Masraflar', 'Değer': `${summary.totalExpenses.toLocaleString('tr-TR')} ₺` },
    { 'Gösterge': 'Toplam Net Kar / Zarar', 'Değer': `${summary.netProfit.toLocaleString('tr-TR')} ₺` },
    { 'Gösterge': 'Karlı İşlem Sayısı', 'Değer': `${summary.profitableDeals} adet` },
    { 'Gösterge': 'Zararlı İşlem Sayısı', 'Değer': `${summary.unprofitableDeals} adet` },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 26 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Genel Özet');

  const fileName = `Ticaret_Takip_Raporu_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// --- Utils ---
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
