'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrderById, OrderDetail } from '@/lib/api/orders/api';
import Link from 'next/link';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    async function fetchOrder() {
      try {
        const res = await getOrderById(Number(orderId));
        setOrder(res);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading order details...</p>;
  }

  if (error || !order) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-600">{error || 'Order not found.'}</p>
        <Link
          href="/orders"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Order #{order.id}</h1>

      <div className="space-y-3 text-sm">
        <p>
          <span className="font-medium">Product ID:</span> {order.productId}
        </p>
         <p>
          <span className="font-medium">Product Name:</span> {order.productName}
        </p>
        <p>
          <span className="font-medium">Quantity:</span> {order.quantity}
        </p>
        <p>
          <span className="font-medium">Total Price:</span> ${order.totalPrice.toFixed(2)}
        </p>
        <p>
          <span className="font-medium">Status:</span>{' '}
          <span
            className={
              order.status === 'Completed'
                ? 'text-green-600 font-semibold'
                : order.status.includes('Failed')
                ? 'text-red-600 font-semibold'
                : 'text-yellow-600 font-semibold'
            }
          >
            {order.status}
          </span>
        </p>
        <p>
          <span className="font-medium">Order Date:</span>{' '}
          {new Date(order.orderDate).toLocaleString()}
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/orders"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Orders
        </Link>
      </div>
    </div>
  );
}
