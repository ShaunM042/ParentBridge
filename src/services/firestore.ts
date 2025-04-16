import firestore from '@react-native-firebase/firestore';

export const db = firestore();

export const collections = {
  USERS: 'users',
  POSTS: 'posts',
  COMMENTS: 'comments',
  MESSAGES: 'messages',
} as const;

export const firestoreService = {
  // User operations
  async getUser(uid: string) {
    const doc = await db.collection(collections.USERS).doc(uid).get();
    return doc.data();
  },

  async updateUser(uid: string, data: any) {
    await db.collection(collections.USERS).doc(uid).update(data);
  },

  // Post operations
  async createPost(data: any) {
    const docRef = await db.collection(collections.POSTS).add({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  },

  async getPosts(limit = 10) {
    const snapshot = await db
      .collection(collections.POSTS)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Message operations
  async sendMessage(chatId: string, data: any) {
    await db
      .collection(collections.MESSAGES)
      .doc(chatId)
      .collection('messages')
      .add({
        ...data,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  },

  async getMessages(chatId: string, limit = 20) {
    const snapshot = await db
      .collection(collections.MESSAGES)
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
}; 