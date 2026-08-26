import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cartApi } from '../services/endpoints.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ products: [] });
      return;
    }
    setLoading(true);
    try {
      const { data } = await cartApi.get();
      setCart(data);
    } catch {
      setCart({ products: [] });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await cartApi.add({ productId, quantity });
    setCart(data);
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await cartApi.update(productId, { quantity });
    setCart(data);
  };

  const removeFromCart = async (productId) => {
    const { data } = await cartApi.remove(productId);
    setCart(data);
  };

  const clearCart = async () => {
    await cartApi.clear();
    setCart({ products: [] });
  };

  const count = cart.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
  const total =
    cart.products?.reduce(
      (sum, p) => sum + (p.productId?.price || 0) * p.quantity,
      0
    ) || 0;

  const value = {
    cart,
    loading,
    count,
    total,
    refresh,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
