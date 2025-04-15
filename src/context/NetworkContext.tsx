import React, { createContext, useState, useContext, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { FirebaseFirestore } from '../services/firebase';

interface NetworkContextType {
  isConnected: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      
      if (state.isConnected && !isSyncing) {
        syncOfflineData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isSyncing]);

  const syncOfflineData = async () => {
    setIsSyncing(true);
    try {
      // TODO: Implement offline data synchronization
      // This would involve syncing any locally stored changes
      // with the server when the connection is restored
      setLastSync(new Date());
    } catch (error) {
      console.error('Error syncing offline data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const value = {
    isConnected,
    isSyncing,
    lastSync,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}; 