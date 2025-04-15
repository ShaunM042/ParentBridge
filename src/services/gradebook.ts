import { FirebaseFirestore, collections } from './firebase';

export interface Grade {
  id: string;
  studentId: string;
  classId: string;
  assignmentId: string;
  score: number;
  maxScore: number;
  feedback: string;
  timestamp: Date;
  teacherId: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: Date;
  maxScore: number;
  type: 'homework' | 'quiz' | 'test' | 'project';
  attachments?: string[];
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  students: string[];
  schedule: {
    days: string[];
    time: string;
  };
}

export const getStudentGrades = async (studentId: string) => {
  try {
    const snapshot = await FirebaseFirestore
      .collection(collections.grades)
      .where('studentId', '==', studentId)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as Grade[];
  } catch (error) {
    console.error('Error fetching student grades:', error);
    throw error;
  }
};

export const getClassAssignments = async (classId: string) => {
  try {
    const snapshot = await FirebaseFirestore
      .collection(collections.assignments)
      .where('classId', '==', classId)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate.toDate(),
    })) as Assignment[];
  } catch (error) {
    console.error('Error fetching class assignments:', error);
    throw error;
  }
};

export const getStudentClasses = async (studentId: string) => {
  try {
    const snapshot = await FirebaseFirestore
      .collection(collections.classes)
      .where('students', 'array-contains', studentId)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Class[];
  } catch (error) {
    console.error('Error fetching student classes:', error);
    throw error;
  }
};

export const addGrade = async (grade: Omit<Grade, 'id' | 'timestamp'>) => {
  try {
    const docRef = await FirebaseFirestore.collection(collections.grades).add({
      ...grade,
      timestamp: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding grade:', error);
    throw error;
  }
};

export const updateGrade = async (gradeId: string, updates: Partial<Grade>) => {
  try {
    await FirebaseFirestore
      .collection(collections.grades)
      .doc(gradeId)
      .update(updates);
  } catch (error) {
    console.error('Error updating grade:', error);
    throw error;
  }
};

export const calculateAverageGrade = (grades: Grade[]) => {
  if (grades.length === 0) return 0;
  
  const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);
  const totalMaxScore = grades.reduce((sum, grade) => sum + grade.maxScore, 0);
  
  return (totalScore / totalMaxScore) * 100;
}; 