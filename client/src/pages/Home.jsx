import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, categoryApi } from '../services/endpoints.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [p, c] = await Promise.all([productApi.list(), categoryApi.list()]);
        if (isMounted) {
          setProducts(p.data || []);
          setCategories(c.data || []);
        }
      } catch (err) {
        console.error('Failed to load store data:', err);
        if (isMounted) {
          setMsg({ type: 'error', text: 'Failed to load store data. Please refresh or check connection.' });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAdd = async (product) => {
    if (!isAuthenticated) {
      setMsg({ type: 'info', text: 'Please login to add items to your cart.' });
      return;
    }
    try {
      await addToCart(product._id, 1);
      setMsg({ type: 'success', text: `${product.productName} added to cart.` });
    } catch {
      setMsg({ type: 'error', text: 'Could not add to cart.' });
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Trusted Home Appliances Store</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Upgrade your home with <span className="text-brand-200">Suguna</span> Appliances
            </h1>
            <p className="mt-4 text-lg text-brand-100">
              Refrigerators, washing machines, ACs, TVs and more from the brands you trust — at prices you'll love.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn bg-white text-brand-700 hover:bg-brand-50">Shop Products</Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn border border-white/40 text-white hover:bg-white/10">Create Account</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {msg && <div className="mb-6"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

        {categories.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold text-slate-800">Shop by Category</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c._id}
                  to={`/products?category=${c._id}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-400 hover:text-brand-700"
                >
                  {c.categoryName}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Featured Products</h2>
            <Link to="/products" className="text-sm font-semibold text-brand-700 hover:underline">View all →</Link>
          </div>

          {loading ? (
            <Loader label="Loading products..." />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((p) => (
                <ProductCard key={p._id} product={p} onAddToCart={isAdmin ? null : handleAdd} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
