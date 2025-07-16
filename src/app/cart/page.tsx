'use client';

import { useCartStore } from '@/lib/store/cartStore';
import toast from 'react-hot-toast';
import { placeOrderAdvanced } from '@/lib/api/orders/api';

export default function CartPage() {
  const { items, removeFromCart, clearCart } = useCartStore();

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleCheckout() {
    if (items.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    try {
      for (const item of items) {
        await placeOrderAdvanced({
          productId: item.productId,
          quantity: item.quantity,
        });
      }
      toast.success('✅ All items ordered successfully!');
      clearCart();
    } catch {
      toast.error('❌ Failed to place some orders');
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between items-center border rounded p-4 shadow-sm"
              >
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-500">
                    ${item.price.toFixed(2)} × {item.quantity} ={' '}
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mt-6 border-t pt-4">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
          </div>

          {/* Checkout */}
          <button
            onClick={handleCheckout}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            Checkout
          </button>
        </>
      )}
    </div>
  );
}
