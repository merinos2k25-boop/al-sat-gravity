'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import { formatCurrency, getCategoryIcon, CATEGORIES } from '@/lib/utils';
import { TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, Wrench, BarChart3, Coins } from 'lucide-react';

export default function SummaryTab() {
  const { products, summary } = useApp();

  const categoryBreakdown = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const items = products.filter((p) => p.category === cat);
      const sold = items.filter((p) => p.status === 'Satıldı');
      const inStock = items.filter((p) => p.status === 'Stokta');
      const profit = sold.reduce(
        (sum, p) => sum + (p.salePrice ?? 0) - p.purchasePrice - p.expenses,
        0
      );
      const stockVal = inStock.reduce((sum, p) => sum + p.purchasePrice + p.expenses, 0);
      return { cat, total: items.length, sold: sold.length, inStock: inStock.length, stockVal, profit };
    }).filter((c) => c.total > 0);
  }, [products]);

  const isProfit = summary.netProfit >= 0;

  return (
    <div className="px-4 pt-6 pb-32 space-y-5">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">📈 Özet</h1>
        <p className="text-white/50 text-xs mt-1">Genel ticari performans ve stok analizi</p>
      </div>

      {/* Net Profit Banner */}
      <div
        className={`rounded-2xl p-5 border shadow-sm ${
          isProfit
            ? 'bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30'
            : 'bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/30'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          {isProfit ? (
            <TrendingUp size={18} className="text-green-400" />
          ) : (
            <TrendingDown size={18} className="text-red-400" />
          )}
          <span className="text-sm font-medium text-white/70">Toplam Net Kar / Zarar</span>
        </div>
        <p className={`text-3xl sm:text-4xl font-black ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
          {formatCurrency(summary.netProfit)}
        </p>
        <p className="text-xs text-white/50 mt-1.5">
          {summary.profitableDeals} karlı · {summary.unprofitableDeals} zararlı işlem (Yalnızca satılanlar)
        </p>
      </div>

      {/* Stoktaki Ürünlerin Toplam Tutarı Özel Banner */}
      <div className="bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-transparent border border-purple-500/25 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
            <Coins size={22} />
          </div>
          <div>
            <p className="text-xs text-white/60 font-medium">Stoktaki Ürünlerin Toplam Tutarı</p>
            <p className="text-xl font-extrabold text-purple-300 mt-0.5">
              {formatCurrency(summary.inStockValue)}
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-semibold">
          {summary.inStock} Ürün
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          icon={<ShoppingCart size={16} />}
          label="Toplam Alış"
          value={`${summary.totalPurchases} ürün`}
          sub={formatCurrency(summary.totalPurchaseAmount)}
          color="blue"
        />
        <SummaryCard
          icon={<TrendingUp size={16} />}
          label="Toplam Satış Hasılatı"
          value={`${summary.totalSales} ürün`}
          sub={formatCurrency(summary.totalSaleAmount)}
          color="green"
        />
        <SummaryCard
          icon={<Package size={16} />}
          label="Stokta Bekleyen"
          value={`${summary.inStock} ürün`}
          sub={`Değer: ${formatCurrency(summary.inStockValue)}`}
          color="purple"
        />
        <SummaryCard
          icon={<Wrench size={16} />}
          label="Toplam Masraf"
          value={formatCurrency(summary.totalExpenses)}
          sub="Onarım, kargo vb."
          color="orange"
        />
      </div>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white/70 flex items-center gap-2 pt-1">
            <BarChart3 size={16} className="text-primary" /> Kategori Bazlı Performans
          </h2>
          {categoryBreakdown.map(({ cat, total, sold, inStock, stockVal, profit }) => (
            <div key={cat} className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{getCategoryIcon(cat)}</span>
                  <span className="font-bold text-sm">{cat === 'Laptop' ? 'Bilgisayar' : cat}</span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    profit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(profit)}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50 pt-1 border-t border-white/5">
                <span>Toplam: <b className="text-white/80">{total}</b></span>
                <span>Satılan: <b className="text-green-400">{sold}</b></span>
                <span>Stokta: <b className="text-purple-400">{inStock}</b></span>
                {stockVal > 0 && <span>Stok Değeri: <b className="text-purple-300">{formatCurrency(stockVal)}</b></span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  };

  return (
    <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between">
      <div>
        <div className={`inline-flex p-2 rounded-xl border ${colorMap[color]} mb-2`}>{icon}</div>
        <p className="text-white/50 text-[11px]">{label}</p>
        <p className="text-lg font-bold mt-0.5 leading-tight">{value}</p>
      </div>
      <p className="text-[11px] text-white/40 mt-2 truncate font-medium">{sub}</p>
    </div>
  );
}
