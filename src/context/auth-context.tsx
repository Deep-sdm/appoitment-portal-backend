"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api-client';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role?: string,
    specialty?: string,
    fee?: number,
    experience?: number,
    bio?: string
  ) => Promise<void>;
  updateUser: (updatedFields: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('medibook_token');
    const savedUser = localStorage.getItem('medibook_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify token with backend
        apiRequest('/auth/me')
          .then((res) => {
            const userData = res.user || res.data;
            if (userData) {
              setUser(userData);
              localStorage.setItem('medibook_user', JSON.stringify(userData));
            }
          })
          .catch(() => {
            logout();
          })
          .finally(() => setIsLoading(false));
      } catch {
        logout();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role = 'patient') => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });

      const userData = res.user || res.data;
      if (res.token && userData) {
        setToken(res.token);
        setUser(userData);
        localStorage.setItem('medibook_token', res.token);
        localStorage.setItem('medibook_user', JSON.stringify(userData));
      } else {
        throw new Error(res.message || 'Login failed. Please check credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role = 'patient',
    specialty?: string,
    fee?: number,
    experience?: number,
    bio?: string
  ) => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, specialty, fee, experience, bio }),
      });

      const userData = res.user || res.data;
      if (res.token && userData) {
        setToken(res.token);
        setUser(userData);
        localStorage.setItem('medibook_token', res.token);
        localStorage.setItem('medibook_user', JSON.stringify(userData));
      } else {
        throw new Error(res.message || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const newUserData = { ...user, ...updatedFields };
      setUser(newUserData);
      localStorage.setItem('medibook_user', JSON.stringify(newUserData));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('medibook_token');
    localStorage.removeItem('medibook_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
