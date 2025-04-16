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
import {
  getStudentEvents,
  getUpcomingEvents,
  CalendarEvent,
} from '../services/calendar';

const CalendarScreen = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'upcoming' | 'all'>('upcoming');

  const fetchData = async () => {
    try {
      if (!user?.children?.[0]) return; // Assuming first child for now

      const fetchedEvents = viewMode === 'upcoming'
        ? await getUpcomingEvents(user.children[0])
        : await getStudentEvents(user.children[0]);

      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, viewMode]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'assignment':
        return '#FF6B6B';
      case 'meeting':
        return '#4ECDC4';
      case 'event':
        return '#45B7D1';
      default:
        return '#999';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderEventItem = ({ item }: { item: CalendarEvent }) => (
    <View style={[styles.eventItem, isDarkMode && styles.darkEventItem]}>
      <View
        style={[
          styles.eventTypeIndicator,
          { backgroundColor: getEventColor(item.type) },
        ]}
      />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={[styles.eventTitle, isDarkMode && styles.darkText]}>
            {item.title}
          </Text>
          <Text style={[styles.eventTime, isDarkMode && styles.darkText]}>
            {formatTime(item.startTime)} - {formatTime(item.endTime)}
          </Text>
        </View>
        <Text style={[styles.eventDescription, isDarkMode && styles.darkText]}>
          {item.description}
        </Text>
        {item.location && (
          <View style={styles.eventLocation}>
            <Icon
              name="location-on"
              size={16}
              color={isDarkMode ? '#fff' : '#666'}
            />
            <Text style={[styles.locationText, isDarkMode && styles.darkText]}>
              {item.location}
            </Text>
          </View>
        )}
      </View>
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
      <View style={styles.header}>
        <View style={styles.viewModeSelector}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'upcoming' && styles.selectedViewMode,
            ]}
            onPress={() => setViewMode('upcoming')}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === 'upcoming' && styles.selectedViewModeText,
                isDarkMode && styles.darkText,
              ]}
            >
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'all' && styles.selectedViewMode,
            ]}
            onPress={() => setViewMode('all')}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === 'all' && styles.selectedViewModeText,
                isDarkMode && styles.darkText,
              ]}
            >
              All Events
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.eventsList}
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
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedViewMode: {
    backgroundColor: '#007AFF',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedViewModeText: {
    color: '#fff',
  },
  eventsList: {
    padding: 16,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  darkEventItem: {
    backgroundColor: '#1e1e1e',
  },
  eventTypeIndicator: {
    width: 4,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  darkText: {
    color: '#fff',
  },
});

export default CalendarScreen; 