import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Alert from '../../components/Alert.jsx';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const profile = await login(form);
      if (profile.role !== 'admin') {
        setError('This account does not have admin access.');
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-lg font-black text-white">S</span>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Admin Portal</h1>
            <p className="text-xs text-slate-500">Suguna Home Appliances</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          <div>
            <label className="label" htmlFor="email">Admin Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className="input" placeholder="admin@suguna.com" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn bg-slate-900 text-white hover:bg-slate-800 w-full">
            {loading ? 'Signing in...' : 'Sign in to Admin'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          <Link to="/" className="font-semibold text-brand-700 hover:underline">← Back to store</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
