'use client';

import { useEffect, useState } from 'react';
import { getProductCatalog, Product } from '@/lib/api/products/api';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name_asc');
  const [searchQuery, setSearchQuery] = useState(''); // ✅ new local search

  const pageSize = 12;

  useEffect(() => {
    setLoading(true);

    getProductCatalog({
      category: selectedCategory || undefined,
      sortBy,
      page,
      pageSize,
    })
      .then((res) => {
        setProducts(res.products);
        setTotalProducts(res.totalProducts);

        // Derive categories dynamically (for demo; ideally fetch from API)
        const uniqueCategories = Array.from(new Set(res.products.map((p) => p.category))).sort();
        setCategories((prev) => (prev.length ? prev : uniqueCategories));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, selectedCategory, sortBy]);

  const totalPages = Math.ceil(totalProducts / pageSize);

  // ✅ Apply search filter only on the loaded page's products
  const filteredProducts = products.filter((p) =>
    searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Products Catalog</h1>

      {/* ✅ Filter + Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        {/* Category Filter */}
        <div>
          <label className="mr-2 font-medium">Category:</label>
          <select
            className="border rounded px-2 py-1"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div>
          <label className="mr-2 font-medium">Sort By:</label>
          <select
            className="border rounded px-2 py-1"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
          >
            <option value="name_asc">Name (A → Z)</option>
            <option value="name_desc">Name (Z → A)</option>
            <option value="price_asc">Price (Low → High)</option>
            <option value="price_desc">Price (High → Low)</option>
            <option value="stock_desc">Stock (Most first)</option>
          </select>
        </div>

        {/* ✅ Local Search */}
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded px-3 py-1 w-full md:w-64"
          />
        </div>
      </div>

      {/* ✅ Product Grid */}
      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={Number(p.id)}
                name={p.name}
                category={p.category}
                price={p.price}
                stock={p.stock}
              />
            ))}
          </div>

          {/* ✅ Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded ${
                  page === 1
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
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
        </>
      )}
    </div>
  );
}
