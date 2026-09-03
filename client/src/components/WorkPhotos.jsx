import { useState } from 'react';

// Renders a technician's proof-of-work: notes + before/after photo thumbnails.
// Collapsible so booking lists stay compact. Returns null when there's nothing.
const Thumb = ({ src }) => (
  <a href={src} target="_blank" rel="noreferrer" className="block">
    <img
      src={src}
      alt="work"
      onError={(e) => { e.currentTarget.src = 'https://placehold.co/160x160?text=Photo'; }}
      className="h-20 w-20 rounded-lg border border-slate-200 object-cover transition hover:opacity-80"
    />
  </a>
);

const Group = ({ label, images }) => {
  if (!images || images.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {images.map((src, i) => <Thumb key={i} src={src} />)}
      </div>
    </div>
  );
};

const WorkPhotos = ({ booking, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const before = booking.beforeImages || [];
  const after = booking.afterImages || [];
  const hasContent = before.length > 0 || after.length > 0 || booking.notes;

  if (!hasContent) return null;

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-sm font-medium text-brand-700 hover:underline"
      >
        {open ? 'Hide work proof ▲' : `View work proof (${after.length} after, ${before.length} before) ▼`}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {booking.notes && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Technician notes</p>
              <p className="text-sm text-slate-600">{booking.notes}</p>
            </div>
          )}
          <Group label="Before" images={before} />
          <Group label="After" images={after} />
        </div>
      )}
    </div>
  );
};

export default WorkPhotos;
