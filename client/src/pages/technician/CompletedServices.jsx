import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { bookingApi } from '../../services/endpoints.js';
import { formatPrice, formatDate } from '../../utils/format.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const CompletedServices = () => {
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(!!location.state?.justCompleted);

  useEffect(() => {
    bookingApi
      .assigned({ status: 'Completed' })
      .then((r) => setJobs(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading history..." />;

  const totalEarnings = jobs.reduce((s, j) => s + (j.serviceCharge || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Completed Services</h1>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total earnings (labour)</p>
          <p className="font-bold text-slate-800">{formatPrice(totalEarnings)}</p>
        </div>
      </div>

      {banner && (
        <div className="mt-4"><Alert type="success" message="Job completed and bill generated." onClose={() => setBanner(false)} /></div>
      )}

      {jobs.length === 0 ? (
        <div className="card mt-6 p-12 text-center text-slate-500">No completed services yet.</div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((j) => (
                <tr key={j._id}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{j.bookingNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{j.categoryName}</td>
                  <td className="px-4 py-3 text-slate-500">{j.completedAt ? formatDate(j.completedAt) : '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">{formatPrice(j.totalAmount)}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={j.paymentStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompletedServices;
