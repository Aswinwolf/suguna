import crypto from 'crypto';

/**
 * Lightweight Razorpay helper.
 *
 * Uses the Razorpay REST API directly via global fetch (Node 18+), so it needs
 * NO extra npm dependency. When RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not
 * set, it runs in "mock" mode: it returns a fake order so the whole booking →
 * bill → pay flow works end-to-end in development, and drops into live mode the
 * moment real keys are added to the environment.
 */

export const isRazorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

export const getPublicKey = () => process.env.RAZORPAY_KEY_ID || 'rzp_test_mock';

/**
 * Create a Razorpay order. `amount` is in the main currency unit (e.g. rupees);
 * Razorpay expects the smallest unit (paise), so we multiply by 100.
 */
export const createRazorpayOrder = async ({ amount, receipt, currency = 'INR' }) => {
  const amountInSubunit = Math.round(Number(amount) * 100);

  if (!isRazorpayConfigured()) {
    return {
      id: `order_mock_${Date.now()}`,
      amount: amountInSubunit,
      currency,
      receipt,
      status: 'created',
      mock: true,
    };
  }

  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: amountInSubunit, currency, receipt }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Razorpay order creation failed: ${detail}`);
  }

  return response.json();
};

/**
 * Verify the signature Razorpay returns to the frontend after checkout.
 * In mock mode (no secret configured) verification is skipped and accepted.
 */
export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!isRazorpayConfigured()) return true;
  if (!orderId || !paymentId || !signature) return false;

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expected === signature;
};
