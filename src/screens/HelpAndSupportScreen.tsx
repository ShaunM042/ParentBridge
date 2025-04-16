import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Documentation,
  FAQ,
  SupportTicket,
  getDocumentation,
  getFAQ,
  createSupportTicket,
  getSupportTickets,
  searchDocumentation,
  getDocumentationCategories,
} from '../services/documentation';
import { generateAccessibilityLabel } from '../services/accessibility';

const HelpAndSupportScreen = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'docs' | 'faq' | 'support'>('docs');
  const [documentation, setDocumentation] = useState<Documentation[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium' as SupportTicket['priority'],
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'docs') {
        const docs = await getDocumentation();
        setDocumentation(docs);
        const cats = await getDocumentationCategories();
        setCategories(['all', ...cats]);
      } else if (activeTab === 'faq') {
        const faqList = await getFAQ();
        setFaqs(faqList);
      } else if (activeTab === 'support' && user) {
        const tickets = await getSupportTickets(user.uid);
        setSupportTickets(tickets);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    setLoading(true);
    try {
      const results = await searchDocumentation(searchQuery);
      setDocumentation(results);
    } catch (error) {
      console.error('Error searching documentation:', error);
      Alert.alert('Error', 'Failed to search documentation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!user || !newTicket.subject || !newTicket.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await createSupportTicket({
        userId: user.uid,
        ...newTicket,
      });

      Alert.alert('Success', 'Support ticket created successfully');
      setNewTicket({
        subject: '',
        description: '',
        priority: 'medium',
      });
      loadData();
    } catch (error) {
      console.error('Error creating support ticket:', error);
      Alert.alert('Error', 'Failed to create support ticket');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = selectedCategory === 'all'
    ? documentation
    : documentation.filter(doc => doc.category === selectedCategory);

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
      ]}
    >
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'docs' && styles.activeTab,
            { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
          ]}
          onPress={() => setActiveTab('docs')}
          {...generateAccessibilityLabel('Documentation', 'View documentation')}
        >
          <Text
            style={[
              styles.tabText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Documentation
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'faq' && styles.activeTab,
            { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
          ]}
          onPress={() => setActiveTab('faq')}
          {...generateAccessibilityLabel('FAQ', 'View frequently asked questions')}
        >
          <Text
            style={[
              styles.tabText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            FAQ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'support' && styles.activeTab,
            { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
          ]}
          onPress={() => setActiveTab('support')}
          {...generateAccessibilityLabel('Support', 'View support tickets')}
        >
          <Text
            style={[
              styles.tabText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Support
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'docs' && (
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#444' : '#ddd' },
              ]}
              placeholder="Search documentation..."
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              {...generateAccessibilityLabel('Search', 'Search documentation')}
            />
            <TouchableOpacity
              style={[
                styles.searchButton,
                { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' },
              ]}
              onPress={handleSearch}
              {...generateAccessibilityLabel('Search', 'Search documentation')}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategory,
                  { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
                ]}
                onPress={() => setSelectedCategory(category)}
                {...generateAccessibilityLabel(category, `Filter by ${category}`)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <View style={styles.docsContainer}>
              {filteredDocs.map((doc) => (
                <View
                  key={doc.id}
                  style={[
                    styles.docItem,
                    { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
                  ]}
                >
                  <Text
                    style={[
                      styles.docTitle,
                      { color: isDarkMode ? '#fff' : '#000' },
                    ]}
                  >
                    {doc.title}
                  </Text>
                  <Text
                    style={[
                      styles.docContent,
                      { color: isDarkMode ? '#fff' : '#000' },
                    ]}
                  >
                    {doc.content}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {activeTab === 'faq' && (
        <View style={styles.section}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <View style={styles.faqContainer}>
              {faqs.map((faq) => (
                <View
                  key={faq.id}
                  style={[
                    styles.faqItem,
                    { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
                  ]}
                >
                  <Text
                    style={[
                      styles.faqQuestion,
                      { color: isDarkMode ? '#fff' : '#000' },
                    ]}
                  >
                    {faq.question}
                  </Text>
                  <Text
                    style={[
                      styles.faqAnswer,
                      { color: isDarkMode ? '#fff' : '#000' },
                    ]}
                  >
                    {faq.answer}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {activeTab === 'support' && (
        <View style={styles.section}>
          <View style={styles.ticketForm}>
            <TextInput
              style={[
                styles.input,
                { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#444' : '#ddd' },
              ]}
              placeholder="Subject"
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              value={newTicket.subject}
              onChangeText={(text) => setNewTicket({ ...newTicket, subject: text })}
              {...generateAccessibilityLabel('Subject', 'Enter ticket subject')}
            />
            <TextInput
              style={[
                styles.textArea,
                { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#444' : '#ddd' },
              ]}
              placeholder="Description"
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              value={newTicket.description}
              onChangeText={(text) => setNewTicket({ ...newTicket, description: text })}
              multiline
              numberOfLines={4}
              {...generateAccessibilityLabel('Description', 'Enter ticket description')}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' },
              ]}
              onPress={handleCreateTicket}
              disabled={loading}
              {...generateAccessibilityLabel('Submit', 'Submit support ticket')}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Ticket</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.ticketsContainer}>
            {supportTickets.map((ticket) => (
              <View
                key={ticket.id}
                style={[
                  styles.ticketItem,
                  { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
                ]}
              >
                <Text
                  style={[
                    styles.ticketSubject,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  {ticket.subject}
                </Text>
                <Text
                  style={[
                    styles.ticketStatus,
                    {
                      color:
                        ticket.status === 'resolved'
                          ? '#34C759'
                          : ticket.status === 'in-progress'
                          ? '#FF9500'
                          : isDarkMode
                          ? '#fff'
                          : '#000',
                    },
                  ]}
                >
                  {ticket.status}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  searchButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
  },
  docsContainer: {
    marginTop: 16,
  },
  docItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  docContent: {
    fontSize: 14,
  },
  faqContainer: {
    marginTop: 16,
  },
  faqItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
  },
  ticketForm: {
    marginBottom: 24,
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
  ticketsContainer: {
    marginTop: 16,
  },
  ticketItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ticketStatus: {
    fontSize: 14,
  },
});

export default HelpAndSupportScreen; 