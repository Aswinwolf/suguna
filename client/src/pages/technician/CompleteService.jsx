import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingApi, repairServiceApi, sparePartApi } from '../../services/endpoints.js';
import { formatPrice } from '../../utils/format.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';

const CompleteService = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [repairMaster, setRepairMaster] = useState([]);
  const [spareMaster, setSpareMaster] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selections: repair service ids, and spare id -> quantity.
  const [selectedRepairs, setSelectedRepairs] = useState({});
  const [selectedSpares, setSelectedSpares] = useState({});
  const [notes, setNotes] = useState('');
  const [beforeImages, setBeforeImages] = useState('');
  const [afterImages, setAfterImages] = useState('');

  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const catParam = (b) => (b?.serviceCategory ? { category: b.serviceCategory } : undefined);
    bookingApi
      .get(id)
      .then(async (r) => {
        setBooking(r.data);
        const [rs, sp] = await Promise.all([
          repairServiceApi.list(catParam(r.data)),
          sparePartApi.list(catParam(r.data)),
        ]);
        setRepairMaster(rs.data);
        setSpareMaster(sp.data);
      })
      .catch(() => setMsg({ type: 'error', text: 'Could not load the job.' }))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleRepair = (svc) => {
    setSelectedRepairs((prev) => {
      const next = { ...prev };
      if (next[svc._id]) delete next[svc._id];
      else next[svc._id] = svc;
      return next;
    });
  };

  const toggleSpare = (part) => {
    setSelectedSpares((prev) => {
      const next = { ...prev };
      if (next[part._id]) delete next[part._id];
      else next[part._id] = { part, quantity: 1 };
      return next;
    });
  };

  const setSpareQty = (partId, qty) => {
    setSelectedSpares((prev) => ({
      ...prev,
      [partId]: { ...prev[partId], quantity: Math.max(1, Number(qty) || 1) },
    }));
  };

  // Live billing (mirrors the server-side calculator).
  const bill = useMemo(() => {
    const visitingCharge = booking?.visitingCharge || 0;
    const taxRate = booking?.taxRate ?? 18;
    const serviceCharge = Object.values(selectedRepairs).reduce((s, r) => s + (r.charge || 0), 0);
    const spareCharge = Object.values(selectedSpares).reduce(
      (s, { part, quantity }) => s + part.price * quantity,
      0
    );
    const taxable = visitingCharge + serviceCharge + spareCharge;
    const tax = Math.round((taxable * taxRate) / 100 * 100) / 100;
    const total = Math.round((taxable + tax) * 100) / 100;
    return { visitingCharge, serviceCharge, spareCharge, taxRate, tax, total };
  }, [booking, selectedRepairs, selectedSpares]);

  const toLines = (raw) => raw.split('\n').map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    // Proof-of-work: at least one "after" photo is mandatory before completing.
    const afterList = toLines(afterImages);
    if (afterList.length === 0) {
      setMsg({ type: 'error', text: 'Please upload at least one "after work" photo before completing the job.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        repairServices: Object.values(selectedRepairs).map((r) => ({
          repairServiceId: r._id,
          name: r.name,
          charge: r.charge,
        })),
        spareParts: Object.values(selectedSpares).map(({ part, quantity }) => ({
          sparePartId: part._id,
          name: part.name,
          price: part.price,
          quantity,
        })),
        notes,
        beforeImages: toLines(beforeImages),
        afterImages: afterList,
      };
      await bookingApi.complete(id, payload);
      navigate('/technician/completed', { state: { justCompleted: true } });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not complete the job.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading job..." />;
  if (!booking) {
    return (
      <div className="py-16 text-center">
        <Alert type="error" message="Job not found." />
        <Link to="/technician/jobs" className="btn-primary mt-6">Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/technician/jobs" className="text-sm text-slate-500 hover:text-brand-700">← Back to jobs</Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-800">Complete Service</h1>
      <p className="text-sm text-slate-500">{booking.bookingNumber} · {booking.categoryName} · {booking.issue}</p>

      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Repair services */}
          <section className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-700">Repair Services Done</h2>
            {repairMaster.length === 0 ? (
              <p className="text-sm text-slate-400">No repair services configured.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {repairMaster.map((svc) => (
                  <button
                    type="button"
                    key={svc._id}
                    onClick={() => toggleRepair(svc)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      selectedRepairs[svc._id]
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {svc.name} · {formatPrice(svc.charge)}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Spare parts */}
          <section className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-700">Spare Parts Used</h2>
            {spareMaster.length === 0 ? (
              <p className="text-sm text-slate-400">No spare parts configured.</p>
            ) : (
              <div className="space-y-2">
                {spareMaster.map((part) => {
                  const sel = selectedSpares[part._id];
                  return (
                    <div key={part._id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5">
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={!!sel} onChange={() => toggleSpare(part)} />
                        {part.name} <span className="text-slate-400">({formatPrice(part.price)})</span>
                      </label>
                      {sel && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Qty</span>
                          <input
                            type="number"
                            min={1}
                            value={sel.quantity}
                            onChange={(e) => setSpareQty(part._id, e.target.value)}
                            className="input w-20 py-1"
                          />
                          <span className="w-20 text-right text-sm font-medium text-slate-700">
                            {formatPrice(part.price * sel.quantity)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Notes + images */}
          <section className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-700">Notes &amp; Photos</h2>
            <label className="label">Work notes</label>
            <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What was done, observations, warranty info..." />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Before photos (one URL per line)</label>
                <textarea className="input" rows={2} value={beforeImages} onChange={(e) => setBeforeImages(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="label">After photos <span className="text-red-500">*</span> (required, one URL per line)</label>
                <textarea
                  className={`input ${toLines(afterImages).length === 0 ? 'border-amber-300' : ''}`}
                  rows={2}
                  value={afterImages}
                  onChange={(e) => setAfterImages(e.target.value)}
                  placeholder="https://..."
                />
                <p className="mt-1 text-xs text-slate-400">At least one after-work photo is required to complete the job.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Billing summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4 p-5">
            <h2 className="mb-3 font-semibold text-slate-700">Bill Summary</h2>
            <div className="space-y-1.5 text-sm">
              <Row label="Visiting Charge" value={formatPrice(bill.visitingCharge)} />
              <Row label="Service Charges" value={formatPrice(bill.serviceCharge)} />
              <Row label="Spare Charges" value={formatPrice(bill.spareCharge)} />
              <Row label={`Tax (${bill.taxRate}%)`} value={formatPrice(bill.tax)} />
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-800">Grand Total</span>
                <span className="text-lg font-bold text-slate-900">{formatPrice(bill.total)}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || toLines(afterImages).length === 0}
              className="btn-primary mt-4 w-full"
            >
              {submitting ? 'Submitting...' : 'Mark Completed & Generate Bill'}
            </button>
            {toLines(afterImages).length === 0 && (
              <p className="mt-2 text-center text-xs text-amber-600">Add at least one after-work photo to enable completion.</p>
            )}
            <p className="mt-2 text-center text-xs text-slate-400">The customer pays this bill online after completion.</p>
          </div>
        </div>
      </form>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between text-slate-600">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default CompleteService;
