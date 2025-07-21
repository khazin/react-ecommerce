// /lib/api/orders/route.ts
const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export interface Order {
  id: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  status: string;
  orderDate: string; // ISO string
}

export interface ListOrdersResponse {
  orders: Order[];
  totalOrders: number;
  currentPage: number;
  pageSize: number;
}


interface ListOrdersParams {
  status?: string;
  fromTimestamp?: number; // Unix timestamp (seconds or ms - confirm with backend)
  toTimestamp?: number;
  sortBy?: string;        // e.g. 'date_desc'
  page?: number;
  pageSize?: number;
}

export async function listOrders(params: ListOrdersParams = {}): Promise<ListOrdersResponse> {
  const query = new URLSearchParams();

  if (params.status) query.append('status', params.status);
  if (params.fromTimestamp) query.append('fromTimestamp', params.fromTimestamp.toString());
  if (params.toTimestamp) query.append('toTimestamp', params.toTimestamp.toString());
  query.append('sortBy', params.sortBy || 'date_desc');
  query.append('page', (params.page ?? 1).toString());
  query.append('pageSize', (params.pageSize ?? 10).toString());

  const url = `${BASE_API_URL}/orders/list?${query.toString()}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.statusText}`);
  }

  const data = await res.json();

  return {
    orders: data.orders,
    totalOrders: data.totalOrders,
    currentPage: data.currentPage,
    pageSize: data.pageSize,
  };
}

// /lib/api/orders/api.ts

interface PlaceOrderRequestDto {
  productId: number;
  quantity: number;
}

interface PlaceOrderResponse {
  orderId: number;
  product: string;
  quantity: number;
  totalPrice: number;
  status: string;
}


export async function placeOrderAdvanced(request: PlaceOrderRequestDto): Promise<PlaceOrderResponse> {
  const res = await fetch(`${BASE_API_URL}/orders/place-advanced`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to place order: ${errorText}`);
  }

  return res.json();
}
export interface OrderDetail {
  id: number;
  productId: number;
  productName: string;  
  quantity: number;
  totalPrice: number;
  status: string;
  orderDate: string;
}


export async function getOrderById(orderId: number): Promise<OrderDetail> {
  const res = await fetch(`${BASE_API_URL}/orders/${orderId}`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch order #${orderId}`);
  }

  return res.json();
}

export interface CartItemPayload {
  productId: number;
  quantity: number;
  price: number;
}

// export interface CreateCombinedOrderResponse {
//   orderId: number;
//   totalAmount: number;
// }
export interface CombinedOrderItem {
  orderId: number;
  totalAmount: number;
  // optional if you need these later
  productId?: number;
  status?: string;
}
export type CreateCombinedOrderResponse = CombinedOrderItem[];

/**
 * Create a pending order (either single Buy Now or multiple cart items)
 */
export async function createPendingOrder(
  items: CartItemPayload[]
): Promise<CreateCombinedOrderResponse> {
  const res = await fetch(`${BASE_API_URL}/orders/create-combined`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items),
  });
  // Check if the response is ok
  if (!res.ok) {
    throw new Error(`Failed to create pending order: ${res.statusText}`);
  }

  return res.json();
}
