'use client';

import { useCartStore } from '@/lib/store/cartStore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPendingOrder } from '@/lib/api/orders/api';

export default function CartPage() {
  const { items, removeFromCart, clearCart } = useCartStore();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const router = useRouter();

  // Toggle item selection
  function toggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // Calculate total of selected items
  const selectedItems = items.filter((item) => selectedIds.includes(item.productId));
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItems = useCartStore((s) => s.items);
   async function handleCheckout() {
    try {
     // Transform cart items into API payload
const payload = cartItems.map((item) => ({
  productId: item.productId,
  quantity: item.quantity,
  price: item.price,
}));

// ✅ Call the reusable API helper → returns an array of orders
const response = await createPendingOrder(payload);

// Combine all orders' amounts
const totalAmount = response.reduce((sum, order) => sum + order.totalAmount, 0);


// Maybe just take the first orderId for reference
const orderId = response.map(o => o.orderId).join(',');

// Redirect with combined amount
router.push(`/payment?orderId=${orderId}&amount=${totalAmount}`);

    } catch (error) {
      console.error(error);      alert("Checkout failed. Please try again.");
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
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.productId)}
                  onChange={() => toggleSelect(item.productId)}
                />
                <div className="flex-1 ml-4">
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

          {/* Total of selected */}
          <div className="flex justify-between items-center mt-6 border-t pt-4">
            <span className="font-bold text-lg">Selected Total</span>
            <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
          </div>

          {/* Checkout */}
          <button
            onClick={handleCheckout}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            Proceed to Payment
          </button>
        </>
      )}
    </div>
  );
}

// import { createPendingOrder } from "@/lib/api/orders/api";
// import { useRouter } from "next/navigation";
// import { useCartStore } from '@/lib/store/cartStore';
// export default  function CartPage() {
//   const router = useRouter();
//   const cartItems = useCartStore((s) => s.items);

//   async function handleCheckout() {
//     try {
//      // Transform cart items into API payload
// const payload = cartItems.map((item) => ({
//   productId: item.productId,
//   quantity: item.quantity,
//   price: item.price,
// }));

// // ✅ Call the reusable API helper → returns an array of orders
// const response = await createPendingOrder(payload);

// // Combine all orders' amounts
// const totalAmount = response.reduce((sum, order) => sum + order.totalAmount, 0);


// // Maybe just take the first orderId for reference
// const orderId = response.map(o => o.orderId).join(',');

// // Redirect with combined amount
// router.push(`/payment?orderId=${orderId}&amount=${totalAmount}`);

//     } catch (error) {
//       console.error(error);      alert("Checkout failed. Please try again.");
//     }
//   }

//   return (
//     <div>
//       {/* cart list */}
//       <button
//         onClick={handleCheckout}
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Checkout
//       </button>
//     </div>
//   );
// }
