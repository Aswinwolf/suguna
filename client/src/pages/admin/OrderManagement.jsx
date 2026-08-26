import { useEffect, useState } from 'react';
import { orderApi } from '../../services/endpoints.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    orderApi.all().then((r) => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const changeStatus = async (order, status) => {
    try {
      await orderApi.updateStatus(order._id, { status });
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status } : o)));
      setMsg({ type: 'success', text: `Order #${order._id.slice(-8).toUpperCase()} → ${status}` });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    }
  };

  const visible = filter === 'All' ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <Loader label="Loading orders..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Order Management</h1>

      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      <div className="mt-4 flex flex-wrap gap-2">
        {['All', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === s ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card mt-6 p-12 text-center text-slate-500">No orders found.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {visible.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-slate-700">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-700">{order.userId?.name || '—'}</p>
                  <p className="text-xs text-slate-400">{order.userId?.email || ''}</p>
                </div>
                <div className="font-bold text-slate-900">{formatPrice(order.totalAmount)}</div>
                <StatusBadge status={order.status} />
                <select
                  value={order.status}
                  onChange={(e) => changeStatus(order, e.target.value)}
                  className="input w-40"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  {expanded === order._id ? 'Hide items' : 'View items'}
                </button>
              </div>

              {expanded === order._id && (
                <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
                  {order.products.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-slate-700">{item.productName} <span className="text-slate-400">× {item.quantity}</span></span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
