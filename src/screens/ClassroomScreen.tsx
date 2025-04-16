import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  Classroom,
  ClassroomMember,
  Post,
  Attachment,
  getClassroom,
  getClassroomMembers,
  getClassroomPosts,
  createPost,
  uploadAttachment,
  updateClassroomName,
  updateClassroomCode,
  addMember,
  removeMember,
  subscribeToClassroom,
  subscribeToPosts,
} from '../services/classroom';

const ClassroomScreen = ({ route, navigation }: any) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { classroomId } = route.params;
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showNameUpdateModal, setShowNameUpdateModal] = useState(false);
  const [showCodeUpdateModal, setShowCodeUpdateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    attachments: [] as Omit<Attachment, 'id' | 'uploadedAt'>[],
  });
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [uploading, setUploading] = useState(false);
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadClassroomData();
    const unsubscribeClassroom = subscribeToClassroom(classroomId, setClassroom);
    const unsubscribePosts = subscribeToPosts(classroomId, setPosts);

    return () => {
      unsubscribeClassroom();
      unsubscribePosts();
    };
  }, [classroomId]);

  const loadClassroomData = async () => {
    try {
      const [classroomData, membersData, postsData] = await Promise.all([
        getClassroom(classroomId),
        getClassroomMembers(classroomId),
        getClassroomPosts(classroomId),
      ]);

      setClassroom(classroomData);
      setMembers(membersData);
      setPosts(postsData);
      setIsAdmin(classroomData.admins.includes(user?.uid || ''));
      setNewName(classroomData.name);
      setNewCode(classroomData.code);
    } catch (error) {
      Alert.alert('Error', 'Failed to load classroom data');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploading(true);
        const { url, size } = await uploadAttachment(
          result.assets[0].uri,
          'image',
          `image_${Date.now()}.jpg`
        );
        setNewPost({
          ...newPost,
          attachments: [
            ...newPost.attachments,
            { type: 'image', url, name: 'Image', size },
          ],
        });
        setUploading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      setUploading(false);
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (result.type === 'success') {
        setUploading(true);
        const { url, size } = await uploadAttachment(
          result.uri,
          'file',
          result.name
        );
        setNewPost({
          ...newPost,
          attachments: [
            ...newPost.attachments,
            { type: 'file', url, name: result.name, size },
          ],
        });
        setUploading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
      setUploading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await createPost(
        classroomId,
        user?.uid || '',
        user?.displayName || '',
        newPost.title,
        newPost.content,
        newPost.attachments
      );
      setShowCreatePostModal(false);
      setNewPost({ title: '', content: '', attachments: [] });
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a valid name');
      return;
    }

    try {
      await updateClassroomName(classroomId, newName);
      setShowNameUpdateModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update classroom name');
    }
  };

  const handleUpdateCode = async () => {
    if (!newCode.trim()) {
      Alert.alert('Error', 'Please enter a valid code');
      return;
    }

    try {
      await updateClassroomCode(classroomId, newCode);
      setShowCodeUpdateModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update classroom code');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(classroomId, memberId);
      Alert.alert('Success', 'Member removed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove member');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...newPost.attachments];
    newAttachments.splice(index, 1);
    setNewPost({ ...newPost, attachments: newAttachments });
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View
      style={[
        styles.postContainer,
        { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
      ]}
    >
      <View style={styles.postHeader}>
        <Text
          style={[
            styles.postTitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.postDate,
            { color: isDarkMode ? '#999' : '#666' },
          ]}
        >
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text
        style={[
          styles.postContent,
          { color: isDarkMode ? '#fff' : '#000' },
        ]}
      >
        {item.content}
      </Text>
      {item.attachments && item.attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          {item.attachments.map((attachment, index) => (
            <TouchableOpacity
              key={index}
              style={styles.attachmentItem}
              onPress={() => {/* Handle attachment preview */}}
            >
              {attachment.type === 'image' ? (
                <Image
                  source={{ uri: attachment.url }}
                  style={styles.attachmentImage}
                />
              ) : (
                <View style={styles.fileAttachment}>
                  <Icon
                    name="insert-drive-file"
                    size={24}
                    color={isDarkMode ? '#fff' : '#000'}
                  />
                  <Text
                    style={[
                      styles.fileName,
                      { color: isDarkMode ? '#fff' : '#000' },
                    ]}
                  >
                    {attachment.name}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderCreatePostModal = () => (
    <Modal
      visible={showCreatePostModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCreatePostModal(false)}
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
            Create Post
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
            ]}
            placeholder="Title"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={newPost.title}
            onChangeText={(text) => setNewPost({ ...newPost, title: text })}
          />
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
            ]}
            placeholder="Content"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={newPost.content}
            onChangeText={(text) => setNewPost({ ...newPost, content: text })}
            multiline
            numberOfLines={4}
          />
          <View style={styles.attachmentButtons}>
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={handleImagePick}
              disabled={uploading}
            >
              <Icon name="image" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={handleFilePick}
              disabled={uploading}
            >
              <Icon name="attach-file" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {newPost.attachments.length > 0 && (
            <View style={styles.attachmentsPreview}>
              {newPost.attachments.map((attachment, index) => (
                <View key={index} style={styles.attachmentPreviewItem}>
                  {attachment.type === 'image' ? (
                    <Image
                      source={{ uri: attachment.url }}
                      style={styles.attachmentPreviewImage}
                    />
                  ) : (
                    <View style={styles.filePreview}>
                      <Icon
                        name="insert-drive-file"
                        size={24}
                        color={isDarkMode ? '#fff' : '#000'}
                      />
                      <Text
                        style={[
                          styles.fileName,
                          { color: isDarkMode ? '#fff' : '#000' },
                        ]}
                      >
                        {attachment.name}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeAttachment}
                    onPress={() => handleRemoveAttachment(index)}
                  >
                    <Icon name="close" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowCreatePostModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.createButton]}
              onPress={handleCreatePost}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSettingsModal(false)}
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
            Classroom Settings
          </Text>
          {isAdmin && (
            <>
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => setShowNameUpdateModal(true)}
              >
                <Text
                  style={[
                    styles.settingsText,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  Update Classroom Name
                </Text>
                <Icon
                  name="edit"
                  size={24}
                  color={isDarkMode ? '#999' : '#666'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => setShowCodeUpdateModal(true)}
              >
                <Text
                  style={[
                    styles.settingsText,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  Update Classroom Code
                </Text>
                <Icon
                  name="edit"
                  size={24}
                  color={isDarkMode ? '#999' : '#666'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => setShowMembersModal(true)}
              >
                <Text
                  style={[
                    styles.settingsText,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  Manage Members
                </Text>
                <Icon
                  name="people"
                  size={24}
                  color={isDarkMode ? '#999' : '#666'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => {
                  setShowSettingsModal(false);
                  navigation.navigate('Analytics', { classroomId });
                }}
              >
                <Text
                  style={[
                    styles.settingsText,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  View Analytics
                </Text>
                <Icon
                  name="analytics"
                  size={24}
                  color={isDarkMode ? '#999' : '#666'}
                />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => {/* Handle notification settings */}}
          >
            <Text
              style={[
                styles.settingsText,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              Notification Settings
            </Text>
            <Icon
              name="notifications"
              size={24}
              color={isDarkMode ? '#999' : '#666'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.closeButton]}
            onPress={() => setShowSettingsModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderNameUpdateModal = () => (
    <Modal
      visible={showNameUpdateModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowNameUpdateModal(false)}
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
            Update Classroom Name
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
            ]}
            placeholder="New Name"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={newName}
            onChangeText={setNewName}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowNameUpdateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.createButton]}
              onPress={handleUpdateName}
            >
              <Text style={styles.createButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCodeUpdateModal = () => (
    <Modal
      visible={showCodeUpdateModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCodeUpdateModal(false)}
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
            Update Classroom Code
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
            ]}
            placeholder="New Code"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={newCode}
            onChangeText={setNewCode}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowCodeUpdateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.createButton]}
              onPress={handleUpdateCode}
            >
              <Text style={styles.createButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderMembersModal = () => (
    <Modal
      visible={showMembersModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowMembersModal(false)}
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
            Classroom Members
          </Text>
          <FlatList
            data={members}
            renderItem={({ item }) => (
              <View style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <Text
                    style={[
                      styles.memberName,
                      { color: isDarkMode ? '#fff' : '#000' },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.memberRole,
                      { color: isDarkMode ? '#999' : '#666' },
                    ]}
                  >
                    {item.role}
                  </Text>
                </View>
                {isAdmin && item.role !== 'admin' && (
                  <TouchableOpacity
                    style={styles.removeMemberButton}
                    onPress={() => handleRemoveMember(item.id)}
                  >
                    <Icon name="remove-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity
            style={[styles.modalButton, styles.closeButton]}
            onPress={() => setShowMembersModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-back"
            size={24}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.title,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          {classroom?.name}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowMembersModal(true)}
          >
            <Icon
              name="people"
              size={24}
              color={isDarkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <Icon
              name="settings"
              size={24}
              color={isDarkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postsList}
        ListHeaderComponent={
          <TouchableOpacity
            style={[
              styles.createPostButton,
              { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
            ]}
            onPress={() => setShowCreatePostModal(true)}
          >
            <Text
              style={[
                styles.createPostText,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              Create a new post
            </Text>
            <Icon
              name="add"
              size={24}
              color={isDarkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
        }
      />

      {renderCreatePostModal()}
      {renderSettingsModal()}
      {renderNameUpdateModal()}
      {renderCodeUpdateModal()}
      {renderMembersModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  postsList: {
    padding: 20,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  createPostText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postDate: {
    fontSize: 14,
  },
  postContent: {
    fontSize: 16,
    marginBottom: 16,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  attachmentItem: {
    marginRight: 8,
    marginBottom: 8,
  },
  attachmentImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  attachmentButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  attachmentButton: {
    marginRight: 16,
  },
  attachmentsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  attachmentPreviewItem: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  attachmentPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  removeAttachment: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
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
  createButton: {
    backgroundColor: '#007AFF',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingsText: {
    fontSize: 16,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberRole: {
    fontSize: 14,
  },
  removeMemberButton: {
    marginLeft: 16,
  },
});

export default ClassroomScreen; 