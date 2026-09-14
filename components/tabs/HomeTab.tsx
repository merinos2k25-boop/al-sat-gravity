'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import ProductCard from '@/components/ui/ProductCard';
import ProductForm from '@/components/ui/ProductForm';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Package, DollarSign, Plus, Search, X } from 'lucide-react';

export default function HomeTab() {
  const { products, summary } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'purchase' | 'sale'>('purchase');
  const [search, setSearch] = useState('');

  const recentProducts = products
    .filter((p) =>
      search
        ? `${p.brand} ${p.model}`.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .slice(0, 10);

  return (
    <div className="px-4 pt-4 pb-28 space-y-4">
      {showForm && <ProductForm onClose={() => setShowForm(false)} defaultType={formType} />}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">📊 Ticaret Takip</h1>
        <p className="text-white/50 text-xs mt-0.5">Alış ve satışlarını yönet</p>
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

      {/* Quick actions */}
      <div className="flex gap-3">
        <button
          onClick={() => { setFormType('purchase'); setShowForm(true); }}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary/20 border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/30 transition"
        >
          <Plus size={18} />
          Alış Ekle
        </button>
        <button
          onClick={() => { setFormType('sale'); setShowForm(true); }}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 font-semibold text-sm hover:bg-green-500/30 transition"
        >
          <Plus size={18} />
          Satış Ekle
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Ürün ara..."
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

      {/* Recent list */}
      <div>
        <h2 className="text-sm font-semibold text-white/60 mb-2">
          {search ? `Arama Sonuçları (${recentProducts.length})` : 'Son Ürünler'}
        </h2>
        {recentProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {recentProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
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

function EmptyState() {
  return (
    <div className="text-center py-12 text-white/30">
      <div className="text-4xl mb-3">📦</div>
      <p className="text-sm">Henüz ürün eklenmedi</p>
      <p className="text-xs mt-1">Alış veya satış eklemek için yukarıdaki butonları kullan</p>
    </div>
  );
}
