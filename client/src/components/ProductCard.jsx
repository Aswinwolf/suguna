import { Link } from 'react-router-dom';

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const ProductCard = ({ product, onAddToCart }) => {
  const categoryName = product.categoryId?.categoryName || 'Uncategorized';
  const subCategoryName = product.subCategoryId?.subCategoryName;

  return (
    <div className="card group flex flex-col overflow-hidden transition hover:shadow-md">
      <Link to={`/products/${product._id}`} className="block overflow-hidden bg-slate-100">
        <img
          src={product.image || 'https://placehold.co/600x400?text=No+Image'}
          alt={product.productName}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image'; }}
          className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex flex-wrap gap-1">
          <span className="inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            {categoryName}
          </span>
          {subCategoryName && (
            <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {subCategoryName}
            </span>
          )}
        </div>
        <Link to={`/products/${product._id}`}>
          <h3 className="line-clamp-2 font-semibold text-slate-800 hover:text-brand-700">{product.productName}</h3>
        </Link>
        <p className="mt-0.5 text-sm text-slate-500">{product.brand}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-slate-400 line-through">{formatPrice(product.mrp)}</span>
            )}
          </div>
          {onAddToCart && (
            <button onClick={() => onAddToCart(product)} className="btn-primary">Add</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
