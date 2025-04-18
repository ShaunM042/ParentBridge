import { FirebaseFirestore, collections } from './firebase';
import { setNotificationVolume } from './sound';

export interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // Format: "HH:mm"
    endTime: string; // Format: "HH:mm"
  };
  types: {
    attendance: boolean;
    grade: boolean;
    message: boolean;
    event: boolean;
  };
  sound: {
    enabled: boolean;
    volume: number;
  };
  haptic: {
    enabled: boolean;
  };
  grouping: {
    enabled: boolean;
    byType: boolean;
    byDate: boolean;
  };
}

export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences> => {
  try {
    const doc = await FirebaseFirestore.collection(collections.notificationPreferences)
      .doc(userId)
      .get();

    if (doc.exists) {
      return doc.data() as NotificationPreferences;
    }

    // Return default preferences if none exist
    return {
      userId,
      enabled: true,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '07:00',
      },
      types: {
        attendance: true,
        grade: true,
        message: true,
        event: true,
      },
      sound: {
        enabled: true,
        volume: 0.8,
      },
      haptic: {
        enabled: true,
      },
      grouping: {
        enabled: true,
        byType: true,
        byDate: true,
      },
    };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }
};

export const updateNotificationPreferences = async (
  userId: string,
  preferences: Partial<NotificationPreferences>
) => {
  try {
    await FirebaseFirestore.collection(collections.notificationPreferences)
      .doc(userId)
      .set(preferences, { merge: true });

    // Update sound volume if changed
    if (preferences.sound?.volume !== undefined) {
      setNotificationVolume(preferences.sound.volume);
    }
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

export const isWithinQuietHours = (preferences: NotificationPreferences): boolean => {
  if (!preferences.quietHours.enabled) return false;

  const now = new Date();
  const [startHour, startMinute] = preferences.quietHours.startTime.split(':').map(Number);
  const [endHour, endMinute] = preferences.quietHours.endTime.split(':').map(Number);

  const startTime = new Date();
  startTime.setHours(startHour, startMinute, 0, 0);

  const endTime = new Date();
  endTime.setHours(endHour, endMinute, 0, 0);

  // Handle overnight quiet hours
  if (endTime < startTime) {
    return now >= startTime || now <= endTime;
  }

  return now >= startTime && now <= endTime;
};

export const shouldNotify = (
  preferences: NotificationPreferences,
  notificationType: keyof NotificationPreferences['types']
): boolean => {
  if (!preferences.enabled) return false;
  if (isWithinQuietHours(preferences)) return false;
  return preferences.types[notificationType];
}; 