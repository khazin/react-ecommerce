'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { processPayment, PaymentRequestDto } from '@/lib/api/payment/api';

interface PaymentFormProps {
  orderId: number;
  amount: number;
  onSuccess: (transactionId: string) => void;
}

export default function PaymentForm({ orderId, amount, onSuccess }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!cardNumber || !cardHolderName || !expiryDate || !cvv) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);

    const paymentData: PaymentRequestDto = {
      orderId: orderId.toString(),
      cardNumber,
      cardHolderName,
      expiryDate,
      cvv,
      amount,
    };

    try {
      const response = await processPayment(paymentData);
      toast.success(`Payment successful! Transaction ID: ${response.transactionId}`);
      onSuccess(response.transactionId);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message?: string }).message
          : 'Payment failed';
      toast.error(errorMessage || 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

      <div>
        <label className="block mb-1 font-medium">Card Number</label>
        <input
          type="text"
          maxLength={19}
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Cardholder Name</label>
        <input
          type="text"
          value={cardHolderName}
          onChange={(e) => setCardHolderName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block mb-1 font-medium">Expiry Date (MM/YY)</label>
          <input
            type="text"
            maxLength={5}
            placeholder="MM/YY"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="flex-1">
          <label className="block mb-1 font-medium">CVV</label>
          <input
            type="password"
            maxLength={4}
            placeholder="123"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded text-white ${
          loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}
