import { FirebaseFirestore, collections } from './firebase';
import { FirebaseStorage } from './firebase';

export interface Classroom {
  id: string;
  name: string;
  code: string;
  description?: string;
  teacherId: string;
  admins: string[];
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassroomMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface Post {
  id: string;
  classroomId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

export const getClassroom = async (classroomId: string): Promise<Classroom> => {
  try {
    const doc = await FirebaseFirestore
      .collection(collections.classes)
      .doc(classroomId)
      .get();

    if (!doc.exists) {
      throw new Error('Classroom not found');
    }

    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt.toDate(),
      updatedAt: doc.data()?.updatedAt.toDate(),
    } as Classroom;
  } catch (error) {
    console.error('Error fetching classroom:', error);
    throw error;
  }
};

export const getClassroomMembers = async (classroomId: string): Promise<ClassroomMember[]> => {
  try {
    const classroom = await getClassroom(classroomId);
    const memberIds = [...classroom.admins, ...classroom.members];
    
    const members = await Promise.all(
      memberIds.map(async (userId) => {
        const userDoc = await FirebaseFirestore
          .collection(collections.users)
          .doc(userId)
          .get();

        return {
          id: userId,
          name: userDoc.data()?.displayName,
          email: userDoc.data()?.email,
          role: classroom.admins.includes(userId) ? 'admin' : 'member',
          joinedAt: classroom.createdAt,
        } as ClassroomMember;
      })
    );

    return members;
  } catch (error) {
    console.error('Error fetching classroom members:', error);
    throw error;
  }
};

export const getClassroomPosts = async (classroomId: string): Promise<Post[]> => {
  try {
    const snapshot = await FirebaseFirestore
      .collection(collections.posts)
      .where('classroomId', '==', classroomId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt.toDate(),
      updatedAt: doc.data()?.updatedAt.toDate(),
    })) as Post[];
  } catch (error) {
    console.error('Error fetching classroom posts:', error);
    throw error;
  }
};

export const createPost = async (
  classroomId: string,
  authorId: string,
  authorName: string,
  title: string,
  content: string,
  attachments: Omit<Attachment, 'id' | 'uploadedAt'>[]
): Promise<string> => {
  try {
    const postData: Omit<Post, 'id'> = {
      classroomId,
      authorId,
      authorName,
      title,
      content,
      attachments: attachments.map(attachment => ({
        ...attachment,
        id: Math.random().toString(36).substr(2, 9),
        uploadedAt: new Date(),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await FirebaseFirestore
      .collection(collections.posts)
      .add(postData);

    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const uploadAttachment = async (
  uri: string,
  type: 'image' | 'file',
  name: string
): Promise<{ url: string; size: number }> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = FirebaseStorage.ref();
    const fileRef = storageRef.child(`attachments/${Date.now()}_${name}`);
    await fileRef.put(blob);
    const url = await fileRef.getDownloadURL();
    return { url, size: blob.size };
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
};

export const updateClassroomName = async (
  classroomId: string,
  name: string
): Promise<void> => {
  try {
    await FirebaseFirestore
      .collection(collections.classes)
      .doc(classroomId)
      .update({
        name,
        updatedAt: new Date(),
      });
  } catch (error) {
    console.error('Error updating classroom name:', error);
    throw error;
  }
};

export const updateClassroomCode = async (
  classroomId: string,
  code: string
): Promise<void> => {
  try {
    await FirebaseFirestore
      .collection(collections.classes)
      .doc(classroomId)
      .update({
        code,
        updatedAt: new Date(),
      });
  } catch (error) {
    console.error('Error updating classroom code:', error);
    throw error;
  }
};

export const addMember = async (
  classroomId: string,
  userId: string,
  isAdmin: boolean = false
): Promise<void> => {
  try {
    const classroom = await getClassroom(classroomId);
    const field = isAdmin ? 'admins' : 'members';
    
    await FirebaseFirestore
      .collection(collections.classes)
      .doc(classroomId)
      .update({
        [field]: [...new Set([...classroom[field], userId])],
        updatedAt: new Date(),
      });
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

export const removeMember = async (
  classroomId: string,
  userId: string
): Promise<void> => {
  try {
    const classroom = await getClassroom(classroomId);
    
    await FirebaseFirestore
      .collection(collections.classes)
      .doc(classroomId)
      .update({
        admins: classroom.admins.filter(id => id !== userId),
        members: classroom.members.filter(id => id !== userId),
        updatedAt: new Date(),
      });
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

export const subscribeToClassroom = (
  classroomId: string,
  onUpdate: (classroom: Classroom) => void
): (() => void) => {
  return FirebaseFirestore
    .collection(collections.classes)
    .doc(classroomId)
    .onSnapshot(doc => {
      if (doc.exists) {
        const classroom = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data()?.createdAt.toDate(),
          updatedAt: doc.data()?.updatedAt.toDate(),
        } as Classroom;
        onUpdate(classroom);
      }
    });
};

export const subscribeToPosts = (
  classroomId: string,
  onUpdate: (posts: Post[]) => void
): (() => void) => {
  return FirebaseFirestore
    .collection(collections.posts)
    .where('classroomId', '==', classroomId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt.toDate(),
        updatedAt: doc.data()?.updatedAt.toDate(),
      })) as Post[];
      onUpdate(posts);
    });
}; 