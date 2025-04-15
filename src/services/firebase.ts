import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import functions from '@react-native-firebase/functions';

// Initialize Firebase
const firebaseConfig = {
  // TODO: Replace with your Firebase config
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export Firebase services
export const FirebaseAuth = auth();
export const FirebaseFirestore = firestore();
export const FirebaseStorage = storage();
export const FirebaseFunctions = functions();

// Helper functions
export const uploadImage = async (uri: string, path: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const ref = FirebaseStorage.ref().child(path);
  await ref.put(blob);
  return await ref.getDownloadURL();
};

export const getCurrentUser = () => {
  return FirebaseAuth.currentUser;
};

export const signOut = async () => {
  await FirebaseAuth.signOut();
};

// Firestore collections
export const collections = {
  users: 'users',
  posts: 'posts',
  grades: 'grades',
  assignments: 'assignments',
  messages: 'messages',
  classes: 'classes',
  students: 'students'
}; 