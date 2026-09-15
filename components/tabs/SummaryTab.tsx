'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import { formatCurrency, getCategoryIcon, CATEGORIES } from '@/lib/utils';
import { TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, Wrench, BarChart3 } from 'lucide-react';

export default function SummaryTab() {
  const { products, summary } = useApp();

  const categoryBreakdown = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const items = products.filter((p) => p.category === cat);
      const sold = items.filter((p) => p.status === 'Satıldı');
      const profit = sold.reduce(
        (sum, p) => sum + (p.salePrice ?? 0) - p.purchasePrice - p.expenses,
        0
      );
      return { cat, total: items.length, sold: sold.length, profit };
    }).filter((c) => c.total > 0);
  }, [products]);

  const isProfit = summary.netProfit >= 0;

  return (
    <div className="px-4 pt-4 pb-32 space-y-4">
      <div>
        <h1 className="text-xl font-bold">📈 Özet</h1>
        <p className="text-white/50 text-xs mt-0.5">Genel performans görünümü</p>
      </div>

      {/* Net Profit Banner */}
      <div className={`rounded-2xl p-5 border ${
        isProfit
          ? 'bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30'
          : 'bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/30'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          {isProfit ? <TrendingUp size={18} className="text-green-400" /> : <TrendingDown size={18} className="text-red-400" />}
          <span className="text-sm text-white/60">Toplam Net Kar / Zarar</span>
        </div>
        <p className={`text-3xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
          {formatCurrency(summary.netProfit)}
        </p>
        <p className="text-xs text-white/40 mt-1">
          {summary.profitableDeals} karlı · {summary.unprofitableDeals} zararlı işlem
        </p>
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
          label="Toplam Satış"
          value={`${summary.totalSales} ürün`}
          sub={formatCurrency(summary.totalSaleAmount)}
          color="green"
        />
        <SummaryCard
          icon={<Package size={16} />}
          label="Stokta"
          value={`${summary.inStock} ürün`}
          sub="Henüz satılmadı"
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
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-white/60 flex items-center gap-2">
            <BarChart3 size={14} /> Kategoriye Göre
          </h2>
          {categoryBreakdown.map(({ cat, total, sold, profit }) => (
            <div key={cat} className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(cat)}</span>
                  <span className="font-semibold text-sm">{cat}</span>
                </div>
                <span className={`text-sm font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(profit)}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-white/50">
                <span>Toplam: <b className="text-white/80">{total}</b></span>
                <span>Satılan: <b className="text-white/80">{sold}</b></span>
                <span>Stok: <b className="text-white/80">{total - sold}</b></span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all"
                  style={{ width: total > 0 ? `${(sold / total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-12 text-white/30">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm">Henüz veri yok</p>
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
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-400/10',
    green: 'text-green-400 bg-green-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
    orange: 'text-orange-400 bg-orange-400/10',
  };
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
      <div className={`inline-flex p-2 rounded-xl mb-3 ${colorMap[color]}`}>{icon}</div>
      <p className="text-white/50 text-xs">{label}</p>
      <p className="font-bold text-base mt-0.5">{value}</p>
      <p className="text-white/40 text-[10px] mt-0.5">{sub}</p>
    </div>
  );
}
