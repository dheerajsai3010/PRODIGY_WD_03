import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  }, []);

  const login = async (email, password, remember = false) => {
    const res = await api.login({ email, password });
    const { user: userData, token: authToken } = res.data;
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    if (remember) localStorage.setItem('rememberEmail', email);
    setUser(userData);
    setToken(authToken);
    return userData;
  };

  const register = async (formData) => {
    const res = await api.register(formData);
    return res.data;
  };

  useEffect(() => {
    const init = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser && token) {
        try {
          const res = await api.me();
          setUser(res.data.user);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    init();
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
