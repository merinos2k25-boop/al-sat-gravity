'use client';

import React, { useState } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import { Product } from '@/lib/types';
import {
  CATEGORIES,
  MEMORY_OPTIONS,
  POPULAR_BRANDS,
  getTodayISO,
  showMemoryField,
} from '@/lib/utils';
import { generateId } from '@/lib/store';
import { X, Save, ShoppingCart, TrendingUp } from 'lucide-react';

interface ProductFormProps {
  onClose: () => void;
  editProduct?: Product | null;
  defaultType?: 'purchase' | 'sale';
}

export default function ProductForm({ onClose, editProduct, defaultType = 'purchase' }: ProductFormProps) {
  const { addProduct, updateProduct } = useApp();

  const [form, setForm] = useState<Partial<Product>>({
    id: editProduct?.id ?? generateId(),
    category: editProduct?.category ?? 'Telefon',
    brand: editProduct?.brand ?? '',
    model: editProduct?.model ?? '',
    memory: editProduct?.memory ?? '128 GB',
    purchasePrice: editProduct?.purchasePrice ?? 0,
    salePrice: editProduct?.salePrice,
    expenses: editProduct?.expenses ?? 0,
    status: editProduct?.status ?? (defaultType === 'sale' ? 'Satıldı' : 'Stokta'),
    purchaseDate: editProduct?.purchaseDate ?? getTodayISO(),
    saleDate: editProduct?.saleDate ?? (defaultType === 'sale' ? getTodayISO() : undefined),
    notes: editProduct?.notes ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customBrand, setCustomBrand] = useState(
    editProduct?.brand && !POPULAR_BRANDS.includes(editProduct.brand) ? editProduct.brand : ''
  );
  const [isCustomBrand, setIsCustomBrand] = useState(
    editProduct?.brand ? !POPULAR_BRANDS.includes(editProduct.brand) : false
  );

  const set = (key: keyof Product, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.brand?.trim()) e.brand = 'Marka gerekli';
    if (!form.model?.trim()) e.model = 'Model gerekli';
    if (!form.purchasePrice || form.purchasePrice <= 0) e.purchasePrice = 'Alış fiyatı gerekli';
    if (form.status === 'Satıldı' && (!form.salePrice || form.salePrice <= 0))
      e.salePrice = 'Satış fiyatı gerekli';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const product = form as Product;
    if (editProduct) {
      updateProduct(editProduct.id, product);
    } else {
      addProduct(product);
    }
    onClose();
  };

  const inputCls =
    'w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 placeholder:text-white/40 text-foreground';
  const labelCls = 'block text-xs font-medium text-white/60 mb-1';
  const errCls = 'text-red-400 text-xs mt-1';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-[#1e2235] dark:bg-[#1e2235] light:bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            {form.status === 'Satıldı' ? (
              <TrendingUp size={18} className="text-green-400" />
            ) : (
              <ShoppingCart size={18} className="text-primary" />
            )}
            <h2 className="font-semibold text-base">
              {editProduct ? 'Düzenle' : form.status === 'Satıldı' ? 'Satış Ekle' : 'Alış Ekle'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Durum */}
          <div>
            <label className={labelCls}>Durum</label>
            <div className="flex gap-2">
              {(['Stokta', 'Satıldı'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    set('status', s);
                    if (s === 'Satıldı' && !form.saleDate) set('saleDate', getTodayISO());
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                    form.status === s
                      ? s === 'Satıldı'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                        : 'bg-primary/20 text-primary border border-primary/40'
                      : 'bg-white/5 text-white/50 border border-white/10'
                  }`}
                >
                  {s === 'Stokta' ? '📦 Stokta' : '✅ Satıldı'}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className={labelCls}>Kategori</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  className={`py-2 rounded-xl text-xs font-medium transition ${
                    form.category === cat
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'bg-white/5 text-white/50 border border-white/10'
                  }`}
                >
                  {cat === 'Telefon' ? '📱' : cat === 'Tablet' ? '📟' : cat === 'Laptop' ? '💻' : '📦'}
                  <br />
                  <span className="text-[10px]">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Marka */}
          <div>
            <label className={labelCls}>Marka</label>
            {!isCustomBrand ? (
              <select
                value={form.brand ?? ''}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomBrand(true);
                    set('brand', '');
                  } else {
                    set('brand', e.target.value);
                  }
                }}
                className={inputCls}
              >
                <option value="">Seçin...</option>
                {POPULAR_BRANDS.map((b) => (
                  <option key={b} value={b === 'Diğer' ? '__custom__' : b}>
                    {b}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Marka adı..."
                  value={customBrand}
                  onChange={(e) => {
                    setCustomBrand(e.target.value);
                    set('brand', e.target.value);
                  }}
                  className={inputCls}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => { setIsCustomBrand(false); set('brand', ''); }}
                  className="px-3 rounded-xl bg-white/10 text-xs"
                >
                  Listeden
                </button>
              </div>
            )}
            {errors.brand && <p className={errCls}>{errors.brand}</p>}
          </div>

          {/* Model */}
          <div>
            <label className={labelCls}>Model</label>
            <input
              type="text"
              placeholder="ör. iPhone 15 Pro Max"
              value={form.model ?? ''}
              onChange={(e) => set('model', e.target.value)}
              className={inputCls}
            />
            {errors.model && <p className={errCls}>{errors.model}</p>}
          </div>

          {/* Hafıza */}
          {showMemoryField(form.category ?? 'Telefon') && (
            <div>
              <label className={labelCls}>Hafıza</label>
              <select
                value={form.memory ?? '128 GB'}
                onChange={(e) => set('memory', e.target.value)}
                className={inputCls}
              >
                {MEMORY_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Fiyatlar */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Alış Fiyatı (₺)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.purchasePrice || ''}
                onChange={(e) => set('purchasePrice', Number(e.target.value))}
                className={inputCls}
              />
              {errors.purchasePrice && <p className={errCls}>{errors.purchasePrice}</p>}
            </div>
            <div>
              <label className={labelCls}>Masraf (₺)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.expenses || ''}
                onChange={(e) => set('expenses', Number(e.target.value))}
                className={inputCls}
              />
            </div>
          </div>

          {/* Satış fiyatı */}
          {form.status === 'Satıldı' && (
            <div>
              <label className={labelCls}>Satış Fiyatı (₺)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.salePrice || ''}
                onChange={(e) => set('salePrice', Number(e.target.value))}
                className={inputCls}
              />
              {errors.salePrice && <p className={errCls}>{errors.salePrice}</p>}
            </div>
          )}

          {/* Tarihler */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Alış Tarihi</label>
              <input
                type="date"
                value={form.purchaseDate ?? ''}
                onChange={(e) => set('purchaseDate', e.target.value)}
                className={inputCls}
              />
            </div>
            {form.status === 'Satıldı' && (
              <div>
                <label className={labelCls}>Satış Tarihi</label>
                <input
                  type="date"
                  value={form.saleDate ?? ''}
                  onChange={(e) => set('saleDate', e.target.value)}
                  className={inputCls}
                />
              </div>
            )}
          </div>

          {/* Notlar */}
          <div>
            <label className={labelCls}>Notlar (İsteğe bağlı)</label>
            <textarea
              placeholder="Ek bilgiler..."
              value={form.notes ?? ''}
              onChange={(e) => set('notes', e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 text-sm font-medium border border-white/10 hover:bg-white/10 transition"
          >
            İptal
          </button>
          <button
            type="submit"
            form="product-form"
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {editProduct ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
