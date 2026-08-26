const styles = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  info: 'bg-brand-50 border-brand-200 text-brand-700',
};

const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;
  return (
    <div className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="font-bold opacity-60 hover:opacity-100" aria-label="Dismiss">×</button>
      )}
    </div>
  );
};

export default Alert;
