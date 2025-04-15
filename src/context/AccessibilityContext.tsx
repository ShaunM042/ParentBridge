import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo, Platform, ColorSchemeName, useColorScheme } from 'react-native';

interface AccessibilityContextType {
  isScreenReaderEnabled: boolean;
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  colorBlindMode: boolean;
  darkMode: boolean;
  setFontSize: (size: number) => Promise<void>;
  toggleHighContrast: () => Promise<void>;
  toggleReducedMotion: () => Promise<void>;
  toggleColorBlindMode: () => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  getAccessibilitySettings: () => Promise<void>;
  announceForAccessibility: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [fontSize, setFontSizeState] = useState(16);
  const [highContrast, setHighContrastState] = useState(false);
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [colorBlindMode, setColorBlindModeState] = useState(false);
  const [darkMode, setDarkModeState] = useState(false);
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    loadAccessibilitySettings();
    setupAccessibilityListeners();
    return () => {
      cleanupAccessibilityListeners();
    };
  }, []);

  useEffect(() => {
    // Update dark mode based on system settings
    if (systemColorScheme) {
      setDarkModeState(systemColorScheme === 'dark');
    }
  }, [systemColorScheme]);

  const setupAccessibilityListeners = () => {
    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      handleScreenReaderChanged
    );

    const reducedMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      handleReducedMotionChanged
    );

    return () => {
      screenReaderSubscription.remove();
      reducedMotionSubscription.remove();
    };
  };

  const cleanupAccessibilityListeners = () => {
    // Cleanup is handled in the setupAccessibilityListeners return function
  };

  const handleScreenReaderChanged = (isEnabled: boolean) => {
    setIsScreenReaderEnabled(isEnabled);
  };

  const handleReducedMotionChanged = (isEnabled: boolean) => {
    setReducedMotionState(isEnabled);
  };

  const loadAccessibilitySettings = async () => {
    try {
      const [
        savedFontSize,
        savedHighContrast,
        savedReducedMotion,
        savedColorBlindMode,
        savedDarkMode,
      ] = await Promise.all([
        AsyncStorage.getItem('fontSize'),
        AsyncStorage.getItem('highContrast'),
        AsyncStorage.getItem('reducedMotion'),
        AsyncStorage.getItem('colorBlindMode'),
        AsyncStorage.getItem('darkMode'),
      ]);

      if (savedFontSize) {
        setFontSizeState(Number(savedFontSize));
      }

      if (savedHighContrast) {
        setHighContrastState(savedHighContrast === 'true');
      }

      if (savedReducedMotion) {
        setReducedMotionState(savedReducedMotion === 'true');
      }

      if (savedColorBlindMode) {
        setColorBlindModeState(savedColorBlindMode === 'true');
      }

      if (savedDarkMode) {
        setDarkModeState(savedDarkMode === 'true');
      }

      // Check if screen reader is enabled
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(isEnabled);

      // Check if reduced motion is enabled
      const isReducedMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      setReducedMotionState(isReducedMotionEnabled);
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
  };

  const setFontSize = async (size: number) => {
    try {
      setFontSizeState(size);
      await AsyncStorage.setItem('fontSize', String(size));
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  const toggleHighContrast = async () => {
    try {
      const newValue = !highContrast;
      setHighContrastState(newValue);
      await AsyncStorage.setItem('highContrast', String(newValue));
    } catch (error) {
      console.error('Error toggling high contrast:', error);
    }
  };

  const toggleReducedMotion = async () => {
    try {
      const newValue = !reducedMotion;
      setReducedMotionState(newValue);
      await AsyncStorage.setItem('reducedMotion', String(newValue));
    } catch (error) {
      console.error('Error toggling reduced motion:', error);
    }
  };

  const toggleColorBlindMode = async () => {
    try {
      const newValue = !colorBlindMode;
      setColorBlindModeState(newValue);
      await AsyncStorage.setItem('colorBlindMode', String(newValue));
    } catch (error) {
      console.error('Error toggling color blind mode:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newValue = !darkMode;
      setDarkModeState(newValue);
      await AsyncStorage.setItem('darkMode', String(newValue));
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

  const getAccessibilitySettings = async () => {
    await loadAccessibilitySettings();
  };

  const announceForAccessibility = (message: string) => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  const value = {
    isScreenReaderEnabled,
    fontSize,
    highContrast,
    reducedMotion,
    colorBlindMode,
    darkMode,
    setFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    toggleColorBlindMode,
    toggleDarkMode,
    getAccessibilitySettings,
    announceForAccessibility,
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}; 