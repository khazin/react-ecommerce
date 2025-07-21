import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast'
import { CartIndicator } from '@/components/CartIndicator';

export const metadata = {
  title: 'React E-Commerce',
  description: 'E-commerce demo app',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        {/* ✅ Global Header */}
        <header className="bg-blue-600 text-white shadow ">
          <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
            <Link href="/" className="text-xl font-bold">
              React E-Commerce
            </Link>
            <nav className="flex space-x-4">
              <Link href="/products" className="hover:underline">Products</Link>
              <Link href="/orders" className="hover:underline">
                Orders
              </Link>
              <Link href="/cart" className="relative">
                <CartIndicator />
              </Link>
            </nav>
          </div>
        </header>

        {/* ✅ Page Content */}
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        {/* ✅ Toast container */}
        <Toaster position="bottom-right" />
        {/* ✅ Footer (optional) */}
        <footer className="text-center text-sm text-gray-500 mt-10 py-4">
          © {new Date().getFullYear()} React E-Commerce Demo
        </footer>
      </body>
    </html>
  );
}
