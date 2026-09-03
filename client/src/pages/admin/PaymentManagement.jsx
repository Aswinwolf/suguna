import { useEffect, useState } from 'react';
import { paymentApi } from '../../services/endpoints.js';
import { formatPrice, formatDate } from '../../utils/format.js';
import Loader from '../../components/Loader.jsx';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentApi.all().then((r) => setPayments(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading payments..." />;

  const paid = payments.filter((p) => p.status === 'Paid');
  const revenue = paid.reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === 'Pending').length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Payments</h1>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Revenue" value={formatPrice(revenue)} icon="💰" accent="green" />
        <StatCard label="Paid Transactions" value={paid.length} icon="✅" accent="brand" />
        <StatCard label="Pending" value={pending} icon="⏳" accent="amber" />
      </div>

      <div className="card mt-6 overflow-x-auto">
        {payments.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No payments yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{p.booking?.bookingNumber || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{p.user?.name}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-500">{p.provider === 'mock' ? 'Test' : 'Razorpay'}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">{formatPrice(p.amount)}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;
