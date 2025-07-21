'use client';
import { useCartStore } from '@/lib/store/cartStore';

export function CartIndicator() {
  const items = useCartStore((s) => s.items);
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="relative">
      🛒
      {totalQty > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
          {totalQty}
        </span>
      )}
    </div>
  );
}
