import { FirebaseFirestore, collections } from './firebase';
import { FirebaseStorage } from './firebase';
import { MLKitFaceDetection } from '@react-native-ml-kit/face-detection';
import { MLKitFaceRecognition } from '@react-native-ml-kit/face-recognition';

export interface FaceData {
  id: string;
  studentId: string;
  faceDescriptor: number[];
  imageUrl: string;
  timestamp: Date;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  timestamp: Date;
  location: string;
  status: 'present' | 'absent' | 'late';
  verifiedBy: string;
  imageUrl?: string;
}

export const detectFaces = async (imageUri: string) => {
  try {
    const faces = await MLKitFaceDetection.detectFaces(imageUri);
    return faces;
  } catch (error) {
    console.error('Error detecting faces:', error);
    throw error;
  }
};

export const recognizeFace = async (faceDescriptor: number[]) => {
  try {
    const matches = await MLKitFaceRecognition.recognizeFace(faceDescriptor);
    return matches;
  } catch (error) {
    console.error('Error recognizing face:', error);
    throw error;
  }
};

export const registerFace = async (studentId: string, imageUri: string) => {
  try {
    // Detect faces in the image
    const faces = await detectFaces(imageUri);
    if (faces.length === 0) {
      throw new Error('No face detected in the image');
    }

    // Get face descriptor
    const faceDescriptor = await MLKitFaceRecognition.getFaceDescriptor(imageUri);
    if (!faceDescriptor) {
      throw new Error('Could not extract face descriptor');
    }

    // Upload image to Firebase Storage
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const storageRef = FirebaseStorage.ref();
    const fileRef = storageRef.child(`faces/${studentId}/${Date.now()}.jpg`);
    await fileRef.put(blob);
    const imageUrl = await fileRef.getDownloadURL();

    // Save face data to Firestore
    const faceData: Omit<FaceData, 'id'> = {
      studentId,
      faceDescriptor,
      imageUrl,
      timestamp: new Date(),
    };

    const docRef = await FirebaseFirestore
      .collection(collections.faces)
      .add(faceData);

    return docRef.id;
  } catch (error) {
    console.error('Error registering face:', error);
    throw error;
  }
};

export const recordAttendance = async (
  studentId: string,
  location: string,
  imageUri?: string
) => {
  try {
    let imageUrl: string | undefined;

    if (imageUri) {
      // Upload attendance image
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const storageRef = FirebaseStorage.ref();
      const fileRef = storageRef.child(`attendance/${studentId}/${Date.now()}.jpg`);
      await fileRef.put(blob);
      imageUrl = await fileRef.getDownloadURL();
    }

    const attendanceRecord: Omit<AttendanceRecord, 'id'> = {
      studentId,
      timestamp: new Date(),
      location,
      status: 'present',
      verifiedBy: 'facial_recognition',
      imageUrl,
    };

    const docRef = await FirebaseFirestore
      .collection(collections.attendance)
      .add(attendanceRecord);

    return docRef.id;
  } catch (error) {
    console.error('Error recording attendance:', error);
    throw error;
  }
};

export const getStudentAttendance = async (studentId: string, startDate: Date, endDate: Date) => {
  try {
    const snapshot = await FirebaseFirestore
      .collection(collections.attendance)
      .where('studentId', '==', studentId)
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as AttendanceRecord[];
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

export const verifyAttendance = async (imageUri: string) => {
  try {
    // Detect faces in the image
    const faces = await detectFaces(imageUri);
    if (faces.length === 0) {
      throw new Error('No face detected in the image');
    }

    // Get face descriptor
    const faceDescriptor = await MLKitFaceRecognition.getFaceDescriptor(imageUri);
    if (!faceDescriptor) {
      throw new Error('Could not extract face descriptor');
    }

    // Find matching face in database
    const snapshot = await FirebaseFirestore
      .collection(collections.faces)
      .get();

    const faceData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as FaceData[];

    let bestMatch: { studentId: string; confidence: number } | null = null;

    for (const face of faceData) {
      const confidence = await MLKitFaceRecognition.compareFaceDescriptors(
        faceDescriptor,
        face.faceDescriptor
      );

      if (confidence > 0.8 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = {
          studentId: face.studentId,
          confidence,
        };
      }
    }

    return bestMatch;
  } catch (error) {
    console.error('Error verifying attendance:', error);
    throw error;
  }
}; 