import { useEffect, useState } from 'react';
import { productApi, categoryApi, subCategoryApi } from '../../services/endpoints.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';

const emptyForm = {
  productName: '',
  productCode: '',
  categoryId: '',
  subCategoryId: '',
  brand: '',
  mrp: '',
  price: '',
  description: '',
  image: '',
};

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([productApi.list(), categoryApi.list()])
      .then(([p, c]) => {
        setProducts(p.data);
        setCategories(c.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // When category changes in the form, fetch matching subcategories
  useEffect(() => {
    if (!form.categoryId) {
      setSubCategories([]);
      return;
    }
    subCategoryApi
      .list({ categoryId: form.categoryId })
      .then((r) => {
        setSubCategories(r.data);
        // Auto-select first subcategory if current selection no longer valid
        if (r.data.length > 0) {
          const stillValid = r.data.some((sc) => sc._id === form.subCategoryId);
          if (!stillValid) {
            setForm((prev) => ({ ...prev, subCategoryId: r.data[0]._id }));
          }
        } else {
          setForm((prev) => ({ ...prev, subCategoryId: '' }));
        }
      })
      .catch(() => setSubCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.categoryId]);

  const openCreate = () => {
    const defaultCat = categories[0]?._id || '';
    setForm({ ...emptyForm, categoryId: defaultCat });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setForm({
      productName: p.productName,
      productCode: p.productCode,
      categoryId: p.categoryId?._id || p.categoryId || '',
      subCategoryId: p.subCategoryId?._id || p.subCategoryId || '',
      brand: p.brand,
      mrp: p.mrp ?? '',
      price: p.price,
      description: p.description || '',
      image: p.image || '',
    });
    setEditingId(p._id);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        ...form,
        mrp: Number(form.mrp),
        price: Number(form.price),
      };
      if (editingId) {
        await productApi.update(editingId, payload);
        setMsg({ type: 'success', text: 'Product updated.' });
      } else {
        await productApi.create(payload);
        setMsg({ type: 'success', text: 'Product created.' });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.productName}"?`)) return;
    try {
      await productApi.remove(p._id);
      setMsg({ type: 'success', text: 'Product deleted.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Delete failed.' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Product Management</h1>
        <button onClick={openCreate} className="btn-primary" disabled={categories.length === 0}>
          + Add Product
        </button>
      </div>
      {categories.length === 0 && (
        <p className="mt-2 text-sm text-amber-600">Create a category first before adding products.</p>
      )}

      {msg && (
        <div className="mt-4">
          <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />
        </div>
      )}

      <div className="card mt-6 overflow-x-auto">
        {loading ? (
          <Loader label="Loading products..." />
        ) : products.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No products yet.</p>
        ) : (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">SubCategory</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">MRP</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image && (
                        <img
                          src={p.image}
                          alt=""
                          onError={(e) => { e.currentTarget.src = 'https://placehold.co/80x80?text=?'; }}
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <span className="font-medium text-slate-700 line-clamp-1">{p.productName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.productCode}</td>
                  <td className="px-4 py-3">{p.categoryId?.categoryName || '—'}</td>
                  <td className="px-4 py-3">{p.subCategoryId?.subCategoryName || '—'}</td>
                  <td className="px-4 py-3">{p.brand}</td>
                  <td className="px-4 py-3 text-slate-400 line-through">{formatPrice(p.mrp)}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(p)} className="mr-3 text-sm font-medium text-brand-700 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p)} className="text-sm font-medium text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-800">
              {editingId ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {/* Product Name */}
              <div>
                <label className="label">Product Name</label>
                <input name="productName" value={form.productName} onChange={handleChange} required className="input" />
              </div>

              {/* Product Code + Brand */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Product Code</label>
                  <input name="productCode" value={form.productCode} onChange={handleChange} required className="input" />
                </div>
                <div>
                  <label className="label">Brand</label>
                  <input name="brand" value={form.brand} onChange={handleChange} required className="input" />
                </div>
              </div>

              {/* Category → SubCategory (cascading) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select name="categoryId" value={form.categoryId} onChange={handleChange} required className="input">
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.categoryName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">SubCategory</label>
                  <select
                    name="subCategoryId"
                    value={form.subCategoryId}
                    onChange={handleChange}
                    required
                    className="input"
                    disabled={!form.categoryId || subCategories.length === 0}
                  >
                    <option value="">
                      {!form.categoryId
                        ? 'Select category first'
                        : subCategories.length === 0
                        ? 'No subcategories'
                        : 'Select subcategory'}
                    </option>
                    {subCategories.map((sc) => (
                      <option key={sc._id} value={sc._id}>{sc.subCategoryName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* MRP + Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">MRP (₹)</label>
                  <input name="mrp" type="number" min="0" step="0.01" value={form.mrp} onChange={handleChange} required className="input" />
                </div>
                <div>
                  <label className="label">Price (₹)</label>
                  <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required className="input" />
                </div>
              </div>

              {/* Image URL (optional) */}
              <div>
                <label className="label">Image URL <span className="text-slate-400">(optional)</span></label>
                <input name="image" value={form.image} onChange={handleChange} className="input" placeholder="https://..." />
              </div>

              {/* Description (optional) */}
              <div>
                <label className="label">Description <span className="text-slate-400">(optional)</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
