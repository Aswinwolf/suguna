import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isTechnician, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition ${
      isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-brand-700 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-lg font-black text-white">S</span>
          <span className="text-lg font-extrabold tracking-tight text-slate-800">
            Suguna <span className="text-brand-600">Appliances</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/products" className={linkClass}>Products</NavLink>
          <NavLink to="/services" className={linkClass}>Services</NavLink>
          {isAuthenticated && !isAdmin && !isTechnician && <NavLink to="/orders" className={linkClass}>My Orders</NavLink>}
          {isAuthenticated && !isAdmin && !isTechnician && <NavLink to="/bookings" className={linkClass}>My Services</NavLink>}
          {isTechnician && <NavLink to="/technician" className={linkClass}>Technician</NavLink>}
          {isAdmin && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!isAdmin && !isTechnician && (
            <Link to="/cart" className="relative rounded-lg p-2 hover:bg-slate-100" aria-label="Cart">
              <CartIcon />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-outline">Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>

        <button className="rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {open && (
        <nav className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <NavLink to="/" className={linkClass} onClick={() => setOpen(false)} end>Home</NavLink>
          <NavLink to="/products" className={linkClass} onClick={() => setOpen(false)}>Products</NavLink>
          <NavLink to="/services" className={linkClass} onClick={() => setOpen(false)}>Services</NavLink>
          {!isAdmin && !isTechnician && <NavLink to="/cart" className={linkClass} onClick={() => setOpen(false)}>Cart ({count})</NavLink>}
          {isAuthenticated && !isAdmin && !isTechnician && <NavLink to="/orders" className={linkClass} onClick={() => setOpen(false)}>My Orders</NavLink>}
          {isAuthenticated && !isAdmin && !isTechnician && <NavLink to="/bookings" className={linkClass} onClick={() => setOpen(false)}>My Services</NavLink>}
          {isAuthenticated && !isAdmin && !isTechnician && <NavLink to="/addresses" className={linkClass} onClick={() => setOpen(false)}>Addresses</NavLink>}
          {isTechnician && <NavLink to="/technician" className={linkClass} onClick={() => setOpen(false)}>Technician</NavLink>}
          {isAdmin && <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>Admin</NavLink>}
          <div className="pt-2">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn-outline w-full">Logout</button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-outline flex-1" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary flex-1" onClick={() => setOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

const CartIcon = () => (
  <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default Navbar;
