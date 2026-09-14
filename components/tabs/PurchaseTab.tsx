'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import ProductCard from '@/components/ui/ProductCard';
import ProductForm from '@/components/ui/ProductForm';
import { Category } from '@/lib/types';
import { CATEGORIES, getCategoryIcon } from '@/lib/utils';
import { Plus, Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

type SortOption = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc';

export default function PurchaseTab() {
  const { products } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'Tümü'>('Tümü');
  const [sort, setSort] = useState<SortOption>('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  const purchases = useMemo(() => {
    return products
      .filter((p) => {
        const matchCat = filterCategory === 'Tümü' || p.category === filterCategory;
        const matchSearch = search
          ? `${p.brand} ${p.model}`.toLowerCase().includes(search.toLowerCase())
          : true;
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        if (sort === 'date-desc') return b.purchaseDate.localeCompare(a.purchaseDate);
        if (sort === 'date-asc') return a.purchaseDate.localeCompare(b.purchaseDate);
        if (sort === 'price-desc') return b.purchasePrice - a.purchasePrice;
        return a.purchasePrice - b.purchasePrice;
      });
  }, [products, search, filterCategory, sort]);

  return (
    <div className="px-4 pt-4 pb-28 space-y-4">
      {showForm && <ProductForm onClose={() => setShowForm(false)} defaultType="purchase" />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">🛒 Alışlar</h1>
          <p className="text-white/50 text-xs mt-0.5">{purchases.length} kayıt</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary/20 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/30 transition"
        >
          <Plus size={16} /> Ekle
        </button>
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
            className={`p-1.5 rounded-lg transition ${showFilters ? 'bg-primary/20 text-primary' : 'text-white/40 hover:text-white/70'}`}
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
                      ? 'bg-primary/20 text-primary border border-primary/40'
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
              <option value="price-desc">Fiyat (Yüksek → Düşük)</option>
              <option value="price-asc">Fiyat (Düşük → Yüksek)</option>
            </select>
          </div>
        </div>
      )}

      {/* List */}
      {purchases.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <div className="text-4xl mb-3">🛒</div>
          <p className="text-sm">Alış kaydı bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-2">
          {purchases.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
