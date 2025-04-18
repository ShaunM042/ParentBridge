import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Feedback, submitFeedback, uploadScreenshot, getFeedbackHistory } from '../services/feedback';
import { generateAccessibilityLabel } from '../services/accessibility';

const FeedbackScreen = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [type, setType] = useState<Feedback['type']>('suggestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadFeedbackHistory();
  }, []);

  const loadFeedbackHistory = async () => {
    if (!user) return;
    try {
      const history = await getFeedbackHistory(user.uid);
      setFeedbackHistory(history);
    } catch (error) {
      console.error('Error loading feedback history:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions to attach screenshots');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setScreenshot(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!user || !title || !description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let screenshotUrl;
      if (screenshot) {
        screenshotUrl = await uploadScreenshot(user.uid, screenshot);
      }

      const deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version.toString(),
        model: Platform.constants.Model || 'Unknown',
      };

      await submitFeedback({
        userId: user.uid,
        type,
        title,
        description,
        screenshotUrl,
        deviceInfo,
      });

      Alert.alert('Success', 'Thank you for your feedback!');
      setTitle('');
      setDescription('');
      setScreenshot(null);
      loadFeedbackHistory();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
      ]}
    >
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Submit Feedback
        </Text>

        <View style={styles.typeContainer}>
          {(['bug', 'feature', 'suggestion', 'other'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeButton,
                type === t && styles.selectedType,
                { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
              ]}
              onPress={() => setType(t)}
              {...generateAccessibilityLabel(t, `Select ${t} type`)}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: isDarkMode ? '#fff' : '#000' },
                ]}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[
            styles.input,
            { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#444' : '#ddd' },
          ]}
          placeholder="Title"
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          value={title}
          onChangeText={setTitle}
          {...generateAccessibilityLabel('Title', 'Enter feedback title')}
        />

        <TextInput
          style={[
            styles.textArea,
            { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#444' : '#ddd' },
          ]}
          placeholder="Description"
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          {...generateAccessibilityLabel('Description', 'Enter feedback description')}
        />

        {screenshot && (
          <View style={styles.screenshotContainer}>
            <Image source={{ uri: screenshot }} style={styles.screenshot} />
            <TouchableOpacity
              style={[
                styles.removeButton,
                { backgroundColor: isDarkMode ? '#FF3B30' : '#FF453A' },
              ]}
              onPress={() => setScreenshot(null)}
              {...generateAccessibilityLabel('Remove', 'Remove screenshot')}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.attachButton,
            { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
          ]}
          onPress={pickImage}
          {...generateAccessibilityLabel('Attach', 'Attach screenshot')}
        >
          <Text
            style={[
              styles.attachButtonText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Attach Screenshot
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' },
          ]}
          onPress={handleSubmit}
          disabled={loading}
          {...generateAccessibilityLabel('Submit', 'Submit feedback')}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.historyHeader}
          onPress={() => setShowHistory(!showHistory)}
          {...generateAccessibilityLabel('History', 'Toggle feedback history')}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Feedback History
          </Text>
          <Text
            style={[
              styles.toggleText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            {showHistory ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>

        {showHistory && (
          <View style={styles.historyContainer}>
            {feedbackHistory.map((feedback) => (
              <View
                key={feedback.id}
                style={[
                  styles.feedbackItem,
                  { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
                ]}
              >
                <Text
                  style={[
                    styles.feedbackTitle,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  {feedback.title}
                </Text>
                <Text
                  style={[
                    styles.feedbackType,
                    { color: isDarkMode ? '#999' : '#666' },
                  ]}
                >
                  {feedback.type}
                </Text>
                <Text
                  style={[
                    styles.feedbackStatus,
                    {
                      color:
                        feedback.status === 'resolved'
                          ? '#34C759'
                          : feedback.status === 'in-progress'
                          ? '#FF9500'
                          : isDarkMode
                          ? '#fff'
                          : '#000',
                    },
                  ]}
                >
                  {feedback.status}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedType: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  screenshotContainer: {
    marginBottom: 16,
  },
  screenshot: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  attachButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  attachButtonText: {
    fontSize: 16,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
  },
  historyContainer: {
    marginTop: 16,
  },
  feedbackItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  feedbackType: {
    fontSize: 14,
    marginBottom: 4,
  },
  feedbackStatus: {
    fontSize: 14,
  },
});

export default FeedbackScreen; 