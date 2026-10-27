import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      await checkUser();
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data?.success) {
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      await checkUser();
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout request failed or timed out:', e.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setProfile(null);
      window.location.href = '/login';
    }
  };

  const updateProfileState = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkUser,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
