import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SecurityProvider } from './src/context/SecurityContext';
import { AccessibilityProvider } from './src/context/AccessibilityContext';
import { PerformanceProvider } from './src/context/PerformanceContext';
import { ContextDemo } from './src/components/ContextDemo';
import { getUnreadNotifications, Notification } from './src/services/notifications';
import { playNotificationSound } from './src/services/sound';

// Import screens
import FeedScreen from './src/screens/FeedScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import GradebookScreen from './src/screens/GradebookScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import NotificationPreferencesScreen from './src/screens/NotificationPreferencesScreen';
import PrivacySettingsScreen from './src/screens/PrivacySettingsScreen';
import AccessibilitySettingsScreen from './src/screens/AccessibilitySettingsScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import HelpAndSupportScreen from './src/screens/HelpAndSupportScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';

// Define User type
interface User {
  uid: string;
  email: string;
  name: string;
  children?: string[];
  id: string;
}

// Define notification sounds
const notificationSounds = {
  attendance: 'attendance.mp3',
  grade: 'grade.mp3',
  message: 'message.mp3',
  event: 'event.mp3',
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const getHapticPattern = (type: Notification['type']) => {
  switch (type) {
    case 'attendance':
      return 'impactMedium';
    case 'grade':
      return 'notificationSuccess';
    case 'message':
      return 'impactLight';
    case 'event':
      return 'notificationWarning';
    default:
      return 'impactMedium';
  }
};

const MainTabs = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const previousNotificationsRef = useRef<Notification[]>([]);

  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const notifications = await getUnreadNotifications(user.id);
          const newCount = notifications.length;
          
          // Check for new notifications and trigger appropriate feedback
          notifications.forEach(newNotification => {
            const isNew = !previousNotificationsRef.current.some(
              prev => prev.id === newNotification.id
            );
            
            if (isNew) {
              // Trigger haptic feedback
              ReactNativeHapticFeedback.trigger(getHapticPattern(newNotification.type), {
                enableVibrateFallback: true,
                ignoreAndroidSystemSettings: false,
              });
              
              // Play notification sound
              playNotificationSound(newNotification.type as keyof typeof notificationSounds);
            }
          });
          
          previousNotificationsRef.current = notifications;
          setUnreadCount(newCount);
        } catch (error) {
          console.error('Error fetching unread notifications:', error);
        }
      };

      fetchUnreadCount();
      // Set up a real-time listener for notifications
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
          borderTopColor: isDarkMode ? '#333' : '#ddd',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: isDarkMode ? '#666' : '#999',
      }}
    >
      <Tab.Screen
        name="Home"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-today" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Gradebook"
        component={GradebookScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="school" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="chat" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { isDarkMode } = useTheme();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
        },
        headerTintColor: isDarkMode ? '#fff' : '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NotificationPreferences"
            component={NotificationPreferencesScreen}
            options={{
              title: 'Notification Settings',
            }}
          />
          <Stack.Screen
            name="PrivacySettings"
            component={PrivacySettingsScreen}
            options={{
              title: 'Privacy Settings',
            }}
          />
          <Stack.Screen
            name="AccessibilitySettings"
            component={AccessibilitySettingsScreen}
            options={{
              title: 'Accessibility Settings',
            }}
          />
          <Stack.Screen
            name="Feedback"
            component={FeedbackScreen}
            options={{
              title: 'Feedback',
            }}
          />
          <Stack.Screen
            name="HelpAndSupport"
            component={HelpAndSupportScreen}
            options={{
              title: 'Help and Support',
            }}
          />
          <Stack.Screen
            name="Analytics"
            component={AnalyticsScreen}
            options={{
              title: 'Classroom Analytics',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NetworkProvider>
            <SecurityProvider>
              <AccessibilityProvider>
                <PerformanceProvider>
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                </PerformanceProvider>
              </AccessibilityProvider>
            </SecurityProvider>
          </NetworkProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App; 