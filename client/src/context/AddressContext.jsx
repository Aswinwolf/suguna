import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { addressApi } from '../services/endpoints.js';
import { useAuth } from './AuthContext.jsx';

const AddressContext = createContext(null);

export const AddressProvider = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || role === 'admin' || role === 'technician') {
      setAddresses([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await addressApi.list();
      setAddresses(data);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addAddress = async (payload) => {
    const { data } = await addressApi.create(payload);
    await refresh();
    return data;
  };

  const updateAddress = async (id, payload) => {
    const { data } = await addressApi.update(id, payload);
    await refresh();
    return data;
  };

  const removeAddress = async (id) => {
    await addressApi.remove(id);
    await refresh();
  };

  const setDefault = async (id) => {
    await addressApi.setDefault(id);
    await refresh();
  };

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;

  const value = {
    addresses,
    loading,
    defaultAddress,
    refresh,
    addAddress,
    updateAddress,
    removeAddress,
    setDefault,
  };

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
};

export const useAddress = () => {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error('useAddress must be used within AddressProvider');
  return ctx;
};
