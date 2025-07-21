// 'use client';

// import { useSearchParams, useRouter } from 'next/navigation';
// import { useState, useEffect } from 'react';
// import PaymentForm from '@/components/PaymentForm';
// import { placeOrderAdvanced } from '@/lib/api/orders/api';
// import toast from 'react-hot-toast';

// interface OrderItem {
//   productId: number;
//   quantity: number;
// }

// export default function PaymentPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [processing, setProcessing] = useState(false);

//   useEffect(() => {
//     const orderData = searchParams.get('orderData');
//     const total = searchParams.get('total');

//     if (!orderData || !total) {
//       toast.error('Invalid payment data');
//       router.push('/cart');
//       return;
//     }

//     try {
//       const parsed = JSON.parse(decodeURIComponent(orderData));
//       setOrderItems(parsed);
//       setTotalAmount(parseFloat(total));
//     } catch {
//       toast.error('Invalid order data');
//       router.push('/cart');
//     }
//   }, [searchParams, router]);

//   // We will place orders sequentially after successful payment
//   async function handlePaymentSuccess(transactionId: string) {
//     setProcessing(true);

//     try {
//       for (const item of orderItems) {
//         await placeOrderAdvanced({
//           productId: item.productId,
//           quantity: item.quantity,
//         });
//       }
//       toast.success('Orders placed successfully!');
//       router.push('/orders');
//     } catch {
//       toast.error('Failed to place orders.');
//     } finally {
//       setProcessing(false);
//     }
//   }

//   if (orderItems.length === 0) return null; // or loading spinner

//   return (
//     <div className="max-w-md mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Payment</h1>

//       <p className="mb-4">
//         Total amount to pay: <strong>${totalAmount.toFixed(2)}</strong>
//       </p>

//       <PaymentForm
//         orderId={0} // dummy because multiple orders, or you can adjust PaymentForm to accept multiple items
//         amount={totalAmount}
//         onSuccess={handlePaymentSuccess}
//       />

//       {processing && <p className="mt-4 text-gray-600">Placing your orders...</p>}
//     </div>
//   );
// }

'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import PaymentForm from '@/components/PaymentForm';

export default function PaymentPage() {
  debugger
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('orderId');
  const amount = parseFloat(searchParams.get('amount') || '0');

  if (!orderId || !amount) {
    return <p>Invalid payment data</p>;
  }

  function onPaymentSuccess(txId: string) {
    router.push('/orders');
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Payment</h1>
      <p>Paying for Order #{orderId} - Total ${amount.toFixed(2)}</p>

      <PaymentForm
        orderId={parseInt(orderId)}
        amount={amount}
        onSuccess={onPaymentSuccess}
      />
    </div>
  );
}
