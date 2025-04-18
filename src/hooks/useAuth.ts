import { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { storage } from '../services/storage';
import { StorageKeys } from '../services/storage';

export function useAuth() {
  const [user, setUser] = useState(auth().currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await storage.setItem(StorageKeys.USER_DATA, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        await storage.removeItem(StorageKeys.USER_DATA);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await auth().signInWithEmailAndPassword(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { user } = await auth().createUserWithEmailAndPassword(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
} 