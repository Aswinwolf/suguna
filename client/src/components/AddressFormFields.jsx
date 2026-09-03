// Shared set of address inputs, driven by a form object + field setter.
// Reused by the Address Management page and the booking checkout flow.
const AddressFormFields = ({ form, onChange }) => {
  const set = (key) => (e) => onChange(key, e.target.value);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="label">Full Name</label>
        <input className="input" value={form.fullName} onChange={set('fullName')} placeholder="e.g. Ramesh Kumar" />
      </div>
      <div>
        <label className="label">Mobile Number</label>
        <input className="input" value={form.mobile} onChange={set('mobile')} placeholder="10-digit mobile" maxLength={10} />
      </div>
      <div>
        <label className="label">House No.</label>
        <input className="input" value={form.houseNo} onChange={set('houseNo')} placeholder="Flat / House no." />
      </div>
      <div>
        <label className="label">Street</label>
        <input className="input" value={form.street} onChange={set('street')} placeholder="Street / Road" />
      </div>
      <div>
        <label className="label">Area</label>
        <input className="input" value={form.area} onChange={set('area')} placeholder="Locality / Area" />
      </div>
      <div>
        <label className="label">Landmark</label>
        <input className="input" value={form.landmark} onChange={set('landmark')} placeholder="Nearby landmark (optional)" />
      </div>
      <div>
        <label className="label">City</label>
        {/* Service area is fixed to Erode — city is locked. */}
        <input className="input bg-slate-100 text-slate-500" value="Erode" readOnly disabled />
      </div>
      <div>
        <label className="label">State</label>
        <input className="input bg-slate-100 text-slate-500" value="Tamil Nadu" readOnly disabled />
      </div>
      <div>
        <label className="label">Pincode</label>
        <input className="input" value={form.pincode} onChange={set('pincode')} placeholder="Erode pincode e.g. 638001" maxLength={6} inputMode="numeric" />
        <p className="mt-1 text-xs text-slate-400">We currently serve Erode only (pincode starts with 638).</p>
      </div>
      <div>
        <label className="label">Address Type</label>
        <select className="input" value={form.addressType} onChange={set('addressType')}>
          <option value="Home">Home</option>
          <option value="Office">Office</option>
        </select>
      </div>
    </div>
  );
};

// City/State are fixed to the Erode service area and cannot be changed by the user.
export const emptyAddress = {
  fullName: '',
  mobile: '',
  houseNo: '',
  street: '',
  area: '',
  city: 'Erode',
  state: 'Tamil Nadu',
  pincode: '',
  landmark: '',
  addressType: 'Home',
};

export default AddressFormFields;
