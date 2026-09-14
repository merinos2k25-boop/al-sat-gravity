'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { formatCurrency, formatDate, calculateProfit, getCategoryIcon } from '@/lib/utils';
import { useApp } from '@/components/providers/AppProvider';
import { ChevronDown, ChevronUp, Pencil, Trash2, TrendingUp, TrendingDown, Package } from 'lucide-react';
import ProductForm from './ProductForm';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { deleteProduct } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const profit =
    product.status === 'Satıldı' && product.salePrice != null
      ? calculateProfit(product.purchasePrice, product.salePrice, product.expenses)
      : null;

  const profitPositive = profit !== null && profit > 0;
  const profitNegative = profit !== null && profit < 0;

  return (
    <>
      {editing && <ProductForm onClose={() => setEditing(false)} editProduct={product} />}

      <div className={`rounded-2xl border overflow-hidden transition-all ${
        product.status === 'Satıldı'
          ? 'border-green-500/20 bg-green-500/5'
          : 'border-white/10 bg-white/5'
      }`}>
        {/* Main row */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left px-4 py-3.5 flex items-center gap-3"
        >
          {/* Icon */}
          <span className="text-2xl shrink-0">{getCategoryIcon(product.category)}</span>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm truncate">
                {product.brand} {product.model}
              </span>
              {product.memory && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/60">
                  {product.memory}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-white/50">Alış: {formatCurrency(product.purchasePrice)}</span>
              {product.status === 'Satıldı' && product.salePrice != null && (
                <span className="text-xs text-white/50">Satış: {formatCurrency(product.salePrice)}</span>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {profit !== null ? (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                profitPositive ? 'bg-green-500/15 text-green-400' : profitNegative ? 'bg-red-500/15 text-red-400' : 'bg-white/10 text-white/60'
              }`}>
                {profitPositive ? <TrendingUp size={11} /> : profitNegative ? <TrendingDown size={11} /> : null}
                {formatCurrency(profit)}
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-blue-500/10 text-blue-400">
                <Package size={11} />
                Stokta
              </div>
            )}
            {expanded ? <ChevronUp size={15} className="text-white/40" /> : <ChevronDown size={15} className="text-white/40" />}
          </div>
        </button>

        {/* Expanded details */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-white/10 pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5">
                <p className="text-white/40">Kategori</p>
                <p className="font-medium mt-0.5">{product.category}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5">
                <p className="text-white/40">Durum</p>
                <p className={`font-medium mt-0.5 ${product.status === 'Satıldı' ? 'text-green-400' : 'text-blue-400'}`}>
                  {product.status}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5">
                <p className="text-white/40">Alış Fiyatı</p>
                <p className="font-medium mt-0.5">{formatCurrency(product.purchasePrice)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5">
                <p className="text-white/40">Masraf</p>
                <p className="font-medium mt-0.5">{formatCurrency(product.expenses)}</p>
              </div>
              {product.salePrice != null && (
                <div className="bg-white/5 rounded-xl p-2.5">
                  <p className="text-white/40">Satış Fiyatı</p>
                  <p className="font-medium mt-0.5">{formatCurrency(product.salePrice)}</p>
                </div>
              )}
              {profit !== null && (
                <div className={`rounded-xl p-2.5 ${profitPositive ? 'bg-green-500/10' : profitNegative ? 'bg-red-500/10' : 'bg-white/5'}`}>
                  <p className="text-white/40">Kar / Zarar</p>
                  <p className={`font-semibold mt-0.5 ${profitPositive ? 'text-green-400' : profitNegative ? 'text-red-400' : ''}`}>
                    {formatCurrency(profit)}
                  </p>
                </div>
              )}
              <div className="bg-white/5 rounded-xl p-2.5">
                <p className="text-white/40">Alış Tarihi</p>
                <p className="font-medium mt-0.5">{formatDate(product.purchaseDate)}</p>
              </div>
              {product.saleDate && (
                <div className="bg-white/5 rounded-xl p-2.5">
                  <p className="text-white/40">Satış Tarihi</p>
                  <p className="font-medium mt-0.5">{formatDate(product.saleDate)}</p>
                </div>
              )}
            </div>

            {product.notes && (
              <div className="bg-white/5 rounded-xl p-2.5 text-xs">
                <p className="text-white/40">Notlar</p>
                <p className="mt-0.5">{product.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition"
              >
                <Pencil size={12} /> Düzenle
              </button>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition"
                >
                  <Trash2 size={12} /> Sil
                </button>
              ) : (
                <div className="flex-1 flex gap-1.5">
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-semibold"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs"
                  >
                    İptal
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
