import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SupportTicket, getTickets, subscribeToTickets } from '../services/support';

const SupportTicketsScreen = ({ navigation }: any) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  const loadTickets = async () => {
    try {
      if (user) {
        const userTickets = await getTickets(user.uid);
        setTickets(userTickets);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();

    if (user) {
      const unsubscribe = subscribeToTickets(user.uid, updatedTickets => {
        setTickets(updatedTickets);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return '#007AFF';
      case 'in-progress':
        return '#FF9500';
      case 'resolved':
        return '#34C759';
      case 'closed':
        return '#8E8E93';
      default:
        return '#007AFF';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent':
        return '#FF3B30';
      case 'high':
        return '#FF9500';
      case 'medium':
        return '#FFCC00';
      case 'low':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderTicket = ({ item }: { item: SupportTicket }) => (
    <TouchableOpacity
      style={[
        styles.ticketItem,
        { backgroundColor: isDarkMode ? '#333' : '#fff' },
      ]}
      onPress={() => navigation.navigate('TicketDetails', { ticketId: item.id })}
    >
      <View style={styles.ticketHeader}>
        <Text
          style={[
            styles.ticketTitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          {item.title}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text
        style={[
          styles.ticketDescription,
          { color: isDarkMode ? '#999' : '#666' },
        ]}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <View style={styles.ticketFooter}>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(item.priority) },
          ]}
        >
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
        <Text
          style={[
            styles.ticketDate,
            { color: isDarkMode ? '#999' : '#666' },
          ]}
        >
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
      ]}
    >
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDarkMode ? '#fff' : '#000'}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name="support-agent"
              size={64}
              color={isDarkMode ? '#666' : '#999'}
            />
            <Text
              style={[
                styles.emptyText,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              No support tickets yet
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTicket')}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  ticketItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ticketDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ticketDate: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default SupportTicketsScreen; 