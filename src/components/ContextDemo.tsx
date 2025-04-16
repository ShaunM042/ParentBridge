import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSecurity } from '../context/SecurityContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { usePerformance } from '../context/PerformanceContext';

export const ContextDemo = () => {
  const {
    isEncryptionEnabled,
    isFacialRecognitionEnabled,
    hasGivenConsent,
    toggleEncryption,
    toggleFacialRecognition,
    setConsent,
    encryptData,
    decryptData,
    isBiometricAvailable,
    authenticateWithBiometrics,
  } = useSecurity();

  const {
    isScreenReaderEnabled,
    fontSize,
    highContrast,
    reducedMotion,
    colorBlindMode,
    darkMode,
    setFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    toggleColorBlindMode,
    toggleDarkMode,
    announceForAccessibility,
  } = useAccessibility();

  const {
    metrics,
    startScreenLoad,
    endScreenLoad,
    trackApiCall,
    reportCrash,
    clearMetrics,
    startPerformanceTracking,
    endPerformanceTracking,
  } = usePerformance();

  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    startScreenLoad('ContextDemo');
    checkBiometricAvailability();
    return () => {
      endScreenLoad('ContextDemo');
    };
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await isBiometricAvailable();
    setBiometricAvailable(available);
  };

  const handleEncrypt = async () => {
    startPerformanceTracking('encryption');
    const text = 'Hello, this is a test message!';
    const encrypted = await encryptData(text);
    setEncryptedText(encrypted);
    endPerformanceTracking('encryption');
  };

  const handleDecrypt = async () => {
    if (encryptedText) {
      startPerformanceTracking('decryption');
      const decrypted = await decryptData(encryptedText);
      setDecryptedText(decrypted);
      endPerformanceTracking('decryption');
    }
  };

  const handleBiometricAuth = async () => {
    const success = await authenticateWithBiometrics();
    announceForAccessibility(success ? 'Biometric authentication successful' : 'Biometric authentication failed');
  };

  const handleCrash = () => {
    try {
      throw new Error('Test crash report');
    } catch (error) {
      reportCrash(error as Error);
    }
  };

  return (
    <ScrollView style={[
      styles.container,
      highContrast && styles.highContrast,
      darkMode && styles.darkMode
    ]}>
      <Text style={[styles.title, { fontSize }]}>Context Demo</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Context</Text>
        <View style={styles.toggleContainer}>
          <Text>Encryption: {isEncryptionEnabled ? 'Enabled' : 'Disabled'}</Text>
          <TouchableOpacity style={styles.button} onPress={toggleEncryption}>
            <Text>Toggle Encryption</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleContainer}>
          <Text>Facial Recognition: {isFacialRecognitionEnabled ? 'Enabled' : 'Disabled'}</Text>
          <TouchableOpacity style={styles.button} onPress={toggleFacialRecognition}>
            <Text>Toggle Facial Recognition</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleContainer}>
          <Text>Consent: {hasGivenConsent ? 'Given' : 'Not Given'}</Text>
          <TouchableOpacity style={styles.button} onPress={() => setConsent(!hasGivenConsent)}>
            <Text>Toggle Consent</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleEncrypt}>
          <Text>Encrypt Test Message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleDecrypt}>
          <Text>Decrypt Message</Text>
        </TouchableOpacity>

        {biometricAvailable && (
          <TouchableOpacity style={styles.button} onPress={handleBiometricAuth}>
            <Text>Test Biometric Auth</Text>
          </TouchableOpacity>
        )}

        {encryptedText && <Text>Encrypted: {encryptedText}</Text>}
        {decryptedText && <Text>Decrypted: {decryptedText}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accessibility Context</Text>
        <View style={styles.toggleContainer}>
          <Text>Screen Reader: {isScreenReaderEnabled ? 'Enabled' : 'Disabled'}</Text>
        </View>

        <View style={styles.toggleContainer}>
          <Text>Font Size: {fontSize}</Text>
          <TouchableOpacity style={styles.button} onPress={() => setFontSize(fontSize + 2)}>
            <Text>Increase Font</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setFontSize(fontSize - 2)}>
            <Text>Decrease Font</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleContainer}>
          <Text>High Contrast: {highContrast ? 'Enabled' : 'Disabled'}</Text>
          <TouchableOpacity style={styles.button} onPress={toggleHighContrast}>
            <Text>Toggle High Contrast</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleContainer}>
          <Text>Reduced Motion: {reducedMotion ? 'Enabled' : 'Disabled'}</Text>
          <TouchableOpacity style={styles.button} onPress={toggleReducedMotion}>
            <Text>Toggle Reduced Motion</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleContainer}>
          <Text>Color Blind Mode: {colorBlindMode ? 'Enabled' : 'Disabled'}</Text>
          <TouchableOpacity style={styles.button} onPress={toggleColorBlindMode}>
            <Text>Toggle Color Blind Mode</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleContainer}>
          <Text>Dark Mode: {darkMode ? 'Enabled' : 'Disabled'}</Text>
          <TouchableOpacity style={styles.button} onPress={toggleDarkMode}>
            <Text>Toggle Dark Mode</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Context</Text>
        <Text>FPS: {metrics.fps}</Text>
        <Text>Memory Usage: {metrics.memoryUsage} MB</Text>
        <Text>Network Status: {metrics.networkStatus}</Text>
        <Text>App State: {metrics.appState}</Text>

        <TouchableOpacity style={styles.button} onPress={handleCrash}>
          <Text>Test Crash Reporting</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={clearMetrics}>
          <Text>Clear Metrics</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  highContrast: {
    backgroundColor: '#000',
  },
  darkMode: {
    backgroundColor: '#1a1a1a',
  },
}); 