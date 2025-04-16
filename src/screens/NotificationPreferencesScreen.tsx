import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  NotificationPreferences,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../services/notificationPreferences';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NotificationPreferencesScreen = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;

    try {
      const updatedPreferences = { ...preferences, [key]: value };
      await updateNotificationPreferences(user.id, { [key]: value });
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const handleTimeChange = async (key: 'startTime' | 'endTime', value: string) => {
    if (!preferences) return;

    try {
      const updatedQuietHours = {
        ...preferences.quietHours,
        [key]: value,
      };
      await updateNotificationPreferences(user.id, {
        quietHours: updatedQuietHours,
      });
      setPreferences({
        ...preferences,
        quietHours: updatedQuietHours,
      });
    } catch (error) {
      console.error('Error updating quiet hours:', error);
    }
  };

  if (loading || !preferences) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
          Loading preferences...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, isDarkMode && styles.darkContainer]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          General Settings
        </Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>
            Enable Notifications
          </Text>
          <Switch
            value={preferences.enabled}
            onValueChange={value => handleToggle('enabled', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={preferences.enabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Quiet Hours
        </Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>
            Enable Quiet Hours
          </Text>
          <Switch
            value={preferences.quietHours.enabled}
            onValueChange={value =>
              handleToggle('quietHours', { ...preferences.quietHours, enabled: value })
            }
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={preferences.quietHours.enabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>
        {preferences.quietHours.enabled && (
          <>
            <View style={styles.timeInputContainer}>
              <Text style={[styles.timeLabel, isDarkMode && styles.darkText]}>
                Start Time
              </Text>
              <TextInput
                style={[styles.timeInput, isDarkMode && styles.darkInput]}
                value={preferences.quietHours.startTime}
                onChangeText={value => handleTimeChange('startTime', value)}
                placeholder="HH:mm"
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
              />
            </View>
            <View style={styles.timeInputContainer}>
              <Text style={[styles.timeLabel, isDarkMode && styles.darkText]}>
                End Time
              </Text>
              <TextInput
                style={[styles.timeInput, isDarkMode && styles.darkInput]}
                value={preferences.quietHours.endTime}
                onChangeText={value => handleTimeChange('endTime', value)}
                placeholder="HH:mm"
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Notification Types
        </Text>
        {Object.entries(preferences.types).map(([type, enabled]) => (
          <View key={type} style={styles.settingRow}>
            <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
            <Switch
              value={enabled}
              onValueChange={value =>
                handleToggle('types', { ...preferences.types, [type]: value })
              }
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={enabled ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Sound & Haptic
        </Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>
            Enable Sound
          </Text>
          <Switch
            value={preferences.sound.enabled}
            onValueChange={value =>
              handleToggle('sound', { ...preferences.sound, enabled: value })
            }
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={preferences.sound.enabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>
            Enable Haptic Feedback
          </Text>
          <Switch
            value={preferences.haptic.enabled}
            onValueChange={value =>
              handleToggle('haptic', { ...preferences.haptic, enabled: value })
            }
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={preferences.haptic.enabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Grouping
        </Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>
            Enable Grouping
          </Text>
          <Switch
            value={preferences.grouping.enabled}
            onValueChange={value =>
              handleToggle('grouping', { ...preferences.grouping, enabled: value })
            }
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={preferences.grouping.enabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>
        {preferences.grouping.enabled && (
          <>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>
                Group by Type
              </Text>
              <Switch
                value={preferences.grouping.byType}
                onValueChange={value =>
                  handleToggle('grouping', {
                    ...preferences.grouping,
                    byType: value,
                  })
                }
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={preferences.grouping.byType ? '#007AFF' : '#f4f3f4'}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>
                Group by Date
              </Text>
              <Switch
                value={preferences.grouping.byDate}
                onValueChange={value =>
                  handleToggle('grouping', {
                    ...preferences.grouping,
                    byDate: value,
                  })
                }
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={preferences.grouping.byDate ? '#007AFF' : '#f4f3f4'}
              />
            </View>
          </>
        )}
      </View>
    </ScrollView>
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
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  timeInputContainer: {
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  darkInput: {
    borderColor: '#333',
    color: '#fff',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  darkText: {
    color: '#fff',
  },
});

export default NotificationPreferencesScreen; 