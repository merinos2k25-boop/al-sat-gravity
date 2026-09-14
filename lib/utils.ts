import { MemoryOption, Category } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateProfit(
  purchasePrice: number,
  salePrice: number,
  expenses: number
): number {
  return salePrice - purchasePrice - expenses;
}

export const MEMORY_OPTIONS: MemoryOption[] = [
  '8 GB',
  '16 GB',
  '32 GB',
  '64 GB',
  '128 GB',
  '256 GB',
  '512 GB',
  '1 TB',
];

export const CATEGORIES: Category[] = ['Telefon', 'Tablet', 'Laptop', 'Diğer'];

export const POPULAR_BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Huawei',
  'Oppo',
  'OnePlus',
  'Realme',
  'Nokia',
  'Motorola',
  'Sony',
  'Lenovo',
  'Asus',
  'Dell',
  'HP',
  'Acer',
  'MSI',
  'Casper',
  'Monster',
  'Diğer',
];

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Telefon: '📱',
    Tablet: '📟',
    Laptop: '💻',
    Diğer: '📦',
  };
  return icons[category] ?? '📦';
}

export function showMemoryField(category: string): boolean {
  return ['Telefon', 'Tablet', 'Laptop'].includes(category);
}
