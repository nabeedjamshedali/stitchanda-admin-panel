import { createContext, useContext, useState, useEffect } from 'react';
import { verifyAdminCredentials } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const adminData = localStorage.getItem('adminData');

    if (authStatus === 'true' && adminData) {
      try {
        setIsAuthenticated(true);
        setAdmin(JSON.parse(adminData));
      } catch (err) {
        console.error('Error parsing admin data:', err);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('adminData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await verifyAdminCredentials(username, password);

      if (result.success) {
        setIsAuthenticated(true);
        setAdmin(result.admin);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('adminData', JSON.stringify(result.admin));
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      setLoading(false);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdmin(null);
    setError(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminData');
  };

  const value = {
    isAuthenticated,
    admin,
    loading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
