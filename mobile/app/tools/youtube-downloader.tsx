import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, YoutubeIcon, Download01Icon, PlayIcon } from '@hugeicons/core-free-icons';
import { downloadYoutube } from '@/lib/api/tools';

export default function YoutubeDownloaderScreen() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);

  const handleFetch = async () => {
    if (!url) {
      Alert.alert('Error', 'Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    try {
      const data = await downloadYoutube(url);
      setVideoInfo(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to fetch video info');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadUrl: string) => {
    try {
      const supported = await Linking.canOpenURL(downloadUrl);
      if (supported) {
        await Linking.openURL(downloadUrl);
      } else {
        Alert.alert('Error', 'Cannot open download link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open download link');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>YouTube Downloader</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <HugeiconsIcon icon={YoutubeIcon} size={48} color="#005357" />
        </View>

        <Text style={styles.description}>
          Download videos from YouTube
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>YouTube URL *</Text>
            <TextInput
              style={styles.input}
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleFetch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Get Video Info</Text>
            )}
          </TouchableOpacity>
        </View>

        {videoInfo && (
          <View style={styles.resultCard}>
            {videoInfo.thumbnail && (
              <Image
                source={{ uri: videoInfo.thumbnail }}
                style={styles.thumbnail}
              />
            )}

            <Text style={styles.videoTitle}>{videoInfo.title}</Text>

            {videoInfo.uploader && (
              <Text style={styles.uploader}>by {videoInfo.uploader}</Text>
            )}

            <View style={styles.metaContainer}>
              {videoInfo.duration && (
                <View style={styles.metaItem}>
                  <HugeiconsIcon icon={PlayIcon} size={16} color="#6B7280" />
                  <Text style={styles.metaText}>{formatDuration(videoInfo.duration)}</Text>
                </View>
              )}
              {videoInfo.view_count && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaText}>{formatViews(videoInfo.view_count)}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownload(videoInfo.download_url)}
            >
              <HugeiconsIcon icon={Download01Icon} size={20} color="#fff" />
              <Text style={styles.downloadButtonText}>Download Video</Text>
            </TouchableOpacity>

            {videoInfo.formats && videoInfo.formats.length > 0 && (
              <View style={styles.formatsSection}>
                <Text style={styles.formatsTitle}>Available Formats</Text>
                {videoInfo.formats.slice(0, 5).map((format: any, index: number) => (
                  <View key={index} style={styles.formatItem}>
                    <View>
                      <Text style={styles.formatResolution}>{format.resolution}</Text>
                      <Text style={styles.formatExt}>{format.ext.toUpperCase()}</Text>
                    </View>
                    {format.filesize > 0 && (
                      <Text style={styles.formatSize}>
                        {(format.filesize / 1024 / 1024).toFixed(1)} MB
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#005357',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  uploader: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#005357',
    borderRadius: 8,
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formatsSection: {
    marginTop: 8,
  },
  formatsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12,
  },
  formatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  formatResolution: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  formatExt: {
    fontSize: 12,
    color: '#6B7280',
  },
  formatSize: {
    fontSize: 12,
    color: '#6B7280',
  },
});
