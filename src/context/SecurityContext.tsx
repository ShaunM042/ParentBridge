import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import EncryptedStorage from 'react-native-encrypted-storage';
import * as Keychain from 'react-native-keychain';
import { Buffer } from 'buffer';

interface SecurityContextType {
  isEncryptionEnabled: boolean;
  isFacialRecognitionEnabled: boolean;
  hasGivenConsent: boolean;
  toggleEncryption: () => Promise<void>;
  toggleFacialRecognition: () => Promise<void>;
  setConsent: (consent: boolean) => Promise<void>;
  encryptData: (data: string) => Promise<string>;
  decryptData: (encryptedData: string) => Promise<string>;
  generateSecureKey: () => Promise<string>;
  isBiometricAvailable: () => Promise<boolean>;
  authenticateWithBiometrics: () => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(true);
  const [isFacialRecognitionEnabled, setIsFacialRecognitionEnabled] = useState(false);
  const [hasGivenConsent, setHasGivenConsent] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

  useEffect(() => {
    loadSecuritySettings();
    initializeEncryption();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const [encryption, facialRecognition, consent] = await Promise.all([
        AsyncStorage.getItem('encryptionEnabled'),
        AsyncStorage.getItem('facialRecognitionEnabled'),
        AsyncStorage.getItem('hasGivenConsent'),
      ]);

      setIsEncryptionEnabled(encryption === 'true');
      setIsFacialRecognitionEnabled(facialRecognition === 'true');
      setHasGivenConsent(consent === 'true');
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const initializeEncryption = async () => {
    try {
      // Try to get existing key from secure storage
      const storedKey = await EncryptedStorage.getItem('encryptionKey');
      if (storedKey) {
        setEncryptionKey(storedKey);
        return;
      }

      // Generate new key if none exists
      const newKey = await generateSecureKey();
      await EncryptedStorage.setItem('encryptionKey', newKey);
      setEncryptionKey(newKey);
    } catch (error) {
      console.error('Error initializing encryption:', error);
    }
  };

  const generateSecureKey = async (): Promise<string> => {
    try {
      // Generate a secure random key
      const randomBytes = Buffer.alloc(32);
      crypto.getRandomValues(randomBytes);
      return randomBytes.toString('base64');
    } catch (error) {
      console.error('Error generating secure key:', error);
      throw error;
    }
  };

  const toggleEncryption = async () => {
    const newValue = !isEncryptionEnabled;
    setIsEncryptionEnabled(newValue);
    await AsyncStorage.setItem('encryptionEnabled', String(newValue));
  };

  const toggleFacialRecognition = async () => {
    const newValue = !isFacialRecognitionEnabled;
    setIsFacialRecognitionEnabled(newValue);
    await AsyncStorage.setItem('facialRecognitionEnabled', String(newValue));
  };

  const setConsent = async (consent: boolean) => {
    setHasGivenConsent(consent);
    await AsyncStorage.setItem('hasGivenConsent', String(consent));
  };

  const encryptData = async (data: string): Promise<string> => {
    if (!isEncryptionEnabled || !encryptionKey) return data;
    
    try {
      // Convert data and key to ArrayBuffer
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const keyBuffer = encoder.encode(encryptionKey);

      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Import key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      // Encrypt data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        cryptoKey,
        dataBuffer
      );

      // Combine IV and encrypted data
      const result = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encryptedBuffer), iv.length);

      return Buffer.from(result).toString('base64');
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  };

  const decryptData = async (encryptedData: string): Promise<string> => {
    if (!isEncryptionEnabled || !encryptionKey) return encryptedData;
    
    try {
      // Convert encrypted data to ArrayBuffer
      const encryptedBuffer = Buffer.from(encryptedData, 'base64');
      const iv = encryptedBuffer.slice(0, 12);
      const data = encryptedBuffer.slice(12);

      // Convert key to ArrayBuffer
      const encoder = new TextEncoder();
      const keyBuffer = encoder.encode(encryptionKey);

      // Import key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // Decrypt data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        cryptoKey,
        data
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  };

  const isBiometricAvailable = async (): Promise<boolean> => {
    try {
      const result = await Keychain.getSupportedBiometryType();
      return result !== null;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      const result = await Keychain.getGenericPassword({
        authenticationPrompt: {
          title: 'Biometric Authentication',
          subtitle: 'Please authenticate to continue',
          description: 'Use your biometrics to verify your identity',
          cancel: 'Cancel'
        }
      });
      return result !== false;
    } catch (error) {
      console.error('Error authenticating with biometrics:', error);
      return false;
    }
  };

  const value = {
    isEncryptionEnabled,
    isFacialRecognitionEnabled,
    hasGivenConsent,
    toggleEncryption,
    toggleFacialRecognition,
    setConsent,
    encryptData,
    decryptData,
    generateSecureKey,
    isBiometricAvailable,
    authenticateWithBiometrics,
  };

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}; 