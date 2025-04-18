import firestore from '@react-native-firebase/firestore';

export interface SupportTicket {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'technical' | 'account' | 'billing' | 'general';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  attachments?: {
    url: string;
    name: string;
    type: string;
  }[];
  messages: {
    id: string;
    userId: string;
    content: string;
    timestamp: Date;
    attachments?: {
      url: string;
      name: string;
      type: string;
    }[];
  }[];
}

export const createTicket = async (
  userId: string,
  title: string,
  description: string,
  category: SupportTicket['category'],
  priority: SupportTicket['priority'] = 'medium'
): Promise<SupportTicket> => {
  try {
    const ticketData: Omit<SupportTicket, 'id'> = {
      userId,
      title,
      description,
      category,
      status: 'open',
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };

    const ticketRef = await firestore()
      .collection('supportTickets')
      .add(ticketData);

    return {
      id: ticketRef.id,
      ...ticketData,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create support ticket');
  }
};

export const getTickets = async (userId: string): Promise<SupportTicket[]> => {
  try {
    const snapshot = await firestore()
      .collection('supportTickets')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as SupportTicket[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch support tickets');
  }
};

export const getTicket = async (ticketId: string): Promise<SupportTicket> => {
  try {
    const doc = await firestore()
      .collection('supportTickets')
      .doc(ticketId)
      .get();

    if (!doc.exists) {
      throw new Error('Ticket not found');
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as SupportTicket;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch support ticket');
  }
};

export const updateTicket = async (
  ticketId: string,
  updates: Partial<SupportTicket>
): Promise<void> => {
  try {
    await firestore()
      .collection('supportTickets')
      .doc(ticketId)
      .update({
        ...updates,
        updatedAt: new Date(),
      });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update support ticket');
  }
};

export const addMessage = async (
  ticketId: string,
  userId: string,
  content: string,
  attachments?: SupportTicket['messages'][0]['attachments']
): Promise<void> => {
  try {
    const message = {
      id: firestore().collection('_').doc().id,
      userId,
      content,
      timestamp: new Date(),
      attachments,
    };

    await firestore()
      .collection('supportTickets')
      .doc(ticketId)
      .update({
        messages: firestore.FieldValue.arrayUnion(message),
        updatedAt: new Date(),
      });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add message to ticket');
  }
};

export const uploadAttachment = async (
  ticketId: string,
  fileUri: string,
  fileName: string,
  fileType: string
): Promise<string> => {
  try {
    // TODO: Implement file upload to Firebase Storage
    // This is a placeholder for the actual implementation
    return 'https://example.com/attachment-url';
  } catch (error: any) {
    throw new Error(error.message || 'Failed to upload attachment');
  }
};

export const subscribeToTickets = (
  userId: string,
  callback: (tickets: SupportTicket[]) => void
): (() => void) => {
  return firestore()
    .collection('supportTickets')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      const tickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SupportTicket[];
      callback(tickets);
    });
};

export const subscribeToTicket = (
  ticketId: string,
  callback: (ticket: SupportTicket) => void
): (() => void) => {
  return firestore()
    .collection('supportTickets')
    .doc(ticketId)
    .onSnapshot(doc => {
      if (doc.exists) {
        callback({
          id: doc.id,
          ...doc.data(),
        } as SupportTicket);
      }
    });
}; 