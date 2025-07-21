// /lib/api/products/route.ts

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface ProductCatalogResponse {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  pageSize: number;
}

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

interface GetProductCatalogParams {
  category?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export async function getProductCatalog(params: GetProductCatalogParams = {}): Promise<ProductCatalogResponse> {
  const query = new URLSearchParams();

  if (params.category) query.append('category', params.category);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  query.append('page', (params.page ?? 1).toString());
  query.append('pageSize', (params.pageSize ?? 10).toString());

  const url = `${BASE_API_URL}/product/catalog?${query.toString()}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch product catalog: ${res.statusText}`);
  }

  const data = await res.json();

  return {
    products: data.products,
    totalProducts: data.totalProducts,
    currentPage: data.currentPage,
    pageSize: data.pageSize,
  };
}
export async function getProductById(id: number): Promise<Product> {
  const res = await fetch(`${BASE_API_URL}/product/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}
