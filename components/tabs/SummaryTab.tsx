'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import { formatCurrency, getCategoryIcon, CATEGORIES } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  DollarSign,
  Wrench,
  BarChart3,
  Coins,
  PieChart,
} from 'lucide-react';

export default function SummaryTab() {
  const { products, summary } = useApp();
  const [activeChartView, setActiveChartView] = useState<'bars' | 'donut'>('bars');

  const categoryBreakdown = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const items = products.filter((p) => p.category === cat);
      const sold = items.filter((p) => p.status === 'Satıldı');
      const inStock = items.filter((p) => p.status === 'Stokta');
      const purchaseCost = items.reduce((sum, p) => sum + p.purchasePrice + (p.expenses || 0), 0);
      const revenue = sold.reduce((sum, p) => sum + (p.salePrice || 0), 0);
      const profit = sold.reduce(
        (sum, p) => sum + (p.salePrice || 0) - p.purchasePrice - (p.expenses || 0),
        0
      );
      const stockVal = inStock.reduce((sum, p) => sum + p.purchasePrice + (p.expenses || 0), 0);
      return {
        cat,
        total: items.length,
        sold: sold.length,
        inStock: inStock.length,
        stockVal,
        profit,
        revenue,
        purchaseCost,
      };
    }).filter((c) => c.total > 0);
  }, [products]);

  const isProfit = summary.netProfit >= 0;

  // Grafik hesaplamaları
  const maxCategoryRevenue = useMemo(() => {
    const max = Math.max(...categoryBreakdown.map((c) => Math.max(c.revenue, c.purchaseCost)), 1);
    return max;
  }, [categoryBreakdown]);

  const totalRevenueAll = useMemo(() => {
    return categoryBreakdown.reduce((sum, c) => sum + c.revenue, 0);
  }, [categoryBreakdown]);

  // Donut grafik renkleri
  const categoryColors: Record<string, { fill: string; stroke: string; label: string }> = {
    Telefon: { fill: '#3b82f6', stroke: '#2563eb', label: 'bg-blue-500' },
    Tablet: { fill: '#8b5cf6', stroke: '#7c3aed', label: 'bg-purple-500' },
    Laptop: { fill: '#f59e0b', stroke: '#d97706', label: 'bg-amber-500' },
    Diğer: { fill: '#10b981', stroke: '#059669', label: 'bg-emerald-500' },
  };

  // Donut dilimleri hesaplama (SVG strokeDasharray)
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12

  let accumulatedPercent = 0;
  const donutSegments = categoryBreakdown.map((item) => {
    const value = totalRevenueAll > 0 ? item.revenue : item.total;
    const total = totalRevenueAll > 0 ? totalRevenueAll : products.length || 1;
    const percent = total > 0 ? value / total : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      cat: item.cat,
      percent: Math.round(percent * 100),
      value,
      strokeDasharray,
      strokeDashoffset,
      color: categoryColors[item.cat] || { fill: '#64748b', stroke: '#475569', label: 'bg-slate-500' },
    };
  });

  return (
    <div className="px-4 pt-6 pb-32 space-y-5">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">📈 Özet</h1>
        <p className="text-white/50 text-xs mt-1">Genel ticari performans, grafikler ve stok analizi</p>
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
          <span className="text-sm font-medium text-white/70">Toplam Net Kâr / Zarar</span>
        </div>
        <p className={`text-3xl sm:text-4xl font-black ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
          {formatCurrency(summary.netProfit)}
        </p>
        <p className="text-xs text-white/50 mt-1.5">
          {summary.profitableDeals} karlı · {summary.unprofitableDeals} zararlı işlem (Yalnızca satılanlar)
        </p>
      </div>

      {/* Stoktaki Ürünlerin Toplam Tutarı Özel Banner */}
      <div className="bg-gradient-to-r from-red-500/15 via-rose-500/10 to-transparent border border-red-500/25 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400">
            <Coins size={22} />
          </div>
          <div>
            <p className="text-xs text-white/60 font-medium">Stoktaki Ürünlerin Toplam Tutarı</p>
            <p className="text-xl font-extrabold text-red-400 mt-0.5">
              {formatCurrency(summary.inStockValue)}
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 font-semibold">
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

      {/* GÖRSEL GRAFİK BÖLÜMÜ */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-4">
        {/* Grafik Başlığı & Görünüm Değiştirici */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            <h2 className="text-base font-bold">Finansal & Kategori Grafikleri</h2>
          </div>

          <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveChartView('bars')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                activeChartView === 'bars'
                  ? 'bg-primary !text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
              style={activeChartView === 'bars' ? { color: 'white' } : undefined}
            >
              <BarChart3 size={13} />
              <span>Çubuk</span>
            </button>
            <button
              onClick={() => setActiveChartView('donut')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                activeChartView === 'donut'
                  ? 'bg-primary !text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
              style={activeChartView === 'donut' ? { color: 'white' } : undefined}
            >
              <PieChart size={13} />
              <span>Halka</span>
            </button>
          </div>
        </div>

        {/* 1. Çubuk Grafik Görünümü (Hasılat vs Maliyet vs Net Kâr) */}
        {activeChartView === 'bars' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span className="font-medium">Kategori Kıyaslaması</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Hasılat
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Maliyet
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Kâr
                </span>
              </div>
            </div>

            {categoryBreakdown.length === 0 ? (
              <p className="text-center py-6 text-xs text-white/40">Grafik için henüz veri bulunmuyor</p>
            ) : (
              <div className="space-y-3.5">
                {categoryBreakdown.map((c) => {
                  const revPercent = Math.max(Math.round((c.revenue / maxCategoryRevenue) * 100), 4);
                  const costPercent = Math.max(Math.round((c.purchaseCost / maxCategoryRevenue) * 100), 4);
                  return (
                    <div key={c.cat} className="space-y-1.5 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold flex items-center gap-1.5">
                          <span>{getCategoryIcon(c.cat)}</span>
                          <span>{c.cat === 'Laptop' ? 'Bilgisayar' : c.cat}</span>
                          <span className="text-[10px] text-white/40 font-normal">({c.total} ürün)</span>
                        </span>
                        <span className={`font-bold ${c.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          Kâr: {formatCurrency(c.profit)}
                        </span>
                      </div>

                      {/* Çubuklar */}
                      <div className="space-y-1 pt-1">
                        {/* Hasılat Çubuğu */}
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="w-12 text-white/40 truncate">Hasılat</span>
                          <div className="flex-1 bg-white/5 h-3 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
                              style={{ width: `${revPercent}%` }}
                            />
                          </div>
                          <span className="w-16 text-right font-semibold text-green-400">
                            {formatCurrency(c.revenue)}
                          </span>
                        </div>

                        {/* Maliyet Çubuğu */}
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="w-12 text-white/40 truncate">Maliyet</span>
                          <div className="flex-1 bg-white/5 h-3 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                              style={{ width: `${costPercent}%` }}
                            />
                          </div>
                          <span className="w-16 text-right font-semibold text-blue-400">
                            {formatCurrency(c.purchaseCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. Donut (Halka) Grafik Görünümü */}
        {activeChartView === 'donut' && (
          <div className="space-y-4 pt-1">
            {products.length === 0 ? (
              <p className="text-center py-6 text-xs text-white/40">Grafik için henüz veri bulunmuyor</p>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                {/* SVG Donut */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    {/* Arka plan halkası */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      className="text-white/5"
                      strokeWidth="18"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    {/* Kategori dilimleri */}
                    {donutSegments.map((seg) => (
                      <circle
                        key={seg.cat}
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke={seg.color.fill}
                        strokeWidth="18"
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    ))}
                  </svg>
                  {/* Merkez Bilgi */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-white/50 font-medium">Toplam Gelir</span>
                    <span className="text-xs font-black text-white mt-0.5">
                      {formatCurrency(totalRevenueAll)}
                    </span>
                  </div>
                </div>

                {/* Donut Açıklama / Legend */}
                <div className="flex-1 w-full space-y-2">
                  {donutSegments.map((seg) => (
                    <div
                      key={seg.cat}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-md ${seg.color.label} shrink-0`} />
                        <span className="font-semibold">
                          {getCategoryIcon(seg.cat)} {seg.cat === 'Laptop' ? 'Bilgisayar' : seg.cat}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 font-medium">
                          {totalRevenueAll > 0 ? formatCurrency(seg.value) : `${seg.value} Adet`}
                        </span>
                        <span className="font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">
                          %{seg.percent}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kategori Bazlı Detay Kartları */}
      {categoryBreakdown.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white/70 flex items-center gap-2 pt-1">
            <BarChart3 size={16} className="text-primary" /> Kategori Bazlı Detaylar
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
                <span>
                  Toplam: <b className="text-white/80">{total}</b>
                </span>
                <span>
                  Satılan: <b className="text-green-400">{sold}</b>
                </span>
                <span>
                  Stokta: <b className="text-purple-400">{inStock}</b>
                </span>
                {stockVal > 0 && (
                  <span>
                    Stok Değeri: <b className="text-purple-300">{formatCurrency(stockVal)}</b>
                  </span>
                )}
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
