const StatCard = ({ label, value, accent = 'brand', icon }) => {
  const accents = {
    brand: 'bg-brand-50 text-brand-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-100 text-slate-700',
    indigo: 'bg-indigo-50 text-indigo-700',
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      {icon && <span className={`grid h-11 w-11 place-items-center rounded-lg text-xl ${accents[accent]}`}>{icon}</span>}
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
