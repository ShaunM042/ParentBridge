import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CreateAccountScreen = ({ navigation }: any) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate basic info
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      // Send verification code
      setStep(2);
    } else if (step === 2) {
      // Verify code
      if (!verificationCode) {
        Alert.alert('Error', 'Please enter the verification code');
        return;
      }
      setStep(3);
    }
  };

  const handleCreateAccount = async () => {
    if (!formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please enter and confirm your password');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    // Create account logic here
    navigation.navigate('Home');
  };

  const renderStep1 = () => (
    <>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
        ]}
        placeholder="First Name"
        placeholderTextColor={isDarkMode ? '#999' : '#666'}
        value={formData.firstName}
        onChangeText={(text) => handleInputChange('firstName', text)}
      />
      <TextInput
        style={[
          styles.input,
          { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
        ]}
        placeholder="Last Name"
        placeholderTextColor={isDarkMode ? '#999' : '#666'}
        value={formData.lastName}
        onChangeText={(text) => handleInputChange('lastName', text)}
      />
      <TextInput
        style={[
          styles.input,
          { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
        ]}
        placeholder="Email"
        placeholderTextColor={isDarkMode ? '#999' : '#666'}
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(text) => handleInputChange('email', text)}
      />
      <TextInput
        style={[
          styles.input,
          { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
        ]}
        placeholder="Phone Number"
        placeholderTextColor={isDarkMode ? '#999' : '#666'}
        keyboardType="phone-pad"
        value={formData.phoneNumber}
        onChangeText={(text) => handleInputChange('phoneNumber', text)}
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text
        style={[
          styles.verificationText,
          { color: isDarkMode ? '#fff' : '#000' },
        ]}
      >
        We've sent a verification code to your email and phone number.
      </Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
        ]}
        placeholder="Enter verification code"
        placeholderTextColor={isDarkMode ? '#999' : '#666'}
        keyboardType="number-pad"
        value={verificationCode}
        onChangeText={setVerificationCode}
      />
    </>
  );

  const renderStep3 = () => (
    <>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
        ]}
        placeholder="Create Password"
        placeholderTextColor={isDarkMode ? '#999' : '#666'}
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => handleInputChange('password', text)}
      />
      <TextInput
        style={[
          styles.input,
          { backgroundColor: isDarkMode ? '#333' : '#f5f5f5', color: isDarkMode ? '#fff' : '#000' },
        ]}
        placeholder="Confirm Password"
        placeholderTextColor={isDarkMode ? '#999' : '#666'}
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={(text) => handleInputChange('confirmPassword', text)}
      />
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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
            Create Account
          </Text>
        </View>

        <View style={styles.form}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <TouchableOpacity
            style={styles.button}
            onPress={step === 3 ? handleCreateAccount : handleNext}
          >
            <Text style={styles.buttonText}>
              {step === 3 ? 'Create Account' : 'Next'}
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
              onPress={() => {/* Handle Google sign up */}}
            >
              <Icon name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' }]}
              onPress={() => {/* Handle Apple sign up */}}
            >
              <Icon name="apple" size={24} color={isDarkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' }]}
              onPress={() => {/* Handle Facebook sign up */}}
            >
              <Icon name="facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  button: {
    height: 50,
    backgroundColor: '#007AFF',
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
  verificationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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

export default CreateAccountScreen; 