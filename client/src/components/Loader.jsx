const Loader = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
    <p className="mt-3 text-sm">{label}</p>
  </div>
);

export default Loader;
