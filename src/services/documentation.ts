import { getFirestore, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

export interface Documentation {
  id: string;
  title: string;
  content: string;
  category: string;
  lastUpdated: Date;
  language: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  lastUpdated: Date;
  language: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  resolution?: string;
}

export const getDocumentation = async (language: string = 'en'): Promise<Documentation[]> => {
  const db = getFirestore();
  const docsRef = collection(db, 'documentation');
  const q = query(docsRef, where('language', '==', language));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Documentation[];
};

export const getFAQ = async (language: string = 'en'): Promise<FAQ[]> => {
  const db = getFirestore();
  const faqRef = collection(db, 'faq');
  const q = query(faqRef, where('language', '==', language));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as FAQ[];
};

export const createSupportTicket = async (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const db = getFirestore();
  const ticketsRef = collection(db, 'supportTickets');
  
  const newTicket: Omit<SupportTicket, 'id'> = {
    ...ticket,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const docRef = await addDoc(ticketsRef, newTicket);
  return docRef.id;
};

export const getSupportTickets = async (userId: string): Promise<SupportTicket[]> => {
  const db = getFirestore();
  const ticketsRef = collection(db, 'supportTickets');
  const q = query(ticketsRef, where('userId', '==', userId));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as SupportTicket[];
};

export const getSupportTicket = async (ticketId: string): Promise<SupportTicket | null> => {
  const db = getFirestore();
  const ticketRef = doc(db, 'supportTickets', ticketId);
  const ticketSnap = await getDoc(ticketRef);
  
  if (ticketSnap.exists()) {
    return {
      id: ticketSnap.id,
      ...ticketSnap.data(),
    } as SupportTicket;
  }
  
  return null;
};

export const updateSupportTicket = async (
  ticketId: string,
  updates: Partial<SupportTicket>
): Promise<void> => {
  const db = getFirestore();
  const ticketRef = doc(db, 'supportTickets', ticketId);
  
  await updateDoc(ticketRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const searchDocumentation = async (
  query: string,
  language: string = 'en'
): Promise<Documentation[]> => {
  const db = getFirestore();
  const docsRef = collection(db, 'documentation');
  const q = query(
    docsRef,
    where('language', '==', language),
    where('searchKeywords', 'array-contains', query.toLowerCase())
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Documentation[];
};

export const getDocumentationCategories = async (language: string = 'en'): Promise<string[]> => {
  const db = getFirestore();
  const docsRef = collection(db, 'documentation');
  const q = query(docsRef, where('language', '==', language));
  
  const querySnapshot = await getDocs(q);
  const categories = new Set<string>();
  
  querySnapshot.docs.forEach(doc => {
    const data = doc.data() as Documentation;
    categories.add(data.category);
  });
  
  return Array.from(categories);
}; 