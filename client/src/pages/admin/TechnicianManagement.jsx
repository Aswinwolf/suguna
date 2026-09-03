import { useEffect, useState } from 'react';
import { technicianApi } from '../../services/endpoints.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';

const emptyForm = { name: '', email: '', password: '', phone: '', specializations: '' };

const TechnicianManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    technicianApi.list().then((r) => setItems(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const resetForm = () => { setForm(emptyForm); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const specializations = form.specializations.split(',').map((s) => s.trim()).filter(Boolean);
    try {
      if (editing) {
        const payload = { name: form.name, phone: form.phone, specializations };
        if (form.password) payload.password = form.password;
        await technicianApi.update(editing._id, payload);
        setMsg({ type: 'success', text: 'Technician updated.' });
      } else {
        await technicianApi.create({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          specializations,
        });
        setMsg({ type: 'success', text: 'Technician created.' });
      }
      resetForm();
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name,
      email: t.email,
      password: '',
      phone: t.phone || '',
      specializations: (t.specializations || []).join(', '),
    });
  };

  const toggleActive = async (t) => {
    try {
      await technicianApi.update(t._id, { isActive: !t.isActive });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not update.' });
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete technician "${t.name}"?`)) return;
    try {
      await technicianApi.remove(t._id);
      setMsg({ type: 'success', text: 'Technician removed.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Delete failed.' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Technicians</h1>

      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      <form onSubmit={handleSubmit} className="card mt-4 p-4">
        <h2 className="mb-3 font-semibold text-slate-700">{editing ? `Edit ${editing.name}` : 'New Technician'}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input value={form.name} onChange={set('name')} className="input" placeholder="Full name" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="tech@example.com" disabled={!!editing} required={!editing} />
          </div>
          <div>
            <label className="label">{editing ? 'Reset Password (optional)' : 'Password'}</label>
            <input type="password" value={form.password} onChange={set('password')} className="input" placeholder="Min 6 characters" required={!editing} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input value={form.phone} onChange={set('phone')} className="input" placeholder="10-digit mobile" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Specializations (comma-separated)</label>
            <input value={form.specializations} onChange={set('specializations')} className="input" placeholder="AC Repair, TV Repair" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>}
        </div>
      </form>

      <div className="card mt-6 overflow-x-auto">
        {loading ? (
          <Loader label="Loading technicians..." />
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No technicians yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-center">Active</th>
                <th className="px-4 py-3 text-center">Completed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((t) => (
                <tr key={t._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{t.name}</p>
                    <p className="text-xs text-slate-400">{(t.specializations || []).join(', ') || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    <p>{t.email}</p>
                    <p className="text-xs">{t.phone || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{t.activeJobs}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{t.completedJobs}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(t)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        t.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {t.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(t)} className="mr-3 font-medium text-brand-700 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(t)} className="font-medium text-red-600 hover:underline">Delete</button>
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

export default TechnicianManagement;
