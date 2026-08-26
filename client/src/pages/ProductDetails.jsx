import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productApi } from '../services/endpoints.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState(null);

  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    setLoading(true);
    productApi
      .get(id)
      .then((r) => setProduct(r.data))
      .catch(() => setMsg({ type: 'error', text: 'Product not found.' }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    try {
      await addToCart(product._id, qty);
      setMsg({ type: 'success', text: 'Added to cart.' });
    } catch {
      setMsg({ type: 'error', text: 'Could not add to cart.' });
    }
  };

  if (loading) return <Loader label="Loading product..." />;

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Alert type="error" message="Product not found." />
        <Link to="/products" className="btn-primary mt-6">Back to Products</Link>
      </div>
    );
  }

  const categoryName = product.categoryId?.categoryName || 'Uncategorized';
  const subCategoryName = product.subCategoryId?.subCategoryName;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm font-medium text-brand-700 hover:underline">← Back</button>

      {msg && <div className="mb-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="card overflow-hidden">
          <img
            src={product.image || 'https://placehold.co/600x400?text=No+Image'}
            alt={product.productName}
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image'; }}
            className="h-full max-h-[480px] w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2">
            <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{categoryName}</span>
            {subCategoryName && (
              <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{subCategoryName}</span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-800 md:text-3xl">{product.productName}</h1>
          <p className="mt-1 text-slate-500">by <span className="font-medium text-slate-700">{product.brand}</span></p>
          <p className="mt-1 text-xs text-slate-400 font-mono">Product Code: {product.productCode}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-3xl font-extrabold text-slate-900">{formatPrice(product.price)}</p>
            {product.mrp && product.mrp > product.price && (
              <p className="text-lg text-slate-400 line-through">MRP: {formatPrice(product.mrp)}</p>
            )}
          </div>

          {product.description && (
            <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
              {product.description}
            </div>
          )}

          {!isAdmin && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-slate-300">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-lg text-slate-600 hover:bg-slate-100">−</button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 text-lg text-slate-600 hover:bg-slate-100">+</button>
              </div>
              <button onClick={handleAdd} className="btn-primary flex-1">Add to Cart</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
