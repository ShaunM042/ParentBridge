import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SearchResult, searchAll } from '../services/search';

const SearchScreen = ({ navigation }: any) => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const searchResults = await searchAll(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'classroom') {
      navigation.navigate('Classroom', { classroomId: result.id });
    } else if (result.type === 'post' && result.classroomId) {
      navigation.navigate('Classroom', { classroomId: result.classroomId });
    }
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[
        styles.resultItem,
        { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
      ]}
      onPress={() => handleResultPress(item)}
    >
      <Icon
        name={item.type === 'classroom' ? 'class' : 'post'}
        size={24}
        color={isDarkMode ? '#fff' : '#000'}
        style={styles.resultIcon}
      />
      <View style={styles.resultContent}>
        <Text
          style={[
            styles.resultTitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          {item.title}
        </Text>
        {item.content && (
          <Text
            style={[
              styles.resultContentText,
              { color: isDarkMode ? '#999' : '#666' },
            ]}
            numberOfLines={2}
          >
            {item.content}
          </Text>
        )}
        {item.createdAt && (
          <Text
            style={[
              styles.resultTime,
              { color: isDarkMode ? '#666' : '#999' },
            ]}
          >
            {item.createdAt.toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
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
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
          ]}
        >
          <Icon
            name="search"
            size={20}
            color={isDarkMode ? '#999' : '#666'}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
            placeholder="Search posts and classrooms..."
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery('');
                setResults([]);
              }}
            >
              <Icon
                name="close"
                size={20}
                color={isDarkMode ? '#999' : '#666'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : results.length === 0 && searchQuery.length >= 2 ? (
        <View style={styles.emptyContainer}>
          <Icon
            name="search-off"
            size={48}
            color={isDarkMode ? '#666' : '#999'}
          />
          <Text
            style={[
              styles.emptyText,
              { color: isDarkMode ? '#999' : '#666' },
            ]}
          >
            No results found
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          keyboardShouldPersistTaps="handled"
        />
      )}
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  resultsList: {
    padding: 20,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultIcon: {
    marginRight: 16,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultContentText: {
    fontSize: 14,
    marginBottom: 8,
  },
  resultTime: {
    fontSize: 12,
  },
});

export default SearchScreen; 