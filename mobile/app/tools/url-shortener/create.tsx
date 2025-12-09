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
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, LinkSquare02Icon, Copy01Icon } from '@hugeicons/core-free-icons';
import { createShortURL } from '@/lib/api/tools';

export default function URLShortenerScreen() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleShorten = async () => {
    if (!url) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const data = await createShortURL({
        original_url: url,
        title: title || undefined,
        short_code: shortCode || undefined,
        password: password || undefined,
        expires_at: expiresAt || undefined,
      });
      setResult(data);
      Alert.alert('Success', 'URL shortened successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Shortened URL copied to clipboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>URL Shortener</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <HugeiconsIcon icon={LinkSquare02Icon} size={48} color="#005357" />
        </View>

        <Text style={styles.description}>
          Create short, easy-to-share links
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL *</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/very/long/url"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="My Short Link"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Custom Short Code (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="my-custom-code"
              value={shortCode}
              onChangeText={setShortCode}
              autoCapitalize="none"
            />
            <Text style={styles.hint}>Leave empty for auto-generated code</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password Protection (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Text style={styles.hint}>Require password to access this link</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expiration Date (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD HH:MM:SS"
              value={expiresAt}
              onChangeText={setExpiresAt}
            />
            <Text style={styles.hint}>Format: 2024-12-31 23:59:59</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleShorten}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Shorten URL</Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Shortened URL</Text>
            <View style={styles.resultBox}>
              <Text style={styles.resultUrl}>{result.short_url}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(result.short_url)}>
                <HugeiconsIcon icon={Copy01Icon} size={20} color="#005357" />
              </TouchableOpacity>
            </View>
            <Text style={styles.originalUrl}>Original: {result.original_url}</Text>
            {result.title && (
              <Text style={styles.resultTitle}>{result.title}</Text>
            )}
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
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
  resultLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  resultUrl: {
    fontSize: 16,
    color: '#005357',
    fontWeight: '500',
    flex: 1,
  },
  originalUrl: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
});
