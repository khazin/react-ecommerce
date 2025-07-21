const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export interface PaymentRequestDto {
  orderId: string;
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string; // format MM/YY or MM/YYYY
  cvv: string;
  amount: number; // total amount to be charged
}

export interface PaymentResponse {
  message: string;
  transactionId: string;
}
  const url = `${BASE_API_URL}/payment/process`;

export async function processPayment(paymentData: PaymentRequestDto): Promise<PaymentResponse> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Payment failed');
  }

  return res.json();
}
