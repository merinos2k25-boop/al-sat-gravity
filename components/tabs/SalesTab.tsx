'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import ProductCard from '@/components/ui/ProductCard';
import ProductForm from '@/components/ui/ProductForm';
import { Category } from '@/lib/types';
import { CATEGORIES, getCategoryIcon, formatCurrency } from '@/lib/utils';
import { Search, X, SlidersHorizontal, TrendingUp, DollarSign } from 'lucide-react';
import DraggableFab from '@/components/ui/DraggableFab';

type SortOption = 'date-desc' | 'date-asc' | 'profit-desc' | 'profit-asc';

export default function SalesTab() {
  const { products } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'Tümü'>('Tümü');
  const [sort, setSort] = useState<SortOption>('date-desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Satılan ürünler listesi
  const allSoldProducts = useMemo(
    () => products.filter((p) => p.status === 'Satıldı'),
    [products]
  );

  // İstatistiksel veriler (Yalnızca satılanlar, stok dahil değil)
  const totalSalesCount = allSoldProducts.length;
  const totalSalesRevenue = useMemo(
    () => allSoldProducts.reduce((sum, p) => sum + (p.salePrice || 0), 0),
    [allSoldProducts]
  );
  const totalSalesProfit = useMemo(
    () =>
      allSoldProducts.reduce(
        (sum, p) => sum + (p.salePrice || 0) - p.purchasePrice - (p.expenses || 0),
        0
      ),
    [allSoldProducts]
  );

  // Kategori sayıları (Yalnızca satılan ürünler bazında)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Tümü: allSoldProducts.length };
    CATEGORIES.forEach((cat) => {
      counts[cat] = allSoldProducts.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [allSoldProducts]);

  // Filtrelenmiş ve sıralanmış satışlar
  const sales = useMemo(() => {
    return allSoldProducts
      .filter((p) => {
        const matchCat = filterCategory === 'Tümü' || p.category === filterCategory;
        const matchSearch = search
          ? `${p.brand} ${p.model}`.toLowerCase().includes(search.toLowerCase())
          : true;
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        const profitA = (a.salePrice ?? 0) - a.purchasePrice - a.expenses;
        const profitB = (b.salePrice ?? 0) - b.purchasePrice - b.expenses;
        if (sort === 'date-desc') return (b.saleDate ?? '').localeCompare(a.saleDate ?? '');
        if (sort === 'date-asc') return (a.saleDate ?? '').localeCompare(b.saleDate ?? '');
        if (sort === 'profit-desc') return profitB - profitA;
        return profitA - profitB;
      });
  }, [allSoldProducts, search, filterCategory, sort]);

  const isProfit = totalSalesProfit >= 0;

  return (
    <div className="px-4 pt-6 pb-32 space-y-4 relative min-h-screen">
      {showForm && <ProductForm onClose={() => setShowForm(false)} defaultType="sale" />}

      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">💰 Satışlar</h1>
        <p className="text-white/50 text-xs mt-1">{sales.length} satış listeleniyor</p>
      </div>

      {/* İstatistiksel Veri Tablosu / Kartları (Stok dahil edilmeden, yalnızca satış verileri) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Toplam Satılan Ürün Sayısı ve Toplam Hasılat */}
        <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="p-2 rounded-xl bg-green-500/20 text-green-400">
              <DollarSign size={17} />
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-green-500/15 text-green-400">
              {totalSalesCount} Satış
            </span>
          </div>
          <div>
            <p className="text-white/50 text-xs font-medium">Toplam Satış Hasılatı</p>
            <p className="text-lg sm:text-xl font-extrabold text-green-400 mt-0.5 truncate">
              {formatCurrency(totalSalesRevenue)}
            </p>
          </div>
        </div>

        {/* Toplam Elde Edilen Net Kâr / Zarar */}
        <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div
              className={`p-2 rounded-xl ${
                isProfit ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}
            >
              <TrendingUp size={17} />
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${
                isProfit
                  ? 'bg-green-500/15 text-green-400'
                  : 'bg-red-500/15 text-red-400'
              }`}
            >
              {isProfit ? 'Net Kâr' : 'Net Zarar'}
            </span>
          </div>
          <div>
            <p className="text-white/50 text-xs font-medium">Toplam Net Kâr</p>
            <p
              className={`text-lg sm:text-xl font-extrabold mt-0.5 truncate ${
                isProfit ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {formatCurrency(totalSalesProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Sınıfına (Kategorisine) Göre Filtrele */}
      <div>
        <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">
          Kategoriye Göre Filtrele
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {(['Tümü', ...CATEGORIES] as const).map((cat) => {
            const count = categoryCounts[cat] || 0;
            const active = filterCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 border ${
                  active
                    ? 'bg-green-500 !text-white border-green-500 shadow-sm'
                    : 'bg-white/5 text-white/60 hover:text-white/90 border-white/10'
                }`}
                style={active ? { color: 'white' } : undefined}
              >
                <span>{cat === 'Tümü' ? '🔍 Tümü' : `${getCategoryIcon(cat)} ${cat === 'Laptop' ? 'Bilgisayar' : cat}`}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    active ? 'bg-white/25 text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Marka veya model ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 placeholder:text-white/30"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowSortMenu(!showSortMenu)}
          className={`px-3 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition ${
            showSortMenu
              ? 'bg-green-500/20 text-green-400 border-green-500/40'
              : 'bg-white/5 text-white/60 border-white/10'
          }`}
          title="Sıralama"
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Sırala</span>
        </button>
      </div>

      {/* Sort Dropdown */}
      {showSortMenu && (
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-xs text-white/50 mb-1.5 font-medium">Sıralama Ölçütü</p>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setShowSortMenu(false);
            }}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none"
          >
            <option value="date-desc">En Yeni Satış</option>
            <option value="date-asc">En Eski Satış</option>
            <option value="profit-desc">Kâr (Yüksek → Düşük)</option>
            <option value="profit-asc">Kâr (Düşük → Yüksek)</option>
          </select>
        </div>
      )}

      {/* List */}
      {sales.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <div className="text-4xl mb-3">💰</div>
          <p className="text-sm">Satış kaydı bulunamadı</p>
          <p className="text-xs mt-1">
            {filterCategory !== 'Tümü'
              ? 'Seçili kategoride satış yok'
              : 'Satış eklemek için sağ alttaki yuvarlak butona dokunun'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sales.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Yerinden Oynatılabilir Satış Ekle Butonu */}
      <DraggableFab onClick={() => setShowForm(true)} color="green" ariaLabel="Satış Ekle" />
    </div>
  );
}
