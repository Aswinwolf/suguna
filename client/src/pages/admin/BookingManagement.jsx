import { useEffect, useState } from 'react';
import { bookingApi, technicianApi } from '../../services/endpoints.js';
import { formatPrice, formatDate } from '../../utils/format.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import WorkPhotos from '../../components/WorkPhotos.jsx';

const STATUSES = ['All', 'Pending', 'Assigned', 'Accepted', 'In Progress', 'Completed', 'Cancelled'];

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [msg, setMsg] = useState(null);
  // Per-row selected technician id for assignment.
  const [assignSel, setAssignSel] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    const params = filter === 'All' ? undefined : { status: filter };
    bookingApi.all(params).then((r) => setBookings(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  useEffect(() => {
    technicianApi.list().then((r) => setTechnicians(r.data.filter((t) => t.isActive))).catch(() => {});
  }, []);

  const handleAssign = async (b) => {
    const technicianId = assignSel[b._id];
    if (!technicianId) return setMsg({ type: 'error', text: 'Select a technician first.' });
    setBusyId(b._id);
    setMsg(null);
    try {
      await bookingApi.assign(b._id, { technicianId });
      setMsg({ type: 'success', text: 'Technician assigned.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Assignment failed.' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Bookings</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      {loading ? (
        <Loader label="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <div className="card mt-6 p-12 text-center text-slate-500">No bookings found.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-slate-700">{b.bookingNumber}</p>
                  <p className="text-xs text-slate-400">{b.categoryName} · {b.issue}</p>
                </div>
                <div className="text-sm text-slate-500">{formatDate(b.scheduledDate)} · {b.timeSlot}</div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={b.status} />
                  <StatusBadge status={b.paymentStatus} />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-slate-400">Customer:</span> <span className="text-slate-700">{b.user?.name}</span> <span className="text-slate-400">({b.user?.email})</span></p>
                <p><span className="text-slate-400">Address:</span> <span className="text-slate-700">{b.address?.area}, {b.address?.city} - {b.address?.pincode}</span></p>
                <p><span className="text-slate-400">Total:</span> <span className="font-medium text-slate-700">{formatPrice(b.totalAmount)}</span></p>
                <p><span className="text-slate-400">Technician:</span> <span className="text-slate-700">{b.technician?.name || 'Unassigned'}</span></p>
              </div>

              {b.status === 'Completed' && <WorkPhotos booking={b} />}

              {!['Completed', 'Cancelled'].includes(b.status) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <select
                    value={assignSel[b._id] || b.technician?._id || ''}
                    onChange={(e) => setAssignSel((s) => ({ ...s, [b._id]: e.target.value }))}
                    className="input w-auto"
                  >
                    <option value="">Select technician</option>
                    {technicians.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                  <button onClick={() => handleAssign(b)} disabled={busyId === b._id} className="btn-primary">
                    {b.technician ? 'Reassign' : 'Assign'}
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

export default BookingManagement;
