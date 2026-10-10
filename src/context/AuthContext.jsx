import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT token:', e);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = useCallback((jwtToken) => {
    if (!jwtToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    const decoded = parseJwt(jwtToken);
    if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } else {
      setUser({
        username: decoded.sub || 'User',
        role: decoded.role || 'EMPLOYEE',
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initAuth(token);
  }, [token, initAuth]);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    const newToken = data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const decoded = parseJwt(newToken);
    const userData = {
      username: decoded?.sub || username,
      role: decoded?.role || 'EMPLOYEE',
    };
    setUser(userData);
    return userData;
  };

  const register = async (username, password, role) => {
    return await authService.register(username, password, role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const role = user?.role || 'EMPLOYEE';
  const canDelete = role === 'ADMIN';
  const canCreateOrUpdate = role === 'ADMIN' || role === 'HR';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        canDelete,
        canCreateOrUpdate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
