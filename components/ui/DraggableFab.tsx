'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface DraggableFabProps {
  onClick: () => void;
  color?: 'primary' | 'green';
  ariaLabel: string;
}

export default function DraggableFab({ onClick, color = 'primary', ariaLabel }: DraggableFabProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const isDragMovedRef = useRef(false);

  // Pointer / Touch olayları
  const handlePointerDown = (e: React.PointerEvent) => {
    // Sadece sol tık veya tek dokunuş
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    isDragMovedRef.current = false;
    setIsDragging(true);

    // Pointer capture ile parmak/fare ekranın dışına çıksa bile takip etsin
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    // Eğer 5 pikselden fazla hareket ettiyse sürükleme olarak kabul et
    if (Math.hypot(deltaX, deltaY) > 5) {
      isDragMovedRef.current = true;
    }

    setPosition({
      x: dragStartRef.current.initialX + deltaX,
      y: dragStartRef.current.initialY + deltaY,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    setIsDragging(false);
    dragStartRef.current = null;

    // Serbest bırakınca elastik yay gibi orijinal konumuna (0, 0) dön
    setPosition({ x: 0, y: 0 });

    // Eğer hiç sürüklenmediyse tıklama işlemini tetikle
    if (!isDragMovedRef.current) {
      onClick();
    }
  };

  const colorStyles =
    color === 'green'
      ? 'bg-gradient-to-tr from-emerald-600 to-green-400 text-white shadow-[0_12px_30px_rgba(34,197,94,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-green-300/30'
      : 'bg-gradient-to-tr from-blue-600 to-indigo-400 text-white shadow-[0_12px_30px_rgba(59,130,246,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-blue-300/30';

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${isDragging ? 1.12 : 1})`,
        transition: isDragging ? 'none' : 'transform 0.55s cubic-bezier(0.19, 1, 0.22, 1)',
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
