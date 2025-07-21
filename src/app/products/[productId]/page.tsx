"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product, getProductById } from "@/lib/api/products/api";
import ProductCard from "@/components/ProductCard";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/store/cartStore";
import { createPendingOrder } from "@/lib/api/orders/api";

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    if (!productId) return;
    getProductById(Number(productId))
      .then((res) => setProduct(res))
      .finally(() => setLoading(false));
  }, [productId]);

   async function handleBuyNow() {
  if (!product) return;

  try {
    const response = await createPendingOrder([
      {
        productId: Number(product.id),
        quantity,
        price: product.price,
      },
    ]);
    // ✅ response is an array, so get the first order
    const firstOrder = response[0];
    if (!firstOrder) {
      toast.error("No order created.");
      return;
    }
    // ✅ Redirect to payment page with orderId and totalAmount
    const { orderId, totalAmount } = firstOrder;
    router.push(`/payment?orderId=${orderId}&amount=${totalAmount}`);
  } catch (err) {
    console.error(err);
    toast.error("Failed to create order. Please try again.");
  }
}


  function handleAddToCart() {
    if (!product) return;
    addToCart({
      productId: Number(product.id),
      name: product.name,
      price: product.price,
      quantity,
    });
    toast.success(`Added ${quantity} × ${product.name} to cart`);
  }

  if (loading) return <p className="text-center mt-6">Loading product...</p>;
  if (!product)
    return <p className="text-center mt-6 text-red-600">Product not found.</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6">
      {/* ✅ Show ProductCard without link */}
      <ProductCard
        id={Number(product.id)}
        name={product.name}
        category={product.category}
        price={product.price}
        stock={product.stock}
        showLink={false}
      />

      {product.stock > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <label className="font-medium">Qty:</label>
          <input
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border rounded px-2 py-1 w-20"
          />
        </div>
      )}

      <div className="flex gap-3 mt-4">
        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`px-4 py-2 rounded ${
            product.stock <= 0
              ? "bg-gray-400 text-white"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Add to Cart
        </button>

         {/* ✅ Buy Now goes to Payment Page */}
        <button
          onClick={handleBuyNow}
          disabled={product.stock <= 0}
          className={`px-4 py-2 rounded ${
            product.stock <= 0
              ? "bg-gray-400 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
