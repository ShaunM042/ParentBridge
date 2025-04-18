import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getFirestore, collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  createdAt: Date;
  read: boolean;
}

export const registerForPushNotifications = async () => {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
};

export const sendPushNotification = async (token: string, title: string, body: string, data?: any) => {
  const message = {
    to: token,
    sound: 'default',
    title,
    body,
    data,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
};

export const createNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: any
) => {
  const db = getFirestore();
  const notificationsRef = collection(db, 'notifications');
  
  await addDoc(notificationsRef, {
    userId,
    title,
    body,
    data,
    createdAt: new Date(),
    read: false,
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  const db = getFirestore();
  const notificationsRef = collection(db, 'notifications');
  
  await addDoc(notificationsRef, {
    id: notificationId,
    read: true,
  });
};

export const subscribeToNotifications = (
  callback: (notifications: Notification[]) => void
) => {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  
  if (!userId) {
    return () => {};
  }

  const db = getFirestore();
  const notificationsRef = collection(db, 'notifications');
  const q = query(notificationsRef, where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Notification[];
    
    callback(notifications);
  });
};

export const sendClassroomNotification = async (
  classroomId: string,
  title: string,
  body: string,
  data?: any
) => {
  const db = getFirestore();
  const membersRef = collection(db, 'classrooms', classroomId, 'members');
  
  // Get all members of the classroom
  const membersSnapshot = await membersRef.get();
  const members = membersSnapshot.docs.map((doc) => doc.id);

  // Create notifications for each member
  await Promise.all(
    members.map((memberId) =>
      createNotification(memberId, title, body, {
        ...data,
        classroomId,
      })
    )
  );
}; 