import Link from 'next/link';

export interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  showLink?: boolean; // whether to wrap in link or not
}

export default function ProductCard({
  id,
  name,
  category,
  price,
  stock,
  showLink = true,
}: ProductCardProps) {
  const content = (
    <div className="border rounded-lg shadow hover:shadow-md transition p-4 flex flex-col">
      <div className="flex-grow">
        <h2 className="text-lg font-semibold mb-2">{name}</h2>
        <p className="text-sm text-gray-500 mb-2">{category}</p>
        <p className="text-blue-600 font-bold text-xl mb-2">${price.toFixed(2)}</p>
        <p
          className={`text-sm font-medium ${
            stock > 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {stock > 0 ? `${stock} in stock` : 'Out of stock'}
        </p>
      </div>
    </div>
  );

  return showLink ? <Link href={`/products/${id}`}>{content}</Link> : content;
}
