import messaging from '@react-native-firebase/messaging';
import { FirebaseFirestore, collections } from './firebase';
import { AttendanceRecord } from './facialRecognition';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  timestamp: Date;
  read: boolean;
  type: 'attendance' | 'grade' | 'message' | 'event';
}

export const requestNotificationPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

export const saveNotificationToken = async (userId: string, token: string) => {
  try {
    await FirebaseFirestore.collection(collections.users).doc(userId).update({
      notificationToken: token,
    });
  } catch (error) {
    console.error('Error saving notification token:', error);
  }
};

export const sendAttendanceNotification = async (
  userId: string,
  attendanceRecord: AttendanceRecord
) => {
  try {
    const notification: Omit<Notification, 'id'> = {
      userId,
      title: 'Attendance Recorded',
      body: `Your child's attendance was recorded as ${attendanceRecord.status} at ${attendanceRecord.location}`,
      data: {
        attendanceId: attendanceRecord.id,
        type: 'attendance',
      },
      timestamp: new Date(),
      read: false,
      type: 'attendance',
    };

    // Save notification to Firestore
    await FirebaseFirestore.collection(collections.notifications).add(notification);

    // Get user's notification token
    const userDoc = await FirebaseFirestore.collection(collections.users)
      .doc(userId)
      .get();
    const token = userDoc.data()?.notificationToken;

    if (token) {
      // Send push notification
      await messaging().sendToDevice(token, {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
      });
    }
  } catch (error) {
    console.error('Error sending attendance notification:', error);
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await FirebaseFirestore.collection(collections.notifications)
      .doc(notificationId)
      .update({ read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const getUnreadNotifications = async (userId: string) => {
  try {
    const snapshot = await FirebaseFirestore.collection(collections.notifications)
      .where('userId', '==', userId)
      .where('read', '==', false)
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as Notification[];
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return [];
  }
};

export const setupNotificationHandlers = () => {
  // Handle notification when app is in foreground
  messaging().onMessage(async remoteMessage => {
    // You can show a local notification here
    console.log('Foreground message:', remoteMessage);
  });

  // Handle notification when app is in background
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message:', remoteMessage);
  });

  // Handle notification when app is opened from notification
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened app:', remoteMessage);
  });

  // Check if app was opened from notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('App opened from notification:', remoteMessage);
      }
    });
}; 