import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { invoiceApi } from '../services/endpoints.js';
import { formatPrice, formatDate } from '../utils/format.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const Invoice = () => {
  const { bookingId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    invoiceApi
      .byBooking(bookingId)
      .then((r) => setData(r.data))
      .catch((err) => setError(err.response?.data?.message || 'Invoice not available.'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <Loader label="Loading invoice..." />;

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Alert type="error" message={error} />
        <Link to="/bookings" className="btn-primary mt-6">Back to My Services</Link>
      </div>
    );
  }

  const { invoice, booking } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Toolbar (not printed) */}
        <div className="no-print mb-4 flex items-center justify-between">
          <Link to="/bookings" className="text-sm text-slate-500 hover:text-brand-700">← Back to My Services</Link>
          <button onClick={() => window.print()} className="btn-primary">Download / Print PDF</button>
        </div>

        <div className="print-area card p-8">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-lg font-black text-white">S</span>
                <span className="text-xl font-extrabold text-slate-800">Suguna Appliances</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Doorstep Appliance Repair &amp; Service</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-slate-800">INVOICE</h1>
              <p className="mt-1 font-mono text-sm text-slate-600">{invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-400">{formatDate(invoice.issuedAt || invoice.createdAt)}</p>
              <div className="mt-2"><StatusBadge status={invoice.paymentStatus} /></div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Bill To</p>
              <p className="mt-1 font-semibold text-slate-800">{invoice.billTo?.name}</p>
              <p className="text-sm text-slate-600">{invoice.billTo?.mobile}</p>
              <p className="text-sm text-slate-600">{invoice.billTo?.addressLine}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase text-slate-400">Service Details</p>
              <p className="mt-1 text-sm text-slate-700">Booking: <span className="font-mono">{booking.bookingNumber}</span></p>
              <p className="text-sm text-slate-700">Service: {booking.categoryName}</p>
              <p className="text-sm text-slate-700">Issue: {booking.issue}</p>
              <p className="text-sm text-slate-700">Date: {formatDate(booking.scheduledDate)}</p>
            </div>
          </div>

          {/* Line items */}
          <table className="w-full text-left text-sm">
            <thead className="border-y border-slate-200 text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Description</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 text-slate-700">
                    {item.description}
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">{item.kind}</span>
                  </td>
                  <td className="py-2 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-2 text-right text-slate-600">{formatPrice(item.unitPrice)}</td>
                  <td className="py-2 text-right font-medium text-slate-700">{formatPrice(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-1 text-sm">
              {invoice.visitingCharge > 0 && (
                <Row label="Visiting Charge" value={formatPrice(invoice.visitingCharge)} />
              )}
              <Row label="Service Charges" value={formatPrice(invoice.serviceCharge)} />
              <Row label="Spare Charges" value={formatPrice(invoice.spareCharge)} />
              <Row label={`Tax (${invoice.taxRate}%)`} value={formatPrice(invoice.tax)} />
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-800">Grand Total</span>
                <span className="text-lg font-bold text-slate-900">{formatPrice(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>

          <p className="mt-8 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
            Thank you for choosing Suguna Home Appliances. This is a computer-generated invoice.
          </p>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between text-slate-600">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default Invoice;
