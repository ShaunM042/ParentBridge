import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  // Mock user data - replace with actual API call
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    children: [
      {
        name: 'Sarah Doe',
        grade: '3rd Grade',
        teacher: 'Ms. Johnson',
      },
      {
        name: 'Michael Doe',
        grade: '5th Grade',
        teacher: 'Mr. Smith',
      },
    ],
  };

  const settings = [
    {
      id: '1',
      title: 'Dark Mode',
      icon: 'dark-mode',
      type: 'switch',
      value: isDarkMode,
      onValueChange: toggleTheme,
    },
    {
      id: '2',
      title: 'Notifications',
      icon: 'notifications',
      type: 'navigate',
    },
    {
      id: '3',
      title: 'Language',
      icon: 'language',
      type: 'navigate',
    },
    {
      id: '4',
      title: 'Help & Support',
      icon: 'help',
      type: 'navigate',
    },
  ];

  const renderSetting = (setting: typeof settings[0]) => (
    <TouchableOpacity
      key={setting.id}
      style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
      onPress={() => {
        if (setting.type === 'navigate') {
          // TODO: Implement navigation
        }
      }}
    >
      <View style={styles.settingLeft}>
        <Icon
          name={setting.icon}
          size={24}
          color={isDarkMode ? '#fff' : '#000'}
        />
        <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>
          {setting.title}
        </Text>
      </View>
      {setting.type === 'switch' ? (
        <Switch
          value={setting.value}
          onValueChange={setting.onValueChange}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
        />
      ) : (
        <Icon
          name="chevron-right"
          size={24}
          color={isDarkMode ? '#fff' : '#000'}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="account-circle" size={80} color={isDarkMode ? '#fff' : '#000'} />
        </View>
        <Text style={[styles.name, isDarkMode && styles.darkText]}>
          {user.name}
        </Text>
        <Text style={[styles.email, isDarkMode && styles.darkText]}>
          {user.email}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          My Children
        </Text>
        {user.children.map((child) => (
          <View
            key={child.name}
            style={[styles.childItem, isDarkMode && styles.darkChildItem]}
          >
            <View style={styles.childInfo}>
              <Text style={[styles.childName, isDarkMode && styles.darkText]}>
                {child.name}
              </Text>
              <Text style={[styles.childGrade, isDarkMode && styles.darkText]}>
                {child.grade}
              </Text>
              <Text style={[styles.childTeacher, isDarkMode && styles.darkText]}>
                Teacher: {child.teacher}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Settings
        </Text>
        {settings.map(renderSetting)}
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
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  darkText: {
    color: '#fff',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  childItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  darkChildItem: {
    backgroundColor: '#1e1e1e',
  },
  childInfo: {
    marginLeft: 8,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  childGrade: {
    fontSize: 14,
    marginTop: 4,
  },
  childTeacher: {
    fontSize: 14,
    marginTop: 4,
    color: '#666',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  darkSettingItem: {
    borderBottomColor: '#333',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    marginLeft: 16,
  },
});

export default ProfileScreen; 