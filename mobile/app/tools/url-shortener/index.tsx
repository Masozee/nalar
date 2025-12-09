import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, PlusSignIcon, LinkSquare02Icon, Copy01Icon } from '@hugeicons/core-free-icons';
import { getShortURLs } from '@/lib/api/tools';

export default function URLShortenerListScreen() {
  const router = useRouter();
  const [urls, setUrls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchURLs = async () => {
    try {
      const data = await getShortURLs();
      setUrls(data.results || data || []);
    } catch (error) {
      console.error('Failed to fetch URLs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchURLs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchURLs();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>URL Shortener</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005357" />
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
        <Text style={styles.headerTitle}>URL Shortener</Text>
        <TouchableOpacity
          onPress={() => router.push('/tools/url-shortener/create' as any)}
          style={styles.addButton}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {urls.length === 0 ? (
          <View style={styles.emptyState}>
            <HugeiconsIcon icon={LinkSquare02Icon} size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No shortened URLs</Text>
            <Text style={styles.emptyText}>Create your first short URL to get started</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/tools/url-shortener/create' as any)}
            >
              <Text style={styles.createButtonText}>Create Short URL</Text>
            </TouchableOpacity>
          </View>
        ) : (
          urls.map((url, index) => (
            <TouchableOpacity
              key={url.id || index}
              style={styles.urlCard}
              onPress={() => router.push(`/tools/url-shortener/${url.id}` as any)}
            >
              <View style={styles.urlHeader}>
                <View style={styles.iconWrapper}>
                  <HugeiconsIcon icon={LinkSquare02Icon} size={20} color="#005357" />
                </View>
                <View style={styles.urlInfo}>
                  <Text style={styles.urlTitle}>{url.title || 'Untitled'}</Text>
                  <Text style={styles.shortUrl}>{url.short_url}</Text>
                </View>
              </View>
              <Text style={styles.originalUrl} numberOfLines={1}>
                {url.original_url}
              </Text>
              <View style={styles.urlFooter}>
                <Text style={styles.clicks}>{url.click_count || 0} clicks</Text>
                <Text style={styles.date}>
                  {new Date(url.created_at).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#005357',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#005357',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  urlCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  urlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  urlInfo: {
    flex: 1,
  },
  urlTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  shortUrl: {
    fontSize: 14,
    color: '#005357',
  },
  originalUrl: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  urlFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clicks: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
