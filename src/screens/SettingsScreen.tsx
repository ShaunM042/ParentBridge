import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@expo/vector-icons';
import styles from '../styles/styles';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

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
          Support
        </Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('HelpAndSupport')}
        >
          <Text
            style={[
              styles.settingText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Help and Support
          </Text>
          <Icon
            name="chevron-right"
            size={24}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('Feedback')}
        >
          <Text
            style={[
              styles.settingText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Send Feedback
          </Text>
          <Icon
            name="chevron-right"
            size={24}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen; 