import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { serviceCategoryApi } from '../services/endpoints.js';
import { formatPrice } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';

const Services = () => {
  const { isAdmin, isTechnician } = useAuth();
  // Admins and technicians can browse services but cannot book them.
  const canBook = !isAdmin && !isTechnician;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    serviceCategoryApi
      .list()
      .then((r) => setCategories(r.data))
      .catch((err) => {
        // Surface the real failure (404 / network / CORS) instead of silently
        // showing an empty list, which is indistinguishable from "no data".
        console.error('Failed to load service categories:', err);
        setError(
          err.response
            ? `Could not load services (HTTP ${err.response.status}). Check that the API server has the /service-categories route.`
            : 'Could not reach the API server. Is the backend running?'
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-800">Home Appliance Repair Services</h1>
        <p className="mt-2 text-slate-500">Book a trained technician for doorstep repair &amp; servicing.</p>
      </div>

      {loading ? (
        <Loader label="Loading services..." />
      ) : error ? (
        <div className="mt-8"><Alert type="error" message={error} /></div>
      ) : categories.length === 0 ? (
        <div className="card mt-8 p-12 text-center text-slate-500">No services available right now.</div>
      ) : (
        <>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const inner = (
              <>
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-xl bg-brand-50 text-3xl">{c.icon || '🛠️'}</span>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-brand-700">{c.name}</h3>
                    <p className="text-xs text-slate-400">Visiting charge {formatPrice(c.visitingCharge)}</p>
                  </div>
                </div>
                {c.description && <p className="mt-4 text-sm text-slate-500">{c.description}</p>}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                  {canBook ? 'Book now →' : 'View only'}
                </span>
              </>
            );

            // Only customers (and guests, who are routed to login) can book.
            return canBook ? (
              <Link
                key={c._id}
                to={`/services/${c._id}`}
                className="card group flex flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {inner}
              </Link>
            ) : (
              <div key={c._id} className="card group flex flex-col p-6 opacity-90">
                {inner}
              </div>
            );
          })}
        </div>
        {!canBook && (
          <p className="mt-4 text-center text-sm text-slate-400">
            Bookings can only be created by customer accounts.
          </p>
        )}
        </>
      )}
    </div>
  );
};

export default Services;
