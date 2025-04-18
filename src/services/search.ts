import { getFirestore, collection, query, where, getDocs, orderBy, startAt, endAt } from 'firebase/firestore';

export interface SearchResult {
  id: string;
  type: 'post' | 'classroom';
  title: string;
  content?: string;
  classroomId?: string;
  createdAt?: Date;
}

export const searchPosts = async (queryText: string, classroomId?: string) => {
  const db = getFirestore();
  const postsRef = collection(db, 'posts');
  
  let q = query(
    postsRef,
    where('title', '>=', queryText),
    where('title', '<=', queryText + '\uf8ff'),
    orderBy('title')
  );

  if (classroomId) {
    q = query(q, where('classroomId', '==', classroomId));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    type: 'post' as const,
    title: doc.data().title,
    content: doc.data().content,
    classroomId: doc.data().classroomId,
    createdAt: doc.data().createdAt.toDate(),
  }));
};

export const searchClassrooms = async (queryText: string) => {
  const db = getFirestore();
  const classroomsRef = collection(db, 'classrooms');
  
  const q = query(
    classroomsRef,
    where('name', '>=', queryText),
    where('name', '<=', queryText + '\uf8ff'),
    orderBy('name')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    type: 'classroom' as const,
    title: doc.data().name,
  }));
};

export const searchAll = async (queryText: string) => {
  const [posts, classrooms] = await Promise.all([
    searchPosts(queryText),
    searchClassrooms(queryText),
  ]);

  return [...posts, ...classrooms].sort((a, b) => {
    if (a.type === 'classroom' && b.type === 'post') return -1;
    if (a.type === 'post' && b.type === 'classroom') return 1;
    return 0;
  });
}; 