import { useEffect, useState } from 'react';
import { subCategoryApi, categoryApi } from '../../services/endpoints.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';

const SubCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load categories once on mount
  useEffect(() => {
    categoryApi.list().then((r) => {
      setCategories(r.data);
      if (r.data.length > 0) setSelectedCategoryId(r.data[0]._id);
    });
  }, []);

  // Re-load subcategories whenever the selected category changes
  const load = (catId) => {
    const id = catId ?? selectedCategoryId;
    if (!id) return;
    setLoading(true);
    subCategoryApi
      .list({ categoryId: id })
      .then((r) => setSubCategories(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedCategoryId) load(selectedCategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

  const resetForm = () => {
    setName('');
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedCategoryId) return;
    setSaving(true);
    setMsg(null);
    try {
      if (editing) {
        await subCategoryApi.update(editing._id, {
          subCategoryName: name.trim(),
          categoryId: selectedCategoryId,
        });
        setMsg({ type: 'success', text: 'SubCategory updated.' });
      } else {
        await subCategoryApi.create({
          subCategoryName: name.trim(),
          categoryId: selectedCategoryId,
        });
        setMsg({ type: 'success', text: 'SubCategory created.' });
      }
      resetForm();
      load(selectedCategoryId);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (sc) => {
    setEditing(sc);
    setName(sc.subCategoryName);
    setSelectedCategoryId(sc.categoryId?._id || sc.categoryId || selectedCategoryId);
  };

  const handleDelete = async (sc) => {
    if (!window.confirm(`Delete subcategory "${sc.subCategoryName}"?`)) return;
    try {
      await subCategoryApi.remove(sc._id);
      setMsg({ type: 'success', text: 'SubCategory deleted.' });
      load(selectedCategoryId);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Delete failed.' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">SubCategory Management</h1>

      {msg && (
        <div className="mt-4">
          <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />
        </div>
      )}

      {categories.length === 0 ? (
        <p className="mt-4 text-sm text-amber-600">Create a category first before adding subcategories.</p>
      ) : (
        <>
          {/* Category Filter */}
          <div className="card mt-4 p-4">
            <label className="label" htmlFor="filterCat">
              Filter by Category
            </label>
            <select
              id="filterCat"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="input mt-1 max-w-xs"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Create / Edit Form */}
          <form onSubmit={handleSubmit} className="card mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="label" htmlFor="subcat">
                {editing ? 'Edit SubCategory' : 'New SubCategory'}
              </label>
              <input
                id="subcat"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="e.g. Front Load Washing Machines"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {editing ? 'Update' : 'Add'}
              </button>
              {editing && (
                <button type="button" onClick={resetForm} className="btn-outline">
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* SubCategories Table */}
          <div className="card mt-6 overflow-hidden">
            {loading ? (
              <Loader label="Loading subcategories..." />
            ) : subCategories.length === 0 ? (
              <p className="p-8 text-center text-slate-500">
                No subcategories yet for this category.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">SubCategory Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subCategories.map((sc) => (
                    <tr key={sc._id}>
                      <td className="px-4 py-3 font-medium text-slate-700">{sc.subCategoryName}</td>
                      <td className="px-4 py-3 text-slate-500">{sc.categoryId?.categoryName || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(sc)}
                          className="mr-3 text-sm font-medium text-brand-700 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sc)}
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SubCategoryManagement;
