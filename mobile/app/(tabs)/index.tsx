import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI } from '@/lib/api';
import AppHeader from '@/components/AppHeader';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  UserGroupIcon,
  Building02Icon,
  CheckmarkBadge01Icon,
  BookOpen02Icon,
  ChartLineData03Icon,
  PlusSignIcon,
  Settings02Icon,
  FaceIdIcon,
} from '@hugeicons/core-free-icons';
import { router } from 'expo-router';

type DashboardStats = {
  total_employees: number;
  total_departments: number;
  total_positions: number;
  total_publications: number;
};

type RecentActivity = {
  id: string;
  type: string;
  description: string;
  timestamp: string;
};

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivities(),
      ]);

      setStats(statsRes.data);
      setActivities(activitiesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005357" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Dashboard"
        subtitle="Organization overview and key metrics"
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.attendanceButton}
            onPress={() => router.push('/attendance')}
          >
            <HugeiconsIcon icon={FaceIdIcon} size={32} color="#fff" />
            <Text style={styles.attendanceButtonText}>Face Attendance</Text>
            <Text style={styles.attendanceButtonSubtext}>Check in/out with face recognition</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {/* Total Employees */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Employees</Text>
                <HugeiconsIcon icon={UserGroupIcon} size={24} color="#6B7280" />
              </View>
              <Text style={styles.statValue}>{stats?.total_employees || 0}</Text>
              <Text style={styles.statSubtext}>Active staff</Text>
            </View>

            {/* Total Departments */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Departments</Text>
                <HugeiconsIcon icon={Building02Icon} size={24} color="#6B7280" />
              </View>
              <Text style={styles.statValue}>{stats?.total_departments || 0}</Text>
              <Text style={styles.statSubtext}>Org units</Text>
            </View>

            {/* Total Positions */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Positions</Text>
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={24} color="#6B7280" />
              </View>
              <Text style={styles.statValue}>{stats?.total_positions || 0}</Text>
              <Text style={styles.statSubtext}>Job roles</Text>
            </View>

            {/* Total Publications */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Publications</Text>
                <HugeiconsIcon icon={BookOpen02Icon} size={24} color="#6B7280" />
              </View>
              <Text style={styles.statValue}>{stats?.total_publications || 0}</Text>
              <Text style={styles.statSubtext}>Published research</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Text style={styles.sectionSubtitle}>
                Latest updates from your organization
              </Text>
            </View>

            {activities.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No recent activities</Text>
              </View>
            ) : (
              <View>
                {activities.slice(0, 5).map((activity, index) => (
                  <View
                    key={activity.id || index}
                    style={styles.activityItem}
                  >
                    <View style={styles.activityDot} />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityType}>{activity.type}</Text>
                      <Text style={styles.activityDescription}>
                        {activity.description}
                      </Text>
                      <Text style={styles.activityTime}>
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <HugeiconsIcon icon={ChartLineData03Icon} size={28} color="#005357" />
              <Text style={styles.actionText}>View Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <HugeiconsIcon icon={PlusSignIcon} size={28} color="#005357" />
              <Text style={styles.actionText}>New Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <HugeiconsIcon icon={Settings02Icon} size={28} color="#005357" />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    padding: 16,
    paddingBottom: 8,
  },
  attendanceButton: {
    backgroundColor: '#005357',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  attendanceButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  attendanceButtonSubtext: {
    color: '#B0D4D6',
    fontSize: 14,
    marginTop: 4,
  },
  statsContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  statSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityHeader: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    backgroundColor: '#005357',
    borderRadius: 4,
    marginTop: 8,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 110,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: '#111827',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
});
