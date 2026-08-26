import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
    <p className="text-6xl font-black text-brand-600">404</p>
    <h1 className="mt-4 text-2xl font-bold text-slate-800">Page not found</h1>
    <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn-primary mt-6">Go Home</Link>
  </div>
);

export default NotFound;
