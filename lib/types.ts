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

export type FontFamily = 'default' | 'mono' | 'rounded' | 'serif' | 'modern' | 'compact';
export type ColorTheme =
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'rose'
  | 'amber'
  | 'emerald'
  | 'cyan'
  | 'indigo'
  | 'crimson'
  | 'white';
export type AppTheme = 'dark' | 'light';
export type UiStyle =
  | 'minimal-saas'
  | 'retro-glass'
  | 'cyberpunk'
  | 'paper-editorial'
  | 'industrial-utility'
  | 'technical-blueprint';

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
  image?: string;
}

export interface AppSettings {
  theme: AppTheme;
  colorTheme: ColorTheme;
  uiStyle?: UiStyle;
  fontFamily?: string;
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
  inStockValue: number;
  totalPurchaseAmount: number;
  totalSaleAmount: number;
  totalExpenses: number;
  netProfit: number;
  profitableDeals: number;
  unprofitableDeals: number;
}
