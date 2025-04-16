import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SignInScreen = ({ navigation }: any) => {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      // Sign in logic here
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#1E1E1E' : '#fff'}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="arrow-back"
              size={24}
              color={isDarkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Sign In
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
            ]}
            placeholder="Email"
            placeholderTextColor={isDarkMode ? '#999' : '#666'}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
            ]}
            placeholder="Password"
            placeholderTextColor={isDarkMode ? '#999' : '#666'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
          >
            <Text
              style={[
                styles.forgotPasswordText,
                { color: isDarkMode ? '#007AFF' : '#007AFF' },
              ]}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: isDarkMode ? '#333' : '#ddd' },
              ]}
            />
            <Text
              style={[
                styles.dividerText,
                { color: isDarkMode ? '#999' : '#666' },
              ]}
            >
              or continue with
            </Text>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: isDarkMode ? '#333' : '#ddd' },
              ]}
            />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' }]}
              onPress={() => {/* Handle Google sign in */}}
            >
              <Icon name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' }]}
              onPress={() => {/* Handle Apple sign in */}}
            >
              <Icon name="apple" size={24} color={isDarkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' }]}
              onPress={() => {/* Handle Facebook sign in */}}
            >
              <Icon name="facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    flex: 1,
  },
  input: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 16,
    fontSize: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
});

export default SignInScreen; 