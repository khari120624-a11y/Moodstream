import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user credentials/token are stored in localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error parsing stored auth data', err);
        // Clear corrupt storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register user
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { username, email, password });
      return { 
        success: true, 
        verified: response.data.verified, 
        tempUserId: response.data.tempUserId,
        message: response.data.message
      };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP Code
  const verifyOtp = async (tempUserId, otpCode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/verify-otp', { tempUserId, otpCode });
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Verification failed. Please check the code.';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const resendOtp = async (tempUserId) => {
    setError(null);
    try {
      const response = await api.post('/auth/resend-otp', { tempUserId });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to resend code.';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (err) {
      // If user exists but is unverified
      if (err.response?.status === 401 && err.response?.data?.verified === false) {
        return {
          success: false,
          verified: false,
          tempUserId: err.response.data.tempUserId,
          message: err.response.data.message,
        };
      }
      const errMsg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    verifyOtp,
    resendOtp,
    login,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
