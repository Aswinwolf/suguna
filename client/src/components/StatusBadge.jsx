const map = {
  // Order statuses
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  Shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  Delivered: 'bg-green-50 text-green-700 border-green-200',

  // Service booking statuses
  Assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Accepted: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',

  // Payment statuses
  Paid: 'bg-green-50 text-green-700 border-green-200',
  Failed: 'bg-red-50 text-red-700 border-red-200',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
    {status}
  </span>
);

export default StatusBadge;
