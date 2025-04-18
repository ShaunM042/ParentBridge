// App.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { SecurityProvider } from './src/context/SecurityContext';
import { AccessibilityProvider } from './src/context/AccessibilityContext';
import { PerformanceProvider } from './src/context/PerformanceContext';

import { getUnreadNotifications, Notification } from './src/services/notifications';
import { playNotificationSound } from './src/services/sound';

import FeedScreen from './src/screens/FeedScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import GradebookScreen from './src/screens/GradebookScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';

import NotificationPreferencesScreen from './src/screens/NotificationPreferencesScreen';
import PrivacySettingsScreen from './src/screens/PrivacySettingsScreen';
import AccessibilitySettingsScreen from './src/screens/AccessibilitySettingsScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import HelpAndSupportScreen from './src/screens/HelpAndSupportScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';

// Define notification sounds mapping
const notificationSounds: Record<Notification['type'], string> = {
  attendance: 'attendance.mp3',
  grade: 'grade.mp3',
  message: 'message.mp3',
  event: 'event.mp3',
};

const getHapticPattern = (type: Notification['type']): string => {
  switch (type) {
    case 'attendance': return 'impactMedium';
    case 'grade':      return 'notificationSuccess';
    case 'message':    return 'impactLight';
    case 'event':      return 'notificationWarning';
    default:           return 'impactMedium';
  }
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  const { isDarkMode } = useTheme();
  const { user }     = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const previousNotificationsRef = useRef<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        const notifications = await getUnreadNotifications(user.id);
        // trigger feedback for new ones
        notifications.forEach(n => {
          if (!previousNotificationsRef.current.some(p => p.id === n.id)) {
            ReactNativeHapticFeedback.trigger(getHapticPattern(n.type), {
              enableVibrateFallback: true,
              ignoreAndroidSystemSettings: false,
            });
            playNotificationSound(n.type);
          }
        });
        previousNotificationsRef.current = notifications;
        setUnreadCount(notifications.length);
      } catch (e) {
        console.error(e);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30_000);
    return () => clearInterval(interval);
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
          tabBarIcon: ({ color, size }: { color: string; size: number }) =>
            <Icon name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) =>
            <Icon name="calendar-today" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Gradebook"
        component={GradebookScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) =>
            <Icon name="school" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) =>
            <Icon name="chat" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) =>
            <View>
              <Icon name="notifications" size={size} color={color} />
              {!!unreadCount && (
                <View style={[styles.badge, { backgroundColor: isDarkMode ? '#555' : '#FF3B30' }]}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) =>
            <Icon name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const { isDarkMode }    = useTheme();

  if (loading) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:  { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
        headerTintColor: isDarkMode ? '#fff' : '#000',
        headerTitleStyle:{ fontWeight: 'bold' },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }}/>
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }}/>
          <Stack.Screen
            name="NotificationPreferences"
            component={NotificationPreferencesScreen}
            options={{ title: 'Notification Settings' }}
          />
          <Stack.Screen
            name="PrivacySettings"
            component={PrivacySettingsScreen}
            options={{ title: 'Privacy Settings' }}
          />
          <Stack.Screen
            name="AccessibilitySettings"
            component={AccessibilitySettingsScreen}
            options={{ title: 'Accessibility Settings' }}
          />
          <Stack.Screen
            name="Feedback"
            component={FeedbackScreen}
            options={{ title: 'Feedback' }}
          />
          <Stack.Screen
            name="HelpAndSupport"
            component={HelpAndSupportScreen}
            options={{ title: 'Help & Support' }}
          />
          <Stack.Screen
            name="Analytics"
            component={AnalyticsScreen}
            options={{ title: 'Classroom Analytics' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const App = () => (
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

export default App;

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
