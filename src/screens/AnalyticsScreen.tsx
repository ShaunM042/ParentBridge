import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  ClassroomAnalytics,
  MemberAnalytics,
  getClassroomAnalytics,
  getMemberAnalytics,
} from '../services/analytics';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const AnalyticsScreen = ({ route, navigation }: any) => {
  const { isDarkMode } = useTheme();
  const { classroomId } = route.params;
  const [classroomAnalytics, setClassroomAnalytics] = useState<ClassroomAnalytics | null>(null);
  const [memberAnalytics, setMemberAnalytics] = useState<{ [key: string]: MemberAnalytics }>({});
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [classroomId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analytics = await getClassroomAnalytics(classroomId);
      setClassroomAnalytics(analytics);

      // Load analytics for each member
      const memberAnalyticsData: { [key: string]: MemberAnalytics } = {};
      for (const memberId of Object.keys(analytics.postsByMember)) {
        memberAnalyticsData[memberId] = await getMemberAnalytics(classroomId, memberId);
      }
      setMemberAnalytics(memberAnalyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderClassroomStats = () => {
    if (!classroomAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Classroom Overview
        </Text>
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {classroomAnalytics.totalPosts}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDarkMode ? '#999' : '#666' },
              ]}
            >
              Total Posts
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {classroomAnalytics.totalMembers}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDarkMode ? '#999' : '#666' },
              ]}
            >
              Total Members
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {classroomAnalytics.activeMembers}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDarkMode ? '#999' : '#666' },
              ]}
            >
              Active Members
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {Math.round(classroomAnalytics.averagePostLength)}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDarkMode ? '#999' : '#666' },
              ]}
            >
              Avg. Post Length
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderActivityChart = () => {
    if (!classroomAnalytics) return null;

    const dates = Object.keys(classroomAnalytics.postsByDay);
    const data = {
      labels: dates.map(date => date.split('-')[2]), // Show only day
      datasets: [
        {
          data: dates.map(date => classroomAnalytics.postsByDay[date]),
        },
      ],
    };

    return (
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Activity (Last 30 Days)
        </Text>
        <LineChart
          data={data}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
            backgroundGradientFrom: isDarkMode ? '#1E1E1E' : '#fff',
            backgroundGradientTo: isDarkMode ? '#1E1E1E' : '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#007AFF',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderMemberStats = () => {
    if (!classroomAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          Member Activity
        </Text>
        {Object.entries(classroomAnalytics.postsByMember).map(([memberId, postCount]) => {
          const analytics = memberAnalytics[memberId];
          if (!analytics) return null;

          return (
            <TouchableOpacity
              key={memberId}
              style={[
                styles.memberCard,
                { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
              ]}
              onPress={() => setSelectedMember(memberId)}
            >
              <View style={styles.memberInfo}>
                <Text
                  style={[
                    styles.memberName,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  Member {memberId.slice(0, 6)}
                </Text>
                <Text
                  style={[
                    styles.memberStats,
                    { color: isDarkMode ? '#999' : '#666' },
                  ]}
                >
                  {postCount} posts • {analytics.totalComments} comments
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={isDarkMode ? '#999' : '#666'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderMemberDetails = () => {
    if (!selectedMember || !memberAnalytics[selectedMember]) return null;

    const analytics = memberAnalytics[selectedMember];

    return (
      <View style={styles.section}>
        <View style={styles.memberHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Member Details
          </Text>
          <TouchableOpacity onPress={() => setSelectedMember(null)}>
            <Icon
              name="close"
              size={24}
              color={isDarkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {analytics.totalPosts}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDarkMode ? '#999' : '#666' },
              ]}
            >
              Total Posts
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {analytics.totalComments}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDarkMode ? '#999' : '#666' },
              ]}
            >
              Total Comments
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {Math.round(analytics.averagePostLength)}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDarkMode ? '#999' : '#666' },
              ]}
            >
              Avg. Post Length
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {analytics.lastActive.toLocaleDateString()}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDarkMode ? '#999' : '#666' },
              ]}
            >
              Last Active
            </Text>
          </View>
        </View>
        <View style={styles.attachmentStats}>
          <Text
            style={[
              styles.attachmentTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Attachments
          </Text>
          <View style={styles.attachmentGrid}>
            <View
              style={[
                styles.attachmentCard,
                { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
              ]}
            >
              <Icon name="image" size={24} color="#007AFF" />
              <Text
                style={[
                  styles.attachmentValue,
                  { color: isDarkMode ? '#fff' : '#000' },
                ]}
              >
                {analytics.attachmentTypes.image}
              </Text>
              <Text
                style={[
                  styles.attachmentLabel,
                  { color: isDarkMode ? '#999' : '#666' },
                ]}
              >
                Images
              </Text>
            </View>
            <View
              style={[
                styles.attachmentCard,
                { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
              ]}
            >
              <Icon name="insert-drive-file" size={24} color="#007AFF" />
              <Text
                style={[
                  styles.attachmentValue,
                  { color: isDarkMode ? '#fff' : '#000' },
                ]}
              >
                {analytics.attachmentTypes.file}
              </Text>
              <Text
                style={[
                  styles.attachmentLabel,
                  { color: isDarkMode ? '#999' : '#666' },
                ]}
              >
                Files
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

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
          Analytics
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {renderClassroomStats()}
        {renderActivityChart()}
        {selectedMember ? renderMemberDetails() : renderMemberStats()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    width: '45%',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberStats: {
    fontSize: 14,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  attachmentStats: {
    marginTop: 24,
  },
  attachmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  attachmentGrid: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  attachmentCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  attachmentValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  attachmentLabel: {
    fontSize: 14,
  },
});

export default AnalyticsScreen; 