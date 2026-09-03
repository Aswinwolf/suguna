import { useEffect, useState } from 'react';
import { sparePartApi, serviceCategoryApi } from '../../services/endpoints.js';
import { formatPrice } from '../../utils/format.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';

const emptyForm = { name: '', price: '', serviceCategory: '' };

const SparePartManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    sparePartApi.list({ all: true }).then((r) => setItems(r.data)).finally(() => setLoading(false));
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
      price: Number(form.price) || 0,
      serviceCategory: form.serviceCategory || null,
    };
    try {
      if (editing) {
        await sparePartApi.update(editing._id, payload);
        setMsg({ type: 'success', text: 'Spare part updated.' });
      } else {
        await sparePartApi.create(payload);
        setMsg({ type: 'success', text: 'Spare part added.' });
      }
      resetForm();
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), serviceCategory: p.serviceCategory?._id || '' });
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await sparePartApi.remove(p._id);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Delete failed.' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Spare Parts Master</h1>
      <p className="mt-1 text-sm text-slate-500">Parts technicians can add to a job, priced per unit.</p>

      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      <form onSubmit={handleSubmit} className="card mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">{editing ? 'Edit Part' : 'Part Name'}</label>
          <input value={form.name} onChange={set('name')} className="input" placeholder="e.g. Compressor" />
        </div>
        <div className="sm:w-32">
          <label className="label">Price (₹)</label>
          <input type="number" value={form.price} onChange={set('price')} className="input" placeholder="4500" />
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
          <p className="p-8 text-center text-slate-500">No spare parts yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Part</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3 font-medium text-slate-700">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.serviceCategory?.name || 'All'}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(p)} className="mr-3 font-medium text-brand-700 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p)} className="font-medium text-red-600 hover:underline">Delete</button>
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

export default SparePartManagement;
