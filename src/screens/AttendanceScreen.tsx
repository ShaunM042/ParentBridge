import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Camera } from 'react-native-vision-camera';
import {
  registerFace,
  recordAttendance,
  getStudentAttendance,
  AttendanceRecord,
  verifyAttendance,
} from '../services/facialRecognition';
import {
  requestNotificationPermission,
  sendAttendanceNotification,
} from '../services/notifications';
import { format } from 'date-fns';

const AttendanceScreen = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = React.useRef<Camera>(null);

  useEffect(() => {
    checkCameraPermission();
    fetchAttendanceRecords();
    setupNotifications();
  }, [user]);

  const setupNotifications = async () => {
    if (!user) return;
    
    try {
      const token = await requestNotificationPermission();
      if (token) {
        // Save token to user's profile
        await saveNotificationToken(user.id, token);
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const checkCameraPermission = async () => {
    const permission = await Camera.requestCameraPermission();
    setCameraPermission(permission === 'authorized');
  };

  const fetchAttendanceRecords = async () => {
    if (!user?.children?.[0]) return;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      const endDate = new Date();

      const records = await getStudentAttendance(
        user.children[0],
        startDate,
        endDate
      );
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      Alert.alert('Error', 'Failed to fetch attendance records');
    }
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      setLoading(true);
      const photo = await cameraRef.current.takePhoto();
      
      // Verify face and record attendance
      const match = await verifyAttendance(photo.path);
      
      if (match) {
        const attendanceRecord = await recordAttendance(match.studentId, 'School Entrance', photo.path);
        
        // Send notification to parent
        if (user) {
          await sendAttendanceNotification(user.id, attendanceRecord);
        }
        
        Alert.alert('Success', 'Attendance recorded successfully');
        fetchAttendanceRecords();
      } else {
        Alert.alert('Error', 'Face not recognized. Please try again.');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to record attendance');
    } finally {
      setLoading(false);
      setShowCamera(false);
    }
  };

  const handleRegisterFace = async () => {
    if (!cameraRef.current) return;

    try {
      setLoading(true);
      const photo = await cameraRef.current.takePhoto();
      
      if (!user?.children?.[0]) {
        throw new Error('No student selected');
      }

      await registerFace(user.children[0], photo.path);
      Alert.alert('Success', 'Face registered successfully');
    } catch (error) {
      console.error('Error registering face:', error);
      Alert.alert('Error', 'Failed to register face');
    } finally {
      setLoading(false);
      setShowCamera(false);
    }
  };

  const renderAttendanceRecord = (record: AttendanceRecord) => (
    <View
      key={record.id}
      style={[styles.recordItem, isDarkMode && styles.darkRecordItem]}
    >
      <View style={styles.recordHeader}>
        <Text style={[styles.recordDate, isDarkMode && styles.darkText]}>
          {format(record.timestamp, 'MMM d, yyyy h:mm a')}
        </Text>
        <Text
          style={[
            styles.recordStatus,
            record.status === 'present' && styles.presentStatus,
            record.status === 'late' && styles.lateStatus,
            isDarkMode && styles.darkText,
          ]}
        >
          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
        </Text>
      </View>
      <Text style={[styles.recordLocation, isDarkMode && styles.darkText]}>
        {record.location}
      </Text>
      {record.imageUrl && (
        <Image
          source={{ uri: record.imageUrl }}
          style={styles.recordImage}
          resizeMode="cover"
        />
      )}
    </View>
  );

  if (showCamera) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device="front"
          isActive={true}
          photo={true}
        />
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleTakePhoto}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="camera" size={32} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Attendance
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={() => setShowCamera(true)}
          >
            <Icon name="face" size={24} color="#fff" />
            <Text style={styles.buttonText}>Register Face</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.checkInButton]}
            onPress={() => setShowCamera(true)}
          >
            <Icon name="check-circle" size={24} color="#fff" />
            <Text style={styles.buttonText}>Check In</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recordsContainer}>
        {attendanceRecords.map(renderAttendanceRecord)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  registerButton: {
    backgroundColor: '#007AFF',
  },
  checkInButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cameraButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordsContainer: {
    flex: 1,
    padding: 16,
  },
  recordItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  darkRecordItem: {
    backgroundColor: '#1e1e1e',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  presentStatus: {
    color: '#34C759',
  },
  lateStatus: {
    color: '#FF9500',
  },
  recordLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recordImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  darkText: {
    color: '#fff',
  },
});

export default AttendanceScreen; 