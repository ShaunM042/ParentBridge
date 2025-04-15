import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// Encryption keys
const ENCRYPTION_KEY = 'your-encryption-key'; // In production, use a secure key management system

export interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  locationTracking: boolean;
  biometricData: boolean;
  marketingEmails: boolean;
  dataRetentionPeriod: number; // in days
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
}

export interface ConsentRecord {
  feature: string;
  granted: boolean;
  timestamp: Date;
  version: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export const encryptData = async (data: any): Promise<string> => {
  const jsonString = JSON.stringify(data);
  const encrypted = await Crypto.encryptAsync(jsonString, ENCRYPTION_KEY);
  return encrypted;
};

export const decryptData = async (encryptedData: string): Promise<any> => {
  const decrypted = await Crypto.decryptAsync(encryptedData, ENCRYPTION_KEY);
  return JSON.parse(decrypted);
};

export const savePrivacySettings = async (userId: string, settings: PrivacySettings): Promise<void> => {
  const db = getFirestore();
  const encryptedSettings = await encryptData(settings);
  await setDoc(doc(db, 'privacySettings', userId), {
    settings: encryptedSettings,
    lastUpdated: new Date(),
  });
};

export const getPrivacySettings = async (userId: string): Promise<PrivacySettings> => {
  const db = getFirestore();
  const docRef = doc(db, 'privacySettings', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const encryptedSettings = docSnap.data().settings;
    return await decryptData(encryptedSettings);
  }
  
  return {
    dataCollection: true,
    analytics: true,
    locationTracking: false,
    biometricData: false,
    marketingEmails: false,
    dataRetentionPeriod: 365,
    gdprCompliant: true,
    ccpaCompliant: true,
  };
};

export const recordConsent = async (userId: string, consent: ConsentRecord): Promise<void> => {
  const db = getFirestore();
  const consentRef = doc(db, 'consents', userId);
  const encryptedConsent = await encryptData(consent);
  
  await setDoc(consentRef, {
    [consent.feature]: encryptedConsent,
    lastUpdated: new Date(),
  }, { merge: true });
};

export const getConsentStatus = async (userId: string, feature: string): Promise<boolean> => {
  const db = getFirestore();
  const consentRef = doc(db, 'consents', userId);
  const docSnap = await getDoc(consentRef);
  
  if (docSnap.exists() && docSnap.data()[feature]) {
    const encryptedConsent = docSnap.data()[feature];
    const consent = await decryptData(encryptedConsent);
    return consent.granted;
  }
  
  return false;
};

export const deleteUserData = async (userId: string): Promise<void> => {
  const db = getFirestore();
  const storage = getStorage();
  
  // Delete user data from Firestore
  const userRef = doc(db, 'users', userId);
  await userRef.delete();
  
  // Delete user data from Storage
  const storageRef = ref(storage, `users/${userId}`);
  await storageRef.delete();
  
  // Delete privacy settings
  const privacyRef = doc(db, 'privacySettings', userId);
  await privacyRef.delete();
  
  // Delete consent records
  const consentRef = doc(db, 'consents', userId);
  await consentRef.delete();
};

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  
  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },
  
  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
}; 