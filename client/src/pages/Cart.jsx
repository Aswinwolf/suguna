import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAddress } from '../context/AddressContext.jsx';
import { orderApi } from '../services/endpoints.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const Cart = () => {
  const { cart, loading, total, updateQuantity, removeFromCart, clearCart, refresh } = useCart();
  const { defaultAddress } = useAddress();
  const [placing, setPlacing] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const items = cart.products || [];

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setMsg(null);
    try {
      await orderApi.place();
      await refresh();
      navigate('/orders', { state: { justOrdered: true } });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not place order.' });
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <Loader label="Loading cart..." />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800">Your Cart</h1>

      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      {items.length === 0 ? (
        <div className="card mt-6 p-12 text-center">
          <p className="text-slate-500">Your cart is empty.</p>
          <Link to="/products" className="btn-primary mt-6">Continue Shopping</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => {
              const p = item.productId;
              if (!p) return null;
              return (
                <div key={p._id} className="card flex items-center gap-4 p-4">
                  <img
                    src={p.image}
                    alt={p.productName}
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x200?text=No+Image'; }}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${p._id}`} className="font-semibold text-slate-800 hover:text-brand-700 line-clamp-1">{p.productName}</Link>
                    <p className="text-sm text-slate-500">{p.brand}</p>
                    <p className="mt-1 font-bold text-slate-900">{formatPrice(p.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center rounded-lg border border-slate-300">
                      <button onClick={() => updateQuantity(p._id, Math.max(1, item.quantity - 1))} className="px-2.5 py-1 text-slate-600 hover:bg-slate-100">−</button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(p._id, item.quantity + 1)} className="px-2.5 py-1 text-slate-600 hover:bg-slate-100">+</button>
                    </div>
                    <button onClick={() => removeFromCart(p._id)} className="text-xs font-medium text-red-600 hover:underline">Remove</button>
                  </div>
                </div>
              );
            })}
            <button onClick={clearCart} className="btn-outline">Clear Cart</button>
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-20 p-6">
              <h2 className="text-lg font-bold text-slate-800">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="my-3 border-t border-slate-200" />
                <div className="flex justify-between text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Delivery address (Erode only) */}
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
                {defaultAddress ? (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Deliver to</p>
                    <p className="font-medium text-slate-700">{defaultAddress.fullName}</p>
                    <p className="text-slate-500">
                      {defaultAddress.area}, {defaultAddress.city} - {defaultAddress.pincode}
                    </p>
                    <Link to="/addresses" className="text-xs font-medium text-brand-700 hover:underline">Change address</Link>
                  </div>
                ) : (
                  <p className="text-slate-500">
                    We deliver to <span className="font-semibold">Erode</span> only.{' '}
                    <Link to="/addresses" className="font-medium text-brand-700 hover:underline">Add a delivery address</Link> to checkout.
                  </p>
                )}
              </div>

              <button onClick={handlePlaceOrder} disabled={placing || !defaultAddress} className="btn-primary mt-4 w-full">
                {placing ? 'Placing order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
