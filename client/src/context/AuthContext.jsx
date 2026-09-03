import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/endpoints.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const persist = (data) => {
    const { token, ...profile } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    return persist(data);
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    return persist(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTechnician: user?.role === 'technician',
    role: user?.role || null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
