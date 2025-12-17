import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    initializeAuth,
    updateUser,
  } = useAuthStore();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await initializeAuth();
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initAuth();
    }
  }, [initializeAuth, isInitialized]);

  return {
    user,
    token,
    isAuthenticated: isAuthenticated && !!user && !!token,
    isLoading: isLoading || !isInitialized,
    login,
    signup,
    logout,
    updateUser,
    isInitialized,
  };
};