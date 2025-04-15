import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_KEY = '@biometric_enabled';

export const isBiometricAvailable = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

export const authenticateWithBiometrics = async (): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access your account',
      fallbackLabel: 'Use passcode',
    });
    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
};

export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error reading biometric setting:', error);
    return false;
  }
};

export const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(BIOMETRIC_KEY, enabled.toString());
  } catch (error) {
    console.error('Error setting biometric setting:', error);
    throw error;
  }
}; 