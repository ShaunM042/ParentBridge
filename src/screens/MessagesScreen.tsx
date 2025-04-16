import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getConversations,
  Conversation,
  subscribeToConversations,
} from '../services/messaging';

const MessagesScreen = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      if (!user?.id) return;

      const fetchedConversations = await getConversations(user.id);
      setConversations(fetchedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToConversations(user.id, (updatedConversations) => {
      setConversations(updatedConversations);
    });

    return () => unsubscribe();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherParticipant = item.participants.find(id => id !== user?.id);
    const isUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, isDarkMode && styles.darkConversationItem]}
        onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${otherParticipant}&background=007AFF&color=fff` }}
            style={styles.avatar}
          />
          {isUnread && <View style={styles.unreadBadge} />}
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text
              style={[
                styles.participantName,
                isUnread && styles.unreadText,
                isDarkMode && styles.darkText,
              ]}
            >
              {otherParticipant}
            </Text>
            <Text
              style={[
                styles.timestamp,
                isUnread && styles.unreadText,
                isDarkMode && styles.darkText,
              ]}
            >
              {formatTime(item.lastMessage.timestamp)}
            </Text>
          </View>
          <Text
            style={[
              styles.lastMessage,
              isUnread && styles.unreadText,
              isDarkMode && styles.darkText,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage.content}
          </Text>
        </View>
      </TouchableOpacity>
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
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Messages
        </Text>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.conversationsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name="chat-bubble-outline"
              size={48}
              color={isDarkMode ? '#666' : '#999'}
            />
            <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
              No messages yet
            </Text>
          </View>
        }
      />
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  conversationsList: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkConversationItem: {
    borderBottomColor: '#333',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadText: {
    color: '#000',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  darkText: {
    color: '#fff',
  },
});

export default MessagesScreen; 