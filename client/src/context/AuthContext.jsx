import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCurrentUserApi,
  loginApi,
  registerApi,
  logoutApi,
} from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check if current session has an authenticated user via HTTP-only cookie
   */
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentUserApi();
      if (data && data.success && data.user) {
        setUser(data.user);
        setProfile(data.profile || null);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      // 401 is expected when not logged in
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Authenticate user with email and password
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await loginApi({ email, password });
      if (data && data.success) {
        setUser(data.user);
        setProfile(data.profile || null);
        return { success: true, user: data.user };
      }
      throw new Error(data?.message || 'Login failed');
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Invalid email or password';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new developer account
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await registerApi(userData);
      if (data && data.success) {
        setUser(data.user);
        setProfile(data.profile || null);
        return { success: true, user: data.user };
      }
      throw new Error(data?.message || 'Registration failed');
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user and invalidate session
   */
  const logout = async () => {
    try {
      setLoading(true);
      await logoutApi();
    } catch (err) {
      console.warn('Logout warning:', err.message);
    } finally {
      setUser(null);
      setProfile(null);
      setError(null);
      setLoading(false);
    }
  };

  /**
   * Refresh current user and profile data
   */
  const refreshUser = async () => {
    try {
      const data = await getCurrentUserApi();
      if (data && data.success) {
        setUser(data.user);
        if (data.profile) setProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refreshUser,
    checkAuth,
    setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to consume AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
