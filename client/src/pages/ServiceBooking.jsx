import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { serviceCategoryApi, bookingApi } from '../services/endpoints.js';
import { useAddress } from '../context/AddressContext.jsx';
import AddressFormFields, { emptyAddress } from '../components/AddressFormFields.jsx';
import { formatPrice } from '../utils/format.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';

const TIME_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
  '05:00 PM - 07:00 PM',
];

// Minimum bookable date = today (YYYY-MM-DD for the date input).
const todayStr = new Date().toISOString().split('T')[0];

const ServiceBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addresses, defaultAddress, addAddress } = useAddress();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [issue, setIssue] = useState('');
  const [addressId, setAddressId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState('');
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Inline "add address" form.
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState(emptyAddress);
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    serviceCategoryApi
      .get(id)
      .then((r) => {
        setCategory(r.data);
        if (r.data.issues?.length) setIssue(r.data.issues[0]);
      })
      .catch(() => setMsg({ type: 'error', text: 'Service not found.' }))
      .finally(() => setLoading(false));
  }, [id]);

  // Preselect the default address once addresses load.
  useEffect(() => {
    if (!addressId && defaultAddress) setAddressId(defaultAddress._id);
  }, [defaultAddress, addressId]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a._id === addressId),
    [addresses, addressId]
  );

  const onAddrChange = (key, value) => setAddrForm((f) => ({ ...f, [key]: value }));

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    setMsg(null);
    try {
      const created = await addAddress(addrForm);
      setAddressId(created._id);
      setShowAddrForm(false);
      setAddrForm(emptyAddress);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not save address.' });
    } finally {
      setSavingAddr(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!issue.trim()) return setMsg({ type: 'error', text: 'Please select an issue type.' });
    if (!addressId) return setMsg({ type: 'error', text: 'Please choose a service address.' });
    if (!timeSlot) return setMsg({ type: 'error', text: 'Please choose a time slot.' });

    setSubmitting(true);
    try {
      await bookingApi.create({
        serviceCategory: id,
        issue: issue.trim(),
        addressId,
        scheduledDate,
        timeSlot,
      });
      navigate('/bookings', { state: { justBooked: true } });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not place the booking.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading service..." />;
  if (!category) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Alert type="error" message="This service is not available." />
        <Link to="/services" className="btn-primary mt-6">Back to Services</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/services" className="text-sm text-slate-500 hover:text-brand-700">← All services</Link>

      <div className="card mt-3 flex items-center gap-4 p-5">
        <span className="grid h-14 w-14 place-items-center rounded-xl bg-brand-50 text-3xl">{category.icon || '🛠️'}</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{category.name}</h1>
          <p className="text-sm text-slate-500">Visiting charge {formatPrice(category.visitingCharge)} (adjusted in final bill)</p>
        </div>
      </div>

      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Step 1 — Issue */}
        <section className="card p-5">
          <h2 className="mb-3 font-semibold text-slate-700">1. What's the issue?</h2>
          {category.issues?.length ? (
            <div className="flex flex-wrap gap-2">
              {category.issues.map((iss) => (
                <button
                  type="button"
                  key={iss}
                  onClick={() => setIssue(iss)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    issue === iss
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {iss}
                </button>
              ))}
            </div>
          ) : null}
          <input
            className="input mt-3"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            placeholder="Describe the issue"
          />
        </section>

        {/* Step 2 — Address */}
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">2. Service address</h2>
            <button type="button" onClick={() => setShowAddrForm((s) => !s)} className="text-sm font-medium text-brand-700 hover:underline">
              {showAddrForm ? 'Cancel' : '+ Add new'}
            </button>
          </div>

          {addresses.length === 0 && !showAddrForm && (
            <p className="text-sm text-slate-500">No saved address. Add one to continue.</p>
          )}

          {!showAddrForm && addresses.length > 0 && (
            <div className="space-y-2">
              {addresses.map((a) => (
                <label
                  key={a._id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                    addressId === a._id ? 'border-brand-500 bg-brand-50' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={addressId === a._id}
                    onChange={() => setAddressId(a._id)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    <span className="font-semibold text-slate-800">{a.fullName}</span>{' '}
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{a.addressType}</span>
                    {a.isDefault && <span className="ml-1 text-xs font-medium text-brand-700">• Default</span>}
                    <span className="block text-slate-600">
                      {a.houseNo}, {a.street}, {a.area}, {a.city} - {a.pincode} · {a.mobile}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {showAddrForm && (
            <div>
              <AddressFormFields form={addrForm} onChange={onAddrChange} />
              <button type="button" onClick={handleAddAddress} disabled={savingAddr} className="btn-primary mt-3">
                {savingAddr ? 'Saving...' : 'Save & use this address'}
              </button>
            </div>
          )}
        </section>

        {/* Step 3 — Date & slot */}
        <section className="card p-5">
          <h2 className="mb-3 font-semibold text-slate-700">3. Preferred date &amp; time</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                min={todayStr}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Time Slot</label>
              <select className="input" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                <option value="">Select a slot</option>
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {selectedAddress ? `Delivering to ${selectedAddress.area}, ${selectedAddress.city}` : 'Choose an address'}
          </p>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Placing...' : 'Place Service Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceBooking;
