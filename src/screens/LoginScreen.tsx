import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { signInWithGoogle, signInWithFacebook, resetPassword } from '../services/auth';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithFacebook();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Facebook');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      await resetPassword(email);
      Alert.alert(
        'Success',
        'Password reset email sent. Please check your inbox.'
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send password reset email');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
      ]}
    >
      <View style={styles.header}>
        <Icon
          name="school"
          size={80}
          color={isDarkMode ? '#fff' : '#000'}
        />
        <Text
          style={[
            styles.title,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          ParentBridge
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Connect with your child's education
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
              color: isDarkMode ? '#fff' : '#000',
            },
          ]}
          placeholder="Email"
          placeholderTextColor={isDarkMode ? '#999' : '#666'}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
              color: isDarkMode ? '#fff' : '#000',
            },
          ]}
          placeholder="Password"
          placeholderTextColor={isDarkMode ? '#999' : '#666'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={handlePasswordReset}
        >
          <Text
            style={[
              styles.forgotPasswordText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Forgot Password?
          </Text>
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
            OR
          </Text>
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: isDarkMode ? '#333' : '#ddd' },
            ]}
          />
        </View>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Icon name="google" size={24} color="#DB4437" />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleFacebookLogin}
          disabled={loading}
        >
          <Icon name="facebook" size={24} color="#4267B2" />
          <Text style={styles.socialButtonText}>Continue with Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text
            style={[
              styles.signUpText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
  },
  form: {
    width: '100%',
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  socialButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});

export default LoginScreen; 