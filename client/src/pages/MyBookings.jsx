import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { bookingApi } from '../services/endpoints.js';
import { payForBooking } from '../services/razorpay.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice, formatDate } from '../utils/format.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import WorkPhotos from '../components/WorkPhotos.jsx';

const MyBookings = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [banner, setBanner] = useState(!!location.state?.justBooked);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    bookingApi.myBookings().then((r) => setBookings(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (b) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingApi.cancel(b._id);
      setMsg({ type: 'success', text: 'Booking cancelled.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not cancel.' });
    }
  };

  const handlePay = async (b) => {
    setBusyId(b._id);
    setMsg(null);
    try {
      const result = await payForBooking(b, user);
      setMsg({
        type: 'success',
        text: result.mock ? 'Payment successful (test mode).' : 'Payment successful.',
      });
      load();
    } catch (err) {
      const text = err.response?.data?.message || err.message || 'Payment failed.';
      if (text !== 'Payment cancelled') setMsg({ type: 'error', text });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader label="Loading your bookings..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">My Services</h1>
        <Link to="/services" className="btn-outline">Book a Service</Link>
      </div>

      {banner && (
        <div className="mt-4"><Alert type="success" message="Service request placed! A technician will be assigned soon." onClose={() => setBanner(false)} /></div>
      )}
      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      {bookings.length === 0 ? (
        <div className="card mt-6 p-12 text-center">
          <p className="text-slate-500">You haven't booked any services yet.</p>
          <Link to="/services" className="btn-primary mt-6">Explore Services</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-xs text-slate-400">Booking No.</p>
                  <p className="font-mono text-sm font-semibold text-slate-700">{b.bookingNumber}</p>
                </div>
                <div className="text-sm text-slate-500">{formatDate(b.scheduledDate)} · {b.timeSlot}</div>
                <StatusBadge status={b.status} />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-slate-400">Service:</span> <span className="font-medium text-slate-700">{b.categoryName}</span></p>
                <p><span className="text-slate-400">Issue:</span> <span className="text-slate-700">{b.issue}</span></p>
                <p><span className="text-slate-400">Technician:</span> <span className="text-slate-700">{b.technician?.name || 'Not assigned yet'}</span></p>
                <p><span className="text-slate-400">Payment:</span> <StatusBadge status={b.paymentStatus} /></p>
              </div>

              {b.status === 'Completed' && <WorkPhotos booking={b} />}

              {b.status === 'Completed' && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div className="text-sm">
                    <span className="text-slate-400">Total payable</span>
                    <span className="ml-2 text-lg font-bold text-slate-900">{formatPrice(b.totalAmount)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/invoice/${b._id}`} className="btn-outline">View Invoice</Link>
                    {b.paymentStatus !== 'Paid' && (
                      <button onClick={() => handlePay(b)} disabled={busyId === b._id} className="btn-primary">
                        {busyId === b._id ? 'Processing...' : 'Pay Now'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {['Pending', 'Assigned', 'Accepted'].includes(b.status) && (
                <div className="mt-3 border-t border-slate-100 pt-3 text-right">
                  <button onClick={() => handleCancel(b)} className="text-sm font-medium text-red-600 hover:underline">
                    Cancel booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
