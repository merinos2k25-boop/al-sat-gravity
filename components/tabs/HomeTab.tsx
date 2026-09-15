'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import ProductCard from '@/components/ui/ProductCard';
import { Category, Product } from '@/lib/types';
import { formatCurrency, getCategoryIcon, CATEGORIES } from '@/lib/utils';
import { TrendingUp, Package, DollarSign, Search, X, Wallet, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

interface CategoryConfig {
  id: Category;
  label: string;
  icon: string;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  { id: 'Telefon', label: 'Telefon', icon: '📱' },
  { id: 'Tablet', label: 'Tablet', icon: '📟' },
  { id: 'Laptop', label: 'Bilgisayar', icon: '💻' },
  { id: 'Diğer', label: 'Diğer Ürünler', icon: '📦' },
];

export default function HomeTab() {
  const { products, summary } = useApp();
  const [search, setSearch] = useState('');

  // Açık olan kategorilerin state'i (varsayılan olarak ürün olanlar açık, hiç ürün yoksa Telefon açık)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    Telefon: true,
    Tablet: true,
    Laptop: true,
    Diğer: true,
  });

  // Kategori bazlı filtreleme ve satılan ürünlerin gösterimi
  const [statusFilter, setStatusFilter] = useState<'all' | 'inStock' | 'sold'>('all');

  const toggleCategory = (catId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const toggleAllCategories = () => {
    const areAllOpen = CATEGORY_CONFIGS.every((c) => openCategories[c.id]);
    const nextState = !areAllOpen;
    const updated: Record<string, boolean> = {};
    CATEGORY_CONFIGS.forEach((c) => {
      updated[c.id] = nextState;
    });
    setOpenCategories(updated);
  };

  // Kategorilere göre filtrelenmiş ürünler
  const categorizedProducts = useMemo(() => {
    const result: Record<Category, Product[]> = {
      Telefon: [],
      Tablet: [],
      Laptop: [],
      Diğer: [],
    };

    const query = search.trim().toLowerCase();

    products.forEach((p) => {
      const matchSearch = query
        ? `${p.brand} ${p.model} ${p.notes ?? ''}`.toLowerCase().includes(query)
        : true;

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'sold'
          ? p.status === 'Satıldı'
          : p.status === 'Stokta';

      if (matchSearch && matchStatus) {
        if (result[p.category]) {
          result[p.category].push(p);
        } else {
          result['Diğer'].push(p);
        }
      }
    });

    return result;
  }, [products, search, statusFilter]);

  const allOpen = CATEGORY_CONFIGS.every((c) => openCategories[c.id]);

  return (
    <div className="px-4 pt-4 pb-32 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary-hsl)), hsl(var(--primary-hsl) / 0.6))' }}
        >
          <Wallet size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Ticaret Takip</h1>
          <p className="text-white/50 text-xs">Alış ve satışlarını yönet</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={<Package size={16} />}
          label="Stokta"
          value={String(summary.inStock)}
          color="blue"
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Satılan"
          value={String(summary.totalSales)}
          color="green"
        />
        <StatCard
          icon={<DollarSign size={16} />}
          label="Net Kar"
          value={formatCurrency(summary.netProfit)}
          color={summary.netProfit >= 0 ? 'green' : 'red'}
          small
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Marka, model veya not ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-white/30"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={14} className="text-white/40" />
          </button>
        )}
      </div>

      {/* Filter Options & Toggle All */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
              statusFilter === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setStatusFilter('inStock')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
              statusFilter === 'inStock'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            Stokta
          </button>
          <button
            onClick={() => setStatusFilter('sold')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
              statusFilter === 'sold'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            Satılanlar
          </button>
        </div>

        <button
          onClick={toggleAllCategories}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 transition"
        >
          <ChevronsUpDown size={12} />
          {allOpen ? 'Tümünü Kapat' : 'Tümünü Aç'}
        </button>
      </div>

      {/* Accordion Categories */}
      <div className="space-y-3">
        {CATEGORY_CONFIGS.map((cat) => {
          const catProducts = categorizedProducts[cat.id] || [];
          const isOpen = Boolean(openCategories[cat.id]);

          // İlgili kategorideki toplam stok ve satılan sayısı
          const inStockCount = catProducts.filter((p) => p.status === 'Stokta').length;
          const soldCount = catProducts.filter((p) => p.status === 'Satıldı').length;

          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all shadow-sm"
            >
              {/* Açılır / Kapanır Kategori Başlığı */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl shrink-0">{cat.icon}</span>
                  <div>
                    <h2 className="font-semibold text-sm leading-tight">{cat.label}</h2>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      {catProducts.length === 0 ? (
                        'Ürün yok'
                      ) : (
                        <>
                          <span className="text-blue-400 font-medium">{inStockCount} Stokta</span>
                          {' · '}
                          <span className="text-green-400 font-medium">{soldCount} Satıldı</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-medium">
                    {catProducts.length}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-white/40" />
                  ) : (
                    <ChevronDown size={16} className="text-white/40" />
                  )}
                </div>
              </button>

              {/* Açılır Kategori İçeriği */}
              {isOpen && (
                <div className="px-3 pb-3 pt-1 border-t border-white/10 space-y-2">
                  {catProducts.length === 0 ? (
                    <div className="py-4 text-center text-white/40 text-xs">
                      Bu kategoride kayıtlı ürün bulunamadı.
                    </div>
                  ) : (
                    catProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'red';
  small?: boolean;
}) {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-400/10',
    green: 'text-green-400 bg-green-400/10',
    red: 'text-red-400 bg-red-400/10',
  };
  return (
    <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
      <div className={`inline-flex p-1.5 rounded-lg ${colorMap[color]} mb-2`}>{icon}</div>
      <p className={`font-bold ${small ? 'text-sm' : 'text-lg'} leading-tight`}>{value}</p>
      <p className="text-white/40 text-[10px] mt-0.5">{label}</p>
    </div>
  );
}
