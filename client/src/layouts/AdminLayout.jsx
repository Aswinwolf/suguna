import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const nav = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/subcategories', label: 'SubCategories' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-lg font-black text-white">S</span>
            <span className="font-extrabold text-slate-800">Admin Panel</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-slate-500 hover:text-brand-700">View Store</Link>
            <span className="hidden text-sm text-slate-400 sm:inline">|</span>
            <span className="hidden text-sm text-slate-600 sm:inline">{user?.name}</span>
            <button onClick={logout} className="btn-outline">Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row">
        <aside className="md:w-56 md:shrink-0">
          <nav className="card flex gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>{n.label}</NavLink>
            ))}
          </nav>
        </aside>
        <section className="min-w-0 flex-1">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default AdminLayout;
