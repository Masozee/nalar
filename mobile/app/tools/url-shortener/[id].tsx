import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, Copy01Icon, ChartLineData03Icon } from '@hugeicons/core-free-icons';
import { getShortURLStats } from '@/lib/api/tools';

export default function URLDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [id]);

  const fetchStats = async () => {
    try {
      const response = await getShortURLStats(id as string);
      setData(response);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      Alert.alert('Error', 'Failed to load URL details');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Copied to clipboard');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>URL Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005357" />
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>URL Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>URL not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>URL Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Clicks</Text>
            <Text style={styles.statValue}>{data.total_clicks || 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today</Text>
            <Text style={styles.statValue}>{data.clicks_today || 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statValue}>{data.clicks_this_week || 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statValue}>{data.clicks_this_month || 0}</Text>
          </View>
        </View>

        {/* Top Countries */}
        {data.top_countries && data.top_countries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Countries</Text>
            {data.top_countries.map((country: any, index: number) => (
              <View key={index} style={styles.countryItem}>
                <Text style={styles.countryName}>{country.country || 'Unknown'}</Text>
                <Text style={styles.countryCount}>{country.count} clicks</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Clicks */}
        {data.recent_clicks && data.recent_clicks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Clicks</Text>
            {data.recent_clicks.map((click: any, index: number) => (
              <View key={index} style={styles.clickItem}>
                <View style={styles.clickInfo}>
                  <Text style={styles.clickDevice}>
                    {click.device_type || 'Unknown'} - {click.browser || 'Unknown'}
                  </Text>
                  <Text style={styles.clickLocation}>
                    {click.city}, {click.country || 'Unknown'}
                  </Text>
                </View>
                <Text style={styles.clickTime}>
                  {new Date(click.clicked_at).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#005357',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countryName: {
    fontSize: 14,
    color: '#111827',
  },
  countryCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  clickItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  clickInfo: {
    flex: 1,
  },
  clickDevice: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  clickLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  clickTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
