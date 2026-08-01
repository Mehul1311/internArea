import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function CheckoutPage() {
  const router = useRouter();
  const { planId, name, price } = router.query;
  const [error, setError] = useState<string | null>(null);

  // Note: For simplicity, we assume the user is logged in and we know their username.
  // In a real app, you'd get this from context or local storage.
  const username = 'testuser'; // Hardcoded for this demo

  const handlePayment = async () => {
    try {
      // 1. Create order on backend
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${API_BASE}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create order');
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Add this to your frontend .env
        amount: data.amount,
        currency: data.currency,
        name: 'Internshala Clone',
        description: `Subscription for ${name} Plan`,
        order_id: data.id,
        handler: function (response: any) {
          // Razorpay handles sending this to our webhook automatically, 
          // but we can also navigate the user to a success page.
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          router.push('/dashboard');
        },
        prefill: {
          name: username,
          email: `${username}@example.com`,
          contact: '9999999999'
        },
        theme: {
          color: '#0070f3'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  };

  if (!planId) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
      <Head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </Head>

      <h1 style={{ textAlign: 'center' }}>Checkout</h1>
      
      <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>{name} Plan</h2>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{price}/month</p>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '18px'
        }}
      >
        Pay Now
      </button>
    </div>
  );
}
