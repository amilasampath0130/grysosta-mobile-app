import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiService } from '@/services/api';

// Add response interfaces
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface VerificationContextType {
  email: string;
  setEmail: (email: string) => void;
  userData: any;
  setUserData: (data: any) => void;
  sendVerificationCode: (email: string, type: 'email_verification' | 'password_reset') => Promise<boolean>;
  verifyCode: (code: string) => Promise<boolean>;
  resetPassword: (code: string, newPassword: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const VerificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendVerificationCode = async (email: string, type: 'email_verification' | 'password_reset') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post('/auth/send-verification', { email, type }) as ApiResponse;
      
      if (response.success) {
        setEmail(email);
        return true;
      } else {
        setError(response.message || 'Failed to send verification code');
        return false;
      }
    } catch (error: any) {
      setError(error.message || 'Network error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post('/auth/verify-and-register', {
        ...userData,
        email,
        code
      }) as ApiResponse;
      
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Verification failed');
        return false;
      }
    } catch (error: any) {
      setError(error.message || 'Network error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (code: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post('/auth/verify-reset-password', {
        email,
        code,
        newPassword
      }) as ApiResponse;
      
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Password reset failed');
        return false;
      }
    } catch (error: any) {
      setError(error.message || 'Network error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <VerificationContext.Provider value={{
      email,
      setEmail,
      userData,
      setUserData,
      sendVerificationCode,
      verifyCode,
      resetPassword,
      loading,
      error,
      clearError
    }}>
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};