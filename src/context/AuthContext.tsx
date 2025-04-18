import React, { createContext, useState, useContext, useEffect } from 'react';
import { FirebaseAuth, FirebaseFirestore, collections } from '../services/firebase';
import { isBiometricAvailable, authenticateWithBiometrics, isBiometricEnabled, setBiometricEnabled } from '../services/biometric';

interface User {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  children?: string[];
  id: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  authenticateWithBiometrics: () => Promise<boolean>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);

  useEffect(() => {
    const checkBiometricAvailability = async () => {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);
      if (available) {
        const enabled = await isBiometricEnabled();
        setBiometricEnabledState(enabled);
      }
    };

    checkBiometricAvailability();
  }, []);

  useEffect(() => {
    const unsubscribe = FirebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await FirebaseFirestore
          .collection(collections.users)
          .doc(firebaseUser.uid)
          .get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: userData?.name || '',
            photoURL: userData?.photoURL,
            children: userData?.children || [],
            id: firebaseUser.uid,
          });

          // If this is the first login, prompt for biometric authentication
          if (biometricAvailable && !biometricEnabled) {
            const success = await authenticateWithBiometrics();
            if (success) {
              await setBiometricEnabled(true);
              setBiometricEnabledState(true);
            }
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [biometricAvailable, biometricEnabled]);

  const signIn = async (email: string, password: string) => {
    try {
      await FirebaseAuth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { user: firebaseUser } = await FirebaseAuth.createUserWithEmailAndPassword(email, password);
      
      if (firebaseUser) {
        await FirebaseFirestore
          .collection(collections.users)
          .doc(firebaseUser.uid)
          .set({
            name: `${firstName} ${lastName}`,
            email,
            createdAt: new Date(),
          });
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await FirebaseAuth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const handleBiometricAuth = async () => {
    if (!biometricAvailable) return false;
    return await authenticateWithBiometrics();
  };

  const handleSetBiometricEnabled = async (enabled: boolean) => {
    await setBiometricEnabled(enabled);
    setBiometricEnabledState(enabled);
  };

  const value = {
    user,
    loading,
    biometricAvailable,
    biometricEnabled,
    signIn,
    signUp,
    signOut,
    authenticateWithBiometrics: handleBiometricAuth,
    setBiometricEnabled: handleSetBiometricEnabled,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 