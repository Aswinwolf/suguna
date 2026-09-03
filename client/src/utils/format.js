export const formatPrice = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (d) =>
  new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
