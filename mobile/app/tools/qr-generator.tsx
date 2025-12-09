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
} from 'react-native';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, QrCodeIcon, Download01Icon } from '@hugeicons/core-free-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { generateQRCode } from '@/lib/api/tools';

export default function QRGeneratorScreen() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [size, setSize] = useState('300');
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!content) {
      Alert.alert('Error', 'Please enter content for the QR code');
      return;
    }

    setLoading(true);
    try {
      const blob = await generateQRCode({
        content,
        size: parseInt(size) || 300,
      });

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setQrImage(base64);
      };
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!qrImage) return;

    try {
      const filename = FileSystem.documentDirectory + 'qrcode.png';
      await FileSystem.writeAsStringAsync(filename, qrImage.split(',')[1], {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filename);
      } else {
        Alert.alert('Success', 'QR code saved');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save QR code');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Generator</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <HugeiconsIcon icon={QrCodeIcon} size={48} color="#005357" />
        </View>

        <Text style={styles.description}>
          Generate QR codes for URLs, text, and more
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter URL or text"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Size (px)</Text>
            <TextInput
              style={styles.input}
              placeholder="300"
              value={size}
              onChangeText={setSize}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Generate QR Code</Text>
            )}
          </TouchableOpacity>
        </View>

        {qrImage && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Generated QR Code</Text>
            <View style={styles.qrContainer}>
              <Image
                source={{ uri: qrImage }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
              <HugeiconsIcon icon={Download01Icon} size={20} color="#005357" />
              <Text style={styles.downloadText}>Download QR Code</Text>
            </TouchableOpacity>
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
    marginBottom: 16,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  downloadText: {
    color: '#005357',
    fontSize: 14,
    fontWeight: '600',
  },
});
