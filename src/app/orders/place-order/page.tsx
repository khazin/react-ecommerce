'use client';

import { useEffect, useState } from 'react';
import { placeOrderAdvanced } from '@/lib/api/orders/api';
import { getProductCatalog, Product } from '@/lib/api/products/api';
import Link from 'next/link';

export default function PlaceOrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ✅ Fetch products for dropdown
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await getProductCatalog({ page: 1, pageSize: 50 }); // Fetch first 50 products
        setProducts(res.products);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  // ✅ Handle submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProductId) {
      setMessage({ type: 'error', text: 'Please select a product.' });
      return;
    }

    const selectedProduct = products.find((p) => String(p.id) === selectedProductId);
    if (selectedProduct && selectedProduct.stock < quantity) {
      setMessage({
        type: 'error',
        text: `Only ${selectedProduct.stock} item(s) left in stock.`,
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await placeOrderAdvanced({
        productId: Number(selectedProductId),
        quantity: quantity,
      });

      setMessage({
        type: 'success',
        text: `✅ Order #${res.orderId} placed successfully! Total: $${res.totalPrice}`,
      });

      // Reset form
      setSelectedProductId('');
      setQuantity(1);
    } catch (err: unknown) {
      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setMessage({
        type: 'error',
        text: `❌ Failed to place order: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Place a New Order</h1>

      {/* If still loading products */}
      {loadingProducts ? (
        <p className="text-gray-500 text-center">Loading available products...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select a Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.stock === 0}>
                  {p.name} (${p.price}){' '}
                  {p.stock === 0
                    ? '(Out of Stock)'
                    : `- Stock: ${p.stock}`}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white font-medium ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      )}

      {/* Feedback Message */}
      {message && (
        <div
          className={`mt-4 p-3 rounded text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ✅ Show "View Orders" button if success */}
      {message?.type === 'success' && (
        <div className="mt-4 text-center">
          <Link
            href="/orders"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            View Orders
          </Link>
        </div>
      )}
    </div>
  );
}
