import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({ navigation }: any) => {
  const { isDarkMode } = useTheme();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classroomCode, setClassroomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);

  const handleJoinClassroom = async () => {
    if (!classroomCode) {
      Alert.alert('Error', 'Please enter a classroom code');
      return;
    }
    setLoading(true);
    try {
      // Join classroom logic here
      setShowJoinModal(false);
      setClassroomCode('');
      // Refresh classrooms list
    } catch (error) {
      Alert.alert('Error', 'Failed to join classroom. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon
        name="school"
        size={64}
        color={isDarkMode ? '#666' : '#999'}
      />
      <Text
        style={[
          styles.emptyStateTitle,
          { color: isDarkMode ? '#fff' : '#000' },
        ]}
      >
        No Classrooms Yet
      </Text>
      <Text
        style={[
          styles.emptyStateText,
          { color: isDarkMode ? '#999' : '#666' },
        ]}
      >
        Join a classroom to start viewing content and updates.
      </Text>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => setShowJoinModal(true)}
      >
        <Text style={styles.joinButtonText}>Join Classroom</Text>
      </TouchableOpacity>
    </View>
  );

  const renderClassroomItem = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.classroomItem,
        { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
      ]}
      onPress={() => navigation.navigate('Classroom', { classroomId: item.id })}
    >
      <View style={styles.classroomInfo}>
        <Text
          style={[
            styles.classroomName,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.classroomCode,
            { color: isDarkMode ? '#999' : '#666' },
          ]}
        >
          Code: {item.code}
        </Text>
      </View>
      <Icon
        name="chevron-right"
        size={24}
        color={isDarkMode ? '#999' : '#666'}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#1E1E1E' : '#fff'}
      />
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          My Classrooms
        </Text>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => setShowJoinModal(true)}
        >
          <Text style={styles.joinButtonText}>Join Classroom</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={classrooms}
        renderItem={renderClassroomItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={showJoinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDarkMode ? '#333' : '#fff' },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              Join Classroom
            </Text>
            <Text
              style={[
                styles.modalText,
                { color: isDarkMode ? '#999' : '#666' },
              ]}
            >
              Enter the classroom code provided by your teacher or administrator.
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
              ]}
              placeholder="Classroom Code"
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              value={classroomCode}
              onChangeText={setClassroomCode}
              autoCapitalize="characters"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowJoinModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.joinButton]}
                onPress={handleJoinClassroom}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.joinButtonText}>Join</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    flexGrow: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  classroomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  classroomInfo: {
    flex: 1,
  },
  classroomName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  classroomCode: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 