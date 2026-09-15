'use client';

import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';

interface DraggableFabProps {
  onClick: () => void;
  color?: 'primary' | 'green';
  ariaLabel: string;
}

export default function DraggableFab({ onClick, color = 'primary', ariaLabel }: DraggableFabProps) {
  // Bırakılan son koordinat (nerede bırakılırsa orada kalır)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const isDragMovedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    isDragMovedRef.current = false;
    setIsDragging(true);

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    if (Math.hypot(deltaX, deltaY) > 6) {
      isDragMovedRef.current = true;
    }

    // Ekran sınırları içinde serbest sürükleme
    const nextX = dragStartRef.current.initialX + deltaX;
    const nextY = dragStartRef.current.initialY + deltaY;

    setPosition({
      x: nextX,
      y: nextY,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    setIsDragging(false);
    dragStartRef.current = null;

    // ÖNEMLİ: Sıfırlama yapılmaz! Bırakıldığı yerde kalır (nerede bıraktıysan orada durur).

    // Eğer hiç sürüklenmediyse tıklama işlemini tetikle (formu aç)
    if (!isDragMovedRef.current) {
      onClick();
    }
  };

  const colorStyles =
    color === 'green'
      ? 'bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-[0_12px_30px_rgba(34,197,94,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-green-300/30'
      : 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-[0_12px_30px_rgba(59,130,246,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-blue-300/30';

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${isDragging ? 1.12 : 1})`,
        transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        touchAction: 'none',
      }}
      className={`fixed bottom-28 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none backdrop-blur-md ${colorStyles}`}
      aria-label={ariaLabel}
      role="button"
      tabIndex={0}
    >
      <Plus
        size={28}
        strokeWidth={2.6}
        className={`transition-transform duration-200 pointer-events-none ${isDragging ? 'rotate-90' : ''}`}
      />
    </div>
  );
}
