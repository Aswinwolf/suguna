import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../services/endpoints.js';
import { formatDate } from '../../utils/format.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const AssignedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    bookingApi.assigned().then((r) => setJobs(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const act = async (id, fn, successText) => {
    setBusyId(id);
    setMsg(null);
    try {
      await fn(id);
      setMsg({ type: 'success', text: successText });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Action failed.' });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader label="Loading jobs..." />;

  // Active jobs = anything not completed/cancelled.
  const active = jobs.filter((j) => !['Completed', 'Cancelled'].includes(j.status));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Assigned Jobs</h1>

      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      {active.length === 0 ? (
        <div className="card mt-6 p-12 text-center text-slate-500">No active jobs right now.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {active.map((j) => (
            <div key={j._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-slate-700">{j.bookingNumber}</p>
                  <p className="text-xs text-slate-400">{j.categoryName} · {j.issue}</p>
                </div>
                <div className="text-sm text-slate-500">{formatDate(j.scheduledDate)} · {j.timeSlot}</div>
                <StatusBadge status={j.status} />
              </div>

              <div className="mt-3 text-sm text-slate-600">
                <p className="font-medium text-slate-700">{j.address?.fullName} · {j.address?.mobile}</p>
                <p>{j.address?.houseNo}, {j.address?.street}, {j.address?.area}, {j.address?.city} - {j.address?.pincode}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                {j.status === 'Assigned' && (
                  <button onClick={() => act(j._id, bookingApi.accept, 'Job accepted.')} disabled={busyId === j._id} className="btn-primary">
                    Accept
                  </button>
                )}
                {j.status === 'Accepted' && (
                  <button onClick={() => act(j._id, bookingApi.start, 'Job marked in progress.')} disabled={busyId === j._id} className="btn-primary">
                    Start Job
                  </button>
                )}
                {['Accepted', 'In Progress'].includes(j.status) && (
                  <Link to={`/technician/jobs/${j._id}/complete`} className="btn-outline">
                    Complete &amp; Bill
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedJobs;
