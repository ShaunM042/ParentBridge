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

const ForgotPasswordScreen = ({ navigation }: any) => {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement email verification code sending
      // await sendVerificationCode(email);
      Alert.alert('Success', 'Verification code sent to your email');
      setStep(2);
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement code verification
      // await verifyCode(email, verificationCode);
      setStep(3);
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please enter and confirm your new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement password reset
      // await resetPassword(email, newPassword);
      Alert.alert('Success', 'Password reset successfully');
      navigation.navigate('SignIn');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Text
        style={[
          styles.subtitle,
          { color: isDarkMode ? '#999' : '#666' },
        ]}
      >
        Enter your email address to receive a verification code
      </Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
        ]}
        placeholder="Email"
        placeholderTextColor={isDarkMode ? '#666' : '#999'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#007AFF' }]}
        onPress={handleSendCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send Code</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text
        style={[
          styles.subtitle,
          { color: isDarkMode ? '#999' : '#666' },
        ]}
      >
        Enter the verification code sent to your email
      </Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
        ]}
        placeholder="Verification Code"
        placeholderTextColor={isDarkMode ? '#666' : '#999'}
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="number-pad"
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#007AFF' }]}
        onPress={handleVerifyCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify Code</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text
        style={[
          styles.subtitle,
          { color: isDarkMode ? '#999' : '#666' },
        ]}
      >
        Enter your new password
      </Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
        ]}
        placeholder="New Password"
        placeholderTextColor={isDarkMode ? '#666' : '#999'}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TextInput
        style={[
          styles.input,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
        ]}
        placeholder="Confirm New Password"
        placeholderTextColor={isDarkMode ? '#666' : '#999'}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#007AFF' }]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </>
  );

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
          Reset Password
        </Text>
      </View>

      <View style={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen; 