import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getMessages,
  sendMessage,
  Message,
  subscribeToMessages,
  markMessageAsRead,
  uploadFile,
} from '../services/messaging';
import * as ImagePicker from 'react-native-image-picker';

const ChatScreen = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { conversationId } = route.params as { conversationId: string };

  const fetchMessages = async () => {
    try {
      const fetchedMessages = await getMessages(conversationId);
      setMessages(fetchedMessages.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToMessages(conversationId, (updatedMessages) => {
      setMessages(updatedMessages.reverse());
      // Mark messages as read when they are received
      updatedMessages
        .filter(msg => msg.senderId !== user?.id && msg.status !== 'read')
        .forEach(msg => markMessageAsRead(conversationId, msg.id));
    });

    return () => unsubscribe();
  }, [conversationId, user]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user?.id) return;

    try {
      await sendMessage(conversationId, {
        senderId: user.id,
        receiverId: messages[0]?.senderId === user.id ? messages[0].receiverId : messages[0]?.senderId,
        content: newMessage.trim(),
        type: 'text',
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets[0]) {
        setUploading(true);
        const { uri, fileName, type } = result.assets[0];
        
        const uploadedFile = await uploadFile(uri, fileName || 'image.jpg', type || 'image/jpeg');
        
        await sendMessage(conversationId, {
          senderId: user?.id || '',
          receiverId: messages[0]?.senderId === user?.id ? messages[0].receiverId : messages[0]?.senderId,
          content: 'Image',
          type: 'image',
          fileUrl: uploadedFile.url,
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
    } finally {
      setUploading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.senderId === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.otherMessage,
        ]}
      >
        {item.type === 'image' ? (
          <Image
            source={{ uri: item.fileUrl }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.messageContent, isDarkMode && styles.darkText]}>
            {item.content}
          </Text>
        )}
        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, isDarkMode && styles.darkText]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {isUser && (
            <Icon
              name={
                item.status === 'read'
                  ? 'done-all'
                  : item.status === 'delivered'
                  ? 'done'
                  : 'schedule'
              }
              size={16}
              color={isDarkMode ? '#666' : '#999'}
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDarkMode && styles.darkContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={handleImagePick}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Icon
              name="attach-file"
              size={24}
              color={isDarkMode ? '#fff' : '#000'}
            />
          )}
        </TouchableOpacity>

        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          multiline
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!newMessage.trim()}
        >
          <Icon
            name="send"
            size={24}
            color={newMessage.trim() ? (isDarkMode ? '#fff' : '#000') : '#999'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageContent: {
    fontSize: 16,
    color: '#fff',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  darkInputContainer: {
    borderTopColor: '#333',
  },
  attachmentButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 16,
  },
  darkInput: {
    borderColor: '#333',
    color: '#fff',
  },
  sendButton: {
    padding: 8,
  },
  darkText: {
    color: '#fff',
  },
});

export default ChatScreen; 