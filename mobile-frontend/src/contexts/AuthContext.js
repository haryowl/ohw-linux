import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const [onLoginSuccess, setOnLoginSuccess] = useState(null);

  // Check authentication status on app load
  const { data: authData, isLoading: authLoading } = useQuery(
    'auth-check',
    authApi.checkAuth,
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onSuccess: (data) => {
        setUser(data);
        setLoading(false);
        
        // Call the callback if set (for loading data when already authenticated)
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      },
      onError: () => {
        setUser(null);
        setLoading(false);
      },
    }
  );

  const login = async (username, password) => {
    try {
      const userData = await authApi.login(username, password);
      setUser(userData);
      queryClient.invalidateQueries();
      toast.success('Login successful!');
      
      // Call the callback if set (for loading data after login)
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      return userData;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      queryClient.clear();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      setUser(null);
      queryClient.clear();
    }
  };

  const value = {
    user,
    loading: authLoading || loading,
    login,
    logout,
    isAuthenticated: !!user,
    setOnLoginSuccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 