import { FirebaseFirestore, collections } from './firebase';
import { FirebaseStorage } from './firebase';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: Date;
}

export const getConversations = async (userId: string) => {
  try {
    const snapshot = await FirebaseFirestore
      .collection(collections.conversations)
      .where('participants', 'array-contains', userId)
      .orderBy('updatedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessage: {
        ...doc.data().lastMessage,
        timestamp: doc.data().lastMessage.timestamp.toDate(),
      },
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Conversation[];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

export const getMessages = async (conversationId: string) => {
  try {
    const snapshot = await FirebaseFirestore
      .collection(collections.conversations)
      .doc(conversationId)
      .collection(collections.messages)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as Message[];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (
  conversationId: string,
  message: Omit<Message, 'id' | 'timestamp' | 'status'>
) => {
  try {
    const newMessage = {
      ...message,
      timestamp: new Date(),
      status: 'sent',
    };

    const messageRef = await FirebaseFirestore
      .collection(collections.conversations)
      .doc(conversationId)
      .collection(collections.messages)
      .add(newMessage);

    // Update conversation's last message and timestamp
    await FirebaseFirestore
      .collection(collections.conversations)
      .doc(conversationId)
      .update({
        lastMessage: newMessage,
        updatedAt: new Date(),
      });

    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const uploadFile = async (
  fileUri: string,
  fileName: string,
  fileType: string
) => {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const storageRef = FirebaseStorage.ref();
    const fileRef = storageRef.child(`messages/${Date.now()}-${fileName}`);

    await fileRef.put(blob);
    const downloadUrl = await fileRef.getDownloadURL();

    return {
      url: downloadUrl,
      name: fileName,
      size: blob.size,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const markMessageAsRead = async (conversationId: string, messageId: string) => {
  try {
    await FirebaseFirestore
      .collection(collections.conversations)
      .doc(conversationId)
      .collection(collections.messages)
      .doc(messageId)
      .update({
        status: 'read',
      });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const createConversation = async (participants: string[]) => {
  try {
    const conversationRef = await FirebaseFirestore
      .collection(collections.conversations)
      .add({
        participants,
        unreadCount: 0,
        updatedAt: new Date(),
      });

    return conversationRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  return FirebaseFirestore
    .collection(collections.conversations)
    .doc(conversationId)
    .collection(collections.messages)
    .orderBy('timestamp', 'desc')
    .limit(50)
    .onSnapshot(snapshot => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as Message[];
      callback(messages);
    });
};

export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  return FirebaseFirestore
    .collection(collections.conversations)
    .where('participants', 'array-contains', userId)
    .orderBy('updatedAt', 'desc')
    .onSnapshot(snapshot => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessage: {
          ...doc.data().lastMessage,
          timestamp: doc.data().lastMessage.timestamp.toDate(),
        },
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Conversation[];
      callback(conversations);
    });
}; 