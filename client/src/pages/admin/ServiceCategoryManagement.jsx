import { useEffect, useState } from 'react';
import { serviceCategoryApi } from '../../services/endpoints.js';
import { formatPrice } from '../../utils/format.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';

const emptyForm = { name: '', icon: '', visitingCharge: '', description: '', issues: '' };

const ServiceCategoryManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    serviceCategoryApi.list({ all: true }).then((r) => setItems(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setMsg(null);
    const payload = {
      name: form.name.trim(),
      icon: form.icon.trim(),
      visitingCharge: Number(form.visitingCharge) || 0,
      description: form.description.trim(),
      issues: form.issues.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await serviceCategoryApi.update(editing._id, payload);
        setMsg({ type: 'success', text: 'Service category updated.' });
      } else {
        await serviceCategoryApi.create(payload);
        setMsg({ type: 'success', text: 'Service category created.' });
      }
      resetForm();
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      icon: c.icon || '',
      visitingCharge: String(c.visitingCharge ?? ''),
      description: c.description || '',
      issues: (c.issues || []).join(', '),
    });
  };

  const handleToggle = async (c) => {
    try {
      await serviceCategoryApi.toggle(c._id);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not update status.' });
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete service category "${c.name}"?`)) return;
    try {
      await serviceCategoryApi.remove(c._id);
      setMsg({ type: 'success', text: 'Service category deleted.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Delete failed.' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Service Categories</h1>

      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      <form onSubmit={handleSubmit} className="card mt-4 p-4">
        <h2 className="mb-3 font-semibold text-slate-700">{editing ? 'Edit Category' : 'New Category'}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input value={form.name} onChange={set('name')} className="input" placeholder="e.g. AC Repair" />
          </div>
          <div>
            <label className="label">Icon (emoji)</label>
            <input value={form.icon} onChange={set('icon')} className="input" placeholder="❄️" />
          </div>
          <div>
            <label className="label">Visiting Charge (₹)</label>
            <input type="number" value={form.visitingCharge} onChange={set('visitingCharge')} className="input" placeholder="199" />
          </div>
          <div>
            <label className="label">Common Issues (comma-separated)</label>
            <input value={form.issues} onChange={set('issues')} className="input" placeholder="Not cooling, Gas refill" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <input value={form.description} onChange={set('description')} className="input" placeholder="Short description" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">{editing ? 'Update' : 'Add'}</button>
          {editing && <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>}
        </div>
      </form>

      <div className="card mt-6 overflow-x-auto">
        {loading ? (
          <Loader label="Loading..." />
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No service categories yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Visiting</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3">
                    <span className="mr-2">{c.icon}</span>
                    <span className="font-medium text-slate-700">{c.name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatPrice(c.visitingCharge)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(c)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        c.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(c)} className="mr-3 font-medium text-brand-700 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(c)} className="font-medium text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ServiceCategoryManagement;
