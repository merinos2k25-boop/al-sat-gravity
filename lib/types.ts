export type Category = 'Telefon' | 'Tablet' | 'Laptop' | 'Diğer';
export type Status = 'Stokta' | 'Satıldı';
export type MemoryOption =
  | '8 GB'
  | '16 GB'
  | '32 GB'
  | '64 GB'
  | '128 GB'
  | '256 GB'
  | '512 GB'
  | '1 TB';

export type FontFamily = 'default' | 'mono' | 'rounded';
export type ColorTheme = 'blue' | 'green' | 'purple' | 'orange' | 'rose';
export type AppTheme = 'dark' | 'light';

export interface Product {
  id: string;
  category: Category;
  brand: string;
  model: string;
  memory?: MemoryOption;
  purchasePrice: number;
  salePrice?: number;
  expenses: number;
  status: Status;
  purchaseDate: string;
  saleDate?: string;
  notes?: string;
}

export interface AppSettings {
  theme: AppTheme;
  colorTheme: ColorTheme;
  fontFamily: FontFamily;
}

export interface AppData {
  products: Product[];
  settings: AppSettings;
  version: string;
  exportedAt: string;
}

export interface Summary {
  totalPurchases: number;
  totalSales: number;
  inStock: number;
  totalPurchaseAmount: number;
  totalSaleAmount: number;
  totalExpenses: number;
  netProfit: number;
  profitableDeals: number;
  unprofitableDeals: number;
}
