import React, { createContext, useState, useContext, useEffect } from 'react';
import { InteractionManager, NativeModules, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PerformanceObserver, performance } from 'perf_hooks';

interface PerformanceMetrics {
  appStartTime: number;
  screenLoadTimes: Record<string, number>;
  apiResponseTimes: Record<string, number>;
  memoryUsage: number;
  lastCrashReport?: string;
  fps: number;
  batteryLevel: number;
  networkStatus: string;
  appState: AppStateStatus;
  performanceEntries: Array<{
    name: string;
    duration: number;
    startTime: number;
  }>;
}

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  startScreenLoad: (screenName: string) => void;
  endScreenLoad: (screenName: string) => void;
  trackApiCall: (endpoint: string, startTime: number) => void;
  reportCrash: (error: Error) => Promise<void>;
  clearMetrics: () => Promise<void>;
  startPerformanceTracking: (name: string) => void;
  endPerformanceTracking: (name: string) => void;
  getPerformanceMetrics: () => Promise<PerformanceMetrics>;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    appStartTime: Date.now(),
    screenLoadTimes: {},
    apiResponseTimes: {},
    memoryUsage: 0,
    fps: 0,
    batteryLevel: 100,
    networkStatus: 'unknown',
    appState: AppState.currentState,
    performanceEntries: [],
  });

  useEffect(() => {
    initializePerformanceMonitoring();
    setupEventListeners();
    return () => {
      cleanupPerformanceMonitoring();
      cleanupEventListeners();
    };
  }, []);

  const initializePerformanceMonitoring = async () => {
    try {
      // Load saved metrics from storage
      const savedMetrics = await AsyncStorage.getItem('performanceMetrics');
      if (savedMetrics) {
        setMetrics(JSON.parse(savedMetrics));
      }

      // Start memory monitoring
      startMemoryMonitoring();
      
      // Start FPS monitoring
      startFPSMonitoring();
      
      // Start battery monitoring
      startBatteryMonitoring();
    } catch (error) {
      console.error('Error initializing performance monitoring:', error);
    }
  };

  const setupEventListeners = () => {
    // App state changes
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Network status changes
    const networkSubscription = NativeModules.NetworkInfo?.addListener?.(
      'networkStatusChanged',
      handleNetworkStatusChange
    );

    return () => {
      appStateSubscription.remove();
      networkSubscription?.remove();
    };
  };

  const cleanupEventListeners = () => {
    // Cleanup is handled in the setupEventListeners return function
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    setMetrics(prev => ({
      ...prev,
      appState: nextAppState,
    }));
  };

  const handleNetworkStatusChange = (status: string) => {
    setMetrics(prev => ({
      ...prev,
      networkStatus: status,
    }));
  };

  const cleanupPerformanceMonitoring = () => {
    // Cleanup any ongoing monitoring
  };

  const startMemoryMonitoring = () => {
    // Implement memory monitoring logic
    // This is platform-specific and would need to be implemented
    // using native modules or appropriate APIs
  };

  const startFPSMonitoring = () => {
    let lastTime = performance.now();
    let frameCount = 0;

    const calculateFPS = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({
          ...prev,
          fps,
        }));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(calculateFPS);
    };

    requestAnimationFrame(calculateFPS);
  };

  const startBatteryMonitoring = () => {
    // Implement battery monitoring logic
    // This is platform-specific and would need to be implemented
    // using native modules or appropriate APIs
  };

  const startScreenLoad = (screenName: string) => {
    setMetrics(prev => ({
      ...prev,
      screenLoadTimes: {
        ...prev.screenLoadTimes,
        [screenName]: Date.now(),
      },
    }));
  };

  const endScreenLoad = (screenName: string) => {
    setMetrics(prev => {
      const startTime = prev.screenLoadTimes[screenName];
      if (!startTime) return prev;

      const loadTime = Date.now() - startTime;
      return {
        ...prev,
        screenLoadTimes: {
          ...prev.screenLoadTimes,
          [screenName]: loadTime,
        },
      };
    });
  };

  const trackApiCall = (endpoint: string, startTime: number) => {
    const responseTime = Date.now() - startTime;
    setMetrics(prev => ({
      ...prev,
      apiResponseTimes: {
        ...prev.apiResponseTimes,
        [endpoint]: responseTime,
      },
    }));
  };

  const reportCrash = async (error: Error) => {
    try {
      const crashReport = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        metrics: metrics,
      };

      setMetrics(prev => ({
        ...prev,
        lastCrashReport: JSON.stringify(crashReport),
      }));

      // Save crash report to storage
      await AsyncStorage.setItem('lastCrashReport', JSON.stringify(crashReport));
    } catch (error) {
      console.error('Error reporting crash:', error);
    }
  };

  const clearMetrics = async () => {
    try {
      const defaultMetrics: PerformanceMetrics = {
        appStartTime: Date.now(),
        screenLoadTimes: {},
        apiResponseTimes: {},
        memoryUsage: 0,
        fps: 0,
        batteryLevel: 100,
        networkStatus: 'unknown',
        appState: AppState.currentState,
        performanceEntries: [],
      };
      setMetrics(defaultMetrics);
      await AsyncStorage.setItem('performanceMetrics', JSON.stringify(defaultMetrics));
    } catch (error) {
      console.error('Error clearing metrics:', error);
    }
  };

  const startPerformanceTracking = (name: string) => {
    performance.mark(`start-${name}`);
  };

  const endPerformanceTracking = (name: string) => {
    performance.mark(`end-${name}`);
    performance.measure(name, `start-${name}`, `end-${name}`);
    
    const entries = performance.getEntriesByName(name);
    if (entries.length > 0) {
      const entry = entries[entries.length - 1];
      setMetrics(prev => ({
        ...prev,
        performanceEntries: [
          ...prev.performanceEntries,
          {
            name,
            duration: entry.duration,
            startTime: entry.startTime,
          },
        ],
      }));
    }
  };

  const getPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
    try {
      const savedMetrics = await AsyncStorage.getItem('performanceMetrics');
      if (savedMetrics) {
        return JSON.parse(savedMetrics);
      }
      return metrics;
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return metrics;
    }
  };

  const value = {
    metrics,
    startScreenLoad,
    endScreenLoad,
    trackApiCall,
    reportCrash,
    clearMetrics,
    startPerformanceTracking,
    endPerformanceTracking,
    getPerformanceMetrics,
  };

  return <PerformanceContext.Provider value={value}>{children}</PerformanceContext.Provider>;
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}; 