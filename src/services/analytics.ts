import { getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface ClassroomAnalytics {
  totalPosts: number;
  totalMembers: number;
  activeMembers: number;
  postsByDay: { [key: string]: number };
  postsByMember: { [key: string]: number };
  averagePostLength: number;
  attachmentTypes: {
    image: number;
    file: number;
  };
}

export interface MemberAnalytics {
  totalPosts: number;
  totalComments: number;
  averagePostLength: number;
  lastActive: Date;
  attachmentTypes: {
    image: number;
    file: number;
  };
}

const getLast30Days = () => {
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

export const getClassroomAnalytics = async (classroomId: string): Promise<ClassroomAnalytics> => {
  const db = getFirestore();
  const postsRef = collection(db, 'posts');
  const membersRef = collection(db, 'classrooms', classroomId, 'members');

  // Get all posts for the classroom
  const postsQuery = query(postsRef, where('classroomId', '==', classroomId));
  const postsSnapshot = await getDocs(postsQuery);
  const posts = postsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  }));

  // Get all members
  const membersSnapshot = await getDocs(membersRef);
  const members = membersSnapshot.docs.map(doc => doc.id);

  // Calculate analytics
  const postsByDay: { [key: string]: number } = {};
  const postsByMember: { [key: string]: number } = {};
  let totalPostLength = 0;
  const attachmentTypes = {
    image: 0,
    file: 0,
  };

  // Initialize postsByDay for last 30 days
  getLast30Days().forEach(date => {
    postsByDay[date] = 0;
  });

  // Process posts
  posts.forEach(post => {
    const date = post.createdAt.toISOString().split('T')[0];
    postsByDay[date] = (postsByDay[date] || 0) + 1;
    
    postsByMember[post.authorId] = (postsByMember[post.authorId] || 0) + 1;
    totalPostLength += post.content.length;

    if (post.attachments) {
      post.attachments.forEach(attachment => {
        if (attachment.type === 'image') {
          attachmentTypes.image++;
        } else if (attachment.type === 'file') {
          attachmentTypes.file++;
        }
      });
    }
  });

  // Calculate active members (members who posted in the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeMembers = Object.keys(postsByMember).filter(memberId => {
    const memberPosts = posts.filter(post => post.authorId === memberId);
    return memberPosts.some(post => post.createdAt > thirtyDaysAgo);
  }).length;

  return {
    totalPosts: posts.length,
    totalMembers: members.length,
    activeMembers,
    postsByDay,
    postsByMember,
    averagePostLength: posts.length > 0 ? totalPostLength / posts.length : 0,
    attachmentTypes,
  };
};

export const getMemberAnalytics = async (
  classroomId: string,
  memberId: string
): Promise<MemberAnalytics> => {
  const db = getFirestore();
  const postsRef = collection(db, 'posts');
  const commentsRef = collection(db, 'comments');

  // Get all posts by the member
  const postsQuery = query(
    postsRef,
    where('classroomId', '==', classroomId),
    where('authorId', '==', memberId)
  );
  const postsSnapshot = await getDocs(postsQuery);
  const posts = postsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  }));

  // Get all comments by the member
  const commentsQuery = query(
    commentsRef,
    where('classroomId', '==', classroomId),
    where('authorId', '==', memberId)
  );
  const commentsSnapshot = await getDocs(commentsQuery);
  const comments = commentsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  }));

  // Calculate analytics
  let totalPostLength = 0;
  const attachmentTypes = {
    image: 0,
    file: 0,
  };

  posts.forEach(post => {
    totalPostLength += post.content.length;
    if (post.attachments) {
      post.attachments.forEach(attachment => {
        if (attachment.type === 'image') {
          attachmentTypes.image++;
        } else if (attachment.type === 'file') {
          attachmentTypes.file++;
        }
      });
    }
  });

  const lastActive = posts.length > 0
    ? posts[posts.length - 1].createdAt
    : comments.length > 0
    ? comments[comments.length - 1].createdAt
    : new Date(0);

  return {
    totalPosts: posts.length,
    totalComments: comments.length,
    averagePostLength: posts.length > 0 ? totalPostLength / posts.length : 0,
    lastActive,
    attachmentTypes,
  };
}; 