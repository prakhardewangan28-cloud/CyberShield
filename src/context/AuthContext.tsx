import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../api/auth.api';
import { mockUsers } from '../mock/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, isDemo?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  isAdmin: boolean;
  isAnalyst: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with admin for instant smooth demo/presentation access, or restore saved session
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('cybershield_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockUsers[0];
      }
    }
    return mockUsers[0]; // Start with admin for easy preview, can log out to test login page
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('cybershield_current_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('cybershield_current_user');
    }
  }, [user]);

  const login = async (username: string, password: string, isDemo: boolean = true): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(username, password, isDemo);
      setUser(res.user);
      return true;
    } catch (err: unknown) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const switchRole = (role: UserRole) => {
    const matched = mockUsers.find(u => u.role === role);
    if (matched) {
      setUser(matched);
    }
  };

  const role = user?.role;
  const isAdmin = role === 'admin';
  const isAnalyst = role === 'analyst' || role === 'admin';
  const isViewer = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
        isAdmin,
        isAnalyst,
        isViewer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
