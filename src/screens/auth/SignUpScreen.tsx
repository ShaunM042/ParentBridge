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
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SignUpScreen = ({ navigation }: any) => {
  const { isDarkMode } = useTheme();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, firstName, lastName);
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <Text
          style={[
            styles.title,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Create Account
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
          ]}
          placeholder="First Name"
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
          ]}
          placeholder="Last Name"
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
          ]}
          placeholder="Email"
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
          ]}
          placeholder="Password"
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
          ]}
          placeholder="Confirm Password"
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        <View style={styles.loginContainer}>
          <Text
            style={[
              styles.loginText,
              { color: isDarkMode ? '#999' : '#666' },
            ]}
          >
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 16,
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SignUpScreen; 