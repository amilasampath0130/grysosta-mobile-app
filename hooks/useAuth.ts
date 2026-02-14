import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    sendVerificationCode,
    verifyAndRegister,
    resendVerificationCode,
  } = useAuthStore();

  const [isInitialized, setIsInitialized] = useState(true);

  return {
    user,
    token,
    isAuthenticated: isAuthenticated && !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    sendVerificationCode,
    verifyAndRegister,
    resendVerificationCode,
    isInitialized,
  };
};
