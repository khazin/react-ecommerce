'use client';

import { useEffect, useState } from 'react';
import { listOrders, Order } from '@/lib/api/orders/api';
import Link from 'next/link';

type SortKey = 'id' | 'productId' | 'quantity' | 'price' | 'status' | 'date';
type SortOrder = 'asc' | 'desc';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [sortBy, setSortBy] = useState<`${SortKey}_${SortOrder}`>('date_desc');
  const pageSize = 10;

  // Fetch orders with sorting and paging
  useEffect(() => {
    setLoading(true);
    listOrders({ page, pageSize, sortBy })
      .then((res) => {
        setOrders(res.orders);
        setTotalOrders(res.totalOrders);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, sortBy]);

  const totalPages = Math.ceil(totalOrders / pageSize);

  // Toggle sort direction or change sort column
  function handleSort(column: SortKey) {
    setPage(1); // Reset to first page on sort change
    setSortBy((current) => {
      const [currentCol, currentOrder] = current.split('_') as [SortKey, SortOrder];
      if (currentCol === column) {
        // Toggle asc/desc
        return currentOrder === 'asc' ? `${column}_desc` : `${column}_asc`;
      } else {
        // New column, default to ascending
        return `${column}_asc`;
      }
    });
  }

  // Render sort arrow
  function renderSortArrow(column: SortKey) {
    const [currentCol, currentOrder] = sortBy.split('_') as [SortKey, SortOrder];
    if (currentCol !== column) return null;
    return currentOrder === 'asc' ? '▲' : '▼';
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="border p-3 text-left cursor-pointer select-none"
                  onClick={() => handleSort('id')}
                  title="Sort by Order #"
                >
                  Order # {renderSortArrow('id')}
                </th>
                <th
                  className="border p-3 text-left cursor-pointer select-none"
                  onClick={() => handleSort('productId')}
                  title="Sort by Product ID"
                >
                  Product ID {renderSortArrow('productId')}
                </th>
                <th
                  className="border p-3 text-center cursor-pointer select-none"
                  onClick={() => handleSort('quantity')}
                  title="Sort by Quantity"
                >
                  Qty {renderSortArrow('quantity')}
                </th>
                <th
                  className="border p-3 text-right cursor-pointer select-none"
                  onClick={() => handleSort('price')}
                  title="Sort by Total Price"
                >
                  Total ($) {renderSortArrow('price')}
                </th>
                <th
                  className="border p-3 text-center cursor-pointer select-none"
                  onClick={() => handleSort('status')}
                  title="Sort by Status"
                >
                  Status {renderSortArrow('status')}
                </th>
                <th
                  className="border p-3 text-center cursor-pointer select-none"
                  onClick={() => handleSort('date')}
                  title="Sort by Date"
                >
                  Date {renderSortArrow('date')}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="border p-3 font-medium">
                    <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline">
                      {order.id}
                    </Link>
                  </td>
                  <td className="border p-3">{order.productId}</td>
                  <td className="border p-3 text-center">{order.quantity}</td>
                  <td className="border p-3 text-right">{order.totalPrice.toFixed(2)}</td>
                  <td
                    className={`border p-3 text-center font-medium ${
                      order.status === 'Completed'
                        ? 'text-green-600'
                        : order.status.includes('Failed')
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {order.status}
                  </td>
                  <td className="border p-3 text-center">
                    {new Date(order.orderDate).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded ${
              page === 1 ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded ${
              page === totalPages
                ? 'bg-gray-200 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
