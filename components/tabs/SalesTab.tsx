'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import ProductCard from '@/components/ui/ProductCard';
import ProductForm from '@/components/ui/ProductForm';
import { Category } from '@/lib/types';
import { CATEGORIES, getCategoryIcon } from '@/lib/utils';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import DraggableFab from '@/components/ui/DraggableFab';

type SortOption = 'date-desc' | 'date-asc' | 'profit-desc' | 'profit-asc';

export default function SalesTab() {
  const { products } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'Tümü'>('Tümü');
  const [sort, setSort] = useState<SortOption>('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  const sales = useMemo(() => {
    return products
      .filter((p) => {
        if (p.status !== 'Satıldı') return false;
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
  }, [products, search, filterCategory, sort]);

  return (
    <div className="px-4 pt-4 pb-32 space-y-4 relative min-h-screen">
      {showForm && <ProductForm onClose={() => setShowForm(false)} defaultType="sale" />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">💰 Satışlar</h1>
          <p className="text-white/50 text-xs mt-0.5">{sales.length} satış yapıldı</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Marka veya model ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-20 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-white/30"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={14} className="text-white/40" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-lg transition ${showFilters ? 'bg-green-500/20 text-green-400' : 'text-white/40'}`}
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-3 p-3 bg-white/5 rounded-2xl border border-white/10">
          <div>
            <p className="text-xs text-white/50 mb-2">Kategori</p>
            <div className="flex gap-2 flex-wrap">
              {(['Tümü', ...CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filterCategory === cat
                      ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                      : 'bg-white/5 text-white/50 border border-white/10'
                  }`}
                >
                  {cat === 'Tümü' ? '🔍 Tümü' : `${getCategoryIcon(cat)} ${cat}`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-white/50 mb-2">Sıralama</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none"
            >
              <option value="date-desc">En Yeni</option>
              <option value="date-asc">En Eski</option>
              <option value="profit-desc">Kar (Yüksek → Düşük)</option>
              <option value="profit-asc">Kar (Düşük → Yüksek)</option>
            </select>
          </div>
        </div>
      )}

      {/* List */}
      {sales.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <div className="text-4xl mb-3">💰</div>
          <p className="text-sm">Henüz satış kaydı yok</p>
          <p className="text-xs mt-1">Satış eklemek için sağ alttaki yuvarlak butona dokunun</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sales.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Yerinden Oynatılabilir ve Serbest Bırakınca Eski Yerine Dönen Satış Ekle Butonu */}
      <DraggableFab onClick={() => setShowForm(true)} color="green" ariaLabel="Satış Ekle" />
    </div>
  );
}
