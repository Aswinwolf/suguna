import { useState } from 'react';
import { useAddress } from '../context/AddressContext.jsx';
import AddressFormFields, { emptyAddress } from '../components/AddressFormFields.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';

const AddressManagement = () => {
  const { addresses, loading, addAddress, updateAddress, removeAddress, setDefault } = useAddress();
  const [form, setForm] = useState(emptyAddress);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const onChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const openNew = () => {
    setForm(emptyAddress);
    setEditing(null);
    setShowForm(true);
    setMsg(null);
  };

  const openEdit = (addr) => {
    setForm({ ...emptyAddress, ...addr });
    setEditing(addr);
    setShowForm(true);
    setMsg(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyAddress);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      if (editing) {
        await updateAddress(editing._id, form);
        setMsg({ type: 'success', text: 'Address updated.' });
      } else {
        await addAddress(form);
        setMsg({ type: 'success', text: 'Address added.' });
      }
      closeForm();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not save address.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addr) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await removeAddress(addr._id);
      setMsg({ type: 'success', text: 'Address deleted.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Delete failed.' });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">My Addresses</h1>
        {!showForm && <button onClick={openNew} className="btn-primary">+ Add Address</button>}
      </div>

      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="card mt-4 p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">{editing ? 'Edit Address' : 'New Address'}</h2>
          <AddressFormFields form={form} onChange={onChange} />
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Address'}</button>
            <button type="button" onClick={closeForm} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <Loader label="Loading addresses..." />
      ) : addresses.length === 0 && !showForm ? (
        <div className="card mt-6 p-12 text-center text-slate-500">
          You have no saved addresses. Add one to book services and place orders faster.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr._id} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{addr.addressType}</span>
                {addr.isDefault && (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">Default</span>
                )}
              </div>
              <p className="mt-2 font-semibold text-slate-800">{addr.fullName}</p>
              <p className="text-sm text-slate-500">{addr.mobile}</p>
              <p className="mt-1 text-sm text-slate-600">
                {addr.houseNo}, {addr.street}, {addr.area}
                {addr.landmark ? `, near ${addr.landmark}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-sm font-medium">
                <button onClick={() => openEdit(addr)} className="text-brand-700 hover:underline">Edit</button>
                <button onClick={() => handleDelete(addr)} className="text-red-600 hover:underline">Delete</button>
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr._id)} className="text-slate-600 hover:underline">Set as default</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManagement;
