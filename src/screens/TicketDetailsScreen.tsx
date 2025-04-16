import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  Dimensions,
  Linking,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { SupportTicket, getTicket, addMessage, subscribeToTicket, updateTicketStatus, uploadFile, updateTicketPriority, assignTicket, addTag, removeTag, getSupportStaff, getTicketHistory } from '../services/support';

const FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'text/plain',
    'text/markdown',
  ],
  spreadsheet: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet',
  ],
  presentation: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.presentation',
  ],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const TicketDetailsScreen = ({ route, navigation }: any) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [supportStaff, setSupportStaff] = useState<any[]>([]);
  const [ticketHistory, setTicketHistory] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<SupportTicket['status'] | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<SupportTicket['priority'] | null>(null);
  const [newTag, setNewTag] = useState('');
  const [previewFile, setPreviewFile] = useState<{ uri: string; type: string } | null>(null);
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ticketData, staffData, historyData] = await Promise.all([
          getTicket(ticketId),
          getSupportStaff(),
          getTicketHistory(ticketId),
        ]);
        setTicket(ticketData);
        setSupportStaff(staffData);
        setTicketHistory(historyData);
      } catch (error) {
        console.error('Failed to load data:', error);
        Alert.alert('Error', 'Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const unsubscribe = subscribeToTicket(ticketId, (updatedTicket) => {
      setTicket(updatedTicket);
    });

    return () => unsubscribe();
  }, [ticketId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticket || !user) return;

    setSending(true);
    try {
      await addMessage(ticketId, user.uid, newMessage.trim());
      setNewMessage('');
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          ...FILE_TYPES.image,
          ...FILE_TYPES.document,
          ...FILE_TYPES.spreadsheet,
          ...FILE_TYPES.presentation,
        ],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const fileInfo = await FileSystem.getInfoAsync(result.uri);
        if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
          Alert.alert('Error', 'File size exceeds the 10MB limit');
          return;
        }

        setUploading(true);
        const fileUrl = await uploadFile(result.uri);
        await addMessage(ticketId, user?.uid || '', '', fileUrl, result.mimeType);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDownload = async (url: string, filename: string) => {
    try {
      const downloadPath = `${FileSystem.documentDirectory}${filename}`;
      const { uri } = await FileSystem.downloadAsync(url, downloadPath);
      await Linking.openURL(uri);
    } catch (error) {
      console.error('Failed to download file:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const handleStatusUpdate = async (status: SupportTicket['status']) => {
    try {
      await updateTicketStatus(ticketId, status);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert('Error', 'Failed to update ticket status');
    }
  };

  const handlePriorityUpdate = async (priority: SupportTicket['priority']) => {
    try {
      await updateTicketPriority(ticketId, priority);
      setShowPriorityModal(false);
    } catch (error) {
      console.error('Failed to update priority:', error);
      Alert.alert('Error', 'Failed to update ticket priority');
    }
  };

  const handleAssignment = async (assigneeId: string) => {
    try {
      await assignTicket(ticketId, assigneeId);
      setShowAssignmentModal(false);
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      Alert.alert('Error', 'Failed to assign ticket');
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      await addTag(ticketId, newTag.trim());
      setNewTag('');
    } catch (error) {
      console.error('Failed to add tag:', error);
      Alert.alert('Error', 'Failed to add tag');
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      await removeTag(ticketId, tag);
    } catch (error) {
      console.error('Failed to remove tag:', error);
      Alert.alert('Error', 'Failed to remove tag');
    }
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return '#007AFF';
      case 'in-progress':
        return '#FF9500';
      case 'resolved':
        return '#34C759';
      case 'closed':
        return '#8E8E93';
      default:
        return '#007AFF';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent':
        return '#FF3B30';
      case 'high':
        return '#FF9500';
      case 'medium':
        return '#FFCC00';
      case 'low':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStatusModal = () => (
    <Modal
      visible={showStatusModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowStatusModal(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowStatusModal(false)}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDarkMode ? '#333' : '#fff' },
          ]}
        >
          <Text
            style={[
              styles.modalTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Update Ticket Status
          </Text>
          {(['open', 'in-progress', 'resolved', 'closed'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusOption,
                {
                  backgroundColor:
                    status === selectedStatus
                      ? isDarkMode
                        ? '#007AFF'
                        : '#007AFF'
                      : isDarkMode
                      ? '#444'
                      : '#f5f5f5',
                },
              ]}
              onPress={() => {
                setSelectedStatus(status);
                handleStatusUpdate(status);
              }}
            >
              <Text
                style={[
                  styles.statusOptionText,
                  {
                    color:
                      status === selectedStatus
                        ? '#fff'
                        : isDarkMode
                        ? '#fff'
                        : '#000',
                  },
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );

  const renderPriorityModal = () => (
    <Modal
      visible={showPriorityModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPriorityModal(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowPriorityModal(false)}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDarkMode ? '#333' : '#fff' },
          ]}
        >
          <Text
            style={[
              styles.modalTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Update Ticket Priority
          </Text>
          {(['urgent', 'high', 'medium', 'low'] as const).map((priority) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.priorityOption,
                {
                  backgroundColor:
                    priority === selectedPriority
                      ? isDarkMode
                        ? '#007AFF'
                        : '#007AFF'
                      : isDarkMode
                      ? '#444'
                      : '#f5f5f5',
                },
              ]}
              onPress={() => {
                setSelectedPriority(priority);
                handlePriorityUpdate(priority);
              }}
            >
              <Text
                style={[
                  styles.priorityOptionText,
                  {
                    color:
                      priority === selectedPriority
                        ? '#fff'
                        : isDarkMode
                        ? '#fff'
                        : '#000',
                  },
                ]}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );

  const renderAssignmentModal = () => (
    <Modal
      visible={showAssignmentModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAssignmentModal(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowAssignmentModal(false)}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDarkMode ? '#333' : '#fff' },
          ]}
        >
          <Text
            style={[
              styles.modalTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Assign Ticket
          </Text>
          <ScrollView style={styles.staffList}>
            {supportStaff.map((staff) => (
              <TouchableOpacity
                key={staff.id}
                style={[
                  styles.staffItem,
                  {
                    backgroundColor:
                      ticket?.assignedTo === staff.id
                        ? isDarkMode
                          ? '#007AFF'
                          : '#007AFF'
                        : isDarkMode
                        ? '#444'
                        : '#f5f5f5',
                  },
                ]}
                onPress={() => handleAssignment(staff.id)}
              >
                <Image
                  source={{ uri: staff.photoURL }}
                  style={styles.staffAvatar}
                />
                <View style={styles.staffInfo}>
                  <Text
                    style={[
                      styles.staffName,
                      {
                        color:
                          ticket?.assignedTo === staff.id
                            ? '#fff'
                            : isDarkMode
                            ? '#fff'
                            : '#000',
                      },
                    ]}
                  >
                    {staff.displayName}
                  </Text>
                  <Text
                    style={[
                      styles.staffRole,
                      {
                        color:
                          ticket?.assignedTo === staff.id
                            ? 'rgba(255, 255, 255, 0.7)'
                            : isDarkMode
                            ? '#999'
                            : '#666',
                      },
                    ]}
                  >
                    {staff.role}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  const renderTagsModal = () => (
    <Modal
      visible={showTagsModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowTagsModal(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowTagsModal(false)}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDarkMode ? '#333' : '#fff' },
          ]}
        >
          <Text
            style={[
              styles.modalTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Add Tag
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
              },
            ]}
            value={newTag}
            onChangeText={setNewTag}
            placeholder="Enter tag name"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
          />
          <TouchableOpacity
            style={styles.addTagButton}
            onPress={handleAddTag}
          >
            <Icon name="add" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );

  const renderHistoryModal = () => (
    <Modal
      visible={showHistoryModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowHistoryModal(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowHistoryModal(false)}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDarkMode ? '#333' : '#fff' },
          ]}
        >
          <Text
            style={[
              styles.modalTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Ticket History
          </Text>
          <ScrollView style={styles.historyList}>
            {ticketHistory.map((event) => (
              <View
                key={event.id}
                style={[
                  styles.historyItem,
                  { backgroundColor: isDarkMode ? '#444' : '#f5f5f5' },
                ]}
              >
                <Text
                  style={[
                    styles.historyText,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  {event.description}
                </Text>
                <Text
                  style={[
                    styles.historyTime,
                    { color: isDarkMode ? '#999' : '#666' },
                  ]}
                >
                  {formatDate(event.timestamp)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  const renderFilePreview = () => (
    <Modal
      visible={!!previewFile}
      transparent
      animationType="fade"
      onRequestClose={() => setPreviewFile(null)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setPreviewFile(null)}
      >
        <View
          style={[
            styles.previewContainer,
            { backgroundColor: isDarkMode ? '#333' : '#fff' },
          ]}
        >
          {FILE_TYPES.image.includes(previewFile?.type || '') ? (
            <Image
              source={{ uri: previewFile?.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.documentPreview}>
              <Icon
                name={
                  FILE_TYPES.document.includes(previewFile?.type || '')
                    ? 'description'
                    : FILE_TYPES.spreadsheet.includes(previewFile?.type || '')
                    ? 'table-chart'
                    : 'slideshow'
                }
                size={64}
                color={isDarkMode ? '#fff' : '#000'}
              />
              <Text
                style={[
                  styles.documentText,
                  { color: isDarkMode ? '#fff' : '#000' },
                ]}
              >
                {previewFile?.type.split('/').pop()?.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Modal>
  );

  const renderMessage = (message: any) => {
    const isUserMessage = message.userId === user?.uid;
    const hasAttachment = !!message.attachmentUrl;

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          {
            backgroundColor: isUserMessage
              ? isDarkMode
                ? '#007AFF'
                : '#007AFF'
              : isDarkMode
              ? '#333'
              : '#f5f5f5',
            alignSelf: isUserMessage ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        {message.content && (
          <Text
            style={[
              styles.messageText,
              { color: isUserMessage ? '#fff' : isDarkMode ? '#fff' : '#000' },
            ]}
          >
            {message.content}
          </Text>
        )}
        {hasAttachment && (
          <TouchableOpacity
            style={styles.attachmentPreview}
            onPress={() => setPreviewFile({ uri: message.attachmentUrl, type: message.attachmentType })}
          >
            {FILE_TYPES.image.includes(message.attachmentType) ? (
              <Image
                source={{ uri: message.attachmentUrl }}
                style={styles.attachmentImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.attachmentIcon}>
                <Icon
                  name={
                    FILE_TYPES.document.includes(message.attachmentType)
                      ? 'description'
                      : FILE_TYPES.spreadsheet.includes(message.attachmentType)
                      ? 'table-chart'
                      : 'slideshow'
                  }
                  size={24}
                  color={isUserMessage ? '#fff' : isDarkMode ? '#fff' : '#000'}
                />
              </View>
            )}
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleFileDownload(message.attachmentUrl, message.attachmentName)}
            >
              <Icon name="download" size={20} color="#007AFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        <Text
          style={[
            styles.messageTime,
            {
              color: isUserMessage
                ? 'rgba(255, 255, 255, 0.7)'
                : isDarkMode
                ? '#999'
                : '#666',
            },
          ]}
        >
          {formatDate(message.timestamp)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
        ]}
      >
        <Text
          style={[
            styles.errorText,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Ticket not found
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
      ]}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.ticketHeader,
            { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
          ]}
        >
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => setShowHistoryModal(true)}
            >
              <Icon name="history" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.ticketTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            {ticket.title}
          </Text>
          <View style={styles.ticketMeta}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(ticket.status) },
              ]}
            >
              <Text style={styles.statusText}>{ticket.status}</Text>
            </View>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(ticket.priority) },
              ]}
            >
              <Text style={styles.priorityText}>{ticket.priority}</Text>
            </View>
          </View>
          <View style={styles.tagsContainer}>
            {ticket.tags?.map((tag) => (
              <View
                key={tag}
                style={[
                  styles.tag,
                  { backgroundColor: isDarkMode ? '#444' : '#e0e0e0' },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  {tag}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveTag(tag)}
                  style={styles.removeTagButton}
                >
                  <Icon name="close" size={16} color={isDarkMode ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={[
                styles.addTagButton,
                { backgroundColor: isDarkMode ? '#444' : '#e0e0e0' },
              ]}
              onPress={() => setShowTagsModal(true)}
            >
              <Icon name="add" size={20} color={isDarkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.ticketDescription,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            {ticket.description}
          </Text>
          <Text
            style={[
              styles.ticketDate,
              { color: isDarkMode ? '#999' : '#666' },
            ]}
          >
            Created on {formatDate(ticket.createdAt)}
          </Text>
        </View>

        <View style={styles.messagesContainer}>
          {ticket.messages.map(renderMessage)}
        </View>
      </ScrollView>

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
        ]}
      >
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={handleFilePick}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Icon name="attach-file" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
            },
          ]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={sending || !newMessage.trim()}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Icon name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {renderFilePreview()}
      {renderStatusModal()}
      {renderPriorityModal()}
      {renderAssignmentModal()}
      {renderTagsModal()}
      {renderHistoryModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  ticketHeader: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  ticketTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ticketMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ticketDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  ticketDate: {
    fontSize: 12,
  },
  messagesContainer: {
    flex: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  attachmentButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  previewContainer: {
    width: '90%',
    height: '80%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  documentPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentText: {
    marginTop: 8,
    fontSize: 16,
  },
  attachmentPreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  attachmentIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  addTagButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffList: {
    maxHeight: 300,
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  staffRole: {
    fontSize: 14,
  },
  historyList: {
    maxHeight: 400,
  },
  historyItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyText: {
    fontSize: 14,
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  historyButton: {
    padding: 8,
  },
  downloadButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 4,
    borderRadius: 12,
  },
});

export default TicketDetailsScreen; 