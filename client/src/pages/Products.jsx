import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi, categoryApi } from '../services/endpoints.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);

  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    categoryApi.list().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (search.trim()) params.search = search.trim();

    const t = setTimeout(() => {
      productApi
        .list(params)
        .then((r) => setProducts(r.data))
        .catch(() => setMsg({ type: 'error', text: 'Failed to load products.' }))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(t);
  }, [activeCategory, search]);

  const selectCategory = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('category', id);
    else next.delete('category');
    setSearchParams(next);
  };

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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800">All Products</h1>
      <p className="mt-1 text-sm text-slate-500">Browse our full range of home appliances.</p>

      {msg && <div className="mt-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => selectCategory('')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              !activeCategory ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-400'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => selectCategory(c._id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeCategory === c._id ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-400'
              }`}
            >
              {c.categoryName}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input md:w-64"
        />
      </div>

      <div className="mt-8">
        {loading ? (
          <Loader label="Loading products..." />
        ) : products.length === 0 ? (
          <div className="card p-12 text-center text-slate-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} onAddToCart={isAdmin ? null : handleAdd} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
