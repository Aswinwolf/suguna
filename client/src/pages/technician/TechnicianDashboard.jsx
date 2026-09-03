import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../services/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatPrice } from '../../utils/format.js';
import Loader from '../../components/Loader.jsx';
import StatCard from '../../components/StatCard.jsx';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingApi.technicianSummary().then((r) => setSummary(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Welcome, {user?.name?.split(' ')[0]}</h1>
      <p className="mt-1 text-sm text-slate-500">Here's your service overview.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned Jobs" value={summary.assigned} icon="📋" accent="brand" />
        <StatCard label="Pending Jobs" value={summary.pending} icon="⏳" accent="amber" />
        <StatCard label="Completed Jobs" value={summary.completed} icon="✅" accent="green" />
        <StatCard label="Earnings" value={formatPrice(summary.earnings)} icon="💰" accent="indigo" />
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/technician/jobs" className="btn-primary">View Assigned Jobs</Link>
        <Link to="/technician/completed" className="btn-outline">Completed Services</Link>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
