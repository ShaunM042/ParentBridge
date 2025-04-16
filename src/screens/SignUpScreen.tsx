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
import { signInWithGoogle, signInWithFacebook } from '../services/auth';

const SignUpScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'parent' | 'teacher'>('parent');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp(email, password, name, role);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithFacebook();
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Facebook');
    } finally {
      setLoading(false);
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
          Create Account
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Join ParentBridge today
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
          placeholder="Full Name"
          placeholderTextColor={isDarkMode ? '#999' : '#666'}
          value={name}
          onChangeText={setName}
        />

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

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
              color: isDarkMode ? '#fff' : '#000',
            },
          ]}
          placeholder="Confirm Password"
          placeholderTextColor={isDarkMode ? '#999' : '#666'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View style={styles.roleContainer}>
          <Text
            style={[
              styles.roleLabel,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            I am a:
          </Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'parent' && styles.selectedRoleButton,
              ]}
              onPress={() => setRole('parent')}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === 'parent' && styles.selectedRoleButtonText,
                ]}
              >
                Parent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'teacher' && styles.selectedRoleButton,
              ]}
              onPress={() => setRole('teacher')}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === 'teacher' && styles.selectedRoleButtonText,
                ]}
              >
                Teacher
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

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
          onPress={handleGoogleSignUp}
          disabled={loading}
        >
          <Icon name="google" size={24} color="#DB4437" />
          <Text style={styles.socialButtonText}>Sign up with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleFacebookSignUp}
          disabled={loading}
        >
          <Icon name="facebook" size={24} color="#4267B2" />
          <Text style={styles.socialButtonText}>Sign up with Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
        >
          <Text
            style={[
              styles.loginText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Already have an account? Login
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
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRoleButton: {
    backgroundColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#000',
  },
  selectedRoleButtonText: {
    color: '#fff',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  loginText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});

export default SignUpScreen; 