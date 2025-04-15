import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Slider,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import {
  AccessibilitySettings,
  getAccessibilitySettings,
  announceForAccessibility,
} from '../services/accessibility';

const AccessibilitySettingsScreen = () => {
  const { isDarkMode } = useTheme();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReaderEnabled: false,
    fontSize: 16,
    highContrast: false,
    reduceMotion: false,
    colorBlindMode: false,
    voiceOverEnabled: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getAccessibilitySettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof AccessibilitySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    announceForAccessibility(`${key} ${newSettings[key] ? 'enabled' : 'disabled'}`);
  };

  const handleFontSizeChange = (value: number) => {
    const newSettings = { ...settings, fontSize: value };
    setSettings(newSettings);
    announceForAccessibility(`Font size set to ${Math.round(value)}`);
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
          Screen Reader
        </Text>
        <SettingItem
          label="Screen Reader"
          value={settings.screenReaderEnabled}
          onToggle={() => handleToggle('screenReaderEnabled')}
          isDarkMode={isDarkMode}
        />
        <SettingItem
          label="VoiceOver"
          value={settings.voiceOverEnabled}
          onToggle={() => handleToggle('voiceOverEnabled')}
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
          Display
        </Text>
        <View style={styles.fontSizeContainer}>
          <Text
            style={[
              styles.label,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Font Size
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={12}
            maximumValue={24}
            step={1}
            value={settings.fontSize}
            onValueChange={handleFontSizeChange}
            minimumTrackTintColor={isDarkMode ? '#007AFF' : '#007AFF'}
            maximumTrackTintColor={isDarkMode ? '#666' : '#ddd'}
            thumbTintColor={isDarkMode ? '#007AFF' : '#007AFF'}
          />
          <Text
            style={[
              styles.fontSizeValue,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            {Math.round(settings.fontSize)}pt
          </Text>
        </View>
        <SettingItem
          label="High Contrast"
          value={settings.highContrast}
          onToggle={() => handleToggle('highContrast')}
          isDarkMode={isDarkMode}
        />
        <SettingItem
          label="Color Blind Mode"
          value={settings.colorBlindMode}
          onToggle={() => handleToggle('colorBlindMode')}
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
          Motion
        </Text>
        <SettingItem
          label="Reduce Motion"
          value={settings.reduceMotion}
          onToggle={() => handleToggle('reduceMotion')}
          isDarkMode={isDarkMode}
        />
      </View>
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
  fontSizeContainer: {
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  fontSizeValue: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 8,
  },
});

export default AccessibilitySettingsScreen; 