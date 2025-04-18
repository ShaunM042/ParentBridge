import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile, deleteAccount } from '../services/auth';

const AccountScreen = ({ navigation }: any) => {
  const { isDarkMode } = useTheme();
  const { user, signOut } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a valid name');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name, photoURL: profileImage });
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Implement password change logic here
      setShowPasswordModal(false);
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteAccount();
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowEditModal(false)}
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
            Edit Profile
          </Text>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={handleImagePick}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <Icon
                name="add-a-photo"
                size={40}
                color={isDarkMode ? '#fff' : '#000'}
              />
            )}
          </TouchableOpacity>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
            ]}
            placeholder="Name"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={name}
            onChangeText={setName}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPasswordModal(false)}
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
            Change Password
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
            ]}
            placeholder="Current Password"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
            ]}
            placeholder="New Password"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
            ]}
            placeholder="Confirm New Password"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowPasswordModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Change</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDeleteModal = () => (
    <Modal
      visible={showDeleteModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowDeleteModal(false)}
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
            Delete Account
          </Text>
          <Text
            style={[
              styles.modalText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Are you sure you want to delete your account? This action cannot be undone.
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowDeleteModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
          Account
        </Text>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={() => setShowEditModal(true)}
        >
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={styles.profileImage}
            />
          ) : (
            <Icon
              name="account-circle"
              size={80}
              color={isDarkMode ? '#fff' : '#000'}
            />
          )}
        </TouchableOpacity>
        <Text
          style={[
            styles.profileName,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          {user?.name}
        </Text>
        <Text
          style={[
            styles.profileEmail,
            { color: isDarkMode ? '#999' : '#666' },
          ]}
        >
          {user?.email}
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <TouchableOpacity
          style={[
            styles.settingItem,
            { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
          ]}
          onPress={() => setShowEditModal(true)}
        >
          <Icon
            name="edit"
            size={24}
            color={isDarkMode ? '#fff' : '#000'}
          />
          <Text
            style={[
              styles.settingText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
          ]}
          onPress={() => setShowPasswordModal(true)}
        >
          <Icon
            name="lock"
            size={24}
            color={isDarkMode ? '#fff' : '#000'}
          />
          <Text
            style={[
              styles.settingText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Change Password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
          ]}
          onPress={() => setShowDeleteModal(true)}
        >
          <Icon
            name="delete"
            size={24}
            color="#FF3B30"
          />
          <Text
            style={[
              styles.settingText,
              { color: '#FF3B30' },
            ]}
          >
            Delete Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
          ]}
          onPress={signOut}
        >
          <Icon
            name="logout"
            size={24}
            color={isDarkMode ? '#fff' : '#000'}
          />
          <Text
            style={[
              styles.settingText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>

      {renderEditModal()}
      {renderPasswordModal()}
      {renderDeleteModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
  },
  settingsSection: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AccountScreen; 