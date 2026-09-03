import { paymentApi } from './endpoints.js';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

// Lazily inject the Razorpay checkout script (only needed in live mode).
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Run the full pay-for-booking flow:
 *   1. ask backend for an order (real or mock)
 *   2. in mock mode, immediately verify with fake ids (dev/test)
 *   3. in live mode, open Razorpay checkout and verify on success
 *
 * Resolves with the verify response on success; rejects/throws otherwise.
 * `user` is used only to prefill the checkout form.
 */
export const payForBooking = async (booking, user = {}) => {
  const { data: order } = await paymentApi.createOrder({ bookingId: booking._id });

  // Mock mode — no real gateway configured. Simulate a successful payment.
  if (order.mock) {
    const { data } = await paymentApi.verify({
      bookingId: booking._id,
      orderId: order.orderId,
      paymentId: `pay_mock_${Date.now()}`,
      signature: 'mock_signature',
    });
    return { ...data, mock: true };
  }

  const loaded = await loadRazorpayScript();
  if (!loaded) throw new Error('Failed to load the payment gateway. Check your connection.');

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: 'Suguna Home Appliances',
      description: `Service booking ${order.bookingNumber}`,
      order_id: order.orderId,
      prefill: { name: user.name || '', email: user.email || '' },
      theme: { color: '#1b6ff5' },
      handler: async (response) => {
        try {
          const { data } = await paymentApi.verify({
            bookingId: booking._id,
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          resolve(data);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });
    rzp.open();
  });
};
