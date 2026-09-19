'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import ProductCard from '@/components/ui/ProductCard';
import ProductForm from '@/components/ui/ProductForm';
import { Category } from '@/lib/types';
import { CATEGORIES, getCategoryIcon, formatCurrency } from '@/lib/utils';
import { Search, X, SlidersHorizontal, ShoppingCart, Package, Filter } from 'lucide-react';
import DraggableFab from '@/components/ui/DraggableFab';

type SortOption = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc';

export default function PurchaseTab() {
  const { products } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'Tümü'>('Tümü');
  const [sort, setSort] = useState<SortOption>('date-desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // İstatistiksel veriler
  const totalPurchasesCount = products.length;
  const totalPurchaseAmount = useMemo(
    () => products.reduce((sum, p) => sum + p.purchasePrice + (p.expenses || 0), 0),
    [products]
  );

  const inStockItems = useMemo(
    () => products.filter((p) => p.status === 'Stokta'),
    [products]
  );
  const inStockCount = inStockItems.length;
  const inStockAmount = useMemo(
    () => inStockItems.reduce((sum, p) => sum + p.purchasePrice + (p.expenses || 0), 0),
    [inStockItems]
  );

  // Kategori sayıları (Filtre rozetleri için)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Tümü: products.length };
    CATEGORIES.forEach((cat) => {
      counts[cat] = products.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [products]);

  // Filtrelenmiş ve sıralanmış liste
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
    <div className="px-4 pt-6 pb-32 space-y-4 relative min-h-screen">
      {showForm && <ProductForm onClose={() => setShowForm(false)} defaultType="purchase" />}

      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">🛒 Alışlar</h1>
        <p className="text-white/50 text-xs mt-1">{purchases.length} ürün listeleniyor</p>
      </div>

      {/* İstatistiksel Veri Tablosu / Kartları */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Toplam Alınan Ürün */}
        <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <ShoppingCart size={17} />
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-500/15 text-blue-400">
              {totalPurchasesCount} Ürün
            </span>
          </div>
          <div>
            <p className="text-white/50 text-xs font-medium">Toplam Alınan Tutar</p>
            <p className="text-lg sm:text-xl font-extrabold text-blue-400 mt-0.5 truncate">
              {formatCurrency(totalPurchaseAmount)}
            </p>
          </div>
        </div>

        {/* Stokta Bekleyen Ürün Sayısı ve Tutarı */}
        <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Package size={17} />
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400">
              {inStockCount} Stokta
            </span>
          </div>
          <div>
            <p className="text-white/50 text-xs font-medium">Stoktaki Bekleyen Tutar</p>
            <p className="text-lg sm:text-xl font-extrabold text-amber-400 mt-0.5 truncate">
              {formatCurrency(inStockAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Sınıfına (Kategorisine) Göre Filtrele — Kaydırma gerektirmeyen sabit tasarım */}
      <div
        className="bg-white/5 p-2 rounded-2xl border border-white/10 space-y-1.5"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-white/50">
          <span className="flex items-center gap-1">
            <Filter size={12} className="text-primary" />
            <span>Kategori Filtresi</span>
          </span>
          {filterCategory !== 'Tümü' && (
            <button
              onClick={() => setFilterCategory('Tümü')}
              className="text-primary hover:underline text-[10px]"
            >
              Filtreyi Temizle
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {(['Tümü', 'Telefon', 'Tablet'] as const).map((cat) => {
            const count = categoryCounts[cat] || 0;
            const active = filterCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`py-2 px-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 border truncate ${
                  active
                    ? 'bg-primary !text-white border-primary shadow-sm'
                    : 'bg-white/5 text-white/70 hover:text-white border-white/10'
                }`}
                style={active ? { color: 'white' } : undefined}
              >
                <span className="truncate">{cat === 'Tümü' ? '🔍 Tümü' : `${getCategoryIcon(cat)} ${cat}`}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                    active ? 'bg-white/25 text-white' : 'bg-white/10 text-white/50'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {(['Laptop', 'Diğer'] as const).map((cat) => {
            const count = categoryCounts[cat] || 0;
            const active = filterCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`py-2 px-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 border truncate ${
                  active
                    ? 'bg-primary !text-white border-primary shadow-sm'
                    : 'bg-white/5 text-white/70 hover:text-white border-white/10'
                }`}
                style={active ? { color: 'white' } : undefined}
              >
                <span className="truncate">{getCategoryIcon(cat)} {cat === 'Laptop' ? 'Bilgisayar' : cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                    active ? 'bg-white/25 text-white' : 'bg-white/10 text-white/50'
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
            className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-white/30"
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
            showSortMenu ? 'bg-primary/20 text-primary border-primary/40' : 'bg-white/5 text-white/60 border-white/10'
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
            <option value="date-desc">En Yeni Alış</option>
            <option value="date-asc">En Eski Alış</option>
            <option value="price-desc">Alış Fiyatı (Yüksek → Düşük)</option>
            <option value="price-asc">Alış Fiyatı (Düşük → Yüksek)</option>
          </select>
        </div>
      )}

      {/* List */}
      {purchases.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <div className="text-4xl mb-3">🛒</div>
          <p className="text-sm">Alış kaydı bulunamadı</p>
          <p className="text-xs mt-1">
            {filterCategory !== 'Tümü'
              ? 'Seçili kategoride ürün yok'
              : 'Alış eklemek için sağ alttaki yuvarlak butona dokunun'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {purchases.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Yerinden Oynatılabilir Alış Ekle Butonu */}
      <DraggableFab onClick={() => setShowForm(true)} color="primary" ariaLabel="Alış Ekle" />
    </div>
  );
}
