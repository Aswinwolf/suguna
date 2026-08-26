import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, categoryApi, subCategoryApi, orderApi } from '../../services/endpoints.js';
import Loader from '../../components/Loader.jsx';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const Card = ({ label, value, to, accent }) => (
  <Link to={to} className={`card p-6 transition hover:shadow-md ${accent || ''}`}>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-extrabold text-slate-800">{value}</p>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, categories: 0, subcategories: 0, orders: 0, revenue: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, sc, o] = await Promise.all([
          productApi.list(),
          categoryApi.list(),
          subCategoryApi.list(),
          orderApi.all(),
        ]);
        const revenue = o.data.reduce((sum, order) => sum + order.totalAmount, 0);
        setStats({
          products: p.data.length,
          categories: c.data.length,
          subcategories: sc.data.length,
          orders: o.data.length,
          revenue,
        });
        setRecent(o.data.slice(0, 5));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Overview of your store.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card label="Products" value={stats.products} to="/admin/products" />
        <Card label="Categories" value={stats.categories} to="/admin/categories" />
        <Card label="SubCategories" value={stats.subcategories} to="/admin/subcategories" />
        <Card label="Orders" value={stats.orders} to="/admin/orders" />
        <Card label="Revenue" value={formatPrice(stats.revenue)} to="/admin/orders" />
      </div>

      <div className="card mt-8 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-brand-700 hover:underline">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-2">Order</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((o) => (
                  <tr key={o._id}>
                    <td className="py-2 font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                    <td className="py-2">{o.userId?.name || '—'}</td>
                    <td className="py-2 font-semibold">{formatPrice(o.totalAmount)}</td>
                    <td className="py-2">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
