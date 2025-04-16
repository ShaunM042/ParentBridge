import { FirebaseFirestore, collections } from './firebase';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: 'assignment' | 'meeting' | 'event';
  location?: string;
  participants: string[];
  studentId?: string;
  classId?: string;
  teacherId?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reminder?: Date;
}

export const getStudentEvents = async (studentId: string) => {
  try {
    const snapshot = await FirebaseFirestore
      .collection(collections.events)
      .where('participants', 'array-contains', studentId)
      .orderBy('startTime', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime.toDate(),
      endTime: doc.data().endTime.toDate(),
      reminder: doc.data().reminder?.toDate(),
    })) as CalendarEvent[];
  } catch (error) {
    console.error('Error fetching student events:', error);
    throw error;
  }
};

export const getUpcomingEvents = async (studentId: string, days: number = 7) => {
  try {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + days);

    const snapshot = await FirebaseFirestore
      .collection(collections.events)
      .where('participants', 'array-contains', studentId)
      .where('startTime', '>=', now)
      .where('startTime', '<=', endDate)
      .orderBy('startTime', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime.toDate(),
      endTime: doc.data().endTime.toDate(),
      reminder: doc.data().reminder?.toDate(),
    })) as CalendarEvent[];
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

export const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
  try {
    const docRef = await FirebaseFirestore.collection(collections.events).add({
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      reminder: event.reminder ? new Date(event.reminder) : null,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
};

export const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
  try {
    const eventUpdates = { ...updates };
    if (updates.startTime) eventUpdates.startTime = new Date(updates.startTime);
    if (updates.endTime) eventUpdates.endTime = new Date(updates.endTime);
    if (updates.reminder) eventUpdates.reminder = new Date(updates.reminder);

    await FirebaseFirestore
      .collection(collections.events)
      .doc(eventId)
      .update(eventUpdates);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    await FirebaseFirestore
      .collection(collections.events)
      .doc(eventId)
      .delete();
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const getEventsByDate = async (studentId: string, date: Date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const snapshot = await FirebaseFirestore
      .collection(collections.events)
      .where('participants', 'array-contains', studentId)
      .where('startTime', '>=', startOfDay)
      .where('startTime', '<=', endOfDay)
      .orderBy('startTime', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime.toDate(),
      endTime: doc.data().endTime.toDate(),
      reminder: doc.data().reminder?.toDate(),
    })) as CalendarEvent[];
  } catch (error) {
    console.error('Error fetching events by date:', error);
    throw error;
  }
}; 