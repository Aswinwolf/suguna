import { useEffect, useState } from 'react';
import { repairServiceApi, serviceCategoryApi } from '../../services/endpoints.js';
import { formatPrice } from '../../utils/format.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';

const emptyForm = { name: '', charge: '', serviceCategory: '' };

const RepairServiceManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    repairServiceApi.list({ all: true }).then((r) => setItems(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    serviceCategoryApi.list({ all: true }).then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const resetForm = () => { setForm(emptyForm); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setMsg(null);
    const payload = {
      name: form.name.trim(),
      charge: Number(form.charge) || 0,
      serviceCategory: form.serviceCategory || null,
    };
    try {
      if (editing) {
        await repairServiceApi.update(editing._id, payload);
        setMsg({ type: 'success', text: 'Repair service updated.' });
      } else {
        await repairServiceApi.create(payload);
        setMsg({ type: 'success', text: 'Repair service added.' });
      }
      resetForm();
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (r) => {
    setEditing(r);
    setForm({ name: r.name, charge: String(r.charge), serviceCategory: r.serviceCategory?._id || '' });
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete "${r.name}"?`)) return;
    try {
      await repairServiceApi.remove(r._id);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Delete failed.' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Repair Services Master</h1>
      <p className="mt-1 text-sm text-slate-500">Labour items technicians can bill after a job.</p>

      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      <form onSubmit={handleSubmit} className="card mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">{editing ? 'Edit Service' : 'Service Name'}</label>
          <input value={form.name} onChange={set('name')} className="input" placeholder="e.g. Gas Refill" />
        </div>
        <div className="sm:w-32">
          <label className="label">Charge (₹)</label>
          <input type="number" value={form.charge} onChange={set('charge')} className="input" placeholder="1500" />
        </div>
        <div className="sm:w-48">
          <label className="label">Category (optional)</label>
          <select value={form.serviceCategory} onChange={set('serviceCategory')} className="input">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">{editing ? 'Update' : 'Add'}</button>
          {editing && <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>}
        </div>
      </form>

      <div className="card mt-6 overflow-x-auto">
        {loading ? (
          <Loader label="Loading..." />
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No repair services yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Charge</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-3 font-medium text-slate-700">{r.name}</td>
                  <td className="px-4 py-3 text-slate-500">{r.serviceCategory?.name || 'All'}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatPrice(r.charge)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(r)} className="mr-3 font-medium text-brand-700 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(r)} className="font-medium text-red-600 hover:underline">Delete</button>
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

export default RepairServiceManagement;
