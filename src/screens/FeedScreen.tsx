import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FirebaseFirestore, FirebaseStorage, collections, uploadImage } from '../services/firebase';
import * as ImagePicker from 'react-native-image-picker';

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: Date;
  studentName: string;
  userId: string;
}

const FeedScreen = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { isConnected } = useNetwork();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPost, setNewPost] = useState({
    caption: '',
    imageUri: '',
  });

  const fetchPosts = async () => {
    try {
      const snapshot = await FirebaseFirestore
        .collection(collections.posts)
        .orderBy('timestamp', 'desc')
        .get();

      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as Post[];

      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
  };

  const pickImage = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    }, async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.error('ImagePicker Error:', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0].uri) {
        setNewPost(prev => ({ ...prev, imageUri: response.assets![0].uri! }));
      }
    });
  };

  const createPost = async () => {
    if (!newPost.imageUri || !newPost.caption) return;

    try {
      const imageUrl = await uploadImage(
        newPost.imageUri,
        `posts/${user?.uid}/${Date.now()}.jpg`
      );

      await FirebaseFirestore.collection(collections.posts).add({
        imageUrl,
        caption: newPost.caption,
        likes: 0,
        comments: 0,
        timestamp: new Date(),
        studentName: user?.displayName || 'Anonymous',
        userId: user?.uid,
      });

      setNewPost({ caption: '', imageUri: '' });
      setModalVisible(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={[styles.postContainer, isDarkMode && styles.darkPostContainer]}>
      <View style={styles.postHeader}>
        <Text style={[styles.studentName, isDarkMode && styles.darkText]}>
          {item.studentName}
        </Text>
        <Text style={[styles.timestamp, isDarkMode && styles.darkText]}>
          {item.timestamp.toLocaleDateString()}
        </Text>
      </View>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.postImage}
        resizeMode="cover"
      />
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="favorite" size={24} color={isDarkMode ? '#fff' : '#000'} />
          <Text style={[styles.actionText, isDarkMode && styles.darkText]}>
            {item.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="chat" size={24} color={isDarkMode ? '#fff' : '#000'} />
          <Text style={[styles.actionText, isDarkMode && styles.darkText]}>
            {item.comments}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.caption, isDarkMode && styles.darkText]}>
        {item.caption}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                Create New Post
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            {newPost.imageUri ? (
              <Image
                source={{ uri: newPost.imageUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={pickImage}
              >
                <Icon name="add-photo-alternate" size={48} color="#007AFF" />
                <Text style={styles.imagePickerText}>Add Photo</Text>
              </TouchableOpacity>
            )}

            <TextInput
              style={[styles.captionInput, isDarkMode && styles.darkInput]}
              placeholder="Write a caption..."
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              value={newPost.caption}
              onChangeText={(text) => setNewPost(prev => ({ ...prev, caption: text }))}
              multiline
            />

            <TouchableOpacity
              style={[styles.postButton, (!newPost.imageUri || !newPost.caption) && styles.disabledButton]}
              onPress={createPost}
              disabled={!newPost.imageUri || !newPost.caption}
            >
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  darkPostContainer: {
    backgroundColor: '#1e1e1e',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  darkText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  postImage: {
    width: '100%',
    height: 300,
  },
  postActions: {
    flexDirection: 'row',
    padding: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
  },
  caption: {
    padding: 12,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  darkModalContent: {
    backgroundColor: '#1e1e1e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  imagePicker: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePickerText: {
    marginTop: 8,
    color: '#007AFF',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  captionInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    minHeight: 100,
  },
  darkInput: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  postButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FeedScreen; 