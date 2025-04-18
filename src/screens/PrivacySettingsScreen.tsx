import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  PrivacySettings,
  savePrivacySettings,
  getPrivacySettings,
  deleteUserData,
} from '../services/security';

const PrivacySettingsScreen = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>({
    dataCollection: true,
    analytics: true,
    locationTracking: false,
    biometricData: false,
    marketingEmails: false,
    dataRetentionPeriod: 365,
    gdprCompliant: true,
    ccpaCompliant: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!user) return;
    try {
      const savedSettings = await getPrivacySettings(user.uid);
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof PrivacySettings) => {
    if (!user) return;
    try {
      const newSettings = { ...settings, [key]: !settings[key] };
      setSettings(newSettings);
      await savePrivacySettings(user.uid, newSettings);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      Alert.alert('Error', 'Failed to save privacy settings');
    }
  };

  const handleDeleteData = async () => {
    if (!user) return;
    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserData(user.uid);
              Alert.alert('Success', 'All your data has been deleted');
            } catch (error) {
              console.error('Error deleting user data:', error);
              Alert.alert('Error', 'Failed to delete data');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
      ]}
    >
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Data Collection
        </Text>
        <SettingItem
          label="Allow Data Collection"
          value={settings.dataCollection}
          onToggle={() => handleToggle('dataCollection')}
          isDarkMode={isDarkMode}
        />
        <SettingItem
          label="Analytics"
          value={settings.analytics}
          onToggle={() => handleToggle('analytics')}
          isDarkMode={isDarkMode}
        />
        <SettingItem
          label="Location Tracking"
          value={settings.locationTracking}
          onToggle={() => handleToggle('locationTracking')}
          isDarkMode={isDarkMode}
        />
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Biometric Data
        </Text>
        <SettingItem
          label="Facial Recognition"
          value={settings.biometricData}
          onToggle={() => handleToggle('biometricData')}
          isDarkMode={isDarkMode}
        />
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Communications
        </Text>
        <SettingItem
          label="Marketing Emails"
          value={settings.marketingEmails}
          onToggle={() => handleToggle('marketingEmails')}
          isDarkMode={isDarkMode}
        />
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Data Retention
        </Text>
        <Text
          style={[
            styles.retentionText,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Data will be retained for {settings.dataRetentionPeriod} days
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Compliance
        </Text>
        <Text
          style={[
            styles.complianceText,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          {settings.gdprCompliant ? '✓ GDPR Compliant' : '✗ Not GDPR Compliant'}
        </Text>
        <Text
          style={[
            styles.complianceText,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          {settings.ccpaCompliant ? '✓ CCPA Compliant' : '✗ Not CCPA Compliant'}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.deleteButton,
          { backgroundColor: isDarkMode ? '#FF3B30' : '#FF453A' },
        ]}
        onPress={handleDeleteData}
      >
        <Text style={styles.deleteButtonText}>Delete All My Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const SettingItem = ({
  label,
  value,
  onToggle,
  isDarkMode,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
}) => (
  <View style={styles.settingItem}>
    <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>
      {label}
    </Text>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#767577', true: '#81b0ff' }}
      thumbColor={value ? '#007AFF' : '#f4f3f4'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  label: {
    fontSize: 16,
  },
  retentionText: {
    fontSize: 16,
    marginTop: 8,
  },
  complianceText: {
    fontSize: 16,
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 32,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PrivacySettingsScreen; 