import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface Feedback {
  id?: string;
  userId: string;
  type: 'bug' | 'feature' | 'suggestion' | 'other';
  title: string;
  description: string;
  screenshotUrl?: string;
  deviceInfo: {
    platform: string;
    version: string;
    model: string;
  };
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export const submitFeedback = async (feedback: Omit<Feedback, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const db = getFirestore();
  const feedbackRef = collection(db, 'feedback');
  
  const newFeedback: Omit<Feedback, 'id'> = {
    ...feedback,
    status: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const docRef = await addDoc(feedbackRef, newFeedback);
  return docRef.id;
};

export const uploadScreenshot = async (userId: string, uri: string): Promise<string> => {
  const storage = getStorage();
  const response = await fetch(uri);
  const blob = await response.blob();
  
  const screenshotRef = ref(storage, `feedback/${userId}/${Date.now()}.jpg`);
  await uploadBytes(screenshotRef, blob);
  
  return await getDownloadURL(screenshotRef);
};

export const getFeedbackHistory = async (userId: string): Promise<Feedback[]> => {
  const db = getFirestore();
  const feedbackRef = collection(db, 'feedback');
  const q = query(feedbackRef, where('userId', '==', userId));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Feedback[];
};

export const getFeedbackStatus = async (feedbackId: string): Promise<Feedback['status']> => {
  const db = getFirestore();
  const feedbackRef = collection(db, 'feedback');
  const q = query(feedbackRef, where('id', '==', feedbackId));
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    throw new Error('Feedback not found');
  }
  
  return querySnapshot.docs[0].data().status as Feedback['status'];
}; 