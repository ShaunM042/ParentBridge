import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { Platform } from 'react-native';
import { storage } from './firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // Replace with your web client ID
});

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'parent' | 'teacher';
  children?: string[];
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const userDoc = await firestore()
      .collection('users')
      .doc(userCredential.user.uid)
      .get();

    if (!userDoc.exists) {
      throw new Error('User profile not found');
    }

    const userData = userDoc.data() as User;
    return {
      ...userData,
      uid: userCredential.user.uid,
      lastLoginAt: new Date(),
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
};

export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: 'parent' | 'teacher'
): Promise<User> => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const userData: User = {
      uid: userCredential.user.uid,
      email,
      name,
      role,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    await firestore()
      .collection('users')
      .doc(userCredential.user.uid)
      .set(userData);

    return userData;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign up');
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await auth().signOut();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send password reset email');
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  try {
    await GoogleSignin.hasPlayServices();
    const { idToken } = await GoogleSignin.signIn();
    const credential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(credential);

    const userDoc = await firestore()
      .collection('users')
      .doc(userCredential.user.uid)
      .get();

    if (!userDoc.exists) {
      // Create new user profile
      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: userCredential.user.displayName || '',
        role: 'parent', // Default role
        photoURL: userCredential.user.photoURL,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .set(userData);

      return userData;
    }

    const userData = userDoc.data() as User;
    return {
      ...userData,
      lastLoginAt: new Date(),
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

export const signInWithFacebook = async (): Promise<User> => {
  try {
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
    if (result.isCancelled) {
      throw new Error('User cancelled the login process');
    }

    const data = await AccessToken.getCurrentAccessToken();
    if (!data) {
      throw new Error('Something went wrong obtaining the access token');
    }

    const credential = auth.FacebookAuthProvider.credential(data.accessToken);
    const userCredential = await auth().signInWithCredential(credential);

    const userDoc = await firestore()
      .collection('users')
      .doc(userCredential.user.uid)
      .get();

    if (!userDoc.exists) {
      // Create new user profile
      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: userCredential.user.displayName || '',
        role: 'parent', // Default role
        photoURL: userCredential.user.photoURL,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .set(userData);

      return userData;
    }

    const userData = userDoc.data() as User;
    return {
      ...userData,
      lastLoginAt: new Date(),
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in with Facebook');
  }
};

export const updateProfile = async (data: { name?: string; photoURL?: string }) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  try {
    // Update user profile in Firestore
    await firestore.collection('users').doc(user.uid).update({
      name: data.name,
      updatedAt: new Date(),
    });

    // If there's a new photo, upload it to Storage
    if (data.photoURL) {
      const response = await fetch(data.photoURL);
      const blob = await response.blob();
      const storageRef = ref(storage, `profile_images/${user.uid}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update photo URL in Firestore
      await firestore.collection('users').doc(user.uid).update({
        photoURL: downloadURL,
      });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No user logged in');

  try {
    // Reauthenticate user
    const credential = auth.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await user.reauthenticateWithCredential(credential);

    // Update password
    await user.updatePassword(newPassword);
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const deleteAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  try {
    // Delete user data from Firestore
    await firestore.collection('users').doc(user.uid).delete();

    // Delete user profile image from Storage if exists
    try {
      const storageRef = ref(storage, `profile_images/${user.uid}`);
      await storageRef.delete();
    } catch (error) {
      console.warn('No profile image to delete');
    }

    // Delete user account
    await user.delete();
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}; 