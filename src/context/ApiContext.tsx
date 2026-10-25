import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_API_BASE_URL, updateApiBaseUrl, apiClient } from '../api/client';
import { useToast } from './ToastContext';

interface ApiContextType {
  isDemoMode: boolean;
  isConnected: boolean;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  checkConnection: () => Promise<boolean>;
  toggleDemoMode: () => void;
  setDemoMode: (val: boolean) => void;
  lastSyncTime: string;
  refreshTrigger: number;
  triggerRefresh: () => void;
  isWorkedExampleModalOpen: boolean;
  openWorkedExampleModal: () => void;
  closeWorkedExampleModal: () => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('cybershield_demo_mode');
    return saved !== null ? saved === 'true' : true; // Default to true for presentation safety
  });

  const [backendUrl, setBackendUrlState] = useState<string>(() => {
    const saved = localStorage.getItem('cybershield_backend_url');
    if (saved && saved.includes(':8000')) {
      const updated = saved.replace(':8000', ':5000');
      localStorage.setItem('cybershield_backend_url', updated);
      return updated;
    }
    return saved || DEFAULT_API_BASE_URL;
  });

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isWorkedExampleModalOpen, setIsWorkedExampleModalOpen] = useState<boolean>(false);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/api/v1/health', { timeout: 3000 });
      if (response.status === 200) {
        setIsConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString());
        return true;
      }
      setIsConnected(false);
      return false;
    } catch {
      setIsConnected(false);
      return false;
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const setBackendUrl = (url: string) => {
    setBackendUrlState(url);
    localStorage.setItem('cybershield_backend_url', url);
    updateApiBaseUrl(url);
    checkConnection();
  };

  const toggleDemoMode = () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    localStorage.setItem('cybershield_demo_mode', String(next));
    if (next) {
      addToast('info', 'Demo Mode Activated', 'Displaying coherent demonstration datasets for presentation.');
    } else {
      addToast('warning', 'Live API Mode Activated', `Connecting to Python backend at ${backendUrl}`);
      checkConnection();
    }
  };

  const setDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    localStorage.setItem('cybershield_demo_mode', String(val));
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    setLastSyncTime(new Date().toLocaleTimeString());
    addToast('info', 'Data Refreshed', 'Latest metrics and event states updated.');
  };

  const openWorkedExampleModal = () => setIsWorkedExampleModalOpen(true);
  const closeWorkedExampleModal = () => setIsWorkedExampleModalOpen(false);

  return (
    <ApiContext.Provider
      value={{
        isDemoMode,
        isConnected,
        backendUrl,
        setBackendUrl,
        checkConnection,
        toggleDemoMode,
        setDemoMode,
        lastSyncTime,
        refreshTrigger,
        triggerRefresh,
        isWorkedExampleModalOpen,
        openWorkedExampleModal,
        closeWorkedExampleModal
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
