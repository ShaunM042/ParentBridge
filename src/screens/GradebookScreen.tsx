import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getStudentGrades,
  getStudentClasses,
  Grade,
  Class,
  calculateAverageGrade,
} from '../services/gradebook';

const GradebookScreen = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      if (!user?.children?.[0]) return; // Assuming first child for now

      const [fetchedGrades, fetchedClasses] = await Promise.all([
        getStudentGrades(user.children[0]),
        getStudentClasses(user.children[0]),
      ]);

      setGrades(fetchedGrades);
      setClasses(fetchedClasses);
      if (fetchedClasses.length > 0 && !selectedClass) {
        setSelectedClass(fetchedClasses[0].id);
      }
    } catch (error) {
      console.error('Error fetching gradebook data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const filteredGrades = selectedClass
    ? grades.filter(grade => grade.classId === selectedClass)
    : grades;

  const averageGrade = calculateAverageGrade(filteredGrades);

  const renderClassItem = ({ item }: { item: Class }) => (
    <TouchableOpacity
      style={[
        styles.classItem,
        selectedClass === item.id && styles.selectedClassItem,
        isDarkMode && styles.darkClassItem,
      ]}
      onPress={() => setSelectedClass(item.id)}
    >
      <Text
        style={[
          styles.className,
          selectedClass === item.id && styles.selectedClassName,
          isDarkMode && styles.darkText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderGradeItem = ({ item }: { item: Grade }) => (
    <View style={[styles.gradeItem, isDarkMode && styles.darkGradeItem]}>
      <View style={styles.gradeHeader}>
        <Text style={[styles.assignmentTitle, isDarkMode && styles.darkText]}>
          {item.assignmentId}
        </Text>
        <Text style={[styles.gradeScore, isDarkMode && styles.darkText]}>
          {item.score}/{item.maxScore}
        </Text>
      </View>
      <Text style={[styles.gradeFeedback, isDarkMode && styles.darkText]}>
        {item.feedback}
      </Text>
      <Text style={[styles.gradeDate, isDarkMode && styles.darkText]}>
        {item.timestamp.toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.averageGrade, isDarkMode && styles.darkText]}>
          Average Grade: {averageGrade.toFixed(1)}%
        </Text>
      </View>

      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.classesList}
      />

      <FlatList
        data={filteredGrades}
        renderItem={renderGradeItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.gradesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkHeader: {
    borderBottomColor: '#333',
  },
  averageGrade: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  classesList: {
    maxHeight: 60,
    paddingHorizontal: 16,
  },
  classItem: {
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  darkClassItem: {
    backgroundColor: '#1e1e1e',
  },
  selectedClassItem: {
    backgroundColor: '#007AFF',
  },
  className: {
    fontSize: 16,
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  selectedClassName: {
    color: '#fff',
  },
  gradesList: {
    padding: 16,
  },
  gradeItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  darkGradeItem: {
    backgroundColor: '#1e1e1e',
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gradeScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gradeFeedback: {
    fontSize: 14,
    marginBottom: 8,
  },
  gradeDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default GradebookScreen; 