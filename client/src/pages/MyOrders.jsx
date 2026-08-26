import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { orderApi } from '../services/endpoints.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [showBanner, setShowBanner] = useState(!!location.state?.justOrdered);

  useEffect(() => {
    orderApi
      .myOrders()
      .then((r) => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading orders..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>

      {showBanner && (
        <div className="mt-4">
          <Alert type="success" message="Order placed successfully!" onClose={() => setShowBanner(false)} />
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card mt-6 p-12 text-center">
          <p className="text-slate-500">You have no orders yet.</p>
          <Link to="/products" className="btn-primary mt-6">Start Shopping</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-xs text-slate-400">Order ID</p>
                  <p className="font-mono text-sm font-semibold text-slate-700">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-sm text-slate-500">{formatDate(order.createdAt)}</div>
                <StatusBadge status={order.status} />
              </div>

              <div className="mt-3 space-y-2">
                {order.products.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-700">{item.productName} <span className="text-slate-400">× {item.quantity}</span></span>
                    <span className="font-medium text-slate-700">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-between border-t border-slate-100 pt-3">
                <span className="font-semibold text-slate-800">Total</span>
                <span className="font-bold text-slate-900">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
