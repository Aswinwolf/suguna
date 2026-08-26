const map = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  Shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  Delivered: 'bg-green-50 text-green-700 border-green-200',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
    {status}
  </span>
);

export default StatusBadge;
