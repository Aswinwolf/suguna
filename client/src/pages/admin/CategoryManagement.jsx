import { useEffect, useState } from 'react';
import { categoryApi } from '../../services/endpoints.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    categoryApi.list().then((r) => setCategories(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resetForm = () => {
    setName('');
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      if (editing) {
        await categoryApi.update(editing._id, { categoryName: name.trim() });
        setMsg({ type: 'success', text: 'Category updated.' });
      } else {
        await categoryApi.create({ categoryName: name.trim() });
        setMsg({ type: 'success', text: 'Category created.' });
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
    setName(c.categoryName);
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete category "${c.categoryName}"?`)) return;
    try {
      await categoryApi.remove(c._id);
      setMsg({ type: 'success', text: 'Category deleted.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Delete failed.' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Category Management</h1>

      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      <form onSubmit={handleSubmit} className="card mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label" htmlFor="cat">{editing ? 'Edit Category' : 'New Category'}</label>
          <input id="cat" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g. Refrigerators" />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">{editing ? 'Update' : 'Add'}</button>
          {editing && <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>}
        </div>
      </form>

      <div className="card mt-6 overflow-hidden">
        {loading ? (
          <Loader label="Loading categories..." />
        ) : categories.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No categories yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3 font-medium text-slate-700">{c.categoryName}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(c)} className="mr-3 text-sm font-medium text-brand-700 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(c)} className="text-sm font-medium text-red-600 hover:underline">Delete</button>
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

export default CategoryManagement;
