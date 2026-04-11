import { useState, useEffect, useCallback } from 'react';
import { auth } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedRefresh = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setAccessToken(storedToken);
        setRefreshToken(storedRefresh);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await auth.login(email, password);
      const { accessToken: at, refreshToken: rt, user: u } = res.data;
      localStorage.setItem('accessToken', at);
      localStorage.setItem('refreshToken', rt);
      localStorage.setItem('user', JSON.stringify(u));
      setAccessToken(at);
      setRefreshToken(rt);
      setUser(u);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, username, password) => {
    setError(null);
    setLoading(true);
    try {
      await auth.register(email, username, password);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) return false;
    try {
      const res = await auth.refresh(rt);
      const { accessToken: at } = res.data;
      localStorage.setItem('accessToken', at);
      setAccessToken(at);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    login,
    register,
    logout,
    refreshAccessToken,
    isAuthenticated: !!accessToken,
  };
}
