import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createTicket } from '../services/support';

const CreateTicketScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (user) {
        await createTicket({
          title: title.trim(),
          description: description.trim(),
          priority,
          category: category.trim(),
          userId: user.uid,
          status: 'open',
          createdAt: new Date(),
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      Alert.alert('Error', 'Failed to create support ticket. Please try again.');
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
      <View style={styles.form}>
        <Text
          style={[
            styles.label,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Title *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
              color: isDarkMode ? '#fff' : '#000',
            },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter ticket title"
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
        />

        <Text
          style={[
            styles.label,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Description *
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
              color: isDarkMode ? '#fff' : '#000',
            },
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your issue in detail"
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          multiline
          numberOfLines={4}
        />

        <Text
          style={[
            styles.label,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Priority
        </Text>
        <View style={styles.priorityContainer}>
          {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityButton,
                {
                  backgroundColor:
                    priority === p
                      ? isDarkMode
                        ? '#007AFF'
                        : '#007AFF'
                      : isDarkMode
                      ? '#333'
                      : '#f5f5f5',
                },
              ]}
              onPress={() => setPriority(p)}
            >
              <Text
                style={[
                  styles.priorityText,
                  {
                    color:
                      priority === p
                        ? '#fff'
                        : isDarkMode
                        ? '#fff'
                        : '#000',
                  },
                ]}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text
          style={[
            styles.label,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Category
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
              color: isDarkMode ? '#fff' : '#000',
            },
          ]}
          value={category}
          onChangeText={setCategory}
          placeholder="Enter category (optional)"
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Ticket</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateTicketScreen; 